import { useRecord } from '@/hooks/useRecords'
import { ExamUpload } from '@/components/prontuario/ExamUpload'

interface PreviousRecordsImportProps {
  recordId: string
}

export function PreviousRecordsImport({ recordId }: PreviousRecordsImportProps) {
  const { data: record } = useRecord(recordId)

  return (
    <section className="rounded-lg border border-dashed border-gray-300 p-4">
      <h3 className="text-sm font-semibold text-gray-700 mb-1">Inserir prontuários anteriores</h3>
      <p className="text-xs text-gray-500 mb-3">
        Aqui você pode inserir arquivos de prontuários antes do primeiro atendimento pelo wQuiro.
        Após o primeiro atendimento, esta opção não estará mais disponível.
      </p>
      <ExamUpload recordId={recordId} exams={record?.exam_files ?? []} />
    </section>
  )
}
