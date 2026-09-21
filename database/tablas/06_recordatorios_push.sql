-- ========================================================
-- Script para crear tablas de Recordatorios y Notificaciones
-- ========================================================

-- 1. Tabla de suscripciones push (Credenciales VAPID por dispositivo)
CREATE TABLE IF NOT EXISTS suscripciones_push (
    id_suscripcion INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    id_usuario INT UNSIGNED NOT NULL,
    endpoint TEXT NOT NULL,
    keys_p256dh TEXT NOT NULL,
    keys_auth TEXT NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (id_usuario) REFERENCES usuarios(id_usuario) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 2. Tabla de recordatorios (Reglas madre)
CREATE TABLE IF NOT EXISTS recordatorios (
    id_recordatorio INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    id_usuario INT UNSIGNED NOT NULL,
    id_catalogo INT UNSIGNED NULL,
    id_receta_detalle INT UNSIGNED NULL,
    medicamento_nombre VARCHAR(255) NOT NULL,
    formato VARCHAR(100) DEFAULT 'Desconocido',
    frecuencia_horas INT NOT NULL COMMENT 'Cada cuántas horas',
    fecha_inicio DATETIME NOT NULL,
    fecha_fin DATETIME NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (id_usuario) REFERENCES usuarios(id_usuario) ON DELETE CASCADE,
    FOREIGN KEY (id_catalogo) REFERENCES catalogo_medicamentos(id_catalogo) ON DELETE SET NULL,
    FOREIGN KEY (id_receta_detalle) REFERENCES recetas_detalles(id_receta_detalle) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 3. Tabla de tomas diarias (Eventos individuales programados)
CREATE TABLE IF NOT EXISTS tomas_diarias (
    id_toma INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    id_recordatorio INT UNSIGNED NOT NULL,
    id_usuario INT UNSIGNED NOT NULL,
    fecha_hora_programada DATETIME NOT NULL,
    estado ENUM('pendiente', 'tomado', 'omitido') DEFAULT 'pendiente',
    fecha_hora_toma DATETIME NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (id_recordatorio) REFERENCES recordatorios(id_recordatorio) ON DELETE CASCADE,
    FOREIGN KEY (id_usuario) REFERENCES usuarios(id_usuario) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
