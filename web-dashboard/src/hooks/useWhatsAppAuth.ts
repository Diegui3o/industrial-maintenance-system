import { useState, useCallback } from 'react';
import { verificarKey, setWhatsAppKey, clearWhatsAppKey } from '../services/whatsappApi';

interface AuthState {
  autenticado: boolean;
  usuarioNombre: string;
  apiKey: string;
  error: string | null;
  verificando: boolean;
}

export function useWhatsAppAuth() {
  const [state, setState] = useState<AuthState>({
    autenticado: false,
    usuarioNombre: '',
    apiKey: '',
    error: null,
    verificando: false,
  });

  const login = useCallback(async (key: string) => {
    const trimmedKey = key.trim();
    if (!trimmedKey) {
      setState(s => ({ ...s, error: 'Ingresa tu API Key', autenticado: false }));
      return false;
    }

    setState(s => ({ ...s, verificando: true, error: null }));

    try {
      const usuarios = await verificarKey(trimmedKey);

      if (!Array.isArray(usuarios) || usuarios.length === 0) {
        setState(s => ({ ...s, error: 'API Key inválida', verificando: false, autenticado: false }));
        return false;
      }

      const usuario = usuarios[0];
      setWhatsAppKey(trimmedKey);

      setState({
        autenticado: true,
        usuarioNombre: usuario.nombre || usuario.username || 'Usuario',
        apiKey: trimmedKey,
        error: null,
        verificando: false,
      });

      return true;
    } catch {
      setState(s => ({ ...s, error: 'Error al verificar. Intenta de nuevo.', verificando: false, autenticado: false }));
      return false;
    }
  }, []);

  const logout = useCallback(() => {
    clearWhatsAppKey();
    setState({
      autenticado: false,
      usuarioNombre: '',
      apiKey: '',
      error: null,
      verificando: false,
    });
  }, []);

  return { ...state, login, logout };
}