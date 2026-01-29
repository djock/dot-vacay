import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { ApiService } from './api.service';

interface TripListIdResult {
  success: boolean;
  tripListId: number;
  errors?: string[];
}

interface CreateTripListItemDto {
  title: string;
  tripListId: number;
}

interface UpdateTripListItemDto {
  isChecked: boolean;
}

@Injectable({
  providedIn: 'root'
})
export class TripListItemService {
  constructor(private apiService: ApiService) { }

  createTripListItem(data: CreateTripListItemDto): Observable<TripListIdResult> {
    return this.apiService.post<TripListIdResult>('/TripListItem/create', data);
  }

  updateTripListItem(id: string, tripId: string, data: UpdateTripListItemDto): Observable<any> {
    return this.apiService.patch<any>(`/TripListItem/update/${id}/${tripId}`, data);
  }

  deleteTripListItem(id: string): Observable<any> {
    return this.apiService.delete<any>(`/TripListItem/delete/${id}`);
  }
}
