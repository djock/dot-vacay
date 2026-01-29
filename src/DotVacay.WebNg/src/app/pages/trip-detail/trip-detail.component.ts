import { Component, OnInit, ViewChildren, QueryList } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { TripService } from '../../services/trip.service';
import { FormsModule } from '@angular/forms';
import { EditPoiModal } from "../../components/edit-poi-modal/edit-poi-modal.component";
import { TripDayComponent } from "../../components/trip-day/trip-day.component";
import { TripListsManagerComponent } from "../../components/trip-lists-manager/trip-lists-manager.component";
import { ConfirmDialogComponent } from "../../components/confirm-dialog/confirm-dialog.component";
import { PointOfInterest } from '../../models/point-of-interest.model';
import { AiSuggestionService, PoiSuggestion } from '../../services/ai-suggestion.service';
import { PointOfInterestService } from '../../services/point-of-interest.service';

@Component({
  selector: 'trip-detail',
  standalone: true,
  imports: [
    CommonModule, 
    FormsModule, 
    RouterModule, 
    EditPoiModal,
    TripDayComponent,
    TripListsManagerComponent,
    ConfirmDialogComponent
  ],
  providers: [
    PointOfInterestService
  ],
  templateUrl: './trip-detail.component.html',
  styleUrls: ['./trip-detail.component.css']
})
export class TripDetailComponent implements OnInit {
  tripId: string = '';
  trip: any = null;
  userIsOwner: boolean = false;
  errorMessage: string = '';
  successMessage: string = '';
  loading: boolean = true;
  tripDays: Date[] = [];
  selectedPoi: PointOfInterest | null = null;
  selectedDate: Date | null = null;
  isPoiDrawerOpen: boolean = false;
  isDeleteTripConfirmOpen: boolean = false;
  
  // Add these properties for AI testing
  aiTestLoading: boolean = false;
  aiTestSuccess: boolean = false;
  aiTestError: string = '';

  @ViewChildren(TripDayComponent) tripDayComponents!: QueryList<TripDayComponent>;

  constructor(
    private route: ActivatedRoute,
    private router: Router, 
    private tripService: TripService,
    private aiSuggestionService: AiSuggestionService,
    private pointOfInterestService: PointOfInterestService
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
          this.userIsOwner = result.userIsOwner;

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
    this.selectedDate = date; // Set the selected date
    this.selectedPoi = null; // Clear selected POI when adding new
    this.isPoiDrawerOpen = true;
  }

  openEditPoiModal(poi: PointOfInterest): void {
    this.selectedPoi = poi;
    this.selectedDate = null; // Clear selectedDate when editing existing POI
    this.isPoiDrawerOpen = true;
  }

  closeEditTripModal(): void {
    this.isPoiDrawerOpen = false;
  }

  deletePointOfInterest(poi: PointOfInterest): void {
    if (confirm('Are you sure you want to delete this point of interest?')) {
      this.closeEditTripModal();
    }
  }

  onPoiSaved(result: { success?: boolean } | boolean): void {
    const isSuccess = typeof result === 'boolean' ? result : !!result?.success;
    if (isSuccess) {
      this.closeEditTripModal();
      this.loadTripDetails();
      this.successMessage = 'Point of interest saved successfully';
      setTimeout(() => this.successMessage = '', 3000);
    }
  }

  deleteTrip(): void {
    this.isDeleteTripConfirmOpen = true;
  }

  confirmDeleteTrip(): void {
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
    this.isDeleteTripConfirmOpen = false;
  }

  cancelDeleteTrip(): void {
    this.isDeleteTripConfirmOpen = false;
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

  // This method is called when the AI Suggestions button is clicked on a specific day
  generateDayAiSuggestions(event: {date: Date, location: string}): void {
    // Find the corresponding trip day component
    const dayComponent = this.findTripDayComponent(event.date);
    
    // Set the component to loading state
    if (dayComponent) {
      dayComponent.setGeneratingStatus(true);
    }

    const d = event.date; // local midnight
    const startDate = new Date(Date.UTC(d.getFullYear(), d.getMonth(), d.getDate(), 0, 0, 0, 0));
    const endDate = new Date(Date.UTC(d.getFullYear(), d.getMonth(), d.getDate(), 23, 59, 59, 999));
    
    // Create the request with the specific day's date and trip ID
    const request = {
      location: event.location,
      startDate: startDate.toISOString(),
      endDate: endDate.toISOString(),
      tripId: this.tripId
    };
    
    // Call the AI suggestion service
    this.aiSuggestionService.generateSuggestions(request).subscribe({
      next: (result) => { 
        if (result.success) {
          console.log(`Received ${result.suggestions.length} AI suggestions for ${startDate.toLocaleDateString()}`);
          // Refresh data to show new POIs
          this.loadTripDetails();
        } else {
          console.error('Failed to generate AI suggestions:', result.errors);
        }
        
        // Update UI
        if (dayComponent) {
          dayComponent.setGeneratingStatus(false);
        }
      },
      error: (error: any) => {
        console.error('Error generating AI suggestions:', error);
        if (dayComponent) {
          dayComponent.setGeneratingStatus(false);
        }
      }
    });
  }

  // Helper method to find the TripDayComponent for a specific date
  private findTripDayComponent(date: Date): TripDayComponent | undefined {
    if (!this.tripDayComponents) return undefined;
    
    return this.tripDayComponents.find(component => {
      const componentDate = new Date(component.currentDate);
      return componentDate.getFullYear() === date.getFullYear() &&
             componentDate.getMonth() === date.getMonth() &&
             componentDate.getDate() === date.getDate();
    });
  }

  // Remove the saveSuggestions method as it's no longer needed
}
