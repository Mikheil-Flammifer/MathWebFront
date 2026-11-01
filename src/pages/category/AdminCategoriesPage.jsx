import { useEffect, useState } from 'react'
import toast from 'react-hot-toast'
import {
  ChevronRight,
  ChevronDown,
  Trash2,
  Pencil,
  Plus,
  Loader2,
  Video,
  FileQuestion,
  FolderTree,
  AlertTriangle,
} from 'lucide-react'
import { useAdminCategories, useDeleteCategory } from '../../hooks/useAdminCategories'
import { parseApiError } from '../../utils/parseApiError'
import CategoryFormModal from '../../components/category/CategoryFormModal'

const plural = (n, word) => n + ' ' + word + (n === 1 ? '' : 's')

const isInUse = (cat) =>
  (cat.children?.length || 0) + cat.videoCount + cat.problemCount > 0

function inUseReason(cat) {
  const parts = []
  const subs = cat.children?.length || 0
  if (subs > 0) parts.push(subs + (subs === 1 ? ' subcategory' : ' subcategories'))
  if (cat.videoCount > 0) parts.push(plural(cat.videoCount, 'video'))
  if (cat.problemCount > 0) parts.push(plural(cat.problemCount, 'problem'))
  return parts.join(', ') + '. Move or delete them first.'
}

function Counts({ cat }) {
  return (
    <div className="flex items-center gap-3 text-xs text-chalk-400">
      <span className="inline-flex items-center gap-1" title="Videos assigned directly">
        <Video size={13} />
        {cat.videoCount}
      </span>
      <span className="inline-flex items-center gap-1" title="Problems assigned directly">
        <FileQuestion size={13} />
        {cat.problemCount}
      </span>
    </div>
  )
}

function EditButton({ cat, onClick }) {
  return (
    <button
      type="button"
      className="btn-icon"
      title="Edit category"
      onClick={() => onClick(cat)}
      aria-label={'Edit ' + cat.name}
    >
      <Pencil size={16} />
    </button>
  )
}

function DeleteButton({ cat, onClick }) {
  const blocked = isInUse(cat)
  return (
    // title on a wrapper: some browsers show no tooltip on a disabled button
    <span title={blocked ? 'Cannot delete: ' + inUseReason(cat) : 'Delete category'}>
      <button
        type="button"
        className="btn-icon hover:text-red-400 disabled:opacity-30 disabled:cursor-not-allowed disabled:hover:bg-transparent disabled:hover:text-chalk-400"
        disabled={blocked}
        onClick={() => onClick(cat)}
        aria-label={'Delete ' + cat.name}
      >
        <Trash2 size={16} />
      </button>
    </span>
  )
}

function ConfirmDelete({ cat, pending, onCancel, onConfirm }) {
  useEffect(() => {
    const onKey = (e) => {
      if (e.key === 'Escape' && !pending) onCancel()
    }
    window.addEventListener('keydown', onKey)
    return () => {
      window.removeEventListener('keydown', onKey)
    }
  }, [pending, onCancel])

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-space-950/70 backdrop-blur-sm"
      onClick={() => {
        if (!pending) onCancel()
      }}
    >
      <div
        role="dialog"
        aria-modal="true"
        className="card max-w-md w-full animate-fade-in"
        onClick={(e) => e.stopPropagation()}
      >
        <AlertTriangle className="mb-3 text-red-400" size={26} />
        <h2 className="section-title mb-2">Delete category?</h2>
        <p className="text-sm text-chalk-300 mb-1">
          <span className="font-semibold text-chalk-50">{cat.name}</span>{' '}
          {cat.parentId ? '(subcategory)' : '(main category)'} will be deleted.
        </p>
        <p className="text-sm text-chalk-500 mb-6">This cannot be undone.</p>

        <div className="flex justify-end gap-3">
          <button type="button" className="btn-secondary" onClick={onCancel} disabled={pending}>
            Cancel
          </button>
          <button type="button" className="btn-danger" onClick={onConfirm} disabled={pending}>
            {pending ? <Loader2 className="animate-spin" size={16} /> : <Trash2 size={16} />}
            Delete
          </button>
        </div>
      </div>
    </div>
  )
}

function SubRow({ cat, onEdit, onDelete }) {
  return (
    <div className="flex items-center gap-3 pl-12 pr-3 py-2.5 border-t border-space-500 hover:bg-space-600/40 transition-colors">
      <span
        className="w-2.5 h-2.5 rounded-full shrink-0 border border-space-400"
        style={cat.color ? { backgroundColor: cat.color, borderColor: cat.color } : undefined}
      />
      <div className="flex-1 min-w-0">
        <p className="text-sm text-chalk-100 truncate">{cat.name}</p>
        <p className="font-mono text-[11px] text-chalk-500 truncate">{cat.slug}</p>
      </div>
      <Counts cat={cat} />
      <EditButton cat={cat} onClick={onEdit} />
      <DeleteButton cat={cat} onClick={onDelete} />
    </div>
  )
}

