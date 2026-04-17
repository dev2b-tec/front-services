'use client'

import { useState, useEffect } from 'react'
import { CheckCircle2, XCircle, Clock, Sparkles, AlertCircle, Loader2 } from 'lucide-react'
import { ModalAssinatura } from '@/components/assinatura/modal-assinatura'
import type { AssinaturaAtual } from '@/components/assinatura/modal-assinatura'
import type { UsuarioData } from '@/app/dashboard/configuracoes/page'

interface TabAssinaturaProps {
  initialUsuario?: UsuarioData | null
}

interface AssinaturaInfo {
  id: string
  status: 'PENDENTE' | 'ATIVA' | 'CANCELADA'
  plano: {
    nome: string
    tipo: string
    valorMensal: number
    limiteIaResumos: number
    limiteIaAudios: number
  }
  proximaCobranca: string | null
  createdAt: string
}

const STATUS_MAP = {
  ATIVA: { label: 'Ativa', color: '#22C55E', Icon: CheckCircle2 },
  PENDENTE: { label: 'Pendente', color: '#F59E0B', Icon: Clock },
  CANCELADA: { label: 'Cancelada', color: '#EF4444', Icon: XCircle },
}

export function TabAssinatura({ initialUsuario }: TabAssinaturaProps) {
  const [assinatura, setAssinatura] = useState<AssinaturaInfo | null>(null)
  const [loading, setLoading] = useState(true)
  const [modalOpen, setModalOpen] = useState(false)
  const [cancelando, setCancelando] = useState(false)

  const empresaId = initialUsuario?.empresaId
  const usuarioId = initialUsuario?.id

  useEffect(() => {
    if (!empresaId) { setLoading(false); return }
    fetch(`/api/v1/assinaturas/empresa/${empresaId}`)
      .then(r => r.ok ? r.json() : [])
      .then((list: AssinaturaInfo[]) => {
        // Pega a assinatura mais recente ativa ou pendente
        const ativa = list.find(a => a.status === 'ATIVA')
          ?? list.find(a => a.status === 'PENDENTE')
          ?? list[0] ?? null
        setAssinatura(ativa)
      })
      .catch(() => setAssinatura(null))
      .finally(() => setLoading(false))
  }, [empresaId])

  async function handleCancelar() {
    if (!assinatura) return
    if (!confirm('Tem certeza que deseja cancelar sua assinatura?')) return
    setCancelando(true)
    try {
      const res = await fetch(`/api/v1/assinaturas/${assinatura.id}`, { method: 'DELETE' })
      if (res.ok) {
        const updated = await res.json()
        setAssinatura(updated)
      }
    } catch { /* ignore */ } finally {
      setCancelando(false)
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center py-16">
        <Loader2 size={24} className="animate-spin" style={{ color: '#7C4DFF' }} />
      </div>
    )
  }

  return (
    <div className="flex flex-col gap-6 max-w-2xl">
      <div>
        <h2 className="text-base font-semibold mb-1" style={{ color: 'var(--d2b-text-primary)' }}>
          Assinatura
        </h2>
        <p className="text-sm" style={{ color: 'var(--d2b-text-secondary)' }}>
          Gerencie seu plano e método de pagamento.
        </p>
      </div>

      {assinatura ? (
        <div className="flex flex-col gap-4">
          {/* Card de status */}
          <div
            className="rounded-xl p-5 border"
            style={{
              background: 'var(--d2b-bg-elevated)',
              borderColor: assinatura.status === 'ATIVA' ? 'rgba(34,197,94,0.3)'
                : assinatura.status === 'PENDENTE' ? 'rgba(245,158,11,0.3)'
                : 'var(--d2b-border)',
            }}
          >
            <div className="flex items-start justify-between gap-4 mb-4">
              <div>
                <div className="flex items-center gap-2 mb-1">
                  {(() => {
                    const s = STATUS_MAP[assinatura.status]
                    return (
                      <>
                        <s.Icon size={16} style={{ color: s.color }} />
                        <span className="text-xs font-bold" style={{ color: s.color }}>{s.label}</span>
                      </>
                    )
                  })()}
                </div>
                <h3 className="text-lg font-bold" style={{ color: 'var(--d2b-text-primary)' }}>
                  {assinatura.plano.nome}
                </h3>
                <p className="text-sm mt-0.5" style={{ color: 'var(--d2b-text-secondary)' }}>
                  R$ {assinatura.plano.valorMensal.toFixed(2).replace('.', ',')}/mês
                </p>
              </div>
              <div className="text-right">
                <p className="text-[10px] font-bold tracking-widest uppercase mb-1" style={{ color: 'var(--d2b-text-muted)' }}>
                  Assinado em
                </p>
                <p className="text-xs" style={{ color: 'var(--d2b-text-secondary)' }}>
                  {new Date(assinatura.createdAt).toLocaleDateString('pt-BR')}
                </p>
                {assinatura.proximaCobranca && (
                  <>
                    <p className="text-[10px] font-bold tracking-widest uppercase mt-2 mb-1" style={{ color: 'var(--d2b-text-muted)' }}>
                      Próxima cobrança
                    </p>
                    <p className="text-xs" style={{ color: 'var(--d2b-text-secondary)' }}>
                      {new Date(assinatura.proximaCobranca).toLocaleDateString('pt-BR')}
                    </p>
                  </>
                )}
              </div>
            </div>

            {/* Benefícios */}
            <div className="grid grid-cols-2 gap-3 pt-4 border-t" style={{ borderColor: 'var(--d2b-border)' }}>
              <div
                className="rounded-lg p-3 text-center"
                style={{ background: 'rgba(124,77,255,0.08)' }}
              >
                <p className="text-lg font-bold" style={{ color: '#7C4DFF' }}>
                  {assinatura.plano.limiteIaResumos >= 9999 ? '∞' : assinatura.plano.limiteIaResumos}
                </p>
                <p className="text-[11px]" style={{ color: 'var(--d2b-text-muted)' }}>Resumos IA/mês</p>
              </div>
              <div
                className="rounded-lg p-3 text-center"
                style={{ background: 'rgba(124,77,255,0.08)' }}
              >
                <p className="text-lg font-bold" style={{ color: '#7C4DFF' }}>
                  {assinatura.plano.limiteIaAudios >= 9999 ? '∞' : assinatura.plano.limiteIaAudios}
                </p>
                <p className="text-[11px]" style={{ color: 'var(--d2b-text-muted)' }}>Transcrições/mês</p>
              </div>
            </div>
          </div>

          {/* Aviso pendente */}
          {assinatura.status === 'PENDENTE' && (
            <div
              className="flex items-start gap-3 p-4 rounded-xl"
              style={{ background: 'rgba(245,158,11,0.08)', border: '1px solid rgba(245,158,11,0.25)' }}
            >
              <AlertCircle size={16} style={{ color: '#F59E0B', flexShrink: 0, marginTop: 1 }} />
              <p className="text-xs leading-relaxed" style={{ color: 'var(--d2b-text-secondary)' }}>
                Seu pagamento está sendo processado. Assim que confirmado, sua assinatura será ativada automaticamente.
              </p>
            </div>
          )}

          {/* Ações */}
          <div className="flex gap-3">
            <button
              onClick={() => setModalOpen(true)}
              className="px-4 py-2.5 rounded-xl text-sm font-medium text-white transition-opacity hover:opacity-90"
              style={{ background: 'linear-gradient(135deg, #7C4DFF, #C084FC)' }}
            >
              Upgrade do plano
            </button>
            {assinatura.status !== 'CANCELADA' && (
              <button
                onClick={handleCancelar}
                disabled={cancelando}
                className="px-4 py-2.5 rounded-xl text-sm font-medium transition-colors border disabled:opacity-50"
                style={{
                  color: '#EF4444',
                  borderColor: 'rgba(239,68,68,0.3)',
                  background: 'transparent',
                }}
              >
                {cancelando ? 'Cancelando...' : 'Cancelar assinatura'}
              </button>
            )}
          </div>
        </div>
      ) : (
        /* Sem assinatura */
        <div
          className="rounded-xl p-8 flex flex-col items-center text-center gap-4 border"
          style={{
            background: 'var(--d2b-bg-elevated)',
            borderColor: 'var(--d2b-border)',
            borderStyle: 'dashed',
          }}
        >
          <div
            className="w-14 h-14 rounded-full flex items-center justify-center"
            style={{ background: 'rgba(124,77,255,0.12)' }}
          >
            <Sparkles size={24} style={{ color: '#7C4DFF' }} />
          </div>
          <div>
            <h3 className="text-base font-semibold mb-2" style={{ color: 'var(--d2b-text-primary)' }}>
              Nenhuma assinatura ativa
            </h3>
            <p className="text-sm" style={{ color: 'var(--d2b-text-secondary)' }}>
              Assine um plano para ter acesso completo à plataforma, incluindo funcionalidades de IA, agenda inteligente e muito mais.
            </p>
          </div>
          <button
            onClick={() => setModalOpen(true)}
            className="px-6 py-3 rounded-xl text-sm font-semibold text-white transition-opacity hover:opacity-90"
            style={{ background: 'linear-gradient(135deg, #7C4DFF, #C084FC)' }}
          >
            Assine um plano
          </button>
        </div>
      )}

      <ModalAssinatura
        open={modalOpen}
        onClose={() => {
          setModalOpen(false)
          // Recarrega assinatura após fechar
          if (empresaId) {
            setLoading(true)
            fetch(`/api/v1/assinaturas/empresa/${empresaId}`)
              .then(r => r.ok ? r.json() : [])
              .then((list: AssinaturaInfo[]) => {
                const ativa = list.find(a => a.status === 'ATIVA')
                  ?? list.find(a => a.status === 'PENDENTE')
                  ?? list[0] ?? null
                setAssinatura(ativa)
              })
              .catch(() => {})
              .finally(() => setLoading(false))
          }
        }}
        empresaId={empresaId}
        usuarioId={usuarioId}
        assinaturaAtual={assinatura as AssinaturaAtual | null}
      />
    </div>
  )
}
