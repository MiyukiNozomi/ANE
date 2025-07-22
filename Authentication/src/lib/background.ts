import { dev } from "$app/environment";
import { SimplexNoise2D } from "./simplexNoise";

type Float2 = {
    x: number,
    y: number
};

let stars = new Array<{
    x: number,
    y: number,
    scale: number,
    color: string
}>();

let lastCanvasDim = { w: 0, h: 0 };

function isHardwareBad() {
    return navigator.hardwareConcurrency <= 2 || (screen.height > screen.width);
}

function distance(x1: number, y1: number, x2: number, y2: number) {
    return Math.sqrt(Math.pow(x2 - x1, 2) + Math.pow(y2 - y1, 2));
}

async function drawSunImage() {
    let canvas = document.createElement("canvas");
    let ctx = canvas.getContext("2d")!;
    canvas.width = lastCanvasDim.w;
    canvas.height = lastCanvasDim.h / 2;

    const bg = ctx.createLinearGradient(0, 0, 20, canvas.height);
    bg.addColorStop(0, "#00000000");
    bg.addColorStop(0.2, "#00000000");
    bg.addColorStop(1, "#FF633CFF");

    ctx.fillStyle = bg;
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    return new Promise<HTMLImageElement>(resolve => {
        let img = new Image();
        img.src = canvas.toDataURL();
        img.onload = () => resolve(img);
    });
}

let timeToInitializeStars = 0;
async function drawStars() {
    if (stars.length == 0) {
        let startTime = performance.now();

        const max = 4096;
        const min = 1024;
        const maxColorVariation = 32;
        const maximumSize = 2.3;

        const maxDistance = 4;

        let count = Math.floor(Math.random() * (max - min + 1)) + min;

        if (isHardwareBad())
            count = 128;

        for (let i = 0; i < count; i++) {
            const x = Math.floor(Math.random() * lastCanvasDim.w);
            const y = Math.floor(Math.random() * lastCanvasDim.h);

            let isDuplicate = false;
            for (let k = 0; k < stars.length; k++) {
                const other = stars[k];
                if (distance(x, y, other.x, other.y) < maxDistance) {
                    isDuplicate = true;
                    break;
                }
            }
            if (isDuplicate) continue;

            let starColor = new Array<number>();
            for (let j = 0; j < 3; j++)
                starColor.push((Math.random() * maxColorVariation) + (255 - maxColorVariation));

            const opacity = 1.0 - ((y / lastCanvasDim.h) * 1.5);

            stars.push({
                x, y,
                color: `rgba(${starColor.join(",")}, ${opacity})`,
                scale: Math.floor(Math.random() * maximumSize)
            });
        }

        timeToInitializeStars = performance.now() - startTime;
    }

    console.log("Took: ", timeToInitializeStars + " to initialize starfield.");

    let canvas = document.createElement("canvas");
    let ctx = canvas.getContext("2d")!;
    canvas.width = lastCanvasDim.w;
    canvas.height = lastCanvasDim.h;

    const drawDots = (scaleOffs: number) => {
        for (let star of stars) {
            const scale = Math.max(star.scale - scaleOffs, 1.0);

            ctx.fillStyle = star.color;
            ctx.fillRect(star.x, star.y, scale, scale);
        }
    }

    drawDots(0);
    if (timeToInitializeStars < 150) {
        gBlur(2, canvas, ctx);
        drawDots(2);
    } else {
        console.log("[Starfield] not doing blurring (hardware too slow)");
    }

    return new Promise<HTMLImageElement>(resolve => {
        let img = new Image();
        img.src = canvas.toDataURL();
        img.onload = () => resolve(img);
    });
}

function gBlur(blur: number, canvas: HTMLCanvasElement, ctx: CanvasRenderingContext2D) {
    let start = +new Date();

    let sum = 0;
    let delta = 5;
    let alpha_left = 1 / (2 * Math.PI * delta * delta);
    let step = blur < 3 ? 1 : 2;
    for (let y = -blur; y <= blur; y += step) {
        for (let x = -blur; x <= blur; x += step) {
            let weight = alpha_left * Math.exp(-(x * x + y * y) / (2 * delta * delta));
            sum += weight;
        }
    }
    let count = 0;
    for (let y = -blur; y <= blur; y += step) {
        for (let x = -blur; x <= blur; x += step) {
            count++;
            ctx.globalAlpha = alpha_left * Math.exp(-(x * x + y * y) / (2 * delta * delta)) / sum * blur;
            ctx.drawImage(canvas, x, y);
        }
    }
    ctx.globalAlpha = 1;
    console.log("time: " + (+new Date() - start))
}

async function drawTerrain() {
    let canvas = document.createElement("canvas");
    let ctx = canvas.getContext("2d")!;
    canvas.width = lastCanvasDim.w;
    canvas.height = lastCanvasDim.h / 3;
    // maybe.. we can do this another time.

    const noise = new SimplexNoise2D();

    const minValue = 0.4;

    const simpleFilter = (x: number, layerCount: number = 1,
        persistence: number = 0.5, baseRoughness: number = 1,
        strength: number = 0.5, roughness: number = 2) => {
        let noiseValue = 0;
        let frequency = baseRoughness;
        let amplitude = 1;

        for (let i = 0; i < layerCount; i++) {
            let v = noise.evaluate(x * frequency, 0);

            noiseValue += (v + 1) * .5 * amplitude;
            frequency *= roughness;
            amplitude *= persistence;
        }

        noiseValue = Math.max(noiseValue, minValue);
        return noiseValue * strength;
    };


    for (let i = 0; i < canvas.width; i++) {
        let noiseValue = simpleFilter(i, 10, 0.5, 0.02, 0.5, 2);

        let elevation = canvas.height * noiseValue;

        for (let d = 0; d < elevation; d++) {
            let opacity = 1.5 - (d / elevation);

            ctx.fillStyle = `rgba(0, 0, 0, ${opacity})`;
            ctx.fillRect(i, canvas.height - d, 1, 1);
        }
    }

    return new Promise<HTMLImageElement>(resolve => {
        let img = new Image();
        img.src = canvas.toDataURL();
        img.onload = () => resolve(img);
    });
}

export async function renderBackgroundCanvas(canvas: HTMLCanvasElement) {
    if (canvas == null) return;
    stars = new Array();

    console.log("Are we dealing with bad hardware? " + (isHardwareBad() ? "YES." : "no! thankfuly!"));

    let toolbarHeight = window.outerHeight - window.innerHeight;

    canvas.width = screen.availWidth;
    canvas.height = screen.availHeight - toolbarHeight;

    lastCanvasDim = {
        w: canvas.width,
        h: canvas.height
    };

    let ctx = canvas.getContext("2d");

    if (ctx == null) {
        return canvas.style.backgroundColor = "#002200";
    }

    let background = ctx.createLinearGradient(0, 0, 0, canvas.height);
    background.addColorStop(0, "#000000");
    background.addColorStop(0.4, "#000000");
    background.addColorStop(1, "#0777E7");

    ctx.fillStyle = background;
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    const sun = await drawSunImage();
    ctx.drawImage(sun, 0, canvas.height - sun.height);

    const starsImage = await drawStars();
    ctx.drawImage(starsImage, 0, 0);

    if (!isHardwareBad()) {
        const terrainImages = await drawTerrain();
        ctx.drawImage(terrainImages, 0, canvas.height - terrainImages.height);
    }

    if (dev) {
        ctx.fillStyle = "#ff0000";
        ctx.font = "20px Arial";
        ctx.fillText("Background Updated at " + new Date().toString(), 15, 40);
    }
}