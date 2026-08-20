import { useState } from 'react';
import Button from '../../../shared/components/Button';
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

export default function EquipoCriticoManager({
  grupoNombre,
  equiposAsignados,
  equiposDisponibles,
  onAsociar,
  onDesasociar,
}: Props) {
  const [busqueda, setBusqueda] = useState('');

  const equiposFiltrados = equiposDisponibles.filter(e =>
    !equiposAsignados.find(a => a.id === e.id) &&
    (e.codigo.toLowerCase().includes(busqueda.toLowerCase()) ||
     e.nombre.toLowerCase().includes(busqueda.toLowerCase()))
  );

  return (
    <div>
      <h3 style={{ fontSize: 16, margin: 0, marginBottom: spacing.md }}>
        {grupoNombre ? `Equipos en "${grupoNombre}"` : 'Selecciona un grupo'}
      </h3>

      {!grupoNombre ? (
        <p style={{ color: colors.text.muted, fontSize: 13 }}>
          Haz clic en un grupo para ver sus equipos.
        </p>
      ) : (
        <>
          {/* Equipos ya asignados */}
          <div style={{ marginBottom: spacing.lg }}>
            <div style={{ fontSize: 12, fontWeight: 600, marginBottom: spacing.sm, color: colors.text.secondary }}>
              Equipos asignados ({equiposAsignados.length})
            </div>
            {equiposAsignados.length === 0 ? (
              <p style={{ color: colors.text.muted, fontSize: 13, marginBottom: spacing.md }}>
                Sin equipos asignados.
              </p>
            ) : (
              <div style={{
                display: 'flex',
                flexWrap: 'wrap',
                gap: spacing.sm,
              }}>
                {equiposAsignados.map(e => (
                  <div key={e.id} style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: spacing.xs,
                    padding: `${spacing.xs}px ${spacing.sm}px`,
                    background: colors.primaryGhost,
                    borderRadius: 20,
                    fontSize: 13,
                    color: colors.text.primary,
                    border: `1px solid ${colors.borderLight}`,
                  }}>
                    <span style={{ fontWeight: 600 }}>{e.codigo}</span>
                    <span style={{ color: colors.text.muted, marginLeft: 4 }}>{e.nombre}</span>
                    <span style={{
                      marginLeft: spacing.sm,
                      cursor: 'pointer',
                      fontWeight: 'bold',
                      fontSize: 16,
                      lineHeight: 1,
                      color: colors.status.error,
                    }} onClick={() => onDesasociar(e.id)}>✕</span>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Agregar equipos */}
          <div style={{ marginBottom: spacing.md }}>
            <div style={{ fontSize: 12, fontWeight: 600, marginBottom: spacing.sm, color: colors.text.secondary }}>
              Agregar equipos críticos
            </div>

            {/* Campo de búsqueda */}
            <input
              type="text"
              placeholder="Buscar equipo por código o nombre..."
              value={busqueda}
              onChange={(e) => setBusqueda(e.target.value)}
              style={{
                width: '100%',
                padding: spacing.sm,
                marginBottom: spacing.sm,
                borderRadius: 6,
                border: `1px solid ${colors.border}`,
                fontSize: 13,
              }}
            />

            {/* Lista filtrada */}
            <div style={{
              maxHeight: 200,
              overflowY: 'auto',
              border: `1px solid ${colors.borderLight}`,
              borderRadius: 6,
              background: colors.surfaceMuted,
            }}>
              {equiposFiltrados.length === 0 ? (
                <p style={{ padding: spacing.md, textAlign: 'center', color: colors.text.muted, fontSize: 13, margin: 0 }}>
                  {busqueda ? 'Sin resultados' : 'Todos los equipos críticos disponibles ya fueron asignados'}
                </p>
              ) : (
                equiposFiltrados.map(e => (
                  <div key={e.id} style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    padding: `${spacing.sm}px ${spacing.md}px`,
                    borderBottom: `1px solid ${colors.borderLight}`,
                    background: colors.surface,
                    cursor: 'pointer',
                  }}>
                    <div style={{ flex: 1 }}>
                      <div style={{ fontWeight: 600, fontSize: 13 }}>{e.codigo} - {e.nombre}</div>
                      <div style={{ fontSize: 11, color: colors.text.muted }}>{e.area}</div>
                    </div>
                    <Button
                      variant="ghost"
                      icon="+"
                      onClick={() => onAsociar(e.id)}
                    >
                      Agregar
                    </Button>
                  </div>
                ))
              )}
            </div>
          </div>
        </>
      )}
    </div>
  );
}