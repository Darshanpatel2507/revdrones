// ============================================================
// RevDrones — SaaS pages interactive background (Three.js)
// A drifting particle network: nearby particles connect with
// faint lines, and particles near the cursor pulse red — a
// "live data network" feel for the SaaS product pages.
// Degrades gracefully (flat panel background) if WebGL fails.
// ============================================================
document.addEventListener("DOMContentLoaded", () => {

  const canvas = document.getElementById("saas-bg");
  if (!canvas || !window.THREE || window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

  try {
    const container = canvas.parentElement;
    const renderer = new THREE.WebGLRenderer({ canvas, alpha: true, antialias: true });
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));

    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(55, 1, 1, 1000);
    camera.position.z = 220;

    const PARTICLE_COUNT = 130;
    const SPREAD = 340;
    const CONNECT_DIST = 62;

    const baseColor = new THREE.Color(0xaab3d1);   // ink-dim
    const pulseColor = new THREE.Color(0xe63946);   // red accent

    const positions = new Float32Array(PARTICLE_COUNT * 3);
    const colors = new Float32Array(PARTICLE_COUNT * 3);
    const velocities = [];
    for (let i = 0; i < PARTICLE_COUNT; i++) {
      positions[i * 3] = (Math.random() - 0.5) * SPREAD;
      positions[i * 3 + 1] = (Math.random() - 0.5) * SPREAD;
      positions[i * 3 + 2] = (Math.random() - 0.5) * SPREAD * 0.5;
      baseColor.toArray(colors, i * 3);
      velocities.push({
        x: (Math.random() - 0.5) * 0.04,
        y: (Math.random() - 0.5) * 0.04,
        z: (Math.random() - 0.5) * 0.02,
      });
    }

    const geo = new THREE.BufferGeometry();
    geo.setAttribute("position", new THREE.BufferAttribute(positions, 3));
    geo.setAttribute("color", new THREE.BufferAttribute(colors, 3));

    const points = new THREE.Points(
      geo,
      new THREE.PointsMaterial({
        size: 2.4,
        vertexColors: true,
        transparent: true,
        opacity: 0.85,
        sizeAttenuation: true,
      })
    );
    scene.add(points);

    // Connection lines get rebuilt each frame from live positions —
    // capped at a small particle count so this stays cheap.
    const maxLineSegments = PARTICLE_COUNT * 6;
    const linePositions = new Float32Array(maxLineSegments * 2 * 3);
    const lineGeo = new THREE.BufferGeometry();
    lineGeo.setAttribute("position", new THREE.BufferAttribute(linePositions, 3));
    const lines = new THREE.LineSegments(
      lineGeo,
      new THREE.LineBasicMaterial({ color: 0xe63946, transparent: true, opacity: 0.09 })
    );
    scene.add(lines);

    const mouse = new THREE.Vector2(-999, -999);
    function onPointerMove(e) {
      const rect = container.getBoundingClientRect();
      mouse.x = ((e.clientX - rect.left) / rect.width) * 2 - 1;
      mouse.y = -((e.clientY - rect.top) / rect.height) * 2 + 1;
    }
    container.addEventListener("mousemove", onPointerMove);
    container.addEventListener("mouseleave", () => { mouse.set(-999, -999); });

    function resize() {
      const w = container.clientWidth || 1;
      const h = container.clientHeight || 1;
      camera.aspect = w / h;
      camera.updateProjectionMatrix();
      renderer.setSize(w, h, false);
    }
    resize();
    window.addEventListener("resize", resize);

    const pArr = geo.attributes.position.array;
    const cArr = geo.attributes.color.array;
    const lArr = lineGeo.attributes.position.array;

    let rafId;
    function animate() {
      rafId = requestAnimationFrame(animate);

      // drift particles, gently wrap within bounds
      for (let i = 0; i < PARTICLE_COUNT; i++) {
        const v = velocities[i];
        pArr[i * 3] += v.x;
        pArr[i * 3 + 1] += v.y;
        pArr[i * 3 + 2] += v.z;
        for (let ax = 0; ax < 3; ax++) {
          const bound = ax === 2 ? SPREAD * 0.25 : SPREAD / 2;
          if (pArr[i * 3 + ax] > bound) pArr[i * 3 + ax] = -bound;
          if (pArr[i * 3 + ax] < -bound) pArr[i * 3 + ax] = bound;
        }
      }
      geo.attributes.position.needsUpdate = true;

      // project mouse into scene space at z=0 for proximity pulse
      const mv = new THREE.Vector3(mouse.x, mouse.y, 0.5).unproject(camera);
      const dir = mv.sub(camera.position).normalize();
      const dist = -camera.position.z / dir.z;
      const ptr = camera.position.clone().add(dir.multiplyScalar(dist));

      for (let i = 0; i < PARTICLE_COUNT; i++) {
        const dx = pArr[i * 3] - ptr.x;
        const dy = pArr[i * 3 + 1] - ptr.y;
        const t = Math.max(0, 1 - Math.hypot(dx, dy) / 70);
        const mix = baseColor.clone().lerp(pulseColor, t);
        cArr[i * 3] += (mix.r - cArr[i * 3]) * 0.08;
        cArr[i * 3 + 1] += (mix.g - cArr[i * 3 + 1]) * 0.08;
        cArr[i * 3 + 2] += (mix.b - cArr[i * 3 + 2]) * 0.08;
      }
      geo.attributes.color.needsUpdate = true;

      // rebuild proximity lines (small N, cheap each frame)
      let segCount = 0;
      for (let i = 0; i < PARTICLE_COUNT && segCount < maxLineSegments; i++) {
        for (let j = i + 1; j < PARTICLE_COUNT && segCount < maxLineSegments; j++) {
          const dx = pArr[i * 3] - pArr[j * 3];
          const dy = pArr[i * 3 + 1] - pArr[j * 3 + 1];
          const dz = pArr[i * 3 + 2] - pArr[j * 3 + 2];
          if (dx * dx + dy * dy + dz * dz < CONNECT_DIST * CONNECT_DIST) {
            const o = segCount * 6;
            lArr[o] = pArr[i * 3]; lArr[o + 1] = pArr[i * 3 + 1]; lArr[o + 2] = pArr[i * 3 + 2];
            lArr[o + 3] = pArr[j * 3]; lArr[o + 4] = pArr[j * 3 + 1]; lArr[o + 5] = pArr[j * 3 + 2];
            segCount++;
          }
        }
      }
      lineGeo.setDrawRange(0, segCount * 2);
      lineGeo.attributes.position.needsUpdate = true;

      scene.rotation.y += 0.0006;

      renderer.render(scene, camera);
    }
    animate();

    // pause the loop when the tab isn't visible, saves battery/CPU
    document.addEventListener("visibilitychange", () => {
      if (document.hidden) {
        cancelAnimationFrame(rafId);
      } else {
        animate();
      }
    });

  } catch (err) {
    // WebGL context creation or similar failure — panel keeps its flat background.
  }
});
