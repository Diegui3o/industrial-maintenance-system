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

func (r *EquipoRepository) ObtenerEquipos(filtros map[string]string, page int, limit int, sort string, order string) ([]models.Equipo, error) {
	query := `
	SELECT DISTINCT
		e.id, e.codigo, e.nombre, e.area, e.tipo, e.fase, e.fabricante,
		e.modelo, e.numero_serie, e.critico, e.estado_equipo,
		e.fecha_instalacion, e.fecha_creacion, e.actualizado_en,
		e.activo_padre_id, e.nivel_jerarquia, e.tag,
		e.ubicacion_fisica, e.descripcion_larga,
		COALESCE(d.ip, '') as ip
	FROM equipos e
	LEFT JOIN dispositivos_red d ON d.equipo_id = e.id
	WHERE 1=1
	`
	args := []interface{}{}
	i := 1

	ordenPermitido := map[string]string{
		"nombre":         "nombre",
		"codigo":         "codigo",
		"area":           "area",
		"tipo":           "tipo",
		"fecha_creacion": "fecha_creacion",
		"estado_equipo":  "estado_equipo",
	}

	columnaOrden := "id"

	if valor, existe := ordenPermitido[sort]; existe {
		columnaOrden = valor
	}

	direccion := "ASC"

	if order == "desc" {
		direccion = "DESC"
	}

	camposPermitidos := map[string]string{
		"id":            "id",
		"codigo":        "codigo",
		"nombre":        "nombre",
		"area":          "area",
		"tipo":          "tipo",
		"fase":          "fase",
		"fabricante":    "fabricante",
		"modelo":        "modelo",
		"numero_serie":  "numero_serie",
		"critico":       "critico",
		"estado_equipo": "estado_equipo",
	}

	tipoBusqueda := map[string]string{

		"id": "numero",

		"codigo":       "texto",
		"nombre":       "texto",
		"area":         "texto",
		"fabricante":   "texto",
		"modelo":       "texto",
		"numero_serie": "texto",

		"estado_equipo": "exacto",
		"fase":          "exacto",
		"tipo":          "exacto",

		"critico": "boolean",
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

		case "texto":
			query += " AND LOWER(" + columna + ") LIKE LOWER($" + strconv.Itoa(i) + ")"
			args = append(args, "%"+value+"%")

		case "numero":
			query += " AND " + columna + " = $" + strconv.Itoa(i)

			numero, err := strconv.Atoi(value)
			args = append(args, numero)
			if err != nil {
				continue
			}

		case "boolean":
			query += " AND " + columna + " = $" + strconv.Itoa(i)

			boolean, err := strconv.Atoi(value)
			args = append(args, boolean)
			if err != nil {
				continue
			}
		}

		i++
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
			fase             sql.NullString
			fabricante       sql.NullString
			modeloStr        sql.NullString
			numeroSerie      sql.NullString
			activoPadreID    sql.NullInt64
			nivelJerarquia   sql.NullInt64
			tag              sql.NullString
			ubicacionFisica  sql.NullString
			descripcionLarga sql.NullString
		)

		err := rows.Scan(
			&e.ID, &e.Codigo, &e.Nombre, &e.Area, &e.Tipo,
			&fase, &fabricante, &modeloStr, &numeroSerie,
			&e.Critico, &e.EstadoEquipo, &e.FechaInstalacion,
			&e.FechaCreacion, &e.ActualizadoEn,
			&activoPadreID, &nivelJerarquia, &tag,
			&ubicacionFisica, &descripcionLarga,
			&e.IP,
		)

		e.Fase = fase.String
		e.Fabricante = fabricante.String
		e.Modelo = modeloStr.String
		e.NumeroSerie = numeroSerie.String

		if err != nil {
			return nil, err
		}

		if activoPadreID.Valid {
			id := int(activoPadreID.Int64)
			e.ActivoPadreID = &id
		}
		e.NivelJerarquia = int(nivelJerarquia.Int64)
		e.Tag = tag.String
		e.UbicacionFisica = ubicacionFisica.String
		e.DescripcionLarga = descripcionLarga.String

		lista = append(lista, e)
	}

	if err := rows.Err(); err != nil {
		return nil, err
	}

	return lista, nil
}

