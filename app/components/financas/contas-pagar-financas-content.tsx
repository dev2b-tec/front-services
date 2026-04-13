'use client'

import { useState, useRef } from 'react'
import {
  Search, Plus, Printer, DollarSign, MoreHorizontal,
  SlidersHorizontal, X, ChevronDown, ChevronLeft, ChevronRight,
  Barcode, CheckCircle2, Trash2, Ban, Tag, FolderOpen,
  Layers, RefreshCw, CreditCard, Upload, Calendar, Edit,
} from 'lucide-react'

// ─── Styles ────────────────────────────────────────────────────────────────
const BTN_PRIMARY = 'flex items-center gap-2 px-4 py-2 rounded-full text-sm font-bold text-white bg-[#7C4DFF] hover:bg-[#5B21B6] transition-colors'
const BTN_OUTLINE = 'flex items-center gap-2 px-3 py-1.5 rounded-md text-sm font-medium border border-[var(--d2b-border-strong)] text-[var(--d2b-text-secondary)] hover:border-[#7C4DFF] hover:text-[var(--d2b-text-primary)] bg-transparent transition-colors'
const BTN_GHOST   = 'flex items-center gap-2 px-3 py-1.5 rounded-md text-sm font-medium text-[var(--d2b-text-secondary)] hover:bg-[var(--d2b-hover)] transition-colors'
const INP  = 'w-full bg-[var(--d2b-bg-main)] border border-[var(--d2b-border-strong)] rounded-md px-3 py-2 text-sm text-[var(--d2b-text-primary)] placeholder:text-[var(--d2b-text-muted)] focus:outline-none focus:border-[#7C4DFF] transition-colors'
const SEL  = 'w-full bg-[var(--d2b-bg-main)] border border-[var(--d2b-border-strong)] rounded-md px-3 py-2 text-sm text-[var(--d2b-text-primary)] focus:outline-none focus:border-[#7C4DFF] transition-colors appearance-none cursor-pointer'
const TH   = 'text-left px-3 py-3 text-xs font-semibold text-[var(--d2b-text-secondary)] uppercase tracking-wide whitespace-nowrap border-b border-[var(--d2b-border)]'
const TD   = 'px-3 py-3 text-sm text-[var(--d2b-text-primary)] whitespace-nowrap'
const LBL  = 'block text-sm font-medium text-[var(--d2b-text-secondary)] mb-1.5'

// ─── Types ─────────────────────────────────────────────────────────────────
type ViewMode      = 'list' | 'form'
type FormTab       = 'dados' | 'competencia' | 'anexos' | 'marcadores'
type SubTab        = 'todas' | 'em-aberto' | 'emitidas' | 'pagas' | 'atrasadas' | 'canceladas'
type FormaPagamento = 'boleto' | 'pix' | 'cartao' | 'dinheiro' | 'debito' | 'outro'

type ContaPagar = {
  id: string
  fornecedor: string
  historico: string
  nDocumento: string
  vencimento: string
  valor: number
  saldo: number
  pago: number
  formaPagamento: FormaPagamento
  marcadores: string[]
  status: 'aberta' | 'emitida' | 'paga' | 'atrasada' | 'cancelada'
}

// ─── Mock ──────────────────────────────────────────────────────────────────
const MOCK: ContaPagar[] = [
  { id: '1', fornecedor: 'BS TECNOLOGIA LTDA',  historico: '',               nDocumento: '',            vencimento: '08/04/2026', valor: 1500.00, saldo: 1500.00, pago: 0,      formaPagamento: 'boleto', marcadores: [],          status: 'aberta'   },
  { id: '2', fornecedor: 'Aluguel Escritório',   historico: 'Aluguel mensal', nDocumento: 'ALG-2026-04', vencimento: '10/04/2026', valor: 3200.00, saldo: 3200.00, pago: 0,      formaPagamento: 'pix',    marcadores: ['fixo'],    status: 'emitida'  },
  { id: '3', fornecedor: 'Internet + Telefone',  historico: 'Conta fixa',     nDocumento: 'TEL-024',     vencimento: '05/04/2026', valor: 349.90,  saldo: 0,       pago: 349.90, formaPagamento: 'debito', marcadores: ['fixo'],    status: 'paga'     },
  { id: '4', fornecedor: 'Energia Elétrica',     historico: '',               nDocumento: 'ENE-2026-03', vencimento: '01/04/2026', valor: 820.00,  saldo: 820.00,  pago: 0,      formaPagamento: 'boleto', marcadores: [],          status: 'atrasada' },
]

