import { useEffect, useMemo, useState } from 'react';

import { getMaestrosMotoresElectricos } from '../../../services/maestrosComponentesApi';

import type { MaestroMotorElectrico } from '../../../services/maestrosComponentesApi';

import { MotorElectricoFiltros } from './MotorElectricoFiltros';

import './MotorElectricoTabla.css';
import './MotorElectricoFiltros.css';

interface MotorElectricoTablaProps {
  datos?: MaestroMotorElectrico[];
}

export function MotorElectricoTabla({
  datos: datosIniciales,
}: MotorElectricoTablaProps) {
  const [datos, setDatos] = useState<MaestroMotorElectrico[]>(
    datosIniciales ?? [],
  );

  const [cargando, setCargando] = useState(
    datosIniciales === undefined,
  );

  const [error, setError] = useState<string | null>(null);

  const [busqueda, setBusqueda] = useState('');
  const [zona, setZona] = useState('');
  const [marca, setMarca] = useState('');

  useEffect(() => {
    if (datosIniciales !== undefined) {
      setDatos(datosIniciales);
      setCargando(false);
      return;
    }

    let activo = true;

    async function cargarMotores() {
      try {
        setCargando(true);
        setError(null);

        const resultado =
          await getMaestrosMotoresElectricos();

        if (!activo) {
          return;
        }

        setDatos(resultado);
      } catch (err) {
        if (!activo) {
          return;
        }

        console.error(
          'Error al cargar maestros de motores eléctricos:',
          err,
        );

        setError(
          'No fue posible cargar los motores eléctricos.',
        );

        setDatos([]);
      } finally {
        if (activo) {
          setCargando(false);
        }
      }
    }

    cargarMotores();

    return () => {
      activo = false;
    };
  }, [datosIniciales]);

  const zonas = useMemo(() => {
    return Array.from(
      new Set(
        datos
          .map((item) => item.zona?.trim())
          .filter(
            (item): item is string =>
              Boolean(item),
          ),
      ),
    ).sort();
  }, [datos]);

  const marcas = useMemo(() => {
    return Array.from(
      new Set(
        datos
          .map((item) => item.marca?.trim())
          .filter(
            (item): item is string =>
              Boolean(item),
          ),
      ),
    ).sort();
  }, [datos]);

  const datosFiltrados = useMemo(() => {
    const texto = busqueda
      .trim()
      .toLowerCase();

    return datos.filter((item) => {
      const coincideBusqueda =
        !texto ||
        [
          item.codigo_interno,
          item.codigo_sap,
          item.tipo_componente,
          item.nombre_componente,
          item.tag,
          item.placa_motor,
          item.numero_serie,
          item.marca,
          item.modelo,
          item.frame,
          item.tipo_arranque,
          item.rodamiento_de,
          item.rodamiento_nde,
        ].some((valor) =>
          valor
            ?.toLowerCase()
            .includes(texto),
        );

      const coincideZona =
        !zona ||
        item.zona === zona;

      const coincideMarca =
        !marca ||
        item.marca === marca;

      return (
        coincideBusqueda &&
        coincideZona &&
        coincideMarca
      );
    });
  }, [
    datos,
    busqueda,
    zona,
    marca,
  ]);

  const limpiarFiltros = () => {
    setBusqueda('');
    setZona('');
    setMarca('');
  };

  if (cargando) {
    return (
      <div className="maestro-componentes-tabla-vacia">
        <h3>
          Cargando motores eléctricos...
        </h3>

        <p>
          Consultando información técnica del maestro.
        </p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="maestro-componentes-tabla-vacia">
        <h3>
          No se pudo cargar el maestro
        </h3>

        <p>{error}</p>
      </div>
    );
  }

  return (
    <div className="motor-electrico-maestro">
      <div className="motor-electrico-maestro-header">
        <div>
          <h3>
            Maestro de Motores Eléctricos
          </h3>

          <span>
            Información técnica de motores eléctricos
          </span>
        </div>

        <div className="motor-electrico-controles">
          <div className="motor-electrico-contador">
            {datosFiltrados.length}{' '}
            {datosFiltrados.length === 1
              ? 'motor'
              : 'motores'}
          </div>

          {(busqueda || zona || marca) && (
            <button
              type="button"
              className="motor-electrico-limpiar"
              onClick={limpiarFiltros}
            >
              Limpiar
            </button>
          )}
        </div>
      </div>

      <MotorElectricoFiltros
        busqueda={busqueda}
        zona={zona}
        marca={marca}
        zonas={zonas}
        marcas={marcas}
        onBusquedaChange={setBusqueda}
        onZonaChange={setZona}
        onMarcaChange={setMarca}
      />

      <div className="motor-electrico-tabla-wrapper">
        <table className="motor-electrico-tabla">
          <thead>
            <tr>
              <th>Código interno</th>
              <th>Código SAP</th>
              <th>Nombre de componente</th>
              <th>TAG</th>
              <th>Placa de motor</th>
              <th>Fecha de actualización</th>
              <th>Zona</th>
              <th>Marca</th>
              <th>Modelo</th>
              <th>N° / Serie</th>

              <th>KW</th>
              <th>HP</th>
              <th>VOLT</th>
              <th>AMP</th>
              <th>RPM</th>
              <th>FRAME</th>
              <th>F.S</th>
              <th>F.P</th>
              <th>CLASE</th>
              <th>DUTY</th>
              <th>EFF</th>

              <th>Tipo de arranque</th>

              <th>Rodamiento DE</th>
              <th>Rodamiento NDE</th>

              <th>PDF</th>
            </tr>
          </thead>

          <tbody>
            {datosFiltrados.map((motor) => (
              <tr key={motor.componente_id}>
                <td>
                  {motor.codigo_interno || '—'}
                </td>

                <td>
                  {motor.codigo_sap || '—'}
                </td>

                <td>
                  {motor.tipo_componente &&
                  motor.nombre_componente
                    ? `${motor.tipo_componente} - ${motor.nombre_componente}`
                    : motor.nombre_componente ||
                      motor.tipo_componente ||
                      '—'}
                </td>

                <td>
                  {motor.tag || '—'}
                </td>

                <td>
                  {motor.placa_motor || '—'}
                </td>

                <td>
                  {motor.fecha_actualizacion
                    ? new Date(
                        motor.fecha_actualizacion,
                      ).toLocaleDateString()
                    : '—'}
                </td>

                <td>
                  {motor.zona || '—'}
                </td>

                <td>
                  {motor.marca || '—'}
                </td>

                <td>
                  {motor.modelo || '—'}
                </td>

                <td>
                  {motor.numero_serie || '—'}
                </td>

                <td>
                  {motor.kw ?? '—'}
                </td>

                <td>
                  {motor.hp ?? '—'}
                </td>

                <td>
                  {motor.volt || '—'}
                </td>

                <td>
                  {motor.amp || '—'}
                </td>

                <td>
                  {motor.rpm ?? '—'}
                </td>

                <td>
                  {motor.frame || '—'}
                </td>

                <td>
                  {motor.fs ?? '—'}
                </td>

                <td>
                  {motor.fp ?? '—'}
                </td>

                <td>
                  {motor.clase || '—'}
                </td>

                <td>
                  {motor.duty || '—'}
                </td>

                <td>
                  {motor.eff ?? '—'}
                </td>

                <td>
                  {motor.tipo_arranque || '—'}
                </td>

                <td>
                  {motor.rodamiento_de || '—'}
                </td>

                <td>
                  {motor.rodamiento_nde || '—'}
                </td>

                <td>
                  <button
                    type="button"
                    disabled
                  >
                    PDF
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}