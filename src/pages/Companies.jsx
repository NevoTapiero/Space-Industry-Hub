import { Link } from 'react-router-dom'
import { COMPANIES, getImage } from '../data/index.js'
import { Reveal } from '../components/ui.jsx'

export default function Companies() {
  return (
    <div className="page container">
      <div className="page-head">
        <h1 className="h-display">החברות שמזיזות את התעשייה</h1>
        <p className="lead">פרופיל מלא לכל שחקן: ציר הזמן של הפיתוחים, התוכניות הפעילות, השיגורים הקרובים והחדשות, במקום אחד.</p>
      </div>

      <div className="card-grid">
        {COMPANIES.map((c, i) => {
          const img = getImage(`company-${c.slug}-card`) || getImage(`company-${c.slug}-hero`)
          return (
            <Reveal key={c.slug} delay={i * 70}>
              <Link to={`/companies/${c.slug}`} className="co-card" style={{ display: 'flex' }}>
                <div className="bg">{img ? <img src={img.url} alt="" loading="lazy" /> : <div className="ph-bg" />}</div>
                <div className="scrim" />
                <div className="co-card-body">
                  <span className="chip accent">{c.name_en}</span>
                  <div className="co-card-name" style={{ marginTop: 10 }}>
                    {c.name_he}
                  </div>
                  <div className="co-card-tag">{c.tagline_he}</div>
                </div>
              </Link>
            </Reveal>
          )
        })}
      </div>
    </div>
  )
}
