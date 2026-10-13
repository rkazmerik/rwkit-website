// RWKIT Consulting v4 — scroll-driven background fade (tan to white), plus footer year
(function () {
  var root = document.documentElement;
  var ticking = false;

  function update() {
    ticking = false;
    var max = root.scrollHeight - window.innerHeight;
    var t = max > 0 ? Math.min(1, Math.max(0, window.scrollY / max)) : 0;
    root.style.setProperty("--t", t.toFixed(3));
  }
  function onScroll() {
    if (!ticking) { ticking = true; window.requestAnimationFrame(update); }
  }

  window.addEventListener("scroll", onScroll, { passive: true });
  window.addEventListener("resize", onScroll);
  window.addEventListener("load", update);
  update();

  var year = document.getElementById("year");
  if (year) year.textContent = String(new Date().getFullYear());
})();
