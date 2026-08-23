// handlers/sensor_handler.go
package handlers

import (
	"encoding/json"
	"log"
	"net/http"
	"time"

	"backend/engine"
	"backend/models"
	"backend/repository"
	"backend/utils"
)

type SensorHandler struct {
	RuleEngine         *engine.RuleEngine
	TagDescubiertoRepo *repository.TagDescubiertoRepository
}

func NewSensorHandler(
	ruleEngine *engine.RuleEngine,
	tagDescubiertoRepo *repository.TagDescubiertoRepository,
) *SensorHandler {
	return &SensorHandler{
		RuleEngine:         ruleEngine,
		TagDescubiertoRepo: tagDescubiertoRepo,
	}
}

// RecibirBatch: POST /api/v1/eventos/sensor
func (h *SensorHandler) RecibirBatch(w http.ResponseWriter, r *http.Request) {
	var batch []models.SensorReading

	if err := json.NewDecoder(r.Body).Decode(&batch); err != nil {
		log.Printf("❌ Error decodificando JSON: %v", err)
		utils.ErrorJSON(w, http.StatusBadRequest, "JSON inválido")
		return
	}

	log.Printf("📥 Recibido batch con %d lecturas", len(batch))

	procesados := 0
	tagsValidos := 0

	for _, reading := range batch {

		if reading.TagName == "" {
			continue
		}

		tagsValidos++

		var timestamp time.Time
		if reading.Timestamp != "" {
			parsed, err := time.Parse(time.RFC3339, reading.Timestamp)
			if err != nil {
				parsed, err = time.Parse("2006-01-02T15:04:05Z", reading.Timestamp)
				if err != nil {
					timestamp = time.Now()
				} else {
					timestamp = parsed
				}
			} else {
				timestamp = parsed
			}
		} else {
			timestamp = time.Now()
		}

		if reading.EquipmentID <= 0 {
			tag := &models.TagDescubierto{
				TagName:             reading.TagName,
				ElementName:         reading.ElementName,
				ElementPath:         reading.ElementPath,
				PiServer:            reading.PiServer,
				DatabaseName:        reading.Database,
				RootElement:         reading.RootElement,
				Unidad:              reading.Unit,
				UltimoValor:         reading.Value,
				UltimaActualizacion: timestamp,
				Source:              reading.Source,
				RutaCompleta:        reading.RutaCompleta,
				NivelJerarquico:     reading.NivelJerarquico,
				ElementoPadre:       reading.ElementoPadre,
				PathJerarquico:      reading.PathJerarquico,
				ElementosAncestros:  reading.ElementosAncestros,
			}

			log.Printf("📌 Guardando tag: %s | Ruta: %s | Nivel: %d",
				tag.TagName, tag.RutaCompleta, tag.NivelJerarquico)

			err := h.TagDescubiertoRepo.Upsert(tag)
			if err != nil {
				log.Printf("❌ Error guardando tag descubierto: %v", err)
			} else {
				log.Printf("✅ Tag descubierto guardado: %s (Elemento: %s)",
					reading.TagName, reading.ElementName)
			}

			continue
		}
		h.RuleEngine.ProcessSensorData(reading, timestamp)
		procesados++
	}

	log.Printf("📊 Procesados: %d, Tags válidos: %d", procesados, tagsValidos)

	utils.SuccessJSON(w, http.StatusOK, map[string]interface{}{
		"mensaje":    "Batch procesado",
		"procesados": procesados,
	})
}
