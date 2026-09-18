# División Francesa — App interactiva (4º grado)

App web para practicar el método francés de la división, pensada para Chromebooks (16:9, sin scroll).

## Contenido
- `index.html` — estructura de la app
- `style.css` — estilos (tema claro/oscuro, tipografías Fredoka/Baloo 2 vía Google Fonts)
- `script.js` — lógica: tablas de multiplicar, tutorial paso a paso, generador de ejercicios, progreso y medallas

## Cómo subirlo a GitHub

1. Creá un repositorio nuevo (o usá uno existente) en GitHub.
2. Copiá `index.html`, `style.css` y `script.js` a la raíz del repositorio (deben quedar en la misma carpeta, uno junto al otro).
3. Hacé commit y push:
   ```bash
   git add index.html style.css script.js
   git commit -m "App división francesa"
   git push
   ```
4. (Opcional) Para publicarlo gratis con **GitHub Pages**:
   - Repositorio → **Settings** → **Pages**
   - En "Source" elegí la rama `main` (o `master`) y la carpeta `/ (root)`
   - Guardá; en un par de minutos la app queda disponible en `https://<tu-usuario>.github.io/<nombre-repo>/`

## Notas
- No requiere backend ni build: son 3 archivos estáticos.
- Las medallas (🥉🥈🥇) se guardan en el `localStorage` del navegador de cada alumno, así que persisten entre sesiones en la misma computadora.
- Usa Google Fonts (Fredoka y Baloo 2) desde internet; si se va a usar sin conexión, hay que descargar las fuentes y ajustar el `<link>` en `index.html`.
