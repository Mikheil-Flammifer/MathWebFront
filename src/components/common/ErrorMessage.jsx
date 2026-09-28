import { AlertCircle } from 'lucide-react'

export default function ErrorMessage({ message, onRetry }) {
  return (
    <div className="flex flex-col items-center justify-center
                    min-h-[200px] gap-4">
      <div className="flex items-center gap-2 text-red-600">
        <AlertCircle className="w-6 h-6" />
        <p className="font-medium">{message || 'Something went wrong'}</p>
      </div>
      {onRetry && (
        <button onClick={onRetry} className="btn-secondary text-sm">
          Try Again
        </button>
      )}
    </div>
  )
}