// RWKIT Consulting v3 — "Drill" router: rail / scrollspy menu / single-page detail (desktop three-panel; mobile top bar + drawer)

(function () {
  var subsByRoute = {
    "home": ["overview", "capabilities", "approach"],
    "services": ["offerings", "engagement-path", "pricing"],
    "case-studies": ["deep-dive-1", "deep-dive-2", "deep-dive-3", "more-results"],
    "about": ["who-i-am", "strengths", "experience", "credentials"],
    "contact": ["get-in-touch", "good-to-know"]
  };
  var routes = Object.keys(subsByRoute);
  var titles = {
    "home": "RWKIT Consulting — Exceptional Engineering for the AI era",
    "services": "Services & Pricing — RWKIT Consulting",
    "case-studies": "Case Studies — RWKIT Consulting",
    "about": "About — RWKIT Consulting",
    "contact": "Contact — RWKIT Consulting"
  };

  var app = document.getElementById("split-app");
  var railItems = Array.prototype.slice.call(document.querySelectorAll(".rail-item"));
  var sectionMenus = Array.prototype.slice.call(document.querySelectorAll(".section-menu"));
  var routeContents = Array.prototype.slice.call(document.querySelectorAll(".route-content"));
  var subNavItems = Array.prototype.slice.call(document.querySelectorAll(".sub-nav-item"));
  var crumbEl = document.getElementById("detail-crumb");
  var mq = window.matchMedia("(max-width: 980px)");
  var currentRoute = null;

  function parseHash() {
    var raw = (location.hash || "").replace("#", "");
    var parts = raw.split("/");
    var route = routes.indexOf(parts[0]) !== -1 ? parts[0] : null;
    var sub = null;
    if (route && parts[1] && subsByRoute[route].indexOf(parts[1]) !== -1) {
      sub = parts[1];
    }
    return { route: route, sub: sub, hadRoute: !!route, hadSub: !!sub };
  }

  // Mobile drawer menu
  var menuToggle = document.getElementById("menu-toggle");
  function setMenu(open) {
    if (!app) return;
    app.classList.toggle("menu-open", open);
    document.body.classList.toggle("menu-open", open);
    if (menuToggle) {
      menuToggle.setAttribute("aria-expanded", open ? "true" : "false");
      menuToggle.setAttribute("aria-label", open ? "Close menu" : "Open menu");
    }
  }
  if (menuToggle) {
    menuToggle.addEventListener("click", function () { setMenu(!app.classList.contains("menu-open")); });
  }
  document.addEventListener("keydown", function (e) { if (e.key === "Escape") setMenu(false); });
  document.addEventListener("click", function (e) {
    if (e.target.closest(".rail-item") || e.target.closest(".rail-brand")) setMenu(false);
    // Re-tapping the link for the current hash fires no hashchange; re-render so it still scrolls there.
    var link = e.target.closest('a[href^="#"]');
    if (link && link.getAttribute("href") === location.hash) render();
  });

  function setActiveSubUI(route, sub) {
    subNavItems.forEach(function (item) {
      item.classList.toggle("active", item.dataset.route === route && item.dataset.sub === sub);
    });
    if (crumbEl) {
      var activeSubItem = document.querySelector('.sub-nav-item[data-route="' + route + '"][data-sub="' + sub + '"]');
      var railLabel = document.querySelector('.rail-item[data-route="' + route + '"] .rail-label');
      var subLabel = activeSubItem ? activeSubItem.querySelector(".label").textContent : "";
      crumbEl.textContent = (railLabel ? railLabel.textContent : route) + " / " + subLabel;
    }
  }

  function render() {
    var parsed = parseHash();
    var route = parsed.route || "home";
    var sub = parsed.sub || subsByRoute[route][0];
    var routeChanged = route !== currentRoute;

    railItems.forEach(function (a) { a.classList.toggle("active", a.dataset.route === route); });
    sectionMenus.forEach(function (m) { m.classList.toggle("active", m.dataset.route === route); });
    routeContents.forEach(function (rc) { rc.classList.toggle("active", rc.dataset.route === route); });

    setActiveSubUI(route, sub);

    document.title = titles[route] || titles.home;

    var behavior = routeChanged ? "instant" : "smooth";
    if (mq.matches && !parsed.hadSub) {
      // Mobile, route only: start at the route's hero. Skip on first paint so the page doesn't jump.
      if (currentRoute !== null) window.scrollTo({ top: 0, behavior: behavior });
    } else {
      var target = document.querySelector('.content-block[data-route="' + route + '"][data-sub="' + sub + '"]');
      if (target) target.scrollIntoView({ behavior: behavior, block: "start" });
    }

    currentRoute = route;
  }

  window.addEventListener("hashchange", render);
  document.addEventListener("DOMContentLoaded", render);
  function onViewportChange() { setMenu(false); render(); }
  mq.addEventListener ? mq.addEventListener("change", onViewportChange) : mq.addListener(onViewportChange);

  // ---- Scrollspy: while free-scrolling the single-page detail pane, keep the
  // middle panel's active item (and breadcrumb) in sync without touching the URL hash.
  function initScrollSpy() {
    if (!("IntersectionObserver" in window)) return;
    var blocks = Array.prototype.slice.call(document.querySelectorAll(".content-block"));
    var observer = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (entry.isIntersecting) {
          var route = entry.target.dataset.route;
          var sub = entry.target.dataset.sub;
          if (route === currentRoute) setActiveSubUI(route, sub);
        }
      });
    }, { rootMargin: "-15% 0px -75% 0px", threshold: 0 });
    blocks.forEach(function (b) { observer.observe(b); });
  }

  document.addEventListener("DOMContentLoaded", initScrollSpy);

  var root = document.documentElement;
  var toggle = document.getElementById("theme-toggle");
  var toggleLabel = toggle ? toggle.querySelector(".theme-toggle-label") : null;

  function setTheme(theme, persist) {
    root.setAttribute("data-theme", theme);
    if (toggleLabel) toggleLabel.textContent = theme === "dark" ? "Light mode" : "Dark mode";
    if (persist) { try { localStorage.setItem("theme", theme); } catch (e) {} }
  }

  setTheme(root.getAttribute("data-theme") === "dark" ? "dark" : "light", false);
  if (toggle) {
    toggle.addEventListener("click", function () {
      setTheme(root.getAttribute("data-theme") === "dark" ? "light" : "dark", true);
    });
  }

  var systemDark = window.matchMedia("(prefers-color-scheme: dark)");
  systemDark.addEventListener("change", function (e) {
    var saved = null;
    try { saved = localStorage.getItem("theme"); } catch (err) {}
    if (saved !== "light" && saved !== "dark") setTheme(e.matches ? "dark" : "light", false);
  });
})();
