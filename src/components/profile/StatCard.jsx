export default function StatCard({ icon: Icon, label, value, accent = 'text-plasma-300' }) {
  return (
    <div className="stat-box">
      <div className={`w-9 h-9 rounded-lg grid place-items-center bg-space-600 ${accent} mb-1`}>
        <Icon size={17} />
      </div>
      <span className="stat-value">{value}</span>
      <span className="stat-label">{label}</span>
    </div>
  )
}