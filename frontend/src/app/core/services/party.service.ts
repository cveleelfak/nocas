import { HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';
import { Party, PartyRequest } from '../models/party.model';

@Injectable({ providedIn: 'root' })
export class PartyService {
  private readonly http = inject(HttpClient);
  private readonly baseUrl = `${environment.apiUrl}/parties`;

  getForNight(date: string): Observable<Party[]> {
    return this.http.get<Party[]>(this.baseUrl, { params: { date } });
  }

    getMine(): Observable<Party[]> {
    return this.http.get<Party[]>(`${this.baseUrl}/mine`);
  }

  create(request: PartyRequest): Observable<Party> {
    return this.http.post<Party>(this.baseUrl, request);
  }

  update(partyId: number, request: PartyRequest): Observable<Party> {
    return this.http.patch<Party>(`${this.baseUrl}/${partyId}`, request);
  }

  remove(partyId: number): Observable<void> {
    return this.http.delete<void>(`${this.baseUrl}/${partyId}`);
  }
}