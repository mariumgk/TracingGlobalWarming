# Tracing Global Warming — Implementation Plan

## 1. Dataset-to-Chapter Mapping

| Chapter | Dataset(s) | Key Fields |
|---|---|---|
| **Hero** | None | Static 3D Earth scene |
| **The Signal** | observed.csv | Year, Annual_Mean (1880-2014) |
| **The Cause** | forcings.csv + piControl.csv | All Forcings, Human, Natural, Solar, Volcanic; piControl envelope |
| **Consequences** | Sea_Ice_Index_Monthly_Data_by_Year_G02135_v4.0.xlsx NH-Extent | Year, September minimum, Annual |
| **The Source** | CO2monthlyavg.txt + co2-emissions-fossil-land.csv | Year, CO2 ppm; Fossil fuels, Land-use change |
| **Where We Stand** | co2-emissions-fossil-land.csv | Entity, Code, Year, Fossil + Land-use (2022 snapshot) |
| **Big Picture** | All of the above | Causal chain synthesis |

## 2. Components to Build

- Hero.jsx — 3D Earth + title
- SignalSection.jsx — warming stripes + temp anomaly
- CauseSection.jsx — forcing attribution scroll reveal
- ConsequencesSection.jsx — sea ice scene
- SourceSection.jsx — CO2 + emissions
- MapSection.jsx — world choropleth
- BigPictureSection.jsx — causal chain

## 3. Animation Plan

- Hero: R3F Earth auto-rotates; title fades in
- Signal Stripes: left-to-right scroll reveal, blue to red color shift
- Signal Envelope: SVG line draws, band fades, annotation appears
- Cause: Lines revealed one-by-one per Scrollama step
- Ice: Chart draws on scroll; 3D mesh shrinks
- Source: CO2 line draws + emissions fills on scroll
- Map: Countries fill on entry, hover lifts
- Big Picture: Nodes glow in sequence, arrows animate

## 4. 3D Scene Plan

- EarthScene.jsx: R3F sphere + atmosphere shader + particle cloud
- IcebergScene.jsx: simple mesh driven by scrollProgress prop
- CO2ParticlesScene.jsx: rising particles into atmosphere sphere

## 5. Deployment Plan

- Vite base: '/TracingGlobalWarming/'
- gh-pages package for deployment
- Data files in /public/data/
