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

// --- Types ---
type Tarefa = { id: number; texto: string; descricao: string; feita: boolean }

// --- Mock: Atividades do Dia ---
const ATIVIDADES_MOCK = [
  {
    hora: '09:00',
    paciente: 'Paciente Exemplo',
    profissional: 'JESSE DOS SANTOS BEZERRA',
    duracao: '1 hora',
    status: 'confirmado' as const,
  },
]

// --- Mock: Charts ---
const CHART_FINANCEIRO = [
  { date: '28/03', recebidos: 0, aReceber: 0 },
  { date: '29/03', recebidos: 0, aReceber: 50 },
  { date: '30/03', recebidos: 0, aReceber: 200 },
  { date: '31/03', recebidos: 0, aReceber: 500 },
  { date: '01/04', recebidos: 0, aReceber: 250 },
  { date: '02/04', recebidos: 0, aReceber: 0 },
]

const CHART_SESSOES = [
  { date: '25/03', atendidos: 0, desmarcados: 0, faltantes: 0 },
  { date: '26/03', atendidos: 0, desmarcados: 0, faltantes: 0 },
  { date: '27/03', atendidos: 0, desmarcados: 0, faltantes: 0 },
  { date: '28/03', atendidos: 0, desmarcados: 0, faltantes: 0 },
  { date: '29/03', atendidos: 0, desmarcados: 0, faltantes: 0 },
  { date: '30/03', atendidos: 1, desmarcados: 0, faltantes: 0 },
  { date: '31/03', atendidos: 0, desmarcados: 0, faltantes: 0 },
  { date: '01/04', atendidos: 0, desmarcados: 0, faltantes: 1 },
  { date: '02/04', atendidos: 0, desmarcados: 0, faltantes: 0 },
  { date: '03/04', atendidos: 0, desmarcados: 0, faltantes: 0 },
  { date: '04/04', atendidos: 0, desmarcados: 0, faltantes: 0 },
]

const CHART_AGENDAMENTOS = [
  { date: '25/03/2026', agendamentos: 0 },
  { date: '26/03/2026', agendamentos: 0 },
  { date: '27/03/2026', agendamentos: 0 },
  { date: '28/03/2026', agendamentos: 0 },
  { date: '29/03/2026', agendamentos: 0 },
  { date: '30/03/2026', agendamentos: 1 },
  { date: '31/03/2026', agendamentos: 0 },
  { date: '01/04/2026', agendamentos: 1 },
  { date: '02/04/2026', agendamentos: 0 },
  { date: '03/04/2026', agendamentos: 1 },
  { date: '04/04/2026', agendamentos: 0 },
  { date: '05/04/2026', agendamentos: 0 },
]

const STATUS_COLOR: Record<string, string> = {
  agendado:   '#9CA3AF',
  confirmado: '#7C4DFF',
  atendido:   '#10B981',
  faltou:     '#EF4444',
  bloqueio:   '#6B7280',
}

function fmtBRL(v: number) {
  return v.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })
}

