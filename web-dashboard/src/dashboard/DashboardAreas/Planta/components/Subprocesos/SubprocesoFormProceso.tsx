import { useState } from 'react';

import {
  crearSubproceso,
} from '../../services/plantaApi';

interface Props {
  procesoId: number;
  onCancel: () => void;
  onSaved: () => void | Promise<void>;
}

export function SubprocesoFormProceso({
  procesoId,
  onCancel,
  onSaved,
}: Props) {
  const [nombre, setNombre] =
    useState('');

  const [descripcion, setDescripcion] =
    useState('');

  const [guardando, setGuardando] =
    useState(false);

  const guardar = async () => {
    if (
      !nombre.trim() ||
      guardando
    ) {
      return;
    }

    setGuardando(true);

    try {
      await crearSubproceso({
        proceso_id: procesoId,
        nombre: nombre.trim(),
        descripcion:
          descripcion.trim() ||
          undefined,
      });

      await onSaved();
    } catch (error) {
      console.error(
        'Error creando subproceso:',
        error
      );

      alert(
        'No se pudo crear el subproceso.'
      );
    } finally {
      setGuardando(false);
    }
  };

  return (
    <div className="planta-form">
      <h4>Nuevo subproceso</h4>

      <input
        placeholder="Nombre del subproceso"
        value={nombre}
        onChange={(e) =>
          setNombre(e.target.value)
        }
        autoFocus
      />

      <input
        placeholder="Descripción"
        value={descripcion}
        onChange={(e) =>
          setDescripcion(
            e.target.value
          )
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
          disabled={
            !nombre.trim() ||
            guardando
          }
        >
          {guardando
            ? 'Guardando...'
            : 'Guardar'}
        </button>
      </div>
    </div>
  );
}