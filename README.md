# Terminal Portfolio

A single-page interactive **terminal-style portfolio** built with HTML, CSS, JavaScript, and TailwindCSS.  
The project simulates a Unix-like terminal where visitors can explore sections such as About, Skills, Projects, Education, Experience, and Contact by typing commands.

---

## Features

- **Dark/Light Theme Toggle** with persistent preference using `localStorage`.
- **Interactive Terminal** supporting commands:
  - `help` → List available commands.
  - `ls` → List directories and files.
  - `cd [section]` → Navigate between portfolio sections.
  - `cat [file]` → View file contents (About, Skills, Projects, etc.).
  - `clear` → Clear terminal history.
  - `whoami`, `pwd` → Show user and directory.
  - **Root access** with `sudo su` → Unlock extra commands:
    - `nano [file]` → Simulate editing.
    - `rm [file]` → Simulate file removal.
    - `touch [file]` → Simulate file creation.
- **Typing experience** with blinking cursor and command history.
- **TailwindCSS styling** with JetBrains Mono font for terminal aesthetics.

---

## File Structure

All code is contained in a single `index.html` file:

- **HTML**: Structure of the portfolio and terminal UI.
- **CSS**: Custom styling for dark/light themes and terminal animations.
- **JavaScript**: Command parsing, terminal behavior, and theme toggle.

---

## Live Demo

You can host this easily with **GitHub Pages**:

1. Push this repo to GitHub.
2. Go to **Settings → Pages**.
3. Select branch `main` and root `/ (index.html)`.
4. Access your site at `https://<your-username>.github.io/<repo-name>/`.

---

## Example Commands

```bash
guest@portfolio:~$ help
guest@portfolio:~$ ls
guest@portfolio:~$ cd projects
guest@portfolio:~/projects$ cat project1.txt
guest@portfolio:~/projects$ sudo su
root@portfolio:~# nano about.txt
```