// --- Component: status legend ---
function LegendaStatus() {
  const items = [
    { label: 'Agendado',   color: STATUS_COLOR.agendado },
    { label: 'Confirmado', color: STATUS_COLOR.confirmado },
    { label: 'Atendido',   color: STATUS_COLOR.atendido },
    { label: 'Faltou',     color: STATUS_COLOR.faltou },
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

// --- Component: stat row ---
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

// --- Component: DRE row ---
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

// --- Component: Pie chart card ---
type PieSlice = { name: string; value: number; color?: string }
const PIE_COLORS = ['#7C4DFF','#06B6D4','#EF4444','#F59E0B','#10B981','#8B5CF6','#B45309','#6B7280','#D1D5DB']

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

// --- Main page ---
export default function DashboardHome() {
  const [tarefas, setTarefas] = useState<Tarefa[]>([
    { id: 1, texto: 'teste', descricao: 'Tarefa a realizar', feita: false },
  ])
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

  return (
    <div className="p-6 space-y-5 bg-[#0D0520] min-h-full">

      {/* Row 1: Atividades + Tarefas */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">

        {/* Atividades do Dia */}
        <div className="bg-[#120328] rounded-xl border border-[rgba(124,77,255,0.18)] p-5 flex flex-col gap-3">
          <div className="flex items-start justify-between gap-2 flex-wrap">
            <div>
              <p className="text-sm font-semibold text-[#F5F0FF]">Atividades do Dia</p>
              <p className="text-xs text-[#6B4E8A]">{ATIVIDADES_MOCK.length} Evento</p>
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
            {ATIVIDADES_MOCK.map((a, i) => (
              <div key={i} className="flex items-start gap-3 py-2.5 border-b border-[rgba(124,77,255,0.08)] last:border-0">
                <span className="text-xs text-[#A78BCC] w-10 flex-shrink-0 mt-0.5">{a.hora}</span>
                <span className="text-red-400 flex-shrink-0 mt-0.5">
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="3" y="4" width="18" height="18" rx="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/></svg>
                </span>
                <div className="w-0.5 self-stretch rounded-full flex-shrink-0" style={{ background: STATUS_COLOR[a.status] }} />
                <div>
                  <p className="text-sm font-semibold text-[#F5F0FF]">{a.paciente}</p>
                  <p className="text-xs text-[#A78BCC]">{a.profissional}</p>
                  <p className="text-xs text-[#6B4E8A]">{a.duracao}</p>
                </div>
              </div>
            ))}
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

      {/* Relatorios Gerenciais */}
      <div className="bg-[#120328] rounded-xl border border-[rgba(124,77,255,0.18)] p-5 space-y-5">
        <div className="flex items-start justify-between flex-wrap gap-2">
          <div>
            <p className="text-sm font-semibold text-[#F5F0FF]">Relat&oacute;rios Gerenciais</p>
            <p className="text-xs text-[#A78BCC]">Acompanhe suas m&eacute;tricas de sess&otilde;es e valores financeiros.</p>
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
              <p className="text-xs text-[#7C4DFF] hover:underline cursor-pointer mt-1">Ver relat&oacute;rio completo</p>
            </div>
            <span className="text-sm font-bold px-3 py-1 rounded-lg bg-[rgba(16,185,129,0.18)] text-[#10B981]">{fmtBRL(0)}</span>
          </div>
          <div className="bg-[#150830] rounded-lg p-4 flex items-center justify-between border border-[rgba(124,77,255,0.12)]">
            <div>
              <p className="text-sm font-semibold text-[#F5F0FF]">Valores A Receber</p>
              <p className="text-xs text-[#7C4DFF] hover:underline cursor-pointer mt-1">Ver relat&oacute;rio completo</p>
            </div>
            <span className="text-sm font-bold px-3 py-1 rounded-lg bg-[rgba(239,68,68,0.18)] text-[#EF4444]">{fmtBRL(500)}</span>
          </div>
        </div>

        {/* Area Charts */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          <div>
            <p className="text-[11px] text-[#10B981] mb-2">Recebidos: {fmtBRL(0)}</p>
            <ResponsiveContainer width="100%" height={120}>
              <AreaChart data={CHART_FINANCEIRO}>
                <defs>
                  <linearGradient id="gRec" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#10B981" stopOpacity={0.2} />
                    <stop offset="95%" stopColor="#10B981" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <XAxis dataKey="date" tick={{ fontSize: 10, fill: '#6B4E8A' }} axisLine={false} tickLine={false} />
                <Tooltip contentStyle={{ background: '#0D0520', border: '1px solid rgba(124,77,255,0.3)', borderRadius: 8, fontSize: 12, color: '#F5F0FF' }} />
                <Area type="monotone" dataKey="recebidos" stroke="#10B981" fill="url(#gRec)" strokeWidth={2} />
              </AreaChart>
            </ResponsiveContainer>
          </div>
          <div>
            <p className="text-[11px] text-red-500 mb-2">A receber: {fmtBRL(500)}</p>
            <ResponsiveContainer width="100%" height={120}>
              <AreaChart data={CHART_FINANCEIRO}>
                <defs>
                  <linearGradient id="gArec" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#EF4444" stopOpacity={0.2} />
                    <stop offset="95%" stopColor="#EF4444" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <XAxis dataKey="date" tick={{ fontSize: 10, fill: '#6B4E8A' }} axisLine={false} tickLine={false} />
                <Tooltip contentStyle={{ background: '#0D0520', border: '1px solid rgba(124,77,255,0.3)', borderRadius: 8, fontSize: 12, color: '#F5F0FF' }} />
                <Area type="monotone" dataKey="aReceber" stroke="#EF4444" fill="url(#gArec)" strokeWidth={2} />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Stats + Sessions line chart */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-5 pt-2 border-t border-[rgba(124,77,255,0.10)]">
          <div className="flex flex-col gap-2">
            <StatRow icon={<TrendingUp size={14} />}   label="Evolu&ccedil;&otilde;es Criadas"    value={1} valueColor="#7C4DFF" />
            <StatRow icon={<CheckSquare size={14} />}  label="Sess&otilde;es Atendidas"    value={1} valueColor="#10B981" />
            <StatRow icon={<X size={14} />}            label="Sess&otilde;es Desmarcadas"  value={0} valueColor="#EF4444" />
            <StatRow icon={<Ban size={14} />}          label="Faltas"                     value={1} valueColor="#6B7280" />
          </div>
          <div>
            <ResponsiveContainer width="100%" height={180}>
              <LineChart data={CHART_SESSOES}>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(124,77,255,0.10)" />
                <XAxis dataKey="date" tick={{ fontSize: 9, fill: '#6B4E8A' }} axisLine={false} tickLine={false} />
                <YAxis tick={{ fontSize: 9, fill: '#6B4E8A' }} axisLine={false} tickLine={false} />
                <Tooltip contentStyle={{ background: '#0D0520', border: '1px solid rgba(124,77,255,0.3)', borderRadius: 8, fontSize: 12, color: '#F5F0FF' }} />
                <Legend iconSize={8} wrapperStyle={{ fontSize: 11 }} />
                <Line type="monotone" dataKey="atendidos"   name="Atendidos"   stroke="#10B981" strokeWidth={2} dot={false} />
                <Line type="monotone" dataKey="desmarcados" name="Desmarcados" stroke="#EF4444" strokeWidth={2} dot={false} />
                <Line type="monotone" dataKey="faltantes"   name="Faltantes"   stroke="#9CA3AF" strokeWidth={2} dot={false} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* DRE */}
        <div className="border-t border-[rgba(124,77,255,0.10)] pt-5">
          <p className="text-sm font-semibold text-[#F5F0FF] mb-1">DRE - Demonstra&ccedil;&atilde;o de Resultados</p>
          <p className="text-xs text-[#A78BCC] mb-4">Resumo financeiro do per&iacute;odo selecionado.</p>
          <div className="max-w-sm mx-auto border border-[rgba(124,77,255,0.18)] rounded-xl bg-[#150830] p-4">
            <DRERow label="Receita Bruta"              bold />
            <DRERow label="Recebimentos"               value={fmtBRL(0)}   indent />
            <DRERow label="Mensalidades"               value={fmtBRL(0)}   indent />
            <DRERow label="Custo Direto"               bold />
            <DRERow label="(-) Repasses de Comiss&atilde;o" value={fmtBRL(0)} indent negative />
            <DRERow label="Lucro Bruto"                bold />
            <DRERow label="(=) Lucro Bruto"            value={fmtBRL(0)}   indent />
            <DRERow label="Despesas Operacionais"      bold />
            <DRERow label="Pagamentos"                 value={fmtBRL(0)}   indent negative />
            <DRERow label="Resultado Operacionais"     bold />
            <DRERow label="(=) Resultados"             value={fmtBRL(0)}   indent />
          </div>
        </div>
      </div>

      {/* Agendamentos por convenio */}
      <div className="bg-[#120328] rounded-xl border border-[rgba(124,77,255,0.18)] p-5">
        <p className="text-sm font-semibold text-[#F5F0FF]">Agendamentos por conv&ecirc;nio ao longo do tempo</p>
        <p className="text-xs text-[#A78BCC] mt-0.5 mb-4">Distribui&ccedil;&atilde;o de agendamentos por plano de sa&uacute;de (conv&ecirc;nio ou particular) no per&iacute;odo selecionado, considerando os filtros aplicados.</p>
        <ResponsiveContainer width="100%" height={200}>
          <BarChart data={CHART_AGENDAMENTOS}>
            <CartesianGrid strokeDasharray="3 3" stroke="rgba(124,77,255,0.10)" />
            <XAxis dataKey="date" tick={{ fontSize: 9, fill: '#6B4E8A' }} axisLine={false} tickLine={false} />
            <YAxis tick={{ fontSize: 10, fill: '#6B4E8A' }} axisLine={false} tickLine={false} label={{ value: 'Agendamentos', angle: -90, position: 'insideLeft', style: { fontSize: 10, fill: '#6B4E8A' } }} />
            <Tooltip contentStyle={{ background: '#0D0520', border: '1px solid rgba(124,77,255,0.3)', borderRadius: 8, fontSize: 12, color: '#F5F0FF' }} />
            <Bar dataKey="agendamentos" fill="#7CFC00" radius={[3, 3, 0, 0]} />
          </BarChart>
        </ResponsiveContainer>
      </div>

      {/* Relatorio de Pacientes */}
      <div className="bg-[#120328] rounded-xl border border-[rgba(124,77,255,0.18)] p-5">
        <p className="text-sm font-semibold text-[#F5F0FF]">Relat&oacute;rio de Pacientes</p>
        <p className="text-xs text-[#A78BCC] mt-0.5 mb-6">An&aacute;lise detalhada dos pacientes cadastrados no sistema.</p>
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-6 justify-items-center">
          <PieCard
            title="G&ecirc;nero"
            data={[{ name: 'N&atilde;o registrado', value: 100, color: '#7C4DFF' }]}
            legend={[{ name: 'N&atilde;o registrado', color: '#7C4DFF' }]}
          />
          <PieCard
            title="Grupo"
            data={[
              { name: 'Infantil',    value: 0, color: '#7C4DFF' },
              { name: 'Adolescente', value: 0, color: '#06B6D4' },
              { name: 'Adulto',      value: 0, color: '#EF4444' },
              { name: 'Idoso',       value: 0, color: '#F59E0B' },
            ]}
            legend={[
              { name: 'Infantil',    color: '#7C4DFF' },
              { name: 'Adolescente', color: '#06B6D4' },
              { name: 'Adulto',      color: '#EF4444' },
              { name: 'Idoso',       color: '#F59E0B' },
            ]}
          />
          <PieCard
            title="Paciente"
            data={[
              { name: 'Ativo',     value: 100, color: '#7C4DFF' },
              { name: 'Arquivado', value: 0,   color: '#9CA3AF' },
            ]}
            legend={[
              { name: 'Ativo',     color: '#7C4DFF' },
              { name: 'Arquivado', color: '#9CA3AF' },
            ]}
          />
          <PieCard
            title="Como conheceu?"
            data={[
              { name: 'Whatsapp',     value: 0,   color: '#7C4DFF' },
              { name: 'Google',       value: 0,   color: '#06B6D4' },
              { name: 'Indica&ccedil;&atilde;o', value: 0, color: '#EF4444' },
              { name: 'Email',        value: 0,   color: '#F59E0B' },
              { name: 'Rede Social',  value: 0,   color: '#10B981' },
              { name: 'Evento',       value: 0,   color: '#8B5CF6' },
              { name: 'Conv&ecirc;nio',      value: 100, color: '#B45309' },
              { name: 'Outro',        value: 0,   color: '#6B7280' },
              { name: 'N&atilde;o informado', value: 0, color: '#D1D5DB' },
            ]}
            legend={[
              { name: 'Whatsapp',     color: '#7C4DFF' },
              { name: 'Google',       color: '#06B6D4' },
              { name: 'Indica&ccedil;&atilde;o', color: '#EF4444' },
              { name: 'Email',        color: '#F59E0B' },
              { name: 'Rede Social',  color: '#10B981' },
              { name: 'Evento',       color: '#8B5CF6' },
              { name: 'Conv&ecirc;nio',      color: '#B45309' },
              { name: 'Outro',        color: '#6B7280' },
              { name: 'N&atilde;o informado', color: '#D1D5DB' },
            ]}
          />
        </div>
      </div>

    </div>
  )
}