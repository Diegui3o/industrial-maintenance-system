import Card from '../../../components/Card';
import Button from '../../../components/Button';
import { colors, spacing } from '../../../theme/colors';

interface GrupoVinculado {
  id: number;
  nombre: string;
  jid: string;
}

interface Props {
  grupos: GrupoVinculado[];
  grupoSeleccionado?: GrupoVinculado | null;
  onSeleccionar: (grupo: GrupoVinculado) => void;
  onEliminar: (id: number) => void;
}

export default function GrupoVinculadoLista({
  grupos,
  grupoSeleccionado,
  onSeleccionar,
  onEliminar,
}: Props) {
  return (
    <Card padding={20} hover={false}>
      <h3 style={{ fontSize: 16, margin: 0, marginBottom: spacing.md }}>📱 Grupos Vinculados</h3>
      {grupos.length === 0 ? (
        <p style={{ color: colors.text.muted, fontSize: 13 }}>No hay grupos vinculados.</p>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: spacing.sm }}>
          {grupos.map((g) => (
            <div
              key={g.id}
              onClick={() => onSeleccionar(g)}
              style={{
                padding: spacing.md,
                background:
                  grupoSeleccionado?.id === g.id ? colors.primaryGhost : colors.surfaceMuted,
                borderRadius: 6,
                cursor: 'pointer',
                border:
                  grupoSeleccionado?.id === g.id
                    ? `1px solid ${colors.primary}`
                    : '1px solid transparent',
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
              }}
            >
              <div>
                <div style={{ fontWeight: 600, fontSize: 14 }}>{g.nombre}</div>
                <div style={{ fontSize: 11, color: colors.text.muted }}>{g.jid}</div>
              </div>
              <div onClick={(e) => e.stopPropagation()}>
                <Button variant="ghost" icon="🗑️" onClick={() => onEliminar(g.id)}>
                  Eliminar
                </Button>
              </div>
            </div>
          ))}
        </div>
      )}
    </Card>
  );
}