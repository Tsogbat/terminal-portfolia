document.addEventListener("DOMContentLoaded", function () {
  // Theme toggle
  const themeToggle = document.getElementById("theme-toggle");
  themeToggle.addEventListener("click", toggleTheme);

  // Check for saved theme preference
  if (localStorage.getItem("theme") === "light") {
    document.body.classList.remove("dark");
    document.body.classList.add("light");
  }

  // Terminal functionality
  const commandInput = document.getElementById("command-input");
  const historyDiv = document.getElementById("history");
  const promptSpan = document.getElementById("prompt");

  let isRoot = false;
  let currentDir = "~";
  let portfolioData = null;
  const storedHistory = localStorage.getItem("commandHistory");
  const commandHistory = storedHistory ? JSON.parse(storedHistory) : [];
  let historyIndex = -1; // -1 means current input, 0..n are history indices

  // Load portfolio data
  async function loadPortfolioData() {
    try {
      const response = await fetch('data/portfolio.json');
      portfolioData = await response.json();
    } catch (error) {
      console.error('Error loading portfolio data:', error);
      // Fallback to default data if JSON fails to load
      portfolioData = getDefaultData();
    }
  }

  // Load data when page loads
  loadPortfolioData();

  // Default data fallback
  function getDefaultData() {
    return {
      about: {
        title: "About Me",
        content: "I'm a cybersecurity and data science professional with expertise in machine learning and data analysis. Passionate about building secure systems and extracting insights from complex datasets."
      },
      skills: {
        title: "Technical Skills",
        categories: [
          {
            name: "Cybersecurity",
            skills: ["Penetration testing", "Security analysis", "Network security"]
          },
          {
            name: "Data Analysis",
            skills: ["Python", "R", "SQL", "Data visualization"]
          },
          {
            name: "Machine Learning",
            skills: ["TensorFlow", "PyTorch", "NLP", "Computer vision"]
          }
        ]
      },
      contact: {
        title: "Contact Information",
        details: {
          email: "contact@example.com",
          github: "github.com/username",
          linkedin: "linkedin.com/in/username",
          twitter: "@username"
        }
      },
      projects: [
        {
          id: "project1.txt",
          title: "Cybersecurity Research Project",
          description: "Developed novel intrusion detection system",
          achievements: [
            "Achieved 99.8% detection rate",
            "Published in IEEE Security & Privacy"
          ]
        },
        {
          id: "project2.txt",
          title: "ML Model Deployment",
          description: "Built predictive model for customer churn",
          achievements: [
            "Deployed as microservice with 99.9% uptime",
            "Reduced churn by 15% for client"
          ]
        },
        {
          id: "project3.txt",
          title: "Data Analysis Project",
          description: "Analyzed 1TB of sensor data",
          achievements: [
            "Identified key performance indicators",
            "Created interactive dashboard for stakeholders"
          ]
        }
      ],
      education: [
        {
          id: "university.txt",
          title: "Computer Science Degree",
          institution: "University of Technology",
          period: "2018-2022",
          specialization: "Cybersecurity and AI",
          gpa: "3.9/4.0"
        },
        {
          id: "certificates.txt",
          title: "Professional Certifications",
          certificates: [
            "Certified Ethical Hacker (CEH)",
            "AWS Certified Solutions Architect",
            "Google Data Analytics Professional"
          ]
        }
      ],
      experience: [
        {
          id: "job1.txt",
          title: "Security Analyst",
          company: "TechSecure Inc.",
          period: "2020-2021",
          achievements: [
            "Conducted vulnerability assessments",
            "Implemented security controls",
            "Reduced security incidents by 40%"
          ]
        },
        {
          id: "job2.txt",
          title: "Data Scientist",
          company: "DataInsights Corp.",
          period: "2021-Present",
          achievements: [
            "Developed ML models for business insights",
            "Automated data pipelines",
            "Improved decision-making processes"
          ]
        }
      ],
      directories: {
        "~": ["about", "skills", "projects", "education", "experience", "contact"],
        "~/about": ["about.txt"],
        "~/skills": ["skills.txt"],
        "~/projects": ["project1.txt", "project2.txt", "project3.txt"],
        "~/education": ["university.txt", "certificates.txt"],
        "~/experience": ["job1.txt", "job2.txt"],
        "~/contact": ["contact.txt"]
      }
    };
  }

  // Focus the input field and keep it focused
  commandInput.focus();
  document.addEventListener("click", function () {
    commandInput.focus();
  });

  // Handle command input (Enter)
  commandInput.addEventListener("keypress", function (e) {
    if (e.key === "Enter") {
      const command = commandInput.value.trim();
      if (command) {
        commandInput.value = "";

        // Add the command to history
        addToHistory(command);

        // Store in persistent history
        commandHistory.push(command);
        localStorage.setItem(
          "commandHistory",
          JSON.stringify(commandHistory)
        );
        historyIndex = -1;

        // Process the command
        processCommand(command);
      }
    }
  });

  // Handle history navigation and autocomplete
  commandInput.addEventListener("keydown", function (e) {
    if (e.key === "ArrowUp") {
      e.preventDefault();
      navigateHistory(-1);
    } else if (e.key === "ArrowDown") {
      e.preventDefault();
      navigateHistory(1);
    } else if (e.key === "Tab") {
      e.preventDefault();
      handleAutocomplete();
    }
  });

  function navigateHistory(direction) {
    if (!commandHistory.length) return;
    if (historyIndex === -1) {
      historyIndex = commandHistory.length; // virtual position after last item
    }

    historyIndex += direction;

    if (historyIndex < 0) historyIndex = 0;
    if (historyIndex > commandHistory.length)
      historyIndex = commandHistory.length;

    if (historyIndex === commandHistory.length) {
      commandInput.value = "";
    } else {
      commandInput.value = commandHistory[historyIndex];
    }
    updateBlockCaretPosition();
  }

  function handleAutocomplete() {
    const full = commandInput.value;
    const caretIndex = commandInput.selectionStart || 0;
    const afterCaret = full.slice(caretIndex);
    if (afterCaret.trim() !== "") return; // only autocomplete at end

    const beforeCaret = full.slice(0, caretIndex);
    const parts = beforeCaret.split(/\s+/);
    const hasTrailingSpace = /\s$/.test(beforeCaret);

    const commands = [
      "help",
      "ls",
      "cd",
      "cat",
      "clear",
      "whoami",
      "pwd",
      "sudo",
      "nano",
      "rm",
      "touch",
    ];

    function listDirsForCd() {
      if (!portfolioData) return [".."];
      if (currentDir === "~") {
        return portfolioData.directories["~"] || [".."];
      }
      return [".."]; // allow going up elsewhere
    }

    function listFilesForCurrentDir() {
      if (!portfolioData) return [];
      return portfolioData.directories[currentDir] || [];
    }

    function filterMatches(candidates, prefix) {
      const p = prefix.toLowerCase();
      return candidates.filter((c) => c.toLowerCase().startsWith(p));
    }

    function commonPrefix(strings) {
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

    let suggestions = [];
    let prefix = "";
    let addTrailingSpace = false;

    if (parts.length === 1 && !hasTrailingSpace) {
      // Completing the command name
      prefix = parts[0];
      suggestions = filterMatches(commands, prefix);
      addTrailingSpace = true;
    } else {
      const first = parts[0];
      const argPrefix = hasTrailingSpace ? "" : parts[parts.length - 1];
      if (first === "cd") {
        suggestions = filterMatches(listDirsForCd(), argPrefix);
        addTrailingSpace = true;
      } else if (first === "cat") {
        suggestions = filterMatches(listFilesForCurrentDir(), argPrefix);
      } else if (first === "sudo") {
        suggestions = filterMatches(["su"], argPrefix);
        addTrailingSpace = true;
      } else if (["nano", "rm", "touch"].includes(first)) {
        suggestions = filterMatches(listFilesForCurrentDir(), argPrefix);
      } else if (
        ["ls", "clear", "whoami", "pwd", "help"].includes(first)
      ) {
        // no args to complete
        suggestions = [];
      }
      prefix = argPrefix;
    }

    if (!suggestions.length) return;

    if (suggestions.length === 1) {
      const completion = suggestions[0];
      const base = beforeCaret.slice(
        0,
        beforeCaret.length - prefix.length
      );
      const completed = base + completion + (addTrailingSpace ? " " : "");
      commandInput.value = completed + full.slice(caretIndex);
      updateBlockCaretPosition();
      return;
    }

    // Multiple matches: show and complete to common prefix
    const cp = commonPrefix(suggestions);
    if (cp && cp.length > prefix.length) {
      const base = beforeCaret.slice(
        0,
        beforeCaret.length - prefix.length
      );
      commandInput.value = base + cp + full.slice(caretIndex);
      updateBlockCaretPosition();
    }
    addOutput(suggestions.join("    "));
  }

  function addToHistory(command) {
    const commandLine = document.createElement("div");
    commandLine.className = "command-line mb-2";

    const promptClone = promptSpan.cloneNode(true);
    const inputClone = document.createElement("span");
    inputClone.textContent = command;
    inputClone.style.color = "var(--text)";

    commandLine.appendChild(promptClone);
    commandLine.appendChild(inputClone);
    historyDiv.appendChild(commandLine);

    // Scroll to bottom
    historyDiv.scrollIntoView(false);
  }

  function addOutput(text, typing = false) {
    const outputDiv = document.createElement("div");
    outputDiv.className = "output";
    outputDiv.textContent = text;
    historyDiv.appendChild(outputDiv);

    // Scroll to bottom
    historyDiv.scrollIntoView(false);
  }

  function processCommand(command) {
    const parts = command.split(" ");
    const cmd = parts[0].toLowerCase();
    const arg = parts.length > 1 ? parts.slice(1).join(" ") : null;

    if (!cmd) {
      addOutput("");
      return;
    }

    switch (cmd) {
      case "help":
        showHelp();
        break;
      case "ls":
        listDirectory();
        break;
      case "cd":
        changeDirectory(arg);
        break;
      case "cat":
        showFile(arg);
        break;
      case "clear":
        clearTerminal();
        break;
      case "sudo":
        if (arg === "su") {
          gainRootAccess();
        } else {
          addOutput(`sudo: ${arg}: command not found`);
        }
        break;
      case "nano":
        if (isRoot) {
          simulateNano(arg);
        } else {
          addOutput(`nano: command not found`);
        }
        break;
      case "rm":
        if (isRoot) {
          simulateRm(arg);
        } else {
          addOutput(`rm: command not found`);
        }
        break;
      case "touch":
        if (isRoot) {
          simulateTouch(arg);
        } else {
          addOutput(`touch: command not found`);
        }
        break;
      case "whoami":
        addOutput(isRoot ? "root" : "guest");
        break;
      case "pwd":
        addOutput(currentDir);
        break;
      default:
        addOutput(`${cmd}: command not found`);
    }
  }

  function showHelp() {
    const helpText = `Available commands:
  help                - Show this help message
  ls                  - List available sections
  cd [section]        - Navigate into a section
  cat [file]          - View details of a file
  clear               - Clear the terminal
  whoami              - Show current user
  pwd                 - Print working directory
  
${
  isRoot
    ? "Root commands:\n  nano [file]         - Edit a file\n  rm [file]           - Remove a file\n  touch [file]        - Create a new file"
    : ""
}

Notes:
- Use 'cd' only for directories (e.g., 'cd education').
- To open files, use 'cat' (e.g., 'cat university.txt').`;
    addOutput(helpText, false);
  }

  function listDirectory() {
    if (!portfolioData) {
      addOutput("Loading portfolio data...");
      return;
    }

    let output = "";

    if (currentDir === "~") {
      const dirs = portfolioData.directories["~"];
      output = dirs.join("/\n") + "/";
    } else if (currentDir === "~/projects") {
      const projects = portfolioData.projects;
      output = projects.map(p => `${p.id}    - ${p.title}`).join("\n");
    } else if (currentDir === "~/education") {
      const education = portfolioData.education;
      output = education.map(e => `${e.id}  - ${e.title}`).join("\n");
    } else if (currentDir === "~/experience") {
      const experience = portfolioData.experience;
      output = experience.map(e => `${e.id}        - ${e.title}`);
    } else if (currentDir === "~/about") {
      output = `about.txt       - Personal information`;
    } else if (currentDir === "~/skills") {
      output = `skills.txt      - Technical skills list`;
    } else if (currentDir === "~/contact") {
      output = `contact.txt     - Contact information`;
    }

    addOutput(
      output ||
        `ls: cannot access '${currentDir}': No such file or directory`
    );
  }

  function changeDirectory(arg) {
    if (!arg) {
      currentDir = "~";
      addOutput("");
    } else if (arg === "..") {
      if (currentDir !== "~") {
        currentDir = "~";
      }
      addOutput("");
    } else if (arg && arg.endsWith(".txt")) {
      addOutput(`cd: '${arg}' is a file. Use 'cat ${arg}' to view it.`);
    } else if (
      currentDir === "~" &&
      [
        "about",
        "skills",
        "projects",
        "education",
        "experience",
        "contact",
      ].includes(arg)
    ) {
      currentDir = `~/${arg}`;
      addOutput("");
    } else {
      addOutput(`cd: no such file or directory: ${arg}`);
    }
  }

  function showFile(arg) {
    if (!arg) {
      addOutput("cat: missing file operand");
      return;
    }

    if (!portfolioData) {
      addOutput("Loading portfolio data...");
      return;
    }

    let content = "";

    // Helper function to format content
    function formatContent(data, type) {
      switch (type) {
        case 'about':
          return `${data.title}:\n${data.content}`;
        case 'skills':
          let skillsContent = `${data.title}:\n`;
          data.categories.forEach(category => {
            skillsContent += `- ${category.name}: ${category.skills.join(', ')}\n`;
          });
          return skillsContent.trim();
        case 'contact':
          let contactContent = `${data.title}:\n`;
          Object.entries(data.details).forEach(([key, value]) => {
            contactContent += `${key.charAt(0).toUpperCase() + key.slice(1)}: ${value}\n`;
          });
          return contactContent.trim();
        case 'project':
          let projectContent = `${data.title}:\n- ${data.description}\n`;
          data.achievements.forEach(achievement => {
            projectContent += `- ${achievement}\n`;
          });
          return projectContent.trim();
        case 'education':
          if (data.institution) {
            return `${data.title}:\n- ${data.institution}, ${data.period}\n- Specialized in ${data.specialization}\n- GPA: ${data.gpa}`;
          } else {
            let certContent = `${data.title}:\n`;
            data.certificates.forEach(cert => {
              certContent += `- ${cert}\n`;
            });
            return certContent.trim();
          }
        case 'experience':
          return `${data.title} - ${data.company} (${data.period}):\n${data.achievements.map(achievement => `- ${achievement}`).join('\n')}`;
        default:
          return `cat: ${arg}: No such file in current directory`;
      }
    }

    // Check current directory and find matching content
    if (currentDir === "~" || currentDir === "~/about") {
      if (arg === "about.txt") {
        content = formatContent(portfolioData.about, 'about');
      } else if (arg === "skills.txt") {
        content = formatContent(portfolioData.skills, 'skills');
      } else if (arg === "contact.txt") {
        content = formatContent(portfolioData.contact, 'contact');
      } else {
        content = `cat: ${arg}: No such file in current directory`;
      }
    } else if (currentDir === "~/skills") {
      if (arg === "skills.txt") {
        content = formatContent(portfolioData.skills, 'skills');
      } else {
        content = `cat: ${arg}: No such file in current directory`;
      }
    } else if (currentDir === "~/contact") {
      if (arg === "contact.txt") {
        content = formatContent(portfolioData.contact, 'contact');
      } else {
        content = `cat: ${arg}: No such file in current directory`;
      }
    } else if (currentDir === "~/projects") {
      const project = portfolioData.projects.find(p => p.id === arg);
      if (project) {
        content = formatContent(project, 'project');
      } else {
        content = `cat: ${arg}: No such file in current directory`;
      }
    } else if (currentDir === "~/education") {
      const education = portfolioData.education.find(e => e.id === arg);
      if (education) {
        content = formatContent(education, 'education');
      } else {
        content = `cat: ${arg}: No such file in current directory`;
      }
    } else if (currentDir === "~/experience") {
      const experience = portfolioData.experience.find(e => e.id === arg);
      if (experience) {
        content = formatContent(experience, 'experience');
      } else {
        content = `cat: ${arg}: No such file in current directory`;
      }
    } else {
      content = `cat: ${arg}: No such file in current directory`;
    }

    addOutput(content);
  }

  function clearTerminal() {
    historyDiv.innerHTML = "";
  }

  function gainRootAccess() {
    if (!isRoot) {
      addOutput("Password: ", false);

      // Simulate password input
      setTimeout(() => {
        addOutput(
          "\nAuthentication successful. You now have root access.",
          false
        );
        isRoot = true;
        promptSpan.textContent = "root@portfolio:~#";
        promptSpan.classList.add("root-prompt");
      }, 1000);
    } else {
      addOutput("You are already root!");
    }
  }

  function simulateNano(arg) {
    if (!arg) {
      addOutput("nano: missing file operand");
      return;
    }

    addOutput(
      `Opening ${arg} in nano editor...\n\n[ You're in the nano editor. Press Ctrl+X to exit ]`,
      false
    );

    // Simulate nano interface
    setTimeout(() => {
      addOutput(
        "\n\n(Editing session ended - changes not actually saved)",
        false
      );
    }, 2000);
  }

  function simulateRm(arg) {
    if (!arg) {
      addOutput("rm: missing file operand");
      return;
    }

    addOutput(`rm: remove regular file '${arg}'? `, false);

    // Simulate confirmation
    setTimeout(() => {
      addOutput(`\nFile '${arg}' removed.`, false);
    }, 1000);
  }

  function simulateTouch(arg) {
    if (!arg) {
      addOutput("touch: missing file operand");
      return;
    }

    addOutput(`Created new file '${arg}'`, false);
  }

  function toggleTheme() {
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

  // Helper function to insert command when clicking on help links
  window.insertCommand = function (cmd) {
    commandInput.value = cmd;
    commandInput.focus();
  };

  // Block caret that follows the input caret position
  const blockCaret = document.getElementById("block-caret");
  const inputMeasure = document.getElementById("input-measure");

  function updateBlockCaretPosition() {
    const input = commandInput;
    if (!document.activeElement || document.activeElement !== input) {
      blockCaret.style.display = "none";
      return;
    }

    blockCaret.style.display = "block";

    // Mirror text up to caret to measure width
    const caretIndex = input.selectionStart || 0;
    const textBeforeCaret = input.value.slice(0, caretIndex);
    inputMeasure.textContent = textBeforeCaret;

    // Ensure measurement uses same font metrics
    const computed = getComputedStyle(input);
    inputMeasure.style.font = computed.font;
    inputMeasure.style.letterSpacing = computed.letterSpacing;
    inputMeasure.style.left = 0;
    inputMeasure.style.top = 0;

    // Compute position within container
    const containerRect = input.parentElement.getBoundingClientRect();
    const inputRect = input.getBoundingClientRect();
    const leftPadding = parseFloat(computed.paddingLeft) || 0;
    const leftWithinContainer =
      inputRect.left -
      containerRect.left +
      leftPadding +
      inputMeasure.offsetWidth -
      input.scrollLeft;

    // Position caret
    blockCaret.style.left = leftWithinContainer + "px";
    blockCaret.style.top = inputRect.top - containerRect.top + "px";

    // Match caret height to line-height
    blockCaret.style.height = computed.lineHeight;
  }

  ["input", "keyup", "click", "focus"].forEach((evt) => {
    commandInput.addEventListener(evt, updateBlockCaretPosition);
  });
  document.addEventListener("selectionchange", () => {
    if (document.activeElement === commandInput)
      updateBlockCaretPosition();
  });
  commandInput.addEventListener("blur", () => {
    blockCaret.style.display = "none";
  });

  // Initial position
  updateBlockCaretPosition();
});
