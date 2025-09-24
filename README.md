# 🚀 Sprite Sheet Suite AYARACHI v4.5 "Nébula"

<!-- Reemplaza la URL de arriba con una captura de pantalla atractiva de tu herramienta -->

Una suite de herramientas web profesional, todo en uno, para cortar, previsualizar y exportar animaciones desde hojas de sprites (*sprite sheets*). Diseñada para desarrolladores de juegos, artistas de píxeles y animadores que buscan un flujo de trabajo rápido, intuitivo y persistente en la nube.

---

## ✨ Características Principales

Esta no es una simple herramienta de corte. Es una estación de trabajo completa con características de escritorio, directamente en tu navegador:

*   **🎨 Interfaz Moderna y Responsiva:** Un tema oscuro profesional (`Phoenix`) que se adapta a cualquier tamaño de pantalla.
*   **✂️ Edición de Parrilla Precisa:** Generación automática (por filas/columnas o tamaño de celda) y ajuste manual con *snap-to-grid*.
*   **🎬 Gestor de Clips de Animación:** ¡La característica estrella! Crea y gestiona múltiples animaciones (ej. `correr`, `saltar`, `atacar`) desde una única hoja de sprites.
*   **▶️ Previsualización en Vivo:** Visualiza tus animaciones al instante, con control de FPS para ajustar el *timing*.
*   **☁️ Guardado en la Nube:**
    *   **Persistencia Real:** Guarda y carga tus proyectos en la nube. Continúa tu trabajo en cualquier lugar.
    *   **Backend sin Servidor:** Implementado con **Cloudflare Functions** para la lógica de API y **Cloudflare KV** para el almacenamiento de datos.
    *   **Gestión de Proyectos:** Visualiza, carga y elimina tus proyectos guardados en la nube desde un panel dedicado.
*   **💾 Historial Local:** Tu trabajo también se guarda automáticamente en el Local Storage, con un historial de tus últimos proyectos para cargarlos con un solo clic.
*   **↩️ Deshacer y Rehacer:** Historial completo de cambios en la parrilla para experimentar sin miedo.
*   **✨ Inspector de Frames Avanzado:** Una potente herramienta para unificar tamaños, alinear frames con precisión y editar la posición de cada sprite visualmente.
*   **🪄 Eliminación de Fondo Inteligente:** Borra el fondo de tus sprites con tolerancia ajustable y suavizado de bordes (anti-aliasing).
*   **🧰 Herramientas Profesionales:** Incluye un borrador de frames, detección automática mejorada y una herramienta para reorganizar toda la hoja de sprites en una parrilla optimizada.
*   **📤 Exportación Profesional:**
    *   **Frames Individuales (ZIP):** Descarga todos los frames como imágenes PNG.
    *   **GIF Animado:** Exporta el clip actual como un GIF optimizado.
    *   **Código (HTML/CSS):** Genera una página de demostración profesional y adaptable con tu animación, incluyendo resaltado de sintaxis y una vista previa en vivo.
    *   **Datos (JSON):** Exporta los datos en formatos compatibles con **Phaser 3** y **Godot**.
*   **⚡ Alto Rendimiento:** Optimizado para un uso fluido, incluso con imágenes grandes, gracias al uso de Web Workers para tareas pesadas y `requestAnimationFrame` para un dibujado suave.

---

## 🛠️ Stack Tecnológico

*   **Frontend:** HTML5, CSS3, JavaScript (ES6+ Módulos)
*   **Backend:** Cloudflare Functions (para la API) y Cloudflare KV (para la base de datos clave-valor).
*   **Librerías Externas:** JSZip, gif.js

---

## 🚀 Cómo Empezar

1.  **Abre el archivo `index.html`** en tu navegador.
2.  **Arrastra y suelta** una imagen de hoja de sprites en la pantalla de bienvenida.
3.  **Define tu parrilla** y **crea tus clips de animación**.
4.  **Previsualiza y exporta** tu trabajo. ¡Así de fácil!

---

## 🔧 Configuración del Backend (Cloudflare)

Este proyecto utiliza Cloudflare Pages y sus servicios integrados para el guardado en la nube. Para que funcione en tu propio fork, necesitas:

