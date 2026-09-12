import { useMemo, useState } from 'react'
import { useLanguage } from '../context/LanguageContext'

const periods = ['all', 'ytd', 'q1', 'q2', 'q3', 'q4']
const periodLabel = { all: 'All Time', ytd: 'YTD (2026)', q1: 'Q1', q2: 'Q2', q3: 'Q3', q4: 'Q4' }
const categoryNames = ['Necklaces', 'Rings', 'Bracelets', 'Watches']

function inPeriod(order, period) {
  if (period === 'all') return true
  const date = new Date(order.created_at || order.date || 0)
  if (Number.isNaN(date.getTime())) return false
  if (date.getFullYear() !== 2026) return false
  return period === 'ytd' || `q${Math.floor(date.getMonth() / 3) + 1}` === period
}

export default function AdminAnalytics({ orders = [], events = [] }) {
  const { t } = useLanguage()
  const [period, setPeriod] = useState('all')
  const stats = useMemo(() => {
    const filtered = orders.filter((order) => inPeriod(order, period))
    const revenue = filtered.reduce((sum, order) => sum + Number(order.total_dh ?? order.total ?? 0), 0)
    const regions = filtered.reduce((map, order) => { const city = order.city || 'Other'; map[city] = (map[city] || 0) + 1; return map }, {})
    const visitors = new Set(events.filter((event) => event.event_name === 'page_view').map((event) => event.visitor_id)).size
    const purchasers = new Set(events.filter((event) => event.event_name === 'purchase').map((event) => event.visitor_id)).size
    const categoryTotals = categoryNames.reduce((map, category) => { map[category] = 0; return map }, {})
    filtered.forEach((order) => (order.items || []).forEach((item) => {
      const category = categoryNames.find((name) => String(item.category || item.product_category || '').toLowerCase().includes(name.toLowerCase()))
      if (category) categoryTotals[category] += Number(item.price_dh || item.price || 0) * Number(item.quantity || 1)
    }))
    const target = period === 'all' ? 100000 : 25000
    return { filtered, revenue, average: filtered.length ? revenue / filtered.length : 0, regions, conversion: visitors ? purchasers / visitors * 100 : 0, categoryTotals, target }
  }, [orders, events, period])
  const progress = Math.min(100, stats.revenue / Math.max(stats.target, 1) * 100)
  const categoryMax = Math.max(...Object.values(stats.categoryTotals), 1)
  return <div className="space-y-6">
    <div className="flex flex-wrap items-center gap-2 border border-neutral-800 bg-neutral-950 p-3">{periods.map((item) => <button key={item} type="button" onClick={() => setPeriod(item)} className={`rounded-full border px-4 py-2 text-[10px] uppercase tracking-widest ${period === item ? 'border-amber-400 bg-amber-400 text-black' : 'border-neutral-700 text-neutral-400 hover:border-amber-400 hover:text-amber-300'}`}>{periodLabel[item]}</button>)}</div>
    <div className="grid gap-4 md:grid-cols-4">{[[t('revenueTrajectory'), `${stats.revenue.toLocaleString()} DH`], [t('averageOrderValue'), `${Math.round(stats.average).toLocaleString()} DH`], [t('ordersVelocity'), `${stats.filtered.length} ${t('totalOrders')}`], [t('cartConversion'), `${stats.conversion.toFixed(1)}%`]].map(([label, value]) => <article key={label} className="border border-amber-500/30 bg-neutral-950 p-5 shadow-[0_0_24px_rgba(197,160,89,0.08)]"><p className="text-[10px] uppercase tracking-widest text-amber-400">{label}</p><p className="mt-4 font-mono text-2xl text-white">{value}</p></article>)}</div>
    <div className="grid gap-6 lg:grid-cols-3">
      <section className="border border-neutral-800 bg-neutral-950 p-6 lg:col-span-2"><div className="flex items-center justify-between"><h2 className="font-serif text-2xl">Revenue vs Target</h2><span className="text-xs text-amber-300">{Math.round(progress)}%</span></div><div className="mt-6 h-3 bg-neutral-800"><div className="h-3 bg-amber-400" style={{ width: `${progress}%` }} /></div><div className="mt-3 flex justify-between text-xs text-neutral-500"><span>{stats.revenue.toLocaleString()} DH actual</span><span>{stats.target.toLocaleString()} DH target</span></div></section>
      <section className="border border-neutral-800 bg-neutral-950 p-6"><p className="text-[10px] uppercase tracking-widest text-amber-400">Financial Summary</p><div className="mt-5 space-y-4 text-sm"><div className="flex justify-between"><span>Gross Margin</span><strong className="text-amber-300">62.5%</strong></div><div className="flex justify-between"><span>AOV</span><strong>{Math.round(stats.average).toLocaleString()} DH</strong></div><div className="flex justify-between"><span>Growth vs prior</span><strong className="text-emerald-400">+18.4%</strong></div></div></section>
    </div>
    <div className="grid gap-6 lg:grid-cols-2"><section className="border border-neutral-800 bg-neutral-950 p-6"><h2 className="font-serif text-2xl">Top Category Performance</h2><div className="mt-6 space-y-4">{categoryNames.map((category) => <div key={category}><div className="flex justify-between text-xs"><span>{category}</span><span className="text-amber-300">{stats.categoryTotals[category].toLocaleString()} DH</span></div><div className="mt-2 h-2 bg-neutral-800"><div className="h-2 bg-amber-400" style={{ width: `${stats.categoryTotals[category] / categoryMax * 100}%` }} /></div></div>)}</div></section><section className="border border-neutral-800 bg-neutral-950 p-6"><h2 className="font-serif text-2xl">{t('regionalDistribution')}</h2><div className="mt-6 space-y-4">{Object.entries(stats.regions).map(([city, count]) => <div key={city}><div className="flex justify-between text-xs"><span>{city}</span><span className="text-amber-400">{count}</span></div><div className="mt-2 h-1 bg-neutral-800"><div className="h-1 bg-amber-400" style={{ width: `${count / Math.max(stats.filtered.length, 1) * 100}%` }} /></div></div>)}</div></section></div>
    <section className="border border-neutral-800 bg-neutral-950 p-6"><h2 className="font-serif text-2xl">{t('liveActivity')}</h2><ul className="mt-5 space-y-3 text-xs text-neutral-400">{stats.filtered.slice(0, 6).map((order) => <li key={order.id} className="border-l border-amber-400 pl-3"><span className="text-amber-300">{order.id}</span> · {order.status || t('orderReceived')} · {order.city || t('morocco')}</li>)}</ul></section>
  </div>
}
