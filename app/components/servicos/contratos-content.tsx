'use client'

import { useState } from 'react'
import {
  Search, Filter, Printer, Plus, ArrowLeft, MoreHorizontal,
  ChevronDown, Paperclip, Tag,
} from 'lucide-react'

// ─── Shared styles ────────────────────────────────────────────────────────────
const TH = 'text-left px-3 py-3 text-xs font-semibold text-[var(--d2b-text-secondary)] uppercase tracking-wider whitespace-nowrap'
const TD = 'px-3 py-3 text-sm text-[var(--d2b-text-primary)] whitespace-nowrap'
const BTN_PRIMARY = 'flex items-center gap-2 px-4 py-2 rounded-full text-sm font-bold text-white bg-[#7C4DFF] hover:bg-[#5B21B6] transition-colors'
const BTN_OUTLINE = 'flex items-center gap-2 px-3 py-1.5 rounded-md text-sm font-medium border border-[var(--d2b-border-strong)] text-[var(--d2b-text-secondary)] hover:border-[#7C4DFF] hover:text-[var(--d2b-text-primary)] bg-transparent transition-colors'
const BTN_GHOST = 'flex items-center gap-2 px-3 py-1.5 rounded-md text-sm text-[var(--d2b-text-secondary)] hover:bg-[var(--d2b-hover)] transition-colors'
const INP = 'w-full bg-[var(--d2b-bg-main)] border border-[var(--d2b-border-strong)] rounded-md px-3 py-2 text-sm text-[var(--d2b-text-primary)] placeholder:text-[var(--d2b-text-muted)] focus:outline-none focus:border-[#7C4DFF] transition-colors'
const LBL = 'block text-xs text-[var(--d2b-text-secondary)] mb-1'
const SEL = 'w-full bg-[var(--d2b-bg-main)] border border-[var(--d2b-border-strong)] rounded-md px-3 py-2 text-sm text-[var(--d2b-text-primary)] focus:outline-none focus:border-[#7C4DFF] transition-colors appearance-none'

// ─── Types ────────────────────────────────────────────────────────────────────
type Tela = 'lista' | 'form'
type StatusTab = 'todos' | 'ativos' | 'ativos_atraso' | 'demonstracao' | 'inativos' | 'isentos' | 'baixados' | 'encerrados'

const STATUS_TABS: { id: StatusTab; label: string; count?: number }[] = [
  { id: 'todos',        label: 'todos',                    count: 1 },
  { id: 'ativos',       label: 'ativos',                   count: 1 },
  { id: 'ativos_atraso',label: 'ativos c/ contas em atraso' },
  { id: 'demonstracao', label: 'demonstração'               },
  { id: 'inativos',     label: 'inativos'                   },
  { id: 'isentos',      label: 'isentos'                    },
  { id: 'baixados',     label: 'baixados'                   },
  { id: 'encerrados',   label: 'encerrados'                 },
]

type Contrato = {
  id: string
  descricao: string
  cliente: string
  dataContrato: string
  diaVencimento: string
  ultimoPagamento: string
  contasEmAberto: number
  valor: number
  marcador: string
}

const MOCK: Contrato[] = [
  {
    id: '1',
    descricao: 'TESTE',
    cliente: 'JESSE',
    dataContrato: '08/04/2026',
    diaVencimento: '22',
    ultimoPagamento: '',
    contasEmAberto: 0,
    valor: 1500.00,
    marcador: 'green',
  },
]

// ─── Form state ───────────────────────────────────────────────────────────────
type FormState = {
  cliente: string
  descricao: string
  situacao: string
  dataContrato: string
  valor: string
  vencimento: string
  dia: string
  periodicidade: string
  categoria: string
  formaRecebimento: string
  emitirNF: string
  marcadores: string
}

const FORM_INITIAL: FormState = {
  cliente: '',
  descricao: '',
  situacao: 'Ativo',
  dataContrato: '',
  valor: '',
  vencimento: 'No mês corrente',
  dia: '',
  periodicidade: 'Mensal',
  categoria: 'Selecione',
  formaRecebimento: 'Selecione',
  emitirNF: 'Não',
  marcadores: '',
}

