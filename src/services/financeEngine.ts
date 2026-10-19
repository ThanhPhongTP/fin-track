import type { BankAccount, Category, MonthlySnapshot, Transaction, BankBalance, InvestmentAsset } from '../types/finance.ts';

export const DEFAULT_CATEGORIES: Category[] = [
  // Expense categories
  { id: 'exp_cash', name: 'Rút tiền mặt chi tiêu', type: 'expense', icon: 'Banknote', color: '#10b981' },
  { id: 'exp_food', name: 'Ăn uống & Cà phê', type: 'expense', icon: 'Utensils', color: '#f59e0b' },
  { id: 'exp_housing', name: 'Nhà cửa & Điện nước', type: 'expense', icon: 'Home', color: '#6366f1' },
  { id: 'exp_transport', name: 'Đi lại & Xăng xe', type: 'expense', icon: 'Car', color: '#3b82f6' },
  { id: 'exp_shopping', name: 'Mua sắm cá nhân', type: 'expense', icon: 'ShoppingBag', color: '#ec4899' },
  { id: 'exp_entertainment', name: 'Giải trí & Bạn bè', type: 'expense', icon: 'Gamepad2', color: '#8b5cf6' },
  { id: 'exp_health', name: 'Y tế & Sức khỏe', type: 'expense', icon: 'HeartPulse', color: '#ef4444' },
  { id: 'exp_education', name: 'Học tập & Tri thức', type: 'expense', icon: 'GraduationCap', color: '#06b6d4' },
  { id: 'exp_family', name: 'Gia đình & Người thân', type: 'expense', icon: 'Users', color: '#14b8a6' },
  { id: 'exp_other', name: 'Chi phí khác', type: 'expense', icon: 'CircleEllipsis', color: '#64748b' },

  // Income categories
  { id: 'inc_salary', name: 'Lương chính', type: 'income', icon: 'Briefcase', color: '#10b981' },
  { id: 'inc_bonus', name: 'Thưởng & Làm thêm', type: 'income', icon: 'Gift', color: '#06b6d4' },
  { id: 'inc_investment', name: 'Lãi & Đầu tư', type: 'income', icon: 'TrendingUp', color: '#8b5cf6' },
  { id: 'inc_business', name: 'Kinh doanh & Bán hàng', type: 'income', icon: 'Store', color: '#f59e0b' },
  { id: 'inc_gift', name: 'Được cho / Biếu tặng', type: 'income', icon: 'Smile', color: '#ec4899' },
  { id: 'inc_other', name: 'Thu nhập khác', type: 'income', icon: 'PlusCircle', color: '#3b82f6' },
];

export const INITIAL_SAMPLE_BANKS: BankAccount[] = [
  {
    id: 'bank_vcb',
    name: 'Vietcombank',
    initialBalance: 30000000,
    color: '#008453',
    accountNumber: '**** 8868',
    createdAt: new Date().toISOString(),
  },
  {
    id: 'bank_tcb',
    name: 'Techcombank',
    initialBalance: 15000000,
    color: '#e01a22',
    accountNumber: '**** 1902',
    createdAt: new Date().toISOString(),
  },
  {
    id: 'bank_cash',
    name: 'Ví tiền mặt',
    initialBalance: 5000000,
    color: '#0d9488',
    accountNumber: 'Ví mang theo',
    createdAt: new Date().toISOString(),
  },
];

export const INITIAL_SAMPLE_ASSETS: InvestmentAsset[] = [
  {
    id: 'asset_gold_1',
    name: 'Vàng nhẫn 9999',
    type: 'gold',
    quantity: 1,
    unit: 'chỉ',
    currentValue: 8200000,
    purchaseValue: 8000000,
    note: 'Tích trữ dài hạn',
    updatedAt: new Date().toISOString(),
  },
  {
    id: 'asset_fund_1',
    name: 'Chứng chỉ quỹ DCDS',
    type: 'fund',
    quantity: 500,
    unit: 'CCQ',
    currentValue: 15000000,
    purchaseValue: 14000000,
    note: 'Quỹ mở Dragon Capital',
    updatedAt: new Date().toISOString(),
  },
];

export interface AssetProfitLoss {
  hasPurchaseValue: boolean;
  diffAmount: number;
  diffPercent: number;
  isProfit: boolean;
  isLoss: boolean;
  isNeutral: boolean;
}

/**
 * Tính toán Lời/Lỗ cho từng tài sản Vàng hoặc Chứng chỉ quỹ
 */
