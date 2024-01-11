import { ComponentFixture, TestBed } from '@angular/core/testing';

import { TransactionSaveDialogComponent } from './transaction-save-dialog.component';
import { RouterTestingModule } from '@angular/router/testing';
import { ReactiveFormsModule } from '@angular/forms';
import { MaterialModule } from '../material.module';
import { HttpClientTestingModule } from '@angular/common/http/testing';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { CommonModule } from '@angular/common';
import { BrowserModule } from '@angular/platform-browser';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';

describe('TransactionSaveDialogComponent', () => {
  let component: TransactionSaveDialogComponent;
  let fixture: ComponentFixture<TransactionSaveDialogComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [TransactionSaveDialogComponent],
      imports: [
        RouterTestingModule,
        ReactiveFormsModule,
        MaterialModule,
        HttpClientTestingModule,
        BrowserAnimationsModule,
        CommonModule,
        BrowserModule,
      ],
      providers: [
        { provide: MAT_DIALOG_DATA, useValue: {} },
        { provide: MatDialogRef, useValue: {} }
      ]
    });
    fixture = TestBed.createComponent(TransactionSaveDialogComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
