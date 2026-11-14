package services

import (
	"fmt"
	"log"
	"time"

	"backend/models"
	"backend/repository"
)

type ParadaService struct {
	Repo               *repository.ParadaRepository
	EquipoRepo         *repository.EquipoRepository
	TagDescubiertoRepo *repository.TagDescubiertoRepository
	// Si tienes repos para componentes/repuestos, añádelos aquí.
	// Si no, se resuelven por SQL directo en los métodos de snapshot.
}

func NewParadaService(
	repo *repository.ParadaRepository,
	equipoRepo *repository.EquipoRepository,
	tagDescubiertoRepo *repository.TagDescubiertoRepository,
) *ParadaService {
	return &ParadaService{
		Repo:               repo,
		EquipoRepo:         equipoRepo,
		TagDescubiertoRepo: tagDescubiertoRepo,
	}
}

// RegistrarParada crea una nueva parada con los snapshots resueltos.
// Solo debe llamarse cuando la duración ya superó el mínimo configurado.
func (s *ParadaService) RegistrarParada(
	equipoID int,
	tagID int,
	componenteID *int,
	repuestoID *int,
	inicio time.Time,
	fin time.Time,
	duracionMinutos int,
) error {
	if equipoID <= 0 {
		log.Printf("ParadaService: equipoID inválido (%d), se ignora", equipoID)
		return nil
	}

	p := &models.Parada{
		EquipoID:        equipoID,
		Inicio:          inicio,
		Fin:             fin,
		DuracionMinutos: duracionMinutos,
	}

	if tagID > 0 {
		p.TagID = &tagID
	}
	if componenteID != nil && *componenteID > 0 {
		p.ComponenteID = componenteID
	}
	if repuestoID != nil && *repuestoID > 0 {
		p.RepuestoID = repuestoID
	}

	// Resolver snapshots (proceso, subproceso, componente, repuesto, tag)
	s.resolverSnapshots(p)

	if err := s.Repo.Crear(p); err != nil {
		log.Printf("ParadaService: error creando parada: %v", err)
		return err
	}

	log.Printf(
		"🛑 Parada registrada: id=%d equipo=%d tag=%d duracion=%dmin inicio=%s fin=%s",
		p.ID, p.EquipoID, tagID, p.DuracionMinutos,
		p.Inicio.Format(time.RFC3339), p.Fin.Format(time.RFC3339),
	)

	return nil
}

func (s *ParadaService) resolverSnapshots(p *models.Parada) {
	// Tag
	if p.TagID != nil {
		tag, err := s.TagDescubiertoRepo.GetByID(*p.TagID)
		if err == nil && tag != nil {
			p.TagNombre = tag.TagName
		}
	}

	// Equipo nombre (NUEVO)
	if p.EquipoID > 0 {
		equipo, err := s.EquipoRepo.ObtenerEquipoPorID(p.EquipoID)
		if err == nil && equipo != nil {
			p.EquipoNombre = equipo.Nombre
		}
	}

	// Equipo → proceso/subproceso
	proceso, subproceso := s.obtenerProcesoYSubproceso(p.EquipoID)
	p.ProcesoNombre = proceso
	p.SubprocesoNombre = subproceso

	// Componente
	if p.ComponenteID != nil {
		nombre := s.obtenerNombreComponente(*p.ComponenteID)
		p.ComponenteNombre = nombre
	}

	// Repuesto
	if p.RepuestoID != nil {
		nombre := s.obtenerNombreRepuesto(*p.RepuestoID)
		p.RepuestoNombre = nombre
	}
}

// obtenerProcesoYSubproceso devuelve (proceso, subproceso) del equipo.
func (s *ParadaService) obtenerProcesoYSubproceso(equipoID int) (string, string) {
	var proceso, subproceso string
	err := s.EquipoRepo.DB.QueryRow(`
        SELECT COALESCE(p.nombre, ''), COALESCE(sp.nombre, '')
        FROM equipos e
        LEFT JOIN planta_equipos pe ON pe.equipo_id = e.id
        LEFT JOIN subprocesos_planta sp ON sp.id = pe.subproceso_id
        LEFT JOIN procesos_planta p ON p.id = sp.proceso_id
        WHERE e.id = $1
        LIMIT 1
    `, equipoID).Scan(&proceso, &subproceso)

	if err != nil {
		log.Printf("ParadaService: error resolviendo proceso/subproceso (%d): %v", equipoID, err)
		return "", ""
	}
	return proceso, subproceso
}

// obtenerNombreComponente devuelve el nombre del componente.
func (s *ParadaService) obtenerNombreComponente(id int) string {
	var nombre string
	err := s.EquipoRepo.DB.QueryRow(
		`SELECT COALESCE(nombre, '') FROM componentes_equipo WHERE id = $1`, id,
	).Scan(&nombre)
	if err != nil {
		log.Printf("ParadaService: error resolviendo componente (%d): %v", id, err)
		return ""
	}
	return nombre
}

// obtenerNombreRepuesto devuelve el nombre del repuesto.
func (s *ParadaService) obtenerNombreRepuesto(id int) string {
	var nombre string
	err := s.EquipoRepo.DB.QueryRow(
		`SELECT COALESCE(nombre, '') FROM repuestos WHERE id = $1`, id,
	).Scan(&nombre)
	if err != nil {
		log.Printf("ParadaService: error resolviendo repuesto (%d): %v", id, err)
		return ""
	}
	return nombre
}

// ListarParadas devuelve las paradas en un rango de fechas.
func (s *ParadaService) ListarParadas(
	desde, hasta time.Time,
	equipoID *int,
) ([]models.Parada, error) {
	return s.Repo.Listar(desde, hasta, equipoID)
}

// ActualizarResponsable actualiza personal, área y motivo.
func (s *ParadaService) ActualizarResponsable(
	id int,
	personal, area, motivo string,
) error {
	p, err := s.Repo.ObtenerPorID(id)
	if err != nil {
		return fmt.Errorf("error consultando parada: %w", err)
	}
	if p == nil {
		return fmt.Errorf("parada %d no encontrada", id)
	}
	return s.Repo.ActualizarResponsable(id, personal, area, motivo)
}
