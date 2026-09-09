package repository

import (
	"backend/models"
	"database/sql"
	"fmt"
	"strconv"
)

type EquipoRepository struct {
	DB *sql.DB
}

func (r *EquipoRepository) ObtenerEquipos(
	filtros map[string]string,
	page int,
	limit int,
	sort string,
	order string,
) ([]models.Equipo, error) {

	query := `
		SELECT DISTINCT
			e.id,
			e.codigo,
			e.nombre,
			e.area,
			e.tipo,
			e.fase,
			e.fabricante,
			e.modelo,
			e.numero_serie,
			e.critico,
			e.estado_equipo,
			e.fecha_instalacion,
			e.fecha_creacion,
			e.actualizado_en,
			COALESCE(d.ip, '') AS ip
		FROM equipos e
		LEFT JOIN dispositivos_red d ON d.equipo_id = e.id
		WHERE 1=1
	`

	args := []interface{}{}
	i := 1

	ordenPermitido := map[string]string{
		"id":             "e.id",
		"nombre":         "e.nombre",
		"codigo":         "e.codigo",
		"area":           "e.area",
		"tipo":           "e.tipo",
		"fecha_creacion": "e.fecha_creacion",
		"estado_equipo":  "e.estado_equipo",
	}

	columnaOrden := "e.id"

	if valor, existe := ordenPermitido[sort]; existe {
		columnaOrden = valor
	}

	direccion := "ASC"
	if order == "desc" {
		direccion = "DESC"
	}

	camposPermitidos := map[string]string{
		"id":            "e.id",
		"codigo":        "e.codigo",
		"nombre":        "e.nombre",
		"area":          "e.area",
		"tipo":          "e.tipo",
		"fase":          "e.fase",
		"fabricante":    "e.fabricante",
		"modelo":        "e.modelo",
		"numero_serie":  "e.numero_serie",
		"critico":       "e.critico",
		"estado_equipo": "e.estado_equipo",
	}

	tipoBusqueda := map[string]string{
		"id":            "numero",
		"codigo":        "texto",
		"nombre":        "texto",
		"area":          "texto",
		"fabricante":    "texto",
		"modelo":        "texto",
		"numero_serie":  "texto",
		"estado_equipo": "exacto",
		"fase":          "exacto",
		"tipo":          "exacto",
		"critico":       "boolean",
	}

	for key, value := range filtros {
		if value == "" {
			continue
		}

		columna, existe := camposPermitidos[key]
		if !existe {
			continue
		}

		tipo := tipoBusqueda[key]

		switch tipo {

		case "exacto":
			query += " AND " + columna + " = $" + strconv.Itoa(i)
			args = append(args, value)
			i++

		case "texto":
			query += " AND LOWER(" + columna + ") LIKE LOWER($" + strconv.Itoa(i) + ")"
			args = append(args, "%"+value+"%")
			i++

		case "numero":
			numero, err := strconv.Atoi(value)
			if err != nil {
				continue
			}

			query += " AND " + columna + " = $" + strconv.Itoa(i)
			args = append(args, numero)
			i++

		case "boolean":
			boolean, err := strconv.ParseBool(value)
			if err != nil {
				continue
			}

			query += " AND " + columna + " = $" + strconv.Itoa(i)
			args = append(args, boolean)
			i++
		}
	}

	query += " ORDER BY " + columnaOrden + " " + direccion

	offset := (page - 1) * limit

	query += " LIMIT $" + strconv.Itoa(i)
	args = append(args, limit)
	i++

	query += " OFFSET $" + strconv.Itoa(i)
	args = append(args, offset)

	rows, err := r.DB.Query(query, args...)
	if err != nil {
		return nil, err
	}
	defer rows.Close()

	var lista []models.Equipo

	for rows.Next() {
		var e models.Equipo

		var (
			fase            sql.NullString
			fabricante      sql.NullString
			modelo          sql.NullString
			numeroSerie     sql.NullString
			fechaInstalacion sql.NullTime
			actualizadoEn   sql.NullTime
		)

		err := rows.Scan(
			&e.ID,
			&e.Codigo,
			&e.Nombre,
			&e.Area,
			&e.Tipo,
			&fase,
			&fabricante,
			&modelo,
			&numeroSerie,
			&e.Critico,
			&e.EstadoEquipo,
			&fechaInstalacion,
			&e.FechaCreacion,
			&actualizadoEn,
			&e.IP,
		)

		if err != nil {
			return nil, err
		}

		e.Fase = fase.String
		e.Fabricante = fabricante.String
		e.Modelo = modelo.String
		e.NumeroSerie = numeroSerie.String

		if fechaInstalacion.Valid {
			e.FechaInstalacion = &fechaInstalacion.Time
		}

		if actualizadoEn.Valid {
			e.ActualizadoEn = &actualizadoEn.Time
		}

		lista = append(lista, e)
	}

	if err := rows.Err(); err != nil {
		return nil, err
	}

	return lista, nil
}

