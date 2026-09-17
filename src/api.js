// Live data: launches (Launch Library 2) + news (Spaceflight News API).
// LL2 allows ~15 anonymous requests/hour, so responses are cached in
// localStorage for 30 minutes and reused when a refresh fails.

const CACHE_TTL_MS = 30 * 60 * 1000

const LL2_UPCOMING =
  'https://ll.thespacedevs.com/2.2.0/launch/upcoming/?limit=30&mode=detailed&hide_recent_previous=true'

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
    providerId: l.launch_service_provider?.id || null,
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

export async function fetchNews(query = '', limit = 12) {
  const url = new URL('https://api.spaceflightnewsapi.net/v4/articles/')
  url.searchParams.set('limit', String(limit))
  url.searchParams.set('ordering', '-published_at')
  if (query) url.searchParams.set('search', query)
  const cacheKey = `sih.news.${query || 'all'}`
  const { data, stale } = await cachedFetch(cacheKey, url.toString())
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