1.  Crear una cuenta en Cloudflare y desplegar el proyecto con Cloudflare Pages.
2.  En el panel de Cloudflare, ir a **Workers & Pages** -> **KV** y crear un "KV Namespace" llamado `SPRITE_PROJECTS`.
3.  Ir a la configuración de tu proyecto de Pages -> **Settings** -> **Functions** -> **KV namespace bindings**.
4.  Vincular (bind) el namespace que creaste con el nombre de variable `SPRITE_PROJECTS`.
---

## 🖼️ Archivos de Ejemplo

Dentro de la carpeta `img-md/` encontrarás varias hojas de sprites listas para probar la herramienta.

| Vista Previa | Nombre del Archivo | GIF de Ejemplo |
| :---: | :---: | :---: |
| ![Caminando en perspectiva](https://raw.githubusercontent.com/HectorDanielAyarachiFuentes/Sprite-Sheet-Suite-v4.4-Dulce-/main/img-md/caminando%20perspectiva.jpg) | `caminando perspectiva.jpg` | *(No disponible)* |
| ![Hombre caminando 2](https://raw.githubusercontent.com/HectorDanielAyarachiFuentes/Sprite-Sheet-Suite-v4.4-Dulce-/main/img-md/hombre-caminando-2.png) | `hombre-caminando-2.png` | *(No disponible)* |
| ![Hombre caminando](https://raw.githubusercontent.com/HectorDanielAyarachiFuentes/Sprite-Sheet-Suite-v4.4-Dulce-/main/img-md/hombre-caminando.png) | `hombre-caminando.png` | ![GIF de Osama corriendo](https://github.com/HectorDanielAyarachiFuentes/Sprite-Sheet-Suite-v4.4-Dulce/blob/main/img-md/gifs/hombrecaminando.gif?raw=true) |
| ![Hombre con cuchillo](https://raw.githubusercontent.com/HectorDanielAyarachiFuentes/Sprite-Sheet-Suite-v4.4-Dulce-/main/img-md/hombre-cuchillo.png) | `hombre-cuchillo.png` | ![GIF de la tortuga](https://github.com/HectorDanielAyarachiFuentes/Sprite-Sheet-Suite-v4.4-Dulce/blob/main/img-md/gifs/hombrecaminandocuchillo.gif?raw=true) |
| ![Megaman](https://raw.githubusercontent.com/HectorDanielAyarachiFuentes/Sprite-Sheet-Suite-v4.4-Dulce-/main/img-md/megaman.png) | `megaman.png` | *(No disponible)* |
| ![Tortuga](https://raw.githubusercontent.com/HectorDanielAyarachiFuentes/Sprite-Sheet-Suite-v4.4-Dulce-/main/img-md/tortuga.png) | `tortuga.png` | ![GIF de la tortuga](https://raw.githubusercontent.com/HectorDanielAyarachiFuentes/Sprite-Sheet-Suite-v4.4-Dulce-/main/img-md/gifs/tortuga.gif) |
| ![Osama corre](https://raw.githubusercontent.com/HectorDanielAyarachiFuentes/Sprite-Sheet-Suite-v4.4-Dulce-/main/img-md/osama-corre.png) | `osama-corre.png` | ![GIF de Osama corriendo](https://raw.githubusercontent.com/HectorDanielAyarachiFuentes/Sprite-Sheet-Suite-v4.4-Dulce-/main/img-md/gifs/osama.gif) |

---

## 🧠 Explicación del Código

¿Quieres una explicación detallada de cómo funciona el código de este proyecto? Haz clic en el siguiente botón para ver una documentación interactiva generada con DeepWiki.

[![Explicación del Código](https://img.shields.io/badge/Explicación_del_Código-DeepWiki-blue?style=for-the-badge)](https://deepwiki.com/HectorDanielAyarachiFuentes/Sprite-Sheet-Suite-v4.4-Dulce)


---

## 👨‍💻 Sobre el Autor

Esta herramienta fue creada con pasión por **Héctor Daniel Ayarachi Fuentes**. Si te ha gustado este proyecto, puedes ver más de mi trabajo en mis perfiles:

*   **[GitHub](https://github.com/HectorDanielAyarachiFuentes)** - Para ver el código de este y otros proyectos.
*   **[CodePen](https://codepen.io/HectorDanielAyarachiFuentes)** - Para ver más demos y experimentos web interactivos.

¡Gracias por usar la Sprite Sheet Suite!
