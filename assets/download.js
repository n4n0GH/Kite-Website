// Fills in the newest release (pre-releases included) from the GitHub API.
// The page carries static links as a fallback, so it works without JS
// or when the API rate limit is hit.

(function () {
  var REPO = "n4n0GH/Kite";
  var el = function (id) { return document.getElementById(id); };

  fetch("https://api.github.com/repos/" + REPO + "/releases?per_page=10")
    .then(function (r) { if (!r.ok) throw new Error(r.status); return r.json(); })
    .then(function (releases) {
      var rel = releases.find(function (r) { return !r.draft; });
      if (!rel) return;

      var tag = rel.tag_name;
      var version = tag.replace(/^v/, "");
      var date = new Date(rel.published_at).toISOString().slice(0, 10);

      document.querySelectorAll("[data-version]").forEach(function (n) {
        n.textContent = version;
      });
      var info = el("release-info");
      if (info) {
        info.textContent = "Released " + date + (rel.prerelease ? " · pre-release" : "") + " · ";
        var notes = document.createElement("a");
        notes.href = rel.html_url;
        notes.textContent = "Release notes";
        info.appendChild(notes);
      }

      var appimage = rel.assets.find(function (a) { return /\.AppImage$/.test(a.name); });
      if (appimage && el("dl-appimage")) {
        el("dl-appimage").href = appimage.browser_download_url;
        var size = el("dl-appimage-size");
        if (size) size.textContent = (appimage.size / 1048576).toFixed(0) + " MB";
      }

      var flatpak = rel.assets.find(function (a) { return /\.flatpak$/.test(a.name); });
      if (flatpak && el("dl-flatpak")) {
        el("dl-flatpak").href = flatpak.browser_download_url;
        var fsize = el("dl-flatpak-size");
        if (fsize) fsize.textContent = " (" + (flatpak.size / 1048576).toFixed(0) + " MB)";
      }

      var base = "https://github.com/" + REPO + "/archive/refs/tags/" + tag;
      if (el("dl-targz")) el("dl-targz").href = base + ".tar.gz";
      if (el("dl-zip")) el("dl-zip").href = base + ".zip";
    })
    .catch(function () { /* keep the static links */ });
})();
