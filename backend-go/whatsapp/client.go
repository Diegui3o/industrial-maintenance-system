package whatsapp

import (
	"context"
	"crypto/tls"
	"fmt"
	"net/http"
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
	LastQR string
	QRPath string
}

func NewWhatsAppClient() *WhatsAppClient {
	return &WhatsAppClient{
		QRPath: "/app/whatsapp_sessions/whatsapp_qr.png",
	}
}

func (w *WhatsAppClient) Connect(sessionPath string) error {
	http.DefaultTransport.(*http.Transport).TLSClientConfig = &tls.Config{
		InsecureSkipVerify: true,
	}

	ctx := context.Background()

	dir := filepath.Dir(sessionPath)
	if err := os.MkdirAll(dir, 0755); err != nil {
		return err
	}

	container, err := sqlstore.New(
		ctx,
		"sqlite",
		sessionPath+"?_pragma=foreign_keys(1)&_pragma=busy_timeout(10000)&_pragma=journal_mode(WAL)",
		nil,
	)
	if err != nil {
		return fmt.Errorf("error creando store: %w", err)
	}

	deviceStore, err := container.GetFirstDevice(ctx)
	if err != nil {
		return fmt.Errorf("error obteniendo device: %w", err)
	}

	w.Client = whatsmeow.NewClient(deviceStore, nil)

	w.Client.AddEventHandler(func(event interface{}) {
		switch event.(type) {
		case *events.Connected:
			fmt.Println("🟢 WhatsApp websocket conectado")
		case *events.Disconnected:
			fmt.Println("🔴 WhatsApp desconectado")
		case *events.LoggedOut:
			fmt.Println("⚠️ Sesión cerrada")
			w.LastQR = ""
			os.Remove(w.QRPath)
		}
	})

	if w.Client.Store.ID == nil {
		fmt.Println("📱 Primera conexión, generando QR")

		qrChan, err := w.Client.GetQRChannel(ctx)
		if err != nil {
			return fmt.Errorf("error creando QR: %w", err)
		}

		if err = w.Client.Connect(); err != nil {
			return fmt.Errorf("error conectando WhatsApp: %w", err)
		}

		for qrEvent := range qrChan {
			switch qrEvent.Event {
			case "code":
				w.LastQR = qrEvent.Code
				os.Remove(w.QRPath)
				err := qrcode.WriteFile(qrEvent.Code, qrcode.Medium, 300, w.QRPath)
				if err != nil {
					fmt.Println("❌ Error guardando QR:", err)
				} else {
					fmt.Println("✅ QR generado correctamente en:", w.QRPath)
				}
			case "success":
				fmt.Println("✅ WhatsApp vinculado correctamente")
				w.LastQR = ""
				os.Remove(w.QRPath)
				return nil
			case "timeout":
				w.LastQR = ""
				os.Remove(w.QRPath)
				return fmt.Errorf("QR expirado")
			}
		}

	} else {
		fmt.Println("♻️ Restaurando sesión existente")
		if err = w.Client.Connect(); err != nil {
			return fmt.Errorf("error conectando sesión: %w", err)
		}
		fmt.Println("✅ Sesión restaurada")
		w.LastQR = ""
		os.Remove(w.QRPath)
	}

	return nil
}

func (w *WhatsAppClient) GetGroups() ([]*types.GroupInfo, error) {
	return w.Client.GetJoinedGroups(context.Background())
}

func (w *WhatsAppClient) SendToGroup(groupJID string, message string) error {
	ctx := context.Background()
	target, err := types.ParseJID(groupJID)
	if err != nil {
		return err
	}
	_, err = w.Client.SendMessage(ctx, target, &waProto.Message{Conversation: &message})
	return err
}

func (w *WhatsAppClient) HasQR() bool { return w.LastQR != "" }
func (w *WhatsAppClient) Disconnect() {
	if w.Client != nil {
		w.Client.Disconnect()
	}
}
func (w *WhatsAppClient) IsConnected() bool { return w.Client != nil && w.Client.IsConnected() }
func (w *WhatsAppClient) IsLoggedIn() bool  { return w.Client != nil && w.Client.Store.ID != nil }
