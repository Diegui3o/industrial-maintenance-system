import { useState } from 'react';
import { DashboardHeader } from '../../DashboardHeader/DashboardHeader';
import { colors } from '../../../theme/colors';
import { PlantaEstructura } from './components/PlantaEstructura';
import './Planta.css';

type PlantaTab = 'estructura';

export function PlantaPanel() {
  const [tab, setTab] = useState<PlantaTab>('estructura');

  return (
    <div style={{ minHeight: '100vh', background: colors.background }}>
      <DashboardHeader isConnected={true} />

      <div className="planta-container">
        <div className="area-panel">
          <div className="area-options">
            <button
              className={tab === 'estructura' ? 'active' : ''}
              onClick={() => setTab('estructura')}
            >
              Estructura
            </button>
          </div>

          <div className="area-content">
            {tab === 'estructura' && <PlantaEstructura />}
          </div>
        </div>
      </div>
    </div>
  );
}