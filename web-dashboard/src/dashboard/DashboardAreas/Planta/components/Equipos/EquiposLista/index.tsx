import { useState, useMemo, useEffect } from "react";
import { useEquiposPlanta } from "./hooks/useEquiposPlanta";
import { EquiposListaHeader } from "./components/EquiposListaHeader";
import { EquiposTabla } from "./components/EquiposTabla";
import { ModalCambioEstado } from "./components/ModalCambioEstado";
import { COLUMNAS, type FilaEquipo, type ColumnaKey, type FiltrosState } from "./types";

export function EquiposLista() {
  const { equipos, filas, loading, error, setEquipos } = useEquiposPlanta();

  const [filtros, setFiltros] = useState<FiltrosState>({});
  const [filtroAbierto, setFiltroAbierto] = useState<ColumnaKey | null>(null);
  const [busquedaFiltro, setBusquedaFiltro] = useState("");
  const [posicionFiltro, setPosicionFiltro] = useState({ top: 0, left: 0 });

  const [menuFilaClave, setMenuFilaClave] = useState<string | null>(null);
  const [equipoEstado, setEquipoEstado] = useState<FilaEquipo | null>(null);

  useEffect(() => {
    const cerrarMenus = (event: MouseEvent) => {
      const target = event.target as HTMLElement;
      if (!target.closest(".planta-equipos-opciones-wrap")) {
        setMenuFilaClave(null);
      }
    };
    document.addEventListener("mousedown", cerrarMenus);
    return () => document.removeEventListener("mousedown", cerrarMenus);
  }, []);

  const valoresPorColumna = useMemo(() => {
    const resultado = {} as Record<ColumnaKey, string[]>;
    COLUMNAS.forEach((columna) => {
      resultado[columna.key] = Array.from(
        new Set(filas.map((fila) => fila[columna.key]))
      ).sort((a, b) =>
        a.localeCompare(b, "es", { numeric: true, sensitivity: "base" })
      );
    });
    return resultado;
  }, [filas]);

  const filasFiltradas = useMemo(() => {
    return filas.filter((fila) =>
      COLUMNAS.every((columna) => {
        const seleccion = filtros[columna.key];
        if (!seleccion || seleccion.size === 0) return true;
        return seleccion.has(fila[columna.key]);
      })
    );
  }, [filas, filtros]);

  function abrirFiltro(columna: ColumnaKey, evento: React.MouseEvent<HTMLButtonElement>) {
    if (filtroAbierto === columna) {
      setFiltroAbierto(null);
      return;
    }
    const rect = evento.currentTarget.getBoundingClientRect();
    setPosicionFiltro({ top: rect.bottom + 2, left: rect.left });
    setFiltroAbierto(columna);
    setBusquedaFiltro("");
  }

  function seleccionarValor(columna: ColumnaKey, valor: string) {
    setFiltros((actual) => {
      const nuevo = new Set(actual[columna] ?? []);
      if (nuevo.has(valor)) {
        nuevo.delete(valor);
      } else {
        nuevo.add(valor);
      }
      return { ...actual, [columna]: nuevo.size > 0 ? nuevo : undefined };
    });
  }

  function seleccionarTodos(columna: ColumnaKey) {
    setFiltros((actual) => ({ ...actual, [columna]: undefined }));
  }

  function limpiarFiltros() {
    setFiltros({});
    setFiltroAbierto(null);
    setBusquedaFiltro("");
  }

  if (loading) {
    return <div className="planta-lista-cargando">Cargando equipos y estructura...</div>;
  }

  if (error) {
    return <div className="planta-lista-error">{error}</div>;
  }

  return (
    <section className="planta-lista planta-equipos-lista">
      <EquiposListaHeader
        filasFiltradas={filasFiltradas}
        totalEquipos={equipos.length}
        onLimpiarFiltros={limpiarFiltros}
      />

      <EquiposTabla
        filasFiltradas={filasFiltradas}
        valoresPorColumna={valoresPorColumna}
        filtros={filtros}
        filtroAbierto={filtroAbierto}
        busquedaFiltro={busquedaFiltro}
        posicionFiltro={posicionFiltro}
        menuFilaClave={menuFilaClave}
        onAbrirFiltro={abrirFiltro}
        onBusquedaFiltroChange={setBusquedaFiltro}
        onSeleccionarValor={seleccionarValor}
        onSeleccionarTodos={seleccionarTodos}
        onCerrarFiltro={() => setFiltroAbierto(null)}
        onMenuFilaToggle={setMenuFilaClave}
        onAbrirCambioEstado={(fila) => {
          setMenuFilaClave(null);
          setEquipoEstado(fila);
        }}
      />

      {equipoEstado && (
        <ModalCambioEstado
          equipo={equipoEstado}
          onCerrar={() => setEquipoEstado(null)}
          onSuccess={(equipoId, nuevoEstado) => {
            setEquipos((actuales) =>
              actuales.map((equipo) =>
                equipo.id === equipoId
                  ? { ...equipo, estado_equipo: nuevoEstado }
                  : equipo
              )
            );
          }}
        />
      )}
    </section>
  );
}