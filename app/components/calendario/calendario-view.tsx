'use client'

import { useState, useEffect, useCallback, useMemo, useRef } from 'react'
import { createPortal } from 'react-dom'
import { useRouter } from 'next/navigation'
import {
  ChevronDown, ChevronLeft, ChevronRight, Plus,
  Filter, Palette, Settings, Lock, Search, X, RefreshCw, CalendarIcon, Trash2, MessageCircle, Pencil, Check, Video, Copy,
} from 'lucide-react'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { SistemaMensagensModal } from '@/components/mensagens/sistema-mensagens-modal'
import { Calendar } from '@/components/ui/calendar'
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover'

// ─── AgendaConfig ────────────────────────────────────────────────────────────
export interface AgendaConfig {
  segAberto?: boolean
  terAberto?: boolean
  quaAberto?: boolean
  quiAberto?: boolean
  sexAberto?: boolean
  sabAberto?: boolean
  domAberto?: boolean
  segAbertura?: string; segFechamento?: string
  terAbertura?: string; terFechamento?: string
  quaAbertura?: string; quaFechamento?: string
  quiAbertura?: string; quiFechamento?: string
  sexAbertura?: string; sexFechamento?: string
  sabAbertura?: string; sabFechamento?: string
  domAbertura?: string; domFechamento?: string
  exibirProjecao?: boolean
}

// ─── Constants ────────────────────────────────────────────────────────────────
const CELL_H = 64 // px per hour
const DEFAULT_GRID_START = 6
const DEFAULT_GRID_END   = 22

const ESPECIALIDADES = ['Dentista', 'Médico', 'Psicólogo', 'Fisioterapeuta']
const TURNOS = ['Manhã', 'Tarde', 'Noite', 'Integral']
const SALAS = ['Sala 1', 'Sala 2', 'Sala 3']
const STATUS_OPCOES = ['Aguardando', 'Confirmado', 'Atendido', 'Faltou', 'Cancelado']
const FILTROS_CORES = [
  'Alto Risco de Falta', 'Convênio', 'Etiqueta', 'Inadimplentes',
  'Primeiro Atendimento', 'Sala', 'Último Evento da Recorrência',
  'Aniversário', 'Profissional',
]
const MOCK_SLOTS = [
  '06:40 - 07:20', '07:20 - 08:00', '08:00 - 08:40', '08:40 - 09:20',
  '09:20 - 10:00', '10:00 - 10:40', '10:40 - 11:20', '11:20 - 12:00',
]

// ─── Types ────────────────────────────────────────────────────────────────────
type ViewMode = 'Semana' | 'Dia' | 'Mês'

export type Profissional = { id: string; nome: string }

export type ApiAgendamento = {
  id: string
  empresaId: string
  tipo: string
  titulo: string | null
  pacienteId: string | null
  pacienteNome: string | null
  usuarioId: string | null
  usuarioNome: string | null
  inicio: string
  fim: string
  status: string
  sala: string | null
  recorrente: boolean
  observacoes: string | null
  cor: string | null
  servicos: { id: string; servicoId: string | null; servicoNome: string; quantidade: number; valorUnitario: number }[]
  valorTotal: number | null
  valorRecebido: number | null
  dataPagamento: string | null
  metodoPagamento: string | null
  wherebyMeetingId?: string | null
  wherebyHostUrl?: string | null
  wherebyViewerUrl?: string | null
  atendimentoRemoto?: boolean | null
  pacientePlano?: string | null
  pacienteSessoes?: number | null
  pacienteDataNascimento?: string | null
}

type Appointment = {
  id: string
  tipo: string
  titulo: string | null
  pacienteNome: string
  usuarioNome: string
  inicio: string  // "HH:mm"
  fim: string     // "HH:mm"
  date: Date
  cor: 'green' | 'red' | 'teal' | 'purple'
  status: string
  raw: ApiAgendamento
}

type PacienteInfo = {
  id: string
  nome: string
  telefone: string | null
  plano: string | null
  numeroCarteirinha: string | null
}

interface Marcador {
  id: string
  tipo: string
  cor: string
  empresaId: string
}

type ServiceLine = {
  tempId: string
  servicoId: string
  servicoNome: string
  quantidade: number
  valorUnitario: number
  isEditing: boolean
}

type ApiServico = { id: string; nome: string; valor: number | null }

const METODOS_PAGAMENTO = ['PIX', 'Dinheiro', 'Cartão de Crédito', 'Cartão de Débito', 'Transferência', 'Boleto']

// ─── Helpers ──────────────────────────────────────────────────────────────────
function timeToMin(t: string) {
  const [h, m] = t.split(':').map(Number)
  return h * 60 + m
}

function isSameDay(a: Date, b: Date) {
  return (
    a.getFullYear() === b.getFullYear() &&
    a.getMonth() === b.getMonth() &&
    a.getDate() === b.getDate()
  )
}

// dayOfWeek: 0=Dom,1=Seg,...,6=Sáb
function getWeekDays(base: Date, agendaConfig?: AgendaConfig | null): Date[] {
  const d = base.getDay()
  const monday = new Date(base)
  monday.setDate(base.getDate() + (d === 0 ? -6 : 1 - d))
  // All 7 days starting from monday
  const all7 = Array.from({ length: 7 }, (_, i) => {
    const x = new Date(monday)
    x.setDate(monday.getDate() + i)
    return x
  })
  if (!agendaConfig) {
    // fallback: Mon–Fri only
    return all7.slice(0, 5)
  }
  const openFlags: Record<number, boolean> = {
    1: agendaConfig.segAberto !== false,
    2: agendaConfig.terAberto !== false,
    3: agendaConfig.quaAberto !== false,
    4: agendaConfig.quiAberto !== false,
    5: agendaConfig.sexAberto !== false,
    6: agendaConfig.sabAberto === true,
    0: agendaConfig.domAberto === true,
  }
  // Keep days that are open; always keep at least 1 day
  const filtered = all7.filter((day) => openFlags[day.getDay()])
  return filtered.length > 0 ? filtered : all7.slice(0, 5)
}

function formatDayLabel(d: Date) {
  const shorts = ['Dom', 'Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb']
  const pad = (n: number) => String(n).padStart(2, '0')
  return `${shorts[d.getDay()]}. ${pad(d.getDate())}/${pad(d.getMonth() + 1)}`
}

function nowDefault() {
  const d = new Date()
  const pad = (n: number) => String(n).padStart(2, '0')
  const Y = d.getFullYear(), M = pad(d.getMonth() + 1), DD = pad(d.getDate())
  const H = pad(d.getHours()), mm = pad(d.getMinutes())
  const H1 = pad(Math.min(d.getHours() + 1, 23))
  return {
    inicio: `${Y}-${M}-${DD}T${H}:${mm}`,
    fim: `${Y}-${M}-${DD}T${H1}:${mm}`,
  }
}

function toDatetimeLocal(date: Date, hour: number, minute = 0) {
  const pad = (n: number) => String(n).padStart(2, '0')
  const Y = date.getFullYear()
  const M = pad(date.getMonth() + 1)
  const D = pad(date.getDate())
  const H = pad(hour)
  const mm = pad(minute)
  const H1 = pad(Math.min(hour + 1, 23))
  return {
    inicio: `${Y}-${M}-${D}T${H}:${mm}`,
    fim:    `${Y}-${M}-${D}T${H1}:${mm}`,
  }
}

function timeFromISO(iso: string): string {
  const d = new Date(iso)
  return `${String(d.getHours()).padStart(2, '0')}:${String(d.getMinutes()).padStart(2, '0')}`
}

