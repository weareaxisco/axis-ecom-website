import { createContext, useContext, useEffect, useMemo, useState } from 'react'
import { supabase } from '../supabaseClient'

const AuthContext = createContext(null)

export function AuthProvider({ children }) {
  const [session, setSession] = useState(null)
  const [user, setUser] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    let active = true
    const load = async (nextSession) => {
      const nextUser = nextSession?.user ? { ...nextSession.user, role: 'customer' } : null
      if (nextUser) {
        const { data, error } = await supabase.from('profiles').select('role, permissions').eq('id', nextUser.id).maybeSingle()
        if (error && !error.message.includes('column')) console.warn(`Profile role lookup unavailable: ${error.message}`)
        nextUser.role = data?.role || nextUser.app_metadata?.role || 'customer'
        nextUser.permissions = data?.permissions || {}
      }
      if (active) {
        setSession(nextSession)
        setUser(nextUser)
        setLoading(false)
      }
    }
    supabase.auth.getSession().then(({ data }) => load(data.session))
    const { data: listener } = supabase.auth.onAuthStateChange((_event, nextSession) => { load(nextSession) })
    return () => { active = false; listener.subscription.unsubscribe() }
  }, [])

  const value = useMemo(() => ({ session, user, loading }), [session, user, loading])
  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (!context) throw new Error('useAuth must be used within AuthProvider')
  return context
}
