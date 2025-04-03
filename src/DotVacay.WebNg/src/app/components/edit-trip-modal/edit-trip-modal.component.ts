import { Component, OnInit, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterModule, Router } from '@angular/router';
import { EditTripModel } from '../../models/create-trip.model';
import { TripService } from '../../services/trip.service';
import { SearchOsmService, LocationResult } from '../../services/search-osm.service';

@Component({
  selector: 'edit-trip-modal',
  standalone: true,
  imports: [CommonModule, RouterModule, FormsModule],
  templateUrl: './edit-trip-modal.component.html',
  styleUrls: ['./edit-trip-modal.component.css']
})
export class EditTripModal implements OnInit {
  tripModel: EditTripModel = new EditTripModel();
  validationErrors: any = {};
  isSubmitting: boolean = false;
  minDate = new Date();
  
  // Location search properties
  locations: LocationResult[] = [];
  searchQuery: string = '';
  showDropdown: boolean = false;
  isLoading: boolean = false;
  debounceTimer: any;

  @Output() onEditTrip = new EventEmitter<any>();

  constructor(
    private searchOsmService: SearchOsmService,
    private tripService: TripService,
    private router: Router
  ) { }

  ngOnInit(): void {
    this.setDefaultDates();
    
    // Close dropdown when clicking outside
    document.addEventListener('click', (e: MouseEvent) => {
      const target = e.target as HTMLElement;
      const locationInput = document.getElementById('locationInput');
      const locationDropdown = document.getElementById('locationDropdown');
      
      if (locationInput && locationDropdown && 
          !locationInput.contains(target) && 
          !locationDropdown.contains(target)) {
        this.showDropdown = false;
      }
    });
  }

  setDefaultDates(): void {
    // Format current date for date input
    const formatDate = (date: Date): string => {
      const year = date.getFullYear();
      const month = String(date.getMonth() + 1).padStart(2, '0');
      const day = String(date.getDate()).padStart(2, '0');
      return `${year}-${month}-${day}`;
    };

    // Set default dates
    const now = new Date();
    this.tripModel.startDate = formatDate(now);
    
    const endDate = new Date(now);
    endDate.setDate(endDate.getDate() + 3); // Default trip length is 3 days
    this.tripModel.endDate = formatDate(endDate);
  }

  onStartDateChange(event: Event): void {
    const input = event.target as HTMLInputElement;
    const newStartDate = input.value;
    
    // If end date is before start date, update it
    if (this.tripModel.endDate && this.tripModel.endDate < newStartDate) {
      const startDate = new Date(newStartDate);
      const newEndDate = new Date(startDate);
      newEndDate.setDate(newEndDate.getDate() + 3);
      
      const formatDate = (date: Date): string => {
        const year = date.getFullYear();
        const month = String(date.getMonth() + 1).padStart(2, '0');
        const day = String(date.getDate()).padStart(2, '0');
        return `${year}-${month}-${day}`;
      };
      
      this.tripModel.endDate = formatDate(newEndDate);
    }
    
    // Automatically open the end date calendar after a short delay
    setTimeout(() => {
      const endDateInput = document.getElementById('endDate') as HTMLInputElement;
      if (endDateInput) {
        endDateInput.focus();
        endDateInput.showPicker();
      }
    }, 100);
  }

  onLocationInput(event: Event): void {
    const input = event.target as HTMLInputElement;
    const query = input.value;
    this.searchQuery = query;

    clearTimeout(this.debounceTimer);

    if (query.length < 2) {
      this.showDropdown = false;
      return;
    }

    // Show loading state
    this.showDropdown = true;
    this.isLoading = true;

    this.debounceTimer = setTimeout(() => {
      this.searchOsmService.searchLocations(query).subscribe({
        next: (data) => {
          this.locations = data;
          this.isLoading = false;
          this.showDropdown = true;
        },
        error: (error) => {
          console.error('Error fetching locations:', error);
          this.isLoading = false;
          this.locations = [];
        }
      });
    }, 300);
  }

  selectLocation(location: LocationResult): void {
    this.tripModel.title = location.display_name.split(',')[0];
    this.tripModel.latitude = parseFloat(location.lat);
    this.tripModel.longitude = parseFloat(location.lon);
    this.showDropdown = false;
  }

  onSubmit(): void {
    this.validationErrors = {};
    
    // Basic validation
    if (!this.tripModel.title) {
      this.validationErrors.title = 'Location is required';
    }
    if (!this.tripModel.startDate) {
      this.validationErrors.startDate = 'Start date is required';
    }
    if (!this.tripModel.endDate) {
      this.validationErrors.endDate = 'End date is required';
    }
    
    // Check if we have any validation errors
    if (Object.keys(this.validationErrors).length > 0) {
      return;
    }
    
    this.isSubmitting = true;
    
    this.tripService.createTrip(this.tripModel).subscribe({
      next: (result) => {
        this.isSubmitting = false;
        if (result.success) {
          this.onEditTrip.emit(result);
          // Reset form
          this.tripModel = new EditTripModel();
          this.setDefaultDates();
          // Navigate to trips list or emit event to parent
          this.router.navigate(['/trips']);
        } else if (result.errors?.length) {
          this.validationErrors.general = result.errors[0];
        }
      },
      error: (error) => {
        this.isSubmitting = false;
        console.error('Failed to create trip', error);
        this.validationErrors.general = error.error?.errors?.[0] || 'Failed to create trip';
      }
    });
  }
}
