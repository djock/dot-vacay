import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { ApiService } from './api.service';
import { HttpParams } from '@angular/common/http';

export interface PoiSuggestion {
  title: string;
  description: string;
  type: string;
  startDate?: string;
  endDate?: string;
  url?: string;
  latitude?: number;
  longitude?: number;
}

export interface SuggestionsResult {
  success: boolean;
  errors?: string[];
  suggestions: PoiSuggestion[];
}

@Injectable({
  providedIn: 'root'
})
export class AiSuggestionService {
  constructor(private apiService: ApiService) { }

  generateSuggestions(
    location: string, 
    startDate: Date, 
    endDate: Date, 
    tripType: string = 'vacation'
  ): Observable<SuggestionsResult> {
    // Use HttpParams instead of URLSearchParams for better compatibility
    const params = new HttpParams()
      .set('location', location)
      .set('startDate', startDate.toISOString())
      .set('endDate', endDate.toISOString())
      .set('tripType', tripType);
    
    // Use the ApiService to make the request with HttpParams
    return this.apiService.get<SuggestionsResult>('/AiSuggestion/generate', params);
  }
}



