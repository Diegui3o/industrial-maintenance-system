import { useEffect, useState } from 'react';
import type { EquipoFormData } from '../hooks/useEquipoForm';
import { colors } from '../../../theme/colors';
import { AreaTipoInput } from '../components/AreaTipoInput';
import {
  getProcesos,
  getSubprocesos,
  getSistemas,
  getSubprocesosSistema,
  type Proceso,
  type Subproceso,
  type SistemaPlanta,
  type SubprocesoSistemaPlanta,
} from '../../../dashboard/DashboardAreas/Planta/services/plantaApi';
import EstructuraPadreSelector from '../components/EstructuraPadreSelector';

interface Props {
  form: EquipoFormData;
  update: (d: Partial<EquipoFormData>) => void;
}

const Field = ({
  label,
  value,
  onChange,
  placeholder,
  required,
  type = 'text',
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  placeholder?: string;
  required?: boolean;
  type?: string;
}) => (
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
      {label} {required && '*'}
    </label>

    <input
      type={type}
      placeholder={placeholder}
      value={value}
      onChange={(e) => onChange(e.target.value)}
      required={required}
      style={{
        width: '100%',
        padding: '10px 12px',
        border: `1px solid ${colors.border}`,
        borderRadius: 8,
        fontSize: 14,
      }}
    />
  </div>
);

