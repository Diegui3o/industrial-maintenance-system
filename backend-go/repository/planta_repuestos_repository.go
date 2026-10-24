package repository

import (
    "database/sql"
    "fmt"
    "reflect"
    "strconv"

    "backend/models"
)

func (r *EstructuraPlantaRepository) ListarRepuestos() ([]models.Repuesto, error) {
    rows, err := r.DB.Query(`
        SELECT
            id,
            codigo,
            nombre,
            descripcion,
            activo,
            codigo_sap,
            categoria,
            criticidad,
            stock_actual,
            stock_minimo,
            unidad_medida,
            marca,
            modelo,
            COALESCE(estado, 'activo') AS estado,
            especificaciones_tecnicas
        FROM repuestos
        WHERE activo = TRUE
        ORDER BY nombre
    `)
    if err != nil {
        return nil, err
    }
    defer rows.Close()

    resultado := make([]models.Repuesto, 0)

    for rows.Next() {
        var rep models.Repuesto

    if err := rows.Scan(
        &rep.ID,
        &rep.Codigo,
        &rep.Nombre,
        &rep.Descripcion,
        &rep.Activo,
        &rep.CodigoSAP,
        &rep.Categoria,
        &rep.Criticidad,
        &rep.StockActual,
        &rep.StockMinimo,
        &rep.UnidadMedida,
        &rep.Marca,
        &rep.Modelo,
        &rep.Estado,
        &rep.EspecificacionesTecnicas,
    ); err != nil {
        return nil, err
    }

        resultado = append(resultado, rep)
    }

    return resultado, rows.Err()
}

func (r *EstructuraPlantaRepository) CrearRepuesto(
    rep *models.Repuesto,
) error {
    err := r.DB.QueryRow(`
        INSERT INTO repuestos (
            codigo,
            nombre,
            descripcion,
            activo,
            codigo_sap,
            categoria,
            criticidad,
            stock_actual,
            stock_minimo,
            unidad_medida,
            marca,
            modelo,
            estado,
            especificaciones_tecnicas
        )
        VALUES (
            $1, $2, $3, TRUE,
            $4, $5, $6, $7, $8, $9, $10, $11,
            COALESCE(NULLIF($12, ''), 'activo'),
            $13
        )
        RETURNING id
    `,
        rep.Codigo,
        rep.Nombre,
        rep.Descripcion,
        rep.CodigoSAP,
        rep.Categoria,
        rep.Criticidad,
        rep.StockActual,
        rep.StockMinimo,
        rep.UnidadMedida,
        rep.Marca,
        rep.Modelo,
        rep.Estado,
        rep.EspecificacionesTecnicas,
    ).Scan(&rep.ID)

    if err != nil {
        return err
    }

    rep.Activo = true
    return nil
}

func (r *EstructuraPlantaRepository) AsignarRepuestoComponente(
    componenteID int,
    repuestoID int,
    cantidad float64,
    posicion *string,
    notas *string,
) error {
    _, err := r.DB.Exec(`
                INSERT INTO componente_repuesto (
                        componente_id,
                        repuesto_id,
                        cantidad,
                        posicion,
                        notas
                )
                VALUES ($1, $2, $3, $4, $5)
                ON CONFLICT (componente_id, repuesto_id)
                DO UPDATE SET
                        cantidad = EXCLUDED.cantidad,
                        posicion = EXCLUDED.posicion,
                        notas = EXCLUDED.notas,
                        actualizado_en = NOW()
        `,
        componenteID,
        repuestoID,
        cantidad,
        posicion,
        notas,
    )

    return err
}

// ==================== ACTUALIZACIÓN CON HISTORIAL ====================

