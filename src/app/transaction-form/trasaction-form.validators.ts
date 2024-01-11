import { AbstractControl } from '@angular/forms';
import { BankAccount } from '../core/bank-account/bank-account.interface';
import { TransactionType } from '../core/transaction/transaction.interface';

export function transferAccountValidator(
  transactionTypeFieldName: string,
  sourceAccountFieldName: string,
  targetAccountFieldName: string
) {
  return (control: AbstractControl) => {
    const transactionType: string = control.get(
      transactionTypeFieldName
    )?.value;
    const sourceAccount: BankAccount = control.get(
      sourceAccountFieldName
    )?.value;
    const targetAccount: BankAccount = control.get(
      targetAccountFieldName
    )?.value;

    if (
      transactionType === TransactionType.TRANSFER &&
      sourceAccount &&
      targetAccount &&
      sourceAccount.client_id !== targetAccount.client_id
    ) {
      control
        .get(targetAccountFieldName)
        ?.setErrors({ transferAccountNotSameClient: true });
    }

    if (
      transactionType === TransactionType.TRANSFER &&
      sourceAccount &&
      targetAccount &&
      sourceAccount.id === targetAccount.id
    ) {
      control
        .get(targetAccountFieldName)
        ?.setErrors({ transferAccountSame: true });
    }

    return null;
  };
}
