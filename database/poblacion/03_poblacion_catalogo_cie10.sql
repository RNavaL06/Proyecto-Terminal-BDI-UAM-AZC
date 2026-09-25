-- ==========================================================
-- BDI - Script de Población: catalogo_cie10
-- Descripción: Diccionario de diagnósticos estándar CIE-10 con keywords en JSON
-- estructuradas con lenguaje coloquial mexicano para entrenamiento del motor NLP.
-- ==========================================================

USE bdi_final_db;

INSERT INTO catalogo_cie10 (codigo_cie10, termino_medico, capitulo, keywords)
VALUES 
('R51', 'Cefalea', 'Síntomas y signos generales', '["cabeza", "migraña", "punzadas", "sien", "jaqueca", "dolor de cabeza", "pesadez de cabeza"]'),
('R10', 'Dolor abdominal y pélvico', 'Síntomas del aparato digestivo', '["panza", "estomago", "vientre", "retortijon", "colico", "dolor de panza", "dolor de estomago", "retortijones"]'),
('R11.0', 'Náusea', 'Síntomas del aparato digestivo', '["nausea", "ganas", "vomitar", "asco", "revuelto", "estomago revuelto", "mareo estomacal"]'),
('R11.1', 'Vómito', 'Síntomas del aparato digestivo', '["vomito", "vomite", "volver", "arrojar", "regresar la comida", "devolver"]'),
('R07.0', 'Dolor de garganta', 'Síntomas del aparato respiratorio', '["garganta", "tragar", "anginas", "ardor de garganta", "raspa", "carraspeo", "dolor al tragar"]'),
('J02.9', 'Faringitis aguda, no especificada', 'Enfermedades del aparato respiratorio', '["faringitis", "garganta inflamada", "infeccion de garganta", "placas en garganta", "ardor al pasar saliva"]'),
('R07.4', 'Dolor en el pecho', 'Síntomas del aparato circulatorio y respiratorio', '["pecho", "corazon", "opresion", "torax", "punzada en el pecho", "aprieta el pecho"]'),
('M54.9', 'Dorsalgia, no especificada', 'Enfermedades del sistema osteomuscular', '["espalda", "lumbar", "cintura", "dolor de espalda", "columna", "cadera"]'),
('R50.9', 'Fiebre, no especificada', 'Síntomas y signos generales', '["fiebre", "calentura", "temperatura", "hirviendo", "caliente", "escalofrios", "cuerpo caliente"]'),
('A09', 'Diarrea y gastroenteritis infecciosa', 'Enfermedades infecciosas intestinales', '["diarrea", "chorrillo", "flojo", "liquido", "evacuacion liquida", "infeccion estomacal", "soltura"]'),
('J06.9', 'Infección aguda de las vías respiratorias', 'Enfermedades del aparato respiratorio', '["gripa", "gripe", "catarro", "resfriado", "moco", "mocos", "nariz tapada", "congestion nasal"]'),
('R05', 'Tos', 'Síntomas del aparato respiratorio', '["tos", "toser", "carraspeo", "flema", "flemas", "tos seca", "tos con flema", "ataque de tos"]'),
('R06.0', 'Disnea', 'Síntomas del aparato respiratorio', '["falta de aire", "respirar", "ahogo", "asfixia", "sofoco", "fatiga al respirar"]'),
('R42', 'Mareo y desvanecimiento', 'Síntomas y signos generales', '["mareo", "mareado", "vueltas", "vertigo", "aturdido", "se me mueve el piso"]'),
('R55', 'Síncope y colapso', 'Síntomas y signos generales', '["desmayo", "desmaye", "desvanecimiento", "perdi el conocimiento", "inconsciente"]'),
('R04.0', 'Epistaxis', 'Síntomas del aparato respiratorio', '["sangrado", "sangre", "nariz", "hemorragia nasal", "sangrado de nariz"]'),
('T14.0', 'Contusión, no especificada', 'Traumatismos y envenenamientos', '["moreton", "golpe", "magulladura", "hematoma", "morado", "chichon"]'),
('R60.9', 'Edema, no especificado', 'Síntomas y signos generales', '["hinchazon", "hinchado", "inflamado", "retencion", "liquidos", "pies hinchados"]'),
('I10', 'Hipertensión esencial (primaria)', 'Enfermedades del sistema circulatorio', '["presion alta", "hipertension", "presion", "subio la presion", "pulso acelerado"]'),
('E14', 'Diabetes mellitus, no especificada', 'Enfermedades endocrinas y metabólicas', '["azucar", "diabetes", "glucosa", "azucar alta", "sed excesiva"]'),
('R12', 'Pirosis', 'Síntomas del aparato digestivo', '["agruras", "acidez", "quemazon", "reflujo", "ardor de estomago", "agrura"]'),
('M79.1', 'Mialgia', 'Enfermedades del sistema osteomuscular', '["musculo", "musculos", "cuerpo cortado", "macullado", "dolor de cuerpo", "adolorido"]'),
('M25.5', 'Artralgia', 'Enfermedades del sistema osteomuscular', '["articulaciones", "coyunturas", "huesos", "rodilla", "codo", "dolor de articulaciones"]'),
('G47.0', 'Insomnio', 'Enfermedades del sistema nervioso', '["dormir", "insomnio", "sueño", "desvelo", "no puedo dormir", "despertar a medianoche"]'),
('F41.9', 'Trastorno de ansiedad, no especificado', 'Trastornos mentales y del comportamiento', '["ansiedad", "nervios", "nerviosismo", "estres", "angustia", "desesperacion"]'),
('R53', 'Malestar y fatiga', 'Síntomas y signos generales', '["cansancio", "fatiga", "debilidad", "agotamiento", "pesadez", "sin energias", "flojera"]'),
('L29.9', 'Prurito, no especificado', 'Enfermedades de la piel', '["comezon", "picazon", "rascar", "urticaria", "ronchas", "piquiña"]'),
('K59.0', 'Estreñimiento', 'Síntomas del aparato digestivo', '["estreñimiento", "tapado", "no puedo obrar", "baño", "constipacion", "duro del estomago"]'),
('R30.0', 'Disuria', 'Síntomas del aparato urinario', '["orinar", "ardor al orinar", "pipi", "mal de orin", "dolor en vejiga"]'),
('H10.9', 'Conjuntivitis, no especificada', 'Enfermedades del ojo', '["ojo rojo", "ojos", "lagañas", "irritado", "comezon en los ojos", "lagrimeo"]'),
('I87.2', 'Insuficiencia venosa', 'Enfermedades del sistema circulatorio', '["pesadez en las piernas", "piernas pesadas", "calambres", "tobillos hinchados", "varices", "mala circulacion", "arañitas", "dolor de piernas", "piernas cansadas"]')
ON DUPLICATE KEY UPDATE 
    termino_medico = VALUES(termino_medico),
    capitulo = VALUES(capitulo),
    keywords = VALUES(keywords);
