'use client'

import { useState } from 'react'
import { Mic } from 'lucide-react'
import type { EspecialidadeValue } from './seletor-especialidade'
import { ModalGravacaoAudio } from './modal-gravacao-audio'
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip'

interface BotoesIAAudioProps {
  especialidade: EspecialidadeValue
  empresaId: string
  usuarioId?: string
  onTextoGerado: (texto: string, tipo: 'relato' | 'atendimento') => void
}

export function BotoesIAAudio({ especialidade, empresaId, usuarioId, onTextoGerado }: BotoesIAAudioProps) {
  const [modalAberto, setModalAberto] = useState<'relato' | 'atendimento' | null>(null)

  return (
    <>
      <TooltipProvider delayDuration={300}>
        <div className="flex items-center gap-2">
          {/* Botão Relato */}
          <Tooltip>
            <TooltipTrigger asChild>
              <button
                type="button"
                onClick={() => setModalAberto('relato')}
                className="flex items-center gap-1.5 px-3 py-2 rounded-lg border border-[#7C4DFF] text-[#7C4DFF] hover:bg-[#7C4DFF]/10 text-sm font-medium transition-colors"
              >
                <Mic size={16} />
                Relato
              </button>
            </TooltipTrigger>
            <TooltipContent side="top" className="max-w-xs">
              <p className="text-xs">
                Grave o relato do paciente para gerar automaticamente um resumo de consulta
              </p>
            </TooltipContent>
          </Tooltip>

          {/* Botão Atendimento */}
          <Tooltip>
            <TooltipTrigger asChild>
              <button
                type="button"
                onClick={() => setModalAberto('atendimento')}
                className="flex items-center gap-1.5 px-3 py-2 rounded-lg border border-[#7C4DFF] text-[#7C4DFF] hover:bg-[#7C4DFF]/10 text-sm font-medium transition-colors"
              >
                <Mic size={16} />
                Atendimento
              </button>
            </TooltipTrigger>
            <TooltipContent side="top" className="max-w-xs">
              <p className="text-xs">
                Grave o áudio do atendimento para gerar automaticamente um resumo de consulta
              </p>
            </TooltipContent>
          </Tooltip>
        </div>
      </TooltipProvider>

      {/* Modal de Gravação */}
      {modalAberto && (
        <ModalGravacaoAudio
          tipo={modalAberto}
          especialidade={especialidade}
          empresaId={empresaId}
          usuarioId={usuarioId}
          onClose={() => setModalAberto(null)}
          onTextoGerado={(texto) => {
            onTextoGerado(texto, modalAberto)
            setModalAberto(null)
          }}
        />
      )}
    </>
  )
}
