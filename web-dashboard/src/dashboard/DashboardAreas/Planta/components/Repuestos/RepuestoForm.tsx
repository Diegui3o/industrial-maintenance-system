import { useEffect, useState } from "react";

import type { Repuesto, RepuestoActualizacion } from "../../services/plantaRepuestosApi";

interface Props {
  repuesto: Repuesto | null;
  guardando: boolean;
  onCancel: () => void;
  onSave: (datos: RepuestoActualizacion) => void;
}

export function RepuestoForm({
  repuesto,
  guardando,
  onCancel,
  onSave,
}: Props) {
  const [nombre, setNombre] = useState("");
  const [codigo, setCodigo] = useState("");
  const [descripcion, setDescripcion] = useState("");
  const [categoria, setCategoria] = useState("");
  const [criticidad, setCriticidad] = useState("");
  const [stockActual, setStockActual] = useState("");
  const [stockMinimo, setStockMinimo] = useState("");
  const [unidadMedida, setUnidadMedida] = useState("");
  const [marca, setMarca] = useState("");
  const [modelo, setModelo] = useState("");
  const [codigoSAP, setCodigoSAP] = useState("");
  const [especificaciones, setEspecificaciones] = useState("");

  useEffect(() => {
    if (repuesto) {
      setNombre(repuesto.nombre ?? "");
      setCodigo(repuesto.codigo ?? "");
      setDescripcion(repuesto.descripcion ?? "");
      setCategoria(repuesto.categoria ?? "");
      setCriticidad(repuesto.criticidad ?? "");
      setStockActual(String(repuesto.stock_actual ?? ""));
      setStockMinimo(String(repuesto.stock_minimo ?? ""));
      setUnidadMedida(repuesto.unidad_medida ?? "");
      setMarca(repuesto.marca ?? "");
      setModelo(repuesto.modelo ?? "");
      setCodigoSAP(repuesto.codigo_sap ?? "");
      setEspecificaciones(repuesto.especificaciones_tecnicas ?? "");
    } else {
      setNombre(""); setCodigo(""); setDescripcion(""); setCategoria(""); setCriticidad("");
      setStockActual(""); setStockMinimo(""); setUnidadMedida(""); setMarca(""); setModelo("");
      setCodigoSAP(""); setEspecificaciones("");
    }
  }, [repuesto]);

  const guardar = () => {
    const nombreLimpio = nombre.trim();
    if (!nombreLimpio || guardando) return;

    const stockA = stockActual.trim() ? Number(stockActual) : undefined;
    const stockM = stockMinimo.trim() ? Number(stockMinimo) : undefined;

    if (stockA !== undefined && stockA < 0) return;
    if (stockM !== undefined && stockM < 0) return;

    onSave({
      nombre: nombreLimpio,
      codigo: codigo.trim() || undefined,
      descripcion: descripcion.trim() || undefined,
      categoria: categoria.trim() || undefined,
      criticidad: criticidad.trim() || undefined,
      stock_actual: stockA,
      stock_minimo: stockM,
      unidad_medida: unidadMedida.trim() || undefined,
      marca: marca.trim() || undefined,
      modelo: modelo.trim() || undefined,
      codigo_sap: codigoSAP.trim() || undefined,
      especificaciones_tecnicas: especificaciones.trim() || undefined,
    });
  };

  const CATEGORIAS = ["Instrumental", "Mecánico", "Eléctrico"];
  const CRITICIDADES = ["Baja", "Media", "Alta", "Crítica"];

  return (
    <div className="planta-form">
      <h4>{repuesto ? "Editar repuesto" : "Nuevo repuesto"}</h4>

      <input placeholder="Código" value={codigo} onChange={e => setCodigo(e.target.value)} />
      <input placeholder="Código SAP" value={codigoSAP} onChange={e => setCodigoSAP(e.target.value)} />
      <input placeholder="Nombre *" value={nombre} onChange={e => setNombre(e.target.value)} />
      <input placeholder="Descripción" value={descripcion} onChange={e => setDescripcion(e.target.value)} />

      <select value={categoria} onChange={e => setCategoria(e.target.value)}>
        <option value="">Categoría</option>
        {CATEGORIAS.map(c => <option key={c} value={c}>{c}</option>)}
      </select>

      <select value={criticidad} onChange={e => setCriticidad(e.target.value)}>
        <option value="">Criticidad</option>
        {CRITICIDADES.map(c => <option key={c} value={c}>{c}</option>)}
      </select>

      <input
        type="number"
        placeholder="Stock actual"
        value={stockActual}
        onChange={e => setStockActual(e.target.value)}
        min="0"
        step="0.001"
      />
      <input
        type="number"
        placeholder="Stock mínimo"
        value={stockMinimo}
        onChange={e => setStockMinimo(e.target.value)}
        min="0"
        step="0.001"
      />
      <input placeholder="Unidad de medida" value={unidadMedida} onChange={e => setUnidadMedida(e.target.value)} />
      <input placeholder="Marca" value={marca} onChange={e => setMarca(e.target.value)} />
      <input placeholder="Modelo" value={modelo} onChange={e => setModelo(e.target.value)} />
      <textarea placeholder="Especificaciones técnicas" value={especificaciones} onChange={e => setEspecificaciones(e.target.value)} rows={3} />

      <div className="planta-form-actions">
        <button className="planta-cancel-btn" onClick={onCancel} disabled={guardando}>Cancelar</button>
        <button className="planta-save-btn" onClick={guardar} disabled={!nombre.trim() || guardando}>
          {guardando ? "Guardando..." : "Guardar"}
        </button>
      </div>
    </div>
  );
}