package services

import (
	"database/sql"
	"fmt"
	"log"
	"sync"

	"backend/repository"
	"backend/whatsapp"
)

type WhatsAppManager struct {
	db      *sql.DB
	repo    *repository.WhatsAppRepository
	mu      sync.RWMutex
	clients map[int]*whatsapp.WhatsAppClient // key: usuarioID
}

func NewWhatsAppManager(db *sql.DB, repo *repository.WhatsAppRepository) *WhatsAppManager {
	return &WhatsAppManager{
		db:      db,
		repo:    repo,
		clients: make(map[int]*whatsapp.WhatsAppClient),
	}
}

// CargarInstancias conecta todas las instancias existentes al iniciar
func (m *WhatsAppManager) CargarInstancias() error {
	instancias, err := m.repo.ListarInstancias()
	if err != nil {
		return err
	}

	for _, inst := range instancias {
		cliente := whatsapp.NewWhatsAppClient()
		if err := cliente.Connect(inst.RutaSesion); err != nil {
			log.Printf("⚠️ No se pudo conectar sesión de usuario %d: %v", inst.UsuarioID, err)
			continue
		}
		m.mu.Lock()
		m.clients[inst.UsuarioID] = cliente
		m.mu.Unlock()
		log.Printf("✅ Instancia conectada para usuario %d", inst.UsuarioID)
	}
	return nil
}

// GetClient devuelve el cliente para un usuario, o lo carga desde BD si no está en memoria
func (m *WhatsAppManager) GetClient(usuarioID int) (*whatsapp.WhatsAppClient, error) {
	m.mu.RLock()
	cliente, ok := m.clients[usuarioID]
	m.mu.RUnlock()
	if ok && cliente.IsLoggedIn() {
		return cliente, nil
	}

	instancia, err := m.repo.ObtenerInstanciaPorUsuario(usuarioID)
	if err != nil {
		return nil, fmt.Errorf("no hay instancia para usuario %d", usuarioID)
	}

	nuevoCliente := whatsapp.NewWhatsAppClient()
	if err := nuevoCliente.Connect(instancia.RutaSesion); err != nil {
		return nil, err
	}

	m.mu.Lock()
	m.clients[usuarioID] = nuevoCliente
	m.mu.Unlock()
	return nuevoCliente, nil
}

// CrearInstancia crea o actualiza la instancia de un usuario y la conecta
func (m *WhatsAppManager) CrearInstancia(usuarioID int, rutaSesion string) error {
	err := m.repo.CrearInstancia(usuarioID, rutaSesion)
	if err != nil {
		return err
	}

	cliente := whatsapp.NewWhatsAppClient()
	if err := cliente.Connect(rutaSesion); err != nil {
		return fmt.Errorf("error conectando nueva instancia: %w", err)
	}

	m.mu.Lock()
	m.clients[usuarioID] = cliente
	m.mu.Unlock()
	return nil
}

// ObtenerTodosClientes devuelve todos los clientes autenticados (para notificaciones)
func (m *WhatsAppManager) ObtenerTodosClientes() []*whatsapp.WhatsAppClient {
	m.mu.RLock()
	defer m.mu.RUnlock()
	lista := make([]*whatsapp.WhatsAppClient, 0, len(m.clients))
	for _, c := range m.clients {
		if c.IsLoggedIn() {
			lista = append(lista, c)
		}
	}
	return lista
}

func (m *WhatsAppManager) UpdateClient(usuarioID int, cliente *whatsapp.WhatsAppClient) {
	m.mu.Lock()
	m.clients[usuarioID] = cliente
	m.mu.Unlock()
}