function MainCard({ cat, open, onToggle, onEdit, onDelete, onAddSub }) {
  const subs = cat.children || []
  return (
    <div className="rounded-xl border border-space-500 bg-space-700 overflow-hidden">
      <div className="flex items-center gap-3 p-3 sm:p-4">
        <button
          type="button"
          className="btn-icon shrink-0"
          onClick={onToggle}
          aria-expanded={open}
          aria-label={(open ? 'Collapse ' : 'Expand ') + cat.name}
        >
          {open ? <ChevronDown size={18} /> : <ChevronRight size={18} />}
        </button>

        <span
          className="w-3.5 h-3.5 rounded-full shrink-0"
          style={{ backgroundColor: cat.color || '#475569' }}
        />

        <div className="flex-1 min-w-0">
          <p className="font-display font-semibold text-chalk-50 truncate">{cat.name}</p>
          <p className="text-xs text-chalk-500">
            <span className="font-mono">{cat.slug}</span>
            {' · '}
            {subs.length} {subs.length === 1 ? 'subcategory' : 'subcategories'}
          </p>
        </div>

        <Counts cat={cat} />
        <button
          type="button"
          className="btn-icon"
          title="Add subcategory"
          onClick={() => onAddSub(cat)}
          aria-label={'Add subcategory to ' + cat.name}
        >
          <Plus size={16} />
        </button>
        <EditButton cat={cat} onClick={onEdit} />
        <DeleteButton cat={cat} onClick={onDelete} />
      </div>

      {open && (
        <div className="animate-fade-in">
          {subs.length === 0 ? (
            <p className="px-4 py-3 border-t border-space-500 text-sm text-chalk-500">
              No subcategories.
            </p>
          ) : (
            subs.map((sub) => (
              <SubRow key={sub.id} cat={sub} onEdit={onEdit} onDelete={onDelete} />
            ))
          )}
        </div>
      )}
    </div>
  )
}

export default function AdminCategoriesPage() {
  const { data, isLoading, isError, error, refetch, isFetching } = useAdminCategories()
  const deleteCategory = useDeleteCategory()

  const [expanded, setExpanded] = useState(() => new Set())
  const [confirmTarget, setConfirmTarget] = useState(null)
  // null | { mode: 'create', parentId } | { mode: 'edit', category }
  const [formState, setFormState] = useState(null)

  const tree = data || []

  const toggle = (id) => {
    setExpanded((prev) => {
      const next = new Set(prev)
      if (next.has(id)) next.delete(id)
      else next.add(id)
      return next
    })
  }

  const expandAll = () => setExpanded(new Set(tree.map((c) => c.id)))
  const collapseAll = () => setExpanded(new Set())

  // after saving, open the parent so the new or moved category is visible
  const handleSaved = (parentId) => {
    if (!parentId) return
    setExpanded((prev) => {
      const next = new Set(prev)
      next.add(parentId)
      return next
    })
  }

  const handleConfirm = () => {
    if (!confirmTarget) return
    deleteCategory.mutate(confirmTarget.id, {
      onSuccess: () => {
        toast.success('Category deleted')
        setConfirmTarget(null)
      },
      onError: (err) => {
        const { status, message } = parseApiError(err, 'Could not delete the category.')
        toast.error(message)
        if (status === 404 || status === 409) {
          // counts changed or the category is gone: close and reload the tree
          setConfirmTarget(null)
          refetch()
        }
      },
    })
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <p className="mono-label mb-2">ADMIN</p>
          <h1 className="page-title flex items-center gap-3">
            <FolderTree className="text-plasma-400" size={28} />
            Categories
          </h1>
          <p className="text-sm text-chalk-400 mt-2">
            Counts show items assigned directly to each category.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          {tree.length > 0 && (
            <>
              <button type="button" className="btn-ghost" onClick={expandAll}>
                Expand all
              </button>
              <button type="button" className="btn-ghost" onClick={collapseAll}>
                Collapse all
              </button>
            </>
          )}
          <button
            type="button"
            className="btn-primary"
            onClick={() => setFormState({ mode: 'create', parentId: null })}
          >
            <Plus size={16} />
            New category
          </button>
        </div>
      </div>

      {isLoading && (
        <div className="space-y-3">
          {[0, 1, 2, 3].map((i) => (
            <div key={i} className="skeleton h-16" />
          ))}
        </div>
      )}

      {isError && (
        <div className="alert-error items-center justify-between">
          <span>{parseApiError(error, 'Could not load categories.').message}</span>
          <button type="button" className="btn-secondary py-1.5" onClick={() => refetch()} disabled={isFetching}>
            {isFetching ? 'Retrying…' : 'Retry'}
          </button>
        </div>
      )}

      {!isLoading && !isError && tree.length === 0 && (
        <div className="card text-center text-chalk-400 text-sm">No categories yet.</div>
      )}

      {tree.length > 0 && (
        <div className="space-y-3">
          {tree.map((cat) => (
            <MainCard
              key={cat.id}
              cat={cat}
              open={expanded.has(cat.id)}
              onToggle={() => toggle(cat.id)}
              onEdit={(c) => setFormState({ mode: 'edit', category: c })}
              onDelete={setConfirmTarget}
              onAddSub={(c) => setFormState({ mode: 'create', parentId: c.id })}
            />
          ))}
        </div>
      )}

      {formState && (
        <CategoryFormModal
          mode={formState.mode}
          category={formState.category}
          defaultParentId={formState.parentId}
          mainCategories={tree}
          onClose={() => setFormState(null)}
          onSaved={handleSaved}
        />
      )}

      {confirmTarget && (
        <ConfirmDelete
          cat={confirmTarget}
          pending={deleteCategory.isPending}
          onCancel={() => setConfirmTarget(null)}
          onConfirm={handleConfirm}
        />
      )}
    </div>
  )
}