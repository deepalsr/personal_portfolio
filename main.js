(function () {
  "use strict";

  /* ---- Local time in Nepal (real, not decorative) ---- */
  var clock = document.getElementById("clock");
  function tick() {
    try {
      clock.textContent = new Intl.DateTimeFormat("en-GB", {
        timeZone: "Asia/Kathmandu", hour: "2-digit", minute: "2-digit", hour12: false
      }).format(new Date());
    } catch (e) { clock.textContent = "UTC+5:45"; }
  }
  tick();
  setInterval(tick, 30000);

  /* ---- Current section -> header label + active nav ---- */
  var labels = { top: "Home", work: "Work", profile: "Profile", log: "Log", stack: "Stack", contact: "Contact" };
  var where = document.getElementById("where");
  var navLinks = document.querySelectorAll("[data-nav]");
  function setActive(id) {
    where.textContent = labels[id] || "Home";
    navLinks.forEach(function (a) {
      if (a.getAttribute("data-nav") === id) a.setAttribute("aria-current", "true");
      else a.removeAttribute("aria-current");
    });
  }
  if ("IntersectionObserver" in window) {
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (e) { if (e.isIntersecting) setActive(e.target.id); });
    }, { rootMargin: "-40% 0px -55% 0px" });
    Object.keys(labels).forEach(function (id) {
      var el = document.getElementById(id);
      if (el) io.observe(el);
    });
  }

  /* ---- Copy email ---- */
  var btn = document.getElementById("copy-btn");
  var label = document.getElementById("copy-label");
  var status = document.getElementById("copy-status");
  var email = document.getElementById("email-text");
  var resetTimer;
  function done(ok) {
    btn.setAttribute("data-state", ok ? "done" : "error");
    label.textContent = ok ? "Copied" : "Select + copy";
    status.textContent = ok ? "Email address copied" : "Copy failed. The address is selected, press Ctrl or Cmd + C.";
    clearTimeout(resetTimer);
    resetTimer = setTimeout(function () {
      btn.removeAttribute("data-state"); label.textContent = "Copy"; status.textContent = "";
    }, 2200);
  }
  function fallbackCopy() {
    var r = document.createRange(); r.selectNodeContents(email);
    var s = window.getSelection(); s.removeAllRanges(); s.addRange(r);
    var ok = false;
    try { ok = document.execCommand("copy"); } catch (e) {}
    done(ok);
  }
  btn.addEventListener("click", function () {
    var text = email.textContent.trim();
    if (navigator.clipboard && window.isSecureContext) {
      navigator.clipboard.writeText(text).then(function () { done(true); }, fallbackCopy);
    } else { fallbackCopy(); }
  });

  /* ---- Hero: rotating wireframe mesh ---- */
  var cv = document.getElementById("mesh");
  if (!cv || !cv.getContext) return;
  var ctx = cv.getContext("2d");
  var css = getComputedStyle(document.documentElement);
  var C = { cyan: css.getPropertyValue("--cyan").trim() || "#00F0FF",
            violet: css.getPropertyValue("--violet").trim() || "#8B5CF6",
            green: css.getPropertyValue("--green").trim() || "#00FF88" };
  var reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  var N = 72, pts = [], edges = [], ga = Math.PI * (3 - Math.sqrt(5)), i, j;
  for (i = 0; i < N; i++) {
    var y = 1 - (i / (N - 1)) * 2, r = Math.sqrt(1 - y * y), th = ga * i;
    pts.push({ x: Math.cos(th) * r, y: y, z: Math.sin(th) * r, tone: i % 11 === 0 ? C.green : (i % 7 === 0 ? C.violet : C.cyan) });
  }
  for (i = 0; i < N; i++) for (j = i + 1; j < N; j++) {
    var dx = pts[i].x - pts[j].x, dy = pts[i].y - pts[j].y, dz = pts[i].z - pts[j].z;
    if (Math.sqrt(dx * dx + dy * dy + dz * dz) < 0.62) edges.push([i, j]);
  }
  document.getElementById("mesh-nodes").textContent = N;
  document.getElementById("mesh-edges").textContent = edges.length;

  var w = 0, h = 0;
  function size() {
    var rect = cv.getBoundingClientRect(), dpr = Math.min(window.devicePixelRatio || 1, 2);
    w = rect.width; h = rect.height;
    cv.width = Math.round(w * dpr); cv.height = Math.round(h * dpr);
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
  }

  var t = 0, proj = new Array(N);
  function draw() {
    ctx.clearRect(0, 0, w, h);
    var cx = w / 2, cy = h / 2 - h * 0.03, R = Math.min(w, h) * 0.32;
    var a = t * 0.00035, b = 0.38, ca = Math.cos(a), sa = Math.sin(a), cb = Math.cos(b), sb = Math.sin(b);

    /* orbit rings */
    ctx.lineWidth = 1;
    ctx.strokeStyle = C.cyan; ctx.globalAlpha = 0.22;
    ctx.setLineDash([2, 5]); ctx.lineDashOffset = -t * 0.01;
    ctx.beginPath(); ctx.arc(cx, cy, R * 1.34, 0, Math.PI * 2); ctx.stroke();
    ctx.setLineDash([]); ctx.globalAlpha = 0.12;
    ctx.beginPath(); ctx.ellipse(cx, cy, R * 1.5, R * 0.42, -0.42, 0, Math.PI * 2); ctx.stroke();

    for (var k = 0; k < N; k++) {
      var p = pts[k];
      var x = p.x * ca + p.z * sa, z = -p.x * sa + p.z * ca;
      var yy = p.y * cb - z * sb; z = p.y * sb + z * cb;
      var s = 1 / (1 - z * 0.22);
      proj[k] = { x: cx + x * R * s, y: cy + yy * R * s, d: (z + 1) / 2, s: s };
    }
    ctx.strokeStyle = C.cyan;
    for (k = 0; k < edges.length; k++) {
      var A = proj[edges[k][0]], B = proj[edges[k][1]];
      ctx.globalAlpha = 0.06 + 0.3 * ((A.d + B.d) / 2);
      ctx.beginPath(); ctx.moveTo(A.x, A.y); ctx.lineTo(B.x, B.y); ctx.stroke();
    }
    /* one travelling highlight */
    var hi = edges[Math.floor(t / 260) % edges.length], HA = proj[hi[0]], HB = proj[hi[1]];
    ctx.globalAlpha = 0.95; ctx.strokeStyle = C.green; ctx.lineWidth = 1.5;
    ctx.beginPath(); ctx.moveTo(HA.x, HA.y); ctx.lineTo(HB.x, HB.y); ctx.stroke();
    ctx.lineWidth = 1;

    for (k = 0; k < N; k++) {
      var q = proj[k];
      ctx.globalAlpha = 0.25 + 0.75 * q.d;
      ctx.fillStyle = pts[k].tone;
      ctx.beginPath(); ctx.arc(q.x, q.y, 1.4 + 1.6 * q.d, 0, Math.PI * 2); ctx.fill();
    }
    ctx.globalAlpha = 1;
  }

  var raf = 0, visible = true;
  function loop(ts) { t = ts; draw(); raf = requestAnimationFrame(loop); }
  function start() { if (!raf && visible && !document.hidden && !reduce) raf = requestAnimationFrame(loop); }
  function stop() { if (raf) { cancelAnimationFrame(raf); raf = 0; } }

  size();
  if (reduce) { t = 2400; draw(); }
  window.addEventListener("resize", function () { size(); if (reduce) draw(); });
  if ("ResizeObserver" in window) new ResizeObserver(function () { size(); if (reduce) draw(); }).observe(cv);
  if ("IntersectionObserver" in window) {
    new IntersectionObserver(function (en) { visible = en[0].isIntersecting; visible ? start() : stop(); }).observe(cv);
  }
  document.addEventListener("visibilitychange", function () { document.hidden ? stop() : start(); });
  start();
})();
