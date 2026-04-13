'use client'

import { useState } from 'react'
import {
  Search, Printer, Plus, MoreHorizontal, ArrowUpDown,
  ChevronDown, Pencil, X, Calendar, SlidersHorizontal,
  AlertCircle, RotateCcw,
} from 'lucide-react'

// ─── Shared styles ──────────────────────────────────────────────────────────
const INP =
  'w-full bg-[var(--d2b-bg-main)] border border-[var(--d2b-border-strong)] rounded-md ' +
  'px-3 py-2 text-sm text-[var(--d2b-text-primary)] placeholder:text-[var(--d2b-text-muted)] ' +
  'focus:outline-none focus:border-[#7C4DFF] transition-colors'

const INP_RO =
  'w-full bg-[var(--d2b-bg-elevated)] border border-[var(--d2b-border)] rounded-md ' +
  'px-3 py-2 text-sm text-[var(--d2b-text-secondary)] outline-none'

const SEL =
  'w-full bg-[var(--d2b-bg-main)] border border-[var(--d2b-border-strong)] rounded-md ' +
  'px-3 py-2 text-sm text-[var(--d2b-text-primary)] ' +
  'focus:outline-none focus:border-[#7C4DFF] transition-colors appearance-none'

const LBL  = 'block text-xs text-[var(--d2b-text-secondary)] mb-1'
const SEC  = 'text-base font-semibold text-[var(--d2b-text-primary)] mb-3 pb-2 border-b border-[var(--d2b-border)]'

const BTN_PRIMARY =
  'flex items-center gap-2 px-4 py-2.5 rounded-full text-sm font-bold text-white bg-[#7C4DFF] hover:bg-[#5B21B6] transition-colors'

const BTN_OUTLINE =
  'flex items-center gap-2 px-4 py-2 rounded-md text-sm font-medium border border-[var(--d2b-border-strong)] ' +
  'text-[var(--d2b-text-secondary)] hover:border-[#7C4DFF] hover:text-[var(--d2b-text-primary)] bg-transparent transition-colors'

const TH = 'text-left px-3 py-3 text-xs font-semibold text-[var(--d2b-text-secondary)] uppercase tracking-wider whitespace-nowrap'

// ─── Types ──────────────────────────────────────────────────────────────────
type StatusOP = 'em aberto' | 'em andamento' | 'finalizada' | 'cancelada'
type ListaTab = 'todas' | StatusOP
type Tela     = 'lista' | 'novo' | 'ver'

type EtapaProducao = {
  id: string
  nro: number
  etapa: string
  dataInicio: string
  dataFim: string
  situacao: string
}

type OrdemProducao = {
  id: string
  numero: number
  data: string
  dataPrevista: string
  numeroOP: string
  produto: string
  quantidade: number
  un: string
  marcadores: string[]
  status: StatusOP
  composicao: string
  etapas: EtapaProducao[]
  observacoes: string
  estoqueLancado: boolean
}

// ─── Mock ─────────────────────────────────────────────────────────────────────
const MOCK_OPS: OrdemProducao[] = [
  {
    id: '1',
    numero: 1,
    data: '07/04/2026',
    dataPrevista: '07/04/2026',
    numeroOP: '1',
    produto: '',
    quantidade: 1,
    un: '',
    marcadores: [],
    status: 'em aberto',
    composicao: '',
    etapas: [],
    observacoes: 'Teste',
    estoqueLancado: false,
  },
]

const STATUS_CONFIG: Record<StatusOP, { dot: string; label: string }> = {
  'em aberto':   { dot: 'bg-yellow-400',  label: 'em aberto'   },
  'em andamento':{ dot: 'bg-blue-400',    label: 'em andamento'},
  'finalizada':  { dot: 'bg-emerald-400', label: 'finalizada'  },
  'cancelada':   { dot: 'bg-[var(--d2b-text-muted)] opacity-50', label: 'cancelada' },
}

