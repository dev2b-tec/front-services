'use client'

import { useState, useEffect } from 'react'
import { Plus, Pencil, Trash2, Search, Briefcase, Settings, X, HelpCircle, ChevronDown } from 'lucide-react'
import { useToast } from '@/hooks/use-toast'
import { FInput } from './shared'
import type { EmpresaData } from '@/app/dashboard/configuracoes/page'

interface TabServicosProps {
  initialEmpresa?: EmpresaData | null
}

interface Servico {
  id: string
  nome: string
  tipo: string
  categoria?: string
  descricao?: string
  tipoComissao?: string
  duracaoMinutos?: number
  valor?: number
  valorCusto?: number
  valorNaoComissionavel?: number
  ativo: boolean
  empresaId: string
}

const TIPO_OPTS = ['GERAL', 'PARTICULAR', 'AMIL_SAUDE', 'MAE_SAUDE', 'APAS']
const TIPO_LABEL: Record<string, string> = {
  GERAL: 'Geral',
  PARTICULAR: 'Particular',
  AMIL_SAUDE: 'Amil Saúde',
  MAE_SAUDE: 'Mãe Saúde',
  APAS: 'APAS',
}

const TIPO_COMISSAO_OPTS = [
  { value: 'NAO_GERAR', label: 'Não gerar comissão' },
  { value: 'PERCENTUAL', label: 'Percentual' },
  { value: 'VALOR_FIXO', label: 'Valor fixo' },
]

const DURACAO_OPTS = [
  { value: 15, label: '15 minutos' },
  { value: 20, label: '20 minutos' },
  { value: 25, label: '25 minutos' },
  { value: 30, label: '30 minutos' },
  { value: 40, label: '40 minutos' },
  { value: 45, label: '45 minutos' },
  { value: 50, label: '50 minutos' },
  { value: 60, label: '1 hora' },
  { value: 90, label: '1h 30min' },
  { value: 120, label: '2 horas' },
]

const fieldCls =
  'w-full bg-[var(--d2b-bg-main)] border border-[var(--d2b-border-strong)] rounded-md px-3 py-2.5 text-sm text-[var(--d2b-text-primary)] placeholder:text-[var(--d2b-text-muted)] focus:outline-none focus:border-[#7C4DFF] transition-colors'

const labelCls = 'block text-xs font-medium text-[var(--d2b-text-secondary)] mb-1'

function Tooltip({ text }: { text: string }) {
  const [open, setOpen] = useState(false)
  return (
    <div className="relative inline-block">
      <button
        type="button"
        onMouseEnter={() => setOpen(true)}
        onMouseLeave={() => setOpen(false)}
        className="text-[var(--d2b-text-muted)] hover:text-[var(--d2b-text-secondary)] transition-colors"
      >
        <HelpCircle size={14} />
      </button>
      {open && (
        <div className="absolute right-0 bottom-6 z-10 w-56 rounded-lg border border-[var(--d2b-border)] bg-[var(--d2b-bg-elevated)] p-3 text-xs text-[var(--d2b-text-secondary)] shadow-lg">
          {text}
        </div>
      )}
    </div>
  )
}

