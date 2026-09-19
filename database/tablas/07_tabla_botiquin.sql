-- ==========================================================
-- BDI - Script de Tabla: botiquin
-- Descripción: Control de inventario físico de medicamentos en posesión del usuario.
-- Permite existencia de fármacos sin receta obligatoria (id_receta es opcional/NULL).
-- Incluye cálculo de vigencia de caducidad para emitir alertas preventivas.
-- ==========================================================

USE bdi_final_db;

CREATE TABLE IF NOT EXISTS botiquin (
    id_botiquin INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    id_usuario INT UNSIGNED NOT NULL,
    id_catalogo INT UNSIGNED NOT NULL,
    id_receta INT UNSIGNED DEFAULT NULL,
    cantidad_disponible INT NOT NULL DEFAULT 0,
    unidad VARCHAR(50) NOT NULL DEFAULT 'piezas',
    fecha_caducidad DATE DEFAULT NULL,
    lote VARCHAR(100) DEFAULT NULL,
    codigo_barras VARCHAR(100) DEFAULT NULL,
    notas TEXT DEFAULT NULL,
    estado ENUM('vigente', 'por_vencer', 'caducado') NOT NULL DEFAULT 'vigente',
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,

    CONSTRAINT fk_botiquin_usuario
        FOREIGN KEY (id_usuario) REFERENCES usuarios(id_usuario)
        ON DELETE CASCADE ON UPDATE CASCADE,

    CONSTRAINT fk_botiquin_catalogo
        FOREIGN KEY (id_catalogo) REFERENCES catalogo_medicamentos(id_catalogo)
        ON DELETE RESTRICT ON UPDATE CASCADE,

    CONSTRAINT fk_botiquin_receta
        FOREIGN KEY (id_receta) REFERENCES recetas(id_receta)
        ON DELETE SET NULL ON UPDATE CASCADE,

    INDEX idx_botiquin_usuario (id_usuario),
    INDEX idx_botiquin_caducidad (fecha_caducidad),
    INDEX idx_botiquin_estado (estado)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
