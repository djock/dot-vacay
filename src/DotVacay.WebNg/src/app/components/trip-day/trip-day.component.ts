import { Component, Input, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';
import { PointOfInterest } from '../../models/point-of-interest.model';
import { PoiListItemComponent } from '../../components/poi-list-item/poi-list-item.component';

@Component({
  selector: 'trip-day',
  standalone: true,
  imports: [CommonModule, PoiListItemComponent],
  templateUrl: './trip-day.component.html',
  styleUrls: ['./trip-day.component.css']
})
export class TripDayComponent {
  @Input() currentDate: Date = new Date();
  @Input() pointsOfInterest: PointOfInterest[] = [];
  
  @Output() onAddPoi = new EventEmitter<Date>();
  @Output() onRefresh = new EventEmitter<Date>();
  @Output() onEditPoi = new EventEmitter<PointOfInterest>();

  openAddPoiModal(): void {
    this.onAddPoi.emit(this.currentDate);
  }

  refreshData(): void {
    this.onRefresh.emit(this.currentDate);
  }

  handleEditPoi(poi: PointOfInterest): void {
    this.onEditPoi.emit(poi);
  }
}
