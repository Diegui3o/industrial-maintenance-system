package repository

import (
	"database/sql"
)

type EstructuraPlantaRepository struct {
	DB *sql.DB
}

func NewEstructuraPlantaRepository(db *sql.DB) *EstructuraPlantaRepository {
	return &EstructuraPlantaRepository{DB: db}
}
