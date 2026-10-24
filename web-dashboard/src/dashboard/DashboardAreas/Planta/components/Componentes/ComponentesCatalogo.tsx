import {
  useEffect,
  useMemo,
  useRef,
  useState,
} from 'react';

import {
  getTodosComponentes,
  cambiarEstadoComponente,
  type Componente,
  type EstadoComponente,
} from '../../services/plantaComponentesApi';

import {
  getEquipos,
  type Equipo,
} from '../../services/plantaEquiposApi';

import { ComponenteMenuAcciones } from './ComponenteMenuAcciones';

interface Props {
  onCrear: () => void;
  onVer?: (componente: Componente) => void;
}

export function ComponentesCatalogo({
  onCrear,
  onVer,
}: Props) {
  const [componentes, setComponentes] = useState<Componente[]>([]);
  const [equipos, setEquipos] = useState<Equipo[]>([]);
  const [busqueda, setBusqueda] = useState('');
  const [tipoFiltro, setTipoFiltro] = useState('');
  const [equipoFiltro, setEquipoFiltro] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [menuPosicion, setMenuPosicion] = useState({ top: 0, left: 0 });
  const [menuAbierto, setMenuAbierto] = useState<number | null>(null);

  const menuBotonRef = useRef<HTMLButtonElement | null>(null);

  function actualizarPosicionMenu() {
    const boton = menuBotonRef.current;
    if (!boton) return;
    const rect = boton.getBoundingClientRect();
    const ancho = 165;
    const alto = 115;
    const margen = 8;

    let left = rect.right - ancho;
    let top = rect.bottom + margen;

    if (left < margen) left = margen;
    if (left + ancho > window.innerWidth - margen) {
      left = window.innerWidth - ancho - margen;
    }
    if (top + alto > window.innerHeight - margen) {
      top = rect.top - alto - margen;
    }
    if (top < margen) top = margen;

    setMenuPosicion({ top, left });
  }

  function abrirMenu(evento: React.MouseEvent<HTMLButtonElement>, componenteId: number) {
    menuBotonRef.current = evento.currentTarget;
    setMenuAbierto(menuAbierto === componenteId ? null : componenteId);
  }
  
  useEffect(() => {
    async function cargarCatalogo() {
      setLoading(true);
      try {
        const [componentesResultado, equiposResultado] = await Promise.all([
          getTodosComponentes(),
          getEquipos(),
        ]);
        setComponentes(componentesResultado);
        setEquipos(equiposResultado);
      } catch (error) {
        console.error('Error cargando catálogo de componentes:', error);
        setComponentes([]);
        setEquipos([]);
      } finally {
        setLoading(false);
      }
    }
    void cargarCatalogo();
  }, []);

  useEffect(() => {
    if (menuAbierto === null || !menuBotonRef.current) return;
    actualizarPosicionMenu();
    const manejarScroll = () => actualizarPosicionMenu();
    const manejarResize = () => actualizarPosicionMenu();

    window.addEventListener('scroll', manejarScroll, true);
    window.addEventListener('resize', manejarResize);

    return () => {
      window.removeEventListener('scroll', manejarScroll, true);
      window.removeEventListener('resize', manejarResize);
    };
  }, [menuAbierto]);
      
  async function eliminarComponente(componente: Componente) {
    const nombreComp = componente.nombre || 'Sin nombre';
    const confirmado = window.confirm(
      `¿Seguro que deseas eliminar el componente "${nombreComp}"?\n\nEl componente no será borrado físicamente. Se marcará como Inactivo.`
    );
    if (!confirmado) return;

    try {
      await cambiarEstadoComponente(componente.id, 'inactivo', 'Desactivación desde el catálogo');
      const actualizados = await getTodosComponentes();
      setComponentes(actualizados);
      setMenuAbierto(null);
    } catch (error) {
      setError(error instanceof Error ? error.message : 'Error desactivando el componente');
    }
  }

  async function cambiarEstado(componente: Componente) {
    const estados: EstadoComponente[] = ['activo', 'inactivo', 'fallo', 'mantenimiento'];
    const estado = window.prompt('Nuevo estado:\nactivo\ninactivo\nfallo\nmantenimiento', componente.estado_componente ?? 'activo');

    if (!estado || !estados.includes(estado as EstadoComponente)) return;
    let motivo = '';
    if (estado === 'fallo') {
      motivo = window.prompt('Motivo del fallo:')?.trim() ?? '';
      if (!motivo) return;
    }

    const confirmado = window.confirm(`¿Cambiar "${componente.nombre}" a "${estado}"?`);
    if (!confirmado) return;

    try {
      await cambiarEstadoComponente(componente.id, estado as EstadoComponente, motivo);
      const actualizados = await getTodosComponentes();
      setComponentes(actualizados);
    } catch (error) {
      setError(error instanceof Error ? error.message : 'Error cambiando estado');
    }
  }

  const equipoPorId = useMemo(() => {
    const mapa = new Map<number, Equipo>();
    for (const equipo of equipos) {
      mapa.set(equipo.id, equipo);
    }
    return mapa;
  }, [equipos]);

  const tipos = useMemo<string[]>(() => {
    return Array.from(
      new Set(
        componentes.map((c) => c.tipo_componente).filter((tipo): tipo is string => Boolean(tipo))
      )
    ).sort();
  }, [componentes]);

  const componentesFiltrados = useMemo(() => {
    const texto = busqueda.trim().toLowerCase();
    return componentes.filter((componente) => {
      const equipo = componente.equipo_id ? equipoPorId.get(componente.equipo_id) : undefined;
      const contenido = [
        componente.codigo ?? '',
        componente.codigo_sap ?? '',
        componente.tag ?? '',
        componente.nombre ?? '',
        componente.tipo_componente ?? '',
        componente.marca ?? '',
        componente.modelo ?? '',
        componente.numero_serie ?? '',
        equipo?.codigo ?? '',
        equipo?.nombre ?? '',
        equipo?.subproceso_nombre ?? '',
      ].join(' ').toLowerCase();

      const coincideBusqueda = !texto || contenido.includes(texto);
      const coincideTipo = !tipoFiltro || componente.tipo_componente === tipoFiltro;
      const coincideEquipo = !equipoFiltro || String(componente.equipo_id ?? '') === equipoFiltro;

      return coincideBusqueda && coincideTipo && coincideEquipo;
    });
  }, [componentes, busqueda, tipoFiltro, equipoFiltro, equipoPorId]);

  return (
    <div className="componentes-catalogo">
      <div className="componentes-catalogo-toolbar" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '8px' }}>
        <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap', alignItems: 'center', flex: 1 }}>
          <div className="componentes-busqueda">
            <input
              type="text"
              value={busqueda}
              onChange={(e) => setBusqueda(e.target.value)}
              placeholder="Buscar por SAP, TAG, nombre, marca..."
            />
          </div>

          <select value={tipoFiltro} onChange={(e) => setTipoFiltro(e.target.value)}>
            <option value="">Todos los tipos</option>
            {tipos.map((tipo) => (
              <option key={tipo} value={tipo}>{tipo}</option>
            ))}
          </select>

          <select value={equipoFiltro} onChange={(e) => setEquipoFiltro(e.target.value)}>
            <option value="">Todos los equipos</option>
            {equipos.map((equipo) => (
              <option key={equipo.id} value={equipo.id}>
                {equipo.codigo ? `${equipo.codigo} - ` : ''}{equipo.nombre}
              </option>
            ))}
          </select>
        </div>
      </div>

      {error && <div className="componente-form-error">{error}</div>}

      <div className="componentes-tabla">
        <div className="componentes-tabla-header">
          <span>Código SAP</span>
          <span>Tipo / Componente</span>
          <span>Subproceso - Equipo</span>
          <span>Marca / fabricante</span>
          <span>Fecha de actualización</span>
          <span>Estado</span>
          <span>OPCIONES</span>
        </div>

        {loading && (
          <div className="componentes-empty">
            <div className="componentes-empty-icon">…</div>
            <strong>Cargando componentes</strong>
            <span>Consultando el catálogo registrado.</span>
          </div>
        )}

        {!loading && componentesFiltrados.length === 0 && (
          <div className="componentes-empty">
            <div className="componentes-empty-icon">⚙</div>
            <strong>{componentes.length === 0 ? 'No hay componentes registrados' : 'No se encontraron componentes'}</strong>
            <span>{componentes.length === 0 ? 'Los componentes registrados aparecerán aquí.' : 'Prueba cambiando la búsqueda o los filtros.'}</span>
            {componentes.length === 0 && (
              <button type="button" className="componentes-empty-btn" onClick={onCrear}>
                Crear primer componente
              </button>
            )}
          </div>
        )}

        {!loading && componentesFiltrados.length > 0 && componentesFiltrados.map((componente) => {
          const equipo = componente.equipo_id ? equipoPorId.get(componente.equipo_id) : undefined;

          return (
            <div key={componente.id} className="componentes-tabla-row">
              <span>{componente.codigo_sap || '—'}</span>

              <span className="componente-row-tipo">
                <strong>{componente.tipo_componente || '—'}</strong>
                {' '}
                <strong>{componente.nombre}</strong>
              </span>

              <span className="componente-row-equipo-wrapper" style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
                {equipo ? (
                  <>
                    <span className="componente-equipo-text" style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', fontWeight: 600 }} title={equipo.nombre}>
                      {equipo.nombre}
                    </span>
                    {equipo.subproceso_nombre && (
                      <span className="componente-subproceso-text" style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', fontSize: '11px', color: '#666' }} title={equipo.subproceso_nombre}>
                        {equipo.subproceso_nombre}
                      </span>
                    )}
                  </>
                ) : (
                  <span className="componente-equipo-text">Sin equipo</span>
                )}
              </span>

              <span>{componente.marca || '—'}</span>

              <span>
                {componente.fecha_actualizacion
                  ? new Date(componente.fecha_actualizacion).toLocaleString('es-PE', {
                      day: '2-digit', month: '2-digit', year: 'numeric',
                      hour: '2-digit', minute: '2-digit',
                    })
                  : '—'}
              </span>

              <span>
                <span className={`componente-estado ${componente.estado_componente ?? 'activo'}`}>
                  {componente.estado_componente === 'fallo'
                    ? 'Falla'
                    : componente.estado_componente === 'mantenimiento'
                      ? 'Mantenimiento'
                      : componente.estado_componente === 'inactivo'
                        ? 'Inactivo'
                        : 'Activo'}
                </span>
              </span>

              <span>
                <div className="componente-row-actions">
                  <button
                    type="button"
                    className="componente-row-action"
                    onClick={(e) => abrirMenu(e, componente.id)}
                  >
                    Opciones ▾
                  </button>

                  {menuAbierto === componente.id && (
                    <ComponenteMenuAcciones
                      posicion={menuPosicion}
                      onVer={() => { setMenuAbierto(null); onVer?.(componente); }}
                      onCambiarEstado={() => { setMenuAbierto(null); cambiarEstado(componente); }}
                      onEliminar={() => { setMenuAbierto(null); eliminarComponente(componente); }}
                      onCerrar={() => setMenuAbierto(null)}
                    />
                  )}
                </div>
              </span>
            </div>
          );
        })}
      </div>

      {!loading && componentesFiltrados.length > 0 && (
        <div className="componentes-catalogo-footer">
          <span>{componentesFiltrados.length} componente{componentesFiltrados.length === 1 ? '' : 's'}</span>
        </div>
      )}
    </div>
  );
}
