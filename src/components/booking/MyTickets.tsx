import { useState, useEffect } from 'react';
import { collection, query, where, onSnapshot, orderBy } from 'firebase/firestore';
import { db, auth, handleFirestoreError, OperationType } from '../../lib/firebase';
import { Booking } from '../../types';
import { QRCodeSVG } from 'qrcode.react';
import { motion } from 'motion/react';
import { Ticket, Calendar, MapPin, Armchair } from 'lucide-react';

export function MyTickets() {
  const [tickets, setTickets] = useState<Booking[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!auth.currentUser) return;

    const q = query(
      collection(db, 'bookings'),
      where('userId', '==', auth.currentUser.uid),
      orderBy('bookedAt', 'desc')
    );

    const unsubscribe = onSnapshot(q, (snapshot) => {
      setTickets(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }) as Booking));
      setLoading(false);
    }, (error) => {
      handleFirestoreError(error, OperationType.GET, 'bookings');
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  if (loading) {
    return (
      <div className="flex justify-center items-center py-20">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-theatrical-gold"></div>
      </div>
    );
  }

  if (tickets.length === 0) {
    return (
      <div className="text-center py-20 bg-theatrical-black/40 rounded-3xl border-2 border-dashed border-theatrical-gold/20">
        <Ticket className="mx-auto h-16 w-16 text-theatrical-gold/20 mb-4" />
        <h3 className="text-2xl font-display text-theatrical-gold mb-2">No Tickets Found</h3>
        <p className="text-theatrical-ivory/60 italic">Your spotlight awaits! Book your first show to see tickets here.</p>
      </div>
    );
  }

  return (
    <div className="space-y-12">
      <div className="space-y-2">
        <h2 className="font-display text-4xl sm:text-5xl text-theatrical-gold uppercase tracking-tighter">Your Digital Passes</h2>
        <p className="text-theatrical-ivory/60 italic">Present these QR codes at the box office for entry.</p>
      </div>

      <div className="grid md:grid-cols-2 gap-8">
        {tickets.map((ticket, index) => (
          <motion.div
            key={ticket.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1 }}
            className="bg-theatrical-ivory text-theatrical-black rounded-3xl overflow-hidden shadow-2xl flex flex-col sm:flex-row"
          >
            {/* Ticket Info Section */}
            <div className="flex-1 p-6 flex flex-col justify-between border-b sm:border-b-0 sm:border-r border-dashed border-theatrical-black/20">
              <div className="space-y-4">
                <div className="flex items-center gap-2 text-theatrical-red font-black uppercase text-[10px] tracking-widest">
                  <Ticket className="h-3 w-3" /> Electronic Pass
                </div>
                <h3 className="font-display text-2xl leading-none">{ticket.playName || 'Theatrical Performance'}</h3>
                
                <div className="space-y-2 text-sm">
                  <div className="flex items-center gap-2 text-theatrical-black/60">
                    <Calendar className="h-4 w-4" />
                    <span>{new Date(ticket.bookedAt).toLocaleDateString()} at {new Date(ticket.bookedAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                  </div>
                  <div className="flex items-center gap-2 text-theatrical-black/60">
                    <MapPin className="h-4 w-4" />
                    <span>Namma Mela Theater Main Stage</span>
                  </div>
                  <div className="flex items-center gap-2 font-bold">
                    <Armchair className="h-4 w-4" />
                    <span className="uppercase tracking-widest">Seat {ticket.seatId} (Row {ticket.row})</span>
                  </div>
                </div>
              </div>

              <div className="mt-8 pt-4 border-t border-theatrical-black/10 flex justify-between items-center">
                <span className="text-[10px] uppercase font-black tracking-widest text-theatrical-black/40">Ticket ID: {ticket.id.slice(0, 8).toUpperCase()}</span>
                <span className="text-theatrical-red font-display text-lg font-bold">PAID</span>
              </div>
            </div>

            {/* QR Code Section */}
            <div className="bg-white p-6 flex flex-col items-center justify-center gap-4 min-w-[200px]">
              <div className="p-2 border-2 border-theatrical-black/5 rounded-xl">
                <QRCodeSVG 
                  value={`NammaMela:${ticket.userId}:${ticket.id}:${ticket.seatId}`} 
                  size={140}
                  level="H"
                />
              </div>
              <p className="text-[8px] uppercase font-black tracking-widest text-theatrical-black/40 text-center">Scan at Box Office</p>
            </div>
          </motion.div>
        ))}
      </div>
    </div>
  );
}
