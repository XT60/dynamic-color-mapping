import { createCanvas, loadImage, Canvas } from "canvas";
import { fsync, readdir, stat, statSync, writeFile, writeFileSync } from "fs";
import { join } from "path";

type Position = {
    x: number;
    y: number;
};

class Color {
    constructor(
        public r: number,
        public g: number,
        public b: number,
        public a: number = 255
    ) {}

    getArr() {
        return new Uint8ClampedArray([this.r, this.g, this.b, this.a]);
    }
}

const canvas: Canvas = createCanvas(100, 100);
const ctx = canvas.getContext("2d");

async function getRGBA(imagePath: string) {
    const sourceImage = await loadImage(imagePath);
    const imgWidth = sourceImage.width;
    const imgHeight = sourceImage.height;

    ctx.drawImage(sourceImage, 0, 0);
    const imageData = ctx.getImageData(0, 0, imgWidth, imgHeight).data;
    return imageData;
}

function toMask(position: Position): number {
    return position.y * 256 + position.x;
}

async function getColorMapData(
    mapImagePath: string,
    textureImagePath: string
): Promise<Map<number, Color>> {
    const targetImageData = await getRGBA(textureImagePath);
    const sourceImageData = await getRGBA(mapImagePath);

    const colorMap = new Map<number, Color>();

    for (let i = 0; i < sourceImageData.length; i += 4) {
        const colorMapPosition = {
            x: sourceImageData[i],
            y: sourceImageData[i + 1],
        };
        const mask = toMask(colorMapPosition);
        const targetColor = new Color(
            targetImageData[i],
            targetImageData[i + 1],
            targetImageData[i + 2],
            targetImageData[i + 3]
        );

        colorMap.set(mask, targetColor);
    }
    return colorMap;
}

function getLUTCanvas(colorMap: Map<number, Color>): Canvas | undefined {
    const canvas = createCanvas(256, 256);
    const ctx = canvas.getContext("2d");
    const imageData = ctx.createImageData(canvas.width, canvas.height);

    // Set pixel RGB values
    for (let y = 0; y < canvas.height; y++) {
        for (let x = 0; x < canvas.width; x++) {
            const position: Position = { x, y };
            const mask = toMask(position);
            const color = colorMap.get(mask);
            if (!color) continue;

            const startIndex = mask * 4;
            imageData.data[startIndex] = color.r; // Red channel
            imageData.data[startIndex + 1] = color.g; // Green channel
            imageData.data[startIndex + 2] = color.b; // Blue channel
            imageData.data[startIndex + 3] = color.a; // Alpha channel (255 = fully opaque)
        }
    }

    // Put the modified image data onto the canvas
    ctx.putImageData(imageData, 0, 0);
    return canvas;
}

function saveCanvas(canvas: Canvas, path: string) {
    const pngData = canvas.toBuffer("image/png");

    // Save the PNG image to a file
    writeFileSync(path, pngData);
}

async function createColorMap(
    mapImagePath: string,
    textureImagePath: string,
    outputImagePath: string
): Promise<void> {
    const colorMap = await getColorMapData(mapImagePath, textureImagePath);
    const canvas = getLUTCanvas(colorMap);
    if (!canvas) throw Error("Canvas was undefined");
    saveCanvas(canvas, outputImagePath);
}

// Specify input and output paths

const clothesDir = "img/clothes";
const lutDir = "img/lut";
const uvMapPath = "img/map_template.png";

readdir(clothesDir, (err, files) => {
    if (err) {
        console.error("Error reading directory:", err);
        return;
    }
    for (const fileName of files) {
        const inputClothesPath = join(clothesDir, fileName);
        if (statSync(inputClothesPath).isFile()) {
            const outputLutPath = join(lutDir, `lut_${fileName}`);
            createColorMap(uvMapPath, inputClothesPath, outputLutPath)
                .then(() => console.log("3D color map created successfully"))
                .catch((error) => console.error("Error:", error));
        }
    }
});
