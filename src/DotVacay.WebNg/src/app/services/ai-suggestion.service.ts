import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { ApiService } from './api.service';
import { HttpParams } from '@angular/common/http';

export interface PoiSuggestion {
  title: string;
  description: string;
  type: string;
  startDate: string;
  endDate: string;
  url?: string;
  latitude?: number;
  longitude?: number;
}

export interface GenerateSuggestionsRequest {
  location: string;
  startDate: string;
  endDate: string;
}

@Injectable({
  providedIn: 'root'
})
export class AiSuggestionService {
  constructor(private apiService: ApiService) { }

  generateSuggestions(request: GenerateSuggestionsRequest): Observable<any> {
    // Create query parameters for the GET request
    const params = new HttpParams()
      .set('location', request.location)
      .set('startDate', request.startDate)
      .set('endDate', request.endDate);
    
    // Use GET instead of POST to match the controller
    return this.apiService.get(`/AiSuggestion/generate?${params.toString()}`);
  }
}



