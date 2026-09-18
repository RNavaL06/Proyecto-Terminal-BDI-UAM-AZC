-- ==========================================================
-- BDI - Script de Tabla: busquedas_precios
-- Descripción: Historial persistente de consultas de precios vía SerpApi
-- (Google Shopping México) para ahorro de cuota y auditoría de cotizaciones.
-- ==========================================================

USE bdi_final_db;

CREATE TABLE IF NOT EXISTS busquedas_precios (
    id_busqueda INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    id_usuario INT UNSIGNED NOT NULL,
    medicamento_nombre VARCHAR(255) NOT NULL,
    resultados JSON NOT NULL,
    fuente VARCHAR(100) NOT NULL DEFAULT 'google_shopping',
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT fk_busquedas_usuario
        FOREIGN KEY (id_usuario) REFERENCES usuarios(id_usuario)
        ON DELETE CASCADE ON UPDATE CASCADE,

    INDEX idx_busquedas_usuario (id_usuario),
    INDEX idx_busquedas_medicamento (medicamento_nombre)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
