'use client'

import { useState, useEffect, useCallback, useRef } from 'react'
import { Plus, RefreshCw, Trash2, QrCode, Wifi, WifiOff, Loader2, X, Hash } from 'lucide-react'
import { useToast } from '@/hooks/use-toast'
import type { UsuarioData, EmpresaData } from '@/app/dashboard/configuracoes/page'

const WHATS_URL = process.env.NEXT_PUBLIC_WHATS_API_URL ?? 'http://localhost:8012'

// ─── Types ────────────────────────────────────────────────────────────────────
interface Instancia {
  id: string
  empresaId: string
  usuarioId: string
  nome: string
  instanceName: string
  status: string
  numero?: string
  qrCode?: string
  webhookConfigurado?: boolean
  createdAt: string
  updatedAt: string
}

type StatusConfig = {
  label: string
  color: string
  bg: string
  border: string
  dot: string
}

const STATUS_MAP: Record<string, StatusConfig> = {
  CONECTADA:      { label: 'Conectada',      color: '#4ADE80', bg: 'rgba(74,222,128,0.08)',  border: 'rgba(74,222,128,0.25)',  dot: '#4ADE80' },
  ABERTA:         { label: 'Conectada',      color: '#4ADE80', bg: 'rgba(74,222,128,0.08)',  border: 'rgba(74,222,128,0.25)',  dot: '#4ADE80' },
  AGUARDANDO_QR:  { label: 'Aguard. QR Code',color: '#FACC15', bg: 'rgba(250,204,21,0.08)',  border: 'rgba(250,204,21,0.25)',  dot: '#FACC15' },
  CONECTANDO:     { label: 'Conectando...',  color: '#A78BCC', bg: 'rgba(124,77,255,0.10)', border: 'rgba(124,77,255,0.30)', dot: '#7C4DFF' },
  CRIADA:         { label: 'Criada',         color: '#60A5FA', bg: 'rgba(96,165,250,0.08)',  border: 'rgba(96,165,250,0.25)',  dot: '#60A5FA' },
  DESCONECTADA:   { label: 'Desconectada',   color: '#94A3B8', bg: 'rgba(148,163,184,0.08)', border: 'rgba(148,163,184,0.2)',  dot: '#94A3B8' },
  FECHADA:        { label: 'Desconectada',   color: '#94A3B8', bg: 'rgba(148,163,184,0.08)', border: 'rgba(148,163,184,0.2)',  dot: '#94A3B8' },
  ERRO:           { label: 'Erro',           color: '#F87171', bg: 'rgba(248,113,113,0.08)', border: 'rgba(248,113,113,0.25)', dot: '#F87171' },
}

function getStatus(status: string): StatusConfig {
  return STATUS_MAP[status] ?? { label: status, color: '#A78BCC', bg: 'rgba(124,77,255,0.08)', border: 'rgba(124,77,255,0.25)', dot: '#A78BCC' }
}

function needsPolling(status: string) {
  return status === 'AGUARDANDO_QR' || status === 'CONECTANDO' || status === 'CRIADA'
}

// ─── Status Badge ─────────────────────────────────────────────────────────────
function StatusBadge({ status }: { status: string }) {
  const cfg = getStatus(status)
  const isPulsing = status === 'AGUARDANDO_QR' || status === 'CONECTANDO'
  return (
    <span
      className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium"
      style={{ color: cfg.color, background: cfg.bg, border: `1px solid ${cfg.border}` }}
    >
      <span
        className={`w-1.5 h-1.5 rounded-full ${isPulsing ? 'animate-pulse' : ''}`}
        style={{ background: cfg.dot }}
      />
      {cfg.label}
    </span>
  )
}

