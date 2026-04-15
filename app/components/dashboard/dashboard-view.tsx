'use client'

import { useState, useRef, useEffect, useMemo, type ReactNode } from 'react'
import {
  Plus, MoreHorizontal, Printer, ChevronDown, Filter,
  CheckCircle2, TrendingUp, CheckSquare, X, Ban, CalendarDays, User2,
} from 'lucide-react'
import {
  AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer,
  LineChart, Line, CartesianGrid, Legend,
  BarChart, Bar,
  PieChart, Pie, Cell,
} from 'recharts'

// ─── Types ─────────────────────────────────────────────────────
type Tarefa = { id: number; texto: string; descricao: string; feita: boolean }

interface Agendamento {
  id: string
  pacienteNome: string
  usuarioNome: string
  usuarioId?: string
  inicio: string
  fim: string
  status: string
}

export interface ChartFinanceiroPoint { date: string; recebidos: number; aReceber: number }
export interface ChartSessoesPoint    { date: string; atendidos: number; desmarcados: number; faltantes: number }
export interface ChartAgendamentosPoint { date: string; agendamentos: number }

export interface DashboardData {
  agendamentosHoje: Agendamento[]
  totalRecebido: number
  totalAReceber: number
  evolucoesCriadas: number
  sessoesAtendidas: number
  sessoesDesmarcadas: number
  faltas: number
  chartFinanceiro: ChartFinanceiroPoint[]
  chartSessoes: ChartSessoesPoint[]
  chartAgendamentos: ChartAgendamentosPoint[]
  pacientesGenero: Record<string, number>
  pacientesGrupo: Record<string, number>
  pacientesStatus: Record<string, number>
  pacientesComoConheceu: Record<string, number>
}

// ─── Constants ─────────────────────────────────────────────────
const STATUS_COLOR: Record<string, string> = {
  agendado:   '#9CA3AF',
  confirmado: '#7C4DFF',
  atendido:   '#10B981',
  faltou:     '#EF4444',
  desmarcado: '#F59E0B',
  bloqueio:   '#6B7280',
}

const PIE_COLORS = ['#7C4DFF','#06B6D4','#EF4444','#F59E0B','#10B981','#8B5CF6','#B45309','#6B7280','#D1D5DB']

function fmtBRL(v: number) {
  return Number(v ?? 0).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })
}

function duracao(inicio: string, fim: string) {
  const mins = Math.round((new Date(fim).getTime() - new Date(inicio).getTime()) / 60000)
  if (mins < 60) return `${mins} min`
  const h = Math.floor(mins / 60), m = mins % 60
  return m ? `${h}h ${m}min` : `${h}h`
}

function horaStr(dt: string) {
  return new Date(dt).toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })
}

// ─── Sub-components ────────────────────────────────────────────
function LegendaStatus() {
  const items = [
    { label: 'Agendado',   color: STATUS_COLOR.agendado },
    { label: 'Confirmado', color: STATUS_COLOR.confirmado },
    { label: 'Atendido',   color: STATUS_COLOR.atendido },
    { label: 'Faltou',     color: STATUS_COLOR.faltou },
    { label: 'Desmarcado', color: STATUS_COLOR.desmarcado },
    { label: 'Bloqueio',   color: STATUS_COLOR.bloqueio },
  ]
  return (
    <div className="flex flex-wrap gap-3 mt-1">
      {items.map((i) => (
        <span key={i.label} className="flex items-center gap-1 text-[11px] text-[var(--d2b-text-secondary)]">
          <span className="inline-block w-2.5 h-2.5 rounded-sm" style={{ background: i.color }} />
          {i.label}
        </span>
      ))}
    </div>
  )
}

function StatRow({ icon, label, value, valueColor }: {
  icon: ReactNode; label: string; value: number; valueColor: string
}) {
  return (
    <div className="flex items-center gap-3 px-4 py-3 bg-[var(--d2b-bg-elevated)] rounded-lg border border-[var(--d2b-border)]">
      <div className="w-8 h-8 rounded-md bg-[var(--d2b-hover)] flex items-center justify-center text-[#C084FC] flex-shrink-0">
        {icon}
      </div>
      <span className="flex-1 text-sm text-[var(--d2b-text-secondary)]">{label}</span>
      <span className="text-sm font-bold" style={{ color: valueColor }}>{value}</span>
    </div>
  )
}

