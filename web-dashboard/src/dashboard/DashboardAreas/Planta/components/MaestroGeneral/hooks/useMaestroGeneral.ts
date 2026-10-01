import {
  useCallback,
  useEffect,
  useMemo,
  useState,
} from 'react';

import {
  getMasterGeneral,
  type MaestroGeneralItem,
} from '../../../services/plantaMasterGeneralApi';

import type {
  ColumnaFiltro,
  FiltroColumna,
  FiltrosColumnas,
  FiltrosEstructura,
} from '../types/maestroGeneralTypes';

function normalizarTexto(
  valor: string | null | undefined,
): string {
  return (valor ?? '')
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
    .trim();
}

function textoEquipo(
  item: MaestroGeneralItem,
): string {
  return [
    item.equipo_codigo,
    item.equipo_nombre,
  ]
    .filter(
      (valor): valor is string =>
        valor !== null &&
        valor !== undefined &&
        valor.trim() !== '',
    )
    .join(' ');
}

function textoComponente(
  item: MaestroGeneralItem,
): string {
  return [
    item.componente_codigo,
    item.componente_tag,
    item.componente_nombre,
  ]
    .filter(
      (valor): valor is string =>
        valor !== null &&
        valor !== undefined &&
        valor.trim() !== '',
    )
    .join(' ');
}

function textoRepuesto(
  item: MaestroGeneralItem,
): string {
  return item.repuesto_nombre ?? '';
}

function textoColumna(
  item: MaestroGeneralItem,
  columna: ColumnaFiltro,
): string {
  switch (columna) {
    case 'fase':
      return item.fase ?? '';

    case 'proceso':
      return item.proceso ?? '';

    case 'subproceso':
      return item.subproceso ?? '';

    case 'equipo':
      return textoEquipo(item);

    case 'componente':
      return textoComponente(item);

    case 'repuesto':
      return textoRepuesto(item);

    default:
      return '';
  }
}

function crearFiltroColumna(): FiltroColumna {
  return {
    abierto: false,
    busqueda: '',
    seleccionados: [],
    orden: null,
  };
}

function crearFiltrosColumnas(): FiltrosColumnas {
  return {
    fase: crearFiltroColumna(),
    proceso: crearFiltroColumna(),
    subproceso: crearFiltroColumna(),
    equipo: crearFiltroColumna(),
    componente: crearFiltroColumna(),
    repuesto: crearFiltroColumna(),
  };
}

const FILTROS_ESTRUCTURA_INICIALES: FiltrosEstructura = {
  fase: '',
  proceso: '',
  subproceso: '',
  equipo: '',
  componente: '',
};

