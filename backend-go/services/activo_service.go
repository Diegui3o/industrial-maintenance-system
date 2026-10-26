package services

import (
	"fmt"
	"log"
	"time"

	"backend/repository"
)

type ActivoService struct {
	EquipoRepo  *repository.EquipoRepository
	AlarmaRepo  *repository.AlarmaRepository
	AlertaRepo  *repository.AlertaRepository
	EventoRepo  *repository.EventosRepository
	TiempoRepo  *repository.TiempoActivoRepository
}

func NewActivoService(
	equipoRepo *repository.EquipoRepository,
	alarmaRepo *repository.AlarmaRepository,
	alertaRepo *repository.AlertaRepository,
	eventoRepo *repository.EventosRepository,
	tiempoRepo *repository.TiempoActivoRepository,
) *ActivoService {
	return &ActivoService{
		EquipoRepo: equipoRepo,
		AlarmaRepo: alarmaRepo,
		AlertaRepo: alertaRepo,
		EventoRepo: eventoRepo,
		TiempoRepo: tiempoRepo,
	}
}

// CambiarEstadoActivo cambia el estado de un activo y gestiona las
// consecuencias: cierre de alarmas/alertas, eventos y tiempos.
//
// Estados soportados para activos: 'activo', 'mantenimiento'.
// (Los estados 'fallo'/'falla' los pone el motor automáticamente.)
func (s *ActivoService) CambiarEstadoActivo(
	tipo string,
	id int,
	nuevoEstado string,
	motivo string,
) error {
	if id <= 0 {
		return fmt.Errorf("id inválido")
	}
	if tipo != "equipo" && tipo != "componente" && tipo != "repuesto" {
		return fmt.Errorf("tipo inválido: %s", tipo)
	}

	// Validar nuevo estado
	estadosPermitidos := map[string]bool{
		"activo":        true,
		"mantenimiento": true,
	}
	if !estadosPermitidos[nuevoEstado] {
		return fmt.Errorf("estado no permitido por este endpoint: %s (usa 'activo' o 'mantenimiento')", nuevoEstado)
	}

	estadoActual, err := s.EquipoRepo.ObtenerEstadoActivo(tipo, id)
	if err != nil {
		return fmt.Errorf("error consultando estado actual: %w", err)
	}
	if estadoActual == "" {
		return fmt.Errorf("activo %s=%d no encontrado", tipo, id)
	}

	if estadoActual == nuevoEstado {
		log.Printf("Activo %s=%d ya está en estado '%s', sin cambios", tipo, id, nuevoEstado)
		return nil
	}

	ahora := time.Now()

	switch nuevoEstado {
	case "mantenimiento":
		return s.entrarMantenimiento(tipo, id, estadoActual, motivo, ahora)
	case "activo":
		return s.salirMantenimiento(tipo, id, estadoActual, motivo, ahora)
	}

	return nil
}

// entrarMantenimiento cierra alarmas/alertas activas, actualiza estado,
// registra evento y transiciona el tiempo.
func (s *ActivoService) entrarMantenimiento(
	tipo string,
	id int,
	estadoAnterior string,
	motivo string,
	ahora time.Time,
) error {
	log.Printf("🔧 MANTENIMIENTO: %s=%d pasa de '%s' a 'mantenimiento'",
		tipo, id, estadoAnterior)

	// 1. Cerrar alarmas activas
	if err := s.cerrarAlarmasActivas(tipo, id); err != nil {
		log.Printf("Error cerrando alarmas de %s=%d: %v", tipo, id, err)
	}

	// 2. Cerrar alertas activas
	if err := s.cerrarAlertasActivas(tipo, id); err != nil {
		log.Printf("Error cerrando alertas de %s=%d: %v", tipo, id, err)
	}

	// 3. Actualizar estado del activo
	if err := s.EquipoRepo.ActualizarEstadoActivo(tipo, id, "mantenimiento"); err != nil {
		return fmt.Errorf("error actualizando estado: %w", err)
	}

	// 4. Registrar evento en eventos_estado
	descripcion := "Puesto en mantenimiento"
	if motivo != "" {
		descripcion = motivo
	}
	if err := s.registrarEventoEstado(tipo, id, estadoAnterior, "mantenimiento", descripcion); err != nil {
		log.Printf("Error registrando evento estado: %v", err)
	}

	// 5. Transicionar tiempos (si el tag tiene contar_tiempo_activo)
	s.transicionarTiempo(tipo, id, "mantenimiento", "mantenimiento_manual", ahora)

	return nil
}

// salirMantenimiento consulta el valor actual (si aplica) y determina si
// el activo pasa a 'activo' o vuelve a 'fallo' (caso en que el tag sigue
// fuera de rango).
func (s *ActivoService) salirMantenimiento(
	tipo string,
	id int,
	estadoAnterior string,
	motivo string,
	ahora time.Time,
) error {
	log.Printf("🔧 SALIR MANTENIMIENTO: %s=%d pasa de '%s' a 'activo' (o 'fallo' si aplica)",
		tipo, id, estadoAnterior)

	// Por ahora, siempre pasamos a 'activo'.
	// Si el tag sigue fuera de rango, el motor lo detectará en el
	// siguiente ciclo y generará una alarma nueva automáticamente.
	if err := s.EquipoRepo.ActualizarEstadoActivo(tipo, id, "activo"); err != nil {
		return fmt.Errorf("error actualizando estado: %w", err)
	}

	descripcion := "Salida de mantenimiento"
	if motivo != "" {
		descripcion = motivo
	}
	if err := s.registrarEventoEstado(tipo, id, estadoAnterior, "activo", descripcion); err != nil {
		log.Printf("Error registrando evento estado: %v", err)
	}

	s.transicionarTiempo(tipo, id, "activo", "cambio_estado", ahora)

	return nil
}

