import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { ApiService } from './api.service';

export interface LocationResult {
  display_name: string;
  lat: string;
  lon: string;
}

@Injectable({
  providedIn: 'root'
})
export class SearchOsmService {
  constructor(private apiService: ApiService) { }

  /**
   * Search for locations using OpenStreetMap data
   * @param query The search query string
   * @returns Observable of location results
   */
  searchLocations(query: string): Observable<LocationResult[]> {
    if (!query || query.length < 2) {
      return new Observable(subscriber => {
        subscriber.next([]);
        subscriber.complete();
      });
    }

    return this.apiService.get<LocationResult[]>(`/Location/search?query=${encodeURIComponent(query)}`);
  }

  /**
   * Search for points of interest using OpenStreetMap data
   * @param query The search query string
   * @returns Observable of location results
   */
  searchPointsOfInterest(query: string): Observable<LocationResult[]> {
    if (!query || query.length < 2) {
      return new Observable(subscriber => {
        subscriber.next([]);
        subscriber.complete();
      });
    }

    return this.apiService.get<LocationResult[]>(`/Location/searchPoi?query=${encodeURIComponent(query)}`);
  }

  /**
   * Format a location result for display
   * @param location The location result
   * @returns An object with formatted name and details
   */
  formatLocationDisplay(location: LocationResult): { name: string, details: string } {
    const parts = location.display_name.split(',');
    return {
      name: parts[0],
      details: parts.slice(1, 3).join(',')
    };
  }
}
