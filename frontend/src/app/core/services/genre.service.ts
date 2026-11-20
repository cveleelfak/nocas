import { HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';
import { Genre } from '../models/party.model';

@Injectable({ providedIn: 'root' })
export class GenreService {
  private readonly http = inject(HttpClient);
  private readonly baseUrl = `${environment.apiUrl}/genres`;

  getAll(): Observable<Genre[]> {
    return this.http.get<Genre[]>(this.baseUrl);
  }

  create(name: string): Observable<Genre> {
    return this.http.post<Genre>(this.baseUrl, { name });
  }

  remove(genreId: number): Observable<void> {
    return this.http.delete<void>(`${this.baseUrl}/${genreId}`);
  }
}