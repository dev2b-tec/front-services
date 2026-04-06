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
    <div className="p-4 rounded-xl border border-[rgba(124,77,255,0.18)] bg-[#120328] hover:border-[rgba(124,77,255,0.35)] transition-colors">
      <div className="flex items-start justify-between mb-3">
        <div className="flex-1">
          <h4 className="text-sm font-semibold text-[#F5F0FF] mb-1">{tipo}</h4>
          {descricao && (
            <p className="text-xs text-[#A78BCC]">{descricao}</p>
          )}
        </div>
        
        <div className="flex items-center gap-2">
          <button
            onClick={() => onEdit(id)}
            className="p-1.5 rounded-lg hover:bg-[rgba(124,77,255,0.15)] text-[#A78BCC] hover:text-[#7C4DFF] transition-colors"
            title="Editar"
          >
            <Pencil size={14} />
          </button>
          
          <button
            onClick={() => onDelete(id)}
            className="p-1.5 rounded-lg hover:bg-[rgba(239,68,68,0.15)] text-[#A78BCC] hover:text-[#EF4444] transition-colors"
            title="Excluir"
          >
            <Trash2 size={14} />
          </button>
        </div>
      </div>

      <div className="flex items-center gap-2 p-2.5 rounded-lg bg-[#0D0520] border border-[rgba(124,77,255,0.15)]">
        <code className="flex-1 text-sm text-[#F5F0FF] font-mono">
          {mostrarSenha ? valor : senhaOculta}
        </code>
        
        <button
          onClick={() => setMostrarSenha(!mostrarSenha)}
          className="p-1.5 rounded-lg hover:bg-[rgba(124,77,255,0.15)] text-[#A78BCC] hover:text-[#7C4DFF] transition-colors"
          title={mostrarSenha ? 'Ocultar senha' : 'Mostrar senha'}
        >
          {mostrarSenha ? <EyeOff size={16} /> : <Eye size={16} />}
        </button>
      </div>
    </div>
  )
}
