import { useEffect, useState } from 'react';

import {
  asignarEquipoSubproceso,
  getEquiposPorSubproceso,
  type Equipo,
  type Subproceso,
} from '../../services/plantaApi';

import { EquipoSelector } from './EquipoSelector';
import { EquipoClasificacionSistema } from './EquipoClasificacionSistema';
import { ComponentesEquipo } from '../Componentes/ComponentesEquipo';
interface Props {
  subproceso: Subproceso | null;

  /**
   * Permite informar al componente padre
   * qué equipo fue seleccionado.
   */
  onSelectEquipo?: (equipo: Equipo) => void;

  /**
   * Permite ocultar los componentes cuando
   * PlantaEstructura los mostrará como bloque independiente.
   *
   * Por defecto permanece true para no romper
   * otros usos existentes.
   */
  mostrarComponentes?: boolean;
}

export function EquiposSubproceso({
  subproceso,
  onSelectEquipo,
  mostrarComponentes = true,
}: Props) {
  const [equipos, setEquipos] = useState<Equipo[]>([]);

  const [equipoSeleccionado, setEquipoSeleccionado] =
    useState<Equipo | null>(null);

  const [loading, setLoading] = useState(false);
  const [guardando, setGuardando] = useState(false);
  const [mostrarSelector, setMostrarSelector] =
    useState(false);

  const cargar = async () => {
    if (!subproceso) return;

    setLoading(true);

    try {
      const resultado =
        await getEquiposPorSubproceso(
          subproceso.id
        );

      setEquipos(resultado);

      setEquipoSeleccionado((actual) => {
        if (!actual) return null;

        return (
          resultado.find(
            (equipo) =>
              equipo.id === actual.id
          ) || null
        );
      });
    } catch (error) {
      console.error(
        'Error cargando equipos:',
        error
      );

      setEquipos([]);
      setEquipoSeleccionado(null);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    setEquipos([]);
    setEquipoSeleccionado(null);
    setMostrarSelector(false);

    if (subproceso) {
      cargar();
    }
  }, [subproceso?.id]);

  const seleccionarEquipo = (
    equipo: Equipo
  ) => {
    setEquipoSeleccionado(equipo);
    onSelectEquipo?.(equipo);
  };

  const asignar = async (
    equipo: Equipo
  ) => {
    if (!subproceso || guardando) return;

    setGuardando(true);

    try {
      await asignarEquipoSubproceso(
        equipo.id,
        subproceso.id
      );

      await cargar();

      setMostrarSelector(false);

      seleccionarEquipo(equipo);
    } catch (error) {
      console.error(
        'Error asignando equipo:',
        error
      );

      alert(
        'No se pudo asignar el equipo.'
      );
    } finally {
      setGuardando(false);
    }
  };

  if (!subproceso) {
    return null;
  }

  return (
    <div>

      {/* ==================== ACCIONES ==================== */}

      <div
        style={{
          display: 'flex',
          justifyContent: 'flex-end',
          marginBottom: 16,
        }}
      >
        <button
          type="button"
          className="planta-add-btn"
          onClick={() =>
            setMostrarSelector(
              !mostrarSelector
            )
          }
        >
          {mostrarSelector
            ? 'Cerrar'
            : '+ Asignar equipo'}
        </button>
      </div>

      {/* ==================== SELECTOR ==================== */}

      {mostrarSelector && (
        <div className="planta-selector-container">

          <div className="planta-selector-title">
            <strong>
              Seleccionar equipo existente
            </strong>

            <span>
              Los equipos se crean desde el módulo
              de Equipos.
            </span>
          </div>

          <EquipoSelector
            equiposAsignados={equipos}
            onAsignar={asignar}
            guardando={guardando}
          />

        </div>
      )}

      {/* ==================== LISTA DE EQUIPOS ==================== */}

      {loading ? (
        <div className="planta-empty">
          Cargando equipos...
        </div>
      ) : equipos.length === 0 ? (
        <div className="planta-alert warning">

          <strong>
            Este subproceso no tiene equipos
          </strong>

          <span>
            Asigna un equipo existente para continuar.
          </span>

        </div>
      ) : (
        <div className="planta-list">

          {equipos.map((equipo) => (
            <button
              key={equipo.id}
              type="button"
              className={`planta-list-item ${
                equipoSeleccionado?.id === equipo.id
                  ? 'selected'
                  : ''
              }`}
              onClick={() =>
                seleccionarEquipo(equipo)
              }
            >
              <div>

                <strong>
                  {equipo.codigo} — {equipo.nombre}
                </strong>

                <small>
                  {equipo.tipo || 'Sin tipo'}

                  {equipo.fabricante
                    ? ` · ${equipo.fabricante}`
                    : ''}

                  {equipo.modelo
                    ? ` · ${equipo.modelo}`
                    : ''}
                </small>

              </div>

              <span>
                {equipo.estado_equipo ||
                  'Sin estado'}
              </span>

            </button>
          ))}

        </div>
      )}

      {/* ==================== CLASIFICACIÓN ==================== */}

      {equipoSeleccionado && (
        <div style={{ marginTop: 20 }}>
          <EquipoClasificacionSistema
            equipo={equipoSeleccionado}
          />
        </div>
      )}

      {/* ==================== COMPONENTES ==================== */}

      {equipoSeleccionado &&
        mostrarComponentes && (
          <div style={{ marginTop: 20 }}>
            <ComponentesEquipo
              equipo={equipoSeleccionado}
            />
          </div>
        )}

    </div>
  );
}