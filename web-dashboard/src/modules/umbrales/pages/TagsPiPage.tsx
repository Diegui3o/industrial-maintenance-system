// src/modules/umbrales/pages/TagsPiPage.tsx
import { useState } from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { colors, spacing } from '../../../theme/colors';
import Layout from '../../../shared/components/Layout';
import JerarquiaCascadeSelector from '../components/JerarquiaCascadeSelector';
import AsignacionTagPanel from '../components/AsignacionTagPanel';
import { piTagsApi } from '../services/piTagsApi';
import type { SeleccionJerarquica } from '../../../shared/types/seleccionJerarquica';

interface Props {
  onNavigate: (page: string, params?: any) => void;
}

export default function TagsPiPage({ onNavigate }: Props) {
  const queryClient = useQueryClient();
  const [seleccion, setSeleccion] = useState<SeleccionJerarquica | null>(null);

  const descubiertosQuery = useQuery({
    queryKey: ['pi-tags-descubiertos-all'],
    queryFn: piTagsApi.getDescubiertos,
  });

  const totalDescubiertos = descubiertosQuery.data?.length ?? 0;

  return (
    <Layout
      title="Gestión de Tags PI System"
      subtitle="Vincula tags descubiertos a equipos del árbol jerárquico"
      onBack={() => onNavigate('dashboard')}
    >
      {/* Aviso: hoy solo se asignan a equipos */}
      <div
        style={{
          background: '#eff6ff',
          border: '1px solid #bfdbfe',
          borderRadius: 8,
          padding: '12px 16px',
          marginBottom: spacing.lg,
          fontSize: 13,
          color: '#1e40af',
        }}
      >
        ℹ️ Hoy solo se pueden asignar tags a <b>equipos</b>. Componentes y repuestos se
        habilitarán tras una migración del backend. Tags descubiertos sin asignar:{' '}
        <b>{descubiertosQuery.isLoading ? '…' : totalDescubiertos}</b>
      </div>

      {descubiertosQuery.isError && (
        <p style={{ color: '#b91c1c', fontSize: 13 }}>
          No se pudieron cargar los tags descubiertos. Verifica que el backend esté activo
          en http://127.0.0.1:1883.
        </p>
      )}

      {/* Selector jerárquico completo */}
      <JerarquiaCascadeSelector onSelect={setSeleccion} />

      {/* Panel de asignación cuando hay equipo seleccionado */}
      {seleccion?.equipoId && (
        <div style={{ marginTop: spacing.lg }}>
          <AsignacionTagPanel
            equipoId={seleccion.equipoId}
            equipoNombre={seleccion.labels?.equipo}
            onAsignado={() => {
              queryClient.invalidateQueries({ queryKey: ['pi-tags-descubiertos-all'] });
            }}
          />
        </div>
      )}

      {/* Estado vacío */}
      {!seleccion?.equipoId && (
        <p style={{ color: colors.text.muted, marginTop: spacing.lg }}>
          Selecciona un equipo en el árbol para ver y asignar sus tags PI.
        </p>
      )}
    </Layout>
  );
}