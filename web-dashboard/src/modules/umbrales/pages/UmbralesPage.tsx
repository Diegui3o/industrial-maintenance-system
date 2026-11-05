import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { colors, spacing } from '../../../theme/colors';
import Layout from '../../../shared/components/Layout';
import Button from '../../../shared/components/Button';
import { getEquipos } from '../../../shared/services/api';

interface UmbralesPageProps {
  onNavigate: (page: string, params?: any) => void;
}

export default function UmbralesPage({ onNavigate }: UmbralesPageProps) {
  const [selectedEquipoId, setSelectedEquipoId] = useState<string>('');
  const [selectedComponente, setSelectedComponente] = useState<string>('');
  const [modalAbierto, setModalAbierto] = useState(false);
  
  const [nuevoTag, setNuevoTag] = useState({
    tag: '',
    descripcion: '',
    min: 0,
    max: 100,
    severidad: 'media'
  });

  const { data: equipos = [], isLoading } = useQuery({
    queryKey: ['equipos'],
    queryFn: getEquipos
  });

  const [tagsVinculados, setTagsVinculados] = useState([
    { id: 1, tag: 'MNA_V01_VIB_X', descripcion: 'Vibración Cojinete Principal', nivel: 'Ventilador V-01', min: 0, max: 4.5, severidad: 'alta' },
    { id: 2, tag: 'PLT_M01_TEMP_OIL', descripcion: 'Temperatura Aceite Lubricación', nivel: 'Molino de Bolas M-01', min: 20, max: 75, severidad: 'critica' }
  ]);

  const equipoSeleccionado = equipos.find((e: any) => e.id?.toString() === selectedEquipoId || e.codigo === selectedEquipoId);

  const handleVincularTag = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedEquipoId) {
      alert('Por favor seleccione un equipo de la jerarquía operacional.');
      return;
    }

    const nuevoRegistro = {
      id: Date.now(),
      ...nuevoTag,
      nivel: equipoSeleccionado ? (equipoSeleccionado.nombre || equipoSeleccionado.codigo) : 'Equipo Seleccionado'
    };

    setTagsVinculados([nuevoRegistro, ...tagsVinculados]);
    setModalAbierto(false);
    setNuevoTag({ tag: '', descripcion: '', min: 0, max: 100, severidad: 'media' });
  };

  return (
    <Layout 
      title="Gestión de Umbrales y Tags PI" 
      subtitle="Vinculación de atributos del PI System y configuración de rangos operativos por activo" 
      onBack={() => onNavigate('dashboard')}
    >
      
      {/* SECCIÓN DE SELECCIÓN DE JERARQUÍA OPERACIONAL */}
      <div style={{ background: '#fff', padding: spacing.md, borderRadius: 8, border: `1px solid ${colors.border}`, marginBottom: spacing.lg, display: 'flex', gap: spacing.md, flexWrap: 'wrap', alignItems: 'center' }}>
        
        <div style={{ flex: 1, minWidth: 260 }}>
          <label style={{ display: 'block', fontSize: 13, fontWeight: 600, color: colors.text.muted, marginBottom: 6 }}>
            1. Seleccionar Equipo (Catálogo Real)
          </label>
          <select
            value={selectedEquipoId}
            onChange={(e) => setSelectedEquipoId(e.target.value)}
            style={{ width: '100%', padding: '10px 14px', border: `1px solid ${colors.border}`, borderRadius: 8, fontSize: 14, background: '#fff' }}
          >
            <option value="">-- Seleccionar Equipo --</option>
            {equipos.map((eq: any) => (
              <option key={eq.id || eq.codigo} value={eq.id || eq.codigo}>
                {eq.codigo ? `[${eq.codigo}] ` : ''}{eq.nombre || eq.descripcion}
              </option>
            ))}
          </select>
        </div>

        <div style={{ flex: 1, minWidth: 260 }}>
          <label style={{ display: 'block', fontSize: 13, fontWeight: 600, color: colors.text.muted, marginBottom: 6 }}>
            2. Componente / Repuesto (Opcional)
          </label>
          <input
            placeholder="Ej: Motor, Rodamiento, Bomba..."
            value={selectedComponente}
            onChange={(e) => setSelectedComponente(e.target.value)}
            style={{ width: '100%', padding: '10px 14px', border: `1px solid ${colors.border}`, borderRadius: 8, fontSize: 14 }}
          />
        </div>

        <div style={{ alignSelf: 'flex-end' }}>
          <Button 
            onClick={() => {
              if (!selectedEquipoId) {
                alert('Seleccione un equipo primero.');
                return;
              }
              setModalAbierto(true);
            }} 
            icon="⚡"
          >
            Vincular Tag PI
          </Button>
        </div>
      </div>

      {isLoading && <p style={{ color: colors.text.muted }}>Cargando jerarquía de equipos...</p>}

      {/* TABLA DE TAGS PI CONFIGURADOS */}
      <div style={{ background: '#fff', borderRadius: 8, border: `1px solid ${colors.border}`, overflow: 'hidden' }}>
        <div style={{ padding: '14px 20px', background: '#f8fafc', borderBottom: `1px solid ${colors.border}`, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <h3 style={{ margin: 0, fontSize: 15, color: colors.text.secondary }}>Tags PI Asignados y Umbrales Activos</h3>
          <span style={{ fontSize: 12, background: '#e0f2fe', color: '#0369a1', padding: '4px 10px', borderRadius: 12, fontWeight: 600 }}>
            {tagsVinculados.length} Tags Vinculados
          </span>
        </div>

        <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
          <thead>
            <tr style={{ background: '#f1f5f9', borderBottom: `1px solid ${colors.border}`, fontSize: 12, color: colors.text.muted, textTransform: 'uppercase' }}>
              <th style={{ padding: '12px 16px' }}>Tag PI System</th>
              <th style={{ padding: '12px 16px' }}>Descripción</th>
              <th style={{ padding: '12px 16px' }}>Activo / Componente</th>
              <th style={{ padding: '12px 16px' }}>Rango (Mín - Máx)</th>
              <th style={{ padding: '12px 16px' }}>Severidad</th>
              <th style={{ padding: '12px 16px', textAlign: 'center' }}>Acciones</th>
            </tr>
          </thead>
          <tbody>
            {tagsVinculados.map((item) => (
              <tr key={item.id} style={{ borderBottom: '1px solid #f1f5f9', fontSize: 14 }}>
                <td style={{ padding: '14px 16px', fontWeight: 700, color: '#0284c7' }}>{item.tag}</td>
                <td style={{ padding: '14px 16px', color: colors.text.secondary }}>{item.descripcion}</td>
                <td style={{ padding: '14px 16px', color: colors.text.muted, fontSize: 13 }}>{item.nivel}</td>
                <td style={{ padding: '14px 16px', fontWeight: 600 }}>{item.min} - {item.max}</td>
                <td style={{ padding: '14px 16px' }}>
                  <span style={{
                    padding: '4px 8px', borderRadius: 4, fontSize: 11, fontWeight: 700, textTransform: 'uppercase',
                    background: item.severidad === 'critica' ? '#fee2e2' : item.severidad === 'alta' ? '#ffedd5' : '#e0f2fe',
                    color: item.severidad === 'critica' ? '#991b1b' : item.severidad === 'alta' ? '#c2410c' : '#0369a1'
                  }}>
                    {item.severidad}
                  </span>
                </td>
                <td style={{ padding: '14px 16px', textAlign: 'center' }}>
                  <button 
                    onClick={() => setTagsVinculados(tagsVinculados.filter(t => t.id !== item.id))}
                    style={{ background: '#fee2e2', color: '#991b1b', border: 'none', padding: '6px 12px', borderRadius: 4, cursor: 'pointer', fontSize: 12, fontWeight: 600 }}
                  >
                    Desvincular
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* MODAL PARA VINCULAR NUEVO TAG PI */}
      {modalAbierto && (
        <div style={{ position: 'fixed', top: 0, left: 0, width: '100%', height: '100%', background: 'rgba(0,0,0,0.5)', display: 'flex', justifyContent: 'center', alignItems: 'center', zIndex: 1000 }}>
          <div style={{ background: '#fff', padding: 30, borderRadius: 8, width: 450, boxShadow: '0 10px 25px rgba(0,0,0,0.2)' }}>
            <h3 style={{ margin: '0 0 6px 0', color: colors.text.secondary }}>Vincular Tag de PI System</h3>
            <p style={{ fontSize: 13, color: colors.text.muted, margin: '0 0 16px 0' }}>
              Asociando al equipo seleccionado.
            </p>
            
            <form onSubmit={handleVincularTag}>
              <div style={{ marginBottom: 12 }}>
                <label style={{ display: 'block', fontSize: 13, fontWeight: 600, marginBottom: 4 }}>Nombre del Tag PI</label>
                <input 
                  type="text" required placeholder="Ej: MNA_V01_TEMP_BEARING"
                  value={nuevoTag.tag} onChange={e => setNuevoTag({...nuevoTag, tag: e.target.value})}
                  style={{ width: '100%', padding: 8, borderRadius: 4, border: `1px solid ${colors.border}`, boxSizing: 'border-box' }}
                />
              </div>
              <div style={{ marginBottom: 12 }}>
                <label style={{ display: 'block', fontSize: '13px', fontWeight: 600, marginBottom: 4 }}>Descripción del Atributo</label>
                <input 
                  type="text" required placeholder="Ej: Temperatura Cojinete Libre"
                  value={nuevoTag.descripcion} onChange={e => setNuevoTag({...nuevoTag, descripcion: e.target.value})}
                  style={{ width: '100%', padding: 8, borderRadius: 4, border: `1px solid ${colors.border}`, boxSizing: 'border-box' }}
                />
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12, marginBottom: 12 }}>
                <div>
                  <label style={{ display: 'block', fontSize: 13, fontWeight: 600, marginBottom: 4 }}>Umbral Mínimo</label>
                  <input type="number" value={nuevoTag.min} onChange={e => setNuevoTag({...nuevoTag, min: Number(e.target.value)})} style={{ width: '100%', padding: 8, borderRadius: 4, border: `1px solid ${colors.border}`, boxSizing: 'border-box' }} />
                </div>
                <div>
                  <label style={{ display: 'block', fontSize: 13, fontWeight: 600, marginBottom: 4 }}>Umbral Máximo</label>
                  <input type="number" value={nuevoTag.max} onChange={e => setNuevoTag({...nuevoTag, max: Number(e.target.value)})} style={{ width: '100%', padding: '8px', borderRadius: 4, border: `1px solid ${colors.border}`, boxSizing: 'border-box' }} />
                </div>
              </div>
              <div style={{ marginBottom: 20 }}>
                <label style={{ display: 'block', fontSize: 13, fontWeight: 600, marginBottom: 4 }}>Severidad de Alarma</label>
                <select value={nuevoTag.severidad} onChange={e => setNuevoTag({...nuevoTag, severidad: e.target.value})} style={{ width: '100%', padding: 8, borderRadius: 4, border: `1px solid ${colors.border}`, boxSizing: 'border-box' }}>
                  <option value="baja">Baja</option>
                  <option value="media">Media</option>
                  <option value="alta">Alta</option>
                  <option value="critica">Crítica</option>
                </select>
              </div>
              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 10 }}>
                <button type="button" onClick={() => setModalAbierto(false)} style={{ padding: '8px 16px', background: '#e2e8f0', border: 'none', borderRadius: 4, cursor: 'pointer', fontWeight: 600 }}>Cancelar</button>
                <button type="submit" style={{ padding: '8px 16px', background: '#0284c7', color: '#fff', border: 'none', borderRadius: 4, cursor: 'pointer', fontWeight: 600 }}>Guardar y Asociar</button>
              </div>
            </form>
          </div>
        </div>
      )}

    </Layout>
  );
}