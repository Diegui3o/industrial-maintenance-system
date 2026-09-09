import { useEffect, useState } from 'react'

import {
  getProcesos,
  getSubprocesos,
  getSistemas,
  getSubprocesosSistema,
  type Proceso,
  type Subproceso,
  type SistemaPlanta,
  type SubprocesoSistemaPlanta,
} from '../../../dashboard/DashboardAreas/Planta/services/plantaApi'

interface Props {
  form: any
  update: (data: any) => void
}

export default function EstructuraPadreSelector({
  form,
  update,
}: Props) {
  const [tipo, setTipo] = useState<'proceso' | 'sistema' | ''>(
    form.tipo_padre || ''
  )

  const [procesos, setProcesos] = useState<Proceso[]>([])
  const [sistemas, setSistemas] = useState<SistemaPlanta[]>([])

  const [subprocesos, setSubprocesos] =
    useState<Subproceso[]>([])

  const [subprocesosSistema, setSubprocesosSistema] =
    useState<SubprocesoSistemaPlanta[]>([])

  const [procesoId, setProcesoId] =
    useState<number | null>(null)

  const [sistemaId, setSistemaId] =
    useState<number | null>(null)

  useEffect(() => {
    const cargar = async () => {
      try {
        const [procesosData, sistemasData] =
          await Promise.all([
            getProcesos(),
            getSistemas(),
          ])

        setProcesos(procesosData)
        setSistemas(sistemasData)
      } catch (error) {
        console.error(
          'Error cargando estructura padre:',
          error
        )
      }
    }

    cargar()
  }, [])

  const cambiarTipo = (
    nuevoTipo: 'proceso' | 'sistema'
  ) => {
    setTipo(nuevoTipo)

    setProcesoId(null)
    setSistemaId(null)

    setSubprocesos([])
    setSubprocesosSistema([])

    update({
      tipo_padre: nuevoTipo,
      subproceso_padre_id: null,
    })
  }

  const cambiarProceso = async (
    id: number | null
  ) => {
    setProcesoId(id)
    setSubprocesos([])

    update({
      subproceso_padre_id: null,
    })

    if (!id) return

    try {
      const resultado = await getSubprocesos(id)
      setSubprocesos(resultado)
    } catch (error) {
      console.error(
        'Error cargando subprocesos:',
        error
      )
    }
  }

  const cambiarSistema = async (
    id: number | null
  ) => {
    setSistemaId(id)
    setSubprocesosSistema([])

    update({
      subproceso_padre_id: null,
    })

    if (!id) return

    try {
      const resultado =
        await getSubprocesosSistema(id)

      setSubprocesosSistema(resultado)
    } catch (error) {
      console.error(
        'Error cargando subprocesos de sistema:',
        error
      )
    }
  }

  return (
    <div>
      <h4>Ubicación en estructura</h4>

      <div style={{ marginBottom: 12 }}>
        <label>Tipo de estructura</label>

        <select
          value={tipo}
          onChange={(e) =>
            cambiarTipo(
              e.target.value as
                | 'proceso'
                | 'sistema'
            )
          }
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

      {tipo === 'proceso' && (
        <>
          <div style={{ marginBottom: 12 }}>
            <label>Proceso</label>

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
                Seleccionar proceso...
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

          <div>
            <label>Subproceso padre</label>

            <select
              value={
                form.subproceso_padre_id ?? ''
              }
              disabled={!procesoId}
              onChange={(e) =>
                update({
                  subproceso_padre_id:
                    e.target.value
                      ? Number(e.target.value)
                      : null,
                })
              }
            >
              <option value="">
                Seleccionar subproceso...
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

      {tipo === 'sistema' && (
        <>
          <div style={{ marginBottom: 12 }}>
            <label>Sistema</label>

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
                Seleccionar sistema...
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

          <div>
            <label>Subproceso padre</label>

            <select
              value={
                form.subproceso_padre_id ?? ''
              }
              disabled={!sistemaId}
              onChange={(e) =>
                update({
                  subproceso_padre_id:
                    e.target.value
                      ? Number(e.target.value)
                      : null,
                })
              }
            >
              <option value="">
                Seleccionar subproceso...
              </option>

              {subprocesosSistema.map(
                (subproceso) => (
                  <option
                    key={subproceso.id}
                    value={subproceso.id}
                  >
                    {subproceso.nombre}
                  </option>
                )
              )}
            </select>
          </div>
        </>
      )}
    </div>
  )
}