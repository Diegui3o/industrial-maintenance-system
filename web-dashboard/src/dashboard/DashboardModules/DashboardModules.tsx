import './DashboardModules.css';
import { ModuleCard } from './ModuleCard';

interface DashboardModulesProps {
  onNavigate: (page: string) => void;
}

export function DashboardModules({ onNavigate }: DashboardModulesProps) {
  const modules = [
    { id: 'equipos', title: 'EQUIPOS', description: 'Inventario y estado' },
    { id: 'alarmas', title: 'ALARMAS', description: 'Alarmas activas' },
    { id: 'notificaciones', title: 'WHATSAPP', description: 'Notificaciones y grupos' },
    { id: 'mantenimiento', title: 'MANTENIMIENTO', description: 'Órdenes y trabajos' },
    { id: 'metricas', title: 'SENSORES', description: 'Lecturas y monitoreo' },
    { id: 'conexiones', title: 'CONEXIONES', description: 'Conectividad' },
    { id: 'auditoria', title: 'AUDITORÍA', description: 'Registro de actividad' },
    { id: 'diagnostico', title: 'DIAGNÓSTICO', description: 'Estado del sistema' },
  ];

  return (
    <section className="dashboard-modules">
      <div className="dashboard-section-header">
        <div className="dashboard-section-title">MÓDULOS</div>
      </div>
      <div className="modules-grid">
        {modules.map((mod) => (
          <ModuleCard
            key={mod.id}
            title={mod.title}
            description={mod.description}
            onClick={() => onNavigate(mod.id)}
          />
        ))}
      </div>
    </section>
  );
}