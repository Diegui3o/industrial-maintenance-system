import { useState, useMemo } from "react";
import { useAlarmas, useAtenderAlarma, useCerrarAlarma } from "../hooks/useAlarmas";
import { formatFecha } from "../../../shared/utils/format";
import UmbralesPage from "../../umbrales/pages/UmbralesPage";

interface AlarmasPageProps {
  onNavigate?: (page: string, params?: any) => void;
  onBack?: () => void;
}

export function AlarmasPage({ onNavigate = () => {} }: AlarmasPageProps) {
  const [tabActiva, setTabActiva] = useState<"alarmas" | "umbrales">("alarmas");

  const { data: alarmas = [], isLoading, error } = useAlarmas();
  const atenderMutation = useAtenderAlarma();
  const cerrarMutation = useCerrarAlarma();

  const [filtroSeveridad, setFiltroSeveridad] = useState<string>("todas");
  const [filtroEstado, setFiltroEstado] = useState<string>("activa");

  const alarmasFiltradas = useMemo(() => {
    return alarmas.filter((a) => {
      const matchSeveridad = filtroSeveridad === "todas" || a.severidad === filtroSeveridad;
      const matchEstado = filtroEstado === "todas" || a.estado === filtroEstado;
      return matchSeveridad && matchEstado;
    });
  }, [alarmas, filtroSeveridad, filtroEstado]);

  return (
    <div style={{ padding: "24px", maxWidth: "1400px", margin: "0 auto" }}>
      
      {/* CABECERA Y CONTROL DE PESTAÑAS */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "20px" }}>
        <div>
          <h2 style={{ margin: 0, color: "#0f172a" }}>Centro de Alarmas y Reglas PI</h2>
          <p style={{ color: "#64748b", fontSize: "14px", margin: "4px 0 0 0" }}>
            Monitoreo en tiempo real y configuración de umbrales para Mina, Planta e Infraestructura.
          </p>
        </div>

        {/* NAVEGACIÓN PESTAÑAS */}
        <div style={{ display: "flex", gap: "8px", background: "#e2e8f0", padding: "4px", borderRadius: "8px" }}>
          <button
            onClick={() => setTabActiva("alarmas")}
            style={{
              padding: "8px 16px",
              borderRadius: "6px",
              border: "none",
              fontWeight: 600,
              fontSize: "13px",
              cursor: "pointer",
              background: tabActiva === "alarmas" ? "#fff" : "transparent",
              color: tabActiva === "alarmas" ? "#0284c7" : "#64748b",
              boxShadow: tabActiva === "alarmas" ? "0 1px 3px rgba(0,0,0,0.1)" : "none"
            }}
          >
            🚨 Alarmas Activas ({alarmas.filter(a => a.estado === 'activa').length})
          </button>
          
          <button
            onClick={() => setTabActiva("umbrales")}
            style={{
              padding: "8px 16px",
              borderRadius: "6px",
              border: "none",
              fontWeight: 600,
              fontSize: "13px",
              cursor: "pointer",
              background: tabActiva === "umbrales" ? "#fff" : "transparent",
              color: tabActiva === "umbrales" ? "#0284c7" : "#64748b",
              boxShadow: tabActiva === "umbrales" ? "0 1px 3px rgba(0,0,0,0.1)" : "none"
            }}
          >
            ⚙️ Reglas de Umbral y Tags PI
          </button>
        </div>
      </div>

      {/* CONTENIDO PESTAÑA 1: ALARMAS ACTIVAS */}
      {tabActiva === "alarmas" && (
        <>
          <div style={{ display: "flex", justifyContent: "flex-end", gap: "12px", marginBottom: "16px" }}>
            <select 
              value={filtroEstado} 
              onChange={(e) => setFiltroEstado(e.target.value)}
              style={{ padding: "8px 12px", borderRadius: "6px", border: "1px solid #cbd5e1" }}
            >
              <option value="todas">Todos los estados</option>
              <option value="activa">Activas</option>
              <option value="atendida">Atendidas</option>
              <option value="cerrada">Cerradas</option>
            </select>

            <select 
              value={filtroSeveridad} 
              onChange={(e) => setFiltroSeveridad(e.target.value)}
              style={{ padding: "8px 12px", borderRadius: "6px", border: "1px solid #cbd5e1" }}
            >
              <option value="todas">Todas las severidades</option>
              <option value="critica">Crítica</option>
              <option value="alta">Alta</option>
              <option value="media">Media</option>
              <option value="baja">Baja</option>
            </select>
          </div>

          {isLoading ? (
            <div style={{ padding: "40px", textAlign: "center", color: "#64748b" }}>Cargando alarmas activas...</div>
          ) : error ? (
            <div style={{ padding: "40px", color: "#dc2626", textAlign: "center" }}>Error: {(error as Error).message}</div>
          ) : (
            <div style={{ background: "#fff", borderRadius: "8px", boxShadow: "0 2px 8px rgba(0,0,0,0.06)", overflow: "hidden" }}>
              <table style={{ width: "100%", borderCollapse: "collapse", textAlign: "left" }}>
                <thead>
                  <tr style={{ background: "#f8fafc", borderBottom: "1px solid #e2e8f0", fontSize: "13px", color: "#475569" }}>
                    <th style={{ padding: "14px" }}>ID</th>
                    <th style={{ padding: "14px" }}>Equipo ID</th>
                    <th style={{ padding: "14px" }}>Tipo</th>
                    <th style={{ padding: "14px" }}>Mensaje</th>
                    <th style={{ padding: "14px" }}>Severidad</th>
                    <th style={{ padding: "14px" }}>Estado</th>
                    <th style={{ padding: "14px" }}>Fecha Generada</th>
                    <th style={{ padding: "14px", textAlign: "center" }}>Acciones</th>
                  </tr>
                </thead>
                <tbody>
                  {alarmasFiltradas.length === 0 ? (
                    <tr>
                      <td colSpan={8} style={{ textAlign: "center", padding: "40px", color: "#94a3b8" }}>
                        No se encontraron alarmas registradas.
                      </td>
                    </tr>
                  ) : (
                    alarmasFiltradas.map((alarma) => (
                      <tr key={alarma.id} style={{ borderBottom: "1px solid #f1f5f9", fontSize: "14px" }}>
                        <td style={{ padding: "14px", fontWeight: 600 }}>#{alarma.id}</td>
                        <td style={{ padding: "14px" }}>{alarma.equipo_id}</td>
                        <td style={{ padding: "14px" }}>{alarma.tipo}</td>
                        <td style={{ padding: "14px", maxWidth: "350px" }}>{alarma.mensaje}</td>
                        <td style={{ padding: "14px" }}>
                          <span style={{
                            padding: "4px 8px",
                            borderRadius: "4px",
                            fontSize: "12px",
                            fontWeight: 600,
                            background: alarma.severidad === 'critica' ? '#ffebee' : alarma.severidad === 'alta' ? '#fff3e0' : '#e3f2fd',
                            color: alarma.severidad === 'critica' ? '#c62828' : alarma.severidad === 'alta' ? '#ef6c00' : '#1565c0'
                          }}>
                            {alarma.severidad.toUpperCase()}
                          </span>
                        </td>
                        <td style={{ padding: "14px", textTransform: "capitalize" }}>{alarma.estado}</td>
                        <td style={{ padding: "14px", color: "#64748b" }}>{formatFecha(alarma.fecha_generada)}</td>
                        <td style={{ padding: "14px", textAlign: "center" }}>
                          <div style={{ display: "flex", gap: "8px", justifyContent: "center" }}>
                            {alarma.estado === "activa" && (
                              <button
                                onClick={() => atenderMutation.mutate(alarma.id)}
                                disabled={atenderMutation.isPending}
                                style={{ padding: "6px 12px", background: "#0284c7", color: "#fff", border: "none", borderRadius: "4px", cursor: "pointer", fontSize: "12px" }}
                              >
                                Atender
                              </button>
                            )}
                            {alarma.estado !== "cerrada" && (
                              <button
                                onClick={() => cerrarMutation.mutate(alarma.id)}
                                disabled={cerrarMutation.isPending}
                                style={{ padding: "6px 12px", background: "#475569", color: "#fff", border: "none", borderRadius: "4px", cursor: "pointer", fontSize: "12px" }}
                              >
                                Cerrar
                              </button>
                            )}
                          </div>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          )}
        </>
      )}

      {/* CONTENIDO PESTAÑA 2: REGLAS Y TAGS PI SYSTEM */}
      {tabActiva === "umbrales" && (
        <UmbralesPage onNavigate={onNavigate} />
      )}

    </div>
  );
}

export default AlarmasPage;
