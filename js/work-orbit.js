"use strict";
/**
 * Work timeline visualization: animated concentric contour lines with
 * orbiting markers representing work experience entries. Clicking a
 * marker opens a bubble with its details, positioned next to the marker
 * and following it as it orbits.
 *
 * Auto-initializes when a <div id="work-orbit"> element is found on the
 * page. Edit the WORK_ENTRIES array below with real content.
 */
const WORK_ENTRIES = [
    {
        date: "Snowboarding",
        title: "Falling, reframed",
        bio: "Snowboarding taught me that falling isn't failure — it's just part of getting better.",
        orbitRadius: 0.92,
        speed: 0.35,
        phase: 0,
        size: 184,
        image: "assets/orbit-icons/snowboard.png",
        rotation: 20,
        link: "projects/draw/",
    },
    {
        date: "Daily ritual",
        title: "Showing up, daily",
        bio: "The morning coffee ritual taught me that showing up consistently matters more than how you feel that day.",
        orbitRadius: 0.56,
        speed: 0.22,
        phase: 2.1,
        size: 128,
        image: "assets/orbit-icons/drink.png",
        link: "work",
    },
    {
        date: "Hot pot",
        title: "Timing over solo effort",
        bio: "Working at the hot pot restaurant taught me that good timing matters more than doing everything yourself.",
        orbitRadius: 1.04,
        speed: 0.15,
        phase: 4.3,
        size: 164,
        image: "assets/orbit-icons/hotpot.png",
        rotation: 20,
        link: "work",
    },
    {
        date: "Companionship",
        title: "Empathy, practiced daily",
        bio: "Taking care of my dog taught me to notice what someone else needs before they can tell you.",
        orbitRadius: 0.68,
        speed: 0.11,
        phase: 1.2,
        size: 144,
        image: "assets/orbit-icons/dog.png",
        link: "#about",
    },
    {
        date: "Painting",
        title: "Failure, allowed",
        bio: "Painting taught me that mistakes are a right to fail and correct, not a flaw to hide.",
        orbitRadius: 0.8,
        speed: 0.18,
        phase: 5.35,
        size: 172,
        image: "assets/orbit-icons/palette.png",
        link: "gallery",
    },
];
// Tuning constants for the contour animation
const RINGS = 16;
const ANGLE_STEPS = 140;
const BASE_AMPLITUDE = 22;
const TIME_SPEED = 0.0028;
const RIPPLE_AMPLITUDE = 7.2;
const RIPPLE_REACH = 90;
const OFFSCREEN_SPEED_MULTIPLIER = 10;
// --- Perlin-style 3D noise (classic reference implementation, condensed) ---
function buildPermutationTable() {
    const p = [];
    for (let i = 0; i < 256; i++)
        p[i] = i;
    for (let i = 255; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        const tmp = p[i];
        p[i] = p[j];
        p[j] = tmp;
    }
    const pp = [];
    for (let i = 0; i < 512; i++)
        pp[i] = p[i & 255];
    return pp;
}
function fade(t) {
    return t * t * t * (t * (t * 6 - 15) + 10);
}
function lerp(a, b, t) {
    return a + t * (b - a);
}
function grad(hash, x, y, z) {
    const h = hash & 15;
    const u = h < 8 ? x : y;
    const v = h < 4 ? y : h === 12 || h === 14 ? x : z;
    return ((h & 1) === 0 ? u : -u) + ((h & 2) === 0 ? v : -v);
}
function makeNoise3(perm) {
    return function noise3(x, y, z) {
        const X = Math.floor(x) & 255;
        const Y = Math.floor(y) & 255;
        const Z = Math.floor(z) & 255;
        x -= Math.floor(x);
        y -= Math.floor(y);
        z -= Math.floor(z);
        const u = fade(x);
        const v = fade(y);
        const w = fade(z);
        const A = perm[X] + Y;
        const AA = perm[A] + Z;
        const AB = perm[A + 1] + Z;
        const B = perm[X + 1] + Y;
        const BA = perm[B] + Z;
        const BB = perm[B + 1] + Z;
        return lerp(lerp(lerp(grad(perm[AA], x, y, z), grad(perm[BA], x - 1, y, z), u), lerp(grad(perm[AB], x, y - 1, z), grad(perm[BB], x - 1, y - 1, z), u), v), lerp(lerp(grad(perm[AA + 1], x, y, z - 1), grad(perm[BA + 1], x - 1, y, z - 1), u), lerp(grad(perm[AB + 1], x, y - 1, z - 1), grad(perm[BB + 1], x - 1, y - 1, z - 1), u), v), w);
    };
}
// --- Main visualization ---
function initWorkOrbit(container) {
    const canvas = document.createElement("canvas");
    canvas.style.width = "100%";
    canvas.style.height = "100%";
    canvas.style.display = "block";
    container.appendChild(canvas);
    const planetsLayer = document.createElement("div");
    planetsLayer.style.position = "absolute";
    planetsLayer.style.inset = "0";
    planetsLayer.style.pointerEvents = "none";
    container.appendChild(planetsLayer);
    const bubble = document.createElement("div");
    bubble.className = "work-orbit__bubble";
    bubble.style.display = "none";
    bubble.innerHTML =
        '<p class="work-orbit__bubble-date"></p>' +
            '<p class="work-orbit__bubble-title"></p>' +
            '<p class="work-orbit__bubble-body"></p>' +
            '<a class="work-orbit__bubble-link" aria-label="Learn more">' +
            '<svg class="bi bi-arrow-right" xmlns="http://www.w3.org/2000/svg" width="26" height="26" fill="currentColor" viewBox="0 0 16 16" aria-hidden="true">' +
            '<path fill-rule="evenodd" d="M1 8a.5.5 0 0 1 .5-.5h11.793L9.146 4.354a.5.5 0 1 1 .708-.708l4 4a.5.5 0 0 1 0 .708l-4 4a.5.5 0 0 1-.708-.708L12.293 8.5H1.5A.5.5 0 0 1 1 8"/>' +
            '</svg></a>';
    container.appendChild(bubble);
    const bubbleDate = bubble.querySelector(".work-orbit__bubble-date");
    const bubbleTitle = bubble.querySelector(".work-orbit__bubble-title");
    const bubbleBody = bubble.querySelector(".work-orbit__bubble-body");
    const bubbleLink = bubble.querySelector(".work-orbit__bubble-link");
    const ctx = canvas.getContext("2d");
    if (!ctx)
        return;
    const noise3 = makeNoise3(buildPermutationTable());
    let t = 0;
    let activeIndex = null;
    let closeTimer = null;
    let pointerInside = false;
    const pointer = { x: 0, y: 0 };
    const orbitAngles = WORK_ENTRIES.map((entry) => entry.phase);
    const lastPositions = [];
    const lineColor = getComputedStyle(document.body).getPropertyValue("--bs-body-color").trim() || "#2b2f33";
    function resize() {
        const rect = container.getBoundingClientRect();
        const dpr = window.devicePixelRatio || 1;
        const nextWidth = Math.round(rect.width * dpr);
        const nextHeight = Math.round(rect.height * dpr);
        if (canvas.width !== nextWidth || canvas.height !== nextHeight) {
            canvas.width = nextWidth;
            canvas.height = nextHeight;
        }
        ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    }
    window.addEventListener("resize", resize);
    const resizeObserver = new ResizeObserver(resize);
    resizeObserver.observe(container);
    container.addEventListener("pointermove", (event) => {
        const rect = container.getBoundingClientRect();
        pointer.x = event.clientX - rect.left;
        pointer.y = event.clientY - rect.top;
        pointerInside = true;
    });
    container.addEventListener("pointerleave", () => {
        pointerInside = false;
    });
    resize();
    function drawContours() {
        const w = canvas.width / (window.devicePixelRatio || 1);
        const h = canvas.height / (window.devicePixelRatio || 1);
        ctx.clearRect(0, 0, w, h);
        // Anchor the contour center to the left edge so the banner shows a half-circle.
        const cx = 0;
        const cy = h * 0.5;
        const maxR = Math.min(w * 0.92, h * 0.88);
        ctx.strokeStyle = lineColor;
        ctx.lineWidth = 1;
        for (let r = 1; r <= RINGS; r++) {
            const baseR = (r / RINGS) * maxR;
            ctx.beginPath();
            for (let a = 0; a <= ANGLE_STEPS; a++) {
                const theta = (a / ANGLE_STEPS) * Math.PI * 2;
                const nx = Math.cos(theta) * 1.6 + r * 0.35;
                const ny = Math.sin(theta) * 1.6 + r * 0.35;
                const n = noise3(nx, ny, t);
                let radius = baseR + n * BASE_AMPLITUDE;
                if (pointerInside) {
                    const baseX = cx + Math.cos(theta) * radius;
                    const baseY = cy + Math.sin(theta) * radius;
                    const distance = Math.hypot(baseX - pointer.x, baseY - pointer.y);
                    const falloff = Math.exp(-distance / RIPPLE_REACH);
                    radius += Math.sin(distance * 0.1 - t * 90) * RIPPLE_AMPLITUDE * falloff;
                }
                const px = cx + Math.cos(theta) * radius;
                const py = cy + Math.sin(theta) * radius;
                if (a === 0)
                    ctx.moveTo(px, py);
                else
                    ctx.lineTo(px, py);
            }
            ctx.closePath();
            ctx.stroke();
        }
        return { cx, cy, maxR };
    }
    const planetEls = WORK_ENTRIES.map((entry, i) => {
        const el = document.createElement("a");
        el.className = "work-orbit__planet";
        el.href = entry.link;
        el.setAttribute("aria-label", entry.title);
        el.style.width = entry.size + "px";
        el.style.height = entry.size + "px";
        el.style.backgroundImage = `url("${entry.image}")`;
        el.style.setProperty("--planet-rotation", `${entry.rotation || 0}deg`);
        el.title = entry.title;
        el.addEventListener("mouseenter", () => {
            if (closeTimer !== null)
                window.clearTimeout(closeTimer);
            activeIndex = i;
            updateBubbleContent();
        });
        el.addEventListener("mouseleave", () => {
            closeTimer = window.setTimeout(() => {
                if (activeIndex === i) {
                    activeIndex = null;
                    updateBubbleContent();
                }
            }, 220);
        });
        el.addEventListener("click", (e) => {
            e.stopPropagation();
        });
        planetsLayer.appendChild(el);
        return el;
    });
    document.addEventListener("click", () => {
        activeIndex = null;
        bubble.style.display = "none";
    });
    bubble.addEventListener("mouseenter", () => {
        if (closeTimer !== null)
            window.clearTimeout(closeTimer);
    });
    bubble.addEventListener("mouseleave", () => {
        activeIndex = null;
        updateBubbleContent();
    });
    bubble.addEventListener("click", (event) => event.stopPropagation());
    function updateBubbleContent() {
        if (activeIndex === null) {
            bubble.style.display = "none";
            return;
        }
        const entry = WORK_ENTRIES[activeIndex];
        bubbleDate.textContent = entry.date;
        bubbleTitle.textContent = entry.title;
        bubbleBody.textContent = entry.bio;
        bubbleLink.href = entry.link;
        bubbleLink.setAttribute("aria-label", `Learn more about ${entry.title}`);
        bubble.style.display = "block";
    }
    function drawPlanets(cx, cy, maxR) {
        const iconScale = Math.max(0.55, Math.min(1, maxR / 290));
        const layouts = WORK_ENTRIES.map((entry, i) => {
            const r = maxR * entry.orbitRadius;
            const size = entry.size * iconScale;
            const previousX = cx + Math.cos(orbitAngles[i]) * r;
            const isOffscreen = previousX + size / 2 < 0;
            const speedMultiplier = isOffscreen ? OFFSCREEN_SPEED_MULTIPLIER : 1;
            orbitAngles[i] += 0.002 * entry.speed * speedMultiplier;
            return { angle: orbitAngles[i], r, size, x: 0, y: 0 };
        });
        function updatePosition(i) {
            const layout = layouts[i];
            layout.x = cx + Math.cos(layout.angle) * layout.r;
            layout.y = cy + Math.sin(layout.angle) * layout.r * 0.55;
        }
        layouts.forEach((_, i) => updatePosition(i));
        // Nudge overlapping icons apart along their own orbits before painting.
        for (let pass = 0; pass < 6; pass++) {
            for (let i = 0; i < layouts.length; i++) {
                for (let j = i + 1; j < layouts.length; j++) {
                    const a = layouts[i];
                    const b = layouts[j];
                    if (a.x + a.size / 2 < 0 && b.x + b.size / 2 < 0)
                        continue;
                    const distance = Math.hypot(a.x - b.x, a.y - b.y);
                    const minimumDistance = (a.size + b.size) / 2 + 14;
                    if (distance >= minimumDistance)
                        continue;
                    const direction = Math.sin(a.angle - b.angle) >= 0 ? 1 : -1;
                    const adjustment = Math.min(0.025, ((minimumDistance - distance) / maxR) * 0.12);
                    a.angle += adjustment * direction;
                    b.angle -= adjustment * direction;
                    orbitAngles[i] = a.angle;
                    orbitAngles[j] = b.angle;
                    updatePosition(i);
                    updatePosition(j);
                }
            }
        }
        layouts.forEach((layout, i) => {
            planetEls[i].style.width = layout.size + "px";
            planetEls[i].style.height = layout.size + "px";
            planetEls[i].style.left = layout.x + "px";
            planetEls[i].style.top = layout.y + "px";
            lastPositions[i] = { x: layout.x, y: layout.y };
        });
        if (activeIndex !== null) {
            const pos = lastPositions[activeIndex];
            const activeEntry = WORK_ENTRIES[activeIndex];
            const containerW = container.clientWidth;
            const bubbleWidth = Math.min(280, containerW - 16);
            const iconOffset = (activeEntry.size * iconScale) / 2 + 12;
            let bx = pos.x + iconOffset;
            if (bx + bubbleWidth > containerW - 8)
                bx = pos.x - bubbleWidth - iconOffset;
            bubble.style.left = bx + "px";
            bubble.style.top = pos.y - 10 + "px";
        }
    }
    function tick() {
        t += TIME_SPEED;
        const geom = drawContours();
        drawPlanets(geom.cx, geom.cy, geom.maxR);
        requestAnimationFrame(tick);
    }
    tick();
}
document.addEventListener("DOMContentLoaded", () => {
    const container = document.getElementById("work-orbit");
    if (container)
        initWorkOrbit(container);
});
