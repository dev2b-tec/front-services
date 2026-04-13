'use client'

import { useState } from 'react'
import { ChevronDown } from 'lucide-react'

export const ESPECIALIDADES = [
  { value: 'PADRAO', label: 'Padrão' },
  { value: 'MEDICO', label: 'Médico' },
  { value: 'NUTRICIONISTA', label: 'Nutricionista' },
  { value: 'GINECOLOGISTA', label: 'Ginecologista' },
  { value: 'PEDIATRA', label: 'Pediatra' },
  { value: 'ORTOPEDISTA', label: 'Ortopedista' },
  { value: 'CARDIOLOGISTA', label: 'Cardiologista' },
  { value: 'OFTALMOLOGISTA', label: 'Oftalmologista' },
  { value: 'PSICANALISTA', label: 'Psicanalista' },
  { value: 'TERAPEUTA', label: 'Terapeuta' },
  { value: 'DERMATOLOGISTA', label: 'Dermatologia' },
  { value: 'PSICOLOGO', label: 'Psicólogo' },
  { value: 'FISIOTERAPEUTA', label: 'Fisioterapia' },
  { value: 'ENDOCRINOLOGISTA', label: 'Endocrinologia' },
  { value: 'GASTROENTEROLOGISTA', label: 'Gastroenterologia' },
  { value: 'GERIATRA', label: 'Geriatria' },
] as const

export type EspecialidadeValue = typeof ESPECIALIDADES[number]['value']

interface SeletorEspecialidadeProps {
  value: EspecialidadeValue
  onChange: (value: EspecialidadeValue) => void
  label?: string
  className?: string
}

export function SeletorEspecialidade({ value, onChange, label = 'Especialidade', className = '' }: SeletorEspecialidadeProps) {
  const [open, setOpen] = useState(false)

  const selectedLabel = ESPECIALIDADES.find(e => e.value === value)?.label || 'Padrão'

  return (
    <div className={className}>
      <label className="block text-xs font-medium text-[var(--d2b-text-muted)] mb-1.5">
        {label}
      </label>
      <div className="relative">
        <button
          type="button"
          onClick={() => setOpen(!open)}
          className="w-full bg-[var(--d2b-bg-elevated)] border border-[var(--d2b-border-strong)] rounded-xl px-4 py-3 text-sm text-[var(--d2b-text-primary)] focus:outline-none focus:border-[#7C4DFF] transition-colors flex items-center justify-between"
        >
          <span>{selectedLabel}</span>
          <ChevronDown size={16} className={`text-[var(--d2b-text-muted)] transition-transform ${open ? 'rotate-180' : ''}`} />
        </button>

        {open && (
          <>
            <div className="fixed inset-0 z-10" onClick={() => setOpen(false)} />
            <div className="absolute z-20 w-full mt-2 bg-[var(--d2b-bg-elevated)] border border-[var(--d2b-border-strong)] rounded-xl shadow-2xl max-h-[280px] overflow-y-auto">
              {ESPECIALIDADES.map((esp) => (
                <button
                  key={esp.value}
                  type="button"
                  onClick={() => {
                    onChange(esp.value)
                    setOpen(false)
                  }}
                  className={`w-full px-4 py-2.5 text-left text-sm transition-colors ${
                    esp.value === value
                      ? 'bg-[#7C4DFF]/10 text-[#7C4DFF] font-medium'
                      : 'text-[var(--d2b-text-secondary)] hover:bg-[var(--d2b-hover)]'
                  }`}
                >
                  {esp.label}
                </button>
              ))}
            </div>
          </>
        )}
      </div>
    </div>
  )
}
