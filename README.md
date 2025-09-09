# SCORM Viewer - Next.js

Un visor de contenido SCORM desarrollado con Next.js que permite previsualizar cursos SCORM directamente en el navegador.

## Características

- ✅ Visualización de contenido SCORM 1.2 y 2004
- ✅ Soporte para Articulate Rise
- ✅ API SCORM completa integrada
- ✅ Interfaz moderna con Tailwind CSS
- ✅ Navegación entre recursos
- ✅ Panel de información del paquete
- ✅ Carga automática de cursos SCORM

## Estructura del Proyecto

```
scorm_nextjs/
├── public/
│   └── MY_SCORMS/                 # Archivos SCORM estáticos
│       └── Covid-19_esla/         # Curso SCORM de ejemplo
├── src/
│   ├── app/                       # Páginas de Next.js
│   │   ├── layout.tsx            # Layout principal
│   │   └── page.tsx              # Página principal
│   ├── components/                # Componentes React
│   │   └── SCORMViewer.tsx       # Componente principal del visor
│   ├── lib/                       # Librerías y utilidades
│   │   ├── scorm-api.ts          # Implementación de API SCORM
│   │   └── scorm-parser.ts       # Parser de manifiestos SCORM
│   └── types/                     # Definiciones de TypeScript
│       └── global.d.ts           # Tipos globales para SCORM
└── package.json                  # Dependencias del proyecto
```

## Instalación y Uso

1. **Instalar dependencias:**
   ```bash
   npm install
   ```

2. **Ejecutar en modo desarrollo:**
   ```bash
   npm run dev
   ```

3. **Abrir en el navegador:**
   La aplicación estará disponible en `http://localhost:3000`

## Cómo agregar nuevos cursos SCORM

1. Coloca la carpeta del curso SCORM en `public/MY_SCORMS/`
2. Actualiza el componente `SCORMViewer.tsx` para incluir el nuevo curso:
   ```typescript
   if (scormType === 'nuevo_curso') {
     scormPath = '/MY_SCORMS/nuevo_curso/scormdriver/indexAPI.html';
     scormName = 'Nombre del Curso';
   }
   ```

## Funcionalidades del Visor

### Panel de Control
- Botones para cargar diferentes cursos SCORM
- Controles de navegación (Anterior/Siguiente)
- Botón de recarga

### Información del Paquete
- Título del curso
- Descripción
- Versión SCORM
- Tipo de contenido
- Estado de carga

### API SCORM Integrada
- Soporte para SCORM 1.2 y 2004
- Persistencia de datos en localStorage
- Manejo de errores y diagnósticos

## Tecnologías Utilizadas

- **Next.js 15** - Framework React con App Router
- **TypeScript** - Tipado estático
- **Tailwind CSS** - Estilos y diseño
- **JSZip** - Manipulación de archivos ZIP SCORM

## Estructura SCORM Soportada

El visor está optimizado para:
- ✅ Articulate Rise (scormdriver)
- ✅ SCORM 1.2 estándar
- ✅ Paquetes ZIP con imsmanifest.xml
- ✅ Recursos navegables (SCOs)

## Desarrollo

### Componentes Principales

1. **SCORMViewer**: Componente principal que gestiona la visualización
2. **SCORMAPI**: Implementación de la especificación SCORM
3. **SCORMParser**: Procesamiento de manifiestos y recursos

### Personalización

Puedes personalizar:
- Estilos modificando las clases de Tailwind
- Comportamiento de la API SCORM en `src/lib/scorm-api.ts`
- Procesamiento de archivos en `src/lib/scorm-parser.ts`

## Licencia

Este proyecto está destinado para uso educativo y de desarrollo.
