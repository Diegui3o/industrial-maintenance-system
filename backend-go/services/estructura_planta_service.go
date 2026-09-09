package services

import (
	"backend/models"
	"backend/repository"
)

type EstructuraPlantaService struct {
	Repo *repository.EstructuraPlantaRepository
}

func NewEstructuraPlantaService(
	repo *repository.EstructuraPlantaRepository,
) *EstructuraPlantaService {
	return &EstructuraPlantaService{
		Repo: repo,
	}
}

func (s *EstructuraPlantaService) ListarProcesos() ([]models.ProcesoPlanta, error) {
	return s.Repo.ListarProcesos()
}

func (s *EstructuraPlantaService) CrearProceso(p *models.ProcesoPlanta) error {
	return s.Repo.CrearProceso(p)
}

func (s *EstructuraPlantaService) ListarSubprocesos(procesoID int) ([]models.SubprocesoPlanta, error) {
	return s.Repo.ListarSubprocesos(procesoID)
}

func (s *EstructuraPlantaService) CrearSubproceso(sbp *models.SubprocesoPlanta) error {
	return s.Repo.CrearSubproceso(sbp)
}

func (s *EstructuraPlantaService) AsignarEquipoSubproceso(
	equipoID int,
	subprocesoID int,
) error {
	return s.Repo.AsignarEquipoSubproceso(equipoID, subprocesoID)
}

func (s *EstructuraPlantaService) ObtenerSubprocesoEquipo(
	equipoID int,
) (*models.PlantaEquipo, error) {
	return s.Repo.ObtenerSubprocesoEquipo(equipoID)
}

func (s *EstructuraPlantaService) ListarClasificaciones() ([]models.ClasificacionPlanta, error) {
	return s.Repo.ListarClasificaciones()
}

func (s *EstructuraPlantaService) CrearClasificacion(
	c *models.ClasificacionPlanta,
) error {
	return s.Repo.CrearClasificacion(c)
}

func (s *EstructuraPlantaService) AsignarClasificacion(
	equipoID int,
	clasificacionID int,
) error {
	return s.Repo.AsignarClasificacion(equipoID, clasificacionID)
}

func (s *EstructuraPlantaService) ListarSistemas() ([]models.SistemaPlanta, error) {
	return s.Repo.ListarSistemas()
}

func (s *EstructuraPlantaService) CrearSistema(
	sistema *models.SistemaPlanta,
) error {
	return s.Repo.CrearSistema(sistema)
}

func (s *EstructuraPlantaService) AsignarSistema(
	equipoID int,
	sistemaID int,
) error {
	return s.Repo.AsignarSistema(equipoID, sistemaID)
}

func (s *EstructuraPlantaService) ListarComponentes(
	equipoID int,
) ([]models.ComponenteEquipo, error) {
	return s.Repo.ListarComponentes(equipoID)
}

func (s *EstructuraPlantaService) CrearComponente(
	c *models.ComponenteEquipo,
) error {
	return s.Repo.CrearComponente(c)
}

func (s *EstructuraPlantaService) ListarRepuestos() ([]models.Repuesto, error) {
	return s.Repo.ListarRepuestos()
}

func (s *EstructuraPlantaService) CrearRepuesto(
	r *models.Repuesto,
) error {
	return s.Repo.CrearRepuesto(r)
}

func (s *EstructuraPlantaService) AsignarRepuestoComponente(
	componenteID int,
	repuestoID int,
	cantidad float64,
	posicion *string,
	notas *string,
) error {
	return s.Repo.AsignarRepuestoComponente(
		componenteID,
		repuestoID,
		cantidad,
		posicion,
		notas,
	)
}
func (s *EstructuraPlantaService) ActualizarProceso(
	id int,
	p models.ProcesoPlanta,
) error {
	return s.Repo.ActualizarProceso(id, p)
}

func (s *EstructuraPlantaService) ActualizarSubproceso(
	id int,
	sbp models.SubprocesoPlanta,
) error {
	return s.Repo.ActualizarSubproceso(id, sbp)
}

func (s *EstructuraPlantaService) ActualizarClasificacion(
	id int,
	c models.ClasificacionPlanta,
) error {
	return s.Repo.ActualizarClasificacion(id, c)
}

func (s *EstructuraPlantaService) ActualizarSistema(
	id int,
	sistema models.SistemaPlanta,
) error {
	return s.Repo.ActualizarSistema(id, sistema)
}

func (s *EstructuraPlantaService) ActualizarComponente(
	id int,
	c models.ComponenteEquipo,
) error {
	return s.Repo.ActualizarComponente(id, c)
}

func (s *EstructuraPlantaService) ActualizarRepuesto(
	id int,
	rep models.Repuesto,
) error {
	return s.Repo.ActualizarRepuesto(id, rep)
}
func (s *EstructuraPlantaService) ActualizarEquipoSubproceso(
	equipoID int,
	subprocesoID int,
) error {
	return s.Repo.ActualizarEquipoSubproceso(
		equipoID,
		subprocesoID,
	)
}

func (s *EstructuraPlantaService) ActualizarEquipoClasificaciones(
	equipoID int,
	clasificaciones []int,
) error {
	return s.Repo.ActualizarEquipoClasificaciones(
		equipoID,
		clasificaciones,
	)
}

func (s *EstructuraPlantaService) ActualizarEquipoSistemas(
	equipoID int,
	sistemas []int,
) error {
	return s.Repo.ActualizarEquipoSistemas(
		equipoID,
		sistemas,
	)
}

func (s *EstructuraPlantaService) ActualizarComponenteRepuestos(
	componenteID int,
	repuestos []int,
) error {
	return s.Repo.ActualizarComponenteRepuestos(
		componenteID,
		repuestos,
	)
}
func (s *EstructuraPlantaService) ListarEquiposPorSubproceso(
	subprocesoID int,
) ([]models.PlantaEquipo, error) {
	return s.Repo.ListarEquiposPorSubproceso(subprocesoID)
}

func (s *EstructuraPlantaService) ListarClasificacionesPorEquipo(
	equipoID int,
) ([]models.ClasificacionPlanta, error) {
	return s.Repo.ListarClasificacionesPorEquipo(equipoID)
}

func (s *EstructuraPlantaService) ListarSistemasPorEquipo(
	equipoID int,
) ([]models.SistemaPlanta, error) {
	return s.Repo.ListarSistemasPorEquipo(equipoID)
}

func (s *EstructuraPlantaService) ListarRepuestosPorComponente(
	componenteID int,
) ([]models.Repuesto, error) {
	return s.Repo.ListarRepuestosPorComponente(componenteID)
}

func (s *EstructuraPlantaService) ObtenerEquipoPlantaDetalle(
	equipoID int,
) (*models.EquipoPlantaDetalle, error) {
	return s.Repo.ObtenerEquipoPlantaDetalle(equipoID)
}
func (s *EstructuraPlantaService) ListarRepuestosDetallePorComponente(
	componenteID int,
) ([]models.ComponenteRepuestoDetalle, error) {
	return s.Repo.ListarRepuestosDetallePorComponente(componenteID)
}

func (s *EstructuraPlantaService) ActualizarComponenteRepuesto(
	componenteID int,
	repuestoID int,
	cantidad float64,
	posicion *string,
	notas *string,
) error {
	return s.Repo.ActualizarComponenteRepuesto(
		componenteID,
		repuestoID,
		cantidad,
		posicion,
		notas,
	)
}