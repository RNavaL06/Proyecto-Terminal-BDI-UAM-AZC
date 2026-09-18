-- ==========================================================
-- BDI - Script de Población: recetas_detalles
-- Descripción: Filas de tratamiento prescriptivo para las recetas registradas.
-- ==========================================================

USE bdi_final_db;

INSERT INTO recetas_detalles (id_receta_detalle, id_receta, id_catalogo, dosis, instrucciones_uso, frecuencia, duracion)
VALUES 
-- Detalle de Receta 1 (Faringitis)
(1, 1, 5, '500mg', 'Tomar 1 cápsula vía oral con alimentos', 'Cada 8 horas', '7 días'),
(2, 1, 2, '500mg', 'Tomar 1 tableta vía oral en caso de dolor o fiebre mayor a 38°C', 'Cada 8 horas (SOS)', '3 días'),

-- Detalle de Receta 2 (Gastritis / Pirosis)
(3, 2, 10, '10ml', 'Tomar 1 sobre vía oral 1 hora después de los alimentos', 'Cada 8 horas', '10 días'),
(4, 2, 18, '20mg', 'Tomar 1 cápsula vía oral 30 minutos antes del desayuno', 'Cada 24 horas', '14 días')
ON DUPLICATE KEY UPDATE 
    dosis = VALUES(dosis),
    instrucciones_uso = VALUES(instrucciones_uso),
    frecuencia = VALUES(frecuencia),
    duracion = VALUES(duracion);
