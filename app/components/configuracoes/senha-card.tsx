'use client'

import { Eye, EyeOff, Pencil, Trash2 } from 'lucide-react'
import { useState } from 'react'

interface SenhaCardProps {
  id: string
  tipo: string
  descricao: string
  valor: string
  onEdit: (id: string) => void
  onDelete: (id: string) => void
}

export function SenhaCard({ id, tipo, descricao, valor, onEdit, onDelete }: SenhaCardProps) {
  const [mostrarSenha, setMostrarSenha] = useState(false)

  const senhaOculta = '•'.repeat(valor.length)

  return (
    <div className="p-4 rounded-xl border border-[var(--d2b-border)] bg-[var(--d2b-bg-surface)] hover:border-[var(--d2b-border-strong)] transition-colors">
      <div className="flex items-start justify-between mb-3">
        <div className="flex-1">
          <h4 className="text-sm font-semibold text-[var(--d2b-text-primary)] mb-1">{tipo}</h4>
          {descricao && (
            <p className="text-xs text-[var(--d2b-text-secondary)]">{descricao}</p>
          )}
        </div>
        
        <div className="flex items-center gap-2">
          <button
            onClick={() => onEdit(id)}
            className="p-1.5 rounded-lg hover:bg-[var(--d2b-hover)] text-[var(--d2b-text-secondary)] hover:text-[#7C4DFF] transition-colors"
            title="Editar"
          >
            <Pencil size={14} />
          </button>
          
          <button
            onClick={() => onDelete(id)}
            className="p-1.5 rounded-lg hover:bg-[rgba(239,68,68,0.15)] text-[var(--d2b-text-secondary)] hover:text-[#EF4444] transition-colors"
            title="Excluir"
          >
            <Trash2 size={14} />
          </button>
        </div>
      </div>

      <div className="flex items-center gap-2 p-2.5 rounded-lg bg-[var(--d2b-bg-main)] border border-[var(--d2b-border)]">
        <code className="flex-1 text-sm text-[var(--d2b-text-primary)] font-mono">
          {mostrarSenha ? valor : senhaOculta}
        </code>
        
        <button
          onClick={() => setMostrarSenha(!mostrarSenha)}
          className="p-1.5 rounded-lg hover:bg-[var(--d2b-hover)] text-[var(--d2b-text-secondary)] hover:text-[#7C4DFF] transition-colors"
          title={mostrarSenha ? 'Ocultar senha' : 'Mostrar senha'}
        >
          {mostrarSenha ? <EyeOff size={16} /> : <Eye size={16} />}
        </button>
      </div>
    </div>
  )
}
