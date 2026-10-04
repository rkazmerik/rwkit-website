// RWKIT Consulting v3 — "Drill" router: rail (level 1) / scrollspy menu (level 2) / single-page detail (level 3)

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

  function setMobileLevel(state) {
    if (!app) return;
    app.classList.remove("level-1", "level-2", "level-3");
    app.classList.add("level-" + state);
  }

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

    if (mq.matches) {
      if (parsed.hadSub) setMobileLevel(3);
      else if (parsed.hadRoute) setMobileLevel(2);
      else setMobileLevel(1);
    } else {
      setMobileLevel(1);
    }

    var target = document.querySelector('.content-block[data-route="' + route + '"][data-sub="' + sub + '"]');
    if (target) {
      target.scrollIntoView({ behavior: routeChanged ? "instant" : "smooth", block: "start" });
    }

    currentRoute = route;
  }

  window.addEventListener("hashchange", render);
  document.addEventListener("DOMContentLoaded", render);
  mq.addEventListener ? mq.addEventListener("change", render) : mq.addListener(render);

  function goTo(hash) {
    history.pushState("", document.title, window.location.pathname + window.location.search + hash);
    render();
  }

  document.addEventListener("click", function (e) {
    var backBtn = e.target.closest(".mobile-back");
    if (!backBtn) return;
    e.preventDefault();
    var parsed = parseHash();
    if (backBtn.dataset.level === "detail" && parsed.route) {
      goTo("#" + parsed.route);
    } else {
      goTo("");
    }
  });

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
