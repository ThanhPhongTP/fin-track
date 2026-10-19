import React, { useState, useEffect } from 'react';
import { X, Shield, Lock, Download, Upload, RotateCcw, Check, AlertTriangle, Fingerprint } from 'lucide-react';
import type { AppSettings } from '../../types/finance.ts';
import { biometricService, type BiometricStatus } from '../../services/biometric.ts';

interface SettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
  settings: AppSettings;
  onSetPin: (pin: string) => void;
  onDisablePin: () => void;
  onToggleBiometric?: (enabled: boolean) => void;
  onExport: () => string;
  onImport: (json: string) => boolean;
  onReset: () => void;
}

export const SettingsModal: React.FC<SettingsModalProps> = ({
  isOpen,
  onClose,
  settings,
  onSetPin,
  onDisablePin,
  onToggleBiometric,
  onExport,
  onImport,
  onReset,
}) => {
  const [newPin, setNewPin] = useState<string>('');
  const [pinError, setPinError] = useState<string>('');
  const [pinSuccess, setPinSuccess] = useState<string>('');
  const [importStatus, setImportStatus] = useState<string>('');
  const [biometricStatus, setBiometricStatus] = useState<BiometricStatus | null>(null);

  useEffect(() => {
    if (isOpen) {
      biometricService.checkBiometrics().then(setBiometricStatus);
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const handleSavePin = (e: React.FormEvent) => {
    e.preventDefault();
    if (!/^\d{4}$/.test(newPin)) {
      setPinError('Mã PIN phải bao gồm đúng 4 chữ số!');
      return;
    }
    onSetPin(newPin);
    setPinSuccess('Đã cập nhật mã PIN thành công!');
    setNewPin('');
    setPinError('');
    setTimeout(() => setPinSuccess(''), 2500);
  };

  const handleDownloadBackup = () => {
    const jsonStr = onExport();
    const blob = new Blob([jsonStr], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `fintrack_backup_${new Date().toISOString().slice(0, 10)}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      const content = event.target?.result as string;
      if (content) {
        const success = onImport(content);
        if (success) {
          setImportStatus('Khôi phục dữ liệu thành công!');
          setTimeout(() => setImportStatus(''), 3000);
        } else {
          setImportStatus('File sao lưu không hợp lệ!');
        }
      }
    };
    reader.readAsText(file);
    e.target.value = '';
  };

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
            <Shield size={20} color="#38bdf8" />
            <h2 style={{ fontSize: '1.15rem', fontWeight: 700, color: '#f8fafc' }}>
              Cài Đặt & Dữ Liệu
            </h2>
          </div>
          <button type="button" className="btn-icon" onClick={onClose}>
            <X size={20} />
          </button>
        </div>

        <div style={{ padding: '20px', display: 'flex', flexDirection: 'column', gap: '24px' }}>
          {/* Section 1: Mã PIN bảo mật */}
          <div
            style={{
              padding: '16px',
              borderRadius: 'var(--radius-md)',
              background: 'rgba(255, 255, 255, 0.03)',
              border: '1px solid var(--border-subtle)',
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '12px' }}>
              <Lock size={18} color="#38bdf8" />
              <h3 style={{ fontSize: '0.95rem', fontWeight: 700 }}>Mã Khóa PIN Bảo Mật</h3>
            </div>
            <p style={{ fontSize: '0.825rem', color: 'var(--text-secondary)', marginBottom: '14px' }}>
              Yêu cầu nhập mã PIN 4 số mỗi lần mở ứng dụng FinTrack.
            </p>

            {settings.isPinEnabled ? (
              <div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '14px' }}>
                  <span
                    style={{
                      display: 'inline-flex',
                      alignItems: 'center',
                      gap: '4px',
                      padding: '4px 10px',
                      borderRadius: 'var(--radius-full)',
                      background: 'rgba(16, 185, 129, 0.15)',
                      color: '#10b981',
                      fontSize: '0.8rem',
                      fontWeight: 600,
                    }}
                  >
                    <Check size={14} /> Đang bật mã PIN
                  </span>
                  <button
                    type="button"
                    onClick={() => {
                      if (confirm('Bạn có chắc muốn tắt mã PIN bảo vệ?')) {
                        onDisablePin();
                      }
                    }}
                    style={{
                      background: 'none',
                      border: 'none',
                      color: '#f43f5e',
                      fontSize: '0.8rem',
                      cursor: 'pointer',
                      textDecoration: 'underline',
                    }}
                  >
                    Tắt mã PIN
                  </button>
                </div>

                <form onSubmit={handleSavePin} style={{ display: 'flex', gap: '8px' }}>
                  <input
                    type="password"
                    inputMode="numeric"
                    maxLength={4}
                    placeholder="MÃ MỚI (4 SỐ)"
                    value={newPin}
                    onChange={(e) => {
                      setNewPin(e.target.value.replace(/\D/g, ''));
                      setPinError('');
                    }}
                    className="form-input"
                    style={{
                      flex: 1,
                      padding: '10px 14px',
                      fontSize: '1.05rem',
                      fontFamily: 'var(--font-mono)',
                      letterSpacing: '0.35em',
                      textAlign: 'center',
                      background: 'rgba(15, 23, 42, 0.7)',
                      border: '1px solid rgba(56, 189, 248, 0.25)',
                      borderRadius: '10px',
                      color: '#38bdf8',
                    }}
                  />
                  <button type="submit" className="btn btn-secondary" style={{ padding: '8px 16px', fontFamily: 'var(--font-mono)', fontSize: '0.85rem' }}>
                    Đổi PIN
                  </button>
                </form>
              </div>
            ) : (
              <form onSubmit={handleSavePin} style={{ display: 'flex', gap: '8px' }}>
                <input
                  type="password"
                  inputMode="numeric"
                  maxLength={4}
                  placeholder="NHẬP 4 SỐ PIN..."
                  value={newPin}
                  onChange={(e) => {
                    setNewPin(e.target.value.replace(/\D/g, ''));
                    setPinError('');
                  }}
                  className="form-input"
                  style={{
                    flex: 1,
                    padding: '10px 14px',
                    fontSize: '1.05rem',
                    fontFamily: 'var(--font-mono)',
                    letterSpacing: '0.35em',
                    textAlign: 'center',
                    background: 'rgba(15, 23, 42, 0.7)',
                    border: '1px solid rgba(56, 189, 248, 0.25)',
                    borderRadius: '10px',
                    color: '#38bdf8',
                  }}
                />
                <button type="submit" className="btn btn-primary" style={{ padding: '8px 16px', fontFamily: 'var(--font-mono)', fontSize: '0.85rem' }}>
                  Kích hoạt
                </button>
              </form>
            )}

            {pinError && <p style={{ color: '#f43f5e', fontSize: '0.8rem', marginTop: '8px' }}>{pinError}</p>}
            {pinSuccess && <p style={{ color: '#10b981', fontSize: '0.8rem', marginTop: '8px' }}>{pinSuccess}</p>}

            {/* Mục Cảm biến Vân tay / Face ID */}
            {settings.isPinEnabled && onToggleBiometric && (
              <div
                style={{
                  marginTop: '16px',
                  paddingTop: '14px',
                  borderTop: '1px solid var(--border-subtle)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  gap: '12px',
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                  <div
                    style={{
                      width: '32px',
                      height: '32px',
                      borderRadius: '8px',
                      background: 'rgba(56, 189, 248, 0.1)',
                      border: '1px solid rgba(56, 189, 248, 0.25)',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      color: '#38bdf8',
                    }}
                  >
                    <Fingerprint size={18} />
                  </div>
                  <div>
                    <h4 style={{ fontSize: '0.85rem', fontWeight: 600, color: 'var(--text-primary)' }}>
                      {biometricStatus?.title || 'Mở khóa Vân tay / Face ID'}
                    </h4>
                    <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                      {biometricStatus?.isAvailable
                        ? 'Quét vân tay để mở ứng dụng nhanh chóng'
                        : 'Khả dụng trên thiết bị có cảm biến vân tay'}
                    </p>
                  </div>
                </div>

                <label style={{ position: 'relative', display: 'inline-block', width: '42px', height: '24px', cursor: 'pointer' }}>
                  <input
                    type="checkbox"
                    checked={settings.isBiometricEnabled !== false}
                    onChange={(e) => onToggleBiometric(e.target.checked)}
                    style={{ opacity: 0, width: 0, height: 0 }}
                  />
                  <span
                    style={{
                      position: 'absolute',
                      cursor: 'pointer',
                      inset: 0,
                      backgroundColor: settings.isBiometricEnabled !== false ? '#38bdf8' : 'rgba(255, 255, 255, 0.15)',
                      transition: '0.2s',
                      borderRadius: '24px',
                    }}
                  >
                    <span
                      style={{
                        position: 'absolute',
                        content: '""',
                        height: '18px',
                        width: '18px',
                        left: settings.isBiometricEnabled !== false ? '21px' : '3px',
                        bottom: '3px',
                        backgroundColor: 'white',
                        transition: '0.2s',
                        borderRadius: '50%',
                        boxShadow: '0 1px 3px rgba(0,0,0,0.3)',
                      }}
                    />
                  </span>
                </label>
              </div>
            )}
          </div>

          {/* Section 2: Sao lưu & Khôi phục */}
          <div
            style={{
              padding: '16px',
              borderRadius: 'var(--radius-md)',
              background: 'rgba(255, 255, 255, 0.03)',
              border: '1px solid var(--border-subtle)',
            }}
          >
            <h3 style={{ fontSize: '0.95rem', fontWeight: 700, marginBottom: '10px' }}>
              Sao Lưu & Phục Hồi Dữ Liệu
            </h3>
            <p style={{ fontSize: '0.825rem', color: 'var(--text-secondary)', marginBottom: '14px' }}>
              Tải file JSON dự phòng về máy hoặc nạp lại dữ liệu bất cứ lúc nào.
            </p>

            <div style={{ display: 'flex', gap: '10px' }}>
              <button
                type="button"
                className="btn btn-secondary"
                onClick={handleDownloadBackup}
                style={{ flex: 1, fontSize: '0.85rem' }}
              >
                <Download size={16} /> Xuất File JSON
              </button>

              <label className="btn btn-secondary" style={{ flex: 1, fontSize: '0.85rem', cursor: 'pointer' }}>
                <Upload size={16} /> Nhập File JSON
                <input
                  type="file"
                  accept=".json"
                  onChange={handleFileUpload}
                  style={{ display: 'none' }}
                />
              </label>
            </div>

            {importStatus && (
              <p style={{ color: '#38bdf8', fontSize: '0.8rem', marginTop: '10px', textAlign: 'center' }}>
                {importStatus}
              </p>
            )}
          </div>

          {/* Section 3: Reset */}
          <div
            style={{
              padding: '16px',
              borderRadius: 'var(--radius-md)',
              background: 'rgba(244, 63, 94, 0.06)',
              border: '1px solid rgba(244, 63, 94, 0.2)',
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px' }}>
              <AlertTriangle size={18} color="#f43f5e" />
              <h3 style={{ fontSize: '0.95rem', fontWeight: 700, color: '#f43f5e' }}>Xoá & Đặt Lại</h3>
            </div>
            <p style={{ fontSize: '0.825rem', color: 'var(--text-secondary)', marginBottom: '12px' }}>
              Xóa toàn bộ giao dịch và đưa các tài khoản về số dư mặc định.
            </p>
            <button
              type="button"
              onClick={() => {
                if (confirm('CẢNH BÁO: Thao tác này sẽ xoá sạch mọi giao dịch của bạn. Bạn chắc chắn chứ?')) {
                  onReset();
                  onClose();
                }
              }}
              className="btn btn-secondary"
              style={{
                width: '100%',
                color: '#f43f5e',
                borderColor: 'rgba(244, 63, 94, 0.3)',
                fontSize: '0.85rem',
              }}
            >
              <RotateCcw size={16} /> Đặt lại dữ liệu gốc
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
