'use client'

import { useState, useEffect, useCallback } from 'react'
import { createPortal } from 'react-dom'
import { X, ChevronLeft } from 'lucide-react'
import { StepPlano } from './step-plano'
import { StepCliente } from './step-cliente'
import { StepPagamento } from './step-pagamento'
import { ModalPixQrcode } from './modal-pix-qrcode'

export interface PlanoInfo {
  id: string
  nome: string
  tipo: string
  valorMensal: number
  limiteIaResumos: number
  limiteIaAudios: number
}

export interface ClienteInfo {
  nome: string
  email: string
  documento: string
  tipoDocumento: string
  telefone: string
  cep: string
  logradouro: string
  numero: string
  complemento: string
  bairro: string
  cidade: string
}

export interface PixData {
  paymentId: string
  qrCode: string
  qrCodeBase64: string
  status: string
  valor: number
}

type Step = 'plano' | 'cliente' | 'pagamento'

interface ModalAssinaturaProps {
  open: boolean
  onClose: () => void
  empresaId?: string
  usuarioId?: string
}

const STEP_LABELS: Record<Step, string> = {
  plano: 'Monte seu plano',
  cliente: 'Informações do Cliente',
  pagamento: 'Informações de Pagamento',
}

export function ModalAssinatura({ open, onClose, empresaId, usuarioId }: ModalAssinaturaProps) {
  const [step, setStep] = useState<Step>('plano')
  const [planoSelecionado, setPlanoSelecionado] = useState<PlanoInfo | null>(null)
  const [clienteInfo, setClienteInfo] = useState<ClienteInfo | null>(null)
  const [pixData, setPixData] = useState<PixData | null>(null)
  const [loading, setLoading] = useState(false)
  const [sucesso, setSucesso] = useState(false)

  // Fechar com ESC
  useEffect(() => {
    if (!open) return
    const handler = (e: KeyboardEvent) => { if (e.key === 'Escape') onClose() }
    document.addEventListener('keydown', handler)
    return () => document.removeEventListener('keydown', handler)
  }, [open, onClose])

  // Reset ao fechar
  useEffect(() => {
    if (!open) {
      setStep('plano')
      setPlanoSelecionado(null)
      setClienteInfo(null)
      setPixData(null)
      setLoading(false)
      setSucesso(false)
    }
  }, [open])

  const handlePlanoNext = useCallback((plano: PlanoInfo) => {
    setPlanoSelecionado(plano)
    setStep('cliente')
  }, [])

  const handleClienteNext = useCallback((cliente: ClienteInfo) => {
    setClienteInfo(cliente)
    setStep('pagamento')
  }, [])

  const handleAssinaturaCartao = useCallback(async (cardTokenId: string, deviceId?: string) => {
    if (!planoSelecionado || !clienteInfo || !empresaId || !usuarioId) return
    setLoading(true)
    try {
      const res = await fetch('/api/v1/assinaturas', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          empresaId,
          usuarioId,
          payerEmail: clienteInfo.email,
          planoTipo: planoSelecionado.tipo,
          cardTokenId,
          payerDocumento: clienteInfo.documento.replace(/\D/g, ''),
          payerTipoDocumento: clienteInfo.tipoDocumento,
          deviceId: deviceId ?? null,
        }),
      })
      if (!res.ok) throw new Error('Erro ao criar assinatura')
      setSucesso(true)
    } catch (err) {
      console.error(err)
      alert('Erro ao processar pagamento. Tente novamente.')
    } finally {
      setLoading(false)
    }
  }, [planoSelecionado, clienteInfo, empresaId, usuarioId])

  const handlePix = useCallback(async () => {
    if (!planoSelecionado || !clienteInfo || !empresaId || !usuarioId) return
    setLoading(true)
    try {
      const res = await fetch('/api/v1/assinaturas/pix', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          empresaId,
          usuarioId,
          planoTipo: planoSelecionado.tipo,
          payerEmail: clienteInfo.email,
          payerNome: clienteInfo.nome,
        }),
      })
      if (!res.ok) throw new Error('Erro ao gerar PIX')
      const data = await res.json()
      setPixData(data)
    } catch (err) {
      console.error(err)
      alert('Erro ao gerar PIX. Tente novamente.')
    } finally {
      setLoading(false)
    }
  }, [planoSelecionado, clienteInfo, empresaId, usuarioId])

  if (!open) return null

  const stepIndex = step === 'plano' ? 0 : step === 'cliente' ? 1 : 2

  const content = (
    <div
      className="fixed inset-0 z-[9000] flex items-center justify-center p-4"
      style={{ background: 'var(--d2b-overlay)' }}
      onClick={(e) => { if (e.target === e.currentTarget) onClose() }}
    >
      <div
        className="relative w-full max-w-xl max-h-[90vh] overflow-y-auto rounded-2xl shadow-2xl"
        style={{ background: 'var(--d2b-bg-surface)', border: '1px solid var(--d2b-border-strong)' }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b" style={{ borderColor: 'var(--d2b-border)' }}>
          <div className="flex items-center gap-3">
            {step !== 'plano' && !sucesso && (
              <button
                onClick={() => setStep(step === 'cliente' ? 'plano' : 'cliente')}
                className="p-1 rounded-lg hover:bg-[var(--d2b-hover)] transition-colors"
                style={{ color: 'var(--d2b-text-secondary)' }}
              >
                <ChevronLeft size={18} />
              </button>
            )}
            <div>
              <h2 className="text-base font-semibold" style={{ color: 'var(--d2b-text-primary)' }}>
                {sucesso ? 'Assinatura realizada!' : STEP_LABELS[step]}
              </h2>
              {!sucesso && step !== 'plano' && (
                <button
                  onClick={() => setStep('plano')}
                  className="text-xs underline"
                  style={{ color: '#7C4DFF' }}
                >
                  Alterar Plano Selecionado
                </button>
              )}
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-lg transition-colors hover:bg-[var(--d2b-hover)]"
            style={{ color: 'var(--d2b-text-muted)' }}
          >
            <X size={18} />
          </button>
        </div>

        {/* Steps indicator */}
        {!sucesso && (
          <div className="flex items-center gap-0 px-6 pt-4">
            {(['plano', 'cliente', 'pagamento'] as Step[]).map((s, i) => (
              <div key={s} className="flex items-center flex-1">
                <div className="flex items-center gap-2">
                  <div
                    className="w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold flex-shrink-0"
                    style={{
                      background: i <= stepIndex ? '#7C4DFF' : 'var(--d2b-bg-elevated)',
                      color: i <= stepIndex ? '#fff' : 'var(--d2b-text-muted)',
                      border: i === stepIndex ? '2px solid #7C4DFF' : '2px solid transparent',
                    }}
                  >
                    {i + 1}
                  </div>
                  <span
                    className="text-[11px] hidden sm:inline whitespace-nowrap"
                    style={{ color: i <= stepIndex ? 'var(--d2b-text-primary)' : 'var(--d2b-text-muted)' }}
                  >
                    {s === 'plano' ? 'Plano' : s === 'cliente' ? 'Dados' : 'Pagamento'}
                  </span>
                </div>
                {i < 2 && (
                  <div
                    className="flex-1 h-px mx-2"
                    style={{ background: i < stepIndex ? '#7C4DFF' : 'var(--d2b-border-strong)' }}
                  />
                )}
              </div>
            ))}
          </div>
        )}

        {/* Body */}
        <div className="p-6">
          {sucesso ? (
            <SucessoView plano={planoSelecionado} onClose={onClose} />
          ) : step === 'plano' ? (
            <StepPlano onNext={handlePlanoNext} />
          ) : step === 'cliente' ? (
            <StepCliente
              plano={planoSelecionado!}
              onNext={handleClienteNext}
            />
          ) : (
            <StepPagamento
              plano={planoSelecionado!}
              cliente={clienteInfo!}
              loading={loading}
              onCartao={handleAssinaturaCartao}
              onPix={handlePix}
            />
          )}
        </div>
      </div>

      {/* Modal PIX */}
      {pixData && (
        <ModalPixQrcode
          data={pixData}
          onClose={() => { setPixData(null); setSucesso(true) }}
        />
      )}
    </div>
  )

  return typeof window !== 'undefined' ? createPortal(content, document.body) : null
}

