import { useState, useEffect } from 'react';
import { colors } from '../../../../theme/colors';
import { getIncidentes, updateFirestoreDoc } from '../../../../dashboard/services/dashboardApi';
import { EditModal } from '../components/EditModal';

interface Incidente {
  id_numerico: number;
  fecha: string;
  nivel: string;
  referencia: string;
  sistema: string;
  descripcion: string;
  avance: number;
}

const PAGE_SIZE = 80;

export function IncidentesTab() {
  const [incidentes, setIncidentes] = useState<Incidente[]>([]);
  const [loading, setLoading] = useState(false);
  const [page, setPage] = useState(1);
  const [editItem, setEditItem] = useState<any>(null);

  useEffect(() => {
    loadIncidentes();
  }, []);

  const loadIncidentes = async () => {
    setLoading(true);
    try {
      const data = await getIncidentes();
      const ordenados = data.sort((a: any, b: any) =>
        new Date(b.fecha).getTime() - new Date(a.fecha).getTime()
      );
      setIncidentes(ordenados);
    } catch {
      setIncidentes([]);
    }
    setLoading(false);
  };

  const totalPages = Math.ceil(incidentes.length / PAGE_SIZE);
  const paginados = incidentes.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);

  const colorAvance = (avance: number) => {
    if (avance >= 76) return '#2D7A4C';
    if (avance >= 51) return '#2563A0';
    if (avance >= 26) return '#A16207';
    return '#B93636';
  };

  if (loading) return <p>Cargando...</p>;

  return (
    <div>
      {paginados.length === 0 ? (
        <p>Sin incidentes</p>
      ) : (
        <>
          <table className="incidentes-table">
            <thead>
              <tr>
                <th>Fecha</th>
                <th>Nivel</th>
                <th>Referencia</th>
                <th>Sistema</th>
                <th>Descripción</th>
                <th>Avance</th>
              </tr>
            </thead>
            <tbody>
              {paginados.map((inc) => (
                <tr key={inc.id_numerico}>
                  <td>{new Date(inc.fecha).toLocaleDateString('es-PE')}</td>
                  <td>{inc.nivel || '—'}</td>
                  <td>{inc.referencia || '—'}</td>
                  <td>{inc.sistema || '—'}</td>
                  <td>{inc.descripcion || '—'}</td>
                  <td>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                      <div style={{
                        width: 60, height: 6, background: colors.borderLight,
                        borderRadius: 3, overflow: 'hidden', flexShrink: 0
                      }}>
                        <div style={{
                          width: `${inc.avance || 0}%`, height: '100%',
                          background: colorAvance(inc.avance || 0),
                          borderRadius: 3,
                          transition: 'width 0.3s ease'
                        }} />
                      </div>
                      <span style={{
                        fontSize: 11, fontWeight: 700,
                        color: colorAvance(inc.avance || 0)
                      }}>
                        {inc.avance || 0}%
                      </span>
                    </div>
                  </td>
                    <td>
                      <button className="edit-btn" onClick={() => setEditItem(inc)} title="Editar">✏️</button>
                    </td>
                </tr>
                
              ))}
            </tbody>
          </table>
            {editItem && (
              <EditModal
                title={`Editar Incidente #${editItem.id_numerico}`}
                item={editItem}
                fields={[
                  { key: 'nivel', label: 'Nivel' },
                  { key: 'referencia', label: 'Referencia' },
                  { key: 'sistema', label: 'Sistema' },
                  { key: 'descripcion', label: 'Descripción' },
                  { key: 'avance', label: 'Avance', type: 'number' },
                  { key: 'accion_realizada', label: 'Acción Realizada' },
                  { key: 'prioridad', label: 'Prioridad' },
                ]}
                onSave={async (data) => {
                  await updateFirestoreDoc('incidentes', editItem.id, data);
                  setEditItem(null);
                  loadIncidentes();
                }}
                onClose={() => setEditItem(null)}
              />
            )}
          {totalPages > 1 && (
            <div className="pagination">
              <button
                className="pagination-btn"
                onClick={() => setPage(p => Math.max(1, p - 1))}
                disabled={page === 1}
              >
                ← Anterior
              </button>

              <div className="pagination-pages">
                {Array.from({ length: totalPages }, (_, i) => i + 1)
                  .filter(n => n === 1 || n === totalPages || Math.abs(n - page) <= 2)
                  .map((n, idx, arr) => (
                    <div key={n} style={{ display: 'flex', gap: 4 }}>
                      {idx > 0 && arr[idx - 1] !== n - 1 && (
                        <span className="pagination-info">…</span>
                      )}
                      <button
                        className={`pagination-page ${n === page ? 'active' : ''}`}
                        onClick={() => setPage(n)}
                      >
                        {n}
                      </button>
                    </div>
                  ))}
              </div>

              <button
                className="pagination-btn"
                onClick={() => setPage(p => Math.min(totalPages, p + 1))}
                disabled={page === totalPages}
              >
                Siguiente →
              </button>
            </div>
          )}
        </>
      )}
    </div>
  );
}