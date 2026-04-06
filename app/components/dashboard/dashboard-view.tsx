'use client'

import { useState, useRef, useEffect, type ReactNode } from 'react'
import {
  Plus, MoreHorizontal, Printer, ChevronDown, Filter,
  CheckCircle2, TrendingUp, CheckSquare, X, Ban,
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
        <span key={i.label} className="flex items-center gap-1 text-[11px] text-[#A78BCC]">
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
    <div className="flex items-center gap-3 px-4 py-3 bg-[#150830] rounded-lg border border-[rgba(124,77,255,0.12)]">
      <div className="w-8 h-8 rounded-md bg-[rgba(124,77,255,0.15)] flex items-center justify-center text-[#C084FC] flex-shrink-0">
        {icon}
      </div>
      <span className="flex-1 text-sm text-[#A78BCC]">{label}</span>
      <span className="text-sm font-bold" style={{ color: valueColor }}>{value}</span>
    </div>
  )
}

function DRERow({ label, value, indent, bold, negative }: {
  label: string; value?: string; indent?: boolean; bold?: boolean; negative?: boolean
}) {
  return (
    <div className={`flex justify-between items-center py-2 border-b border-[rgba(124,77,255,0.08)] last:border-0 ${indent ? 'pl-4' : ''}`}>
      <span className={`text-sm ${bold ? 'font-semibold text-[#F5F0FF]' : 'text-[#A78BCC]'}`}>{label}</span>
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
      <p className="text-xs font-medium text-[#A78BCC] text-center">{title}</p>
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
          <span key={d.name} className="flex items-center gap-1 text-[10px] text-[#6B4E8A]">
            <span className="w-2 h-2 rounded-full inline-block flex-shrink-0" style={{ background: d.color ?? PIE_COLORS[i % PIE_COLORS.length] }} />
            {d.name}
          </span>
        ))}
      </div>
    </div>
  )
}

