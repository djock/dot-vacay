import { Component, Input, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { TripListModel } from '../../models/trip-list.model';
import { TripListService } from '../../services/trip-list.service';
import { TripListComponent } from '../trip-list/trip-list.component';

@Component({
  selector: 'trip-lists-manager',
  standalone: true,
  imports: [CommonModule, FormsModule, TripListComponent],
  templateUrl: './trip-lists-manager.component.html',
  styleUrls: ['./trip-lists-manager.component.css']
})
export class TripListsManagerComponent implements OnInit {
  @Input() tripId: string = '';

  tripLists: TripListModel[] = [];
  isCreatingList: boolean = false;
  newListTitle: string = '';
  isLoading: boolean = false;
  errorMessage: string = '';

  constructor(private tripListService: TripListService) {}

  ngOnInit(): void {
    this.loadTripLists();
  }

  loadTripLists(): void {
    this.isLoading = true;
    this.errorMessage = '';

    this.tripListService.getTripListsByTripId(this.tripId).subscribe({
      next: (result) => {
        if (result.success) {
          this.tripLists = result.tripLists;
        } else {
          this.errorMessage = result.errors?.join(', ') || 'Failed to load lists';
        }
        this.isLoading = false;
      },
      error: (error) => {
        this.errorMessage = 'Error loading lists';
        this.isLoading = false;
        console.error('Error loading trip lists:', error);
      }
    });
  }

  startCreatingList(): void {
    this.isCreatingList = true;
    this.newListTitle = '';
  }

  cancelCreatingList(): void {
    this.isCreatingList = false;
    this.newListTitle = '';
  }

  createList(): void {
    if (!this.newListTitle.trim()) return;

    this.tripListService.createTripList({
      title: this.newListTitle,
      tripId: parseInt(this.tripId)
    }).subscribe({
      next: (result) => {
        if (result.success) {
          this.loadTripLists();
          this.isCreatingList = false;
          this.newListTitle = '';
        } else {
          this.errorMessage = result.errors?.join(', ') || 'Failed to create list';
        }
      },
      error: (error) => {
        this.errorMessage = 'Error creating list';
        console.error('Error creating trip list:', error);
      }
    });
  }

  handleRefresh(): void {
    this.loadTripLists();
  }

  handleListDeleted(): void {
    this.loadTripLists();
  }
}
