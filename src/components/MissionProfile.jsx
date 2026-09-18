// EA-style mission profile: ascent arc with staging events, and the booster's
// return path (tower catch / droneship / parachute) when the vehicle reuses it.

const BLUE = '#6ea8ff'
const EMBER = '#ff9a5c'
const DIM = '#93a3c4'
const FAINT = '#7f90b6'

const PROFILES = {
  starship: {
    recovery: 'catch',
    booster_he: 'הבוסטר חוזר ונתפס בזרועות המגדל',
    upper_he: 'ה-Ship ממשיך למסלול, ובעתיד יחזור וינחת גם הוא',
    events: [
      ['שיגור', 0.02], ['MECO והפרדה חמה', 0.34], ['הצתת ה-Ship', 0.38], ['הגעה למסלול', 0.94],
    ],
  },
  'falcon-9': {
    recovery: 'droneship',
    booster_he: 'הבוסטר נוחת על אסדה בלב הים (או ביבשה)',
    upper_he: 'השלב השני ממשיך למסלול עם המטען',
    events: [
      ['שיגור', 0.02], ['MECO והפרדה', 0.32], ['הצתת שלב שני', 0.36], ['הפרדת חרטום', 0.46], ['הגעה למסלול', 0.94],
    ],
  },
  'new-glenn': {
    recovery: 'droneship',
    booster_he: 'הבוסטר נוחת על הספינה Jacklyn',
    upper_he: 'השלב השני (BE-3U כפול) ממשיך למסלול',
    events: [
      ['שיגור', 0.02], ['הפרדת שלבים', 0.34], ['הפרדת חרטום', 0.45], ['הגעה למסלול', 0.94],
    ],
  },
  neutron: {
    recovery: 'rtls',
    booster_he: 'הבוסטר, כולל החרטום שנשאר מחובר, חוזר לנחיתה',
    upper_he: 'השלב השני "התלוי" משתחרר מהבטן וממשיך למסלול',
    events: [
      ['שיגור', 0.02], ['פתיחת ה-Hungry Hippo', 0.3], ['שחרור שלב שני', 0.34], ['הגעה למסלול', 0.94],
    ],
  },
  electron: {
    recovery: 'splash',
    booster_he: 'הבוסטר צונח במצנח ונאסף מהים',
    upper_he: 'השלב השני ושלב ה-Kick ממשיכים למסלול',
    events: [
      ['שיגור', 0.02], ['הפרדת שלבים', 0.33], ['הפרדת חרטום', 0.42], ['שלב Kick למסלול מדויק', 0.9],
    ],
  },
}

const EXPENDABLE = {
  recovery: 'none',
  booster_he: 'השלבים התחתונים נופלים לים אחרי שסיימו',
  upper_he: 'השלב העליון ממשיך למסלול',
  events: [['שיגור', 0.02], ['הפרדת שלבים', 0.33], ['הגעה למסלול', 0.94]],
}

// ascent arc: x 30..300, y 200..40
const ax = (t) => 30 + t * 270
const ay = (t) => 200 - Math.pow(t, 0.62) * 155

