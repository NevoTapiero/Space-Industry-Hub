// Minimal fallback content, used only until the researched data files exist
// in src/data/research/ (and as a safety net if one is ever missing).

export const SEED_COMPANIES = [
  {
    slug: 'spacex',
    name_he: 'SpaceX',
    name_en: 'SpaceX',
    tagline_he: 'הופכים את האנושות לרב פלנטרית',
    description_he:
      'החברה שהפכה את הנחתת טילים משיגרה, מפעילה את צי השיגור העמוס בעולם, ובונה את Starship: הטיל הגדול ביותר שנבנה אי פעם.',
    founded: '2002',
    hq_he: 'סטארבייס, טקסס',
    color: '#6ea8ff',
    ll2_id: 121,
    news_query: 'SpaceX',
    stats: [
      { label_he: 'שיגורים מוצלחים', value: '400+' },
      { label_he: 'נחיתות בוסטר', value: '380+' },
    ],
    timeline: [],
    programs: [],
    vehicles: ['starship', 'falcon-9'],
  },
]

export const SEED_VEHICLES = [
  {
    slug: 'falcon-9',
    name_en: 'Falcon 9',
    name_he: 'פאלקון 9',
    company_slug: 'spacex',
    status_he: 'פעיל',
    intro_he: 'סוס העבודה של תעשיית החלל: טיל דו שלבי לשימוש חוזר.',
    dims: { height_m: 70, diameter_m: 3.7, mass_t: 549, payload_leo_t: 22.8, thrust_liftoff_kn: 7607, stages: 2, first_flight: '2010' },
    sections: [
      { id: 'engines', name_he: 'מערך מנועים', name_en: 'Octaweb', from_m: 0, to_m: 3, kind: 'engines', desc_he: 'תשעה מנועי Merlin במערך אוקטהווב.', facts: [], engine: { name: 'Merlin 1D', count: 9, cycle_he: 'מחזור פתוח', layout: 'octaweb', propellant_he: 'קרוסין וחמצן נוזלי' } },
      { id: 's1-tanks', name_he: 'מכלי שלב ראשון', name_en: 'Stage 1 Tanks', from_m: 3, to_m: 41, kind: 'tank_common', desc_he: 'מכלי החמצן והקרוסין של השלב הראשון.', facts: [] },
      { id: 'interstage', name_he: 'טבעת ביניים', name_en: 'Interstage', from_m: 41, to_m: 47, kind: 'interstage', desc_he: 'מחברת בין השלבים ומכילה את מנגנון ההפרדה.', facts: [] },
      { id: 's2', name_he: 'שלב שני', name_en: 'Stage 2', from_m: 47, to_m: 57, kind: 'tank_common', desc_he: 'השלב שמגיע למסלול, עם מנוע Merlin Vacuum.', facts: [], engine: { name: 'Merlin Vacuum', count: 1, cycle_he: 'מחזור פתוח', layout: 'single', propellant_he: 'קרוסין וחמצן נוזלי' } },
      { id: 'fairing', name_he: 'חרטום מטען', name_en: 'Fairing', from_m: 57, to_m: 70, kind: 'fairing', desc_he: 'מגן על המטען בדרך למעלה, נאסף מהים לשימוש חוזר.', facts: [] },
      { id: 'gridfins', name_he: 'סנפירי רשת', name_en: 'Grid Fins', from_m: 44, to_m: 46, kind: 'gridfins', overlay: true, desc_he: 'הגאים אווירודינמיים לחזרה מדויקת.', facts: [] },
      { id: 'legs', name_he: 'רגלי נחיתה', name_en: 'Landing Legs', from_m: 0, to_m: 9, kind: 'legs', overlay: true, desc_he: 'ארבע רגליים מתקפלות מסיבי פחמן.', facts: [] },
    ],
    fun_facts_he: [],
  },
]

export const SEED_SOURCES = { videos: [] }

export const SEED_IMAGES = {}
