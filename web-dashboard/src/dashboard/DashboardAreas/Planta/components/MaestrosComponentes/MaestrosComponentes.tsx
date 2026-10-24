import { useState } from 'react';
import * as XLSX from 'xlsx';

import { MaestroComponentesSelector } from './components/MaestroComponentesSelector';
import { MaestroComponentesTabla } from './components/MaestroComponentesTabla';

import { TIPOS_COMPONENTE_BASE } from './tipos/tiposComponente';

import './MaestrosComponentes.css';

export function MaestrosComponentes() {
  const [tipoSeleccionado, setTipoSeleccionado] =
    useState<string>(
      TIPOS_COMPONENTE_BASE[0],
    );

  const exportarAExcel = () => {
    const tablaElement = document.querySelector('.maestro-componentes-tabla table, table');
    
    if (!tablaElement) {
      alert('No se encontró una tabla activa para exportar en este momento.');
      return;
    }

    const workbook = XLSX.utils.table_to_book(tablaElement, { sheet: tipoSeleccionado.substring(0, 31) });
    const nombreArchivo = `Maestro_${tipoSeleccionado.replace(/\s+/g, '_')}.xlsx`;
    XLSX.writeFile(workbook, nombreArchivo);
  };

  return (
    <section className="maestros-componentes">
      <div className="maestros-componentes-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '12px' }}>
        <div className="maestros-componentes-titulo">
          <h2>Maestros de Componentes</h2>

          <span>
            Información técnica organizada por tipo de componente.
          </span>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '10px', flexWrap: 'wrap' }}>
          {/* Selector original corregido (solo la propiedad 'tipos') */}
          <MaestroComponentesSelector
            tipos={[...TIPOS_COMPONENTE_BASE]}
            tipoSeleccionado={tipoSeleccionado}
            onChange={setTipoSeleccionado}
          />

          {/* 🟢 Botón verde de Descargar Excel en el Master */}
          <button
            type="button"
            onClick={exportarAExcel}
            style={{
              background: '#217346',
              color: '#fff',
              border: 'none',
              padding: '8px 14px',
              borderRadius: '6px',
              fontSize: '12px',
              fontWeight: 700,
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
              boxShadow: '0 2px 4px rgba(0,0,0,0.08)',
              whiteSpace: 'nowrap',
              height: '36px'
            }}
          >
            📊 Descargar Excel (.xlsx)
          </button>
        </div>
      </div>

      <MaestroComponentesTabla
        tipoSeleccionado={tipoSeleccionado}
      />
    </section>
  );
}