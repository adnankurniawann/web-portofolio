import { useEffect, useRef } from "react";
import * as THREE from "three";

/* ============================================================
   3D SPACE SCENE

   Phases (driven by the `phase` prop):
     landing   — spacecraft + EVA astronaut, centred, text-free
     launching — the ship burns out of frame, stars streak
     app       — crew gone, stars drift slowly as a calm backdrop

   The craft and suit are modelled in a hard-sci-fi register (Project
   Hail Mary / real EVA hardware) rather than as a cartoon rocket:
   segmented hull, radiator wings, lathe-turned engine bells, gold MLI
   foil, and a suit with joint rings, PLSS pack and a gold visor.

   Realism comes mostly from lighting, not polygons — a procedural
   environment map through PMREM gives the metals something to reflect,
   and ACES tone mapping keeps the highlights from clipping to flat white.
   ============================================================ */

const SPEED = { landing: 0.26, launching: 9.0, app: 0.16 };

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

function makeGlowTexture(rgb) {
  const size = 256;
  const cvs = document.createElement("canvas");
  cvs.width = size;
  cvs.height = size;
  const ctx = cvs.getContext("2d");

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
  const cvs = document.createElement("canvas");
  cvs.width = w;
  cvs.height = h;
  const ctx = cvs.getContext("2d");

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

const STAR_COLORS = [
  [1.0, 1.0, 1.0],
  [0.85, 0.92, 1.0],
  [0.75, 0.86, 1.0],
  [0.65, 0.79, 1.0],
  [0.72, 0.75, 1.0],
];

export default function SceneBackground({ phase = "landing" }) {
  const hostRef = useRef(null);
  const phaseRef = useRef(phase);

  useEffect(() => {
    phaseRef.current = phase;
  }, [phase]);

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

    /* ---------------- environment ---------------- */
    const pmrem = new THREE.PMREMGenerator(renderer);
    const envSrc = makeEnvTexture();
    textures.push(envSrc);
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
      const tex = makeGlowTexture(spec.rgb);
      textures.push(tex);
      const mat = M(
        new THREE.SpriteMaterial({
          map: tex,
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
    scene.add(new THREE.AmbientLight(0x6b86c4, 0.55));

    const sun = new THREE.DirectionalLight(0xfff4e6, 3.4);
    sun.position.set(-5, 4, 6);
    scene.add(sun);

    const bounce = new THREE.DirectionalLight(0x3b82f6, 1.1);
    bounce.position.set(6, -3, 2);
    scene.add(bounce);

    const rim = new THREE.DirectionalLight(0x93c5fd, 1.6);
    rim.position.set(2, 3, -7);
    scene.add(rim);

    const engineLight = new THREE.PointLight(0x9ecbff, 3.0, 18, 2);
    scene.add(engineLight);

    /* ---------------- shared materials ---------------- */
    const matHull = M(
      new THREE.MeshStandardMaterial({
        color: 0xd6dbe4,
        metalness: 0.45,
        roughness: 0.42,
        envMapIntensity: 1.1,
      }),
    );
    const matPanel = M(
      new THREE.MeshStandardMaterial({
        color: 0x8d97a8,
        metalness: 0.75,
        roughness: 0.34,
        envMapIntensity: 1.2,
      }),
    );
    const matDark = M(
      new THREE.MeshStandardMaterial({
        color: 0x232c3b,
        metalness: 0.7,
        roughness: 0.42,
        envMapIntensity: 1,
      }),
    );
    const matFoil = M(
      new THREE.MeshStandardMaterial({
        color: 0xc9922f,
        metalness: 1,
        roughness: 0.3,
        envMapIntensity: 1.5,
      }),
    );
    const matNozzle = M(
      new THREE.MeshStandardMaterial({
        color: 0x4b5160,
        metalness: 0.95,
        roughness: 0.3,
        side: THREE.DoubleSide,
        envMapIntensity: 1.3,
      }),
    );
    const matGlass = M(
      new THREE.MeshStandardMaterial({
        color: 0x0b1c3a,
        metalness: 0.9,
        roughness: 0.06,
        envMapIntensity: 1.6,
      }),
    );

    const matSuit = M(
      new THREE.MeshStandardMaterial({
        color: 0xe8ecf3,
        metalness: 0.05,
        roughness: 0.78,
        envMapIntensity: 0.9,
      }),
    );
    const matVisor = M(
      new THREE.MeshStandardMaterial({
        color: 0xffc061,
        metalness: 1,
        roughness: 0.09,
        envMapIntensity: 2.1,
      }),
    );
    const matJoint = M(
      new THREE.MeshStandardMaterial({
        color: 0x9aa3b2,
        metalness: 0.85,
        roughness: 0.3,
        envMapIntensity: 1.2,
      }),
    );
    const matRed = M(
      new THREE.MeshStandardMaterial({
        color: 0xc0392b,
        metalness: 0.1,
        roughness: 0.65,
      }),
    );
    const matBlue = M(
      new THREE.MeshStandardMaterial({
        color: 0x2563eb,
        metalness: 0.2,
        roughness: 0.5,
      }),
    );

    /* ---------------- spacecraft ---------------- */
    // Built nose-up along +Y so the launch is a straight climb.
    const ship = new THREE.Group();

    // Main hull
    const hull = new THREE.Mesh(G(new THREE.CylinderGeometry(0.52, 0.52, 2.4, 32, 1)), matHull);
    hull.position.y = -0.5;
    ship.add(hull);

    // Hull ribs — reused geometry, several instances
    const ribGeo = G(new THREE.CylinderGeometry(0.545, 0.545, 0.06, 32));
    for (const y of [-1.5, -1.05, -0.6, -0.15, 0.3]) {
      const rib = new THREE.Mesh(ribGeo, matPanel);
      rib.position.y = y;
      ship.add(rib);
    }

    // Gold MLI insulation band
    const foilBand = new THREE.Mesh(
      G(new THREE.CylinderGeometry(0.555, 0.555, 0.42, 32)),
      matFoil,
    );
    foilBand.position.y = -0.83;
    ship.add(foilBand);

    // Lab module (wider mid-section)
    const lab = new THREE.Mesh(G(new THREE.CylinderGeometry(0.63, 0.63, 0.82, 32)), matHull);
    lab.position.y = 1.1;
    ship.add(lab);

    const labRing = new THREE.Mesh(
      G(new THREE.CylinderGeometry(0.66, 0.66, 0.08, 32)),
      matPanel,
    );
    labRing.position.y = 1.1;
    ship.add(labRing);

    // Crew module + dome
    const crewMod = new THREE.Mesh(
      G(new THREE.CylinderGeometry(0.5, 0.6, 0.62, 32)),
      matHull,
    );
    crewMod.position.y = 1.82;
    ship.add(crewMod);

    const dome = new THREE.Mesh(
      G(new THREE.SphereGeometry(0.5, 32, 18, 0, Math.PI * 2, 0, Math.PI / 2)),
      matHull,
    );
    dome.position.y = 2.13;
    ship.add(dome);

    // Docking collar
    const collar = new THREE.Mesh(G(new THREE.TorusGeometry(0.2, 0.045, 10, 24)), matPanel);
    collar.rotation.x = Math.PI / 2;
    collar.position.y = 2.6;
    ship.add(collar);

    // Viewports around the crew module
    const portGeo = G(new THREE.CylinderGeometry(0.085, 0.085, 0.06, 16));
    const portRimGeo = G(new THREE.TorusGeometry(0.09, 0.018, 8, 18));
    for (let i = 0; i < 4; i++) {
      const a = (i / 4) * Math.PI * 2 + 0.4;
      const px = Math.cos(a) * 0.53;
      const pz = Math.sin(a) * 0.53;

      const port = new THREE.Mesh(portGeo, matGlass);
      port.position.set(px, 1.86, pz);
      port.rotation.z = Math.PI / 2;
      port.rotation.y = -a;
      ship.add(port);

      const rim2 = new THREE.Mesh(portRimGeo, matPanel);
      rim2.position.set(px, 1.86, pz);
      rim2.rotation.y = -a + Math.PI / 2;
      ship.add(rim2);
    }

    // Radiator wings
    const radGeo = G(new THREE.BoxGeometry(1.5, 0.035, 0.92));
    const radArmGeo = G(new THREE.CylinderGeometry(0.05, 0.05, 0.42, 10));
    for (const side of [-1, 1]) {
      const arm = new THREE.Mesh(radArmGeo, matPanel);
      arm.rotation.z = Math.PI / 2;
      arm.position.set(side * 0.7, -0.35, 0);
      ship.add(arm);

      const rad = new THREE.Mesh(radGeo, matDark);
      rad.position.set(side * 1.62, -0.35, 0);
      rad.rotation.x = 0.12 * side;
      ship.add(rad);

      // Bright edge strip so the wings read against the dark background
      const edge = new THREE.Mesh(G(new THREE.BoxGeometry(1.5, 0.045, 0.06)), matPanel);
      edge.position.set(side * 1.62, -0.33, side * 0.44);
      edge.rotation.x = 0.12 * side;
      ship.add(edge);
    }

    // High-gain antenna
    const dishPts = [];
    for (let i = 0; i <= 10; i++) {
      const t = i / 10;
      dishPts.push(new THREE.Vector2(t * 0.3, t * t * 0.22));
    }
    const dish = new THREE.Mesh(G(new THREE.LatheGeometry(dishPts, 24)), matPanel);
    dish.material = matPanel;
    dish.position.set(0.72, 1.35, 0.2);
    dish.rotation.z = -0.9;
    dish.rotation.x = -0.3;
    ship.add(dish);

    const boomGeo = G(new THREE.CylinderGeometry(0.028, 0.028, 0.32, 8));
    const boom = new THREE.Mesh(boomGeo, matDark);
    boom.rotation.z = Math.PI / 2.4;
    boom.position.set(0.5, 1.3, 0.12);
    ship.add(boom);

    // Thrust structure
    const skirt = new THREE.Mesh(
      G(new THREE.CylinderGeometry(0.5, 0.42, 0.32, 24)),
      matDark,
    );
    skirt.position.y = -1.85;
    ship.add(skirt);

    // Engine bells — lathe-turned so the nozzle flare is a real curve
    const bellPts = [];
    for (let i = 0; i <= 14; i++) {
      const t = i / 14;
      bellPts.push(new THREE.Vector2(0.075 + Math.pow(t, 0.62) * 0.185, -t * 0.46));
    }
    const bellGeo = G(new THREE.LatheGeometry(bellPts, 22));
    const bells = [];
    for (let i = 0; i < 3; i++) {
      const a = (i / 3) * Math.PI * 2 + Math.PI / 6;
      const bell = new THREE.Mesh(bellGeo, matNozzle);
      bell.position.set(Math.cos(a) * 0.23, -2.02, Math.sin(a) * 0.23);
      ship.add(bell);
      bells.push(bell);
    }

    // Exhaust plumes, one per bell
    const plumeGeo = G(new THREE.ConeGeometry(0.15, 0.9, 16, 1, true));
    plumeGeo.rotateX(Math.PI);
    plumeGeo.translate(0, -0.45, 0);
    const matPlume = M(
      new THREE.MeshBasicMaterial({
        color: 0xbcd8ff,
        transparent: true,
        opacity: 0.75,
        blending: THREE.AdditiveBlending,
        depthWrite: false,
        side: THREE.DoubleSide,
        toneMapped: false, // keep the plume hot; ACES would grey it out
      }),
    );
    const plumes = [];
    for (const bell of bells) {
      const plume = new THREE.Mesh(plumeGeo, matPlume);
      plume.position.set(bell.position.x, -2.46, bell.position.z);
      ship.add(plume);
      plumes.push(plume);
    }

    ship.scale.setScalar(0.46);

    /* ---------------- EVA astronaut ---------------- */
    const astronaut = new THREE.Group();

    const helmet = new THREE.Mesh(G(new THREE.SphereGeometry(0.16, 26, 20)), matSuit);
    helmet.position.y = 0.4;
    astronaut.add(helmet);

    // Gold faceplate: a patch of sphere centred on +Z (phi = PI/2 faces +Z)
    const visor = new THREE.Mesh(
      G(
        new THREE.SphereGeometry(
          0.163,
          26,
          20,
          Math.PI / 2 - 0.95,
          1.9,
          0.55,
          1.45,
        ),
      ),
      matVisor,
    );
    visor.position.y = 0.4;
    astronaut.add(visor);

    const neckRing = new THREE.Mesh(G(new THREE.TorusGeometry(0.115, 0.026, 10, 22)), matJoint);
    neckRing.rotation.x = Math.PI / 2;
    neckRing.position.y = 0.275;
    astronaut.add(neckRing);

    const torso = new THREE.Mesh(G(new THREE.CapsuleGeometry(0.155, 0.24, 8, 20)), matSuit);
    torso.position.y = 0.09;
    astronaut.add(torso);

    // PLSS life-support pack
    const plss = new THREE.Mesh(G(new THREE.BoxGeometry(0.29, 0.35, 0.14)), matSuit);
    plss.position.set(0, 0.11, -0.19);
    astronaut.add(plss);

    const plssTop = new THREE.Mesh(G(new THREE.BoxGeometry(0.22, 0.07, 0.11)), matDark);
    plssTop.position.set(0, 0.3, -0.19);
    astronaut.add(plssTop);

    // Chest control module + accent
    const chest = new THREE.Mesh(G(new THREE.BoxGeometry(0.19, 0.12, 0.07)), matDark);
    chest.position.set(0, 0.15, 0.15);
    astronaut.add(chest);

    const chestTab = new THREE.Mesh(G(new THREE.BoxGeometry(0.07, 0.035, 0.03)), matBlue);
    chestTab.position.set(-0.04, 0.15, 0.19);
    astronaut.add(chestTab);

    const shoulderGeo = G(new THREE.SphereGeometry(0.072, 16, 14));
    const upperArmGeo = G(new THREE.CapsuleGeometry(0.058, 0.15, 6, 14));
    const foreArmGeo = G(new THREE.CapsuleGeometry(0.053, 0.14, 6, 14));
    const jointGeo = G(new THREE.TorusGeometry(0.058, 0.017, 8, 16));
    const gloveGeo = G(new THREE.SphereGeometry(0.062, 14, 12));

    const arms = [];
    for (const side of [-1, 1]) {
      const arm = new THREE.Group();

      const shoulder = new THREE.Mesh(shoulderGeo, matJoint);
      arm.add(shoulder);

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

      const glove = new THREE.Mesh(gloveGeo, matDark);
      glove.position.set(0, -0.38, 0.09);
      arm.add(glove);

      // Identification stripe, NASA-style
      const stripe = new THREE.Mesh(
        G(new THREE.TorusGeometry(0.06, 0.014, 8, 16)),
        side < 0 ? matRed : matBlue,
      );
      stripe.rotation.x = Math.PI / 2;
      stripe.position.y = -0.05;
      arm.add(stripe);

      arm.position.set(side * 0.185, 0.2, 0);
      arm.rotation.z = side * 0.42;
      astronaut.add(arm);
      arms.push(arm);
    }

    const hipGeo = G(new THREE.CapsuleGeometry(0.13, 0.06, 6, 16));
    const hips = new THREE.Mesh(hipGeo, matSuit);
    hips.position.y = -0.11;
    astronaut.add(hips);

    const thighGeo = G(new THREE.CapsuleGeometry(0.068, 0.16, 6, 14));
    const shinGeo = G(new THREE.CapsuleGeometry(0.06, 0.15, 6, 14));
    const kneeGeo = G(new THREE.TorusGeometry(0.066, 0.017, 8, 16));
    const bootGeo = G(new THREE.BoxGeometry(0.11, 0.07, 0.16));

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

      const boot = new THREE.Mesh(bootGeo, matDark);
      boot.position.set(0, -0.39, 0.11);
      boot.rotation.x = -0.2;
      leg.add(boot);

      leg.position.set(side * 0.095, -0.17, 0);
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
    // No copy competes with the scene now, so the crew is centred.
    let shipBaseY = 0;
    let astroBase = { x: 0, y: 0 };

    const layoutCrew = () => {
      // The scene is the entire landing, so the craft is framed large —
      // roughly 60% of viewport height on desktop.
      const portrait = host.clientWidth < host.clientHeight * 1.05;
      if (portrait) {
        crew.position.set(0, 0.75, 2.4);
        crew.scale.setScalar(1.05);
        ship.position.set(0.44, 0, 0);
        astroBase = { x: -0.8, y: 0.5 };
      } else {
        crew.position.set(0, 0.3, 3.4);
        crew.scale.setScalar(1.7);
        ship.position.set(0.95, 0, 0);
        astroBase = { x: -1.25, y: 0.3 };
      }
      shipBaseY = 0;
      astronaut.position.set(astroBase.x, astroBase.y, 0.9);
    };
    layoutCrew();

    const resetCrew = () => {
      crew.visible = true;
      layoutCrew();
      launchT = 0;
      trailPts.length = 0;
      trailGeo.setDrawRange(0, 0);
    };

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

    /* ---------------- resize ---------------- */
    const resize = () => {
      const w = host.clientWidth;
      const h = host.clientHeight;
      if (!w || !h) return;
      renderer.setSize(w, h, false);
      camera.aspect = w / h;
      camera.updateProjectionMatrix();
      layoutCrew();
      if (noMotion) renderer.render(scene, camera);
    };
    const ro = new ResizeObserver(resize);
    ro.observe(host);

    /* ---------------- loop ---------------- */
    const clock = new THREE.Clock();
    let raf = 0;
    let elapsed = 0;
    let starClock = 0;
    let speed = SPEED.landing;
    let launchT = 0;
    let running = false;
    let lastPhase = phaseRef.current;

    const frame = () => {
      raf = requestAnimationFrame(frame);

      const dt = Math.min(clock.getDelta(), 0.05);
      if (noMotion) return;

      const ph = phaseRef.current;
      if (ph !== lastPhase) {
        if (ph === "landing") resetCrew();
        if (ph === "launching") launchT = 0;
        lastPhase = ph;
      }

      elapsed += dt;

      const target = SPEED[ph] ?? SPEED.app;
      speed += (target - speed) * Math.min(1, dt * (ph === "launching" ? 4.5 : 1.2));
      starClock += dt * speed;
      starMat.uniforms.uTime.value = starClock;

      const tx = pointer.x * (ph === "app" ? 1.1 : 1.8);
      const ty = pointer.y * (ph === "app" ? 0.7 : 1.2);
      camAt.x += (tx - camAt.x) * Math.min(1, dt * 1.8);
      camAt.y += (ty - camAt.y) * Math.min(1, dt * 1.8);
      camera.position.x = camAt.x;
      camera.position.y = camAt.y;
      camera.rotation.y = -camAt.x * 0.01;
      camera.rotation.x = camAt.y * 0.005;

      for (let i = 0; i < nebulae.length; i++) {
        const n = nebulae[i];
        const b = n.userData.base;
        n.position.x = b.x + Math.sin(elapsed * 0.05 + i * 2.1) * 3.5;
        n.position.y = b.y + Math.cos(elapsed * 0.04 + i * 1.3) * 2.6;
      }

      if (ph === "app") {
        crew.visible = false;
        engineLight.visible = false;
        if (trailPts.length) trailPts.splice(-4);
      } else {
        crew.visible = true;

        if (ph === "launching") {
          launchT += dt;
          const t = Math.min(launchT / 2.0, 1);
          const climb = t * t * 34;
          ship.position.y = shipBaseY + climb;
          astronaut.position.y = astroBase.y + climb * 0.86;
          astronaut.rotation.z += dt * 2.2;
        } else {
          // Slow, weightless drift — the ship turns just enough for the
          // light to travel across its panels.
          ship.position.y = shipBaseY + Math.sin(elapsed * 0.5) * 0.12;
          ship.rotation.y = elapsed * 0.16;
          ship.rotation.z = Math.sin(elapsed * 0.33) * 0.06;
          ship.rotation.x = 0.1 + Math.sin(elapsed * 0.24) * 0.04;

          astronaut.position.x = astroBase.x + Math.sin(elapsed * 0.27) * 0.16;
          astronaut.position.y = astroBase.y + Math.sin(elapsed * 0.62) * 0.14;
          astronaut.rotation.y = Math.sin(elapsed * 0.3) * 0.55;
          astronaut.rotation.z = Math.sin(elapsed * 0.42) * 0.17;
          astronaut.rotation.x = Math.sin(elapsed * 0.36 + 0.8) * 0.13;

          arms[0].rotation.z = -0.42 + Math.sin(elapsed * 0.8) * 0.14;
          arms[1].rotation.z = 0.42 - Math.sin(elapsed * 0.8 + 0.7) * 0.14;
          legs[0].rotation.x = 0.22 + Math.sin(elapsed * 0.55) * 0.1;
          legs[1].rotation.x = 0.22 + Math.sin(elapsed * 0.55 + 1.1) * 0.1;
        }

        const burning = ph === "launching";
        const flick = 0.82 + Math.sin(elapsed * 30) * 0.13;
        const plumeScale = burning ? 2.4 * flick : 0.55 * flick;
        for (const p of plumes) {
          p.scale.set(plumeScale * 0.85, plumeScale, plumeScale * 0.85);
        }
        matPlume.opacity = burning ? 0.55 + flick * 0.3 : 0.22 + flick * 0.12;

        nozzlePos.set(0, -2.5, 0);
        ship.localToWorld(nozzlePos);
        engineLight.position.copy(nozzlePos);
        engineLight.intensity = (burning ? 9 : 2.2) + flick * 1.5;
        engineLight.visible = true;

        trailPts.unshift(nozzlePos.clone());
        if (trailPts.length > TRAIL_MAX) trailPts.length = TRAIL_MAX;
      }

      const n = trailPts.length;
      for (let i = 0; i < n; i++) {
        const p = trailPts[i];
        tPos[i * 3] = p.x;
        tPos[i * 3 + 1] = p.y;
        tPos[i * 3 + 2] = p.z;
        tLife[i] = 1 - i / TRAIL_MAX;
      }
      trailGeo.setDrawRange(0, n);
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

    const applyMotionPreference = () => {
      if (noMotion) {
        stop();
        crew.visible = phaseRef.current !== "app";
        engineLight.visible = crew.visible;
        trailGeo.setDrawRange(0, 0);
        renderer.render(scene, camera);
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
