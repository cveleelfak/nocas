import { Component, inject } from '@angular/core';
import { NonNullableFormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { Store } from '@ngrx/store';
import { RegisterRequest } from '../../../core/models/user.model';
import { AuthActions } from '../../../store/auth/auth.actions';
import { authFeature } from '../../../store/auth/auth.reducer';

@Component({
  selector: 'app-register',
  imports: [ReactiveFormsModule, RouterLink],
  templateUrl: './register.html',
})
export class Register {
  private readonly store = inject(Store);
  private readonly formBuilder = inject(NonNullableFormBuilder);

  protected readonly loading = this.store.selectSignal(authFeature.selectLoading);
  protected readonly error = this.store.selectSignal(authFeature.selectError);

  protected readonly form = this.formBuilder.group({
    name: ['', Validators.required],
    email: ['', [Validators.required, Validators.email]],
    password: ['', [Validators.required, Validators.minLength(6)]],
    role: this.formBuilder.control<RegisterRequest['role']>('USER'),
  });

  protected submit(): void {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }
    this.store.dispatch(AuthActions.register({ data: this.form.getRawValue() }));
  }
}