// ============================================================
// RevDrones — email backend (via Google Apps Script) + shared behaviors
// ============================================================

// Paste your deployed Google Apps Script Web App URL here (ends in /exec).
// This is the ONLY backend for form submissions — the script emails each
// submission directly (see google-apps-script.gs for setup + the recipient
// address). Leave blank and forms will show an error instead of silently failing.
const FORM_WEBHOOK_URL = "https://script.google.com/macros/s/AKfycbwh0e8z_SQSICAoxgH8Ri4ti1ePa0YQEddnGYEXfrUglIPyNH42lfBBVLeZUEq-fb6FZA/exec";

// Sends a form submission to the email webhook.
// Uses mode:"no-cors" + text/plain so the browser doesn't block it on CORS —
// this means we can't read back the actual HTTP status, only whether the
// network request itself succeeded or failed.
async function sendFormSubmission(payload, formType) {
  if (!FORM_WEBHOOK_URL) {
    throw new Error("Form webhook URL is not configured yet.");
  }
  await fetch(FORM_WEBHOOK_URL, {
    method: "POST",
    mode: "no-cors",
    headers: { "Content-Type": "text/plain;charset=utf-8" },
    body: JSON.stringify({ ...payload, formType }),
  });
}

// ---------- Supabase (database) ----------
// Powers the staff dashboard: bookings submitted here show up live in
// dashboard.html, and blog posts published from the dashboard are read
// back out on the public site (see the "latest blogs" section below).
const SUPABASE_URL = "https://axxctupcnmzropjtifrz.supabase.co";
const SUPABASE_ANON_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImF4eGN0dXBjbm16cm9wanRpZnJ6Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODc1NzI5ODgsImV4cCI6MjEwMzE0ODk4OH0.5ZSUAePv27GKjjT6JGZ6O8MuKVa5Dhj_OyDEwfij_rk";
const sbClient = (typeof window !== "undefined" && window.supabase)
  ? window.supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY)
  : null;

