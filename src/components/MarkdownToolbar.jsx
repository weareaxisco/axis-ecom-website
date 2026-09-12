import { useRef } from 'react'

const tools = [['Heading', '# ', ''], ['Bold', '**', '**'], ['Italic', '*', '*'], ['Link', '[', '](https://)'], ['Blockquote', '> ', ''], ['List', '- ', ''], ['Horizontal Rule', '\n---\n', '']]
export default function MarkdownToolbar({ value, onChange }) {
  const ref = useRef(null)
  const apply = (before, after) => {
    const input = ref.current
    const start = input?.selectionStart || value.length
    const end = input?.selectionEnd || start
    const selected = value.slice(start, end) || 'text'
    const next = `${value.slice(0, start)}${before}${selected}${after}${value.slice(end)}`
    onChange(next)
    requestAnimationFrame(() => { input?.focus(); input?.setSelectionRange(start + before.length, start + before.length + selected.length) })
  }
  return <div><div className="flex flex-wrap gap-1 border border-b-0 border-neutral-800 bg-neutral-900 p-2">{tools.map(([label, before, after]) => <button type="button" key={label} onClick={() => apply(before, after)} className="border border-neutral-700 px-2 py-1 text-[9px] uppercase tracking-wider text-neutral-400 hover:border-amber-500 hover:text-amber-300">{label}</button>)}</div><textarea ref={ref} value={value} onChange={(event) => onChange(event.target.value)} className="h-28 w-full border border-neutral-800 bg-neutral-900 px-3 py-3 text-sm outline-none focus:border-amber-500" /></div>
}
