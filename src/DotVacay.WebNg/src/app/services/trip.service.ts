import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { ApiService } from './api.service';
import { TripListItemModel } from '../models/trip-list-item.model';
import { CreateTripModel } from '../models/create-trip.model';

interface TripsListResult {
  success: boolean;
  trips: TripListItemModel[];
  errors?: string[];
}

interface TripIdResult {
  success: boolean;
  tripId: string;
  errors?: string[];
}

interface RequestResult {
  success: boolean;
  errors?: string[];
}

@Injectable({
  providedIn: 'root'
})
export class TripService {
  constructor(private apiService: ApiService) { }

  getAllTrips(): Observable<TripsListResult> {
    return this.apiService.get<TripsListResult>('/Trip/getAll');
  }

  createTrip(tripData: CreateTripModel): Observable<TripIdResult> {
    return this.apiService.post<TripIdResult>('/Trip/create', tripData);
  }

  deleteTrip(tripId: string): Observable<RequestResult> {
    return this.apiService.delete<RequestResult>(`/Trip/delete/${tripId}`);
  }

  leaveTrip(tripId: string): Observable<RequestResult> {
    return this.apiService.post<RequestResult>(`/Trip/leave/${tripId}`, {});
  }

  getTripById(tripId: string): Observable<any> {
    return this.apiService.get<any>(`/Trip/getById/${tripId}`);
  }
}
