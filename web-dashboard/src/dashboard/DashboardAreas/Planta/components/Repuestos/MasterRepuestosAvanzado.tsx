import { useState, useEffect } from 'react';

interface RepuestoMaster {
  id: number;
  codigo: string;
  nombre: string;
  categoria: string;
  marcaModel: string;
  stockActual: number;
  stockMinimo: number;
  criticidad: 'Alta' | 'Media' | 'Baja';
  codigoSAP: string;
  estado: string;
}

export function MasterRepuestosAvanzado() {
  const [repuestos, setRepuestos] = useState<RepuestoMaster[]>([]);
  const [filtroCategoria, setFiltroCategoria] = useState<string>('TODAS');
  const [busqueda, setBusqueda] = useState<string>('');

  useEffect(() => {
    setRepuestos([
      {
        id: 1,
        codigo: 'REP-001',
        nombre: 'Filtro hidráulico 10um',
        categoria: 'Mecánico',
        marcaModel: 'Parker / H-10',
        stockActual: 2,
        stockMinimo: 5,
        criticidad: 'Alta',
        codigoSAP: 'SAP-88120',
        estado: 'Activo'
      },
      {
        id: 2,
        codigo: 'REP-002',
        nombre: 'Rodamiento rígido de bolas 6205 ZZ',
        categoria: 'Mecánico',
        marcaModel: 'SKF / 6205 ZZ',
        stockActual: 4,
        stockMinimo: 10,
        criticidad: 'Media',
        codigoSAP: 'SAP-99999',
        estado: 'Activo'
      },
      {
        id: 3,
        codigo: 'REP-003',
        nombre: 'Variador de frecuencia 15kW',
        categoria: 'Eléctrico',
        marcaModel: 'Schneider / ATV320',
        stockActual: 1,
        stockMinimo: 2,
        criticidad: 'Alta',
        codigoSAP: 'SAP-10425',
        estado: 'Activo'
      }
    ]);
  }, []);

  const repuestosFiltrados = repuestos.filter(r => {
    const coincideCat = filtroCategoria === 'TODAS' || r.categoria.toUpperCase() === filtroCategoria.toUpperCase();
    const coincideTexto = r.nombre.toLowerCase().includes(busqueda.toLowerCase()) || r.codigoSAP.toLowerCase().includes(busqueda.toLowerCase());
    return coincideCat && coincideTexto;
  });

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '16px', width: '100%' }}>
      {/* 🔍 Barra de Filtros */}
      <div style={{ display: 'flex', justifyContent: 'flex-start', alignItems: 'center', background: '#fff', padding: '12px', borderRadius: '8px', border: '1px solid #e2d2c2' }}>
        <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
          <input
            type="text"
            placeholder="Buscar por nombre o código SAP..."
            value={busqueda}
            onChange={(e) => setBusqueda(e.target.value)}
            style={{ padding: '8px 12px', borderRadius: '6px', border: '1px solid #ccc', width: '280px', fontSize: '12px' }}
          />
          <select
            value={filtroCategoria}
            onChange={(e) => setFiltroCategoria(e.target.value)}
            style={{ padding: '8px 12px', borderRadius: '6px', border: '1px solid #ccc', fontSize: '12px', background: '#fff' }}
          >
            <option value="TODAS">Todas las Categorías</option>
            <option value="MECÁNICO">Mecánico</option>
            <option value="ELÉCTRICO">Eléctrico</option>
          </select>
        </div>
      </div>

      {/* 📋 Tabla de Repuestos */}
      <div style={{ background: '#fff', borderRadius: '8px', border: '1px solid #e2d2c2', overflow: 'hidden' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '12px' }}>
          <thead>
            <tr style={{ background: '#f8f5f0', borderBottom: '1px solid #e2d2c2', color: '#725542' }}>
              <th style={{ padding: '10px 12px' }}>Código SAP / Interno</th>
              <th style={{ padding: '10px 12px' }}>Nombre del Repuesto</th>
              <th style={{ padding: '10px 12px' }}>Categoría / Disciplina</th>
              <th style={{ padding: '10px 12px' }}>Stock (Act / Min)</th>
              <th style={{ padding: '10px 12px' }}>Criticidad</th>
              <th style={{ padding: '10px 12px' }}>Estado</th>
              <th style={{ padding: '10px 12px', textAlign: 'right' }}>Acciones</th>
            </tr>
          </thead>
          <tbody>
            {repuestosFiltrados.map((rep) => (
              <tr key={rep.id} style={{ borderBottom: '1px solid #eee' }}>
                <td style={{ padding: '10px 12px', fontWeight: 600, color: '#333' }}>
                  {rep.codigoSAP} <span style={{ color: '#888', fontWeight: 400 }}>({rep.codigo})</span>
                </td>
                <td style={{ padding: '10px 12px' }}>
                  <div>{rep.nombre}</div>
                  <div style={{ fontSize: '10px', color: '#777' }}>{rep.marcaModel}</div>
                </td>
                <td style={{ padding: '10px 12px' }}>
                  <span style={{ padding: '2px 6px', background: '#eee', borderRadius: '4px', fontSize: '10px', fontWeight: 600 }}>
                    {rep.categoria}
                  </span>
                </td>
                <td style={{ padding: '10px 12px' }}>
                  <span style={{ color: rep.stockActual < rep.stockMinimo ? '#d9534f' : '#333', fontWeight: 700 }}>
                    {rep.stockActual}
                  </span> / {rep.stockMinimo}
                </td>
                <td style={{ padding: '10px 12px' }}>
                  <span style={{
                    padding: '2px 6px',
                    borderRadius: '4px',
                    fontSize: '10px',
                    fontWeight: 700,
                    background: rep.criticidad === 'Alta' ? '#fdecea' : '#fcf8e3',
                    color: rep.criticidad === 'Alta' ? '#d9534f' : '#8a6d3b'
                  }}>
                    {rep.criticidad}
                  </span>
                </td>
                <td style={{ padding: '10px 12px', color: '#5cb85c', fontWeight: 600 }}>✅ {rep.estado}</td>
                <td style={{ padding: '10px 12px', textAlign: 'right' }}>
                  <button
                    type="button"
                    style={{ background: 'transparent', border: '1px solid #ccc', borderRadius: '4px', padding: '4px 8px', cursor: 'pointer', fontSize: '11px' }}
                    onClick={() => alert(`Consultando compatibilidad y equipos para: ${rep.nombre}`)}
                  >
                    ⚙️ Opciones ▾
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}