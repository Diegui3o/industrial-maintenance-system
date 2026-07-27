import { useEffect, useState } from 'react';
import { colors, spacing, radius } from '../theme/colors';
import Badge from '../components/Badge';

interface Props {
  isConnected: boolean | null;
  onContinue: () => void;
  onNavigate: (page: string, params?: any) => void
  onBack?: () => void
}

export default function LandingPage({ isConnected, onContinue }: Props) {
  const [showHint, setShowHint] = useState(false);

  useEffect(() => {
    const t = setTimeout(() => setShowHint(true), 1200);
    return () => clearTimeout(t);
  }, []);

  return (
    <div
      onClick={onContinue}
      style={{
        minHeight: '100vh',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        background: `linear-gradient(160deg, #F8F9FC 0%, #FFF5EF 40%, #F8F9FC 100%)`,
        cursor: 'pointer',
        padding: spacing.lg,
        position: 'relative',
        overflow: 'hidden',
      }}
    >
      {/* Decorative circles */}
      <div style={{
        position: 'absolute',
        width: 400, height: 400,
        borderRadius: '50%',
        background: `radial-gradient(circle, ${colors.primary}08 0%, transparent 70%)`,
        top: -100, right: -100,
      }} />
      <div style={{
        position: 'absolute',
        width: 300, height: 300,
        borderRadius: '50%',
        background: `radial-gradient(circle, ${colors.primary}06 0%, transparent 70%)`,
        bottom: -50, left: -50,
      }} />

      {/* Logo */}
      <div
        className="animate-pulse-glow"
        style={{
          width: 110,
          height: 110,
          borderRadius: radius.xl,
          background: `linear-gradient(135deg, ${colors.primary} 0%, ${colors.primaryDark} 100%)`,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          marginBottom: spacing.xl,
          position: 'relative',
          zIndex: 1,
        }}
      >
        <span style={{ fontSize: 44, filter: 'brightness(2)' }}>⚙️</span>
      </div>

      {/* Brand */}
      <h1 style={{
        fontSize: 38,
        fontWeight: 800,
        color: colors.text.primary,
        letterSpacing: 6,
        textTransform: 'uppercase',
        margin: 0,
        position: 'relative',
        zIndex: 1,
      }}>
        NEXA RESOURCES
      </h1>
      <p style={{
        fontSize: 14,
        fontWeight: 400,
        color: colors.text.muted,
        letterSpacing: 4,
        marginTop: spacing.sm,
        textTransform: 'uppercase',
        position: 'relative',
        zIndex: 1,
      }}>
        Mantenimiento Industrial
      </p>

      {/* Connection badge */}
      <div style={{ marginTop: spacing.xl, position: 'relative', zIndex: 1 }}>
        <Badge
          text={isConnected === true ? 'CONECTADO' : isConnected === false ? 'SIN CONEXIÓN' : 'VERIFICANDO...'}
          variant={isConnected === true ? 'success' : isConnected === false ? 'error' : 'warning'}
          dot
        />
      </div>

      {/* Tap hint */}
      {showHint && (
        <p className="animate-fade-in" style={{
          marginTop: spacing.xxl,
          color: colors.text.muted,
          fontSize: 13,
          letterSpacing: 2,
          textTransform: 'uppercase',
          position: 'relative',
          zIndex: 1,
        }}>
          Toca para continuar →
        </p>
      )}
    </div>
  );
}