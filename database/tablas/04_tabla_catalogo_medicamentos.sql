-- ==========================================================
-- BDI - Script de Tabla: catalogo_medicamentos
-- Descripción: Diccionario maestro estandarizado de fármacos para evitar
-- redundancia y nombres duplicados provenientes de extracciones OCR.
-- ==========================================================

USE bdi_final_db;

CREATE TABLE IF NOT EXISTS catalogo_medicamentos (
    id_catalogo INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    nombre_comercial VARCHAR(150) NOT NULL,
    sustancia_activa VARCHAR(150) DEFAULT NULL,
    formato VARCHAR(100) DEFAULT NULL,
    laboratorio VARCHAR(100) DEFAULT NULL,
    fecha_registro TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,

    INDEX idx_catmed_nombre (nombre_comercial),
    INDEX idx_catmed_sustancia (sustancia_activa)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