function DRERow({ label, value, indent, bold, negative }: {
  label: string; value?: string; indent?: boolean; bold?: boolean; negative?: boolean
}) {
  return (
    <div className={`flex justify-between items-center py-2 border-b border-[var(--d2b-border)] last:border-0 ${indent ? 'pl-4' : ''}`}>
      <span className={`text-sm ${bold ? 'font-semibold text-[var(--d2b-text-primary)]' : 'text-[var(--d2b-text-secondary)]'}`}>{label}</span>
      {value !== undefined && (
        <span className={`text-sm font-medium ${negative ? 'text-red-500' : 'text-[#10B981]'}`}>{value}</span>
      )}
    </div>
  )
}

type PieSlice = { name: string; value: number; color?: string }

function PieCard({ title, data, legend }: { title: string; data: PieSlice[]; legend: PieSlice[] }) {
  const hasData = data.some((d) => d.value > 0)
  const display: PieSlice[] = hasData ? data.filter((d) => d.value > 0) : [{ name: '-', value: 1, color: '#E5E7EB' }]
  return (
    <div className="flex flex-col items-center gap-2">
      <p className="text-xs font-medium text-[var(--d2b-text-secondary)] text-center">{title}</p>
      <PieChart width={160} height={160}>
        <Pie
          data={display}
          cx={75}
          cy={75}
          outerRadius={72}
          dataKey="value"
          label={hasData ? ({ percent }: { percent: number }) => `${(percent * 100).toFixed(1)}%` : undefined}
          labelLine={false}
        >
          {display.map((entry, i) => (
            <Cell key={i} fill={entry.color ?? PIE_COLORS[i % PIE_COLORS.length]} />
          ))}
        </Pie>
      </PieChart>
      <div className="flex flex-wrap justify-center gap-x-2 gap-y-1 max-w-[170px]">
        {legend.map((d, i) => (
          <span key={d.name} className="flex items-center gap-1 text-[10px] text-[var(--d2b-text-muted)]">
            <span className="w-2 h-2 rounded-full inline-block flex-shrink-0" style={{ background: d.color ?? PIE_COLORS[i % PIE_COLORS.length] }} />
            {d.name}
          </span>
        ))}
      </div>
    </div>
  )
}

