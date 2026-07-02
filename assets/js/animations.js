/* ============================================================
   ultrarare.design — animation controller
   New file. Drives, from one rAF scroll loop:
     - --progress (0..1) on :root  → top ship-progress bar + ring
     - the build-status pill (Brief → Designing → … → Shipped · 48h)
     - parallax drift of the fixed ambient lights
     - nav .scrolled (glass + compaction) past 60px
   Plus the services scroll-reveal choreography (IntersectionObserver).
   Does not touch main.js (which still drives [data-reveal]).
   ============================================================ */
(function () {
  "use strict";

  document.documentElement.classList.add("anim-ready");

  var reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  var root = document.documentElement;
  var nav = document.getElementById("nav");
  var track = document.querySelector(".ship-track");
  var status = document.querySelector(".build-status");
  var label = status && status.querySelector(".build-status__label");
  var pct = status && status.querySelector(".build-status__pct");

  /* Narrative stages keyed to scroll progress */
  var stages = [
    { at: 0.00, name: "Brief" },
    { at: 0.20, name: "Designing" },
    { at: 0.45, name: "Building" },
    { at: 0.78, name: "Shipping" }
  ];

  var ticking = false;

  function render() {
    ticking = false;

    var y = window.scrollY || window.pageYOffset || 0;
    var max = document.documentElement.scrollHeight - window.innerHeight;
    var p = max > 0 ? Math.min(1, Math.max(0, y / max)) : 0;

    root.style.setProperty("--progress", p.toFixed(4));

    if (nav) nav.classList.toggle("scrolled", y > 60);

    var shipped = p >= 0.999;
    if (track) track.classList.toggle("is-shipped", shipped);
    if (status) {
      status.classList.toggle("is-shipped", shipped);
      if (shipped) {
        if (label) label.textContent = "Shipped · 48h";
        if (pct) pct.textContent = "";
      } else {
        var name = stages[0].name;
        for (var i = 0; i < stages.length; i++) {
          if (p >= stages[i].at) name = stages[i].name;
        }
        if (label) label.textContent = name;
        if (pct) pct.textContent = Math.round(p * 100) + "%";
      }
    }
  }

  function onScroll() {
    if (!ticking) {
      ticking = true;
      window.requestAnimationFrame(render);
    }
  }

  window.addEventListener("scroll", onScroll, { passive: true });
  window.addEventListener("resize", onScroll, { passive: true });
  render();

  /* ---- Services: reveal headline/sub, pillars, and items ---- */
  if (reduce || !("IntersectionObserver" in window)) return;

  var io = new IntersectionObserver(
    function (entries) {
      entries.forEach(function (entry) {
        if (!entry.isIntersecting) return;
        entry.target.classList.add("in");
        if (entry.target.classList.contains("pillar")) {
          entry.target.querySelectorAll(".svc").forEach(function (item) {
            item.classList.add("in");
          });
        }
        io.unobserve(entry.target);
      });
    },
    { threshold: 0.15, rootMargin: "0px 0px -8% 0px" }
  );

  document.querySelectorAll("[data-animate]").forEach(function (el) {
    io.observe(el);
  });
})();
