// src/modules/umbrales/pages/UmbralesPage.tsx
import { useMemo, useState } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { colors, spacing } from '../../../theme/colors';
import Layout from '../../../shared/components/Layout';
import Button from '../../../shared/components/Button';
import {
  getUmbrales,
  createUmbral,
  deleteUmbral,
  getTagsDescubiertos,
} from '../services/umbralesApi';
import { getTodosComponentes } from '../../../dashboard/DashboardAreas/Planta/services/plantaComponentesApi';
import { getRepuestos } from '../../../dashboard/DashboardAreas/Planta/services/plantaRepuestosApi';
import JerarquiaCascadeSelector from '../components/JerarquiaCascadeSelector';
import UmbralesTable from '../components/UmbralesTable';
import AsignacionTagPanel from '../components/AsignacionTagPanel';
import type { SeleccionJerarquica } from '../../../shared/types/seleccionJerarquica';

interface Props {
  onNavigate: (page: string, params?: any) => void;
}

export default function UmbralesPage({ onNavigate }: Props) {
  const queryClient = useQueryClient();

  // Selección del árbol (viene del nuevo selector)
  const [seleccion, setSeleccion] = useState<SeleccionJerarquica | null>(null);

  // Estado del modal de umbral
  const [modalAbierto, setModalAbierto] = useState(false);
  const [tagId, setTagId] = useState('');
  const [min, setMin] = useState('');
  const [max, setMax] = useState('');
  const [severidad, setSeveridad] = useState<'baja' | 'media' | 'alta' | 'critica'>('media');
  const [modo, setModo] = useState<'fallo' | 'alerta'>('alerta');
  const [mensaje, setMensaje] = useState('');

  // ── Queries ──────────────────────────────────────────────────
  const umbralesQuery = useQuery({
    queryKey: ['umbrales'],
    queryFn: getUmbrales,
  });

  const tagsQuery = useQuery({
    queryKey: ['pi-tags-descubiertos'],
    queryFn: getTagsDescubiertos,
  });

  const componentesQuery = useQuery({
    queryKey: ['todos-componentes'],
    queryFn: getTodosComponentes,
  });

  const repuestosQuery = useQuery({
    queryKey: ['repuestos'],
    queryFn: getRepuestos,
  });

  // ── Mutations ────────────────────────────────────────────────
  const crearMutation = useMutation({
    mutationFn: createUmbral,
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ['umbrales'] });
      setModalAbierto(false);
      setTagId('');
      setMin('');
      setMax('');
      setMensaje('Umbral guardado correctamente.');
    },
    onError: () =>
      setMensaje('No se pudo guardar el umbral. Revisa los datos e inténtalo nuevamente.'),
  });

  const eliminarMutation = useMutation({
    mutationFn: deleteUmbral,
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['umbrales'] }),
    onError: () => setMensaje('No se pudo desvincular el umbral.'),
  });

  // ── Datos derivados ─────────────────────────────────────────
  const umbrales = umbralesQuery.data ?? [];
  const tags = tagsQuery.data ?? [];
  const componentes = componentesQuery.data ?? [];
  const repuestos = repuestosQuery.data ?? [];

  const mapaTags = useMemo(() => new Map(tags.map((t) => [Number(t.id), t])), [tags]);
  const mapaComponentes = useMemo(
    () => new Map(componentes.map((c: any) => [Number(c.id), c])),
    [componentes],
  );
  const mapaRepuestos = useMemo(
    () => new Map(repuestos.map((r: any) => [Number(r.id), r])),
    [repuestos],
  );

  const filas = umbrales.map((u) => {
    const tag = u.tag_id ? mapaTags.get(Number(u.tag_id)) : undefined;
    const componente: any = u.componente_id
      ? mapaComponentes.get(Number(u.componente_id))
      : undefined;
    const repuesto: any = u.repuesto_id
      ? mapaRepuestos.get(Number(u.repuesto_id))
      : undefined;

    // Etiqueta del nivel: usa los IDs del umbral (fuente de verdad del backend)
    let nivel = `Equipo #${u.equipo_id}`;
    if (u.componente_id) nivel += ` › Comp #${u.componente_id}`;
    if (u.repuesto_id) nivel += ` › Rep #${u.repuesto_id}`;
    if (componente) nivel += ` (${componente.nombre})`;
    if (repuesto) nivel += ` (${repuesto.nombre})`;

    return {
      id: u.id,
      tag: tag?.tag_name || `Tag ID ${u.tag_id ?? '-'}`,
      descripcion: tag?.element_name || u.parametro,
      nivel,
      min: u.umbral_min,
      max: u.umbral_max,
      unidad: u.unidad,
      severidad: u.severidad,
      activo: u.activo,
    };
  });

  // ── Handlers ─────────────────────────────────────────────────
  const abrirModal = () => {
    setMensaje('');
    setTagId('');
    setMin('');
    setMax('');
    setModalAbierto(true);
  };

  const guardar = (e: React.FormEvent) => {
    e.preventDefault();

    if (!seleccion?.equipoId || !tagId) {
      setMensaje('Selecciona un equipo y un Tag PI.');
      return;
    }

    const tag = tags.find((t) => Number(t.id) === Number(tagId));
    if (!tag) {
      setMensaje('El Tag PI seleccionado ya no está disponible.');
      return;
    }

    if (min !== '' && max !== '' && Number(min) > Number(max)) {
      setMensaje('El umbral mínimo no puede ser mayor que el máximo.');
      return;
    }

    crearMutation.mutate({
      equipo_id: seleccion.equipoId,
      componente_id: seleccion.componenteId ?? null,
      repuesto_id: seleccion.repuestoId ?? null,
      tag_id: Number(tagId),
      parametro: tag.tag_name,
      umbral_min: min === '' ? null : Number(min),
      umbral_max: max === '' ? null : Number(max),
      unidad: tag.unidad || '',
      severidad,
      activo: true,
      modo,
      contar_tiempo_activo: false,
      lecturas_confirmacion: 1,
    });
  };

  // ── Render ───────────────────────────────────────────────────
  return (
    <Layout
      title="Gestión de Umbrales y Tags PI"
      subtitle="Asociación jerárquica y configuración de rangos operativos del PI System"
      onBack={() => onNavigate('dashboard')}
    >
      {umbralesQuery.isLoading && (
        <p style={{ color: colors.text.muted }}>Cargando información...</p>
      )}

      {(umbralesQuery.isError || tagsQuery.isError) && (
        <p style={{ color: '#b91c1c' }}>
          No se pudo cargar información del servidor. Verifica la conexión e inténtalo nuevamente.
        </p>
      )}

      {/* 1. Selector jerárquico completo */}
      <JerarquiaCascadeSelector onSelect={setSeleccion} />

      {/* 2. Panel de asignación de tags PI al equipo seleccionado */}
      {seleccion?.equipoId && (
        <div style={{ marginBottom: spacing.lg }}>
          <AsignacionTagPanel
            equipoId={seleccion.equipoId}
            equipoNombre={seleccion.labels?.equipo}
            onAsignado={() =>
              queryClient.invalidateQueries({ queryKey: ['pi-tags-descubiertos'] })
            }
          />
        </div>
      )}

      {/* 3. Panel de nivel activo + botón crear umbral */}
      <div
        style={{
          background: '#f8fafc',
          padding: '14px 20px',
          borderRadius: 8,
          border: `1px solid ${colors.border}`,
          marginBottom: spacing.lg,
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          gap: 12,
          flexWrap: 'wrap',
        }}
      >
        <div>
          <span
            style={{
              fontSize: 12,
              color: colors.text.muted,
              fontWeight: 600,
              textTransform: 'uppercase',
            }}
          >
            Nivel de asignación activo:
          </span>
          <div style={{ fontSize: 14, fontWeight: 700, color: '#0f172a', marginTop: 2 }}>
            {seleccion?.nombreCompleto || 'Ningún activo seleccionado'}
          </div>
          {seleccion?.labels && (
            <div style={{ fontSize: 12, color: colors.text.muted, marginTop: 4 }}>
              {seleccion.labels.proceso && <span>{seleccion.labels.proceso} › </span>}
              {seleccion.labels.subproceso && <span>{seleccion.labels.subproceso} › </span>}
              {seleccion.labels.equipo && <span>{seleccion.labels.equipo}</span>}
              {seleccion.labels.componente && <span> › {seleccion.labels.componente}</span>}
              {seleccion.labels.repuesto && <span> › {seleccion.labels.repuesto}</span>}
            </div>
          )}
        </div>

        <Button
          onClick={() => {
            if (!seleccion?.equipoId) {
              setMensaje('Selecciona primero un equipo, componente o repuesto.');
              return;
            }
            abrirModal();
          }}
          icon="⚡"
        >
          Crear umbral en este Nivel
        </Button>
      </div>

      {mensaje && (
        <p
          style={{
            color: mensaje.includes('correctamente') ? '#15803d' : '#b91c1c',
            fontSize: 13,
          }}
        >
          {mensaje}
        </p>
      )}

      {/* 4. Tabla de umbrales */}
      <UmbralesTable
        tags={filas}
        onDesvincular={(id) => {
          if (window.confirm('¿Deseas eliminar este umbral y desvincular el Tag PI?')) {
            eliminarMutation.mutate(id);
          }
        }}
      />

      {/* 5. Modal crear umbral */}
      {modalAbierto && (
        <div
          style={{
            position: 'fixed',
            inset: 0,
            background: 'rgba(0,0,0,0.5)',
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
            zIndex: 1000,
            padding: 16,
          }}
        >
          <div
            style={{
              background: '#fff',
              padding: 26,
              borderRadius: 10,
              width: '100%',
              maxWidth: 480,
              maxHeight: '90vh',
              overflowY: 'auto',
            }}
          >
            <h3 style={{ marginTop: 0, color: colors.text.secondary }}>
              Crear umbral
            </h3>

            <p style={{ fontSize: 13, color: colors.text.muted }}>
              Destino: <b>{seleccion?.nombreCompleto}</b>
            </p>

            <form onSubmit={guardar}>
              <label style={{ display: 'block', fontSize: 13, fontWeight: 600, marginBottom: 6 }}>
                Tag PI descubierto
              </label>
              <select
                required
                value={tagId}
                onChange={(e) => setTagId(e.target.value)}
                style={{
                  width: '100%',
                  padding: 10,
                  marginBottom: 14,
                  border: `1px solid ${colors.border}`,
                  borderRadius: 6,
                }}
              >
                <option value="">-- Seleccionar Tag PI --</option>
                {tags.map((tag) => (
                  <option key={tag.id} value={tag.id}>
                    {tag.tag_name} — {tag.element_name}
                  </option>
                ))}
              </select>

              {tags.length === 0 && (
                <p style={{ fontSize: 12, color: '#b91c1c' }}>
                  No hay tags descubiertos disponibles. Asigna primero un tag al equipo con el panel de arriba.
                </p>
              )}

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
                <div>
                  <label style={{ fontSize: 13, fontWeight: 600 }}>Umbral mínimo</label>
                  <input
                    type="number"
                    step="any"
                    value={min}
                    onChange={(e) => setMin(e.target.value)}
                    style={{ width: '100%', padding: 9, boxSizing: 'border-box', marginTop: 5 }}
                  />
                </div>
                <div>
                  <label style={{ fontSize: 13, fontWeight: 600 }}>Umbral máximo</label>
                  <input
                    type="number"
                    step="any"
                    value={max}
                    onChange={(e) => setMax(e.target.value)}
                    style={{ width: '100%', padding: 9, boxSizing: 'border-box', marginTop: 5 }}
                  />
                </div>
              </div>

              <label style={{ display: 'block', fontSize: 13, fontWeight: 600, marginTop: 14 }}>
                Severidad
              </label>
              <select
                value={severidad}
                onChange={(e) => setSeveridad(e.target.value as any)}
                style={{ width: '100%', padding: 9, marginTop: 5 }}
              >
                <option value="baja">Baja</option>
                <option value="media">Media</option>
                <option value="alta">Alta</option>
                <option value="critica">Crítica</option>
              </select>

              <label style={{ display: 'block', fontSize: 13, fontWeight: 600, marginTop: 14 }}>
                Modo
              </label>
              <select
                value={modo}
                onChange={(e) => setModo(e.target.value as any)}
                style={{ width: '100%', padding: 9, marginTop: 5 }}
              >
                <option value="alerta">Alerta</option>
                <option value="fallo">Fallo</option>
              </select>

              {mensaje && <p style={{ color: '#b91c1c', fontSize: 12 }}>{mensaje}</p>}

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 10, marginTop: 22 }}>
                <button
                  type="button"
                  onClick={() => setModalAbierto(false)}
                  style={{ padding: '9px 16px', border: 0, borderRadius: 5, cursor: 'pointer' }}
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  disabled={crearMutation.isPending || tags.length === 0}
                  style={{
                    padding: '9px 16px',
                    background: '#0284c7',
                    color: '#fff',
                    border: 0,
                    borderRadius: 5,
                    cursor: 'pointer',
                    opacity: crearMutation.isPending || tags.length === 0 ? 0.6 : 1,
                  }}
                >
                  {crearMutation.isPending ? 'Guardando...' : 'Guardar y asociar'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </Layout>
  );
}