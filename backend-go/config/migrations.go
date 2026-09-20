package config

import (
	"database/sql"
	"fmt"
	"os"
	"path/filepath"
	"sort"
	"strconv"
	"strings"
)

type migrationFile struct {
	version int
	name    string
	path    string
}

func RunMigrations(db *sql.DB) error {
	dir := os.Getenv("MIGRATIONS_DIR")
	if dir == "" {
		dir = "/app/migrations"
	}

	files, err := loadMigrations(dir)
	if err != nil {
		return err
	}

	if err := ensureMigrationTable(db); err != nil {
		return err
	}

	if err := bootstrapExistingDatabase(db, files); err != nil {
		return err
	}

	for _, migration := range files {
		applied, err := migrationApplied(db, migration.version)
		if err != nil {
			return err
		}

		if applied {
			continue
		}

		if err := applyMigration(db, migration); err != nil {
			return fmt.Errorf(
				"error aplicando migración %03d_%s: %w",
				migration.version,
				migration.name,
				err,
			)
		}
	}

	return nil
}

func loadMigrations(dir string) ([]migrationFile, error) {
	entries, err := os.ReadDir(dir)
	if err != nil {
		return nil, fmt.Errorf(
			"no se pudo leer directorio de migraciones %s: %w",
			dir,
			err,
		)
	}

	var migrations []migrationFile

	for _, entry := range entries {
		if entry.IsDir() || !strings.HasSuffix(entry.Name(), ".sql") {
			continue
		}

		parts := strings.SplitN(entry.Name(), "_", 2)
		if len(parts) != 2 {
			continue
		}

		version, err := strconv.Atoi(parts[0])
		if err != nil {
			continue
		}

		name := strings.TrimSuffix(parts[1], ".sql")

		migrations = append(migrations, migrationFile{
			version: version,
			name:    name,
			path:    filepath.Join(dir, entry.Name()),
		})
	}

	sort.Slice(migrations, func(i, j int) bool {
		return migrations[i].version < migrations[j].version
	})

	if len(migrations) == 0 {
		return nil, fmt.Errorf("no se encontraron migraciones en %s", dir)
	}

	return migrations, nil
}

func ensureMigrationTable(db *sql.DB) error {
	_, err := db.Exec(`
		CREATE TABLE IF NOT EXISTS schema_migrations (
			version INT PRIMARY KEY,
			nombre TEXT NOT NULL,
			aplicado_en TIMESTAMPTZ NOT NULL DEFAULT NOW()
		)
	`)

	return err
}

func bootstrapExistingDatabase(
	db *sql.DB,
	migrations []migrationFile,
) error {
	var count int

	err := db.QueryRow(`
		SELECT COUNT(*)
		FROM schema_migrations
	`).Scan(&count)

	if err != nil {
		return err
	}

	if count > 0 {
		return nil
	}

	var existeMantenimiento bool
	err = db.QueryRow(`
		SELECT EXISTS (
			SELECT 1
			FROM information_schema.tables
			WHERE table_schema = 'public'
			  AND table_name = 'mantenimiento'
		)
	`).Scan(&existeMantenimiento)

	if err != nil {
		return err
	}

	if !existeMantenimiento {
		return nil
	}

	var existeMantenimientoActividades bool
	err = db.QueryRow(`
		SELECT EXISTS (
			SELECT 1
			FROM information_schema.tables
			WHERE table_schema = 'public'
			  AND table_name = 'mantenimiento_actividades'
		)
	`).Scan(&existeMantenimientoActividades)

	if err != nil {
		return err
	}

	if !existeMantenimientoActividades {
		return fmt.Errorf(
			"la BD ya contiene esquema, pero no coincide con la versión 018; no se puede establecer el historial automáticamente",
		)
	}

	maxVersion := 0

	for _, migration := range migrations {
		if migration.version <= 18 {
			maxVersion = migration.version
		}
	}

	if maxVersion == 0 {
		return nil
	}

	tx, err := db.Begin()
	if err != nil {
		return err
	}
	defer tx.Rollback()

	for _, migration := range migrations {
		if migration.version > maxVersion {
			continue
		}

		_, err := tx.Exec(`
			INSERT INTO schema_migrations (
				version,
				nombre
			)
			VALUES ($1, $2)
			ON CONFLICT (version) DO NOTHING
		`, migration.version, migration.name)

		if err != nil {
			return err
		}
	}

	return tx.Commit()
}

func migrationApplied(
	db *sql.DB,
	version int,
) (bool, error) {
	var exists bool

	err := db.QueryRow(`
		SELECT EXISTS (
			SELECT 1
			FROM schema_migrations
			WHERE version = $1
		)
	`, version).Scan(&exists)

	return exists, err
}

func applyMigration(
	db *sql.DB,
	migration migrationFile,
) error {
	content, err := os.ReadFile(migration.path)
	if err != nil {
		return err
	}

	tx, err := db.Begin()
	if err != nil {
		return err
	}
	defer tx.Rollback()

	if _, err := tx.Exec(string(content)); err != nil {
		return err
	}

	if _, err := tx.Exec(`
		INSERT INTO schema_migrations (
			version,
			nombre
		)
		VALUES ($1, $2)
	`, migration.version, migration.name); err != nil {
		return err
	}

	return tx.Commit()
}
