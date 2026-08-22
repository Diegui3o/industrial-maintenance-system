import React from 'react';

interface StepBasicInfoProps {
  form: any;
  update: (data: any) => void;
  onNext: () => void;
  onPrev?: () => void;
  onSubmit?: () => void;
}

export const StepBasicInfo: React.FC<StepBasicInfoProps> = ({ form, update, onNext }) => {
  const handleChange = (field: string, value: any) => {
    update({ ...form, [field]: value });
  };

  return (
    <div className="space-y-4">
      <h2 className="text-xl font-bold">📋 Información Básica</h2>

      <div>
        <label className="block text-sm font-medium mb-1">Nombre del equipo *</label>
        <input
          type="text"
          className="w-full border rounded px-3 py-2"
          value={form.nombre || ''}  // ← CAMBIADO: data → form
          onChange={(e) => handleChange('nombre', e.target.value)}
          placeholder="Ej: Motor Principal"
        />
      </div>

      <div>
        <label className="block text-sm font-medium mb-1">Código *</label>
        <input
          type="text"
          className="w-full border rounded px-3 py-2"
          value={form.codigo || ''}  // ← CAMBIADO: data → form
          onChange={(e) => handleChange('codigo', e.target.value)}
          placeholder="Ej: MOT-001"
        />
      </div>

      <div>
        <label className="block text-sm font-medium mb-1">Área</label>
        <select
          className="w-full border rounded px-3 py-2"
          value={form.area || ''}  // ← CAMBIADO: data → form
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
          value={form.tipo || ''}  // ← CAMBIADO: data → form
          onChange={(e) => handleChange('tipo', e.target.value)}
          placeholder="Ej: Motor, Bomba, Ventilador"
        />
      </div>

      <div className="flex items-center gap-2">
        <input
          type="checkbox"
          checked={form.critico || false}  // ← CAMBIADO: data → form
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