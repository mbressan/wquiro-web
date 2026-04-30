import { render, screen, fireEvent } from '@testing-library/react'
import { PeriodSelector } from '../PeriodSelector'
import type { PeriodOption, PeriodValue } from '@/types/relatorios'

describe('PeriodSelector', () => {
  it('renders all period options', () => {
    render(<PeriodSelector value="this_month" onChange={() => {}} />)
    expect(screen.getByText('Este mês')).toBeInTheDocument()
    expect(screen.getByText('Mês anterior')).toBeInTheDocument()
    expect(screen.getByText('Últimos 3 meses')).toBeInTheDocument()
    expect(screen.getByText('Este ano')).toBeInTheDocument()
  })

  it('calls onChange with resolved period when selection changes', () => {
    const handleChange = vi.fn()
    render(<PeriodSelector value="this_month" onChange={handleChange} />)
    const select = screen.getByRole('combobox')
    fireEvent.change(select, { target: { value: 'this_year' } })
    expect(handleChange).toHaveBeenCalledOnce()
    const called: PeriodValue = handleChange.mock.calls[0][0]
    expect(called.preset).toBe('this_year')
    expect(called.period).toBe('year')
  })

  it('resolves this_month with period=month', () => {
    const handleChange = vi.fn()
    render(<PeriodSelector value="this_month" onChange={handleChange} />)
    fireEvent.change(screen.getByRole('combobox'), { target: { value: 'this_month' } })
    const called: PeriodValue = handleChange.mock.calls[0][0]
    expect(called.period).toBe('month')
  })

  it('resolves last_3_months with period=quarter', () => {
    const handleChange = vi.fn()
    render(<PeriodSelector value="this_month" onChange={handleChange} />)
    fireEvent.change(screen.getByRole('combobox'), { target: { value: 'last_3_months' } })
    const called: PeriodValue = handleChange.mock.calls[0][0]
    expect(called.period).toBe('quarter')
  })

  it('has the current value selected', () => {
    render(<PeriodSelector value={'last_month' as PeriodOption} onChange={() => {}} />)
    const select = screen.getByRole('combobox') as HTMLSelectElement
    expect(select.value).toBe('last_month')
  })
})
