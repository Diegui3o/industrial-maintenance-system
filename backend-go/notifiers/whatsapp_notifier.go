package notifiers

import (
	"backend/whatsapp"
	"fmt"
)

type WhatsAppNotifier struct {
	client *whatsapp.WhatsAppClient // ahora usamos el wrapper
}

func NewWhatsAppNotifier(client *whatsapp.WhatsAppClient) *WhatsAppNotifier {
	return &WhatsAppNotifier{client: client}
}

func (w *WhatsAppNotifier) SendToGroup(groupJID string, message string) error {
	if w.client == nil || !w.client.IsLoggedIn() {
		return fmt.Errorf("cliente de WhatsApp no disponible o no autenticado")
	}
	return w.client.SendToGroup(groupJID, message)
}

func (w *WhatsAppNotifier) SendAlert(equipoNombre, motivo, severidad string) string {
	emoji := "⚠️"
	if severidad == "critica" {
		emoji = "🚨"
	}
	return fmt.Sprintf(
		"%s *ALERTA DE EQUIPO*\n\n*Equipo:* %s\n*Severidad:* %s\n*Motivo:* %s\n*Fecha:* %s",
		emoji, equipoNombre, severidad, motivo, "ahora",
	)
}