func (r *EquipoRepository) CrearEquipos(e *models.Equipo) error {

	var existe int

	err := r.DB.QueryRow(
		"SELECT COUNT(*) FROM equipos WHERE codigo = $1",
		e.Codigo,
	).Scan(&existe)

	if err != nil {
		return fmt.Errorf("error verificando codigo: %w", err)
	}

	if existe > 0 {
		return fmt.Errorf("ya existe un equipo con el codigo %s", e.Codigo)
	}

	err = r.DB.QueryRow(`
		INSERT INTO equipos (
			codigo,
			nombre,
			area,
			tipo,
			fase,
			fabricante,
			modelo,
			numero_serie,
			critico,
			estado_equipo,
			fecha_instalacion
		)
		VALUES (
			$1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11
		)
		RETURNING id, fecha_creacion
	`,
		e.Codigo,
		e.Nombre,
		e.Area,
		e.Tipo,
		e.Fase,
		e.Fabricante,
		e.Modelo,
		e.NumeroSerie,
		e.Critico,
		e.EstadoEquipo,
		e.FechaInstalacion,
	).Scan(
		&e.ID,
		&e.FechaCreacion,
	)

	if err != nil {
		return fmt.Errorf("error creando equipo: %w", err)
	}

	return nil
}

func (r *EquipoRepository) ObtenerEquipoPorID(id int) (*models.Equipo, error) {

	query := `
		SELECT
			e.id,
			e.codigo,
			e.nombre,
			e.area,
			e.tipo,
			e.fase,
			e.fabricante,
			e.modelo,
			e.numero_serie,
			e.critico,
			e.estado_equipo,
			e.fecha_instalacion,
			e.fecha_creacion,
			e.actualizado_en,
			COALESCE(d.ip, '') AS ip
		FROM equipos e
		LEFT JOIN LATERAL (
			SELECT ip
			FROM dispositivos_red
			WHERE equipo_id = e.id
			ORDER BY id ASC
			LIMIT 1
		) d ON TRUE
		WHERE e.id = $1
	`

	e := &models.Equipo{}

	var (
		fase             sql.NullString
		fabricante       sql.NullString
		modelo           sql.NullString
		numeroSerie      sql.NullString
		fechaInstalacion  sql.NullTime
		actualizadoEn    sql.NullTime
	)

	err := r.DB.QueryRow(query, id).Scan(
		&e.ID,
		&e.Codigo,
		&e.Nombre,
		&e.Area,
		&e.Tipo,
		&fase,
		&fabricante,
		&modelo,
		&numeroSerie,
		&e.Critico,
		&e.EstadoEquipo,
		&fechaInstalacion,
		&e.FechaCreacion,
		&actualizadoEn,
		&e.IP,
	)

	if err == sql.ErrNoRows {
		return nil, fmt.Errorf("equipo no encontrado")
	}

	if err != nil {
		return nil, err
	}

	e.Fase = fase.String
	e.Fabricante = fabricante.String
	e.Modelo = modelo.String
	e.NumeroSerie = numeroSerie.String

	if fechaInstalacion.Valid {
		e.FechaInstalacion = &fechaInstalacion.Time
	}

	if actualizadoEn.Valid {
		e.ActualizadoEn = &actualizadoEn.Time
	}

	return e, nil
}

