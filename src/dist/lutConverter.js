"use strict";
/* In short [thing is not tested]
 * takes:
 *  - actual LUT with our custom colors (not RG but also not the target colors)
 *  - animation created with our custom colors (not RG but also not the target colors)
 * returns:
 *  - animation in RG colors where Red channels maps directly at X and Green at Y axis
 */
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __generator = (this && this.__generator) || function (thisArg, body) {
    var _ = { label: 0, sent: function() { if (t[0] & 1) throw t[1]; return t[1]; }, trys: [], ops: [] }, f, y, t, g;
    return g = { next: verb(0), "throw": verb(1), "return": verb(2) }, typeof Symbol === "function" && (g[Symbol.iterator] = function() { return this; }), g;
    function verb(n) { return function (v) { return step([n, v]); }; }
    function step(op) {
        if (f) throw new TypeError("Generator is already executing.");
        while (g && (g = 0, op[0] && (_ = 0)), _) try {
            if (f = 1, y && (t = op[0] & 2 ? y["return"] : op[0] ? y["throw"] || ((t = y["return"]) && t.call(y), 0) : y.next) && !(t = t.call(y, op[1])).done) return t;
            if (y = 0, t) op = [op[0] & 2, t.value];
            switch (op[0]) {
                case 0: case 1: t = op; break;
                case 4: _.label++; return { value: op[1], done: false };
                case 5: _.label++; y = op[1]; op = [0]; continue;
                case 7: op = _.ops.pop(); _.trys.pop(); continue;
                default:
                    if (!(t = _.trys, t = t.length > 0 && t[t.length - 1]) && (op[0] === 6 || op[0] === 2)) { _ = 0; continue; }
                    if (op[0] === 3 && (!t || (op[1] > t[0] && op[1] < t[3]))) { _.label = op[1]; break; }
                    if (op[0] === 6 && _.label < t[1]) { _.label = t[1]; t = op; break; }
                    if (t && _.label < t[2]) { _.label = t[2]; _.ops.push(op); break; }
                    if (t[2]) _.ops.pop();
                    _.trys.pop(); continue;
            }
            op = body.call(thisArg, _);
        } catch (e) { op = [6, e]; y = 0; } finally { f = t = 0; }
        if (op[0] & 5) throw op[1]; return { value: op[0] ? op[1] : void 0, done: true };
    }
};
Object.defineProperty(exports, "__esModule", { value: true });
var canvas_1 = require("canvas");
var fs_1 = require("fs");
var LUT_SIZE = {
    width: 256,
    height: 256,
};
var Color = /** @class */ (function () {
    function Color(r, g, b, a) {
        if (b === void 0) { b = 0; }
        if (a === void 0) { a = 255; }
        this.r = r;
        this.g = g;
        this.b = b;
        this.a = a;
    }
    Color.prototype.getArr = function () {
        return new Uint8ClampedArray([this.r, this.g, this.b, this.a]);
    };
    Color.prototype.toString = function () {
        return "rgba(".concat(this.r, ", ").concat(this.g, ", ").concat(this.b, ", ").concat(this.a, ")");
    };
    Color.fromString = function (colorString) {
        var regex = /^rgba?\((\d{1,3}), (\d{1,3}), (\d{1,3}), (\d{1,3})\)$/;
        var match = colorString.match(regex);
        if (!match) {
            throw new Error("Invalid color string format");
        }
        var r = parseInt(match[1]);
        var g = parseInt(match[2]);
        var b = parseInt(match[3]);
        var a = parseInt(match[4]);
        return new Color(r, g, b, a);
    };
    return Color;
}());
var canvas = (0, canvas_1.createCanvas)(256, 256);
var ctx = canvas.getContext("2d");
/** Get color data of every pixel on the image */
function getRGBA(imagePath) {
    return __awaiter(this, void 0, void 0, function () {
        var sourceImage, imgWidth, imgHeight, imageData;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0: return [4 /*yield*/, (0, canvas_1.loadImage)(imagePath)];
                case 1:
                    sourceImage = _a.sent();
                    imgWidth = sourceImage.width;
                    imgHeight = sourceImage.height;
                    ctx.drawImage(sourceImage, 0, 0);
                    imageData = ctx.getImageData(0, 0, imgWidth, imgHeight).data;
                    return [2 /*return*/, imageData];
            }
        });
    });
}
/**
 * Get color mappings from LUT
 * @param lutImagePath
 * @returns map: key - color, value - RG color
 */
function getColorMapData(lutImagePath) {
    return __awaiter(this, void 0, void 0, function () {
        var lutImg, colorMap, i, flatPosition, colorMapPosition, targetColor, rgColor;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0: return [4 /*yield*/, getRGBA(lutImagePath)];
                case 1:
                    lutImg = _a.sent();
                    colorMap = new Map();
                    for (i = 0; i < lutImg.length; i += 4) {
                        flatPosition = Math.round(i / 4);
                        colorMapPosition = {
                            x: flatPosition % LUT_SIZE.width,
                            y: Math.floor(flatPosition / LUT_SIZE.width),
                        };
                        targetColor = new Color(lutImg[i], lutImg[i + 1], lutImg[i + 2], lutImg[i + 3]);
                        rgColor = new Color(colorMapPosition.x, colorMapPosition.y);
                        colorMap.set(targetColor.toString(), rgColor);
                    }
                    return [2 /*return*/, colorMap];
            }
        });
    });
}
function getImageSize(imagePath) {
    return __awaiter(this, void 0, void 0, function () {
        var sourceImage, width, height;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0: return [4 /*yield*/, (0, canvas_1.loadImage)(imagePath)];
                case 1:
                    sourceImage = _a.sent();
                    width = sourceImage.width;
                    height = sourceImage.height;
                    return [2 /*return*/, { width: width, height: height }];
            }
        });
    });
}
function saveCanvas(canvas, path) {
    var pngData = canvas.toBuffer("image/png");
    // Save the PNG image to a file
    (0, fs_1.writeFileSync)(path, pngData);
}
/** Converts the animation to RG colors based on provided LUT */
function convertAnimation(lutImagePath, animationPath, outputPath) {
    return __awaiter(this, void 0, void 0, function () {
        var colorMap, animationImg, animationSize, outCanvas, ctx, outImgData, i, srcColor, outColorString;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0: return [4 /*yield*/, getColorMapData(lutImagePath)];
                case 1:
                    colorMap = _a.sent();
                    return [4 /*yield*/, getRGBA(animationPath)];
                case 2:
                    animationImg = _a.sent();
                    return [4 /*yield*/, getImageSize(animationPath)];
                case 3:
                    animationSize = _a.sent();
                    outCanvas = (0, canvas_1.createCanvas)(animationSize.width, animationSize.height);
                    ctx = outCanvas.getContext("2d");
                    outImgData = ctx.createImageData(outCanvas.width, outCanvas.height);
                    for (i = 0; i < animationImg.length; i += 4) {
                        srcColor = new Color(animationImg[i], animationImg[i + 1], animationImg[i + 2], animationImg[i + 3]);
                        outColorString = colorMap.get(srcColor.toString());
                        if (!outColorString) {
                            new Error("missing color on LUT:" + srcColor.toString());
                            return [2 /*return*/];
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
                    return [2 /*return*/];
            }
        });
    });
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
var outputPath = "./convertedImage.png";
var lutImagePath = "./img/maps/gradients/body.png";
var animationPath = "img/stabbing_animation/body.png";
convertAnimation(lutImagePath, animationPath, outputPath);
