// Syntax highlighting for code blocks, using highlight.js when it has loaded.
// A block opts in with a language-* class, either on <pre> itself (static pages)
// or on the <code> inside it (rendered Markdown). Blocks without one stay plain.
// Colours live in style.css under "Syntax highlighting".

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

  kiteHighlight();
})();
