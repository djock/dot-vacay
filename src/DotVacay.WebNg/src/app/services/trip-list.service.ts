import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { ApiService } from './api.service';
import { TripListModel } from '../models/trip-list.model';

interface TripListsResult {
  success: boolean;
  tripLists: TripListModel[];
  errors?: string[];
}

interface TripListIdResult {
  success: boolean;
  tripListId: number;
  errors?: string[];
}

interface CreateTripListDto {
  title: string;
  tripId: number;
}

@Injectable({
  providedIn: 'root'
})
export class TripListService {
  constructor(private apiService: ApiService) { }

  getTripListsByTripId(tripId: string): Observable<TripListsResult> {
    return this.apiService.get<TripListsResult>(`/TripList/getByTrip/${tripId}`);
  }

  createTripList(data: CreateTripListDto): Observable<TripListIdResult> {
    return this.apiService.post<TripListIdResult>('/TripList/create', data);
  }

  deleteTripList(tripListId: string): Observable<any> {
    return this.apiService.delete<any>(`/TripList/delete/${tripListId}`);
  }
}
