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
  enviarMensajeGrupo,
  getWhatsAppKey,
} from '../../services/whatsappApi';
import { getEquiposCriticos } from '../../services/api';

// Componentes locales
import GrupoVinculadoLista from './components/GrupoVinculadoLista';
import GrupoRealSelector from './components/GrupoRealSelector';
import QRDisplay from './components/QRDisplay';
import EquipoCriticoSelector from './components/EquipoCriticoSelector';
import MensajePruebaInput from './components/MensajePruebaInput';

interface Props {
  usuarioNombre: string;
  onLogout: () => void;
  onNavigate: (page: string, params?: any) => void;
  onBack?: () => void;
}

export default function NotificacionesContent({ usuarioNombre, onLogout, onNavigate, onBack }: Props) {
  // Estados globales del módulo
  const [gruposVinculados, setGruposVinculados] = useState<any[]>([]);
  const [criticos, setCriticos] = useState<any[]>([]);
  const [grupoSeleccionado, setGrupoSeleccionado] = useState<any>(null);
  const [equiposGrupo, setEquiposGrupo] = useState<any[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [mensajePrueba, setMensajePrueba] = useState('');

  // WhatsApp
  const [estadoWA, setEstadoWA] = useState<any>(null);
  const [mostrarVinculacion, setMostrarVinculacion] = useState(false);
  const [qrImage, setQrImage] = useState<string | null>(null);
  const [gruposReales, setGruposReales] = useState<any[]>([]);
  const [verificando, setVerificando] = useState(false);

  const showMsg = (msg: string, isError = false) => {
    if (isError) {
      setError(msg);
      setTimeout(() => setError(null), 4000);
    } else {
      setSuccess(msg);
      setTimeout(() => setSuccess(null), 3000);
    }
  };

  // Cargar datos iniciales
  const cargarDatos = useCallback(async () => {
    const [g, c] = await Promise.all([getGrupos(), getEquiposCriticos()]);
    setGruposVinculados(g);
    setCriticos(c);
  }, []);

  useEffect(() => {
    cargarDatos();
  }, [cargarDatos]);

  // Verificar estado WhatsApp cada 30s
  useEffect(() => {
    const verificar = async () => {
      try {
        const res = await fetch(`/api/whatsapp/estado?api_key=${getWhatsAppKey()}`);
        const data = await res.json();
        setEstadoWA(data);
        if (data.conectado) {
          const gruposRes = await fetch(`/api/whatsapp/grupos?api_key=${getWhatsAppKey()}`);
          const gruposData = await gruposRes.json();
          if (Array.isArray(gruposData)) setGruposReales(gruposData);
        }
      } catch {}
    };
    verificar();
    const interval = setInterval(verificar, 30000);
    return () => clearInterval(interval);
  }, []);

  // Handlers
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
      if (grupoSeleccionado?.id === id) {
        setGrupoSeleccionado(null);
        setEquiposGrupo([]);
      }
      cargarDatos();
    } catch (err: any) {
      showMsg(err.message || 'Error al eliminar', true);
    }
  };

  const handleVincularGrupo = async (jid: string, nombre: string) => {
    try {
      await createGrupo({ nombre, jid });
      showMsg('Grupo vinculado exitosamente');
      setMostrarVinculacion(false);
      setQrImage(null);
      cargarDatos();
    } catch (err: any) {
      showMsg(err.message || 'Error al vincular grupo', true);
    }
  };

  const handleAsociar = async (equipoId: number) => {
    if (!grupoSeleccionado) return;
    try {
      await asociarEquipoAGrupo(equipoId, grupoSeleccionado.id);
      showMsg('Equipo asociado');
      const data = await getEquiposDeGrupo(grupoSeleccionado.id);
      setEquiposGrupo(data);
    } catch (err: any) {
      showMsg(err.message || 'Error al asociar', true);
    }
  };

  const handleDesasociar = async (equipoId: number) => {
    if (!grupoSeleccionado) return;
    try {
      await desasociarEquipoDeGrupo(equipoId, grupoSeleccionado.id);
      showMsg('Equipo desasociado');
      const data = await getEquiposDeGrupo(grupoSeleccionado.id);
      setEquiposGrupo(data);
    } catch (err: any) {
      showMsg(err.message || 'Error al desasociar', true);
    }
  };

  const handleEnviarMensaje = async () => {
    if (!grupoSeleccionado || !mensajePrueba.trim()) return;
    try {
      await enviarMensajeGrupo(grupoSeleccionado.id, mensajePrueba);
      showMsg('Mensaje enviado');
      setMensajePrueba('');
    } catch (err: any) {
      showMsg(err.message || 'Error al enviar', true);
    }
  };

  const handleIniciarBot = async () => {
    setVerificando(true);
    try {
      const res = await fetch(`/api/whatsapp/iniciar?api_key=${getWhatsAppKey()}`, { method: 'POST' });
      const data = await res.json();
      if (data.qr) {
        setQrImage(data.qr);
        setMostrarVinculacion(true);
      } else if (data.grupos) {
        setGruposReales(data.grupos);
        setMostrarVinculacion(true);
        showMsg('¡Bot conectado!');
      } else {
        showMsg('Bot iniciado, pero no se obtuvieron datos.', true);
      }
    } catch (err: any) {
      showMsg(err.message || 'Error al iniciar bot', true);
    } finally {
      setVerificando(false);
    }
  };

  const handleVerificarConexion = async () => {
    setVerificando(true);
    try {
      const res = await fetch(`/api/whatsapp/iniciar?api_key=${getWhatsAppKey()}`, { method: 'POST' });
      const data = await res.json();
      if (data.grupos) {
        setGruposReales(data.grupos);
        setQrImage(null);
        showMsg('¡Conexión exitosa!');
      } else if (data.qr) {
        setQrImage(data.qr);
        showMsg('Aún no se ha escaneado el QR', true);
      }
    } catch {
      showMsg('Error al verificar', true);
    } finally {
      setVerificando(false);
    }
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
      {/* Barra de usuario */}
      <div
        style={{
          display: 'flex',
          justifyContent: 'flex-end',
          alignItems: 'center',
          gap: spacing.sm,
          marginBottom: spacing.lg,
        }}
      >
        <span
          style={{
            fontSize: 11,
            fontWeight: 600,
            color: colors.status.success,
            background: colors.status.successBg,
            padding: '4px 10px',
            borderRadius: 20,
          }}
        >
          ● {usuarioNombre}
        </span>
        <Button variant="ghost" onClick={onLogout}>
          Salir
        </Button>
      </div>

      {error && (
        <div
          style={{
            padding: spacing.sm,
            marginBottom: spacing.md,
            background: colors.status.errorBg,
            color: colors.status.error,
            borderRadius: 6,
            fontSize: 13,
          }}
        >
          {error}
        </div>
      )}
      {success && (
        <div
          style={{
            padding: spacing.sm,
            marginBottom: spacing.md,
            background: colors.status.successBg,
            color: colors.status.success,
            borderRadius: 6,
            fontSize: 13,
          }}
        >
          {success}
        </div>
      )}

      {/* Botón principal */}
      <div style={{ marginBottom: spacing.lg }}>
        {estadoWA?.conectado ? (
          <Button
            icon="🔗"
            onClick={async () => {
              const gruposRes = await fetch(
                `/api/whatsapp/grupos?api_key=${getWhatsAppKey()}`
              );
              const gruposData = await gruposRes.json();
              setGruposReales(gruposData || []);
              setMostrarVinculacion(true);
            }}
          >
            Vincular Grupo de WhatsApp
          </Button>
        ) : (
          <Button icon="📱" onClick={handleIniciarBot} disabled={verificando}>
            {verificando ? 'Iniciando...' : 'Iniciar Bot WhatsApp'}
          </Button>
        )}
      </div>

      {/* Modal de vinculación / QR */}
      {mostrarVinculacion && (
        <>
          {qrImage ? (
            <QRDisplay qrImage={qrImage} onVerificar={handleVerificarConexion} verificando={verificando} />
          ) : (
            <GrupoRealSelector
              grupos={gruposReales}
              onVincular={handleVincularGrupo}
              onCerrar={() => {
                setMostrarVinculacion(false);
                setQrImage(null);
              }}
            />
          )}
        </>
      )}

      {/* Grid principal */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: spacing.lg }}>
        <GrupoVinculadoLista
          grupos={gruposVinculados}
          grupoSeleccionado={grupoSeleccionado}
          onSeleccionar={handleSelectGrupo}
          onEliminar={handleDeleteGrupo}
        />
        <Card padding={20} hover={false}>
          <EquipoCriticoSelector
            grupoNombre={grupoSeleccionado?.nombre}
            equiposAsignados={equiposGrupo}
            equiposDisponibles={equiposDisponibles}
            onAsociar={handleAsociar}
            onDesasociar={handleDesasociar}
          />
          {grupoSeleccionado && (
            <MensajePruebaInput
              mensaje={mensajePrueba}
              onChange={setMensajePrueba}
              onEnviar={handleEnviarMensaje}
            />
          )}
        </Card>
      </div>
    </Layout>
  );
}