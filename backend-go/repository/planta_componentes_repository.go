package repository

import (
    "database/sql"

    "backend/models"
)

func (r *EstructuraPlantaRepository) ListarComponentes(
	equipoID int,
) ([]models.ComponenteEquipo, error) {

	rows, err := r.DB.Query(`
		SELECT
			c.id,
			c.equipo_id,
			c.codigo,
			c.codigo_sap,
			c.tag,
			c.nombre,
			c.tipo_componente,
			c.marca,
			c.modelo,
			c.numero_serie,
			c.descripcion,
			c.activo,
			c.creado_en,
			c.fecha_creacion,
			c.fecha_actualizacion,

			m.componente_id,
			m.placa_motor,
			m.fabricante,
			m.codigo_fabricante,
			m.producto,
			m.rated_voltage,
			m.rated_current,
			m.frequency,
			m.phases,
			m.power_factor,
			m.efficiency,
			m.service_factor,
			m.output,
			m.rated_speed,
			m.number_of_poles,
			m.design,
			m.enclosure,
			m.degree_of_protection,
			m.frame,
			m.mounting,
			m.insulation_class,
			m.duty_cycle,
			m.slip,
			m.rated_torque,
			m.locked_rotor_torque,
			m.breakdown_torque,
			m.starting_method,
			m.l_r_amperes,
			m.lrc,
			m.no_load_current,
			m.locked_rotor_time,
			m.rotation,
			m.moment_of_inertia,
			m.temperature_rise,
			m.ambient_temperature,
			m.altitude,
			m.noise_level,
			m.approximate_weight,
			m.bearing_drive_end,
			m.bearing_non_drive_end,
			m.front_bearing,
			m.rear_bearing,
			m.connection,
			m.standard,
			m.nema_classification,
			m.year_of_manufacture,
			m.creado_en,
			m.actualizado_en

		FROM componentes_equipo c

		LEFT JOIN componente_motor_electrico m
			ON m.componente_id = c.id

		WHERE c.equipo_id = $1
		  AND c.activo = TRUE

		ORDER BY c.nombre
	`, equipoID)

	if err != nil {
		return nil, err
	}

	defer rows.Close()

	var resultado []models.ComponenteEquipo

	for rows.Next() {
		var c models.ComponenteEquipo
		var motor models.ComponenteMotorElectrico

		err := rows.Scan(
			&c.ID,
			&c.EquipoID,
			&c.Codigo,
			&c.CodigoSAP,
			&c.Tag,
			&c.Nombre,
			&c.TipoComponente,
			&c.Marca,
			&c.Modelo,
			&c.NumeroSerie,
			&c.Descripcion,
			&c.Activo,
			&c.CreadoEn,
			&c.FechaCreacion,
			&c.FechaActualizacion,

			&motor.ComponenteID,
			&motor.PlacaMotor,
			&motor.Fabricante,
			&motor.CodigoFabricante,
			&motor.Producto,
			&motor.RatedVoltage,
			&motor.RatedCurrent,
			&motor.Frequency,
			&motor.Phases,
			&motor.PowerFactor,
			&motor.Efficiency,
			&motor.ServiceFactor,
			&motor.Output,
			&motor.RatedSpeed,
			&motor.NumberOfPoles,
			&motor.Design,
			&motor.Enclosure,
			&motor.DegreeOfProtection,
			&motor.Frame,
			&motor.Mounting,
			&motor.InsulationClass,
			&motor.DutyCycle,
			&motor.Slip,
			&motor.RatedTorque,
			&motor.LockedRotorTorque,
			&motor.BreakdownTorque,
			&motor.StartingMethod,
			&motor.LRAmpers,
			&motor.LRC,
			&motor.NoLoadCurrent,
			&motor.LockedRotorTime,
			&motor.Rotation,
			&motor.MomentOfInertia,
			&motor.TemperatureRise,
			&motor.AmbientTemperature,
			&motor.Altitude,
			&motor.NoiseLevel,
			&motor.ApproximateWeight,
			&motor.BearingDriveEnd,
			&motor.BearingNonDriveEnd,
			&motor.FrontBearing,
			&motor.RearBearing,
			&motor.Connection,
			&motor.Standard,
			&motor.NemaClassification,
			&motor.YearOfManufacture,
			&motor.CreadoEn,
			&motor.ActualizadoEn,
		)

		if err != nil {
			return nil, err
		}

		if motor.ComponenteID != 0 {
			c.MotorElectrico = &motor
		}

		resultado = append(resultado, c)
	}

	return resultado, rows.Err()
}

