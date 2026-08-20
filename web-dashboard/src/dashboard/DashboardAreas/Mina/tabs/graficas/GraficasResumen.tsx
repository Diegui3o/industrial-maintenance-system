import type { FiltroFecha } from './useGraficasData';
import { useGraficasData } from './useGraficasData';
import { ChartCard } from '../../components/ChartCard';
import { KpiCard } from '../../components/KpiCard';

const ALERT_ICON = '⚠️';
const CHECK_ICON = '✅';
const CLIP_ICON = '📋';
const MAP_ICON = '📍';

export function GraficasResumen({ filtro }: { filtro: FiltroFecha }) {
  const { incidentes, requerimientos, loading } = useGraficasData(filtro);

  if (loading) return <p>Cargando...</p>;

  const totalInc = incidentes.length;
  const totalReq = requerimientos.length;
  const resueltosInc = incidentes.filter((i: any) => i.avance === 100).length;
  const pendientesInc = totalInc - resueltosInc;

  // Calcular zona crítica
  const zonasCount: Record<string, number> = {};
  incidentes.forEach((inc: any) => {
    const zona = inc.zona || 'Sin zona';
    zonasCount[zona] = (zonasCount[zona] || 0) + 1;
  });

  const zonaCritica = Object.entries(zonasCount).sort((a, b) => b[1] - a[1])[0];
  const zonaNombre: string = zonaCritica ? zonaCritica[0] : '—';
  const zonaCantidad: number = zonaCritica ? zonaCritica[1] : 0;

  return (
    <div>
      <div className="kpi-grid">
        <KpiCard label="Incidentes" value={totalInc} tone="primary" icon={ALERT_ICON} hint="Fallas reportadas" />
        <KpiCard label="Requerimientos" value={totalReq} icon={CLIP_ICON} hint="Solicitudes de trabajo" />
        <KpiCard label="Resueltos" value={resueltosInc} tone="success" icon={CHECK_ICON} hint={`${totalInc - pendientesInc} cerrados`} />
        <KpiCard label="Pendientes" value={pendientesInc} tone="warning" icon={CLIP_ICON} hint="Por atender" />
        <KpiCard label="Zona crítica" value={zonaCantidad} suffix={zonaNombre} icon={MAP_ICON} hint="Con más incidentes" />
      </div>

      <ChartCard title="Distribución por sistema" subtitle="Incidencia proporcional por sistema de comunicación">
        <p>Gráfica donut próximamente</p>
      </ChartCard>
    </div>
  );
}