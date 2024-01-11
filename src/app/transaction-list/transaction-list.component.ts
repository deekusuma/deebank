import { Component, inject } from '@angular/core';
import { TransactionService } from '../core/transaction/transaction.service';
@Component({
  selector: 'app-transaction-list',
  templateUrl: './transaction-list.component.html',
  styleUrls: ['./transaction-list.component.scss']
})
export class TransactionListComponent {
  public displayedColumns: string[] = ['id', 'transaction_type', 'amount', 'source', 'target', 'description'];
  public transactionService = inject(TransactionService);
  
  dataSource$ = this.transactionService.getEnhancedTransactions();
}
