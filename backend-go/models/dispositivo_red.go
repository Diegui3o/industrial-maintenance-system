// models/dispositivo_red.go
package models

type DispositivoRed struct {
	ID              int    `json:"id"`
	EquipoID        int    `json:"equipo_id"`
	TipoDispositivo string `json:"tipo_dispositivo"`
	IP              string `json:"ip"`
	Puerto          int    `json:"puerto"`
	Protocolo       string `json:"protocolo"`
	Usuario         string `json:"usuario"`
	PasswordHash    string `json:"password_hash,omitempty"`
}
