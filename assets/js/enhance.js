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
  var lenis = null;

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

  /* ---- In-site site viewer: open real project sites in a window, morphing from the card ---- */
  (function () {
    var viewer = document.getElementById("siteViewer");
    if (!viewer) return;

    var win = viewer.querySelector(".viewer__window");
    var frame = viewer.querySelector(".viewer__frame");
    var urlEl = viewer.querySelector(".viewer__url");
    var openLink = viewer.querySelector(".viewer__open");
    var closeBtn = viewer.querySelector(".viewer__close");
    var backdrop = viewer.querySelector(".viewer__backdrop");

    var activeCard = null;
    var lastFocus = null;
    var animating = false;

    function lockScroll() {
      if (lenis) lenis.stop();
      html.style.overflow = "hidden";
    }
    function unlockScroll() {
      if (lenis) lenis.start();
      html.style.overflow = "";
    }

    /* FLIP: map the window between its final centred layout and the clicked card's browser thumbnail.
       `done` is guaranteed to run once — via transitionend, or a timeout fallback so the viewer can
       never get stuck if the transition is interrupted or never fires (e.g. a throttled tab). */
    function morph(rect, opening, done) {
      var fired = false;
      function fire() {
        if (fired) return;
        fired = true;
        win.removeEventListener("transitionend", onEnd);
        clearTimeout(timer);
        if (done) done();
      }
      var onEnd = function (e) {
        if (e.target === win && e.propertyName === "transform") fire();
      };
      var timer;

      if (reduce || !rect) { fire(); return; }

      var last = win.getBoundingClientRect();
      var t = "translate(" + (rect.left - last.left) + "px," + (rect.top - last.top) +
        "px) scale(" + (rect.width / last.width) + "," + (rect.height / last.height) + ")";
      win.style.transformOrigin = "top left";
      win.addEventListener("transitionend", onEnd);
      timer = setTimeout(fire, opening ? 620 : 520); /* > transition duration */

      if (opening) {
        win.style.transition = "none";
        win.style.transform = t;
        win.getBoundingClientRect(); /* force reflow so the start frame paints */
        win.style.transition = "transform 0.5s var(--ease-out)";
        win.style.transform = "";
      } else {
        win.style.transition = "transform 0.42s var(--ease)";
        win.style.transform = t;
      }
    }

    function cardRect() {
      var b = activeCard && activeCard.querySelector(".browser");
      return b ? b.getBoundingClientRect() : null;
    }

    function open(card, url) {
      if (animating) return;
      animating = true;
      activeCard = card;
      lastFocus = document.activeElement;

      frame.src = url;
      urlEl.textContent = url.replace(/^https?:\/\//, "").replace(/\/$/, "");
      openLink.href = url;

      var rect = cardRect();
      viewer.classList.add("is-open");
      viewer.setAttribute("aria-hidden", "false");
      lockScroll();
      morph(rect, true, function () { animating = false; });
      closeBtn.focus();
      document.addEventListener("keydown", onKeydown, true);
    }

    function finish() {
      viewer.classList.remove("is-open");
      viewer.classList.remove("is-closing");
      viewer.setAttribute("aria-hidden", "true");
      win.style.transition = "";
      win.style.transform = "";
      frame.src = "about:blank";
      unlockScroll();
      document.removeEventListener("keydown", onKeydown, true);
      if (lastFocus && lastFocus.focus) lastFocus.focus();
      activeCard = null;
      animating = false;
    }

    function close() {
      if (animating || !viewer.classList.contains("is-open")) return;
      animating = true;
      viewer.classList.add("is-closing"); /* fade backdrop while the window morphs back */
      morph(cardRect(), false, finish);
    }

    function onKeydown(e) {
      if (e.key === "Escape") { e.preventDefault(); close(); return; }
      if (e.key !== "Tab") return;
      /* keep focus within the viewer controls + frame */
      if (e.shiftKey) {
        if (document.activeElement === openLink) { e.preventDefault(); closeBtn.focus(); }
      } else if (document.activeElement === closeBtn) {
        e.preventDefault(); openLink.focus();
      }
    }

    closeBtn.addEventListener("click", close);
    backdrop.addEventListener("click", close);

    /* Intercept real work-cards (those with a real href) and open them in the viewer */
    document.addEventListener("click", function (e) {
      var card = e.target.closest(".work-card");
      if (!card) return;
      var href = card.getAttribute("href");
      if (!href || href === "#") return; /* coming-soon cards stay put (main.js preventDefault) */
      e.preventDefault();
      e.stopImmediatePropagation();
      open(card, href);
    }, true);
  })();

  /* ---- Smooth scroll (Lenis) ---- */
  if (!reduce && typeof window.Lenis !== "undefined") {
    lenis = new window.Lenis({
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
