import { useEffect, useMemo, useState } from "react";

import {
  listarTodosLosMantenimientos,
} from "../../../../services/mantenimientoApi";

interface Mantenimiento {
  id: number;
  equipo_id: number;
  usuario_id?: number | null;

  fecha_reporte?: string | null;

  fase?: string | null;
  taller?: string | null;
  tipo_criticidad?: string | null;
  sistema?: string | null;

  inicio_parada?: string | null;
  fin_parada?: string | null;
  horas?: number | null;

  tipo_intervencion?: string | null;
  modo_falla?: string | null;

  consecuencia_inmediata?: string | null;
  descripcion_evento?: string | null;

  stand_by?: boolean | null;
  produccion_afectada?: boolean | null;
  tn_dejadas_procesar?: number | null;

  estado_falla?: string | null;

  prioridad?: string | null;
  causa?: string | null;
  accion_realizada?: string | null;
  consecuencia?: string | null;

  tipo_programacion?: string | null;
  fecha_programada?: string | null;

  horas_planificadas?: number | null;
  hh_planificadas?: number | null;
  horas_ejecutadas?: number | null;
  hh_ejecutadas?: number | null;

  porcentaje_avance?: number | null;

  creado_en?: string | null;
  actualizado_en?: string | null;
}

type Filtros = Record<string, string>;

function valor(
  dato: unknown
): string {
  if (
    dato === null ||
    dato === undefined ||
    dato === ""
  ) {
    return "-";
  }

  if (typeof dato === "boolean") {
    return dato ? "Sí" : "No";
  }

  return String(dato);
}

function fecha(
  dato: string | null | undefined
): string {
  if (!dato) {
    return "-";
  }

  return new Date(dato).toLocaleString("es-PE");
}

