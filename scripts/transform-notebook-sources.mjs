// Cleans the raw NotebookLM metadata export (notebook-meta.json) into the
// categorized directory the sources page renders (notebook-sources.json).
// Run once after re-exporting the notebook: node scripts/transform-notebook-sources.mjs

import { readFileSync, writeFileSync } from 'node:fs'

const inFile = 'scripts/notebook-meta.json'
const outFile = 'src/data/research/notebook-sources.json'

const raw = JSON.parse(readFileSync(inFile, 'utf8').replace(/^﻿/, ''))

const NEWS = ['arstechnica.com', 'spaceflightnow.com', 'spacenews.com', 'nasaspaceflight.com', 'space.com', 'universetoday.com', 'mainenginecutoff.com']
const TRACKERS = ['nextspaceflight.com', 'planet4589.org', 'space.skyrocket.de']
const AGENCIES = ['nasa.gov', 'esa.int', 'cnsa.gov.cn', 'jaxa.jp', 'isro.gov.in']

const TITLE_FIX = {
  'www.rocketlabusa.com': 'Rocket Lab',
  'www.blueorigin.com': 'Blue Origin',
  'www.spacex.com': 'SpaceX',
  'english.spacechina.com': 'CASC (China Aerospace)',
}

function categorize(host) {
  const h = host.replace(/^www\./, '')
  if (host.includes('youtube.com')) return 'יוטיוב'
  if (NEWS.some((d) => h.endsWith(d))) return 'חדשות ומגזינים'
  if (TRACKERS.some((d) => h.endsWith(d))) return 'מעקב ומאגרי מידע'
  if (AGENCIES.some((d) => h.endsWith(d))) return 'סוכנויות חלל'
  return 'חברות'
}

const seen = new Set()
const sources = []
for (const s of raw.sources || []) {
  if (!s.url || seen.has(s.url)) continue
  seen.add(s.url)
  const host = new URL(s.url).host
  let title = (TITLE_FIX[host] || s.title || host).replace(/\s*-\s*YouTube$/, '').trim()
  sources.push({ title, url: s.url, domain: host.replace(/^www\./, ''), category: categorize(host) })
}

sources.sort((a, b) => a.category.localeCompare(b.category, 'he') || a.title.localeCompare(b.title))
writeFileSync(outFile, JSON.stringify({ notebook: raw.title || 'Space Industry Hub', sources }, null, 2), 'utf8')
console.log(`Wrote ${outFile}: ${sources.length} unique sources`)
