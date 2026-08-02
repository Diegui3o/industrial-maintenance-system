import { useState, useRef, useEffect } from 'react';
import Button from '../../../components/Button';
import { colors, spacing } from '../../../theme/colors';

interface Props {
  grupoId: number;
  grupoNombre: string;
  onEnviar: (grupoId: number, mensaje: string) => Promise<void>;
  onCerrar: () => void;
}

export default function ChatPanel({ grupoId, grupoNombre, onEnviar, onCerrar }: Props) {
  const [mensaje, setMensaje] = useState('');
  const [enviando, setEnviando] = useState(false);
  const [historial, setHistorial] = useState<{ texto: string; fecha: Date }[]>([]);
  const [error, setError] = useState<string | null>(null);
  const chatEndRef = useRef<HTMLDivElement>(null);

  // Auto-scroll al último mensaje
  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [historial]);

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
    <div style={{
      border: `1px solid ${colors.border}`,
      borderRadius: 8,
      overflow: 'hidden',
      marginTop: spacing.md,
      background: colors.surface
    }}>
      {/* Cabecera del chat */}
      <div style={{
        background: colors.primary,
        color: '#fff',
        padding: `${spacing.sm}px ${spacing.md}px`,
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        fontWeight: 600,
        fontSize: 14
      }}>
        <span>💬 {grupoNombre}</span>
        <Button variant="ghost" onClick={onCerrar}>✕</Button>
      </div>

      {/* Área de mensajes */}
      <div style={{
        padding: spacing.md,
        height: 300,
        overflowY: 'auto',
        background: colors.surfaceMuted,
        display: 'flex',
        flexDirection: 'column',
        gap: spacing.sm
      }}>
        {historial.length === 0 && (
          <div style={{ textAlign: 'center', color: colors.text.muted, marginTop: 80 }}>
            <div style={{ fontSize: 32, marginBottom: spacing.sm }}>📭</div>
            <p style={{ fontSize: 13 }}>No hay mensajes aún</p>
            <p style={{ fontSize: 11 }}>Escribe uno para empezar</p>
          </div>
        )}
        {historial.map((item, i) => (
          <div key={i} style={{
            alignSelf: 'flex-end',
            maxWidth: '80%',
          }}>
            <div style={{
              background: colors.primaryGhost,
              borderRadius: '12px 12px 2px 12px',
              padding: `${spacing.sm}px ${spacing.md}px`,
              color: colors.text.primary,
              fontSize: 13,
              lineHeight: 1.4,
              whiteSpace: 'pre-wrap',
              wordBreak: 'break-word'
            }}>
              {item.texto}
            </div>
            <div style={{ fontSize: 9, color: colors.text.muted, textAlign: 'right', marginTop: 2 }}>
              {item.fecha.toLocaleTimeString('es-PE', { hour: '2-digit', minute: '2-digit' })}
            </div>
          </div>
        ))}
        <div ref={chatEndRef} />
      </div>

      {/* Input de escritura */}
      <div style={{
        padding: spacing.sm,
        borderTop: `1px solid ${colors.border}`,
        display: 'flex',
        gap: spacing.sm,
        background: colors.surface
      }}>
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
            resize: 'none',
            minHeight: 20,
            maxHeight: 80,
            fontSize: 13,
            fontFamily: 'inherit'
          }}
        />
        <Button icon="📤" onClick={handleSubmit} disabled={enviando || !mensaje.trim()}>
          {enviando ? '...' : ''}
        </Button>
      </div>
      {error && <div style={{ padding: spacing.sm, color: colors.status.error, fontSize: 12, textAlign: 'center' }}>{error}</div>}
    </div>
  );
}