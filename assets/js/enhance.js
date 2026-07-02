/* ============================================================
   ultrarare.design — KOTA-inspired enhancements
   Smooth scroll (Lenis), custom cursor, masked heading reveals.
   Loaded after Lenis CDN + main.js + animations.js.
   ============================================================ */
(function () {
  "use strict";

  var html = document.documentElement;
  html.classList.add("enh-ready");

  var reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  var hasIO = "IntersectionObserver" in window;

  /* ---- Masked heading reveals (word-by-word unmask) ---- */
  function splitHeading(el) {
    if (el.dataset.split) return;
    el.dataset.split = "1";
    el.classList.add("rh");
    var parts = el.textContent.split(/(\s+)/);
    el.textContent = "";
    parts.forEach(function (part) {
      if (part === "") return;
      if (/^\s+$/.test(part)) {
        el.appendChild(document.createTextNode(part));
        return;
      }
      var outer = document.createElement("span");
      outer.className = "rw";
      var inner = document.createElement("span");
      inner.className = "rw__i";
      inner.textContent = part;
      outer.appendChild(inner);
      el.appendChild(outer);
    });
    el.querySelectorAll(".rw__i").forEach(function (inner, i) {
      inner.style.setProperty("--wd", i * 45 + "ms");
    });
  }

  document.querySelectorAll(".section__title, .cta-banner__title").forEach(splitHeading);

  if (hasIO) {
    var hio = new IntersectionObserver(
      function (entries) {
        entries.forEach(function (entry) {
          if (!entry.isIntersecting) return;
          entry.target.classList.add("is-revealed");
          hio.unobserve(entry.target);
        });
      },
      { threshold: 0.2, rootMargin: "0px 0px -10% 0px" }
    );
    document.querySelectorAll(".rh").forEach(function (h) { hio.observe(h); });
  } else {
    document.querySelectorAll(".rh").forEach(function (h) { h.classList.add("is-revealed"); });
  }

  /* ---- Custom cursor (hover + fine-pointer devices only) ---- */
  if (!reduce && window.matchMedia("(hover: hover) and (pointer: fine)").matches) {
    var cur = document.createElement("div");
    cur.className = "cursor cursor--hidden";
    cur.setAttribute("aria-hidden", "true");
    cur.innerHTML = '<span class="cursor__label">Coming soon</span>';
    document.body.appendChild(cur);
    html.classList.add("has-cursor");

    var tx = window.innerWidth / 2, ty = window.innerHeight / 2;
    var cx = tx, cy = ty, started = false;

    window.addEventListener("mousemove", function (e) {
      tx = e.clientX; ty = e.clientY;
      if (!started) { started = true; cur.classList.remove("cursor--hidden"); }
    }, { passive: true });
    document.addEventListener("mouseleave", function () { cur.classList.add("cursor--hidden"); });
    document.addEventListener("mouseenter", function () { cur.classList.remove("cursor--hidden"); });

    var curLabel = cur.querySelector(".cursor__label");
    document.querySelectorAll(".work-card").forEach(function (el) {
      el.addEventListener("mouseenter", function () {
        curLabel.textContent = el.dataset.cursorLabel || "Coming soon";
        cur.classList.add("cursor--view");
      });
      el.addEventListener("mouseleave", function () { cur.classList.remove("cursor--view"); });
    });

    (function loop() {
      cx += (tx - cx) * 0.18;
      cy += (ty - cy) * 0.18;
      cur.style.transform = "translate(" + cx.toFixed(1) + "px," + cy.toFixed(1) + "px) translate(-50%,-50%)";
      window.requestAnimationFrame(loop);
    })();
  }

  /* ---- Allow real work-card links to navigate (override main.js blanket preventDefault) ---- */
  document.addEventListener("click", function (e) {
    var card = e.target.closest(".work-card");
    if (!card) return;
    var href = card.getAttribute("href");
    if (href && href !== "#") e.stopImmediatePropagation();
  }, true);

  /* ---- Smooth scroll (Lenis) ---- */
  if (!reduce && typeof window.Lenis !== "undefined") {
    var lenis = new window.Lenis({
      duration: 1.1,
      easing: function (t) { return Math.min(1, 1.001 - Math.pow(2, -10 * t)); }
    });
    (function raf(time) { lenis.raf(time); window.requestAnimationFrame(raf); })();

    /* Keep the scroll-driven runner / progress / reveals in sync */
    lenis.on("scroll", function () { window.dispatchEvent(new Event("scroll")); });

    /* Route in-page anchors through Lenis (offset clears the sticky nav) */
    document.querySelectorAll('a[href^="#"]').forEach(function (a) {
      a.addEventListener("click", function (e) {
        var id = a.getAttribute("href");
        if (!id || id === "#") return;
        var target = id === "#top" ? 0 : document.querySelector(id);
        if (target === null) return;
        e.preventDefault();
        lenis.scrollTo(target, { offset: -64 });
      });
    });
  }
})();
