import { HttpErrorResponse } from '@angular/common/http';

export function readErrorMessage(error: HttpErrorResponse): string {
  const message: unknown = error.error?.message;
  if (Array.isArray(message)) {
    return message.join(', ');
  }
  return typeof message === 'string' ? message : 'Doslo je do greske, pokusaj ponovo';
}

export function toErrorMessage(error: unknown): string {
  if (error instanceof HttpErrorResponse) {
    return readErrorMessage(error);
  }
  return error instanceof Error ? error.message : 'Doslo je do greske, pokusaj ponovo';
}