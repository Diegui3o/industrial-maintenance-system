import { useState } from 'react';
import { MaestroGeneral } from './MaestroGeneral/MaestroGeneral';
import { MaestrosComponentes } from './MaestrosComponentes/MaestrosComponentes';
import { MasterRepuestosAvanzado } from './Repuestos/MasterRepuestosAvanzado'; // 👈 El nuevo componente avanzado

type MasterTab = 'general' | 'componentes' | 'repuestos';

export function MasterHubPrincipal() {
  const [tabMaestro, setTabMaestro] = useState<MasterTab>('general');

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '16px', width: '100%' }}>
      {/* 🧭 Barra superior de Master Hub por Especialidad */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
        gap: '8px',
        padding: '8px',
        background: '#f4ece4',
        borderRadius: '10px',
        border: '1px solid #e2d2c2'
      }}>
        <button
          type="button"
          onClick={() => setTabMaestro('general')}
          style={{
            padding: '12px 16px',
            border: 'none',
            borderRadius: '6px',
            background: tabMaestro === 'general' ? '#ffffff' : 'transparent',
            color: tabMaestro === 'general' ? '#9a5c25' : '#725542',
            fontSize: '12px',
            fontWeight: 700,
            cursor: 'pointer',
            textAlign: 'left',
            boxShadow: tabMaestro === 'general' ? '0 2px 4px rgba(0,0,0,0.06)' : 'none',
          }}
        >
          Master General
        </button>

        <button
          type="button"
          onClick={() => setTabMaestro('componentes')}
          style={{
            padding: '12px 16px',
            border: 'none',
            borderRadius: '6px',
            background: tabMaestro === 'componentes' ? '#ffffff' : 'transparent',
            color: tabMaestro === 'componentes' ? '#9a5c25' : '#725542',
            fontSize: '12px',
            fontWeight: 700,
            cursor: 'pointer',
            textAlign: 'left',
            boxShadow: tabMaestro === 'componentes' ? '0 2px 4px rgba(0,0,0,0.06)' : 'none',
          }}
        >
          Master de Componentes
        </button>

        <button
          type="button"
          onClick={() => setTabMaestro('repuestos')}
          style={{
            padding: '12px 16px',
            border: 'none',
            borderRadius: '6px',
            background: tabMaestro === 'repuestos' ? '#ffffff' : 'transparent',
            color: tabMaestro === 'repuestos' ? '#9a5c25' : '#725542',
            fontSize: '12px',
            fontWeight: 700,
            cursor: 'pointer',
            textAlign: 'left',
            boxShadow: tabMaestro === 'repuestos' ? '0 2px 4px rgba(0,0,0,0.06)' : 'none',
          }}
        >
          Master de Repuestos e Instrumentos
        </button>
      </div>

      {/* Contenido Dinámico */}
      <div style={{ width: '100%' }}>
        {tabMaestro === 'general' && <MaestroGeneral />}
        {tabMaestro === 'componentes' && <MaestrosComponentes />}
        {tabMaestro === 'repuestos' && <MasterRepuestosAvanzado />}
      </div>
    </div>
  );
}