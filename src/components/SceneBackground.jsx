import { useEffect, useRef } from "react";
import * as THREE from "three";

/* ============================================================
   3D SPACE SCENE

   Choreography (driven by `phase` + `awake`):
     landing / not awake — the craft is parked at the bottom edge of the
                           viewport and the astronaut floats beside it.
                           Nothing moves: engines cold, only the navigation
                           strobes blink so the ship still reads as alive.
     landing / awake     — the first cursor movement lights the thrusters.
                           The ship lifts off the bottom edge and flies a
                           slow banked orbit around the call to action while
                           the astronaut circles the ship on their tether.
     launching           — full throttle: the loop tightens and speeds up,
                           the ship barrel-rolls, then breaks out of the
                           orbit and climbs out of frame with the stars
                           streaking behind it.
     app                 — crew gone, stars drift slowly as a calm backdrop.

   The craft and suit are modelled in a hard-sci-fi register (Project
   Hail Mary / real EVA hardware) rather than as a cartoon rocket:
   segmented hull with procedural panel lines and rivets, photovoltaic
   wings, radiators, RCS quads, lathe-turned engine bells, crinkled gold
   MLI foil, and a suit with joint bearings, PLSS pack, helmet lamps,
   a gold visor and a tether that stays physically attached to the hull.

   Realism comes mostly from lighting, not polygons — a procedural
   environment map through PMREM gives the metals something to reflect,
   and ACES tone mapping keeps the highlights from clipping to flat white.
   ============================================================ */

/* ---------------- tuning ---------------- */
const ORBIT_W = 0.30; // ship: rad/s around the CTA (~21 s per lap)
const ASTRO_W = 0.62; // astronaut: rad/s around the ship (~10 s per lap)
const WAKE_DUR = 2.3; // seconds to go from parked to full orbit
// Fraction of the full velocity heading the ship banks into. At 1.0 it flies
// perfectly nose-first, which on a wide ellipse means lying sideways most of
// the lap; 0.6 reads as leaning into the turn while still looking like a rocket.
const LEAN = 0.6;

const STAR_VERT = /* glsl */ `
  uniform float uTime;
  uniform float uDpr;

  attribute float aSize;
  attribute float aPhase;
  attribute float aRate;
  attribute vec3 aColor;

  varying vec3 vColor;
  varying float vPhase;
  varying float vFade;

  const float SPAN = 92.0;

  void main() {
    vec3 p = position;
    float d = mod((-p.z - 5.0) - uTime * aRate, SPAN);
    p.z = -5.0 - d;

    vec4 mv = modelViewMatrix * vec4(p, 1.0);
    gl_Position = projectionMatrix * mv;
    gl_PointSize = aSize * uDpr * (170.0 / max(-mv.z, 1.0));

    vColor = aColor;
    vPhase = aPhase;
    vFade = smoothstep(SPAN, SPAN - 24.0, d) * smoothstep(0.0, 7.0, d);
  }
`;

// No explicit `precision`: Three injects a matching default into both
// stages, and overriding only one makes shared uniforms fail to link.
const STAR_FRAG = /* glsl */ `
  uniform float uTime;

  varying vec3 vColor;
  varying float vPhase;
  varying float vFade;

  void main() {
    vec2 uv = gl_PointCoord - 0.5;
    float r = length(uv);
    if (r > 0.5) discard;

    float core = smoothstep(0.5, 0.0, r);
    float glow = pow(core, 2.6);
    float twinkle = 0.7 + 0.3 * sin(uTime * 0.9 + vPhase * 6.2831);

    gl_FragColor = vec4(vColor, glow * twinkle * vFade);
  }
`;

const TRAIL_VERT = /* glsl */ `
  uniform float uDpr;
  attribute float aLife;
  varying float vLife;

  void main() {
    vec4 mv = modelViewMatrix * vec4(position, 1.0);
    gl_Position = projectionMatrix * mv;
    gl_PointSize = (2.0 + (1.0 - aLife) * 9.0) * uDpr * (70.0 / max(-mv.z, 1.0));
    vLife = aLife;
  }
`;

const TRAIL_FRAG = /* glsl */ `
  varying float vLife;

  void main() {
    vec2 uv = gl_PointCoord - 0.5;
    float r = length(uv);
    if (r > 0.5) discard;

    float a = pow(smoothstep(0.5, 0.0, r), 2.0) * pow(vLife, 1.5);
    vec3 c = mix(vec3(0.85, 0.30, 0.06), vec3(0.75, 0.88, 1.0), pow(vLife, 2.2));
    gl_FragColor = vec4(c, a * 0.9);
  }
`;

/* ---------------- small maths helpers ---------------- */
const clamp01 = (v) => (v < 0 ? 0 : v > 1 ? 1 : v);

const smoothstep = (a, b, x) => {
  const t = clamp01((x - a) / (b - a));
  return t * t * (3 - 2 * t);
};

const easeInOut = (t) =>
  t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2;

/** Move `cur` toward `target` the short way round, so angles never unwind. */
const approachAngle = (cur, target, k) => {
  const TAU = Math.PI * 2;
  let d = ((target - cur + Math.PI) % TAU + TAU) % TAU - Math.PI;
  return cur + d * k;
};

/* ---------------- procedural textures ---------------- */
function makeCanvas(w, h) {
  const cvs = document.createElement("canvas");
  cvs.width = w;
  cvs.height = h;
  return [cvs, cvs.getContext("2d")];
}

function makeGlowTexture(rgb) {
  const size = 256;
  const [cvs, ctx] = makeCanvas(size, size);

  const g = ctx.createRadialGradient(
    size / 2,
    size / 2,
    0,
    size / 2,
    size / 2,
    size / 2,
  );
  g.addColorStop(0, `rgba(${rgb}, 0.5)`);
  g.addColorStop(0.35, `rgba(${rgb}, 0.16)`);
  g.addColorStop(1, `rgba(${rgb}, 0)`);

  ctx.fillStyle = g;
  ctx.fillRect(0, 0, size, size);

  const tex = new THREE.CanvasTexture(cvs);
  tex.colorSpace = THREE.SRGBColorSpace;
  return tex;
}

/**
 * Equirectangular gradient standing in for a real HDRI: a hot key from the
 * sun, cool blue bounce from below, deep shadow elsewhere. Fed through
 * PMREM it gives metal surfaces a believable falloff.
 */
function makeEnvTexture() {
  const w = 512;
  const h = 256;
  const [cvs, ctx] = makeCanvas(w, h);

  // Upper hemisphere: cool starlight. Lower: near-black space.
  const sky = ctx.createLinearGradient(0, 0, 0, h);
  sky.addColorStop(0, "#101d40");
  sky.addColorStop(0.55, "#0c1a38");
  sky.addColorStop(1, "#050a18");
  ctx.fillStyle = sky;
  ctx.fillRect(0, 0, w, h);

  // Key light — the "sun", upper left.
  const sun = ctx.createRadialGradient(w * 0.26, h * 0.3, 0, w * 0.26, h * 0.3, w * 0.2);
  sun.addColorStop(0, "#ffffff");
  sun.addColorStop(0.3, "#cddcff");
  sun.addColorStop(1, "rgba(12,26,56,0)");
  ctx.fillStyle = sun;
  ctx.fillRect(0, 0, w, h);

  // Cool planetary bounce from below right.
  const bounce = ctx.createRadialGradient(
    w * 0.72,
    h * 0.78,
    0,
    w * 0.72,
    h * 0.78,
    w * 0.26,
  );
  bounce.addColorStop(0, "#2f5ea8");
  bounce.addColorStop(1, "rgba(5,10,24,0)");
  ctx.fillStyle = bounce;
  ctx.fillRect(0, 0, w, h);

  const tex = new THREE.CanvasTexture(cvs);
  tex.mapping = THREE.EquirectangularReflectionMapping;
  tex.colorSpace = THREE.SRGBColorSpace;
  return tex;
}

/**
 * Greyscale hull detail: weathering blotches, panel seams with a raised
 * lip, and rivet lines. Used as bump + roughness so the colour still comes
 * from the material — real spacecraft skin is one alloy, many finishes.
 */
