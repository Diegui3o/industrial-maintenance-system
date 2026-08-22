import React from 'react';

interface StepLocationProps {
  data: any;
  updateData: (data: any) => void;
  onNext: () => void;
  onPrev: () => void;
}

export const StepLocation: React.FC<StepLocationProps> = ({
  data,
  updateData,
  onNext,
  onPrev,
}) => {

  const handleChange = (field: string, value: any) => {
    updateData({ ...data, [field]: value });
  };

  return (
    <div className="space-y-4">
      <h2 className="text-xl font-bold">📍 Ubicación y Jerarquía</h2>

      <div>
        <label className="block text-sm font-medium mb-1">Ubicación física</label>
        <input
          type="text"
          className="w-full border rounded px-3 py-2"
          value={data.ubicacion_fisica || ''}
          onChange={(e) => handleChange('ubicacion_fisica', e.target.value)}
          placeholder="Ej: Nivel -540, Sala de control"
        />
      </div>

      <div>
        <label className="block text-sm font-medium mb-1">Equipo padre (jerarquía)</label>
        <select
          className="w-full border rounded px-3 py-2"
          value={data.activo_padre_id || ''}
          onChange={(e) => handleChange('activo_padre_id', e.target.value ? parseInt(e.target.value) : null)}
        >
          <option value="">Ninguno (equipo raíz)</option>
          {/* Opcional: puedes agregar equipos manualmente aquí */}
        </select>
      </div>

      <div>
        <label className="block text-sm font-medium mb-1">Nivel jerárquico</label>
        <input
          type="number"
          className="w-full border rounded px-3 py-2"
          value={data.nivel_jerarquia || 0}
          onChange={(e) => handleChange('nivel_jerarquia', parseInt(e.target.value) || 0)}
          min="0"
        />
      </div>

      <div className="flex justify-between">
        <button
          className="px-4 py-2 border rounded hover:bg-gray-50"
          onClick={onPrev}
        >
          ← Anterior
        </button>
        <button
          className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
          onClick={onNext}
        >
          Siguiente →
        </button>
      </div>
    </div>
  );
};