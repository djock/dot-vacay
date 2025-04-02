import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { ApiService } from './api.service';
import { TripListItemModel } from '../models/trip-list-item.model';
import { EditTripModel } from '../models/create-trip.model';
import { EditPoiModel } from '../models/edit-poi.model';

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

  createTrip(tripData: EditTripModel): Observable<TripIdResult> {
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

  deletePointOfInterest(poiId: string): Observable<RequestResult> {
    return this.apiService.delete<RequestResult>(`/PointOfInterest/delete/${poiId}`);
  }

  createOrUpdatePoi(poiModel: EditPoiModel, isNew: boolean): Observable<any> {
    if (isNew) {
      return this.apiService.post<any>('/PointOfInterest/create', poiModel);
    } else {
      return this.apiService.put<any>(`/PointOfInterest/update/${poiModel.tripId}`, poiModel);
    }
  }
}
