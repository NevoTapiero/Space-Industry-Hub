// Content layer with optional Supabase backing.
// Without VITE_SUPABASE_URL / VITE_SUPABASE_ANON_KEY the site runs fully on
// the bundled research data; with them, rows in Supabase override the bundle
// (so content can be edited in the dashboard without redeploying).

import { createClient } from '@supabase/supabase-js'
import { COMPANIES, VEHICLES, SOURCES } from '../data/index.js'

const url = import.meta.env.VITE_SUPABASE_URL
const key = import.meta.env.VITE_SUPABASE_ANON_KEY

export const supabase = url && key ? createClient(url, key) : null

async function fromTable(table, localRows, mapRow) {
  if (!supabase) return localRows
  try {
    const { data, error } = await supabase.from(table).select('*')
    if (error || !data || data.length === 0) return localRows
    return data.map(mapRow)
  } catch {
    return localRows
  }
}

// Tables store the full document in a jsonb "doc" column keyed by slug —
// one row per company/vehicle, so the dashboard stays a simple JSON editor.
export const getCompanies = () =>
  fromTable('companies', COMPANIES, (r) => r.doc).then((rows) =>
    [...rows].sort((a, b) => COMPANIES.findIndex((c) => c.slug === a.slug) - COMPANIES.findIndex((c) => c.slug === b.slug)),
  )

export const getVehicles = () =>
  fromTable('vehicles', VEHICLES, (r) => r.doc).then((rows) =>
    [...rows].sort((a, b) => VEHICLES.findIndex((v) => v.slug === a.slug) - VEHICLES.findIndex((v) => v.slug === b.slug)),
  )

export const getSources = () =>
  supabase
    ? fromTable('sources', SOURCES.videos, (r) => r.doc).then((videos) => ({ videos }))
    : Promise.resolve(SOURCES)
