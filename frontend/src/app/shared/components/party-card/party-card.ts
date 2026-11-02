import { DatePipe } from '@angular/common';
import { Component, EventEmitter, Input, Output } from '@angular/core';
import { Party } from '../../../core/models/party.model';
import { fillLevel, fillRatio, genreNames, priceLabel } from '../../../core/utils/party-format';

@Component({
  selector: 'app-party-card',
  imports: [DatePipe],
  templateUrl: './party-card.html',
  styleUrl: './party-card.scss',
})
export class PartyCard {
  @Input({ required: true }) party!: Party;
  @Input() selected = false;
  @Output() picked = new EventEmitter<number>();

  protected get fillPercent(): number {
    return Math.round(fillRatio(this.party) * 100);
  }

  protected get level(): string {
    return fillLevel(fillRatio(this.party));
  }

  protected get subtitle(): string {
    return [this.party.venue.name, genreNames(this.party), priceLabel(this.party)].join(' · ');
  }
}