// Data Manager Module
class DataManager {
  constructor() {
    this.portfolioData = null;
    this.schema = null;
    this.ajv = null;
    this.loadAll();
  }

  async loadAll() {
    try {
      // Ensure Ajv is available
      if (window.Ajv) {
        this.ajv = new window.Ajv({ strict: false });
      }

      const [
        schema,
        about,
        skills,
        contact,
        projects,
        education,
        experience,
        directories,
      ] = await Promise.all([
        fetch("data/schema.json").then((r) => r.json()),
        fetch("data/about.json").then((r) => r.json()),
        fetch("data/skills.json").then((r) => r.json()),
        fetch("data/contact.json").then((r) => r.json()),
        fetch("data/projects.json").then((r) => r.json()),
        fetch("data/education.json").then((r) => r.json()),
        fetch("data/experience.json").then((r) => r.json()),
        fetch("data/directories.json").then((r) => r.json()),
      ]);

      this.schema = schema;

      const combined = {
        about,
        skills,
        contact,
        projects,
        education,
        experience,
        directories,
      };

      // Validate if Ajv is present
      if (this.ajv) {
        const validate = this.ajv.compile(this.schema);
        const valid = validate(combined);
        if (!valid) {
          console.error("Portfolio data validation errors:", validate.errors);
        }
      }

      this.portfolioData = combined;
    } catch (error) {
      console.error("Error loading portfolio data:", error);
      this.portfolioData = this.getDefaultData();
    }
  }

  getPortfolioData() {
    return this.portfolioData;
  }

  getDefaultData() {
    return {
      about: {
        title: "About Me",
        content:
          "I'm a cybersecurity and data science professional with expertise in machine learning and data analysis. Passionate about building secure systems and extracting insights from complex datasets.",
      },
      skills: {
        title: "Technical Skills",
        categories: [
          {
            name: "Cybersecurity",
            skills: [
              "Penetration testing",
              "Security analysis",
              "Network security",
            ],
          },
          {
            name: "Data Analysis",
            skills: ["Python", "R", "SQL", "Data visualization"],
          },
          {
            name: "Machine Learning",
            skills: ["TensorFlow", "PyTorch", "NLP", "Computer vision"],
          },
        ],
      },
      contact: {
        title: "Contact Information",
        details: {
          email: "contact@example.com",
          github: "https://github.com/username",
          linkedin: "https://linkedin.com/in/username",
        },
      },
      projects: { projects: [] },
      education: { education: [] },
      experience: { experience: [] },
      directories: {
        directories: {
          "~": [
            "about",
            "skills",
            "projects",
            "education",
            "experience",
            "contact",
          ],
          "~/about": ["about.txt"],
          "~/skills": ["skills.txt"],
          "~/projects": [],
          "~/education": [],
          "~/experience": [],
          "~/contact": ["contact.txt"],
        },
      },
    };
  }
}

window.DataManager = DataManager;
