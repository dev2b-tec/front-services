'use client'

import { useState } from 'react'
import {
  Search, Plus, Upload, Download, MoreHorizontal,
  SlidersHorizontal, X, ChevronDown, Barcode, FileText,
} from 'lucide-react'

const BTN_PRIMARY = 'flex items-center gap-2 px-4 py-2 rounded-full text-sm font-bold text-white bg-[#7C4DFF] hover:bg-[#5B21B6] transition-colors'
const BTN_OUTLINE = 'flex items-center gap-2 px-3 py-1.5 rounded-md text-sm font-medium border border-[var(--d2b-border-strong)] text-[var(--d2b-text-secondary)] hover:border-[#7C4DFF] hover:text-[var(--d2b-text-primary)] bg-transparent transition-colors'
const BTN_GHOST  = 'flex items-center gap-2 px-3 py-1.5 rounded-md text-sm font-medium text-[var(--d2b-text-secondary)] hover:bg-[var(--d2b-hover)] transition-colors'
const INP = 'w-full bg-[var(--d2b-bg-main)] border border-[var(--d2b-border-strong)] rounded-md px-3 py-2 text-sm text-[var(--d2b-text-primary)] placeholder:text-[var(--d2b-text-muted)] focus:outline-none focus:border-[#7C4DFF] transition-colors'
const TH = 'text-left px-3 py-3 text-xs font-semibold text-[var(--d2b-text-secondary)] uppercase tracking-wide whitespace-nowrap border-b border-[var(--d2b-border)]'
const TD = 'px-3 py-3 text-sm text-[var(--d2b-text-primary)] whitespace-nowrap'

type Boleto = {
  id: string
  nossoNumero: string
  cliente: string
  emissao: string
  vencimento: string
  valor: number
  status: 'registrado' | 'pago' | 'vencido' | 'cancelado'
  banco: string
}

const MOCK: Boleto[] = [
  { id:'1', nossoNumero:'00001-2', cliente:'Jesse dos Santos',   emissao:'01/04/2026', vencimento:'10/04/2026', valor:2500.00, status:'registrado', banco:'Bradesco' },
  { id:'2', nossoNumero:'00002-3', cliente:'Maria Oliveira',     emissao:'28/03/2026', vencimento:'05/04/2026', valor:800.00,  status:'pago',        banco:'Itaú'     },
  { id:'3', nossoNumero:'00003-4', cliente:'João Alves',         emissao:'25/03/2026', vencimento:'01/04/2026', valor:1200.00, status:'vencido',      banco:'Bradesco' },
  { id:'4', nossoNumero:'00004-5', cliente:'Tech Soluções Ltda', emissao:'05/04/2026', vencimento:'15/04/2026', valor:5400.00, status:'registrado',   banco:'Santander'},
  { id:'5', nossoNumero:'00005-6', cliente:'Ana Paula Lima',     emissao:'02/04/2026', vencimento:'08/04/2026', valor:350.00,  status:'pago',         banco:'Itaú'     },
]

function fmtBRL(v: number) { return v.toLocaleString('pt-BR', { minimumFractionDigits: 2 }) }

const STATUS_STYLE: Record<Boleto['status'], string> = {
  registrado: 'bg-[rgba(124,77,255,0.12)] text-[#7C4DFF]',
  pago:       'bg-[rgba(34,197,94,0.12)] text-emerald-500',
  vencido:    'bg-[rgba(239,68,68,0.12)] text-red-500',
  cancelado:  'bg-[rgba(107,114,128,0.12)] text-gray-500',
}

