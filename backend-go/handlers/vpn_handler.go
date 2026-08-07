package handlers

import (
    "crypto/rand"
    "encoding/base64"
    "fmt"
    "net/http"
    "strings"
    "sync"
    
    "backend/utils"
    "golang.zx2c4.com/wireguard/wgctrl/wgtypes"
)

type VPNHandler struct {
    ServerPublicKey string
    ServerEndpoint  string
    ServerPort      string
    mu              sync.Mutex
    nextIP          int
}

func NewVPNHandler(serverPublicKey, serverEndpoint, serverPort string) *VPNHandler {
    return &VPNHandler{
        ServerPublicKey: serverPublicKey,
        ServerEndpoint:  serverEndpoint,
        ServerPort:      serverPort,
        nextIP:          2, // Empezar desde 10.0.0.2 (10.0.0.1 es el servidor)
    }
}

func (h *VPNHandler) GetConfig(w http.ResponseWriter, r *http.Request) {
    // Generar clave privada única
    privateKey, err := wgtypes.GeneratePrivateKey()
    if err != nil {
        utils.ErrorJSON(w, 500, "Error generando clave")
        return
    }
    
    // Generar PresharedKey
    psk := make([]byte, 32)
    rand.Read(psk)
    
    // Asignar IP única
    h.mu.Lock()
    ip := fmt.Sprintf("10.0.0.%d", h.nextIP)
    h.nextIP++
    h.mu.Unlock()
    
    // Detectar desde dónde se conecta el cliente
    clientAddr := r.RemoteAddr
    endpoint := h.ServerEndpoint
    
    // Si el cliente está en la misma red local, usar IP local
    if strings.HasPrefix(clientAddr, "192.168.") || 
       strings.HasPrefix(clientAddr, "10.") || 
       strings.HasPrefix(clientAddr, "172.") {
        endpoint = h.ServerEndpoint
    }
    
    config := fmt.Sprintf(`[Interface]
PrivateKey = %s
Address = %s/24
DNS = 1.1.1.1

[Peer]
PublicKey = %s
PresharedKey = %s
AllowedIPs = 10.0.0.0/8,172.16.0.0/12
Endpoint = %s:%s`,
        privateKey.String(),
        ip,
        h.ServerPublicKey,
        base64.StdEncoding.EncodeToString(psk),
        endpoint,
        h.ServerPort,
    )
    
    w.Header().Set("Content-Type", "text/plain")
    w.Write([]byte(config))
}