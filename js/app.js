// Main Application File
class TerminalPortfolioApp {
  constructor() {
    this.terminal = null;
    this.commandProcessor = null;
    this.autocomplete = null;
    this.dataManager = null;
    this.uiManager = null;
    
    this.init();
  }

  init() {
    // Initialize theme
    this.initTheme();
    
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
    this.terminal.processCommand = this.commandProcessor.processCommand.bind(this.commandProcessor);
    
    // Connect terminal to autocomplete
    this.terminal.handleAutocomplete = this.autocomplete.handleAutocomplete.bind(this.autocomplete);
    
    // Wait for data to load, then execute welcome
    this.waitForDataAndWelcome();
  }

  initTheme() {
    // Check for saved theme preference
    if (localStorage.getItem("theme") === "light") {
      document.body.classList.remove("dark");
      document.body.classList.add("light");
    }
  }

  async waitForDataAndWelcome() {
    // Wait for portfolio data to load
    let attempts = 0;
    const maxAttempts = 50; // 5 seconds max wait
    
    while (!this.dataManager.getPortfolioData() && attempts < maxAttempts) {
      await new Promise(resolve => setTimeout(resolve, 100));
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

// Helper function to insert command when clicking on help links
window.insertCommand = function (cmd) {
  if (window.app && window.app.terminal) {
    window.app.terminal.getCommandInput().value = cmd;
    window.app.terminal.getCommandInput().focus();
  }
};

// Initialize the application when DOM is loaded
document.addEventListener("DOMContentLoaded", function () {
  window.app = new TerminalPortfolioApp();
});
