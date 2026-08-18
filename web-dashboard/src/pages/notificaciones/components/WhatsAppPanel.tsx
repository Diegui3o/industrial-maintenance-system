import { useState, useEffect, useRef, useImperativeHandle, forwardRef } from 'react';
import Button from '../../../components/Button';
import { colors, spacing } from '../../../theme/colors';
import QRDisplay from './QRDisplay';
import GrupoRealSelector from './GrupoRealSelector';

interface Props {
  onVincular: (jid: string, nombre: string) => void;
  apiKey: string;
  vinculadosJIDs?: string[];
}

const WhatsAppPanel = forwardRef<any, Props>(({ onVincular, apiKey, vinculadosJIDs = [] }, ref) => {
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
  const [qrImage, setQrImage] = useState<string | null>(null);
  const llamadoRef = useRef(false);

  useImperativeHandle(ref, () => ({ refresh }));

  const refresh = async () => {
    setAccionando(true);
    setErrorFetch(null);
    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 10000);

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

  useEffect(() => {
    if (!llamadoRef.current) {
      llamadoRef.current = true;
      refresh();
    }
  }, []);

  useEffect(() => {
    if (estado.qrDisponible && !estado.loggeado) {
      setMostrarVinculacion(true);
    }
  }, [estado.qrDisponible, estado.loggeado]);

  useEffect(() => {
    if (estado.qrDisponible && !estado.loggeado) {
      const interval = setInterval(async () => {
        await fetch(`/api/whatsapp/reiniciar?api_key=${apiKey}`, { method: 'POST' });
        await new Promise(r => setTimeout(r, 500));
        await refresh();
      }, 15000);
      return () => clearInterval(interval);
    }
  }, [estado.qrDisponible, estado.loggeado]);

  const gruposFiltrados = estado.grupos.filter(g => !vinculadosJIDs.includes(g.jid));

  if (cargando) {
    return (
      <div style={{ marginBottom: spacing.lg }}>
        <p style={{ color: colors.text.muted }}>Conectando con el bot…</p>
        <Button variant="ghost" icon="🔄" onClick={refresh} disabled={accionando}>
          Reintentar
        </Button>
        {errorFetch && (
          <p style={{ color: colors.status.error, fontSize: 13, marginTop: spacing.sm }}>{errorFetch}</p>
        )}
      </div>
    );
  }

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

      {mostrarVinculacion && estado.qrDisponible && !estado.loggeado && (
        <div style={{ marginBottom: spacing.md }}>
          {qrImage ? (
            <img src={qrImage} alt="QR" style={{ width: 250, height: 250 }} />
          ) : (
            <QRDisplay qrUrl={`/api/whatsapp/qr?api_key=${apiKey}`} onVerificar={refresh} verificando={accionando} />
          )}

          {/* Botón para forzar un QR nuevo */}
          <Button
            variant="ghost"
            icon="🔄"
            onClick={async () => {
              setAccionando(true);
              try {
                await fetch(`/api/whatsapp/reiniciar?api_key=${apiKey}`, { method: 'POST' });
                await new Promise(r => setTimeout(r, 500));
                await refresh();
              } catch (err) {
                setErrorFetch('Error al regenerar QR');
              } finally {
                setAccionando(false);
              }
            }}
            disabled={accionando}
          >
            Generar nuevo QR
          </Button>
        </div>
      )}

      {estado.loggeado ? (
        <>
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

          {mostrarVinculacion && (
            <div style={{ marginTop: spacing.md }}>
              {gruposFiltrados.length === 0 ? (
                <p style={{ fontSize: 13, color: colors.text.muted }}>No hay grupos disponibles (todos los grupos del bot ya están vinculados).</p>
              ) : (
                <GrupoRealSelector
                  grupos={gruposFiltrados}
                  onVincular={(jid, nombre) => {
                    onVincular(jid, nombre);
                    setMostrarVinculacion(false);
                  }}
                  onCerrar={() => setMostrarVinculacion(false)}
                />
              )}
            </div>
          )}
        </>
      ) : (
        !estado.qrDisponible && (
          <Button
            icon="📱"
            onClick={async () => {
              setAccionando(true);
              setErrorFetch(null);
              try {
                const res = await fetch(`/api/whatsapp/iniciar?api_key=${apiKey}`, { method: 'POST' });
                const data = await res.json();

                if (data.qr) {
                  // El backend devuelve un QR en base64
                  setEstado(prev => ({ ...prev, qrDisponible: true }));
                  // Guardar la imagen en un estado local para QRDisplay
                  setQrImage(data.qr); // 👈 agrega un nuevo estado `qrImage`
                  setMostrarVinculacion(true);
                } else if (data.grupos) {
                  setEstado({
                    conectado: true,
                    loggeado: true,
                    qrDisponible: false,
                    grupos: data.grupos,
                  });
                  setMostrarVinculacion(false);
                  setQrImage(null);
                } else {
                  await refresh();
                }
              } catch (err: any) {
                setErrorFetch(err.message || 'Error al iniciar bot');
              } finally {
                setAccionando(false);
              }
            }}
            disabled={accionando}
          >
            {accionando ? 'Iniciando…' : 'Iniciar Bot WhatsApp'}
          </Button>
        )
      )}
    </div>
  );
});

WhatsAppPanel.displayName = 'WhatsAppPanel';
export default WhatsAppPanel;