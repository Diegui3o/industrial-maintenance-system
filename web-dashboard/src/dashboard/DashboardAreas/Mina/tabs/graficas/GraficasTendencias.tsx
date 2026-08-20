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

  // ====================================================
  // AGRUPACIÓN POR DÍA CON ORDEN CORRECTO
  // ====================================================
  const dias: Record<string, { key: string; fecha: string; incidentes: number; requerimientos: number }> = {};

  const keyDeFecha = (fecha: string) => {
    const d = new Date(fecha);
    const yyyy = d.getFullYear();
    const mm = String(d.getMonth() + 1).padStart(2, '0');
    const dd = String(d.getDate()).padStart(2, '0');
    return `${yyyy}-${mm}-${dd}`;
  };

  const etiquetaFecha = (fecha: string) => {
    const d = new Date(fecha);
    return d.toLocaleDateString('es-PE', { day: '2-digit', month: 'short' });
  };

  incidentes.forEach((inc: any) => {
    const key = keyDeFecha(inc.fecha);
    const label = etiquetaFecha(inc.fecha);
    if (!dias[key]) {
      dias[key] = { key, fecha: label, incidentes: 0, requerimientos: 0 };
    }
    dias[key].incidentes += 1;
  });

  requerimientos.forEach((req: any) => {
    const key = keyDeFecha(req.fecha);
    const label = etiquetaFecha(req.fecha);
    if (!dias[key]) {
      dias[key] = { key, fecha: label, incidentes: 0, requerimientos: 0 };
    }
    dias[key].requerimientos += 1;
  });

  // Ordenar por clave ISO (YYYY-MM-DD) de forma ascendente
  const dataFinal = Object.values(dias).sort((a, b) => a.key.localeCompare(b.key));

  const pico = dataFinal.reduce(
    (max, item) => (item.incidentes > max.incidentes ? item : max),
    dataFinal[0] || { fecha: '—', incidentes: 0 }
  );

  return (
    <div style={{ display: 'grid', gap: 20 }}>
      <ChartCard
        title="Evolución diaria de incidentes y requerimientos"
        subtitle="Carga operativa día a día (orden cronológico)"
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
            <XAxis
              dataKey="fecha"
              tick={AXIS}
              axisLine={false}
              tickLine={false}
              interval="preserveStartEnd"
              minTickGap={30}
            />
            <YAxis tick={AXIS} axisLine={false} tickLine={false} allowDecimals={false} />
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
          El pico de actividad se dio el <strong>{pico?.fecha}</strong> con {pico?.incidentes} incidentes.
        </Insight>
      </ChartCard>
    </div>
  );
}