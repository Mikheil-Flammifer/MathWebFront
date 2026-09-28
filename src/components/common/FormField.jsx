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
          <Icon size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-chalk-500 pointer-events-none" />
        )}
        <input
          type={isPassword && show ? 'text' : type}
          className={`input-field ${Icon ? 'pl-10' : ''} ${isPassword ? 'pr-11' : ''} ${error ? 'border-red-500/60' : ''}`}
          {...props}
        />
        {isPassword && (
          <button
            type="button"
            tabIndex={-1}
            onClick={() => setShow((s) => !s)}
            aria-label={show ? 'Hide password' : 'Show password'}
            className="absolute right-1.5 top-1/2 -translate-y-1/2 btn-icon w-8 h-8"
          >
            {show ? <EyeOff size={16} /> : <Eye size={16} />}
          </button>
        )}
      </div>
      {error ? <p className="input-error">{error}</p> : hint ? <p className="input-hint">{hint}</p> : null}
    </div>
  )
}