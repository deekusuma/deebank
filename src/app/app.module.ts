import { HttpClientModule } from '@angular/common/http';
import { DEFAULT_CURRENCY_CODE, LOCALE_ID, NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';

import { ReactiveFormsModule } from '@angular/forms';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import { MaterialModule } from './material.module';
import { TransactionFormComponent } from './transaction-form/transaction-form.component';
import { TransactionListComponent } from './transaction-list/transaction-list.component';
import { TransactionSaveDialogComponent } from './transaction-save-dialog/transaction-save-dialog.component';
import { RouterModule } from '@angular/router';
import { CommonModule } from '@angular/common';
import { OrderByPipe } from './pipes/order-by.pipe';


@NgModule({
  declarations: [
    AppComponent,
    TransactionFormComponent,
    TransactionListComponent,
    TransactionSaveDialogComponent,
    OrderByPipe
  ],
  imports: [
    CommonModule,
    BrowserModule,
    HttpClientModule,
    AppRoutingModule,
    ReactiveFormsModule,
    BrowserAnimationsModule,
    MaterialModule,
    RouterModule
  ],
  providers: [{
    provide: LOCALE_ID,
    useValue: 'en-GB'
  }, {
    provide: DEFAULT_CURRENCY_CODE,
    useValue: 'GBP'
  }],
  bootstrap: [AppComponent],
})
export class AppModule {}
