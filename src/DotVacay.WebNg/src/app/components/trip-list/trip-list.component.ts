import { Component, Input, Output, EventEmitter, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { TripListModel } from '../../models/trip-list.model';
import { TripListItemComponent } from '../trip-list-item/trip-list-item.component';
import { TripListService } from '../../services/trip-list.service';
import { TripListItemService } from '../../services/trip-list-item.service';
import { ConfirmDialogComponent } from '../confirm-dialog/confirm-dialog.component';

@Component({
  selector: 'trip-list',
  standalone: true,
  imports: [CommonModule, FormsModule, TripListItemComponent, ConfirmDialogComponent],
  templateUrl: './trip-list.component.html',
  styleUrls: ['./trip-list.component.css']
})
export class TripListComponent implements OnInit {
  @Input() tripList!: TripListModel;
  @Input() tripId: string = '';
  @Output() onRefresh = new EventEmitter<void>();
  @Output() onDelete = new EventEmitter<void>();

  isAddingItem: boolean = false;
  newItemTitle: string = '';
  isDeleteConfirmOpen: boolean = false;
  
  constructor(private tripListService: TripListService, private tripListItemService: TripListItemService) {}

  ngOnInit(): void {
  }

  startAddingItem(): void {
    this.isAddingItem = true;
    this.newItemTitle = '';
  }

  cancelAddingItem(): void {
    this.isAddingItem = false;
    this.newItemTitle = '';
  }

  addListItem(): void {
    if (!this.newItemTitle.trim()) return;

    this.tripListItemService.createTripListItem({
      title: this.newItemTitle,
      tripListId: this.tripList.id
    }).subscribe({
      next: (result) => {
        if (result.success) {
          this.onRefresh.emit();
          this.isAddingItem = false;
          this.newItemTitle = '';
        } else {
          console.error('Failed to create list item:', result.errors);
        }
      },
      error: (error) => {
        console.error('Error creating list item:', error);
      }
    });
  }

  deleteList(): void {
    this.isDeleteConfirmOpen = true;
  }

  confirmDeleteList(): void {
    this.tripListService.deleteTripList(this.tripList.id.toString()).subscribe({
      next: (result) => {
        if (result.success) {
          this.onDelete.emit();
        } else {
          console.error('Failed to delete list:', result.errors);
        }
      },
      error: (error) => {
        console.error('Error deleting list:', error);
      }
    });
    this.isDeleteConfirmOpen = false;
  }

  cancelDeleteList(): void {
    this.isDeleteConfirmOpen = false;
  }

  handleRefresh(): void {
    this.onRefresh.emit();
  }
}
