'use client'

import { useState, useRef } from 'react'
import {
  Search, Plus, Printer, DollarSign, MoreHorizontal,
  SlidersHorizontal, X, ChevronDown, ChevronLeft, ChevronRight,
  Edit2, ArrowLeft, Paperclip, Link2, Check, Eye,
} from 'lucide-react'

const BTN_PRIMARY = 'flex items-center gap-2 px-4 py-2 rounded-full text-sm font-bold text-white bg-[#7C4DFF] hover:bg-[#5B21B6] transition-colors'
const BTN_OUTLINE = 'flex items-center gap-2 px-3 py-1.5 rounded-md text-sm font-medium border border-[var(--d2b-border-strong)] text-[var(--d2b-text-secondary)] hover:border-[#7C4DFF] hover:text-[var(--d2b-text-primary)] bg-transparent transition-colors'
const BTN_GHOST  = 'flex items-center gap-2 px-3 py-1.5 rounded-md text-sm font-medium text-[var(--d2b-text-secondary)] hover:bg-[var(--d2b-hover)] transition-colors'
const INP = 'w-full bg-[var(--d2b-bg-main)] border border-[var(--d2b-border-strong)] rounded-md px-3 py-2 text-sm text-[var(--d2b-text-primary)] placeholder:text-[var(--d2b-text-muted)] focus:outline-none focus:border-[#7C4DFF] transition-colors'
const SEL = 'w-full bg-[var(--d2b-bg-main)] border border-[var(--d2b-border-strong)] rounded-md px-3 py-2 text-sm text-[var(--d2b-text-primary)] focus:outline-none focus:border-[#7C4DFF] transition-colors appearance-none'
const TH  = 'text-left px-3 py-3 text-xs font-semibold text-[var(--d2b-text-secondary)] uppercase tracking-wide whitespace-nowrap border-b border-[var(--d2b-border)]'
const TD  = 'px-3 py-3 text-sm text-[var(--d2b-text-primary)] whitespace-nowrap'
const LBL = 'block text-sm font-medium text-[var(--d2b-text-secondary)] mb-1.5'

const MONTHS = ['Janeiro','Fevereiro','Marco','Abril','Maio','Junho','Julho','Agosto','Setembro','Outubro','Novembro','Dezembro']

type ViewMode = 'list' | 'create' | 'view'
type FormTab  = 'dados' | 'competencia' | 'anexos' | 'marcadores'
type SubTab   = 'em-aberto' | 'emitidas' | 'recebidas' | 'atrasadas' | 'canceladas'

type ContaReceber = {
  id: string
  cliente: string
  clienteFone: string
  historico: string
  nDocumento: string
  vencimento: string
  valor: number
  saldo: number
  valorLiquido: number
  recebido: number
  dataEmissao: string
  documentoOrigem?: string
  forma: string
  marcadores: string[]
  meio: string
  integracoes: string
  status: 'aberta' | 'emitida' | 'recebida' | 'atrasada' | 'cancelada'
}

const MOCK: ContaReceber[] = [
  { id:'1', cliente:'BS TECNOLOGIA LTDA', clienteFone:'(11)99999-0001', historico:'Ref. ao pedido de venda no 2, BS TECNOLOGIA LTDA',  nDocumento:'Pedido 2', vencimento:'07/04/2026', valor:13.20,    saldo:13.20,    valorLiquido:13.20,    recebido:0,       dataEmissao:'07/04/2026', documentoOrigem:'Pedido 2', forma:'Dinheiro', marcadores:[], meio:'$', integracoes:'V',  status:'atrasada' },
  { id:'2', cliente:'JESSE',              clienteFone:'(11)99999-0002', historico:'Referente a cobranca de contrato 04/2026',           nDocumento:'',         vencimento:'22/04/2026', valor:1500.00, saldo:1500.00, valorLiquido:1500.00, recebido:0,       dataEmissao:'08/04/2026', documentoOrigem:'',        forma:'Boleto',   marcadores:[], meio:'$', integracoes:'CO', status:'emitida'  },
  { id:'3', cliente:'BS TECNOLOGIA LTDA', clienteFone:'(11)99999-0001', historico:'',                                                    nDocumento:'',         vencimento:'30/04/2026', valor:1500.00, saldo:1500.00, valorLiquido:1500.00, recebido:0,       dataEmissao:'07/04/2026', documentoOrigem:'',        forma:'Pix',      marcadores:[], meio:'$', integracoes:'',   status:'emitida'  },
  { id:'4', cliente:'Ana Paula Lima',     clienteFone:'(11)99999-0003', historico:'NF-0038',                                             nDocumento:'NF-0038',  vencimento:'05/04/2026', valor:350.00,  saldo:0,       valorLiquido:350.00,   recebido:350.00, dataEmissao:'01/04/2026', documentoOrigem:'',        forma:'Pix',      marcadores:[], meio:'$', integracoes:'',   status:'recebida' },
]

