export default function EmptyState({ icon, title, description, action }) {
  return (
    <div className="flex flex-col items-center justify-center
                    min-h-[300px] gap-4 text-center p-8">
      {icon && <div className="text-6xl">{icon}</div>}
      <div>
        <h3 className="text-xl font-semibold text-gray-800">{title}</h3>
        {description && (
          <p className="text-gray-500 mt-2 max-w-sm">{description}</p>
        )}
      </div>
      {action && (
        <button onClick={action.onClick} className="btn-primary mt-2">
          {action.label}
        </button>
      )}
    </div>
  )
}