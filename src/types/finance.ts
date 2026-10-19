export type TransactionType = 'expense' | 'income';

export interface BankAccount {
  id: string;
  name: string;
  initialBalance: number;
  color: string;
  accountNumber?: string;
  createdAt: string;
}

export type AssetType = 'gold' | 'fund';

export interface InvestmentAsset {
  id: string;
  name: string;
  type: AssetType;
  quantity: number;
  unit: string; // 'chỉ', 'lượng', 'CCQ', 'cổ phiếu'
  currentValue: number; // Giá trị tính bằng VND
  purchaseValue?: number;
  note?: string;
  updatedAt: string;
}

export interface Category {
  id: string;
  name: string;
  type: TransactionType;
  icon: string;
  color: string;
}

export interface Transaction {
  id: string;
  type: TransactionType;
  bankId: string;
  amount: number;
  categoryId: string;
  date: string; // YYYY-MM-DD
  note?: string;
  createdAt: string;
}

export interface MonthlySnapshot {
  monthKey: string; // YYYY-MM
  year: number;
  month: number;
  openingBalance: number;
  totalIncome: number;
  totalExpense: number;
  netSavings: number;
  closingBalance: number;
  transactionCount: number;
}

export interface BankBalance {
  bank: BankAccount;
  currentBalance: number;
  totalIncome: number;
  totalExpense: number;
}

export interface AppSettings {
  isPinEnabled: boolean;
  pinCode: string;
  isBiometricEnabled?: boolean;
  isBalanceHidden: boolean;
  currencySymbol: string;
}
