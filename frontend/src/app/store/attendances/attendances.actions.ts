import { createActionGroup, emptyProps, props } from '@ngrx/store';
import { Attendance } from '../../core/models/party.model';

export const AttendancesActions = createActionGroup({
  source: 'Attendances',
  events: {
    'Load Mine': emptyProps(),
    'Load Mine Success': props<{ attendances: Attendance[] }>(),
    Attend: props<{ partyId: number }>(),
    'Attend Success': props<{ partyId: number }>(),
    Cancel: props<{ partyId: number }>(),
    'Cancel Success': props<{ partyId: number }>(),
    'Attendance Failure': props<{ error: string }>(),
  },
});