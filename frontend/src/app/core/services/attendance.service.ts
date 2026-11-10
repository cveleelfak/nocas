import { HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';
import { Attendance } from '../models/party.model';

@Injectable({ providedIn: 'root' })
export class AttendanceService {
  private readonly http = inject(HttpClient);
  private readonly baseUrl = `${environment.apiUrl}/attendances`;

  getMine(): Observable<Attendance[]> {
    return this.http.get<Attendance[]>(`${this.baseUrl}/mine`);
  }

  attend(partyId: number): Observable<unknown> {
    return this.http.post(`${this.baseUrl}/${partyId}`, {});
  }

  cancel(partyId: number): Observable<void> {
    return this.http.delete<void>(`${this.baseUrl}/${partyId}`);
  }
}