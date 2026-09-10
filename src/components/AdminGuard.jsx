import { useEffect } from 'react'
import { useLocation, useNavigate } from 'react-router-dom'
import { adminRoles } from '../utils/adminAccess'
import { useAuth } from '../context/AuthContext'

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
    return <main className="flex min-h-screen items-center justify-center bg-neutral-950 text-center text-sm text-amber-400">Checking access…</main>
  }

  return children
}
