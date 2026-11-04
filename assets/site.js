(function () {
  var root = document.documentElement;
  var reduce = root.classList.contains("reduce");
  var header = document.querySelector("[data-header]");
  var toggle = document.querySelector("[data-nav-toggle]");
  var nav = document.querySelector("[data-nav]");
  var scrim = document.querySelector("[data-nav-scrim]");
  var progress = document.querySelector("[data-progress]");
  var mq = window.matchMedia("(max-width: 1039px)");

  function scrollProgress() {
    if (!progress) return;
    var max = document.documentElement.scrollHeight - window.innerHeight;
    var value = max > 0 ? window.scrollY / max : 0;
    progress.style.transform = "scaleX(" + value + ")";
  }

  function onScroll() {
    if (header) header.classList.toggle("is-scrolled", window.scrollY > 8);
    scrollProgress();
  }

  window.addEventListener("scroll", onScroll, { passive: true });
  onScroll();

  function setOpen(open, focusToggle) {
    if (!nav || !toggle) return;
    var show = open && mq.matches;
    nav.classList.toggle("is-open", show);
    toggle.setAttribute("aria-expanded", show ? "true" : "false");
    document.body.classList.toggle("nav-open", show);
    if (scrim) scrim.hidden = !show;
    if (window.lenisInstance) {
      if (open && mq.matches) window.lenisInstance.stop();
      else window.lenisInstance.start();
    }
    if (!open && focusToggle) toggle.focus();
  }

  if (toggle && nav) {
    toggle.addEventListener("click", function () {
      setOpen(!nav.classList.contains("is-open"), false);
    });
    nav.addEventListener("click", function (event) {
      if (event.target.closest("a")) setOpen(false, false);
    });
    document.addEventListener("keydown", function (event) {
      if (event.key === "Escape") setOpen(false, true);
    });
    document.addEventListener("click", function (event) {
      if (!nav.classList.contains("is-open")) return;
      if (nav.contains(event.target) || toggle.contains(event.target)) return;
      setOpen(false, false);
    });
    if (scrim) scrim.addEventListener("click", function () { setOpen(false, true); });
    mq.addEventListener("change", function () {
      if (!mq.matches) setOpen(false, false);
    });
  }

  function scrollToTarget(el) {
    if (window.lenisInstance) {
      window.lenisInstance.scrollTo(el, { offset: -72, duration: 1.15 });
      return;
    }
    el.scrollIntoView({ behavior: reduce ? "auto" : "smooth", block: "start" });
  }

  document.addEventListener("click", function (event) {
    var link = event.target.closest('a[href*="#"]');
    if (!link) return;
    var href = link.getAttribute("href");
    if (!href || href.charAt(0) === "#" && href.length < 2) return;
    var hash = href.slice(href.indexOf("#"));
    if (hash.length < 2) return;
    var target = document.querySelector(hash);
    if (!target) return;
    var samePage = link.pathname === window.location.pathname || href.charAt(0) === "#";
    if (!samePage) return;
    event.preventDefault();
    if (nav && nav.classList.contains("is-open")) setOpen(false, false);
    scrollToTarget(target);
    history.pushState(null, "", hash);
  });

  if (reduce) return;

  if (!window.gsap || !window.ScrollTrigger || root.classList.contains("no-motion")) {
    root.classList.add("no-motion");
    return;
  }

  root.classList.add("motion-ready");
  var gsap = window.gsap;
  gsap.registerPlugin(window.ScrollTrigger);

  var lenis = null;
  if (document.body.hasAttribute("data-smooth") && window.Lenis) {
    lenis = new window.Lenis({
      lerp: 0.085,
      smoothWheel: true,
      wheelMultiplier: 0.9
    });
    window.lenisInstance = lenis;
    lenis.on("scroll", function () {
      window.ScrollTrigger.update();
      onScroll();
    });
    gsap.ticker.add(function (time) {
      lenis.raf(time * 1000);
    });
    gsap.ticker.lagSmoothing(0);
  }

  var grouped = new Set();
  document.querySelectorAll("[data-reveal-group]").forEach(function (group) {
    var items = group.querySelectorAll("[data-reveal]");
    if (!items.length) return;
    items.forEach(function (item) { grouped.add(item); });
    var done = function (item) {
      item.classList.add("is-in");
      item.style.opacity = "";
      item.style.transform = "";
    };
    gsap.fromTo(items, { opacity: 0, y: 28 }, {
      opacity: 1,
      y: 0,
      duration: 1.05,
      ease: "expo.out",
      stagger: 0.08,
      scrollTrigger: {
        trigger: group,
        start: "top 86%",
        once: true
      },
      onComplete: function () {
        items.forEach(done);
      }
    });
  });

  document.querySelectorAll("[data-reveal]").forEach(function (el) {
    if (grouped.has(el)) return;
    gsap.fromTo(el, { opacity: 0, y: 28 }, {
      opacity: 1,
      y: 0,
      duration: 1.05,
      ease: "expo.out",
      scrollTrigger: {
        trigger: el,
        start: "top 88%",
        once: true
      },
      onComplete: function () {
        el.classList.add("is-in");
        el.style.opacity = "";
        el.style.transform = "";
      }
    });
  });

  document.querySelectorAll("[data-parallax]").forEach(function (el) {
    var distance = parseFloat(el.getAttribute("data-parallax")) || 36;
    var wrap = el.closest("[data-parallax-wrap]") || el;
    gsap.to(el, {
      y: distance,
      ease: "none",
      scrollTrigger: {
        trigger: wrap,
        start: "top bottom",
        end: "bottom top",
        scrub: 0.7
      }
    });
  });

  window.addEventListener("load", function () {
    window.ScrollTrigger.refresh();
  });
})();
