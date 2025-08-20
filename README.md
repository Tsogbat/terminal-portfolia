# Terminal Portfolio

An interactive terminal-style portfolio website built with HTML, CSS, and JavaScript.

## 🚀 Features

- **Terminal Interface**: Authentic command-line experience with commands like `ls`, `cd`, `cat`, etc.
- **Interactive Navigation**: Browse through different sections of your portfolio
- **Theme Toggle**: Switch between dark and light modes
- **Command History**: Navigate through previous commands with arrow keys
- **Autocomplete**: Tab completion for commands and file names
- **Root Access**: Special commands when using `sudo su`
- **Responsive Design**: Works on desktop and mobile devices

## 📁 File Structure

```
terminal_portfolia/
├── index.html                    # Main HTML file
├── styles.css                    # All CSS styles and themes
├── js/                          # JavaScript modules
│   ├── core/
│   │   └── terminal.js          # Core terminal functionality
│   ├── commands/
│   │   └── commandProcessor.js  # Command handling and processing
│   ├── features/
│   │   └── autocomplete.js      # Tab completion functionality
│   ├── data/
│   │   └── dataManager.js       # Portfolio data management
│   ├── ui/
│   │   └── uiManager.js         # UI elements and block caret
│   └── app.js                   # Main application coordinator
├── data/                        # Portfolio data
│   ├── portfolio.json           # Your current portfolio
│   └── example-portfolio.json   # Template for customization
└── README.md                    # This file
```

## 🛠️ Customization

### Adding/Editing Portfolio Content

The easiest way to update your portfolio is by editing the `data/portfolio.json` file. This file contains all the content that appears in your terminal.

#### Structure of portfolio.json:

```json
{
  "about": {
    "title": "About Me",
    "content": "Your personal description..."
  },
  "skills": {
    "title": "Technical Skills",
    "categories": [
      {
        "name": "Category Name",
        "skills": ["Skill 1", "Skill 2", "Skill 3"]
      }
    ]
  },
  "contact": {
    "title": "Contact Information",
    "details": {
      "email": "your@email.com",
      "github": "github.com/username",
      "linkedin": "linkedin.com/in/username"
    }
  },
  "projects": [
    {
      "id": "project1.txt",
      "title": "Project Title",
      "description": "Project description",
      "achievements": ["Achievement 1", "Achievement 2"]
    }
  ],
  "education": [
    {
      "id": "university.txt",
      "title": "Degree Title",
      "institution": "University Name",
      "period": "2020-2024",
      "specialization": "Your Major",
      "gpa": "3.9/4.0"
    }
  ],
  "experience": [
    {
      "id": "job1.txt",
      "title": "Job Title",
      "company": "Company Name",
      "period": "2020-2024",
      "achievements": ["Achievement 1", "Achievement 2"]
    }
  ],
  "directories": {
    "~": ["about", "skills", "projects", "education", "experience", "contact"],
    "~/about": ["about.txt"],
    "~/skills": ["skills.txt"],
    "~/projects": ["project1.txt", "project2.txt"],
    "~/education": ["university.txt", "certificates.txt"],
    "~/experience": ["job1.txt", "job2.txt"],
    "~/contact": ["contact.txt"]
  }
}
```

### Adding New Sections

1. **Add content** to the appropriate section in `portfolio.json`
2. **Update directories** to include new files
3. **Add new commands** in `script.js` if needed

### Adding New Commands

To add new terminal commands, edit the `processCommand` function in `js/commands/commandProcessor.js`:

```javascript
case "newcommand":
  // Your new command logic here
  break;
```

## 🎨 Styling

- **CSS Variables**: Easy theme customization in `styles.css`
- **Responsive Design**: Mobile-friendly layout
- **Animations**: Smooth transitions and cursor effects

## 🚀 Getting Started

1. Clone or download this repository
2. Open `index.html` in your web browser
3. Start typing commands like `help` to get started

## 📝 Available Commands

- `help` - Show available commands
- `welcome` - Display welcome message and available commands
- `ls` - List files and directories
- `cd [directory]` - Change directory
- `cat [file]` - View file contents
- `clear` - Clear terminal
- `whoami` - Show current user
- `pwd` - Print working directory
- `theme` - Toggle between dark and light themes
- `sudo su` - Gain root access (for additional commands)

### Root Commands (after `sudo su`):

- `nano [file]` - Edit a file
- `rm [file]` - Remove a file
- `touch [file]` - Create a new file

## 🔧 Development

### Adding New Features

1. **HTML**: Add new elements to `index.html`
2. **CSS**: Style new elements in `styles.css`
3. **JavaScript**: Add functionality in `script.js`

### Testing

- Test in different browsers
- Test responsive design on mobile devices
- Verify all commands work correctly

## 📱 Browser Compatibility

- Chrome (recommended)
- Firefox
- Safari
- Edge

## 🤝 Contributing

Feel free to submit issues and enhancement requests!

## 📄 License

This project is open source and available under the [MIT License](LICENSE).

---

**Happy coding! 🎉**
