import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';

import {
  ExtendedTransaction,
  Transaction,
  TransactionCreate,
} from './transaction.interface';
import { Observable, combineLatest, forkJoin, map, mergeMap, of } from 'rxjs';
import { BankAccountService } from '../bank-account/bank-account.service';
import {
  BankAccount,
  NestedBankAccount,
} from '../bank-account/bank-account.interface';

@Injectable({
  providedIn: 'root',
})
export class TransactionService {
  private bankAccountService = inject(BankAccountService);

  constructor(private http: HttpClient) {}

  getTransactions() {
    return this.http.get<Transaction[]>('/api/transactions');
  }

  createTransaction(data: TransactionCreate) {
    return this.http.post<Transaction>('/api/transactions', data);
  }

  getEnhancedTransactions(): Observable<ExtendedTransaction[]> {
     return combineLatest([
      this.getTransactions(),
      this.bankAccountService.getBankAccounts().pipe(
        map((accounts) =>
          accounts.map((a) => {
            return {
              id: a.id,
              nested_bank_account: {
                bank_name: a.bank_name,
                account_holder_name: a.account_holder_name,
                sort_code: a.sort_code,
                account_number: a.account_number,
              },
            };
          })
        )
      ),
    ]).pipe(
      map(([transactions, bankAccounts]) =>
        transactions.map((transaction) => ({
          ...transaction,
          source: bankAccounts.find(
            (a) => a.id === transaction.source_bank_account_id
          )?.nested_bank_account as NestedBankAccount,
          target: bankAccounts.find(
            (a) => a.id === transaction.target_bank_account_id
          )?.nested_bank_account as NestedBankAccount,
        }))
      )
    )
  }
}
