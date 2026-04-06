'use client'

import { useState, useEffect, useCallback } from 'react'
import { X, Send, Loader2, WifiOff, PhoneOff } from 'lucide-react'
import { useToast } from '@/hooks/use-toast'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'

const WHATS_URL = ''

// ─── Types ─────────────────────────────────────────────────────────────────────
export interface MensagemContext {
  nomePaciente?: string
  nomeProfissional?: string
  dataHora?: string
}

export interface SistemaMensagensModalProps {
  open: boolean
  onClose: () => void
  telefone?: string | null
  empresaId?: string | null
  context?: MensagemContext
}

interface Instancia {
  id: string
  status: string
}

// ─── Message templates ─────────────────────────────────────────────────────────
const TIPOS_MENSAGEM = [
  { id: 'confirmar',     titulo: 'Confirmar Agendamento',    desc: 'Confirme que o paciente virá ao atendimento.'   },
  { id: 'remarcacao',    titulo: 'Remarcação',               desc: 'Entre em contato para reagendar quem faltou.'   },
  { id: 'agradecimento', titulo: 'Agradecimento',            desc: 'Agradeça a presença do paciente.'               },
  { id: 'cobranca',      titulo: 'Cobrança',                 desc: 'Lembre seu paciente sobre o pagamento.'         },
  { id: 'anamnese',      titulo: 'Questionário de Anamnese', desc: 'Envie um questionário de Anamnese.'             },
  { id: 'personalizada', titulo: 'Personalize a Mensagem',   desc: 'Envie a mensagem que desejar ao paciente.'      },
]

function buildMensagem(tipo: string, ctx: MensagemContext): string {
  const p    = ctx.nomePaciente    ? `, ${ctx.nomePaciente}` : ''
  const prof = ctx.nomeProfissional ? ` com ${ctx.nomeProfissional}` : ''
  const hora = ctx.dataHora         ? ` para ${ctx.dataHora}` : ''

  switch (tipo) {
    case 'confirmar':
      return `Olá${p}! Confirmamos seu agendamento${prof}${hora}. Por favor, confirme sua presença respondendo esta mensagem. 😊`
    case 'remarcacao':
      return `Olá${p}! Notamos sua ausência em nosso atendimento. Gostaria de remarcar? Entre em contato para agendar um novo horário.`
    case 'agradecimento':
      return `Olá${p}! Muito obrigado pela sua visita! Esperamos ter contribuído para o seu bem-estar. Até a próxima! 😊`
    case 'cobranca':
      return `Olá${p}! Identificamos um valor pendente referente ao seu atendimento. Por favor, entre em contato conosco para regularizar.`
    case 'anamnese':
      return `Olá${p}! Para um melhor atendimento, precisamos que você preencha nosso questionário de anamnese antes da consulta. Entre em contato para mais informações.`
    default:
      return ''
  }
}

