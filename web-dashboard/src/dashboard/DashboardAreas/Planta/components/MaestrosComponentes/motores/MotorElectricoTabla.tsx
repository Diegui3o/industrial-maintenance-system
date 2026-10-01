import { useMemo, useState } from 'react';

import { MotorElectricoFiltros } from './MotorElectricoFiltros';

import './MotorElectricoTabla.css';
import './MotorElectricoFiltros.css';

export interface MotorElectricoFila {
  componente_id: number;

  descripcion_componente: string | null;
  tag: string | null;
  placa_motor: string | null;
  fecha_actualizacion: string | null;

  zona: string | null;

  marca: string | null;
  modelo: string | null;
  numero_serie: string | null;

  kw: number | null;
  hp: number | null;
  volt: number | null;
  amp: number | null;
  rpm: number | null;

  frame: string | null;

  fs: number | null;
  fp: number | null;

  clase: string | null;
  duty: string | null;
  eff: number | null;

  lado_polea: string | null;
  codigo_sap_polea: string | null;

  lado_ventilador: string | null;
  codigo_sap_ventilador: string | null;

  tipo_arranque: string | null;
  marca_arranque: string | null;
  modelo_arranque: string | null;
}

interface MotorElectricoTablaProps {
  datos?: MotorElectricoFila[];
}

export function MotorElectricoTabla({
  datos = [],
}: MotorElectricoTablaProps) {
  const [busqueda, setBusqueda] = useState('');
  const [zona, setZona] = useState('');
  const [marca, setMarca] = useState('');

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
          item.descripcion_componente,
          item.tag,
          item.placa_motor,
          item.numero_serie,
          item.codigo_sap_polea,
          item.codigo_sap_ventilador,
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
              <th>
                Descripción del componente
              </th>

              <th>TAG</th>

              <th>
                Placa de motor
              </th>

              <th>
                Fecha de actualización
              </th>

              <th>Zona</th>

              <th>Marca</th>

              <th>Modelo</th>

              <th>N° / Serie</th>

              <th>KW</th>

              <th>HP</th>

              <th>Volt</th>

              <th>Amp</th>

              <th>RPM</th>

              <th>Frame</th>

              <th>F.S</th>

              <th>F.P</th>

              <th>Clase</th>

              <th>Duty</th>

              <th>Eff</th>

              <th>Lado polea</th>

              <th>Código SAP</th>

              <th>Lado ventilador</th>

              <th>Código SAP</th>

              <th>
                Tipo de arranque
              </th>

              <th>Marca</th>

              <th>Modelo</th>

              <th>PDF</th>
            </tr>
          </thead>

          <tbody>
            {datosFiltrados.length === 0 ? (
              <tr>
                <td colSpan={27}>
                  {datos.length === 0
                    ? 'No hay motores eléctricos para mostrar.'
                    : 'No se encontraron motores con los filtros seleccionados.'}
                </td>
              </tr>
            ) : (
              datosFiltrados.map((motor) => (
                <tr
                  key={motor.componente_id}
                >
                  <td>
                    {motor.descripcion_componente ||
                      '—'}
                  </td>

                  <td>
                    {motor.tag || '—'}
                  </td>

                  <td>
                    {motor.placa_motor || '—'}
                  </td>

                  <td>
                    {motor.fecha_actualizacion ||
                      '—'}
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
                    {motor.numero_serie ||
                      '—'}
                  </td>

                  <td>
                    {motor.kw ?? '—'}
                  </td>

                  <td>
                    {motor.hp ?? '—'}
                  </td>

                  <td>
                    {motor.volt ?? '—'}
                  </td>

                  <td>
                    {motor.amp ?? '—'}
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
                    {motor.lado_polea ||
                      '—'}
                  </td>

                  <td>
                    {motor.codigo_sap_polea ||
                      '—'}
                  </td>

                  <td>
                    {motor.lado_ventilador ||
                      '—'}
                  </td>

                  <td>
                    {motor.codigo_sap_ventilador ||
                      '—'}
                  </td>

                  <td>
                    {motor.tipo_arranque ||
                      '—'}
                  </td>

                  <td>
                    {motor.marca_arranque ||
                      '—'}
                  </td>

                  <td>
                    {motor.modelo_arranque ||
                      '—'}
                  </td>

                  <td>
                    <button
                      type="button"
                      className="motor-electrico-pdf"
                      disabled
                      title="PDF próximamente"
                    >
                      PDF
                    </button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}