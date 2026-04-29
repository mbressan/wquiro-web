import { Mic, MicOff, Loader2, CheckCircle, AlertCircle } from 'lucide-react';
import { Button } from '@/components/ui';
import { useRecording } from '@/hooks/useRecording';
import type { ConsultationRecording } from '@/types/recording';

interface RecordingButtonProps {
  clinicalRecordId: string;
  onRecordingUploaded: (recording: ConsultationRecording) => void;
}

function formatTime(seconds: number) {
  const m = Math.floor(seconds / 60).toString().padStart(2, '0');
  const s = (seconds % 60).toString().padStart(2, '0');
  return `${m}:${s}`;
}

export default function RecordingButton({ clinicalRecordId, onRecordingUploaded }: RecordingButtonProps) {
  const { state, elapsedSeconds, error, isSupported, startRecording, stopRecording, reset } =
    useRecording({ clinicalRecordId, onUploaded: onRecordingUploaded });

  if (!isSupported) {
    return (
      <div className="flex items-center gap-2 text-sm text-gray-500">
        <MicOff className="h-4 w-4" />
        <span>Use Chrome 90+ ou Firefox 90+ para gravação.</span>
      </div>
    );
  }

  if (state === 'done') {
    return (
      <div className="flex items-center gap-2">
        <CheckCircle className="h-4 w-4 text-green-600" />
        <span className="text-sm text-green-700">Gravação enviada</span>
        <Button variant="ghost" size="sm" onClick={reset}>Nova gravação</Button>
      </div>
    );
  }

  if (state === 'error') {
    return (
      <div className="flex items-center gap-2">
        <AlertCircle className="h-4 w-4 text-red-500" />
        <span className="text-sm text-red-600">{error}</span>
        <Button variant="ghost" size="sm" onClick={reset}>Tentar novamente</Button>
      </div>
    );
  }

  if (state === 'uploading') {
    return (
      <div className="flex items-center gap-2 text-sm text-gray-500">
        <Loader2 className="h-4 w-4 animate-spin" />
        <span>Enviando gravação...</span>
      </div>
    );
  }

  if (state === 'recording') {
    return (
      <div className="flex items-center gap-3">
        <div className="flex items-center gap-0.5">
          {[1, 2, 3, 4, 5].map((i) => (
            <span
              key={i}
              className="block w-1 bg-red-500 rounded-full animate-pulse"
              style={{ height: `${8 + (i % 3) * 6}px`, animationDelay: `${i * 0.1}s` }}
            />
          ))}
        </div>
        <span className="font-mono text-xs bg-red-100 text-red-700 px-2 py-0.5 rounded">
          {formatTime(elapsedSeconds)}
        </span>
        <Button variant="destructive" size="sm" onClick={stopRecording}>
          <MicOff className="h-4 w-4 mr-1" />
          Parar
        </Button>
      </div>
    );
  }

  return (
    <Button variant="secondary" size="sm" onClick={startRecording} disabled={state === 'requesting'}>
      {state === 'requesting' ? (
        <Loader2 className="h-4 w-4 mr-1 animate-spin" />
      ) : (
        <Mic className="h-4 w-4 mr-1" />
      )}
      {state === 'requesting' ? 'Aguardando permissão...' : 'Gravar consulta'}
    </Button>
  );
}