function SucessoView({ plano, onClose }: { plano: PlanoInfo | null; onClose: () => void }) {
  return (
    <div className="flex flex-col items-center text-center py-4 gap-4">
      <div
        className="w-16 h-16 rounded-full flex items-center justify-center text-3xl"
        style={{ background: 'rgba(124,77,255,0.15)' }}
      >
        ✓
      </div>
      <div>
        <h3 className="text-lg font-semibold mb-1" style={{ color: 'var(--d2b-text-primary)' }}>
          Assinatura ativada!
        </h3>
        <p className="text-sm" style={{ color: 'var(--d2b-text-secondary)' }}>
          Seu plano <strong>{plano?.nome}</strong> está sendo processado.
          Em breve você terá acesso a todas as funcionalidades.
        </p>
      </div>
      <p className="text-xs" style={{ color: 'var(--d2b-text-muted)' }}>
        Acompanhe o status da sua assinatura em{' '}
        <span style={{ color: '#7C4DFF' }}>Configurações → Assinatura</span>.
      </p>
      <button
        onClick={onClose}
        className="mt-2 px-6 py-2.5 rounded-lg text-sm font-medium text-white transition-opacity hover:opacity-90"
        style={{ background: 'linear-gradient(135deg, #7C4DFF, #C084FC)' }}
      >
        Fechar
      </button>
    </div>
  )
}
