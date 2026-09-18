import { useMemo, useState } from 'react'
import { Link, useSearchParams } from 'react-router-dom'
import RocketViewer from '../RocketViewer.jsx'
import EngineCluster from '../components/EngineCluster.jsx'
import { EngineDetail } from './Engines.jsx'
import { ENGINES } from '../data/engines.js'
import { VEHICLES, vehicleBySlug, SOURCES } from '../data/index.js'
import { Reveal } from '../components/ui.jsx'

const KIND_HE = {
  engines: 'מערך הנעה', tank_fuel: 'מכל דלק', tank_ox: 'מכל מחמצן', tank_common: 'מכלי דלק',
  thrust_structure: 'מבנה דחף', interstage: 'חיבור שלבים', fairing: 'חרטום מטען', nosecone: 'חרטום',
  payload: 'מטען', capsule: 'קפסולה', escape_tower: 'מגדל מילוט', service_module: 'מודול שירות',
  gridfins: 'הגאים', legs: 'רגלי נחיתה', flaps: 'משטחי היגוי', strakes: 'סנפירים', avionics: 'אוויוניקה',
  heatshield: 'מגן חום', srb: 'מאיצים', kick_stage: 'שלב עליון', other: 'רכיב',
}

function VehicleGarage() {
  const [params, setParams] = useSearchParams()
  const slug = params.get('v') || 'starship'
  const [partId, setPartId] = useState(null)
  const vehicle = vehicleBySlug(slug) || VEHICLES[0]
  const section = vehicle.sections.find((s) => s.id === partId) || null

  const videos = useMemo(
    () => (SOURCES.videos || []).filter((v) => v.related_vehicles?.includes(vehicle.slug)).slice(0, 3),
    [vehicle.slug],
  )

  return (
    <div className="cutaway-wrap">
      <div>
        <RocketViewer
          slug={slug}
          onSlugChange={(s) => setParams({ v: s }, { replace: true })}
          selectedId={partId}
          onSelectPart={setPartId}
        />
      </div>
      <div>
        <div className="part-panel">
          {section ? (
            <>
              <div className="part-kicker">{KIND_HE[section.kind] || 'רכיב'}</div>
              <div className="part-name">{section.name_he}</div>
              <div className="part-name-en">{section.name_en}</div>
              <p className="part-desc">{section.desc_he}</p>
              {section.facts?.length > 0 && (
                <div className="fact-table">
                  {section.facts.map((f) => (
                    <div className="fact-row" key={f.label_he}>
                      <span className="dim">{f.label_he}</span>
                      <b>{f.value}</b>
                    </div>
                  ))}
                </div>
              )}
              {section.engine && <EngineCluster engine={section.engine} />}
              <button className="filter-btn" style={{ marginTop: 16 }} onClick={() => setPartId(null)}>
                סגירה ✕
              </button>
            </>
          ) : (
            <>
              <div className="part-kicker">System Map</div>
              <div className="part-name">{vehicle.name_he}</div>
              <p className="part-desc">לחץ על חלק במודל התלת ממדי, או בחר מהרשימה:</p>
              <div className="filter-row" style={{ marginTop: 12 }}>
                {vehicle.sections
                  .filter((s) => !s.overlay)
                  .map((s) => (
                    <button key={s.id} className="filter-btn" onClick={() => setPartId(s.id)}>
                      {s.name_he}
                    </button>
                  ))}
              </div>
              <Link to={`/vehicles/${vehicle.slug}`} className="filter-btn" style={{ marginTop: 14, display: 'inline-block' }}>
                לדיאגרמת החתך המלאה ↗
              </Link>
            </>
          )}
        </div>

        {videos.length > 0 && (
          <div className="panel" style={{ marginTop: 16 }}>
            <div className="panel-title">סרטונים על {vehicle.name_he}</div>
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

export default function Hangar() {
  const [mode, setMode] = useState('vehicles')
  const [engineId, setEngineId] = useState('raptor-3')
  const engine = ENGINES.find((e) => e.id === engineId)

  return (
    <div className="page container">
      <div className="page-head">
        <h1 className="h-display">הגראז'</h1>
        <p className="lead">כל כלי וכל מנוע, בתלת ממד, עם הסבר על כל חלק בלחיצה. המודלים נבנים מנתוני החתך האמיתיים.</p>
      </div>

      <div className="filter-row" style={{ marginBottom: 22 }}>
        <button className={`filter-btn ${mode === 'vehicles' ? 'on' : ''}`} onClick={() => setMode('vehicles')}>
          כלי שיגור
        </button>
        <button className={`filter-btn ${mode === 'engines' ? 'on' : ''}`} onClick={() => setMode('engines')}>
          מנועים
        </button>
      </div>

      {mode === 'vehicles' ? (
        <Reveal>
          <VehicleGarage />
        </Reveal>
      ) : (
        <Reveal>
          <div className="filter-row">
            {ENGINES.map((e) => (
              <button key={e.id} className={`filter-btn ${engineId === e.id ? 'on' : ''}`} onClick={() => setEngineId(e.id)}>
                {e.name}
              </button>
            ))}
          </div>
          {engine && <EngineDetail engine={engine} key={engine.id} />}
        </Reveal>
      )}
    </div>
  )
}
