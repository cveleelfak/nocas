import { createActionGroup, emptyProps, props } from '@ngrx/store';
import { Genre, Party, ReviewDecision, Venue } from '../../core/models/party.model';

export const AdminActions = createActionGroup({
  source: 'Admin',
  events: {
    'Load Dashboard': emptyProps(),
    'Load Dashboard Success': props<{
      parties: Party[];
      venues: Venue[];
      genres: Genre[];
      activeVenueCount: number;
    }>(),
    'Review Party': props<{ partyId: number; decision: ReviewDecision }>(),
    'Review Party Success': props<{ partyId: number }>(),
    'Review Venue': props<{ venueId: number; status: ReviewDecision['status'] }>(),
    'Review Venue Success': props<{ venueId: number; status: ReviewDecision['status'] }>(),
    'Create Genre': props<{ name: string }>(),
    'Create Genre Success': props<{ genre: Genre }>(),
    'Delete Genre': props<{ genreId: number }>(),
    'Delete Genre Success': props<{ genreId: number }>(),
    'Admin Failure': props<{ error: string }>(),
  },
});