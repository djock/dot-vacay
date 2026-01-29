import { Component, Input, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';
import { TripListItemModel } from '../../models/trip-list-item.model';
import { TripListItemService } from '../../services/trip-list-item.service';
import { ConfirmDialogComponent } from '../confirm-dialog/confirm-dialog.component';

@Component({
  selector: 'trip-list-item',
  standalone: true,
  imports: [CommonModule, ConfirmDialogComponent],
  templateUrl: './trip-list-item.component.html',
  styleUrls: ['./trip-list-item.component.css']
})
export class TripListItemComponent {
  @Input() tripListItem!: TripListItemModel;
  @Input() tripId: string = '';
  @Output() onRefresh = new EventEmitter<void>();
  isDeleteConfirmOpen: boolean = false;

  constructor(private tripListItemService: TripListItemService) {}

  toggleCheck(): void {
    this.tripListItemService.updateTripListItem(
      this.tripListItem.id.toString(),
      this.tripId,
      { isChecked: !this.tripListItem.isChecked }
    ).subscribe({
      next: (result) => {
        if (result.success) {
          this.onRefresh.emit();
        } else {
          console.error('Failed to update list item:', result.errors);
        }
      },
      error: (error) => {
        console.error('Error updating list item:', error);
      }
    });
  }

  deleteItem(): void {
    this.isDeleteConfirmOpen = true;
  }

  confirmDeleteItem(): void {
    this.tripListItemService.deleteTripListItem(this.tripListItem.id.toString()).subscribe({
      next: (result) => {
        if (result.success) {
          this.onRefresh.emit();
        } else {
          console.error('Failed to delete list item:', result.errors);
        }
      },
      error: (error) => {
        console.error('Error deleting list item:', error);
      }
    });
    this.isDeleteConfirmOpen = false;
  }

  cancelDeleteItem(): void {
    this.isDeleteConfirmOpen = false;
  }
}
