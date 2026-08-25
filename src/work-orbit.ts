/**
 * Work timeline visualization: animated concentric contour lines with
 * orbiting markers representing work experience entries. Clicking a
 * marker opens a bubble with its details, positioned next to the marker
 * and following it as it orbits.
 *
 * Auto-initializes when a <div id="work-orbit"> element is found on the
 * page. Edit the WORK_ENTRIES array below with real content.
 */

interface WorkEntry {
  date: string;
  title: string;
  bio: string;
  orbitRadius: number; // fraction of max radius, e.g. 0.5 = half way out
  speed: number;       // radians per animation tick, higher = faster
  phase: number;       // starting angle offset in radians
  size: number;        // marker diameter in px
  image: string;       // icon shown instead of a dot
  rotation?: number;   // clockwise rotation in degrees
}

const WORK_ENTRIES: WorkEntry[] = [
  {
    date: "2023 — 2024",
    title: "Role title, Company name",
    bio: "One or two sentences describing this role and its outcomes.",
    orbitRadius: 0.88,
    speed: 0.35,
    phase: 0,
    size: 92,
    image: "assets/orbit-icons/snowboard.png",
    rotation: 20,
  },
  {
    date: "2022 — 2023",
    title: "Role title, Company name",
    bio: "One or two sentences describing this role.",
    orbitRadius: 0.34,
    speed: 0.22,
    phase: 2.1,
    size: 64,
    image: "assets/orbit-icons/drink.png",
  },
  {
    date: "2021 — 2022",
    title: "Role title, Company name",
    bio: "One or two sentences describing this role.",
    orbitRadius: 0.67,
    speed: 0.15,
    phase: 4.3,
    size: 82,
    image: "assets/orbit-icons/hotpot.png",
    rotation: 20,
  },
  {
    date: "2020 — 2021",
    title: "Role title, Company name",
    bio: "One or two sentences describing this role.",
    orbitRadius: 1.0,
    speed: 0.11,
    phase: 1.2,
    size: 72,
    image: "assets/orbit-icons/dog.png",
  },
  {
    date: "2019 — 2020",
    title: "Role title, Company name",
    bio: "One or two sentences describing this role.",
    orbitRadius: 0.48,
    speed: 0.18,
    phase: 5.35,
    size: 86,
    image: "assets/orbit-icons/palette.png",
  },
];

// Tuning constants for the contour animation
const RINGS = 16;
const ANGLE_STEPS = 140;
const BASE_AMPLITUDE = 22;
const TIME_SPEED = 0.0028;
const RIPPLE_AMPLITUDE = 7.2;
const RIPPLE_REACH = 90;

// --- Perlin-style 3D noise (classic reference implementation, condensed) ---

function buildPermutationTable(): number[] {
  const p: number[] = [];
  for (let i = 0; i < 256; i++) p[i] = i;
  for (let i = 255; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    const tmp = p[i];
    p[i] = p[j];
    p[j] = tmp;
  }
  const pp: number[] = [];
  for (let i = 0; i < 512; i++) pp[i] = p[i & 255];
  return pp;
}

function fade(t: number): number {
  return t * t * t * (t * (t * 6 - 15) + 10);
}

function lerp(a: number, b: number, t: number): number {
  return a + t * (b - a);
}

function grad(hash: number, x: number, y: number, z: number): number {
  const h = hash & 15;
  const u = h < 8 ? x : y;
  const v = h < 4 ? y : h === 12 || h === 14 ? x : z;
  return ((h & 1) === 0 ? u : -u) + ((h & 2) === 0 ? v : -v);
}

function makeNoise3(perm: number[]) {
  return function noise3(x: number, y: number, z: number): number {
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

    return lerp(
      lerp(
        lerp(grad(perm[AA], x, y, z), grad(perm[BA], x - 1, y, z), u),
        lerp(grad(perm[AB], x, y - 1, z), grad(perm[BB], x - 1, y - 1, z), u),
        v
      ),
      lerp(
        lerp(grad(perm[AA + 1], x, y, z - 1), grad(perm[BA + 1], x - 1, y, z - 1), u),
        lerp(grad(perm[AB + 1], x, y - 1, z - 1), grad(perm[BB + 1], x - 1, y - 1, z - 1), u),
        v
      ),
      w
    );
  };
}

// --- Main visualization ---

