import { useState } from 'react';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { toast } from 'sonner';
import { MessageCircle, Send, Check, CheckCheck, Clock, X, User, Bot } from 'lucide-react';
import { usePatientMessages, useSendMessage } from '@/hooks/useWhatsApp';
import { Button, Modal, Textarea } from '@/components/ui';
import type { WhatsAppMessage, WhatsAppMessageStatus } from '@/types/whatsapp';

interface WhatsAppHistoryTabProps {
  patientId: string;
}

function formatMessageDate(dateStr: string | null, fallback: string): string {
  const d = dateStr ?? fallback;
  return format(new Date(d), "dd/MM/yyyy 'às' HH:mm", { locale: ptBR });
}

const statusConfig: Record<
  WhatsAppMessageStatus,
  { label: string; className: string; icon: React.ReactNode }
> = {
  pending: {
    label: 'Pendente',
    className: 'bg-gray-100 text-gray-600',
    icon: <Clock className="h-3 w-3" />,
  },
  sent: {
    label: 'Enviado',
    className: 'bg-blue-100 text-blue-600',
    icon: <Check className="h-3 w-3" />,
  },
  delivered: {
    label: 'Entregue',
    className: 'bg-green-100 text-green-600',
    icon: <CheckCheck className="h-3 w-3" />,
  },
  read: {
    label: 'Lido',
    className: 'bg-green-200 text-green-700',
    icon: <CheckCheck className="h-3 w-3" />,
  },
  failed: {
    label: 'Falhou',
    className: 'bg-red-100 text-red-600',
    icon: <X className="h-3 w-3" />,
  },
};

const triggerLabel: Record<WhatsAppMessage['triggered_by'], string> = {
  automatic: 'Automático',
  manual: 'Manual',
  webhook: 'Paciente',
};

const triggerIcon: Record<WhatsAppMessage['triggered_by'], React.ReactNode> = {
  automatic: <Bot className="h-3 w-3" />,
  manual: <User className="h-3 w-3" />,
  webhook: <User className="h-3 w-3" />,
};

function MessageBubble({ message }: { message: WhatsAppMessage }) {
  const isOutbound = message.direction === 'outbound';
  const status = statusConfig[message.status];

  return (
    <div className={`flex ${isOutbound ? 'justify-end' : 'justify-start'}`}>
      <div className={`max-w-[75%] space-y-1 ${isOutbound ? 'items-end' : 'items-start'} flex flex-col`}>
        <div
          className={`rounded-2xl px-4 py-2.5 text-sm leading-relaxed shadow-sm ${
            isOutbound
              ? 'rounded-tr-sm bg-primary-600 text-white'
              : 'rounded-tl-sm bg-gray-100 text-gray-900'
          }`}
        >
          {message.content}
        </div>

        <div className={`flex items-center gap-2 px-1 ${isOutbound ? 'flex-row-reverse' : 'flex-row'}`}>
          <span className="text-xs text-gray-400">
            {formatMessageDate(message.sent_at, message.created_at)}
          </span>

          <span
            className={`inline-flex items-center gap-0.5 rounded-full px-1.5 py-0.5 text-xs font-medium ${status.className}`}
          >
            {status.icon}
            {status.label}
          </span>

          <span className="inline-flex items-center gap-0.5 text-xs text-gray-400">
            {triggerIcon[message.triggered_by]}
            {triggerLabel[message.triggered_by]}
          </span>
        </div>
      </div>
    </div>
  );
}

function MessagesSkeleton() {
  return (
    <div className="space-y-4 p-4">
      <div className="flex justify-end">
        <div className="h-12 w-2/3 animate-pulse rounded-2xl rounded-tr-sm bg-gray-200" />
      </div>
      <div className="flex justify-start">
        <div className="h-16 w-1/2 animate-pulse rounded-2xl rounded-tl-sm bg-gray-200" />
      </div>
      <div className="flex justify-end">
        <div className="h-10 w-3/4 animate-pulse rounded-2xl rounded-tr-sm bg-gray-200" />
      </div>
    </div>
  );
}

export default function WhatsAppHistoryTab({ patientId }: WhatsAppHistoryTabProps) {
  const [showModal, setShowModal] = useState(false);
  const [messageText, setMessageText] = useState('');

  const { data, isLoading } = usePatientMessages(patientId);
  const sendMessage = useSendMessage();

  const messages = data?.results ?? [];

  function handleSend() {
    const trimmed = messageText.trim();
    if (!trimmed) return;

    sendMessage.mutate(
      { patient: patientId, content: trimmed },
      {
        onSuccess: () => {
          toast.success('Mensagem enviada com sucesso!');
          setMessageText('');
          setShowModal(false);
        },
        onError: () => {
          toast.error('Erro ao enviar mensagem. Tente novamente.');
        },
      },
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <MessageCircle className="h-5 w-5 text-green-500" />
          <h3 className="text-sm font-semibold text-gray-900">Histórico WhatsApp</h3>
          {data && (
            <span className="rounded-full bg-gray-100 px-2 py-0.5 text-xs text-gray-500">
              {data.count} {data.count === 1 ? 'mensagem' : 'mensagens'}
            </span>
          )}
        </div>
        <Button size="sm" onClick={() => setShowModal(true)}>
          <Send className="mr-1.5 h-3.5 w-3.5" />
          Enviar mensagem
        </Button>
      </div>

      <div className="rounded-xl border border-gray-200 bg-white shadow-sm">
        {isLoading ? (
          <MessagesSkeleton />
        ) : messages.length === 0 ? (
          <div className="flex flex-col items-center justify-center gap-2 py-12 text-center">
            <MessageCircle className="h-8 w-8 text-gray-300" />
            <p className="text-sm text-gray-500">Nenhuma mensagem enviada para este paciente.</p>
          </div>
        ) : (
          <div className="max-h-96 overflow-y-auto p-4 space-y-3">
            {messages.map((message) => (
              <MessageBubble key={message.id} message={message} />
            ))}
          </div>
        )}
      </div>

      {showModal && (
        <Modal title="Enviar mensagem WhatsApp" onClose={() => setShowModal(false)}>
          <div className="space-y-4">
            <Textarea
              value={messageText}
              onChange={(e) => setMessageText(e.target.value)}
              placeholder="Digite a mensagem para o paciente..."
              rows={4}
            />
            <div className="flex justify-end gap-2">
              <Button variant="secondary" onClick={() => setShowModal(false)}>
                Cancelar
              </Button>
              <Button
                onClick={handleSend}
                disabled={!messageText.trim() || sendMessage.isPending}
              >
                <Send className="mr-1.5 h-3.5 w-3.5" />
                {sendMessage.isPending ? 'Enviando...' : 'Enviar'}
              </Button>
            </div>
          </div>
        </Modal>
      )}
    </div>
  );
}
