// Before/after screenshot slider.
//
// Markup (see index.html):
//   <div class="compare-tabs">
//     <button data-name="Chrome" data-src="images/compare/chrome.png">Chrome</button>
//     ...
//   </div>
//   <div class="compare" data-kite="images/compare/kite.png"></div>
//
// To add another browser, add one more <button> with data-name and data-src.
// All screenshots are expected to share the same dimensions.

(function () {
  var box = document.querySelector(".compare");
  var tabs = document.querySelectorAll(".compare-tabs button");
  if (!box || !tabs.length) return;

  var kite = document.createElement("img");
  kite.className = "compare-top";
  kite.alt = "Kite";
  kite.src = box.dataset.kite;

  var other = document.createElement("img");
  other.className = "compare-base";

  var divider = document.createElement("div");
  divider.className = "compare-divider";

  var left = document.createElement("span");
  left.className = "compare-label left";
  left.textContent = "Kite";

  var right = document.createElement("span");
  right.className = "compare-label right";

  var range = document.createElement("input");
  range.type = "range";
  range.min = "0";
  range.max = "100";
  range.step = "0.5";
  range.value = "50";

  [other, kite, divider, left, right, range].forEach(function (el) {
    box.appendChild(el);
  });

  function setPos(v) {
    box.style.setProperty("--pos", v + "%");
  }
  range.addEventListener("input", function () { setPos(range.value); });

  function missing(img) {
    img.addEventListener("error", function () {
      var msg = document.createElement("div");
      msg.className = "missing-image";
      msg.textContent = "Screenshot missing: " + img.getAttribute("src");
      if (img === other) {
        other.replaceWith(msg);
        other = msg;
      } else {
        img.style.display = "none";
      }
    });
  }
  missing(kite);
  missing(other);

  function select(btn) {
    tabs.forEach(function (b) {
      b.setAttribute("aria-pressed", b === btn ? "true" : "false");
    });
    var name = btn.dataset.name || btn.textContent;
    if (other.tagName !== "IMG") {
      var img = document.createElement("img");
      img.className = "compare-base";
      other.replaceWith(img);
      other = img;
      missing(other);
    }
    other.alt = name;
    other.src = btn.dataset.src;
    right.textContent = name;
    range.setAttribute("aria-label", "Compare Kite with " + name);
  }

  tabs.forEach(function (btn) {
    btn.addEventListener("click", function () { select(btn); });
  });
  select(tabs[0]);
  setPos(range.value);
})();
