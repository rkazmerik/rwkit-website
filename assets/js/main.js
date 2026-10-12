// RWKIT Consulting v4 — theme toggle and footer year
(function () {
  var root = document.documentElement;
  var toggle = document.getElementById("theme-toggle");

  function setTheme(theme, persist) {
    root.setAttribute("data-theme", theme);
    if (persist) { try { localStorage.setItem("theme", theme); } catch (e) {} }
  }

  if (toggle) {
    toggle.addEventListener("click", function () {
      setTheme(root.getAttribute("data-theme") === "dark" ? "light" : "dark", true);
    });
  }

  var systemDark = window.matchMedia("(prefers-color-scheme: dark)");
  function onSystemChange(e) {
    var saved = null;
    try { saved = localStorage.getItem("theme"); } catch (err) {}
    if (saved !== "light" && saved !== "dark") setTheme(e.matches ? "dark" : "light", false);
  }
  systemDark.addEventListener ? systemDark.addEventListener("change", onSystemChange) : systemDark.addListener(onSystemChange);

  var year = document.getElementById("year");
  if (year) year.textContent = String(new Date().getFullYear());
})();
