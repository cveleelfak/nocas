import { HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';
import { Party } from '../models/party.model';

@Injectable({ providedIn: 'root' })
export class PartyService {
  private readonly http = inject(HttpClient);
  private readonly baseUrl = `${environment.apiUrl}/parties`;

  getForNight(date: string): Observable<Party[]> {
    return this.http.get<Party[]>(this.baseUrl, { params: { date } });
  }
}