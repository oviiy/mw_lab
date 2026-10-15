(() => {
  "use strict";

  const breadcrumbs = document.getElementById("breadcrumbs");
  const folderName = document.getElementById("folder-name");
  const itemCount = document.getElementById("item-count");
  const filter = document.getElementById("filter");
  const rows = document.getElementById("file-rows");
  const loadMore = document.getElementById("load-more");
  const message = document.getElementById("message");
  const rootUrl = new URL("./", location.href);
  let visibleLimit = 200;

  function directory() {
    return { folders: new Map(), files: [] };
  }

  function treeFromPaths(paths) {
    const root = directory();
    for (const path of paths) {
      const parts = path.split("/");
      let current = root;
      for (const part of parts.slice(0, -1)) {
        if (!current.folders.has(part)) current.folders.set(part, directory());
        current = current.folders.get(part);
      }
      current.files.push(parts.at(-1));
    }
    return root;
  }

  function currentPath() {
    return new URLSearchParams(location.search).get("path") || "";
  }

  function browseUrl(path) {
    const url = new URL("index.html", rootUrl);
    if (path) url.searchParams.set("path", path);
    return url.href;
  }

  function fileUrl(path) {
    return new URL(path.split("/").map(encodeURIComponent).join("/"), rootUrl).href;
  }

  function link(label, href, className) {
    const anchor = document.createElement("a");
    anchor.textContent = label;
    anchor.href = href;
    if (className) anchor.className = className;
    return anchor;
  }

  function addRow(item, folderPath) {
    const path = [folderPath, item.name].filter(Boolean).join("/");
    const isFolder = Boolean(item.node);
    const row = document.createElement("div");
    row.className = "file-row";
    row.setAttribute("role", "row");

    const nameCell = document.createElement("div");
    nameCell.className = "name-cell";
    nameCell.setAttribute("role", "cell");
    const icon = document.createElement("span");
    icon.className = `file-icon ${isFolder ? "folder-icon" : "document-icon"}`;
    icon.setAttribute("aria-hidden", "true");
    nameCell.append(icon, link(item.name, isFolder ? browseUrl(path) : fileUrl(path)));

    const typeCell = document.createElement("div");
    typeCell.className = "type-cell";
    typeCell.setAttribute("role", "cell");
    typeCell.textContent = isFolder ? "Folder" : fileType(item.name);

    const actionCell = document.createElement("div");
    actionCell.className = "action-cell";
    actionCell.setAttribute("role", "cell");
    if (isFolder) {
      const entry = item.node.files.includes("index.html")
        ? `${path}/index.html`
        : null;
      if (entry) actionCell.append(link("Launch ↗", fileUrl(entry), "launch-link"));
      actionCell.append(link("Browse →", browseUrl(path)));
    } else {
      actionCell.append(link("Open ↗", fileUrl(path)));
    }

    row.append(nameCell, typeCell, actionCell);
    return row;
  }

  function fileType(name) {
    const extension = name.includes(".") ? name.split(".").at(-1).toUpperCase() : "FILE";
    return ({ HTML: "Web page", MD: "Markdown", JSON: "JSON", JS: "JavaScript",
      TS: "TypeScript", CSS: "Stylesheet", PY: "Python", CSV: "CSV",
      SVG: "SVG image", PNG: "Image", JPG: "Image", JPEG: "Image",
      WEBP: "Image", PDF: "PDF" })[extension] || extension;
  }

  function setMessage(text) {
    message.textContent = text;
    message.hidden = !text;
  }

  function render(root) {
    const path = currentPath();
    const parts = path ? path.split("/") : [];
    let current = root;
    for (const part of parts) current = current?.folders.get(part);

    breadcrumbs.replaceChildren();
    breadcrumbs.append(link("mw_lab", browseUrl("")));
    let crumbPath = "";
    for (const part of parts) {
      const separator = document.createElement("span");
      separator.className = "breadcrumb-separator";
      separator.textContent = "/";
      breadcrumbs.append(separator);
      crumbPath = [crumbPath, part].filter(Boolean).join("/");
      breadcrumbs.append(link(part, browseUrl(crumbPath)));
    }

    folderName.textContent = parts.at(-1) || "mw_lab";
    document.title = `${parts.at(-1) || "Files"} · mw_lab`;
    rows.replaceChildren();
    if (!current) {
      itemCount.textContent = "";
      loadMore.hidden = true;
      setMessage("Folder not found. Choose a folder from mw_lab.");
      return;
    }

    const collator = new Intl.Collator(undefined, { numeric: true, sensitivity: "base" });
    const items = [
      ...Array.from(current.folders, ([name, node]) => ({ name, node }))
        .sort((a, b) => collator.compare(a.name, b.name)),
      ...current.files.map((name) => ({ name }))
        .sort((a, b) => collator.compare(a.name, b.name)),
    ];
    const term = filter.value.trim().toLocaleLowerCase();
    const visible = term
      ? items.filter((item) => item.name.toLocaleLowerCase().includes(term))
      : items;
    const fragment = document.createDocumentFragment();
    for (const item of visible.slice(0, visibleLimit)) fragment.append(addRow(item, path));
    rows.append(fragment);
    itemCount.textContent = `${visible.length} ${visible.length === 1 ? "item" : "items"}`;
    loadMore.hidden = visible.length <= visibleLimit;
    setMessage(visible.length ? "" : "No matching files or folders.");
  }

  setMessage("Loading files…");
  fetch(new URL("file-index.json", rootUrl))
    .then((response) => {
      if (!response.ok) throw new Error(`HTTP ${response.status}`);
      return response.json();
    })
    .then((paths) => {
      const root = treeFromPaths(paths);
      filter.addEventListener("input", () => {
        visibleLimit = 200;
        render(root);
      });
      loadMore.addEventListener("click", () => {
        visibleLimit += 200;
        render(root);
      });
      render(root);
    })
    .catch(() => setMessage("The file list could not be loaded. Please try again."));
})();