func (r *EquipoRepository) CrearEquipos(e *models.Equipo) error {
	var activoPadreID interface{}
	if e.ActivoPadreID != nil {
		activoPadreID = *e.ActivoPadreID
	}

	var existe int
	r.DB.QueryRow("SELECT COUNT(*) FROM equipos WHERE codigo = $1", e.Codigo).Scan(&existe)
	if existe > 0 {
		return fmt.Errorf("ya existe un equipo con el código %s", e.Codigo)
	}

	err := r.DB.QueryRow(`
        INSERT INTO equipos(
            Codigo, Nombre, Area, Tipo, Fase, Fabricante, Modelo,
            Numero_serie, Critico, Estado_equipo, Fecha_instalacion,
            activo_padre_id, nivel_jerarquia, tag,
            ubicacion_fisica, descripcion_larga
        )
        VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,$13,$14,$15,$16)
        RETURNING id, fecha_creacion
    `,
		e.Codigo, e.Nombre, e.Area, e.Tipo, e.Fase, e.Fabricante, e.Modelo,
		e.NumeroSerie, e.Critico, e.EstadoEquipo, e.FechaInstalacion,
		activoPadreID, e.NivelJerarquia, e.Tag,
		e.UbicacionFisica, e.DescripcionLarga,
	).Scan(&e.ID, &e.FechaCreacion)

	if err != nil {
		return fmt.Errorf("error creando equipo: %w", err)
	}
	return nil
}

func (r *EquipoRepository) ObtenerEquipoPorID(id int) (*models.Equipo, error) {
	query := `
    SELECT
        id, codigo, nombre, area, tipo, fase, fabricante, modelo, numero_serie,
        critico, estado_equipo, fecha_instalacion, fecha_creacion, actualizado_en,
        activo_padre_id, nivel_jerarquia, tag, ubicacion_fisica, descripcion_larga
    FROM equipos
    WHERE id = $1
    `
	e := &models.Equipo{}
	var (
		fase             sql.NullString
		fabricante       sql.NullString
		modeloStr        sql.NullString
		numeroSerie      sql.NullString
		activoPadreID    sql.NullInt64
		nivelJerarquia   sql.NullInt64
		tag              sql.NullString
		ubicacionFisica  sql.NullString
		descripcionLarga sql.NullString
	)

	err := r.DB.QueryRow(query, id).Scan(
		&e.ID, &e.Codigo, &e.Nombre, &e.Area, &e.Tipo,
		&fase, &fabricante, &modeloStr, &numeroSerie,
		&e.Critico, &e.EstadoEquipo, &e.FechaInstalacion,
		&e.FechaCreacion, &e.ActualizadoEn,
		&activoPadreID, &nivelJerarquia, &tag,
		&ubicacionFisica, &descripcionLarga,
	)

	e.Fase = fase.String
	e.Fabricante = fabricante.String
	e.Modelo = modeloStr.String
	e.NumeroSerie = numeroSerie.String
	if activoPadreID.Valid {
		pid := int(activoPadreID.Int64)
		e.ActivoPadreID = &pid
	}
	e.NivelJerarquia = int(nivelJerarquia.Int64)
	e.Tag = tag.String
	e.UbicacionFisica = ubicacionFisica.String
	e.DescripcionLarga = descripcionLarga.String

	if err == sql.ErrNoRows {
		return nil, fmt.Errorf("equipo no encontrado")
	}
	if err != nil {
		return nil, err
	}
	if activoPadreID.Valid {
		pid := int(activoPadreID.Int64)
		e.ActivoPadreID = &pid
	}
	e.NivelJerarquia = int(nivelJerarquia.Int64)
	e.Tag = tag.String
	e.UbicacionFisica = ubicacionFisica.String
	e.DescripcionLarga = descripcionLarga.String
	return e, nil
}

func (r *EquipoRepository) ActualizarEquipo(id int, e models.Equipo) error {
	_, err := r.DB.Exec(`
    UPDATE equipos SET
        codigo = $1, nombre = $2, area = $3, tipo = $4, fase = $5,
        fabricante = $6, modelo = $7, numero_serie = $8, critico = $9,
        estado_equipo = $10, fecha_instalacion = $11,
        activo_padre_id = $12, nivel_jerarquia = $13, tag = $14,
        ubicacion_fisica = $15, descripcion_larga = $16,
        actualizado_en = CURRENT_TIMESTAMP
    WHERE id = $17
    `,
		e.Codigo, e.Nombre, e.Area, e.Tipo, e.Fase, e.Fabricante, e.Modelo,
		e.NumeroSerie, e.Critico, e.EstadoEquipo, e.FechaInstalacion,
		e.ActivoPadreID, e.NivelJerarquia, e.Tag,
		e.UbicacionFisica, e.DescripcionLarga, id,
	)
	return err
}

