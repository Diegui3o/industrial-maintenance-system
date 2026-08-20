import type { FiltroFecha } from './useGraficasData';
import { useGraficasData } from './useGraficasData';
import { ChartCard } from '../../components/ChartCard';
import { KpiCard } from '../../components/KpiCard';
import { Insight } from '../../components/Insight';
import { ChartTooltip } from '../../components/ChartTooltip';
import {
  PieChart,
  Pie,
  Cell,
  ResponsiveContainer,
  Tooltip,
  Legend,
} from 'recharts';

const ALERT_ICON = '⚠️';
const CHECK_ICON = '✅';
const CLIP_ICON = '📋';
const MAP_ICON = '📍';

const COLORS = {
  primary: '#C45A1A',
  blue: '#2563A0',
  green: '#2D7A4C',
  red: '#B93636',
  orange: '#A16207',
  gray: '#6B7280',
  teal: '#0D9488',
};

export function GraficasResumen({ filtro }: { filtro: FiltroFecha }) {
  const { incidentes, requerimientos, loading } = useGraficasData(filtro);

  if (loading) return <p>Cargando...</p>;

  const totalInc = incidentes.length;
  const totalReq = requerimientos.length;
  const resueltosInc = incidentes.filter((i: any) => i.avance === 100).length;
  const pendientesInc = totalInc - resueltosInc;
  const completadosReq = requerimientos.filter((r: any) => r.avance === 100).length;
  const enProcesoReq = requerimientos.filter((r: any) => r.avance > 0 && r.avance < 100).length;
  const pendientesReq = requerimientos.filter((r: any) => r.avance === 0).length;

  // Zona crítica
  const zonasCount: Record<string, number> = {};
  incidentes.forEach((inc: any) => {
    const zona = inc.zona || 'Sin zona';
    zonasCount[zona] = (zonasCount[zona] || 0) + 1;
  });
  const zonaCritica = Object.entries(zonasCount).sort((a, b) => b[1] - a[1])[0];
  const zonaNombre: string = zonaCritica ? zonaCritica[0] : '—';
  const zonaCantidad: number = zonaCritica ? zonaCritica[1] : 0;

  // Incidentes por sistema (para donut)
  const porSistema: Record<string, number> = {};
  incidentes.forEach((inc: any) => {
    const sistema = inc.sistema || 'Sin sistema';
    porSistema[sistema] = (porSistema[sistema] || 0) + 1;
  });
  const dataSistema = Object.entries(porSistema)
    .map(([name, value]) => ({ name, value }))
    .sort((a, b) => b.value - a.value);

  // Estado de requerimientos (para donut)
  const dataEstadoReq = [
    { name: 'Completados', value: completadosReq, color: COLORS.green },
    { name: 'En proceso', value: enProcesoReq, color: COLORS.orange },
    { name: 'Pendientes', value: pendientesReq, color: COLORS.red },
  ];

  // Insights clave
  const pctResueltosInc = totalInc > 0 ? Math.round((resueltosInc / totalInc) * 100) : 0;
  const pctCompletadosReq = totalReq > 0 ? Math.round((completadosReq / totalReq) * 100) : 0;
  const topSistema = dataSistema[0];
  const pctTopSistema = totalInc > 0 && topSistema ? Math.round((topSistema.value / totalInc) * 100) : 0;

  return (
    <div>
      {/* KPIs */}
      <div className="kpi-grid">
        <KpiCard label="Incidentes" value={totalInc} tone="primary" icon={ALERT_ICON} hint="Fallas reportadas" />
        <KpiCard label="Requerimientos" value={totalReq} icon={CLIP_ICON} hint="Solicitudes de trabajo" />
        <KpiCard label="Incidentes resueltos" value={resueltosInc} tone="success" icon={CHECK_ICON} hint={`${pctResueltosInc}% del total`} />
        <KpiCard label="Pendientes" value={pendientesInc} tone="warning" icon={CLIP_ICON} hint="Por atender" />
        <KpiCard label="Zona crítica" value={zonaCantidad} suffix={zonaNombre} icon={MAP_ICON} hint="Con más incidentes" />
      </div>

      {/* Dos gráficas en paralelo */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: 20 }}>
        <ChartCard title="Incidentes por sistema" subtitle="Distribución proporcional de fallas">
          <ResponsiveContainer width="100%" height={280}>
            <PieChart>
              <Pie
                data={dataSistema}
                dataKey="value"
                nameKey="name"
                innerRadius={60}
                outerRadius={100}
                paddingAngle={2}
              >
                {dataSistema.map((_, index) => (
                  <Cell key={index} fill={Object.values(COLORS)[index % Object.values(COLORS).length]} />
                ))}
              </Pie>
              <Tooltip content={<ChartTooltip unidad=" incid." />} />
              <Legend iconType="circle" wrapperStyle={{ fontSize: 12 }} />
            </PieChart>
          </ResponsiveContainer>
          {topSistema && (
            <Insight>
              El sistema <strong>{topSistema.name}</strong> representa el {pctTopSistema}% de las fallas.
            </Insight>
          )}
        </ChartCard>

        <ChartCard title="Estado de requerimientos" subtitle="Avance de atención de solicitudes">
          <ResponsiveContainer width="100%" height={280}>
            <PieChart>
              <Pie
                data={dataEstadoReq}
                dataKey="value"
                nameKey="name"
                innerRadius={60}
                outerRadius={100}
                paddingAngle={2}
              >
                {dataEstadoReq.map((entry, index) => (
                  <Cell key={index} fill={entry.color} />
                ))}
              </Pie>
              <Tooltip content={<ChartTooltip unidad=" req." />} />
              <Legend iconType="circle" wrapperStyle={{ fontSize: 12 }} />
            </PieChart>
          </ResponsiveContainer>
          <Insight>
            {pctCompletadosReq}% de requerimientos completados · {pendientesReq} pendientes.
          </Insight>
        </ChartCard>
      </div>

      {/* Insights clave */}
      <div style={{ marginTop: 20, display: 'grid', gap: 12 }}>
        <div style={{ fontSize: 13, fontWeight: 800, letterSpacing: 2, textTransform: 'uppercase', color: '#8A919F' }}>
          Resumen rápido
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: 12 }}>
          <Insight>
            <strong>{zonaNombre}</strong> es la zona más crítica con {zonaCantidad} incidentes.
          </Insight>
          <Insight>
            <strong>{resueltosInc}</strong> incidentes resueltos de {totalInc} ({pctResueltosInc}%).
          </Insight>
          <Insight>
            <strong>{pendientesReq}</strong> requerimientos pendientes por gestionar.
          </Insight>
          <Insight>
            <strong>{topSistema?.name}</strong> lidera la carga de fallas con {topSistema?.value} casos.
          </Insight>
        </div>
      </div>
    </div>
  );
}