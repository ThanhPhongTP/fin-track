import React, { useState, useEffect, useCallback, useRef } from 'react';
import { KeyRound, Delete, ShieldCheck, Fingerprint, Volume2, VolumeX, Terminal, RotateCcw, ScanLine } from 'lucide-react';
import { biometricService, type BiometricStatus } from '../../services/biometric.ts';

interface PinLockModalProps {
  isOpen: boolean;
  currentPin?: string;
  isPinConfigured: boolean;
  isBiometricEnabled?: boolean;
  onUnlock: (pin?: string, isBiometric?: boolean) => boolean;
  onSetNewPin: (pin: string) => void;
  onClose?: () => void;
}

export const PinLockModal: React.FC<PinLockModalProps> = ({
  isOpen,
  isPinConfigured,
  isBiometricEnabled = true,
  onUnlock,
  onSetNewPin,
  onClose,
}) => {
  const [pinInput, setPinInput] = useState<string>('');
  const [confirmPinInput, setConfirmPinInput] = useState<string>('');
  const [isSettingMode, setIsSettingMode] = useState<boolean>(!isPinConfigured);
  const [step, setStep] = useState<'enter' | 'confirm'>('enter');
  const [errorMessage, setErrorMessage] = useState<string>('');
  const [successMessage, setSuccessMessage] = useState<string>('');
  const [shake, setShake] = useState<boolean>(false);
  const [activeKey, setActiveKey] = useState<string | null>(null);
  const [soundEnabled, setSoundEnabled] = useState<boolean>(true);
  const [biometricStatus, setBiometricStatus] = useState<BiometricStatus | null>(null);
  const [isAuthenticatingBio, setIsAuthenticatingBio] = useState<boolean>(false);

  const audioCtxRef = useRef<AudioContext | null>(null);
  const hasAutoPromptedRef = useRef<boolean>(false);
  const isAuthenticatingBioRef = useRef<boolean>(false);

  // Play subtle sci-fi tech synthesizer chirps
  const playTechSound = useCallback((type: 'beep' | 'error' | 'success') => {
    if (!soundEnabled) return;
    try {
      const AudioCtx = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
      if (!AudioCtx) return;
      if (!audioCtxRef.current) {
        audioCtxRef.current = new AudioCtx();
      }
      const ctx = audioCtxRef.current;
      if (ctx.state === 'suspended') {
        ctx.resume();
      }

      const now = ctx.currentTime;
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();

      if (type === 'beep') {
        osc.type = 'sine';
        osc.frequency.setValueAtTime(880, now);
        osc.frequency.exponentialRampToValueAtTime(1320, now + 0.04);
        gain.gain.setValueAtTime(0.04, now);
        gain.gain.exponentialRampToValueAtTime(0.0001, now + 0.04);
        osc.connect(gain);
        gain.connect(ctx.destination);
        osc.start(now);
        osc.stop(now + 0.04);
      } else if (type === 'error') {
        osc.type = 'sawtooth';
        osc.frequency.setValueAtTime(220, now);
        osc.frequency.setValueAtTime(160, now + 0.08);
        gain.gain.setValueAtTime(0.07, now);
        gain.gain.exponentialRampToValueAtTime(0.0001, now + 0.22);
        osc.connect(gain);
        gain.connect(ctx.destination);
        osc.start(now);
        osc.stop(now + 0.22);
      } else if (type === 'success') {
        osc.type = 'sine';
        osc.frequency.setValueAtTime(587.33, now); // D5
        osc.frequency.exponentialRampToValueAtTime(880, now + 0.12); // A5
        gain.gain.setValueAtTime(0.05, now);
        gain.gain.exponentialRampToValueAtTime(0.0001, now + 0.18);
        osc.connect(gain);
        gain.connect(ctx.destination);
        osc.start(now);
        osc.stop(now + 0.18);
      }
    } catch {
      // Audio not permitted or interrupted
    }
  }, [soundEnabled]);

  const triggerShake = useCallback((msg: string) => {
    setErrorMessage(msg);
    setSuccessMessage('');
    setShake(true);
    playTechSound('error');
    setTimeout(() => setShake(false), 500);
  }, [playTechSound]);

  // Biometric trigger function with debounced concurrency lock
  const triggerBiometricAuth = useCallback(async () => {
    if (isAuthenticatingBioRef.current) return;
    isAuthenticatingBioRef.current = true;
    setIsAuthenticatingBio(true);
    setErrorMessage('');
    
    try {
      const success = await biometricService.authenticate('Quét vân tay để mở khóa FinTrack');
      if (success) {
        setSuccessMessage('XÁC THỰC VÂN TAY THÀNH CÔNG // GRANTED');
        playTechSound('success');
        setTimeout(() => {
          onUnlock('', true);
        }, 350);
      }
    } catch {
      // User cancelled or finger not recognized
    } finally {
      setIsAuthenticatingBio(false);
      setTimeout(() => {
        isAuthenticatingBioRef.current = false;
      }, 500);
    }
  }, [onUnlock, playTechSound]);

  const triggerBiometricAuthRef = useRef(triggerBiometricAuth);
  triggerBiometricAuthRef.current = triggerBiometricAuth;

  // Check biometric support & auto prompt if enabled (strictly once per modal opening)
  useEffect(() => {
    if (isOpen) {
      setPinInput('');
      setConfirmPinInput('');
      setErrorMessage('');
      setSuccessMessage('');
      const settingMode = !isPinConfigured;
      setIsSettingMode(settingMode);
      setStep('enter');

      // Check biometric hardware once
      biometricService.checkBiometrics().then((status) => {
        setBiometricStatus(status);
        // Only trigger ONCE per lock appearance
        if (!settingMode && isPinConfigured && isBiometricEnabled && status.isAvailable && !hasAutoPromptedRef.current) {
          hasAutoPromptedRef.current = true;
          const timer = setTimeout(() => {
            triggerBiometricAuthRef.current();
          }, 350);
          return () => clearTimeout(timer);
        }
      });
    } else {
      hasAutoPromptedRef.current = false;
      isAuthenticatingBioRef.current = false;
    }
  }, [isOpen, isPinConfigured, isBiometricEnabled]);

  const handleKeyPress = useCallback((num: string) => {
    if (pinInput.length < 4) {
      const nextPin = pinInput + num;
      setPinInput(nextPin);
      setErrorMessage('');
      playTechSound('beep');

      if (nextPin.length === 4) {
        // Complete 4 digits
        if (!isPinConfigured || isSettingMode) {
          if (step === 'enter') {
            setTimeout(() => {
              setConfirmPinInput(nextPin);
              setPinInput('');
              setStep('confirm');
              playTechSound('success');
            }, 160);
          } else {
            // Confirming new PIN
            if (nextPin === confirmPinInput) {
              setSuccessMessage('XÁC THỰC MÃ MỚI THÀNH CÔNG');
              playTechSound('success');
              setTimeout(() => {
                onSetNewPin(nextPin);
              }, 400);
            } else {
              triggerShake('MÃ XÁC NHẬN KHÔNG TRÙNG KHỚP!');
              setTimeout(() => {
                setPinInput('');
                setConfirmPinInput('');
                setStep('enter');
              }, 600);
            }
          }
        } else {
          // Unlock mode
          const success = onUnlock(nextPin, false);
          if (success) {
            setSuccessMessage('QUYỀN TRUY CẬP ĐÃ MỞ // ACCESS GRANTED');
            playTechSound('success');
          } else {
            triggerShake('MÃ BẢO MẬT KHÔNG HỢP LỆ!');
            setTimeout(() => setPinInput(''), 450);
          }
        }
      }
    }
  }, [pinInput, isPinConfigured, isSettingMode, step, confirmPinInput, onSetNewPin, onUnlock, playTechSound, triggerShake]);

  const handleDelete = useCallback(() => {
    if (pinInput.length > 0) {
      setPinInput((prev) => prev.slice(0, -1));
      setErrorMessage('');
      playTechSound('beep');
    }
  }, [pinInput, playTechSound]);

  // Physical keyboard support for rapid & effortless input
  useEffect(() => {
    if (!isOpen) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      if (/^[0-9]$/.test(e.key)) {
        e.preventDefault();
        setActiveKey(e.key);
        setTimeout(() => setActiveKey(null), 120);
        handleKeyPress(e.key);
      } else if (e.key === 'Backspace') {
        e.preventDefault();
        setActiveKey('del');
        setTimeout(() => setActiveKey(null), 120);
        handleDelete();
      } else if (e.key === 'Escape' && onClose) {
        onClose();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, handleKeyPress, handleDelete, onClose]);

  if (!isOpen) return null;

  // Keypad definitions with telecom/cyber letters
  const keyPadConfig = [
    { num: '1', sub: 'SYS' },
    { num: '2', sub: 'ABC' },
    { num: '3', sub: 'DEF' },
    { num: '4', sub: 'GHI' },
    { num: '5', sub: 'JKL' },
    { num: '6', sub: 'MNO' },
    { num: '7', sub: 'PQRS' },
    { num: '8', sub: 'TUV' },
    { num: '9', sub: 'WXYZ' },
  ];

  const hasBiometricAvailable = !isSettingMode && isPinConfigured && Boolean(biometricStatus?.isAvailable);

  return (
    <div
      style={{
        position: 'fixed',
        inset: 0,
        backgroundColor: '#04070e',
        backgroundImage: `
          radial-gradient(ellipse at 50% 15%, rgba(56, 189, 248, 0.12) 0%, transparent 60%),
          radial-gradient(circle at 50% 90%, rgba(99, 102, 241, 0.08) 0%, transparent 50%),
          linear-gradient(rgba(56, 189, 248, 0.03) 1px, transparent 1px),
          linear-gradient(90deg, rgba(56, 189, 248, 0.03) 1px, transparent 1px)
        `,
        backgroundSize: '100% 100%, 100% 100%, 28px 28px, 28px 28px',
        zIndex: 9999,
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '16px',
        userSelect: 'none',
      }}
    >
      {/* Sound toggle button */}
      <button
        type="button"
        onClick={() => setSoundEnabled(!soundEnabled)}
        style={{
          position: 'absolute',
          top: 'calc(16px + var(--sat))',
          right: '16px',
          background: 'rgba(15, 23, 42, 0.6)',
          border: '1px solid rgba(56, 189, 248, 0.2)',
          color: soundEnabled ? '#38bdf8' : '#64748b',
          borderRadius: '8px',
          padding: '6px 10px',
          display: 'flex',
          alignItems: 'center',
          gap: '6px',
          fontSize: '0.75rem',
          fontFamily: 'var(--font-mono)',
          cursor: 'pointer',
          backdropFilter: 'blur(8px)',
          transition: 'all 0.2s',
        }}
        title="Bật/Tắt hiệu ứng âm thanh kỹ thuật"
      >
        {soundEnabled ? <Volume2 size={14} /> : <VolumeX size={14} />}
        <span>{soundEnabled ? 'AUDIO: ON' : 'AUDIO: MUTED'}</span>
      </button>

      {/* Cyber Security Chassis Container */}
      <div
        style={{
          width: '100%',
          maxWidth: '320px',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          position: 'relative',
          padding: '24px 20px 20px 20px',
          borderRadius: '20px',
          background: 'rgba(11, 18, 33, 0.85)',
          border: '1px solid rgba(56, 189, 248, 0.22)',
          boxShadow: '0 20px 45px -10px rgba(0, 0, 0, 0.8), 0 0 35px rgba(56, 189, 248, 0.1)',
          backdropFilter: 'blur(16px)',
          animation: shake ? 'cyberShake 0.45s cubic-bezier(.36,.07,.19,.97) both' : undefined,
        }}
      >
        {/* Tech Corner Brackets */}
        <div style={{ position: 'absolute', top: '8px', left: '8px', width: '10px', height: '10px', borderTop: '2px solid #38bdf8', borderLeft: '2px solid #38bdf8' }} />
        <div style={{ position: 'absolute', top: '8px', right: '8px', width: '10px', height: '10px', borderTop: '2px solid #38bdf8', borderRight: '2px solid #38bdf8' }} />
        <div style={{ position: 'absolute', bottom: '8px', left: '8px', width: '10px', height: '10px', borderBottom: '2px solid #38bdf8', borderLeft: '2px solid #38bdf8' }} />
        <div style={{ position: 'absolute', bottom: '8px', right: '8px', width: '10px', height: '10px', borderBottom: '2px solid #38bdf8', borderRight: '2px solid #38bdf8' }} />

        {/* Top Tech Protocol Status Bar */}
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            padding: '3px 10px',
            borderRadius: '999px',
            background: 'rgba(56, 189, 248, 0.08)',
            border: '1px solid rgba(56, 189, 248, 0.25)',
            marginBottom: '14px',
            fontSize: '0.68rem',
            fontFamily: 'var(--font-mono)',
            color: '#38bdf8',
            letterSpacing: '0.08em',
          }}
        >
          <span
            style={{
              width: '6px',
              height: '6px',
              borderRadius: '50%',
              backgroundColor: successMessage ? '#10b981' : errorMessage ? '#f43f5e' : '#38bdf8',
              boxShadow: `0 0 8px ${successMessage ? '#10b981' : errorMessage ? '#f43f5e' : '#38bdf8'}`,
              animation: 'pulseGlow 1.5s infinite',
            }}
          />
          <span>FINTRACK // CIPHER_NODE</span>
          <span style={{ color: 'rgba(56, 189, 248, 0.4)' }}>|</span>
          <span style={{ color: '#94a3b8' }}>v2.4</span>
        </div>

        {/* Security Icon Badge (Clickable for Biometrics) */}
        <button
          type="button"
          onClick={() => {
            if (hasBiometricAvailable) {
              triggerBiometricAuth();
            }
          }}
          disabled={!hasBiometricAvailable}
          style={{
            position: 'relative',
            width: '54px',
            height: '54px',
            borderRadius: '16px',
            background: 'linear-gradient(135deg, rgba(15, 23, 42, 0.9), rgba(30, 41, 59, 0.8))',
            border: isAuthenticatingBio
              ? '1.5px solid #10b981'
              : '1px solid rgba(56, 189, 248, 0.4)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            marginBottom: '10px',
            color: successMessage ? '#10b981' : '#38bdf8',
            boxShadow: isAuthenticatingBio
              ? '0 0 30px rgba(16, 185, 129, 0.4)'
              : '0 0 24px rgba(56, 189, 248, 0.22)',
            transition: 'all 0.3s',
            cursor: hasBiometricAvailable ? 'pointer' : 'default',
          }}
          title={hasBiometricAvailable ? 'Nhấn để quét sinh trắc học' : undefined}
        >
          {successMessage ? (
            <ShieldCheck size={28} style={{ color: '#10b981' }} />
          ) : isSettingMode ? (
            <KeyRound size={26} />
          ) : (
            <Fingerprint size={28} style={{ animation: isAuthenticatingBio ? 'pulseIcon 0.8s infinite' : undefined }} />
          )}
          {/* Subtle spinning radar ring */}
          <div
            style={{
              position: 'absolute',
              inset: '-4px',
              borderRadius: '18px',
              border: '1px dashed rgba(56, 189, 248, 0.3)',
              pointerEvents: 'none',
              animation: 'spinRing 18s linear infinite',
            }}
          />
        </button>

        {/* Title */}
        <h2
          style={{
            fontSize: '1.15rem',
            fontWeight: 700,
            color: '#f8fafc',
            marginBottom: '4px',
            textAlign: 'center',
            letterSpacing: '0.02em',
          }}
        >
          {isSettingMode
            ? step === 'enter'
              ? 'Khởi Tạo Mã PIN'
              : 'Xác Nhận Lại Mã'
            : 'Xác Thực Mật Mã'}
        </h2>

        {/* Terminal Subtext Status */}
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '5px',
            fontSize: '0.75rem',
            fontFamily: 'var(--font-mono)',
            color: errorMessage ? '#f43f5e' : successMessage ? '#10b981' : '#64748b',
            marginBottom: '16px',
            textAlign: 'center',
            minHeight: '18px',
            letterSpacing: '0.02em',
          }}
        >
          <Terminal size={12} style={{ flexShrink: 0 }} />
          <span>
            {errorMessage ||
              successMessage ||
              (isSettingMode
                ? step === 'enter'
                  ? 'NHẬP 4 CHỮ SỐ BẢO MẬT'
                  : 'NHẬP LẠI ĐỂ KHỚP BỘ MÃ'
                : 'YÊU CẦU CIPHER HOẶC VÂN TAY')}
          </span>
        </div>

        {/* 4 Tech Cipher Slot Cells */}
        <div
          style={{
            display: 'flex',
            gap: '12px',
            marginBottom: '16px',
          }}
        >
          {[0, 1, 2, 3].map((index) => {
            const isFilled = pinInput.length > index;
            const isCurrent = pinInput.length === index;
            return (
              <div
                key={index}
                style={{
                  width: '42px',
                  height: '48px',
                  borderRadius: '10px',
                  background: isFilled
                    ? 'rgba(56, 189, 248, 0.12)'
                    : isCurrent
                    ? 'rgba(30, 41, 59, 0.8)'
                    : 'rgba(15, 23, 42, 0.6)',
                  border: isFilled
                    ? '1.5px solid #38bdf8'
                    : isCurrent
                    ? '1.5px solid rgba(56, 189, 248, 0.6)'
                    : '1px solid rgba(255, 255, 255, 0.1)',
                  boxShadow: isFilled
                    ? '0 0 16px rgba(56, 189, 248, 0.35), inset 0 0 10px rgba(56, 189, 248, 0.15)'
                    : isCurrent
                    ? '0 0 10px rgba(56, 189, 248, 0.2)'
                    : 'none',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  transition: 'all 0.18s cubic-bezier(0.4, 0, 0.2, 1)',
                  position: 'relative',
                  overflow: 'hidden',
                }}
              >
                {/* Tech scanline inside cell */}
                <div
                  style={{
                    position: 'absolute',
                    top: 0,
                    left: 0,
                    right: 0,
                    height: '1px',
                    background: 'rgba(56, 189, 248, 0.4)',
                    opacity: isFilled || isCurrent ? 0.7 : 0.2,
                  }}
                />

                {isFilled ? (
                  <div
                    style={{
                      width: '12px',
                      height: '12px',
                      borderRadius: '3px',
                      background: '#38bdf8',
                      boxShadow: '0 0 10px #38bdf8',
                      transform: 'rotate(45deg)',
                      animation: 'popIn 0.15s ease-out',
                    }}
                  />
                ) : isCurrent ? (
                  <div
                    style={{
                      width: '14px',
                      height: '2px',
                      backgroundColor: '#38bdf8',
                      animation: 'blinkCursor 0.8s infinite',
                    }}
                  />
                ) : (
                  <span
                    style={{
                      color: 'rgba(255, 255, 255, 0.15)',
                      fontFamily: 'var(--font-mono)',
                      fontSize: '0.85rem',
                    }}
                  >
                    +
                  </span>
                )}
              </div>
            );
          })}
        </div>

        {/* Quick Biometric Action Bar (if available) */}
        {hasBiometricAvailable && (
          <button
            type="button"
            onClick={triggerBiometricAuth}
            style={{
              width: '100%',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '8px',
              padding: '7px 12px',
              marginBottom: '14px',
              borderRadius: '10px',
              background: 'rgba(56, 189, 248, 0.08)',
              border: '1px solid rgba(56, 189, 248, 0.3)',
              color: '#38bdf8',
              fontSize: '0.8rem',
              fontWeight: 600,
              fontFamily: 'var(--font-mono)',
              cursor: 'pointer',
              transition: 'all 0.15s ease',
            }}
            onMouseDown={(e) => {
              e.currentTarget.style.backgroundColor = 'rgba(56, 189, 248, 0.2)';
            }}
            onMouseUp={(e) => {
              e.currentTarget.style.backgroundColor = 'rgba(56, 189, 248, 0.08)';
            }}
          >
            <ScanLine size={16} />
            <span>QUÉT VÂN TAY / SINH TRẮC HỌC</span>
          </button>
        )}

        {/* Compact Ergonomic Tech Keypad */}
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(3, 1fr)',
            gap: '8px',
            width: '100%',
          }}
        >
          {keyPadConfig.map(({ num, sub }) => {
            const isKeyActive = activeKey === num;
            return (
              <button
                key={num}
                type="button"
                onClick={() => handleKeyPress(num)}
                style={{
                  height: '46px',
                  borderRadius: '10px',
                  backgroundColor: isKeyActive
                    ? 'rgba(56, 189, 248, 0.3)'
                    : 'rgba(21, 32, 54, 0.65)',
                  border: isKeyActive
                    ? '1px solid #38bdf8'
                    : '1px solid rgba(56, 189, 248, 0.16)',
                  color: '#f8fafc',
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  justifyContent: 'center',
                  cursor: 'pointer',
                  transition: 'all 0.1s cubic-bezier(0.4, 0, 0.2, 1)',
                  position: 'relative',
                  overflow: 'hidden',
                  transform: isKeyActive ? 'scale(0.95)' : 'scale(1)',
                  boxShadow: isKeyActive
                    ? '0 0 14px rgba(56, 189, 248, 0.4)'
                    : '0 2px 4px rgba(0, 0, 0, 0.2)',
                }}
                onMouseDown={(e) => {
                  e.currentTarget.style.backgroundColor = 'rgba(56, 189, 248, 0.25)';
                  e.currentTarget.style.borderColor = '#38bdf8';
                  e.currentTarget.style.transform = 'scale(0.94)';
                }}
                onMouseUp={(e) => {
                  e.currentTarget.style.backgroundColor = 'rgba(21, 32, 54, 0.65)';
                  e.currentTarget.style.borderColor = 'rgba(56, 189, 248, 0.16)';
                  e.currentTarget.style.transform = 'scale(1)';
                }}
                onTouchStart={(e) => {
                  e.currentTarget.style.backgroundColor = 'rgba(56, 189, 248, 0.25)';
                  e.currentTarget.style.transform = 'scale(0.94)';
                }}
                onTouchEnd={(e) => {
                  e.currentTarget.style.backgroundColor = 'rgba(21, 32, 54, 0.65)';
                  e.currentTarget.style.transform = 'scale(1)';
                }}
              >
                <span
                  style={{
                    fontSize: '1.25rem',
                    fontWeight: 700,
                    fontFamily: 'var(--font-mono)',
                    lineHeight: 1.1,
                    letterSpacing: '0.02em',
                  }}
                >
                  {num}
                </span>
                <span
                  style={{
                    fontSize: '0.55rem',
                    fontFamily: 'var(--font-mono)',
                    color: '#64748b',
                    letterSpacing: '0.08em',
                  }}
                >
                  {sub}
                </span>
              </button>
            );
          })}

          {/* Row 4: Action/Reset/Biometric - 0 - Delete */}
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            {isSettingMode && step === 'confirm' ? (
              <button
                type="button"
                onClick={() => {
                  setStep('enter');
                  setPinInput('');
                  setConfirmPinInput('');
                  playTechSound('beep');
                }}
                style={{
                  width: '100%',
                  height: '46px',
                  borderRadius: '10px',
                  background: 'rgba(244, 63, 94, 0.1)',
                  border: '1px solid rgba(244, 63, 94, 0.25)',
                  color: '#fda4af',
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  justifyContent: 'center',
                  cursor: 'pointer',
                  fontSize: '0.65rem',
                  fontFamily: 'var(--font-mono)',
                  gap: '2px',
                  transition: 'all 0.15s',
                }}
                title="Làm lại từ đầu"
              >
                <RotateCcw size={14} />
                <span>RESET</span>
              </button>
            ) : hasBiometricAvailable ? (
              <button
                type="button"
                onClick={triggerBiometricAuth}
                style={{
                  width: '100%',
                  height: '46px',
                  borderRadius: '10px',
                  backgroundColor: 'rgba(56, 189, 248, 0.12)',
                  border: '1px solid rgba(56, 189, 248, 0.3)',
                  color: '#38bdf8',
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  justifyContent: 'center',
                  cursor: 'pointer',
                  transition: 'all 0.15s',
                }}
                title="Quét vân tay"
              >
                <Fingerprint size={20} />
                <span
                  style={{
                    fontSize: '0.55rem',
                    fontFamily: 'var(--font-mono)',
                    color: '#38bdf8',
                    letterSpacing: '0.06em',
                  }}
                >
                  BIO
                </span>
              </button>
            ) : (
              <div
                style={{
                  width: '100%',
                  height: '46px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  color: 'rgba(255, 255, 255, 0.15)',
                  fontSize: '0.65rem',
                  fontFamily: 'var(--font-mono)',
                }}
              >
                SEC_01
              </div>
            )}
          </div>

          {/* 0 Key */}
          <button
            type="button"
            onClick={() => handleKeyPress('0')}
            style={{
              height: '46px',
              borderRadius: '10px',
              backgroundColor: activeKey === '0'
                ? 'rgba(56, 189, 248, 0.3)'
                : 'rgba(21, 32, 54, 0.65)',
              border: activeKey === '0'
                ? '1px solid #38bdf8'
                : '1px solid rgba(56, 189, 248, 0.16)',
              color: '#f8fafc',
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'center',
              cursor: 'pointer',
              transition: 'all 0.1s cubic-bezier(0.4, 0, 0.2, 1)',
              transform: activeKey === '0' ? 'scale(0.95)' : 'scale(1)',
              boxShadow: activeKey === '0' ? '0 0 14px rgba(56, 189, 248, 0.4)' : '0 2px 4px rgba(0, 0, 0, 0.2)',
            }}
            onMouseDown={(e) => {
              e.currentTarget.style.backgroundColor = 'rgba(56, 189, 248, 0.25)';
              e.currentTarget.style.transform = 'scale(0.94)';
            }}
            onMouseUp={(e) => {
              e.currentTarget.style.backgroundColor = 'rgba(21, 32, 54, 0.65)';
              e.currentTarget.style.transform = 'scale(1)';
            }}
            onTouchStart={(e) => {
              e.currentTarget.style.backgroundColor = 'rgba(56, 189, 248, 0.25)';
              e.currentTarget.style.transform = 'scale(0.94)';
            }}
            onTouchEnd={(e) => {
              e.currentTarget.style.backgroundColor = 'rgba(21, 32, 54, 0.65)';
              e.currentTarget.style.transform = 'scale(1)';
            }}
          >
            <span
              style={{
                fontSize: '1.25rem',
                fontWeight: 700,
                fontFamily: 'var(--font-mono)',
                lineHeight: 1.1,
              }}
            >
              0
            </span>
            <span
              style={{
                fontSize: '0.55rem',
                fontFamily: 'var(--font-mono)',
                color: '#64748b',
                letterSpacing: '0.08em',
              }}
            >
              OPER
            </span>
          </button>

          {/* Delete Key */}
          <button
            type="button"
            onClick={handleDelete}
            style={{
              height: '46px',
              borderRadius: '10px',
              backgroundColor: activeKey === 'del'
                ? 'rgba(244, 63, 94, 0.25)'
                : 'rgba(21, 32, 54, 0.4)',
              border: activeKey === 'del'
                ? '1px solid #f43f5e'
                : '1px solid rgba(255, 255, 255, 0.1)',
              color: '#94a3b8',
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'center',
              cursor: 'pointer',
              transition: 'all 0.1s cubic-bezier(0.4, 0, 0.2, 1)',
              transform: activeKey === 'del' ? 'scale(0.95)' : 'scale(1)',
            }}
            onMouseDown={(e) => {
              e.currentTarget.style.backgroundColor = 'rgba(244, 63, 94, 0.2)';
              e.currentTarget.style.color = '#f43f5e';
              e.currentTarget.style.transform = 'scale(0.94)';
            }}
            onMouseUp={(e) => {
              e.currentTarget.style.backgroundColor = 'rgba(21, 32, 54, 0.4)';
              e.currentTarget.style.color = '#94a3b8';
              e.currentTarget.style.transform = 'scale(1)';
            }}
            title="Xóa ký tự (Backspace)"
          >
            <Delete size={18} />
            <span
              style={{
                fontSize: '0.55rem',
                fontFamily: 'var(--font-mono)',
                color: '#64748b',
                letterSpacing: '0.06em',
                marginTop: '1px',
              }}
            >
              DEL
            </span>
          </button>
        </div>

        {/* Keyboard hint for desktop users */}
        <div
          style={{
            marginTop: '12px',
            fontSize: '0.68rem',
            fontFamily: 'var(--font-mono)',
            color: '#475569',
            display: 'flex',
            alignItems: 'center',
            gap: '6px',
          }}
        >
          <span>HỖ TRỢ PHÍM SỐ [0-9] & [⌫]</span>
        </div>
      </div>

      <style>{`
        @keyframes cyberShake {
          10%, 90% { transform: translate3d(-2px, 0, 0); }
          20%, 80% { transform: translate3d(3px, 0, 0); }
          30%, 50%, 70% { transform: translate3d(-4px, 0, 0); }
          40%, 60% { transform: translate3d(4px, 0, 0); }
        }
        @keyframes pulseGlow {
          0%, 100% { opacity: 1; transform: scale(1); }
          50% { opacity: 0.5; transform: scale(1.2); }
        }
        @keyframes pulseIcon {
          0%, 100% { transform: scale(1); opacity: 1; }
          50% { transform: scale(1.15); opacity: 0.7; }
        }
        @keyframes spinRing {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }
        @keyframes blinkCursor {
          0%, 100% { opacity: 1; }
          50% { opacity: 0; }
        }
        @keyframes popIn {
          0% { transform: rotate(45deg) scale(0.3); opacity: 0; }
          70% { transform: rotate(45deg) scale(1.2); }
          100% { transform: rotate(45deg) scale(1); opacity: 1; }
        }
      `}</style>
    </div>
  );
};
