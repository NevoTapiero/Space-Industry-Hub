import { useMemo, useState } from 'react'
import { useParams, Link, Navigate } from 'react-router-dom'
import { vehicleBySlug, companyBySlug, SOURCES, imageForText } from '../data/index.js'
import Cutaway from '../components/Cutaway.jsx'
import EngineCluster from '../components/EngineCluster.jsx'
import MissionProfile from '../components/MissionProfile.jsx'
import { Backdrop, Reveal } from '../components/ui.jsx'

const KIND_HE = {
  engines: 'מערך הנעה',
  tank_fuel: 'מכל דלק',
  tank_ox: 'מכל מחמצן',
  tank_common: 'מכלי דלק',
  thrust_structure: 'מבנה דחף',
  interstage: 'חיבור שלבים',
  fairing: 'חרטום מטען',
  nosecone: 'חרטום',
  payload: 'מטען',
  capsule: 'קפסולה',
  escape_tower: 'מגדל מילוט',
  service_module: 'מודול שירות',
  gridfins: 'הגאים אווירודינמיים',
  legs: 'רגלי נחיתה',
  flaps: 'משטחי היגוי',
  strakes: 'סנפירי ייצוב',
  avionics: 'אוויוניקה',
  heatshield: 'מגן חום',
  srb: 'מאיצי דלק מוצק',
  kick_stage: 'שלב עליון',
  other: 'רכיב',
}

