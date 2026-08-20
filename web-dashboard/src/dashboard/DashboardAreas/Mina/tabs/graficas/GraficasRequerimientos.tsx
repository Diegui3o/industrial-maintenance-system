import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Cell,
  PieChart,
  Pie,
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
  teal: '#0D9488',
  primary: '#C45A1A',
  green: '#2D7A4C',
  orange: '#A16207',
  red: '#B93636',
  blue: '#2563A0',
};

const AXIS = { fontSize: 12, fill: '#8A919F' };

export function GraficasRequerimientos({ filtro }: { filtro: FiltroFecha }) {
  const { requerimientos, loading } = useGraficasData(filtro);

  if (loading) return <p>Cargando...</p>;

  const total = requerimientos.length;

  const porTipo: Record<string, number> = {};
  requerimientos.forEach((req: any) => {
    const tipo = req.tipo_de_requerimiento || 'Sin tipo';
    porTipo[tipo] = (porTipo[tipo] || 0) + 1;
  });
  const dataTipo = Object.entries(porTipo).map(([nombre, cantidad]) => ({ nombre, cantidad }));

  const completados = requerimientos.filter((r: any) => r.avance === 100).length;
  const enProceso = requerimientos.filter((r: any) => r.avance > 0 && r.avance < 100).length;
  const pendientes = requerimientos.filter((r: any) => r.avance === 0).length;

  const dataEstado = [
    { nombre: 'Completados', cantidad: completados, color: COLORS.green },
    { nombre: 'En proceso', cantidad: enProceso, color: COLORS.orange },
    { nombre: 'Pendientes', cantidad: pendientes, color: COLORS.red },
  ];

  const porPrioridad: Record<string, number> = {};
  requerimientos.forEach((req: any) => {
    const p = req.prioridad || 'Sin prioridad';
    porPrioridad[p] = (porPrioridad[p] || 0) + 1;
  });
  const dataPrioridad = Object.entries(porPrioridad).map(([nombre, cantidad]) => ({ nombre, cantidad }));

  const pctCompletados = total > 0 ? Math.round((completados / total) * 100) : 0;
  const altaCantidad = dataPrioridad.find((p) => p.nombre === 'Alta')?.cantidad || 0;

  return (
    <div style={{ display: 'grid', gap: 20 }}>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: 20 }}>
        <ChartCard title="Requerimientos por tipo" subtitle="Naturaleza de las solicitudes">
          <ResponsiveContainer width="100%" height={280}>
            <BarChart data={dataTipo} layout="vertical" margin={{ left: 8, right: 24 }}>
              <CartesianGrid horizontal={false} stroke="#E5E7EB" />
              <XAxis type="number" tick={AXIS} axisLine={false} tickLine={false} />
              <YAxis type="category" dataKey="nombre" tick={AXIS} width={150} axisLine={false} tickLine={false} />
              <Tooltip content={<ChartTooltip unidad=" req." />} cursor={{ fill: '#F3F4F6' }} />
              <Bar dataKey="cantidad" name="Requerimientos" fill={COLORS.teal} radius={[0, 4, 4, 0]} />
            </BarChart>
          </ResponsiveContainer>
          <Insight>
            <strong>{dataTipo[0]?.nombre}</strong> es el tipo más solicitado.
          </Insight>
        </ChartCard>

        <ChartCard title="Estado de los requerimientos" subtitle="Avance general de atención">
          <ResponsiveContainer width="100%" height={280}>
            <PieChart>
              <Pie
                data={dataEstado}
                dataKey="cantidad"
                nameKey="nombre"
                innerRadius={60}
                outerRadius={100}
                paddingAngle={2}
              >
                {dataEstado.map((e, i) => (
                  <Cell key={i} fill={e.color} />
                ))}
              </Pie>
              <Tooltip content={<ChartTooltip unidad=" req." />} />
              <Legend iconType="circle" wrapperStyle={{ fontSize: 12 }} />
            </PieChart>
          </ResponsiveContainer>
          <Insight>
            El {pctCompletados}% ya está <strong>completado</strong>.
          </Insight>
        </ChartCard>
      </div>

      <ChartCard title="Requerimientos por prioridad" subtitle="Distribución de criticidad">
        <ResponsiveContainer width="100%" height={260}>
          <BarChart data={dataPrioridad}>
            <CartesianGrid vertical={false} stroke="#E5E7EB" />
            <XAxis dataKey="nombre" tick={AXIS} axisLine={false} tickLine={false} />
            <YAxis tick={AXIS} axisLine={false} tickLine={false} />
            <Tooltip content={<ChartTooltip unidad=" req." />} cursor={{ fill: '#F3F4F6' }} />
            <Bar dataKey="cantidad" name="Requerimientos" radius={[4, 4, 0, 0]}>
              {dataPrioridad.map((p, i) => (
                <Cell key={i} fill={p.nombre === 'Alta' ? COLORS.red : p.nombre === 'Media' ? COLORS.orange : COLORS.blue} />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
        <Insight>
          Hay {altaCantidad} requerimientos de prioridad alta.
        </Insight>
      </ChartCard>
    </div>
  );
}