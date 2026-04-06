'use client'

import { useState, useEffect } from 'react'
import { X } from 'lucide-react'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'

interface SenhaFormDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  onSave: (data: { tipo: string; descricao: string; valor: string }) => void
  editData?: { id: string; tipo: string; descricao: string; valor: string } | null
  tipoFixo?: string
}

export function SenhaFormDialog({ open, onOpenChange, onSave, editData, tipoFixo }: SenhaFormDialogProps) {
  const [tipo, setTipo] = useState('')
  const [descricao, setDescricao] = useState('')
  const [valor, setValor] = useState('')

  useEffect(() => {
    if (editData) {
      setTipo(editData.tipo)
      setDescricao(editData.descricao || '')
      setValor(editData.valor)
    } else {
      setTipo(tipoFixo || '')
      setDescricao('')
      setValor('')
    }
  }, [editData, tipoFixo, open])

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!tipo.trim() || !valor.trim()) return
    
    onSave({ tipo, descricao, valor })
    setTipo(tipoFixo || '')
    setDescricao('')
    setValor('')
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md bg-[var(--d2b-bg-main)] border border-[var(--d2b-border-strong)]">
        <DialogHeader>
          <DialogTitle className="text-lg font-bold text-[var(--d2b-text-primary)]">
            {editData ? 'Editar senha' : 'Cadastrar nova senha'}
          </DialogTitle>
          <button
            onClick={() => onOpenChange(false)}
            className="absolute right-4 top-4 rounded-sm opacity-70 ring-offset-background transition-opacity hover:opacity-100 focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 disabled:pointer-events-none"
          >
            <X className="h-4 w-4 text-[var(--d2b-text-secondary)]" />
            <span className="sr-only">Close</span>
          </button>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4 pt-2">
          {!tipoFixo && (
            <div>
              <label className="block text-sm font-medium text-[var(--d2b-text-primary)] mb-2">
                Tipo
              </label>
              <input
                type="text"
                value={tipo}
                onChange={(e) => setTipo(e.target.value)}
                placeholder="Ex: Senha Financeiro"
                className="w-full px-3 py-2 rounded-lg border border-[var(--d2b-border-strong)] bg-[var(--d2b-bg-surface)] text-[var(--d2b-text-primary)] text-sm placeholder:text-[var(--d2b-text-muted)] focus:outline-none focus:border-[#7C4DFF]"
                required
              />
            </div>
          )}

          <div>
            <label className="block text-sm font-medium text-[var(--d2b-text-primary)] mb-2">
              Descrição (opcional)
            </label>
            <textarea
              value={descricao}
              onChange={(e) => setDescricao(e.target.value)}
              placeholder="Defina uma nova senha"
              rows={2}
              className="w-full px-3 py-2 rounded-lg border border-[var(--d2b-border-strong)] bg-[var(--d2b-bg-surface)] text-[var(--d2b-text-primary)] text-sm placeholder:text-[var(--d2b-text-muted)] focus:outline-none focus:border-[#7C4DFF] resize-none"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-[var(--d2b-text-primary)] mb-2">
              Senha
            </label>
            <input
              type="text"
              value={valor}
              onChange={(e) => setValor(e.target.value)}
              placeholder="Digite a senha"
              className="w-full px-3 py-2 rounded-lg border border-[var(--d2b-border-strong)] bg-[var(--d2b-bg-surface)] text-[var(--d2b-text-primary)] text-sm placeholder:text-[var(--d2b-text-muted)] focus:outline-none focus:border-[#7C4DFF] font-mono"
              required
            />
          </div>

          <div className="flex items-center justify-end gap-3 pt-2">
            <button
              type="button"
              onClick={() => onOpenChange(false)}
              className="px-4 py-2 rounded-lg border border-[var(--d2b-border-strong)] hover:border-[#7C4DFF] text-[var(--d2b-text-secondary)] hover:text-[var(--d2b-text-primary)] text-sm font-semibold transition-colors"
            >
              Cancelar
            </button>
            
            <button
              type="submit"
              className="px-6 py-2 rounded-lg bg-[#7C4DFF] hover:bg-[#5B21B6] text-white text-sm font-semibold transition-colors"
            >
              {editData ? 'Salvar alterações' : 'Cadastrar senha'}
            </button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  )
}
