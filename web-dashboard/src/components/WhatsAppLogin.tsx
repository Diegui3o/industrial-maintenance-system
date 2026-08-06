import { useState } from 'react';
import Card from './Card';
import Button from './Button';
import { colors, spacing } from '../theme/colors';

interface Props {
  onLogin: (key: string) => void;
  error: string | null;
  verificando: boolean;
}

export default function WhatsAppLogin({ onLogin, error, verificando }: Props) {
  const [key, setKey] = useState('');

  const handleSubmit = () => {
    if (key.trim()) onLogin(key.trim());
  };

  return (
    <div style={{
      display: 'flex', justifyContent: 'center', alignItems: 'center',
      minHeight: '50vh'
    }}>
      <Card padding={32} hover={false} style={{ maxWidth: 420, width: '100%' }}>
        <div style={{ textAlign: 'center', marginBottom: spacing.lg }}>
          <div style={{ fontSize: 40, marginBottom: spacing.sm }}>🔐</div>
          <h2 style={{ fontSize: 18, margin: 0, marginBottom: 4, color: colors.text.primary }}>
            Acceso a Notificaciones
          </h2>
          <p style={{ fontSize: 13, color: colors.text.secondary, margin: 0 }}>
            Ingresa tu API Key personal para gestionar grupos de WhatsApp
          </p>
        </div>

        <input
          type="password"
          placeholder="mto_..."
          value={key}
          onChange={e => setKey(e.target.value)}
          onKeyDown={e => e.key === 'Enter' && handleSubmit()}
          autoFocus
          disabled={verificando}
          style={{
            width: '100%',
            padding: '12px 14px',
            fontSize: 15,
            border: `2px solid ${error ? colors.status.error : colors.border}`,
            borderRadius: 8,
            marginBottom: spacing.sm,
            outline: 'none',
            textAlign: 'center',
            letterSpacing: 1,
            fontFamily: 'monospace',
          }}
        />

        {error && (
          <div style={{
            padding: spacing.sm,
            marginBottom: spacing.sm,
            background: colors.status.errorBg,
            color: colors.status.error,
            borderRadius: 6,
            fontSize: 13,
            textAlign: 'center'
          }}>
            {error}
          </div>
        )}

        <Button
        onClick={handleSubmit}
        disabled={!key.trim() || verificando}
        >
        {verificando ? 'Verificando...' : 'Ingresar'}
        </Button>

        <p style={{
          fontSize: 11,
          color: colors.text.muted,
          textAlign: 'center',
          marginTop: spacing.md,
          marginBottom: 0
        }}>
          Solicita tu API Key al administrador del sistema
        </p>
      </Card>
    </div>
  );
}