import { Component, OnInit, ViewChildren, QueryList } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { TripService } from '../../services/trip.service';
import { FormsModule } from '@angular/forms';
import { EditPoiModal } from '../../components/edit-poi-modal/edit-poi-modal.component';
import { TripDayComponent } from '../../components/trip-day/trip-day.component';
import { TripListsManagerComponent } from '../../components/trip-lists-manager/trip-lists-manager.component';
import { ConfirmDialogComponent } from '../../components/confirm-dialog/confirm-dialog.component';
import { PointOfInterest } from '../../models/point-of-interest.model';
import { AiSuggestionService } from '../../services/ai-suggestion.service';
import { PointOfInterestService } from '../../services/point-of-interest.service';

@Component({
  selector: 'trip-detail',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    RouterModule,
    EditPoiModal,
    TripDayComponent,
    TripListsManagerComponent,
    ConfirmDialogComponent
  ],
  providers: [
    PointOfInterestService
  ],
  templateUrl: './trip-detail.component.html',
  styleUrls: ['./trip-detail.component.css']
})
export class TripDetailComponent implements OnInit {
  tripId: string = '';
  trip: any = null;
  userIsOwner: boolean = false;
  errorMessage: string = '';
  successMessage: string = '';
  loading: boolean = true;
  tripDays: Date[] = [];
  selectedPoi: PointOfInterest | null = null;
  selectedDate: Date | null = null;
  isPoiDrawerOpen: boolean = false;
  isDeleteTripConfirmOpen: boolean = false;
  activeTab: 'plan' | 'map' = 'plan';
  selectedMapDay: string = 'all';
  selectedMapPoi: PointOfInterest | null = null;