export function useMaestroGeneral() {
  const [datos, setDatos] = useState<
    MaestroGeneralItem[]
  >([]);

  const [cargando, setCargando] =
    useState<boolean>(true);

  const [error, setError] =
    useState<string | null>(null);

  const [
    filtrosEstructura,
    setFiltrosEstructura,
  ] = useState<FiltrosEstructura>(
    FILTROS_ESTRUCTURA_INICIALES,
  );

  const [
    filtrosColumnas,
    setFiltrosColumnas,
  ] = useState<FiltrosColumnas>(
    crearFiltrosColumnas(),
  );

  const [busqueda, setBusqueda] =
    useState<string>('');

  const cargarDatos = useCallback(async () => {
    try {
      setCargando(true);
      setError(null);

      const resultado =
        await getMasterGeneral();

      setDatos(resultado);
    } catch (err) {
      console.error(
        'Error cargando Maestro General:',
        err,
      );

      setError(
        'No se pudo cargar el Maestro General.',
      );
    } finally {
      setCargando(false);
    }
  }, []);

  useEffect(() => {
    void cargarDatos();
  }, [cargarDatos]);

  /*
   * ============================================================
   * VALORES PARA LOS FILTROS SUPERIORES
   * ============================================================
   */

  const fases = useMemo<string[]>(() => {
    return [...new Set(
      datos
        .map((item) => item.fase)
        .filter(
          (valor): valor is string =>
            valor !== null &&
            valor.trim() !== '',
        ),
    )].sort((a, b) =>
      normalizarTexto(a).localeCompare(
        normalizarTexto(b),
        'es',
      ),
    );
  }, [datos]);

  const procesos = useMemo<string[]>(() => {
    return [...new Set(
      datos
        .map((item) => item.proceso)
        .filter(
          (valor): valor is string =>
            valor !== null &&
            valor.trim() !== '',
        ),
    )].sort((a, b) =>
      normalizarTexto(a).localeCompare(
        normalizarTexto(b),
        'es',
      ),
    );
  }, [datos]);

  const subprocesos = useMemo<string[]>(() => {
    return [...new Set(
      datos
        .map((item) => item.subproceso)
        .filter(
          (valor): valor is string =>
            valor !== null &&
            valor.trim() !== '',
        ),
    )].sort((a, b) =>
      normalizarTexto(a).localeCompare(
        normalizarTexto(b),
        'es',
      ),
    );
  }, [datos]);

  const equipos = useMemo<string[]>(() => {
    const mapa = new Map<string, string>();

    datos.forEach((item) => {
      const valor = textoEquipo(item);

      if (!valor) {
        return;
      }

      const clave =
        normalizarTexto(valor);

      if (!mapa.has(clave)) {
        mapa.set(clave, valor);
      }
    });

    return [...mapa.values()].sort((a, b) =>
      normalizarTexto(a).localeCompare(
        normalizarTexto(b),
        'es',
      ),
    );
  }, [datos]);

  const componentes = useMemo<string[]>(() => {
    const mapa = new Map<string, string>();

    datos.forEach((item) => {
      const valor =
        textoComponente(item);

      if (!valor) {
        return;
      }

      const clave =
        normalizarTexto(valor);

      if (!mapa.has(clave)) {
        mapa.set(clave, valor);
      }
    });

    return [...mapa.values()].sort((a, b) =>
      normalizarTexto(a).localeCompare(
        normalizarTexto(b),
        'es',
      ),
    );
  }, [datos]);

  /*
   * ============================================================
   * FILTROS DE ESTRUCTURA
   *
   * SON INDEPENDIENTES.
   * ============================================================
   */

  const cambiarFase = useCallback(
    (valor: string) => {
      setFiltrosEstructura((actual) => ({
        ...actual,
        fase: valor,
      }));
    },
    [],
  );

  const cambiarProceso = useCallback(
    (valor: string) => {
      setFiltrosEstructura((actual) => ({
        ...actual,
        proceso: valor,
      }));
    },
    [],
  );

  const cambiarSubproceso =
    useCallback(
      (valor: string) => {
        setFiltrosEstructura(
          (actual) => ({
            ...actual,
            subproceso: valor,
          }),
        );
      },
      [],
    );

  const cambiarEquipo = useCallback(
    (valor: string) => {
      setFiltrosEstructura((actual) => ({
        ...actual,
        equipo: valor,
      }));
    },
    [],
  );

  const cambiarComponente =
    useCallback(
      (valor: string) => {
        setFiltrosEstructura(
          (actual) => ({
            ...actual,
            componente: valor,
          }),
        );
      },
      [],
    );

  /*
   * ============================================================
   * FILTROS EXCEL
   * ============================================================
   */

  const alternarFiltroColumna =
    useCallback(
      (columna: ColumnaFiltro) => {
        setFiltrosColumnas(
          (actual) => ({
            ...actual,
            [columna]: {
              ...actual[columna],
              abierto:
                !actual[columna].abierto,
            },
          }),
        );
      },
      [],
    );

  const cambiarBusquedaColumna =
    useCallback(
      (
        columna: ColumnaFiltro,
        valor: string,
      ) => {
        setFiltrosColumnas(
          (actual) => ({
            ...actual,
            [columna]: {
              ...actual[columna],
              busqueda: valor,
            },
          }),
        );
      },
      [],
    );

  const alternarValorColumna =
    useCallback(
      (
        columna: ColumnaFiltro,
        valor: string,
      ) => {
        setFiltrosColumnas(
          (actual) => {
            const filtro =
              actual[columna];

            const existe =
              filtro.seleccionados.some(
                (seleccionado) =>
                  normalizarTexto(
                    seleccionado,
                  ) ===
                  normalizarTexto(
                    valor,
                  ),
              );

            const seleccionados =
              existe
                ? filtro.seleccionados.filter(
                    (seleccionado) =>
                      normalizarTexto(
                        seleccionado,
                      ) !==
                      normalizarTexto(
                        valor,
                      ),
                  )
                : [
                    ...filtro.seleccionados,
                    valor,
                  ];

            return {
              ...actual,
              [columna]: {
                ...filtro,
                seleccionados,
              },
            };
          },
        );
      },
      [],
    );

  const ordenarColumna =
    useCallback(
      (
        columna: ColumnaFiltro,
        orden: 'asc' | 'desc',
      ) => {
        setFiltrosColumnas(
          (actual) => ({
            ...actual,
            [columna]: {
              ...actual[columna],
              orden,
            },
          }),
        );
      },
      [],
    );

  const limpiarFiltroColumna =
    useCallback(
      (columna: ColumnaFiltro) => {
        setFiltrosColumnas(
          (actual) => ({
            ...actual,
            [columna]: {
              ...crearFiltroColumna(),
            },
          }),
        );
      },
      [],
    );

  /*
   * ============================================================
   * DATOS FILTRADOS
   * ============================================================
   */

  const datosFiltrados =
    useMemo<MaestroGeneralItem[]>(() => {
      let resultado = datos.filter(
        (item) => {
          /*
           * ------------------------------------------
           * FASE
           * ------------------------------------------
           */

          if (
            filtrosEstructura.fase &&
            normalizarTexto(
              item.fase,
            ) !==
              normalizarTexto(
                filtrosEstructura.fase,
              )
          ) {
            return false;
          }

          /*
           * ------------------------------------------
           * PROCESO
           * ------------------------------------------
           */

          if (
            filtrosEstructura.proceso &&
            normalizarTexto(
              item.proceso,
            ) !==
              normalizarTexto(
                filtrosEstructura.proceso,
              )
          ) {
            return false;
          }

          /*
           * ------------------------------------------
           * SUBPROCESO
           * ------------------------------------------
           */

          if (
            filtrosEstructura.subproceso &&
            normalizarTexto(
              item.subproceso,
            ) !==
              normalizarTexto(
                filtrosEstructura.subproceso,
              )
          ) {
            return false;
          }

          /*
           * ------------------------------------------
           * EQUIPO
           *
           * Búsqueda por código + nombre.
           * ------------------------------------------
           */

          if (
            filtrosEstructura.equipo
          ) {
            const termino =
              normalizarTexto(
                filtrosEstructura.equipo,
              );

            const valor =
              normalizarTexto(
                textoEquipo(item),
              );

            if (
              !valor.includes(termino)
            ) {
              return false;
            }
          }

          /*
           * ------------------------------------------
           * COMPONENTE
           *
           * Por ahora busca sobre:
           * código + TAG + nombre.
           *
           * Los campos adicionales:
           * Código SAP
           * Tipo
           * Marca
           * Modelo
           * N° Serie
           *
           * se incorporarán cuando el endpoint
           * del Maestro General los exponga.
           * ------------------------------------------
           */

          if (
            filtrosEstructura.componente
          ) {
            const termino =
              normalizarTexto(
                filtrosEstructura.componente,
              );

            const valor =
              normalizarTexto(
                textoComponente(item),
              );

            if (
              !valor.includes(termino)
            ) {
              return false;
            }
          }

          /*
           * ------------------------------------------
           * BÚSQUEDA GENERAL
           * ------------------------------------------
           */

          if (busqueda.trim()) {
            const termino =
              normalizarTexto(
                busqueda,
              );

            const textoCompleto =
              normalizarTexto(
                [
                  item.fase,
                  item.proceso,
                  item.subproceso,
                  item.equipo_codigo,
                  item.equipo_nombre,
                  item.componente_codigo,
                  item.componente_tag,
                  item.componente_nombre,
                  item.repuesto_nombre,
                ]
                  .filter(Boolean)
                  .join(' '),
              );

            if (
              !textoCompleto.includes(
                termino,
              )
            ) {
              return false;
            }
          }

          /*
           * ------------------------------------------
           * FILTROS EXCEL POR COLUMNA
           * ------------------------------------------
           */

          const columnas: ColumnaFiltro[] =
            [
              'fase',
              'proceso',
              'subproceso',
              'equipo',
              'componente',
              'repuesto',
            ];

          for (const columna of columnas) {
            const filtro =
              filtrosColumnas[columna];

            /*
             * Búsqueda escrita dentro del
             * filtro Excel.
             */

            if (
              filtro.busqueda.trim()
            ) {
              const termino =
                normalizarTexto(
                  filtro.busqueda,
                );

              const valor =
                normalizarTexto(
                  textoColumna(
                    item,
                    columna,
                  ),
                );

              if (
                !valor.includes(
                  termino,
                )
              ) {
                return false;
              }
            }

            /*
             * Valores seleccionados
             * en el filtro Excel.
             */

            if (
              filtro.seleccionados
                .length > 0
            ) {
              const valor =
                normalizarTexto(
                  textoColumna(
                    item,
                    columna,
                  ),
                );

              const coincide =
                filtro.seleccionados.some(
                  (seleccionado) =>
                    normalizarTexto(
                      seleccionado,
                    ) === valor,
                );

              if (!coincide) {
                return false;
              }
            }
          }

          return true;
        },
      );

      /*
       * ========================================================
       * ORDENAMIENTO
       *
       * Se utiliza la primera columna que
       * tenga un orden definido.
       * ========================================================
       */

      const columnaOrdenada =
        (
          [
            'fase',
            'proceso',
            'subproceso',
            'equipo',
            'componente',
            'repuesto',
          ] as ColumnaFiltro[]
        ).find(
          (columna) =>
            filtrosColumnas[columna]
              .orden !== null,
        );

      if (columnaOrdenada) {
        const orden =
          filtrosColumnas[
            columnaOrdenada
          ].orden;

        resultado = [
          ...resultado,
        ].sort((a, b) => {
          const valorA =
            normalizarTexto(
              textoColumna(
                a,
                columnaOrdenada,
              ),
            );

          const valorB =
            normalizarTexto(
              textoColumna(
                b,
                columnaOrdenada,
              ),
            );

          const comparacion =
            valorA.localeCompare(
              valorB,
              'es',
            );

          return orden === 'desc'
            ? -comparacion
            : comparacion;
        });
      }

      return resultado;
    }, [
      datos,
      filtrosEstructura,
      filtrosColumnas,
      busqueda,
    ]);

  /*
   * ============================================================
   * LIMPIAR TODO
   * ============================================================
   */

  const limpiarFiltros =
    useCallback(() => {
      setFiltrosEstructura(
        FILTROS_ESTRUCTURA_INICIALES,
      );

      setFiltrosColumnas(
        crearFiltrosColumnas(),
      );

      setBusqueda('');
    }, []);

  /*
   * ============================================================
   * CONTADOR DE FILTROS ACTIVOS
   * ============================================================
   */

  const cantidadFiltrosActivos =
    useMemo(() => {
      let cantidad = 0;

      /*
       * Filtros superiores.
       */

      if (
        filtrosEstructura.fase
      ) {
        cantidad++;
      }

      if (
        filtrosEstructura.proceso
      ) {
        cantidad++;
      }

      if (
        filtrosEstructura.subproceso
      ) {
        cantidad++;
      }

      if (
        filtrosEstructura.equipo
      ) {
        cantidad++;
      }

      if (
        filtrosEstructura.componente
      ) {
        cantidad++;
      }

      /*
       * Búsqueda general.
       */

      if (busqueda.trim()) {
        cantidad++;
      }

      /*
       * Filtros Excel.
       */

      const columnas: ColumnaFiltro[] =
        [
          'fase',
          'proceso',
          'subproceso',
          'equipo',
          'componente',
          'repuesto',
        ];

      columnas.forEach(
        (columna) => {
          const filtro =
            filtrosColumnas[
              columna
            ];

          if (
            filtro.busqueda.trim()
          ) {
            cantidad++;
          }

          if (
            filtro.seleccionados
              .length > 0
          ) {
            cantidad++;
          }

          if (filtro.orden) {
            cantidad++;
          }
        },
      );

      return cantidad;
    }, [
      filtrosEstructura,
      filtrosColumnas,
      busqueda,
    ]);

  return {
    /*
     * Datos
     */
    datos,
    datosFiltrados,

    /*
     * Estado
     */
    cargando,
    error,

    /*
     * Filtros superiores
     */
    filtrosEstructura,
    fases,
    procesos,
    subprocesos,
    equipos,
    componentes,

    cambiarFase,
    cambiarProceso,
    cambiarSubproceso,
    cambiarEquipo,
    cambiarComponente,

    /*
     * Búsqueda general
     */
    busqueda,
    setBusqueda,

    /*
     * Filtros Excel
     */
    filtrosColumnas,

    alternarFiltroColumna,
    cambiarBusquedaColumna,
    alternarValorColumna,
    ordenarColumna,
    limpiarFiltroColumna,

    /*
     * Acciones generales
     */
    limpiarFiltros,
    cantidadFiltrosActivos,

    /*
     * Recarga
     */
    recargar: cargarDatos,
  };
}