function makePanelTexture() {
  const S = 512;
  const [cvs, ctx] = makeCanvas(S, S);

  ctx.fillStyle = "#8c8c8c";
  ctx.fillRect(0, 0, S, S);

  for (let i = 0; i < 240; i++) {
    const x = Math.random() * S;
    const y = Math.random() * S;
    const r = 8 + Math.random() * 62;
    const v = Math.random() < 0.5 ? 104 : 176;
    const g = ctx.createRadialGradient(x, y, 0, x, y, r);
    g.addColorStop(0, `rgba(${v},${v},${v},0.2)`);
    g.addColorStop(1, `rgba(${v},${v},${v},0)`);
    ctx.fillStyle = g;
    ctx.beginPath();
    ctx.arc(x, y, r, 0, Math.PI * 2);
    ctx.fill();
  }

  const seam = (x0, y0, x1, y1) => {
    ctx.strokeStyle = "rgba(26,26,26,0.85)";
    ctx.lineWidth = 3;
    ctx.beginPath();
    ctx.moveTo(x0, y0);
    ctx.lineTo(x1, y1);
    ctx.stroke();

    // Highlight lip just above the groove so it reads as a raised plate.
    ctx.strokeStyle = "rgba(226,226,226,0.5)";
    ctx.lineWidth = 1.5;
    ctx.beginPath();
    ctx.moveTo(x0, y0 - 2.5);
    ctx.lineTo(x1, y1 - 2.5);
    ctx.stroke();
  };

  const ROWS = 6;
  for (let i = 1; i < ROWS; i++) seam(0, (S / ROWS) * i, S, (S / ROWS) * i);

  ctx.strokeStyle = "rgba(26,26,26,0.7)";
  ctx.lineWidth = 2.5;
  for (let i = 0; i < 9; i++) {
    const x = Math.round(Math.random() * (ROWS - 1)) * (S / ROWS) + 20;
    const row = Math.floor(Math.random() * ROWS);
    ctx.beginPath();
    ctx.moveTo(x, (S / ROWS) * row);
    ctx.lineTo(x, (S / ROWS) * (row + 1));
    ctx.stroke();
  }

  // Rivet lines tracking each seam.
  ctx.fillStyle = "rgba(214,214,214,0.55)";
  for (let i = 1; i < ROWS; i++) {
    const y = (S / ROWS) * i + 7;
    for (let x = 10; x < S; x += 17) {
      ctx.beginPath();
      ctx.arc(x, y, 1.7, 0, Math.PI * 2);
      ctx.fill();
    }
  }

  // A couple of darker service hatches.
  for (let i = 0; i < 5; i++) {
    const x = Math.random() * (S - 90);
    const y = Math.random() * (S - 60);
    ctx.fillStyle = "rgba(96,96,96,0.5)";
    ctx.fillRect(x, y, 60 + Math.random() * 40, 34);
    ctx.strokeStyle = "rgba(30,30,30,0.8)";
    ctx.lineWidth = 2;
    ctx.strokeRect(x, y, 60 + Math.random() * 40, 34);
  }

  const tex = new THREE.CanvasTexture(cvs);
  tex.wrapS = tex.wrapT = THREE.RepeatWrapping;
  return tex;
}

/** Crinkled multi-layer insulation — random creases, no straight lines. */
function makeFoilTexture() {
  const S = 256;
  const [cvs, ctx] = makeCanvas(S, S);

  ctx.fillStyle = "#8a8a8a";
  ctx.fillRect(0, 0, S, S);

  for (let i = 0; i < 420; i++) {
    const x = Math.random() * S;
    const y = Math.random() * S;
    const len = 8 + Math.random() * 40;
    const a = Math.random() * Math.PI * 2;
    const v = 70 + Math.random() * 130;
    ctx.strokeStyle = `rgba(${v},${v},${v},0.35)`;
    ctx.lineWidth = 0.8 + Math.random() * 2.6;
    ctx.beginPath();
    ctx.moveTo(x, y);
    ctx.lineTo(x + Math.cos(a) * len, y + Math.sin(a) * len);
    ctx.stroke();
  }

  const tex = new THREE.CanvasTexture(cvs);
  tex.wrapS = tex.wrapT = THREE.RepeatWrapping;
  return tex;
}

/** Photovoltaic cells: dark blue wafers, silver busbars, visible gaps. */
function makeSolarTexture() {
  const S = 512;
  const [cvs, ctx] = makeCanvas(S, S);

  ctx.fillStyle = "#060d20";
  ctx.fillRect(0, 0, S, S);

  const COLS = 10;
  const ROWS = 6;
  const cw = S / COLS;
  const ch = S / ROWS;

  for (let r = 0; r < ROWS; r++) {
    for (let c = 0; c < COLS; c++) {
      const x = c * cw + 2.5;
      const y = r * ch + 2.5;
      const g = ctx.createLinearGradient(x, y, x + cw, y + ch);
      g.addColorStop(0, "#1b3f86");
      g.addColorStop(0.5, "#122b60");
      g.addColorStop(1, "#0d1f4a");
      ctx.fillStyle = g;
      ctx.fillRect(x, y, cw - 5, ch - 5);

      // Busbars across each wafer.
      ctx.strokeStyle = "rgba(190,206,236,0.34)";
      ctx.lineWidth = 1.2;
      for (let b = 1; b < 3; b++) {
        const bx = x + ((cw - 5) / 3) * b;
        ctx.beginPath();
        ctx.moveTo(bx, y);
        ctx.lineTo(bx, y + ch - 5);
        ctx.stroke();
      }
    }
  }

  const tex = new THREE.CanvasTexture(cvs);
  tex.colorSpace = THREE.SRGBColorSpace;
  return tex;
}

/** White radiator face with the coolant tubing showing through. */
function makeRadiatorTexture() {
  const S = 256;
  const [cvs, ctx] = makeCanvas(S, S);

  ctx.fillStyle = "#e9edf4";
  ctx.fillRect(0, 0, S, S);

  ctx.strokeStyle = "rgba(120,134,158,0.55)";
  ctx.lineWidth = 2;
  for (let x = 8; x < S; x += 13) {
    ctx.beginPath();
    ctx.moveTo(x, 0);
    ctx.lineTo(x, S);
    ctx.stroke();
  }

  ctx.strokeStyle = "rgba(80,94,118,0.7)";
  ctx.lineWidth = 3;
  ctx.strokeRect(3, 3, S - 6, S - 6);

  const tex = new THREE.CanvasTexture(cvs);
  tex.colorSpace = THREE.SRGBColorSpace;
  return tex;
}

/** Hull livery sleeve — callsign, hazard chevrons, a thin accent stripe. */
function makeDecalTexture() {
  const W = 1024;
  const H = 256;
  const [cvs, ctx] = makeCanvas(W, H);

  ctx.clearRect(0, 0, W, H);

  // Accent stripe wrapping the whole circumference.
  ctx.fillStyle = "rgba(37,99,235,0.85)";
  ctx.fillRect(0, H - 46, W, 16);
  ctx.fillStyle = "rgba(147,197,253,0.7)";
  ctx.fillRect(0, H - 24, W, 5);

  // Callsign.
  ctx.fillStyle = "rgba(233,240,255,0.92)";
  ctx.font = "bold 96px 'Space Grotesk', ui-sans-serif, sans-serif";
  ctx.textBaseline = "middle";
  ctx.letterSpacing = "14px";
  ctx.fillText("ADNAN", 62, H * 0.44);

  ctx.font = "500 34px 'DM Sans', ui-sans-serif, sans-serif";
  ctx.fillStyle = "rgba(147,197,253,0.75)";
  ctx.letterSpacing = "10px";
  ctx.fillText("EXPLORER-01", 66, H * 0.72);

  // Hazard chevrons on the opposite side of the hull.
  ctx.save();
  ctx.translate(W * 0.62, H * 0.3);
  for (let i = 0; i < 7; i++) {
    ctx.fillStyle = i % 2 ? "rgba(20,26,40,0.8)" : "rgba(226,179,58,0.8)";
    ctx.beginPath();
    ctx.moveTo(i * 26, 0);
    ctx.lineTo(i * 26 + 18, 0);
    ctx.lineTo(i * 26 + 2, 74);
    ctx.lineTo(i * 26 - 16, 74);
    ctx.closePath();
    ctx.fill();
  }
  ctx.restore();

  const tex = new THREE.CanvasTexture(cvs);
  tex.colorSpace = THREE.SRGBColorSpace;
  return tex;
}

const STAR_COLORS = [
  [1.0, 1.0, 1.0],
  [0.85, 0.92, 1.0],
  [0.75, 0.86, 1.0],
  [0.65, 0.79, 1.0],
  [0.72, 0.75, 1.0],
];

