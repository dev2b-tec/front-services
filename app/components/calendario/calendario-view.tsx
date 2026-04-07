'use client'

import { useState, useEffect, useCallback, useRef } from 'react'
import { useRouter } from 'next/navigation'
import {
  ChevronDown, ChevronLeft, ChevronRight, Plus,
  Filter, Globe, Settings, Lock, Search, X, RefreshCw, CalendarIcon, Trash2, MessageCircle, Pencil, Check,
} from 'lucide-react'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { SistemaMensagensModal } from '@/components/mensagens/sistema-mensagens-modal'

// ─── Constants ────────────────────────────────────────────────────────────────
const CELL_H = 64 // px per hour
const GRID_START = 6
const GRID_END = 22
const HOURS = Array.from({ length: GRID_END - GRID_START }, (_, i) => i + GRID_START)

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
}

type Appointment = {
  id: string
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

function getWeekDays(base: Date): Date[] {
  const d = base.getDay()
  const monday = new Date(base)
  monday.setDate(base.getDate() + (d === 0 ? -6 : 1 - d))
  return Array.from({ length: 5 }, (_, i) => {
    const x = new Date(monday)
    x.setDate(monday.getDate() + i)
    return x
  })
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
      onClick={() => set(!on)}
      className={`relative w-10 h-5 rounded-full transition-colors shrink-0 ${on ? 'bg-[#7C4DFF]' : 'bg-[var(--d2b-bg-elevated)]'}`}
    >
      <span className={`absolute top-0.5 w-4 h-4 rounded-full bg-white shadow transition-transform ${on ? 'translate-x-5' : 'translate-x-0.5'}`} />
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
  const [recorrente, setRecorrente] = useState(false)
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
      setSala(''); setRecorrente(false); setObservacoes(''); setStatus('Aguardando')
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
      sala: sala || null, recorrente, observacoes: observacoes || null,
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
                <button className="flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-semibold bg-[var(--d2b-hover)] text-[#C084FC] border border-[var(--d2b-border-strong)] hover:bg-[var(--d2b-hover)] transition-colors">
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
                  <div className="flex items-center gap-3">
                    <Toggle on={recorrente} set={setRecorrente} />
                    <span className="text-sm text-[var(--d2b-text-secondary)]">É um evento recorrente?</span>
                  </div>
                )}
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
}: {
  empresaId: string | null
  profissionais: Profissional[]
}) {
  const [weekBase, setWeekBase]     = useState(new Date())
  const [viewMode, setViewMode]     = useState<ViewMode>('Semana')
  const [novoOpen, setNovoOpen]     = useState(false)
  const [clickDT, setClickDT]       = useState<{ inicio: string; fim: string } | undefined>()
  const [filtrosOpen, setFiltrosOpen]   = useState(false)
  const [settingsOpen, setSettingsOpen] = useState(false)
  const [filtros, setFiltros]           = useState<Record<string, boolean>>({})
  const [now, setNow]               = useState(new Date())

  const [appointments, setAppointments]               = useState<Appointment[]>([])
  const [selectedAgendamento, setSelectedAgendamento] = useState<ApiAgendamento | undefined>()
  const [selectedProfissional, setSelectedProfissional] = useState('')
  const [profDropdownOpen, setProfDropdownOpen]         = useState(false)

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
        const days = getWeekDays(weekBase)
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

  // ── Navigation ──────────────────────────────────────────────────────────
  const today    = new Date()
  const weekDays = getWeekDays(weekBase)

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
      : (() => { const d = getWeekDays(weekBase); return `${pad2(d[0].getDate())}/${pad2(d[0].getMonth()+1)} – ${pad2(d[d.length-1].getDate())}/${pad2(d[d.length-1].getMonth()+1)}` })()

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
          {/* Timezone */}
          <button className="w-9 h-9 flex items-center justify-center rounded-lg text-[var(--d2b-text-secondary)] hover:text-[var(--d2b-text-primary)] hover:bg-[var(--d2b-hover)] transition-colors">
            <Globe size={18} />
          </button>

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
                {[
                  { label: 'Configuração de Agenda', icon: CalendarIcon },
                  { label: 'Bloqueio de Agenda',     icon: Lock },
                ].map(({ label, icon: Icon }) => (
                  <button key={label} className="w-full flex items-center gap-2.5 px-4 py-2.5 text-sm text-[var(--d2b-text-secondary)] hover:bg-[var(--d2b-hover)] hover:text-[var(--d2b-text-primary)] transition-colors text-left">
                    <Icon size={14} className="text-[#7C4DFF] shrink-0" />
                    {label}
                  </button>
                ))}
                <div className="h-2" />
              </div>
            )}
          </div>

          {/* Filtros de Cores */}
          <div className="relative" onClick={(e) => e.stopPropagation()}>
            <button
              onClick={() => { setFiltrosOpen((p) => !p); setSettingsOpen(false) }}
              className={`w-9 h-9 flex items-center justify-center rounded-lg transition-colors ${filtrosOpen ? 'bg-[var(--d2b-hover)] text-[var(--d2b-text-primary)]' : 'text-[var(--d2b-text-secondary)] hover:text-[var(--d2b-text-primary)] hover:bg-[var(--d2b-hover)]'}`}
            >
              <Filter size={18} />
            </button>
            {filtrosOpen && (
              <div className="absolute right-0 top-11 z-50 w-64 bg-[var(--d2b-bg-elevated)] border border-[var(--d2b-border-strong)] rounded-xl shadow-2xl overflow-hidden">
                <div className="flex items-center justify-between px-4 pt-3 pb-2 border-b border-[var(--d2b-border)]">
                  <p className="text-[10px] font-bold tracking-widest text-[#7C4DFF] uppercase">Filtros de Cores</p>
                  <Lock size={13} className="text-[var(--d2b-text-muted)]" />
                </div>
                <div className="py-1">
                  {FILTROS_CORES.map((f) => (
                    <label key={f} className="flex items-center justify-between px-4 py-2.5 cursor-pointer hover:bg-[var(--d2b-hover)] transition-colors">
                      <span className="text-sm text-[var(--d2b-text-secondary)]">{f}</span>
                      <Toggle on={filtros[f] ?? false} set={(v) => setFiltros((p) => ({ ...p, [f]: v }))} />
                    </label>
                  ))}
                </div>
              </div>
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
                      {HOURS.map((h) => (
                        <div
                          key={h}
                          onClick={() => openCreateModal(toDatetimeLocal(day, h))}
                          className="border-b cursor-pointer transition-colors"
                          style={{ height: CELL_H, background: h === 12 ? 'var(--d2b-hover)' : 'var(--d2b-bg-main)', borderColor: 'var(--d2b-border)' }}
                          onMouseEnter={e => (e.currentTarget as HTMLElement).style.background = 'var(--d2b-hover)'}
                          onMouseLeave={e => (e.currentTarget as HTMLElement).style.background = h === 12 ? 'var(--d2b-hover)' : 'var(--d2b-bg-main)'}
                        />
                      ))}

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
                        const { bg, border } = COR_BG[appt.cor] ?? COR_BG.purple

                        return (
                          <div
                            key={appt.id}
                            onClick={(e) => { e.stopPropagation(); openEditModal(appt) }}
                            className="absolute left-1 right-1 rounded-md cursor-pointer overflow-hidden z-10 hover:brightness-110 transition-all"
                            style={{ top, height, background: bg, border: `1px solid ${border}` }}
                          >
                            <div className="flex items-center gap-1.5 px-2 h-full">
                              <div className={`w-2 h-2 rounded-full shrink-0 ${COR_DOT[appt.cor] ?? COR_DOT.purple}`} />
                              <span className="text-xs font-medium text-[var(--d2b-text-primary)] truncate">{appt.pacienteNome}</span>
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
                        const { bg, border } = COR_BG[appt.cor] ?? COR_BG.purple
                        return (
                          <div
                            key={appt.id}
                            onClick={(e) => { e.stopPropagation(); openEditModal(appt) }}
                            className="w-full rounded px-1 py-0.5 text-[10px] text-[var(--d2b-text-primary)] truncate"
                            style={{ background: bg, border: `1px solid ${border}` }}
                          >
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
      <div className="flex justify-center gap-3 py-1.5 border-t shrink-0" style={{ background: 'var(--d2b-bg-main)', borderColor: 'var(--d2b-border)' }}>
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
    </div>
  )
}
