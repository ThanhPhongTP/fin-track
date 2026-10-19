import React, { useState, useEffect } from 'react';
import { X, Check, Coins, TrendingUp, Trash2 } from 'lucide-react';
import type { InvestmentAsset, AssetType } from '../../types/finance.ts';

interface AssetModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (assetData: {
    name: string;
    type: AssetType;
    quantity: number;
    unit: string;
    currentValue: number;
    purchaseValue?: number;
    note?: string;
  }) => void;
  onDelete?: (id: string) => void;
  initialData?: InvestmentAsset | null;
  defaultType?: AssetType;
}

export const AssetModal: React.FC<AssetModalProps> = ({
  isOpen,
  onClose,
  onSave,
  onDelete,
  initialData,
  defaultType = 'gold',
}) => {
  const [type, setType] = useState<AssetType>(defaultType);
  const [name, setName] = useState<string>('');
  const [quantityStr, setQuantityStr] = useState<string>('');
  const [unit, setUnit] = useState<string>('chỉ');
  const [currentValueStr, setCurrentValueStr] = useState<string>('');
  const [purchaseValueStr, setPurchaseValueStr] = useState<string>('');
  const [note, setNote] = useState<string>('');
  const [error, setError] = useState<string>('');

  useEffect(() => {
    if (isOpen) {
      if (initialData) {
        setType(initialData.type);
        setName(initialData.name);
        setQuantityStr(String(initialData.quantity));
        setUnit(initialData.unit);
        setCurrentValueStr(String(initialData.currentValue));
        setPurchaseValueStr(initialData.purchaseValue ? String(initialData.purchaseValue) : '');
        setNote(initialData.note || '');
      } else {
        setType(defaultType);
        setName(defaultType === 'gold' ? 'Vàng nhẫn 9999' : 'Chứng chỉ quỹ DCDS');
        setQuantityStr(defaultType === 'gold' ? '1' : '500');
        setUnit(defaultType === 'gold' ? 'chỉ' : 'CCQ');
        setCurrentValueStr('');
        setPurchaseValueStr('');
        setNote('');
      }
      setError('');
    }
  }, [isOpen, initialData, defaultType]);

  if (!isOpen) return null;

  const handleTypeChange = (newType: AssetType) => {
    setType(newType);
    if (!initialData) {
      if (newType === 'gold') {
        setName('Vàng nhẫn 9999');
        setUnit('chỉ');
        setQuantityStr('1');
      } else {
        setName('Chứng chỉ quỹ DCDS');
        setUnit('CCQ');
        setQuantityStr('500');
      }
    }
  };

  const handleCurrentValueChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const rawVal = e.target.value.replace(/\D/g, '');
    setCurrentValueStr(rawVal);
    setError('');
  };

  const handlePurchaseValueChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const rawVal = e.target.value.replace(/\D/g, '');
    setPurchaseValueStr(rawVal);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) {
      setError('Vui lòng nhập tên tài sản');
      return;
    }

    const qty = parseFloat(quantityStr);
    if (isNaN(qty) || qty <= 0) {
      setError('Vui lòng nhập số lượng hợp lệ (> 0)');
      return;
    }

    const curVal = parseInt(currentValueStr, 10);
    if (isNaN(curVal) || curVal <= 0) {
      setError('Vui lòng nhập tổng giá trị thị trường hiện tại (> 0đ)');
      return;
    }

    const purVal = purchaseValueStr ? parseInt(purchaseValueStr, 10) : undefined;

    onSave({
      name: name.trim(),
      type,
      quantity: qty,
      unit: unit.trim() || (type === 'gold' ? 'chỉ' : 'CCQ'),
      currentValue: curVal,
      purchaseValue: purVal,
      note: note.trim() || undefined,
    });
    onClose();
  };

  const formattedCurrentValue = currentValueStr
    ? `${new Intl.NumberFormat('vi-VN').format(parseInt(currentValueStr, 10))} ₫`
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
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            {type === 'gold' ? (
              <Coins size={22} color="#eab308" />
            ) : (
              <TrendingUp size={22} color="#a855f7" />
            )}
            <h2 style={{ fontSize: '1.15rem', fontWeight: 700, color: '#f8fafc' }}>
              {initialData ? 'Chỉnh Sửa Tài Sản' : 'Thêm Vàng / Chứng Chỉ Quỹ'}
            </h2>
          </div>
          <button type="button" className="btn-icon" onClick={onClose}>
            <X size={20} />
          </button>
        </div>

        <form onSubmit={handleSubmit} style={{ padding: '20px' }}>
          {/* Toggle Type: Vàng / Chứng Chỉ Quỹ */}
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
              onClick={() => handleTypeChange('gold')}
              style={{
                flex: 1,
                padding: '10px 0',
                borderRadius: '10px',
                border: 'none',
                background: type === 'gold' ? 'linear-gradient(135deg, #eab308, #ca8a04)' : 'transparent',
                color: type === 'gold' ? '#0f172a' : 'var(--text-secondary)',
                fontWeight: 700,
                fontSize: '0.9rem',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '6px',
                transition: 'all 0.15s ease',
              }}
            >
              <Coins size={16} /> Vàng (Tích Trữ)
            </button>
            <button
              type="button"
              onClick={() => handleTypeChange('fund')}
              style={{
                flex: 1,
                padding: '10px 0',
                borderRadius: '10px',
                border: 'none',
                background: type === 'fund' ? 'linear-gradient(135deg, #a855f7, #7c3aed)' : 'transparent',
                color: type === 'fund' ? '#ffffff' : 'var(--text-secondary)',
                fontWeight: 700,
                fontSize: '0.9rem',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '6px',
                transition: 'all 0.15s ease',
              }}
            >
              <TrendingUp size={16} /> Chứng Chỉ Quỹ (CCQ)
            </button>
          </div>

          {/* Card Preview Giá Trị */}
          <div
            style={{
              padding: '16px 20px',
              borderRadius: 'var(--radius-lg)',
              background: type === 'gold'
                ? 'linear-gradient(135deg, rgba(234, 179, 8, 0.18) 0%, rgba(202, 138, 4, 0.08) 100%)'
                : 'linear-gradient(135deg, rgba(168, 85, 247, 0.18) 0%, rgba(124, 58, 237, 0.08) 100%)',
              border: type === 'gold' ? '1px solid rgba(234, 179, 8, 0.3)' : '1px solid rgba(168, 85, 247, 0.3)',
              marginBottom: '20px',
              textAlign: 'center',
            }}
          >
            <div style={{ fontSize: '0.75rem', color: type === 'gold' ? '#facc15' : '#c084fc', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
              Tổng Giá Trị Quy Đổi VND
            </div>
            <div
              style={{
                fontSize: '1.8rem',
                fontWeight: 800,
                fontFamily: 'var(--font-mono)',
                color: type === 'gold' ? '#fef08a' : '#f3e8ff',
                margin: '4px 0',
              }}
            >
              {formattedCurrentValue}
            </div>
            <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
              {quantityStr || '0'} {unit} • {name || (type === 'gold' ? 'Vàng' : 'Chứng chỉ quỹ')}
            </div>

            {/* Preview Lời / Lỗ thời gian thực */}
            {currentValueStr && purchaseValueStr && parseInt(currentValueStr, 10) > 0 && parseInt(purchaseValueStr, 10) > 0 && (
              (() => {
                const cur = parseInt(currentValueStr, 10);
                const pur = parseInt(purchaseValueStr, 10);
                const diff = cur - pur;
                const pct = (diff / pur) * 100;
                const isProf = diff >= 0;
                return (
                  <div
                    style={{
                      marginTop: '8px',
                      display: 'inline-flex',
                      alignItems: 'center',
                      gap: '4px',
                      padding: '3px 10px',
                      borderRadius: '6px',
                      fontSize: '0.8rem',
                      fontWeight: 700,
                      fontFamily: 'var(--font-mono)',
                      color: isProf ? '#10b981' : '#f43f5e',
                      background: isProf ? 'rgba(16, 185, 129, 0.18)' : 'rgba(244, 63, 94, 0.18)',
                      border: `1px solid ${isProf ? 'rgba(16, 185, 129, 0.3)' : 'rgba(244, 63, 94, 0.3)'}`,
                    }}
                  >
                    <span>{isProf ? 'Dự kiến Lời: +' : 'Dự kiến Lỗ: '}</span>
                    <span>{new Intl.NumberFormat('vi-VN').format(diff)} ₫ ({pct >= 0 ? '+' : ''}{pct.toFixed(1)}%)</span>
                  </div>
                );
              })()
            )}
          </div>

          {/* Tên tài sản */}
          <div className="form-group">
            <label className="form-label">
              Tên {type === 'gold' ? 'loại vàng' : 'quỹ đầu tư'}
            </label>
            <input
              type="text"
              placeholder={type === 'gold' ? 'VD: Vàng nhẫn 9999, Vàng SJC...' : 'VD: Quỹ DCDS, Quỹ VESAF...'}
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="form-input"
              autoFocus
            />
          </div>

          {/* Số lượng & Đơn vị */}
          <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: '10px' }} className="form-group">
            <div>
              <label className="form-label">Số Lượng Sở Hữu</label>
              <input
                type="number"
                step="any"
                placeholder={type === 'gold' ? 'VD: 1.5' : 'VD: 500'}
                value={quantityStr}
                onChange={(e) => setQuantityStr(e.target.value)}
                className="form-input mono-num"
              />
            </div>
            <div>
              <label className="form-label">Đơn Vị</label>
              {type === 'gold' ? (
                <select
                  value={unit}
                  onChange={(e) => setUnit(e.target.value)}
                  className="form-select"
                >
                  <option value="chỉ">chỉ</option>
                  <option value="lượng">lượng (cây)</option>
                  <option value="phân">phân</option>
                  <option value="gam">gam</option>
                </select>
              ) : (
                <input
                  type="text"
                  value={unit}
                  onChange={(e) => setUnit(e.target.value)}
                  placeholder="CCQ"
                  className="form-input"
                />
              )}
            </div>
          </div>

          {/* Giá trị thị trường hiện tại */}
          <div className="form-group">
            <label className="form-label">
              Tổng Giá Trị Hiện Tại (VND)
            </label>
            <input
              type="text"
              inputMode="numeric"
              placeholder="VD: 16000000"
              value={currentValueStr}
              onChange={handleCurrentValueChange}
              className="form-input mono-num"
            />
            <span style={{ fontSize: '0.725rem', color: 'var(--text-muted)', marginTop: '4px', display: 'block' }}>
              *Bạn có thể vào sửa giá trị này bất cứ lúc nào khi giá vàng hoặc NAV quỹ tăng/giảm.
            </span>
          </div>

          {/* Giá vốn mua ban đầu */}
          <div className="form-group">
            <label className="form-label">Giá Vốn Mua Ban Đầu (Để tính Lời / Lỗ)</label>
            <input
              type="text"
              inputMode="numeric"
              placeholder="VD: 15000000"
              value={purchaseValueStr}
              onChange={handlePurchaseValueChange}
              className="form-input mono-num"
            />
            <span style={{ fontSize: '0.725rem', color: 'var(--text-muted)', marginTop: '4px', display: 'block' }}>
              *Nhập tổng số tiền bạn đã chi ra lúc mua để app tính toán số tiền và % lời/lỗ tự động.
            </span>
          </div>

          {/* Ghi chú */}
          <div className="form-group">
            <label className="form-label">Ghi Chú</label>
            <input
              type="text"
              placeholder={type === 'gold' ? 'VD: Mua tiệm vàng Mi Hồng' : 'VD: Mua qua Fmarket / Dragon Capital'}
              value={note}
              onChange={(e) => setNote(e.target.value)}
              className="form-input"
            />
          </div>

          {error && (
            <p style={{ color: '#f43f5e', fontSize: '0.85rem', marginBottom: '14px' }}>
              {error}
            </p>
          )}

          {/* Action buttons */}
          <div style={{ display: 'flex', gap: '10px', marginTop: '24px' }}>
            {initialData && onDelete && (
              <button
                type="button"
                className="btn btn-secondary"
                onClick={() => {
                  if (confirm(`Bạn có chắc muốn xoá "${initialData.name}"?`)) {
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
              style={{
                flex: 2,
                background: type === 'gold'
                  ? 'linear-gradient(135deg, #eab308 0%, #ca8a04 100%)'
                  : 'linear-gradient(135deg, #a855f7 0%, #7c3aed 100%)',
                color: type === 'gold' ? '#0f172a' : '#ffffff',
                boxShadow: type === 'gold'
                  ? '0 4px 15px rgba(234, 179, 8, 0.4)'
                  : '0 4px 15px rgba(168, 85, 247, 0.4)',
              }}
            >
              <Check size={18} />
              {initialData ? 'Lưu Thay Đổi' : 'Thêm Tài Sản'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
