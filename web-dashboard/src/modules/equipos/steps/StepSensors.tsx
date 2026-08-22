// web-dashboard/src/modules/equipos/steps/StepSensors.tsx
import { useState, useEffect } from 'react';
import { getPIFuentes, getPITagsAgrupados } from '../../../shared/services/api';

interface StepSensorsProps {
  form: any;
  update: (data: any) => void;
  onNext?: () => void;
  onPrev?: () => void;
}

export default function StepSensors({ form, update, onNext, onPrev }: StepSensorsProps) {
  const [habilitado, setHabilitado] = useState(form.tieneSensores || false);
  const [fuentes, setFuentes] = useState<any[]>([]);
  const [tagsAgrupados, setTagsAgrupados] = useState<any[]>([]);
  const [cargando, setCargando] = useState(false);

  const fuenteSeleccionada = form.fuenteSeleccionada || '';
  const tagsSeleccionados = form.tagsSeleccionados || [];
  const umbrales = form.umbrales || [];

  // Cargar fuentes al montar (solo si está habilitado)
  useEffect(() => {
    if (habilitado) {
      getPIFuentes().then(setFuentes);
    }
  }, [habilitado]);

  // Cargar tags al seleccionar fuente
  useEffect(() => {
    if (habilitado && fuenteSeleccionada) {
      setCargando(true);
      getPITagsAgrupados(fuenteSeleccionada)
        .then(setTagsAgrupados)
        .finally(() => setCargando(false));
    }
  }, [habilitado, fuenteSeleccionada]);

  const toggleHabilitado = (checked: boolean) => {
    setHabilitado(checked);
    update({ 
      tieneSensores: checked,
      fuenteSeleccionada: checked ? form.fuenteSeleccionada || '' : '',
      tagsSeleccionados: checked ? form.tagsSeleccionados || [] : [],
      umbrales: checked ? form.umbrales || [] : [],
    });
  };

  const toggleTag = (tag: string) => {
    const nuevos = tagsSeleccionados.includes(tag)
      ? tagsSeleccionados.filter((t: string) => t !== tag)
      : [...tagsSeleccionados, tag];
    update({ tagsSeleccionados: nuevos });
  };

  const seleccionarTodos = (tags: string[]) => {
    const nuevos = [...tagsSeleccionados];
    tags.forEach((t: string) => {
      if (!nuevos.includes(t)) nuevos.push(t);
    });
    update({ tagsSeleccionados: nuevos });
  };

  const actualizarUmbral = (tag: string, campo: string, valor: any) => {
    const index = umbrales.findIndex((u: any) => u.parametro === tag);
    let nuevosUmbrales;
    if (index >= 0) {
      nuevosUmbrales = [...umbrales];
      nuevosUmbrales[index] = { ...nuevosUmbrales[index], [campo]: valor };
    } else {
      nuevosUmbrales = [...umbrales, { parametro: tag, [campo]: valor }];
    }
    update({ umbrales: nuevosUmbrales });
  };

  const totalTagsDisponibles = tagsAgrupados.reduce((acc, g) => acc + g.totalTags, 0);

  return (
    <div style={{ marginTop: 16 }}>
      {/* Encabezado con toggle */}
      <div style={{ marginBottom: 16 }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <div>
            <h3 style={{ marginBottom: 2, fontSize: 18 }}>📡 Sensores PI System</h3>
            <p style={{ color: '#666', fontSize: 13, margin: 0 }}>
              {habilitado 
                ? 'Configura los sensores PI System para este equipo' 
                : 'Activa esta opción si el equipo tiene sensores en PI System'}
            </p>
          </div>
          <label style={{ 
            display: 'flex', 
            alignItems: 'center', 
            gap: 8, 
            cursor: 'pointer',
            fontSize: 14,
            fontWeight: 500
          }}>
            <span style={{ color: habilitado ? '#10B981' : '#666' }}>
              {habilitado ? '✅ Activado' : '⛔ Desactivado'}
            </span>
            <input
              type="checkbox"
              checked={habilitado}
              onChange={(e) => toggleHabilitado(e.target.checked)}
              style={{
                width: 40,
                height: 22,
                appearance: 'none',
                background: habilitado ? '#10B981' : '#ccc',
                borderRadius: 12,
                position: 'relative',
                cursor: 'pointer',
                transition: 'background 0.3s',
                flexShrink: 0
              }}
            />
          </label>
        </div>
      </div>

      {/* Contenido solo si está habilitado */}
      {habilitado && (
        <>
          {/* PASO 1: Seleccionar fuente */}
          <div style={{ marginBottom: 16 }}>
            <label style={{ display: 'block', marginBottom: 4, fontWeight: 500, fontSize: 14 }}>
              🔍 1. Selecciona la fuente de datos
            </label>
            <select
              className="w-full border rounded px-3 py-2"
              style={{
                width: '100%',
                padding: '10px 12px',
                border: fuenteSeleccionada ? '2px solid #10B981' : '1px solid #ddd',
                borderRadius: 8,
                fontSize: 14,
                backgroundColor: fuenteSeleccionada ? '#f0fdf4' : 'white',
                transition: 'all 0.2s'
              }}
              value={fuenteSeleccionada}
              onChange={(e) => update({ fuenteSeleccionada: e.target.value })}
            >
              <option value="">-- Seleccionar fuente --</option>
              {fuentes.map((f: any) => (
                <option key={f.pi_server + f.database_name} value={f.pi_server}>
                  🏭 {f.pi_server} - {f.database_name} ({f.total_tags} tags disponibles)
                </option>
              ))}
            </select>
            {fuenteSeleccionada && (
              <div style={{ marginTop: 4, fontSize: 13, color: '#10B981' }}>
                ✅ Fuente seleccionada: {fuenteSeleccionada}
              </div>
            )}
          </div>

          {/* PASO 2: Seleccionar tags */}
          {fuenteSeleccionada && (
            <div style={{ marginBottom: 16 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 }}>
                <label style={{ fontWeight: 500, fontSize: 14 }}>
                  📋 2. Selecciona los tags que pertenecen a este equipo
                </label>
                <span style={{ fontSize: 13, color: '#666' }}>
                  {tagsSeleccionados.length} de {totalTagsDisponibles} seleccionados
                </span>
              </div>

              {cargando ? (
                <div style={{ textAlign: 'center', padding: 30, color: '#666' }}>
                  ⏳ Cargando tags...
                </div>
              ) : tagsAgrupados.length === 0 ? (
                <div style={{ textAlign: 'center', padding: 30, color: '#666', background: '#f9fafb', borderRadius: 8 }}>
                  ℹ️ No se encontraron tags para esta fuente
                </div>
              ) : (
                <div style={{ maxHeight: 350, overflowY: 'auto', border: '1px solid #e5e7eb', borderRadius: 8, padding: 12 }}>
                  {tagsAgrupados.map((grupo: any) => (
                    <div key={grupo.elementName} style={{ marginBottom: 12, borderBottom: '1px solid #f3f4f6', paddingBottom: 10 }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <strong style={{ fontSize: 14, color: '#1f2937' }}>
                          🏭 {grupo.elementName}
                        </strong>
                        <span style={{ fontSize: 12, color: '#6b7280' }}>
                          {grupo.totalTags} tags
                        </span>
                        <button
                          style={{
                            fontSize: 12,
                            color: '#C45A1A',
                            background: 'none',
                            border: 'none',
                            cursor: 'pointer',
                            textDecoration: 'underline'
                          }}
                          onClick={() => seleccionarTodos(grupo.tags)}
                        >
                          Seleccionar todos
                        </button>
                      </div>
                      <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6, marginTop: 6 }}>
                        {grupo.tags.map((tag: string) => (
                          <label
                            key={tag}
                            style={{
                              fontSize: 13,
                              display: 'flex',
                              alignItems: 'center',
                              gap: 4,
                              padding: '2px 8px',
                              borderRadius: 4,
                              background: tagsSeleccionados.includes(tag) ? '#dbeafe' : 'transparent',
                              cursor: 'pointer',
                              transition: 'background 0.2s'
                            }}
                          >
                            <input
                              type="checkbox"
                              checked={tagsSeleccionados.includes(tag)}
                              onChange={() => toggleTag(tag)}
                            />
                            {tag}
                          </label>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* Configuración de umbrales */}
          {tagsSeleccionados.length > 0 && (
            <div style={{ marginBottom: 16 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 }}>
                <label style={{ fontWeight: 500, fontSize: 14 }}>
                  ⚙️ 3. Configura los umbrales de los tags seleccionados
                </label>
                <span style={{ fontSize: 13, color: '#6b7280' }}>
                  {tagsSeleccionados.length} tags con umbrales
                </span>
              </div>

              <div style={{ maxHeight: 200, overflowY: 'auto', border: '1px solid #e5e7eb', borderRadius: 8, padding: 12 }}>
                {tagsSeleccionados.map((tag: string) => {
                  const umbral = umbrales.find((u: any) => u.parametro === tag) || {};
                  return (
                    <div
                      key={tag + '-umbral'}
                      style={{
                        marginBottom: 8,
                        padding: 10,
                        background: '#f9fafb',
                        borderRadius: 6,
                        border: '1px solid #f3f4f6'
                      }}
                    >
                      <div style={{ fontSize: 13, fontWeight: 500, marginBottom: 4 }}>{tag}</div>
                      <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
                        <div>
                          <label style={{ fontSize: 11, color: '#6b7280' }}>Mínimo</label>
                          <input
                            type="number"
                            placeholder="0"
                            style={{
                              width: 80,
                              padding: '4px 8px',
                              border: '1px solid #ddd',
                              borderRadius: 4,
                              fontSize: 13
                            }}
                            value={umbral.umbral_min || ''}
                            onChange={(e) => actualizarUmbral(tag, 'umbral_min', parseFloat(e.target.value) || undefined)}
                          />
                        </div>
                        <div>
                          <label style={{ fontSize: 11, color: '#6b7280' }}>Máximo</label>
                          <input
                            type="number"
                            placeholder="100"
                            style={{
                              width: 80,
                              padding: '4px 8px',
                              border: '1px solid #ddd',
                              borderRadius: 4,
                              fontSize: 13
                            }}
                            value={umbral.umbral_max || ''}
                            onChange={(e) => actualizarUmbral(tag, 'umbral_max', parseFloat(e.target.value) || undefined)}
                          />
                        </div>
                        <div>
                          <label style={{ fontSize: 11, color: '#6b7280' }}>Unidad</label>
                          <input
                            type="text"
                            placeholder="A"
                            style={{
                              width: 70,
                              padding: '4px 8px',
                              border: '1px solid #ddd',
                              borderRadius: 4,
                              fontSize: 13
                            }}
                            value={umbral.unidad || ''}
                            onChange={(e) => actualizarUmbral(tag, 'unidad', e.target.value)}
                          />
                        </div>
                        <div>
                          <label style={{ fontSize: 11, color: '#6b7280' }}>Severidad</label>
                          <select
                            style={{
                              padding: '4px 8px',
                              border: '1px solid #ddd',
                              borderRadius: 4,
                              fontSize: 13,
                              background: 'white'
                            }}
                            value={umbral.severidad || 'media'}
                            onChange={(e) => actualizarUmbral(tag, 'severidad', e.target.value)}
                          >
                            <option value="baja">🟢 Baja</option>
                            <option value="media">🟡 Media</option>
                            <option value="alta">🟠 Alta</option>
                            <option value="critica">🔴 Crítica</option>
                          </select>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* Resumen */}
          <div
            style={{
              padding: 12,
              background: tagsSeleccionados.length > 0 ? '#f0fdf4' : '#f9fafb',
              borderRadius: 8,
              border: `1px solid ${tagsSeleccionados.length > 0 ? '#bbf7d0' : '#e5e7eb'}`,
              marginBottom: 16,
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center'
            }}
          >
            <span style={{ fontSize: 14 }}>
              {tagsSeleccionados.length === 0 ? (
                'ℹ️ No hay tags seleccionados. Selecciona al menos uno para continuar.'
              ) : (
                <>
                  ✅ <strong>{tagsSeleccionados.length}</strong> tags seleccionados
                  {umbrales.length > 0 && ` · ${umbrales.length} configuraciones de umbral`}
                </>
              )}
            </span>
          </div>
        </>
      )}

      {/* Botones de navegación */}
      <div className="flex justify-between mt-6">
        {onPrev && (
          <button
            className="px-4 py-2 border rounded hover:bg-gray-50"
            onClick={onPrev}
            style={{ padding: '10px 24px', borderRadius: 8 }}
          >
            ← Anterior
          </button>
        )}
        {onNext && (
          <button
            className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 disabled:opacity-50"
            onClick={onNext}
            style={{ padding: '10px 24px', borderRadius: 8 }}
          >
            Siguiente →
          </button>
        )}
      </div>
    </div>
  );
}