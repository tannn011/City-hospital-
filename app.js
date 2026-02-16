// ========== Helpers ==========
const $ = (sel, root = document) => root.querySelector(sel);
const $$ = (sel, root = document) => [...root.querySelectorAll(sel)];

function clamp(n, min, max){ return Math.max(min, Math.min(max, n)); }

function formatTime(d = new Date()){
  const pad = (x) => String(x).padStart(2, "0");
  const day = pad(d.getDate());
  const mon = pad(d.getMonth() + 1);
  const yr  = d.getFullYear();
  let hr = d.getHours();
  const min = pad(d.getMinutes());
  const ampm = hr >= 12 ? "PM" : "AM";
  hr = hr % 12; hr = hr ? hr : 12;
  return `${day}-${mon}-${yr} ${hr}:${min} ${ampm}`;
}

// ========== Intro animation ==========
(function intro(){
  const introEl = $("#intro");
  const bar = $("#introBar");
  let p = 0;

  const tick = () => {
    p += Math.random() * 18;
    p = clamp(p, 0, 100);
    bar.style.width = `${p.toFixed(0)}%`;

    if(p >= 100){
      // smooth hide
      introEl.style.transition = "opacity .5s ease, transform .6s cubic-bezier(.2,.8,.2,1)";
      introEl.style.opacity = "0";
      introEl.style.transform = "translateY(-6px)";
      setTimeout(() => { introEl.style.display = "none"; }, 520);
      return;
    }
    requestAnimationFrame(tick);
  };

  // Small delay so user sees the brand
  setTimeout(() => requestAnimationFrame(tick), 350);
})();

// ========== Nav mobile toggle ==========
(function nav(){
  const toggle = $("#navToggle");
  const links = $("#navLinks");

  if(!toggle || !links) return;

  toggle.addEventListener("click", () => {
    const open = links.classList.toggle("is-open");
    toggle.setAttribute("aria-expanded", String(open));
  });

  // close on click link (mobile)

  $$("#navLinks a").forEach(a => {
    a.addEventListener("click", () => {
      links.classList.remove("is-open");
      toggle.setAttribute("aria-expanded", "false");
    });
  });
})();

// ========== Scroll progress bar ==========
(function scrollProgress(){
  const bar = $("#scrollBar");
  const onScroll = () => {
    const h = document.documentElement;
    const scrolled = h.scrollTop;
    const height = h.scrollHeight - h.clientHeight;
    const pct = height ? (scrolled / height) * 100 : 0;
    bar.style.width = `${pct}%`;
  };
  window.addEventListener("scroll", onScroll, { passive: true });
  onScroll();
})();

// ========== Parallax hero background ==========
(function parallax(){
  const bg = $("#parallaxBg");
  if(!bg) return;

  const onScroll = () => {
    const y = window.scrollY || 0;
    // subtle movement (calming)
    bg.style.transform = `translate3d(0, ${y * 0.08}px, 0)`;
  };

  window.addEventListener("scroll", onScroll, { passive: true });
  onScroll();
})();

// ========== Reveal on scroll (IntersectionObserver) ==========
(function reveal(){
  const items = $$(".reveal");
  if(!items.length) return;

  const io = new IntersectionObserver((entries) => {
    entries.forEach((e) => {
      if(e.isIntersecting){
        e.target.classList.add("is-visible");
        io.unobserve(e.target);
      }
    });
  }, { threshold: 0.14 });

  items.forEach(el => io.observe(el));
})();

// ========== Animated counters ==========
(function counters(){
  const nodes = $$("[data-counter]");
  if(!nodes.length) return;

  const animate = (el) => {
    const target = Number(el.getAttribute("data-counter") || 0);
    const duration = 900;
    const start = performance.now();
    const from = 0;

    const step = (t) => {
      const p = clamp((t - start) / duration, 0, 1);
      // easeOutCubic
      const eased = 1 - Math.pow(1 - p, 3);
      const val = Math.round(from + (target - from) * eased);
      el.textContent = String(val);
      if(p < 1) requestAnimationFrame(step);
    };

    requestAnimationFrame(step);
  };

  const io = new IntersectionObserver((entries) => {
    entries.forEach(e => {
      if(e.isIntersecting){
        animate(e.target);
        io.unobserve(e.target);
      }
    });
  }, { threshold: 0.35 });

  nodes.forEach(n => io.observe(n));
})();

