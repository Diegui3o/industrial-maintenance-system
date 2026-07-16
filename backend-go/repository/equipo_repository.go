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
	fmt.Println("FILTROS", filtros)
	query := `
	SELECT
		id,
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
		fecha_instalacion,
		fecha_creacion,
		actualizado_en
	FROM equipos
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

	fmt.Println("QUERY FINAL:")
	fmt.Println(query)

	fmt.Println("ARGS")
	fmt.Println(args)

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

		err := rows.Scan(
			&e.ID,
			&e.Codigo,
			&e.Nombre,
			&e.Area,
			&e.Tipo,
			&e.Fase,
			&e.Fabricante,
			&e.Modelo,
			&e.NumeroSerie,
			&e.Critico,
			&e.EstadoEquipo,
			&e.FechaInstalacion,
			&e.FechaCreacion,
			&e.ActualizadoEn,
		)

		if err != nil {
			return nil, err
		}

		lista = append(lista, e)

	}

	if err := rows.Err(); err != nil {
		return nil, err
	}

	fmt.Println("CANTIDAD", len(lista))

	return lista, nil
}

func (r *EquipoRepository) CrearEquipos(e models.Equipo) error {
	_, err := r.DB.Exec(`
	INSERT INTO equipos(
	Codigo,
	Nombre,
	Area,
	Tipo,
	Fase,
	Fabricante,
	Modelo,
	Numero_serie,
	Critico,
	Estado_equipo,
	Fecha_instalacion
	)
	VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11)
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
	)

	return err
}

func (r *EquipoRepository) ObtenerEquipoPorID(id int) (*models.Equipo, error) {

	query := `
	SELECT
		id,
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
		fecha_instalacion,
		fecha_creacion,
		actualizado_en
	FROM equipos
	WHERE id=$1
	`
	e := &models.Equipo{}
	err := r.DB.QueryRow(query, id).Scan(
		&e.ID,
		&e.Codigo,
		&e.Nombre,
		&e.Area,
		&e.Tipo,
		&e.Fase,
		&e.Fabricante,
		&e.Modelo,
		&e.NumeroSerie,
		&e.Critico,
		&e.EstadoEquipo,
		&e.FechaInstalacion,
		&e.FechaCreacion,
		&e.ActualizadoEn,
	)
	if err == sql.ErrNoRows {
		return nil, fmt.Errorf("equipo no encontrado")
	}
	return e, err
}

func (r *EquipoRepository) ActualizarEquipo(id int, e models.Equipo) error {

	_, err := r.DB.Exec(`
	UPDATE equipos
	SET
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
