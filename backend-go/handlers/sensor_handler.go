// handlers/sensor_handler.go
package handlers

import (
	"encoding/json"
	"log"
	"net/http"
	"strings"
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
		// ============================================
		// 1. VALIDAR TAG NAME
		// ============================================
		if reading.TagName == "" {
			continue
		}

		tagsValidos++

		// ============================================
		// 2. PROCESAR TIMESTAMP
		// ============================================
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

			elementName := reading.ElementName
			elementPath := reading.ElementPath

			if elementName == "" && strings.Contains(reading.TagName, ".") {
				parts := strings.SplitN(reading.TagName, ".", 2)
				elementName = parts[0]
			}

			// Si sigue vacío, usar el tag_name completo
			if elementName == "" {
				elementName = reading.TagName
			}

			if elementPath == "" {
				cleanElementName := strings.ReplaceAll(elementName, "\\", "\\\\")
				elementPath = "\\\\PEELPWVPIAP01NX\\\\BD El Porvenir\\\\" + cleanElementName
			}

			piServer := reading.PiServer
			if piServer == "" {
				piServer = "PEELPWVPIAP01NX"
			}
			databaseName := reading.Database
			if databaseName == "" {
				databaseName = " DB El Porvenir"
			}
			tag := &models.TagDescubierto{
				TagName:             reading.TagName,
				ElementName:         elementName,
				ElementPath:         elementPath,
				PiServer:            piServer,
				DatabaseName:        databaseName,
				RootElement:         reading.RootElement,
				Unidad:              reading.Unit,
				UltimoValor:         reading.Value,
				UltimaActualizacion: timestamp,
				Source:              reading.Source,
			}

			err := h.TagDescubiertoRepo.Upsert(tag)
			if err != nil {
				log.Printf("❌ Error guardando tag descubierto: %v", err)
			} else {
			}
		}

		// ============================================
		// 4. PROCESAR EN RULE ENGINE
		// ============================================
		h.RuleEngine.ProcessSensorData(reading, timestamp)
		procesados++
	}

	log.Printf("📊 Procesados: %d, Tags válidos: %d", procesados, tagsValidos)

	utils.SuccessJSON(w, http.StatusOK, map[string]interface{}{
		"mensaje":    "Batch procesado",
		"procesados": procesados,
	})
}
