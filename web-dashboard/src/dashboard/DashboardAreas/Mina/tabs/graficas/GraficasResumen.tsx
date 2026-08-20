import { useGraficasData, type FiltroFecha } from './useGraficasData';
import { PieChart, Pie, Cell, ResponsiveContainer, Legend, Tooltip } from 'recharts';

const COLORS = ['#C45A1A', '#2563A0', '#2D7A4C', '#B93636', '#A16207'];

export function GraficasResumen({ filtro }: { filtro: FiltroFecha }) {
  const { incidentes, requerimientos, loading } = useGraficasData(filtro);

  if (loading) return <p>Cargando gráficas...</p>;

  const totalInc = incidentes.length;
  const totalReq = requerimientos.length;
  const completadosInc = incidentes.filter(i => i.avance === 100).length;
  const completadosReq = requerimientos.filter(r => r.avance === 100).length;
  const pendientesInc = totalInc - completadosInc;
  const pendientesReq = totalReq - completadosReq;

  const dataPie = [
    { name: 'Incidentes Completados', value: completadosInc },
    { name: 'Incidentes Pendientes', value: pendientesInc },
    { name: 'Req. Completados', value: completadosReq },
    { name: 'Req. Pendientes', value: pendientesReq },
  ];

  return (
    <div className="graficas-grid">
      <div className="kpi-row">
        <div className="kpi-card">
          <div className="kpi-label">Total Incidentes</div>
          <div className="kpi-value">{totalInc}</div>
        </div>
        <div className="kpi-card">
          <div className="kpi-label">Total Requerimientos</div>
          <div className="kpi-value">{totalReq}</div>
        </div>
        <div className="kpi-card">
          <div className="kpi-label">Completados</div>
          <div className="kpi-value" style={{ color: '#2D7A4C' }}>{completadosInc + completadosReq}</div>
        </div>
        <div className="kpi-card">
          <div className="kpi-label">Pendientes</div>
          <div className="kpi-value" style={{ color: '#B93636' }}>{pendientesInc + pendientesReq}</div>
        </div>
      </div>

      <div className="grafica-card">
        <h3>Distribución General</h3>
        <ResponsiveContainer width="100%" height={300}>
          <PieChart>
            <Pie data={dataPie} dataKey="value" nameKey="name" cx="50%" cy="50%" outerRadius={100} label>
              {dataPie.map((_, index) => (
                <Cell key={index} fill={COLORS[index % COLORS.length]} />
              ))}
            </Pie>
            <Tooltip />
            <Legend />
          </PieChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}