// ═══════════════════════════════════════════════════════════════════════════
// FORMULÁRIO (novo / editar)
// ═══════════════════════════════════════════════════════════════════════════
function OrdemProducaoForm({
  inicial,
  onBack,
  onSalvar,
}: {
  inicial?: Partial<OrdemProducao>
  onBack: () => void
  onSalvar: (op: Partial<OrdemProducao>) => void
}) {
  const [produto,       setProduto]       = useState(inicial?.produto ?? '')
  const [quantidade,    setQuantidade]    = useState(String(inicial?.quantidade ?? 1))
  const [un,            setUn]            = useState(inicial?.un ?? '')
  const [data,          setData]          = useState(inicial?.data ?? '')
  const [dataPrevista,  setDataPrevista]  = useState(inicial?.dataPrevista ?? '')
  const [observacoes,   setObservacoes]   = useState(inicial?.observacoes ?? '')
  const [marcadorInput, setMarcadorInput] = useState('')
  const [marcadores,    setMarcadores]    = useState<string[]>(inicial?.marcadores ?? [])

  const addMarcador = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if ((e.key === 'Enter' || e.key === 'Tab') && marcadorInput.trim()) {
      e.preventDefault()
      setMarcadores(prev => [...prev, marcadorInput.trim()])
      setMarcadorInput('')
    }
  }

  const removeMarcador = (m: string) => setMarcadores(prev => prev.filter(x => x !== m))

  return (
    <div className="flex flex-col h-full">
      {/* Breadcrumb */}
      <div className="flex items-center gap-3 px-8 pt-6 pb-3">
        <button onClick={onBack} className="text-xs text-[var(--d2b-text-muted)] hover:text-[var(--d2b-text-primary)] flex items-center gap-1 transition-colors">
          ← voltar
        </button>
        <span className="text-xs text-[var(--d2b-text-muted)]">/</span>
        <span className="text-xs text-[var(--d2b-text-muted)]">início</span>
        <span className="text-xs text-[var(--d2b-text-muted)]">≡ suprimentos</span>
        <span className="text-xs text-[var(--d2b-text-secondary)]">ordens de produção</span>
      </div>

      <div className="flex-1 overflow-y-auto px-8 pb-8 max-w-4xl">
        <h2 className="text-xl font-semibold text-[var(--d2b-text-primary)] mb-6 pb-4 border-b border-[var(--d2b-border)]">
          Ordem de Produção
        </h2>

        {/* Produto + Quantidade */}
        <div className="flex items-end gap-4 mb-5">
          <div className="flex-1">
            <label className={LBL}>Produto a ser produzido</label>
            <input
              className={INP}
              value={produto}
              onChange={e => setProduto(e.target.value)}
              placeholder="Pesquise pelo nome ou código do produto"
            />
          </div>
          <div className="w-40">
            <label className={LBL}>Quantidade</label>
            <div className="flex items-center gap-0 border border-[var(--d2b-border-strong)] rounded-md overflow-hidden bg-[var(--d2b-bg-main)]">
              <input
                value={quantidade}
                onChange={e => setQuantidade(e.target.value)}
                className="flex-1 px-3 py-2 text-sm text-[var(--d2b-text-primary)] bg-transparent outline-none focus:ring-0"
              />
              <span className="px-3 py-2 text-xs text-[var(--d2b-text-muted)] border-l border-[var(--d2b-border-strong)] bg-[var(--d2b-bg-elevated)]">
                {un || 'un'}
              </span>
            </div>
          </div>
        </div>

        {/* Data + Data prevista + Número OP */}
        <div className="flex items-start gap-4 mb-6 pb-6 border-b border-[var(--d2b-border)]">
          <div className="flex-1">
            <label className={LBL}>Data</label>
            <div className="relative">
              <input
                className={INP + ' pr-9'}
                value={data}
                onChange={e => setData(e.target.value)}
                placeholder="dd/mm/aaaa"
              />
              <Calendar size={14} className="absolute right-3 top-1/2 -translate-y-1/2 text-[var(--d2b-text-muted)] pointer-events-none" />
            </div>
            <p className="text-xs text-[var(--d2b-text-muted)] mt-1">(dd/mm/aaaa)</p>
          </div>
          <div className="flex-1">
            <label className={LBL}>Data prevista</label>
            <div className="relative">
              <input
                className={INP + ' pr-9'}
                value={dataPrevista}
                onChange={e => setDataPrevista(e.target.value)}
                placeholder="dd/mm/aaaa"
              />
              <Calendar size={14} className="absolute right-3 top-1/2 -translate-y-1/2 text-[var(--d2b-text-muted)] pointer-events-none" />
            </div>
            <p className="text-xs text-[var(--d2b-text-muted)] mt-1">(dd/mm/aaaa)</p>
          </div>
          <div className="flex-1">
            <label className={LBL}>Número da OP</label>
            <input className={INP_RO} readOnly value={String(MOCK_OPS.length + 1)} />
            <p className="text-xs text-[var(--d2b-text-muted)] mt-1">Número da ordem de produção</p>
          </div>
        </div>

        {/* Composição */}
        <div className="mb-6 pb-6 border-b border-[var(--d2b-border)]">
          <p className={SEC}>Composição</p>
          <p className="text-sm text-[var(--d2b-text-muted)]">
            Nenhum item de composição. Selecione um produto fabricado para carregar automaticamente.
          </p>
        </div>

        {/* Etapas da Produção */}
        <div className="mb-6 pb-6 border-b border-[var(--d2b-border)]">
          <p className={SEC}>Etapas da Produção</p>
          <div className="w-full text-sm">
            <div className="grid grid-cols-5 gap-3 text-xs font-semibold text-[var(--d2b-text-secondary)] uppercase tracking-wider pb-2 border-b border-[var(--d2b-border)]">
              <span>Nro</span>
              <span>Etapa</span>
              <span>Data Início</span>
              <span>Data Fim</span>
              <span>Situação</span>
            </div>
            <p className="text-xs text-[var(--d2b-text-muted)] mt-3">Nenhuma etapa cadastrada.</p>
          </div>
        </div>

        {/* Observações */}
        <div className="mb-5">
          <label className="text-sm font-semibold text-[var(--d2b-text-primary)] block mb-3">Observações</label>
          <textarea
            rows={4}
            value={observacoes}
            onChange={e => setObservacoes(e.target.value)}
            className="w-full bg-[var(--d2b-bg-main)] border border-[var(--d2b-border-strong)] rounded-md px-3 py-2 text-sm text-[var(--d2b-text-primary)] placeholder:text-[var(--d2b-text-muted)] focus:outline-none focus:border-[#7C4DFF] transition-colors resize-none"
          />
        </div>

        {/* Marcadores */}
        <div className="mb-8">
          <label className="text-sm font-semibold text-[var(--d2b-text-primary)] block mb-2">Marcadores</label>
          <div className="flex flex-wrap items-center gap-1.5 border border-[var(--d2b-border-strong)] rounded-md px-3 py-2 min-h-[40px] bg-[var(--d2b-bg-main)] focus-within:border-[#7C4DFF] transition-colors">
            {marcadores.map(m => (
              <span key={m} className="flex items-center gap-1 bg-[var(--d2b-bg-elevated)] border border-[var(--d2b-border)] rounded-full px-2.5 py-0.5 text-xs text-[var(--d2b-text-primary)]">
                <span className="w-2 h-2 rounded-full bg-[var(--d2b-text-muted)]" />
                {m}
                <button onClick={() => removeMarcador(m)} className="ml-1 text-[var(--d2b-text-muted)] hover:text-[var(--d2b-text-primary)]">
                  <X size={10} />
                </button>
              </span>
            ))}
            <input
              value={marcadorInput}
              onChange={e => setMarcadorInput(e.target.value)}
              onKeyDown={addMarcador}
              className="flex-1 min-w-[120px] bg-transparent text-sm text-[var(--d2b-text-primary)] placeholder:text-[var(--d2b-text-muted)] outline-none"
              placeholder={marcadores.length === 0 ? '' : ''}
            />
          </div>
          <p className="text-xs text-[var(--d2b-text-muted)] mt-1">Separados por vírgula ou tab</p>
        </div>

        {/* Ações */}
        <div className="flex items-center gap-3">
          <button
            onClick={() => onSalvar({ produto, quantidade: Number(quantidade), data, dataPrevista, observacoes, marcadores })}
            className={BTN_PRIMARY}
          >
            salvar
          </button>
          <button onClick={onBack} className="text-sm text-[var(--d2b-text-secondary)] hover:text-[var(--d2b-text-primary)] transition-colors">
            cancelar
          </button>
        </div>
      </div>
    </div>
  )
}

