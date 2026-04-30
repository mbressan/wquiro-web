import { render, screen } from '@testing-library/react'
import { TrendingUp } from 'lucide-react'
import { KPICard } from '../KPICard'

describe('KPICard', () => {
  it('renders title and formatted currency value', () => {
    render(<KPICard title="Receita do mês" value="1500.00" icon={TrendingUp} format="currency" />)
    expect(screen.getByText('Receita do mês')).toBeInTheDocument()
    expect(screen.getByText(/R\$.*1\.500/)).toBeInTheDocument()
  })

  it('renders percent format', () => {
    render(<KPICard title="Taxa de falta" value="20" icon={TrendingUp} format="percent" />)
    expect(screen.getByText('20%')).toBeInTheDocument()
  })

  it('renders number format as-is', () => {
    render(<KPICard title="Consultas hoje" value={42} icon={TrendingUp} format="number" />)
    expect(screen.getByText('42')).toBeInTheDocument()
  })

  it('shows skeleton when loading', () => {
    const { container } = render(<KPICard title="KPI" value={0} icon={TrendingUp} loading />)
    expect(container.querySelector('[class*="animate-pulse"], [class*="skeleton"], [class*="h-8"]')).toBeInTheDocument()
    expect(screen.queryByText('0')).not.toBeInTheDocument()
  })

  it('shows positive change with green style', () => {
    render(<KPICard title="KPI" value={10} icon={TrendingUp} change={5} />)
    const change = screen.getByText(/\+5%/)
    expect(change).toHaveClass('text-emerald-600')
  })

  it('shows negative change with red style', () => {
    render(<KPICard title="KPI" value={10} icon={TrendingUp} change={-3} />)
    const change = screen.getByText(/-3%/)
    expect(change).toHaveClass('text-red-500')
  })

  it('shows "Atualizando..." badge when isStale', () => {
    render(<KPICard title="KPI" value={10} icon={TrendingUp} isStale />)
    expect(screen.getByText('Atualizando...')).toBeInTheDocument()
  })

  it('does not show stale badge when not stale', () => {
    render(<KPICard title="KPI" value={10} icon={TrendingUp} />)
    expect(screen.queryByText('Atualizando...')).not.toBeInTheDocument()
  })
})
