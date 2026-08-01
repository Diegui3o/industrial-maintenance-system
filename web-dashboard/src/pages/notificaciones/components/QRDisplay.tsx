import Button from '../../../components/Button';
import { colors, spacing } from '../../../theme/colors';

interface Props {
  qrImage: string;
  onVerificar: () => void;
  verificando?: boolean;
}

export default function QRDisplay({ qrImage, onVerificar, verificando }: Props) {
  return (
    <div style={{ textAlign: 'center', padding: spacing.lg }}>
      <img
        src={qrImage}
        alt="QR WhatsApp"
        style={{ width: 250, height: 250, margin: '0 auto', display: 'block' }}
      />
      <p style={{ fontSize: 12, color: colors.text.muted, marginTop: spacing.sm }}>
        Escanea este QR con WhatsApp<br />
        WhatsApp → Dispositivos vinculados → Vincular dispositivo
      </p>
      <Button icon="🔄" onClick={onVerificar} disabled={verificando}>
        {verificando ? 'Verificando...' : 'Verificar conexión'}
      </Button>
    </div>
  );
}