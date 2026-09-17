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
const imagesPrograms = files['./research/images-programs.json']
export const IMAGES = {
  ...SEED_IMAGES,
  ...((imagesSite && (imagesSite.default || imagesSite)) || {}),
  ...((imagesVehicles && (imagesVehicles.default || imagesVehicles)) || {}),
  ...((imagesPrograms && (imagesPrograms.default || imagesPrograms)) || {}),
}

// keys without their own photo borrow a fitting existing one
const IMAGE_ALIASES = {
  'program-artemis': 'company-nasa-hero',
  'program-space-launch-system': 'vehicle-sls-hero',
  'program-human-landing-system': 'vehicle-starship-hero',
  'program-starship-hls': 'vehicle-starship-hero',
  'program-vulcan-centaur': 'vehicle-vulcan-hero',
  'program-atlas-v': 'vehicle-vulcan-hero',
  'program-neutron': 'vehicle-neutron-hero',
  'program-starlink': 'program-falcon-9',
  'program-raptor-3': 'vehicle-starship-hero',
  'program-blue-moon-mk1': 'company-blue-origin-hero',
  'program-blue-moon-mk2': 'company-blue-origin-hero',
  'program-ofek': 'program-shavit',
  'program-amos': 'company-israel-space-hero',
  'program-ultrasat': 'company-israel-space-hero',
  'program-haste': 'vehicle-electron-hero',
  'program-photon': 'vehicle-electron-hero',
  'program-dror': 'company-israel-space-hero',
  'program-delta-iv': 'company-ula-hero',
}

export function slugifyName(name) {
  return String(name)
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
}

// keyword → image key, for timeline entries and fun facts
const KEYWORD_IMAGES = [
  [/starship|סטארשיפ|super heavy|raptor|רפטור/i, 'vehicle-starship-hero'],
  [/starlink|סטארלינק/i, 'program-falcon-9'],
  [/falcon|פאלקון/i, 'vehicle-falcon-9-hero'],
  [/dragon|דרגון/i, 'program-dragon'],
  [/artemis|ארטמיס|orion|אוריון/i, 'company-nasa-hero'],
  [/\bsls\b|space launch system/i, 'vehicle-sls-hero'],
  [/new glenn|ניו גלן/i, 'program-new-glenn'],
  [/blue moon/i, 'company-blue-origin-hero'],
  [/be-4|be-7/i, 'program-be-4'],
  [/new shepard|ניו שפרד/i, 'program-new-shepard'],
  [/electron|אלקטרון/i, 'vehicle-electron-hero'],
  [/neutron|נייטרון/i, 'vehicle-neutron-hero'],
  [/vulcan|וולקן/i, 'vehicle-vulcan-hero'],
  [/atlas|אטלס/i, 'company-ula-hero'],
  [/shavit|שביט|ofek|אופק/i, 'program-shavit'],
  [/beresheet|בראשית/i, 'program-beresheet-2'],
  [/gateway/i, 'program-gateway'],
  [/crew|צוות/i, 'program-commercial-crew'],
]

export function imageForText(text) {
  if (!text) return null
  for (const [re, key] of KEYWORD_IMAGES) {
    if (re.test(text)) {
      const img = getImage(key)
      if (img) return img
    }
  }
  return null
}

const notebookFile = files['./research/notebook-sources.json']
export const NOTEBOOK = (notebookFile && (notebookFile.default || notebookFile)) || { notebook: '', sources: [] }

export const companyBySlug = (slug) => COMPANIES.find((c) => c.slug === slug)
export const vehicleBySlug = (slug) => VEHICLES.find((v) => v.slug === slug)
export const vehiclesOfCompany = (slug) => VEHICLES.filter((v) => v.company_slug === slug)
export const getImage = (key) => IMAGES[key] || (IMAGE_ALIASES[key] ? IMAGES[IMAGE_ALIASES[key]] : null) || null
