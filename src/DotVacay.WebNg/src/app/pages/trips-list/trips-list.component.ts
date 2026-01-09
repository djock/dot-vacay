import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';
import { TripService } from '../../services/trip.service';
import { EditTripModel } from '../../models/create-trip.model';
import { TripListItemModel } from '../../models/trip-list-item.model';
import { EditTripModal } from "../../components/edit-trip-modal/edit-trip-modal.component";
import { TripListItemComponent } from "../../components/trip-list-item/trip-list-item.component"; 

@Component({
  selector: 'trips-list',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule, EditTripModal, TripListItemComponent],
  templateUrl: './trips-list.component.html',
  styleUrls: ['./trips-list.component.css']
})

export class TripsListComponent implements OnInit {
  trips: TripListItemModel[] = [];
  onEditTrip: EditTripModel = new EditTripModel();
  errorMessage: string = '';
  successMessage: string = '';
  isTripModalOpen: boolean = false;

  constructor(private tripService: TripService) {}

  ngOnInit(): void {
    this.loadTrips();
  }

  loadTrips(): void {
    this.tripService.getAllTrips().subscribe({
      next: (result) => {
        if (result.success) {
          this.trips = result.trips;
        } else if (result.errors?.length) {
          this.errorMessage = result.errors[0];
        }
      },
      error: (error) => {
        console.error('Failed to load trips', error);
        this.errorMessage = error.error?.errors?.[0] || 'Failed to load trips';
      }
    });
  }

  openEditTripModal(): void {
    this.isTripModalOpen = true;
  }

  closeEditTripModal(): void {
    this.isTripModalOpen = false;
  }

  onTripCreated(result: any): void {
    this.successMessage = 'Trip created successfully!';
    this.loadTrips(); // Reload trips
    this.closeEditTripModal(); // Close the modal
    
    // Clear success message after 5 seconds
    setTimeout(() => {
      this.successMessage = '';
    }, 5000);
  }

  onDeleteTrip(success: boolean): void {
    if(success) {
      this.successMessage = 'Trip deleted successfully!';
      this.loadTrips(); // Reload trips

      // Clear success message after 5 seconds
      setTimeout(() => {
        this.successMessage = '';
      }, 5000);
    } else {
      this.errorMessage = 'Failed to delete trip';
    }
  }
}