// ─── Main component ────────────────────────────────────────────
export function DashboardView({ data, empresaId }: { data: DashboardData; empresaId?: string | null }) {
  const [tarefas, setTarefas] = useState<Tarefa[]>([])
  const [mostraInput, setMostraInput] = useState(false)
  const [novaTarefa, setNovaTarefa] = useState('')
  const inputRef = useRef<HTMLInputElement>(null)

  // ── Filtro profissionais (Atividades do Dia) ─────────────────
  const [profFiltroOpen, setProfFiltroOpen] = useState(false)
  const [selectedProfId, setSelectedProfId]   = useState<string | null>(null)
  const [selectedProfNome, setSelectedProfNome] = useState<string | null>(null)
  const profFiltroRef = useRef<HTMLDivElement>(null)

  // unique profissionais from agendamentos
  const profissionais = useMemo(() => {
    const map = new Map<string, string>()
    data.agendamentosHoje.forEach((a) => {
      if (a.usuarioId && a.usuarioNome) map.set(a.usuarioId, a.usuarioNome)
    })
    return Array.from(map.entries()).map(([id, nome]) => ({ id, nome }))
  }, [data.agendamentosHoje])

  const agendamentosFiltrados = selectedProfId
    ? data.agendamentosHoje.filter((a) => a.usuarioId === selectedProfId)
    : data.agendamentosHoje

  // close dropdown on outside click
  useEffect(() => {
    function handler(e: MouseEvent) {
      if (profFiltroRef.current && !profFiltroRef.current.contains(e.target as Node)) {
        setProfFiltroOpen(false)
      }
    }
    document.addEventListener('mousedown', handler)
    return () => document.removeEventListener('mousedown', handler)
  }, [])

  // ── Filtro Relatórios Gerenciais ──────────────────────────────
  const [filtroOpen, setFiltroOpen] = useState(false)
  const filtroRef = useRef<HTMLDivElement>(null)

  // data de hoje e 30 dias atrás como defaults
  const hoje = new Date()
  const trintaDiasAtras = new Date(hoje)
  trintaDiasAtras.setDate(hoje.getDate() - 30)
  const toISO = (d: Date) => d.toISOString().split('T')[0]

  const [filtroDataInicio, setFiltroDataInicio] = useState(toISO(trintaDiasAtras))
  const [filtroDataFim, setFiltroDataFim]       = useState(toISO(hoje))
  const [filtroRelProfId, setFiltroRelProfId]   = useState('')
  const [filtroAtivo, setFiltroAtivo]           = useState(false)
  const [filtrando, setFiltrando]               = useState(false)
  const [displayData, setDisplayData]           = useState<DashboardData>(data)

  useEffect(() => {
    function handler(e: MouseEvent) {
      if (filtroRef.current && !filtroRef.current.contains(e.target as Node)) {
        setFiltroOpen(false)
      }
    }
    document.addEventListener('mousedown', handler)
    return () => document.removeEventListener('mousedown', handler)
  }, [])

  async function handleAplicarFiltro() {
    if (!empresaId) return
    setFiltrando(true)
    try {
      const url = new URL(`${process.env.NEXT_PUBLIC_API_URL}/api/v1/dashboard/empresa/${empresaId}`)
      if (filtroDataInicio) url.searchParams.set('dataInicio', filtroDataInicio)
      if (filtroDataFim)    url.searchParams.set('dataFim', filtroDataFim)
      if (filtroRelProfId)  url.searchParams.set('usuarioId', filtroRelProfId)

      const res = await fetch(url.toString())
      if (res.ok) {
        const novo = await res.json()
        setDisplayData(novo)
        setFiltroAtivo(true)
        setFiltroOpen(false)
      }
    } catch (err) {
      console.error('Erro ao filtrar:', err)
    } finally {
      setFiltrando(false)
    }
  }

  function handleLimparFiltro() {
    setFiltroDataInicio(toISO(trintaDiasAtras))
    setFiltroDataFim(toISO(hoje))
    setFiltroRelProfId('')
    setDisplayData(data)
    setFiltroAtivo(false)
    setFiltroOpen(false)
  }

  // label do período ativo
  const periodoLabel = filtroAtivo
    ? `${filtroDataInicio.split('-').reverse().join('/')} – ${filtroDataFim.split('-').reverse().join('/')}`
    : 'últimos 30 dias'

  function handlePrint() {
    if (!empresaId) return
    const url = new URL('/api/relatorio/dashboard', window.location.origin)
    url.searchParams.set('empresaId', empresaId)
    if (selectedProfId) url.searchParams.set('usuarioId', selectedProfId)
    window.open(url.toString(), '_blank')
  }

  useEffect(() => {
    if (mostraInput) inputRef.current?.focus()
  }, [mostraInput])

  function adicionarTarefa() {
    const texto = novaTarefa.trim()
    if (!texto) return
    setTarefas((prev) => [...prev, { id: Date.now(), texto, descricao: 'Tarefa a realizar', feita: false }])
    setNovaTarefa('')
    setMostraInput(false)
  }

  function toggleTarefa(id: number) {
    setTarefas((prev) => prev.map((t) => (t.id === id ? { ...t, feita: !t.feita } : t)))
  }

  function removerTarefa(id: number) {
    setTarefas((prev) => prev.filter((t) => t.id !== id))
  }

  // Pie chart — Gênero
  const generoPie: PieSlice[] = Object.entries(data.pacientesGenero).map(([name, value], i) => ({
    name, value, color: PIE_COLORS[i % PIE_COLORS.length],
  }))

  // Pie chart — Grupo
  const grupoPie: PieSlice[] = Object.entries(data.pacientesGrupo).map(([name, value], i) => ({
    name, value, color: PIE_COLORS[i % PIE_COLORS.length],
  }))

  // Pie chart — Status
  const statusPie: PieSlice[] = Object.entries(data.pacientesStatus).map(([name, value], i) => ({
    name, value, color: PIE_COLORS[i % PIE_COLORS.length],
  }))

  // Pie chart — Como conheceu
  const conheceuPie: PieSlice[] = Object.entries(data.pacientesComoConheceu).map(([name, value], i) => ({
    name, value, color: PIE_COLORS[i % PIE_COLORS.length],
  }))

  return (
    <div className="p-6 space-y-5 bg-[var(--d2b-bg-main)] min-h-full">

      {/* Row 1: Atividades + Tarefas */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">

        {/* Atividades do Dia */}
        <div className="bg-[var(--d2b-bg-surface)] rounded-xl border border-[var(--d2b-border)] p-5 flex flex-col gap-3">
          <div className="flex items-start justify-between gap-2 flex-wrap">
            <div>
              <p className="text-sm font-semibold text-[var(--d2b-text-primary)]">Atividades do Dia</p>
              <p className="text-xs text-[var(--d2b-text-muted)]">
                {agendamentosFiltrados.length} {agendamentosFiltrados.length === 1 ? 'Evento' : 'Eventos'}
              </p>
            </div>
            <div className="flex items-center gap-2">
              {/* Dropdown filtro profissionais */}
              <div className="relative" ref={profFiltroRef}>
                <button
                  onClick={() => setProfFiltroOpen((v) => !v)}
                  className={`flex items-center gap-1.5 text-xs text-[var(--d2b-text-secondary)] bg-[var(--d2b-bg-elevated)] border rounded-md px-3 py-1.5 hover:border-[#7C4DFF] transition-colors ${
                    selectedProfId ? 'border-[#7C4DFF] text-[#7C4DFF]' : 'border-[var(--d2b-border)]'
                  }`}
                >
                  {selectedProfNome ?? 'Todos profissionais'} <ChevronDown size={12} />
                </button>
                {profFiltroOpen && (
                  <div className="absolute right-0 top-full mt-1 z-50 min-w-[200px] bg-[var(--d2b-bg-surface)] border border-[var(--d2b-border)] rounded-lg shadow-lg overflow-hidden">
                    <button
                      onClick={() => { setSelectedProfId(null); setSelectedProfNome(null); setProfFiltroOpen(false) }}
                      className={`w-full text-left px-4 py-2.5 text-xs hover:bg-[var(--d2b-bg-elevated)] transition-colors ${
                        !selectedProfId ? 'font-semibold text-[#7C4DFF]' : 'text-[var(--d2b-text-primary)]'
                      }`}
                    >
                      Todos profissionais
                    </button>
                    {profissionais.map((p) => (
                      <button
                        key={p.id}
                        onClick={() => { setSelectedProfId(p.id); setSelectedProfNome(p.nome); setProfFiltroOpen(false) }}
                        className={`w-full text-left px-4 py-2.5 text-xs hover:bg-[var(--d2b-bg-elevated)] transition-colors border-t border-[var(--d2b-border)] ${
                          selectedProfId === p.id ? 'font-semibold text-[#7C4DFF]' : 'text-[var(--d2b-text-primary)]'
                        }`}
                      >
                        {p.nome}
                      </button>
                    ))}
                    {profissionais.length === 0 && (
                      <p className="px-4 py-2.5 text-xs text-[var(--d2b-text-muted)]">Nenhum profissional</p>
                    )}
                  </div>
                )}
              </div>
              <button
                onClick={handlePrint}
                disabled={!empresaId}
                title="Imprimir relatório"
                className="p-1.5 rounded-md bg-[#7C4DFF] text-white hover:bg-[#5B21B6] disabled:opacity-40 transition-colors"
              >
                <Printer size={14} />
              </button>
            </div>
          </div>
          <LegendaStatus />
          <div className="flex flex-col gap-0 mt-1">
            {agendamentosFiltrados.length === 0 ? (
              <p className="text-xs text-[var(--d2b-text-muted)] py-4 text-center">Nenhum agendamento para hoje</p>
            ) : (
              agendamentosFiltrados.map((a) => (
                <div key={a.id} className="flex items-start gap-3 py-2.5 border-b border-[var(--d2b-border)] last:border-0">
                  <span className="text-xs text-[var(--d2b-text-secondary)] w-10 flex-shrink-0 mt-0.5">{horaStr(a.inicio)}</span>
                  <span className="text-red-400 flex-shrink-0 mt-0.5">
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="3" y="4" width="18" height="18" rx="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/></svg>
                  </span>
                  <div
                    className="w-0.5 self-stretch rounded-full flex-shrink-0"
                    style={{ background: STATUS_COLOR[a.status?.toLowerCase() ?? ''] ?? '#9CA3AF' }}
                  />
                  <div>
                    <p className="text-sm font-semibold text-[var(--d2b-text-primary)]">{a.pacienteNome ?? '—'}</p>
                    <p className="text-xs text-[var(--d2b-text-secondary)]">{a.usuarioNome ?? '—'}</p>
                    <p className="text-xs text-[var(--d2b-text-muted)]">{duracao(a.inicio, a.fim)}</p>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Lista de Tarefas */}
        <div className="bg-[var(--d2b-bg-surface)] rounded-xl border border-[var(--d2b-border)] p-5 flex flex-col gap-3">
          <div className="flex items-center justify-between">
            <p className="text-sm font-semibold text-[var(--d2b-text-primary)]">Lista de tarefas</p>
            <button
              onClick={() => setMostraInput((v) => !v)}
              className="flex items-center gap-1.5 text-xs font-semibold text-white bg-[#7C4DFF] hover:bg-[#5B21B6] px-3 py-1.5 rounded-md transition-colors"
            >
              <Plus size={13} />
              Nova Tarefa
            </button>
          </div>
          <div className="flex flex-col gap-2 flex-1">
            {tarefas.length === 0 && !mostraInput && (
              <p className="text-xs text-[var(--d2b-text-muted)] py-4 text-center">Nenhuma tarefa cadastrada</p>
            )}
            {tarefas.map((t) => (
              <div
                key={t.id}
                className="flex items-center gap-3 group rounded-lg px-3 py-2.5 hover:bg-[var(--d2b-bg-elevated)] border border-[var(--d2b-border)] transition-colors"
              >
                <div className="w-1 h-8 rounded-full bg-[#7C4DFF] flex-shrink-0" />
                <div
                  className="w-4 h-4 rounded border flex-shrink-0 cursor-pointer flex items-center justify-center"
                  style={t.feita ? { background: '#7C4DFF', borderColor: '#7C4DFF' } : { borderColor: '#D1D5DB', background: '#150830' }}
                  onClick={() => toggleTarefa(t.id)}
                >
                  {t.feita && <CheckCircle2 size={10} className="text-white" />}
                </div>
                <div className="flex-1 min-w-0">
                  <p className={`text-sm font-medium truncate ${t.feita ? 'line-through text-[var(--d2b-text-muted)]' : 'text-[var(--d2b-text-primary)]'}`}>{t.texto}</p>
                  <p className="text-xs text-[var(--d2b-text-muted)]">{t.descricao}</p>
                </div>
                <button
                  onClick={() => removerTarefa(t.id)}
                  className="opacity-0 group-hover:opacity-100 p-1 rounded text-[var(--d2b-text-muted)] hover:text-red-500 transition-all"
                >
                  <MoreHorizontal size={14} />
                </button>
              </div>
            ))}
          </div>
          {mostraInput && (
            <div className="flex gap-2 mt-1">
              <input
                ref={inputRef}
                value={novaTarefa}
                onChange={(e) => setNovaTarefa(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') adicionarTarefa()
                  if (e.key === 'Escape') { setMostraInput(false); setNovaTarefa('') }
                }}
                placeholder="Nova Tarefa"
                className="flex-1 bg-[var(--d2b-bg-elevated)] border border-[var(--d2b-border-strong)] rounded-md px-3 py-2 text-sm text-[var(--d2b-text-primary)] placeholder:text-[var(--d2b-text-muted)] focus:outline-none focus:border-[#7C4DFF] transition-colors"
              />
              <button
                onClick={adicionarTarefa}
                className="px-4 py-2 text-sm font-bold text-white bg-[#7C4DFF] hover:bg-[#5B21B6] rounded-md transition-colors"
              >
                Salvar
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Relatórios Gerenciais */}
      <div className="bg-[var(--d2b-bg-surface)] rounded-xl border border-[var(--d2b-border)] p-5 space-y-5">
        <div className="flex items-start justify-between flex-wrap gap-2">
          <div>
            <p className="text-sm font-semibold text-[var(--d2b-text-primary)]">Relatórios Gerenciais</p>
            <p className="text-xs text-[var(--d2b-text-secondary)]">Métricas: {periodoLabel}.</p>
          </div>

          {/* ── Popover Filtrar dados ── */}
          <div className="relative" ref={filtroRef}>
            <button
              onClick={() => setFiltroOpen((v) => !v)}
              className={`flex items-center gap-1.5 text-xs bg-[var(--d2b-bg-elevated)] border rounded-md px-3 py-1.5 hover:border-[#7C4DFF] transition-colors ${
                filtroAtivo
                  ? 'border-[#7C4DFF] text-[#7C4DFF] font-semibold'
                  : 'border-[var(--d2b-border)] text-[var(--d2b-text-secondary)]'
              }`}
            >
              <Filter size={12} />
              Filtrar dados
              {filtroAtivo && (
                <span className="ml-1 w-1.5 h-1.5 rounded-full bg-[#7C4DFF] inline-block" />
              )}
            </button>

            {filtroOpen && (
              <div className="absolute right-0 top-full mt-2 z-50 w-72 bg-[var(--d2b-bg-surface)] border border-[var(--d2b-border-strong)] rounded-xl shadow-xl p-4 space-y-4">
                <p className="text-xs font-semibold text-[var(--d2b-text-primary)]">Filtrar Relatórios</p>

                {/* Data início */}
                <div className="space-y-1">
                  <label className="flex items-center gap-1.5 text-[11px] font-medium text-[var(--d2b-text-secondary)]">
                    <CalendarDays size={12} />
                    Data início
                  </label>
                  <input
                    type="date"
                    value={filtroDataInicio}
                    onChange={(e) => setFiltroDataInicio(e.target.value)}
                    className="w-full px-3 py-2 rounded-lg border border-[var(--d2b-border-strong)] bg-[var(--d2b-bg-main)] text-sm text-[var(--d2b-text-primary)] focus:outline-none focus:border-[#7C4DFF] transition-colors"
                  />
                </div>

                {/* Data fim */}
                <div className="space-y-1">
                  <label className="flex items-center gap-1.5 text-[11px] font-medium text-[var(--d2b-text-secondary)]">
                    <CalendarDays size={12} />
                    Data fim
                  </label>
                  <input
                    type="date"
                    value={filtroDataFim}
                    onChange={(e) => setFiltroDataFim(e.target.value)}
                    className="w-full px-3 py-2 rounded-lg border border-[var(--d2b-border-strong)] bg-[var(--d2b-bg-main)] text-sm text-[var(--d2b-text-primary)] focus:outline-none focus:border-[#7C4DFF] transition-colors"
                  />
                </div>

                {/* Profissional */}
                <div className="space-y-1">
                  <label className="flex items-center gap-1.5 text-[11px] font-medium text-[var(--d2b-text-secondary)]">
                    <User2 size={12} />
                    Profissional
                  </label>
                  <select
                    value={filtroRelProfId}
                    onChange={(e) => setFiltroRelProfId(e.target.value)}
                    className="w-full px-3 py-2 rounded-lg border border-[var(--d2b-border-strong)] bg-[var(--d2b-bg-main)] text-sm text-[var(--d2b-text-primary)] focus:outline-none focus:border-[#7C4DFF] transition-colors"
                  >
                    <option value="">Todos os profissionais</option>
                    {profissionais.map((p) => (
                      <option key={p.id} value={p.id}>{p.nome}</option>
                    ))}
                  </select>
                </div>

                {/* Ações */}
                <div className="flex items-center gap-2 pt-1 border-t border-[var(--d2b-border)]">
                  <button
                    onClick={handleAplicarFiltro}
                    disabled={filtrando}
                    className="flex-1 py-2 rounded-lg bg-[#7C4DFF] hover:bg-[#5B21B6] text-white text-xs font-semibold transition-colors disabled:opacity-50"
                  >
                    {filtrando ? 'Filtrando...' : 'Aplicar'}
                  </button>
                  {filtroAtivo && (
                    <button
                      onClick={handleLimparFiltro}
                      className="px-3 py-2 rounded-lg border border-[var(--d2b-border-strong)] text-[var(--d2b-text-secondary)] text-xs font-medium hover:border-[#7C4DFF] hover:text-[#7C4DFF] transition-colors"
                    >
                      Limpar
                    </button>
                  )}
                </div>
              </div>
            )}
          </div>
        </div>

        {/* KPI cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="bg-[var(--d2b-bg-elevated)] rounded-lg p-4 flex items-center justify-between border border-[var(--d2b-border)]">
            <div>
              <p className="text-sm font-semibold text-[var(--d2b-text-primary)]">Valores Recebidos</p>
              <p className="text-xs text-[#7C4DFF] hover:underline cursor-pointer mt-1">Ver relatório completo</p>
            </div>
            <span className="text-sm font-bold px-3 py-1 rounded-lg bg-[rgba(16,185,129,0.18)] text-[#10B981]">
              {fmtBRL(displayData.totalRecebido)}
            </span>
          </div>
          <div className="bg-[var(--d2b-bg-elevated)] rounded-lg p-4 flex items-center justify-between border border-[var(--d2b-border)]">
            <div>
              <p className="text-sm font-semibold text-[var(--d2b-text-primary)]">Valores A Receber</p>
              <p className="text-xs text-[#7C4DFF] hover:underline cursor-pointer mt-1">Ver relatório completo</p>
            </div>
            <span className="text-sm font-bold px-3 py-1 rounded-lg bg-[rgba(239,68,68,0.18)] text-[#EF4444]">
              {fmtBRL(displayData.totalAReceber)}
            </span>
          </div>
        </div>

        {/* Area Charts */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          <div>
            <p className="text-[11px] text-[#10B981] mb-2">Recebidos: {fmtBRL(displayData.totalRecebido)}</p>
            <ResponsiveContainer width="100%" height={120}>
              <AreaChart data={displayData.chartFinanceiro}>
                <defs>
                  <linearGradient id="gRec" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#10B981" stopOpacity={0.2} />
                    <stop offset="95%" stopColor="#10B981" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <XAxis dataKey="date" tick={{ fontSize: 10, fill: '#6B4E8A' }} axisLine={false} tickLine={false} />
                <Tooltip contentStyle={{ background: '#0D0520', border: '1px solid rgba(124,77,255,0.3)', borderRadius: 8, fontSize: 12, color: '#F5F0FF' }} formatter={(v: number) => fmtBRL(v)} />
                <Area type="monotone" dataKey="recebidos" stroke="#10B981" fill="url(#gRec)" strokeWidth={2} />
              </AreaChart>
            </ResponsiveContainer>
          </div>
          <div>
            <p className="text-[11px] text-red-500 mb-2">A receber: {fmtBRL(displayData.totalAReceber)}</p>
            <ResponsiveContainer width="100%" height={120}>
              <AreaChart data={displayData.chartFinanceiro}>
                <defs>
                  <linearGradient id="gArec" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#EF4444" stopOpacity={0.2} />
                    <stop offset="95%" stopColor="#EF4444" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <XAxis dataKey="date" tick={{ fontSize: 10, fill: '#6B4E8A' }} axisLine={false} tickLine={false} />
                <Tooltip contentStyle={{ background: '#0D0520', border: '1px solid rgba(124,77,255,0.3)', borderRadius: 8, fontSize: 12, color: '#F5F0FF' }} formatter={(v: number) => fmtBRL(v)} />
                <Area type="monotone" dataKey="aReceber" stroke="#EF4444" fill="url(#gArec)" strokeWidth={2} />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Stats + Sessions line chart */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-5 pt-2 border-t border-[var(--d2b-border)]">
          <div className="flex flex-col gap-2">
            <StatRow icon={<TrendingUp size={14} />}  label="Evoluções Criadas"    value={Number(displayData.evolucoesCriadas)}    valueColor="#7C4DFF" />
            <StatRow icon={<CheckSquare size={14} />} label="Sessões Atendidas"    value={Number(displayData.sessoesAtendidas)}    valueColor="#10B981" />
            <StatRow icon={<X size={14} />}           label="Sessões Desmarcadas"  value={Number(displayData.sessoesDesmarcadas)}  valueColor="#EF4444" />
            <StatRow icon={<Ban size={14} />}         label="Faltas"               value={Number(displayData.faltas)}              valueColor="#6B7280" />
          </div>
          <div>
            <ResponsiveContainer width="100%" height={180}>
              <LineChart data={displayData.chartSessoes}>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(124,77,255,0.10)" />
                <XAxis dataKey="date" tick={{ fontSize: 9, fill: '#6B4E8A' }} axisLine={false} tickLine={false} />
                <YAxis tick={{ fontSize: 9, fill: '#6B4E8A' }} axisLine={false} tickLine={false} />
                <Tooltip contentStyle={{ background: '#0D0520', border: '1px solid rgba(124,77,255,0.3)', borderRadius: 8, fontSize: 12, color: '#F5F0FF' }} />
                <Legend iconSize={8} wrapperStyle={{ fontSize: 11 }} />
                <Line type="monotone" dataKey="atendidos"   name="Atendidos"   stroke="#10B981" strokeWidth={2} dot={false} />
                <Line type="monotone" dataKey="desmarcados" name="Desmarcados" stroke="#F59E0B" strokeWidth={2} dot={false} />
                <Line type="monotone" dataKey="faltantes"   name="Faltantes"   stroke="#EF4444" strokeWidth={2} dot={false} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* DRE */}
        <div className="border-t border-[var(--d2b-border)] pt-5">
          <p className="text-sm font-semibold text-[var(--d2b-text-primary)] mb-1">DRE - Demonstração de Resultados</p>
          <p className="text-xs text-[var(--d2b-text-secondary)] mb-4">Resumo financeiro: {periodoLabel}.</p>
          <div className="max-w-sm mx-auto border border-[var(--d2b-border)] rounded-xl bg-[var(--d2b-bg-elevated)] p-4">
            <DRERow label="Receita Bruta"         bold />
            <DRERow label="Recebimentos"          value={fmtBRL(displayData.totalRecebido)} indent />
            <DRERow label="A Receber (pendente)"  value={fmtBRL(displayData.totalAReceber)} indent negative />
            <DRERow label="Resultado"             bold />
            <DRERow label="(=) Saldo"             value={fmtBRL(displayData.totalRecebido - displayData.totalAReceber)} indent negative={displayData.totalRecebido - displayData.totalAReceber < 0} />
          </div>
        </div>
      </div>

      {/* Agendamentos por dia */}
      <div className="bg-[var(--d2b-bg-surface)] rounded-xl border border-[var(--d2b-border)] p-5">
        <p className="text-sm font-semibold text-[var(--d2b-text-primary)]">Agendamentos ao longo do tempo</p>
        <p className="text-xs text-[var(--d2b-text-secondary)] mt-0.5 mb-4">Total de agendamentos por dia nos últimos 30 dias.</p>
        <ResponsiveContainer width="100%" height={200}>
          <BarChart data={data.chartAgendamentos}>
            <CartesianGrid strokeDasharray="3 3" stroke="rgba(124,77,255,0.10)" />
            <XAxis dataKey="date" tick={{ fontSize: 9, fill: '#6B4E8A' }} axisLine={false} tickLine={false} />
            <YAxis tick={{ fontSize: 10, fill: '#6B4E8A' }} axisLine={false} tickLine={false} label={{ value: 'Agendamentos', angle: -90, position: 'insideLeft', style: { fontSize: 10, fill: '#6B4E8A' } }} />
            <Tooltip contentStyle={{ background: '#0D0520', border: '1px solid rgba(124,77,255,0.3)', borderRadius: 8, fontSize: 12, color: '#F5F0FF' }} />
            <Bar dataKey="agendamentos" fill="#7C4DFF" radius={[3, 3, 0, 0]} />
          </BarChart>
        </ResponsiveContainer>
      </div>

      {/* Relatório de Pacientes */}
      <div className="bg-[var(--d2b-bg-surface)] rounded-xl border border-[var(--d2b-border)] p-5">
        <p className="text-sm font-semibold text-[var(--d2b-text-primary)]">Relatório de Pacientes</p>
        <p className="text-xs text-[var(--d2b-text-secondary)] mt-0.5 mb-6">Análise detalhada dos pacientes cadastrados no sistema.</p>
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-6 justify-items-center">
          <PieCard title="Gênero"         data={generoPie}   legend={generoPie} />
          <PieCard title="Grupo"          data={grupoPie}    legend={grupoPie} />
          <PieCard title="Paciente"       data={statusPie}   legend={statusPie} />
          <PieCard title="Como conheceu?" data={conheceuPie} legend={conheceuPie} />
        </div>
      </div>

    </div>
  )
}
