'use client'

import { useState } from 'react'
import {
  Search, Calendar, ArrowUpDown, ChevronDown, X,
  Download, SlidersHorizontal, Info,
} from 'lucide-react'

// ─── Shared styles ──────────────────────────────────────────────────────────
const INP =
  'w-full bg-[var(--d2b-bg-main)] border border-[var(--d2b-border-strong)] rounded-md ' +
  'px-3 py-2 text-sm text-[var(--d2b-text-primary)] placeholder:text-[var(--d2b-text-muted)] ' +
  'focus:outline-none focus:border-[#7C4DFF] transition-colors'

const SEL =
  'w-full bg-[var(--d2b-bg-main)] border border-[var(--d2b-border-strong)] rounded-md ' +
  'px-3 py-2 text-sm text-[var(--d2b-text-primary)] ' +
  'focus:outline-none focus:border-[#7C4DFF] transition-colors appearance-none'

const LBL = 'block text-xs text-[var(--d2b-text-secondary)] mb-1'

const BTN_PRIMARY =
  'flex items-center gap-2 px-4 py-2.5 rounded-full text-sm font-bold text-white bg-[#7C4DFF] hover:bg-[#5B21B6] transition-colors'

const BTN_OUTLINE =
  'flex items-center gap-2 px-4 py-2 rounded-md text-sm font-medium border border-[var(--d2b-border-strong)] ' +
  'text-[var(--d2b-text-secondary)] hover:border-[#7C4DFF] hover:text-[var(--d2b-text-primary)] bg-transparent transition-colors'

const TH = 'text-left px-3 py-3 text-xs font-semibold text-[var(--d2b-text-secondary)] uppercase tracking-wider whitespace-nowrap'

// ─── Types ──────────────────────────────────────────────────────────────────
type ItemNec = {
  id: string
  produto: string
  sku: string
  gtin: string
  fornecedor: string
  un: string
  custoMedio: number
  entradasPrevistas: number
  saidasPrevistas: number
  estoqueFisico: number
  estoqueVirtual: number
  comprar: number
}

type ItemOrdem = { id: string; produto: string; sku: string; qtde: number }

type Filtros = {
  coberturaEstoque: string
  mesesSaidasPrevistas: number
  exibirProdutos: string
  exibirEstoqueMinMax: string
  situacoesVenda: string[]
  filtrarDepositos: string
  filtrarTags: string
  filtrarFornecedores: string
  produto: string
  informacoesAdicionais: string
  naturezaOperacao: string
  considerarTransferencias: boolean
  considerarSaidasPrevistas: boolean
}

// ─── Mock ─────────────────────────────────────────────────────────────────────
const MOCK_ITENS: ItemNec[] = [
  {
    id: '1',
    produto: 'Teste',
    sku: '',
    gtin: '',
    fornecedor: 'JESSE',
    un: 'UNIDAD',
    custoMedio: 0,
    entradasPrevistas: 1,
    saidasPrevistas: 0,
    estoqueFisico: 101,
    estoqueVirtual: 102,
    comprar: 0,
  },
]

const FILTROS_INIT: Filtros = {
  coberturaEstoque: '',
  mesesSaidasPrevistas: 0,
  exibirProdutos: 'Todos',
  exibirEstoqueMinMax: 'Não',
  situacoesVenda: ['Aprovado', 'Faturado'],
  filtrarDepositos: 'Geral',
  filtrarTags: 'Sem filtro por tags',
  filtrarFornecedores: '',
  produto: '',
  informacoesAdicionais: 'Sem informações visíveis',
  naturezaOperacao: 'Sem filtro por natureza',
  considerarTransferencias: false,
  considerarSaidasPrevistas: false,
}

