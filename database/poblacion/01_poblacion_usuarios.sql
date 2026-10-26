-- ==========================================================
-- BDI - Script de Población: usuarios
-- Descripción: Datos semilla para cuentas de usuario (paciente y administrador)
-- ==========================================================

USE bdi_final_db;

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
