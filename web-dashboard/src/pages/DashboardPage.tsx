import { useState, useEffect } from 'react';
import { colors, spacing, radius, shadows } from '../theme/colors';
import { useDashboardData } from '../hooks/useDashboardData';
import Card from '../components/Card';

interface Props {
  onNavigate: (page: string, params?: any) => void
  onBack?: () => void
  isConnected: boolean | null;
}
const menuItems = [
  { id: 'equipos', label: 'Equipos', sub: 'Gestionar activos', color: colors.primary, path: '/equipos' },
  { id: 'crear', label: 'Nuevo Equipo', sub: 'Registrar', color: colors.status.success, path: null },
  { id: 'alarmas', label: 'Alarmas', sub: 'Monitoreo', color: colors.status.error, path: '/alarmas' },
  { id: 'mantenimiento', label: 'Mantenimiento', sub: 'Eventos', color: colors.status.warning, path: '/eventos' },
  { id: 'metricas', label: 'Métricas', sub: 'KPIs', color: colors.status.info, path: '/metricas' },
  { id: 'notificaciones', label: 'Notificaciones', sub: 'WhatsApp & Alertas', color: '#25D366', path: null },
  { id: 'configuracion', label: 'Ajustes', sub: 'Sistema', color: colors.text.muted, path: null },
];

const severidadMap: Record<string, { label: string; color: string; bg: string }> = {
  critica: { label: 'CRÍTICA', color: colors.status.error, bg: colors.status.errorBg },
  alta: { label: 'ALTA', color: colors.status.warning, bg: colors.status.warningBg },
  media: { label: 'MEDIA', color: colors.status.info, bg: colors.status.infoBg },
  baja: { label: 'BAJA', color: colors.status.success, bg: colors.status.successBg },
};

