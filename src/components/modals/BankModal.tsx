import React, { useState, useEffect } from 'react';
import { X, Check, Landmark, Trash2 } from 'lucide-react';
import type { BankAccount } from '../../types/finance.ts';

interface BankModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (bankData: {
    name: string;
    initialBalance: number;
    color: string;
    accountNumber?: string;
  }) => void;
  onDelete?: (id: string) => void;
  initialData?: BankAccount | null;
}

const PRESET_COLORS = [
  '#008453', // VCB Green
  '#e01a22', // Techcombank Red
  '#003b7a', // MB Navy Blue
  '#0d9488', // Teal Cash
  '#6366f1', // Indigo
  '#8b5cf6', // Violet
  '#ec4899', // Pink
  '#f59e0b', // Amber
  '#0284c7', // Sky Blue
  '#334155', // Slate
];

export const BankModal: React.FC<BankModalProps> = ({
  isOpen,
  onClose,
  onSave,
  onDelete,
  initialData,
}) => {
  const [name, setName] = useState<string>('');
  const [balanceStr, setBalanceStr] = useState<string>('');
  const [accountNumber, setAccountNumber] = useState<string>('');
  const [color, setColor] = useState<string>(PRESET_COLORS[0]);
  const [error, setError] = useState<string>('');

  useEffect(() => {
    if (isOpen) {
      if (initialData) {
        setName(initialData.name);
        setBalanceStr(String(initialData.initialBalance));
        setAccountNumber(initialData.accountNumber || '');
        setColor(initialData.color || PRESET_COLORS[0]);
      } else {
        setName('');
        setBalanceStr('');
        setAccountNumber('');
        setColor(PRESET_COLORS[0]);
      }
      setError('');
    }
  }, [isOpen, initialData]);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) {
      setError('Vui lòng nhập tên tài khoản hoặc ngân hàng');
      return;
    }

    const parsedBalance = parseInt(balanceStr, 10);
    if (isNaN(parsedBalance) || parsedBalance < 0) {
      setError('Vui lòng nhập số dư ban đầu hợp lệ (>= 0đ)');
      return;
    }

    onSave({
      name: name.trim(),
      initialBalance: parsedBalance,
      color,
      accountNumber: accountNumber.trim() || undefined,
    });
    onClose();
  };

  const handleAmountChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const rawVal = e.target.value.replace(/\D/g, '');
    setBalanceStr(rawVal);
    setError('');
  };

  const formattedBalance = balanceStr
    ? `${new Intl.NumberFormat('vi-VN').format(parseInt(balanceStr, 10))} ₫`
    : '0 ₫';

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content" onClick={(e) => e.stopPropagation()}>
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            padding: '18px 20px',
            borderBottom: '1px solid var(--border-subtle)',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <Landmark size={20} color="#38bdf8" />
            <h2 style={{ fontSize: '1.15rem', fontWeight: 700, color: '#f8fafc' }}>
              {initialData ? 'Chỉnh Sửa Tài Khoản Bank' : 'Thêm Tài Khoản / Bank Mới'}
            </h2>
          </div>
          <button type="button" className="btn-icon" onClick={onClose}>
            <X size={20} />
          </button>
        </div>

        <form onSubmit={handleSubmit} style={{ padding: '20px' }}>
          {/* Card Preview */}
          <div
            style={{
              padding: '18px 20px',
              borderRadius: 'var(--radius-lg)',
              background: `linear-gradient(135deg, ${color}cc 0%, ${color}66 100%)`,
              border: `1px solid ${color}`,
              boxShadow: `0 8px 20px ${color}33`,
              marginBottom: '20px',
              color: '#ffffff',
            }}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
              <span style={{ fontSize: '0.85rem', fontWeight: 600, opacity: 0.9 }}>
                {name || 'Tên Ngân hàng'}
              </span>
              <Landmark size={18} style={{ opacity: 0.8 }} />
            </div>
            <div style={{ fontSize: '0.75rem', opacity: 0.8, textTransform: 'uppercase' }}>
              Số dư khởi tạo
            </div>
            <div style={{ fontSize: '1.4rem', fontWeight: 800, fontFamily: 'var(--font-mono)' }}>
              {formattedBalance}
            </div>
            {accountNumber && (
              <div style={{ fontSize: '0.8rem', opacity: 0.85, marginTop: '8px', fontFamily: 'var(--font-mono)' }}>
                {accountNumber}
              </div>
            )}
          </div>

          <div className="form-group">
            <label className="form-label">Tên Ngân Hàng / Ví Tiền</label>
            <input
              type="text"
              placeholder="VD: Vietcombank, Techcombank, Tiền mặt..."
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="form-input"
              autoFocus
            />
          </div>

          <div className="form-group">
            <label className="form-label">Số Dư Khởi Tạo Ban Đầu</label>
            <input
              type="text"
              inputMode="numeric"
              placeholder="VD: 50000000"
              value={balanceStr}
              onChange={handleAmountChange}
              className="form-input mono-num"
            />
          </div>

          <div className="form-group">
            <label className="form-label">Số Tài Khoản / Ghi Chú Ngắn</label>
            <input
              type="text"
              placeholder="VD: **** 8868 hoặc Thẻ chính"
              value={accountNumber}
              onChange={(e) => setAccountNumber(e.target.value)}
              className="form-input"
            />
          </div>

          {/* Chọn Màu Sắc */}
          <div className="form-group">
            <label className="form-label">Màu Thẻ Đại Diện</label>
            <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
              {PRESET_COLORS.map((c) => (
                <button
                  key={c}
                  type="button"
                  onClick={() => setColor(c)}
                  style={{
                    width: '32px',
                    height: '32px',
                    borderRadius: '50%',
                    backgroundColor: c,
                    border: color === c ? '3px solid #ffffff' : '1px solid rgba(255,255,255,0.2)',
                    transform: color === c ? 'scale(1.15)' : 'scale(1)',
                    cursor: 'pointer',
                    transition: 'all 0.1s ease',
                  }}
                />
              ))}
            </div>
          </div>

          {error && (
            <p style={{ color: '#f43f5e', fontSize: '0.85rem', marginBottom: '14px' }}>
              {error}
            </p>
          )}

          <div style={{ display: 'flex', gap: '10px', marginTop: '24px' }}>
            {initialData && onDelete && (
              <button
                type="button"
                className="btn btn-secondary"
                onClick={() => {
                  if (confirm(`Bạn có chắc muốn xoá tài khoản "${initialData.name}"?`)) {
                    onDelete(initialData.id);
                    onClose();
                  }
                }}
                style={{ color: '#f43f5e', borderColor: 'rgba(244, 63, 94, 0.3)' }}
              >
                <Trash2 size={16} />
              </button>
            )}
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
              style={{ flex: 2 }}
            >
              <Check size={18} />
              {initialData ? 'Cập Nhật' : 'Tạo Tài Khoản'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
