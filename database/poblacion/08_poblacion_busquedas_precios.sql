-- ==========================================================
-- BDI - Script de Población: busquedas_precios
-- Descripción: Muestras de historial de cotizaciones de Google Shopping en JSON
-- para alimentar la vista de búsquedas recientes.
-- ==========================================================

USE bdi_final_db;

INSERT INTO busquedas_precios (id_busqueda, id_usuario, medicamento_nombre, resultados, fuente)
VALUES 
(
    1,
    1,
    'Paracetamol 500mg',
    '[{"title": "Paracetamol 500 mg 20 tabletas", "price": "$28.50", "store": "Farmacias del Ahorro", "link": "https://www.fahorro.com", "thumbnail": "https://via.placeholder.com/150"}, {"title": "Tylenol Caplets 500mg 20 pzas", "price": "$89.00", "store": "Farmacia San Pablo", "link": "https://www.farmaciasanpablo.com.mx", "thumbnail": "https://via.placeholder.com/150"}]',
    'google_shopping'
),
(
    2,
    1,
    'Amoxicilina 500mg',
    '[{"title": "Amoxicilina 500 mg 12 cápsulas", "price": "$45.00", "store": "Farmacias Similares", "link": "https://farmaciasdesimilares.com", "thumbnail": "https://via.placeholder.com/150"}, {"title": "Amoxil 500mg 15 caps", "price": "$185.00", "store": "Farmacias Guadalajara", "link": "https://www.farmaciasguadalajara.com", "thumbnail": "https://via.placeholder.com/150"}]',
    'google_shopping'
)
ON DUPLICATE KEY UPDATE 
    medicamento_nombre = VALUES(medicamento_nombre),
    resultados = VALUES(resultados);