export default function Vehicle() {
  const { slug } = useParams()
  const v = vehicleBySlug(slug)
  const [selectedId, setSelectedId] = useState(null)

  const relatedVideos = useMemo(
    () => (SOURCES.videos || []).filter((vid) => vid.related_vehicles?.includes(slug)).slice(0, 4),
    [slug],
  )

  if (!v) return <Navigate to="/vehicles" replace />

  const company = companyBySlug(v.company_slug)
  const selected = v.sections.find((s) => s.id === selectedId) || null
  const engineSection = v.sections.find((s) => s.engine && s.kind === 'engines')

  const specs = [
    { label: 'גובה', value: `${v.dims.height_m} m` },
    { label: 'קוטר', value: `${v.dims.diameter_m} m` },
    v.dims.mass_t ? { label: 'משקל המראה', value: `${v.dims.mass_t.toLocaleString()} t` } : null,
    v.dims.thrust_liftoff_kn ? { label: 'דחף בהמראה', value: `${v.dims.thrust_liftoff_kn.toLocaleString()} kN` } : null,
    v.dims.payload_leo_t ? { label: 'מטען ל-LEO', value: `${v.dims.payload_leo_t} t` } : null,
    v.dims.first_flight ? { label: 'טיסה ראשונה', value: v.dims.first_flight } : null,
  ].filter(Boolean)

  return (
    <>
      <section className="full short">
        <Backdrop imageKey={`vehicle-${v.slug}-hero`} className="full-bg" />
        <div className="full-content">
          <h1 className="hero-title">{v.name_he}</h1>
          <p className="hero-sub">
            <span className="chip accent">{v.status_he}</span>
            {v.dims.flights && <span className="chip" style={{ marginInlineStart: 8 }}>{v.dims.flights}</span>}
          </p>
        </div>
      </section>

      <div className="container" style={{ paddingBottom: 90 }}>
        <Reveal className="stat-bar">
          {specs.map((s) => (
            <div className="stat-cell" key={s.label}>
              <div className="stat-val">{s.value}</div>
              <div className="stat-label">{s.label}</div>
            </div>
          ))}
        </Reveal>

        <Reveal>
          {(v.intro_he || '').split('\n\n').map((p, i) => (
            <p key={i} className="lead" style={{ marginBottom: 16 }}>
              {p}
            </p>
          ))}
        </Reveal>

        {/* ---------- the cutaway explorer ---------- */}
        <Reveal>
          <h2 className="h-display section-gap" style={{ fontSize: 30, margin: '0 0 6px' }}>
            דיאגרמת חתך
          </h2>
          <p className="lead" style={{ marginBottom: 24 }}>
            השרטוט בקנה מידה אמיתי. לחיצה על כל חלק, בגוף הכלי או בתוויות, פותחת את ההסבר המלא שלו.
          </p>
        </Reveal>

        <div className="cutaway-wrap">
          <div className="cutaway-svg-box">
            <Cutaway vehicle={v} selectedId={selectedId} onSelect={setSelectedId} />
            <div className="cut-legend">
              <span><span className="sw" style={{ background: 'rgba(126,166,255,0.35)', border: '1px solid #8fb4f5' }} />מבנה ומכלים</span>
              <span><span className="sw" style={{ background: 'rgba(255,154,92,0.4)', border: '1px solid #ff9a5c' }} />מערכי הנעה</span>
              {v.sections.some((s) => s.kind === 'heatshield') && (
                <span><span className="sw" style={{ background: '#ff9a5c' }} />הקו הכתום: אריחי מגן החום, בצד שפוגש את האטמוספרה בחזרה</span>
              )}
            </div>
          </div>

          <div>
            {selected ? (
              <div className="part-panel" key={selected.id}>
                <div className="part-kicker">{KIND_HE[selected.kind] || 'רכיב'}</div>
                <div className="part-name">{selected.name_he}</div>
                <div className="part-name-en">{selected.name_en}</div>
                <p className="part-desc">{selected.desc_he}</p>
                {selected.facts?.length > 0 && (
                  <div className="fact-table">
                    {selected.facts.map((f) => (
                      <div className="fact-row" key={f.label_he}>
                        <span className="dim">{f.label_he}</span>
                        <b>{f.value}</b>
                      </div>
                    ))}
                  </div>
                )}
                {selected.engine && <EngineCluster engine={selected.engine} />}
                <button className="filter-btn" style={{ marginTop: 18 }} onClick={() => setSelectedId(null)}>
                  סגירה ✕
                </button>
              </div>
            ) : (
              <div className="part-panel">
                <div className="part-kicker">System Map</div>
                <div className="part-name">בחר חלק בשרטוט</div>
                <p className="part-desc">
                  כל תווית בשרטוט היא חלק אמיתי בכלי. אפשר גם לבחור מהרשימה:
                </p>
                <div className="filter-row" style={{ marginTop: 14 }}>
                  {v.sections.map((s) => (
                    <button key={s.id} className="filter-btn" onClick={() => setSelectedId(s.id)}>
                      {s.name_he}
                    </button>
                  ))}
                </div>
                {engineSection?.engine && <EngineCluster engine={engineSection.engine} />}
              </div>
            )}
          </div>
        </div>

        {/* ---------- mission profile ---------- */}
        <Reveal>
          <h2 className="h-display section-gap" style={{ fontSize: 26, margin: '0 0 6px' }}>פרופיל טיסה</h2>
          <p className="lead" style={{ marginBottom: 16 }}>
            מה קורה מרגע ההצתה ועד המסלול, ולאן חוזר הבוסטר.
          </p>
          <div className="cycle-diagram-box" style={{ maxWidth: 760 }}>
            <MissionProfile vehicle={v} />
          </div>
        </Reveal>

        {/* ---------- fun facts ---------- */}
        {v.fun_facts_he?.length > 0 && (
          <Reveal>
            <h2 className="h-display section-gap" style={{ fontSize: 26, margin: 0 }}>ידעת ש...</h2>
            <div className="program-grid" style={{ marginTop: 18 }}>
              {v.fun_facts_he.map((f, i) => {
                const img = imageForText(f)
                return (
                  <div className="fact-card" key={i}>
                    {img && (
                      <div className="fact-card-img">
                        <img src={img.url} alt="" loading="lazy" />
                      </div>
                    )}
                    <div className="fact-card-body">
                      <span className="fact-num">FACT {String(i + 1).padStart(2, '0')}</span>
                      {f}
                    </div>
                  </div>
                )
              })}
            </div>
          </Reveal>
        )}

        {/* ---------- related sources ---------- */}
        {relatedVideos.length > 0 && (
          <Reveal>
            <h2 className="h-display section-gap" style={{ fontSize: 26, margin: 0 }}>ללמוד לעומק</h2>
            <div className="vid-grid" style={{ marginTop: 18 }}>
              {relatedVideos.map((vid) => (
                <a key={vid.video_id} className="vid-card" href={`https://www.youtube.com/watch?v=${vid.video_id}`} target="_blank" rel="noreferrer">
                  <div className="vid-thumb">
                    <img src={`https://img.youtube.com/vi/${vid.video_id}/hqdefault.jpg`} alt="" loading="lazy" />
                    <div className="play">▶</div>
                  </div>
                  <div className="vid-body">
                    <div className="vid-title">{vid.title}</div>
                    <div className="vid-summary">{vid.summary_he}</div>
                  </div>
                </a>
              ))}
            </div>
            <div style={{ marginTop: 18 }}>
              <Link to="/sources" className="filter-btn">
                לכל המקורות ←
              </Link>
            </div>
          </Reveal>
        )}
      </div>
    </>
  )
}