export function calculateAssetProfitLoss(asset: InvestmentAsset): AssetProfitLoss {
  const current = Number(asset.currentValue) || 0;
  const purchase = asset.purchaseValue !== undefined && asset.purchaseValue !== null && asset.purchaseValue > 0
    ? Number(asset.purchaseValue)
    : null;

  if (purchase === null) {
    return {
      hasPurchaseValue: false,
      diffAmount: 0,
      diffPercent: 0,
      isProfit: false,
      isLoss: false,
      isNeutral: true,
    };
  }

  const diffAmount = current - purchase;
  const diffPercent = (diffAmount / purchase) * 100;

  return {
    hasPurchaseValue: true,
    diffAmount,
    diffPercent,
    isProfit: diffAmount > 0,
    isLoss: diffAmount < 0,
    isNeutral: diffAmount === 0,
  };
}

/**
 * Tính tổng giá trị Vàng, Chứng chỉ quỹ, vốn đầu tư và tổng lời/lỗ
 */
export function calculateAssetStats(assets: InvestmentAsset[]): {
  totalAssetValue: number;
  totalGoldValue: number;
  totalFundValue: number;
  goldCount: number;
  fundCount: number;
  totalPurchaseValue: number;
  totalProfitLoss: number;
  totalProfitLossPercent: number;
  hasAnyPurchaseValue: boolean;
} {
  let totalGoldValue = 0;
  let totalFundValue = 0;
  let goldCount = 0;
  let fundCount = 0;
  let totalPurchaseValue = 0;
  let totalCurrentForPurchased = 0;
  let hasAnyPurchaseValue = false;

  for (const asset of assets) {
    const val = Number(asset.currentValue) || 0;
    if (asset.type === 'gold') {
      totalGoldValue += val;
      goldCount++;
    } else if (asset.type === 'fund') {
      totalFundValue += val;
      fundCount++;
    }

    if (asset.purchaseValue && asset.purchaseValue > 0) {
      hasAnyPurchaseValue = true;
      totalPurchaseValue += Number(asset.purchaseValue);
      totalCurrentForPurchased += val;
    }
  }

  const totalAssetValue = totalGoldValue + totalFundValue;
  const totalProfitLoss = totalCurrentForPurchased - totalPurchaseValue;
  const totalProfitLossPercent = totalPurchaseValue > 0 ? (totalProfitLoss / totalPurchaseValue) * 100 : 0;

  return {
    totalAssetValue,
    totalGoldValue,
    totalFundValue,
    goldCount,
    fundCount,
    totalPurchaseValue,
    totalProfitLoss,
    totalProfitLossPercent,
    hasAnyPurchaseValue,
  };
}

/**
 * Tính toán số dư hiện tại của từng ngân hàng và toàn bộ tài sản
 */
export function calculateBankBalances(
  banks: BankAccount[],
  transactions: Transaction[]
): {
  balances: BankBalance[];
  totalInitial: number;
  totalNetWorth: number;
  totalAllIncome: number;
  totalAllExpense: number;
} {
  let totalInitial = 0;
  let totalNetWorth = 0;
  let totalAllIncome = 0;
  let totalAllExpense = 0;

  const balances: BankBalance[] = banks.map((bank) => {
    totalInitial += bank.initialBalance;

    const bankTransactions = transactions.filter((t) => t.bankId === bank.id);
    const totalIncome = bankTransactions
      .filter((t) => t.type === 'income')
      .reduce((sum, t) => sum + (Number(t.amount) || 0), 0);
    const totalExpense = bankTransactions
      .filter((t) => t.type === 'expense')
      .reduce((sum, t) => sum + (Number(t.amount) || 0), 0);

    const currentBalance = bank.initialBalance + totalIncome - totalExpense;
    totalNetWorth += currentBalance;
    totalAllIncome += totalIncome;
    totalAllExpense += totalExpense;

    return {
      bank,
      currentBalance,
      totalIncome,
      totalExpense,
    };
  });

  return {
    balances,
    totalInitial,
    totalNetWorth,
    totalAllIncome,
    totalAllExpense,
  };
}

/**
 * Tính toán snapshot dòng tiền của 1 tháng cụ thể:
 * - Số dư đầu tháng = Tổng vốn ban đầu + (Tổng thu trước tháng này) - (Tổng chi trước tháng này)
 * - Thu trong tháng
 * - Chi trong tháng
 * - Số dư cuối tháng = Số dư đầu tháng + Thu trong tháng - Chi trong tháng
 */