function fmtBRL(v: number) { return v.toLocaleString('pt-BR', { minimumFractionDigits: 2 }) }

function StatusDot({ status }: { status: ContaReceber['status'] }) {
  const color: Record<ContaReceber['status'], string> = {
    aberta:    'bg-yellow-400',
    emitida:   'bg-[#7C4DFF]',
    recebida:  'bg-emerald-500',
    atrasada:  'bg-red-500',
    cancelada: 'bg-gray-500',
  }
  return <span className={`inline-block w-2.5 h-2.5 rounded-full ${color[status]}`} />
}

/* ------------------------------------------------------------------ */
/* Stepper banner (shared)                                              */
/* ------------------------------------------------------------------ */
function Stepper() {
  return (
    <div className="shrink-0 bg-[var(--d2b-bg-elevated)] border-b border-[var(--d2b-border)] px-6 py-2 flex items-center gap-2 text-xs text-[var(--d2b-text-secondary)]">
      <span className="text-[#7C4DFF] font-bold">✦ Etapa atual</span>
      <span className="text-[var(--d2b-text-primary)]">Configure a emissão da nota fiscal</span>
      <span className="ml-auto flex items-center gap-2">
        1 de 4
        <div className="flex gap-1">
          {[0,1,2,3].map(i=>(
            <div key={i} className={`h-1.5 w-6 rounded-full ${i===0?'bg-[#7C4DFF]':'bg-[var(--d2b-border-strong)]'}`}/>
          ))}
        </div>
        <button className="text-[#7C4DFF] hover:underline">acessar o guia</button>
      </span>
    </div>
  )
}

