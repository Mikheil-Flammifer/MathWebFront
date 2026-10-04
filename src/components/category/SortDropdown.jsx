const SORT_OPTIONS = [
  { value: 'newest',   label: 'Newest' },
  { value: 'oldest',   label: 'Oldest' },
  { value: 'popular',  label: 'Most viewed' },
  { value: 'shortest', label: 'Shortest' },
  { value: 'longest',  label: 'Longest' },
]

export default function SortDropdown({ value, onChange }) {
  return (
    <select
      value={value || 'newest'}
      onChange={(e) => onChange(e.target.value)}
      className="input-field py-2 w-auto shrink-0"
    >
      {SORT_OPTIONS.map((o) => <option key={o.value} value={o.value}>{o.label}</option>)}
    </select>
  )
}