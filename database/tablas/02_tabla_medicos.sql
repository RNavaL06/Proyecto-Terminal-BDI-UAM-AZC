-- ==========================================================
-- BDI - Script de Tabla: medicos
-- Descripción: Registro de facultativos médicos emisores de prescripciones,
-- permitiendo auditorías de cédula profesional.
-- ==========================================================

USE bdi_final_db;

CREATE TABLE IF NOT EXISTS medicos (
    id_medico INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    nombre_medico VARCHAR(150) NOT NULL,
    cedula_profesional VARCHAR(50) UNIQUE DEFAULT NULL,
    especialidad VARCHAR(100) DEFAULT NULL,
    telefono_contacto VARCHAR(50) DEFAULT NULL,
    fecha_registro TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,

    INDEX idx_medicos_nombre (nombre_medico),
    INDEX idx_medicos_cedula (cedula_profesional)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
