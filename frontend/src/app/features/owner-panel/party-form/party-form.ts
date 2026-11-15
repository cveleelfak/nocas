import {
  Component,
  EventEmitter,
  inject,
  Input,
  OnChanges,
  Output,
  SimpleChanges,
} from '@angular/core';
import { NonNullableFormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { Genre, Party, PartyRequest, Venue } from '../../../core/models/party.model';

function toLocalInputValue(isoDate: string): string {
  const date = new Date(isoDate);
  const offsetMs = date.getTimezoneOffset() * 60_000;
  return new Date(date.getTime() - offsetMs).toISOString().slice(0, 16);
}

@Component({
  selector: 'app-party-form',
  imports: [ReactiveFormsModule],
  templateUrl: './party-form.html',
})
export class PartyForm implements OnChanges {
  @Input({ required: true }) venues: Venue[] = [];
  @Input({ required: true }) genres: Genre[] = [];
  @Input() editing: Party | null = null;
  @Input() saving = false;
  @Output() submitted = new EventEmitter<PartyRequest>();
  @Output() cancelled = new EventEmitter<void>();

  private readonly formBuilder = inject(NonNullableFormBuilder);

  protected readonly form = this.formBuilder.group({
    title: ['', Validators.required],
    venueId: [0, Validators.min(1)],
    startsAt: ['', Validators.required],
    price: [0, [Validators.required, Validators.min(0)]],
    performers: [''],
    description: [''],
    genreIds: this.formBuilder.control<number[]>([], Validators.required),
  });

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['editing']) {
      this.fillForm(this.editing);
    }
    if (changes['venues'] && this.form.controls.venueId.value === 0 && this.venues.length > 0) {
      this.form.controls.venueId.setValue(this.venues[0].id);
    }
  }

  protected isGenreSelected(genreId: number): boolean {
    return this.form.controls.genreIds.value.includes(genreId);
  }

  protected toggleGenre(genreId: number): void {
    const control = this.form.controls.genreIds;
    const selected = control.value;
    control.setValue(
      selected.includes(genreId) ? selected.filter((id) => id !== genreId) : [...selected, genreId],
    );
    control.markAsTouched();
  }

  protected submit(): void {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }
    const value = this.form.getRawValue();
    this.submitted.emit({ ...value, startsAt: new Date(value.startsAt).toISOString() });
    if (!this.editing) {
      this.form.reset({ venueId: value.venueId });
    }
  }

  private fillForm(party: Party | null): void {
    if (!party) {
      this.form.controls.venueId.enable();
      this.form.reset({ venueId: this.venues[0]?.id ?? 0 });
      return;
    }
    this.form.setValue({
      title: party.title,
      venueId: party.venue.id,
      startsAt: toLocalInputValue(party.startsAt),
      price: party.price,
      performers: party.performers,
      description: party.description,
      genreIds: party.genres.map((genre) => genre.id),
    });
    this.form.controls.venueId.disable();
  }
}