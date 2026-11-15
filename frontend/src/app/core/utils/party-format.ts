import { ApprovalStatus, Party } from '../models/party.model';

export type FillLevel = 'low' | 'mid' | 'high';

export function fillRatio(party: Party): number {
  return Math.min((party.attendeeCount ?? 0) / party.venue.capacity, 1);
}

export function fillLevel(ratio: number): FillLevel {
  if (ratio >= 0.75) {
    return 'high';
  }
  return ratio >= 0.5 ? 'mid' : 'low';
}

export function priceLabel(party: Party): string {
  return party.price === 0 ? 'Besplatno' : `${party.price} RSD`;
}

export function genreNames(party: Party): string {
  return party.genres.map((genre) => genre.name).join(', ');
}

const STATUS_LABELS: Record<ApprovalStatus, string> = {
  PENDING: 'Na cekanju',
  APPROVED: 'Odobren',
  REJECTED: 'Odbijen',
};

export function statusLabel(status: ApprovalStatus): string {
  return STATUS_LABELS[status];
}

export function partyStatusLabel(party: Party): string {
  const isFinished = new Date(party.startsAt).getTime() < Date.now();
  return party.status === 'APPROVED' && isFinished ? 'Zavrsena' : statusLabel(party.status);
}