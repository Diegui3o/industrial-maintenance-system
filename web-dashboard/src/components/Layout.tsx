import { colors, spacing } from '../theme/colors';
import Badge from './Badge';

interface Props {
  children: React.ReactNode;
  title: string;
  subtitle?: string;
  onBack?: () => void;
  isConnected?: boolean | null;
  actions?: React.ReactNode;
}

export default function Layout({ children, title, subtitle, onBack, isConnected, actions }: Props) {
  return (
    <div style={{ minHeight: '100vh', background: colors.background, display: 'flex', flexDirection: 'column' }}>
      {/* Top Bar */}
      <header style={{
        background: colors.surface,
        borderBottom: `1px solid ${colors.border}`,
        padding: `${spacing.md}px ${spacing.lg}px`,
        position: 'sticky',
        top: 0,
        zIndex: 100,
        backdropFilter: 'blur(12px)',
        backgroundColor: 'rgba(255,255,255,0.92)',
      }}>
        <div style={{
          maxWidth: 1200,
          margin: '0 auto',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: spacing.md }}>
            {onBack && (
              <button
                onClick={onBack}
                className="btn-hover"
                style={{
                  background: 'transparent',
                  border: `1.5px solid ${colors.border}`,
                  borderRadius: 10,
                  padding: '8px 14px',
                  cursor: 'pointer',
                  color: colors.text.secondary,
                  fontSize: 14,
                  fontWeight: 500,
                  display: 'flex',
                  alignItems: 'center',
                  gap: 6,
                }}
              >
                ← Volver
              </button>
            )}
            <div>
              <h2 style={{ fontSize: 20, fontWeight: 700 }}>{title}</h2>
              {subtitle && <p style={{ fontSize: 13, color: colors.text.muted, marginTop: 2 }}>{subtitle}</p>}
            </div>
          </div>
          
          <div style={{ display: 'flex', alignItems: 'center', gap: spacing.md }}>
            {actions}
            {isConnected !== undefined && (
              <Badge
                text={isConnected === true ? 'EN LÍNEA' : isConnected === false ? 'OFFLINE' : 'CONECTANDO...'}
                variant={isConnected === true ? 'success' : isConnected === false ? 'error' : 'warning'}
                dot
              />
            )}
          </div>
        </div>
      </header>

      {/* Content */}
      <main className="page-transition" style={{
        flex: 1,
        maxWidth: 1200,
        width: '100%',
        margin: '0 auto',
        padding: `${spacing.lg}px ${spacing.lg}px ${spacing.xxl}px`,
      }}>
        {children}
      </main>
    </div>
  );
}