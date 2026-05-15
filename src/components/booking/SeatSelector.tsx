import { useState, useEffect } from 'react';
import { collection, query, where, onSnapshot, addDoc, doc, setDoc, deleteDoc } from 'firebase/firestore';
import { db, auth, handleFirestoreError, OperationType, signInWithGoogle } from '../../lib/firebase';
import { Booking, Play } from '../../types';
import { Armchair, CheckCircle2, XCircle, Info, ChevronRight, Ticket } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { QRCodeSVG } from 'qrcode.react';

export function SeatSelector() {
  const [play, setPlay] = useState<Play | null>(null);
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [selectedSeats, setSelectedSeats] = useState<string[]>([]);
  const [isConfirming, setIsConfirming] = useState(false);
  const [bookingConfirmed, setBookingConfirmed] = useState(false);

  const rows = ['A', 'B', 'C', 'D', 'E', 'F', 'G', 'H', 'I', 'J'];
  const cols = Array.from({ length: 15 }, (_, i) => i + 1);

  useEffect(() => {
    // Get active play
    const q = query(collection(db, 'plays'), where('status', '==', 'Active'));
    const unsubPlay = onSnapshot(q, (snapshot) => {
      if (!snapshot.empty) {
        setPlay({ id: snapshot.docs[0].id, ...snapshot.docs[0].data() } as Play);
      }
    });

    return () => unsubPlay();
  }, []);

  useEffect(() => {
    if (play) {
      const q = query(collection(db, 'plays', play.id, 'bookings'));
      const unsubBookings = onSnapshot(q, (snapshot) => {
        setBookings(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }) as Booking));
      });
      return () => unsubBookings();
    }
  }, [play]);

  const getSeatStatus = (row: string, col: number) => {
    const seatId = `${row}${col}`;
    if (selectedSeats.includes(seatId)) return 'selected';
    if (bookings.find(b => b.seatId === seatId)) return 'booked';
    return 'available';
  };

  const toggleSeat = (row: string, col: number) => {
    const seatId = `${row}${col}`;
    const status = getSeatStatus(row, col);
    
    if (status === 'booked') return;
    
    if (status === 'selected') {
      setSelectedSeats(prev => prev.filter(id => id !== seatId));
    } else {
      if (selectedSeats.length >= 6) return;
      setSelectedSeats(prev => [...prev, seatId]);
    }
  };

  const confirmBooking = async () => {
    if (!play || !auth.currentUser) return;
    
    try {
      for (const seatId of selectedSeats) {
        const row = seatId.slice(0, 1);
        const bookingData = {
          playId: play.id,
          playName: play.name,
          userId: auth.currentUser.uid,
          userEmail: auth.currentUser.email,
          seatId,
          row,
          bookedAt: new Date().toISOString()
        };
        // Save to play-specific collection for seat selection logic
        await setDoc(doc(db, 'plays', play.id, 'bookings', seatId), bookingData);
        // Save to root bookings collection for user's history and tickets
        await addDoc(collection(db, 'bookings'), bookingData);
      }
      setBookingConfirmed(true);
      setIsConfirming(false);
    } catch (error) {
      handleFirestoreError(error, OperationType.WRITE, `plays/${play.id}/bookings`);
    }
  };

  if (!play) return (
    <div className="text-center py-20 text-theatrical-ivory/40 italic">
      Waiting for curtains to open... No active play found.
    </div>
  );

  if (bookingConfirmed) {
    return (
      <motion.div 
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        className="max-w-md mx-auto bg-theatrical-red/10 theatrical-border p-8 rounded-2xl text-center space-y-6"
      >
        <div className="h-20 w-20 bg-theatrical-gold rounded-full flex items-center justify-center mx-auto shadow-[0_0_30px_rgba(255,215,0,0.4)]">
          <CheckCircle2 className="text-theatrical-black h-12 w-12" />
        </div>
        <div className="space-y-2">
          <h2 className="font-display text-4xl text-theatrical-gold uppercase">Ticket Confirmed!</h2>
          <p className="text-theatrical-ivory/60 font-light italic">Your front row is waiting, Namaskara!</p>
        </div>
        
        <div className="p-4 bg-theatrical-ivory rounded-xl mx-auto inline-block">
          <QRCodeSVG value={`NammaMela:${auth.currentUser?.uid}:${selectedSeats.join(',')}`} size={160} />
        </div>

        <div className="text-left bg-theatrical-black/40 p-4 rounded-lg border border-theatrical-gold/20">
          <p className="text-xs uppercase text-theatrical-gold tracking-widest font-black">Electronic Entry Pass</p>
          <div className="flex justify-between">
            <span className="text-theatrical-ivory/60">Seats:</span>
            <span className="font-display text-lg text-theatrical-gold">{selectedSeats.join(', ')}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-theatrical-ivory/60">Show:</span>
            <span className="font-medium">{play.name}</span>
          </div>
        </div>

        <div className="flex flex-col gap-3">
          <button 
            onClick={() => { setBookingConfirmed(false); setSelectedSeats([]); }}
            className="w-full py-4 bg-theatrical-gold/10 text-theatrical-gold border border-theatrical-gold/30 font-black uppercase tracking-widest rounded-xl hover:bg-theatrical-gold/20 transition-colors"
          >
            Book More
          </button>
          <button 
            onClick={() => { window.location.href = '#'; window.dispatchEvent(new CustomEvent('changeTab', { detail: 'tickets' })); }}
            className="w-full py-4 bg-theatrical-gold text-theatrical-black font-black uppercase tracking-widest rounded-xl hover:bg-theatrical-gold/90 transition-colors shadow-lg shadow-theatrical-gold/20"
          >
            View My Tickets
          </button>
        </div>
      </motion.div>
    );
  }

  return (
    <div className="grid lg:grid-cols-3 gap-8 items-start pb-24 lg:pb-0">
      <div className="lg:col-span-2 space-y-8">
        <div className="space-y-4">
          <div className="flex flex-col sm:flex-row items-baseline sm:items-center justify-between gap-2 sm:gap-4">
            <div className="space-y-1">
              <h2 className="font-display text-3xl sm:text-4xl text-theatrical-gold uppercase tracking-tighter">Select Your Seat</h2>
              <p className="text-[10px] text-theatrical-gold/40 uppercase tracking-widest font-black italic">Max 6 seats per booking</p>
            </div>
            <div className="flex flex-wrap gap-2 sm:gap-4 text-[9px] sm:text-[10px] uppercase font-bold tracking-widest bg-theatrical-black/40 px-3 py-2 rounded-lg border border-theatrical-gold/10">
              <div className="flex items-center gap-1.5"><div className="w-2.5 h-2.5 rounded-sm bg-theatrical-ivory/20" /> Available</div>
              <div className="flex items-center gap-1.5"><div className="w-2.5 h-2.5 rounded-sm bg-theatrical-red" /> Booked</div>
              <div className="flex items-center gap-1.5"><div className="w-2.5 h-2.5 rounded-sm bg-theatrical-gold shadow-[0_0_8px_rgba(255,214,0,0.6)]" /> Selected</div>
            </div>
          </div>

          <div className="relative group">
            <div className="lg:hidden absolute -top-8 right-2 text-[9px] text-theatrical-gold/60 flex items-center gap-1 animate-pulse bg-theatrical-black/80 px-2 py-1 rounded-full border border-theatrical-gold/20 backdrop-blur-sm z-20">
              <ChevronRight className="h-2.5 w-2.5" /> Slide for Gallery
            </div>
            
            <div className="p-3 sm:p-10 bento-card border-theatrical-gold/10 overflow-x-auto relative scrollbar-none sm:scrollbar-thin scrollbar-thumb-theatrical-gold/20 flex flex-col items-center">
            <div className="absolute inset-0 opacity-5 pointer-events-none" style={{ backgroundImage: 'radial-gradient(#FFD700 1px, transparent 1px)', backgroundSize: '16px 16px' }}></div>
            
            {/* The Stage */}
            <div className="w-full max-w-[600px] h-6 sm:h-12 bg-gradient-to-b from-theatrical-gold/30 to-transparent mb-8 sm:mb-20 rounded-t-[50%] relative overflow-hidden flex items-center justify-center border-t-2 border-theatrical-gold/50 shadow-[0_-15px_40px_rgba(255,215,0,0.15)]">
              <div className="absolute inset-x-0 bottom-0 h-[1px] bg-gradient-to-r from-transparent via-theatrical-gold to-transparent opacity-30" />
              <span className="text-[7px] sm:text-[12px] uppercase tracking-[0.4em] sm:tracking-[1.2em] text-theatrical-gold gold-text-glow font-black relative z-10 drop-shadow-lg">
                ನಮ್ಮ ಮೇಳ • THE STAGE
              </span>
            </div>

            <div className="flex flex-col gap-1 sm:gap-4 w-fit relative z-10 pb-4">
              {rows.map(row => (
                <div key={row} className="flex gap-1 sm:gap-3 items-center">
                  <div className="w-3 sm:w-6 text-[7px] sm:text-[10px] font-black text-theatrical-gold/40">{row}</div>
                  <div className="flex gap-1 sm:gap-2">
                    {cols.map(col => {
                      const status = getSeatStatus(row, col);
                      return (
                        <button
                          key={`${row}${col}`}
                          onClick={() => toggleSeat(row, col)}
                          className={`
                            w-4 h-4 sm:w-7 sm:h-7 rounded-[2px] sm:rounded-[4px] relative transition-all duration-300 flex items-center justify-center
                            ${status === 'available' ? 'bg-theatrical-ivory/10 hover:bg-theatrical-gold/30 hover:scale-110 border border-theatrical-ivory/5' : ''}
                            ${status === 'booked' ? 'bg-theatrical-red cursor-not-allowed' : ''}
                            ${status === 'selected' ? 'bg-theatrical-gold text-theatrical-black shadow-[0_0_12px_rgba(255,215,0,0.6)] scale-110 border-2 border-white/20' : ''}
                          `}
                        >
                          {status === 'selected' && <Armchair className="w-2 sm:w-4 h-2 sm:h-4" />}
                        </button>
                      );
                    })}
                  </div>
                </div>
              ))}
            </div>
            </div>
          </div>
        </div>

        {/* Legend / Info */}
        <div className="bento-card border-theatrical-gold/10 p-5 flex items-start gap-3">
          <div className="p-1.5 bg-theatrical-gold/10 rounded-lg">
            <Info className="text-theatrical-gold h-4 w-4" />
          </div>
          <p className="text-[11px] text-theatrical-ivory/60 italic leading-relaxed">
            All digital passes are non-transferable. Please present the QR code at the box office for scanning and physical ticket collection.
          </p>
        </div>
      </div>

      {/* Summary Sidebar / Sticky Bottom Bar */}
      <aside className="lg:sticky lg:top-24">
        {/* Mobile Sticky Bottom Bar */}
        <div className="lg:hidden fixed bottom-0 left-0 right-0 z-50 bg-theatrical-black/95 backdrop-blur-md border-t border-theatrical-gold/20 p-4 shadow-[0_-10px_30px_rgba(0,0,0,0.5)]">
          <div className="max-w-md mx-auto flex items-center justify-between gap-4">
            <div className="flex-1">
              {selectedSeats.length > 0 ? (
                <div className="flex flex-col">
                  <span className="text-[10px] text-theatrical-gold font-bold uppercase tracking-widest">{selectedSeats.length} Seats Selected</span>
                  <span className="text-lg font-display text-theatrical-gold gold-text-glow">₹{selectedSeats.length * 150}</span>
                </div>
              ) : (
                <span className="text-xs text-theatrical-ivory/40 italic">Select seats to continue</span>
              )}
            </div>
            
            {!auth.currentUser ? (
              <button 
                onClick={signInWithGoogle} 
                className="px-6 py-3 bg-theatrical-gold text-theatrical-black font-black uppercase text-xs tracking-widest rounded-lg shadow-lg"
              >
                Login
              </button>
            ) : (
              <button 
                disabled={selectedSeats.length === 0}
                onClick={() => setIsConfirming(true)}
                className={`px-8 py-3 font-black uppercase text-xs tracking-widest rounded-lg transition-all flex items-center gap-2
                  ${selectedSeats.length > 0 
                    ? 'bg-theatrical-gold text-theatrical-black shadow-[0_0_15px_rgba(255,215,0,0.3)]' 
                    : 'bg-theatrical-ivory/10 text-theatrical-ivory/20 cursor-not-allowed'}
                `}
              >
                Book <ChevronRight className="h-4 w-4" />
              </button>
            )}
          </div>
        </div>

        {/* Desktop Sidebar */}
        <div className="hidden lg:block bg-theatrical-black border-2 border-theatrical-brown p-8 space-y-6 rounded-2xl relative shadow-2xl overflow-hidden">
          <div className="absolute inset-0 opacity-5 pointer-events-none" style={{ backgroundImage: 'radial-gradient(#FFD700 1px, transparent 1px)', backgroundSize: '12px 12px' }}></div>
          
          <div className="border-b border-theatrical-gold/20 pb-4 relative z-10">
            <p className="text-[10px] uppercase text-theatrical-gold font-black tracking-[0.2em] mb-1">Booking Summary</p>
            <h3 className="font-display text-2xl gold-text-glow leading-tight">{play.name}</h3>
          </div>

          <div className="space-y-4 relative z-10">
            {selectedSeats.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-12 text-center space-y-4">
                <div className="p-4 rounded-full bg-theatrical-red/20 border border-theatrical-red/40">
                  <Info className="text-theatrical-gold/60 h-8 w-8" />
                </div>
                <p className="text-sm text-theatrical-ivory/40 italic font-serif">"Select your seats from the gallery map above."</p>
              </div>
            ) : (
              <>
                <div className="flex flex-wrap gap-2 p-3 bg-theatrical-black/40 rounded-xl border border-theatrical-gold/10">
                  {selectedSeats.map(id => (
                    <motion.div 
                      initial={{ scale: 0.8, opacity: 0 }}
                      animate={{ scale: 1, opacity: 1 }}
                      key={id} 
                      className="px-3 py-1 bg-theatrical-gold text-theatrical-black rounded-lg font-display text-lg shadow-[0_4px_10px_rgba(255,215,0,0.2)] flex items-center gap-1.5"
                    >
                      <Armchair className="h-3 w-3" />
                      {id}
                    </motion.div>
                  ))}
                </div>
                
                <div className="pt-4 border-t border-theatrical-gold/20 space-y-3">
                  <div className="flex justify-between items-center text-sm">
                    <div className="flex items-center gap-2">
                       <div className="p-1.5 bg-theatrical-gold/10 rounded-lg">
                        <Ticket className="h-3 w-3 text-theatrical-gold" />
                       </div>
                       <span className="text-theatrical-ivory/60 uppercase text-[10px] font-black tracking-widest">Base Fare</span>
                    </div>
                    <span className="font-display text-xl text-theatrical-gold">₹{selectedSeats.length * 150}</span>
                  </div>
                  <div className="flex justify-between items-center pt-2 pb-4 border-b border-theatrical-gold/5">
                    <span className="font-black uppercase text-[10px] tracking-widest text-theatrical-gold">Grand Total</span>
                    <span className="font-display text-4xl text-theatrical-gold gold-text-glow leading-none">₹{selectedSeats.length * 150}</span>
                  </div>
                </div>

                {!auth.currentUser ? (
                  <button onClick={signInWithGoogle} className="w-full py-4 bg-theatrical-gold text-theatrical-black font-black uppercase text-xs sm:text-sm tracking-widest hover:scale-105 transition-all shadow-[0_0_20px_rgba(255,215,0,0.3)]">
                    Login to Book
                  </button>
                ) : (
                  <button 
                  onClick={() => setIsConfirming(true)}
                  className="w-full group py-4 bg-theatrical-gold text-theatrical-black font-black uppercase text-xs sm:text-sm tracking-widest hover:bg-white transition-all shadow-[0_10px_40px_rgba(255,215,0,0.25)] flex items-center justify-center gap-3 active:scale-95"
                >
                  <CheckCircle2 className="h-5 w-5" />
                  Confirm Tickets
                  <ChevronRight className="h-4 w-4 group-hover:translate-x-1 transition-transform" />
                </button>
                )}
              </>
            )}
          </div>
        </div>
      </aside>

      {/* Confirmation Modal Overlay */}
      <AnimatePresence>
        {isConfirming && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsConfirming(false)}
              className="absolute inset-0 bg-theatrical-black/90 backdrop-blur-sm"
            />
            <motion.div 
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="relative w-full max-w-md bg-theatrical-black border-2 border-theatrical-gold p-8 rounded-3xl shadow-[0_20px_60px_rgba(0,0,0,0.5)]"
            >
              <h3 className="font-display text-4xl text-theatrical-gold mb-4">Confirm Booking</h3>
              <p className="text-theatrical-ivory/80 mb-8 italic">
                You are about to book {selectedSeats.length} seats for "{play.name}". Total amount ₹{selectedSeats.length * 150} will be collected at the counter.
              </p>
              
              <div className="flex gap-4">
                <button 
                  onClick={() => setIsConfirming(false)}
                  className="flex-1 py-4 border border-theatrical-ivory/20 rounded-xl font-bold uppercase transition-colors hover:bg-theatrical-ivory/5"
                >
                  Cancel
                </button>
                <button 
                  onClick={confirmBooking}
                  className="flex-1 py-4 bg-theatrical-gold text-theatrical-black font-black uppercase rounded-xl hover:bg-theatrical-gold/90 transition-colors shadow-lg shadow-theatrical-gold/20"
                >
                  Confirm
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
