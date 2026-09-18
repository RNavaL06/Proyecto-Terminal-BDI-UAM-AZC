# Botiquín Digital Inteligente (BDI) — Versión Final Unificada
**Proyecto Terminal — Universidad Autónoma Metropolitana (Unidad Azcapotzalco - CBI)**

Sistema web clínico y responsivo que digitaliza recetas médicas, previene la automedicación, monitorea la caducidad de fármacos domésticos mediante tareas programadas, ofrece accesibilidad universal por voz (STT/TTS) y permite la geolocalización y cotización de medicamentos en farmacias mexicanas.

---

## 🏥 Características Principales del Sistema Unificado

1. **Digitalización de Recetas con Visión Multimodal:**
   - Captura en vivo mediante cámara web (`react-webcam`) o carga de archivos de imagen.
   - Preprocesamiento y compresión en servidor con **Sharp** para reducir latencia y cuota de tokens.
   - Extracción de datos clínicos con Inteligencia Artificial (Gemini / Groq Vision).
2. **Validación Humana Dinámica (`FormularioValidacion.jsx`):**
   - Interfaz editable de datos clínicos extraídos.
   - Botón dinámico **`+ Agregar Medicamento`** para añadir renglones manuales no detectados en la imagen.
   - Casilla de sincronización automática de fármacos con el botiquín físico.
3. **Historial y Visor de Receta con Imagen Original (`RecetaDetalle.jsx`):**
   - Listado paginado de recetas digitalizadas.
   - Vista dual: fotografía original en alta resolución con zoom interactivo a la izquierda, y ficha técnica del médico, diagnóstico CIE-10 y medicamentos prescritos a la derecha.
4. **Inteligencia Clínica, NLP y Estandarización CIE-10 (`node-nlp`):**
   - Mapeo de síntomas coloquiales mexicanos (*"panza"*, *"calentura"*, *"retortijón"*) a términos médicos oficiales de la OMS.
   - **Algoritmo de Relevancia Diagnóstica** con scoring determinista, umbral $\ge 50\%$ y entrega del Top-3.
   - Cruce en tiempo real con el expediente del paciente y su stock disponible en botiquín.
5. **Accesibilidad Universal por Voz Bidireccional:**
   - **Speech-to-Text (STT):** Dictado de síntomas con manejo de permisos denegados y fallback manual.
   - **Text-to-Speech (TTS):** Síntesis de voz que narra el diagnóstico a velocidad pausada (`0.9x`) y alerta al paciente si algún fármaco de su receta está por agotarse en su casa.
6. **Alertas Automáticas de Caducidad en Segundo Plano:**
   - Tarea programada diaria con **`node-cron`**.
   - Envío automático de correos electrónicos con plantillas HTML estructuradas vía **`nodemailer`**.
   - Preferencias de usuario para configurar el umbral de aviso (7, 15, 30 o 60 días) y botón de correo de prueba.
7. **Geolocalización Dual y Cotización Comercial:**
   - Búsqueda dual: por GPS automático o manual por autocompletado de dirección en México (**Geoapify**).
   - Mapa interactivo con pines de farmacias cercanas, cálculo de distancia métrica y horarios (**Leaflet**).
   - Comparador de precios en tiempo real con Google Shopping México vía **SerpApi** con guardado en historial de búsquedas.

---

## 🛠️ Stack Tecnológico

| Capa | Tecnologías |
| :--- | :--- |
| **Frontend** | React 19, Vite, Tailwind CSS, Leaflet, react-webcam, react-speech-recognition, lucide-react, react-hot-toast, @headlessui/react |
| **Backend** | Node.js, Express 5, Sharp, node-nlp (@nlpjs/lang-es), node-cron, nodemailer, SerpApi, Google GenAI SDK |
| **Base de Datos** | MySQL 8.0+ (Esquema relacional normalizado en Tercera Forma Normal - 3NF) |
| **Seguridad** | Google OAuth 2.0, JSON Web Tokens (JWT), Helmet, Morgan, Express-Validator |

---

## 🗄️ Base de Datos Modular y Scripts SQL

La base de datos unificada (`bdi_final_db`) se encuentra estructurada en la carpeta [`database/`](./database) con scripts individuales por tabla y scripts individuales de población:

### 1. Definición de Tablas DDL (`database/tablas/`):
- `01_tabla_usuarios.sql`: Usuarios, OAuth, roles y configuración de notificaciones.
- `02_tabla_medicos.sql`: Registro de facultativos y cédulas profesionales.
- `03_tabla_catalogo_cie10.sql`: Catálogo CIE-10 con keywords JSON en lenguaje coloquial.
- `04_tabla_catalogo_medicamentos.sql`: Diccionario maestro de medicamentos estandarizados.
- `05_tabla_recetas.sql`: Cabecera clínica con imagen Base64 para el visor.
- `06_tabla_recetas_detalles.sql`: Renglones de dosificación y tratamiento.
- `07_tabla_botiquin.sql`: Inventario físico doméstico con semáforo de caducidad.
- `08_tabla_busquedas_precios.sql`: Historial de cotizaciones comerciales de Google Shopping.

