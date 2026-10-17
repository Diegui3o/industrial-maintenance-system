import { useEffect, useMemo, useRef, useState } from 'react';

import {
  getProcesos,
  getSistemas,
  getTodosSubprocesos,
  getTodosSubprocesosSistema,
  type Proceso,
  type SistemaPlanta,
  type Subproceso,
  type SubprocesoSistemaPlanta,
} from '../../services/plantaApi';

import {
  SubprocesoEditorForm,
  type SubprocesoEditable,
} from './SubprocesoEditorForm';

import './SubprocesosCatalogo.css';

import {
  type SubprocesoCatalogo,
} from './subprocesosTipos';

interface Props {
  onRelacionarProceso?: (
    subproceso: SubprocesoCatalogo
  ) => void;

  onRelacionarSistema?: (
    subproceso: SubprocesoCatalogo
  ) => void;
}

export function SubprocesosCatalogo({
  onRelacionarProceso,
  onRelacionarSistema,
}: Props) {
  const [procesos, setProcesos] =
    useState<Proceso[]>([]);

  const [sistemas, setSistemas] =
    useState<SistemaPlanta[]>([]);

  const [subprocesosProceso, setSubprocesosProceso] =
    useState<Subproceso[]>([]);

  const [subprocesosSistema, setSubprocesosSistema] =
    useState<SubprocesoSistemaPlanta[]>([]);

  const [busqueda, setBusqueda] = useState('');
  const [loading, setLoading] = useState(true);
  const [mensaje, setMensaje] = useState('');

  const [menuAbierto, setMenuAbierto] =
    useState<string | null>(null);

  const [, setMenuPosicion] =
    useState({ top: 0, left: 0 });

  const menuBotonRef =
    useRef<HTMLButtonElement | null>(null);

  const [editando, setEditando] =
    useState<SubprocesoCatalogo | null>(null);

  const [guardando, setGuardando] =
    useState(false);

  const cargar = async () => {
    setLoading(true);
    setMensaje('');

    try {
      const [
        procesosResultado,
        sistemasResultado,
        procesosSubResultado,
        sistemasSubResultado,
      ] = await Promise.all([
        getProcesos(),
        getSistemas(),
        getTodosSubprocesos(),
        getTodosSubprocesosSistema(),
      ]);

      setProcesos(procesosResultado);
      setSistemas(sistemasResultado);
      setSubprocesosProceso(
        procesosSubResultado
      );
      setSubprocesosSistema(
        sistemasSubResultado
      );
    } catch (error) {
      console.error(
        'Error cargando catálogo:',
        error
      );

      setMensaje(
        'No se pudo cargar el catálogo de subprocesos.'
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    void cargar();
  }, []);

  const filas = useMemo<SubprocesoCatalogo[]>(() => {
    const mapaProcesos = new Map(
      procesos.map((item) => [
        item.id,
        item.nombre,
      ])
    );

    const mapaSistemas = new Map(
      sistemas.map((item) => [
        item.id,
        item.nombre,
      ])
    );

    const procesoFilas =
      subprocesosProceso.map((item) => ({
        clave: `proceso-${item.id}`,
        tipo: 'proceso' as const,
        id: item.id,
        nombre: item.nombre,
        descripcion: item.descripcion,
        activo: item.activo,
        procesoId: item.proceso_id ?? null,
        sistemaId: null,
        procesoNombre:
          item.proceso_id
            ? mapaProcesos.get(
                item.proceso_id
              ) ?? 'Sin proceso'
            : 'Sin proceso',
        sistemaNombre: '—',
      }));

    const sistemaFilas =
      subprocesosSistema.map((item) => ({
        clave: `sistema-${item.id}`,
        tipo: 'sistema' as const,
        id: item.id,
        nombre: item.nombre,
        descripcion: item.descripcion,
        activo: item.activo,
        procesoId: null,
        sistemaId:
          item.sistema_id ?? null,
        procesoNombre: '—',
        sistemaNombre:
          item.sistema_id
            ? mapaSistemas.get(
                item.sistema_id
              ) ?? 'Sin sistema'
            : 'Sin sistema',
      }));

    return [
      ...procesoFilas,
      ...sistemaFilas,
    ].sort((a, b) =>
      a.nombre.localeCompare(
        b.nombre,
        'es',
        { sensitivity: 'base' }
      )
    );
  }, [
    procesos,
    sistemas,
    subprocesosProceso,
    subprocesosSistema,
  ]);

  const filasFiltradas = useMemo(() => {
    const texto = busqueda
      .trim()
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '')
      .toLowerCase();

    if (!texto) {
      return filas;
    }

    return filas.filter((item) =>
      [
        item.nombre,
        item.descripcion ?? '',
        item.procesoNombre,
        item.sistemaNombre,
      ]
        .join(' ')
        .normalize('NFD')
        .replace(/[\u0300-\u036f]/g, '')
        .toLowerCase()
        .includes(texto)
    );
  }, [filas, busqueda]);

  function abrirMenu(
    evento: React.MouseEvent<HTMLButtonElement>,
    clave: string
  ) {
    menuBotonRef.current =
      evento.currentTarget;

    setMenuAbierto(
      menuAbierto === clave
        ? null
        : clave
    );
  }

  function actualizarPosicionMenu() {
    const boton = menuBotonRef.current;

    if (!boton) return;

    const rect =
      boton.getBoundingClientRect();

    const ancho = 190;
    const alto = 150;
    const margen = 8;

    let left =
      rect.right - ancho;

    let top =
      rect.bottom + margen;

    if (left < margen) {
      left = margen;
    }

    if (
      left + ancho >
      window.innerWidth - margen
    ) {
      left =
        window.innerWidth -
        ancho -
        margen;
    }

    if (
      top + alto >
      window.innerHeight - margen
    ) {
      top =
        rect.top -
        alto -
        margen;
    }

    if (top < margen) {
      top = margen;
    }

    setMenuPosicion({
      top,
      left,
    });
  }

  useEffect(() => {
    const cerrarMenu = (event: MouseEvent) => {
      const target = event.target as HTMLElement;

      const dentroDeOpciones =
        target.closest(
          '.subprocesos-catalogo-options'
        );

      const dentroDelMenu =
        target.closest(
          '.planta-options-menu'
        );

      if (
        !dentroDeOpciones &&
        !dentroDelMenu
      ) {
        setMenuAbierto(null);
      }
    };

    const cerrarConEscape = (
      event: KeyboardEvent
    ) => {
      if (event.key === 'Escape') {
        setMenuAbierto(null);
      }
    };

    document.addEventListener(
      'mousedown',
      cerrarMenu
    );

    document.addEventListener(
      'keydown',
      cerrarConEscape
    );

    return () => {
      document.removeEventListener(
        'mousedown',
        cerrarMenu
      );

      document.removeEventListener(
        'keydown',
        cerrarConEscape
      );
    };
  }, []);

  useEffect(() => {
    if (!menuAbierto) return;

    actualizarPosicionMenu();

    const actualizar = () =>
      actualizarPosicionMenu();

    window.addEventListener(
      'scroll',
      actualizar,
      true
    );

    window.addEventListener(
      'resize',
      actualizar
    );

    return () => {
      window.removeEventListener(
        'scroll',
        actualizar,
        true
      );

      window.removeEventListener(
        'resize',
        actualizar
      );
    };
  }, [menuAbierto]);

  function editar(
    subproceso: SubprocesoCatalogo
  ) {
    setMenuAbierto(null);
    setMensaje('');
    setEditando(subproceso);
  }

  async function guardarEdicion(
    nombre: string,
    descripcion: string
  ) {
    if (!editando || guardando) {
      return;
    }

    setGuardando(true);
    setMensaje('');

    try {
      const endpoint =
        editando.tipo === 'proceso'
          ? `/api/planta/subprocesos/${editando.id}`
          : `/api/planta/subprocesos-sistema/${editando.id}`;

      const body =
        editando.tipo === 'proceso'
          ? {
              proceso_id:
                editando.procesoId,
              nombre,
              descripcion:
                descripcion || undefined,
              activo:
                editando.activo,
            }
          : {
              sistema_id:
                editando.sistemaId,
              nombre,
              descripcion:
                descripcion || undefined,
              activo:
                editando.activo,
            };

      const respuesta =
        await fetch(endpoint, {
          method: 'PUT',
          headers: {
            'Content-Type':
              'application/json',
          },
          body: JSON.stringify(body),
        });

      if (!respuesta.ok) {
        throw new Error(
          'No se pudo actualizar el subproceso.'
        );
      }

      setEditando(null);

      await cargar();

      setMensaje(
        'Subproceso actualizado correctamente.'
      );
    } catch (error) {
      console.error(
        'Error actualizando subproceso:',
        error
      );

      setMensaje(
        error instanceof Error
          ? error.message
          : 'No se pudo actualizar el subproceso.'
      );
    } finally {
      setGuardando(false);
    }
  }

  async function desactivar(
    subproceso: SubprocesoCatalogo
  ) {
    const confirmado =
      window.confirm(
        `¿Desactivar "${subproceso.nombre}"?\n\n` +
        'El registro se conservará para mantener el historial.'
      );

    if (!confirmado) return;

    try {
      const endpoint =
        subproceso.tipo === 'proceso'
          ? `/api/planta/subprocesos/${subproceso.id}`
          : `/api/planta/subprocesos-sistema/${subproceso.id}`;

      const body =
        subproceso.tipo === 'proceso'
          ? {
              proceso_id:
                subproceso.procesoId,
              nombre:
                subproceso.nombre,
              descripcion:
                subproceso.descripcion ||
                undefined,
              activo: false,
            }
          : {
              sistema_id:
                subproceso.sistemaId,
              nombre:
                subproceso.nombre,
              descripcion:
                subproceso.descripcion ||
                undefined,
              activo: false,
            };

      const respuesta =
        await fetch(endpoint, {
          method: 'PUT',
          headers: {
            'Content-Type':
              'application/json',
          },
          body: JSON.stringify(body),
        });

      if (!respuesta.ok) {
        throw new Error(
          'No se pudo desactivar el subproceso.'
        );
      }

      setMenuAbierto(null);

      await cargar();

      setMensaje(
        'Subproceso desactivado correctamente.'
      );
    } catch (error) {
      console.error(
        'Error desactivando subproceso:',
        error
      );

      setMensaje(
        error instanceof Error
          ? error.message
          : 'No se pudo desactivar el subproceso.'
      );
    }
  }

  const editable: SubprocesoEditable | null =
    editando
      ? {
          tipo: editando.tipo,
          id: editando.id,
          nombre: editando.nombre,
          descripcion:
            editando.descripcion,
          procesoId:
            editando.procesoId,
          sistemaId:
            editando.sistemaId,
          activo:
            editando.activo,
        }
      : null;

  return (
    <section className="subprocesos-catalogo">
        <div className="subprocesos-catalogo-header">
          <div>
            <span className="planta-section-label">
              CATÁLOGO
            </span>

            <h3>
              Subprocesos registrados
            </h3>

            <p>
              Consulte y gestione los subprocesos de la planta.
            </p>
          </div>

          <span className="subprocesos-catalogo-count">
            {filas.length}
          </span>
        </div>

        <div className="subprocesos-catalogo-search">
          <span>⌕</span>

          <input
            type="search"
            value={busqueda}
            onChange={(e) =>
              setBusqueda(e.target.value)
            }
            placeholder="Buscar subproceso, proceso o sistema..."
          />
        </div>

      {mensaje && (
        <div
          className="planta-alert"
          style={{ marginBottom: 16 }}
        >
          {mensaje}
        </div>
      )}

      {loading ? (
        <div className="planta-empty">
          Cargando subprocesos...
        </div>
      ) : (
        <div style={{ overflowX: 'auto' }}>
          <table
            className="subprocesos-catalogo-table"
            style={{
              width: '100%',
              borderCollapse:
                'collapse',
            }}
          >
            <thead>
              <tr>
                <th>Subproceso</th>
                <th>Tipo</th>
                <th>Padre</th>
                <th>Estado</th>
                <th>Opciones</th>
              </tr>
            </thead>

            <tbody>
              {filasFiltradas.map(
                (subproceso) => (
                  <tr
                    key={subproceso.clave}
                  >
                    <td>
                      <strong>
                        {
                          subproceso.nombre
                        }
                      </strong>

                      {subproceso.descripcion && (
                        <small
                          style={{
                            display:
                              'block',
                            marginTop: 3,
                          }}
                        >
                          {
                            subproceso.descripcion
                          }
                        </small>
                      )}
                    </td>

                    <td>
                      {subproceso.tipo ===
                      'proceso'
                        ? 'Proceso'
                        : 'Sistema'}
                    </td>

                    <td>
                      <div className="subprocesos-catalogo-padre">
                        <small>
                          {subproceso.tipo === 'proceso'
                            ? 'Proceso'
                            : 'Sistema'}
                        </small>

                        <strong>
                          {subproceso.tipo === 'proceso'
                            ? subproceso.procesoNombre
                            : subproceso.sistemaNombre}
                        </strong>
                      </div>
                    </td>

                    <td>
                      <span
                        className={`planta-status ${
                          subproceso.activo
                            ? 'linked'
                            : 'available'
                        }`}
                      >
                        {subproceso.activo
                          ? 'Activo'
                          : 'Inactivo'}
                      </span>
                    </td>

                    <td className="subprocesos-catalogo-options">
                      <div className="subprocesos-catalogo-menu-wrap">
                        <button
                          type="button"
                          className="planta-options-btn"
                          onClick={(e) =>
                            abrirMenu(e, subproceso.clave)
                          }
                        >
                          Opciones ▾
                        </button>

                        {menuAbierto === subproceso.clave && (
                          <div className="subprocesos-catalogo-menu">
                            <button
                              type="button"
                              onClick={() => {
                                setMenuAbierto(null);
                                editar(subproceso);
                              }}
                            >
                              Editar
                            </button>

                            <button
                              type="button"
                              onClick={() => {
                                setMenuAbierto(null);

                                if (subproceso.tipo === 'proceso') {
                                  onRelacionarProceso?.(subproceso);
                                } else {
                                  onRelacionarSistema?.(subproceso);
                                }
                              }}
                            >
                              Relacionar
                            </button>

                            <button
                              type="button"
                              onClick={() => {
                                setMenuAbierto(null);
                                void desactivar(subproceso);
                              }}
                            >
                              Desactivar
                            </button>
                          </div>
                        )}
                      </div>
                    </td>
                  </tr>
                )
              )}
            </tbody>
          </table>
        </div>
      )}

      {editable && (
        <SubprocesoEditorForm
          subproceso={editable}
          guardando={guardando}
          onGuardar={guardarEdicion}
          onCancelar={() => {
            if (!guardando) {
              setEditando(null);
            }
          }}
        />
      )}
    </section>
  );
}