import { render, screen } from '@testing-library/react'
import { RevenueChart } from '../RevenueChart'

// ResizeObserver is not available in jsdom
beforeAll(() => {
  global.ResizeObserver = class {
    observe() {}
    unobserve() {}
    disconnect() {}
  }
})

describe('RevenueChart', () => {
  it('shows empty state message when fewer than 2 data points', () => {
    render(<RevenueChart data={[]} period="month" />)
    expect(screen.getByText('Dados insuficientes para o período selecionado.')).toBeInTheDocument()
  })

  it('shows empty state message for single data point', () => {
    render(<RevenueChart data={[{ date: '2026-04-01', amount: '100.00' }]} period="month" />)
    expect(screen.getByText('Dados insuficientes para o período selecionado.')).toBeInTheDocument()
  })

  it('renders chart when 2+ data points are provided', () => {
    const data = [
      { date: '2026-04-01', amount: '100.00' },
      { date: '2026-04-02', amount: '200.00' },
    ]
    const { container } = render(<RevenueChart data={data} period="month" />)
    expect(screen.queryByText('Dados insuficientes para o período selecionado.')).not.toBeInTheDocument()
    expect(container.firstChild).toBeInTheDocument()
  })
})