// ─── Helpers ───────────────────────────────────────────────────────────────
function fmtBRL(v: number) {
  return v.toLocaleString('pt-BR', { minimumFractionDigits: 2 })
}

function StatusDot({ status }: { status: ContaPagar['status'] }) {
  const color: Record<ContaPagar['status'], string> = {
    aberta:    'bg-yellow-400',
    emitida:   'bg-[#7C4DFF]',
    paga:      'bg-emerald-500',
    atrasada:  'bg-red-500',
    cancelada: 'bg-gray-400',
  }
  return <span className={`inline-block w-3 h-3 rounded-full ${color[status]}`} />
}

// ─── Sub-tabs config ───────────────────────────────────────────────────────
const SUB_TABS: { key: SubTab; label: string; dot: string | null }[] = [
  { key: 'todas',      label: 'todas',      dot: null },
  { key: 'em-aberto',  label: 'em aberto',  dot: 'bg-yellow-400' },
  { key: 'emitidas',   label: 'emitidas',   dot: 'bg-[#7C4DFF]' },
  { key: 'pagas',      label: 'pagas',      dot: null },
  { key: 'atrasadas',  label: 'atrasadas',  dot: 'bg-red-500' },
  { key: 'canceladas', label: 'canceladas', dot: 'bg-gray-800' },
]

const MONTHS = ['Janeiro','Fevereiro','Março','Abril','Maio','Junho','Julho','Agosto','Setembro','Outubro','Novembro','Dezembro']

