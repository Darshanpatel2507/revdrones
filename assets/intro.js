
// ============================================================
// RevDrones — Intro sequence
// Logo fade-in -> 3D quadcopter rises & flies toward viewer ->
// camera "enters" the drone -> mouse-driven POV look-around ->
// scroll docks it into the sticky nav logo (top-left).
// ============================================================
document.addEventListener("DOMContentLoaded", () => {
  const overlay = document.getElementById("intro-overlay");
  if (!overlay) return;
 
  // Only play the intro once per browser session — revisiting the homepage
  // (nav "Home" link, taskbar/tab switch, back button) shouldn't replay it.
  const ALREADY_PLAYED_KEY = "revdronesIntroPlayed";
  if (sessionStorage.getItem(ALREADY_PLAYED_KEY) === "1") {
    overlay.style.display = "none";
    document.querySelectorAll(".mini-drone").forEach((d) => d.classList.add("show"));
    return;
  }
  sessionStorage.setItem(ALREADY_PLAYED_KEY, "1");
 
  const introLogo = document.getElementById("intro-logo");
  const scrollHint = document.getElementById("intro-scroll-hint");
  const canvas = document.getElementById("intro-canvas");
  const flash = overlay.querySelector(".intro-flash");
  const miniDrones = document.querySelectorAll(".mini-drone");
 
  document.body.classList.add("intro-lock");
 
  let dismissed = false;
  let povReady = false;
 
  function dismissIntro() {
    if (dismissed) return;
    dismissed = true;
    clearTimeout(safetyTimer);
    document.body.classList.remove("intro-lock");
    overlay.classList.add("dismissed");
    miniDrones.forEach((d) => d.classList.add("show"));
    setTimeout(() => { overlay.style.display = "none"; }, 750);
  }
 
  // Safety net: never trap a user on the intro if something goes wrong.
  const safetyTimer = setTimeout(dismissIntro, 10000);
 
  // If three.js failed to load (e.g. offline), skip straight past the 3D bit.
  if (!window.THREE || !canvas) {
    setTimeout(() => introLogo && introLogo.classList.add("show"), 150);
    setTimeout(dismissIntro, 2200);
    return;
  }
 
  setTimeout(() => introLogo.classList.add("show"), 150);
 
  // ---------- three.js scene ----------
  const renderer = new THREE.WebGLRenderer({ canvas, alpha: true, antialias: true });
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
 
  const scene = new THREE.Scene();
  scene.fog = new THREE.FogExp2(0x0a0e27, 0.045);
 
  const camera = new THREE.PerspectiveCamera(48, window.innerWidth / window.innerHeight, 0.1, 200);
  camera.position.set(0, 0.6, 6.5);
 
  scene.add(new THREE.AmbientLight(0x8a94c0, 0.9));
  const keyLight = new THREE.DirectionalLight(0xffffff, 0.9);
  keyLight.position.set(3, 5, 4);
  scene.add(keyLight);
  const rimLight = new THREE.DirectionalLight(0xe63946, 0.6);
  rimLight.position.set(-4, 2, -3);
  scene.add(rimLight);
 
  const grid = new THREE.GridHelper(80, 44, 0xe63946, 0x1a2242);
  grid.position.y = -1.8;
  grid.material.transparent = true;
  grid.material.opacity = 0.35;
  scene.add(grid);
 
  function resize() {
    renderer.setSize(window.innerWidth, window.innerHeight, false);
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
  }
  resize();
  window.addEventListener("resize", resize);
 
  // ---------- build a procedural quadcopter ----------
  const drone = new THREE.Group();
  const bodyMat = new THREE.MeshStandardMaterial({ color: 0x12162e, metalness: 0.4, roughness: 0.45 });
  const accentMat = new THREE.MeshStandardMaterial({ color: 0xe63946, metalness: 0.3, roughness: 0.4 });
  const armMat = new THREE.MeshStandardMaterial({ color: 0x1c2140, metalness: 0.5, roughness: 0.4 });
  const propMat = new THREE.MeshStandardMaterial({ color: 0x2b3358, metalness: 0.2, roughness: 0.6, transparent: true, opacity: 0.75 });
 
  const body = new THREE.Mesh(new THREE.BoxGeometry(0.5, 0.16, 0.5), bodyMat);
  drone.add(body);
  const stripe = new THREE.Mesh(new THREE.BoxGeometry(0.52, 0.04, 0.14), accentMat);
  stripe.position.y = 0.09;
  drone.add(stripe);
 
  // camera pod underneath — this is where the POV "enters"
  const camPod = new THREE.Mesh(new THREE.SphereGeometry(0.09, 12, 12), accentMat);
  camPod.position.set(0, -0.14, 0.16);
  drone.add(camPod);
  const lens = new THREE.Mesh(new THREE.CylinderGeometry(0.045, 0.045, 0.03, 12), new THREE.MeshStandardMaterial({ color: 0x0a0e27, metalness: 0.8, roughness: 0.2 }));
  lens.rotation.x = Math.PI / 2;
  lens.position.set(0, -0.14, 0.23);
  drone.add(lens);
 
  const armOffsets = [[0.55, 0.55], [-0.55, 0.55], [0.55, -0.55], [-0.55, -0.55]];
  const propellers = [];
  armOffsets.forEach(([x, z]) => {
    const arm = new THREE.Mesh(new THREE.BoxGeometry(0.62, 0.05, 0.07), armMat);
    arm.position.set(x * 0.5, 0, z * 0.5);
    arm.rotation.y = Math.atan2(z, x);
    drone.add(arm);
 
    const motor = new THREE.Mesh(new THREE.CylinderGeometry(0.06, 0.07, 0.09, 10), armMat);
    motor.position.set(x, 0.05, z);
    drone.add(motor);
 
    const propGroup = new THREE.Group();
    propGroup.position.set(x, 0.11, z);
    const blade1 = new THREE.Mesh(new THREE.BoxGeometry(0.34, 0.012, 0.045), propMat);
    const blade2 = blade1.clone();
    blade2.rotation.y = Math.PI / 2;
    propGroup.add(blade1, blade2);
    drone.add(propGroup);
    propellers.push(propGroup);
  });
 
  drone.position.set(-3.2, -0.35, -3.2);
  drone.scale.setScalar(0.1);
  scene.add(drone);
 
  // ---------- mouse tracking (used for POV look-around) ----------
  let mouseX = 0, mouseY = 0;
  window.addEventListener("mousemove", (e) => {
    mouseX = (e.clientX / window.innerWidth) * 2 - 1;
    mouseY = (e.clientY / window.innerHeight) * 2 - 1;
  });
 
  // ---------- timeline ----------
  const RISE_START = 1300, RISE_END = 2700, DOLLY_START = 2700, DOLLY_END = 3150;
  let flashedAt = null;
  const clock = new THREE.Clock();
 
  function ease(t) { return 1 - Math.pow(1 - t, 3); }
 
  setTimeout(() => introLogo.classList.add("fade-out"), RISE_START);
 
  function triggerFlash() {
    flash.style.transition = "opacity .12s ease";
    flash.style.opacity = "0.9";
    setTimeout(() => { flash.style.opacity = "0"; }, 130);
  }
 
  function enterPOV() {
    povReady = true;
    drone.visible = false;
    setTimeout(dismissIntro, 900);
  }
 
  function animate() {
    const elapsed = clock.getElapsedTime() * 1000;
 
    propellers.forEach((p) => { p.rotation.y += 1.35; });
 
    if (elapsed < RISE_START) {
      // distant flyby across the horizon — the loader reads as "a moving drone" from frame one
      const p = Math.min(Math.max(elapsed / RISE_START, 0), 1);
      drone.visible = true;
      drone.position.x = THREE.MathUtils.lerp(-3.2, 1.4, p);
      drone.position.y = -0.35 + Math.sin(elapsed / 260) * 0.06;
      drone.position.z = -3.2;
      drone.scale.setScalar(0.1);
      drone.rotation.y = -0.5;
    } else if (elapsed < RISE_END) {
      const p = Math.min(Math.max((elapsed - RISE_START) / (RISE_END - RISE_START), 0), 1);
      const e = ease(p);
      drone.visible = true;
      drone.position.x = THREE.MathUtils.lerp(1.4, 0, e);
      drone.position.y = THREE.MathUtils.lerp(-0.35, 0.15, e);
      drone.position.z = THREE.MathUtils.lerp(-3.2, 2.4, e);
      drone.scale.setScalar(THREE.MathUtils.lerp(0.1, 1, e));
      drone.rotation.y = THREE.MathUtils.lerp(-0.5, 0, e) + Math.sin(elapsed / 600) * 0.1;
    } else if (elapsed < DOLLY_END) {
      const p = Math.min(Math.max((elapsed - DOLLY_START) / (DOLLY_END - DOLLY_START), 0), 1);
      camera.position.z = THREE.MathUtils.lerp(6.5, 0.35, p);
      camera.position.y = THREE.MathUtils.lerp(0.6, 0.05, p);
      drone.visible = p < 0.88;
      if (p > 0.82 && !flashedAt) { flashedAt = elapsed; triggerFlash(); }
    } else {
      if (!povReady) enterPOV();
      camera.rotation.y += (mouseX * 0.55 - camera.rotation.y) * 0.045;
      camera.rotation.x += (-mouseY * 0.3 - camera.rotation.x) * 0.045;
      camera.position.y = 0.05 + Math.sin(elapsed / 900) * 0.035;
    }
 
    renderer.render(scene, camera);
    if (!dismissed) requestAnimationFrame(animate);
  }
  animate();
 
  setupDismissTriggers();
 
  function setupDismissTriggers() {
    function tryDismiss() {
      if (povReady) dismissIntro();
    }
    window.addEventListener("wheel", tryDismiss, { passive: true });
    window.addEventListener("touchmove", tryDismiss, { passive: true });
    window.addEventListener("keydown", (e) => {
      if (e.key === "ArrowDown" || e.key === "PageDown" || e.key === " ") tryDismiss();
    });
  }
});
 


