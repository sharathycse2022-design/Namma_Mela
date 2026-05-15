import { useState, useEffect } from 'react';
import { collection, addDoc, doc, updateDoc, deleteDoc, getDocs, onSnapshot, query, setDoc } from 'firebase/firestore';
import { db, handleFirestoreError, OperationType } from '../../lib/firebase';
import { Play, CastMember } from '../../types';
import { Plus, Trash2, Edit2, Play as PlayIcon, Square, Sparkles, UserPlus, Image as ImageIcon, MapPin, Users as UsersIcon } from 'lucide-react';
import { generatePlayPoster, generateCastBio } from '../../lib/gemini';

export function AdminPanel() {
  const [plays, setPlays] = useState<Play[]>([]);
  const [editingPlay, setEditingPlay] = useState<Partial<Play> | null>(null);
  const [cast, setCast] = useState<Partial<CastMember>[]>([]);
  const [isGenerating, setIsGenerating] = useState(false);

  useEffect(() => {
    const unsub = onSnapshot(collection(db, 'plays'), (snapshot) => {
      setPlays(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }) as Play));
    });
    return () => unsub();
  }, []);

  const savePlay = async () => {
    if (!editingPlay?.name || !editingPlay?.venue) return;
    try {
      setIsGenerating(true);
      let finalPosterUrl = editingPlay.posterUrl || '';
      
      // Auto-generate poster if missing
      if (!finalPosterUrl) {
        finalPosterUrl = await generatePlayPoster(editingPlay.name, editingPlay.genre || 'Drama');
      }

      // Check if data size is likely to exceed limit
      // Base64 is ~1.37x the binary size. 1MB binary is ~1.37MB base64.
      // 3MB base64 is way too much.
      if (finalPosterUrl.length > 800000) {
        console.warn("Poster too large, using fallback");
        finalPosterUrl = `https://images.unsplash.com/photo-1503095396549-807059018b4e?q=80&w=1000&auto=format&fit=crop`;
      }

      const data = {
        name: editingPlay.name || '',
        description: editingPlay.description || '',
        venue: editingPlay.venue || '',
        genre: editingPlay.genre || 'Drama',
        startTime: editingPlay.startTime || new Date().toISOString(),
        duration: editingPlay.duration || '3h',
        createdAt: new Date().toISOString(),
        status: editingPlay.status || 'Draft',
        posterUrl: finalPosterUrl,
      };
      
      let playId = editingPlay.id;
      if (playId) {
        await updateDoc(doc(db, 'plays', playId), data);
      } else {
        const docRef = await addDoc(collection(db, 'plays'), data);
        playId = docRef.id;
      }

      // Save Cast
      for (const member of cast) {
        const castData = {
          ...member,
          applauseCount: member.applauseCount || 0,
          bio: member.bio || ''
        };
        if (member.id) {
          await updateDoc(doc(db, 'plays', playId, 'cast', member.id), castData);
        } else {
          await addDoc(collection(db, 'plays', playId, 'cast'), castData);
        }
      }

      setEditingPlay(null);
      setCast([]);
      setIsGenerating(false);
    } catch (error) {
      setIsGenerating(false);
      handleFirestoreError(error, OperationType.WRITE, 'plays');
    }
  };

  const handleAISuggest = async () => {
    if (!editingPlay?.name) return;
    setIsGenerating(true);
    let poster = await generatePlayPoster(editingPlay.name, editingPlay.genre || 'Drama');
    if (poster.length > 800000) {
      console.warn("Generated poster too large, using fallback");
      poster = `https://images.unsplash.com/photo-1503095396549-807059018b4e?q=80&w=1000&auto=format&fit=crop`;
    }
    setEditingPlay(prev => ({ ...prev, posterUrl: poster }));
    setIsGenerating(false);
  };

  const generateCastDetails = async (index: number) => {
    const member = cast[index];
    if (!member.name || !member.role) return;
    setIsGenerating(true);
    const bio = await generateCastBio(member.name, member.role);
    const updated = [...cast];
    updated[index] = { ...member, bio };
    setCast(updated);
    setIsGenerating(false);
  };

  const resetAllBookings = async (playId: string) => {
    if (!confirm("Are you sure? This will wipe all bookings for this play.")) return;
    try {
      const bookingsSnap = await getDocs(collection(db, 'plays', playId, 'bookings'));
      for (const d of bookingsSnap.docs) {
        await deleteDoc(doc(db, 'plays', playId, 'bookings', d.id));
      }
      alert("Bookings reset successfully!");
    } catch (e) {
      handleFirestoreError(e, OperationType.DELETE, `plays/${playId}/bookings`);
    }
  };

  const toggleStatus = async (play: Play) => {
    const newStatus = play.status === 'Active' ? 'Ended' : 'Active';
    try {
      await updateDoc(doc(db, 'plays', play.id), { status: newStatus });
    } catch (e) { console.error(e); }
  };

  return (
    <div className="space-y-8">
      <div className="bento-card p-6 sm:p-10 flex flex-col md:flex-row justify-between items-center gap-6 bg-theatrical-red/10 border-theatrical-gold/20 relative overflow-hidden">
        <div className="absolute inset-0 opacity-10 pointer-events-none" style={{ backgroundImage: 'radial-gradient(#FFD700 1px, transparent 1px)', backgroundSize: '32px 32px' }}></div>
        <div className="relative z-10 text-center md:text-left">
          <h2 className="font-display text-3xl sm:text-5xl text-theatrical-gold gold-text-glow leading-none">Manager Dashboard</h2>
          <p className="text-sm sm:text-base text-theatrical-ivory/60 italic font-serif mt-2 tracking-wide">"Oversee the digital box office and troupe coordination."</p>
        </div>
        <button 
          onClick={() => { setEditingPlay({}); setCast([]); }}
          className="relative z-10 w-full sm:w-auto flex items-center justify-center gap-3 px-8 py-4 bg-theatrical-gold text-theatrical-black font-black uppercase text-sm tracking-[0.2em] shadow-[0_0_20px_rgba(255,215,0,0.4)] hover:bg-white hover:scale-105 transition-all"
        >
          <Plus className="h-5 w-5" strokeWidth={3} />
          Launch New Drama
        </button>
      </div>

      {editingPlay && (
        <div className="p-6 sm:p-8 bento-card-accent space-y-8 animate-in slide-in-from-bottom-4 relative">
          <div className="grid md:grid-cols-2 gap-8 sm:gap-12">
            <div className="space-y-6">
              <div className="flex items-center gap-3 border-b border-theatrical-ivory/20 pb-2">
                <Edit2 className="text-theatrical-gold h-4 w-4" />
                <h3 className="font-display text-2xl text-theatrical-ivory uppercase tracking-tighter">Show Composition</h3>
              </div>
              <div className="space-y-4">
                <div className="space-y-1">
                  <p className="text-[10px] uppercase font-black text-theatrical-gold tracking-widest pl-1">Title</p>
                  <input 
                    placeholder="Enter production title..." 
                    value={editingPlay.name || ''}
                    onChange={e => setEditingPlay({...editingPlay, name: e.target.value})}
                    className="w-full bg-black/40 border border-theatrical-ivory/10 p-4 rounded-xl outline-none focus:border-theatrical-gold font-display text-xl"
                  />
                </div>
                <div className="space-y-1">
                  <p className="text-[10px] uppercase font-black text-theatrical-gold tracking-widest pl-1">Narration</p>
                  <textarea 
                    placeholder="A brief overview of the plot..." 
                    value={editingPlay.description || ''}
                    onChange={e => setEditingPlay({...editingPlay, description: e.target.value})}
                    className="w-full bg-black/40 border border-theatrical-ivory/10 p-4 rounded-xl outline-none focus:border-theatrical-gold h-28 font-serif italic text-sm"
                  />
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                  <div className="space-y-1">
                    <p className="text-[10px] uppercase font-black text-theatrical-gold tracking-widest pl-1">Category</p>
                    <select 
                      value={editingPlay.genre || 'Drama'}
                      onChange={e => setEditingPlay({...editingPlay, genre: e.target.value as any})}
                      className="w-full bg-black/40 border border-theatrical-ivory/10 p-4 rounded-xl outline-none text-theatrical-ivory/80 uppercase text-[10px] font-black appearance-none"
                    >
                      <option value="Drama">Folk Drama</option>
                      <option value="Comedy">Comedy</option>
                      <option value="Mythological">Mythological</option>
                    </select>
                  </div>
                  <div className="space-y-1">
                    <p className="text-[10px] uppercase font-black text-theatrical-gold tracking-widest pl-1">Commencement</p>
                    <input 
                      type="datetime-local" 
                      value={editingPlay.startTime?.slice(0, 16) || ''}
                      onChange={e => setEditingPlay({...editingPlay, startTime: new Date(e.target.value).toISOString()})}
                      className="w-full bg-black/40 border border-theatrical-ivory/10 p-4 rounded-xl outline-none text-theatrical-ivory/80 font-mono text-[10px]"
                    />
                  </div>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                  <div className="space-y-1">
                    <p className="text-[10px] uppercase font-black text-theatrical-gold tracking-widest pl-1">Venue</p>
                    <input 
                      placeholder="Location..." 
                      value={editingPlay.venue || ''}
                      onChange={e => setEditingPlay({...editingPlay, venue: e.target.value})}
                      className="w-full bg-black/40 border border-theatrical-ivory/10 p-4 rounded-xl outline-none focus:border-theatrical-gold text-xs font-bold"
                    />
                  </div>
                  <div className="space-y-1">
                    <p className="text-[10px] uppercase font-black text-theatrical-gold tracking-widest pl-1">Duration</p>
                    <input 
                      placeholder="e.g. 4h 00m" 
                      value={editingPlay.duration || ''}
                      onChange={e => setEditingPlay({...editingPlay, duration: e.target.value})}
                      className="w-full bg-black/40 border border-theatrical-ivory/10 p-4 rounded-xl outline-none focus:border-theatrical-gold text-xs font-bold"
                    />
                  </div>
                </div>
              </div>
            </div>

            <div className="space-y-6">
              <div className="flex items-center gap-3 border-b border-theatrical-ivory/20 pb-2">
                <ImageIcon className="text-theatrical-gold h-4 w-4" />
                <h3 className="font-display text-2xl text-theatrical-ivory uppercase tracking-tighter">Artistic Direction</h3>
              </div>
              <div className="aspect-[3/4] rounded-2xl bg-black/40 border-2 border-theatrical-gold/20 relative overflow-hidden flex flex-col items-center justify-center group shadow-inner">
                {editingPlay.posterUrl ? (
                  <img src={editingPlay.posterUrl} className="w-full h-full object-cover transition-transform group-hover:scale-105" alt="Poster Preview" />
                ) : (
                  <div className="text-center p-8">
                    <Sparkles className="h-16 w-16 text-theatrical-gold/10 mx-auto mb-4" />
                    <p className="text-[10px] uppercase font-black tracking-widest text-theatrical-ivory/20 italic">"Waiting for digital canvas..."</p>
                  </div>
                )}
                <div className="absolute bottom-6 left-6 right-6">
                  <button 
                    onClick={handleAISuggest}
                    disabled={isGenerating || !editingPlay.name}
                    className="w-full bg-theatrical-gold text-theatrical-black p-4 rounded-xl font-black text-xs uppercase tracking-widest flex items-center justify-center gap-3 hover:bg-white transition-all shadow-2xl shadow-black disabled:opacity-50"
                  >
                    <Sparkles className="h-5 w-5" />
                    {isGenerating ? 'AI Architecting...' : 'Generate AI Art Poster'}
                  </button>
                </div>
              </div>
            </div>
          </div>

          <div className="space-y-6">
            <div className="flex items-center justify-between border-b border-theatrical-ivory/20 pb-2">
              <div className="flex items-center gap-3">
                <UsersIcon className="text-theatrical-gold h-4 w-4" />
                <h3 className="font-display text-2xl text-theatrical-ivory uppercase tracking-tighter">Troupe Registry</h3>
              </div>
              <button 
                onClick={() => setCast([...cast, {}])}
                className="bg-theatrical-gold/10 text-theatrical-gold px-4 py-2 rounded-lg border border-theatrical-gold/20 hover:bg-theatrical-gold hover:text-theatrical-black flex items-center gap-2 text-[10px] font-black uppercase tracking-widest transition-all"
              >
                <Plus className="h-3 w-3" strokeWidth={4} /> Add Performer
              </button>
            </div>
            
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
              {cast.map((member, idx) => (
                <div key={idx} className="p-4 sm:p-6 bg-black/40 border border-theatrical-gold/10 rounded-2xl space-y-4 relative group hover:border-theatrical-gold/40 transition-all">
                  <button 
                    onClick={() => setCast(cast.filter((_, i) => i !== idx))}
                    className="absolute -top-3 -right-3 bg-theatrical-red text-white w-8 h-8 rounded-full flex items-center justify-center shadow-lg opacity-0 group-hover:opacity-100 transition-opacity"
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                  <div className="space-y-1">
                     <input 
                      placeholder="Stage Name" 
                      value={member.name || ''}
                      onChange={e => {
                        const updated = [...cast];
                        updated[idx] = {...member, name: e.target.value};
                        setCast(updated);
                      }}
                      className="w-full bg-transparent border-b border-theatrical-gold/20 p-1 outline-none text-lg font-display text-theatrical-gold"
                    />
                  </div>
                  <div className="space-y-1">
                    <input 
                      placeholder="Designated Role" 
                      value={member.role || ''}
                      onChange={e => {
                        const updated = [...cast];
                        updated[idx] = {...member, role: e.target.value};
                        setCast(updated);
                      }}
                      className="w-full bg-transparent border-b border-theatrical-gold/20 p-1 outline-none text-[10px] uppercase tracking-[0.2em] text-theatrical-ivory/60 font-black italic"
                    />
                  </div>
                  <textarea 
                    placeholder="Brief background..." 
                    value={member.bio || ''}
                    onChange={e => {
                      const updated = [...cast];
                      updated[idx] = {...member, bio: e.target.value};
                      setCast(updated);
                    }}
                    className="w-full bg-black/40 border border-theatrical-gold/5 p-3 rounded-xl outline-none text-[10px] h-20 placeholder:text-theatrical-ivory/10 italic leading-relaxed"
                  />
                  <button 
                    onClick={() => generateCastDetails(idx)}
                    disabled={isGenerating || !member.name}
                    className="w-full py-2 bg-theatrical-gold/5 text-[9px] uppercase font-black tracking-[0.3em] text-theatrical-gold border border-theatrical-gold/10 hover:bg-theatrical-gold hover:text-theatrical-black transition-all flex items-center justify-center gap-2"
                  >
                    <Sparkles className="h-3 w-3" /> AI Bio Generator
                  </button>
                </div>
              ))}
            </div>
          </div>

          <div className="flex flex-col sm:flex-row gap-4 pt-8 border-t border-theatrical-ivory/10">
            <button 
              onClick={() => setEditingPlay(null)}
              className="w-full sm:w-auto px-8 py-4 bg-transparent border-2 border-theatrical-ivory/20 rounded-xl uppercase font-black text-xs tracking-[0.3em] transition-all hover:bg-theatrical-ivory/5"
            >
              Discard Changes
            </button>
            <button 
              onClick={savePlay}
              className="flex-1 py-4 bg-theatrical-gold text-theatrical-black font-black uppercase text-xs tracking-[0.3em] rounded-xl hover:bg-white transition-all shadow-[0_0_30px_rgba(255,215,0,0.3)]"
            >
              Seal Character Contracts & Save Production
            </button>
          </div>
        </div>
      )}

      {/* Plays List */}
      <div className="grid md:grid-cols-2 gap-6">
        {plays.map(play => (
          <div key={play.id} className="bento-card p-6 flex flex-col sm:flex-row gap-6 group hover:border-theatrical-gold transition-colors relative">
             <div className="absolute inset-0 opacity-10 pointer-events-none" style={{ backgroundImage: 'radial-gradient(#8B0000 1px, transparent 1px)', backgroundSize: '16px 16px' }}></div>
             
            <div className="h-64 sm:h-44 w-full sm:w-32 rounded-xl overflow-hidden border-2 border-theatrical-gold/20 shrink-0 shadow-lg relative z-10">
              <img src={play.posterUrl} className="w-full h-full object-cover transition-transform group-hover:scale-110" alt="" />
              <div className="absolute inset-0 bg-gradient-to-t from-black/80 to-transparent" />
            </div>

            <div className="flex-1 flex flex-col justify-between relative z-10">
              <div>
                <div className="flex justify-between items-start mb-2">
                  <h4 className="font-display text-2xl sm:text-3xl text-theatrical-gold gold-text-glow leading-tight">{play.name}</h4>
                  <div className={`px-2 py-1 rounded text-[8px] font-black uppercase tracking-widest ${play.status === 'Active' ? 'bg-green-500 text-black' : 'bg-red-500 text-white'}`}>
                    {play.status}
                  </div>
                </div>
                <p className="text-[10px] uppercase text-theatrical-ivory/40 font-black tracking-widest mb-4 flex items-center gap-2">
                  <MapPin className="h-3 w-3" /> {play.venue}
                </p>
                <p className="text-[10px] text-theatrical-ivory/60 italic font-serif line-clamp-2">"{play.description}"</p>
              </div>

              <div className="flex flex-col xs:flex-row gap-2 mt-6 pt-4 border-t border-theatrical-gold/10">
                <button 
                  onClick={() => toggleStatus(play)}
                  className={`flex-1 py-2.5 rounded-lg flex items-center justify-center gap-2 text-[10px] font-black uppercase tracking-widest border-2 transition-all ${play.status === 'Active' ? 'bg-black/40 text-red-400 border-red-500/20 hover:bg-red-500 hover:text-white' : 'bg-theatrical-gold text-theatrical-black border-theatrical-gold shadow-[0_4px_15px_rgba(255,215,0,0.3)] hover:bg-white'}`}
                >
                  {play.status === 'Active' ? <Square className="h-3 w-3" /> : <PlayIcon className="h-3 w-3 fill-current" />}
                  {play.status === 'Active' ? 'Cease Show' : 'Curtains Open'}
                </button>
                <button 
                  onClick={() => resetAllBookings(play.id)}
                  className="w-full xs:w-auto px-4 py-2.5 bg-theatrical-black/40 border-2 border-theatrical-ivory/10 rounded-lg text-theatrical-ivory/20 hover:text-theatrical-red hover:border-theatrical-red/40 transition-all flex items-center justify-center"
                  title="Wipe Seat Map"
                >
                  <Trash2 className="h-4 w-4" />
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
