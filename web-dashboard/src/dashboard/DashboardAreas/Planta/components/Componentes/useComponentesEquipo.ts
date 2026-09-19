import { useEffect, useMemo, useState } from 'react';

import {
  getProcesos,
  getSistemas,
  getTodosSubprocesos,
  getTodosSubprocesosSistema,
  getEquiposParaRelacionSubproceso,
  getComponentesParaRelacionEquipo,
  relacionarComponentesConEquipo,
  type Componente,
  type Equipo,
  type Proceso,
  type SistemaPlanta,
  type Subproceso,
  type SubprocesoSistemaPlanta,
} from '../../services/plantaApi';

export type TipoPadre =
  | 'proceso'
  | 'sistema'
  | '';

export function useComponentesEquipo() {
  const [tipoPadre, setTipoPadre] =
    useState<TipoPadre>('');

  const [procesos, setProcesos] =
    useState<Proceso[]>([]);

  const [sistemas, setSistemas] =
    useState<SistemaPlanta[]>([]);

  const [subprocesos, setSubprocesos] =
    useState<Subproceso[]>([]);

  const [subprocesosSistema, setSubprocesosSistema] =
    useState<SubprocesoSistemaPlanta[]>([]);

  const [procesoId, setProcesoId] =
    useState<number | null>(null);

  const [sistemaId, setSistemaId] =
    useState<number | null>(null);

  const [subprocesoId, setSubprocesoId] =
    useState<number | null>(null);

  const [equipos, setEquipos] =
    useState<Equipo[]>([]);

  const [equipoSeleccionado, setEquipoSeleccionado] =
    useState<Equipo | null>(null);

  const [componentesDisponibles, setComponentesDisponibles] =
    useState<Componente[]>([]);

  const [componentesAsignados, setComponentesAsignados] =
    useState<Componente[]>([]);

  const [seleccionado, setSeleccionado] =
    useState<Componente | null>(null);

  const [busquedaEquipo, setBusquedaEquipo] =
    useState('');

  const [busquedaDisponible, setBusquedaDisponible] =
    useState('');

  const [busquedaAsignado, setBusquedaAsignado] =
    useState('');

  const [loadingEquipos, setLoadingEquipos] =
    useState(false);

  const [loadingComponentes, setLoadingComponentes] =
    useState(false);

  const [guardando, setGuardando] =
    useState(false);

  const [mensaje, setMensaje] =
    useState('');

  useEffect(() => {
    let activo = true;

    const cargarEstructura = async () => {
      try {
        const [
          procesosResultado,
          sistemasResultado,
          subprocesosResultado,
          subprocesosSistemaResultado,
        ] = await Promise.all([
          getProcesos(),
          getSistemas(),
          getTodosSubprocesos(),
          getTodosSubprocesosSistema(),
        ]);

        if (!activo) {
          return;
        }

        setProcesos(procesosResultado);
        setSistemas(sistemasResultado);
        setSubprocesos(subprocesosResultado);
        setSubprocesosSistema(
          subprocesosSistemaResultado
        );
      } catch (error) {
        console.error(
          'Error cargando estructura de componentes:',
          error
        );
      }
    };

    void cargarEstructura();

    return () => {
      activo = false;
    };
  }, []);

  const subprocesosDisponibles =
    tipoPadre === 'proceso'
      ? subprocesos.filter(
          (item) => item.proceso_id === procesoId
        )
      : tipoPadre === 'sistema'
        ? subprocesosSistema.filter(
            (item) => item.sistema_id === sistemaId
          )
        : [];

  useEffect(() => {
    if (!subprocesoId) {
      setEquipos([]);
      setEquipoSeleccionado(null);
      return;
    }

    let activo = true;

    const cargarEquipos = async () => {
      setLoadingEquipos(true);

      try {
        const resultado =
          await getEquiposParaRelacionSubproceso(
            subprocesoId
          );

        if (!activo) {
          return;
        }

        setEquipos(resultado);
        setEquipoSeleccionado(null);
      } catch (error) {
        console.error(
          'Error cargando equipos:',
          error
        );

        if (activo) {
          setEquipos([]);
          setEquipoSeleccionado(null);
        }
      } finally {
        if (activo) {
          setLoadingEquipos(false);
        }
      }
    };

    void cargarEquipos();

    return () => {
      activo = false;
    };
  }, [subprocesoId]);

  const cargarComponentes = async (
    equipoId: number,
    mostrarCarga = true
  ) => {
    if (mostrarCarga) {
      setLoadingComponentes(true);
    }

    try {
      const resultado =
        await getComponentesParaRelacionEquipo(
          equipoId
        );

      const asignados = resultado.filter(
        (item) => item.equipo_id === equipoId
      );

      const disponibles = resultado.filter(
        (item) => item.equipo_id !== equipoId
      );

      setComponentesAsignados(asignados);
      setComponentesDisponibles(disponibles);
      setSeleccionado(null);

      return resultado;
    } finally {
      if (mostrarCarga) {
        setLoadingComponentes(false);
      }
    }
  };

  useEffect(() => {
    if (!equipoSeleccionado) {
      setComponentesDisponibles([]);
      setComponentesAsignados([]);
      setSeleccionado(null);
      return;
    }

    let activo = true;

    const cargar = async () => {
      setLoadingComponentes(true);
      setMensaje('');

      try {
        const resultado =
          await getComponentesParaRelacionEquipo(
            equipoSeleccionado.id
          );

        if (!activo) {
          return;
        }

        const asignados = resultado.filter(
          (item) =>
            item.equipo_id === equipoSeleccionado.id
        );

        const disponibles = resultado.filter(
          (item) =>
            item.equipo_id !== equipoSeleccionado.id
        );

        setComponentesAsignados(asignados);
        setComponentesDisponibles(disponibles);
        setSeleccionado(null);
      } catch (error) {
        console.error(
          'Error cargando componentes:',
          error
        );

        if (activo) {
          setComponentesDisponibles([]);
          setComponentesAsignados([]);
          setSeleccionado(null);
        }
      } finally {
        if (activo) {
          setLoadingComponentes(false);
        }
      }
    };

    void cargar();

    return () => {
      activo = false;
    };
  }, [equipoSeleccionado]);

  const equiposFiltrados = useMemo(() => {
    const texto = busquedaEquipo
      .trim()
      .toLowerCase();

    if (!texto) {
      return equipos;
    }

    return equipos.filter((equipo) =>
      [
        equipo.codigo ?? '',
        equipo.nombre,
        equipo.area ?? '',
        equipo.tipo ?? '',
        equipo.estado_equipo ?? '',
      ]
        .join(' ')
        .toLowerCase()
        .includes(texto)
    );
  }, [equipos, busquedaEquipo]);

  const disponiblesFiltrados = useMemo(() => {
    const texto = busquedaDisponible
      .trim()
      .toLowerCase();

    if (!texto) {
      return componentesDisponibles;
    }

    return componentesDisponibles.filter(
      (componente) =>
        [
          componente.codigo ?? '',
          componente.nombre,
          componente.descripcion ?? '',
        ]
          .join(' ')
          .toLowerCase()
          .includes(texto)
    );
  }, [
    componentesDisponibles,
    busquedaDisponible,
  ]);

  const asignadosFiltrados = useMemo(() => {
    const texto = busquedaAsignado
      .trim()
      .toLowerCase();

    if (!texto) {
      return componentesAsignados;
    }

    return componentesAsignados.filter(
      (componente) =>
        [
          componente.codigo ?? '',
          componente.nombre,
          componente.descripcion ?? '',
        ]
          .join(' ')
          .toLowerCase()
          .includes(texto)
    );
  }, [
    componentesAsignados,
    busquedaAsignado,
  ]);

  const seleccionarTipo = (
    valor: TipoPadre
  ) => {
    setTipoPadre(valor);
    setProcesoId(null);
    setSistemaId(null);
    setSubprocesoId(null);
    setEquipos([]);
    setEquipoSeleccionado(null);
  };

  const seleccionarProceso = (
    valor: string
  ) => {
    setProcesoId(
      valor ? Number(valor) : null
    );
    setSubprocesoId(null);
    setEquipos([]);
    setEquipoSeleccionado(null);
  };

  const seleccionarSistema = (
    valor: string
  ) => {
    setSistemaId(
      valor ? Number(valor) : null
    );
    setSubprocesoId(null);
    setEquipos([]);
    setEquipoSeleccionado(null);
  };

  const seleccionarSubproceso = (
    valor: string
  ) => {
    setSubprocesoId(
      valor ? Number(valor) : null
    );
    setEquipoSeleccionado(null);
  };

  const moverAAsignados = () => {
    if (!seleccionado) {
      return;
    }

    setComponentesDisponibles((actuales) =>
      actuales.filter(
        (item) => item.id !== seleccionado.id
      )
    );

    setComponentesAsignados((actuales) => [
      ...actuales,
      seleccionado,
    ]);

    setSeleccionado(null);
  };

  const moverADisponibles = () => {
    if (!seleccionado) {
      return;
    }

    setComponentesAsignados((actuales) =>
      actuales.filter(
        (item) => item.id !== seleccionado.id
      )
    );

    setComponentesDisponibles((actuales) => [
      ...actuales,
      seleccionado,
    ]);

    setSeleccionado(null);
  };

  const guardarRelaciones = async () => {
    if (!equipoSeleccionado) {
      return;
    }

    setGuardando(true);
    setMensaje('');

    try {
      await relacionarComponentesConEquipo(
        equipoSeleccionado.id,
        componentesAsignados.map(
          (item) => item.id
        )
      );

      await cargarComponentes(
        equipoSeleccionado.id,
        false
      );

      setMensaje(
        'Relación de componentes guardada correctamente.'
      );
    } catch (error) {
      console.error(
        'Error guardando componentes:',
        error
      );

      setMensaje(
        'No se pudo guardar la relación.'
      );
    } finally {
      setGuardando(false);
    }
  };

  const recargarComponentes = async () => {
    if (!equipoSeleccionado) {
      return;
    }

    try {
      await cargarComponentes(
        equipoSeleccionado.id,
        true
      );
    } catch (error) {
      console.error(
        'Error recargando componentes:',
        error
      );

      setMensaje(
        'No se pudieron recargar los componentes.'
      );
    }
  };

  return {
    tipoPadre,
    procesos,
    sistemas,
    subprocesosDisponibles,
    procesoId,
    sistemaId,
    subprocesoId,
    equiposFiltrados,
    equipoSeleccionado,

    componentesDisponibles,
    componentesAsignados,

    disponiblesFiltrados,
    asignadosFiltrados,

    seleccionado,
    busquedaEquipo,
    busquedaDisponible,
    busquedaAsignado,

    loadingEquipos,
    loadingComponentes,
    guardando,
    mensaje,

    setEquipoSeleccionado,
    setSeleccionado,
    setBusquedaEquipo,
    setBusquedaDisponible,
    setBusquedaAsignado,
    setMensaje,
    setGuardando,

    seleccionarTipo,
    seleccionarProceso,
    seleccionarSistema,
    seleccionarSubproceso,

    moverAAsignados,
    moverADisponibles,
    guardarRelaciones,
    recargarComponentes,
  };
}