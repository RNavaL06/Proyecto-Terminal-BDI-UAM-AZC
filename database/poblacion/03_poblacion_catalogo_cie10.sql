-- ==========================================================
-- BDI - Script de Población: catalogo_cie10
-- Descripción: Diccionario de diagnósticos estándar CIE-10 con keywords en JSON
-- estructuradas con lenguaje coloquial mexicano para entrenamiento del motor NLP.
-- ==========================================================

USE bdi_final_db;

INSERT INTO catalogo_cie10 (codigo_cie10, termino_medico, capitulo, keywords, es_frecuente)
VALUES 
('R51', 'Cefalea', 'Síntomas y signos generales', '["cabeza", "migraña", "punzadas", "sien", "jaqueca", "dolor de cabeza", "pesadez de cabeza"]', 1),
('R10', 'Dolor abdominal y pélvico', 'Síntomas del aparato digestivo', '["panza", "estomago", "vientre", "retortijon", "colico", "dolor de panza", "dolor de estomago", "retortijones"]', 1),
('R11.0', 'Náusea', 'Síntomas del aparato digestivo', '["nausea", "ganas", "vomitar", "asco", "revuelto", "estomago revuelto", "mareo estomacal"]', 1),
('R11.1', 'Vómito', 'Síntomas del aparato digestivo', '["vomito", "vomite", "volver", "arrojar", "regresar la comida", "devolver"]', 1),
('R07.0', 'Dolor de garganta', 'Síntomas del aparato respiratorio', '["garganta", "tragar", "anginas", "ardor de garganta", "raspa", "carraspeo", "dolor al tragar"]', 1),
('J02.9', 'Faringitis aguda, no especificada', 'Enfermedades del aparato respiratorio', '["faringitis", "garganta inflamada", "infeccion de garganta", "placas en garganta", "ardor al pasar saliva"]', 1),
('R07.4', 'Dolor en el pecho', 'Síntomas del aparato circulatorio y respiratorio', '["pecho", "corazon", "opresion", "torax", "punzada en el pecho", "aprieta el pecho"]', 1),
('M54.9', 'Dorsalgia, no especificada', 'Enfermedades del sistema osteomuscular', '["espalda", "lumbar", "cintura", "dolor de espalda", "columna", "cadera"]', 1),
('R50.9', 'Fiebre, no especificada', 'Síntomas y signos generales', '["fiebre", "calentura", "temperatura", "hirviendo", "caliente", "escalofrios", "cuerpo caliente"]', 1),
('A09', 'Diarrea y gastroenteritis infecciosa', 'Enfermedades infecciosas intestinales', '["diarrea", "chorrillo", "flojo", "liquido", "evacuacion liquida", "infeccion estomacal", "soltura"]', 1),
('J06.9', 'Infección aguda de las vías respiratorias', 'Enfermedades del aparato respiratorio', '["gripa", "gripe", "catarro", "resfriado", "moco", "mocos", "nariz tapada", "congestion nasal"]', 1),
('R05', 'Tos', 'Síntomas del aparato respiratorio', '["tos", "toser", "carraspeo", "flema", "flemas", "tos seca", "tos con flema", "ataque de tos"]', 1),
('R06.0', 'Disnea', 'Síntomas del aparato respiratorio', '["falta de aire", "respirar", "ahogo", "asfixia", "sofoco", "fatiga al respirar"]', 1),
('R42', 'Mareo y desvanecimiento', 'Síntomas y signos generales', '["mareo", "mareado", "vueltas", "vertigo", "aturdido", "se me mueve el piso"]', 1),
('R55', 'Síncope y colapso', 'Síntomas y signos generales', '["desmayo", "desmaye", "desvanecimiento", "perdi el conocimiento", "inconsciente"]', 1),
('R04.0', 'Epistaxis', 'Síntomas del aparato respiratorio', '["sangrado", "sangre", "nariz", "hemorragia nasal", "sangrado de nariz"]', 1),
('T14.0', 'Contusión, no especificada', 'Traumatismos y envenenamientos', '["moreton", "golpe", "magulladura", "hematoma", "morado", "chichon"]', 1),
('R60.9', 'Edema, no especificado', 'Síntomas y signos generales', '["hinchazon", "hinchado", "inflamado", "retencion", "liquidos", "pies hinchados"]', 1),
('I10', 'Hipertensión esencial (primaria)', 'Enfermedades del sistema circulatorio', '["presion alta", "hipertension", "presion", "subio la presion", "pulso acelerado"]', 1),
('E14', 'Diabetes mellitus, no especificada', 'Enfermedades endocrinas y metabólicas', '["azucar", "diabetes", "glucosa", "azucar alta", "sed excesiva"]', 1),
('R12', 'Pirosis', 'Síntomas del aparato digestivo', '["agruras", "acidez", "quemazon", "reflujo", "ardor de estomago", "agrura"]', 1),
('M79.1', 'Mialgia', 'Enfermedades del sistema osteomuscular', '["musculo", "musculos", "cuerpo cortado", "macullado", "dolor de cuerpo", "adolorido"]', 1),
('M25.5', 'Artralgia', 'Enfermedades del sistema osteomuscular', '["articulaciones", "coyunturas", "huesos", "rodilla", "codo", "dolor de articulaciones"]', 1),
('G47.0', 'Insomnio', 'Enfermedades del sistema nervioso', '["dormir", "insomnio", "sueño", "desvelo", "no puedo dormir", "despertar a medianoche"]', 1),
('F41.9', 'Trastorno de ansiedad, no especificado', 'Trastornos mentales y del comportamiento', '["ansiedad", "nervios", "nerviosismo", "estres", "angustia", "desesperacion"]', 1),
('R53', 'Malestar y fatiga', 'Síntomas y signos generales', '["cansancio", "fatiga", "debilidad", "agotamiento", "pesadez", "sin energias", "flojera"]', 1),
('L29.9', 'Prurito, no especificado', 'Enfermedades de la piel', '["comezon", "picazon", "rascar", "urticaria", "ronchas", "piquiña"]', 1),
('K59.0', 'Estreñimiento', 'Síntomas del aparato digestivo', '["estreñimiento", "tapado", "no puedo obrar", "baño", "constipacion", "duro del estomago"]', 1),
('R30.0', 'Disuria', 'Síntomas del aparato urinario', '["orinar", "ardor al orinar", "pipi", "mal de orin", "dolor en vejiga"]', 1),
('H10.9', 'Conjuntivitis, no especificada', 'Enfermedades del ojo', '["ojo rojo", "ojos", "lagañas", "irritado", "comezon en los ojos", "lagrimeo"]', 1),
('I87.2', 'Insuficiencia venosa', 'Enfermedades del sistema circulatorio', '["pesadez en las piernas", "piernas pesadas", "calambres", "tobillos hinchados", "varices", "mala circulacion", "arañitas", "dolor de piernas", "piernas cansadas"]', 1)
ON DUPLICATE KEY UPDATE 
    termino_medico = VALUES(termino_medico),
    capitulo = VALUES(capitulo),
    keywords = VALUES(keywords),
    es_frecuente = VALUES(es_frecuente);
