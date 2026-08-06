package handlers

import (
	"backend/utils"
	"net"
	"net/http"
)

type DiagnosticoHandler struct{}

func (h *DiagnosticoHandler) Diagnostico(w http.ResponseWriter, r *http.Request) {
	// IP del que consulta
	ip := r.RemoteAddr
	host, _, _ := net.SplitHostPort(ip)

	// Interfaces de red del servidor
	interfaces, _ := net.Interfaces()
	var ips []string
	for _, i := range interfaces {
		addrs, _ := i.Addrs()
		for _, addr := range addrs {
			ips = append(ips, i.Name+": "+addr.String())
		}
	}

	utils.SuccessJSON(w, http.StatusOK, map[string]interface{}{
		"cliente_ip":   host,
		"cliente_full": ip,
		"servidor_ips": ips,
		"mensaje":      "Si ves esto, hay conexión",
	})
}
