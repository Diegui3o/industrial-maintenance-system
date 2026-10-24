import {
  useEffect,
  useMemo,
  useRef,
  useState,
} from 'react';

import {
  getRepuestos,
  actualizarRepuesto,
  type Repuesto,
} from '../../services/plantaRepuestosApi';

import { RepuestoMenuAcciones } from './RepuestoMenuAcciones';

interface Props {
  onNuevo: () => void;
  onVer?: (repuesto: Repuesto) => void;
}

export function RepuestosCatalogo({
  onNuevo,
  onVer,
}: Props) {
  const [repuestos, setRepuestos] =
    useState<Repuesto[]>([]);

  const [busqueda, setBusqueda] =
    useState('');

  const [categoriaFiltro, setCategoriaFiltro] =
    useState('');

  const [loading, setLoading] =
    useState(true);

  const [error, setError] =
    useState('');

  // Estados para el menú desplegable
  const [menuAbierto, setMenuAbierto] =
    useState<number | null>(null);

  const [menuPosicion, setMenuPosicion] =
    useState({ top: 0, left: 0 });

  const menuBotonRef =
    useRef<HTMLButtonElement | null>(null);

  useEffect(() => {
    async function cargarCatalogo() {
      setLoading(true);
      setError('');

      try {
        const resultado = await getRepuestos();
        setRepuestos(resultado);
      } catch (err) {
        console.error(
          'Error cargando catálogo de repuestos:',
          err
        );
        setRepuestos([]);
      } finally {
        setLoading(false);
      }
    }

    void cargarCatalogo();
  }, []);

  // Cerrar menú al hacer scroll o resize
  useEffect(() => {
    if (menuAbierto === null || !menuBotonRef.current) {
      return;
    }

  function actualizarPosicionMenu() {
      const boton = menuBotonRef.current;
      if (!boton) return;

      const rect = boton.getBoundingClientRect();
      const anchoMenu = 160; // Ancho estimado del menú
      const altoMenu = 260;  // Alto estimado del menú
      const margen = 6;

      // Alinear el borde derecho del menú con el borde derecho del botón, 
      // o hacia la izquierda si no hay espacio.
      let left = rect.right - anchoMenu;
      let top = rect.bottom + margen;

      // Evitar que se salga por la izquierda
      if (left < margen) {
        left = rect.left;
      }

      // Si se sale por abajo de la ventana, mostrarlo arriba del botón
      if (top + altoMenu > window.innerHeight - margen) {
        top = rect.top - altoMenu - margen;
      }

      setMenuPosicion({ top, left });
    }

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

  async function recargar() {
    try {
      const resultado = await getRepuestos();
      setRepuestos(resultado);
    } catch (err) {
      console.error('Error recargando repuestos:', err);
    }
  }

  function abrirMenu(
    evento: React.MouseEvent<HTMLButtonElement>,
    repuestoId: number
  ) {
    evento.stopPropagation();
    menuBotonRef.current = evento.currentTarget;

    if (menuAbierto === repuestoId) {
      setMenuAbierto(null);
    } else {
      setMenuAbierto(repuestoId);
    }
  }

  // ============================================
  // Helpers de visualización
  // ============================================

  const categorias = useMemo<string[]>(() => {
    return Array.from(
      new Set(
        repuestos
          .map((r) => r.categoria)
          .filter(
            (categoria): categoria is string =>
              Boolean(categoria)
          )
      )
    ).sort();
  }, [repuestos]);

  const repuestosFiltrados = useMemo(() => {
    const texto = busqueda.trim().toLowerCase();

    return repuestos.filter((repuesto) => {
      const contenido = [
        repuesto.codigo ?? '',
        repuesto.codigo_sap ?? '',
        repuesto.nombre ?? '',
        repuesto.descripcion ?? '',
        repuesto.categoria ?? '',
        repuesto.marca ?? '',
        repuesto.modelo ?? '',
        repuesto.criticidad ?? '',
        repuesto.estado ?? '',
      ]
        .join(' ')
        .toLowerCase();

      const coincideBusqueda = !texto || contenido.includes(texto);
      const coincideCategoria = !categoriaFiltro || repuesto.categoria === categoriaFiltro;

      return coincideBusqueda && coincideCategoria;
    });
  }, [repuestos, busqueda, categoriaFiltro]);

  function obtenerInfoEstado(repuesto: Repuesto) {
    if (repuesto.estado) {
      const mapa: Record<string, { icono: string; label: string; clase: string }> = {
        activo: { icono: '✅', label: 'Activo', clase: 'activo' },
        planeado: { icono: '📋', label: 'Planeado', clase: 'planeado' },
        falla: { icono: '⚠️', label: 'Falla', clase: 'falla' },
        inactivo: { icono: '⛔', label: 'Inactivo', clase: 'inactivo' },
        obsoleto: { icono: '🗑️', label: 'Obsoleto', clase: 'obsoleto' },
      };
      return mapa[repuesto.estado] || mapa.inactivo;
    }

    return repuesto.activo
      ? { icono: '✅', label: 'Activo', clase: 'activo' }
      : { icono: '⛔', label: 'Inactivo', clase: 'inactivo' };
  }

  return (
    <div className="repuestos-catalogo">
      <div className="repuestos-catalogo-toolbar">
        <div className="repuestos-busqueda">
          <input
            type="text"
            value={busqueda}
            onChange={(e) => setBusqueda(e.target.value)}
            placeholder="🔍 Buscar por código, SAP, nombre, marca, modelo..."
          />
        </div>

        <select
          value={categoriaFiltro}
          onChange={(e) => setCategoriaFiltro(e.target.value)}
        >
          <option value="">Todas las categorías</option>
          {categorias.map((categoria) => (
            <option key={categoria} value={categoria}>
              {categoria}
            </option>
          ))}
        </select>
      </div>

      {error && (
        <div className="repuesto-form-error">{error}</div>
      )}

      <div className="repuestos-tabla">
        <div className="repuestos-tabla-header">
          <span>SAP</span>
          <span>Categoría / Nombre</span>
          <span>Marca / Modelo</span>
          <span>Stock</span>
          <span>Mínimo</span>
          <span>Criticidad</span>
          <span>Estado</span>
          <span>Acciones</span>
        </div>

        {loading && (
          <div className="repuestos-empty">
            <strong>Cargando repuestos</strong>
            <span>Consultando el catálogo registrado.</span>
          </div>
        )}

        {!loading && repuestosFiltrados.length === 0 && (
          <div className="repuestos-empty">
            <strong>
              {repuestos.length === 0
                ? 'No hay repuestos registrados'
                : 'No se encontraron repuestos'}
            </strong>
            <span>
              {repuestos.length === 0
                ? 'Los repuestos registrados aparecerán aquí.'
                : 'Prueba cambiando la búsqueda o los filtros.'}
            </span>
            {repuestos.length === 0 && (
              <button
                type="button"
                className="repuestos-empty-btn"
                onClick={onNuevo}
              >
                Crear primer repuesto
              </button>
            )}
          </div>
        )}

        {!loading &&
          repuestosFiltrados.length > 0 &&
          repuestosFiltrados.map((repuesto) => {
            const estadoInfo = obtenerInfoEstado(repuesto);

            return (
              <div
                key={repuesto.id}
                className="repuestos-tabla-row"
              >
                <span className="repuesto-codigo-sap">
                  {repuesto.codigo_sap || '—'}
                </span>

                <span className="repuesto-row-categoria">
                  <span className="repuesto-cat-badge">
                    {repuesto.categoria || '—'}
                  </span>
                  <strong className="repuesto-nombre-texto">
                    {repuesto.nombre}
                  </strong>
                </span>

                <span className="repuesto-marca-modelo">
                  {repuesto.marca || '—'}
                  {repuesto.modelo && (
                    <span className="repuesto-modelo-texto">
                      {' '}/ {repuesto.modelo}
                    </span>
                  )}
                </span>

                <span className="repuesto-stock-cell">
                  <strong>{repuesto.stock_actual ?? 0}</strong>
                  {repuesto.unidad_medida && (
                    <small>{repuesto.unidad_medida}</small>
                  )}
                </span>

                <span className="repuesto-stock-cell">
                  <strong>{repuesto.stock_minimo ?? 0}</strong>
                  {repuesto.unidad_medida && (
                    <small>{repuesto.unidad_medida}</small>
                  )}
                </span>

                <span>
                  {repuesto.criticidad ? (
                    <span
                      className={`repuesto-criticidad ${
                        repuesto.criticidad?.toLowerCase() || 'media'
                      }`}
                    >
                      {repuesto.criticidad}
                    </span>
                  ) : (
                    <span className="repuesto-vacio">—</span>
                  )}
                </span>

                <span>
                  <span className={`repuesto-estado ${estadoInfo.clase}`}>
                    <span className="repuesto-estado-icono">
                      {estadoInfo.icono}
                    </span>
                    {estadoInfo.label}
                  </span>
                </span>

                <span>
                  <div className="repuesto-row-actions">
                    <button
                      type="button"
                      className="repuesto-row-action-menu"
                      onClick={(e) => abrirMenu(e, repuesto.id)}
                    >
                      Opciones ▾
                    </button>

                    {menuAbierto === repuesto.id && (
                      <RepuestoMenuAcciones
                        posicion={menuPosicion}
                        onVer={() => { setMenuAbierto(null); onVer?.(repuesto); }}
                        onEditar={() => { setMenuAbierto(null); alert(`Editar repuesto: ${repuesto.nombre}`); }}
                        onHistorial={() => { setMenuAbierto(null); alert(`Historial de: ${repuesto.nombre}`); }}
                        onCambiarEstado={async (nuevoEstado: string) => {
                          setMenuAbierto(null);
                          try {
                            await actualizarRepuesto(repuesto.id, { estado: nuevoEstado as any });
                            await recargar();
                          } catch (err) {
                            console.error('Error al cambiar estado:', err);
                          }
                        }}
                        onEliminar={() => { setMenuAbierto(null); alert(`Eliminar repuesto: ${repuesto.id}`); }}
                        onCerrar={() => setMenuAbierto(null)}
                      />
                    )}
                  </div>
                </span>
              </div>
            );
          })}
      </div>

      {!loading && repuestosFiltrados.length > 0 && (
        <div className="repuestos-catalogo-footer">
          <span>
            {repuestosFiltrados.length} repuesto
            {repuestosFiltrados.length === 1 ? '' : 's'}
            {repuestosFiltrados.length !== repuestos.length && (
              <span className="repuestos-filtro-info">
                {' '}de {repuestos.length} totales
              </span>
            )}
          </span>
        </div>
      )}
    </div>
  );
}