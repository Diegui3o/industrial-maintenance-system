import type { ChangeEvent } from 'react';

interface MotorElectricoFiltrosProps {
  busqueda: string;
  zona: string;
  marca: string;
  zonas: string[];
  marcas: string[];
  onBusquedaChange: (valor: string) => void;
  onZonaChange: (valor: string) => void;
  onMarcaChange: (valor: string) => void;
}

export function MotorElectricoFiltros({
  busqueda,
  zona,
  marca,
  zonas,
  marcas,
  onBusquedaChange,
  onZonaChange,
  onMarcaChange,
}: MotorElectricoFiltrosProps) {
  const manejarBusqueda = (
    event: ChangeEvent<HTMLInputElement>,
  ) => {
    onBusquedaChange(event.target.value);
  };

  const manejarZona = (
    event: ChangeEvent<HTMLSelectElement>,
  ) => {
    onZonaChange(event.target.value);
  };

  const manejarMarca = (
    event: ChangeEvent<HTMLSelectElement>,
  ) => {
    onMarcaChange(event.target.value);
  };

  return (
    <div className="motor-electrico-filtros">
      <div className="motor-electrico-filtro">
        <label htmlFor="motor-busqueda">
          Buscar
        </label>

        <input
          id="motor-busqueda"
          type="text"
          value={busqueda}
          onChange={manejarBusqueda}
          placeholder="TAG, descripción, serie o código SAP..."
        />
      </div>

      <div className="motor-electrico-filtro">
        <label htmlFor="motor-zona">
          Zona
        </label>

        <select
          id="motor-zona"
          value={zona}
          onChange={manejarZona}
        >
          <option value="">
            Todas las zonas
          </option>

          {zonas.map((item) => (
            <option
              key={item}
              value={item}
            >
              {item}
            </option>
          ))}
        </select>
      </div>

      <div className="motor-electrico-filtro">
        <label htmlFor="motor-marca">
          Marca
        </label>

        <select
          id="motor-marca"
          value={marca}
          onChange={manejarMarca}
        >
          <option value="">
            Todas las marcas
          </option>

          {marcas.map((item) => (
            <option
              key={item}
              value={item}
            >
              {item}
            </option>
          ))}
        </select>
      </div>
    </div>
  );
}