// ─── Remessa Form ──────────────────────────────────────────────────────────
function RemessaForm() {
  const [banco, setBanco]                 = useState('')
  const [semPortador, setSemPortador]     = useState(true)
  const [cancelados, setCancelados]       = useState(true)
  const [periodoFilter, setPeriodoFilter] = useState(false)

  const TITULO_TH = 'text-left px-3 py-2 text-xs font-semibold text-[var(--d2b-text-secondary)] uppercase tracking-wide border-b border-[var(--d2b-border)] whitespace-nowrap'

  const TitulosTable = ({ title, description }: { title: string; description?: string }) => (
    <div className="mb-6">
      <h3 className="text-base font-semibold text-[var(--d2b-text-primary)] mb-1">{title}</h3>
      {description && <p className="text-xs text-[var(--d2b-text-muted)] mb-3">{description}</p>}
      <div className="flex items-center gap-2 mb-3">
        <button
          onClick={() => setPeriodoFilter(p => !p)}
          className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-[var(--d2b-text-secondary)] border border-[var(--d2b-border-strong)] rounded-md hover:border-[#7C4DFF] hover:text-[#7C4DFF] transition-colors"
        >
          <FileText size={12} /> por período
        </button>
      </div>
      <div className="border border-[var(--d2b-border)] rounded-xl overflow-hidden">
        <table className="w-full">
          <thead className="bg-[var(--d2b-bg-elevated)]">
            <tr>
              <th className={TITULO_TH + ' w-10'}>
                <input type="checkbox" className="accent-[#7C4DFF]" />
              </th>
              <th className={TITULO_TH}>Cliente</th>
              <th className={TITULO_TH}>Emissão</th>
              <th className={TITULO_TH}>Vencimento</th>
              <th className={TITULO_TH}>Histórico</th>
              <th className={TITULO_TH + ' text-right'}>Valor</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td colSpan={6} className="px-4 py-0">
                <div className="my-4 border border-orange-300 bg-orange-50 dark:bg-[rgba(251,146,60,0.08)] dark:border-orange-700 rounded-xl px-6 py-6 text-center">
                  <div className="text-4xl mb-3">🔍</div>
                  <p className="text-sm font-semibold text-[var(--d2b-text-primary)] mb-1">
                    Sua pesquisa não retornou resultados.
                  </p>
                  <p className="text-xs text-[var(--d2b-text-muted)]">
                    Tente outras opções de pesquisa ou remova os filtros.
                  </p>
                </div>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  )

  return (
    <div className="mx-6 mb-6 max-w-3xl">
      <h2 className="text-2xl font-bold text-[var(--d2b-text-primary)] mb-6">Remessa</h2>

      {/* ── Dados da remessa ── */}
      <div className="mb-6">
        <h3 className="text-base font-semibold text-[var(--d2b-text-primary)] mb-4">Dados da remessa</h3>
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-[var(--d2b-text-secondary)] mb-1.5">
              Banco ou gateway
            </label>
            <div className="relative max-w-xs">
              <select
                value={banco}
                onChange={e => setBanco(e.target.value)}
                className="w-full bg-[var(--d2b-bg-main)] border border-[var(--d2b-border-strong)] rounded-md px-3 py-2 text-sm text-[var(--d2b-text-primary)] focus:outline-none focus:border-[#7C4DFF] transition-colors appearance-none cursor-pointer pr-9"
              >
                <option value=""></option>
                <option value="bradesco">Bradesco</option>
                <option value="itau">Itaú</option>
                <option value="santander">Santander</option>
                <option value="bb">Banco do Brasil</option>
                <option value="caixa">Caixa Econômica Federal</option>
              </select>
              <ChevronDown size={14} className="absolute right-3 top-1/2 -translate-y-1/2 text-[var(--d2b-text-muted)] pointer-events-none" />
            </div>
          </div>
          <label className="flex items-center gap-2 cursor-pointer">
            <input
              type="checkbox"
              checked={semPortador}
              onChange={e => setSemPortador(e.target.checked)}
              className="accent-[#7C4DFF] w-4 h-4"
            />
            <span className="text-sm text-[var(--d2b-text-primary)]">Incluir títulos sem portador</span>
          </label>
          <label className="flex items-center gap-2 cursor-pointer">
            <input
              type="checkbox"
              checked={cancelados}
              onChange={e => setCancelados(e.target.checked)}
              className="accent-[#7C4DFF] w-4 h-4"
            />
            <span className="text-sm text-[var(--d2b-text-primary)]">Incluir títulos cancelados</span>
          </label>
        </div>
      </div>

      <div className="border-t border-[var(--d2b-border)] my-4" />

      <TitulosTable
        title="Títulos para registro"
        description="Os títulos listados abaixo estão em aberto e não estão vinculados a outras remessas."
      />

      <div className="border-t border-[var(--d2b-border)] my-4" />

      <TitulosTable title="Títulos a cancelar no banco" />

      <div className="border-t border-[var(--d2b-border)] my-6" />

      {/* ── Resumo da remessa ── */}
      <div className="mb-8">
        <h3 className="text-base font-semibold text-[var(--d2b-text-primary)] mb-4">Resumo da remessa</h3>
        <div className="grid grid-cols-2 gap-6 max-w-sm">
          <div>
            <p className="text-xs text-[var(--d2b-text-muted)] mb-1">Número de títulos</p>
            <p className="text-sm font-semibold text-[var(--d2b-text-primary)]">0</p>
          </div>
          <div>
            <p className="text-xs text-[var(--d2b-text-muted)] mb-1">Valor total dos títulos</p>
            <p className="text-sm font-semibold text-[var(--d2b-text-primary)]">0,00</p>
          </div>
        </div>
      </div>

      {/* ── Actions ── */}
      <div className="flex items-center gap-3">
        <button className="flex items-center gap-2 px-4 py-2 rounded-full text-sm font-bold text-white bg-[#7C4DFF] hover:bg-[#5B21B6] transition-colors">
          salvar
        </button>
        <button className="px-4 py-2 text-sm text-[var(--d2b-text-secondary)] hover:text-[var(--d2b-text-primary)] transition-colors">
          cancelar
        </button>
      </div>
    </div>
  )
}

export function CobrancasBancariasContent() {
  const [search, setSearch]     = useState('')
  const [acoes, setAcoes]       = useState(false)
  const [selected, setSelected] = useState<Set<string>>(new Set())
  const [activeTab, setActiveTab] = useState<'boletos'|'remessas'>('boletos')

  const filtered = MOCK.filter(b =>
    !search || b.cliente.toLowerCase().includes(search.toLowerCase())
      || b.nossoNumero.includes(search)
  )

  const toggleAll = () =>
    setSelected(selected.size === filtered.length ? new Set() : new Set(filtered.map(b => b.id)))

  const totais = {
    registrado: MOCK.filter(b => b.status === 'registrado').reduce((s,b) => s+b.valor,0),
    pago:       MOCK.filter(b => b.status === 'pago').reduce((s,b) => s+b.valor,0),
    vencido:    MOCK.filter(b => b.status === 'vencido').reduce((s,b) => s+b.valor,0),
  }

  return (
    <div className="flex flex-col h-full overflow-hidden bg-[var(--d2b-bg-main)]">

      {/* Top bar */}
      <div className="shrink-0 bg-[var(--d2b-bg-surface)] border-b border-[var(--d2b-border)] px-6 py-3 flex items-center justify-between gap-3">
        <span className="text-xs text-[var(--d2b-text-muted)]">
          início <span className="mx-1">≡</span> finanças <span className="mx-1">{'>'}</span>
          <span className="text-[var(--d2b-text-secondary)]">cobranças bancárias</span>
        </span>
        <div className="flex items-center gap-2">
          <button className={BTN_GHOST}><Upload size={14}/> enviar remessa</button>
          <button className={BTN_OUTLINE}><Download size={14}/> importar retorno</button>
          <button className={BTN_PRIMARY}><Plus size={14}/> emitir boleto</button>
          <div className="relative">
            <button onClick={() => setAcoes(p => !p)} className={BTN_OUTLINE}>
              mais ações <MoreHorizontal size={14}/>
            </button>
            {acoes && (
              <div className="absolute right-0 top-full mt-1 w-52 bg-[var(--d2b-bg-surface)] border border-[var(--d2b-border)] rounded-lg shadow-lg z-20 py-1">
                {['Configurar banco','Exportar relatório','Cancelar selecionados'].map(a => (
                  <button key={a} onClick={() => setAcoes(false)}
                    className="w-full text-left px-4 py-2 text-sm text-[var(--d2b-text-primary)] hover:bg-[var(--d2b-hover)]">{a}</button>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto">

        {/* Cards resumo */}
        <div className="px-6 pt-5 pb-3 grid grid-cols-3 gap-3 max-w-2xl">
          <div className="bg-[var(--d2b-bg-surface)] border border-[var(--d2b-border)] rounded-xl px-4 py-3">
            <p className="text-xs text-[var(--d2b-text-muted)] mb-1">Registrados</p>
            <p className="text-lg font-bold text-[#7C4DFF]">R$ {fmtBRL(totais.registrado)}</p>
          </div>
          <div className="bg-[var(--d2b-bg-surface)] border border-[var(--d2b-border)] rounded-xl px-4 py-3">
            <p className="text-xs text-[var(--d2b-text-muted)] mb-1">Pagos</p>
            <p className="text-lg font-bold text-emerald-500">R$ {fmtBRL(totais.pago)}</p>
          </div>
          <div className="bg-[var(--d2b-bg-surface)] border border-[var(--d2b-border)] rounded-xl px-4 py-3">
            <p className="text-xs text-[var(--d2b-text-muted)] mb-1">Vencidos</p>
            <p className="text-lg font-bold text-red-500">R$ {fmtBRL(totais.vencido)}</p>
          </div>
        </div>

        {/* Tabs boletos / remessas */}
        <div className="mx-6 mb-3 flex border-b border-[var(--d2b-border)]">
          {(['boletos','remessas'] as const).map(t => (
            <button key={t} onClick={() => setActiveTab(t)}
              className={[
                'px-4 py-2.5 text-sm transition-colors border-b-2 -mb-px',
                activeTab === t
                  ? 'border-[#7C4DFF] text-[#7C4DFF] font-semibold'
                  : 'border-transparent text-[var(--d2b-text-secondary)] hover:text-[var(--d2b-text-primary)]',
              ].join(' ')}>{t}</button>
          ))}
        </div>

        {activeTab === 'remessas' ? (
          <RemessaForm />
        ) : (
          <>
            {/* Filtros */}
            <div className="px-6 pb-3 flex items-center gap-2 flex-wrap">
              <div className="relative">
                <Search size={13} className="absolute left-3 top-1/2 -translate-y-1/2 text-[var(--d2b-text-muted)]"/>
                <input value={search} onChange={e => setSearch(e.target.value)}
                  placeholder="Buscar por cliente ou nosso número" className={INP + ' pl-9 w-64'} />
              </div>
              <button className={BTN_GHOST + ' text-xs'}><SlidersHorizontal size={12}/> filtros</button>
              {search && (
                <button onClick={() => setSearch('')} className="text-xs text-[var(--d2b-text-muted)] hover:text-[var(--d2b-text-primary)] flex items-center gap-1">
                  <X size={12}/> limpar
                </button>
              )}
            </div>

            {/* Tabela */}
            <div className="mx-6 mb-6 bg-[var(--d2b-bg-surface)] border border-[var(--d2b-border)] rounded-xl overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-[var(--d2b-bg-elevated)]">
                    <tr>
                      <th className={TH + ' w-10'}>
                        <input type="checkbox"
                          checked={selected.size === filtered.length && filtered.length > 0}
                          onChange={toggleAll} className="accent-[#7C4DFF]"/>
                      </th>
                      <th className={TH}><Barcode size={12} className="inline mr-1"/>Nosso Número</th>
                      <th className={TH}>Cliente</th>
                      <th className={TH}>Banco</th>
                      <th className={TH}>Emissão</th>
                      <th className={TH}>Vencimento</th>
                      <th className={TH + ' text-right'}>Valor</th>
                      <th className={TH + ' text-center'}>Status</th>
                      <th className={TH + ' w-8'}></th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[var(--d2b-border)]">
                    {filtered.length === 0 ? (
                      <tr><td colSpan={9} className="text-center py-12 text-sm text-[var(--d2b-text-muted)]">Nenhum boleto encontrado.</td></tr>
                    ) : filtered.map(b => (
                      <tr key={b.id} className={['hover:bg-[var(--d2b-hover)] transition-colors', selected.has(b.id) ? 'bg-[rgba(124,77,255,0.06)]':''].join(' ')}>
                        <td className={TD}>
                          <input type="checkbox" checked={selected.has(b.id)}
                            onChange={() => setSelected(prev => { const n=new Set(prev); n.has(b.id)?n.delete(b.id):n.add(b.id); return n })}
                            className="accent-[#7C4DFF]"/>
                        </td>
                        <td className={TD + ' font-mono text-[var(--d2b-text-secondary)]'}>{b.nossoNumero}</td>
                        <td className={TD + ' font-medium'}>{b.cliente}</td>
                        <td className={TD + ' text-[var(--d2b-text-muted)]'}>{b.banco}</td>
                        <td className={TD + ' text-[var(--d2b-text-muted)]'}>{b.emissao}</td>
                        <td className={TD}>{b.vencimento}</td>
                        <td className={TD + ' text-right font-semibold'}>R$ {fmtBRL(b.valor)}</td>
                        <td className={TD + ' text-center'}>
                          <span className={`text-xs font-semibold px-2 py-0.5 rounded-full ${STATUS_STYLE[b.status]}`}>{b.status}</span>
                        </td>
                        <td className={TD}>
                          <button className="text-[var(--d2b-text-muted)] hover:text-[var(--d2b-text-primary)] p-1">
                            <ChevronDown size={14}/>
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  )
}
