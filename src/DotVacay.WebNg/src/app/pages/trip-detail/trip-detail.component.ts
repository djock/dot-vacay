import { Component, OnInit, ViewChild, ElementRef, ViewChildren, QueryList } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { TripService } from '../../services/trip.service';
import { FormsModule } from '@angular/forms';
import { AppHeaderComponent } from "../../components/app-header/app-header.component";
import { EditPoiModal } from "../../components/edit-poi-modal/edit-poi-modal.component";
import { TripDayComponent } from "../../components/trip-day/trip-day.component";
import { PointOfInterest } from '../../models/point-of-interest.model';
import { AiSuggestionService, PoiSuggestion } from '../../services/ai-suggestion.service';
import { PointOfInterestService } from '../../services/point-of-interest.service';

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
  private modalInstance: any;
  selectedPoi: PointOfInterest | null = null;
  selectedDate: Date | null = null;
  
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

  @ViewChild('editPoiModal') editPoiModal!: ElementRef;

  ngOnInit(): void {
    this.route.params.subscribe(params => {
      this.tripId = params['id'];
      this.loadTripDetails();
    });
  }

  // Add this method for AI testing
  testAiSuggestions(): void {
    if (!this.trip) {
      this.aiTestError = 'Trip details not available';
      return;
    }

    this.aiTestLoading = true;
    this.aiTestSuccess = false;
    this.aiTestError = '';

    // Get the location from the trip
    const location = this.trip.title || 'Paris';
    
    // Parse dates correctly
    let startDate: Date;
    let endDate: Date;
    
    try {
      startDate = new Date(this.trip.startDate);
      endDate = new Date(this.trip.endDate);
      
      // Log the dates for debugging
      console.log('Start date:', startDate);
      console.log('End date:', endDate);
      
      // Validate dates
      if (isNaN(startDate.getTime()) || isNaN(endDate.getTime())) {
        throw new Error('Invalid date format');
      }
    } catch (error) {
      this.aiTestLoading = false;
      this.aiTestError = 'Invalid trip dates';
      console.error('Date parsing error:', error);
      return;
    }

    // Call the AI suggestion service with the correct parameter format
    const request = {
      location: location,
      startDate: startDate.toISOString(),
      endDate: endDate.toISOString()
    };

    this.aiSuggestionService.generateSuggestions(request)
      .subscribe({
        next: (result) => {
          this.aiTestLoading = false;
          if (result.success) {
            this.aiTestSuccess = true;
            console.log('AI Suggestions:', result.suggestions);
          } else {
            this.aiTestError = result.errors?.join(', ') || 'Failed to generate suggestions';
          }
        },
        error: (error) => {
          this.aiTestLoading = false;
          this.aiTestError = 'Error: ' + (error.message || JSON.stringify(error));
          console.error('AI suggestion error:', error);
        }
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
    if (this.modalInstance) {
      this.modalInstance.show();
    }
  }

  openEditPoiModal(poi: PointOfInterest): void {
    this.selectedPoi = poi;
    this.selectedDate = null; // Clear selectedDate when editing existing POI
    
    if (this.modalInstance) {
      this.modalInstance.show();
    } else {
      // Try to initialize the modal if it wasn't initialized
      if (this.editPoiModal) {
        this.modalInstance = new bootstrap.Modal(this.editPoiModal.nativeElement);
        this.modalInstance.show();
      }
    }
  }

  closeEditTripModal(): void {
    if (this.modalInstance) {
      this.modalInstance.hide();
    }
  }

  deletePointOfInterest(poi: PointOfInterest): void {
    if (confirm('Are you sure you want to delete this point of interest?')) {
      this.closeEditTripModal();
    }
  }

  onPoiSaved(success: boolean): void {
    if (success) {
      this.closeEditTripModal();
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

  // This method is called when the AI Suggestions button is clicked on a specific day
  generateDayAiSuggestions(event: {date: Date, location: string}): void {
    // Find the corresponding trip day component
    const dayComponent = this.findTripDayComponent(event.date);
    
    // Set the component to loading state
    if (dayComponent) {
      dayComponent.setGeneratingStatus(true);
    }
    
    // Create start and end date for the specific day (full day)
    const startDate = new Date(event.date);
    startDate.setHours(0, 0, 0, 0);
    
    const endDate = new Date(event.date);
    endDate.setHours(23, 59, 59, 999);
    
    console.log(`Generating AI suggestions for ${event.location} on ${startDate.toLocaleDateString()}`);
    
    // Create the request with the specific day's date
    const request = {
      location: event.location,
      startDate: startDate.toISOString(),
      endDate: endDate.toISOString()
    };
    
    // Call the AI suggestion service
    this.aiSuggestionService.generateSuggestions(request).subscribe({
      next: (result) => {
        if (result.success && result.suggestions) {
          console.log(`Received ${result.suggestions.length} AI suggestions for ${startDate.toLocaleDateString()}`);
          
          // Process each suggestion to ensure it's for the specific day
          const processedSuggestions = result.suggestions.map((suggestion: PoiSuggestion) => {
            // Ensure the suggestion's start and end dates are within the specific day
            const suggestionStartDate = new Date(suggestion.startDate);
            const suggestionEndDate = new Date(suggestion.endDate);
            
            // If the dates are outside the day's range, adjust them
            if (suggestionStartDate < startDate || suggestionStartDate > endDate) {
              suggestion.startDate = startDate.toISOString();
            }
            
            if (suggestionEndDate < startDate || suggestionEndDate > endDate) {
              suggestion.endDate = endDate.toISOString();
            }
            
            return suggestion;
          });
          
          // Save the processed suggestions
          this.saveSuggestions(processedSuggestions, this.tripId);
        } else {
          console.error('Failed to generate AI suggestions:', result.errors);
        }
        
        // Update UI
        if (dayComponent) {
          dayComponent.setGeneratingStatus(false);
        }
        
        // Refresh data to show new POIs
        this.loadTripDetails();
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

  // Helper method to save suggestions as POIs
  private saveSuggestions(suggestions: PoiSuggestion[], tripId: string): void {
    suggestions.forEach((suggestion: PoiSuggestion) => {
      // Map suggestion type string to enum value
      let poiType = 3; // Default to Attraction
      if (suggestion.type.toLowerCase().includes('accommodation')) {
        poiType = 0; // Accommodation
      } else if (suggestion.type.toLowerCase().includes('food')) {
        poiType = 1; // Food
      } else if (suggestion.type.toLowerCase().includes('car')) {
        poiType = 2; // CarRental
      }
      
      // Create the POI object with the suggestion data
      const poi = {
        tripId: tripId,
        title: suggestion.title,
        description: suggestion.description,
        type: poiType,
        startDate: suggestion.startDate,
        endDate: suggestion.endDate,
        url: suggestion.url || '',
        latitude: suggestion.latitude || 0,
        longitude: suggestion.longitude || 0
      };
      
      // Save the POI using the createOrUpdatePoi method
      this.pointOfInterestService.createOrUpdatePoi(poi, false).subscribe({
        next: (result: any) => {
          console.log('AI suggestion saved as POI:', suggestion.title);
        },
        error: (error: any) => {
          console.error('Error saving AI suggestion:', error);
        }
      });
    });
  }
}