// ─── QR Code Modal ────────────────────────────────────────────────────────────
function QrModal({
  instancia,
  onClose,
  onRefresh,
}: {
  instancia: Instancia
  onClose: () => void
  onRefresh: () => void
}) {
  const qrSrc = instancia.qrCode
    ? instancia.qrCode.startsWith('data:')
      ? instancia.qrCode
      : `data:image/png;base64,${instancia.qrCode}`
    : null

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm"
      onClick={onClose}
    >
      <div
        className="relative w-full max-w-sm mx-4 rounded-2xl border border-[rgba(124,77,255,0.3)] bg-[#120328] p-6 shadow-2xl"
        onClick={(e) => e.stopPropagation()}
      >
        <button
          onClick={onClose}
          className="absolute right-4 top-4 text-[#6B4E8A] hover:text-[#F5F0FF] transition-colors"
        >
          <X size={18} />
        </button>

        <div className="flex flex-col items-center gap-5">
          <div className="flex flex-col items-center gap-1">
            <h3 className="text-base font-bold text-[#F5F0FF]">Escanear QR Code</h3>
            <p className="text-xs text-[#A78BCC] text-center">
              Abra o WhatsApp no celular → Menu → Aparelhos conectados → Conectar
            </p>
          </div>

          {qrSrc ? (
            <div className="p-3 bg-white rounded-xl shadow-lg">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={qrSrc} alt="QR Code WhatsApp" className="w-52 h-52 object-contain" />
            </div>
          ) : (
            <div className="w-52 h-52 flex flex-col items-center justify-center gap-3 rounded-xl border border-[rgba(124,77,255,0.25)] bg-[#0D0520]">
              {instancia.status === 'CONECTANDO' ? (
                <>
                  <Loader2 size={28} className="animate-spin text-[#7C4DFF]" />
                  <span className="text-xs text-[#A78BCC]">Gerando QR Code...</span>
                </>
              ) : (
                <>
                  <QrCode size={28} className="text-[#6B4E8A]" />
                  <span className="text-xs text-[#A78BCC] text-center px-4">
                    QR Code não disponível
                  </span>
                </>
              )}
            </div>
          )}

          <div className="flex flex-col items-center gap-2 w-full">
            <StatusBadge status={instancia.status} />
            <p className="text-[10px] text-[#6B4E8A]">
              {instancia.instanceName}
            </p>
          </div>

          <div className="flex gap-2 w-full">
            <button
              onClick={onRefresh}
              className="flex-1 flex items-center justify-center gap-1.5 px-4 py-2 rounded-lg border border-[rgba(124,77,255,0.25)] text-[#A78BCC] hover:border-[#7C4DFF] hover:text-[#F5F0FF] text-sm transition-colors"
            >
              <RefreshCw size={14} />
              Atualizar
            </button>
            <button
              onClick={onClose}
              className="flex-1 px-4 py-2 rounded-lg bg-[#7C4DFF] hover:bg-[#5B21B6] text-white text-sm font-semibold transition-colors"
            >
              Fechar
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}

// ─── Info Row ─────────────────────────────────────────────────────────────────
function InfoRow({ label, value, mono }: { label: string; value?: string | null; mono?: boolean }) {
  if (!value) return null
  return (
    <div className="flex flex-col gap-0.5">
      <span className="text-[10px] font-medium text-[#6B4E8A] uppercase tracking-wide">{label}</span>
      <span className={`text-sm text-[#F5F0FF] break-all ${mono ? 'font-mono text-xs' : ''}`}>{value}</span>
    </div>
  )
}

// ─── Main Component ───────────────────────────────────────────────────────────
interface TabWhatsappProps {
  initialUsuario?: UsuarioData | null
  initialEmpresa?: EmpresaData | null
}

