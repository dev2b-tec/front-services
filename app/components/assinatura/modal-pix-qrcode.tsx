'use client'

import { useState } from 'react'
import { Copy, Check, X, QrCode } from 'lucide-react'
import type { PixData } from './modal-assinatura'

interface ModalPixQrcodeProps {
  data: PixData
  onClose: () => void
}

export function ModalPixQrcode({ data, onClose }: ModalPixQrcodeProps) {
  const [copiado, setCopiado] = useState(false)

  function copiarCodigo() {
    navigator.clipboard.writeText(data.qrCode).then(() => {
      setCopiado(true)
      setTimeout(() => setCopiado(false), 2500)
    })
  }

  const valorFormatado = data.valor.toFixed(2).replace('.', ',')

  return (
    <div
      className="fixed inset-0 z-[9100] flex items-center justify-center p-4"
      style={{ background: 'rgba(0,0,0,0.7)' }}
      onClick={(e) => { if (e.target === e.currentTarget) onClose() }}
    >
      <div
        className="relative w-full max-w-sm rounded-2xl shadow-2xl p-6 flex flex-col items-center gap-5"
        style={{
          background: 'var(--d2b-bg-surface)',
          border: '1px solid var(--d2b-border-strong)',
        }}
        onClick={e => e.stopPropagation()}
      >
        {/* Fechar */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-1.5 rounded-lg transition-colors hover:bg-[var(--d2b-hover)]"
          style={{ color: 'var(--d2b-text-muted)' }}
        >
          <X size={16} />
        </button>

        {/* Título */}
        <div className="flex items-center gap-2">
          <QrCode size={20} style={{ color: '#7C4DFF' }} />
          <h3 className="text-base font-semibold" style={{ color: 'var(--d2b-text-primary)' }}>
            Pagar via PIX
          </h3>
        </div>

        {/* Valor */}
        <div className="text-center">
          <p className="text-2xl font-bold" style={{ color: '#7C4DFF' }}>R$ {valorFormatado}</p>
          <p className="text-xs" style={{ color: 'var(--d2b-text-muted)' }}>Assinatura DEV2B</p>
        </div>

        {/* QR Code Image */}
        {data.qrCodeBase64 ? (
          <div
            className="w-48 h-48 rounded-xl overflow-hidden flex items-center justify-center p-2"
            style={{ background: '#fff' }}
          >
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={`data:image/png;base64,${data.qrCodeBase64}`}
              alt="QR Code PIX"
              className="w-full h-full object-contain"
            />
          </div>
        ) : (
          <div
            className="w-48 h-48 rounded-xl flex items-center justify-center"
            style={{ background: 'var(--d2b-bg-elevated)' }}
          >
            <QrCode size={64} style={{ color: 'var(--d2b-text-muted)' }} />
          </div>
        )}

        {/* Código copia e cola */}
        {data.qrCode && (
          <div className="w-full">
            <p className="text-[10px] font-bold tracking-widest uppercase mb-2" style={{ color: 'var(--d2b-text-muted)' }}>
              Código PIX (copia e cola)
            </p>
            <div
              className="flex items-center gap-2 p-2.5 rounded-lg border"
              style={{ background: 'var(--d2b-bg-elevated)', borderColor: 'var(--d2b-border-strong)' }}
            >
              <p className="text-[10px] truncate flex-1" style={{ color: 'var(--d2b-text-secondary)' }}>
                {data.qrCode}
              </p>
              <button
                onClick={copiarCodigo}
                className="flex-shrink-0 p-1.5 rounded-lg transition-all"
                style={{
                  background: copiado ? 'rgba(34,197,94,0.15)' : 'rgba(124,77,255,0.15)',
                  color: copiado ? '#22C55E' : '#7C4DFF',
                }}
              >
                {copiado ? <Check size={14} /> : <Copy size={14} />}
              </button>
            </div>
          </div>
        )}

        {/* Instrução */}
        <p className="text-xs text-center leading-relaxed" style={{ color: 'var(--d2b-text-secondary)' }}>
          Escaneie o QR Code com o app do seu banco ou copie o código PIX.
          Após o pagamento, sua assinatura será ativada automaticamente.
        </p>

        <button
          onClick={onClose}
          className="w-full py-2.5 rounded-xl text-sm font-medium transition-opacity hover:opacity-90"
          style={{ background: 'rgba(124,77,255,0.15)', color: '#7C4DFF' }}
        >
          Já paguei
        </button>
      </div>
    </div>
  )
}
