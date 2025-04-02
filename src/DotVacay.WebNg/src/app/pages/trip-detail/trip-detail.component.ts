import { Component, OnInit, ViewChild, ElementRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { TripService } from '../../services/trip.service';
import { FormsModule } from '@angular/forms';
import { AppHeaderComponent } from "../../components/app-header/app-header.component";
import { EditPoiModal } from "../../components/edit-poi-modal/edit-poi-modal.component";
import { TripDayComponent } from "../../components/trip-day/trip-day.component";
import { PointOfInterest } from '../../models/point-of-interest.model';

declare var bootstrap: any;

@Component({
  selector: 'trip-detail',
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
  private modalInstance: any;

  constructor(private route: ActivatedRoute,
    private router: Router, private tripService: TripService
  ) { }

  @ViewChild('editPoiModal') editPoiModal!: ElementRef;


  ngOnInit(): void {
    this.route.params.subscribe(params => {
      this.tripId = params['id'];
      this.loadTripDetails();
    });
  }

  ngAfterViewInit(): void {
    if (this.editPoiModal) {
      this.modalInstance = new bootstrap.Modal(this.editPoiModal.nativeElement);
    }
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
        return false; // Skip POIs without dates
      }
      
      const poiStartDate = new Date(poi.startDate);
      const poiEndDate = new Date(poi.endDate);

      return (
        (poiStartDate >= dayStart && poiStartDate <= dayEnd) || // POI starts on this day
        (poiEndDate >= dayStart && poiEndDate <= dayEnd) ||     // POI ends on this day
        (poiStartDate <= dayStart && poiEndDate >= dayEnd)      // POI spans over this day
      );
    });
  }

  openAddPoiModal(date: Date): void {
    if (this.modalInstance) {
      this.modalInstance.show();
    }
  }

  openEditPoiModal(poi: PointOfInterest): void {
    if (this.modalInstance) {
      this.modalInstance.show();
    }
  }

  closeEditTripModal(): void {
    if (this.modalInstance) {
      this.modalInstance.hide();
    }
  }

  deletePointOfInterest(poi: PointOfInterest): void {
    if (confirm('Are you sure you want to delete this point of interest?')) {
      console.log('delete');
    }
  }

  onPoiSaved(success: boolean): void {
    if (success) {
      this.loadTripDetails();
      this.successMessage = 'Point of interest saved successfully';
      setTimeout(() => this.successMessage = '', 3000);
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

  onPoiCreated(result: any): void {
    this.successMessage = 'Trip created successfully!';
    this.loadTripDetails(); 
    this.closeEditTripModal(); 

    // Clear success message after 5 seconds
    setTimeout(() => {
      this.successMessage = '';
    }, 5000);
  }
}
