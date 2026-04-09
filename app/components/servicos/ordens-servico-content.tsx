'use client'

import { useState } from 'react'
import {
  Search, Filter, Printer, Plus, ArrowLeft, MoreHorizontal,
  ChevronDown, Paperclip, Tag, Calendar, Pencil, Trash2,
  FileText, DollarSign, Share2, Copy,
} from 'lucide-react'

// ─── Shared styles ────────────────────────────────────────────────────────────
const TH = 'text-left px-3 py-3 text-xs font-semibold text-[var(--d2b-text-secondary)] uppercase tracking-wider whitespace-nowrap'
const TD = 'px-3 py-3 text-sm text-[var(--d2b-text-primary)] whitespace-nowrap'
const BTN_PRIMARY = 'flex items-center gap-2 px-4 py-2 rounded-full text-sm font-bold text-white bg-[#7C4DFF] hover:bg-[#5B21B6] transition-colors'
const BTN_OUTLINE = 'flex items-center gap-2 px-3 py-1.5 rounded-md text-sm font-medium border border-[var(--d2b-border-strong)] text-[var(--d2b-text-secondary)] hover:border-[#7C4DFF] hover:text-[var(--d2b-text-primary)] bg-transparent transition-colors'
const BTN_GHOST = 'flex items-center gap-2 px-3 py-1.5 rounded-md text-sm text-[var(--d2b-text-secondary)] hover:bg-[var(--d2b-hover)] transition-colors'
const INP = 'w-full bg-[var(--d2b-bg-main)] border border-[var(--d2b-border-strong)] rounded-md px-3 py-2 text-sm text-[var(--d2b-text-primary)] placeholder:text-[var(--d2b-text-muted)] focus:outline-none focus:border-[#7C4DFF] transition-colors'
const INP_RO = 'w-full bg-[var(--d2b-bg-elevated)] border border-[var(--d2b-border)] rounded-md px-3 py-2 text-sm text-[var(--d2b-text-primary)]'
const LBL = 'block text-xs text-[var(--d2b-text-secondary)] mb-1'
const SEL = 'w-full bg-[var(--d2b-bg-main)] border border-[var(--d2b-border-strong)] rounded-md px-3 py-2 text-sm text-[var(--d2b-text-primary)] focus:outline-none focus:border-[#7C4DFF] transition-colors appearance-none'

// ─── Types ────────────────────────────────────────────────────────────────────
type Tela = 'lista' | 'detalhe' | 'form'
type StatusTab = 'todas' | 'em_aberto' | 'orcadas' | 'aprovadas' | 'nao_aprovadas' | 'em_andamento' | 'servico_concluido' | 'canceladas' | 'finalizadas'

const STATUS_TABS: { id: StatusTab; label: string; count?: number }[] = [
  { id: 'todas',            label: 'todas',             count: 1 },
  { id: 'em_aberto',        label: 'em aberto',         count: 1 },
  { id: 'orcadas',          label: 'orçadas'             },
  { id: 'aprovadas',        label: 'aprovadas'           },
  { id: 'nao_aprovadas',    label: 'não aprovadas'       },
  { id: 'em_andamento',     label: 'em andamento'        },
  { id: 'servico_concluido',label: 'serviço concluído'   },
  { id: 'canceladas',       label: 'canceladas'          },
  { id: 'finalizadas',      label: 'finalizadas'         },
]

const STATUS_DOT: Record<string, string> = {
  em_aberto:         '#F59E0B',
  orcadas:           '#8B5CF6',
  aprovadas:         '#3B82F6',
  nao_aprovadas:     '#EF4444',
  em_andamento:      '#06B6D4',
  servico_concluido: '#10B981',
  canceladas:        '#6B7280',
  finalizadas:       '#22C55E',
}

type ItemServico = { id: string; descricao: string; cod: string; quantidade: string; preco: string; desconto: string; valorTotal: string; orcar: boolean }

