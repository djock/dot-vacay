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
export class PoiListItemComponent implements OnInit {
  @Input() poi!: PointOfInterest;  
  @Output() onRefresh = new EventEmitter<boolean>();
  
  // Make enum accessible in template
  PointOfInterestType = PointOfInterestType;
  
  // Convert numeric type to enum value
  get poiType(): PointOfInterestType {
    if (this.poi && typeof this.poi.type === 'number') {
      return this.poi.type as unknown as PointOfInterestType;
    }
    return PointOfInterestType.Landmark; // Default value
  }

  constructor(private tripService: TripService) { }

  ngOnInit(): void {
    // Remove the route params subscription - this is likely causing the issue
    console.log('poi in ngOnInit:', this.poi);
  }

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
    console.log('open modal edit for:', this.poi);
  }
}