// cerrarAlarmasActivas cierra todas las alarmas en estado 'activa' del activo.
func (s *ActivoService) cerrarAlarmasActivas(tipo string, id int) error {
	var col string
	switch tipo {
	case "equipo":
		col = "equipo_id"
	case "componente":
		col = "componente_id"
	case "repuesto":
		col = "repuesto_id"
	default:
		return nil
	}

	_, err := s.AlarmaRepo.DB.Exec(`
        UPDATE alarmas
        SET estado = 'cerrada',
            fecha_cierre = NOW(),
            motivo_cierre = 'mantenimiento_manual'
        WHERE `+col+` = $1 AND estado = 'activa'
    `, id)
	return err
}

// cerrarAlertasActivas cierra todas las alertas en estado 'activa' del activo.
func (s *ActivoService) cerrarAlertasActivas(tipo string, id int) error {
	var col string
	switch tipo {
	case "equipo":
		col = "equipo_id"
	case "componente":
		col = "componente_id"
	case "repuesto":
		col = "repuesto_id"
	default:
		return nil
	}

	_, err := s.AlertaRepo.DB.Exec(`
        UPDATE alertas
        SET estado = 'descartada'
        WHERE `+col+` = $1 AND estado = 'activa'
    `, id)
	return err
}

// registrarEventoEstado inserta una fila en eventos_estado.
func (s *ActivoService) registrarEventoEstado(
	tipo string,
	id int,
	estadoAnterior string,
	estadoNuevo string,
	motivo string,
) error {
	var equipoID, componenteID, repuestoID *int
	switch tipo {
	case "equipo":
		equipoID = &id
	case "componente":
		// Buscar equipo padre
		eq, _ := s.EquipoRepo.ObtenerEquipoPadreDeComponente(id)
		if eq > 0 {
			equipoID = &eq
		}
		componenteID = &id
	case "repuesto":
		eq, _ := s.EquipoRepo.ObtenerEquipoPadreDeRepuesto(id)
		if eq > 0 {
			equipoID = &eq
		}
		repuestoID = &id
	}

	return s.EventoRepo.CambiarEstadoActivo(
		intOrZero(equipoID), componenteID, repuestoID,
		nil, nil, estadoNuevo, motivo,
	)
}

// transicionarTiempo cierra la fila de tiempo abierta con el motivo indicado
// y abre una nueva con el nuevo estado. Solo se aplica si el tag del activo
// tiene contar_tiempo_activo=true.
func (s *ActivoService) transicionarTiempo(
	tipo string,
	id int,
	nuevoEstado string,
	motivoCierre string,
	ahora time.Time,
) {
	// Buscar tags del activo con contar_tiempo_activo=true
	tags, err := s.obtenerTagsConTiempoActivo(tipo, id)
	if err != nil {
		log.Printf("Error obteniendo tags con tiempo activo (%s=%d): %v", tipo, id, err)
		return
	}

	for _, tagID := range tags {
		abierta, err := s.TiempoRepo.BuscarAbierto(tagID, tipo, id)
		if err != nil || abierta == nil {
			continue
		}

		// Cerrar fila abierta
		if err := s.TiempoRepo.CerrarAbierto(abierta.ID, motivoCierre, ahora); err != nil {
			log.Printf("Error cerrando tiempo (tag=%d): %v", tagID, err)
			continue
		}

		// Abrir nueva fila
		valor := 0.0
		if _, err := s.TiempoRepo.AbrirNuevo(tagID, tipo, id, nuevoEstado, ahora, &valor); err != nil {
			log.Printf("Error abriendo tiempo (tag=%d): %v", tagID, err)
		}
	}
}

// obtenerTagsConTiempoActivo devuelve los IDs de tags asociados al activo
// que tienen contar_tiempo_activo=true.
func (s *ActivoService) obtenerTagsConTiempoActivo(tipo string, id int) ([]int, error) {
	var col string
	switch tipo {
	case "equipo":
		col = "equipo_id"
	case "componente":
		col = "componente_id"
	case "repuesto":
		col = "repuesto_id"
	default:
		return nil, nil
	}

	rows, err := s.EquipoRepo.DB.Query(`
        SELECT id FROM tags_descubiertos WHERE `+col+` = $1
    `, id)
	if err != nil {
		return nil, err
	}
	defer rows.Close()

	var ids []int
	for rows.Next() {
		var tid int
		if err := rows.Scan(&tid); err == nil {
			ids = append(ids, tid)
		}
	}
	return ids, rows.Err()
}

func intOrZero(p *int) int {
	if p == nil {
		return 0
	}
	return *p
}