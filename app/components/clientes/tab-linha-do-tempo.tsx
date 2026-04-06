'use client'

import { useState, useEffect, useCallback } from 'react'
import { Eye, Download, Clock, FileText, Heart, AlertCircle, RefreshCw } from 'lucide-react'
import { NovaEvolucaoModal, EvolucaoApi } from '@/components/clientes/tab-evolucoes'
import { NovoAgendamentoModal, ApiAgendamento, Profissional } from '@/components/calendario/calendario-view'
import { useToast } from '@/hooks/use-toast'

// ─── Types ───────────────────────────────────────────────────────────────────

type TipoEvento = 'EVOLUCAO' | 'AGENDAMENTO' | 'ANAMNESE' | 'DOCUMENTO'

type EventoTimeline = {
  id: string
  pacienteId: string
  tipo: TipoEvento
  titulo: string | null
  profissional: string | null
  referenciaId: string | null
  data: string        // yyyy-MM-dd
  hora: string | null // HH:mm:ss
  assinado: boolean
}

type GrupoData = {
  dataLabel: string
  data: string
  eventos: EventoTimeline[]
}

// ─── Helpers ─────────────────────────────────────────────────────────────────

function formatDateLabel(iso: string): string {
  const [year, month, day] = iso.split('-').map(Number)
  const d = new Date(year, month - 1, day)
  return d.toLocaleDateString('pt-BR', { day: 'numeric', month: 'long', year: 'numeric' })
}

function formatHora(hora: string | null): string {
  if (!hora) return ''
  return hora.substring(0, 5) // HH:mm
}

function groupByDate(eventos: EventoTimeline[]): GrupoData[] {
  const map = new Map<string, EventoTimeline[]>()
  for (const ev of eventos) {
    const list = map.get(ev.data) ?? []
    list.push(ev)
    map.set(ev.data, list)
  }
  return Array.from(map.entries())
    .sort(([a], [b]) => b.localeCompare(a))
    .map(([data, evs]) => ({
      data,
      dataLabel: formatDateLabel(data),
      eventos: evs,
    }))
}

// ─── TipoEventoConfig ─────────────────────────────────────────────────────────

function TipoBadge({ tipo }: { tipo: TipoEvento }) {
  const map: Record<TipoEvento, { label: string; bg: string; text: string }> = {
    EVOLUCAO:   { label: 'Evolução',   bg: 'bg-[var(--d2b-hover)]',  text: 'text-[#C084FC]' },
    AGENDAMENTO:{ label: 'Agendamento',bg: 'bg-[rgba(16,185,129,0.15)]',  text: 'text-[#10B981]' },
    ANAMNESE:   { label: 'Anamnese',   bg: 'bg-[rgba(245,158,11,0.15)]',  text: 'text-[#F59E0B]' },
    DOCUMENTO:  { label: 'Documento',  bg: 'bg-[rgba(59,130,246,0.15)]',  text: 'text-[#60A5FA]' },
  }
  const cfg = map[tipo] ?? map.EVOLUCAO
  return (
    <span className={`text-[9px] font-bold px-2 py-0.5 rounded-full ${cfg.bg} ${cfg.text}`}>
      {cfg.label}
    </span>
  )
}

// ─── EventoCard ───────────────────────────────────────────────────────────────

