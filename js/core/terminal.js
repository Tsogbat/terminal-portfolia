// Core Terminal Module
class Terminal {
  constructor() {
    this.commandInput = null;
    this.historyDiv = null;
    this.promptSpan = null;
    this.isRoot = false;
    this.currentDir = "~";
    this.commandHistory = [];
    this.historyIndex = -1;
    this.portfolioData = null;

    this.init();
  }

  init() {
    this.commandInput = document.getElementById("command-input");
    this.historyDiv = document.getElementById("history");
    this.promptSpan = document.getElementById("prompt");

    this.loadCommandHistory();
    this.setupEventListeners();
    this.setupFocus();
  }

  loadCommandHistory() {
    const storedHistory = localStorage.getItem("commandHistory");
    this.commandHistory = storedHistory ? JSON.parse(storedHistory) : [];
  }

  setupEventListeners() {
    // Handle command input (Enter)
    this.commandInput.addEventListener("keypress", (e) => {
      if (e.key === "Enter") {
        this.handleCommand();
      }
    });

    // Handle history navigation and autocomplete
    this.commandInput.addEventListener("keydown", (e) => {
      if (e.key === "ArrowUp") {
        e.preventDefault();
        this.navigateHistory(-1);
      } else if (e.key === "ArrowDown") {
        e.preventDefault();
        this.navigateHistory(1);
      } else if (e.key === "Tab") {
        e.preventDefault();
        this.handleAutocomplete();
      }
    });
  }

  setupFocus() {
    this.commandInput.focus();
    document.addEventListener("click", () => {
      this.commandInput.focus();
    });
  }

  handleCommand() {
    const command = this.commandInput.value.trim();
    if (command) {
      this.commandInput.value = "";
      this.addToHistory(command);
      this.storeCommand(command);
      this.processCommand(command);
    }
  }

  storeCommand(command) {
    this.commandHistory.push(command);
    localStorage.setItem("commandHistory", JSON.stringify(this.commandHistory));
    this.historyIndex = -1;
  }

  addToHistory(command) {
    const commandLine = document.createElement("div");
    commandLine.className = "command-line mb-2";

    const promptClone = this.promptSpan.cloneNode(true);
    const inputClone = document.createElement("span");
    inputClone.textContent = command;
    inputClone.style.color = "var(--text)";

    commandLine.appendChild(promptClone);
    commandLine.appendChild(inputClone);
    this.historyDiv.appendChild(commandLine);

    this.scrollToBottom();
  }

  addOutput(text, typing = false) {
    const outputDiv = document.createElement("div");
    outputDiv.className = "output";
    outputDiv.textContent = text;
    this.historyDiv.appendChild(outputDiv);

    this.scrollToBottom();
  }

  addAscii(text) {
    const container = document.createElement("div");
    container.className = "output ascii";
    const pre = document.createElement("pre");
    pre.textContent = text;
    pre.style.fontFamily = "monospace";
    pre.style.whiteSpace = "pre";
    container.appendChild(pre);
    this.historyDiv.appendChild(container);
    this.scrollToBottom();
  }

  navigateHistory(direction) {
    if (!this.commandHistory.length) return;

    if (this.historyIndex === -1) {
      this.historyIndex = this.commandHistory.length;
    }

    this.historyIndex += direction;

    if (this.historyIndex < 0) this.historyIndex = 0;
    if (this.historyIndex > this.commandHistory.length)
      this.historyIndex = this.commandHistory.length;

    if (this.historyIndex === this.commandHistory.length) {
      this.commandInput.value = "";
    } else {
      this.commandInput.value = this.commandHistory[this.historyIndex];
    }

    // Update block caret position if function exists
    if (window.updateBlockCaretPosition) {
      window.updateBlockCaretPosition();
    }
  }

  scrollToBottom() {
    this.historyDiv.scrollIntoView(false);
  }

  setPortfolioData(data) {
    this.portfolioData = data;
  }

  getPortfolioData() {
    return this.portfolioData;
  }

  setRootAccess(isRoot) {
    this.isRoot = isRoot;
    if (isRoot) {
      this.promptSpan.textContent = "root@portfolio:~#";
      this.promptSpan.classList.add("root-prompt");
    } else {
      this.promptSpan.textContent = "guest@portfolio:~$";
      this.promptSpan.classList.remove("root-prompt");
    }
  }

  getCurrentDir() {
    return this.currentDir;
  }

  setCurrentDir(dir) {
    this.currentDir = dir;
  }

  getCommandInput() {
    return this.commandInput;
  }

  getHistoryDiv() {
    return this.historyDiv;
  }
}

// Export for use in other modules
window.Terminal = Terminal;
