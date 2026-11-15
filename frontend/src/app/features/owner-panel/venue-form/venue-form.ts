import { Component, EventEmitter, inject, Input, Output } from '@angular/core';
import { NonNullableFormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { VenueRequest } from '../../../core/models/party.model';

@Component({
  selector: 'app-venue-form',
  imports: [ReactiveFormsModule],
  templateUrl: './venue-form.html',
})
export class VenueForm {
  @Input() saving = false;
  @Output() submitted = new EventEmitter<VenueRequest>();

  private readonly formBuilder = inject(NonNullableFormBuilder);

  protected readonly form = this.formBuilder.group({
    name: ['', Validators.required],
    address: ['', Validators.required],
    capacity: [100, [Validators.required, Validators.min(1)]],
    description: [''],
  });

  protected submit(): void {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }
    this.submitted.emit(this.form.getRawValue());
  }
}