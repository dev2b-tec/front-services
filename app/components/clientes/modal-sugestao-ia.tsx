'use client'

import { useState } from 'react'
import { X, Sparkles, Loader2 } from 'lucide-react'
import { useToast } from '@/hooks/use-toast'
import type { EspecialidadeValue } from './seletor-especialidade'

interface ModalSugestaoIAProps {
  textoAtual: string
  especialidade: EspecialidadeValue
  empresaId: string
  usuarioId?: string
  onClose: () => void
  onAceitar: (sugestao: string) => void
}

export function ModalSugestaoIA({ 
  textoAtual, 
  especialidade, 
  empresaId, 
  usuarioId,
  onClose, 
  onAceitar 
}: ModalSugestaoIAProps) {
  const { toast } = useToast()
  const [sugestao, setSugestao] = useState<string | null>(null)
  const [gerando, setGerando] = useState(false)

  async function gerarSugestao() {
    if (!textoAtual.trim()) {
      toast({
        title: 'Campo vazio',
        description: 'Digite algum texto antes de solicitar uma sugestão.',
        variant: 'destructive'
      })
      return
    }

    setGerando(true)
    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/v1/evolucoes/ia/sugestao`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          textoAtual,
          especialidade,
          empresaId,
          usuarioId
        })
      })

      if (res.ok) {
        const data = await res.json()
        setSugestao(data.sugestao)
      } else {
        toast({
          title: 'Erro ao gerar sugestão',
          description: 'Não foi possível processar sua solicitação.',
          variant: 'destructive'
        })
      }
    } catch (error) {
      toast({
        title: 'Erro de conexão',
        description: 'Verifique sua conexão e tente novamente.',
        variant: 'destructive'
      })
    } finally {
      setGerando(false)
    }
  }

  function handleAceitar() {
    if (sugestao) {
      onAceitar(sugestao)
      onClose()
    }
  }

  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
      <div className="relative w-full max-w-2xl bg-[var(--d2b-bg-elevated)] border border-[var(--d2b-border-strong)] rounded-2xl shadow-2xl flex flex-col max-h-[80vh]">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-[var(--d2b-border)] flex-shrink-0">
          <div className="flex items-center gap-2">
            <Sparkles size={20} className="text-[#7C4DFF]" />
            <span className="text-lg font-semibold text-[var(--d2b-text-primary)]">
              Sugestão de IA
            </span>
          </div>
          <button 
            onClick={onClose}
            className="w-7 h-7 flex items-center justify-center rounded-lg text-[var(--d2b-text-muted)] hover:text-[var(--d2b-text-primary)] hover:bg-[var(--d2b-hover)] transition-colors"
          >
            <X size={16} />
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-6 space-y-4">
          {/* Texto Original */}
          <div>
            <label className="block text-xs font-medium text-[var(--d2b-text-muted)] mb-2">
              Texto Original
            </label>
            <div className="bg-[var(--d2b-bg-main)] border border-[var(--d2b-border)] rounded-xl p-4 text-sm text-[var(--d2b-text-secondary)] max-h-32 overflow-y-auto">
              {textoAtual || <span className="text-[var(--d2b-text-muted)] italic">Nenhum texto fornecido</span>}
            </div>
          </div>

          {/* Sugestão Gerada */}
          {sugestao && (
            <div>
              <label className="block text-xs font-medium text-[var(--d2b-text-muted)] mb-2">
                Sugestão da IA
              </label>
              <div className="bg-[#7C4DFF]/5 border border-[#7C4DFF]/20 rounded-xl p-4 text-sm text-[var(--d2b-text-primary)] max-h-64 overflow-y-auto">
                {sugestao}
              </div>
            </div>
          )}

          {/* Loading State */}
          {gerando && (
            <div className="flex flex-col items-center justify-center py-8 gap-3">
              <Loader2 size={32} className="text-[#7C4DFF] animate-spin" />
              <p className="text-sm text-[var(--d2b-text-muted)]">
                Gerando sugestão com IA...
              </p>
            </div>
          )}

          {/* Empty State */}
          {!sugestao && !gerando && (
            <div className="flex flex-col items-center justify-center py-8 gap-3 text-center">
              <Sparkles size={40} className="text-[var(--d2b-text-muted)]" />
              <p className="text-sm text-[var(--d2b-text-muted)] max-w-md">
                Clique em "Gerar Sugestão" para que a IA analise seu texto e sugira melhorias.
              </p>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="flex items-center justify-end gap-3 px-6 py-4 border-t border-[var(--d2b-border)] flex-shrink-0">
          <button
            onClick={onClose}
            className="px-4 py-2 text-sm text-[var(--d2b-text-secondary)] hover:text-[var(--d2b-text-primary)] font-medium transition-colors"
          >
            Cancelar
          </button>
          
          {!sugestao && (
            <button
              onClick={gerarSugestao}
              disabled={gerando || !textoAtual.trim()}
              className="flex items-center gap-2 px-4 py-2 rounded-lg bg-[#7C4DFF] hover:bg-[#5B21B6] disabled:opacity-50 disabled:cursor-not-allowed text-white text-sm font-medium transition-colors"
            >
              {gerando ? (
                <>
                  <Loader2 size={16} className="animate-spin" />
                  Gerando...
                </>
              ) : (
                <>
                  <Sparkles size={16} />
                  Gerar Sugestão
                </>
              )}
            </button>
          )}

          {sugestao && (
            <button
              onClick={handleAceitar}
              className="flex items-center gap-2 px-4 py-2 rounded-lg bg-[#7C4DFF] hover:bg-[#5B21B6] text-white text-sm font-medium transition-colors"
            >
              Aceitar Sugestão
            </button>
          )}
        </div>
      </div>
    </div>
  )
}
