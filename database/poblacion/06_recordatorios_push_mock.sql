-- ========================================================
-- Script para poblar tomas de prueba (Mocks)
-- Ejecutar DESPUÉS de poblar usuarios y catálogo
-- ========================================================

-- Insertar un recordatorio de prueba para el usuario 1 (Aspirina)
-- Asumiendo que el usuario 1 existe y el catálogo tiene un medicamento ID 1
INSERT IGNORE INTO recordatorios (id_usuario, id_catalogo, medicamento_nombre, formato, frecuencia_horas, fecha_inicio, fecha_fin)
VALUES (
    1, 
    NULL, 
    'Aspirina 500mg (Prueba)', 
    'Tabletas', 
    8, 
    NOW(), 
    DATE_ADD(NOW(), INTERVAL 3 DAY)
);

-- Insertar algunas tomas para HOY
SET @last_recordatorio_id = LAST_INSERT_ID();

INSERT IGNORE INTO tomas_diarias (id_recordatorio, id_usuario, fecha_hora_programada, estado)
VALUES 
    (@last_recordatorio_id, 1, DATE_ADD(NOW(), INTERVAL -2 HOUR), 'tomado'),
    (@last_recordatorio_id, 1, DATE_ADD(NOW(), INTERVAL 5 MINUTE), 'pendiente'),
    (@last_recordatorio_id, 1, DATE_ADD(NOW(), INTERVAL 6 HOUR), 'pendiente');
