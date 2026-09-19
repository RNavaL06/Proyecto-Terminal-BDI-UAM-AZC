-- ==========================================================
-- BDI - Script de Población: medicos
-- Descripción: Registro de facultativos médicos con cédulas profesionales reales
-- ==========================================================

USE bdi_final_db;

INSERT INTO medicos (id_medico, nombre_medico, cedula_profesional, especialidad, telefono_contacto)
VALUES 
(1, 'Dr. Roberto Martínez Esquivel', 'CED-MED-8492011', 'Medicina General', '55-5318-9000'),
(2, 'Dra. Elena Gómez Santillán', 'CED-MED-9182344', 'Otorrinolaringología', '55-5318-9123'),
(3, 'Dr. Fernando Castro Navarrete', 'CED-MED-7362819', 'Gastroenterología', '55-5318-9456'),
(4, 'Dra. Patricia Ortiz Mendoza', 'CED-MED-6281920', 'Medicina Interna', '55-5318-9789')
ON DUPLICATE KEY UPDATE 
    nombre_medico = VALUES(nombre_medico),
    especialidad = VALUES(especialidad);