func (r *EstructuraPlantaRepository) ListarTodosComponentes(
) ([]models.ComponenteEquipo, error) {

	rows, err := r.DB.Query(`
		SELECT
			c.id,
			c.equipo_id,
			c.codigo,
			c.codigo_sap,
			c.tag,
			c.nombre,
			c.tipo_componente,
			c.marca,
			c.modelo,
			c.numero_serie,
			c.descripcion,
			c.activo,
			c.creado_en,
			c.fecha_creacion,
			c.fecha_actualizacion,

			m.componente_id,
			m.placa_motor,
			m.fabricante,
			m.codigo_fabricante,
			m.producto,
			m.rated_voltage,
			m.rated_current,
			m.frequency,
			m.phases,
			m.power_factor,
			m.efficiency,
			m.service_factor,
			m.output,
			m.rated_speed,
			m.number_of_poles,
			m.design,
			m.enclosure,
			m.degree_of_protection,
			m.frame,
			m.mounting,
			m.insulation_class,
			m.duty_cycle,
			m.slip,
			m.rated_torque,
			m.locked_rotor_torque,
			m.breakdown_torque,
			m.starting_method,
			m.l_r_amperes,
			m.lrc,
			m.no_load_current,
			m.locked_rotor_time,
			m.rotation,
			m.moment_of_inertia,
			m.temperature_rise,
			m.ambient_temperature,
			m.altitude,
			m.noise_level,
			m.approximate_weight,
			m.bearing_drive_end,
			m.bearing_non_drive_end,
			m.front_bearing,
			m.rear_bearing,
			m.connection,
			m.standard,
			m.nema_classification,
			m.year_of_manufacture,
			m.creado_en,
			m.actualizado_en

		FROM componentes_equipo c

		LEFT JOIN componente_motor_electrico m
			ON m.componente_id = c.id

		WHERE c.activo = TRUE

		ORDER BY c.nombre
	`)

	if err != nil {
		return nil, err
	}

	defer rows.Close()

	var resultado []models.ComponenteEquipo

	for rows.Next() {
		var c models.ComponenteEquipo
		var motor models.ComponenteMotorElectrico

		err := rows.Scan(
			&c.ID,
			&c.EquipoID,
			&c.Codigo,
			&c.CodigoSAP,
			&c.Tag,
			&c.Nombre,
			&c.TipoComponente,
			&c.Marca,
			&c.Modelo,
			&c.NumeroSerie,
			&c.Descripcion,
			&c.Activo,
			&c.CreadoEn,
			&c.FechaCreacion,
			&c.FechaActualizacion,

			&motor.ComponenteID,
			&motor.PlacaMotor,
			&motor.Fabricante,
			&motor.CodigoFabricante,
			&motor.Producto,
			&motor.RatedVoltage,
			&motor.RatedCurrent,
			&motor.Frequency,
			&motor.Phases,
			&motor.PowerFactor,
			&motor.Efficiency,
			&motor.ServiceFactor,
			&motor.Output,
			&motor.RatedSpeed,
			&motor.NumberOfPoles,
			&motor.Design,
			&motor.Enclosure,
			&motor.DegreeOfProtection,
			&motor.Frame,
			&motor.Mounting,
			&motor.InsulationClass,
			&motor.DutyCycle,
			&motor.Slip,
			&motor.RatedTorque,
			&motor.LockedRotorTorque,
			&motor.BreakdownTorque,
			&motor.StartingMethod,
			&motor.LRAmpers,
			&motor.LRC,
			&motor.NoLoadCurrent,
			&motor.LockedRotorTime,
			&motor.Rotation,
			&motor.MomentOfInertia,
			&motor.TemperatureRise,
			&motor.AmbientTemperature,
			&motor.Altitude,
			&motor.NoiseLevel,
			&motor.ApproximateWeight,
			&motor.BearingDriveEnd,
			&motor.BearingNonDriveEnd,
			&motor.FrontBearing,
			&motor.RearBearing,
			&motor.Connection,
			&motor.Standard,
			&motor.NemaClassification,
			&motor.YearOfManufacture,
			&motor.CreadoEn,
			&motor.ActualizadoEn,
		)

		if err != nil {
			return nil, err
		}

		if motor.ComponenteID != 0 {
			c.MotorElectrico = &motor
		}

		resultado = append(resultado, c)
	}

	if err := rows.Err(); err != nil {
		return nil, err
	}

	return resultado, nil
}

