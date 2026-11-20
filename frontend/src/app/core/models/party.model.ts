export type ApprovalStatus = 'PENDING' | 'APPROVED' | 'REJECTED';

export interface Genre {
  id: number;
  name: string;
}

export interface Venue {
  id: number;
  name: string;
  address: string;
  latitude: number;
  longitude: number;
  capacity: number;
  description: string;
  status: ApprovalStatus;
  owner?: { id: number; name: string; email: string };
}

export interface Party {
  id: number;
  title: string;
  description: string;
  startsAt: string;
  price: number;
  performers: string;
  status: ApprovalStatus;
  rejectionReason: string | null;
  venue: Venue;
  genres: Genre[];
  attendeeCount?: number;
  createdAt?: string;
}

export interface Attendance {
  id: number;
  createdAt: string;
  party: Party;
}

export interface VenueRequest {
  name: string;
  address: string;
  capacity: number;
  description: string;
}

export interface PartyRequest {
  title: string;
  description: string;
  startsAt: string;
  price: number;
  performers: string;
  venueId: number;
  genreIds: number[];
}

export interface ReviewDecision {
  status: 'APPROVED' | 'REJECTED';
  rejectionReason?: string;
}