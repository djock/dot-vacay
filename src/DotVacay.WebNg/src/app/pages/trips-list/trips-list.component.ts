import { Component, OnInit, ViewChild, ElementRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';
import { TripService } from '../../services/trip.service';
import { CreateTripModel } from '../../models/create-trip.model';
import { TripListItemModel } from '../../models/trip-list-item.model';
import { AppHeaderComponent } from "../../components/app-header/app-header.component";
import { EditTripModal } from "../../components/edit-trip-modal/edit-trip-modal.component";

declare var bootstrap: any;

@Component({
  selector: 'app-trips-list',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule, AppHeaderComponent, EditTripModal],
  templateUrl: './trips-list.component.html',
  styleUrls: ['./trips-list.component.css']
})

export class TripsListComponent implements OnInit {
  trips: TripListItemModel[] = [];
  createTrip: CreateTripModel = new CreateTripModel();
  errorMessage: string = '';
  successMessage: string = '';
  private modalInstance: any;

  @ViewChild('createTripModal') createTripModalElement!: ElementRef;

  constructor(private tripService: TripService) {}

  ngOnInit(): void {
    this.loadTrips();
  }

  ngAfterViewInit(): void {
    // Initialize the modal after view is initialized
    if (this.createTripModalElement) {
      this.modalInstance = new bootstrap.Modal(this.createTripModalElement.nativeElement);
    }
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

  openCreateTripModal(): void {
    if (this.modalInstance) {
      this.modalInstance.show();
    }
  }

  closeCreateTripModal(): void {
    if (this.modalInstance) {
      this.modalInstance.hide();
    }
  }

  onTripCreated(result: any): void {
    this.successMessage = 'Trip created successfully!';
    this.loadTrips(); // Reload trips
    this.closeCreateTripModal(); // Close the modal
    
    // Clear success message after 5 seconds
    setTimeout(() => {
      this.successMessage = '';
    }, 5000);
  }

  deleteTrip(tripId: string): void {
    if (confirm('Are you sure you want to delete this trip?')) {
      this.tripService.deleteTrip(tripId).subscribe({
        next: (result) => {
          if (result.success) {
            this.successMessage = 'Trip deleted successfully!';
            this.loadTrips(); // Reload trips
            
            // Clear success message after 5 seconds
            setTimeout(() => {
              this.successMessage = '';
            }, 5000);
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