func (r *EstructuraPlantaRepository) CrearComponente(
	c *models.ComponenteEquipo,
) error {

	tx, err := r.DB.Begin()
	if err != nil {
		return err
	}

	defer func() {
		if err != nil {
			_ = tx.Rollback()
		}
	}()

	err = tx.QueryRow(`
		INSERT INTO componentes_equipo (
			equipo_id,
			codigo,
			codigo_sap,
			tag,
			nombre,
			tipo_componente,
			marca,
			modelo,
			numero_serie,
			descripcion,
			activo
		)
		VALUES (
			$1, $2, $3, $4, $5,
			$6, $7, $8, $9, $10,
			TRUE
		)
		RETURNING id, creado_en, fecha_creacion
	`,
		c.EquipoID,
		c.Codigo,
		c.CodigoSAP,
		c.Tag,
		c.Nombre,
		c.TipoComponente,
		c.Marca,
		c.Modelo,
		c.NumeroSerie,
		c.Descripcion,
	).Scan(
		&c.ID,
		&c.CreadoEn,
		&c.FechaCreacion,
	)

	if err != nil {
		return err
	}

	c.Activo = true

	if c.TipoComponente != nil &&
		*c.TipoComponente == "MOTOR ELECTRICO" &&
		c.MotorElectrico != nil {

		err = insertarMotorElectrico(
			tx,
			c.ID,
			c.MotorElectrico,
		)

		if err != nil {
			return err
		}

		c.MotorElectrico.ComponenteID = c.ID
	}

	err = tx.Commit()
	if err != nil {
		return err
	}

	return nil
}

func insertarMotorElectrico(
    tx *sql.Tx,
	componenteID int,
	m *models.ComponenteMotorElectrico,
) error {

	_, err := tx.Exec(`
		INSERT INTO componente_motor_electrico (
			componente_id,
			placa_motor,
			fabricante,
			codigo_fabricante,
			producto,
			rated_voltage,
			rated_current,
			frequency,
			phases,
			power_factor,
			efficiency,
			service_factor,
			output,
			rated_speed,
			number_of_poles,
			design,
			enclosure,
			degree_of_protection,
			frame,
			mounting,
			insulation_class,
			duty_cycle,
			slip,
			rated_torque,
			locked_rotor_torque,
			breakdown_torque,
			starting_method,
			l_r_amperes,
			lrc,
			no_load_current,
			locked_rotor_time,
			rotation,
			moment_of_inertia,
			temperature_rise,
			ambient_temperature,
			altitude,
			noise_level,
			approximate_weight,
			bearing_drive_end,
			bearing_non_drive_end,
			front_bearing,
			rear_bearing,
			connection,
			standard,
			nema_classification,
			year_of_manufacture
		)
		VALUES (
			$1, $2, $3, $4, $5,
			$6, $7, $8, $9, $10,
			$11, $12, $13, $14, $15,
			$16, $17, $18, $19, $20,
			$21, $22, $23, $24, $25,
			$26, $27, $28, $29, $30,
			$31, $32, $33, $34, $35,
			$36, $37, $38, $39, $40,
			$41, $42, $43, $44, $45,
			$46
		)
	`,
		componenteID,
		m.PlacaMotor,
		m.Fabricante,
		m.CodigoFabricante,
		m.Producto,
		m.RatedVoltage,
		m.RatedCurrent,
		m.Frequency,
		m.Phases,
		m.PowerFactor,
		m.Efficiency,
		m.ServiceFactor,
		m.Output,
		m.RatedSpeed,
		m.NumberOfPoles,
		m.Design,
		m.Enclosure,
		m.DegreeOfProtection,
		m.Frame,
		m.Mounting,
		m.InsulationClass,
		m.DutyCycle,
		m.Slip,
		m.RatedTorque,
		m.LockedRotorTorque,
		m.BreakdownTorque,
		m.StartingMethod,
		m.LRAmpers,
		m.LRC,
		m.NoLoadCurrent,
		m.LockedRotorTime,
		m.Rotation,
		m.MomentOfInertia,
		m.TemperatureRise,
		m.AmbientTemperature,
		m.Altitude,
		m.NoiseLevel,
		m.ApproximateWeight,
		m.BearingDriveEnd,
		m.BearingNonDriveEnd,
		m.FrontBearing,
		m.RearBearing,
		m.Connection,
		m.Standard,
		m.NemaClassification,
		m.YearOfManufacture,
	)

	return err
}

