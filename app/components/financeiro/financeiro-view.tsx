'use client'

import { useState } from 'react'
import {
  DollarSign, TrendingUp, TrendingDown, ArrowDownCircle, ArrowUpCircle,
  ChevronDown, Search, Plus, Filter, Download, X, Check,
  AlertTriangle, Calendar, Clock, CreditCard, Banknote,
  type LucideIcon,
} from 'lucide-react'
import {
  AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  LineChart, Line,
} from 'recharts'

// ─── Shared styles ────────────────────────────────────────────────────────────
const INP =
  'w-full bg-[#0D0520] border border-[rgba(124,77,255,0.25)] rounded-md ' +
  'px-3 py-2.5 text-sm text-[#F5F0FF] placeholder:text-[#6B4E8A] ' +
  'focus:outline-none focus:border-[#7C4DFF] transition-colors'
const LBG = 'bg-[#0D0520]'
const BTN_GHOST =
  'px-5 py-2 rounded-md text-sm font-medium text-[#A78BCC] border border-[rgba(124,77,255,0.25)] hover:border-[#7C4DFF] hover:text-[#F5F0FF] transition-colors'
const BTN_PRIMARY =
  'px-5 py-2 rounded-md text-sm font-bold text-white bg-[#7C4DFF] hover:bg-[#5B21B6] transition-colors'

function fmtBRL(v: number) {
  return v.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })
}

// ─── Types ────────────────────────────────────────────────────────────────────
type SubTab = 'dashboard' | 'receber' | 'mensalidades' | 'pagar'

type Lancamento = {
  id: number
  descricao: string
  valor: number
  vencimento: string
  status: 'pago' | 'aberto' | 'atrasado'
  tipo: 'entrada' | 'saida'
  paciente?: string
  categoria?: string
}

// ─── Mock data ────────────────────────────────────────────────────────────────
const RECEBER_DATA: Lancamento[] = [
  { id: 1, descricao: 'Consulta – Jesse Bezerra',  valor: 500,  vencimento: '01/04/2026', status: 'aberto',   tipo: 'entrada', paciente: 'Jesse Bezerra',    categoria: 'Consulta' },
  { id: 2, descricao: 'Retorno – Maria Silva',     valor: 150,  vencimento: '02/04/2026', status: 'aberto',   tipo: 'entrada', paciente: 'Maria Silva',      categoria: 'Retorno' },
  { id: 3, descricao: 'Procedimento – João Neto',  valor: 800,  vencimento: '28/03/2026', status: 'atrasado', tipo: 'entrada', paciente: 'João Neto',        categoria: 'Procedimento' },
  { id: 4, descricao: 'Teleconsulta – Ana Lopes',  valor: 200,  vencimento: '25/03/2026', status: 'pago',     tipo: 'entrada', paciente: 'Ana Lopes',        categoria: 'Teleconsulta' },
  { id: 5, descricao: 'Exame – Carlos Mendes',     valor: 300,  vencimento: '20/03/2026', status: 'pago',     tipo: 'entrada', paciente: 'Carlos Mendes',    categoria: 'Exame' },
]

const PAGAR_DATA: Lancamento[] = [
  { id: 6, descricao: 'Aluguel – Março/2026',      valor: 2500, vencimento: '05/04/2026', status: 'aberto',   tipo: 'saida', categoria: 'Aluguel' },
  { id: 7, descricao: 'Energia Elétrica',          valor: 380,  vencimento: '10/04/2026', status: 'aberto',   tipo: 'saida', categoria: 'Utilidades' },
  { id: 8, descricao: 'Sistema Agendart',          valor: 199,  vencimento: '15/04/2026', status: 'aberto',   tipo: 'saida', categoria: 'Software' },
  { id: 9, descricao: 'Fornecedor Materiais',      valor: 650,  vencimento: '18/03/2026', status: 'pago',     tipo: 'saida', categoria: 'Materiais' },
]

const MENSALIDADES_DATA: Lancamento[] = [
  { id: 10, descricao: 'Plano Mensal – Jesse',    valor: 150, vencimento: '01/04/2026', status: 'aberto',   tipo: 'entrada', paciente: 'Jesse Bezerra' },
  { id: 11, descricao: 'Plano Mensal – Maria',    valor: 150, vencimento: '05/04/2026', status: 'aberto',   tipo: 'entrada', paciente: 'Maria Silva'   },
  { id: 12, descricao: 'Plano Semestral – João',  valor: 750, vencimento: '10/04/2026', status: 'pago',     tipo: 'entrada', paciente: 'João Neto'     },
]

