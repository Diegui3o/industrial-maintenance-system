import { useState, useEffect, useCallback } from 'react';
import Layout from '../../components/Layout';
import Card from '../../components/Card';
import Button from '../../components/Button';
import { colors, spacing } from '../../theme/colors';
import {
  getGrupos,
  createGrupo,
  deleteGrupo,
  getEquiposDeGrupo,
  asociarEquipoAGrupo,
  desasociarEquipoDeGrupo,
} from '../../services/whatsappApi';
import { getEquiposCriticos } from '../../services/api';

import GrupoVinculadoLista from './components/GrupoVinculadoLista';
import EquipoCriticoManager from './components/EquipoCriticoManager'; // 👈 reemplazado
import WhatsAppPanel from './components/WhatsAppPanel';

interface Props {
  usuarioNombre: string;
  apiKey: string;
  onLogout: () => void;
  onNavigate: (page: string, params?: any) => void;
  onBack?: () => void;
}

export default function NotificacionesContent({ usuarioNombre, apiKey, onLogout, onNavigate, onBack }: Props) {
  const [gruposVinculados, setGruposVinculados] = useState<any[]>([]);
  const [criticos, setCriticos] = useState<any[]>([]);
  const [grupoSeleccionado, setGrupoSeleccionado] = useState<any>(null);
  const [equiposGrupo, setEquiposGrupo] = useState<any[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  const showMsg = (msg: string, isError = false) => {
    if (isError) { setError(msg); setTimeout(() => setError(null), 4000); }
    else { setSuccess(msg); setTimeout(() => setSuccess(null), 3000); }
  };

  const cargarDatos = useCallback(async () => {
    const [g, c] = await Promise.all([getGrupos(), getEquiposCriticos()]);
    setGruposVinculados(g);
    setCriticos(c);
  }, []);

  useEffect(() => { cargarDatos(); }, [cargarDatos]);

  const handleSelectGrupo = async (grupo: any) => {
    setGrupoSeleccionado(grupo);
    const data = await getEquiposDeGrupo(grupo.id);
    setEquiposGrupo(data);
  };

  const handleDeleteGrupo = async (id: number) => {
    if (!confirm('¿Eliminar este grupo?')) return;
    try {
      await deleteGrupo(id);
      showMsg('Grupo eliminado');
      if (grupoSeleccionado?.id === id) { setGrupoSeleccionado(null); setEquiposGrupo([]); }
      cargarDatos();
    } catch (err: any) { showMsg(err.message || 'Error al eliminar', true); }
  };

  const handleVincularGrupo = async (jid: string, nombre: string) => {
    try {
      await createGrupo({ nombre, jid });
      showMsg('Grupo vinculado exitosamente');
      cargarDatos();
    } catch (err: any) { showMsg(err.message || 'Error al vincular grupo', true); }
  };

  const handleAsociar = async (equipoId: number) => {
    if (!grupoSeleccionado) return;
    try {
      await asociarEquipoAGrupo(equipoId, grupoSeleccionado.id);
      showMsg('Equipo asociado');
      const data = await getEquiposDeGrupo(grupoSeleccionado.id);
      setEquiposGrupo(data);
    } catch (err: any) { showMsg(err.message || 'Error al asociar', true); }
  };

  const handleDesasociar = async (equipoId: number) => {
    if (!grupoSeleccionado) return;
    try {
      await desasociarEquipoDeGrupo(equipoId, grupoSeleccionado.id);
      showMsg('Equipo desasociado');
      const data = await getEquiposDeGrupo(grupoSeleccionado.id);
      setEquiposGrupo(data);
    } catch (err: any) { showMsg(err.message || 'Error al desasociar', true); }
  };

  const equiposDisponibles = criticos.filter(
    (c: any) => !equiposGrupo.find((e: any) => e.id === c.id)
  );

  return (
    <Layout
      title="🔔 Notificaciones"
      subtitle="Grupos de WhatsApp y alertas por equipo"
      onBack={onBack || (() => onNavigate('dashboard'))}
    >
      <div style={{ display: 'flex', justifyContent: 'flex-end', alignItems: 'center', gap: spacing.sm, marginBottom: spacing.lg }}>
        <span style={{ fontSize: 11, fontWeight: 600, color: colors.status.success, background: colors.status.successBg, padding: '4px 10px', borderRadius: 20 }}>
          ● {usuarioNombre}
        </span>
        <Button variant="ghost" onClick={onLogout}>Salir</Button>
      </div>

      {error && <div style={{ padding: spacing.sm, marginBottom: spacing.md, background: colors.status.errorBg, color: colors.status.error, borderRadius: 6, fontSize: 13 }}>{error}</div>}
      {success && <div style={{ padding: spacing.sm, marginBottom: spacing.md, background: colors.status.successBg, color: colors.status.success, borderRadius: 6, fontSize: 13 }}>{success}</div>}

      <WhatsAppPanel
        apiKey={apiKey}
        onVincular={handleVincularGrupo}
        vinculadosJIDs={gruposVinculados.map(g => g.jid)}
      />

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: spacing.lg }}>
        <GrupoVinculadoLista
          grupos={gruposVinculados}
          grupoSeleccionado={grupoSeleccionado}
          onSeleccionar={handleSelectGrupo}
          onEliminar={handleDeleteGrupo}
        />
        <Card padding={20} hover={false}>
          <EquipoCriticoManager
            grupoNombre={grupoSeleccionado?.nombre}
            equiposAsignados={equiposGrupo}
            equiposDisponibles={equiposDisponibles}
            onAsociar={handleAsociar}
            onDesasociar={handleDesasociar}
          />
        </Card>
      </div>
    </Layout>
  );
}