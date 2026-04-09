'use client'

import { useState } from 'react'
import {
  Search, Filter, Printer, Plus, ArrowLeft, MoreHorizontal,
  Share2, FileText, Pencil, Calendar, Trash2, X, RefreshCw,
} from 'lucide-react'

// ─── Shared styles ────────────────────────────────────────────────────────────
const TH = 'text-left px-3 py-3 text-xs font-semibold text-[var(--d2b-text-secondary)] uppercase tracking-wider whitespace-nowrap'
const TD = 'px-3 py-3 text-sm text-[var(--d2b-text-primary)] whitespace-nowrap'
const BTN_PRIMARY   = 'flex items-center gap-2 px-4 py-2 rounded-full text-sm font-bold text-white bg-[#7C4DFF] hover:bg-[#5B21B6] transition-colors'
const BTN_OUTLINE   = 'flex items-center gap-2 px-3 py-1.5 rounded-md text-sm font-medium border border-[var(--d2b-border-strong)] text-[var(--d2b-text-secondary)] hover:border-[#7C4DFF] hover:text-[var(--d2b-text-primary)] bg-transparent transition-colors'
const BTN_GHOST     = 'flex items-center gap-2 px-3 py-1.5 rounded-md text-sm text-[var(--d2b-text-secondary)] hover:bg-[var(--d2b-hover)] transition-colors'
const INP           = 'w-full bg-[var(--d2b-bg-main)] border border-[var(--d2b-border-strong)] rounded-md px-3 py-2 text-sm text-[var(--d2b-text-primary)] placeholder:text-[var(--d2b-text-muted)] focus:outline-none focus:border-[#7C4DFF] transition-colors'
const INP_RO        = 'w-full bg-[var(--d2b-bg-elevated)] border border-[var(--d2b-border)] rounded-md px-3 py-1.5 text-sm text-[var(--d2b-text-primary)]'
const LBL           = 'block text-xs text-[var(--d2b-text-secondary)] mb-1'
const SEL           = 'w-full bg-[var(--d2b-bg-main)] border border-[var(--d2b-border-strong)] rounded-md px-3 py-2 text-sm text-[var(--d2b-text-primary)] focus:outline-none focus:border-[#7C4DFF] transition-colors appearance-none'

// ─── Types ───────────────────────────────────────────────────────────────────
type Tela        = 'lista' | 'detalhe' | 'editar'
type StatusTab   = 'todos' | 'em_aberto' | 'aprovado' | 'preparando_envio' | 'faturado' | 'pronto_envio' | 'enviado' | 'entregue' | 'nao_entregue'
type ItemsTab    = 'itens' | 'comissoes' | 'impostos'
type PagTab      = 'pagamento' | 'pagamento_integrado'

const STATUS_TABS: { id: StatusTab; label: string; count?: number }[] = [
  { id: 'todos',           label: 'todos',           count: 2  },
  { id: 'em_aberto',       label: 'em aberto',       count: 1  },
  { id: 'aprovado',        label: 'aprovado'                   },
  { id: 'preparando_envio',label: 'preparando envio',count: 1  },
  { id: 'faturado',        label: 'faturado'                   },
  { id: 'pronto_envio',    label: 'pronto para envio'          },
  { id: 'enviado',         label: 'enviado'                    },
  { id: 'entregue',        label: 'entregue'                   },
  { id: 'nao_entregue',    label: 'não entregue'               },
]

const STATUS_DOT: Record<string, string> = {
  em_aberto:        '#F59E0B',
  aprovado:         '#3B82F6',
  preparando_envio: '#8B5CF6',
  faturado:         '#10B981',
  pronto_envio:     '#06B6D4',
  enviado:          '#6366F1',
  entregue:         '#22C55E',
  nao_entregue:     '#EF4444',
}

const MOCK_PEDIDOS = [
  {
    id: '1',
    numero: 1,
    data: '07/04/2026',
    previsto: '',
    dataDespacho: '',
    cliente: 'BS TECNOLOGIA LTDA',
    cnpj: '',
    total: 0.00,
    nrPedido: '',
    rastreamento: '',
    marcadores: ['1ª venda'],
    status: 'em_aberto',
  },
]

const MAIS_ACOES = [
  ['gerar nota fiscal', 'gerar NFC-e', 'faturar parcialmente', 'gerar nota de serviço', 'gerar ordem de serviço', 'emitir cobrança', 'lançar contas', 'gerar ordem de compra', 'lançar estoque', 'lançar matéria-prima'],
  ['compartilhar', 'clonar venda', 'devolver produtos', 'excluir venda'],
  ['imprimir', 'salvar em PDF', 'imprimir carnê'],
  ['imprimir pedido para produção', 'gerar ordem de produção', 'cotar fretes', 'enviar para separação', 'enviar para expedição', 'enviar código de rastreio por e-mail', 'enviar pedido para empresas'],
  ['ocorrências', 'alterar situação'],
]

// ─── Item row type ────────────────────────────────────────────────────────────
const MOCK_ITEM = { descricao: 'Teste', sku: '', qtde: '1,00', un: 'UNIDAD', precoUn: '0,00', precoTotal: '0,00' }

