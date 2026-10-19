import React, { useState, useEffect } from 'react';
import { X, Check, Banknote, Calendar, Tag, FileText } from 'lucide-react';
import type { BankAccount, Category, Transaction, TransactionType } from '../../types/finance.ts';
import { CategoryIcon } from '../common/CategoryIcon.tsx';
import { getTodayDateString } from '../../services/financeEngine.ts';

interface TransactionModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (txData: {
    type: TransactionType;
    bankId: string;
    amount: number;
    categoryId: string;
    date: string;
    note?: string;
  }) => void;
  banks: BankAccount[];
  categories: Category[];
  initialData?: Transaction | null;
}

export const TransactionModal: React.FC<TransactionModalProps> = ({
  isOpen,
  onClose,
  onSave,
  banks,
  categories,
  initialData,
}) => {
  const [type, setType] = useState<TransactionType>('expense');
  const [amountStr, setAmountStr] = useState<string>('');
  const [bankId, setBankId] = useState<string>('');
  const [categoryId, setCategoryId] = useState<string>('');
  const [date, setDate] = useState<string>(getTodayDateString());
  const [note, setNote] = useState<string>('');
  const [error, setError] = useState<string>('');

  useEffect(() => {
    if (isOpen) {
      if (initialData) {
        setType(initialData.type);
        setAmountStr(String(initialData.amount));
        setBankId(initialData.bankId);
        setCategoryId(initialData.categoryId);
        setDate(initialData.date);
        setNote(initialData.note || '');
      } else {
        setType('expense');
        setAmountStr('');
        setBankId(banks[0]?.id || '');
        // Mặc định chọn danh mục đầu tiên của expense
        const firstExpenseCat = categories.find((c) => c.type === 'expense');
        setCategoryId(firstExpenseCat?.id || 'exp_food');
        setDate(getTodayDateString());
        setNote('');
      }
      setError('');
    }
  }, [isOpen, initialData, banks, categories]);

  if (!isOpen) return null;

  // Lọc categories theo loại (expense / income)
  const availableCategories = categories.filter((c) => c.type === type);

  // Xử lý đổi type (expense <-> income)
  const handleTypeChange = (newType: TransactionType) => {
    setType(newType);
    const firstCat = categories.find((c) => c.type === newType);
    if (firstCat) setCategoryId(firstCat.id);
  };

  // Format số tiền khi nhập
  const handleAmountChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const rawVal = e.target.value.replace(/\D/g, '');
    setAmountStr(rawVal);
    setError('');
  };

  // Quick preset amount
  const addPresetAmount = (preset: number) => {
    const current = parseInt(amountStr, 10) || 0;
    setAmountStr(String(current + preset));
    setError('');
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const parsedAmount = parseInt(amountStr, 10);
    if (!parsedAmount || parsedAmount <= 0) {
      setError('Vui lòng nhập số tiền hợp lệ (> 0đ)');
      return;
    }
    if (!bankId) {
      setError('Vui lòng chọn tài khoản ngân hàng');
      return;
    }
    if (!categoryId) {
      setError('Vui lòng chọn hạng mục');
      return;
    }

    onSave({
      type,
      bankId,
      amount: parsedAmount,
      categoryId,
      date,
      note: note.trim(),
    });
    onClose();
  };

  const formattedDisplayAmount = amountStr
    ? `${new Intl.NumberFormat('vi-VN').format(parseInt(amountStr, 10))} ₫`
    : '0 ₫';

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content" onClick={(e) => e.stopPropagation()}>
        {/* Header Modal */}
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            padding: '18px 20px',
            borderBottom: '1px solid var(--border-subtle)',
          }}
        >
          <h2 style={{ fontSize: '1.2rem', fontWeight: 700, color: '#f8fafc' }}>
            {initialData ? 'Chỉnh Sửa Giao Dịch' : 'Thêm Giao Dịch Mới'}
          </h2>
          <button type="button" className="btn-icon" onClick={onClose}>
            <X size={20} />
          </button>
        </div>

        <form onSubmit={handleSubmit} style={{ padding: '20px' }}>
          {/* Toggle Type: Chi Tiêu / Thu Nhập */}
          <div
            style={{
              display: 'flex',
              background: 'rgba(255, 255, 255, 0.05)',
              borderRadius: 'var(--radius-md)',
              padding: '4px',
              marginBottom: '20px',
              border: '1px solid var(--border-subtle)',
            }}
          >
            <button
              type="button"
              onClick={() => handleTypeChange('expense')}
              style={{
                flex: 1,
                padding: '10px 0',
                borderRadius: '10px',
                border: 'none',
                background: type === 'expense' ? 'var(--accent-expense)' : 'transparent',
                color: type === 'expense' ? '#ffffff' : 'var(--text-secondary)',
                fontWeight: 700,
                fontSize: '0.9rem',
                cursor: 'pointer',
                transition: 'all 0.15s ease',
              }}
            >
              Khoản Chi (Tiêu)
            </button>
            <button
              type="button"
              onClick={() => handleTypeChange('income')}
              style={{
                flex: 1,
                padding: '10px 0',
                borderRadius: '10px',
                border: 'none',
                background: type === 'income' ? 'var(--accent-income)' : 'transparent',
                color: type === 'income' ? '#ffffff' : 'var(--text-secondary)',
                fontWeight: 700,
                fontSize: '0.9rem',
                cursor: 'pointer',
                transition: 'all 0.15s ease',
              }}
            >
              Khoản Thu (Tiền vào)
            </button>
          </div>

          {/* Input Số Tiền Lớn Trực Quan */}
          <div style={{ marginBottom: '16px', textAlign: 'center' }}>
            <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
              Số tiền ({type === 'expense' ? 'Đã chi' : 'Thu được'})
            </span>
            <div
              style={{
                fontSize: '2rem',
                fontWeight: 800,
                color: type === 'expense' ? 'var(--accent-expense)' : 'var(--accent-income)',
                margin: '8px 0',
                fontFamily: 'var(--font-mono)',
              }}
            >
              {formattedDisplayAmount}
            </div>
            <input
              type="text"
              inputMode="numeric"
              placeholder="Nhập số tiền..."
              value={amountStr}
              onChange={handleAmountChange}
              autoFocus
              className="form-input"
              style={{
                textAlign: 'center',
                fontSize: '1.2rem',
                fontWeight: 600,
                fontFamily: 'var(--font-mono)',
              }}
            />
          </div>

          {/* Quick Amount Buttons */}
          <div
            style={{
              display: 'flex',
              gap: '6px',
              flexWrap: 'wrap',
              justifyContent: 'center',
              marginBottom: '20px',
            }}
          >
            {[50000, 100000, 200000, 500000, 1000000, 2000000].map((val) => (
              <button
                key={val}
                type="button"
                onClick={() => addPresetAmount(val)}
                style={{
                  background: 'rgba(255, 255, 255, 0.06)',
                  border: '1px solid var(--border-subtle)',
                  borderRadius: 'var(--radius-sm)',
                  color: 'var(--text-secondary)',
                  padding: '5px 9px',
                  fontSize: '0.78rem',
                  fontFamily: 'var(--font-mono)',
                  cursor: 'pointer',
                }}
              >
                +{val >= 1000000 ? `${val / 1000000}tr` : `${val / 1000}k`}
              </button>
            ))}
          </div>

          {/* Chọn Tài Khoản Ngân Hàng */}
          <div className="form-group">
            <label className="form-label">
              <Banknote size={14} style={{ display: 'inline', marginRight: '6px' }} />
              {type === 'expense' ? 'Trừ tiền từ Ngân hàng / Ví' : 'Cộng tiền vào Ngân hàng / Ví'}
            </label>
            <select
              value={bankId}
              onChange={(e) => setBankId(e.target.value)}
              className="form-select"
            >
              {banks.map((b) => (
                <option key={b.id} value={b.id}>
                  {b.name} {b.accountNumber ? `(${b.accountNumber})` : ''}
                </option>
              ))}
            </select>
          </div>

          {/* Chọn Hạng Mục (Grid Icons) */}
          <div className="form-group">
            <label className="form-label">
              <Tag size={14} style={{ display: 'inline', marginRight: '6px' }} />
              Hạng mục ({availableCategories.length})
            </label>
            <div
              style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fill, minmax(130px, 1fr))',
                gap: '8px',
                maxHeight: '180px',
                overflowY: 'auto',
                padding: '4px',
              }}
            >
              {availableCategories.map((cat) => {
                const isSelected = categoryId === cat.id;
                const isCashWithdrawal = cat.id === 'exp_cash';
                return (
                  <button
                    key={cat.id}
                    type="button"
                    onClick={() => setCategoryId(cat.id)}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '8px',
                      padding: '8px 10px',
                      borderRadius: 'var(--radius-md)',
                      border: isSelected
                        ? `2px solid ${cat.color}`
                        : isCashWithdrawal
                        ? '1px dashed #10b981'
                        : '1px solid var(--border-subtle)',
                      background: isSelected
                        ? 'rgba(255, 255, 255, 0.1)'
                        : isCashWithdrawal
                        ? 'rgba(16, 185, 129, 0.08)'
                        : 'rgba(255, 255, 255, 0.03)',
                      color: isSelected ? '#ffffff' : 'var(--text-primary)',
                      cursor: 'pointer',
                      textAlign: 'left',
                      fontSize: '0.825rem',
                      fontWeight: isSelected ? 700 : 500,
                      transition: 'all 0.12s ease',
                    }}
                  >
                    <div
                      style={{
                        width: '28px',
                        height: '28px',
                        borderRadius: '8px',
                        background: `${cat.color}25`,
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        color: cat.color,
                        flexShrink: 0,
                      }}
                    >
                      <CategoryIcon name={cat.icon} size={16} color={cat.color} />
                    </div>
                    <span style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                      {cat.name}
                    </span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Ngày Giao Dịch */}
          <div className="form-group">
            <label className="form-label">
              <Calendar size={14} style={{ display: 'inline', marginRight: '6px' }} />
              Ngày giao dịch
            </label>
            <input
              type="date"
              value={date}
              onChange={(e) => setDate(e.target.value)}
              className="form-input"
            />
          </div>

          {/* Ghi chú */}
          <div className="form-group">
            <label className="form-label">
              <FileText size={14} style={{ display: 'inline', marginRight: '6px' }} />
              Ghi chú (Tuỳ chọn)
            </label>
            <input
              type="text"
              placeholder={categoryId === 'exp_cash' ? 'Ví dụ: Rút ATM cây VCB phố Huế tiêu vặt' : 'Ghi chú chi tiết...'}
              value={note}
              onChange={(e) => setNote(e.target.value)}
              className="form-input"
            />
          </div>

          {error && (
            <p style={{ color: '#f43f5e', fontSize: '0.85rem', marginBottom: '14px', textAlign: 'center' }}>
              {error}
            </p>
          )}

          {/* Action buttons */}
          <div style={{ display: 'flex', gap: '10px', marginTop: '24px' }}>
            <button
              type="button"
              className="btn btn-secondary"
              onClick={onClose}
              style={{ flex: 1 }}
            >
              Hủy
            </button>
            <button
              type="submit"
              className="btn btn-primary"
              style={{
                flex: 2,
                background: type === 'expense'
                  ? 'linear-gradient(135deg, #f43f5e 0%, #be123c 100%)'
                  : 'linear-gradient(135deg, #10b981 0%, #047857 100%)',
                boxShadow: type === 'expense'
                  ? '0 4px 15px rgba(244, 63, 94, 0.35)'
                  : '0 4px 15px rgba(16, 185, 129, 0.35)',
              }}
            >
              <Check size={18} />
              {initialData ? 'Lưu Thay Đổi' : 'Xác Nhận Thêm'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
