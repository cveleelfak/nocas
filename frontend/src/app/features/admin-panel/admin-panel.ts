import { AsyncPipe } from '@angular/common';
import { Component, inject } from '@angular/core';
import { FormControl, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { Store } from '@ngrx/store';
import { ReviewDecision } from '../../core/models/party.model';
import { AdminActions } from '../../store/admin/admin.actions';
import { adminFeature } from '../../store/admin/admin.reducer';
import { RejectEvent, ReviewCard } from './review-card/review-card';

@Component({
  selector: 'app-admin-panel',
  imports: [AsyncPipe, ReactiveFormsModule, ReviewCard],
  templateUrl: './admin-panel.html',
  styleUrl: './admin-panel.scss',
})
export class AdminPanel {
  private readonly store = inject(Store);

  protected readonly partyQueue$ = this.store.select(adminFeature.selectPartyQueue);
  protected readonly venueQueue$ = this.store.select(adminFeature.selectVenueQueue);
  protected readonly genres$ = this.store.select(adminFeature.selectAllGenres);
  protected readonly activeVenueCount = this.store.selectSignal(adminFeature.selectActiveVenueCount);
  protected readonly loading = this.store.selectSignal(adminFeature.selectLoading);
  protected readonly error = this.store.selectSignal(adminFeature.selectError);

  protected readonly genreForm = new FormGroup({
    name: new FormControl('', { nonNullable: true, validators: [Validators.required] }),
  });

  constructor() {
    this.store.dispatch(AdminActions.loadDashboard());
  }

  protected approveParty(partyId: number): void {
    this.store.dispatch(AdminActions.reviewParty({ partyId, decision: { status: 'APPROVED' } }));
  }

  protected rejectParty({ partyId, reason }: RejectEvent): void {
    this.store.dispatch(
      AdminActions.reviewParty({
        partyId,
        decision: { status: 'REJECTED', rejectionReason: reason },
      }),
    );
  }

  protected reviewVenue(venueId: number, status: ReviewDecision['status']): void {
    this.store.dispatch(AdminActions.reviewVenue({ venueId, status }));
  }

  protected addGenre(): void {
    const name = this.genreForm.controls.name.value.trim();
    if (!name) {
      this.genreForm.markAllAsTouched();
      return;
    }
    this.store.dispatch(AdminActions.createGenre({ name }));
    this.genreForm.reset();
  }

  protected removeGenre(genreId: number): void {
    this.store.dispatch(AdminActions.deleteGenre({ genreId }));
  }
}