import React from 'react';
import {
  Wallet,
  TrendingUp,
  TrendingDown,
  Plus,
  Landmark,
  ArrowRight,
  Sparkles,
  Coins,
} from 'lucide-react';
import type {
  BankAccount,
  BankBalance,
  MonthlySnapshot,
  Transaction,
  Category,
  InvestmentAsset,
} from '../types/finance.ts';
import { formatVND, formatDisplayDate, calculateAssetProfitLoss } from '../services/financeEngine.ts';
import { CategoryIcon } from '../components/common/CategoryIcon.tsx';

interface DashboardViewProps {
  bankStats: {
    balances: BankBalance[];
    totalNetWorth: number;
    totalInitial: number;
    cashBankTotal?: number;
  };
  assetStats: {
    totalAssetValue: number;
    totalGoldValue: number;
    totalFundValue: number;
    goldCount: number;
    fundCount: number;
    totalPurchaseValue: number;
    totalProfitLoss: number;
    totalProfitLossPercent: number;
    hasAnyPurchaseValue: boolean;
  };
  assets: InvestmentAsset[];
  currentMonthSnapshot: MonthlySnapshot;
  recentTransactions: Transaction[];
  categories: Category[];
  isBalanceHidden: boolean;
  onOpenAddTransaction: () => void;
  onOpenAddBank: () => void;
  onEditBank: (bank: BankAccount) => void;
  onOpenAddAsset: () => void;
  onEditAsset: (asset: InvestmentAsset) => void;
  onNavigateToTransactions: () => void;
}

