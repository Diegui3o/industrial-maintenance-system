import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { exportarTablaExcel } from "../../utils/exportarExcel";
import {
  getEquipos,
  type Equipo,
} from "../../services/equiposApi";

import {
  getEquipoPlantaDetalle,
  type EquipoPlantaDetalle,
} from "../../services/plantaEquiposApi";

interface FilaEquipo {
  equipoId: number;
  codigo: string;
  nombre: string;
  fase: string;
  tipo: string;
  proceso: string;
  subproceso: string;
  componente: string;
  ip: string;
  estado: string;
}

const columnas = [
  { key: "codigo", label: "Código" },
  { key: "nombre", label: "Equipo" },
  { key: "fase", label: "Fase" },
  { key: "tipo", label: "Tipo" },
  { key: "proceso", label: "Proceso" },
  { key: "subproceso", label: "Subproceso" },
  { key: "componente", label: "Componente" },
  { key: "ip", label: "IP" },
  { key: "estado", label: "Estado" },
] as const;

type Columna = (typeof columnas)[number]["key"];

type Filtros = Partial<
  Record<Columna, Set<string>>
>;

function texto(valor: unknown): string {
  if (
    valor === null ||
    valor === undefined ||
    valor === ""
  ) {
    return "-";
  }

  return String(valor);
}

function crearFilas(
  equipos: Equipo[],
  detalles: EquipoPlantaDetalle[]
): FilaEquipo[] {
  const filas: FilaEquipo[] = [];

  equipos.forEach((equipo) => {
    const detalle = detalles.find(
      (item) => item.equipo.id === equipo.id
    );

  const componentesOriginales =
    detalle?.componentes ?? [];


  const componentes = componentesOriginales.filter(
    (componente) =>
      componente?.nombre !== null &&
      componente?.nombre !== undefined &&
      String(componente.nombre).trim() !== ""
  );

    const proceso =
      detalle?.proceso?.nombre ?? "-";

    const subproceso =
      detalle?.subproceso?.nombre ?? "-";

    if (componentes.length === 0) {
      filas.push({
        equipoId: equipo.id,
        codigo: texto(equipo.codigo),
        nombre: texto(equipo.nombre),
        fase: texto(equipo.fase),
        tipo: texto(equipo.tipo),
        proceso,
        subproceso,
        componente: "-",
        ip: texto(equipo.ip),
        estado: texto(equipo.estado_equipo),
      });

      return;
    }

    componentes.forEach((componente) => {
      filas.push({
        equipoId: equipo.id,
        codigo: texto(equipo.codigo),
        nombre: texto(equipo.nombre),
        fase: texto(equipo.fase),
        tipo: texto(equipo.tipo),
        proceso,
        subproceso,
        componente: texto(componente.nombre),
        ip: texto(equipo.ip),
        estado: texto(equipo.estado_equipo),
      });
    });
  });

  return filas;
}

