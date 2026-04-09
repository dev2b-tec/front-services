'use client'

import { useState } from 'react'
import {
  Search, Calendar, Printer, Plus, MoreHorizontal,
  ArrowUpDown, ChevronDown, Download, Upload,
  Pencil, X, Info,
} from 'lucide-react'

// ─── Shared styles ──────────────────────────────────────────────────────────
const INP =
  'w-full bg-[var(--d2b-bg-main)] border border-[var(--d2b-border-strong)] rounded-md ' +
  'px-3 py-2 text-sm text-[var(--d2b-text-primary)] placeholder:text-[var(--d2b-text-muted)] ' +
  'focus:outline-none focus:border-[#7C4DFF] transition-colors'

const INP_READONLY =
  'w-full bg-[var(--d2b-bg-elevated)] border border-[var(--d2b-border)] rounded-md ' +
  'px-3 py-2 text-sm text-[var(--d2b-text-secondary)] outline-none'

const SEL =
  'w-full bg-[var(--d2b-bg-main)] border border-[var(--d2b-border-strong)] rounded-md ' +
  'px-3 py-2 text-sm text-[var(--d2b-text-primary)] ' +
  'focus:outline-none focus:border-[#7C4DFF] transition-colors appearance-none'

const LBL = 'block text-xs text-[var(--d2b-text-secondary)] mb-1'

const SEC = 'text-base font-semibold text-[var(--d2b-text-primary)] mb-4 mt-6 pb-2 border-b border-[var(--d2b-border)]'

const BTN_PRIMARY =
  'flex items-center gap-2 px-4 py-2.5 rounded-full text-sm font-bold text-white bg-[#7C4DFF] hover:bg-[#5B21B6] transition-colors'

const BTN_OUTLINE =
  'flex items-center gap-2 px-4 py-2 rounded-md text-sm font-medium border border-[var(--d2b-border-strong)] text-[var(--d2b-text-secondary)] hover:border-[#7C4DFF] hover:text-[var(--d2b-text-primary)] bg-transparent transition-colors'

// ─── Types ──────────────────────────────────────────────────────────────────
type StatusOrdem = 'em aberto' | 'em andamento' | 'atendida' | 'cancelada'
type Tela = 'lista' | 'novo' | 'ver'
type PagoTab = 'parcelas' | 'observacoes'

type ItemCompra = {
  id: string
  descricao: string
  sku: string
  gtin: string
  qtde: number
  un: string
  precoUn: number
  ipi: number
}

type OrdemCompra = {
  id: string
  numero: number
  data: string
  previsto: string
  fornecedor: string
  total: number
  status: StatusOrdem
  marcador: string
}

// ─── Mock ────────────────────────────────────────────────────────────────────
const MOCK_ORDENS: OrdemCompra[] = [
  {
    id: '1', numero: 1, data: '07/04/2026', previsto: '', fornecedor: 'BS TECNOLOGIA LTDA',
    total: 159, status: 'em aberto', marcador: 'yellow',
  },
]

const STATUS_COR: Record<StatusOrdem, string> = {
  'em aberto':   'bg-yellow-400',
  'em andamento':'bg-blue-400',
  'atendida':    'bg-emerald-400',
  'cancelada':   'bg-[var(--d2b-text-muted)]',
}

const STATUS_TEXT: Record<StatusOrdem, string> = {
  'em aberto':   'text-yellow-300',
  'em andamento':'text-blue-400',
  'atendida':    'text-emerald-400',
  'cancelada':   'text-[var(--d2b-text-muted)]',
}

// ═══════════════════════════════════════════════════════════════════════════
// LISTA
// ═══════════════════════════════════════════════════════════════════════════
type ListaTab = 'todos' | 'em aberto' | 'em andamento' | 'atendidas' | 'canceladas'

