import { useState } from 'react';
import { toast } from 'sonner';
import { Plus } from 'lucide-react';
import { useAuthStore } from '@/stores/authStore';
import { PageHeader, Button, StatusBadge, PageContainer, SkeletonTableRows } from '@/components/ui';
import {
  useProfessionalsAdmin,
  useDeactivateProfessional,
  useInvites,
  useResendInvite,
  useCancelInvite,
} from '@/hooks/useProfessionals';
import { useSpecialties, useDeactivateSpecialty } from '@/hooks/useSpecialties';
import { ProfessionalTable } from '@/components/profissionais/ProfessionalTable';
import { ProfessionalModal } from '@/components/profissionais/ProfessionalModal';
import { InviteModal } from '@/components/profissionais/InviteModal';
import { SpecialtyTable } from '@/components/profissionais/SpecialtyTable';
import { SpecialtyModal } from '@/components/profissionais/SpecialtyModal';
import type { Professional, Specialty, TeamInvite } from '@/types/professional';

type Tab = 'ativos' | 'inativos' | 'convites' | 'especialidades';

function InviteStatusBadge({ invite }: { invite: TeamInvite }) {
  const status = invite.accepted_at
    ? 'accepted'
    : invite.cancelled_at
    ? 'cancelled'
    : invite.is_pending
    ? 'pending'
    : 'expired';
  return <StatusBadge type="invite" status={status} />;
}

