import { Component, Input, OnInit, Output, EventEmitter } from '@angular/core';
import { CommonModule} from '@angular/common';
import { RouterModule } from '@angular/router';
import { TripService } from '../../services/trip.service';

@Component({
  selector: 'trip-list-item',
  templateUrl: './trip-list-item.component.html',
  imports: [CommonModule, RouterModule]
})
export class PoiListItemComponent implements OnInit {
  @Input() trip: any = null;  
  @Output() onDeleteTrip = new EventEmitter<boolean>();

  constructor(private tripService: TripService) { }

  ngOnInit(): void { }

  deleteTrip(tripId: string): void {
    if (confirm('Are you sure you want to delete this trip?')) {
      this.tripService.deleteTrip(tripId).subscribe({
        next: (result) => {
          this.onDeleteTrip.emit(result.success);
        },
        error: (error) => {
          console.error('Failed to delete trip', error);
          this.onDeleteTrip.emit(false);
        }
      });
    }
  }
}
