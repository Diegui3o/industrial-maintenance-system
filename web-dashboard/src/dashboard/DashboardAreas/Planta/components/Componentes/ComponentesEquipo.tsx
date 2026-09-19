import { useState } from 'react';

import { crearComponente } from '../../services/plantaApi';

import { ComponenteForm } from './ComponenteForm';
import { ComponentesEquipoSelect } from './ComponentesEquipoSelect';
import { EquipoSelector } from './EquipoSelector';
import { ComponentesTransfer } from './ComponentesTransfer';
import { useComponentesEquipo } from './useComponentesEquipo';
import './Componentes.css';

export function ComponentesEquipo() {
  const [mostrarForm, setMostrarForm] = useState(false);

  const {
    tipoPadre,
    procesos,
    sistemas,
    subprocesosDisponibles,
    procesoId,
    sistemaId,
    subprocesoId,
    equiposFiltrados,
    equipoSeleccionado,
    disponiblesFiltrados,
    asignadosFiltrados,
    seleccionado,
    origenSeleccionado,
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
    guardarRelaciones,
    recargarComponentes,
  } = useComponentesEquipo();

  return (
    <section className="componentes-seccion">

      {/* ENCABEZADO */}
      <div className="componentes-header">
        <div>
          <h2>Componentes</h2>
          <p>
            Seleccione el equipo padre y administre sus componentes.
          </p>
        </div>

        <button
          type="button"
          className="componentes-btn"
          onClick={() => setMostrarForm(true)}
          disabled={!equipoSeleccionado}
        >
          + Crear componente
        </button>
      </div>

      {/* ESTRUCTURA */}
      <div className="componentes-card">
        <h3 className="componentes-card-title">
          Estructura
        </h3>

        <ComponentesEquipoSelect
          tipoPadre={tipoPadre}
          procesos={procesos}
          sistemas={sistemas}
          subprocesosDisponibles={subprocesosDisponibles}
          procesoId={procesoId}
          sistemaId={sistemaId}
          subprocesoId={subprocesoId}
          seleccionarTipo={seleccionarTipo}
          seleccionarProceso={seleccionarProceso}
          seleccionarSistema={seleccionarSistema}
          seleccionarSubproceso={seleccionarSubproceso}
        />
      </div>

      {/* EQUIPOS */}
      {subprocesoId && (
        <div className="componentes-card">
          <h3 className="componentes-card-title">
            Equipo padre
          </h3>

          <EquipoSelector
            equipos={equiposFiltrados}
            equipoSeleccionado={equipoSeleccionado}
            busquedaEquipo={busquedaEquipo}
            loadingEquipos={loadingEquipos}
            setBusquedaEquipo={setBusquedaEquipo}
            setEquipoSeleccionado={setEquipoSeleccionado}
          />

          {equipoSeleccionado && (
            <div className="componentes-equipo">
              <div className="componentes-equipo-main">
                <span className="componentes-equipo-label">
                  EQUIPO SELECCIONADO
                </span>

                <strong className="componentes-equipo-nombre">
                  {equipoSeleccionado.codigo
                    ? `${equipoSeleccionado.codigo} - `
                    : ''}
                  {equipoSeleccionado.nombre}
                </strong>
              </div>

              <div className="componentes-equipo-info">
                <span>
                  <b>Área</b>
                  {equipoSeleccionado.area || '—'}
                </span>

                <span>
                  <b>Estado</b>
                  {equipoSeleccionado.estado_equipo || '—'}
                </span>
              </div>
            </div>
          )}
        </div>
      )}

      {/* FORMULARIO */}
      {equipoSeleccionado && mostrarForm && (
        <div className="componentes-card">
          <h3 className="componentes-card-title">
            Nuevo componente
          </h3>

          <ComponenteForm
            componente={null}
            guardando={guardando}
            onCancel={() => {
              if (!guardando) {
                setMostrarForm(false);
              }
            }}
            onSave={async (datos) => {
              if (!equipoSeleccionado) {
                return;
              }

              setGuardando(true);
              setMensaje('');

              try {
                await crearComponente({
                  equipo_id: equipoSeleccionado.id,
                  nombre: datos.nombre,
                  codigo: datos.codigo,
                  descripcion: datos.descripcion,
                });

                await recargarComponentes();

                setMostrarForm(false);

                setMensaje(
                  'Componente creado correctamente.'
                );
              } catch (error) {
                console.error(
                  'Error creando componente:',
                  error
                );

                setMensaje(
                  'No se pudo crear el componente.'
                );
              } finally {
                setGuardando(false);
              }
            }}
          />
        </div>
      )}

      {/* RELACIÓN */}
      {equipoSeleccionado && (
        <div className="componentes-card">
          <div className="componentes-relacion-header">
            <div>
              <h3 className="componentes-card-title">
                Relación de componentes
              </h3>

              <p>
                Seleccione los componentes que pertenecen al
                equipo seleccionado.
              </p>
            </div>

            <span className="componentes-relacion-equipo">
              {equipoSeleccionado.codigo ||
                equipoSeleccionado.nombre}
            </span>
          </div>

          <ComponentesTransfer
            disponibles={disponiblesFiltrados}
            asignados={asignadosFiltrados}
            seleccionado={seleccionado}
            origenSeleccionado={origenSeleccionado}
            busquedaDisponible={busquedaDisponible}
            busquedaAsignado={busquedaAsignado}
            loading={loadingComponentes}
            setSeleccionado={setSeleccionado}
            setBusquedaDisponible={setBusquedaDisponible}
            setBusquedaAsignado={setBusquedaAsignado}
            moverAAsignados={moverAAsignados}
          />

          <div className="componentes-footer">
            {mensaje && (
              <div className="componentes-mensaje">
                {mensaje}
              </div>
            )}

            <button
              type="button"
              className="componentes-save-btn"
              onClick={guardarRelaciones}
              disabled={guardando}
            >
              {guardando
                ? 'Guardando...'
                : 'Guardar cambios'}
            </button>
          </div>
        </div>
      )}

    </section>
  );
}