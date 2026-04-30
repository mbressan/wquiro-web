import { render, screen } from '@testing-library/react'
import { ProfessionalMetricsTable } from '../ProfessionalMetricsTable'
import type { ProfessionalMetric } from '@/types/relatorios'

const mockData: ProfessionalMetric[] = [
  {
    id: '1',
    name: 'Dr. João Silva',
    total: 20,
    completed: 18,
    no_show: 2,
    no_show_rate: '10.00',
    revenue: '3000.00',
    avg_ticket: '150.00',
  },
]

describe('ProfessionalMetricsTable', () => {
  it('shows empty state for empty list', () => {
    render(<ProfessionalMetricsTable data={[]} />)
    expect(screen.getByText('Nenhum profissional com dados no período.')).toBeInTheDocument()
  })

  it('renders professional name and metrics', () => {
    render(<ProfessionalMetricsTable data={mockData} />)
    expect(screen.getByText('Dr. João Silva')).toBeInTheDocument()
    expect(screen.getByText('20')).toBeInTheDocument()
    expect(screen.getByText('18')).toBeInTheDocument()
    expect(screen.getByText('2')).toBeInTheDocument()
    expect(screen.getByText('10.00%')).toBeInTheDocument()
  })

  it('formats revenue as pt-BR currency', () => {
    render(<ProfessionalMetricsTable data={mockData} />)
    expect(screen.getByText(/R\$.*3\.000/)).toBeInTheDocument()
  })

  it('formats avg_ticket as pt-BR currency', () => {
    render(<ProfessionalMetricsTable data={mockData} />)
    expect(screen.getByText(/R\$.*150/)).toBeInTheDocument()
  })
})
