import { useWhatsAppAuth } from '../hooks/useWhatsAppAuth';
import Layout from '../components/Layout';
import WhatsAppLogin from '../components/WhatsAppLogin';
import NotificacionesContent from './notificaciones/NotificacionesContent';

interface Props {
  onNavigate: (page: string, params?: any) => void;
  onBack?: () => void;
}

export default function NotificacionesPage({ onNavigate }: Props) {
  const auth = useWhatsAppAuth();

  // Cerrar sesión al salir
  const handleBack = () => {
    auth.logout();
    onNavigate('dashboard');
  };

  if (!auth.autenticado) {
    return (
      <Layout title="🔔 Notificaciones" subtitle="Acceso restringido" onBack={handleBack}>
        <WhatsAppLogin onLogin={auth.login} error={auth.error} verificando={auth.verificando} />
      </Layout>
    );
  }

  return (
    <NotificacionesContent
      usuarioNombre={auth.usuarioNombre}
      onLogout={handleBack}
      onNavigate={onNavigate}
      onBack={handleBack}
    />
  );
}