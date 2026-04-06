'use client'

import { useState, useEffect } from 'react'
import { Plus, Pencil, Trash2, DoorOpen } from 'lucide-react'
import { useToast } from '@/hooks/use-toast'
import type { EmpresaData } from '@/app/dashboard/configuracoes/page'

interface TabSalasProps {
  initialEmpresa?: EmpresaData | null
}

interface Unidade {
  id: string
  nome: string
}

interface Sala {
  id: string
  nome: string
  unidadeId: string | null
  unidadeNome: string | null
  ativa: boolean
  permitirOverbooking: boolean
  empresaId: string
}

export function TabSalas({ initialEmpresa }: TabSalasProps) {
  const { toast } = useToast()
  const [salas, setSalas] = useState<Sala[]>([])
  const [unidades, setUnidades] = useState<Unidade[]>([])
  const [loading, setLoading] = useState(true)
  const [habilitarGestaoSalas, setHabilitarGestaoSalas] = useState(false)
  
  // Criar nova sala
  const [criandoNova, setCriandoNova] = useState(false)
  const [novoNome, setNovoNome] = useState('')
  const [novaUnidadeId, setNovaUnidadeId] = useState<string>('')
  const [novoPermitirOverbooking, setNovoPermitirOverbooking] = useState(false)

  // Editar sala
  const [editingId, setEditingId] = useState<string | null>(null)
  const [editNome, setEditNome] = useState('')
  const [editUnidadeId, setEditUnidadeId] = useState<string>('')
  const [editPermitirOverbooking, setEditPermitirOverbooking] = useState(false)

  useEffect(() => {
    if (initialEmpresa?.id) {
      carregarUnidades()
      carregarSalas()
    }
  }, [initialEmpresa?.id])

  const carregarUnidades = async () => {
    if (!initialEmpresa?.id) return
    
    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/v1/unidades/empresa/${initialEmpresa.id}/ativas`)
      if (res.ok) {
        const data = await res.json()
        setUnidades(data)
      }
    } catch (error) {
      console.error('Erro ao carregar unidades:', error)
    }
  }

  const carregarSalas = async () => {
    if (!initialEmpresa?.id) return
    
    setLoading(true)
    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/v1/salas/empresa/${initialEmpresa.id}`)
      if (res.ok) {
        const data = await res.json()
        setSalas(data)
        setHabilitarGestaoSalas(data.length > 0)
      }
    } catch (error) {
      console.error('Erro ao carregar salas:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleCriar = async () => {
    if (!novoNome.trim() || !initialEmpresa?.id) return
    
    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/v1/salas`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          nome: novoNome,
          unidadeId: novaUnidadeId || null,
          permitirOverbooking: novoPermitirOverbooking,
          empresaId: initialEmpresa.id,
        }),
      })

      if (res.ok) {
        toast({ title: 'Sala criada com sucesso!' })
        carregarSalas()
        setCriandoNova(false)
        setNovoNome('')
        setNovaUnidadeId('')
        setNovoPermitirOverbooking(false)
      } else {
        toast({ title: 'Erro ao criar sala', variant: 'destructive' })
      }
    } catch (error) {
      console.error('Erro ao criar sala:', error)
      toast({ title: 'Erro ao criar sala', variant: 'destructive' })
    }
  }

  const handleEditar = (sala: Sala) => {
    setEditingId(sala.id)
    setEditNome(sala.nome)
    setEditUnidadeId(sala.unidadeId || '')
    setEditPermitirOverbooking(sala.permitirOverbooking)
  }

  const handleSalvarEdicao = async (id: string) => {
    if (!editNome.trim()) return

    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/v1/salas/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          nome: editNome,
          unidadeId: editUnidadeId || null,
          permitirOverbooking: editPermitirOverbooking,
        }),
      })

      if (res.ok) {
        toast({ title: 'Sala atualizada com sucesso!' })
        carregarSalas()
        setEditingId(null)
      } else {
        toast({ title: 'Erro ao atualizar sala', variant: 'destructive' })
      }
    } catch (error) {
      console.error('Erro ao atualizar sala:', error)
      toast({ title: 'Erro ao atualizar sala', variant: 'destructive' })
    }
  }

  const handleDeletar = async (id: string) => {
    if (!confirm('Tem certeza que deseja excluir esta sala?')) return

    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/v1/salas/${id}`, {
        method: 'DELETE',
      })

      if (res.ok) {
        toast({ title: 'Sala excluída com sucesso!' })
        carregarSalas()
      } else {
        toast({ title: 'Erro ao excluir sala', variant: 'destructive' })
      }
    } catch (error) {
      console.error('Erro ao excluir sala:', error)
      toast({ title: 'Erro ao excluir sala', variant: 'destructive' })
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex items-start justify-between">
        <div>
          <h2 className="text-base font-bold text-[var(--d2b-text-primary)]">Salas da Clínica</h2>
          <p className="text-xs text-[var(--d2b-text-secondary)] mt-1">
            Gerencie a lista de salas da sua clínica para que possam ser alocadas no atendimento de seus pacientes.
          </p>
        </div>
      </div>

      {/* Toggle Habilitar Gestão de Salas */}
      <div className="flex items-center gap-3 p-4 rounded-xl border border-[var(--d2b-border-strong)] bg-[var(--d2b-bg-surface)]">
        <button
          onClick={() => {
            if (habilitarGestaoSalas && salas.length > 0) {
              if (confirm('Desabilitar gestão de salas irá manter as salas cadastradas. Deseja continuar?')) {
                setHabilitarGestaoSalas(false)
              }
            } else {
              setHabilitarGestaoSalas(!habilitarGestaoSalas)
            }
          }}
          className={`relative w-11 h-6 rounded-full transition-colors ${
            habilitarGestaoSalas ? 'bg-[#7C4DFF]' : 'bg-[var(--d2b-bg-elevated)]'
          }`}
        >
          <span
            className={`absolute top-0.5 left-0.5 w-5 h-5 bg-white rounded-full transition-transform ${
              habilitarGestaoSalas ? 'translate-x-5' : 'translate-x-0'
            }`}
          />
        </button>
        <div className="flex-1">
          <p className="text-sm font-semibold text-[var(--d2b-text-primary)]">Habilitar funcionalidade de gestão de Salas</p>
        </div>
      </div>

      {habilitarGestaoSalas && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-semibold text-[var(--d2b-text-primary)]">Lista de salas</h3>
            <button
              onClick={() => setCriandoNova(true)}
              className="flex items-center gap-2 px-4 py-2 rounded-lg bg-[#7C4DFF] hover:bg-[#5B21B6] text-white text-sm font-semibold transition-colors"
            >
              <Plus size={16} />
              Adicionar sala
            </button>
          </div>

          {loading ? (
            <div className="p-8 text-center text-[var(--d2b-text-secondary)]">Carregando...</div>
          ) : (
            <div className="space-y-3">
              {/* Formulário criar nova */}
              {criandoNova && (
                <div className="p-4 rounded-xl border border-[var(--d2b-border-strong)] bg-[var(--d2b-bg-surface)]">
                  <div className="space-y-3">
                    <input
                      type="text"
                      value={novoNome}
                      onChange={(e) => setNovoNome(e.target.value)}
                      placeholder="Nome da Sala"
                      className="w-full px-3 py-2 rounded-lg border border-[var(--d2b-border-strong)] bg-[var(--d2b-bg-main)] text-[var(--d2b-text-primary)] text-sm placeholder:text-[var(--d2b-text-muted)] focus:outline-none focus:border-[#7C4DFF]"
                    />
                    
                    <select
                      value={novaUnidadeId}
                      onChange={(e) => setNovaUnidadeId(e.target.value)}
                      className="w-full px-3 py-2 rounded-lg border border-[var(--d2b-border-strong)] bg-[var(--d2b-bg-main)] text-[var(--d2b-text-primary)] text-sm focus:outline-none focus:border-[#7C4DFF]"
                    >
                      <option value="">Selecione uma unidade</option>
                      {unidades.map(u => (
                        <option key={u.id} value={u.id}>{u.nome}</option>
                      ))}
                    </select>

                    <label className="flex items-center gap-2 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={novoPermitirOverbooking}
                        onChange={(e) => setNovoPermitirOverbooking(e.target.checked)}
                        className="w-4 h-4 rounded border-[var(--d2b-border-strong)] bg-[var(--d2b-bg-main)] text-[#7C4DFF] focus:ring-[#7C4DFF]"
                      />
                      <span className="text-sm text-[var(--d2b-text-primary)]">Permitir overbooking nesta sala</span>
                    </label>
                    
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
                          setNovaUnidadeId('')
                          setNovoPermitirOverbooking(false)
                        }}
                        className="px-4 py-2 rounded-lg border border-[var(--d2b-border-strong)] text-[var(--d2b-text-secondary)] text-sm font-semibold transition-colors"
                      >
                        Cancelar
                      </button>
                    </div>
                  </div>
                </div>
              )}

              {/* Lista de salas */}
              {salas.map(sala => (
                <div
                  key={sala.id}
                  className="p-4 rounded-xl border border-[var(--d2b-border)] bg-[var(--d2b-bg-surface)] hover:border-[var(--d2b-border-strong)] transition-colors"
                >
                  {editingId === sala.id ? (
                    <div className="space-y-3">
                      <input
                        type="text"
                        value={editNome}
                        onChange={(e) => setEditNome(e.target.value)}
                        className="w-full px-3 py-2 rounded-lg border border-[var(--d2b-border-strong)] bg-[var(--d2b-bg-main)] text-[var(--d2b-text-primary)] text-sm focus:outline-none focus:border-[#7C4DFF]"
                      />
                      
                      <select
                        value={editUnidadeId}
                        onChange={(e) => setEditUnidadeId(e.target.value)}
                        className="w-full px-3 py-2 rounded-lg border border-[var(--d2b-border-strong)] bg-[var(--d2b-bg-main)] text-[var(--d2b-text-primary)] text-sm focus:outline-none focus:border-[#7C4DFF]"
                      >
                        <option value="">Selecione uma unidade</option>
                        {unidades.map(u => (
                          <option key={u.id} value={u.id}>{u.nome}</option>
                        ))}
                      </select>

                      <label className="flex items-center gap-2 cursor-pointer">
                        <input
                          type="checkbox"
                          checked={editPermitirOverbooking}
                          onChange={(e) => setEditPermitirOverbooking(e.target.checked)}
                          className="w-4 h-4 rounded border-[var(--d2b-border-strong)] bg-[var(--d2b-bg-main)] text-[#7C4DFF] focus:ring-[#7C4DFF]"
                        />
                        <span className="text-sm text-[var(--d2b-text-primary)]">Permitir overbooking nesta sala</span>
                      </label>
                      
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => handleSalvarEdicao(sala.id)}
                          className="px-4 py-2 rounded-lg bg-[#7C4DFF] hover:bg-[#5B21B6] text-white text-sm font-semibold"
                        >
                          Salvar
                        </button>
                        <button
                          onClick={() => setEditingId(null)}
                          className="px-4 py-2 rounded-lg border border-[var(--d2b-border-strong)] text-[var(--d2b-text-secondary)] text-sm font-semibold"
                        >
                          Cancelar
                        </button>
                      </div>
                    </div>
                  ) : (
                    <div className="flex items-start justify-between">
                      <div className="flex items-start gap-3 flex-1">
                        <DoorOpen size={20} className="text-[#7C4DFF] mt-0.5" />
                        <div className="flex-1">
                          <h4 className="text-sm font-semibold text-[var(--d2b-text-primary)]">{sala.nome}</h4>
                          {sala.unidadeNome && (
                            <p className="text-xs text-[var(--d2b-text-secondary)] mt-0.5">{sala.unidadeNome}</p>
                          )}
                          {sala.permitirOverbooking && (
                            <p className="text-xs text-[#7C4DFF] mt-1">Overbooking permitido</p>
                          )}
                        </div>
                      </div>

                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => handleEditar(sala)}
                          className="p-2 rounded-lg hover:bg-[var(--d2b-hover)] text-[var(--d2b-text-secondary)] hover:text-[#7C4DFF] transition-colors"
                          title="Editar"
                        >
                          <Pencil size={16} />
                        </button>
                        
                        <button
                          onClick={() => handleDeletar(sala.id)}
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

              {salas.length === 0 && !criandoNova && (
                <div className="p-12 text-center rounded-xl border border-dashed border-[var(--d2b-border-strong)] bg-[var(--d2b-bg-main)]">
                  <DoorOpen size={48} className="mx-auto mb-4 text-[var(--d2b-text-muted)]" />
                  <p className="text-sm text-[var(--d2b-text-secondary)]">Nenhuma sala cadastrada</p>
                  <p className="text-xs text-[var(--d2b-text-muted)] mt-1">Clique em "Adicionar sala" para começar</p>
                </div>
              )}
            </div>
          )}
        </div>
      )}
    </div>
  )
}
