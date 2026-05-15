import React, { useState, useEffect } from 'react';
import { collection, query, where, onSnapshot, addDoc, serverTimestamp, updateDoc, doc, increment, limit, orderBy } from 'firebase/firestore';
import { db, auth, handleFirestoreError, OperationType } from '../../lib/firebase';
import { Applause, Play, CastMember } from '../../types';
import { Heart, Send, MessageSquare, Star, Users } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

export function FanWall() {
  const [play, setPlay] = useState<Play | null>(null);
  const [cast, setCast] = useState<CastMember[]>([]);
  const [applause, setApplause] = useState<Applause[]>([]);
  const [comment, setComment] = useState('');
  const [selectedActor, setSelectedActor] = useState<string | null>(null);
  const [isSending, setIsSending] = useState(false);

  useEffect(() => {
    const q = query(collection(db, 'plays'), where('status', '==', 'Active'), limit(1));
    const unsub = onSnapshot(q, (snapshot) => {
      if (!snapshot.empty) {
        const playData = { id: snapshot.docs[0].id, ...snapshot.docs[0].data() } as Play;
        setPlay(playData);
        
        // Load Cast for tagging
        const castQ = collection(db, 'plays', snapshot.docs[0].id, 'cast');
        onSnapshot(castQ, (s) => {
          setCast(s.docs.map(d => ({ id: d.id, ...d.data() }) as CastMember));
        });

        // Load Applause
        const appQ = query(
          collection(db, 'applause'), 
          where('playId', '==', snapshot.docs[0].id),
          orderBy('createdAt', 'desc'),
          limit(50)
        );
        onSnapshot(appQ, (s) => {
          setApplause(s.docs.map(d => ({ id: d.id, ...d.data() }) as Applause));
        });
      }
    });

    return () => unsub();
  }, []);

  const sendApplause = async (e?: React.FormEvent) => {
    e?.preventDefault();
    if (!auth.currentUser || (!comment.trim() && !selectedActor) || !play) return;

    setIsSending(true);
    try {
      const payload = {
        playId: play.id,
        userId: auth.currentUser.uid,
        userName: auth.currentUser.displayName || 'Anonymous Fan',
        comment: comment.trim(),
        actorId: selectedActor || null,
        claps: 1, // Traditional one clap per comment initially
        createdAt: new Date().toISOString() // Using date string for simple sorting in this demo
      };
      
      await addDoc(collection(db, 'applause'), {
        ...payload,
        createdAt: serverTimestamp() // Overwrite with server timestamp for production accuracy
      });

      // If actor selected, increment their applause count
      if (selectedActor) {
        const actorRef = doc(db, 'plays', play.id, 'cast', selectedActor);
        await updateDoc(actorRef, {
          applauseCount: increment(1)
        });
      }

      setComment('');
      setSelectedActor(null);
    } catch (error) {
      handleFirestoreError(error, OperationType.CREATE, 'applause');
    } finally {
      setIsSending(false);
    }
  };

  const addClap = async (applauseId: string, actorId?: string) => {
    try {
      const appRef = doc(db, 'applause', applauseId);
      await updateDoc(appRef, {
        claps: increment(1)
      });

      if (actorId && play) {
        const actorRef = doc(db, 'plays', play.id, 'cast', actorId);
        await updateDoc(actorRef, {
          applauseCount: increment(1)
        });
      }
    } catch (error) {
      console.error("Clapping failed", error);
    }
  };

  if (!play) return <div className="text-center py-20 text-theatrical-ivory/40">The audience is quiet, waiting for the show...</div>;

  return (
    <div className="grid lg:grid-cols-4 gap-8">
      {/* Sidebar: Cast Cheering */}
      <aside className="lg:col-span-1 space-y-6">
        <div className="bento-card p-6">
          <div className="flex justify-between items-center mb-6">
            <h3 className="text-[10px] uppercase font-black tracking-[0.3em] text-theatrical-gold">Support Cast</h3>
            <Users className="text-theatrical-gold/40 h-4 w-4" />
          </div>
          
          <div className="space-y-3">
            {cast.map(actor => (
              <button
                key={actor.id}
                onClick={() => setSelectedActor(selectedActor === actor.id ? null : actor.id)}
                className={`w-full flex items-center justify-between p-3 rounded-xl transition-all border ${selectedActor === actor.id ? 'bg-theatrical-gold text-theatrical-black border-theatrical-gold shadow-[0_4px_15px_rgba(255,215,0,0.3)]' : 'bg-theatrical-black/40 border-theatrical-gold/10 hover:border-theatrical-gold/50'}`}
              >
                <div className="flex items-center gap-3 overflow-hidden">
                  <div className="w-8 h-8 rounded-full border border-black/20 overflow-hidden shrink-0">
                    <img src={actor.photoUrl} className="w-full h-full object-cover" alt="" />
                  </div>
                  <div className="text-left overflow-hidden">
                    <p className="text-xs font-bold leading-tight truncate">{actor.name}</p>
                    <p className={`text-[9px] uppercase tracking-tighter truncate ${selectedActor === actor.id ? 'text-black/60 font-black' : 'text-theatrical-ivory/40 font-bold'}`}>{actor.role}</p>
                  </div>
                </div>
                <div className="flex items-center gap-1 shrink-0 ml-2">
                  <Star className="h-3 w-3 fill-current" />
                  <span className="text-[10px] font-black">{actor.applauseCount}</span>
                </div>
              </button>
            ))}
          </div>
        </div>
      </aside>

      {/* Main Wall */}
      <div className="lg:col-span-3 space-y-8">
        <div className="flex flex-col sm:flex-row items-start sm:items-end justify-between border-b-2 border-theatrical-gold/20 pb-4 gap-4">
          <div className="flex items-center gap-3 sm:gap-4">
            <div className="p-2 sm:p-3 bg-theatrical-gold text-theatrical-black rounded-xl shadow-[0_0_15px_rgba(255,215,0,0.3)] shrink-0">
              <MessageSquare className="h-5 w-5 sm:h-6 sm:w-6" strokeWidth={3} />
            </div>
            <div>
              <h2 className="font-display text-3xl sm:text-5xl tracking-tighter leading-none">The Fan Wall</h2>
              <p className="text-[9px] sm:text-[10px] uppercase text-theatrical-gold font-black tracking-[0.2em] mt-1 italic">Real-time Applause from the gallery</p>
            </div>
          </div>
          <div className="text-right hidden sm:block">
            <p className="text-2xl font-display text-theatrical-gold leading-none">{applause.length}</p>
            <p className="text-[10px] uppercase text-theatrical-ivory/40 font-bold tracking-widest">Total Feeds</p>
          </div>
        </div>

        {/* Input Box */}
        {auth.currentUser ? (
          <form onSubmit={sendApplause} className="relative group">
            <div className="absolute -inset-1 bg-gradient-to-r from-theatrical-gold/40 to-theatrical-red/40 rounded-2xl blur-md opacity-20 group-focus-within:opacity-40 transition-opacity" />
            <div className="relative bg-theatrical-black border-2 border-theatrical-gold/20 p-2 rounded-2xl flex flex-col sm:flex-row gap-2 overflow-hidden shadow-2xl">
              <input
                value={comment}
                onChange={(e) => setComment(e.target.value)}
                placeholder={selectedActor ? `Dedicating a cheer to ${cast.find(a => a.id === selectedActor)?.name}...` : "Leave a message for the troupe..."}
                className="flex-1 bg-transparent border-none outline-none px-4 py-3 placeholder:text-theatrical-ivory/20 font-serif italic text-sm sm:text-base"
              />
              <button 
                type="submit"
                disabled={isSending || (!comment.trim() && !selectedActor)}
                className="bg-theatrical-gold text-theatrical-black px-6 py-3 sm:py-0 rounded-xl disabled:opacity-50 hover:bg-white transition-all shadow-lg flex items-center justify-center gap-2 group"
              >
                <span className="text-[10px] uppercase font-black tracking-widest">Send</span>
                <Send className="h-4 w-4 group-hover:scale-110 transition-transform" />
              </button>
            </div>
          </form>
        ) : (
          <div className="p-10 bento-card border-dashed text-center italic text-theatrical-ivory/40 font-serif">
            "The gallery is waiting for your voice. Sign in to contribute to the wall."
          </div>
        )}

        {/* Feed */}
        <div className="space-y-4">
          <AnimatePresence mode="popLayout">
            {applause.map((item) => (
              <motion.div
                key={item.id}
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.9 }}
                layout
                className="bento-card p-6 relative group border-theatrical-gold/5 hover:border-theatrical-gold/20"
              >
                <div className="flex justify-between items-start mb-4">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-full bg-theatrical-gold/20 border border-theatrical-gold/40 flex items-center justify-center text-xs font-black text-theatrical-gold">
                      {item.userName.charAt(0).toUpperCase()}
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <p className="font-display text-xl leading-none text-theatrical-ivory">{item.userName}</p>
                        {item.actorId && (
                          <span className="text-[9px] bg-theatrical-black text-theatrical-gold px-2 py-0.5 rounded border border-theatrical-gold/30 uppercase font-black tracking-widest">
                            {cast.find(a => a.id === item.actorId)?.name}
                          </span>
                        )}
                      </div>
                      <p className="text-[9px] text-theatrical-ivory/30 uppercase font-bold tracking-widest mt-1">
                        {item.createdAt ? new Date(item.createdAt.seconds * 1000).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : 'Just now'}
                      </p>
                    </div>
                  </div>
                </div>
                
                <p className="text-theatrical-ivory/80 text-lg font-serif italic leading-snug pl-11 mb-6">
                  "{item.comment || (item.actorId ? `Magnificent performance!` : `Great energy today!`)}"
                </p>

                <div className="flex items-center justify-between pl-11">
                  <div className="flex items-center gap-2">
                    <button 
                      onClick={() => addClap(item.id, item.actorId)}
                      className="flex items-center gap-2 px-4 py-1.5 rounded-full bg-theatrical-gold/10 hover:bg-theatrical-gold text-theatrical-gold hover:text-theatrical-black transition-all border border-theatrical-gold/30 group/btn"
                    >
                      <Heart className={`h-3 w-3 ${item.claps > 0 ? 'fill-current' : ''} group-hover/btn:scale-125 transition-transform`} />
                      <span className="text-xs font-black">{item.claps}</span>
                    </button>
                    <span className="text-[10px] text-theatrical-ivory/20 uppercase font-black tracking-[0.2em]">Hearts</span>
                  </div>
                  
                  <div className="flex -space-x-2">
                    {[...Array(Math.min(3, item.claps))].map((_, i) => (
                      <div key={i} className="w-5 h-5 rounded-full bg-theatrical-gold/20 border border-theatrical-gold flex items-center justify-center">
                        <Star className="h-2 w-2 text-theatrical-gold fill-theatrical-gold" />
                      </div>
                    ))}
                  </div>
                </div>
              </motion.div>
            ))}
          </AnimatePresence>
        </div>
      </div>
    </div>
  );
}
