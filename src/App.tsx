import React, { useState, useEffect, useCallback } from 'react';
import { useFinTrack } from './hooks/useFinTrack.ts';
import { Header } from './components/common/Header.tsx';
import { Navbar } from './components/common/Navbar.tsx';
import { PinLockModal } from './components/auth/PinLockModal.tsx';
import { TransactionModal } from './components/modals/TransactionModal.tsx';
import { BankModal } from './components/modals/BankModal.tsx';
import { AssetModal } from './components/modals/AssetModal.tsx';
import { SettingsModal } from './components/modals/SettingsModal.tsx';
import { DashboardView } from './views/DashboardView.tsx';
import { TransactionsView } from './views/TransactionsView.tsx';
import { MonthlyAnalyticsView } from './views/MonthlyAnalyticsView.tsx';
import { nativeService } from './services/nativeService.ts';
import type { BankAccount, Transaction, InvestmentAsset, AssetType } from './types/finance.ts';

export const App: React.FC = () => {
  const {
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
    bankStats,
    assetStats,
    monthlySnapshot,
    currentMonthSnapshot,
    expenseBreakdown,
    incomeBreakdown,
    selectedMonthTransactions,
    addBank,
    updateBank,
    deleteBank,
    addAsset,
    updateAsset,
    deleteAsset,
    addTransaction,
    updateTransaction,
    deleteTransaction,
    toggleHideBalance,
    setPinCode,
    disablePin,
    unlockApp,
    toggleBiometric,
    lockApp,
    exportData,
    importData,
    resetAllData,
  } = useFinTrack();

  // Quản lý Modals
  const [isTransactionModalOpen, setIsTransactionModalOpen] = useState<boolean>(false);
  const [editingTransaction, setEditingTransaction] = useState<Transaction | null>(null);

  const [isBankModalOpen, setIsBankModalOpen] = useState<boolean>(false);
  const [editingBank, setEditingBank] = useState<BankAccount | null>(null);

  const [isAssetModalOpen, setIsAssetModalOpen] = useState<boolean>(false);
  const [editingAsset, setEditingAsset] = useState<InvestmentAsset | null>(null);
  const [defaultAssetType, setDefaultAssetType] = useState<AssetType>('gold');

  const [isSettingsModalOpen, setIsSettingsModalOpen] = useState<boolean>(false);

  // Khởi tạo native service (Status bar, Android Back button)
  useEffect(() => {
    nativeService.init();
  }, []);

  // Đăng ký xử lý nút BACK (Cả phím Back cứng Android & phím ESC)
  const handleBackAction = useCallback((): boolean => {
    // 1. Ưu tiên đóng Modal nếu đang mở
    if (isTransactionModalOpen) {
      setIsTransactionModalOpen(false);
      setEditingTransaction(null);
      return true;
    }
    if (isBankModalOpen) {
      setIsBankModalOpen(false);
      setEditingBank(null);
      return true;
    }
    if (isAssetModalOpen) {
      setIsAssetModalOpen(false);
      setEditingAsset(null);
      return true;
    }
    if (isSettingsModalOpen) {
      setIsSettingsModalOpen(false);
      return true;
    }

    // 2. Nếu đang ở màn hình con (Thu & Chi hoặc Thống kê) -> Quay về Trang Chủ
    if (activeTab !== 'dashboard') {
      setActiveTab('dashboard');
      return true;
    }

    // 3. Đang ở Trang Chủ và không có modal nào mở -> Không can thiệp (để thoát app tự nhiên)
    return false;
  }, [
    isTransactionModalOpen,
    isBankModalOpen,
    isAssetModalOpen,
    isSettingsModalOpen,
    activeTab,
    setActiveTab,
  ]);

  useEffect(() => {
    const unregister = nativeService.registerBackButtonHandler({
      canHandle: () =>
        isTransactionModalOpen ||
        isBankModalOpen ||
        isAssetModalOpen ||
        isSettingsModalOpen ||
        activeTab !== 'dashboard',
      handle: () => {
        handleBackAction();
      },
    });

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        handleBackAction();
      }
    };
    window.addEventListener('keydown', handleKeyDown);

    return () => {
      unregister();
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [
    handleBackAction,
    isTransactionModalOpen,
    isBankModalOpen,
    isAssetModalOpen,
    isSettingsModalOpen,
    activeTab,
  ]);

  // Handlers cho Giao Dịch
  const handleOpenAddTransaction = () => {
    setEditingTransaction(null);
    setIsTransactionModalOpen(true);
  };

  const handleEditTransaction = (tx: Transaction) => {
    setEditingTransaction(tx);
    setIsTransactionModalOpen(true);
  };

  const handleSaveTransaction = (txData: {
    type: any;
    bankId: string;
    amount: number;
    categoryId: string;
    date: string;
    note?: string;
  }) => {
    if (editingTransaction) {
      updateTransaction(editingTransaction.id, txData);
    } else {
      addTransaction(txData);
    }
  };

  // Handlers cho Ngân Hàng
  const handleOpenAddBank = () => {
    setEditingBank(null);
    setIsBankModalOpen(true);
  };

  const handleEditBank = (bank: BankAccount) => {
    setEditingBank(bank);
    setIsBankModalOpen(true);
  };

  const handleSaveBank = (bankData: {
    name: string;
    initialBalance: number;
    color: string;
    accountNumber?: string;
  }) => {
    if (editingBank) {
      updateBank(editingBank.id, bankData);
    } else {
      addBank(bankData);
    }
  };

  // Handlers cho Vàng & CCQ
  const handleOpenAddAsset = (prefType: AssetType = 'gold') => {
    setEditingAsset(null);
    setDefaultAssetType(prefType);
    setIsAssetModalOpen(true);
  };

  const handleEditAsset = (asset: InvestmentAsset) => {
    setEditingAsset(asset);
    setDefaultAssetType(asset.type);
    setIsAssetModalOpen(true);
  };

  const handleSaveAsset = (assetData: {
    name: string;
    type: AssetType;
    quantity: number;
    unit: string;
    currentValue: number;
    purchaseValue?: number;
    note?: string;
  }) => {
    if (editingAsset) {
      updateAsset(editingAsset.id, assetData);
    } else {
      addAsset(assetData);
    }
  };

  return (
    <div className="app-container">
      {/* 1. MÀN HÌNH KHÓA MÃ PIN (Nếu bật mã khóa) */}
      <PinLockModal
        isOpen={isLocked}
        currentPin={settings.pinCode}
        isPinConfigured={settings.isPinEnabled && Boolean(settings.pinCode)}
        isBiometricEnabled={settings.isBiometricEnabled !== false}
        onUnlock={unlockApp}
        onSetNewPin={setPinCode}
      />

      {/* 2. HEADER TOP VỚI NÚT BACK CHO MÀN HÌNH CON & SAFE AREA */}
      <Header
        activeTab={activeTab}
        onBackToDashboard={() => setActiveTab('dashboard')}
        isPinEnabled={settings.isPinEnabled}
        isBalanceHidden={settings.isBalanceHidden}
        onToggleHideBalance={toggleHideBalance}
        onLockApp={lockApp}
        onOpenSettings={() => setIsSettingsModalOpen(true)}
      />

      {/* 3. NỘI DUNG THEO MÀN HÌNH HIỆN TẠI */}
      <main style={{ flex: 1 }}>
        {activeTab === 'dashboard' && (
          <DashboardView
            bankStats={bankStats}
            assetStats={assetStats}
            assets={assets}
            currentMonthSnapshot={currentMonthSnapshot}
            recentTransactions={transactions}
            categories={categories}
            isBalanceHidden={settings.isBalanceHidden}
            onOpenAddTransaction={handleOpenAddTransaction}
            onOpenAddBank={handleOpenAddBank}
            onEditBank={handleEditBank}
            onOpenAddAsset={() => handleOpenAddAsset('gold')}
            onEditAsset={handleEditAsset}
            onNavigateToTransactions={() => setActiveTab('transactions')}
          />
        )}

        {activeTab === 'transactions' && (
          <TransactionsView
            transactions={transactions}
            banks={banks}
            categories={categories}
            isBalanceHidden={settings.isBalanceHidden}
            onOpenAddModal={handleOpenAddTransaction}
            onEditTransaction={handleEditTransaction}
            onDeleteTransaction={deleteTransaction}
          />
        )}

        {activeTab === 'analytics' && (
          <MonthlyAnalyticsView
            selectedMonthKey={selectedMonthKey}
            onSelectMonthKey={setSelectedMonthKey}
            monthlySnapshot={monthlySnapshot}
            expenseBreakdown={expenseBreakdown}
            incomeBreakdown={incomeBreakdown}
            monthTransactions={selectedMonthTransactions}
            categories={categories}
            banks={banks}
            isBalanceHidden={settings.isBalanceHidden}
          />
        )}
      </main>

      {/* 4. THANH ĐIỀU HƯỚNG NAVBAR DƯỚI ĐÁY VỚI SAFE AREA */}
      <Navbar
        activeTab={activeTab}
        onSelectTab={setActiveTab}
        onQuickAdd={handleOpenAddTransaction}
      />

      {/* 5. CÁC MODAL HỆ THỐNG */}
      <TransactionModal
        isOpen={isTransactionModalOpen}
        onClose={() => {
          setIsTransactionModalOpen(false);
          setEditingTransaction(null);
        }}
        onSave={handleSaveTransaction}
        banks={banks}
        categories={categories}
        initialData={editingTransaction}
      />

      <BankModal
        isOpen={isBankModalOpen}
        onClose={() => {
          setIsBankModalOpen(false);
          setEditingBank(null);
        }}
        onSave={handleSaveBank}
        onDelete={deleteBank}
        initialData={editingBank}
      />

      <AssetModal
        isOpen={isAssetModalOpen}
        onClose={() => {
          setIsAssetModalOpen(false);
          setEditingAsset(null);
        }}
        onSave={handleSaveAsset}
        onDelete={deleteAsset}
        initialData={editingAsset}
        defaultType={defaultAssetType}
      />

      <SettingsModal
        isOpen={isSettingsModalOpen}
        onClose={() => setIsSettingsModalOpen(false)}
        settings={settings}
        onSetPin={setPinCode}
        onDisablePin={disablePin}
        onToggleBiometric={toggleBiometric}
        onExport={exportData}
        onImport={importData}
        onReset={resetAllData}
      />
    </div>
  );
};

export default App;
