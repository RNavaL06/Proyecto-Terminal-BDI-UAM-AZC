-- ==========================================================
-- BDI - Botiquín Digital Inteligente
-- Script de Activación: 05_marcar_cie10_frecuentes_suive.sql
-- 
-- Fuente Oficial: SUIVE / DGE / Secretaría de Salud de México (2025)
-- "Veinte principales causas de enfermedad Nacional - Población General"
-- Complementado con los principales motivos de consulta y síntomas
-- frecuentes de atención primaria (Capítulo XVIII CIE-10).
-- 
-- Propósito:
-- Marca con 'es_frecuente = 1' los diagnósticos prioritarios para
-- que el motor de lenguaje natural (node-nlp) entrene únicamente
-- con los padecimientos habituales de alta incidencia, evitando
-- la saturación de memoria RAM y garantizando respuestas en <15ms.
-- ==========================================================

USE bdi_final_db;

-- 1. Reiniciar bandera de frecuencia en todo el catálogo
UPDATE catalogo_cie10 SET es_frecuente = 0;

-- 2. Activar diagnósticos basados en el Boletín Epidemiológico Oficial SUIVE 2025
--    y sintomatología clínica común de botiquín
UPDATE catalogo_cie10
SET es_frecuente = 1
WHERE 
    -- 1. Infecciones respiratorias agudas (J00-J06, J20, J21)
    codigo_cie10 LIKE 'J00%'
    OR codigo_cie10 LIKE 'J01%'
    OR codigo_cie10 LIKE 'J02%'
    OR codigo_cie10 LIKE 'J03%'
    OR codigo_cie10 LIKE 'J04%'
    OR codigo_cie10 LIKE 'J05%'
    OR codigo_cie10 LIKE 'J06%'
    OR codigo_cie10 LIKE 'J20%'
    OR codigo_cie10 LIKE 'J21%'

    -- 2. Infecciones intestinales por otros organismos (A04, A08-A09)
    OR codigo_cie10 LIKE 'A04%'
    OR codigo_cie10 LIKE 'A08%'
    OR codigo_cie10 LIKE 'A09%'

    -- 3. Infección de vías urinarias (N30, N34, N39.0)
    OR codigo_cie10 LIKE 'N30%'
    OR codigo_cie10 LIKE 'N34%'
    OR codigo_cie10 LIKE 'N39.0%'

    -- 4. Gingivitis y enfermedad periodontal (K05)
    OR codigo_cie10 LIKE 'K05%'

    -- 5. Úlceras, gastritis y duodenitis (K25-K29)
    OR codigo_cie10 LIKE 'K25%'
    OR codigo_cie10 LIKE 'K26%'
    OR codigo_cie10 LIKE 'K27%'
    OR codigo_cie10 LIKE 'K28%'
    OR codigo_cie10 LIKE 'K29%'

    -- 6. Conjuntivitis (H10)
    OR codigo_cie10 LIKE 'H10%'

    -- 7. Obesidad (E66)
    OR codigo_cie10 LIKE 'E66%'

    -- 8. Vulvovaginitis (N76)
    OR codigo_cie10 LIKE 'N76%'

    -- 9. Hipertensión arterial (I10-I15)
    OR codigo_cie10 LIKE 'I10%'
    OR codigo_cie10 LIKE 'I11%'
    OR codigo_cie10 LIKE 'I12%'
    OR codigo_cie10 LIKE 'I13%'
    OR codigo_cie10 LIKE 'I15%'

    -- 10. Otitis media aguda (H65.0-H65.1, H66)
    OR codigo_cie10 LIKE 'H65.0%'
    OR codigo_cie10 LIKE 'H65.1%'
    OR codigo_cie10 LIKE 'H66%'

    -- 11. Diabetes mellitus (E11-E14)
    OR codigo_cie10 LIKE 'E11%'
    OR codigo_cie10 LIKE 'E12%'
    OR codigo_cie10 LIKE 'E13%'
    OR codigo_cie10 LIKE 'E14%'

    -- 12. Faringitis y amigdalitis estreptocócicas (J02.0, J03.0)
    OR codigo_cie10 LIKE 'J02.0%'
    OR codigo_cie10 LIKE 'J03.0%'

    -- 13. Intoxicación por picadura de alacrán (T63.2, X22)
    OR codigo_cie10 LIKE 'T63.2%'
    OR codigo_cie10 LIKE 'X22%'

    -- 14. Accidentes de transporte en vehículos con motor (V20-V29, V40-V79)
    OR codigo_cie10 LIKE 'V2%'
    OR codigo_cie10 LIKE 'V4%'

    -- 15. Insuficiencia venosa periférica (I87.2)
    OR codigo_cie10 LIKE 'I87.2%'

    -- 16. Neumonías y bronconeumonías (J12-J18)
    OR codigo_cie10 LIKE 'J12%'
    OR codigo_cie10 LIKE 'J13%'
    OR codigo_cie10 LIKE 'J14%'
    OR codigo_cie10 LIKE 'J15%'
    OR codigo_cie10 LIKE 'J16%'
    OR codigo_cie10 LIKE 'J17%'
    OR codigo_cie10 LIKE 'J18%'

    -- 17. Depresión (F32)
    OR codigo_cie10 LIKE 'F32%'

    -- 18. Mordeduras por perro (W54)
    OR codigo_cie10 LIKE 'W54%'

    -- 19. Asma (J45, J46)
    OR codigo_cie10 LIKE 'J45%'
    OR codigo_cie10 LIKE 'J46%'

    -- 20. Hiperplasia de la próstata (N40)
    OR codigo_cie10 LIKE 'N40%'

    -- SÍNTOMAS Y SIGNOS CLÍNICOS FRECUENTES (Capítulo XVIII CIE-10)
    -- Motivos recurrentes de uso de botiquín casero
    OR codigo_cie10 IN (
        'R51',    -- Cefalea / Dolor de cabeza / Migraña
        'R10',    -- Dolor abdominal y pélvico / Cólicos
        'R10.0',  -- Abdomen agudo
        'R10.1',  -- Dolor en abdomen superior
        'R10.4',  -- Otros dolores abdominales
        'R11',    -- Náusea y vómito
        'R11.0',  -- Náusea
        'R11.1',  -- Vómito
        'R07.0',  -- Dolor de garganta
        'R07.4',  -- Dolor en el pecho
        'M54.9',  -- Dorsalgia / Dolor de espalda / Lumbalgia
        'R50.9',  -- Fiebre, no especificada
        'R05',    -- Tos
        'R06.0',  -- Disnea / Falta de aire
        'R42',    -- Mareo y desvanecimiento
        'R55',    -- Síncope y colapso
        'R04.0',  -- Epistaxis / Sangrado nasal
        'T14.0',  -- Contusión / Golpe / Moretón
        'R60.9',  -- Edema / Hinchazón
        'R12',    -- Pirosis / Acidez / Agruras / Reflujo
        'M79.1',  -- Mialgia / Dolor muscular
        'M25.5',  -- Artralgia / Dolor articular
        'G47.0',  -- Insomnio
        'F41.9',  -- Trastorno de ansiedad
        'R53',    -- Malestar y fatiga
        'L29.9',  -- Prurito / Comezón / Ronchas
        'K59.0',  -- Estreñimiento
        'R30.0',  -- Disuria / Ardor al orinar
        'H10.9'   -- Conjuntivitis aguda
    );

-- 3. Verificación de registros activados
SELECT 
    COUNT(*) AS total_diagnosticos_frecuentes_activos,
    'Diagnósticos marcados listos para entrenamiento de node-nlp' AS estado
FROM catalogo_cie10 
WHERE es_frecuente = 1;
