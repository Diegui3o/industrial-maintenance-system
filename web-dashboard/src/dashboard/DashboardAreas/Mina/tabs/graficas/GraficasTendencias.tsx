import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  ResponsiveContainer,
  Legend,
  Tooltip,
} from 'recharts';
import { ChartCard } from '../../components/ChartCard';
import { Insight } from '../../components/Insight';
import { ChartTooltip } from '../../components/ChartTooltip';
import { useGraficasData } from './useGraficasData';
import type { FiltroFecha } from './useGraficasData';

const COLORS = {
  alta: '#B93636',
  teal: '#0D9488',
};

const AXIS = { fontSize: 12, fill: '#8A919F' };

export function GraficasTendencias({ filtro }: { filtro: FiltroFecha }) {
  const { incidentes, requerimientos, loading } = useGraficasData(filtro);

  if (loading) return <p>Cargando...</p>;

  // Agrupar por mes
  const porMes = (data: any[]) => {
    const meses: Record<string, { mes: string; incidentes: number; requerimientos: number }> = {};
    data.forEach((item) => {
      const d = new Date(item.fecha);
      const key = `${d.getFullYear()}-${d.getMonth()}`;
      const nombreMes = d.toLocaleDateString('es-PE', { month: 'short', year: '2-digit' });
      if (!meses[key]) meses[key] = { mes: nombreMes, incidentes: 0, requerimientos: 0 };
    });
    return Object.values(meses).sort((a: any, b: any) => a.mes.localeCompare(b.mes));
  };

  const datosInc = porMes(incidentes);
  const datosReq = porMes(requerimientos);

  const data = datosInc.map((d) => ({
    mes: d.mes,
    incidentes: d.incidentes,
    requerimientos: datosReq.find((r) => r.mes === d.mes)?.requerimientos || 0,
  }));

  // Llenar datos reales
  const dataFinal = data.map((d) => ({
    mes: d.mes,
    incidentes: incidentes.filter((i) => {
      const fecha = new Date(i.fecha);
      return `${fecha.getFullYear()}-${fecha.getMonth()}` === d.mes;
    }).length,
    requerimientos: requerimientos.filter((r) => {
      const fecha = new Date(r.fecha);
      return `${fecha.getFullYear()}-${fecha.getMonth()}` === d.mes;
    }).length,
  }));

  const pico = dataFinal.reduce((a, b) => (b.incidentes > a.incidentes ? b : a), dataFinal[0]);

  return (
    <div style={{ display: 'grid', gap: 20 }}>
      <ChartCard
        title="Evolución mensual de incidentes y requerimientos"
        subtitle="Cómo cambia la carga operativa a lo largo del tiempo"
      >
        <ResponsiveContainer width="100%" height={360}>
          <AreaChart data={dataFinal}>
            <defs>
              <linearGradient id="gInc" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor={COLORS.alta} stopOpacity={0.35} />
                <stop offset="100%" stopColor={COLORS.alta} stopOpacity={0.02} />
              </linearGradient>
              <linearGradient id="gReq" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor={COLORS.teal} stopOpacity={0.35} />
                <stop offset="100%" stopColor={COLORS.teal} stopOpacity={0.02} />
              </linearGradient>
            </defs>
            <CartesianGrid vertical={false} stroke="#E5E7EB" />
            <XAxis dataKey="mes" tick={AXIS} axisLine={false} tickLine={false} />
            <YAxis tick={AXIS} axisLine={false} tickLine={false} />
            <Tooltip content={<ChartTooltip />} />
            <Legend iconType="circle" wrapperStyle={{ fontSize: 12 }} />
            <Area
              type="monotone"
              dataKey="incidentes"
              name="Incidentes"
              stroke={COLORS.alta}
              strokeWidth={2.5}
              fill="url(#gInc)"
            />
            <Area
              type="monotone"
              dataKey="requerimientos"
              name="Requerimientos"
              stroke={COLORS.teal}
              strokeWidth={2.5}
              fill="url(#gReq)"
            />
          </AreaChart>
        </ResponsiveContainer>
        <Insight>
          El pico de actividad se dio en <strong>{pico?.mes}</strong> con {pico?.incidentes} incidentes.
        </Insight>
      </ChartCard>
    </div>
  );
}