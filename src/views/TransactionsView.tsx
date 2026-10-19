import React, { useState, useMemo } from 'react';
import {
  Plus,
  Filter,
  Search,
  Edit2,
  Trash2,
  TrendingUp,
  TrendingDown,
  X,
} from 'lucide-react';
import type { BankAccount, Category, Transaction, TransactionType } from '../types/finance.ts';
import { formatVND, formatDisplayDate } from '../services/financeEngine.ts';
import { CategoryIcon } from '../components/common/CategoryIcon.tsx';

interface TransactionsViewProps {
  transactions: Transaction[];
  banks: BankAccount[];
  categories: Category[];
  isBalanceHidden: boolean;
  onOpenAddModal: () => void;
  onEditTransaction: (tx: Transaction) => void;
  onDeleteTransaction: (id: string) => void;
}

export const TransactionsView: React.FC<TransactionsViewProps> = ({
  transactions,
  banks,
  categories,
  isBalanceHidden,
  onOpenAddModal,
  onEditTransaction,
  onDeleteTransaction,
}) => {
  const [filterType, setFilterType] = useState<'all' | TransactionType>('all');
  const [filterBankId, setFilterBankId] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState<string>('');

  // Lọc danh sách giao dịch
  const filteredTransactions = useMemo(() => {
    return transactions.filter((t) => {
      if (filterType !== 'all' && t.type !== filterType) return false;
      if (filterBankId !== 'all' && t.bankId !== filterBankId) return false;
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        const cat = categories.find((c) => c.id === t.categoryId);
        const matchNote = t.note?.toLowerCase().includes(q);
        const matchCat = cat?.name.toLowerCase().includes(q);
        if (!matchNote && !matchCat) return false;
      }
      return true;
    });
  }, [transactions, filterType, filterBankId, searchQuery, categories]);

  // Tổng thu & chi của bộ lọc hiện tại
  const stats = useMemo(() => {
    let income = 0;
    let expense = 0;
    filteredTransactions.forEach((t) => {
      const amt = Number(t.amount) || 0;
      if (t.type === 'income') income += amt;
      else expense += amt;
    });
    return { income, expense };
  }, [filteredTransactions]);

  return (
    <div style={{ padding: '16px', display: 'flex', flexDirection: 'column', gap: '16px' }}>
      {/* Top Header & Button Thêm */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}>
        <div>
          <h2 style={{ fontSize: '1.25rem', fontWeight: 800, color: '#f8fafc', letterSpacing: '-0.02em' }}>
            Quản Lý Thu & Chi
          </h2>
          <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
            Tổng cộng {filteredTransactions.length} giao dịch
          </span>
        </div>
        <button
          type="button"
          onClick={onOpenAddModal}
          className="btn btn-primary"
          style={{ padding: '8px 14px', fontSize: '0.85rem' }}
        >
          <Plus size={16} /> Ghi Khoản Mới
        </button>
      </div>

      {/* Summary Mini Bar */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(2, 1fr)',
          gap: '10px',
        }}
      >
        {/* Thu Vào */}
        <div
          className="glass-card"
          style={{
            padding: '12px 14px',
            borderLeft: '3px solid var(--accent-income)',
            background: 'linear-gradient(135deg, rgba(16, 185, 129, 0.08) 0%, rgba(18, 24, 38, 0.95) 100%)',
            minWidth: 0,
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '4px' }}>
            <TrendingUp size={14} color="var(--accent-income)" />
            <span style={{ fontSize: '0.725rem', fontWeight: 600, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
              Tổng Tiền Thu
            </span>
          </div>
          <div
            style={{
              fontSize: 'clamp(0.95rem, 3.8vw, 1.15rem)',
              fontWeight: 800,
              color: 'var(--accent-income)',
              fontFamily: 'var(--font-mono)',
              whiteSpace: 'nowrap',
              overflow: 'hidden',
              textOverflow: 'ellipsis',
            }}
          >
            +{formatVND(stats.income, isBalanceHidden)}
          </div>
        </div>

        {/* Đã Chi */}
        <div
          className="glass-card"
          style={{
            padding: '12px 14px',
            borderLeft: '3px solid var(--accent-expense)',
            background: 'linear-gradient(135deg, rgba(244, 63, 94, 0.08) 0%, rgba(18, 24, 38, 0.95) 100%)',
            minWidth: 0,
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '4px' }}>
            <TrendingDown size={14} color="var(--accent-expense)" />
            <span style={{ fontSize: '0.725rem', fontWeight: 600, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
              Tổng Tiền Chi
            </span>
          </div>
          <div
            style={{
              fontSize: 'clamp(0.95rem, 3.8vw, 1.15rem)',
              fontWeight: 800,
              color: 'var(--accent-expense)',
              fontFamily: 'var(--font-mono)',
              whiteSpace: 'nowrap',
              overflow: 'hidden',
              textOverflow: 'ellipsis',
            }}
          >
            -{formatVND(stats.expense, isBalanceHidden)}
          </div>
        </div>
      </div>

      {/* Search & Filter Bar */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
        {/* Search */}
        <div style={{ position: 'relative' }}>
          <Search
            size={16}
            style={{
              position: 'absolute',
              left: '12px',
              top: '50%',
              transform: 'translateY(-50%)',
              color: 'var(--text-muted)',
            }}
          />
          <input
            type="text"
            placeholder="Tìm theo ghi chú hoặc danh mục..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="form-input"
            style={{ paddingLeft: '38px', paddingRight: searchQuery ? '36px' : '12px', fontSize: '0.875rem' }}
          />
          {searchQuery && (
            <button
              type="button"
              onClick={() => setSearchQuery('')}
              style={{
                position: 'absolute',
                right: '10px',
                top: '50%',
                transform: 'translateY(-50%)',
                background: 'rgba(255, 255, 255, 0.1)',
                border: 'none',
                borderRadius: '50%',
                width: '20px',
                height: '20px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: 'var(--text-muted)',
                cursor: 'pointer',
              }}
            >
              <X size={12} />
            </button>
          )}
        </div>

        {/* Filter Tabs: Loại Giao Dịch */}
        <div style={{ display: 'flex', gap: '8px', overflowX: 'auto', paddingBottom: '2px', scrollbarWidth: 'none' }}>
          {[
            { id: 'all', label: 'Tất cả' },
            { id: 'expense', label: 'Khoản Chi' },
            { id: 'income', label: 'Khoản Thu' },
          ].map((tab) => (
            <button
              key={tab.id}
              type="button"
              onClick={() => setFilterType(tab.id as any)}
              style={{
                padding: '6px 14px',
                borderRadius: 'var(--radius-full)',
                border: 'none',
                background: filterType === tab.id ? '#38bdf8' : 'rgba(255, 255, 255, 0.06)',
                color: filterType === tab.id ? '#0f172a' : 'var(--text-secondary)',
                fontWeight: filterType === tab.id ? 700 : 500,
                fontSize: '0.8rem',
                cursor: 'pointer',
                whiteSpace: 'nowrap',
                transition: 'all 0.12s ease',
              }}
            >
              {tab.label}
            </button>
          ))}

          {/* Filter theo Bank */}
          <select
            value={filterBankId}
            onChange={(e) => setFilterBankId(e.target.value)}
            className="form-select"
            style={{
              padding: '4px 10px',
              fontSize: '0.8rem',
              width: 'auto',
              borderRadius: 'var(--radius-full)',
              background: 'rgba(255, 255, 255, 0.06)',
              color: 'var(--text-secondary)',
              cursor: 'pointer',
            }}
          >
            <option value="all">Tất cả Bank / Ví</option>
            {banks.map((b) => (
              <option key={b.id} value={b.id}>
                {b.name}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Danh Sách Giao Dịch */}
      {filteredTransactions.length === 0 ? (
        <div
          className="glass-card"
          style={{
            padding: '40px 20px',
            textAlign: 'center',
            color: 'var(--text-muted)',
          }}
        >
          <Filter size={36} style={{ margin: '0 auto 12px', opacity: 0.4 }} />
          <p style={{ fontSize: '0.9rem' }}>Không tìm thấy giao dịch nào phù hợp.</p>
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
          {filteredTransactions.map((t) => {
            const cat = categories.find((c) => c.id === t.categoryId) || {
              name: 'Khác',
              icon: 'CircleEllipsis',
              color: '#94a3b8',
            };
            const bank = banks.find((b) => b.id === t.bankId);
            const isIncome = t.type === 'income';

            return (
              <div
                key={t.id}
                className="glass-card"
                style={{
                  padding: '12px 14px',
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '8px',
                  borderRadius: 'var(--radius-md)',
                }}
              >
                {/* Row 1: Icon + Tên Danh Mục + Bank Badge & Số Tiền */}
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '10px' }}>
                  {/* Left: Icon & Category info */}
                  <div style={{ display: 'flex', alignItems: 'center', gap: '10px', minWidth: 0, flex: 1 }}>
                    <div
                      style={{
                        width: '38px',
                        height: '38px',
                        borderRadius: '10px',
                        background: `${cat.color}1f`,
                        color: cat.color,
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        flexShrink: 0,
                      }}
                    >
                      <CategoryIcon name={cat.icon} size={20} color={cat.color} />
                    </div>

                    <div style={{ minWidth: 0, flex: 1 }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '6px', flexWrap: 'wrap' }}>
                        <span
                          style={{
                            fontSize: '0.925rem',
                            fontWeight: 700,
                            color: '#f8fafc',
                            overflow: 'hidden',
                            textOverflow: 'ellipsis',
                            whiteSpace: 'nowrap',
                          }}
                        >
                          {cat.name}
                        </span>
                        <span
                          style={{
                            fontSize: '0.675rem',
                            fontWeight: 600,
                            padding: '1px 6px',
                            borderRadius: 'var(--radius-full)',
                            background: bank?.color ? `${bank.color}1a` : 'rgba(56, 189, 248, 0.12)',
                            color: bank?.color || '#38bdf8',
                            border: `1px solid ${bank?.color ? `${bank.color}33` : 'rgba(56, 189, 248, 0.2)'}`,
                            flexShrink: 0,
                          }}
                        >
                          {bank?.name || 'Tài khoản'}
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Right: Amount */}
                  <div
                    style={{
                      fontSize: '1.05rem',
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

                {/* Row 2: Ngày tháng, Ghi chú & Nút Chỉnh sửa / Xoá */}
                <div
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    gap: '8px',
                    paddingTop: '6px',
                    borderTop: '1px solid rgba(255, 255, 255, 0.05)',
                  }}
                >
                  {/* Left: Ngày tháng & Ghi chú */}
                  <div
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '6px',
                      fontSize: '0.75rem',
                      color: 'var(--text-muted)',
                      minWidth: 0,
                      flex: 1,
                      overflow: 'hidden',
                    }}
                  >
                    <span style={{ flexShrink: 0, color: 'var(--text-muted)' }}>
                      {formatDisplayDate(t.date)}
                    </span>
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

                  {/* Right: Nút Sửa & Xoá */}
                  <div style={{ display: 'flex', alignItems: 'center', gap: '6px', flexShrink: 0 }}>
                    <button
                      type="button"
                      className="btn-icon"
                      onClick={() => onEditTransaction(t)}
                      title="Sửa giao dịch"
                      style={{ width: '28px', height: '28px', borderRadius: '8px' }}
                    >
                      <Edit2 size={13} />
                    </button>
                    <button
                      type="button"
                      className="btn-icon"
                      onClick={() => {
                        if (confirm(`Xoá giao dịch "${cat.name}" số tiền ${formatVND(t.amount)}?`)) {
                          onDeleteTransaction(t.id);
                        }
                      }}
                      title="Xoá giao dịch"
                      style={{ width: '28px', height: '28px', borderRadius: '8px', color: '#f43f5e' }}
                    >
                      <Trash2 size={13} />
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};
