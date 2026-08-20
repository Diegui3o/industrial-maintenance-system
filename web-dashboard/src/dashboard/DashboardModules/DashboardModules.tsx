import { colors } from '../../theme/colors';
import './DashboardModules.css';

interface DashboardModulesProps {
  onNavigate: (page: string) => void;
}

const icons: Record<string, string> = {
  equipos: '🏭',
  alarmas: '🚨',
  notificaciones: '💬',
  mantenimiento: '🔧',
  metricas: '📊',
  conexiones: '🌐',
  auditoria: '📋',
  diagnostico: '🩺',
};

export function DashboardModules({ onNavigate }: DashboardModulesProps) {
  const modules = [
    { id: 'equipos', title: 'Equipos', description: 'Inventario y estado', color: '#C45A1A' },
    { id: 'alarmas', title: 'Alarmas', description: 'Alarmas activas', color: '#B93636' },
    { id: 'notificaciones', title: 'WhatsApp', description: 'Notificaciones y grupos', color: '#25D366' },
    { id: 'mantenimiento', title: 'Mantenimiento', description: 'Órdenes y trabajos', color: '#A16207' },
    { id: 'metricas', title: 'Sensores', description: 'Lecturas y monitoreo', color: '#2563A0' },
    { id: 'conexiones', title: 'Conexiones', description: 'Conectividad', color: '#6B7280' },
    { id: 'auditoria', title: 'Auditoría', description: 'Registro de actividad', color: '#4B5563' },
    { id: 'diagnostico', title: 'Diagnóstico', description: 'Estado del sistema', color: '#7C3AED' },
  ];

  return (
    <section style={{ marginBottom: 32 }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 18 }}>
        <div style={{ width: 3, height: 18, background: colors.primary, borderRadius: 4 }} />
        <h2 style={{ fontSize: 13, fontWeight: 800, letterSpacing: 2, textTransform: 'uppercase', color: colors.text.muted }}>
          Módulos
        </h2>
      </div>

      <div className="modules-grid-new">
        {modules.map((mod) => (
          <div
            key={mod.id}
            className="module-card-new"
            onClick={() => onNavigate(mod.id)}
            style={{
              '--module-accent': mod.color,
            } as React.CSSProperties}
          >
            <div className="module-icon">{icons[mod.id]}</div>
            <div className="module-info">
              <div className="module-title">{mod.title}</div>
              <div className="module-desc">{mod.description}</div>
            </div>
            <div className="module-arrow">→</div>
            <div className="module-bar" />
          </div>
        ))}
      </div>
    </section>
  );
}