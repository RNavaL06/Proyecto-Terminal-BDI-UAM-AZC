-- ==========================================================
-- BDI - Script de Población: usuarios
-- Descripción: Datos semilla para cuentas de usuario (paciente y administrador)
-- ==========================================================

USE bdi_final_db;

INSERT INTO usuarios (id_usuario, google_id, correo_electronico, nombre_completo, foto_perfil, rol, notif_activas, notif_umbral_dias)
VALUES 
(1, '108291029102910291001', 'juan.perez.paciente@gmail.com', 'Juan Pérez Morales', 'https://lh3.googleusercontent.com/a/default-user', 'paciente', 1, 30),
(2, '209382039203920392002', 'maria.gonzalez@gmail.com', 'Dra. María González Rivas', 'https://lh3.googleusercontent.com/a/default-user', 'admin', 1, 15),
(3, '308472048204820482003', 'carlos.ramirez.demo@gmail.com', 'Carlos Ramírez Soto', 'https://lh3.googleusercontent.com/a/default-user', 'paciente', 0, 7)
ON DUPLICATE KEY UPDATE 
    nombre_completo = VALUES(nombre_completo),
    notif_activas = VALUES(notif_activas),
    notif_umbral_dias = VALUES(notif_umbral_dias);
