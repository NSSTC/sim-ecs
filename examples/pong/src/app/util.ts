export function relToScreenCoords(canvas: HTMLCanvasElement, x: number, y: number): [number, number] {
    return [x * canvas.width, y * canvas.height];
}
