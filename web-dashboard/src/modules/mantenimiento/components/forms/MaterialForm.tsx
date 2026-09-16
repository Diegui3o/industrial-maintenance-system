import {
  Grid,
  Field,
  NumberField,
} from "../DetalleCampos";

type Props = {
  form: any;
  cambiar: (campo: string, valor: any) => void;
};

export default function MaterialForm({
  form,
  cambiar,
}: Props) {
  return (
    <Grid>
      <NumberField
        label="Repuesto ID"
        value={form.repuesto_id}
        onChange={(v) =>
          cambiar("repuesto_id", v)
        }
      />

      <NumberField
        label="Componente ID"
        value={form.componente_id}
        onChange={(v) =>
          cambiar("componente_id", v)
        }
      />

      <NumberField
        label="Subcomponente ID"
        value={form.subcomponente_id}
        onChange={(v) =>
          cambiar(
            "subcomponente_id",
            v
          )
        }
      />

      <Field
        label="Descripción"
        value={form.descripcion}
        onChange={(v) =>
          cambiar("descripcion", v)
        }
      />

      <NumberField
        label="Cantidad"
        value={form.cantidad}
        onChange={(v) =>
          cambiar("cantidad", v)
        }
      />

      <Field
        label="Unidad"
        value={form.unidad}
        onChange={(v) =>
          cambiar("unidad", v)
        }
      />

      <NumberField
        label="Costo unitario"
        value={form.costo_unitario}
        onChange={(v) =>
          cambiar(
            "costo_unitario",
            v
          )
        }
      />

      <Field
        label="Código SAP"
        value={form.codigo_sap}
        onChange={(v) =>
          cambiar("codigo_sap", v)
        }
      />

      <Field
        label="Observación"
        value={form.observacion}
        onChange={(v) =>
          cambiar("observacion", v)
        }
      />
    </Grid>
  );
}