// ═══════════════════════════════════════════════════════════════════════════
// ContratosContent
// ═══════════════════════════════════════════════════════════════════════════
export function ContratosContent() {
  const [tela, setTela] = useState<Tela>('lista')
  const [statusTab, setStatusTab] = useState<StatusTab>('ativos')
  const [search, setSearch] = useState('')
  const [form, setForm] = useState<FormState>(FORM_INITIAL)
  const [dadosAdicionaisOpen, setDadosAdicionaisOpen] = useState(false)
  const [maisAcoesOpen, setMaisAcoesOpen] = useState(false)

  const setF = (k: keyof FormState, v: string) => setForm(p => ({ ...p, [k]: v }))

  const filtered = MOCK.filter(c => {
    const matchStatus =
      statusTab === 'todos' ? true :
      statusTab === 'ativos' ? true : false
    const matchSearch = search
      ? c.cliente.toLowerCase().includes(search.toLowerCase()) ||
        c.descricao.toLowerCase().includes(search.toLowerCase())
      : true
    return matchStatus && matchSearch
  })

  // ── FORM ─────────────────────────────────────────────────────────────────
  if (tela === 'form') {
    return (
      <div className="flex flex-col h-full overflow-y-auto bg-[var(--d2b-bg-main)]">
        {/* Header */}
        <div className="sticky top-0 z-10 bg-[var(--d2b-bg-surface)] border-b border-[var(--d2b-border)] px-6 py-3 flex items-center gap-3">
          <button onClick={() => setTela('lista')} className={BTN_GHOST}>
            <ArrowLeft size={16} />
            <span>voltar</span>
          </button>
          <span className="text-xs text-[var(--d2b-text-muted)]">
            início <span className="mx-1">≡</span> serviços <span className="mx-1">{'>'}</span>{' '}
            <span className="text-[var(--d2b-text-secondary)]">contratos</span>
          </span>
        </div>

        {/* Body */}
        <div className="flex-1 px-8 py-6 max-w-3xl mx-auto w-full">
          <h1 className="text-xl font-bold text-[var(--d2b-text-primary)] mb-6">Contrato</h1>

          {/* Dados do contrato */}
          <section className="mb-6">
            <h2 className="text-sm font-semibold text-[var(--d2b-text-secondary)] uppercase tracking-wider mb-4 pb-1 border-b border-[var(--d2b-border)]">
              Dados do contrato
            </h2>
            <div className="space-y-4">
              {/* Cliente */}
              <div>
                <label className={LBL}>Cliente</label>
                <div className="relative">
                  <input
                    className={INP + ' pr-9'}
                    placeholder="Pesquise por cliente"
                    value={form.cliente}
                    onChange={e => setF('cliente', e.target.value)}
                  />
                  <Search size={14} className="absolute right-3 top-1/2 -translate-y-1/2 text-[var(--d2b-text-muted)]" />
                </div>
                {form.cliente && (
                  <button className="text-xs text-[#7C4DFF] hover:underline mt-1">dados do cliente</button>
                )}
              </div>

              {/* Descrição + Situação */}
              <div className="grid grid-cols-3 gap-4">
                <div className="col-span-2">
                  <label className={LBL}>Descrição do contrato</label>
                  <input className={INP} value={form.descricao} onChange={e => setF('descricao', e.target.value)} />
                </div>
                <div>
                  <label className={LBL}>Situação</label>
                  <div className="relative">
                    <select className={SEL} value={form.situacao} onChange={e => setF('situacao', e.target.value)}>
                      <option>Ativo</option>
                      <option>Inativo</option>
                      <option>Demonstração</option>
                      <option>Isento</option>
                      <option>Baixado</option>
                      <option>Encerrado</option>
                    </select>
                    <ChevronDown size={14} className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-[var(--d2b-text-muted)]" />
                  </div>
                </div>
              </div>

              {/* Data + Valor + Vencimento + Dia */}
              <div className="grid grid-cols-4 gap-4">
                <div>
                  <label className={LBL}>Data do contrato</label>
                  <input type="date" className={INP} value={form.dataContrato} onChange={e => setF('dataContrato', e.target.value)} />
                </div>
                <div>
                  <label className={LBL}>Valor</label>
                  <div className="relative">
                    <span className="absolute left-3 top-1/2 -translate-y-1/2 text-xs text-[var(--d2b-text-muted)]">R$</span>
                    <input className={INP + ' pl-9'} placeholder="0,00" value={form.valor} onChange={e => setF('valor', e.target.value)} />
                  </div>
                </div>
                <div>
                  <label className={LBL}>Vencimento</label>
                  <div className="relative">
                    <select className={SEL} value={form.vencimento} onChange={e => setF('vencimento', e.target.value)}>
                      <option>No mês corrente</option>
                      <option>No próximo mês</option>
                    </select>
                    <ChevronDown size={14} className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-[var(--d2b-text-muted)]" />
                  </div>
                </div>
                <div>
                  <label className={LBL}>Dia</label>
                  <input className={INP} placeholder="Ex: 10" value={form.dia} onChange={e => setF('dia', e.target.value)} />
                </div>
              </div>

              {/* Periodicidade + Categoria + Forma */}
              <div className="grid grid-cols-3 gap-4">
                <div>
                  <label className={LBL}>Periodicidade</label>
                  <div className="relative">
                    <select className={SEL} value={form.periodicidade} onChange={e => setF('periodicidade', e.target.value)}>
                      <option>Mensal</option>
                      <option>Trimestral</option>
                      <option>Semestral</option>
                      <option>Anual</option>
                    </select>
                    <ChevronDown size={14} className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-[var(--d2b-text-muted)]" />
                  </div>
                </div>
                <div>
                  <label className={LBL}>Categoria</label>
                  <div className="relative">
                    <select className={SEL} value={form.categoria} onChange={e => setF('categoria', e.target.value)}>
                      <option>Selecione</option>
                    </select>
                    <ChevronDown size={14} className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-[var(--d2b-text-muted)]" />
                  </div>
                </div>
                <div>
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
              </div>
            </div>
          </section>

          {/* Nota Fiscal */}
          <section className="mb-6">
            <h2 className="text-sm font-semibold text-[var(--d2b-text-secondary)] uppercase tracking-wider mb-4 pb-1 border-b border-[var(--d2b-border)]">
              Nota Fiscal de Serviço
            </h2>
            <div className="grid grid-cols-3 gap-4">
              <div>
                <label className={LBL}>Emitir NF</label>
                <div className="relative">
                  <select className={SEL} value={form.emitirNF} onChange={e => setF('emitirNF', e.target.value)}>
                    <option>Não</option>
                    <option>Sim</option>
                  </select>
                  <ChevronDown size={14} className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-[var(--d2b-text-muted)]" />
                </div>
              </div>
            </div>
          </section>

          {/* Dados adicionais */}
          <section className="mb-6">
            <button
              onClick={() => setDadosAdicionaisOpen(p => !p)}
              className="flex items-center gap-2 text-sm font-semibold text-[var(--d2b-text-secondary)] uppercase tracking-wider pb-1 border-b border-[var(--d2b-border)] w-full text-left"
            >
              <span>Dados adicionais</span>
              <span className="text-xs font-normal text-[#7C4DFF] ml-1">
                {dadosAdicionaisOpen ? 'ocultar' : 'exibir'}
              </span>
            </button>
            {dadosAdicionaisOpen && (
              <div className="mt-4 text-sm text-[var(--d2b-text-muted)]">
                Nenhum dado adicional configurado.
              </div>
            )}
          </section>

          {/* Anexos */}
          <section className="mb-6">
            <h2 className="text-sm font-semibold text-[var(--d2b-text-secondary)] uppercase tracking-wider mb-4 pb-1 border-b border-[var(--d2b-border)]">
              Anexos
            </h2>
            <button className="flex items-center gap-2 text-sm text-[#7C4DFF] hover:underline">
              <Paperclip size={14} />
              + procurar arquivo
            </button>
            <p className="text-xs text-[var(--d2b-text-muted)] mt-1">O tamanho do arquivo não deve ultrapassar 2Mb</p>
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
          <button onClick={() => setTela('lista')} className={BTN_GHOST}>cancelar</button>
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
          início <span className="mx-1">≡</span> serviços <span className="mx-1">{'>'}</span>{' '}
          <span className="text-[var(--d2b-text-secondary)]">contratos</span>
        </span>
        <div className="flex items-center gap-2">
          <button className={BTN_GHOST}><Printer size={14} /> imprimir</button>
          <button onClick={() => { setForm(FORM_INITIAL); setTela('form') }} className={BTN_PRIMARY}>
            <Plus size={14} /> incluir contrato
          </button>
          <div className="relative">
            <button onClick={() => setMaisAcoesOpen(p => !p)} className={BTN_OUTLINE}>
              mais ações <MoreHorizontal size={14} />
            </button>
            {maisAcoesOpen && (
              <div className="absolute right-0 top-full mt-1 w-52 bg-[var(--d2b-bg-surface)] border border-[var(--d2b-border)] rounded-lg shadow-lg z-20 py-1 text-sm text-[var(--d2b-text-primary)]">
                {['exportar', 'importar contratos'].map(a => (
                  <button key={a} onClick={() => setMaisAcoesOpen(false)} className="w-full text-left px-4 py-2 hover:bg-[var(--d2b-hover)]">{a}</button>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Title + search */}
      <div className="px-6 pt-5 pb-3 shrink-0">
        <h1 className="text-xl font-bold text-[var(--d2b-text-primary)] mb-4">Contratos de serviço</h1>
        <div className="flex items-center gap-2">
          <div className="relative flex-1 max-w-sm">
            <input
              className={INP + ' pr-9'}
              placeholder="Pesquise por cliente"
              value={search}
              onChange={e => setSearch(e.target.value)}
            />
            <Search size={14} className="absolute right-3 top-1/2 -translate-y-1/2 text-[var(--d2b-text-muted)]" />
          </div>
          <button className={BTN_OUTLINE}><Filter size={13} /> filtros</button>
        </div>
      </div>

      {/* Status tabs */}
      <div className="flex items-center gap-0 px-6 border-b border-[var(--d2b-border)] shrink-0 overflow-x-auto">
        {STATUS_TABS.map(tab => {
          const active = statusTab === tab.id
          return (
            <button
              key={tab.id}
              onClick={() => setStatusTab(tab.id)}
              className={[
                'flex items-center gap-1 px-3 py-2.5 text-xs font-medium whitespace-nowrap border-b-2 transition-colors',
                active
                  ? 'border-[#22C55E] text-[var(--d2b-text-primary)]'
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

      {/* Table / empty */}
      <div className="flex-1 overflow-y-auto">
        {filtered.length === 0 ? (
          <div className="flex items-center justify-center h-full px-6">
            <div className="border-2 border-orange-400 rounded-xl p-8 max-w-md w-full text-center">
              <p className="text-sm text-[var(--d2b-text-primary)] mb-4">
                Sua pesquisa não retornou resultados. Tente outras opções de pesquisa, situações ou remova os filtros.
              </p>
              <div className="flex items-center justify-center gap-3">
                <button className="text-sm text-[#7C4DFF] hover:underline font-medium">alterar pesquisa</button>
                <button className="text-sm text-[var(--d2b-text-muted)] hover:underline">limpar filtros</button>
              </div>
            </div>
          </div>
        ) : (
          <table className="w-full">
            <thead className="sticky top-0 bg-[var(--d2b-bg-surface)] border-b border-[var(--d2b-border)]">
              <tr>
                <th className="px-3 py-3 w-8"><input type="checkbox" className="rounded" /></th>
                <th className="px-3 py-3 w-8" />
                <th className={TH}>Descrição</th>
                <th className={TH}>Cliente</th>
                <th className={TH}>Data contrato</th>
                <th className={TH}>Dia vencimento</th>
                <th className={TH}>Último pagamento</th>
                <th className={TH}>Nº contas em aberto</th>
                <th className={TH + ' text-right'}>Valor</th>
                <th className={TH}>Marcadores</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map(c => (
                <tr key={c.id} className="border-b border-[var(--d2b-border)] hover:bg-[var(--d2b-hover)] cursor-pointer" onClick={() => { setForm({ ...FORM_INITIAL, cliente: c.cliente, descricao: c.descricao, valor: c.valor.toFixed(2), dia: c.diaVencimento }); setTela('form') }}>
                  <td className="px-3 py-3"><input type="checkbox" className="rounded" onClick={e => e.stopPropagation()} /></td>
                  <td className="px-3 py-3 text-[var(--d2b-text-muted)]"><MoreHorizontal size={14} /></td>
                  <td className={TD}>{c.descricao}</td>
                  <td className={TD}>{c.cliente}</td>
                  <td className={TD}>{c.dataContrato}</td>
                  <td className={TD}>{c.diaVencimento}</td>
                  <td className={TD}>{c.ultimoPagamento || '–'}</td>
                  <td className={TD}>{c.contasEmAberto}</td>
                  <td className={TD + ' text-right'}>{c.valor.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</td>
                  <td className="px-3 py-3">
                    <span className="inline-block w-3 h-3 rounded-full bg-green-500" />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      {/* Footer summary */}
      {filtered.length > 0 && (
        <div className="shrink-0 border-t border-[var(--d2b-border)] bg-[var(--d2b-bg-surface)] px-6 py-2 flex items-center justify-end gap-6 text-xs text-[var(--d2b-text-muted)]">
          <span><strong className="text-[var(--d2b-text-primary)]">{filtered.length}</strong> quantidade</span>
          <span>
            <strong className="text-[var(--d2b-text-primary)]">
              {filtered.reduce((s, c) => s + c.valor, 0).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
            </strong>{' '}
            valor total (R$)
          </span>
        </div>
      )}
    </div>
  )
}
