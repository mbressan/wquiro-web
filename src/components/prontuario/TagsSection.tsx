import { useState } from 'react'
import { Plus, X } from 'lucide-react'
import { usePatient, useUpdatePatient, usePatientTags } from '@/hooks/usePatients'
import { TagBadge } from '@/components/pacientes/TagBadge'
import type { PatientTag } from '@/types/patient'

interface TagsSectionProps {
  patientId: string
}

export function TagsSection({ patientId }: TagsSectionProps) {
  const { data: patient } = usePatient(patientId)
  const { data: allTags = [] } = usePatientTags()
  const updatePatient = useUpdatePatient(patientId)
  const [dropdownOpen, setDropdownOpen] = useState(false)

  const currentTagIds = patient?.tags.map(t => t.id) ?? []
  const availableTags = allTags.filter(t => !currentTagIds.includes(t.id))

  function handleRemove(tagId: string) {
    updatePatient.mutate({ tags: currentTagIds.filter(id => id !== tagId) })
  }

  function handleAdd(tagId: string) {
    updatePatient.mutate({ tags: [...currentTagIds, tagId] })
    setDropdownOpen(false)
  }

  return (
    <section>
      <h3 className="text-sm font-semibold text-gray-700 mb-2">Tags</h3>
      <div className="flex flex-wrap gap-2 items-center">
        {(patient?.tags ?? []).map((tag: PatientTag) => (
          <span key={tag.id} className="inline-flex items-center gap-1">
            <TagBadge tag={tag} />
            <button
              onClick={() => handleRemove(tag.id)}
              className="text-gray-400 hover:text-gray-600 ml-0.5"
              title={`Remover tag ${tag.name}`}
            >
              <X className="h-3 w-3" />
            </button>
          </span>
        ))}

        <div className="relative">
          <button
            onClick={() => setDropdownOpen(o => !o)}
            className="inline-flex items-center gap-1 text-xs text-gray-500 border border-dashed border-gray-300 rounded-full px-2 py-0.5 hover:border-gray-400 hover:text-gray-700 transition-colors"
          >
            <Plus className="h-3 w-3" />
            Adicionar
          </button>
          {dropdownOpen && (
            <>
              <div className="fixed inset-0 z-10" onClick={() => setDropdownOpen(false)} />
              <div className="absolute top-7 left-0 z-20 bg-white border border-gray-200 rounded-lg shadow-lg min-w-40 py-1">
                {availableTags.length === 0 ? (
                  <p className="text-xs text-gray-400 px-3 py-2">Nenhuma tag disponível</p>
                ) : (
                  availableTags.map(tag => (
                    <button
                      key={tag.id}
                      onClick={() => handleAdd(tag.id)}
                      className="w-full text-left px-3 py-1.5 text-sm hover:bg-gray-50 flex items-center gap-2"
                    >
                      <span
                        className="h-2 w-2 rounded-full shrink-0"
                        style={{ backgroundColor: tag.color }}
                      />
                      {tag.name}
                    </button>
                  ))
                )}
              </div>
            </>
          )}
        </div>
      </div>
    </section>
  )
}
