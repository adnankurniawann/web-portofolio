import { useEffect, useRef } from "react";
import * as THREE from "three";

/* ============================================================
   3D SPACE SCENE

   Three phases, driven by the `phase` prop:
     landing   — rocket + astronaut hovering, ready to launch
     launching — rocket climbs out, stars streak briefly
     app       — crew gone, stars drift slowly as calm backdrop

   The in-app drift is deliberately gentle: this is a backdrop for
   reading, not the subject. Only the landing is allowed to be busy.

   Performance:
   - Star motion runs in the vertex shader (no per-frame CPU cost).
   - One draw call per layer.
   - DPR capped at 2; loop suspended while the tab is hidden.
   ============================================================ */

// Target star speeds per phase. `app` is ~1/5 of the landing pace.
const SPEED = { landing: 0.32, launching: 9.0, app: 0.16 };

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

    // uTime is pre-integrated on the CPU (time * speed) so that speed
    // changes ease in smoothly instead of making stars jump position.
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

// No explicit `precision` qualifier: Three injects a matching default into
// both stages, and overriding only one makes shared uniforms fail to link.
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
    vec3 c = mix(vec3(0.98, 0.42, 0.09), vec3(1.0, 0.94, 0.62), vLife);
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

  // Feed prop changes to the render loop without tearing down the scene.
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
      return; // No WebGL — the CSS backdrop is a complete visual on its own.
    }

    const lowPower =
      window.innerWidth < 768 ||
      (navigator.hardwareConcurrency || 8) <= 4 ||
      window.matchMedia("(pointer: coarse)").matches;

    const dpr = Math.min(window.devicePixelRatio || 1, 2);
    renderer.setPixelRatio(dpr);
    renderer.setSize(host.clientWidth, host.clientHeight);
    renderer.setClearColor(0x000000, 0);
    host.appendChild(renderer.domElement);
    renderer.domElement.style.display = "block";

    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(
      60,
      host.clientWidth / host.clientHeight,
      0.1,
      220,
    );
    camera.position.set(0, 0, 10);

    const geometries = [];
    const materials = [];
    const textures = [];

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
    geometries.push(starGeo);

    const starMat = new THREE.ShaderMaterial({
      uniforms: {
        uTime: { value: 0 },
        uDpr: { value: dpr },
      },
      vertexShader: STAR_VERT,
      fragmentShader: STAR_FRAG,
      transparent: true,
      depthWrite: false,
      blending: THREE.AdditiveBlending,
    });
    materials.push(starMat);

    const stars = new THREE.Points(starGeo, starMat);
    stars.frustumCulled = false;
    scene.add(stars);

    /* ---------------- nebula ---------------- */
    const nebulae = [];
    for (const spec of [
      { rgb: "56,110,240", x: -22, y: 10, z: -58, s: 78 },
      { rgb: "99,102,241", x: 26, y: -6, z: -66, s: 66 },
      { rgb: "37,99,235", x: 4, y: -20, z: -48, s: 58 },
    ]) {
      const tex = makeGlowTexture(spec.rgb);
      textures.push(tex);
      const mat = new THREE.SpriteMaterial({
        map: tex,
        transparent: true,
        depthWrite: false,
        blending: THREE.AdditiveBlending,
        opacity: 0.45,
      });
      materials.push(mat);

      const sprite = new THREE.Sprite(mat);
      sprite.position.set(spec.x, spec.y, spec.z);
      sprite.scale.set(spec.s, spec.s, 1);
      sprite.userData.base = { x: spec.x, y: spec.y };
      scene.add(sprite);
      nebulae.push(sprite);
    }

    /* ---------------- lighting ---------------- */
    scene.add(new THREE.AmbientLight(0x8fb0ff, 1.7));
    const key = new THREE.DirectionalLight(0xffffff, 2.4);
    key.position.set(4, 6, 8);
    scene.add(key);
    const rim = new THREE.DirectionalLight(0x60a5fa, 1.5);
    rim.position.set(-6, 2, -4);
    scene.add(rim);
    const engineLight = new THREE.PointLight(0xf97316, 3.2, 16, 2);
    scene.add(engineLight);

    /* ---------------- crew (landing only) ---------------- */
    const crew = new THREE.Group();
    scene.add(crew);

    // -- rocket, built upright along +Y --
    const rocket = new THREE.Group();

    const hullMat = new THREE.MeshStandardMaterial({
      color: 0xe8eef7,
      metalness: 0.6,
      roughness: 0.32,
    });
    materials.push(hullMat);
    const darkMat = new THREE.MeshStandardMaterial({
      color: 0x334155,
      metalness: 0.55,
      roughness: 0.45,
    });
    materials.push(darkMat);
    const accentMat = new THREE.MeshStandardMaterial({
      color: 0x3b82f6,
      metalness: 0.45,
      roughness: 0.3,
      emissive: 0x1d4ed8,
      emissiveIntensity: 0.4,
    });
    materials.push(accentMat);

    const hullGeo = new THREE.CylinderGeometry(0.34, 0.42, 1.9, 24);
    geometries.push(hullGeo);
    rocket.add(new THREE.Mesh(hullGeo, hullMat));

    const noseGeo = new THREE.ConeGeometry(0.34, 0.95, 24);
    noseGeo.translate(0, 1.42, 0);
    geometries.push(noseGeo);
    rocket.add(new THREE.Mesh(noseGeo, accentMat));

    const bandGeo = new THREE.CylinderGeometry(0.435, 0.435, 0.16, 24);
    bandGeo.translate(0, -0.62, 0);
    geometries.push(bandGeo);
    rocket.add(new THREE.Mesh(bandGeo, accentMat));

    const portGeo = new THREE.SphereGeometry(0.155, 18, 18);
    portGeo.translate(0, 0.42, 0.3);
    geometries.push(portGeo);
    const portMat = new THREE.MeshStandardMaterial({
      color: 0x7dd3fc,
      emissive: 0x38bdf8,
      emissiveIntensity: 1.5,
      roughness: 0.12,
    });
    materials.push(portMat);
    rocket.add(new THREE.Mesh(portGeo, portMat));

    const finGeo = new THREE.ConeGeometry(0.3, 0.75, 4);
    geometries.push(finGeo);
    for (let i = 0; i < 3; i++) {
      const fin = new THREE.Mesh(finGeo, darkMat);
      const a = (i / 3) * Math.PI * 2;
      fin.position.set(Math.cos(a) * 0.42, -0.92, Math.sin(a) * 0.42);
      fin.rotation.y = -a;
      fin.rotation.z = Math.cos(a) * -0.32;
      fin.rotation.x = Math.sin(a) * 0.32;
      fin.scale.set(0.5, 1, 0.85);
      rocket.add(fin);
    }

    const flameGeo = new THREE.ConeGeometry(0.28, 1.15, 18, 1, true);
    flameGeo.rotateX(Math.PI); // point downward
    flameGeo.translate(0, -1.55, 0);
    geometries.push(flameGeo);
    const flameMat = new THREE.MeshBasicMaterial({
      color: 0xfde68a,
      transparent: true,
      opacity: 0.9,
      blending: THREE.AdditiveBlending,
      depthWrite: false,
      side: THREE.DoubleSide,
    });
    materials.push(flameMat);
    const flame = new THREE.Mesh(flameGeo, flameMat);
    rocket.add(flame);

    crew.add(rocket);

    // -- astronaut --
    const astronaut = new THREE.Group();

    const suitMat = new THREE.MeshStandardMaterial({
      color: 0xf1f5f9,
      metalness: 0.15,
      roughness: 0.62,
    });
    materials.push(suitMat);
    const visorMat = new THREE.MeshStandardMaterial({
      color: 0x0b1a3a,
      metalness: 0.9,
      roughness: 0.08,
      emissive: 0x1e3a8a,
      emissiveIntensity: 0.5,
    });
    materials.push(visorMat);

    const helmetGeo = new THREE.SphereGeometry(0.3, 22, 22);
    helmetGeo.translate(0, 0.62, 0);
    geometries.push(helmetGeo);
    astronaut.add(new THREE.Mesh(helmetGeo, suitMat));

    const visorGeo = new THREE.SphereGeometry(0.245, 22, 22);
    visorGeo.translate(0, 0.63, 0.1);
    geometries.push(visorGeo);
    astronaut.add(new THREE.Mesh(visorGeo, visorMat));

    const torsoGeo = new THREE.CapsuleGeometry(0.23, 0.34, 6, 16);
    torsoGeo.translate(0, 0.1, 0);
    geometries.push(torsoGeo);
    astronaut.add(new THREE.Mesh(torsoGeo, suitMat));

    const packGeo = new THREE.BoxGeometry(0.34, 0.42, 0.18);
    packGeo.translate(0, 0.12, -0.28);
    geometries.push(packGeo);
    astronaut.add(new THREE.Mesh(packGeo, darkMat));

    const limbGeo = new THREE.CapsuleGeometry(0.085, 0.3, 5, 12);
    geometries.push(limbGeo);

    const arms = [];
    for (const side of [-1, 1]) {
      const arm = new THREE.Mesh(limbGeo, suitMat);
      arm.position.set(side * 0.31, 0.15, 0);
      arm.rotation.z = side * 0.75;
      astronaut.add(arm);
      arms.push(arm);
    }

    for (const side of [-1, 1]) {
      const leg = new THREE.Mesh(limbGeo, suitMat);
      leg.position.set(side * 0.13, -0.32, 0.02);
      leg.rotation.z = side * 0.16;
      leg.rotation.x = -0.2;
      astronaut.add(leg);
    }

    // Chest control patch — small blue accent so the suit reads as a suit.
    const patchGeo = new THREE.BoxGeometry(0.16, 0.1, 0.06);
    patchGeo.translate(0, 0.16, 0.21);
    geometries.push(patchGeo);
    astronaut.add(new THREE.Mesh(patchGeo, accentMat));

    crew.add(astronaut);

    /* ---------------- exhaust trail ---------------- */
    const TRAIL_MAX = lowPower ? 80 : 170;
    const trailGeo = new THREE.BufferGeometry();
    const tPos = new Float32Array(TRAIL_MAX * 3);
    const tLife = new Float32Array(TRAIL_MAX);
    trailGeo.setAttribute("position", new THREE.BufferAttribute(tPos, 3));
    trailGeo.setAttribute("aLife", new THREE.BufferAttribute(tLife, 1));
    trailGeo.setDrawRange(0, 0);
    geometries.push(trailGeo);

    const trailMat = new THREE.ShaderMaterial({
      uniforms: { uDpr: { value: dpr } },
      vertexShader: TRAIL_VERT,
      fragmentShader: TRAIL_FRAG,
      transparent: true,
      depthWrite: false,
      blending: THREE.AdditiveBlending,
    });
    materials.push(trailMat);

    const trail = new THREE.Points(trailGeo, trailMat);
    trail.frustumCulled = false;
    scene.add(trail);

    const trailPts = [];
    const nozzle = new THREE.Vector3();

    /* ---------------- layout ---------------- */
    // Portrait screens put the crew above the copy; landscape puts it right.
    const layoutCrew = () => {
      const portrait = host.clientWidth < host.clientHeight * 1.05;
      if (portrait) {
        crew.position.set(0, 2.1, 1.5);
        crew.scale.setScalar(0.82);
        rocket.position.set(0.55, 0, 0);
        astronaut.position.set(-1.15, 0.35, 0.6);
      } else {
        crew.position.set(2.9, -0.35, 2.2);
        crew.scale.setScalar(1);
        rocket.position.set(0.5, 0, 0);
        astronaut.position.set(-1.5, 0.75, 0.9);
      }
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

    /* ---------------- reduced motion (kept live) ---------------- */
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
    let starClock = 0; // integrated star travel, so speed changes stay smooth
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

      // Ease the star speed toward its phase target instead of snapping.
      const target = SPEED[ph] ?? SPEED.app;
      speed += (target - speed) * Math.min(1, dt * (ph === "launching" ? 4.5 : 1.2));
      starClock += dt * speed;

      starMat.uniforms.uTime.value = starClock;

      // Gentle mouse parallax.
      const tx = pointer.x * (ph === "app" ? 1.1 : 2.0);
      const ty = pointer.y * (ph === "app" ? 0.7 : 1.3);
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

      /* --- crew --- */
      if (ph === "app") {
        crew.visible = false;
        engineLight.visible = false;
        if (trailPts.length) trailPts.splice(-4);
      } else {
        crew.visible = true;

        if (ph === "launching") {
          launchT += dt;
          // Ease-in climb: slow off the pad, then accelerating away.
          const t = Math.min(launchT / 2.0, 1);
          const climb = t * t * 34;
          rocket.position.y = climb;
          rocket.position.x = 0.5 + t * 1.2;
          astronaut.position.y = 0.75 + climb * 0.82;
          astronaut.rotation.z += dt * 2.4;
        } else {
          // Idle hover — small, slow, unhurried.
          rocket.position.y = Math.sin(elapsed * 0.85) * 0.13;
          rocket.rotation.z = Math.sin(elapsed * 0.6) * 0.045;
          astronaut.position.y =
            (host.clientWidth < host.clientHeight * 1.05 ? 0.35 : 0.75) +
            Math.sin(elapsed * 0.7 + 1.2) * 0.16;
          // Sway rather than spin — a full rotation keeps turning the
          // visor away from the viewer, which reads as a faceless blob.
          astronaut.rotation.y = Math.sin(elapsed * 0.32) * 0.5;
          astronaut.rotation.z = Math.sin(elapsed * 0.45) * 0.16;
          astronaut.rotation.x = Math.sin(elapsed * 0.38 + 0.8) * 0.12;
          arms[0].rotation.z = -0.75 + Math.sin(elapsed * 0.9) * 0.12;
          arms[1].rotation.z = 0.75 - Math.sin(elapsed * 0.9 + 0.6) * 0.12;
        }

        const boost = ph === "launching" ? 2.6 : 1;
        const flick = 0.8 + Math.sin(elapsed * 26) * 0.14;
        flame.scale.set(flick * boost * 0.9, flick * boost, flick * boost * 0.9);
        flameMat.opacity = (ph === "launching" ? 0.85 : 0.5) + flick * 0.15;

        nozzle.set(0, -1.15, 0);
        rocket.localToWorld(nozzle);
        engineLight.position.copy(nozzle);
        engineLight.intensity = (ph === "launching" ? 7 : 2.4) + flick * 1.6;
        engineLight.visible = true;

        trailPts.unshift(nozzle.clone());
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
        // Static composed frame: crew posed, nothing moving.
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
