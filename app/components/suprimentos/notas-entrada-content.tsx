'use client'

import { useState } from 'react'
import {
  Search, Calendar, Plus, MoreHorizontal, ArrowUpDown,
  ChevronDown, Pencil, Download, SlidersHorizontal, X,
  Filter, RotateCcw,
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

const LBL = 'block text-xs text-[var(--d2b-text-secondary)] mb-1'
const SEC = 'text-base font-semibold text-[var(--d2b-text-primary)] mb-4 mt-6 pb-2 border-b border-[var(--d2b-border)]'

const BTN_PRIMARY =
  'flex items-center gap-2 px-4 py-2.5 rounded-full text-sm font-bold text-white bg-[#7C4DFF] hover:bg-[#5B21B6] transition-colors'

const BTN_OUTLINE =
  'flex items-center gap-2 px-4 py-2 rounded-md text-sm font-medium border border-[var(--d2b-border-strong)] ' +
  'text-[var(--d2b-text-secondary)] hover:border-[#7C4DFF] hover:text-[var(--d2b-text-primary)] bg-transparent transition-colors'

// ─── Types ───────────────────────────────────────────────────────────────────
type Tela = 'lista' | 'novo' | 'ver'
type ListaTab = 'todas' | 'pendentes' | 'registradas' | 'emitidas' | 'canceladas'
type ProdTab = 'produtos' | 'impostos'
type PagTab = 'parcelas' | 'observacoes'
type ItemDrawerTab = 'dados' | 'icms' | 'ipi' | 'pis' | 'cofins' | 'importacao' | 'outros' | 'estoque' | 'comissao'

type ItemNota = {
  id: string
  descricao: string
  sku: string
  un: string
  qtde: number
  precoUn: number
}

type NotaEntrada = {
  id: string
  numero: string
  dataEmissao: string
  remetente: string
  uf: string
  valor: number
  status: 'pendente' | 'registrada' | 'emitida' | 'cancelada'
}

// ─── Mock ─────────────────────────────────────────────────────────────────────
const MOCK_NOTAS: NotaEntrada[] = [
  { id: '1', numero: '222222222', dataEmissao: '07/04/2026', remetente: 'JESSE', uf: 'PE', valor: 999, status: 'registrada' },
]

const STATUS_DOT: Record<NotaEntrada['status'], string> = {
  pendente:    'bg-yellow-400',
  registrada:  'bg-blue-400',
  emitida:     'bg-emerald-400',
  cancelada:   'bg-[var(--d2b-text-muted)] opacity-50',
}

// ═══════════════════════════════════════════════════════════════════════════
// LISTA
// ═══════════════════════════════════════════════════════════════════════════
function NotasEntradaLista({ onNovo, onVer }: { onNovo: () => void; onVer: (id: string) => void }) {
  const [tab, setTab]   = useState<ListaTab>('todas')
  const [busca, setBusca] = useState('')
  const [maisAcoes, setMaisAcoes] = useState(false)

  const countOf = (t: ListaTab) => {
    if (t === 'todas')      return MOCK_NOTAS.length
    if (t === 'pendentes')  return MOCK_NOTAS.filter(n => n.status === 'pendente').length
    if (t === 'registradas')return MOCK_NOTAS.filter(n => n.status === 'registrada').length
    if (t === 'emitidas')   return MOCK_NOTAS.filter(n => n.status === 'emitida').length
    if (t === 'canceladas') return MOCK_NOTAS.filter(n => n.status === 'cancelada').length
    return 0
  }

  const filtradas = MOCK_NOTAS.filter(n => {
    const q = busca.toLowerCase()
    const matchBusca = !q || n.numero.includes(q) || n.remetente.toLowerCase().includes(q)
    const matchTab =
      tab === 'todas'       ? true :
      tab === 'pendentes'   ? n.status === 'pendente' :
      tab === 'registradas' ? n.status === 'registrada' :
      tab === 'emitidas'    ? n.status === 'emitida' :
      tab === 'canceladas'  ? n.status === 'cancelada' : true
    return matchBusca && matchTab
  })

  const totalValor = filtradas.reduce((s, n) => s + n.valor, 0)

  const TABS: { id: ListaTab; label: string; dot?: string }[] = [
    { id: 'todas',       label: 'todas'       },
    { id: 'pendentes',   label: 'pendentes',   dot: 'bg-yellow-400'  },
    { id: 'registradas', label: 'registradas', dot: 'bg-blue-400'    },
    { id: 'emitidas',    label: 'emitidas',    dot: 'bg-emerald-400' },
    { id: 'canceladas',  label: 'canceladas',  dot: 'bg-[var(--d2b-text-muted)] opacity-50' },
  ]

  const TH = 'text-left px-3 py-3 text-xs font-semibold text-[var(--d2b-text-secondary)] uppercase tracking-wider whitespace-nowrap'

  return (
    <div className="flex flex-col h-full">

      {/* Top bar */}
      <div className="flex items-center justify-between gap-3 px-8 pt-8 pb-3 flex-wrap">
        <div />
        <div className="flex items-center gap-2 relative">
          <button className={BTN_OUTLINE}>
            <Download size={13} />
            importar XML da NFe
          </button>
          <button onClick={onNovo} className={BTN_PRIMARY}>
            <Plus size={14} />
            incluir nota fiscal
          </button>
          <button onClick={() => setMaisAcoes(v => !v)} className={BTN_OUTLINE}>
            mais ações <MoreHorizontal size={14} />
          </button>
          {maisAcoes && (
            <div className="absolute top-full right-0 mt-1 z-20 bg-[var(--d2b-bg-elevated)] border border-[var(--d2b-border-strong)] rounded-xl shadow-xl w-64 overflow-hidden">
              {['exportar notas para planilha', 'importar notas de planilha', 'configurações'].map(l => (
                <button key={l} onClick={() => setMaisAcoes(false)}
                  className="w-full flex items-center px-4 py-3 text-sm text-[var(--d2b-text-secondary)] hover:bg-[var(--d2b-hover)] hover:text-[var(--d2b-text-primary)] transition-colors">
                  {l}
                </button>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Título + busca */}
      <div className="px-8 pb-3">
        <h2 className="text-xl font-semibold text-[var(--d2b-text-primary)] mb-4">Notas Fiscais de Entrada</h2>
        <div className="flex items-center gap-2 flex-wrap">
          <div className="flex items-center gap-2 bg-[var(--d2b-bg-elevated)] border border-[var(--d2b-border)] rounded-lg px-3 h-9 w-72">
            <input
              value={busca}
              onChange={e => setBusca(e.target.value)}
              placeholder="Pesquise por cliente ou número"
              className="bg-transparent text-sm text-[var(--d2b-text-primary)] placeholder:text-[var(--d2b-text-muted)] outline-none flex-1"
            />
            <Search size={13} className="text-[var(--d2b-text-muted)] shrink-0" />
          </div>
          <button className="flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs border border-[var(--d2b-border-strong)] text-[var(--d2b-text-secondary)] hover:border-[#7C4DFF] transition-colors">
            <Calendar size={12} />
            Últimos 30 dias
          </button>
          <button className="flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs border border-[var(--d2b-border-strong)] text-[var(--d2b-text-secondary)] hover:border-[#7C4DFF] transition-colors">
            <ArrowUpDown size={12} />
            data de emissão
          </button>
          <button className="flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs border border-[var(--d2b-border-strong)] text-[var(--d2b-text-secondary)] hover:border-[#7C4DFF] transition-colors">
            <Filter size={12} />
            filtros
          </button>
          <button className="flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs text-[var(--d2b-text-muted)] hover:text-[var(--d2b-text-secondary)] transition-colors">
            <RotateCcw size={12} />
            limpar filtros
          </button>
        </div>
      </div>

      {/* Abas */}
      <div className="flex items-end border-b border-[var(--d2b-border)] px-8">
        {TABS.map(t => {
          const count = countOf(t.id)
          const active = tab === t.id
          return (
            <button key={t.id} onClick={() => setTab(t.id)}
              className={[
                'flex flex-col items-center px-4 pb-2.5 pt-2 border-b-2 -mb-px transition-colors gap-0.5',
                active ? 'border-[#7C4DFF] text-[var(--d2b-text-primary)]' : 'border-transparent text-[var(--d2b-text-secondary)] hover:text-[var(--d2b-text-primary)]',
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
        <div className="ml-auto pb-2">
          <button className="p-1.5 rounded text-[var(--d2b-text-muted)] hover:text-[var(--d2b-text-primary)] border border-[var(--d2b-border)] transition-colors">
            <SlidersHorizontal size={13} />
          </button>
        </div>
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
              <th className="text-left px-3 py-3 text-xs font-semibold text-[var(--d2b-text-secondary)] uppercase tracking-wider">Nº <ArrowUpDown size={10} className="inline mb-0.5 text-[var(--d2b-text-muted)]" /></th>
              <th className="text-left px-3 py-3 text-xs font-semibold text-[var(--d2b-text-secondary)] uppercase tracking-wider">Data emissão <ArrowUpDown size={10} className="inline mb-0.5 text-[var(--d2b-text-muted)]" /></th>
              <th className="text-left px-3 py-3 text-xs font-semibold text-[var(--d2b-text-secondary)] uppercase tracking-wider">Remetente <ArrowUpDown size={10} className="inline mb-0.5 text-[var(--d2b-text-muted)]" /></th>
              <th className="text-left px-3 py-3 text-xs font-semibold text-[var(--d2b-text-secondary)] uppercase tracking-wider">UF <ArrowUpDown size={10} className="inline mb-0.5 text-[var(--d2b-text-muted)]" /></th>
              <th className="text-right px-3 py-3 text-xs font-semibold text-[var(--d2b-text-secondary)] uppercase tracking-wider">Valor <ArrowUpDown size={10} className="inline mb-0.5 text-[var(--d2b-text-muted)]" /></th>
              <th className={TH}>Marcadores</th>
              <th className={TH}>Integrações</th>
            </tr>
          </thead>
          <tbody>
            {filtradas.length === 0 ? (
              <tr>
                <td colSpan={9} className="px-3 py-14 text-center text-sm text-[var(--d2b-text-muted)]">Nenhuma nota encontrada.</td>
              </tr>
            ) : filtradas.map(n => (
              <tr key={n.id} className="border-b border-[var(--d2b-border)] hover:bg-[var(--d2b-hover)] transition-colors group">
                <td className="px-3 py-3"><input type="checkbox" className="w-4 h-4 rounded accent-[#7C4DFF] cursor-pointer" /></td>
                <td className="px-1 py-3"><span className="text-xs text-[var(--d2b-text-muted)] opacity-0 group-hover:opacity-100 cursor-pointer select-none">···</span></td>
                <td className="px-3 py-3">
                  <span onClick={() => onVer(n.id)} className="font-medium text-[var(--d2b-text-primary)] hover:text-[#7C4DFF] cursor-pointer transition-colors">
                    {n.numero}
                  </span>
                </td>
                <td className="px-3 py-3 text-[var(--d2b-text-secondary)]">{n.dataEmissao}</td>
                <td className="px-3 py-3 text-[var(--d2b-text-secondary)]">{n.remetente}</td>
                <td className="px-3 py-3 text-[var(--d2b-text-secondary)]">{n.uf}</td>
                <td className="px-3 py-3 text-right text-[var(--d2b-text-primary)]">
                  {n.valor.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                </td>
                <td className="px-3 py-3">
                  <span className={`inline-block w-3 h-3 rounded-full ${STATUS_DOT[n.status]}`} />
                </td>
                <td className="px-3 py-3" />
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Rodapé */}
      <div className="px-8 py-3 border-t border-[var(--d2b-border)] flex items-center justify-end gap-6 text-sm text-[var(--d2b-text-secondary)]">
        <span>{filtradas.length.toString().padStart(2, '0')} quantidade</span>
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
// DRAWER DE ITEM (painel lateral direito)
// ═══════════════════════════════════════════════════════════════════════════
function ItemDrawer({ descricao, onClose }: { descricao: string; onClose: () => void }) {
  const [tab, setTab] = useState<ItemDrawerTab>('dados')

  const DRAWER_TABS: { id: ItemDrawerTab; label: string }[] = [
    { id: 'dados',       label: 'dados do item' },
    { id: 'icms',        label: 'ICMS'          },
    { id: 'ipi',         label: 'IPI'           },
    { id: 'pis',         label: 'PIS'           },
    { id: 'cofins',      label: 'COFINS'        },
    { id: 'importacao',  label: 'importação'    },
    { id: 'outros',      label: 'outros'        },
    { id: 'estoque',     label: 'estoque'       },
    { id: 'comissao',    label: 'comissão'      },
  ]

  return (
    <div className="w-[420px] shrink-0 border-l border-[var(--d2b-border)] bg-[var(--d2b-bg-elevated)] flex flex-col overflow-hidden">
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-3 border-b border-[var(--d2b-border)]">
        <span className="text-sm font-semibold text-[var(--d2b-text-primary)]">{descricao}</span>
        <button onClick={onClose} className="p-1 text-[var(--d2b-text-muted)] hover:text-[var(--d2b-text-primary)] transition-colors">
          <X size={15} />
        </button>
      </div>

      {/* Tabs */}
      <div className="flex items-end border-b border-[var(--d2b-border)] overflow-x-auto shrink-0">
        {DRAWER_TABS.map(t => (
          <button key={t.id} onClick={() => setTab(t.id)}
            className={[
              'px-3 py-2 text-xs font-medium whitespace-nowrap border-b-2 -mb-px transition-colors',
              tab === t.id
                ? 'border-[#7C4DFF] text-[var(--d2b-text-primary)]'
                : 'border-transparent text-[var(--d2b-text-muted)] hover:text-[var(--d2b-text-secondary)]',
            ].join(' ')}
          >
            {t.label}
          </button>
        ))}
      </div>

      {/* Conteúdo */}
      <div className="flex-1 overflow-y-auto p-4 space-y-3">
        {tab === 'dados' && (
          <>
            <div><label className={LBL}>Descrição</label><input className={INP} defaultValue={descricao} /></div>
            <div className="grid grid-cols-2 gap-3">
              <div><label className={LBL}>Código (SKU)</label><input className={INP} /></div>
              <div><label className={LBL}>Unidade</label><input className={INP_RO} readOnly defaultValue="UNIDADE" /></div>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div><label className={LBL}>Qtde</label><input type="number" className={INP} defaultValue="1" /></div>
              <div><label className={LBL}>Preço un</label><input type="number" className={INP} defaultValue="1000" /></div>
            </div>
            <div><label className={LBL}>Total</label><input className={INP_RO} readOnly defaultValue="1.000,00" /></div>
            <div><label className={LBL}>GTIN/EAN</label><input className={INP} /></div>
            <div><label className={LBL}>CEST</label><input className={INP} /></div>
          </>
        )}
        {tab === 'icms' && (
          <>
            <div>
              <label className={LBL}>Situação tributária do ICMS</label>
              <div className="relative">
                <select className={SEL}><option>00 - Tributada integralmente</option></select>
                <ChevronDown size={11} className="absolute right-2 top-1/2 -translate-y-1/2 text-[var(--d2b-text-muted)] pointer-events-none" />
              </div>
            </div>
            <div className="grid grid-cols-3 gap-3">
              <div><label className={LBL}>Base</label><div className="relative"><span className="absolute left-3 top-1/2 -translate-y-1/2 text-xs text-[var(--d2b-text-muted)]">%</span><input className={INP + ' pl-8'} defaultValue="0.0000" /></div></div>
              <div><label className={LBL}>Valor base</label><div className="relative"><span className="absolute left-3 top-1/2 -translate-y-1/2 text-xs text-[var(--d2b-text-muted)]">R$</span><input className={INP_RO + ' pl-8'} readOnly defaultValue="0,00" /></div></div>
              <div><label className={LBL}>Alíquota</label><input className={INP} defaultValue="0.00" /></div>
            </div>
            <div><label className={LBL}>Valor ICMS</label><div className="relative"><span className="absolute left-3 top-1/2 -translate-y-1/2 text-xs text-[var(--d2b-text-muted)]">R$</span><input className={INP_RO + ' pl-8'} readOnly defaultValue="0,00" /></div></div>
          </>
        )}
        {(tab === 'ipi' || tab === 'pis' || tab === 'cofins') && (
          <>
            <div>
              <label className={LBL}>Situação tributária do {tab.toUpperCase()}</label>
              <div className="relative">
                <select className={SEL}><option>07 - Operação isenta da contribuição</option></select>
                <ChevronDown size={11} className="absolute right-2 top-1/2 -translate-y-1/2 text-[var(--d2b-text-muted)] pointer-events-none" />
              </div>
            </div>
            <div className="grid grid-cols-3 gap-3">
              <div><label className={LBL}>Base</label><input className={INP} defaultValue="0.0000" /></div>
              <div><label className={LBL}>Valor base</label><div className="relative"><span className="absolute left-3 top-1/2 -translate-y-1/2 text-xs text-[var(--d2b-text-muted)]">R$</span><input className={INP_RO + ' pl-8'} readOnly defaultValue="0,00" /></div></div>
              <div><label className={LBL}>Alíquota</label><div className="relative"><input className={INP + ' pr-6'} defaultValue="0.00" /><span className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-[var(--d2b-text-muted)]">%</span></div></div>
            </div>
            <div><label className={LBL}>Valor</label><div className="relative"><span className="absolute left-3 top-1/2 -translate-y-1/2 text-xs text-[var(--d2b-text-muted)]">R$</span><input className={INP_RO + ' pl-8'} readOnly defaultValue="0,00" /></div></div>
            {tab === 'cofins' && (
              <div><label className={LBL}>Observações do COFINS para o fisco</label><textarea className={INP + ' min-h-[60px] resize-none'} /></div>
            )}
          </>
        )}
        {tab === 'comissao' && (
          <>
            <div className="grid grid-cols-3 gap-3">
              <div><label className={LBL}>Base comissão</label><div className="relative"><span className="absolute left-3 top-1/2 -translate-y-1/2 text-xs text-[var(--d2b-text-muted)]">R$</span><input className={INP + ' pl-8'} defaultValue="1000,00" /></div></div>
              <div><label className={LBL}>Alíq. comissão</label><div className="relative"><input className={INP + ' pr-6'} defaultValue="0.00" /><span className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-[var(--d2b-text-muted)]">%</span></div></div>
              <div><label className={LBL}>Valor comissão</label><div className="relative"><span className="absolute left-3 top-1/2 -translate-y-1/2 text-xs text-[var(--d2b-text-muted)]">R$</span><input className={INP_RO + ' pl-8'} readOnly defaultValue="0,00" /></div></div>
            </div>
          </>
        )}
        {(tab === 'importacao' || tab === 'outros' || tab === 'estoque') && (
          <p className="text-xs text-[var(--d2b-text-muted)] py-4">Nenhum dado cadastrado para esta seção.</p>
        )}
        <p className="text-xs text-yellow-400 mt-2">
          ⚠ Os valores das bases e dos impostos somente serão recalculados ao salvar este item.
        </p>
        <div className="flex items-center gap-3 pt-2">
          <button className={BTN_PRIMARY + ' text-xs py-2'}>salvar</button>
          <button onClick={onClose} className="text-xs text-[var(--d2b-text-muted)] hover:text-[var(--d2b-text-primary)] transition-colors">cancelar</button>
        </div>
      </div>
    </div>
  )
}

// ═══════════════════════════════════════════════════════════════════════════
// FORMULÁRIO (novo / editar)
// ═══════════════════════════════════════════════════════════════════════════
const MOCK_ITENS_INICIAIS: ItemNota[] = [
  { id: '1', descricao: 'Teste', sku: '', un: 'UNIDADE', qtde: 1, precoUn: 1000 },
]

function NotasEntradaForm({ onBack }: { onBack: () => void }) {
  const [prodTab,    setProdTab]    = useState<ProdTab>('produtos')
  const [pagTab,     setPagTab]     = useState<PagTab>('parcelas')
  const [condPgto,   setCondPgto]   = useState('1')
  const [categoria,  setCategoria]  = useState('Água, luz')
  const [observacoes, setObservacoes] = useState('teste')
  const [marcadores, setMarcadores] = useState('')
  const [itens,      setItens]      = useState<ItemNota[]>(MOCK_ITENS_INICIAIS)
  const [drawerItem, setDrawerItem] = useState<ItemNota | null>(null)

  function addItem() {
    setItens(prev => [...prev, { id: String(Date.now()), descricao: '', sku: '', un: '', qtde: 0, precoUn: 0 }])
  }

  const totalProd = itens.reduce((s, i) => s + i.qtde * i.precoUn, 0)

  const TH = 'text-left px-3 py-3 text-xs font-semibold text-[var(--d2b-text-secondary)] uppercase tracking-wider whitespace-nowrap'

  return (
    <div className="flex h-full">
      <div className="flex-1 overflow-y-auto">
        <div className="px-8 pt-8 pb-8 max-w-4xl">

          <h1 className="text-xl font-semibold text-[var(--d2b-text-primary)] mb-1">Nota fiscal</h1>
          <span className="text-xs text-[var(--d2b-text-muted)] block mb-5">● registrada</span>

          {/* Cabeçalho do documento */}
          <div className="grid grid-cols-2 md:grid-cols-6 gap-3">
            <div className="md:col-span-2">
              <label className={LBL}>Tipo de Entrada</label>
              <div className="relative">
                <select className={SEL}><option>Emitida por terceiros</option><option>Emitida por mim</option></select>
                <ChevronDown size={11} className="absolute right-2 top-1/2 -translate-y-1/2 text-[var(--d2b-text-muted)] pointer-events-none" />
              </div>
            </div>
            <div>
              <label className={LBL}>Série</label>
              <input className={INP} defaultValue="1" />
            </div>
            <div>
              <label className={LBL}>Número</label>
              <input className={INP} defaultValue="222222222" />
            </div>
            <div>
              <label className={LBL}>Data emissão</label>
              <div className="relative">
                <input type="text" className={INP + ' pr-9'} defaultValue="07/04/2026" />
                <Calendar size={13} className="absolute right-3 top-1/2 -translate-y-1/2 text-[var(--d2b-text-muted)]" />
              </div>
            </div>
            <div>
              <label className={LBL}>Hora emissão</label>
              <input className={INP} defaultValue="20:36:10" />
            </div>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mt-3">
            <div className="md:col-span-2">
              <label className={LBL}>Natureza da operação</label>
              <input className={INP} defaultValue="Teste" />
            </div>
            <div>
              <label className={LBL}>Data entrada</label>
              <div className="relative">
                <input type="text" className={INP + ' pr-9'} defaultValue="07/04/2026" />
                <Calendar size={13} className="absolute right-3 top-1/2 -translate-y-1/2 text-[var(--d2b-text-muted)]" />
              </div>
            </div>
            <div>
              <label className={LBL}>Hora entrada</label>
              <input className={INP} defaultValue="20:35" />
            </div>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mt-3">
            <div>
              <label className={LBL}>Finalidade</label>
              <div className="relative">
                <select className={SEL}><option>NF-e normal</option></select>
                <ChevronDown size={11} className="absolute right-2 top-1/2 -translate-y-1/2 text-[var(--d2b-text-muted)] pointer-events-none" />
              </div>
            </div>
            <div>
              <label className={LBL}>Código de regime tributário</label>
              <div className="relative">
                <select className={SEL}><option>Simples nacional</option><option>Regime normal</option></select>
                <ChevronDown size={11} className="absolute right-2 top-1/2 -translate-y-1/2 text-[var(--d2b-text-muted)] pointer-events-none" />
              </div>
            </div>
            <div>
              <label className={LBL}>Consumidor final</label>
              <div className="relative">
                <select className={SEL}><option value="">Selecione</option><option>Sim</option><option>Não</option></select>
                <ChevronDown size={11} className="absolute right-2 top-1/2 -translate-y-1/2 text-[var(--d2b-text-muted)] pointer-events-none" />
              </div>
            </div>
            <div>
              <label className={LBL}>Intermediador</label>
              <div className="relative">
                <select className={SEL}><option>Sem intermediador</option></select>
                <ChevronDown size={11} className="absolute right-2 top-1/2 -translate-y-1/2 text-[var(--d2b-text-muted)] pointer-events-none" />
              </div>
            </div>
          </div>
          <div className="mt-3">
            <label className={LBL}>Indicador de presença do comprador no momento da venda</label>
            <div className="relative">
              <select className={SEL}><option>Operação não presencial, pela Internet</option></select>
              <ChevronDown size={11} className="absolute right-2 top-1/2 -translate-y-1/2 text-[var(--d2b-text-muted)] pointer-events-none" />
            </div>
            <p className="text-xs text-[var(--d2b-text-muted)] mt-1">Indica se o comprador estava presente no local da venda no momento da operação.</p>
          </div>

          {/* Remetente */}
          <h2 className={SEC}>Remetente</h2>
          <div className="space-y-3">
            <div>
              <label className={LBL}>Nome</label>
              <div className="relative">
                <input className={INP + ' pr-9'} defaultValue="JESSE" />
                <Search size={13} className="absolute right-3 top-1/2 -translate-y-1/2 text-[var(--d2b-text-muted)]" />
              </div>
              <button className="text-xs text-[#7C4DFF] hover:text-[#A98EFF] transition-colors mt-1">ver últimas compras</button>
            </div>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
              <div>
                <label className={LBL}>Tipo de pessoa</label>
                <div className="relative">
                  <select className={SEL}><option>Física</option><option>Jurídica</option></select>
                  <ChevronDown size={11} className="absolute right-2 top-1/2 -translate-y-1/2 text-[var(--d2b-text-muted)] pointer-events-none" />
                </div>
              </div>
              <div>
                <label className={LBL}>Contribuinte</label>
                <div className="relative">
                  <select className={SEL}><option>Não informado</option></select>
                  <ChevronDown size={11} className="absolute right-2 top-1/2 -translate-y-1/2 text-[var(--d2b-text-muted)] pointer-events-none" />
                </div>
              </div>
              <div>
                <label className={LBL}>CPF</label>
                <input className={INP} defaultValue="058.031.464-20" />
              </div>
              <div>
                <label className={LBL}>Insc. Estadual</label>
                <input className={INP} />
              </div>
            </div>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
              <div>
                <label className={LBL}>CEP</label>
                <div className="relative">
                  <input className={INP + ' pr-8'} defaultValue="54 410-010" />
                  <Search size={11} className="absolute right-2 top-1/2 -translate-y-1/2 text-[var(--d2b-text-muted)]" />
                </div>
              </div>
              <div className="md:col-span-2">
                <label className={LBL}>Cidade</label>
                <input className={INP} defaultValue="Jaboatão dos Guararapes" />
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
              <input className={INP} defaultValue="Avenida Bernardo Vieira de Melo" />
            </div>
            <div className="grid grid-cols-3 gap-3">
              <div><label className={LBL}>Bairro</label><input className={INP} defaultValue="Piedade" /></div>
              <div><label className={LBL}>Número</label><input className={INP} /></div>
              <div><label className={LBL}>Complemento</label><input className={INP} /></div>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div><label className={LBL}>Fone / Fax</label><input className={INP} /></div>
              <div><label className={LBL}>E-mail</label><input type="email" className={INP} /></div>
            </div>
          </div>

          {/* Produtos / Impostos */}
          <h2 className={SEC}>Itens</h2>
          <div className="flex items-end gap-0 border-b border-[var(--d2b-border)] mb-4">
            {(['produtos', 'impostos'] as ProdTab[]).map(t => (
              <button key={t} onClick={() => setProdTab(t)}
                className={[
                  'px-4 py-2 text-sm font-medium border-b-2 -mb-px transition-colors',
                  prodTab === t ? 'border-[#7C4DFF] text-[var(--d2b-text-primary)]' : 'border-transparent text-[var(--d2b-text-secondary)] hover:text-[var(--d2b-text-primary)]',
                ].join(' ')}
              >
                {t === 'produtos' ? 'Produtos ou serviços' : 'Impostos'}
              </button>
            ))}
          </div>

          {prodTab === 'produtos' && (
            <>
              <div className="rounded-lg border border-[var(--d2b-border)] overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="bg-[var(--d2b-bg-elevated)] border-b border-[var(--d2b-border)]">
                      <th className={TH + ' w-8'}>Nº</th>
                      <th className={TH}>Descrição</th>
                      <th className={TH}>Código (SKU)</th>
                      <th className={TH}>Un</th>
                      <th className={TH + ' text-right'}>Qtde</th>
                      <th className={TH + ' text-right'}>Preço un</th>
                      <th className={TH + ' text-right'}>Total</th>
                      <th className={TH}>Ações</th>
                    </tr>
                  </thead>
                  <tbody>
                    {itens.map((item, idx) => (
                      <tr key={item.id} className="border-b border-[var(--d2b-border)]">
                        <td className="px-3 py-2 text-[var(--d2b-text-muted)] text-xs">{idx + 1}</td>
                        <td className="px-3 py-2">
                          <input className={INP} value={item.descricao}
                            onChange={e => setItens(prev => prev.map(i => i.id === item.id ? { ...i, descricao: e.target.value } : i))} />
                        </td>
                        <td className="px-3 py-2">
                          <input className={INP} value={item.sku}
                            onChange={e => setItens(prev => prev.map(i => i.id === item.id ? { ...i, sku: e.target.value } : i))} />
                        </td>
                        <td className="px-3 py-2">
                          <input className={INP_RO} readOnly value={item.un} />
                        </td>
                        <td className="px-3 py-2">
                          <input type="number" className={INP + ' text-right'} value={item.qtde || ''}
                            onChange={e => setItens(prev => prev.map(i => i.id === item.id ? { ...i, qtde: parseFloat(e.target.value) || 0 } : i))} />
                        </td>
                        <td className="px-3 py-2">
                          <input type="number" className={INP + ' text-right'} value={item.precoUn || ''}
                            onChange={e => setItens(prev => prev.map(i => i.id === item.id ? { ...i, precoUn: parseFloat(e.target.value) || 0 } : i))} />
                        </td>
                        <td className="px-3 py-2 text-right text-[var(--d2b-text-primary)]">
                          {(item.qtde * item.precoUn).toFixed(2)}
                        </td>
                        <td className="px-3 py-2">
                          <div className="flex items-center gap-2">
                            <button onClick={() => setDrawerItem(item)} className="text-xs text-[#7C4DFF] hover:underline">editar</button>
                            <button onClick={() => setItens(prev => prev.filter(i => i.id !== item.id))}
                              className="text-[var(--d2b-text-muted)] hover:text-red-400 transition-colors">
                              <X size={13} />
                            </button>
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
                  adicionar outro item
                </button>
                <button className="flex items-center gap-1.5 text-sm text-[#7C4DFF] hover:text-[#A98EFF] transition-colors">
                  <Search size={13} />
                  busca avançada de itens
                </button>
              </div>
            </>
          )}

          {prodTab === 'impostos' && (
            <p className="text-sm text-[var(--d2b-text-muted)] py-4">Edite cada item para configurar seus impostos.</p>
          )}

          {/* Cálculo do imposto */}
          <h2 className={SEC}>Cálculo do imposto</h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            {[
              { label: 'Total Produtos', val: `R$ ${totalProd.toFixed(2)}` },
              { label: 'Total Serviços', val: 'R$ 0,00' },
              { label: 'Valor do Frete', val: 'R$ 0,00' },
              { label: 'Valor do Seguro', val: 'R$' },
              { label: 'Base ICMS', val: 'R$ 0,00' },
              { label: 'Valor ICMS', val: 'R$ 0,00' },
              { label: 'Base ICMS ST', val: 'R$ 0,00' },
              { label: 'Valor ICMS ST', val: 'R$ 0,00' },
              { label: 'Valor IPI', val: 'R$ 0,00' },
              { label: 'Valor IPI Devolvido', val: 'R$ 0,00' },
              { label: 'Valor ISSQN', val: 'R$ 0,00' },
              { label: 'Despesas', val: 'R$' },
              { label: 'Desconto', val: '1' },
              { label: 'Valor Funrural', val: 'R$ 0,00' },
              { label: 'Nº Itens', val: String(itens.length) },
              { label: 'Valor aprox. imp.', val: 'R$ 0,00' },
            ].map(r => (
              <div key={r.label}>
                <label className={LBL}>{r.label}</label>
                <input className={INP_RO} readOnly value={r.val} />
              </div>
            ))}
          </div>
          <div className="mt-3 grid grid-cols-2 md:grid-cols-4 gap-3">
            {[
              { label: 'Total do FCP', val: 'R$ 0,00' },
              { label: 'Total FCP ST', val: 'R$ 0,00' },
              { label: 'Total FCP ST/Ret anteriormente', val: 'R$ 0,00' },
              { label: 'Total da Nota', val: `R$ ${(totalProd - 1).toFixed(2)}` },
            ].map(r => (
              <div key={r.label}>
                <label className={LBL}>{r.label}</label>
                <input className={INP_RO} readOnly value={r.val} />
              </div>
            ))}
          </div>
          <div className="mt-3 flex items-center gap-3">
            <div className="w-10 h-5 rounded-full bg-[#7C4DFF] relative cursor-pointer shrink-0">
              <div className="absolute right-0.5 top-0.5 w-4 h-4 rounded-full bg-white" />
            </div>
            <div>
              <p className="text-sm font-medium text-[var(--d2b-text-primary)]">Cálculo ligado</p>
              <p className="text-xs text-[var(--d2b-text-muted)]">Cálculo automático de imposto</p>
            </div>
          </div>

          {/* Transportador / Volumes */}
          <h2 className={SEC}>Transportador / Volumes</h2>
          <div className="space-y-3">
            <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
              <div>
                <label className={LBL}>Código de rastreamento</label>
                <div className="relative"><input className={INP + ' pr-9'} /><RotateCcw size={13} className="absolute right-3 top-1/2 -translate-y-1/2 text-[var(--d2b-text-muted)]" /></div>
              </div>
              <div>
                <label className={LBL}>URL de rastreamento</label>
                <input className={INP} />
              </div>
              <div>
                <label className={LBL}>Frete por conta</label>
                <div className="relative">
                  <select className={SEL}><option>Contratação do Frete por conta do Remetente (CIF)</option><option>Contratação do Frete por conta do Destinatário (FOB)</option></select>
                  <ChevronDown size={11} className="absolute right-2 top-1/2 -translate-y-1/2 text-[var(--d2b-text-muted)] pointer-events-none" />
                </div>
              </div>
            </div>
            <div className="grid grid-cols-3 gap-3">
              <div><label className={LBL}>Nome</label><input className={INP} /></div>
              <div><label className={LBL}>CNPJ/CPF</label><input className={INP} /></div>
              <div><label className={LBL}>Insc. Estadual</label><input className={INP} /></div>
            </div>
            <div className="grid grid-cols-3 gap-3">
              <div><label className={LBL}>Endereço</label><input className={INP} /></div>
              <div><label className={LBL}>Município</label><input className={INP} /></div>
              <div>
                <label className={LBL}>UF</label>
                <div className="relative"><select className={SEL}><option value="">Selecione</option></select><ChevronDown size={11} className="absolute right-2 top-1/2 -translate-y-1/2 text-[var(--d2b-text-muted)] pointer-events-none" /></div>
              </div>
            </div>
            <div className="grid grid-cols-3 md:grid-cols-6 gap-3">
              <div><label className={LBL}>Qtde Volumes</label><input className={INP} defaultValue="0" /></div>
              <div><label className={LBL}>Espécie</label><input className={INP} /></div>
              <div><label className={LBL}>Marca</label><input className={INP} /></div>
              <div><label className={LBL}>Número</label><input className={INP} /></div>
              <div><label className={LBL}>Peso Bruto</label><div className="relative"><input className={INP + ' pr-8'} defaultValue="0,000" /><span className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-[var(--d2b-text-muted)]">kg</span></div></div>
              <div><label className={LBL}>Peso Líquido</label><div className="relative"><input className={INP + ' pr-8'} defaultValue="0,000" /><span className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-[var(--d2b-text-muted)]">kg</span></div></div>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div><label className={LBL}>Placa veículo</label><input className={INP} /></div>
              <div>
                <label className={LBL}>UF veículo</label>
                <div className="relative"><select className={SEL}><option value="">Selecione</option></select><ChevronDown size={11} className="absolute right-2 top-1/2 -translate-y-1/2 text-[var(--d2b-text-muted)] pointer-events-none" /></div>
              </div>
            </div>
          </div>

          {/* Pagamento */}
          <h2 className={SEC}>Pagamento</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className={LBL}>Condição de pagamento</label>
              <div className="flex items-center gap-2">
                <input className={INP + ' flex-1'} value={condPgto} onChange={e => setCondPgto(e.target.value)} />
                <button className={BTN_OUTLINE + ' shrink-0 text-xs'}>gerar parcelas</button>
              </div>
              <p className="text-xs text-[var(--d2b-text-muted)] mt-1">Número de parcelas ou prazos. Exemplos: 30 60, 3x ou 15 +2x</p>
            </div>
            <div>
              <label className={LBL}>Categoria</label>
              <div className="relative">
                <select className={SEL} value={categoria} onChange={e => setCategoria(e.target.value)}>
                  <option>Água, luz</option><option>Selecione</option>
                </select>
                <ChevronDown size={13} className="absolute right-3 top-1/2 -translate-y-1/2 text-[var(--d2b-text-muted)] pointer-events-none" />
              </div>
              <p className="text-xs text-[var(--d2b-text-muted)] mt-1">Categoria da receita ou despesa</p>
            </div>
          </div>
          {/* Sub-tabs parcelas */}
          <div className="flex items-end gap-0 border-b border-[var(--d2b-border)] mt-4 mb-3">
            {(['parcelas', 'observacoes'] as PagTab[]).map(t => (
              <button key={t} onClick={() => setPagTab(t)}
                className={[
                  'px-4 py-2 text-sm font-medium border-b-2 -mb-px transition-colors',
                  pagTab === t ? 'border-[#7C4DFF] text-[var(--d2b-text-primary)]' : 'border-transparent text-[var(--d2b-text-secondary)] hover:text-[var(--d2b-text-primary)]',
                ].join(' ')}
              >
                {t === 'parcelas' ? 'parcelas' : 'observações das parcelas'}
              </button>
            ))}
          </div>
          {pagTab === 'parcelas' && (
            <div className="rounded-lg border border-[var(--d2b-border)] overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="bg-[var(--d2b-bg-elevated)] border-b border-[var(--d2b-border)]">
                    {['Nº', 'Dias', 'Data', 'Valor', 'Enviar para', 'Meio de Pagamento da NFe', ''].map(h => (
                      <th key={h} className="text-left px-3 py-2.5 text-xs font-semibold text-[var(--d2b-text-secondary)] uppercase tracking-wider whitespace-nowrap">{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  <tr className="border-b border-[var(--d2b-border)]">
                    <td className="px-3 py-2 text-[var(--d2b-text-secondary)] text-xs">1</td>
                    <td className="px-3 py-2"><input className={INP} defaultValue="1" /></td>
                    <td className="px-3 py-2">
                      <div className="relative"><input type="text" className={INP + ' pr-9'} defaultValue="08/04/2026" /><Calendar size={11} className="absolute right-2 top-1/2 -translate-y-1/2 text-[var(--d2b-text-muted)]" /></div>
                    </td>
                    <td className="px-3 py-2"><input className={INP} defaultValue="999" /></td>
                    <td className="px-3 py-2">
                      <div className="relative"><select className={SEL}><option>Contas a Pagar</option></select><ChevronDown size={11} className="absolute right-2 top-1/2 -translate-y-1/2 text-[var(--d2b-text-muted)] pointer-events-none" /></div>
                    </td>
                    <td className="px-3 py-2">
                      <div className="relative"><select className={SEL}><option>Dinheiro</option></select><ChevronDown size={11} className="absolute right-2 top-1/2 -translate-y-1/2 text-[var(--d2b-text-muted)] pointer-events-none" /></div>
                    </td>
                    <td className="px-3 py-2"><button className="text-[var(--d2b-text-muted)] hover:text-red-400 transition-colors"><X size={13} /></button></td>
                  </tr>
                </tbody>
              </table>
              <button className="px-4 py-2.5 text-sm text-[#7C4DFF] hover:text-[#A98EFF] transition-colors flex items-center gap-1.5">
                <Plus size={12} /> adicionar outra parcela
              </button>
            </div>
          )}

          {/* Dados adicionais */}
          <h2 className={SEC}>Dados adicionais</h2>
          <div className="space-y-3">
            <div>
              <label className={LBL}>Depósito</label>
              <div className="relative">
                <select className={SEL}><option>Padrão</option></select>
                <ChevronDown size={13} className="absolute right-3 top-1/2 -translate-y-1/2 text-[var(--d2b-text-muted)] pointer-events-none" />
              </div>
            </div>
            <div>
              <label className={LBL}>Observações</label>
              <textarea className={INP + ' min-h-[80px] resize-y'} value={observacoes} onChange={e => setObservacoes(e.target.value)} />
            </div>
            <div>
              <label className={LBL}>Observações do sistema</label>
              <textarea className={INP + ' min-h-[60px] resize-y bg-[var(--d2b-bg-elevated)] text-[var(--d2b-text-muted)]'} readOnly />
              <p className="text-xs text-[var(--d2b-text-muted)] mt-1">
                Esta informação é gerada automaticamente pelo sistema com base nas observações cadastradas nas{' '}
                <span className="text-[#7C4DFF] cursor-pointer hover:underline">Operações Fiscais</span>.
              </p>
            </div>
            <div>
              <label className={LBL}>Informações ao fisco</label>
              <textarea className={INP + ' min-h-[60px] resize-y'} />
            </div>
            <div>
              <label className={LBL}>Marcadores</label>
              <input className={INP} value={marcadores} onChange={e => setMarcadores(e.target.value)} />
              <p className="text-xs text-[var(--d2b-text-muted)] mt-1">Separados por vírgula ou tab</p>
            </div>
          </div>

          {/* Ações */}
          <div className="mt-8 flex items-center gap-4 pb-8">
            <button onClick={onBack} className={BTN_PRIMARY}>salvar</button>
            <button onClick={onBack} className="text-sm text-[var(--d2b-text-secondary)] hover:text-[var(--d2b-text-primary)] transition-colors">cancelar</button>
          </div>
        </div>
      </div>

      {/* Drawer de item */}
      {drawerItem && (
        <ItemDrawer descricao={drawerItem.descricao || 'Item'} onClose={() => setDrawerItem(null)} />
      )}
    </div>
  )
}

// ═══════════════════════════════════════════════════════════════════════════
// DETALHE (readonly)
// ═══════════════════════════════════════════════════════════════════════════
const MOCK_DETALHE_NOTA = MOCK_NOTAS[0]

function NotasEntradaDetalhe({ onBack, onEditar }: { onBack: () => void; onEditar: () => void }) {
  const n = MOCK_DETALHE_NOTA
  const LBL_V = 'text-xs text-[var(--d2b-text-muted)] mb-0.5'
  const VAL   = 'text-sm text-[var(--d2b-text-primary)]'

  return (
    <div className="flex flex-col h-full">
      <div className="flex items-center justify-between px-8 py-3 border-b border-[var(--d2b-border)] bg-[var(--d2b-bg-surface)]">
        <button onClick={onBack} className="text-xs text-[var(--d2b-text-muted)] hover:text-[var(--d2b-text-primary)]">← voltar</button>
        <div className="flex items-center gap-2">
          <button onClick={onEditar} className={BTN_PRIMARY}><Pencil size={13} />editar</button>
          <button className={BTN_OUTLINE}>ações <MoreHorizontal size={13} /></button>
        </div>
      </div>
      <div className="flex-1 overflow-y-auto">
        <div className="px-8 pb-8 max-w-4xl">
          <h1 className="text-xl font-semibold text-[var(--d2b-text-primary)] mt-6 mb-1">Nota fiscal</h1>
          <span className="text-xs text-blue-400 block mb-5">● registrada</span>

          <div className="grid grid-cols-2 md:grid-cols-5 gap-4 border-b border-[var(--d2b-border)] pb-5 mb-5">
            <div><p className={LBL_V}>Nº</p><p className={VAL}>{n.numero}</p></div>
            <div><p className={LBL_V}>Data emissão</p><p className={VAL}>{n.dataEmissao}</p></div>
            <div><p className={LBL_V}>Remetente</p><p className={VAL}>{n.remetente}</p></div>
            <div><p className={LBL_V}>UF</p><p className={VAL}>{n.uf}</p></div>
            <div><p className={LBL_V}>Valor</p><p className={VAL}>{n.valor.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</p></div>
          </div>

          <h2 className="text-base font-semibold text-[var(--d2b-text-primary)] mb-3">Itens</h2>
          <div className="rounded-lg border border-[var(--d2b-border)] overflow-x-auto mb-6">
            <table className="w-full text-sm">
              <thead>
                <tr className="bg-[var(--d2b-bg-elevated)] border-b border-[var(--d2b-border)]">
                  {['Nº', 'Descrição', 'SKU', 'Un', 'Qtde', 'Preço un', 'Total'].map(h => (
                    <th key={h} className="text-left px-3 py-2.5 text-xs font-semibold text-[var(--d2b-text-secondary)] uppercase tracking-wider">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                <tr className="border-b border-[var(--d2b-border)]">
                  <td className="px-3 py-3 text-[var(--d2b-text-muted)] text-xs">1</td>
                  <td className="px-3 py-3 text-[var(--d2b-text-primary)]">Teste</td>
                  <td className="px-3 py-3 text-[var(--d2b-text-secondary)]" />
                  <td className="px-3 py-3 text-[var(--d2b-text-secondary)]">UNIDADE</td>
                  <td className="px-3 py-3 text-[var(--d2b-text-primary)]">1,00</td>
                  <td className="px-3 py-3 text-[var(--d2b-text-primary)]">1.000,00</td>
                  <td className="px-3 py-3 text-[var(--d2b-text-primary)]">1.000,00</td>
                </tr>
              </tbody>
            </table>
          </div>

          <h2 className="text-base font-semibold text-[var(--d2b-text-primary)] mb-3">Totais</h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 border-b border-[var(--d2b-border)] pb-6 mb-6">
            {[
              ['Total Produtos', 'R$ 1.000,00'], ['Total Serviços', 'R$ 0,00'],
              ['Base ICMS', 'R$ 999,00'  ], ['Valor ICMS', 'R$ 0,00'],
              ['Desconto', '1'           ], ['Total da Nota', 'R$ 999,00'],
            ].map(([l, v]) => (
              <div key={l}><p className={LBL_V}>{l}</p><p className={VAL}>{v}</p></div>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}

// ═══════════════════════════════════════════════════════════════════════════
// ROOT
// ═══════════════════════════════════════════════════════════════════════════
export function NotasEntradaContent() {
  const [tela,   setTela]   = useState<Tela>('lista')
  const [itemId, setItemId] = useState<string | null>(null)

  if (tela === 'novo') return <NotasEntradaForm onBack={() => setTela('lista')} />

  if (tela === 'ver' && itemId) {
    return (
      <NotasEntradaDetalhe
        onBack={() => { setItemId(null); setTela('lista') }}
        onEditar={() => setTela('novo')}
      />
    )
  }

  return (
    <NotasEntradaLista
      onNovo={() => setTela('novo')}
      onVer={id => { setItemId(id); setTela('ver') }}
    />
  )
}
