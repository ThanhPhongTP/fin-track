import type { BankAccount, Category, Transaction, AppSettings, InvestmentAsset } from '../types/finance.ts';
import { DEFAULT_CATEGORIES, INITIAL_SAMPLE_BANKS, INITIAL_SAMPLE_ASSETS } from './financeEngine.ts';

const KEYS = {
  BANKS: 'fintrack_banks_v1',
  CATEGORIES: 'fintrack_categories_v1',
  TRANSACTIONS: 'fintrack_transactions_v1',
  SETTINGS: 'fintrack_settings_v1',
  ASSETS: 'fintrack_assets_v1',
};

const DEFAULT_SETTINGS: AppSettings = {
  isPinEnabled: false,
  pinCode: '',
  isBiometricEnabled: true,
  isBalanceHidden: false,
  currencySymbol: '₫',
};

export const storage = {
  getBanks(): BankAccount[] {
    try {
      const data = localStorage.getItem(KEYS.BANKS);
      if (data) return JSON.parse(data);
    } catch (e) {
      console.error('Lỗi đọc ngân hàng:', e);
    }
    // Giá trị khởi tạo mặc định nếu chưa có
    return INITIAL_SAMPLE_BANKS;
  },

  setBanks(banks: BankAccount[]): void {
    localStorage.setItem(KEYS.BANKS, JSON.stringify(banks));
  },

  getCategories(): Category[] {
    try {
      const data = localStorage.getItem(KEYS.CATEGORIES);
      if (data) return JSON.parse(data);
    } catch (e) {
      console.error('Lỗi đọc danh mục:', e);
    }
    return DEFAULT_CATEGORIES;
  },

  setCategories(categories: Category[]): void {
    localStorage.setItem(KEYS.CATEGORIES, JSON.stringify(categories));
  },

  getTransactions(): Transaction[] {
    try {
      const data = localStorage.getItem(KEYS.TRANSACTIONS);
      if (data) return JSON.parse(data);
    } catch (e) {
      console.error('Lỗi đọc giao dịch:', e);
    }
    return [];
  },

  setTransactions(transactions: Transaction[]): void {
    localStorage.setItem(KEYS.TRANSACTIONS, JSON.stringify(transactions));
  },

  getAssets(): InvestmentAsset[] {
    try {
      const data = localStorage.getItem(KEYS.ASSETS);
      if (data) return JSON.parse(data);
    } catch (e) {
      console.error('Lỗi đọc tài sản tích lũy:', e);
    }
    return INITIAL_SAMPLE_ASSETS;
  },

  setAssets(assets: InvestmentAsset[]): void {
    localStorage.setItem(KEYS.ASSETS, JSON.stringify(assets));
  },

  getSettings(): AppSettings {
    try {
      const data = localStorage.getItem(KEYS.SETTINGS);
      if (data) return { ...DEFAULT_SETTINGS, ...JSON.parse(data) };
    } catch (e) {
      console.error('Lỗi đọc cài đặt:', e);
    }
    return DEFAULT_SETTINGS;
  },

  setSettings(settings: AppSettings): void {
    localStorage.setItem(KEYS.SETTINGS, JSON.stringify(settings));
  },

  exportAllData(): string {
    const backup = {
      version: 2,
      exportedAt: new Date().toISOString(),
      banks: this.getBanks(),
      categories: this.getCategories(),
      transactions: this.getTransactions(),
      assets: this.getAssets(),
      settings: this.getSettings(),
    };
    return JSON.stringify(backup, null, 2);
  },

  importAllData(jsonStr: string): boolean {
    try {
      const data = JSON.parse(jsonStr);
      if (data.banks && Array.isArray(data.banks)) this.setBanks(data.banks);
      if (data.categories && Array.isArray(data.categories)) this.setCategories(data.categories);
      if (data.transactions && Array.isArray(data.transactions)) this.setTransactions(data.transactions);
      if (data.assets && Array.isArray(data.assets)) this.setAssets(data.assets);
      if (data.settings) this.setSettings(data.settings);
      return true;
    } catch (e) {
      console.error('Lỗi nhập dữ liệu:', e);
      return false;
    }
  },

  resetAll(): void {
    localStorage.removeItem(KEYS.BANKS);
    localStorage.removeItem(KEYS.CATEGORIES);
    localStorage.removeItem(KEYS.TRANSACTIONS);
    localStorage.removeItem(KEYS.ASSETS);
    localStorage.removeItem(KEYS.SETTINGS);
  },
};
