import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { TripService } from '../../services/trip.service';
import { FormsModule } from '@angular/forms';
import { AppHeaderComponent } from "../../components/app-header/app-header.component";
import { EditPoiModal } from "../../components/edit-poi-modal/edit-poi-modal.component";
import { TripDayComponent } from "../../components/trip-day/trip-day.component";
import { PointOfInterest } from '../../models/point-of-interest.model';

@Component({
  selector: 'app-trip-detail',
  standalone: true,
  imports: [
    CommonModule, 
    FormsModule, 
    RouterModule, 
    AppHeaderComponent,
    EditPoiModal,
    TripDayComponent
  ],
  templateUrl: './trip-detail.component.html',
  styleUrls: ['./trip-detail.component.css']
})
export class TripDetailComponent implements OnInit {
  tripId: string = '';
  trip: any = null;
  errorMessage: string = '';
  successMessage: string = '';
  loading: boolean = true;
  tripDays: Date[] = [];
  selectedDate: Date | null = null;
  selectedPoi: PointOfInterest | null = null;

  constructor(private route: ActivatedRoute,
    private router: Router, private tripService: TripService
  ) { }
  ngOnInit(): void {
    this.route.params.subscribe(params => {
      this.tripId = params['id'];
      this.loadTripDetails();
    });
  }

  loadTripDetails(): void {
    this.loading = true;
    this.tripService.getTripById(this.tripId).subscribe({
      next: (result) => {
        this.loading = false;
        if (result.success) {
          this.trip = result.trip;
          this.generateTripDays();
        } else if (result.errors?.length) {
          this.errorMessage = result.errors[0];
        }
      },
      error: (error) => {
        this.loading = false;
        console.error('Failed to load trip details', error);
        this.errorMessage = error.error?.errors?.[0] || 'Failed to load trip details';
      }
    });
  }

  generateTripDays(): void {
    this.tripDays = [];
    if (this.trip && this.trip.startDate && this.trip.endDate) {
      const startDate = new Date(this.trip.startDate);
      const endDate = new Date(this.trip.endDate);
      
      let currentDate = new Date(startDate);
      while (currentDate <= endDate) {
        this.tripDays.push(new Date(currentDate));
        currentDate.setDate(currentDate.getDate() + 1);
      }
    }
  }

  getPointsOfInterestForDay(day: Date): PointOfInterest[] {
    if (!this.trip || !this.trip.pointsOfInterest) {
      return [];
    }
    
    const dayStart = new Date(day);
    dayStart.setHours(0, 0, 0, 0);
    
    const dayEnd = new Date(day);
    dayEnd.setHours(23, 59, 59, 999);
    
    return this.trip.pointsOfInterest.filter((poi: PointOfInterest) => {
      if (!poi.startDate || !poi.endDate) {
        return false;
      }
      
      const poiStartDate = new Date(poi.startDate);
      const poiEndDate = new Date(poi.endDate);
      
      return (
        (poiStartDate >= dayStart && poiStartDate <= dayEnd) || 
        (poiEndDate >= dayStart && poiEndDate <= dayEnd) ||
        (poiStartDate <= dayStart && poiEndDate >= dayEnd)
      );
    });
  }

  openAddPoiModal(date: Date): void {
    this.selectedDate = date;
    this.selectedPoi = null;
    // Logic to open the modal will depend on your implementation
    // For example, you might set a boolean flag to show the modal
  }

  openEditPoiModal(poi: PointOfInterest): void {
    this.selectedPoi = poi;
    // Logic to open the modal will depend on your implementation
  }

  deletePointOfInterest(poi: PointOfInterest): void {
    this.tripService.deletePointOfInterest(poi.id).subscribe({
      next: (result: any) => {
        if (result.success) {
          this.successMessage = 'Point of interest deleted successfully';
          setTimeout(() => this.successMessage = '', 3000);
          this.loadTripDetails();
        } else if (result.errors?.length) {
          this.errorMessage = result.errors[0];
        }
      },
      error: (error: any) => {
        console.error('Failed to delete point of interest', error);
        this.errorMessage = error.error?.errors?.[0] || 'Failed to delete point of interest';
      }
    });
  }

  onSubmitPoiEdit(success: boolean): void {
    if (success) {
      this.loadTripDetails();
      this.successMessage = 'Point of interest saved successfully';
      setTimeout(() => this.successMessage = '', 3000);
      this.selectedPoi = null;
      this.selectedDate = null;
    }
  }

  deleteTrip(): void {
    if (confirm('Are you sure you want to delete this trip?')) {
      this.tripService.deleteTrip(this.tripId).subscribe({
        next: (result) => {
          if (result.success) {
            this.router.navigate(['/trips']);
          } else if (result.errors?.length) {
            this.errorMessage = result.errors[0];
          }
        },
        error: (error: any) => {
          console.error('Failed to delete trip', error);
          this.errorMessage = error.error?.errors?.[0] || 'Failed to delete trip';
        }
      });
    }
  }

  leaveTrip(): void {
    if (confirm('Are you sure you want to leave this trip?')) {
      this.tripService.leaveTrip(this.tripId).subscribe({
        next: (result) => {
          if (result.success) {
            this.router.navigate(['/trips']);
          } else if (result.errors?.length) {
            this.errorMessage = result.errors[0];
          }
        },
        error: (error: any) => {
          console.error('Failed to leave trip', error);
          this.errorMessage = error.error?.errors?.[0] || 'Failed to leave trip';
        }
      });
    }
  }
}
