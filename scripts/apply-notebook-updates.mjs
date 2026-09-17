// One-off: folds fresh facts from the NotebookLM ask (2026-09-18) into the
// company data files, skipping anything already present.

import { readFileSync, writeFileSync } from 'node:fs'

const dir = 'src/data/research'

const updates = {
  spacex: {
    timeline: [
      {
        date: '2026-09',
        title_he: 'הכנות לניסיון המסלולי המלא של Starship',
        text_he: 'טיסה 14 של Starship מתוכננת לניסיון השיגור המסלולי המלא הראשון, עם 26 לווייני Starlink בתא המטען. המטרה: להשלים הקפה ולחזור, במקום המסלולים החלקיים של הטיסות הקודמות.',
        tag_he: 'Starship',
      },
      {
        date: '2026-08',
        title_he: 'שיגור טלסקופ החלל Roman',
        text_he: 'בסוף אוגוסט 2026 שיגר Falcon Heavy בהצלחה את טלסקופ הדגל של נאס"א, Nancy Grace Roman. נאס"א מפקידה בידי SpaceX גם את המטענים המדעיים היקרים ביותר שלה.',
        tag_he: 'מדע',
      },
      {
        date: '2026-08',
        title_he: 'Starbase לואיזיאנה',
        text_he: 'SpaceX הכריזה על הקמת Starbase, Louisiana: מתחם שמתוכנן להיות נמל החלל הפרטי הגדול בעולם, לצד האתר הקיים בטקסס.',
        tag_he: 'תשתית',
      },
    ],
    programs: [
      {
        name: 'Starmind',
        desc_he: 'תשתית מחשוב בינה מלאכותית במסלול: חוות שרתים בחלל, בבנייה אנכית מלאה של SpaceX. נחשף במהלך 2026.',
        status_he: 'בפיתוח',
      },
    ],
  },
  'rocket-lab': {
    timeline: [
      {
        date: '2026-09',
        title_he: 'רכישת Iridium',
        text_he: 'Rocket Lab מקדמת עסקה לרכישת מפעילת התקשורת הלוויינית Iridium תמורת כשמונה מיליארד דולר. העסקה הופכת אותה מחברת שיגור לחברת חלל אנכית מלאה: שיגור, לוויינים ושירותי תקשורת תחת קורת גג אחת.',
        tag_he: 'עסקים',
      },
    ],
    programs: [],
  },
  nasa: {
    timeline: [
      {
        date: '2026-09',
        title_he: 'עדכון דרישות חליפת הירח AxEMU',
        text_he: 'נאס"א עדכנה את דרישות חליפת הירח AxEMU של Axiom Space כדי להתאים לצורכי המשימות הקרובות, לקראת ההליכה על הירח בתוכנית ארטמיס.',
        tag_he: 'ארטמיס',
      },
    ],
    programs: [],
  },
}

for (const [slug, u] of Object.entries(updates)) {
  const file = `${dir}/company-${slug}.json`
  const doc = JSON.parse(readFileSync(file, 'utf8'))
  const existingTitles = new Set(doc.timeline.map((t) => t.title_he))
  const fresh = u.timeline.filter((t) => !existingTitles.has(t.title_he) && !doc.timeline.some((e) => e.text_he.includes(t.title_he.slice(0, 12))))
  doc.timeline = [...fresh, ...doc.timeline]
  const existingPrograms = new Set((doc.programs || []).map((p) => p.name))
  for (const p of u.programs) if (!existingPrograms.has(p.name)) doc.programs.push(p)
  writeFileSync(file, JSON.stringify(doc, null, 2), 'utf8')
  console.log(`${slug}: +${fresh.length} timeline, programs now ${doc.programs.length}`)
}
