import { useEffect, useState } from 'react';
import { DataList } from '../../../dashboard/components/DataList';
import { getEquipos, getRaices } from '../../../dashboard/services/dashboardApi';
import './Infraestructura.css';

export function InfraestructuraPanel() {
  const [tab, setTab] = useState<'equipos' | 'fallando' | 'padres'>('equipos');
  const [equipos, setEquipos] = useState<any[]>([]);
  const [raices, setRaices] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (tab === 'equipos') loadEquipos();
    if (tab === 'padres') loadRaices();
  }, [tab]);

  const loadEquipos = async () => {
    setLoading(true);
    try { setEquipos(await getEquipos()); } catch {}
    setLoading(false);
  };

  const loadRaices = async () => {
    setLoading(true);
    try { setRaices(await getRaices()); } catch {}
    setLoading(false);
  };

  const fallando = equipos.filter(e => e.estado_equipo === 'fallo');

  return (
    <div className="area-panel">
      <div className="area-options">
        <button className={tab === 'equipos' ? 'active' : ''} onClick={() => setTab('equipos')}>Equipos</button>
        <button className={tab === 'fallando' ? 'active' : ''} onClick={() => setTab('fallando')}>Fallando</button>
        <button className={tab === 'padres' ? 'active' : ''} onClick={() => setTab('padres')}>Equipos Padre</button>
      </div>

      <div className="area-content">
        {loading && <p>Cargando...</p>}
        {!loading && tab === 'equipos' && (
          <DataList
            items={equipos}
            columns={['codigo', 'nombre', 'area', 'estado_equipo']}
            emptyText="Sin equipos"
          />
        )}
        {!loading && tab === 'fallando' && (
          <DataList
            items={fallando}
            columns={['codigo', 'nombre', 'area', 'estado_equipo']}
            emptyText="Sin equipos fallando"
          />
        )}
        {!loading && tab === 'padres' && (
          <DataList
            items={raices}
            columns={['codigo', 'nombre', 'area', 'estado_equipo']}
            emptyText="Sin equipos padre"
          />
        )}
      </div>
    </div>
  );
}