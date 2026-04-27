import type { Specialty } from '@/types/professional';

interface SpecialtyTableProps {
  specialties: Specialty[];
  onEdit: (s: Specialty) => void;
  onDeactivate: (id: string) => void;
  isAdmin: boolean;
}

export function SpecialtyTable({
  specialties,
  onEdit,
  onDeactivate,
  isAdmin,
}: SpecialtyTableProps) {
  if (specialties.length === 0) {
    return (
      <div className="rounded-lg border border-dashed border-gray-300 py-12 text-center text-gray-500">
        Nenhuma especialidade encontrada.
      </div>
    );
  }

  return (
    <div className="overflow-hidden rounded-lg border border-gray-200">
      <table className="w-full text-sm">
        <thead className="bg-gray-50">
          <tr>
            <th className="px-4 py-3 text-left font-medium text-gray-600">Nome</th>
            <th className="px-4 py-3 text-left font-medium text-gray-600">Tipo</th>
            <th className="px-4 py-3 text-left font-medium text-gray-600">Profissionais</th>
            <th className="px-4 py-3 text-left font-medium text-gray-600">Status</th>
            {isAdmin && (
              <th className="px-4 py-3 text-right font-medium text-gray-600">Ações</th>
            )}
          </tr>
        </thead>
        <tbody className="divide-y divide-gray-100 bg-white">
          {specialties.map((s) => (
            <tr key={s.id} className="hover:bg-gray-50">
              <td className="px-4 py-3 font-medium text-gray-900">{s.name}</td>
              <td className="px-4 py-3">
                {s.is_predefined ? (
                  <span className="inline-flex items-center rounded-full bg-purple-100 px-2.5 py-0.5 text-xs font-medium text-purple-700">
                    Pré-definida
                  </span>
                ) : (
                  <span className="inline-flex items-center rounded-full bg-gray-100 px-2.5 py-0.5 text-xs font-medium text-gray-600">
                    Personalizada
                  </span>
                )}
              </td>
              <td className="px-4 py-3 text-gray-600">{s.professionals_count}</td>
              <td className="px-4 py-3">
                {s.is_active ? (
                  <span className="inline-flex items-center rounded-full bg-green-100 px-2.5 py-0.5 text-xs font-medium text-green-700">
                    Ativa
                  </span>
                ) : (
                  <span className="inline-flex items-center rounded-full bg-gray-100 px-2.5 py-0.5 text-xs font-medium text-gray-600">
                    Inativa
                  </span>
                )}
              </td>
              {isAdmin && (
                <td className="px-4 py-3 text-right">
                  <div className="flex justify-end gap-2">
                    <button
                      onClick={() => onEdit(s)}
                      disabled={s.is_predefined}
                      title={s.is_predefined ? 'Especialidades pré-definidas não podem ser editadas' : undefined}
                      className="rounded px-2 py-1 text-xs font-medium text-blue-600 hover:bg-blue-50 disabled:cursor-not-allowed disabled:opacity-40"
                    >
                      Editar
                    </button>
                    {s.is_active && (
                      <button
                        onClick={() => {
                          if (window.confirm(`Desativar "${s.name}"?`)) {
                            onDeactivate(s.id);
                          }
                        }}
                        disabled={s.is_predefined}
                        title={s.is_predefined ? 'Especialidades pré-definidas não podem ser desativadas' : undefined}
                        className="rounded px-2 py-1 text-xs font-medium text-red-600 hover:bg-red-50 disabled:cursor-not-allowed disabled:opacity-40"
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
