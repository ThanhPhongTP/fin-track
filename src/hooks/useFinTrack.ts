import { useState, useEffect, useMemo, useCallback } from 'react';
import type { BankAccount, Category, Transaction, AppSettings, InvestmentAsset } from '../types/finance.ts';
import { storage } from '../services/storage.ts';
import {
  calculateBankBalances,
  calculateMonthlySnapshot,
  calculateCategoryBreakdown,
  calculateAssetStats,
  getCurrentMonthKey,
} from '../services/financeEngine.ts';

export function useFinTrack() {
  const [banks, setBanks] = useState<BankAccount[]>(() => storage.getBanks());
  const [categories, setCategories] = useState<Category[]>(() => storage.getCategories());
  const [transactions, setTransactions] = useState<Transaction[]>(() => storage.getTransactions());
  const [assets, setAssets] = useState<InvestmentAsset[]>(() => storage.getAssets());
  const [settings, setSettings] = useState<AppSettings>(() => storage.getSettings());

  const [activeTab, setActiveTab] = useState<'dashboard' | 'transactions' | 'analytics'>('dashboard');
  const [selectedMonthKey, setSelectedMonthKey] = useState<string>(() => getCurrentMonthKey());

  // Trạng thái khoá PIN khi mở app
  const [isLocked, setIsLocked] = useState<boolean>(() => {
    const s = storage.getSettings();
    return Boolean(s.isPinEnabled && s.pinCode);
  });

  // Tự động lưu mỗi khi state thay đổi
  useEffect(() => {
    storage.setBanks(banks);
  }, [banks]);

  useEffect(() => {
    storage.setCategories(categories);
  }, [categories]);

  useEffect(() => {
    storage.setTransactions(transactions);
  }, [transactions]);

  useEffect(() => {
    storage.setAssets(assets);
  }, [assets]);

  useEffect(() => {
    storage.setSettings(settings);
  }, [settings]);

  // Quản lý Ngân hàng / Nguồn tiền
  const addBank = useCallback((bankData: Omit<BankAccount, 'id' | 'createdAt'>) => {
    const newBank: BankAccount = {
      ...bankData,
      id: 'bank_' + Date.now().toString(36) + Math.random().toString(36).substring(2, 6),
      createdAt: new Date().toISOString(),
    };
    setBanks((prev) => [...prev, newBank]);
    return newBank;
  }, []);

  const updateBank = useCallback((id: string, updates: Partial<BankAccount>) => {
    setBanks((prev) =>
      prev.map((b) => (b.id === id ? { ...b, ...updates } : b))
    );
  }, []);

  const deleteBank = useCallback((id: string) => {
    setBanks((prev) => prev.filter((b) => b.id !== id));
  }, []);

  // Quản lý Vàng & Chứng Chỉ Quỹ
  const addAsset = useCallback((assetData: Omit<InvestmentAsset, 'id' | 'updatedAt'>) => {
    const newAsset: InvestmentAsset = {
      ...assetData,
      id: 'asset_' + Date.now().toString(36) + Math.random().toString(36).substring(2, 6),
      updatedAt: new Date().toISOString(),
    };
    setAssets((prev) => [...prev, newAsset]);
    return newAsset;
  }, []);

  const updateAsset = useCallback((id: string, updates: Partial<InvestmentAsset>) => {
    setAssets((prev) =>
      prev.map((a) => (a.id === id ? { ...a, ...updates, updatedAt: new Date().toISOString() } : a))
    );
  }, []);

  const deleteAsset = useCallback((id: string) => {
    setAssets((prev) => prev.filter((a) => a.id !== id));
  }, []);

  // Quản lý Giao dịch Thu / Chi
  const addTransaction = useCallback((txData: Omit<Transaction, 'id' | 'createdAt'>) => {
    const newTx: Transaction = {
      ...txData,
      id: 'tx_' + Date.now().toString(36) + Math.random().toString(36).substring(2, 6),
      createdAt: new Date().toISOString(),
    };
    setTransactions((prev) => [newTx, ...prev]);
    return newTx;
  }, []);

  const updateTransaction = useCallback((id: string, updates: Partial<Transaction>) => {
    setTransactions((prev) =>
      prev.map((t) => (t.id === id ? { ...t, ...updates } : t))
    );
  }, []);

  const deleteTransaction = useCallback((id: string) => {
    setTransactions((prev) => prev.filter((t) => t.id !== id));
  }, []);

  // Cài đặt & Mã PIN
  const updateSettings = useCallback((updates: Partial<AppSettings>) => {
    setSettings((prev) => ({ ...prev, ...updates }));
  }, []);

  const toggleHideBalance = useCallback(() => {
    setSettings((prev) => ({ ...prev, isBalanceHidden: !prev.isBalanceHidden }));
  }, []);

  const setPinCode = useCallback((pin: string) => {
    setSettings((prev) => ({
      ...prev,
      isPinEnabled: true,
      pinCode: pin,
    }));
    setIsLocked(false);
  }, []);

  const disablePin = useCallback(() => {
    setSettings((prev) => ({
      ...prev,
      isPinEnabled: false,
      pinCode: '',
    }));
    setIsLocked(false);
  }, []);

  const unlockApp = useCallback((inputPin?: string, isBiometric?: boolean): boolean => {
    if (!settings.isPinEnabled || isBiometric || inputPin === settings.pinCode) {
      setIsLocked(false);
      return true;
    }
    return false;
  }, [settings.isPinEnabled, settings.pinCode]);

  const toggleBiometric = useCallback((enabled: boolean) => {
    setSettings((prev) => ({ ...prev, isBiometricEnabled: enabled }));
  }, []);

  const lockApp = useCallback(() => {
    if (settings.isPinEnabled && settings.pinCode) {
      setIsLocked(true);
    }
  }, [settings.isPinEnabled, settings.pinCode]);

  // Sao lưu & Phục hồi
  const exportData = useCallback(() => {
    return storage.exportAllData();
  }, []);

  const importData = useCallback((jsonStr: string): boolean => {
    const success = storage.importAllData(jsonStr);
    if (success) {
      setBanks(storage.getBanks());
      setCategories(storage.getCategories());
      setTransactions(storage.getTransactions());
      setAssets(storage.getAssets());
      setSettings(storage.getSettings());
    }
    return success;
  }, []);

  const resetAllData = useCallback(() => {
    storage.resetAll();
    setBanks(storage.getBanks());
    setCategories(storage.getCategories());
    setTransactions([]);
    setAssets(storage.getAssets());
    setSettings(storage.getSettings());
    setIsLocked(false);
  }, []);

  // Tính toán số dư các bank
  const rawBankStats = useMemo(() => {
    return calculateBankBalances(banks, transactions);
  }, [banks, transactions]);

  // Thống kê tài sản đầu tư (Vàng & CCQ)
  const assetStats = useMemo(() => {
    return calculateAssetStats(assets);
  }, [assets]);

  // Tổng tài sản thực tế (Bank/Ví + Vàng + Chứng chỉ quỹ)
  const bankStats = useMemo(() => {
    return {
      ...rawBankStats,
      totalNetWorth: rawBankStats.totalNetWorth + assetStats.totalAssetValue,
      cashBankTotal: rawBankStats.totalNetWorth,
    };
  }, [rawBankStats, assetStats]);

  // Snapshot dòng tiền của tháng được chọn
  const monthlySnapshot = useMemo(() => {
    return calculateMonthlySnapshot(selectedMonthKey, banks, transactions);
  }, [selectedMonthKey, banks, transactions]);

  // Snapshot dòng tiền của tháng hiện tại (dùng cho Dashboard)
  const currentMonthKey = useMemo(() => getCurrentMonthKey(), []);
  const currentMonthSnapshot = useMemo(() => {
    return calculateMonthlySnapshot(currentMonthKey, banks, transactions);
  }, [currentMonthKey, banks, transactions]);

  // Phân bổ danh mục của tháng được chọn
  const expenseBreakdown = useMemo(() => {
    return calculateCategoryBreakdown(selectedMonthKey, 'expense', categories, transactions);
  }, [selectedMonthKey, categories, transactions]);

  const incomeBreakdown = useMemo(() => {
    return calculateCategoryBreakdown(selectedMonthKey, 'income', categories, transactions);
  }, [selectedMonthKey, categories, transactions]);

  // Danh sách giao dịch của tháng được chọn
  const selectedMonthTransactions = useMemo(() => {
    return transactions.filter(
      (t) => t.date && t.date.substring(0, 7) === selectedMonthKey
    );
  }, [transactions, selectedMonthKey]);

  return {
    banks,
    categories,
    transactions,
    assets,
    settings,
    activeTab,
    setActiveTab,
    selectedMonthKey,
    setSelectedMonthKey,
    isLocked,
    setIsLocked,

    // Stats
    bankStats,
    assetStats,
    monthlySnapshot,
    currentMonthSnapshot,
    expenseBreakdown,
    incomeBreakdown,
    selectedMonthTransactions,

    // Actions
    addBank,
    updateBank,
    deleteBank,
    addAsset,
    updateAsset,
    deleteAsset,
    addTransaction,
    updateTransaction,
    deleteTransaction,
    updateSettings,
    toggleHideBalance,
    setPinCode,
    disablePin,
    unlockApp,
    toggleBiometric,
    lockApp,
    exportData,
    importData,
    resetAllData,
  };
}
