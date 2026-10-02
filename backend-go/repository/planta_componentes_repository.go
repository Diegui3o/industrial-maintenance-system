package repository

import (
    "database/sql"
    "fmt"

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
			output,
			horsepower,
			rated_speed,
			number_of_poles,
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
		var motorID sql.NullInt64

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

			&motorID,
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
			&motor.Horsepower,
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

		if motorID.Valid {
			motor.ComponenteID = int(motorID.Int64)
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
			output,
			horsepower,
			rated_speed,
			number_of_poles,
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
		var motorID sql.NullInt64

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

			&motorID,
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
			&motor.Horsepower,
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

		if motorID.Valid {
			motor.ComponenteID = int(motorID.Int64)
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
			activo,
			fecha_creacion,
			fecha_actualizacion
		)
		VALUES (
			$1, $2, $3, $4, $5,
			$6, $7, $8, $9, $10,
			TRUE,
			NOW(),
			NOW()
		)
		RETURNING
			id,
			creado_en,
			fecha_creacion,
			fecha_actualizacion
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
		&c.FechaActualizacion,
	)

	if err != nil {
		return err
	}

	c.Activo = true

	// --------------------------------------------------------
	// MOTOR ELÉCTRICO
	// --------------------------------------------------------

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

	// --------------------------------------------------------
	// AUDITORÍA - CREACIÓN
	// --------------------------------------------------------

	detalle := fmt.Sprintf(
		"Componente creado. ID=%d, nombre=%q, tipo=%q, marca=%q, modelo=%q, numero_serie=%q",
		c.ID,
		c.Nombre,
		pointerString(c.TipoComponente),
		pointerString(c.Marca),
		pointerString(c.Modelo),
		pointerString(c.NumeroSerie),
	)

	_, err = tx.Exec(`
		INSERT INTO auditoria (
			usuario_id,
			tabla,
			accion,
			detalle
		)
		VALUES (
			NULL,
			'componentes_equipo',
			'CREACION',
			$1
		)
	`, detalle)

	if err != nil {
		return fmt.Errorf("error registrando auditoría de creación: %w", err)
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
			horsepower,
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
		m.Horsepower,
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

	// ============================================================
	// 1. Leer información actual del componente
	// ============================================================

	var actual models.ComponenteEquipo

	err = tx.QueryRow(`
		SELECT
			id,
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
			activo,
			creado_en,
			fecha_creacion,
			fecha_actualizacion
		FROM componentes_equipo
		WHERE id = $1
	`, id).Scan(
		&actual.ID,
		&actual.EquipoID,
		&actual.Codigo,
		&actual.CodigoSAP,
		&actual.Tag,
		&actual.Nombre,
		&actual.TipoComponente,
		&actual.Marca,
		&actual.Modelo,
		&actual.NumeroSerie,
		&actual.Descripcion,
		&actual.Activo,
		&actual.CreadoEn,
		&actual.FechaCreacion,
		&actual.FechaActualizacion,
	)

	if err != nil {
		return fmt.Errorf("error leyendo componente actual: %w", err)
	}

	// ============================================================
	// 2. Comparar información principal
	// ============================================================

	var cambios []string

	if !equalIntPtr(actual.EquipoID, c.EquipoID) {
		cambios = append(cambios,
			fmt.Sprintf(
				"equipo_id: %s → %s",
				pointerIntString(actual.EquipoID),
				pointerIntString(c.EquipoID),
			),
		)
	}

	if !equalStringPtr(actual.Codigo, c.Codigo) {
		cambios = append(cambios,
			fmt.Sprintf(
				"codigo: %q → %q",
				pointerString(actual.Codigo),
				pointerString(c.Codigo),
			),
		)
	}

	if !equalStringPtr(actual.CodigoSAP, c.CodigoSAP) {
		cambios = append(cambios,
			fmt.Sprintf(
				"codigo_sap: %q → %q",
				pointerString(actual.CodigoSAP),
				pointerString(c.CodigoSAP),
			),
		)
	}

	if !equalStringPtr(actual.Tag, c.Tag) {
		cambios = append(cambios,
			fmt.Sprintf(
				"tag: %q → %q",
				pointerString(actual.Tag),
				pointerString(c.Tag),
			),
		)
	}

	if actual.Nombre != c.Nombre {
		cambios = append(cambios,
			fmt.Sprintf(
				"nombre: %q → %q",
				actual.Nombre,
				c.Nombre,
			),
		)
	}

	if !equalStringPtr(actual.TipoComponente, c.TipoComponente) {
		cambios = append(cambios,
			fmt.Sprintf(
				"tipo_componente: %q → %q",
				pointerString(actual.TipoComponente),
				pointerString(c.TipoComponente),
			),
		)
	}

	if !equalStringPtr(actual.Marca, c.Marca) {
		cambios = append(cambios,
			fmt.Sprintf(
				"marca: %q → %q",
				pointerString(actual.Marca),
				pointerString(c.Marca),
			),
		)
	}

	if !equalStringPtr(actual.Modelo, c.Modelo) {
		cambios = append(cambios,
			fmt.Sprintf(
				"modelo: %q → %q",
				pointerString(actual.Modelo),
				pointerString(c.Modelo),
			),
		)
	}

	if !equalStringPtr(actual.NumeroSerie, c.NumeroSerie) {
		cambios = append(cambios,
			fmt.Sprintf(
				"numero_serie: %q → %q",
				pointerString(actual.NumeroSerie),
				pointerString(c.NumeroSerie),
			),
		)
	}

	if !equalStringPtr(actual.Descripcion, c.Descripcion) {
		cambios = append(cambios,
			fmt.Sprintf(
				"descripcion: %q → %q",
				pointerString(actual.Descripcion),
				pointerString(c.Descripcion),
			),
		)
	}

	if actual.Activo != c.Activo {
		cambios = append(cambios,
			fmt.Sprintf(
				"activo: %t → %t",
				actual.Activo,
				c.Activo,
			),
		)
	}

	// ============================================================
	// 3. Leer información actual del motor, si existe
	// ============================================================

	var motorActual *models.ComponenteMotorElectrico

	if actual.TipoComponente != nil &&
		*actual.TipoComponente == "MOTOR ELECTRICO" {

		var m models.ComponenteMotorElectrico

		errMotor := tx.QueryRow(`
			SELECT
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
				horsepower,
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
				year_of_manufacture,
				creado_en,
				actualizado_en
			FROM componente_motor_electrico
			WHERE componente_id = $1
		`, id).Scan(
			&m.ComponenteID,
			&m.PlacaMotor,
			&m.Fabricante,
			&m.CodigoFabricante,
			&m.Producto,
			&m.RatedVoltage,
			&m.RatedCurrent,
			&m.Frequency,
			&m.Phases,
			&m.PowerFactor,
			&m.Efficiency,
			&m.ServiceFactor,
			&m.Output,
			&m.Horsepower,
			&m.RatedSpeed,
			&m.NumberOfPoles,
			&m.Design,
			&m.Enclosure,
			&m.DegreeOfProtection,
			&m.Frame,
			&m.Mounting,
			&m.InsulationClass,
			&m.DutyCycle,
			&m.Slip,
			&m.RatedTorque,
			&m.LockedRotorTorque,
			&m.BreakdownTorque,
			&m.StartingMethod,
			&m.LRAmpers,
			&m.LRC,
			&m.NoLoadCurrent,
			&m.LockedRotorTime,
			&m.Rotation,
			&m.MomentOfInertia,
			&m.TemperatureRise,
			&m.AmbientTemperature,
			&m.Altitude,
			&m.NoiseLevel,
			&m.ApproximateWeight,
			&m.BearingDriveEnd,
			&m.BearingNonDriveEnd,
			&m.FrontBearing,
			&m.RearBearing,
			&m.Connection,
			&m.Standard,
			&m.NemaClassification,
			&m.YearOfManufacture,
			&m.CreadoEn,
			&m.ActualizadoEn,
		)

		if errMotor == nil {
			motorActual = &m
		} else if errMotor != sql.ErrNoRows {
			return fmt.Errorf("error leyendo datos del motor: %w", errMotor)
		}
	}

	// ============================================================
	// 4. Actualizar componente principal
	// ============================================================

	_, err = tx.Exec(`
		UPDATE componentes_equipo
		SET
			equipo_id = $1,
			codigo = $2,
			codigo_sap = $3,
			tag = $4,
			nombre = $5,
			tipo_componente = $6,
			marca = $7,
			modelo = $8,
			numero_serie = $9,
			descripcion = $10,
			activo = $11,
			actualizado_en = NOW()
		WHERE id = $12
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
		c.Activo,
		id,
	)

	if err != nil {
		return fmt.Errorf("error actualizando componente: %w", err)
	}

	// ============================================================
	// 5. Procesar motor eléctrico
	// ============================================================

	if c.TipoComponente != nil &&
		*c.TipoComponente == "MOTOR ELECTRICO" &&
		c.MotorElectrico != nil {

		// Si no existe todavía, crearlo.
		if motorActual == nil {

			err = insertarMotorElectrico(
				tx,
				id,
				c.MotorElectrico,
			)

			if err != nil {
				return fmt.Errorf(
					"error insertando datos del motor: %w",
					err,
				)
			}

			c.MotorElectrico.ComponenteID = id

		} else {

			// ====================================================
			// Comparar campos técnicos
			// ====================================================

			cambiosMotor := compararMotorElectrico(
				motorActual,
				c.MotorElectrico,
			)

			// ====================================================
			// Actualizar motor
			// ====================================================

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
					horsepower = $13,
					rated_speed = $14,
					number_of_poles = $15,
					design = $16,
					enclosure = $17,
					degree_of_protection = $18,
					frame = $19,
					mounting = $20,
					insulation_class = $21,
					duty_cycle = $22,
					slip = $23,
					rated_torque = $24,
					locked_rotor_torque = $25,
					breakdown_torque = $26,
					starting_method = $27,
					l_r_amperes = $28,
					lrc = $29,
					no_load_current = $30,
					locked_rotor_time = $31,
					rotation = $32,
					moment_of_inertia = $33,
					temperature_rise = $34,
					ambient_temperature = $35,
					altitude = $36,
					noise_level = $37,
					approximate_weight = $38,
					bearing_drive_end = $39,
					bearing_non_drive_end = $40,
					front_bearing = $41,
					rear_bearing = $42,
					connection = $43,
					standard = $44,
					nema_classification = $45,
					year_of_manufacture = $46,
					actualizado_en = NOW()
				WHERE componente_id = $47
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
				c.MotorElectrico.Horsepower,
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
				return fmt.Errorf(
					"error actualizando datos del motor: %w",
					err,
				)
			}

			// ====================================================
			// Auditoría técnica del motor
			// ====================================================

			if len(cambiosMotor) > 0 {

				detalleMotor := fmt.Sprintf(
					"Componente ID=%d. Cambios técnicos: %s",
					id,
					joinCambios(cambiosMotor),
				)

				_, err = tx.Exec(`
					INSERT INTO auditoria (
						usuario_id,
						tabla,
						accion,
						detalle
					)
					VALUES (
						NULL,
						'componente_motor_electrico',
						'ACTUALIZACION_TECNICA',
						$1
					)
				`, detalleMotor)

				if err != nil {
					return fmt.Errorf(
						"error registrando auditoría técnica: %w",
						err,
					)
				}

				// El cambio técnico del motor también modifica
				// la fecha de actualización del componente padre.
				_, err = tx.Exec(`
					UPDATE componentes_equipo
					SET fecha_actualizacion = NOW()
					WHERE id = $1
				`, id)

				if err != nil {
					return fmt.Errorf(
						"error actualizando fecha del componente: %w",
						err,
					)
				}
			}
		}
	}

	// ============================================================
	// 6. Auditoría del componente principal
	// ============================================================

	if len(cambios) > 0 {

		detalle := fmt.Sprintf(
			"Componente ID=%d. Cambios: %s",
			id,
			joinCambios(cambios),
		)

		accion := "ACTUALIZACION"

		// Si únicamente cambió activo, lo clasificamos como
		// cambio de estado.
		if len(cambios) == 1 &&
			actual.Activo != c.Activo {

			accion = "CAMBIO_ESTADO"
		}

		_, err = tx.Exec(`
			INSERT INTO auditoria (
				usuario_id,
				tabla,
				accion,
				detalle
			)
			VALUES (
				NULL,
				'componentes_equipo',
				$1,
				$2
			)
		`,
			accion,
			detalle,
		)

		if err != nil {
			return fmt.Errorf(
				"error registrando auditoría del componente: %w",
				err,
			)
		}

		// Asegurar que la fecha de actualización represente
		// el cambio real detectado.
		_, err = tx.Exec(`
			UPDATE componentes_equipo
			SET fecha_actualizacion = NOW()
			WHERE id = $1
		`, id)

		if err != nil {
			return fmt.Errorf(
				"error actualizando fecha de actualización: %w",
				err,
			)
		}
	}

	// ============================================================
	// 7. Confirmar todo
	// ============================================================

	err = tx.Commit()
	if err != nil {
		return err
	}

	return nil
}

func pointerString(v *string) string {
	if v == nil {
		return ""
	}

	return *v
}

func equalStringPtr(a, b *string) bool {
	if a == nil && b == nil {
		return true
	}

	if a == nil || b == nil {
		return false
	}

	return *a == *b
}

func equalIntPtr(a, b *int) bool {
	if a == nil && b == nil {
		return true
	}

	if a == nil || b == nil {
		return false
	}

	return *a == *b
}

func pointerIntString(v *int) string {
	if v == nil {
		return ""
	}

	return fmt.Sprintf("%d", *v)
}

func joinCambios(cambios []string) string {
	resultado := ""

	for i, cambio := range cambios {
		if i > 0 {
			resultado += "; "
		}

		resultado += cambio
	}

	return resultado
}
func compararMotorElectrico(
	actual *models.ComponenteMotorElectrico,
	nuevo *models.ComponenteMotorElectrico,
) []string {

	var cambios []string

	if !equalStringPtr(actual.PlacaMotor, nuevo.PlacaMotor) {
		cambios = append(cambios, fmt.Sprintf(
			"placa_motor: %q → %q",
			pointerString(actual.PlacaMotor),
			pointerString(nuevo.PlacaMotor),
		))
	}

	if !equalStringPtr(actual.Fabricante, nuevo.Fabricante) {
		cambios = append(cambios, fmt.Sprintf(
			"fabricante: %q → %q",
			pointerString(actual.Fabricante),
			pointerString(nuevo.Fabricante),
		))
	}

	if !equalStringPtr(actual.CodigoFabricante, nuevo.CodigoFabricante) {
		cambios = append(cambios, fmt.Sprintf(
			"codigo_fabricante: %q → %q",
			pointerString(actual.CodigoFabricante),
			pointerString(nuevo.CodigoFabricante),
		))
	}

	if !equalStringPtr(actual.Producto, nuevo.Producto) {
		cambios = append(cambios, fmt.Sprintf(
			"producto: %q → %q",
			pointerString(actual.Producto),
			pointerString(nuevo.Producto),
		))
	}

	if !equalStringPtr(actual.RatedVoltage, nuevo.RatedVoltage) {
		cambios = append(cambios, fmt.Sprintf(
			"rated_voltage: %q → %q",
			pointerString(actual.RatedVoltage),
			pointerString(nuevo.RatedVoltage),
		))
	}

	if !equalStringPtr(actual.RatedCurrent, nuevo.RatedCurrent) {
		cambios = append(cambios, fmt.Sprintf(
			"rated_current: %q → %q",
			pointerString(actual.RatedCurrent),
			pointerString(nuevo.RatedCurrent),
		))
	}

	if !equalNumericPtr(actual.Frequency, nuevo.Frequency) {
		cambios = append(cambios, fmt.Sprintf(
			"frequency: %s → %s",
			pointerNumericString(actual.Frequency),
			pointerNumericString(nuevo.Frequency),
		))
	}

	if !equalIntPtr(actual.Phases, nuevo.Phases) {
		cambios = append(cambios, fmt.Sprintf(
			"phases: %s → %s",
			pointerIntString(actual.Phases),
			pointerIntString(nuevo.Phases),
		))
	}

	if !equalNumericPtr(actual.PowerFactor, nuevo.PowerFactor) {
		cambios = append(cambios, fmt.Sprintf(
			"power_factor: %s → %s",
			pointerNumericString(actual.PowerFactor),
			pointerNumericString(nuevo.PowerFactor),
		))
	}

	if !equalNumericPtr(actual.Efficiency, nuevo.Efficiency) {
		cambios = append(cambios, fmt.Sprintf(
			"efficiency: %s → %s",
			pointerNumericString(actual.Efficiency),
			pointerNumericString(nuevo.Efficiency),
		))
	}

	if !equalNumericPtr(actual.ServiceFactor, nuevo.ServiceFactor) {
		cambios = append(cambios, fmt.Sprintf(
			"service_factor: %s → %s",
			pointerNumericString(actual.ServiceFactor),
			pointerNumericString(nuevo.ServiceFactor),
		))
	}

	if !equalNumericPtr(actual.Output, nuevo.Output) {
		cambios = append(cambios, fmt.Sprintf(
			"output: %s → %s",
			pointerNumericString(actual.Output),
			pointerNumericString(nuevo.Output),
		))
	}

	if !equalNumericPtr(actual.RatedSpeed, nuevo.RatedSpeed) {
		cambios = append(cambios, fmt.Sprintf(
			"rated_speed: %s → %s",
			pointerNumericString(actual.RatedSpeed),
			pointerNumericString(nuevo.RatedSpeed),
		))
	}

	if !equalIntPtr(actual.NumberOfPoles, nuevo.NumberOfPoles) {
		cambios = append(cambios, fmt.Sprintf(
			"number_of_poles: %s → %s",
			pointerIntString(actual.NumberOfPoles),
			pointerIntString(nuevo.NumberOfPoles),
		))
	}

	if !equalStringPtr(actual.Design, nuevo.Design) {
		cambios = append(cambios, fmt.Sprintf(
			"design: %q → %q",
			pointerString(actual.Design),
			pointerString(nuevo.Design),
		))
	}

	if !equalStringPtr(actual.Enclosure, nuevo.Enclosure) {
		cambios = append(cambios, fmt.Sprintf(
			"enclosure: %q → %q",
			pointerString(actual.Enclosure),
			pointerString(nuevo.Enclosure),
		))
	}

	if !equalStringPtr(actual.DegreeOfProtection, nuevo.DegreeOfProtection) {
		cambios = append(cambios, fmt.Sprintf(
			"degree_of_protection: %q → %q",
			pointerString(actual.DegreeOfProtection),
			pointerString(nuevo.DegreeOfProtection),
		))
	}

	if !equalStringPtr(actual.Frame, nuevo.Frame) {
		cambios = append(cambios, fmt.Sprintf(
			"frame: %q → %q",
			pointerString(actual.Frame),
			pointerString(nuevo.Frame),
		))
	}

	if !equalStringPtr(actual.Mounting, nuevo.Mounting) {
		cambios = append(cambios, fmt.Sprintf(
			"mounting: %q → %q",
			pointerString(actual.Mounting),
			pointerString(nuevo.Mounting),
		))
	}

	if !equalStringPtr(actual.InsulationClass, nuevo.InsulationClass) {
		cambios = append(cambios, fmt.Sprintf(
			"insulation_class: %q → %q",
			pointerString(actual.InsulationClass),
			pointerString(nuevo.InsulationClass),
		))
	}

	if !equalStringPtr(actual.DutyCycle, nuevo.DutyCycle) {
		cambios = append(cambios, fmt.Sprintf(
			"duty_cycle: %q → %q",
			pointerString(actual.DutyCycle),
			pointerString(nuevo.DutyCycle),
		))
	}

	if !equalNumericPtr(actual.Slip, nuevo.Slip) {
		cambios = append(cambios, fmt.Sprintf(
			"slip: %s → %s",
			pointerNumericString(actual.Slip),
			pointerNumericString(nuevo.Slip),
		))
	}

	if !equalNumericPtr(actual.RatedTorque, nuevo.RatedTorque) {
		cambios = append(cambios, fmt.Sprintf(
			"rated_torque: %s → %s",
			pointerNumericString(actual.RatedTorque),
			pointerNumericString(nuevo.RatedTorque),
		))
	}

	if !equalNumericPtr(actual.LockedRotorTorque, nuevo.LockedRotorTorque) {
		cambios = append(cambios, fmt.Sprintf(
			"locked_rotor_torque: %s → %s",
			pointerNumericString(actual.LockedRotorTorque),
			pointerNumericString(nuevo.LockedRotorTorque),
		))
	}

	if !equalNumericPtr(actual.BreakdownTorque, nuevo.BreakdownTorque) {
		cambios = append(cambios, fmt.Sprintf(
			"breakdown_torque: %s → %s",
			pointerNumericString(actual.BreakdownTorque),
			pointerNumericString(nuevo.BreakdownTorque),
		))
	}

	if !equalStringPtr(actual.StartingMethod, nuevo.StartingMethod) {
		cambios = append(cambios, fmt.Sprintf(
			"starting_method: %q → %q",
			pointerString(actual.StartingMethod),
			pointerString(nuevo.StartingMethod),
		))
	}

	if !equalStringPtr(actual.LRAmpers, nuevo.LRAmpers) {
		cambios = append(cambios, fmt.Sprintf(
			"l_r_amperes: %q → %q",
			pointerString(actual.LRAmpers),
			pointerString(nuevo.LRAmpers),
		))
	}

	if !equalStringPtr(actual.LRC, nuevo.LRC) {
		cambios = append(cambios, fmt.Sprintf(
			"lrc: %q → %q",
			pointerString(actual.LRC),
			pointerString(nuevo.LRC),
		))
	}

	if !equalStringPtr(actual.NoLoadCurrent, nuevo.NoLoadCurrent) {
		cambios = append(cambios, fmt.Sprintf(
			"no_load_current: %q → %q",
			pointerString(actual.NoLoadCurrent),
			pointerString(nuevo.NoLoadCurrent),
		))
	}

	if !equalStringPtr(actual.LockedRotorTime, nuevo.LockedRotorTime) {
		cambios = append(cambios, fmt.Sprintf(
			"locked_rotor_time: %q → %q",
			pointerString(actual.LockedRotorTime),
			pointerString(nuevo.LockedRotorTime),
		))
	}

	if !equalStringPtr(actual.Rotation, nuevo.Rotation) {
		cambios = append(cambios, fmt.Sprintf(
			"rotation: %q → %q",
			pointerString(actual.Rotation),
			pointerString(nuevo.Rotation),
		))
	}

	if !equalNumericPtr(actual.MomentOfInertia, nuevo.MomentOfInertia) {
		cambios = append(cambios, fmt.Sprintf(
			"moment_of_inertia: %s → %s",
			pointerNumericString(actual.MomentOfInertia),
			pointerNumericString(nuevo.MomentOfInertia),
		))
	}

	if !equalNumericPtr(actual.TemperatureRise, nuevo.TemperatureRise) {
		cambios = append(cambios, fmt.Sprintf(
			"temperature_rise: %s → %s",
			pointerNumericString(actual.TemperatureRise),
			pointerNumericString(nuevo.TemperatureRise),
		))
	}

	if !equalNumericPtr(actual.AmbientTemperature, nuevo.AmbientTemperature) {
		cambios = append(cambios, fmt.Sprintf(
			"ambient_temperature: %s → %s",
			pointerNumericString(actual.AmbientTemperature),
			pointerNumericString(nuevo.AmbientTemperature),
		))
	}

	if !equalNumericPtr(actual.Altitude, nuevo.Altitude) {
		cambios = append(cambios, fmt.Sprintf(
			"altitude: %s → %s",
			pointerNumericString(actual.Altitude),
			pointerNumericString(nuevo.Altitude),
		))
	}

	if !equalNumericPtr(actual.NoiseLevel, nuevo.NoiseLevel) {
		cambios = append(cambios, fmt.Sprintf(
			"noise_level: %s → %s",
			pointerNumericString(actual.NoiseLevel),
			pointerNumericString(nuevo.NoiseLevel),
		))
	}

	if !equalNumericPtr(actual.ApproximateWeight, nuevo.ApproximateWeight) {
		cambios = append(cambios, fmt.Sprintf(
			"approximate_weight: %s → %s",
			pointerNumericString(actual.ApproximateWeight),
			pointerNumericString(nuevo.ApproximateWeight),
		))
	}

	if !equalStringPtr(actual.BearingDriveEnd, nuevo.BearingDriveEnd) {
		cambios = append(cambios, fmt.Sprintf(
			"bearing_drive_end: %q → %q",
			pointerString(actual.BearingDriveEnd),
			pointerString(nuevo.BearingDriveEnd),
		))
	}

	if !equalStringPtr(actual.BearingNonDriveEnd, nuevo.BearingNonDriveEnd) {
		cambios = append(cambios, fmt.Sprintf(
			"bearing_non_drive_end: %q → %q",
			pointerString(actual.BearingNonDriveEnd),
			pointerString(nuevo.BearingNonDriveEnd),
		))
	}

	if !equalStringPtr(actual.FrontBearing, nuevo.FrontBearing) {
		cambios = append(cambios, fmt.Sprintf(
			"front_bearing: %q → %q",
			pointerString(actual.FrontBearing),
			pointerString(nuevo.FrontBearing),
		))
	}

	if !equalStringPtr(actual.RearBearing, nuevo.RearBearing) {
		cambios = append(cambios, fmt.Sprintf(
			"rear_bearing: %q → %q",
			pointerString(actual.RearBearing),
			pointerString(nuevo.RearBearing),
		))
	}

	if !equalStringPtr(actual.Connection, nuevo.Connection) {
		cambios = append(cambios, fmt.Sprintf(
			"connection: %q → %q",
			pointerString(actual.Connection),
			pointerString(nuevo.Connection),
		))
	}

	if !equalStringPtr(actual.Standard, nuevo.Standard) {
		cambios = append(cambios, fmt.Sprintf(
			"standard: %q → %q",
			pointerString(actual.Standard),
			pointerString(nuevo.Standard),
		))
	}

	if !equalStringPtr(actual.NemaClassification, nuevo.NemaClassification) {
		cambios = append(cambios, fmt.Sprintf(
			"nema_classification: %q → %q",
			pointerString(actual.NemaClassification),
			pointerString(nuevo.NemaClassification),
		))
	}

	if !equalIntPtr(actual.YearOfManufacture, nuevo.YearOfManufacture) {
		cambios = append(cambios, fmt.Sprintf(
			"year_of_manufacture: %s → %s",
			pointerIntString(actual.YearOfManufacture),
			pointerIntString(nuevo.YearOfManufacture),
		))
	}

	return cambios
}
func equalNumericPtr[T comparable](a, b *T) bool {
	if a == nil && b == nil {
		return true
	}

	if a == nil || b == nil {
		return false
	}

	return *a == *b
}

func pointerNumericString[T any](v *T) string {
	if v == nil {
		return ""
	}

	return fmt.Sprintf("%v", *v)
}