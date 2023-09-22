export class Color {
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

export enum AnimationPart {
    Body = "body",
    Cape = "cape",
    Hair = "hair",
}