func (r *EquipoRepository) ObtenerEstadoActualEquipo(equipoID int) (string, error) {
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

// ListarHijos: equipos que están dentro de otro equipo
func (r *EquipoRepository) ListarHijos(padreID int) ([]models.Equipo, error) {
	query := `
        SELECT id, codigo, nombre, area, tipo_activo, tag, nivel_jerarquia,
               ip, ubicacion_fisica, marca, modelo_equipo, estado_equipo
        FROM equipos
        WHERE activo_padre_id = $1
        ORDER BY nivel_jerarquia, nombre
    `
	rows, err := r.DB.Query(query, padreID)
	if err != nil {
		return nil, err
	}
	defer rows.Close()

	var hijos []models.Equipo
	for rows.Next() {
		var e models.Equipo
		rows.Scan(&e.ID, &e.Codigo, &e.Nombre, &e.Area, &e.TipoActivo, &e.Tag,
			&e.NivelJerarquia, &e.IP, &e.UbicacionFisica, &e.Marca, &e.ModeloEquipo, &e.EstadoEquipo)
		hijos = append(hijos, e)
	}
	return hijos, rows.Err()
}

// ListarRaices: equipos sin padre (nivel más alto)
func (r *EquipoRepository) ListarRaices() ([]models.Equipo, error) {
	query := `
        SELECT id, codigo, nombre, area, tipo_activo, tag, nivel_jerarquia
        FROM equipos
        WHERE activo_padre_id IS NULL
        ORDER BY nombre
    `
	rows, err := r.DB.Query(query)
	if err != nil {
		return nil, err
	}
	defer rows.Close()

	var raices []models.Equipo
	for rows.Next() {
		var e models.Equipo
		rows.Scan(&e.ID, &e.Codigo, &e.Nombre, &e.Area, &e.TipoActivo, &e.Tag, &e.NivelJerarquia)
		raices = append(raices, e)
	}
	return raices, rows.Err()
}

func (r *EquipoRepository) ListarDispositivosPorEquipo(equipoID int) ([]models.DispositivoRed, error) {
	query := `
        SELECT id, equipo_id, tipo_dispositivo, ip, puerto, protocolo, usuario, password_hash
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
		rows.Scan(&d.ID, &d.EquipoID, &d.TipoDispositivo, &d.IP, &d.Puerto, &d.Protocolo, &d.Usuario, &password)
		d.PasswordHash = password.String
		dispositivos = append(dispositivos, d)
	}
	return dispositivos, rows.Err()
}

func (r *EquipoRepository) PropagarEstadoHijos(padreID int, nuevoEstado string, motivo string) error {
	// Encontrar todos los hijos (recursivo con WITH RECURSIVE)
	query := `
        WITH RECURSIVE descendientes AS (
            SELECT id FROM equipos WHERE activo_padre_id = $1
            UNION ALL
            SELECT e.id FROM equipos e
            INNER JOIN descendientes d ON e.activo_padre_id = d.id
        )
        UPDATE equipos SET 
            estado_equipo = $2,
            actualizado_en = NOW()
        WHERE id IN (SELECT id FROM descendientes)
    `
	_, err := r.DB.Exec(query, padreID, nuevoEstado)
	return err
}

// ListarCriticos: equipos críticos para asignar a grupos
func (r *EquipoRepository) ListarCriticos() ([]models.Equipo, error) {
	rows, err := r.DB.Query(`
		SELECT id, codigo, nombre, area, estado_equipo
		FROM equipos WHERE critico = true
		ORDER BY area, nombre
	`)
	if err != nil {
		return nil, err
	}
	defer rows.Close()

	var equipos []models.Equipo
	for rows.Next() {
		var e models.Equipo
		if err := rows.Scan(&e.ID, &e.Codigo, &e.Nombre, &e.Area, &e.EstadoEquipo); err != nil {
			return nil, err
		}
		equipos = append(equipos, e)
	}
	return equipos, rows.Err()
}
