-- ==========================================================
-- BDI - Botiquín Digital Inteligente
-- Script Maestro: setup_completo.sql
-- Descripción: Ejecuta la creación y población completa de la base de datos
-- de forma secuencial y respetando la integridad referencial.
-- ==========================================================

-- 1. Crear y usar base de datos
CREATE DATABASE IF NOT EXISTS bdi_final_db
  CHARACTER SET utf8mb4
  COLLATE utf8mb4_unicode_ci;

USE bdi_final_db;

-- 2. Creación de Tablas (DDL en orden de dependencia)
-- ----------------------------------------------------------

-- 2.1 Usuarios
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

-- 2.2 Médicos
CREATE TABLE IF NOT EXISTS medicos (
    id_medico INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    nombre_medico VARCHAR(150) NOT NULL,
    cedula_profesional VARCHAR(50) UNIQUE DEFAULT NULL,
    telefono_contacto VARCHAR(50) DEFAULT NULL,
    fecha_registro TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    INDEX idx_medicos_nombre (nombre_medico),
    INDEX idx_medicos_cedula (cedula_profesional)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 2.3 Catálogo CIE-10 (OMS)
CREATE TABLE IF NOT EXISTS catalogo_cie10 (
    id_diagnostico INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    codigo_cie10 VARCHAR(10) NOT NULL UNIQUE,
    termino_medico VARCHAR(255) NOT NULL,
    capitulo VARCHAR(150) DEFAULT NULL,
    keywords JSON NOT NULL,
    es_frecuente TINYINT(1) NOT NULL DEFAULT 0,
    fecha_registro TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    fecha_actualizacion TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    INDEX idx_cie10_codigo (codigo_cie10),
    INDEX idx_cie10_termino (termino_medico),
    INDEX idx_cie10_frecuente (es_frecuente),
    FULLTEXT INDEX idx_cie10_busqueda (termino_medico)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 2.4 Catálogo Medicamentos Maestros
CREATE TABLE IF NOT EXISTS catalogo_medicamentos (
    id_catalogo INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    nombre_comercial VARCHAR(150) NOT NULL,
    sustancia_activa VARCHAR(150) DEFAULT NULL,
    formato VARCHAR(100) DEFAULT NULL,
    fecha_registro TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    INDEX idx_catmed_nombre (nombre_comercial),
    INDEX idx_catmed_sustancia (sustancia_activa)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 2.5 Recetas Médicas Digitalizadas
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
    CONSTRAINT fk_recetas_usuario FOREIGN KEY (id_usuario) REFERENCES usuarios(id_usuario) ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT fk_recetas_medico FOREIGN KEY (id_medico) REFERENCES medicos(id_medico) ON DELETE SET NULL ON UPDATE CASCADE,
    CONSTRAINT fk_recetas_cie10 FOREIGN KEY (codigo_cie10) REFERENCES catalogo_cie10(codigo_cie10) ON DELETE SET NULL ON UPDATE CASCADE,
    INDEX idx_recetas_usuario (id_usuario),
    INDEX idx_recetas_medico (id_medico),
    INDEX idx_recetas_fecha (fecha_expedicion),
    INDEX idx_recetas_estado (estado)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 2.6 Renglones de Prescripción (Recetas Detalles)
CREATE TABLE IF NOT EXISTS recetas_detalles (
    id_receta_detalle INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    id_receta INT UNSIGNED NOT NULL,
    id_catalogo INT UNSIGNED NOT NULL,
    dosis VARCHAR(100) DEFAULT NULL,
    instrucciones_uso TEXT DEFAULT NULL,
    frecuencia VARCHAR(100) DEFAULT NULL,
    duracion VARCHAR(100) DEFAULT NULL,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT fk_recdet_receta FOREIGN KEY (id_receta) REFERENCES recetas(id_receta) ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT fk_recdet_catalogo FOREIGN KEY (id_catalogo) REFERENCES catalogo_medicamentos(id_catalogo) ON DELETE RESTRICT ON UPDATE CASCADE,
    INDEX idx_recdet_receta (id_receta),
    INDEX idx_recdet_catalogo (id_catalogo)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 2.7 Botiquín Físico
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
    CONSTRAINT fk_botiquin_usuario FOREIGN KEY (id_usuario) REFERENCES usuarios(id_usuario) ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT fk_botiquin_catalogo FOREIGN KEY (id_catalogo) REFERENCES catalogo_medicamentos(id_catalogo) ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT fk_botiquin_receta FOREIGN KEY (id_receta) REFERENCES recetas(id_receta) ON DELETE SET NULL ON UPDATE CASCADE,
    INDEX idx_botiquin_usuario (id_usuario),
    INDEX idx_botiquin_caducidad (fecha_caducidad),
    INDEX idx_botiquin_estado (estado)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 2.8 Historial de Cotizaciones
CREATE TABLE IF NOT EXISTS busquedas_precios (
    id_busqueda INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    id_usuario INT UNSIGNED NOT NULL,
    medicamento_nombre VARCHAR(255) NOT NULL,
    resultados JSON NOT NULL,
    fuente VARCHAR(100) NOT NULL DEFAULT 'google_shopping',
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT fk_busquedas_usuario FOREIGN KEY (id_usuario) REFERENCES usuarios(id_usuario) ON DELETE CASCADE ON UPDATE CASCADE,
    INDEX idx_busquedas_usuario (id_usuario),
    INDEX idx_busquedas_medicamento (medicamento_nombre)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 2.9 Suscripciones Push
CREATE TABLE IF NOT EXISTS suscripciones_push (
    id_suscripcion INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    id_usuario INT UNSIGNED NOT NULL,
    endpoint TEXT NOT NULL,
    keys_p256dh TEXT NOT NULL,
    keys_auth TEXT NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT fk_suscripciones_usuario FOREIGN KEY (id_usuario) REFERENCES usuarios(id_usuario) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 2.10 Recordatorios
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
    CONSTRAINT fk_recordatorios_usuario FOREIGN KEY (id_usuario) REFERENCES usuarios(id_usuario) ON DELETE CASCADE,
    CONSTRAINT fk_recordatorios_catalogo FOREIGN KEY (id_catalogo) REFERENCES catalogo_medicamentos(id_catalogo) ON DELETE SET NULL,
    CONSTRAINT fk_recordatorios_detalle FOREIGN KEY (id_receta_detalle) REFERENCES recetas_detalles(id_receta_detalle) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 2.11 Tomas Diarias
CREATE TABLE IF NOT EXISTS tomas_diarias (
    id_toma INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    id_recordatorio INT UNSIGNED NOT NULL,
    id_usuario INT UNSIGNED NOT NULL,
    fecha_hora_programada DATETIME NOT NULL,
    estado ENUM('pendiente', 'tomado', 'omitido') DEFAULT 'pendiente',
    fecha_hora_toma DATETIME NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT fk_tomas_recordatorio FOREIGN KEY (id_recordatorio) REFERENCES recordatorios(id_recordatorio) ON DELETE CASCADE,
    CONSTRAINT fk_tomas_usuario FOREIGN KEY (id_usuario) REFERENCES usuarios(id_usuario) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 3. Población Inicial de Datos
-- ----------------------------------------------------------

-- 3.1 Usuarios (Exclusivamente usuario de prueba Modo Demo)
INSERT INTO usuarios (id_usuario, google_id, correo_electronico, nombre_completo, foto_perfil, rol, notif_activas, notif_umbral_dias)
VALUES 
(1, 'demo_google_id_uam', 'version.demo@bdi.salud', 'Versión Demo', 'https://cdn-icons-png.flaticon.com/512/2950/2950993.png', 'paciente', 1, 30)
ON DUPLICATE KEY UPDATE 
    google_id = VALUES(google_id),
    correo_electronico = VALUES(correo_electronico),
    nombre_completo = VALUES(nombre_completo),
    foto_perfil = VALUES(foto_perfil),
    notif_activas = VALUES(notif_activas),
    notif_umbral_dias = VALUES(notif_umbral_dias);

-- 3.2 Médicos (Asociados a las recetas del paciente de prueba)
INSERT INTO medicos (id_medico, nombre_medico, cedula_profesional, telefono_contacto)
VALUES 
(1, 'Dr. Roberto Martínez Esquivel', 'CED-MED-8492011', '55-5318-9000'),
(2, 'Dr. Fernando Castro Navarrete', 'CED-MED-7362819', '55-5318-9456')
ON DUPLICATE KEY UPDATE nombre_medico = VALUES(nombre_medico);

-- 3.3 Catálogo CIE-10
-- NOTA: El catálogo maestro se encuentra poblado con los 1,440 códigos oficiales
-- basados en el SUIVE 2025 ("Veinte principales causas de enfermedad Nacional").
-- Se utiliza INSERT IGNORE garantizando únicamente la presencia de los diagnósticos
-- requeridos por las recetas de prueba sin modificar ni duplicar los 1,440 existentes.
INSERT IGNORE INTO catalogo_cie10 (codigo_cie10, termino_medico, capitulo, keywords, es_frecuente)
VALUES 
('J02.9', 'Faringitis aguda, no especificada', 'Enfermedades del aparato respiratorio', '["faringitis", "garganta inflamada", "infeccion de garganta", "placas en garganta", "ardor al pasar saliva"]', 1),
('K29.00', 'Gastritis aguda sin hemorragia', 'Sin especificar', '["ardor de estomago", "acidez", "dolor de guata", "dolor de panza", "dolor de barriga", "gastritis leve", "reflujo", "pesadez estomacal", "indigestión aguda", "malestar estomacal", "fuego en el estomago", "acidez estomacal", "gastritis repentina", "dolor en la boca del estomago", "agrieras"]', 1),
('K29.70', 'Gastritis, no especificada, sin hemorragia', 'Sin especificar', '["gastritis", "dolor de estomago", "ardor de panza", "dolor en la guata", "malestar en la boca del estomago", "acidez", "pesadez", "inflamación estomacal", "problemas al estomago", "gastritis sin diagnostico", "gastritis a secas", "dolor de barriga", "malestar digestivo", "fuego en el estomago", "ardor estomacal"]', 1);

-- 3.4 Catálogo Medicamentos Maestros
INSERT INTO catalogo_medicamentos (id_catalogo, nombre_comercial, sustancia_activa, formato)
VALUES 
(1, 'Aspirina Protect', 'Ácido Acetilsalicílico', 'Tabletas 100mg'),
(2, 'Tylenol 500', 'Paracetamol', 'Tabletas 500mg'),
(3, 'Tempra Jarabe', 'Paracetamol', 'Jarabe Infantil 120ml'),
(4, 'Motrin 400', 'Ibuprofeno', 'Tabletas 400mg'),
(5, 'Amoxil', 'Amoxicilina', 'Cápsulas 500mg'),
(6, 'Treda', 'Neomicina, Caolín, Pectina', 'Tabletas'),
(7, 'Pepto-Bismol', 'Subsalicilato de Bismuto', 'Suspensión 236ml'),
(8, 'Aleve', 'Naproxeno Sódico', 'Tabletas 220mg'),
(9, 'Loratadina Genérico', 'Loratadina', 'Tabletas 10mg'),
(10, 'Riopan Gel', 'Magaldrato con Dimeticona', 'Gel Oral 10ml'),
(11, 'Aderogyl 15', 'Vitaminas A, C y D', 'Ampolletas Bebibles'),
(12, 'Nexium-Mups', 'Esomeprazol Magnésico', 'Tabletas 40mg'),
(13, 'Dolo-Neurobión Forte', 'Diclofenaco con Complejo B', 'Tabletas'),
(14, 'Desenfriol-D', 'Paracetamol, Clorfenamina, Fenilefrina', 'Tabletas masticables'),
(15, 'Mucosolvan', 'Ambroxol Clorhidrato', 'Jarabe 120ml'),
(16, 'Paracetamol Genérico', 'Paracetamol', 'Tabletas 500mg'),
(17, 'Ibuprofeno Genérico', 'Ibuprofeno', 'Tabletas 600mg'),
(18, 'Omeprazol Genérico', 'Omeprazol', 'Cápsulas 20mg'),
(19, 'Clamoxin', 'Amoxicilina con Ácido Clavulánico', 'Tabletas 500mg/125mg'),
(20, 'Ketanov', 'Ketorolaco Trometamina', 'Tabletas Sublinguales 30mg')
ON DUPLICATE KEY UPDATE nombre_comercial = VALUES(nombre_comercial);

-- 3.5 Recetas de Ejemplo (Asociadas al usuario de prueba Modo Demo)
INSERT INTO recetas (id_receta, id_usuario, id_medico, paciente_nombre, fecha_expedicion, diagnostico, codigo_cie10, indicaciones, imagen_base64, estado)
VALUES 
(
    1, 1, 1, 'Versión Demo', '2026-08-15', 'Infección respiratoria alta (Faringitis Aguda)', 'J02.9',
    'Reposo en casa por 3 días, ingesta abundante de líquidos templados y evitar cambios bruscos de temperatura.',
    'data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSI0MDAiIGhlaWdodD0iNTAwIiB2aWV3Qm94PSIwIDAgNDAwIDUwMCI+PHJlY3Qgd2lkdGg9IjEwMCUiIGhlaWdodD0iMTAwJSIgZmlsbD0iI2Y4ZmFmYyIgc3Ryb2tlPSIjY2JkNWUxIiBzdHJva2Utd2lkdGg9IjIiIHJ4PSI4Ii8+PHJlY3QgeD0iMjAiIHk9IjIwIiB3aWR0aD0iMzYwIiBoZWlnaHQ9IjYwIiBmaWxsPSIjZTBmMmZlIiByeD0iNCIvPjx0ZXh0IHg9IjIwMCIgeT0iNTAiIGRvbWluYW50LWJhc2VsaW5lPSJtaWRkbGUiIHRleHQtYW5jaG9yPSJtaWRkbGUiIGZvbnQtZmFtaWx5PSJzYW5zLXNlcmlmIiBmb250LXNpemU9IjE2cHgiIGZvbnQtd2VpZ2h0PSJib2xkIiBmaWxsPSIjMDM2OWExIj5DTEtOSUNBIE1FRElDQSBCREkgLSBSRUNFVEE8L3RleHQ+PHRleHQgeD0iNDAiIHk9IjEyMCIgZm9udC1mYW1pbHk9InNhbnMtc2VyaWYiIGZvbnQtc2l6ZT0iMTJweCIgZmlsbD0iIzQ3NTU2OSI+UGFjaWVudGU6IEp1YW4gUMOpcmV6IE1vcmFsZXM8L3RleHQ+PHRleHQgeD0iNDAiIHk9IjE0NSIgZm9udC1mYW1pbHk9InNhbnMtc2VyaWYiIGZvbnQtc2l6ZT0iMTJweCIgZmlsbD0iIzQ3NTU2OSI+TcOpZGljbzogRHIuIFJvYmVydG8gTWFydMOtbmV6IChDRUQtODQ5MjAxMSk8L3RleHQ+PHRleHQgeD0iNDAiIHk9IjE3MCIgZm9udC1mYW1pbHk9InNhbnMtc2VyaWYiIGZvbnQtc2l6ZT0iMTJweCIgZmlsbD0iIzQ3NTU2OSI+RGlhZ27Ds3N0aWNvOiBGYXJpbmdpdGlzIEFndWRhIChDSUUtMTA6IEowMi45KTwvdGV4dD48bGluZSB4MT0iNDAiIHkxPSIxOTUiIHgyPSIzNjAiIHkyPSIxOTUiIHN0cm9rZT0iI2NiZDVlMSIgc3Ryb2tlLXdpZHRoPSIxIi8+PHRleHQgeD0iNDAiIHk9IjIyMCIgZm9udC1mYW1pbHk9InNhbnMtc2VyaWYiIGZvbnQtc2l6ZT0iMTNweCIgZm9udC13ZWlnaHQ9ImJvbGQiIGZpbGw9IiMwZjE3MmEiPlByZXNjcmlwY2nDs246PC90ZXh0Pjx0ZXh0IHg9IjUwIiB5PSIyNDUiIGZvbnQtZmFtaWx5PSJzYW5zLXNlcmlmIiBmb250LXNpemU9IjExcHgiIGZpbGw9IiMzMzQxNTUiPjEuIEFtb3hpbCA1MDBtZyAtIDEgY8OhcHN1bGEgYy84aCB4IDcgZMOtYXM8L3RleHQ+PHRleHQgeD0iNTAiIHk9IjI3MCIgZm9udC1mYW1pbHk9InNhbnMtc2VyaWYiIGZvbnQtc2l6ZT0iMTFweCIgZmlsbD0iIzMzNDE1NSI+Mi4gVHlsZW5vbCA1MDBtZyAtIDEgdGFibGV0YSBjLzhoIGVuIGNhc28gZGUgZmllYnJlPC90ZXh0Pjwvc3ZnPg==',
    'procesada'
),
(
    2, 1, 2, 'Versión Demo', '2026-09-02', 'Gastritis aguda y pirosis', 'K29.00',
    'Dieta blanda baja en grasas e irritantes por 10 días.',
    'data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSI0MDAiIGhlaWdodD0iNTAwIiB2aWV3Qm94PSIwIDAgNDAwIDUwMCI+PHJlY3Qgd2lkdGg9IjEwMCUiIGhlaWdodD0iMTAwJSIgZmlsbD0iI2Y4ZmFmYyIgc3Ryb2tlPSIjY2JkNWUxIiBzdHJva2Utd2lkdGg9IjIiIHJ4PSI4Ii8+PHJlY3QgeD0iMjAiIHk9IjIwIiB3aWR0aD0iMzYwIiBoZWlnaHQ9IjYwIiBmaWxsPSIjZTBmMmZlIiByeD0iNCIvPjx0ZXh0IHg9IjIwMCIgeT0iNTAiIGRvbWluYW50LWJhc2VsaW5lPSJtaWRkbGUiIHRleHQtYW5jaG9yPSJtaWRkbGUiIGZvbnQtZmFtaWx5PSJzYW5zLXNlcmlmIiBmb250LXNpemU9IjE2cHgiIGZvbnQtd2VpZ2h0PSJib2xkIiBmaWxsPSIjMDM2OWExIj5DTElOSUNBIEdBU1RST0VOVEVST0xPR0lBPC90ZXh0Pjx0ZXh0IHg9IjQwIiB5PSIxMjAiIGZvbnQtZmFtaWx5PSJzYW5zLXNlcmlmIiBmb250LXNpemU9IjEycHgiIGZpbGw9IiM0NzU1NjkiPlBhY2llbnRlOiBKdWFuIFDDqXJleiBNb3JhbGVzPC90ZXh0Pjx0ZXh0IHg9IjQwIiB5PSIxNDUiIGZvbnQtZmFtaWx5PSJzYW5zLXNlcmlmIiBmb250LXNpemU9IjEycHgiIGZpbGw9IiM0NzU1NjkiPk3DqWRpY286IERyLiBGZXJuYW5kbyBDYXN0cm8gKENFRC03MzYyODE5KTwvdGV4dD48bGluZSB4MT0iNDAiIHkxPSIxODAiIHgyPSIzNjAiIHkyPSIxODAiIHN0cm9rZT0iI2NiZDVlMSIgc3Ryb2tlLXdpZHRoPSIxIi8+PHRleHQgeD0iNTAiIHk9IjIxMCIgZm9udC1mYW1pbHk9InNhbnMtc2VyaWYiIGZvbnQtc2l6ZT0iMTFweCIgZmlsbD0iIzMzNDE1NSI+MS4gUmlvcGFuIEdlbCAtIDEgc29icmUgZGVzcHXDqXMgZGUgY29tZXI8L3RleHQ+PHRleHQgeD0iNTAiIHk9IjIzNSIgZm9udC1mYW1pbHk9InNhbnMtc2VyaWYiIGZvbnQtc2l6ZT0iMTFweCIgZmlsbD0iIzMzNDE1NSI+Mi4gT21lcHJhem9sIDIwbWcgLSAxIGPDoXBzdWxhIGVuIGF5dW5hczwvdGV4dD48L3N2Zz4=',
    'procesada'
)
ON DUPLICATE KEY UPDATE diagnostico = VALUES(diagnostico);

-- 3.6 Detalles de Receta (4 fármacos prescritos)
INSERT INTO recetas_detalles (id_receta_detalle, id_receta, id_catalogo, dosis, instrucciones_uso, frecuencia, duracion)
VALUES 
(1, 1, 5, '500mg', 'Tomar 1 cápsula vía oral con alimentos', 'Cada 8 horas', '7 días'),
(2, 1, 2, '500mg', 'Tomar 1 tableta vía oral en caso de dolor o fiebre mayor a 38°C', 'Cada 8 horas (SOS)', '3 días'),
(3, 2, 10, '10ml', 'Tomar 1 sobre vía oral 1 hora después de los alimentos', 'Cada 8 horas', '10 días'),
(4, 2, 18, '20mg', 'Tomar 1 cápsula vía oral 30 minutos antes del desayuno', 'Cada 24 horas', '14 días')
ON DUPLICATE KEY UPDATE dosis = VALUES(dosis);

-- 3.7 Botiquín Físico
-- Contiene tanto los medicamentos prescritos en recetas como fármacos de libre venta (OTC)
INSERT INTO botiquin (id_botiquin, id_usuario, id_catalogo, id_receta, cantidad_disponible, unidad, fecha_caducidad, lote, codigo_barras, notas, estado)
VALUES 
-- 1. Medicamentos derivados de Receta 1 (Faringitis)
(1, 1, 5, 1, 14, 'capsulas', DATE_ADD(CURDATE(), INTERVAL 240 DAY), 'LOT-AMX-2027', '7501234567890', 'Caja del tratamiento de faringitis (Receta 1)', 'vigente'),
(2, 1, 2, 1, 4, 'tabletas', DATE_ADD(CURDATE(), INTERVAL 18 DAY), 'LOT-TYL-9981', '7509876543210', 'Quedan pocas tabletas de Tylenol (Receta 1, por vencer)', 'por_vencer'),

-- 2. Medicamentos derivados de Receta 2 (Gastritis / Pirosis)
(3, 1, 10, 2, 8, 'sobres', DATE_ADD(CURDATE(), INTERVAL 180 DAY), 'LOT-RIO-4455', '7503334445556', 'Gel para acidez estomacal (Receta 2)', 'vigente'),
(4, 1, 18, 2, 14, 'capsulas', DATE_ADD(CURDATE(), INTERVAL 300 DAY), 'LOT-OME-2027', '7504445556667', 'Omeprazol para gastritis en ayunas (Receta 2)', 'vigente'),

-- 3. Medicamentos de libre venta / uso común (sin receta)
(5, 1, 1, NULL, 20, 'tabletas', DATE_SUB(CURDATE(), INTERVAL 15 DAY), 'LOT-ASP-1029', '7501112223334', 'Aspirina Protect compradas el año pasado (caducado)', 'caducado'),
(6, 1, 4, NULL, 2, 'tabletas', DATE_ADD(CURDATE(), INTERVAL 120 DAY), 'LOT-MOT-7788', '7507778889990', 'Motrin 400 para dolor muscular (stock bajo por agotarse)', 'vigente'),
(7, 1, 7, NULL, 1, 'frascos', DATE_ADD(CURDATE(), INTERVAL 210 DAY), 'LOT-PEP-3321', '7508889991112', 'Pepto-Bismol suspensión estomacal', 'vigente')
ON DUPLICATE KEY UPDATE 
    cantidad_disponible = VALUES(cantidad_disponible),
    fecha_caducidad = VALUES(fecha_caducidad),
    estado = VALUES(estado);

-- 3.8 Recordatorios y Tomas Diarias (Asociados al tratamiento de Amoxil de la Receta 1)
INSERT IGNORE INTO recordatorios (id_recordatorio, id_usuario, id_catalogo, id_receta_detalle, medicamento_nombre, formato, frecuencia_horas, fecha_inicio, fecha_fin)
VALUES (
    1, 1, 5, 1, 'Amoxil 500mg', 'Cápsulas', 8, NOW(), DATE_ADD(NOW(), INTERVAL 7 DAY)
);

INSERT IGNORE INTO tomas_diarias (id_toma, id_recordatorio, id_usuario, fecha_hora_programada, estado, fecha_hora_toma)
VALUES 
    (1, 1, 1, DATE_ADD(NOW(), INTERVAL -2 HOUR), 'tomado', DATE_ADD(NOW(), INTERVAL -2 HOUR)),
    (2, 1, 1, DATE_ADD(NOW(), INTERVAL 5 MINUTE), 'pendiente', NULL),
    (3, 1, 1, DATE_ADD(NOW(), INTERVAL 6 HOUR), 'pendiente', NULL)
ON DUPLICATE KEY UPDATE estado = VALUES(estado);

-- 3.9 Historial de Búsquedas (Cotizaciones de Google Shopping)
INSERT INTO busquedas_precios (id_busqueda, id_usuario, medicamento_nombre, resultados, fuente)
VALUES 
(
    1, 1, 'Paracetamol 500mg',
    '[{"title": "Paracetamol 500 mg 20 tabletas", "price": "$28.50", "store": "Farmacias del Ahorro", "link": "https://www.fahorro.com", "thumbnail": "https://via.placeholder.com/150"}, {"title": "Tylenol Caplets 500mg 20 pzas", "price": "$89.00", "store": "Farmacia San Pablo", "link": "https://www.farmaciasanpablo.com.mx", "thumbnail": "https://via.placeholder.com/150"}]',
    'google_shopping'
),
(
    2, 1, 'Amoxicilina 500mg',
    '[{"title": "Amoxicilina 500 mg 12 cápsulas", "price": "$45.00", "store": "Farmacias Similares", "link": "https://farmaciasdesimilares.com", "thumbnail": "https://via.placeholder.com/150"}, {"title": "Amoxil 500mg 15 caps", "price": "$185.00", "store": "Farmacias Guadalajara", "link": "https://www.farmaciasguadalajara.com", "thumbnail": "https://via.placeholder.com/150"}]',
    'google_shopping'
)
ON DUPLICATE KEY UPDATE medicamento_nombre = VALUES(medicamento_nombre);

SELECT 'Instalación y población completa de bdi_final_db finalizada con éxito.' AS estado_instalacion;

