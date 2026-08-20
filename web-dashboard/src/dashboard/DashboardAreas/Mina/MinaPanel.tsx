import { useEffect, useState } from 'react';
import { DataList } from '../../../dashboard/components/DataList';
import { getIncidentes, getEquipos } from '../../../dashboard/services/dashboardApi';
import './Mina.css';

export function MinaPanel() {
  const [tab, setTab] = useState<'incidentes' | 'requerimientos' | 'graficas' | 'equipos'>('incidentes');
  const [incidentes, setIncidentes] = useState<any[]>([]);
  const [equipos, setEquipos] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (tab === 'incidentes') loadIncidentes();
    if (tab === 'equipos') loadEquipos();
  }, [tab]);

  const loadIncidentes = async () => {
    setLoading(true);
    try { setIncidentes(await getIncidentes()); } catch {}
    setLoading(false);
  };

  const loadEquipos = async () => {
    setLoading(true);
    try { setEquipos(await getEquipos()); } catch {}
    setLoading(false);
  };

  return (
    <div className="area-panel">
      <div className="area-options">
        <button className={tab === 'incidentes' ? 'active' : ''} onClick={() => setTab('incidentes')}>Incidentes</button>
        <button className={tab === 'requerimientos' ? 'active' : ''} onClick={() => setTab('requerimientos')}>Requerimientos</button>
        <button className={tab === 'graficas' ? 'active' : ''} onClick={() => setTab('graficas')}>Gráficas</button>
        <button className={tab === 'equipos' ? 'active' : ''} onClick={() => setTab('equipos')}>Equipos Mina</button>
      </div>

      <div className="area-content">
        {loading && <p>Cargando...</p>}
        {!loading && tab === 'incidentes' && (
          <DataList
            items={incidentes}
            columns={['id_numerico', 'fecha', 'tipo_de_incidente', 'sistema', 'avance']}
            emptyText="Sin incidentes"
          />
        )}
        {!loading && tab === 'equipos' && (
          <DataList
            items={equipos}
            columns={['codigo', 'nombre', 'area', 'estado_equipo']}
            emptyText="Sin equipos"
          />
        )}
        {tab === 'requerimientos' && <p>Requerimientos próximamente</p>}
        {tab === 'graficas' && <p>Gráficas próximamente</p>}
      </div>
    </div>
  );
}