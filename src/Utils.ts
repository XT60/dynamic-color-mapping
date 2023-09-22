import { extname, parse } from "path";

export function enumFromStringValue<T>(
    enm: { [s: string]: T },
    value: string
): T | undefined {
    return (Object.values(enm) as unknown as string[]).includes(value)
        ? (value as unknown as T)
        : undefined;
}

export function isPngFile(filePath: string) {
    const fileExtension = extname(filePath);
    return fileExtension === ".png";
}

export function getBaseName(filePath: string): string {
    const pathInfo = parse(filePath);
    return pathInfo.name;
}

export function getFullFileName(fileName: string, extension: string) {
    return `${fileName}.${extension}`;
}
