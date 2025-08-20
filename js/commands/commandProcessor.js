// Command Processor Module
class CommandProcessor {
  constructor(terminal) {
    this.terminal = terminal;
    this.commands = {
      help: this.showHelp.bind(this),
      welcome: this.executeWelcome.bind(this),
      ls: this.listDirectory.bind(this),
      cd: this.changeDirectory.bind(this),
      cat: this.showFile.bind(this),
      clear: this.clearTerminal.bind(this),
      whoami: this.showUser.bind(this),
      pwd: this.showCurrentDir.bind(this),
      echo: this.echoCommand.bind(this),
      theme: this.themeCommand.bind(this),
      resume: this.resumeCommand.bind(this),
      social: this.socialCommand.bind(this),
      open: this.openCommand.bind(this),
      history: this.historyCommand.bind(this),
      wget: this.wgetCommand.bind(this),
      sudo: this.handleSudo.bind(this),
      nano: this.simulateNano.bind(this),
      rm: this.simulateRm.bind(this),
      touch: this.simulateTouch.bind(this),
    };
  }

  resolvePathLike(arg) {
    // Supports ~/section/file.ext and (from ~ only) section/file.ext
    if (!arg) return { dir: this.terminal.getCurrentDir(), file: null };
    const trimmed = arg.trim();
    const rootSections = new Set([
      "about",
      "skills",
      "projects",
      "education",
      "experience",
      "contact",
    ]);
    if (trimmed.startsWith("~/")) {
      const parts = trimmed.slice(2).split("/");
      if (parts.length === 1) return { dir: "~", file: parts[0] };
      const section = parts.shift();
      const file = parts.join("/");
      return { dir: `~/${section}`, file };
    }
    if (trimmed.includes("/")) {
      const parts = trimmed.split("/");
      const maybeSection = parts[0];
      // Only allow section/file shortcut from home (~)
      if (
        this.terminal.getCurrentDir() === "~" &&
        rootSections.has(maybeSection)
      ) {
        parts.shift();
        const file = parts.join("/");
        return { dir: `~/${maybeSection}`, file };
      }
      // otherwise treat as relative path
      return { dir: this.terminal.getCurrentDir(), file: trimmed };
    }
    // relative to current dir
    return { dir: this.terminal.getCurrentDir(), file: trimmed };
  }

  processCommand(command) {
    const parts = command.split(" ");
    const cmd = parts[0].toLowerCase();
    const arg = parts.length > 1 ? parts.slice(1).join(" ") : null;

    if (!cmd) {
      this.terminal.addOutput("");
      return;
    }

    if (this.commands[cmd]) {
      this.commands[cmd](arg);
    } else {
      this.terminal.addOutput(`${cmd}: command not found`);
    }
  }

  showHelp() {
    const helpText = `Available commands:
  help                - Show this help message
  welcome             - Display welcome message and available commands
  ls                  - List available sections
  cd [section]        - Navigate into a section
  cat [file|path]     - View a file (.txt or .md). Supports ~/about/about.txt or about/about.txt
  echo [text]         - Print text
  clear               - Clear the terminal
  whoami              - Show current user
  pwd                 - Print working directory
  theme [mode]        - Theme: dark | light | auto
  resume              - Show resume download instructions
  social              - Show social links
  open <url|alias>    - Open a link in new tab
  history [clear]     - Show or clear command history
  wget <file|path>    - Download a PDF (e.g., ~/about/text_resume.pdf or about/text_resume.pdf)
  
${
  this.terminal.isRoot
    ? "Root commands:\n  nano [file]         - Edit a file\n  rm [file]           - Remove a file\n  touch [file]        - Create a new file"
    : ""
}

Notes:
- Use 'cd' only for sections (e.g., 'cd education').
- You can cat absolute paths like 'cat ~/about/about.txt' or 'cat about/about.txt'.`;

    this.terminal.addOutput(helpText, false);
  }

  executeWelcome() {
    const html = `Welcome to my terminal portfolio! Type <a href="#" data-cmd="help">help</a> to get started or <a href="#" data-cmd="theme">theme</a> to toggle modes.`;
    this.terminal.addHtml(html);
  }

