import { PixelMatrix } from "./models/PixelMatrix.js";
import { getTemplates } from "./templates/pixelTemplates.js";
import { PixelArtEditor } from "./ui/PixelArtEditor.js";
import { colorMap } from "./data/colorMap.js";
import { initialPixelArt } from "./data/initialPixelArt.js";

const templates = getTemplates();
const matrix = new PixelMatrix(initialPixelArt);
const app = new PixelArtEditor({ colorMap, matrix, templates });

app.init();