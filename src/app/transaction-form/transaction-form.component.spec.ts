import { ComponentFixture, TestBed } from '@angular/core/testing';

import { TransactionFormComponent } from './transaction-form.component';
import { RouterTestingModule } from '@angular/router/testing';
import { AbstractControl, ReactiveFormsModule } from '@angular/forms';
import { MaterialModule } from '../material.module';
import { HttpClientTestingModule } from '@angular/common/http/testing';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { CommonModule } from '@angular/common';
import { TransactionCreate, TransactionType } from '../core/transaction/transaction.interface';
import { BankAccount } from '../core/bank-account/bank-account.interface';
import { of } from 'rxjs';

describe('TransactionFormComponent', () => {
  let component: TransactionFormComponent;
  let fixture: ComponentFixture<TransactionFormComponent>;
  let sourceAccountControl: AbstractControl | null;
  let targetAccountControl: AbstractControl | null;
  let amountControl: AbstractControl | null;
  let transactionTypeControl: AbstractControl | null;
  const sampleBankAccount: BankAccount = {
    id: 1,
    bank_name: 'Bank A',
    account_holder_name: 'Miss Jane A Smith',
    sort_code: '111111',
    account_number: '11111111',
    client_id: 1,
    current_value: 10,
  };

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [TransactionFormComponent],
      imports: [
        RouterTestingModule,
        ReactiveFormsModule,
        MaterialModule,
        HttpClientTestingModule,
        BrowserAnimationsModule,
        CommonModule,
      ],
    });
    fixture = TestBed.createComponent(TransactionFormComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  beforeEach(() => {
    transactionTypeControl = component.transactionForm.get(
      component.transactionTypeFieldName
    );
    sourceAccountControl = component.transactionForm.get(
      component.sourceAccountFieldName
    );
    targetAccountControl = component.transactionForm.get(
      component.targetAccountFieldName
    );
    amountControl = component.transactionForm.get(component.amountFieldName);
  });

  describe('Deposit Form Validation', () => {
    it('should hide source account field', () => {
      //Arrange
      component.formVisibility.showSourceAccount = true;
      sourceAccountControl?.enable();

      //Act
      transactionTypeControl?.setValue(TransactionType.DEPOSIT);

      //Assert
      expect(component.formVisibility.showSourceAccount).toBeFalsy();
      expect(sourceAccountControl?.disabled).toBeTruthy();
    });

    it('should mark the form as invalid when target account and amount are missing', () => {
      //Arrange
      transactionTypeControl?.setValue(TransactionType.DEPOSIT);

      //Act
      targetAccountControl?.setValue(null);
      amountControl?.setValue(null);

      //Assert
      expect(component.transactionForm.invalid).toBeTruthy();
      expect(targetAccountControl?.hasError('required')).toBeTruthy();
      expect(amountControl?.hasError('required')).toBeTruthy();
    });

    it('should mark the form as valid when target account and amount are valid', () => {
      //Arrange
      transactionTypeControl?.setValue(TransactionType.DEPOSIT);

      //Act
      targetAccountControl?.setValue({ ...sampleBankAccount });
      amountControl?.setValue(1);

      //Assert
      expect(component.transactionForm.valid).toBeTruthy();
    });
  });

  describe('Withdrawal Form Validation', () => {
    it('should hide target account field', () => {
      //Arrange
      component.formVisibility.showTargetAccount = true;
      targetAccountControl?.enable();

      //Act
      transactionTypeControl?.setValue(TransactionType.WITHDRAW);

      //Assert
      expect(component.formVisibility.showTargetAccount).toBeFalsy();
      expect(targetAccountControl?.disabled).toBeTruthy();
    });

    it('should mark the form as invalid when source account and amount are missing', () => {
      //Arrange
      transactionTypeControl?.setValue(TransactionType.WITHDRAW);

      //Act
      sourceAccountControl?.setValue(null);
      amountControl?.setValue(null);

      //Assert
      expect(component.transactionForm.invalid).toBeTruthy();
      expect(sourceAccountControl?.hasError('required')).toBeTruthy();
      expect(amountControl?.hasError('required')).toBeTruthy();
    });

    it('should have error when amount to withdraw is greater than current value of the account', () => {
      //Arrange
      transactionTypeControl?.setValue(TransactionType.WITHDRAW);

      //Act
      sourceAccountControl?.setValue({ ...sampleBankAccount });
      amountControl?.setValue(100);

      //Assert
      expect(component.transactionForm.invalid).toBeTruthy();
      expect(
        component.transactionForm
          .get(component.amountFieldName)
          ?.hasError('max')
      ).toBeTruthy();
    });

    it('should hide amount field when withdraw all is selected', () => {
      //Arrange
      component.formVisibility.showAmount = true;
      amountControl?.enable();

      //Act
      component.transactionForm
        .get(component.fullAmountFieldName)
        ?.setValue(true);

      //Assert
      expect(component.formVisibility.showAmount).toBeFalsy();
      expect(amountControl?.disabled).toBeTruthy();
    });

    it('should mark the form as valid when source account and amount are valid', () => {
      //Arrange
      transactionTypeControl?.setValue(TransactionType.WITHDRAW);

      //Act
      sourceAccountControl?.setValue({ ...sampleBankAccount });
      amountControl?.setValue(1);

      //Assert
      expect(component.transactionForm.valid).toBeTruthy();
    });
  });

  describe('Transfer Form Validation', () => {
    it('should show target account and source account field', () => {
      //Arrange
      component.formVisibility.showTargetAccount = false;
      component.formVisibility.showSourceAccount = false;
      sourceAccountControl?.disable();
      targetAccountControl?.disable();

      //Act
      transactionTypeControl?.setValue(TransactionType.TRANSFER);

      //Assert
      expect(component.formVisibility.showSourceAccount).toBeTruthy();
      expect(component.formVisibility.showTargetAccount).toBeTruthy();
      expect(sourceAccountControl?.enabled).toBeTruthy();
      expect(targetAccountControl?.enabled).toBeTruthy();
    });

    it('should mark the form as invalid when any fields other than description is missing', () => {
      //Arrange
      transactionTypeControl?.setValue(TransactionType.TRANSFER);

      //Act
      component.transactionForm.patchValue({
        [component.sourceAccountFieldName]: null,
        [component.targetAccountFieldName]: null,
        [component.amountFieldName]: null,
      });

      //Assert
      expect(component.transactionForm.invalid).toBeTruthy();
      expect(sourceAccountControl?.hasError('required')).toBeTruthy();
      //expect(targetAccountControl?.hasError('required')).toBeTruthy();
      expect(amountControl?.hasError('required')).toBeTruthy();
    });

    it('should have error when amount to transfer is greater than current value of the source account', () => {
      //Arrange
      transactionTypeControl?.setValue(TransactionType.TRANSFER);

      //Act
      sourceAccountControl?.setValue({ ...sampleBankAccount });
      amountControl?.setValue(100);

      //Assert
      expect(component.transactionForm.invalid).toBeTruthy();
      expect(
        component.transactionForm
          .get(component.amountFieldName)
          ?.hasError('max')
      ).toBeTruthy();
    });

    it('should have error when target account and source account are not for same client id', () => {
      //Arrange
      transactionTypeControl?.setValue(TransactionType.TRANSFER);

      //Act
      sourceAccountControl?.setValue({ ...sampleBankAccount });
      targetAccountControl?.setValue({
        ...sampleBankAccount,
        id: 123,
        client_id: 9999,
      });

      //Assert
      expect(targetAccountControl?.invalid).toBeTruthy();
      expect(
        targetAccountControl?.hasError('transferAccountNotSameClient')
      ).toBeTruthy();
    });

    it('should have error when target account and source account are same', () => {
      //Arrange
      transactionTypeControl?.setValue(TransactionType.TRANSFER);

      //Act
      sourceAccountControl?.setValue({ ...sampleBankAccount });
      targetAccountControl?.setValue({ ...sampleBankAccount });

      //Assert
      expect(targetAccountControl?.invalid).toBeTruthy();
      expect(
        targetAccountControl?.hasError('transferAccountSame')
      ).toBeTruthy();
    });

    it('should have the form as valid when right data is entered in all fields', () => {
      //Arrange
      transactionTypeControl?.setValue(TransactionType.TRANSFER);

      //Act
      sourceAccountControl?.setValue({ ...sampleBankAccount });
      targetAccountControl?.setValue({ ...sampleBankAccount, id: 1234 });
      amountControl?.setValue(1);

      //Assert
      expect(component.transactionForm.valid).toBeTruthy();
    });
  });

  describe('Successful Form Submission', () => {
    it('should call service create method when form is valid up on submission', () => {
      //Arrange
      transactionTypeControl?.setValue(TransactionType.DEPOSIT);
      targetAccountControl?.setValue({ ...sampleBankAccount });
      amountControl?.setValue(1111);
      const spyCreate = jest.spyOn(component['transactionService'], 'createTransaction').mockImplementation((data: TransactionCreate) => {return of()});

      //Act
      component.onSubmit();

      //Assert
      expect(spyCreate).toHaveBeenCalledTimes(1);
    });

    it('should call service create method with full current value for withdraw', () => {
      //Arrange
      transactionTypeControl?.setValue(TransactionType.WITHDRAW);
      sourceAccountControl?.setValue({ ...sampleBankAccount });
      targetAccountControl?.setValue({ ...sampleBankAccount, id: 123 });
      component.transactionForm.get(component.fullAmountFieldName)?.setValue(true);

      const spyCreate = jest.spyOn(component['transactionService'], 'createTransaction').mockImplementation((data: TransactionCreate) => {return of()});

      //Act
      component.onSubmit();

      //Assert
      expect(spyCreate).toHaveBeenCalledWith({
        source_bank_account_id: sampleBankAccount.id,
        target_bank_account_id: 123,
        amount: sampleBankAccount.current_value,
        description: null,
        transaction_type: TransactionType.WITHDRAW,
      });
    });
  });
});
