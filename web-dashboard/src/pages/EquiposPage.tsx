import { useState } from 'react';
import { colors, spacing } from '../theme/colors';
import Layout from '../components/Layout';
import Card from '../components/Card';
import Badge from '../components/Badge';
import Button from '../components/Button';

interface Props {
  onNavigate: (page: string, params?: any) => void;
  onBack?: () => void
}

// Mock data - reemplazar con tu API
const mockEquipos = [
  { id: 1, codigo: 'COMP-001', nombre: 'Compresor Principal', area: 'Producción', tipo: 'Compresor', estado_equipo: 'activo', critico: true },
  { id: 2, codigo: 'BOM-003', nombre: 'Bomba de Agua', area: 'Utilidades', tipo: 'Bomba', estado_equipo: 'mantenimiento', critico: false },
  { id: 3, codigo: 'GEN-002', nombre: 'Generador Diesel', area: 'Energía', tipo: 'Generador', estado_equipo: 'activo', critico: true },
  { id: 4, codigo: 'MOL-005', nombre: 'Molino de Bolas', area: 'Molienda', tipo: 'Molino', estado_equipo: 'fallo', critico: true },
  { id: 5, codigo: 'VEN-012', nombre: 'Ventilador Industrial', area: 'Ventilación', tipo: 'Ventilador', estado_equipo: 'inactivo', critico: false },
];

const estadoColors: Record<string, 'success' | 'error' | 'warning' | 'default'> = {
  activo: 'success',
  fallo: 'error',
  mantenimiento: 'warning',
  inactivo: 'default',
};

export default function EquiposPage({ onNavigate }: Props) {
  const [filter, setFilter] = useState('');

  const filtered = mockEquipos.filter(e => 
    e.nombre.toLowerCase().includes(filter.toLowerCase()) ||
    e.codigo.toLowerCase().includes(filter.toLowerCase())
  );

  return (
    <Layout
      title="Equipos"
      subtitle="Gestión de activos industriales"
      onBack={() => onNavigate('dashboard')}
    >
      {/* Toolbar */}
      <div style={{
        display: 'flex',
        gap: spacing.md,
        marginBottom: spacing.lg,
        flexWrap: 'wrap',
        alignItems: 'center',
      }}>
        <div style={{ flex: 1, minWidth: 240 }}>
          <input
            placeholder="Buscar por código o nombre..."
            value={filter}
            onChange={e => setFilter(e.target.value)}
          />
        </div>
        <Button onClick={() => onNavigate('crear')} icon="➕">
          Nuevo Equipo
        </Button>
      </div>

      {/* Cards grid */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))',
        gap: spacing.md,
      }}>
        {filtered.map((equipo, i) => (
          <Card
            key={equipo.id}
            onClick={() => onNavigate('equipo-detalle', equipo)}
            padding={20}
            className={`animate-fade-in-up stagger-${(i % 6) + 1}`}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: spacing.sm }}>
              <div>
                <p style={{ fontSize: 12, color: colors.text.muted, fontWeight: 600, letterSpacing: 1 }}>{equipo.codigo}</p>
                <h3 style={{ fontSize: 16, fontWeight: 700, marginTop: 2 }}>{equipo.nombre}</h3>
              </div>
              {equipo.critico && (
                <span style={{
                  fontSize: 11,
                  fontWeight: 700,
                  color: colors.status.error,
                  background: colors.status.errorBg,
                  padding: '2px 8px',
                  borderRadius: 20,
                }}>
                  CRÍTICO
                </span>
              )}
            </div>
            
            <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap', marginBottom: spacing.sm }}>
              <Badge text={equipo.area || 'Sin área'} variant="default" />
              <Badge text={equipo.tipo || 'Sin tipo'} variant="default" />
            </div>

            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: spacing.md }}>
              <Badge
                text={equipo.estado_equipo.toUpperCase()}
                variant={estadoColors[equipo.estado_equipo] || 'default'}
                dot
              />
              <span style={{ fontSize: 12, color: colors.text.muted }}>Ver detalle →</span>
            </div>
          </Card>
        ))}
      </div>

      {filtered.length === 0 && (
        <div style={{ textAlign: 'center', padding: spacing.xxl }}>
          <p style={{ fontSize: 48, marginBottom: spacing.md }}>🔍</p>
          <h3 style={{ marginBottom: spacing.sm }}>No se encontraron equipos</h3>
          <p style={{ color: colors.text.muted }}>Intenta con otro término de búsqueda</p>
        </div>
      )}
    </Layout>
  );
}