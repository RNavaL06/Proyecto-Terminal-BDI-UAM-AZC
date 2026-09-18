-- ==========================================================
-- BDI - Script de Tabla: usuarios
-- Descripción: Almacena perfiles de usuario autenticados con Google OAuth,
-- roles de sistema y preferencias para el servicio de notificaciones.
-- ==========================================================

USE bdi_final_db;

CREATE TABLE IF NOT EXISTS usuarios (
    id_usuario INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    google_id VARCHAR(255) NOT NULL UNIQUE,
    correo_electronico VARCHAR(255) NOT NULL UNIQUE,
    nombre_completo VARCHAR(150) NOT NULL,
    foto_perfil VARCHAR(500) DEFAULT NULL,
    rol ENUM('paciente', 'admin') NOT NULL DEFAULT 'paciente',
    notif_activas TINYINT(1) NOT NULL DEFAULT 1,
    notif_umbral_dias INT UNSIGNED NOT NULL DEFAULT 30,
    estado_cuenta TINYINT(1) NOT NULL DEFAULT 1,
    fecha_registro TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    fecha_ultimo_acceso TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,

    INDEX idx_usuarios_google_id (google_id),
    INDEX idx_usuarios_correo (correo_electronico),
    INDEX idx_usuarios_rol (rol)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
