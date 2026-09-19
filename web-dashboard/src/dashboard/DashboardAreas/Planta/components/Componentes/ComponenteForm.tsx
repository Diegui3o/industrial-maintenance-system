import { useEffect, useState } from 'react';

import type { Componente } from '../../services/plantaApi';

interface Props {
  componente: Componente | null;
  guardando: boolean;
  onCancel: () => void;
  onSave: (datos: {
    nombre: string;
    codigo?: string;
    descripcion?: string;
  }) => void;
}

export function ComponenteForm({
  componente,
  guardando,
  onCancel,
  onSave,
}: Props) {
  const [nombre, setNombre] = useState('');
  const [codigo, setCodigo] = useState('');
  const [descripcion, setDescripcion] = useState('');

  useEffect(() => {
    setNombre(componente?.nombre ?? '');
    setCodigo(componente?.codigo ?? '');
    setDescripcion(componente?.descripcion ?? '');
  }, [componente]);

  const guardar = () => {
    const nombreLimpio = nombre.trim();

    if (!nombreLimpio || guardando) {
      return;
    }

    onSave({
      nombre: nombreLimpio,
      codigo: codigo.trim() || undefined,
      descripcion: descripcion.trim() || undefined,
    });
  };

  return (
    <div className="planta-form">
      <h4>
        {componente
          ? 'Editar componente'
          : 'Nuevo componente'}
      </h4>

      <input
        placeholder="Código del componente"
        value={codigo}
        onChange={(e) => setCodigo(e.target.value)}
      />

      <input
        placeholder="Nombre del componente"
        value={nombre}
        onChange={(e) => setNombre(e.target.value)}
      />

      <input
        placeholder="Descripción"
        value={descripcion}
        onChange={(e) => setDescripcion(e.target.value)}
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
          disabled={!nombre.trim() || guardando}
        >
          {guardando ? 'Guardando...' : 'Guardar'}
        </button>
      </div>
    </div>
  );
}