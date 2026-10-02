package repository

import (
	"database/sql"

	"backend/models"
)

type EstructuraPlantaRepository struct {
	DB *sql.DB
}

func NewEstructuraPlantaRepository(db *sql.DB) *EstructuraPlantaRepository {
	return &EstructuraPlantaRepository{DB: db}
}

func (r *EstructuraPlantaRepository) ListarMasterGeneral() ([]models.MaestroGeneralItem, error) {
	rows, err := r.DB.Query(`
		SELECT
			e.fase,

			p.id,
			p.nombre,

			sp.id,
			sp.nombre,

			e.id,
			e.codigo,
			e.nombre,

			c.id,
			c.codigo,
			c.tag,
			c.nombre

		FROM procesos_planta p

		INNER JOIN subprocesos_planta sp
			ON sp.proceso_id = p.id
			AND sp.activo = TRUE

		INNER JOIN planta_equipos pe
			ON pe.subproceso_id = sp.id

		INNER JOIN equipos e
			ON e.id = pe.equipo_id

		LEFT JOIN componentes_equipo c
			ON c.equipo_id = e.id
			AND c.activo = TRUE

		WHERE p.activo = TRUE

		ORDER BY
			p.nombre,
			sp.nombre,
			e.codigo,
			c.nombre
	`)

	if err != nil {
		return nil, err
	}
	defer rows.Close()

	resultado := make([]models.MaestroGeneralItem, 0)

	for rows.Next() {
		var item models.MaestroGeneralItem

		err := rows.Scan(
			&item.Fase,

			&item.ProcesoID,
			&item.Proceso,

			&item.SubprocesoID,
			&item.Subproceso,

			&item.EquipoID,
			&item.EquipoCodigo,
			&item.EquipoNombre,

			&item.ComponenteID,
			&item.ComponenteCodigo,
			&item.ComponenteTag,
			&item.ComponenteNombre,
		)

		if err != nil {
			return nil, err
		}

		// Repuestos todavía no están relacionados en la estructura
		// del Maestro General.
		item.RepuestoID = nil
		item.RepuestoNombre = nil

		resultado = append(resultado, item)
	}

	if err := rows.Err(); err != nil {
		return nil, err
	}

	return resultado, nil
}

func (r *EstructuraPlantaRepository) ListarMaestrosMotoresElectricos() ([]models.MaestroMotorElectrico, error) {
	rows, err := r.DB.Query(`
		SELECT
			c.id,
			c.codigo,
			c.codigo_sap,
			c.tipo_componente,
			c.nombre,
			c.tag,
			m.placa_motor,
			c.fecha_actualizacion,

			CONCAT(e.nombre, ' - ', sp.nombre),

			c.marca,
			c.modelo,
			c.numero_serie,

			-- Potencia
			m.output,
			NULL::double precision,

			-- Datos eléctricos
			m.rated_voltage,
			m.rated_current,
			m.rated_speed,

			-- Datos técnicos
			m.frame,
			m.service_factor,
			m.power_factor,
			m.insulation_class,
			m.duty_cycle,
			m.efficiency,

			-- Arranque
			m.starting_method,

			-- Rodamientos
			m.bearing_drive_end,
			m.bearing_non_drive_end

		FROM componentes_equipo c

		INNER JOIN componente_motor_electrico m
			ON m.componente_id = c.id

		INNER JOIN equipos e
			ON e.id = c.equipo_id

		LEFT JOIN planta_equipos pe
			ON pe.equipo_id = e.id

		LEFT JOIN subprocesos_planta sp
			ON sp.id = pe.subproceso_id
			AND sp.activo = TRUE

		WHERE c.activo = TRUE
			AND c.tipo_componente = 'MOTOR ELECTRICO'

		ORDER BY
			e.nombre,
			sp.nombre,
			c.nombre
	`)

	if err != nil {
		return nil, err
	}

	defer rows.Close()

	resultado := make([]models.MaestroMotorElectrico, 0)

	for rows.Next() {
		var item models.MaestroMotorElectrico

		err := rows.Scan(
			&item.ComponenteID,

			// Identificación
			&item.CodigoInterno,
			&item.CodigoSAP,
			&item.TipoComponente,
			&item.NombreComponente,
			&item.Tag,
			&item.PlacaMotor,
			&item.FechaActualizacion,

			// Zona
			&item.Zona,

			// Datos generales
			&item.Marca,
			&item.Modelo,
			&item.NumeroSerie,

			// Potencia
			&item.KW,
			&item.HP,

			// Datos eléctricos
			&item.Volt,
			&item.Amp,
			&item.RPM,

			// Datos técnicos
			&item.Frame,
			&item.FS,
			&item.FP,
			&item.Clase,
			&item.Duty,
			&item.Eff,

			// Arranque
			&item.TipoArranque,

			// Rodamientos
			&item.RodamientoDE,
			&item.RodamientoNDE,
		)

		if err != nil {
			return nil, err
		}

		resultado = append(resultado, item)
	}

	if err := rows.Err(); err != nil {
		return nil, err
	}

	return resultado, nil
}