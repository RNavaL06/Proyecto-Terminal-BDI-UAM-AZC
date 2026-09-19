-- ==========================================================
-- BDI - Script de Tabla: recetas_detalles
-- Descripción: Filas prescriptivas individuales de cada receta médica.
-- Contiene datos de tratamiento clínico (dosis, frecuencia, duración).
-- NO representa existencia física de inventario.
-- ==========================================================

USE bdi_final_db;

CREATE TABLE IF NOT EXISTS recetas_detalles (
    id_receta_detalle INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    id_receta INT UNSIGNED NOT NULL,
    id_catalogo INT UNSIGNED NOT NULL,
    dosis VARCHAR(100) DEFAULT NULL,
    instrucciones_uso TEXT DEFAULT NULL,
    frecuencia VARCHAR(100) DEFAULT NULL,
    duracion VARCHAR(100) DEFAULT NULL,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT fk_recdet_receta
        FOREIGN KEY (id_receta) REFERENCES recetas(id_receta)
        ON DELETE CASCADE ON UPDATE CASCADE,

    CONSTRAINT fk_recdet_catalogo
        FOREIGN KEY (id_catalogo) REFERENCES catalogo_medicamentos(id_catalogo)
        ON DELETE RESTRICT ON UPDATE CASCADE,

    INDEX idx_recdet_receta (id_receta),
    INDEX idx_recdet_catalogo (id_catalogo)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
