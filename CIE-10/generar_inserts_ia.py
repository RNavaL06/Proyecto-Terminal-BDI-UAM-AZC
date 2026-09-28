import pandas as pd
import os
import json
import time
import google.generativeai as genai

# --- CONFIGURACIÓN ---
EXCEL_PATH = 'Data/Diagnosticos_Tabla_Referencia_CIE10ES_2026.xlsx'
SHEET_NAME = 'ES2026 Finales'
BASE_OUTPUT_DIR = 'Generados_SQL'

# Si el Excel no tiene columna de capítulo, usamos un valor por defecto.
CAPITULO_POR_DEFECTO = 'Sin especificar' 

# Configurar IA
genai.configure(api_key=API_KEY)
# Usar gemini-1.5-flash (ideal para tareas repetitivas y de texto, muy rápido y económico)
model = genai.GenerativeModel('gemini-3.1-flash-lite', generation_config={"response_mime_type": "application/json"})

def procesar_lote_con_ia(lote_datos):
    """
    Toma una lista de diccionarios y pide a la IA que devuelva la misma lista 
    con los 'keywords' coloquiales.
    """
    prompt = f"""
    Eres un médico experto en salud pública y entiendes a la perfección el lenguaje coloquial y los regionalismos de todos los países de Hispanoamérica (México, Argentina, Chile, Colombia, España, etc.).
    Te daré una lista de enfermedades en formato JSON.
    Devuelve la MISMA lista exacta en formato JSON, pero a cada objeto agrégale una propiedad llamada 'keywords'
    que sea un arreglo de strings con sinónimos, síntomas comunes, o formas coloquiales en las que
    un paciente buscaría esta enfermedad. 
    ¡ES MUY IMPORTANTE! Asegúrate de incluir regionalismos de distintos países (ej: para estómago incluye "panza", "guata", "barriga"; para dolor de cabeza incluye "jaqueca", "migraña", "punzadas").
    No te limites en cantidad. Incluye TODAS las keywords relevantes que se te ocurran (idealmente entre 10 y 20 por enfermedad), abarcando la mayor cantidad de regiones y formas en que la gente lo busca.
    
    Asegúrate de responder SOLO con el arreglo JSON.
    
    Lista:
    {json.dumps(lote_datos, ensure_ascii=False)}
    """
    
    try:
        response = model.generate_content(prompt)
        data = json.loads(response.text)
        return data
    except Exception as e:
        print(f"Error al contactar con la IA: {e}")
        return None

def generar_inserts_ia():
    print("Cargando el Excel...")
    try:
        df = pd.read_excel(EXCEL_PATH, sheet_name=SHEET_NAME, dtype=str)
    except Exception as e:
        print(f"Error al leer excel: {e}")
        return
        
    cols = df.columns.tolist()
    col_codigo = [c for c in cols if 'código' in c.lower() or 'codigo' in c.lower()][0]
    
    # Encontrar la columna de descripción (la más reciente)
    col_desc = [c for c in cols if 'descripción' in c.lower() or 'desc' in c.lower()]
    col_desc = col_desc[-1] if col_desc else cols[1]

    # Agrupar por los primeros 3 caracteres (ej. A00)
    df['subgrupo'] = df[col_codigo].apply(lambda x: str(x)[:3].upper() if pd.notna(x) and len(str(x)) >= 3 else str(x).upper())
    grupos = df.groupby('subgrupo')
    
    total_grupos = len(grupos)
    procesados = 0
    
    print(f"Iniciando procesamiento de {total_grupos} grupos de códigos...")
    
    for subgrupo, datos in grupos:
        procesados += 1
        if subgrupo == 'NAN' or not subgrupo:
            continue
            
        letra = subgrupo[0]
        ruta_carpeta = os.path.join(BASE_OUTPUT_DIR, letra, subgrupo)
        ruta_sql = os.path.join(ruta_carpeta, f"insert_{subgrupo}.sql")
        
        # SISTEMA DE GUARDADO DE PROGRESO: Si ya tiene INSERT, lo saltamos
        if os.path.exists(ruta_sql):
            with open(ruta_sql, 'r', encoding='utf-8') as f:
                if "INSERT INTO" in f.read():
                    print(f"[{procesados}/{total_grupos}] Saltando {subgrupo}, ya estaba generado.")
                    continue
        
        print(f"[{procesados}/{total_grupos}] Consultando a la IA grupo {subgrupo} ({len(datos)} códigos)...")
        
        # Preparamos el lote para enviar a la IA (si son demasiados los partimos, pero normalmente un subgrupo tiene < 50)
        lote_peticion = []
        for _, row in datos.iterrows():
            codigo = str(row[col_codigo]).strip()
            termino = str(row[col_desc]).strip()
            lote_peticion.append({"codigo": codigo, "termino": termino})
            
        resultado_ia = procesar_lote_con_ia(lote_peticion)
        
        if resultado_ia:
            sql_content = "INSERT INTO catalogo_cie10 (codigo_cie10, termino_medico, capitulo, keywords)\nVALUES \n"
            valores = []
            
            for item in resultado_ia:
                cod = item.get('codigo', '')
                term = item.get('termino', '')
                # Escapar comillas simples en el término médico para evitar errores de SQL
                term_sql = term.replace("'", "''")
                
                kw_list = item.get('keywords', [])
                kw_json = json.dumps(kw_list, ensure_ascii=False)
                kw_sql = kw_json.replace("'", "''") # Escapar para SQL
                
                valores.append(f"('{cod}', '{term_sql}', '{CAPITULO_POR_DEFECTO}', '{kw_sql}')")
            
            sql_content += ",\n".join(valores) + ";\n"
            
            os.makedirs(ruta_carpeta, exist_ok=True)
            with open(ruta_sql, 'w', encoding='utf-8') as f:
                f.write(sql_content)
                
            print(f" -> Guardado exitosamente: {ruta_sql}")
            
            # Pausa para respetar el límite gratuito de la API (15 peticiones por minuto)
            time.sleep(5) 
        else:
            print(f" -> Falló la respuesta en {subgrupo}. Quedará pendiente para la próxima vez.")

    print("\n¡PROCESO COMPLETADO! Todos los archivos SQL han sido poblados con ayuda de la IA.")

if __name__ == "__main__":
    generar_inserts_ia()
