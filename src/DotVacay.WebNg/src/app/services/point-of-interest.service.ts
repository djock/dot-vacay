import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { map, tap } from 'rxjs/operators';
import { ApiService } from './api.service';
import { PointOfInterest } from '../models/point-of-interest.model';

export interface RequestResult {
  success: boolean;
  errors?: string[];
}

@Injectable({
  providedIn: 'root'
})
export class PointOfInterestService {
  constructor(private apiService: ApiService) { }
  deletePointOfInterest(poiId: string): Observable<RequestResult> {
    return this.apiService.delete<RequestResult>(`/PointOfInterest/delete/${poiId}`);
  }

  createOrUpdatePoi(poiModel: any, isEdit: boolean): Observable<RequestResult> {
    console.log('Creating/updating POI with model:', poiModel, 'isEdit:', isEdit);
    
    if (isEdit) {
      return this.apiService.patch<any>(`/PointOfInterest/update/${poiModel.id}`, poiModel).pipe(
        tap((response: any) => console.log('Update POI response:', response)),
        map((response: any) => {
          // If response is null or undefined but status is OK, create a success result
          if (!response) {
            return { success: true } as RequestResult;
          }
          return response as RequestResult;
        })
      );
    } else {
      return this.apiService.post<any>('/PointOfInterest/create', poiModel).pipe(
        tap((response: any) => console.log('Create POI response:', response)),
        map((response: any) => {
          // If response is null or undefined but status is OK, create a success result
          if (!response) {
            return { success: true } as RequestResult;
          }
          return response as RequestResult;
        })
      );
    }
  }
}



