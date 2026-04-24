import { useState, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { Search, Plus, X } from 'lucide-react';
import { usePatients, useCreatePatient, usePatientTags } from '@/hooks/usePatients';
import { PatientCard } from '@/components/pacientes/PatientCard';
import { PatientForm } from '@/components/pacientes/PatientForm';
import type { PatientFilters, PatientCreate } from '@/types/patient';
import { toast } from 'sonner';

function useDebounce<T>(value: T, delay = 300): T {
  const [debounced, setDebounced] = useState(value);
  const timerRef = { current: 0 };

  // Simple inline debounce using useCallback and setTimeout
  const update = useCallback(
    (v: T) => {
      clearTimeout(timerRef.current);
      timerRef.current = window.setTimeout(() => setDebounced(v), delay);
    },
    [delay],
  );

  // Call update when value changes — using state pattern
  useState(() => {
    update(value);
  });

  return debounced;
}

export default function PacientesListPage() {
  const navigate = useNavigate();
  const [search, setSearch] = useState('');
  const [selectedTag, setSelectedTag] = useState('');
  const [page, setPage] = useState(1);
  const [showModal, setShowModal] = useState(false);

  const debouncedSearch = useDebounce(search);

  const filters: PatientFilters = {
    search: debouncedSearch || undefined,
    tags: selectedTag || undefined,
    page,
    page_size: 20,
  };

  const { data, isLoading, limitWarning } = usePatients(filters);
  const { data: tags } = usePatientTags();
  const createPatient = useCreatePatient();

  function handleCreate(formData: PatientCreate) {
    createPatient.mutate(formData, {
      onSuccess: () => {
        setShowModal(false);
        toast.success('Paciente cadastrado com sucesso!');
      },
      onError: () => {
        toast.error('Erro ao cadastrar paciente.');
      },
    });
  }

  return (
    <div className="mx-auto max-w-5xl px-4 py-6">
      <div className="mb-6 flex items-center justify-between">
        <h1 className="text-2xl font-bold text-gray-900">Pacientes</h1>
        <button
          onClick={() => setShowModal(true)}
          className="inline-flex items-center gap-2 rounded-md bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700"
        >
          <Plus className="h-4 w-4" />
          Novo Paciente
        </button>
      </div>

      {limitWarning && (
        <div className="mb-4 rounded-md bg-yellow-50 border border-yellow-200 px-4 py-3 text-sm text-yellow-800">
          Você está próximo do limite de pacientes do seu plano.{' '}
          <a href="/billing" className="font-medium underline">
            Faça upgrade
          </a>{' '}
          para continuar cadastrando.
        </div>
      )}

      <div className="mb-4 flex flex-wrap gap-3">
        <div className="relative flex-1 min-w-[200px]">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
          <input
            value={search}
            onChange={(e) => {
              setSearch(e.target.value);
              setPage(1);
            }}
            placeholder="Buscar por nome, CPF ou telefone..."
            className="w-full rounded-md border border-gray-300 py-2 pl-9 pr-3 text-sm focus:border-blue-500 focus:outline-none"
          />
        </div>

        {tags && tags.length > 0 && (
          <div className="flex flex-wrap gap-2 items-center">
            {tags.map((tag) => (
              <button
                key={tag.id}
                onClick={() => setSelectedTag(selectedTag === tag.name ? '' : tag.name)}
                className={`rounded-full px-3 py-1 text-xs font-medium transition-colors ${
                  selectedTag === tag.name
                    ? 'bg-blue-600 text-white'
                    : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                }`}
              >
                {tag.name} ({tag.patient_count})
              </button>
            ))}
            {selectedTag && (
              <button
                onClick={() => setSelectedTag('')}
                className="text-xs text-gray-500 hover:text-gray-700 flex items-center gap-1"
              >
                <X className="h-3 w-3" /> Limpar
              </button>
            )}
          </div>
        )}
      </div>

      {isLoading ? (
        <div className="py-12 text-center text-sm text-gray-500">Carregando...</div>
      ) : data?.results.length === 0 ? (
        <div className="py-12 text-center text-sm text-gray-500">
          Nenhum paciente encontrado.
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {data?.results.map((patient) => (
            <PatientCard
              key={patient.id}
              patient={patient}
              onClick={() => navigate(`/pacientes/${patient.id}`)}
            />
          ))}
        </div>
      )}

      {data && data.count > 20 && (
        <div className="mt-6 flex items-center justify-center gap-4">
          <button
            disabled={!data.previous}
            onClick={() => setPage((p) => p - 1)}
            className="rounded-md border px-3 py-1 text-sm disabled:opacity-40"
          >
            Anterior
          </button>
          <span className="text-sm text-gray-600">
            Página {page} · {data.count} pacientes
          </span>
          <button
            disabled={!data.next}
            onClick={() => setPage((p) => p + 1)}
            className="rounded-md border px-3 py-1 text-sm disabled:opacity-40"
          >
            Próxima
          </button>
        </div>
      )}

      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
          <div className="w-full max-w-2xl rounded-xl bg-white p-6 shadow-xl">
            <div className="mb-4 flex items-center justify-between">
              <h2 className="text-lg font-semibold">Novo Paciente</h2>
              <button
                onClick={() => setShowModal(false)}
                className="text-gray-400 hover:text-gray-600"
              >
                <X className="h-5 w-5" />
              </button>
            </div>
            <PatientForm
              onSubmit={handleCreate}
              isLoading={createPatient.isPending}
              error={createPatient.isError ? 'Erro ao salvar. Verifique os dados.' : null}
              onCancel={() => setShowModal(false)}
            />
          </div>
        </div>
      )}
    </div>
  );
}
