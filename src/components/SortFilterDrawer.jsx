import { useEffect, useState } from 'react'
import { ChevronDown, ChevronUp, X } from 'lucide-react'
import { FACET_CONFIG } from '../constants/facets'

function createInitialSelection() {
  return {
    sort: 'recommended',
    category: [],
    metal: [],
    novelties: [],
    gender: [],
    shape: [],
  }
}

export default function SortFilterDrawer({
  isOpen,
  onClose,
  activeSelection,
  onApply,
}) {
  const [selection, setSelection] = useState(activeSelection || createInitialSelection())
  const [openSections, setOpenSections] = useState(
    () => Object.fromEntries(FACET_CONFIG.map((facet) => [facet.id, facet.defaultOpen])),
  )

  useEffect(() => {
    if (isOpen) setSelection(activeSelection || createInitialSelection())
  }, [activeSelection, isOpen])

  useEffect(() => {
    document.body.style.overflow = isOpen ? 'hidden' : ''
    return () => {
      document.body.style.overflow = ''
    }
  }, [isOpen])

  const clearSelection = () => setSelection(createInitialSelection())

  const toggleOption = (facetId, option) => {
    setSelection((current) => {
      const values = current[facetId] || []
      return {
        ...current,
        [facetId]: values.includes(option)
          ? values.filter((value) => value !== option)
          : [...values, option],
      }
    })
  }

  return (
    <div
      className={`pointer-events-none fixed inset-0 z-50 transition-visibility duration-300 ${isOpen ? 'visible' : 'invisible'}`}
      aria-hidden={!isOpen}
    >
      <button
        type="button"
        aria-label="Close sort and filter"
        onClick={onClose}
        className={`pointer-events-auto absolute inset-0 bg-black/60 backdrop-blur-sm transition-opacity duration-300 ${isOpen ? 'opacity-100' : 'opacity-0'}`}
      />
      <aside
        role="dialog"
        aria-modal="true"
        aria-label="Sort and filter products"
        className={`pointer-events-auto absolute bottom-0 right-0 top-0 flex w-full max-w-md transform flex-col bg-white text-neutral-900 shadow-2xl transition-transform duration-300 ease-out ${isOpen ? 'translate-x-0' : 'translate-x-full'}`}
      >
        <header className="flex items-center justify-between border-b border-neutral-200 px-6 py-5">
          <h2 className="font-serif text-xl tracking-widest">SORT &amp; FILTER</h2>
          <div className="flex items-center gap-3">
            <button type="button" onClick={clearSelection} className="text-[10px] font-medium tracking-widest text-neutral-500 hover:text-neutral-900">CLEAR</button>
            <button type="button" onClick={onClose} aria-label="Close" className="bg-neutral-100 p-2 text-neutral-500 hover:text-neutral-900">
              <X size={17} strokeWidth={1.25} />
            </button>
          </div>
        </header>
        <div className="flex-1 overflow-y-auto px-6 py-4">
          {FACET_CONFIG.map((facet) => {
            const isExpanded = openSections[facet.id]
            return (
              <section key={facet.id} className="border-b border-neutral-200">
                <button
                  type="button"
                  onClick={() => setOpenSections((current) => ({ ...current, [facet.id]: !current[facet.id] }))}
                  className="flex w-full items-center justify-between py-5 text-left text-xs font-medium tracking-widest"
                >
                  {facet.label}
                  {isExpanded ? <ChevronUp size={15} strokeWidth={1.25} /> : <ChevronDown size={15} strokeWidth={1.25} />}
                </button>
                {isExpanded && (
                  <div className="space-y-3 pb-5">
                    {facet.options.map((option) => {
                      const value = typeof option === 'string' ? option : option.value
                      const label = typeof option === 'string' ? option : option.label
                      const checked = facet.type === 'radio'
                        ? selection[facet.id] === value
                        : selection[facet.id]?.includes(value)
                      return (
                        <label key={value} className="flex cursor-pointer items-center gap-3 text-sm text-neutral-600">
                          <input
                            type={facet.type}
                            name={facet.id}
                            value={value}
                            checked={checked}
                            onChange={() => facet.type === 'radio'
                              ? setSelection((current) => ({ ...current, [facet.id]: value }))
                              : toggleOption(facet.id, value)}
                            className="h-4 w-4 accent-black"
                          />
                          {label}
                        </label>
                      )
                    })}
                  </div>
                )}
              </section>
            )
          })}
        </div>
        <footer className="sticky bottom-0 border-t border-neutral-200 bg-white p-4">
          <button type="button" onClick={() => { onApply(selection); onClose() }} className="w-full bg-black py-3.5 text-xs font-medium uppercase tracking-widest text-white">
            VIEW RESULTS
          </button>
        </footer>
      </aside>
    </div>
  )
}
