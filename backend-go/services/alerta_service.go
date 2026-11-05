package services

import (
	"fmt"
	"log"

	"backend/models"
	"backend/repository"
)

type AlertaService struct {
	Repo *repository.AlertaRepository
}

func NewAlertaService(repo *repository.AlertaRepository) *AlertaService {
	return &AlertaService{Repo: repo}
}

func (s *AlertaService) GenerarAlertaPolimorfica(
	equipoID int,
	componenteID *int,
	repuestoID *int,
	tagID *int,
	parametro *string,
	valorDetectado *float64,
	umbralMin, umbralMax *float64,
	motivo string,
) {
	activoTipo := "equipo"
	if componenteID != nil && *componenteID > 0 {
		activoTipo = "componente"
	} else if repuestoID != nil && *repuestoID > 0 {
		activoTipo = "repuesto"
	}

	existe, err := s.Repo.ExisteAlertaActiva(equipoID, componenteID, repuestoID, tagID, parametro)
	if err != nil {
		log.Printf("Error comprobando alerta activa: %v", err)
	}
	if existe {
		log.Printf("ℹ️ Alerta ya activa (no se duplica): activo=%s equipo=%d", activoTipo, equipoID)
		return
	}

	alerta := &models.Alerta{
		EquipoID:       intPtrOrNil(equipoID),
		ComponenteID:   componenteID,
		RepuestoID:     repuestoID,
		TagID:          tagID,
		Parametro:      parametro,
		ActivoTipo:     activoTipo,
		Mensaje:        fmt.Sprintf("[Alerta] %s", motivo),
		Severidad:      "media",
		Estado:         "activa",
		ValorDetectado: valorDetectado,
		UmbralMin:      umbralMin,
		UmbralMax:      umbralMax,
	}

	if err := s.Repo.Crear(alerta); err != nil {
		log.Printf("Error creando alerta: %v", err)
	} else {
		paramStr := ""
		if parametro != nil {
			paramStr = *parametro
		}
		log.Printf("🟡 Alerta creada: activo=%s equipo=%d parametro=%s", activoTipo, equipoID, paramStr)
	}
}

func intPtrOrNil(v int) *int {
	if v <= 0 {
		return nil
	}
	return &v
}