// ---------- mobile nav ----------
document.addEventListener("DOMContentLoaded", () => {
  const toggle = document.querySelector(".nav-toggle");
  const links = document.querySelector(".nav-links");
  if (toggle && links) {
    toggle.addEventListener("click", () => {
      links.style.display = links.style.display === "flex" ? "none" : "flex";
      links.style.flexDirection = "column";
      links.style.position = "absolute";
      links.style.top = "78px";
      links.style.left = "0";
      links.style.right = "0";
      links.style.background = "rgba(8,11,28,.98)";
      links.style.padding = "20px 28px";
      links.style.borderBottom = "1px solid var(--line)";
    });
  }

  // ---------- Interactive Aerospace Particle Constellation Background ----------
  // Active on Homepage and main Navbar hubs (Excluded on SaaS 3D subpages, Dashboard, Login, Legal)
  (() => {
    const p = window.location.pathname.toLowerCase();
    const isSaasSubpage = p.includes("saas/wind") || 
                         p.includes("saas/solar") || 
                         p.includes("saas/powerline") || 
                         p.includes("saas/pipeline") ||
                         p.includes("saas\\wind") || 
                         p.includes("saas\\solar") || 
                         p.includes("saas\\powerline") || 
                         p.includes("saas\\pipeline");
    const isExcluded = p.includes("dashboard") || 
                       p.includes("login") || 
                       p.includes("privacy-policy") || 
                       p.includes("terms-and-conditions") ||
                       isSaasSubpage;
    if (isExcluded) return;
    if (document.getElementById("aero-bg-canvas")) return;

    const canvas = document.createElement("canvas");
    canvas.id = "aero-bg-canvas";
    canvas.style.position = "fixed";
    canvas.style.top = "0";
    canvas.style.left = "0";
    canvas.style.width = "100vw";
    canvas.style.height = "100vh";
    canvas.style.pointerEvents = "none";
    canvas.style.zIndex = "1";
    canvas.style.opacity = "0.95";
    canvas.style.mixBlendMode = "screen";
    document.body.appendChild(canvas);

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    let width = (canvas.width = window.innerWidth);
    let height = (canvas.height = window.innerHeight);

    window.addEventListener("resize", () => {
      width = canvas.width = window.innerWidth;
      height = canvas.height = window.innerHeight;
      initParticles();
    });

    let mouse = { x: -1000, y: -1000, radius: 170 };
    window.addEventListener("mousemove", (e) => {
      mouse.x = e.clientX;
      mouse.y = e.clientY;
    });
    window.addEventListener("mouseleave", () => {
      mouse.x = -1000;
      mouse.y = -1000;
    });

    const PARTICLE_COUNT = Math.min(Math.floor((width * height) / 13000), 90);
    let particles = [];

    class Particle {
      constructor() {
        this.reset();
      }
      reset() {
        this.x = Math.random() * width;
        this.y = Math.random() * height;
        this.vx = (Math.random() - 0.5) * 0.6;
        this.vy = (Math.random() - 0.5) * 0.6;
        this.radius = Math.random() * 2.2 + 1.2;
        this.isRed = Math.random() < 0.28; // 28% red drone telemetry nodes
        this.alpha = Math.random() * 0.6 + 0.35;
      }
      update() {
        this.x += this.vx;
        this.y += this.vy;

        if (this.x < 0) this.x = width;
        if (this.x > width) this.x = 0;
        if (this.y < 0) this.y = height;
        if (this.y > height) this.y = 0;

        // Mouse interactivity
        const dx = mouse.x - this.x;
        const dy = mouse.y - this.y;
        const dist = Math.sqrt(dx * dx + dy * dy);
        if (dist < mouse.radius) {
          const force = (mouse.radius - dist) / mouse.radius;
          const angle = Math.atan2(dy, dx);
          this.x -= Math.cos(angle) * force * 2.2;
          this.y -= Math.sin(angle) * force * 2.2;
        }
      }
      draw() {
        ctx.beginPath();
        ctx.arc(this.x, this.y, this.radius, 0, Math.PI * 2);
        if (this.isRed) {
          ctx.fillStyle = `rgba(230, 57, 70, ${this.alpha})`;
          ctx.shadowColor = "rgba(230, 57, 70, 0.9)";
          ctx.shadowBlur = 10;
        } else {
          ctx.fillStyle = `rgba(140, 180, 255, ${this.alpha})`;
          ctx.shadowColor = "rgba(90, 150, 255, 0.7)";
          ctx.shadowBlur = 8;
        }
        ctx.fill();
        ctx.shadowBlur = 0;
      }
    }

    function initParticles() {
      particles = [];
      for (let i = 0; i < PARTICLE_COUNT; i++) {
        particles.push(new Particle());
      }
    }
    initParticles();

    let animFrameId;
    function animate() {
      ctx.clearRect(0, 0, width, height);

      // Draw constellation connections
      for (let i = 0; i < particles.length; i++) {
        for (let j = i + 1; j < particles.length; j++) {
          const p1 = particles[i];
          const p2 = particles[j];
          const dx = p1.x - p2.x;
          const dy = p1.y - p2.y;
          const dist = Math.sqrt(dx * dx + dy * dy);

          if (dist < 125) {
            const lineAlpha = (1 - dist / 125) * 0.28;
            ctx.beginPath();
            ctx.moveTo(p1.x, p1.y);
            ctx.lineTo(p2.x, p2.y);
            if (p1.isRed || p2.isRed) {
              ctx.strokeStyle = `rgba(230, 57, 70, ${lineAlpha * 1.5})`;
            } else {
              ctx.strokeStyle = `rgba(130, 175, 255, ${lineAlpha * 1.1})`;
            }
            ctx.lineWidth = 0.9;
            ctx.stroke();
          }
        }
      }

      // Connect to mouse with luminous beam
      if (mouse.x > 0 && mouse.y > 0) {
        for (let i = 0; i < particles.length; i++) {
          const p = particles[i];
          const dx = mouse.x - p.x;
          const dy = mouse.y - p.y;
          const dist = Math.sqrt(dx * dx + dy * dy);
          if (dist < 155) {
            const lineAlpha = (1 - dist / 155) * 0.45;
            ctx.beginPath();
            ctx.moveTo(p.x, p.y);
            ctx.lineTo(mouse.x, mouse.y);
            ctx.strokeStyle = `rgba(255, 77, 90, ${lineAlpha})`;
            ctx.lineWidth = 1.2;
            ctx.stroke();
          }
        }
      }

      particles.forEach((p) => {
        p.update();
        p.draw();
      });

      animFrameId = requestAnimationFrame(animate);
    }
    animate();

    document.addEventListener("visibilitychange", () => {
      if (document.hidden) cancelAnimationFrame(animFrameId);
      else animFrameId = requestAnimationFrame(animate);
    });
  })();

  // ---------- scroll reveal ----------
  const revealEls = document.querySelectorAll(".reveal");
  const io = new IntersectionObserver(
    (entries) => {
      entries.forEach((e) => {
        if (e.isIntersecting) {
          e.target.classList.add("in");
          io.unobserve(e.target);
        }
      });
    },
    { threshold: 0.15 }
  );
  revealEls.forEach((el) => io.observe(el));

  // ---------- tilt / cursor-glow cards with specular flare ----------
  document.querySelectorAll(".tilt").forEach((el) => {
    el.addEventListener("mousemove", (e) => {
      const r = el.getBoundingClientRect();
      const px = ((e.clientX - r.left) / r.width) * 100;
      const py = ((e.clientY - r.top) / r.height) * 100;
      el.style.setProperty("--mx", px + "%");
      el.style.setProperty("--my", py + "%");
      const rx = ((py - 50) / 50) * -7;
      const ry = ((px - 50) / 50) * 7;
      el.style.transform = `perspective(800px) rotateX(${rx}deg) rotateY(${ry}deg) translateY(-5px) scale3d(1.02, 1.02, 1.02)`;
    });
    el.addEventListener("mouseleave", () => {
      el.style.transform = "perspective(800px) rotateX(0) rotateY(0) translateY(0) scale3d(1, 1, 1)";
    });
  });

  // ---------- Button Energy Shockwave Ripple ----------
  document.querySelectorAll(".btn, .carousel-btn").forEach((btn) => {
    btn.addEventListener("click", function (e) {
      const rect = this.getBoundingClientRect();
      const ripple = document.createElement("span");
      ripple.className = "energy-ripple";
      const size = Math.max(rect.width, rect.height) * 2;
      ripple.style.width = ripple.style.height = `${size}px`;
      ripple.style.left = `${e.clientX - rect.left}px`;
      ripple.style.top = `${e.clientY - rect.top}px`;
      this.appendChild(ripple);
      setTimeout(() => ripple.remove(), 700);
    });
  });

  // hero flight-panel cursor glow (no tilt, just glow)
  const flightPanel = document.querySelector(".flight-panel");
  if (flightPanel) {
    flightPanel.addEventListener("mousemove", (e) => {
      const r = flightPanel.getBoundingClientRect();
      flightPanel.style.setProperty("--mx", ((e.clientX - r.left) / r.width) * 100 + "%");
      flightPanel.style.setProperty("--my", ((e.clientY - r.top) / r.height) * 100 + "%");
    });
  }

  // ---------- animated count-up stats ----------
  const counters = document.querySelectorAll("[data-count-to]");
  const countIO = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (!entry.isIntersecting) return;
        const el = entry.target;
        const target = parseFloat(el.dataset.countTo);
        const suffix = el.dataset.suffix || "";
        const decimals = el.dataset.decimals ? parseInt(el.dataset.decimals) : 0;
        const duration = 1400;
        const start = performance.now();
        function tick(now) {
          const p = Math.min((now - start) / duration, 1);
          const eased = 1 - Math.pow(1 - p, 3);
          const val = target * eased;
          el.textContent = decimals ? val.toFixed(decimals) + suffix : Math.round(val) + suffix;
          if (p < 1) requestAnimationFrame(tick);
        }
        requestAnimationFrame(tick);
        countIO.unobserve(el);
      });
    },
    { threshold: 0.4 }
  );
  counters.forEach((el) => countIO.observe(el));

  // ---------- animated mission timeline ----------
  const timeline = document.querySelector(".timeline-track");
  if (timeline) {
    const steps = timeline.querySelectorAll(".timeline-step");
    const fill = timeline.querySelector(".timeline-line-fill");
    const tlIO = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (!entry.isIntersecting) return;
          steps.forEach((step, i) => {
            setTimeout(() => step.classList.add("active"), i * 260);
          });
          if (fill) setTimeout(() => (fill.style.width = "100%"), 100);
          tlIO.unobserve(entry.target);
        });
      },
      { threshold: 0.4 }
    );
    tlIO.observe(timeline);
  }

  // ---------- testimonial carousel (auto-sliding, profile-card style) ----------
  const testiHero = document.getElementById("testi-hero");
  if (testiHero) {
    let testimonials = [
      { initials: "DM", photo: "https://revdrones.in/assets/img/clients/1.png", name: "DJ Mahajan", title: "CEO, SDS Surveyors", desc: "Excellent service for our structural inspection at Tata Power, Trombay — completed within a week with a detailed report. Efficient and precise." },
      { initials: "VB", photo: "https://www.dellaleaders.com/v3/wp-content/uploads/2023/07/Vishal-Budhia_Steam-House_-Sanjoo-Group-2000x1333-1.jpeg", name: "Vishal Budhia", title: "MD, SteamHouse India", desc: "A highly dedicated team with an advanced technical solution for precise inspection, significantly enhancing our efficiency across plants and headquarters." },
      { initials: "RT", photo: "https://revdrones.in/assets/img/clients/4.png", name: "Rangam Trivedi", title: "Author, Amrit Kaal Odyssey", desc: "Outstanding drone delivery for a book launch — precise, professional, and innovative. Flawless execution that wowed the audience." },
      { initials: "JP", photo: "https://revdrones.in/assets/img/clients/3.png", name: "Jignesh Prajapati", title: "Amar Group", desc: "Exceptional site-progress video coverage for our projects — accurate, detailed, and a genuinely trusted partner." },
      { initials: "BU", photo: "https://revdrones.in/assets/img/clients/5.jpg", name: "Bhavy Upadhyay", title: "Jay Yogeshwar Petro Chemical", desc: "Exceptional service during our structural inspection — precise, efficient, and their advanced drone technology helped us catch potential issues early." },
    ];
    // These 5 are a fallback shown immediately (and if the fetch below fails).
    // If the dashboard has published reviews, they replace this list before autoplay starts.
    const AUTOPLAY_MS = 5000;
    const TRANSITION_MS = 380;
    let testiIndex = 0;
    let testiTimer = null;
    let animating = false;

    const els = {
      initials: document.getElementById("testi-initials"),
      body: document.getElementById("testi-body"),
      name: document.getElementById("testi-name"),
      title: document.getElementById("testi-title"),
      desc: document.getElementById("testi-desc"),
      dots: document.getElementById("testi-dots"),
    };

    let dotEls = [];
    function buildDots() {
      els.dots.innerHTML = "";
      testimonials.forEach((_, i) => {
        const d = document.createElement("div");
        d.className = "dot" + (i === 0 ? " active" : "");
        d.addEventListener("click", () => goTo(i));
        els.dots.appendChild(d);
      });
      dotEls = els.dots.querySelectorAll(".dot");
    }
    function showCurrent() {
      const t = testimonials[testiIndex];
      setAvatar(t);
      els.name.textContent = t.name;
      els.title.textContent = t.title;
      els.desc.textContent = t.desc;
      dotEls.forEach((d, i2) => d.classList.toggle("active", i2 === testiIndex));
    }
    buildDots();

    function setAvatar(t) {
      if (t.photo) {
        els.initials.innerHTML = "";
        const img = document.createElement("img");
        img.src = t.photo;
        img.alt = t.name;
        img.loading = "lazy";
        img.onerror = () => { els.initials.textContent = t.initials; };
        els.initials.appendChild(img);
      } else {
        els.initials.textContent = t.initials;
      }
    }

    // direction: "next" slides content out to the left / in from the right
    //            "prev" slides content out to the right / in from the left
    function setTesti(i, direction) {
      const nextIndex = (i + testimonials.length) % testimonials.length;
      if (nextIndex === testiIndex || animating) return;
      direction = direction || (nextIndex > testiIndex ? "next" : "prev");
      testiIndex = nextIndex;
      animating = true;

      const outClass = direction === "next" ? "testi-out-left" : "testi-out-right";
      const inClass = direction === "next" ? "testi-in-right" : "testi-in-left";

      [els.body, els.initials].forEach(el => el.classList.add(outClass));

      setTimeout(() => {
        testiIndex = nextIndex;
        showCurrent();

        [els.body, els.initials].forEach(el => {
          el.classList.add("testi-notransition");
          el.classList.remove(outClass);
          el.classList.add(inClass);
        });

        // force reflow so the jump to the "in" start position happens with no transition
        void els.body.offsetWidth;

        [els.body, els.initials].forEach(el => el.classList.remove("testi-notransition", inClass));

        setTimeout(() => { animating = false; }, TRANSITION_MS);
      }, TRANSITION_MS);
    }

    function goTo(i, direction) {
      setTesti(i, direction);
      restartAutoplay();
    }
    function startAutoplay() {
      testiTimer = setInterval(() => setTesti(testiIndex + 1, "next"), AUTOPLAY_MS);
    }
    function restartAutoplay() {
      clearInterval(testiTimer);
      startAutoplay();
    }

    document.getElementById("testi-prev").addEventListener("click", () => goTo(testiIndex - 1, "prev"));
    document.getElementById("testi-next").addEventListener("click", () => goTo(testiIndex + 1, "next"));

    // pause on hover / touch so it doesn't slide out from under the user while reading
    testiHero.addEventListener("mouseenter", () => clearInterval(testiTimer));
    testiHero.addEventListener("mouseleave", () => restartAutoplay());
    document.addEventListener("visibilitychange", () => {
      if (document.hidden) clearInterval(testiTimer);
      else restartAutoplay();
    });

    // Try to load live reviews from the dashboard; keep the fallback list above if it fails.
    if (sbClient) {
      sbClient.from("testimonials").select("*").eq("published", true).order("sort_order", { ascending: true })
        .then(({ data, error }) => {
          if (error || !data || !data.length) return;
          testimonials = data.map(r => ({
            initials: (r.name || "?").trim().split(/\s+/).map(w => w[0]).slice(0, 2).join("").toUpperCase(),
            photo: r.photo_url || "",
            name: r.name,
            title: r.title || "",
            desc: r.quote,
          }));
          testiIndex = 0;
          buildDots();
          showCurrent();
        })
        .catch(() => {});
    }

    startAutoplay();
  }

  // ---------- scroll progress bar ----------
  const progressBar = document.querySelector(".scroll-progress-bar");
  if (progressBar) {
    window.addEventListener("scroll", () => {
      const h = document.documentElement;
      const pct = (h.scrollTop / (h.scrollHeight - h.clientHeight)) * 100;
      progressBar.style.width = pct + "%";
    });
  }

  // ---------- scrollspy nav ----------
  const spySections = document.querySelectorAll("section[id]");
  const navA = document.querySelectorAll(".nav-links a[href*='#']");
  if (spySections.length && navA.length) {
    const spyIO = new IntersectionObserver(
      (entries) => {
        entries.forEach((e) => {
          if (e.isIntersecting) {
            navA.forEach((a) => a.classList.toggle("active", a.getAttribute("href").endsWith("#" + e.target.id)));
          }
        });
      },
      { rootMargin: "-40% 0px -50% 0px" }
    );
    spySections.forEach((s) => spyIO.observe(s));
  }

  // ---------- magnetic buttons ----------
  document.querySelectorAll(".magnetic").forEach((btn) => {
    btn.addEventListener("mousemove", (e) => {
      const r = btn.getBoundingClientRect();
      const mx = e.clientX - r.left - r.width / 2;
      const my = e.clientY - r.top - r.height / 2;
      btn.style.transform = `translate(${mx * 0.25}px, ${my * 0.35}px)`;
    });
    btn.addEventListener("mouseleave", () => { btn.style.transform = "translate(0,0)"; });
  });

  // ---------- contact form ----------
  const contactForm = document.getElementById("contact-form");
  if (contactForm) {
    contactForm.addEventListener("submit", async (e) => {
      e.preventDefault();
      const msgEl = document.getElementById("contact-msg");
      const btn = contactForm.querySelector("button[type=submit]");
      const payload = {
        full_name: contactForm.full_name.value.trim(),
        email: contactForm.email.value.trim(),
        phone: contactForm.phone.value.trim(),
        subject: contactForm.subject.value.trim(),
        message: contactForm.message.value.trim(),
      };
      if (!payload.full_name || !payload.email || !payload.subject || !payload.message) {
        msgEl.textContent = "Please fill in your name, email, subject, and message.";
        msgEl.className = "form-msg err";
        return;
      }
      btn.disabled = true;
      btn.textContent = "Sending…";
      try {
        await sendFormSubmission(payload, "lead");
        msgEl.textContent = "Message sent — our team will get back to you shortly.";
        msgEl.className = "form-msg ok";
        contactForm.reset();
      } catch (err) {
        msgEl.textContent = "Something went wrong. Please try again.";
        msgEl.className = "form-msg err";
      }
      btn.disabled = false;
      btn.textContent = "Send message";
    });
  }

  // ---------- booking form ----------
  const bookingForm = document.getElementById("booking-form");
  if (bookingForm) {
    bookingForm.addEventListener("submit", async (e) => {
      e.preventDefault();
      const msgEl = document.getElementById("booking-msg");
      const btn = bookingForm.querySelector("button[type=submit]");
      const payload = {
        full_name: bookingForm.full_name.value.trim(),
        email: bookingForm.email.value.trim(),
        phone: bookingForm.phone.value.trim(),
        company: bookingForm.company.value.trim(),
        service: bookingForm.service.value,
        preferred_date: bookingForm.preferred_date.value || null,
        location: bookingForm.location.value.trim(),
        details: bookingForm.details.value.trim(),
      };
      if (!payload.full_name || !payload.email || !payload.service) {
        msgEl.textContent = "Please fill in your name, email, and service type.";
        msgEl.className = "form-msg err";
        return;
      }
      btn.disabled = true;
      btn.textContent = "Submitting…";
      try {
        if (!sbClient) throw new Error("Booking system is not configured.");
        const { error } = await sbClient.from("bookings").insert(payload);
        if (error) throw error;
        sendFormSubmission(payload, "booking").catch(() => {}); // best-effort email notice
        msgEl.textContent = "Booking request received — we'll confirm by email.";
        msgEl.className = "form-msg ok";
        bookingForm.reset();
      } catch (err) {
        msgEl.textContent = "Something went wrong. Please try again.";
        msgEl.className = "form-msg err";
      }
      btn.disabled = false;
      btn.textContent = "Request booking";
    });
  }

  // ---------- blog hero carousel (auto-sliding, review-card style) ----------
  const blogHero = document.getElementById("blog-hero");
  if (blogHero) {
    let blogPosts = [
      {
        slug: "namo-drone-didi",
        url: "blog/namo-drone-didi.html",
        title: "Namo Drone Didi: Soaring High on Empowerment",
        category: "Drone Industry News",
        photo: "https://www.revdrones.in/assets/uploads/1725466201_WhatsApp_Image_2024-09-03_at_10_51_29_AM1.jpeg",
        author: "Khushi Panchal",
        date: "24 July 2024",
        desc: "Empowering women across rural India through state-of-the-art agricultural drone training, modernizing farming and fostering self-reliance.",
      },
      {
        slug: "pipeline-inspection",
        url: "blog/pipeline-inspection.html",
        title: "Revdrones Technologies: Revolutionizing Pipeline Inspection with Drones",
        category: "Drone Technology",
        photo: "https://www.revdrones.in/assets/uploads/1725467504_pipeline1.jpg",
        author: "Khushi Panchal",
        date: "05 August 2024",
        desc: "High-precision thermal and visual drone inspections for long-distance oil and gas pipelines, pinpointing leaks and integrity hazards.",
      },
      {
        slug: "nirma-university-book-delivery",
        url: "blog/nirma-university-book-delivery.html",
        title: "Union Minister Ashwini Vaishnaw Unveils Book Delivered by Revdrones at Nirma University",
        category: "Drone Industry News",
        photo: "https://www.revdrones.in/assets/uploads/1725467338_WhatsApp_Image_2024-09-03_at_10_43_05_AM1.jpeg",
        author: "Khushi Panchal",
        date: "15 March 2024",
        desc: "A landmark demonstration of autonomous payload delivery showcasing precision navigation and the growing potential of commercial drone logistics.",
      },
    ];

    const AUTOPLAY_MS = 5000;
    const TRANSITION_MS = 380;
    let blogIndex = 0;
    let blogTimer = null;
    let blogAnimating = false;

    const bEls = {
      photo: document.getElementById("blog-hero-photo"),
      img: document.getElementById("blog-img"),
      linkImg: document.getElementById("blog-hero-link-img"),
      body: document.getElementById("blog-body"),
      category: document.getElementById("blog-category"),
      title: document.getElementById("blog-title"),
      linkTitle: document.getElementById("blog-hero-link-title"),
      meta: document.getElementById("blog-meta"),
      desc: document.getElementById("blog-desc"),
      btn: document.getElementById("blog-hero-btn"),
      dots: document.getElementById("blog-dots"),
      prev: document.getElementById("blog-prev"),
      next: document.getElementById("blog-next"),
    };

    let bDotEls = [];
    function buildBlogDots() {
      if (!bEls.dots) return;
      bEls.dots.innerHTML = "";
      blogPosts.forEach((_, i) => {
        const d = document.createElement("div");
        d.className = "dot" + (i === 0 ? " active" : "");
        d.addEventListener("click", () => goToBlog(i));
        bEls.dots.appendChild(d);
      });
      bDotEls = bEls.dots.querySelectorAll(".dot");
    }

    function showCurrentBlog() {
      const p = blogPosts[blogIndex];
      if (!p) return;
      if (bEls.img) {
        bEls.img.src = p.photo;
        bEls.img.alt = p.title;
      }
      if (bEls.linkImg) bEls.linkImg.href = p.url;
      if (bEls.linkTitle) {
        bEls.linkTitle.href = p.url;
        bEls.linkTitle.textContent = p.title;
      }
      if (bEls.category) bEls.category.textContent = p.category;
      if (bEls.meta) bEls.meta.textContent = `${p.date}${p.author ? " · By " + p.author : ""}`;
      if (bEls.desc) bEls.desc.textContent = p.desc;
      if (bEls.btn) bEls.btn.href = p.url;
      bDotEls.forEach((d, i2) => d.classList.toggle("active", i2 === blogIndex));
    }

    function setBlog(i, direction) {
      if (!blogPosts.length) return;
      const nextIndex = (i + blogPosts.length) % blogPosts.length;
      if (nextIndex === blogIndex || blogAnimating) return;
      direction = direction || (nextIndex > blogIndex ? "next" : "prev");
      blogAnimating = true;

      const outClass = direction === "next" ? "blog-out-left" : "blog-out-right";
      const inClass = direction === "next" ? "blog-in-right" : "blog-in-left";

      if (bEls.body) bEls.body.classList.add(outClass);
      if (bEls.photo) bEls.photo.classList.add(outClass);

      setTimeout(() => {
        blogIndex = nextIndex;
        showCurrentBlog();

        [bEls.body, bEls.photo].forEach((el) => {
          if (el) {
            el.classList.add("blog-notransition");
            el.classList.remove(outClass);
            el.classList.add(inClass);
          }
        });

        if (bEls.body) void bEls.body.offsetWidth;

        [bEls.body, bEls.photo].forEach((el) => {
          if (el) el.classList.remove("blog-notransition", inClass);
        });

        setTimeout(() => {
          blogAnimating = false;
        }, TRANSITION_MS);
      }, TRANSITION_MS);
    }

    function goToBlog(i, direction) {
      setBlog(i, direction);
      restartBlogAutoplay();
    }
    function startBlogAutoplay() {
      clearInterval(blogTimer);
      blogTimer = setInterval(() => setBlog(blogIndex + 1, "next"), AUTOPLAY_MS);
    }
    function restartBlogAutoplay() {
      clearInterval(blogTimer);
      startBlogAutoplay();
    }

    buildBlogDots();
    showCurrentBlog();

    if (bEls.prev) bEls.prev.addEventListener("click", () => goToBlog(blogIndex - 1, "prev"));
    if (bEls.next) bEls.next.addEventListener("click", () => goToBlog(blogIndex + 1, "next"));

    blogHero.addEventListener("mouseenter", () => clearInterval(blogTimer));
    blogHero.addEventListener("mouseleave", () => restartBlogAutoplay());
    document.addEventListener("visibilitychange", () => {
      if (document.hidden) clearInterval(blogTimer);
      else restartBlogAutoplay();
    });

    startBlogAutoplay();

    // Fetch live posts from Supabase if available
    if (sbClient) {
      (async () => {
        try {
          const { data, error } = await sbClient
            .from("posts")
            .select("title, slug, category, cover_image_url, author, excerpt, content, created_at")
            .eq("published", true)
            .order("created_at", { ascending: false });

          if (!error && data && data.length > 0) {
            blogPosts = data.map((p) => ({
              slug: p.slug,
              url: `blog/post.html?slug=${encodeURIComponent(p.slug)}`,
              title: p.title,
              category: p.category || "News",
              photo: p.cover_image_url || "assets/og-image.png",
              author: p.author || "RevDrones Team",
              date: new Date(p.created_at).toLocaleDateString(undefined, { day: "numeric", month: "long", year: "numeric" }),
              desc: p.excerpt || (p.content ? p.content.replace(/<[^>]*>/g, "").slice(0, 160) + "…" : "Read our latest updates and insights."),
            }));
            blogIndex = 0;
            buildBlogDots();
            showCurrentBlog();
          }
        } catch (e) {}
      })();
    }
  }

  // ---------- Auto-load Chatbot on all pages ----------
  if (!document.getElementById("rev-chatbot-root") && !document.querySelector("script[src*='chatbot.js']")) {
    const isSubdir = window.location.pathname.includes("/blog/") || 
                     window.location.pathname.includes("/services/") || 
                     window.location.pathname.includes("/industries/") || 
                     window.location.pathname.includes("/saas/");
    const script = document.createElement("script");
    script.src = (isSubdir ? "../" : "") + "assets/chatbot.js";
    script.defer = true;
    document.body.appendChild(script);
  }
});