function ServicoModal({
  open,
  onClose,
  onSave,
  initial,
  empresaId,
}: {
  open: boolean
  onClose: () => void
  onSave: (data: Partial<Servico>) => Promise<void>
  initial?: Servico | null
  empresaId: string
}) {
  const [saving, setSaving] = useState(false)
  const [form, setForm] = useState<Partial<Servico>>({})
  const [precoDuracaoAberto, setPrecoDuracaoAberto] = useState(true)

  useEffect(() => {
    if (open) {
      setForm(
        initial
          ? { ...initial }
          : {
              nome: '',
              tipo: 'GERAL',
              categoria: '',
              descricao: '',
              tipoComissao: 'NAO_GERAR',
              duracaoMinutos: undefined,
              valor: undefined,
              valorCusto: undefined,
              valorNaoComissionavel: undefined,
            }
      )
    }
  }, [open, initial])

  if (!open) return null

  const set = (k: keyof Servico, v: string | number | undefined) =>
    setForm((p) => ({ ...p, [k]: v }))

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!form.nome?.trim()) return
    setSaving(true)
    try {
      await onSave({ ...form, empresaId })
    } finally {
      setSaving(false)
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
      <div className="relative w-full max-w-lg max-h-[90vh] overflow-y-auto rounded-2xl border border-[var(--d2b-border)] bg-[var(--d2b-bg-surface)] shadow-2xl">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-[var(--d2b-border)]">
          <div className="flex items-center gap-2">
            <span className="text-[#7C4DFF]">←</span>
            <h2 className="text-sm font-bold text-[var(--d2b-text-primary)]">Serviço</h2>
          </div>
          <div className="flex items-center gap-3">
            <button
              type="submit"
              form="servico-form"
              disabled={saving || !form.nome?.trim()}
              className="text-xs font-bold text-[#7C4DFF] hover:text-[#5B21B6] disabled:opacity-40 transition-colors uppercase tracking-wide"
            >
              {saving ? 'Salvando...' : 'Salvar'}
            </button>
            <button
              type="button"
              onClick={onClose}
              className="text-[var(--d2b-text-muted)] hover:text-[var(--d2b-text-primary)] transition-colors"
            >
              <X size={18} />
            </button>
          </div>
        </div>

        {/* Form */}
        <form id="servico-form" onSubmit={handleSubmit} className="p-6 space-y-4">
          {/* Nome */}
          <div>
            <label className={labelCls}>Nome do serviço <span className="text-red-400">*</span></label>
            <input
              className={fieldCls}
              value={form.nome ?? ''}
              onChange={(e) => set('nome', e.target.value)}
              placeholder="Nome do serviço"
            />
          </div>

          {/* Categoria */}
          <div>
            <label className={labelCls}>Categoria</label>
            <input
              className={fieldCls}
              value={form.categoria ?? ''}
              onChange={(e) => set('categoria', e.target.value)}
              placeholder="Categoria"
            />
          </div>

          {/* Descrição */}
          <div>
            <label className={labelCls}>Descrição do serviço</label>
            <textarea
              className={`${fieldCls} resize-none`}
              rows={3}
              value={form.descricao ?? ''}
              onChange={(e) => set('descricao', e.target.value)}
              placeholder="Descrição do serviço"
            />
          </div>

          {/* Tipo de Comissão */}
          <div>
            <label className={labelCls}>Tipo de Comissão</label>
            <select
              className={fieldCls}
              value={form.tipoComissao ?? 'NAO_GERAR'}
              onChange={(e) => set('tipoComissao', e.target.value)}
            >
              {TIPO_COMISSAO_OPTS.map((o) => (
                <option key={o.value} value={o.value}>{o.label}</option>
              ))}
            </select>
          </div>

          {/* Seção Preço e Duração — acordeão */}
          <div className="rounded-xl border border-[var(--d2b-border)] overflow-hidden">
            <button
              type="button"
              onClick={() => setPrecoDuracaoAberto((v) => !v)}
              className="w-full flex items-center justify-between px-4 py-3 bg-[var(--d2b-bg-elevated)] hover:bg-[var(--d2b-hover)] transition-colors"
            >
              <div className="flex items-center gap-2">
                <Settings size={14} className="text-[#7C4DFF]" />
                <span className="text-sm font-bold text-[#7C4DFF]">Preço e Duração</span>
              </div>
              <ChevronDown
                size={16}
                className={`text-[var(--d2b-text-muted)] transition-transform duration-200 ${precoDuracaoAberto ? 'rotate-180' : ''}`}
              />
            </button>

            {precoDuracaoAberto && (
              <div className="px-4 py-4 space-y-4 border-t border-[var(--d2b-border)]">
              <div>
                <label className={labelCls}>Duração</label>
                <select
                  className={fieldCls}
                  value={form.duracaoMinutos ?? ''}
                  onChange={(e) =>
                    set('duracaoMinutos', e.target.value ? parseInt(e.target.value) : undefined)
                  }
                >
                  <option value="">Duração</option>
                  {DURACAO_OPTS.map((o) => (
                    <option key={o.value} value={o.value}>{o.label}</option>
                  ))}
                </select>
              </div>

              {/* Preço */}
              <div>
                <label className={labelCls}>Preço (R$)</label>
                <input
                  type="number"
                  className={fieldCls}
                  value={form.valor ?? ''}
                  onChange={(e) =>
                    set('valor', e.target.value ? parseFloat(e.target.value) : undefined)
                  }
                  placeholder="Preço (R$)"
                  step="0.01"
                  min="0"
                />
              </div>

              {/* Valor de Custos */}
              <div>
                <div className="flex items-center gap-1.5 mb-1">
                  <label className={`${labelCls} mb-0`}>Valor de Custos (R$)</label>
                  <Tooltip text="Valor interno de custo para prestação deste serviço. Usado em relatórios de lucratividade." />
                </div>
                <input
                  type="number"
                  className={fieldCls}
                  value={form.valorCusto ?? ''}
                  onChange={(e) =>
                    set('valorCusto', e.target.value ? parseFloat(e.target.value) : undefined)
                  }
                  placeholder="Valor de Custos (R$)"
                  step="0.01"
                  min="0"
                />
              </div>

              {/* Valor Não Comissionável */}
              <div>
                <div className="flex items-center gap-1.5 mb-1">
                  <label className={`${labelCls} mb-0`}>Valor Não Comissionável (R$)</label>
                  <Tooltip text="Parte do valor do serviço que não entra no cálculo de comissão do profissional." />
                </div>
                <input
                  type="number"
                  className={fieldCls}
                  value={form.valorNaoComissionavel ?? ''}
                  onChange={(e) =>
                    set(
                      'valorNaoComissionavel',
                      e.target.value ? parseFloat(e.target.value) : undefined
                    )
                  }
                  placeholder="Valor Não Comissionável (R$)"
                  step="0.01"
                  min="0"
                />
              </div>
            </div>
            )}
          </div>

          {/* Botões */}
          <div className="flex items-center justify-end gap-3 pt-4 border-t border-[var(--d2b-border)]">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-lg border border-[var(--d2b-border-strong)] text-[var(--d2b-text-secondary)] text-sm font-semibold hover:border-[var(--d2b-text-secondary)] transition-colors"
            >
              Cancelar
            </button>
            <button
              type="submit"
              disabled={saving || !form.nome?.trim()}
              className="px-4 py-2 rounded-lg bg-[#7C4DFF] hover:bg-[#5B21B6] text-white text-sm font-semibold disabled:opacity-40 transition-colors"
            >
              {saving ? 'Salvando...' : 'Salvar'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}

export function TabServicos({ initialEmpresa }: TabServicosProps) {
  const { toast } = useToast()
  const [servicos, setServicos] = useState<Servico[]>([])
  const [loading, setLoading] = useState(true)
  const [busca, setBusca] = useState('')
  const [filtroTipo, setFiltroTipo] = useState('TODOS')
  const [modalOpen, setModalOpen] = useState(false)
  const [editingServico, setEditingServico] = useState<Servico | null>(null)

  useEffect(() => {
    if (initialEmpresa?.id) carregarServicos()
  }, [initialEmpresa?.id])

  async function carregarServicos() {
    if (!initialEmpresa?.id) return
    setLoading(true)
    try {
      const res = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/api/v1/servicos/empresa/${initialEmpresa.id}`
      )
      if (res.ok) setServicos(await res.json())
    } catch {
      // silently fail
    } finally {
      setLoading(false)
    }
  }

  async function handleSave(data: Partial<Servico>) {
    if (editingServico) {
      const { id, empresaId, ...payload } = data
      const res = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/api/v1/servicos/${editingServico.id}`,
        {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload),
        }
      )
      if (res.ok) {
        toast({ title: 'Serviço atualizado!' })
        carregarServicos()
        setModalOpen(false)
        setEditingServico(null)
      } else {
        toast({ title: 'Erro ao atualizar serviço', variant: 'destructive' })
      }
    } else {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/v1/servicos`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      })
      if (res.ok) {
        toast({ title: 'Serviço criado!' })
        carregarServicos()
        setModalOpen(false)
      } else {
        toast({ title: 'Erro ao criar serviço', variant: 'destructive' })
      }
    }
  }

  async function handleDeletar(id: string) {
    if (!confirm('Tem certeza que deseja excluir este serviço?')) return
    const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/v1/servicos/${id}`, {
      method: 'DELETE',
    })
    if (res.ok) {
      toast({ title: 'Serviço excluído!' })
      carregarServicos()
    } else {
      toast({ title: 'Erro ao excluir serviço', variant: 'destructive' })
    }
  }

  function openCriar() {
    setEditingServico(null)
    setModalOpen(true)
  }

  function openEditar(s: Servico) {
    setEditingServico(s)
    setModalOpen(true)
  }

  const servicosFiltrados = servicos.filter((s) => {
    const matchBusca = s.nome.toLowerCase().includes(busca.toLowerCase())
    const matchTipo = filtroTipo === 'TODOS' || s.tipo === filtroTipo
    return matchBusca && matchTipo
  })

  return (
    <div className="space-y-6">
      <div className="flex items-start justify-between">
        <div>
          <h2 className="text-base font-bold text-[var(--d2b-text-primary)]">Serviços da Clínica</h2>
          <p className="text-xs text-[var(--d2b-text-secondary)] mt-1">
            Edite os serviços prestados pela sua consultório ou clínica. Eles estarão disponíveis
            para especificar os agendamentos realizados.
          </p>
        </div>
        <button
          onClick={openCriar}
          className="flex items-center gap-2 px-4 py-2 rounded-lg bg-[#7C4DFF] hover:bg-[#5B21B6] text-white text-sm font-semibold transition-colors"
        >
          <Plus size={16} />
          Adicionar Novo Serviço
        </button>
      </div>

      {/* Filtros */}
      <div className="flex items-center gap-3">
        <div className="relative flex-1">
          <Search
            size={18}
            className="absolute left-3 top-1/2 -translate-y-1/2 text-[var(--d2b-text-muted)]"
          />
          <input
            type="text"
            value={busca}
            onChange={(e) => setBusca(e.target.value)}
            placeholder="Pesquisar Serviço..."
            className="w-full pl-10 pr-4 py-2 rounded-lg border border-[var(--d2b-border-strong)] bg-[var(--d2b-bg-surface)] text-[var(--d2b-text-primary)] text-sm placeholder:text-[var(--d2b-text-muted)] focus:outline-none focus:border-[#7C4DFF]"
          />
        </div>
        <select
          value={filtroTipo}
          onChange={(e) => setFiltroTipo(e.target.value)}
          className="px-4 py-2 rounded-lg border border-[var(--d2b-border-strong)] bg-[var(--d2b-bg-surface)] text-[var(--d2b-text-primary)] text-sm focus:outline-none focus:border-[#7C4DFF]"
        >
          <option value="TODOS">Todos</option>
          {TIPO_OPTS.map((t) => (
            <option key={t} value={t}>{TIPO_LABEL[t]}</option>
          ))}
        </select>
      </div>

      {loading ? (
        <div className="p-8 text-center text-[var(--d2b-text-secondary)]">Carregando...</div>
      ) : (
        <div className="space-y-4">
          <p className="text-xs text-[var(--d2b-text-secondary)]">
            Exibindo {servicosFiltrados.length} de {servicos.length} serviços
          </p>

          <div className="space-y-3">
            {servicosFiltrados.map((servico) => (
              <div
                key={servico.id}
                className="p-4 rounded-xl border border-[var(--d2b-border)] bg-[var(--d2b-bg-surface)] hover:border-[var(--d2b-border-strong)] transition-colors"
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-4 flex-1 min-w-0">
                    <Briefcase size={20} className="text-[#7C4DFF] shrink-0" />
                    <div className="flex-1 min-w-0">
                      <h4 className="text-sm font-semibold text-[var(--d2b-text-primary)] truncate">
                        {servico.nome}
                      </h4>
                      {servico.categoria && (
                        <p className="text-xs text-[var(--d2b-text-secondary)] truncate mt-0.5">
                          {servico.categoria}
                        </p>
                      )}
                    </div>

                    <div className="flex items-center gap-3 shrink-0">
                      {servico.duracaoMinutos && (
                        <span className="text-xs text-[var(--d2b-text-secondary)]">
                          {DURACAO_OPTS.find((d) => d.value === servico.duracaoMinutos)?.label ??
                            `${servico.duracaoMinutos}min`}
                        </span>
                      )}
                      <span className="text-xs px-3 py-1 rounded-full bg-[var(--d2b-hover)] text-[var(--d2b-text-secondary)]">
                        {TIPO_LABEL[servico.tipo] ?? servico.tipo}
                      </span>
                      <span className="text-sm font-bold text-[var(--d2b-text-primary)] min-w-[80px] text-right">
                        {servico.valor != null ? `R$ ${Number(servico.valor).toFixed(2)}` : '-'}
                      </span>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 ml-4">
                    <button
                      onClick={() => openEditar(servico)}
                      className="p-2 rounded-lg hover:bg-[var(--d2b-hover)] text-[var(--d2b-text-secondary)] hover:text-[#7C4DFF] transition-colors"
                      title="Editar"
                    >
                      <Pencil size={16} />
                    </button>
                    <button
                      onClick={() => handleDeletar(servico.id)}
                      className="p-2 rounded-lg hover:bg-[rgba(239,68,68,0.15)] text-[var(--d2b-text-secondary)] hover:text-[#EF4444] transition-colors"
                      title="Excluir"
                    >
                      <Trash2 size={16} />
                    </button>
                  </div>
                </div>
              </div>
            ))}

            {servicosFiltrados.length === 0 && (
              <div className="p-12 text-center rounded-xl border border-dashed border-[var(--d2b-border-strong)] bg-[var(--d2b-bg-main)]">
                <Briefcase size={48} className="mx-auto mb-4 text-[var(--d2b-text-muted)]" />
                <p className="text-sm text-[var(--d2b-text-secondary)]">
                  {busca || filtroTipo !== 'TODOS'
                    ? 'Nenhum serviço encontrado'
                    : 'Nenhum serviço cadastrado'}
                </p>
                <p className="text-xs text-[var(--d2b-text-muted)] mt-1">
                  {busca || filtroTipo !== 'TODOS'
                    ? 'Tente ajustar os filtros'
                    : 'Clique em "Adicionar Novo Serviço" para começar'}
                </p>
              </div>
            )}
          </div>
        </div>
      )}

      <ServicoModal
        open={modalOpen}
        onClose={() => {
          setModalOpen(false)
          setEditingServico(null)
        }}
        onSave={handleSave}
        initial={editingServico}
        empresaId={initialEmpresa?.id ?? ''}
      />
    </div>
  )
}
