/* In short [thing is not tested]
 * takes:
 *  - actual LUT with our custom colors (not RG but also not the target colors)
 *  - animation created with our custom colors (not RG but also not the target colors)
 *
 * returns:
 *  - animation in RG colors where Red channels maps directly at X and Green at Y axis
 *
 * example usage:
 * yarn run convert -i stabbing_animation
 * this should create new directory in ./img/converted containing all necessary uvmaps for the animations provided all the input data is intact
 */

import { createCanvas, loadImage, Canvas } from "canvas";
import { existsSync, mkdirSync, readdir, readdirSync, writeFileSync } from "fs";
import optimist from "optimist";
import {
    ANIMATION_DIR,
    CONVERTER_OUTPUT as CONVERTER_OUTPUT_DIR,
    GRADIENT_DIR,
} from "./Config";
import { join } from "path";
import { enumFromStringValue, getBaseName, isPngFile } from "./Utils";
import { AnimationPart, Color } from "./Types";

/** Get color data of every pixel on the image */
async function getRGBA(imagePath: string) {
    const sourceImage = await loadImage(imagePath);
    const imgWidth = sourceImage.width;
    const imgHeight = sourceImage.height;

    const canvas: Canvas = createCanvas(imgWidth, imgHeight);
    const ctx = canvas.getContext("2d");

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
    const lutSize = await getImageSize(lutImagePath);
    const colorMap = new Map<string, Color>();

    for (let i = 0; i < lutImg.length; i += 4) {
        const flatPosition = Math.round(i / 4);
        const colorMapPosition = {
            x: flatPosition % lutSize.width,
            y: Math.floor(flatPosition / lutSize.width),
        };

        const targetColor = new Color(
            lutImg[i],
            lutImg[i + 1],
            lutImg[i + 2],
            lutImg[i + 3]
        );

        const rgColor = new Color(colorMapPosition.x, colorMapPosition.y);

        if (!colorMap.get(targetColor.toString()))
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
        outImgData.data[i] = outColorString.r;
        outImgData.data[i + 1] = outColorString.g;
        outImgData.data[i + 2] = outColorString.b;
        outImgData.data[i + 3] = outColorString.a;
    }

    // Put the modified image data onto the canvas
    ctx.putImageData(outImgData, 0, 0);
    saveCanvas(outCanvas, outputPath);
}

/** Find converter output directory based on the input animation directory path*/
function getOutputDir(animationDirectoryPath: string) {
    const index = animationDirectoryPath.indexOf(ANIMATION_DIR);
    if (index === -1)
        throw new Error(
            "Animation is not based in animation directory specified in config!"
        );
    const relativePath = animationDirectoryPath.substring(
        index + ANIMATION_DIR.length
    );
    return join(CONVERTER_OUTPUT_DIR, relativePath);
}

/** Main script function, converts animations under specified path to UV-maps, the output is placed in img/converted directory */
function convertAnimations(animationDirectoryPath: string) {
    const outputDir = getOutputDir(animationDirectoryPath);
    if (!existsSync(outputDir)) mkdirSync(outputDir);

    const fileNames = readdirSync(animationDirectoryPath);
    for (const fileName of fileNames) {
        const baseName = getBaseName(fileName);
        const animationPart = enumFromStringValue(AnimationPart, baseName);
        if (!isPngFile(fileName) || !animationPart) {
            throw new Error(
                `${fileName} is not of .png extension or it doesn't fit any animation part template!`
            );
        }
        const gradientPath = join(GRADIENT_DIR, fileName); // filename should be the same, we already checked if its valid animation part and has png extension
        const animationPath = join(animationDirectoryPath, fileName);
        const outputPath = join(outputDir, fileName);
        convertAnimation(gradientPath, animationPath, outputPath);
    }
}

/** Entry to the script, validates command line arguments and runs the main script function  */
function handleConverterCommand() {
    const { argv } = optimist;
    if (argv.i === "all") {
        readdir(ANIMATION_DIR, { withFileTypes: true }, (err, files) => {
            if (err) {
                console.error("Error reading directory:", err);
                return;
            }

            const subdirectories = files
                .filter((dirent) => dirent.isDirectory())
                .map((dirent) => dirent.name);

            for (const subdirectory of subdirectories) {
                const path = join(ANIMATION_DIR, subdirectory);
                convertAnimations(path);
            }
        });
    } else {
        const animationDir = join(ANIMATION_DIR, argv.i);
        const validArgs =
            typeof argv.i === "string" && existsSync(animationDir);
        if (!validArgs) {
            throw new Error(`ERROR : File not found!
        -i = name of the directory in ./img/animations/ where are located animations created based on map templates `);
        }

        convertAnimations(animationDir);
    }
}

handleConverterCommand();
