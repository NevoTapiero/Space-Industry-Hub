import { useEffect, useState } from 'react'

function parts(msLeft) {
  const total = Math.max(0, Math.floor(msLeft / 1000))
  return {
    days: Math.floor(total / 86400),
    hours: Math.floor((total % 86400) / 3600),
    minutes: Math.floor((total % 3600) / 60),
    seconds: total % 60,
  }
}

const pad = (n) => String(n).padStart(2, '0')

export default function Countdown({ target }) {
  const [now, setNow] = useState(Date.now())

  useEffect(() => {
    const t = setInterval(() => setNow(Date.now()), 1000)
    return () => clearInterval(t)
  }, [])

  const targetMs = new Date(target).getTime()
  const { days, hours, minutes, seconds } = parts(targetMs - now)

  const cells = [
    { num: pad(days), label: 'Days' },
    { num: pad(hours), label: 'Hours' },
    { num: pad(minutes), label: 'Minutes' },
    { num: pad(seconds), label: 'Seconds' },
  ]

  return (
    <div>
      <div className="t-minus">T-MINUS</div>
      <div className="countdown">
        {cells.map((c) => (
          <div className="cd-cell" key={c.label}>
            <div className="cd-num">{c.num}</div>
            <div className="cd-label">{c.label}</div>
          </div>
        ))}
      </div>
    </div>
  )
}
