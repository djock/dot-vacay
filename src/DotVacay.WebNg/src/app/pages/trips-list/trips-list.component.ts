import { Component, OnInit, ViewChild, ElementRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';
import { TripService } from '../../services/trip.service';
import { EditTripModel } from '../../models/create-trip.model';
import { TripListItemModel } from '../../models/trip-list-item.model';
import { AppHeaderComponent } from "../../components/app-header/app-header.component";
import { EditTripModal } from "../../components/edit-trip-modal/edit-trip-modal.component";
import { TripListItemComponent } from "../../components/trip-list-item/trip-list-item.component"; 

declare var bootstrap: any;

@Component({
  selector: 'app-trips-list',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule, AppHeaderComponent, EditTripModal, TripListItemComponent],
  templateUrl: './trips-list.component.html',
  styleUrls: ['./trips-list.component.css']
})

export class TripsListComponent implements OnInit {
  trips: TripListItemModel[] = [];
  createTrip: EditTripModel = new EditTripModel();
  errorMessage: string = '';
  successMessage: string = '';
  private modalInstance: any;

  @ViewChild('editTripModal') editTripModalElement!: ElementRef;

  constructor(private tripService: TripService) {}

  ngOnInit(): void {
    this.loadTrips();
  }

  ngAfterViewInit(): void {
    if (this.editTripModalElement) {
      this.modalInstance = new bootstrap.Modal(this.editTripModalElement.nativeElement);
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

  openEditTripModal(): void {
    if (this.modalInstance) {
      this.modalInstance.show();
    }
  }

  closeEditTripModal(): void {
    if (this.modalInstance) {
      this.modalInstance.hide();
    }
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
