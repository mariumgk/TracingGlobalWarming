# 🌍 Tracing Global Warming

An interactive, data-driven scrollytelling experience that traces the story of global warming — from the temperature signal, to its causes, to the consequences we can already see.

## Live Demo

> 🔗 **[mariumgk.github.io/TracingGlobalWarming](https://mariumgk.github.io/TracingGlobalWarming)**

## Project Structure

```
TracingGlobalWarming/
├── climate-story/          # Vite + React web app
│   ├── public/
│   │   ├── data/           # All CSV / TXT / XLSX datasets
│   │   └── textures/       # Earth globe textures
│   └── src/
│       ├── charts/         # D3 chart components
│       ├── components/     # Shared UI components
│       ├── sections/       # Page sections (Hero, Signal, Cause …)
│       ├── three/          # Three.js / R3F 3D scenes
│       └── utils/          # Data loaders & scale helpers
├── docs/                   # Project documentation
│   └── IMPLEMENTATION_PLAN.md
└── A2_2023303_2023202.ipynb  # Data exploration notebook
```

## Chapters

| Chapter | Key Dataset | Visualization |
|---|---|---|
| **Hero** | — | 3-D rotating Earth |
| **The Signal** | `observed.csv` | Warming stripes + anomaly envelope |
| **The Cause** | `forcings.csv`, `piControl.csv` | Attribution forcing lines |
| **Consequences** | Sea Ice Index | Sea-ice area trend |
| **The Source** | `CO2monthlyavg.txt`, `co2-emissions-fossil-land.csv` | CO₂ + emissions charts |
| **Where We Stand** | `co2-emissions-fossil-land.csv` | World choropleth map |
| **Big Picture** | All above | Causal chain synthesis |

## Getting Started

```bash
cd climate-story
npm install
npm run dev
```

Open [http://localhost:5173](http://localhost:5173) in your browser.

## Deployment (GitHub Pages)

1. Update `homepage` in `climate-story/package.json` with your GitHub username.
2. Run:

```bash
cd climate-story
npm run deploy
```

## Tech Stack

- **Vite** + **React 19**
- **Three.js** / **React Three Fiber** — 3D Earth scenes
- **D3.js** — data charts & maps
- **GSAP** + **Scrollama** — scroll-driven animations
- **Lenis** — smooth scrolling
- **Tailwind CSS** — utility styling

## Data Sources

- NASA GISS Surface Temperature Analysis (GISTEMP)
- IPCC AR5 / CMIP5 forcing attribution data
- NSIDC Sea Ice Index v4.0
- NOAA Mauna Loa CO₂ monthly averages
- Our World in Data — CO₂ and greenhouse gas emissions