function initWorkOrbit(container: HTMLElement): void {
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
    '<p class="work-orbit__bubble-body"></p>';
  container.appendChild(bubble);

  const bubbleDate = bubble.querySelector(".work-orbit__bubble-date") as HTMLElement;
  const bubbleTitle = bubble.querySelector(".work-orbit__bubble-title") as HTMLElement;
  const bubbleBody = bubble.querySelector(".work-orbit__bubble-body") as HTMLElement;

  const ctx = canvas.getContext("2d");
  if (!ctx) return;

  const noise3 = makeNoise3(buildPermutationTable());

  let t = 0;
  let activeIndex: number | null = null;
  let pointerInside = false;
  const pointer = { x: 0, y: 0 };
  const lastPositions: { x: number; y: number }[] = [];

  const lineColor =
    getComputedStyle(document.body).getPropertyValue("--bs-body-color").trim() || "#2b2f33";

  function resize(): void {
    const rect = container.getBoundingClientRect();
    const dpr = window.devicePixelRatio || 1;
    const nextWidth = Math.round(rect.width * dpr);
    const nextHeight = Math.round(rect.height * dpr);
    if (canvas.width !== nextWidth || canvas.height !== nextHeight) {
      canvas.width = nextWidth;
      canvas.height = nextHeight;
    }
    ctx!.setTransform(dpr, 0, 0, dpr, 0, 0);
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

  function drawContours(): { cx: number; cy: number; maxR: number } {
    const w = canvas.width / (window.devicePixelRatio || 1);
    const h = canvas.height / (window.devicePixelRatio || 1);
    ctx!.clearRect(0, 0, w, h);
    const cx = w * 0.42;
    const cy = h * 0.5;
    const maxR = Math.min(w * 0.42, h * 0.42);

    ctx!.strokeStyle = lineColor;
    ctx!.lineWidth = 1;

    for (let r = 1; r <= RINGS; r++) {
      const baseR = (r / RINGS) * maxR;
      ctx!.beginPath();
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
        if (a === 0) ctx!.moveTo(px, py);
        else ctx!.lineTo(px, py);
      }
      ctx!.closePath();
      ctx!.stroke();
    }
    return { cx, cy, maxR };
  }

  const planetEls: HTMLDivElement[] = WORK_ENTRIES.map((entry, i) => {
    const el = document.createElement("div");
    el.className = "work-orbit__planet";
    el.style.width = entry.size + "px";
    el.style.height = entry.size + "px";
    el.style.backgroundImage = `url("${entry.image}")`;
    el.style.setProperty("--planet-rotation", `${entry.rotation || 0}deg`);
    el.title = entry.title;
    el.addEventListener("mouseenter", () => {
      activeIndex = i;
      updateBubbleContent();
    });
    el.addEventListener("mouseleave", () => {
      if (activeIndex === i) {
        activeIndex = null;
        updateBubbleContent();
      }
    });
    el.addEventListener("click", (e) => {
      e.stopPropagation();
      activeIndex = activeIndex === i ? null : i;
      updateBubbleContent();
    });
    planetsLayer.appendChild(el);
    return el;
  });

  document.addEventListener("click", () => {
    activeIndex = null;
    bubble.style.display = "none";
  });

  function updateBubbleContent(): void {
    if (activeIndex === null) {
      bubble.style.display = "none";
      return;
    }
    const entry = WORK_ENTRIES[activeIndex];
    bubbleDate.textContent = entry.date;
    bubbleTitle.textContent = entry.title;
    bubbleBody.textContent = entry.bio;
    bubble.style.display = "block";
  }

  function drawPlanets(cx: number, cy: number, maxR: number): void {
    const orbitTime = (t / TIME_SPEED) * 0.002;
    const iconScale = Math.max(0.55, Math.min(1, maxR / 290));
    WORK_ENTRIES.forEach((entry, i) => {
      const angle = entry.phase + orbitTime * entry.speed;
      const r = maxR * entry.orbitRadius;
      const x = cx + Math.cos(angle) * r;
      const y = cy + Math.sin(angle) * r * 0.55;
      const displayedSize = entry.size * iconScale;
      planetEls[i].style.width = displayedSize + "px";
      planetEls[i].style.height = displayedSize + "px";
      planetEls[i].style.left = x + "px";
      planetEls[i].style.top = y + "px";
      lastPositions[i] = { x, y };
    });

    if (activeIndex !== null) {
      const pos = lastPositions[activeIndex];
      const activeEntry = WORK_ENTRIES[activeIndex];
      const containerW = container.clientWidth;
      const bubbleWidth = 200;
      const iconOffset = (activeEntry.size * iconScale) / 2 + 12;
      let bx = pos.x + iconOffset;
      if (bx + bubbleWidth > containerW - 8) bx = pos.x - bubbleWidth - iconOffset;
      bubble.style.left = bx + "px";
      bubble.style.top = pos.y - 10 + "px";
    }
  }

  function tick(): void {
    t += TIME_SPEED;
    const geom = drawContours();
    drawPlanets(geom.cx, geom.cy, geom.maxR);
    requestAnimationFrame(tick);
  }
  tick();
}

document.addEventListener("DOMContentLoaded", () => {
  const container = document.getElementById("work-orbit");
  if (container) initWorkOrbit(container);
});
