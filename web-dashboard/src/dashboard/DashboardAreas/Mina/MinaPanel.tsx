import { useState } from 'react';
import { DashboardHeader } from '../../DashboardHeader/DashboardHeader';
import { IncidentesTab } from './tabs/IncidentesTab';
import { RequerimientosTab } from './tabs/RequerimientosTab';
import { GraficasTab } from './tabs/GraficasTab';
import { EquiposTab } from './tabs/equipos/EquiposTab';
import { colors } from '../../../theme/colors';
import './Mina.css';

export function MinaPanel() {
  const [tab, setTab] = useState<'incidentes' | 'requerimientos' | 'graficas' | 'equipos'>('incidentes');

  return (
    <div style={{ minHeight: '100vh', background: colors.background }}>
      <DashboardHeader isConnected={true} />

      <div style={{ maxWidth: 1200, margin: '0 auto', padding: '32px 16px' }}>
        <div className="area-panel">
          <div className="area-options">
            <button className={tab === 'incidentes' ? 'active' : ''} onClick={() => setTab('incidentes')}>Incidentes</button>
            <button className={tab === 'requerimientos' ? 'active' : ''} onClick={() => setTab('requerimientos')}>Requerimientos</button>
            <button className={tab === 'graficas' ? 'active' : ''} onClick={() => setTab('graficas')}>Gráficas</button>
            <button className={tab === 'equipos' ? 'active' : ''} onClick={() => setTab('equipos')}>Equipos Mina</button>
          </div>

          <div className="area-content">
            {tab === 'incidentes' && <IncidentesTab />}
            {tab === 'requerimientos' && <RequerimientosTab />}
            {tab === 'graficas' && <GraficasTab />}
            {tab === 'equipos' && <EquiposTab />}
          </div>
        </div>
      </div>
    </div>
  );
}