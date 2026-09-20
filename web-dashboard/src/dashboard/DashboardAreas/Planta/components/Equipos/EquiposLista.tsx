import { useEffect, useMemo, useState } from "react";

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

    const componentes =
      detalle?.componentes ?? [];

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
    () =>
      crearFilas(
        equipos,
        detalles
      ),
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

  function abrirFiltro(
    columna: Columna
  ) {
    if (
      filtroAbierto === columna
    ) {
      setFiltroAbierto(null);
      return;
    }

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
          <h2>Equipos</h2>

          <span>
            {filasFiltradas.length} registros ·{" "}
            {equipos.length} equipos
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

      <div className="planta-table-wrapper planta-equipos-table-wrapper">
        <table className="planta-table planta-equipos-table">
          <thead>
            <tr>
              {columnas.map((columna) => {
                const valores =
                  valoresPorColumna[
                    columna.key
                  ] ?? [];

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
                  <th key={columna.key}>
                    <button
                      type="button"
                      className={`planta-excel-filtro ${
                        estaFiltrado(
                          columna.key
                        )
                          ? "filtrado"
                          : ""
                      }`}
                      onClick={() =>
                        abrirFiltro(
                          columna.key
                        )
                      }
                    >
                      <span>
                        {columna.label}
                      </span>

                      <span>
                        ▼
                      </span>
                    </button>

                    {filtroAbierto ===
                      columna.key && (
                      <div className="planta-excel-menu">
                        <div className="planta-excel-menu-search">
                          <input
                            type="search"
                            autoFocus
                            value={
                              busquedaFiltro
                            }
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
                                    checked={
                                      marcado
                                    }
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
                              setFiltroAbierto(
                                null
                              )
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
                              setFiltroAbierto(
                                null
                              );
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
            </tr>
          </thead>

          <tbody>
            {filasFiltradas.length === 0 ? (
              <tr>
                <td
                  colSpan={
                    columnas.length
                  }
                  className="planta-table-empty"
                >
                  No se encontraron equipos.
                </td>
              </tr>
            ) : (
              filasFiltradas.map(
                (fila, index) => (
                  <tr
                    key={`${fila.equipoId}-${fila.componente}-${index}`}
                  >
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
                      {fila.estado !==
                      "-" ? (
                        <span
                          className={`planta-equipo-estado planta-equipo-estado-${fila.estado
                            .toLowerCase()
                            .replace(
                              /\s+/g,
                              "_"
                            )}`}
                        >
                          {fila.estado}
                        </span>
                      ) : (
                        "-"
                      )}
                    </td>
                  </tr>
                )
              )
            )}
          </tbody>
        </table>
      </div>
    </section>
  );
}