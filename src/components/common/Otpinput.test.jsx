import { describe, it, expect } from 'vitest'
import { useState } from 'react'
import { render, screen, fireEvent } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import OtpInput from './OtpInput'

function Harness({ initial = '', disabled = false }) {
  const [value, setValue] = useState(initial)
  return (
    <>
      <OtpInput value={value} onChange={setValue} disabled={disabled} />
      <output data-testid="value">{value}</output>
    </>
  )
}

const box = (n) => screen.getByLabelText(`Digit ${n}`)
const current = () => screen.getByTestId('value').textContent

describe('OtpInput', () => {
  it('renders six boxes', () => {
    render(<Harness />)
    expect(screen.getAllByLabelText(/Digit \d/)).toHaveLength(6)
  })

  it('moves to the next box while typing', async () => {
    const user = userEvent.setup()
    render(<Harness />)
    await user.click(box(1))
    await user.keyboard('123456')

    expect(current()).toBe('123456')
    expect(box(6)).toHaveFocus()
  })

  it('ignores letters', async () => {
    const user = userEvent.setup()
    render(<Harness />)
    await user.click(box(1))
    await user.keyboard('1a2b')

    expect(current()).toBe('12')
  })

  it('fills the boxes from a pasted code and drops non-digits', () => {
    render(<Harness />)
    fireEvent.paste(box(1), { clipboardData: { getData: () => '12ab34' } })

    expect(current()).toBe('1234')
    expect(box(5)).toHaveFocus()
  })

  it('cuts a long paste to six digits', () => {
    render(<Harness />)
    fireEvent.paste(box(1), { clipboardData: { getData: () => '123456789' } })

    expect(current()).toBe('123456')
  })

  it('Backspace on an empty box goes to the previous box', async () => {
    const user = userEvent.setup()
    render(<Harness initial="12" />)
    await user.click(box(3))
    await user.keyboard('{Backspace}')

    expect(box(2)).toHaveFocus()
  })

  it('arrow keys move between boxes', async () => {
    const user = userEvent.setup()
    render(<Harness initial="123" />)
    await user.click(box(2))
    await user.keyboard('{ArrowRight}')
    expect(box(3)).toHaveFocus()
    await user.keyboard('{ArrowLeft}{ArrowLeft}')
    expect(box(1)).toHaveFocus()
  })

  it('disables every box when disabled', () => {
    render(<Harness disabled />)
    screen.getAllByLabelText(/Digit \d/).forEach((el) => expect(el).toBeDisabled())
  })
})