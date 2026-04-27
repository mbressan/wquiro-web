import { useState } from 'react';
import { toast } from 'sonner';
import { useAuthStore } from '@/stores/authStore';
import {
  useProfessionalsAdmin,
  useDeactivateProfessional,
  useInvites,
  useResendInvite,
  useCancelInvite,
} from '@/hooks/useProfessionals';
import { ProfessionalTable } from '@/components/profissionais/ProfessionalTable';
import { ProfessionalModal } from '@/components/profissionais/ProfessionalModal';
import { InviteModal } from '@/components/profissionais/InviteModal';
import type { Professional, TeamInvite } from '@/types/professional';

type Tab = 'ativos' | 'inativos' | 'convites';

function InviteStatusBadge({ invite }: { invite: TeamInvite }) {
  if (invite.accepted_at) {
    return (
      <span className="inline-flex items-center rounded-full bg-green-100 px-2.5 py-0.5 text-xs font-medium text-green-700">
        Aceito
      </span>
    );
  }
  if (invite.cancelled_at) {
    return (
      <span className="inline-flex items-center rounded-full bg-red-100 px-2.5 py-0.5 text-xs font-medium text-red-700">
        Cancelado
      </span>
    );
  }
  if (invite.is_pending) {
    return (
      <span className="inline-flex items-center rounded-full bg-yellow-100 px-2.5 py-0.5 text-xs font-medium text-yellow-700">
        Pendente
      </span>
    );
  }
  return (
    <span className="inline-flex items-center rounded-full bg-gray-100 px-2.5 py-0.5 text-xs font-medium text-gray-600">
      Expirado
    </span>
  );
}

export default function ProfissionaisPage() {
  const user = useAuthStore((s) => s.user);
  const isAdmin = user?.role === 'admin';

  const [activeTab, setActiveTab] = useState<Tab>('ativos');
  const [selectedProfessional, setSelectedProfessional] = useState<Professional | undefined>();
  const [showProfessionalModal, setShowProfessionalModal] = useState(false);
  const [showInviteModal, setShowInviteModal] = useState(false);

  const activeQuery = useProfessionalsAdmin({ is_active: true, role: 'professional' });
  const inactiveQuery = useProfessionalsAdmin({ is_active: false, role: 'professional' });
  const invitesQuery = useInvites();

  const deactivate = useDeactivateProfessional();
  const resendInvite = useResendInvite();
  const cancelInvite = useCancelInvite();

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

  const tabs: { id: Tab; label: string }[] = [
    { id: 'ativos', label: 'Ativos' },
    { id: 'inativos', label: 'Inativos' },
    { id: 'convites', label: 'Convites' },
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Profissionais</h1>
          <p className="text-sm text-gray-500">Gerencie a equipe da clínica</p>
        </div>
        {isAdmin && (
          <div className="flex gap-3">
            <button
              onClick={() => setShowInviteModal(true)}
              className="rounded-md border border-blue-600 px-4 py-2 text-sm font-medium text-blue-600 hover:bg-blue-50"
            >
              Convidar
            </button>
            <button
              onClick={openCreate}
              className="rounded-md bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700"
            >
              Novo Profissional
            </button>
          </div>
        )}
      </div>

      {/* Tabs */}
      <div className="border-b border-gray-200">
        <nav className="-mb-px flex gap-6">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`border-b-2 px-1 pb-3 text-sm font-medium transition-colors ${
                activeTab === tab.id
                  ? 'border-blue-600 text-blue-600'
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
            <p className="text-sm text-gray-500">Carregando...</p>
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
            <p className="text-sm text-gray-500">Carregando...</p>
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
            <p className="text-sm text-gray-500">Carregando...</p>
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
    </div>
  );
}