export default function MissionProfile({ vehicle }) {
  const p = PROFILES[vehicle.slug] || { ...EXPENDABLE }
  const sepT = 0.34

  // booster return path from separation point
  const sx = ax(sepT)
  const sy = ay(sepT)

  return (
    <svg viewBox="0 0 460 240" className="cycle-svg" role="img" aria-label={`פרופיל טיסה של ${vehicle.name_he}`}>
      <defs>
        <marker id="mp-arr" viewBox="0 0 8 8" refX="6.5" refY="4" markerWidth="6" markerHeight="6" orient="auto-start-reverse">
          <path d="M 0 0 L 8 4 L 0 8 z" fill={BLUE} />
        </marker>
        <marker id="mp-arr-e" viewBox="0 0 8 8" refX="6.5" refY="4" markerWidth="6" markerHeight="6" orient="auto-start-reverse">
          <path d="M 0 0 L 8 4 L 0 8 z" fill={EMBER} />
        </marker>
      </defs>

      {/* ground + karman-ish line */}
      <line x1="12" y1="206" x2="448" y2="206" stroke="rgba(148,175,230,0.4)" strokeWidth="1.5" />
      <line x1="12" y1="58" x2="448" y2="58" stroke="rgba(148,175,230,0.18)" strokeDasharray="5 5" strokeWidth="1" />
      <text x="446" y="52" textAnchor="end" fontSize="8.5" fill={FAINT} fontFamily="Heebo">גבול החלל, 100 ק"מ</text>

      {/* ascent arc */}
      <path
        d={`M ${ax(0)} ${ay(0)} ${Array.from({ length: 24 }, (_, i) => `L ${ax((i + 1) / 24)} ${ay((i + 1) / 24)}`).join(' ')}`}
        fill="none"
        stroke={BLUE}
        strokeWidth="2.4"
        markerEnd="url(#mp-arr)"
        strokeLinecap="round"
      />

      {/* orbit hint */}
      <path d="M 300 43 q 60 -14 118 -4" fill="none" stroke={BLUE} strokeWidth="1.6" strokeDasharray="2 4" opacity="0.7" />

      {/* booster return */}
      {p.recovery !== 'none' && (
        <path
          d={
            p.recovery === 'catch' || p.recovery === 'rtls'
              ? `M ${sx} ${sy} C ${sx + 34} ${sy - 26}, ${sx + 40} ${sy + 40}, ${sx - 26} 196`
              : p.recovery === 'droneship'
                ? `M ${sx} ${sy} C ${sx + 40} ${sy - 20}, ${sx + 74} ${sy + 60}, ${sx + 92} 196`
                : `M ${sx} ${sy} C ${sx + 26} ${sy + 6}, ${sx + 50} ${sy + 70}, ${sx + 66} 196`
          }
          fill="none"
          stroke={EMBER}
          strokeWidth="2"
          strokeDasharray="6 4"
          markerEnd="url(#mp-arr-e)"
          strokeLinecap="round"
        />
      )}

      {/* recovery site glyph */}
      {(p.recovery === 'catch' || p.recovery === 'rtls') && (
        <g stroke={EMBER} strokeWidth="1.6" fill="none">
          <line x1={sx - 32} y1="206" x2={sx - 32} y2="188" />
          <line x1={sx - 32} y1="191" x2={sx - 23} y2="194" />
          <text x={sx - 38} y="218" fontSize="8.5" fill={DIM} fontFamily="Heebo" stroke="none" textAnchor="middle">
            {p.recovery === 'catch' ? 'המגדל' : 'אתר השיגור'}
          </text>
        </g>
      )}
      {p.recovery === 'droneship' && (
        <g>
          <path d={`M ${sx + 78} 202 L ${sx + 108} 202 L ${sx + 103} 208 L ${sx + 83} 208 Z`} fill="rgba(255,154,92,0.2)" stroke={EMBER} strokeWidth="1.4" />
          <text x={sx + 93} y="220" fontSize="8.5" fill={DIM} fontFamily="Heebo" textAnchor="middle">אסדת נחיתה</text>
        </g>
      )}
      {p.recovery === 'splash' && (
        <g>
          <path d={`M ${sx + 56} 203 q 5 -4 10 0 q 5 4 10 0`} fill="none" stroke={EMBER} strokeWidth="1.4" />
          <text x={sx + 66} y="220" fontSize="8.5" fill={DIM} fontFamily="Heebo" textAnchor="middle">איסוף מהים</text>
        </g>
      )}

      {/* events on the ascent */}
      {p.events.map(([label, t], i) => {
        const x = ax(t)
        const yy = ay(t)
        const up = i % 2 === 0
        return (
          <g key={label}>
            <circle cx={x} cy={yy} r="3.2" fill="#0b101d" stroke={BLUE} strokeWidth="1.6" />
            <line x1={x} y1={yy + (up ? -6 : 6)} x2={x} y2={yy + (up ? -16 : 16)} stroke="rgba(148,175,230,0.4)" strokeWidth="1" />
            <text x={x} y={yy + (up ? -21 : 27)} textAnchor="middle" fontSize="9" fill={DIM} fontFamily="Heebo">
              {label}
            </text>
          </g>
        )
      })}

      {/* legend */}
      <g fontFamily="Heebo" fontSize="9">
        <line x1="16" y1="230" x2="34" y2="230" stroke={BLUE} strokeWidth="2.4" />
        <text x="40" y="233" fill={DIM}>{p.upper_he}</text>
        {p.recovery !== 'none' && (
          <>
            <line x1="238" y1="230" x2="256" y2="230" stroke={EMBER} strokeWidth="2" strokeDasharray="6 4" />
            <text x="262" y="233" fill={DIM}>{p.booster_he}</text>
          </>
        )}
        {p.recovery === 'none' && <text x="238" y="233" fill={FAINT}>{p.booster_he}</text>}
      </g>
    </svg>
  )
}
