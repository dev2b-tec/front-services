'use client'

import { useState, useEffect, useRef, useCallback } from 'react'
import { Send, Paperclip, Image as ImageIcon, FileText, Loader2 } from 'lucide-react'
import {
  useConversaWebSocket,
  type MensagemWs,
} from '@/hooks/use-conversa-websocket'

// ─── Types ──────────────────────────────────────────────────────────────────

export interface MensagemDto {
  id: string
  conversaId: string
  texto: string | null
  urlArquivo: string | null
  recebidaEm: string
  enviada: boolean
}

interface Props {
  conversaId: string
  instanciaId: string
  telefone: string
}

// ─── Helpers ────────────────────────────────────────────────────────────────

function formatHora(iso: string) {
  try {
    return new Intl.DateTimeFormat('pt-BR', {
      hour: '2-digit',
      minute: '2-digit',
    }).format(new Date(iso))
  } catch {
    return ''
  }
}

function isImage(url: string | null) {
  if (!url) return false
  return /\.(jpg|jpeg|png|gif|webp)(\?|$)/i.test(url)
}

// ─── Balão de mensagem ───────────────────────────────────────────────────────

function Balao({ msg }: { msg: MensagemDto }) {
  const mine = msg.enviada

  return (
    <div className={`flex ${mine ? 'justify-end' : 'justify-start'} mb-2`}>
      <div
        className="max-w-[72%] rounded-2xl px-4 py-2.5 text-sm shadow-md"
        style={{
          background: mine
            ? 'linear-gradient(135deg, #7C4DFF 0%, #5B21B6 100%)'
            : 'var(--d2b-bg-elevated)',
          color: mine ? '#F5F0FF' : 'var(--d2b-text-primary)',
          borderBottomRightRadius: mine ? 4 : undefined,
          borderBottomLeftRadius: mine ? undefined : 4,
          border: mine ? 'none' : '1px solid var(--d2b-border)',
        }}
      >
        {/* Mídia */}
        {msg.urlArquivo && (
          <div className="mb-1.5">
            {isImage(msg.urlArquivo) ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={msg.urlArquivo}
                alt="imagem"
                className="rounded-xl max-h-56 w-auto object-cover"
              />
            ) : (
              <a
                href={msg.urlArquivo}
                target="_blank"
                rel="noreferrer"
                className="flex items-center gap-2 underline opacity-90"
              >
                <FileText size={16} />
                <span>Abrir arquivo</span>
              </a>
            )}
          </div>
        )}

        {/* Texto */}
        {msg.texto && <p className="leading-snug whitespace-pre-wrap break-words">{msg.texto}</p>}

        {/* Hora */}
        <p
          className="text-[10px] mt-1 text-right opacity-60"
          style={{ color: mine ? '#C084FC' : 'var(--d2b-text-muted)' }}
        >
          {formatHora(msg.recebidaEm)}
        </p>
      </div>
    </div>
  )
}

// ─── ChatWindow ──────────────────────────────────────────────────────────────

