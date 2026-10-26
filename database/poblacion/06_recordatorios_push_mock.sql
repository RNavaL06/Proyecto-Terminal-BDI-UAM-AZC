-- ========================================================
-- Script para poblar tomas de prueba (Mocks)
-- Ejecutar DESPUÉS de poblar usuarios y catálogo
-- ========================================================

-- Insertar un recordatorio de prueba para el usuario 1 derivado de la Receta 1 (Amoxil 500mg)
INSERT IGNORE INTO recordatorios (id_recordatorio, id_usuario, id_catalogo, id_receta_detalle, medicamento_nombre, formato, frecuencia_horas, fecha_inicio, fecha_fin)
VALUES (
    1,
    1, 
    5, 
    1,
    'Amoxil 500mg', 
    'Cápsulas', 
    8, 
    NOW(), 
    DATE_ADD(NOW(), INTERVAL 7 DAY)
);

-- Insertar tomas programadas para HOY
INSERT IGNORE INTO tomas_diarias (id_toma, id_recordatorio, id_usuario, fecha_hora_programada, estado, fecha_hora_toma)
VALUES 
    (1, 1, 1, DATE_ADD(NOW(), INTERVAL -2 HOUR), 'tomado', DATE_ADD(NOW(), INTERVAL -2 HOUR)),
    (2, 1, 1, DATE_ADD(NOW(), INTERVAL 5 MINUTE), 'pendiente', NULL),
    (3, 1, 1, DATE_ADD(NOW(), INTERVAL 6 HOUR), 'pendiente', NULL)
ON DUPLICATE KEY UPDATE estado = VALUES(estado);
