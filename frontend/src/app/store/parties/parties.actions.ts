import { createActionGroup, props } from '@ngrx/store';
import { Party } from '../../core/models/party.model';

export const PartiesActions = createActionGroup({
  source: 'Parties',
  events: {
    'Load Parties': props<{ date: string }>(),
    'Load Parties Success': props<{ parties: Party[] }>(),
    'Load Parties Failure': props<{ error: string }>(),
    'Select Party': props<{ partyId: number }>(),
  },
});