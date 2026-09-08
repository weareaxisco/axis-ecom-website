import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { supabase } from '../supabaseClient'
import AccountAddresses from '../components/AccountAddresses'
import OrderTracker from '../components/OrderTracker'

const tabs = ['My Orders', 'Saved Addresses', 'Wishlist', 'CNDP Privacy & Security']

export default function Account() {
  const navigate = useNavigate()
  const [session, setSession] = useState(null)
  const [tab, setTab] = useState('My Orders')
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    supabase.auth.getSession().then(({ data }) => {
      if (!data.session) navigate('/login', { replace: true })
      else setSession(data.session)
      setLoading(false)
    })
  }, [navigate])

  if (loading) return <main className="min-h-screen bg-[var(--bg-primary)] px-6 pt-40 text-center text-sm text-neutral-500">Loading your account...</main>
  if (!session) return null

  return <main className="min-h-screen bg-[var(--bg-primary)] px-4 pb-20 pt-36 text-[var(--text-primary)] md:px-10"><div className="mx-auto max-w-6xl"><header><p className="text-[10px] uppercase tracking-[0.25em] text-amber-400">The Maison</p><h1 className="mt-3 font-serif text-4xl uppercase tracking-widest">My Account</h1><p className="mt-3 text-sm text-neutral-500">{session.user.email}</p></header><nav className="mt-10 flex flex-wrap gap-2 border-b border-neutral-800">{tabs.map((item) => <button key={item} type="button" onClick={() => setTab(item)} className={`border-b-2 px-4 py-4 text-[10px] uppercase tracking-widest ${tab === item ? 'border-amber-400 text-amber-400' : 'border-transparent text-neutral-500'}`}>{item}</button>)}</nav><section className="mt-8">{tab === 'My Orders' && <OrderTracker userId={session.user.id} />}{tab === 'Saved Addresses' && <AccountAddresses userId={session.user.id} />}{tab === 'Wishlist' && <div className="border border-neutral-800 p-10 text-center text-sm text-neutral-500">Your curated wishlist will appear here.</div>}{tab === 'CNDP Privacy & Security' && <AccountAddresses userId={session.user.id} />}</section></div></main>
}
