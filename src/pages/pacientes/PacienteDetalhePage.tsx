import { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Download, Phone, Mail, MapPin, CalendarDays, FileText, Activity, ChevronRight } from 'lucide-react';
import { toast } from 'sonner';
import { usePatient, useUpdatePatient } from '@/hooks/usePatients';
import { PatientForm } from '@/components/pacientes/PatientForm';
import { PatientTimeline } from '@/components/pacientes/PatientTimeline';
import { TagBadge } from '@/components/pacientes/TagBadge';
import { Button, Modal, PageHeaderBack, PageContainer } from '@/components/ui';
import type { PatientCreate } from '@/types/patient';

export default function PacienteDetalhePage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { data: patient, isLoading } = usePatient(id!);
  const updatePatient = useUpdatePatient(id!);
  const [showEditModal, setShowEditModal] = useState(false);

  function handleUpdate(data: PatientCreate) {
    updatePatient.mutate(data, {
      onSuccess: () => {
        setShowEditModal(false);
        toast.success('Paciente atualizado com sucesso!');
      },
      onError: () => {
        toast.error('Erro ao atualizar paciente.');
      },
    });
  }

  if (isLoading) {
    return (
      <div className="flex h-64 items-center justify-center text-sm text-gray-500">
        Carregando...
      </div>
    );
  }

  if (!patient) {
    return (
      <div className="flex h-64 flex-col items-center justify-center gap-4">
        <p className="text-gray-500">Paciente não encontrado.</p>
        <button onClick={() => navigate('/pacientes')} className="text-primary-600 hover:underline text-sm">
          Voltar para lista
        </button>
      </div>
    );
  }

  const quickLinks = [
    {
      label: 'Consultas',
      icon: CalendarDays,
      to: `/pacientes/${patient.id}/consultas`,
      description: 'Histórico de agendamentos',
    },
    {
      label: 'Prontuário',
      icon: FileText,
      to: `/pacientes/${patient.id}/prontuario`,
      description: 'Registros clínicos',
    },
    {
      label: 'Histórico Postural',
      icon: Activity,
      to: `/pacientes/${patient.id}/postural`,
      description: 'Avaliações posturais comparativas',
    },
  ];

  return (
    <PageContainer size="md">
      <PageHeaderBack
        title={patient.name}
        onBack={() => navigate('/pacientes')}
        badge={
          patient.is_new_patient ? (
            <span className="rounded-full bg-emerald-100 px-2 py-0.5 text-xs font-medium text-emerald-700">
              Novo Paciente
            </span>
          ) : undefined
        }
        actions={
          <div className="flex items-center gap-2">
            <Button size="sm" variant="secondary" onClick={() => setShowEditModal(true)}>
              Editar
            </Button>
            <a
              href={`/api/v1/pacientes/${patient.id}/export/`}
              target="_blank"
              rel="noreferrer"
              className="inline-flex items-center gap-1.5 rounded-lg border border-gray-300 bg-white px-3 py-1.5 text-xs font-medium text-gray-700 transition-colors hover:bg-gray-50"
            >
              <Download className="h-4 w-4" />
              Exportar LGPD
            </a>
          </div>
        }
      />

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        {/* Coluna esquerda */}
        <div className="space-y-4">
          {/* Dados cadastrais */}
          <div className="rounded-xl border border-gray-200 bg-white shadow-sm">
            <div className="border-b border-gray-100 px-4 py-3">
              <h2 className="text-sm font-semibold text-gray-900">Dados Cadastrais</h2>
            </div>
            <div className="px-4 py-3 space-y-2">
              <ul className="space-y-2 text-sm text-gray-700">
                {patient.phone && (
                  <li className="flex items-center gap-2">
                    <Phone className="h-4 w-4 text-gray-400 shrink-0" />
                    {patient.phone}
                  </li>
                )}
                {patient.email && (
                  <li className="flex items-center gap-2">
                    <Mail className="h-4 w-4 text-gray-400 shrink-0" />
                    {patient.email}
                  </li>
                )}
                {patient.cpf && <li className="text-gray-600">CPF: {patient.cpf}</li>}
                {patient.date_of_birth && (
                  <li className="text-gray-600">
                    Nascimento:{' '}
                    {new Date(patient.date_of_birth).toLocaleDateString('pt-BR')}
                  </li>
                )}
                {patient.profession && (
                  <li className="text-gray-600">Profissão: {patient.profession}</li>
                )}
                {(patient.city || patient.state) && (
                  <li className="flex items-center gap-2">
                    <MapPin className="h-4 w-4 text-gray-400 shrink-0" />
                    {[patient.city, patient.state].filter(Boolean).join(', ')}
                  </li>
                )}
              </ul>

              {patient.tags.length > 0 && (
                <div className="pt-3 border-t border-gray-100">
                  <p className="mb-1.5 text-xs font-medium text-gray-500">Tags</p>
                  <div className="flex flex-wrap gap-1">
                    {patient.tags.map((tag) => (
                      <TagBadge key={tag.id} tag={tag} />
                    ))}
                  </div>
                </div>
              )}

              {patient.notes && (
                <div className="pt-3 border-t border-gray-100">
                  <p className="mb-1 text-xs font-medium text-gray-500">Observações</p>
                  <p className="text-sm text-gray-700">{patient.notes}</p>
                </div>
              )}
            </div>
          </div>

          {/* Atalhos de navegação */}
          <div className="rounded-xl border border-gray-200 bg-white shadow-sm">
            <div className="border-b border-gray-100 px-4 py-3">
              <h2 className="text-sm font-semibold text-gray-900">Seções</h2>
            </div>
            <div className="divide-y divide-gray-100">
              {quickLinks.map(({ label, icon: Icon, to, description }) => (
                <button
                  key={to}
                  onClick={() => navigate(to)}
                  className="flex w-full items-center gap-3 px-4 py-3 text-left transition-colors hover:bg-gray-50"
                >
                  <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-primary-50">
                    <Icon className="h-4 w-4 text-primary-600" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-gray-900">{label}</p>
                    <p className="text-xs text-gray-500">{description}</p>
                  </div>
                  <ChevronRight className="h-4 w-4 shrink-0 text-gray-400" />
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Coluna direita — Timeline */}
        <div className="lg:col-span-2">
          <div className="rounded-xl border border-gray-200 bg-white shadow-sm">
            <div className="border-b border-gray-100 px-4 py-3">
              <h2 className="text-sm font-semibold text-gray-900">Histórico</h2>
            </div>
            <div className="px-4 py-4">
              <PatientTimeline events={patient.timeline} />
            </div>
          </div>
        </div>
      </div>

      {showEditModal && (
        <Modal title="Editar Paciente" onClose={() => setShowEditModal(false)} size="lg">
          <PatientForm
            defaultValues={patient}
            onSubmit={handleUpdate}
            isLoading={updatePatient.isPending}
            error={updatePatient.isError ? 'Erro ao salvar. Verifique os dados.' : null}
            onCancel={() => setShowEditModal(false)}
          />
        </Modal>
      )}
    </PageContainer>
  );
}
