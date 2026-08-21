import { useState } from 'react';
import { colors } from '../../../../theme/colors';
import { updateFirestoreDoc } from '../../../../dashboard/services/dashboardApi';
import { EditModal } from '../components/EditModal';
import { useIncidentesCache } from '../hooks/useIncidentesCache';

const PAGE_SIZE = 80;

export function RequerimientosTab() {
  const { requerimientos, loading, ultimaCarga, refrescarDatos } = useIncidentesCache();
  const [page, setPage] = useState(1);
  const [editItem, setEditItem] = useState<any>(null);

  const totalPages = Math.ceil(requerimientos.length / PAGE_SIZE);
  const paginados = requerimientos.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);

  const colorAvance = (avance: number) => {
    if (avance >= 76) return '#2D7A4C';
    if (avance >= 51) return '#2563A0';
    if (avance >= 26) return '#A16207';
    return '#B93636';
  };

  if (loading) return <p>Cargando...</p>;

  return (
    <div>
      <div style={{ fontSize: 11, color: '#8a919f', marginBottom: 12 }}>
        {ultimaCarga && `📅 Última carga: ${ultimaCarga} · `}
        <button
          onClick={refrescarDatos}
          style={{ cursor: 'pointer', border: 'none', background: 'none', color: '#C45A1A', fontWeight: 600 }}
        >
          Refrescar ahora
        </button>
      </div>

      {paginados.length === 0 ? (
        <p>Sin requerimientos</p>
      ) : (
        <>
          <table className="incidentes-table">
            <thead>
              <tr>
                <th>Fecha</th>
                <th>Nivel</th>
                <th>Referencia</th>
                <th>Tipo</th>
                <th>Descripción</th>
                <th>Avance</th>
                <th></th>
              </tr>
            </thead>
            <tbody>
              {paginados.map((req) => (
                <tr key={req.id_numerico || req.id}>
                  <td>{new Date(req.fecha).toLocaleDateString('es-PE')}</td>
                  <td>{req.nivel || '—'}</td>
                  <td>{req.referencia || '—'}</td>
                  <td>{req.tipo_de_requerimiento || '—'}</td>
                  <td>{req.descripcion_del_requerimiento || '—'}</td>
                  <td>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                      <div style={{
                        width: 60, height: 6, background: colors.borderLight,
                        borderRadius: 3, overflow: 'hidden'
                      }}>
                        <div style={{
                          width: `${req.avance || 0}%`, height: '100%',
                          background: colorAvance(req.avance || 0),
                          borderRadius: 3,
                        }} />
                      </div>
                      <span style={{ fontSize: 11, fontWeight: 700, color: colorAvance(req.avance || 0) }}>
                        {req.avance || 0}%
                      </span>
                    </div>
                  </td>
                  <td>
                    <button className="edit-btn" onClick={() => setEditItem(req)} title="Editar">✏️</button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>

          {editItem && (
            <EditModal
              title={`Editar Requerimiento #${editItem.id_numerico}`}
              item={editItem}
              fields={[
                { key: 'nivel', label: 'Nivel' },
                { key: 'referencia', label: 'Referencia' },
                { key: 'tipo_de_requerimiento', label: 'Tipo' },
                { key: 'descripcion_del_requerimiento', label: 'Descripción' },
                { key: 'avance', label: 'Avance', type: 'number' },
                { key: 'accion_realizada', label: 'Acción Realizada' },
                { key: 'prioridad', label: 'Prioridad' },
              ]}
              onSave={async (data: any) => {
                await updateFirestoreDoc('requerimientos', editItem.id, data);
                setEditItem(null);
                refrescarDatos();
              }}
              onClose={() => setEditItem(null)}
            />
          )}

          {totalPages > 1 && (
            <div className="pagination">
              <button className="pagination-btn" onClick={() => setPage(p => Math.max(1, p - 1))} disabled={page === 1}>
                ← Anterior
              </button>
              <div className="pagination-pages">
                {Array.from({ length: totalPages }, (_, i) => i + 1)
                  .filter(n => n === 1 || n === totalPages || Math.abs(n - page) <= 2)
                  .map((n, idx, arr) => (
                    <div key={n} style={{ display: 'flex', gap: 4 }}>
                      {idx > 0 && arr[idx - 1] !== n - 1 && <span className="pagination-info">…</span>}
                      <button className={`pagination-page ${n === page ? 'active' : ''}`} onClick={() => setPage(n)}>
                        {n}
                      </button>
                    </div>
                  ))}
              </div>
              <button className="pagination-btn" onClick={() => setPage(p => Math.min(totalPages, p + 1))} disabled={page === totalPages}>
                Siguiente →
              </button>
            </div>
          )}
        </>
      )}
    </div>
  );
}