### 2. Datos Semilla DML (`database/poblacion/`):
- `01_poblacion_usuarios.sql`: Cuentas demo de paciente y administrador.
- `02_poblacion_medicos.sql`: Médicos con cédulas y especialidades.
- `03_poblacion_catalogo_cie10.sql`: Catálogo extenso de diagnósticos y sinónimos.
- `04_poblacion_catalogo_medicamentos.sql`: Fármacos comerciales de México.
- `05_poblacion_recetas.sql`: Recetas de ejemplo con imágenes Base64.
- `06_poblacion_recetas_detalles.sql`: Tratamientos vinculados a las recetas.
- `07_poblacion_botiquin.sql`: Medicamentos en botiquín (vigentes, por vencer y caducados).
- `08_poblacion_busquedas_precios.sql`: Muestras de consultas de precios previas.

### Instalación Rápida de Base de Datos:
```bash
# Opción A: Ejecutar el instalador maestro con todo incluido
mysql -u root -p < database/setup_completo.sql

# Opción B: Ejecutar tabla por tabla
mysql -u root -p < database/00_crear_base_datos.sql
mysql -u root -p bdi_final_db < database/tablas/01_tabla_usuarios.sql
# ... (y así sucesivamente)
```

---

## 🚀 Inicio Rápido en Desarrollo

### 1. Instalación de Dependencias

Desde la raíz del proyecto:
```bash
npm run install:all
```
O de forma manual por carpeta:
```bash
cd server && npm install
cd ../client && npm install
```

### 2. Configuración de Entorno

1. En `server/`: copia `.env.example` a `.env` y configura tus credenciales de MySQL y APIs.
2. En `client/`: copia `.env.example` a `.env`.

### 3. Ejecución

En dos terminales separadas:
```bash
# Terminal 1 - Backend (Puerto 5000)
cd server
npm run dev

# Terminal 2 - Frontend (Puerto 5173 con Vite)
cd client
npm run dev
```

Abre tu navegador en `http://localhost:5173`. Para ingresar de forma inmediata como evaluador sin configurar Google OAuth, utiliza el botón **"Acceder en Modo Demostración (1 Clic)"**.

---

## 📡 Endpoints de la API REST

| Método | Ruta | Descripción |
| :--- | :--- | :--- |
| **POST** | `/api/auth/google` | Inicio de sesión con credencial de Google OAuth |
| **GET** | `/api/auth/me` | Perfil del usuario autenticado *(JWT requerido)* |
| **POST** | `/api/recetas/analizar` | Optimiza imagen con Sharp y extrae datos con IA *(JWT)* |
| **POST** | `/api/recetas/guardar` | Persiste receta y fármacos transaccionalmente en 3NF *(JWT)* |
| **GET** | `/api/recetas?page=&limit=` | Historial paginado de recetas *(JWT)* |
| **GET** | `/api/recetas/:id` | Detalle completo de receta con fotografía Base64 *(JWT)* |
| **PUT/DELETE** | `/api/recetas/:id` | Actualiza o elimina una receta médica *(JWT)* |
| **POST** | `/api/sintomas/analizar` | NLP de síntomas coloquiales a CIE-10 + cruce de botiquín |
| **GET** | `/api/inventario` | Listado del botiquín con cálculo dinámico de caducidad *(JWT)* |
| **GET** | `/api/inventario/alertas` | Alertas de medicamentos por vencer o caducados *(JWT)* |
| **POST** | `/api/inventario/analizar` | Escaneo OCR con IA de caja de medicamento *(JWT)* |
| **POST/PUT/DELETE**| `/api/inventario/:id?` | CRUD individual y batch del botiquín *(JWT)* |
| **POST** | `/api/farmacias/buscar` | Cotización de precios con SerpApi (Google Shopping) *(JWT)* |
| **GET** | `/api/farmacias/historial` | Historial de cotizaciones guardadas *(JWT)* |
| **POST** | `/api/farmacias/cercanas` | Búsqueda de farmacias con coordenadas GPS |
| **GET** | `/api/farmacias/autocompletar` | Autocompletado de direcciones en México con Geoapify |
| **GET/PUT** | `/api/notificaciones/preferencias` | Consulta y actualización de alertas por correo *(JWT)* |
| **POST** | `/api/notificaciones/probar` | Envío de correo de prueba inmediato *(JWT)* |
| **GET** | `/api/health` | Diagnóstico de salud y latencia del servidor y MySQL |
