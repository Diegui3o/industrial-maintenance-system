// handlers/sensor_handler.go
package handlers

import (
	"encoding/json"
	"net/http"

	"backend/engine"
	"backend/models"
	"backend/utils"
)

type SensorHandler struct {
	RuleEngine *engine.RuleEngine
}

func NewSensorHandler(ruleEngine *engine.RuleEngine) *SensorHandler {
	return &SensorHandler{RuleEngine: ruleEngine}
}

// RecibirBatch: POST /api/v1/eventos/sensor
func (h *SensorHandler) RecibirBatch(w http.ResponseWriter, r *http.Request) {
	var batch []models.SensorReading

	if err := json.NewDecoder(r.Body).Decode(&batch); err != nil {
		utils.ErrorJSON(w, http.StatusBadRequest, "JSON inválido")
		return
	}

	procesados := 0
	for _, reading := range batch {
		h.RuleEngine.ProcessSensorData(
			reading.EquipmentID,
			reading.TagName,
			reading.Value,
			reading.Unit,
		)
		procesados++
	}

	utils.SuccessJSON(w, http.StatusOK, map[string]interface{}{
		"mensaje":    "Batch procesado",
		"procesados": procesados,
	})
}
