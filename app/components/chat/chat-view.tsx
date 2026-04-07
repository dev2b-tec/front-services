'use client'

import { useState, useEffect, useCallback } from 'react'
import { useSearchParams } from 'next/navigation'
import {
  MessageSquare, Search, X, ChevronRight,
  Phone, CheckCircle, Loader2, AlertCircle,
} from 'lucide-react'
import { ChatWindow } from '@/components/chat/chat-window'
import { useToast } from '@/hooks/use-toast'

// ─── Types ───────────────────────────────────────────────────────────────────

type StatusConversa = 'ATIVA' | 'EM_ATENDIMENTO' | 'AGUARDANDO' | 'FINALIZADA'

interface Conversa {
  id: string
  empresaId: string
  telefone: string
  nome: string | null
  clienteId: string | null
  status: StatusConversa
  createdAt: string
}

interface Props {
  empresaId: string | null
  initialConversas?: unknown[]
}

// ─── Helpers ─────────────────────────────────────────────────────────────────

function formatData(iso: string) {
  try {
    return new Intl.DateTimeFormat('pt-BR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    }).format(new Date(iso))
  } catch {
    return iso
  }
}

const STATUS_LABEL: Record<StatusConversa, string> = {
  ATIVA: 'Ativa',
  EM_ATENDIMENTO: 'Em atendimento',
  AGUARDANDO: 'Aguardando',
  FINALIZADA: 'Finalizada',
}

const STATUS_COLOR: Record<StatusConversa, string> = {
  ATIVA: '#22C55E',
  EM_ATENDIMENTO: '#38BDF8',
  AGUARDANDO: '#F59E0B',
  FINALIZADA: 'var(--d2b-text-muted)',
}

// ─── Shared styles ────────────────────────────────────────────────────────────

const INPUT_CLS =
  'w-full bg-[var(--d2b-bg-elevated)] border border-[var(--d2b-border)] rounded-md ' +
  'px-3 py-2.5 text-sm text-[var(--d2b-text-primary)] placeholder:text-[var(--d2b-text-muted)] ' +
  'focus:outline-none focus:border-[var(--d2b-brand)] transition-colors'

// ─── Painel de detalhes da conversa ──────────────────────────────────────────

function DetalhesConversa({
  conversa,
  onFinalizar,
  finalizando,
  onFechar,
}: {
  conversa: Conversa
  onFinalizar: (id: string) => void
  finalizando: boolean
  onFechar: () => void
}) {
  return (
    <div
      className="flex flex-col gap-4 p-5 border-b"
      style={{ background: 'var(--d2b-bg-surface)', borderColor: 'var(--d2b-border)' }}
    >
      {/* Cabeçalho */}
      <div className="flex items-start justify-between gap-2">
        <div className="flex items-center gap-3 min-w-0">
          <div
            className="w-10 h-10 rounded-full flex-shrink-0 flex items-center justify-center text-sm font-bold select-none"
            style={{ background: '#7C4DFF', color: '#fff' }}
          >
            {(conversa.nome ?? conversa.telefone).charAt(0).toUpperCase()}
          </div>
          <div className="min-w-0">
            <p
              className="font-semibold truncate"
              style={{ color: 'var(--d2b-text-primary)' }}
            >
              {conversa.nome ?? conversa.telefone}
            </p>
            {conversa.nome && (
              <p className="text-xs flex items-center gap-1" style={{ color: 'var(--d2b-text-muted)' }}>
                <Phone size={11} />
                {conversa.telefone}
              </p>
            )}
          </div>
        </div>
        <button
          onClick={onFechar}
          className="flex-shrink-0 p-1.5 rounded-full hover:bg-[var(--d2b-hover)] transition-colors"
          style={{ color: 'var(--d2b-text-muted)' }}
        >
          <X size={16} />
        </button>
      </div>

      {/* Dados */}
      <div className="grid grid-cols-2 gap-x-4 gap-y-2 text-xs">
        <div>
          <p style={{ color: 'var(--d2b-text-muted)' }}>Status</p>
          <p className="font-medium mt-0.5" style={{ color: STATUS_COLOR[conversa.status] }}>
            {STATUS_LABEL[conversa.status]}
          </p>
        </div>
        <div>
          <p style={{ color: 'var(--d2b-text-muted)' }}>Iniciada em</p>
          <p className="font-medium mt-0.5" style={{ color: 'var(--d2b-text-secondary)' }}>
            {formatData(conversa.createdAt)}
          </p>
        </div>
        {conversa.clienteId && (
          <div className="col-span-2">
            <p style={{ color: 'var(--d2b-text-muted)' }}>ID do Cliente</p>
            <p className="font-medium mt-0.5 truncate" style={{ color: 'var(--d2b-text-secondary)' }}>
              {conversa.clienteId}
            </p>
          </div>
        )}
      </div>

      {/* Botão finalizar */}
      {conversa.status !== 'FINALIZADA' && (
        <button
          onClick={() => onFinalizar(conversa.id)}
          disabled={finalizando}
          className="flex items-center justify-center gap-2 w-full py-2 rounded-lg text-sm font-medium transition-all"
          style={{
            background: finalizando ? 'var(--d2b-bg-elevated)' : 'rgba(239,68,68,0.12)',
            color: finalizando ? 'var(--d2b-text-muted)' : '#EF4444',
            border: '1px solid #EF4444',
          }}
        >
          {finalizando ? (
            <Loader2 size={14} className="animate-spin" />
          ) : (
            <CheckCircle size={14} />
          )}
          {finalizando ? 'Finalizando…' : 'Finalizar Conversa'}
        </button>
      )}
    </div>
  )
}

// ─── ChatView ────────────────────────────────────────────────────────────────

export function ChatView({ empresaId, initialConversas }: Props) {
  const { toast } = useToast()
  const searchParams = useSearchParams()
  const conversaIdParam = searchParams.get('conversaId')

  const [conversas, setConversas] = useState<Conversa[]>([])
  const [loading, setLoading] = useState(false)
  const [busca, setBusca] = useState('')
  const [somenteAtivas, setSomenteAtivas] = useState(false)
  const [selecionada, setSelecionada] = useState<Conversa | null>(null)
  const [finalizando, setFinalizando] = useState(false)
  const [instanciaId, setInstanciaId] = useState<string | null>(null)

  // ── Busca instância da empresa (cache em state) ───────────────────────────
  useEffect(() => {
    if (!empresaId || instanciaId) return
    fetch(`/api/v1/instancias/empresa/${empresaId}`)
      .then((r) => (r.ok ? r.json() : []))
      .then((lista: { id: string }[]) => {
        if (lista.length > 0) setInstanciaId(lista[0].id)
      })
      .catch(() => {})
  }, [empresaId, instanciaId])
  const carregar = useCallback(() => {
    if (!empresaId) return
    setLoading(true)
    fetch(`/api/v1/conversas/empresa/${empresaId}`)
      .then((r) => (r.ok ? r.json() : { content: [] }))
      .then((data) => {
        // Suporta tanto array direto quanto Page<>
        const lista: Conversa[] = Array.isArray(data) ? data : (data.content ?? [])
        setConversas(lista)
      })
      .catch(() => setConversas([]))
      .finally(() => setLoading(false))
  }, [empresaId])

  useEffect(() => { carregar() }, [carregar])

  // Auto-seleciona conversa pelo query param ?conversaId=
  useEffect(() => {
    if (!conversaIdParam || conversas.length === 0) return
    const found = conversas.find((c) => c.id === conversaIdParam)
    if (found) setSelecionada(found)
  }, [conversaIdParam, conversas])

  // ── Finalizar conversa ────────────────────────────────────────────────────
  const finalizar = useCallback(async (id: string) => {
    setFinalizando(true)
    try {
      const res = await fetch(`/api/v1/conversas/${id}/status`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: 'FINALIZADA' }),
      })
      if (res.ok) {
        setConversas((prev) =>
          prev.map((c) => (c.id === id ? { ...c, status: 'FINALIZADA' } : c))
        )
        setSelecionada((prev) => (prev?.id === id ? { ...prev, status: 'FINALIZADA' } : prev))
        toast({ title: 'Conversa finalizada.' })
      } else {
        toast({ title: 'Erro ao finalizar conversa.', variant: 'destructive' })
      }
    } catch {
      toast({ title: 'Erro de conexão.', variant: 'destructive' })
    } finally {
      setFinalizando(false)
    }
  }, [toast])

  // ── Filtro por busca + ativas ─────────────────────────────────────────────
  const ATIVAS: StatusConversa[] = ['ATIVA', 'EM_ATENDIMENTO', 'AGUARDANDO']
  const filtradas = conversas.filter((c) => {
    if (somenteAtivas && !ATIVAS.includes(c.status)) return false
    if (!busca) return true
    const q = busca.toLowerCase()
    return (
      c.telefone.toLowerCase().includes(q) ||
      (c.nome ?? '').toLowerCase().includes(q)
    )
  })

  // ─────────────────────────────────────────────────────────────────────────

  return (
    <div
      className="flex h-full"
      style={{ background: 'var(--d2b-bg-main)' }}
    >
      {/* ══ Coluna esquerda — lista de conversas ══════════════════════════ */}
      <div
        className="flex flex-col w-80 min-w-[280px] flex-shrink-0 border-r h-full overflow-hidden"
        style={{ background: 'var(--d2b-bg-surface)', borderColor: 'var(--d2b-border)' }}
      >
        {/* Cabeçalho */}
        <div className="px-4 pt-5 pb-3">
          <div className="flex items-center gap-2 mb-4">
            <MessageSquare size={20} style={{ color: 'var(--d2b-brand)' }} />
            <h1 className="text-lg font-semibold" style={{ color: 'var(--d2b-text-primary)' }}>
              Chat
            </h1>
          </div>

          {/* Busca */}
          <div className="relative">
            <Search
              size={15}
              className="absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none"
              style={{ color: 'var(--d2b-text-muted)' }}
            />
            <input
              className={INPUT_CLS + ' pl-9'}
              placeholder="Buscar conversa…"
              value={busca}
              onChange={(e) => setBusca(e.target.value)}
            />
          </div>

          {/* Toggle ativas */}
          <button
            onClick={() => setSomenteAtivas((v) => !v)}
            className="mt-2 flex items-center gap-1.5 text-xs font-medium px-2.5 py-1 rounded-full border transition-colors w-fit"
            style={somenteAtivas ? {
              background: 'rgba(34,197,94,0.12)',
              border: '1px solid rgba(34,197,94,0.35)',
              color: '#22C55E',
            } : {
              background: 'transparent',
              border: '1px solid var(--d2b-border-strong)',
              color: 'var(--d2b-text-muted)',
            }}
          >
            <span
              className="w-1.5 h-1.5 rounded-full"
              style={{ background: somenteAtivas ? '#22C55E' : 'var(--d2b-text-muted)' }}
            />
            Apenas ativas
          </button>
        </div>

        {/* Lista */}
        <div className="flex-1 overflow-y-auto">
          {!empresaId ? (
            <div className="flex flex-col items-center justify-center h-40 gap-2 text-sm px-4 text-center"
              style={{ color: 'var(--d2b-text-muted)' }}>
              <AlertCircle size={24} />
              Empresa não identificada.
            </div>
          ) : loading ? (
            <div className="flex items-center justify-center h-40">
              <Loader2 size={24} className="animate-spin" style={{ color: 'var(--d2b-brand)' }} />
            </div>
          ) : filtradas.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-40 gap-2 text-sm px-4 text-center"
              style={{ color: 'var(--d2b-text-muted)' }}>
              <MessageSquare size={24} />
              Nenhuma conversa encontrada.
            </div>
          ) : (
            filtradas.map((c) => (
              <button
                key={c.id}
                onClick={() => setSelecionada(c)}
                className="w-full flex items-center gap-3 px-4 py-3 text-left transition-colors hover:bg-[var(--d2b-hover)]"
                style={{
                  background:
                    selecionada?.id === c.id ? 'var(--d2b-active)' : 'transparent',
                  borderLeft:
                    selecionada?.id === c.id ? '3px solid var(--d2b-brand)' : '3px solid transparent',
                }}
              >
                {/* Avatar */}
                <div
                  className="w-9 h-9 rounded-full flex-shrink-0 flex items-center justify-center text-xs font-bold select-none"
                  style={{ background: '#7C4DFF', color: '#fff' }}
                >
                  {(c.nome ?? c.telefone).charAt(0).toUpperCase()}
                </div>

                {/* Info */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between gap-1">
                    <p
                      className="text-sm font-medium truncate"
                      style={{ color: 'var(--d2b-text-primary)' }}
                    >
                      {c.nome ?? c.telefone}
                    </p>
                    <span
                      className="text-[10px] flex-shrink-0"
                      style={{ color: STATUS_COLOR[c.status] }}
                    >
                      ●
                    </span>
                  </div>
                  {c.nome && (
                    <p className="text-xs truncate flex items-center gap-1" style={{ color: 'var(--d2b-text-muted)' }}>
                      <Phone size={10} />
                      {c.telefone}
                    </p>
                  )}
                  <p className="text-[10px] mt-0.5" style={{ color: 'var(--d2b-text-muted)' }}>
                    {STATUS_LABEL[c.status]}
                  </p>
                </div>

                <ChevronRight size={14} style={{ color: 'var(--d2b-text-muted)' }} className="flex-shrink-0" />
              </button>
            ))
          )}
        </div>
      </div>

      {/* ══ Coluna direita — detalhe + chat ══════════════════════════════════ */}
      <div className="flex-1 flex flex-col min-w-0 h-full overflow-hidden">
        {selecionada ? (
          <>
            {/* Dados da conversa + botão finalizar */}
            <DetalhesConversa
              conversa={selecionada}
              onFinalizar={finalizar}
              finalizando={finalizando}
              onFechar={() => setSelecionada(null)}
            />

            {/* Janela de chat */}
            <div className="flex-1 min-h-0">
              <ChatWindow
                conversaId={selecionada.id}
                instanciaId={instanciaId ?? selecionada.empresaId}
                telefone={selecionada.telefone}
              />
            </div>
          </>
        ) : (
          <div
            className="flex-1 flex flex-col items-center justify-center gap-3"
            style={{ color: 'var(--d2b-text-muted)' }}
          >
            <MessageSquare size={48} strokeWidth={1.2} style={{ color: 'var(--d2b-border)' }} />
            <p className="text-sm">Selecione uma conversa para abrir o chat</p>
          </div>
        )}
      </div>
    </div>
  )
}
