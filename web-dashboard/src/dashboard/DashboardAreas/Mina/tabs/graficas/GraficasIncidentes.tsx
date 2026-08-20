import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Cell,
  ResponsiveContainer,
  Tooltip,
} from 'recharts';
import { ChartCard } from '../../components/ChartCard';
import { Insight } from '../../components/Insight';
import { ChartTooltip } from '../../components/ChartTooltip';
import { useGraficasData } from './useGraficasData';
import type { FiltroFecha } from './useGraficasData';

const COLORS = {
  alta: '#B93636',
  slate: '#6B7280',
  teal: '#0D9488',
  primary: '#C45A1A',
  neutral: '#6B7280',
};

const AXIS = { fontSize: 12, fill: '#8A919F' };

export function GraficasIncidentes({ filtro }: { filtro: FiltroFecha }) {
  const { incidentes, loading } = useGraficasData(filtro);

  if (loading) return <p>Cargando...</p>;

  const total = incidentes.length;

  // Por zona
  const porZona: Record<string, number> = {};
  incidentes.forEach((inc: any) => {
    const zona = inc.zona || 'Sin zona';
    porZona[zona] = (porZona[zona] || 0) + 1;
  });
  const dataZona = Object.entries(porZona)
    .map(([nombre, cantidad]) => ({ nombre, cantidad }))
    .sort((a, b) => b.cantidad - a.cantidad);

  // Por responsable
  const porResponsable: Record<string, number> = {};
  incidentes.forEach((inc: any) => {
    const responsable = inc.responsable || 'Sin asignar';
    porResponsable[responsable] = (porResponsable[responsable] || 0) + 1;
  });
  const dataResponsable = Object.entries(porResponsable)
    .map(([nombre, cantidad]) => ({ nombre, cantidad }))
    .sort((a, b) => b.cantidad - a.cantidad);

  // Por tipo
  const porTipo: Record<string, number> = {};
  incidentes.forEach((inc: any) => {
    const tipo = inc.tipo_de_incidente || 'Otros';
    porTipo[tipo] = (porTipo[tipo] || 0) + 1;
  });
  const dataTipo = Object.entries(porTipo)
    .map(([nombre, cantidad]) => ({ nombre, cantidad }))
    .sort((a, b) => b.cantidad - a.cantidad);

  const zonaTop = dataZona[0] || { nombre: '—', cantidad: 0 };
  const pctZona = total > 0 ? Math.round((zonaTop.cantidad / total) * 100) : 0;

  return (
    <div style={{ display: 'grid', gap: 20 }}>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: 20 }}>
        <ChartCard title="Incidentes por zona" subtitle="Sectores con más fallas reportadas">
          <ResponsiveContainer width="100%" height={280}>
            <BarChart data={dataZona}>
              <CartesianGrid vertical={false} stroke="#E5E7EB" />
              <XAxis dataKey="nombre" tick={AXIS} axisLine={false} tickLine={false} />
              <YAxis tick={AXIS} axisLine={false} tickLine={false} />
              <Tooltip content={<ChartTooltip unidad=" incid." />} cursor={{ fill: '#F3F4F6' }} />
              <Bar dataKey="cantidad" name="Incidentes" radius={[4, 4, 0, 0]}>
                {dataZona.map((_, i) => (
                  <Cell key={i} fill={i === 0 ? COLORS.alta : COLORS.slate} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
            <Insight>
              La zona <strong>{zonaTop?.nombre}</strong> concentra el {pctZona}% de incidentes.
            </Insight>
        </ChartCard>

        <ChartCard title="Carga por responsable" subtitle="Incidentes atendidos por técnico">
          <ResponsiveContainer width="100%" height={280}>
            <BarChart data={dataResponsable} layout="vertical" margin={{ left: 8, right: 24 }}>
              <CartesianGrid horizontal={false} stroke="#E5E7EB" />
              <XAxis type="number" tick={AXIS} axisLine={false} tickLine={false} />
              <YAxis type="category" dataKey="nombre" tick={AXIS} width={120} axisLine={false} tickLine={false} />
              <Tooltip content={<ChartTooltip unidad=" incid." />} cursor={{ fill: '#F3F4F6' }} />
              <Bar dataKey="cantidad" name="Incidentes" fill={COLORS.teal} radius={[0, 4, 4, 0]} />
            </BarChart>
          </ResponsiveContainer>
          <Insight>
            {dataResponsable[0]?.nombre} lidera con {dataResponsable[0]?.cantidad} atenciones.
          </Insight>
        </ChartCard>
      </div>

      <ChartCard title="Tipos de incidente más frecuentes" subtitle="Fallas repetitivas del sistema">
        <ResponsiveContainer width="100%" height={300}>
          <BarChart data={dataTipo} layout="vertical" margin={{ left: 8, right: 24 }}>
            <CartesianGrid horizontal={false} stroke="#E5E7EB" />
            <XAxis type="number" tick={AXIS} axisLine={false} tickLine={false} />
            <YAxis type="category" dataKey="nombre" tick={AXIS} width={180} axisLine={false} tickLine={false} />
            <Tooltip content={<ChartTooltip unidad=" incid." />} cursor={{ fill: '#F3F4F6' }} />
            <Bar dataKey="cantidad" name="Incidentes" radius={[0, 4, 4, 0]}>
              {dataTipo.map((t, i) => (
                <Cell key={i} fill={t.nombre === 'Otros' ? COLORS.neutral : COLORS.primary} />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
        <Insight>
          Los tipos más comunes son <strong>{dataTipo[0]?.nombre}</strong> y <strong>{dataTipo[1]?.nombre}</strong>.
        </Insight>
      </ChartCard>
    </div>
  );
}