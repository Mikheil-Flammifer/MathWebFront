import { Link } from 'react-router-dom'

export default function Footer() {
  return (
    <footer className="border-t border-space-500 bg-space-800/70">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 py-6 flex flex-col sm:flex-row items-center justify-between gap-3 text-sm text-chalk-400">
        <span>© {new Date().getFullYear()} MathWeb</span>
        <nav aria-label="Legal" className="flex items-center gap-5">
          <Link to="/terms" className="hover:text-plasma-300">Terms</Link>
          <Link to="/privacy" className="hover:text-plasma-300">Privacy</Link>
          <Link to="/refund" className="hover:text-plasma-300">Refunds</Link>
        </nav>
      </div>
    </footer>
  )
}