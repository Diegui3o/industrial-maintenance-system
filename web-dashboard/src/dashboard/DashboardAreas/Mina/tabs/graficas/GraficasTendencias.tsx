import { useGraficasData, type FiltroFecha } from './useGraficasData';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

export function GraficasTendencias({ filtro }: { filtro: FiltroFecha }) {
  const { incidentes, loading } = useGraficasData(filtro);

  if (loading) return <p>Cargando...</p>;

  // Agrupar por fecha
  const porFecha = (data: any[]) => {
    const acc: any = {};
    data.forEach(item => {
      const fecha = new Date(item.fecha).toLocaleDateString('es-PE');
      acc[fecha] = (acc[fecha] || 0) + 1;
    });
    return Object.entries(acc).map(([fecha, cantidad]) => ({ fecha, cantidad }));
  };

  const dataInc = porFecha(incidentes).sort((a: any, b: any) => new Date(a.fecha).getTime() - new Date(b.fecha).getTime());

  return (
    <div className="grafica-card">
      <h3>Tendencia en el Tiempo</h3>
      <ResponsiveContainer width="100%" height={400}>
        <LineChart data={dataInc}>
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis dataKey="fecha" />
          <YAxis />
          <Tooltip />
          <Line type="monotone" dataKey="cantidad" stroke="#C45A1A" strokeWidth={2} dot={{ r: 3 }} />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}