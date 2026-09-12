import { useRef, useState } from 'react'
import { ImagePlus, Trash2 } from 'lucide-react'

export default function ImageUploader({ value = [], onChange }) {
  const [draft, setDraft] = useState('')
  const [dragIndex, setDragIndex] = useState(null)
  const inputRef = useRef(null)
  const images = Array.isArray(value) ? value : []
  const add = (items) => onChange([...images, ...items.filter(Boolean)])
  const readFiles = (files) => add(files.map((file) => URL.createObjectURL(file)))
  const reorder = (target) => {
    if (dragIndex === null || dragIndex === target) return
    const next = [...images]
    const [item] = next.splice(dragIndex, 1)
    next.splice(target, 0, item)
    onChange(next)
    setDragIndex(null)
  }
  return <div className="border border-neutral-800 bg-neutral-950/50 p-4">
    <div className="flex items-center justify-between"><h2 className="text-xs uppercase tracking-widest text-neutral-300">Images</h2><button type="button" onClick={() => inputRef.current?.click()} className="inline-flex items-center gap-2 border border-neutral-700 px-3 py-2 text-[10px] uppercase tracking-widest text-amber-300"><ImagePlus size={15} /> Upload</button><input ref={inputRef} type="file" accept="image/*" multiple className="hidden" onChange={(event) => readFiles([...event.target.files])} /></div>
    <div className="mt-3 flex gap-2"><input value={draft} onChange={(event) => setDraft(event.target.value)} onKeyDown={(event) => { if (event.key === 'Enter') { event.preventDefault(); add([draft.trim()]); setDraft('') } }} placeholder="Paste image URL and press Enter" className="min-w-0 flex-1 border border-neutral-800 bg-neutral-900 px-3 py-2 text-xs outline-none focus:border-amber-500" /><button type="button" onClick={() => { add([draft.trim()]); setDraft('') }} className="border border-amber-500 px-3 text-[10px] uppercase text-amber-300">Add</button></div>
    <div onDragOver={(event) => event.preventDefault()} onDrop={(event) => { event.preventDefault(); readFiles([...event.dataTransfer.files]) }} className="mt-4 grid grid-cols-3 gap-3 sm:grid-cols-4">{images.map((src, index) => <div key={`${src}-${index}`} draggable onDragStart={() => setDragIndex(index)} onDragOver={(event) => event.preventDefault()} onDrop={() => reorder(index)} className="group relative border border-neutral-800 p-1"><img src={src} alt="" className="aspect-square w-full object-cover" /><span className="absolute left-1 top-1 bg-neutral-950/80 px-1 text-[8px] uppercase tracking-wider text-amber-300">{index === 0 ? 'Cover Image' : index + 1}</span><button type="button" aria-label="Remove image" onClick={() => onChange(images.filter((_, itemIndex) => itemIndex !== index))} className="absolute right-1 top-1 bg-neutral-950/80 p-1 text-rose-300 opacity-0 transition-opacity group-hover:opacity-100"><Trash2 size={13} /></button></div>)}</div>
    {!images.length && <p className="mt-4 border border-dashed border-neutral-800 p-6 text-center text-xs text-neutral-500">Drop images here or add URLs</p>}
  </div>
}
