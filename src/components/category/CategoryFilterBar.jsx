import { useState } from 'react'
import useCategories from '../../hooks/useCategories'

export default function CategoryFilterBar({ categoryId, onSelect }) {
  const { data: categories, isLoading } = useCategories()
  const [expandedId, setExpandedId] = useState(null)

  if (isLoading) {
    return (
      <div className="flex gap-2">
        {Array.from({ length: 4 }, (_, i) => <div key={i} className="h-8 w-24 skeleton rounded-full" />)}
      </div>
    )
  }
  if (!categories?.length) return null

  return (
    <div>
      <div className="flex flex-wrap gap-2">
        <button
          onClick={() => { onSelect(null); setExpandedId(null) }}
          className={`category-pill ${categoryId == null ? '' : 'border-space-500 text-chalk-400 hover:border-space-300 hover:text-chalk-200'}`}
          style={categoryId == null ? { borderColor: '#6366f1', background: 'rgba(99,102,241,0.12)', color: '#a5b4fc' } : undefined}
        >
          All
        </button>

        {categories.map((cat) => {
          const active = categoryId === cat.id || cat.children?.some((ch) => ch.id === categoryId)
          return (
            <button
              key={cat.id}
              onClick={() => {
                onSelect(cat.id)
                setExpandedId(expandedId === cat.id ? null : cat.id)
              }}
              className={`category-pill ${active ? '' : 'border-space-500 text-chalk-400 hover:border-space-300 hover:text-chalk-200'}`}
              style={active ? { borderColor: cat.color || '#6366f1', background: `${cat.color || '#6366f1'}20`, color: cat.color || '#a5b4fc' } : undefined}
            >
              <span className="w-2 h-2 rounded-full shrink-0" style={{ background: cat.color || '#6366f1' }} />
              {cat.name}
            </button>
          )
        })}
      </div>

      {expandedId && (
        <div className="flex flex-wrap gap-2 mt-2.5 pl-1 animate-fade-in">
          {categories.find((c) => c.id === expandedId)?.children?.map((sub) => (
            <button
              key={sub.id}
              onClick={() => onSelect(sub.id)}
              className={`category-pill !py-1 !text-[11px] ${
                categoryId === sub.id ? '' : 'border-space-500 text-chalk-500 hover:border-space-300 hover:text-chalk-200'
              }`}
              style={categoryId === sub.id ? { borderColor: '#6366f1', background: 'rgba(99,102,241,0.12)', color: '#a5b4fc' } : undefined}
            >
              {sub.name}
            </button>
          ))}
        </div>
      )}
    </div>
  )
}