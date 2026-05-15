import { useState, useEffect } from 'react';
import { collection, query, where, getDocs, limit, onSnapshot } from 'firebase/firestore';
import { db } from '../../lib/firebase';
import { Play, CastMember } from '../../types';
import { Calendar, MapPin, Clock, Star, Users as UsersIcon } from 'lucide-react';
import { motion } from 'motion/react';

export function PlayDetails() {
  const [play, setPlay] = useState<Play | null>(null);
  const [cast, setCast] = useState<CastMember[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Fetch Active Play
    const q = query(collection(db, 'plays'), where('status', '==', 'Active'), limit(1));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      if (!snapshot.empty) {
        const playData = { id: snapshot.docs[0].id, ...snapshot.docs[0].data() } as Play;
        setPlay(playData);
        
        // Fetch Cast
        const castQuery = collection(db, 'plays', snapshot.docs[0].id, 'cast');
        getDocs(castQuery).then(castSnap => {
          setCast(castSnap.docs.map(doc => ({ id: doc.id, ...doc.data() }) as CastMember));
        });
      } else {
        setPlay(null);
      }
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  if (loading) return (
    <div className="flex flex-col items-center justify-center min-h-[60vh] space-y-4">
      <div className="h-12 w-12 border-4 border-theatrical-gold border-t-transparent rounded-full animate-spin" />
      <p className="font-display text-theatrical-gold uppercase">Reading the script...</p>
    </div>
  );

  if (!play) return (
    <div className="text-center py-20 bg-theatrical-red/10 rounded-3xl border-2 border-dashed border-theatrical-gold/30">
      <h2 className="font-display text-4xl text-theatrical-gold mb-4">The Stage is Dark</h2>
      <p className="text-theatrical-ivory/60">No plays are currently active. Check back soon for the next performance!</p>
    </div>
  );

  return (
    <div className="grid grid-cols-1 md:grid-cols-12 gap-4 auto-rows-auto lg:auto-rows-[minmax(100px,auto)]">
      {/* Hero Section - The Play Poster & Core Info */}
      <motion.section 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="md:col-span-12 lg:col-span-8 lg:row-span-8 bento-card-accent p-0 flex flex-col group relative"
      >
        <div className="absolute inset-0 opacity-10 pointer-events-none" style={{ backgroundImage: 'radial-gradient(#FFD700 1px, transparent 1px)', backgroundSize: '24px 24px' }}></div>
        
        <div className="relative flex-1 flex flex-col min-h-[400px] sm:min-h-[500px]">
          <div className="absolute inset-0 group-hover:scale-105 transition-transform duration-700">
            <img 
              src={play.posterUrl || 'https://images.unsplash.com/photo-1514306191717-452ec28c7814?q=80&w=2069&auto=format&fit=crop'} 
              className="w-full h-full object-cover" 
              alt={play.name} 
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black via-black/40 to-transparent" />
          </div>

          <div className="relative mt-auto p-6 md:p-10 space-y-4">
            <div className="flex gap-2 mb-4">
              <span className="bg-theatrical-black text-theatrical-gold px-3 py-1 text-[10px] font-black border border-theatrical-gold uppercase tracking-[0.2em]">Live Tonight</span>
              <span className="bg-theatrical-gold text-theatrical-black px-3 py-1 text-[10px] font-black uppercase tracking-[0.2em]">{play.genre}</span>
            </div>
            
            <h1 className="font-display text-4xl sm:text-6xl md:text-8xl text-theatrical-ivory gold-text-glow leading-none">
              {play.name}
            </h1>
            <p className="text-theatrical-ivory/90 text-base sm:text-lg max-w-xl font-serif italic mb-6 sm:mb-8">
              "{play.description}"
            </p>

            <div className="flex flex-wrap items-center gap-4 sm:gap-6 md:gap-12 pt-6 border-t border-theatrical-ivory/20">
              <div className="space-y-1">
                <p className="text-[10px] uppercase text-theatrical-gold font-black tracking-widest">Duration</p>
                <p className="text-xl sm:text-2xl font-display">{play.duration}</p>
              </div>
              <div className="space-y-1">
                <p className="text-[10px] uppercase text-theatrical-gold font-black tracking-widest">Starts In</p>
                <p className="text-xl sm:text-2xl font-display">01:42:15</p>
              </div>
              <button className="w-full sm:w-auto md:ml-auto bg-theatrical-gold text-theatrical-black px-8 py-3 font-black uppercase tracking-widest text-sm hover:bg-white transition-all transform hover:scale-105 shadow-[0_0_20px_rgba(255,215,0,0.4)]">
                Book Seats ₹150
              </button>
            </div>
          </div>
        </div>
      </motion.section>

      {/* Venue Info Card */}
      <motion.section 
        initial={{ opacity: 0, x: 20 }}
        animate={{ opacity: 1, x: 0 }}
        className="md:col-span-6 lg:col-span-4 lg:row-span-4 bento-card p-6 flex flex-col justify-between"
      >
        <div className="flex justify-between items-start">
          <div className="p-3 bg-theatrical-gold/10 rounded-xl">
            <MapPin className="text-theatrical-gold h-6 w-6" />
          </div>
          <p className="text-[10px] uppercase font-bold text-theatrical-gold tracking-[0.3em]">Location</p>
        </div>
        <div>
          <h3 className="font-display text-3xl mb-1">{play.venue}</h3>
          <p className="text-sm text-theatrical-ivory/40 uppercase tracking-widest font-bold">Grounds, Karnataka</p>
        </div>
        <div className="mt-4 pt-4 border-t border-theatrical-gold/10">
          <p className="text-[11px] italic text-theatrical-ivory/60">"Experience the grandeur of rural theater under the stars."</p>
        </div>
      </motion.section>

      {/* Schedule Info Card */}
      <motion.section 
        initial={{ opacity: 0, x: 20 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ delay: 0.1 }}
        className="md:col-span-6 lg:col-span-4 lg:row-span-4 bg-theatrical-black border-2 border-theatrical-red p-6 flex flex-col justify-between rounded-2xl"
      >
        <div className="flex justify-between items-start">
          <div className="p-3 bg-theatrical-red/20 rounded-xl">
            <Clock className="text-theatrical-gold h-6 w-6" />
          </div>
          <p className="text-[10px] uppercase font-bold text-theatrical-gold tracking-[0.3em]">Schedule</p>
        </div>
        <div className="space-y-1">
          <p className="text-4xl font-display text-theatrical-gold">
            {new Date(play.startTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
          </p>
          <p className="text-sm text-theatrical-ivory/60 uppercase font-black">{new Date(play.startTime).toLocaleDateString([], { month: 'long', day: 'numeric', year: 'numeric' })}</p>
        </div>
        <div className="flex gap-2">
          {['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'].map(d => (
            <div key={d} className={`text-[10px] font-black p-1 ${new Date(play.startTime).toLocaleDateString([], { weekday: 'short' }) === d ? 'text-theatrical-gold underline' : 'text-theatrical-ivory/20'}`}>
              {d.charAt(0)}
            </div>
          ))}
        </div>
      </motion.section>

      {/* Cast Bento Section */}
      <motion.section 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
        className="md:col-span-12 lg:col-span-5 lg:row-span-4 bg-theatrical-red/10 border-2 border-theatrical-gold/10 p-6 flex flex-col rounded-2xl"
      >
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-sm uppercase font-black tracking-[0.2em] text-theatrical-gold">Featured Troupe</h3>
          <UsersIcon className="h-4 w-4 text-theatrical-gold/40" />
        </div>
        
        <div className="flex-1 space-y-4 overflow-y-auto pr-2 scrollbar-hide">
          {cast.slice(0, 3).map(member => (
            <div key={member.id} className="flex items-center gap-4 group cursor-pointer">
              <div className="w-12 h-12 rounded-lg bg-theatrical-black border border-theatrical-gold/20 overflow-hidden grayscale group-hover:grayscale-0 transition-all">
                <img src={member.photoUrl} className="w-full h-full object-cover" alt="" />
              </div>
              <div className="flex-1">
                <p className="font-display text-lg leading-tight group-hover:text-theatrical-gold transition-colors">{member.name}</p>
                <div className="flex items-center gap-2">
                  <p className="text-[10px] text-theatrical-gold italic">{member.role}</p>
                  {member.applauseCount > 50 && <Star className="h-2 w-2 fill-theatrical-gold text-theatrical-gold" />}
                </div>
              </div>
              <div className="text-[10px] font-mono text-theatrical-ivory/40 uppercase tracking-tighter italic">#{member.role.split(' ')[0]}</div>
            </div>
          ))}
          {cast.length === 0 && <p className="text-sm text-theatrical-ivory/40 italic">Assembling the cast...</p>}
        </div>
      </motion.section>

      {/* Occupancy Card */}
      <motion.section 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
        className="md:col-span-12 lg:col-span-7 lg:row-span-4 bento-card p-6 flex flex-col justify-between"
      >
        <div className="flex justify-between items-center">
          <h3 className="text-sm uppercase font-black tracking-[0.2em] text-theatrical-gold">House Status</h3>
          <span className="text-[10px] bg-theatrical-gold text-theatrical-black px-2 py-0.5 font-bold animate-pulse">LIVE</span>
        </div>

        <div className="flex-1 flex flex-col justify-center gap-2">
          <div className="flex justify-between items-end">
            <p className="text-5xl font-display text-theatrical-gold">142<span className="text-xl text-theatrical-ivory/40 ml-1">/ 200</span></p>
            <p className="text-xs font-black text-theatrical-ivory/60 uppercase">Booked & Verified</p>
          </div>
          <div className="h-2 w-full bg-theatrical-ivory/10 rounded-full overflow-hidden">
            <motion.div 
              initial={{ width: 0 }}
              animate={{ width: "71%" }}
              className="h-full bg-theatrical-gold shadow-[0_0_15px_rgba(255,215,0,0.5)]" 
            />
          </div>
        </div>

        <div className="grid grid-cols-3 gap-2">
          {[...Array(30)].map((_, i) => (
            <div key={i} className={`h-1.5 rounded-full ${i < 21 ? 'bg-theatrical-gold' : 'bg-theatrical-ivory/10'}`} />
          ))}
        </div>
      </motion.section>
    </div>
  );
}
