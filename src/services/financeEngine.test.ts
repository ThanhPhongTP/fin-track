import test from 'node:test';
import assert from 'node:assert/strict';
import {
  calculateBankBalances,
  calculateMonthlySnapshot,
  calculateCategoryBreakdown,
  shiftMonthKey,
  calculateAssetStats,
  calculateAssetProfitLoss,
  DEFAULT_CATEGORIES
} from './financeEngine.ts';
import type { BankAccount, Transaction, InvestmentAsset } from '../types/finance.ts';

test('FinTrack Core Scenario: T1 50Tr tiêu 5Tr -> 45Tr; T2 tiêu 7Tr -> 38Tr; T1 cố định 45Tr', () => {
  const banks: BankAccount[] = [
    {
      id: 'vcb',
      name: 'Vietcombank',
      initialBalance: 30000000,
      color: '#008453',
      createdAt: '2026-01-01',
    },
    {
      id: 'tcb',
      name: 'Techcombank',
      initialBalance: 20000000,
      color: '#e01a22',
      createdAt: '2026-01-01',
    },
  ];

  const transactions: Transaction[] = [
    // Tháng 1: tiêu 5Tr
    {
      id: 'tx-1',
      type: 'expense',
      bankId: 'vcb',
      amount: 5000000,
      categoryId: 'exp_food',
      date: '2026-01-15',
      note: 'Ăn uống T1',
      createdAt: '2026-01-15',
    },
    // Tháng 2: tiêu 7Tr
    {
      id: 'tx-2',
      type: 'expense',
      bankId: 'tcb',
      amount: 7000000,
      categoryId: 'exp_shopping',
      date: '2026-02-10',
      note: 'Mua sắm T2',
      createdAt: '2026-02-10',
    },
  ];

  // Kiểm tra Tháng 1 (2026-01)
  const snapT1 = calculateMonthlySnapshot('2026-01', banks, transactions);
  assert.equal(snapT1.openingBalance, 50000000, 'Đầu T1 phải là 50 triệu');
  assert.equal(snapT1.totalExpense, 5000000, 'Chi T1 là 5 triệu');
  assert.equal(snapT1.closingBalance, 45000000, 'Cuối T1 phải là 45 triệu');

  // Kiểm tra Tháng 2 (2026-02)
  const snapT2 = calculateMonthlySnapshot('2026-02', banks, transactions);
  assert.equal(snapT2.openingBalance, 45000000, 'Đầu T2 kế thừa 45 triệu từ cuối T1');
  assert.equal(snapT2.totalExpense, 7000000, 'Chi T2 là 7 triệu');
  assert.equal(snapT2.closingBalance, 38000000, 'Cuối T2 còn 38 triệu');

  // Quay lại kiểm tra Tháng 1 vẫn bất biến 45 triệu
  const snapT1Again = calculateMonthlySnapshot('2026-01', banks, transactions);
  assert.equal(snapT1Again.closingBalance, 45000000, 'Quay lại T1 vẫn hiển thị cố định 45 triệu');

  // Kiểm tra số dư theo từng bank hiện tại
  const { balances, totalNetWorth } = calculateBankBalances(banks, transactions);
  assert.equal(totalNetWorth, 38000000, 'Tổng tài sản hiện tại là 38 triệu');

  const vcbBalance = balances.find((b) => b.bank.id === 'vcb');
  assert.equal(vcbBalance?.currentBalance, 25000000, 'VCB ban đầu 30tr - 5tr = 25tr');

  const tcbBalance = balances.find((b) => b.bank.id === 'tcb');
  assert.equal(tcbBalance?.currentBalance, 13000000, 'TCB ban đầu 20tr - 7tr = 13tr');
});

test('FinTrack Thu Nhập (Income) và Rút tiền mặt (Cash Withdrawal)', () => {
  const banks: BankAccount[] = [
    {
      id: 'vcb',
      name: 'Vietcombank',
      initialBalance: 50000000,
      color: '#008453',
      createdAt: '2026-01-01',
    },
  ];

  const transactions: Transaction[] = [
    // Nhận lương 25Tr
    {
      id: 'tx-inc',
      type: 'income',
      bankId: 'vcb',
      amount: 25000000,
      categoryId: 'inc_salary',
      date: '2026-03-05',
      note: 'Lương tháng 3',
      createdAt: '2026-03-05',
    },
    // Rút tiền mặt chi tiêu 5Tr
    {
      id: 'tx-cash',
      type: 'expense',
      bankId: 'vcb',
      amount: 5000000,
      categoryId: 'exp_cash',
      date: '2026-03-10',
      note: 'Rút ATM chi tiêu vặt',
      createdAt: '2026-03-10',
    },
  ];

  const snapT3 = calculateMonthlySnapshot('2026-03', banks, transactions);
  assert.equal(snapT3.openingBalance, 50000000);
  assert.equal(snapT3.totalIncome, 25000000);
  assert.equal(snapT3.totalExpense, 5000000);
  assert.equal(snapT3.netSavings, 20000000);
  assert.equal(snapT3.closingBalance, 70000000);

  // Phân bổ danh mục chi tiêu
  const breakdown = calculateCategoryBreakdown('2026-03', 'expense', DEFAULT_CATEGORIES, transactions);
  assert.equal(breakdown.length, 1);
  assert.equal(breakdown[0].category.id, 'exp_cash');
  assert.equal(breakdown[0].amount, 5000000);
  assert.equal(breakdown[0].percentage, 100);
});

test('shiftMonthKey hoạt động chuẩn xác qua năm', () => {
  assert.equal(shiftMonthKey('2026-01', -1), '2025-12');
  assert.equal(shiftMonthKey('2026-12', 1), '2027-01');
  assert.equal(shiftMonthKey('2026-03', 1), '2026-04');
});

test('Tính toán Lời/Lỗ Vàng và Chứng chỉ quỹ (Gold & Fund P/L)', () => {
  const goldAsset: InvestmentAsset = {
    id: 'gold_1',
    name: 'Vàng nhẫn 9999',
    type: 'gold',
    quantity: 2,
    unit: 'chỉ',
    currentValue: 16400000,
    purchaseValue: 16000000,
    updatedAt: '2026-03-01',
  };

  const plGold = calculateAssetProfitLoss(goldAsset);
  assert.equal(plGold.hasPurchaseValue, true);
  assert.equal(plGold.isProfit, true);
  assert.equal(plGold.diffAmount, 400000, 'Lời 400k');
  assert.equal(plGold.diffPercent, 2.5, 'Lời 2.5%');

  const fundLossAsset: InvestmentAsset = {
    id: 'fund_1',
    name: 'Quỹ Cổ Phiếu',
    type: 'fund',
    quantity: 1000,
    unit: 'CCQ',
    currentValue: 19000000,
    purchaseValue: 20000000,
    updatedAt: '2026-03-01',
  };

  const plFund = calculateAssetProfitLoss(fundLossAsset);
  assert.equal(plFund.hasPurchaseValue, true);
  assert.equal(plFund.isLoss, true);
  assert.equal(plFund.diffAmount, -1000000, 'Lỗ 1 triệu');
  assert.equal(plFund.diffPercent, -5, 'Lỗ -5%');

  const stats = calculateAssetStats([goldAsset, fundLossAsset]);
  assert.equal(stats.totalAssetValue, 35400000);
  assert.equal(stats.totalPurchaseValue, 36000000);
  assert.equal(stats.totalProfitLoss, -600000, 'Tổng danh mục lỗ 600k');
});
