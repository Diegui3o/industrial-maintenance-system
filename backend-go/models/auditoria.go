package models

import "time"

type Auditoria struct {
	ID            int       `json:"id"`
	UsuarioID     *int      `json:"usuario_id"`
	NombreUsuario string    `json:"nombre_usuario"`
	Tabla         string    `json:"tabla"`
	Accion        string    `json:"accion"`
	Detalle       string    `json:"detalle"`
	Fecha         time.Time `json:"fecha"`
}