// ═══════════════════════════════════════════════════════════════════════════
// DRAWER — Gerar Ordem de Compra
// ═══════════════════════════════════════════════════════════════════════════
function DrawerOrdemCompra({
  itens,
  onClose,
}: {
  itens: ItemNec[]
  onClose: () => void
}) {
  const [fornecedor, setFornecedor] = useState(itens[0]?.fornecedor ?? '')
  const [dataPrevista, setDataPrevista] = useState('')
  const [rows, setRows] = useState<ItemOrdem[]>(
    itens.map(i => ({ id: i.id, produto: i.produto, sku: i.sku, qtde: i.comprar }))
  )

  const updateQtde = (id: string, v: number) =>
    setRows(prev => prev.map(r => r.id === id ? { ...r, qtde: v } : r))
  const removeRow = (id: string) => setRows(prev => prev.filter(r => r.id !== id))

  return (
    <div className="fixed inset-0 z-40 flex">
      {/* overlay */}
      <div className="flex-1 bg-black/30" onClick={onClose} />

      {/* drawer */}
      <div className="w-[420px] bg-[var(--d2b-bg-elevated)] border-l border-[var(--d2b-border)] flex flex-col h-full shadow-2xl">
        {/* header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-[var(--d2b-border)]">
          <h3 className="text-base font-semibold text-[var(--d2b-text-primary)]">Ordem de compra</h3>
          <button onClick={onClose} className="text-[var(--d2b-text-muted)] hover:text-[var(--d2b-text-primary)] transition-colors">
            <X size={16} />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto px-6 py-5 flex flex-col gap-4">
          {/* Fornecedor */}
          <div>
            <label className={LBL}>Fornecedor</label>
            <input className={INP} value={fornecedor} onChange={e => setFornecedor(e.target.value)} />
          </div>

          {/* Data prevista */}
          <div>
            <label className={LBL}>Data prevista</label>
            <div className="relative">
              <input className={INP + ' pr-9'} value={dataPrevista} onChange={e => setDataPrevista(e.target.value)} placeholder="dd/mm/aaaa" />
              <Calendar size={14} className="absolute right-3 top-1/2 -translate-y-1/2 text-[var(--d2b-text-muted)] pointer-events-none" />
            </div>
          </div>

          {/* Tabela de itens */}
          <div>
            <div className="grid grid-cols-[1fr_auto_80px_28px] gap-2 text-xs font-semibold text-[var(--d2b-text-secondary)] uppercase tracking-wider pb-2 border-b border-[var(--d2b-border)]">
              <span>Item</span>
              <span>Código (SKU)</span>
              <span className="text-right">Qtde</span>
              <span />
            </div>
            {rows.map(r => (
              <div key={r.id} className="grid grid-cols-[1fr_auto_80px_28px] gap-2 items-center py-2.5 border-b border-[var(--d2b-border)]">
                <span className="text-sm text-[var(--d2b-text-primary)] truncate">{r.produto}</span>
                <span className="text-sm text-[var(--d2b-text-secondary)]">{r.sku}</span>
                <input
                  type="number"
                  value={r.qtde}
                  onChange={e => updateQtde(r.id, Number(e.target.value))}
                  className="w-full bg-[var(--d2b-bg-main)] border border-[var(--d2b-border-strong)] rounded-md px-2 py-1 text-sm text-right text-[var(--d2b-text-primary)] focus:outline-none focus:border-[#7C4DFF]"
                />
                <button onClick={() => removeRow(r.id)} className="text-[var(--d2b-text-muted)] hover:text-rose-400 transition-colors">
                  <X size={13} />
                </button>
              </div>
            ))}
          </div>
        </div>

        {/* footer */}
        <div className="px-6 py-4 border-t border-[var(--d2b-border)]">
          <button className={BTN_PRIMARY + ' w-full justify-center'}>
            gerar ordens de compra
          </button>
        </div>
      </div>
    </div>
  )
}

