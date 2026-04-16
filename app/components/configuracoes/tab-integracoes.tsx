'use client'

import { useState, useEffect } from 'react'
import Image from 'next/image'
import { Loader2, CheckCircle2, XCircle, ExternalLink, X } from 'lucide-react'
import { useToast } from '@/hooks/use-toast'
import type { EmpresaData } from '@/app/dashboard/configuracoes/page'

const API_URL = process.env.NEXT_PUBLIC_API_URL ?? ''

// ─── Types ────────────────────────────────────────────────────────────────────

interface Integracao {
  id?: string
  empresaId?: string
  tipo: string
  ativo: boolean
  configuracao: Record<string, string>
}

interface TabIntegracoesProps {
  initialEmpresa?: EmpresaData | null
}

// ─── Logo Mercado Pago ────────────────────────────────────────────────────────

function LogoMercadoPago() {
  return (
    <Image
      src="/mercado-pago-logo.png"
      alt="Mercado Pago"
      width={80}
      height={22}
      style={{ objectFit: 'contain' }}
    />
  )
}

// ─── Modal Mercado Pago ───────────────────────────────────────────────────────

function ModalMercadoPago({
  empresaId,
  onClose,
  onSaved,
}: {
  empresaId: string
  onClose: () => void
  onSaved: (ativo: boolean) => void
}) {
  const { toast } = useToast()
  const [loading, setLoading] = useState(true)
  const [salvando, setSalvando] = useState(false)
  const [integracao, setIntegracao] = useState<Integracao>({ tipo: 'MERCADO_PAGO', ativo: false, configuracao: {} })
  const [accessToken, setAccessToken] = useState('')
  const [publicKey, setPublicKey] = useState('')
  const [webhookSecret, setWebhookSecret] = useState('')

  useEffect(() => {
    async function carregar() {
      try {
        const res = await fetch(`${API_URL}/api/v1/integracoes/empresa/${empresaId}/tipo/MERCADO_PAGO`)
        if (res.ok && res.status !== 204) {
          const data: Integracao = await res.json()
          setIntegracao(data)
          setAccessToken(data.configuracao?.accessToken ?? '')
          setPublicKey(data.configuracao?.publicKey ?? '')
          setWebhookSecret(data.configuracao?.webhookSecret ?? '')
        }
      } catch { /* silencioso */ }
      finally { setLoading(false) }
    }
    carregar()
  }, [empresaId])

  async function salvar() {
    if (!accessToken.trim()) {
      toast({ title: 'Informe o Access Token', variant: 'destructive' })
      return
    }
    setSalvando(true)
    try {
      const res = await fetch(`${API_URL}/api/v1/integracoes/empresa/${empresaId}/tipo/MERCADO_PAGO`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ativo: true, configuracao: { accessToken, publicKey, webhookSecret } }),
      })
      if (!res.ok) throw new Error()
      toast({ title: 'Mercado Pago conectado com sucesso!' })
      onSaved(true)
      onClose()
    } catch {
      toast({ title: 'Erro ao salvar integração', variant: 'destructive' })
    } finally { setSalvando(false) }
  }

  async function desconectar() {
    setSalvando(true)
    try {
      await fetch(`${API_URL}/api/v1/integracoes/empresa/${empresaId}/tipo/MERCADO_PAGO`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ativo: false, configuracao: {} }),
      })
      toast({ title: 'Integração desconectada' })
      onSaved(false)
      onClose()
    } catch {
      toast({ title: 'Erro ao desconectar', variant: 'destructive' })
    } finally { setSalvando(false) }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm" onClick={onClose}>
      <div
        className="w-full max-w-md bg-[var(--d2b-bg-elevated)] border border-[var(--d2b-border-strong)] rounded-2xl shadow-2xl flex flex-col"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-[var(--d2b-border)]">
          <div className="flex items-center gap-3">
            <div className="px-2 py-1 rounded-lg bg-white flex items-center justify-center shrink-0">
              <LogoMercadoPago />
            </div>
            <span className="text-sm font-semibold text-[var(--d2b-text-primary)]">Mercado Pago</span>
          </div>
          <button
            onClick={onClose}
            className="w-7 h-7 flex items-center justify-center rounded-lg text-[var(--d2b-text-muted)] hover:text-[var(--d2b-text-primary)] hover:bg-[var(--d2b-hover)] transition-colors"
          >
            <X size={15} />
          </button>
        </div>

        {/* Body */}
        <div className="px-5 py-5 space-y-4">
          {loading ? (
            <div className="flex items-center gap-2 text-[var(--d2b-text-muted)]">
              <Loader2 size={14} className="animate-spin" />
              <span className="text-sm">Carregando...</span>
            </div>
          ) : (
            <>
              <p className="text-xs text-[var(--d2b-text-muted)] leading-relaxed">
                Configure sua conta Mercado Pago para receber pagamentos dos seus clientes.{' '}
                <a
                  href="https://www.mercadopago.com.br/developers/pt/docs/getting-started"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-[#7C4DFF] hover:underline inline-flex items-center gap-1"
                >
                  Ver documentação <ExternalLink size={10} />
                </a>
              </p>

              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-[var(--d2b-text-secondary)] uppercase tracking-wide">
                  Access Token <span className="text-red-400">*</span>
                </label>
                <input
                  type="password"
                  value={accessToken}
                  onChange={(e) => setAccessToken(e.target.value)}
                  placeholder="APP_USR-..."
                  autoComplete="off"
                  className="w-full px-3 py-2 rounded-lg border border-[var(--d2b-border-strong)] bg-[var(--d2b-bg-surface)] text-[var(--d2b-text-primary)] text-sm placeholder:text-[var(--d2b-text-muted)] focus:outline-none focus:border-[#7C4DFF]"
                />
                <p className="text-[11px] text-[var(--d2b-text-muted)]">Mercado Pago → Seu negócio → Configurações → Credenciais</p>
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-[var(--d2b-text-secondary)] uppercase tracking-wide">Public Key</label>
                <input
                  type="text"
                  value={publicKey}
                  onChange={(e) => setPublicKey(e.target.value)}
                  placeholder="APP_USR-..."
                  autoComplete="off"
                  className="w-full px-3 py-2 rounded-lg border border-[var(--d2b-border-strong)] bg-[var(--d2b-bg-surface)] text-[var(--d2b-text-primary)] text-sm placeholder:text-[var(--d2b-text-muted)] focus:outline-none focus:border-[#7C4DFF]"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-[var(--d2b-text-secondary)] uppercase tracking-wide">Webhook Secret</label>
                <input
                  type="password"
                  value={webhookSecret}
                  onChange={(e) => setWebhookSecret(e.target.value)}
                  placeholder="Chave secreta do webhook"
                  autoComplete="off"
                  className="w-full px-3 py-2 rounded-lg border border-[var(--d2b-border-strong)] bg-[var(--d2b-bg-surface)] text-[var(--d2b-text-primary)] text-sm placeholder:text-[var(--d2b-text-muted)] focus:outline-none focus:border-[#7C4DFF]"
                />
                <p className="text-[11px] text-[var(--d2b-text-muted)]">Opcional — valida notificações recebidas do Mercado Pago</p>
              </div>
            </>
          )}
        </div>

        {/* Footer */}
        {!loading && (
          <div className="flex items-center justify-between px-5 py-4 border-t border-[var(--d2b-border)]">
            {integracao.ativo ? (
              <button
                type="button"
                onClick={desconectar}
                disabled={salvando}
                className="text-xs text-red-400 hover:text-red-300 transition-colors disabled:opacity-50"
              >
                Desconectar
              </button>
            ) : <span />}
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 text-sm text-[var(--d2b-text-secondary)] hover:text-[var(--d2b-text-primary)] transition-colors"
              >
                Cancelar
              </button>
              <button
                type="button"
                onClick={salvar}
                disabled={salvando}
                className="flex items-center gap-1.5 px-5 py-2 rounded-lg bg-[#7C4DFF] hover:bg-[#5B21B6] disabled:opacity-50 text-white text-sm font-semibold transition-colors"
              >
                {salvando && <Loader2 size={13} className="animate-spin" />}
                {integracao.ativo ? 'Salvar' : 'Conectar'}
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

// ─── Card compacto ────────────────────────────────────────────────────────────

function CardIntegracao({
  logo,
  titulo,
  descricao,
  ativo,
  onClick,
}: {
  logo: React.ReactNode
  titulo: string
  descricao: string
  ativo: boolean
  onClick: () => void
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`w-72 flex flex-row items-center gap-4 px-5 py-4 rounded-xl border transition-all hover:border-[#7C4DFF]/60 hover:shadow-md ${
        ativo
          ? 'border-[#7C4DFF]/40 bg-[var(--d2b-bg-surface)]'
          : 'border-[var(--d2b-border-strong)] bg-[var(--d2b-bg-surface)]'
      }`}
    >
      <div className="px-2 py-1.5 rounded-lg bg-white flex items-center justify-center shrink-0 shadow-sm">
        {logo}
      </div>
      <div className="flex flex-col items-start gap-1 min-w-0">
        <p className="text-xs font-semibold text-[var(--d2b-text-primary)] truncate w-full text-left">{titulo}</p>
        {ativo
          ? <span className="flex items-center gap-1 text-[10px] font-semibold text-emerald-400 bg-emerald-400/10 px-2 py-0.5 rounded-full"><CheckCircle2 size={9} /> Conectado</span>
          : <span className="flex items-center gap-1 text-[10px] font-semibold text-[var(--d2b-text-muted)] bg-[var(--d2b-hover)] px-2 py-0.5 rounded-full"><XCircle size={9} /> Desconectado</span>
        }
      </div>
    </button>
  )
}

// ─── TabIntegracoes ───────────────────────────────────────────────────────────

export function TabIntegracoes({ initialEmpresa }: TabIntegracoesProps) {
  const [modalMPAberto, setModalMPAberto] = useState(false)
  const [mpAtivo, setMpAtivo] = useState(false)

  useEffect(() => {
    if (!initialEmpresa?.id) return
    fetch(`${API_URL}/api/v1/integracoes/empresa/${initialEmpresa.id}/tipo/MERCADO_PAGO`)
      .then((r) => (r.ok && r.status !== 204 ? r.json() : null))
      .then((data) => { if (data) setMpAtivo(data.ativo ?? false) })
      .catch(() => {})
  }, [initialEmpresa?.id])

  if (!initialEmpresa?.id) {
    return (
      <div className="flex items-center justify-center py-16 text-sm text-[var(--d2b-text-muted)]">
        Empresa não identificada. Faça login novamente.
      </div>
    )
  }

  return (
    <div className="max-w-2xl space-y-4">
      <div>
        <h2 className="text-sm font-semibold text-[var(--d2b-text-primary)]">Integrações</h2>
        <p className="text-xs text-[var(--d2b-text-muted)] mt-0.5">
          Conecte serviços externos para ampliar as funcionalidades da plataforma.
        </p>
      </div>

      <div className="flex flex-wrap gap-3">
        <CardIntegracao
          logo={<LogoMercadoPago />}
          titulo="Mercado Pago"
          descricao="Pix, cartão e boleto"
          ativo={mpAtivo}
          onClick={() => setModalMPAberto(true)}
        />
      </div>

      {modalMPAberto && (
        <ModalMercadoPago
          empresaId={initialEmpresa.id}
          onClose={() => setModalMPAberto(false)}
          onSaved={(ativo) => setMpAtivo(ativo)}
        />
      )}
    </div>
  )
}

