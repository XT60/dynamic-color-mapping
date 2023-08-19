"use strict";
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
var path_1 = require("path");
var Color = /** @class */ (function () {
    function Color(r, g, b, a) {
        if (a === void 0) { a = 255; }
        this.r = r;
        this.g = g;
        this.b = b;
        this.a = a;
    }
    Color.prototype.getArr = function () {
        return new Uint8ClampedArray([this.r, this.g, this.b, this.a]);
    };
    return Color;
}());
var canvas = (0, canvas_1.createCanvas)(100, 100);
var ctx = canvas.getContext("2d");
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
function toMask(position) {
    return position.y * 256 + position.x;
}
function getColorMapData(mapImagePath, textureImagePath) {
    return __awaiter(this, void 0, void 0, function () {
        var targetImageData, sourceImageData, colorMap, i, colorMapPosition, mask, targetColor;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0: return [4 /*yield*/, getRGBA(textureImagePath)];
                case 1:
                    targetImageData = _a.sent();
                    return [4 /*yield*/, getRGBA(mapImagePath)];
                case 2:
                    sourceImageData = _a.sent();
                    colorMap = new Map();
                    for (i = 0; i < sourceImageData.length; i += 4) {
                        colorMapPosition = {
                            x: sourceImageData[i],
                            y: sourceImageData[i + 1],
                        };
                        mask = toMask(colorMapPosition);
                        targetColor = new Color(targetImageData[i], targetImageData[i + 1], targetImageData[i + 2], targetImageData[i + 3]);
                        colorMap.set(mask, targetColor);
                    }
                    return [2 /*return*/, colorMap];
            }
        });
    });
}
function getLUTCanvas(colorMap) {
    var canvas = (0, canvas_1.createCanvas)(256, 256);
    var ctx = canvas.getContext("2d");
    var imageData = ctx.createImageData(canvas.width, canvas.height);
    // Set pixel RGB values
    for (var y = 0; y < canvas.height; y++) {
        for (var x = 0; x < canvas.width; x++) {
            var position = { x: x, y: y };
            var mask = toMask(position);
            var color = colorMap.get(mask);
            if (!color)
                continue;
            var startIndex = mask * 4;
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
function saveCanvas(canvas, path) {
    var pngData = canvas.toBuffer("image/png");
    // Save the PNG image to a file
    (0, fs_1.writeFileSync)(path, pngData);
}
function createColorMap(mapImagePath, textureImagePath, outputImagePath) {
    return __awaiter(this, void 0, void 0, function () {
        var colorMap, canvas;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0: return [4 /*yield*/, getColorMapData(mapImagePath, textureImagePath)];
                case 1:
                    colorMap = _a.sent();
                    canvas = getLUTCanvas(colorMap);
                    if (!canvas)
                        throw Error("Canvas was undefined");
                    saveCanvas(canvas, outputImagePath);
                    return [2 /*return*/];
            }
        });
    });
}
// Specify input and output paths
var clothesDir = "img/clothes";
var lutDir = "img/lut";
var uvMapPath = "img/map_template.png";
(0, fs_1.readdir)(clothesDir, function (err, files) {
    if (err) {
        console.error("Error reading directory:", err);
        return;
    }
    for (var _i = 0, files_1 = files; _i < files_1.length; _i++) {
        var fileName = files_1[_i];
        var inputClothesPath = (0, path_1.join)(clothesDir, fileName);
        if ((0, fs_1.statSync)(inputClothesPath).isFile()) {
            var outputLutPath = (0, path_1.join)(lutDir, "lut_".concat(fileName));
            createColorMap(uvMapPath, inputClothesPath, outputLutPath)
                .then(function () { return console.log("3D color map created successfully"); })
                .catch(function (error) { return console.error("Error:", error); });
        }
    }
});
