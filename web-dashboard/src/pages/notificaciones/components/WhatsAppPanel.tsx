import { useState, useEffect, useRef } from 'react';
import Button from '../../../components/Button';
import { colors, spacing } from '../../../theme/colors';
import QRDisplay from './QRDisplay';
import GrupoRealSelector from './GrupoRealSelector';

interface Props {
  onVincular: (jid: string, nombre: string) => void;
  getKey: () => string;
}

export default function WhatsAppPanel({ onVincular, getKey }: Props) {
  const [estado, setEstado] = useState({
    conectado: false,
    loggeado: false,
    qrDisponible: false,
    grupos: [] as any[],
  });
  const [cargando, setCargando] = useState(true);
  const [mostrarVinculacion, setMostrarVinculacion] = useState(false);
  const [accionando, setAccionando] = useState(false);
  const [errorFetch, setErrorFetch] = useState<string | null>(null);

  const apiKey = getKey();

  const refresh = async () => {
    setAccionando(true);
    setErrorFetch(null);
    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 10000); // 10 segundos máximo

      const res = await fetch(`/api/whatsapp/refresh?api_key=${apiKey}`, {
        method: 'POST',
        signal: controller.signal,
      });
      clearTimeout(timeoutId);

      if (!res.ok) throw new Error(`Error ${res.status}`);
      const data = await res.json();
      setEstado({
        conectado: data.conectado ?? false,
        loggeado: data.loggeado ?? false,
        qrDisponible: data.qr_disponible ?? false,
        grupos: data.grupos || [],
      });
    } catch (err: any) {
      if (err.name === 'AbortError') {
        setErrorFetch('La solicitud tardó demasiado. Reintenta.');
      } else {
        setErrorFetch(err.message || 'Error al conectar');
      }
    } finally {
      setCargando(false);
      setAccionando(false);
    }
  };

  // Llamar automáticamente al montar
  useEffect(() => {
    refresh();
  }, []);

  // Mostrar QR automáticamente si está disponible y no logueado
  useEffect(() => {
    if (estado.qrDisponible && !estado.loggeado) {
      setMostrarVinculacion(true);
    }
  }, [estado.qrDisponible, estado.loggeado]);

  return (
    <div style={{ marginBottom: spacing.lg }}>
      <div style={{ display: 'flex', gap: spacing.sm, alignItems: 'center', marginBottom: spacing.sm }}>
        <span
          style={{
            width: 10, height: 10, borderRadius: '50%',
            background: estado.loggeado ? colors.status.success : colors.status.warning,
            display: 'inline-block',
          }}
        />
        <span style={{ fontSize: 13, color: colors.text.secondary }}>
          {estado.loggeado ? 'Bot autenticado' : 'Requiere autenticación'}
        </span>
        <Button variant="ghost" icon="🔄" onClick={refresh} disabled={accionando}>
          Actualizar estado
        </Button>
      </div>

      {errorFetch && (
        <p style={{ color: colors.status.error, fontSize: 13, marginBottom: spacing.sm }}>{errorFetch}</p>
      )}

      {cargando ? (
        <div style={{ marginBottom: spacing.md }}>
          <p style={{ color: colors.text.muted }}>Conectando con el bot…</p>
          <Button variant="ghost" icon="🔄" onClick={refresh} disabled={accionando}>
            Reintentar
          </Button>
        </div>
      ) : (
        <>
          {mostrarVinculacion && estado.qrDisponible && !estado.loggeado && (
            <div style={{ marginBottom: spacing.md }}>
              <QRDisplay
                qrUrl={`/api/whatsapp/qr?api_key=${apiKey}`}
                onVerificar={refresh}
                verificando={accionando}
              />
            </div>
          )}

          {estado.loggeado ? (
            <div style={{ display: 'flex', gap: spacing.sm }}>
              <Button icon="🔗" onClick={() => setMostrarVinculacion(true)}>
                Vincular Grupo de WhatsApp
              </Button>
              <Button variant="ghost" icon="🔄" onClick={async () => {
                setAccionando(true);
                try {
                  await fetch(`/api/whatsapp/reiniciar?api_key=${apiKey}`, { method: 'POST' });
                  await new Promise(r => setTimeout(r, 800));
                  await refresh();
                } finally {
                  setAccionando(false);
                }
              }} disabled={accionando}>
                Reiniciar vinculación
              </Button>
            </div>
          ) : (
            !estado.qrDisponible && (
              <Button icon="📱" onClick={refresh} disabled={accionando}>
                {accionando ? 'Intentando…' : 'Iniciar Bot WhatsApp'}
              </Button>
            )
          )}

          {mostrarVinculacion && estado.loggeado && (
            <div style={{ marginTop: spacing.md }}>
              <GrupoRealSelector
                grupos={estado.grupos}
                onVincular={(jid, nombre) => {
                  onVincular(jid, nombre);
                  setMostrarVinculacion(false);
                }}
                onCerrar={() => setMostrarVinculacion(false)}
              />
            </div>
          )}
        </>
      )}
    </div>
  );
}