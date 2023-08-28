/** Script for converting animation created with colors based on universal LUT (not necessarily RG color)
 * to sprites with only RG color colors that indicate their position on the LUT
 *
 * LUT      <-- Look Up Table
 * RG color <-- color that where we only care about the red and green RGBA values. This is because we associate red and green channels with certain position (x, y) on other image
 */

import { createCanvas, loadImage, Canvas } from "canvas";
import { writeFileSync } from "fs";

const LUT_SIZE = {
    width: 256,
    height: 256,
};

class Color {
    constructor(
        public r: number,
        public g: number,
        public b: number = 0,
        public a: number = 255
    ) {}

    getArr() {
        return new Uint8ClampedArray([this.r, this.g, this.b, this.a]);
    }

    toString() {
        return `rgba(${this.r}, ${this.g}, ${this.b}, ${this.a})`;
    }

    static fromString(colorString: string) {
        const regex = /^rgba?\((\d{1,3}), (\d{1,3}), (\d{1,3}), (\d{1,3})\)$/;
        const match = colorString.match(regex);

        if (!match) {
            throw new Error("Invalid color string format");
        }

        const r = parseInt(match[1]);
        const g = parseInt(match[2]);
        const b = parseInt(match[3]);
        const a = parseInt(match[4]);

        return new Color(r, g, b, a);
    }
}

const canvas: Canvas = createCanvas(256, 256);
const ctx = canvas.getContext("2d");

/** Get color data of every pixel on the image */
async function getRGBA(imagePath: string) {
    const sourceImage = await loadImage(imagePath);
    const imgWidth = sourceImage.width;
    const imgHeight = sourceImage.height;

    ctx.drawImage(sourceImage, 0, 0);
    const imageData = ctx.getImageData(0, 0, imgWidth, imgHeight).data;
    return imageData;
}

/**
 * Get color mappings from LUT
 * @param lutImagePath
 * @returns map: key - color, value - RG color
 */
async function getColorMapData(
    lutImagePath: string
): Promise<Map<string, Color>> {
    const lutImg = await getRGBA(lutImagePath);
    const colorMap = new Map<string, Color>();

    for (let i = 0; i < lutImg.length; i += 4) {
        const flatPosition = Math.round(i / 4);
        const colorMapPosition = {
            x: flatPosition % LUT_SIZE.width,
            y: Math.floor(flatPosition / LUT_SIZE.width),
        };

        const targetColor = new Color(
            lutImg[i],
            lutImg[i + 1],
            lutImg[i + 2],
            lutImg[i + 3]
        );

        const rgColor = new Color(colorMapPosition.x, colorMapPosition.y);

        colorMap.set(targetColor.toString(), rgColor);
    }
    return colorMap;
}

async function getImageSize(imagePath: string) {
    const sourceImage = await loadImage(imagePath);
    const width = sourceImage.width;
    const height = sourceImage.height;
    return { width, height };
}

function saveCanvas(canvas: Canvas, path: string) {
    const pngData = canvas.toBuffer("image/png");

    // Save the PNG image to a file
    writeFileSync(path, pngData);
}

/** Converts the animation to RG colors based on provided LUT */
async function convertAnimation(
    lutImagePath: string,
    animationPath: string,
    outputPath: string
) {
    // get color map
    const colorMap = await getColorMapData(lutImagePath);

    // get animation image
    const animationImg = await getRGBA(animationPath);

    // create output canvas
    const animationSize = await getImageSize(animationPath);
    const outCanvas = createCanvas(animationSize.width, animationSize.height);
    const ctx = outCanvas.getContext("2d");
    const outImgData = ctx.createImageData(outCanvas.width, outCanvas.height);

    for (let i = 0; i < animationImg.length; i += 4) {
        // get the color from input animation image
        const srcColor = new Color(
            animationImg[i],
            animationImg[i + 1],
            animationImg[i + 2],
            animationImg[i + 3]
        );

        // get color to map to
        const outColorString = colorMap.get(srcColor.toString());
        if (!outColorString) {
            new Error("missing color on LUT:" + srcColor.toString());
            return;
        }

        // save the mapped color on the output canvas
        outImgData[i] = outColorString.r;
        outImgData[i + 1] = outColorString.g;
        outImgData[i + 2] = outColorString.b;
        outImgData[i + 3] = outColorString.a;
    }

    // Put the modified image data onto the canvas
    ctx.putImageData(outImgData, 0, 0);
    saveCanvas(outCanvas, outputPath);
}

// // Specify input and output paths

// const clothesDir = "img/clothes";
// const lutDir = "img/lut";
// const uvMapPath = "img/map_template.png";

// readdir(clothesDir, (err, files) => {
//     if (err) {
//         console.error("Error reading directory:", err);
//         return;
//     }
//     for (const fileName of files) {
//         const inputClothesPath = join(clothesDir, fileName);
//         if (statSync(inputClothesPath).isFile()) {
//             const outputLutPath = join(lutDir, `lut_${fileName}`);
//             createColorMap(uvMapPath, inputClothesPath, outputLutPath)
//                 .then(() => console.log("3D color map created successfully"))
//                 .catch((error) => console.error("Error:", error));
//         }
//     }
// });
const outputPath = "";
const lutImagePath = "";
const animationPath = "";

convertAnimation(lutImagePath, animationPath, outputPath);