export default function DatosBasicosStep({
  form,
  update,
}: Props) {
  const [procesos, setProcesos] = useState<Proceso[]>([]);
  const [subprocesos, setSubprocesos] = useState<Subproceso[]>([]);

  const [sistemas, setSistemas] = useState<SistemaPlanta[]>([]);
  const [subprocesosSistema, setSubprocesosSistema] =
    useState<SubprocesoSistemaPlanta[]>([]);

  const [loadingPadres, setLoadingPadres] = useState(false);

  const set =
    (k: keyof EquipoFormData) =>
    (v: string) =>
      update({ [k]: v });

  useEffect(() => {
    const cargar = async () => {
      setLoadingPadres(true);

      try {
        const [procesosResultado, sistemasResultado] =
          await Promise.all([
            getProcesos(),
            getSistemas(),
          ]);

        setProcesos(procesosResultado);
        setSistemas(sistemasResultado);
      } catch (error) {
        console.error(
          'Error cargando procesos y sistemas:',
          error
        );

        setProcesos([]);
        setSistemas([]);
      } finally {
        setLoadingPadres(false);
      }
    };

    cargar();
  }, []);

  useEffect(() => {
    if (form.tipo_padre !== 'proceso') {
      setSubprocesos([]);
      return;
    }

    if (!form.subproceso_padre_id) {
      setSubprocesos([]);
      return;
    }

    const proceso = procesos.find(
      (item) => item.id === form.subproceso_padre_id
    );

    if (!proceso) {
      return;
    }

    const cargar = async () => {
      try {
        const resultado = await getSubprocesos(proceso.id);
        setSubprocesos(resultado);
      } catch (error) {
        console.error(
          'Error cargando subprocesos:',
          error
        );
        setSubprocesos([]);
      }
    };

    cargar();
  }, [
    form.tipo_padre,
    form.subproceso_padre_id,
    procesos,
  ]);

  useEffect(() => {
    if (form.tipo_padre !== 'sistema') {
      setSubprocesosSistema([]);
      return;
    }

    if (!form.subproceso_padre_id) {
      setSubprocesosSistema([]);
      return;
    }

    const sistema = sistemas.find(
      (item) => item.id === form.subproceso_padre_id
    );

    if (!sistema) {
      return;
    }

    const cargar = async () => {
      try {
        const resultado =
          await getSubprocesosSistema(sistema.id);

        setSubprocesosSistema(resultado);
      } catch (error) {
        console.error(
          'Error cargando subprocesos de sistema:',
          error
        );
        setSubprocesosSistema([]);
      }
    };

    cargar();
  }, [
    form.tipo_padre,
    form.subproceso_padre_id,
    sistemas,
  ]);

  const seleccionarTipoPadre = (
    tipo: 'proceso' | 'sistema' | ''
  ) => {
    update({
      tipo_padre: tipo,
      subproceso_padre_id: null,
    });

    setSubprocesos([]);
    setSubprocesosSistema([]);
  };

  const seleccionarPadre = (id: string) => {
    update({
      subproceso_padre_id:
        id === '' ? null : Number(id),
    });
  };

  return (
    <div>
      <h3 style={{ marginBottom: 20 }}>
        Datos del Equipo
      </h3>

      <div
        style={{
          display: 'grid',
          gridTemplateColumns: '1fr 1fr',
          gap: 16,
        }}
      >
        <Field
          label="Código"
          value={form.codigo}
          onChange={set('codigo')}
          placeholder="COMP-001"
          required
        />

        <Field
          label="Nombre"
          value={form.nombre}
          onChange={set('nombre')}
          placeholder="Compresor Principal"
          required
        />

        <AreaTipoInput
          areaInicial={form.area}
          tiposIniciales={form.tipos}
          onChangeArea={(area) =>
            update({
              area,
              tipos: [],
              tipo: '',
              tipo_ids: [],
            })
          }
          onChangeTipos={(tipos) =>
            update({
              tipos,
              tipo: tipos.join(', '),
            })
          }
        />

        <label>Fase o Nivel</label>

        <select
          value={form.fase_ubicacion}
          onChange={(e) =>
            update({
              fase_ubicacion: e.target.value,
            })
          }
        >
          <option value="">
            Seleccionar fase...
          </option>

          <option value="FASE I">
            FASE I
          </option>

          <option value="FASE II">
            FASE II
          </option>

          <option value="FASE III">
            FASE III
          </option>

          <option value="MINA">
            MINA
          </option>

          <option value="INFRAESTRUCTURA">
            INFRAESTRUCTURA
          </option>
        </select>

        <Field
          label="Fabricante"
          value={form.fabricante}
          onChange={set('fabricante')}
          placeholder="Siemens"
        />

        <Field
          label="Modelo"
          value={form.modelo}
          onChange={set('modelo')}
          placeholder="XJ-2000"
        />

        <Field
          label="N° Serie"
          value={form.numero_serie}
          onChange={set('numero_serie')}
          placeholder="SN123456"
        />

        <Field
          label="Fecha Instalación"
          value={form.fecha_instalacion}
          onChange={set('fecha_instalacion')}
          type="date"
        />

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
            Estado *
          </label>

          <select
            value={form.estado_equipo}
            onChange={(e) =>
              set('estado_equipo')(e.target.value)
            }
            style={{
              width: '100%',
              padding: '10px 12px',
              border: `1px solid ${colors.border}`,
              borderRadius: 8,
              fontSize: 14,
            }}
          >
            <option value="activo">Activo</option>
            <option value="inactivo">Inactivo</option>
            <option value="fallo">Fallo</option>
            <option value="mantenimiento">
              Mantenimiento
            </option>
          </select>
        </div>
      </div>

      <div
        style={{
          marginTop: 24,
          paddingTop: 20,
          borderTop: `1px solid ${colors.borderLight}`,
        }}
      >
        <h4 style={{ marginBottom: 6 }}>
          Ubicación en la estructura
        </h4>

        <p
          style={{
            marginTop: 0,
            marginBottom: 16,
            color: colors.text.muted,
            fontSize: 13,
          }}
        >
          Selecciona el subproceso al que pertenecerá
          este equipo.
        </p>

        <div
          style={{
            display: 'grid',
            gridTemplateColumns: '1fr 1fr',
            gap: 16,
          }}
        >
          <div>
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
              Tipo de padre
            </label>

            <select
              value={form.tipo_padre}
              onChange={(e) =>
                seleccionarTipoPadre(
                  e.target.value as
                    | 'proceso'
                    | 'sistema'
                    | ''
                )
              }
              disabled={loadingPadres}
              style={{
                width: '100%',
                padding: '10px 12px',
                border: `1px solid ${colors.border}`,
                borderRadius: 8,
                fontSize: 14,
              }}
            >
              <option value="">
                Seleccionar...
              </option>

              <option value="proceso">
                Proceso
              </option>

              <option value="sistema">
                Sistema
              </option>
            </select>
          </div>

          {form.tipo_padre === 'proceso' && (
            <div>
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
                Subproceso
              </label>

              <select
                value={
                  form.subproceso_padre_id ?? ''
                }
                onChange={(e) =>
                  seleccionarPadre(e.target.value)
                }
                style={{
                  width: '100%',
                  padding: '10px 12px',
                  border: `1px solid ${colors.border}`,
                  borderRadius: 8,
                  fontSize: 14,
                }}
              >
                <option value="">
                  Seleccionar subproceso...
                </option>

                {procesos.map((proceso) => (
                  <optgroup
                    key={proceso.id}
                    label={proceso.nombre}
                  >
                    {subprocesos
                      .filter(
                        (item) =>
                          item.proceso_id ===
                          proceso.id
                      )
                      .map((item) => (
                        <option
                          key={item.id}
                          value={item.id}
                        >
                          {item.nombre}
                        </option>
                      ))}
                  </optgroup>
                ))}
              </select>
            </div>
          )}

          {form.tipo_padre === 'sistema' && (
            <div>
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
                Subproceso de sistema
              </label>

              <select
                value={
                  form.subproceso_padre_id ?? ''
                }
                onChange={(e) =>
                  seleccionarPadre(e.target.value)
                }
                style={{
                  width: '100%',
                  padding: '10px 12px',
                  border: `1px solid ${colors.border}`,
                  borderRadius: 8,
                  fontSize: 14,
                }}
              >
                <option value="">
                  Seleccionar subproceso...
                </option>

                {sistemas.map((sistema) => (
                  <optgroup
                    key={sistema.id}
                    label={sistema.nombre}
                  >
                    {subprocesosSistema
                      .filter(
                        (item) =>
                          item.sistema_id ===
                          sistema.id
                      )
                      .map((item) => (
                        <option
                          key={item.id}
                          value={item.id}
                        >
                          {item.nombre}
                        </option>
                      ))}
                  </optgroup>
                ))}
              </select>
            </div>
          )}
        </div>
      </div>
            <EstructuraPadreSelector
        form={form}
        update={update}
      />
    </div>
  );
}