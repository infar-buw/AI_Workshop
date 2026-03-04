# AI Lab - InfAU Workshop

**A hands-on workshop for InfAU - 2 hours**

Build an interactive web application using AI-assisted coding. No web development experience needed.

---

## Part 0: Pre-workshop Setup

> **Send this to participants 1 day before the workshop.**

To hit the ground running, please complete these steps before we meet:

1. **Install VS Code** - [https://code.visualstudio.com/download](https://code.visualstudio.com/download)
2. **Sign up for Claude** ($20/mo Pro or $100/mo Max) - [https://claude.ai/pricing](https://claude.ai/pricing)
3. **Create a GitHub account** (free) - [https://github.com/signup](https://github.com/signup)
   The instructor will send you an org invitation - accept it before the session.

That's it. We'll do the rest together.

---

## Part 1: Setup (20 min)

### Install the Claude Code Extension

```
1. Open VS Code
2. Press Ctrl+Shift+X → search "Claude Code" → Install
3. Click the ✱ spark icon (top-right of editor) → Sign in with your Claude account
4. You're ready.
```

### Create a Project Folder

Ask Claude:

```
Create a new folder called my-workshop-project and open it as a VS Code workspace.
```

### Install Live Server

```
Install the "Live Server" extension in VS Code.
```

This gives you a local web server with auto-reload - when you save a file, the browser refreshes automatically. Right-click any `.html` file → **Open with Live Server** to use it.

### Sanity Check

Type this prompt into Claude (replace with your name):

```
Create a file called hello.html with a page that says "Hello from [your name]!"
with a nice gradient background. Open it with Live Server.
```

You should see a styled page open in your browser. If it works - you're all set.

---

## Part 2: Orientation (10 min)

**What Claude Code does:**

- Reads your files, writes code, runs commands
- You approve or reject each action
- Talk to it like a colleague: *"make the background darker"*, *"add a button that..."*

**Key tips:**

- **Be specific** about what you want
- **Iterate** - start simple, add features one by one
- **If something breaks**, just tell Claude *"this broke, fix it"*
- **Use `@filename`** to point Claude at specific files

---

## Part 2b: Power-Up Your Prompts (5 min)

These optional tips help Claude produce more polished results. Skim now, refer back later.

### A) Scaffolding - Start with a Real App

The starter prompts create plain HTML files - that's perfectly fine. But if you want a more professional setup with a component library and hot reload, ask Claude to scaffold a project first:

```
Create a new Vite + React + TypeScript project in this folder. Install
shadcn/ui and configure it with the default theme. Set up Tailwind CSS.
Initialize the project and start the dev server.
```

This gives you:

- **Hot reload** - see changes instantly without refreshing
- **shadcn/ui** - a library of polished, accessible UI components
- **Tailwind CSS** - utility classes for fast, consistent styling

Then use the project's starter prompt as a follow-up. This is **completely optional** - plain HTML works great for the workshop.

### B) Skills - Claude's Hidden Superpowers

Type a **slash command** before your prompt to activate a specialized mode:

```
/frontend-design

Create a dashboard that shows solar analysis results with charts and a map
```

The `/frontend-design` skill shifts Claude into a design-focused mode that produces **distinctive, production-grade UIs** instead of generic-looking ones. It's the single biggest quality upgrade you can use.

### C) Prompt Tricks That Make a Difference

Drop these phrases into any prompt to improve the output:

| Phrase                                      | What it does                               |
| ------------------------------------------- | ------------------------------------------ |
| `"use shadcn components"`                 | Polished UI components instead of raw HTML |
| `"use a dark theme with rounded corners"` | Cohesive, modern aesthetic                 |
| `"make it responsive"`                    | Works on mobile and desktop                |
| `"add smooth animations"`                 | Micro-interactions and transitions         |
| `"use Tailwind CSS for styling"`          | Utility-first, consistent design           |
| `"add loading states"`                    | Professional feel while data loads         |

**Describe the vibe you want** - *"minimal and clean"*, *"data-dense dashboard"*, *"playful and colorful"* all work.

**Use references** - *"make it look like the Stripe dashboard"* or paste a screenshot and say *"match this style"*.

---

## Part 3: Pick Your Project (75 min)

Choose one project below. Each includes a starter prompt and follow-up ideas.

Copy the starter prompt into Claude, watch it build, then try the next steps one at a time.

> Prompt cards for printing/copy-paste are in [`workshop/prompts/`](prompts/).

---

### Project A: Interactive 3D City Viewer

**You need:** weimar data in your project folder (provided in `workshop/data/weimar/`).

**Starter prompt:**

```
Create a web page that loads the 3D model from city-model.glb using Three.js.
Add orbit controls so I can rotate and zoom. Add a light gray ground plane.
Use a dark background. Make it fullscreen.
```

**Next steps:**

1. *"Add raycasting so when I click a building it highlights in orange and shows its name"*
2. *"Add a sidebar panel that shows building properties when selected"*
3. *"Add a minimap in the corner showing a top-down view"*

---

### Project B: Solar Position Dashboard

**You need:** No data file - everything is calculated.

**Starter prompt:**

```
Create a web page with a solar position calculator. Show a sun path diagram
(stereographic projection) for latitude 50.98, longitude 11.33 (Weimar).
Add a date picker and time slider. Show the current sun azimuth and altitude.
Draw it with SVG. Make it look professional with a dark theme.
```

**Next steps:**

1. *"Add a 2D map view next to the sun path diagram showing shadow direction as an arrow"*
2. *"Load weimar-buildings.geojson and show approximate shadow projections based on building heights"*
3. *"Add an animation button that cycles through the hours of the day"*

---

### Project C: Evolutionary Algorithm Playground

**You need:** No data file - everything is procedurally generated.

**Starter prompt:**

```
Create a web page that runs a genetic algorithm to pack colored rectangles
into a 800x600 canvas with minimal overlap and wasted space. Show the
current best layout animated in real-time. Display generation count and
fitness score. Add start/stop/reset buttons.
```

**Next steps:**

1. *"Add a settings panel to adjust population size, mutation rate, and crossover rate"*
2. *"Show a fitness-over-time chart next to the canvas using Chart.js"*
3. *"Add a second objective: minimize total perimeter, and show a Pareto front"*

---

### Project D: Free Topic

**Build anything you want.** This is the open-ended option — bring your own idea, your own data, or just experiment.

**How to start:** Describe what you want to Claude in plain language. A good starter prompt includes:

1. What the page should do
2. What it should look like
3. What data it uses (if any)

**Starter prompt template:**

```
Create a web page that [does what]. It should [look/feel like what].
[Optional: It uses this data: ...]
Make it fullscreen with a clean, modern design.
```

**Ideas if you need inspiration:**

- A personal dashboard (weather, calendar, to-do list)
- A data visualization of something you care about (bring a CSV or JSON file)
- A tool for your daily workflow (unit converter, color palette generator, note-taking app)
- A simple game (memory cards, quiz, reaction timer)
- A portfolio page or interactive CV

---

## Part 4: Show & Tell (15 min)

Everyone shows their screen for 1–2 minutes. No slides needed - just show what you built and what surprised you.

---

## Part 5: Publish Your App (15 min)

Let's put your project online so you can share it with a link.

Your app will be published at `https://bauhaus-infau.github.io/ai-lab/<your-name>/`.

### Step 1: Clone the shared repo

```
Clone the repository https://github.com/Bauhaus-InfAU/ai-lab into a new
folder next to my project. Use HTTPS.
```

### Step 2: Copy your built files

**If you built a plain HTML project:**

```
Copy all files from my project folder into ai-lab/results/<your-name>/
(replace <your-name> with your actual first name, lowercase, no spaces).
```

**If you used Vite + React:**

```
In my project, update vite.config.ts to set base: "./" so relative paths
work on GitHub Pages. Then run npm run build. Copy the contents of the
dist/ folder into ai-lab/results/<your-name>/.
```

### Step 3: Create a branch, commit, and open a pull request

```
In the ai-lab folder: create a new branch called add-<your-name>, commit
all the files in results/<your-name>/ with message "Add <your-name>'s
project", push the branch, and open a pull request to main.
```

The instructor will merge your PR, and your app will be live within a minute.

---

## Going Further

Want to keep experimenting? Try feeding Claude your own data:

- **OpenStreetMap exports** via [Overpass API](https://overpass-turbo.eu/) - buildings, roads for any city
- **Open 3D city models** from CityGML repositories (Berlin, Helsinki, NYC all have open data)
- **NASA POWER API** for solar radiation data - free, no key needed
- **CSV datasets** from your own research - Claude can parse and visualize anything

See also: [`workshop/cheatsheet.md`](cheatsheet.md) for a Claude Code quick reference.
