import Card from '../../../components/Card';
import Button from '../../../components/Button';
import { colors, spacing } from '../../../theme/colors';

interface Equipo {
  id: number;
  codigo: string;
  nombre: string;
  area: string;
}

interface Props {
  grupoNombre?: string;
  equiposAsignados: Equipo[];
  equiposDisponibles: Equipo[];
  onAsociar: (equipoId: number) => void;
  onDesasociar: (equipoId: number) => void;
}

export default function EquipoCriticoSelector({
  grupoNombre,
  equiposAsignados,
  equiposDisponibles,
  onAsociar,
  onDesasociar,
}: Props) {
  return (
    <Card padding={20} hover={false}>
      <h3 style={{ fontSize: 16, margin: 0, marginBottom: spacing.md }}>
        {grupoNombre ? `Equipos en "${grupoNombre}"` : 'Selecciona un grupo'}
      </h3>
      {!grupoNombre ? (
        <p style={{ color: colors.text.muted, fontSize: 13 }}>
          Haz clic en un grupo para ver sus equipos.
        </p>
      ) : (
        <>
          {equiposAsignados.length === 0 ? (
            <p style={{ color: colors.text.muted, fontSize: 13, marginBottom: spacing.md }}>
              Sin equipos asignados.
            </p>
          ) : (
            <div
              style={{
                display: 'flex',
                flexDirection: 'column',
                gap: spacing.sm,
                marginBottom: spacing.md,
              }}
            >
              {equiposAsignados.map((e) => (
                <div
                  key={e.id}
                  style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    padding: spacing.sm,
                    background: colors.surfaceMuted,
                    borderRadius: 6,
                  }}
                >
                  <div>
                    <div style={{ fontWeight: 600, fontSize: 13 }}>
                      {e.codigo} - {e.nombre}
                    </div>
                    <div style={{ fontSize: 11, color: colors.text.muted }}>{e.area}</div>
                  </div>
                  <Button variant="ghost" icon="✕" onClick={() => onDesasociar(e.id)}>
                    Quitar
                  </Button>
                </div>
              ))}
            </div>
          )}
          {equiposDisponibles.length > 0 && (
            <div style={{ marginBottom: spacing.md }}>
              <div
                style={{
                  fontSize: 12,
                  fontWeight: 600,
                  marginBottom: spacing.sm,
                  color: colors.text.secondary,
                }}
              >
                Agregar equipos críticos:
              </div>
              <select
                defaultValue=""
                onChange={(e) => {
                  const id = parseInt(e.target.value);
                  if (id) onAsociar(id);
                  e.target.value = '';
                }}
                style={{ width: '100%', padding: spacing.sm }}
              >
                <option value="">-- Seleccionar --</option>
                {equiposDisponibles.map((e) => (
                  <option key={e.id} value={e.id}>
                    {e.codigo} - {e.nombre}
                  </option>
                ))}
              </select>
            </div>
          )}
        </>
      )}
    </Card>
  );
}