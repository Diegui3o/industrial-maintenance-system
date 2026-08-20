import { useState } from 'react';
import Button from '../../../shared/components/Button';
import { colors, spacing } from '../../../theme/colors';

interface Props {
  grupoId: number;
  grupoNombre: string;
  onEnviar: (grupoId: number, mensaje: string) => Promise<void>;
}

export default function ChatPanel({ grupoId, grupoNombre, onEnviar }: Props) {
  const [mensaje, setMensaje] = useState('');
  const [enviando, setEnviando] = useState(false);
  const [historial, setHistorial] = useState<{ texto: string; fecha: Date }[]>([]);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async () => {
    const texto = mensaje.trim();
    if (!texto) return;
    setEnviando(true);
    setError(null);
    try {
      await onEnviar(grupoId, texto);
      setHistorial(prev => [...prev, { texto, fecha: new Date() }]);
      setMensaje('');
    } catch (err: any) {
      setError(err.message || 'Error al enviar');
    } finally {
      setEnviando(false);
    }
  };

  return (
    <div style={{ marginTop: spacing.lg, borderTop: `1px solid ${colors.borderLight}`, paddingTop: spacing.md }}>
      <h3 style={{ fontSize: 16, marginBottom: spacing.sm }}>💬 Chat con {grupoNombre}</h3>

      <div style={{
        background: colors.surfaceMuted,
        borderRadius: 8,
        padding: spacing.md,
        maxHeight: 250,
        overflowY: 'auto',
        display: 'flex',
        flexDirection: 'column',
        gap: spacing.sm,
        marginBottom: spacing.sm
      }}>
        {historial.length === 0 && (
          <p style={{ color: colors.text.muted, textAlign: 'center', fontSize: 13 }}>No hay mensajes aún</p>
        )}
        {historial.map((item, i) => (
          <div key={i} style={{
            background: colors.primaryGhost,
            borderRadius: 8,
            padding: spacing.sm,
            alignSelf: 'flex-end',
            maxWidth: '80%',
          }}>
            <div style={{ fontSize: 13, whiteSpace: 'pre-wrap' }}>{item.texto}</div>
            <div style={{ fontSize: 10, color: colors.text.muted, textAlign: 'right' }}>
              {item.fecha.toLocaleTimeString('es-PE', { hour: '2-digit', minute: '2-digit' })}
            </div>
          </div>
        ))}
      </div>

      <div style={{ display: 'flex', gap: spacing.sm }}>
        <textarea
          value={mensaje}
          onChange={e => setMensaje(e.target.value)}
          placeholder="Escribe un mensaje..."
          onKeyDown={e => {
            if (e.key === 'Enter' && !e.shiftKey) {
              e.preventDefault();
              handleSubmit();
            }
          }}
          style={{
            flex: 1,
            padding: spacing.sm,
            borderRadius: 8,
            border: `1px solid ${colors.border}`,
            resize: 'vertical',
            minHeight: 40,
            fontFamily: 'inherit'
          }}
        />
        <Button icon="📤" onClick={handleSubmit} disabled={enviando || !mensaje.trim()}>
          {enviando ? '...' : 'Enviar'}
        </Button>
      </div>
      {error && <p style={{ color: colors.status.error, fontSize: 12, marginTop: spacing.sm }}>{error}</p>}
    </div>
  );
}