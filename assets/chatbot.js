// ============================================================
// RevDrones — Instant AI Flight Assistant (Chatbot)
// Sub-second intelligent responses for all RevDrones inquiries
// ============================================================

(function () {
  if (typeof window === "undefined" || document.getElementById("rev-chatbot-root")) return;

  // --- Knowledge Base & Intent Matching Engine ---
  const KNOWLEDGE_BASE = [
    {
      keywords: ["hi", "hello", "hey", "greetings", "good morning", "good afternoon", "good evening", "howdy", "sup", "namaste"],
      response: "Hello! I am **RevDrones Flight Assistant** 🚁. How can I assist you today? You can ask me about our **drone services** (agriculture, survey, inspection), **SaaS platform**, **pricing/booking**, **industries**, or **contact info**!"
    },
    {
      keywords: ["who are you", "what are you", "what is this", "bot", "assistant"],
      response: "I am the **RevDrones AI Operations Assistant**. I'm here to provide instant answers about our aerial services, drone technology, booking flights, software analytics, pilot training, and company operations!"
    },
    {
      keywords: ["service", "services", "what do you do", "what you provide", "offerings", "solutions"],
      response: "RevDrones provides end-to-end aerial operations across 3 main pillars:\n\n1. 🌾 **Precision Agriculture**: High-capacity crop spraying, health mapping & NDVI crop analysis.\n2. 🗺️ **Surveying & Mapping**: High-precision orthomosaics, 3D elevation models (DEM/DSM), GIS surveys, and stockpile volume estimation.\n3. 🔍 **Industrial Inspection**: Visual & thermal NDT inspection of flare stacks, wind turbines, solar panels, powerlines, and pipeline corridors.\n\nWould you like more details on a specific service?"
    },
    {
      keywords: ["agriculture", "spraying", "crop", "pesticide", "farm", "fertilizer", "ndvi", "farming", "farmer"],
      response: "🌱 **Agriculture Drone Solutions**:\n- **Precision Spraying**: High-capacity quadcopter & hexacopter sprayers that apply fertilizers/pesticides with zero crop trampling and 90% water savings.\n- **Crop Health Analysis**: Multispectral NDVI cameras to detect pest infestations, water stress, and fertilizer deficiencies early.\n- **Coverage**: Up to 30–50 acres per day per drone.\n\n👉 You can request an agriculture mission directly in our [Booking Form](#contact)."
    },
    {
      keywords: ["survey", "surveying", "mapping", "orthomosaic", "gis", "topography", "dem", "dsm", "point cloud", "contour", "land survey"],
      response: "🗺️ **Surveying & Mapping Drone Services**:\n- **Survey-Grade Accuracy**: High-resolution orthomosaics, digital elevation models (DEM/DSM), and 3D point clouds.\n- **Key Applications**: Land title mapping, road & railway corridor alignment, mining volume measurements, and construction planning.\n- **Sensors**: High-res photogrammetry, RTK/PPK GNSS positioning, and LiDAR sensors for dense vegetation penetration."
    },
    {
      keywords: ["inspection", "thermal", "industrial inspection", "crack", "corrosion", "solar panel", "flare", "stack", "pipeline", "powerline", "wind turbine"],
      response: "🔍 **Industrial Inspection Drone Services**:\n- **Thermal & Visual NDT**: High-resolution zoom and radiometric thermal cameras detect hairline cracks, hot spots, gas leaks, and corrosion.\n- **Assets We Inspect**: Solar farms, wind turbine blades, power transmission towers, refineries, flare stacks, and long-distance pipelines.\n- **Safety & Speed**: Replaces hazardous scaffolding and manual rope access, completing inspections 5x faster."
    },
    {
      keywords: ["saas", "revolutionized", "software", "ai software", "platform", "portal", "cloud", "intelligence"],
      response: "⚡ **Revolutionized — SaaS Intelligence Platform**:\nOur proprietary AI platform turns raw aerial footage into automated defect analytics:\n\n- **Revolutionized Wind**: AI blade crack, erosion & lightning strike detection.\n- **Revolutionized Solar**: Automated hotspot, string failure & panel-level fault mapping.\n- **Revolutionized Powerline**: Component-level defect detection & clearance encroachment.\n- **Revolutionized Pipeline**: Thermal leak detection & right-of-way corridor analysis.\n\nExplore our [SaaS Platform](saas.html) for early access!"
    },
    {
      keywords: ["solar", "solar farm", "solar panel", "photovoltaic", "pv"],
      response: "☀️ **Solar Drone Intelligence**:\n- Automated aerial thermal inspection maps hot spots, diode failures, and string anomalies to exact panel IDs on your site CAD layout.\n- Identifies dust/soiling accumulation to optimize cleaning schedules and improve energy generation efficiency."
    },
    {
      keywords: ["wind", "wind turbine", "blade", "turbine"],
      response: "🌬️ **Wind Turbine Blade Inspection**:\n- High-resolution automated defect classification for leading-edge erosion, structural cracks, and lightning strikes.\n- Generates prioritized repair queues so maintenance teams know exactly which blades need immediate attention."
    },
    {
      keywords: ["powerline", "transmission", "substation", "grid", "wire", "tower", "insulator"],
      response: "⚡ **Powerline Corridor Inspection**:\n- Automated analysis of transmission corridors covering miles in hours.\n- Flags damaged or flashed-over insulators, abnormal conductor sag, and vegetation encroaching into clearance zones."
    },
    {
      keywords: ["pipeline", "leak", "oil pipe", "gas pipe", "encroachment"],
      response: "🛢️ **Pipeline Corridor Analysis**:\n- Aerial thermal and RGB monitoring for long-distance oil, gas, and water pipelines.\n- Detects subsurface leak thermal indicators, exposed pipe sections, coating damage, and unauthorized corridor encroachment."
    },
    {
      keywords: ["industries", "industry", "sectors", "who do you serve", "clients"],
      response: "🏭 **Industries We Serve**:\n1. **Agriculture**: Crop health, precision spraying & yield estimation.\n2. **Renewable Energy**: Solar farms and wind turbine maintenance.\n3. **Mining**: Quarry surveys, pit volumetrics, stockpile calculations & safety audits.\n4. **Oil & Gas**: Pipeline integrity, refinery inspection & flare stack monitoring.\n5. **Construction & Infrastructure**: Progress tracking, BIM overlay & site surveys.\n6. **Academics**: Drone lab setup & certified pilot training programs."
    },
    {
      keywords: ["academics", "education", "college", "university", "rpto", "student", "workshop", "lab setup", "training"],
      response: "🎓 **Academics & Training Solutions**:\n- **Drone Lab Setup**: End-to-end hardware, simulation software, and curriculum for engineering colleges and institutes.\n- **Workshops**: Hands-on drone building, piloting, and aerial data processing workshops.\n- **RPTO Support**: Remote Pilot Training Organization setup to help students get DGCA-certified pilot licenses."
    },
    {
      keywords: ["contact", "email", "phone", "call", "address", "location", "office", "reach", "headquarters", "where"],
      response: "📍 **Contact RevDrones**:\n- **Office**: C/7, Tower A, Indraprastha Complex, Race Course, Vadodara, Gujarat 390018, India.\n- **Direct Call / WhatsApp**: **(+91)-9724582624**\n- **General Inquiries**: [info.revdrones@gmail.com](mailto:info.revdrones@gmail.com)\n- **Careers & HR**: [hr.revdrones@gmail.com](mailto:hr.revdrones@gmail.com)\n- **Operations**: [khushi.revdrones@gmail.com](mailto:khushi.revdrones@gmail.com)"
    },
    {
      keywords: ["book", "booking", "hire", "consultation", "request flight", "flight request", "schedule", "how to book"],
      response: "📅 **How to Book a RevDrones Mission**:\n1. Scroll to our **[Booking Form](#contact)**.\n2. Fill in your name, contact info, service type (Spraying, Survey, Inspection), and preferred date.\n3. Our ops team will review airspace permissions, map flight paths, and confirm scheduling within 1 business day!"
    },
    {
      keywords: ["price", "pricing", "cost", "how much", "rate", "quotation", "quote", "charges"],
      response: "💰 **Pricing & Quotations**:\nDrone mission costs depend on project size (acreage, corridor length, asset quantity) and data deliverables (2D maps, 3D models, thermal reports).\n\n👉 Contact us directly at **(+91)-9724582624** or submit a quick request via our **[Contact Form](#contact)** for a custom, competitive quote!"
    },
    {
      keywords: ["career", "careers", "job", "jobs", "hiring", "internship", "intern", "apply", "pilot job", "vacancy"],
      response: "💼 **Careers & Internships at RevDrones**:\n- We are constantly looking for passionate **Certified Drone Pilots**, GIS Analysts, and AI Engineers.\n- **Student Internship Program**: Real-world hands-on flight ops and data processing. Apply through our [Internship Application Form](https://docs.google.com/forms/d/e/1FAIpQLSc6xynV7C4WUUTk79uMRx6FoVmYNg5KABErlADyxc9UaglDmQ/viewform) or send your CV to **hr.revdrones@gmail.com**!"
    },
    {
      keywords: ["pilot", "pilots", "dgca", "certified", "license", "permission", "digital sky", "regulations", "safe", "safety"],
      response: "🛡️ **Safety & DGCA Compliance**:\n- All RevDrones operations are flown by **certified remote pilots** with comprehensive flight log records.\n- Every mission complies strictly with Directorate General of Civil Aviation (DGCA) regulations and Digital Sky airspace green/yellow/red zone approvals."
    },
    {
      keywords: ["drones", "drone models", "hardware", "range", "altitude", "battery", "hexacopter", "vtol", "quadcopter", "specs"],
      response: "🛰️ **Our Drone Fleet & Capabilities**:\n- **Hexacopter / Heavy-lift Sprayers**: 10L to 30L payload capacity for agriculture.\n- **VTOL Fixed-Wing**: Long-range mapping covering 15km+ corridor ranges and hours of endurance.\n- **Inspection Quadcopters**: Equipped with 4K optical zoom, radiometric thermal sensors, and RTK centimeter-precision positioning."
    },
    {
      keywords: ["weather", "rain", "wind limit", "night", "conditions"],
      response: "🌦️ **Flight Conditions & Limits**:\n- Our industrial drones can safely operate in winds up to 35–40 km/h.\n- Flights are paused during heavy precipitation/rain or severe thunderstorm warnings for data quality and safety."
    },
    {
      keywords: ["vadodara", "gujarat", "ahmedabad", "surat", "rajkot", "india"],
      response: "🇮🇳 **Service Locations**:\nRevDrones is headquartered in **Vadodara, Gujarat**, and provides drone spraying, surveying, and industrial inspection missions across Gujarat and all over India."
    },
    {
      keywords: ["thank", "thanks", "helpful", "great", "awesome", "perfect", "good"],
      response: "You're very welcome! Feel free to ask if you have any other questions, or reach out to us at **(+91)-9724582624** / **info.revdrones@gmail.com**."
    },
    {
      keywords: ["bye", "goodbye", "see you"],
      response: "Goodbye! Have a great day ahead. Safe flying and see you soon! 🚁"
    }
  ];

  // Fuzzy search / keyword matcher with scoring
  function findAnswer(query) {
    const cleanQuery = query.toLowerCase().trim().replace(/[^\w\s]/g, " ");
    const words = cleanQuery.split(/\s+/).filter(Boolean);
    if (!words.length) {
      return "How can I help you today? Ask me about our drone services, SaaS analytics, pricing, or locations!";
    }

    let bestMatch = null;
    let highestScore = 0;

    for (const item of KNOWLEDGE_BASE) {
      let score = 0;
      for (const kw of item.keywords) {
        const kwLower = kw.toLowerCase();
        if (cleanQuery === kwLower) {
          score += 15;
        } else if (cleanQuery.includes(kwLower)) {
          score += 6 + kwLower.length * 0.5;
        } else {
          const kwWords = kwLower.split(" ");
          for (const w of words) {
            if (kwWords.includes(w)) score += 3;
            else if (w.length > 3 && kwLower.includes(w)) score += 1.5;
          }
        }
      }
      if (score > highestScore) {
        highestScore = score;
        bestMatch = item.response;
      }
    }

    if (highestScore >= 3 && bestMatch) {
      return bestMatch;
    }

    // Default intelligent fallback
    return `I can help with that! At **RevDrones**, we specialize in **Precision Agriculture Spraying**, **Surveying & Mapping (GIS/LiDAR)**, and **Industrial Visual & Thermal Inspection**, as well as our **Revolutionized SaaS** platform.\n\nFor specific project requirements or custom pricing, please contact our team directly at **(+91)-9724582624** or [info.revdrones@gmail.com](mailto:info.revdrones@gmail.com), or submit our [Booking Form](#contact)!`;
  }

  // Format basic markdown (bold, links, line breaks)
  function formatMarkdown(text) {
    let html = text
      .replace(/\*\*(.*?)\*\*/g, "<strong>$1</strong>")
      .replace(/\[(.*?)\]\((.*?)\)/g, '<a href="$2" class="chat-link" target="_self">$1</a>')
      .replace(/\n\n/g, "<br><br>")
      .replace(/\n/g, "<br>");
    return html;
  }

  // --- Inject Chatbot UI into DOM ---
  function initChatbot() {
    const root = document.createElement("div");
    root.id = "rev-chatbot-root";
    root.className = "rev-chatbot";

    root.innerHTML = `
      <!-- Radar Ping Rings -->
      <div class="chat-radar-ring ring-1"></div>
      <div class="chat-radar-ring ring-2"></div>
      
      <!-- Interactive Tooltip -->
      <div class="chat-tooltip" id="chat-tooltip">
        <span class="tooltip-sparkle">⚡</span>
        <span>Ask Flight AI</span>
      </div>

      <!-- Launcher Button with Animated Drone -->
      <button class="chat-launcher" id="chat-launcher" aria-label="Open RevDrones Chatbot">
        <span class="chat-launcher-badge">AI 24/7</span>
        <div class="chat-launcher-icon chat-icon-open drone-icon-wrap">
          <svg class="drone-svg" width="34" height="34" viewBox="0 0 36 36" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M12 12L24 24M24 12L12 24" stroke="currentColor" stroke-width="2.2" stroke-linecap="round"/>
            <circle cx="8" cy="8" r="3.2" stroke="#e63946" stroke-width="1.6" fill="#0d1338"/>
            <circle cx="28" cy="8" r="3.2" stroke="#e63946" stroke-width="1.6" fill="#0d1338"/>
            <circle cx="8" cy="28" r="3.2" stroke="#e63946" stroke-width="1.6" fill="#0d1338"/>
            <circle cx="28" cy="28" r="3.2" stroke="#e63946" stroke-width="1.6" fill="#0d1338"/>
            <g class="propeller prop-tl"><path d="M4 8H12" stroke="#ff8790" stroke-width="1.6" stroke-linecap="round"/></g>
            <g class="propeller prop-tr"><path d="M24 8H32" stroke="#ff8790" stroke-width="1.6" stroke-linecap="round"/></g>
            <g class="propeller prop-bl"><path d="M4 28H12" stroke="#ff8790" stroke-width="1.6" stroke-linecap="round"/></g>
            <g class="propeller prop-br"><path d="M24 28H32" stroke="#ff8790" stroke-width="1.6" stroke-linecap="round"/></g>
            <polygon points="18,10 25,18 18,26 11,18" fill="#e63946" stroke="#ff8790" stroke-width="1.2"/>
            <circle cx="18" cy="18" r="2.2" fill="#ffffff" class="ai-core-pulse"/>
          </svg>
        </div>
        <div class="chat-launcher-icon chat-icon-close close-icon-wrap" style="display:none;">
          <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round">
            <line x1="18" y1="6" x2="6" y2="18"></line>
            <line x1="6" y1="6" x2="18" y2="18"></line>
          </svg>
        </div>
      </button>

      <!-- Chat Window -->
      <div class="chat-window" id="chat-window" style="display:none;">
        <!-- Header -->
        <div class="chat-header">
          <div class="chat-header-info">
            <div class="chat-avatar">
              <div class="avatar-reticle"></div>
              <svg class="avatar-drone-svg" width="22" height="22" viewBox="0 0 36 36" fill="none">
                <path d="M12 12L24 24M24 12L12 24" stroke="#e63946" stroke-width="2.2" stroke-linecap="round"/>
                <circle cx="8" cy="8" r="2.5" fill="#e63946"/>
                <circle cx="28" cy="8" r="2.5" fill="#e63946"/>
                <circle cx="8" cy="28" r="2.5" fill="#e63946"/>
                <circle cx="28" cy="28" r="2.5" fill="#e63946"/>
                <polygon points="18,10 25,18 18,26 11,18" fill="#e63946" stroke="#ff8790" stroke-width="1"/>
                <circle cx="18" cy="18" r="2" fill="#fff"/>
              </svg>
              <span class="chat-online-dot"></span>
            </div>
            <div>
              <div class="chat-title">RevDrones Flight AI</div>
              <div class="chat-status"><span class="live-status-radar"></span> Instant Operations Assistant</div>
            </div>
          </div>
          <div class="chat-header-actions">
            <button class="chat-btn-icon" id="chat-clear-btn" title="Clear chat history">
              <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <polyline points="3 6 5 6 21 6"></polyline>
                <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path>
              </svg>
            </button>
            <button class="chat-btn-icon" id="chat-close-btn" title="Close chat">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2">
                <line x1="18" y1="6" x2="6" y2="18"></line>
                <line x1="6" y1="6" x2="18" y2="18"></line>
              </svg>
            </button>
          </div>
        </div>

        <!-- Suggestion Chips -->
        <div class="chat-chips" id="chat-chips">
          <button class="chat-chip" data-query="What services do you offer?">🌾 Services</button>
          <button class="chat-chip" data-query="How do I book a drone?">📅 Book a flight</button>
          <button class="chat-chip" data-query="Tell me about agriculture spraying">🌱 Agriculture</button>
          <button class="chat-chip" data-query="Where are you located?">📍 Contact info</button>
          <button class="chat-chip" data-query="Tell me about Revolutionized SaaS">⚡ SaaS Platform</button>
          <button class="chat-chip" data-query="Do you have student internships?">🎓 Careers & Internships</button>
        </div>

        <!-- Message Body -->
        <div class="chat-body" id="chat-body">
          <div class="chat-msg bot-msg">
            <div class="msg-bubble">
              Hello! 👋 I'm your **RevDrones Flight Assistant**. How can I help you today? Ask me anything about our drone services, SaaS platform, booking, or contact details!
            </div>
            <div class="msg-time">Just now</div>
          </div>
        </div>

        <!-- Input Box -->
        <form class="chat-footer" id="chat-form">
          <input 
            type="text" 
            id="chat-input" 
            placeholder="Ask anything about RevDrones..." 
            autocomplete="off" 
            required 
          />
          <button type="submit" class="chat-send-btn" id="chat-send-btn" aria-label="Send Message">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
              <line x1="22" y1="2" x2="11" y2="13"></line>
              <polygon points="22 2 15 22 11 13 2 9 22 2"></polygon>
            </svg>
          </button>
        </form>
      </div>
    `;

    document.body.appendChild(root);

    // Event listeners
    const launcher = document.getElementById("chat-launcher");
    const chatWin = document.getElementById("chat-window");
    const closeBtn = document.getElementById("chat-close-btn");
    const clearBtn = document.getElementById("chat-clear-btn");
    const form = document.getElementById("chat-form");
    const input = document.getElementById("chat-input");
    const chatBody = document.getElementById("chat-body");
    const chips = document.getElementById("chat-chips");
    const iconOpen = launcher.querySelector(".chat-icon-open");
    const iconClose = launcher.querySelector(".chat-icon-close");

    let isOpen = false;

    function toggleChat(open) {
      isOpen = typeof open === "boolean" ? open : !isOpen;
      chatWin.style.display = isOpen ? "flex" : "none";
      iconOpen.style.display = isOpen ? "none" : "flex";
      iconClose.style.display = isOpen ? "flex" : "none";
      launcher.classList.toggle("active", isOpen);
      if (isOpen) {
        setTimeout(() => input.focus(), 150);
        scrollToBottom();
      }
    }

    launcher.addEventListener("click", () => toggleChat());
    closeBtn.addEventListener("click", () => toggleChat(false));

    clearBtn.addEventListener("click", () => {
      chatBody.innerHTML = `
        <div class="chat-msg bot-msg">
          <div class="msg-bubble">
            Chat cleared! How can I help you today?
          </div>
          <div class="msg-time">Just now</div>
        </div>
      `;
    });

    function scrollToBottom() {
      chatBody.scrollTop = chatBody.scrollHeight;
    }

    function appendMessage(text, isUser = false) {
      const msg = document.createElement("div");
      msg.className = `chat-msg ${isUser ? "user-msg" : "bot-msg"}`;
      const now = new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });

      msg.innerHTML = `
        <div class="msg-bubble">${isUser ? text : formatMarkdown(text)}</div>
        <div class="msg-time">${now}</div>
      `;
      chatBody.appendChild(msg);
      scrollToBottom();
    }

    function showTypingIndicator() {
      const typing = document.createElement("div");
      typing.id = "chat-typing";
      typing.className = "chat-msg bot-msg chat-typing";
      typing.innerHTML = `
        <div class="msg-bubble typing-dots">
          <span></span><span></span><span></span>
        </div>
      `;
      chatBody.appendChild(typing);
      scrollToBottom();
      return typing;
    }

    function handleSend(userText) {
      if (!userText.trim()) return;
      appendMessage(userText, true);

      // Show typing indicator briefly for natural feeling (< 250ms for sub-second response)
      const typingEl = showTypingIndicator();

      setTimeout(() => {
        if (typingEl && typingEl.parentNode) typingEl.parentNode.removeChild(typingEl);
        const botReply = findAnswer(userText);
        appendMessage(botReply, false);
      }, 200);
    }

    form.addEventListener("submit", (e) => {
      e.preventDefault();
      const txt = input.value.trim();
      if (!txt) return;
      input.value = "";
      handleSend(txt);
    });

    // Chips clicks
    chips.querySelectorAll(".chat-chip").forEach((chip) => {
      chip.addEventListener("click", () => {
        const query = chip.dataset.query;
        handleSend(query);
      });
    });
  }

  // Run on DOM ready
  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", initChatbot);
  } else {
    initChatbot();
  }
})();
