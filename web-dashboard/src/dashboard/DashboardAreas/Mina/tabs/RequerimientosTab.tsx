import { useState, useEffect } from 'react';
import { getRequerimientos } from '../../../../dashboard/services/dashboardApi';
import { colors } from '../../../../theme/colors';

interface Requerimiento {
  id_numerico: number;
  fecha: string;
  nivel: string;
  referencia: string;
  tipo_de_requerimiento: string;
  descripcion_del_requerimiento: string;
  avance: number;
}

const PAGE_SIZE = 80;

export function RequerimientosTab() {
  const [requerimientos, setRequerimientos] = useState<Requerimiento[]>([]);
  const [loading, setLoading] = useState(false);
  const [page, setPage] = useState(1);

  useEffect(() => {
    loadRequerimientos();
  }, []);

  const loadRequerimientos = async () => {
    setLoading(true);
    try {
      const data: any[] = await getRequerimientos();
      const ordenados = data.sort((a: any, b: any) =>
        new Date(b.fecha).getTime() - new Date(a.fecha).getTime()
      );
      setRequerimientos(ordenados);
    } catch {
      setRequerimientos([]);
    }
    setLoading(false);
  };

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
              </tr>
            </thead>
            <tbody>
              {paginados.map((req) => (
                <tr key={req.id_numerico}>
                  <td>{new Date(req.fecha).toLocaleDateString('es-PE')}</td>
                  <td>{req.nivel || '—'}</td>
                  <td>{req.referencia || '—'}</td>
                  <td>{req.tipo_de_requerimiento || '—'}</td>
                  <td>{req.descripcion_del_requerimiento || '—'}</td>
                  <td>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                      <div style={{
                        width: 60, height: 6, background: colors.borderLight,
                        borderRadius: 3, overflow: 'hidden', flexShrink: 0
                      }}>
                        <div style={{
                          width: `${req.avance || 0}%`, height: '100%',
                          background: colorAvance(req.avance || 0),
                          borderRadius: 3,
                          transition: 'width 0.3s ease'
                        }} />
                      </div>
                      <span style={{
                        fontSize: 11, fontWeight: 700,
                        color: colorAvance(req.avance || 0)
                      }}>
                        {req.avance || 0}%
                      </span>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>

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