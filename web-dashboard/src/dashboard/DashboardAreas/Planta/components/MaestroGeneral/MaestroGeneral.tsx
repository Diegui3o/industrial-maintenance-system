import { MaestroGeneralHeader } from './components/MaestroGeneralHeader';
import { MaestroGeneralBusqueda } from './components/MaestroGeneralBusqueda';
import { FiltrosEstructura } from './components/filtros/FiltrosEstructura';
import { MaestroGeneralTabla } from './components/MaestroGeneralTabla';

import { useMaestroGeneral } from './hooks/useMaestroGeneral';

import type { MaestroGeneralItem } from '../../services/plantaMasterGeneralApi';

import './MaestroGeneral.css';

export function MaestroGeneral() {
  const {
    datos,
    datosFiltrados,

    cargando,
    error,

    filtrosEstructura,
    filtrosColumnas,
    busqueda,

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

    setBusqueda,

    alternarFiltroColumna,
    cambiarBusquedaColumna,
    alternarValorColumna,
    ordenarColumna,
    limpiarFiltroColumna,

    limpiarFiltros,

    cantidadFiltrosActivos,
  } = useMaestroGeneral();

  function manejarMantenimiento(
    item: MaestroGeneralItem,
  ) {
    console.log(
      'Programa de mantenimiento:',
      item,
    );
  }

  function manejarDetalleTecnico(
    item: MaestroGeneralItem,
  ) {
    console.log(
      'Detalle técnico:',
      item,
    );
  }

  if (cargando) {
    return (
      <div className="maestro-general">
        <div className="maestro-general-cargando">
          <div className="maestro-general-spinner" />

          <span>
            Cargando Maestro General...
          </span>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="maestro-general">
        <div className="maestro-general-error">
          <div className="maestro-general-error-icono">
            ⚠
          </div>

          <h3>
            No se pudo cargar el Maestro General
          </h3>

          <p>{error}</p>

          <button
            type="button"
            onClick={() =>
              window.location.reload()
            }
          >
            Reintentar
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="maestro-general">
      <MaestroGeneralHeader
        cantidadTotal={datos.length}
        cantidadVisible={
          datosFiltrados.length
        }
        cantidadFiltrosActivos={
          cantidadFiltrosActivos
        }
        onLimpiarFiltros={
          limpiarFiltros
        }
      />

      <MaestroGeneralBusqueda
        value={busqueda}
        onChange={setBusqueda}
      />

      <FiltrosEstructura
        fase={filtrosEstructura.fase}
        proceso={
          filtrosEstructura.proceso
        }
        subproceso={
          filtrosEstructura.subproceso
        }
        equipo={
          filtrosEstructura.equipo
        }
        componente={
          filtrosEstructura.componente
        }
        fases={fases}
        procesos={procesos}
        subprocesos={subprocesos}
        equipos={equipos}
        componentes={componentes}
        onFaseChange={
          cambiarFase
        }
        onProcesoChange={
          cambiarProceso
        }
        onSubprocesoChange={
          cambiarSubproceso
        }
        onEquipoChange={
          cambiarEquipo
        }
        onComponenteChange={
          cambiarComponente
        }
      />

      <MaestroGeneralTabla
        datos={datosFiltrados}
        todosLosDatos={datos}
        filtrosColumnas={
          filtrosColumnas
        }
        onToggleFiltroColumna={
          alternarFiltroColumna
        }
        onBusquedaColumnaChange={
          cambiarBusquedaColumna
        }
        onToggleValorColumna={
          alternarValorColumna
        }
        onOrdenarColumna={
          ordenarColumna
        }
        onLimpiarFiltroColumna={
          limpiarFiltroColumna
        }
        onMantenimiento={
          manejarMantenimiento
        }
        onDetalleTecnico={
          manejarDetalleTecnico
        }
      />
    </div>
  );
}