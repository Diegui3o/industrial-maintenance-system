// services/alarma_service.go
package services

import (
	"fmt"
	"log"

	"backend/models"
	"backend/repository"
)

type AlarmaService struct {
	Repo       *repository.AlarmaRepository
	EquipoRepo *repository.EquipoRepository
}

func (s *AlarmaService) CrearAlarma(a *models.Alarma) error {
	severidadesValidas := map[string]bool{
		"baja": true, "media": true, "alta": true, "critica": true,
	}
	if !severidadesValidas[a.Severidad] {
		return fmt.Errorf("severidad no válida: %s", a.Severidad)
	}

	equipo, err := s.EquipoRepo.ObtenerEquipoPorID(a.EquipoID)
	if err != nil {
		return fmt.Errorf("equipo no encontrado: %w", err)
	}

	if a.Mensaje == "" {
		a.Mensaje = fmt.Sprintf("Alarma en equipo %s (%s)", equipo.Nombre, equipo.Codigo)
	}

	return s.Repo.Crear(a)
}

func (s *AlarmaService) GenerarAlarmaPorFallo(equipoID int, motivo string) {
	equipo, err := s.EquipoRepo.ObtenerEquipoPorID(equipoID)
	if err != nil {
		log.Printf("Error al buscar equipo para alarma: %v", err)
		return
	}

	if !equipo.Critico {
		return
	}

	alarma := &models.Alarma{
		EquipoID:  equipoID,
		Tipo:      "fallo_equipo",
		Mensaje:   fmt.Sprintf("Equipo crítico %s en fallo: %s", equipo.Nombre, motivo),
		Severidad: "alta",
	}

	if err := s.Repo.Crear(alarma); err != nil {
		log.Printf("Error generando alarma automática: %v", err)
	} else {
		log.Printf("🚨 Alarma generada para equipo crítico %s", equipo.Nombre)
	}
}

func (s *AlarmaService) CerrarAlarmasActivasPorEquipo(equipoID int) error {
	cerradas, err := s.Repo.CerrarAlarmasActivasPorEquipo(equipoID)
	if err != nil {
		return err
	}
	if cerradas > 0 {
		log.Printf("%d alarmas cerradas para equipo %d", cerradas, equipoID)
	}
	return nil
}

func (s *AlarmaService) ListarActivas() ([]models.Alarma, error) {
	return s.Repo.ListarActivas()
}

func (s *AlarmaService) ListarPorEquipo(equipoID int) ([]models.Alarma, error) {
	return s.Repo.ListarPorEquipo(equipoID)
}
func (s *AlarmaService) AtenderAlarma(id int) error {
	return s.Repo.Atender(id)
}
func (s *AlarmaService) CerrarAlarma(id int) error {
	return s.Repo.Cerrar(id)
}
