(function () {
  function escapeHtml(str) {
    return str.replace(
      /[&<>"']/g,
      (c) =>
        ({
          "&": "&amp;",
          "<": "&lt;",
          ">": "&gt;",
          '"': "&quot;",
          "'": "&#39;",
        }[c])
    );
  }
  function renderMarkdown(md) {
    // escape first
    let html = escapeHtml(md);
    // headings
    html = html
      .replace(/^######\s+(.*)$/gm, "<h6>$1</h6>")
      .replace(/^#####\s+(.*)$/gm, "<h5>$1</h5>")
      .replace(/^####\s+(.*)$/gm, "<h4>$1</h4>")
      .replace(/^###\s+(.*)$/gm, "<h3>$1</h3>")
      .replace(/^##\s+(.*)$/gm, "<h2>$1</h2>")
      .replace(/^#\s+(.*)$/gm, "<h1>$1</h1>");
    // bold/italic
    html = html
      .replace(/\*\*(.+?)\*\*/g, "<strong>$1</strong>")
      .replace(/\*(.+?)\*/g, "<em>$1</em>");
    // inline code
    html = html.replace(/`([^`]+)`/g, "<code>$1</code>");
    // links [text](url)
    html = html.replace(
      /\[([^\]]+)\]\(([^\s\)]+)(?:\s+"[^"]*")?\)/g,
      (m, text, url) => {
        const safeUrl = url.startsWith("javascript:") ? "#" : url;
        return `<a href="${safeUrl}" target="_blank" rel="noopener noreferrer">${text}</a>`;
      }
    );
    // paragraphs: split double newlines
    html = html
      .split(/\n{2,}/)
      .map((p) => `<p>${p.replace(/\n/g, "<br/>")}</p>`)
      .join("");
    // sanitize
    if (window.sanitizeHtml) {
      html = window.sanitizeHtml(html);
    }
    return html;
  }
  window.renderMarkdown = renderMarkdown;
})();