const CHART_RECEBER = [
  { date: '28/03', valor: 0 },
  { date: '29/03', valor: 50 },
  { date: '30/03', valor: 200 },
  { date: '31/03', valor: 500 },
  { date: '01/04', valor: 100 },
  { date: '02/04', valor: 0 },
]

const CHART_PAGAR = [
  { date: '28/03', valor: 0 },
  { date: '29/03', valor: 0 },
  { date: '30/03', valor: 0 },
  { date: '31/03', valor: 0 },
  { date: '01/04', valor: 0 },
  { date: '02/04', valor: 0 },
]

// ─── Status badge ─────────────────────────────────────────────────────────────
function StatusBadge({ status }: { status: Lancamento['status'] }) {
  const map = {
    pago:     { label: 'Pago',     cls: 'bg-[rgba(34,197,94,0.12)] text-[#22C55E] border border-[rgba(34,197,94,0.25)]' },
    aberto:   { label: 'Em aberto', cls: 'bg-[rgba(124,77,255,0.10)] text-[#A78BCC] border border-[rgba(124,77,255,0.25)]' },
    atrasado: { label: 'Atrasado', cls: 'bg-[rgba(239,68,68,0.12)] text-[#EF4444] border border-[rgba(239,68,68,0.25)]' },
  }
  const { label, cls } = map[status]
  return <span className={`text-[10px] font-semibold px-2 py-0.5 rounded-full ${cls}`}>{label}</span>
}

// ─── FSelect ──────────────────────────────────────────────────────────────────
function FSelect({ label, opts, value, onChange }: {
  label: string; opts: string[]; value: string; onChange: (v: string) => void
}) {
  return (
    <div className="relative">
      <label className={`absolute -top-2 left-3 z-10 ${LBG} px-1 text-[10px] font-medium text-[#A78BCC] leading-none`}>
        {label}
      </label>
      <div className="relative">
        <select
          value={value}
          onChange={(e) => onChange(e.target.value)}
          className={INP + ' appearance-none pr-8 cursor-pointer'}
        >
          {opts.map((o) => <option key={o} value={o}>{o}</option>)}
        </select>
        <ChevronDown size={13} className="absolute right-3 top-1/2 -translate-y-1/2 text-[#A78BCC] pointer-events-none" />
      </div>
    </div>
  )
}

// ─── Modal novo lançamento ────────────────────────────────────────────────────
function ModalLancamento({ tipo, onClose }: {
  tipo: 'entrada' | 'saida'; onClose: () => void
}) {
  const [descricao, setDescricao] = useState('')
  const [valor,     setValor]     = useState('')
  const [venc,      setVenc]      = useState('')
  const [categoria, setCategoria] = useState('Consulta')

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm">
      <div className="bg-[#120328] border border-[rgba(124,77,255,0.25)] rounded-xl shadow-2xl w-full max-w-md mx-4 p-6">
        <div className="flex items-center justify-between mb-5">
          <h3 className="text-base font-bold text-[#F5F0FF]">
            {tipo === 'entrada' ? 'Novo Recebimento' : 'Nova Despesa'}
          </h3>
          <button onClick={onClose} className="text-[#6B4E8A] hover:text-[#F5F0FF] transition-colors">
            <X size={18} />
          </button>
        </div>

        <div className="space-y-4">
          <div className="relative">
            <label className={`absolute -top-2 left-3 z-10 ${LBG} px-1 text-[10px] font-medium text-[#A78BCC] leading-none`}>
              Descrição<span className="text-[#7C4DFF] ml-0.5">*</span>
            </label>
            <input value={descricao} onChange={(e) => setDescricao(e.target.value)} className={INP} />
          </div>
          <div className="relative">
            <label className={`absolute -top-2 left-3 z-10 ${LBG} px-1 text-[10px] font-medium text-[#A78BCC] leading-none`}>
              Valor (R$)<span className="text-[#7C4DFF] ml-0.5">*</span>
            </label>
            <input placeholder="0,00" value={valor} onChange={(e) => setValor(e.target.value)} className={INP} />
          </div>
          <div className="relative">
            <label className={`absolute -top-2 left-3 z-10 ${LBG} px-1 text-[10px] font-medium text-[#A78BCC] leading-none`}>
              Vencimento<span className="text-[#7C4DFF] ml-0.5">*</span>
            </label>
            <input type="date" value={venc} onChange={(e) => setVenc(e.target.value)} className={INP} />
          </div>
          <FSelect
            label="Categoria"
            opts={tipo === 'entrada'
              ? ['Consulta', 'Retorno', 'Procedimento', 'Teleconsulta', 'Exame', 'Mensalidade']
              : ['Aluguel', 'Utilidades', 'Software', 'Materiais', 'Salário', 'Outros']}
            value={categoria}
            onChange={setCategoria}
          />
        </div>

        <div className="flex justify-end gap-3 mt-6">
          <button onClick={onClose} className={BTN_GHOST}>Cancelar</button>
          <button onClick={onClose} className={BTN_PRIMARY}>Salvar</button>
        </div>
      </div>
    </div>
  )
}

