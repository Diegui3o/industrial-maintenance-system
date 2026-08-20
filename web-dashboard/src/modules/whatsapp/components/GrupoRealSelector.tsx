import Card from '../../../shared/components/Card';
import Button from '../../../shared/components/Button';
import { colors, spacing } from '../../../theme/colors';

interface GrupoReal {
  jid: string;
  nombre?: string;
}

interface Props {
  grupos: GrupoReal[];
  onVincular: (jid: string, nombre: string) => void;
  onCerrar: () => void;
}

export default function GrupoRealSelector({ grupos, onVincular, onCerrar }: Props) {
  return (
    <Card padding={24} hover={false} style={{ marginBottom: spacing.lg, border: `2px solid #25D366` }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: spacing.md }}>
        <h3 style={{ fontSize: 16, margin: 0, color: '#25D366' }}>📋 Vincular Grupo</h3>
        <Button variant="ghost" onClick={onCerrar}>✕ Cerrar</Button>
      </div>
      <p style={{ fontSize: 13, color: colors.text.secondary, marginBottom: spacing.md }}>
        Grupos donde el bot de WhatsApp es miembro:
      </p>
      {grupos.length === 0 ? (
        <p style={{ fontSize: 13, color: colors.text.muted }}>No se encontraron grupos.</p>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: spacing.sm }}>
          {grupos.map((g) => (
            <div
              key={g.jid}
              style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                padding: spacing.md,
                background: colors.surfaceMuted,
                borderRadius: 6,
              }}
            >
              <div>
                <div style={{ fontWeight: 600, fontSize: 14 }}>{g.nombre || 'Grupo'}</div>
                <div style={{ fontSize: 11, color: colors.text.muted }}>{g.jid}</div>
              </div>
              <Button icon="🔗" onClick={() => onVincular(g.jid, g.nombre || 'Grupo')}>
                Vincular
              </Button>
            </div>
          ))}
        </div>
      )}
    </Card>
  );
}