function EventoCard({
  evento,
  onVisualizar,
}: {
  evento: EventoTimeline
  onVisualizar: (ev: EventoTimeline) => void
}) {
  const [expandido, setExpandido] = useState(false)

  const assinado = evento.assinado
  const accentColor = evento.tipo === 'DOCUMENTO' ? '#3B82F6'
    : assinado ? '#10B981' : '#F59E0B'
  const dotBg = evento.tipo === 'DOCUMENTO' ? 'bg-[#3B82F6]'
    : assinado ? 'bg-[#10B981]' : 'bg-[#F59E0B]'
  const profColor = evento.tipo === 'DOCUMENTO' ? 'text-[#60A5FA]'
    : assinado ? 'text-[#10B981]' : 'text-[#F59E0B]'

  return (
    <div className="relative flex items-start gap-4">
      {/* Timeline dot */}
      <div className={`relative z-10 flex-shrink-0 w-9 h-9 rounded-full ${dotBg} flex items-center justify-center shadow-lg mt-1`}>
        {evento.tipo === 'DOCUMENTO'
          ? <FileText size={16} className="text-white" />
          : assinado
          ? <Heart size={16} className="text-white" fill="white" />
          : <FileText size={16} className="text-white" />
        }
      </div>

      {/* Card */}
      <div className="flex-1 bg-[var(--d2b-bg-surface)] border border-[var(--d2b-border)] rounded-xl overflow-hidden">
        {/* Accent bar */}
        <div className="h-0.5 w-full" style={{ background: accentColor }} />

        <div className="p-4">
          {/* Header row */}
          <div className="flex items-start justify-between gap-2">
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 mb-1">
                <TipoBadge tipo={evento.tipo} />
              </div>
              <p className="text-sm font-bold text-[var(--d2b-text-primary)] truncate">
                {evento.titulo ?? '(sem título)'}
              </p>
              {evento.hora && (
                <div className="flex items-center gap-1 text-xs text-[var(--d2b-text-secondary)] mt-0.5">
                  <Clock size={10} />
                  {formatHora(evento.hora)}
                </div>
              )}
              {!evento.hora && (
                <p className="text-xs text-[var(--d2b-text-muted)] mt-0.5">
                  {formatDateLabel(evento.data)}
                </p>
              )}
            </div>
            <button
              onClick={() => setExpandido((v) => !v)}
              className="flex-shrink-0 text-[var(--d2b-text-muted)] hover:text-[var(--d2b-text-secondary)] transition-colors mt-0.5"
            >
              {expandido
                ? <svg width="14" height="14" viewBox="0 0 14 14" fill="none"><path d="M3 9L7 5L11 9" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/></svg>
                : <svg width="14" height="14" viewBox="0 0 14 14" fill="none"><path d="M3 5L7 9L11 5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/></svg>
              }
            </button>
          </div>

          {/* Profissional row */}
          <div className="mt-2 pt-2 border-t border-[var(--d2b-border)]">
            <p className="text-[10px] font-bold tracking-widest text-[var(--d2b-text-muted)] mb-0.5">PROFISSIONAL</p>
            <p className={`text-xs font-semibold ${profColor}`}>{evento.profissional ?? '—'}</p>
          </div>

          {/* Expanded: detail preview */}
          {expandido && (
            <div className="mt-3 pt-2 border-t border-[var(--d2b-border)] space-y-1">
              <p className="text-[10px] text-[var(--d2b-text-muted)]">
                {evento.tipo === 'DOCUMENTO'
                  ? 'Documento criado'
                  : evento.tipo === 'ANAMNESE'
                  ? 'Anamnese respondida'
                  : assinado ? 'Evolução assinada' : 'Evolução pendente de assinatura'}
              </p>
            </div>
          )}

          {/* Action buttons */}
          <div className="flex items-center gap-2 mt-3">
            <button
              className="flex items-center gap-1.5 text-xs font-semibold text-[var(--d2b-text-secondary)] border border-[var(--d2b-border-strong)] hover:border-[#7C4DFF] hover:text-[var(--d2b-text-primary)] px-3 py-1.5 rounded-lg transition-colors"
            >
              <Download size={11} /> Download
            </button>
            {evento.referenciaId && (
              <button
                onClick={() => onVisualizar(evento)}
                className="flex items-center gap-1.5 text-xs font-bold text-white bg-[#7C4DFF] hover:bg-[#5B21B6] px-3 py-1.5 rounded-lg transition-colors"
              >
                <Eye size={11} /> Visualizar
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}

// ─── TabLinhaTempo ────────────────────────────────────────────────────────────

export function TabLinhaTempo({ pacienteId, empresaId, onIrParaAnamnese }: { pacienteId: string; empresaId: string; onIrParaAnamnese?: () => void }) {
  const { toast } = useToast()
  const [grupos, setGrupos] = useState<GrupoData[]>([])
  const [carregando, setCarregando] = useState(true)
  const [evolucaoModal, setEvolucaoModal] = useState<EvolucaoApi | null>(null)
  const [buscandoEvolucao, setBuscandoEvolucao] = useState(false)
  const [documentoModal, setDocumentoModal] = useState<{ titulo: string; conteudo: string } | null>(null)
  const [buscandoDocumento, setBuscandoDocumento] = useState(false)
  const [agendamentoModal, setAgendamentoModal] = useState<ApiAgendamento | null>(null)
  const [buscandoAgendamento, setBuscandoAgendamento] = useState(false)

  const carregarTimeline = useCallback(async () => {
    setCarregando(true)
    try {
      const res = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/api/v1/linha-do-tempo/paciente/${pacienteId}`
      )
      if (!res.ok) throw new Error('Falha ao carregar linha do tempo')
      const data: EventoTimeline[] = await res.json()
      setGrupos(groupByDate(data))
    } catch {
      toast({ title: 'Erro', description: 'Não foi possível carregar a linha do tempo.', variant: 'destructive' })
    } finally {
      setCarregando(false)
    }
  }, [pacienteId, toast])

  useEffect(() => {
    carregarTimeline()
  }, [carregarTimeline])

  async function handleVisualizar(evento: EventoTimeline) {
    if (!evento.referenciaId) return

    if (evento.tipo === 'ANAMNESE') {
      onIrParaAnamnese?.()
      return
    }

    if (evento.tipo === 'DOCUMENTO') {
      setBuscandoDocumento(true)
      try {
        const res = await fetch(
          `${process.env.NEXT_PUBLIC_API_URL}/api/v1/documentos/${evento.referenciaId}`
        )
        if (!res.ok) throw new Error()
        const doc: { titulo: string; conteudo?: string } = await res.json()
        setDocumentoModal({ titulo: doc.titulo, conteudo: doc.conteudo ?? '' })
      } catch {
        toast({ title: 'Erro', description: 'Não foi possível carregar o documento.', variant: 'destructive' })
      } finally {
        setBuscandoDocumento(false)
      }
      return
    }

    if (evento.tipo === 'EVOLUCAO') {
      setBuscandoEvolucao(true)
      try {
        const res = await fetch(
          `${process.env.NEXT_PUBLIC_API_URL}/api/v1/evolucoes/${evento.referenciaId}`
        )
        if (!res.ok) throw new Error('Evolução não encontrada')
        const ev: EvolucaoApi = await res.json()
        setEvolucaoModal(ev)
      } catch {
        toast({ title: 'Erro', description: 'Não foi possível carregar a evolução.', variant: 'destructive' })
      } finally {
        setBuscandoEvolucao(false)
      }
    }

    if (evento.tipo === 'AGENDAMENTO') {
      setBuscandoAgendamento(true)
      try {
        const res = await fetch(
          `${process.env.NEXT_PUBLIC_API_URL}/api/v1/agendamentos/${evento.referenciaId}`
        )
        if (!res.ok) throw new Error('Agendamento não encontrado')
        const ag: ApiAgendamento = await res.json()
        setAgendamentoModal(ag)
      } catch {
        toast({ title: 'Erro', description: 'Não foi possível carregar o agendamento.', variant: 'destructive' })
      } finally {
        setBuscandoAgendamento(false)
      }
    }
  }

  return (
    <div className="flex-1 overflow-y-auto p-6">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-base font-semibold text-[var(--d2b-text-primary)]">Linha do Tempo</h2>
          <p className="text-xs text-[var(--d2b-text-secondary)] mt-0.5">Histórico de atendimentos e evoluções do paciente.</p>
        </div>
        <button
          onClick={carregarTimeline}
          disabled={carregando}
          className="flex items-center gap-1.5 text-xs text-[var(--d2b-text-secondary)] hover:text-[var(--d2b-text-primary)] border border-[var(--d2b-border-strong)] hover:border-[#7C4DFF] px-3 py-1.5 rounded-lg transition-colors disabled:opacity-50"
        >
          <RefreshCw size={11} className={carregando ? 'animate-spin' : ''} />
          Atualizar
        </button>
      </div>

      {/* Loading */}
      {carregando && (
        <div className="flex items-center justify-center py-16 gap-3 text-[var(--d2b-text-muted)]">
          <RefreshCw size={16} className="animate-spin" />
          <span className="text-sm">Carregando histórico...</span>
        </div>
      )}

      {/* Empty */}
      {!carregando && grupos.length === 0 && (
        <div className="flex flex-col items-center justify-center py-20 gap-3 text-center">
          <div className="w-12 h-12 rounded-full bg-[var(--d2b-hover)] flex items-center justify-center">
            <AlertCircle size={20} className="text-[var(--d2b-text-muted)]" />
          </div>
          <p className="text-sm font-semibold text-[var(--d2b-text-secondary)]">Nenhum registro encontrado</p>
          <p className="text-xs text-[var(--d2b-text-muted)]">Os eventos do paciente aparecerão aqui.</p>
        </div>
      )}

      {/* Timeline */}
      {!carregando && grupos.length > 0 && (
        <div className="max-w-2xl mx-auto">
          {grupos.map((grupo, gi) => (
            <div key={grupo.data} className={gi > 0 ? 'mt-8' : ''}>
              {/* Date label */}
              <div className="flex items-center gap-3 mb-4">
                <div className="flex-1 h-px bg-[var(--d2b-hover)]" />
                <p className="text-sm font-bold text-[var(--d2b-text-primary)] whitespace-nowrap">{grupo.dataLabel}</p>
                <div className="flex-1 h-px bg-[var(--d2b-hover)]" />
              </div>

              {/* Events for this date */}
              <div className="relative pl-5">
                {/* Vertical spine */}
                <div className="absolute left-[17px] top-4 bottom-4 w-px bg-[var(--d2b-hover)]" />

                <div className="space-y-4">
                  {grupo.eventos.map((ev) => (
                    <EventoCard
                      key={ev.id}
                      evento={ev}
                      onVisualizar={handleVisualizar}
                    />
                  ))}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Buscando evolução overlay */}
      {buscandoEvolucao && (
        <div className="fixed inset-0 z-40 flex items-center justify-center bg-black/50">
          <div className="flex items-center gap-3 bg-[var(--d2b-bg-elevated)] border border-[var(--d2b-border-strong)] rounded-xl px-6 py-4">
            <RefreshCw size={16} className="animate-spin text-[#7C4DFF]" />
            <span className="text-sm text-[var(--d2b-text-primary)]">Carregando evolução...</span>
          </div>
        </div>
      )}

      {buscandoAgendamento && (
        <div className="fixed inset-0 z-40 flex items-center justify-center bg-black/50">
          <div className="flex items-center gap-3 bg-[var(--d2b-bg-elevated)] border border-[var(--d2b-border-strong)] rounded-xl px-6 py-4">
            <RefreshCw size={16} className="animate-spin text-[#10B981]" />
            <span className="text-sm text-[var(--d2b-text-primary)]">Carregando agendamento...</span>
          </div>
        </div>
      )}

      {buscandoDocumento && (
        <div className="fixed inset-0 z-40 flex items-center justify-center bg-black/50">
          <div className="flex items-center gap-3 bg-[var(--d2b-bg-elevated)] border border-[var(--d2b-border-strong)] rounded-xl px-6 py-4">
            <RefreshCw size={16} className="animate-spin text-[#3B82F6]" />
            <span className="text-sm text-[var(--d2b-text-primary)]">Carregando documento...</span>
          </div>
        </div>
      )}

      {/* NovoAgendamentoModal for visualizar */}
      {agendamentoModal && (
        <NovoAgendamentoModal
          open
          onClose={() => setAgendamentoModal(null)}
          empresaId={empresaId}
          profissionaisApi={[] as Profissional[]}
          agendamento={agendamentoModal}
          onSaved={() => {
            setAgendamentoModal(null)
            carregarTimeline()
          }}
        />
      )}

      {/* NovaEvolucaoModal for visualizar */}
      {evolucaoModal && (
        <NovaEvolucaoModal
          pacienteId={pacienteId}
          evolucao={evolucaoModal}
          onClose={() => setEvolucaoModal(null)}
          onSaved={() => {
            setEvolucaoModal(null)
            carregarTimeline()
          }}
        />
      )}

      {documentoModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-6">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-3xl max-h-[90vh] flex flex-col">
            <div className="flex items-center justify-between px-7 py-4 border-b border-gray-200">
              <span className="text-base font-semibold text-gray-900">{documentoModal.titulo}</span>
              <button
                onClick={() => setDocumentoModal(null)}
                className="w-7 h-7 flex items-center justify-center rounded-lg text-gray-400 hover:text-gray-700 hover:bg-gray-100 transition-colors"
              >
                <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
              </button>
            </div>
            <div className="flex-1 overflow-y-auto px-16 py-12">
              {/<[a-z][\s\S]*>/i.test(documentoModal.conteudo)
                ? <div className="text-gray-900 text-sm leading-relaxed prose prose-sm max-w-none" dangerouslySetInnerHTML={{ __html: documentoModal.conteudo }} />
                : <div className="text-gray-900 text-sm leading-relaxed whitespace-pre-wrap font-serif">{documentoModal.conteudo}</div>
              }
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