func (r *EstructuraPlantaRepository) ActualizarComponente(
	id int,
	c models.ComponenteEquipo,
) error {

	tx, err := r.DB.Begin()
	if err != nil {
		return err
	}

	defer func() {
		if err != nil {
			_ = tx.Rollback()
		}
	}()

	_, err = tx.Exec(`
		UPDATE componentes_equipo
		SET codigo = $1,
			codigo_sap = $2,
			tag = $3,
			nombre = $4,
			tipo_componente = $5,
			marca = $6,
			modelo = $7,
			numero_serie = $8,
			descripcion = $9,
			activo = $10,
			actualizado_en = NOW()
		WHERE id = $11
	`,
		c.Codigo,
		c.CodigoSAP,
		c.Tag,
		c.Nombre,
		c.TipoComponente,
		c.Marca,
		c.Modelo,
		c.NumeroSerie,
		c.Descripcion,
		c.Activo,
		id,
	)

	if err != nil {
		return err
	}

	if c.TipoComponente != nil &&
		*c.TipoComponente == "MOTOR ELECTRICO" &&
		c.MotorElectrico != nil {

		_, err = tx.Exec(`
			INSERT INTO componente_motor_electrico (
				componente_id
			)
			VALUES ($1)
			ON CONFLICT (componente_id)
			DO NOTHING
		`, id)

		if err != nil {
			return err
		}

		_, err = tx.Exec(`
			UPDATE componente_motor_electrico
			SET placa_motor = $1,
				fabricante = $2,
				codigo_fabricante = $3,
				producto = $4,
				rated_voltage = $5,
				rated_current = $6,
				frequency = $7,
				phases = $8,
				power_factor = $9,
				efficiency = $10,
				service_factor = $11,
				output = $12,
				rated_speed = $13,
				number_of_poles = $14,
				design = $15,
				enclosure = $16,
				degree_of_protection = $17,
				frame = $18,
				mounting = $19,
				insulation_class = $20,
				duty_cycle = $21,
				slip = $22,
				rated_torque = $23,
				locked_rotor_torque = $24,
				breakdown_torque = $25,
				starting_method = $26,
				l_r_amperes = $27,
				lrc = $28,
				no_load_current = $29,
				locked_rotor_time = $30,
				rotation = $31,
				moment_of_inertia = $32,
				temperature_rise = $33,
				ambient_temperature = $34,
				altitude = $35,
				noise_level = $36,
				approximate_weight = $37,
				bearing_drive_end = $38,
				bearing_non_drive_end = $39,
				front_bearing = $40,
				rear_bearing = $41,
				connection = $42,
				standard = $43,
				nema_classification = $44,
				year_of_manufacture = $45,
				actualizado_en = NOW()
			WHERE componente_id = $46
		`,
			c.MotorElectrico.PlacaMotor,
			c.MotorElectrico.Fabricante,
			c.MotorElectrico.CodigoFabricante,
			c.MotorElectrico.Producto,
			c.MotorElectrico.RatedVoltage,
			c.MotorElectrico.RatedCurrent,
			c.MotorElectrico.Frequency,
			c.MotorElectrico.Phases,
			c.MotorElectrico.PowerFactor,
			c.MotorElectrico.Efficiency,
			c.MotorElectrico.ServiceFactor,
			c.MotorElectrico.Output,
			c.MotorElectrico.RatedSpeed,
			c.MotorElectrico.NumberOfPoles,
			c.MotorElectrico.Design,
			c.MotorElectrico.Enclosure,
			c.MotorElectrico.DegreeOfProtection,
			c.MotorElectrico.Frame,
			c.MotorElectrico.Mounting,
			c.MotorElectrico.InsulationClass,
			c.MotorElectrico.DutyCycle,
			c.MotorElectrico.Slip,
			c.MotorElectrico.RatedTorque,
			c.MotorElectrico.LockedRotorTorque,
			c.MotorElectrico.BreakdownTorque,
			c.MotorElectrico.StartingMethod,
			c.MotorElectrico.LRAmpers,
			c.MotorElectrico.LRC,
			c.MotorElectrico.NoLoadCurrent,
			c.MotorElectrico.LockedRotorTime,
			c.MotorElectrico.Rotation,
			c.MotorElectrico.MomentOfInertia,
			c.MotorElectrico.TemperatureRise,
			c.MotorElectrico.AmbientTemperature,
			c.MotorElectrico.Altitude,
			c.MotorElectrico.NoiseLevel,
			c.MotorElectrico.ApproximateWeight,
			c.MotorElectrico.BearingDriveEnd,
			c.MotorElectrico.BearingNonDriveEnd,
			c.MotorElectrico.FrontBearing,
			c.MotorElectrico.RearBearing,
			c.MotorElectrico.Connection,
			c.MotorElectrico.Standard,
			c.MotorElectrico.NemaClassification,
			c.MotorElectrico.YearOfManufacture,
			id,
		)

		if err != nil {
			return err
		}
	}

	err = tx.Commit()
	if err != nil {
		return err
	}

	return nil
}