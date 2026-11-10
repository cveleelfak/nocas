import { AsyncPipe } from '@angular/common';
import { Component, inject } from '@angular/core';
import { Store } from '@ngrx/store';
import { map } from 'rxjs';
import { Attendance, Party } from '../../core/models/party.model';
import { PartyCard } from '../../shared/components/party-card/party-card';
import { AttendancesActions } from '../../store/attendances/attendances.actions';
import { attendancesFeature } from '../../store/attendances/attendances.reducer';

const PARTY_DURATION_MS = 6 * 60 * 60 * 1000;

interface AttendanceStats {
  total: number;
  venues: number;
  spent: number;
}

function isUpcoming(party: Party): boolean {
  return new Date(party.startsAt).getTime() + PARTY_DURATION_MS > Date.now();
}

function byStartTime(first: Party, second: Party): number {
  return first.startsAt.localeCompare(second.startsAt);
}

function summarize(attendances: Attendance[]): AttendanceStats {
  const venueIds = new Set(attendances.map((attendance) => attendance.party.venue.id));
  const spent = attendances.reduce((sum, attendance) => sum + attendance.party.price, 0);
  return { total: attendances.length, venues: venueIds.size, spent };
}

@Component({
  selector: 'app-my-attendances',
  imports: [AsyncPipe, PartyCard],
  templateUrl: './my-attendances.html',
  styleUrl: './my-attendances.scss',
})
export class MyAttendances {
  private readonly store = inject(Store);
  private readonly parties$ = this.store
    .select(attendancesFeature.selectMyAttendances)
    .pipe(map((attendances) => attendances.map((attendance) => attendance.party)));

  protected readonly loading$ = this.store.select(attendancesFeature.selectLoading);
  protected readonly stats$ = this.store
    .select(attendancesFeature.selectMyAttendances)
    .pipe(map(summarize));
  protected readonly upcoming$ = this.parties$.pipe(
    map((parties) => parties.filter(isUpcoming).sort(byStartTime)),
  );
  protected readonly past$ = this.parties$.pipe(
    map((parties) => parties.filter((party) => !isUpcoming(party))),
  );

  constructor() {
    this.store.dispatch(AttendancesActions.loadMine());
  }

  protected cancel(partyId: number): void {
    this.store.dispatch(AttendancesActions.cancel({ partyId }));
  }
}