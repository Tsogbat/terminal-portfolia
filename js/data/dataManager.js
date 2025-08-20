// Data Manager Module
class DataManager {
  constructor() {
    this.portfolioData = null;
    this.loadPortfolioData();
  }

  async loadPortfolioData() {
    try {
      const response = await fetch("data/portfolio.json");
      this.portfolioData = await response.json();
    } catch (error) {
      console.error("Error loading portfolio data:", error);
      // Fallback to default data if JSON fails to load
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
        content: "I'm a cybersecurity and data science professional with expertise in machine learning and data analysis. Passionate about building secure systems and extracting insights from complex datasets.",
      },
      skills: {
        title: "Technical Skills",
        categories: [
          {
            name: "Cybersecurity",
            skills: ["Penetration testing", "Security analysis", "Network security"],
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
          github: "github.com/username",
          linkedin: "linkedin.com/in/username",
          twitter: "@username",
        },
      },
      projects: [
        {
          id: "project1.txt",
          title: "Cybersecurity Research Project",
          description: "Developed novel intrusion detection system",
          achievements: ["Achieved 99.8% detection rate", "Published in IEEE Security & Privacy"],
        },
        {
          id: "project2.txt",
          title: "ML Model Deployment",
          description: "Built predictive model for customer churn",
          achievements: ["Deployed as microservice with 99.9% uptime", "Reduced churn by 15% for client"],
        },
        {
          id: "project3.txt",
          title: "Data Analysis Project",
          description: "Analyzed 1TB of sensor data",
          achievements: ["Identified key performance indicators", "Created interactive dashboard for stakeholders"],
        },
      ],
      education: [
        {
          id: "university.txt",
          title: "Computer Science Degree",
          institution: "University of Technology",
          period: "2018-2022",
          specialization: "Cybersecurity and AI",
          gpa: "3.9/4.0",
        },
        {
          id: "certificates.txt",
          title: "Professional Certifications",
          certificates: ["Certified Ethical Hacker (CEH)", "AWS Certified Solutions Architect", "Google Data Analytics Professional"],
        },
      ],
      experience: [
        {
          id: "job1.txt",
          title: "Security Analyst",
          company: "TechSecure Inc.",
          period: "2020-2021",
          achievements: ["Conducted vulnerability assessments", "Implemented security controls", "Reduced security incidents by 40%"],
        },
        {
          id: "job2.txt",
          title: "Data Scientist",
          company: "DataInsights Corp.",
          period: "2021-Present",
          achievements: ["Developed ML models for business insights", "Automated data pipelines", "Improved decision-making processes"],
        },
      ],
      directories: {
        "~": ["about", "skills", "projects", "education", "experience", "contact"],
        "~/about": ["about.txt"],
        "~/skills": ["skills.txt"],
        "~/projects": ["project1.txt", "project2.txt", "project3.txt"],
        "~/education": ["university.txt", "certificates.txt"],
        "~/experience": ["job1.txt", "job2.txt"],
        "~/contact": ["contact.txt"],
      },
    };
  }
}

window.DataManager = DataManager;
