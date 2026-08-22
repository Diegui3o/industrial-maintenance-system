// web-dashboard/src/modules/equipos/pages/EquipoCreate.tsx
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { StepBasicInfo } from '../steps/StepBasicInfo';
import { StepLocation } from '../steps/StepLocation';
import { StepMonitoring } from '../steps/StepMonitoring';
import StepSensors from '../steps/StepSensors';
import { StepNotifications } from '../steps/StepNotifications';
import { crearEquipoConTags } from '../../../shared/services/api';

const STEPS = [
  { id: 'basic', title: 'Información Básica', component: StepBasicInfo },
  { id: 'location', title: 'Ubicación', component: StepLocation },
  { id: 'monitoring', title: 'Monitoreo', component: StepMonitoring },
  { id: 'sensors', title: 'Sensores', component: StepSensors },
  { id: 'notifications', title: 'Notificaciones', component: StepNotifications },
];

export const EquipoCreate: React.FC = () => {
  const [currentStep, setCurrentStep] = useState(0);
  const [formData, setFormData] = useState<Record<string, any>>({
    tagsSeleccionados: [],
    umbrales: [],
    fuenteSeleccionada: '',
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const navigate = useNavigate();

  const updateData = (data: any) => {
    setFormData((prev: any) => ({ ...prev, ...data }));
  };

  const handleNext = () => {
    setCurrentStep(prev => Math.min(prev + 1, STEPS.length - 1));
  };

  const handlePrev = () => {
    setCurrentStep(prev => Math.max(prev - 1, 0));
  };

  const handleSubmit = async () => {
    setLoading(true);
    setError(null);

    try {
      const payload = {
        equipo: {
          codigo: formData.codigo || '',
          nombre: formData.nombre || '',
          area: formData.area || '',
          tipo: formData.tipo || '',
          critico: formData.critico || false,
          ubicacion_fisica: formData.ubicacion_fisica || '',
          activo_padre_id: formData.activo_padre_id || null,
          nivel_jerarquia: formData.nivel_jerarquia || 0,
          descripcion_larga: formData.descripcion_larga || '',
        },
        tagNames: formData.tagsSeleccionados || [],
        umbrales: formData.umbrales || [],
        notificaciones: {
          grupo_id: formData.grupo_id || null,
          notificar_fallo: formData.notificar_fallo ?? true,
          notificar_recuperacion: formData.notificar_recuperacion ?? true,
          notificar_alarma: formData.notificar_alarma ?? true,
        },
      };

      const result = await crearEquipoConTags(payload);
      navigate(`/equipos/${result.equipo?.id || result.equipo_id}`);
    } catch (err) {
      console.error('Error creando equipo:', err);
      setError(err instanceof Error ? err.message : 'Error al crear el equipo');
    } finally {
      setLoading(false);
    }
  };

  const StepComponent = STEPS[currentStep].component;
  const isLastStep = currentStep === STEPS.length - 1;

  return (
    <div className="max-w-3xl mx-auto p-6">
      {/* Progress Bar */}
      <div className="mb-6">
        <div className="flex justify-between mb-2">
          {STEPS.map((step, index) => (
            <div key={step.id} className="text-center flex-1">
              <div className={`text-xs font-medium ${index <= currentStep ? 'text-blue-600' : 'text-gray-400'}`}>
                {step.title}
              </div>
              <div className={`h-1 mt-1 ${index <= currentStep ? 'bg-blue-500' : 'bg-gray-200'}`} />
            </div>
          ))}
        </div>
        <div className="text-sm text-gray-500 text-center">
          Paso {currentStep + 1} de {STEPS.length}
        </div>
      </div>

      {/* Error */}
      {error && (
        <div className="mb-4 p-3 bg-red-100 border border-red-400 text-red-700 rounded">
          {error}
        </div>
      )}

      {/* Step Component */}
      <div className="bg-white rounded-lg shadow p-6">
        <StepComponent
          form={formData}
          update={updateData}
          onNext={handleNext}
          onPrev={handlePrev}
          onSubmit={handleSubmit}
        />
      </div>

      {/* Botones de navegación globales */}
      <div className="flex justify-between mt-6">
        <button
          className="px-4 py-2 border rounded hover:bg-gray-50 disabled:opacity-50"
          onClick={handlePrev}
          disabled={currentStep === 0 || loading}
        >
          ← Anterior
        </button>
        <button
          className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 disabled:opacity-50"
          onClick={isLastStep ? handleSubmit : handleNext}
          disabled={loading}
        >
          {loading ? 'Guardando...' : (isLastStep ? '💾 Guardar Equipo' : 'Siguiente →')}
        </button>
      </div>
    </div>
  );
};