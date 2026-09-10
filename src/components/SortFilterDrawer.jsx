import { useEffect, useState } from 'react'
import { ChevronDown, ChevronUp, X } from 'lucide-react'
import { FACET_CONFIG } from '../constants/facets'
import { useLanguage } from '../context/LanguageContext'

export function createInitialSelection() {
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
  targetCollectionId,
}) {
  const [selection, setSelection] = useState(activeSelection || createInitialSelection())
  const [openSections, setOpenSections] = useState(
    () => Object.fromEntries(FACET_CONFIG.map((facet) => [facet.id, facet.defaultOpen])),
  )
  const { t } = useLanguage()
  const facetLabels = { sort: t('sortBy'), category: t('category'), metal: t('metal'), novelties: t('novelties'), gender: t('gender'), shape: t('shape') }
  const optionLabels = { recommended: t('recommended'), name_asc: t('nameAscending'), name_desc: t('nameDescending'), 'Rose gold': t('roseGold'), 'Yellow gold': t('yellowGold'), 'White gold': t('whiteGold'), Yes: t('yes'), Women: t('women'), Unisex: t('unisex'), Square: t('square') }

  useEffect(() => {
    if (isOpen) setSelection(activeSelection || createInitialSelection())
  }, [activeSelection, isOpen])

  useEffect(() => {
    document.body.style.overflow = isOpen ? 'hidden' : ''
    return () => {
      document.body.style.overflow = ''
    }
  }, [isOpen])

  const clearSelection = () => {
    const clearedSelection = createInitialSelection()
    setSelection(clearedSelection)
    onApply(clearedSelection, targetCollectionId)
  }

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
        className={`filter-drawer pointer-events-auto absolute bottom-0 right-0 top-0 flex w-full max-w-md transform flex-col bg-[var(--surface-primary)] text-[var(--text-primary)] shadow-2xl transition-transform duration-300 ease-out ${isOpen ? 'translate-x-0' : 'translate-x-full'}`}
      >
        <header className="flex items-center justify-between border-b border-[var(--border-subtle)] px-6 py-5">
          <h2 className="font-serif text-xl tracking-widest">{t('sortAndFilter')}</h2>
          <div className="flex items-center gap-3">
            <button type="button" onClick={clearSelection} className="text-[10px] font-medium tracking-widest text-[var(--text-primary)] opacity-60 hover:opacity-100">{t('clear')}</button>
            <button type="button" onClick={onClose} aria-label="Close" className="bg-[var(--bg-primary)] p-2 text-[var(--text-primary)] opacity-70 hover:opacity-100">
              <X size={17} strokeWidth={1.25} />
            </button>
          </div>
        </header>
        <div className="flex-1 overflow-y-auto px-6 py-4">
          {FACET_CONFIG.map((facet) => {
            const isExpanded = openSections[facet.id]
            return (
              <section key={facet.id} className="border-b border-[var(--border-subtle)]">
                <button
                  type="button"
                  onClick={() => setOpenSections((current) => ({ ...current, [facet.id]: !current[facet.id] }))}
                  className="flex w-full items-center justify-between py-5 text-left text-xs font-medium tracking-widest"
                >
                  {facetLabels[facet.id] || facet.label}
                  {isExpanded ? <ChevronUp size={15} strokeWidth={1.25} /> : <ChevronDown size={15} strokeWidth={1.25} />}
                </button>
                <div className={`grid transition-[grid-template-rows] duration-300 ease-in-out ${isExpanded ? 'grid-rows-[1fr]' : 'grid-rows-[0fr]'}`}>
                  <div className="overflow-hidden">
                    <div className="space-y-3 pb-5">
                    {facet.options.map((option) => {
                      const value = typeof option === 'string' ? option : option.value
                      const label = typeof option === 'string' ? option : option.label
                      const checked = facet.type === 'radio'
                        ? selection[facet.id] === value
                        : selection[facet.id]?.includes(value)
                      return (
                        <label key={value} className="flex cursor-pointer items-center gap-3 text-sm text-[var(--text-primary)] opacity-75">
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
                          {optionLabels[value] || label}
                        </label>
                      )
                    })}
                    </div>
                  </div>
                </div>
              </section>
            )
          })}
        </div>
        <footer className="sticky bottom-0 border-t border-[var(--border-subtle)] bg-[var(--surface-primary)] p-4">
          <button type="button" onClick={() => { onApply(selection, targetCollectionId); onClose() }} className="w-full bg-[var(--text-primary)] py-3.5 text-xs font-medium uppercase tracking-widest text-[var(--surface-primary)]">
            {t('viewResults')}
          </button>
        </footer>
      </aside>
    </div>
  )
}
