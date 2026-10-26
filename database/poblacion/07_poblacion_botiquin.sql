-- ==========================================================
-- BDI - Script de Población: botiquin
-- Descripción: Medicamentos físicos de inventario personal para pruebas
-- con fechas que disparan los estados: 'vigente', 'por_vencer' y 'caducado'.
-- ==========================================================

USE bdi_final_db;

INSERT INTO botiquin (id_botiquin, id_usuario, id_catalogo, id_receta, cantidad_disponible, unidad, fecha_caducidad, lote, codigo_barras, notas, estado)
VALUES 
-- 1. Medicamentos derivados de Recetas Médicas (coinciden con recetas y detalles)
-- Amoxil (Receta 1 - Faringitis)
(1, 1, 5, 1, 14, 'capsulas', DATE_ADD(CURDATE(), INTERVAL 240 DAY), 'LOT-AMX-2027', '7501234567890', 'Caja del tratamiento de faringitis (Receta 1)', 'vigente'),

-- Tylenol (Receta 1 - Faringitis, por vencer ≤ 30 días para prueba de semáforo amarillo)
(2, 1, 2, 1, 4, 'tabletas', DATE_ADD(CURDATE(), INTERVAL 18 DAY), 'LOT-TYL-9981', '7509876543210', 'Quedan pocas tabletas de Tylenol (Receta 1, por vencer)', 'por_vencer'),

-- Riopan Gel (Receta 2 - Gastritis)
(3, 1, 10, 2, 8, 'sobres', DATE_ADD(CURDATE(), INTERVAL 180 DAY), 'LOT-RIO-4455', '7503334445556', 'Gel para acidez estomacal (Receta 2)', 'vigente'),

-- Omeprazol (Receta 2 - Gastritis)
(4, 1, 18, 2, 14, 'capsulas', DATE_ADD(CURDATE(), INTERVAL 300 DAY), 'LOT-OME-2027', '7504445556667', 'Omeprazol para gastritis en ayunas (Receta 2)', 'vigente'),

-- 2. Medicamentos adicionales (sin receta / botiquín de libre venta)
-- Caducado (fecha en el pasado para prueba de semáforo rojo)
(5, 1, 1, NULL, 20, 'tabletas', DATE_SUB(CURDATE(), INTERVAL 15 DAY), 'LOT-ASP-1029', '7501112223334', 'Aspirina Protect compradas el año pasado (caducado)', 'caducado'),

-- Vigente con poco stock (cantidad < 5 para prueba de alerta por agotarse)
(6, 1, 4, NULL, 2, 'tabletas', DATE_ADD(CURDATE(), INTERVAL 120 DAY), 'LOT-MOT-7788', '7507778889990', 'Motrin 400 para dolor muscular (stock bajo por agotarse)', 'vigente'),

-- Vigente OTC para síntomas gastrointestinales comunes
(7, 1, 7, NULL, 1, 'frascos', DATE_ADD(CURDATE(), INTERVAL 210 DAY), 'LOT-PEP-3321', '7508889991112', 'Pepto-Bismol suspensión estomacal', 'vigente')
ON DUPLICATE KEY UPDATE 
    cantidad_disponible = VALUES(cantidad_disponible),
    fecha_caducidad = VALUES(fecha_caducidad),
    estado = VALUES(estado);
