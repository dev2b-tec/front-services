'use client'

import { useState, useEffect } from 'react'
import { Plus, Pencil, Trash2, Search, Briefcase } from 'lucide-react'
import { useToast } from '@/hooks/use-toast'
import type { EmpresaData } from '@/app/dashboard/configuracoes/page'

interface TabServicosProps {
  initialEmpresa?: EmpresaData | null
}

interface Servico {
  id: string
  nome: string
  tipo: string
  valor: number
  ativo: boolean
  empresaId: string
}

export function TabServicos({ initialEmpresa }: TabServicosProps) {
  const { toast } = useToast()
  const [servicos, setServicos] = useState<Servico[]>([])
  const [loading, setLoading] = useState(true)
  const [busca, setBusca] = useState('')
  const [filtroTipo, setFiltroTipo] = useState('TODOS')
  
  // Criar novo serviço
  const [criandoNovo, setCriandoNovo] = useState(false)
  const [novoNome, setNovoNome] = useState('')
  const [novoTipo, setNovoTipo] = useState('GERAL')
  const [novoValor, setNovoValor] = useState('')

  // Editar serviço
  const [editingId, setEditingId] = useState<string | null>(null)
  const [editNome, setEditNome] = useState('')
  const [editTipo, setEditTipo] = useState('GERAL')
  const [editValor, setEditValor] = useState('')

  useEffect(() => {
    if (initialEmpresa?.id) {
      carregarServicos()
    }
  }, [initialEmpresa?.id])

  const carregarServicos = async () => {
    if (!initialEmpresa?.id) return
    
    setLoading(true)
    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/v1/servicos/empresa/${initialEmpresa.id}`)
      if (res.ok) {
        const data = await res.json()
        setServicos(data)
      }
    } catch (error) {
      console.error('Erro ao carregar serviços:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleCriar = async () => {
    if (!novoNome.trim() || !initialEmpresa?.id) return
    
    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/v1/servicos`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          nome: novoNome,
          tipo: novoTipo,
          valor: novoValor ? parseFloat(novoValor) : null,
          empresaId: initialEmpresa.id,
        }),
      })

      if (res.ok) {
        toast({ title: 'Serviço criado com sucesso!' })
        carregarServicos()
        setCriandoNovo(false)
        setNovoNome('')
        setNovoTipo('GERAL')
        setNovoValor('')
      } else {
        toast({ title: 'Erro ao criar serviço', variant: 'destructive' })
      }
    } catch (error) {
      console.error('Erro ao criar serviço:', error)
      toast({ title: 'Erro ao criar serviço', variant: 'destructive' })
    }
  }

  const handleEditar = (servico: Servico) => {
    setEditingId(servico.id)
    setEditNome(servico.nome)
    setEditTipo(servico.tipo)
    setEditValor(servico.valor?.toString() || '')
  }

  const handleSalvarEdicao = async (id: string) => {
    if (!editNome.trim()) return

    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/v1/servicos/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          nome: editNome,
          tipo: editTipo,
          valor: editValor ? parseFloat(editValor) : null,
        }),
      })

      if (res.ok) {
        toast({ title: 'Serviço atualizado com sucesso!' })
        carregarServicos()
        setEditingId(null)
      } else {
        toast({ title: 'Erro ao atualizar serviço', variant: 'destructive' })
      }
    } catch (error) {
      console.error('Erro ao atualizar serviço:', error)
      toast({ title: 'Erro ao atualizar serviço', variant: 'destructive' })
    }
  }

  const handleDeletar = async (id: string) => {
    if (!confirm('Tem certeza que deseja excluir este serviço?')) return

    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/v1/servicos/${id}`, {
        method: 'DELETE',
      })

      if (res.ok) {
        toast({ title: 'Serviço excluído com sucesso!' })
        carregarServicos()
      } else {
        toast({ title: 'Erro ao excluir serviço', variant: 'destructive' })
      }
    } catch (error) {
      console.error('Erro ao excluir serviço:', error)
      toast({ title: 'Erro ao excluir serviço', variant: 'destructive' })
    }
  }

  const servicosFiltrados = servicos.filter(s => {
    const matchBusca = s.nome.toLowerCase().includes(busca.toLowerCase())
    const matchTipo = filtroTipo === 'TODOS' || s.tipo === filtroTipo
    return matchBusca && matchTipo
  })

  return (
    <div className="space-y-6">
      <div className="flex items-start justify-between">
        <div>
          <h2 className="text-base font-bold text-[#F5F0FF]">Serviços da Clínica</h2>
          <p className="text-xs text-[#A78BCC] mt-1">
            Edite os serviços prestados pela sua consultório ou clínica. Eles estarão disponíveis para especificar os agendamentos realizados.
          </p>
        </div>
        
        <button
          onClick={() => setCriandoNovo(true)}
          className="flex items-center gap-2 px-4 py-2 rounded-lg bg-[#7C4DFF] hover:bg-[#5B21B6] text-white text-sm font-semibold transition-colors"
        >
          <Plus size={16} />
          Adicionar Novo Serviço
        </button>
      </div>

      {/* Filtros */}
      <div className="flex items-center gap-3">
        <div className="relative flex-1">
          <Search size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-[#6B4E8A]" />
          <input
            type="text"
            value={busca}
            onChange={(e) => setBusca(e.target.value)}
            placeholder="Pesquisar Serviço..."
            className="w-full pl-10 pr-4 py-2 rounded-lg border border-[rgba(124,77,255,0.25)] bg-[#120328] text-[#F5F0FF] text-sm placeholder:text-[#6B4E8A] focus:outline-none focus:border-[#7C4DFF]"
          />
        </div>

        <select
          value={filtroTipo}
          onChange={(e) => setFiltroTipo(e.target.value)}
          className="px-4 py-2 rounded-lg border border-[rgba(124,77,255,0.25)] bg-[#120328] text-[#F5F0FF] text-sm focus:outline-none focus:border-[#7C4DFF]"
        >
          <option value="TODOS">Todos</option>
          <option value="GERAL">Geral</option>
          <option value="PARTICULAR">Particular</option>
          <option value="AMIL_SAUDE">Amil Saúde</option>
          <option value="MAE_SAUDE">Mãe Saúde</option>
          <option value="APAS">APAS</option>
        </select>
      </div>

      {loading ? (
        <div className="p-8 text-center text-[#A78BCC]">Carregando...</div>
      ) : (
        <div className="space-y-4">
          <p className="text-xs text-[#A78BCC]">
            Exibindo {servicosFiltrados.length} de {servicos.length} serviços
          </p>

          <div className="space-y-3">
            {/* Formulário criar novo */}
            {criandoNovo && (
              <div className="p-4 rounded-xl border border-[rgba(124,77,255,0.25)] bg-[#120328]">
                <h4 className="text-sm font-semibold text-[#F5F0FF] mb-3">ATENDIMENTO</h4>
                
                <div className="grid grid-cols-3 gap-3 mb-3">
                  <input
                    type="text"
                    value={novoNome}
                    onChange={(e) => setNovoNome(e.target.value)}
                    placeholder="Nome do serviço"
                    className="px-3 py-2 rounded-lg border border-[rgba(124,77,255,0.25)] bg-[#0D0520] text-[#F5F0FF] text-sm placeholder:text-[#6B4E8A] focus:outline-none focus:border-[#7C4DFF]"
                  />
                  
                  <select
                    value={novoTipo}
                    onChange={(e) => setNovoTipo(e.target.value)}
                    className="px-3 py-2 rounded-lg border border-[rgba(124,77,255,0.25)] bg-[#0D0520] text-[#F5F0FF] text-sm focus:outline-none focus:border-[#7C4DFF]"
                  >
                    <option value="GERAL">Geral</option>
                    <option value="PARTICULAR">Particular</option>
                    <option value="AMIL_SAUDE">Amil Saúde</option>
                    <option value="MAE_SAUDE">Mãe Saúde</option>
                    <option value="APAS">APAS</option>
                  </select>

                  <input
                    type="number"
                    value={novoValor}
                    onChange={(e) => setNovoValor(e.target.value)}
                    placeholder="R$ 0,00"
                    step="0.01"
                    className="px-3 py-2 rounded-lg border border-[rgba(124,77,255,0.25)] bg-[#0D0520] text-[#F5F0FF] text-sm placeholder:text-[#6B4E8A] focus:outline-none focus:border-[#7C4DFF]"
                  />
                </div>
                
                <div className="flex items-center gap-2">
                  <button
                    onClick={handleCriar}
                    className="px-4 py-2 rounded-lg bg-[#7C4DFF] hover:bg-[#5B21B6] text-white text-sm font-semibold transition-colors"
                  >
                    Salvar
                  </button>
                  <button
                    onClick={() => {
                      setCriandoNovo(false)
                      setNovoNome('')
                      setNovoTipo('GERAL')
                      setNovoValor('')
                    }}
                    className="px-4 py-2 rounded-lg border border-[rgba(124,77,255,0.25)] text-[#A78BCC] text-sm font-semibold transition-colors"
                  >
                    Cancelar
                  </button>
                </div>
              </div>
            )}

            {/* Lista de serviços */}
            {servicosFiltrados.map(servico => (
              <div
                key={servico.id}
                className="p-4 rounded-xl border border-[rgba(124,77,255,0.18)] bg-[#120328] hover:border-[rgba(124,77,255,0.35)] transition-colors"
              >
                {editingId === servico.id ? (
                  <div className="space-y-3">
                    <div className="grid grid-cols-3 gap-3">
                      <input
                        type="text"
                        value={editNome}
                        onChange={(e) => setEditNome(e.target.value)}
                        className="px-3 py-2 rounded-lg border border-[rgba(124,77,255,0.25)] bg-[#0D0520] text-[#F5F0FF] text-sm focus:outline-none focus:border-[#7C4DFF]"
                      />
                      
                      <select
                        value={editTipo}
                        onChange={(e) => setEditTipo(e.target.value)}
                        className="px-3 py-2 rounded-lg border border-[rgba(124,77,255,0.25)] bg-[#0D0520] text-[#F5F0FF] text-sm focus:outline-none focus:border-[#7C4DFF]"
                      >
                        <option value="GERAL">Geral</option>
                        <option value="PARTICULAR">Particular</option>
                        <option value="AMIL_SAUDE">Amil Saúde</option>
                        <option value="MAE_SAUDE">Mãe Saúde</option>
                        <option value="APAS">APAS</option>
                      </select>

                      <input
                        type="number"
                        value={editValor}
                        onChange={(e) => setEditValor(e.target.value)}
                        step="0.01"
                        className="px-3 py-2 rounded-lg border border-[rgba(124,77,255,0.25)] bg-[#0D0520] text-[#F5F0FF] text-sm focus:outline-none focus:border-[#7C4DFF]"
                      />
                    </div>
                    
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => handleSalvarEdicao(servico.id)}
                        className="px-4 py-2 rounded-lg bg-[#7C4DFF] hover:bg-[#5B21B6] text-white text-sm font-semibold"
                      >
                        Salvar
                      </button>
                      <button
                        onClick={() => setEditingId(null)}
                        className="px-4 py-2 rounded-lg border border-[rgba(124,77,255,0.25)] text-[#A78BCC] text-sm font-semibold"
                      >
                        Cancelar
                      </button>
                    </div>
                  </div>
                ) : (
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4 flex-1">
                      <Briefcase size={20} className="text-[#7C4DFF]" />
                      
                      <div className="flex-1">
                        <h4 className="text-sm font-semibold text-[#F5F0FF]">{servico.nome}</h4>
                      </div>

                      <span className="text-xs px-3 py-1 rounded-full bg-[rgba(124,77,255,0.15)] text-[#A78BCC]">
                        {servico.tipo === 'GERAL' ? 'Geral' : 
                         servico.tipo === 'PARTICULAR' ? 'Particular' :
                         servico.tipo === 'AMIL_SAUDE' ? 'Amil Saúde' :
                         servico.tipo === 'MAE_SAUDE' ? 'Mãe Saúde' :
                         servico.tipo === 'APAS' ? 'APAS' : servico.tipo}
                      </span>

                      <span className="text-sm font-bold text-[#F5F0FF] min-w-[100px] text-right">
                        {servico.valor ? `R$ ${servico.valor.toFixed(2)}` : '-'}
                      </span>
                    </div>

                    <div className="flex items-center gap-2 ml-4">
                      <button
                        onClick={() => handleEditar(servico)}
                        className="p-2 rounded-lg hover:bg-[rgba(124,77,255,0.15)] text-[#A78BCC] hover:text-[#7C4DFF] transition-colors"
                        title="Editar"
                      >
                        <Pencil size={16} />
                      </button>
                      
                      <button
                        onClick={() => handleDeletar(servico.id)}
                        className="p-2 rounded-lg hover:bg-[rgba(239,68,68,0.15)] text-[#A78BCC] hover:text-[#EF4444] transition-colors"
                        title="Excluir"
                      >
                        <Trash2 size={16} />
                      </button>
                    </div>
                  </div>
                )}
              </div>
            ))}

            {servicosFiltrados.length === 0 && !criandoNovo && (
              <div className="p-12 text-center rounded-xl border border-dashed border-[rgba(124,77,255,0.25)] bg-[#0D0520]">
                <Briefcase size={48} className="mx-auto mb-4 text-[#6B4E8A]" />
                <p className="text-sm text-[#A78BCC]">
                  {busca || filtroTipo !== 'TODOS' ? 'Nenhum serviço encontrado' : 'Nenhum serviço cadastrado'}
                </p>
                <p className="text-xs text-[#6B4E8A] mt-1">
                  {busca || filtroTipo !== 'TODOS' ? 'Tente ajustar os filtros' : 'Clique em "Adicionar Novo Serviço" para começar'}
                </p>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  )
}
