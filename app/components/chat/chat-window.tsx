'use client'

import { useState, useEffect, useRef, useCallback } from 'react'
import {
  Send,
  Paperclip,
  Mic,
  Smile,
  MapPin,
  FileText,
  Play,
  Loader2,
  X,
  Square,
} from 'lucide-react'
import {
  useConversaWebSocket,
  type MensagemWs,
} from '@/hooks/use-conversa-websocket'

// ─── Types ───────────────────────────────────────────────────────────────────

export interface MensagemDto {
  id: string
  conversaId: string
  texto: string | null
  urlArquivo: string | null
  recebidaEm: string
  enviada: boolean
  tipo?: string
  nomeArquivo?: string | null
  latitude?: number | null
  longitude?: number | null
}

interface Props {
  conversaId: string
  instanciaId: string
  telefone: string
}

// ─── Emoji rápidos ───────────────────────────────────────────────────────────
const EMOJIS = [
  '😀','😂','😍','😊','🥰','😎','😢','😅','🤔','😮',
  '👍','👎','👏','🙏','🤝','❤️','🔥','⭐','✅','❌',
  '🎉','🎁','💡','📢','🏆','💰','📞','💬','🕐','📋',
  '😡','😤','🤯','😴','🤑','🥳','😷','🤒','😱','🤫',
]

// ─── Helpers ─────────────────────────────────────────────────────────────────

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

function isImage(url: string | null, tipo?: string) {
  if (tipo === 'IMAGEM') return true
  if (!url) return false
  return /\.(jpg|jpeg|png|gif|webp)(\?|$)/i.test(url)
}

function isVideo(url: string | null, tipo?: string) {
  if (tipo === 'VIDEO') return true
  if (tipo === 'AUDIO_PTT') return false // ogg pode estar na URL mas é áudio
  if (!url) return false
  return /\.(mp4|webm|mov)(\?|$)/i.test(url) // ogg excluído — é formato de áudio
}

function isAudio(url: string | null, tipo?: string) {
  if (tipo === 'AUDIO_PTT') return true
  if (!url) return false
  return /\.(ogg|mp3|m4a|aac|wav|opus)(\?|$)/i.test(url)
}

// ─── Balão de mensagem ───────────────────────────────────────────────────────