// ========== Pills -> sync to department select ==========
(function pills(){
  const pills = $$(".pill");
  const dept = $("#department");
  if(!pills.length || !dept) return;

  pills.forEach(p => {
    p.addEventListener("click", () => {
      pills.forEach(x => x.classList.remove("is-active"));
      p.classList.add("is-active");
      const val = p.getAttribute("data-pill");
      // set select if option exists
      const options = [...dept.options].map(o => o.text);
      if(options.includes(val)) dept.value = val;
      // scroll to form smoothly if user wants
      $("#appointment").scrollIntoView({ behavior: "smooth", block: "start" });
    });
  });
})();

// ========== Bed Availability (demo simulation) ==========
(function beds(){
  // totals (can be changed)
  const totals = {
    gw: Number($("#gwTotal")?.textContent || 60),
    icu: Number($("#icuTotal")?.textContent || 20),
    pr: Number($("#prTotal")?.textContent || 40),
  };

  // initial (demo)
  let state = {
    gw: 18,
    icu: 4,
    pr: 10,
  };

  function badgeText(avail, total){
    const ratio = avail / total;
    if(ratio >= 0.5) return "Good";
    if(ratio >= 0.2) return "Limited";
    return "Critical";
  }

  function setUI(){
    // Hero mini-card
    $("#gwCount").textContent = state.gw;
    $("#icuCount").textContent = state.icu;
    $("#prCount").textContent = state.pr;

    $("#gwMeter").style.width = `${(state.gw / totals.gw) * 100}%`;
    $("#icuMeter").style.width = `${(state.icu / totals.icu) * 100}%`;
    $("#prMeter").style.width = `${(state.pr / totals.pr) * 100}%`;

    // Dashboard
    $("#gwAvail").textContent = state.gw;
    $("#icuAvail").textContent = state.icu;
    $("#prAvail").textContent = state.pr;

    $("#gwDashFill").style.width = `${(state.gw / totals.gw) * 100}%`;
    $("#icuDashFill").style.width = `${(state.icu / totals.icu) * 100}%`;
    $("#prDashFill").style.width = `${(state.pr / totals.pr) * 100}%`;

    $("#gwBadge").textContent = badgeText(state.gw, totals.gw);
    $("#icuBadge").textContent = badgeText(state.icu, totals.icu);
    $("#prBadge").textContent = badgeText(state.pr, totals.pr);

    $("#lastUpdated").textContent = formatTime(new Date());
  }

  function simulateUpdate(){
    // Calm variation (not too jumpy)
    const vary = (v, total) => clamp(v + (Math.random() > 0.5 ? 1 : -1) * (Math.random() > 0.6 ? 2 : 1), 0, total);
    state = {
      gw: vary(state.gw, totals.gw),
      icu: vary(state.icu, totals.icu),
      pr: vary(state.pr, totals.pr),
    };
    setUI();
  }

  setUI();
  // update every 10 seconds (demo)
  setInterval(simulateUpdate, 10000);
})();

// ========== Appointment -> WhatsApp prefilled ==========
(function appointment(){
  const form = $("#appointmentForm");
  if(!form) return;

  form.addEventListener("submit", (e) => {
    e.preventDefault();

    const fd = new FormData(form);

    const tests = fd.getAll("tests");
    const msg = [
      "🩺 City Hospital - Appointment Request",
      "",
      `Name: ${fd.get("fullName") || ""}`,
      `Phone: ${fd.get("phone") || ""}`,
      `Email: ${fd.get("email") || "-"}`,
      `Age: ${fd.get("age") || ""}`,
      `Gender: ${fd.get("gender") || ""}`,
      "",
      `Department: ${fd.get("department") || ""}`,
      `Visit Type: ${fd.get("visitType") || ""}`,
      `Priority: ${fd.get("priority") || ""}`,
      `Preferred Date: ${fd.get("date") || ""}`,
      `Preferred Time: ${fd.get("time") || ""}`,
      "",
      "Symptoms/Issue:",
      `${fd.get("symptoms") || ""}`,
      "",
      `Diagnosis/Tests: ${tests.length ? tests.join(", ") : "-"}`,
      "",
      `Additional Notes: ${fd.get("notes") || "-"}`,
      "",
      "Sent from City Hospital website."
    ].join("\n");

    // IMPORTANT: WhatsApp requires user interaction; we open chat with prefilled text.
    const phone = "918605463560";
    const url = `https://wa.me/${phone}?text=${encodeURIComponent(msg)}`;
    window.open(url, "_blank", "noopener,noreferrer");
  });
})();

// ========== Footer year ==========
(function year(){
  const y = $("#year");
  if(y) y.textContent = String(new Date().getFullYear());
})();
        
