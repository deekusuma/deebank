import { Component, inject } from '@angular/core';
import {
  FormBuilder,
  FormControl,
  FormGroup,
  FormGroupDirective,
  NgForm,
  Validators,
} from '@angular/forms';
import { OnInit } from '@angular/core';
import {
  TransactionCreate,
  TransactionType,
} from '../core/transaction/transaction.interface';
import { BankAccountService } from '../core/bank-account/bank-account.service';
import { BankAccount } from '../core/bank-account/bank-account.interface';
import { TransactionFormVisibility } from './transaction-form-visibility.interface';
import { transferAccountValidator } from './trasaction-form.validators';
import { ErrorStateMatcher } from '@angular/material/core';
import { TransactionService } from '../core/transaction/transaction.service';
import { TransactionSaveDialogComponent } from '../transaction-save-dialog/transaction-save-dialog.component';
import { MatDialog } from '@angular/material/dialog';
import { Router } from '@angular/router';
import { UntilDestroy, untilDestroyed } from '@ngneat/until-destroy';

@UntilDestroy()
@Component({
  selector: 'app-transaction-form',
  templateUrl: './transaction-form.component.html',
  styleUrls: ['./transaction-form.component.scss'],
})
export class TransactionFormComponent implements OnInit {
  ///#region Injected Services
  private fb = inject(FormBuilder);
  private bankAccountService = inject(BankAccountService);
  private transactionService = inject(TransactionService);
  private dialog = inject(MatDialog);
  private router = inject(Router);
  //#endregion

  //#region Public Properties
  public transactionTypes = TransactionType;
  public transactionForm: FormGroup;
  public bankAccounts: BankAccount[] = [];
  public bankAccount$ = this.bankAccountService.getBankAccounts();
  public formVisibility: TransactionFormVisibility;
  public maxAmount: number = 0;
  public maxDescriptionLength: number = 20;
  public matcher = new TransactionFormErrorStateMatcher();

  //Field names for the form - to avoid magic strings
  public transactionTypeFieldName = 'transaction_type';
  public sourceAccountFieldName = 'source_bank_account';
  public targetAccountFieldName = 'target_bank_account';
  public amountFieldName = 'amount';
  public fullAmountFieldName = 'fullAmount';
  //#endregion

  constructor() {
    this.transactionForm = this.fb.group(
      {
        [this.transactionTypeFieldName]: [null, Validators.required],
        [this.sourceAccountFieldName]: [null, Validators.required],
        [this.targetAccountFieldName]: [null, Validators.required],
        [this.fullAmountFieldName]: [false, Validators.required],
        [this.amountFieldName]: [
          null,
          [Validators.required, Validators.min(0.01)],
        ],
        description: [null, Validators.maxLength(this.maxDescriptionLength)],
      },
      {
        validators: [
          transferAccountValidator(
            this.transactionTypeFieldName,
            this.sourceAccountFieldName,
            this.targetAccountFieldName
          ),
        ],
      }
    );

    this.formVisibility = this.resetFormVisibility();
  }

  public ngOnInit(): void {
    this.onTransactionTypeChange();
    this.onSourceAccountChange();
    this.onFullAmountChange();

    this.transactionForm
      .get(this.transactionTypeFieldName)
      ?.setValue(TransactionType.DEPOSIT);
  }

  /**
   * Handles the change event for the transaction type radio buttons
   */
  public onTransactionTypeChange(): void {
    this.transactionForm
      .get(this.transactionTypeFieldName)
      ?.valueChanges.pipe(untilDestroyed(this)).subscribe((transactionType: TransactionType) => {
        this.formVisibility = this.resetFormVisibility();
        this.resetFormForTransactionType();
        //this.transactionForm.get(this.fullAmountFieldName)?.reset(false);

        if (transactionType === TransactionType.DEPOSIT) {
          this.transactionForm.get(this.targetAccountFieldName)?.enable();

          //this.transactionForm.get(this.sourceAccountFieldName)?.reset();
          this.transactionForm.get(this.sourceAccountFieldName)?.disable();

          this.formVisibility.showSourceAccount = false;
        } else if (transactionType === TransactionType.WITHDRAW) {
          this.transactionForm.get(this.sourceAccountFieldName)?.enable();

          //this.transactionForm.get(this.targetAccountFieldName)?.reset();
          this.transactionForm.get(this.targetAccountFieldName)?.disable();

          this.formVisibility.showTargetAccount = false;
          this.formVisibility.showFullAmount = true;
        } else {
          this.transactionForm.get(this.sourceAccountFieldName)?.enable();
          this.transactionForm.get(this.targetAccountFieldName)?.enable();
        }

        this.setMaximunAmountValidator();
      });
  }

