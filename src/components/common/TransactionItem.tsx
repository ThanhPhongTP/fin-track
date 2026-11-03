import React, { useMemo } from 'react';
import { Edit2, Trash2, Calendar, Clock } from 'lucide-react';
import type { BankAccount, Category, Transaction } from '../../types/finance.ts';
import { CategoryIcon } from './CategoryIcon.tsx';
import { formatVND, formatDisplayDate } from '../../services/financeEngine.ts';

export interface TransactionItemProps {
  transaction: Transaction;
  category?: Category;
  bank?: BankAccount;
  isBalanceHidden?: boolean;
  showDate?: boolean;
  showTime?: boolean;
  showActions?: boolean;
  isLast?: boolean;
  onEdit?: (tx: Transaction) => void;
  onDelete?: (id: string) => void;
  onCategoryClick?: (categoryId: string) => void;
  isCategorySelected?: boolean;
  className?: string;
  style?: React.CSSProperties;
}

export const TransactionItem: React.FC<TransactionItemProps> = ({
  transaction,
  category,
  bank,
  isBalanceHidden = false,
  showDate = false,
  showTime = true,
  showActions = true,
  isLast = false,
  onEdit,
  onDelete,
  onCategoryClick,
  isCategorySelected = false,
  className = '',
  style = {},
}) => {
  const cat = category || {
    id: transaction.categoryId,
    name: 'Chung',
    icon: 'CircleEllipsis',
    color: '#94a3b8',
  };
  const isIncome = transaction.type === 'income';

  // Lấy giờ phút từ createdAt (VD: 14:30) nếu có
  const timeStr = useMemo(() => {
    if (!showTime || !transaction.createdAt || !transaction.createdAt.includes('T')) return null;
    try {
      const d = new Date(transaction.createdAt);
      if (isNaN(d.getTime())) return null;
      return d.toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit', hour12: false });
    } catch {
      return null;
    }
  }, [showTime, transaction.createdAt]);

  const hasNote = Boolean(transaction.note && transaction.note.trim());

  return (
    <div
      onClick={() => onEdit?.(transaction)}
      className={`transaction-item ${className}`.trim()}
      style={{
        display: 'flex',
        flexDirection: 'column',
        padding: '11px 4px',
        borderBottom: isLast ? 'none' : '1px solid rgba(255, 255, 255, 0.05)',
        cursor: onEdit ? 'pointer' : 'default',
        borderRadius: '8px',
        transition: 'background 0.15s ease',
        ...style,
      }}
    >
      {/* KHỐI TRÊN: 2 HÀNG THÔNG TIN CÂN ĐỐI (TRÁI: TÊN & TÀI KHOẢN | PHẢI: TIỀN & THAO TÁC) */}
      <div
        style={{
          display: 'flex',
          alignItems: 'flex-start',
          justifyContent: 'space-between',
          gap: '10px',
        }}
      >
        {/* Cột trái: Icon + Hạng mục (Dòng 1) + Tài khoản/Ngày/Giờ (Dòng 2) */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '9px', minWidth: 0, flex: 1 }}>
          {/* Icon danh mục */}
          <div
            onClick={(e) => {
              if (onCategoryClick) {
                e.stopPropagation();
                onCategoryClick(cat.id);
              }
            }}
            title={onCategoryClick ? `Lọc theo "${cat.name}"` : undefined}
            style={{
              width: '36px',
              height: '36px',
              borderRadius: '10px',
              background: `${cat.color}1e`,
              color: cat.color,
              border: `1px solid ${cat.color}30`,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              flexShrink: 0,
              cursor: onCategoryClick ? 'pointer' : 'inherit',
              transition: 'transform 0.12s ease',
            }}
          >
            <CategoryIcon name={cat.icon} size={18} color={cat.color} />
          </div>

          {/* Chi tiết văn bản: Dòng 1 Tên GD, Dòng 2 Tag Bank/Time */}
          <div style={{ minWidth: 0, flex: 1 }}>
            {/* Dòng 1: Tên hạng mục */}
            <div
              style={{
                fontSize: '0.885rem',
                fontWeight: 700,
                color: isCategorySelected ? '#38bdf8' : '#f8fafc',
                overflow: 'hidden',
                textOverflow: 'ellipsis',
                whiteSpace: 'nowrap',
                lineHeight: 1.25,
                marginBottom: '3px',
              }}
              title={cat.name}
            >
              {cat.name}
            </div>

            {/* Dòng 2: Badge Tài khoản, Ngày, Giờ */}
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '6px',
                flexWrap: 'wrap',
                fontSize: '0.72rem',
                color: 'var(--text-muted)',
              }}
            >
              {/* Badge Tài khoản */}
              <span
                style={{
                  fontSize: '0.65rem',
                  fontWeight: 600,
                  padding: '1px 6px',
                  borderRadius: 'var(--radius-full)',
                  background: bank?.color ? `${bank.color}18` : 'rgba(56, 189, 248, 0.1)',
                  color: bank?.color || '#38bdf8',
                  border: `1px solid ${bank?.color ? `${bank.color}35` : 'rgba(56, 189, 248, 0.2)'}`,
                  flexShrink: 0,
                }}
              >
                {bank?.name || 'Tài khoản'}
              </span>

              {/* Ngày giao dịch (nếu showDate = true) */}
              {showDate && transaction.date && (
                <span
                  style={{
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '3px',
                    color: 'var(--text-muted)',
                    flexShrink: 0,
                    fontSize: '0.7rem',
                  }}
                >
                  <Calendar size={11} style={{ opacity: 0.7 }} />
                  {formatDisplayDate(transaction.date)}
                </span>
              )}

              {/* Giờ tạo giao dịch (nếu có) */}
              {timeStr && (
                <span
                  style={{
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '2px',
                    color: 'var(--text-muted)',
                    opacity: 0.8,
                    flexShrink: 0,
                    fontSize: '0.68rem',
                  }}
                >
                  <Clock size={10} style={{ opacity: 0.6 }} />
                  {timeStr}
                </span>
              )}
            </div>
          </div>
        </div>

        {/* Cột phải: Số tiền (Dòng 1) + Nút thao tác Sửa/Xoá (Dòng 2) */}
        <div
          style={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'flex-end',
            gap: '3px',
            flexShrink: 0,
          }}
        >
          {/* Dòng 1: Số tiền */}
          <div
            style={{
              fontSize: '0.94rem',
              fontWeight: 800,
              fontFamily: 'var(--font-mono)',
              color: isIncome ? 'var(--accent-income)' : 'var(--accent-expense)',
              textAlign: 'right',
              letterSpacing: '-0.01em',
              lineHeight: 1.25,
            }}
          >
            {isIncome ? '+' : '-'}
            {formatVND(transaction.amount, isBalanceHidden)}
          </div>

          {/* Dòng 2: Nút thao tác nhanh (nếu showActions = true) */}
          {showActions && (
            <div
              style={{ display: 'flex', alignItems: 'center', gap: '3px', marginTop: '1px' }}
              onClick={(e) => e.stopPropagation()}
            >
              {onEdit && (
                <button
                  type="button"
                  className="btn-icon"
                  onClick={() => onEdit(transaction)}
                  title="Sửa giao dịch"
                  style={{
                    width: '24px',
                    height: '24px',
                    borderRadius: '6px',
                    background: 'rgba(255, 255, 255, 0.05)',
                    border: '1px solid rgba(255, 255, 255, 0.08)',
                    color: 'var(--text-secondary)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    cursor: 'pointer',
                  }}
                >
                  <Edit2 size={11} />
                </button>
              )}
              {onDelete && (
                <button
                  type="button"
                  className="btn-icon"
                  onClick={() => {
                    if (confirm(`Xoá giao dịch "${cat.name}" số tiền ${formatVND(transaction.amount)}?`)) {
                      onDelete(transaction.id);
                    }
                  }}
                  title="Xoá giao dịch"
                  style={{
                    width: '24px',
                    height: '24px',
                    borderRadius: '6px',
                    background: 'rgba(244, 63, 94, 0.08)',
                    border: '1px solid rgba(244, 63, 94, 0.2)',
                    color: '#f43f5e',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    cursor: 'pointer',
                  }}
                >
                  <Trash2 size={11} />
                </button>
              )}
            </div>
          )}
        </div>
      </div>

      {/* PHẦN GHI CHÚ: TỰ NHIÊN, KHÔNG ĐÓNG KHUNG */}
      {hasNote && (
        <div
          style={{
            marginTop: '4px',
            marginLeft: '45px', // Thẳng hàng với tiêu đề bên cạnh Icon
            fontSize: '0.76rem',
            color: 'var(--text-secondary)',
            lineHeight: 1.4,
            wordBreak: 'break-word',
            whiteSpace: 'pre-wrap',
          }}
        >
          {transaction.note}
        </div>
      )}
    </div>
  );
};

