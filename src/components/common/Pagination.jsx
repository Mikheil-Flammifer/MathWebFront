import { ChevronLeft, ChevronRight } from 'lucide-react'

export default function Pagination({ page, totalPages, onPageChange }) {
  if (totalPages <= 1) return null

  return (
    <div className="flex items-center justify-center gap-2 mt-8">
      <button
        onClick={() => onPageChange(page - 1)}
        disabled={page === 0}
        className="p-2 rounded-lg border border-gray-200
                   hover:bg-gray-50 disabled:opacity-40
                   disabled:cursor-not-allowed transition"
      >
        <ChevronLeft className="w-5 h-5" />
      </button>

      {Array.from({ length: totalPages }, (_, i) => (
        <button
          key={i}
          onClick={() => onPageChange(i)}
          className={`w-10 h-10 rounded-lg font-medium transition
            ${i === page
              ? 'bg-primary-600 text-white'
              : 'border border-gray-200 hover:bg-gray-50 text-gray-700'
            }`}
        >
          {i + 1}
        </button>
      )).slice(Math.max(0, page - 2), Math.min(totalPages, page + 3))}

      <button
        onClick={() => onPageChange(page + 1)}
        disabled={page >= totalPages - 1}
        className="p-2 rounded-lg border border-gray-200
                   hover:bg-gray-50 disabled:opacity-40
                   disabled:cursor-not-allowed transition"
      >
        <ChevronRight className="w-5 h-5" />
      </button>
    </div>
  )
}