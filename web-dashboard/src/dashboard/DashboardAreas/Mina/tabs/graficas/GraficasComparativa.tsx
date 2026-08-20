import {
  BarChart,
  Bar,
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

const AXIS = { fontSize: 12, fill: '#8A919F' };

export function GraficasComparativa({ filtro }: { filtro: FiltroFecha }) {
  const { incidentes, requerimientos, loading } = useGraficasData(filtro);

  if (loading) return <p>Cargando...</p>;

  const zonas = new Set([
    ...incidentes.map((i) => i.zona || 'Sin zona'),
    ...requerimientos.map((r) => r.zona || 'Sin zona'),
  ]);

  const data = Array.from(zonas).map((zona) => ({
    zona,
    incidentes: incidentes.filter((i) => (i.zona || 'Sin zona') === zona).length,
    requerimientos: requerimientos.filter((r) => (r.zona || 'Sin zona') === zona).length,
  }));

  return (
    <div style={{ display: 'grid', gap: 20 }}>
      <ChartCard
        title="Incidentes vs requerimientos por zona"
        subtitle="Comparación directa de la carga operativa en cada sector"
      >
        <ResponsiveContainer width="100%" height={360}>
          <BarChart data={data}>
            <CartesianGrid vertical={false} stroke="#E5E7EB" />
            <XAxis dataKey="zona" tick={AXIS} axisLine={false} tickLine={false} />
            <YAxis tick={AXIS} axisLine={false} tickLine={false} />
            <Tooltip content={<ChartTooltip />} cursor={{ fill: '#F3F4F6' }} />
            <Legend iconType="circle" wrapperStyle={{ fontSize: 12 }} />
            <Bar dataKey="incidentes" name="Incidentes" fill="#B93636" radius={[4, 4, 0, 0]} />
            <Bar dataKey="requerimientos" name="Requerimientos" fill="#0D9488" radius={[4, 4, 0, 0]} />
          </BarChart>
        </ResponsiveContainer>
        <Insight>
          En casi todas las zonas hay más incidentes que requerimientos.
        </Insight>
      </ChartCard>
    </div>
  );
}