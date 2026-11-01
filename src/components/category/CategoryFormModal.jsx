import { useEffect, useState } from 'react'
import toast from 'react-hot-toast'
import { Loader2, X } from 'lucide-react'
import { useCreateCategory, useUpdateCategory } from '../../hooks/useAdminCategories'
import { parseApiError } from '../../utils/parseApiError'

const COLOR_RE = /^#[0-9a-fA-F]{6}$/
const SLUG_RE = /^[a-z0-9]+(?:-[a-z0-9]+)*$/
const DEFAULT_COLOR = '#6366f1'
const FIELD_KEYS = ['name', 'slug', 'description', 'icon', 'color', 'orderIndex', 'parentId']

export default function CategoryFormModal({
  mode,               // 'create' | 'edit'
  category,           // tree node, only for edit
  mainCategories,     // [{ id, name, ... }] for the parent select
  defaultParentId,    // preselected parent for create
  onClose,
  onSaved,            // (parentId | null) => void
}) {
  const isEdit = mode === 'edit'
  const hasChildren = isEdit && (category.children?.length || 0) > 0

  const initialParent = isEdit
    ? (category.parentId ? String(category.parentId) : '')
    : (defaultParentId ? String(defaultParentId) : '')

  const [name, setName] = useState(isEdit ? category.name : '')
  const [slug, setSlug] = useState(isEdit ? category.slug || '' : '')
  const [description, setDescription] = useState(isEdit ? category.description || '' : '')
  const [icon, setIcon] = useState(isEdit ? category.icon || '' : '')
  const [color, setColor] = useState(isEdit ? category.color || '' : '')
  const [orderIndex, setOrderIndex] = useState(
    isEdit && category.orderIndex != null ? String(category.orderIndex) : ''
  )
  const [parentId, setParentId] = useState(initialParent)

  const [errors, setErrors] = useState({})
  const [formError, setFormError] = useState('')

  const createMutation = useCreateCategory()
  const updateMutation = useUpdateCategory()
  const pending = createMutation.isPending || updateMutation.isPending

  useEffect(() => {
    const onKey = (e) => {
      if (e.key === 'Escape' && !pending) onClose()
    }
    window.addEventListener('keydown', onKey)
    return () => {
      window.removeEventListener('keydown', onKey)
    }
  }, [pending, onClose])

  const validate = () => {
    const next = {}
    const trimmed = name.trim()
    const s = slug.trim()

    if (!trimmed) next.name = 'Name is required'
    else if (trimmed.length > 100) next.name = 'Max 100 characters'

    if (s) {
      if (s.length > 100) next.slug = 'Max 100 characters'
      else if (!SLUG_RE.test(s)) next.slug = 'Lowercase letters, digits and single hyphens only'
    } else if (!isEdit && trimmed && !/[A-Za-z]/.test(trimmed)) {
      next.slug = 'Slug is required when the name has no Latin letters'
    }

    if (color && !COLOR_RE.test(color)) next.color = 'Use 6 hex digits, like #6366f1'

    if (orderIndex !== '') {
      const n = Number(orderIndex)
      if (!Number.isInteger(n) || n < 0) next.orderIndex = 'Whole number, 0 or more'
    }

    if (description.length > 2000) next.description = 'Max 2000 characters'
    return next
  }

  const buildCreateBody = () => {
    const body = { name: name.trim() }
    if (slug.trim()) body.slug = slug.trim()
    if (description.trim()) body.description = description.trim()
    if (icon.trim()) body.icon = icon.trim()
    if (color) body.color = color.toLowerCase()
    if (orderIndex !== '') body.orderIndex = Number(orderIndex)
    if (parentId) body.parentId = Number(parentId)
    return body
  }

  // only changed fields; "" clears description, icon and color
  const buildUpdateBody = () => {
    const body = {}
    if (name.trim() !== category.name) body.name = name.trim()
    if (slug.trim() && slug.trim() !== category.slug) body.slug = slug.trim()
    if (description.trim() !== (category.description || '')) body.description = description.trim()
    if (icon.trim() !== (category.icon || '')) body.icon = icon.trim()
    if (color.toLowerCase() !== (category.color || '').toLowerCase()) body.color = color.toLowerCase()
    if (orderIndex !== '' && Number(orderIndex) !== category.orderIndex) {
      body.orderIndex = Number(orderIndex)
    }
    if (parentId !== initialParent) {
      if (parentId === '') body.clearParent = true
      else body.parentId = Number(parentId)
    }
    return body
  }

  const handleError = (err) => {
    const { status, message, fieldErrors } = parseApiError(err, 'Could not save the category.')
    const mapped = {}
    Object.entries(fieldErrors).forEach(([key, value]) => {
      mapped[key] = String(value)
    })
    if (status === 409 && /slug/i.test(message)) mapped.slug = message

    setErrors(mapped)
    const shownOnField = Object.keys(mapped).some((k) => FIELD_KEYS.includes(k))
    setFormError(shownOnField ? '' : message)
  }

  const handleSubmit = (e) => {
    e.preventDefault()
    if (pending) return

    setFormError('')
    const found = validate()
    setErrors(found)
    if (Object.keys(found).length > 0) return

    const handlers = {
      onSuccess: () => {
        toast.success(isEdit ? 'Category updated' : 'Category created')
        if (onSaved) onSaved(parentId ? Number(parentId) : null)
        onClose()
      },
      onError: handleError,
    }

    if (isEdit) {
      const body = buildUpdateBody()
      if (Object.keys(body).length === 0) {
        onClose()
        return
      }
      updateMutation.mutate({ id: category.id, body }, handlers)
    } else {
      createMutation.mutate(buildCreateBody(), handlers)
    }
  }

  const parentOptions = (mainCategories || []).filter(
    (c) => !isEdit || c.id !== category.id
  )

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-space-950/70 backdrop-blur-sm"
      onClick={() => {
        if (!pending) onClose()
      }}
    >
      <div
        role="dialog"
        aria-modal="true"
        className="card w-full max-w-lg max-h-[90vh] overflow-y-auto animate-fade-in"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-start justify-between gap-3 mb-5">
          <div>
            <p className="mono-label mb-1">{isEdit ? 'EDIT' : 'NEW'}</p>
            <h2 className="section-title">
              {isEdit ? 'Edit category' : 'New category'}
            </h2>
          </div>
          <button
            type="button"
            className="btn-icon"
            onClick={onClose}
            disabled={pending}
            aria-label="Close"
          >
            <X size={18} />
          </button>
        </div>

        {formError && (
          <div className="alert-error mb-4" role="alert">
            {formError}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4" noValidate>
          <div>
            <label className="input-label" htmlFor="cat-name">Name *</label>
            <input
              id="cat-name"
              className="input-field"
              value={name}
              maxLength={100}
              onChange={(e) => setName(e.target.value)}
              autoFocus
            />
            {errors.name && <p className="input-error">{errors.name}</p>}
          </div>

          <div>
            <label className="input-label" htmlFor="cat-slug">Slug</label>
            <input
              id="cat-slug"
              className="input-field font-mono"
              value={slug}
              maxLength={100}
              placeholder="generated from the name if empty"
              onChange={(e) => setSlug(e.target.value)}
            />
            {errors.slug ? (
              <p className="input-error">{errors.slug}</p>
            ) : (
              <p className="input-hint">
                Lowercase letters, digits and hyphens. Required for names without Latin letters.
              </p>
            )}
          </div>

          <div>
            <label className="input-label" htmlFor="cat-parent">Parent</label>
            <select
              id="cat-parent"
              className="input-field"
              value={parentId}
              onChange={(e) => setParentId(e.target.value)}
              disabled={hasChildren}
            >
              <option value="">Top level (main category)</option>
              {parentOptions.map((c) => (
                <option key={c.id} value={String(c.id)}>
                  {c.name}
                </option>
              ))}
            </select>
            {hasChildren && (
              <p className="input-hint">
                This category has subcategories, so it cannot become a subcategory.
              </p>
            )}
            {errors.parentId && <p className="input-error">{errors.parentId}</p>}
          </div>

          <div>
            <label className="input-label" htmlFor="cat-desc">Description</label>
            <textarea
              id="cat-desc"
              className="input-field min-h-[84px]"
              value={description}
              maxLength={2000}
              onChange={(e) => setDescription(e.target.value)}
            />
            {errors.description && <p className="input-error">{errors.description}</p>}
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="input-label" htmlFor="cat-icon">Icon</label>
              <input
                id="cat-icon"
                className="input-field"
                value={icon}
                maxLength={50}
                onChange={(e) => setIcon(e.target.value)}
              />
              {errors.icon && <p className="input-error">{errors.icon}</p>}
            </div>

            <div>
              <label className="input-label" htmlFor="cat-order">Order</label>
              <input
                id="cat-order"
                type="number"
                min="0"
                step="1"
                className="input-field"
                value={orderIndex}
                placeholder="last"
                onChange={(e) => setOrderIndex(e.target.value)}
              />
              {errors.orderIndex && <p className="input-error">{errors.orderIndex}</p>}
            </div>
          </div>

          <div>
            <label className="input-label" htmlFor="cat-color">Color</label>
            <div className="flex items-center gap-3">
              <input
                type="color"
                aria-label="Pick a color"
                value={COLOR_RE.test(color) ? color : DEFAULT_COLOR}
                onChange={(e) => setColor(e.target.value)}
                className="h-11 w-12 shrink-0 rounded-lg border border-space-500 bg-space-800 p-1 cursor-pointer"
              />
              <input
                id="cat-color"
                className="input-field font-mono"
                value={color}
                maxLength={7}
                placeholder="#6366f1"
                onChange={(e) => setColor(e.target.value)}
              />
              {color && (
                <button type="button" className="btn-ghost shrink-0" onClick={() => setColor('')}>
                  Clear
                </button>
              )}
            </div>
            {errors.color && <p className="input-error">{errors.color}</p>}
          </div>

          <div className="flex justify-end gap-3 pt-2">
            <button type="button" className="btn-secondary" onClick={onClose} disabled={pending}>
              Cancel
            </button>
            <button type="submit" className="btn-primary" disabled={pending}>
              {pending && <Loader2 className="animate-spin" size={16} />}
              {isEdit ? 'Save changes' : 'Create category'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}