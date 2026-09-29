export default function EmptyState({ icon: Icon, title, subtitle, action }) {
  return (
    <div className="flex flex-col items-center justify-center text-center py-20 px-6">
      <div className="w-14 h-14 rounded-2xl bg-space-600 grid place-items-center text-chalk-500 mb-4">
        <Icon size={24} />
      </div>
      <h3 className="text-lg font-semibold text-chalk-100 mb-1.5">{title}</h3>
      {subtitle && <p className="text-sm text-chalk-500 max-w-sm mb-5">{subtitle}</p>}
      {action}
    </div>
  )
}