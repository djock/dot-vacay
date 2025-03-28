import { Component, OnInit } from '@angular/core';import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';import { TripService } from '../../services/trip.service';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-trip-detail',
  standalone: true, imports: [CommonModule, FormsModule, RouterLink],
  templateUrl: './trip-detail.component.html', styleUrls: ['./trip-detail.component.css']
}) export class TripDetailComponent implements OnInit {
  tripId: string = ''; trip: any = null;
  errorMessage: string = ''; successMessage: string = '';
  loading: boolean = true;
  constructor(private route: ActivatedRoute,
    private router: Router, private tripService: TripService
  ) { }
  ngOnInit(): void {
    this.route.paramMap.subscribe(params => {
      this.tripId = params.get('id') || ''; if (this.tripId) {
        this.loadTripDetails();
      }
    });
  }
  loadTripDetails(): void {
    this.loading = true; this.tripService.getTripById(this.tripId).subscribe({
      next: (result) => {
        this.loading = false;
        if (result.success) {
          this.trip = result.trip;
        } else if (result.errors?.length) {
          this.errorMessage = result.errors[0];
        }
      },
      error: (error) => {
        this.loading = false;
        console.error('Failed to load trip details', error); this.errorMessage = error.error?.errors?.[0] || 'Failed to load trip details';
      }
    });
  }
  deleteTrip(): void {
    if (confirm('Are you sure you want to delete this trip?')) {
      this.tripService.deleteTrip(this.tripId).subscribe({
        next: (result) => {
          if (result.success) {
            this.router.navigate(['/trips']);
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
  leaveTrip(): void {
    if (confirm('Are you sure you want to leave this trip?')) {
      this.tripService.leaveTrip(this.tripId).subscribe({
        next: (result) => {
          if (result.success) {
            this.router.navigate(['/trips']);
          } else if (result.errors?.length) {
            this.errorMessage = result.errors[0];
          }
        },
        error: (error) => {
          console.error('Failed to leave trip', error);
          this.errorMessage = error.error?.errors?.[0] || 'Failed to leave trip';
        }
      });
    }
  }
}
