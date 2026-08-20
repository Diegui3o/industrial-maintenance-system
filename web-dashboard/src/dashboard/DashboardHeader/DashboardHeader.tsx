import { useState, useEffect } from 'react';
import { colors } from '../../theme/colors';

interface DashboardHeaderProps {
  isConnected: boolean | null;
}

export function DashboardHeader({ isConnected }: DashboardHeaderProps) {
  const [now, setNow] = useState(new Date());

  useEffect(() => {
    const timer = setInterval(() => setNow(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  const fmtTime = (d: Date) => d.toLocaleTimeString('es-PE', { hour12: false });
  const fmtDate = (d: Date) => d.toLocaleDateString('es-PE', { weekday: 'long', day: 'numeric', month: 'long' });

  return (
    <header style={{
      background: colors.surface,
      borderBottom: `1px solid ${colors.border}`,
      padding: '16px 32px',
      position: 'sticky', top: 0, zIndex: 100,
    }}>
      <div style={{ maxWidth: 1280, margin: '0 auto', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
          <div style={{
            width: 36, height: 36, borderRadius: 8,
            background: colors.primary,
            display: 'flex', alignItems: 'center', justifyContent: 'center',
          }}>
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5" strokeLinecap="round">
              <circle cx="12" cy="12" r="3"/>
              <path d="M12 1v2M12 21v2M4.22 4.22l1.42 1.42M18.36 18.36l1.42 1.42M1 12h2M21 12h2M4.22 19.78l1.42-1.42M18.36 5.64l1.42-1.42"/>
            </svg>
          </div>
          <div>
            <div style={{ fontSize: 15, fontWeight: 700, color: colors.text.primary, letterSpacing: 3, textTransform: 'uppercase' }}>
              NEXA RESOURCES
            </div>
            <div style={{ fontSize: 10, color: colors.text.muted, letterSpacing: 2, textTransform: 'uppercase', marginTop: 1 }}>
              Mantenimiento Industrial
            </div>
          </div>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: 20 }}>
          <div style={{
            display: 'flex', alignItems: 'center', gap: 8,
            padding: '5px 12px', borderRadius: 50,
            background: isConnected ? colors.status.successBg : colors.status.errorBg,
            border: `1px solid ${isConnected ? colors.status.success : colors.status.error}30`,
          }}>
            <span style={{
              width: 7, height: 7, borderRadius: '50%',
              background: isConnected ? colors.status.success : colors.status.error,
              animation: isConnected ? 'pulse-dot 2.5s infinite' : 'none',
            }} />
            <span style={{ fontSize: 11, fontWeight: 700, color: isConnected ? colors.status.success : colors.status.error }}>
              {isConnected ? 'EN LÍNEA' : 'OFFLINE'}
            </span>
          </div>
          <div style={{ textAlign: 'right' }}>
            <div style={{ fontSize: 20, fontWeight: 700, color: colors.text.primary, fontVariantNumeric: 'tabular-nums' }}>
              {fmtTime(now)}
            </div>
            <div style={{ fontSize: 11, color: colors.text.muted, textTransform: 'capitalize' }}>
              {fmtDate(now)}
            </div>
          </div>
        </div>
      </div>
      <style>{`
        @keyframes pulse-dot {
          0%, 100% { opacity: 1; transform: scale(1); }
          50% { opacity: 0.4; transform: scale(1.5); }
        }
      `}</style>
    </header>
  );
}