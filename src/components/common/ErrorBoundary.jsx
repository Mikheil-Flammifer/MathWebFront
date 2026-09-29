import { Component } from 'react'
import { AlertTriangle } from 'lucide-react'

export default class ErrorBoundary extends Component {
  state = { error: null }

  static getDerivedStateFromError(error) {
    return { error }
  }

  componentDidCatch(error, info) {
    console.error('Render crash:', error, info.componentStack)
  }

  render() {
    if (!this.state.error) return this.props.children
    return (
      <div className="min-h-screen flex items-center justify-center p-6">
        <div className="card max-w-lg text-center">
          <AlertTriangle className="mx-auto mb-3 text-red-400" size={28} />
          <h2 className="section-title mb-2">Something broke</h2>
          <p className="text-sm text-chalk-400 mb-4 font-mono break-words">{this.state.error.message}</p>
          <button onClick={() => window.location.assign('/home')} className="btn-primary">
            Go to Home
          </button>
        </div>
      </div>
    )
  }
}