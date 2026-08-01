import Button from '../../../components/Button';
import { colors, spacing } from '../../../theme/colors';

interface Props {
  mensaje: string;
  onChange: (mensaje: string) => void;
  onEnviar: () => void;
  enviando?: boolean;
}

export default function MensajePruebaInput({ mensaje, onChange, onEnviar, enviando }: Props) {
  return (
    <div style={{ borderTop: `1px solid ${colors.borderLight}`, paddingTop: spacing.md }}>
      <div
        style={{
          fontSize: 12,
          fontWeight: 600,
          marginBottom: spacing.sm,
          color: colors.text.secondary,
        }}
      >
        Enviar mensaje de prueba:
      </div>
      <textarea
        value={mensaje}
        onChange={(e) => onChange(e.target.value)}
        placeholder="Escribe un mensaje..."
        style={{
          width: '100%',
          padding: spacing.sm,
          marginBottom: spacing.sm,
          minHeight: 60,
          borderRadius: 6,
          border: `1px solid ${colors.border}`,
        }}
      />
      <Button icon="📤" onClick={onEnviar} disabled={!mensaje.trim() || enviando}>
        {enviando ? 'Enviando...' : 'Enviar al Grupo'}
      </Button>
    </div>
  );
}