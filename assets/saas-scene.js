// ============================================================
// RevDrones — High-Tech Interactive 3D SaaS Sector Scenes (Three.js)
// 1. Wind: Prominent wind turbine with spinning aerodynamic blades & drone orbiting around it
// 2. Solar: High-contrast, sharp photovoltaic solar farm array
// 3. Powerline: Steel lattice transmission towers with sagging catenary conductor wires
// 4. Pipeline: Clear, elevated industrial pipeline shifted right of hero text
// ============================================================
document.addEventListener("DOMContentLoaded", () => {
  const canvas = document.getElementById("saas-scene");
  if (!canvas || !window.THREE || window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

  const sceneType = canvas.dataset.scene || "wind";

  try {
    const container = canvas.parentElement;
    const renderer = new THREE.WebGLRenderer({ canvas, alpha: true, antialias: true });
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.shadowMap.enabled = false;

    const scene = new THREE.Scene();
    scene.fog = new THREE.Fog(0x080b1c, 45, 170);

    const camera = new THREE.PerspectiveCamera(46, 1, 0.5, 500);
    camera.position.set(0, 14, 52);
    camera.lookAt(8, 5, -4);
    const camHome = camera.position.clone();

    // ---------- Lighting ----------
    const ambientLight = new THREE.AmbientLight(0x94a3d4, 0.75);
    scene.add(ambientLight);
    const key = new THREE.DirectionalLight(0xffffff, 0.9);
    key.position.set(35, 50, 25);
    scene.add(key);
    const rim = new THREE.DirectionalLight(0xe63946, 1.2);
    rim.position.set(-20, 15, -25);
    scene.add(rim);

    // ---------- Ground Grid Floor ----------
    const grid = new THREE.GridHelper(400, 45, 0x2e386b, 0x141a38);
    grid.position.y = -1.98;
    scene.add(grid);

    // ---------- Materials ----------
    const steelMat = new THREE.MeshStandardMaterial({ color: 0xd0d7eb, roughness: 0.3, metalness: 0.8 });
    const darkSteelMat = new THREE.MeshStandardMaterial({ color: 0x1c233d, roughness: 0.5, metalness: 0.6 });
    const turbineWhiteMat = new THREE.MeshStandardMaterial({ color: 0xf5f7ff, roughness: 0.2, metalness: 0.25 });
    const droneBodyMat = new THREE.MeshStandardMaterial({ color: 0x14182a, roughness: 0.35, metalness: 0.6 });
    const redAccentMat = new THREE.MeshStandardMaterial({ color: 0xe63946, roughness: 0.3, emissive: 0x8a121c, emissiveIntensity: 0.6 });
    const solarFrameMat = new THREE.MeshStandardMaterial({ color: 0xe2e8f5, roughness: 0.25, metalness: 0.85 });
    const solarCellMat = new THREE.MeshStandardMaterial({ color: 0x0a1c4a, roughness: 0.08, metalness: 0.9, emissive: 0x0e245c, emissiveIntensity: 0.45 });
    const solarHotspotMat = new THREE.MeshStandardMaterial({ color: 0xff3b30, roughness: 0.2, emissive: 0xff2a1c, emissiveIntensity: 0.9 });
    const cableMat = new THREE.LineBasicMaterial({ color: 0x93a4c8, linewidth: 2 });

    // ---------- 3D Autonomous Inspection Drone ----------
    const drone = new THREE.Group();
    const body = new THREE.Mesh(new THREE.BoxGeometry(1.2, 0.32, 1.2), droneBodyMat);
    drone.add(body);
    const stripe = new THREE.Mesh(new THREE.BoxGeometry(1.22, 0.06, 0.35), redAccentMat);
    stripe.position.y = 0.18;
    drone.add(stripe);
    const lens = new THREE.Mesh(new THREE.SphereGeometry(0.16, 12, 12), new THREE.MeshStandardMaterial({ color: 0x05070f, metalness: 0.9 }));
    lens.position.set(0, -0.2, 0.5);
    drone.add(lens);

    // Downward LiDAR Laser Scan Cone
    const scanConeGeo = new THREE.CylinderGeometry(2.6, 0.1, 6.5, 16, 1, true);
    const scanConeMat = new THREE.MeshBasicMaterial({ color: 0x00e1ff, transparent: true, opacity: 0.25, side: THREE.DoubleSide });
    const scanCone = new THREE.Mesh(scanConeGeo, scanConeMat);
    scanCone.position.set(0, -3.2, 0);
    scanCone.rotation.z = Math.PI;
    drone.add(scanCone);

    drone.propellers = [];
    const armOffsets = [[0.75, 0.75], [-0.75, 0.75], [0.75, -0.75], [-0.75, -0.75]];
    armOffsets.forEach(([x, z]) => {
      const arm = new THREE.Mesh(new THREE.CylinderGeometry(0.04, 0.04, 1.5, 6), steelMat);
      arm.rotation.z = Math.PI / 2;
      arm.position.set(x * 0.5, 0.05, z * 0.5);
      arm.rotation.y = Math.atan2(z, x);
      drone.add(arm);

      const motor = new THREE.Mesh(new THREE.CylinderGeometry(0.12, 0.12, 0.14, 8), darkSteelMat);
      motor.position.set(x, 0.08, z);
      drone.add(motor);

      const prop = new THREE.Mesh(new THREE.BoxGeometry(0.7, 0.02, 0.08), steelMat);
      prop.position.set(x, 0.18, z);
      drone.add(prop);
      drone.propellers.push(prop);

      const light = new THREE.PointLight(0xe63946, 0.9, 4);
      light.position.set(x, 0.05, z);
      drone.add(light);
    });
    scene.add(drone);

    // ---------- Holographic AI Defect Markers ----------
    const defectMarkers = [];
    function createDefectMarker(x, y, z, label) {
      const g = new THREE.Group();
      g.position.set(x, y, z);
      const ring = new THREE.Mesh(
        new THREE.RingGeometry(0.75, 0.9, 16),
        new THREE.MeshBasicMaterial({ color: 0xe63946, side: THREE.DoubleSide, transparent: true, opacity: 0.85 })
      );
      g.add(ring);
      const core = new THREE.Mesh(new THREE.SphereGeometry(0.18, 12, 12), new THREE.MeshBasicMaterial({ color: 0xff4d5a }));
      g.add(core);
      const light = new THREE.PointLight(0xe63946, 1.4, 6);
      g.add(light);
      g.userData.ring = ring;
      scene.add(g);
      defectMarkers.push(g);
      return g;
    }

    let flightPath;

    // ==========================================
    // 1. WIND SECTOR: High-Detail Turbine & Drone Orbit
    // ==========================================
    if (sceneType === "wind") {
      const tg = new THREE.Group();
      tg.position.set(10, -2, -5);

      const tower = new THREE.Mesh(new THREE.CylinderGeometry(0.38, 0.72, 19, 20), turbineWhiteMat);
      tower.position.y = 9.5;
      tg.add(tower);

      const nacelle = new THREE.Mesh(new THREE.BoxGeometry(2.6, 1.2, 1.2), turbineWhiteMat);
      nacelle.position.y = 19;
      tg.add(nacelle);

      const beacon = new THREE.PointLight(0xe63946, 2.2, 12);
      beacon.position.set(0, 19.8, 0);
      tg.add(beacon);

      const hub = new THREE.Group();
      hub.position.set(1.4, 19, 0);

      const noseCone = new THREE.Mesh(new THREE.ConeGeometry(0.65, 1.1, 16), turbineWhiteMat);
      noseCone.rotation.z = -Math.PI / 2;
      hub.add(noseCone);

      for (let i = 0; i < 3; i++) {
        const blade = new THREE.Mesh(new THREE.BoxGeometry(0.26, 9.6, 0.55), turbineWhiteMat);
        blade.position.y = 4.8;
        const pivot = new THREE.Group();
        pivot.add(blade);
        pivot.rotation.z = (i * Math.PI * 2) / 3;
        hub.add(pivot);
      }
      tg.add(hub);
      scene.userData.mainHub = hub;
      scene.add(tg);

      // Background Turbine
      const bgTg = new THREE.Group();
      bgTg.position.set(32, -2, -28);
      const bgTower = new THREE.Mesh(new THREE.CylinderGeometry(0.3, 0.6, 18, 16), steelMat);
      bgTower.position.y = 9;
      bgTg.add(bgTower);
      const bgHub = new THREE.Group();
      bgHub.position.set(1.2, 18, 0);
      for (let i = 0; i < 3; i++) {
        const b = new THREE.Mesh(new THREE.BoxGeometry(0.2, 8.4, 0.45), steelMat);
        b.position.y = 4.2;
        const p = new THREE.Group();
        p.add(b);
        p.rotation.z = (i * Math.PI * 2) / 3;
        bgHub.add(p);
      }
      bgTg.add(bgHub);
      scene.userData.bgHub = bgHub;
      scene.add(bgTg);

      createDefectMarker(11.5, 23.5, -4.5, "Blade Delamination - 18mm");
      createDefectMarker(9.2, 14.0, -4.8, "Tower Base Stress");

      // Drone orbits around the wind turbine
      flightPath = (t) => {
        const angle = t * Math.PI * 2;
        return new THREE.Vector3(
          10 + Math.cos(angle) * 13,
          18 + Math.sin(angle * 2) * 2.5,
          -5 + Math.sin(angle) * 11
        );
      };

    // ==========================================
    // 2. SOLAR SECTOR: Crisp, Clear Solar Panel Array
    // ==========================================
    } else if (sceneType === "solar") {
      const rows = 4, cols = 5;
      for (let r = 0; r < rows; r++) {
        for (let c = 0; c < cols; c++) {
          const px = 4 + c * 5.5;
          const pz = -18 + r * 5.2;
          const isHotspot = r === 1 && c === 2;

          const pg = new THREE.Group();
          pg.position.set(px, -2, pz);

          const frame = new THREE.Mesh(new THREE.BoxGeometry(4.8, 0.14, 2.6), solarFrameMat);
          frame.position.y = 1.1;
          frame.rotation.x = -0.35;
          pg.add(frame);

          const cell = new THREE.Mesh(new THREE.BoxGeometry(4.5, 0.06, 2.3), isHotspot ? solarHotspotMat : solarCellMat);
          cell.position.y = 1.2;
          cell.position.z = 0.1;
          cell.rotation.x = -0.35;
          pg.add(cell);

          const legA = new THREE.Mesh(new THREE.CylinderGeometry(0.05, 0.05, 1.1, 6), steelMat);
          legA.position.set(-1.8, 0.55, 0);
          pg.add(legA);
          const legB = new THREE.Mesh(new THREE.CylinderGeometry(0.05, 0.05, 1.1, 6), steelMat);
          legB.position.set(1.8, 0.55, 0);
          pg.add(legB);

          scene.add(pg);
        }
      }

      createDefectMarker(15.0, 1.6, -12.5, "Thermal String Hotspot +16.4°C");

      flightPath = (t) => {
        const angle = t * Math.PI * 2;
        return new THREE.Vector3(
          15 + Math.cos(angle) * 12,
          8.5 + Math.sin(angle * 2) * 1.2,
          -8 + Math.sin(angle) * 10
        );
      };

    // ==========================================
    // 3. POWERLINE SECTOR: Steel Lattice Transmission Towers
    // ==========================================
    } else if (sceneType === "powerline") {
      const towers = [6, 32];
      towers.forEach((tx) => {
        const tg = new THREE.Group();
        tg.position.set(tx, -2, 0);

        // 4-Legged Lattice Tower
        const mast = new THREE.Mesh(new THREE.CylinderGeometry(0.5, 2.4, 19, 4), steelMat);
        mast.position.y = 9.5;
        tg.add(mast);

        const upperArm = new THREE.Mesh(new THREE.BoxGeometry(0.5, 0.5, 9.5), steelMat);
        upperArm.position.y = 15.5;
        tg.add(upperArm);

        const lowerArm = new THREE.Mesh(new THREE.BoxGeometry(0.5, 0.4, 7.5), steelMat);
        lowerArm.position.y = 12.5;
        tg.add(lowerArm);

        const peak = new THREE.Mesh(new THREE.ConeGeometry(0.3, 2.5, 4), steelMat);
        peak.position.y = 20.0;
        tg.add(peak);

        const ins1 = new THREE.Mesh(new THREE.CylinderGeometry(0.08, 0.08, 1.6, 6), darkSteelMat);
        ins1.position.set(0, 14.5, -2.5);
        tg.add(ins1);

        const ins2 = new THREE.Mesh(new THREE.CylinderGeometry(0.08, 0.08, 1.6, 6), darkSteelMat);
        ins2.position.set(0, 14.5, 2.5);
        tg.add(ins2);

        scene.add(tg);
      });

      const p1 = [], p2 = [];
      for (let i = 0; i <= 30; i++) {
        const t = i / 30;
        const x = -8 + t * 48;
        const y = 12.5 + Math.sin(t * Math.PI) * -3.4;
        p1.push(new THREE.Vector3(x, y, -2.5));
        p2.push(new THREE.Vector3(x, y, 2.5));
      }
      scene.add(new THREE.Line(new THREE.BufferGeometry().setFromPoints(p1), cableMat));
      scene.add(new THREE.Line(new THREE.BufferGeometry().setFromPoints(p2), cableMat));

      createDefectMarker(6.0, 12.5, -2.5, "Insulator Flashover Damage");

      flightPath = (t) => {
        const pp = Math.abs(((t * 2) % 2) - 1);
        return new THREE.Vector3(
          -4 + pp * 38,
          16.5 + Math.sin(t * Math.PI * 4) * 0.8,
          Math.sin(t * Math.PI * 2) * 2.5
        );
      };

    // ==========================================
    // 4. PIPELINE SECTOR: Clear, Unobstructed Pipeline
    // ==========================================
    } else if (sceneType === "pipeline") {
      const pg = new THREE.Group();
      pg.position.set(18, -0.8, -4);
      pg.rotation.y = -0.15;

      const pipe = new THREE.Mesh(new THREE.CylinderGeometry(1.05, 1.05, 48, 28), steelMat);
      pipe.rotation.z = Math.PI / 2;
      pg.add(pipe);

      [8, 16, 24, 32].forEach((cx) => {
        const cradleGroup = new THREE.Group();
        cradleGroup.position.set(cx - 20, 0, 0);

        const flange = new THREE.Mesh(new THREE.CylinderGeometry(1.28, 1.28, 0.45, 28), darkSteelMat);
        flange.rotation.z = Math.PI / 2;
        cradleGroup.add(flange);

        const saddle = new THREE.Mesh(new THREE.BoxGeometry(0.6, 1.4, 2.8), steelMat);
        saddle.position.y = -0.8;
        cradleGroup.add(saddle);

        pg.add(cradleGroup);
      });

      const valve = new THREE.Group();
      const vStem = new THREE.Mesh(new THREE.CylinderGeometry(0.2, 0.2, 1.6, 8), darkSteelMat);
      vStem.position.y = 1.6;
      valve.add(vStem);

      const vWheel = new THREE.Mesh(new THREE.TorusGeometry(0.6, 0.1, 8, 18), redAccentMat);
      vWheel.rotation.x = Math.PI / 2;
      vWheel.position.y = 2.4;
      valve.add(vWheel);
      pg.add(valve);

      scene.add(pg);

      createDefectMarker(18, 1.8, -4, "Methane Joint Leak: 340 PPM");

      flightPath = (t) => {
        const pp = Math.abs(((t * 2) % 2) - 1);
        return new THREE.Vector3(
          2 + pp * 32,
          6.8 + Math.sin(t * Math.PI * 6) * 0.4,
          -4 + Math.sin(t * Math.PI * 2) * 1.5
        );
      };
    }

    // ---------- Pointer Interactive Orbit ----------
    const pointer = { x: 0, y: 0 };
    container.addEventListener("mousemove", (e) => {
      const rect = container.getBoundingClientRect();
      pointer.x = ((e.clientX - rect.left) / rect.width) * 2 - 1;
      pointer.y = ((e.clientY - rect.top) / rect.height) * 2 - 1;
    });
    container.addEventListener("mouseleave", () => { pointer.x = 0; pointer.y = 0; });

    function resize() {
      const w = container.clientWidth || 1;
      const h = container.clientHeight || 1;
      camera.aspect = w / h;
      camera.updateProjectionMatrix();
      renderer.setSize(w, h, false);
    }
    resize();
    window.addEventListener("resize", resize);

    // ---------- Animation Loop ----------
    let rafId;
    let t = 0;
    function animate() {
      rafId = requestAnimationFrame(animate);
      t += 0.0005;
      const loopT = t % 1;

      // Drone Flight Path & Rotation
      const pos = flightPath(loopT);
      drone.position.lerp(pos, 0.14);
      const nextPos = flightPath((loopT + 0.01) % 1);
      const heading = new THREE.Vector3().subVectors(nextPos, pos);
      if (heading.lengthSq() > 0.0001) {
        const targetY = Math.atan2(heading.x, heading.z);
        drone.rotation.y += (targetY - drone.rotation.y) * 0.1;
        drone.rotation.z += (-heading.x * 0.12 - drone.rotation.z) * 0.1;
      }
      drone.propellers.forEach((p) => { p.rotation.y += 0.9; });
      if (scanCone) scanCone.rotation.y += 0.02;

      // Windmill Blades Rotation
      if (sceneType === "wind") {
        if (scene.userData.mainHub) scene.userData.mainHub.rotation.z += 0.04;
        if (scene.userData.bgHub) scene.userData.bgHub.rotation.z += 0.03;
      }

      // Defect Markers Pulse & Spin
      defectMarkers.forEach((m) => {
        if (m.userData.ring) m.userData.ring.rotation.z += 0.03;
      });

      // Smooth Camera Parallax
      camera.position.x += (camHome.x + pointer.x * 8 - camera.position.x) * 0.05;
      camera.position.y += (camHome.y - pointer.y * 4 - camera.position.y) * 0.05;
      camera.lookAt(8, 5, -4);

      renderer.render(scene, camera);
    }
    animate();

    document.addEventListener("visibilitychange", () => {
      if (document.hidden) cancelAnimationFrame(rafId);
      else animate();
    });

  } catch (err) {
    // WebGL fallback
  }
});
