-- ==========================================================
-- BDI - Script de Población: botiquin
-- Descripción: Medicamentos físicos de inventario personal para pruebas
-- con fechas que disparan los estados: 'vigente', 'por_vencer' y 'caducado'.
-- ==========================================================

USE bdi_final_db;

INSERT INTO botiquin (id_botiquin, id_usuario, id_catalogo, id_receta, cantidad_disponible, unidad, fecha_caducidad, lote, codigo_barras, notas, estado)
VALUES 
-- Vigente (derivado de Receta 1)
(1, 1, 5, 1, 14, 'capsulas', DATE_ADD(CURDATE(), INTERVAL 240 DAY), 'LOT-AMX-2027', '7501234567890', 'Caja del tratamiento de faringitis', 'vigente'),

-- Por vencer (≤ 30 días - activa alerta preventiva)
(2, 1, 2, 1, 4, 'tabletas', DATE_ADD(CURDATE(), INTERVAL 18 DAY), 'LOT-TYL-9981', '7509876543210', 'Quedan pocas tabletas de Tylenol', 'por_vencer'),

-- Caducado (fecha vencida en el pasado)
(3, 1, 1, NULL, 20, 'tabletas', DATE_SUB(CURDATE(), INTERVAL 15 DAY), 'LOT-ASP-1029', '7501112223334', 'Aspirinas compradas el año pasado', 'caducado'),

-- Vigente OTC (sin receta)
(4, 1, 10, 2, 8, 'sobres', DATE_ADD(CURDATE(), INTERVAL 180 DAY), 'LOT-RIO-4455', '7503334445556', 'Gel para acidez estomacal', 'vigente'),

-- Vigente con poco stock (para prueba de alerta de voz por agotarse: cantidad < 5)
(5, 1, 4, NULL, 2, 'tabletas', DATE_ADD(CURDATE(), INTERVAL 120 DAY), 'LOT-MOT-7788', '7507778889990', 'Motrin para dolor muscular (por agotarse)', 'vigente')
ON DUPLICATE KEY UPDATE 
    cantidad_disponible = VALUES(cantidad_disponible),
    fecha_caducidad = VALUES(fecha_caducidad),
    estado = VALUES(estado);
