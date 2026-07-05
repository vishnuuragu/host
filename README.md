# Interactive Web App Ideas

A collection of ten small, self-contained web apps built with plain HTML, CSS, and JavaScript — no frameworks, no build step. Open `index.html` (or the deployed site) and pick an app.

**Live site:** https://vishnuuragu.github.io/host/

## Apps

| App | Description |
|-----|-------------|
| [Habit Tracker](habit-tracker/) | Track and manage daily habits |
| [To-Do List](todo-list/) | Tasks with priorities, filters, and clear-completed |
| [Recipe Finder](recipe-finder/) | Find recipes from the ingredients you have |
| [Fitness Planner](fitness-planner/) | Build workout plans, run timed workouts, keep history |
| [Resume Builder](resume-builder/) | Build a resume with live preview and export |
| [Music Discovery](music-discovery/) | Discover songs by genre, mood, and era; build playlists |
| [Mind Mapping Tool](mind-mapping/) | Draggable nodes and connections, save your maps |
| [Quiz Generator](quiz-generator/) | Create quizzes, take them, and get scored |
| [Budget Tracker](budget-tracker/) | Track income and expenses, export to CSV |
| [Drawing App](drawing-app/) | Canvas drawing with brush, eraser, and saved drawings |

## Structure

Every app lives in its own folder with the same three files, plus a shared design core that gives all ten modules the same dark, futuristic look (glass panels, aurora background, animated star field):

```
app-name/
├── index.html
├── script.js        # app logic
└── styles.css       # app-specific layout on top of the shared theme
shared/
├── theme.css        # design tokens, glass panels, buttons, forms, motion
└── theme.js         # ambient background, starfield, cursor glow, reveals
```

The repo root holds the landing page (`index.html`, `script.js`, `styles.css`) — a dark, futuristic showcase with an animated star field, live search over the apps (press `/` to focus it), and a telemetry section charting each app's size.

## Running locally

No build step is needed. Either open `index.html` directly in a browser, or serve the folder:

```sh
python3 -m http.server 8000
# then visit http://localhost:8000
```

## Deployment

The site deploys to GitHub Pages automatically on every push to `main` via `.github/workflows/deploy.yml`. In the repository settings, set **Pages → Source** to **GitHub Actions** (one-time setup).

All data is stored in the browser's `localStorage` — there is no backend.
