import React, { useState } from 'react';

interface StepMonitoringProps {
  data: any;
  updateData: (data: any) => void;
  onNext: () => void;
  onPrev: () => void;
}

export const StepMonitoring: React.FC<StepMonitoringProps> = ({
  data,
  updateData,
  onNext,
  onPrev,
}) => {
  const [esDispositivoRed, setEsDispositivoRed] = useState(false);
  const [requierePing, setRequierePing] = useState(false);
  const [tieneSensores, setTieneSensores] = useState(false);

  const handleChange = (field: string, value: any) => {
    updateData({ ...data, [field]: value });
  };

  return (
    <div className="space-y-4">
      <h2 className="text-xl font-bold">🔌 Monitoreo y Red</h2>

      {/* ¿Dispositivo de red? */}
      <div>
        <label className="flex items-center gap-2">
          <input
            type="checkbox"
            checked={esDispositivoRed}
            onChange={() => setEsDispositivoRed(!esDispositivoRed)}
          />
          ¿Es dispositivo de red?
        </label>
      </div>

      {esDispositivoRed && (
        <div className="border rounded p-4 space-y-3">
          <h3 className="font-medium">Configuración de red</h3>
          <div>
            <label className="block text-sm">IP</label>
            <input
              type="text"
              className="w-full border rounded px-3 py-2 text-sm"
              value={data.ip || ''}
              onChange={(e) => handleChange('ip', e.target.value)}
              placeholder="192.168.1.100"
            />
          </div>
          <div>
            <label className="block text-sm">Puerto</label>
            <input
              type="number"
              className="w-full border rounded px-3 py-2 text-sm"
              value={data.puerto || ''}
              onChange={(e) => handleChange('puerto', parseInt(e.target.value) || 0)}
              placeholder="502"
            />
          </div>
          <div>
            <label className="block text-sm">Protocolo</label>
            <select
              className="w-full border rounded px-3 py-2 text-sm"
              value={data.protocolo || ''}
              onChange={(e) => handleChange('protocolo', e.target.value)}
            >
              <option value="">Seleccionar...</option>
              <option value="Modbus TCP">Modbus TCP</option>
              <option value="OPC UA">OPC UA</option>
              <option value="Siemens S7">Siemens S7</option>
              <option value="HTTP">HTTP</option>
            </select>
          </div>
        </div>
      )}

      {/* ¿Requiere monitoreo ping? */}
      <div>
        <label className="flex items-center gap-2">
          <input
            type="checkbox"
            checked={requierePing}
            onChange={() => setRequierePing(!requierePing)}
          />
          ¿Requiere monitoreo Ping?
        </label>
      </div>

      {requierePing && (
        <div className="border rounded p-4 space-y-3">
          <h3 className="font-medium">Configuración de ping</h3>
          <div>
            <label className="block text-sm">IP (ping)</label>
            <input
              type="text"
              className="w-full border rounded px-3 py-2 text-sm"
              value={data.ping_ip || ''}
              onChange={(e) => handleChange('ping_ip', e.target.value)}
              placeholder="192.168.1.100"
            />
          </div>
          <div className="grid grid-cols-3 gap-2">
            <div>
              <label className="block text-sm">Intervalo (s)</label>
              <input
                type="number"
                className="w-full border rounded px-2 py-1 text-sm"
                value={data.intervalo_segundos || 5}
                onChange={(e) => handleChange('intervalo_segundos', parseInt(e.target.value) || 5)}
              />
            </div>
            <div>
              <label className="block text-sm">Timeout (s)</label>
              <input
                type="number"
                className="w-full border rounded px-2 py-1 text-sm"
                value={data.timeout_segundos || 3}
                onChange={(e) => handleChange('timeout_segundos', parseInt(e.target.value) || 3)}
              />
            </div>
            <div>
              <label className="block text-sm">Reintentos</label>
              <input
                type="number"
                className="w-full border rounded px-2 py-1 text-sm"
                value={data.reintentos || 3}
                onChange={(e) => handleChange('reintentos', parseInt(e.target.value) || 3)}
              />
            </div>
          </div>
        </div>
      )}

      {/* ¿Tiene sensores PI System? */}
      <div>
        <label className="flex items-center gap-2">
          <input
            type="checkbox"
            checked={tieneSensores}
            onChange={() => setTieneSensores(!tieneSensores)}
          />
          ¿Tiene datos de sensores en PI System?
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
          className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
          onClick={() => {
            updateData({ ...data, tieneSensores });
            onNext();
          }}
        >
          Siguiente →
        </button>
      </div>
    </div>
  );
};