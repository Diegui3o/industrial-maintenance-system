import { colors } from '../../theme/colors';
import type { Area } from './AreaTabs';

interface DashboardAreasProps {
  onNavigate: (page: string) => void;
}

export function DashboardAreas({ onNavigate }: DashboardAreasProps) {
  const areas: {
    id: Area;
    title: string;
    subtitle: string;
    indicador: string;
    borderColor: string;
  }[] = [
    {
      id: 'mina',
      title: 'MINA',
      subtitle: 'Operación subterránea',
      indicador: '12 activos · 2 fallas',
      borderColor: '#C45A1A',
    },
    {
      id: 'planta',
      title: 'PLANTA',
      subtitle: 'Procesos y equipos',
      indicador: '8 activos · 1 mantenimiento',
      borderColor: '#2563A0',
    },
    {
      id: 'infraestructura',
      title: 'INFRAESTRUCTURA',
      subtitle: 'TI y comunicaciones',
      indicador: '5 activos · 0 fallas',
      borderColor: '#2D7A4C',
    },
  ];

  return (
    <section style={{ marginBottom: 32 }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 18 }}>
        <div style={{ width: 3, height: 18, background: colors.primary, borderRadius: 4 }} />
        <h2 style={{ fontSize: 13, fontWeight: 800, letterSpacing: 2, textTransform: 'uppercase', color: colors.text.muted }}>
          Áreas Operacionales
        </h2>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 24 }}>
        {areas.map((area) => (
          <div
            key={area.id}
            onClick={() => onNavigate(area.id)}
            style={{
              background: colors.surface,
              borderRadius: 16,
              padding: 32,
              cursor: 'pointer',
              border: `2px solid ${area.borderColor}`,
              boxShadow: '0 2px 8px rgba(0,0,0,0.04)',
              transition: 'all 0.2s ease',
              textAlign: 'center',
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.transform = 'translateY(-3px)';
              e.currentTarget.style.boxShadow = '0 8px 20px rgba(0,0,0,0.08)';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.transform = 'translateY(0)';
              e.currentTarget.style.boxShadow = '0 2px 8px rgba(0,0,0,0.04)';
            }}
          >
            <div style={{ fontSize: 24, fontWeight: 800, letterSpacing: 2, color: colors.text.primary }}>
              {area.title}
            </div>
            <div style={{ fontSize: 13, color: colors.text.muted, marginTop: 6 }}>
              {area.subtitle}
            </div>
            <div
              style={{
                marginTop: 16,
                padding: '8px 12px',
                borderRadius: 20,
                background: colors.surfaceMuted,
                fontSize: 12,
                fontWeight: 600,
                color: area.borderColor,
              }}
            >
              {area.indicador}
            </div>
            <div style={{ marginTop: 20, fontSize: 12, fontWeight: 700, color: colors.primary }}>
              VER ÁREA →
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}