export default function ProfissionaisPage() {
  const user = useAuthStore((s) => s.user);
  const isAdmin = user?.role === 'admin';

  const [activeTab, setActiveTab] = useState<Tab>('ativos');
  const [selectedProfessional, setSelectedProfessional] = useState<Professional | undefined>();
  const [showProfessionalModal, setShowProfessionalModal] = useState(false);
  const [showInviteModal, setShowInviteModal] = useState(false);
  const [selectedSpecialty, setSelectedSpecialty] = useState<Specialty | undefined>();
  const [showSpecialtyModal, setShowSpecialtyModal] = useState(false);

  const activeQuery = useProfessionalsAdmin({ is_active: true, role: 'professional' });
  const inactiveQuery = useProfessionalsAdmin({ is_active: false, role: 'professional' });
  const invitesQuery = useInvites();
  const specialtiesQuery = useSpecialties();

  const deactivate = useDeactivateProfessional();
  const resendInvite = useResendInvite();
  const cancelInvite = useCancelInvite();
  const deactivateSpecialty = useDeactivateSpecialty();

  function openCreate() {
    setSelectedProfessional(undefined);
    setShowProfessionalModal(true);
  }

  function openEdit(p: Professional) {
    setSelectedProfessional(p);
    setShowProfessionalModal(true);
  }

  async function handleDeactivate(id: string) {
    try {
      await deactivate.mutateAsync(id);
      toast.success('Profissional desativado.');
    } catch {
      toast.error('Erro ao desativar profissional.');
    }
  }

  async function handleResend(id: string) {
    try {
      await resendInvite.mutateAsync(id);
      toast.success('Convite reenviado.');
    } catch {
      toast.error('Erro ao reenviar convite.');
    }
  }

  async function handleCancelInvite(id: string) {
    if (!window.confirm('Cancelar este convite?')) return;
    try {
      await cancelInvite.mutateAsync(id);
      toast.success('Convite cancelado.');
    } catch {
      toast.error('Erro ao cancelar convite.');
    }
  }

  function openCreateSpecialty() {
    setSelectedSpecialty(undefined);
    setShowSpecialtyModal(true);
  }

  function openEditSpecialty(s: Specialty) {
    setSelectedSpecialty(s);
    setShowSpecialtyModal(true);
  }

  async function handleDeactivateSpecialty(id: string) {
    try {
      await deactivateSpecialty.mutateAsync(id);
      toast.success('Especialidade desativada.');
    } catch (err: unknown) {
      const axiosErr = err as { response?: { status?: number; data?: { detail?: string } } };
      if (axiosErr?.response?.status === 400) {
        toast.error(axiosErr.response?.data?.detail ?? 'Não é possível desativar esta especialidade.');
      } else {
        toast.error('Erro ao desativar especialidade.');
      }
    }
  }

  const tabs: { id: Tab; label: string }[] = [
    { id: 'ativos', label: 'Ativos' },
    { id: 'inativos', label: 'Inativos' },
    { id: 'convites', label: 'Convites' },
    { id: 'especialidades', label: 'Especialidades' },
  ];

  return (
    <PageContainer>
      <PageHeader
        title="Profissionais"
        subtitle="Gerencie a equipe da clínica"
        actions={
          isAdmin ? (
            <div className="flex gap-2">
              {activeTab === 'especialidades' ? (
                <Button size="sm" onClick={openCreateSpecialty}>
                  <Plus className="h-4 w-4" /> Nova Especialidade
                </Button>
              ) : (
                <>
                  <Button size="sm" variant="secondary" onClick={() => setShowInviteModal(true)}>
                    Convidar
                  </Button>
                  <Button size="sm" onClick={openCreate}>
                    <Plus className="h-4 w-4" /> Novo Profissional
                  </Button>
                </>
              )}
            </div>
          ) : undefined
        }
      />

      {/* Tabs */}
      <div className="border-b border-gray-200">
        <nav className="-mb-px flex gap-6">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`border-b-2 px-1 pb-3 text-sm font-medium transition-colors ${
                activeTab === tab.id
                  ? 'border-primary-600 text-primary-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </nav>
      </div>

      {/* Tab content */}
      {activeTab === 'ativos' && (
        <>
          {activeQuery.isLoading ? (
            <div className="overflow-hidden rounded-lg border border-gray-200"><table className="w-full text-sm"><tbody><SkeletonTableRows rows={5} cols={4} /></tbody></table></div>
          ) : (
            <ProfessionalTable
              professionals={activeQuery.data?.results ?? []}
              onEdit={openEdit}
              onDeactivate={handleDeactivate}
              isAdmin={isAdmin}
            />
          )}
        </>
      )}

      {activeTab === 'inativos' && (
        <>
          {inactiveQuery.isLoading ? (
            <div className="overflow-hidden rounded-lg border border-gray-200"><table className="w-full text-sm"><tbody><SkeletonTableRows rows={5} cols={4} /></tbody></table></div>
          ) : (
            <ProfessionalTable
              professionals={inactiveQuery.data?.results ?? []}
              onEdit={openEdit}
              onDeactivate={handleDeactivate}
              isAdmin={isAdmin}
            />
          )}
        </>
      )}

      {activeTab === 'convites' && (
        <>
          {invitesQuery.isLoading ? (
            <div className="overflow-hidden rounded-lg border border-gray-200"><table className="w-full text-sm"><tbody><SkeletonTableRows rows={3} cols={5} /></tbody></table></div>
          ) : (
            <div className="overflow-hidden rounded-lg border border-gray-200">
              <table className="w-full text-sm">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-4 py-3 text-left font-medium text-gray-600">E-mail</th>
                    <th className="px-4 py-3 text-left font-medium text-gray-600">Papel</th>
                    <th className="px-4 py-3 text-left font-medium text-gray-600">Expiração</th>
                    <th className="px-4 py-3 text-left font-medium text-gray-600">Status</th>
                    {isAdmin && (
                      <th className="px-4 py-3 text-right font-medium text-gray-600">Ações</th>
                    )}
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100 bg-white">
                  {(invitesQuery.data?.results ?? []).length === 0 ? (
                    <tr>
                      <td
                        colSpan={isAdmin ? 5 : 4}
                        className="py-8 text-center text-sm text-gray-500"
                      >
                        Nenhum convite enviado.
                      </td>
                    </tr>
                  ) : (
                    (invitesQuery.data?.results ?? []).map((invite) => (
                      <tr key={invite.id} className="hover:bg-gray-50">
                        <td className="px-4 py-3 text-gray-900">{invite.email}</td>
                        <td className="px-4 py-3 capitalize text-gray-600">{invite.role}</td>
                        <td className="px-4 py-3 text-gray-500">
                          {new Date(invite.expires_at).toLocaleDateString('pt-BR')}
                        </td>
                        <td className="px-4 py-3">
                          <InviteStatusBadge invite={invite} />
                        </td>
                        {isAdmin && (
                          <td className="px-4 py-3 text-right">
                            <div className="flex justify-end gap-2">
                              {invite.is_pending && (
                                <button
                                  onClick={() => handleResend(invite.id)}
                                  className="rounded px-2 py-1 text-xs font-medium text-blue-600 hover:bg-blue-50"
                                >
                                  Reenviar
                                </button>
                              )}
                              {invite.is_pending && (
                                <button
                                  onClick={() => handleCancelInvite(invite.id)}
                                  className="rounded px-2 py-1 text-xs font-medium text-red-600 hover:bg-red-50"
                                >
                                  Cancelar
                                </button>
                              )}
                            </div>
                          </td>
                        )}
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          )}
        </>
      )}

      {activeTab === 'especialidades' && (
        <>
          {specialtiesQuery.isLoading ? (
            <div className="overflow-hidden rounded-lg border border-gray-200"><table className="w-full text-sm"><tbody><SkeletonTableRows rows={4} cols={3} /></tbody></table></div>
          ) : (
            <SpecialtyTable
              specialties={specialtiesQuery.data ?? []}
              onEdit={openEditSpecialty}
              onDeactivate={handleDeactivateSpecialty}
              isAdmin={isAdmin}
            />
          )}
        </>
      )}

      {/* Modals */}
      <ProfessionalModal
        professional={selectedProfessional}
        open={showProfessionalModal}
        onOpenChange={setShowProfessionalModal}
        onSuccess={() => {
          toast.success(
            selectedProfessional ? 'Profissional atualizado.' : 'Profissional criado.',
          );
        }}
      />

      <InviteModal
        open={showInviteModal}
        onOpenChange={setShowInviteModal}
        onSuccess={() => {}}
      />

      <SpecialtyModal
        specialty={selectedSpecialty}
        open={showSpecialtyModal}
        onOpenChange={setShowSpecialtyModal}
        onSuccess={() => {
          toast.success(selectedSpecialty ? 'Especialidade atualizada.' : 'Especialidade criada.');
        }}
      />
    </PageContainer>
  );
}
