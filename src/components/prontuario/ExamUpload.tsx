import { useCallback } from 'react';
import { useDropzone } from 'react-dropzone';
import { toast } from 'sonner';
import { useUploadExam } from '@/hooks/useRecords';
import type { ExamFile } from '@/types/record';

const MAX_SIZE = 50 * 1024 * 1024;

interface ExamUploadProps {
  recordId: string;
  exams: ExamFile[];
}

export function ExamUpload({ recordId, exams }: ExamUploadProps) {
  const upload = useUploadExam(recordId);

  const onDrop = useCallback((acceptedFiles: File[]) => {
    acceptedFiles.forEach((file) => {
      const form = new FormData();
      form.append('file', file);
      form.append('original_name', file.name);
      form.append('content_type', file.type);
      form.append('size_bytes', String(file.size));
      upload.mutate(form, {
        onError: () => toast.error(`Erro ao enviar ${file.name}`),
      });
    });
  }, [upload]);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: { 'image/jpeg': [], 'image/png': [], 'application/pdf': [] },
    maxSize: MAX_SIZE,
    onDropRejected: (rejections) => {
      rejections.forEach((r) => toast.error(`Arquivo rejeitado: ${r.file.name}`));
    },
  });

  return (
    <div className="space-y-3">
      <label className="block text-sm font-medium text-gray-700">Exames</label>
      <div
        {...getRootProps()}
        className={`rounded-lg border-2 border-dashed p-6 text-center cursor-pointer transition-colors ${
          isDragActive ? 'border-blue-400 bg-blue-50' : 'border-gray-300 hover:border-gray-400'
        }`}
      >
        <input {...getInputProps()} />
        <p className="text-sm text-gray-500">
          {isDragActive ? 'Solte os arquivos aqui...' : 'Arraste arquivos ou clique para selecionar (JPG, PNG, PDF — máx 50 MB)'}
        </p>
      </div>

      {exams.length > 0 && (
        <ul className="divide-y rounded-md border">
          {exams.map((e) => (
            <li key={e.id} className="flex items-center justify-between px-3 py-2 text-sm">
              <span className="truncate text-gray-700">{e.original_name}</span>
              <a
                href={e.presigned_url}
                target="_blank"
                rel="noreferrer"
                className="ml-4 text-blue-600 hover:underline whitespace-nowrap"
              >
                Visualizar
              </a>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