type OrdemServico = {
  id: string
  numero: number
  data: string
  dataPrevista: string
  dataConclusao: string
  cliente: string
  nomeFantasia: string
  total: number
  status: StatusTab
  listaPreco: string
  descricaoServico: string
  consideracoesFinais: string
  itens: ItemServico[]
  dataInicio: string
  hora: string
  desconto: string
  obsServico: string
  obsInternas: string
  vendedor: string
  comissao: string
  valorComissao: string
  tecnico: string
  orcar: boolean
  formaRecebimento: string
  marcadores: string
}

const MOCK_OS: OrdemServico[] = [
  {
    id: '1',
    numero: 1,
    data: '08/04/2026',
    dataPrevista: '08/04/2026',
    dataConclusao: '',
    cliente: 'JESSE',
    nomeFantasia: '',
    total: 150.00,
    status: 'em_aberto',
    listaPreco: 'Padrão',
    descricaoServico: 'teste',
    consideracoesFinais: 'teste',
    itens: [
      { id: '1', descricao: 'Teste', cod: '', quantidade: '1,00', preco: '150,00', desconto: '', valorTotal: '150,00', orcar: false },
    ],
    dataInicio: '08/04/2026',
    hora: '',
    desconto: '0,00',
    obsServico: '',
    obsInternas: '',
    vendedor: '',
    comissao: '0',
    valorComissao: '0',
    tecnico: '',
    orcar: false,
    formaRecebimento: 'Selecione',
    marcadores: '',
  },
]

const ACOES_DETALHE = [
  ['gerar nota fiscal', 'gerar nota de serviço', 'lançar contas', 'lançar estoque'],
  ['clonar ordem de serviço', 'compartilhar', 'imprimir', 'salvar em PDF', 'imprimir para o técnico'],
  ['alterar situação', 'marcadores', 'finalizar', 'excluir'],
]

