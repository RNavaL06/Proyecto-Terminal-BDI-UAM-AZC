-- ==========================================================
-- BDI - Script de Población: recetas
-- Descripción: Prescripciones médicas digitalizadas con imágenes demo en Base64
-- listas para su visualización en el visor de recetas.
-- ==========================================================

USE bdi_final_db;

INSERT INTO recetas (id_receta, id_usuario, id_medico, paciente_nombre, fecha_expedicion, diagnostico, codigo_cie10, indicaciones, imagen_base64, estado)
VALUES 
(
    1, 
    1, 
    1, 
    'Juan Pérez Morales', 
    '2026-08-15', 
    'Infección respiratoria alta (Faringitis Aguda)', 
    'J02.9', 
    'Reposo en casa por 3 días, ingesta abundante de líquidos templados y evitar cambios bruscos de temperatura.', 
    'data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSI0MDAiIGhlaWdodD0iNTAwIiB2aWV3Qm94PSIwIDAgNDAwIDUwMCI+PHJlY3Qgd2lkdGg9IjEwMCUiIGhlaWdodD0iMTAwJSIgZmlsbD0iI2Y4ZmFmYyIgc3Ryb2tlPSIjY2JkNWUxIiBzdHJva2Utd2lkdGg9IjIiIHJ4PSI4Ii8+PHJlY3QgeD0iMjAiIHk9IjIwIiB3aWR0aD0iMzYwIiBoZWlnaHQ9IjYwIiBmaWxsPSIjZTBmMmZlIiByeD0iNCIvPjx0ZXh0IHg9IjIwMCIgeT0iNTAiIGRvbWluYW50LWJhc2VsaW5lPSJtaWRkbGUiIHRleHQtYW5jaG9yPSJtaWRkbGUiIGZvbnQtZmFtaWx5PSJzYW5zLXNlcmlmIiBmb250LXNpemU9IjE2cHgiIGZvbnQtd2VpZ2h0PSJib2xkIiBmaWxsPSIjMDM2OWExIj5DTEtOSUNBIE1FRElDQSBCREkgLSBSRUNFVEE8L3RleHQ+PHRleHQgeD0iNDAiIHk9IjEyMCIgZm9udC1mYW1pbHk9InNhbnMtc2VyaWYiIGZvbnQtc2l6ZT0iMTJweCIgZmlsbD0iIzQ3NTU2OSI+UGFjaWVudGU6IEp1YW4gUMOpcmV6IE1vcmFsZXM8L3RleHQ+PHRleHQgeD0iNDAiIHk9IjE0NSIgZm9udC1mYW1pbHk9InNhbnMtc2VyaWYiIGZvbnQtc2l6ZT0iMTJweCIgZmlsbD0iIzQ3NTU2OSI+TcOpZGljbzogRHIuIFJvYmVydG8gTWFydMOtbmV6IChDRUQtODQ5MjAxMSk8L3RleHQ+PHRleHQgeD0iNDAiIHk9IjE3MCIgZm9udC1mYW1pbHk9InNhbnMtc2VyaWYiIGZvbnQtc2l6ZT0iMTJweCIgZmlsbD0iIzQ3NTU2OSI+RGlhZ27Ds3N0aWNvOiBGYXJpbmdpdGlzIEFndWRhIChDSUUtMTA6IEowMi45KTwvdGV4dD48bGluZSB4MT0iNDAiIHkxPSIxOTUiIHgyPSIzNjAiIHkyPSIxOTUiIHN0cm9rZT0iI2NiZDVlMSIgc3Ryb2tlLXdpZHRoPSIxIi8+PHRleHQgeD0iNDAiIHk9IjIyMCIgZm9udC1mYW1pbHk9InNhbnMtc2VyaWYiIGZvbnQtc2l6ZT0iMTNweCIgZm9udC13ZWlnaHQ9ImJvbGQiIGZpbGw9IiMwZjE3MmEiPlByZXNjcmlwY2nDs246PC90ZXh0Pjx0ZXh0IHg9IjUwIiB5PSIyNDUiIGZvbnQtZmFtaWx5PSJzYW5zLXNlcmlmIiBmb250LXNpemU9IjExcHgiIGZpbGw9IiMzMzQxNTUiPjEuIEFtb3hpbCA1MDBtZyAtIDEgY8OhcHN1bGEgYy84aCB4IDcgZMOtYXM8L3RleHQ+PHRleHQgeD0iNTAiIHk9IjI3MCIgZm9udC1mYW1pbHk9InNhbnMtc2VyaWYiIGZvbnQtc2l6ZT0iMTFweCIgZmlsbD0iIzMzNDE1NSI+Mi4gVHlsZW5vbCA1MDBtZyAtIDEgdGFibGV0YSBjLzhoIGVuIGNhc28gZGUgZmllYnJlPC90ZXh0Pjwvc3ZnPg==', 
    'procesada'
),
(
    2, 
    1, 
    3, 
    'Juan Pérez Morales', 
    '2026-09-02', 
    'Gastritis aguda y pirosis', 
    'R12', 
    'Dieta blanda baja en grasas e irritantes por 10 días.', 
    'data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSI0MDAiIGhlaWdodD0iNTAwIiB2aWV3Qm94PSIwIDAgNDAwIDUwMCI+PHJlY3Qgd2lkdGg9IjEwMCUiIGhlaWdodD0iMTAwJSIgZmlsbD0iI2Y4ZmFmYyIgc3Ryb2tlPSIjY2JkNWUxIiBzdHJva2Utd2lkdGg9IjIiIHJ4PSI4Ii8+PHJlY3QgeD0iMjAiIHk9IjIwIiB3aWR0aD0iMzYwIiBoZWlnaHQ9IjYwIiBmaWxsPSIjZTBmMmZlIiByeD0iNCIvPjx0ZXh0IHg9IjIwMCIgeT0iNTAiIGRvbWluYW50LWJhc2VsaW5lPSJtaWRkbGUiIHRleHQtYW5jaG9yPSJtaWRkbGUiIGZvbnQtZmFtaWx5PSJzYW5zLXNlcmlmIiBmb250LXNpemU9IjE2cHgiIGZvbnQtd2VpZ2h0PSJib2xkIiBmaWxsPSIjMDM2OWExIj5DTElOSUNBIEdBU1RST0VOVEVST0xPR0lBPC90ZXh0Pjx0ZXh0IHg9IjQwIiB5PSIxMjAiIGZvbnQtZmFtaWx5PSJzYW5zLXNlcmlmIiBmb250LXNpemU9IjEycHgiIGZpbGw9IiM0NzU1NjkiPlBhY2llbnRlOiBKdWFuIFDDqXJleiBNb3JhbGVzPC90ZXh0Pjx0ZXh0IHg9IjQwIiB5PSIxNDUiIGZvbnQtZmFtaWx5PSJzYW5zLXNlcmlmIiBmb250LXNpemU9IjEycHgiIGZpbGw9IiM0NzU1NjkiPk3DqWRpY286IERyLiBGZXJuYW5kbyBDYXN0cm8gKENFRC03MzYyODE5KTwvdGV4dD48bGluZSB4MT0iNDAiIHkxPSIxODAiIHgyPSIzNjAiIHkyPSIxODAiIHN0cm9rZT0iI2NiZDVlMSIgc3Ryb2tlLXdpZHRoPSIxIi8+PHRleHQgeD0iNTAiIHk9IjIxMCIgZm9udC1mYW1pbHk9InNhbnMtc2VyaWYiIGZvbnQtc2l6ZT0iMTFweCIgZmlsbD0iIzMzNDE1NSI+MS4gUmlvcGFuIEdlbCAtIDEgc29icmUgZGVzcHXDqXMgZGUgY29tZXI8L3RleHQ+PHRleHQgeD0iNTAiIHk9IjIzNSIgZm9udC1mYW1pbHk9InNhbnMtc2VyaWYiIGZvbnQtc2l6ZT0iMTFweCIgZmlsbD0iIzMzNDE1NSI+Mi4gT21lcHJhem9sIDIwbWcgLSAxIGPDoXBzdWxhIGVuIGF5dW5hczwvdGV4dD48L3N2Zz4=', 
    'procesada'
)
ON DUPLICATE KEY UPDATE 
    diagnostico = VALUES(diagnostico),
    indicaciones = VALUES(indicaciones);
