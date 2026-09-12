import { useRef, useState } from 'react'
import { X, ZoomIn } from 'lucide-react'

const fallback = 'https://images.unsplash.com/photo-1515562141207-7a88fb7ce338?auto=format&fit=crop&q=80&w=1200'

export default function ImageGalleryZoom({ images, name }) {
  const gallery = images.length ? images : [fallback]
  const [active, setActive] = useState(0)
  const [zoom, setZoom] = useState(false)
  const [lightbox, setLightbox] = useState(false)
  const [position, setPosition] = useState({ x: 50, y: 50 })
  const touchStartX = useRef(null)
  const image = gallery[active]
  return <div className="flex flex-col-reverse gap-4 md:flex-row">
    <div className="flex gap-3 overflow-x-auto md:w-20 md:flex-col">
      {gallery.map((src, index) => <button type="button" key={`${src}-${index}`} onClick={() => setActive(index)} className={`h-20 w-16 flex-shrink-0 overflow-hidden border-2 ${index === active ? 'border-amber-400' : 'border-transparent opacity-60'}`}><img src={src} alt={`${name} view ${index + 1}`} className="h-full w-full object-cover" /></button>)}
    </div>
    <div className="relative aspect-[4/5] min-w-0 flex-1 cursor-zoom-in overflow-hidden bg-[var(--surface-primary)]" onTouchStart={(event) => { touchStartX.current = event.touches[0].clientX }} onTouchEnd={(event) => { if (touchStartX.current === null) return; const distance = event.changedTouches[0].clientX - touchStartX.current; if (Math.abs(distance) > 35) setActive((current) => (current + (distance < 0 ? 1 : -1) + gallery.length) % gallery.length); touchStartX.current = null }} onMouseEnter={() => setZoom(true)} onMouseLeave={() => setZoom(false)} onMouseMove={(event) => { const rect = event.currentTarget.getBoundingClientRect(); setPosition({ x: ((event.clientX - rect.left) / rect.width) * 100, y: ((event.clientY - rect.top) / rect.height) * 100 }) }} onClick={() => setLightbox(true)}>
      <img src={image} alt={name} onError={(event) => { event.currentTarget.src = fallback }} className="h-full w-full object-cover transition-transform duration-200" style={zoom ? { transform: 'scale(2)', transformOrigin: `${position.x}% ${position.y}%` } : undefined} />
      <span className="absolute bottom-4 right-4 flex items-center gap-2 bg-black/60 px-3 py-2 text-[10px] uppercase tracking-widest text-white"><ZoomIn size={14} /> Hover to zoom</span>
    </div>
    {lightbox && <div className="fixed inset-0 z-[70] flex items-center justify-center bg-black/95 p-6" role="dialog" aria-label="Product image lightbox" onClick={() => setLightbox(false)}><button type="button" aria-label="Close image viewer" onClick={() => setLightbox(false)} className="absolute right-6 top-6 text-white"><X /></button><img src={image} alt={name} className="max-h-[90vh] max-w-full object-contain" onClick={(event) => event.stopPropagation()} /></div>}
  </div>
}
