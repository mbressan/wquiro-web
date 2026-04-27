import type { Patient } from '@/types/patient';
import { TagBadge } from './TagBadge';

interface PatientTableProps {
  patients: Patient[];
  onRowClick: (patient: Patient) => void;
}

export function PatientTable({ patients, onRowClick }: PatientTableProps) {
  if (patients.length === 0) {
    return (
      <div className="rounded-lg border border-dashed border-gray-300 py-12 text-center text-gray-500">
        Nenhum paciente encontrado.
      </div>
    );
  }

  return (
    <div className="overflow-hidden rounded-lg border border-gray-200">
      <table className="w-full text-sm">
        <thead className="bg-gray-50">
          <tr>
            <th className="px-4 py-3 text-left font-medium text-gray-600">Nome</th>
            <th className="px-4 py-3 text-left font-medium text-gray-600">Telefone</th>
            <th className="px-4 py-3 text-left font-medium text-gray-600">E-mail</th>
            <th className="px-4 py-3 text-left font-medium text-gray-600">Tags</th>
            <th className="px-4 py-3 text-left font-medium text-gray-600">Status</th>
            <th className="px-4 py-3 text-right font-medium text-gray-600">Ações</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-gray-100 bg-white">
          {patients.map((p) => (
            <tr
              key={p.id}
              className="cursor-pointer hover:bg-gray-50"
              onClick={() => onRowClick(p)}
            >
              <td className="px-4 py-3 font-medium text-gray-900">
                <span>{p.name}</span>
                {p.is_new_patient && (
                  <span className="ml-2 inline-flex items-center rounded-full bg-emerald-100 px-2 py-0.5 text-xs font-medium text-emerald-700">
                    Novo
                  </span>
                )}
              </td>
              <td className="px-4 py-3 text-gray-600">{p.phone || '—'}</td>
              <td className="px-4 py-3 text-gray-600">{p.email || '—'}</td>
              <td className="px-4 py-3">
                {p.tags.length > 0 ? (
                  <div className="flex flex-wrap gap-1">
                    {p.tags.slice(0, 3).map((tag) => (
                      <TagBadge key={tag.id} tag={tag} />
                    ))}
                    {p.tags.length > 3 && (
                      <span className="inline-flex items-center rounded-full bg-gray-100 px-2 py-0.5 text-xs font-medium text-gray-600">
                        +{p.tags.length - 3}
                      </span>
                    )}
                  </div>
                ) : (
                  <span className="text-gray-400">—</span>
                )}
              </td>
              <td className="px-4 py-3">
                {p.status === 'active' ? (
                  <span className="inline-flex items-center rounded-full bg-green-100 px-2.5 py-0.5 text-xs font-medium text-green-700">
                    Ativo
                  </span>
                ) : (
                  <span className="inline-flex items-center rounded-full bg-gray-100 px-2.5 py-0.5 text-xs font-medium text-gray-600">
                    Inativo
                  </span>
                )}
              </td>
              <td className="px-4 py-3 text-right">
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    onRowClick(p);
                  }}
                  className="rounded px-2 py-1 text-xs font-medium text-blue-600 hover:bg-blue-50"
                >
                  Ver
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
