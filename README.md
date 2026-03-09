# Pixel Art Editor

Un editor de pixel art interactivo creado con JavaScript vanilla, HTML5 y CSS3. Permite crear arte pixelado usando una matriz de 20x20 con colores numerados del 0-9.

## 🎨 Características

- **Editor de matriz 20x20**: Grid interactivo para crear pixel art
- **Sistema de colores numerados**: 10 colores diferentes (0-9) con paleta personalizable
- **Selección múltiple**: Seleccionar varias celdas arrastrando el mouse
- **Atajos de teclado**: Presionar números 1-9 para aplicar colores rápidamente
- **Vista previa en vivo**: Previsualización del pixel art en tiempo real
- **Plantillas predefinidas**: 5 plantillas listas para usar (León, Conejo, Perro, Mario, Espada Minecraft)
- **Exportación**: Exportar como imagen PNG o matriz JSON
- **Tema claro/oscuro**: Cambiar entre temas claro y oscuro
- **Personalización de colores**: Click en los colores de la leyenda para personalizar la paleta

## 🚀 Demostración

### Modos de uso

1. **Modo 1: Seleccionar → Pintar**
   - Selecciona celdas arrastrando el mouse
   - Presiona un número (1-9) para aplicar el color a todas las celdas seleccionadas

2. **Modo 2: Pintar → Seleccionar**
   - Presiona un número (1-9) para activar el color
   - Selecciona celdas arrastrando para aplicar el color activo

## 🛠️ Tecnologías

- **JavaScript ES6+** - Lógica del editor
- **HTML5** - Estructura semántica
- **CSS3** - Estilos y animaciones
- **Canvas API** - Exportación a imagen

## 📦 Instalación

1. Clona el repositorio:
```bash
git clone https://github.com/jujomago/pixexArtEditor.git
cd pixexArtEditor
```

2. Inicia un servidor local:
```bash
# Usando Python
python -m http.server 8000

# O usando Node.js
npx serve .

# O usando Live Server en VS Code
```

3. Abre `http://localhost:8000` en tu navegador

## 🎮 Uso

### Controles básicos

| Acción | Método |
|--------|--------|
| **Pintar celda** | Click en celda + número (1-9) |
| **Seleccionar múltiples** | Click y arrastrar |
| **Aplicar a selección** | Seleccionar + número (1-9) |
| **Limpiar grid** | Botón "Limpiar" |
| **Exportar imagen** | Botón "Exportar imagen" |
| **Exportar matriz** | Botón "Exportar matriz" |
| **Cambiar tema** | Botón 🌙/☀️ |

### Atajos de teclado

- **1-9**: Aplica el color correspondiente
- **0**: Aplica color blanco (borrar)

### Personalización de colores

1. Click en cualquier color de la leyenda
2. Se abrirá un selector de color
3. Elige tu color personalizado
4. El color se actualizará en toda la paleta

## 🏗️ Estructura del proyecto

```
pixelArt/
├── index.html              # Página principal
├── styles.css              # Estilos CSS
├── script.js               # Punto de entrada
├── js/
│   ├── main.js             # Configuración principal
│   ├── models/
│   │   └── PixelMatrix.js  # Modelo de datos de la matriz
│   ├── ui/
│   │   └── PixelArtEditor.js # UI principal del editor
│   ├── data/
│   │   ├── colorMap.js     # Paleta de colores
│   │   ├── initialPixelArt.js # Arte inicial
│   │   └── pixelTemplates.js # Plantillas predefinidas
│   └── utils/
│       └── editorUtils.js  # Utilidades del editor
└── README.md               # Este archivo
```

## 🎨 Paleta de colores

| Número | Color | Código |
|--------|-------|--------|
| 0 | Blanco | #ffffff |
| 1 | Negro | #000000 |
| 2 | Rojo | #ff595e |
| 3 | Amarillo | #ffca3a |
| 4 | Verde | #8ac926 |
| 5 | Azul | #1982c4 |
| 6 | Púrpura | #6a4c93 |
| 7 | Naranja | #ff924c |
| 8 | Turquesa | #00c2a8 |
| 9 | Rojo oscuro | #c1121f |

## 🌟 Plantillas incluidas

- **León**: Diseño de león pixelado
- **Conejo**: Conejo con detalles en colores
- **Perro**: Perro pixelado con sombrero
- **Mario**: Personaje de videojuegos clásico
- **Espada Minecraft**: Espada del juego Minecraft

## 📤 Exportación

### Como imagen PNG
- Click en "Exportar imagen"
- Se descargará un archivo PNG con el pixel art

### Como matriz JSON
- Click en "Exportar matriz"
- Se descargará un archivo JSON con la estructura de la matriz:
```json
{
  "rows": 20,
  "columns": 20,
  "matrix": [
    [0, 0, 0, ...],
    [0, 1, 0, ...],
    ...
  ]
}
```

## 🔧 Personalización

### Agregar nuevas plantillas

1. Crea una nueva matriz en `js/data/pixelTemplates.js`
2. Crea una función que retorne la matriz
3. Agrega la plantilla al objeto `getTemplates()`
4. Agrega la opción al `<select>` en `index.html`

### Modificar colores

Edita `js/data/colorMap.js` para cambiar la paleta de colores.

### Cambiar tamaño del grid

Modifica las dimensiones en `js/data/initialPixelArt.js` y ajusta el CSS correspondiente.

## 🤝 Contribuir

1. Fork el proyecto
2. Crea una rama (`git checkout -b feature/nueva-caracteristica`)
3. Commit los cambios (`git commit -am 'Agregar nueva característica'`)
4. Push a la rama (`git push origin feature/nueva-caracteristica`)
5. Abre un Pull Request

## 📝 Licencia

Este proyecto está bajo la Licencia MIT - mira el archivo [LICENSE](LICENSE) para detalles.

## 👨‍💻 Autor

**Josue Mancilla**  
[GitHub](https://github.com/jujomago)  
[Portfolio](https://josuemancilla.vercel.app)

---

🎮 **Diviértete creando pixel art!** 🎨
