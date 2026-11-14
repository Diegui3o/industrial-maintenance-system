package services

import (
	"log"
	"time"

	"backend/models"
	"backend/repository"
)

type TiempoActivoService struct {
	Repo      *repository.TiempoActivoRepository
	ParadaSvc *ParadaService
}

func NewTiempoActivoService(
	repo *repository.TiempoActivoRepository,
	paradaSvc *ParadaService,
) *TiempoActivoService {
	return &TiempoActivoService{Repo: repo, ParadaSvc: paradaSvc}
}

func (s *TiempoActivoService) RegistrarLectura(
	tagID int,
	activoTipo string,
	activoID int,
	valor float64,
	quality string,
	timestamp time.Time,
	reportarInfo *models.ReportarParadaInfo,
) {
	log.Printf(
		"[DEBUG] RegistrarLectura: tagID=%d tipo=%s id=%d valor=%.3f quality=%s",
		tagID, activoTipo, activoID, valor, quality,
	)
	// 1. Determinar estado actual
	estadoActual := "inactivo"
	if quality == "Good" && valor > 0.0001 {
		estadoActual = "activo"
	}

	// 2. Buscar fila abierta
	abierta, err := s.Repo.BuscarAbierto(tagID, activoTipo, activoID)
	if err != nil {
		log.Printf("Error buscando tiempo abierto (tag=%d): %v", tagID, err)
		return
	}

	// 3. Detectar hueco de datos (>30 s) y cerrar con motivo 'sin_dato'
	if abierta != nil {
		transcurrido := timestamp.Sub(abierta.Desde)
		if transcurrido > 30*time.Second && abierta.Estado != "sin_dato" {
			// Cerrar la fila anterior en abierta.Desde + algo (o en abierta.Desde mismo si no hay más)
			// Esto se maneja mejor abajo.
		}
		_ = transcurrido
	}

	// 4. Si el estado no cambió, solo actualizar extremos
	if abierta != nil && abierta.Estado == estadoActual {
		_ = s.Repo.ActualizarValoresExtremos(abierta.ID, valor)
		return
	}

	// 5. Cerrar la fila anterior si existía
	if abierta != nil {
		// Si el timestamp de la lectura es anterior o igual al desde de la fila,
		// estamos ante un evento desordenado. Ignorarlo para no crear filas espurias.
		if !timestamp.After(abierta.Desde) {
			log.Printf(
				"Evento desordenado ignorado: tag=%d ts=%v desde_fila=%v",
				tagID, timestamp, abierta.Desde,
			)
			return
		}

		if abierta.Estado == "inactivo" && reportarInfo != nil && reportarInfo.Reportar {
			duracionSegundos := int(timestamp.Sub(abierta.Desde).Seconds())
			minDur := reportarInfo.MinDuracionSegundos
			if minDur <= 0 {
				minDur = 1200 // 20 minutos por defecto si no se especifica
			}

			if duracionSegundos >= minDur {
				duracionMinutos := duracionSegundos / 60
				if s.ParadaSvc != nil {
					if err := s.ParadaSvc.RegistrarParada(
						reportarInfo.EquipoID,
						tagID,
						reportarInfo.ComponenteID,
						reportarInfo.RepuestoID,
						abierta.Desde,
						timestamp,
						duracionMinutos,
					); err != nil {
						log.Printf(
							"Error registrando parada (tag=%d, equipo=%d): %v",
							tagID, reportarInfo.EquipoID, err,
						)
					}
				}
			} else {
				log.Printf(
					"Parada no reportada (duración %ds < mínimo %ds): tag=%d",
					duracionSegundos, minDur, tagID,
				)
			}
		}

		// --- 5.2 Cerrar la fila en la base ---
		if err := s.Repo.CerrarAbierto(abierta.ID, "cambio_estado", timestamp); err != nil {
			log.Printf("Error cerrando tiempo abierto (id=%d): %v", abierta.ID, err)
		}
	}

	// 6. Abrir nueva fila
	valorPtr := valor
	if _, err := s.Repo.AbrirNuevo(
		tagID, activoTipo, activoID, estadoActual, timestamp, &valorPtr,
	); err != nil {
		log.Printf("Error abriendo nuevo tiempo (tag=%d): %v", tagID, err)
	}
}

// CerrarTodosLosAbiertos se llama al arrancar el backend.
func (s *TiempoActivoService) CerrarTodosLosAbiertos() {
	filas, err := s.Repo.CerrarTodosLosAbiertos("reinicio_backend")
	if err != nil {
		log.Printf("Error cerrando tiempos huérfanos: %v", err)
		return
	}
	if filas > 0 {
		log.Printf("🕒 Cerrados %d tiempos huérfanos al arrancar", filas)
	}
}