// ═══════════════════════════════════════════════════════════════════════════
// PedidosVendaContent
// ═══════════════════════════════════════════════════════════════════════════
export function PedidosVendaContent() {
  const [tela, setTela]       = useState<Tela>('lista')
  const [statusTab, setStatusTab] = useState<StatusTab>('em_aberto')
  const [search, setSearch]   = useState('')
  const [showMais, setShowMais]   = useState(false)
  const [itemsTab, setItemsTab]   = useState<ItemsTab>('itens')
  const [pagTab, setPagTab]       = useState<PagTab>('pagamento')
  const [showBanner, setShowBanner] = useState(true)

  // ── form state ──
  const [natureza,   setNatureza]   = useState('(NF-e) Venda de mercadorias de terceiros para consumidor final')
  const [cliente,    setCliente]    = useState('BS TECNOLOGIA LTDA')
  const [vendedor,   setVendedor]   = useState('')
  const [listaPreco, setListaPreco] = useState('Padrão')
  const [endDiff,    setEndDiff]    = useState(false)
  const [dataVenda,  setDataVenda]  = useState('07/04/2026')
  const [dataPrev,   setDataPrev]   = useState('')
  const [dataEnvio,  setDataEnvio]  = useState('')
  const [dataMaxDesp,setDataMaxDesp] = useState('')
  const [nrPedido,   setNrPedido]   = useState('')
  const [idEcomm,    setIdEcomm]    = useState('')
  const [nrCanal,    setNrCanal]    = useState('')
  const [nrEcommOrOC,setNrEcommOrOC]= useState('')
  const [intermediador, setIntermediador] = useState('Sem intermediador')
  const [desconto,   setDesconto]   = useState('0')
  const [freteCli,   setFreteCli]   = useState('0,00')
  const [freteEmp,   setFreteEmp]   = useState('0,00')
  const [despesas,   setDespesas]   = useState('0,00')
  const [formaReceb, setFormaReceb] = useState('Dinheiro')
  const [categoria,  setCategoria]  = useState('')
  const [formaEnvio, setFormaEnvio] = useState('Não definida')
  const [expedicao,  setExpedicao]  = useState('Sim')
  const [deposito,   setDeposito]   = useState('Geral')
  const [obs,        setObs]        = useState('')
  const [obsInt,     setObsInt]     = useState('')
  const [marcadores, setMarcadores] = useState('1ª venda')

  const selected = MOCK_PEDIDOS[0]

  // ───────────────────────────────────────────────────────────────────────────
  // Shared item tables
  // ───────────────────────────────────────────────────────────────────────────
  function ItemTabsContent({ editable }: { editable: boolean }) {
    return (
      <div>
        {/* sub-tabs */}
        <div className="flex gap-1 border-b border-[var(--d2b-border)] mb-4">
          {(['itens','comissoes','impostos'] as ItemsTab[]).map(t => (
            <button
              key={t}
              onClick={() => setItemsTab(t)}
              className={[
                'px-4 py-2 text-sm font-medium border-b-2 -mb-px transition-colors',
                itemsTab === t
                  ? 'border-[#7C4DFF] text-[#7C4DFF]'
                  : 'border-transparent text-[var(--d2b-text-secondary)] hover:text-[var(--d2b-text-primary)]',
              ].join(' ')}
            >
              {t === 'itens' ? 'Itens de produtos ou serviços' : t === 'comissoes' ? 'Comissões' : 'Impostos'}
            </button>
          ))}
        </div>

        {itemsTab === 'itens' && (
          <div className="border border-[var(--d2b-border)] rounded-xl overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-[var(--d2b-bg-elevated)]">
                <tr>
                  <th className={TH}>Nº</th>
                  <th className={TH}>Descrição</th>
                  <th className={TH}>Código (SKU)</th>
                  <th className={TH}>Qtde</th>
                  <th className={TH}>UN</th>
                  <th className={TH}>Preço un</th>
                  <th className={TH}>Preço total</th>
                  {editable && <th className={TH}>Ações</th>}
                </tr>
              </thead>
              <tbody>
                <tr className="border-t border-[var(--d2b-border)] hover:bg-[var(--d2b-hover)] transition-colors">
                  <td className={TD}>1</td>
                  <td className={TD}>{MOCK_ITEM.descricao}</td>
                  <td className={TD}><span className="text-[var(--d2b-text-muted)]">—</span></td>
                  <td className={TD}>{MOCK_ITEM.qtde}</td>
                  <td className={TD}>{MOCK_ITEM.un}</td>
                  <td className={TD}>{MOCK_ITEM.precoUn}</td>
                  <td className={TD}>{MOCK_ITEM.precoTotal}</td>
                  {editable && (
                    <td className={TD}>
                      <div className="flex items-center gap-2">
                        <button className="text-xs text-[#7C4DFF] hover:underline">editar</button>
                        <button className="text-[var(--d2b-text-muted)] hover:text-red-500"><Trash2 size={13} /></button>
                        <button className="text-[var(--d2b-text-muted)] hover:text-[var(--d2b-text-primary)]"><RefreshCw size={13} /></button>
                      </div>
                    </td>
                  )}
                </tr>
              </tbody>
            </table>
            {editable && (
              <div className="px-4 py-2 border-t border-[var(--d2b-border)] flex items-center gap-4">
                <button className="flex items-center gap-1 text-sm text-[#7C4DFF] hover:underline">
                  <Plus size={13} /> adicionar outro item
                </button>
                <button className="flex items-center gap-1 text-sm text-[#7C4DFF] hover:underline">
                  <Search size={13} /> busca avançada de itens
                </button>
              </div>
            )}
          </div>
        )}

        {itemsTab === 'comissoes' && (
          <div className="border border-[var(--d2b-border)] rounded-xl overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-[var(--d2b-bg-elevated)]">
                <tr>
                  <th className={TH}>Nº</th>
                  <th className={TH}>Descrição</th>
                  <th className={TH}>Código (SKU)</th>
                  <th className={TH}>Base</th>
                  <th className={TH}>Valor desconto</th>
                  <th className={TH}>%</th>
                  <th className={TH}>Valor comissão</th>
                  {editable && <th className={TH}>Ações</th>}
                </tr>
              </thead>
              <tbody>
                <tr className="border-t border-[var(--d2b-border)] hover:bg-[var(--d2b-hover)] transition-colors">
                  <td className={TD}>1</td>
                  <td className={TD}>Teste</td>
                  <td className={TD}><span className="text-[var(--d2b-text-muted)]">—</span></td>
                  <td className={TD}>0,00</td>
                  <td className={TD}>0,000000</td>
                  <td className={TD}>0,00</td>
                  <td className={TD}>0,00</td>
                  {editable && (
                    <td className={TD}>
                      <div className="flex items-center gap-2">
                        <button className="text-xs text-[#7C4DFF] hover:underline">editar</button>
                        <button className="text-[var(--d2b-text-muted)] hover:text-red-500"><Trash2 size={13} /></button>
                        <button className="text-[var(--d2b-text-muted)]"><RefreshCw size={13} /></button>
                      </div>
                    </td>
                  )}
                </tr>
              </tbody>
            </table>
            {editable && (
              <div className="px-4 py-2 border-t border-[var(--d2b-border)] flex items-center gap-4">
                <button className="flex items-center gap-1 text-sm text-[#7C4DFF] hover:underline"><Plus size={13} /> adicionar outro item</button>
                <button className="flex items-center gap-1 text-sm text-[#7C4DFF] hover:underline"><Search size={13} /> busca avançada de itens</button>
              </div>
            )}
          </div>
        )}

        {itemsTab === 'impostos' && (
          <div className="border border-[var(--d2b-border)] rounded-xl overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-[var(--d2b-bg-elevated)]">
                <tr>
                  <th className={TH}>Nº</th>
                  <th className={TH}>Descrição</th>
                  <th className={TH}>Código (SKU)</th>
                  <th className={TH}>MVA%</th>
                  <th className={TH}>ICMS ST%</th>
                  <th className={TH}>ICMS ST R$</th>
                  <th className={TH}>FCP ST%</th>
                  <th className={TH}>FCP ST R$</th>
                  <th className={TH}>IPI%</th>
                  <th className={TH}>IPI R$</th>
                  {editable && <th className={TH}>Ações</th>}
                </tr>
              </thead>
              <tbody>
                <tr className="border-t border-[var(--d2b-border)] hover:bg-[var(--d2b-hover)] transition-colors">
                  <td className={TD}>1</td>
                  <td className={TD}>Teste</td>
                  <td className={TD}><span className="text-[var(--d2b-text-muted)]">—</span></td>
                  {Array(8).fill('0,00').map((v, i) => <td key={i} className={TD}>{v}</td>)}
                  {editable && (
                    <td className={TD}>
                      <div className="flex items-center gap-2">
                        <button className="text-xs text-[#7C4DFF] hover:underline">editar</button>
                        <button className="text-[var(--d2b-text-muted)] hover:text-red-500"><Trash2 size={13} /></button>
                        <button className="text-[var(--d2b-text-muted)]"><RefreshCw size={13} /></button>
                      </div>
                    </td>
                  )}
                </tr>
              </tbody>
            </table>
            {editable && (
              <div className="px-4 py-2 border-t border-[var(--d2b-border)] flex items-center gap-4">
                <button className="flex items-center gap-1 text-sm text-[#7C4DFF] hover:underline"><Plus size={13} /> adicionar outro item</button>
                <button className="flex items-center gap-1 text-sm text-[#7C4DFF] hover:underline"><Search size={13} /> busca avançada de itens</button>
              </div>
            )}
          </div>
        )}
      </div>
    )
  }

  // ───────────────────────────────────────────────────────────────────────────
  // Totals block (shared between view/edit)
  // ───────────────────────────────────────────────────────────────────────────
  function TotaisBlock({ editable }: { editable: boolean }) {
    const fields = [
      { l: 'Nº de itens', v: '1' }, { l: 'Soma das qtdes', v: '1,00' },
      { l: 'Peso Bruto', v: '0,000', unit: 'kg' }, { l: 'Peso Líquido', v: '0,000', unit: 'kg' },
      { l: 'Total produtos', v: 'R$ 0,00' }, { l: 'Valor IPI', v: 'R$ 0,00' },
      { l: 'Valor ICMS ST + FCP ST', v: 'R$ 0,00' }, { l: 'Total da venda', v: 'R$ 0,00' },
    ]
    return (
      <div className="border border-[var(--d2b-border)] rounded-xl p-4 mt-4">
        <h3 className="text-sm font-semibold text-[var(--d2b-text-primary)] mb-3">Totais</h3>
        <div className="grid grid-cols-4 gap-3 text-sm">
          {fields.map(f => (
            <div key={f.l}>
              <label className={LBL}>{f.l}</label>
              {editable ? (
                <div className="flex items-center gap-1">
                  <input className={INP_RO + ' flex-1'} value={f.v} readOnly />
                  {f.unit && <span className="text-xs text-[var(--d2b-text-muted)]">{f.unit}</span>}
                </div>
              ) : (
                <p className="text-[var(--d2b-text-primary)]">{f.v}{f.unit ? ` ${f.unit}` : ''}</p>
              )}
            </div>
          ))}
        </div>
      </div>
    )
  }

  // ───────────────────────────────────────────────────────────────────────────
  // Payment block (shared)
  // ───────────────────────────────────────────────────────────────────────────
  function PagamentoBlock({ editable }: { editable: boolean }) {
    return (
      <div className="border border-[var(--d2b-border)] rounded-xl p-4 mt-4">
        <div className="flex gap-4 border-b border-[var(--d2b-border)] mb-4 -mx-4 px-4">
          {(['pagamento','pagamento_integrado'] as PagTab[]).map(t => (
            <button
              key={t}
              onClick={() => setPagTab(t)}
              className={[
                'pb-3 text-sm font-medium border-b-2 -mb-px transition-colors',
                pagTab === t ? 'border-[#7C4DFF] text-[#7C4DFF]' : 'border-transparent text-[var(--d2b-text-secondary)]',
              ].join(' ')}
            >
              {t === 'pagamento' ? 'Pagamento' : 'Pagamento integrado'}
            </button>
          ))}
        </div>

        {pagTab === 'pagamento' && (
          <div>
            <h4 className="text-sm font-semibold text-[var(--d2b-text-primary)] mb-2">Pagamento</h4>
            {editable ? (
              <>
                <p className="text-xs text-[var(--d2b-text-secondary)] mb-3">
                  Comece escolhendo a forma de recebimento. Agora, você pode antecipar boletos dos seus pedidos de venda.{' '}
                  <button className="text-[#7C4DFF] hover:underline">Saiba como funciona.</button>
                </p>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className={LBL}>Forma de recebimento</label>
                    <div className="relative">
                      <select value={formaReceb} onChange={e => setFormaReceb(e.target.value)} className={SEL}>
                        <option>Dinheiro</option><option>Pix</option><option>Cartão de crédito</option><option>Boleto</option>
                      </select>
                      <span className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-[var(--d2b-text-muted)]">▾</span>
                    </div>
                  </div>
                  <div>
                    <label className={LBL}>Categoria</label>
                    <div className="relative">
                      <select value={categoria} onChange={e => setCategoria(e.target.value)} className={SEL}>
                        <option value="">Selecione</option><option>Vendas</option>
                      </select>
                      <span className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-[var(--d2b-text-muted)]">▾</span>
                    </div>
                  </div>
                </div>
              </>
            ) : (
              <p className="text-sm text-[var(--d2b-text-muted)]">Nenhuma forma de pagamento registrada.</p>
            )}
          </div>
        )}

        {pagTab === 'pagamento_integrado' && (
          <div>
            <h4 className="text-sm font-semibold text-[var(--d2b-text-primary)] mb-3">
              Pagamento integrado <span className="text-[var(--d2b-text-muted)] font-normal">ⓘ</span>
            </h4>
            <table className="w-full text-sm border border-[var(--d2b-border)] rounded-lg overflow-hidden">
              <thead className="bg-[var(--d2b-bg-elevated)]">
                <tr>
                  <th className={TH}>Nº</th>
                  <th className={TH}>Meio de pagamento</th>
                  <th className={TH}>Valor</th>
                  <th className={TH}>CNPJ do intermediador</th>
                  <th className={TH}>Código de autenticação</th>
                </tr>
              </thead>
              <tbody>
                <tr><td colSpan={5} className="px-4 py-3 text-xs text-[var(--d2b-text-muted)] text-center">Nenhuma parcela adicionada.</td></tr>
              </tbody>
            </table>
            {editable && (
              <button className="mt-2 flex items-center gap-1 text-sm text-[#7C4DFF] hover:underline">
                <Plus size={13} /> adicionar parcela
              </button>
            )}
          </div>
        )}
      </div>
    )
  }

  // ───────────────────────────────────────────────────────────────────────────
  // DETALHE (view)
  // ───────────────────────────────────────────────────────────────────────────
  if (tela === 'detalhe') {
    return (
      <div className="flex flex-col h-full overflow-hidden">
        {/* top bar */}
        <div className="flex items-center justify-between px-6 py-3 border-b border-[var(--d2b-border)] bg-[var(--d2b-bg-surface)] shrink-0">
          <div className="flex items-center gap-4">
            <button onClick={() => setTela('lista')} className="flex items-center gap-1 text-sm text-[#7C4DFF] hover:underline">
              <ArrowLeft size={14} /> voltar
            </button>
            <span className="text-xs text-[var(--d2b-text-muted)]">início ≡ vendas pedidos de venda</span>
          </div>
          <div className="flex items-center gap-2 relative">
            <button className={BTN_GHOST}><Share2 size={14} /> compartilhar</button>
            <button className={BTN_GHOST}><FileText size={14} /> gerar nota fiscal</button>
            <button onClick={() => setTela('editar')} className={BTN_PRIMARY}><Pencil size={14} /> editar</button>
            <div className="relative">
              <button onClick={() => setShowMais(p => !p)} className={BTN_OUTLINE}>
                mais ações <span className="w-5 h-5 rounded-full bg-[var(--d2b-bg-elevated)] flex items-center justify-center text-xs">⋯</span>
              </button>
              {showMais && (
                <>
                  <div className="fixed inset-0 z-20" onClick={() => setShowMais(false)} />
                  <div className="absolute right-0 top-full mt-1 w-64 bg-[var(--d2b-bg-surface)] border border-[var(--d2b-border)] rounded-xl shadow-lg z-30 overflow-hidden py-1">
                    {MAIS_ACOES.map((group, gi) => (
                      <div key={gi}>
                        {gi > 0 && <div className="border-t border-[var(--d2b-border)] my-1" />}
                        {group.map(item => (
                          <button key={item} className="w-full text-left px-4 py-2 text-sm text-[var(--d2b-text-primary)] hover:bg-[var(--d2b-hover)] capitalize transition-colors">
                            {item}
                          </button>
                        ))}
                      </div>
                    ))}
                  </div>
                </>
              )}
            </div>
          </div>
        </div>

        {/* body */}
        <div className="flex-1 overflow-y-auto px-6 py-4 max-w-4xl mx-auto w-full">
          <h1 className="text-xl font-bold text-[var(--d2b-text-primary)] mb-1">Pedido de Venda</h1>
          <div className="flex items-center gap-2 mb-5">
            <span className="w-2.5 h-2.5 rounded-full bg-amber-400" />
            <span className="text-sm text-[var(--d2b-text-secondary)]">em aberto</span>
          </div>

          <div className="border border-[var(--d2b-border)] rounded-xl p-5 flex flex-col gap-4">
            {/* basic info */}
            <div className="grid grid-cols-[1fr_auto] gap-4 pb-4 border-b border-[var(--d2b-border)]">
              <div>
                <label className={LBL}>Natureza da operação</label>
                <p className="text-sm text-[var(--d2b-text-primary)]">{natureza}</p>
              </div>
              <div>
                <label className={LBL}>Número</label>
                <p className="text-sm font-semibold text-[#7C4DFF]">1</p>
              </div>
            </div>
            <div className="pb-4 border-b border-[var(--d2b-border)]">
              <label className={LBL}>Cliente</label>
              <p className="text-sm font-medium text-[var(--d2b-text-primary)] mb-1">{cliente}</p>
              <div className="flex gap-3">
                <button className="text-xs text-[#7C4DFF] hover:underline">dados do cliente</button>
                <button className="text-xs text-[#7C4DFF] hover:underline">ver últimas vendas</button>
              </div>
            </div>
            <div className="pb-4 border-b border-[var(--d2b-border)]">
              <label className={LBL}>Lista de preço</label>
              <p className="text-sm text-[var(--d2b-text-primary)]">Padrão</p>
            </div>

            <ItemTabsContent editable={false} />
            <TotaisBlock editable={false} />

            {/* Detalhes da venda */}
            <div className="border border-[var(--d2b-border)] rounded-xl p-4 mt-2">
              <h3 className="text-sm font-semibold text-[var(--d2b-text-primary)] mb-1">Detalhes da venda</h3>
              <p className="text-xs text-[var(--d2b-text-muted)] mb-3">Cadastrado em: 07/04/2026 14:45:11</p>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-3 text-sm">
                <div><label className={LBL}>Data da venda</label><p>07/04/2026</p></div>
                <div><label className={LBL}>Intermediador</label><p>Sem intermediador</p></div>
                <div><label className={LBL}>Desconto</label><p>0</p></div>
                <div><label className={LBL}>Frete pago pelo cliente</label><p>R$ 0,00</p></div>
                <div><label className={LBL}>Frete pago pela empresa</label><p>R$ 0,00</p></div>
                <div><label className={LBL}>Despesas</label><p>R$ 0,00</p></div>
              </div>
            </div>

            <PagamentoBlock editable={false} />

            {/* Transportador */}
            <div className="border border-[var(--d2b-border)] rounded-xl p-4 mt-2">
              <h3 className="text-sm font-semibold text-[var(--d2b-text-primary)] mb-3">Transportador / Volumes</h3>
              <div className="grid grid-cols-2 gap-3 text-sm">
                <div><label className={LBL}>Forma de envio</label><p>Não definida</p></div>
                <div><label className={LBL}>Enviar para expedição</label><p>Sim</p></div>
              </div>
            </div>

            {/* Dados adicionais */}
            <div className="border border-[var(--d2b-border)] rounded-xl p-4 mt-2">
              <h3 className="text-sm font-semibold text-[var(--d2b-text-primary)] mb-3">Dados adicionais</h3>
              <div className="grid grid-cols-1 gap-3 text-sm">
                <div><label className={LBL}>Depósito</label><p>Geral</p></div>
                <div><label className={LBL}>Observações</label><p className="text-[var(--d2b-text-muted)]">—</p></div>
                <div><label className={LBL}>Observações Internas</label><p className="text-[var(--d2b-text-muted)]">—</p></div>
                <div className="flex items-center gap-2 mt-1">
                  <span className="w-2.5 h-2.5 rounded-full bg-[#7C4DFF] inline-block" />
                  <span className="text-sm text-[var(--d2b-text-secondary)]">1ª venda</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    )
  }

  // ───────────────────────────────────────────────────────────────────────────
  // EDITAR / CRIAR
  // ───────────────────────────────────────────────────────────────────────────
  if (tela === 'editar') {
    return (
      <div className="flex flex-col h-full overflow-hidden">
        {/* top bar */}
        <div className="flex items-center justify-between px-6 py-3 border-b border-[var(--d2b-border)] bg-[var(--d2b-bg-surface)] shrink-0">
          <div className="flex items-center gap-4">
            <button onClick={() => setTela('lista')} className="flex items-center gap-1 text-sm text-[#7C4DFF] hover:underline">
              <ArrowLeft size={14} /> voltar
            </button>
            <span className="text-xs text-[var(--d2b-text-muted)]">início ≡ vendas pedidos de venda</span>
          </div>
        </div>

        <div className="flex-1 overflow-y-auto px-6 py-4 max-w-4xl mx-auto w-full">
          <h1 className="text-xl font-bold text-[var(--d2b-text-primary)] mb-1">Pedido de Venda</h1>
          <div className="flex items-center gap-2 mb-5">
            <span className="w-2.5 h-2.5 rounded-full bg-amber-400" />
            <span className="text-sm text-[var(--d2b-text-secondary)]">em aberto</span>
          </div>

          <div className="border border-[var(--d2b-border)] rounded-xl p-5 flex flex-col gap-5">
            {/* basic info */}
            <div className="grid grid-cols-[1fr_160px] gap-4">
              <div>
                <label className={LBL}>Natureza da operação</label>
                <input className={INP} value={natureza} onChange={e => setNatureza(e.target.value)} />
              </div>
              <div>
                <label className={LBL}>Número</label>
                <input className={INP_RO} value="1" readOnly />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className={LBL}>Cliente</label>
                <div className="relative">
                  <input className={INP + ' pr-8'} value={cliente} onChange={e => setCliente(e.target.value)} />
                  <Search size={14} className="absolute right-3 top-1/2 -translate-y-1/2 text-[var(--d2b-text-muted)]" />
                </div>
                <div className="flex gap-3 mt-1">
                  <button className="text-xs text-[#7C4DFF] hover:underline">dados do cliente</button>
                  <button className="text-xs text-[#7C4DFF] hover:underline">ver últimas vendas</button>
                  <button className="text-xs text-[#7C4DFF] hover:underline">limite de crédito</button>
                </div>
              </div>
              <div>
                <label className={LBL}>Vendedor</label>
                <input className={INP} value={vendedor} onChange={e => setVendedor(e.target.value)} placeholder="Nome do vendedor" />
              </div>
            </div>

            <div>
              <label className={LBL}>Lista de preço</label>
              <div className="flex items-center gap-2">
                <div className="relative w-48">
                  <select value={listaPreco} onChange={e => setListaPreco(e.target.value)} className={SEL}>
                    <option>Padrão</option>
                  </select>
                  <span className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-[var(--d2b-text-muted)]">▾</span>
                </div>
                <button className="text-[var(--d2b-text-muted)] hover:text-[var(--d2b-text-primary)]"><RefreshCw size={14} /></button>
              </div>
            </div>

            <label className="flex items-center gap-2 cursor-pointer">
              <input type="checkbox" checked={endDiff} onChange={e => setEndDiff(e.target.checked)} className="accent-[#7C4DFF] rounded" />
              <span className="text-sm text-[var(--d2b-text-secondary)]">O endereço de entrega do cliente é diferente do endereço de cobrança</span>
            </label>

            <ItemTabsContent editable={true} />
            <TotaisBlock editable={true} />

            {/* Detalhes da venda */}
            <div className="border border-[var(--d2b-border)] rounded-xl p-4">
              <h3 className="text-sm font-semibold text-[var(--d2b-text-primary)] mb-1">Detalhes da venda</h3>
              <p className="text-xs text-[var(--d2b-text-muted)] mb-4">Cadastrado em: 07/04/2026 14:45:11</p>

              <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                <div>
                  <label className={LBL}>Data da venda</label>
                  <div className="relative">
                    <input className={INP} value={dataVenda} onChange={e => setDataVenda(e.target.value)} placeholder="dd/mm/aaaa" />
                    <Calendar size={13} className="absolute right-3 top-1/2 -translate-y-1/2 text-[var(--d2b-text-muted)]" />
                  </div>
                  <p className="text-xs text-[var(--d2b-text-muted)] mt-0.5">(dd/mm/aaaa)</p>
                </div>
                <div>
                  <label className={LBL}>Data prevista de entrega</label>
                  <div className="relative">
                    <input className={INP} value={dataPrev} onChange={e => setDataPrev(e.target.value)} placeholder="dd/mm/aaaa" />
                    <Calendar size={13} className="absolute right-3 top-1/2 -translate-y-1/2 text-[var(--d2b-text-muted)]" />
                  </div>
                  <p className="text-xs text-[var(--d2b-text-muted)] mt-0.5">(dd/mm/aaaa)</p>
                </div>
                <div>
                  <label className={LBL}>Data de envio</label>
                  <div className="relative">
                    <input className={INP} value={dataEnvio} onChange={e => setDataEnvio(e.target.value)} placeholder="dd/mm/aaaa hh:mm" />
                    <Calendar size={13} className="absolute right-3 top-1/2 -translate-y-1/2 text-[var(--d2b-text-muted)]" />
                  </div>
                  <p className="text-xs text-[var(--d2b-text-muted)] mt-0.5">(dd/mm/aaaa hh:mm)</p>
                </div>
                <div>
                  <label className={LBL}>Data máxima de despacho <span className="text-[var(--d2b-text-muted)]">ⓘ</span></label>
                  <input className={INP} value={dataMaxDesp} onChange={e => setDataMaxDesp(e.target.value)} placeholder="dd/mm/aaaa hh:mm" />
                  <p className="text-xs text-[var(--d2b-text-muted)] mt-0.5">(dd/mm/aaaa hh:mm)</p>
                </div>
                <div>
                  <label className={LBL}>Nº pedido</label>
                  <input className={INP} value={nrPedido} onChange={e => setNrPedido(e.target.value)} />
                </div>
                <div>
                  <label className={LBL}>Identificador do pedido e-commerce</label>
                  <input className={INP} value={idEcomm} onChange={e => setIdEcomm(e.target.value)} />
                </div>
                <div>
                  <label className={LBL}>Nº do pedido no canal de venda</label>
                  <input className={INP} value={nrCanal} onChange={e => setNrCanal(e.target.value)} />
                </div>
                <div>
                  <label className={LBL}>Intermediador</label>
                  <div className="relative">
                    <select value={intermediador} onChange={e => setIntermediador(e.target.value)} className={SEL}>
                      <option>Sem intermediador</option>
                    </select>
                    <span className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-[var(--d2b-text-muted)]">▾</span>
                  </div>
                </div>
                <div className="col-span-2 md:col-span-4">
                  <label className={LBL}>Nº do pedido no e-commerce ou Nº da ordem de compra</label>
                  <input className={INP} value={nrEcommOrOC} onChange={e => setNrEcommOrOC(e.target.value)} />
                </div>
                <div>
                  <label className={LBL}>Desconto</label>
                  <input className={INP} value={desconto} onChange={e => setDesconto(e.target.value)} />
                  <p className="text-xs text-[var(--d2b-text-muted)] mt-0.5">(Ex: 3,00 ou 10%)</p>
                </div>
                <div>
                  <label className={LBL}>Frete pago pelo cliente</label>
                  <div className="flex items-center gap-1">
                    <span className="text-sm text-[var(--d2b-text-muted)]">R$</span>
                    <input className={INP} value={freteCli} onChange={e => setFreteCli(e.target.value)} />
                  </div>
                  <p className="text-xs text-[var(--d2b-text-muted)] mt-0.5">Este valor será transferido e considerado na nota fiscal</p>
                </div>
                <div>
                  <label className={LBL}>Frete pago pela empresa</label>
                  <div className="flex items-center gap-1">
                    <span className="text-sm text-[var(--d2b-text-muted)]">R$</span>
                    <input className={INP} value={freteEmp} onChange={e => setFreteEmp(e.target.value)} />
                  </div>
                  <p className="text-xs text-[var(--d2b-text-muted)] mt-0.5">Valor informativo, de uso interno para apuração de custos</p>
                </div>
                <div>
                  <label className={LBL}>Despesas</label>
                  <div className="flex items-center gap-1">
                    <span className="text-sm text-[var(--d2b-text-muted)]">R$</span>
                    <input className={INP} value={despesas} onChange={e => setDespesas(e.target.value)} />
                  </div>
                </div>
              </div>
            </div>

            <PagamentoBlock editable={true} />

            {/* banner */}
            {showBanner && (
              <div className="flex items-center justify-between p-3 bg-blue-50 border border-blue-200 rounded-lg text-sm text-blue-800">
                <span>Conheça a nova conta digital do olist! <button className="text-[#7C4DFF] hover:underline">Saiba mais clicando aqui.</button></span>
                <button onClick={() => setShowBanner(false)} className="text-blue-400 hover:text-blue-600 ml-3"><X size={14} /></button>
              </div>
            )}

            {/* Transportador */}
            <div className="border border-[var(--d2b-border)] rounded-xl p-4">
              <h3 className="text-sm font-semibold text-[var(--d2b-text-primary)] mb-3">Transportador / Volumes</h3>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className={LBL}>Forma de envio</label>
                  <div className="relative">
                    <select value={formaEnvio} onChange={e => setFormaEnvio(e.target.value)} className={SEL}>
                      <option>Não definida</option><option>Correios</option><option>Transportadora</option>
                    </select>
                    <span className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-[var(--d2b-text-muted)]">▾</span>
                  </div>
                </div>
                <div>
                  <label className={LBL}>Enviar para expedição</label>
                  <div className="relative">
                    <select value={expedicao} onChange={e => setExpedicao(e.target.value)} className={SEL}>
                      <option>Sim</option><option>Não</option>
                    </select>
                    <span className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-[var(--d2b-text-muted)]">▾</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Dados adicionais */}
            <div className="border border-[var(--d2b-border)] rounded-xl p-4">
              <h3 className="text-sm font-semibold text-[var(--d2b-text-primary)] mb-3">Dados adicionais</h3>
              <div className="flex flex-col gap-3">
                <div>
                  <label className={LBL}>Depósito</label>
                  <div className="relative w-48">
                    <select value={deposito} onChange={e => setDeposito(e.target.value)} className={SEL}>
                      <option>Geral</option><option>Padrão</option>
                    </select>
                    <span className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-[var(--d2b-text-muted)]">▾</span>
                  </div>
                </div>
                <div>
                  <label className={LBL}>Observações</label>
                  <textarea className={INP + ' resize-none'} rows={3} value={obs} onChange={e => setObs(e.target.value)} />
                  <p className="text-xs text-[var(--d2b-text-muted)] mt-0.5">Esta informação será impressa na venda e transferida para as observações da nota.</p>
                </div>
                <div>
                  <label className={LBL}>Observações Internas</label>
                  <textarea className={INP + ' resize-none'} rows={3} value={obsInt} onChange={e => setObsInt(e.target.value)} />
                  <p className="text-xs text-[var(--d2b-text-muted)] mt-0.5">Esta informação é de uso interno, portanto somente exibida na impressão detalhada</p>
                </div>
              </div>
            </div>

            {/* Anexos */}
            <div>
              <h3 className="text-sm font-semibold text-[var(--d2b-text-primary)] mb-2">Anexos</h3>
              <button className="flex items-center gap-2 px-3 py-1.5 rounded-md text-sm border border-[var(--d2b-border-strong)] text-[#7C4DFF] hover:bg-[var(--d2b-hover)] transition-colors">
                <Plus size={13} /> procurar arquivo
              </button>
              <p className="text-xs text-[var(--d2b-text-muted)] mt-1">O tamanho do arquivo não deve ultrapassar 2 MB</p>
            </div>

            {/* Marcadores */}
            <div>
              <label className={LBL}>Marcadores</label>
              <div className="flex flex-wrap items-center gap-2 p-2 border border-[var(--d2b-border-strong)] rounded-md bg-[var(--d2b-bg-main)] min-h-[38px]">
                {marcadores.split(',').filter(Boolean).map(m => (
                  <span key={m} className="flex items-center gap-1 px-2 py-0.5 rounded-full bg-[var(--d2b-bg-elevated)] border border-[var(--d2b-border)] text-xs text-[var(--d2b-text-primary)]">
                    <span className="w-2 h-2 rounded-full bg-[#7C4DFF] inline-block" />
                    {m.trim()}
                    <button onClick={() => setMarcadores('')} className="text-[var(--d2b-text-muted)] hover:text-red-400"><X size={10} /></button>
                  </span>
                ))}
                <input
                  className="flex-1 min-w-[120px] bg-transparent text-sm text-[var(--d2b-text-primary)] outline-none placeholder:text-[var(--d2b-text-muted)]"
                  placeholder="Separados por vírgula ou tab"
                />
              </div>
            </div>
          </div>

          {/* footer */}
          <div className="flex items-center gap-3 mt-6 pb-6">
            <button onClick={() => setTela('detalhe')} className={BTN_PRIMARY}>salvar</button>
            <button onClick={() => setTela('lista')} className="text-sm text-[var(--d2b-text-secondary)] hover:text-[var(--d2b-text-primary)]">cancelar</button>
          </div>
        </div>
      </div>
    )
  }

  // ───────────────────────────────────────────────────────────────────────────
  // LISTA
  // ───────────────────────────────────────────────────────────────────────────
  const rows = statusTab === 'em_aberto' ? MOCK_PEDIDOS
               : statusTab === 'todos'   ? MOCK_PEDIDOS
               : []

  return (
    <div className="flex flex-col h-full overflow-hidden">
      {/* top bar */}
      <div className="flex items-center justify-between px-6 py-3 border-b border-[var(--d2b-border)] bg-[var(--d2b-bg-surface)] shrink-0">
        <span className="text-xs text-[var(--d2b-text-muted)]">início ≡ vendas pedidos de venda</span>
        <div className="flex items-center gap-2">
          <button className={BTN_GHOST}><Printer size={14} /> imprimir</button>
          <button onClick={() => setTela('editar')} className={BTN_PRIMARY}>
            <Plus size={14} /> incluir pedido
          </button>
          <button className={BTN_OUTLINE}><MoreHorizontal size={14} /> mais ações</button>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto flex flex-col min-h-0">
        <div className="px-6 pt-4 shrink-0">
          <h1 className="text-xl font-bold text-[var(--d2b-text-primary)] mb-4">Pedidos de venda</h1>

          {/* filters */}
          <div className="flex items-center gap-2 mb-4 flex-wrap">
            <div className="relative flex-1 min-w-[220px] max-w-sm">
              <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-[var(--d2b-text-muted)]" />
              <input
                value={search}
                onChange={e => setSearch(e.target.value)}
                placeholder="Pesquise por cliente ou número"
                className="w-full pl-8 pr-3 py-2 text-sm bg-[var(--d2b-bg-main)] border border-[var(--d2b-border-strong)] rounded-md text-[var(--d2b-text-primary)] placeholder:text-[var(--d2b-text-muted)] focus:outline-none focus:border-[#7C4DFF]"
              />
            </div>
            <button className={BTN_OUTLINE}><Calendar size={13} /> Últimos 30 dias</button>
            <button className={BTN_OUTLINE}><Filter size={13} /> filtros</button>
            <button className="text-sm text-[var(--d2b-text-muted)] hover:text-[var(--d2b-text-primary)]">limpar filtros</button>
          </div>

          {/* status tabs */}
          <div className="flex gap-0 border-b border-[var(--d2b-border)] overflow-x-auto [&::-webkit-scrollbar]:hidden pb-0">
            {STATUS_TABS.map(t => (
              <button
                key={t.id}
                onClick={() => setStatusTab(t.id)}
                className={[
                  'flex items-center gap-1.5 px-3 py-2 text-sm font-medium border-b-2 transition-colors -mb-px shrink-0',
                  statusTab === t.id
                    ? 'border-[#7C4DFF] text-[#7C4DFF]'
                    : 'border-transparent text-[var(--d2b-text-secondary)] hover:text-[var(--d2b-text-primary)]',
                ].join(' ')}
              >
                {t.label}
                {t.count !== undefined && (
                  <span className={`text-xs rounded-sm px-1 font-bold ${statusTab === t.id ? 'text-[#7C4DFF]' : 'text-[var(--d2b-text-muted)]'}`}>
                    {String(t.count).padStart(2, '0')}
                  </span>
                )}
              </button>
            ))}
            <button className="px-3 py-2 text-sm text-[var(--d2b-text-secondary)] border-b-2 border-transparent -mb-px shrink-0">mais ⋯</button>
          </div>
        </div>

        {/* table */}
        <div className="flex-1 overflow-auto px-6 pt-3 pb-16">
          {rows.length > 0 ? (
            <div className="border border-[var(--d2b-border)] rounded-xl overflow-x-auto">
              <table className="w-full">
                <thead className="bg-[var(--d2b-bg-elevated)]">
                  <tr>
                    <th className="w-8 px-3 py-3"><input type="checkbox" className="rounded" /></th>
                    <th className="w-8 px-3 py-3" />
                    <th className={TH}>Nº ↕</th>
                    <th className={TH}>Data ↕</th>
                    <th className={TH}>Previsto</th>
                    <th className={TH}>Data limite despacho ↕</th>
                    <th className={TH}>Cliente ↕</th>
                    <th className={TH}>CNPJ/CPF</th>
                    <th className={TH}>Total ↕</th>
                    <th className={TH}>Nº pedido ↕</th>
                    <th className={TH}>Rastreamento</th>
                    <th className={TH}>Marcadores</th>
                    <th className={TH}>Integrações</th>
                  </tr>
                </thead>
                <tbody>
                  {rows.map(r => (
                    <tr
                      key={r.id}
                      className="border-t border-[var(--d2b-border)] hover:bg-[var(--d2b-hover)] cursor-pointer transition-colors"
                      onClick={() => setTela('detalhe')}
                    >
                      <td className="px-3 py-3" onClick={e => e.stopPropagation()}>
                        <input type="checkbox" className="rounded" />
                      </td>
                      <td className="px-3 py-3">
                        <button className="text-[var(--d2b-text-muted)] hover:text-[var(--d2b-text-primary)]" onClick={e => e.stopPropagation()}>
                          <MoreHorizontal size={14} />
                        </button>
                      </td>
                      <td className={TD}>{r.numero}</td>
                      <td className={TD}>{r.data}</td>
                      <td className={TD}><span className="text-[var(--d2b-text-muted)]">—</span></td>
                      <td className={TD}><span className="text-[var(--d2b-text-muted)]">—</span></td>
                      <td className={TD}>
                        <span className="flex items-center gap-1">
                          {r.cliente}
                          <button className="text-[var(--d2b-text-muted)] hover:text-[var(--d2b-text-primary)]" onClick={e => e.stopPropagation()} title="Copiar">⧉</button>
                        </span>
                      </td>
                      <td className={TD}><span className="text-[var(--d2b-text-muted)]">—</span></td>
                      <td className={TD}>{r.total.toFixed(2).replace('.', ',')}</td>
                      <td className={TD}><span className="text-[var(--d2b-text-muted)]">—</span></td>
                      <td className={TD}><span className="text-[var(--d2b-text-muted)]">—</span></td>
                      <td className={TD}>
                        {r.marcadores.map(m => (
                          <span key={m} className="inline-flex items-center gap-1 text-xs">
                            <span className="w-2 h-2 rounded-full bg-[#7C4DFF]" />{m}
                          </span>
                        ))}
                      </td>
                      <td className={TD}>
                        <div className="flex items-center gap-1">
                          <span className="w-3 h-3 rounded-full bg-amber-400 inline-block" />
                          <span className="text-[var(--d2b-text-muted)]">▾</span>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center py-24 gap-3">
              <p className="text-base text-[var(--d2b-text-secondary)]">Nenhum pedido encontrado para o filtro selecionado.</p>
              <button onClick={() => setStatusTab('todos')} className={BTN_PRIMARY}>ver todos</button>
            </div>
          )}
        </div>

        {/* footer summary */}
        <div className="border-t border-[var(--d2b-border)] bg-[var(--d2b-bg-surface)] px-6 py-3 shrink-0 flex items-center justify-end gap-6">
          <div className="text-right">
            <p className="text-lg font-bold text-[var(--d2b-text-primary)] leading-none">01</p>
            <p className="text-xs text-[var(--d2b-text-muted)]">quantidade</p>
          </div>
          <div className="text-right">
            <p className="text-lg font-bold text-[var(--d2b-text-primary)] leading-none">0,00</p>
            <p className="text-xs text-[var(--d2b-text-muted)]">valor total (R$)</p>
          </div>
          <button className="text-[var(--d2b-text-muted)] hover:text-[var(--d2b-text-primary)]">↑</button>
        </div>
      </div>
    </div>
  )
}
