import { useState } from 'react'
import { Eye, EyeOff } from 'lucide-react'

export default function FormField({ label, icon: Icon, error, hint, type = 'text', className = '', ...props }) {
  const [show, setShow] = useState(false)
  const isPassword = type === 'password'

  return (
    <div className={className}>
      {label && <label htmlFor={props.id} className="input-label">{label}</label>}
      <div className="relative">
        {Icon && (
          <Icon size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-chalk-500 pointer-events-none mobile-icon" />
        )}
        <input
          type={isPassword && show ? 'text' : type}
          className={`input-field ${Icon ? 'pl-12' : ''} ${isPassword ? 'pr-12' : ''} ${error ? 'border-red-500/60' : ''} touch-target`}
          {...props}
        />
        {isPassword && (
          <button
            type="button"
            tabIndex={-1}
            onClick={() => setShow((s) => !s)}
            aria-label={show ? 'Hide password' : 'Show password'}
            className="absolute right-1.5 top-1/2 -translate-y-1/2 btn-icon w-9 h-9 touch-target no-zoom"
          >
            {show ? <EyeOff size={18} /> : <Eye size={18} />}
          </button>
        )}
      </div>
      {error ? <p className="input-error">{error}</p> : hint ? <p className="input-hint">{hint}</p> : null}
    </div>
  )
}