// Renders Kite's developer docs straight from the repository, so this page
// never goes stale. docs.html?doc=<name> picks a document; #anchors work as on GitHub.

(function () {
  var REPO = "n4n0GH/Kite";
  var BRANCH = "master";
  var RAW = "https://raw.githubusercontent.com/" + REPO + "/" + BRANCH + "/";
  var BLOB = "https://github.com/" + REPO + "/blob/" + BRANCH + "/";

  // name -> file under docs/. Add a document here and a link in docs.html.
  var DOCS = {
    overview: "docs/README.md",
    architecture: "docs/architecture.md",
    ui: "docs/ui.md",
    plugins: "docs/plugins.md"
  };

  var out = document.getElementById("doc");
  var toc = document.getElementById("doc-toc");
  var source = document.getElementById("doc-source");

  var name = new URLSearchParams(location.search).get("doc");
  if (!DOCS[name]) name = "overview";
  var file = DOCS[name];

  document.querySelectorAll(".doc-nav a").forEach(function (a) {
    if (a.dataset.doc === name) a.setAttribute("aria-current", "page");
  });
  if (source) source.href = BLOB + file;

  function slug(text) {
    return text.toLowerCase().trim()
      .replace(/[^\w\- ]+/g, "")
      .replace(/ /g, "-");
  }

  // Resolve a link relative to the document's folder in the repo.
  function resolve(href) {
    var base = file.slice(0, file.lastIndexOf("/") + 1);
    var parts = (base + href).split("/");
    var stack = [];
    parts.forEach(function (p) {
      if (p === "..") stack.pop();
      else if (p !== "." && p !== "") stack.push(p);
    });
    return stack.join("/");
  }

  function docFor(path) {
    for (var k in DOCS) if (DOCS[k] === path) return k;
    return null;
  }

  fetch(RAW + file)
    .then(function (r) { if (!r.ok) throw new Error(r.status); return r.text(); })
    .then(function (md) {
      out.innerHTML = DOMPurify.sanitize(marked.parse(md));
      if (window.kiteHighlight) { kiteHighlight(out); kiteCopyButtons(out); }

      // Heading ids like GitHub's, so #anchors inside the docs work.
      var seen = {};
      out.querySelectorAll("h1, h2, h3, h4").forEach(function (h) {
        var id = slug(h.textContent);
        if (seen[id] !== undefined) id += "-" + (++seen[id]); else seen[id] = 0;
        h.id = id;
      });

      // Point relative links at this page (other docs) or at GitHub (code, files).
      out.querySelectorAll("a[href]").forEach(function (a) {
        var href = a.getAttribute("href");
        if (/^(https?:|mailto:|#)/.test(href)) return;
        var hash = "";
        var i = href.indexOf("#");
        if (i >= 0) { hash = href.slice(i); href = href.slice(0, i); }
        var path = resolve(href);
        var doc = docFor(path);
        a.href = doc ? "docs.html?doc=" + doc + hash : BLOB + path + hash;
      });
      out.querySelectorAll("img[src]").forEach(function (img) {
        var src = img.getAttribute("src");
        if (!/^https?:/.test(src)) img.src = RAW + resolve(src);
      });

      // Contents list from the h2s.
      var h2s = out.querySelectorAll("h2");
      if (toc && h2s.length > 2) {
        var ul = document.createElement("ul");
        h2s.forEach(function (h) {
          var li = document.createElement("li");
          var a = document.createElement("a");
          a.href = "#" + h.id;
          a.textContent = h.textContent;
          li.appendChild(a);
          ul.appendChild(li);
        });
        toc.appendChild(ul);
        toc.hidden = false;
      }

      var h1 = out.querySelector("h1");
      if (h1) document.title = h1.textContent + " – Kite";

      if (location.hash) {
        var target = document.getElementById(decodeURIComponent(location.hash.slice(1)));
        if (target) target.scrollIntoView();
      }
    })
    .catch(function () {
      out.innerHTML = "";
      var p = document.createElement("p");
      p.append("Couldn't load this document. ");
      var a = document.createElement("a");
      a.href = BLOB + file;
      a.textContent = "Read it on GitHub";
      p.append(a, ".");
      out.appendChild(p);
    });
})();
