export interface Play {
  id: string;
  name: string;
  description: string;
  posterUrl: string;
  startTime: string;
  venue: string;
  genre: 'Comedy' | 'Drama' | 'Devotional' | 'Mythological';
  status: 'Active' | 'Ended' | 'Draft';
  duration: string;
  createdAt: string;
}

export interface CastMember {
  id: string;
  name: string;
  role: string;
  photoUrl: string;
  applauseCount: number;
  bio: string;
}

export interface Booking {
  id: string;
  playId: string;
  playName?: string;
  userId: string;
  userEmail: string;
  seatId: string;
  row: string;
  bookedAt: string;
}

export interface Applause {
  id: string;
  playId: string;
  actorId?: string;
  userId: string;
  userName: string;
  comment: string;
  claps: number;
  createdAt: string;
}

export interface UserProfile {
  uid: string;
  email: string;
  role: 'admin' | 'fan';
  displayName: string;
}
