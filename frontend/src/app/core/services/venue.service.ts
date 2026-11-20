import { HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';
import { ReviewDecision, Venue, VenueRequest } from '../models/party.model';
import { Coordinates } from './geocoding.service';

@Injectable({ providedIn: 'root' })
export class VenueService {
  private readonly http = inject(HttpClient);
  private readonly baseUrl = `${environment.apiUrl}/venues`;

  getMine(): Observable<Venue[]> {
    return this.http.get<Venue[]>(`${this.baseUrl}/mine`);
  }

  create(request: VenueRequest & Coordinates): Observable<Venue> {
    return this.http.post<Venue>(this.baseUrl, request);
  }

  getApproved(): Observable<Venue[]> {
    return this.http.get<Venue[]>(this.baseUrl);
  }

  getPending(): Observable<Venue[]> {
    return this.http.get<Venue[]>(`${this.baseUrl}/pending`);
  }

  review(venueId: number, status: ReviewDecision['status']): Observable<Venue> {
    return this.http.patch<Venue>(`${this.baseUrl}/${venueId}/review`, { status });
  }
}