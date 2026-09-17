// Data layer: live launch data + spaceflight news, with localStorage caching.
// Launch Library 2 (The Space Devs) allows only ~15 anonymous requests/hour,
// so every response is cached for 30 minutes and reused on failure.

const CACHE_TTL_MS = 30 * 60 * 1000

const LL2_UPCOMING =
  'https://ll.thespacedevs.com/2.2.0/launch/upcoming/?limit=12&mode=detailed&hide_recent_previous=true'
const SNAPI_ARTICLES =
  'https://api.spaceflightnewsapi.net/v4/articles/?limit=10&ordering=-published_at'

function readCache(key) {
  try {
    const raw = localStorage.getItem(key)
    if (!raw) return null
    return JSON.parse(raw)
  } catch {
    return null
  }
}

function writeCache(key, data) {
  try {
    localStorage.setItem(key, JSON.stringify({ ts: Date.now(), data }))
  } catch {
    /* storage unavailable — live fetch still works */
  }
}

async function cachedFetch(key, url) {
  const cached = readCache(key)
  if (cached && Date.now() - cached.ts < CACHE_TTL_MS) {
    return { data: cached.data, stale: false, fromCache: true }
  }
  try {
    const res = await fetch(url)
    if (!res.ok) throw new Error(`HTTP ${res.status}`)
    const data = await res.json()
    writeCache(key, data)
    return { data, stale: false, fromCache: false }
  } catch (err) {
    if (cached) return { data: cached.data, stale: true, fromCache: true }
    throw err
  }
}

export async function fetchUpcomingLaunches() {
  const { data, stale } = await cachedFetch('sih.launches', LL2_UPCOMING)
  const launches = (data.results || []).map((l) => ({
    id: l.id,
    name: l.name,
    net: l.net,
    status: l.status?.abbrev || '',
    statusName: l.status?.name || '',
    provider: l.launch_service_provider?.name || '',
    rocket: l.rocket?.configuration?.full_name || '',
    pad: l.pad?.name || '',
    location: l.pad?.location?.name || '',
    mission: l.mission?.description || '',
    missionType: l.mission?.type || '',
    orbit: l.mission?.orbit?.name || '',
    image: l.image || null,
    webcasts: (l.vidURLs || []).map((v) => v.url),
  }))
  return { launches, stale }
}

export async function fetchNews() {
  const { data, stale } = await cachedFetch('sih.news', SNAPI_ARTICLES)
  const articles = (data.results || []).map((a) => ({
    id: a.id,
    title: a.title,
    url: a.url,
    site: a.news_site,
    summary: a.summary,
    published: a.published_at,
    image: a.image_url,
  }))
  return { articles, stale }
}
