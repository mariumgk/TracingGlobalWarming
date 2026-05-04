import * as d3 from 'd3';
import * as XLSX from 'xlsx';

const BASE = import.meta.env.BASE_URL;

/** NASA GISTEMP: observed temperature anomalies 1880–2014 */
export async function loadObservedTemp() {
  const text = await fetch(`${BASE}data/observed.csv`).then(r => r.text());
  const rows = d3.csvParse(text);
  return rows
    .map(r => ({
      year: +r.Year,
      mean: r['Annual_Mean'] !== '' ? +r['Annual_Mean'] : null,
      fiveYear: r['5-year_Mean'] !== '' ? +r['5-year_Mean'] : null,
    }))
    .filter(r => r.mean !== null);
}

/** Climate forcings 1850–2005 (absolute K → anomaly from 1850–1900 baseline) */
export async function loadForcings() {
  const text = await fetch(`${BASE}data/forcings.csv`).then(r => r.text());
  const rows = d3.csvParse(text);
  const parsed = rows.map(r => ({
    year: +r.Year,
    all: +r['All forcings'],
    human: +r['Human'],
    natural: +r['Natural'],
    solar: +r['Solar'],
    volcanic: +r['Volcanic'],
    ghg: +r['Greenhouse gases'],
    aerosol: +r['Anthropogenic tropospheric aerosol'],
  })).filter(r => r.year >= 1850 && r.year <= 2005);

  // Compute 1850–1900 baseline mean for each series
  const baseline = parsed.filter(r => r.year <= 1900);
  const keys = ['all', 'human', 'natural', 'solar', 'volcanic', 'ghg', 'aerosol'];
  const baseMeans = {};
  keys.forEach(k => {
    baseMeans[k] = d3.mean(baseline, r => r[k]);
  });

  return parsed.map(r => {
    const out = { year: r.year };
    keys.forEach(k => {
      out[k] = r[k] - baseMeans[k];
    });
    return out;
  });
}

/** piControl: pre-industrial variability envelope */
export async function loadPiControl() {
  const text = await fetch(`${BASE}data/piControl.csv`).then(r => r.text());
  const lines = text.split('\n').filter(l => l.trim() && !l.startsWith('#'));
  const rows = lines.map(l => {
    const parts = l.split(',').map(p => p.trim());
    return +parts[1]; // Temperature K
  }).filter(v => !isNaN(v));

  const mean = d3.mean(rows);
  const std = d3.deviation(rows);
  // Return ±2σ envelope in anomaly space (already centred)
  return { mean: 0, lower: -2 * std, upper: 2 * std };
}

/** NSIDC Sea Ice: NH Extent by year (September minimum + Annual) */
export async function loadSeaIce() {
  const buf = await fetch(`${BASE}data/Sea_Ice_Index_Monthly_Data_by_Year_G02135_v4.0.xlsx`).then(r => r.arrayBuffer());
  const wb = XLSX.read(buf, { type: 'array' });
  const ws = wb.Sheets['NH-Extent'];
  const raw = XLSX.utils.sheet_to_json(ws, { header: 1 });

  // Row 0 = headers, Row 1+ = data
  // Columns: [0]=Year, [1]=Jan, ..., [9]=September, [14]=Annual
  const result = [];
  for (let i = 1; i < raw.length; i++) {
    const row = raw[i];
    const year = +row[0];
    if (isNaN(year) || year < 1979) continue;
    const september = row[9] !== undefined && row[9] !== '' ? +row[9] : null;
    const annual = row[14] !== undefined && row[14] !== '' ? +row[14] : null;
    if (september !== null) {
      result.push({ year, september, annual });
    }
  }
  return result;
}

/** NOAA MLO CO₂: monthly ppm → annual averages */
export async function loadCO2() {
  const text = await fetch(`${BASE}data/CO2monthlyavg.txt`).then(r => r.text());
  const lines = text.split('\n').filter(l => l.trim() && !l.startsWith('#'));

  const monthly = [];
  lines.forEach(l => {
    const parts = l.trim().split(/\s+/);
    if (parts.length < 12) return;
    const year = +parts[1];
    const month = +parts[2];
    const ppm = +parts[10]; // value column
    if (isNaN(year) || isNaN(ppm) || ppm < 0) return;
    monthly.push({ year, month, ppm });
  });

  // Annual averages
  const byYear = d3.group(monthly, d => d.year);
  const annual = [];
  byYear.forEach((vals, year) => {
    const validVals = vals.filter(v => v.ppm > 0);
    if (validVals.length < 6) return;
    annual.push({ year, ppm: d3.mean(validVals, v => v.ppm) });
  });

  return annual.sort((a, b) => a.year - b.year);
}

/** Emissions: fossil + land use by country and year */
export async function loadEmissions() {
  const text = await fetch(`${BASE}data/co2-emissions-fossil-land.csv`).then(r => r.text());
  const rows = d3.csvParse(text);

  const parsed = rows.map(r => ({
    entity: r.Entity,
    code: r.Code,
    year: +r.Year,
    fossil: r['Fossil fuels and industry'] !== '' ? +r['Fossil fuels and industry'] : 0,
    landUse: r['Land-use change'] !== '' ? +r['Land-use change'] : 0,
  }));

  // World totals by year (Entity === 'World')
  const worldRows = parsed.filter(r => r.entity === 'World');
  const worldByYear = worldRows.map(r => ({
    year: r.year,
    fossil: r.fossil / 1e9, // tonnes → GtCO2
    landUse: r.landUse / 1e9,
    total: (r.fossil + r.landUse) / 1e9,
  })).sort((a, b) => a.year - b.year);

  // Country snapshot — latest year with data (2022 or closest)
  const countries = parsed.filter(r => r.code && r.code.length === 3 && r.entity !== 'World');
  const latestByCountry = new Map();
  countries.forEach(r => {
    const yr = r.year;
    if (yr > 2022) return;
    const existing = latestByCountry.get(r.code);
    if (!existing || existing.year < yr) {
      latestByCountry.set(r.code, { ...r, total: r.fossil + r.landUse });
    }
  });

  const countrySnapshot = Array.from(latestByCountry.values())
    .sort((a, b) => b.total - a.total);

  return { worldByYear, countrySnapshot };
}
