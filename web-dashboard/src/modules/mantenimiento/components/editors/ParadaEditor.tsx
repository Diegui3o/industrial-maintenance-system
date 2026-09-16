import {
  Grid,
  Field,
  NumberField,
  Check,
} from "../DetalleCampos";
    
type Props = {
  form: any;
  cambiar: (campo: string, valor: any) => void;
};

export default function ParadaEditor({
  form,
  cambiar,
}: Props) {
  return (
    <Grid>
      <Field
        label="Nivel"
        value={form.nivel}
        onChange={(v) =>
          cambiar("nivel", v)
        }
      />

      <NumberField
        label="Equipo ID"
        value={form.equipo_id}
        onChange={(v) =>
          cambiar("equipo_id", v)
        }
      />

      <Field
        label="Fecha inicio"
        type="datetime-local"
        value={form.fecha_inicio}
        onChange={(v) =>
          cambiar("fecha_inicio", v)
        }
      />

      <Field
        label="Fecha fin"
        type="datetime-local"
        value={form.fecha_fin}
        onChange={(v) =>
          cambiar("fecha_fin", v)
        }
      />

      <NumberField
        label="Horas"
        value={form.horas}
        onChange={(v) =>
          cambiar("horas", v)
        }
      />

      <NumberField
        label="TN dejadas de procesar"
        value={form.tn_dejadas_procesar}
        onChange={(v) =>
          cambiar(
            "tn_dejadas_procesar",
            v
          )
        }
      />

      <Check
        label="Producción afectada"
        checked={
          form.produccion_afectada ?? false
        }
        onChange={(v) =>
          cambiar(
            "produccion_afectada",
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
    </Grid>
  );
}
