import { Search, X } from 'lucide-react'
import { useState } from 'react'

export default function SearchBar({ onSearch, placeholder = 'Search...', className = '' }) {
  const [value, setValue] = useState('')

  const handleSubmit = (e) => {
    e.preventDefault()
    onSearch(value.trim())
  }

  const handleClear = () => {
    setValue('')
    onSearch('')
  }

  return (
    <form onSubmit={handleSubmit}
          className={`relative flex items-center ${className}`}>
      <Search className="absolute left-3 w-5 h-5 text-gray-400" />
      <input
        type="text"
        value={value}
        onChange={(e) => setValue(e.target.value)}
        placeholder={placeholder}
        className="input-field pl-10 pr-10"
      />
      {value && (
        <button
          type="button"
          onClick={handleClear}
          className="absolute right-3 text-gray-400 hover:text-gray-600"
        >
          <X className="w-4 h-4" />
        </button>
      )}
    </form>
  )
}