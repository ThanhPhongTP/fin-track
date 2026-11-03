import React, { useState, useMemo } from 'react';
import {
  Plus,
  Filter,
  Search,
  TrendingUp,
  TrendingDown,
  Scale,
  X,
  Calendar,
  ChevronDown,
  Wallet,
} from 'lucide-react';
import type { BankAccount, Category, Transaction, TransactionType } from '../types/finance.ts';
import { formatVND, formatMonthLabel, getTodayDateString } from '../services/financeEngine.ts';
import { TransactionItem } from '../components/common/TransactionItem.tsx';

interface TransactionsViewProps {
  transactions: Transaction[];
  banks: BankAccount[];
  categories: Category[];
  isBalanceHidden: boolean;
  onOpenAddModal: () => void;
  onEditTransaction: (tx: Transaction) => void;
  onDeleteTransaction: (id: string) => void;
}

interface DateGroup {
  date: string;
  displayDate: string;
  dayIncome: number;
  dayExpense: number;
  transactions: Transaction[];
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
  const [filterCategoryId, setFilterCategoryId] = useState<string>('all');
  const [filterBankId, setFilterBankId] = useState<string>('all');
  const [filterMonth, setFilterMonth] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState<string>('');

  // Danh sách các tháng có giao dịch để hiển thị trong bộ lọc
  const availableMonths = useMemo(() => {
    const monthSet = new Set<string>();
    transactions.forEach((t) => {
      if (t.date && t.date.length >= 7) {
        monthSet.add(t.date.substring(0, 7));
      }
    });
    return Array.from(monthSet).sort((a, b) => b.localeCompare(a));
  }, [transactions]);

  // Danh sách hạng mục phù hợp với loại giao dịch đang chọn
  const availableCategoriesForFilter = useMemo(() => {
    if (filterType === 'all') return categories;
    return categories.filter((c) => c.type === filterType);
  }, [categories, filterType]);

  // Xử lý khi đổi loại giao dịch (Tất cả / Chi tiêu / Thu nhập)
  const handleTypeChange = (newType: 'all' | TransactionType) => {
    setFilterType(newType);
    if (filterCategoryId !== 'all') {
      const selectedCat = categories.find((c) => c.id === filterCategoryId);
      if (selectedCat && newType !== 'all' && selectedCat.type !== newType) {
        setFilterCategoryId('all');
      }
    }
  };

