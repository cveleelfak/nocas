import { Injectable } from '@angular/core';

export interface Coordinates {
  latitude: number;
  longitude: number;
}

interface NominatimResult {
  lat: string;
  lon: string;
}

const NOMINATIM_URL = 'https://nominatim.openstreetmap.org/search';

@Injectable({ providedIn: 'root' })
export class GeocodingService {
  async findCoordinates(address: string): Promise<Coordinates | null> {
    const params = new URLSearchParams({
      q: address,
      format: 'json',
      limit: '1',
      countrycodes: 'rs',
    });
    const response = await fetch(`${NOMINATIM_URL}?${params.toString()}`);
    if (!response.ok) {
      throw new Error('Servis za pretragu adresa trenutno nije dostupan');
    }
    const results = (await response.json()) as NominatimResult[];
    const [firstMatch] = results;
    if (!firstMatch) {
      return null;
    }
    return { latitude: Number(firstMatch.lat), longitude: Number(firstMatch.lon) };
  }
}