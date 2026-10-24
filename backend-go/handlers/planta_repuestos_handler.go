package handlers

import (
    "encoding/json"
    "net/http"
    "strconv"
    "strings"

    "backend/models"
    "backend/utils"

    "github.com/gorilla/mux"
)

func (h *EstructuraPlantaHandler) GetRepuestos(w http.ResponseWriter, r *http.Request) {
    repuestos, err := h.Service.ListarRepuestos()
    if err != nil {
        utils.ErrorJSON(w, http.StatusInternalServerError, err.Error())
        return
    }
    if repuestos == nil {
        repuestos = []models.Repuesto{}
    }
    utils.SuccessJSON(w, http.StatusOK, repuestos)
}

func (h *EstructuraPlantaHandler) PostRepuesto(w http.ResponseWriter, r *http.Request) {
    var rep models.Repuesto
    if err := json.NewDecoder(r.Body).Decode(&rep); err != nil {
        utils.ErrorJSON(w, http.StatusBadRequest, "JSON invalido")
        return
    }
    if strings.TrimSpace(rep.Nombre) == "" {
        utils.ErrorJSON(w, http.StatusBadRequest, "nombre no puede estar vacio")
        return
    }
    if err := h.Service.CrearRepuesto(&rep); err != nil {
        utils.ErrorJSON(w, http.StatusInternalServerError, err.Error())
        return
    }
    utils.SuccessJSON(w, http.StatusCreated, rep)
}

func (h *EstructuraPlantaHandler) PutRepuesto(w http.ResponseWriter, r *http.Request) {
    id, err := strconv.Atoi(mux.Vars(r)["id"])
    if err != nil {
        utils.ErrorJSON(w, http.StatusBadRequest, "id invalido")
        return
    }

    var rep models.RepuestoActualizacion
    if err := json.NewDecoder(r.Body).Decode(&rep); err != nil {
        utils.ErrorJSON(w, http.StatusBadRequest, "JSON invalido")
        return
    }

    if rep.Nombre != nil && strings.TrimSpace(*rep.Nombre) == "" {
        utils.ErrorJSON(w, http.StatusBadRequest, "nombre no puede estar vacio")
        return
    }
    if rep.StockActual != nil && *rep.StockActual < 0 {
        utils.ErrorJSON(w, http.StatusBadRequest, "stock_actual no puede ser negativo")
        return
    }
    if rep.StockMinimo != nil && *rep.StockMinimo < 0 {
        utils.ErrorJSON(w, http.StatusBadRequest, "stock_minimo no puede ser negativo")
        return
    }

    // Auditoría: leer headers opcionales
    tipoOrigen := r.Header.Get("X-Origen")
    if tipoOrigen == "" {
        tipoOrigen = "MANUAL"
    }
    var usuarioID *int
    if uidStr := r.Header.Get("X-Usuario-ID"); uidStr != "" {
        if uid, err := strconv.Atoi(uidStr); err == nil {
            usuarioID = &uid
        }
    }
    conectorID := r.Header.Get("X-Conector-ID")
    if conectorID == "" {
        conectorID = ""
    }
    comentario := r.Header.Get("X-Comentario")
    if comentario == "" {
        comentario = ""
    }

    if err := h.Service.ActualizarRepuesto(id, rep, tipoOrigen, usuarioID, &conectorID, &comentario); err != nil {
        utils.ErrorJSON(w, http.StatusInternalServerError, err.Error())
        return
    }

    utils.SuccessJSON(w, http.StatusOK, map[string]interface{}{
        "mensaje": "Repuesto actualizado correctamente",
        "id":      id,
    })
}

func (h *EstructuraPlantaHandler) DeleteRepuesto(w http.ResponseWriter, r *http.Request) {
    id, err := strconv.Atoi(mux.Vars(r)["id"])
    if err != nil {
        utils.ErrorJSON(w, http.StatusBadRequest, "id invalido")
        return
    }
    if err := h.Service.EliminarRepuestoSeguro(id); err != nil {
        if strings.Contains(err.Error(), "referencias") {
            utils.ErrorJSON(w, http.StatusConflict, err.Error())
        } else {
            utils.ErrorJSON(w, http.StatusInternalServerError, err.Error())
        }
        return
    }
    utils.SuccessJSON(w, http.StatusOK, map[string]interface{}{
        "mensaje": "Repuesto eliminado correctamente",
        "id":      id,
    })
}