export function EquiposLista() {
  const [equipos, setEquipos] =
    useState<Equipo[]>([]);

  const [detalles, setDetalles] =
    useState<EquipoPlantaDetalle[]>([]);

  const [loading, setLoading] =
    useState(true);

  const [error, setError] =
    useState("");

  const [filtros, setFiltros] =
    useState<Filtros>({});

  const [filtroAbierto, setFiltroAbierto] =
    useState<Columna | null>(null);

  const [busquedaFiltro, setBusquedaFiltro] =
    useState("");

  const [posicionFiltro, setPosicionFiltro] =
   useState({
      top: 0,
      left: 0,
   });

  const [menuFilaClave, setMenuFilaClave] =
    useState<string | null>(null);

  const [equipoEstado, setEquipoEstado] =
    useState<FilaEquipo | null>(null);

  const [nuevoEstado, setNuevoEstado] =
    useState('activo');

  const [motivoEstado, setMotivoEstado] =
    useState('');

  const [guardandoEstado, setGuardandoEstado] =
    useState(false);

  const navigate = useNavigate();

  const abrirCambioEstado = (
    fila: FilaEquipo,
    estadoInicial?: string
  ) => {
    setMenuFilaClave(null);

    setEquipoEstado(fila);
    setNuevoEstado(
      estadoInicial ?? fila.estado
    );
    setMotivoEstado('');
  };

  const cambiarEstadoEquipo = async () => {
    if (!equipoEstado) {
      return;
    }

    if (!motivoEstado.trim()) {
      return;
    }

    setGuardandoEstado(true);

    try {
      const res = await fetch(
        `/api/equipos/${equipoEstado.equipoId}/estado`,
        {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            estado: nuevoEstado,
            motivo: motivoEstado.trim(),
          }),
        }
      );

      if (!res.ok) {
        const texto = await res.text();

        throw new Error(
          texto ||
            'No se pudo cambiar el estado del equipo.'
        );
      }

      setEquipos((actuales) =>
        actuales.map((equipo) =>
          equipo.id === equipoEstado.equipoId
            ? {
                ...equipo,
                estado_equipo: nuevoEstado,
              }
            : equipo
        )
      );

      setEquipoEstado(null);
    } catch (error) {
      console.error(
        'Error cambiando estado:',
        error
      );

      window.alert(
        'No se pudo cambiar el estado del equipo.'
      );
    } finally {
      setGuardandoEstado(false);
    }
  };

  useEffect(() => {
    const cerrarMenus = (event: MouseEvent) => {
      const target = event.target as HTMLElement;

      if (
        !target.closest('.planta-equipos-opciones-wrap')
      ) {
        setMenuFilaClave(null);
      }
    };

    document.addEventListener(
      'mousedown',
      cerrarMenus
    );

    return () => {
      document.removeEventListener(
        'mousedown',
        cerrarMenus
      );
    };
  }, []);

  useEffect(() => {
    let activo = true;

    async function cargar() {
      try {
        setLoading(true);
        setError("");

        const lista = await getEquipos();

        if (!activo) return;

        setEquipos(lista);

        const resultados =
          await Promise.all(
            lista.map(async (equipo) => {
              try {
                return await getEquipoPlantaDetalle(
                  equipo.id
                );
              } catch {
                return null;
              }
            })
          );

        if (!activo) return;

        setDetalles(
          resultados.filter(
            (
              detalle
            ): detalle is EquipoPlantaDetalle =>
              detalle !== null
          )
        );
      } catch (err) {
        if (activo) {
          setError(
            err instanceof Error
              ? err.message
              : "Error cargando equipos"
          );
        }
      } finally {
        if (activo) {
          setLoading(false);
        }
      }
    }

    cargar();

    return () => {
      activo = false;
    };
  }, []);

  const filas = useMemo(
    () => {
      const resultado = crearFilas(
        equipos,
        detalles
      );
      return resultado;
    },
    [equipos, detalles]
  );

  const valoresPorColumna =
    useMemo(() => {
      const resultado =
        {} as Record<
          Columna,
          string[]
        >;

      columnas.forEach((columna) => {
        resultado[columna.key] =
          Array.from(
            new Set(
              filas.map(
                (fila) =>
                  fila[columna.key]
              )
            )
          ).sort((a, b) =>
            a.localeCompare(
              b,
              "es",
              {
                numeric: true,
                sensitivity: "base",
              }
            )
          );
      });

      return resultado;
    }, [filas]);

  const filasFiltradas =
    useMemo(() => {
      return filas.filter((fila) =>
        columnas.every((columna) => {
          const seleccion =
            filtros[columna.key];

          if (
            !seleccion ||
            seleccion.size === 0
          ) {
            return true;
          }

          return seleccion.has(
            fila[columna.key]
          );
        })
      );
    }, [filas, filtros]);

   function descargarExcel() {
   const datos = filasFiltradas.map(
      (fila) => [
         fila.codigo,
         fila.nombre,
         fila.fase,
         fila.tipo,
         fila.proceso,
         fila.subproceso,
         fila.componente,
         fila.ip,
         fila.estado,
      ]
   );

   exportarTablaExcel(
      "equipos_planta",
      [
         "Código",
         "Equipo",
         "Fase",
         "Tipo",
         "Proceso",
         "Subproceso",
         "Componente",
         "IP",
         "Estado",
      ],
      datos
   );
   }
   
   function abrirFiltro(
   columna: Columna,
   evento: React.MouseEvent<HTMLButtonElement>
   ) {
   if (filtroAbierto === columna) {
      setFiltroAbierto(null);
      return;
   }

   const rect =
      evento.currentTarget.getBoundingClientRect();

   setPosicionFiltro({
      top: rect.bottom + 2,
      left: rect.left,
   });

   setFiltroAbierto(columna);
   setBusquedaFiltro("");
   }

  function seleccionarValor(
    columna: Columna,
    valor: string
  ) {
    setFiltros((actual) => {
      const nuevo = new Set(
        actual[columna] ?? []
      );

      if (nuevo.has(valor)) {
        nuevo.delete(valor);
      } else {
        nuevo.add(valor);
      }

      return {
        ...actual,
        [columna]:
          nuevo.size > 0
            ? nuevo
            : undefined,
      };
    });
  }

  function seleccionarTodos(
    columna: Columna
  ) {
    setFiltros((actual) => ({
      ...actual,
      [columna]: undefined,
    }));
  }

  function limpiarFiltros() {
    setFiltros({});
    setFiltroAbierto(null);
    setBusquedaFiltro("");
  }

  function estaFiltrado(
    columna: Columna
  ) {
    return Boolean(
      filtros[columna] &&
        filtros[columna]!.size > 0
    );
  }

  if (loading) {
    return (
      <div className="planta-lista-cargando">
        Cargando equipos y estructura...
      </div>
    );
  }

  if (error) {
    return (
      <div className="planta-lista-error">
        {error}
      </div>
    );
  }

  return (
    <section className="planta-lista planta-equipos-lista">

      <div className="planta-lista-header">
        <div>
          <h2>Catálogo de equipos</h2>

          <span>
            {filasFiltradas.length} registros ·{" "}
            {equipos.length} equipos
          </span>
        </div>

        <div className="planta-lista-acciones">
          <button
            type="button"
            className="planta-btn-excel"
            onClick={descargarExcel}
          >
            ↓ Excel
          </button>

          <button
            type="button"
            className="planta-lista-limpiar"
            onClick={limpiarFiltros}
          >
            Limpiar filtros
          </button>
        </div>
      </div>

      <div className="planta-table-wrapper planta-equipos-table-wrapper">
        <table className="planta-table planta-equipos-table">

          <thead>
            <tr>

              {columnas.map((columna) => {
                const valores =
                  valoresPorColumna[columna.key] ?? [];

                const valoresVisibles =
                  valores.filter((valor) =>
                    valor
                      .toLowerCase()
                      .includes(
                        busquedaFiltro.toLowerCase()
                      )
                  );

                const seleccion =
                  filtros[columna.key];

                return (
                  <th
                    key={columna.key}
                    className="planta-excel-th"
                  >
                    <button
                      type="button"
                      className={`planta-excel-filtro ${
                        estaFiltrado(columna.key)
                          ? "filtrado"
                          : ""
                      }`}
                      onClick={(e) =>
                        abrirFiltro(
                          columna.key,
                          e
                        )
                      }
                    >
                      <span>
                        {columna.label}
                      </span>

                      <span>▼</span>
                    </button>

                    {filtroAbierto ===
                      columna.key && (
                      <div
                        className="planta-excel-menu"
                        style={{
                          top: posicionFiltro.top,
                          left: posicionFiltro.left,
                        }}
                      >
                        <div className="planta-excel-menu-search">
                          <input
                            type="search"
                            autoFocus
                            value={busquedaFiltro}
                            onChange={(e) =>
                              setBusquedaFiltro(
                                e.target.value
                              )
                            }
                            placeholder="Buscar..."
                          />
                        </div>

                        <button
                          type="button"
                          className="planta-excel-todos"
                          onClick={() =>
                            seleccionarTodos(
                              columna.key
                            )
                          }
                        >
                          ☑ Seleccionar todo
                        </button>

                        <div className="planta-excel-valores">
                          {valoresVisibles.map(
                            (valor) => {
                              const marcado =
                                !seleccion ||
                                seleccion.has(
                                  valor
                                );

                              return (
                                <label
                                  key={valor}
                                  className="planta-excel-valor"
                                >
                                  <input
                                    type="checkbox"
                                    checked={marcado}
                                    onChange={() =>
                                      seleccionarValor(
                                        columna.key,
                                        valor
                                      )
                                    }
                                  />

                                  <span>
                                    {valor}
                                  </span>
                                </label>
                              );
                            }
                          )}
                        </div>

                        <div className="planta-excel-menu-footer">
                          <button
                            type="button"
                            onClick={() =>
                              setFiltroAbierto(null)
                            }
                          >
                            Aceptar
                          </button>

                          <button
                            type="button"
                            onClick={() => {
                              seleccionarTodos(
                                columna.key
                              );
                              setFiltroAbierto(null);
                            }}
                          >
                            Borrar filtro
                          </button>
                        </div>
                      </div>
                    )}
                  </th>
                );
              })}

              <th className="planta-excel-th planta-equipos-opciones-th">
                <span className="planta-equipos-opciones-titulo">
                  Opciones
                </span>
              </th>

            </tr>
          </thead>

          <tbody>
            {filasFiltradas.length === 0 ? (
              <tr>
                <td
                  colSpan={columnas.length + 1}
                  className="planta-table-empty"
                >
                  No se encontraron equipos.
                </td>
              </tr>
            ) : (
              filasFiltradas.map(
                (fila, index) => {
                  const filaClave =
                    `${fila.equipoId}-${fila.componente}-${index}`;

                  return (
                    <tr key={filaClave}>

                    <td className="planta-equipo-codigo">
                      {fila.codigo}
                    </td>

                    <td className="planta-equipo-nombre">
                      {fila.nombre}
                    </td>

                    <td>
                      {fila.fase}
                    </td>

                    <td>
                      {fila.tipo}
                    </td>

                    <td>
                      {fila.proceso}
                    </td>

                    <td>
                      {fila.subproceso}
                    </td>

                    <td className="planta-equipo-componente">
                      {fila.componente}
                    </td>

                    <td className="planta-equipo-ip">
                      {fila.ip}
                    </td>

                    <td>
                      {fila.estado !== "-" ? (
                        <span
                          className={`planta-equipo-estado planta-equipo-estado-${fila.estado
                            .toLowerCase()
                            .replace(/\s+/g, "_")}`}
                        >
                          {fila.estado}
                        </span>
                      ) : (
                        "-"
                      )}
                    </td>

                    <td className="planta-equipos-opciones">
                      <div className="planta-equipos-opciones-grupo">

                        <button
                          type="button"
                          className="planta-equipo-opcion planta-equipo-opcion-ver"
                          onClick={() =>
                            navigate(`/equipos/${fila.equipoId}`)
                          }
                        >
                          Ver
                        </button>

                        <button
                          type="button"
                          className="planta-equipo-opcion planta-equipo-opcion-editar"
                          onClick={() =>
                            navigate(`/equipos/${fila.equipoId}/editar`)
                          }
                        >
                          Editar
                        </button>

                        <div className="planta-equipo-estado-wrap">

                          <button
                            type="button"
                            className="planta-equipo-opcion planta-equipo-opcion-estado"
                            onClick={() =>
                              setMenuFilaClave((actual) =>
                                actual === filaClave
                                  ? null
                                  : filaClave
                              )
                            }
                          >
                            Estado
                            <span>▾</span>
                          </button>

                          {menuFilaClave === filaClave && (
                            <div className="planta-equipo-estado-menu">

                              <button
                                type="button"
                                onClick={() =>
                                  abrirCambioEstado(fila, "activo")
                                }
                              >
                                Activo
                              </button>

                              <button
                                type="button"
                                onClick={() =>
                                  abrirCambioEstado(fila, "inactivo")
                                }
                              >
                                Inactivo
                              </button>

                              <button
                                type="button"
                                onClick={() =>
                                  abrirCambioEstado(fila, "fallo")
                                }
                              >
                                Fallo
                              </button>

                              <button
                                type="button"
                                onClick={() =>
                                  abrirCambioEstado(
                                    fila,
                                    "mantenimiento"
                                  )
                                }
                              >
                                Mantenimiento
                                </button>

                              </div>
                            )}

                          </div>

                        </div>
                      </td>
                    </tr>
                  );
                }
              )
            )}
          </tbody>

        </table>
      </div>
            
      {equipoEstado && (
        <div
          className="planta-modal-overlay"
          onMouseDown={(event) => {
            if (
              event.target ===
              event.currentTarget
            ) {
              setEquipoEstado(null);
            }
          }}
        >
          <div className="planta-modal planta-estado-modal">

            <div className="planta-modal-header">

              <div>
                <span className="planta-section-label">
                  ESTADO DEL EQUIPO
                </span>

                <h3>
                  {equipoEstado.codigo}
                </h3>
              </div>

              <button
                type="button"
                className="planta-modal-close"
                onClick={() =>
                  setEquipoEstado(null)
                }
              >
                ×
              </button>

            </div>

            <div className="planta-estado-opciones">

              <label
                className={`planta-estado-opcion ${
                  nuevoEstado === "activo"
                    ? "selected"
                    : ""
                }`}
              >
                <input
                  type="radio"
                  name="estado-equipo"
                  value="activo"
                  checked={
                    nuevoEstado === "activo"
                  }
                  onChange={() =>
                    setNuevoEstado(
                      "activo"
                    )
                  }
                />

                <span>
                  <strong>Activo</strong>

                  <small>
                    El equipo está operativo.
                  </small>
                </span>
              </label>

              <label
                className={`planta-estado-opcion ${
                  nuevoEstado === "inactivo"
                    ? "selected"
                    : ""
                }`}
              >
                <input
                  type="radio"
                  name="estado-equipo"
                  value="inactivo"
                  checked={
                    nuevoEstado === "inactivo"
                  }
                  onChange={() =>
                    setNuevoEstado(
                      "inactivo"
                    )
                  }
                />

                <span>
                  <strong>Inactivo</strong>

                  <small>
                    Está fuera de operación.
                  </small>
                </span>
              </label>

              <label
                className={`planta-estado-opcion ${
                  nuevoEstado === "fallo"
                    ? "selected"
                    : ""
                }`}
              >
                <input
                  type="radio"
                  name="estado-equipo"
                  value="fallo"
                  checked={
                    nuevoEstado === "fallo"
                  }
                  onChange={() =>
                    setNuevoEstado(
                      "fallo"
                    )
                  }
                />

                <span>
                  <strong>Fallo</strong>

                  <small>
                    Presenta una avería o condición anormal.
                  </small>
                </span>
              </label>

              <label
                className={`planta-estado-opcion ${
                  nuevoEstado ===
                  "mantenimiento"
                    ? "selected"
                    : ""
                }`}
              >
                <input
                  type="radio"
                  name="estado-equipo"
                  value="mantenimiento"
                  checked={
                    nuevoEstado ===
                    "mantenimiento"
                  }
                  onChange={() =>
                    setNuevoEstado(
                      "mantenimiento"
                    )
                  }
                />

                <span>
                  <strong>
                    Mantenimiento
                  </strong>

                  <small>
                    Está siendo intervenido o inspeccionado.
                  </small>
                </span>
              </label>

            </div>

            <div className="planta-modal-field">

              <label>
                Motivo del cambio
              </label>

              <textarea
                value={motivoEstado}
                onChange={(e) =>
                  setMotivoEstado(
                    e.target.value
                  )
                }
                placeholder="Ingrese el motivo..."
                rows={4}
              />

            </div>

            <div className="planta-modal-actions">

              <button
                type="button"
                className="planta-modal-btn-secondary"
                onClick={() =>
                  setEquipoEstado(null)
                }
              >
                Cancelar
              </button>

              <button
                type="button"
                className="planta-modal-btn-primary"
                disabled={
                  guardandoEstado ||
                  !motivoEstado.trim()
                }
                onClick={
                  cambiarEstadoEquipo
                }
              >
                {guardandoEstado
                  ? "Guardando..."
                  : "Guardar estado"}
              </button>

            </div>

          </div>
        </div>
      )}

    </section>
  );
}