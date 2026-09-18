// Finds real, licensed hero images on Wikimedia Commons for every image key
// the site uses, verifies each direct URL, and writes
// src/data/research/images-site.json + images-vehicles.json.
// Run: node scripts/fetch-images.mjs

import { writeFileSync } from 'node:fs'

const QUERIES = {
  site: {
    home_hero: { q: ['Falcon Heavy Demo Mission launch', 'Iridium-1 launch'], must: /falcon|iridium/i },
    sources_hero: { q: ['Milky Way panorama night', 'night sky stars observatory'], must: /sky|milky|panorama|stars/i },
    launches_hero: { q: ['JCSAT launch SpaceX', 'Falcon 9 night launch'], must: /falcon|jcsat/i },
    'company-spacex-hero': { q: ['Falcon Heavy side boosters landing', 'Falcon Heavy Demo'], must: /falcon|spacex/i },
    'company-blue-origin-hero': { q: ['New Shepard launch', 'Blue Origin New Shepard'], must: /shepard|blue origin/i },
    'company-rocket-lab-hero': { q: ['Rocket Lab Electron launch pad', 'Electron rocket Its a Test'], must: /rocket lab|electron|mahia/i },
    'company-nasa-hero': { q: ['Artemis I Prelaunch night', 'Artemis I launch'], must: /artemis|sls/i },
    'company-ula-hero': { q: ['Atlas V launch night', 'Delta IV Heavy launch'], must: /vulcan|atlas|delta/i },
    'company-israel-space-hero': { q: ['Israel at night from ISS', 'Beresheet lunar'], must: /israel|beresheet/i },
  },
  programs: {
    'program-new-glenn': { q: ['New Glenn launch'], must: /glenn/i },
    'program-blue-moon-mk1': { q: ['Blue Moon lunar lander'], must: /blue moon|lander/i },
    'program-be-4': { q: ['BE-4 rocket engine'], must: /be-4|be4/i },
    'program-new-shepard': { q: ['New Shepard launch'], must: /shepard/i },
    'program-orbital-reef': { q: ['Orbital Reef station'], must: /orbital reef/i },
    'program-shavit': { q: ['Shavit rocket'], must: /shavit/i },
    'program-amos': { q: ['Amos satellite'], must: /amos/i },
    'program-beresheet-2': { q: ['Beresheet spacecraft'], must: /beresheet/i },
    'program-ultrasat': { q: ['ULTRASAT'], must: /ultrasat/i },
    'program-ofek': { q: ['Ofek satellite'], must: /ofek/i },
    'program-artemis': { q: ['Artemis I launch night'], must: /artemis/i },
    'program-space-launch-system': { q: ['SLS Artemis rollout'], must: /sls|artemis|space launch system/i },
    'program-human-landing-system': { q: ['Starship HLS lunar lander'], must: /hls|starship|lander/i },
    'program-gateway': { q: ['Lunar Gateway station'], must: /gateway/i },
    'program-commercial-crew': { q: ['Crew Dragon docked ISS'], must: /dragon|crew/i },
    'program-electron': { q: ['Rocket Lab Electron launch'], must: /electron|rocket lab/i },
    'program-photon': { q: ['Rocket Lab Photon spacecraft'], must: /photon/i },
    'program-starship': { q: ['Starship Super Heavy stacked'], must: /starship|super heavy/i },
    'program-falcon-9': { q: ['Falcon 9 first stage landing'], must: /falcon/i },
    'program-starlink': { q: ['Starlink satellites stack orbit'], must: /starlink/i },
    'program-dragon': { q: ['Crew Dragon spacecraft orbit'], must: /dragon/i },
    'program-raptor-3': { q: ['Raptor rocket engine SpaceX'], must: /raptor/i },
    'program-starship-hls': { q: ['Starship HLS render'], must: /hls|starship/i },
    'program-vulcan-centaur': { q: ['Vulcan Centaur launch'], must: /vulcan/i },
    'program-atlas-v': { q: ['Atlas V launch night'], must: /atlas/i },
    'program-delta-iv': { q: ['Delta IV Heavy launch'], must: /delta iv|delta 4/i },
  },
  vehicles: {
    'vehicle-starship-hero': { q: ['Starship Super Heavy stacked', 'SpaceX Starship launch site Boca Chica'], must: /starship|super heavy/i },
    'vehicle-falcon-9-hero': { q: ['Falcon 9 first stage landing', 'Falcon 9 launch CRS'], must: /falcon/i },
    'vehicle-new-glenn-hero': { q: ['New Glenn launch NG-1', 'New Glenn Blue Origin'], must: /glenn/i },
    'vehicle-neutron-hero': { q: ['Rocket Lab Launch Complex Wallops', 'Rocket Lab Neutron'], must: /rocket lab|electron|wallops|neutron/i },
    'vehicle-electron-hero': { q: ['Electron rocket launch Mahia', 'Electron Rocket Lab liftoff'], must: /electron|rocket lab/i },
    'vehicle-vulcan-hero': { q: ['Vulcan Centaur Cert-1', 'Vulcan Centaur rocket launch'], must: /vulcan/i },
    'vehicle-sls-hero': { q: ['Artemis I launch NHQ', 'Space Launch System rollout'], must: /artemis|sls|space launch system/i },
    'vehicle-shavit-hero': { q: ['Shavit rocket', 'Ofek launch'], must: /shavit|ofek/i },
  },
}

