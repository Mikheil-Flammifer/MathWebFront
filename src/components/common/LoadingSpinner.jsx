export default function LoadingSpinner({ size = 'md', center = false }) {
  const sizes = {
    sm: 'w-4 h-4',
    md: 'w-8 h-8',
    lg: 'w-12 h-12',
    xl: 'w-16 h-16',
  }

  const spinner = (
    <div className={`${sizes[size]} border-4 border-primary-200
                     border-t-primary-600 rounded-full animate-spin`} />
  )

  if (center) {
    return (
      <div className="flex items-center justify-center w-full h-full
                      min-h-[200px]">
        {spinner}
      </div>
    )
  }

  return spinner
}