// ─── Component ─────────────────────────────────────────────────────────────────
export function SistemaMensagensModal({
  open,
  onClose,
  telefone,
  empresaId,
  context = {},
}: SistemaMensagensModalProps) {
  const { toast } = useToast()

  const [instancia,        setInstancia]        = useState<Instancia | null>(null)
  const [loadingInstancia, setLoadingInstancia] = useState(false)
  const [enviando,         setEnviando]         = useState<string | null>(null)
  const [customText,       setCustomText]       = useState('')
  const [customExpanded,   setCustomExpanded]   = useState(false)

  const telefoneNumerico = telefone?.replace(/\D/g, '') ?? ''
  const temTelefone      = telefoneNumerico.length >= 10

  const carregarInstancia = useCallback(async () => {
    if (!empresaId) return
    setLoadingInstancia(true)
    try {
      const res = await fetch(`${WHATS_URL}/api/v1/instancias/empresa/${empresaId}`)
      if (res.ok) {
        const data: Instancia[] = await res.json()
        const ativa = data.find((i) => i.status === 'CONECTADA' || i.status === 'ABERTA')
        setInstancia(ativa ?? null)
      }
    } catch { /* silencioso */ } finally {
      setLoadingInstancia(false)
    }
  }, [empresaId])

  useEffect(() => {
    if (open && empresaId) {
      carregarInstancia()
    }
    if (!open) {
      setCustomText('')
      setCustomExpanded(false)
      setEnviando(null)
    }
  }, [open, empresaId, carregarInstancia])

  const enviar = async (tipo: string, texto: string) => {
    if (!instancia || !temTelefone || !texto.trim()) return
    setEnviando(tipo)
    try {
      const res = await fetch(`${WHATS_URL}/api/v1/mensagens/enviar`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          instanciaId: instancia.id,
          numero: telefoneNumerico,
          texto: texto.trim(),
        }),
      })
      if (res.ok) {
        toast({ title: 'Mensagem enviada com sucesso! ✓' })
        if (tipo === 'personalizada') {
          setCustomText('')
          setCustomExpanded(false)
        }
      } else {
        const msg = await res.text().catch(() => '')
        toast({ title: msg || 'Erro ao enviar mensagem', variant: 'destructive' })
      }
    } catch {
      toast({ title: 'Erro ao enviar mensagem', variant: 'destructive' })
    } finally {
      setEnviando(null)
    }
  }

  const handleEnviar = (tipo: string) => {
    if (tipo === 'personalizada') {
      if (!customExpanded) { setCustomExpanded(true); return }
      enviar(tipo, customText)
      return
    }
    enviar(tipo, buildMensagem(tipo, context))
  }

  const instanciaOk = !!instancia
  const canSend     = instanciaOk && temTelefone && !loadingInstancia

  return (
    <Dialog open={open} onOpenChange={(v) => { if (!v) onClose() }}>
      <DialogContent
        showCloseButton={false}
        className="bg-[var(--d2b-bg-elevated)] border border-[var(--d2b-border-strong)] text-[var(--d2b-text-primary)] !max-w-lg p-0 gap-0"
      >
        {/* ── Header ── */}
        <DialogHeader className="flex-row items-center justify-between px-5 py-3.5 border-b border-[var(--d2b-border)] space-y-0">
          <DialogTitle className="text-sm font-bold text-[var(--d2b-text-primary)]">Sistema de Mensagens</DialogTitle>
          <div className="flex items-center gap-2">
            <button className="text-xs font-medium text-[#7C4DFF] border border-[var(--d2b-border-strong)] px-3 py-1 rounded-md hover:bg-[var(--d2b-hover)] transition-colors">
              Editar Mensagens
            </button>
            <button
              onClick={onClose}
              className="w-7 h-7 flex items-center justify-center rounded-md text-[var(--d2b-text-secondary)] hover:text-[var(--d2b-text-primary)] hover:bg-[var(--d2b-hover)] transition-colors"
            >
              <X size={15} />
            </button>
          </div>
        </DialogHeader>

        {/* ── Warning banners ── */}
        {(loadingInstancia || !empresaId) ? (
          <div className="mx-4 mt-3 flex items-center gap-2 px-3 py-2 rounded-lg bg-[var(--d2b-hover)] border border-[var(--d2b-border)]">
            {loadingInstancia
              ? <Loader2 size={13} className="animate-spin text-[#7C4DFF]" />
              : <WifiOff size={13} className="text-[var(--d2b-text-secondary)]" />
            }
            <span className="text-xs text-[var(--d2b-text-secondary)]">
              {loadingInstancia ? 'Verificando instância WhatsApp...' : 'Empresa não identificada.'}
            </span>
          </div>
        ) : !instanciaOk ? (
          <div className="mx-4 mt-3 flex items-center gap-2 px-3 py-2 rounded-lg bg-[rgba(248,113,113,0.08)] border border-[rgba(248,113,113,0.2)]">
            <WifiOff size={13} className="text-[#F87171] shrink-0" />
            <span className="text-xs text-[#F87171]">
              WhatsApp não conectado. Configure em{' '}
              <span className="font-semibold">Configurações → WhatsApp</span>.
            </span>
          </div>
        ) : !temTelefone ? (
          <div className="mx-4 mt-3 flex items-center gap-2 px-3 py-2 rounded-lg bg-[rgba(250,204,21,0.08)] border border-[rgba(250,204,21,0.2)]">
            <PhoneOff size={13} className="text-[#FACC15] shrink-0" />
            <span className="text-xs text-[#FACC15]">
              Paciente sem número de telefone cadastrado.
            </span>
          </div>
        ) : null}

        {/* ── Message rows ── */}
        <div className="p-4 space-y-2">
          {TIPOS_MENSAGEM.map((m) => {
            const isSending      = enviando === m.id
            const isPersonalizada = m.id === 'personalizada'
            const showTextArea    = isPersonalizada && customExpanded

            return (
              <div
                key={m.id}
                className="rounded-xl border border-[var(--d2b-border)] bg-[var(--d2b-bg-elevated)] overflow-hidden"
              >
                <div className="flex items-center justify-between gap-3 px-4 py-3">
                  <div>
                    <p className="text-sm font-semibold text-[var(--d2b-text-primary)]">{m.titulo}</p>
                    <p className="text-xs text-[var(--d2b-text-secondary)] mt-0.5">{m.desc}</p>
                  </div>
                  <button
                    onClick={() => handleEnviar(m.id)}
                    disabled={!canSend || !!enviando}
                    className="flex items-center gap-1.5 text-xs font-bold text-white bg-[#7C4DFF] hover:bg-[#5B21B6] disabled:opacity-40 disabled:cursor-not-allowed px-3 py-1.5 rounded-md transition-colors shrink-0"
                  >
                    {isSending
                      ? <Loader2 size={11} className="animate-spin" />
                      : <Send size={11} />
                    }
                    {isPersonalizada && !customExpanded ? 'Escrever' : 'Enviar'}
                  </button>
                </div>

                {/* Inline textarea for "Personalize" */}
                {showTextArea && (
                  <div className="px-4 pb-3 space-y-2 border-t border-[var(--d2b-border)]">
                    <textarea
                      value={customText}
                      onChange={(e) => setCustomText(e.target.value)}
                      rows={3}
                      autoFocus
                      placeholder="Digite sua mensagem personalizada..."
                      className="w-full mt-2 bg-[var(--d2b-bg-main)] border border-[var(--d2b-border-strong)] rounded-md px-3 py-2 text-sm text-[var(--d2b-text-primary)] placeholder:text-[var(--d2b-text-muted)] focus:outline-none focus:border-[#7C4DFF] resize-none transition-colors"
                    />
                    <div className="flex justify-end gap-2">
                      <button
                        onClick={() => { setCustomExpanded(false); setCustomText('') }}
                        className="px-3 py-1.5 text-xs text-[var(--d2b-text-secondary)] border border-[var(--d2b-border-strong)] rounded-md hover:border-[#7C4DFF] transition-colors"
                      >
                        Cancelar
                      </button>
                      <button
                        onClick={() => enviar('personalizada', customText)}
                        disabled={!customText.trim() || !canSend || !!enviando}
                        className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-bold text-white bg-[#7C4DFF] hover:bg-[#5B21B6] disabled:opacity-40 disabled:cursor-not-allowed rounded-md transition-colors"
                      >
                        {enviando === 'personalizada'
                          ? <Loader2 size={11} className="animate-spin" />
                          : <Send size={11} />
                        }
                        Enviar
                      </button>
                    </div>
                  </div>
                )}
              </div>
            )
          })}
        </div>
      </DialogContent>
    </Dialog>
  )
}
