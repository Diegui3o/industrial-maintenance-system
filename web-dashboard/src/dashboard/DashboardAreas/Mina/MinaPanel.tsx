import { useEffect, useState } from 'react';
import { DashboardHeader } from '../../DashboardHeader/DashboardHeader';
import { getIncidentes } from '../../../dashboard/services/dashboardApi';
import { colors } from '../../../theme/colors';
import './Mina.css';

interface Incidente {
  id_numerico: number;
  fecha: string;
  nivel: string;
  referencia: string;
  sistema: string;
  descripcion: string;
  avance: number;
}

export function MinaPanel() {
  const [tab, setTab] = useState<'incidentes' | 'requerimientos' | 'graficas' | 'equipos'>('incidentes');
  const [incidentes, setIncidentes] = useState<Incidente[]>([]);
  const [loading, setLoading] = useState(false);
  const [page, setPage] = useState(1);
  const PAGE_SIZE = 80;

  useEffect(() => {
    if (tab === 'incidentes') loadIncidentes();
  }, [tab]);

  const loadIncidentes = async () => {
    setLoading(true);
    try {
      const data = await getIncidentes();
      // Ordenar por fecha descendente (más reciente primero)
      const ordenados = data.sort((a: any, b: any) => 
        new Date(b.fecha).getTime() - new Date(a.fecha).getTime()
      );
      setIncidentes(ordenados);
    } catch {
      setIncidentes([]);
    }
    setLoading(false);
  };

  // Paginación
  const totalPages = Math.ceil(incidentes.length / PAGE_SIZE);
  const paginados = incidentes.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);

  // Color del avance
  const colorAvance = (avance: number) => {
    if (avance >= 76) return '#2D7A4C'; // verde
    if (avance >= 51) return '#2563A0'; // azul
    if (avance >= 26) return '#A16207'; // naranja
    return '#B93636'; // rojo
  };

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
            {loading && <p>Cargando...</p>}

            {!loading && tab === 'incidentes' && (
              <div>
                {paginados.length === 0 ? (
                  <p>Sin incidentes</p>
                ) : (
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
                        </tr>
                      ))}
                    </tbody>
                  </table>
                )}

                {/* Paginación */}
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
              </div>
            )}

            {tab === 'requerimientos' && <p>Requerimientos próximamente</p>}
            {tab === 'graficas' && <p>Gráficas próximamente</p>}
          </div>
        </div>
      </div>
    </div>
  );
}