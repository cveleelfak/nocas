import { AsyncPipe, DatePipe } from '@angular/common';
import { Component, inject, signal } from '@angular/core';
import { Store } from '@ngrx/store';
import { BehaviorSubject, combineLatest, map } from 'rxjs';
import {
  ApprovalStatus,
  Party,
  PartyRequest,
  VenueRequest,
} from '../../core/models/party.model';
import { GenreService } from '../../core/services/genre.service';
import {
  fillRatio,
  partyStatusLabel,
  priceLabel,
  statusLabel,
} from '../../core/utils/party-format';
import { OwnerActions } from '../../store/owner/owner.actions';
import { ownerFeature } from '../../store/owner/owner.reducer';
import { PartyForm } from './party-form/party-form';
import { VenueForm } from './venue-form/venue-form';

type StatusFilter = ApprovalStatus | 'ALL';

interface OwnerStats {
  total: number;
  pending: number;
  attendees: number;
  averageFill: number;
}

const STATUS_FILTERS: { value: StatusFilter; label: string }[] = [
  { value: 'ALL', label: 'Sve' },
  { value: 'PENDING', label: 'Na cekanju' },
  { value: 'APPROVED', label: 'Odobrene' },
  { value: 'REJECTED', label: 'Odbijene' },
];

function summarize(parties: Party[]): OwnerStats {
  const approved = parties.filter((party) => party.status === 'APPROVED');
  const totals = approved.reduce(
    (sum, party) => ({
      attendees: sum.attendees + (party.attendeeCount ?? 0),
      fill: sum.fill + fillRatio(party),
    }),
    { attendees: 0, fill: 0 },
  );
  return {
    total: parties.length,
    pending: parties.filter((party) => party.status === 'PENDING').length,
    attendees: totals.attendees,
    averageFill: approved.length > 0 ? Math.round((totals.fill / approved.length) * 100) : 0,
  };
}

@Component({
  selector: 'app-owner-panel',
  imports: [AsyncPipe, DatePipe, PartyForm, VenueForm],
  templateUrl: './owner-panel.html',
  styleUrl: './owner-panel.scss',
})
export class OwnerPanel {
  private readonly store = inject(Store);
  private readonly parties$ = this.store.select(ownerFeature.selectMyParties);

  protected readonly statusFilters = STATUS_FILTERS;
  protected readonly statusFilter$ = new BehaviorSubject<StatusFilter>('ALL');
  protected readonly venues$ = this.store.select(ownerFeature.selectMyVenues);
  protected readonly approvedVenues$ = this.store.select(ownerFeature.selectApprovedVenues);
  protected readonly genres$ = inject(GenreService).getAll();
  protected readonly stats$ = this.parties$.pipe(map(summarize));
  protected readonly visibleParties$ = combineLatest([this.parties$, this.statusFilter$]).pipe(
    map(([parties, status]) =>
      status === 'ALL' ? parties : parties.filter((party) => party.status === status),
    ),
  );

  protected readonly saving = this.store.selectSignal(ownerFeature.selectSaving);
  protected readonly error = this.store.selectSignal(ownerFeature.selectError);
  protected readonly editingParty = signal<Party | null>(null);
  protected readonly showVenueForm = signal(false);

  constructor() {
    this.store.dispatch(OwnerActions.loadDashboard());
  }

  protected saveVenue(request: VenueRequest): void {
    this.store.dispatch(OwnerActions.createVenue({ request }));
    this.showVenueForm.set(false);
  }

  protected saveParty(request: PartyRequest): void {
    const partyId = this.editingParty()?.id ?? null;
    this.store.dispatch(OwnerActions.saveParty({ partyId, request }));
    this.editingParty.set(null);
  }

  protected edit(party: Party): void {
    this.editingParty.set(party);
  }

  protected cancelEdit(): void {
    this.editingParty.set(null);
  }

  protected remove(partyId: number): void {
    this.store.dispatch(OwnerActions.deleteParty({ partyId }));
  }

  protected selectStatus(status: StatusFilter): void {
    this.statusFilter$.next(status);
  }

  protected toggleVenueForm(): void {
    this.showVenueForm.update((isShown) => !isShown);
  }

  protected venueStatus(status: ApprovalStatus): string {
    return statusLabel(status);
  }

  protected partyStatus(party: Party): string {
    return partyStatusLabel(party);
  }

  protected priceOf(party: Party): string {
    return priceLabel(party);
  }
}