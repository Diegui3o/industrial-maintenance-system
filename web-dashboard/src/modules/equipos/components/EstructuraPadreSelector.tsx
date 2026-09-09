import { useEffect, useState } from 'react';
import type { EquipoFormData } from '../hooks/useEquipoForm';
import {
  getProcesos,
  getSubprocesos,
  getSistemas,
  getSubprocesosSistema,
  type SistemaPlanta,
  type SubprocesoSistemaPlanta,
} from '../../../dashboard/DashboardAreas/Planta/services/plantaApi';

interface ProcesoPlanta {
  id: number;
  nombre: string;
}

interface SubprocesoPlanta {
  id: number;
  proceso_id: number;
  nombre: string;
}

interface Props {
  form: EquipoFormData;
  update: (data: Partial<EquipoFormData>) => void;
}

export default function EstructuraPadreSelector({
  form,
  update,
}: Props) {
  const [procesos, setProcesos] = useState<ProcesoPlanta[]>([]);
  const [subprocesos, setSubprocesos] = useState<SubprocesoPlanta[]>([]);

  const [sistemas, setSistemas] = useState<SistemaPlanta[]>([]);
  const [subprocesosSistema, setSubprocesosSistema] =
    useState<SubprocesoSistemaPlanta[]>([]);

  const [procesoId, setProcesoId] = useState<number | null>(null);
  const [sistemaId, setSistemaId] = useState<number | null>(null);

  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const cargar = async () => {
      setLoading(true);

      try {
        const [procesosData, sistemasData] = await Promise.all([
          getProcesos(),
          getSistemas(),
        ]);

        setProcesos(procesosData);
        setSistemas(sistemasData);
      } catch (error) {
        console.error(
          'Error cargando estructura para padre:',
          error
        );
      } finally {
        setLoading(false);
      }
    };

    cargar();
  }, []);

  useEffect(() => {
    if (form.tipo_padre !== 'proceso' || !procesoId) {
      setSubprocesos([]);
      return;
    }

    const cargar = async () => {
      try {
        const data = await getSubprocesos(procesoId);
        setSubprocesos(data);
      } catch (error) {
        console.error('Error cargando subprocesos:', error);
        setSubprocesos([]);
      }
    };

    cargar();
  }, [form.tipo_padre, procesoId]);

  useEffect(() => {
    if (form.tipo_padre !== 'sistema' || !sistemaId) {
      setSubprocesosSistema([]);
      return;
    }

    const cargar = async () => {
      try {
        const data = await getSubprocesosSistema(sistemaId);
        setSubprocesosSistema(data);
      } catch (error) {
        console.error(
          'Error cargando subprocesos de sistema:',
          error
        );
        setSubprocesosSistema([]);
      }
    };

    cargar();
  }, [form.tipo_padre, sistemaId]);

  const cambiarTipoPadre = (
    tipo: EquipoFormData['tipo_padre']
  ) => {
    update({
      tipo_padre: tipo,
      subproceso_padre_id: null,
    });

    setProcesoId(null);
    setSistemaId(null);
    setSubprocesos([]);
    setSubprocesosSistema([]);
  };

  const cambiarProceso = (id: number | null) => {
    setProcesoId(id);
    update({
    subproceso_padre_id: null,
  });
  };

  const cambiarSistema = (id: number | null) => {
    setSistemaId(id);
    update({
    subproceso_padre_id: null,
  });
  };

  return (
    <div
      style={{
        marginTop: 24,
        paddingTop: 20,
        borderTop: '1px solid #ddd',
      }}
    >
      <h3 style={{ marginBottom: 6 }}>
        Estructura del equipo
      </h3>

      <p
        style={{
          marginTop: 0,
          marginBottom: 16,
          color: '#666',
        }}
      >
        Selecciona el subproceso al que pertenecerá este equipo.
      </p>

      <div style={{ marginBottom: 16 }}>
        <label>
          Tipo de padre
        </label>

        <select
          value={form.tipo_padre}
          onChange={(e) =>
            cambiarTipoPadre(
              e.target.value as EquipoFormData['tipo_padre']
            )
          }
          disabled={loading}
        >
          <option value="">
            Sin asignar
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
        <>
          <div style={{ marginBottom: 16 }}>
            <label>
              Proceso
            </label>

            <select
              value={procesoId ?? ''}
              onChange={(e) =>
                cambiarProceso(
                  e.target.value
                    ? Number(e.target.value)
                    : null
                )
              }
            >
              <option value="">
                Seleccionar proceso
              </option>

              {procesos.map((proceso) => (
                <option
                  key={proceso.id}
                  value={proceso.id}
                >
                  {proceso.nombre}
                </option>
              ))}
            </select>
          </div>

          <div style={{ marginBottom: 16 }}>
            <label>
              Subproceso
            </label>

            <select
              value={form.subproceso_padre_id ?? ''}
              onChange={(e) =>
                update({
                  subproceso_padre_id: e.target.value
                    ? Number(e.target.value)
                    : null,
                })
              }
              disabled={!procesoId}
            >
              <option value="">
                Seleccionar subproceso
              </option>

              {subprocesos.map((subproceso) => (
                <option
                  key={subproceso.id}
                  value={subproceso.id}
                >
                  {subproceso.nombre}
                </option>
              ))}
            </select>
          </div>
        </>
      )}

      {form.tipo_padre === 'sistema' && (
        <>
          <div style={{ marginBottom: 16 }}>
            <label>
              Sistema
            </label>

            <select
              value={sistemaId ?? ''}
              onChange={(e) =>
                cambiarSistema(
                  e.target.value
                    ? Number(e.target.value)
                    : null
                )
              }
            >
              <option value="">
                Seleccionar sistema
              </option>

              {sistemas.map((sistema) => (
                <option
                  key={sistema.id}
                  value={sistema.id}
                >
                  {sistema.nombre}
                </option>
              ))}
            </select>
          </div>

          <div style={{ marginBottom: 16 }}>
            <label>
              Subproceso
            </label>

            <select
              value={form.subproceso_padre_id ?? ''}
              onChange={(e) =>
                update({
                  subproceso_padre_id: e.target.value
                    ? Number(e.target.value)
                    : null,
                })
              }
              disabled={!sistemaId}
            >
              <option value="">
                Seleccionar subproceso
              </option>

              {subprocesosSistema.map((subproceso) => (
                <option
                  key={subproceso.id}
                  value={subproceso.id}
                >
                  {subproceso.nombre}
                </option>
              ))}
            </select>
          </div>
        </>
      )}
    </div>
  );
}