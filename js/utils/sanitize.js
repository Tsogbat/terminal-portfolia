(function () {
  function sanitizeHtml(html) {
    const template = document.createElement("template");
    template.innerHTML = html;
    const allowedTags = new Set([
      "A",
      "B",
      "I",
      "EM",
      "STRONG",
      "CODE",
      "PRE",
      "P",
      "DIV",
      "SPAN",
      "UL",
      "OL",
      "LI",
      "BR",
      "HR",
      "H1",
      "H2",
      "H3",
      "H4",
      "H5",
      "H6",
    ]);
    const allowedAttrs = {
      A: new Set(["href", "title", "target", "rel", "data-cmd"]),
    };

    const walker = document.createTreeWalker(
      template.content,
      NodeFilter.SHOW_ELEMENT,
      null
    );
    const toRemove = [];
    while (walker.nextNode()) {
      const el = walker.currentNode;
      const tag = el.tagName;
      // Remove disallowed tags entirely
      if (!allowedTags.has(tag)) {
        toRemove.push(el);
        continue;
      }
      // Remove event handlers and disallowed attrs
      [...el.attributes].forEach((attr) => {
        const n = attr.name.toLowerCase();
        if (n.startsWith("on")) {
          el.removeAttribute(attr.name);
          return;
        }
        if (tag === "A") {
          if (!allowedAttrs["A"].has(attr.name)) {
            el.removeAttribute(attr.name);
          }
        } else {
          // allow only data-* for non-A tags
          if (!n.startsWith("data-")) {
            el.removeAttribute(attr.name);
          }
        }
      });
      // Normalize links
      if (tag === "A") {
        const href = el.getAttribute("href") || "";
        if (href.trim().toLowerCase().startsWith("javascript:")) {
          el.removeAttribute("href");
        }
        // enforce safe link behavior
        if (el.getAttribute("target") === "_blank") {
          el.setAttribute("rel", "noopener noreferrer");
        }
      }
    }
    toRemove.forEach((n) => n.replaceWith());
    return template.innerHTML;
  }
  window.sanitizeHtml = sanitizeHtml;
})();