// ═══════════════════════════════════════════════════════════════════════════
// OrdensServicoContent
// ═══════════════════════════════════════════════════════════════════════════
export function OrdensServicoContent() {
  const [tela, setTela] = useState<Tela>('lista')
  const [statusTab, setStatusTab] = useState<StatusTab>('em_aberto')
  const [search, setSearch] = useState('')
  const [selected, setSelected] = useState<OrdemServico | null>(null)
  const [form, setForm] = useState<OrdemServico>(MOCK_OS[0])
  const [maisAcoesOpen, setMaisAcoesOpen] = useState(false)
  const [acoesDet, setAcoesDet] = useState(false)

  const setF = (k: keyof OrdemServico, v: unknown) => setForm(p => ({ ...p, [k]: v }))

  const filtered = MOCK_OS.filter(o => {
    const matchStatus = statusTab === 'todas' || statusTab === 'em_aberto'
    const matchSearch = search
      ? o.cliente.toLowerCase().includes(search.toLowerCase()) ||
        String(o.numero).includes(search)
      : true
    return matchStatus && matchSearch
  })

  // ── FORM ─────────────────────────────────────────────────────────────────
  if (tela === 'form') {
    return (
      <div className="flex flex-col h-full overflow-y-auto bg-[var(--d2b-bg-main)]">
        {/* Header */}
        <div className="sticky top-0 z-10 bg-[var(--d2b-bg-surface)] border-b border-[var(--d2b-border)] px-6 py-3 flex items-center gap-3">
          <button onClick={() => setTela(selected ? 'detalhe' : 'lista')} className={BTN_GHOST}>
            <ArrowLeft size={16} /> voltar
          </button>
          <span className="text-xs text-[var(--d2b-text-muted)]">
            início <span className="mx-1">≡</span> serviços <span className="mx-1">{'>'}</span>
            <span className="text-[var(--d2b-text-secondary)]">ordens de serviço</span>
          </span>
        </div>

        <div className="flex-1 px-8 py-6 max-w-4xl mx-auto w-full">
          <h1 className="text-xl font-bold text-[var(--d2b-text-primary)] mb-6">Ordem de Serviço</h1>

          {/* Número */}
          <div className="mb-4 max-w-xs">
            <label className={LBL}>Número</label>
            <input className={INP_RO} value={form.numero} readOnly />
          </div>

          {/* Cliente + Lista de preço */}
          <div className="grid grid-cols-3 gap-4 mb-4">
            <div className="col-span-2">
              <label className={LBL}>Cliente</label>
              <div className="relative">
                <input className={INP + ' pr-9'} placeholder="Pesquise por cliente" value={form.cliente} onChange={e => setF('cliente', e.target.value)} />
                <Search size={14} className="absolute right-3 top-1/2 -translate-y-1/2 text-[var(--d2b-text-muted)]" />
              </div>
              {form.cliente && <button className="text-xs text-[#7C4DFF] hover:underline mt-1">dados do cliente</button>}
            </div>
            <div>
              <label className={LBL}>Lista de preço</label>
              <div className="relative">
                <select className={SEL} value={form.listaPreco} onChange={e => setF('listaPreco', e.target.value)}>
                  <option>Padrão</option>
                </select>
                <ChevronDown size={14} className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-[var(--d2b-text-muted)]" />
              </div>
            </div>
          </div>

          {/* Descrição do serviço */}
          <div className="mb-4">
            <label className={LBL}>Descrição do serviço</label>
            <textarea className={INP + ' min-h-[80px] resize-y'} value={form.descricaoServico} onChange={e => setF('descricaoServico', e.target.value)} />
          </div>

          {/* Considerações finais */}
          <div className="mb-6">
            <label className={LBL}>Considerações finais</label>
            <textarea className={INP + ' min-h-[80px] resize-y'} value={form.consideracoesFinais} onChange={e => setF('consideracoesFinais', e.target.value)} />
          </div>

          {/* Serviços */}
          <section className="mb-6">
            <h2 className="text-sm font-semibold text-[var(--d2b-text-secondary)] uppercase tracking-wider mb-3 pb-1 border-b border-[var(--d2b-border)]">
              Serviços
            </h2>
            <table className="w-full mb-2 text-sm">
              <thead>
                <tr className="border-b border-[var(--d2b-border)]">
                  <th className={TH + ' pl-0'}>Descrição</th>
                  <th className={TH}>Cód</th>
                  <th className={TH}>Quantidade</th>
                  <th className={TH}>Preço</th>
                  <th className={TH}>Desconto %</th>
                  <th className={TH}>Valor total</th>
                  <th className={TH}>Orçar</th>
                  <th className={TH}>Ações</th>
                </tr>
              </thead>
              <tbody>
                {form.itens.map(item => (
                  <tr key={item.id} className="border-b border-[var(--d2b-border)]">
                    <td className={TD + ' pl-0'}>{item.descricao}</td>
                    <td className={TD}>{item.cod || '–'}</td>
                    <td className={TD}>{item.quantidade}</td>
                    <td className={TD}>{item.preco}</td>
                    <td className={TD}>{item.desconto || '–'}</td>
                    <td className={TD}>{item.valorTotal}</td>
                    <td className="px-3 py-3"><input type="checkbox" checked={item.orcar} readOnly className="rounded" /></td>
                    <td className="px-3 py-3 flex items-center gap-2">
                      <button className="text-xs text-[#7C4DFF] hover:underline">editar</button>
                      <button className="text-[var(--d2b-text-muted)] hover:text-red-500"><Trash2 size={13} /></button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            <div className="flex items-center gap-4">
              <button className="flex items-center gap-1 text-xs text-[#7C4DFF] hover:underline"><Plus size={12} /> adicionar serviço</button>
              <button className="flex items-center gap-1 text-xs text-[#7C4DFF] hover:underline"><Search size={12} /> busca avançada de itens</button>
            </div>
          </section>

          {/* Detalhes da ordem */}
          <section className="mb-6">
            <h2 className="text-sm font-semibold text-[var(--d2b-text-secondary)] uppercase tracking-wider mb-4 pb-1 border-b border-[var(--d2b-border)]">
              Detalhes da ordem de serviço
            </h2>
            <div className="grid grid-cols-4 gap-4 mb-4">
              <div>
                <label className={LBL}>Data de início</label>
                <input type="date" className={INP} value={form.dataInicio} onChange={e => setF('dataInicio', e.target.value)} />
              </div>
              <div>
                <label className={LBL}>Data prevista</label>
                <input type="date" className={INP} value={form.dataPrevista} onChange={e => setF('dataPrevista', e.target.value)} />
              </div>
              <div>
                <label className={LBL}>Hora</label>
                <input type="time" className={INP} value={form.hora} onChange={e => setF('hora', e.target.value)} />
              </div>
              <div>
                <label className={LBL}>Data de conclusão</label>
                <input type="date" className={INP} value={form.dataConclusao} onChange={e => setF('dataConclusao', e.target.value)} />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4 mb-4">
              <div>
                <label className={LBL}>Total serviços</label>
                <div className="relative">
                  <span className="absolute left-3 top-1/2 -translate-y-1/2 text-xs text-[var(--d2b-text-muted)]">R$</span>
                  <input className={INP_RO + ' pl-9'} value={form.itens.reduce((s, i) => s + parseFloat(i.valorTotal.replace(',', '.') || '0'), 0).toFixed(2)} readOnly />
                </div>
              </div>
              <div>
                <label className={LBL}>Desconto</label>
                <input className={INP} placeholder="Ex: 3,00 ou 10%" value={form.desconto} onChange={e => setF('desconto', e.target.value)} />
              </div>
            </div>
            <div className="mb-4">
              <label className={LBL}>Observações do serviço</label>
              <textarea className={INP + ' min-h-[60px] resize-y'} value={form.obsServico} onChange={e => setF('obsServico', e.target.value)} />
            </div>
            <div className="mb-4">
              <label className={LBL}>Observações internas</label>
              <textarea className={INP + ' min-h-[60px] resize-y'} value={form.obsInternas} onChange={e => setF('obsInternas', e.target.value)} />
            </div>
            <div className="grid grid-cols-3 gap-4 mb-4">
              <div>
                <label className={LBL}>Vendedor</label>
                <input className={INP} value={form.vendedor} onChange={e => setF('vendedor', e.target.value)} />
              </div>
              <div>
                <label className={LBL}>Comissão %</label>
                <input className={INP} value={form.comissao} onChange={e => setF('comissao', e.target.value)} />
              </div>
              <div>
                <label className={LBL}>Valor comissão</label>
                <input className={INP_RO} value={form.valorComissao} readOnly />
              </div>
            </div>
            <div className="max-w-xs">
              <label className={LBL}>Técnico</label>
              <input className={INP} value={form.tecnico} onChange={e => setF('tecnico', e.target.value)} />
            </div>
          </section>

          {/* Orçar */}
          <div className="mb-6 flex items-center gap-2">
            <input type="checkbox" id="orcar" checked={form.orcar} onChange={e => setF('orcar', e.target.checked)} className="rounded" />
            <label htmlFor="orcar" className="text-sm text-[var(--d2b-text-primary)] cursor-pointer">Orçar</label>
          </div>

          {/* Pagamento */}
          <section className="mb-6">
            <h2 className="text-sm font-semibold text-[var(--d2b-text-secondary)] uppercase tracking-wider mb-4 pb-1 border-b border-[var(--d2b-border)]">
              Pagamento
            </h2>
            <div className="max-w-xs">
              <label className={LBL}>Forma de recebimento</label>
              <div className="relative">
                <select className={SEL} value={form.formaRecebimento} onChange={e => setF('formaRecebimento', e.target.value)}>
                  <option>Selecione</option>
                  <option>Boleto</option>
                  <option>Pix</option>
                  <option>Cartão</option>
                </select>
                <ChevronDown size={14} className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-[var(--d2b-text-muted)]" />
              </div>
            </div>
          </section>

          {/* Dados adicionais */}
          <section className="mb-6">
            <h2 className="text-sm font-semibold text-[var(--d2b-text-secondary)] uppercase tracking-wider mb-2 pb-1 border-b border-[var(--d2b-border)]">
              Dados adicionais
            </h2>
          </section>

          {/* Anexos */}
          <section className="mb-6">
            <h2 className="text-sm font-semibold text-[var(--d2b-text-secondary)] uppercase tracking-wider mb-4 pb-1 border-b border-[var(--d2b-border)]">
              Anexos
            </h2>
            <button className="flex items-center gap-2 text-sm text-[#7C4DFF] hover:underline">
              <Paperclip size={14} /> + procurar arquivo
            </button>
            <p className="text-xs text-[var(--d2b-text-muted)] mt-1">O tamanho do arquivo não deve ultrapassar 2 MB</p>
          </section>

          {/* Marcadores */}
          <section className="mb-8">
            <h2 className="text-sm font-semibold text-[var(--d2b-text-secondary)] uppercase tracking-wider mb-4 pb-1 border-b border-[var(--d2b-border)]">
              Marcadores
            </h2>
            <div className="flex items-center gap-2">
              <Tag size={14} className="text-[var(--d2b-text-muted)] shrink-0" />
              <input className={INP} placeholder="Separados por vírgula ou tab" value={form.marcadores} onChange={e => setF('marcadores', e.target.value)} />
            </div>
          </section>
        </div>

        {/* Footer */}
        <div className="sticky bottom-0 bg-[var(--d2b-bg-surface)] border-t border-[var(--d2b-border)] px-8 py-3 flex items-center gap-3">
          <button className={BTN_PRIMARY}>salvar</button>
          <button onClick={() => setTela(selected ? 'detalhe' : 'lista')} className={BTN_GHOST}>cancelar</button>
        </div>
      </div>
    )
  }

  // ── DETALHE ───────────────────────────────────────────────────────────────
  if (tela === 'detalhe' && selected) {
    const dot = STATUS_DOT[selected.status] ?? '#6B7280'
    return (
      <div className="flex flex-col h-full overflow-y-auto bg-[var(--d2b-bg-main)]">
        {/* Header */}
        <div className="sticky top-0 z-10 bg-[var(--d2b-bg-surface)] border-b border-[var(--d2b-border)] px-6 py-3 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <button onClick={() => setTela('lista')} className={BTN_GHOST}><ArrowLeft size={16} /> voltar</button>
            <span className="text-xs text-[var(--d2b-text-muted)]">
              início <span className="mx-1">≡</span> serviços <span className="mx-1">{'>'}</span>
              <span className="text-[var(--d2b-text-secondary)]">ordens de serviço</span>
            </span>
          </div>
          <div className="flex items-center gap-2">
            <button onClick={() => { setForm(selected); setTela('form') }} className={BTN_PRIMARY}>
              <Pencil size={13} /> editar
            </button>
            <div className="relative">
              <button onClick={() => setAcoesDet(p => !p)} className={BTN_OUTLINE}>
                ações <MoreHorizontal size={14} />
              </button>
              {acoesDet && (
                <div className="absolute right-0 top-full mt-1 w-56 bg-[var(--d2b-bg-surface)] border border-[var(--d2b-border)] rounded-lg shadow-lg z-20 py-1">
                  {ACOES_DETALHE.map((group, gi) => (
                    <div key={gi}>
                      {gi > 0 && <div className="border-t border-[var(--d2b-border)] my-1" />}
                      {group.map(a => (
                        <button key={a} onClick={() => setAcoesDet(false)} className="w-full text-left px-4 py-2 text-sm text-[var(--d2b-text-primary)] hover:bg-[var(--d2b-hover)]">{a}</button>
                      ))}
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>

        <div className="flex-1 px-8 py-6 max-w-4xl mx-auto w-full">
          <div className="flex items-center gap-3 mb-6">
            <h1 className="text-xl font-bold text-[var(--d2b-text-primary)]">Ordem de Serviço</h1>
            <span className="flex items-center gap-1.5 text-sm text-[var(--d2b-text-secondary)]">
              <span className="w-2.5 h-2.5 rounded-full shrink-0" style={{ background: dot }} />
              {selected.status.replace('_', ' ')}
            </span>
          </div>

          <div className="grid grid-cols-2 gap-x-8 gap-y-4 mb-6 text-sm">
            <div><span className="text-[var(--d2b-text-muted)] text-xs">Número</span><p className="text-[var(--d2b-text-primary)] mt-0.5">{selected.numero}</p></div>
            <div><span className="text-[var(--d2b-text-muted)] text-xs">Lista de preço</span><p className="text-[var(--d2b-text-primary)] mt-0.5">{selected.listaPreco}</p></div>
            <div>
              <span className="text-[var(--d2b-text-muted)] text-xs">Cliente</span>
              <p className="text-[var(--d2b-text-primary)] mt-0.5">{selected.cliente}</p>
              <button className="text-xs text-[#7C4DFF] hover:underline">dados do cliente</button>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4 mb-6 text-sm">
            <div><span className="text-[var(--d2b-text-muted)] text-xs">Descrição do serviço</span><p className="text-[var(--d2b-text-primary)] mt-0.5">{selected.descricaoServico}</p></div>
            <div><span className="text-[var(--d2b-text-muted)] text-xs">Considerações finais</span><p className="text-[var(--d2b-text-primary)] mt-0.5">{selected.consideracoesFinais}</p></div>
          </div>

          {/* Serviços executados */}
          <section className="mb-6">
            <h2 className="text-sm font-semibold text-[var(--d2b-text-secondary)] uppercase tracking-wider mb-3 pb-1 border-b border-[var(--d2b-border)]">
              Serviços executados
            </h2>
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-[var(--d2b-border)]">
                  <th className={TH + ' pl-0'}>Descrição</th>
                  <th className={TH}>Cód</th>
                  <th className={TH}>Quantidade</th>
                  <th className={TH}>Preço</th>
                  <th className={TH}>Desconto %</th>
                  <th className={TH}>Valor total</th>
                  <th className={TH}>Orçar</th>
                  <th className={TH}>OK</th>
                </tr>
              </thead>
              <tbody>
                {selected.itens.map(item => (
                  <tr key={item.id} className="border-b border-[var(--d2b-border)]">
                    <td className={TD + ' pl-0'}>{item.descricao}</td>
                    <td className={TD}>{item.cod || '–'}</td>
                    <td className={TD}>{item.quantidade}</td>
                    <td className={TD}>{item.preco}</td>
                    <td className={TD}>{item.desconto || '0,00'}</td>
                    <td className={TD}>{item.valorTotal}</td>
                    <td className="px-3 py-3"><input type="checkbox" checked={item.orcar} readOnly className="rounded" /></td>
                    <td className="px-3 py-3 text-[var(--d2b-text-muted)]">–</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </section>

          {/* Detalhes */}
          <section className="mb-6">
            <h2 className="text-sm font-semibold text-[var(--d2b-text-secondary)] uppercase tracking-wider mb-4 pb-1 border-b border-[var(--d2b-border)]">
              Detalhes da ordem de serviço
            </h2>
            <div className="grid grid-cols-2 gap-x-8 gap-y-3 text-sm">
              <div><span className="text-[var(--d2b-text-muted)] text-xs">Data de início</span><p className="text-[var(--d2b-text-primary)] mt-0.5">{selected.dataInicio}</p></div>
              <div><span className="text-[var(--d2b-text-muted)] text-xs">Data prevista</span><p className="text-[var(--d2b-text-primary)] mt-0.5">{selected.dataPrevista}</p></div>
              <div><span className="text-[var(--d2b-text-muted)] text-xs">Total serviços</span><p className="text-[var(--d2b-text-primary)] mt-0.5">R$ {selected.total.toFixed(2)}</p></div>
              <div><span className="text-[var(--d2b-text-muted)] text-xs">Desconto</span><p className="text-[var(--d2b-text-primary)] mt-0.5">{selected.desconto}</p></div>
              <div><span className="text-[var(--d2b-text-muted)] text-xs">Observações do serviço</span><p className="text-[var(--d2b-text-primary)] mt-0.5">{selected.obsServico || '–'}</p></div>
              <div><span className="text-[var(--d2b-text-muted)] text-xs">Observações internas</span><p className="text-[var(--d2b-text-primary)] mt-0.5">{selected.obsInternas || '–'}</p></div>
              <div><span className="text-[var(--d2b-text-muted)] text-xs">Comissão %</span><p className="text-[var(--d2b-text-primary)] mt-0.5">{selected.comissao}</p></div>
              <div><span className="text-[var(--d2b-text-muted)] text-xs">Valor comissão</span><p className="text-[var(--d2b-text-primary)] mt-0.5">{selected.valorComissao}</p></div>
            </div>
          </section>

          {/* Pagamento */}
          <section className="mb-6">
            <h2 className="text-sm font-semibold text-[var(--d2b-text-secondary)] uppercase tracking-wider mb-4 pb-1 border-b border-[var(--d2b-border)]">
              Pagamento
            </h2>
            <div className="rounded-lg bg-blue-600 text-white text-sm px-4 py-3 flex items-center gap-2 max-w-md">
              <span className="bg-orange-400 text-white text-[10px] font-bold px-2 py-0.5 rounded">Novidade</span>
              Agora você pode receber com{' '}
              <span className="underline cursor-pointer">🔗 link de pagamento</span>{' '}
              pela conta digital da olist
            </div>
          </section>

          {/* Dados adicionais */}
          <section className="mb-6">
            <h2 className="text-sm font-semibold text-[var(--d2b-text-secondary)] uppercase tracking-wider mb-2 pb-1 border-b border-[var(--d2b-border)]">
              Dados adicionais
            </h2>
          </section>
        </div>
      </div>
    )
  }

  // ── LISTA ─────────────────────────────────────────────────────────────────
  return (
    <div className="flex flex-col h-full overflow-hidden bg-[var(--d2b-bg-main)]">
      {/* Top bar */}
      <div className="flex items-center justify-between px-6 py-3 border-b border-[var(--d2b-border)] bg-[var(--d2b-bg-surface)] shrink-0">
        <span className="text-xs text-[var(--d2b-text-muted)]">
          início <span className="mx-1">≡</span> serviços <span className="mx-1">{'>'}</span>
          <span className="text-[var(--d2b-text-secondary)]">ordens de serviço</span>
        </span>
        <div className="flex items-center gap-2">
          <button className={BTN_GHOST}><Printer size={14} /> imprimir</button>
          <button onClick={() => { setSelected(null); setForm(MOCK_OS[0]); setTela('form') }} className={BTN_PRIMARY}>
            <Plus size={14} /> incluir ordem de serviço
          </button>
          <div className="relative">
            <button onClick={() => setMaisAcoesOpen(p => !p)} className={BTN_OUTLINE}>
              mais ações <MoreHorizontal size={14} />
            </button>
            {maisAcoesOpen && (
              <div className="absolute right-0 top-full mt-1 w-52 bg-[var(--d2b-bg-surface)] border border-[var(--d2b-border)] rounded-lg shadow-lg z-20 py-1">
                {['exportar', 'importar ordens'].map(a => (
                  <button key={a} onClick={() => setMaisAcoesOpen(false)} className="w-full text-left px-4 py-2 text-sm text-[var(--d2b-text-primary)] hover:bg-[var(--d2b-hover)]">{a}</button>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Title + search */}
      <div className="px-6 pt-5 pb-3 shrink-0">
        <h1 className="text-xl font-bold text-[var(--d2b-text-primary)] mb-4">Ordens de serviço</h1>
        <div className="flex items-center gap-2">
          <div className="relative flex-1 max-w-sm">
            <input className={INP + ' pr-9'} placeholder="Pesquise por cliente, nº da ordem ou nº de série" value={search} onChange={e => setSearch(e.target.value)} />
            <Search size={14} className="absolute right-3 top-1/2 -translate-y-1/2 text-[var(--d2b-text-muted)]" />
          </div>
          <button className={BTN_OUTLINE}><Calendar size={13} /> por período</button>
          <button className={BTN_OUTLINE}><Filter size={13} /> filtros</button>
        </div>
      </div>

      {/* Status tabs */}
      <div className="flex items-center px-6 border-b border-[var(--d2b-border)] shrink-0 overflow-x-auto">
        {STATUS_TABS.map(tab => {
          const active = statusTab === tab.id
          return (
            <button
              key={tab.id}
              onClick={() => setStatusTab(tab.id)}
              className={[
                'flex items-center gap-1 px-3 py-2.5 text-xs font-medium whitespace-nowrap border-b-2 transition-colors',
                active
                  ? 'border-[#F59E0B] text-[var(--d2b-text-primary)]'
                  : 'border-transparent text-[var(--d2b-text-muted)] hover:text-[var(--d2b-text-primary)]',
              ].join(' ')}
            >
              {tab.label}
              {tab.count !== undefined && (
                <span className="text-[10px] font-bold">{String(tab.count).padStart(2, '0')}</span>
              )}
            </button>
          )
        })}
      </div>

      {/* Table */}
      <div className="flex-1 overflow-y-auto">
        <table className="w-full">
          <thead className="sticky top-0 bg-[var(--d2b-bg-surface)] border-b border-[var(--d2b-border)]">
            <tr>
              <th className="px-3 py-3 w-8"><input type="checkbox" className="rounded" /></th>
              <th className="px-3 py-3 w-8" />
              <th className={TH}>Número</th>
              <th className={TH}>Data</th>
              <th className={TH}>Data Prevista</th>
              <th className={TH}>Data de conclusão</th>
              <th className={TH}>Cliente</th>
              <th className={TH}>Nome Fantasia</th>
              <th className={TH + ' text-right'}>Total</th>
              <th className={TH}>Marcadores</th>
              <th className={TH}>Integrações</th>
            </tr>
          </thead>
          <tbody>
            {filtered.map(o => {
              const dot = STATUS_DOT[o.status] ?? '#6B7280'
              return (
                <tr
                  key={o.id}
                  className="border-b border-[var(--d2b-border)] hover:bg-[var(--d2b-hover)] cursor-pointer"
                  onClick={() => { setSelected(o); setTela('detalhe') }}
                >
                  <td className="px-3 py-3"><input type="checkbox" className="rounded" onClick={e => e.stopPropagation()} /></td>
                  <td className="px-3 py-3 text-[var(--d2b-text-muted)]"><MoreHorizontal size={14} /></td>
                  <td className={TD}>{o.numero}</td>
                  <td className={TD}>{o.data}</td>
                  <td className={TD}>{o.dataPrevista}</td>
                  <td className={TD}>{o.dataConclusao || '–'}</td>
                  <td className={TD}>{o.cliente}</td>
                  <td className={TD}>{o.nomeFantasia || '–'}</td>
                  <td className={TD + ' text-right'}>{o.total.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</td>
                  <td className="px-3 py-3">
                    <span className="inline-block w-2.5 h-2.5 rounded-full shrink-0" style={{ background: dot }} />
                  </td>
                  <td className="px-3 py-3 text-[var(--d2b-text-muted)]">–</td>
                </tr>
              )
            })}
          </tbody>
        </table>
      </div>

      {/* Footer summary */}
      {filtered.length > 0 && (
        <div className="shrink-0 border-t border-[var(--d2b-border)] bg-[var(--d2b-bg-surface)] px-6 py-2 flex items-center justify-end gap-6 text-xs text-[var(--d2b-text-muted)]">
          <span><strong className="text-[var(--d2b-text-primary)]">{filtered.length}</strong> quantidade</span>
          <span>
            <strong className="text-[var(--d2b-text-primary)]">
              {filtered.reduce((s, o) => s + o.total, 0).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
            </strong>{' '}
            valor total (R$)
          </span>
        </div>
      )}
    </div>
  )
}