// ─── Main component ────────────────────────────────────────────
export function DashboardView({ data }: { data: DashboardData }) {
  const [tarefas, setTarefas] = useState<Tarefa[]>([])
  const [mostraInput, setMostraInput] = useState(false)
  const [novaTarefa, setNovaTarefa] = useState('')
  const inputRef = useRef<HTMLInputElement>(null)

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
    <div className="p-6 space-y-5 bg-[#0D0520] min-h-full">

      {/* Row 1: Atividades + Tarefas */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">

        {/* Atividades do Dia */}
        <div className="bg-[#120328] rounded-xl border border-[rgba(124,77,255,0.18)] p-5 flex flex-col gap-3">
          <div className="flex items-start justify-between gap-2 flex-wrap">
            <div>
              <p className="text-sm font-semibold text-[#F5F0FF]">Atividades do Dia</p>
              <p className="text-xs text-[#6B4E8A]">
                {data.agendamentosHoje.length} {data.agendamentosHoje.length === 1 ? 'Evento' : 'Eventos'}
              </p>
            </div>
            <div className="flex items-center gap-2">
              <button className="flex items-center gap-1.5 text-xs text-[#A78BCC] bg-[#150830] border border-[rgba(124,77,255,0.18)] rounded-md px-3 py-1.5 hover:border-[#7C4DFF] transition-colors">
                Todos profissionais <ChevronDown size={12} />
              </button>
              <button className="p-1.5 rounded-md bg-[#7C4DFF] text-white hover:bg-[#5B21B6] transition-colors">
                <Printer size={14} />
              </button>
            </div>
          </div>
          <LegendaStatus />
          <div className="flex flex-col gap-0 mt-1">
            {data.agendamentosHoje.length === 0 ? (
              <p className="text-xs text-[#6B4E8A] py-4 text-center">Nenhum agendamento para hoje</p>
            ) : (
              data.agendamentosHoje.map((a) => (
                <div key={a.id} className="flex items-start gap-3 py-2.5 border-b border-[rgba(124,77,255,0.08)] last:border-0">
                  <span className="text-xs text-[#A78BCC] w-10 flex-shrink-0 mt-0.5">{horaStr(a.inicio)}</span>
                  <span className="text-red-400 flex-shrink-0 mt-0.5">
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="3" y="4" width="18" height="18" rx="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/></svg>
                  </span>
                  <div
                    className="w-0.5 self-stretch rounded-full flex-shrink-0"
                    style={{ background: STATUS_COLOR[a.status?.toLowerCase() ?? ''] ?? '#9CA3AF' }}
                  />
                  <div>
                    <p className="text-sm font-semibold text-[#F5F0FF]">{a.pacienteNome ?? '—'}</p>
                    <p className="text-xs text-[#A78BCC]">{a.usuarioNome ?? '—'}</p>
                    <p className="text-xs text-[#6B4E8A]">{duracao(a.inicio, a.fim)}</p>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Lista de Tarefas */}
        <div className="bg-[#120328] rounded-xl border border-[rgba(124,77,255,0.18)] p-5 flex flex-col gap-3">
          <div className="flex items-center justify-between">
            <p className="text-sm font-semibold text-[#F5F0FF]">Lista de tarefas</p>
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
              <p className="text-xs text-[#6B4E8A] py-4 text-center">Nenhuma tarefa cadastrada</p>
            )}
            {tarefas.map((t) => (
              <div
                key={t.id}
                className="flex items-center gap-3 group rounded-lg px-3 py-2.5 hover:bg-[#150830] border border-[rgba(124,77,255,0.12)] transition-colors"
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
                  <p className={`text-sm font-medium truncate ${t.feita ? 'line-through text-[#6B4E8A]' : 'text-[#F5F0FF]'}`}>{t.texto}</p>
                  <p className="text-xs text-[#6B4E8A]">{t.descricao}</p>
                </div>
                <button
                  onClick={() => removerTarefa(t.id)}
                  className="opacity-0 group-hover:opacity-100 p-1 rounded text-[#6B4E8A] hover:text-red-500 transition-all"
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
                className="flex-1 bg-[#150830] border border-[rgba(124,77,255,0.25)] rounded-md px-3 py-2 text-sm text-[#F5F0FF] placeholder:text-[#6B4E8A] focus:outline-none focus:border-[#7C4DFF] transition-colors"
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
      <div className="bg-[#120328] rounded-xl border border-[rgba(124,77,255,0.18)] p-5 space-y-5">
        <div className="flex items-start justify-between flex-wrap gap-2">
          <div>
            <p className="text-sm font-semibold text-[#F5F0FF]">Relatórios Gerenciais</p>
            <p className="text-xs text-[#A78BCC]">Métricas dos últimos 30 dias.</p>
          </div>
          <button className="flex items-center gap-1.5 text-xs text-[#A78BCC] bg-[#150830] border border-[rgba(124,77,255,0.18)] rounded-md px-3 py-1.5 hover:border-[#7C4DFF] transition-colors">
            <Filter size={12} />
            Filtrar dados
          </button>
        </div>

        {/* KPI cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="bg-[#150830] rounded-lg p-4 flex items-center justify-between border border-[rgba(124,77,255,0.12)]">
            <div>
              <p className="text-sm font-semibold text-[#F5F0FF]">Valores Recebidos</p>
              <p className="text-xs text-[#7C4DFF] hover:underline cursor-pointer mt-1">Ver relatório completo</p>
            </div>
            <span className="text-sm font-bold px-3 py-1 rounded-lg bg-[rgba(16,185,129,0.18)] text-[#10B981]">
              {fmtBRL(data.totalRecebido)}
            </span>
          </div>
          <div className="bg-[#150830] rounded-lg p-4 flex items-center justify-between border border-[rgba(124,77,255,0.12)]">
            <div>
              <p className="text-sm font-semibold text-[#F5F0FF]">Valores A Receber</p>
              <p className="text-xs text-[#7C4DFF] hover:underline cursor-pointer mt-1">Ver relatório completo</p>
            </div>
            <span className="text-sm font-bold px-3 py-1 rounded-lg bg-[rgba(239,68,68,0.18)] text-[#EF4444]">
              {fmtBRL(data.totalAReceber)}
            </span>
          </div>
        </div>

        {/* Area Charts */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          <div>
            <p className="text-[11px] text-[#10B981] mb-2">Recebidos: {fmtBRL(data.totalRecebido)}</p>
            <ResponsiveContainer width="100%" height={120}>
              <AreaChart data={data.chartFinanceiro}>
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
            <p className="text-[11px] text-red-500 mb-2">A receber: {fmtBRL(data.totalAReceber)}</p>
            <ResponsiveContainer width="100%" height={120}>
              <AreaChart data={data.chartFinanceiro}>
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
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-5 pt-2 border-t border-[rgba(124,77,255,0.10)]">
          <div className="flex flex-col gap-2">
            <StatRow icon={<TrendingUp size={14} />}  label="Evoluções Criadas"    value={Number(data.evolucoesCriadas)}    valueColor="#7C4DFF" />
            <StatRow icon={<CheckSquare size={14} />} label="Sessões Atendidas"    value={Number(data.sessoesAtendidas)}    valueColor="#10B981" />
            <StatRow icon={<X size={14} />}           label="Sessões Desmarcadas"  value={Number(data.sessoesDesmarcadas)}  valueColor="#EF4444" />
            <StatRow icon={<Ban size={14} />}         label="Faltas"               value={Number(data.faltas)}              valueColor="#6B7280" />
          </div>
          <div>
            <ResponsiveContainer width="100%" height={180}>
              <LineChart data={data.chartSessoes}>
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
        <div className="border-t border-[rgba(124,77,255,0.10)] pt-5">
          <p className="text-sm font-semibold text-[#F5F0FF] mb-1">DRE - Demonstração de Resultados</p>
          <p className="text-xs text-[#A78BCC] mb-4">Resumo financeiro dos últimos 30 dias.</p>
          <div className="max-w-sm mx-auto border border-[rgba(124,77,255,0.18)] rounded-xl bg-[#150830] p-4">
            <DRERow label="Receita Bruta"         bold />
            <DRERow label="Recebimentos"          value={fmtBRL(data.totalRecebido)} indent />
            <DRERow label="A Receber (pendente)"  value={fmtBRL(data.totalAReceber)} indent negative />
            <DRERow label="Resultado"             bold />
            <DRERow label="(=) Saldo"             value={fmtBRL(data.totalRecebido - data.totalAReceber)} indent negative={data.totalRecebido - data.totalAReceber < 0} />
          </div>
        </div>
      </div>

      {/* Agendamentos por dia */}
      <div className="bg-[#120328] rounded-xl border border-[rgba(124,77,255,0.18)] p-5">
        <p className="text-sm font-semibold text-[#F5F0FF]">Agendamentos ao longo do tempo</p>
        <p className="text-xs text-[#A78BCC] mt-0.5 mb-4">Total de agendamentos por dia nos últimos 30 dias.</p>
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
      <div className="bg-[#120328] rounded-xl border border-[rgba(124,77,255,0.18)] p-5">
        <p className="text-sm font-semibold text-[#F5F0FF]">Relatório de Pacientes</p>
        <p className="text-xs text-[#A78BCC] mt-0.5 mb-6">Análise detalhada dos pacientes cadastrados no sistema.</p>
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
