import React, { useState, useMemo, useEffect } from 'react';
import {
  ChevronLeft,
  ChevronRight,
  TrendingUp,
  PieChart,
  Calendar,
  Layers,
  X,
} from 'lucide-react';
import type {
  MonthlySnapshot,
  Transaction,
  Category,
  BankAccount,
} from '../types/finance.ts';
import type { CategoryBreakdownItem } from '../services/financeEngine.ts';
import {
  formatVND,
  formatMonthLabel,
  shiftMonthKey,
  getCurrentMonthKey,
} from '../services/financeEngine.ts';
import { CategoryIcon } from '../components/common/CategoryIcon.tsx';
import { TransactionItem } from '../components/common/TransactionItem.tsx';

interface MonthlyAnalyticsViewProps {
  selectedMonthKey: string;
  onSelectMonthKey: (monthKey: string) => void;
  monthlySnapshot: MonthlySnapshot;
  expenseBreakdown: CategoryBreakdownItem[];
  incomeBreakdown: CategoryBreakdownItem[];
  monthTransactions: Transaction[];
  categories: Category[];
  banks: BankAccount[];
  isBalanceHidden: boolean;
  onEditTransaction?: (tx: Transaction) => void;
  onDeleteTransaction?: (id: string) => void;
}

export const MonthlyAnalyticsView: React.FC<MonthlyAnalyticsViewProps> = ({
  selectedMonthKey,
  onSelectMonthKey,
  monthlySnapshot,
  expenseBreakdown,
  incomeBreakdown,
  monthTransactions,
  categories,
  banks,
  isBalanceHidden,
  onEditTransaction,
  onDeleteTransaction,
}) => {
  const [selectedCategoryId, setSelectedCategoryId] = useState<string | null>(null);

  const currentMonthKey = getCurrentMonthKey();
  const isCurrentMonth = selectedMonthKey === currentMonthKey;

  // Khi đổi tháng, reset bộ lọc hạng mục đã chọn
  useEffect(() => {
    setSelectedCategoryId(null);
  }, [selectedMonthKey]);

  const handlePrevMonth = () => {
    onSelectMonthKey(shiftMonthKey(selectedMonthKey, -1));
  };

  const handleNextMonth = () => {
    onSelectMonthKey(shiftMonthKey(selectedMonthKey, 1));
  };

  const handleResetCurrentMonth = () => {
    onSelectMonthKey(currentMonthKey);
  };

  const handleToggleCategory = (catId: string) => {
    setSelectedCategoryId((prev) => (prev === catId ? null : catId));
  };

  const selectedCategory = useMemo(() => {
    if (!selectedCategoryId) return null;
    return categories.find((c) => c.id === selectedCategoryId) || null;
  }, [categories, selectedCategoryId]);

  // Danh sách giao dịch được lọc theo hạng mục nếu người dùng click chọn
  const displayedTransactions = useMemo(() => {
    if (!selectedCategoryId) return monthTransactions;
    return monthTransactions.filter((t) => t.categoryId === selectedCategoryId);
  }, [monthTransactions, selectedCategoryId]);

  const selectedCategoryTotal = useMemo(() => {
    if (!selectedCategoryId) return 0;
    return displayedTransactions.reduce((sum, t) => sum + (Number(t.amount) || 0), 0);
  }, [displayedTransactions, selectedCategoryId]);

  return (
    <div style={{ padding: '16px', display: 'flex', flexDirection: 'column', gap: '16px' }}>
      {/* Month Navigator */}
      <div
        className="glass-card"
        style={{
          padding: '12px 14px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
        }}
      >
        <button
          type="button"
          className="btn-icon"
          onClick={handlePrevMonth}
          title="Tháng trước"
          style={{ width: '34px', height: '34px' }}
        >
          <ChevronLeft size={18} />
        </button>

        <div style={{ textAlign: 'center' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px' }}>
            <Calendar size={15} color="#38bdf8" />
            <span style={{ fontSize: '1.05rem', fontWeight: 800, color: '#f8fafc', letterSpacing: '-0.01em' }}>
              {formatMonthLabel(selectedMonthKey)}
            </span>
          </div>
          {!isCurrentMonth && (
            <button
              type="button"
              onClick={handleResetCurrentMonth}
              style={{
                background: 'none',
                border: 'none',
                color: '#38bdf8',
                fontSize: '0.725rem',
                cursor: 'pointer',
                marginTop: '2px',
                textDecoration: 'underline',
              }}
            >
              Về tháng hiện tại
            </button>
          )}
        </div>

        <button
          type="button"
          className="btn-icon"
          onClick={handleNextMonth}
          title="Tháng sau"
          style={{ width: '34px', height: '34px' }}
        >
          <ChevronRight size={18} />
        </button>
      </div>

      {/* 4 DÒNG TIỀN CỐ ĐỊNH THEO THÁNG */}
      <div
        className="glass-card"
        style={{
          padding: '16px',
          display: 'flex',
          flexDirection: 'column',
          gap: '14px',
          background: 'linear-gradient(135deg, rgba(20, 27, 45, 0.95) 0%, rgba(12, 17, 29, 0.98) 100%)',
        }}
      >
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}>
          <span style={{ fontSize: '0.8rem', fontWeight: 700, color: '#94a3b8', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
            Dòng Tiền {formatMonthLabel(selectedMonthKey)}
          </span>
          <span
            style={{
              fontSize: '0.725rem',
              color: '#38bdf8',
              background: 'rgba(56, 189, 248, 0.1)',
              padding: '2px 8px',
              borderRadius: 'var(--radius-full)',
              border: '1px solid rgba(56, 189, 248, 0.2)',
            }}
          >
            {monthlySnapshot.transactionCount} giao dịch
          </span>
        </div>

        {/* Luồng 4 số liệu: Đầu tháng -> Thu -> Chi -> Cuối tháng */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '10px' }}>
          {/* 1. Số dư đầu kỳ */}
          <div
            style={{
              padding: '10px 12px',
              borderRadius: 'var(--radius-md)',
              background: 'rgba(255, 255, 255, 0.04)',
              border: '1px solid rgba(255, 255, 255, 0.06)',
              minWidth: 0,
            }}
          >
            <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)', marginBottom: '3px', fontWeight: 600 }}>
              ⚪ Đầu kỳ
            </div>
            <div
              style={{
                fontSize: 'clamp(0.95rem, 3.8vw, 1.15rem)',
                fontWeight: 700,
                color: '#f8fafc',
                fontFamily: 'var(--font-mono)',
                whiteSpace: 'nowrap',
                overflow: 'hidden',
                textOverflow: 'ellipsis',
              }}
              title={formatVND(monthlySnapshot.openingBalance, false)}
            >
              {formatVND(monthlySnapshot.openingBalance, isBalanceHidden)}
            </div>
            <span style={{ fontSize: '0.675rem', color: 'var(--text-muted)' }}>
              Từ các tháng trước
            </span>
          </div>

          {/* 2. Tổng thu trong tháng */}
          <div
            style={{
              padding: '10px 12px',
              borderRadius: 'var(--radius-md)',
              background: 'rgba(16, 185, 129, 0.08)',
              border: '1px solid rgba(16, 185, 129, 0.2)',
              minWidth: 0,
            }}
          >
            <div style={{ fontSize: '0.7rem', color: '#10b981', marginBottom: '3px', fontWeight: 600 }}>
              🟢 Tổng thu
            </div>
            <div
              style={{
                fontSize: 'clamp(0.95rem, 3.8vw, 1.15rem)',
                fontWeight: 700,
                color: '#10b981',
                fontFamily: 'var(--font-mono)',
                whiteSpace: 'nowrap',
                overflow: 'hidden',
                textOverflow: 'ellipsis',
              }}
              title={formatVND(monthlySnapshot.totalIncome, false)}
            >
              +{formatVND(monthlySnapshot.totalIncome, isBalanceHidden)}
            </div>
            <span style={{ fontSize: '0.675rem', color: 'var(--text-muted)' }}>
              Lương & thu nhập
            </span>
          </div>

          {/* 3. Tổng chi trong tháng */}
          <div
            style={{
              padding: '10px 12px',
              borderRadius: 'var(--radius-md)',
              background: 'rgba(244, 63, 94, 0.08)',
              border: '1px solid rgba(244, 63, 94, 0.2)',
              minWidth: 0,
            }}
          >
            <div style={{ fontSize: '0.7rem', color: '#f43f5e', marginBottom: '3px', fontWeight: 600 }}>
              🔴 Tổng chi
            </div>
            <div
              style={{
                fontSize: 'clamp(0.95rem, 3.8vw, 1.15rem)',
                fontWeight: 700,
                color: '#f43f5e',
                fontFamily: 'var(--font-mono)',
                whiteSpace: 'nowrap',
                overflow: 'hidden',
                textOverflow: 'ellipsis',
              }}
              title={formatVND(monthlySnapshot.totalExpense, false)}
            >
              -{formatVND(monthlySnapshot.totalExpense, isBalanceHidden)}
            </div>
            <span style={{ fontSize: '0.675rem', color: 'var(--text-muted)' }}>
              Tiêu dùng sinh hoạt
            </span>
          </div>

          {/* 4. Số dư cuối kỳ */}
          <div
            style={{
              padding: '10px 12px',
              borderRadius: 'var(--radius-md)',
              background: 'rgba(56, 189, 248, 0.1)',
              border: '1px solid rgba(56, 189, 248, 0.25)',
              minWidth: 0,
            }}
          >
            <div style={{ fontSize: '0.7rem', color: '#38bdf8', marginBottom: '3px', fontWeight: 600 }}>
              🔵 Cuối kỳ
            </div>
            <div
              style={{
                fontSize: 'clamp(0.95rem, 3.8vw, 1.15rem)',
                fontWeight: 800,
                color: '#38bdf8',
                fontFamily: 'var(--font-mono)',
                whiteSpace: 'nowrap',
                overflow: 'hidden',
                textOverflow: 'ellipsis',
              }}
              title={formatVND(monthlySnapshot.closingBalance, false)}
            >
              {formatVND(monthlySnapshot.closingBalance, isBalanceHidden)}
            </div>
            <span style={{ fontSize: '0.675rem', color: '#94a3b8' }}>
              Số dư chốt tháng
            </span>
          </div>
        </div>

        {/* Tích luỹ / Dòng tiền ròng (Net Savings) */}
        <div
          style={{
            padding: '10px 12px',
            borderRadius: 'var(--radius-md)',
            background: 'rgba(255, 255, 255, 0.03)',
            border: '1px solid rgba(255, 255, 255, 0.05)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            gap: '8px',
            flexWrap: 'wrap',
          }}
        >
          <span style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>
            Tích luỹ ròng (Thu - Chi):
          </span>
          <span
            style={{
              fontWeight: 800,
              fontSize: '0.95rem',
              fontFamily: 'var(--font-mono)',
              color: monthlySnapshot.netSavings >= 0 ? '#10b981' : '#f43f5e',
              background: monthlySnapshot.netSavings >= 0 ? 'rgba(16, 185, 129, 0.12)' : 'rgba(244, 63, 94, 0.12)',
              padding: '2px 8px',
              borderRadius: 'var(--radius-full)',
              border: `1px solid ${monthlySnapshot.netSavings >= 0 ? 'rgba(16, 185, 129, 0.25)' : 'rgba(244, 63, 94, 0.25)'}`,
            }}
          >
            {monthlySnapshot.netSavings >= 0 ? '+' : ''}
            {formatVND(monthlySnapshot.netSavings, isBalanceHidden)}
          </span>
        </div>
      </div>

      {/* PHÂN BỔ CHI TIÊU THEO HẠNG MỤC */}
      <div className="glass-card" style={{ padding: '16px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '14px', flexWrap: 'wrap', gap: '6px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <PieChart size={17} color="#f43f5e" />
            <h3 style={{ fontSize: '0.975rem', fontWeight: 700, color: '#f8fafc' }}>
              Phân Bổ Chi Tiêu Tháng Này
            </h3>
          </div>
          <span style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>
            Chạm vào hạng mục để lọc
          </span>
        </div>

        {expenseBreakdown.length === 0 ? (
          <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)', textAlign: 'center', padding: '16px' }}>
            Không có khoản chi nào trong tháng này.
          </p>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
            {expenseBreakdown.map((item) => {
              const isSelected = selectedCategoryId === item.category.id;
              const isDimmed = selectedCategoryId !== null && !isSelected;
              const isCash = item.category.id === 'exp_cash';

              return (
                <div
                  key={item.category.id}
                  onClick={() => handleToggleCategory(item.category.id)}
                  style={{
                    display: 'flex',
                    flexDirection: 'column',
                    gap: '6px',
                    padding: '8px 10px',
                    borderRadius: '10px',
                    background: isSelected ? `${item.category.color}15` : 'transparent',
                    border: `1px solid ${isSelected ? `${item.category.color}50` : 'transparent'}`,
                    opacity: isDimmed ? 0.45 : 1,
                    cursor: 'pointer',
                    transition: 'all 0.15s ease',
                  }}
                  title="Nhấn để xem các giao dịch thuộc hạng mục này"
                >
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: '10px' }}>
                    {/* Left: Category info */}
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px', minWidth: 0, flex: 1 }}>
                      <div
                        style={{
                          width: '28px',
                          height: '28px',
                          borderRadius: '8px',
                          background: `${item.category.color}25`,
                          color: item.category.color,
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          flexShrink: 0,
                        }}
                      >
                        <CategoryIcon name={item.category.icon} size={15} color={item.category.color} />
                      </div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '6px', minWidth: 0, flexWrap: 'wrap' }}>
                        <span
                          style={{
                            fontSize: '0.875rem',
                            fontWeight: isSelected ? 700 : 600,
                            color: isSelected ? item.category.color : isCash ? '#10b981' : '#f8fafc',
                            overflow: 'hidden',
                            textOverflow: 'ellipsis',
                            whiteSpace: 'nowrap',
                          }}
                        >
                          {item.category.name}
                          {isCash && (
                            <span style={{ fontSize: '0.7rem', color: '#10b981', marginLeft: '6px' }}>
                              (Rút ATM/Bank)
                            </span>
                          )}
                        </span>
                        {isSelected && (
                          <span
                            style={{
                              fontSize: '0.64rem',
                              fontWeight: 700,
                              background: `${item.category.color}25`,
                              color: item.category.color,
                              padding: '1px 6px',
                              borderRadius: 'var(--radius-full)',
                              border: `1px solid ${item.category.color}40`,
                            }}
                          >
                            Đang lọc ({item.count} GD)
                          </span>
                        )}
                      </div>
                    </div>

                    {/* Right: Amount & Percent */}
                    <div style={{ textAlign: 'right', flexShrink: 0, display: 'flex', alignItems: 'baseline', gap: '6px' }}>
                      <span style={{ fontSize: '0.875rem', fontWeight: 700, fontFamily: 'var(--font-mono)', color: '#f8fafc' }}>
                        {formatVND(item.amount, isBalanceHidden)}
                      </span>
                      <span style={{ fontSize: '0.725rem', color: 'var(--text-muted)', minWidth: '40px', textAlign: 'right' }}>
                        ({item.percentage.toFixed(1)}%)
                      </span>
                    </div>
                  </div>

                  {/* Progress bar */}
                  <div
                    style={{
                      height: '6px',
                      borderRadius: 'var(--radius-full)',
                      background: 'rgba(255, 255, 255, 0.08)',
                      overflow: 'hidden',
                    }}
                  >
                    <div
                      style={{
                        width: `${item.percentage}%`,
                        height: '100%',
                        backgroundColor: item.category.color,
                        borderRadius: 'var(--radius-full)',
                        transition: 'width 0.4s ease',
                      }}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* PHÂN BỔ THU NHẬP THEO HẠNG MỤC */}
      {incomeBreakdown.length > 0 && (
        <div className="glass-card" style={{ padding: '16px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '14px', flexWrap: 'wrap', gap: '6px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <TrendingUp size={17} color="#10b981" />
              <h3 style={{ fontSize: '0.975rem', fontWeight: 700, color: '#f8fafc' }}>
                Nguồn Thu Nhập Trong Tháng
              </h3>
            </div>
            <span style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>
              Chạm vào hạng mục để lọc
            </span>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
            {incomeBreakdown.map((item) => {
              const isSelected = selectedCategoryId === item.category.id;
              const isDimmed = selectedCategoryId !== null && !isSelected;

              return (
                <div
                  key={item.category.id}
                  onClick={() => handleToggleCategory(item.category.id)}
                  style={{
                    display: 'flex',
                    flexDirection: 'column',
                    gap: '6px',
                    padding: '8px 10px',
                    borderRadius: '10px',
                    background: isSelected ? `${item.category.color}15` : 'transparent',
                    border: `1px solid ${isSelected ? `${item.category.color}50` : 'transparent'}`,
                    opacity: isDimmed ? 0.45 : 1,
                    cursor: 'pointer',
                    transition: 'all 0.15s ease',
                  }}
                  title="Nhấn để xem các giao dịch thuộc hạng mục này"
                >
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: '10px' }}>
                    {/* Left: Category info */}
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px', minWidth: 0, flex: 1 }}>
                      <div
                        style={{
                          width: '28px',
                          height: '28px',
                          borderRadius: '8px',
                          background: `${item.category.color}25`,
                          color: item.category.color,
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          flexShrink: 0,
                        }}
                      >
                        <CategoryIcon name={item.category.icon} size={15} color={item.category.color} />
                      </div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '6px', minWidth: 0, flexWrap: 'wrap' }}>
                        <span
                          style={{
                            fontSize: '0.875rem',
                            fontWeight: isSelected ? 700 : 600,
                            color: isSelected ? item.category.color : '#f8fafc',
                            overflow: 'hidden',
                            textOverflow: 'ellipsis',
                            whiteSpace: 'nowrap',
                          }}
                        >
                          {item.category.name}
                        </span>
                        {isSelected && (
                          <span
                            style={{
                              fontSize: '0.64rem',
                              fontWeight: 700,
                              background: `${item.category.color}25`,
                              color: item.category.color,
                              padding: '1px 6px',
                              borderRadius: 'var(--radius-full)',
                              border: `1px solid ${item.category.color}40`,
                            }}
                          >
                            Đang lọc ({item.count} GD)
                          </span>
                        )}
                      </div>
                    </div>

                    {/* Right: Amount & Percent */}
                    <div style={{ textAlign: 'right', flexShrink: 0, display: 'flex', alignItems: 'baseline', gap: '6px' }}>
                      <span style={{ fontSize: '0.875rem', fontWeight: 700, fontFamily: 'var(--font-mono)', color: '#10b981' }}>
                        +{formatVND(item.amount, isBalanceHidden)}
                      </span>
                      <span style={{ fontSize: '0.725rem', color: 'var(--text-muted)', minWidth: '40px', textAlign: 'right' }}>
                        ({item.percentage.toFixed(1)}%)
                      </span>
                    </div>
                  </div>

                  <div
                    style={{
                      height: '6px',
                      borderRadius: 'var(--radius-full)',
                      background: 'rgba(255, 255, 255, 0.08)',
                      overflow: 'hidden',
                    }}
                  >
                    <div
                      style={{
                        width: `${item.percentage}%`,
                        height: '100%',
                        backgroundColor: item.category.color,
                        borderRadius: 'var(--radius-full)',
                        transition: 'width 0.4s ease',
                      }}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* DANH SÁCH CHI TIẾT GIAO DỊCH (HỖ TRỢ LỌC THEO HẠNG MỤC) */}
      <div>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px', flexWrap: 'wrap', gap: '8px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <Layers size={17} color="#38bdf8" />
            <h3 style={{ fontSize: '0.975rem', fontWeight: 700, color: '#f8fafc' }}>
              Chi Tiết Giao Dịch ({displayedTransactions.length})
            </h3>
          </div>

          {selectedCategoryId && (
            <button
              type="button"
              onClick={() => setSelectedCategoryId(null)}
              style={{
                background: 'rgba(255, 255, 255, 0.08)',
                border: '1px solid rgba(255, 255, 255, 0.12)',
                borderRadius: 'var(--radius-full)',
                color: '#38bdf8',
                fontSize: '0.75rem',
                fontWeight: 600,
                padding: '4px 10px',
                cursor: 'pointer',
                display: 'inline-flex',
                alignItems: 'center',
                gap: '4px',
              }}
            >
              <X size={12} /> Xem tất cả
            </button>
          )}
        </div>

        {/* Thanh thông báo đang lọc theo hạng mục */}
        {selectedCategory && (
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              padding: '9px 12px',
              borderRadius: '10px',
              background: `${selectedCategory.color}15`,
              border: `1px solid ${selectedCategory.color}35`,
              marginBottom: '10px',
              gap: '8px',
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', minWidth: 0 }}>
              <CategoryIcon name={selectedCategory.icon} size={16} color={selectedCategory.color} />
              <span style={{ fontSize: '0.85rem', fontWeight: 700, color: '#f8fafc' }}>
                {selectedCategory.name}
              </span>
              <span
                style={{
                  fontSize: '0.75rem',
                  color: selectedCategory.color,
                  fontWeight: 700,
                  fontFamily: 'var(--font-mono)',
                }}
              >
                ({displayedTransactions.length} GD • {formatVND(selectedCategoryTotal, isBalanceHidden)})
              </span>
            </div>
            <button
              type="button"
              onClick={() => setSelectedCategoryId(null)}
              style={{
                background: 'transparent',
                border: 'none',
                color: 'var(--text-muted)',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                padding: '2px',
              }}
              title="Xóa lọc hạng mục"
            >
              <X size={15} />
            </button>
          </div>
        )}

        {displayedTransactions.length === 0 ? (
          <div className="glass-card" style={{ padding: '24px', textAlign: 'center', color: 'var(--text-muted)' }}>
            {selectedCategoryId ? (
              <>
                <p style={{ fontSize: '0.85rem', marginBottom: '8px' }}>
                  Không có giao dịch nào thuộc hạng mục này trong {formatMonthLabel(selectedMonthKey)}.
                </p>
                <button
                  type="button"
                  className="btn btn-secondary"
                  onClick={() => setSelectedCategoryId(null)}
                  style={{ fontSize: '0.78rem', padding: '4px 12px' }}
                >
                  Xem tất cả hạng mục
                </button>
              </>
            ) : (
              `Không có giao dịch nào trong ${formatMonthLabel(selectedMonthKey)}.`
            )}
          </div>
        ) : (
          <div
            className="glass-card"
            style={{
              padding: '2px 12px',
              borderRadius: '12px',
              border: '1px solid var(--border-subtle)',
            }}
          >
            {displayedTransactions.map((t, idx) => {
              const cat = categories.find((c) => c.id === t.categoryId);
              const bank = banks.find((b) => b.id === t.bankId);
              const isLast = idx === displayedTransactions.length - 1;

              return (
                <TransactionItem
                  key={t.id}
                  transaction={t}
                  category={cat}
                  bank={bank}
                  isBalanceHidden={isBalanceHidden}
                  showDate={true}
                  showTime={true}
                  showActions={Boolean(onEditTransaction || onDeleteTransaction)}
                  isLast={isLast}
                  onEdit={onEditTransaction}
                  onDelete={onDeleteTransaction}
                  onCategoryClick={(catId) => handleToggleCategory(catId)}
                  isCategorySelected={selectedCategoryId === t.categoryId}
                />
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};
