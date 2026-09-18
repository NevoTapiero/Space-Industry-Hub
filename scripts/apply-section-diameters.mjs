// One-off: adds real per-section diameters (public figures) where a section's
// width differs from the vehicle's core diameter, so the cutaway, silhouettes
// and 3D models show true proportions (wide Falcon fairing, narrow ICPS...).

import { readFileSync, writeFileSync } from 'node:fs'

const dir = 'src/data/research'

// slug -> { sectionKindOrId: diameter_m }
const patches = {
  'falcon-9': [
    { match: (s) => s.kind === 'fairing', d: 5.2 },
  ],
  vulcan: [
    { match: (s) => s.kind === 'fairing', d: 5.4 },
  ],
  sls: [
    { match: (s) => s.kind === 'kick_stage' || /icps/i.test(s.name_en || ''), d: 5.05 },
    { match: (s) => s.kind === 'capsule' || /orion/i.test(s.name_en || ''), d: 5.03 },
    { match: (s) => s.kind === 'service_module', d: 5.03 },
    { match: (s) => s.kind === 'escape_tower' || /las|launch abort/i.test(s.name_en || ''), d: 1.0 },
    { match: (s) => s.kind === 'interstage' && /adapter|lvsa/i.test(s.name_en || ''), d: 6.7 },
  ],
  electron: [
    { match: (s) => s.kind === 'fairing', d: 1.2 },
  ],
  'new-glenn': [
    { match: (s) => s.kind === 'fairing', d: 7.0 },
  ],
}

for (const [slug, rules] of Object.entries(patches)) {
  const file = `${dir}/vehicle-${slug}.json`
  const doc = JSON.parse(readFileSync(file, 'utf8'))
  let n = 0
  for (const sec of doc.sections) {
    for (const rule of rules) {
      if (rule.match(sec) && sec.diameter_m !== rule.d) {
        sec.diameter_m = rule.d
        n++
      }
    }
  }
  writeFileSync(file, JSON.stringify(doc, null, 2), 'utf8')
  console.log(`${slug}: ${n} sections patched`)
}
