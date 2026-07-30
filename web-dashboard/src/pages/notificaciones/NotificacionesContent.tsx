import { useState, useCallback, useEffect } from 'react';
import Layout from '../../components/Layout';
import Card from '../../components/Card';
import Button from '../../components/Button';
import { colors, spacing } from '../../theme/colors';
import {
  getGrupos, createGrupo, deleteGrupo,
  getEquiposDeGrupo, asociarEquipoAGrupo, desasociarEquipoDeGrupo,
  getGruposReales, enviarMensajeGrupo,
} from '../../services/whatsappApi';
import { getEquiposCriticos } from '../../services/api';

interface Props {
  usuarioNombre: string;
  onLogout: () => void;
  onNavigate: (page: string, params?: any) => void;
  onBack?: () => void;
}

export default function NotificacionesContent({ usuarioNombre, onLogout, onNavigate, onBack }: Props) {
  const [grupos, setGrupos] = useState<any[]>([]);
  const [criticos, setCriticos] = useState<any[]>([]);
  const [selectedGrupo, setSelectedGrupo] = useState<any>(null);
  const [equiposGrupo, setEquiposGrupo] = useState<any[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [mensajePrueba, setMensajePrueba] = useState('');
  const [gruposReales, setGruposReales] = useState<any[]>([]);
  const [showVinculacion, setShowVinculacion] = useState(false);

  const cargarDatos = useCallback(async () => {
    const [g, c] = await Promise.all([getGrupos(), getEquiposCriticos()]);
    setGrupos(g);
    setCriticos(c);
  }, []);

  useEffect(() => { cargarDatos(); }, [cargarDatos]);

  const showMsg = (msg: string, isError = false) => {
    if (isError) { setError(msg); setTimeout(() => setError(null), 4000); }
    else { setSuccess(msg); setTimeout(() => setSuccess(null), 3000); }
  };

  const handleSelectGrupo = async (grupo: any) => {
    setSelectedGrupo(grupo);
    const data = await getEquiposDeGrupo(grupo.id);
    setEquiposGrupo(data);
  };

  const handleDelete = async (id: number) => {
    if (!confirm('¿Eliminar este grupo?')) return;
    try {
      await deleteGrupo(id);
      showMsg('Grupo eliminado');
      if (selectedGrupo?.id === id) { setSelectedGrupo(null); setEquiposGrupo([]); }
      cargarDatos();
    } catch (err: any) { showMsg(err.message || 'Error al eliminar', true); }
  };

  const handleAsociar = async (equipoId: number) => {
    if (!selectedGrupo) return;
    try {
      await asociarEquipoAGrupo(equipoId, selectedGrupo.id);
      showMsg('Equipo asociado');
      const data = await getEquiposDeGrupo(selectedGrupo.id);
      setEquiposGrupo(data);
    } catch (err: any) { showMsg(err.message || 'Error al asociar', true); }
  };

  const handleDesasociar = async (equipoId: number) => {
    if (!selectedGrupo) return;
    try {
      await desasociarEquipoDeGrupo(equipoId, selectedGrupo.id);
      showMsg('Equipo desasociado');
      const data = await getEquiposDeGrupo(selectedGrupo.id);
      setEquiposGrupo(data);
    } catch (err: any) { showMsg(err.message || 'Error al desasociar', true); }
  };

  const handleEnviarMensaje = async () => {
    if (!selectedGrupo || !mensajePrueba.trim()) return;
    try {
      await enviarMensajeGrupo(selectedGrupo.id, mensajePrueba);
      showMsg('Mensaje enviado');
      setMensajePrueba('');
    } catch (err: any) { showMsg(err.message || 'Error al enviar', true); }
  };

  const handleVincularGrupo = async (jid: string, nombre: string) => {
    try {
      await createGrupo({ nombre, jid });
      showMsg('Grupo vinculado');
      setShowVinculacion(false);
      cargarDatos();
    } catch (err: any) { showMsg(err.message || 'Error al vincular', true); }
  };

  const equiposDisponibles = criticos.filter((c: any) => !equiposGrupo.find(e => e.id === c.id));

  return (
    <Layout
      title="🔔 Notificaciones"
      subtitle="Grupos de WhatsApp y alertas por equipo"
      onBack={onBack || (() => onNavigate('dashboard'))}
    >
      {/* Barra de usuario */}
      <div style={{ display: 'flex', justifyContent: 'flex-end', alignItems: 'center', gap: spacing.sm, marginBottom: spacing.lg }}>
        <span style={{ fontSize: 11, fontWeight: 600, color: colors.status.success, background: colors.status.successBg, padding: '4px 10px', borderRadius: 20 }}>
          ● {usuarioNombre}
        </span>
        <Button variant="ghost" onClick={onLogout}>Salir</Button>
      </div>

      {error && <div style={{ padding: spacing.sm, marginBottom: spacing.md, background: colors.status.errorBg, color: colors.status.error, borderRadius: 6, fontSize: 13 }}>{error}</div>}
      {success && <div style={{ padding: spacing.sm, marginBottom: spacing.md, background: colors.status.successBg, color: colors.status.success, borderRadius: 6, fontSize: 13 }}>{success}</div>}

      <div style={{ marginBottom: spacing.lg }}>
        <Button icon="🔗" onClick={() => { setShowVinculacion(true); getGruposReales().then(setGruposReales); }}>
          Vincular Grupo de WhatsApp
        </Button>
      </div>

      {showVinculacion && (
        <Card padding={24} hover={false} style={{ marginBottom: spacing.lg, border: `2px solid #25D366` }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: spacing.md }}>
            <h3 style={{ fontSize: 16, margin: 0, color: '#25D366' }}>📱 Vincular Grupo</h3>
            <Button variant="ghost" onClick={() => setShowVinculacion(false)}>✕ Cerrar</Button>
          </div>
          {gruposReales.length === 0 ? (
            <p style={{ fontSize: 13, color: colors.text.muted }}>No se encontraron grupos o el bot no está conectado.</p>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: spacing.sm }}>
              {gruposReales.map((g: any) => (
                <div key={g.jid} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: spacing.md, background: colors.surfaceMuted, borderRadius: 6 }}>
                  <div>
                    <div style={{ fontWeight: 600, fontSize: 14 }}>{g.nombre || 'Grupo'}</div>
                    <div style={{ fontSize: 11, color: colors.text.muted }}>{g.jid}</div>
                  </div>
                  <Button icon="🔗" onClick={() => handleVincularGrupo(g.jid, g.nombre || 'Grupo')}>Vincular</Button>
                </div>
              ))}
            </div>
          )}
        </Card>
      )}

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: spacing.lg }}>
        <Card padding={20} hover={false}>
          <h3 style={{ fontSize: 16, margin: 0, marginBottom: spacing.md }}>📱 Grupos Vinculados</h3>
          {grupos.length === 0 ? <p style={{ color: colors.text.muted, fontSize: 13 }}>No hay grupos.</p> : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: spacing.sm }}>
              {grupos.map((g: any) => (
                <div key={g.id} onClick={() => handleSelectGrupo(g)} style={{ padding: spacing.md, background: selectedGrupo?.id === g.id ? colors.primaryGhost : colors.surfaceMuted, borderRadius: 6, cursor: 'pointer', border: selectedGrupo?.id === g.id ? `1px solid ${colors.primary}` : '1px solid transparent', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <div><div style={{ fontWeight: 600, fontSize: 14 }}>{g.nombre}</div><div style={{ fontSize: 11, color: colors.text.muted }}>{g.jid}</div></div>
                  <div onClick={e => e.stopPropagation()}><Button variant="ghost" icon="🗑️" onClick={() => handleDelete(g.id)}>Eliminar</Button></div>
                </div>
              ))}
            </div>
          )}
        </Card>

        <Card padding={20} hover={false}>
          <h3 style={{ fontSize: 16, margin: 0, marginBottom: spacing.md }}>{selectedGrupo ? `Equipos en "${selectedGrupo.nombre}"` : 'Selecciona un grupo'}</h3>
          {!selectedGrupo ? <p style={{ color: colors.text.muted, fontSize: 13 }}>Haz clic en un grupo para ver sus equipos.</p> : (
            <>
              {equiposGrupo.length === 0 ? <p style={{ color: colors.text.muted, fontSize: 13, marginBottom: spacing.md }}>Sin equipos.</p> : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: spacing.sm, marginBottom: spacing.md }}>
                  {equiposGrupo.map((e: any) => (
                    <div key={e.id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: spacing.sm, background: colors.surfaceMuted, borderRadius: 6 }}>
                      <div><div style={{ fontWeight: 600, fontSize: 13 }}>{e.codigo} - {e.nombre}</div><div style={{ fontSize: 11, color: colors.text.muted }}>{e.area}</div></div>
                      <Button variant="ghost" icon="✕" onClick={() => handleDesasociar(e.id)}>Quitar</Button>
                    </div>
                  ))}
                </div>
              )}
              {equiposDisponibles.length > 0 && (
                <div style={{ marginBottom: spacing.md }}>
                  <div style={{ fontSize: 12, fontWeight: 600, marginBottom: spacing.sm }}>Agregar equipos críticos:</div>
                  <select defaultValue="" onChange={e => { const id = parseInt(e.target.value); if (id) handleAsociar(id); e.target.value = ''; }} style={{ width: '100%', padding: spacing.sm }}>
                    <option value="">-- Seleccionar --</option>
                    {equiposDisponibles.map((e: any) => <option key={e.id} value={e.id}>{e.codigo} - {e.nombre}</option>)}
                  </select>
                </div>
              )}
              <div style={{ borderTop: `1px solid ${colors.borderLight}`, paddingTop: spacing.md }}>
                <div style={{ fontSize: 12, fontWeight: 600, marginBottom: spacing.sm }}>Mensaje de prueba:</div>
                <textarea value={mensajePrueba} onChange={e => setMensajePrueba(e.target.value)} placeholder="Escribe un mensaje..." style={{ width: '100%', padding: spacing.sm, marginBottom: spacing.sm, minHeight: 60, borderRadius: 6, border: `1px solid ${colors.border}` }} />
                <Button icon="📤" onClick={handleEnviarMensaje} disabled={!mensajePrueba.trim()}>Enviar</Button>
              </div>
            </>
          )}
        </Card>
      </div>
    </Layout>
  );
}