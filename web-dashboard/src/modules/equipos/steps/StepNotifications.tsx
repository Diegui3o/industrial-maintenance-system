import React, { useState, useEffect } from 'react';
import { getGrupos } from '../../../shared/services/api';

interface StepNotificationsProps {
  form: any;
  update: (data: any) => void;
  onPrev: () => void;
  onSubmit: () => void;
}

export const StepNotifications: React.FC<StepNotificationsProps> = ({ form, update, onPrev, onSubmit }) => {
  const [grupos, setGrupos] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);

  // Cargar grupos de WhatsApp
  useEffect(() => {
    setLoading(true);
    getGrupos()
      .then(setGrupos)
      .catch(() => setGrupos([]))
      .finally(() => setLoading(false));
  }, []);

  const handleChange = (field: string, value: any) => {
    update({ ...form, [field]: value });
  };

  return (
    <div className="space-y-4">
      <h2 className="text-xl font-bold">🔔 Notificaciones</h2>

      <div>
        <label className="block text-sm font-medium mb-1">Grupos de WhatsApp</label>
        <select
          className="w-full border rounded px-3 py-2"
          value={form.grupo_id || ''}
          onChange={(e) => handleChange('grupo_id', parseInt(e.target.value) || 0)}
        >
          <option value="">Seleccionar grupo...</option>
          {grupos.map((g: any) => (
            <option key={g.id} value={g.id}>
              {g.nombre}
            </option>
          ))}
        </select>
        {loading && <span className="text-sm text-gray-400">Cargando grupos...</span>}
      </div>

      <div className="border rounded p-4 space-y-2">
        <h3 className="font-medium">Notificar cuando:</h3>
        <label className="flex items-center gap-2">
          <input
            type="checkbox"
            checked={form.notificar_fallo ?? true}
            onChange={(e) => handleChange('notificar_fallo', e.target.checked)}
          />
          Equipo entra en FALLO
        </label>
        <label className="flex items-center gap-2">
          <input
            type="checkbox"
            checked={form.notificar_recuperacion ?? true}
            onChange={(e) => handleChange('notificar_recuperacion', e.target.checked)}
          />
          Equipo se RECUPERA
        </label>
        <label className="flex items-center gap-2">
          <input
            type="checkbox"
            checked={form.notificar_alarma ?? true}
            onChange={(e) => handleChange('notificar_alarma', e.target.checked)}
          />
          Se genera ALARMA por valor fuera de rango
        </label>
      </div>

      <div className="flex justify-between">
        <button
          className="px-4 py-2 border rounded hover:bg-gray-50"
          onClick={onPrev}
        >
          ← Anterior
        </button>
        <button
          className="px-4 py-2 bg-green-500 text-white rounded hover:bg-green-600"
          onClick={onSubmit}
        >
          💾 Guardar Equipo
        </button>
      </div>
    </div>
  );
};