import { ChevronDown, RotateCcw, X } from 'lucide-react'
import { useState } from 'react'

const defaultCategories = ['High Jewelry', 'Fine Jewelry']
const defaultMaterials = ['18k Yellow Gold', '18k Rose Gold', '18k White Gold', 'Platinum', 'Diamonds', 'Emeralds', 'Sapphires', 'Rubies']
const blockedOption = /(watch|timepiece|horlogerie|montre|abdo|anas|void|clean)/i
const cleanSlug = (value) => String(value || '').toLowerCase().trim().replace(/[\s_]+/g, '-')

function AccordionGroup({ label, options, filters, onToggle, defaultOpen = false, children }) {
  const [isOpen, setIsOpen] = useState(defaultOpen)
  const [expanded, setExpanded] = useState(false)
  const visibleOptions = expanded ? options : options.slice(0, 4)

  if (!options.length) return null
  return <section className="border-t border-neutral-800 pt-4">
    <button type="button" onClick={() => setIsOpen((value) => !value)} aria-expanded={isOpen} className="flex w-full items-center justify-between text-left">
      <span className="text-[10px] uppercase tracking-[0.18em] text-neutral-400">{label}</span>
      <ChevronDown size={15} strokeWidth={1.25} className={`text-amber-400 transition-transform duration-300 ${isOpen ? 'rotate-180' : ''}`} />
    </button>
    <div className={`grid transition-[grid-template-rows,opacity] duration-300 ${isOpen ? 'grid-rows-[1fr] opacity-100' : 'grid-rows-[0fr] opacity-0'}`}>
      <div className="min-h-0 overflow-hidden">
        <div className="mt-3 space-y-2">
          {visibleOptions.map(({ label: optionLabel, value }) => <label key={value} className="flex items-center gap-3 text-xs text-neutral-400">
            <input type="checkbox" checked={filters.includes(value)} onChange={() => onToggle(value)} className="accent-amber-500" />
            {optionLabel}
          </label>)}
          {options.length > 4 && <button type="button" onClick={() => setExpanded((value) => !value)} className="pt-1 text-[10px] uppercase tracking-wider text-amber-400 hover:text-amber-300">
            {expanded ? '- Voir moins' : `+ Voir plus (${options.length - 4})`}
          </button>}
          {children}
        </div>
      </div>
    </div>
  </section>
}

export default function FilterSidebar({ filters, onChange, onReset, mobile = false, categoryOptions, collectionOptions = [], tagOptions = [] }) {
  const toOptions = (values) => [...new Set(values.filter((value) => !blockedOption.test(String(value))).map((value) => String(value).trim()).filter(Boolean))].map((value) => ({ label: value, value: cleanSlug(value) }))
  const groups = [
    ['Catégories', 'category', toOptions(categoryOptions?.length ? categoryOptions : defaultCategories), true],
    ['Collections', 'collection', toOptions(collectionOptions), true],
    ['Tags', 'tags', toOptions(tagOptions), false],
    ['Matériaux / Prix', 'materials', toOptions(defaultMaterials), false],
  ]
  const active = Object.entries(filters).flatMap(([key, values]) => Array.isArray(values) ? values.map((value) => ({ key, value })) : [])
  const toggle = (key, value) => onChange(key, filters[key].includes(value) ? filters[key].filter((item) => item !== value) : [...filters[key], value])
  const hasPriceFilter = filters.minPrice || filters.maxPrice

  return <aside className={mobile ? 'space-y-6' : 'hidden w-64 flex-shrink-0 space-y-6 lg:block'}>
    <div className="flex items-center justify-between">
      <h2 className="text-xs uppercase tracking-[0.2em]">Filtres</h2>
      {active.length > 0 || hasPriceFilter || filters.exclusive ? <button type="button" onClick={onReset} className="text-[10px] uppercase tracking-widest text-amber-400 hover:text-amber-300">Réinitialiser les filtres</button> : null}
    </div>
    {groups.map(([label, key, options, defaultOpen]) => <AccordionGroup key={key} label={label} options={options} filters={filters[key]} onToggle={(value) => toggle(key, value)} defaultOpen={defaultOpen}>
      {key === 'materials' && <div className="mt-4 border-t border-neutral-800 pt-3">
        <p className="mb-2 text-[10px] uppercase tracking-wider text-neutral-500">Prix (DH)</p>
        <div className="grid grid-cols-2 gap-2">
          <input type="number" min="0" step="5000" value={filters.minPrice} onChange={(event) => onChange('minPrice', event.target.value)} aria-label="Prix minimum" placeholder="Min" className="w-full border border-neutral-800 bg-neutral-900 px-2 py-2 text-xs outline-none focus:border-amber-500" />
          <input type="number" min="0" step="5000" value={filters.maxPrice} onChange={(event) => onChange('maxPrice', event.target.value)} aria-label="Prix maximum" placeholder="Max" className="w-full border border-neutral-800 bg-neutral-900 px-2 py-2 text-xs outline-none focus:border-amber-500" />
        </div>
      </div>}
    </AccordionGroup>)}
    <label className="flex items-center justify-between border-t border-neutral-800 pt-4 text-xs text-neutral-300">Boutique Exclusive<input type="checkbox" checked={filters.exclusive} onChange={(event) => onChange('exclusive', event.target.checked)} className="h-4 w-4 accent-amber-500" /></label>
    {active.length > 0 && <div className="flex flex-wrap gap-2 border-t border-neutral-800 pt-4">{active.map(({ key, value }) => <button type="button" key={`${key}-${value}`} onClick={() => toggle(key, value)} className="inline-flex items-center gap-1 border border-amber-500/40 px-2 py-1 text-[10px] uppercase tracking-wider text-amber-300">{value}<X size={11} /></button>)}</div>}
  </aside>
}
