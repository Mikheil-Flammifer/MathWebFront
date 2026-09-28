import { useRef } from 'react'

export default function OtpInput({ value, onChange, length = 6, disabled }) {
  const refs = useRef([])

  const focus = (i) => refs.current[i]?.focus()

  const handleChange = (i, e) => {
    const ch = e.target.value.replace(/\D/g, '').slice(-1)
    onChange((value.slice(0, i) + ch + value.slice(i + 1)).slice(0, length))
    if (ch && i < length - 1) focus(i + 1)
  }

  const handleKeyDown = (i, e) => {
    if (e.key === 'Backspace' && !value[i] && i > 0) focus(i - 1)
    if (e.key === 'ArrowLeft' && i > 0) focus(i - 1)
    if (e.key === 'ArrowRight' && i < length - 1) focus(i + 1)
  }

  const handlePaste = (e) => {
    e.preventDefault()
    const pasted = e.clipboardData.getData('text').replace(/\D/g, '').slice(0, length)
    onChange(pasted)
    focus(Math.min(pasted.length, length - 1))
  }

  return (
    <div className="grid grid-cols-6 gap-2.5">
      {Array.from({ length }, (_, i) => (
        <input
          key={i}
          ref={(el) => (refs.current[i] = el)}
          value={value[i] || ''}
          onChange={(e) => handleChange(i, e)}
          onKeyDown={(e) => handleKeyDown(i, e)}
          onPaste={handlePaste}
          onFocus={(e) => e.target.select()}
          inputMode="numeric"
          autoComplete={i === 0 ? 'one-time-code' : 'off'}
          disabled={disabled}
          aria-label={`Digit ${i + 1}`}
          className="input-field h-14 px-0 text-center text-xl font-mono font-semibold"
        />
      ))}
    </div>
  )
}