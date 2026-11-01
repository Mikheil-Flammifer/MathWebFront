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

  componentDidUpdate(prevProps) {
    // resetKey = current pathname: leaving the broken page clears the error
    if (this.state.error && prevProps.resetKey !== this.props.resetKey) {
      this.setState({ error: null })
    }
  }

  handleRetry = () => {
    this.setState({ error: null })
  }

  render() {
    if (!this.state.error) return this.props.children

    const height = this.props.fullScreen ? 'min-h-screen' : 'min-h-[60vh]'

    return (
      <div className={`${height} flex items-center justify-center p-6`}>
        <div className="card max-w-lg text-center">
          <AlertTriangle className="mx-auto mb-3 text-red-400" size={28} />
          <h2 className="section-title mb-2">Something broke</h2>

          {import.meta.env.DEV ? (
            <p className="text-sm text-chalk-400 mb-4 font-mono break-words">
              {this.state.error.message}
            </p>
          ) : (
            <p className="text-sm text-chalk-400 mb-4">
              This page crashed. Try again, or go back to the home page.
            </p>
          )}

          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <button onClick={this.handleRetry} className="btn-secondary">
              Try again
            </button>
            <button
              onClick={() => window.location.assign('/home')}
              className="btn-primary"
            >
              Go to Home
            </button>
          </div>
        </div>
      </div>
    )
  }
}