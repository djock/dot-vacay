import { Component, OnInit, Output, EventEmitter, Input, OnChanges, SimpleChanges } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterModule, Router } from '@angular/router';
import { PointOfInterestService } from '../../services/point-of-interest.service';
import { SearchOsmService, LocationResult } from '../../services/search-osm.service';
import { EditPoiModel } from '../../models/edit-poi.model';
import { PointOfInterest } from '../../models/point-of-interest.model';
import { PointOfInterestType } from '../../enums/point-of-interest-type-enum';

@Component({
  selector: 'edit-poi-modal',
  standalone: true,
  imports: [CommonModule, RouterModule, FormsModule],
  templateUrl: './edit-poi-modal.component.html',
  styleUrls: ['./edit-poi-modal.component.css'] 
})  
export class EditPoiModal implements OnInit, OnChanges {
  poiModel: EditPoiModel = new EditPoiModel();
  validationErrors: any = {};
  isSubmitting: boolean = false;
  minDate = new Date();
  isEditMode: boolean = false;
  
  locations: LocationResult[] = [];
  searchQuery: string = '';
  showDropdown: boolean = false;
  isLoading: boolean = false;
  debounceTimer: any;

  @Input() tripId: string = '';
  @Input() selectedDate: Date | null = null;
  @Input() poiToEdit: PointOfInterest | null = null;
  
  @Output() onEditPoi = new EventEmitter<any>();
  @Output() onClose = new EventEmitter<any>();

  constructor(
    private searchOsmService: SearchOsmService,
    private pointOfInterestService: PointOfInterestService
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

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['poiToEdit'] && changes['poiToEdit'].currentValue) {
      this.isEditMode = true;
      const poi = changes['poiToEdit'].currentValue;
      this.poiModel = new EditPoiModel();
      
      // Map POI fields to form model
      this.poiModel.id = poi.id;
      this.poiModel.tripId = poi.tripId || this.tripId;
      this.poiModel.title = poi.title;
      this.poiModel.description = poi.description || '';
      this.poiModel.latitude = poi.latitude;
      this.poiModel.longitude = poi.longitude;
      this.poiModel.type = poi.type || PointOfInterestType.Accomodation;
      
      // Format dates for the form
      if (poi.startDate) {
        this.poiModel.startDate = this.formatDateForInput(new Date(poi.startDate));
      }
      if (poi.endDate) {
        this.poiModel.endDate = this.formatDateForInput(new Date(poi.endDate));
      }
      
    } else if (changes['selectedDate'] && changes['selectedDate'].currentValue) {
      // For new POI with selected date
      this.isEditMode = false;
      this.poiModel = new EditPoiModel();
      
      if (this.tripId) {
        this.poiModel.tripId = this.tripId;
      }
      
      // Set default dates based on the selected date
      const selectedDate = new Date(changes['selectedDate'].currentValue);
      
      // Set start time to current hour, rounded to nearest hour
      const startDate = new Date(selectedDate);
      const currentHour = new Date().getHours();
      startDate.setHours(currentHour, 0, 0, 0);
      this.poiModel.startDate = this.formatDateForInput(startDate);
      
      // Set end time to start time + 1 hour
      const endDate = new Date(startDate);
      endDate.setHours(startDate.getHours() + 1);
      this.poiModel.endDate = this.formatDateForInput(endDate);
    }
  }

  formatDateForInput(date: Date): string {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    const hours = String(date.getHours()).padStart(2, '0');
    const minutes = String(date.getMinutes()).padStart(2, '0');
    return `${year}-${month}-${day}T${hours}:${minutes}`;
  }

  setDefaultDates(): void {
    if (!this.poiModel.startDate && !this.selectedDate) {
      // Set current time for start date
      const now = new Date();
      this.poiModel.startDate = this.formatDateForInput(now);
      
      // Set end date to start date + 1 hour
      const endDate = new Date(now);
      endDate.setHours(endDate.getHours() + 1);
      this.poiModel.endDate = this.formatDateForInput(endDate);
    }
  }

  onStartDateChange(event: Event): void {
    const input = event.target as HTMLInputElement;
    const newStartDate = input.value;
    
    // If end date is before start date, update it
    if (this.poiModel.endDate && this.poiModel.endDate < newStartDate) {
      const startDate = new Date(newStartDate);
      const newEndDate = new Date(startDate);
      newEndDate.setDate(newEndDate.getDate() + 1);
      
      const formatDate = (date: Date): string => {
        const year = date.getFullYear();
        const month = String(date.getMonth() + 1).padStart(2, '0');
        const day = String(date.getDate()).padStart(2, '0');
        return `${year}-${month}-${day}`;
      };
      
      this.poiModel.endDate = formatDate(newEndDate);
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
      this.searchOsmService.searchPointsOfInterest(query).subscribe({
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
    this.poiModel.title = location.display_name.split(',')[0];
    this.poiModel.latitude = parseFloat(location.lat);
    this.poiModel.longitude = parseFloat(location.lon);
    this.showDropdown = false;
  }

  onSubmit(): void {
    this.validationErrors = {};
    
    // Basic validation
    if (!this.poiModel.title) {
      this.validationErrors.title = 'Location is required';
    }
    if (!this.poiModel.startDate) {
      this.validationErrors.startDate = 'Start date is required';
    }
    if (!this.poiModel.endDate) {
      this.validationErrors.endDate = 'End date is required';
    }
    
    // Check if we have any validation errors
    if (Object.keys(this.validationErrors).length > 0) {
      return;
    }
    
    this.isSubmitting = true;

    if (this.tripId) {
      this.poiModel.tripId = this.tripId;
    }

    // Use createOrUpdatePoi method to handle both create and update
    this.pointOfInterestService.createOrUpdatePoi(this.poiModel, this.isEditMode).subscribe({
      next: (result) => {
        this.isSubmitting = false;
        if (result.success) {
          this.onEditPoi.emit(result);
          // Reset form
          this.poiModel = new EditPoiModel();
          this.setDefaultDates();
        } else if (result.errors?.length) {
          this.validationErrors.general = result.errors[0];
        }
      },
      error: (error) => {
        this.isSubmitting = false;
        console.error('Failed to save point of interest', error);
        this.validationErrors.general = error.error?.errors?.[0] || 'Failed to save point of interest';
      }
    });
  }
}

