import React from 'react';
import { LayoutDashboard, ArrowLeftRight, PieChart, Plus } from 'lucide-react';

interface NavbarProps {
  activeTab: 'dashboard' | 'transactions' | 'analytics';
  onSelectTab: (tab: 'dashboard' | 'transactions' | 'analytics') => void;
  onQuickAdd: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  activeTab,
  onSelectTab,
  onQuickAdd,
}) => {
  return (
    <nav className="app-bottom-nav">
      {/* Tab 1: Tổng quan */}
      <button
        type="button"
        onClick={() => onSelectTab('dashboard')}
        style={{
          flex: 1,
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          gap: '3px',
          background: 'none',
          border: 'none',
          color: activeTab === 'dashboard' ? '#38bdf8' : 'var(--text-muted)',
          cursor: 'pointer',
          padding: '4px 0',
          transition: 'all 0.15s ease',
        }}
      >
        <div
          style={{
            padding: '4px 14px',
            borderRadius: 'var(--radius-full)',
            background: activeTab === 'dashboard' ? 'rgba(56, 189, 248, 0.15)' : 'transparent',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
          }}
        >
          <LayoutDashboard size={20} strokeWidth={activeTab === 'dashboard' ? 2.6 : 2} />
        </div>
        <span style={{ fontSize: '0.72rem', fontWeight: activeTab === 'dashboard' ? 700 : 500 }}>
          Trang chủ
        </span>
      </button>

      {/* Nút Thêm Nhanh Trung Tâm (+) */}
      <div style={{ flex: 0.8, display: 'flex', justifyContent: 'center' }}>
        <button
          type="button"
          onClick={onQuickAdd}
          title="Thêm khoản thu / chi mới"
          style={{
            width: '46px',
            height: '46px',
            borderRadius: '50%',
            background: 'linear-gradient(135deg, #38bdf8 0%, #2563eb 100%)',
            color: '#ffffff',
            border: 'none',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            cursor: 'pointer',
            boxShadow: '0 4px 18px rgba(56, 189, 248, 0.5)',
            transform: 'translateY(-12px)',
            transition: 'transform 0.12s ease, box-shadow 0.12s ease',
          }}
          onMouseDown={(e) => {
            e.currentTarget.style.transform = 'translateY(-10px) scale(0.94)';
          }}
          onMouseUp={(e) => {
            e.currentTarget.style.transform = 'translateY(-12px) scale(1)';
          }}
        >
          <Plus size={24} strokeWidth={2.8} />
        </button>
      </div>

      {/* Tab 2: Thu & Chi */}
      <button
        type="button"
        onClick={() => onSelectTab('transactions')}
        style={{
          flex: 1,
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          gap: '3px',
          background: 'none',
          border: 'none',
          color: activeTab === 'transactions' ? '#38bdf8' : 'var(--text-muted)',
          cursor: 'pointer',
          padding: '4px 0',
          transition: 'all 0.15s ease',
        }}
      >
        <div
          style={{
            padding: '4px 14px',
            borderRadius: 'var(--radius-full)',
            background: activeTab === 'transactions' ? 'rgba(56, 189, 248, 0.15)' : 'transparent',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
          }}
        >
          <ArrowLeftRight size={20} strokeWidth={activeTab === 'transactions' ? 2.6 : 2} />
        </div>
        <span style={{ fontSize: '0.72rem', fontWeight: activeTab === 'transactions' ? 700 : 500 }}>
          Thu & Chi
        </span>
      </button>

      {/* Tab 3: Thống Kê Theo Tháng */}
      <button
        type="button"
        onClick={() => onSelectTab('analytics')}
        style={{
          flex: 1,
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          gap: '3px',
          background: 'none',
          border: 'none',
          color: activeTab === 'analytics' ? '#38bdf8' : 'var(--text-muted)',
          cursor: 'pointer',
          padding: '4px 0',
          transition: 'all 0.15s ease',
        }}
      >
        <div
          style={{
            padding: '4px 14px',
            borderRadius: 'var(--radius-full)',
            background: activeTab === 'analytics' ? 'rgba(56, 189, 248, 0.15)' : 'transparent',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
          }}
        >
          <PieChart size={20} strokeWidth={activeTab === 'analytics' ? 2.6 : 2} />
        </div>
        <span style={{ fontSize: '0.72rem', fontWeight: activeTab === 'analytics' ? 700 : 500 }}>
          Thống kê
        </span>
      </button>
    </nav>
  );
};