function isoToDatetimeLocal(iso: string): string {
  const d = new Date(iso)
  const pad = (n: number) => String(n).padStart(2, '0')
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}`
}

function datetimeLocalToISO(dt: string): string {
  if (!dt) return ''
  // Keep local time as-is (backend uses LocalDateTime — no timezone conversion)
  return dt.length === 16 ? `${dt}:00` : dt
}

// ─── Shared styles ────────────────────────────────────────────────────────────
const INP =
  'w-full bg-[var(--d2b-bg-elevated)] border border-[var(--d2b-border-strong)] rounded-md ' +
  'px-3 py-2.5 text-sm text-[var(--d2b-text-primary)] placeholder:text-[var(--d2b-text-muted)] ' +
  'focus:outline-none focus:border-[#7C4DFF] transition-colors'

// ─── FloatingField ────────────────────────────────────────────────────────────
function FloatingField({
  label, required, children,
}: {
  label: string; required?: boolean; children: React.ReactNode
}) {
  return (
    <div className="relative">
      <label className="absolute -top-2 left-3 z-10 bg-[var(--d2b-bg-elevated)] px-1 text-[10px] font-medium text-[var(--d2b-text-secondary)] leading-none">
        {label}{required && <span className="text-[#7C4DFF] ml-0.5">*</span>}
      </label>
      {children}
    </div>
  )
}

// ─── FloatingSelect ───────────────────────────────────────────────────────────
function FloatingSelect({
  label, required, options, placeholder, value, onChange, onClear, disabled,
}: {
  label: string; required?: boolean; options: string[]; placeholder?: string
  value?: string; onChange?: (v: string) => void; onClear?: () => void; disabled?: boolean
}) {
  return (
    <FloatingField label={label} required={required}>
      <div className="relative">
        <select
          value={value ?? ''}
          onChange={(e) => onChange?.(e.target.value)}
          disabled={disabled}
          className={INP + ' appearance-none pr-8 ' + (disabled ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer')}
        >
          <option value="" disabled>{placeholder ?? 'Selecione'}</option>
          {options.map((o) => <option key={o} value={o}>{o}</option>)}
        </select>
        {value && onClear && !disabled && (
          <button type="button" onClick={onClear} className="absolute right-7 top-1/2 -translate-y-1/2 text-[var(--d2b-text-muted)] hover:text-[var(--d2b-text-primary)] transition-colors z-10">
            <X size={12} />
          </button>
        )}
        <ChevronDown size={13} className="absolute right-3 top-1/2 -translate-y-1/2 text-[var(--d2b-text-secondary)] pointer-events-none" />
      </div>
    </FloatingField>
  )
}

// ─── ReadonlyField ───────────────────────────────────────────────────────────────
function ReadonlyField({ label, value }: { label: string; value: string }) {
  return (
    <div className="relative">
      <label className="absolute -top-2 left-3 z-10 bg-[var(--d2b-bg-elevated)] px-1 text-[10px] font-medium text-[var(--d2b-text-secondary)] leading-none">
        {label}
      </label>
      <div className={INP + ' opacity-80 select-text'}>{value}</div>
    </div>
  )
}

// ─── Toggle ───────────────────────────────────────────────────────────────────
function Toggle({ on, set }: { on: boolean; set: (v: boolean) => void }) {
  return (
    <button
      type="button"
      onClick={(e) => { e.stopPropagation(); set(!on) }}
      style={{
        position: 'relative',
        width: 40,
        height: 22,
        borderRadius: 999,
        flexShrink: 0,
        transition: 'background-color 0.2s',
        backgroundColor: on ? '#7C4DFF' : '#C8BFE0',
        cursor: 'pointer',
        border: 'none',
        padding: 0,
        outline: 'none',
      }}
    >
      <span
        style={{
          position: 'absolute',
          top: 3,
          left: on ? 21 : 3,
          width: 16,
          height: 16,
          borderRadius: '50%',
          backgroundColor: 'white',
          boxShadow: '0 1px 3px rgba(0,0,0,0.3)',
          transition: 'left 0.15s ease',
        }}
      />
    </button>
  )
}

// ─── BuscaAvancadaModal ───────────────────────────────────────────────────────
function BuscaAvancadaModal({
  open, onClose, profissionais,
}: {
  open: boolean; onClose: () => void; profissionais: Profissional[]
}) {
  const [esp, setEsp] = useState('')
  const [prof, setProf] = useState('')
  const [turno, setTurno] = useState('')
  const today = new Date().toISOString().split('T')[0]

  return (
    <Dialog open={open} onOpenChange={(v: boolean) => { if (!v) onClose() }}>
      <DialogContent
        showCloseButton={false}
        className="bg-[var(--d2b-bg-elevated)] border border-[var(--d2b-border-strong)] text-[var(--d2b-text-primary)] !max-w-2xl p-0 gap-0 overflow-hidden"
      >
        <DialogHeader className="flex-row items-center justify-between px-6 py-4 border-b border-[var(--d2b-border)] space-y-0">
          <DialogTitle className="text-base font-bold text-[var(--d2b-text-primary)]">Busca Avançada</DialogTitle>
          <button onClick={onClose} className="w-7 h-7 rounded-md flex items-center justify-center text-[var(--d2b-text-secondary)] hover:text-[var(--d2b-text-primary)] hover:bg-[var(--d2b-hover)] transition-colors text-lg leading-none">✕</button>
        </DialogHeader>

        <div className="px-6 py-5 space-y-4 overflow-y-auto max-h-[75vh]">
          <div className="grid grid-cols-2 gap-4">
            <FloatingSelect label="Especialidade" options={ESPECIALIDADES} placeholder="Selecione uma especialidade" value={esp} onChange={setEsp} />
            <FloatingSelect label="Profissional" options={profissionais.map(p => p.nome)} placeholder="Selecione um profissional" value={prof} onChange={setProf} />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <FloatingField label="Data">
              <input type="date" defaultValue={today} className={INP} />
            </FloatingField>
            <FloatingSelect label="Turno" options={TURNOS} placeholder="Selecione o turno" value={turno} onChange={setTurno} />
          </div>
          <div className="flex justify-end">
            <button className="flex items-center gap-2 px-5 py-2 rounded-md text-sm font-bold text-white bg-[#7C4DFF] hover:bg-[#5B21B6] transition-colors">
              <RefreshCw size={14} />
              Buscar Profissionais Disponíveis
            </button>
          </div>

          {/* Mini calendar */}
          <div>
            <div className="flex items-center justify-between mb-3">
              <button className="w-8 h-8 flex items-center justify-center rounded-lg text-[var(--d2b-text-secondary)] hover:text-[var(--d2b-text-primary)] hover:bg-[var(--d2b-hover)] transition-colors border border-[var(--d2b-border-strong)]">
                <ChevronLeft size={14} />
              </button>
              <span className="text-sm font-semibold text-[var(--d2b-text-primary)]">Hoje</span>
              <button className="w-8 h-8 flex items-center justify-center rounded-lg text-[var(--d2b-text-secondary)] hover:text-[var(--d2b-text-primary)] hover:bg-[var(--d2b-hover)] transition-colors border border-[var(--d2b-border-strong)]">
                <ChevronRight size={14} />
              </button>
            </div>
            <div className="rounded-xl overflow-hidden border border-[var(--d2b-border)]">
              <div className="bg-[#7C4DFF] text-white text-sm font-bold text-center py-2.5">
                Quarta-Feira 01/04
              </div>
              <div className="divide-y divide-[var(--d2b-border)] max-h-56 overflow-y-auto">
                {MOCK_SLOTS.map((slot) => (
                  <div key={slot} className="flex items-center justify-between px-4 py-2.5 hover:bg-[var(--d2b-hover)] cursor-pointer transition-colors group">
                    <div className="flex items-center gap-2.5">
                      <div className="w-2 h-2 rounded-full bg-[#22C55E] shrink-0" />
                      <span className="text-sm text-[var(--d2b-text-primary)]">{slot}</span>
                    </div>
                    <span className="text-xs text-[var(--d2b-text-muted)] group-hover:text-[var(--d2b-text-secondary)] transition-colors">1</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}

// ─── NovoAgendamentoModal ─────────────────────────────────────────────────────
export function NovoAgendamentoModal({
  open, onClose, defaultInicio, defaultFim,
  empresaId, profissionaisApi, agendamento, onSaved,
}: {
  open: boolean
  onClose: () => void
  defaultInicio?: string
  defaultFim?: string
  empresaId: string | null
  profissionaisApi: Profissional[]
  agendamento?: ApiAgendamento
  onSaved: () => void
}) {
  const [createdAgendamento, setCreatedAgendamento] = useState<ApiAgendamento | undefined>(undefined)
  const effectiveAgendamento = createdAgendamento ?? agendamento
  const isEditing = !!effectiveAgendamento
  const defaults  = nowDefault()

  // ── Patient ─────────────────────────────────────────────────────────────────
  const [pacienteId,        setPacienteId]       = useState('')
  const [pacienteQuery,     setPacienteQuery]     = useState('')
  const [pacienteSugestoes, setPacienteSugestoes] = useState<{ id: string; nome: string }[]>([])
  const [loadingPaciente,   setLoadingPaciente]   = useState(false)
  const [showSugestoes,     setShowSugestoes]     = useState(false)
  const [pacienteInfo,      setPacienteInfo]      = useState<PacienteInfo | null>(null)

  // ── Event ────────────────────────────────────────────────────────────────────
  const [profissionalNome, setProfissionalNome] = useState('')
  const [inicio,     setInicio]     = useState(defaults.inicio)
  const [fim,        setFim]        = useState(defaults.fim)
  const [sala,       setSala]       = useState('')
  const [recorrente,    setRecorrente]    = useState(false)
  const [recorrenteAte, setRecorrenteAte] = useState('')
  const [recorrenciaTipo, setRecorrenciaTipo] = useState<'DIARIO' | 'SEMANAL' | 'MENSAL'>('SEMANAL')
  const [atendimentoRemoto, setAtendimentoRemoto] = useState(false)
  const [status,     setStatus]     = useState('Aguardando')
  const [salas,      setSalas]      = useState<{ id: string; nome: string }[]>([])

  // ── Services ─────────────────────────────────────────────────────────────────
  const [servicoLines, setServicoLines] = useState<ServiceLine[]>([])
  const [servicosApi,  setServicosApi]  = useState<ApiServico[]>([])

  // ── Financial ─────────────────────────────────────────────────────────────────
  const [valorRecebido,        setValorRecebido]        = useState('0')
  const [valorRecebidoFocused, setValorRecebidoFocused] = useState(false)
  const [valorManual,          setValorManual]          = useState('0')
  const [valorManualFocused,   setValorManualFocused]   = useState(false)
  const [dataPagamento,        setDataPagamento]        = useState('')
  const [metodoPagamento, setMetodoPagamento] = useState('')
  const [observacoes,     setObservacoes]     = useState('')

  const [saving,        setSaving]        = useState(false)
  const [error,         setError]         = useState('')
  const [buscaAvancada, setBuscaAvancada] = useState(false)
  const [atalhoOpen,    setAtalhoOpen]    = useState(false)
  const [mensagensOpen, setMensagensOpen] = useState(false)

  const router = useRouter()

  const searchTimeout = useRef<ReturnType<typeof setTimeout> | null>(null)

  const confirmedLines      = servicoLines.filter((l) => !l.isEditing)
  const hasConfirmedServices = confirmedLines.length > 0
  const valorTotal           = hasConfirmedServices
    ? confirmedLines.reduce((acc, l) => acc + l.quantidade * l.valorUnitario, 0)
    : (parseFloat(valorManual.replace(',', '.')) || 0)
  const formatCurrency = (v: number) =>
    v.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })

  // ── Reset on open ──────────────────────────────────────────────────────────
  useEffect(() => {
    if (!open) { setCreatedAgendamento(undefined); return }
    if (isEditing && effectiveAgendamento) {
      setPacienteId(effectiveAgendamento.pacienteId ?? '')
      setPacienteQuery(effectiveAgendamento.pacienteNome ?? '')
      setProfissionalNome(effectiveAgendamento.usuarioNome ?? profissionaisApi[0]?.nome ?? '')
      setInicio(isoToDatetimeLocal(effectiveAgendamento.inicio))
      setFim(isoToDatetimeLocal(effectiveAgendamento.fim))
      setSala(effectiveAgendamento.sala ?? '')
      setRecorrente(effectiveAgendamento.recorrente ?? false)
      setAtendimentoRemoto(effectiveAgendamento.atendimentoRemoto ?? false)
      setObservacoes(effectiveAgendamento.observacoes ?? '')
      setStatus(effectiveAgendamento.status ?? 'Aguardando')
      setServicoLines(
        (effectiveAgendamento.servicos ?? []).map((s) => ({
          tempId: s.id, servicoId: s.servicoId ?? '',
          servicoNome: s.servicoNome, quantidade: s.quantidade, valorUnitario: s.valorUnitario,
          isEditing: false,
        }))
      )
      setValorRecebido(String(effectiveAgendamento.valorRecebido ?? 0))
      setValorManual(String(effectiveAgendamento.valorTotal ?? 0))
      setDataPagamento(effectiveAgendamento.dataPagamento ?? '')
      setMetodoPagamento(effectiveAgendamento.metodoPagamento ?? '')
    } else {
      setPacienteId(''); setPacienteQuery(''); setPacienteInfo(null)
      setProfissionalNome(profissionaisApi[0]?.nome ?? '')
      setInicio(defaultInicio ?? defaults.inicio)
      setFim(defaultFim ?? defaults.fim)
      setSala(''); setRecorrente(false); setAtendimentoRemoto(false); setObservacoes(''); setStatus('Aguardando')
      setServicoLines([]); setValorRecebido('0'); setValorManual('0'); setDataPagamento(''); setMetodoPagamento('')
    }
    setPacienteSugestoes([]); setShowSugestoes(false); setError('')
    if (empresaId) {
      fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/v1/salas/empresa/${empresaId}/ativas`)
        .then((r) => r.ok ? r.json() : []).then(setSalas).catch(() => setSalas([]))
      fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/v1/servicos/empresa/${empresaId}/ativos`)
        .then((r) => r.ok ? r.json() : []).then(setServicosApi).catch(() => setServicosApi([]))
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open, agendamento])

  // ── Fetch patient details when selected ───────────────────────────────────
  useEffect(() => {
    if (!pacienteId) { setPacienteInfo(null); return }
    fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/v1/pacientes/${pacienteId}`)
      .then((r) => r.ok ? r.json() : null)
      .then((d) => d && setPacienteInfo({ id: d.id, nome: d.nome, telefone: d.telefone, plano: d.plano, numeroCarteirinha: d.numeroCarteirinha }))
      .catch(() => {})
  }, [pacienteId])

  // ── Sync grid-click times ─────────────────────────────────────────────────
  useEffect(() => {
    if (open && !isEditing) {
      if (defaultInicio) setInicio(defaultInicio)
      if (defaultFim)    setFim(defaultFim)
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [defaultInicio, defaultFim])

  // ── Patient search ────────────────────────────────────────────────────────
  const handlePacienteSearch = (q: string) => {
    setPacienteQuery(q); setPacienteId('')
    if (!q.trim() || q.trim().length < 3 || !empresaId) { setPacienteSugestoes([]); setShowSugestoes(false); return }
    if (searchTimeout.current) clearTimeout(searchTimeout.current)
    searchTimeout.current = setTimeout(async () => {
      setLoadingPaciente(true)
      try {
        const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/v1/pacientes/empresa/${empresaId}/buscar?q=${encodeURIComponent(q)}`)
        if (res.ok) { const data = await res.json(); setPacienteSugestoes((data as { id: string; nome: string }[]).slice(0, 10)); setShowSugestoes(true) }
      } finally { setLoadingPaciente(false) }
    }, 300)
  }
  const selectPaciente = (p: { id: string; nome: string }) => {
    setPacienteId(p.id); setPacienteQuery(p.nome); setPacienteSugestoes([]); setShowSugestoes(false)
  }

  // ── Service lines ─────────────────────────────────────────────────────────
  const addServicoLine = () => setServicoLines((prev) => [
    ...prev, { tempId: Math.random().toString(36).slice(2), servicoId: '', servicoNome: '', quantidade: 1, valorUnitario: 0, isEditing: true },
  ])
  const confirmServicoLine = (tempId: string) =>
    setServicoLines((prev) => prev.map((l) => l.tempId === tempId ? { ...l, isEditing: false } : l))
  const editServicoLine = (tempId: string) =>
    setServicoLines((prev) => prev.map((l) => l.tempId === tempId ? { ...l, isEditing: true } : l))
  const updateServicoLine = (tempId: string, patch: Partial<ServiceLine>) =>
    setServicoLines((prev) => prev.map((l) => l.tempId === tempId ? { ...l, ...patch } : l))
  const selectServico = (tempId: string, servicoId: string) => {
    const s = servicosApi.find((s) => s.id === servicoId)
    if (s) updateServicoLine(tempId, { servicoId: s.id, servicoNome: s.nome, valorUnitario: s.valor ?? 0 })
  }
  const removeServicoLine = (tempId: string) =>
    setServicoLines((prev) => prev.filter((l) => l.tempId !== tempId))

  // ── Save ──────────────────────────────────────────────────────────────────
  const handleSave = async () => {
    if (!empresaId) { setError('Empresa não identificada.'); return }
    if (!inicio || !fim) { setError('Preencha início e fim.'); return }
    setSaving(true); setError('')
    const profissional = profissionaisApi.find((p) => p.nome === profissionalNome)
    const servicosBody = servicoLines
      .filter((l) => !l.isEditing && l.servicoNome)
      .map((l) => ({ servicoId: l.servicoId || null, servicoNome: l.servicoNome || 'Serviço', quantidade: l.quantidade, valorUnitario: l.valorUnitario }))
    const body: Record<string, unknown> = {
      inicio: datetimeLocalToISO(inicio), fim: datetimeLocalToISO(fim),
      sala: sala || null, recorrente, atendimentoRemoto, observacoes: observacoes || null,
      recorrenteAte: (recorrente && recorrenteAte) ? recorrenteAte : null,
      recorrenciaTipo: recorrente ? recorrenciaTipo : null,
      servicos: servicosBody,
      valorTotal, valorRecebido: parseFloat(valorRecebido) || 0,
      dataPagamento: dataPagamento || null, metodoPagamento: metodoPagamento || null,
    }
    if (!isEditing) { body.empresaId = empresaId; body.pacienteId = pacienteId || null; body.usuarioId = profissional?.id || null }
    else            { body.pacienteId = pacienteId || null; body.usuarioId = profissional?.id || null; body.status = status }
    try {
      const url = isEditing
        ? `${process.env.NEXT_PUBLIC_API_URL}/api/v1/agendamentos/${effectiveAgendamento!.id}`
        : `${process.env.NEXT_PUBLIC_API_URL}/api/v1/agendamentos`
      const method = isEditing ? 'PATCH' : 'POST'
      const res = await fetch(url, { method, headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(body) })
      if (!res.ok) throw new Error('Erro ao salvar agendamento.')
      if (method === 'POST') {
        const created: ApiAgendamento = await res.json()
        setCreatedAgendamento(created)
        onSaved()
      } else {
        onSaved(); onClose()
      }
    } catch (e) { setError(e instanceof Error ? e.message : 'Erro ao salvar.') }
    finally     { setSaving(false) }
  }

  const handleDesmarcar = async () => {
    if (!effectiveAgendamento || !confirm('Deseja desmarcar este agendamento?')) return
    setSaving(true)
    try { await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/v1/agendamentos/${effectiveAgendamento.id}`, { method: 'DELETE' }); onSaved(); onClose() }
    finally { setSaving(false) }
  }

  const handleIniciarAtendimento = async () => {
    if (!effectiveAgendamento) return
    setSaving(true)
    try {
      await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/v1/agendamentos/${effectiveAgendamento.id}`, {
        method: 'PATCH', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ status: 'Atendido' }),
      }); onSaved(); onClose()
    } finally { setSaving(false) }
  }

  const profissionalNames = Array.from(new Set([
    ...(profissionalNome ? [profissionalNome] : []),
    ...profissionaisApi.map((p) => p.nome),
  ]))

  return (
    <>
      <Dialog open={open && !buscaAvancada} onOpenChange={(v: boolean) => { if (!v) onClose() }}>
        <DialogContent
          showCloseButton={false}
          className="bg-[var(--d2b-bg-elevated)] border border-[var(--d2b-border-strong)] text-[var(--d2b-text-primary)] !max-w-2xl p-0 gap-0 overflow-hidden rounded-2xl"
        >
          {/* ── Header ──────────────────────────────────────────────────── */}
          <DialogHeader className="flex-row items-center justify-between px-6 py-4 border-b border-[var(--d2b-border)] space-y-0">
            <DialogTitle className="text-base font-bold text-[var(--d2b-text-primary)]">
              {isEditing ? 'Detalhes do Agendamento' : 'Novo Agendamento'}
            </DialogTitle>
            <div className="flex items-center gap-2">
              {!isEditing && (
                <button
                  onClick={() => { setSelectedBloqueio(undefined); setBloqueioClickDT(undefined); setBloqueioOpen(true) }}
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-semibold bg-[var(--d2b-hover)] text-[#C084FC] border border-[var(--d2b-border-strong)] hover:bg-[var(--d2b-hover)] transition-colors"
                >
                  <Lock size={12} />
                  Novo Bloqueio de Agenda
                </button>
              )}
              <button onClick={onClose} className="w-7 h-7 rounded-md flex items-center justify-center text-[var(--d2b-text-secondary)] hover:text-[var(--d2b-text-primary)] hover:bg-[var(--d2b-hover)] transition-colors text-lg leading-none">✕</button>
            </div>
          </DialogHeader>

          <div className="overflow-y-auto max-h-[80vh] px-6 py-5 space-y-6" onClick={() => setAtalhoOpen(false)}>

            {/* ── INFORMAÇÕES DO PACIENTE (edit + patient found) ─────────── */}
            {isEditing && pacienteInfo ? (
              <div>
                <p className="text-[10px] font-bold tracking-widest uppercase text-[#7C4DFF] mb-3">Informações do Paciente</p>
                <div className="flex items-center gap-3 mb-4 flex-wrap">
                  <h3 className="text-lg font-bold text-[var(--d2b-text-primary)]">{pacienteInfo.nome}</h3>
                  <button
                    onClick={() => setMensagensOpen(true)}
                    className="flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-[var(--d2b-hover)] text-[#C084FC] border border-[var(--d2b-border-strong)] hover:bg-[var(--d2b-hover)] transition-colors"
                  >
                    <MessageCircle size={11} /> Mensagem
                  </button>
                  {/* Atalhos dropdown */}
                  <div className="relative" onClick={(e) => e.stopPropagation()}>
                    <button
                      onClick={() => setAtalhoOpen((p) => !p)}
                      className="flex items-center gap-1 px-3 py-1 rounded-full text-xs font-semibold bg-[var(--d2b-hover)] text-[var(--d2b-text-secondary)] border border-[var(--d2b-border-strong)] hover:bg-[var(--d2b-hover)] transition-colors"
                    >
                      Atalhos <ChevronDown size={11} />
                    </button>
                    {atalhoOpen && (
                      <div className="absolute left-0 top-8 z-50 w-52 bg-[var(--d2b-bg-elevated)] border border-[var(--d2b-border-strong)] rounded-xl shadow-2xl overflow-hidden">
                        {[
                          {
                            label: 'Prontuário',
                            icon: '🗂️',
                            action: () => { router.push(`/dashboard/clientes?pacienteId=${pacienteId}&tab=dados`); onClose() },
                          },
                          {
                            label: 'Iniciar Atendimento',
                            icon: '▶',
                            action: () => { setAtalhoOpen(false); handleIniciarAtendimento() },
                          },
                          {
                            label: 'Anamnese',
                            icon: '📋',
                            action: () => { router.push(`/dashboard/clientes?pacienteId=${pacienteId}&tab=anamnese`); onClose() },
                          },
                          {
                            label: 'Emitir Documento',
                            icon: '📄',
                            action: () => { router.push(`/dashboard/clientes?pacienteId=${pacienteId}&tab=documentos`); onClose() },
                          },
                          {
                            label: 'Enviar Mensagem',
                            icon: '💬',
                            action: () => {
                              const tel = pacienteInfo?.telefone?.replace(/\D/g, '') ?? ''
                              if (tel) window.open(`https://wa.me/${tel}`, '_blank')
                              setAtalhoOpen(false)
                            },
                          },
                          {
                            label: 'Linha do Tempo',
                            icon: '🕒',
                            action: () => { router.push(`/dashboard/clientes?pacienteId=${pacienteId}&tab=timeline`); onClose() },
                          },
                        ].map(({ label, icon, action }) => (
                          <button
                            key={label}
                            onClick={action}
                            className="w-full flex items-center gap-2.5 px-4 py-2.5 text-sm text-[var(--d2b-text-secondary)] hover:bg-[var(--d2b-hover)] hover:text-[var(--d2b-text-primary)] transition-colors text-left"
                          >
                            <span className="text-base leading-none">{icon}</span>
                            {label}
                          </button>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
                <div className="grid grid-cols-3 gap-3">
                  <ReadonlyField label="Telefone"              value={pacienteInfo.telefone         || '-'} />
                  <ReadonlyField label="Convênio"              value={pacienteInfo.plano             || 'PARTICULAR'} />
                  <ReadonlyField label="Número da Carteirinha" value={pacienteInfo.numeroCarteirinha || '-'} />
                </div>

                {/* Whereby video call links */}
                {(effectiveAgendamento?.wherebyHostUrl || effectiveAgendamento?.wherebyViewerUrl) && (
                  <div className="mt-4 rounded-xl bg-gradient-to-r from-[#EEF2FF] to-[#F5F3FF] border border-[#C7D2FE] p-4">
                    <div className="flex items-center gap-2 mb-3">
                      <div className="w-6 h-6 rounded-full bg-[#7C4DFF] flex items-center justify-center shrink-0">
                        <Video size={12} className="text-white" />
                      </div>
                      <p className="text-xs font-bold text-[#4338CA] tracking-wide">VIDEOCHAMADA</p>
                    </div>
                    <div className="space-y-2">
                      {effectiveAgendamento?.wherebyHostUrl && (
                        <div className="flex items-center gap-2">
                          <a
                            href={effectiveAgendamento.wherebyHostUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="flex-1 flex items-center gap-2 px-3 py-2 rounded-lg bg-[#7C4DFF] text-white text-xs font-semibold hover:bg-[#5B21B6] transition-colors"
                          >
                            <Video size={12} /> Entrar como Profissional
                          </a>
                          <button
                            onClick={() => navigator.clipboard.writeText(effectiveAgendamento.wherebyHostUrl!)}
                            className="p-2 rounded-lg bg-[var(--d2b-hover)] border border-[var(--d2b-border-strong)] text-[var(--d2b-text-secondary)] hover:text-[var(--d2b-text-primary)] transition-colors"
                            title="Copiar link do profissional"
                          >
                            <Copy size={12} />
                          </button>
                        </div>
                      )}
                      {effectiveAgendamento?.wherebyViewerUrl && (
                        <div className="flex items-center gap-2">
                          <span className="flex-1 truncate text-xs text-[#4338CA] bg-white border border-[#C7D2FE] rounded-lg px-3 py-2">
                            🔗 Link do paciente: {effectiveAgendamento.wherebyViewerUrl}
                          </span>
                          <button
                            onClick={() => navigator.clipboard.writeText(effectiveAgendamento.wherebyViewerUrl!)}
                            className="p-2 rounded-lg bg-[var(--d2b-hover)] border border-[var(--d2b-border-strong)] text-[var(--d2b-text-secondary)] hover:text-[var(--d2b-text-primary)] transition-colors"
                            title="Copiar link do paciente"
                          >
                            <Copy size={12} />
                          </button>
                        </div>
                      )}
                    </div>
                  </div>
                )}
              </div>
            ) : !isEditing ? (
              /* ── PACIENTE (create mode) ─────────────────────────── */
              <div>
                <p className="text-[10px] font-bold tracking-widest uppercase text-[#7C4DFF] mb-3">Paciente</p>
                <div className="flex gap-3 items-end">
                  <div className="flex-1 relative">
                    <FloatingField label="Selecione um paciente">
                      <div className="relative">
                        <input
                          value={pacienteQuery}
                          onChange={(e) => handlePacienteSearch(e.target.value)}
                          onFocus={() => pacienteSugestoes.length > 0 && setShowSugestoes(true)}
                          placeholder="Busque pelo nome do paciente"
                          className={INP + ' pr-8'}
                          autoComplete="off"
                        />
                        {loadingPaciente && (
                          <span className="absolute right-3 top-1/2 -translate-y-1/2 text-[var(--d2b-text-secondary)] text-xs animate-pulse">...</span>
                        )}
                      </div>
                    </FloatingField>
                    {pacienteQuery.trim().length > 0 && pacienteQuery.trim().length < 3 && (
                      <p className="mt-1 text-[11px] text-[var(--d2b-text-muted)]">Digite ao menos 3 caracteres para buscar.</p>
                    )}
                    {showSugestoes && pacienteSugestoes.length > 0 && (
                      <div className="absolute top-full left-0 right-0 z-50 mt-1 bg-[var(--d2b-bg-elevated)] border border-[var(--d2b-border-strong)] rounded-lg shadow-2xl overflow-hidden">
                        {pacienteSugestoes.map((p) => (
                          <button key={p.id} type="button" onClick={() => selectPaciente(p)}
                            className="w-full text-left px-4 py-2.5 text-sm text-[var(--d2b-text-primary)] hover:bg-[var(--d2b-hover)] transition-colors border-b border-[var(--d2b-border)] last:border-b-0">
                            {p.nome}
                          </button>
                        ))}
                      </div>
                    )}
                  </div>
                  <button className="flex items-center gap-1.5 px-4 py-2.5 rounded-md text-sm font-bold text-white bg-[#7C4DFF] hover:bg-[#5B21B6] transition-colors whitespace-nowrap shrink-0">
                    <Plus size={14} /> Novo paciente
                  </button>
                </div>
              </div>
            ) : null}

            {/* ── DETALHES DO EVENTO ──────────────────────────────────────── */}
            <div>
              <p className="text-[10px] font-bold tracking-widest uppercase text-[#7C4DFF] mb-3">Detalhes do Evento</p>
              <div className="space-y-4">
                {isEditing ? (
                  <div className="grid grid-cols-3 gap-3">
                    <FloatingSelect label="Profissional" required options={profissionalNames} placeholder="Selecione"
                      value={profissionalNome} onChange={setProfissionalNome} onClear={() => setProfissionalNome('')} />
                    <FloatingField label="Início Evento" required>
                      <input type="datetime-local" value={inicio} onChange={(e) => setInicio(e.target.value)} className={INP} />
                    </FloatingField>
                    <FloatingField label="Fim Evento" required>
                      <input type="datetime-local" value={fim} onChange={(e) => setFim(e.target.value)} className={INP} />
                    </FloatingField>
                  </div>
                ) : (
                  <>
                    <div className="flex gap-3 items-end">
                      <div className="flex-1">
                        <FloatingSelect label="Profissional" required options={profissionalNames} placeholder="Selecione"
                          value={profissionalNome} onChange={setProfissionalNome} onClear={() => setProfissionalNome('')} />
                      </div>
                      <button onClick={() => setBuscaAvancada(true)}
                        className="flex items-center gap-1.5 px-3 py-2.5 rounded-md text-sm font-semibold bg-[var(--d2b-hover)] text-[#C084FC] border border-[var(--d2b-border-strong)] hover:bg-[var(--d2b-hover)] transition-colors whitespace-nowrap shrink-0">
                        <Search size={14} /> Busca Avançada
                      </button>
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <FloatingField label="Início Evento" required>
                        <input type="datetime-local" value={inicio} onChange={(e) => setInicio(e.target.value)} className={INP} />
                      </FloatingField>
                      <FloatingField label="Fim Evento" required>
                        <input type="datetime-local" value={fim} onChange={(e) => setFim(e.target.value)} className={INP} />
                      </FloatingField>
                    </div>
                    <button className="flex items-center gap-1.5 px-3 py-2 rounded-md text-sm text-[var(--d2b-text-secondary)] border border-[var(--d2b-border-strong)] hover:border-[#7C4DFF] hover:text-[var(--d2b-text-primary)] transition-colors w-fit">
                      <CalendarIcon size={14} /> Escolher no Calendário
                    </button>
                  </>
                )}
                <div className={`grid gap-3 ${isEditing ? 'grid-cols-2' : 'grid-cols-1'}`}>
                  {isEditing && (
                    <FloatingSelect label="Status" required options={STATUS_OPCOES} value={status} onChange={setStatus} />
                  )}
                  <FloatingSelect label="Sala"
                    options={salas.map((s) => s.nome)}
                    placeholder={salas.length === 0 ? 'Nenhuma sala cadastrada' : 'Selecione uma sala'}
                    value={sala} onChange={setSala} onClear={() => setSala('')} disabled={salas.length === 0} />
                </div>
                {!isEditing && (
                  <div className="space-y-3">
                    <div className="flex items-center gap-3">
                      <Toggle on={recorrente} set={setRecorrente} />
                      <span className="text-sm text-[var(--d2b-text-secondary)]">É um evento recorrente?</span>
                    </div>
                    {recorrente && (
                      <div className="grid grid-cols-2 gap-3 ml-10">
                        <FloatingField label="Repetir até" required>
                          <input
                            type="date"
                            value={recorrenteAte}
                            onChange={(e) => setRecorrenteAte(e.target.value)}
                            min={inicio ? inicio.split('T')[0] : undefined}
                            className={INP}
                          />
                        </FloatingField>
                        <FloatingField label="Frequência" required>
                          <div className="relative">
                            <select
                              value={recorrenciaTipo}
                              onChange={(e) => setRecorrenciaTipo(e.target.value as 'DIARIO' | 'SEMANAL' | 'MENSAL')}
                              className={INP + ' appearance-none pr-8'}
                            >
                              <option value="SEMANAL">Semanal</option>
                              <option value="DIARIO">Diário</option>
                              <option value="MENSAL">Mensal</option>
                            </select>
                            <ChevronDown size={13} className="absolute right-2.5 top-1/2 -translate-y-1/2 text-[var(--d2b-text-secondary)] pointer-events-none" />
                          </div>
                        </FloatingField>
                      </div>
                    )}
                  </div>
                )}
                <div className="flex items-center gap-3">
                  <Toggle on={atendimentoRemoto} set={setAtendimentoRemoto} />
                  <div className="flex items-center gap-1.5">
                    <Video size={14} className={atendimentoRemoto ? 'text-[#7C4DFF]' : 'text-[var(--d2b-text-muted)]'} />
                    <span className="text-sm text-[var(--d2b-text-secondary)]">Atendimento remoto (videochamada)</span>
                  </div>
                </div>
              </div>
            </div>

            {/* ── SERVIÇOS PRESTADOS ──────────────────────────────────────── */}
            <div>
              <p className="text-[10px] font-bold tracking-widest uppercase text-[#7C4DFF] mb-3">Serviços Prestados</p>
              {servicoLines.length > 0 ? (
                <div className="mb-3 rounded-lg border border-[var(--d2b-border)] overflow-hidden">
                  <div className="grid grid-cols-[1fr_76px_110px_68px] gap-2 px-3 py-2 bg-[var(--d2b-hover)]">
                    {['Nome', 'Qtd (#)', 'Valor (1x)', 'Ações'].map((h) => (
                      <span key={h} className="text-[10px] font-semibold uppercase text-[var(--d2b-text-muted)]">{h}</span>
                    ))}
                  </div>
                  {servicoLines.map((line) => (
                    <div key={line.tempId} className="grid grid-cols-[1fr_76px_110px_68px] gap-2 px-3 py-2.5 border-t border-[var(--d2b-border)] items-center">
                      {line.isEditing ? (
                        <>
                          <div className="relative">
                            <select value={line.servicoId} onChange={(e) => selectServico(line.tempId, e.target.value)}
                              className={INP + ' py-1.5 text-xs appearance-none pr-6'}>
                              <option value="">Selecione...</option>
                              {servicosApi.map((s) => <option key={s.id} value={s.id}>{s.nome}</option>)}
                            </select>
                            <ChevronDown size={11} className="absolute right-2 top-1/2 -translate-y-1/2 text-[var(--d2b-text-secondary)] pointer-events-none" />
                          </div>
                          <input type="number" min={1} value={line.quantidade}
                            onChange={(e) => updateServicoLine(line.tempId, { quantidade: Math.max(1, parseInt(e.target.value) || 1) })}
                            className={INP + ' py-1.5 text-xs'} />
                          <input type="number" min={0} step="0.01" value={line.valorUnitario}
                            onChange={(e) => updateServicoLine(line.tempId, { valorUnitario: parseFloat(e.target.value) || 0 })}
                            className={INP + ' py-1.5 text-xs'} />
                          <div className="flex gap-1">
                            <button type="button" onClick={() => confirmServicoLine(line.tempId)}
                              className="w-8 h-8 flex items-center justify-center rounded-md bg-teal-500/10 text-teal-400 hover:bg-teal-500/20 transition-colors border border-teal-500/20">
                              <Check size={13} />
                            </button>
                            <button type="button" onClick={() => removeServicoLine(line.tempId)}
                              className="w-8 h-8 flex items-center justify-center rounded-md bg-orange-500/10 text-orange-400 hover:bg-orange-500/20 transition-colors border border-orange-500/20">
                              <X size={13} />
                            </button>
                          </div>
                        </>
                      ) : (
                        <>
                          <span className="text-sm text-[var(--d2b-text-primary)] truncate">{line.servicoNome || 'Serviço'}</span>
                          <span className="text-sm text-[var(--d2b-text-secondary)] text-center">{line.quantidade}</span>
                          <span className="text-sm text-[var(--d2b-text-secondary)]">{line.valorUnitario.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}</span>
                          <div className="flex gap-1">
                            <button type="button" onClick={() => editServicoLine(line.tempId)}
                              className="w-8 h-8 flex items-center justify-center rounded-md bg-purple-500/10 text-purple-400 hover:bg-purple-500/20 transition-colors border border-purple-500/20">
                              <Pencil size={12} />
                            </button>
                            <button type="button" onClick={() => removeServicoLine(line.tempId)}
                              className="w-8 h-8 flex items-center justify-center rounded-md bg-red-500/10 text-red-400 hover:bg-red-500/20 transition-colors border border-red-500/20">
                              <Trash2 size={12} />
                            </button>
                          </div>
                        </>
                      )}
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-sm text-[var(--d2b-text-muted)] mb-3">Nenhum serviço adicionado neste agendamento</p>
              )}
              <button type="button" onClick={addServicoLine}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-md text-sm font-semibold text-[#7C4DFF] border border-[var(--d2b-border-strong)] hover:bg-[var(--d2b-hover)] transition-colors">
                <Plus size={13} /> Adicionar Serviço
              </button>
            </div>

            {/* ── DETALHES FINANCEIROS ────────────────────────────────────── */}
            <div>
              <p className="text-[10px] font-bold tracking-widest uppercase text-[#7C4DFF] mb-3">Detalhes Financeiros</p>
              <div className="space-y-3">
                <div className="grid grid-cols-2 gap-3">
                  {hasConfirmedServices ? (
                    <ReadonlyField label="Valor" value={formatCurrency(valorTotal)} />
                  ) : (
                    <FloatingField label="Valor">
                      <input
                        type="text"
                        inputMode="decimal"
                        value={valorManualFocused
                          ? valorManual
                          : formatCurrency(parseFloat(valorManual.replace(',', '.')) || 0)}
                        onFocus={(e) => { setValorManualFocused(true); e.target.select() }}
                        onBlur={() => setValorManualFocused(false)}
                        onChange={(e) => {
                          const raw = e.target.value.replace(/[^\d.,]/g, '').replace(',', '.')
                          setValorManual(raw)
                        }}
                        className={INP}
                      />
                    </FloatingField>
                  )}
                  <div className="flex gap-2 items-end">
                    <div className="flex-1">
                      <FloatingField label="Valor Recebido">
                        <input
                          type="text"
                          inputMode="decimal"
                          value={valorRecebidoFocused
                            ? valorRecebido
                            : formatCurrency(parseFloat(valorRecebido.replace(',', '.')) || 0)}
                          onFocus={(e) => { setValorRecebidoFocused(true); e.target.select() }}
                          onBlur={() => setValorRecebidoFocused(false)}
                          onChange={(e) => {
                            const raw = e.target.value.replace(/[^\d.,]/g, '').replace(',', '.')
                            setValorRecebido(raw)
                          }}
                          className={INP}
                        />
                      </FloatingField>
                    </div>
                    <button className="px-3 py-2.5 rounded-md text-xs font-semibold bg-[var(--d2b-hover)] text-[#C084FC] border border-[var(--d2b-border-strong)] hover:bg-[var(--d2b-hover)] transition-colors whitespace-nowrap shrink-0">
                      Recibo
                    </button>
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <FloatingField label="Data Pagamento">
                    <input type="date" value={dataPagamento} onChange={(e) => setDataPagamento(e.target.value)} className={INP} />
                  </FloatingField>
                  <FloatingSelect label="Método Pagamento" options={METODOS_PAGAMENTO} placeholder="Selecione..."
                    value={metodoPagamento} onChange={setMetodoPagamento} onClear={() => setMetodoPagamento('')} />
                </div>
                <FloatingField label="Observações">
                  <textarea rows={3} placeholder="Observações" value={observacoes}
                    onChange={(e) => setObservacoes(e.target.value)}
                    className="w-full bg-[var(--d2b-bg-elevated)] border border-[var(--d2b-border-strong)] rounded-md px-3 py-2.5 text-sm text-[var(--d2b-text-primary)] placeholder:text-[var(--d2b-text-muted)] focus:outline-none focus:border-[#7C4DFF] transition-colors resize-none" />
                </FloatingField>
              </div>
            </div>

            {error && (
              <p className="text-xs text-red-400 bg-red-500/10 border border-red-500/20 rounded px-3 py-2">{error}</p>
            )}
          </div>

          {/* ── Footer ────────────────────────────────────────────────────── */}
          <div className="flex items-center justify-between px-6 py-4 border-t border-[var(--d2b-border)]">
            <div className="flex items-center gap-2">
              {isEditing ? (
                <>
                  <button onClick={handleDesmarcar} disabled={saving}
                    className="px-4 py-2 rounded-md text-sm font-bold text-[#EF4444] border border-red-500/30 hover:bg-red-500/10 transition-colors disabled:opacity-50">
                    Desmarcar
                  </button>
                  <button onClick={handleIniciarAtendimento} disabled={saving}
                    className="px-4 py-2 rounded-md text-sm font-bold text-[#C084FC] border border-[var(--d2b-border-strong)] hover:bg-[var(--d2b-hover)] transition-colors disabled:opacity-50">
                    Iniciar Atendimento
                  </button>
                </>
              ) : <span />}
            </div>
            <div className="flex items-center gap-2">
              {isEditing && (
                <button onClick={onClose}
                  className="px-4 py-2 rounded-md text-sm font-medium text-[var(--d2b-text-secondary)] border border-[var(--d2b-border-strong)] hover:bg-[var(--d2b-hover)] transition-colors">
                  Fechar
                </button>
              )}
              <button onClick={handleSave} disabled={saving}
                className="px-6 py-2 rounded-md text-sm font-bold text-white bg-[#7C4DFF] hover:bg-[#5B21B6] transition-colors disabled:opacity-60">
                {saving ? 'Salvando...' : isEditing ? 'Salvar' : 'Agendar'}
              </button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      <BuscaAvancadaModal
        open={buscaAvancada}
        onClose={() => setBuscaAvancada(false)}
        profissionais={profissionaisApi}
      />

      <SistemaMensagensModal
        open={mensagensOpen}
        onClose={() => setMensagensOpen(false)}
        telefone={pacienteInfo?.telefone}
        empresaId={empresaId}
        clienteId={pacienteInfo?.id ?? null}
        nome={pacienteInfo?.nome ?? null}
        context={{
          nomePaciente: pacienteInfo?.nome,
          nomeProfissional: profissionalNome || undefined,
          dataHora: inicio ? (() => {
            try {
              const d = new Date(inicio)
              return isNaN(d.getTime()) ? inicio
                : d.toLocaleDateString('pt-BR') + ' às ' + d.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })
            } catch { return inicio }
          })() : undefined,
        }}
      />
    </>
  )
}

// ─── Month grid helper ────────────────────────────────────────────────────────
function getMonthGrid(base: Date): Date[][] {
  const year  = base.getFullYear()
  const month = base.getMonth()
  const firstDay = new Date(year, month, 1)
  const lastDay  = new Date(year, month + 1, 0)
  // Start from Sunday of the week that contains the 1st
  const gridStart = new Date(firstDay)
  gridStart.setDate(firstDay.getDate() - firstDay.getDay())
  const weeks: Date[][] = []
  const cursor = new Date(gridStart)
  while (cursor <= lastDay || weeks.length < 4) {
    const week: Date[] = []
    for (let i = 0; i < 7; i++) {
      week.push(new Date(cursor))
      cursor.setDate(cursor.getDate() + 1)
    }
    weeks.push(week)
    if (cursor > lastDay && weeks.length >= 4) break
  }
  return weeks
}

// ─── Appointment dot colors ───────────────────────────────────────────────────
const COR_DOT: Record<string, string> = {
  green:  'bg-[#22C55E]',
  red:    'bg-[#EF4444]',
  teal:   'bg-[#14B8A6]',
  purple: 'bg-[#7C4DFF]',
}
const COR_BG: Record<string, { bg: string; border: string }> = {
  green:  { bg: 'rgba(34,197,94,0.08)',   border: 'rgba(34,197,94,0.25)' },
  red:    { bg: 'rgba(239,68,68,0.08)',   border: 'rgba(239,68,68,0.25)' },
  teal:   { bg: 'rgba(20,184,166,0.08)',  border: 'rgba(20,184,166,0.25)' },
  purple: { bg: 'rgba(124,77,255,0.12)', border: 'rgba(124,77,255,0.35)' },
}

// ─── CalendarioView ───────────────────────────────────────────────────────────
export function CalendarioView({
  empresaId,
  profissionais,
  agendaConfig,
}: {
  empresaId: string | null
  profissionais: Profissional[]
  agendaConfig?: AgendaConfig | null
}) {
  const [weekBase, setWeekBase]     = useState(new Date())
  const [viewMode, setViewMode]     = useState<ViewMode>('Semana')
  const [novoOpen, setNovoOpen]     = useState(false)
  const [clickDT, setClickDT]       = useState<{ inicio: string; fim: string } | undefined>()
  const [filtrosOpen, setFiltrosOpen]   = useState(false)
  const [settingsOpen, setSettingsOpen] = useState(false)
  const filtrosBtnRef = useRef<HTMLButtonElement>(null)
  const filtroCalBtnRef = useRef<HTMLButtonElement>(null)
  const [filtrosRect, setFiltrosRect] = useState<DOMRect | null>(null)
  const [filtroTab, setFiltroTab] = useState<'calendario' | 'cores'>('calendario')
  const [filtroCorAtivo, setFiltroCorAtivo] = useState<string>('')
  // Filtros do Calendário
  const [filtroEspecialidade, setFiltroEspecialidade] = useState('')
  const [filtroConvenio, setFiltroConvenio]           = useState('')
  const [filtroPaciente, setFiltroPaciente]           = useState('')
  const [filtroSala, setFiltroSala]                   = useState('')
  const [filtroIntervalo, setFiltroIntervalo]         = useState('30')
  const [mostrarDesmarcados, setMostrarDesmarcados]   = useState(false)
  const [mostrarBloqueios, setMostrarBloqueios]       = useState(true)
  const [now, setNow]               = useState(new Date())

  const [appointments, setAppointments]               = useState<Appointment[]>([])
  const [marcadores, setMarcadores]                     = useState<Marcador[]>([])
  const [historicoRisco, setHistoricoRisco]             = useState<ApiAgendamento[]>([])
  const [inadimplenteIds, setInadimplenteIds]           = useState<Set<string>>(new Set())
  const [selectedAgendamento, setSelectedAgendamento] = useState<ApiAgendamento | undefined>()
  const [selectedProfissional, setSelectedProfissional] = useState('')
  const [profDropdownOpen, setProfDropdownOpen]         = useState(false)
  const [bloqueioOpen, setBloqueioOpen]                 = useState(false)
  const [selectedBloqueio, setSelectedBloqueio]         = useState<ApiAgendamento | undefined>()
  const [bloqueioClickDT, setBloqueioClickDT]           = useState<{ inicio: string; fim: string } | undefined>()

  const router = useRouter()

  // ── Clock ──────────────────────────────────────────────────────────────
  useEffect(() => {
    const id = setInterval(() => setNow(new Date()), 60_000)
    return () => clearInterval(id)
  }, [])

  // ── Fetch appointments ────────────────────────────────────────────────
  const fetchAppointments = useCallback(async () => {
    if (!empresaId) return
    try {
      let start: Date, end: Date
      if (viewMode === 'Dia') {
        start = new Date(weekBase); start.setHours(0, 0, 0, 0)
        end   = new Date(weekBase); end.setHours(23, 59, 59, 999)
      } else if (viewMode === 'Mês') {
        start = new Date(weekBase.getFullYear(), weekBase.getMonth(), 1)
        start.setHours(0, 0, 0, 0)
        end = new Date(weekBase.getFullYear(), weekBase.getMonth() + 1, 0)
        end.setHours(23, 59, 59, 999)
      } else {
        const days = getWeekDays(weekBase, agendaConfig)
        start = new Date(days[0]); start.setHours(0, 0, 0, 0)
        end   = new Date(days[days.length - 1]); end.setHours(23, 59, 59, 999)
      }
      const url = `${process.env.NEXT_PUBLIC_API_URL}/api/v1/agendamentos/empresa/${empresaId}?inicio=${start.toISOString()}&fim=${end.toISOString()}`
      const res = await fetch(url, { cache: 'no-store' })
      if (!res.ok) return
      const data: ApiAgendamento[] = await res.json()
      setAppointments(
        data.map((a) => ({
          id:           a.id,
          tipo:         a.tipo ?? 'AGENDAMENTO',
          titulo:       a.titulo ?? null,
          pacienteNome: a.pacienteNome ?? 'Sem paciente',
          usuarioNome:  a.usuarioNome  ?? '',
          inicio:       timeFromISO(a.inicio),
          fim:          timeFromISO(a.fim),
          date:         new Date(a.inicio),
          cor:          (a.cor as 'green' | 'red' | 'teal' | 'purple') ?? 'purple',
          status:       a.status,
          raw:          a,
        }))
      )
    } catch {
      // backend unreachable — keep current list
    }
  }, [empresaId, weekBase, viewMode])

  useEffect(() => { fetchAppointments() }, [fetchAppointments])

  // ── Fetch marcadores da empresa (único, sem depências extras) ────────────
  useEffect(() => {
    if (!empresaId) return
    fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/v1/marcadores/empresa/${empresaId}`)
      .then((r) => (r.ok ? r.json() : []))
      .then(setMarcadores)
      .catch(() => {})
  }, [empresaId])

  // ── Buscar histórico de 12 meses ao ativar filtro Alto Risco ─────────
  useEffect(() => {
    if (filtroCorAtivo !== 'Alto Risco de Falta' || !empresaId) return
    const fim   = new Date(); fim.setHours(23, 59, 59, 999)
    const inicio = new Date(fim); inicio.setFullYear(inicio.getFullYear() - 1); inicio.setHours(0, 0, 0, 0)
    fetch(
      `${process.env.NEXT_PUBLIC_API_URL}/api/v1/agendamentos/empresa/${empresaId}?inicio=${inicio.toISOString()}&fim=${fim.toISOString()}`,
      { cache: 'no-store' }
    )
      .then((r) => (r.ok ? r.json() : []))
      .then(setHistoricoRisco)
      .catch(() => {})
  }, [filtroCorAtivo, empresaId])

  // ── Buscar inadimplentes ao ativar filtro Inadimplentes ───────────────
  useEffect(() => {
    if (filtroCorAtivo !== 'Inadimplentes' || !empresaId) {
      setInadimplenteIds(new Set())
      return
    }
    fetch(
      `${process.env.NEXT_PUBLIC_API_URL}/api/v1/movimentos-financeiros/empresa/${empresaId}/inadimplentes`,
      { cache: 'no-store' }
    )
      .then((r) => (r.ok ? r.json() : []))
      .then((ids: string[]) => setInadimplenteIds(new Set(ids)))
      .catch(() => {})
  }, [filtroCorAtivo, empresaId])

  // ── Navigation ──────────────────────────────────────────────────────────
  const today    = new Date()
  const weekDays = getWeekDays(weekBase, agendaConfig)

  // ── Grid hours derived from agendaConfig ─────────────────────────────
  // Collect all open-day opening/closing hours and use the earliest/latest
  const dayHourMap: Record<number, { open: number; close: number }> = {}
  if (agendaConfig) {
    const entries: [boolean | undefined, string | undefined, string | undefined, number][] = [
      [agendaConfig.segAberto, agendaConfig.segAbertura, agendaConfig.segFechamento, 1],
      [agendaConfig.terAberto, agendaConfig.terAbertura, agendaConfig.terFechamento, 2],
      [agendaConfig.quaAberto, agendaConfig.quaAbertura, agendaConfig.quaFechamento, 3],
      [agendaConfig.quiAberto, agendaConfig.quiAbertura, agendaConfig.quiFechamento, 4],
      [agendaConfig.sexAberto, agendaConfig.sexAbertura, agendaConfig.sexFechamento, 5],
      [agendaConfig.sabAberto, agendaConfig.sabAbertura, agendaConfig.sabFechamento, 6],
      [agendaConfig.domAberto, agendaConfig.domAbertura, agendaConfig.domFechamento, 0],
    ]
    for (const [isOpen, abertura, fechamento, dow] of entries) {
      if (isOpen) {
        const open  = abertura  ? parseInt(abertura.split(':')[0],  10) : DEFAULT_GRID_START
        const close = fechamento ? parseInt(fechamento.split(':')[0], 10) : DEFAULT_GRID_END
        dayHourMap[dow] = { open, close }
      }
    }
  }
  const configuredHours = Object.values(dayHourMap)
  const GRID_START = configuredHours.length > 0 ? Math.min(...configuredHours.map((h) => h.open))  : DEFAULT_GRID_START
  const GRID_END   = configuredHours.length > 0 ? Math.max(...configuredHours.map((h) => h.close)) : DEFAULT_GRID_END
  const HOURS = Array.from({ length: GRID_END - GRID_START }, (_, i) => i + GRID_START)

  const goBack = () => {
    const d = new Date(weekBase)
    if (viewMode === 'Semana') d.setDate(d.getDate() - 7)
    else if (viewMode === 'Dia') d.setDate(d.getDate() - 1)
    else d.setMonth(d.getMonth() - 1)
    setWeekBase(d)
  }
  const goForward = () => {
    const d = new Date(weekBase)
    if (viewMode === 'Semana') d.setDate(d.getDate() + 7)
    else if (viewMode === 'Dia') d.setDate(d.getDate() + 1)
    else d.setMonth(d.getMonth() + 1)
    setWeekBase(d)
  }
  const goToday = () => setWeekBase(new Date())

  const MONTHS_PT = ['Janeiro','Fevereiro','Março','Abril','Maio','Junho','Julho','Agosto','Setembro','Outubro','Novembro','Dezembro']
  const pad2 = (n: number) => String(n).padStart(2, '0')
  const navLabel = viewMode === 'Mês'
    ? `${MONTHS_PT[weekBase.getMonth()]} ${weekBase.getFullYear()}`
    : viewMode === 'Dia'
      ? `${['Dom','Seg','Ter','Qua','Qui','Sex','Sáb'][weekBase.getDay()]}, ${pad2(weekBase.getDate())}/${pad2(weekBase.getMonth()+1)}/${weekBase.getFullYear()}`
      : (() => { const d = getWeekDays(weekBase, agendaConfig); return `${pad2(d[0].getDate())}/${pad2(d[0].getMonth()+1)} – ${pad2(d[d.length-1].getDate())}/${pad2(d[d.length-1].getMonth()+1)}` })()

  // ── Modal helpers ───────────────────────────────────────────────────────
  function openCreateModal(dt?: { inicio: string; fim: string }) {
    setSelectedAgendamento(undefined)
    setClickDT(dt)
    setNovoOpen(true)
  }

  function openEditModal(appt: Appointment) {
    setSelectedAgendamento(appt.raw)
    setClickDT(undefined)
    setNovoOpen(true)
  }

  function closeModal() {
    setNovoOpen(false)
    setClickDT(undefined)
    setSelectedAgendamento(undefined)
  }

  const gridStartMin = GRID_START * 60
  const nowMinutes   = now.getHours() * 60 + now.getMinutes()
  const timeLineTop  = ((nowMinutes - gridStartMin) / 60) * CELL_H

  const visibleAppointments = selectedProfissional
    ? appointments.filter((a) => a.usuarioNome === selectedProfissional)
    : appointments

  // ── Projeção financeira ───────────────────────────────────────────────────
  const exibirProjecao = agendaConfig?.exibirProjecao === true
  const projecao = useMemo(() => {
    if (!exibirProjecao) return null
    const todayStart = new Date(); todayStart.setHours(0, 0, 0, 0)
    // Fim da janela: mesmo que a janela de fetch
    let windowEnd: Date
    if (viewMode === 'Dia') {
      windowEnd = new Date(weekBase); windowEnd.setHours(23, 59, 59, 999)
    } else if (viewMode === 'Mês') {
      windowEnd = new Date(weekBase.getFullYear(), weekBase.getMonth() + 1, 0)
      windowEnd.setHours(23, 59, 59, 999)
    } else {
      const days = weekDays
      windowEnd = new Date(days[days.length - 1]); windowEnd.setHours(23, 59, 59, 999)
    }
    let aguardando = 0
    let atendido = 0
    for (const a of visibleAppointments) {
      if (a.raw.tipo === 'BLOQUEIO') continue
      const apptDate = new Date(a.raw.inicio)
      if (apptDate < todayStart || apptDate > windowEnd) continue
      const statusLower = (a.raw.status ?? '').toLowerCase()
      if (statusLower === 'aguardando' || statusLower === 'confirmado') {
        aguardando += a.raw.valorTotal ?? 0
      } else if (statusLower === 'atendido') {
        atendido += a.raw.valorRecebido ?? 0
      }
    }
    return { aguardando, atendido }
  }, [exibirProjecao, visibleAppointments, viewMode, weekBase, weekDays])

  // ── Alto Risco de Falta (baseia-se no histórico de 12 meses) ─────────
  const altoRiscoPacienteIds = useMemo(() => {
    if (filtroCorAtivo !== 'Alto Risco de Falta') return new Set<string>()
    const byPaciente = new Map<string, ApiAgendamento[]>()
    for (const a of historicoRisco) {
      if (!a.pacienteId) continue
      const arr = byPaciente.get(a.pacienteId) ?? []
      arr.push(a)
      byPaciente.set(a.pacienteId, arr)
    }
    const ids = new Set<string>()
    byPaciente.forEach((appts, pacienteId) => {
      // considera apenas agendamentos concluídos (com status de desfecho)
      const concluidos = appts.filter((a) =>
        ['Faltou', 'Atendido', 'Cancelado'].includes(a.status)
      )
      if (concluidos.length === 0) return
      const sorted = [...concluidos].sort(
        (x, y) => new Date(x.inicio).getTime() - new Date(y.inicio).getTime()
      )
      const last = sorted[sorted.length - 1]
      if (last.status !== 'Faltou') return
      const taxa = concluidos.filter((a) => a.status === 'Faltou').length / concluidos.length
      if (taxa > 0.4) ids.add(pacienteId)
    })
    return ids
  }, [historicoRisco, filtroCorAtivo])

  const marcadorAltoRisco = marcadores.find((m) => m.tipo === 'ALTO_RISCO_FALTA')
  const corAltoRisco = marcadorAltoRisco?.cor ?? '#EF4444'

  const marcadorConvenio = marcadores.find((m) => m.tipo === 'CONVENIO')
  const corConvenio = marcadorConvenio?.cor ?? '#3B82F6'

  const marcadorInadimplente = marcadores.find((m) => m.tipo === 'INADIMPLENTE')
  const corInadimplente = marcadorInadimplente?.cor ?? '#F97316'

  const marcadorPrimeiroAtendimento = marcadores.find((m) => m.tipo === 'PRIMEIRO_ATENDIMENTO')
  const corPrimeiroAtendimento = marcadorPrimeiroAtendimento?.cor ?? '#22C55E'

  const marcadorAniversariante = marcadores.find((m) => m.tipo === 'ANIVERSARIANTE')
  const corAniversariante = marcadorAniversariante?.cor ?? '#EC4899'

  const marcadorSala = marcadores.find((m) => m.tipo === 'SALA')
  const corSala = marcadorSala?.cor ?? '#06B6D4'

  const marcadorProfissional = marcadores.find((m) => m.tipo === 'PROFISSIONAL')
  const corProfissional = marcadorProfissional?.cor ?? '#8B5CF6'

  const hoje = new Date()
  const hojeMonth = hoje.getMonth() + 1 // 1-based
  const hojeDay   = hoje.getDate()

  /** Verifica se pacienteDataNascimento (YYYY-MM-DD) cai hoje (mesmo dia/mês) */
  function isAniversariante(dob: string | null | undefined): boolean {
    if (!dob) return false
    const [, mm, dd] = dob.split('-').map(Number)
    return mm === hojeMonth && dd === hojeDay
  }

  /** Retorna bg/border para um evento, considerando todos os filtros de cor */
  function corEvento(appt: Appointment): { bg: string; border: string } {
    if (
      filtroCorAtivo === 'Alto Risco de Falta' &&
      appt.raw.pacienteId &&
      altoRiscoPacienteIds.has(appt.raw.pacienteId)
    ) {
      return { bg: `${corAltoRisco}1A`, border: `${corAltoRisco}55` }
    }
    if (
      filtroCorAtivo === 'Convênio' &&
      appt.raw.pacientePlano &&
      appt.raw.pacientePlano.trim().toUpperCase() !== 'PARTICULAR'
    ) {
      return { bg: `${corConvenio}1A`, border: `${corConvenio}55` }
    }
    if (
      filtroCorAtivo === 'Inadimplentes' &&
      appt.raw.pacienteId &&
      inadimplenteIds.has(appt.raw.pacienteId)
    ) {
      return { bg: `${corInadimplente}1A`, border: `${corInadimplente}55` }
    }
    if (
      filtroCorAtivo === 'Primeiro Atendimento' &&
      appt.raw.pacienteSessoes === 0
    ) {
      return { bg: `${corPrimeiroAtendimento}1A`, border: `${corPrimeiroAtendimento}55` }
    }
    if (
      filtroCorAtivo === 'Aniversário' &&
      isAniversariante(appt.raw.pacienteDataNascimento)
    ) {
      return { bg: `${corAniversariante}1A`, border: `${corAniversariante}55` }
    }
    if (
      filtroCorAtivo === 'Sala' &&
      appt.raw.sala
    ) {
      return { bg: `${corSala}1A`, border: `${corSala}55` }
    }
    if (
      filtroCorAtivo === 'Profissional' &&
      appt.raw.usuarioNome
    ) {
      return { bg: `${corProfissional}1A`, border: `${corProfissional}55` }
    }
    return COR_BG[appt.cor] ?? COR_BG.purple
  }

  const closeAll = () => { setFiltrosOpen(false); setSettingsOpen(false); setProfDropdownOpen(false) }

  return (
    <div className="flex flex-col h-full" style={{ background: 'var(--d2b-bg-main)', color: 'var(--d2b-text-primary)' }} onClick={closeAll}>

      {/* ── Toolbar ──────────────────────────────────────────────────────── */}
      <div className="flex items-center justify-between px-4 py-3 border-b shrink-0 flex-wrap gap-2" style={{ background: 'var(--d2b-bg-main)', borderColor: 'var(--d2b-border)' }}>

        {/* Left */}
        <div className="flex items-center gap-2">
          {/* Profissional dropdown */}
          <div className="relative" onClick={(e) => e.stopPropagation()}>
            <button
              onClick={() => { setProfDropdownOpen((p) => !p); setFiltrosOpen(false); setSettingsOpen(false) }}
              className={`flex items-center gap-2 px-3 py-2 rounded-lg text-sm bg-[var(--d2b-bg-elevated)] border transition-colors min-w-[160px] justify-between ${
                profDropdownOpen ? 'border-[#7C4DFF]' : 'border-[var(--d2b-border-strong)] hover:border-[#7C4DFF]'
              }`}
            >
              <span className={selectedProfissional ? 'text-[var(--d2b-text-primary)]' : 'text-[var(--d2b-text-secondary)]'}>
                {selectedProfissional || 'Todos profissionais'}
              </span>
              <div className="flex items-center gap-1">
                {selectedProfissional && (
                  <span
                    role="button"
                    onClick={(e) => { e.stopPropagation(); setSelectedProfissional('') }}
                    className="text-[var(--d2b-text-muted)] hover:text-[var(--d2b-text-primary)] transition-colors"
                  >
                    <X size={12} />
                  </span>
                )}
                <ChevronDown size={13} className="text-[var(--d2b-text-muted)] shrink-0" />
              </div>
            </button>
            {profDropdownOpen && (
              <div className="absolute left-0 top-11 z-50 w-52 bg-[var(--d2b-bg-elevated)] border border-[var(--d2b-border-strong)] rounded-xl shadow-2xl overflow-hidden">
                <button
                  onClick={() => { setSelectedProfissional(''); setProfDropdownOpen(false) }}
                  className={`w-full text-left px-4 py-2.5 text-sm transition-colors hover:bg-[var(--d2b-hover)] ${
                    !selectedProfissional ? 'text-[var(--d2b-text-primary)] font-semibold' : 'text-[var(--d2b-text-secondary)]'
                  }`}
                >
                  Todos profissionais
                </button>
                {profissionais.map((p) => (
                  <button
                    key={p.id}
                    onClick={() => { setSelectedProfissional(p.nome); setProfDropdownOpen(false) }}
                    className={`w-full text-left px-4 py-2.5 text-sm transition-colors hover:bg-[var(--d2b-hover)] ${
                      selectedProfissional === p.nome ? 'text-[var(--d2b-text-primary)] font-semibold' : 'text-[var(--d2b-text-secondary)]'
                    }`}
                  >
                    {p.nome}
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* View mode */}
          <div className="flex rounded-lg border border-[var(--d2b-border-strong)] overflow-hidden">
            {(['Semana', 'Dia', 'Mês'] as const).map((mode) => (
              <button
                key={mode}
                onClick={() => setViewMode(mode)}
                className={`px-4 py-2 text-sm font-medium transition-colors ${
                  viewMode === mode
                    ? 'bg-[#7C4DFF] text-white'
                    : 'text-[var(--d2b-text-secondary)] hover:text-[var(--d2b-text-primary)] hover:bg-[var(--d2b-hover)]'
                }`}
              >
                {mode}
              </button>
            ))}
          </div>
        </div>

        {/* Center: navigation */}
        <div className="flex items-center gap-2">
          <button onClick={goBack} className="w-8 h-8 flex items-center justify-center rounded-lg text-[var(--d2b-text-secondary)] hover:text-[var(--d2b-text-primary)] hover:bg-[var(--d2b-hover)] border border-[var(--d2b-border-strong)] transition-colors">
            <ChevronLeft size={15} />
          </button>
          <span className="text-sm font-semibold text-[var(--d2b-text-secondary)] min-w-[150px] text-center select-none">{navLabel}</span>
          <button onClick={goForward} className="w-8 h-8 flex items-center justify-center rounded-lg text-[var(--d2b-text-secondary)] hover:text-[var(--d2b-text-primary)] hover:bg-[var(--d2b-hover)] border border-[var(--d2b-border-strong)] transition-colors">
            <ChevronRight size={15} />
          </button>
          <button onClick={goToday} className="px-4 py-1.5 rounded-lg text-sm font-medium text-[var(--d2b-text-secondary)] border border-[var(--d2b-border-strong)] hover:border-[#7C4DFF] hover:text-[var(--d2b-text-primary)] transition-colors">
            Hoje
          </button>
        </div>

        {/* Right: actions */}
        <div className="flex items-center gap-1.5">
          {/* Filtros de Cores (paleta) */}
          <div className="relative" onClick={(e) => e.stopPropagation()}>
            <button
              ref={filtrosBtnRef}
              onClick={() => {
                if (!filtrosOpen || filtroTab !== 'cores') {
                  setFiltrosRect(filtrosBtnRef.current?.getBoundingClientRect() ?? null)
                  setFiltroTab('cores')
                  setFiltrosOpen(true)
                } else {
                  setFiltrosOpen(false)
                }
                setSettingsOpen(false)
              }}
              className={`w-9 h-9 flex items-center justify-center rounded-lg transition-colors ${filtrosOpen && filtroTab === 'cores' ? 'bg-[var(--d2b-hover)] text-[var(--d2b-text-primary)]' : 'text-[var(--d2b-text-secondary)] hover:text-[var(--d2b-text-primary)] hover:bg-[var(--d2b-hover)]'}`}
            >
              <Palette size={18} />
            </button>
          </div>

          {/* Settings dropdown */}
          <div className="relative" onClick={(e) => e.stopPropagation()}>
            <button
              onClick={() => { setSettingsOpen((p) => !p); setFiltrosOpen(false) }}
              className={`w-9 h-9 flex items-center justify-center rounded-lg transition-colors ${settingsOpen ? 'bg-[var(--d2b-hover)] text-[var(--d2b-text-primary)]' : 'text-[var(--d2b-text-secondary)] hover:text-[var(--d2b-text-primary)] hover:bg-[var(--d2b-hover)]'}`}
            >
              <Settings size={18} />
            </button>
            {settingsOpen && (
              <div className="absolute right-0 top-11 z-50 w-52 bg-[var(--d2b-bg-elevated)] border border-[var(--d2b-border-strong)] rounded-xl shadow-2xl overflow-hidden">
                <p className="px-4 pt-3 pb-1.5 text-[10px] font-bold tracking-widest text-[#7C4DFF] uppercase">Configurações</p>
                <button
                  onClick={() => { setSettingsOpen(false); router.push('/dashboard/configuracoes?tab=agenda') }}
                  className="w-full flex items-center gap-2.5 px-4 py-2.5 text-sm text-[var(--d2b-text-secondary)] hover:bg-[var(--d2b-hover)] hover:text-[var(--d2b-text-primary)] transition-colors text-left"
                >
                  <CalendarIcon size={14} className="text-[#7C4DFF] shrink-0" />
                  Configuração de Agenda
                </button>
                <button
                  onClick={() => { setSettingsOpen(false); setSelectedBloqueio(undefined); setBloqueioClickDT(undefined); setBloqueioOpen(true) }}
                  className="w-full flex items-center gap-2.5 px-4 py-2.5 text-sm text-[var(--d2b-text-secondary)] hover:bg-[var(--d2b-hover)] hover:text-[var(--d2b-text-primary)] transition-colors text-left"
                >
                  <Lock size={14} className="text-[#7C4DFF] shrink-0" />
                  Bloqueio de Agenda
                </button>
                <div className="h-2" />
              </div>
            )}
          </div>

          {/* Filtros do Calendário */}
          <div className="relative" onClick={(e) => e.stopPropagation()}>
            <button
              ref={filtroCalBtnRef}
              onClick={() => {
                if (!filtrosOpen || filtroTab !== 'calendario') {
                  setFiltrosRect(filtroCalBtnRef.current?.getBoundingClientRect() ?? null)
                  setFiltroTab('calendario')
                  setFiltrosOpen(true)
                } else {
                  setFiltrosOpen(false)
                }
                setSettingsOpen(false)
              }}
              className={`w-9 h-9 flex items-center justify-center rounded-lg transition-colors ${filtrosOpen && filtroTab === 'calendario' ? 'bg-[var(--d2b-hover)] text-[var(--d2b-text-primary)]' : 'text-[var(--d2b-text-secondary)] hover:text-[var(--d2b-text-primary)] hover:bg-[var(--d2b-hover)]'}`}
            >
              <Filter size={18} />
            </button>
            {filtrosOpen && filtrosRect && typeof document !== 'undefined' && createPortal(
              <div
                style={{
                  position: 'fixed',
                  top: filtrosRect.bottom + 8,
                  right: window.innerWidth - filtrosRect.right,
                  zIndex: 9999,
                }}
                className="w-80 bg-[var(--d2b-bg-elevated)] border border-[var(--d2b-border-strong)] rounded-xl shadow-2xl overflow-hidden"
                onClick={(e) => e.stopPropagation()}
              >
                {/* Header */}
                <div className="px-4 pt-3 pb-2 border-b border-[var(--d2b-border)]">
                  <p className="text-[10px] font-bold tracking-widest text-[#7C4DFF] uppercase">
                    {filtroTab === 'calendario' ? 'Filtros do Calendário' : 'Filtros de Cores'}
                  </p>
                </div>

                {filtroTab === 'calendario' && (
                  <div className="p-4 space-y-3">
                    {/* Profissional */}
                    <div className="relative">
                      <label className="absolute -top-2 left-3 bg-[var(--d2b-bg-elevated)] px-1 text-[10px] text-[var(--d2b-text-muted)]">Profissional</label>
                      <select
                        value={selectedProfissional}
                        onChange={(e) => setSelectedProfissional(e.target.value)}
                        className="w-full px-3 py-2.5 rounded-lg border border-[var(--d2b-border-strong)] bg-[var(--d2b-bg-elevated)] text-sm text-[var(--d2b-text-primary)] focus:outline-none focus:border-[#7C4DFF] transition-colors"
                      >
                        <option value="">Selecione um profissional</option>
                        {profissionais.map((p) => <option key={p.id} value={p.nome}>{p.nome}</option>)}
                      </select>
                    </div>

                    {/* Especialidade */}
                    <div className="relative">
                      <label className="absolute -top-2 left-3 bg-[var(--d2b-bg-elevated)] px-1 text-[10px] text-[var(--d2b-text-muted)]">Especialidade</label>
                      <select
                        value={filtroEspecialidade}
                        onChange={(e) => setFiltroEspecialidade(e.target.value)}
                        className="w-full px-3 py-2.5 rounded-lg border border-[var(--d2b-border-strong)] bg-[var(--d2b-bg-elevated)] text-sm text-[var(--d2b-text-primary)] focus:outline-none focus:border-[#7C4DFF] transition-colors"
                      >
                        <option value="">Selecione uma especialidade</option>
                        {ESPECIALIDADES.map((e) => <option key={e}>{e}</option>)}
                      </select>
                    </div>

                    {/* Convênio */}
                    <div className="relative">
                      <label className="absolute -top-2 left-3 bg-[var(--d2b-bg-elevated)] px-1 text-[10px] text-[var(--d2b-text-muted)]">Convênio</label>
                      <select
                        value={filtroConvenio}
                        onChange={(e) => setFiltroConvenio(e.target.value)}
                        className="w-full px-3 py-2.5 rounded-lg border border-[var(--d2b-border-strong)] bg-[var(--d2b-bg-elevated)] text-sm text-[var(--d2b-text-primary)] focus:outline-none focus:border-[#7C4DFF] transition-colors"
                      >
                        <option value="">Selecione um convênio</option>
                      </select>
                    </div>

                    {/* Paciente */}
                    <div className="relative">
                      <label className="absolute -top-2 left-3 bg-[var(--d2b-bg-elevated)] px-1 text-[10px] text-[var(--d2b-text-muted)]">Paciente</label>
                      <input
                        type="text"
                        value={filtroPaciente}
                        onChange={(e) => setFiltroPaciente(e.target.value)}
                        placeholder="Busque pelo paciente"
                        className="w-full px-3 py-2.5 rounded-lg border border-[var(--d2b-border-strong)] bg-[var(--d2b-bg-elevated)] text-sm text-[var(--d2b-text-primary)] placeholder:text-[var(--d2b-text-muted)] focus:outline-none focus:border-[#7C4DFF] transition-colors"
                      />
                    </div>

                    {/* Sala */}
                    <div className="relative">
                      <label className="absolute -top-2 left-3 bg-[var(--d2b-bg-elevated)] px-1 text-[10px] text-[var(--d2b-text-muted)]">Sala</label>
                      <select
                        value={filtroSala}
                        onChange={(e) => setFiltroSala(e.target.value)}
                        className="w-full px-3 py-2.5 rounded-lg border border-[var(--d2b-border-strong)] bg-[var(--d2b-bg-elevated)] text-sm text-[var(--d2b-text-primary)] focus:outline-none focus:border-[#7C4DFF] transition-colors"
                      >
                        <option value="">Selecione uma sala</option>
                        {SALAS.map((s) => <option key={s}>{s}</option>)}
                      </select>
                    </div>

                    {/* Intervalo de Agenda */}
                    <div className="relative">
                      <label className="absolute -top-2 left-3 bg-[var(--d2b-bg-elevated)] px-1 text-[10px] text-[var(--d2b-text-muted)]">Intervalo de Agenda</label>
                      <select
                        value={filtroIntervalo}
                        onChange={(e) => setFiltroIntervalo(e.target.value)}
                        className="w-full px-3 py-2.5 rounded-lg border border-[var(--d2b-border-strong)] bg-[var(--d2b-bg-elevated)] text-sm text-[var(--d2b-text-primary)] focus:outline-none focus:border-[#7C4DFF] transition-colors"
                      >
                        <option value="15">15 minutos</option>
                        <option value="30">30 minutos</option>
                        <option value="45">45 minutos</option>
                        <option value="60">60 minutos</option>
                      </select>
                    </div>

                    {/* Preferências */}
                    <div className="pt-1 space-y-2">
                      <p className="text-[11px] font-semibold text-[var(--d2b-text-secondary)]">Preferências do Calendário</p>
                      <div className="flex items-center justify-between">
                        <span className="text-xs text-[var(--d2b-text-secondary)] flex items-center gap-1.5">
                          <CalendarIcon size={13} className="text-[var(--d2b-text-muted)]" /> Mostrar eventos desmarcados
                        </span>
                        <Toggle on={mostrarDesmarcados} set={setMostrarDesmarcados} />
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-xs text-[var(--d2b-text-secondary)] flex items-center gap-1.5">
                          <Lock size={13} className="text-[var(--d2b-text-muted)]" /> Mostrar Bloqueios
                        </span>
                        <Toggle on={mostrarBloqueios} set={setMostrarBloqueios} />
                      </div>
                    </div>

                    <button
                      onClick={() => setFiltrosOpen(false)}
                      className="w-full py-2 rounded-lg bg-[#7C4DFF] hover:bg-[#5B21B6] text-white text-sm font-bold transition-colors"
                    >
                      Filtrar
                    </button>
                  </div>
                )}

                {filtroTab === 'cores' && (
                  <div className="py-1">
                    {FILTROS_CORES.map((f) => (
                      <div key={f} className="flex items-center justify-between px-4 py-2.5 hover:bg-[var(--d2b-hover)] transition-colors">
                        <span className="flex-1 min-w-0 pr-4 text-sm text-[var(--d2b-text-secondary)] leading-snug">{f}</span>
                        <Toggle on={filtroCorAtivo === f} set={(v) => setFiltroCorAtivo(v ? f : '')} />
                      </div>
                    ))}
                  </div>
                )}
              </div>,
              document.body
            )}
          </div>

          {/* Novo Agendamento */}
          <button
            onClick={() => openCreateModal()}
            className="flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-bold text-white bg-[#7C4DFF] hover:bg-[#5B21B6] transition-colors"
          >
            <Plus size={15} />
            Novo Agendamento
          </button>
        </div>
      </div>

      {/* ── Semana / Dia View ───────────────────────────────────────────── */}
      {(viewMode === 'Semana' || viewMode === 'Dia') && (
        <div className="flex-1 overflow-y-auto overflow-x-hidden">
          <div className="flex min-h-full">

            {/* Time column */}
            <div className="flex flex-col shrink-0 w-16">
              <div className="h-12 border-b border-r shrink-0" style={{ background: 'var(--d2b-bg-main)', borderColor: 'var(--d2b-border)' }} />
              {HOURS.map((h) => (
                <div
                  key={h}
                  className="relative border-b border-r shrink-0"
                  style={{ height: CELL_H, background: 'var(--d2b-bg-main)', borderColor: 'var(--d2b-border)' }}
                >
                  <span className="absolute -top-2.5 right-2 text-[10px] text-[var(--d2b-text-muted)] select-none">
                    {String(h).padStart(2, '0')}:00
                  </span>
                </div>
              ))}
            </div>

            {/* Day columns */}
            <div className="flex flex-1 min-w-0">
              {(viewMode === 'Dia' ? [weekBase] : weekDays).map((day, di) => {
                const isToday  = isSameDay(day, today)
                const dayAppts = visibleAppointments.filter((a) => isSameDay(a.date, day))

                return (
                  <div key={di} className="flex flex-col flex-1 min-w-0 border-r last:border-r-0" style={{ borderColor: 'var(--d2b-border)' }}>

                    {/* Day header */}
                    <div
                      className="h-12 flex items-center justify-center border-b shrink-0"
                      style={{ background: isToday ? 'var(--d2b-hover)' : 'var(--d2b-bg-main)', borderColor: 'var(--d2b-border)' }}
                    >
                      {isToday ? (
                        <span className="px-3 py-1 rounded-full bg-[#7C4DFF] text-white text-xs font-bold">
                          {formatDayLabel(day)}
                        </span>
                      ) : (
                        <span className="text-xs font-semibold text-[var(--d2b-text-muted)]">
                          {formatDayLabel(day)}
                        </span>
                      )}
                    </div>

                    {/* Grid rows + events */}
                    <div className="relative flex-1">
                      {HOURS.map((h) => {
                        const dow = day.getDay()
                        const dayHours = dayHourMap[dow]
                        const isOutsideHours = dayHours
                          ? h < dayHours.open || h >= dayHours.close
                          : false
                        const baseBg = isOutsideHours
                          ? 'var(--d2b-bg-elevated)'
                          : h === 12 ? 'var(--d2b-hover)' : 'var(--d2b-bg-main)'
                        return (
                          <div
                            key={h}
                            onClick={() => !isOutsideHours && openCreateModal(toDatetimeLocal(day, h))}
                            className={`border-b transition-colors${isOutsideHours ? ' cursor-default' : ' cursor-pointer'}`}
                            style={{ height: CELL_H, background: baseBg, borderColor: 'var(--d2b-border)' }}
                            onMouseEnter={e => { if (!isOutsideHours) (e.currentTarget as HTMLElement).style.background = 'var(--d2b-hover)' }}
                            onMouseLeave={e => { if (!isOutsideHours) (e.currentTarget as HTMLElement).style.background = baseBg }}
                          />
                        )
                      })}

                      {/* Current time line */}
                      {isToday && nowMinutes >= gridStartMin && nowMinutes < GRID_END * 60 && (
                        <div
                          className="absolute left-0 right-0 z-20 pointer-events-none flex items-center"
                          style={{ top: timeLineTop }}
                        >
                          <div className="w-2.5 h-2.5 rounded-full bg-[#EF4444] shrink-0 -ml-1.5" />
                          <div className="flex-1 h-px bg-[#EF4444]" />
                        </div>
                      )}

                      {/* Appointments */}
                      {dayAppts.map((appt) => {
                        const startMin = timeToMin(appt.inicio)
                        const endMin   = timeToMin(appt.fim)
                        const top      = ((startMin - gridStartMin) / 60) * CELL_H
                        const height   = Math.max(((endMin - startMin) / 60) * CELL_H - 2, 24)
                        const isBloqueio = appt.tipo === 'BLOQUEIO'

                        if (isBloqueio) {
                          return (
                            <div
                              key={appt.id}
                              onClick={(e) => { e.stopPropagation(); setSelectedBloqueio(appt.raw); setBloqueioClickDT(undefined); setBloqueioOpen(true) }}
                              className="absolute left-1 right-1 rounded-md cursor-pointer z-10 hover:brightness-95 transition-all"
                              style={{ top, height, background: 'rgba(100,116,139,0.10)', border: '1px solid rgba(100,116,139,0.30)', backgroundImage: 'repeating-linear-gradient(45deg, transparent, transparent 4px, rgba(100,116,139,0.08) 4px, rgba(100,116,139,0.08) 8px)' }}
                            >
                              <div className="flex items-center gap-1.5 px-2 h-full">
                                <Lock size={11} className="shrink-0 text-[#64748B]" />
                                <span className="text-xs font-medium text-[#64748B] truncate">{appt.titulo || '– Bloqueio'}</span>
                                <span className="text-[10px] text-[#94A3B8] shrink-0 ml-auto">{appt.inicio} - {appt.fim}</span>
                              </div>
                            </div>
                          )
                        }

                        const isRisco = filtroCorAtivo === 'Alto Risco de Falta' && !!appt.raw.pacienteId && altoRiscoPacienteIds.has(appt.raw.pacienteId)
                        const isConvenio = filtroCorAtivo === 'Convênio' && !!appt.raw.pacientePlano && appt.raw.pacientePlano.trim().toUpperCase() !== 'PARTICULAR'
                        const isInadimplente = filtroCorAtivo === 'Inadimplentes' && !!appt.raw.pacienteId && inadimplenteIds.has(appt.raw.pacienteId)
                        const isPrimeiroAtend = filtroCorAtivo === 'Primeiro Atendimento' && appt.raw.pacienteSessoes === 0
                        const isAniversario = filtroCorAtivo === 'Aniversário' && isAniversariante(appt.raw.pacienteDataNascimento)
                        const isSalaAtiva = filtroCorAtivo === 'Sala' && !!appt.raw.sala
                        const isProfissional = filtroCorAtivo === 'Profissional' && !!appt.raw.usuarioNome
                        const { bg, border } = corEvento(appt)
                        return (
                          <div
                            key={appt.id}
                            onClick={(e) => { e.stopPropagation(); openEditModal(appt) }}
                            className="absolute left-1 right-1 rounded-md cursor-pointer overflow-hidden z-10 hover:brightness-110 transition-all"
                            style={{ top, height, background: bg, border: `1px solid ${border}` }}
                          >
                            <div className="flex items-center gap-1.5 px-2 h-full">
                              {isRisco
                                ? <span className="w-2 h-2 rounded-full shrink-0" style={{ background: corAltoRisco }} />
                                : isConvenio
                                  ? <span className="w-2 h-2 rounded-full shrink-0" style={{ background: corConvenio }} />
                                  : isInadimplente
                                    ? <span className="w-2 h-2 rounded-full shrink-0" style={{ background: corInadimplente }} />
                                    : isPrimeiroAtend
                                      ? <span className="w-2 h-2 rounded-full shrink-0" style={{ background: corPrimeiroAtendimento }} />
                                      : isAniversario
                                        ? <span className="w-2 h-2 rounded-full shrink-0" style={{ background: corAniversariante }} />
                                        : isSalaAtiva
                                          ? <span className="w-2 h-2 rounded-full shrink-0" style={{ background: corSala }} />
                                          : isProfissional
                                            ? <span className="w-2 h-2 rounded-full shrink-0" style={{ background: corProfissional }} />
                                            : <div className={`w-2 h-2 rounded-full shrink-0 ${COR_DOT[appt.cor] ?? COR_DOT.purple}`} />
                              }
                              <span className="text-xs font-medium text-[var(--d2b-text-primary)] truncate">{appt.pacienteNome}</span>
                              {isRisco && (
                                <span
                                  className="shrink-0 text-[9px] font-bold px-1 rounded"
                                  style={{ background: corAltoRisco, color: '#fff' }}
                                  title="Alto Risco de Falta"
                                >⚠</span>
                              )}
                              {isConvenio && (
                                <span
                                  className="shrink-0 text-[9px] font-bold px-1 rounded truncate max-w-[60px]"
                                  style={{ background: corConvenio, color: '#fff' }}
                                  title={`Convênio: ${appt.raw.pacientePlano}`}
                                >{appt.raw.pacientePlano}</span>
                              )}
                              {isInadimplente && (
                                <span
                                  className="shrink-0 text-[9px] font-bold px-1 rounded"
                                  style={{ background: corInadimplente, color: '#fff' }}
                                  title="Inadimplente"
                                >$</span>
                              )}
                              {isPrimeiroAtend && (
                                <span
                                  className="shrink-0 text-[9px] font-bold px-1 rounded"
                                  style={{ background: corPrimeiroAtendimento, color: '#fff' }}
                                  title="Primeiro Atendimento"
                                >1º</span>
                              )}
                              {isAniversario && (
                                <span
                                  className="shrink-0 text-[9px] font-bold px-1 rounded"
                                  style={{ background: corAniversariante, color: '#fff' }}
                                  title="Aniversário"
                                >🎂</span>
                              )}
                              {isSalaAtiva && (
                                <span
                                  className="shrink-0 text-[9px] font-bold px-1 rounded truncate max-w-[60px]"
                                  style={{ background: corSala, color: '#fff' }}
                                  title={`Sala: ${appt.raw.sala}`}
                                >{appt.raw.sala}</span>
                              )}
                              {isProfissional && (
                                <span
                                  className="shrink-0 text-[9px] font-bold px-1 rounded truncate max-w-[60px]"
                                  style={{ background: corProfissional, color: '#fff' }}
                                  title={`Profissional: ${appt.raw.usuarioNome}`}
                                >{appt.raw.usuarioNome}</span>
                              )}
                              <span className="text-[10px] text-[var(--d2b-text-secondary)] shrink-0 ml-auto">{appt.inicio} - {appt.fim}</span>
                            </div>
                          </div>
                        )
                      })}
                    </div>
                  </div>
                )
              })}
            </div>
          </div>
        </div>
      )}

      {/* ── Mês View ────────────────────────────────────────────────────── */}
      {viewMode === 'Mês' && (
        <div className="flex-1 overflow-y-auto overflow-x-hidden">
          {/* Day-of-week header */}
          <div className="grid grid-cols-7 border-b sticky top-0 z-10" style={{ background: 'var(--d2b-bg-main)', borderColor: 'var(--d2b-border)' }}>
            {['Dom','Seg','Ter','Qua','Qui','Sex','Sáb'].map((d) => (
              <div key={d} className="h-10 flex items-center justify-center text-[10px] font-bold tracking-widest text-[var(--d2b-text-muted)] uppercase">
                {d}
              </div>
            ))}
          </div>
          {/* Weeks */}
          {getMonthGrid(weekBase).map((week, wi) => (
            <div key={wi} className="grid grid-cols-7 border-b border-[var(--d2b-border)]" style={{ minHeight: 110 }}>
              {week.map((day, di) => {
                const isCurrentMonth = day.getMonth() === weekBase.getMonth()
                const isToday = isSameDay(day, today)
                const dayAppts = visibleAppointments.filter((a) => isSameDay(a.date, day))
                return (
                  <div
                    key={di}
                    onClick={() => { setWeekBase(new Date(day)); setViewMode('Dia') }}
                    className={`p-1.5 border-r border-[var(--d2b-border)] last:border-r-0 cursor-pointer transition-colors overflow-hidden ${
                      isCurrentMonth ? 'hover:bg-[var(--d2b-hover)]' : 'opacity-30'
                    } ${isToday ? 'bg-[var(--d2b-hover)]' : ''}`}
                  >
                    <div className="flex items-center justify-between mb-1">
                      <span className={`text-xs font-bold w-6 h-6 flex items-center justify-center rounded-full ${
                        isToday ? 'bg-[#7C4DFF] text-white' : 'text-[var(--d2b-text-secondary)]'
                      }`}>
                        {day.getDate()}
                      </span>
                      {dayAppts.length > 3 && (
                        <span className="text-[9px] text-[var(--d2b-text-muted)]">+{dayAppts.length - 3}</span>
                      )}
                    </div>
                    <div className="space-y-0.5">
                      {dayAppts.slice(0, 3).map((appt) => {
                        const isRisco = filtroCorAtivo === 'Alto Risco de Falta' && !!appt.raw.pacienteId && altoRiscoPacienteIds.has(appt.raw.pacienteId)
                        const isConvenio = filtroCorAtivo === 'Convênio' && !!appt.raw.pacientePlano && appt.raw.pacientePlano.trim().toUpperCase() !== 'PARTICULAR'
                        const isInadimplente = filtroCorAtivo === 'Inadimplentes' && !!appt.raw.pacienteId && inadimplenteIds.has(appt.raw.pacienteId)
                        const isPrimeiroAtend = filtroCorAtivo === 'Primeiro Atendimento' && appt.raw.pacienteSessoes === 0
                        const isAniversario = filtroCorAtivo === 'Aniversário' && isAniversariante(appt.raw.pacienteDataNascimento)
                        const isSalaAtiva = filtroCorAtivo === 'Sala' && !!appt.raw.sala
                        const isProfissional = filtroCorAtivo === 'Profissional' && !!appt.raw.usuarioNome
                        const { bg, border } = corEvento(appt)
                        return (
                          <div
                            key={appt.id}
                            onClick={(e) => { e.stopPropagation(); openEditModal(appt) }}
                            className="w-full rounded px-1 py-0.5 text-[10px] text-[var(--d2b-text-primary)] truncate flex items-center gap-1"
                            style={{ background: bg, border: `1px solid ${border}` }}
                          >
                            {isRisco && (
                              <span className="shrink-0 font-bold" style={{ color: corAltoRisco }} title="Alto Risco de Falta">⚠</span>
                            )}
                            {isConvenio && (
                              <span className="shrink-0 w-1.5 h-1.5 rounded-full" style={{ background: corConvenio }} title={`Convênio: ${appt.raw.pacientePlano}`} />
                            )}
                            {isInadimplente && (
                              <span className="shrink-0 font-bold" style={{ color: corInadimplente }} title="Inadimplente">$</span>
                            )}
                            {isPrimeiroAtend && (
                              <span className="shrink-0 font-bold" style={{ color: corPrimeiroAtendimento }} title="Primeiro Atendimento">1º</span>
                            )}
                            {isAniversario && (
                              <span className="shrink-0" title="Aniversário">🎂</span>
                            )}
                            {isSalaAtiva && (
                              <span className="shrink-0 w-1.5 h-1.5 rounded-full" style={{ background: corSala }} title={`Sala: ${appt.raw.sala}`} />
                            )}
                            {isProfissional && (
                              <span className="shrink-0 font-bold text-[9px]" style={{ color: corProfissional }} title={`Profissional: ${appt.raw.usuarioNome}`}>{appt.raw.usuarioNome}</span>
                            )}
                            {appt.inicio} {appt.pacienteNome}
                          </div>
                        )
                      })}
                    </div>
                  </div>
                )
              })}
            </div>
          ))}
        </div>
      )}

      {/* ── Scroll buttons ───────────────────────────────────────────────── */}
      <div className="relative flex justify-center gap-3 py-1.5 border-t shrink-0" style={{ background: 'var(--d2b-bg-main)', borderColor: 'var(--d2b-border)' }}>
        <button
          onClick={() => document.querySelector('.flex-1.overflow-y-auto')?.scrollBy({ top: -120, behavior: 'smooth' })}
          className="w-8 h-6 flex items-center justify-center rounded text-[var(--d2b-text-secondary)] hover:text-[var(--d2b-text-primary)] hover:bg-[var(--d2b-hover)] transition-colors text-xs"
        >
          ∧
        </button>
        <button
          onClick={() => document.querySelector('.flex-1.overflow-y-auto')?.scrollBy({ top: 120, behavior: 'smooth' })}
          className="w-8 h-6 flex items-center justify-center rounded text-[var(--d2b-text-secondary)] hover:text-[var(--d2b-text-primary)] hover:bg-[var(--d2b-hover)] transition-colors text-xs"
        >
          ∨
        </button>

        {/* ── Projeção financeira ──────────────────────────────── */}
        {projecao && (
          <div className="absolute right-4 bottom-1 flex items-end gap-3 pointer-events-none select-none">
            <div className="text-right">
              <p className="text-[9px] font-semibold uppercase tracking-widest" style={{ color: 'rgba(124,77,255,0.5)' }}>Atendido</p>
              <p className="font-bold leading-none tabular-nums" style={{ fontSize: '1.6rem', color: 'rgba(124,77,255,0.35)' }}>
                {projecao.atendido.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
              </p>
            </div>
            <div className="text-right">
              <p className="text-[9px] font-semibold uppercase tracking-widest" style={{ color: 'rgba(124,77,255,0.7)' }}>Previsto</p>
              <p className="font-bold leading-none tabular-nums" style={{ fontSize: '2.2rem', color: 'rgba(124,77,255,0.55)' }}>
                {projecao.aguardando.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
              </p>
            </div>
          </div>
        )}
      </div>

      <NovoAgendamentoModal
        open={novoOpen}
        onClose={closeModal}
        defaultInicio={clickDT?.inicio}
        defaultFim={clickDT?.fim}
        empresaId={empresaId}
        profissionaisApi={profissionais}
        agendamento={selectedAgendamento}
        onSaved={fetchAppointments}
      />

      <BloqueioModal
        open={bloqueioOpen}
        onClose={() => { setBloqueioOpen(false); setSelectedBloqueio(undefined); setBloqueioClickDT(undefined) }}
        empresaId={empresaId}
        profissionaisApi={profissionais}
        bloqueio={selectedBloqueio}
        defaultInicio={bloqueioClickDT?.inicio}
        defaultFim={bloqueioClickDT?.fim}
        onSaved={fetchAppointments}
      />
    </div>
  )
}

// ─── BloqueioModal ────────────────────────────────────────────────────────────
function BloqueioModal({
  open, onClose, empresaId, profissionaisApi, bloqueio, defaultInicio, defaultFim, onSaved,
}: {
  open: boolean
  onClose: () => void
  empresaId: string | null
  profissionaisApi: Profissional[]
  bloqueio?: ApiAgendamento
  defaultInicio?: string
  defaultFim?: string
  onSaved: () => void
}) {
  const isViewing = !!bloqueio
  const [editMode, setEditMode]     = useState(false)
  const [saving, setSaving]         = useState(false)
  const [deleting, setDeleting]     = useState(false)
  const [confirmDel, setConfirmDel] = useState(false)
  const [calOpen, setCalOpen]       = useState(false)

  const [titulo, setTitulo]         = useState('')
  const [usuarioId, setUsuarioId]   = useState('')
  const [dia, setDia]               = useState<Date | undefined>(undefined)
  const [horaInicio, setHoraInicio] = useState('08:00')
  const [horaFim, setHoraFim]       = useState('09:00')
  const [recorrente, setRecorrente] = useState(false)

  function isoToTimeParts(iso: string): { date: Date; hhmm: string } {
    const d = new Date(iso)
    const pad = (n: number) => String(n).padStart(2, '0')
    return { date: d, hhmm: `${pad(d.getHours())}:${pad(d.getMinutes())}` }
  }

  // Populate fields when opening
  useEffect(() => {
    if (!open) { setEditMode(false); setConfirmDel(false); return }
    if (bloqueio) {
      setTitulo(bloqueio.titulo ?? '')
      setUsuarioId(bloqueio.usuarioId ?? '')
      const { date, hhmm } = isoToTimeParts(bloqueio.inicio)
      setDia(date)
      setHoraInicio(hhmm)
      setHoraFim(isoToTimeParts(bloqueio.fim).hhmm)
      setRecorrente(bloqueio.recorrente ?? false)
    } else {
      setTitulo('')
      setUsuarioId(profissionaisApi[0]?.id ?? '')
      if (defaultInicio) {
        const { date, hhmm } = isoToTimeParts(defaultInicio)
        setDia(date)
        setHoraInicio(hhmm)
      } else {
        setDia(new Date())
        setHoraInicio('08:00')
      }
      if (defaultFim) setHoraFim(isoToTimeParts(defaultFim).hhmm)
      else setHoraFim('09:00')
      setRecorrente(false)
    }
  }, [open, bloqueio, defaultInicio, defaultFim, profissionaisApi])

  function buildISO(date: Date | undefined, hhmm: string): string {
    if (!date) return ''
    const [h, m] = hhmm.split(':').map(Number)
    return new Date(date.getFullYear(), date.getMonth(), date.getDate(), h, m).toISOString()
  }

  function formatDisplay(iso: string) {
    try {
      const d = new Date(iso)
      if (isNaN(d.getTime())) return iso
      return d.toLocaleDateString('pt-BR') + ' ' + d.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })
    } catch { return iso }
  }

  function formatDia(d: Date | undefined) {
    if (!d) return 'Selecionar data'
    return d.toLocaleDateString('pt-BR', { weekday: 'short', day: '2-digit', month: '2-digit', year: 'numeric' })
  }

  async function salvar() {
    if (!empresaId || !dia) return
    setSaving(true)
    try {
      const body = {
        empresaId,
        tipo: 'BLOQUEIO',
        titulo: titulo || null,
        usuarioId: usuarioId || null,
        inicio: buildISO(dia, horaInicio),
        fim: buildISO(dia, horaFim),
        recorrente,
      }
      const url = `${process.env.NEXT_PUBLIC_API_URL}/api/v1/agendamentos${bloqueio && editMode ? `/${bloqueio.id}` : ''}`
      const method = bloqueio && editMode ? 'PATCH' : 'POST'
      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      })
      if (!res.ok) throw new Error()
      onSaved()
      onClose()
    } finally {
      setSaving(false)
    }
  }

  async function excluir() {
    if (!bloqueio) return
    setDeleting(true)
    try {
      await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/v1/agendamentos/${bloqueio.id}`, { method: 'DELETE' })
      onSaved()
      onClose()
    } finally {
      setDeleting(false)
      setConfirmDel(false)
    }
  }

  const profNome = profissionaisApi.find(p => p.id === (bloqueio?.usuarioId ?? usuarioId))?.nome
    ?? bloqueio?.usuarioNome
    ?? 'Todos os profissionais'

  if (!open) return null

  return (
    <Dialog open={open} onOpenChange={(v) => { if (!v) onClose() }}>
      <DialogContent
        showCloseButton={false}
        className="bg-white border border-[#EDE8F5] text-[#2D1B5A] !max-w-lg p-0 gap-0 rounded-2xl overflow-hidden"
      >
        {/* Header */}
        <DialogHeader className="flex-row items-center justify-between px-6 py-4 border-b border-[#EDE8F5] space-y-0">
          <DialogTitle className="text-base font-bold text-[#2D1B5A] flex items-center gap-2">
            <Lock size={16} className="text-[#7C4DFF]" />
            {isViewing && !editMode ? 'Bloqueio Agenda' : bloqueio ? 'Editar Bloqueio' : 'Bloquear Agenda'}
          </DialogTitle>
          <button onClick={onClose} className="w-7 h-7 rounded-md flex items-center justify-center text-[#9E8BBF] hover:text-[#2D1B5A] hover:bg-[#F3F0FA] transition-colors text-lg leading-none">✕</button>
        </DialogHeader>

        <div className="px-6 py-5 space-y-4">
          {/* VIEW mode */}
          {isViewing && !editMode ? (
            <div className="space-y-3">
              <div className="grid grid-cols-2 gap-x-6 gap-y-3">
                <div>
                  <p className="text-[10px] font-bold tracking-widest uppercase text-[#9E8BBF] mb-0.5">Profissional</p>
                  <p className="text-sm font-semibold text-[#2D1B5A]">{profNome}</p>
                  <div className="border-b border-dashed border-[#D8D0ED] mt-1.5" />
                </div>
                <div>
                  <p className="text-[10px] font-bold tracking-widest uppercase text-[#9E8BBF] mb-0.5">Título</p>
                  <p className="text-sm font-semibold text-[#2D1B5A]">{bloqueio?.titulo || '–'}</p>
                  <div className="border-b border-dashed border-[#D8D0ED] mt-1.5" />
                </div>
                <div>
                  <p className="text-[10px] font-bold tracking-widest uppercase text-[#9E8BBF] mb-0.5">Início</p>
                  <p className="text-sm text-[#2D1B5A]">{formatDisplay(bloqueio?.inicio ?? '')}</p>
                  <div className="border-b border-dashed border-[#D8D0ED] mt-1.5" />
                </div>
                <div>
                  <p className="text-[10px] font-bold tracking-widest uppercase text-[#9E8BBF] mb-0.5">Fim</p>
                  <p className="text-sm text-[#2D1B5A]">{formatDisplay(bloqueio?.fim ?? '')}</p>
                  <div className="border-b border-dashed border-[#D8D0ED] mt-1.5" />
                </div>
              </div>
            </div>
          ) : (
            /* CRIAR / EDITAR form */
            <div className="space-y-4">
              {/* Profissional */}
              <div className="relative">
                <label className="absolute -top-2 left-3 z-10 bg-white px-1 text-[10px] font-medium text-[#9E8BBF]">Profissional</label>
                <div className="relative">
                  <select
                    value={usuarioId}
                    onChange={e => setUsuarioId(e.target.value)}
                    className="w-full rounded-lg border border-[#D8D0ED] bg-white px-3 py-2.5 text-sm text-[#2D1B5A] focus:outline-none focus:border-[#7C4DFF] appearance-none pr-8"
                  >
                    <option value="">Toda a clínica</option>
                    {profissionaisApi.map(p => (
                      <option key={p.id} value={p.id}>{p.nome}</option>
                    ))}
                  </select>
                  <ChevronDown size={14} className="absolute right-3 top-1/2 -translate-y-1/2 text-[#9E8BBF] pointer-events-none" />
                </div>
              </div>

              {/* Título */}
              <div className="relative">
                <label className="absolute -top-2 left-3 z-10 bg-white px-1 text-[10px] font-medium text-[#9E8BBF]">Título do Bloqueio</label>
                <input
                  value={titulo}
                  onChange={e => setTitulo(e.target.value)}
                  placeholder="Ex: Almoço, Reunião, Férias..."
                  className="w-full rounded-lg border border-[#D8D0ED] px-3 py-2.5 text-sm text-[#2D1B5A] placeholder:text-[#C4B9DC] focus:outline-none focus:border-[#7C4DFF]"
                />
              </div>

              {/* Data (compartilhada) */}
              <div className="relative">
                <label className="absolute -top-2 left-3 z-10 bg-white px-1 text-[10px] font-medium text-[#9E8BBF]">Data do Bloqueio*</label>
                <Popover open={calOpen} onOpenChange={setCalOpen}>
                  <PopoverTrigger asChild>
                    <button
                      type="button"
                      className="w-full flex items-center justify-between rounded-lg border border-[#D8D0ED] px-3 py-2.5 text-sm text-left focus:outline-none focus:border-[#7C4DFF] hover:border-[#7C4DFF] transition-colors"
                    >
                      <span className={dia ? 'text-[#2D1B5A]' : 'text-[#C4B9DC]'}>{formatDia(dia)}</span>
                      <CalendarIcon size={15} className="text-[#9E8BBF] shrink-0" />
                    </button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0 border border-[#EDE8F5] shadow-xl" align="start">
                    <Calendar
                      mode="single"
                      selected={dia}
                      onSelect={(d) => { setDia(d); setCalOpen(false) }}
                      initialFocus
                    />
                  </PopoverContent>
                </Popover>
              </div>

              {/* Horários */}
              <div className="grid grid-cols-2 gap-3">
                <div className="relative">
                  <label className="absolute -top-2 left-3 z-10 bg-white px-1 text-[10px] font-medium text-[#9E8BBF]">Hora Início*</label>
                  <input
                    type="time"
                    value={horaInicio}
                    onChange={e => setHoraInicio(e.target.value)}
                    className="w-full rounded-lg border border-[#D8D0ED] px-3 py-2.5 text-sm text-[#2D1B5A] focus:outline-none focus:border-[#7C4DFF]"
                  />
                </div>
                <div className="relative">
                  <label className="absolute -top-2 left-3 z-10 bg-white px-1 text-[10px] font-medium text-[#9E8BBF]">Hora Fim*</label>
                  <input
                    type="time"
                    value={horaFim}
                    onChange={e => setHoraFim(e.target.value)}
                    className="w-full rounded-lg border border-[#D8D0ED] px-3 py-2.5 text-sm text-[#2D1B5A] focus:outline-none focus:border-[#7C4DFF]"
                  />
                </div>
              </div>

              {/* Recorrente */}
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={recorrente}
                  onChange={e => setRecorrente(e.target.checked)}
                  className="w-4 h-4 accent-[#7C4DFF]"
                />
                <span className="text-sm text-[#2D1B5A]">É um evento recorrente?</span>
              </label>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between px-6 py-4 border-t border-[#EDE8F5]">
          {isViewing && !editMode ? (
            <>
              {confirmDel ? (
                <div className="flex items-center gap-2">
                  <span className="text-xs text-[#EF4444]">Confirmar exclusão?</span>
                  <button onClick={excluir} disabled={deleting} className="px-3 py-1.5 rounded-lg text-xs font-semibold bg-[#EF4444] text-white hover:bg-red-600 transition-colors">
                    {deleting ? '...' : 'Sim, excluir'}
                  </button>
                  <button onClick={() => setConfirmDel(false)} className="px-3 py-1.5 rounded-lg text-xs font-semibold border border-[#D8D0ED] text-[#2D1B5A] hover:bg-[#F3F0FA] transition-colors">
                    Cancelar
                  </button>
                </div>
              ) : (
                <button onClick={() => setConfirmDel(true)} className="px-4 py-2 rounded-lg text-sm font-semibold bg-[#FEE2E2] text-[#EF4444] hover:bg-red-100 transition-colors">
                  Excluir Bloqueio
                </button>
              )}
              <div className="flex gap-2">
                <button onClick={onClose} className="px-4 py-2 rounded-lg text-sm font-semibold border border-[#D8D0ED] text-[#2D1B5A] hover:bg-[#F3F0FA] transition-colors">
                  Fechar
                </button>
                <button onClick={() => setEditMode(true)} className="px-4 py-2 rounded-lg text-sm font-bold text-white bg-[#7C4DFF] hover:bg-[#5B21B6] transition-colors">
                  Editar
                </button>
              </div>
            </>
          ) : (
            <>
              <div />
              <div className="flex gap-2">
                <button onClick={onClose} className="px-4 py-2 rounded-lg text-sm font-semibold border border-[#D8D0ED] text-[#2D1B5A] hover:bg-[#F3F0FA] transition-colors">
                  Cancelar
                </button>
                <button onClick={salvar} disabled={saving || !dia} className="px-4 py-2 rounded-lg text-sm font-bold text-white bg-[#7C4DFF] hover:bg-[#5B21B6] disabled:opacity-50 transition-colors">
                  {saving ? 'Salvando...' : 'Cadastrar Bloqueio'}
                </button>
              </div>
            </>
          )}
        </div>
      </DialogContent>
    </Dialog>
  )
}
