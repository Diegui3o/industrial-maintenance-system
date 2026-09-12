import { useEffect, useState } from 'react';
import type { EquipoFormData } from '../hooks/useEquipoForm';
import {
  getProcesos,
  getTodosSubprocesos,
  getSistemas,
  getTodosSubprocesosSistema,
  type Proceso,
  type Subproceso,
  type SistemaPlanta,
  type SubprocesoSistemaPlanta,
} from '../../../dashboard/DashboardAreas/Planta/services/plantaApi';
import { colors } from '../../../theme/colors';

interface Props {
  form: EquipoFormData;
  update: (d: Partial<EquipoFormData>) => void;
}

export default function UbicacionStep({
  form,
  update,
}: Props) {
  const [procesos, setProcesos] = useState<Proceso[]>([]);
  const [subprocesos, setSubprocesos] = useState<
    Subproceso[]
  >([]);

  const [sistemas, setSistemas] = useState<SistemaPlanta[]>(
    []
  );

  const [subprocesosSistema, setSubprocesosSistema] =
    useState<SubprocesoSistemaPlanta[]>([]);

  const [loading, setLoading] = useState(true);

  const [procesoAbierto, setProcesoAbierto] =
    useState<number | null>(null);

  const [sistemaAbierto, setSistemaAbierto] =
    useState<number | null>(null);

  useEffect(() => {
    const cargar = async () => {
      setLoading(true);

      try {
        const [
          procesosResultado,
          subprocesosResultado,
          sistemasResultado,
          subprocesosSistemaResultado,
        ] = await Promise.all([
          getProcesos(),
          getTodosSubprocesos(),
          getSistemas(),
          getTodosSubprocesosSistema(),
        ]);

        setProcesos(procesosResultado);
        setSubprocesos(subprocesosResultado);
        setSistemas(sistemasResultado);
        setSubprocesosSistema(
          subprocesosSistemaResultado
        );
      } catch (error) {
        console.error(
          'Error cargando estructura:',
          error
        );

        setProcesos([]);
        setSubprocesos([]);
        setSistemas([]);
        setSubprocesosSistema([]);
      } finally {
        setLoading(false);
      }
    };

    void cargar();
  }, []);

  const seleccionarProceso = (subprocesoId: number) => {
    update({
      tipo_padre: 'proceso',
      subproceso_padre_id: subprocesoId,
      activo_padre_id: null,
    });
  };

  const seleccionarSistema = (
    subprocesoId: number
  ) => {
    update({
      tipo_padre: 'sistema',
      subproceso_padre_id: subprocesoId,
      activo_padre_id: null,
    });
  };

  const limpiarPadre = () => {
    update({
      tipo_padre: '',
      subproceso_padre_id: null,
      activo_padre_id: null,
    });
  };

  const seleccionadoProceso =
    form.tipo_padre === 'proceso'
      ? form.subproceso_padre_id
      : null;

  const seleccionadoSistema =
    form.tipo_padre === 'sistema'
      ? form.subproceso_padre_id
      : null;

  const subprocesosDeProceso = (procesoId: number) =>
    subprocesos.filter(
      (item) => item.proceso_id === procesoId
    );

  const subprocesosDeSistema = (sistemaId: number) =>
    subprocesosSistema.filter(
      (item) => item.sistema_id === sistemaId
    );

  return (
    <div>
      <h3 style={{ marginBottom: 20 }}>
        Ubicación y Jerarquía
      </h3>

      <p
        style={{
          fontSize: 13,
          color: colors.text.muted,
          marginBottom: 20,
        }}
      >
        Selecciona el proceso o sistema y el subproceso
        donde pertenecerá este equipo.
      </p>

      <div
        style={{
          border: `1px solid ${colors.border}`,
          borderRadius: 10,
          padding: 16,
          marginBottom: 20,
        }}
      >
        <label
          style={{
            display: 'block',
            fontSize: 11,
            fontWeight: 600,
            marginBottom: 12,
            textTransform: 'uppercase',
            letterSpacing: 1,
            color: colors.text.muted,
          }}
        >
          Activo Padre
        </label>

        {loading ? (
          <div
            style={{
              padding: 14,
              color: colors.text.muted,
              fontSize: 13,
            }}
          >
            Cargando estructura...
          </div>
        ) : (
          <div
            style={{
              display: 'grid',
              gridTemplateColumns:
                'repeat(2, minmax(0, 1fr))',
              gap: 16,
            }}
          >
            <div>
              <div
                style={{
                  fontSize: 12,
                  fontWeight: 700,
                  marginBottom: 8,
                }}
              >
                PROCESOS
              </div>

              <div
                style={{
                  border: `1px solid ${colors.borderLight}`,
                  borderRadius: 8,
                  overflow: 'hidden',
                }}
              >
                {procesos.length === 0 ? (
                  <div
                    style={{
                      padding: 12,
                      fontSize: 12,
                      color: colors.text.muted,
                    }}
                  >
                    No hay procesos registrados.
                  </div>
                ) : (
                  procesos.map((proceso) => {
                    const hijos =
                      subprocesosDeProceso(
                        proceso.id
                      );

                    const abierto =
                      procesoAbierto === proceso.id;

                    return (
                      <div key={proceso.id}>
                        <button
                          type="button"
                          onClick={() =>
                            setProcesoAbierto(
                              abierto
                                ? null
                                : proceso.id
                            )
                          }
                          style={{
                            width: '100%',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent:
                              'space-between',
                            padding:
                              '10px 12px',
                            border: 'none',
                            borderBottom: `1px solid ${colors.borderLight}`,
                            background:
                              'transparent',
                            cursor: 'pointer',
                            textAlign: 'left',
                            fontSize: 13,
                            fontWeight: 600,
                          }}
                        >
                          <span>
                            {abierto ? '▼' : '▶'}{' '}
                            {proceso.nombre}
                          </span>

                          <span
                            style={{
                              fontSize: 10,
                              color: colors.text.muted,
                            }}
                          >
                            {hijos.length}
                          </span>
                        </button>

                        {abierto && (
                          <div
                            style={{
                              padding:
                                '6px 8px 8px 28px',
                              background:
                                colors.background,
                            }}
                          >
                            {hijos.length === 0 ? (
                              <div
                                style={{
                                  padding:
                                    '6px 4px',
                                  fontSize: 11,
                                  color:
                                    colors.text.muted,
                                }}
                              >
                                Sin subprocesos.
                              </div>
                            ) : (
                              hijos.map((subproceso) => {
                                const seleccionado =
                                  seleccionadoProceso ===
                                  subproceso.id;

                                return (
                                  <button
                                    key={
                                      subproceso.id
                                    }
                                    type="button"
                                    onClick={() =>
                                      seleccionarProceso(
                                        subproceso.id
                                      )
                                    }
                                    style={{
                                      width: '100%',
                                      display:
                                        'block',
                                      padding:
                                        '8px 10px',
                                      marginBottom: 4,
                                      border:
                                        seleccionado
                                          ? `1px solid ${colors.primary}`
                                          : `1px solid ${colors.borderLight}`,
                                      borderRadius: 7,
                                      background:
                                        seleccionado
                                          ? colors.primaryGhost
                                          : colors.surface,
                                      color:
                                        colors.text
                                          .primary,
                                      cursor:
                                        'pointer',
                                      textAlign:
                                        'left',
                                      fontSize: 12,
                                      fontWeight:
                                        seleccionado
                                          ? 700
                                          : 500,
                                    }}
                                  >
                                    └─{' '}
                                    {
                                      subproceso.nombre
                                    }
                                  </button>
                                );
                              })
                            )}
                          </div>
                        )}
                      </div>
                    );
                  })
                )}
              </div>
            </div>

            <div>
              <div
                style={{
                  fontSize: 12,
                  fontWeight: 700,
                  marginBottom: 8,
                }}
              >
                SISTEMAS
              </div>

              <div
                style={{
                  border: `1px solid ${colors.borderLight}`,
                  borderRadius: 8,
                  overflow: 'hidden',
                }}
              >
                {sistemas.length === 0 ? (
                  <div
                    style={{
                      padding: 12,
                      fontSize: 12,
                      color: colors.text.muted,
                    }}
                  >
                    No hay sistemas registrados.
                  </div>
                ) : (
                  sistemas.map((sistema) => {
                    const hijos =
                      subprocesosDeSistema(
                        sistema.id
                      );

                    const abierto =
                      sistemaAbierto === sistema.id;

                    return (
                      <div key={sistema.id}>
                        <button
                          type="button"
                          onClick={() =>
                            setSistemaAbierto(
                              abierto
                                ? null
                                : sistema.id
                            )
                          }
                          style={{
                            width: '100%',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent:
                              'space-between',
                            padding:
                              '10px 12px',
                            border: 'none',
                            borderBottom: `1px solid ${colors.borderLight}`,
                            background:
                              'transparent',
                            cursor: 'pointer',
                            textAlign: 'left',
                            fontSize: 13,
                            fontWeight: 600,
                          }}
                        >
                          <span>
                            {abierto ? '▼' : '▶'}{' '}
                            {sistema.nombre}
                          </span>

                          <span
                            style={{
                              fontSize: 10,
                              color: colors.text.muted,
                            }}
                          >
                            {hijos.length}
                          </span>
                        </button>

                        {abierto && (
                          <div
                            style={{
                              padding:
                                '6px 8px 8px 28px',
                              background:
                                colors.background,
                            }}
                          >
                            {hijos.length === 0 ? (
                              <div
                                style={{
                                  padding:
                                    '6px 4px',
                                  fontSize: 11,
                                  color:
                                    colors.text.muted,
                                }}
                              >
                                Sin subsistemas.
                              </div>
                            ) : (
                              hijos.map((subproceso) => {
                                const seleccionado =
                                  seleccionadoSistema ===
                                  subproceso.id;

                                return (
                                  <button
                                    key={
                                      subproceso.id
                                    }
                                    type="button"
                                    onClick={() =>
                                      seleccionarSistema(
                                        subproceso.id
                                      )
                                    }
                                    style={{
                                      width: '100%',
                                      display:
                                        'block',
                                      padding:
                                        '8px 10px',
                                      marginBottom: 4,
                                      border:
                                        seleccionado
                                          ? `1px solid ${colors.primary}`
                                          : `1px solid ${colors.borderLight}`,
                                      borderRadius: 7,
                                      background:
                                        seleccionado
                                          ? colors.primaryGhost
                                          : colors.surface,
                                      color:
                                        colors.text
                                          .primary,
                                      cursor:
                                        'pointer',
                                      textAlign:
                                        'left',
                                      fontSize: 12,
                                      fontWeight:
                                        seleccionado
                                          ? 700
                                          : 500,
                                    }}
                                  >
                                    └─{' '}
                                    {
                                      subproceso.nombre
                                    }
                                  </button>
                                );
                              })
                            )}
                          </div>
                        )}
                      </div>
                    );
                  })
                )}
              </div>
            </div>
          </div>
        )}

        {form.subproceso_padre_id && (
          <div
            style={{
              marginTop: 14,
              padding: '10px 12px',
              borderRadius: 8,
              background: colors.primaryGhost,
              border: `1px solid ${colors.primary}`,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              gap: 12,
            }}
          >
            <div>
              <div
                style={{
                  fontSize: 10,
                  color: colors.text.muted,
                  marginBottom: 3,
                }}
              >
                PADRE SELECCIONADO
              </div>

              <strong style={{ fontSize: 13 }}>
                {form.tipo_padre === 'proceso'
                  ? subprocesos.find(
                      (item) =>
                        item.id ===
                        form.subproceso_padre_id
                    )?.nombre
                  : subprocesosSistema.find(
                      (item) =>
                        item.id ===
                        form.subproceso_padre_id
                    )?.nombre}
              </strong>
            </div>

            <button
              type="button"
              onClick={limpiarPadre}
              style={{
                border: 'none',
                background: 'transparent',
                cursor: 'pointer',
                color: colors.text.muted,
                fontSize: 18,
              }}
            >
              ×
            </button>
          </div>
        )}
      </div>

      <div
        style={{
          display: 'grid',
          gridTemplateColumns:
            'repeat(2, minmax(0, 1fr))',
          gap: 16,
        }}
      >

        <Field
          label="Tag Industrial"
          value={form.tag}
          onChange={(v) => update({ tag: v })}
          placeholder="ZS-2020005B"
          hint="Código del plano P&ID o diagrama de lazo"
        />

        <Field
          label="Ubicación Física"
          value={form.ubicacion_fisica}
          onChange={(v) =>
            update({ ubicacion_fisica: v })
          }
          placeholder="Tablero RIO-001, Rack 1, Slot 7"
          hint="Dónde está instalado físicamente"
        />
      </div>

      <div style={{ marginTop: 16 }}>
        <label
          style={{
            display: 'block',
            fontSize: 11,
            fontWeight: 600,
            marginBottom: 4,
            textTransform: 'uppercase',
            letterSpacing: 1,
            color: colors.text.muted,
          }}
        >
          Descripción Larga
        </label>

        <textarea
          value={form.descripcion_larga}
          onChange={(e) =>
            update({
              descripcion_larga: e.target.value,
            })
          }
          placeholder="Descripción detallada del equipo, función, características..."
          rows={4}
          style={{
            width: '100%',
            padding: '10px 12px',
            border: `1px solid ${colors.border}`,
            borderRadius: 8,
            fontSize: 14,
            resize: 'vertical',
            fontFamily: 'inherit',
          }}
        />
      </div>
    </div>
  );
}

function Field({
  label,
  value,
  onChange,
  placeholder,
  hint,
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  placeholder?: string;
  hint?: string;
}) {
  return (
    <div style={{ marginBottom: 14 }}>
      <label
        style={{
          display: 'block',
          fontSize: 11,
          fontWeight: 600,
          marginBottom: 4,
          textTransform: 'uppercase',
          letterSpacing: 1,
          color: colors.text.muted,
        }}
      >
        {label}
      </label>

      <input
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        style={{
          width: '100%',
          padding: '10px 12px',
          border: `1px solid ${colors.border}`,
          borderRadius: 8,
          fontSize: 14,
        }}
      />

      {hint && (
        <p
          style={{
            fontSize: 11,
            color: colors.text.muted,
            marginTop: 4,
          }}
        >
          {hint}
        </p>
      )}
    </div>
  );
}