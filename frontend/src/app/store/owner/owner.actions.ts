import { createActionGroup, emptyProps, props } from '@ngrx/store';
import { Party, PartyRequest, Venue, VenueRequest } from '../../core/models/party.model';

export const OwnerActions = createActionGroup({
  source: 'Owner',
  events: {
    'Load Dashboard': emptyProps(),
    'Load Dashboard Success': props<{ venues: Venue[]; parties: Party[] }>(),
    'Create Venue': props<{ request: VenueRequest }>(),
    'Create Venue Success': props<{ venue: Venue }>(),
    'Save Party': props<{ partyId: number | null; request: PartyRequest }>(),
    'Save Party Success': props<{ party: Party }>(),
    'Delete Party': props<{ partyId: number }>(),
    'Delete Party Success': props<{ partyId: number }>(),
    'Owner Failure': props<{ error: string }>(),
  },
});