'use client'

import { useState, useEffect } from 'react'
import { Search, Plus, Pencil, Trash2, User, Phone, Calendar, ChevronDown } from 'lucide-react'
import { useToast } from '@/hooks/use-toast'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'

interface Paciente {
  id: string
  nome: string
  dataNascimento: string
  telefone: string
  genero: string
  plano: string
  numeroCarteirinha: string
  grupo: string
  comoConheceu: string
  rg: string
  cpf: string
  cep: string
  email: string
  logradouro: string
  numero: string
  complemento: string
  bairro: string
  cidade: string
  outrasInformacoes: string
  nomeResponsavel: string
  dataNascimentoResp: string
  cpfResponsavel: string
  telefoneResponsavel: string
  statusPagamento: string
  sessoes: number
}

export default function PacientesPage() {
  const { toast } = useToast()
  const [pacientes, setPacientes] = useState<Paciente[]>([])
  const [loading, setLoading] = useState(true)
  const [busca, setBusca] = useState('')
  const [filtroStatus, setFiltroStatus] = useState('TODOS')
  const [dialogOpen, setDialogOpen] = useState(false)
  const [editando, setEditando] = useState<Paciente | null>(null)
  
  // Seções expansíveis
  const [infoExpanded, setInfoExpanded] = useState(true)
  const [menorExpanded, setMenorExpanded] = useState(false)

  // Form states
  const [nome, setNome] = useState('')
  const [dataNascimento, setDataNascimento] = useState('')
  const [telefone, setTelefone] = useState('')
  const [genero, setGenero] = useState('')
  const [plano, setPlano] = useState('')
  const [numeroCarteirinha, setNumeroCarteirinha] = useState('')
  const [grupo, setGrupo] = useState('')
  const [comoConheceu, setComoConheceu] = useState('')
  const [rg, setRg] = useState('')
  const [cpf, setCpf] = useState('')
  const [cep, setCep] = useState('')
  const [email, setEmail] = useState('')
  const [logradouro, setLogradouro] = useState('')
  const [numero, setNumero] = useState('')
  const [complemento, setComplemento] = useState('')
  const [bairro, setBairro] = useState('')
  const [cidade, setCidade] = useState('')
  const [outrasInformacoes, setOutrasInformacoes] = useState('')
  const [nomeResponsavel, setNomeResponsavel] = useState('')
  const [dataNascimentoResp, setDataNascimentoResp] = useState('')
  const [cpfResponsavel, setCpfResponsavel] = useState('')
  const [telefoneResponsavel, setTelefoneResponsavel] = useState('')

  const empresaId = 'f47ac10b-58cc-4372-a567-0e02b2c3d479' // TODO: pegar do contexto

  useEffect(() => {
    carregarPacientes()
  }, [])

  const carregarPacientes = async () => {
    setLoading(true)
    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/v1/pacientes/empresa/${empresaId}`)
      if (res.ok) {
        const data = await res.json()
        setPacientes(data)
      }
    } catch (error) {
      console.error('Erro ao carregar pacientes:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleBuscar = async () => {
    if (!busca.trim()) {
      carregarPacientes()
      return
    }
    
    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/v1/pacientes/empresa/${empresaId}/buscar?q=${busca}`)
      if (res.ok) {
        const data = await res.json()
        setPacientes(data)
      }
    } catch (error) {
      console.error('Erro ao buscar:', error)
    }
  }

  const handleCriar = async () => {
    if (!nome.trim()) {
      toast({ title: 'Nome é obrigatório', variant: 'destructive' })
      return
    }

    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/v1/pacientes`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          empresaId,
          nome,
          dataNascimento: dataNascimento || null,
          telefone,
          genero,
          plano,
          numeroCarteirinha,
          grupo,
          comoConheceu,
          rg,
          cpf,
          cep,
          email,
          logradouro,
          numero,
          complemento,
          bairro,
          cidade,
          outrasInformacoes,
          nomeResponsavel,
          dataNascimentoResp: dataNascimentoResp || null,
          cpfResponsavel,
          telefoneResponsavel,
        }),
      })

      if (res.ok) {
        toast({ title: 'Paciente criado com sucesso!' })
        setDialogOpen(false)
        limparForm()
        carregarPacientes()
      }
    } catch (error) {
      toast({ title: 'Erro ao criar paciente', variant: 'destructive' })
    }
  }

  const handleEditar = (paciente: Paciente) => {
    setEditando(paciente)
    setNome(paciente.nome)
    setDataNascimento(paciente.dataNascimento || '')
    setTelefone(paciente.telefone || '')
    setGenero(paciente.genero || '')
    setPlano(paciente.plano || '')
    setNumeroCarteirinha(paciente.numeroCarteirinha || '')
    setGrupo(paciente.grupo || '')
    setComoConheceu(paciente.comoConheceu || '')
    setRg(paciente.rg || '')
    setCpf(paciente.cpf || '')
    setCep(paciente.cep || '')
    setEmail(paciente.email || '')
    setLogradouro(paciente.logradouro || '')
    setNumero(paciente.numero || '')
    setComplemento(paciente.complemento || '')
    setBairro(paciente.bairro || '')
    setCidade(paciente.cidade || '')
    setOutrasInformacoes(paciente.outrasInformacoes || '')
    setNomeResponsavel(paciente.nomeResponsavel || '')
    setDataNascimentoResp(paciente.dataNascimentoResp || '')
    setCpfResponsavel(paciente.cpfResponsavel || '')
    setTelefoneResponsavel(paciente.telefoneResponsavel || '')
    setDialogOpen(true)
  }

  const handleAtualizar = async () => {
    if (!editando) return

    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/v1/pacientes/${editando.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          nome,
          dataNascimento: dataNascimento || null,
          telefone,
          genero,
          plano,
          numeroCarteirinha,
          grupo,
          comoConheceu,
          rg,
          cpf,
          cep,
          email,
          logradouro,
          numero,
          complemento,
          bairro,
          cidade,
          outrasInformacoes,
          nomeResponsavel,
          dataNascimentoResp: dataNascimentoResp || null,
          cpfResponsavel,
          telefoneResponsavel,
        }),
      })

      if (res.ok) {
        toast({ title: 'Paciente atualizado com sucesso!' })
        setDialogOpen(false)
        limparForm()
        carregarPacientes()
      }
    } catch (error) {
      toast({ title: 'Erro ao atualizar paciente', variant: 'destructive' })
    }
  }

  const handleDeletar = async (id: string) => {
    if (!confirm('Tem certeza que deseja excluir este paciente?')) return

    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/v1/pacientes/${id}`, {
        method: 'DELETE',
      })

      if (res.ok) {
        toast({ title: 'Paciente excluído com sucesso!' })
        carregarPacientes()
      }
    } catch (error) {
      toast({ title: 'Erro ao excluir paciente', variant: 'destructive' })
    }
  }

  const limparForm = () => {
    setEditando(null)
    setNome('')
    setDataNascimento('')
    setTelefone('')
    setGenero('')
    setPlano('')
    setNumeroCarteirinha('')
    setGrupo('')
    setComoConheceu('')
    setRg('')
    setCpf('')
    setCep('')
    setEmail('')
    setLogradouro('')
    setNumero('')
    setComplemento('')
    setBairro('')
    setCidade('')
    setOutrasInformacoes('')
    setNomeResponsavel('')
    setDataNascimentoResp('')
    setCpfResponsavel('')
    setTelefoneResponsavel('')
  }

  const pacientesFiltrados = pacientes.filter(p => {
    if (filtroStatus === 'TODOS') return true
    return p.statusPagamento === filtroStatus
  })

  return (
    <div className="min-h-screen bg-[var(--d2b-bg-main)] p-6">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-[var(--d2b-text-primary)]">Pacientes da Clínica</h1>
            <p className="text-sm text-[var(--d2b-text-secondary)] mt-1">Crie e gerencie pacientes atendidos pela clínica.</p>
          </div>
          <button
            onClick={() => {
              limparForm()
              setDialogOpen(true)
            }}
            className="flex items-center gap-2 px-4 py-2 rounded-lg bg-[#7C4DFF] hover:bg-[#5B21B6] text-white text-sm font-semibold transition-colors"
          >
            <Plus size={16} />
            Novo paciente
          </button>
        </div>

        {/* Filtros */}
        <div className="flex items-center gap-3">
          <div className="relative flex-1">
            <Search size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-[var(--d2b-text-muted)]" />
            <input
              type="text"
              value={busca}
              onChange={(e) => setBusca(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && handleBuscar()}
              placeholder="Pesquisar..."
              className="w-full pl-10 pr-4 py-2 rounded-lg border border-[var(--d2b-border-strong)] bg-[var(--d2b-bg-surface)] text-[var(--d2b-text-primary)] text-sm placeholder:text-[var(--d2b-text-muted)] focus:outline-none focus:border-[#7C4DFF]"
            />
          </div>

          <select
            value={filtroStatus}
            onChange={(e) => setFiltroStatus(e.target.value)}
            className="px-4 py-2 rounded-lg border border-[var(--d2b-border-strong)] bg-[var(--d2b-bg-surface)] text-[var(--d2b-text-primary)] text-sm focus:outline-none focus:border-[#7C4DFF]"
          >
            <option value="TODOS">Todos profissionais</option>
            <option value="EM_ABERTO">Em Aberto</option>
            <option value="QUITADO">Quitado</option>
          </select>

          <button className="px-4 py-2 rounded-lg border border-[var(--d2b-border-strong)] text-[var(--d2b-text-secondary)] text-sm">
            Mostrar arquivados
          </button>
        </div>

        {/* Lista */}
        {loading ? (
          <div className="p-12 text-center text-[var(--d2b-text-secondary)]">Carregando...</div>
        ) : (
          <div className="space-y-3">
            {pacientesFiltrados.map(paciente => (
              <div
                key={paciente.id}
                className="flex items-center justify-between p-4 rounded-xl border border-[var(--d2b-border)] bg-[var(--d2b-bg-surface)] hover:border-[var(--d2b-border-strong)] transition-colors"
              >
                <div className="flex items-center gap-4 flex-1">
                  <div className="w-10 h-10 rounded-full bg-[var(--d2b-hover)] flex items-center justify-center">
                    <User size={20} className="text-[#7C4DFF]" />
                  </div>

                  <div className="flex-1">
                    <h3 className="text-sm font-semibold text-[var(--d2b-text-primary)]">{paciente.nome}</h3>
                    <div className="flex items-center gap-4 mt-1">
                      {paciente.telefone && (
                        <span className="text-xs text-[var(--d2b-text-secondary)] flex items-center gap-1">
                          <Phone size={12} />
                          {paciente.telefone}
                        </span>
                      )}
                      {paciente.dataNascimento && (
                        <span className="text-xs text-[var(--d2b-text-secondary)] flex items-center gap-1">
                          <Calendar size={12} />
                          {new Date(paciente.dataNascimento).toLocaleDateString('pt-BR')}
                        </span>
                      )}
                    </div>
                  </div>

                  <div className="text-center">
                    <p className="text-xs text-[var(--d2b-text-secondary)]">SESSÕES</p>
                    <p className="text-sm font-bold text-[var(--d2b-text-primary)]">{paciente.sessoes || 0}</p>
                  </div>

                  <div className="text-center min-w-[100px]">
                    <p className="text-xs text-[var(--d2b-text-secondary)]">STATUS DO PAGAMENTO</p>
                    <span className={`text-xs px-2 py-1 rounded ${
                      paciente.statusPagamento === 'QUITADO' 
                        ? 'bg-[rgba(34,197,94,0.15)] text-[#22C55E]' 
                        : 'bg-[rgba(239,68,68,0.15)] text-[#EF4444]'
                    }`}>
                      {paciente.statusPagamento === 'QUITADO' ? 'Quitado' : 'Em Aberto'}
                    </span>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    onClick={() => handleEditar(paciente)}
                    className="p-2 rounded-lg hover:bg-[var(--d2b-hover)] text-[var(--d2b-text-secondary)] hover:text-[#7C4DFF] transition-colors"
                  >
                    <Pencil size={16} />
                  </button>
                  <button
                    onClick={() => handleDeletar(paciente.id)}
                    className="p-2 rounded-lg hover:bg-[rgba(239,68,68,0.15)] text-[var(--d2b-text-secondary)] hover:text-[#EF4444] transition-colors"
                  >
                    <Trash2 size={16} />
                  </button>
                </div>
              </div>
            ))}

            {pacientesFiltrados.length === 0 && (
              <div className="p-12 text-center rounded-xl border border-dashed border-[var(--d2b-border-strong)] bg-[var(--d2b-bg-surface)]">
                <User size={48} className="mx-auto mb-4 text-[var(--d2b-text-muted)]" />
                <p className="text-sm text-[var(--d2b-text-secondary)]">Nenhum paciente encontrado</p>
              </div>
            )}
          </div>
        )}

        {/* Dialog */}
        <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
          <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto bg-[var(--d2b-bg-main)] border border-[var(--d2b-border-strong)]">
            <DialogHeader>
              <DialogTitle className="text-lg font-bold text-[var(--d2b-text-primary)]">
                {editando ? 'Editar Cliente' : 'Criar Cliente'}
              </DialogTitle>
            </DialogHeader>

            <div className="space-y-4 pt-2">
              {/* Dados Básicos */}
              <div className="grid grid-cols-2 gap-3">
                <input
                  type="text"
                  value={nome}
                  onChange={(e) => setNome(e.target.value)}
                  placeholder="Nome*"
                  className="col-span-2 px-3 py-2 rounded-lg border border-[var(--d2b-border-strong)] bg-[var(--d2b-bg-surface)] text-[var(--d2b-text-primary)] text-sm placeholder:text-[var(--d2b-text-muted)] focus:outline-none focus:border-[#7C4DFF]"
                />

                <input
                  type="date"
                  value={dataNascimento}
                  onChange={(e) => setDataNascimento(e.target.value)}
                  className="px-3 py-2 rounded-lg border border-[var(--d2b-border-strong)] bg-[var(--d2b-bg-surface)] text-[var(--d2b-text-primary)] text-sm focus:outline-none focus:border-[#7C4DFF]"
                />

                <input
                  type="text"
                  value={telefone}
                  onChange={(e) => setTelefone(e.target.value)}
                  placeholder="Telefone"
                  className="px-3 py-2 rounded-lg border border-[var(--d2b-border-strong)] bg-[var(--d2b-bg-surface)] text-[var(--d2b-text-primary)] text-sm placeholder:text-[var(--d2b-text-muted)] focus:outline-none focus:border-[#7C4DFF]"
                />

                <select
                  value={genero}
                  onChange={(e) => setGenero(e.target.value)}
                  className="px-3 py-2 rounded-lg border border-[var(--d2b-border-strong)] bg-[var(--d2b-bg-surface)] text-[var(--d2b-text-primary)] text-sm focus:outline-none focus:border-[#7C4DFF]"
                >
                  <option value="">Selecione um gênero</option>
                  <option value="MASCULINO">Masculino</option>
                  <option value="FEMININO">Feminino</option>
                  <option value="OUTRO">Outro</option>
                </select>

                <select
                  value={plano}
                  onChange={(e) => setPlano(e.target.value)}
                  className="px-3 py-2 rounded-lg border border-[var(--d2b-border-strong)] bg-[var(--d2b-bg-surface)] text-[var(--d2b-text-primary)] text-sm focus:outline-none focus:border-[#7C4DFF]"
                >
                  <option value="">Selecione um plano</option>
                  <option value="PARTICULAR">Particular</option>
                  <option value="CONVENIO">Convênio</option>
                </select>

                <input
                  type="text"
                  value={numeroCarteirinha}
                  onChange={(e) => setNumeroCarteirinha(e.target.value)}
                  placeholder="Número da Carteirinha"
                  className="px-3 py-2 rounded-lg border border-[var(--d2b-border-strong)] bg-[var(--d2b-bg-surface)] text-[var(--d2b-text-primary)] text-sm placeholder:text-[var(--d2b-text-muted)] focus:outline-none focus:border-[#7C4DFF]"
                />

                <select
                  value={grupo}
                  onChange={(e) => setGrupo(e.target.value)}
                  className="px-3 py-2 rounded-lg border border-[var(--d2b-border-strong)] bg-[var(--d2b-bg-surface)] text-[var(--d2b-text-primary)] text-sm focus:outline-none focus:border-[#7C4DFF]"
                >
                  <option value="">Selecione um grupo</option>
                  <option value="GRUPO_A">Grupo A</option>
                  <option value="GRUPO_B">Grupo B</option>
                </select>

                <select
                  value={comoConheceu}
                  onChange={(e) => setComoConheceu(e.target.value)}
                  className="col-span-2 px-3 py-2 rounded-lg border border-[var(--d2b-border-strong)] bg-[var(--d2b-bg-surface)] text-[var(--d2b-text-primary)] text-sm focus:outline-none focus:border-[#7C4DFF]"
                >
                  <option value="">Como conheceu?</option>
                  <option value="INDICACAO">Indicação</option>
                  <option value="REDES_SOCIAIS">Redes Sociais</option>
                  <option value="GOOGLE">Google</option>
                  <option value="OUTROS">Outros</option>
                </select>
              </div>

              {/* Informações Pessoais */}
              <button
                onClick={() => setInfoExpanded(!infoExpanded)}
                className="w-full flex items-center justify-between p-3 rounded-lg border border-[var(--d2b-border-strong)] bg-[var(--d2b-bg-surface)] text-[#7C4DFF] text-sm font-semibold hover:bg-[var(--d2b-hover)] transition-colors"
              >
                Informações Pessoais
                <ChevronDown size={16} className={`transition-transform ${infoExpanded ? 'rotate-180' : ''}`} />
              </button>

              {infoExpanded && (
                <div className="grid grid-cols-2 gap-3">
                  <input
                    type="text"
                    value={rg}
                    onChange={(e) => setRg(e.target.value)}
                    placeholder="RG"
                    className="px-3 py-2 rounded-lg border border-[var(--d2b-border-strong)] bg-[var(--d2b-bg-surface)] text-[var(--d2b-text-primary)] text-sm placeholder:text-[var(--d2b-text-muted)] focus:outline-none focus:border-[#7C4DFF]"
                  />

                  <input
                    type="text"
                    value={cpf}
                    onChange={(e) => setCpf(e.target.value)}
                    placeholder="CPF"
                    className="px-3 py-2 rounded-lg border border-[var(--d2b-border-strong)] bg-[var(--d2b-bg-surface)] text-[var(--d2b-text-primary)] text-sm placeholder:text-[var(--d2b-text-muted)] focus:outline-none focus:border-[#7C4DFF]"
                  />

                  <input
                    type="text"
                    value={cep}
                    onChange={(e) => setCep(e.target.value)}
                    placeholder="CEP"
                    className="px-3 py-2 rounded-lg border border-[var(--d2b-border-strong)] bg-[var(--d2b-bg-surface)] text-[var(--d2b-text-primary)] text-sm placeholder:text-[var(--d2b-text-muted)] focus:outline-none focus:border-[#7C4DFF]"
                  />

                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="Email"
                    className="px-3 py-2 rounded-lg border border-[var(--d2b-border-strong)] bg-[var(--d2b-bg-surface)] text-[var(--d2b-text-primary)] text-sm placeholder:text-[var(--d2b-text-muted)] focus:outline-none focus:border-[#7C4DFF]"
                  />

                  <input
                    type="text"
                    value={logradouro}
                    onChange={(e) => setLogradouro(e.target.value)}
                    placeholder="Logradouro"
                    className="col-span-2 px-3 py-2 rounded-lg border border-[var(--d2b-border-strong)] bg-[var(--d2b-bg-surface)] text-[var(--d2b-text-primary)] text-sm placeholder:text-[var(--d2b-text-muted)] focus:outline-none focus:border-[#7C4DFF]"
                  />

                  <input
                    type="text"
                    value={numero}
                    onChange={(e) => setNumero(e.target.value)}
                    placeholder="Número"
                    className="px-3 py-2 rounded-lg border border-[var(--d2b-border-strong)] bg-[var(--d2b-bg-surface)] text-[var(--d2b-text-primary)] text-sm placeholder:text-[var(--d2b-text-muted)] focus:outline-none focus:border-[#7C4DFF]"
                  />

                  <input
                    type="text"
                    value={complemento}
                    onChange={(e) => setComplemento(e.target.value)}
                    placeholder="Complemento"
                    className="px-3 py-2 rounded-lg border border-[var(--d2b-border-strong)] bg-[var(--d2b-bg-surface)] text-[var(--d2b-text-primary)] text-sm placeholder:text-[var(--d2b-text-muted)] focus:outline-none focus:border-[#7C4DFF]"
                  />

                  <input
                    type="text"
                    value={bairro}
                    onChange={(e) => setBairro(e.target.value)}
                    placeholder="Bairro"
                    className="px-3 py-2 rounded-lg border border-[var(--d2b-border-strong)] bg-[var(--d2b-bg-surface)] text-[var(--d2b-text-primary)] text-sm placeholder:text-[var(--d2b-text-muted)] focus:outline-none focus:border-[#7C4DFF]"
                  />

                  <input
                    type="text"
                    value={cidade}
                    onChange={(e) => setCidade(e.target.value)}
                    placeholder="Cidade"
                    className="px-3 py-2 rounded-lg border border-[var(--d2b-border-strong)] bg-[var(--d2b-bg-surface)] text-[var(--d2b-text-primary)] text-sm placeholder:text-[var(--d2b-text-muted)] focus:outline-none focus:border-[#7C4DFF]"
                  />

                  <textarea
                    value={outrasInformacoes}
                    onChange={(e) => setOutrasInformacoes(e.target.value)}
                    placeholder="Outras informações"
                    rows={3}
                    className="col-span-2 px-3 py-2 rounded-lg border border-[var(--d2b-border-strong)] bg-[var(--d2b-bg-surface)] text-[var(--d2b-text-primary)] text-sm placeholder:text-[var(--d2b-text-muted)] focus:outline-none focus:border-[#7C4DFF] resize-none"
                  />
                </div>
              )}

              {/* Menor de Idade */}
              <button
                onClick={() => setMenorExpanded(!menorExpanded)}
                className="w-full flex items-center justify-between p-3 rounded-lg border border-[var(--d2b-border-strong)] bg-[var(--d2b-bg-surface)] text-[#7C4DFF] text-sm font-semibold hover:bg-[var(--d2b-hover)] transition-colors"
              >
                Menor de idade
                <ChevronDown size={16} className={`transition-transform ${menorExpanded ? 'rotate-180' : ''}`} />
              </button>

              {menorExpanded && (
                <div className="grid grid-cols-2 gap-3">
                  <input
                    type="text"
                    value={nomeResponsavel}
                    onChange={(e) => setNomeResponsavel(e.target.value)}
                    placeholder="Nome do responsável"
                    className="col-span-2 px-3 py-2 rounded-lg border border-[var(--d2b-border-strong)] bg-[var(--d2b-bg-surface)] text-[var(--d2b-text-primary)] text-sm placeholder:text-[var(--d2b-text-muted)] focus:outline-none focus:border-[#7C4DFF]"
                  />

                  <input
                    type="date"
                    value={dataNascimentoResp}
                    onChange={(e) => setDataNascimentoResp(e.target.value)}
                    placeholder="Data de nascimento"
                    className="px-3 py-2 rounded-lg border border-[var(--d2b-border-strong)] bg-[var(--d2b-bg-surface)] text-[var(--d2b-text-primary)] text-sm focus:outline-none focus:border-[#7C4DFF]"
                  />

                  <input
                    type="text"
                    value={cpfResponsavel}
                    onChange={(e) => setCpfResponsavel(e.target.value)}
                    placeholder="CPF do responsável"
                    className="px-3 py-2 rounded-lg border border-[var(--d2b-border-strong)] bg-[var(--d2b-bg-surface)] text-[var(--d2b-text-primary)] text-sm placeholder:text-[var(--d2b-text-muted)] focus:outline-none focus:border-[#7C4DFF]"
                  />

                  <input
                    type="text"
                    value={telefoneResponsavel}
                    onChange={(e) => setTelefoneResponsavel(e.target.value)}
                    placeholder="Telefone do responsável"
                    className="col-span-2 px-3 py-2 rounded-lg border border-[var(--d2b-border-strong)] bg-[var(--d2b-bg-surface)] text-[var(--d2b-text-primary)] text-sm placeholder:text-[var(--d2b-text-muted)] focus:outline-none focus:border-[#7C4DFF]"
                  />
                </div>
              )}

              {/* Botões */}
              <div className="flex items-center justify-end gap-3 pt-4">
                <button
                  onClick={() => {
                    setDialogOpen(false)
                    limparForm()
                  }}
                  className="px-4 py-2 rounded-lg border border-[var(--d2b-border-strong)] text-[var(--d2b-text-secondary)] text-sm font-semibold"
                >
                  Cancelar
                </button>
                <button
                  onClick={editando ? handleAtualizar : handleCriar}
                  className="px-6 py-2 rounded-lg bg-[#7C4DFF] hover:bg-[#5B21B6] text-white text-sm font-semibold"
                >
                  {editando ? 'Atualizar' : 'Cadastrar'}
                </button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      </div>
    </div>
  )
}
