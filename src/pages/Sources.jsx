import { useMemo, useState } from 'react'
import { SOURCES, NOTEBOOK } from '../data/index.js'
import { ARTICLES } from '../knowledge.js'
import { Backdrop, Reveal } from '../components/ui.jsx'

export default function Sources() {
  const videos = SOURCES.videos || []
  const [topic, setTopic] = useState(null)
  const [q, setQ] = useState('')

  const topics = useMemo(() => {
    const counts = {}
    for (const v of videos) for (const t of v.topics_he || []) counts[t] = (counts[t] || 0) + 1
    return Object.entries(counts)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 12)
      .map(([t]) => t)
  }, [videos])

  const filtered = useMemo(() => {
    let out = videos
    if (topic) out = out.filter((v) => v.topics_he?.includes(topic))
    const needle = q.trim().toLowerCase()
    if (needle)
      out = out.filter(
        (v) => v.title.toLowerCase().includes(needle) || v.summary_he?.toLowerCase().includes(needle) || v.topics_he?.some((t) => t.toLowerCase().includes(needle)),
      )
    return out
  }, [videos, topic, q])

  return (
    <>
      <section className="full short" style={{ minHeight: '46vh' }}>
        <Backdrop imageKey="sources_hero" className="full-bg" />
        <div className="full-content">
          <div className="eyebrow">Knowledge Base · Everyday Astronaut</div>
          <h1 className="hero-title" style={{ fontSize: 'clamp(30px, 4.6vw, 52px)' }}>
            ספריית המקורות
          </h1>
          <p className="hero-sub">
            הסרטונים הטכניים החשובים של Tim Dodd, ממופים לפי נושא וכלי שיגור, עם תקציר בעברית של מה לומדים מכל אחד.
          </p>
        </div>
      </section>

      <div className="container" style={{ paddingBlock: 40, paddingBottom: 90 }}>
        <input className="search-box" placeholder="חיפוש: Raptor, מחזורי מנועים, ריאיון…" value={q} onChange={(e) => setQ(e.target.value)} />

        {topics.length > 0 && (
          <div className="filter-row">
            <button className={`filter-btn ${topic === null ? 'on' : ''}`} onClick={() => setTopic(null)}>
              הכול ({videos.length})
            </button>
            {topics.map((t) => (
              <button key={t} className={`filter-btn ${topic === t ? 'on' : ''}`} onClick={() => setTopic(topic === t ? null : t)}>
                {t}
              </button>
            ))}
          </div>
        )}

        {videos.length === 0 && (
          <div className="panel" style={{ marginTop: 20 }}>
            <div className="loading">קטלוג המקורות בטעינה, יופיע כאן אחרי ריצת המחקר הראשונה.</div>
          </div>
        )}

        <div className="vid-grid" style={{ marginTop: 20 }}>
          {filtered.map((v, i) => (
            <Reveal key={v.video_id} delay={Math.min(i * 40, 200)}>
              <a className="vid-card" style={{ display: 'block' }} href={`https://www.youtube.com/watch?v=${v.video_id}`} target="_blank" rel="noreferrer">
                <div className="vid-thumb">
                  <img src={`https://img.youtube.com/vi/${v.video_id}/hqdefault.jpg`} alt="" loading="lazy" />
                  <div className="play">▶</div>
                </div>
                <div className="vid-body">
                  <div className="vid-title">{v.title}</div>
                  <div className="vid-summary">{v.summary_he}</div>
                  <div className="vid-tags">
                    <span className="chip">{v.year}</span>
                    {(v.topics_he || []).slice(0, 3).map((t) => (
                      <span className="chip" key={t}>
                        {t}
                      </span>
                    ))}
                  </div>
                </div>
              </a>
            </Reveal>
          ))}
        </div>

        {/* ---------- notebook monitoring directory ---------- */}
        {NOTEBOOK.sources.length > 0 && (
          <>
            <Reveal>
              <div className="eyebrow section-gap">מעקב שוטף · NotebookLM</div>
              <h2 className="h-display" style={{ fontSize: 28, margin: '10px 0 6px' }}>
                מקורות המעקב
              </h2>
              <p className="lead" style={{ marginBottom: 8 }}>
                {NOTEBOOK.sources.length} המקורות מהמחברת "{NOTEBOOK.notebook}": האתרים, הערוצים והניוזלטרים שמהם נבנית
                תמונת המצב של התעשייה.
              </p>
            </Reveal>
            {[...new Set(NOTEBOOK.sources.map((s) => s.category))].map((cat) => (
              <Reveal key={cat}>
                <div className="eyebrow" style={{ marginTop: 26, marginBottom: 10 }}>
                  {cat}
                </div>
                <div className="filter-row" style={{ margin: 0 }}>
                  {NOTEBOOK.sources
                    .filter((s) => s.category === cat)
                    .map((s) => (
                      <a key={s.url} className="filter-btn" href={s.url} target="_blank" rel="noreferrer" title={s.domain}>
                        {s.title} ↗
                      </a>
                    ))}
                </div>
              </Reveal>
            ))}
          </>
        )}

        {/* ---------- foundational articles ---------- */}
        <Reveal>
          <div className="eyebrow section-gap">יסודות · Foundations</div>
          <h2 className="h-display" style={{ fontSize: 28, margin: '10px 0 18px' }}>
            מאמרי יסוד
          </h2>
        </Reveal>
        <div style={{ display: 'grid', gap: 14 }}>
          {ARTICLES.map((a) => (
            <Article key={a.id} article={a} />
          ))}
        </div>
      </div>
    </>
  )
}

function Article({ article }) {
  const [open, setOpen] = useState(false)
  return (
    <div className="panel" style={{ cursor: 'pointer' }} onClick={() => setOpen(!open)}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 12 }}>
        <div style={{ fontWeight: 800, fontSize: 17 }}>{article.title}</div>
        <span className="chip">{open ? 'סגירה −' : 'קריאה +'}</span>
      </div>
      <div className="filter-row" style={{ margin: '10px 0 0' }}>
        {article.tags.map((t) => (
          <span className="chip" key={t}>
            {t}
          </span>
        ))}
      </div>
      {open && (
        <p className="lead" style={{ marginTop: 14, whiteSpace: 'pre-wrap', fontSize: 15 }}>
          {article.body}
        </p>
      )}
    </div>
  )
}
