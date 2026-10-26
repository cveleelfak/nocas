import { HttpErrorResponse } from '@angular/common/http';

export function readErrorMessage(error: HttpErrorResponse): string {
  const message: unknown = error.error?.message;
  if (Array.isArray(message)) {
    return message.join(', ');
  }
  return typeof message === 'string' ? message : 'Doslo je do greske, pokusaj ponovo';
}