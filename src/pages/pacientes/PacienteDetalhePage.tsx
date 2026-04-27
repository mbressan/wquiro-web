import { useParams, useNavigate } from 'react-router-dom';
import { Download, Phone, Mail, MapPin } from 'lucide-react';
import { usePatient } from '@/hooks/usePatients';
import { PatientTimeline } from '@/components/pacientes/PatientTimeline';
import { TagBadge } from '@/components/pacientes/TagBadge';
import { PageHeaderBack, Button, PageContainer } from '@/components/ui';

export default function PacienteDetalhePage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { data: patient, isLoading } = usePatient(id!);

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
        <button onClick={() => navigate('/pacientes')} className="text-blue-600 hover:underline">
          Voltar para lista
        </button>
      </div>
    );
  }

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
          <a
            href={`/api/v1/pacientes/${patient.id}/export/`}
            target="_blank"
            rel="noreferrer"
            className="inline-flex items-center gap-1.5 rounded-lg border border-gray-300 bg-white px-3 py-1.5 text-xs font-medium text-gray-700 transition-colors hover:bg-gray-50"
          >
            <Download className="h-4 w-4" />
            Exportar LGPD
          </a>
        }
      />

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        {/* Dados cadastrais */}
        <div className="lg:col-span-1 space-y-4">
          <div className="rounded-lg border bg-white p-4 shadow-sm">
            <h2 className="mb-3 font-semibold text-gray-800">Dados Cadastrais</h2>
            <ul className="space-y-2 text-sm text-gray-700">
              {patient.phone && (
                <li className="flex items-center gap-2">
                  <Phone className="h-4 w-4 text-gray-400" />
                  {patient.phone}
                </li>
              )}
              {patient.email && (
                <li className="flex items-center gap-2">
                  <Mail className="h-4 w-4 text-gray-400" />
                  {patient.email}
                </li>
              )}
              {patient.cpf && <li>CPF: {patient.cpf}</li>}
              {patient.date_of_birth && (
                <li>
                  Data de nascimento:{' '}
                  {new Date(patient.date_of_birth).toLocaleDateString('pt-BR')}
                </li>
              )}
              {patient.profession && <li>Profissão: {patient.profession}</li>}
              {(patient.city || patient.state) && (
                <li className="flex items-center gap-2">
                  <MapPin className="h-4 w-4 text-gray-400" />
                  {[patient.city, patient.state].filter(Boolean).join(', ')}
                </li>
              )}
            </ul>

            {patient.tags.length > 0 && (
              <div className="mt-3">
                <p className="mb-1 text-xs text-gray-500">Tags</p>
                <div className="flex flex-wrap gap-1">
                  {patient.tags.map((tag) => (
                    <TagBadge key={tag.id} tag={tag} />
                  ))}
                </div>
              </div>
            )}

            {patient.notes && (
              <div className="mt-3">
                <p className="mb-1 text-xs text-gray-500">Observações</p>
                <p className="text-sm text-gray-700">{patient.notes}</p>
              </div>
            )}
          </div>

          <div className="flex gap-2">
            <button
              onClick={() => navigate(`/pacientes/${patient.id}/consultas`)}
              className="flex-1 rounded-md border py-2 text-sm text-center hover:bg-gray-50"
            >
              Consultas
            </button>
            <button
              onClick={() => navigate(`/pacientes/${patient.id}/prontuario`)}
              className="flex-1 rounded-md border py-2 text-sm text-center hover:bg-gray-50"
            >
              Prontuário
            </button>
          </div>
        </div>

        {/* Timeline */}
        <div className="lg:col-span-2">
          <div className="rounded-lg border bg-white p-4 shadow-sm">
            <h2 className="mb-4 font-semibold text-gray-800">Histórico</h2>
            <PatientTimeline events={patient.timeline} />
          </div>
        </div>
      </div>
    </PageContainer>
  );
}
