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
}