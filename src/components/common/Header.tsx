import React from 'react';
import { Lock, Eye, EyeOff, Settings, ShieldCheck, Wallet, ArrowLeft } from 'lucide-react';
import { formatMonthLabel, getCurrentMonthKey } from '../../services/financeEngine.ts';

interface HeaderProps {
  activeTab: 'dashboard' | 'transactions' | 'analytics';
  onBackToDashboard: () => void;
  isPinEnabled: boolean;
  isBalanceHidden: boolean;
  onToggleHideBalance: () => void;
  onLockApp: () => void;
  onOpenSettings: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  activeTab,
  onBackToDashboard,
  isPinEnabled,
  isBalanceHidden,
  onToggleHideBalance,
  onLockApp,
  onOpenSettings,
}) => {
  const currentMonth = getCurrentMonthKey();
  const isSubScreen = activeTab !== 'dashboard';

  const getScreenTitle = () => {
    switch (activeTab) {
      case 'transactions':
        return 'Giao Dịch Thu & Chi';
      case 'analytics':
        return 'Báo Cáo Thống Kê';
      default:
        return 'FinTrack';
    }
  };

  return (
    <header className="app-header">
      <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
        {/* Nút Back quay về Dashboard nếu đang ở màn hình con */}
        {isSubScreen ? (
          <button
            type="button"
            className="btn-icon"
            onClick={onBackToDashboard}
            title="Quay lại Trang Chủ"
            style={{
              backgroundColor: 'rgba(56, 189, 248, 0.12)',
              color: '#38bdf8',
              borderColor: 'rgba(56, 189, 248, 0.3)',
            }}
          >
            <ArrowLeft size={20} />
          </button>
        ) : (
          <div
            style={{
              width: '38px',
              height: '38px',
              borderRadius: '12px',
              background: 'linear-gradient(135deg, #38bdf8 0%, #2563eb 100%)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: '#ffffff',
              boxShadow: '0 4px 12px rgba(56, 189, 248, 0.3)',
              flexShrink: 0,
            }}
          >
            <Wallet size={20} />
          </div>
        )}

        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
            <h1 style={{ fontSize: '1.1rem', fontWeight: 800, letterSpacing: '-0.02em', color: '#f8fafc' }}>
              {getScreenTitle()}
            </h1>
            {!isSubScreen && isPinEnabled && (
              <span
                title="Bảo mật mã PIN đang bật"
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  color: '#10b981',
                }}
              >
                <ShieldCheck size={14} />
              </span>
            )}
          </div>
          <span style={{ fontSize: '0.725rem', color: 'var(--text-muted)' }}>
            {isSubScreen ? 'Nhấn ← để về Trang Chủ' : formatMonthLabel(currentMonth)}
          </span>
        </div>
      </div>

      <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
        {/* Nút ẩn/hiện số tiền */}
        <button
          type="button"
          className="btn-icon"
          onClick={onToggleHideBalance}
          title={isBalanceHidden ? 'Hiện số tiền' : 'Ẩn số tiền'}
        >
          {isBalanceHidden ? <EyeOff size={18} /> : <Eye size={18} />}
        </button>

        {/* Nút khóa app ngay lập tức */}
        {isPinEnabled && (
          <button
            type="button"
            className="btn-icon"
            onClick={onLockApp}
            title="Khóa app ngay bây giờ"
            style={{ color: '#38bdf8' }}
          >
            <Lock size={18} />
          </button>
        )}

        {/* Nút Cài đặt */}
        <button
          type="button"
          className="btn-icon"
          onClick={onOpenSettings}
          title="Cài đặt & Dữ liệu"
        >
          <Settings size={18} />
        </button>
      </div>
    </header>
  );
};
