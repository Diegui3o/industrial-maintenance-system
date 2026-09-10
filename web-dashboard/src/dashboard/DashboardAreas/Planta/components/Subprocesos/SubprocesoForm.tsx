import { useEffect, useState } from 'react';

import {
  actualizarSubproceso,
  crearSubproceso,
  getProcesos,
  type Proceso,
  type Subproceso,
} from '../../services/plantaApi';

interface Props {
  proceso?: Proceso | null;
  subproceso?: Subproceso | null;
  onSaved: () => void;
  onCancel: () => void;
}

export function SubprocesoForm({
  proceso,
  subproceso,
  onSaved,
  onCancel,
}: Props) {
  const [procesos, setProcesos] =
    useState<Proceso[]>([]);

  const [procesoId, setProcesoId] =
    useState(
      subproceso?.proceso_id?.toString() ||
        proceso?.id?.toString() ||
        ''
    );

  const [nombre, setNombre] =
    useState(
      subproceso?.nombre || ''
    );

  const [descripcion, setDescripcion] =
    useState(
      subproceso?.descripcion || ''
    );

  const [loadingProcesos, setLoadingProcesos] =
    useState(true);

  const [guardando, setGuardando] =
    useState(false);

  useEffect(() => {
    const cargarProcesos = async () => {
      setLoadingProcesos(true);

      try {
        const resultado =
          await getProcesos();

        setProcesos(resultado);

        if (
          !procesoId &&
          resultado.length === 1
        ) {
          setProcesoId(
            resultado[0].id.toString()
          );
        }
      } catch (error) {
        console.error(
          'Error cargando procesos:',
          error
        );

        setProcesos([]);
      } finally {
        setLoadingProcesos(false);
      }
    };

    cargarProcesos();
  }, []);

  const guardar = async () => {
    if (
      !procesoId ||
      !nombre.trim() ||
      guardando
    ) {
      return;
    }

    setGuardando(true);

    try {
      const id = Number(procesoId);

      if (subproceso) {
        await actualizarSubproceso(
          subproceso.id,
          {
            proceso_id: id,
            nombre: nombre.trim(),
            descripcion:
              descripcion.trim() ||
              undefined,
            activo: subproceso.activo,
          }
        );
      } else {
        await crearSubproceso({
          proceso_id: id,
          nombre: nombre.trim(),
          descripcion:
            descripcion.trim() ||
            undefined,
        });
      }

      onSaved();
    } catch (error) {
      console.error(
        'Error guardando subproceso:',
        error
      );

      alert(
        'No se pudo guardar el subproceso.'
      );
    } finally {
      setGuardando(false);
    }
  };

  const puedeGuardar =
    procesos.length > 0 &&
    !!procesoId &&
    !!nombre.trim() &&
    !guardando &&
    !loadingProcesos;

  return (
    <div className="planta-form">

      <select
        value={procesoId}
        onChange={(e) =>
          setProcesoId(e.target.value)
        }
        disabled={
          !!subproceso
        }
      >
        <option value="">
          Seleccione un proceso padre
        </option>

        {procesos.map((item) => (
          <option
            key={item.id}
            value={item.id}
          >
            {item.nombre}
          </option>
        ))}
      </select>

      <input
        placeholder="Nombre del subproceso"
        value={nombre}
        onChange={(e) =>
          setNombre(e.target.value)
        }
      />

      <input
        placeholder="Descripción"
        value={descripcion}
        onChange={(e) =>
          setDescripcion(e.target.value)
        }
      />

      <div className="planta-form-actions">
        <button
          type="button"
          className="planta-cancel-btn"
          onClick={onCancel}
          disabled={guardando}
        >
          Cancelar
        </button>

        <button
          type="button"
          className="planta-save-btn"
          onClick={guardar}
          disabled={!puedeGuardar}
        >
          {guardando
            ? 'Guardando...'
            : subproceso
              ? 'Actualizar'
              : 'Guardar'}
        </button>
      </div>
    </div>
  );
}