// ============================================================
// RevDrones — Interactive 3D Exploded / Dismantling Drone (Three.js)
// Features:
// - Default: Assembled quadcopter drone hovering smoothly with spinning props.
// - On Cursor Hover: Smoothly dismantles / explodes into 7 internal sub-systems
//   (Canopy, AI Avionics Core, Chassis, Battery Pack, 4K Gimbal, 4 Carbon Arms & Motors).
// - Each dismantled part hovers suspended in 3D space with independent floating physics.
// - On Mouse Leave: Smoothly reconstructs back into the solid assembled drone.
// - Full Mouse Parallax: Interactive 3D rotation to inspect the CAD model from all angles.
// ============================================================
document.addEventListener("DOMContentLoaded", () => {
  const canvas = document.getElementById("hero3d");
  const panel = document.getElementById("flight-panel");
  if (!canvas || !panel || !window.THREE || window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

  try {
    const renderer = new THREE.WebGLRenderer({ canvas, alpha: true, antialias: true });
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));

    const scene = new THREE.Scene();
    scene.fog = new THREE.FogExp2(0x0a0e27, 0.09);

    const camera = new THREE.PerspectiveCamera(42, 1, 0.1, 100);
    camera.position.set(0, 0.25, 5.2);

    // ---------- Lighting ----------
    scene.add(new THREE.AmbientLight(0x94a3d4, 0.9));
    const keyLight = new THREE.DirectionalLight(0xffffff, 1.1);
    keyLight.position.set(4, 6, 4);
    scene.add(keyLight);
    const rimLight = new THREE.DirectionalLight(0xe63946, 0.9);
    rimLight.position.set(-4, 2, -3);
    scene.add(rimLight);

    // Faint Ground Grid
    const grid = new THREE.GridHelper(40, 24, 0xe63946, 0x1a2242);
    grid.position.y = -1.7;
    grid.material.transparent = true;
    grid.material.opacity = 0.28;
    scene.add(grid);

    // Ambient Star / Particle Field
    const starGeo = new THREE.BufferGeometry();
    const starCount = 90;
    const starPos = new Float32Array(starCount * 3);
    for (let i = 0; i < starCount; i++) {
      const r = 3.5 + Math.random() * 2.5;
      const theta = Math.random() * Math.PI * 2;
      const phi = Math.acos(2 * Math.random() - 1);
      starPos[i * 3] = r * Math.sin(phi) * Math.cos(theta);
      starPos[i * 3 + 1] = r * Math.sin(phi) * Math.sin(theta);
      starPos[i * 3 + 2] = r * Math.cos(phi);
    }
    starGeo.setAttribute("position", new THREE.BufferAttribute(starPos, 3));
    const starMat = new THREE.PointsMaterial({ color: 0x6b7396, size: 0.03, transparent: true, opacity: 0.55 });
    scene.add(new THREE.Points(starGeo, starMat));

    // ---------- Materials ----------
    const carbonChassisMat = new THREE.MeshStandardMaterial({ color: 0x0e1326, metalness: 0.85, roughness: 0.25 });
    const aeroCanopyMat = new THREE.MeshStandardMaterial({ color: 0x161c38, metalness: 0.7, roughness: 0.3 });
    const crimsonStripeMat = new THREE.MeshStandardMaterial({ color: 0xe63946, roughness: 0.25, emissive: 0x9e131d, emissiveIntensity: 0.65 });
    const titaniumArmMat = new THREE.MeshStandardMaterial({ color: 0x4a5578, metalness: 0.9, roughness: 0.2 });
    const motorHousingMat = new THREE.MeshStandardMaterial({ color: 0x11162b, metalness: 0.85, roughness: 0.3 });
    const motorCopperMat = new THREE.MeshStandardMaterial({ color: 0xd97706, metalness: 0.9, roughness: 0.3 });
    const propMat = new THREE.MeshStandardMaterial({ color: 0xdde3f5, metalness: 0.4, roughness: 0.4, transparent: true, opacity: 0.85 });
    const pcbGreenMat = new THREE.MeshStandardMaterial({ color: 0x064e3b, roughness: 0.4, metalness: 0.6, emissive: 0x047857, emissiveIntensity: 0.25 });
    const goldCircuitMat = new THREE.MeshStandardMaterial({ color: 0xfbbf24, metalness: 0.95, roughness: 0.1 });
    const lensGlassMat = new THREE.MeshStandardMaterial({ color: 0x030712, metalness: 0.95, roughness: 0.05, emissive: 0x00e1ff, emissiveIntensity: 0.4 });
    const batteryMat = new THREE.MeshStandardMaterial({ color: 0x1f293d, metalness: 0.6, roughness: 0.4 });

    // ---------- Root Drone Group ----------
    const drone = new THREE.Group();

    // 1. Top Aero Canopy / Shell
    const canopy = new THREE.Group();
    canopy.position.set(0, 0.12, 0);
    const canopyMesh = new THREE.Mesh(new THREE.BoxGeometry(0.72, 0.12, 0.72), aeroCanopyMat);
    canopy.add(canopyMesh);
    const stripeMesh = new THREE.Mesh(new THREE.BoxGeometry(0.74, 0.04, 0.22), crimsonStripeMat);
    stripeMesh.position.y = 0.07;
    canopy.add(stripeMesh);
    const badgeMesh = new THREE.Mesh(new THREE.CylinderGeometry(0.06, 0.06, 0.02, 16), new THREE.MeshBasicMaterial({ color: 0xffffff }));
    badgeMesh.position.set(0, 0.09, 0.12);
    canopy.add(badgeMesh);
    const gpsMast = new THREE.Mesh(new THREE.CylinderGeometry(0.08, 0.08, 0.04, 16), new THREE.MeshStandardMaterial({ color: 0x0a0e27, metalness: 0.9 }));
    gpsMast.position.set(0, 0.12, -0.2);
    canopy.add(gpsMast);
    drone.add(canopy);

    // 2. Avionics Motherboard / AI Core
    const avionics = new THREE.Group();
    avionics.position.set(0, 0.04, 0);
    const pcbMesh = new THREE.Mesh(new THREE.BoxGeometry(0.56, 0.03, 0.56), pcbGreenMat);
    avionics.add(pcbMesh);
    const cpuMesh = new THREE.Mesh(new THREE.BoxGeometry(0.18, 0.03, 0.18), carbonChassisMat);
    cpuMesh.position.y = 0.025;
    avionics.add(cpuMesh);
    const trace1 = new THREE.Mesh(new THREE.BoxGeometry(0.1, 0.015, 0.1), goldCircuitMat);
    trace1.position.set(0.12, 0.02, 0.12);
    avionics.add(trace1);
    const trace2 = new THREE.Mesh(new THREE.BoxGeometry(0.1, 0.015, 0.1), goldCircuitMat);
    trace2.position.set(-0.12, 0.02, -0.12);
    avionics.add(trace2);
    const pcbLight1 = new THREE.PointLight(0x10b981, 1.5, 2);
    pcbLight1.position.set(0.18, 0.05, 0.18);
    avionics.add(pcbLight1);
    const pcbLight2 = new THREE.PointLight(0xe63946, 1.2, 2);
    pcbLight2.position.set(-0.18, 0.05, -0.18);
    avionics.add(pcbLight2);
    drone.add(avionics);

    // 3. Main Chassis Base
    const chassis = new THREE.Group();
    chassis.position.set(0, 0, 0);
    const chassisMesh = new THREE.Mesh(new THREE.BoxGeometry(0.68, 0.08, 0.68), carbonChassisMat);
    chassis.add(chassisMesh);
    const heatSinkF = new THREE.Mesh(new THREE.BoxGeometry(0.4, 0.04, 0.06), titaniumArmMat);
    heatSinkF.position.set(0, 0, 0.28);
    chassis.add(heatSinkF);
    const heatSinkB = new THREE.Mesh(new THREE.BoxGeometry(0.4, 0.04, 0.06), titaniumArmMat);
    heatSinkB.position.set(0, 0, -0.28);
    chassis.add(heatSinkB);
    drone.add(chassis);

    // 4. Modular 6S Battery Pack
    const battery = new THREE.Group();
    battery.position.set(0, -0.06, -0.05);
    const batteryMesh = new THREE.Mesh(new THREE.BoxGeometry(0.48, 0.16, 0.54), batteryMat);
    battery.add(batteryMesh);
    const batLed = new THREE.Mesh(new THREE.BoxGeometry(0.26, 0.04, 0.02), new THREE.MeshBasicMaterial({ color: 0x00e1ff }));
    batLed.position.set(0, 0, -0.28);
    battery.add(batLed);
    drone.add(battery);

    // 5. 3-Axis 4K Gimbal & LiDAR Sensor Pod
    const gimbal = new THREE.Group();
    gimbal.position.set(0, -0.16, 0.22);
    const yokeBracket = new THREE.Mesh(new THREE.CylinderGeometry(0.025, 0.025, 0.12, 10), titaniumArmMat);
    yokeBracket.rotation.x = Math.PI / 2;
    yokeBracket.position.y = 0.04;
    gimbal.add(yokeBracket);
    const camSphere = new THREE.Mesh(new THREE.SphereGeometry(0.12, 16, 16), crimsonStripeMat);
    gimbal.add(camSphere);
    const lensTube = new THREE.Mesh(new THREE.CylinderGeometry(0.06, 0.06, 0.08, 16), lensGlassMat);
    lensTube.rotation.x = Math.PI / 2;
    lensTube.position.set(0, 0, 0.12);
    gimbal.add(lensTube);
    drone.add(gimbal);

    // 6. Landing Skids
    const landingSkids = new THREE.Group();
    landingSkids.position.set(0, -0.22, 0);
    const skidL = new THREE.Mesh(new THREE.CylinderGeometry(0.025, 0.025, 0.72, 8), titaniumArmMat);
    skidL.rotation.x = Math.PI / 2;
    skidL.position.set(-0.32, -0.1, 0);
    landingSkids.add(skidL);
    const skidR = new THREE.Mesh(new THREE.CylinderGeometry(0.025, 0.025, 0.72, 8), titaniumArmMat);
    skidR.rotation.x = Math.PI / 2;
    skidR.position.set(0.32, -0.1, 0);
    landingSkids.add(skidR);
    drone.add(landingSkids);

    // 7. 4 Carbon Rotor Arms, Motors & Propellers
    const armAngles = [
      [0.72, 0.72],
      [-0.72, 0.72],
      [0.72, -0.72],
      [-0.72, -0.72],
    ];
    const armGroups = [];
    const propGroups = [];

    armAngles.forEach(([x, z], i) => {
      const armG = new THREE.Group();
      armG.position.set(x * 0.5, 0, z * 0.5);

      const armTube = new THREE.Mesh(new THREE.BoxGeometry(0.72, 0.045, 0.075), titaniumArmMat);
      armTube.position.set(x * 0.28, 0, z * 0.28);
      armTube.rotation.y = Math.atan2(z, x);
      armG.add(armTube);

      const motorH = new THREE.Mesh(new THREE.CylinderGeometry(0.075, 0.085, 0.12, 12), motorHousingMat);
      motorH.position.set(x * 0.58, 0.06, z * 0.58);
      armG.add(motorH);

      const motorC = new THREE.Mesh(new THREE.CylinderGeometry(0.06, 0.06, 0.08, 12), motorCopperMat);
      motorC.position.set(x * 0.58, 0.07, z * 0.58);
      armG.add(motorC);

      const navLight = new THREE.PointLight(z > 0 ? 0xe63946 : 0x00e1ff, 0.9, 3);
      navLight.position.set(x * 0.58, 0.02, z * 0.58);
      armG.add(navLight);

      const propG = new THREE.Group();
      propG.position.set(x * 0.58, 0.14, z * 0.58);
      const spinner = new THREE.Mesh(new THREE.ConeGeometry(0.035, 0.06, 12), titaniumArmMat);
      spinner.position.y = 0.02;
      propG.add(spinner);
      const b1 = new THREE.Mesh(new THREE.BoxGeometry(0.48, 0.012, 0.06), propMat);
      const b2 = b1.clone();
      b2.rotation.y = Math.PI / 2;
      propG.add(b1, b2);
      armG.add(propG);

      drone.add(armG);
      armGroups.push(armG);
      propGroups.push(propG);
    });

    scene.add(drone);

    // ---------- Resize ----------
    function resize() {
      const w = panel.clientWidth, h = panel.clientHeight;
      renderer.setSize(w, h, false);
      camera.aspect = w / h;
      camera.updateProjectionMatrix();
    }
    resize();
    window.addEventListener("resize", resize);

    // ---------- Interactive Hover & Parallax Tracking ----------
    let isHovered = false;
    let dismantleFactor = 0;
    let mx = 0, my = 0, tmx = 0, tmy = 0;

    const hudLabel = panel.querySelector(".hud-label");

    panel.addEventListener("mouseenter", () => {
      isHovered = true;
      if (hudLabel) hudLabel.textContent = "CAD EXPLODED VIEW: 7 SUB-SYSTEMS DISMANTLED";
    });

    panel.addEventListener("mouseleave", () => {
      isHovered = false;
      tmx = 0;
      tmy = 0;
      if (hudLabel) hudLabel.textContent = "HOVER ON DRONE TO DISMANTLE";
    });

    panel.addEventListener("mousemove", (e) => {
      const r = panel.getBoundingClientRect();
      tmx = ((e.clientX - r.left) / r.width) * 2 - 1;
      tmy = ((e.clientY - r.top) / r.height) * 2 - 1;
    });

    // ---------- Render Animation Loop ----------
    const clock = new THREE.Clock();
    function animate() {
      requestAnimationFrame(animate);
      const t = clock.getElapsedTime();
      const dt = clock.getDelta();

      // Smooth dismantle interpolation
      const targetF = isHovered ? 1.0 : 0.0;
      dismantleFactor += (targetF - dismantleFactor) * 0.08;
      const f = dismantleFactor;

      // Mouse Parallax Damping
      mx += (tmx - mx) * 0.08;
      my += (tmy - my) * 0.08;

      // Drone Hover Bobbing
      drone.position.y = Math.sin(t * 1.6) * 0.08;
      drone.position.x = Math.sin(t * 0.6) * 0.05;

      // 3D Parallax Rotation
      const targetRotY = mx * 0.75 + (f > 0.1 ? 0.2 : 0);
      const targetRotX = -my * 0.45 + Math.sin(t * 0.8) * 0.03;
      const targetRotZ = mx * -0.15;
      drone.rotation.y += (targetRotY - drone.rotation.y) * 0.08;
      drone.rotation.x += (targetRotX - drone.rotation.x) * 0.08;
      drone.rotation.z += (targetRotZ - drone.rotation.z) * 0.08;

      // Spin Propellers
      propGroups.forEach((p, idx) => {
        p.rotation.y += (idx % 2 === 0 ? 1 : -1) * (f > 0.01 ? 0.08 : 0.14);
      });

      // 1. Top Aero Canopy
      const bobCanopy = Math.sin(t * 2.2 + 0.5) * 0.02 * f;
      canopy.position.y = 0.12 + f * 0.95 + bobCanopy;
      canopy.position.z = f * -0.1;
      canopy.rotation.x = f * -0.15;

      // 2. Avionics Motherboard
      const bobAvionics = Math.sin(t * 2.5 + 1.0) * 0.015 * f;
      avionics.position.y = 0.04 + f * 0.45 + bobAvionics;

      // 3. Main Chassis
      chassis.position.y = Math.sin(t * 1.8) * 0.01 * f;

      // 4. Battery Pack
      const bobBattery = Math.sin(t * 2.0 + 1.5) * 0.015 * f;
      battery.position.y = -0.06 - f * 0.38 + bobBattery;
      battery.position.z = -0.05 - f * 0.35;

      // 5. Gimbal 4K Camera Pod
      const bobGimbal = Math.sin(t * 2.4 + 2.0) * 0.02 * f;
      gimbal.position.y = -0.16 - f * 0.72 + bobGimbal;
      gimbal.position.z = 0.22 + f * 0.42;
      gimbal.rotation.x = f * 0.25;

      // 6. Landing Skids
      landingSkids.position.y = -0.22 - f * 0.55;

      // 7. 4 Rotor Arms & Propellers
      armGroups.forEach((arm, i) => {
        const [baseX, baseZ] = armAngles[i];
        const expandDist = 1.0 + f * 0.75;
        const armBob = Math.sin(t * 2.1 + i * 1.2) * 0.02 * f;
        arm.position.x = baseX * 0.5 * expandDist;
        arm.position.z = baseZ * 0.5 * expandDist;
        arm.position.y = armBob;
      });

      propGroups.forEach((prop) => {
        prop.position.y = 0.14 + f * 0.32;
      });

      renderer.render(scene, camera);
    }
    animate();

  } catch (err) {
    console.warn("3D hero scene unavailable:", err);
  }
});
