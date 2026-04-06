'use client'

import { useState, useEffect } from 'react'
import { Plus, AlertTriangle } from 'lucide-react'
import { useToast } from '@/hooks/use-toast'
import { SenhaCard } from './senha-card'
import { SenhaFormDialog } from './senha-form-dialog'
import type { UsuarioData } from '@/app/dashboard/configuracoes/page'

interface TabSenhasProps {
  initialUsuario?: UsuarioData | null
}

interface Senha {
  id: string
  tipo: string
  descricao: string
  valor: string
  usuarioId: string
}

export function TabSenhas({ initialUsuario }: TabSenhasProps) {
  const { toast } = useToast()
  const [senhas, setSenhas] = useState<Senha[]>([])
  const [loading, setLoading] = useState(true)
  const [dialogOpen, setDialogOpen] = useState(false)
  const [editingSenha, setEditingSenha] = useState<Senha | null>(null)
  const [tipoAtivo, setTipoAtivo] = useState<'financeiro' | 'prontuario'>('financeiro')
  const [deleteConfirmId, setDeleteConfirmId] = useState<string | null>(null)

  useEffect(() => {
    if (initialUsuario?.id) {
      carregarSenhas()
    }
  }, [initialUsuario?.id])

  const carregarSenhas = async () => {
    if (!initialUsuario?.id) return
    
    setLoading(true)
    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/v1/senhas/usuario/${initialUsuario.id}`)
      if (res.ok) {
        const data = await res.json()
        setSenhas(data)
      }
    } catch (error) {
      console.error('Erro ao carregar senhas:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleSave = async (data: { tipo: string; descricao: string; valor: string }) => {
    if (!initialUsuario?.id) return

    try {
      if (editingSenha) {
        // Atualizar senha existente
        const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/v1/senhas/${editingSenha.id}`, {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(data),
        })

        if (res.ok) {
          toast({ title: 'Senha atualizada com sucesso!' })
          carregarSenhas()
          setDialogOpen(false)
          setEditingSenha(null)
        } else {
          toast({ title: 'Erro ao atualizar senha', variant: 'destructive' })
        }
      } else {
        // Criar nova senha
        const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/v1/senhas`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            ...data,
            usuarioId: initialUsuario.id,
          }),
        })

        if (res.ok) {
          toast({ title: 'Senha cadastrada com sucesso!' })
          carregarSenhas()
          setDialogOpen(false)
        } else {
          toast({ title: 'Erro ao cadastrar senha', variant: 'destructive' })
        }
      }
    } catch (error) {
      console.error('Erro ao salvar senha:', error)
      toast({ title: 'Erro ao salvar senha', variant: 'destructive' })
    }
  }

  const handleEdit = (id: string) => {
    const senha = senhas.find(s => s.id === id)
    if (senha) {
      setEditingSenha(senha)
      setDialogOpen(true)
    }
  }

  const handleDelete = async (id: string) => {
    if (deleteConfirmId !== id) {
      setDeleteConfirmId(id)
      setTimeout(() => setDeleteConfirmId(null), 3000)
      return
    }

    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/v1/senhas/${id}`, {
        method: 'DELETE',
      })

      if (res.ok) {
        toast({ title: 'Senha excluída com sucesso!' })
        carregarSenhas()
        setDeleteConfirmId(null)
      } else {
        toast({ title: 'Erro ao excluir senha', variant: 'destructive' })
      }
    } catch (error) {
      console.error('Erro ao excluir senha:', error)
      toast({ title: 'Erro ao excluir senha', variant: 'destructive' })
    }
  }

  const handleNovaSenha = () => {
    setEditingSenha(null)
    setDialogOpen(true)
  }

  const senhasFinanceiro = senhas.filter(s => s.tipo.toLowerCase().includes('financeiro'))
  const senhasProntuario = senhas.filter(s => s.tipo.toLowerCase().includes('prontuário') || s.tipo.toLowerCase().includes('prontuario'))

  return (
    <div className="space-y-7">
      <div className="flex items-center justify-between">
        <h2 className="text-base font-bold text-[#F5F0FF]">Ativar Senhas</h2>
      </div>

      {/* Senha Financeiro */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-sm font-bold text-[#F5F0FF]">Senha Financeiro</h3>
            <p className="text-xs text-[#A78BCC] mt-0.5">Defina uma nova senha</p>
          </div>
          
          <button
            onClick={() => {
              setTipoAtivo('financeiro')
              handleNovaSenha()
            }}
            className="flex items-center gap-2 px-4 py-2 rounded-lg bg-[#7C4DFF] hover:bg-[#5B21B6] text-white text-sm font-semibold transition-colors"
          >
            <Plus size={16} />
            Cadastrar nova senha
          </button>
        </div>

        {loading ? (
          <div className="p-8 text-center text-[#A78BCC]">Carregando...</div>
        ) : senhasFinanceiro.length > 0 ? (
          <div className="grid gap-3">
            {senhasFinanceiro.map(senha => (
              <SenhaCard
                key={senha.id}
                {...senha}
                onEdit={handleEdit}
                onDelete={handleDelete}
              />
            ))}
          </div>
        ) : (
          <div className="p-8 text-center rounded-xl border border-dashed border-[rgba(124,77,255,0.25)] bg-[#120328]">
            <p className="text-sm text-[#A78BCC]">Nenhuma senha cadastrada</p>
          </div>
        )}
      </div>

      {/* Senha de Prontuário */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-sm font-bold text-[#F5F0FF]">Senha de Prontuário</h3>
            <p className="text-xs text-[#A78BCC] mt-0.5">Defina uma nova senha</p>
          </div>
          
          <button
            onClick={() => {
              setTipoAtivo('prontuario')
              handleNovaSenha()
            }}
            className="flex items-center gap-2 px-4 py-2 rounded-lg bg-[#7C4DFF] hover:bg-[#5B21B6] text-white text-sm font-semibold transition-colors"
          >
            <Plus size={16} />
            Cadastrar nova senha
          </button>
        </div>

        {loading ? (
          <div className="p-8 text-center text-[#A78BCC]">Carregando...</div>
        ) : senhasProntuario.length > 0 ? (
          <div className="grid gap-3">
            {senhasProntuario.map(senha => (
              <SenhaCard
                key={senha.id}
                {...senha}
                onEdit={handleEdit}
                onDelete={handleDelete}
              />
            ))}
          </div>
        ) : (
          <div className="p-8 text-center rounded-xl border border-dashed border-[rgba(124,77,255,0.25)] bg-[#120328]">
            <p className="text-sm text-[#A78BCC]">Nenhuma senha cadastrada</p>
          </div>
        )}
      </div>

      {deleteConfirmId && (
        <div className="fixed bottom-4 right-4 p-4 rounded-lg bg-[#EF4444] text-white shadow-lg flex items-center gap-3">
          <AlertTriangle size={20} />
          <span className="text-sm font-semibold">Clique novamente para confirmar exclusão</span>
        </div>
      )}

      <SenhaFormDialog
        open={dialogOpen}
        onOpenChange={(open) => {
          setDialogOpen(open)
          if (!open) setEditingSenha(null)
        }}
        onSave={handleSave}
        editData={editingSenha}
        tipoFixo={tipoAtivo === 'financeiro' ? 'Senha Financeiro' : 'Senha de Prontuário'}
      />
    </div>
  )
}