// ═══════════════════════════════════════════════════════════════════════════
// RESULTADO
// ═══════════════════════════════════════════════════════════════════════════
function NecessidadesResultado({
  itens,
  onExibirFiltros,
}: {
  itens: ItemNec[]
  onExibirFiltros: () => void
}) {
  const [selecionados, setSelecionados] = useState<string[]>([])
  const [comprarQtdes, setComprarQtdes] = useState<Record<string, number>>(
    Object.fromEntries(itens.map(i => [i.id, i.comprar]))
  )
  const [showDrawer, setShowDrawer] = useState(false)

  const toggleSelect = (id: string) =>
    setSelecionados(prev => prev.includes(id) ? prev.filter(x => x !== id) : [...prev, id])
  const toggleAll = () =>
    setSelecionados(prev => prev.length === itens.length ? [] : itens.map(i => i.id))

  const itensSelecionados = itens.filter(i => selecionados.includes(i.id))

  return (
    <div className="flex flex-col h-full">
      {/* action bar */}
      <div className="flex items-center gap-2 px-8 pt-6 pb-3 flex-wrap">
        <button onClick={onExibirFiltros} className={BTN_PRIMARY}>
          exibir filtros
        </button>
        <button
          onClick={() => selecionados.length > 0 && setShowDrawer(true)}
          className={BTN_OUTLINE}
        >
          gerar ordem de compra dos selecionados
        </button>
        <button className={BTN_OUTLINE}>
          <Download size={13} />
          imprimir
        </button>
        <button className={BTN_OUTLINE}>
          <Download size={13} />
          download
        </button>
      </div>

      {/* title */}
      <div className="px-8 pb-3">
        <h2 className="text-xl font-semibold text-[var(--d2b-text-primary)]">Necessidades de Compra</h2>
      </div>

      {/* table */}
      <div className="flex-1 overflow-x-auto px-8 pb-2">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-[var(--d2b-border)]">
              <th className="px-3 py-3 w-8">
                <input
                  type="checkbox"
                  checked={selecionados.length === itens.length && itens.length > 0}
                  onChange={toggleAll}
                  className="w-4 h-4 rounded accent-[#7C4DFF] cursor-pointer"
                />
              </th>
              {[
                'Produto', 'Código (SKU)', 'GTIN/EAN', 'Fornecedor Padrão', 'Un',
                'Custo médio',
              ].map(h => (
                <th key={h} className={TH}>
                  {h} <ArrowUpDown size={10} className="inline mb-0.5 text-[var(--d2b-text-muted)]" />
                </th>
              ))}
              {[
                { label: 'Entradas previstas', info: true },
                { label: 'Saídas previstas', info: true },
                { label: 'Estoque físico', info: true },
                { label: 'Estoque virtual', info: true },
              ].map(h => (
                <th key={h.label} className={TH}>
                  {h.label} <Info size={10} className="inline mb-0.5 text-[var(--d2b-text-muted)]" />
                </th>
              ))}
              <th className={TH + ' text-[#7C4DFF]'}>Comprar</th>
            </tr>
          </thead>
          <tbody>
            {itens.map(i => {
              const sel = selecionados.includes(i.id)
              return (
                <tr key={i.id}
                  className={[
                    'border-b border-[var(--d2b-border)] hover:bg-[var(--d2b-hover)] transition-colors',
                    sel ? 'bg-[var(--d2b-hover)]' : '',
                  ].join(' ')}
                >
                  <td className="px-3 py-3">
                    <input type="checkbox" checked={sel} onChange={() => toggleSelect(i.id)}
                      className="w-4 h-4 rounded accent-[#7C4DFF] cursor-pointer" />
                  </td>
                  <td className="px-3 py-3 text-[var(--d2b-text-primary)] font-medium">{i.produto}</td>
                  <td className="px-3 py-3 text-[var(--d2b-text-secondary)]">{i.sku}</td>
                  <td className="px-3 py-3 text-[var(--d2b-text-secondary)]">{i.gtin}</td>
                  <td className="px-3 py-3 text-[var(--d2b-text-secondary)]">{i.fornecedor}</td>
                  <td className="px-3 py-3 text-[var(--d2b-text-secondary)]">{i.un}</td>
                  <td className="px-3 py-3 text-right text-[var(--d2b-text-secondary)]">{i.custoMedio.toFixed(2)}</td>
                  <td className="px-3 py-3 text-right text-[var(--d2b-text-secondary)]">{i.entradasPrevistas.toFixed(2)}</td>
                  <td className="px-3 py-3 text-right text-[var(--d2b-text-secondary)]">{i.saidasPrevistas.toFixed(2)}</td>
                  <td className="px-3 py-3 text-right text-[var(--d2b-text-secondary)]">{i.estoqueFisico.toFixed(2)}</td>
                  <td className="px-3 py-3 text-right text-[var(--d2b-text-secondary)]">{i.estoqueVirtual.toFixed(2)}</td>
                  <td className="px-3 py-3">
                    <input
                      type="number"
                      value={comprarQtdes[i.id] ?? 0}
                      onChange={e => setComprarQtdes(prev => ({ ...prev, [i.id]: Number(e.target.value) }))}
                      className="w-20 bg-[var(--d2b-bg-main)] border border-[var(--d2b-border-strong)] rounded-md px-2 py-1 text-sm text-right text-[var(--d2b-text-primary)] focus:outline-none focus:border-[#7C4DFF] transition-colors"
                    />
                  </td>
                </tr>
              )
            })}
          </tbody>
        </table>
      </div>

      {/* totals footer */}
      {selecionados.length > 0 && (
        <div className="mx-8 border-t border-[var(--d2b-border)] py-2">
          <div className="grid text-xs text-[var(--d2b-text-muted)]">
            <span>{selecionados.length} produto(s) selecionado(s)</span>
          </div>
        </div>
      )}

      {/* nota */}
      <div className="px-8 py-3 text-xs text-[var(--d2b-text-muted)] border-t border-[var(--d2b-border)]">
        * Ao alterar o estoque mínimo e o máximo neste relatório, os mesmos também são atualizados automaticamente no cadastro do produto.
      </div>

      {/* drawer */}
      {showDrawer && (
        <DrawerOrdemCompra
          itens={itensSelecionados}
          onClose={() => setShowDrawer(false)}
        />
      )}
    </div>
  )
}

