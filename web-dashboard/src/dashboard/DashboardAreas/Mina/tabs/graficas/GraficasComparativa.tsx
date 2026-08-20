import { useGraficasData, type FiltroFecha } from './useGraficasData';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';

export function GraficasComparativa({ filtro }: { filtro: FiltroFecha }) {
  const { incidentes, requerimientos, loading } = useGraficasData(filtro);

  if (loading) return <p>Cargando...</p>;

  const data = [
    { name: 'Completados', incidentes: incidentes.filter(i => i.avance === 100).length, requerimientos: requerimientos.filter(r => r.avance === 100).length },
    { name: 'En Proceso', incidentes: incidentes.filter(i => i.avance > 0 && i.avance < 100).length, requerimientos: requerimientos.filter(r => r.avance > 0 && r.avance < 100).length },
    { name: 'Pendientes', incidentes: incidentes.filter(i => i.avance === 0).length, requerimientos: requerimientos.filter(r => r.avance === 0).length },
  ];

  return (
    <div className="grafica-card">
      <h3>Comparativa Incidentes vs Requerimientos</h3>
      <ResponsiveContainer width="100%" height={400}>
        <BarChart data={data}>
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis dataKey="name" />
          <YAxis />
          <Tooltip />
          <Legend />
          <Bar dataKey="incidentes" fill="#C45A1A" radius={[4, 4, 0, 0]} />
          <Bar dataKey="requerimientos" fill="#2563A0" radius={[4, 4, 0, 0]} />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}