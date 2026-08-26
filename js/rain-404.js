"use strict";
/**
 * Animated rain for the 404 page.
 * Lines fall at 118 degrees and bend around the pointer as if it were
 * an invisible surface, leaving a small masked area beneath it.
 */
const RAIN_ANGLE = (100 * Math.PI) / 180;
const UMBRELLA_ANGLE = (90 * Math.PI) / 180;
  const RAIN_COUNT = 108;
const UMBRELLA_HALF_WIDTH = 92;
const UMBRELLA_DEPTH = 165;
const FLOW_STRENGTH = 108;
function init404Rain(canvas) {
    const container = canvas.parentElement;
    const ctx = canvas.getContext("2d");
    if (!container || !ctx)
        return;
    const direction = {
        x: Math.cos(RAIN_ANGLE),
        y: Math.sin(RAIN_ANGLE),
    };
    const shelterDirection = {
        x: Math.cos(UMBRELLA_ANGLE),
        y: Math.sin(UMBRELLA_ANGLE),
    };
    const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)");
    const pointer = { x: 0, y: 0, active: false };
    const drops = [];
    let width = 0;
    let height = 0;
    let lastTime = performance.now();
    const lineColor = getComputedStyle(document.body).getPropertyValue("--bs-body-color").trim() || "#2b2f33";
    function makeDrop(randomY = true) {
        return {
            x: Math.random() * (width + 300) - 100,
            y: randomY ? Math.random() * (height + 240) - 120 : -120,
        length: 220 + Math.random() * 160,
            speed: 70 + Math.random() * 25,
        };
    }
    function resetDrops() {
        drops.length = 0;
        for (let i = 0; i < RAIN_COUNT; i++)
            drops.push(makeDrop());
    }
    function resize() {
        const rect = container.getBoundingClientRect();
        const dpr = window.devicePixelRatio || 1;
        width = rect.width;
        height = rect.height;
        const nextWidth = Math.round(width * dpr);
        const nextHeight = Math.round(height * dpr);
        if (canvas.width !== nextWidth || canvas.height !== nextHeight) {
            canvas.width = nextWidth;
            canvas.height = nextHeight;
            ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
            resetDrops();
        }
    }
    function deflectPoint(x, y) {
        if (!pointer.active)
            return { x, y, masked: false };
        const dx = x - pointer.x;
        const dy = y - pointer.y;
        const tangentX = -shelterDirection.y;
        const tangentY = shelterDirection.x;
        const downstream = dx * shelterDirection.x + dy * shelterDirection.y;
        const across = dx * tangentX + dy * tangentY;
        const acrossAbs = Math.abs(across);
        if (downstream >= 0 && acrossAbs < UMBRELLA_HALF_WIDTH) {
            return { x, y, masked: true };
        }
        if (downstream < -UMBRELLA_DEPTH || downstream >= 0 || acrossAbs >= UMBRELLA_HALF_WIDTH + 42) {
            return { x, y, masked: false };
        }
        const progress = 1 - Math.abs(downstream) / UMBRELLA_DEPTH;
        const depthFactor = progress * progress * (3 - 2 * progress);
        const edgeFactor = 1 - acrossAbs / (UMBRELLA_HALF_WIDTH + 42);
        const strength = Math.max(0, depthFactor * depthFactor * edgeFactor) * FLOW_STRENGTH;
        const side = across === 0 ? 1 : Math.sign(across);
        return {
            x: x + tangentX * side * strength,
            y: y + tangentY * side * strength,
            masked: false,
        };
    }
    function drawDrop(drop) {
        const samples = 44;
        let drawing = false;
        ctx.beginPath();
        for (let i = 0; i <= samples; i++) {
            const along = (i / samples) * drop.length;
            const baseX = drop.x - direction.x * along;
            const baseY = drop.y - direction.y * along;
            const point = deflectPoint(baseX, baseY);
            if (point.masked) {
                drawing = false;
                continue;
            }
            if (!drawing) {
                ctx.moveTo(point.x, point.y);
                drawing = true;
            }
            else {
                ctx.lineTo(point.x, point.y);
            }
        }
        ctx.stroke();
    }
    function draw() {
        ctx.clearRect(0, 0, width, height);
        ctx.strokeStyle = lineColor;
        ctx.lineWidth = 1;
        ctx.lineCap = "round";
        drops.forEach(drawDrop);
    }
    function tick(now) {
        const delta = Math.min(0.04, (now - lastTime) / 1000);
        lastTime = now;
        if (!reduceMotion.matches) {
            drops.forEach((drop) => {
                drop.x += direction.x * drop.speed * delta;
                drop.y += direction.y * drop.speed * delta;
                if (drop.y - drop.length > height || drop.x + drop.length < -160) {
                    Object.assign(drop, makeDrop(false));
                    drop.x = Math.random() * (width + 320);
                }
            });
        }
        draw();
        requestAnimationFrame(tick);
    }
    container.addEventListener("pointermove", (event) => {
        const rect = container.getBoundingClientRect();
        pointer.x = event.clientX - rect.left;
        pointer.y = event.clientY - rect.top;
        pointer.active = true;
        if (reduceMotion.matches)
            draw();
    });
    container.addEventListener("pointerleave", () => {
        pointer.active = false;
        if (reduceMotion.matches)
            draw();
    });
    const resizeObserver = new ResizeObserver(resize);
    resizeObserver.observe(container);
    resize();
    requestAnimationFrame(tick);
}
document.addEventListener("DOMContentLoaded", () => {
    const canvas = document.getElementById("rain-404");
    if (canvas instanceof HTMLCanvasElement)
        init404Rain(canvas);
});
