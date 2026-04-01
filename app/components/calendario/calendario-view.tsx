'use client'

import { useState, useEffect } from 'react'
import {
  ChevronDown, ChevronLeft, ChevronRight, Plus,
  Filter, Globe, Settings, Lock, Search, X, RefreshCw, CalendarIcon,
} from 'lucide-react'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'

// ─── Constants ────────────────────────────────────────────────────────────────
const CELL_H = 64 // px per hour
const GRID_START = 6
const GRID_END = 22
const HOURS = Array.from({ length: GRID_END - GRID_START }, (_, i) => i + GRID_START)

const PROFISSIONAIS = ['JESSE DOS SANTOS BEZERRA', 'DR. CARLOS SILVA', 'DRA. MARIA SANTOS']
const ESPECIALIDADES = ['Dentista', 'Médico', 'Psicólogo', 'Fisioterapeuta']
const TURNOS = ['Manhã', 'Tarde', 'Noite', 'Integral']
const SALAS = ['Sala 1', 'Sala 2', 'Sala 3']
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
type Appointment = {
  id: string
  paciente: string
  inicio: string
  fim: string
  date: Date
  cor: 'green' | 'red' | 'teal' | 'purple'
}

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

// ─── Shared styles ────────────────────────────────────────────────────────────
const INP =
  'w-full bg-[#150830] border border-[rgba(124,77,255,0.25)] rounded-md ' +
  'px-3 py-2.5 text-sm text-[#F5F0FF] placeholder:text-[#6B4E8A] ' +
  'focus:outline-none focus:border-[#7C4DFF] transition-colors'

// ─── FloatingField ────────────────────────────────────────────────────────────
function FloatingField({
  label, required, children,
}: {
  label: string; required?: boolean; children: React.ReactNode
}) {
  return (
    <div className="relative">
      <label className="absolute -top-2 left-3 z-10 bg-[#1A0A38] px-1 text-[10px] font-medium text-[#A78BCC] leading-none">
        {label}{required && <span className="text-[#7C4DFF] ml-0.5">*</span>}
      </label>
      {children}
    </div>
  )
}

// ─── FloatingSelect ───────────────────────────────────────────────────────────
function FloatingSelect({
  label, required, options, placeholder, value, onChange, onClear,
}: {
  label: string; required?: boolean; options: string[]; placeholder?: string
  value?: string; onChange?: (v: string) => void; onClear?: () => void
}) {
  return (
    <FloatingField label={label} required={required}>
      <div className="relative">
        <select
          value={value ?? ''}
          onChange={(e) => onChange?.(e.target.value)}
          className={INP + ' appearance-none pr-8 cursor-pointer'}
        >
          <option value="" disabled>{placeholder ?? 'Selecione'}</option>
          {options.map((o) => <option key={o} value={o}>{o}</option>)}
        </select>
        {value && onClear && (
          <button type="button" onClick={onClear} className="absolute right-7 top-1/2 -translate-y-1/2 text-[#6B4E8A] hover:text-[#F5F0FF] transition-colors z-10">
            <X size={12} />
          </button>
        )}
        <ChevronDown size={13} className="absolute right-3 top-1/2 -translate-y-1/2 text-[#A78BCC] pointer-events-none" />
      </div>
    </FloatingField>
  )
}

// ─── Toggle ───────────────────────────────────────────────────────────────────
function Toggle({ on, set }: { on: boolean; set: (v: boolean) => void }) {
  return (
    <button
      type="button"
      onClick={() => set(!on)}
      className={`relative w-10 h-5 rounded-full transition-colors shrink-0 ${on ? 'bg-[#7C4DFF]' : 'bg-[#2D1B4E]'}`}
    >
      <span className={`absolute top-0.5 w-4 h-4 rounded-full bg-white shadow transition-transform ${on ? 'translate-x-5' : 'translate-x-0.5'}`} />
    </button>
  )
}