export function MantenimientosLista() {
  const [mantenimientos, setMantenimientos] =
    useState<Mantenimiento[]>([]);

  const [loading, setLoading] =
    useState(true);

  const [error, setError] =
    useState("");

  const [filtros, setFiltros] =
    useState<Filtros>({});

  useEffect(() => {
    let activo = true;

    async function cargar() {
      try {
        setLoading(true);
        setError("");

        const resultado =
          await listarTodosLosMantenimientos();

        if (activo) {
          setMantenimientos(
            Array.isArray(resultado)
              ? resultado
              : []
          );
        }
      } catch (err) {
        if (activo) {
          setError(
            err instanceof Error
              ? err.message
              : "Error cargando mantenimientos"
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

  const columnas = [
    {
      key: "id",
      label: "ID",
    },
    {
      key: "equipo_id",
      label: "Equipo",
    },
    {
      key: "fecha_reporte",
      label: "Fecha reporte",
    },
    {
      key: "fase",
      label: "Fase",
    },
    {
      key: "taller",
      label: "Taller",
    },
    {
      key: "sistema",
      label: "Sistema",
    },
    {
      key: "tipo_criticidad",
      label: "Criticidad",
    },
    {
      key: "tipo_intervencion",
      label: "Intervención",
    },
    {
      key: "modo_falla",
      label: "Modo falla",
    },
    {
      key: "prioridad",
      label: "Prioridad",
    },
    {
      key: "estado_falla",
      label: "Estado",
    },
    {
      key: "inicio_parada",
      label: "Inicio parada",
    },
    {
      key: "fin_parada",
      label: "Fin parada",
    },
    {
      key: "horas",
      label: "Horas parada",
    },
    {
      key: "produccion_afectada",
      label: "Producción afectada",
    },
    {
      key: "tn_dejadas_procesar",
      label: "TN dejadas",
    },
    {
      key: "porcentaje_avance",
      label: "Avance",
    },
    {
      key: "tipo_programacion",
      label: "Programación",
    },
    {
      key: "fecha_programada",
      label: "Fecha programada",
    },
    {
      key: "horas_planificadas",
      label: "Horas planificadas",
    },
    {
      key: "hh_planificadas",
      label: "HH planificadas",
    },
    {
      key: "horas_ejecutadas",
      label: "Horas ejecutadas",
    },
    {
      key: "hh_ejecutadas",
      label: "HH ejecutadas",
    },
  ];

  const mantenimientosFiltrados =
    useMemo(() => {
      return mantenimientos.filter(
        (item) => {
          return columnas.every(
            (columna) => {
              const filtro =
                filtros[columna.key];

              if (!filtro) {
                return true;
              }

              const dato =
                item[
                  columna.key as keyof Mantenimiento
                ];

              return valor(dato)
                .toLowerCase()
                .includes(
                  filtro.toLowerCase()
                );
            }
          );
        }
      );
    }, [mantenimientos, filtros]);

  function cambiarFiltro(
    columna: string,
    texto: string
  ) {
    setFiltros((actual) => ({
      ...actual,
      [columna]: texto,
    }));
  }

  function limpiarFiltros() {
    setFiltros({});
  }

  if (loading) {
    return (
      <div className="planta-lista-cargando">
        Cargando mantenimientos...
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
    <section className="planta-lista">
      <div className="planta-lista-header">
        <div>
          <h2>Mantenimientos</h2>

          <span>
            {mantenimientosFiltrados.length} registros
          </span>
        </div>

        <button
          type="button"
          className="planta-lista-limpiar"
          onClick={limpiarFiltros}
        >
          Limpiar filtros
        </button>
      </div>

      <div className="planta-table-wrapper">
        <table className="planta-table">
          <thead>
            <tr>
              {columnas.map((columna) => (
                <th key={columna.key}>
                  <div className="planta-table-title">
                    {columna.label}
                  </div>

                  <input
                    type="search"
                    value={
                      filtros[columna.key] || ""
                    }
                    onChange={(e) =>
                      cambiarFiltro(
                        columna.key,
                        e.target.value
                      )
                    }
                    placeholder="Filtrar..."
                  />
                </th>
              ))}
            </tr>
          </thead>

          <tbody>
            {mantenimientosFiltrados.length ===
              0 && (
              <tr>
                <td
                  colSpan={columnas.length}
                  className="planta-table-empty"
                >
                  No se encontraron
                  mantenimientos.
                </td>
              </tr>
            )}

            {mantenimientosFiltrados.map(
              (item) => (
                <tr key={item.id}>
                  <td>{valor(item.id)}</td>

                  <td>
                    {valor(item.equipo_id)}
                  </td>

                  <td>
                    {valor(
                      item.fecha_reporte
                    )}
                  </td>

                  <td>
                    {valor(item.fase)}
                  </td>

                  <td>
                    {valor(item.taller)}
                  </td>

                  <td>
                    {valor(item.sistema)}
                  </td>

                  <td>
                    {valor(
                      item.tipo_criticidad
                    )}
                  </td>

                  <td>
                    {valor(
                      item.tipo_intervencion
                    )}
                  </td>

                  <td>
                    {valor(item.modo_falla)}
                  </td>

                  <td>
                    {valor(item.prioridad)}
                  </td>

                  <td>
                    <span
                      className={`planta-estado planta-estado-${String(
                        item.estado_falla ||
                          "sin_estado"
                      ).toLowerCase()}`}
                    >
                      {valor(
                        item.estado_falla
                      )}
                    </span>
                  </td>

                  <td>
                    {fecha(
                      item.inicio_parada
                    )}
                  </td>

                  <td>
                    {fecha(
                      item.fin_parada
                    )}
                  </td>

                  <td>
                    {valor(item.horas)}
                  </td>

                  <td>
                    {valor(
                      item.produccion_afectada
                    )}
                  </td>

                  <td>
                    {valor(
                      item.tn_dejadas_procesar
                    )}
                  </td>

                  <td>
                    {valor(
                      item.porcentaje_avance
                    )}
                    {item.porcentaje_avance !==
                      null &&
                      item.porcentaje_avance !==
                        undefined
                      ? "%"
                      : ""}
                  </td>

                  <td>
                    {valor(
                      item.tipo_programacion
                    )}
                  </td>

                  <td>
                    {valor(
                      item.fecha_programada
                    )}
                  </td>

                  <td>
                    {valor(
                      item.horas_planificadas
                    )}
                  </td>

                  <td>
                    {valor(
                      item.hh_planificadas
                    )}
                  </td>

                  <td>
                    {valor(
                      item.horas_ejecutadas
                    )}
                  </td>

                  <td>
                    {valor(
                      item.hh_ejecutadas
                    )}
                  </td>
                </tr>
              )
            )}
          </tbody>
        </table>
      </div>
    </section>
  );
}