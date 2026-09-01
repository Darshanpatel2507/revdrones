// ============================================================
// RevDrones — Drone-in-a-box scroll scene
// The drone launches out of a dock box as you scroll into this
// section, hovers, then descends back into the box as you scroll
// further — tied directly to scroll position so it reverses
// cleanly on scroll-up. Built for a grounded, physical look:
// real shadows, matte materials, motion-blurred props.
// ============================================================
document.addEventListener("DOMContentLoaded", () => {
  const section = document.querySelector(".box-scene-section");
  const canvas = document.getElementById("box-canvas");
  const copy = document.getElementById("box-copy");
  const scrollFill = document.getElementById("box-scroll-fill");
  if (!section || !canvas) return;

  if (!window.THREE || window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
    copy && copy.classList.add("show");
    return;
  }

  // ---------- small helper: procedural canvas textures for realism ----------
  function noiseTexture(size, base, variance, alpha) {
    const c = document.createElement("canvas");
    c.width = c.height = size;
    const ctx = c.getContext("2d");
    const img = ctx.createImageData(size, size);
    for (let i = 0; i < img.data.length; i += 4) {
      const n = base + (Math.random() - 0.5) * variance;
      img.data[i] = n; img.data[i + 1] = n; img.data[i + 2] = n; img.data[i + 3] = alpha;
    }
    ctx.putImageData(img, 0, 0);
    const tex = new THREE.CanvasTexture(c);
    tex.wrapS = tex.wrapT = THREE.RepeatWrapping;
    return tex;
  }
  function shadowBlobTexture() {
    const c = document.createElement("canvas");
    c.width = c.height = 128;
    const ctx = c.getContext("2d");
    const g = ctx.createRadialGradient(64, 64, 0, 64, 64, 64);
    g.addColorStop(0, "rgba(0,0,0,0.55)");
    g.addColorStop(0.7, "rgba(0,0,0,0.22)");
    g.addColorStop(1, "rgba(0,0,0,0)");
    ctx.fillStyle = g;
    ctx.fillRect(0, 0, 128, 128);
    return new THREE.CanvasTexture(c);
  }
  function bladeBlurTexture() {
    const c = document.createElement("canvas");
    c.width = c.height = 128;
    const ctx = c.getContext("2d");
    const g = ctx.createRadialGradient(64, 64, 6, 64, 64, 60);
    g.addColorStop(0, "rgba(200,205,220,0.05)");
    g.addColorStop(0.55, "rgba(200,205,220,0.16)");
    g.addColorStop(0.85, "rgba(200,205,220,0.06)");
    g.addColorStop(1, "rgba(200,205,220,0)");
    ctx.fillStyle = g;
    ctx.beginPath(); ctx.arc(64, 64, 60, 0, Math.PI * 2); ctx.fill();
    return new THREE.CanvasTexture(c);
  }

  const renderer = new THREE.WebGLRenderer({ canvas, alpha: true, antialias: true });
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
  renderer.shadowMap.enabled = true;
  renderer.shadowMap.type = THREE.PCFSoftShadowMap;
  if (renderer.outputColorSpace !== undefined) renderer.outputColorSpace = THREE.SRGBColorSpace;

  const scene = new THREE.Scene();
  scene.fog = new THREE.FogExp2(0x0a0e27, 0.045);

  const camera = new THREE.PerspectiveCamera(42, window.innerWidth / window.innerHeight, 0.1, 100);
  camera.position.set(0.7, 0.9, 6.6);
  camera.lookAt(0, 0.55, 0);

  // ---------- realistic-ish lighting ----------
  const hemi = new THREE.HemisphereLight(0x5a6690, 0x05060c, 0.65);
  scene.add(hemi);
  const key = new THREE.DirectionalLight(0xfff3e6, 1.15);
  key.position.set(3.2, 5.5, 3.5);
  key.castShadow = true;
  key.shadow.mapSize.set(1024, 1024);
  key.shadow.camera.left = -3; key.shadow.camera.right = 3;
  key.shadow.camera.top = 3; key.shadow.camera.bottom = -3;
  key.shadow.camera.near = 1; key.shadow.camera.far = 12;
  key.shadow.radius = 4;
  key.shadow.bias = -0.0025;
  scene.add(key);
  const fill = new THREE.DirectionalLight(0x3d4a7a, 0.35);
  fill.position.set(-4, 2, -2);
  scene.add(fill);
  const kicker = new THREE.PointLight(0xe63946, 0.6, 4);
  kicker.position.set(-0.6, 0.4, 1.1);
  scene.add(kicker);

  // ---------- ground (matte concrete pad, receives shadow) ----------
  const groundTex = noiseTexture(256, 26, 10, 255);
  groundTex.repeat.set(6, 6);
  const ground = new THREE.Mesh(
    new THREE.CircleGeometry(5, 64),
    new THREE.MeshStandardMaterial({ color: 0x0d1226, metalness: 0.15, roughness: 0.92, map: groundTex })
  );
  ground.rotation.x = -Math.PI / 2;
  ground.position.y = -1.4;
  ground.receiveShadow = true;
  scene.add(ground);

  // faint painted landing-pad ring (subtle, not neon)
  const padRing = new THREE.Mesh(
    new THREE.RingGeometry(1.08, 1.12, 64),
    new THREE.MeshBasicMaterial({ color: 0x8a94c0, transparent: true, opacity: 0.18, side: THREE.DoubleSide })
  );
  padRing.rotation.x = -Math.PI / 2;
  padRing.position.y = -1.395;
  scene.add(padRing);

  // ---------- dock box: matte case with rivets and edge trim ----------
  const box = new THREE.Group();
  const caseTex = noiseTexture(256, 22, 14, 255);
  const wallMat = new THREE.MeshStandardMaterial({ color: 0x171b30, metalness: 0.25, roughness: 0.78, map: caseTex });
  const trimMat = new THREE.MeshStandardMaterial({ color: 0x8b1420, metalness: 0.5, roughness: 0.5 });
  const rivetMat = new THREE.MeshStandardMaterial({ color: 0x3a4066, metalness: 0.8, roughness: 0.35 });

  const wallGeo = new THREE.BoxGeometry(1.5, 0.68, 0.06);
  const sideGeo = new THREE.BoxGeometry(0.06, 0.68, 1.5);
  const wF = new THREE.Mesh(wallGeo, wallMat); wF.position.set(0, -0.34, 0.72); wF.castShadow = true; box.add(wF);
  const wB = wF.clone(); wB.position.z = -0.72; box.add(wB);
  const wL = new THREE.Mesh(sideGeo, wallMat); wL.position.set(-0.72, -0.34, 0); wL.castShadow = true; box.add(wL);
  const wR = wL.clone(); wR.position.x = 0.72; box.add(wR);
  const base = new THREE.Mesh(new THREE.BoxGeometry(1.56, 0.06, 1.56), wallMat);
  base.position.y = -0.67;
  base.receiveShadow = true; base.castShadow = true;
  box.add(base);
  const rimTrim = new THREE.Mesh(new THREE.BoxGeometry(1.6, 0.035, 1.6), trimMat);
  rimTrim.position.y = -0.01;
  box.add(rimTrim);

  // corner rivets for a real hardware read
  [[-0.74, 0.74], [0.74, 0.74], [-0.74, -0.74], [0.74, -0.74]].forEach(([x, z]) => {
    const rivet = new THREE.Mesh(new THREE.CylinderGeometry(0.025, 0.025, 0.03, 8), rivetMat);
    rivet.position.set(x, -0.01, z);
    box.add(rivet);
  });

  // soft interior shadow so the box reads as hollow, not a flat frame
  const interiorShade = new THREE.Mesh(
    new THREE.PlaneGeometry(1.36, 1.36),
    new THREE.MeshBasicMaterial({ color: 0x000000, transparent: true, opacity: 0.55 })
  );
  interiorShade.rotation.x = -Math.PI / 2;
  interiorShade.position.y = -0.63;
  box.add(interiorShade);

  scene.add(box);

  // ---------- contact shadow under the drone (fakes AO as it lifts off) ----------
  const contactShadow = new THREE.Mesh(
    new THREE.PlaneGeometry(1, 1),
    new THREE.MeshBasicMaterial({ map: shadowBlobTexture(), transparent: true, depthWrite: false })
  );
  contactShadow.rotation.x = -Math.PI / 2;
  contactShadow.position.y = -1.393;
  scene.add(contactShadow);

  // ---------- quadcopter: matte industrial finish ----------
  const drone = new THREE.Group();
  const carbonTex = noiseTexture(256, 16, 9, 255);
  const bodyMat = new THREE.MeshStandardMaterial({ color: 0x1a1e30, metalness: 0.35, roughness: 0.55, map: carbonTex });
  const accentMat = new THREE.MeshStandardMaterial({ color: 0x9c1c28, metalness: 0.35, roughness: 0.5 });
  const armMat = new THREE.MeshStandardMaterial({ color: 0x22273f, metalness: 0.4, roughness: 0.55 });
  const lensMat = new THREE.MeshStandardMaterial({ color: 0x05070f, metalness: 0.9, roughness: 0.12 });
  const skidMat = new THREE.MeshStandardMaterial({ color: 0x2a2f4a, metalness: 0.6, roughness: 0.4 });

  const body = new THREE.Mesh(new THREE.BoxGeometry(0.58, 0.18, 0.58), bodyMat);
  body.castShadow = true;
  drone.add(body);
  const hatch = new THREE.Mesh(new THREE.BoxGeometry(0.4, 0.03, 0.4), armMat);
  hatch.position.y = 0.1;
  drone.add(hatch);
  const stripe = new THREE.Mesh(new THREE.BoxGeometry(0.6, 0.025, 0.1), accentMat);
  stripe.position.set(0, 0.1, 0.24);
  drone.add(stripe);

  const camPod = new THREE.Mesh(new THREE.SphereGeometry(0.085, 14, 14), armMat);
  camPod.position.set(0, -0.15, 0.17);
  camPod.castShadow = true;
  drone.add(camPod);
  const lens = new THREE.Mesh(new THREE.CylinderGeometry(0.045, 0.045, 0.03, 16), lensMat);
  lens.rotation.x = Math.PI / 2;
  lens.position.set(0, -0.15, 0.25);
  drone.add(lens);

  const antenna = new THREE.Mesh(new THREE.CylinderGeometry(0.007, 0.007, 0.16, 6), skidMat);
  antenna.position.set(-0.12, 0.2, -0.1);
  drone.add(antenna);

  const armOffsets = [[0.58, 0.58], [-0.58, 0.58], [0.58, -0.58], [-0.58, -0.58]];
  const propellers = [];
  const bladeTex = bladeBlurTexture();
  armOffsets.forEach(([x, z]) => {
    const arm = new THREE.Mesh(new THREE.BoxGeometry(0.66, 0.045, 0.065), armMat);
    arm.position.set(x * 0.5, 0, z * 0.5);
    arm.rotation.y = Math.atan2(z, x);
    arm.castShadow = true;
    drone.add(arm);

    const motor = new THREE.Mesh(new THREE.CylinderGeometry(0.055, 0.065, 0.09, 12), armMat);
    motor.position.set(x, 0.06, z);
    motor.castShadow = true;
    drone.add(motor);

    // landing skid
    const skid = new THREE.Mesh(new THREE.CylinderGeometry(0.012, 0.012, 0.32, 6), skidMat);
    skid.position.set(x * 0.72, -0.22, z * 0.72);
    skid.rotation.z = Math.PI / 2 * (x > 0 ? 0.12 : -0.12);
    drone.add(skid);

    // real blades (visible when nearly stationary)
    const propGroup = new THREE.Group();
    propGroup.position.set(x, 0.115, z);
    const blade1 = new THREE.Mesh(new THREE.BoxGeometry(0.36, 0.01, 0.045), armMat);
    const blade2 = blade1.clone();
    blade2.rotation.y = Math.PI / 2;
    propGroup.add(blade1, blade2);
    drone.add(propGroup);

    // motion-blur disc (fades in as spin speed increases)
    const blurDisc = new THREE.Mesh(new THREE.CircleGeometry(0.2, 24), new THREE.MeshBasicMaterial({ map: bladeTex, transparent: true, depthWrite: false }));
    blurDisc.rotation.x = -Math.PI / 2;
    blurDisc.position.set(x, 0.115, z);
    drone.add(blurDisc);

    propellers.push({ group: propGroup, blur: blurDisc });
  });

  drone.position.set(0, -0.55, 0);
  drone.scale.setScalar(0.85);
  scene.add(drone);

  function resize() {
    renderer.setSize(window.innerWidth, window.innerHeight, false);
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
  }
  resize();
  window.addEventListener("resize", resize);

  // ---------- scroll-driven progress (0 -> 1 -> 0 across the section) ----------
  let progress = 0;
  function computeProgress() {
    const rect = section.getBoundingClientRect();
    const total = rect.height - window.innerHeight;
    const scrolled = -rect.top;
    const raw = total > 0 ? scrolled / total : 0;
    const clamped = Math.min(Math.max(raw, 0), 1);
    progress = clamped <= 0.5 ? clamped * 2 : (1 - clamped) * 2;
    if (scrollFill) scrollFill.style.height = Math.round(clamped * 100) + "%";
    copy && copy.classList.toggle("show", clamped > 0.12 && clamped < 0.88);
  }
  window.addEventListener("scroll", computeProgress, { passive: true });
  computeProgress();

  const clock = new THREE.Clock();
  function animate() {
    const t = clock.getElapsedTime();
    const spinSpeed = 0.4 + progress * 2.2;

    propellers.forEach(({ group, blur }) => {
      group.rotation.y += spinSpeed;
      const blurAmount = Math.min(progress * 1.6, 1);
      blur.material.opacity = blurAmount;
      group.visible = blurAmount < 0.6;
    });

    const eased = progress * progress * (3 - 2 * progress); // smoothstep
    const droneY = THREE.MathUtils.lerp(-0.55, 0.95, eased);
    drone.position.y = droneY + (eased > 0.05 ? Math.sin(t * 1.3) * 0.035 * eased : 0);
    drone.scale.setScalar(THREE.MathUtils.lerp(0.7, 1, eased));
    drone.rotation.y = eased * Math.PI * 0.35 + t * 0.12 * eased;

    // contact shadow: shrinks + fades as the drone lifts higher (real AO behavior)
    const lift = Math.max(0, drone.position.y - (-0.55));
    const shadowScale = Math.max(0.28, 0.9 - lift * 0.4);
    contactShadow.scale.set(shadowScale, shadowScale, 1);
    contactShadow.material.opacity = Math.max(0.15, 0.85 - lift * 0.55);

    kicker.intensity = 0.4 + eased * 0.5;

    renderer.render(scene, camera);
    requestAnimationFrame(animate);
  }
  animate();
});