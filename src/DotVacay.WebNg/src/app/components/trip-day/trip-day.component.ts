import { Component, Input, Output, EventEmitter, ViewChild, ElementRef, AfterViewInit, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { PointOfInterest } from '../../models/point-of-interest.model';
import { PoiListItemComponent } from '../../components/poi-list-item/poi-list-item.component';
import { ActivatedRoute } from '@angular/router';

@Component({
  selector: 'trip-day',
  standalone: true,
  imports: [CommonModule, PoiListItemComponent],
  templateUrl: './trip-day.component.html',
  styleUrls: ['./trip-day.component.css']
})
export class TripDayComponent implements OnInit  {
  @Input() currentDate: Date = new Date();
  @Input() pointsOfInterest: PointOfInterest[] = [];
  
  @Output() onAddPoi = new EventEmitter<Date>();
  @Output() onRefresh = new EventEmitter<Date>();

  constructor(private route: ActivatedRoute) { }

  ngOnInit(): void {
    console.log('pois list: ' + this.pointsOfInterest);
  }

  openAddPoiModal(): void {
    this.onAddPoi.emit();
  }

  refreshData(): void {
    this.onRefresh.emit();
  }
}
