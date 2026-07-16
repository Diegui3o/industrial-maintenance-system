package whatsapp

import (
	"context"
	"fmt"
	"os"
	"path/filepath"

	"github.com/skip2/go-qrcode"
	"go.mau.fi/whatsmeow"
	waProto "go.mau.fi/whatsmeow/binary/proto"
	"go.mau.fi/whatsmeow/store/sqlstore"
	"go.mau.fi/whatsmeow/types"
	"go.mau.fi/whatsmeow/types/events"
	_ "modernc.org/sqlite"
)

type WhatsAppClient struct {
	Client *whatsmeow.Client
}

func NewWhatsAppClient() *WhatsAppClient {
	return &WhatsAppClient{}
}

func (w *WhatsAppClient) Connect(sessionPath string) error {

	ctx := context.Background()

	dir := filepath.Dir(sessionPath)

	err := os.MkdirAll(dir, 0755)
	if err != nil {
		return err
	}

	container, err := sqlstore.New(
		ctx,
		"sqlite",
		sessionPath+"?_pragma=foreign_keys(1)",
		nil,
	)

	if err != nil {
		return fmt.Errorf(
			"error creando store: %w",
			err,
		)
	}

	deviceStore, err := container.GetFirstDevice(ctx)

	if err != nil {
		return fmt.Errorf(
			"error obteniendo device: %w",
			err,
		)
	}

	w.Client = whatsmeow.NewClient(
		deviceStore,
		nil,
	)

	w.Client.AddEventHandler(func(event interface{}) {

		switch event.(type) {

		case *events.Connected:

			fmt.Println("🟢 WhatsApp websocket conectado")

		case *events.Disconnected:

			fmt.Println("🔴 WhatsApp desconectado")

		case *events.LoggedOut:

			fmt.Println("⚠️ Sesión cerrada")

		}

	})
	// ==============================
	// CASO 1: PRIMERA VEZ
	// ==============================

	if w.Client.Store.ID == nil {

		fmt.Println("📱 Primera conexión, generando QR")

		qrChan, err := w.Client.GetQRChannel(ctx)

		if err != nil {
			return fmt.Errorf(
				"error creando QR: %w",
				err,
			)
		}

		err = w.Client.Connect()

		if err != nil {
			return fmt.Errorf(
				"error conectando WhatsApp: %w",
				err,
			)
		}

		for qrEvent := range qrChan {

			switch qrEvent.Event {

			case "code":

				err := qrcode.WriteFile(
					qrEvent.Code,
					qrcode.Medium,
					300,
					"whatsapp_qr.png",
				)

				if err != nil {
					return fmt.Errorf(
						"error generando QR: %w",
						err,
					)
				}

				fmt.Println(
					"✅ QR generado: whatsapp_qr.png",
				)

			case "success":

				fmt.Println(
					"✅ WhatsApp vinculado correctamente",
				)

				return nil

			case "timeout":

				return fmt.Errorf(
					"QR expirado",
				)
			}
		}

	} else {

		// ==============================
		// CASO 2: SESIÓN EXISTENTE
		// ==============================

		fmt.Println(
			"♻️ Restaurando sesión existente",
		)

		err = w.Client.Connect()

		if err != nil {
			return fmt.Errorf(
				"error conectando sesión: %w",
				err,
			)
		}

		fmt.Println(
			"✅ Sesión restaurada",
		)

	}

	return nil
}

func (w *WhatsAppClient) GetGroups() ([]*types.GroupInfo, error) {
	return w.Client.GetJoinedGroups(context.Background())
}

func (w *WhatsAppClient) SendToGroup(groupJID string, message string) error {
	target, _ := types.ParseJID(groupJID)
	_, err := w.Client.SendMessage(context.Background(), target, &waProto.Message{
		Conversation: &message,
	})
	return err
}

func (w *WhatsAppClient) Disconnect() {
	if w.Client != nil {
		w.Client.Disconnect()
	}
}
