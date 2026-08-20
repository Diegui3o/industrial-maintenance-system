import { useState } from 'react';
import { GraficasResumen } from './graficas/GraficasResumen';
import { GraficasIncidentes } from './graficas/GraficasIncidentes';
import { GraficasRequerimientos } from './graficas/GraficasRequerimientos';
import { GraficasTendencias } from './graficas/GraficasTendencias';
import { GraficasComparativa } from './graficas/GraficasComparativa';
import type { FiltroFecha } from './graficas/useGraficasData';
import './Graficas.css';

export function GraficasTab() {
  const [subTab, setSubTab] = useState<'resumen' | 'incidentes' | 'requerimientos' | 'tendencias' | 'comparativa'>('resumen');
  const [filtro, setFiltro] = useState<FiltroFecha>('30dias');

  return (
    <div className="graficas-container">
      <div className="graficas-toolbar">
        <div className="graficas-tabs">
          <button className={subTab === 'resumen' ? 'active' : ''} onClick={() => setSubTab('resumen')}>Resumen</button>
          <button className={subTab === 'incidentes' ? 'active' : ''} onClick={() => setSubTab('incidentes')}>Incidentes</button>
          <button className={subTab === 'requerimientos' ? 'active' : ''} onClick={() => setSubTab('requerimientos')}>Requerimientos</button>
          <button className={subTab === 'tendencias' ? 'active' : ''} onClick={() => setSubTab('tendencias')}>Tendencias</button>
          <button className={subTab === 'comparativa' ? 'active' : ''} onClick={() => setSubTab('comparativa')}>Comparativa</button>
        </div>

        <select value={filtro} onChange={(e) => setFiltro(e.target.value as FiltroFecha)} className="graficas-filtro">
          <option value="hoy">Hoy</option>
          <option value="7dias">Últimos 7 días</option>
          <option value="30dias">Últimos 30 días</option>
          <option value="mes">Este mes</option>
          <option value="todo">Todo</option>
        </select>
      </div>

      {subTab === 'resumen' && <GraficasResumen filtro={filtro} />}
      {subTab === 'incidentes' && <GraficasIncidentes filtro={filtro} />}
      {subTab === 'requerimientos' && <GraficasRequerimientos filtro={filtro} />}
      {subTab === 'tendencias' && <GraficasTendencias filtro={filtro} />}
      {subTab === 'comparativa' && <GraficasComparativa filtro={filtro} />}
    </div>
  );
}