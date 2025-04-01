import { Component, Input, Output, EventEmitter } from '@angular/core';import { CommonModule } from '@angular/common';
import { PointOfInterest } from '../../models/point-of-interest.model';

@Component({  selector: 'app-trip-day',
  standalone: true,  imports: [CommonModule],
  templateUrl: './trip-day.component.html',  styleUrls: ['./trip-day.component.css']
})

export class TripDayComponent {
  @Input() currentDate: Date = new Date();  @Input() pointsOfInterest: PointOfInterest[] = [];
  @Input() tripId: string = '';  
  @Output() onAddPoi = new EventEmitter<Date>();  
  @Output() onEditPoi = new EventEmitter<PointOfInterest>();
  @Output() onDeletePoi = new EventEmitter<PointOfInterest>();

  addPointOfInterest(): void {    
    this.onAddPoi.emit(this.currentDate);
  }

  editPointOfInterest(poi: PointOfInterest): void {    
    this.onEditPoi.emit(poi);
  }

  deletePointOfInterest(poi: PointOfInterest): void {    
    if (confirm('Are you sure you want to delete this point of interest?')) {
      this.onDeletePoi.emit(poi);    }
  }
}