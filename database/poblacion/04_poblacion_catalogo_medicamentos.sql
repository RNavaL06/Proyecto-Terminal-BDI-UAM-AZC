-- ==========================================================
-- BDI - Script de Población: catalogo_medicamentos
-- Descripción: Catálogo estandarizado de fármacos comerciales comunes en México
-- con indicación de su principio activo y forma farmacéutica.
-- ==========================================================

USE bdi_final_db;

INSERT INTO catalogo_medicamentos (id_catalogo, nombre_comercial, sustancia_activa, formato, laboratorio)
VALUES 
(1, 'Aspirina Protect', 'Ácido Acetilsalicílico', 'Tabletas 100mg', 'Bayer'),
(2, 'Tylenol 500', 'Paracetamol', 'Tabletas 500mg', 'Johnson & Johnson'),
(3, 'Tempra Jarabe', 'Paracetamol', 'Jarabe Infantil 120ml', 'Reckitt Benckiser'),
(4, 'Motrin 400', 'Ibuprofeno', 'Tabletas 400mg', 'Pfizer'),
(5, 'Amoxil', 'Amoxicilina', 'Cápsulas 500mg', 'GlaxoSmithKline'),
(6, 'Treda', 'Neomicina, Caolín, Pectina', 'Tabletas', 'Sanfer'),
(7, 'Pepto-Bismol', 'Subsalicilato de Bismuto', 'Suspensión 236ml', 'Procter & Gamble'),
(8, 'Aleve', 'Naproxeno Sódico', 'Tabletas 220mg', 'Bayer'),
(9, 'Loratadina Genérico', 'Loratadina', 'Tabletas 10mg', 'Genéricos Mexicanos'),
(10, 'Riopan Gel', 'Magaldrato con Dimeticona', 'Gel Oral 10ml', 'Takeda'),
(11, 'Aderogyl 15', 'Vitaminas A, C y D', 'Ampolletas Bebibles', 'Sanofi'),
(12, 'Nexium-Mups', 'Esomeprazol Magnésico', 'Tabletas 40mg', 'AstraZeneca'),
(13, 'Dolo-Neurobión Forte', 'Diclofenaco con Complejo B', 'Tabletas', 'Procter & Gamble'),
(14, 'Desenfriol-D', 'Paracetamol, Clorfenamina, Fenilefrina', 'Tabletas masticables', 'Bayer'),
(15, 'Mucosolvan', 'Ambroxol Clorhidrato', 'Jarabe 120ml', 'Boehringer Ingelheim'),
(16, 'Paracetamol Genérico', 'Paracetamol', 'Tabletas 500mg', 'Farmacias Similares'),
(17, 'Ibuprofeno Genérico', 'Ibuprofeno', 'Tabletas 600mg', 'Genéricos Mexicanos'),
(18, 'Omeprazol Genérico', 'Omeprazol', 'Cápsulas 20mg', 'Genéricos Mexicanos'),
(19, 'Clamoxin', 'Amoxicilina con Ácido Clavulánico', 'Tabletas 500mg/125mg', 'Rayere'),
(20, 'Ketanov', 'Ketorolaco Trometamina', 'Tabletas Sublinguales 30mg', 'Senosiain')
ON DUPLICATE KEY UPDATE 
    nombre_comercial = VALUES(nombre_comercial),
    sustancia_activa = VALUES(sustancia_activa),
    formato = VALUES(formato);