/* ------------------------------------------------------------------ */
/* Form (nova / editar conta)                                           */
/* ------------------------------------------------------------------ */
function ContaReceberForm({ onCancel }: { onCancel: () => void }) {
  const [tab, setTab] = useState<FormTab>('dados')
  const [mes, setMes] = useState(new Date().getMonth())
  const [ano]         = useState(new Date().getFullYear())
  const fileRef       = useRef<HTMLInputElement>(null)
  const today         = new Date().toLocaleDateString('pt-BR')

  const FORM_TABS: { id: FormTab; label: string }[] = [
    { id:'dados',       label:'dados da conta' },
    { id:'competencia', label:'competência'    },
    { id:'anexos',      label:'anexos'         },
    { id:'marcadores',  label:'marcadores'     },
  ]

  return (
    <div className="flex flex-col h-full overflow-hidden bg-[var(--d2b-bg-main)]">
      <Stepper />
      {/* Breadcrumb */}
      <div className="shrink-0 px-6 py-2 flex items-center gap-2 text-xs text-[var(--d2b-text-muted)] bg-[var(--d2b-bg-surface)] border-b border-[var(--d2b-border)]">
        <button onClick={onCancel} className="flex items-center gap-1 text-[#7C4DFF] hover:underline">
          <ArrowLeft size={12}/> voltar
        </button>
        <span>início</span><span className="mx-1">≡</span><span>finanças</span>
        <span className="mx-1">{'>'}</span>
        <span className="text-[var(--d2b-text-secondary)]">contas a receber</span>
      </div>
      {/* Content */}
      <div className="flex-1 overflow-y-auto px-6 py-6 max-w-3xl mx-auto w-full">
        <h2 className="text-xl font-bold text-[var(--d2b-text-primary)] mb-5">Conta a receber</h2>
        {/* Tabs */}
        <div className="flex border-b border-[var(--d2b-border)] mb-6">
          {FORM_TABS.map(t => (
            <button key={t.id} onClick={() => setTab(t.id)}
              className={[
                'px-4 py-2 text-sm transition-colors border-b-2 -mb-px',
                tab===t.id
                  ? 'border-[#7C4DFF] text-[var(--d2b-text-primary)] font-semibold'
                  : 'border-transparent text-[var(--d2b-text-muted)] hover:text-[var(--d2b-text-primary)]',
              ].join(' ')}>
              {t.label}
            </button>
          ))}
        </div>

        {tab === 'dados' && (
          <div className="flex flex-col gap-4">
            {/* Cliente */}
            <div>
              <label className={LBL}>Cliente</label>
              <div className="relative flex items-center">
                <input className={INP + ' pr-20'}
                  placeholder="Pesquise pelas iniciais do nome do cliente, pelo cpf/cnpj ou pelo e-mail"/>
                <div className="absolute right-2 flex gap-1">
                  <button className="p-1.5 text-[var(--d2b-text-muted)] hover:text-[var(--d2b-text-primary)] rounded border border-[var(--d2b-border)]">
                    <Edit2 size={13}/>
                  </button>
                  <button className="p-1.5 text-[var(--d2b-text-muted)] hover:text-[var(--d2b-text-primary)] rounded border border-[var(--d2b-border)]">
                    <Search size={13}/>
                  </button>
                </div>
              </div>
            </div>
            {/* Vencimento / Valor */}
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className={LBL}>Vencimento</label>
                <div className="relative">
                  <input type="text" className={INP + ' pr-9'} placeholder=""/>
                  <button className="absolute right-2 top-1/2 -translate-y-1/2 text-[var(--d2b-text-muted)] text-base">📅</button>
                </div>
              </div>
              <div>
                <label className={LBL}>Valor</label>
                <input className={INP} defaultValue="RS"/>
              </div>
            </div>
            {/* Data emissão / Nº documento */}
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className={LBL}>Data emissão</label>
                <div className="relative">
                  <input type="text" className={INP + ' pr-9'} defaultValue={today}/>
                  <button className="absolute right-2 top-1/2 -translate-y-1/2 text-[var(--d2b-text-muted)] text-base">📅</button>
                </div>
              </div>
              <div>
                <label className={LBL}>Nº documento</label>
                <input className={INP} defaultValue="0"/>
              </div>
            </div>
            {/* Histórico */}
            <div>
              <label className={LBL}>Histórico</label>
              <textarea rows={3} className={INP + ' resize-none'}/>
            </div>
            {/* Categoria */}
            <div>
              <label className={LBL}>Categoria</label>
              <div className="relative">
                <select className={SEL}><option>Selecione</option></select>
                <ChevronDown size={14} className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-[var(--d2b-text-muted)]"/>
              </div>
            </div>
            {/* Forma recebimento + Novidade banner */}
            <div className="grid grid-cols-2 gap-4 items-start">
              <div>
                <label className={LBL}>Forma de recebimento</label>
                <div className="relative">
                  <select className={SEL}><option>Selecione</option></select>
                  <ChevronDown size={14} className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-[var(--d2b-text-muted)]"/>
                </div>
              </div>
              <div className="flex items-center h-full pt-5">
                <div className="flex items-center flex-wrap gap-1.5 px-3 py-2 rounded-md bg-[#7C4DFF] text-white text-xs font-medium w-full">
                  <span className="shrink-0 bg-yellow-400 text-black font-bold px-1.5 py-0.5 rounded text-[10px]">Novidade</span>
                  Agora você pode receber com
                  <span className="flex items-center gap-1 border border-white/40 rounded px-1.5 py-0.5">
                    <Link2 size={10}/> link de pagamento
                  </span>
                  <span>pela conta digital da olist</span>
                </div>
              </div>
            </div>
            {/* Ocorrencia */}
            <div>
              <label className={LBL}>Ocorrência</label>
              <div className="relative">
                <select className={SEL}><option>Única</option></select>
                <ChevronDown size={14} className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-[var(--d2b-text-muted)]"/>
              </div>
            </div>
          </div>
        )}

        {tab === 'competencia' && (
          <div>
            <label className={LBL}>Competência</label>
            <div className="flex items-center gap-2 border border-[var(--d2b-border-strong)] rounded-md w-64 px-3 py-2 bg-[var(--d2b-bg-main)]">
              <button onClick={()=>setMes(m=>(m-1+12)%12)}
                className="text-[var(--d2b-text-secondary)] hover:text-[var(--d2b-text-primary)]">
                <ChevronLeft size={15}/>
              </button>
              <span className="flex-1 text-center text-sm text-[var(--d2b-text-primary)]">
                {MONTHS[mes]} {ano}
              </span>
              <button onClick={()=>setMes(m=>(m+1)%12)}
                className="text-[var(--d2b-text-secondary)] hover:text-[var(--d2b-text-primary)]">
                <ChevronRight size={15}/>
              </button>
            </div>
          </div>
        )}

        {tab === 'anexos' && (
          <div>
            <input ref={fileRef} type="file" className="hidden"/>
            <button onClick={()=>fileRef.current?.click()}
              className="flex items-center gap-2 px-4 py-2 rounded-full bg-[#7C4DFF] text-white text-sm font-medium hover:bg-[#5B21B6]">
              <Paperclip size={14}/> procurar arquivo
            </button>
            <p className="mt-2 text-xs text-[var(--d2b-text-muted)]">O tamanho do arquivo não deve ultrapassar 2Mb</p>
          </div>
        )}

        {tab === 'marcadores' && (
          <div>
            <label className={LBL}>Marcadores</label>
            <input className={INP} placeholder=""/>
            <p className="mt-1.5 text-xs text-[var(--d2b-text-muted)]">Separados por vírgula ou tab</p>
          </div>
        )}
      </div>
      {/* Footer */}
      <div className="shrink-0 px-6 py-4 border-t border-[var(--d2b-border)] bg-[var(--d2b-bg-surface)] flex gap-3">
        <button className={BTN_PRIMARY}>salvar</button>
        <button onClick={onCancel} className="text-sm text-[var(--d2b-text-muted)] hover:text-[var(--d2b-text-primary)]">cancelar</button>
      </div>
    </div>
  )
}

