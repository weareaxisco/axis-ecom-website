import { useEffect } from 'react'
import { useLocation, useNavigate } from 'react-router-dom'
import { adminRoles } from '../utils/adminAccess'
import { useAuth } from '../context/AuthContext'
import BrandLogo from './common/BrandLogo'

export default function AdminGuard({ children }) {
  const { user, loading } = useAuth()
  const navigate = useNavigate()
  const location = useLocation()

  useEffect(() => {
    if (loading) return
    if (!user) {
      navigate('/login', { replace: true, state: { from: location.pathname } })
      return
    }
    if (!adminRoles.includes(user.role)) {
      navigate('/', { replace: true, state: { adminAccessDenied: true } })
    }
  }, [loading, user, navigate, location.pathname])

  if (loading || !user || !adminRoles.includes(user.role)) {
    return <main className="flex min-h-screen flex-col items-center justify-center gap-5 bg-neutral-950 text-center text-sm text-amber-400"><BrandLogo className="h-12 w-auto max-w-[220px] object-contain" textClassName="font-serif text-xl uppercase tracking-[0.25em] text-amber-200" /><span>Checking access…</span></main>
  }

  return children
}
