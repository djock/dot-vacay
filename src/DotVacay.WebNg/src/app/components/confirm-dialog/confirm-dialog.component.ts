import { Component, EventEmitter, Input, Output } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'confirm-dialog',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './confirm-dialog.component.html',
  styleUrls: ['./confirm-dialog.component.css']
})
export class ConfirmDialogComponent {
  @Input() isOpen: boolean = false;
  @Input() title: string = 'Confirm';
  @Input() message: string = 'Are you sure?';
  @Input() confirmText: string = 'Delete';
  @Input() cancelText: string = 'Cancel';
  @Input() isDanger: boolean = true;

  @Output() onConfirm = new EventEmitter<void>();
  @Output() onCancel = new EventEmitter<void>();

  confirm(): void {
    this.onConfirm.emit();
  }

  cancel(): void {
    this.onCancel.emit();
  }
}
