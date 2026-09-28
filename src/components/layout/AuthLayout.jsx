export default function AuthLayout({ title, subtitle, children }) {
  return (
    <div className="min-h-screen flex items-center justify-center px-4 py-12 bg-grid">
      {/* Ambient glow */}
      <div className="pointer-events-none fixed inset-0 overflow-hidden" aria-hidden="true">
        <div style={{
          position:'absolute', top:'-15%', left:'-5%',
          width:'600px', height:'600px', borderRadius:'50%',
          background:'radial-gradient(circle, rgba(99,102,241,0.1) 0%, transparent 65%)',
        }}/>
        <div style={{
          position:'absolute', bottom:'-20%', right:'-5%',
          width:'500px', height:'500px', borderRadius:'50%',
          background:'radial-gradient(circle, rgba(67,56,202,0.07) 0%, transparent 65%)',
        }}/>
      </div>

      <div className="w-full max-w-md relative animate-fade-in">
        {/* Logo */}
        <div className="flex items-center gap-2.5 mb-8 justify-center">
          <div className="w-9 h-9 rounded-xl flex items-center justify-center text-white text-lg font-bold font-display select-none"
            style={{ background: 'linear-gradient(135deg, #6366f1 0%, #4338ca 100%)', boxShadow: '0 0 16px rgba(99,102,241,0.4)' }}>
            ∑
          </div>
          <span className="text-xl font-semibold font-display text-chalk-50 tracking-tight">
            MathWeb
          </span>
        </div>

        {/* Card */}
        <div className="rounded-2xl p-8 border border-space-500 glass">
          <h1 className="text-2xl font-semibold font-display text-chalk-50 tracking-tight mb-1">
            {title}
          </h1>
          {subtitle && (
            <p className="text-sm text-chalk-500 mb-6">{subtitle}</p>
          )}
          <div className="accent-rule mb-6" />
          {children}
        </div>

        <p className="text-center text-xs text-chalk-600 mt-6">
          © {new Date().getFullYear()} MathWeb — Learn mathematics, step by step.
        </p>
      </div>
    </div>
  )
}