// ─── Form Component ────────────────────────────────────────────────────────
function ContaPagarForm({ onBack, step, totalSteps }: { onBack: () => void; step: number; totalSteps: number }) {
  const [formTab, setFormTab] = useState<FormTab>('dados')
  const [formData, setFormData] = useState({
    formaPagamento: '',
    fornecedor:     '',
    vencimento:     '',
    valor:          '',
    dataEmissao:    '08/04/2026',
    nDocumento:     '',
    historico:      '',
    categoria:      '',
    ocorrencia:     'Única',
    marcador:       '',
  })
  const [competenciaIdx, setCompetenciaIdx] = useState(3)
  const fileRef = useRef<HTMLInputElement>(null)
  const [fileName, setFileName] = useState<string | null>(null)

  const FORM_TABS: { key: FormTab; label: string }[] = [
    { key: 'dados',       label: 'dados da conta' },
    { key: 'competencia', label: 'competência' },
    { key: 'anexos',      label: 'anexos' },
    { key: 'marcadores',  label: 'marcadores' },
  ]

  return (
    <div className="flex flex-col h-full overflow-hidden bg-[var(--d2b-bg-main)]">
      <div className="shrink-0 bg-[var(--d2b-bg-surface)] border-b border-[var(--d2b-border)] px-6 py-3 flex items-center gap-3">
        <button onClick={onBack} className="flex items-center gap-1 text-sm text-[#7C4DFF] hover:underline">
          <ChevronLeft size={14} /> voltar
        </button>
        <span className="text-xs text-[var(--d2b-text-muted)]">
          início <span className="mx-1">≡</span> finanças <span className="mx-1">{'>'}</span>
          <span className="text-[var(--d2b-text-secondary)]">contas a pagar</span>
        </span>
      </div>

      <div className="shrink-0 px-6 py-2 bg-[var(--d2b-bg-surface)] border-b border-[var(--d2b-border)] flex items-center">
        <span className="text-sm text-[var(--d2b-text-secondary)] flex items-center gap-2">
          <span className="text-[#7C4DFF]">✦</span>
          <span className="font-bold text-[var(--d2b-text-primary)]">Etapa atual</span>
          Configure a emissão da nota fiscal
        </span>
        <div className="ml-auto flex items-center gap-2">
          <span className="text-xs text-[var(--d2b-text-muted)]">{step} de {totalSteps}</span>
          <div className="flex items-center gap-1">
            {Array.from({ length: totalSteps }).map((_, i) => (
              <span key={i} className={['w-6 h-1.5 rounded-full', i < step ? 'bg-[#7C4DFF]' : 'bg-[var(--d2b-border-strong)]'].join(' ')} />
            ))}
          </div>
          <button className="text-xs font-medium text-[#7C4DFF] hover:underline">acessar o guia</button>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto px-6 py-6 max-w-3xl mx-auto w-full">
        <h1 className="text-2xl font-bold text-[var(--d2b-text-primary)] mb-5">Conta a pagar</h1>

        <div className="flex border-b border-[var(--d2b-border)] mb-6">
          {FORM_TABS.map(t => (
            <button
              key={t.key}
              onClick={() => setFormTab(t.key)}
              className={[
                'px-4 py-2.5 text-sm transition-colors border-b-2 -mb-px',
                formTab === t.key
                  ? 'border-[var(--d2b-text-primary)] text-[var(--d2b-text-primary)] font-semibold'
                  : 'border-transparent text-[var(--d2b-text-muted)] hover:text-[var(--d2b-text-secondary)]',
              ].join(' ')}
            >
              {t.label}
            </button>
          ))}
        </div>

        {formTab === 'dados' && (
          <div className="space-y-5">
            <div>
              <label className={LBL}>Forma Pagamento</label>
              <div className="relative">
                <select value={formData.formaPagamento} onChange={e => setFormData(d => ({ ...d, formaPagamento: e.target.value }))} className={SEL + ' pr-9'}>
                  <option value="">Selecione</option>
                  <option value="boleto">Boleto</option>
                  <option value="pix">PIX</option>
                  <option value="cartao">Cartao</option>
                  <option value="dinheiro">Dinheiro</option>
                  <option value="debito">Debito Automatico</option>
                  <option value="outro">Outro</option>
                </select>
                <ChevronDown size={14} className="absolute right-3 top-1/2 -translate-y-1/2 text-[var(--d2b-text-muted)] pointer-events-none" />
              </div>
            </div>
            <div>
              <label className={LBL}>Fornecedor</label>
              <div className="relative flex items-center">
                <input value={formData.fornecedor} onChange={e => setFormData(d => ({ ...d, fornecedor: e.target.value }))} placeholder="Pesquise pela iniciais do nome do fornecedor" className={INP + ' pr-20'} />
                <div className="absolute right-2 flex gap-1">
                  <button className="p-1.5 border border-[var(--d2b-border-strong)] rounded text-[var(--d2b-text-muted)] hover:text-[var(--d2b-text-primary)]"><Edit size={13} /></button>
                  <button className="p-1.5 border border-[var(--d2b-border-strong)] rounded text-[var(--d2b-text-muted)] hover:text-[var(--d2b-text-primary)]"><Search size={13} /></button>
                </div>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className={LBL}>Vencimento</label>
                <div className="relative">
                  <input type="text" placeholder="dd/mm/aaaa" value={formData.vencimento} onChange={e => setFormData(d => ({ ...d, vencimento: e.target.value }))} className={INP + ' pr-9'} />
                  <Calendar size={14} className="absolute right-3 top-1/2 -translate-y-1/2 text-[var(--d2b-text-muted)]" />
                </div>
              </div>
              <div>
                <label className={LBL}>Valor</label>
                <div className="relative">
                  <span className="absolute left-3 top-1/2 -translate-y-1/2 text-sm text-[var(--d2b-text-muted)]">R$</span>
                  <input type="text" placeholder="0,00" value={formData.valor} onChange={e => setFormData(d => ({ ...d, valor: e.target.value }))} className={INP + ' pl-9'} />
                </div>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className={LBL}>Data de emissão</label>
                <div className="relative">
                  <input type="text" value={formData.dataEmissao} onChange={e => setFormData(d => ({ ...d, dataEmissao: e.target.value }))} className={INP + ' pr-9'} />
                  <Calendar size={14} className="absolute right-3 top-1/2 -translate-y-1/2 text-[var(--d2b-text-muted)]" />
                </div>
              </div>
              <div>
                <label className={LBL}>Nº do documento</label>
                <input type="text" value={formData.nDocumento} onChange={e => setFormData(d => ({ ...d, nDocumento: e.target.value }))} className={INP} />
              </div>
            </div>
            <div>
              <label className={LBL}>Histórico</label>
              <textarea value={formData.historico} onChange={e => setFormData(d => ({ ...d, historico: e.target.value }))} rows={3} className={INP + ' resize-none'} />
            </div>
            <div>
              <label className={LBL}>Categoria</label>
              <div className="relative">
                <select value={formData.categoria} onChange={e => setFormData(d => ({ ...d, categoria: e.target.value }))} className={SEL + ' pr-9'}>
                  <option value="">Selecione</option>
                  <option value="aluguel">Aluguel</option>
                  <option value="servicos">Servicos</option>
                  <option value="fornecedores">Fornecedores</option>
                  <option value="impostos">Impostos e Taxas</option>
                  <option value="outros">Outros</option>
                </select>
                <ChevronDown size={14} className="absolute right-3 top-1/2 -translate-y-1/2 text-[var(--d2b-text-muted)] pointer-events-none" />
              </div>
            </div>
            <div>
              <label className={LBL}>Ocorrência</label>
              <div className="relative">
                <select value={formData.ocorrencia} onChange={e => setFormData(d => ({ ...d, ocorrencia: e.target.value }))} className={SEL + ' pr-9'}>
                  <option value="Única">Única</option>
                  <option value="Recorrente">Recorrente</option>
                  <option value="Parcelada">Parcelada</option>
                </select>
                <ChevronDown size={14} className="absolute right-3 top-1/2 -translate-y-1/2 text-[var(--d2b-text-muted)] pointer-events-none" />
              </div>
              <p className="text-xs text-[var(--d2b-text-muted)] mt-1">Única ou recorrente</p>
            </div>
          </div>
        )}

        {formTab === 'competencia' && (
          <div className="space-y-3">
            <label className={LBL}>Competência</label>
            <div className="inline-flex items-center border border-[var(--d2b-border-strong)] rounded-md overflow-hidden">
              <button onClick={() => setCompetenciaIdx(i => Math.max(0, i - 1))} className="px-3 py-2 text-[var(--d2b-text-muted)] hover:text-[var(--d2b-text-primary)] border-r border-[var(--d2b-border-strong)]">
                <ChevronLeft size={16} />
              </button>
              <span className="px-8 py-2 text-sm text-[var(--d2b-text-primary)] font-medium min-w-[140px] text-center">
                {MONTHS[competenciaIdx]}
              </span>
              <button onClick={() => setCompetenciaIdx(i => Math.min(11, i + 1))} className="px-3 py-2 text-[var(--d2b-text-muted)] hover:text-[var(--d2b-text-primary)] border-l border-[var(--d2b-border-strong)]">
                <ChevronRight size={16} />
              </button>
            </div>
          </div>
        )}

        {formTab === 'anexos' && (
          <div className="space-y-2">
            <input ref={fileRef} type="file" className="hidden" accept=".pdf,.png,.jpg,.jpeg" onChange={e => setFileName(e.target.files?.[0]?.name ?? null)} />
            <button onClick={() => fileRef.current?.click()} className="flex items-center gap-2 px-4 py-2 rounded-full text-sm font-medium text-[#7C4DFF] border-2 border-[#7C4DFF] hover:bg-[rgba(124,77,255,0.08)] transition-colors">
              <Upload size={16} /> procurar arquivo
            </button>
            {fileName && <p className="text-sm text-[var(--d2b-text-primary)]">{fileName}</p>}
            <p className="text-xs text-[var(--d2b-text-muted)]">O tamanho do arquivo não deve ultrapassar 2Mb</p>
          </div>
        )}

        {formTab === 'marcadores' && (
          <div className="space-y-2">
            <label className={LBL}>Marcador</label>
            <input type="text" value={formData.marcador} onChange={e => setFormData(d => ({ ...d, marcador: e.target.value }))} className={INP} />
            <p className="text-xs text-[var(--d2b-text-muted)]">Separados por vírgula ou tab</p>
          </div>
        )}
      </div>

      <div className="shrink-0 bg-[var(--d2b-bg-surface)] border-t border-[var(--d2b-border)] px-6 py-4 flex items-center gap-3">
        <button className={BTN_PRIMARY}>salvar</button>
        <button onClick={onBack} className="px-4 py-2 text-sm text-[var(--d2b-text-secondary)] hover:text-[var(--d2b-text-primary)] transition-colors">cancelar</button>
      </div>
    </div>
  )
}

