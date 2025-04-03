import { Component, Input, OnInit, Output, EventEmitter } from '@angular/core';
import { CommonModule} from '@angular/common';
import { RouterModule } from '@angular/router';
import { TripService } from '../../services/trip.service';
import { PointOfInterest } from '../../models/point-of-interest.model';
import { PointOfInterestType } from '../../enums/point-of-interest-type-enum';

@Component({
  selector: 'poi-list-item',
  templateUrl: './poi-list-item.component.html',
  standalone: true,
  imports: [CommonModule, RouterModule]
})
export class PoiListItemComponent  {
  @Input() poi!: PointOfInterest;  
  @Input() currentDate: Date = new Date(); // Add this to track the current day being displayed
  @Output() onRefresh = new EventEmitter<boolean>();
  @Output() onEditPoi = new EventEmitter<PointOfInterest>();
  
  // Make enum accessible in template
  PointOfInterestType = PointOfInterestType;
  
  // Convert numeric type to enum value
  get poiType(): PointOfInterestType {
    if (this.poi && typeof this.poi.type === 'number') {
      return this.poi.type as unknown as PointOfInterestType;
    }
    return PointOfInterestType.Landmark; // Default value
  }

  // Check if start date is in the current day
  isStartDateInCurrentDay(): boolean {
    if (!this.poi.startDate) return false;
    
    const startDate = new Date(this.poi.startDate);
    const currentDay = new Date(this.currentDate);
    
    return startDate.getFullYear() === currentDay.getFullYear() &&
           startDate.getMonth() === currentDay.getMonth() &&
           startDate.getDate() === currentDay.getDate();
  }
  
  // Check if end date is in the current day
  isEndDateInCurrentDay(): boolean {
    if (!this.poi.endDate) return false;
    
    const endDate = new Date(this.poi.endDate);
    const currentDay = new Date(this.currentDate);
    
    return endDate.getFullYear() === currentDay.getFullYear() &&
           endDate.getMonth() === currentDay.getMonth() &&
           endDate.getDate() === currentDay.getDate();
  }

  constructor(private tripService: TripService) { }

  deletePointOfInterest(): void {
    if (!this.poi) {
      console.error('Cannot delete undefined POI');
      return;
    }
    
    if (confirm('Are you sure you want to delete this point of interest?')) {
      this.tripService.deletePointOfInterest(this.poi.id).subscribe({
        next: (result) => {
          this.onRefresh.emit(true);
        },
        error: (error) => {
          console.error('Failed to delete point of interest', error);
          this.onRefresh.emit(false);
        }
      });
    }
  }

  openEditPoiModal(): void {
    // Emit an event to the parent component to open the modal with this POI
    this.onEditPoi.emit(this.poi);
  }
}
