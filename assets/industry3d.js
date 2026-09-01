// ============================================================
// RevDrones — Real-Time 3D Vector Scenes for Industry Pages (Three.js)
// Renders sector-specific 3D scenes for:
// - Agriculture: Hexacopter spray drone over crop furrow fields
// - Renewable Energy: Wind turbine with spinning blades + solar farm
// - Mining & Aggregates: Terraced open-pit quarry with volumetric stockpiles
// - Oil & Gas: Refinery pipeline corridor with valve wheel & leak scan
// - Construction: Multi-tier BIM structural lattice + tower crane
// - Academics: Autonomous payload delivery drone & landing target pad
// ============================================================
document.addEventListener("DOMContentLoaded", () => {
  const canvas = document.querySelector(".industry-3d-canvas");
  if (!canvas || !window.THREE || window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

  const sector = canvas.dataset.sector || "agriculture";

  try {
    const container = canvas.parentElement;
    const renderer = new THREE.WebGLRenderer({ canvas, alpha: true, antialias: true });
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));

    const scene = new THREE.Scene();
    scene.fog = new THREE.FogExp2(0x0a0e27, 0.08);

    const camera = new THREE.PerspectiveCamera(45, 1, 0.1, 100);
    camera.position.set(0, 1.8, 5.4);
    camera.lookAt(0, 0, 0);

    // Lighting
    scene.add(new THREE.AmbientLight(0x94a3d4, 0.8));
    const key = new THREE.DirectionalLight(0xffffff, 1.0);
    key.position.set(4, 6, 4);
    scene.add(key);
    const rim = new THREE.DirectionalLight(0xe63946, 0.8);
    rim.position.set(-4, 2, -3);
    scene.add(rim);

    // Grid Floor
    const grid = new THREE.GridHelper(20, 16, 0x2e386b, 0x141a38);
    grid.position.y = -1.7;
    scene.add(grid);

    // Shared Materials
    const steelMat = new THREE.MeshStandardMaterial({ color: 0xd8e0f5, metalness: 0.8, roughness: 0.2 });
    const redMat = new THREE.MeshStandardMaterial({ color: 0xe63946, roughness: 0.3 });
    const darkMat = new THREE.MeshStandardMaterial({ color: 0x141a29, metalness: 0.8, roughness: 0.3 });

    let animateFn = () => {};

    // 1. Agriculture
    if (sector === "agriculture") {
      const drone = new THREE.Group();
      drone.position.set(0, 1.6, 0);
      drone.add(new THREE.Mesh(new THREE.BoxGeometry(0.7, 0.22, 0.7), darkMat));
      const tank = new THREE.Mesh(new THREE.CylinderGeometry(0.24, 0.24, 0.55, 16), redMat);
      tank.rotation.z = Math.PI / 2;
      tank.position.y = -0.16;
      drone.add(tank);

      const boom = new THREE.Mesh(new THREE.BoxGeometry(2.4, 0.04, 0.04), steelMat);
      boom.position.y = -0.4;
      drone.add(boom);

      [0, 60, 120, 180, 240, 300].forEach((deg) => {
        const rad = (deg * Math.PI) / 180;
        const ax = Math.cos(rad) * 0.75;
        const az = Math.sin(rad) * 0.75;
        const arm = new THREE.Mesh(new THREE.BoxGeometry(0.75, 0.04, 0.04), steelMat);
        arm.position.set(ax * 0.5, 0, az * 0.5);
        arm.rotation.y = -rad;
        drone.add(arm);
      });
      scene.add(drone);

      // Crop Field
      const field = new THREE.Mesh(new THREE.PlaneGeometry(16, 16), new THREE.MeshStandardMaterial({ color: 0x064e3b }));
      field.rotation.x = -Math.PI / 2;
      field.position.y = -1.2;
      scene.add(field);

      animateFn = (t) => {
        drone.position.y = 1.6 + Math.sin(t * 2.0) * 0.15;
        drone.position.x = Math.sin(t * 0.8) * 0.4;
        drone.rotation.z = Math.cos(t * 0.8) * -0.08;
      };

    // 2. Renewable Energy
    } else if (sector === "renewable-energy") {
      const turbine = new THREE.Group();
      turbine.position.set(-1.8, -0.8, -0.8);
      const tower = new THREE.Mesh(new THREE.CylinderGeometry(0.12, 0.24, 4.4, 16), steelMat);
      tower.position.y = 2.2;
      turbine.add(tower);
      const nacelle = new THREE.Mesh(new THREE.BoxGeometry(0.8, 0.35, 0.35), steelMat);
      nacelle.position.y = 4.4;
      turbine.add(nacelle);

      const hub = new THREE.Group();
      hub.position.set(0.42, 4.4, 0);
      [0, 1, 2].map((idx) => {
        const blade = new THREE.Mesh(new THREE.BoxGeometry(0.08, 2.6, 0.18), steelMat);
        blade.position.y = 1.3;
        const pivot = new THREE.Group();
        pivot.add(blade);
        pivot.rotation.z = (idx * Math.PI * 2) / 3;
        hub.add(pivot);
      });
      turbine.add(hub);
      scene.add(turbine);

      // Solar Panels
      [-0.6, 0.8, 2.2].forEach((px) => {
        const p = new THREE.Mesh(new THREE.BoxGeometry(1.2, 0.05, 1.6), steelMat);
        p.position.set(px, -0.3, 0.4);
        p.rotation.x = -0.4;
        scene.add(p);
      });

      animateFn = (t, dt) => {
        hub.rotation.z += dt * 1.2;
      };

    // 3. Mining
    } else if (sector === "mining") {
      [4.2, 3.2, 2.2].forEach((r, i) => {
        const step = new THREE.Mesh(new THREE.CylinderGeometry(r, r + 0.6, 0.4, 16), new THREE.MeshStandardMaterial({ color: 0x78350f, roughness: 0.9 }));
        step.position.y = -1.2 + i * 0.4;
        scene.add(step);
      });
      const cone = new THREE.Mesh(new THREE.ConeGeometry(1.2, 1.2, 16), new THREE.MeshStandardMaterial({ color: 0xd97706, wireframe: true }));
      cone.position.set(-1.2, 0.1, -0.4);
      scene.add(cone);

      const drone = new THREE.Mesh(new THREE.BoxGeometry(0.5, 0.12, 0.5), steelMat);
      drone.position.set(0, 2.0, 0);
      scene.add(drone);

      animateFn = (t) => {
        drone.position.y = 2.0 + Math.sin(t * 1.5) * 0.15;
        drone.position.x = Math.sin(t * 0.7) * 1.2;
      };

    // 4. Oil & Gas
    } else if (sector === "oil-and-gas") {
      const tank = new THREE.Mesh(new THREE.CylinderGeometry(1.2, 1.2, 1.8, 20), new THREE.MeshStandardMaterial({ color: 0x334155 }));
      tank.position.set(-2.0, -0.4, -0.6);
      scene.add(tank);

      const pipe = new THREE.Mesh(new THREE.CylinderGeometry(0.35, 0.35, 5.2, 20), steelMat);
      pipe.rotation.z = Math.PI / 2;
      pipe.position.set(0.4, -0.6, 0.4);
      scene.add(pipe);

      const drone = new THREE.Mesh(new THREE.BoxGeometry(0.5, 0.12, 0.5), redMat);
      drone.position.set(0.4, 1.7, 0.4);
      scene.add(drone);

      animateFn = (t) => {
        drone.position.y = 1.7 + Math.sin(t * 1.9) * 0.12;
        drone.position.x = Math.sin(t * 0.8) * 0.9;
      };

    // 5. Construction
    } else if (sector === "construction") {
      const slab = new THREE.Mesh(new THREE.BoxGeometry(3.6, 0.3, 3.6), new THREE.MeshStandardMaterial({ color: 0x475569 }));
      slab.position.set(-0.4, -1.1, 0);
      scene.add(slab);

      [-1.4, 0.6].forEach((cx) => {
        [-1.0, 1.0].forEach((cz) => {
          const col = new THREE.Mesh(new THREE.BoxGeometry(0.12, 1.8, 0.12), steelMat);
          col.position.set(cx, -0.1, cz);
          scene.add(col);
        });
      });

      const crane = new THREE.Group();
      crane.position.set(2.0, -1.0, -0.8);
      const mast = new THREE.Mesh(new THREE.BoxGeometry(0.25, 3.6, 0.25), new THREE.MeshStandardMaterial({ color: 0xeab308 }));
      mast.position.y = 1.8;
      crane.add(mast);
      const jib = new THREE.Mesh(new THREE.BoxGeometry(3.2, 0.18, 0.18), new THREE.MeshStandardMaterial({ color: 0xeab308 }));
      jib.position.set(-1.2, 3.5, 0);
      crane.add(jib);
      scene.add(crane);

      animateFn = (t) => {
        jib.rotation.y = Math.sin(t * 0.4) * 0.45;
      };

    // 6. Academics
    } else {
      const pad = new THREE.Mesh(new THREE.CircleGeometry(2.2, 32), new THREE.MeshStandardMaterial({ color: 0x0f172a }));
      pad.rotation.x = -Math.PI / 2;
      pad.position.y = -1.1;
      scene.add(pad);

      const ring = new THREE.Mesh(new THREE.RingGeometry(1.5, 1.65, 32), new THREE.MeshBasicMaterial({ color: 0x00e1ff, side: THREE.DoubleSide }));
      ring.rotation.x = -Math.PI / 2;
      ring.position.y = -1.08;
      scene.add(ring);

      const drone = new THREE.Group();
      drone.position.set(0, 1.4, 0);
      drone.add(new THREE.Mesh(new THREE.BoxGeometry(0.65, 0.16, 0.65), steelMat));
      const box = new THREE.Mesh(new THREE.BoxGeometry(0.35, 0.35, 0.35), redMat);
      box.position.y = -0.32;
      drone.add(box);
      scene.add(drone);

      animateFn = (t, dt) => {
        ring.rotation.z += dt * 0.8;
        drone.position.y = 1.4 + Math.sin(t * 1.6) * 0.2;
      };
    }

    function resize() {
      const w = container.clientWidth || 1;
      const h = container.clientHeight || 1;
      camera.aspect = w / h;
      camera.updateProjectionMatrix();
      renderer.setSize(w, h, false);
    }
    resize();
    window.addEventListener("resize", resize);

    const clock = new THREE.Clock();
    function animate() {
      requestAnimationFrame(animate);
      const t = clock.getElapsedTime();
      const dt = clock.getDelta();
      animateFn(t, dt);
      renderer.render(scene, camera);
    }
    animate();

  } catch (err) {
    console.warn("Industry 3D scene unavailable:", err);
  }
});