// ActualizarRepuesto actualiza y registra cambios en repuestos_historial
func (r *EstructuraPlantaRepository) ActualizarRepuesto(
    id int,
    rep models.RepuestoActualizacion,
    tipoOrigen string,
    usuarioID *int,
    conectorID *string,
    comentario *string,
) error {
    // 1. Leer estado actual
    current, err := r.obtenerRepuestoParaHistorial(id)
    if err != nil {
        return err
    }

    // 2. Preparar UPDATE dinámico solo con campos no nulos
    setClauses := []string{}
    args := []interface{}{}
    argPos := 1

    // Mapa campo -> puntero en RepuestoActualizacion
    fields := map[string]interface{}{
        "codigo":                    rep.Codigo,
        "nombre":                    rep.Nombre,
        "descripcion":               rep.Descripcion,
        "activo":                    rep.Activo,
        "codigo_sap":                rep.CodigoSAP,
        "categoria":                 rep.Categoria,
        "criticidad":                rep.Criticidad,
        "stock_actual":              rep.StockActual,
        "stock_minimo":              rep.StockMinimo,
        "unidad_medida":             rep.UnidadMedida,
        "marca":                     rep.Marca,
        "modelo":                    rep.Modelo,
        "estado":                    rep.Estado,
        "especificaciones_tecnicas": rep.EspecificacionesTecnicas,
    }

    // 3. Detectar cambios y construir SET + historial
    for col, ptr := range fields {
        if isNil(ptr) {
            continue // no viene en payload → no tocar
        }
        newVal := deref(ptr)
        oldVal := current[col]

        if !valsEqual(oldVal, newVal) {
            // hay cambio real → agregar a UPDATE
            setClauses = append(setClauses, fmt.Sprintf("%s = $%d", col, argPos))
            args = append(args, newVal)
            argPos++

            // registrar en historial
            if err := r.insertHistorial(id, col, oldVal, newVal, tipoOrigen, usuarioID, conectorID, comentario); err != nil {
                return err
            }
        }
    }

    if len(setClauses) == 0 {
        return nil // nada que hacer
    }

    // 4. Añadir actualizado_en y WHERE id
    setClauses = append(setClauses, "actualizado_en = NOW()")
    args = append(args, id)

    query := fmt.Sprintf("UPDATE repuestos SET %s WHERE id = $%d", join(setClauses, ", "), argPos)
    _, err = r.DB.Exec(query, args...)
    return err
}

// ==================== ELIMINACIÓN SEGURA ====================

func (r *EstructuraPlantaRepository) EliminarRepuestoSeguro(id int) error {
    var count int
    err := r.DB.QueryRow(`
        SELECT 
            (SELECT count(*) FROM componente_repuesto WHERE repuesto_id = $1) +
            (SELECT count(*) FROM subcomponente_repuesto WHERE repuesto_id = $1) +
            (SELECT count(*) FROM mantenimiento_materiales WHERE repuesto_id = $1)
    `, id).Scan(&count)
    if err != nil {
        return err
    }
    if count > 0 {
        return fmt.Errorf("repuesto tiene %d referencias (componentes, subcomponentes o historial); no se puede eliminar físicamente. Use PUT {activo:false} para desactivar", count)
    }
    _, err = r.DB.Exec(`DELETE FROM repuestos WHERE id = $1`, id)
    return err
}

// ==================== COMPATIBILIDAD REPUESTO <-> EQUIPO ====================

func (r *EstructuraPlantaRepository) AgregarCompatibilidadEquipo(repuestoID, equipoID int) error {
    _, err := r.DB.Exec(`
        INSERT INTO repuesto_equipo_compatible (repuesto_id, equipo_id)
        VALUES ($1, $2)
        ON CONFLICT (repuesto_id, equipo_id) DO NOTHING
    `, repuestoID, equipoID)
    return err
}

func (r *EstructuraPlantaRepository) ListarEquiposCompatibles(repuestoID int) ([]int, error) {
    rows, err := r.DB.Query(`
        SELECT equipo_id FROM repuesto_equipo_compatible
        WHERE repuesto_id = $1
        ORDER BY equipo_id
    `, repuestoID)
    if err != nil {
        return nil, err
    }
    defer rows.Close()

    var equipos []int
    for rows.Next() {
        var id int
        if err := rows.Scan(&id); err != nil {
            return nil, err
        }
        equipos = append(equipos, id)
    }
    return equipos, rows.Err()
}

func (r *EstructuraPlantaRepository) EliminarCompatibilidadEquipo(repuestoID, equipoID int) error {
    _, err := r.DB.Exec(`
        DELETE FROM repuesto_equipo_compatible
        WHERE repuesto_id = $1 AND equipo_id = $2
    `, repuestoID, equipoID)
    return err
}

// ==================== HISTORIAL ====================

func (r *EstructuraPlantaRepository) insertHistorial(
    repuestoID int,
    campo, oldVal, newVal interface{},
    tipoOrigen string,
    usuarioID *int,
    conectorID *string,
    comentario *string,
) error {
    _, err := r.DB.Exec(`
        INSERT INTO repuestos_historial
            (repuesto_id, campo, valor_anterior, valor_nuevo, tipo_origen, usuario_id, conector_id, comentario)
        VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
    `,
        repuestoID,
        campo,
        toText(oldVal),
        toText(newVal),
        tipoOrigen,
        usuarioID,
        conectorID,
        comentario,
    )
    return err
}

