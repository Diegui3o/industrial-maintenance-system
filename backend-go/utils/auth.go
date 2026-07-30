package utils

import (
	"crypto/rand"
	"database/sql"
	"encoding/hex"
	"net/http"
)

// GetAPIKey: extrae la API Key del header o query param
func GetAPIKey(r *http.Request) string {
	key := r.Header.Get("X-API-Key")
	if key == "" {
		key = r.URL.Query().Get("api_key")
	}
	return key
}

// GetUsuarioIDFromKey: busca el usuario por API Key
func GetUsuarioIDFromKey(db *sql.DB, apiKey string) int {
	if apiKey == "" {
		return 0
	}
	var id int
	err := db.QueryRow("SELECT id FROM usuarios WHERE api_key = $1", apiKey).Scan(&id)
	if err != nil {
		return 0
	}
	return id
}

// GenerateAPIKey: crea una key aleatoria
func GenerateAPIKey() string {
	b := make([]byte, 16)
	rand.Read(b)
	return "mto_" + hex.EncodeToString(b)
}

func GetRolFromKey(db *sql.DB, apiKey string) string {
	if apiKey == "" {
		return ""
	}
	var rol string
	err := db.QueryRow("SELECT rol FROM usuarios WHERE api_key = $1", apiKey).Scan(&rol)
	if err != nil {
		return ""
	}
	return rol
}
