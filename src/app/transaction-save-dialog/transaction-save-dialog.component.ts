import { Component, Inject } from '@angular/core';
import { MAT_DIALOG_DATA } from '@angular/material/dialog';

@Component({
  selector: 'app-transaction-save-dialog',
  templateUrl: './transaction-save-dialog.component.html',
  styleUrls: ['./transaction-save-dialog.component.scss']
})
export class TransactionSaveDialogComponent {
  constructor(@Inject(MAT_DIALOG_DATA) public success: boolean) { } 
}
