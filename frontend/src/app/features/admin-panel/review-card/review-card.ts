import { DatePipe } from '@angular/common';
import { Component, EventEmitter, Input, Output, signal } from '@angular/core';
import { FormControl, ReactiveFormsModule, Validators } from '@angular/forms';
import { Party } from '../../../core/models/party.model';
import { genreNames, priceLabel } from '../../../core/utils/party-format';

export interface RejectEvent {
  partyId: number;
  reason: string;
}

@Component({
  selector: 'app-review-card',
  imports: [DatePipe, ReactiveFormsModule],
  templateUrl: './review-card.html',
  styleUrl: './review-card.scss',
})
export class ReviewCard {
  @Input({ required: true }) party!: Party;
  @Output() approved = new EventEmitter<number>();
  @Output() rejected = new EventEmitter<RejectEvent>();

  protected readonly rejecting = signal(false);
  protected readonly reason = new FormControl('', {
    nonNullable: true,
    validators: [Validators.required, Validators.minLength(5)],
  });

  protected get genres(): string {
    return genreNames(this.party);
  }

  protected get price(): string {
    return priceLabel(this.party);
  }

  protected startRejecting(): void {
    this.rejecting.set(true);
  }

  protected cancelRejecting(): void {
    this.rejecting.set(false);
    this.reason.reset();
  }

  protected confirmReject(): void {
    if (this.reason.invalid) {
      this.reason.markAsTouched();
      return;
    }
    this.rejected.emit({ partyId: this.party.id, reason: this.reason.value.trim() });
  }
}