export function calculateMonthlySnapshot(
  targetMonthKey: string, // YYYY-MM
  banks: BankAccount[],
  transactions: Transaction[]
): MonthlySnapshot {
  const [yearStr, monthStr] = targetMonthKey.split('-');
  const year = parseInt(yearStr, 10) || new Date().getFullYear();
  const month = parseInt(monthStr, 10) || new Date().getMonth() + 1;

  const initialTotalBalance = banks.reduce(
    (sum, bank) => sum + (Number(bank.initialBalance) || 0),
    0
  );

  let prevIncome = 0;
  let prevExpense = 0;
  let monthIncome = 0;
  let monthExpense = 0;
  let transactionCount = 0;

  for (const t of transactions) {
    const tMonthKey = t.date ? t.date.substring(0, 7) : '';
    const amount = Number(t.amount) || 0;

    if (tMonthKey < targetMonthKey) {
      if (t.type === 'income') prevIncome += amount;
      else if (t.type === 'expense') prevExpense += amount;
    } else if (tMonthKey === targetMonthKey) {
      transactionCount++;
      if (t.type === 'income') monthIncome += amount;
      else if (t.type === 'expense') monthExpense += amount;
    }
  }

  const openingBalance = initialTotalBalance + prevIncome - prevExpense;
  const netSavings = monthIncome - monthExpense;
  const closingBalance = openingBalance + netSavings;

  return {
    monthKey: targetMonthKey,
    year,
    month,
    openingBalance,
    totalIncome: monthIncome,
    totalExpense: monthExpense,
    netSavings,
    closingBalance,
    transactionCount,
  };
}

export interface CategoryBreakdownItem {
  category: Category;
  amount: number;
  percentage: number;
  count: number;
}

/**
 * Phân bổ chi tiêu hoặc thu nhập theo hạng mục trong tháng
 */
export function calculateCategoryBreakdown(
  targetMonthKey: string,
  type: 'expense' | 'income',
  categories: Category[],
  transactions: Transaction[]
): CategoryBreakdownItem[] {
  const monthTransactions = transactions.filter(
    (t) => t.type === type && t.date && t.date.substring(0, 7) === targetMonthKey
  );

  const totalAmount = monthTransactions.reduce(
    (sum, t) => sum + (Number(t.amount) || 0),
    0
  );

  const categoryMap = new Map<string, { amount: number; count: number }>();

  for (const t of monthTransactions) {
    const current = categoryMap.get(t.categoryId) || { amount: 0, count: 0 };
    current.amount += Number(t.amount) || 0;
    current.count += 1;
    categoryMap.set(t.categoryId, current);
  }

  const items: CategoryBreakdownItem[] = [];

  categoryMap.forEach((val, catId) => {
    const cat = categories.find((c) => c.id === catId) || {
      id: catId,
      name: catId === 'exp_cash' ? 'Rút tiền mặt chi tiêu' : 'Khác',
      type,
      icon: 'CircleEllipsis',
      color: '#94a3b8',
    };

    items.push({
      category: cat,
      amount: val.amount,
      percentage: totalAmount > 0 ? (val.amount / totalAmount) * 100 : 0,
      count: val.count,
    });
  });

  return items.sort((a, b) => b.amount - a.amount);
}

/**
 * Định dạng tiền tệ VND đẹp mắt
 */
export function formatVND(amount: number, hide = false): string {
  if (hide) return '•••••••• đ';
  const rounded = Math.round(amount);
  return `${new Intl.NumberFormat('vi-VN').format(rounded)} ₫`;
}

/**
 * Format label hiển thị tháng (VD: "2026-03" -> "Tháng 03/2026")
 */
export function formatMonthLabel(monthKey: string): string {
  if (!monthKey || !monthKey.includes('-')) return '';
  const [y, m] = monthKey.split('-');
  return `Tháng ${m}/${y}`;
}

/**
 * Format ngày hiển thị tiếng Việt (VD: "2026-03-15" -> "15/03/2026")
 */
export function formatDisplayDate(dateStr: string): string {
  if (!dateStr) return '';
  const parts = dateStr.split('-');
  if (parts.length !== 3) return dateStr;
  return `${parts[2]}/${parts[1]}/${parts[0]}`;
}

/**
 * Lấy monthKey hiện tại (YYYY-MM)
 */
export function getCurrentMonthKey(): string {
  const now = new Date();
  const y = now.getFullYear();
  const m = String(now.getMonth() + 1).padStart(2, '0');
  return `${y}-${m}`;
}

/**
 * Lấy ngày hôm nay (YYYY-MM-DD)
 */
export function getTodayDateString(): string {
  const now = new Date();
  const y = now.getFullYear();
  const m = String(now.getMonth() + 1).padStart(2, '0');
  const d = String(now.getDate()).padStart(2, '0');
  return `${y}-${m}-${d}`;
}

/**
 * Chuyển đổi tháng trước / tháng sau
 */
export function shiftMonthKey(monthKey: string, delta: number): string {
  const [y, m] = monthKey.split('-').map(Number);
  const date = new Date(y, m - 1 + delta, 1);
  const newY = date.getFullYear();
  const newM = String(date.getMonth() + 1).padStart(2, '0');
  return `${newY}-${newM}`;
}
