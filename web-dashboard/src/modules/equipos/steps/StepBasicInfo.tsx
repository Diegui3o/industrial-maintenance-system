import React from 'react';

interface StepBasicInfoProps {
  data: any;
  updateData: (data: any) => void;
  onNext: () => void;
}

export const StepBasicInfo: React.FC<StepBasicInfoProps> = ({
  data,
  updateData,
  onNext,
}) => {
  const handleChange = (field: string, value: any) => {
    updateData({ ...data, [field]: value });
  };

  return (
    <div className="space-y-4">
      <h2 className="text-xl font-bold">📋 Información Básica</h2>

      <div>
        <label className="block text-sm font-medium mb-1">Nombre del equipo *</label>
        <input
          type="text"
          className="w-full border rounded px-3 py-2"
          value={data.nombre || ''}
          onChange={(e) => handleChange('nombre', e.target.value)}
          placeholder="Ej: Motor Principal"
        />
      </div>

      <div>
        <label className="block text-sm font-medium mb-1">Código *</label>
        <input
          type="text"
          className="w-full border rounded px-3 py-2"
          value={data.codigo || ''}
          onChange={(e) => handleChange('codigo', e.target.value)}
          placeholder="Ej: MOT-001"
        />
      </div>

      <div>
        <label className="block text-sm font-medium mb-1">Área</label>
        <select
          className="w-full border rounded px-3 py-2"
          value={data.area || ''}
          onChange={(e) => handleChange('area', e.target.value)}
        >
          <option value="">Seleccionar...</option>
          <option value="MINA">MINA</option>
          <option value="PLANTA">PLANTA</option>
          <option value="SE_ELECTRICAS">SE_ELECTRICAS</option>
          <option value="OTROS">OTROS</option>
        </select>
      </div>

      <div>
        <label className="block text-sm font-medium mb-1">Tipo</label>
        <input
          type="text"
          className="w-full border rounded px-3 py-2"
          value={data.tipo || ''}
          onChange={(e) => handleChange('tipo', e.target.value)}
          placeholder="Ej: Motor, Bomba, Ventilador"
        />
      </div>

      <div className="flex items-center gap-2">
        <input
          type="checkbox"
          checked={data.critico || false}
          onChange={(e) => handleChange('critico', e.target.checked)}
        />
        <label className="text-sm">¿Es equipo crítico?</label>
      </div>

      <button
        className="w-full bg-blue-500 text-white py-2 rounded hover:bg-blue-600"
        onClick={onNext}
      >
        Siguiente →
      </button>
    </div>
  );
};