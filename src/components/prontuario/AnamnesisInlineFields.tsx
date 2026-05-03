import { useState } from 'react'
import { useUpdateRecord } from '@/hooks/useRecords'
import type { ClinicalRecord, AnamnesisHistory } from '@/types/record'

interface AnamnesisInlineFieldsProps {
  record: ClinicalRecord
  isLocked: boolean
}

const FIELDS: { key: keyof AnamnesisHistory; label: string }[] = [
  { key: 'diseases', label: 'Ant. doenças' },
  { key: 'surgeries', label: 'Ant. cirurgias' },
  { key: 'family_history', label: 'Ant. familiares' },
  { key: 'habits', label: 'Hábitos' },
  { key: 'allergies', label: 'Alergias' },
  { key: 'medications', label: 'Medicamentos em uso' },
]

export function AnamnesisInlineFields({ record, isLocked }: AnamnesisInlineFieldsProps) {
  const [editingField, setEditingField] = useState<keyof AnamnesisHistory | null>(null)
  const [fieldValue, setFieldValue] = useState('')
  const updateRecord = useUpdateRecord(record.id)

  const anamnesis = ((record.clinical_data as { anamnesis?: AnamnesisHistory }).anamnesis) ?? {}

  function handleBlur(field: keyof AnamnesisHistory) {
    updateRecord.mutate({
      clinical_data: {
        ...record.clinical_data,
        anamnesis: { ...anamnesis, [field]: fieldValue },
      },
    })
    setEditingField(null)
  }

  return (
    <div>
      <h3 className="text-sm font-semibold text-gray-700 mb-3">Histórico médico</h3>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {FIELDS.map(field => (
          <div key={field.key}>
            <p className="text-xs font-medium text-gray-500 mb-1">{field.label}</p>
            <div className={`border rounded p-2 min-h-[56px] ${editingField === field.key ? 'ring-1 ring-primary-400' : 'border-gray-200'}`}>
              {editingField === field.key ? (
                <textarea
                  autoFocus
                  value={fieldValue}
                  onChange={e => setFieldValue(e.target.value)}
                  onBlur={() => handleBlur(field.key)}
                  className="w-full text-sm resize-none border-none outline-none bg-transparent"
                  rows={3}
                />
              ) : (
                <button
                  onClick={() => {
                    if (isLocked) return
                    setEditingField(field.key)
                    setFieldValue(anamnesis[field.key] ?? '')
                  }}
                  disabled={isLocked}
                  className={`text-left text-sm w-full ${anamnesis[field.key] ? 'text-gray-900' : 'text-gray-400 italic'}`}
                >
                  {anamnesis[field.key] || 'Inserir informação'}
                </button>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
