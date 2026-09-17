import { useEffect, useState } from 'react'
import { fetchUpcomingLaunches, fetchNews } from './api.js'

export function useLaunches() {
  const [state, setState] = useState({ launches: [], stale: false, error: null, loading: true })
  useEffect(() => {
    let alive = true
    fetchUpcomingLaunches()
      .then(({ launches, stale }) => alive && setState({ launches, stale, error: null, loading: false }))
      .catch(() =>
        alive &&
        setState({
          launches: [],
          stale: false,
          loading: false,
          error: 'לא הצלחתי למשוך נתוני שיגורים. ייתכן שחרגנו ממכסת הבקשות של ה-API, נסה שוב בעוד כשעה.',
        }),
      )
    return () => {
      alive = false
    }
  }, [])
  return state
}

export function useNews(query = '', limit = 12) {
  const [state, setState] = useState({ articles: [], loading: true })
  useEffect(() => {
    let alive = true
    fetchNews(query, limit)
      .then(({ articles }) => alive && setState({ articles, loading: false }))
      .catch(() => alive && setState({ articles: [], loading: false }))
    return () => {
      alive = false
    }
  }, [query, limit])
  return state
}