function OrdensCompraLista({
  onNovo, onVer,
}: { onNovo: () => void; onVer: (id: string) => void }) {
  const [tab, setTab]       = useState<ListaTab>('todos')
  const [busca, setBusca]   = useState('')
  const [maisAcoes, setMaisAcoes] = useState(false)

  const filtradas = MOCK_ORDENS.filter(o => {
    const q = busca.toLowerCase()
    const matchBusca = !q || o.fornecedor.toLowerCase().includes(q) || String(o.numero).includes(q)
    const matchTab =
      tab === 'todos'          ? true :
      tab === 'em aberto'      ? o.status === 'em aberto' :
      tab === 'em andamento'   ? o.status === 'em andamento' :
      tab === 'atendidas'      ? o.status === 'atendida' :
      tab === 'canceladas'     ? o.status === 'cancelada' : true
    return matchBusca && matchTab
  })

  const totalQtde  = filtradas.length
  const totalValor = filtradas.reduce((s, o) => s + o.total, 0)

  const TABS_DEF: { id: ListaTab; label: string; dot?: string }[] = [
    { id: 'todos',        label: 'todos'        },
    { id: 'em aberto',    label: 'em aberto',    dot: 'bg-yellow-400' },
    { id: 'em andamento', label: 'em andamento', dot: 'bg-blue-400'   },
    { id: 'atendidas',    label: 'atendidas',    dot: 'bg-emerald-400'},
    { id: 'canceladas',   label: 'canceladas',   dot: 'bg-[var(--d2b-text-muted)]' },
  ]

  const countOf = (t: ListaTab) => {
    if (t === 'todos') return MOCK_ORDENS.length
    if (t === 'em aberto') return MOCK_ORDENS.filter(o => o.status === 'em aberto').length
    if (t === 'em andamento') return MOCK_ORDENS.filter(o => o.status === 'em andamento').length
    if (t === 'atendidas') return MOCK_ORDENS.filter(o => o.status === 'atendida').length
    if (t === 'canceladas') return MOCK_ORDENS.filter(o => o.status === 'cancelada').length
    return 0
  }

  const TH = 'text-left px-3 py-3 text-xs font-semibold text-[var(--d2b-text-secondary)] uppercase tracking-wider whitespace-nowrap'

  return (
    <div className="flex flex-col h-full">

      {/* Cabeçalho */}
      <div className="flex items-center justify-between gap-4 px-8 pt-8 pb-3 flex-wrap">
        <div />
        <div className="flex items-center gap-2 relative">
          <button className={BTN_OUTLINE}>
            <Printer size={13} />
            imprimir
          </button>
          <button onClick={onNovo} className={BTN_PRIMARY}>
            <Plus size={14} />
            incluir ordem de compra
          </button>
          <button
            onClick={() => setMaisAcoes(v => !v)}
            className={BTN_OUTLINE + ' relative'}
          >
            mais ações
            <MoreHorizontal size={14} />
          </button>
          {maisAcoes && (
            <div className="absolute top-full right-0 mt-1 z-20 bg-[var(--d2b-bg-elevated)] border border-[var(--d2b-border-strong)] rounded-xl shadow-xl w-72 overflow-hidden">
              {[
                { icon: <Printer size={13} />,  label: 'imprimir relatório'                         },
                { icon: <Download size={13} />, label: 'exportar ordens de compra para planilha'    },
                { icon: <Upload size={13} />,   label: 'importar ordens de compra de uma planilha'  },
              ].map(item => (
                <button
                  key={item.label}
                  onClick={() => setMaisAcoes(false)}
                  className="w-full flex items-center gap-3 px-4 py-3 text-sm text-[var(--d2b-text-secondary)] hover:bg-[var(--d2b-hover)] hover:text-[var(--d2b-text-primary)] transition-colors"
                >
                  {item.icon}
                  {item.label}
                </button>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Título + busca */}
      <div className="px-8 pb-3">
        <h2 className="text-xl font-semibold text-[var(--d2b-text-primary)] mb-4">Ordens de compra</h2>
        <div className="flex items-center gap-2 flex-wrap">
          <div className="flex items-center gap-2 bg-[var(--d2b-bg-elevated)] border border-[var(--d2b-border)] rounded-lg px-3 h-9 w-80">
            <input
              value={busca}
              onChange={e => setBusca(e.target.value)}
              placeholder="Pesquise por fornecedor, nº do pedido ou ordem de co"
              className="bg-transparent text-sm text-[var(--d2b-text-primary)] placeholder:text-[var(--d2b-text-muted)] outline-none flex-1"
            />
            <Search size={13} className="text-[var(--d2b-text-muted)] shrink-0" />
          </div>
          <button className="flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs border border-[var(--d2b-border-strong)] text-[var(--d2b-text-secondary)] hover:border-[#7C4DFF] transition-colors">
            <Calendar size={12} />
            por período
          </button>
        </div>
      </div>

      {/* Abas */}
      <div className="flex items-end gap-0 border-b border-[var(--d2b-border)] px-8">
        {TABS_DEF.map(t => {
          const count = countOf(t.id)
          const active = tab === t.id
          return (
            <button
              key={t.id}
              onClick={() => setTab(t.id)}
              className={[
                'flex flex-col items-center px-4 pb-2.5 pt-2 border-b-2 -mb-px transition-colors gap-0.5',
                active
                  ? 'border-[#7C4DFF] text-[var(--d2b-text-primary)]'
                  : 'border-transparent text-[var(--d2b-text-secondary)] hover:text-[var(--d2b-text-primary)]',
              ].join(' ')}
            >
              <span className="flex items-center gap-1.5 text-sm font-medium">
                {t.dot && <span className={`w-2 h-2 rounded-full shrink-0 ${t.dot}`} />}
                {t.label}
              </span>
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
      <div className="flex-1 overflow-x-auto px-8 pt-4">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-[var(--d2b-border)]">
              <th className="px-3 py-3 w-8">
                <input type="checkbox" className="w-4 h-4 rounded accent-[#7C4DFF] cursor-pointer" />
              </th>
              <th className="w-6 px-1 py-3" />
              <th className={TH}>Número <ArrowUpDown size={10} className="inline mb-0.5 text-[var(--d2b-text-muted)]" /></th>
              <th className={TH}>Data <ArrowUpDown size={10} className="inline mb-0.5 text-[var(--d2b-text-muted)]" /></th>
              <th className={TH}>Previsto <ArrowUpDown size={10} className="inline mb-0.5 text-[var(--d2b-text-muted)]" /></th>
              <th className={TH}>Fornecedor <ArrowUpDown size={10} className="inline mb-0.5 text-[var(--d2b-text-muted)]" /></th>
              <th className={TH + ' text-right'}>Total <ArrowUpDown size={10} className="inline mb-0.5 text-[var(--d2b-text-muted)]" /></th>
              <th className={TH}>Marcadores</th>
              <th className={TH}>Integrações</th>
            </tr>
          </thead>
          <tbody>
            {filtradas.length === 0 ? (
              <tr>
                <td colSpan={9} className="px-3 py-14 text-center text-sm text-[var(--d2b-text-muted)]">
                  Nenhuma ordem encontrada.
                </td>
              </tr>
            ) : filtradas.map(o => (
              <tr key={o.id} className="border-b border-[var(--d2b-border)] hover:bg-[var(--d2b-hover)] transition-colors group">
                <td className="px-3 py-3">
                  <input type="checkbox" className="w-4 h-4 rounded accent-[#7C4DFF] cursor-pointer" />
                </td>
                <td className="px-1 py-3">
                  <span className="text-xs text-[var(--d2b-text-muted)] opacity-0 group-hover:opacity-100 cursor-pointer select-none">···</span>
                </td>
                <td className="px-3 py-3">
                  <span
                    className="font-medium text-[var(--d2b-text-primary)] hover:text-[#7C4DFF] cursor-pointer transition-colors"
                    onClick={() => onVer(o.id)}
                  >
                    {o.numero}
                  </span>
                </td>
                <td className="px-3 py-3 text-[var(--d2b-text-secondary)]">{o.data}</td>
                <td className="px-3 py-3 text-[var(--d2b-text-secondary)]">{o.previsto}</td>
                <td className="px-3 py-3 text-[var(--d2b-text-secondary)]">{o.fornecedor}</td>
                <td className="px-3 py-3 text-right text-[var(--d2b-text-primary)]">
                  {o.total.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                </td>
                <td className="px-3 py-3">
                  {o.marcador && (
                    <span className={`inline-block w-3 h-3 rounded-full ${o.marcador === 'yellow' ? 'bg-yellow-400' : 'bg-[#7C4DFF]'}`} />
                  )}
                </td>
                <td className="px-3 py-3" />
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Rodapé com totais */}
      <div className="px-8 py-3 border-t border-[var(--d2b-border)] flex items-center justify-end gap-6 text-sm text-[var(--d2b-text-secondary)]">
        <span>{totalQtde} quantidade</span>
        <span className="font-semibold text-[var(--d2b-text-primary)]">
          {totalValor.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
        </span>
        <span>valor total (R$)</span>
        <ArrowUpDown size={13} className="text-[var(--d2b-text-muted)] cursor-pointer" />
      </div>
    </div>
  )
}

// ═══════════════════════════════════════════════════════════════════════════
// FORMULÁRIO (novo / editar)
// ═══════════════════════════════════════════════════════════════════════════
const MOCK_PROXIMO_NUM = 2

function OrdensCompraForm({ onBack }: { onBack: () => void }) {
  const [fornecedor,    setFornecedor]    = useState('')
  const [dadosAberto,   setDadosAberto]   = useState(false)
  const [condPgto,      setCondPgto]      = useState('')
  const [categoria,     setCategoria]     = useState('')
  const [transportador, setTransportador] = useState('')
  const [fretePorConta, setFretePorConta] = useState('Contratação do Frete por conta do Remetente (CIF)')
  const [observacoes,   setObservacoes]   = useState('')
  const [marcadores,    setMarcadores]    = useState('')
  const [obsInternas,   setObsInternas]   = useState('')
  const [itens, setItens] = useState<ItemCompra[]>([
    { id: '1', descricao: '', sku: '', gtin: '', qtde: 0, un: '', precoUn: 0, ipi: 0 },
  ])

  const totalProdutos = itens.reduce((s, i) => s + i.qtde * i.precoUn, 0)
  const somaQtdes     = itens.reduce((s, i) => s + i.qtde, 0)

  function addItem() {
    setItens(prev => [...prev, { id: String(Date.now()), descricao: '', sku: '', gtin: '', qtde: 0, un: '', precoUn: 0, ipi: 0 }])
  }

  function removeItem(id: string) {
    setItens(prev => prev.filter(i => i.id !== id))
  }

  function updateItem(id: string, field: keyof ItemCompra, value: string | number) {
    setItens(prev => prev.map(i => i.id === id ? { ...i, [field]: value } : i))
  }

  const TH = 'text-left px-2 py-2 text-xs font-semibold text-[var(--d2b-text-secondary)] uppercase tracking-wider whitespace-nowrap'

  return (
    <div className="flex flex-col h-full overflow-y-auto">
      <div className="max-w-4xl px-8 py-8">

        <h1 className="text-xl font-semibold text-[var(--d2b-text-primary)] mb-6">Ordem de Compra</h1>

        {/* Fornecedor + Número */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 items-end">
          <div className="md:col-span-3">
            <label className={LBL}>Fornecedor</label>
            <div className="relative">
              <input
                className={INP + ' pr-9'}
                placeholder="Pesquise pelas iniciais do nome do fornecedor"
                value={fornecedor}
                onChange={e => { setFornecedor(e.target.value); setDadosAberto(e.target.value.length > 2) }}
              />
              <Search size={13} className="absolute right-3 top-1/2 -translate-y-1/2 text-[var(--d2b-text-muted)]" />
            </div>
            <div className="flex items-center gap-4 mt-1.5">
              <button className="text-xs text-[#7C4DFF] hover:text-[#A98EFF] transition-colors">dados do fornecedor</button>
              <button className="text-xs text-[#7C4DFF] hover:text-[#A98EFF] transition-colors">ver últimas compras</button>
              <button className="text-xs text-[#7C4DFF] hover:text-[#A98EFF] transition-colors">pessoas de contato</button>
            </div>
          </div>
          <div>
            <label className={LBL}>Número</label>
            <input className={INP_READONLY} readOnly value={MOCK_PROXIMO_NUM} />
          </div>
        </div>

        {/* Dados do fornecedor (expande quando busca) */}
        {dadosAberto && (
          <div className="mt-5 p-5 border border-[var(--d2b-border-strong)] rounded-xl bg-[var(--d2b-bg-elevated)] space-y-4">
            <h3 className="text-sm font-semibold text-[var(--d2b-text-primary)]">Dados do fornecedor</h3>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
              <div>
                <label className={LBL}>Tipo de Pessoa</label>
                <div className="relative">
                  <select className={SEL}><option>Pessoa Jurídica</option><option>Pessoa Física</option></select>
                  <ChevronDown size={11} className="absolute right-2 top-1/2 -translate-y-1/2 text-[var(--d2b-text-muted)] pointer-events-none" />
                </div>
              </div>
              <div>
                <label className={LBL}>CNPJ</label>
                <input className={INP} placeholder="" />
              </div>
              <div>
                <label className={LBL}>Contribuinte</label>
                <div className="relative">
                  <select className={SEL}><option>Não informado</option></select>
                  <ChevronDown size={11} className="absolute right-2 top-1/2 -translate-y-1/2 text-[var(--d2b-text-muted)] pointer-events-none" />
                </div>
              </div>
              <div>
                <label className={LBL}>Inscrição Estadual</label>
                <input className={INP} placeholder="" />
              </div>
            </div>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
              <div>
                <label className={LBL}>CEP</label>
                <div className="relative">
                  <input className={INP + ' pr-8'} placeholder="" />
                  <Search size={11} className="absolute right-2 top-1/2 -translate-y-1/2 text-[var(--d2b-text-muted)]" />
                </div>
              </div>
              <div className="md:col-span-2">
                <label className={LBL}>Cidade</label>
                <input className={INP} placeholder="" />
              </div>
              <div>
                <label className={LBL}>UF</label>
                <div className="relative">
                  <select className={SEL}><option>PE</option></select>
                  <ChevronDown size={11} className="absolute right-2 top-1/2 -translate-y-1/2 text-[var(--d2b-text-muted)] pointer-events-none" />
                </div>
              </div>
            </div>
            <div>
              <label className={LBL}>Endereço</label>
              <input className={INP} placeholder="" />
            </div>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
              <div><label className={LBL}>Bairro</label><input className={INP} /></div>
              <div><label className={LBL}>Número</label><input className={INP} /></div>
              <div><label className={LBL}>Complemento</label><input className={INP} /></div>
            </div>
            <div className="grid grid-cols-3 gap-3">
              <div><label className={LBL}>Telefone</label><input className={INP} /></div>
              <div><label className={LBL}>Celular</label><input className={INP} /></div>
              <div><label className={LBL}>Email</label><input type="email" className={INP} /></div>
            </div>
          </div>
        )}

        {/* Itens da compra */}
        <h2 className={SEC}>Itens da compra</h2>
        <div className="rounded-lg border border-[var(--d2b-border)] overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-[var(--d2b-bg-elevated)] border-b border-[var(--d2b-border)]">
                <th className={TH + ' w-56'}>Item</th>
                <th className={TH + ' w-20'}>Cód (SKU)</th>
                <th className={TH + ' w-20'}>GTIN/EAN</th>
                <th className={TH + ' w-16'}>Qtde</th>
                <th className={TH + ' w-14'}>UN</th>
                <th className={TH + ' w-20 text-right'}>Preço un</th>
                <th className={TH + ' w-16 text-right'}>IPI %</th>
                <th className={TH + ' w-20 text-right'}>Preço total</th>
                <th className={TH + ' w-16'}>Ações</th>
              </tr>
            </thead>
            <tbody>
              {itens.map(item => (
                <tr key={item.id} className="border-b border-[var(--d2b-border)]">
                  <td className="px-2 py-2">
                    <input className={INP} placeholder="Pesquise por descrição, código (SKU) ou" value={item.descricao} onChange={e => updateItem(item.id, 'descricao', e.target.value)} />
                  </td>
                  <td className="px-2 py-2">
                    <input className={INP} value={item.sku} onChange={e => updateItem(item.id, 'sku', e.target.value)} />
                  </td>
                  <td className="px-2 py-2">
                    <input className={INP_READONLY} readOnly value={item.gtin} />
                  </td>
                  <td className="px-2 py-2">
                    <input type="number" min={0} className={INP} value={item.qtde || ''} onChange={e => updateItem(item.id, 'qtde', parseFloat(e.target.value) || 0)} />
                  </td>
                  <td className="px-2 py-2">
                    <input className={INP_READONLY} readOnly value={item.un} />
                  </td>
                  <td className="px-2 py-2">
                    <input type="number" min={0} className={INP + ' text-right'} value={item.precoUn || ''} onChange={e => updateItem(item.id, 'precoUn', parseFloat(e.target.value) || 0)} />
                  </td>
                  <td className="px-2 py-2">
                    <input type="number" min={0} className={INP + ' text-right'} value={item.ipi || ''} onChange={e => updateItem(item.id, 'ipi', parseFloat(e.target.value) || 0)} />
                  </td>
                  <td className="px-2 py-2 text-right text-[var(--d2b-text-primary)]">
                    {(item.qtde * item.precoUn).toFixed(2)}
                  </td>
                  <td className="px-2 py-2">
                    <div className="flex items-center gap-1">
                      <button className="text-xs text-[#7C4DFF] hover:underline">salvar</button>
                      <button onClick={() => removeItem(item.id)} className="p-1 text-[var(--d2b-text-muted)] hover:text-red-400 transition-colors">
                        <X size={13} />
                      </button>
                      <Info size={13} className="text-[var(--d2b-text-muted)]" />
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <div className="mt-2 flex items-center gap-4">
          <button onClick={addItem} className="flex items-center gap-1.5 text-sm text-[#7C4DFF] hover:text-[#A98EFF] transition-colors">
            <Plus size={13} />
            adicionar item
          </button>
          <button className="flex items-center gap-1.5 text-sm text-[#7C4DFF] hover:text-[#A98EFF] transition-colors">
            <Search size={13} />
            busca avançada de itens
          </button>
        </div>

        {/* Totais da compra */}
        <h2 className={SEC}>Totais da compra</h2>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          <div>
            <label className={LBL}>Nº de itens</label>
            <input className={INP_READONLY} readOnly value={itens.length} />
          </div>
          <div>
            <label className={LBL}>Soma das qtdes</label>
            <input className={INP_READONLY} readOnly value={somaQtdes} />
          </div>
          <div>
            <label className={LBL}>Total dos produtos</label>
            <input className={INP_READONLY} readOnly value={`R$ ${totalProdutos.toFixed(2)}`} />
          </div>
          <div>
            <label className={LBL}>Desconto</label>
            <input className={INP} defaultValue="0" />
          </div>
          <div>
            <label className={LBL}>Frete</label>
            <input className={INP} placeholder="R$  Valor do frete" />
          </div>
          <div>
            <label className={LBL}>Total do IPI</label>
            <input className={INP_READONLY} readOnly value="R$" />
          </div>
          <div>
            <label className={LBL}>Total ICMS ST</label>
            <input className={INP_READONLY} readOnly value="R$" />
          </div>
          <div>
            <label className={LBL}>Total geral</label>
            <input className={INP_READONLY} readOnly value="R$" />
          </div>
        </div>

        {/* Detalhes da compra */}
        <h2 className={SEC}>Detalhes da compra</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <label className={LBL}>Nº no fornecedor</label>
            <input className={INP} placeholder="Número" />
          </div>
          <div>
            <label className={LBL}>Data da compra</label>
            <div className="relative">
              <input type="text" className={INP + ' pr-9'} defaultValue="07/04/2026" />
              <Calendar size={13} className="absolute right-3 top-1/2 -translate-y-1/2 text-[var(--d2b-text-muted)]" />
            </div>
          </div>
          <div>
            <label className={LBL}>Data prevista</label>
            <div className="relative">
              <input type="text" className={INP + ' pr-9'} placeholder="(dd/mm/aaaa)" />
              <Calendar size={13} className="absolute right-3 top-1/2 -translate-y-1/2 text-[var(--d2b-text-muted)]" />
            </div>
          </div>
        </div>

        {/* Pagamento */}
        <h2 className={SEC}>Pagamento</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className={LBL}>Condição de pagamento</label>
            <div className="flex items-center gap-2">
              <input
                className={INP + ' flex-1'}
                placeholder=""
                value={condPgto}
                onChange={e => setCondPgto(e.target.value)}
              />
              <button className={BTN_OUTLINE + ' shrink-0 text-xs'}>
                gerar parcelas
              </button>
            </div>
            <p className="text-xs text-[var(--d2b-text-muted)] mt-1">
              Número de parcelas ou prazos. Exemplos: 30 60, 3x ou 15 +2x
            </p>
          </div>
          <div>
            <label className={LBL}>Categoria</label>
            <div className="relative">
              <select className={SEL} value={categoria} onChange={e => setCategoria(e.target.value)}>
                <option value="">Selecione</option>
              </select>
              <ChevronDown size={13} className="absolute right-3 top-1/2 -translate-y-1/2 text-[var(--d2b-text-muted)] pointer-events-none" />
            </div>
            <p className="text-xs text-[var(--d2b-text-muted)] mt-1">Categoria da receita ou despesa</p>
          </div>
        </div>

        {/* Transportador */}
        <h2 className={SEC}>Transportador</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className={LBL}>Nome</label>
            <input className={INP} value={transportador} onChange={e => setTransportador(e.target.value)} placeholder="" />
          </div>
          <div>
            <label className={LBL}>Frete por conta</label>
            <div className="relative">
              <select className={SEL} value={fretePorConta} onChange={e => setFretePorConta(e.target.value)}>
                <option>Contratação do Frete por conta do Remetente (CIF)</option>
                <option>Contratação do Frete por conta do Destinatário (FOB)</option>
                <option>Sem frete</option>
              </select>
              <ChevronDown size={13} className="absolute right-3 top-1/2 -translate-y-1/2 text-[var(--d2b-text-muted)] pointer-events-none" />
            </div>
          </div>
        </div>

        {/* Observações */}
        <h2 className={SEC}>Observações</h2>
        <textarea
          className={INP + ' min-h-[80px] resize-y'}
          value={observacoes}
          onChange={e => setObservacoes(e.target.value)}
        />

        {/* Marcadores */}
        <div className="mt-4">
          <label className={LBL}>Marcadores</label>
          <input
            className={INP}
            placeholder=""
            value={marcadores}
            onChange={e => setMarcadores(e.target.value)}
          />
          <p className="text-xs text-[var(--d2b-text-muted)] mt-1">Separados por vírgula ou tab</p>
        </div>

        {/* Observações Internas */}
        <h2 className={SEC}>Observações Internas</h2>
        <textarea
          className={INP + ' min-h-[80px] resize-y'}
          value={obsInternas}
          onChange={e => setObsInternas(e.target.value)}
        />

        {/* Ações */}
        <div className="mt-8 flex items-center gap-4 pb-8">
          <button onClick={onBack} className={BTN_PRIMARY}>salvar</button>
          <button onClick={onBack} className="text-sm text-[var(--d2b-text-secondary)] hover:text-[var(--d2b-text-primary)] transition-colors">cancelar</button>
        </div>
      </div>
    </div>
  )
}

// ═══════════════════════════════════════════════════════════════════════════
// VISUALIZAÇÃO (somente leitura)
// ═══════════════════════════════════════════════════════════════════════════
const MOCK_ORDEM_DETALHE = {
  id: '1',
  numero: 1,
  status: 'em aberto' as StatusOrdem,
  fornecedor: 'BS TECNOLOGIA LTDA',
  dataCom: '07/04/2026',
  itens: [
    { id: '1', descricao: 'Teste', sku: '', gtin: '', qtde: 1, un: '', precoUn: 150, ipi: 0 },
  ],
  desconto: 1,
  frete: 10,
  totalIpi: 0,
  totalIcms: 0,
  fretePorConta: 'Contratação do Frete por conta do Remetente (CIF)',
}

function OrdensCompraDetalhe({ id, onBack, onEditar }: { id: string; onBack: () => void; onEditar: () => void }) {
  const o = MOCK_ORDEM_DETALHE
  const [pagoTab, setPagoTab] = useState<PagoTab>('parcelas')

  const totalProd = o.itens.reduce((s, i) => s + i.qtde * i.precoUn, 0)
  const somaQtdes = o.itens.reduce((s, i) => s + i.qtde, 0)
  const totalGeral = totalProd - o.desconto + o.frete

  const TH = 'text-left px-3 py-3 text-xs font-semibold text-[var(--d2b-text-secondary)] uppercase tracking-wider whitespace-nowrap'
  const VAL = 'text-sm text-[var(--d2b-text-primary)]'
  const LBL_V = 'text-xs text-[var(--d2b-text-muted)] mb-0.5'

  return (
    <div className="flex flex-col h-full">
      {/* Top bar */}
      <div className="flex items-center justify-between px-8 py-3 border-b border-[var(--d2b-border)] bg-[var(--d2b-bg-surface)]">
        <button onClick={onBack} className="text-xs text-[var(--d2b-text-muted)] hover:text-[var(--d2b-text-primary)] flex items-center gap-1">
          ← voltar
        </button>
        <div className="flex items-center gap-2">
          <button onClick={onEditar} className={BTN_PRIMARY}>
            <Pencil size={13} />
            editar
          </button>
          <button className={BTN_OUTLINE}>
            ações <MoreHorizontal size={13} />
          </button>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto px-8 py-8 max-w-4xl">
        <h1 className="text-xl font-semibold text-[var(--d2b-text-primary)] mb-1">Ordem de Compra</h1>
        <span className={`inline-flex items-center gap-1.5 text-xs font-medium mb-6 ${STATUS_TEXT[o.status]}`}>
          <span className={`w-2 h-2 rounded-full ${STATUS_COR[o.status]}`} />
          {o.status}
        </span>

        {/* Fornecedor + Número */}
        <div className="grid grid-cols-4 gap-4 mb-4 border-b border-[var(--d2b-border)] pb-5">
          <div className="col-span-3">
            <p className={LBL_V}>Fornecedor</p>
            <p className={VAL + ' font-semibold'}>{o.fornecedor}</p>
            <div className="flex items-center gap-4 mt-1">
              <button className="text-xs text-[#7C4DFF] hover:text-[#A98EFF]">dados do fornecedor</button>
              <button className="text-xs text-[#7C4DFF] hover:text-[#A98EFF]">ver últimas compras</button>
              <button className="text-xs text-[#7C4DFF] hover:text-[#A98EFF]">pessoas de contato</button>
            </div>
          </div>
          <div>
            <p className={LBL_V}>Número</p>
            <p className={VAL}>{o.numero}</p>
          </div>
        </div>

        {/* Itens */}
        <h2 className="text-base font-semibold text-[var(--d2b-text-primary)] mb-3">Itens da compra</h2>
        <div className="rounded-lg border border-[var(--d2b-border)] overflow-x-auto mb-6">
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-[var(--d2b-bg-elevated)] border-b border-[var(--d2b-border)]">
                <th className={TH}>Item</th>
                <th className={TH}>Cód (SKU)</th>
                <th className={TH}>GTIN/EAN</th>
                <th className={TH + ' text-right'}>Qtde</th>
                <th className={TH}>UN</th>
                <th className={TH + ' text-right'}>Preço un</th>
                <th className={TH + ' text-right'}>IPI %</th>
                <th className={TH + ' text-right'}>Preço total</th>
                <th className="w-6" />
              </tr>
            </thead>
            <tbody>
              {o.itens.map(item => (
                <tr key={item.id} className="border-b border-[var(--d2b-border)]">
                  <td className="px-3 py-3 text-[var(--d2b-text-primary)]">{item.descricao}</td>
                  <td className="px-3 py-3 text-[var(--d2b-text-secondary)]">{item.sku}</td>
                  <td className="px-3 py-3 text-[var(--d2b-text-secondary)]">{item.gtin}</td>
                  <td className="px-3 py-3 text-right text-[var(--d2b-text-primary)]">{item.qtde.toFixed(2)}</td>
                  <td className="px-3 py-3 text-[var(--d2b-text-secondary)]">{item.un}</td>
                  <td className="px-3 py-3 text-right text-[var(--d2b-text-primary)]">{item.precoUn.toFixed(2)}</td>
                  <td className="px-3 py-3 text-right text-[var(--d2b-text-primary)]">{item.ipi.toFixed(2)}</td>
                  <td className="px-3 py-3 text-right text-[var(--d2b-text-primary)]">{(item.qtde * item.precoUn).toFixed(2)}</td>
                  <td className="px-3 py-3"><Info size={13} className="text-[var(--d2b-text-muted)]" /></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Totais */}
        <h2 className="text-base font-semibold text-[var(--d2b-text-primary)] mb-3">Totais da compra</h2>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6 border-b border-[var(--d2b-border)] pb-6">
          {[
            { label: 'Nº de itens',         val: String(o.itens.length) },
            { label: 'Soma das qtdes',       val: somaQtdes.toFixed(2) },
            { label: 'Total dos produtos',   val: `R$ ${totalProd.toFixed(2)}` },
            { label: 'Desconto',             val: String(o.desconto) },
            { label: 'Frete',                val: `R$ ${o.frete.toFixed(2)}` },
            { label: 'Total do IPI',         val: `R$ ${o.totalIpi.toFixed(2)}` },
            { label: 'Total ICMS ST',        val: `R$ ${o.totalIcms.toFixed(2)}` },
            { label: 'Total geral',          val: `R$ ${totalGeral.toFixed(2)}` },
          ].map(r => (
            <div key={r.label}>
              <p className={LBL_V}>{r.label}</p>
              <p className={VAL}>{r.val}</p>
            </div>
          ))}
        </div>

        {/* Detalhes */}
        <h2 className="text-base font-semibold text-[var(--d2b-text-primary)] mb-3">Detalhes da compra</h2>
        <div className="mb-6 border-b border-[var(--d2b-border)] pb-6">
          <p className={LBL_V}>Data da compra</p>
          <p className={VAL}>{o.dataCom}</p>
        </div>

        {/* Pagamento */}
        <h2 className="text-base font-semibold text-[var(--d2b-text-primary)] mb-3">Pagamento</h2>
        <div className="mb-6 border-b border-[var(--d2b-border)] pb-6">
          <div className="flex items-end gap-0 border-b border-[var(--d2b-border)] mb-4">
            {(['parcelas', 'observacoes'] as PagoTab[]).map(t => (
              <button
                key={t}
                onClick={() => setPagoTab(t)}
                className={[
                  'px-4 py-2 text-sm font-medium border-b-2 -mb-px transition-colors',
                  pagoTab === t
                    ? 'border-[#7C4DFF] text-[var(--d2b-text-primary)]'
                    : 'border-transparent text-[var(--d2b-text-secondary)] hover:text-[var(--d2b-text-primary)]',
                ].join(' ')}
              >
                {t === 'parcelas' ? 'parcelas' : 'observações das parcelas'}
              </button>
            ))}
          </div>
          {pagoTab === 'parcelas' && (
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-[var(--d2b-border)]">
                  {['Nº', 'Dias', 'Data', 'Valor', 'Enviar para', 'Meio de Pagamento da NFe', 'Observação'].map(h => (
                    <th key={h} className="text-left px-3 py-2.5 text-xs font-semibold text-[var(--d2b-text-secondary)] uppercase tracking-wider">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td colSpan={7} className="px-3 py-6 text-center text-xs text-[var(--d2b-text-muted)]">Nenhuma parcela cadastrada.</td>
                </tr>
              </tbody>
            </table>
          )}
          {pagoTab === 'observacoes' && (
            <p className="text-sm text-[var(--d2b-text-muted)] py-4">Sem observações nas parcelas.</p>
          )}
        </div>

        {/* Transportador */}
        <h2 className="text-base font-semibold text-[var(--d2b-text-primary)] mb-3">Transportador</h2>
        <div className="mb-6 border-b border-[var(--d2b-border)] pb-6">
          <p className={LBL_V}>Frete por conta</p>
          <p className={VAL}>{o.fretePorConta}</p>
        </div>

        {/* Observações */}
        <h2 className="text-base font-semibold text-[var(--d2b-text-primary)] mb-2">Observações</h2>
        <p className="text-sm text-[var(--d2b-text-muted)] mb-6 border-b border-[var(--d2b-border)] pb-6">-</p>

        {/* Obs Internas */}
        <h2 className="text-base font-semibold text-[var(--d2b-text-primary)] mb-2">Observações Internas</h2>
        <p className="text-sm text-[var(--d2b-text-muted)]">-</p>
      </div>
    </div>
  )
}

// ═══════════════════════════════════════════════════════════════════════════
// ROOT — gerencia navegação interna
// ═══════════════════════════════════════════════════════════════════════════
export function OrdensCompraContent() {
  const [tela, setTela]        = useState<Tela>('lista')
  const [ordemId, setOrdemId]  = useState<string | null>(null)

  if (tela === 'novo') {
    return <OrdensCompraForm onBack={() => setTela('lista')} />
  }

  if (tela === 'ver' && ordemId) {
    return (
      <OrdensCompraDetalhe
        id={ordemId}
        onBack={() => { setOrdemId(null); setTela('lista') }}
        onEditar={() => setTela('novo')}
      />
    )
  }

  return (
    <OrdensCompraLista
      onNovo={() => setTela('novo')}
      onVer={id => { setOrdemId(id); setTela('ver') }}
    />
  )
}
