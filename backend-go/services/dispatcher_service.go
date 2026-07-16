package services

import (
	"bytes"
	"log"
	"text/template"
	"time"

	"backend/models"
	"backend/repository"
)

type DispatcherService struct {
	NotifRepo  *repository.NotificacionRepository
	EquipoRepo *repository.EquipoRepository
	WhatsApp   interface{}
	Email      interface{}
}

type NotificacionData struct {
	EquipoNombre string
	EquipoCodigo string
	Area         string
	Estado       string
	Severidad    string
	Motivo       string
	Fecha        string
}

func NewDispatcherService(notifRepo *repository.NotificacionRepository, equipoRepo *repository.EquipoRepository) *DispatcherService {
	return &DispatcherService{
		NotifRepo:  notifRepo,
		EquipoRepo: equipoRepo,
	}
}

func (d *DispatcherService) Dispatch(equipoID int, tipoEvento, severidad, motivo string) {
	// 1. Obtener datos del equipo
	equipo, err := d.EquipoRepo.ObtenerEquipoPorID(equipoID)
	if err != nil {
		log.Printf("Error buscando equipo para notificación: %v", err)
		return
	}

	// 2. Buscar reglas que apliquen
	reglas, err := d.NotifRepo.BuscarReglas(equipoID, equipo.Area, severidad, tipoEvento)
	if err != nil || len(reglas) == 0 {
		log.Printf("Sin reglas de notificación para equipo %s, evento %s, severidad %s", equipo.Nombre, tipoEvento, severidad)
		return
	}

	// 3. Preparar datos para plantillas
	data := NotificacionData{
		EquipoNombre: equipo.Nombre,
		EquipoCodigo: equipo.Codigo,
		Area:         equipo.Area,
		Estado:       tipoEvento,
		Severidad:    severidad,
		Motivo:       motivo,
		Fecha:        time.Now().Format("02/01/2006 15:04"),
	}

	// 4. Procesar cada regla
	for _, regla := range reglas {
		d.procesarRegla(regla, data)
	}
}

func (d *DispatcherService) procesarRegla(regla models.ReglaNotificacion, data NotificacionData) {
	// Obtener plantilla
	plantilla, err := d.NotifRepo.ObtenerPlantilla(regla.PlantillaID)
	if err != nil {
		log.Printf("Error obteniendo plantilla %d: %v", regla.PlantillaID, err)
		return
	}

	// Renderizar mensaje
	mensaje := d.renderizar(plantilla.Cuerpo, data)

	// Obtener destinatarios del grupo
	destinatarios, err := d.NotifRepo.ListarDestinatariosPorGrupo(regla.GrupoID)
	if err != nil {
		log.Printf("Error obteniendo destinatarios: %v", err)
		return
	}

	// Enviar a cada destinatario
	for _, dest := range destinatarios {
		log.Printf("📢 Notificación: [%s] %s -> %s", dest.Canal, dest.Nombre, mensaje[:50])

		// Registrar en cola (por ahora solo registra, no envía)
		d.NotifRepo.RegistrarEnvio(regla.ID, dest.ID, dest.Canal, dest.Destino, mensaje, "pendiente", "")
	}
}

func (d *DispatcherService) renderizar(plantilla string, data NotificacionData) string {
	t, err := template.New("msg").Parse(plantilla)
	if err != nil {
		return plantilla
	}
	var buf bytes.Buffer
	t.Execute(&buf, data)
	return buf.String()
}
