// hooks/useWhatsAppState.ts
import { useState, useEffect, useCallback } from 'react';
import { getWhatsAppKey } from '../services/whatsappApi';

interface WhatsAppState {
  conectado: boolean;
  loggeado: boolean;
  qr_disponible: boolean;
  gruposReales: { jid: string; nombre: string }[];
  cargando: boolean;
}

export function useWhatsAppState() {
  const [estado, setEstado] = useState<WhatsAppState>({
    conectado: false,
    loggeado: false,
    qr_disponible: false,
    gruposReales: [],
    cargando: true,
  });

  const fetchEstado = useCallback(async () => {
    setEstado(prev => ({ ...prev, cargando: true }));
    try {
      const res = await fetch(`/api/whatsapp/estado_completo?api_key=${getWhatsAppKey()}`);
      const data = await res.json();
      setEstado({
        conectado: data.conectado ?? false,
        loggeado: data.loggeado ?? false,
        qr_disponible: data.qr_disponible ?? false,
        gruposReales: data.grupos || [],
        cargando: false,
      });
    } catch {
      setEstado(prev => ({ ...prev, cargando: false }));
    }
  }, []);

  useEffect(() => {
    fetchEstado();
  }, [fetchEstado]);

  return { ...estado, recargar: fetchEstado };
}