  @ViewChildren(TripDayComponent) tripDayComponents!: QueryList<TripDayComponent>;

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private tripService: TripService,
    private aiSuggestionService: AiSuggestionService,
    private pointOfInterestService: PointOfInterestService
  ) { }

  ngOnInit(): void {
    this.route.params.subscribe(params => {
      this.tripId = params['id'];
      this.loadTripDetails();
    });
  }

  loadTripDetails(): void {
    this.loading = true;
    this.tripService.getTripById(this.tripId).subscribe({
      next: (result) => {
        this.loading = false;
        if (result.success) {
          this.trip = result.trip;
          this.userIsOwner = result.userIsOwner;

          this.generateTripDays();
          this.ensureSelectedMapPoi();
        } else if (result.errors?.length) {
          this.errorMessage = result.errors[0];
        }
      },
      error: (error) => {
        this.loading = false;
        console.error('Failed to load trip details', error);
        this.errorMessage = error.error?.errors?.[0] || 'Failed to load trip details';
      }
    });
  }

  generateTripDays(): void {
    this.tripDays = [];
    if (this.trip && this.trip.startDate && this.trip.endDate) {
      const startDate = new Date(this.trip.startDate);
      const endDate = new Date(this.trip.endDate);

      let currentDate = new Date(startDate);
      while (currentDate <= endDate) {
        this.tripDays.push(new Date(currentDate));
        currentDate.setDate(currentDate.getDate() + 1);
      }
    }
  }

  getPointsOfInterestForDay(day: Date): PointOfInterest[] {
    if (!this.trip || !this.trip.pointsOfInterest) {
      return [];
    }

    const dayStart = new Date(day);
    dayStart.setHours(0, 0, 0, 0);

    const dayEnd = new Date(day);
    dayEnd.setHours(23, 59, 59, 999);

    const dayPois = this.trip.pointsOfInterest.filter((poi: PointOfInterest) => {
      if (!poi.startDate || !poi.endDate) {
        return false;
      }

      const poiStartDate = new Date(poi.startDate);
      const poiEndDate = new Date(poi.endDate);

      return (
        (poiStartDate >= dayStart && poiStartDate <= dayEnd) ||
        (poiEndDate >= dayStart && poiEndDate <= dayEnd) ||
        (poiStartDate <= dayStart && poiEndDate >= dayEnd)
      );
    });

    return dayPois.sort((a: PointOfInterest, b: PointOfInterest) => {
      const indexA = a.tripDayIndex ?? Number.MAX_SAFE_INTEGER;
      const indexB = b.tripDayIndex ?? Number.MAX_SAFE_INTEGER;
      if (indexA !== indexB) {
        return indexA - indexB;
      }

      const dateA = a.startDate ? new Date(a.startDate).getTime() : 0;
      const dateB = b.startDate ? new Date(b.startDate).getTime() : 0;
      return dateA - dateB;
    });
  }

  openAddPoiModal(date: Date): void {
    this.selectedDate = date;
    this.selectedPoi = null;
    this.isPoiDrawerOpen = true;
  }

  openEditPoiModal(poi: PointOfInterest): void {
    this.selectedPoi = poi;
    this.selectedDate = null;
    this.isPoiDrawerOpen = true;
  }

  closeEditTripModal(): void {
    this.isPoiDrawerOpen = false;
  }

  onPoiSaved(result: { success?: boolean } | boolean): void {
    const isSuccess = typeof result === 'boolean' ? result : !!result?.success;
    if (isSuccess) {
      this.closeEditTripModal();
      this.loadTripDetails();
      this.successMessage = 'Point of interest saved successfully';
      setTimeout(() => this.successMessage = '', 3000);
    }
  }

  deleteTrip(): void {
    this.isDeleteTripConfirmOpen = true;
  }

  confirmDeleteTrip(): void {
    this.tripService.deleteTrip(this.tripId).subscribe({
      next: (result) => {
        if (result.success) {
          this.router.navigate(['/trips']);
        } else if (result.errors?.length) {
          this.errorMessage = result.errors[0];
        }
      },
      error: (error: any) => {
        console.error('Failed to delete trip', error);
        this.errorMessage = error.error?.errors?.[0] || 'Failed to delete trip';
      }
    });
    this.isDeleteTripConfirmOpen = false;
  }

  cancelDeleteTrip(): void {
    this.isDeleteTripConfirmOpen = false;
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
        error: (error: any) => {
          console.error('Failed to leave trip', error);
          this.errorMessage = error.error?.errors?.[0] || 'Failed to leave trip';
        }
      });
    }
  }

  generateDayAiSuggestions(event: { date: Date, location: string }): void {
    const dayComponent = this.findTripDayComponent(event.date);

    if (dayComponent) {
      dayComponent.setGeneratingStatus(true);
    }

    const d = event.date;
    const startDate = new Date(Date.UTC(d.getFullYear(), d.getMonth(), d.getDate(), 0, 0, 0, 0));
    const endDate = new Date(Date.UTC(d.getFullYear(), d.getMonth(), d.getDate(), 23, 59, 59, 999));

    const request = {
      location: event.location,
      startDate: startDate.toISOString(),
      endDate: endDate.toISOString(),
      tripId: this.tripId
    };

    this.aiSuggestionService.generateSuggestions(request).subscribe({
      next: (result) => {
        if (result.success) {
          this.loadTripDetails();
        } else {
          console.error('Failed to generate AI suggestions:', result.errors);
        }

        if (dayComponent) {
          dayComponent.setGeneratingStatus(false);
        }
      },
      error: (error: any) => {
        console.error('Error generating AI suggestions:', error);
        if (dayComponent) {
          dayComponent.setGeneratingStatus(false);
        }
      }
    });
  }

  async movePoiWithinDay(event: { day: Date, poi: PointOfInterest, direction: 'up' | 'down' }): Promise<void> {
    const dayPois = [...this.getPointsOfInterestForDay(event.day)];
    const currentIndex = dayPois.findIndex(poi => poi.id === event.poi.id);

    if (currentIndex < 0) {
      return;
    }

    const targetIndex = event.direction === 'up' ? currentIndex - 1 : currentIndex + 1;
    if (targetIndex < 0 || targetIndex >= dayPois.length) {
      return;
    }

    [dayPois[currentIndex], dayPois[targetIndex]] = [dayPois[targetIndex], dayPois[currentIndex]];

    const originalTripDayIndexes = dayPois.map(poi => ({ id: poi.id, tripDayIndex: poi.tripDayIndex }));

    dayPois.forEach((poi, index) => {
      poi.tripDayIndex = index;
    });

    const updates = dayPois.map((poi, index) =>
      new Promise<void>((resolve, reject) => {
        this.pointOfInterestService.updateTripDayIndex(poi.id, index).subscribe({
          next: (result) => {
            if (result.success) {
              resolve();
              return;
            }
            reject(new Error(result.errors?.join(', ') || 'Failed to update order'));
          },
          error: () => reject(new Error('Failed to update order'))
        });
      })
    );

    try {
      await Promise.all(updates);
      this.successMessage = 'Day order updated';
      setTimeout(() => this.successMessage = '', 2000);
      this.loadTripDetails();
    } catch {
      originalTripDayIndexes.forEach(original => {
        const poi = this.trip?.pointsOfInterest?.find((tripPoi: PointOfInterest) => tripPoi.id === original.id);
        if (poi) {
          poi.tripDayIndex = original.tripDayIndex;
        }
      });
      this.errorMessage = 'Failed to save the updated order';
    }
  }

  setActiveTab(tab: 'plan' | 'map'): void {
    this.activeTab = tab;
    this.ensureSelectedMapPoi();
  }

  getMapPois(): PointOfInterest[] {
    if (!this.trip?.pointsOfInterest) {
      return [];
    }

    const allWithCoords = this.trip.pointsOfInterest.filter((poi: PointOfInterest) =>
      poi.latitude !== undefined && poi.latitude !== null && poi.longitude !== undefined && poi.longitude !== null
    );

    if (this.selectedMapDay === 'all') {
      return allWithCoords;
    }

    const dayIndex = Number(this.selectedMapDay);
    const day = this.tripDays[dayIndex];
    if (!day) {
      return allWithCoords;
    }

    const dayIds = new Set(this.getPointsOfInterestForDay(day).map(poi => poi.id));
    return allWithCoords.filter((poi: PointOfInterest) => dayIds.has(poi.id));
  }

  selectMapPoi(poi: PointOfInterest): void {
    this.selectedMapPoi = poi;
  }

  getSelectedMapUrl(): string {
    const poi = this.selectedMapPoi;
    if (!poi?.latitude || !poi?.longitude) {
      return '';
    }

    const delta = 0.03;
    const bbox = `${poi.longitude - delta}%2C${poi.latitude - delta}%2C${poi.longitude + delta}%2C${poi.latitude + delta}`;
    return `https://www.openstreetmap.org/export/embed.html?bbox=${bbox}&layer=mapnik&marker=${poi.latitude}%2C${poi.longitude}`;
  }

  private ensureSelectedMapPoi(): void {
    const mapPois = this.getMapPois();
    if (mapPois.length === 0) {
      this.selectedMapPoi = null;
      return;
    }

    if (!this.selectedMapPoi || !mapPois.some(poi => poi.id === this.selectedMapPoi?.id)) {
      this.selectedMapPoi = mapPois[0];
    }
  }

  private findTripDayComponent(date: Date): TripDayComponent | undefined {
    if (!this.tripDayComponents) {
      return undefined;
    }

    return this.tripDayComponents.find(component => {
      const componentDate = new Date(component.currentDate);
      return componentDate.getFullYear() === date.getFullYear()
        && componentDate.getMonth() === date.getMonth()
        && componentDate.getDate() === date.getDate();
    });
  }
}
