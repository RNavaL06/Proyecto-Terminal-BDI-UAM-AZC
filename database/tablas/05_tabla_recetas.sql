-- ==========================================================
-- BDI - Script de Tabla: recetas
-- Descripción: Encabezado clínico de la prescripción médica digitalizada.
-- Contiene el vínculo con el paciente y el médico, el diagnóstico CIE-10
-- y la fotografía original escaneada (optimizada con Sharp en Base64) para el visor.
-- ==========================================================

USE bdi_final_db;

CREATE TABLE IF NOT EXISTS recetas (
    id_receta INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    id_usuario INT UNSIGNED NOT NULL,
    id_medico INT UNSIGNED DEFAULT NULL,
    paciente_nombre VARCHAR(150) DEFAULT NULL,
    fecha_expedicion DATE NOT NULL,
    diagnostico VARCHAR(255) DEFAULT NULL,
    codigo_cie10 VARCHAR(10) DEFAULT NULL,
    indicaciones TEXT DEFAULT NULL,
    imagen_base64 LONGTEXT NOT NULL,
    estado ENUM('pendiente', 'procesada', 'error') NOT NULL DEFAULT 'procesada',
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,

    CONSTRAINT fk_recetas_usuario
        FOREIGN KEY (id_usuario) REFERENCES usuarios(id_usuario)
        ON DELETE CASCADE ON UPDATE CASCADE,

    CONSTRAINT fk_recetas_medico
        FOREIGN KEY (id_medico) REFERENCES medicos(id_medico)
        ON DELETE SET NULL ON UPDATE CASCADE,

    CONSTRAINT fk_recetas_cie10
        FOREIGN KEY (codigo_cie10) REFERENCES catalogo_cie10(codigo_cie10)
        ON DELETE SET NULL ON UPDATE CASCADE,

    INDEX idx_recetas_usuario (id_usuario),
    INDEX idx_recetas_medico (id_medico),
    INDEX idx_recetas_fecha (fecha_expedicion),
    INDEX idx_recetas_estado (estado)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
