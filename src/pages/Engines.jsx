import { useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import { CYCLES, ENGINES, cycleById } from '../data/engines.js'
import { SOURCES, vehicleBySlug } from '../data/index.js'
import CycleDiagram from '../components/CycleDiagram.jsx'
import EngineViewer, { ENGINE_PARTS_HE } from '../components/EngineViewer.jsx'
import { Reveal } from '../components/ui.jsx'

export function EngineDetail({ engine }) {
  const [part, setPart] = useState(null)
  const cycle = cycleById(engine.cycle)
  const info = part ? ENGINE_PARTS_HE[part] : null

  const videos = useMemo(() => {
    const names = [engine.name.split(' ')[0], ...engine.vehicles]
    return (SOURCES.videos || [])
      .filter((v) => names.some((n) => v.title.toLowerCase().includes(String(n).toLowerCase()) || v.related_vehicles?.includes(n)))
      .slice(0, 3)
  }, [engine])

  const facts = [
    { l: 'מחזור עבודה', v: cycle?.name_he },
    { l: 'דלק', v: engine.fuel_he },
    { l: 'מחמצן', v: engine.ox_he },
    { l: 'לחץ תא הבעירה', v: engine.pc_bar ? `${engine.pc_bar} bar` : 'לא פורסם' },
    { l: 'דחף', v: engine.thrust_kn ? `${engine.thrust_kn.toLocaleString()} kN (${engine.thrust_note_he})` : null },
    { l: 'דחף סגולי', v: engine.isp_s ? `${engine.isp_s} s (${engine.isp_note_he})` : null },
    { l: 'משקל', v: engine.mass_kg ? `${engine.mass_kg.toLocaleString()} ק"ג` : null },
  ].filter((f) => f.v)

  return (
    <div className="cutaway-wrap" style={{ marginTop: 24 }}>
      <div>
        <EngineViewer engine={engine} selected={part} onSelect={setPart} />
        <p className="hint">לחיצה על כל חלק במנוע פותחת את ההסבר שלו. גרירה מסובבת, גלגלת מקרבת.</p>
      </div>
      <div>
        <div className="part-panel">
          {info ? (
            <>
              <div className="part-kicker">{engine.name}</div>
              <div className="part-name">{info.name_he}</div>
              <p className="part-desc">{info.text(engine)}</p>
              <button className="filter-btn" style={{ marginTop: 16 }} onClick={() => setPart(null)}>
                חזרה למפרט ✕
              </button>
            </>
          ) : (
            <>
              <div className="part-kicker">{engine.maker_he}</div>
              <div className="part-name">{engine.name}</div>
              <div className="part-name-en">{engine.status_he}</div>
              <div className="fact-table">
                {facts.map((f) => (
                  <div className="fact-row" key={f.l}>
                    <span className="dim">{f.l}</span>
                    <b>{f.v}</b>
                  </div>
                ))}
              </div>
              <p className="part-desc" style={{ marginTop: 14 }}>
                <b style={{ color: 'var(--hull)' }}>קירור: </b>
                {engine.cooling_he}
              </p>
              <p className="part-desc" style={{ marginTop: 8 }}>
                <b style={{ color: 'var(--hull)' }}>חומרים: </b>
                {engine.materials_he}
              </p>
              {engine.fun_he && (
                <p className="part-desc" style={{ marginTop: 8, color: '#9cc2ff' }}>
                  {engine.fun_he}
                </p>
              )}
              {engine.vehicles.length > 0 && (
                <div className="filter-row" style={{ marginTop: 14 }}>
                  {engine.vehicles.map((slug) => {
                    const v = vehicleBySlug(slug)
                    return v ? (
                      <Link key={slug} to={`/vehicles/${slug}`} className="filter-btn">
                        {v.name_he} ↗
                      </Link>
                    ) : null
                  })}
                </div>
              )}
            </>
          )}
        </div>

        {videos.length > 0 && (
          <div className="panel" style={{ marginTop: 16 }}>
            <div className="panel-title">סרטונים על המנוע</div>
            {videos.map((v) => (
              <div className="news-item" key={v.video_id}>
                <a href={`https://www.youtube.com/watch?v=${v.video_id}`} target="_blank" rel="noreferrer">
                  ▶ {v.title}
                </a>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}

export default function Engines() {
  const [engineId, setEngineId] = useState('raptor-3')
  const [openCycle, setOpenCycle] = useState('full-flow')
  const engine = ENGINES.find((e) => e.id === engineId)

  return (
    <div className="page container">
      <div className="page-head">
        <h1 className="h-display">מעבדת מנועים</h1>
        <p className="lead">
          כל הדרכים שבהן בני אדם הופכים כימיה לתאוצה: מגז קר ועד זרימה מלאה, עם דיאגרמת זרימה לכל מחזור, ומודל תלת ממדי
          אינטראקטיבי לכל מנוע אמיתי.
        </p>
      </div>

      {/* ---------- engines: 3D + specs ---------- */}
      <Reveal>
        <h2 className="sec-label" style={{ display: 'block', marginBottom: 12 }}>המנועים</h2>
        <div className="filter-row">
          {ENGINES.map((e) => (
            <button key={e.id} className={`filter-btn ${engineId === e.id ? 'on' : ''}`} onClick={() => setEngineId(e.id)}>
              {e.name}
            </button>
          ))}
        </div>
      </Reveal>
      {engine && <EngineDetail engine={engine} key={engine.id} />}

      {/* ---------- cycles catalog ---------- */}
      <Reveal>
        <h2 className="h-display section-gap" style={{ fontSize: 30, margin: '0 0 8px' }}>
          מחזורי הנעה, מהפשוט למורכב
        </h2>
        <p className="lead" style={{ marginBottom: 22 }}>
          השאלה שמגדירה כל מנוע רקטי: מאיפה המשאבות מקבלות כוח, ולאן הולכים הגזים אחר כך.
        </p>
      </Reveal>
      <div className="filter-row">
        {CYCLES.map((c) => (
          <button key={c.id} className={`filter-btn ${openCycle === c.id ? 'on' : ''}`} onClick={() => setOpenCycle(c.id)}>
            {c.name_he}
          </button>
        ))}
      </div>
      {CYCLES.filter((c) => c.id === openCycle).map((c) => (
        <Reveal key={c.id}>
          <div className="cycle-card">
            <div>
              <div className="part-kicker">{c.name_en}</div>
              <div className="part-name">{c.name_he}</div>
              <p className="part-desc">{c.desc_he}</p>
              <div className="fact-table">
                <div className="fact-row">
                  <span className="dim">לחץ תא טיפוסי</span>
                  <b>{c.pc_bar} bar</b>
                </div>
                <div className="fact-row">
                  <span className="dim">יתרונות</span>
                  <span style={{ maxWidth: '60%', textAlign: 'start' }}>{c.pros_he}</span>
                </div>
                <div className="fact-row">
                  <span className="dim">חסרונות</span>
                  <span style={{ maxWidth: '60%', textAlign: 'start' }}>{c.cons_he}</span>
                </div>
                <div className="fact-row">
                  <span className="dim">דוגמאות</span>
                  <span style={{ maxWidth: '60%', textAlign: 'start' }}>{c.examples_he}</span>
                </div>
              </div>
            </div>
            <div className="cycle-diagram-box">
              <CycleDiagram cycleId={c.id} />
            </div>
          </div>
        </Reveal>
      ))}
    </div>
  )
}
