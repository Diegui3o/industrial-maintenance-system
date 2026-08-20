import { useGraficasData, type FiltroFecha } from './useGraficasData';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

export function GraficasRequerimientos({ filtro }: { filtro: FiltroFecha }) {
  const { requerimientos, loading } = useGraficasData(filtro);

  if (loading) return <p>Cargando...</p>;

  // Promedio de avance por tipo
  const porTipo = requerimientos.reduce((acc: any, req) => {
    const tipo = req.tipo_de_requerimiento || 'Sin tipo';
    if (!acc[tipo]) acc[tipo] = { total: 0, count: 0 };
    acc[tipo].total += req.avance || 0;
    acc[tipo].count++;
    return acc;
  }, {});

  const data = Object.entries(porTipo).map(([name, val]: any) => ({
    name,
    avancePromedio: Math.round(val.total / val.count),
    cantidad: val.count,
  }));

  return (
    <div className="grafica-card">
      <h3>Avance Promedio por Tipo de Requerimiento</h3>
      <ResponsiveContainer width="100%" height={400}>
        <BarChart data={data}>
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis dataKey="name" />
          <YAxis domain={[0, 100]} />
          <Tooltip />
          <Bar dataKey="avancePromedio" fill="#2563A0" radius={[4, 4, 0, 0]} />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}