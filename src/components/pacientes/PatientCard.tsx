import type { Patient } from '@/types/patient';
import { TagBadge } from './TagBadge';

interface PatientCardProps {
  patient: Patient;
  onClick?: () => void;
}

export function PatientCard({ patient, onClick }: PatientCardProps) {
  return (
    <div
      className="rounded-lg border bg-white p-4 shadow-sm hover:shadow-md transition-shadow cursor-pointer"
      onClick={onClick}
      role="button"
      tabIndex={0}
      onKeyDown={(e) => e.key === 'Enter' && onClick?.()}
    >
      <div className="flex items-start justify-between gap-2">
        <div className="min-w-0">
          <h3 className="truncate font-semibold text-gray-900">{patient.name}</h3>
          <p className="text-sm text-gray-500">{patient.phone}</p>
          {patient.email && (
            <p className="text-xs text-gray-400 truncate">{patient.email}</p>
          )}
        </div>
        {patient.is_new_patient && (
          <span className="shrink-0 rounded-full bg-green-100 px-2 py-0.5 text-xs font-medium text-green-700">
            Novo
          </span>
        )}
      </div>
      {patient.tags.length > 0 && (
        <div className="mt-2 flex flex-wrap gap-1">
          {patient.tags.map((tag) => (
            <TagBadge key={tag.id} tag={tag} />
          ))}
        </div>
      )}
    </div>
  );
}