  listDirectory() {
    const portfolioData = this.terminal.getPortfolioData();
    if (!portfolioData) {
      this.terminal.addOutput("Loading portfolio data...");
      return;
    }

    let output = "";
    const currentDir = this.terminal.getCurrentDir();

    const dirMap =
      portfolioData.directories?.directories || portfolioData.directories || {};

    if (currentDir === "~") {
      const dirs = dirMap["~"] || [];
      output = dirs.join("/\n") + (dirs.length ? "/" : "");
    } else if (currentDir === "~/projects") {
      const projects = portfolioData.projects.projects;
      output = projects.map((p) => `${p.id}    - ${p.title}`).join("\n");
    } else if (currentDir === "~/education") {
      const education = portfolioData.education.education;
      output = education.map((e) => `${e.id}  - ${e.title}`).join("\n");
    } else if (currentDir === "~/experience") {
      const experience = portfolioData.experience.experience;
      output = experience.map((e) => `${e.id}        - ${e.title}`).join("\n");
    } else if (currentDir === "~/about") {
      const files = dirMap["~/about"] || ["about.txt"];
      output = files.join("\n");
    } else if (currentDir === "~/skills") {
      output = `skills.txt      - Technical skills list`;
    } else if (currentDir === "~/contact") {
      output = `contact.txt     - Contact information`;
    }

    this.terminal.addOutput(
      output || `ls: cannot access '${currentDir}': No such file or directory`
    );
  }

  changeDirectory(arg) {
    if (!arg) {
      this.terminal.setCurrentDir("~");
      this.terminal.addOutput("");
    } else if (arg === "..") {
      if (this.terminal.getCurrentDir() !== "~") {
        this.terminal.setCurrentDir("~");
      }
      this.terminal.addOutput("");
    } else if (arg && arg.endsWith(".txt")) {
      this.terminal.addOutput(
        `cd: '${arg}' is a file. Use 'cat ${arg}' to view it.`
      );
    } else if (
      this.terminal.getCurrentDir() === "~" &&
      [
        "about",
        "skills",
        "projects",
        "education",
        "experience",
        "contact",
      ].includes(arg)
    ) {
      this.terminal.setCurrentDir(`~/${arg}`);
      this.terminal.addOutput("");
    } else {
      this.terminal.addOutput(`cd: no such file or directory: ${arg}`);
    }
  }

  showFile(arg) {
    if (!arg) {
      this.terminal.addOutput("cat: missing file operand");
      return;
    }

    const portfolioData = this.terminal.getPortfolioData();
    if (!portfolioData) {
      this.terminal.addOutput("Loading portfolio data...");
      return;
    }

    let content = "";
    const { dir: targetDir, file: targetFile } = this.resolvePathLike(arg);
    const dirMap =
      portfolioData.directories?.directories || portfolioData.directories || {};

    if (!targetFile) {
      this.terminal.addOutput(`cat: ${arg}: No such file`);
      return;
    }

    // PDFs are binary; hint to wget
    if (targetFile.toLowerCase().endsWith(".pdf")) {
      const files = dirMap[targetDir] || [];
      if (files.includes(targetFile)) {
        this.terminal.addOutput(
          `Binary file '${targetFile}' cannot be displayed. Use: wget ${targetDir}/${targetFile}`
        );
      } else {
        this.terminal.addOutput(`cat: ${arg}: No such file in ${targetDir}`);
      }
      return;
    }

    // Markdown support
    if (targetFile.toLowerCase().endsWith(".md")) {
      fetch(`${targetDir}/${targetFile}`.replace("~/", ""))
        .then((r) => (r.ok ? r.text() : Promise.reject("Not found")))
        .then((md) => {
          const html = window.renderMarkdown ? window.renderMarkdown(md) : md;
          this.terminal.addHtml(html);
        })
        .catch(() => this.terminal.addOutput(`cat: ${arg}: No such file`));
      return;
    }

    // Text content sourced from structured data (about/skills/contact)
    const asciiArt = [
      "  _____                _           _   ",
      " |_   _|__   ___  __ _| |__   __ _| |_ ",
      "   | | / __|/ _ \\/  _ | '_ \\/  _ | __|",
      "   | | \\__ \\ (_)|| (_|| |_)|| (_|| |_ ",
      "   |_| |___/\\\\___/\\\\__, |_.__/\\\\__,_|\\\\__|",
      "                   |__|                ",
    ].join("\n");

    const formatContent = (data, type) => {
      switch (type) {
        case "about": {
          this.terminal.addAscii(asciiArt);
          return `${data.title}:\n${data.content}`;
        }
        case "skills": {
          let skillsContent = `${data.title}:\n`;
          data.categories.forEach((category) => {
            skillsContent += `- ${category.name}: ${category.skills.join(
              ", "
            )}\n`;
          });
          return skillsContent.trim();
        }
        case "contact": {
          let contactContent = `${data.title}:\n`;
          Object.entries(data.details).forEach(([key, value]) => {
            contactContent += `${
              key.charAt(0).toUpperCase() + key.slice(1)
            }: ${value}\n`;
          });
          return contactContent.trim();
        }
        default:
          return `cat: ${arg}: No such file in current directory`;
      }
    };

    if (targetDir === "~/about" && targetFile === "about.txt") {
      content = formatContent(portfolioData.about, "about");
    } else if (targetDir === "~/skills" && targetFile === "skills.txt") {
      content = formatContent(portfolioData.skills, "skills");
    } else if (targetDir === "~/contact" && targetFile === "contact.txt") {
      content = formatContent(portfolioData.contact, "contact");
    } else {
      this.terminal.addOutput(`cat: ${arg}: No such file`);
      return;
    }

    if (content) this.terminal.addOutput(content);
  }

