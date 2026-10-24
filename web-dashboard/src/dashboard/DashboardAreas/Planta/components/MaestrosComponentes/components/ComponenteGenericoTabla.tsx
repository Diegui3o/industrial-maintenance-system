import { useState, useEffect, useMemo } from 'react';
import { getMaestrosComponentesPorTipo } from '../../../services/maestrosComponentesApi';

interface Props {
  tipo: string;
}

export function ComponenteGenericoTabla({ tipo }: Props) {
  const [datos, setDatos] = useState<any[]>([]);
  const [cargando, setCargando] = useState(true);
  const [busqueda, setBusqueda] = useState('');

  useEffect(() => {
    let activo = true;
    async function cargar() {
      try {
        setCargando(true);
        const res = await getMaestrosComponentesPorTipo(tipo);
        if (activo) setDatos(res || []);
      } catch (err) {
        console.error(`Error cargando maestro para ${tipo}:`, err);
        if (activo) setDatos([]);
      } finally {
        if (activo) setCargando(false);
      }
    }
    cargar();
    return () => { activo = false; };
  }, [tipo]);

  const datosFiltrados = useMemo(() => {
    const q = busqueda.trim().toLowerCase();
    if (!q) return datos;
    return datos.filter((item) =>
      Object.values(item).some((val) =>
        String(val ?? '').toLowerCase().includes(q)
      )
    );
  }, [datos, busqueda]);

  if (cargando) {
    return (
      <div className="maestro-componentes-tabla-vacia">
        <h3>Cargando maestro de {tipo.toLowerCase()}...</h3>
        <p>Consultando registros técnicos en el sistema.</p>
      </div>
    );
  }

  return (
    <div className="motor-electrico-maestro">
      <div className="motor-electrico-maestro-header">
        <div>
          <h3>Maestro de {tipo}</h3>
          <span>Listado general de componentes registrados bajo esta categoría</span>
        </div>
        <div className="motor-electrico-controles">
          <div className="motor-electrico-contador">
            {datosFiltrados.length} {datosFiltrados.length === 1 ? 'registro' : 'registros'}
          </div>
        </div>
      </div>

      <div className="motor-electrico-filtros" style={{ gridTemplateColumns: '1fr' }}>
        <div className="motor-electrico-filtro">
          <label>Buscar</label>
          <input
            type="text"
            value={busqueda}
            onChange={(e) => setBusqueda(e.target.value)}
            placeholder={`Filtrar por código, TAG, serie, marca o modelo de ${tipo.toLowerCase()}...`}
          />
        </div>
      </div>

      <div className="motor-electrico-tabla-wrapper">
        <table className="motor-electrico-tabla">
          <thead>
            <tr>
              <th>Código interno</th>
              <th>Código SAP</th>
              <th>Nombre</th>
              <th>TAG</th>
              <th>Marca</th>
              <th>Modelo</th>
              <th>N° Serie</th>
              <th>Estado</th>
            </tr>
          </thead>
          <tbody>
            {datosFiltrados.length === 0 ? (
              <tr>
                <td colSpan={8} style={{ textAlign: 'center', padding: '40px', color: '#888' }}>
                  No se encontraron registros para {tipo}.
                </td>
              </tr>
            ) : (
              datosFiltrados.map((item, idx) => (
                <tr key={item.id ?? idx}>
                  <td>{item.codigo_interno || item.codigo || '—'}</td>
                  <td>{item.codigo_sap || '—'}</td>
                  <td>{item.nombre || item.nombre_componente || '—'}</td>
                  <td>{item.tag || '—'}</td>
                  <td>{item.marca || '—'}</td>
                  <td>{item.modelo || '—'}</td>
                  <td>{item.numero_serie || '—'}</td>
                  <td>{item.activo !== false ? 'ACTIVO' : 'INACTIVO'}</td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}