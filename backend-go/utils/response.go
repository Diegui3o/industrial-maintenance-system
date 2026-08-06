package utils

import (
	"encoding/json"
	"net/http"
)

func ErrorJSON(
	w http.ResponseWriter,
	status int,
	mensaje string,
) {

	w.Header().Set(
		"Content-Type",
		"application/json",
	)

	w.WriteHeader(status)

	json.NewEncoder(w).Encode(
		map[string]string{
			"error": mensaje,
		},
	)
}

func SuccessJSON(
	w http.ResponseWriter,
	status int,
	data interface{},
) {

	w.Header().Set(
		"Content-Type",
		"application/json",
	)

	w.WriteHeader(status)

	json.NewEncoder(w).Encode(data)
}