  // Lọc danh sách giao dịch
  const filteredTransactions = useMemo(() => {
    return transactions.filter((t) => {
      if (filterType !== 'all' && t.type !== filterType) return false;
      if (filterCategoryId !== 'all' && t.categoryId !== filterCategoryId) return false;
      if (filterBankId !== 'all' && t.bankId !== filterBankId) return false;
      if (filterMonth !== 'all' && (!t.date || !t.date.startsWith(filterMonth))) return false;
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        const cat = categories.find((c) => c.id === t.categoryId);
        const matchNote = t.note?.toLowerCase().includes(q);
        const matchCat = cat?.name.toLowerCase().includes(q);
        if (!matchNote && !matchCat) return false;
      }
      return true;
    });
  }, [transactions, filterType, filterCategoryId, filterBankId, filterMonth, searchQuery, categories]);

  // Tổng thu & chi của bộ lọc hiện tại
  const stats = useMemo(() => {
    let income = 0;
    let expense = 0;
    filteredTransactions.forEach((t) => {
      const amt = Number(t.amount) || 0;
      if (t.type === 'income') income += amt;
      else expense += amt;
    });
    return { income, expense, net: income - expense };
  }, [filteredTransactions]);

  // Helper format ngày hiển thị thân thiện (Hôm nay, Hôm qua, Thứ...)
  const formatGroupDateLabel = (dateStr: string): string => {
    const today = getTodayDateString();

    const d = new Date();
    d.setDate(d.getDate() - 1);
    const yestY = d.getFullYear();
    const yestM = String(d.getMonth() + 1).padStart(2, '0');
    const yestD = String(d.getDate()).padStart(2, '0');
    const yesterday = `${yestY}-${yestM}-${yestD}`;

    const parts = dateStr.split('-');
    if (parts.length !== 3) return dateStr;
    const formattedDayMonth = `${parts[2]}/${parts[1]}/${parts[0]}`;

    if (dateStr === today) {
      return `Hôm nay (${formattedDayMonth})`;
    }
    if (dateStr === yesterday) {
      return `Hôm qua (${formattedDayMonth})`;
    }

    const [y, m, day] = parts.map(Number);
    const dateObj = new Date(y, m - 1, day);
    const daysOfWeek = ['Chủ Nhật', 'Thứ Hai', 'Thứ Ba', 'Thứ Tư', 'Thứ Năm', 'Thứ Sáu', 'Thứ Bảy'];
    const dayName = daysOfWeek[dateObj.getDay()] || '';
    return `${dayName}, ${formattedDayMonth}`;
  };

  // Gom nhóm giao dịch theo từng ngày (Date grouping)
  const groupedTransactions = useMemo(() => {
    const sorted = [...filteredTransactions].sort((a, b) => {
      if (b.date !== a.date) {
        return b.date.localeCompare(a.date);
      }
      return (b.createdAt || '').localeCompare(a.createdAt || '');
    });

    const groups: DateGroup[] = [];
    const map = new Map<string, Transaction[]>();

    for (const tx of sorted) {
      const list = map.get(tx.date) || [];
      list.push(tx);
      map.set(tx.date, list);
    }

    map.forEach((txList, date) => {
      let dayIncome = 0;
      let dayExpense = 0;
      txList.forEach((t) => {
        const amt = Number(t.amount) || 0;
        if (t.type === 'income') dayIncome += amt;
        else dayExpense += amt;
      });

      groups.push({
        date,
        displayDate: formatGroupDateLabel(date),
        dayIncome,
        dayExpense,
        transactions: txList,
      });
    });

    return groups;
  }, [filteredTransactions]);

  const activeCategory = useMemo(() => {
    return categories.find((c) => c.id === filterCategoryId);
  }, [categories, filterCategoryId]);

  const isAnyFilterActive =
    filterType !== 'all' ||
    filterCategoryId !== 'all' ||
    filterBankId !== 'all' ||
    filterMonth !== 'all' ||
    searchQuery.trim() !== '';

  const handleResetFilters = () => {
    setFilterType('all');
    setFilterCategoryId('all');
    setFilterBankId('all');
    setFilterMonth('all');
    setSearchQuery('');
  };

  return (
    <div style={{ padding: '12px 16px 24px', display: 'flex', flexDirection: 'column', gap: '12px' }}>
      {/* 1. COMPACT SUMMARY WIDGET (Thu - Chi - Ròng) */}
      <div
        className="glass-card"
        style={{
          padding: '12px 14px',
          background: 'linear-gradient(135deg, rgba(18, 24, 38, 0.95) 0%, rgba(26, 34, 52, 0.88) 100%)',
          borderRadius: 'var(--radius-md)',
        }}
      >
        {/* Top bar của Widget */}
        <div
          style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            marginBottom: '10px',
            gap: '8px',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px', minWidth: 0, flexWrap: 'wrap' }}>
            <span style={{ fontSize: '0.825rem', fontWeight: 700, color: '#f8fafc', whiteSpace: 'nowrap' }}>
              {activeCategory ? `Hạng mục: ${activeCategory.name}` : 'Tổng Quan'}
            </span>
            <span
              style={{
                fontSize: '0.675rem',
                fontWeight: 600,
                padding: '1px 7px',
                borderRadius: 'var(--radius-full)',
                background: 'rgba(56, 189, 248, 0.12)',
                color: '#38bdf8',
                border: '1px solid rgba(56, 189, 248, 0.25)',
                whiteSpace: 'nowrap',
              }}
            >
              {filteredTransactions.length} GD
            </span>
          </div>

          <button
            type="button"
            onClick={onOpenAddModal}
            className="btn btn-primary"
            style={{
              padding: '6px 12px',
              fontSize: '0.78rem',
              gap: '4px',
              borderRadius: 'var(--radius-sm)',
              boxShadow: '0 2px 10px rgba(56, 189, 248, 0.3)',
            }}
          >
            <Plus size={14} /> Ghi Khoản Mới
          </button>
        </div>

        {/* 3 Cột Thống Kê Gọn Gàng */}
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(3, 1fr)',
            gap: '6px',
            background: 'rgba(0, 0, 0, 0.22)',
            padding: '8px 10px',
            borderRadius: '10px',
            border: '1px solid rgba(255, 255, 255, 0.04)',
          }}
        >
          {/* Thu Vào */}
          <div style={{ minWidth: 0 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '4px', marginBottom: '2px' }}>
              <TrendingUp size={12} color="var(--accent-income)" />
              <span
                style={{
                  fontSize: '0.65rem',
                  fontWeight: 600,
                  color: 'var(--text-muted)',
                  textTransform: 'uppercase',
                  letterSpacing: '0.02em',
                }}
              >
                Thu Vào
              </span>
            </div>
            <div
              style={{
                fontSize: 'clamp(0.78rem, 2.6vw, 0.925rem)',
                fontWeight: 700,
                color: 'var(--accent-income)',
                fontFamily: 'var(--font-mono)',
                whiteSpace: 'nowrap',
                overflow: 'hidden',
                textOverflow: 'ellipsis',
              }}
              title={formatVND(stats.income, false)}
            >
              +{formatVND(stats.income, isBalanceHidden)}
            </div>
          </div>

          {/* Chi Tiêu */}
          <div style={{ minWidth: 0 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '4px', marginBottom: '2px' }}>
              <TrendingDown size={12} color="var(--accent-expense)" />
              <span
                style={{
                  fontSize: '0.65rem',
                  fontWeight: 600,
                  color: 'var(--text-muted)',
                  textTransform: 'uppercase',
                  letterSpacing: '0.02em',
                }}
              >
                Chi Tiêu
              </span>
            </div>
            <div
              style={{
                fontSize: 'clamp(0.78rem, 2.6vw, 0.925rem)',
                fontWeight: 700,
                color: 'var(--accent-expense)',
                fontFamily: 'var(--font-mono)',
                whiteSpace: 'nowrap',
                overflow: 'hidden',
                textOverflow: 'ellipsis',
              }}
              title={formatVND(stats.expense, false)}
            >
              -{formatVND(stats.expense, isBalanceHidden)}
            </div>
          </div>

          {/* Ròng (Net) */}
          <div style={{ minWidth: 0 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '4px', marginBottom: '2px' }}>
              <Scale size={12} color={stats.net >= 0 ? '#38bdf8' : '#f43f5e'} />
              <span
                style={{
                  fontSize: '0.65rem',
                  fontWeight: 600,
                  color: 'var(--text-muted)',
                  textTransform: 'uppercase',
                  letterSpacing: '0.02em',
                }}
              >
                Thu Ròng
              </span>
            </div>
            <div
              style={{
                fontSize: 'clamp(0.78rem, 2.6vw, 0.925rem)',
                fontWeight: 700,
                color: stats.net >= 0 ? '#38bdf8' : '#f43f5e',
                fontFamily: 'var(--font-mono)',
                whiteSpace: 'nowrap',
                overflow: 'hidden',
                textOverflow: 'ellipsis',
              }}
              title={formatVND(stats.net, false)}
            >
              {stats.net >= 0 ? '+' : ''}
              {formatVND(stats.net, isBalanceHidden)}
            </div>
          </div>
        </div>
      </div>

      {/* 2. THANH TÌM KIẾM & BỘ LỌC TINH GỌN */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
        {/* Search Input */}
        <div style={{ position: 'relative' }}>
          <Search
            size={14}
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
            placeholder="Tìm theo ghi chú, danh mục..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="form-input"
            style={{
              paddingLeft: '34px',
              paddingRight: searchQuery ? '34px' : '12px',
              fontSize: '0.825rem',
              height: '36px',
              paddingTop: '0',
              paddingBottom: '0',
              borderRadius: '10px',
            }}
          />
          {searchQuery && (
            <button
              type="button"
              onClick={() => setSearchQuery('')}
              style={{
                position: 'absolute',
                right: '8px',
                top: '50%',
                transform: 'translateY(-50%)',
                background: 'rgba(255, 255, 255, 0.1)',
                border: 'none',
                borderRadius: '50%',
                width: '18px',
                height: '18px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: 'var(--text-muted)',
                cursor: 'pointer',
              }}
            >
              <X size={11} />
            </button>
          )}
        </div>

        {/* Filter Pills & Selectors */}
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '6px',
            flexWrap: 'wrap',
          }}
        >
          {/* Segmented Control: Tất cả / Chi tiêu / Thu nhập */}
          <div
            style={{
              display: 'inline-flex',
              background: 'rgba(255, 255, 255, 0.05)',
              padding: '2px',
              borderRadius: 'var(--radius-full)',
              border: '1px solid rgba(255, 255, 255, 0.06)',
            }}
          >
            {[
              { id: 'all', label: 'Tất cả' },
              { id: 'expense', label: 'Khoản Chi' },
              { id: 'income', label: 'Khoản Thu' },
            ].map((tab) => {
              const isActive = filterType === tab.id;
              let activeBg = '#38bdf8';
              let activeColor = '#0f172a';
              if (tab.id === 'expense') {
                activeBg = 'var(--accent-expense)';
                activeColor = '#ffffff';
              } else if (tab.id === 'income') {
                activeBg = 'var(--accent-income)';
                activeColor = '#ffffff';
              }

              return (
                <button
                  key={tab.id}
                  type="button"
                  onClick={() => handleTypeChange(tab.id as any)}
                  style={{
                    padding: '4px 10px',
                    borderRadius: 'var(--radius-full)',
                    border: 'none',
                    background: isActive ? activeBg : 'transparent',
                    color: isActive ? activeColor : 'var(--text-secondary)',
                    fontWeight: isActive ? 700 : 500,
                    fontSize: '0.75rem',
                    cursor: 'pointer',
                    transition: 'all 0.12s ease',
                    whiteSpace: 'nowrap',
                  }}
                >
                  {tab.label}
                </button>
              );
            })}
          </div>

          {/* Lọc Theo Hạng Mục (Category Filter) */}
          <div style={{ position: 'relative', display: 'inline-flex', alignItems: 'center' }}>
            <select
              value={filterCategoryId}
              onChange={(e) => setFilterCategoryId(e.target.value)}
              className="form-select"
              style={{
                padding: '4px 24px 4px 9px',
                fontSize: '0.75rem',
                height: '30px',
                width: 'auto',
                maxWidth: '160px',
                borderRadius: 'var(--radius-full)',
                background: filterCategoryId !== 'all' ? 'rgba(56, 189, 248, 0.15)' : 'rgba(255, 255, 255, 0.06)',
                borderColor: filterCategoryId !== 'all' ? '#38bdf8' : 'rgba(255, 255, 255, 0.1)',
                color: filterCategoryId !== 'all' ? '#38bdf8' : 'var(--text-secondary)',
                fontWeight: filterCategoryId !== 'all' ? 600 : 500,
                cursor: 'pointer',
                appearance: 'none',
              }}
            >
              <option value="all">Tất cả hạng mục ({availableCategoriesForFilter.length})</option>
              {availableCategoriesForFilter.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.name}
                </option>
              ))}
            </select>
            <ChevronDown
              size={12}
              style={{
                position: 'absolute',
                right: '7px',
                pointerEvents: 'none',
                color: filterCategoryId !== 'all' ? '#38bdf8' : 'var(--text-muted)',
              }}
            />
          </div>

          {/* Lọc Tài Khoản / Ngân Hàng */}
          <div style={{ position: 'relative', display: 'inline-flex', alignItems: 'center' }}>
            <select
              value={filterBankId}
              onChange={(e) => setFilterBankId(e.target.value)}
              className="form-select"
              style={{
                padding: '4px 24px 4px 9px',
                fontSize: '0.75rem',
                height: '30px',
                width: 'auto',
                borderRadius: 'var(--radius-full)',
                background: filterBankId !== 'all' ? 'rgba(56, 189, 248, 0.15)' : 'rgba(255, 255, 255, 0.06)',
                borderColor: filterBankId !== 'all' ? '#38bdf8' : 'rgba(255, 255, 255, 0.1)',
                color: filterBankId !== 'all' ? '#38bdf8' : 'var(--text-secondary)',
                fontWeight: filterBankId !== 'all' ? 600 : 500,
                cursor: 'pointer',
                appearance: 'none',
              }}
            >
              <option value="all">Tất cả tài khoản ({banks.length})</option>
              {banks.map((b) => (
                <option key={b.id} value={b.id}>
                  {b.name}
                </option>
              ))}
            </select>
            <ChevronDown
              size={12}
              style={{
                position: 'absolute',
                right: '7px',
                pointerEvents: 'none',
                color: filterBankId !== 'all' ? '#38bdf8' : 'var(--text-muted)',
              }}
            />
          </div>

          {/* Lọc theo Tháng (Nếu có giao dịch) */}
          {availableMonths.length > 0 && (
            <div style={{ position: 'relative', display: 'inline-flex', alignItems: 'center' }}>
              <select
                value={filterMonth}
                onChange={(e) => setFilterMonth(e.target.value)}
                className="form-select"
                style={{
                  padding: '4px 24px 4px 9px',
                  fontSize: '0.75rem',
                  height: '30px',
                  width: 'auto',
                  borderRadius: 'var(--radius-full)',
                  background: filterMonth !== 'all' ? 'rgba(56, 189, 248, 0.15)' : 'rgba(255, 255, 255, 0.06)',
                  borderColor: filterMonth !== 'all' ? '#38bdf8' : 'rgba(255, 255, 255, 0.1)',
                  color: filterMonth !== 'all' ? '#38bdf8' : 'var(--text-secondary)',
                  fontWeight: filterMonth !== 'all' ? 600 : 500,
                  cursor: 'pointer',
                  appearance: 'none',
                }}
              >
                <option value="all">Tất cả thời gian</option>
                {availableMonths.map((m) => (
                  <option key={m} value={m}>
                    {formatMonthLabel(m)}
                  </option>
                ))}
              </select>
              <ChevronDown
                size={12}
                style={{
                  position: 'absolute',
                  right: '7px',
                  pointerEvents: 'none',
                  color: filterMonth !== 'all' ? '#38bdf8' : 'var(--text-muted)',
                }}
              />
            </div>
          )}

          {/* Nút Xóa Lọc */}
          {isAnyFilterActive && (
            <button
              type="button"
              onClick={handleResetFilters}
              style={{
                background: 'rgba(244, 63, 94, 0.12)',
                border: '1px solid rgba(244, 63, 94, 0.25)',
                color: '#f43f5e',
                fontSize: '0.725rem',
                fontWeight: 600,
                cursor: 'pointer',
                padding: '4px 9px',
                borderRadius: 'var(--radius-full)',
                display: 'inline-flex',
                alignItems: 'center',
                gap: '3px',
              }}
            >
              <X size={12} /> Bỏ lọc
            </button>
          )}
        </div>
      </div>

      {/* 3. DANH SÁCH GIAO DỊCH GOM THEO NGÀY (DATE-GROUPED LIST) */}
      {groupedTransactions.length === 0 ? (
        <div
          className="glass-card"
          style={{
            padding: '40px 20px',
            textAlign: 'center',
            color: 'var(--text-muted)',
            borderRadius: 'var(--radius-md)',
          }}
        >
          {isAnyFilterActive ? (
            <>
              <Filter size={32} style={{ margin: '0 auto 8px', opacity: 0.4 }} />
              <p style={{ fontSize: '0.875rem', marginBottom: '10px' }}>Không tìm thấy giao dịch nào phù hợp.</p>
              <button
                type="button"
                className="btn btn-secondary"
                onClick={handleResetFilters}
                style={{ fontSize: '0.8rem', padding: '6px 14px' }}
              >
                Xóa bộ lọc
              </button>
            </>
          ) : (
            <>
              <Wallet size={32} style={{ margin: '0 auto 8px', opacity: 0.4 }} />
              <p style={{ fontSize: '0.875rem', marginBottom: '10px' }}>Chưa có giao dịch thu chi nào.</p>
              <button
                type="button"
                className="btn btn-primary"
                onClick={onOpenAddModal}
                style={{ fontSize: '0.8rem', padding: '6px 14px' }}
              >
                <Plus size={14} /> Thêm Giao Dịch Đầu Tiên
              </button>
            </>
          )}
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
          {groupedTransactions.map((group) => (
            <div key={group.date} style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
              {/* Header ngày & Tổng thu chi trong ngày */}
              <div
                style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  padding: '0 4px',
                  fontSize: '0.74rem',
                  color: 'var(--text-muted)',
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '5px' }}>
                  <Calendar size={12} color="#38bdf8" />
                  <span style={{ color: '#cbd5e1', fontWeight: 700 }}>{group.displayDate}</span>
                </div>
                <div
                  style={{
                    fontFamily: 'var(--font-mono)',
                    fontSize: '0.72rem',
                    fontWeight: 600,
                    display: 'flex',
                    alignItems: 'center',
                    gap: '6px',
                  }}
                >
                  {group.dayExpense > 0 && (
                    <span style={{ color: 'var(--accent-expense)' }}>
                      -{formatVND(group.dayExpense, isBalanceHidden)}
                    </span>
                  )}
                  {group.dayIncome > 0 && (
                    <span style={{ color: 'var(--accent-income)' }}>
                      +{formatVND(group.dayIncome, isBalanceHidden)}
                    </span>
                  )}
                </div>
              </div>

              {/* Card Container nhóm các giao dịch trong ngày */}
              <div
                className="glass-card"
                style={{
                  padding: '2px 12px',
                  borderRadius: '12px',
                  border: '1px solid var(--border-subtle)',
                }}
              >
                {group.transactions.map((t, idx) => {
                  const cat = categories.find((c) => c.id === t.categoryId);
                  const bank = banks.find((b) => b.id === t.bankId);
                  const isLast = idx === group.transactions.length - 1;

                  return (
                    <TransactionItem
                      key={t.id}
                      transaction={t}
                      category={cat}
                      bank={bank}
                      isBalanceHidden={isBalanceHidden}
                      showDate={false}
                      showTime={true}
                      showActions={true}
                      isLast={isLast}
                      onEdit={onEditTransaction}
                      onDelete={onDeleteTransaction}
                      onCategoryClick={(catId) => setFilterCategoryId(catId === filterCategoryId ? 'all' : catId)}
                      isCategorySelected={filterCategoryId === t.categoryId}
                    />
                  );
                })}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
