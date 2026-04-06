'use client'

import { useRef, useState } from 'react'
import SignatureCanvas from 'react-signature-canvas'
import { X, Trash2, Check } from 'lucide-react'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'

interface SignatureDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  onSave: (signatureDataUrl: string) => void
}

export function SignatureDialog({ open, onOpenChange, onSave }: SignatureDialogProps) {
  const sigCanvas = useRef<SignatureCanvas>(null)
  const [isEmpty, setIsEmpty] = useState(true)

  const handleClear = () => {
    sigCanvas.current?.clear()
    setIsEmpty(true)
  }

  const handleSave = () => {
    if (sigCanvas.current && !isEmpty) {
      const dataUrl = sigCanvas.current.toDataURL('image/png', 1.0)
      onSave(dataUrl)
      handleClear()
      onOpenChange(false)
    }
  }

  const handleBegin = () => {
    setIsEmpty(false)
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl bg-[#0D0520] border border-[rgba(124,77,255,0.25)]">
        <DialogHeader>
          <DialogTitle className="text-lg font-bold text-[#F5F0FF]">
            Criar assinatura
          </DialogTitle>
          <button
            onClick={() => onOpenChange(false)}
            className="absolute right-4 top-4 rounded-sm opacity-70 ring-offset-background transition-opacity hover:opacity-100 focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 disabled:pointer-events-none data-[state=open]:bg-accent data-[state=open]:text-muted-foreground"
          >
            <X className="h-4 w-4 text-[#A78BCC]" />
            <span className="sr-only">Close</span>
          </button>
        </DialogHeader>

        <div className="space-y-4 pt-2">
          <p className="text-sm text-[#A78BCC]">
            Assine abaixo (mouse ou toque). A saída será PNG transparente já padronizada para documentos.
          </p>

          {/* Canvas de assinatura */}
          <div className="relative rounded-lg border-2 border-dashed border-[rgba(124,77,255,0.25)] bg-white overflow-hidden">
            <SignatureCanvas
              ref={sigCanvas}
              canvasProps={{
                className: 'w-full h-32 cursor-crosshair',
                style: { touchAction: 'none' }
              }}
              backgroundColor="rgb(255, 255, 255)"
              penColor="rgb(0, 0, 0)"
              minWidth={1}
              maxWidth={2.5}
              velocityFilterWeight={0.7}
              onBegin={handleBegin}
            />
          </div>

          {/* Botões de ação */}
          <div className="flex items-center justify-between pt-2">
            <button
              onClick={handleClear}
              disabled={isEmpty}
              className="flex items-center gap-2 px-4 py-2 rounded-lg border border-[rgba(124,77,255,0.25)] hover:border-[#7C4DFF] text-[#A78BCC] hover:text-[#F5F0FF] text-sm font-semibold transition-colors disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:border-[rgba(124,77,255,0.25)] disabled:hover:text-[#A78BCC]"
            >
              <Trash2 size={14} />
              Limpar
            </button>

            <button
              onClick={handleSave}
              disabled={isEmpty}
              className="flex items-center gap-2 px-6 py-2 rounded-lg bg-[#7C4DFF] hover:bg-[#5B21B6] text-white text-sm font-semibold transition-colors disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:bg-[#7C4DFF]"
            >
              <Check size={14} />
              Salvar assinatura
            </button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}