// ResumenPorGuardia devuelve los agregados por guardia.
func (s *TiempoActivoService) ResumenPorGuardia(
	tagID int,
	desde, hasta time.Time,
) ([]models.ResumenGuardia, error) {
	return s.Repo.ResumenPorTag(tagID, desde, hasta)
}

// ResumenPorDia agrupa guardias por día operativo (07:00-07:00).
func (s *TiempoActivoService) ResumenPorDia(
	tagID int,
	desde, hasta time.Time,
) ([]models.ResumenDia, error) {
	guardias, err := s.Repo.ResumenPorTag(tagID, desde, hasta)
	if err != nil {
		return nil, err
	}

	// Agrupar por fecha_ref
	porFecha := map[string]*models.ResumenDia{}
	orden := []string{}

	for _, g := range guardias {
		if _, ok := porFecha[g.FechaRef]; !ok {
			porFecha[g.FechaRef] = &models.ResumenDia{
				FechaOperativa: g.FechaRef,
				PeriodoInicio:  g.GuardiaInicio,
				PeriodoFin:     g.GuardiaFin,
				Guardias:       []models.ResumenGuardia{},
			}
			orden = append(orden, g.FechaRef)
		}
		d := porFecha[g.FechaRef]
		d.ActivoSegundos += g.ActivoSegundos
		d.InactivoSegundos += g.InactivoSegundos
		d.SinDatoSegundos += g.SinDatoSegundos
		d.Guardias = append(d.Guardias, g)

		// Periodo del día va de 07:00 del día a 07:00 del siguiente
		if g.Tipo == "dia" && g.GuardiaInicio.Before(d.PeriodoInicio) {
			d.PeriodoInicio = g.GuardiaInicio
		}
		if g.Tipo == "noche" && g.GuardiaFin.After(d.PeriodoFin) {
			d.PeriodoFin = g.GuardiaFin
		}
	}

	var res []models.ResumenDia
	for _, fecha := range orden {
		d := porFecha[fecha]
		d.TotalSegundos = d.ActivoSegundos + d.InactivoSegundos + d.SinDatoSegundos
		res = append(res, *d)
	}
	return res, nil
}

func (s *TiempoActivoService) Transicionar(
	tagID int,
	activoTipo string,
	activoID int,
	nuevoEstado string,
	motivoCierre string,
	valor float64,
	timestamp time.Time,
) {
	abierta, err := s.Repo.BuscarAbierto(tagID, activoTipo, activoID)
	if err != nil {
		log.Printf("Error buscando tiempo abierto para transición (tag=%d): %v", tagID, err)
		return
	}

	// Si hay fila abierta:
	if abierta != nil {
		// Ignorar timestamps desordenados
		if !timestamp.After(abierta.Desde) {
			log.Printf(
				"Transición ignorada (timestamp antiguo): tag=%d ts=%v desde=%v",
				tagID, timestamp, abierta.Desde,
			)
			return
		}

		// Si el estado no cambió, solo actualizar extremos y salir
		if abierta.Estado == nuevoEstado {
			_ = s.Repo.ActualizarValoresExtremos(abierta.ID, valor)
			return
		}

		// Ajustar motivo específico según la transición
		if abierta.Estado == "fallo" && nuevoEstado == "activo" {
			motivoCierre = "recuperado"
		} else if abierta.Estado == "mantenimiento" && nuevoEstado == "fallo" {
			motivoCierre = "salida_por_falla"
		}

		// Cerrar la fila anterior
		if err := s.Repo.CerrarAbierto(abierta.ID, motivoCierre, timestamp); err != nil {
			log.Printf("Error cerrando tiempo (id=%d): %v", abierta.ID, err)
		}
	}

	// Abrir nueva fila
	valorPtr := valor
	log.Printf("[DEBUG] Llamando AbrirNuevo: tagID=%d tipo=%s id=%d estado=%s",
		tagID, activoTipo, activoID, nuevoEstado)
	if _, err := s.Repo.AbrirNuevo(
		tagID, activoTipo, activoID, nuevoEstado, timestamp, &valorPtr,
	); err != nil {
		log.Printf("[DEBUG] ERROR AbrirNuevo: %v", err)
	} else {
		log.Printf("[DEBUG] AbrirNuevo OK")
	}
}
