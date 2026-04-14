'use client'

import { useState, useEffect, useRef } from 'react'
import { CreditCard, QrCode, Loader2, Lock } from 'lucide-react'
import type { PlanoInfo, ClienteInfo } from './modal-assinatura'

declare global {
  interface Window {
    MercadoPago?: new (publicKey: string, options?: object) => {
      createCardToken: (data: object) => Promise<{ id: string }>
    }
    MP_DEVICE_SESSION_ID?: string
  }
}

interface StepPagamentoProps {
  plano: PlanoInfo
  cliente: ClienteInfo
  loading: boolean
  onCartao: (cardTokenId: string, deviceId?: string) => void
  onPix: () => void
}

type Metodo = 'cartao' | 'pix'

export function StepPagamento({ plano, cliente, loading, onCartao, onPix }: StepPagamentoProps) {
  const [metodo, setMetodo] = useState<Metodo>('cartao')
  const [cardForm, setCardForm] = useState({
    numero: '',
    titular: '',
    validade: '',
    cvv: '',
  })
  const [tokenizando, setTokenizando] = useState(false)
  const [mpLoaded, setMpLoaded] = useState(false)
  const scriptRef = useRef<HTMLScriptElement | null>(null)
  const mpPublicKeyRef = useRef<string | null>(null)

  // Carrega o SDK MercadoPago.js v2
  useEffect(() => {
    if (typeof window === 'undefined') return
    if (window.MercadoPago) { setMpLoaded(true); return }
    const script = document.createElement('script')
    script.src = 'https://sdk.mercadopago.com/js/v2'
    script.async = true
    script.onload = () => setMpLoaded(true)
    document.head.appendChild(script)
    scriptRef.current = script
    return () => { /* não remove o script — pode ser reutilizado */ }
  }, [])

  function formatNumero(v: string) {
    return v.replace(/\D/g, '').slice(0, 16).replace(/(.{4})/g, '$1 ').trim()
  }

  function formatValidade(v: string) {
    return v.replace(/\D/g, '').slice(0, 4).replace(/^(\d{2})(\d)/, '$1/$2')
  }

  async function handlePagarCartao() {
    if (!mpPublicKeyRef.current) {
      try {
        const res = await fetch('/api/v1/config/mp')
        if (res.ok) {
          const data = await res.json()
          mpPublicKeyRef.current = data.publicKey ?? null
        }
      } catch {
        mpPublicKeyRef.current = null
      }
    }
    const publicKey = mpPublicKeyRef.current
    if (!publicKey) {
      alert('Chave pública do Mercado Pago não configurada. Contate o suporte.')
      return
    }
    if (!mpLoaded || !window.MercadoPago) {
      alert('SDK de pagamento não carregado. Atualize a página e tente novamente.')
      return
    }

    const [mes, ano] = cardForm.validade.split('/')
    const numeroLimpo = cardForm.numero.replace(/\s/g, '')

    if (!mes || !ano || numeroLimpo.length < 14) {
      alert('Preencha todos os dados do cartão corretamente.')
      return
    }

    setTokenizando(true)
    try {
      const mp = new window.MercadoPago(publicKey, { locale: 'pt-BR' })
      const tokenPayload = {
        cardNumber: numeroLimpo,
        cardholderName: cardForm.titular,
        cardExpirationMonth: mes,
        cardExpirationYear: `20${ano}`,
        securityCode: cardForm.cvv,
        identificationType: cliente.tipoDocumento,
        identificationNumber: cliente.documento.replace(/\D/g, ''),
      }
      console.log('createCardToken payload:', tokenPayload)
      const { id: cardTokenId } = await mp.createCardToken(tokenPayload)
      const deviceId = window.MP_DEVICE_SESSION_ID ?? undefined
      onCartao(cardTokenId, deviceId)
    } catch (err: unknown) {
      console.error('MP createCardToken error (raw):', err)
      console.error('MP createCardToken error (type):', typeof err)
      console.error('MP createCardToken error (JSON):', JSON.stringify(err))
      let message = 'Dados inválidos'
      if (err instanceof Error) {
        message = err.message
      } else if (Array.isArray(err) && err.length > 0) {
        // MP SDK retorna array de cause objects: [{code, description}]
        message = err.map((e: { description?: string; code?: string }) =>
          e.description ?? e.code ?? JSON.stringify(e)
        ).join('; ')
      } else if (typeof err === 'string') {
        message = err
      } else if (err && typeof err === 'object') {
        message = JSON.stringify(err)
      }
      alert(`Erro ao processar cartão: ${message}`)
    } finally {
      setTokenizando(false)
    }
  }

  const isProcessing = loading || tokenizando

  const valorFormatado = plano.valorMensal.toFixed(2).replace('.', ',')

  const inputClass = "w-full px-3 py-2.5 rounded-lg text-sm outline-none transition-colors border"
  const inputStyle = {
    background: 'var(--d2b-input-bg)',
    color: 'var(--d2b-text-primary)',
    borderColor: 'var(--d2b-border-strong)',
  }

  return (
    <div className="flex flex-col gap-5">
      {/* Detalhes do plano */}
      <div className="rounded-xl p-4" style={{ background: 'var(--d2b-bg-elevated)' }}>
        <p className="text-[10px] font-bold tracking-widest uppercase mb-3" style={{ color: 'var(--d2b-text-muted)' }}>
          Detalhes do Plano
        </p>
        <div className="flex justify-between items-center text-sm mb-2">
          <span style={{ color: 'var(--d2b-text-secondary)' }}>{plano.nome}</span>
          <span style={{ color: 'var(--d2b-text-primary)' }}>R$ {valorFormatado}</span>
        </div>
        <div className="flex justify-between items-center border-t pt-2" style={{ borderColor: 'var(--d2b-border)' }}>
          <span className="text-sm font-semibold" style={{ color: 'var(--d2b-text-primary)' }}>Valor (Mensal)</span>
          <span className="text-sm font-bold" style={{ color: '#7C4DFF' }}>R$ {valorFormatado}</span>
        </div>
      </div>

      {/* Método de pagamento */}
      <div>
        <p className="text-xs font-semibold mb-3" style={{ color: 'var(--d2b-text-secondary)' }}>
          Método de Pagamento: *
        </p>
        <div className="flex gap-3">
          {([
            { key: 'cartao', label: 'Cartão de Crédito', icon: CreditCard },
            { key: 'pix', label: 'Pix', icon: QrCode },
          ] as const).map(({ key, label, icon: Icon }) => (
            <button
              key={key}
              onClick={() => setMetodo(key)}
              className="flex items-center gap-2 px-4 py-2 rounded-lg text-sm transition-all border"
              style={{
                background: metodo === key ? 'rgba(124,77,255,0.10)' : 'var(--d2b-bg-elevated)',
                borderColor: metodo === key ? '#7C4DFF' : 'var(--d2b-border-strong)',
                color: metodo === key ? '#7C4DFF' : 'var(--d2b-text-secondary)',
              }}
            >
              <div
                className="w-4 h-4 rounded-full border-2 flex items-center justify-center flex-shrink-0"
                style={{ borderColor: metodo === key ? '#7C4DFF' : 'var(--d2b-border-strong)' }}
              >
                {metodo === key && (
                  <div className="w-2 h-2 rounded-full" style={{ background: '#7C4DFF' }} />
                )}
              </div>
              <Icon size={14} />
              {label}
            </button>
          ))}
        </div>
      </div>

      {/* Formulário Cartão */}
      {metodo === 'cartao' && (
        <div className="flex flex-col gap-3">
          <input
            placeholder="Número do Cartão *"
            value={cardForm.numero}
            onChange={e => setCardForm(f => ({ ...f, numero: formatNumero(e.target.value) }))}
            className={inputClass}
            style={inputStyle}
            maxLength={19}
            inputMode="numeric"
          />
          <input
            placeholder="Nome Completo (como no cartão) *"
            value={cardForm.titular}
            onChange={e => setCardForm(f => ({ ...f, titular: e.target.value.toUpperCase() }))}
            className={inputClass}
            style={inputStyle}
          />
          <div className="grid grid-cols-2 gap-3">
            <input
              placeholder="CVV *"
              value={cardForm.cvv}
              onChange={e => setCardForm(f => ({ ...f, cvv: e.target.value.replace(/\D/g, '').slice(0, 4) }))}
              className={inputClass}
              style={inputStyle}
              inputMode="numeric"
              maxLength={4}
            />
            <input
              placeholder="Vencimento (MM/AA) *"
              value={cardForm.validade}
              onChange={e => setCardForm(f => ({ ...f, validade: formatValidade(e.target.value) }))}
              className={inputClass}
              style={inputStyle}
              maxLength={5}
              inputMode="numeric"
            />
          </div>
        </div>
      )}

      {/* Info PIX */}
      {metodo === 'pix' && (
        <div
          className="rounded-xl p-4 flex items-start gap-3"
          style={{ background: 'rgba(124,77,255,0.08)', border: '1px solid rgba(124,77,255,0.25)' }}
        >
          <QrCode size={20} style={{ color: '#7C4DFF', flexShrink: 0, marginTop: 2 }} />
          <div>
            <p className="text-sm font-semibold mb-1" style={{ color: '#7C4DFF' }}>Recebimento via PIX</p>
            <p className="text-xs leading-relaxed" style={{ color: 'var(--d2b-text-secondary)' }}>
              Um QR Code PIX será gerado para pagamento. Após o pagamento ser confirmado,
              sua assinatura será ativada automaticamente.
            </p>
          </div>
        </div>
      )}

      {/* Segurança */}
      <div className="flex items-center gap-2">
        <Lock size={12} style={{ color: 'var(--d2b-text-muted)' }} />
        <p className="text-[10px]" style={{ color: 'var(--d2b-text-muted)' }}>
          Nosso processo de compras é protegido pelo Google reCAPTCHA e{' '}
          <span style={{ color: '#7C4DFF' }}>Política de Privacidade</span> &{' '}
          <span style={{ color: '#7C4DFF' }}>Termos de Uso</span> se aplicam.
        </p>
      </div>

      {/* Botão finalizar */}
      <button
        onClick={metodo === 'cartao' ? handlePagarCartao : onPix}
        disabled={isProcessing}
        className="w-full py-3 rounded-xl text-sm font-semibold text-white transition-opacity hover:opacity-90 disabled:opacity-50 flex items-center justify-center gap-2"
        style={{ background: 'linear-gradient(135deg, #7C4DFF, #C084FC)' }}
      >
        {isProcessing ? (
          <>
            <Loader2 size={16} className="animate-spin" />
            Processando...
          </>
        ) : metodo === 'cartao' ? 'Finalizar' : 'Gerar QR Code PIX'}
      </button>
    </div>
  )
}
