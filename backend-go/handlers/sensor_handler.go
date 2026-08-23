// handlers/sensor_handler.go
package handlers

import (
	"encoding/json"
	"log"
	"net/http"
	"time"

	"backend/engine"
	"backend/models"
	"backend/utils"
)

type SensorHandler struct {
	RuleEngine *engine.RuleEngine
}

func NewSensorHandler(
	ruleEngine *engine.RuleEngine,
) *SensorHandler {
	return &SensorHandler{
		RuleEngine: ruleEngine,
	}
}

func (h *SensorHandler) RecibirBatch(w http.ResponseWriter, r *http.Request) {
	var batch []models.SensorReading

	if err := json.NewDecoder(r.Body).Decode(&batch); err != nil {
		log.Printf("❌ Error decodificando JSON: %v", err)
		utils.ErrorJSON(w, http.StatusBadRequest, "JSON inválido")
		return
	}

	log.Printf("📥 Recibido batch con %d lecturas", len(batch))

	if len(batch) == 0 {
		utils.SuccessJSON(w, http.StatusOK, map[string]interface{}{
			"mensaje":    "Batch vacío",
			"procesados": 0,
		})
		return
	}

	first := batch[0]

	log.Printf(
		"🔎 PRIMERA LECTURA | Tag=%s | Elemento=%s | Root=%s | ElementPath=%s | Ruta=%s | Nivel=%d | Padre=%s | PIPoint=%s",
		first.TagName,
		first.ElementName,
		first.RootElement,
		first.ElementPath,
		first.RutaCompleta,
		first.NivelJerarquico,
		first.ElementoPadre,
		first.PIPointName,
	)

	last := batch[len(batch)-1]

	log.Printf(
		"🔎 ÚLTIMA LECTURA | Tag=%s | Elemento=%s | Root=%s | ElementPath=%s | Ruta=%s | Nivel=%d | Padre=%s | PIPoint=%s",
		last.TagName,
		last.ElementName,
		last.RootElement,
		last.ElementPath,
		last.RutaCompleta,
		last.NivelJerarquico,
		last.ElementoPadre,
		last.PIPointName,
	)

	procesados := 0
	tagsValidos := 0
	errores := 0

	for _, reading := range batch {

		if reading.TagName == "" {
			log.Printf("⚠️ Lectura ignorada: TagName vacío")
			continue
		}

		tagsValidos++

		timestamp := time.Now()

		if reading.Timestamp != "" {
			parsed, err := time.Parse(time.RFC3339, reading.Timestamp)

			if err != nil {
				parsed, err = time.Parse(
					"2006-01-02T15:04:05Z",
					reading.Timestamp,
				)

				if err == nil {
					timestamp = parsed
				} else {
					log.Printf(
						"⚠️ Timestamp inválido para tag %s: %s. Se usará hora actual.",
						reading.TagName,
						reading.Timestamp,
					)
				}
			} else {
				timestamp = parsed
			}
		}

		// ============================================
		// TODO EL PROCESAMIENTO PASA POR RULE ENGINE
		// ============================================

		h.RuleEngine.ProcessSensorData(
			reading,
			timestamp,
		)

		procesados++
	}

	log.Printf(
		"📊 Batch finalizado | Procesados=%d | Tags válidos=%d | Errores=%d",
		procesados,
		tagsValidos,
		errores,
	)

	utils.SuccessJSON(w, http.StatusOK, map[string]interface{}{
		"mensaje":    "Batch procesado",
		"procesados": procesados,
		"validos":    tagsValidos,
		"errores":    errores,
	})
}
