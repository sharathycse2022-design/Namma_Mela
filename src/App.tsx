import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Theater, Ticket, Users, MessageSquare, LayoutDashboard, LogOut } from 'lucide-react';
import { useAppAuth } from './hooks/useAppAuth';
import { signInWithGoogle, auth } from './lib/firebase';
import { PlayDetails } from './components/play/PlayDetails';
import { SeatSelector } from './components/booking/SeatSelector';
import { FanWall } from './components/fan/FanWall';
import { AdminPanel } from './components/admin/AdminPanel';
import { MyTickets } from './components/booking/MyTickets';

export default function App() {
  const { user, profile, loading } = useAppAuth();
  const [showSplash, setShowSplash] = useState(true);
  const [activeTab, setActiveTab] = useState<'home' | 'booking' | 'fan' | 'admin' | 'tickets'>('home');

  useEffect(() => {
    const handleTabChange = (e: Event) => {
      const detail = (e as CustomEvent).detail;
      if (detail) setActiveTab(detail);
    };
    window.addEventListener('changeTab', handleTabChange);
    return () => window.removeEventListener('changeTab', handleTabChange);
  }, []);

  useEffect(() => {
    const timer = setTimeout(() => setShowSplash(false), 3000);
    return () => clearTimeout(timer);
  }, []);

  if (showSplash) {
    return (
      <div className="fixed inset-0 bg-theatrical-black flex flex-col items-center justify-center z-50 overflow-hidden">
        <motion.div 
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 1 }}
          className="text-center relative"
        >
          <div className="absolute -inset-4 bg-theatrical-gold/20 blur-3xl rounded-full" />
          <h1 className="font-display text-5xl sm:text-7xl md:text-9xl text-theatrical-gold gold-text-glow leading-none mb-4 px-4 text-center">
            ನಮ್ಮ ಮೇಳ
          </h1>
          <h2 className="font-display text-lg sm:text-2xl md:text-4xl text-theatrical-ivory tracking-[0.3em] uppercase">
            Namma Mela
          </h2>
          <p className="mt-8 italic text-theatrical-gold/80 font-serif">
            "Every village has a story. Book your front row."
          </p>
        </motion.div>
        
        {/* Animated Curtains */}
        <motion.div 
          animate={{ x: "-100%" }}
          transition={{ delay: 2.5, duration: 1, ease: "easeInOut" }}
          className="fixed top-0 left-0 w-1/2 h-full curtain-gradient curtain-left border-r border-theatrical-gold z-[60]"
        />
        <motion.div 
          animate={{ x: "100%" }}
          transition={{ delay: 2.5, duration: 1, ease: "easeInOut" }}
          className="fixed top-0 right-0 w-1/2 h-full curtain-gradient curtain-right border-l border-theatrical-gold z-[60]"
        />
      </div>
    );
  }

  if (loading) return null;

  return (
    <div className="min-h-screen bg-theatrical-black text-theatrical-ivory selection:bg-theatrical-gold selection:text-theatrical-black">
      {/* Navbar */}
      <nav className="fixed top-0 left-0 right-0 z-40 bg-theatrical-black/80 backdrop-blur-md border-b-2 border-theatrical-gold/20">
        <div className="max-w-7xl mx-auto px-4 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2 cursor-pointer" onClick={() => setActiveTab('home')}>
            <Theater className="text-theatrical-gold h-8 w-8" />
            <span className="font-display text-2xl text-theatrical-gold hidden sm:block">ನಮ್ಮ ಮೇಳ</span>
          </div>

          <div className="flex items-center gap-0.5 sm:gap-6">
            <button 
              onClick={() => setActiveTab('home')}
              className={`p-1.5 sm:p-2 rounded-lg transition-colors flex flex-col items-center ${activeTab === 'home' ? 'text-theatrical-gold bg-theatrical-gold/10' : 'text-theatrical-ivory/60 hover:text-theatrical-gold'}`}
            >
              <Theater className="h-4 w-4 sm:h-5 sm:w-5" />
              <span className="text-[8px] sm:text-[10px] uppercase tracking-tighter mt-1 font-bold">Show</span>
            </button>
            <button 
              onClick={() => setActiveTab('booking')}
              className={`p-1.5 sm:p-2 rounded-lg transition-colors flex flex-col items-center ${activeTab === 'booking' ? 'text-theatrical-gold bg-theatrical-gold/10' : 'text-theatrical-ivory/60 hover:text-theatrical-gold'}`}
            >
              <Ticket className="h-4 w-4 sm:h-5 sm:w-5" />
              <span className="text-[8px] sm:text-[10px] uppercase tracking-tighter mt-1 font-bold">Booking</span>
            </button>
            {user && (
              <button 
                onClick={() => setActiveTab('tickets')}
                className={`p-1.5 sm:p-2 rounded-lg transition-colors flex flex-col items-center ${activeTab === 'tickets' ? 'text-theatrical-gold bg-theatrical-gold/10' : 'text-theatrical-ivory/60 hover:text-theatrical-gold'}`}
              >
                <div className="relative">
                  <Ticket className="h-4 w-4 sm:h-5 sm:w-5 rotate-90" />
                  <div className="absolute -top-1 -right-1 w-2 h-2 bg-theatrical-red rounded-full border border-theatrical-black animate-pulse" />
                </div>
                <span className="text-[8px] sm:text-[10px] uppercase tracking-tighter mt-1 font-bold">My Passes</span>
              </button>
            )}
            <button 
              onClick={() => setActiveTab('fan')}
              className={`p-1.5 sm:p-2 rounded-lg transition-colors flex flex-col items-center ${activeTab === 'fan' ? 'text-theatrical-gold bg-theatrical-gold/10' : 'text-theatrical-ivory/60 hover:text-theatrical-gold'}`}
            >
              <MessageSquare className="h-4 w-4 sm:h-5 sm:w-5" />
              <span className="text-[8px] sm:text-[10px] uppercase tracking-tighter mt-1 font-bold">Fans</span>
            </button>
            
            {profile?.role === 'admin' && (
              <button 
                onClick={() => setActiveTab('admin')}
                className={`p-1.5 sm:p-2 rounded-lg transition-colors flex flex-col items-center ${activeTab === 'admin' ? 'text-theatrical-gold bg-theatrical-gold/10' : 'text-theatrical-ivory/60 hover:text-theatrical-gold'}`}
              >
                <LayoutDashboard className="h-4 w-4 sm:h-5 sm:w-5" />
                <span className="text-[8px] sm:text-[10px] uppercase tracking-tighter mt-1 font-bold">Admin</span>
              </button>
            )}

            {!user ? (
              <button 
                onClick={signInWithGoogle}
                className="ml-2 sm:ml-4 px-3 sm:px-4 py-1.5 sm:py-2 bg-theatrical-gold text-theatrical-black font-black uppercase text-[10px] sm:text-sm rounded shadow-lg shadow-theatrical-gold/20 hover:scale-105 transition-transform shrink-0"
              >
                Login
              </button>
            ) : (
              <div className="flex items-center gap-2 sm:gap-3 ml-2 sm:ml-4">
                <img src={user.photoURL || ''} className="h-6 w-6 sm:h-8 sm:w-8 rounded-full border border-theatrical-gold shrink-0" alt="Profile" />
                <button onClick={() => auth.signOut()} className="text-theatrical-ivory/60 hover:text-theatrical-red transition-colors">
                  <LogOut className="h-4 w-4 sm:h-5 sm:w-5" />
                </button>
              </div>
            )}
          </div>
        </div>
      </nav>

      {/* Main Content */}
      <main className="pt-24 pb-12 px-4 max-w-7xl mx-auto relative overflow-x-hidden min-h-screen">
        <AnimatePresence mode="wait">
          <motion.div
            key={activeTab}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.4 }}
          >
            {activeTab === 'home' && <PlayDetails />}
            {activeTab === 'booking' && <SeatSelector />}
            {activeTab === 'tickets' && <MyTickets />}
            {activeTab === 'fan' && <FanWall />}
            {activeTab === 'admin' && profile?.role === 'admin' && <AdminPanel />}
          </motion.div>
        </AnimatePresence>
      </main>
    </div>
  );
}