  /**
   * Handles the change event for the source account select
   */
  private onSourceAccountChange(): void {
    this.transactionForm
      .get(this.sourceAccountFieldName)
      ?.valueChanges.pipe(untilDestroyed(this)).subscribe((sourceAccount: BankAccount) => {
        this.setMaximunAmountValidator();
      });
  }

  /**
   * Handes the change event for the full amount checkbox
   */
  private onFullAmountChange(): void {
    this.transactionForm
      .get(this.fullAmountFieldName)
      ?.valueChanges.pipe(untilDestroyed(this)).subscribe((value) => {
        const amountField = this.transactionForm.get(this.amountFieldName);
        if (!amountField) return;

        if (value === true) {
          amountField.setValue(null);
          amountField.disable();
          this.formVisibility.showAmount = false;
        } else {
          amountField.enable();
          this.formVisibility.showAmount = true;
        }
      });
  }

  /**
   * Sets the validators for the amount field based on the source account visibility
   */
  private setMaximunAmountValidator(): void {
    const amountControl = this.transactionForm.get(this.amountFieldName);
    if (!amountControl) return;

    if (this.formVisibility.showSourceAccount) {
      this.maxAmount = this.transactionForm.get(
        this.sourceAccountFieldName
      )?.value?.current_value;
      amountControl.setValidators([
        Validators.required,
        Validators.min(0.01),
        Validators.max(this.maxAmount),
      ]);
    } else {
      amountControl.setValidators([Validators.required, Validators.min(0.01)]);
    }
    amountControl.updateValueAndValidity();
  }

  /**
   * Resets the form visibility to the default state
   * @returns {TransactionFormVisibility}
   */
  private resetFormVisibility(): TransactionFormVisibility {
    return {
      showSourceAccount: true,
      showTargetAccount: true,
      showFullAmount: false,
      showAmount: true,
    };
  }

  /**
   * Resets the form to the default state
   */
  private resetFormForTransactionType(): void {
    this.transactionForm.patchValue({
      [this.sourceAccountFieldName]: null,
      [this.targetAccountFieldName]: null,
      [this.fullAmountFieldName]: false,
      [this.amountFieldName]: null,
      description: null,
    });

    this.transactionForm.markAsPristine();
    this.transactionForm.markAsUntouched();
  }

  public onSubmit(): void {
    this.transactionForm.markAllAsTouched();
    if (this.transactionForm.invalid) return;

    // Construct the transaction object
    const transaction: TransactionCreate = {
      transaction_type: this.transactionForm.get(this.transactionTypeFieldName)
        ?.value,
      source_bank_account_id: this.transactionForm.get(
        this.sourceAccountFieldName
      )?.value?.id,
      target_bank_account_id: this.transactionForm.get(
        this.targetAccountFieldName
      )?.value?.id,
      amount: this.transactionForm.get(this.fullAmountFieldName)?.value
        ? this.transactionForm.get(this.sourceAccountFieldName)?.value
            .current_value
        : this.transactionForm.get(this.amountFieldName)?.value,
      description: this.transactionForm.get('description')?.value,
    };

    //Call the service to create the transaction
    this.transactionService.createTransaction(transaction).pipe(untilDestroyed(this)).subscribe({
      next: () => this.openDialog(true),
      error: (e) => {
        console.error(e);
        this.openDialog(false);
      },
    });
  }

  /**
   * Opens dialog to inform the user about the result of the transaction
   * @param success State from saving of transaction
   */
  private openDialog(success: boolean): void {
    const dialogRef = this.dialog.open(TransactionSaveDialogComponent, {
      data: success,
    });

    dialogRef.afterClosed().pipe(untilDestroyed(this)).subscribe((result) => {
      if (result === 0) {
        this.transactionForm
          .get(this.transactionTypeFieldName)
          ?.setValue(TransactionType.DEPOSIT);
      } else {
        this.router.navigate(['..']);
      }
    });
  }

  /**
   * Handles the cancel button click event
   */
  public onCancel(): void {
    this.router.navigate(['..']);
  }
}

/** Error when invalid control is dirty, touched, or submitted. */
export class TransactionFormErrorStateMatcher implements ErrorStateMatcher {
  isErrorState(
    control: FormControl | null,
    form: FormGroupDirective | NgForm | null
  ): boolean {
    return !!(control && control.invalid && (control.dirty || control.touched));
  }
}
