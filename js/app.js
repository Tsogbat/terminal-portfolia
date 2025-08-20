// Main Application File
class TerminalPortfolioApp {
  constructor() {
    this.terminal = null;
    this.commandProcessor = null;
    this.autocomplete = null;
    this.dataManager = null;
    this.uiManager = null;
    this.zoom = 1.0;

    this.init();
  }

  init() {
    // Ensure full viewport sizing
    document.documentElement.style.height = "100%";
    document.body.style.minHeight = "100vh";

    // Initialize theme
    this.initTheme();

    // Initialize zoom controls
    this.initZoom();

    // Initialize data manager
    this.dataManager = new DataManager();

    // Initialize terminal
    this.terminal = new Terminal();

    // Initialize command processor
    this.commandProcessor = new CommandProcessor(this.terminal);

    // Initialize autocomplete
    this.autocomplete = new Autocomplete(this.terminal);

    // Initialize UI manager
    this.uiManager = new UIManager(this.terminal);

    // Connect terminal to command processor
    this.terminal.processCommand = this.commandProcessor.processCommand.bind(
      this.commandProcessor
    );

    // Connect terminal to autocomplete
    this.terminal.handleAutocomplete =
      this.autocomplete.handleAutocomplete.bind(this.autocomplete);

    // Expose helpers
    this.exposeHelpers();

    // Wait for data to load, then execute welcome
    this.waitForDataAndWelcome();
  }

  exposeHelpers() {
    // Helper to insert command text only
    window.insertCommand = (cmd) => {
      if (this.terminal) {
        this.terminal.getCommandInput().value = cmd;
        this.terminal.getCommandInput().focus();
      }
    };

    // Helper to insert and execute a command (as if Enter was pressed)
    window.runCommand = (cmd) => {
      if (!this.terminal || !cmd) return;
      this.terminal.addToHistory(cmd);
      this.terminal.storeCommand(cmd);
      this.terminal.processCommand(cmd);
    };
  }

  initTheme() {
    const stored = localStorage.getItem("theme");
    const apply = (mode) => {
      if (mode === "dark") {
        document.body.classList.remove("light");
        document.body.classList.add("dark");
      } else {
        document.body.classList.remove("dark");
        document.body.classList.add("light");
      }
    };

    if (stored === "dark") return apply("dark");
    if (stored === "light") return apply("light");
    if (stored === "auto") {
      const prefersDark =
        window.matchMedia &&
        window.matchMedia("(prefers-color-scheme: dark)").matches;
      return apply(prefersDark ? "dark" : "light");
    }

    // Default: preserve current class or fall back to dark
    if (
      !document.body.classList.contains("light") &&
      !document.body.classList.contains("dark")
    ) {
      apply("dark");
    }
  }

  initZoom() {
    const stored = parseFloat(localStorage.getItem("zoom"));
    if (!Number.isNaN(stored) && stored > 0.5 && stored < 3) {
      this.zoom = stored;
    }
    this.applyZoom();

    window.addEventListener("keydown", (e) => {
      const isAccel = e.metaKey || e.ctrlKey;
      if (!isAccel) return;

      const key = e.key;
      const code = e.code;

      if (
        key === "+" ||
        key === "=" ||
        code === "Equal" ||
        code === "NumpadAdd"
      ) {
        e.preventDefault();
        this.changeZoom(0.1);
        return;
      }
      if (key === "-" || code === "Minus" || code === "NumpadSubtract") {
        e.preventDefault();
        this.changeZoom(-0.1);
        return;
      }
      if (key === "0" || code === "Digit0" || code === "Numpad0") {
        e.preventDefault();
        this.resetZoom();
        return;
      }
    });
  }

  changeZoom(delta) {
    this.zoom = Math.min(
      3,
      Math.max(0.5, Math.round((this.zoom + delta) * 10) / 10)
    );
    localStorage.setItem("zoom", String(this.zoom));
    this.applyZoom();
  }

  resetZoom() {
    this.zoom = 1.0;
    localStorage.setItem("zoom", String(this.zoom));
    this.applyZoom();
  }

  applyZoom() {
    // Only scale terminal text via CSS variable; layout remains full width/height
    document.documentElement.style.setProperty(
      "--text-zoom",
      String(this.zoom)
    );
  }

  async waitForDataAndWelcome() {
    // Wait for portfolio data to load
    let attempts = 0;
    const maxAttempts = 50; // 5 seconds max wait

    while (!this.dataManager.getPortfolioData() && attempts < maxAttempts) {
      await new Promise((resolve) => setTimeout(resolve, 100));
      attempts++;
    }

    // Set portfolio data in terminal
    this.terminal.setPortfolioData(this.dataManager.getPortfolioData());

    // Execute welcome command
    setTimeout(() => {
      this.commandProcessor.executeWelcome();
    }, 100);
  }
}

// Initialize the application when DOM is loaded
document.addEventListener("DOMContentLoaded", function () {
  window.app = new TerminalPortfolioApp();
});
