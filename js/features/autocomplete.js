// Autocomplete Module
class Autocomplete {
  constructor(terminal) {
    this.terminal = terminal;
    this.commands = [
      "help",
      "welcome",
      "ls",
      "cd",
      "cat",
      "clear",
      "whoami",
      "pwd",
      "theme",
      "resume",
      "social",
      "open",
      "history",
      "wget",
      "sudo",
      "nano",
      "rm",
      "touch",
    ];
  }

  handleAutocomplete() {
    const full = this.terminal.getCommandInput().value;
    const caretIndex = this.terminal.getCommandInput().selectionStart || 0;
    const afterCaret = full.slice(caretIndex);

    if (afterCaret.trim() !== "") return; // only autocomplete at end

    const beforeCaret = full.slice(0, caretIndex);
    const parts = beforeCaret.split(/\s+/);
    const hasTrailingSpace = /\s$/.test(beforeCaret);

    let suggestions = [];
    let prefix = "";
    let addTrailingSpace = false;

    if (parts.length === 1 && !hasTrailingSpace) {
      // Completing the command name
      prefix = parts[0];
      suggestions = this.filterMatches(this.commands, prefix);
      addTrailingSpace = true;
    } else {
      const first = parts[0];
      const argPrefix = hasTrailingSpace ? "" : parts[parts.length - 1];

      if (first === "cd") {
        suggestions = this.filterMatches(this.listDirsForCd(), argPrefix);
        addTrailingSpace = true;
      } else if (first === "cat") {
        suggestions = this.filterMatches(
          this.listFilesForCurrentDir(),
          argPrefix
        );
      } else if (first === "sudo") {
        suggestions = this.filterMatches(["su"], argPrefix);
        addTrailingSpace = true;
      } else if (["nano", "rm", "touch"].includes(first)) {
        suggestions = this.filterMatches(
          this.listFilesForCurrentDir(),
          argPrefix
        );
      } else if (first === "theme") {
        suggestions = this.filterMatches(["dark", "light", "auto"], argPrefix);
        addTrailingSpace = true;
      } else if (first === "open") {
        const aliases = ["github", "linkedin", "email"];
        suggestions = this.filterMatches(aliases, argPrefix);
      } else if (first === "history") {
        suggestions = this.filterMatches(["clear"], argPrefix);
        addTrailingSpace = true;
      } else if (first === "wget") {
        // Suggest any PDFs from current directory
        const pdfs = this.listFilesForCurrentDir().filter((f) =>
          /\.pdf$/i.test(f)
        );
        suggestions = this.filterMatches(pdfs, argPrefix);
      } else if (
        [
          "ls",
          "clear",
          "whoami",
          "pwd",
          "help",
          "welcome",
          "social",
          "resume",
        ].includes(first)
      ) {
        // no args to complete
        suggestions = [];
      }
      prefix = argPrefix;
    }

    if (!suggestions.length) return;

    if (suggestions.length === 1) {
      const completion = suggestions[0];
      const base = beforeCaret.slice(0, beforeCaret.length - prefix.length);
      const completed = base + completion + (addTrailingSpace ? " " : "");
      this.terminal.getCommandInput().value =
        completed + full.slice(caretIndex);

      if (window.updateBlockCaretPosition) {
        window.updateBlockCaretPosition();
      }
      return;
    }

    // Multiple matches: show and complete to common prefix
    const cp = this.commonPrefix(suggestions);
    if (cp && cp.length > prefix.length) {
      const base = beforeCaret.slice(0, beforeCaret.length - prefix.length);
      this.terminal.getCommandInput().value =
        base + cp + full.slice(caretIndex);

      if (window.updateBlockCaretPosition) {
        window.updateBlockCaretPosition();
      }
    }

    this.terminal.addOutput(suggestions.join("    "));
  }

  listDirsForCd() {
    const portfolioData = this.terminal.getPortfolioData();
    if (!portfolioData) return [".."];

    if (this.terminal.getCurrentDir() === "~") {
      const dirMap =
        portfolioData.directories?.directories ||
        portfolioData.directories ||
        {};
      return dirMap["~"] || [".."]; // top-level sections
    }
    return [".."]; // allow going up elsewhere
  }

  listFilesForCurrentDir() {
    const portfolioData = this.terminal.getPortfolioData();
    if (!portfolioData) return [];

    const dirMap =
      portfolioData.directories?.directories || portfolioData.directories || {};
    return dirMap[this.terminal.getCurrentDir()] || [];
  }

  filterMatches(candidates, prefix) {
    const p = prefix.toLowerCase();
    return candidates.filter((c) => c.toLowerCase().startsWith(p));
  }

  commonPrefix(strings) {
    if (!strings.length) return "";
    let prefix = strings[0];
    for (let i = 1; i < strings.length; i++) {
      while (!strings[i].startsWith(prefix)) {
        prefix = prefix.slice(0, -1);
        if (!prefix) return "";
      }
    }
    return prefix;
  }
}

window.Autocomplete = Autocomplete;
