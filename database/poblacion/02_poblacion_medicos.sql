-- ==========================================================
-- BDI - Script de Población: medicos
-- Descripción: Registro de facultativos médicos con cédulas profesionales reales
-- ==========================================================

USE bdi_final_db;

INSERT INTO medicos (id_medico, nombre_medico, cedula_profesional, telefono_contacto)
VALUES 
(1, 'Dr. Roberto Martínez Esquivel', 'CED-MED-8492011', '55-5318-9000'),
(2, 'Dr. Fernando Castro Navarrete', 'CED-MED-7362819', '55-5318-9456')
ON DUPLICATE KEY UPDATE 
    nombre_medico = VALUES(nombre_medico);
