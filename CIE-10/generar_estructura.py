import pandas as pd
import os

# Configuración de rutas
excel_path = 'Data/Diagnosticos_Tabla_Referencia_CIE10ES_2026.xlsx'
sheet_name = 'ES2026 Finales'
base_output_dir = 'Generados_SQL'

def generar_estructura():
    print(f"Leyendo el archivo {excel_path}, pestaña: '{sheet_name}'...")
    
    try:
        # Leemos el excel
        df = pd.read_excel(excel_path, sheet_name=sheet_name, dtype=str)
    except Exception as e:
        print(f"Error al leer el Excel: {e}")
        print("Asegúrate de tener instaladas las dependencias ejecutando: pip install pandas openpyxl")
        return

    # Buscamos la columna de código (normalmente se llama "Código")
    columnas = df.columns.tolist()
    col_codigo = [c for c in columnas if 'código' in c.lower() or 'codigo' in c.lower()]
    
    if not col_codigo:
        print(f"No se encontró una columna llamada 'Código'. Columnas disponibles: {columnas}")
        # Asumimos la primera columna por defecto
        col_codigo = columnas[0]
    else:
        col_codigo = col_codigo[0]

    print(f"Usando la columna '{col_codigo}' para los códigos.")

    # Creamos el directorio base
    if not os.path.exists(base_output_dir):
        os.makedirs(base_output_dir)

    # Agrupamos
    codigos_procesados = 0
    carpetas_creadas = set()
    
    for index, row in df.iterrows():
        codigo = str(row[col_codigo]).strip()
        
        # Ignorar vacíos o 'nan' (nulos)
        if codigo == 'nan' or not codigo:
            continue
            
        # Extraer letra y subgrupo
        letra = codigo[0].upper()
        
        # Los primeros 3 caracteres indican el grupo (ej. A77 de A77.41)
        # Si no tiene 3 (ej. A1), usamos lo que haya
        subgrupo = codigo[:3].upper() if len(codigo) >= 3 else codigo.upper()

        # Generar las rutas
        ruta_carpeta = os.path.join(base_output_dir, letra, subgrupo)
        ruta_sql = os.path.join(ruta_carpeta, f"insert_{subgrupo}.sql")

        # Si la carpeta no existe, la creamos y preparamos su archivo SQL
        if ruta_carpeta not in carpetas_creadas:
            os.makedirs(ruta_carpeta, exist_ok=True)
            carpetas_creadas.add(ruta_carpeta)
            
            # Crear un comentario inicial en el archivo SQL
            with open(ruta_sql, 'w', encoding='utf-8') as f:
                f.write(f"-- Archivo SQL para el grupo CIE-10: {subgrupo}\n")
                f.write(f"-- Aquí se insertarán los códigos que empiecen con {subgrupo}\n\n")

        codigos_procesados += 1

    print(f"¡Proceso completado con éxito!")
    print(f"Se agruparon {codigos_procesados} códigos.")
    print(f"Puedes revisar la nueva carpeta '{base_output_dir}' en tu proyecto.")

if __name__ == "__main__":
    generar_estructura()