// ─── BuscaAvancadaModal ───────────────────────────────────────────────────────
function BuscaAvancadaModal({ open, onClose }: { open: boolean; onClose: () => void }) {
  const [esp, setEsp] = useState('')
  const [prof, setProf] = useState('')
  const [turno, setTurno] = useState('')
  const today = new Date().toISOString().split('T')[0]

  return (
    <Dialog open={open} onOpenChange={(v: boolean) => { if (!v) onClose() }}>
      <DialogContent
        showCloseButton={false}
        className="bg-[#1A0A38] border border-[rgba(124,77,255,0.30)] text-[#F5F0FF] !max-w-2xl p-0 gap-0 overflow-hidden"
      >
        <DialogHeader className="flex-row items-center justify-between px-6 py-4 border-b border-[rgba(124,77,255,0.18)] space-y-0">
          <DialogTitle className="text-base font-bold text-[#F5F0FF]">Busca Avançada</DialogTitle>
          <button onClick={onClose} className="w-7 h-7 rounded-md flex items-center justify-center text-[#A78BCC] hover:text-[#F5F0FF] hover:bg-[rgba(124,77,255,0.12)] transition-colors text-lg leading-none">✕</button>
        </DialogHeader>

        <div className="px-6 py-5 space-y-4 overflow-y-auto max-h-[75vh]">
          <div className="grid grid-cols-2 gap-4">
            <FloatingSelect label="Especialidade" options={ESPECIALIDADES} placeholder="Selecione uma especialidade" value={esp} onChange={setEsp} />
            <FloatingSelect label="Profissional" options={PROFISSIONAIS} placeholder="Selecione um profissional" value={prof} onChange={setProf} />
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
              <button className="w-8 h-8 flex items-center justify-center rounded-lg text-[#A78BCC] hover:text-[#F5F0FF] hover:bg-[rgba(124,77,255,0.12)] transition-colors border border-[rgba(124,77,255,0.25)]">
                <ChevronLeft size={14} />
              </button>
              <span className="text-sm font-semibold text-[#F5F0FF]">Hoje</span>
              <button className="w-8 h-8 flex items-center justify-center rounded-lg text-[#A78BCC] hover:text-[#F5F0FF] hover:bg-[rgba(124,77,255,0.12)] transition-colors border border-[rgba(124,77,255,0.25)]">
                <ChevronRight size={14} />
              </button>
            </div>
            <div className="rounded-xl overflow-hidden border border-[rgba(124,77,255,0.18)]">
              <div className="bg-[#7C4DFF] text-white text-sm font-bold text-center py-2.5">
                Quarta-Feira 01/04
              </div>
              <div className="divide-y divide-[rgba(124,77,255,0.10)] max-h-56 overflow-y-auto">
                {MOCK_SLOTS.map((slot) => (
                  <div key={slot} className="flex items-center justify-between px-4 py-2.5 hover:bg-[rgba(124,77,255,0.08)] cursor-pointer transition-colors group">
                    <div className="flex items-center gap-2.5">
                      <div className="w-2 h-2 rounded-full bg-[#22C55E] shrink-0" />
                      <span className="text-sm text-[#F5F0FF]">{slot}</span>
                    </div>
                    <span className="text-xs text-[#6B4E8A] group-hover:text-[#A78BCC] transition-colors">1</span>
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
function NovoAgendamentoModal({ open, onClose, defaultInicio, defaultFim }: {
  open: boolean; onClose: () => void; defaultInicio?: string; defaultFim?: string
}) {
  const [paciente, setPaciente] = useState('')
  const [profissional, setProfissional] = useState('JESSE DOS SANTOS BEZERRA')
  const [sala, setSala] = useState('')
  const [recorrente, setRecorrente] = useState(false)
  const [buscaAvancada, setBuscaAvancada] = useState(false)
  const defaults = nowDefault()
  const inicio = defaultInicio ?? defaults.inicio
  const fim    = defaultFim    ?? defaults.fim

  return (
    <>
      <Dialog open={open && !buscaAvancada} onOpenChange={(v: boolean) => { if (!v) onClose() }}>
        <DialogContent
          showCloseButton={false}
          className="bg-[#1A0A38] border border-[rgba(124,77,255,0.30)] text-[#F5F0FF] !max-w-2xl p-0 gap-0 overflow-hidden"
        >
          <DialogHeader className="flex-row items-center justify-between px-6 py-4 border-b border-[rgba(124,77,255,0.18)] space-y-0">
            <DialogTitle className="text-base font-bold text-[#F5F0FF]">Novo Agendamento</DialogTitle>
            <div className="flex items-center gap-2">
              <button className="flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-semibold bg-[rgba(124,77,255,0.15)] text-[#C084FC] border border-[rgba(124,77,255,0.30)] hover:bg-[rgba(124,77,255,0.25)] transition-colors">
                <Lock size={12} />
                Novo Bloqueio de Agenda
              </button>
              <button onClick={onClose} className="w-7 h-7 rounded-md flex items-center justify-center text-[#A78BCC] hover:text-[#F5F0FF] hover:bg-[rgba(124,77,255,0.12)] transition-colors text-lg leading-none">✕</button>
            </div>
          </DialogHeader>

          <div className="overflow-y-auto max-h-[72vh] px-6 py-5 space-y-6">

            {/* Paciente */}
            <div>
              <p className="text-sm font-bold text-[#7C4DFF] mb-3">Paciente</p>
              <div className="flex gap-3 items-end">
                <div className="flex-1">
                  <FloatingField label="Selecione um paciente" required>
                    <div className="relative">
                      <input
                        value={paciente}
                        onChange={(e) => setPaciente(e.target.value)}
                        placeholder="Busque pelo paciente"
                        className={INP + ' pr-8'}
                      />
                      <ChevronDown size={13} className="absolute right-3 top-1/2 -translate-y-1/2 text-[#A78BCC] pointer-events-none" />
                    </div>
                  </FloatingField>
                </div>
                <button className="flex items-center gap-1.5 px-4 py-2.5 rounded-md text-sm font-bold text-white bg-[#7C4DFF] hover:bg-[#5B21B6] transition-colors whitespace-nowrap shrink-0">
                  <Plus size={14} />
                  Novo paciente
                </button>
              </div>
            </div>

            {/* Profissional & Horários */}
            <div>
              <p className="text-sm font-bold text-[#7C4DFF] mb-3">Profissional & Horários</p>
              <div className="space-y-4">
                <div className="flex gap-3 items-end">
                  <div className="flex-1">
                    <FloatingSelect
                      label="Profissional"
                      required
                      options={PROFISSIONAIS}
                      placeholder="Selecione"
                      value={profissional}
                      onChange={setProfissional}
                      onClear={() => setProfissional('')}
                    />
                  </div>
                  <button
                    onClick={() => setBuscaAvancada(true)}
                    className="flex items-center gap-1.5 px-3 py-2.5 rounded-md text-sm font-semibold bg-[rgba(124,77,255,0.15)] text-[#C084FC] border border-[rgba(124,77,255,0.30)] hover:bg-[rgba(124,77,255,0.25)] transition-colors whitespace-nowrap shrink-0"
                  >
                    <Search size={14} />
                    Busca Avançada
                  </button>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <FloatingField label="Início Evento" required>
                    <input type="datetime-local" defaultValue={inicio} className={INP} />
                  </FloatingField>
                  <div className="flex gap-2 items-end">
                    <div className="flex-1">
                      <FloatingField label="Fim Evento" required>
                        <input type="datetime-local" defaultValue={fim} className={INP} />
                      </FloatingField>
                    </div>
                    <button className="flex items-center gap-1.5 px-3 py-2.5 rounded-md text-sm text-[#A78BCC] border border-[rgba(124,77,255,0.25)] hover:border-[#7C4DFF] hover:text-[#F5F0FF] transition-colors shrink-0 whitespace-nowrap">
                      <CalendarIcon size={14} />
                      Escolher no Calendário
                    </button>
                  </div>
                </div>

                <FloatingSelect label="Sala" options={SALAS} placeholder="Selecione uma sala" value={sala} onChange={setSala} />
              </div>
            </div>

            {/* Outras Configurações */}
            <div>
              <p className="text-sm font-bold text-[#7C4DFF] mb-3">Outras Configurações</p>
              <div className="flex items-center gap-3">
                <Toggle on={recorrente} set={setRecorrente} />
                <span className="text-sm text-[#A78BCC]">É um evento recorrente?</span>
              </div>
            </div>

            {/* Serviços & Valores */}
            <div>
              <p className="text-sm font-bold text-[#7C4DFF] mb-3">Serviços & Valores</p>
              {!paciente ? (
                <div className="rounded-xl border border-[rgba(124,77,255,0.18)] bg-[rgba(124,77,255,0.04)] p-5 text-center">
                  <p className="text-sm font-semibold text-[#A78BCC] mb-1">Selecione um paciente</p>
                  <p className="text-xs text-[#6B4E8A]">É necessário selecionar um paciente para a seção de serviços ser exibida.</p>
                </div>
              ) : (
                <div className="rounded-xl border border-[rgba(124,77,255,0.18)] p-4">
                  <p className="text-sm text-[#6B4E8A]">Nenhum serviço adicionado.</p>
                </div>
              )}
              <div className="mt-4">
                <FloatingField label="Observações">
                  <textarea
                    rows={3}
                    placeholder="Observações"
                    className="w-full bg-[#150830] border border-[rgba(124,77,255,0.25)] rounded-md px-3 py-2.5 text-sm text-[#F5F0FF] placeholder:text-[#6B4E8A] focus:outline-none focus:border-[#7C4DFF] transition-colors resize-none"
                  />
                </FloatingField>
              </div>
            </div>
          </div>

          <div className="flex justify-end px-6 py-4 border-t border-[rgba(124,77,255,0.18)]">
            <button className="px-6 py-2 rounded-md text-sm font-bold text-white bg-[#7C4DFF] hover:bg-[#5B21B6] transition-colors">
              Agendar
            </button>
          </div>
        </DialogContent>
      </Dialog>

      <BuscaAvancadaModal open={buscaAvancada} onClose={() => setBuscaAvancada(false)} />
    </>
  )
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
export function CalendarioView() {
  const [weekBase, setWeekBase] = useState(new Date())
  const [viewMode, setViewMode] = useState<ViewMode>('Semana')
  const [novoOpen, setNovoOpen] = useState(false)
  const [clickDT, setClickDT] = useState<{ inicio: string; fim: string } | undefined>()
  const [filtrosOpen, setFiltrosOpen] = useState(false)
  const [settingsOpen, setSettingsOpen] = useState(false)
  const [filtros, setFiltros] = useState<Record<string, boolean>>({})
  const [now, setNow] = useState(new Date())

  function openModal(dt?: { inicio: string; fim: string }) {
    setClickDT(dt)
    setNovoOpen(true)
  }

  useEffect(() => {
    const id = setInterval(() => setNow(new Date()), 60_000)
    return () => clearInterval(id)
  }, [])

  const today = new Date()
  const weekDays = getWeekDays(weekBase)

  const prevWeek = () => { const d = new Date(weekBase); d.setDate(d.getDate() - 7); setWeekBase(d) }
  const nextWeek = () => { const d = new Date(weekBase); d.setDate(d.getDate() + 7); setWeekBase(d) }
  const goToday  = () => setWeekBase(new Date())

  // Mock appointments relative to current week
  const appointments: Appointment[] = [
    { id: '1', paciente: 'Paciente Exemplo', inicio: '09:00', fim: '10:00', date: weekDays[0], cor: 'green' },
    { id: '2', paciente: 'Paciente Exemplo', inicio: '09:00', fim: '10:00', date: weekDays[2], cor: 'red' },
    { id: '3', paciente: 'Paciente Exemplo', inicio: '09:00', fim: '10:00', date: weekDays[4], cor: 'teal' },
  ]

  const gridStartMin = GRID_START * 60
  const nowMinutes   = now.getHours() * 60 + now.getMinutes()
  const timeLineTop  = ((nowMinutes - gridStartMin) / 60) * CELL_H

  const closeAll = () => { setFiltrosOpen(false); setSettingsOpen(false) }

  return (
    <div className="flex flex-col h-full bg-[#0D0520]" onClick={closeAll}>

      {/* ── Toolbar ──────────────────────────────────────────────────────── */}
      <div className="flex items-center justify-between px-4 py-3 border-b border-[rgba(124,77,255,0.12)] bg-[#0D0520] shrink-0 flex-wrap gap-2">

        {/* Left */}
        <div className="flex items-center gap-2">
          {/* Profissional dropdown (decorative) */}
          <button className="flex items-center gap-2 px-3 py-2 rounded-lg text-sm bg-[#150830] border border-[rgba(124,77,255,0.25)] hover:border-[#7C4DFF] transition-colors min-w-[160px] justify-between">
            <span className="text-[#A78BCC]">Todos profissionais</span>
            <ChevronDown size={13} className="text-[#6B4E8A] shrink-0" />
          </button>

          {/* View mode */}
          <div className="flex rounded-lg border border-[rgba(124,77,255,0.25)] overflow-hidden">
            {(['Semana', 'Dia', 'Mês'] as const).map((mode) => (
              <button
                key={mode}
                onClick={() => setViewMode(mode)}
                className={`px-4 py-2 text-sm font-medium transition-colors ${
                  viewMode === mode
                    ? 'bg-[#7C4DFF] text-white'
                    : 'text-[#A78BCC] hover:text-[#F5F0FF] hover:bg-[rgba(124,77,255,0.12)]'
                }`}
              >
                {mode}
              </button>
            ))}
          </div>
        </div>

        {/* Center: navigation */}
        <div className="flex items-center gap-2">
          <button onClick={prevWeek} className="w-8 h-8 flex items-center justify-center rounded-lg text-[#A78BCC] hover:text-[#F5F0FF] hover:bg-[rgba(124,77,255,0.12)] border border-[rgba(124,77,255,0.25)] transition-colors">
            <ChevronLeft size={15} />
          </button>
          <button onClick={nextWeek} className="w-8 h-8 flex items-center justify-center rounded-lg text-[#A78BCC] hover:text-[#F5F0FF] hover:bg-[rgba(124,77,255,0.12)] border border-[rgba(124,77,255,0.25)] transition-colors">
            <ChevronRight size={15} />
          </button>
          <button onClick={goToday} className="px-4 py-1.5 rounded-lg text-sm font-medium text-[#A78BCC] border border-[rgba(124,77,255,0.25)] hover:border-[#7C4DFF] hover:text-[#F5F0FF] transition-colors">
            Hoje
          </button>
        </div>

        {/* Right: actions */}
        <div className="flex items-center gap-1.5">
          {/* Timezone */}
          <button className="w-9 h-9 flex items-center justify-center rounded-lg text-[#A78BCC] hover:text-[#F5F0FF] hover:bg-[rgba(124,77,255,0.12)] transition-colors">
            <Globe size={18} />
          </button>

          {/* Settings dropdown */}
          <div className="relative" onClick={(e) => e.stopPropagation()}>
            <button
              onClick={() => { setSettingsOpen((p) => !p); setFiltrosOpen(false) }}
              className={`w-9 h-9 flex items-center justify-center rounded-lg transition-colors ${settingsOpen ? 'bg-[rgba(124,77,255,0.20)] text-[#F5F0FF]' : 'text-[#A78BCC] hover:text-[#F5F0FF] hover:bg-[rgba(124,77,255,0.12)]'}`}
            >
              <Settings size={18} />
            </button>
            {settingsOpen && (
              <div className="absolute right-0 top-11 z-50 w-52 bg-[#1A0A38] border border-[rgba(124,77,255,0.30)] rounded-xl shadow-2xl overflow-hidden">
                <p className="px-4 pt-3 pb-1.5 text-[10px] font-bold tracking-widest text-[#7C4DFF] uppercase">Configurações</p>
                {[
                  { label: 'Configuração de Agenda', icon: CalendarIcon },
                  { label: 'Bloqueio de Agenda',     icon: Lock },
                ].map(({ label, icon: Icon }) => (
                  <button key={label} className="w-full flex items-center gap-2.5 px-4 py-2.5 text-sm text-[#A78BCC] hover:bg-[rgba(124,77,255,0.12)] hover:text-[#F5F0FF] transition-colors text-left">
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
              className={`w-9 h-9 flex items-center justify-center rounded-lg transition-colors ${filtrosOpen ? 'bg-[rgba(124,77,255,0.20)] text-[#F5F0FF]' : 'text-[#A78BCC] hover:text-[#F5F0FF] hover:bg-[rgba(124,77,255,0.12)]'}`}
            >
              <Filter size={18} />
            </button>
            {filtrosOpen && (
              <div className="absolute right-0 top-11 z-50 w-64 bg-[#1A0A38] border border-[rgba(124,77,255,0.30)] rounded-xl shadow-2xl overflow-hidden">
                <div className="flex items-center justify-between px-4 pt-3 pb-2 border-b border-[rgba(124,77,255,0.12)]">
                  <p className="text-[10px] font-bold tracking-widest text-[#7C4DFF] uppercase">Filtros de Cores</p>
                  <Lock size={13} className="text-[#6B4E8A]" />
                </div>
                <div className="py-1">
                  {FILTROS_CORES.map((f) => (
                    <label key={f} className="flex items-center justify-between px-4 py-2.5 cursor-pointer hover:bg-[rgba(124,77,255,0.08)] transition-colors">
                      <span className="text-sm text-[#A78BCC]">{f}</span>
                      <Toggle on={filtros[f] ?? false} set={(v) => setFiltros((p) => ({ ...p, [f]: v }))} />
                    </label>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Novo Agendamento */}
          <button
            onClick={() => openModal()}
            className="flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-bold text-white bg-[#7C4DFF] hover:bg-[#5B21B6] transition-colors"
          >
            <Plus size={15} />
            Novo Agendamento
          </button>
        </div>
      </div>

      {/* ── Calendar grid ────────────────────────────────────────────────── */}
      <div className="flex-1 overflow-y-auto overflow-x-hidden">
        <div className="flex min-h-full">

          {/* Time column */}
          <div className="flex flex-col shrink-0 w-16">
            <div className="h-12 border-b border-r border-[rgba(124,77,255,0.10)] bg-[#0D0520] shrink-0" />
            {HOURS.map((h) => (
              <div
                key={h}
                className="relative border-b border-r border-[rgba(124,77,255,0.07)] bg-[#0D0520] shrink-0"
                style={{ height: CELL_H }}
              >
                <span className="absolute -top-2.5 right-2 text-[10px] text-[#3D2660] select-none">
                  {String(h).padStart(2, '0')}:00
                </span>
              </div>
            ))}
          </div>

          {/* Day columns */}
          <div className="flex flex-1 min-w-0">
            {weekDays.map((day, di) => {
              const isToday  = isSameDay(day, today)
              const dayAppts = appointments.filter((a) => isSameDay(a.date, day))

              return (
                <div key={di} className="flex flex-col flex-1 min-w-0 border-r border-[rgba(124,77,255,0.07)] last:border-r-0">

                  {/* Day header */}
                  <div className={`h-12 flex items-center justify-center border-b border-[rgba(124,77,255,0.10)] shrink-0 ${isToday ? 'bg-[rgba(124,77,255,0.07)]' : 'bg-[#0D0520]'}`}>
                    {isToday ? (
                      <span className="px-3 py-1 rounded-full bg-[#7C4DFF] text-white text-xs font-bold">
                        {formatDayLabel(day)}
                      </span>
                    ) : (
                      <span className="text-xs font-semibold text-[#4B3270]">
                        {formatDayLabel(day)}
                      </span>
                    )}
                  </div>

                  {/* Grid rows + events */}
                  <div className="relative flex-1">
                    {HOURS.map((h) => (
                      <div
                        key={h}
                        onClick={() => openModal(toDatetimeLocal(day, h))}
                        className={`border-b border-[rgba(124,77,255,0.07)] cursor-pointer hover:bg-[rgba(124,77,255,0.04)] transition-colors ${h === 12 ? 'bg-[rgba(124,77,255,0.03)]' : ''}`}
                        style={{ height: CELL_H }}
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
                      const { bg, border } = COR_BG[appt.cor]

                      return (
                        <div
                          key={appt.id}
                          onClick={(e) => { e.stopPropagation(); openModal(toDatetimeLocal(appt.date, Math.floor(timeToMin(appt.inicio) / 60), timeToMin(appt.inicio) % 60)) }}
                          className="absolute left-1 right-1 rounded-md cursor-pointer overflow-hidden z-10 hover:brightness-110 transition-all"
                          style={{ top, height, background: bg, border: `1px solid ${border}` }}
                        >
                          <div className="flex items-center gap-1.5 px-2 h-full">
                            <div className={`w-2 h-2 rounded-full shrink-0 ${COR_DOT[appt.cor]}`} />
                            <span className="text-xs font-medium text-[#F5F0FF] truncate">{appt.paciente}</span>
                            <span className="text-[10px] text-[#A78BCC] shrink-0 ml-auto">{appt.inicio} - {appt.fim}</span>
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

      {/* ── Scroll buttons ───────────────────────────────────────────────── */}
      <div className="flex justify-center gap-3 py-1.5 border-t border-[rgba(124,77,255,0.10)] bg-[#0D0520] shrink-0">
        <button
          onClick={() => document.querySelector('.flex-1.overflow-y-auto')?.scrollBy({ top: -120, behavior: 'smooth' })}
          className="w-8 h-6 flex items-center justify-center rounded text-[#A78BCC] hover:text-[#F5F0FF] hover:bg-[rgba(124,77,255,0.12)] transition-colors text-xs"
        >
          ∧
        </button>
        <button
          onClick={() => document.querySelector('.flex-1.overflow-y-auto')?.scrollBy({ top: 120, behavior: 'smooth' })}
          className="w-8 h-6 flex items-center justify-center rounded text-[#A78BCC] hover:text-[#F5F0FF] hover:bg-[rgba(124,77,255,0.12)] transition-colors text-xs"
        >
          ∨
        </button>
      </div>

      <NovoAgendamentoModal
        open={novoOpen}
        onClose={() => { setNovoOpen(false); setClickDT(undefined) }}
        defaultInicio={clickDT?.inicio}
        defaultFim={clickDT?.fim}
      />
    </div>
  )
}
