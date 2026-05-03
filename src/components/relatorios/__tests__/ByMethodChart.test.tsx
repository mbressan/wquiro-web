import { render, screen } from '@testing-library/react'
import { ByMethodChart } from '../ByMethodChart'

beforeAll(() => {
  globalThis.ResizeObserver = class {
    observe() {}
    unobserve() {}
    disconnect() {}
  }
})

describe('ByMethodChart', () => {
  it('shows empty state when data is empty', () => {
    render(<ByMethodChart data={{}} />)
    expect(screen.getByText('Nenhuma receita registrada no período.')).toBeInTheDocument()
  })

  it('shows empty state when all amounts are zero', () => {
    render(<ByMethodChart data={{ pix: '0', credit_card: '0.00' }} />)
    expect(screen.getByText('Nenhuma receita registrada no período.')).toBeInTheDocument()
  })

  it('renders chart when there is data', () => {
    const { container } = render(
      <ByMethodChart data={{ pix: '100.00', credit_card: '200.00' }} />
    )
    expect(screen.queryByText('Nenhuma receita registrada no período.')).not.toBeInTheDocument()
    expect(container.firstChild).toBeInTheDocument()
  })
})
