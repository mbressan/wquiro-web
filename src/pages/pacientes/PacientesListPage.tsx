import { useState, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { Search, Plus, X } from 'lucide-react';
import { usePatients, useCreatePatient, usePatientTags } from '@/hooks/usePatients';
import { PatientTable } from '@/components/pacientes/PatientTable';
import { PatientForm } from '@/components/pacientes/PatientForm';
import { Button, PageHeader, Modal, PageContainer } from '@/components/ui';
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
    <PageContainer>
      <PageHeader
        title="Pacientes"
        actions={
          <Button size="sm" onClick={() => setShowModal(true)}>
            <Plus className="h-4 w-4" />
            Novo Paciente
          </Button>
        }
      />

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
            className="block w-full rounded-lg border border-gray-300 bg-white py-2.5 pl-9 pr-3 text-sm placeholder-gray-400 transition-colors hover:border-gray-400 focus:border-primary-500 focus:outline-none focus:ring-2 focus:ring-primary-500"
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
                    ? 'bg-primary-600 text-white'
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
      ) : (
        <PatientTable
          patients={data?.results ?? []}
          onRowClick={(p) => navigate(`/pacientes/${p.id}`)}
        />
      )}

      {data && data.count > 20 && (
        <div className="mt-6 flex items-center justify-center gap-4">
          <Button variant="secondary" size="sm" disabled={!data.previous} onClick={() => setPage((p) => p - 1)}>
            Anterior
          </Button>
          <span className="text-sm text-gray-600">
            Página {page} · {data.count} pacientes
          </span>
          <Button variant="secondary" size="sm" disabled={!data.next} onClick={() => setPage((p) => p + 1)}>
            Próxima
          </Button>
        </div>
      )}

      {showModal && (
        <Modal title="Novo Paciente" onClose={() => setShowModal(false)} size="lg">
          <PatientForm
            onSubmit={handleCreate}
            isLoading={createPatient.isPending}
            error={createPatient.isError ? 'Erro ao salvar. Verifique os dados.' : null}
            onCancel={() => setShowModal(false)}
          />
        </Modal>
      )}
    </PageContainer>
  );
}