// ─── Main Component ─────────────────────────────────────────────────────────
export function ContasPagarFinancasContent() {
  const [view, setView]           = useState<ViewMode>('list')
  const [subTab, setSubTab]       = useState<SubTab>('todas')
  const [search, setSearch]       = useState('')
  const [periodo]                 = useState('Últimos 30 dias')
  const [banner, setBanner]       = useState(true)
  const [acoes, setAcoes]         = useState(false)
  const [bulkAcoes, setBulkAcoes] = useState(false)
  const [selected, setSelected]   = useState<Set<string>>(new Set())
  const [step]                    = useState(1)
  const totalSteps                 = 4

  if (view === 'form') {
    return <ContaPagarForm onBack={() => setView('list')} step={step} totalSteps={totalSteps} />
  }

  const filtered = MOCK.filter(c => {
    if (subTab === 'em-aberto'  && c.status !== 'aberta')    return false
    if (subTab === 'emitidas'   && c.status !== 'emitida')   return false
    if (subTab === 'pagas'      && c.status !== 'paga')      return false
    if (subTab === 'atrasadas'  && c.status !== 'atrasada')  return false
    if (subTab === 'canceladas' && c.status !== 'cancelada') return false
    if (search && !c.fornecedor.toLowerCase().includes(search.toLowerCase()) &&
        !c.nDocumento.toLowerCase().includes(search.toLowerCase())) return false
    return true
  })

  const countBySubTab = (s: SubTab): number =>
    MOCK.filter(c => {
      if (s === 'todas')      return true
      if (s === 'em-aberto')  return c.status === 'aberta'
      if (s === 'emitidas')   return c.status === 'emitida'
      if (s === 'pagas')      return c.status === 'paga'
      if (s === 'atrasadas')  return c.status === 'atrasada'
      if (s === 'canceladas') return c.status === 'cancelada'
      return true
    }).length

  const toggleAll = () =>
    setSelected(selected.size === filtered.length ? new Set() : new Set(filtered.map(c => c.id)))

  const toggleRow = (id: string) =>
    setSelected(prev => {
      const next = new Set(prev)
      next.has(id) ? next.delete(id) : next.add(id)
      return next
    })

  const totalRegistros    = filtered.length
  const totalValor        = filtered.reduce((s, c) => s + c.valor, 0)
  const totalSelecionados = [...selected].reduce((s, id) => {
    const c = MOCK.find(x => x.id === id)
    return s + (c?.valor ?? 0)
  }, 0)

  const BULK_ACOES = [
    { icon: <CheckCircle2 size={13} />, label: 'pagar (baixar conta)',  badge: null      },
    { icon: <CreditCard   size={13} />, label: 'pagar com cartão',       badge: 'até 12x' },
    { icon: <Trash2       size={13} />, label: 'excluir contas',          badge: null      },
    { icon: <Ban          size={13} />, label: 'cancelar contas',         badge: null      },
    { icon: <Tag          size={13} />, label: 'alterar marcadores',      badge: null      },
    { icon: <FolderOpen   size={13} />, label: 'alterar categoria',       badge: null      },
    { icon: <Layers       size={13} />, label: 'agrupar contas',          badge: null      },
    { icon: <RefreshCw    size={13} />, label: 'conciliar com o banco',   badge: null      },
  ]

  return (
    <div className="flex flex-col h-full overflow-hidden bg-[var(--d2b-bg-main)]">
      <div className="shrink-0 bg-[var(--d2b-bg-surface)] border-b border-[var(--d2b-border)] px-6 py-3 flex items-center justify-between gap-3">
        <span className="text-xs text-[var(--d2b-text-muted)]">
          início <span className="mx-1">≡</span> finanças <span className="mx-1">{'>'}</span>
          <span className="text-[var(--d2b-text-secondary)]">contas a pagar</span>
        </span>
        <div className="flex items-center gap-2">
          <button className={BTN_GHOST}><Printer size={14} /> imprimir</button>
          <button className={BTN_OUTLINE}><DollarSign size={14} /> gerenciar pagamentos</button>
          <button onClick={() => setView('form')} className={BTN_PRIMARY}><Plus size={14} /> incluir conta a pagar</button>
          <div className="relative">
            <button onClick={() => setAcoes(p => !p)} className={BTN_OUTLINE}>mais ações <MoreHorizontal size={14} /></button>
            {acoes && (
              <div className="absolute right-0 top-full mt-1 w-52 bg-[var(--d2b-bg-surface)] border border-[var(--d2b-border)] rounded-lg shadow-lg z-20 py-1">
                {['Importar contas', 'Exportar contas', 'Configuracoes'].map(a => (
                  <button key={a} onClick={() => setAcoes(false)} className="w-full text-left px-4 py-2 text-sm text-[var(--d2b-text-primary)] hover:bg-[var(--d2b-hover)]">{a}</button>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>

      <div className="shrink-0 px-6 py-2 bg-[var(--d2b-bg-surface)] border-b border-[var(--d2b-border)] flex items-center">
        <span className="text-sm text-[var(--d2b-text-secondary)] flex items-center gap-2">
          <span className="text-[#7C4DFF]">✦</span>
          <span className="font-bold text-[var(--d2b-text-primary)]">Etapa atual</span>
          Configure a emissão da nota fiscal
        </span>
        <div className="ml-auto flex items-center gap-2">
          <span className="text-xs text-[var(--d2b-text-muted)]">{step} de {totalSteps}</span>
          <div className="flex items-center gap-1">
            {Array.from({ length: totalSteps }).map((_, i) => (
              <span key={i} className={['w-6 h-1.5 rounded-full', i < step ? 'bg-[#7C4DFF]' : 'bg-[var(--d2b-border-strong)]'].join(' ')} />
            ))}
          </div>
          <button className="text-xs font-medium text-[#7C4DFF] hover:underline">acessar o guia</button>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto">
        <div className="px-6 pt-5 pb-2">
          <h1 className="text-2xl font-bold text-[var(--d2b-text-primary)]">Contas a pagar</h1>
        </div>

        <div className="px-6 py-3 flex items-center gap-2 flex-wrap">
          <div className="relative">
            <Search size={13} className="absolute left-3 top-1/2 -translate-y-1/2 text-[var(--d2b-text-muted)]" />
            <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Pesquise por fornecedor ou nº doc." className={INP + ' pl-9 w-64'} />
          </div>
          <button className={BTN_OUTLINE + ' !px-2.5'}><SlidersHorizontal size={13} /></button>
          <span className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-[rgba(124,77,255,0.12)] text-xs font-medium text-[#7C4DFF]">
            contas a pagar <X size={11} className="cursor-pointer" />
          </span>
          <button className="flex items-center gap-1 px-3 py-1 rounded-full bg-[var(--d2b-bg-elevated)] border border-[var(--d2b-border-strong)] text-xs font-medium text-[var(--d2b-text-secondary)] hover:border-[#7C4DFF]">
            {periodo} <ChevronDown size={11} />
          </button>
          <button className={BTN_GHOST + ' text-xs'}><SlidersHorizontal size={12} /> filtros</button>
          <button onClick={() => setSearch('')} className="text-xs text-[var(--d2b-text-muted)] hover:text-[var(--d2b-text-primary)] flex items-center gap-1 transition-colors">
            <X size={12} /> limpar filtros
          </button>
        </div>

        {banner && (
          <div className="mx-6 mb-3 flex items-center gap-3 px-4 py-2.5 bg-blue-600 text-white text-sm rounded-xl">
            <span className="text-xs font-bold px-2 py-0.5 rounded bg-[rgba(255,255,255,0.2)] shrink-0">Crédito da Olist</span>
            <span>Agora você pode</span>
            <span className="flex items-center gap-1.5 font-semibold underline underline-offset-2 cursor-pointer">🤝 antecipar recebíveis</span>
            <span>com crédito pré-aprovado</span>
            <button onClick={() => setBanner(false)} className="ml-auto text-white/70 hover:text-white"><X size={15} /></button>
          </div>
        )}

        <div className="mx-6 mb-6 bg-[var(--d2b-bg-surface)] border border-[var(--d2b-border)] rounded-xl overflow-hidden">
          <div className="flex items-center border-b border-[var(--d2b-border)] px-2 overflow-x-auto">
            {SUB_TABS.map(t => {
              const count = countBySubTab(t.key)
              return (
                <button key={t.key} onClick={() => setSubTab(t.key)}
                  className={['flex items-center gap-1.5 px-3 py-3 text-sm transition-colors border-b-2 -mb-px whitespace-nowrap shrink-0',
                    subTab === t.key ? 'border-[#7C4DFF] text-[#7C4DFF] font-semibold' : 'border-transparent text-[var(--d2b-text-secondary)] hover:text-[var(--d2b-text-primary)]',
                  ].join(' ')}>
                  {t.dot && <span className={`w-2 h-2 rounded-full shrink-0 ${t.dot}`} />}
                  {t.label}
                  {count > 0 && <span className="text-xs text-[var(--d2b-text-muted)]">{String(count).padStart(2, '0')}</span>}
                </button>
              )
            })}
            <button className="ml-auto shrink-0 text-[var(--d2b-text-muted)] hover:text-[var(--d2b-text-primary)] p-2"><SlidersHorizontal size={15} /></button>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-[var(--d2b-bg-elevated)]">
                <tr>
                  <th className={TH + ' w-10'}>
                    <input type="checkbox" checked={selected.size === filtered.length && filtered.length > 0} onChange={toggleAll} className="accent-[#7C4DFF]" />
                  </th>
                  <th className={TH + ' w-6'}></th>
                  <th className={TH}>Fornecedor</th>
                  <th className={TH}>Histórico</th>
                  <th className={TH}>Nº documento</th>
                  <th className={TH}>Vencimento</th>
                  <th className={TH + ' text-right'}>Valor</th>
                  <th className={TH + ' text-right'}>Saldo</th>
                  <th className={TH + ' text-right'}>Pago</th>
                  <th className={TH + ' text-center'}>Buscador</th>
                  <th className={TH}>Marcadores</th>
                  <th className={TH}>Forma</th>
                  <th className={TH + ' w-8'}></th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[var(--d2b-border)]">
                {filtered.length === 0 ? (
                  <tr><td colSpan={13} className="text-center py-12 text-sm text-[var(--d2b-text-muted)]">Nenhuma conta encontrada para os filtros aplicados.</td></tr>
                ) : filtered.map(c => (
                  <tr key={c.id} className={['group transition-colors hover:bg-[var(--d2b-hover)]', selected.has(c.id) ? 'bg-[rgba(124,77,255,0.06)]' : ''].join(' ')}>
                    <td className={TD}><input type="checkbox" checked={selected.has(c.id)} onChange={() => toggleRow(c.id)} className="accent-[#7C4DFF]" /></td>
                    <td className={TD + ' text-[var(--d2b-text-muted)]'}><MoreHorizontal size={14} className="opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer" /></td>
                    <td className={TD}><span className="font-medium">{c.fornecedor}</span></td>
                    <td className={TD + ' text-[var(--d2b-text-muted)] max-w-[140px]'}><span className="block truncate">{c.historico || '—'}</span></td>
                    <td className={TD + ' text-[var(--d2b-text-muted)]'}>{c.nDocumento || '—'}</td>
                    <td className={TD}><span className={c.status === 'atrasada' ? 'text-red-500 font-medium' : ''}>{c.vencimento}</span></td>
                    <td className={TD + ' text-right'}>{fmtBRL(c.valor)}</td>
                    <td className={TD + ' text-right font-medium'}>{fmtBRL(c.saldo)}</td>
                    <td className={TD + ' text-right text-[var(--d2b-text-muted)]'}>{fmtBRL(c.pago)}</td>
                    <td className={TD + ' text-center'}><Barcode size={18} className="text-[var(--d2b-text-muted)] mx-auto" /></td>
                    <td className={TD}>
                      {c.marcadores.length > 0 ? (
                        <div className="flex gap-1 flex-wrap">
                          {c.marcadores.map(m => <span key={m} className="px-2 py-0.5 text-xs rounded-full bg-[var(--d2b-bg-elevated)] text-[var(--d2b-text-secondary)] border border-[var(--d2b-border)]">{m}</span>)}
                        </div>
                      ) : <StatusDot status={c.status} />}
                    </td>
                    <td className={TD}><span className="text-xs text-[var(--d2b-text-muted)] capitalize">{c.formaPagamento}</span></td>
                    <td className={TD}><button className="text-[var(--d2b-text-muted)] hover:text-[var(--d2b-text-primary)] p-1 rounded"><ChevronDown size={14} /></button></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      <div className="shrink-0 bg-[var(--d2b-bg-surface)] border-t border-[var(--d2b-border)] px-6 py-2.5 flex items-center gap-3 min-h-[48px]">
        {selected.size > 0 ? (
          <>
            <span className="flex items-center gap-1 text-xs text-[var(--d2b-text-secondary)] border border-[var(--d2b-border-strong)] rounded px-2 py-1">
              ↑ {String(selected.size).padStart(2, '0')}
            </span>
            <button className={BTN_PRIMARY + ' !py-1.5'}><CheckCircle2 size={14} /> pagar (baixar conta)</button>
            <button className="flex items-center gap-1.5 text-sm text-[var(--d2b-text-secondary)] hover:text-red-500 transition-colors"><Trash2 size={14} /> excluir contas</button>
            <button className="flex items-center gap-1.5 text-sm text-[var(--d2b-text-secondary)] hover:text-[var(--d2b-text-primary)] transition-colors"><Ban size={14} /> cancelar contas</button>
            <div className="relative">
              <button onClick={() => setBulkAcoes(p => !p)} className="flex items-center gap-1.5 text-sm text-[var(--d2b-text-secondary)] border border-[var(--d2b-border-strong)] rounded-full px-3 py-1.5 hover:border-[#7C4DFF] hover:text-[#7C4DFF] transition-colors">
                mais ações <MoreHorizontal size={14} />
              </button>
              {bulkAcoes && (
                <div className="absolute bottom-full mb-2 left-0 w-56 bg-[var(--d2b-bg-surface)] border border-[var(--d2b-border)] rounded-lg shadow-lg z-30 py-1">
                  {BULK_ACOES.map(item => (
                    <button key={item.label} onClick={() => setBulkAcoes(false)} className="w-full text-left px-4 py-2 text-sm text-[var(--d2b-text-primary)] hover:bg-[var(--d2b-hover)] flex items-center gap-2">
                      {item.icon}
                      {item.label}
                      {item.badge && <span className="ml-auto text-xs font-bold px-1.5 py-0.5 rounded bg-[rgba(124,77,255,0.12)] text-[#7C4DFF]">{item.badge}</span>}
                    </button>
                  ))}
                </div>
              )}
            </div>
            <div className="ml-auto flex items-center gap-4 text-xs">
              <span><span className="font-semibold text-[#7C4DFF]">{fmtBRL(totalSelecionados)}</span> <span className="text-[var(--d2b-text-muted)]">selecionadas (R$)</span></span>
              <span className="text-[var(--d2b-text-muted)]">{totalRegistros} <span>quantidade</span></span>
              <span><span className="font-semibold text-[var(--d2b-text-primary)]">{fmtBRL(totalValor)}</span> <span className="text-[var(--d2b-text-muted)]">valor total (R$)</span></span>
              <button className="text-[var(--d2b-text-muted)] hover:text-[var(--d2b-text-primary)]">↑</button>
            </div>
          </>
        ) : (
          <div className="ml-auto flex items-center gap-4 text-xs">
            <span className="text-[var(--d2b-text-muted)]">{totalRegistros} <span>quantidade</span></span>
            <span><span className="font-semibold text-[var(--d2b-text-primary)]">{fmtBRL(totalValor)}</span> <span className="text-[var(--d2b-text-muted)]">valor total (R$)</span></span>
            <button className="text-[var(--d2b-text-muted)] hover:text-[var(--d2b-text-primary)]">↑</button>
          </div>
        )}
      </div>
    </div>
  )
}