func (r *EquipoRepository) ActualizarEquipo(
	id int,
	e models.Equipo,
) error {

	_, err := r.DB.Exec(`
		UPDATE equipos SET
			codigo = $1,
			nombre = $2,
			area = $3,
			tipo = $4,
			fase = $5,
			fabricante = $6,
			modelo = $7,
			numero_serie = $8,
			critico = $9,
			estado_equipo = $10,
			fecha_instalacion = $11,
			actualizado_en = CURRENT_TIMESTAMP
		WHERE id = $12
	`,
		e.Codigo,
		e.Nombre,
		e.Area,
		e.Tipo,
		e.Fase,
		e.Fabricante,
		e.Modelo,
		e.NumeroSerie,
		e.Critico,
		e.EstadoEquipo,
		e.FechaInstalacion,
		id,
	)

	return err
}

func (r *EquipoRepository) ObtenerEstadoActualEquipo(
	equipoID int,
) (string, error) {

	var estado string

	err := r.DB.QueryRow(`
		SELECT estado_equipo
		FROM equipos
		WHERE id = $1
	`,
		equipoID,
	).Scan(&estado)

	return estado, err
}

func (r *EquipoRepository) ListarDispositivosPorEquipo(
	equipoID int,
) ([]models.DispositivoRed, error) {

	query := `
		SELECT
			id,
			equipo_id,
			tipo_dispositivo,
			ip,
			puerto,
			protocolo,
			usuario,
			password_hash
		FROM dispositivos_red
		WHERE equipo_id = $1
		ORDER BY id ASC
	`

	rows, err := r.DB.Query(query, equipoID)
	if err != nil {
		return nil, err
	}
	defer rows.Close()

	var dispositivos []models.DispositivoRed

	for rows.Next() {
		var d models.DispositivoRed
		var password sql.NullString

		err := rows.Scan(
			&d.ID,
			&d.EquipoID,
			&d.TipoDispositivo,
			&d.IP,
			&d.Puerto,
			&d.Protocolo,
			&d.Usuario,
			&password,
		)

		if err != nil {
			return nil, err
		}

		d.PasswordHash = password.String

		dispositivos = append(dispositivos, d)
	}

	return dispositivos, rows.Err()
}

func (r *EquipoRepository) ListarCriticos() ([]models.Equipo, error) {

	rows, err := r.DB.Query(`
		SELECT
			id,
			codigo,
			nombre,
			area,
			estado_equipo
		FROM equipos
		WHERE critico = true
		ORDER BY area, nombre
	`)

	if err != nil {
		return nil, err
	}

	defer rows.Close()

	var equipos []models.Equipo

	for rows.Next() {
		var e models.Equipo

		if err := rows.Scan(
			&e.ID,
			&e.Codigo,
			&e.Nombre,
			&e.Area,
			&e.EstadoEquipo,
		); err != nil {
			return nil, err
		}

		equipos = append(equipos, e)
	}

	return equipos, rows.Err()
}

func (r *EquipoRepository) PropagarEstadoHijos(
	padreID int,
	nuevoEstado string,
	motivo string,
) error {
	return nil
}

func (r *EquipoRepository) ListarHijos(padreID int) ([]models.Equipo, error) {
	return []models.Equipo{}, nil
}

func (r *EquipoRepository) ListarRaices() ([]models.Equipo, error) {
	return []models.Equipo{}, nil
}