  clearTerminal() {
    this.terminal.getHistoryDiv().innerHTML = "";
  }

  showUser() {
    this.terminal.addOutput(this.terminal.isRoot ? "root" : "guest");
  }

  showCurrentDir() {
    this.terminal.addOutput(this.terminal.getCurrentDir());
  }

  echoCommand(arg) {
    // Simple echo: print exactly what follows echo (empty line if no arg)
    this.terminal.addOutput(arg ? arg : "");
  }

  themeCommand(arg) {
    const mode = (arg || "").trim().toLowerCase();
    if (!arg) {
      // toggle
      this.toggleTheme();
      return;
    }

    if (["dark", "light"].includes(mode)) {
      this.applyTheme(mode);
      localStorage.setItem("theme", mode);
      return;
    }

    if (mode === "auto") {
      const prefersDark =
        window.matchMedia &&
        window.matchMedia("(prefers-color-scheme: dark)").matches;
      this.applyTheme(prefersDark ? "dark" : "light");
      localStorage.setItem("theme", "auto");
      return;
    }

    this.terminal.addOutput("theme: invalid mode. Use: dark | light | auto");
  }

  applyTheme(mode) {
    if (mode === "dark") {
      document.body.classList.remove("light");
      document.body.classList.add("dark");
    } else {
      document.body.classList.remove("dark");
      document.body.classList.add("light");
    }
  }

  toggleTheme() {
    if (document.body.classList.contains("dark")) {
      this.applyTheme("light");
      localStorage.setItem("theme", "light");
    } else {
      this.applyTheme("dark");
      localStorage.setItem("theme", "dark");
    }
  }

  resumeCommand() {
    const files = this.getPdfFilesForCurrentDir();
    const hint = files.length
      ? `Available PDFs here: ${files.join(", ")}`
      : "(put your .pdf file in the project and reference it by name)";
    const msg = `You can download a resume PDF by running:\n\n  wget <your_resume.pdf>\n\nExamples:\n  wget text_resume.pdf\n  wget ~/about/text_resume.pdf\n\n${hint}`;
    this.terminal.addOutput(msg);
  }

  getPdfFilesForCurrentDir() {
    const data = this.terminal.getPortfolioData();
    if (!data) return [];
    const dirMap = data.directories?.directories || data.directories || {};
    const files = dirMap[this.terminal.getCurrentDir()] || [];
    return files.filter((f) => /\.pdf$/i.test(f));
  }

  wgetCommand(arg) {
    const pathArg = (arg || "").trim();
    if (!pathArg) {
      this.terminal.addOutput("wget: missing URL");
      return;
    }

    const resolved = this.resolvePathLike(pathArg);
    let url = pathArg;
    if (resolved.file) {
      url = `${resolved.dir}/${resolved.file}`.replace("~/", "");
    }

    if (!/\.pdf(\?.*)?$/i.test(url)) {
      this.terminal.addOutput("wget: only .pdf downloads are supported");
      return;
    }

    const link = document.createElement("a");
    link.href = url;
    link.download = "";
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    this.terminal.addOutput(`Downloading ${url} ...`);
  }

