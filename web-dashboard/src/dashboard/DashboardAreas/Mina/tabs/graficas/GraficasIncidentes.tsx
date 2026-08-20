import { useGraficasData, type FiltroFecha } from './useGraficasData';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

export function GraficasIncidentes({ filtro }: { filtro: FiltroFecha }) {
  const { incidentes, loading } = useGraficasData(filtro);

  if (loading) return <p>Cargando...</p>;

  // Agrupar por sistema
  const porSistema = incidentes.reduce((acc: any, inc) => {
    const sistema = inc.sistema || 'Sin sistema';
    acc[sistema] = (acc[sistema] || 0) + 1;
    return acc;
  }, {});

  const data = Object.entries(porSistema).map(([name, value]) => ({ name, value }));
  data.sort((a: any, b: any) => b.value - a.value);

  return (
    <div className="grafica-card">
      <h3>Incidentes por Sistema</h3>
      <ResponsiveContainer width="100%" height={400}>
        <BarChart data={data} layout="vertical" margin={{ left: 40 }}>
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis type="number" />
          <YAxis type="category" dataKey="name" width={180} />
          <Tooltip />
          <Bar dataKey="value" fill="#C45A1A" radius={[0, 4, 4, 0]} />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}