// ═══════════════════════════════════════════════════════════════════════════
// FILTROS
// ═══════════════════════════════════════════════════════════════════════════
function NecessidadesFiltros({
  onGerar,
}: {
  onGerar: () => void
}) {
  const [f, setF] = useState<Filtros>(FILTROS_INIT)
  const set = <K extends keyof Filtros>(k: K, v: Filtros[K]) =>
    setF(prev => ({ ...prev, [k]: v }))

  return (
    <div className="flex flex-col h-full overflow-y-auto">
      <div className="px-8 pt-6 pb-8">
        <h2 className="text-xl font-semibold text-[var(--d2b-text-primary)] mb-6">Necessidades de Compra</h2>

        {/* 4-column grid */}
        <div className="grid grid-cols-4 gap-8 mb-6">
          {/* Col 1 */}
          <div className="flex flex-col gap-4">
            <div>
              <label className={LBL}>Calcular cobertura de estoque</label>
              <div className="relative">
                <select className={SEL} value={f.coberturaEstoque} onChange={e => set('coberturaEstoque', e.target.value)}>
                  <option value="">Selecione</option>
                  <option value="1">1 mês</option>
                  <option value="3">3 meses</option>
                  <option value="6">6 meses</option>
                  <option value="12">12 meses</option>
                </select>
                <ChevronDown size={13} className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none text-[var(--d2b-text-muted)]" />
              </div>
            </div>
            <div>
              <label className={LBL}>Considerar saídas previstas dos últimos</label>
              <div className="flex items-center gap-2 border border-[var(--d2b-border-strong)] rounded-md overflow-hidden bg-[var(--d2b-bg-main)]">
                <input
                  type="number"
                  value={f.mesesSaidasPrevistas}
                  onChange={e => set('mesesSaidasPrevistas', Number(e.target.value))}
                  className="flex-1 px-3 py-2 text-sm text-[var(--d2b-text-primary)] bg-transparent outline-none"
                />
                <span className="px-3 py-2 text-xs text-[var(--d2b-text-muted)] border-l border-[var(--d2b-border-strong)] bg-[var(--d2b-bg-elevated)]">
                  meses
                </span>
              </div>
            </div>
          </div>

          {/* Col 2 */}
          <div className="flex flex-col gap-4">
            <div>
              <label className={LBL}>Exibir produtos</label>
              <div className="relative">
                <select className={SEL} value={f.exibirProdutos} onChange={e => set('exibirProdutos', e.target.value)}>
                  <option value="Todos">Todos</option>
                  <option value="Somente com necessidade">Somente com necessidade</option>
                </select>
                <ChevronDown size={13} className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none text-[var(--d2b-text-muted)]" />
              </div>
            </div>
            <div>
              <label className={LBL}>Exibir estoque mínimo e máximo</label>
              <div className="relative">
                <select className={SEL} value={f.exibirEstoqueMinMax} onChange={e => set('exibirEstoqueMinMax', e.target.value)}>
                  <option value="Não">Não</option>
                  <option value="Sim">Sim</option>
                </select>
                <ChevronDown size={13} className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none text-[var(--d2b-text-muted)]" />
              </div>
            </div>
            <div>
              <label className={LBL}>Situações de venda para saídas previstas</label>
              <div className="flex flex-wrap gap-1.5">
                {['Aprovado', 'Faturado', 'Cancelado', 'Em breves'].map(s => (
                  <button
                    key={s}
                    onClick={() => set('situacoesVenda', f.situacoesVenda.includes(s)
                      ? f.situacoesVenda.filter(x => x !== s)
                      : [...f.situacoesVenda, s]
                    )}
                    className={[
                      'px-2.5 py-0.5 rounded-full text-xs border transition-colors',
                      f.situacoesVenda.includes(s)
                        ? 'bg-[#7C4DFF] border-[#7C4DFF] text-white'
                        : 'border-[var(--d2b-border-strong)] text-[var(--d2b-text-secondary)] hover:border-[#7C4DFF]',
                    ].join(' ')}
                  >
                    {s}
                  </button>
                ))}
              </div>
            </div>
            <div>
              <label className={LBL}>Filtrar depósitos</label>
              <div className="relative">
                <select className={SEL} value={f.filtrarDepositos} onChange={e => set('filtrarDepositos', e.target.value)}>
                  <option value="Geral">Geral</option>
                </select>
                <ChevronDown size={13} className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none text-[var(--d2b-text-muted)]" />
              </div>
            </div>
          </div>

          {/* Col 3 */}
          <div className="flex flex-col gap-4">
            <div>
              <label className={LBL}>Filtrar tags</label>
              <div className="relative">
                <select className={SEL} value={f.filtrarTags} onChange={e => set('filtrarTags', e.target.value)}>
                  <option>Sem filtro por tags</option>
                </select>
                <ChevronDown size={13} className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none text-[var(--d2b-text-muted)]" />
              </div>
            </div>
            <div>
              <label className={LBL}>Filtrar Fornecedores</label>
              <div className="flex items-center gap-2 border border-[var(--d2b-border-strong)] rounded-md px-3 h-10 bg-[var(--d2b-bg-main)]">
                <Search size={13} className="text-[var(--d2b-text-muted)] shrink-0" />
                <input
                  value={f.filtrarFornecedores}
                  onChange={e => set('filtrarFornecedores', e.target.value)}
                  placeholder="Pesquise fornecedores..."
                  className="flex-1 bg-transparent text-sm text-[var(--d2b-text-primary)] placeholder:text-[var(--d2b-text-muted)] outline-none"
                />
                {f.filtrarFornecedores && (
                  <button onClick={() => set('filtrarFornecedores', '')} className="text-xs text-[#7C4DFF]">remover</button>
                )}
              </div>
            </div>
            <div>
              <label className={LBL}>Produto</label>
              <input className={INP} value={f.produto} onChange={e => set('produto', e.target.value)} placeholder="Pesquise por produto..." />
            </div>
          </div>

          {/* Col 4 */}
          <div className="flex flex-col gap-4">
            <div>
              <label className={LBL}>Informações adicionais visíveis</label>
              <div className="relative">
                <select className={SEL} value={f.informacoesAdicionais} onChange={e => set('informacoesAdicionais', e.target.value)}>
                  <option>Sem informações visíveis</option>
                  <option>Estoque mínimo</option>
                  <option>Estoque máximo</option>
                  <option>Estoque mínimo e máximo</option>
                </select>
                <ChevronDown size={13} className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none text-[var(--d2b-text-muted)]" />
              </div>
            </div>
            <div>
              <label className={LBL}>
                Natureza de operação <Info size={11} className="inline mb-0.5 text-[var(--d2b-text-muted)]" />
              </label>
              <div className="relative">
                <select className={SEL} value={f.naturezaOperacao} onChange={e => set('naturezaOperacao', e.target.value)}>
                  <option>Sem filtro por natureza</option>
                </select>
                <ChevronDown size={13} className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none text-[var(--d2b-text-muted)]" />
              </div>
            </div>
          </div>
        </div>

        {/* Checkboxes */}
        <div className="flex flex-col gap-2 mb-6">
          {[
            { key: 'considerarTransferencias' as const, label: 'Considerar lançamentos de transferência' },
            { key: 'considerarSaidasPrevistas' as const, label: 'Considerar saídas previstas para cálculo de compra' },
          ].map(({ key, label }) => (
            <label key={key} className="flex items-center gap-2 cursor-pointer select-none">
              <input
                type="checkbox"
                checked={f[key]}
                onChange={e => set(key, e.target.checked)}
                className="w-4 h-4 rounded accent-[#7C4DFF]"
              />
              <span className="text-sm text-[var(--d2b-text-secondary)]">{label}</span>
            </label>
          ))}
        </div>

        {/* gerar */}
        <button onClick={onGerar} className={BTN_PRIMARY}>
          gerar
        </button>
      </div>
    </div>
  )
}

// ═══════════════════════════════════════════════════════════════════════════
// EXPORT
// ═══════════════════════════════════════════════════════════════════════════
export function NecessidadesCompraContent() {
  const [tela, setTela] = useState<'filtros' | 'resultado'>('filtros')

  if (tela === 'resultado')
    return (
      <NecessidadesResultado
        itens={MOCK_ITENS}
        onExibirFiltros={() => setTela('filtros')}
      />
    )

  return <NecessidadesFiltros onGerar={() => setTela('resultado')} />
}
