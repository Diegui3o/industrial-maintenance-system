import {
  Grid,
  Field,
  NumberField,
} from "../DetalleCampos";

type Props = {
  form: any;
  cambiar: (campo: string, valor: any) => void;
};

export default function AvanceEditor({
  form,
  cambiar,
}: Props) {
  return (
    <Grid>
      <NumberField
        label="Actividad ID"
        value={form.actividad_id}
        onChange={(v) =>
          cambiar("actividad_id", v)
        }
      />

      <NumberField
        label="Porcentaje"
        value={form.porcentaje}
        onChange={(v) =>
          cambiar("porcentaje", v)
        }
      />

      <NumberField
        label="Usuario ID"
        value={form.usuario_id}
        onChange={(v) =>
          cambiar("usuario_id", v)
        }
      />

      <Field
        label="Descripción"
        value={form.descripcion}
        onChange={(v) =>
          cambiar("descripcion", v)
        }
      />
    </Grid>
  );
}