export default function DashboardPage({ onNavigate, isConnected }: Props) {
  const [now, setNow] = useState(new Date());
  const { isLoading, stats, alarmas, equipos } = useDashboardData();

  useEffect(() => {
    const t = setInterval(() => setNow(new Date()), 1000);
    return () => clearInterval(t);
  }, []);

  const fmtTime = (d: Date) => d.toLocaleTimeString('es-PE', { hour12: false });
  const fmtDate = (d: Date) => d.toLocaleDateString('es-PE', { weekday: 'long', day: 'numeric', month: 'long' });

  // Calcular porcentajes para barras
  const total = stats.total || 1;
  const pct = (n: number) => Math.round((n / total) * 100);

  // Últimos equipos críticos
  const criticos = equipos.filter((e: any) => e.critico).slice(0, 4);

  return (
    <div style={{ minHeight: '100vh', background: colors.background, display: 'flex', flexDirection: 'column' }}>
      {/* ===== HEADER ===== */}
      <header style={{
        background: colors.surface,
        borderBottom: `1px solid ${colors.border}`,
        padding: '16px 32px',
        position: 'sticky', top: 0, zIndex: 100,
      }}>
        <div style={{ maxWidth: 1280, margin: '0 auto', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
            <div style={{
              width: 36, height: 36, borderRadius: 8,
              background: colors.primary,
              display: 'flex', alignItems: 'center', justifyContent: 'center',
            }}>
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5" strokeLinecap="round">
                <circle cx="12" cy="12" r="3"/>
                <path d="M12 1v2M12 21v2M4.22 4.22l1.42 1.42M18.36 18.36l1.42 1.42M1 12h2M21 12h2M4.22 19.78l1.42-1.42M18.36 5.64l1.42-1.42"/>
              </svg>
            </div>
            <div>
              <div style={{ fontSize: 15, fontWeight: 700, color: colors.text.primary, letterSpacing: 3, textTransform: 'uppercase' }}>
                NEXA RESOURCES
              </div>
              <div style={{ fontSize: 10, color: colors.text.muted, letterSpacing: 2, textTransform: 'uppercase', marginTop: 1 }}>
                Mantenimiento Industrial
              </div>
            </div>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: 20 }}>
            <div style={{
              display: 'flex', alignItems: 'center', gap: 8,
              padding: '5px 12px', borderRadius: 50,
              background: isConnected ? colors.status.successBg : colors.status.errorBg,
              border: `1px solid ${isConnected ? colors.status.success : colors.status.error}30`,
            }}>
              <span style={{
                width: 7, height: 7, borderRadius: '50%',
                background: isConnected ? colors.status.success : colors.status.error,
                animation: isConnected ? 'pulse-dot 2.5s infinite' : 'none',
              }} />
              <span style={{ fontSize: 11, fontWeight: 700, color: isConnected ? colors.status.success : colors.status.error }}>
                {isConnected ? 'EN LÍNEA' : 'OFFLINE'}
              </span>
            </div>
            <div style={{ textAlign: 'right' }}>
              <div style={{ fontSize: 20, fontWeight: 700, color: colors.text.primary, fontVariantNumeric: 'tabular-nums' }}>
                {fmtTime(now)}
              </div>
              <div style={{ fontSize: 11, color: colors.text.muted, textTransform: 'capitalize' }}>
                {fmtDate(now)}
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* ===== MAIN ===== */}
      <main style={{ flex: 1, maxWidth: 1280, width: '100%', margin: '0 auto', padding: '32px' }}>
        
        {/* --- SECCIÓN 1: KPIs --- */}
        <section style={{ marginBottom: spacing.xxl }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: spacing.lg }}>
            <div style={{ width: 3, height: 16, background: colors.primary, borderRadius: 4 }} />
            <h2 style={{ fontSize: 13, fontWeight: 700, color: colors.text.muted, letterSpacing: 2, textTransform: 'uppercase' }}>
              Resumen General
            </h2>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 20 }}>
            {[
              { label: 'Total Equipos', value: isLoading ? '—' : stats.total || 'N/A', sub: 'Registrados' },
              { label: 'Activos', value: isLoading ? '—' : stats.activos || 'N/A', sub: `${isLoading ? '—' : pct(stats.activos)}% del total` },
              { label: 'Alarmas Pendientes', value: isLoading ? '—' : stats.alarmas || 'N/A', sub: isLoading ? '—' : `${stats.criticas} críticas` },
              { label: 'En Mantenimiento', value: isLoading ? '—' : stats.mantenimiento || 'N/A', sub: isLoading ? '—' : `${pct(stats.mantenimiento)}% del total` },
            ].map((kpi, i) => (
              <Card key={i} padding={24} hover={false} style={{ borderLeft: `3px solid ${i === 2 && stats.criticas > 0 ? colors.status.error : colors.border}` }}>
                <div style={{ fontSize: 11, fontWeight: 600, color: colors.text.muted, textTransform: 'uppercase', letterSpacing: 1, marginBottom: 10 }}>
                  {kpi.label}
                </div>
                <div style={{ fontSize: 36, fontWeight: 800, color: colors.text.primary, lineHeight: 1, letterSpacing: -1 }}>
                  {kpi.value}
                </div>
                <div style={{ fontSize: 12, color: colors.text.muted, marginTop: 8 }}>
                  {kpi.sub}
                </div>
              </Card>
            ))}
          </div>
        </section>

        {/* --- SECCIÓN 2: Dos columnas --- */}
        <div style={{ display: 'grid', gridTemplateColumns: '1.4fr 1fr', gap: 28, marginBottom: spacing.xxl }}>
          
          {/* Alarmas */}
          <section>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: spacing.lg }}>
              <div style={{ width: 3, height: 16, background: colors.status.error, borderRadius: 4 }} />
              <h2 style={{ fontSize: 13, fontWeight: 700, color: colors.text.muted, letterSpacing: 2, textTransform: 'uppercase' }}>
                Alarmas Activas
              </h2>
              {!isLoading && alarmas.length > 0 && (
                <span style={{ marginLeft: 'auto', fontSize: 11, fontWeight: 700, color: colors.status.error, background: colors.status.errorBg, padding: '3px 10px', borderRadius: 20 }}>
                  {alarmas.length} PENDIENTES
                </span>
              )}
            </div>

            <Card padding={0} hover={false}>
              {isLoading ? (
                <div style={{ padding: 40, textAlign: 'center', color: colors.text.muted, fontSize: 14 }}>
                  Cargando alarmas...
                </div>
              ) : alarmas.length === 0 ? (
                <div style={{ padding: 48, textAlign: 'center' }}>
                  <div style={{ fontSize: 14, color: colors.text.muted, marginBottom: 4 }}>Sin alarmas activas</div>
                  <div style={{ fontSize: 12, color: colors.text.muted }}>Todo el sistema opera con normalidad</div>
                </div>
              ) : (
                <div style={{ display: 'flex', flexDirection: 'column' }}>
                  {alarmas.slice(0, 5).map((a: any, i: number) => {
                    const s = severidadMap[a.severidad] || severidadMap.media;
                    const equipo = equipos.find((e: any) => e.id === a.equipo_id);
                    return (
                      <div key={a.id || i} style={{
                        display: 'flex', alignItems: 'center', gap: 16,
                        padding: '16px 20px',
                        borderBottom: `1px solid ${colors.borderLight}`,
                        cursor: 'pointer',
                        transition: 'background 0.15s',
                      }}
                      onMouseEnter={e => e.currentTarget.style.background = colors.surfaceMuted}
                      onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
                      onClick={() => onNavigate('alarmas')}
                      >
                        <div style={{
                          width: 10, height: 10, borderRadius: '50%', background: s.color, flexShrink: 0,
                          boxShadow: `0 0 0 3px ${s.bg}`,
                        }} />
                        <div style={{ flex: 1, minWidth: 0 }}>
                          <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 3 }}>
                            <span style={{ fontSize: 13, fontWeight: 700, color: colors.text.primary }}>
                              {equipo?.codigo || a.equipo_id || 'N/A'}
                            </span>
                            <span style={{ fontSize: 10, fontWeight: 700, color: s.color, background: s.bg, padding: '1px 8px', borderRadius: 4, letterSpacing: 0.5 }}>
                              {s.label}
                            </span>
                          </div>
                          <div style={{ fontSize: 13, color: colors.text.secondary, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                            {a.mensaje || a.tipo || 'Sin descripción'}
                          </div>
                        </div>
                        <div style={{ fontSize: 11, color: colors.text.muted, whiteSpace: 'nowrap', flexShrink: 0 }}>
                          {a.fecha_generada ? new Date(a.fecha_generada).toLocaleTimeString('es-PE', { hour: '2-digit', minute: '2-digit' }) : 'N/A'}
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </Card>
          </section>

          {/* Estado de equipos */}
          <section>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: spacing.lg }}>
              <div style={{ width: 3, height: 16, background: colors.primary, borderRadius: 4 }} />
              <h2 style={{ fontSize: 13, fontWeight: 700, color: colors.text.muted, letterSpacing: 2, textTransform: 'uppercase' }}>
                Estado de Equipos
              </h2>
            </div>

            <Card padding={24} hover={false}>
              {isLoading ? (
                <div style={{ padding: 20, textAlign: 'center', color: colors.text.muted, fontSize: 14 }}>
                  Cargando...
                </div>
              ) : stats.total === 0 ? (
                <div style={{ padding: 32, textAlign: 'center', color: colors.text.muted, fontSize: 14 }}>
                  No hay equipos registrados
                </div>
              ) : (
                <>
                  {[
                    { label: 'Activos', value: stats.activos, color: colors.estado.activo },
                    { label: 'Mantenimiento', value: stats.mantenimiento, color: colors.estado.mantenimiento },
                    { label: 'Fallo', value: stats.fallo, color: colors.estado.fallo },
                    { label: 'Inactivos', value: stats.inactivos, color: colors.estado.inactivo },
                  ].map(stat => (
                    <div key={stat.label} style={{ marginBottom: 16 }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 6, alignItems: 'center' }}>
                        <span style={{ fontSize: 13, color: colors.text.secondary, display: 'flex', alignItems: 'center', gap: 8 }}>
                          <span style={{ width: 8, height: 8, borderRadius: '50%', background: stat.color }} />
                          {stat.label}
                        </span>
                        <span style={{ fontSize: 14, fontWeight: 700, color: colors.text.primary }}>{stat.value}</span>
                      </div>
                      <div style={{ height: 6, background: colors.borderLight, borderRadius: 3, overflow: 'hidden' }}>
                        <div style={{ height: '100%', width: `${pct(stat.value)}%`, background: stat.color, borderRadius: 3, transition: 'width 0.8s ease' }} />
                      </div>
                    </div>
                  ))}

                  {criticos.length > 0 && (
                    <div style={{ marginTop: 20, paddingTop: 16, borderTop: `1px solid ${colors.borderLight}` }}>
                      <div style={{ fontSize: 10, fontWeight: 700, color: colors.text.muted, textTransform: 'uppercase', letterSpacing: 1.5, marginBottom: 10 }}>
                        Equipos Críticos
                      </div>
                      <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
                        {criticos.map((eq: any) => (
                          <span key={eq.id} style={{
                            fontSize: 12, fontWeight: 600,
                            color: eq.estado_equipo === 'fallo' ? colors.status.error : eq.estado_equipo === 'mantenimiento' ? colors.status.warning : colors.text.secondary,
                            background: colors.surfaceMuted,
                            padding: '5px 12px', borderRadius: 6,
                            border: `1px solid ${colors.border}`,
                            cursor: 'pointer',
                          }} onClick={() => onNavigate('equipos')}>
                            {eq.codigo || 'N/A'}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}
                </>
              )}
            </Card>
          </section>
        </div>

        {/* --- SECCIÓN 3: Navegación --- */}
        <section>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: spacing.lg }}>
            <div style={{ width: 3, height: 16, background: colors.text.muted, borderRadius: 4 }} />
            <h2 style={{ fontSize: 13, fontWeight: 700, color: colors.text.muted, letterSpacing: 2, textTransform: 'uppercase' }}>
              Navegación
            </h2>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(6, 1fr)', gap: 14 }}>
            {menuItems.map((item) => {
              const isPrimary = item.id === 'equipos';
              return (
                <div
                  key={item.id}
                  onClick={() => onNavigate(item.id)}
                  style={{
                    background: colors.surface,
                    borderRadius: radius.md,
                    padding: '24px 16px',
                    textAlign: 'center',
                    cursor: 'pointer',
                    border: `1px solid ${isPrimary ? item.color : colors.border}`,
                    transition: 'all 0.2s ease',
                  }}
                  onMouseEnter={e => {
                    e.currentTarget.style.transform = 'translateY(-2px)';
                    e.currentTarget.style.boxShadow = shadows.lg;
                    e.currentTarget.style.borderColor = item.color;
                  }}
                  onMouseLeave={e => {
                    e.currentTarget.style.transform = 'translateY(0)';
                    e.currentTarget.style.boxShadow = 'none';
                    e.currentTarget.style.borderColor = isPrimary ? item.color : colors.border;
                  }}
                >
                  <div style={{
                    width: 40, height: 40, borderRadius: 10,
                    background: item.id === 'notificaciones' ? '#25D36620' : isPrimary ? item.color : colors.surfaceMuted,
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    margin: '0 auto 12px',
                  }}>
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke={item.id === 'notificaciones' ? '#25D366' : isPrimary ? '#fff' : item.color} strokeWidth="2" strokeLinecap="round">
                      {item.id === 'equipos' && <><path d="M3 9l9-7 9 7v11a2 2 0 01-2 2H5a2 2 0 01-2-2z" /><polyline points="9 22 9 12 15 12 15 22" /></>}
                      {item.id === 'crear' && <><line x1="12" y1="5" x2="12" y2="19" /><line x1="5" y1="12" x2="19" y2="12" /></>}
                      {item.id === 'alarmas' && <><path d="M10.29 3.86L1.82 18a2 2 0 001.71 3h16.94a2 2 0 001.71-3L13.71 3.86a2 2 0 00-3.42 0z" /><line x1="12" y1="9" x2="12" y2="13" /><line x1="12" y1="17" x2="12.01" y2="17" /></>}
                      {item.id === 'mantenimiento' && <path d="M14.7 6.3a1 1 0 000 1.4l1.6 1.6a1 1 0 001.4 0l3.77-3.77a6 6 0 01-7.94 7.94l-6.91 6.91a2.12 2.12 0 01-3-3l6.91-6.91a6 6 0 017.94-7.94l-3.76 3.76z"/>}
                      {item.id === 'metricas' && <><line x1="18" y1="20" x2="18" y2="10" /><line x1="12" y1="20" x2="12" y2="4" /><line x1="6" y1="20" x2="6" y2="14" /></>}
                      {item.id === 'configuracion' && <><circle cx="12" cy="12" r="3" /><path d="M19.4 15a1.65 1.65 0 00.33 1.82l.06.06a2 2 0 010 2.83 2 2 0 01-2.83 0l-.06-.06a1.65 1.65 0 00-1.82-.33 1.65 1.65 0 00-1 1.51V21a2 2 0 01-2 2 2 2 0 01-2-2v-.09A1.65 1.65 0 009 19.4a1.65 1.65 0 00-1.82.33l-.06.06a2 2 0 01-2.83 0 2 2 0 010-2.83l.06-.06A1.65 1.65 0 004.68 15a1.65 1.65 0 00-1.51-1H3a2 2 0 01-2-2 2 2 0 012-2h.09A1.65 1.65 0 004.6 9a1.65 1.65 0 00-.33-1.82l-.06-.06a2 2 0 010-2.83 2 2 0 012.83 0l.06.06A1.65 1.65 0 009 4.68a1.65 1.65 0 001-1.51V3a2 2 0 012-2 2 2 0 012 2v.09a1.65 1.65 0 001 1.51 1.65 1.65 0 001.82-.33l.06-.06a2 2 0 012.83 0 2 2 0 010 2.83l-.06.06A1.65 1.65 0 0019.4 9a1.65 1.65 0 001.51 1H21a2 2 0 012 2 2 2 0 01-2 2h-.09a1.65 1.65 0 00-1.51 1z" /></>}
                      {item.id === 'notificaciones' && <path d="M18 8A6 6 0 006 8c0 7-3 9-3 9h18s-3-2-3-9M13.73 21a2 2 0 01-3.46 0" />}
                    </svg>
                  </div>
                  <div style={{ fontSize: 14, fontWeight: 700, color: colors.text.primary, marginBottom: 2 }}>
                    {item.label}
                  </div>
                  <div style={{ fontSize: 11, color: colors.text.muted }}>
                    {item.sub}
                  </div>
                </div>
              );
            })}
          </div>
        </section>

        {/* --- Ticker --- */}
        <div style={{
          marginTop: spacing.xxl,
          padding: '14px 24px',
          background: colors.surface,
          borderRadius: radius.md,
          border: `1px solid ${colors.borderLight}`,
          display: 'flex',
          alignItems: 'center',
          gap: 16,
        }}>
          <span style={{ fontSize: 11, fontWeight: 700, color: colors.primary, whiteSpace: 'nowrap', letterSpacing: 1 }}>
            ACTIVIDAD RECIENTE
          </span>
          <div style={{ flex: 1, overflow: 'hidden' }}>
            <div style={{ display: 'flex', gap: 32, animation: 'ticker 25s linear infinite', whiteSpace: 'nowrap' }}>
              {isLoading ? (
                <span style={{ fontSize: 12, color: colors.text.muted }}>Cargando actividad...</span>
              ) : (
                <>
                  <span style={{ fontSize: 12, color: colors.text.secondary }}>Sistema operando normalmente — Última sincronización: {fmtTime(now)}</span>
                  <span style={{ fontSize: 12, color: colors.text.secondary }}>{stats.activos} equipos activos de {stats.total} registrados</span>
                  <span style={{ fontSize: 12, color: colors.text.secondary }}>{stats.alarmas} alarmas pendientes de atención</span>
                  <span style={{ fontSize: 12, color: colors.text.secondary }}>Sistema operando normalmente — Última sincronización: {fmtTime(now)}</span>
                </>
              )}
            </div>
          </div>
        </div>
      </main>

      <style>{`
        @keyframes pulse-dot {
          0%, 100% { opacity: 1; transform: scale(1); }
          50% { opacity: 0.4; transform: scale(1.5); }
        }
        @keyframes ticker {
          0% { transform: translateX(0); }
          100% { transform: translateX(-50%); }
        }
      `}</style>
    </div>
  );
}