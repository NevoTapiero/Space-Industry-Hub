// Data registry: merges researched JSON (src/data/research/*, written by the
// research workflow and later mirrored to Supabase) over minimal seeds.
// Vite eagerly bundles every research file present at build time.

import { SEED_COMPANIES, SEED_VEHICLES, SEED_SOURCES, SEED_IMAGES } from './seeds.js'

const files = import.meta.glob('./research/*.json', { eager: true })

function byName(prefix) {
  const out = {}
  for (const [path, mod] of Object.entries(files)) {
    const m = path.match(new RegExp(`\\./research/${prefix}-(.+)\\.json$`))
    if (m) out[m[1]] = mod.default || mod
  }
  return out
}

const researchedCompanies = byName('company')
const researchedVehicles = byName('vehicle')

const COMPANY_ORDER = ['spacex', 'blue-origin', 'rocket-lab', 'nasa', 'ula', 'israel-space']
const VEHICLE_ORDER = ['starship', 'falcon-9', 'new-glenn', 'neutron', 'electron', 'vulcan', 'sls', 'shavit']

function ordered(order, researched, seeds) {
  const seedMap = Object.fromEntries(seeds.map((s) => [s.slug, s]))
  return order
    .map((slug) => researched[slug] || seedMap[slug])
    .filter(Boolean)
}

export const COMPANIES = ordered(COMPANY_ORDER, researchedCompanies, SEED_COMPANIES)
export const VEHICLES = ordered(VEHICLE_ORDER, researchedVehicles, SEED_VEHICLES)

const sourcesFile = files['./research/sources.json']
export const SOURCES = (sourcesFile && (sourcesFile.default || sourcesFile)) || SEED_SOURCES

const imagesSite = files['./research/images-site.json']
const imagesVehicles = files['./research/images-vehicles.json']
export const IMAGES = {
  ...SEED_IMAGES,
  ...((imagesSite && (imagesSite.default || imagesSite)) || {}),
  ...((imagesVehicles && (imagesVehicles.default || imagesVehicles)) || {}),
}

const notebookFile = files['./research/notebook-sources.json']
export const NOTEBOOK = (notebookFile && (notebookFile.default || notebookFile)) || { notebook: '', sources: [] }

export const companyBySlug = (slug) => COMPANIES.find((c) => c.slug === slug)
export const vehicleBySlug = (slug) => VEHICLES.find((v) => v.slug === slug)
export const vehiclesOfCompany = (slug) => VEHICLES.filter((v) => v.company_slug === slug)
export const getImage = (key) => IMAGES[key] || null
