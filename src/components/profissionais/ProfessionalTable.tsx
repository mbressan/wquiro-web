import type { Professional } from '@/types/professional';

interface ProfessionalTableProps {
  professionals: Professional[];
  onEdit: (p: Professional) => void;
  onDeactivate: (id: string) => void;
  isAdmin: boolean;
}

export function ProfessionalTable({
  professionals,
  onEdit,
  onDeactivate,
  isAdmin,
}: ProfessionalTableProps) {
  if (professionals.length === 0) {
    return (
      <div className="rounded-lg border border-dashed border-gray-300 py-12 text-center text-gray-500">
        Nenhum profissional encontrado.
      </div>
    );
  }

  return (
    <div className="overflow-hidden rounded-lg border border-gray-200">
      <table className="w-full text-sm">
        <thead className="bg-gray-50">
          <tr>
            <th className="px-4 py-3 text-left font-medium text-gray-600">Nome</th>
            <th className="px-4 py-3 text-left font-medium text-gray-600">E-mail</th>
            <th className="px-4 py-3 text-left font-medium text-gray-600">Especialidades</th>
            <th className="px-4 py-3 text-left font-medium text-gray-600">Comissão</th>
            <th className="px-4 py-3 text-left font-medium text-gray-600">Status</th>
            {isAdmin && (
              <th className="px-4 py-3 text-right font-medium text-gray-600">Ações</th>
            )}
          </tr>
        </thead>
        <tbody className="divide-y divide-gray-100 bg-white">
          {professionals.map((p) => (
            <tr key={p.id} className="hover:bg-gray-50">
              <td className="px-4 py-3 font-medium text-gray-900">{p.name}</td>
              <td className="px-4 py-3 text-gray-600">{p.email}</td>
              <td className="px-4 py-3">
                <SpecialtiesBadges specialties={p.specialties} />
              </td>
              <td className="px-4 py-3 text-gray-600">
                {p.commission_percentage != null ? `${p.commission_percentage}%` : '—'}
              </td>
              <td className="px-4 py-3">
                {p.is_active ? (
                  <span className="inline-flex items-center rounded-full bg-green-100 px-2.5 py-0.5 text-xs font-medium text-green-700">
                    Ativo
                  </span>
                ) : (
                  <span className="inline-flex items-center rounded-full bg-gray-100 px-2.5 py-0.5 text-xs font-medium text-gray-600">
                    Inativo
                  </span>
                )}
              </td>
              {isAdmin && (
                <td className="px-4 py-3 text-right">
                  <div className="flex justify-end gap-2">
                    <button
                      onClick={() => onEdit(p)}
                      className="rounded px-2 py-1 text-xs font-medium text-blue-600 hover:bg-blue-50"
                    >
                      Editar
                    </button>
                    {p.is_active && (
                      <button
                        onClick={() => {
                          if (window.confirm(`Desativar ${p.name}?`)) {
                            onDeactivate(p.id);
                          }
                        }}
                        className="rounded px-2 py-1 text-xs font-medium text-red-600 hover:bg-red-50"
                      >
                        Desativar
                      </button>
                    )}
                  </div>
                </td>
              )}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

function SpecialtiesBadges({ specialties }: { specialties: string[] }) {
  if (!specialties || specialties.length === 0) return <span className="text-gray-400">—</span>;

  const visible = specialties.slice(0, 2);
  const extra = specialties.length - 2;

  return (
    <div className="flex flex-wrap gap-1">
      {visible.map((s) => (
        <span
          key={s}
          className="inline-flex items-center rounded-full bg-blue-100 px-2 py-0.5 text-xs font-medium text-blue-700"
        >
          {s}
        </span>
      ))}
      {extra > 0 && (
        <span className="inline-flex items-center rounded-full bg-gray-100 px-2 py-0.5 text-xs font-medium text-gray-600">
          +{extra}
        </span>
      )}
    </div>
  );
}