func (r *EstructuraPlantaRepository) ListarHistorialRepuesto(repuestoID int) ([]models.RepuestoHistorial, error) {
    rows, err := r.DB.Query(`
        SELECT id, repuesto_id, campo, valor_anterior, valor_nuevo,
               tipo_origen, usuario_id, conector_id, comentario, creado_en
        FROM repuestos_historial
        WHERE repuesto_id = $1
        ORDER BY creado_en DESC
    `, repuestoID)
    if err != nil {
        return nil, err
    }
    defer rows.Close()

    var lista []models.RepuestoHistorial
    for rows.Next() {
        var h models.RepuestoHistorial
        var va, vn, uid, cid, com sql.NullString
        if err := rows.Scan(
            &h.ID, &h.RepuestoID, &h.Campo, &va, &vn,
            &h.TipoOrigen, &uid, &cid, &com, &h.CreadoEn,
        ); err != nil {
            return nil, err
        }
        if va.Valid { h.ValorAnterior = &va.String }
        if vn.Valid { h.ValorNuevo = &vn.String }
        if uid.Valid { 
            if i, err := strconv.Atoi(uid.String); err == nil { h.UsuarioID = &i }
        }
        if cid.Valid { h.ConectorID = &cid.String }
        if com.Valid { h.Comentario = &com.String }
        lista = append(lista, h)
    }
    return lista, rows.Err()
}

// ==================== HELPERS ====================
func (r *EstructuraPlantaRepository) obtenerRepuestoParaHistorial(id int) (map[string]interface{}, error) {
	var codigo, codigoSAP, categoria, criticidad, unidadMedida, marca, modelo, estado, especificaciones sql.NullString
	var nombre sql.NullString
	var descripcion sql.NullString
	var activo bool
	var stockActual, stockMinimo sql.NullFloat64

	err := r.DB.QueryRow(`
		SELECT 
			codigo, nombre, descripcion, activo, codigo_sap, categoria, 
			criticidad, stock_actual, stock_minimo, unidad_medida, 
			marca, modelo, estado, especificaciones_tecnicas
		FROM repuestos 
		WHERE id = $1
	`, id).Scan(
		&codigo, &nombre, &descripcion, &activo, &codigoSAP, &categoria,
		&criticidad, &stockActual, &stockMinimo, &unidadMedida,
		&marca, &modelo, &estado, &especificaciones,
	)

	if err != nil {
		return nil, err
	}

	return map[string]interface{}{
		"codigo":                    nullStrVal(codigo),
		"nombre":                    nullStrVal(nombre),
		"descripcion":               nullStrVal(descripcion),
		"activo":                    activo,
		"codigo_sap":                nullStrVal(codigoSAP),
		"categoria":                 nullStrVal(categoria),
		"criticidad":                nullStrVal(criticidad),
		"stock_actual":              nullFloatVal(stockActual),
		"stock_minimo":              nullFloatVal(stockMinimo),
		"unidad_medida":             nullStrVal(unidadMedida),
		"marca":                     nullStrVal(marca),
		"modelo":                    nullStrVal(modelo),
		"estado":                    nullStrVal(estado),
		"especificaciones_tecnicas": nullStrVal(especificaciones),
	}, nil
}

// Helpers que devuelven VALOR (string/float64) o nil
func nullStrVal(ns sql.NullString) interface{} {
    if ns.Valid {
        return ns.String
    }
    return nil
}
func nullFloatVal(nf sql.NullFloat64) interface{} {
    if nf.Valid {
        return nf.Float64
    }
    return nil
}

func toText(v interface{}) *string {
    if v == nil {
        return nil
    }

    // Desreferenciar punteros si vienen del payload
    rv := reflect.ValueOf(v)
    if rv.Kind() == reflect.Ptr {
        if rv.IsNil() {
            return nil
        }
        v = rv.Elem().Interface()
    }

    s := fmt.Sprintf("%v", v)
    return &s
}

// ==================== HELPERS para ActualizarRepuesto ====================

func isNil(ptr interface{}) bool {
    if ptr == nil {
        return true
    }
    v := reflect.ValueOf(ptr)
    return v.Kind() == reflect.Ptr && v.IsNil()
}

func deref(ptr interface{}) interface{} {
    v := reflect.ValueOf(ptr)
    if v.Kind() == reflect.Ptr && !v.IsNil() {
        return v.Elem().Interface()
    }
    return nil
}