// ==================== COMPATIBILIDAD ====================

func (h *EstructuraPlantaHandler) PostCompatibilidadEquipo(w http.ResponseWriter, r *http.Request) {
    repuestoID, err := strconv.Atoi(mux.Vars(r)["id"])
    if err != nil {
        utils.ErrorJSON(w, http.StatusBadRequest, "id repuesto invalido")
        return
    }
    var body struct {
        EquipoID int `json:"equipo_id"`
    }
    if err := json.NewDecoder(r.Body).Decode(&body); err != nil || body.EquipoID == 0 {
        utils.ErrorJSON(w, http.StatusBadRequest, "equipo_id requerido")
        return
    }
    if err := h.Service.AgregarCompatibilidadEquipo(repuestoID, body.EquipoID); err != nil {
        utils.ErrorJSON(w, http.StatusInternalServerError, err.Error())
        return
    }
    utils.SuccessJSON(w, http.StatusCreated, map[string]interface{}{
        "mensaje":      "Compatibilidad agregada",
        "repuesto_id":  repuestoID,
        "equipo_id":    body.EquipoID,
    })
}

func (h *EstructuraPlantaHandler) GetCompatibilidadEquipo(w http.ResponseWriter, r *http.Request) {
    repuestoID, err := strconv.Atoi(mux.Vars(r)["id"])
    if err != nil {
        utils.ErrorJSON(w, http.StatusBadRequest, "id repuesto invalido")
        return
    }
    equipos, err := h.Service.ListarEquiposCompatibles(repuestoID)
    if err != nil {
        utils.ErrorJSON(w, http.StatusInternalServerError, err.Error())
        return
    }
    if equipos == nil {
        equipos = []int{}
    }
    utils.SuccessJSON(w, http.StatusOK, map[string]interface{}{
        "repuesto_id":        repuestoID,
        "equipos_compatibles": equipos,
    })
}

func (h *EstructuraPlantaHandler) DeleteCompatibilidadEquipo(w http.ResponseWriter, r *http.Request) {
    repuestoID, err := strconv.Atoi(mux.Vars(r)["id"])
    if err != nil {
        utils.ErrorJSON(w, http.StatusBadRequest, "id repuesto invalido")
        return
    }
    equipoID, err := strconv.Atoi(mux.Vars(r)["equipo_id"])
    if err != nil {
        utils.ErrorJSON(w, http.StatusBadRequest, "equipo_id invalido")
        return
    }
    if err := h.Service.EliminarCompatibilidadEquipo(repuestoID, equipoID); err != nil {
        utils.ErrorJSON(w, http.StatusInternalServerError, err.Error())
        return
    }
    utils.SuccessJSON(w, http.StatusOK, map[string]interface{}{
        "mensaje":     "Compatibilidad eliminada",
        "repuesto_id": repuestoID,
        "equipo_id":   equipoID,
    })
}

// ==================== HISTORIAL ====================

// GetHistorialRepuesto: GET /api/planta/repuestos/{id}/historial
func (h *EstructuraPlantaHandler) GetHistorialRepuesto(w http.ResponseWriter, r *http.Request) {
    id, err := strconv.Atoi(mux.Vars(r)["id"])
    if err != nil {
        utils.ErrorJSON(w, http.StatusBadRequest, "id invalido")
        return
    }
    hist, err := h.Service.ListarHistorialRepuesto(id)
    if err != nil {
        utils.ErrorJSON(w, http.StatusInternalServerError, err.Error())
        return
    }
    if hist == nil {
        hist = []models.RepuestoHistorial{}
    }
    utils.SuccessJSON(w, http.StatusOK, hist)
}