  socialCommand() {
    const contact = this.terminal.getPortfolioData()?.contact?.details || {};
    const links = [];
    if (contact.github) links.push(`github: ${this.ensureUrl(contact.github)}`);
    if (contact.linkedin)
      links.push(`linkedin: ${this.ensureUrl(contact.linkedin)}`);
    if (contact.email) links.push(`email: mailto:${contact.email}`);

    if (!links.length) {
      this.terminal.addOutput("No social links configured");
      return;
    }

    this.terminal.addOutput(links.join("\n"));
  }

  openCommand(arg) {
    if (!arg) {
      this.terminal.addOutput("open: missing url or alias");
      return;
    }

    const contact = this.terminal.getPortfolioData()?.contact?.details || {};
    const aliases = {
      github: contact.github ? this.ensureUrl(contact.github) : null,
      linkedin: contact.linkedin ? this.ensureUrl(contact.linkedin) : null,
      email: contact.email ? `mailto:${contact.email}` : null,
    };

    const target = aliases[arg] || this.ensureUrl(arg);
    if (!target) {
      this.terminal.addOutput(`open: invalid target '${arg}'`);
      return;
    }

    window.open(target, "_blank");
    this.terminal.addOutput(`Opening ${target} ...`);
  }

  ensureUrl(s) {
    if (!s) return null;
    if (
      s.startsWith("http://") ||
      s.startsWith("https://") ||
      s.startsWith("mailto:")
    )
      return s;
    return `https://${s}`;
  }

  historyCommand(arg) {
    if (arg && arg.trim().toLowerCase() === "clear") {
      localStorage.removeItem("commandHistory");
      this.terminal.commandHistory = [];
      this.terminal.addOutput("History cleared");
      return;
    }

    if (!this.terminal.commandHistory.length) {
      this.terminal.addOutput("History is empty");
      return;
    }

    const lines = this.terminal.commandHistory
      .map((c, i) => `${i + 1}  ${c}`)
      .join("\n");
    this.terminal.addOutput(lines);
  }

  handleSudo(arg) {
    if (arg === "su") {
      this.gainRootAccess();
    } else {
      this.terminal.addOutput(`sudo: ${arg}: command not found`);
    }
  }

  gainRootAccess() {
    if (!this.terminal.isRoot) {
      this.terminal.addOutput("Password: ", false);

      setTimeout(() => {
        this.terminal.addOutput(
          "\nAuthentication successful. You now have root access.",
          false
        );
        this.terminal.setRootAccess(true);
      }, 1000);
    } else {
      this.terminal.addOutput("You are already root!");
    }
  }

  simulateNano(arg) {
    if (!this.terminal.isRoot) {
      this.terminal.addOutput(`nano: command not found`);
      return;
    }

    if (!arg) {
      this.terminal.addOutput("nano: missing file operand");
      return;
    }

    this.terminal.addOutput(
      `Opening ${arg} in nano editor...\n\n[ You're in the nano editor. Press Ctrl+X to exit ]`,
      false
    );

    setTimeout(() => {
      this.terminal.addOutput(
        "\n\n(Editing session ended - changes not actually saved)",
        false
      );
    }, 2000);
  }

  simulateRm(arg) {
    if (!this.terminal.isRoot) {
      this.terminal.addOutput(`rm: command not found`);
      return;
    }

    if (!arg) {
      this.terminal.addOutput("rm: missing file operand");
      return;
    }

    this.terminal.addOutput(`rm: remove regular file '${arg}'? `, false);

    setTimeout(() => {
      this.terminal.addOutput(`\nFile '${arg}' removed.`, false);
    }, 1000);
  }

  simulateTouch(arg) {
    if (!this.terminal.isRoot) {
      this.terminal.addOutput(`touch: command not found`);
      return;
    }

    if (!arg) {
      this.terminal.addOutput("touch: missing file operand");
      return;
    }

    this.terminal.addOutput(`Created new file '${arg}'`, false);
  }
}

window.CommandProcessor = CommandProcessor;
