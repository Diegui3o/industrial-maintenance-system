import { useState } from 'react';

export interface SubprocesoEditable {
  tipo: 'proceso' | 'sistema';
  id: number;
  nombre: string;
  descripcion?: string;
  procesoId: number | null;
  sistemaId: number | null;
  activo: boolean;
}

interface Props {
  subproceso: SubprocesoEditable;
  guardando?: boolean;
  onGuardar: (
    nombre: string,
    descripcion: string
  ) => void;
  onCancelar: () => void;
}

export function SubprocesoEditorForm({
  subproceso,
  guardando = false,
  onGuardar,
  onCancelar,
}: Props) {
  const [nombre, setNombre] =
    useState(subproceso.nombre);

  const [descripcion, setDescripcion] =
    useState(subproceso.descripcion ?? '');

  const guardar = () => {
    if (!nombre.trim() || guardando) {
      return;
    }

    onGuardar(
      nombre.trim(),
      descripcion.trim()
    );
  };

  return (
    <div className="planta-subproceso-editor">
      <div className="planta-card-header">
        <div>
          <span className="planta-section-label">
            EDITAR
          </span>

          <h3>
            {subproceso.nombre}
          </h3>
        </div>
      </div>

      <div className="planta-form">
        <label>Nombre</label>

        <input
          type="text"
          value={nombre}
          onChange={(e) =>
            setNombre(e.target.value)
          }
          disabled={guardando}
        />

        <label>Descripción</label>

        <textarea
          rows={3}
          value={descripcion}
          onChange={(e) =>
            setDescripcion(
              e.target.value
            )
          }
          disabled={guardando}
        />

        <div className="planta-relation-actions">
          <button
            type="button"
            onClick={onCancelar}
            disabled={guardando}
          >
            Cancelar
          </button>

          <button
            type="button"
            className="planta-save-btn"
            onClick={guardar}
            disabled={
              guardando ||
              !nombre.trim()
            }
          >
            {guardando
              ? 'Guardando...'
              : 'Guardar cambios'}
          </button>
        </div>
      </div>
    </div>
  );
}