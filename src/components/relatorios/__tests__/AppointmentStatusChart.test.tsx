import { render, screen } from '@testing-library/react'
import { AppointmentStatusChart } from '../AppointmentStatusChart'

beforeAll(() => {
  globalThis.ResizeObserver = class {
    observe() {}
    unobserve() {}
    disconnect() {}
  }
})

describe('AppointmentStatusChart', () => {
  it('shows empty state when all values are zero', () => {
    render(<AppointmentStatusChart completed={0} no_show={0} cancelled={0} />)
    expect(screen.getByText('Nenhuma consulta no período selecionado.')).toBeInTheDocument()
  })

  it('renders chart when there is data', () => {
    const { container } = render(
      <AppointmentStatusChart completed={8} no_show={2} cancelled={0} />
    )
    expect(screen.queryByText('Nenhuma consulta no período selecionado.')).not.toBeInTheDocument()
    expect(container.firstChild).toBeInTheDocument()
  })
})
