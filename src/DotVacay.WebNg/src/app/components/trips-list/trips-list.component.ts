import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { TripService } from '../../services/trip.service';
import { CreateTripModel } from '../../models/create-trip.model';
import { TripListItemModel } from '../../models/trip-list-item.model';

@Component({
  selector: 'app-trips-list',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink],
  templateUrl: './trips-list.component.html',
  styleUrls: ['./trips-list.component.css']
})
export class TripsListComponent implements OnInit {
  trips: TripListItemModel[] = [];
  createTrip: CreateTripModel = new CreateTripModel();
  errorMessage: string = '';
  successMessage: string = '';

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

  onSubmit(): void {
    this.tripService.createTrip(this.createTrip).subscribe({
      next: (result) => {
        if (result.success) {
          this.successMessage = 'Trip created successfully!';
          this.createTrip = new CreateTripModel(); // Reset form
          this.loadTrips(); // Reload trips
          // Close modal (will need to be handled in the template)
        } else if (result.errors?.length) {
          this.errorMessage = result.errors[0];
        }
      },
      error: (error) => {
        console.error('Failed to create trip', error);
        this.errorMessage = error.error?.errors?.[0] || 'Failed to create trip';
      }
    });
  }

  deleteTrip(tripId: string): void {
    if (confirm('Are you sure you want to delete this trip?')) {
      this.tripService.deleteTrip(tripId).subscribe({
        next: (result) => {
          if (result.success) {
            this.successMessage = 'Trip deleted successfully!';
            this.loadTrips(); // Reload trips
          } else if (result.errors?.length) {
            this.errorMessage = result.errors[0];
          }
        },
        error: (error) => {
          console.error('Failed to delete trip', error);
          this.errorMessage = error.error?.errors?.[0] || 'Failed to delete trip';
        }
      });
    }
  }
}