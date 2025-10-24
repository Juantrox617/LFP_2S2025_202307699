# 🚀 Instrucciones para ejecutar JavaBridge

## Prerequisitos
- Node.js instalado (versión 16 o superior)
- npm instalado

## Paso 1: Instalar dependencias del BACKEND

1. Abre PowerShell en la carpeta raíz del proyecto:
```powershell
cd c:\Users\juaan\Desktop\LFP\LFP_2S2025_202307699
```

2. Instala las dependencias:
```powershell
npm install
```

## Paso 2: Instalar dependencias del FRONTEND

1. Navega a la carpeta Frontend:
```powershell
cd Frontend
```

2. Instala las dependencias:
```powershell
npm install
```

## Paso 3: Ejecutar la aplicación

### Terminal 1 - Backend (servidor):
```powershell
cd c:\Users\juaan\Desktop\LFP\LFP_2S2025_202307699
npm run dev
```
Deberías ver: `Servidor escuchando en http://localhost:4000`

### Terminal 2 - Frontend (interfaz):
```powershell
cd c:\Users\juaan\Desktop\LFP\LFP_2S2025_202307699\Frontend
npm run dev
```
Deberías ver una URL como: `http://localhost:5173`

## Paso 4: Abrir en el navegador

Abre tu navegador en la URL que te muestra el frontend (generalmente http://localhost:5173)

## 🧪 Probar el traductor

1. Escribe código Java en el área de texto
2. Click en "Analizar"
3. Verás:
   - Tabla de tokens generados
   - Errores léxicos (si los hay)
   - Errores sintácticos (si los hay)
   - Código Python traducido

### Ejemplo de código para probar:
```java
int numero = 42;
String mensaje = "Hola mundo";
boolean activo = true;

if (numero > 10) {
    System.out.println("Numero mayor a 10");
}

for (int i = 0; i < 5; i++) {
    System.out.println("Iteracion: " + i);
}
```

## ⚠️ Si hay errores:
- Asegúrate de que el backend esté corriendo en el puerto 4000
- Verifica que no haya otro proceso usando esos puertos
- Revisa la consola del navegador (F12) para más detalles
