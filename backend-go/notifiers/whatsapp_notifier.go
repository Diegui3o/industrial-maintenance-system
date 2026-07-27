package notifiers

import (
	"context"
	"fmt"
	"log"

	"go.mau.fi/whatsmeow"
	waProto "go.mau.fi/whatsmeow/binary/proto"
	"go.mau.fi/whatsmeow/types"
	"google.golang.org/protobuf/proto"
)

type WhatsAppNotifier struct {
	Client *whatsmeow.Client
}

func NewWhatsAppNotifier(client *whatsmeow.Client) *WhatsAppNotifier {
	return &WhatsAppNotifier{Client: client}
}

func (w *WhatsAppNotifier) SendToGroup(groupJID string, message string) error {
	target, err := types.ParseJID(groupJID)
	if err != nil {
		return fmt.Errorf("JID inválido: %w", err)
	}

	_, err = w.Client.SendMessage(context.Background(), target, &waProto.Message{
		Conversation: proto.String(message),
	})

	if err != nil {
		log.Printf("Error enviando WhatsApp a %s: %v", groupJID, err)
		return err
	}

	log.Printf("WhatsApp enviado a grupo %s", groupJID)
	return nil
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
