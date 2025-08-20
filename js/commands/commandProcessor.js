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
      theme: this.toggleTheme.bind(this),
      sudo: this.handleSudo.bind(this),
      nano: this.simulateNano.bind(this),
      rm: this.simulateRm.bind(this),
      touch: this.simulateTouch.bind(this),
    };
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
    cat [file]          - View details of a file
    clear               - Clear the terminal
    whoami              - Show current user
    pwd                 - Print working directory
    theme               - Toggle between dark and light themes

${
  this.terminal.isRoot
    ? "Root commands:\n  nano [file]         - Edit a file\n  rm [file]           - Remove a file\n  touch [file]        - Create a new file"
    : ""
}

Notes:
- Use 'cd' only for directories (e.g., 'cd education').
- To open files, use 'cat' (e.g., 'cat university.txt').`;

    this.terminal.addOutput(helpText, false);
  }

  executeWelcome() {
    const welcomeOutput = document.createElement("div");
    welcomeOutput.className = "output";
    welcomeOutput.innerHTML = `Welcome to my terminal portfolio! Type <span class="link" onclick="insertCommand('help')">help</span> to get started or <span class="link" onclick="insertCommand('theme')">theme</span> to toggle modes.`;

    this.terminal.getHistoryDiv().appendChild(welcomeOutput);
    this.terminal.scrollToBottom();
  }

  listDirectory() {
    const portfolioData = this.terminal.getPortfolioData();
    if (!portfolioData) {
      this.terminal.addOutput("Loading portfolio data...");
      return;
    }

    let output = "";
    const currentDir = this.terminal.getCurrentDir();

    if (currentDir === "~") {
      const dirs = portfolioData.directories["~"];
      output = dirs.join("/\n") + "/";
    } else if (currentDir === "~/projects") {
      const projects = portfolioData.projects;
      output = projects.map((p) => `${p.id}    - ${p.title}`).join("\n");
    } else if (currentDir === "~/education") {
      const education = portfolioData.education;
      output = education.map((e) => `${e.id}  - ${e.title}`).join("\n");
    } else if (currentDir === "~/experience") {
      const experience = portfolioData.experience;
      output = experience.map((e) => `${e.id}        - ${e.title}`);
    } else if (currentDir === "~/about") {
      output = `about.txt       - Personal information`;
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
    const currentDir = this.terminal.getCurrentDir();

    // Helper function to format content
    const formatContent = (data, type) => {
      switch (type) {
        case "about":
          return `${data.title}:\n${data.content}`;
        case "skills":
          let skillsContent = `${data.title}:\n`;
          data.categories.forEach((category) => {
            skillsContent += `- ${category.name}: ${category.skills.join(
              ", "
            )}\n`;
          });
          return skillsContent.trim();
        case "contact":
          let contactContent = `${data.title}:\n`;
          Object.entries(data.details).forEach(([key, value]) => {
            contactContent += `${
              key.charAt(0).toUpperCase() + key.slice(1)
            }: ${value}\n`;
          });
          return contactContent.trim();
        case "project":
          let projectContent = `${data.title}:\n- ${data.description}\n`;
          data.achievements.forEach((achievement) => {
            projectContent += `- ${achievement}\n`;
          });
          return projectContent.trim();
        case "education":
          if (data.institution) {
            return `${data.title}:\n- ${data.institution}, ${data.period}\n- Specialized in ${data.specialization}\n- GPA: ${data.gpa}`;
          } else {
            let certContent = `${data.title}:\n`;
            data.certificates.forEach((cert) => {
              certContent += `- ${cert}\n`;
            });
            return certContent.trim();
          }
        case "experience":
          return `${data.title} - ${data.company} (${
            data.period
          }):\n${data.achievements
            .map((achievement) => `- ${achievement}`)
            .join("\n")}`;
        default:
          return `cat: ${arg}: No such file in current directory`;
      }
    };

    // Check current directory and find matching content
    if (currentDir === "~" || currentDir === "~/about") {
      if (arg === "about.txt") {
        content = formatContent(portfolioData.about, "about");
      } else if (arg === "skills.txt") {
        content = formatContent(portfolioData.skills, "skills");
      } else if (arg === "contact.txt") {
        content = formatContent(portfolioData.contact, "contact");
      } else {
        content = `cat: ${arg}: No such file in current directory`;
      }
    } else if (currentDir === "~/skills") {
      if (arg === "skills.txt") {
        content = formatContent(portfolioData.skills, "skills");
      } else {
        content = `cat: ${arg}: No such file in current directory`;
      }
    } else if (currentDir === "~/contact") {
      if (arg === "contact.txt") {
        content = formatContent(portfolioData.contact, "contact");
      } else {
        content = `cat: ${arg}: No such file in current directory`;
      }
    } else if (currentDir === "~/projects") {
      const project = portfolioData.projects.find((p) => p.id === arg);
      if (project) {
        content = formatContent(project, "project");
      } else {
        content = `cat: ${arg}: No such file in current directory`;
      }
    } else if (currentDir === "~/education") {
      const education = portfolioData.education.find((e) => e.id === arg);
      if (education) {
        content = formatContent(education, "education");
      } else {
        content = `cat: ${arg}: No such file in current directory`;
      }
    } else if (currentDir === "~/experience") {
      const experience = portfolioData.experience.find((e) => e.id === arg);
      if (experience) {
        content = formatContent(experience, "experience");
      } else {
        content = `cat: ${arg}: No such file in current directory`;
      }
    } else {
      content = `cat: ${arg}: No such file in current directory`;
    }

    this.terminal.addOutput(content);
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

  toggleTheme() {
    if (document.body.classList.contains("dark")) {
      document.body.classList.remove("dark");
      document.body.classList.add("light");
      localStorage.setItem("theme", "light");
    } else {
      document.body.classList.remove("light");
      document.body.classList.add("dark");
      localStorage.setItem("theme", "dark");
    }
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
