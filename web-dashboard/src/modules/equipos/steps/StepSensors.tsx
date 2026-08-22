// web-dashboard/src/modules/equipos/steps/StepSensors.tsx
import { useState, useEffect } from 'react';
import { getPIFuentes, getPITagsAgrupados } from '../../../shared/services/api';

// ============================================
// INTERFAZ IGUAL A LOS OTROS STEPS
// ============================================
interface StepSensorsProps {
  data: any;                    // ← Igual que StepBasicInfo, StepLocation, etc.
  updateData: (data: any) => void;  // ← Igual que los otros steps
  onNext: () => void;
  onPrev: () => void;
  onSubmit?: () => void;
}

export default function StepSensors({ data, updateData, onNext, onPrev }: StepSensorsProps) {
  const [fuentes, setFuentes] = useState<any[]>([]);
  const [tagsAgrupados, setTagsAgrupados] = useState<any[]>([]);
  const [cargando, setCargando] = useState(false);
  
  // Usar data.fuenteSeleccionada en lugar de estado local
  const fuenteSeleccionada = data.fuenteSeleccionada || '';
  const tagsSeleccionados = data.tagsSeleccionados || [];
  const umbrales = data.umbrales || [];

  // Cargar fuentes al montar
  useEffect(() => {
    getPIFuentes().then(setFuentes);
  }, []);

  // Cargar tags al seleccionar fuente
  useEffect(() => {
    if (fuenteSeleccionada) {
      setCargando(true);
      getPITagsAgrupados(fuenteSeleccionada)
        .then(setTagsAgrupados)
        .finally(() => setCargando(false));
    }
  }, [fuenteSeleccionada]);

  const toggleTag = (tag: string) => {
    const nuevos = tagsSeleccionados.includes(tag)
      ? tagsSeleccionados.filter((t: string) => t !== tag)
      : [...tagsSeleccionados, tag];
    updateData({ tagsSeleccionados: nuevos });
  };

  const seleccionarTodos = (tags: string[]) => {
    const nuevos = [...tagsSeleccionados];
    tags.forEach((t: string) => {
      if (!nuevos.includes(t)) nuevos.push(t);
    });
    updateData({ tagsSeleccionados: nuevos });
  };

  const actualizarUmbral = (tag: string, campo: string, valor: any) => {
    const index = umbrales.findIndex((u: any) => u.parametro === tag);
    const nuevoUmbral = { parametro: tag, [campo]: valor };
    
    let nuevosUmbrales;
    if (index >= 0) {
      nuevosUmbrales = [...umbrales];
      nuevosUmbrales[index] = { ...nuevosUmbrales[index], [campo]: valor };
    } else {
      nuevosUmbrales = [...umbrales, nuevoUmbral];
    }
    updateData({ umbrales: nuevosUmbrales });
  };

  const handleSubmit = () => {
    if (onNext) onNext();
  };

  return (
    <div style={{ marginTop: 16 }}>
      <div style={{ marginBottom: 16 }}>
        <h3 style={{ marginBottom: 4 }}>📡 Sensores PI System</h3>
        <p style={{ color: '#666', fontSize: 14, margin: 0 }}>
          Selecciona los tags de PI System que pertenecen a este equipo y configura sus umbrales.
        </p>
      </div>

      {/* Seleccionar fuente */}
      <div style={{ marginBottom: 16 }}>
        <label style={{ display: 'block', marginBottom: 4, fontWeight: 500, fontSize: 14 }}>Fuente</label>
        <select
          className="w-full border rounded px-3 py-2"
          style={{ width: '100%', padding: '8px 12px', border: '1px solid #ddd', borderRadius: 6 }}
          value={fuenteSeleccionada}
          onChange={(e) => updateData({ fuenteSeleccionada: e.target.value })}
        >
          <option value="">Seleccionar fuente...</option>
          {fuentes.map((f: any) => (
            <option key={f.pi_server + f.database_name} value={f.pi_server}>
              {f.pi_server} - {f.database_name} ({f.total_tags} tags)
            </option>
          ))}
        </select>
      </div>

      {/* Tags agrupados */}
      {cargando && <div style={{ color: '#666' }}>Cargando tags...</div>}
      
      {tagsAgrupados.length > 0 && (
        <div style={{ maxHeight: 350, overflowY: 'auto', border: '1px solid #ddd', borderRadius: 8, padding: 12 }}>
          {tagsAgrupados.map((grupo: any) => (
            <div key={grupo.elementName} style={{ marginBottom: 12, borderBottom: '1px solid #eee', paddingBottom: 8 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <strong style={{ fontSize: 14 }}>🏭 {grupo.elementName}</strong>
                <span style={{ fontSize: 12, color: '#999' }}>{grupo.totalTags} tags</span>
                <button
                  style={{ fontSize: 12, color: '#C45A1A', background: 'none', border: 'none', cursor: 'pointer' }}
                  onClick={() => seleccionarTodos(grupo.tags)}
                >
                  Seleccionar todos
                </button>
              </div>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6, marginTop: 6 }}>
                {grupo.tags.map((tag: string) => (
                  <label key={tag} style={{ fontSize: 13, display: 'flex', alignItems: 'center', gap: 4 }}>
                    <input
                      type="checkbox"
                      checked={tagsSeleccionados.includes(tag)}
                      onChange={() => toggleTag(tag)}
                    />
                    {tag}
                  </label>
                ))}
              </div>
              
              {/* Umbrales para tags seleccionados */}
              {tagsSeleccionados.filter((t: string) => grupo.tags.includes(t)).map((tag: string) => {
                const umbral = umbrales.find((u: any) => u.parametro === tag) || {};
                return (
                  <div key={tag + '-umbral'} style={{ marginTop: 6, padding: 8, background: '#f5f5f5', borderRadius: 4 }}>
                    <div style={{ fontSize: 13, fontWeight: 500, marginBottom: 4 }}>{tag}</div>
                    <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
                      <input
                        type="number"
                        placeholder="Mínimo"
                        className="border rounded px-2 py-1 text-sm"
                        style={{ width: 90, padding: '4px 8px', border: '1px solid #ddd', borderRadius: 4 }}
                        value={umbral.umbral_min || ''}
                        onChange={(e) => actualizarUmbral(tag, 'umbral_min', parseFloat(e.target.value) || undefined)}
                      />
                      <input
                        type="number"
                        placeholder="Máximo"
                        className="border rounded px-2 py-1 text-sm"
                        style={{ width: 90, padding: '4px 8px', border: '1px solid #ddd', borderRadius: 4 }}
                        value={umbral.umbral_max || ''}
                        onChange={(e) => actualizarUmbral(tag, 'umbral_max', parseFloat(e.target.value) || undefined)}
                      />
                      <input
                        type="text"
                        placeholder="Unidad"
                        className="border rounded px-2 py-1 text-sm"
                        style={{ width: 80, padding: '4px 8px', border: '1px solid #ddd', borderRadius: 4 }}
                        value={umbral.unidad || ''}
                        onChange={(e) => actualizarUmbral(tag, 'unidad', e.target.value)}
                      />
                      <select
                        className="border rounded px-2 py-1 text-sm"
                        style={{ padding: '4px 8px', border: '1px solid #ddd', borderRadius: 4 }}
                        value={umbral.severidad || 'media'}
                        onChange={(e) => actualizarUmbral(tag, 'severidad', e.target.value)}
                      >
                        <option value="baja">Baja</option>
                        <option value="media">Media</option>
                        <option value="alta">Alta</option>
                        <option value="critica">Crítica</option>
                      </select>
                    </div>
                  </div>
                );
              })}
            </div>
          ))}
        </div>
      )}

      <div style={{ marginTop: 8, fontSize: 14, color: '#666' }}>
        {tagsSeleccionados.length} tags seleccionados
      </div>

      {/* Botones de navegación */}
      <div className="flex justify-between mt-6">
        <button
          className="px-4 py-2 border rounded hover:bg-gray-50"
          onClick={onPrev}
        >
          ← Anterior
        </button>
        <button
          className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
          onClick={handleSubmit}
          disabled={tagsSeleccionados.length === 0}
        >
          Siguiente →
        </button>
      </div>
    </div>
  );
}