func valsEqual(a, b interface{}) bool {
    if a == nil && b == nil {
        return true
    }
    if a == nil || b == nil {
        return false
    }

    // Desreferenciar punteros para comparar valores reales
    va := reflect.ValueOf(a)
    if va.Kind() == reflect.Ptr {
        if va.IsNil() {
            return b == nil
        }
        a = va.Elem().Interface()
    }

    vb := reflect.ValueOf(b)
    if vb.Kind() == reflect.Ptr {
        if vb.IsNil() {
            return a == nil
        }
        b = vb.Elem().Interface()
    }

    return fmt.Sprintf("%v", a) == fmt.Sprintf("%v", b)
}

func join(ss []string, sep string) string {
    if len(ss) == 0 {
        return ""
    }
    res := ss[0]
    for _, s := range ss[1:] {
        res += sep + s
    }
    return res
}

// ==================== RELACIONES COMPONENTE ====================

func (r *EstructuraPlantaRepository) ActualizarComponenteRepuestos(
    componenteID int,
    repuestos []int,
) error {
    tx, err := r.DB.Begin()
    if err != nil {
        return err
    }
    defer tx.Rollback()

    _, err = tx.Exec(`DELETE FROM componente_repuesto WHERE componente_id = $1`, componenteID)
    if err != nil {
        return err
    }

    for _, repuestoID := range repuestos {
        _, err = tx.Exec(`
            INSERT INTO componente_repuesto (componente_id, repuesto_id) VALUES ($1, $2)
        `, componenteID, repuestoID)
        if err != nil {
            return err
        }
    }
    return tx.Commit()
}

func (r *EstructuraPlantaRepository) ListarRepuestosPorComponente(
    componenteID int,
) ([]models.Repuesto, error) {
    rows, err := r.DB.Query(`
        SELECT r.id, r.codigo, r.nombre, r.descripcion, r.activo
        FROM repuestos r
        INNER JOIN componente_repuesto cr ON cr.repuesto_id = r.id
        WHERE cr.componente_id = $1
        ORDER BY r.nombre
    `, componenteID)
    if err != nil {
        return nil, err
    }
    defer rows.Close()

    var lista []models.Repuesto
    for rows.Next() {
        var rep models.Repuesto
        if err := rows.Scan(&rep.ID, &rep.Codigo, &rep.Nombre, &rep.Descripcion, &rep.Activo); err != nil {
            return nil, err
        }
        lista = append(lista, rep)
    }
    return lista, rows.Err()
}

func (r *EstructuraPlantaRepository) ListarRepuestosDetallePorComponente(
    componenteID int,
) ([]models.ComponenteRepuestoDetalle, error) {
    rows, err := r.DB.Query(`
        SELECT r.id, r.codigo, r.nombre, cr.cantidad, cr.posicion, cr.notas
        FROM componente_repuesto cr
        INNER JOIN repuestos r ON r.id = cr.repuesto_id
        WHERE cr.componente_id = $1
        ORDER BY r.nombre
    `, componenteID)
    if err != nil {
        return nil, err
    }
    defer rows.Close()

    var lista []models.ComponenteRepuestoDetalle
    for rows.Next() {
        var item models.ComponenteRepuestoDetalle
        var codigo, posicion, notas sql.NullString
        if err := rows.Scan(&item.RepuestoID, &codigo, &item.Nombre, &item.Cantidad, &posicion, &notas); err != nil {
            return nil, err
        }
        if codigo.Valid { item.Codigo = &codigo.String }
        if posicion.Valid { item.Posicion = &posicion.String }
        if notas.Valid { item.Notas = &notas.String }
        lista = append(lista, item)
    }
    return lista, rows.Err()
}

func (r *EstructuraPlantaRepository) ActualizarComponenteRepuesto(
    componenteID, repuestoID int,
    cantidad float64, posicion, notas *string,
) error {
    _, err := r.DB.Exec(`
        UPDATE componente_repuesto
        SET cantidad = $1, posicion = $2, notas = $3, actualizado_en = NOW()
        WHERE componente_id = $4 AND repuesto_id = $5
    `, cantidad, posicion, notas, componenteID, repuestoID)
    return err
}

func (r *EstructuraPlantaRepository) ActualizarAsignacionRepuesto(
    componenteID, repuestoID int,
    cantidad float64, posicion, notas *string,
) error {
    _, err := r.DB.Exec(`
        UPDATE componente_repuesto
        SET cantidad = $1, posicion = $2, notas = $3, actualizado_en = NOW()
        WHERE componente_id = $4 AND repuesto_id = $5
    `, cantidad, posicion, notas, componenteID, repuestoID)
    return err
}