export function TabWhatsapp({ initialUsuario, initialEmpresa }: TabWhatsappProps) {
  const { toast } = useToast()
  const [instancia, setInstancia] = useState<Instancia | null>(null)
  const [loading, setLoading] = useState(true)
  const [configurando, setConfigurando] = useState(false)
  const [saving, setSaving] = useState(false)
  const [nome, setNome] = useState('')
  const [qrOpen, setQrOpen] = useState(false)
  const [reconectando, setReconectando] = useState(false)
  const [deletando, setDeletando] = useState(false)
  const pollingRef = useRef<ReturnType<typeof setInterval> | null>(null)

  const carregarInstancia = useCallback(async () => {
    if (!initialEmpresa?.id) return
    try {
      const res = await fetch(`${WHATS_URL}/api/v1/instancias/empresa/${initialEmpresa.id}`)
      if (res.ok) {
        const data: Instancia[] = await res.json()
        setInstancia(data[0] ?? null)
      }
    } catch { /* silencioso */ } finally {
      setLoading(false)
    }
  }, [initialEmpresa?.id])

  useEffect(() => {
    if (initialEmpresa?.id) carregarInstancia()
  }, [initialEmpresa?.id]) // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => {
    if (instancia && needsPolling(instancia.status)) {
      pollingRef.current = setInterval(carregarInstancia, 5000)
    } else {
      if (pollingRef.current) clearInterval(pollingRef.current)
    }
    return () => { if (pollingRef.current) clearInterval(pollingRef.current) }
  }, [instancia?.status, carregarInstancia]) // eslint-disable-line react-hooks/exhaustive-deps

  const handleCriar = async () => {
    if (!initialEmpresa?.id || !initialUsuario?.id || !nome.trim()) return
    setSaving(true)
    try {
      const res = await fetch(`${WHATS_URL}/api/v1/instancias`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          nome: nome.trim(),
          empresaId: initialEmpresa.id,
          usuarioId: initialUsuario.id,
          // instanceName omitido → backend gera "empresa-{empresaId}"
        }),
      })
      if (res.ok) {
        toast({ title: 'Instância criada! Aguarde o QR Code para conectar.' })
        setConfigurando(false)
        setNome('')
        await carregarInstancia()
        setQrOpen(true)
      } else {
        const msg = await res.text()
        toast({ title: msg || 'Erro ao criar instância', variant: 'destructive' })
      }
    } catch {
      toast({ title: 'Erro ao criar instância', variant: 'destructive' })
    } finally {
      setSaving(false)
    }
  }

  const handleReconectar = async () => {
    if (!instancia) return
    setReconectando(true)
    try {
      const res = await fetch(`${WHATS_URL}/api/v1/instancias/${instancia.id}/reconectar`, { method: 'POST' })
      if (res.ok) {
        toast({ title: 'Reconectando... abra o QR Code.' })
        await carregarInstancia()
        setQrOpen(true)
      } else {
        toast({ title: 'Erro ao reconectar', variant: 'destructive' })
      }
    } catch {
      toast({ title: 'Erro ao reconectar', variant: 'destructive' })
    } finally {
      setReconectando(false)
    }
  }

  const handleExcluir = async () => {
    if (!instancia) return
    if (!confirm(`Excluir a instância "${instancia.nome}"? O WhatsApp será desvinculado.`)) return
    setDeletando(true)
    try {
      const res = await fetch(`${WHATS_URL}/api/v1/instancias/${instancia.id}`, { method: 'DELETE' })
      if (res.ok) {
        toast({ title: 'Instância removida com sucesso.' })
        setInstancia(null)
        setQrOpen(false)
      } else {
        toast({ title: 'Erro ao excluir instância', variant: 'destructive' })
      }
    } catch {
      toast({ title: 'Erro ao excluir instância', variant: 'destructive' })
    } finally {
      setDeletando(false)
    }
  }

  const canQr = instancia && (
    !!instancia.qrCode ||
    instancia.status === 'AGUARDANDO_QR' ||
    instancia.status === 'CONECTANDO' ||
    instancia.status === 'CRIADA'
  )

  return (
    <>
      <div className="space-y-7 max-w-xl">
        {/* ── Header ── */}
        <div>
          <h2 className="text-base font-bold text-[#F5F0FF]">Instância WhatsApp</h2>
          <p className="text-xs text-[#A78BCC] mt-1">
            Cada empresa possui uma única instância WhatsApp para envio e recebimento de mensagens.
          </p>
        </div>

        {loading ? (
          <div className="flex items-center gap-2 py-12 justify-center text-[#A78BCC]">
            <Loader2 size={18} className="animate-spin" />
            <span className="text-sm">Carregando...</span>
          </div>

        ) : instancia ? (
          /* ── Card da instância existente ── */
          <div className="rounded-2xl border border-[rgba(124,77,255,0.25)] bg-[#120328] overflow-hidden">

            {/* Header do card */}
            <div className="flex items-center justify-between gap-4 px-5 py-4 border-b border-[rgba(124,77,255,0.15)]">
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-xl bg-[rgba(74,222,128,0.1)] border border-[rgba(74,222,128,0.2)] flex items-center justify-center shrink-0">
                  <Wifi size={16} className="text-[#4ADE80]" />
                </div>
                <div>
                  <p className="text-sm font-bold text-[#F5F0FF]">{instancia.nome}</p>
                  {instancia.numero && <p className="text-xs text-[#A78BCC]">{instancia.numero}</p>}
                </div>
              </div>
              <StatusBadge status={instancia.status} />
            </div>

            {/* Detalhes */}
            <div className="px-5 py-4 grid grid-cols-2 gap-x-6 gap-y-4">
              <InfoRow label="Identificador" value={instancia.instanceName} mono />
              <InfoRow label="ID da Instância" value={instancia.id} mono />
              <InfoRow label="Número conectado" value={instancia.numero ?? '—'} />
              <InfoRow label="Webhook" value={instancia.webhookConfigurado ? 'Configurado ✓' : 'Pendente'} />
            </div>

            {/* Ações */}
            <div className="flex items-center gap-2 px-5 py-4 border-t border-[rgba(124,77,255,0.15)] flex-wrap">
              {canQr && (
                <button
                  onClick={() => setQrOpen(true)}
                  className="flex items-center gap-1.5 px-4 py-2 rounded-lg border border-[rgba(250,204,21,0.35)] text-[#FACC15] hover:bg-[rgba(250,204,21,0.08)] text-sm font-medium transition-colors"
                >
                  <QrCode size={14} />
                  QR Code
                </button>
              )}
              <button
                onClick={handleReconectar}
                disabled={reconectando || deletando}
                className="flex items-center gap-1.5 px-4 py-2 rounded-lg border border-[rgba(124,77,255,0.25)] text-[#A78BCC] hover:border-[#7C4DFF] hover:text-[#F5F0FF] disabled:opacity-50 text-sm font-medium transition-colors"
              >
                {reconectando ? <Loader2 size={14} className="animate-spin" /> : <RefreshCw size={14} />}
                Reconectar
              </button>
              <button
                onClick={handleExcluir}
                disabled={deletando || reconectando}
                className="flex items-center gap-1.5 px-4 py-2 rounded-lg border border-[rgba(248,113,113,0.25)] text-[#F87171] hover:bg-[rgba(248,113,113,0.08)] disabled:opacity-50 text-sm font-medium transition-colors ml-auto"
              >
                {deletando ? <Loader2 size={14} className="animate-spin" /> : <Trash2 size={14} />}
                Remover
              </button>
            </div>
          </div>

        ) : configurando ? (
          /* ── Formulário de criação ── */
          <div className="rounded-2xl border border-[rgba(124,77,255,0.3)] bg-[#120328] p-5 space-y-5">
            <h4 className="text-sm font-bold text-[#F5F0FF]">CONFIGURAR INSTÂNCIA</h4>

            {/* Identificador automático (informativo) */}
            <div className="flex items-center gap-2 px-3 py-2.5 rounded-lg border border-[rgba(124,77,255,0.15)] bg-[rgba(124,77,255,0.05)]">
              <Hash size={13} className="text-[#6B4E8A] shrink-0" />
              <div className="min-w-0">
                <p className="text-[10px] text-[#6B4E8A] font-medium uppercase tracking-wide">Identificador (gerado automaticamente)</p>
                <p className="text-xs font-mono text-[#A78BCC] truncate">empresa-{initialEmpresa?.id}</p>
              </div>
            </div>

            {/* Nome */}
            <div className="relative">
              <label className="absolute -top-2 left-3 z-10 bg-[#120328] px-1 text-[10px] font-medium text-[#A78BCC] leading-none">
                Nome da instância <span className="text-[#7C4DFF]">*</span>
              </label>
              <input
                type="text"
                value={nome}
                onChange={(e) => setNome(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleCriar()}
                placeholder="Ex: WhatsApp Clínica Central"
                autoFocus
                className="w-full bg-[#0D0520] border border-[rgba(124,77,255,0.25)] rounded-md px-3 py-2.5 text-sm text-[#F5F0FF] placeholder:text-[#6B4E8A] focus:outline-none focus:border-[#7C4DFF] transition-colors"
              />
            </div>

            <div className="flex items-center gap-2">
              <button
                disabled={saving || !nome.trim()}
                onClick={handleCriar}
                className="flex items-center gap-1.5 px-4 py-2 rounded-lg bg-[#7C4DFF] hover:bg-[#5B21B6] disabled:opacity-50 disabled:cursor-not-allowed text-white text-sm font-semibold transition-colors"
              >
                {saving && <Loader2 size={14} className="animate-spin" />}
                Criar e conectar
              </button>
              <button
                onClick={() => { setConfigurando(false); setNome('') }}
                className="px-4 py-2 rounded-lg border border-[rgba(124,77,255,0.25)] text-[#A78BCC] hover:border-[#7C4DFF] hover:text-[#F5F0FF] text-sm font-semibold transition-colors"
              >
                Cancelar
              </button>
            </div>
          </div>

        ) : (
          /* ── Estado vazio ── */
          <div className="flex flex-col items-center justify-center py-14 gap-5 rounded-2xl border border-dashed border-[rgba(124,77,255,0.2)] bg-[rgba(124,77,255,0.03)]">
            <div className="w-14 h-14 rounded-2xl bg-[rgba(124,77,255,0.1)] border border-[rgba(124,77,255,0.2)] flex items-center justify-center">
              <WifiOff size={24} className="text-[#6B4E8A]" />
            </div>
            <div className="text-center">
              <p className="text-sm font-semibold text-[#F5F0FF]">Nenhuma instância configurada</p>
              <p className="text-xs text-[#6B4E8A] mt-1">Configure o WhatsApp da sua empresa para enviar e receber mensagens</p>
            </div>
            <button
              onClick={() => setConfigurando(true)}
              className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-[#7C4DFF] hover:bg-[#5B21B6] text-white text-sm font-semibold transition-colors"
            >
              <Plus size={16} />
              Configurar WhatsApp
            </button>
          </div>
        )}
      </div>

      {/* ── QR Code Modal ── */}
      {qrOpen && instancia && (
        <QrModal
          instancia={instancia}
          onClose={() => setQrOpen(false)}
          onRefresh={carregarInstancia}
        />
      )}
    </>
  )
}