export const DashboardView: React.FC<DashboardViewProps> = ({
  bankStats,
  assetStats,
  assets,
  currentMonthSnapshot,
  recentTransactions,
  categories,
  isBalanceHidden,
  onOpenAddTransaction,
  onOpenAddBank,
  onEditBank,
  onOpenAddAsset,
  onEditAsset,
  onNavigateToTransactions,
}) => {
  const { balances, totalNetWorth, cashBankTotal } = bankStats;

  return (
    <div style={{ padding: '18px', display: 'flex', flexDirection: 'column', gap: '22px' }}>
      {/* 1. HERO CARD: TỔNG TÀI SẢN TOÀN DIỆN */}
      <div
        className="glass-card"
        style={{
          padding: '22px',
          background: 'linear-gradient(135deg, rgba(30, 41, 59, 0.95) 0%, rgba(15, 23, 42, 0.98) 100%)',
          position: 'relative',
          overflow: 'hidden',
          border: '1px solid rgba(56, 189, 248, 0.25)',
        }}
      >
        <div
          style={{
            position: 'absolute',
            top: '-50px',
            right: '-50px',
            width: '160px',
            height: '160px',
            borderRadius: '50%',
            background: 'radial-gradient(circle, rgba(56, 189, 248, 0.25) 0%, transparent 70%)',
            pointerEvents: 'none',
          }}
        />

        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '6px' }}>
          <span style={{ fontSize: '0.8rem', fontWeight: 700, color: '#94a3b8', textTransform: 'uppercase', letterSpacing: '0.06em' }}>
            Tổng Tài Sản Hiện Tại
          </span>
          <span
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '4px',
              fontSize: '0.75rem',
              color: '#38bdf8',
              background: 'rgba(56, 189, 248, 0.1)',
              padding: '3px 8px',
              borderRadius: 'var(--radius-full)',
              border: '1px solid rgba(56, 189, 248, 0.2)',
            }}
          >
            <Sparkles size={12} /> {balances.length} bank • {assets.length} tích lũy
          </span>
        </div>

        {/* Số tiền Net Worth Lớn */}
        <div
          style={{
            fontSize: '2.4rem',
            fontWeight: 800,
            letterSpacing: '-0.03em',
            color: '#f8fafc',
            margin: '4px 0 16px',
            fontFamily: 'var(--font-mono)',
          }}
        >
          {formatVND(totalNetWorth, isBalanceHidden)}
        </div>

        {/* Thanh 3 trụ cột cơ cấu tài sản: Bank/Ví | Vàng | Quỹ */}
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(3, 1fr)',
            gap: '8px',
            paddingTop: '14px',
            borderTop: '1px solid rgba(255, 255, 255, 0.08)',
          }}
        >
          {/* Tiền mặt & Bank */}
          <div style={{ padding: '8px 10px', borderRadius: '10px', background: 'rgba(255, 255, 255, 0.04)', minWidth: 0 }}>
            <div style={{ fontSize: '0.68rem', color: '#94a3b8', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>Tiền Bank & Ví</div>
            <div style={{ fontSize: 'clamp(0.75rem, 3.2vw, 0.875rem)', fontWeight: 700, color: '#38bdf8', fontFamily: 'var(--font-mono)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }} title={formatVND(cashBankTotal ?? 0, false)}>
              {formatVND(cashBankTotal ?? 0, isBalanceHidden)}
            </div>
          </div>

          {/* Vàng */}
          <div style={{ padding: '8px 10px', borderRadius: '10px', background: 'rgba(234, 179, 8, 0.08)', minWidth: 0 }}>
            <div style={{ fontSize: '0.68rem', color: '#eab308', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>Vàng tích trữ</div>
            <div style={{ fontSize: 'clamp(0.75rem, 3.2vw, 0.875rem)', fontWeight: 700, color: '#facc15', fontFamily: 'var(--font-mono)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }} title={formatVND(assetStats.totalGoldValue, false)}>
              {formatVND(assetStats.totalGoldValue, isBalanceHidden)}
            </div>
          </div>

          {/* Chứng chỉ quỹ */}
          <div style={{ padding: '8px 10px', borderRadius: '10px', background: 'rgba(168, 85, 247, 0.08)', minWidth: 0 }}>
            <div style={{ fontSize: '0.68rem', color: '#c084fc', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>Chứng chỉ quỹ</div>
            <div style={{ fontSize: 'clamp(0.75rem, 3.2vw, 0.875rem)', fontWeight: 700, color: '#d8b4fe', fontFamily: 'var(--font-mono)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }} title={formatVND(assetStats.totalFundValue, false)}>
              {formatVND(assetStats.totalFundValue, isBalanceHidden)}
            </div>
          </div>
        </div>
      </div>

      {/* 2. PHÂN MỤC: VÀNG & CHỨNG CHỈ QUỸ (TÍCH LŨY / ĐẦU TƯ) */}
      <div>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px', flexWrap: 'wrap', gap: '8px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <div
              style={{
                width: '26px',
                height: '26px',
                borderRadius: '8px',
                background: 'linear-gradient(135deg, #eab308, #a855f7)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: '#ffffff',
              }}
            >
              <Coins size={14} />
            </div>
            <h2 style={{ fontSize: '1.05rem', fontWeight: 700, color: '#f8fafc' }}>
              Vàng & Chứng Chỉ Quỹ
            </h2>
            {assetStats.hasAnyPurchaseValue && (
              <span
                style={{
                  fontSize: '0.75rem',
                  fontWeight: 700,
                  fontFamily: 'var(--font-mono)',
                  color: assetStats.totalProfitLoss >= 0 ? '#10b981' : '#f43f5e',
                  background: assetStats.totalProfitLoss >= 0 ? 'rgba(16, 185, 129, 0.14)' : 'rgba(244, 63, 94, 0.14)',
                  padding: '2px 8px',
                  borderRadius: 'var(--radius-full)',
                  border: `1px solid ${assetStats.totalProfitLoss >= 0 ? 'rgba(16, 185, 129, 0.25)' : 'rgba(244, 63, 94, 0.25)'}`,
                }}
              >
                {assetStats.totalProfitLoss >= 0 ? 'Lời ' : 'Lỗ '}
                {assetStats.totalProfitLoss >= 0 ? '+' : ''}
                {formatVND(assetStats.totalProfitLoss, isBalanceHidden)}
                {' '}({assetStats.totalProfitLossPercent >= 0 ? '+' : ''}{assetStats.totalProfitLossPercent.toFixed(1)}%)
              </span>
            )}
          </div>
          <button
            type="button"
            onClick={onOpenAddAsset}
            className="btn btn-secondary"
            style={{ padding: '6px 12px', fontSize: '0.8rem', gap: '4px' }}
          >
            <Plus size={14} /> Thêm Tài Sản
          </button>
        </div>

        {assets.length === 0 ? (
          <div
            className="glass-card"
            style={{ padding: '24px', textAlign: 'center', color: 'var(--text-muted)' }}
          >
            <Coins size={32} style={{ margin: '0 auto 8px', opacity: 0.3 }} />
            <p style={{ fontSize: '0.85rem' }}>Chưa có vàng hoặc chứng chỉ quỹ nào.</p>
            <button
              type="button"
              className="btn btn-secondary"
              onClick={onOpenAddAsset}
              style={{ fontSize: '0.8rem', marginTop: '10px' }}
            >
              <Plus size={14} /> Thêm Vàng hoặc Quỹ
            </button>
          </div>
        ) : (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(240px, 1fr))', gap: '10px' }}>
            {assets.map((asset) => {
              const isGold = asset.type === 'gold';
              const pl = calculateAssetProfitLoss(asset);

              return (
                <div
                  key={asset.id}
                  onClick={() => onEditAsset(asset)}
                  className="glass-card"
                  style={{
                    padding: '14px 16px',
                    cursor: 'pointer',
                    position: 'relative',
                    borderLeft: isGold ? '4px solid #eab308' : '4px solid #a855f7',
                    background: isGold
                      ? 'linear-gradient(135deg, rgba(234, 179, 8, 0.08) 0%, rgba(18, 24, 38, 0.95) 100%)'
                      : 'linear-gradient(135deg, rgba(168, 85, 247, 0.08) 0%, rgba(18, 24, 38, 0.95) 100%)',
                  }}
                >
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '8px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <div
                        style={{
                          width: '28px',
                          height: '28px',
                          borderRadius: '8px',
                          background: isGold ? 'rgba(234, 179, 8, 0.2)' : 'rgba(168, 85, 247, 0.2)',
                          color: isGold ? '#eab308' : '#c084fc',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                        }}
                      >
                        {isGold ? <Coins size={16} /> : <TrendingUp size={16} />}
                      </div>
                      <div>
                        <h3 style={{ fontSize: '0.925rem', fontWeight: 700, color: '#f8fafc' }}>
                          {asset.name}
                        </h3>
                        <span style={{ fontSize: '0.725rem', color: isGold ? '#facc15' : '#c084fc', fontWeight: 600 }}>
                          {asset.quantity} {asset.unit}
                        </span>
                      </div>
                    </div>

                    <span style={{ fontSize: '0.7rem', color: '#38bdf8' }}>Sửa</span>
                  </div>

                  {/* Giá trị quy đổi & Giá vốn */}
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', marginTop: '6px' }}>
                    <div>
                      <div style={{ fontSize: '0.675rem', color: 'var(--text-muted)', textTransform: 'uppercase' }}>
                        Giá trị hiện tại
                      </div>
                      <div
                        style={{
                          fontSize: '1.15rem',
                          fontWeight: 700,
                          fontFamily: 'var(--font-mono)',
                          color: isGold ? '#fef08a' : '#f3e8ff',
                        }}
                      >
                        {formatVND(asset.currentValue, isBalanceHidden)}
                      </div>
                    </div>

                    {asset.purchaseValue && (
                      <div style={{ textAlign: 'right', fontSize: '0.7rem', color: 'var(--text-muted)' }}>
                        Vốn: {formatVND(asset.purchaseValue, isBalanceHidden)}
                      </div>
                    )}
                  </div>

                  {/* BADGE LỜI / LỖ NỔI BẬT */}
                  <div style={{ marginTop: '8px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', paddingTop: '6px', borderTop: '1px solid rgba(255, 255, 255, 0.06)' }}>
                    <span style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>Lời / Lỗ:</span>
                    {pl.hasPurchaseValue ? (
                      <div
                        style={{
                          display: 'inline-flex',
                          alignItems: 'center',
                          gap: '4px',
                          padding: '2px 8px',
                          borderRadius: '6px',
                          fontSize: '0.75rem',
                          fontWeight: 700,
                          fontFamily: 'var(--font-mono)',
                          color: pl.isProfit ? '#10b981' : pl.isLoss ? '#f43f5e' : 'var(--text-secondary)',
                          background: pl.isProfit ? 'rgba(16, 185, 129, 0.15)' : pl.isLoss ? 'rgba(244, 63, 94, 0.15)' : 'rgba(255, 255, 255, 0.05)',
                          border: `1px solid ${pl.isProfit ? 'rgba(16, 185, 129, 0.25)' : pl.isLoss ? 'rgba(244, 63, 94, 0.25)' : 'rgba(255, 255, 255, 0.08)'}`,
                        }}
                      >
                        {pl.isProfit ? '+' : ''}{formatVND(pl.diffAmount, isBalanceHidden)} ({pl.diffPercent >= 0 ? '+' : ''}{pl.diffPercent.toFixed(1)}%)
                      </div>
                    ) : (
                      <span style={{ fontSize: '0.7rem', color: '#94a3b8', fontStyle: 'italic' }}>
                        Chưa nhập vốn
                      </span>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* 3. TÀI KHOẢN NGÂN HÀNG & VÍ */}
      <div>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <Landmark size={18} color="#38bdf8" />
            <h2 style={{ fontSize: '1.05rem', fontWeight: 700, color: '#f8fafc' }}>
              Tài Khoản & Ngân Hàng
            </h2>
          </div>
          <button
            type="button"
            onClick={onOpenAddBank}
            className="btn btn-secondary"
            style={{ padding: '6px 12px', fontSize: '0.8rem', gap: '4px' }}
          >
            <Plus size={14} /> Thêm Bank
          </button>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(180px, 1fr))', gap: '10px' }}>
          {balances.map((item) => {
            const { bank, currentBalance } = item;
            return (
              <div
                key={bank.id}
                onClick={() => onEditBank(bank)}
                className="glass-card"
                style={{
                  padding: '14px 16px',
                  cursor: 'pointer',
                  position: 'relative',
                  overflow: 'hidden',
                  borderLeft: `4px solid ${bank.color || '#38bdf8'}`,
                }}
              >
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '8px' }}>
                  <div>
                    <h3 style={{ fontSize: '0.925rem', fontWeight: 700, color: '#f8fafc' }}>
                      {bank.name}
                    </h3>
                    {bank.accountNumber && (
                      <span style={{ fontSize: '0.7rem', color: 'var(--text-muted)', fontFamily: 'var(--font-mono)' }}>
                        {bank.accountNumber}
                      </span>
                    )}
                  </div>
                  <div
                    style={{
                      width: '8px',
                      height: '8px',
                      borderRadius: '50%',
                      backgroundColor: bank.color || '#38bdf8',
                    }}
                  />
                </div>

                <div style={{ fontSize: '0.675rem', color: 'var(--text-muted)', textTransform: 'uppercase' }}>
                  Số dư khả dụng
                </div>
                <div
                  style={{
                    fontSize: '1.1rem',
                    fontWeight: 700,
                    color: currentBalance < 0 ? '#f43f5e' : '#f8fafc',
                    fontFamily: 'var(--font-mono)',
                    marginTop: '2px',
                  }}
                >
                  {formatVND(currentBalance, isBalanceHidden)}
                </div>

                <div
                  style={{
                    fontSize: '0.675rem',
                    color: 'var(--text-muted)',
                    marginTop: '6px',
                    display: 'flex',
                    justifyContent: 'space-between',
                  }}
                >
                  <span>Gốc: {formatVND(bank.initialBalance, isBalanceHidden)}</span>
                  <span style={{ color: '#38bdf8' }}>Sửa</span>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* 4. TÓM TẮT THU CHI THÁNG NÀY */}
      <div
        className="glass-card"
        style={{
          padding: '16px',
          display: 'grid',
          gridTemplateColumns: '1fr 1fr',
          gap: '12px',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <div
            style={{
              width: '36px',
              height: '36px',
              borderRadius: '10px',
              background: 'rgba(16, 185, 129, 0.12)',
              color: '#10b981',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            <TrendingUp size={18} />
          </div>
          <div>
            <div style={{ fontSize: '0.725rem', color: 'var(--text-muted)' }}>Thu tháng này</div>
            <div style={{ fontSize: '0.95rem', fontWeight: 700, color: '#10b981', fontFamily: 'var(--font-mono)' }}>
              +{formatVND(currentMonthSnapshot.totalIncome, isBalanceHidden)}
            </div>
          </div>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <div
            style={{
              width: '36px',
              height: '36px',
              borderRadius: '10px',
              background: 'rgba(244, 63, 94, 0.12)',
              color: '#f43f5e',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            <TrendingDown size={18} />
          </div>
          <div>
            <div style={{ fontSize: '0.725rem', color: 'var(--text-muted)' }}>Chi tháng này</div>
            <div style={{ fontSize: '0.95rem', fontWeight: 700, color: '#f43f5e', fontFamily: 'var(--font-mono)' }}>
              -{formatVND(currentMonthSnapshot.totalExpense, isBalanceHidden)}
            </div>
          </div>
        </div>
      </div>

      {/* 5. GIAO DỊCH GẦN ĐÂY */}
      <div>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
          <h2 style={{ fontSize: '1.05rem', fontWeight: 700, color: '#f8fafc' }}>
            Giao Dịch Gần Đây
          </h2>
          {recentTransactions.length > 0 && (
            <button
              type="button"
              onClick={onNavigateToTransactions}
              style={{
                background: 'none',
                border: 'none',
                color: '#38bdf8',
                fontSize: '0.8rem',
                fontWeight: 600,
                display: 'inline-flex',
                alignItems: 'center',
                gap: '4px',
                cursor: 'pointer',
              }}
            >
              Xem tất cả <ArrowRight size={14} />
            </button>
          )}
        </div>

        {recentTransactions.length === 0 ? (
          <div
            className="glass-card"
            style={{
              padding: '30px 20px',
              textAlign: 'center',
              color: 'var(--text-muted)',
            }}
          >
            <Wallet size={32} style={{ margin: '0 auto 8px', opacity: 0.4 }} />
            <p style={{ fontSize: '0.85rem', marginBottom: '10px' }}>Chưa có giao dịch thu chi nào.</p>
            <button
              type="button"
              className="btn btn-primary"
              onClick={onOpenAddTransaction}
              style={{ fontSize: '0.825rem' }}
            >
              <Plus size={15} /> Thêm Giao Dịch Đầu Tiên
            </button>
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
            {recentTransactions.slice(0, 5).map((t) => {
              const cat = categories.find((c) => c.id === t.categoryId) || {
                name: 'Chung',
                icon: 'CircleEllipsis',
                color: '#94a3b8',
              };
              const bank = bankStats.balances.find((b) => b.bank.id === t.bankId)?.bank;
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
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '10px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '9px', minWidth: 0, flex: 1 }}>
                      <div
                        style={{
                          width: '34px',
                          height: '34px',
                          borderRadius: '9px',
                          background: `${cat.color}20`,
                          color: cat.color,
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          flexShrink: 0,
                        }}
                      >
                        <CategoryIcon name={cat.icon} size={17} color={cat.color} />
                      </div>
                      <div style={{ minWidth: 0, flex: 1 }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '6px', flexWrap: 'wrap' }}>
                          <span style={{ fontSize: '0.9rem', fontWeight: 700, color: '#f8fafc', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                            {cat.name}
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
