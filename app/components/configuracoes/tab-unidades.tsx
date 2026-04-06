'use client'

import { useState, useEffect } from 'react'
import { Plus, Pencil, Trash2, Check, X } from 'lucide-react'
import { useToast } from '@/hooks/use-toast'
import type { EmpresaData } from '@/app/dashboard/configuracoes/page'

interface TabUnidadesProps {
  initialEmpresa?: EmpresaData | null
}

interface Unidade {
  id: string
  nome: string
  descricao: string
  ativa: boolean
  empresaId: string
  createdAt: string
}

export function TabUnidades({ initialEmpresa }: TabUnidadesProps) {
  const { toast } = useToast()
  const [unidades, setUnidades] = useState<Unidade[]>([])
  const [loading, setLoading] = useState(true)
  const [editingId, setEditingId] = useState<string | null>(null)
  const [editNome, setEditNome] = useState('')
  const [editDescricao, setEditDescricao] = useState('')
  const [criandoNova, setCriandoNova] = useState(false)
  const [novoNome, setNovoNome] = useState('')
  const [novoDescricao, setNovoDescricao] = useState('')

  useEffect(() => {
    if (initialEmpresa?.id) {
      carregarUnidades()
    }
  }, [initialEmpresa?.id])

  const carregarUnidades = async () => {
    if (!initialEmpresa?.id) return
    
    setLoading(true)
    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/v1/unidades/empresa/${initialEmpresa.id}`)
      if (res.ok) {
        const data = await res.json()
        setUnidades(data)
      }
    } catch (error) {
      console.error('Erro ao carregar unidades:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleCriar = async () => {
    if (!novoNome.trim() || !initialEmpresa?.id) return
    
    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/v1/unidades`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          nome: novoNome,
          descricao: novoDescricao,
          empresaId: initialEmpresa.id,
        }),
      })

      if (res.ok) {
        toast({ title: 'Unidade criada com sucesso!' })
        carregarUnidades()
        setCriandoNova(false)
        setNovoNome('')
        setNovoDescricao('')
      } else {
        toast({ title: 'Erro ao criar unidade', variant: 'destructive' })
      }
    } catch (error) {
      console.error('Erro ao criar unidade:', error)
      toast({ title: 'Erro ao criar unidade', variant: 'destructive' })
    }
  }

  const handleEditar = (unidade: Unidade) => {
    setEditingId(unidade.id)
    setEditNome(unidade.nome)
    setEditDescricao(unidade.descricao || '')
  }

  const handleSalvarEdicao = async (id: string) => {
    if (!editNome.trim()) return

    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/v1/unidades/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          nome: editNome,
          descricao: editDescricao,
        }),
      })

      if (res.ok) {
        toast({ title: 'Unidade atualizada com sucesso!' })
        carregarUnidades()
        setEditingId(null)
      } else {
        toast({ title: 'Erro ao atualizar unidade', variant: 'destructive' })
      }
    } catch (error) {
      console.error('Erro ao atualizar unidade:', error)
      toast({ title: 'Erro ao atualizar unidade', variant: 'destructive' })
    }
  }

  const handleToggleAtiva = async (id: string, ativa: boolean) => {
    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/v1/unidades/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ativa: !ativa }),
      })

      if (res.ok) {
        toast({ title: `Unidade ${!ativa ? 'ativada' : 'inativada'} com sucesso!` })
        carregarUnidades()
      } else {
        toast({ title: 'Erro ao alterar status', variant: 'destructive' })
      }
    } catch (error) {
      console.error('Erro ao alterar status:', error)
      toast({ title: 'Erro ao alterar status', variant: 'destructive' })
    }
  }

  const handleDeletar = async (id: string) => {
    if (!confirm('Tem certeza que deseja excluir esta unidade?')) return

    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/v1/unidades/${id}`, {
        method: 'DELETE',
      })

      if (res.ok) {
        toast({ title: 'Unidade excluída com sucesso!' })
        carregarUnidades()
      } else {
        toast({ title: 'Erro ao excluir unidade', variant: 'destructive' })
      }
    } catch (error) {
      console.error('Erro ao excluir unidade:', error)
      toast({ title: 'Erro ao excluir unidade', variant: 'destructive' })
    }
  }

  return (
    <div className="space-y-7">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-base font-bold text-[var(--d2b-text-primary)]">Unidades da Clínica</h2>
          <p className="text-xs text-[var(--d2b-text-secondary)] mt-1">
            Crie e gerencie as unidades da sua clínica e personalize as permissões para cada usuário.
          </p>
        </div>
        
        <button
          onClick={() => setCriandoNova(true)}
          className="flex items-center gap-2 px-4 py-2 rounded-lg bg-[#7C4DFF] hover:bg-[#5B21B6] text-white text-sm font-semibold transition-colors"
        >
          <Plus size={16} />
          Adicionar unidade
        </button>
      </div>

      <div>
        <h3 className="text-sm font-semibold text-[var(--d2b-text-primary)] mb-4">Lista de unidades</h3>
        <p className="text-xs text-[var(--d2b-text-secondary)] mb-4">
          Edite o nome e ative/desative unidades. Inativas ficam ocultas em filtros e seleções.
        </p>

        {loading ? (
          <div className="p-8 text-center text-[var(--d2b-text-secondary)]">Carregando...</div>
        ) : (
          <div className="space-y-3">
            {/* Formulário criar nova */}
            {criandoNova && (
              <div className="p-4 rounded-xl border border-[var(--d2b-border-strong)] bg-[var(--d2b-bg-surface)]">
                <h4 className="text-sm font-semibold text-[var(--d2b-text-primary)] mb-3">CRIAR UNIDADE</h4>
                
                <div className="space-y-3">
                  <input
                    type="text"
                    value={novoNome}
                    onChange={(e) => setNovoNome(e.target.value)}
                    placeholder="Nome da unidade"
                    className="w-full px-3 py-2 rounded-lg border border-[var(--d2b-border-strong)] bg-[var(--d2b-bg-main)] text-[var(--d2b-text-primary)] text-sm placeholder:text-[var(--d2b-text-muted)] focus:outline-none focus:border-[#7C4DFF]"
                  />
                  
                  <textarea
                    value={novoDescricao}
                    onChange={(e) => setNovoDescricao(e.target.value)}
                    placeholder="Descrição (opcional)"
                    rows={2}
                    className="w-full px-3 py-2 rounded-lg border border-[var(--d2b-border-strong)] bg-[var(--d2b-bg-main)] text-[var(--d2b-text-primary)] text-sm placeholder:text-[var(--d2b-text-muted)] focus:outline-none focus:border-[#7C4DFF] resize-none"
                  />
                  
                  <div className="flex items-center gap-2">
                    <button
                      onClick={handleCriar}
                      className="px-4 py-2 rounded-lg bg-[#7C4DFF] hover:bg-[#5B21B6] text-white text-sm font-semibold transition-colors"
                    >
                      Salvar
                    </button>
                    <button
                      onClick={() => {
                        setCriandoNova(false)
                        setNovoNome('')
                        setNovoDescricao('')
                      }}
                      className="px-4 py-2 rounded-lg border border-[var(--d2b-border-strong)] text-[var(--d2b-text-secondary)] text-sm font-semibold transition-colors"
                    >
                      Cancelar
                    </button>
                  </div>
                </div>
              </div>
            )}

            {/* Lista de unidades */}
            {unidades.map(unidade => (
              <div
                key={unidade.id}
                className="p-4 rounded-xl border border-[var(--d2b-border)] bg-[var(--d2b-bg-surface)] hover:border-[var(--d2b-border-strong)] transition-colors"
              >
                {editingId === unidade.id ? (
                  <div className="space-y-3">
                    <input
                      type="text"
                      value={editNome}
                      onChange={(e) => setEditNome(e.target.value)}
                      className="w-full px-3 py-2 rounded-lg border border-[var(--d2b-border-strong)] bg-[var(--d2b-bg-main)] text-[var(--d2b-text-primary)] text-sm focus:outline-none focus:border-[#7C4DFF]"
                    />
                    
                    <textarea
                      value={editDescricao}
                      onChange={(e) => setEditDescricao(e.target.value)}
                      rows={2}
                      className="w-full px-3 py-2 rounded-lg border border-[var(--d2b-border-strong)] bg-[var(--d2b-bg-main)] text-[var(--d2b-text-primary)] text-sm focus:outline-none focus:border-[#7C4DFF] resize-none"
                    />
                    
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => handleSalvarEdicao(unidade.id)}
                        className="p-2 rounded-lg bg-[#7C4DFF] hover:bg-[#5B21B6] text-white transition-colors"
                        title="Salvar"
                      >
                        <Check size={16} />
                      </button>
                      <button
                        onClick={() => setEditingId(null)}
                        className="p-2 rounded-lg border border-[var(--d2b-border-strong)] text-[var(--d2b-text-secondary)] transition-colors"
                        title="Cancelar"
                      >
                        <X size={16} />
                      </button>
                    </div>
                  </div>
                ) : (
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <h4 className="text-sm font-semibold text-[var(--d2b-text-primary)]">{unidade.nome}</h4>
                        <span className={`text-xs px-2 py-0.5 rounded ${
                          unidade.ativa 
                            ? 'bg-[rgba(34,197,94,0.15)] text-[#22C55E]' 
                            : 'bg-[rgba(239,68,68,0.15)] text-[#EF4444]'
                        }`}>
                          {unidade.ativa ? 'Ativa' : 'Inativa'}
                        </span>
                      </div>
                      {unidade.descricao && (
                        <p className="text-xs text-[var(--d2b-text-secondary)]">{unidade.descricao}</p>
                      )}
                      <p className="text-[10px] text-[var(--d2b-text-muted)] mt-1">
                        Criada em: {new Date(unidade.createdAt).toLocaleDateString('pt-BR')}
                      </p>
                    </div>

                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => handleEditar(unidade)}
                        className="p-2 rounded-lg hover:bg-[var(--d2b-hover)] text-[var(--d2b-text-secondary)] hover:text-[#7C4DFF] transition-colors"
                        title="Editar"
                      >
                        <Pencil size={16} />
                      </button>
                      
                      <button
                        onClick={() => handleToggleAtiva(unidade.id, unidade.ativa)}
                        className={`p-2 rounded-lg transition-colors ${
                          unidade.ativa
                            ? 'hover:bg-[rgba(239,68,68,0.15)] text-[var(--d2b-text-secondary)] hover:text-[#EF4444]'
                            : 'hover:bg-[rgba(34,197,94,0.15)] text-[var(--d2b-text-secondary)] hover:text-[#22C55E]'
                        }`}
                        title={unidade.ativa ? 'Inativar' : 'Ativar'}
                      >
                        <Check size={16} />
                      </button>
                      
                      <button
                        onClick={() => handleDeletar(unidade.id)}
                        className="p-2 rounded-lg hover:bg-[rgba(239,68,68,0.15)] text-[var(--d2b-text-secondary)] hover:text-[#EF4444] transition-colors"
                        title="Excluir"
                      >
                        <Trash2 size={16} />
                      </button>
                    </div>
                  </div>
                )}
              </div>
            ))}

            {unidades.length === 0 && !criandoNova && (
              <div className="p-12 text-center rounded-xl border border-dashed border-[var(--d2b-border-strong)] bg-[var(--d2b-bg-surface)]">
                <p className="text-sm text-[var(--d2b-text-secondary)]">Nenhuma unidade cadastrada</p>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  )
}
