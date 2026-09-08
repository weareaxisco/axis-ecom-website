import { useState } from 'react'
import { supabase } from '../supabaseClient'

export default function AccountPrivacy({ userId, wishlistItems }) {
  const [notice, setNotice] = useState('')
  const [showErase, setShowErase] = useState(false)
  const [submitting, setSubmitting] = useState(false)

  const exportData = async () => {
    setNotice('')
    const [profile, addresses, orders] = await Promise.all([
      supabase.from('profiles').select('*').eq('id', userId).maybeSingle(),
      supabase.from('addresses').select('*').eq('user_id', userId),
      supabase.from('orders').select('*').eq('user_id', userId).order('created_at', { ascending: false }),
    ])
    const failure = [profile, addresses, orders].find((result) => result.error)
    if (failure) {
      setNotice(failure.error.message)
      return
    }
    const archive = {
      exportedAt: new Date().toISOString(),
      legalBasis: 'Moroccan Law 09-08 / CNDP',
      profile: profile.data,
      addresses: addresses.data || [],
      orders: orders.data || [],
      wishlist: wishlistItems || [],
    }
    const link = document.createElement('a')
    link.href = URL.createObjectURL(new Blob([JSON.stringify(archive, null, 2)], { type: 'application/json' }))
    link.download = `maison-cndp-export-${userId}.json`
    link.click()
    URL.revokeObjectURL(link.href)
    setNotice('Your personal data archive is ready to download.')
  }

  const requestErasure = async () => {
    setSubmitting(true)
    const { error } = await supabase.from('cndp_requests').insert({ user_id: userId, request_type: 'erasure' })
    setSubmitting(false)
    if (error) {
      setNotice(error.message)
      return
    }
    setShowErase(false)
    setNotice('Your right-to-erasure request has been recorded for review.')
  }

  return <section className="border border-neutral-800 p-6"><h2 className="font-serif text-xl uppercase tracking-widest">CNDP Privacy & Security</h2><p className="mt-3 text-sm leading-6 text-neutral-400">Manage your personal data rights under Moroccan Law 09-08.</p><div className="mt-6 flex flex-wrap gap-3"><button type="button" onClick={exportData} className="border border-neutral-700 px-5 py-3 text-[10px] uppercase tracking-widest hover:border-amber-400">Export Personal Data</button><button type="button" onClick={() => setShowErase(true)} className="border border-rose-500/40 px-5 py-3 text-[10px] uppercase tracking-widest text-rose-300">Request Erasure</button></div>{notice && <p className="mt-5 text-xs text-amber-300">{notice}</p>}{showErase && <div className="mt-6 border border-rose-500/30 bg-rose-950/20 p-5"><h3 className="text-sm uppercase tracking-widest text-rose-200">Confirm data erasure request</h3><p className="mt-3 text-xs leading-5 text-neutral-300">This submits an official request for the Maison to review and erase your personal data where legally permitted.</p><div className="mt-5 flex gap-3"><button type="button" disabled={submitting} onClick={requestErasure} className="bg-rose-400 px-4 py-3 text-[10px] font-semibold uppercase tracking-widest text-black">{submitting ? 'Submitting...' : 'Confirm Request'}</button><button type="button" onClick={() => setShowErase(false)} className="border border-neutral-700 px-4 py-3 text-[10px] uppercase tracking-widest">Cancel</button></div></div>}</section>
}
