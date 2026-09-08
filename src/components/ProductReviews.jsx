import { useEffect, useMemo, useState } from 'react'
import { supabase } from '../supabaseClient'

const stars = (rating) => '★'.repeat(rating) + '☆'.repeat(5 - rating)

export default function ProductReviews({ productId }) {
  const [reviews, setReviews] = useState([])
  const [canReview, setCanReview] = useState(false)
  const [form, setForm] = useState({ rating: 5, title: '', comment: '' })
  const [notice, setNotice] = useState('')

  useEffect(() => {
    let active = true
    Promise.all([
      supabase.from('reviews').select('*').eq('product_id', productId).eq('status', 'approved').order('created_at', { ascending: false }),
      supabase.auth.getUser(),
    ]).then(async ([reviewResult, userResult]) => {
      if (!active) return
      if (reviewResult.error) setNotice(reviewResult.error.message)
      setReviews(reviewResult.data || [])
      const user = userResult.data.user
      if (user) {
        const { data: orders } = await supabase.from('orders').select('items').eq('user_id', user.id)
        setCanReview((orders || []).some((order) => (order.items || []).some((item) => String(item.id || item.product_id) === String(productId))))
      }
    })
    return () => { active = false }
  }, [productId])

  const average = useMemo(() => reviews.length ? reviews.reduce((total, review) => total + review.rating, 0) / reviews.length : 0, [reviews])
  const update = (field) => (event) => setForm((current) => ({ ...current, [field]: field === 'rating' ? Number(event.target.value) : event.target.value }))
  const submit = async (event) => {
    event.preventDefault()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) {
      setNotice('Please sign in with a completed purchase to write a review.')
      return
    }
    const { data, error } = await supabase.from('reviews').insert({ product_id: productId, user_id: user.id, ...form }).select().single()
    if (error) {
      setNotice(error.message)
      return
    }
    setReviews((current) => [data, ...current])
    setForm({ rating: 5, title: '', comment: '' })
    setNotice('Thank you. Your review is awaiting Maison approval.')
  }

  return <section className="mt-14 border-t border-neutral-800 pt-10"><div className="flex flex-wrap items-end justify-between gap-4"><div><p className="text-[10px] uppercase tracking-widest text-amber-400">Client impressions</p><h2 className="mt-2 font-serif text-2xl uppercase tracking-widest">Verified Reviews</h2></div><div className="text-right"><p className="text-lg tracking-widest text-amber-400">{stars(Math.round(average))}</p><p className="text-xs text-neutral-500">{reviews.length} approved review{reviews.length === 1 ? '' : 's'}</p></div></div><div className="mt-8 space-y-5">{reviews.map((review) => <article key={review.id} className="border border-neutral-800 p-5"><p className="text-sm tracking-widest text-amber-400">{stars(review.rating)}</p><h3 className="mt-3 font-serif">{review.title}</h3><p className="mt-2 text-sm leading-6 text-neutral-400">{review.comment}</p></article>)}{!reviews.length && <p className="text-sm text-neutral-500">No approved reviews yet.</p>}</div>{canReview && <form onSubmit={submit} className="mt-8 border border-neutral-800 p-5"><h3 className="font-serif text-lg uppercase tracking-widest">Write a Review</h3><div className="mt-4 grid gap-4 sm:grid-cols-2"><label className="text-[10px] uppercase tracking-widest text-neutral-400">Rating<select value={form.rating} onChange={update('rating')} className="mt-2 w-full border border-neutral-800 bg-neutral-900 px-3 py-3 text-sm">{[5, 4, 3, 2, 1].map((value) => <option key={value} value={value}>{value} stars</option>)}</select></label><label className="text-[10px] uppercase tracking-widest text-neutral-400">Title<input required value={form.title} onChange={update('title')} className="mt-2 w-full border border-neutral-800 bg-neutral-900 px-3 py-3 text-sm" /></label></div><textarea required value={form.comment} onChange={update('comment')} placeholder="Share your experience" className="mt-4 h-24 w-full border border-neutral-800 bg-neutral-900 px-3 py-3 text-sm" /><button type="submit" className="mt-4 bg-amber-500 px-5 py-3 text-[10px] font-semibold uppercase tracking-widest text-black">Submit Review</button></form>}{notice && <p className="mt-4 text-xs text-amber-300">{notice}</p>}</section>
}
