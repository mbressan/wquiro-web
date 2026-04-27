import { ArrowLeft } from 'lucide-react';

// ─── PageHeader (tela simples) ────────────────────────────────────────────────

interface PageHeaderProps {
  title: string;
  subtitle?: string;
  actions?: React.ReactNode;
  className?: string;
}

export function PageHeader({ title, subtitle, actions, className = '' }: PageHeaderProps) {
  return (
    <div className={['mb-6 flex items-start justify-between gap-4', className].join(' ')}>
      <div>
        <h1 className="text-2xl font-bold text-gray-900">{title}</h1>
        {subtitle && <p className="mt-0.5 text-sm text-gray-500">{subtitle}</p>}
      </div>
      {actions && <div className="flex shrink-0 items-center gap-2">{actions}</div>}
    </div>
  );
}

// ─── PageHeaderBack (com breadcrumb/voltar) ───────────────────────────────────

interface PageHeaderBackProps {
  title: string;
  subtitle?: string;
  onBack: () => void;
  backLabel?: string;
  actions?: React.ReactNode;
  badge?: React.ReactNode;
  className?: string;
}

export function PageHeaderBack({
  title,
  subtitle,
  onBack,
  backLabel = 'Voltar',
  actions,
  badge,
  className = '',
}: PageHeaderBackProps) {
  return (
    <div className={['mb-6', className].join(' ')}>
      <button
        onClick={onBack}
        className="mb-2 flex items-center gap-1 text-sm text-gray-500 hover:text-gray-700 transition-colors"
      >
        <ArrowLeft className="h-3.5 w-3.5" />
        {backLabel}
      </button>
      <div className="flex items-start justify-between gap-4">
        <div>
          <div className="flex items-center gap-2.5">
            <h1 className="text-2xl font-bold text-gray-900">{title}</h1>
            {badge}
          </div>
          {subtitle && <p className="mt-0.5 text-sm text-gray-500">{subtitle}</p>}
        </div>
        {actions && <div className="flex shrink-0 items-center gap-2">{actions}</div>}
      </div>
    </div>
  );
}