function Balao({ msg }: { msg: MensagemDto }) {
  const mine = msg.enviada

  const bubbleStyle: React.CSSProperties = {
    background: mine
      ? 'linear-gradient(135deg, #7C4DFF 0%, #5B21B6 100%)'
      : 'var(--d2b-bg-elevated)',
    color: mine ? '#F5F0FF' : 'var(--d2b-text-primary)',
    borderBottomRightRadius: mine ? 4 : undefined,
    borderBottomLeftRadius: mine ? undefined : 4,
    border: mine ? 'none' : '1px solid var(--d2b-border)',
  }

  const horaColor = mine ? '#C084FC' : 'var(--d2b-text-muted)'

  return (
    <div className={`flex ${mine ? 'justify-end' : 'justify-start'} mb-2`}>
      <div className="max-w-[72%] rounded-2xl px-4 py-2.5 text-sm shadow-md" style={bubbleStyle}>

        {/* ── Imagem ── */}
        {isImage(msg.urlArquivo ?? null, msg.tipo) && msg.urlArquivo && (
          <div className="mb-1.5">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={msg.urlArquivo}
              alt={msg.nomeArquivo ?? 'imagem'}
              className="rounded-xl max-h-56 w-auto object-cover cursor-pointer"
              onClick={() => window.open(msg.urlArquivo!, '_blank')}
            />
          </div>
        )}

        {/* ── Vídeo ── */}
        {isVideo(msg.urlArquivo ?? null, msg.tipo) && msg.urlArquivo && (
          <div className="mb-1.5">
            <video
              src={msg.urlArquivo}
              controls
              className="rounded-xl max-h-56 w-full"
            />
          </div>
        )}

        {/* ── Áudio PTT ── */}
        {isAudio(msg.urlArquivo ?? null, msg.tipo) && msg.urlArquivo && (
          <div className="mb-1.5 flex items-center gap-2">
            <Play size={16} className="opacity-70" />
            <audio src={msg.urlArquivo} controls className="h-8 max-w-[200px]" />
          </div>
        )}

        {/* ── Localização ── */}
        {msg.tipo === 'LOCALIZACAO' && (
          <a
            href={`https://maps.google.com/?q=${msg.latitude},${msg.longitude}`}
            target="_blank"
            rel="noreferrer"
            className="flex items-center gap-2 underline opacity-90 mb-1.5"
          >
            <MapPin size={16} />
            <span>{msg.texto ?? `${msg.latitude}, ${msg.longitude}`}</span>
          </a>
        )}

        {/* ── Documento ── */}
        {msg.tipo === 'DOCUMENTO' && msg.urlArquivo && (
          <a
            href={msg.urlArquivo}
            target="_blank"
            rel="noreferrer"
            className="flex items-center gap-2 underline opacity-90 mb-1.5"
          >
            <FileText size={16} />
            <span>{msg.nomeArquivo ?? 'Abrir arquivo'}</span>
          </a>
        )}

        {/* ── Texto (captura de mídia ou mensagem pura) ── */}
        {msg.texto && msg.tipo !== 'LOCALIZACAO' && (
          <p className="leading-snug whitespace-pre-wrap break-words">{msg.texto}</p>
        )}

        {/* ── Hora ── */}
        <p className="text-[10px] mt-1 text-right opacity-60" style={{ color: horaColor }}>
          {formatHora(msg.recebidaEm)}
        </p>
      </div>
    </div>
  )
}

// ─── Emoji Picker ─────────────────────────────────────────────────────────────

function EmojiPicker({ onSelect, onClose }: { onSelect: (e: string) => void; onClose: () => void }) {
  return (
    <div
      className="absolute bottom-full mb-2 left-0 z-50 rounded-2xl shadow-xl p-3 grid grid-cols-10 gap-1 w-72"
      style={{ background: 'var(--d2b-bg-elevated)', border: '1px solid var(--d2b-border)' }}
    >
      <button
        className="col-span-10 text-right p-0.5 opacity-50 hover:opacity-100"
        onClick={onClose}
        type="button"
      >
        <X size={12} className="ml-auto" />
      </button>
      {EMOJIS.map((e) => (
        <button
          key={e}
          type="button"
          onClick={() => onSelect(e)}
          className="text-xl rounded-lg p-1 hover:bg-[var(--d2b-hover)] transition-colors"
        >
          {e}
        </button>
      ))}
    </div>
  )
}

// ─── ChatWindow ───────────────────────────────────────────────────────────────

