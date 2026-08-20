import { useEffect, useState } from 'react';
import { DataList } from '../../../dashboard/components/DataList';
import { getMantenimientos, getEquipos } from '../../../dashboard/services/dashboardApi';
import './Planta.css';

export function PlantaPanel() {
  const [tab, setTab] = useState<'mantenimientos' | 'sensores' | 'equipos'>('mantenimientos');
  const [mantenimientos, setMantenimientos] = useState<any[]>([]);
  const [equipos, setEquipos] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (tab === 'mantenimientos') loadMantenimientos();
    if (tab === 'equipos') loadEquipos();
  }, [tab]);

  const loadMantenimientos = async () => {
    setLoading(true);
    try { setMantenimientos(await getMantenimientos()); } catch {}
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
        <button className={tab === 'mantenimientos' ? 'active' : ''} onClick={() => setTab('mantenimientos')}>Mantenimientos</button>
        <button className={tab === 'sensores' ? 'active' : ''} onClick={() => setTab('sensores')}>Sensores</button>
        <button className={tab === 'equipos' ? 'active' : ''} onClick={() => setTab('equipos')}>Equipos Planta</button>
      </div>

      <div className="area-content">
        {loading && <p>Cargando...</p>}
        {!loading && tab === 'mantenimientos' && (
          <DataList
            items={mantenimientos}
            columns={['id', 'equipo_id', 'tipo_intervencion', 'sistema', 'estado_falla']}
            emptyText="Sin mantenimientos"
          />
        )}
        {!loading && tab === 'equipos' && (
          <DataList
            items={equipos}
            columns={['codigo', 'nombre', 'area', 'estado_equipo']}
            emptyText="Sin equipos"
          />
        )}
        {tab === 'sensores' && <p>Sensores próximamente</p>}
      </div>
    </div>
  );
}