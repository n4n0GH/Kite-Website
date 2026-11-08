// "Take a closer look": an accordion bound to a screenshot carousel.
// Each slide's data-for names the accordion item (data-key) it belongs to.
// Opening an item shows its first slide; moving the carousel opens the slide's item.

(function () {
  var root = document.querySelector(".explorer");
  if (!root) return;

  var items = Array.prototype.slice.call(root.querySelectorAll(".explorer-list details"));
  var slides = Array.prototype.slice.call(root.querySelectorAll(".explorer-slide"));
  var track = root.querySelector(".explorer-track");
  var dotsBox = root.querySelector(".explorer-dots");
  var viewport = root.querySelector(".explorer-viewport");
  if (!slides.length) return;

  var index = 0;
  var dots = slides.map(function (slide, i) {
    var b = document.createElement("button");
    b.type = "button";
    b.setAttribute("aria-label", "Screenshot " + (i + 1) + " of " + slides.length);
    b.addEventListener("click", function () { show(i, true); });
    dotsBox.appendChild(b);
    return b;
  });

  function openItem(key) {
    items.forEach(function (d) { d.open = d.dataset.key === key; });
  }

  function show(i, syncList) {
    index = (i + slides.length) % slides.length;
    track.style.transform = "translateX(" + (-100 * index) + "%)";
    slides.forEach(function (s, j) {
      s.setAttribute("aria-hidden", j === index ? "false" : "true");
      s.querySelectorAll("a, button").forEach(function (el) {
        el.tabIndex = j === index ? 0 : -1;
      });
    });
    dots.forEach(function (d, j) {
      d.setAttribute("aria-current", j === index ? "true" : "false");
    });
    if (syncList) openItem(slides[index].dataset.for);
  }

  items.forEach(function (d) {
    d.addEventListener("toggle", function () {
      if (!d.open) return;
      // One open at a time (for browsers without <details name>).
      items.forEach(function (o) { if (o !== d) o.open = false; });
      if (slides[index].dataset.for !== d.dataset.key) {
        var j = slides.findIndex(function (s) { return s.dataset.for === d.dataset.key; });
        if (j >= 0) show(j, false);
      }
    });
  });

  root.querySelector(".explorer-prev").addEventListener("click", function () { show(index - 1, true); });
  root.querySelector(".explorer-next").addEventListener("click", function () { show(index + 1, true); });

  root.querySelector(".explorer-carousel").addEventListener("keydown", function (e) {
    if (e.key === "ArrowLeft") { show(index - 1, true); e.preventDefault(); }
    if (e.key === "ArrowRight") { show(index + 1, true); e.preventDefault(); }
  });

  // Swipe on touch screens.
  var startX = null;
  viewport.addEventListener("pointerdown", function (e) { startX = e.clientX; });
  viewport.addEventListener("pointerup", function (e) {
    if (startX === null) return;
    var dx = e.clientX - startX;
    startX = null;
    if (Math.abs(dx) > 40) show(index + (dx < 0 ? 1 : -1), true);
  });

  var open = items.find(function (d) { return d.open; });
  var first = open ? slides.findIndex(function (s) { return s.dataset.for === open.dataset.key; }) : 0;
  show(first < 0 ? 0 : first, !open);
})();
