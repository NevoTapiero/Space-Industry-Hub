import { useParams, Link, Navigate } from 'react-router-dom'
import { companyBySlug, vehiclesOfCompany, getImage, slugifyName, imageForText } from '../data/index.js'
import { useLaunches, useNews } from '../hooks.js'
import { Backdrop, Reveal, LaunchList, NewsList } from '../components/ui.jsx'
import Silhouette from '../components/Silhouette.jsx'

export default function Company() {
  const { slug } = useParams()
  const c = companyBySlug(slug)
  const data = useLaunches()
  const news = useNews(c?.news_query || '', 8)

  if (!c) return <Navigate to="/companies" replace />

  const vehicles = vehiclesOfCompany(slug)
  const companyLaunches = c.ll2_id ? data.launches.filter((l) => l.providerId === c.ll2_id) : []

  return (
    <>
      <section className="full short">
        <Backdrop imageKey={`company-${c.slug}-hero`} className="full-bg" />
        <div className="full-content">
          <h1 className="hero-title">{c.name_he}</h1>
          <p className="hero-sub">{c.tagline_he}</p>
        </div>
      </section>

      <div className="container" style={{ paddingBottom: 90 }}>
        {/* stats */}
        {c.stats?.length > 0 && (
          <Reveal className="stat-bar">
            {c.stats.map((s) => (
              <div className="stat-cell" key={s.label_he}>
                <div className="stat-val">{s.value}</div>
                <div className="stat-label">{s.label_he}</div>
                {s.sub_he && <div className="stat-sub">{s.sub_he}</div>}
              </div>
            ))}
          </Reveal>
        )}

        <div style={{ display: 'grid', gridTemplateColumns: 'minmax(0, 1.6fr) minmax(280px, 1fr)', gap: 40 }} className="co-layout">
          <div>
            <Reveal>
              {(c.description_he || '').split('\n\n').map((p, i) => (
                <p key={i} className="lead" style={{ marginBottom: 16 }}>
                  {p}
                </p>
              ))}
            </Reveal>

            {/* vehicles of this company, real silhouettes */}
            {vehicles.length > 0 && (
              <Reveal>
                <h2 className="sec-label section-gap" style={{ display: 'block' }}>הצי</h2>
                <div className="fleet-grid">
                  {vehicles.map((v) => (
                    <Link key={v.slug} to={`/vehicles/${v.slug}`} className="fleet-card">
                      <Silhouette vehicle={v} h={110} />
                      <div className="fleet-name">{v.name_he}</div>
                      <div className="fleet-h">{v.dims.height_m} m</div>
                    </Link>
                  ))}
                </div>
              </Reveal>
            )}

            {/* programs with imagery */}
            {c.programs?.length > 0 && (
              <Reveal>
                <h2 className="sec-label section-gap" style={{ display: 'block' }}>התוכניות</h2>
                <div className="program-grid" style={{ marginTop: 16 }}>
                  {c.programs.map((p) => {
                    const img = getImage(`program-${slugifyName(p.name)}`) || imageForText(`${p.name} ${p.desc_he || ''}`)
                    return (
                      <div className="program" key={p.name}>
                        {img ? (
                          <div className="program-img">
                            <img src={img.url} alt="" loading="lazy" />
                          </div>
                        ) : (
                          <div className="program-ph">{p.name.slice(0, 2)}</div>
                        )}
                        <div className="program-body">
                          <div className="program-name">{p.name}</div>
                          {p.status_he && (
                            <span className="chip" style={{ marginTop: 8 }}>
                              {p.status_he}
                            </span>
                          )}
                          <div className="program-desc">{p.desc_he}</div>
                        </div>
                      </div>
                    )
                  })}
                </div>
              </Reveal>
            )}

            {/* timeline */}
            {c.timeline?.length > 0 && (
              <>
                <Reveal>
                  <h2 className="h-display section-gap" style={{ fontSize: 30, margin: 0 }}>
                    ציר הפיתוחים
                  </h2>
                </Reveal>
                <div className="timeline" style={{ '--tl-color': c.color }}>
                  {c.timeline.map((t, i) => {
                    const heroUrl = getImage(`company-${c.slug}-hero`)?.url
                    let thumb = imageForText(`${t.title_he} ${t.tag_he || ''} ${t.text_he}`)
                    if (thumb && thumb.url === heroUrl) thumb = null
                    return (
                      <Reveal key={i} className={`tl-item ${thumb ? 'has-thumb' : ''}`} delay={Math.min(i * 40, 200)}>
                        <div>
                          <div className="tl-date">
                            {t.date}
                            {t.tag_he && <span className="chip tl-tag">{t.tag_he}</span>}
                          </div>
                          <div className="tl-title">{t.title_he}</div>
                          <div className="tl-text">{t.text_he}</div>
                        </div>
                        {thumb && (
                          <div className="tl-thumb">
                            <img src={thumb.url} alt="" loading="lazy" />
                          </div>
                        )}
                      </Reveal>
                    )
                  })}
                </div>
              </>
            )}
          </div>

          {/* side rail: live launches + news for this company */}
          <div style={{ display: 'grid', gap: 18, alignContent: 'start' }}>
            <Reveal className="panel">
              <div className="panel-title">שיגורים קרובים</div>
              {data.loading ? <div className="loading">LOADING…</div> : <LaunchList launches={companyLaunches.slice(0, 5)} />}
            </Reveal>
            <Reveal className="panel" delay={80}>
              <div className="panel-title">חדשות</div>
              {news.loading ? <div className="loading">LOADING…</div> : <NewsList articles={news.articles.slice(0, 6)} />}
            </Reveal>
          </div>
        </div>
      </div>

      <style>{`@media (max-width: 900px) { .co-layout { grid-template-columns: 1fr !important; } }`}</style>
    </>
  )
}
