import React from 'react';
import {
  ChevronLeft,
  ChevronRight,
  TrendingUp,
  PieChart,
  Calendar,
  Layers,
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
  formatDisplayDate,
  shiftMonthKey,
  getCurrentMonthKey,
} from '../services/financeEngine.ts';
import { CategoryIcon } from '../components/common/CategoryIcon.tsx';

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
}) => {
  const currentMonthKey = getCurrentMonthKey();
  const isCurrentMonth = selectedMonthKey === currentMonthKey;

  const handlePrevMonth = () => {
    onSelectMonthKey(shiftMonthKey(selectedMonthKey, -1));
  };

  const handleNextMonth = () => {
    onSelectMonthKey(shiftMonthKey(selectedMonthKey, 1));
  };

  const handleResetCurrentMonth = () => {
    onSelectMonthKey(currentMonthKey);
  };

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
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '14px' }}>
          <PieChart size={17} color="#f43f5e" />
          <h3 style={{ fontSize: '0.975rem', fontWeight: 700, color: '#f8fafc' }}>
            Phân Bổ Chi Tiêu Tháng Này
          </h3>
        </div>

        {expenseBreakdown.length === 0 ? (
          <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)', textAlign: 'center', padding: '16px' }}>
            Không có khoản chi nào trong tháng này.
          </p>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            {expenseBreakdown.map((item) => {
              const isCash = item.category.id === 'exp_cash';
              return (
                <div key={item.category.id} style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
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
                      <span
                        style={{
                          fontSize: '0.875rem',
                          fontWeight: 600,
                          color: isCash ? '#10b981' : '#f8fafc',
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
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '14px' }}>
            <TrendingUp size={17} color="#10b981" />
            <h3 style={{ fontSize: '0.975rem', fontWeight: 700, color: '#f8fafc' }}>
              Nguồn Thu Nhập Trong Tháng
            </h3>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            {incomeBreakdown.map((item) => (
              <div key={item.category.id} style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
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
                    <span
                      style={{
                        fontSize: '0.875rem',
                        fontWeight: 600,
                        color: '#f8fafc',
                        overflow: 'hidden',
                        textOverflow: 'ellipsis',
                        whiteSpace: 'nowrap',
                      }}
                    >
                      {item.category.name}
                    </span>
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
            ))}
          </div>
        </div>
      )}

      {/* DANH SÁCH CHI TIẾT TẤT CẢ GIAO DỊCH THÁNG NÀY */}
      <div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '12px' }}>
          <Layers size={17} color="#38bdf8" />
          <h3 style={{ fontSize: '0.975rem', fontWeight: 700, color: '#f8fafc' }}>
            Chi Tiết Giao Dịch ({monthTransactions.length})
          </h3>
        </div>

        {monthTransactions.length === 0 ? (
          <div className="glass-card" style={{ padding: '24px', textAlign: 'center', color: 'var(--text-muted)' }}>
            Không có giao dịch nào trong {formatMonthLabel(selectedMonthKey)}.
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
            {monthTransactions.map((t) => {
              const cat = categories.find((c) => c.id === t.categoryId);
              const bank = banks.find((b) => b.id === t.bankId);
              const isIncome = t.type === 'income';

              return (
                <div
                  key={t.id}
                  className="glass-card"
                  style={{
                    padding: '11px 13px',
                    display: 'flex',
                    flexDirection: 'column',
                    gap: '6px',
                    borderRadius: 'var(--radius-md)',
                  }}
                >
                  {/* Row 1: Icon, Category Name, Bank & Amount */}
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '10px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '9px', minWidth: 0, flex: 1 }}>
                      <div
                        style={{
                          width: '34px',
                          height: '34px',
                          borderRadius: '9px',
                          background: `${cat?.color || '#94a3b8'}20`,
                          color: cat?.color || '#94a3b8',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          flexShrink: 0,
                        }}
                      >
                        <CategoryIcon name={cat?.icon || 'CircleEllipsis'} size={17} color={cat?.color} />
                      </div>

                      <div style={{ minWidth: 0, flex: 1 }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '6px', flexWrap: 'wrap' }}>
                          <span
                            style={{
                              fontSize: '0.9rem',
                              fontWeight: 700,
                              color: '#f8fafc',
                              overflow: 'hidden',
                              textOverflow: 'ellipsis',
                              whiteSpace: 'nowrap',
                            }}
                          >
                            {cat?.name || 'Khác'}
                          </span>
                          {bank && (
                            <span
                              style={{
                                fontSize: '0.65rem',
                                fontWeight: 600,
                                padding: '1px 6px',
                                borderRadius: 'var(--radius-full)',
                                background: bank.color ? `${bank.color}1a` : 'rgba(56, 189, 248, 0.12)',
                                color: bank.color || '#38bdf8',
                                border: `1px solid ${bank.color ? `${bank.color}33` : 'rgba(56, 189, 248, 0.2)'}`,
                                flexShrink: 0,
                              }}
                            >
                              {bank.name}
                            </span>
                          )}
                        </div>
                      </div>
                    </div>

                    <div
                      style={{
                        fontSize: '0.975rem',
                        fontWeight: 800,
                        fontFamily: 'var(--font-mono)',
                        color: isIncome ? 'var(--accent-income)' : 'var(--accent-expense)',
                        textAlign: 'right',
                        flexShrink: 0,
                        letterSpacing: '-0.02em',
                      }}
                    >
                      {isIncome ? '+' : '-'}{formatVND(t.amount, isBalanceHidden)}
                    </div>
                  </div>

                  {/* Row 2: Date & Note */}
                  <div
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '6px',
                      fontSize: '0.725rem',
                      color: 'var(--text-muted)',
                      paddingTop: '4px',
                      borderTop: '1px solid rgba(255, 255, 255, 0.04)',
                      minWidth: 0,
                      overflow: 'hidden',
                    }}
                  >
                    <span style={{ flexShrink: 0 }}>{formatDisplayDate(t.date)}</span>
                    {t.note && (
                      <>
                        <span style={{ opacity: 0.4, flexShrink: 0 }}>•</span>
                        <span
                          style={{
                            color: 'var(--text-secondary)',
                            overflow: 'hidden',
                            textOverflow: 'ellipsis',
                            whiteSpace: 'nowrap',
                          }}
                          title={t.note}
                        >
                          {t.note}
                        </span>
                      </>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};
