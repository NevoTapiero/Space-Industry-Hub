// Auth (Supabase magic link) + watched-videos tracking.
// Without Supabase env vars the auth UI hides itself and watched state
// falls back to this browser's localStorage.

import { createContext, useContext, useEffect, useState, useCallback } from 'react'
import { supabase } from './db.js'

const AuthCtx = createContext({ user: null, watched: new Set() })

const LS_KEY = 'sih.watched'

function readLocal() {
  try {
    return new Set(JSON.parse(localStorage.getItem(LS_KEY) || '[]'))
  } catch {
    return new Set()
  }
}

function writeLocal(set) {
  try {
    localStorage.setItem(LS_KEY, JSON.stringify([...set]))
  } catch {
    /* private mode */
  }
}

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null)
  const [watched, setWatched] = useState(readLocal)

  useEffect(() => {
    if (!supabase) return
    supabase.auth.getSession().then(({ data }) => setUser(data.session?.user || null))
    const { data: sub } = supabase.auth.onAuthStateChange((_e, session) => setUser(session?.user || null))
    return () => sub.subscription.unsubscribe()
  }, [])

  // when signed in, load watched rows from the cloud (they win over local)
  useEffect(() => {
    if (!supabase || !user) return
    supabase
      .from('watched_videos')
      .select('video_id')
      .then(({ data, error }) => {
        if (!error && data) setWatched(new Set(data.map((r) => r.video_id)))
      })
  }, [user])

  const toggleWatched = useCallback(
    (videoId) => {
      setWatched((prev) => {
        const next = new Set(prev)
        const on = !next.has(videoId)
        if (on) next.add(videoId)
        else next.delete(videoId)
        writeLocal(next)
        if (supabase && user) {
          if (on) supabase.from('watched_videos').upsert({ user_id: user.id, video_id: videoId }).then(() => {})
          else supabase.from('watched_videos').delete().eq('video_id', videoId).then(() => {})
        }
        return next
      })
    },
    [user],
  )

  const signIn = useCallback(async (email) => {
    if (!supabase) return { error: 'Supabase לא מוגדר' }
    const { error } = await supabase.auth.signInWithOtp({
      email,
      options: { emailRedirectTo: window.location.origin },
    })
    return { error: error?.message || null }
  }, [])

  const signOut = useCallback(() => supabase?.auth.signOut(), [])

  return (
    <AuthCtx.Provider value={{ user, watched, toggleWatched, signIn, signOut, enabled: !!supabase }}>
      {children}
    </AuthCtx.Provider>
  )
}

export const useAuth = () => useContext(AuthCtx)