// ─── Tabela de lançamentos ────────────────────────────────────────────────────
function TabelaLancamentos({ data, tipo }: { data: Lancamento[]; tipo: 'entrada' | 'saida' }) {
  const [search, setSearch] = useState('')
  const [filtroStatus, setFiltroStatus] = useState('Todos')
  const [showModal, setShowModal] = useState(false)

  const filtered = data.filter((l) => {
    const matchSearch = l.descricao.toLowerCase().includes(search.toLowerCase())
    const matchStatus =
      filtroStatus === 'Todos' ||
      (filtroStatus === 'Pago' && l.status === 'pago') ||
      (filtroStatus === 'Em aberto' && l.status === 'aberto') ||
      (filtroStatus === 'Atrasado' && l.status === 'atrasado')
    return matchSearch && matchStatus
  })

  const totalPago   = data.filter((l) => l.status === 'pago').reduce((s, l) => s + l.valor, 0)
  const totalAberto = data.filter((l) => l.status === 'aberto' || l.status === 'atrasado').reduce((s, l) => s + l.valor, 0)
  const totalGeral  = data.reduce((s, l) => s + l.valor, 0)

  return (
    <div className="space-y-5">
      {/* Filtros */}
      <div className="flex items-center gap-3 flex-wrap">
        <div className="relative flex-1 min-w-[180px] max-w-xs">
          <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-[#6B4E8A]" />
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Pesquisar..."
            className={INP + ' pl-8'}
          />
        </div>
        <FSelect
          label="Status"
          opts={['Todos', 'Pago', 'Em aberto', 'Atrasado']}
          value={filtroStatus}
          onChange={setFiltroStatus}
        />
        <button className={BTN_GHOST + ' flex items-center gap-1.5 ml-auto'}>
          <Download size={14} />
          Exportar
        </button>
        <button
          onClick={() => setShowModal(true)}
          className={BTN_PRIMARY + ' flex items-center gap-1.5'}
        >
          <Plus size={14} />
          {tipo === 'entrada' ? 'Novo Recebimento' : 'Nova Despesa'}
        </button>
      </div>

      {/* Resumo */}
      <div className="grid grid-cols-3 gap-3">
        {[
          { label: tipo === 'entrada' ? 'Recebido' : 'Quitado',          value: totalPago,   color: '#22C55E' },
          { label: tipo === 'entrada' ? 'A Receber (Em aberto)' : 'A Pagar (Em aberto)', value: totalAberto, color: '#A78BCC' },
          { label: tipo === 'entrada' ? 'Total a Receber' : 'Total a Pagar', value: totalGeral,  color: tipo === 'entrada' ? '#7C4DFF' : '#EF4444' },
        ].map(({ label, value, color }) => (
          <div key={label} className="flex items-center gap-3 rounded-lg border border-[rgba(124,77,255,0.18)] bg-[#120328] px-4 py-3">
            <div className="w-8 h-8 rounded-lg flex items-center justify-center shrink-0" style={{ background: `${color}20` }}>
              <DollarSign size={16} style={{ color }} />
            </div>
            <div>
              <p className="text-xs text-[#A78BCC]">{label}</p>
              <p className="text-sm font-bold" style={{ color }}>{fmtBRL(value)}</p>
            </div>
          </div>
        ))}
      </div>

      {/* Tabela */}
      <div className="rounded-lg border border-[rgba(124,77,255,0.18)] overflow-hidden">
        <div className="grid grid-cols-[1fr_auto_auto_auto] gap-0 bg-[#120328] border-b border-[rgba(124,77,255,0.12)]">
          <div className="px-4 py-2.5 text-[10px] font-semibold uppercase tracking-widest text-[#6B4E8A]">Descrição</div>
          <div className="px-4 py-2.5 text-[10px] font-semibold uppercase tracking-widest text-[#6B4E8A]">Vencimento</div>
          <div className="px-4 py-2.5 text-[10px] font-semibold uppercase tracking-widest text-[#6B4E8A]">Valor</div>
          <div className="px-4 py-2.5 text-[10px] font-semibold uppercase tracking-widest text-[#6B4E8A]">Status</div>
        </div>
        {filtered.length === 0 && (
          <div className="px-4 py-8 text-center text-sm text-[#6B4E8A]">Nenhum lançamento encontrado.</div>
        )}
        {filtered.map((l, i) => (
          <div
            key={l.id}
            className={`grid grid-cols-[1fr_auto_auto_auto] gap-0 px-0 items-center ${
              i < filtered.length - 1 ? 'border-b border-[rgba(124,77,255,0.08)]' : ''
            } hover:bg-[rgba(124,77,255,0.04)] transition-colors`}
          >
            <div className="px-4 py-3">
              <p className="text-sm font-medium text-[#F5F0FF]">{l.descricao}</p>
              {l.paciente && <p className="text-xs text-[#6B4E8A]">{l.categoria}</p>}
            </div>
            <div className="px-4 py-3 text-sm text-[#A78BCC] whitespace-nowrap">{l.vencimento}</div>
            <div className="px-4 py-3 text-sm font-semibold whitespace-nowrap" style={{ color: tipo === 'entrada' ? '#22C55E' : '#EF4444' }}>
              {fmtBRL(l.valor)}
            </div>
            <div className="px-4 py-3">
              <StatusBadge status={l.status} />
            </div>
          </div>
        ))}
      </div>

      {showModal && <ModalLancamento tipo={tipo} onClose={() => setShowModal(false)} />}
    </div>
  )
}

// ─── TAB: DASHBOARD ──────────────────────────────────────────────────────────
function TabDashboard() {
  const recebido   = RECEBER_DATA.filter((l) => l.status === 'pago').reduce((s, l) => s + l.valor, 0)
  const aReceber   = RECEBER_DATA.filter((l) => l.status !== 'pago').reduce((s, l) => s + l.valor, 0)
  const totalRec   = RECEBER_DATA.reduce((s, l) => s + l.valor, 0)
  const quitado    = PAGAR_DATA.filter((l) => l.status === 'pago').reduce((s, l) => s + l.valor, 0)
  const aPagar     = PAGAR_DATA.filter((l) => l.status !== 'pago').reduce((s, l) => s + l.valor, 0)
  const totalPag   = PAGAR_DATA.reduce((s, l) => s + l.valor, 0)

  const STAT_CARDS = [
    { label: 'Recebido',           value: recebido, color: '#22C55E', Icon: ArrowDownCircle },
    { label: 'A Receber',          value: aReceber, color: '#7C4DFF', Icon: TrendingUp       },
    { label: 'Total a Receber',    value: totalRec, color: '#7C4DFF', Icon: DollarSign       },
    { label: 'Quitado',            value: quitado,  color: '#22C55E', Icon: Check as LucideIcon },
    { label: 'A Pagar',            value: aPagar,   color: '#EF4444', Icon: ArrowUpCircle    },
    { label: 'Total a Pagar',      value: totalPag, color: '#EF4444', Icon: TrendingDown     },
  ]

  return (
    <div className="space-y-7">
      <div className="flex items-start justify-between">
        <div>
          <h2 className="text-base font-bold text-[#F5F0FF]">Dashboard</h2>
          <p className="text-xs text-[#A78BCC] mt-0.5">Faça análises e crie relatórios gerenciais facilmente</p>
        </div>
        <div className="flex gap-2">
          <button className={BTN_GHOST + ' flex items-center gap-1.5'}>
            <Download size={14} />
            DRE Modelo
          </button>
          <button className={BTN_GHOST + ' flex items-center gap-1.5'}>
            <Filter size={14} />
            Filtrar dados
          </button>
        </div>
      </div>

      {/* Conta a Receber */}
      <div>
        <h3 className="text-sm font-semibold text-[#A78BCC] mb-3">Conta a Receber</h3>
        <div className="grid grid-cols-[1fr_1fr_1fr_1.5fr] gap-3 items-start">
          <div className="col-span-3 grid grid-cols-3 gap-3">
            {STAT_CARDS.slice(0, 3).map(({ label, value, color, Icon }) => (
              <div key={label} className="rounded-lg border border-[rgba(124,77,255,0.18)] bg-[#120328] p-4 flex items-center gap-3">
                <div className="w-9 h-9 rounded-lg flex items-center justify-center shrink-0" style={{ background: `${color}20` }}>
                  <Icon size={18} style={{ color }} strokeWidth={1.5} />
                </div>
                <div>
                  <p className="text-xs text-[#A78BCC]">{label}</p>
                  <p className="text-sm font-bold" style={{ color }}>{fmtBRL(value)}</p>
                </div>
              </div>
            ))}
          </div>
          <div className="rounded-lg border border-[rgba(124,77,255,0.18)] bg-[#120328] p-3 h-[120px]">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={CHART_RECEBER} margin={{ top: 4, right: 4, left: -30, bottom: 0 }}>
                <defs>
                  <linearGradient id="recGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%"  stopColor="#38BDF8" stopOpacity={0.4} />
                    <stop offset="95%" stopColor="#38BDF8" stopOpacity={0.02} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(124,77,255,0.08)" />
                <XAxis dataKey="date" tick={{ fontSize: 9, fill: '#6B4E8A' }} axisLine={false} tickLine={false} />
                <YAxis tick={{ fontSize: 9, fill: '#6B4E8A' }} axisLine={false} tickLine={false} />
                <Tooltip
                  contentStyle={{ background: '#120328', border: '1px solid rgba(124,77,255,0.25)', borderRadius: 8 }}
                  labelStyle={{ color: '#A78BCC', fontSize: 11 }}
                  itemStyle={{ color: '#38BDF8', fontSize: 11 }}
                  formatter={(v: number) => [fmtBRL(v), 'A Receber']}
                />
                <Area type="monotone" dataKey="valor" stroke="#38BDF8" strokeWidth={2} fill="url(#recGrad)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      <div className="border-t border-[rgba(124,77,255,0.10)]" />

      {/* Conta a Pagar */}
      <div>
        <h3 className="text-sm font-semibold text-[#A78BCC] mb-3">Conta a Pagar</h3>
        <div className="grid grid-cols-[1.5fr_1fr_1fr_1fr] gap-3 items-start">
          <div className="rounded-lg border border-[rgba(124,77,255,0.18)] bg-[#120328] p-3 h-[120px]">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={CHART_PAGAR} margin={{ top: 4, right: 4, left: -30, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(124,77,255,0.08)" />
                <XAxis dataKey="date" tick={{ fontSize: 9, fill: '#6B4E8A' }} axisLine={false} tickLine={false} />
                <YAxis tick={{ fontSize: 9, fill: '#6B4E8A' }} axisLine={false} tickLine={false} />
                <Tooltip
                  contentStyle={{ background: '#120328', border: '1px solid rgba(124,77,255,0.25)', borderRadius: 8 }}
                  labelStyle={{ color: '#A78BCC', fontSize: 11 }}
                  itemStyle={{ color: '#EF4444', fontSize: 11 }}
                  formatter={(v: number) => [fmtBRL(v), 'A Pagar']}
                />
                <Line type="monotone" dataKey="valor" stroke="#EF4444" strokeWidth={2} dot={false} />
              </LineChart>
            </ResponsiveContainer>
          </div>
          <div className="col-span-3 grid grid-cols-3 gap-3">
            {STAT_CARDS.slice(3).map(({ label, value, color, Icon }) => (
              <div key={label} className="rounded-lg border border-[rgba(124,77,255,0.18)] bg-[#120328] p-4 flex items-center gap-3">
                <div className="w-9 h-9 rounded-lg flex items-center justify-center shrink-0" style={{ background: `${color}20` }}>
                  <Icon size={18} style={{ color }} strokeWidth={1.5} />
                </div>
                <div>
                  <p className="text-xs text-[#A78BCC]">{label}</p>
                  <p className="text-sm font-bold" style={{ color }}>{fmtBRL(value)}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}

// ─── TAB: MENSALIDADES ────────────────────────────────────────────────────────
function TabMensalidades() {
  return (
    <div className="space-y-5">
      <div className="flex items-start justify-between">
        <div>
          <h2 className="text-base font-bold text-[#F5F0FF]">Mensalidades</h2>
          <p className="text-xs text-[#A78BCC] mt-1">Gerencie cobranças recorrentes de planos e mensalidades.</p>
        </div>
        <button className={BTN_PRIMARY + ' flex items-center gap-1.5'}>
          <Plus size={14} />
          Nova Mensalidade
        </button>
      </div>
      <TabelaLancamentos data={MENSALIDADES_DATA} tipo="entrada" />
    </div>
  )
}

// ─── Sub-tab nav ──────────────────────────────────────────────────────────────
type SubTabDef = { id: SubTab; label: string; Icon: LucideIcon }

const SUB_TABS: SubTabDef[] = [
  { id: 'dashboard',   label: 'Dashboard',    Icon: TrendingUp    },
  { id: 'receber',     label: 'A receber',    Icon: ArrowDownCircle },
  { id: 'mensalidades',label: 'Mensalidades', Icon: Calendar      },
  { id: 'pagar',       label: 'A pagar',      Icon: ArrowUpCircle },
]

// ─── Main component ───────────────────────────────────────────────────────────
export function FinanceiroView() {
  const [subTab, setSubTab] = useState<SubTab>('dashboard')

  const content = (() => {
    switch (subTab) {
      case 'dashboard':    return <TabDashboard />
      case 'receber':      return (
        <div className="space-y-5">
          <div className="flex items-start justify-between">
            <div>
              <h2 className="text-base font-bold text-[#F5F0FF]">Contas a Receber</h2>
              <p className="text-xs text-[#A78BCC] mt-1">Gerencie suas cobranças e recebimentos.</p>
            </div>
          </div>
          <TabelaLancamentos data={RECEBER_DATA} tipo="entrada" />
        </div>
      )
      case 'mensalidades': return <TabMensalidades />
      case 'pagar':        return (
        <div className="space-y-5">
          <div className="flex items-start justify-between">
            <div>
              <h2 className="text-base font-bold text-[#F5F0FF]">Contas a Pagar</h2>
              <p className="text-xs text-[#A78BCC] mt-1">Gerencie suas despesas e pagamentos.</p>
            </div>
          </div>
          <TabelaLancamentos data={PAGAR_DATA} tipo="saida" />
        </div>
      )
    }
  })()

  return (
    <div className="flex h-full min-h-0">
      {/* ── Sub-menu lateral ── */}
      <aside className="flex flex-col w-[80px] shrink-0 border-r border-[rgba(124,77,255,0.18)] bg-[#120328] py-3 gap-0.5 overflow-y-auto">
        {SUB_TABS.map(({ id, label, Icon }) => {
          const active = subTab === id
          return (
            <button
              key={id}
              onClick={() => setSubTab(id)}
              title={label}
              className={`flex flex-col items-center gap-1 py-3 mx-2 rounded-xl transition-all ${
                active ? 'bg-[rgba(124,77,255,0.15)]' : 'hover:bg-[rgba(124,77,255,0.08)]'
              }`}
            >
              <Icon size={20} color={active ? '#7C4DFF' : '#6B4E8A'} strokeWidth={active ? 2.5 : 1.5} />
              <span className="text-[9px] font-medium leading-tight text-center" style={{ color: active ? '#7C4DFF' : '#6B4E8A' }}>
                {label}
              </span>
            </button>
          )
        })}
      </aside>

      {/* ── Conteúdo ── */}
      <div className="flex-1 overflow-y-auto p-8">
        {content}
      </div>
    </div>
  )
}