export function ChatWindow({ conversaId, instanciaId, telefone }: Props) {
  const [mensagens, setMensagens] = useState<MensagemDto[]>([])
  const [texto, setTexto] = useState('')
  const [loading, setLoading] = useState(true)
  const [enviando, setEnviando] = useState(false)
  const [showEmoji, setShowEmoji] = useState(false)

  // Áudio
  const [gravando, setGravando] = useState(false)
  const [audioBlob, setAudioBlob] = useState<Blob | null>(null)
  const [audioDuration, setAudioDuration] = useState(0)
  const mediaRecorderRef = useRef<MediaRecorder | null>(null)
  const audioChunksRef = useRef<Blob[]>([])
  const audioTimerRef = useRef<ReturnType<typeof setInterval> | null>(null)

  // Arquivo em espera
  const [arquivoPendente, setArquivoPendente] = useState<File | null>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)

  // URL estável do blob de áudio (recriada apenas quando audioBlob muda)
  const [audioBlobUrl, setAudioBlobUrl] = useState<string | null>(null)
  useEffect(() => {
    if (!audioBlob) { setAudioBlobUrl(null); return }
    const url = URL.createObjectURL(audioBlob)
    setAudioBlobUrl(url)
    return () => URL.revokeObjectURL(url)
  }, [audioBlob])

  const bottomRef = useRef<HTMLDivElement>(null)
  const textareaRef = useRef<HTMLTextAreaElement>(null)

  // ── Carrega histórico ─────────────────────────────────────────────────────
  useEffect(() => {
    setLoading(true)
    fetch(`/api/v1/conversas/${conversaId}/mensagens?size=200&sort=recebidaEm,asc`)
      .then((r) => (r.ok ? r.json() : { content: [] }))
      .then((data) => {
        const lista: MensagemDto[] = Array.isArray(data) ? data : (data.content ?? [])
        setMensagens(lista)
      })
      .catch(() => {})
      .finally(() => setLoading(false))
  }, [conversaId])

  // ── Scroll para o final ────────────────────────────────────────────────────
  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [mensagens])

  // ── WebSocket — recebe mensagens do contato ────────────────────────────────
  const handleWs = useCallback((msg: MensagemWs) => {
    if (msg.conversaId !== conversaId) return
    setMensagens((prev) => {
      if (prev.some((m) => m.id === msg.id)) return prev
      return [...prev, msg as MensagemDto]
    })
  }, [conversaId])
  useConversaWebSocket(conversaId, handleWs)

  // ── Helpers de envio ──────────────────────────────────────────────────────
  function otimista(parcial: Partial<MensagemDto>): MensagemDto {
    return {
      id: `tmp-${Date.now()}`,
      conversaId,
      texto: null,
      urlArquivo: null,
      recebidaEm: new Date().toISOString(),
      enviada: true,
      tipo: 'TEXTO',
      ...parcial,
    }
  }

  // ── Enviar texto ──────────────────────────────────────────────────────────
  const enviarTexto = useCallback(async () => {
    const conteudo = texto.trim()
    if (!conteudo || enviando) return

    setEnviando(true)
    setTexto('')
    textareaRef.current?.focus()

    const tmp = otimista({ texto: conteudo, tipo: 'TEXTO' })
    setMensagens((p) => [...p, tmp])

    try {
      const res = await fetch(`/api/v1/conversas/${conversaId}/mensagens/texto`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
        body: new URLSearchParams({ texto: conteudo, enviada: 'true' }),
      })
      if (res.ok) {
        const saved: MensagemDto = await res.json()
        setMensagens((p) => p.map((m) => (m.id === tmp.id ? saved : m)))
      }
    } catch {
      setMensagens((p) => p.filter((m) => m.id !== tmp.id))
      setTexto(conteudo)
    } finally {
      setEnviando(false)
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [conversaId, texto, enviando])

  const onKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      enviarTexto()
    }
  }

  // ── Enviar arquivo (imagem/vídeo/documento) ───────────────────────────────
  const enviarArquivo = useCallback(async (file: File) => {
    setEnviando(true)

    const mimeOk = file.type
    const tipo = mimeOk.startsWith('image/') ? 'IMAGEM'
      : mimeOk.startsWith('video/') ? 'VIDEO'
      : 'DOCUMENTO'

    const previewUrl = tipo === 'IMAGEM' ? URL.createObjectURL(file) : null
    const tmp = otimista({ tipo, nomeArquivo: file.name, urlArquivo: previewUrl })
    setMensagens((p) => [...p, tmp])
    setArquivoPendente(null)

    const form = new FormData()
    form.append('arquivo', file)
    if (texto.trim()) form.append('texto', texto.trim())

    try {
      const res = await fetch(`/api/v1/conversas/${conversaId}/mensagens/arquivo`, {
        method: 'POST',
        body: form,
      })
      if (res.ok) {
        const saved: MensagemDto = await res.json()
        setMensagens((p) => p.map((m) => (m.id === tmp.id ? saved : m)))
        setTexto('')
      }
    } catch {
      setMensagens((p) => p.filter((m) => m.id !== tmp.id))
    } finally {
      if (previewUrl) URL.revokeObjectURL(previewUrl)
      setEnviando(false)
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [conversaId, texto])

  // ── Gravação de áudio ─────────────────────────────────────────────────────
  const iniciarGravacao = useCallback(async () => {
    setArquivoPendente(null) // exclui arquivo pendente ao iniciar gravação
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true })
      const mr = new MediaRecorder(stream)
      audioChunksRef.current = []
      mr.ondataavailable = (e) => audioChunksRef.current.push(e.data)
      mr.onstop = () => {
        const blob = new Blob(audioChunksRef.current, { type: 'audio/ogg; codecs=opus' })
        setAudioBlob(blob)
        stream.getTracks().forEach((t) => t.stop())
        if (audioTimerRef.current) clearInterval(audioTimerRef.current)
      }
      mr.start()
      mediaRecorderRef.current = mr
      setGravando(true)
      setAudioDuration(0)
      audioTimerRef.current = setInterval(() => setAudioDuration((d) => d + 1), 1000)
    } catch {
      alert('Não foi possível acessar o microfone.')
    }
  }, [])

  const pararGravacao = useCallback(() => {
    mediaRecorderRef.current?.stop()
    setGravando(false)
  }, [])

  const cancelarGravacao = useCallback(() => {
    mediaRecorderRef.current?.stop()
    setGravando(false)
    setAudioBlob(null)
    if (audioTimerRef.current) clearInterval(audioTimerRef.current)
  }, [])

  const enviarAudio = useCallback(async () => {
    if (!audioBlob) return
    setEnviando(true)
    const tmp = otimista({ tipo: 'AUDIO_PTT' })
    setMensagens((p) => [...p, tmp])
    setAudioBlob(null)

    const form = new FormData()
    form.append('audio', audioBlob, 'voice.ogg')

    try {
      const res = await fetch(`/api/v1/conversas/${conversaId}/mensagens/audio`, {
        method: 'POST',
        body: form,
      })
      if (res.ok) {
        const saved: MensagemDto = await res.json()
        setMensagens((p) => p.map((m) => (m.id === tmp.id ? saved : m)))
      }
    } catch {
      setMensagens((p) => p.filter((m) => m.id !== tmp.id))
    } finally {
      setEnviando(false)
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [conversaId, audioBlob])

  // ── Localização ───────────────────────────────────────────────────────────
  const compartilharLocalizacao = useCallback(() => {
    if (!navigator.geolocation) return alert('Geolocalização não suportada.')
    navigator.geolocation.getCurrentPosition(async (pos) => {
      const { latitude, longitude } = pos.coords
      setEnviando(true)
      const tmp = otimista({ tipo: 'LOCALIZACAO', texto: `${latitude.toFixed(5)}, ${longitude.toFixed(5)}`, latitude, longitude })
      setMensagens((p) => [...p, tmp])

      try {
        const res = await fetch(
          `/api/v1/conversas/${conversaId}/mensagens/localizacao?latitude=${latitude}&longitude=${longitude}`,
          { method: 'POST' }
        )
        if (res.ok) {
          const saved: MensagemDto = await res.json()
          setMensagens((p) => p.map((m) => (m.id === tmp.id ? saved : m)))
        }
      } catch {
        setMensagens((p) => p.filter((m) => m.id !== tmp.id))
      } finally {
        setEnviando(false)
      }
    }, () => alert('Não foi possível obter a localização.'))
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [conversaId])

  // ── Render ────────────────────────────────────────────────────────────────

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

      {/* ── Preview de arquivo pendente ──────────────────────────────────── */}
      {arquivoPendente && (
        <div
          className="flex items-center gap-2 px-4 py-2 border-t text-sm"
          style={{ background: 'var(--d2b-bg-surface)', borderColor: 'var(--d2b-border)' }}
        >
          <FileText size={16} style={{ color: 'var(--d2b-brand)' }} />
          <span className="flex-1 truncate" style={{ color: 'var(--d2b-text-secondary)' }}>
            {arquivoPendente.name}
          </span>
          <button
            onClick={() => setArquivoPendente(null)}
            className="p-1 rounded-full hover:bg-[var(--d2b-hover)]"
            style={{ color: 'var(--d2b-text-muted)' }}
            type="button"
          >
            <X size={14} />
          </button>
          <button
            onClick={() => enviarArquivo(arquivoPendente)}
            disabled={enviando}
            className="px-3 py-1 rounded-full text-xs font-medium text-white"
            style={{ background: 'var(--d2b-brand)' }}
            type="button"
          >
            Enviar
          </button>
        </div>
      )}

      {/* ── Preview de áudio gravado ─────────────────────────────────────── */}
      {audioBlobUrl && !gravando && (
        <div
          className="flex items-center gap-2 px-4 py-2 border-t text-sm"
          style={{ background: 'var(--d2b-bg-surface)', borderColor: 'var(--d2b-border)' }}
        >
          <Mic size={15} style={{ color: 'var(--d2b-brand)', flexShrink: 0 }} />
          <audio src={audioBlobUrl} controls className="h-8 flex-1" />
          <button
            onClick={() => setAudioBlob(null)}
            className="p-1 rounded-full hover:bg-[var(--d2b-hover)]"
            style={{ color: 'var(--d2b-text-muted)' }}
            type="button"
            title="Descartar"
          >
            <X size={14} />
          </button>
        </div>
      )}

      {/* ── Barra de gravação ativas ─────────────────────────────────────── */}
      {gravando && (
        <div
          className="flex items-center gap-3 px-4 py-2 border-t text-sm"
          style={{ background: 'var(--d2b-bg-surface)', borderColor: 'var(--d2b-border)' }}
        >
          <span className="flex items-center gap-1.5 font-medium" style={{ color: '#EF4444' }}>
            <span className="w-2 h-2 rounded-full bg-red-500 animate-pulse" />
            Gravando…
          </span>
          <span className="text-xs tabular-nums" style={{ color: 'var(--d2b-text-muted)' }}>
            {String(Math.floor(audioDuration / 60)).padStart(2, '0')}:
            {String(audioDuration % 60).padStart(2, '0')}
          </span>
          <button
            onClick={cancelarGravacao}
            className="ml-auto p-1 rounded-full hover:bg-[var(--d2b-hover)]"
            style={{ color: 'var(--d2b-text-muted)' }}
            type="button"
            title="Cancelar gravação"
          >
            <X size={16} />
          </button>
          <button
            onClick={pararGravacao}
            className="p-1.5 rounded-full text-white"
            style={{ background: '#EF4444' }}
            type="button"
            title="Parar gravação"
          >
            <Square size={14} />
          </button>
        </div>
      )}

      {/* ── Input principal ───────────────────────────────────────────────── */}
      <div
        className="relative flex items-end gap-1.5 px-3 py-3 border-t"
        style={{ background: 'var(--d2b-bg-elevated)', borderColor: 'var(--d2b-border)' }}
      >
        {/* Emoji picker */}
        {showEmoji && (
          <EmojiPicker
            onSelect={(e) => {
              setTexto((t) => t + e)
              textareaRef.current?.focus()
            }}
            onClose={() => setShowEmoji(false)}
          />
        )}

        {/* Input invisível para arquivo */}
        <input
          ref={fileInputRef}
          type="file"
          accept="image/*,video/*,application/pdf,.doc,.docx,.xls,.xlsx,.ppt,.pptx,.txt,.csv"
          className="hidden"
          onChange={(e) => {
            const file = e.target.files?.[0]
            if (file) {
              setAudioBlob(null) // exclui áudio pendente ao selecionar arquivo
              setArquivoPendente(file)
            }
            e.target.value = ''
          }}
        />

        {/* Botão emoji */}
        <button
          title="Emoji"
          onClick={() => setShowEmoji((v) => !v)}
          className="flex-shrink-0 p-2 rounded-full transition-colors hover:bg-[var(--d2b-hover)]"
          style={{ color: showEmoji ? 'var(--d2b-brand)' : 'var(--d2b-text-muted)' }}
          type="button"
        >
          <Smile size={18} />
        </button>

        {/* Botão anexar */}
        <button
          title="Anexar arquivo"
          onClick={() => fileInputRef.current?.click()}
          className="flex-shrink-0 p-2 rounded-full transition-colors hover:bg-[var(--d2b-hover)]"
          style={{ color: 'var(--d2b-text-muted)' }}
          type="button"
        >
          <Paperclip size={18} />
        </button>

        {/* Botão localização */}
        <button
          title="Compartilhar localização"
          onClick={compartilharLocalizacao}
          disabled={enviando}
          className="flex-shrink-0 p-2 rounded-full transition-colors hover:bg-[var(--d2b-hover)]"
          style={{ color: 'var(--d2b-text-muted)' }}
          type="button"
        >
          <MapPin size={18} />
        </button>

        {/* Textarea */}
        <textarea
          ref={textareaRef}
          rows={1}
          className="flex-1 resize-none rounded-2xl px-4 py-2.5 text-sm outline-none transition-colors"
          style={{
            background: 'var(--d2b-bg-surface)',
            border: '1px solid var(--d2b-border)',
            color: 'var(--d2b-text-primary)',
            caretColor: 'var(--d2b-text-primary)',
            maxHeight: 120,
            overflowY: 'hidden',
          }}
          placeholder="Digite uma mensagem…"
          value={texto}
          onChange={(e) => {
            setTexto(e.target.value)
            e.target.style.height = 'auto'
            e.target.style.overflowY = 'hidden'
            const scrollH = e.target.scrollHeight
            e.target.style.height = `${Math.min(scrollH, 120)}px`
            e.target.style.overflowY = scrollH > 120 ? 'auto' : 'hidden'
          }}
          onKeyDown={onKeyDown}
          onFocus={() => setShowEmoji(false)}
        />

        {/* Botão gravar / parar / enviar */}
        {texto.trim() || arquivoPendente || audioBlob ? (
          <button
            onClick={
              arquivoPendente ? () => enviarArquivo(arquivoPendente!)
              : audioBlob ? enviarAudio
              : enviarTexto
            }
            disabled={enviando}
            className="flex-shrink-0 p-2.5 rounded-full transition-all"
            style={{
              background: !enviando ? 'var(--d2b-brand)' : 'var(--d2b-bg-surface)',
              color: !enviando ? '#ffffff' : 'var(--d2b-text-muted)',
              border: '1px solid var(--d2b-border)',
            }}
            type="button"
          >
            {enviando ? <Loader2 size={18} className="animate-spin" /> : <Send size={18} />}
          </button>
        ) : gravando ? (
          <button
            onClick={pararGravacao}
            className="flex-shrink-0 p-2.5 rounded-full"
            style={{ background: '#EF4444', color: '#fff' }}
            type="button"
            title="Parar e revisar"
          >
            <Square size={18} />
          </button>
        ) : (
          <button
            onClick={iniciarGravacao}
            disabled={enviando}
            className="flex-shrink-0 p-2.5 rounded-full transition-all hover:bg-[var(--d2b-hover)]"
            style={{
              background: 'var(--d2b-bg-surface)',
              color: 'var(--d2b-mic-icon)',
              border: '1px solid var(--d2b-border)',
            }}
            type="button"
            title="Gravar áudio"
          >
            {enviando ? <Loader2 size={18} className="animate-spin" /> : <Mic size={18} />}
          </button>
        )}
      </div>
    </div>
  )
}