/* ------------------------------------------------------------------ */
/* Detail / read-only view                                              */
/* ------------------------------------------------------------------ */
function ContaReceberDetail({
  conta, onEdit, onBack,
}: { conta: ContaReceber; onEdit: () => void; onBack: () => void }) {
  const [tab, setTab]         = useState<FormTab>('dados')
  const [maisAcoes, setMaisAcoes] = useState(false)

  const FORM_TABS: { id: FormTab; label: string }[] = [
    { id:'dados',       label:'dados da conta' },
    { id:'competencia', label:'competencia'    },
    { id:'anexos',      label:'anexos'         },
    { id:'marcadores',  label:'marcadores'     },
  ]
  const RO = 'text-sm text-[var(--d2b-text-primary)]'
  const GRP = 'mb-4'
  const LBL2 = 'text-xs text-[var(--d2b-text-secondary)] mb-0.5'

  return (
    <div className="flex flex-col h-full overflow-hidden bg-[var(--d2b-bg-main)]">
      <Stepper />
      {/* Breadcrumb + actions */}
      <div className="shrink-0 px-6 py-2 flex items-center justify-between bg-[var(--d2b-bg-surface)] border-b border-[var(--d2b-border)]">
        <div className="flex items-center gap-2 text-xs text-[var(--d2b-text-muted)]">
          <button onClick={onBack} className="flex items-center gap-1 text-[#7C4DFF] hover:underline">
            <ArrowLeft size={12}/> voltar
          </button>
          <span>início</span><span className="mx-1">≡</span><span>finanças</span>
          <span className="mx-1">{'>'}</span>
          <span className="text-[var(--d2b-text-secondary)]">contas a receber</span>
        </div>
        <div className="flex items-center gap-2">
          <button className={BTN_GHOST + ' text-xs'}>
            <Check size={13}/> receber (baixar conta)
          </button>
          <button onClick={onEdit} className={BTN_PRIMARY + ' text-xs py-1.5'}>
            <Edit2 size={12}/> editar
          </button>
          <div className="relative">
            <button onClick={()=>setMaisAcoes(p=>!p)} className={BTN_OUTLINE + ' text-xs py-1.5'}>
              mais ações <MoreHorizontal size={13}/>
            </button>
            {maisAcoes && (
              <div className="absolute right-0 top-full mt-1 w-52 bg-[var(--d2b-bg-surface)] border border-[var(--d2b-border)] rounded-lg shadow-lg z-20 py-1">
                {['Duplicar','Cancelar conta','Excluir','Imprimir'].map(a=>(
                  <button key={a} onClick={()=>setMaisAcoes(false)}
                    className="w-full text-left px-4 py-2 text-sm text-[var(--d2b-text-primary)] hover:bg-[var(--d2b-hover)]">
                    {a}
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
      {/* Content */}
      <div className="flex-1 overflow-y-auto px-6 py-6 max-w-3xl mx-auto w-full">
        <div className="flex items-center gap-3 mb-5">
          <h2 className="text-xl font-bold text-[var(--d2b-text-primary)]">Conta a receber</h2>
          <div className="flex items-center gap-1.5 px-3 py-1 rounded-full border border-[var(--d2b-border)] text-xs font-medium text-[var(--d2b-text-secondary)] bg-[var(--d2b-bg-elevated)]">
            <span className="font-bold text-[var(--d2b-text-primary)]">{conta.meio}</span>
            <StatusDot status={conta.status}/> {conta.status}
          </div>
        </div>
        {/* Tabs */}
        <div className="flex border-b border-[var(--d2b-border)] mb-6">
          {FORM_TABS.map(t=>(
            <button key={t.id} onClick={()=>setTab(t.id)}
              className={[
                'px-4 py-2 text-sm transition-colors border-b-2 -mb-px',
                tab===t.id
                  ? 'border-[#7C4DFF] text-[var(--d2b-text-primary)] font-semibold'
                  : 'border-transparent text-[var(--d2b-text-muted)] hover:text-[var(--d2b-text-primary)]',
              ].join(' ')}>
              {t.label}
            </button>
          ))}
        </div>
        {tab === 'dados' && (
          <div className="flex flex-col gap-5">
            <div className={GRP}>
              <p className={LBL2}>Cliente</p>
              <p className={RO + ' font-medium'}>{conta.cliente}</p>
              <button className="text-[#7C4DFF] text-sm hover:underline">dados do cliente</button>
            </div>
            <div className="grid grid-cols-2 gap-6">
              <div className={GRP}><p className={LBL2}>Vencimento</p><p className={RO}>{conta.vencimento}</p></div>
              <div className={GRP}><p className={LBL2}>Valor</p><p className={RO}>R$ {fmtBRL(conta.valor)}</p></div>
            </div>
            <div className="grid grid-cols-2 gap-6">
              <div className={GRP}><p className={LBL2}>Data emissão</p><p className={RO}>{conta.dataEmissao}</p></div>
              <div className={GRP}><p className={LBL2}>Nº documento</p><p className={RO}>{conta.nDocumento || 'não informado'}</p></div>
            </div>
            <div className={GRP}>
              <p className={LBL2}>Histórico</p>
              <p className={RO}>{conta.historico || '—'}</p>
            </div>
            <div className="grid grid-cols-2 gap-6 items-start">
              <div className={GRP}>
                <p className={LBL2}>Forma de recebimento</p>
                <p className={RO}>{conta.forma}</p>
              </div>
              <div className="flex items-center">
                <div className="flex items-center flex-wrap gap-1.5 px-3 py-2 rounded-md bg-[#7C4DFF] text-white text-xs font-medium w-full">
                  <span className="shrink-0 bg-yellow-400 text-black font-bold px-1.5 py-0.5 rounded text-[10px]">Novidade</span>
                  <span>Agora voce pode receber com</span>
                  <span className="flex items-center gap-1 border border-white/40 rounded px-1.5 py-0.5">
                    <Link2 size={10}/> link de pagamento
                  </span>
                  <span>pela conta digital da olist</span>
                </div>
              </div>
            </div>
            <div className={GRP}>
              <p className={LBL2}>Ocorrência</p>
              <p className={RO}>Única</p>
            </div>
          </div>
        )}
        {tab === 'competencia' && (
          <p className="text-sm text-[var(--d2b-text-muted)]">Nenhuma competência definida.</p>
        )}
        {tab === 'anexos' && (
          <p className="text-sm text-[var(--d2b-text-muted)]">Nenhum arquivo anexado.</p>
        )}
        {tab === 'marcadores' && (
          <p className="text-sm text-[var(--d2b-text-muted)]">
            {conta.marcadores.join(', ') || 'Nenhum marcador.'}
          </p>
        )}
      </div>
    </div>
  )
}

/* ------------------------------------------------------------------ */
/* Main list component                                                   */
/* ------------------------------------------------------------------ */
export function ContasReceberFinancasContent() {
  const [viewMode, setViewMode]         = useState<ViewMode>('list')
  const [selectedConta, setSelectedConta] = useState<ContaReceber | null>(null)
  const [subTab, setSubTab]             = useState<SubTab>('em-aberto')
  const [search, setSearch]             = useState('')
  const [acoes, setAcoes]               = useState(false)
  const [selected, setSelected]         = useState<Set<string>>(new Set())
  const [creditoBanner, setCreditoBanner] = useState(true)
  const [maisAcoesFooter, setMaisAcoesFooter] = useState(false)

  if (viewMode === 'create') return <ContaReceberForm onCancel={() => setViewMode('list')} />
  if (viewMode === 'view' && selectedConta) return (
    <ContaReceberDetail
      conta={selectedConta}
      onEdit={() => setViewMode('create')}
      onBack={() => { setViewMode('list'); setSelectedConta(null) }}
    />
  )

  const SUB_TABS: { id: SubTab; label: string; dot: string }[] = [
    { id:'em-aberto',  label:'em aberto',  dot:'bg-yellow-400' },
    { id:'emitidas',   label:'emitidas',   dot:'bg-[#7C4DFF]'  },
    { id:'recebidas',  label:'recebidas',  dot:'bg-emerald-500' },
    { id:'atrasadas',  label:'atrasadas',  dot:'bg-red-500'    },
    { id:'canceladas', label:'canceladas', dot:'bg-gray-500'   },
  ]

  const statusMap: Record<SubTab, ContaReceber['status']> = {
    'em-aberto': 'aberta', 'emitidas': 'emitida', 'recebidas': 'recebida',
    'atrasadas': 'atrasada', 'canceladas': 'cancelada',
  }

  const filtered = MOCK.filter(c => {
    if (c.status !== statusMap[subTab]) return false
    if (search && !c.cliente.toLowerCase().includes(search.toLowerCase()) &&
        !c.nDocumento.toLowerCase().includes(search.toLowerCase())) return false
    return true
  })

  const counts = (Object.keys(statusMap) as SubTab[]).reduce((acc, k) => {
    acc[k] = MOCK.filter(c => c.status === statusMap[k]).length
    return acc
  }, {} as Record<SubTab, number>)

  const toggleAll = () =>
    setSelected(selected.size === filtered.length && filtered.length > 0
      ? new Set() : new Set(filtered.map(c => c.id)))

  const totalValor = filtered.reduce((s, c) => s + c.valor, 0)

  const isAtrasadas = subTab === 'atrasadas'
  const colSpan = isAtrasadas ? 17 : 16

  return (
    <div className="flex flex-col h-full overflow-hidden bg-[var(--d2b-bg-main)]">
      <Stepper />

      {/* Top bar */}
      <div className="shrink-0 bg-[var(--d2b-bg-surface)] border-b border-[var(--d2b-border)] px-6 py-3 flex items-center justify-between gap-3">
        <span className="text-xs text-[var(--d2b-text-muted)]">
          início <span className="mx-1">≡</span> finanças <span className="mx-1">{'>'}</span>
          <span className="text-[var(--d2b-text-secondary)]">contas a receber</span>
        </span>
        <div className="flex items-center gap-2">
          <button className={BTN_GHOST}><Printer size={14}/> imprimir</button>
          <button className={BTN_OUTLINE}><DollarSign size={14}/> gerenciar recebimentos</button>
          <button onClick={() => setViewMode('create')} className={BTN_PRIMARY}>
            <Plus size={14}/> incluir conta a receber
          </button>
          <div className="relative">
            <button onClick={() => setAcoes(p=>!p)} className={BTN_OUTLINE}>
              mais ações <MoreHorizontal size={14}/>
            </button>
            {acoes && (
              <div className="absolute right-0 top-full mt-1 w-48 bg-[var(--d2b-bg-surface)] border border-[var(--d2b-border)] rounded-lg shadow-lg z-20 py-1">
                {['Importar contas','Exportar contas','Configurações'].map(a=>(
                  <button key={a} onClick={()=>setAcoes(false)}
                    className="w-full text-left px-4 py-2 text-sm text-[var(--d2b-text-primary)] hover:bg-[var(--d2b-hover)]">
                    {a}
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto">
        <div className="px-6 pt-4">
          <h1 className="text-2xl font-bold text-[var(--d2b-text-primary)] mb-4">Contas a receber</h1>

          {/* Crédito da Olist banner */}
          {creditoBanner && (
            <div className="flex items-center justify-center gap-2 py-2 mb-3 text-sm flex-wrap">
              <span className="bg-emerald-500 text-white text-xs font-bold px-2.5 py-1 rounded-full">
                Crédito da Olist
              </span>
              <span className="text-[var(--d2b-text-secondary)]">Agora voce pode</span>
              <span className="flex items-center gap-1 font-medium text-[var(--d2b-text-primary)]">
                <span className="w-5 h-5 rounded-full bg-gradient-to-br from-purple-400 to-emerald-400 inline-block"/>
                antecipar recebíveis
              </span>
              <span className="text-[var(--d2b-text-secondary)]">com crédito pré-aprovado</span>
              <button onClick={()=>setCreditoBanner(false)}
                className="text-[var(--d2b-text-muted)] hover:text-[var(--d2b-text-primary)]">
                <Eye size={14}/>
              </button>
              <div className="flex gap-1">
                {[0,1].map(i=>(
                  <span key={i} className={`w-2 h-2 rounded-full ${i===0?'bg-[#7C4DFF]':'bg-[var(--d2b-border-strong)]'}`}/>
                ))}
              </div>
            </div>
          )}

          {/* Filters */}
          <div className="flex items-center gap-2 flex-wrap mb-3">
            <div className="relative">
              <Search size={13} className="absolute left-3 top-1/2 -translate-y-1/2 text-[var(--d2b-text-muted)]"/>
              <input value={search} onChange={e=>setSearch(e.target.value)}
                placeholder="Pesquise por cliente, nº no banco ou nº doc"
                className={INP + ' pl-9 w-72'}/>
            </div>
            <button className={BTN_OUTLINE + ' text-xs'}><SlidersHorizontal size={12}/></button>
            <button className="flex items-center gap-1.5 px-3 py-1.5 rounded-md border border-[var(--d2b-border-strong)] text-xs text-[var(--d2b-text-secondary)] hover:border-[#7C4DFF] bg-transparent">
              por meio de recebimento
            </button>
            <button className="flex items-center gap-1 px-3 py-1.5 rounded-full bg-[rgba(124,77,255,0.12)] border border-[var(--d2b-border-strong)] text-xs font-medium text-[#7C4DFF]">
              Últimos 30 dias <ChevronDown size={10}/>
            </button>
            <button className={BTN_GHOST + ' text-xs'}><SlidersHorizontal size={12}/> filtros</button>
            <button onClick={()=>setSearch('')}
              className="text-xs text-[var(--d2b-text-muted)] hover:text-[var(--d2b-text-primary)] flex items-center gap-1">
              <X size={12}/> limpar filtros
            </button>
          </div>
        </div>

        {/* Sub-tabs + table */}
        <div className="mx-6 mb-2 bg-[var(--d2b-bg-surface)] border border-[var(--d2b-border)] rounded-xl overflow-hidden">
          <div className="flex items-center border-b border-[var(--d2b-border)] px-2">
            {SUB_TABS.map(t => (
              <button key={t.id} onClick={() => setSubTab(t.id)}
                className={[
                  'flex items-center gap-1.5 px-4 py-3 text-sm transition-colors border-b-2 -mb-px',
                  subTab===t.id
                    ? 'border-[#7C4DFF] text-[#7C4DFF] font-semibold'
                    : 'border-transparent text-[var(--d2b-text-secondary)] hover:text-[var(--d2b-text-primary)]',
                ].join(' ')}>
                <span className={`w-2 h-2 rounded-full ${t.dot}`}/>
                {t.label}
                {counts[t.id] > 0 && (
                  <span className="text-xs font-bold">{String(counts[t.id]).padStart(2,'0')}</span>
                )}
              </button>
            ))}
            <button className="ml-auto text-[var(--d2b-text-muted)] hover:text-[var(--d2b-text-primary)] p-2">
              <SlidersHorizontal size={15}/>
            </button>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-[var(--d2b-bg-elevated)]">
                <tr>
                  <th className={TH + ' w-10'}>
                    <input type="checkbox"
                      checked={selected.size===filtered.length && filtered.length>0}
                      onChange={toggleAll} className="accent-[#7C4DFF]"/>
                  </th>
                  <th className={TH + ' w-8'}/>
                  <th className={TH}>Cliente</th>
                  {isAtrasadas && <th className={TH}>Fone</th>}
                  <th className={TH}>Histórico</th>
                  <th className={TH}>Vencimento</th>
                  <th className={TH + ' text-right'}>Valor</th>
                  <th className={TH + ' text-right'}>Saldo</th>
                  <th className={TH + ' text-right'}>Valor líquido</th>
                  <th className={TH + ' text-right'}>Recebido</th>
                  <th className={TH}>Data Emissão</th>
                  <th className={TH}>Documento Origem</th>
                  <th className={TH}>Marcadores</th>
                  <th className={TH}>Meio</th>
                  <th className={TH}>Integrações</th>
                  <th className={TH + ' w-8'}/>
                </tr>
              </thead>
              <tbody className="divide-y divide-[var(--d2b-border)]">
                {filtered.length === 0 ? (
                  <tr>
                    <td colSpan={colSpan} className="py-16">
                      <div className="flex flex-col items-center gap-4 max-w-xs mx-auto text-center border border-[rgba(255,165,0,0.4)] rounded-xl p-8">
                        <div className="w-14 h-14 text-4xl flex items-center justify-center">&#128062;</div>
                        <div>
                          <p className="font-semibold text-[var(--d2b-text-primary)] mb-1">
                            Sua pesquisa não retornou resultados.
                          </p>
                          <p className="text-sm text-[var(--d2b-text-muted)]">
                            Tente outras opções de pesquisa, situações ou remova os filtros.
                          </p>
                        </div>
                        <div className="flex gap-2">
                          <button className={BTN_PRIMARY + ' text-xs py-1.5'}>alterar pesquisa</button>
                          <button onClick={()=>setSearch('')}
                            className="text-sm text-[var(--d2b-text-muted)] hover:text-[var(--d2b-text-primary)]">
                            limpar filtros
                          </button>
                        </div>
                      </div>
                    </td>
                  </tr>
                ) : filtered.map(c => (
                  <tr key={c.id}
                    onClick={()=>{ setSelectedConta(c); setViewMode('view') }}
                    className={[
                      'group hover:bg-[var(--d2b-hover)] transition-colors cursor-pointer',
                      selected.has(c.id) ? 'bg-[rgba(124,77,255,0.06)]' : '',
                    ].join(' ')}>
                    <td className={TD} onClick={e=>e.stopPropagation()}>
                      <input type="checkbox" checked={selected.has(c.id)}
                        onChange={()=>setSelected(prev=>{
                          const n=new Set(prev)
                          n.has(c.id)?n.delete(c.id):n.add(c.id)
                          return n
                        })} className="accent-[#7C4DFF]"/>
                    </td>
                    <td className={TD}>
                      <button
                        className="opacity-0 group-hover:opacity-100 transition-opacity text-[var(--d2b-text-muted)] hover:text-[var(--d2b-text-primary)] p-1 rounded"
                        onClick={e=>e.stopPropagation()}>
                        <MoreHorizontal size={14}/>
                      </button>
                    </td>
                    <td className={TD + ' font-medium'}>{c.cliente}</td>
                    {isAtrasadas && (
                      <td className={TD + ' text-[var(--d2b-text-muted)]'}>{c.clienteFone}</td>
                    )}
                    <td className={TD + ' text-[var(--d2b-text-muted)] max-w-xs truncate'}>
                      {c.historico || '—'}
                    </td>
                    <td className={TD}>
                      <span className={c.status==='atrasada' ? 'text-red-500 font-medium' : ''}>
                        {c.vencimento}
                      </span>
                    </td>
                    <td className={TD + ' text-right'}>{fmtBRL(c.valor)}</td>
                    <td className={TD + ' text-right'}>{fmtBRL(c.saldo)}</td>
                    <td className={TD + ' text-right'}>{fmtBRL(c.valorLiquido)}</td>
                    <td className={TD + ' text-right text-emerald-500'}>{fmtBRL(c.recebido)}</td>
                    <td className={TD}>{c.dataEmissao}</td>
                    <td className={TD + ' text-[var(--d2b-text-muted)]'}>{c.documentoOrigem || '—'}</td>
                    <td className={TD}>
                      {c.marcadores.length > 0
                        ? <div className="flex gap-1">{c.marcadores.map(m=>(
                            <span key={m} className="px-2 py-0.5 text-xs rounded-full bg-[var(--d2b-bg-elevated)] text-[var(--d2b-text-secondary)] border border-[var(--d2b-border)]">
                              {m}
                            </span>
                          ))}</div>
                        : <StatusDot status={c.status}/>
                      }
                    </td>
                    <td className={TD + ' text-[var(--d2b-text-muted)]'}>{c.meio}</td>
                    <td className={TD + ' text-[var(--d2b-text-muted)]'}>{c.integracoes}</td>
                    <td className={TD}>
                      <button
                        className="text-[var(--d2b-text-muted)] hover:text-[var(--d2b-text-primary)] p-1 rounded"
                        onClick={e=>e.stopPropagation()}>
                        <ChevronDown size={14}/>
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* Footer bar */}
      <div className="shrink-0 border-t border-[var(--d2b-border)] bg-[var(--d2b-bg-surface)] px-6 py-3">
        {selected.size > 0 ? (
          <div className="flex items-center gap-3">
            <span className="flex items-center gap-1.5 text-sm font-medium">
              <span className="w-5 h-5 rounded-full bg-[#7C4DFF] text-white text-xs flex items-center justify-center">
                {selected.size}
              </span>
              selecionado{selected.size>1?'s':''}
            </span>
            <button className={BTN_PRIMARY + ' text-xs py-1.5'}>receber (baixar conta)</button>
            <button className={BTN_OUTLINE + ' text-xs py-1.5'}>excluir contas</button>
            <button className={BTN_OUTLINE + ' text-xs py-1.5'}>cancelar contas</button>
            <div className="relative">
              <button onClick={()=>setMaisAcoesFooter(p=>!p)} className={BTN_GHOST + ' text-xs'}>
                mais ações <ChevronDown size={12}/>
              </button>
              {maisAcoesFooter && (
                <div className="absolute bottom-full mb-1 left-0 w-56 bg-[var(--d2b-bg-surface)] border border-[var(--d2b-border)] rounded-lg shadow-lg z-20 py-1">
                  {['Alterar marcadores','Alterar categoria','Conciliar com o banco'].map(a=>(
                    <button key={a} onClick={()=>setMaisAcoesFooter(false)}
                      className="w-full text-left px-4 py-2 text-sm text-[var(--d2b-text-primary)] hover:bg-[var(--d2b-hover)]">
                      {a}
                    </button>
                  ))}
                </div>
              )}
            </div>
          </div>
        ) : (
          <div className="flex items-center justify-end gap-6 text-sm text-[var(--d2b-text-secondary)]">
            <span>
              {filtered.length} <span className="text-[var(--d2b-text-muted)]">quantidade</span>
            </span>
            <span className="font-semibold text-[var(--d2b-text-primary)]">
              {fmtBRL(totalValor)} <span className="text-[var(--d2b-text-muted)] font-normal">valor total (R$)</span>
            </span>
          </div>
        )}
      </div>
    </div>
  )
}