export function ChatWindow({ conversaId, instanciaId, telefone }: Props) {
  const [mensagens, setMensagens] = useState<MensagemDto[]>([])
  const [texto, setTexto] = useState('')
  const [loading, setLoading] = useState(true)
  const [enviando, setEnviando] = useState(false)
  const bottomRef = useRef<HTMLDivElement>(null)
  const textareaRef = useRef<HTMLTextAreaElement>(null)

  // ── Carrega histórico ──────────────────────────────────────────────────────
  useEffect(() => {
    setLoading(true)
    fetch(`/api/v1/conversas/${conversaId}/mensagens?size=200&sort=recebidaEm,asc`)
      .then((r) => (r.ok ? r.json() : { content: [] }))
      .then((data) => {
        // Suporta tanto array direto quanto Page<>
        const lista: MensagemDto[] = Array.isArray(data) ? data : (data.content ?? [])
        setMensagens(lista)
      })
      .catch(() => {})
      .finally(() => setLoading(false))
  }, [conversaId])

  // ── Scroll para o final quando chegam mensagens ────────────────────────────
  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [mensagens])

  // ── WebSocket — apenas mensagens RECEBIDAS ─────────────────────────────────
  const handleWs = useCallback((msg: MensagemWs) => {
    if (msg.conversaId !== conversaId) return
    setMensagens((prev) => {
      // evita duplicata caso a lista já contenha o id
      if (prev.some((m) => m.id === msg.id)) return prev
      return [...prev, msg as MensagemDto]
    })
  }, [conversaId])

  useConversaWebSocket(conversaId, handleWs)

  // ── Enviar mensagem ────────────────────────────────────────────────────────
  const enviar = useCallback(async () => {
    const conteudo = texto.trim()
    if (!conteudo || enviando) return

    setEnviando(true)
    setTexto('')
    textareaRef.current?.focus()

    // Otimista: exibe imediatamente na tela
    const msgOtimista: MensagemDto = {
      id: `tmp-${Date.now()}`,
      conversaId,
      texto: conteudo,
      urlArquivo: null,
      recebidaEm: new Date().toISOString(),
      enviada: true,
    }
    setMensagens((prev) => [...prev, msgOtimista])

    try {
      await fetch('/api/v1/mensagens/enviar', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          instanciaId,
          numero: telefone,
          texto: conteudo,
        }),
      })
    } catch {
      // Remove a mensagem otimista e restaura o texto em caso de falha
      setMensagens((prev) => prev.filter((m) => m.id !== msgOtimista.id))
      setTexto(conteudo)
    } finally {
      setEnviando(false)
    }
  }, [conversaId, instanciaId, telefone, texto, enviando])

  const onKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      enviar()
    }
  }

  // ─────────────────────────────────────────────────────────────────────────

  return (
    <div className="flex flex-col h-full">
      {/* ── Área de mensagens ─────────────────────────────────────────────── */}
      <div
        className="flex-1 overflow-y-auto px-4 py-4"
        style={{ background: 'var(--d2b-bg-main)' }}
      >
        {loading ? (
          <div className="flex items-center justify-center h-full">
            <Loader2 size={28} className="animate-spin" style={{ color: 'var(--d2b-brand)' }} />
          </div>
        ) : mensagens.length === 0 ? (
          <div
            className="flex items-center justify-center h-full text-sm"
            style={{ color: 'var(--d2b-text-muted)' }}
          >
            Nenhuma mensagem ainda.
          </div>
        ) : (
          mensagens.map((m) => <Balao key={m.id} msg={m} />)
        )}
        <div ref={bottomRef} />
      </div>

      {/* ── Input ─────────────────────────────────────────────────────────── */}
      <div
        className="flex items-end gap-2 px-4 py-3 border-t"
        style={{
          background: 'var(--d2b-bg-elevated)',
          borderColor: 'var(--d2b-border)',
        }}
      >
        <button
          title="Anexar arquivo"
          className="flex-shrink-0 p-2 rounded-full transition-colors hover:bg-[var(--d2b-hover)]"
          style={{ color: 'var(--d2b-text-muted)' }}
          type="button"
        >
          <Paperclip size={18} />
        </button>

        <button
          title="Enviar imagem"
          className="flex-shrink-0 p-2 rounded-full transition-colors hover:bg-[var(--d2b-hover)]"
          style={{ color: 'var(--d2b-text-muted)' }}
          type="button"
        >
          <ImageIcon size={18} />
        </button>

        <textarea
          ref={textareaRef}
          rows={1}
          className="flex-1 resize-none rounded-2xl px-4 py-2.5 text-sm outline-none transition-colors"
          style={{
            background: 'var(--d2b-bg-surface)',
            border: '1px solid var(--d2b-border)',
            color: 'var(--d2b-text-primary)',
            maxHeight: 120,
          }}
          placeholder="Digite uma mensagem…"
          value={texto}
          onChange={(e) => {
            setTexto(e.target.value)
            // auto-crescimento
            e.target.style.height = 'auto'
            e.target.style.height = `${e.target.scrollHeight}px`
          }}
          onKeyDown={onKeyDown}
        />

        <button
          onClick={enviar}
          disabled={!texto.trim() || enviando}
          className="flex-shrink-0 p-2.5 rounded-full transition-all"
          style={{
            background: texto.trim() && !enviando ? 'var(--d2b-brand)' : 'var(--d2b-bg-surface)',
            color: texto.trim() && !enviando ? '#fff' : 'var(--d2b-text-muted)',
            border: '1px solid var(--d2b-border)',
          }}
          type="button"
        >
          {enviando ? (
            <Loader2 size={18} className="animate-spin" />
          ) : (
            <Send size={18} />
          )}
        </button>
      </div>
    </div>
  )
}