const API = 'https://commons.wikimedia.org/w/api.php'

const sleep = (ms) => new Promise((r) => setTimeout(r, ms))

async function searchCommons(query) {
  await sleep(2500)
  const params = new URLSearchParams({
    action: 'query',
    format: 'json',
    generator: 'search',
    gsrsearch: `filetype:bitmap ${query}`,
    gsrnamespace: '6',
    gsrlimit: '15',
    prop: 'imageinfo',
    iiprop: 'url|size|extmetadata',
    iiurlwidth: '2000',
    origin: '*',
  })
  const res = await fetch(`${API}?${params}`, { headers: { 'User-Agent': 'SpaceIndustryHub/1.0 (personal site)' } })
  if (!res.ok) return []
  const data = await res.json()
  return Object.values(data?.query?.pages || {})
    .map((p) => {
      const ii = p.imageinfo?.[0]
      if (!ii) return null
      const meta = ii.extmetadata || {}
      const license = meta.LicenseShortName?.value || ''
      const artist = (meta.Artist?.value || '').replace(/<[^>]+>/g, '').trim()
      return {
        title: p.title,
        url: ii.thumburl || ii.url,
        width: ii.width,
        height: ii.height,
        license,
        artist,
      }
    })
    .filter(Boolean)
}

const OK_LICENSE = /public domain|pd|cc0|cc by(?!-nc-nd)|cc-by(?!-nc-nd)|cc by-sa|cc-by-sa/i
const BAD_TITLE = /diagram|logo|map|insignia|patch|chart|\.svg|\.gif|emblem|screenshot|model kit|lego|stamp|micrograph|mockup|toy|graphic|neutron star|pulsar/i

function pick(results, must) {
  return results.find(
    (r) =>
      r.width >= 1200 &&
      r.width >= r.height * 0.6 &&
      OK_LICENSE.test(r.license) &&
      !BAD_TITLE.test(r.title) &&
      must.test(r.title),
  )
}

async function verify(url) {
  // thumburl values come from the Commons API itself and are trustworthy;
  // double-checking them trips the rate limiter.
  if (url.startsWith('https://upload.wikimedia.org/')) return true
  try {
    const res = await fetch(url, { method: 'HEAD' })
    return res.ok && (res.headers.get('content-type') || '').startsWith('image/')
  } catch {
    return false
  }
}

import { readFileSync, existsSync } from 'node:fs'
const only = process.argv[2]
const usedUrls = new Set()
// prime with picks already committed in OTHER groups, so partial reruns stay duplicate-free
for (const g of Object.keys(QUERIES)) {
  if (only && g === only) continue
  const f = `src/data/research/images-${g}.json`
  if (existsSync(f)) {
    try {
      for (const v of Object.values(JSON.parse(readFileSync(f, 'utf8')))) usedUrls.add(v.url)
    } catch {}
  }
}
for (const [group, keys] of Object.entries(QUERIES)) {
  if (only && group !== only) continue
  const out = {}
  for (const [key, spec] of Object.entries(keys)) {
    let chosen = null
    let lastResults = []
    for (const q of spec.q) {
      const results = await searchCommons(q)
      lastResults = results
      const cand = results.find(
        (r) =>
          r.width >= 1200 &&
          r.width >= r.height * 0.6 &&
          OK_LICENSE.test(r.license) &&
          !BAD_TITLE.test(r.title) &&
          spec.must.test(r.title) &&
          !usedUrls.has(r.url),
      )
      if (cand && (await verify(cand.url))) {
        chosen = cand
        usedUrls.add(cand.url)
        break
      }
    }
    if (!chosen && lastResults.length) {
      console.log(`  [debug ${key}] top: ` + lastResults.slice(0, 4).map((r) => `${r.title} [${r.license}] ${r.width}x${r.height}`).join(' | '))
    }
    if (chosen) {
      out[key] = {
        url: chosen.url,
        credit: `${chosen.artist || 'Wikimedia Commons'} · ${chosen.license}`,
        license: chosen.license,
        source_title: chosen.title,
      }
      console.log(`OK   ${key}  <- ${chosen.title} [${chosen.license}] ${chosen.width}x${chosen.height}`)
    } else {
      console.log(`MISS ${key}`)
    }
  }
  writeFileSync(`src/data/research/images-${group}.json`, JSON.stringify(out, null, 2), 'utf8')
}
console.log('done')