export default function SceneBackground({ phase = "landing", awake = false }) {
  const hostRef = useRef(null);
  const phaseRef = useRef(phase);
  const awakeRef = useRef(awake);
  // Set by the scene effect; lets prop changes repaint the single static
  // frame we draw for visitors who asked for reduced motion.
  const repaintRef = useRef(null);

  useEffect(() => {
    phaseRef.current = phase;
    awakeRef.current = awake;
    repaintRef.current?.();
  }, [phase, awake]);

  useEffect(() => {
    const host = hostRef.current;
    if (!host) return;

    let renderer;
    try {
      renderer = new THREE.WebGLRenderer({
        antialias: window.innerWidth > 768,
        alpha: true,
        powerPreference: "high-performance",
      });
    } catch {
      return; // No WebGL — the CSS backdrop stands on its own.
    }

    const lowPower =
      window.innerWidth < 768 ||
      (navigator.hardwareConcurrency || 8) <= 4 ||
      window.matchMedia("(pointer: coarse)").matches;

    const dpr = Math.min(window.devicePixelRatio || 1, 2);
    renderer.setPixelRatio(dpr);
    renderer.setSize(host.clientWidth, host.clientHeight);
    renderer.setClearColor(0x000000, 0);
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 1.15;
    host.appendChild(renderer.domElement);
    // Let CSS own the display size. The resize handler calls setSize with
    // updateStyle=false (it only resizes the drawing buffer), so without
    // this the canvas would keep its first-frame pixel dimensions forever
    // and the scene would render into a shrinking, letterboxed box.
    renderer.domElement.style.display = "block";
    renderer.domElement.style.width = "100%";
    renderer.domElement.style.height = "100%";

    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(
      55,
      host.clientWidth / host.clientHeight,
      0.1,
      220,
    );
    camera.position.set(0, 0, 10);
    const CAM_Z = 10;

    const geometries = [];
    const materials = [];
    const textures = [];

    const G = (g) => {
      geometries.push(g);
      return g;
    };
    const M = (m) => {
      materials.push(m);
      return m;
    };
    const T = (t) => {
      textures.push(t);
      return t;
    };

    /* ---------------- environment ---------------- */
    const pmrem = new THREE.PMREMGenerator(renderer);
    const envSrc = T(makeEnvTexture());
    const envRT = pmrem.fromEquirectangular(envSrc);
    scene.environment = envRT.texture;

    /* ---------------- starfield ---------------- */
    const STAR_COUNT = lowPower ? 500 : 1400;
    const starGeo = new THREE.BufferGeometry();
    const sPos = new Float32Array(STAR_COUNT * 3);
    const sCol = new Float32Array(STAR_COUNT * 3);
    const sSize = new Float32Array(STAR_COUNT);
    const sPhase = new Float32Array(STAR_COUNT);
    const sRate = new Float32Array(STAR_COUNT);

    for (let i = 0; i < STAR_COUNT; i++) {
      sPos[i * 3] = (Math.random() - 0.5) * 150;
      sPos[i * 3 + 1] = (Math.random() - 0.5) * 100;
      sPos[i * 3 + 2] = -5 - Math.random() * 92;

      const c = STAR_COLORS[(Math.random() * STAR_COLORS.length) | 0];
      sCol[i * 3] = c[0];
      sCol[i * 3 + 1] = c[1];
      sCol[i * 3 + 2] = c[2];

      sSize[i] =
        Math.random() < 0.06 ? 2.6 + Math.random() * 1.6 : 0.7 + Math.random() * 1.1;
      sPhase[i] = Math.random();
      sRate[i] = 0.6 + Math.random() * 0.9;
    }

    starGeo.setAttribute("position", new THREE.BufferAttribute(sPos, 3));
    starGeo.setAttribute("aColor", new THREE.BufferAttribute(sCol, 3));
    starGeo.setAttribute("aSize", new THREE.BufferAttribute(sSize, 1));
    starGeo.setAttribute("aPhase", new THREE.BufferAttribute(sPhase, 1));
    starGeo.setAttribute("aRate", new THREE.BufferAttribute(sRate, 1));
    G(starGeo);

    const starMat = M(
      new THREE.ShaderMaterial({
        uniforms: { uTime: { value: 0 }, uDpr: { value: dpr } },
        vertexShader: STAR_VERT,
        fragmentShader: STAR_FRAG,
        transparent: true,
        depthWrite: false,
        blending: THREE.AdditiveBlending,
      }),
    );

    const stars = new THREE.Points(starGeo, starMat);
    stars.frustumCulled = false;
    scene.add(stars);

    /* ---------------- nebula ---------------- */
    const nebulae = [];
    for (const spec of [
      { rgb: "56,110,240", x: -24, y: 10, z: -58, s: 78 },
      { rgb: "99,102,241", x: 26, y: -6, z: -66, s: 66 },
      { rgb: "37,99,235", x: 4, y: -20, z: -48, s: 58 },
    ]) {
      const mat = M(
        new THREE.SpriteMaterial({
          map: T(makeGlowTexture(spec.rgb)),
          transparent: true,
          depthWrite: false,
          blending: THREE.AdditiveBlending,
          opacity: 0.42,
        }),
      );
      const sprite = new THREE.Sprite(mat);
      sprite.position.set(spec.x, spec.y, spec.z);
      sprite.scale.set(spec.s, spec.s, 1);
      sprite.userData.base = { x: spec.x, y: spec.y };
      scene.add(sprite);
      nebulae.push(sprite);
    }

    /* ---------------- lighting ---------------- */
    scene.add(new THREE.AmbientLight(0x6b86c4, 0.5));

    const sun = new THREE.DirectionalLight(0xfff4e6, 3.6);
    sun.position.set(-5, 4, 6);
    scene.add(sun);

    const bounce = new THREE.DirectionalLight(0x3b82f6, 1.1);
    bounce.position.set(6, -3, 2);
    scene.add(bounce);

    const rim = new THREE.DirectionalLight(0x93c5fd, 1.8);
    rim.position.set(2, 3, -7);
    scene.add(rim);

    const engineLight = new THREE.PointLight(0x9ecbff, 0, 20, 2);
    scene.add(engineLight);

    /* ---------------- textures + materials ---------------- */
    const panelSrc = T(makePanelTexture());
    const foilSrc = T(makeFoilTexture());

    /** Independent repeat settings need independent texture objects. */
    const tiled = (src, rx, ry) => {
      const t = src.clone();
      t.needsUpdate = true;
      t.wrapS = t.wrapT = THREE.RepeatWrapping;
      t.repeat.set(rx, ry);
      return T(t);
    };

    const hullDetail = tiled(panelSrc, 4, 2.2);
    const partDetail = tiled(panelSrc, 2, 1);
    const foilDetail = tiled(foilSrc, 3, 1.4);

    const matHull = M(
      new THREE.MeshStandardMaterial({
        color: 0xdae0ea,
        metalness: 0.45,
        roughness: 0.78,
        roughnessMap: hullDetail,
        bumpMap: hullDetail,
        bumpScale: 0.05,
        envMapIntensity: 1.15,
      }),
    );
    const matHullSmall = M(
      new THREE.MeshStandardMaterial({
        color: 0xd2d8e3,
        metalness: 0.5,
        roughness: 0.76,
        roughnessMap: partDetail,
        bumpMap: partDetail,
        bumpScale: 0.035,
        envMapIntensity: 1.15,
      }),
    );
    const matPanel = M(
      new THREE.MeshStandardMaterial({
        color: 0x8d97a8,
        metalness: 0.8,
        roughness: 0.55,
        roughnessMap: partDetail,
        envMapIntensity: 1.25,
      }),
    );
    const matDark = M(
      new THREE.MeshStandardMaterial({
        color: 0x1e2634,
        metalness: 0.72,
        roughness: 0.44,
        envMapIntensity: 1,
      }),
    );
    const matFoil = M(
      new THREE.MeshStandardMaterial({
        color: 0xd0982f,
        metalness: 1,
        roughness: 0.42,
        roughnessMap: foilDetail,
        bumpMap: foilDetail,
        bumpScale: 0.045,
        envMapIntensity: 1.7,
      }),
    );
    const matNozzle = M(
      new THREE.MeshStandardMaterial({
        color: 0x51586a,
        metalness: 0.96,
        roughness: 0.26,
        side: THREE.DoubleSide,
        envMapIntensity: 1.4,
      }),
    );
    const matSoot = M(
      new THREE.MeshStandardMaterial({
        color: 0x14171f,
        metalness: 0.4,
        roughness: 0.85,
        side: THREE.DoubleSide,
      }),
    );
    // Lit crew windows — the ship should feel crewed even while parked.
    const matGlass = M(
      new THREE.MeshStandardMaterial({
        color: 0x08142c,
        metalness: 0.9,
        roughness: 0.05,
        emissive: 0x2f63c8,
        emissiveIntensity: 0.85,
        envMapIntensity: 1.8,
      }),
    );
    const matSolar = M(
      new THREE.MeshStandardMaterial({
        map: T(makeSolarTexture()),
        color: 0xffffff,
        metalness: 0.86,
        roughness: 0.22,
        envMapIntensity: 1.35,
      }),
    );
    const matRadiator = M(
      new THREE.MeshStandardMaterial({
        map: T(makeRadiatorTexture()),
        metalness: 0.25,
        roughness: 0.62,
        side: THREE.DoubleSide,
        envMapIntensity: 0.9,
      }),
    );
    const matDecal = M(
      new THREE.MeshStandardMaterial({
        map: T(makeDecalTexture()),
        transparent: true,
        metalness: 0.3,
        roughness: 0.55,
        depthWrite: false,
        envMapIntensity: 0.8,
      }),
    );
    const matHandrail = M(
      new THREE.MeshStandardMaterial({
        color: 0xe2b33a,
        metalness: 0.5,
        roughness: 0.5,
      }),
    );

    const matSuit = M(
      new THREE.MeshStandardMaterial({
        color: 0xeef1f7,
        metalness: 0.04,
        roughness: 0.82,
        envMapIntensity: 0.85,
      }),
    );
    const matSuitSoft = M(
      new THREE.MeshStandardMaterial({
        color: 0xdfe4ee,
        metalness: 0.03,
        roughness: 0.92,
        envMapIntensity: 0.7,
      }),
    );
    const matVisor = M(
      new THREE.MeshStandardMaterial({
        color: 0xffb955,
        metalness: 1,
        roughness: 0.07,
        envMapIntensity: 2.3,
      }),
    );
    const matJoint = M(
      new THREE.MeshStandardMaterial({
        color: 0x9aa3b2,
        metalness: 0.88,
        roughness: 0.28,
        envMapIntensity: 1.25,
      }),
    );
    const matRed = M(
      new THREE.MeshStandardMaterial({ color: 0xc0392b, metalness: 0.1, roughness: 0.65 }),
    );
    const matBlue = M(
      new THREE.MeshStandardMaterial({ color: 0x2563eb, metalness: 0.2, roughness: 0.5 }),
    );

    // Self-lit bits: kept out of tone mapping so they stay punchy.
    const matLamp = M(
      new THREE.MeshBasicMaterial({ color: 0xdcecff, toneMapped: false }),
    );
    const matNavRed = M(
      new THREE.MeshBasicMaterial({
        color: 0xff4d4d,
        toneMapped: false,
        transparent: true,
      }),
    );
    const matNavGreen = M(
      new THREE.MeshBasicMaterial({
        color: 0x4dff88,
        toneMapped: false,
        transparent: true,
      }),
    );
    const matThroat = M(
      new THREE.MeshBasicMaterial({
        color: 0xffd7a8,
        toneMapped: false,
        transparent: true,
        side: THREE.DoubleSide,
        opacity: 0,
      }),
    );

    /* ---------------- spacecraft ---------------- */
    // Built nose-up along +Y so the launch is a straight climb.
    const ship = new THREE.Group();

    // --- main propellant hull ---
    const hull = new THREE.Mesh(
      G(new THREE.CylinderGeometry(0.52, 0.52, 2.3, 40, 1)),
      matHull,
    );
    hull.position.y = -0.55;
    ship.add(hull);

    // Structural ribs — one geometry, several instances.
    const ribGeo = G(new THREE.CylinderGeometry(0.545, 0.545, 0.055, 40));
    for (const y of [-1.55, -1.1, -0.62, -0.16, 0.32]) {
      const rib = new THREE.Mesh(ribGeo, matPanel);
      rib.position.y = y;
      ship.add(rib);
    }

    // Gold MLI insulation blanket over the cryogenic section.
    const foilBand = new THREE.Mesh(
      G(new THREE.CylinderGeometry(0.558, 0.558, 0.44, 40)),
      matFoil,
    );
    foilBand.position.y = -0.88;
    ship.add(foilBand);

    // Livery sleeve, floated just off the skin to dodge z-fighting.
    const decal = new THREE.Mesh(
      G(new THREE.CylinderGeometry(0.527, 0.527, 0.62, 40, 1, true)),
      matDecal,
    );
    decal.position.y = 0.02;
    ship.add(decal);

    // --- laboratory module ---
    const lab = new THREE.Mesh(G(new THREE.CylinderGeometry(0.63, 0.63, 0.84, 40)), matHull);
    lab.position.y = 1.12;
    ship.add(lab);

    const labRingGeo = G(new THREE.CylinderGeometry(0.66, 0.66, 0.07, 40));
    for (const y of [0.78, 1.12, 1.46]) {
      const r = new THREE.Mesh(labRingGeo, matPanel);
      r.position.y = y;
      ship.add(r);
    }

    // Yellow EVA handrails, straight off the ISS playbook.
    const railGeo = G(new THREE.TorusGeometry(0.685, 0.016, 8, 20, 1.5));
    for (const [y, rot] of [
      [0.95, 0.2],
      [1.3, 2.4],
    ]) {
      const rail = new THREE.Mesh(railGeo, matHandrail);
      rail.rotation.x = Math.PI / 2;
      rail.rotation.z = rot;
      rail.position.y = y;
      ship.add(rail);
    }

    // --- crew module ---
    const crewMod = new THREE.Mesh(
      G(new THREE.CylinderGeometry(0.5, 0.6, 0.64, 36)),
      matHullSmall,
    );
    crewMod.position.y = 1.85;
    ship.add(crewMod);

    const dome = new THREE.Mesh(
      G(new THREE.SphereGeometry(0.5, 36, 20, 0, Math.PI * 2, 0, Math.PI / 2)),
      matHullSmall,
    );
    dome.position.y = 2.16;
    ship.add(dome);

    // Docking collar + petals.
    const collar = new THREE.Mesh(G(new THREE.TorusGeometry(0.2, 0.045, 12, 28)), matPanel);
    collar.rotation.x = Math.PI / 2;
    collar.position.y = 2.62;
    ship.add(collar);

    const petalGeo = G(new THREE.BoxGeometry(0.075, 0.02, 0.11));
    for (let i = 0; i < 4; i++) {
      const a = (i / 4) * Math.PI * 2;
      const petal = new THREE.Mesh(petalGeo, matPanel);
      petal.position.set(Math.cos(a) * 0.2, 2.68, Math.sin(a) * 0.2);
      petal.rotation.y = -a;
      ship.add(petal);
    }

    // Comms spire on the very top.
    const spire = new THREE.Mesh(
      G(new THREE.CylinderGeometry(0.012, 0.02, 0.42, 8)),
      matPanel,
    );
    spire.position.y = 2.88;
    ship.add(spire);

    // Viewports around the crew module.
    const portGeo = G(new THREE.CylinderGeometry(0.085, 0.085, 0.06, 18));
    const portRimGeo = G(new THREE.TorusGeometry(0.092, 0.018, 8, 20));
    for (let i = 0; i < 4; i++) {
      const a = (i / 4) * Math.PI * 2 + 0.4;
      const px = Math.cos(a) * 0.53;
      const pz = Math.sin(a) * 0.53;

      const port = new THREE.Mesh(portGeo, matGlass);
      port.position.set(px, 1.89, pz);
      port.rotation.z = Math.PI / 2;
      port.rotation.y = -a;
      ship.add(port);

      const rim2 = new THREE.Mesh(portRimGeo, matPanel);
      rim2.position.set(px, 1.89, pz);
      rim2.rotation.y = -a + Math.PI / 2;
      ship.add(rim2);
    }

    // --- photovoltaic wings ---
    const wingGeo = G(new THREE.BoxGeometry(1.75, 0.018, 0.9));
    const wingBackGeo = G(new THREE.BoxGeometry(1.79, 0.03, 0.94));
    const yokeGeo = G(new THREE.CylinderGeometry(0.045, 0.045, 0.5, 12));
    const spineGeo = G(new THREE.BoxGeometry(1.79, 0.05, 0.06));

    for (const side of [-1, 1]) {
      const yoke = new THREE.Mesh(yokeGeo, matPanel);
      yoke.rotation.z = Math.PI / 2;
      yoke.position.set(side * 0.75, 0.22, 0);
      ship.add(yoke);

      const wing = new THREE.Group();
      wing.position.set(side * 1.75, 0.22, 0);
      wing.rotation.x = -0.22;

      const back = new THREE.Mesh(wingBackGeo, matDark);
      back.position.y = -0.02;
      wing.add(back);

      const cells = new THREE.Mesh(wingGeo, matSolar);
      wing.add(cells);

      const spine = new THREE.Mesh(spineGeo, matPanel);
      spine.position.y = 0.02;
      wing.add(spine);

      ship.add(wing);
    }

    // --- radiators ---
    const radGeo = G(new THREE.PlaneGeometry(1.05, 0.62));
    for (const side of [-1, 1]) {
      const arm = new THREE.Mesh(
        G(new THREE.CylinderGeometry(0.032, 0.032, 0.3, 10)),
        matPanel,
      );
      arm.rotation.z = Math.PI / 2;
      arm.position.set(side * 0.66, -1.15, 0);
      ship.add(arm);

      const rad = new THREE.Mesh(radGeo, matRadiator);
      rad.position.set(side * 1.32, -1.15, 0);
      rad.rotation.y = Math.PI / 2;
      rad.rotation.z = side * 0.1;
      ship.add(rad);
    }

    // --- high-gain antenna ---
    const dishPts = [];
    for (let i = 0; i <= 12; i++) {
      const t = i / 12;
      dishPts.push(new THREE.Vector2(t * 0.3, t * t * 0.22));
    }
    const dish = new THREE.Mesh(G(new THREE.LatheGeometry(dishPts, 28)), matPanel);
    dish.position.set(0.7, 1.62, 0.22);
    dish.rotation.z = -0.95;
    dish.rotation.x = -0.35;
    ship.add(dish);

    const boom = new THREE.Mesh(
      G(new THREE.CylinderGeometry(0.024, 0.024, 0.34, 8)),
      matDark,
    );
    boom.rotation.z = Math.PI / 2.4;
    boom.position.set(0.48, 1.56, 0.13);
    ship.add(boom);

    // --- RCS thruster quads ---
    const rcsGeo = G(new THREE.CylinderGeometry(0.038, 0.018, 0.09, 10, 1, true));
    const rcsBaseGeo = G(new THREE.BoxGeometry(0.12, 0.1, 0.09));
    for (const y of [1.62, -1.42]) {
      for (let i = 0; i < 4; i++) {
        const a = (i / 4) * Math.PI * 2 + Math.PI / 4;
        const r = y > 0 ? 0.6 : 0.52;

        const base = new THREE.Mesh(rcsBaseGeo, matDark);
        base.position.set(Math.cos(a) * r, y, Math.sin(a) * r);
        base.rotation.y = -a;
        ship.add(base);

        const nz = new THREE.Mesh(rcsGeo, matNozzle);
        nz.position.set(Math.cos(a) * (r + 0.06), y, Math.sin(a) * (r + 0.06));
        nz.rotation.z = -Math.PI / 2;
        nz.rotation.y = -a;
        ship.add(nz);
      }
    }

    // --- navigation strobes: red to port, green to starboard ---
    const navGeo = G(new THREE.SphereGeometry(0.035, 10, 8));
    const navLights = [];
    for (const [side, mat] of [
      [-1, matNavRed],
      [1, matNavGreen],
    ]) {
      const lamp = new THREE.Mesh(navGeo, mat);
      lamp.position.set(side * 0.66, 1.12, 0.18);
      ship.add(lamp);
      navLights.push(lamp);
    }

    // --- thrust structure ---
    const skirt = new THREE.Mesh(
      G(new THREE.CylinderGeometry(0.5, 0.44, 0.34, 28)),
      matDark,
    );
    skirt.position.y = -1.86;
    ship.add(skirt);

    // Engine bells — lathe-turned so the nozzle flare is a real curve.
    const bellPts = [];
    for (let i = 0; i <= 16; i++) {
      const t = i / 16;
      bellPts.push(new THREE.Vector2(0.075 + Math.pow(t, 0.62) * 0.19, -t * 0.48));
    }
    const bellGeo = G(new THREE.LatheGeometry(bellPts, 26));
    const bellLinerGeo = G(new THREE.LatheGeometry(bellPts, 26));
    bellLinerGeo.scale(0.93, 0.96, 0.93);

    // Regenerative-cooling hoops around each bell.
    const hoopGeos = [];
    for (let i = 1; i <= 3; i++) {
      const t = i / 4;
      const r = 0.075 + Math.pow(t, 0.62) * 0.19;
      hoopGeos.push({ geo: G(new THREE.TorusGeometry(r, 0.011, 6, 22)), y: -t * 0.48 });
    }

    const throatGeo = G(new THREE.CircleGeometry(0.072, 20));

    const bells = [];
    const throats = [];
    for (let i = 0; i < 3; i++) {
      const a = (i / 3) * Math.PI * 2 + Math.PI / 6;
      const bell = new THREE.Mesh(bellGeo, matNozzle);
      bell.position.set(Math.cos(a) * 0.23, -2.04, Math.sin(a) * 0.23);
      ship.add(bell);
      bells.push(bell);

      const liner = new THREE.Mesh(bellLinerGeo, matSoot);
      liner.position.copy(bell.position);
      ship.add(liner);

      for (const h of hoopGeos) {
        const hoop = new THREE.Mesh(h.geo, matPanel);
        hoop.rotation.x = Math.PI / 2;
        hoop.position.set(bell.position.x, bell.position.y + h.y, bell.position.z);
        ship.add(hoop);
      }

      const throat = new THREE.Mesh(throatGeo, matThroat);
      throat.rotation.x = Math.PI / 2;
      throat.position.set(bell.position.x, -2.06, bell.position.z);
      ship.add(throat);
      throats.push(throat);
    }

    ship.scale.setScalar(0.46);

    // Measured on the hardware only — the plumes and the lens flare below
    // would otherwise inflate the box and push the parked pose off-screen.
    // Everything the layout does is expressed against these two numbers, so
    // reshaping the craft never desyncs the framing.
    ship.updateMatrixWorld(true);
    const shipBox = new THREE.Box3().setFromObject(ship);
    const SHIP_BOTTOM = shipBox.min.y;
    const SHIP_H = shipBox.max.y - shipBox.min.y;
    // Wing tip to centreline — the orbit has to stay this far off the edges
    // or the solar arrays clip out of frame on narrow viewports.
    const SHIP_HALF_W = Math.max(-shipBox.min.x, shipBox.max.x);

    // Exhaust plumes, one per bell.
    const plumeGeo = G(new THREE.ConeGeometry(0.15, 0.9, 18, 1, true));
    plumeGeo.rotateX(Math.PI);
    plumeGeo.translate(0, -0.45, 0);
    const matPlume = M(
      new THREE.MeshBasicMaterial({
        color: 0xbcd8ff,
        transparent: true,
        opacity: 0,
        blending: THREE.AdditiveBlending,
        depthWrite: false,
        side: THREE.DoubleSide,
        toneMapped: false, // keep the plume hot; ACES would grey it out
      }),
    );
    const plumes = [];
    for (const bell of bells) {
      const plume = new THREE.Mesh(plumeGeo, matPlume);
      plume.position.set(bell.position.x, -2.5, bell.position.z);
      ship.add(plume);
      plumes.push(plume);
    }

    // Soft additive bloom sitting over the nozzles.
    const matFlare = M(
      new THREE.SpriteMaterial({
        map: T(makeGlowTexture("170,205,255")),
        transparent: true,
        depthWrite: false,
        blending: THREE.AdditiveBlending,
        opacity: 0,
      }),
    );
    const flare = new THREE.Sprite(matFlare);
    flare.position.set(0, -2.5, 0);
    flare.scale.setScalar(2.4);
    ship.add(flare);

    /* ---------------- EVA astronaut ---------------- */
    const astronaut = new THREE.Group();

    const helmet = new THREE.Mesh(G(new THREE.SphereGeometry(0.16, 28, 22)), matSuit);
    helmet.position.y = 0.4;
    astronaut.add(helmet);

    // Gold faceplate: a patch of sphere centred on +Z (phi = PI/2 faces +Z)
    const visor = new THREE.Mesh(
      G(new THREE.SphereGeometry(0.164, 28, 22, Math.PI / 2 - 0.95, 1.9, 0.55, 1.45)),
      matVisor,
    );
    visor.position.y = 0.4;
    astronaut.add(visor);

    // Sunshade brim above the visor.
    const brim = new THREE.Mesh(
      G(new THREE.SphereGeometry(0.172, 28, 12, Math.PI / 2 - 1.0, 2.0, 0.38, 0.3)),
      matSuit,
    );
    brim.position.y = 0.4;
    astronaut.add(brim);

    // Helmet work lamps — the detail that sells "this is an EVA suit".
    const lampBodyGeo = G(new THREE.BoxGeometry(0.05, 0.035, 0.04));
    const lampLensGeo = G(new THREE.CircleGeometry(0.017, 12));
    for (const side of [-1, 1]) {
      const body = new THREE.Mesh(lampBodyGeo, matDark);
      body.position.set(side * 0.145, 0.5, 0.06);
      body.rotation.z = side * 0.3;
      astronaut.add(body);

      const lens = new THREE.Mesh(lampLensGeo, matLamp);
      lens.position.set(side * 0.145, 0.492, 0.085);
      astronaut.add(lens);
    }

    const neckRing = new THREE.Mesh(G(new THREE.TorusGeometry(0.117, 0.026, 10, 24)), matJoint);
    neckRing.rotation.x = Math.PI / 2;
    neckRing.position.y = 0.275;
    astronaut.add(neckRing);

    // Hard upper torso, softer lower torso.
    const hut = new THREE.Mesh(G(new THREE.CylinderGeometry(0.175, 0.165, 0.24, 22)), matSuit);
    hut.position.y = 0.14;
    astronaut.add(hut);

    const hutCap = new THREE.Mesh(
      G(new THREE.SphereGeometry(0.175, 22, 12, 0, Math.PI * 2, 0, Math.PI / 2)),
      matSuit,
    );
    hutCap.position.y = 0.25;
    astronaut.add(hutCap);

    const waist = new THREE.Mesh(G(new THREE.CapsuleGeometry(0.15, 0.1, 8, 20)), matSuitSoft);
    waist.position.y = -0.02;
    astronaut.add(waist);

    const waistRing = new THREE.Mesh(G(new THREE.TorusGeometry(0.152, 0.022, 8, 22)), matJoint);
    waistRing.rotation.x = Math.PI / 2;
    waistRing.position.y = 0.02;
    astronaut.add(waistRing);

    // PLSS life-support pack with its trim and antenna.
    const plss = new THREE.Mesh(G(new THREE.BoxGeometry(0.3, 0.36, 0.15)), matSuit);
    plss.position.set(0, 0.13, -0.2);
    astronaut.add(plss);

    const plssTrim = new THREE.Mesh(G(new THREE.BoxGeometry(0.32, 0.035, 0.17)), matJoint);
    plssTrim.position.set(0, 0.3, -0.2);
    astronaut.add(plssTrim);

    const plssVent = new THREE.Mesh(G(new THREE.BoxGeometry(0.2, 0.08, 0.12)), matDark);
    plssVent.position.set(0, -0.03, -0.22);
    astronaut.add(plssVent);

    const plssAnt = new THREE.Mesh(
      G(new THREE.CylinderGeometry(0.006, 0.006, 0.18, 6)),
      matPanel,
    );
    plssAnt.position.set(0.11, 0.4, -0.2);
    plssAnt.rotation.z = -0.2;
    astronaut.add(plssAnt);

    // Chest-mounted display and control module.
    const chest = new THREE.Mesh(G(new THREE.BoxGeometry(0.2, 0.13, 0.07)), matDark);
    chest.position.set(0, 0.16, 0.155);
    astronaut.add(chest);

    const chestTab = new THREE.Mesh(G(new THREE.BoxGeometry(0.07, 0.035, 0.03)), matBlue);
    chestTab.position.set(-0.045, 0.16, 0.19);
    astronaut.add(chestTab);

    const chestLed = new THREE.Mesh(G(new THREE.CircleGeometry(0.012, 10)), matLamp);
    chestLed.position.set(0.05, 0.18, 0.192);
    astronaut.add(chestLed);

    // Oxygen hoses looping from the pack to the chest.
    const hoseGeo = G(new THREE.TorusGeometry(0.09, 0.013, 8, 20, Math.PI));
    for (const side of [-1, 1]) {
      const hose = new THREE.Mesh(hoseGeo, matSuitSoft);
      hose.position.set(side * 0.09, 0.21, -0.02);
      hose.rotation.y = Math.PI / 2;
      hose.rotation.z = side * 0.4;
      astronaut.add(hose);
    }

    const shoulderGeo = G(new THREE.SphereGeometry(0.075, 18, 14));
    const upperArmGeo = G(new THREE.CapsuleGeometry(0.058, 0.15, 6, 16));
    const foreArmGeo = G(new THREE.CapsuleGeometry(0.053, 0.14, 6, 16));
    const jointGeo = G(new THREE.TorusGeometry(0.058, 0.017, 8, 18));
    const gloveGeo = G(new THREE.SphereGeometry(0.062, 16, 14));
    const cuffGeo = G(new THREE.TorusGeometry(0.055, 0.015, 8, 18));

    const arms = [];
    for (const side of [-1, 1]) {
      const arm = new THREE.Group();

      arm.add(new THREE.Mesh(shoulderGeo, matJoint));

      const upper = new THREE.Mesh(upperArmGeo, matSuit);
      upper.position.y = -0.11;
      arm.add(upper);

      const elbow = new THREE.Mesh(jointGeo, matJoint);
      elbow.rotation.x = Math.PI / 2;
      elbow.position.y = -0.2;
      arm.add(elbow);

      const fore = new THREE.Mesh(foreArmGeo, matSuit);
      fore.position.set(0, -0.29, 0.03);
      fore.rotation.x = -0.32;
      arm.add(fore);

      const cuff = new THREE.Mesh(cuffGeo, matJoint);
      cuff.rotation.x = Math.PI / 2 - 0.32;
      cuff.position.set(0, -0.345, 0.055);
      arm.add(cuff);

      const glove = new THREE.Mesh(gloveGeo, matDark);
      glove.position.set(0, -0.385, 0.09);
      arm.add(glove);

      // Identification stripe, NASA-style.
      const stripe = new THREE.Mesh(
        G(new THREE.TorusGeometry(0.061, 0.014, 8, 18)),
        side < 0 ? matRed : matBlue,
      );
      stripe.rotation.x = Math.PI / 2;
      stripe.position.y = -0.05;
      arm.add(stripe);

      arm.position.set(side * 0.19, 0.21, 0);
      arm.rotation.z = side * 0.42;
      astronaut.add(arm);
      arms.push(arm);
    }

    const hips = new THREE.Mesh(G(new THREE.CapsuleGeometry(0.13, 0.06, 6, 18)), matSuitSoft);
    hips.position.y = -0.12;
    astronaut.add(hips);

    const thighGeo = G(new THREE.CapsuleGeometry(0.068, 0.16, 6, 16));
    const shinGeo = G(new THREE.CapsuleGeometry(0.06, 0.15, 6, 16));
    const kneeGeo = G(new THREE.TorusGeometry(0.066, 0.017, 8, 18));
    const bootGeo = G(new THREE.BoxGeometry(0.11, 0.07, 0.17));
    const bootSoleGeo = G(new THREE.BoxGeometry(0.115, 0.02, 0.175));

    const legs = [];
    for (const side of [-1, 1]) {
      const leg = new THREE.Group();

      const thigh = new THREE.Mesh(thighGeo, matSuit);
      thigh.position.y = -0.11;
      leg.add(thigh);

      const knee = new THREE.Mesh(kneeGeo, matJoint);
      knee.rotation.x = Math.PI / 2;
      knee.position.y = -0.21;
      leg.add(knee);

      const shin = new THREE.Mesh(shinGeo, matSuit);
      shin.position.set(0, -0.3, 0.04);
      shin.rotation.x = -0.28;
      leg.add(shin);

      const boot = new THREE.Mesh(bootGeo, matSuit);
      boot.position.set(0, -0.39, 0.11);
      boot.rotation.x = -0.2;
      leg.add(boot);

      const sole = new THREE.Mesh(bootSoleGeo, matDark);
      sole.position.set(0, -0.425, 0.115);
      sole.rotation.x = -0.2;
      leg.add(sole);

      const stripe = new THREE.Mesh(
        G(new THREE.TorusGeometry(0.069, 0.013, 8, 18)),
        side < 0 ? matRed : matBlue,
      );
      stripe.rotation.x = Math.PI / 2;
      stripe.position.y = -0.02;
      leg.add(stripe);

      leg.position.set(side * 0.095, -0.18, 0);
      leg.rotation.z = side * 0.13;
      leg.rotation.x = 0.22;
      astronaut.add(leg);
      legs.push(leg);
    }

    astronaut.scale.setScalar(0.95);

    const crew = new THREE.Group();
    crew.add(ship);
    crew.add(astronaut);
    scene.add(crew);

    /* ---------------- safety tether ---------------- */
    // Physically anchored: one end on the ship's airlock, the other on the
    // suit's waist ring, with a lazy bow because there is no gravity to sag.
    const TETHER_SEGS = 28;
    const SHIP_ANCHOR = new THREE.Vector3(0, 0.55, 0.62);
    const SUIT_ANCHOR = new THREE.Vector3(0, -0.06, 0.14);

    const tetherGeo = G(new THREE.BufferGeometry());
    const tetherPos = new Float32Array((TETHER_SEGS + 1) * 3);
    tetherGeo.setAttribute("position", new THREE.BufferAttribute(tetherPos, 3));
    const tetherMat = M(
      new THREE.LineBasicMaterial({
        color: 0xd7e2f5,
        transparent: true,
        opacity: 0.5,
      }),
    );
    const tether = new THREE.Line(tetherGeo, tetherMat);
    tether.frustumCulled = false;
    crew.add(tether);

    const anchorA = new THREE.Vector3();
    const anchorB = new THREE.Vector3();
    const tetherMid = new THREE.Vector3();
    const tetherDir = new THREE.Vector3();
    const tetherPerp = new THREE.Vector3();

    /* ---------------- exhaust trail ---------------- */
    const TRAIL_MAX = lowPower ? 80 : 170;
    const trailGeo = G(new THREE.BufferGeometry());
    const tPos = new Float32Array(TRAIL_MAX * 3);
    const tLife = new Float32Array(TRAIL_MAX);
    trailGeo.setAttribute("position", new THREE.BufferAttribute(tPos, 3));
    trailGeo.setAttribute("aLife", new THREE.BufferAttribute(tLife, 1));
    trailGeo.setDrawRange(0, 0);

    const trailMat = M(
      new THREE.ShaderMaterial({
        uniforms: { uDpr: { value: dpr } },
        vertexShader: TRAIL_VERT,
        fragmentShader: TRAIL_FRAG,
        transparent: true,
        depthWrite: false,
        blending: THREE.AdditiveBlending,
      }),
    );

    const trail = new THREE.Points(trailGeo, trailMat);
    trail.frustumCulled = false;
    scene.add(trail);

    const trailPts = [];
    const nozzlePos = new THREE.Vector3();

    /* ---------------- layout ---------------- */
    const layout = {
      parkX: 0,
      parkY: -2,
      astroPark: new THREE.Vector3(),
      cx: 0,
      cy: 0.25,
      rx: 3,
      ry: 1.3,
      astroR: 1.4,
    };

    const layoutCrew = () => {
      const w = host.clientWidth;
      const h = host.clientHeight || 1;
      const aspect = w / h;
      const portrait = aspect < 1.05;

      const crewZ = portrait ? 2.2 : 3.2;
      crew.position.set(0, 0, crewZ);

      // Scale the craft to a fixed share of viewport height so the framing
      // is identical on a laptop and an ultrawide.
      const halfHWorld =
        Math.tan((camera.fov * Math.PI) / 360) * (CAM_Z - crewZ);
      const frac = portrait ? 0.3 : 0.42;
      const S = THREE.MathUtils.clamp((halfHWorld * 2 * frac) / SHIP_H, 0.4, 2.4);
      crew.scale.setScalar(S);

      // Everything below is in crew-local units.
      const halfH = halfHWorld / S;
      const halfW = halfH * aspect;

      layout.parkX = 0;
      layout.parkY = -halfH - 0.28 - SHIP_BOTTOM; // tail just off the bottom
      layout.cx = 0;
      layout.cy = portrait ? 0.1 : 0.25;
      layout.rx = Math.max(
        0.35,
        Math.min(halfW * 0.5, halfW - SHIP_HALF_W - 0.1, 4.6),
      );
      layout.ry = Math.max(
        0.5,
        Math.min(halfH * 0.4, halfH - (SHIP_H + SHIP_BOTTOM) - 0.15),
      );
      layout.astroR = portrait ? 1.15 : 1.45;

      layout.astroPark.set(
        layout.parkX - (portrait ? 1.0 : 1.35),
        layout.parkY + SHIP_H * 0.42,
        0.85,
      );
    };
    layoutCrew();

    /* ---------------- input ---------------- */
    const pointer = { x: 0, y: 0 };
    const camAt = { x: 0, y: 0 };

    const onPointerMove = (e) => {
      pointer.x = (e.clientX / window.innerWidth) * 2 - 1;
      pointer.y = -((e.clientY / window.innerHeight) * 2 - 1);
    };
    const onPointerLeave = () => {
      pointer.x = 0;
      pointer.y = 0;
    };

    if (!lowPower) {
      window.addEventListener("pointermove", onPointerMove, { passive: true });
      window.addEventListener("pointerleave", onPointerLeave, { passive: true });
    }

    const motionQuery = window.matchMedia("(prefers-reduced-motion: reduce)");
    let noMotion = motionQuery.matches;

    /* ---------------- animation state ---------------- */
    let elapsed = 0;
    let starClock = 0;
    let starSpeed = 0.12;
    let wakeT = 0; // 0 parked → 1 orbiting
    let orbitA = 0; // ship angle around the CTA
    let astroA = 0.6; // astronaut angle around the ship
    let shipLean = 0; // accumulated bank, unwrapped
    let shipSpin = 0; // accumulated roll
    let astroYaw = 0;
    let astroTumble = 0;
    let throttle = 0; // 0 cold → 1 full burn
    let launchT = 0;
    let shake = 0;

    const resetCrew = () => {
      wakeT = 0;
      orbitA = 0;
      astroA = 0.6;
      shipLean = 0;
      shipSpin = 0;
      astroTumble = 0;
      throttle = 0;
      launchT = 0;
      shake = 0;
      trailPts.length = 0;
      trailGeo.setDrawRange(0, 0);
      layoutCrew();
    };

    /* ---------------- per-frame crew pose ---------------- */
    const updateCrew = (dt) => {
      const ph = phaseRef.current;
      const launching = ph === "launching";

      if (ph === "app") {
        crew.visible = false;
        engineLight.intensity = 0;
        throttle = 0;
        // Retire the exhaust ribbon too, or it hangs in frame as a frozen
        // comet tail on every page after the launch.
        if (trailPts.length) trailPts.splice(-6);
        return;
      }
      crew.visible = true;

      /* --- wake: the cursor is what lights the thrusters --- */
      const wantWake = launching || awakeRef.current;
      wakeT = clamp01(wakeT + (dt / WAKE_DUR) * (wantWake ? 1 : -1));
      const wake = easeInOut(wakeT);

      /* --- launch timeline --- */
      let boost = 1;
      let escape = 0;
      let climb = 0;
      let tighten = 1;

      if (launching) {
        launchT += dt;
        const t = launchT;
        // 0.0–0.5 spool up · 0.5–1.5 tight fast loop · 1.45+ break out
        escape = smoothstep(1.45, 1.95, t);
        boost = (1 + 5.2 * smoothstep(0.1, 1.0, t)) * (1 - escape);
        tighten = 1 - 0.32 * Math.sin(clamp01(t / 1.6) * Math.PI);
        climb = Math.pow(smoothstep(1.5, 2.55, t), 2) * 52;
        shake = 0.06 * smoothstep(0.05, 0.5, t) * (1 - smoothstep(1.9, 2.4, t));
      } else {
        shake = 0;
      }

      orbitA += dt * ORBIT_W * wake * boost;
      astroA += dt * ASTRO_W * wake * (launching ? 2.4 : 1);

      /* --- ship placement --- */
      const ox = layout.cx + layout.rx * Math.sin(orbitA) * tighten;
      const oy = layout.cy - layout.ry * Math.cos(orbitA) * tighten;

      ship.position.x = layout.parkX + (ox - layout.parkX) * wake;
      ship.position.y = layout.parkY + (oy - layout.parkY) * wake + climb;
      ship.position.z = Math.sin(orbitA * 1.3) * 0.45 * wake;

      // Bank into the direction of travel. `shipLean` is accumulated with a
      // shortest-path approach so it never snaps when atan2 wraps.
      const leanTarget = -Math.atan2(
        layout.rx * Math.cos(orbitA),
        layout.ry * Math.sin(orbitA),
      );
      shipLean = approachAngle(shipLean, leanTarget, Math.min(1, dt * 5));
      ship.rotation.z = shipLean * LEAN * wake * (1 - escape);

      const rollRate =
        0.18 * wake + (launching ? 8.5 * smoothstep(0.35, 1.1, launchT) : 0);
      shipSpin += dt * rollRate;
      ship.rotation.y = 0.55 + shipSpin;
      ship.rotation.x = 0.05 + Math.sin(elapsed * 0.3) * 0.05 * wake;

      /* --- astronaut: circles the ship on the tether --- */
      const R = layout.astroR * (launching ? 1 - 0.55 * smoothstep(0, 1.2, launchT) : 1);
      const ax = ship.position.x + Math.cos(astroA) * R;
      const ay = ship.position.y + Math.sin(astroA) * R * 0.55 + 0.1;
      const az = ship.position.z + Math.sin(astroA) * R * 0.8;

      // No `climb` term here: the target is already relative to the ship,
      // which is carrying the climb — adding it again doubles it and the
      // astronaut outruns their own rocket.
      const p = layout.astroPark;
      astronaut.position.set(
        p.x + (ax - p.x) * wake,
        p.y + (ay - p.y) * wake,
        p.z + (az - p.z) * wake,
      );

      // Keep facing the craft — that is where the work is.
      const yawTarget = Math.atan2(
        ship.position.x - astronaut.position.x,
        ship.position.z - astronaut.position.z,
      );
      astroYaw = approachAngle(astroYaw, yawTarget, Math.min(1, dt * 2.2));
      astroTumble += dt * (launching ? 2.6 : 0);
      astronaut.rotation.y = astroYaw;
      astronaut.rotation.z =
        0.1 + Math.sin(elapsed * 0.45) * 0.2 * wake + astroTumble;
      astronaut.rotation.x = -0.08 + Math.sin(elapsed * 0.37) * 0.14 * wake;

      arms[0].rotation.z = -0.42 + Math.sin(elapsed * 0.8) * 0.16 * wake;
      arms[1].rotation.z = 0.42 - Math.sin(elapsed * 0.8 + 0.7) * 0.16 * wake;
      legs[0].rotation.x = 0.22 + Math.sin(elapsed * 0.55) * 0.12 * wake;
      legs[1].rotation.x = 0.22 + Math.sin(elapsed * 0.55 + 1.1) * 0.12 * wake;

      /* --- tether --- */
      anchorA
        .copy(SHIP_ANCHOR)
        .multiplyScalar(ship.scale.x)
        .applyQuaternion(ship.quaternion)
        .add(ship.position);
      anchorB
        .copy(SUIT_ANCHOR)
        .multiplyScalar(astronaut.scale.x)
        .applyQuaternion(astronaut.quaternion)
        .add(astronaut.position);

      tetherDir.subVectors(anchorB, anchorA);
      const span = tetherDir.length() || 1;
      tetherPerp.set(-tetherDir.y, tetherDir.x, 0).normalize();
      tetherMid
        .addVectors(anchorA, anchorB)
        .multiplyScalar(0.5)
        .addScaledVector(
          tetherPerp,
          span * 0.16 * (0.6 + 0.4 * Math.sin(elapsed * 0.7)),
        );

      for (let i = 0; i <= TETHER_SEGS; i++) {
        const t = i / TETHER_SEGS;
        const inv = 1 - t;
        const w0 = inv * inv;
        const w1 = 2 * inv * t;
        const w2 = t * t;
        tetherPos[i * 3] = w0 * anchorA.x + w1 * tetherMid.x + w2 * anchorB.x;
        tetherPos[i * 3 + 1] = w0 * anchorA.y + w1 * tetherMid.y + w2 * anchorB.y;
        tetherPos[i * 3 + 2] = w0 * anchorA.z + w1 * tetherMid.z + w2 * anchorB.z;
      }
      tetherGeo.attributes.position.needsUpdate = true;
      tetherGeo.computeBoundingSphere();

      /* --- engines --- */
      const target = launching ? 1 : 0.16 * wake;
      throttle += (target - throttle) * Math.min(1, dt * 3.2);
      const flick = 0.82 + Math.sin(elapsed * 30) * 0.13;

      const hot = throttle > 0.02;
      for (const pl of plumes) {
        pl.visible = hot;
        const s = (0.35 + throttle * 2.5) * flick;
        pl.scale.set(s * 0.85, s, s * 0.85);
      }
      matPlume.opacity = Math.min(0.92, throttle * (0.55 + flick * 0.35));
      matThroat.opacity = Math.min(1, throttle * 1.6 * flick);
      for (const th of throats) th.visible = hot;

      matFlare.opacity = Math.min(0.85, throttle * 0.9 * flick);
      flare.scale.setScalar(1.6 + throttle * 3.4);

      // Navigation strobes run off ship power — they blink even when parked.
      const strobe = Math.sin(elapsed * 2.2) > 0.72 ? 1 : 0.12;
      matNavRed.opacity = strobe;
      matNavGreen.opacity = Math.sin(elapsed * 2.2 + 0.5) > 0.72 ? 1 : 0.12;
      matGlass.emissiveIntensity = 0.75 + Math.sin(elapsed * 0.9) * 0.12;

      nozzlePos.set(0, -2.5, 0);
      ship.localToWorld(nozzlePos);
      engineLight.position.copy(nozzlePos);
      engineLight.intensity = throttle * (11 + flick * 3);

      if (hot) {
        trailPts.unshift(nozzlePos.clone());
        if (trailPts.length > TRAIL_MAX) trailPts.length = TRAIL_MAX;
      } else if (trailPts.length) {
        trailPts.splice(-6);
      }
    };

    /* ---------------- resize ---------------- */
    const resize = () => {
      const w = host.clientWidth;
      const h = host.clientHeight;
      if (!w || !h) return;
      renderer.setSize(w, h, false);
      camera.aspect = w / h;
      camera.updateProjectionMatrix();
      layoutCrew();
      if (noMotion) repaint();
    };
    const ro = new ResizeObserver(resize);
    ro.observe(host);

    /* ---------------- loop ---------------- */
    const clock = new THREE.Clock();
    let raf = 0;
    let running = false;
    let lastPhase = phaseRef.current;

    const frame = () => {
      raf = requestAnimationFrame(frame);

      const dt = Math.min(clock.getDelta(), 0.05);
      if (noMotion) return;

      const ph = phaseRef.current;
      if (ph !== lastPhase) {
        if (ph === "landing") resetCrew();
        if (ph === "launching") {
          launchT = 0;
          shake = 0;
        }
        lastPhase = ph;
      }

      elapsed += dt;

      const starTarget =
        ph === "launching"
          ? 9
          : ph === "app"
            ? 0.16
            : 0.1 + 0.22 * easeInOut(wakeT);
      starSpeed +=
        (starTarget - starSpeed) *
        Math.min(1, dt * (ph === "launching" ? 4.5 : 1.2));
      starClock += dt * starSpeed;
      starMat.uniforms.uTime.value = starClock;

      updateCrew(dt);

      // Camera: gentle parallax, plus a decaying kick at ignition.
      const tx = pointer.x * (ph === "app" ? 1.1 : 1.6);
      const ty = pointer.y * (ph === "app" ? 0.7 : 1.05);
      camAt.x += (tx - camAt.x) * Math.min(1, dt * 1.8);
      camAt.y += (ty - camAt.y) * Math.min(1, dt * 1.8);
      camera.position.x = camAt.x + (Math.random() - 0.5) * shake;
      camera.position.y = camAt.y + (Math.random() - 0.5) * shake;
      camera.rotation.y = -camAt.x * 0.01;
      camera.rotation.x = camAt.y * 0.005;

      for (let i = 0; i < nebulae.length; i++) {
        const n = nebulae[i];
        const b = n.userData.base;
        n.position.x = b.x + Math.sin(elapsed * 0.05 + i * 2.1) * 3.5;
        n.position.y = b.y + Math.cos(elapsed * 0.04 + i * 1.3) * 2.6;
      }

      const count = trailPts.length;
      for (let i = 0; i < count; i++) {
        const p = trailPts[i];
        tPos[i * 3] = p.x;
        tPos[i * 3 + 1] = p.y;
        tPos[i * 3 + 2] = p.z;
        tLife[i] = 1 - i / TRAIL_MAX;
      }
      trailGeo.setDrawRange(0, count);
      trailGeo.attributes.position.needsUpdate = true;
      trailGeo.attributes.aLife.needsUpdate = true;

      renderer.render(scene, camera);
    };

    const start = () => {
      if (running) return;
      running = true;
      clock.getDelta();
      raf = requestAnimationFrame(frame);
    };
    const stop = () => {
      running = false;
      cancelAnimationFrame(raf);
    };

    /** One still frame for visitors who asked for reduced motion. */
    const repaint = () => {
      if (!noMotion) return;
      wakeT = 0;
      throttle = 0;
      trailGeo.setDrawRange(0, 0);
      updateCrew(0);
      renderer.render(scene, camera);
    };
    repaintRef.current = repaint;

    const applyMotionPreference = () => {
      if (noMotion) {
        stop();
        repaint();
      } else {
        start();
      }
    };

    const onMotionChange = (e) => {
      noMotion = e.matches;
      applyMotionPreference();
    };
    motionQuery.addEventListener("change", onMotionChange);

    const onVisibility = () => {
      if (document.hidden) stop();
      else if (!noMotion) start();
    };
    document.addEventListener("visibilitychange", onVisibility);

    applyMotionPreference();

    /* ---------------- teardown ---------------- */
    return () => {
      stop();
      repaintRef.current = null;
      ro.disconnect();
      motionQuery.removeEventListener("change", onMotionChange);
      document.removeEventListener("visibilitychange", onVisibility);
      window.removeEventListener("pointermove", onPointerMove);
      window.removeEventListener("pointerleave", onPointerLeave);

      for (const g of geometries) g.dispose();
      for (const m of materials) m.dispose();
      for (const t of textures) t.dispose();

      envRT.dispose();
      pmrem.dispose();
      scene.environment = null;

      renderer.dispose();
      if (renderer.domElement.parentNode === host) {
        host.removeChild(renderer.domElement);
      }
    };
  }, []);

  return (
    <div
      ref={hostRef}
      aria-hidden="true"
      className="pointer-events-none fixed inset-0 -z-10"
    />
  );
}
