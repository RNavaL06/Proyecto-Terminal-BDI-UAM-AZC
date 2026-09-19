-- ==========================================================
-- BDI - Script de Tabla: catalogo_cie10
-- Descripción: Catálogo estandarizado de la Clasificación Internacional
-- de Enfermedades (CIE-10) de la OMS. Incluye arreglo de sinónimos coloquiales (JSON)
-- que alimenta directamente al motor de Inteligencia Artificial (NLP NER).
-- ==========================================================

USE bdi_final_db;

CREATE TABLE IF NOT EXISTS catalogo_cie10 (
    id_diagnostico INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    codigo_cie10 VARCHAR(10) NOT NULL UNIQUE,
    termino_medico VARCHAR(255) NOT NULL,
    capitulo VARCHAR(150) DEFAULT NULL,
    keywords JSON NOT NULL,
    fecha_registro TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    fecha_actualizacion TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,

    INDEX idx_cie10_codigo (codigo_cie10),
    INDEX idx_cie10_termino (termino_medico)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
