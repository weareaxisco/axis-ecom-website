import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { supabase } from '../supabaseClient'
import AccountAddresses from '../components/AccountAddresses'
import OrderTracker from '../components/OrderTracker'
import { Link } from 'react-router-dom'
import { useCart } from '../context/CartContext'
import { useWishlist } from '../context/WishlistContext'
import { useLanguage } from '../context/LanguageContext'
import AccountPrivacy from '../components/AccountPrivacy'
import SiteFeedbackModal from '../components/SiteFeedbackModal'

export default function Account() {
  const navigate = useNavigate()
  const [session, setSession] = useState(null)
  const [loading, setLoading] = useState(true)
  const { t } = useLanguage()
  const [tab, setTab] = useState(() => t('myOrders'))
  const [feedbackOpen, setFeedbackOpen] = useState(false)
  const { addToCart } = useCart()
  const { wishlistItems, removeFromWishlist } = useWishlist()
  const tabs = [t('myOrders'), t('savedAddresses'), t('wishlistTitle'), t('privacySecurity'), 'Avis & Experience Client']
  const handleTabClick = (event, item) => {
    event.currentTarget.scrollIntoView({ behavior: 'smooth', block: 'nearest', inline: 'center' })
    if (item === 'Avis & Experience Client') {
      setFeedbackOpen(true)
      return
    }
    setTab(item)
  }

  useEffect(() => {
    supabase.auth.getSession().then(({ data }) => {
      if (!data.session) navigate('/login', { replace: true })
      else setSession(data.session)
      setLoading(false)
    })
  }, [navigate])

  if (loading) return <main className="min-h-screen bg-[var(--bg-primary)] px-6 pt-40 text-center text-sm text-neutral-500">{t('loadingAccount')}</main>
  if (!session) return null

  return <main className="min-h-screen bg-[var(--bg-primary)] px-4 pb-20 pt-36 text-[var(--text-primary)] md:px-10"><div className="mx-auto max-w-6xl px-6 py-12"><header><p className="text-[10px] uppercase tracking-[0.25em] text-amber-400">{t('maison')}</p><h1 className="mt-3 font-serif text-4xl uppercase tracking-widest">{t('myAccount')}</h1><p className="mt-3 text-sm text-neutral-500">{session.user.email}</p></header><nav className="mt-10 flex space-x-2 overflow-x-auto border-b border-neutral-800 pb-2 no-scrollbar">{tabs.map((item) => <button key={item} type="button" onClick={(event) => handleTabClick(event, item)} className={`shrink-0 border-b-2 px-4 py-4 text-[10px] uppercase tracking-widest transition-colors ${tab === item || (item === 'Avis & Experience Client' && feedbackOpen) ? 'border-amber-400 bg-neutral-900/60 text-amber-400' : 'border-transparent text-neutral-500 hover:text-white'}`}>{item}</button>)}</nav><section className="mt-8">{tab === t('myOrders') && <OrderTracker userId={session.user.id} />}{tab === t('savedAddresses') && <AccountAddresses userId={session.user.id} />}{tab === t('wishlistTitle') && <div className="grid gap-4 sm:grid-cols-2">{wishlistItems.length ? wishlistItems.map((item) => <article key={item.id} className="flex gap-4 border border-neutral-800 p-4"><Link to={`/product/${item.id}`} className="shrink-0"><img src={item.main_image_url || item.image || item.images?.[0]} alt={item.name} className="h-28 w-24 object-cover" /></Link><div><Link to={`/product/${item.id}`} className="font-serif hover:text-amber-300">{item.name}</Link><p className="mt-2 text-sm text-amber-400">{Number(item.price ?? item.price_dh ?? 0).toLocaleString()} DH</p><div className="mt-4 flex flex-wrap gap-3 text-[10px] uppercase tracking-widest"><button type="button" onClick={() => addToCart({ ...item, price: Number(item.price ?? item.price_dh ?? 0) })} className="text-amber-300">{t('addToBagShort')}</button><button type="button" onClick={() => removeFromWishlist(item.id)} className="text-neutral-500">{t('remove')}</button></div></div></article>) : <p className="border border-neutral-800 p-10 text-center text-sm text-neutral-500">{t('wishlistEmpty')}</p>}</div>  }{tab === t('privacySecurity') && <AccountPrivacy userId={session.user.id} wishlistItems={wishlistItems} />}  </section></div>{feedbackOpen && <SiteFeedbackModal onClose={() => setFeedbackOpen(false)} />}</main>
}