// ═══════════════════════════════════════════════════════════════════════════
// DETALHE / VISUALIZAÇÃO
// ═══════════════════════════════════════════════════════════════════════════
function OrdemProducaoDetalhe({
  op,
  onBack,
  onEditar,
}: {
  op: OrdemProducao
  onBack: () => void
  onEditar: () => void
}) {
  const [acoesOpen, setAcoesOpen] = useState(false)
  const cfg = STATUS_CONFIG[op.status]

  return (
    <div className="flex flex-col h-full">
      {/* Header */}
      <div className="flex items-center justify-between gap-3 px-8 pt-6 pb-3">
        <div className="flex items-center gap-3">
          <button onClick={onBack} className="text-xs text-[var(--d2b-text-muted)] hover:text-[var(--d2b-text-primary)] flex items-center gap-1 transition-colors">
            ← voltar
          </button>
          <span className="text-xs text-[var(--d2b-text-muted)]">/</span>
          <span className="text-xs text-[var(--d2b-text-muted)]">início</span>
          <span className="text-xs text-[var(--d2b-text-muted)]">≡ suprimentos</span>
          <span className="text-xs text-[var(--d2b-text-secondary)]">ordens de produção</span>
        </div>
        <div className="flex items-center gap-2">
          {!op.estoqueLancado && (
            <button onClick={onEditar} className={BTN_PRIMARY}>
              <Pencil size={13} />
              editar
            </button>
          )}
          <div className="relative">
            <button onClick={() => setAcoesOpen(v => !v)} className={BTN_OUTLINE}>
              ações <MoreHorizontal size={14} />
            </button>
            {acoesOpen && (
              <div className="absolute right-0 top-full mt-1 z-20 bg-[var(--d2b-bg-elevated)] border border-[var(--d2b-border-strong)] rounded-xl shadow-xl w-64 overflow-hidden">
                {[
                  'lançar estoque', 'imprimir detalhe', 'imprimir estrutura',
                  'imprimir etiquetas dos produtos', 'imprimir necessidade materiais',
                ].map(l => (
                  <button key={l} onClick={() => setAcoesOpen(false)}
                    className="w-full flex items-center px-4 py-3 text-sm text-[var(--d2b-text-secondary)] hover:bg-[var(--d2b-hover)] hover:text-[var(--d2b-text-primary)] transition-colors">
                    {l}
                  </button>
                ))}
                <div className="mx-4 border-t border-[var(--d2b-border)]" />
                <button onClick={() => setAcoesOpen(false)}
                  className="w-full flex items-center px-4 py-3 text-sm text-[var(--d2b-text-secondary)] hover:bg-[var(--d2b-hover)] transition-colors">
                  visualizar tarefas
                </button>
                <button onClick={() => setAcoesOpen(false)}
                  className="w-full flex items-center px-4 py-3 text-sm text-[var(--d2b-text-secondary)] hover:bg-[var(--d2b-hover)] transition-colors">
                  ocorrências
                </button>
                <div className="px-4 py-2 border-t border-[var(--d2b-border)]">
                  <p className="text-xs text-[var(--d2b-text-muted)] mb-2">alterar situação</p>
                  <div className="flex items-center gap-2">
                    {['bg-yellow-400','bg-blue-400','bg-emerald-400','bg-[var(--d2b-bg-elevated)] border border-[var(--d2b-border-strong)]'].map((c,i) => (
                      <button key={i} className={`w-4 h-4 rounded-full ${c}`} onClick={() => setAcoesOpen(false)} />
                    ))}
                  </div>
                </div>
                <div className="mx-4 border-t border-[var(--d2b-border)]" />
                {['clonar', 'marcadores'].map(l => (
                  <button key={l} onClick={() => setAcoesOpen(false)}
                    className="w-full flex items-center px-4 py-3 text-sm text-[var(--d2b-text-secondary)] hover:bg-[var(--d2b-hover)] transition-colors">
                    {l}
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto px-8 pb-8 max-w-4xl">
        <h2 className="text-xl font-semibold text-[var(--d2b-text-primary)] mb-1">Ordem de Produção</h2>
        <div className="flex items-center gap-2 mb-4">
          {op.estoqueLancado && (
            <span className="w-6 h-6 rounded-full border border-[var(--d2b-border-strong)] flex items-center justify-center text-[10px] font-bold text-[var(--d2b-text-secondary)]">
              E
            </span>
          )}
          <div className="flex items-center gap-1.5">
            <span className={`w-2 h-2 rounded-full ${cfg.dot}`} />
            <span className="text-xs text-[var(--d2b-text-secondary)]">{cfg.label}</span>
          </div>
        </div>

        {/* Alerta estoque lançado */}
        {op.estoqueLancado && (
          <div className="flex items-start gap-3 p-4 rounded-xl border border-yellow-500/30 bg-yellow-500/5 mb-6">
            <AlertCircle size={16} className="text-yellow-500 shrink-0 mt-0.5" />
            <div>
              <p className="text-sm text-[var(--d2b-text-primary)]">
                <span className="font-semibold">Edição desabilitada.</span>{' '}
                Não é possível editar ordens de produção que possuem estoque lançado.
              </p>
              <button className="flex items-center gap-1 text-xs text-[#7C4DFF] hover:text-[#A98EFF] mt-1 transition-colors">
                <RotateCcw size={11} />
                estornar estoque para editar
              </button>
            </div>
          </div>
        )}

        {/* Dados */}
        <div className="pb-6 border-b border-[var(--d2b-border)] mb-6">
          <div className="mb-3">
            <p className="text-xs text-[var(--d2b-text-muted)]">Quantidade</p>
            <p className="text-sm text-[var(--d2b-text-primary)]">{op.quantidade.toFixed(2)}</p>
          </div>
          <div className="grid grid-cols-3 gap-4">
            <div>
              <p className="text-xs text-[var(--d2b-text-muted)]">Data</p>
              <p className="text-sm text-[var(--d2b-text-primary)]">{op.data}</p>
            </div>
            <div>
              <p className="text-xs text-[var(--d2b-text-muted)]">Data prevista</p>
              <p className="text-sm text-[var(--d2b-text-primary)]">{op.dataPrevista}</p>
            </div>
            <div>
              <p className="text-xs text-[var(--d2b-text-muted)]">Número da OP</p>
              <p className="text-sm text-[var(--d2b-text-primary)]">{op.numeroOP}</p>
            </div>
          </div>
        </div>

        {/* Composição */}
        <div className="pb-6 border-b border-[var(--d2b-border)] mb-6">
          <p className="text-base font-semibold text-[var(--d2b-text-primary)] mb-2">Composição</p>
          {op.composicao ? (
            <p className="text-sm text-[var(--d2b-text-secondary)]">{op.composicao}</p>
          ) : (
            <p className="text-sm text-[var(--d2b-text-muted)]">Nenhuma composição cadastrada.</p>
          )}
        </div>

        {/* Etapas da Produção */}
        <div className="pb-6 border-b border-[var(--d2b-border)] mb-6">
          <p className="text-base font-semibold text-[var(--d2b-text-primary)] mb-3">Etapas da Produção</p>
          {op.etapas.length === 0 ? (
            <p className="text-sm text-[var(--d2b-text-muted)]">Nenhuma etapa cadastrada.</p>
          ) : (
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-[var(--d2b-border)]">
                  {['Nro','Etapa','Data Início','Data Fim','Situação'].map(h => (
                    <th key={h} className={TH}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {op.etapas.map(e => (
                  <tr key={e.id} className="border-b border-[var(--d2b-border)]">
                    <td className="px-3 py-3 text-[var(--d2b-text-secondary)]">{e.nro}</td>
                    <td className="px-3 py-3 text-[var(--d2b-text-primary)]">{e.etapa}</td>
                    <td className="px-3 py-3 text-[var(--d2b-text-secondary)]">{e.dataInicio}</td>
                    <td className="px-3 py-3 text-[var(--d2b-text-secondary)]">{e.dataFim}</td>
                    <td className="px-3 py-3 text-[var(--d2b-text-secondary)]">{e.situacao}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>

        {/* Observações */}
        {op.observacoes && (
          <div className="mb-4">
            <p className="text-base font-semibold text-[var(--d2b-text-primary)] mb-2">Observações</p>
            <p className="text-sm text-[var(--d2b-text-secondary)]">{op.observacoes}</p>
          </div>
        )}

        {/* Marcadores */}
        {op.marcadores.length > 0 && (
          <div className="flex flex-wrap gap-1.5 mt-2">
            {op.marcadores.map(m => (
              <span key={m} className="flex items-center gap-1 bg-[var(--d2b-bg-elevated)] border border-[var(--d2b-border)] rounded-full px-2.5 py-0.5 text-xs text-[var(--d2b-text-primary)]">
                <span className="w-2 h-2 rounded-full bg-[var(--d2b-text-muted)]" />
                {m}
              </span>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}

// ═══════════════════════════════════════════════════════════════════════════
// LISTA
// ═══════════════════════════════════════════════════════════════════════════
function OrdensProducaoLista({
  ops,
  onNovo,
  onVer,
}: {
  ops: OrdemProducao[]
  onNovo: () => void
  onVer: (id: string) => void
}) {
  const [tab, setTab]     = useState<ListaTab>('em aberto')
  const [busca, setBusca] = useState('')
  const [selecionados, setSelecionados] = useState<string[]>([])

  const TABS: { id: ListaTab; label: string }[] = [
    { id: 'todas',         label: 'todas'         },
    { id: 'em aberto',     label: 'em aberto'     },
    { id: 'em andamento',  label: 'em andamento'  },
    { id: 'finalizada',    label: 'finalizada'    },
    { id: 'cancelada',     label: 'cancelada'     },
  ]

  const countOf = (t: ListaTab) =>
    t === 'todas' ? ops.length : ops.filter(o => o.status === t).length

  const filtradas = ops.filter(o => {
    const q = busca.toLowerCase()
    const matchBusca = !q || String(o.numero).includes(q) || o.produto.toLowerCase().includes(q)
    const matchTab   = tab === 'todas' || o.status === tab
    return matchBusca && matchTab
  })

  const toggleSelect = (id: string) =>
    setSelecionados(prev => prev.includes(id) ? prev.filter(x => x !== id) : [...prev, id])
  const toggleAll = () =>
    setSelecionados(prev => prev.length === filtradas.length ? [] : filtradas.map(o => o.id))

  return (
    <div className="flex flex-col h-full">
      {/* Top bar */}
      <div className="flex items-center justify-between gap-3 px-8 pt-6 pb-3 flex-wrap">
        <div className="text-xs text-[var(--d2b-text-muted)]">início ≡ suprimentos ordens de produção</div>
        <div className="flex items-center gap-2">
          <button className={BTN_OUTLINE}>
            <Printer size={13} />
            imprimir
          </button>
          <button onClick={onNovo} className={BTN_PRIMARY}>
            <Plus size={14} />
            incluir ordem de produção
          </button>
        </div>
      </div>

      {/* Título + busca */}
      <div className="px-8 pb-3">
        <h2 className="text-xl font-semibold text-[var(--d2b-text-primary)] mb-4">Ordens de produção</h2>
        <div className="flex items-center gap-2 flex-wrap">
          <div className="flex items-center gap-2 bg-[var(--d2b-bg-elevated)] border border-[var(--d2b-border)] rounded-lg px-3 h-9 w-80">
            <input
              value={busca}
              onChange={e => setBusca(e.target.value)}
              placeholder="Pesquise pelo produto ou número da ordem"
              className="bg-transparent text-sm text-[var(--d2b-text-primary)] placeholder:text-[var(--d2b-text-muted)] outline-none flex-1"
            />
            <Search size={13} className="text-[var(--d2b-text-muted)] shrink-0" />
          </div>
          <button className="flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs border border-[var(--d2b-border-strong)] text-[var(--d2b-text-secondary)] hover:border-[#7C4DFF] transition-colors">
            <Calendar size={12} />
            por período
          </button>
          <button className="flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs border border-[var(--d2b-border-strong)] text-[var(--d2b-text-secondary)] hover:border-[#7C4DFF] transition-colors">
            <SlidersHorizontal size={12} />
            filtros
          </button>
        </div>
      </div>

      {/* Abas */}
      <div className="flex items-end border-b border-[var(--d2b-border)] px-8">
        {TABS.map(t => {
          const count  = countOf(t.id)
          const active = tab === t.id
          return (
            <button key={t.id} onClick={() => setTab(t.id)}
              className={[
                'flex flex-col items-center px-4 pb-2.5 pt-2 border-b-2 -mb-px transition-colors gap-0.5',
                active ? 'border-[#7C4DFF] text-[var(--d2b-text-primary)]' : 'border-transparent text-[var(--d2b-text-secondary)] hover:text-[var(--d2b-text-primary)]',
              ].join(' ')}
            >
              <span className="text-sm font-medium">{t.label}</span>
              {count > 0 && (
                <span className={`text-xs font-semibold ${active ? 'text-[#7C4DFF]' : 'text-[var(--d2b-text-muted)]'}`}>
                  {String(count).padStart(2, '0')}
                </span>
              )}
            </button>
          )
        })}
      </div>

      {/* Tabela */}
      <div className="flex-1 overflow-x-auto px-8 pt-4 pb-4">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-[var(--d2b-border)]">
              <th className="px-3 py-3 w-8">
                <input
                  type="checkbox"
                  checked={selecionados.length === filtradas.length && filtradas.length > 0}
                  onChange={toggleAll}
                  className="w-4 h-4 rounded accent-[#7C4DFF] cursor-pointer"
                />
              </th>
              <th className="w-6 px-1 py-3" />
              <th className={TH}>Número <ArrowUpDown size={10} className="inline mb-0.5 text-[var(--d2b-text-muted)]" /></th>
              <th className={TH}>Pedidos <ArrowUpDown size={10} className="inline mb-0.5 text-[var(--d2b-text-muted)]" /></th>
              <th className={TH}>Data <ArrowUpDown size={10} className="inline mb-0.5 text-[var(--d2b-text-muted)]" /></th>
              <th className={TH}>Data Prevista <ArrowUpDown size={10} className="inline mb-0.5 text-[var(--d2b-text-muted)]" /></th>
              <th className={TH}>Código (SKU) — Descrição do produto <ArrowUpDown size={10} className="inline mb-0.5 text-[var(--d2b-text-muted)]" /></th>
              <th className={TH + ' text-right'}>Quantidade <ArrowUpDown size={10} className="inline mb-0.5 text-[var(--d2b-text-muted)]" /></th>
              <th className={TH}>Un <ArrowUpDown size={10} className="inline mb-0.5 text-[var(--d2b-text-muted)]" /></th>
              <th className={TH}>Marcadores</th>
              <th className={TH}>Integrações</th>
              <th className="w-8" />
            </tr>
          </thead>
          <tbody>
            {filtradas.length === 0 ? (
              <tr>
                <td colSpan={12} className="px-3 py-14 text-center text-sm text-[var(--d2b-text-muted)]">
                  Nenhuma ordem de produção encontrada.
                </td>
              </tr>
            ) : filtradas.map(op => {
              const sel = selecionados.includes(op.id)
              const cfg = STATUS_CONFIG[op.status]
              return (
                <tr key={op.id}
                  className={[
                    'border-b border-[var(--d2b-border)] hover:bg-[var(--d2b-hover)] transition-colors group',
                    sel ? 'bg-[var(--d2b-hover)]' : '',
                  ].join(' ')}
                >
                  <td className="px-3 py-3">
                    <input type="checkbox" checked={sel} onChange={() => toggleSelect(op.id)}
                      className="w-4 h-4 rounded accent-[#7C4DFF] cursor-pointer" />
                  </td>
                  <td className="px-1 py-3">
                    <span className="text-xs text-[var(--d2b-text-muted)] opacity-0 group-hover:opacity-100 cursor-pointer select-none">···</span>
                  </td>
                  <td className="px-3 py-3">
                    <span onClick={() => onVer(op.id)}
                      className="font-medium text-[var(--d2b-text-primary)] hover:text-[#7C4DFF] cursor-pointer transition-colors">
                      {op.numero}
                    </span>
                  </td>
                  <td className="px-3 py-3 text-[var(--d2b-text-secondary)]">—</td>
                  <td className="px-3 py-3 text-[var(--d2b-text-secondary)]">{op.data}</td>
                  <td className="px-3 py-3 text-[var(--d2b-text-secondary)]">{op.dataPrevista}</td>
                  <td className="px-3 py-3 text-[var(--d2b-text-secondary)]">{op.produto || '—'}</td>
                  <td className="px-3 py-3 text-right text-[var(--d2b-text-primary)]">{op.quantidade.toFixed(2)}</td>
                  <td className="px-3 py-3 text-[var(--d2b-text-secondary)]">{op.un}</td>
                  <td className="px-3 py-3">
                    <div className="flex flex-wrap gap-1">
                      {op.marcadores.map(m => (
                        <span key={m} className="flex items-center gap-1 bg-[var(--d2b-bg-elevated)] border border-[var(--d2b-border)] rounded-full px-2 py-0.5 text-[10px] text-[var(--d2b-text-secondary)]">
                          <span className="w-1.5 h-1.5 rounded-full bg-[var(--d2b-text-muted)]" />{m}
                        </span>
                      ))}
                    </div>
                  </td>
                  <td className="px-3 py-3">
                    {op.estoqueLancado && (
                      <span className="w-5 h-5 rounded-full border border-[var(--d2b-border-strong)] flex items-center justify-center text-[9px] font-bold text-[var(--d2b-text-secondary)]">
                        E
                      </span>
                    )}
                  </td>
                  <td className="px-3 py-3">
                    <div className={`w-2.5 h-2.5 rounded-full ${cfg.dot}`} />
                  </td>
                </tr>
              )
            })}
          </tbody>
        </table>
      </div>

      {/* Rodapé */}
      {filtradas.length > 0 && (
        <div className="px-8 py-2 border-t border-[var(--d2b-border)] flex justify-end text-xs text-[var(--d2b-text-muted)]">
          ↑
        </div>
      )}
    </div>
  )
}

// ═══════════════════════════════════════════════════════════════════════════
// EXPORT
// ═══════════════════════════════════════════════════════════════════════════
export function OrdensProducaoContent() {
  const [tela, setTela]         = useState<Tela>('lista')
  const [activeId, setActiveId] = useState<string | null>(null)
  const [ops, setOps]           = useState<OrdemProducao[]>(MOCK_OPS)

  const activeOp = ops.find(o => o.id === activeId) ?? ops[0]

  const handleSalvar = (dados: Partial<OrdemProducao>) => {
    if (tela === 'novo') {
      setOps(prev => [...prev, {
        id: String(Date.now()),
        numero: prev.length + 1,
        data: dados.data ?? '',
        dataPrevista: dados.dataPrevista ?? '',
        numeroOP: String(prev.length + 1),
        produto: dados.produto ?? '',
        quantidade: dados.quantidade ?? 1,
        un: '',
        marcadores: dados.marcadores ?? [],
        status: 'em aberto',
        composicao: '',
        etapas: [],
        observacoes: dados.observacoes ?? '',
        estoqueLancado: false,
      }])
    }
    setTela('lista')
  }

  if (tela === 'novo')
    return <OrdemProducaoForm onBack={() => setTela('lista')} onSalvar={handleSalvar} />

  if (tela === 'ver' && activeId)
    return (
      <OrdemProducaoDetalhe
        op={activeOp}
        onBack={() => setTela('lista')}
        onEditar={() => setTela('novo')}
      />
    )

  return (
    <OrdensProducaoLista
      ops={ops}
      onNovo={() => setTela('novo')}
      onVer={id => { setActiveId(id); setTela('ver') }}
    />
  )
}
