import { Link } from 'react-router-dom'
import { VEHICLES, companyBySlug, getImage } from '../data/index.js'
import ScaleLineup from '../components/ScaleLineup.jsx'
import { Reveal } from '../components/ui.jsx'

export default function Vehicles() {
  return (
    <div className="page container">
      <div className="page-head">
        <div className="eyebrow">The Fleet</div>
        <h1 className="h-display">כלי השיגור</h1>
        <p className="lead">
          כל כלי מוצג בקנה מידה אמיתי, עם דיאגרמת חתך אינטראקטיבית: לוחצים על כל חלק ומקבלים את ההסבר המלא, המספרים, ומבנה
          מערך המנועים.
        </p>
      </div>

      <Reveal>
        <ScaleLineup vehicles={VEHICLES} />
      </Reveal>

      <div className="card-grid section-gap">
        {VEHICLES.map((v, i) => {
          const img = getImage(`vehicle-${v.slug}-hero`)
          const company = companyBySlug(v.company_slug)
          return (
            <Reveal key={v.slug} delay={i * 60}>
              <Link to={`/vehicles/${v.slug}`} className="co-card" style={{ display: 'flex', minHeight: 260 }}>
                <div className="bg">{img ? <img src={img.url} alt="" loading="lazy" /> : <div className="ph-bg" />}</div>
                <div className="scrim" />
                <div className="co-card-body">
                  <span className="chip accent">{company?.name_en || v.company_slug}</span>
                  <div className="co-card-name" style={{ marginTop: 10 }}>
                    {v.name_he}
                  </div>
                  <div className="co-card-tag">
                    {v.dims.height_m} מ׳ · {v.status_he}
                  </div>
                </div>
              </Link>
            </Reveal>
          )
        })}
      </div>
    </div>
  )
}
