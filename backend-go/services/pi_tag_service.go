// services/pi_tag_service.go
package services

import (
	"fmt"
	"log"

	"backend/models"
	"backend/repository"
)

type PITagService struct {
	Repo       *repository.PITagRepository
	EquipoRepo *repository.EquipoRepository
}

func NewPITagService(
	repo *repository.PITagRepository,
	equipoRepo *repository.EquipoRepository,
) *PITagService {
	return &PITagService{
		Repo:       repo,
		EquipoRepo: equipoRepo,
	}
}

// GetTagsSinEquipo - Obtiene tags sin equipo
func (s *PITagService) GetTagsSinEquipo() ([]models.PITagDiscovery, error) {
	return s.Repo.GetTagsSinEquipo()
}

// GetSugerenciasAgrupacion - Obtiene sugerencias de agrupación
func (s *PITagService) GetSugerenciasAgrupacion() ([]models.PITagSugerencia, error) {
	return s.Repo.GetSugerenciasAgrupacion()
}

// AsignarTagsEquipo - Asigna tags a un equipo (con validaciones)
func (s *PITagService) AsignarTagsEquipo(asignacion models.PITagAsignacion) error {
	// Validar que el equipo existe
	equipo, err := s.EquipoRepo.ObtenerEquipoPorID(asignacion.EquipoID)
	if err != nil {
		return fmt.Errorf("equipo no encontrado: %w", err)
	}
	if equipo == nil {
		return fmt.Errorf("equipo ID %d no existe", asignacion.EquipoID)
	}

	if len(asignacion.Tags) == 0 {
		return fmt.Errorf("no hay tags para asignar")
	}

	log.Printf("📌 Asignando %d tags al equipo %d (%s)",
		len(asignacion.Tags), asignacion.EquipoID, equipo.Nombre)

	// Asignar tags
	err = s.Repo.AsignarTagsEquipo(asignacion.EquipoID, asignacion.Tags)
	if err != nil {
		return fmt.Errorf("error asignando tags: %w", err)
	}

	// Registrar en log
	log.Printf("✅ Tags asignados correctamente al equipo %d", asignacion.EquipoID)

	return nil
}

// CrearYAsignarTags - Crea un equipo y le asigna tags
func (s *PITagService) CrearYAsignarTags(
	nombreEquipo string,
	tags []string,
	codigo string,
	area string,
) (int, error) {
	// 1. Crear equipo
	equipo := &models.Equipo{
		Codigo:       codigo,
		Nombre:       nombreEquipo,
		Area:         area,
		EstadoEquipo: "activo",
		Critico:      false,
	}

	err := s.EquipoRepo.CrearEquipos(equipo)
	if err != nil {
		return 0, fmt.Errorf("error creando equipo: %w", err)
	}

	log.Printf("✅ Equipo creado: ID=%d, Nombre=%s", equipo.ID, equipo.Nombre)

	// 2. Asignar tags
	asignacion := models.PITagAsignacion{
		EquipoID: equipo.ID,
		Tags:     tags,
	}

	err = s.AsignarTagsEquipo(asignacion)
	if err != nil {
		return equipo.ID, fmt.Errorf("equipo creado pero error asignando tags: %w", err)
	}

	return equipo.ID, nil
}
