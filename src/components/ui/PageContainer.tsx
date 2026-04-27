// PageContainer — wrapper padrão de todas as páginas do dashboard
// Garante: padding externo consistente + max-w semântico

type ContainerSize = 'sm' | 'md' | 'lg' | 'xl' | 'full';

const MAX_W: Record<ContainerSize, string> = {
  sm:   'max-w-2xl',   // listas estreitas: consultas, prontuários do paciente
  md:   'max-w-4xl',   // páginas de detalhe/edição: paciente, prontuário
  lg:   'max-w-5xl',   // padrão: pacientes, profissionais, financeiro, caixa
  xl:   'max-w-7xl',   // páginas largas: agenda (FullCalendar)
  full: 'w-full',      // sem restrição de largura
};

interface PageContainerProps {
  children: React.ReactNode;
  size?: ContainerSize;
  className?: string;
}

export function PageContainer({ children, size = 'lg', className = '' }: PageContainerProps) {
  return (
    <div
      className={[
        'mx-auto w-full px-4 py-6 sm:px-6',
        MAX_W[size],
        'space-y-6',
        className,
      ].join(' ')}
    >
      {children}
    </div>
  );
}
