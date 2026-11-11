// Code blocks: syntax highlighting and a copy button.
//
// Highlighting uses highlight.js when it has loaded.
// A block opts in with a language-* class, either on <pre> itself (static pages)
// or on the <code> inside it (rendered Markdown). Blocks without one stay plain.
// Colours live in style.css under "Syntax highlighting".
//
// Every <pre> gets a copy button, highlighted or not.

(function () {
  // Put an element that was inside the block (e.g. <span data-version>) back
  // around its text, which highlighting flattened.
  function restore(root, el) {
    var text = el.textContent;
    if (!text) return;
    var walker = document.createTreeWalker(root, NodeFilter.SHOW_TEXT);
    var node;
    while ((node = walker.nextNode())) {
      var i = node.data.indexOf(text);
      if (i < 0) continue;
      var match = node.splitText(i);
      match.splitText(text.length);
      match.parentNode.replaceChild(el, match);
      return;
    }
  }

  window.kiteHighlight = function (root) {
    if (!window.hljs) return;
    (root || document)
      .querySelectorAll('pre[class*="language-"], pre > code[class*="language-"]')
      .forEach(function (el) {
        var lang = (/\blanguage-([\w+#-]+)/.exec(el.className) || [])[1];
        if (!lang || !hljs.getLanguage(lang) || el.dataset.highlighted) return;
        var keep = Array.prototype.slice.call(el.children);
        el.innerHTML = hljs.highlight(el.textContent, { language: lang, ignoreIllegals: true }).value;
        keep.forEach(function (k) { restore(el, k); });
        el.dataset.highlighted = hljs.getLanguage(lang).name;
      });
  };

  window.kiteCopyButtons = function (root) {
    if (!navigator.clipboard) return;
    (root || document).querySelectorAll("pre").forEach(function (pre) {
      if (pre.parentNode.classList.contains("code-block")) return;
      // The button sits beside the <pre>, not in it, so it stays put when
      // a long line scrolls and never ends up in the copied text.
      var box = document.createElement("div");
      box.className = "code-block";
      pre.parentNode.insertBefore(box, pre);
      box.appendChild(pre);

      var button = document.createElement("button");
      button.type = "button";
      button.className = "copy-button";
      button.textContent = "Copy";
      var reset;
      button.addEventListener("click", function () {
        navigator.clipboard.writeText(pre.textContent.replace(/\n$/, "")).then(
          function () { button.textContent = "Copied"; },
          function () { button.textContent = "Failed"; }
        ).then(function () {
          clearTimeout(reset);
          reset = setTimeout(function () { button.textContent = "Copy"; }, 1500);
        });
      });
      box.appendChild(button);
    });
  };

  kiteHighlight();
  kiteCopyButtons();
})();
