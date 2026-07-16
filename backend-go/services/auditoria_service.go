// services/auditoria_service.go
package services

import (
	"fmt"
	"log"

	"backend/models"
	"backend/repository"
)

type AuditoriaService struct {
	repo *repository.AuditoriaRepository
}

func NewAuditoriaService(repo *repository.AuditoriaRepository) *AuditoriaService {
	return &AuditoriaService{repo: repo}
}

func (s *AuditoriaService) RegistrarCambioEstado(usuarioID *int, equipoID int, estadoAnterior, estadoNuevo, motivo string) {
	detalle := fmt.Sprintf(
		"Equipo ID %d: estado cambió de '%s' a '%s'. Motivo: %s",
		equipoID, estadoAnterior, estadoNuevo, motivo,
	)

	if err := s.repo.Registrar(usuarioID, "equipos", "CAMBIO_ESTADO", detalle); err != nil {
		log.Printf("Error registrando auditoría: %v", err)
	}
}

func (s *AuditoriaService) RegistrarCreacionEquipo(usuarioID *int, equipoID int, nombre, codigo string) {
	detalle := fmt.Sprintf(
		"Equipo creado: ID %d, Nombre: %s, Código: %s",
		equipoID, nombre, codigo,
	)

	if err := s.repo.Registrar(usuarioID, "equipos", "CREACION", detalle); err != nil {
		log.Printf("Error registrando auditoría: %v", err)
	}
}

func (s *AuditoriaService) RegistrarActualizacionEquipo(usuarioID *int, equipoID int, camposModificados string) {
	detalle := fmt.Sprintf(
		"Equipo ID %d modificado. Campos: %s",
		equipoID, camposModificados,
	)

	if err := s.repo.Registrar(usuarioID, "equipos", "ACTUALIZACION", detalle); err != nil {
		log.Printf("Error registrando auditoría: %v", err)
	}
}

func (s *AuditoriaService) ListarAuditoria() ([]models.Auditoria, error) {
	return s.repo.ListarUltimas()
}

func (s *AuditoriaService) ListarAuditoriaPorTabla(tabla string) ([]models.Auditoria, error) {
	return s.repo.ListarPorTabla(tabla)
}
