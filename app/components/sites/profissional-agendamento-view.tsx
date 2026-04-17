'use client'

import { useState, useEffect, useCallback } from 'react'
import Image from 'next/image'
import { Check, CalendarIcon, MapPin, Clock, ChevronLeft, ChevronRight } from 'lucide-react'
import { format, parse, isValid } from 'date-fns'
import { ptBR } from 'date-fns/locale'
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover'
import { Calendar } from '@/components/ui/calendar'
import { AvatarImage } from '@/components/configuracoes/avatar-image'

// ── DatePickerInput ─────────────────────────────────────────────────────────
// value / onChange usam formato YYYY-MM-DD (compatível com o restante da view)
function DatePickerInput({
  value,
  onChange,
  disabled,
}: {
  value: string
  onChange: (v: string) => void
  disabled?: boolean
}) {
  const [open, setOpen] = useState(false)
  const parsed = value ? parse(value, 'yyyy-MM-dd', new Date()) : undefined
  const selected = parsed && isValid(parsed) ? parsed : undefined

  return (
    <Popover open={open && !disabled} onOpenChange={v => { if (!disabled) setOpen(v) }}>
      <PopoverTrigger asChild>
        <button
          type="button"
          disabled={disabled}
          className={`w-full flex items-center justify-between border border-gray-200 rounded-lg px-3 py-2.5 text-sm text-left focus:outline-none focus:border-purple-400 transition-all ${disabled ? 'bg-blue-50 cursor-default' : 'bg-white hover:border-purple-300'}`}
        >
          <span className={selected ? 'text-gray-800' : 'text-gray-400'}>
            {selected ? format(selected, 'dd/MM/yyyy') : 'dd/mm/aaaa'}
          </span>
          <CalendarIcon size={16} className="text-gray-400 shrink-0" />
        </button>
      </PopoverTrigger>
      <PopoverContent className="w-auto p-0" align="start">
        <Calendar
          mode="single"
          selected={selected}
          onSelect={day => {
            if (day) { onChange(format(day, 'yyyy-MM-dd')); setOpen(false) }
          }}
          locale={ptBR}
          captionLayout="dropdown"
          fromYear={1920}
          toYear={new Date().getFullYear()}
          defaultMonth={selected ?? new Date(1990, 0)}
          initialFocus
        />
      </PopoverContent>
    </Popover>
  )
}

export interface ProfissionalData {
  id: string
  nome: string
  email: string
  telefone?: string
  fotoUrl?: string
  tipo?: string
  especialidade?: string
  duracaoSessao?: number
  cep?: string
  logradouro?: string
  numero?: string
  complemento?: string
  bairro?: string
  cidade?: string
  empresaId?: string
}

export interface EmpresaData {
  id: string
  nome: string
  logoUrl?: string
}

const WEEK_DAYS  = ['Dom', 'Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb']
const MONTH_ABBR = ['Jan','Fev','Mar','Abr','Mai','Jun','Jul','Ago','Set','Out','Nov','Dez']
const MONTH_FULL = ['Janeiro','Fevereiro','Março','Abril','Maio','Junho','Julho','Agosto','Setembro','Outubro','Novembro','Dezembro']
const DOW_FULL   = ['Domingo','Segunda-feira','Terça-feira','Quarta-feira','Quinta-feira','Sexta-feira','Sábado']

function getWeekStart(d: Date): Date {
  const r = new Date(d)
  r.setDate(r.getDate() - r.getDay())
  r.setHours(0, 0, 0, 0)
  return r
}

function addDays(d: Date, n: number): Date {
  const r = new Date(d)
  r.setDate(r.getDate() + n)
  return r
}

function fmt(d: Date): string {
  return `${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,'0')}-${String(d.getDate()).padStart(2,'0')}`
}

const STEPS = ['Data & Hora', 'Seus dados', 'Confirmação']

export default function ProfissionalAgendamentoView({
  usuario,
  empresa,
}: {
  usuario: ProfissionalData
  empresa: EmpresaData | null
}) {
  const [step, setStep]             = useState(0)
  const [weekStart, setWeekStart]   = useState(() => getWeekStart(new Date()))
  const [slots, setSlots]           = useState<Record<string,Array<{time:string;blocked:boolean}>>>({})
  const [loading, setLoading]       = useState(false)
  const [selected, setSelected]     = useState<{date:string;time:string}|null>(null)

  // Step 2 — search
  const [telefone, setTelefone]           = useState('')
  const [dataNascimento, setDataNasc]     = useState('')
  const [searching, setSearching]         = useState(false)
  const [pacienteEncontrado, setPaciente] = useState<Record<string,string> | null | false>(false)
  // false = não pesquisado | null = não encontrado | object = encontrado

  // Step 2 — form
  const [nome, setNome]         = useState('')
  const [email, setEmail]       = useState('')
  const [genero, setGenero]     = useState('')
  const [cpf, setCpf]           = useState('')
  const [servicoId, setServico] = useState('')
  const [obs, setObs]           = useState('')
  const [servicos, setServicos] = useState<{id:string;nome:string}[]>([])

  const [submitting, setSubmitting] = useState(false)
  const [submitted, setSubmitted]   = useState(false)
  const [error, setError]           = useState('')

  const empresaId = usuario.empresaId ?? empresa?.id

  // load slots
  const load = useCallback(async (start: Date) => {
    setLoading(true)
    try {
      const end = addDays(start, 6)
      const r = await fetch(`/api/public/slots?usuarioId=${usuario.id}&dataInicio=${fmt(start)}&dataFim=${fmt(end)}`, { cache: 'no-store' })
      if (r.ok) setSlots(await r.json())
    } finally { setLoading(false) }
  }, [usuario.id])

  useEffect(() => { load(weekStart) }, [weekStart, load])

  // load services when entering step 2
  useEffect(() => {
    if (step === 1 && empresaId && servicos.length === 0) {
      fetch(`/api/public/services?empresaId=${empresaId}`)
        .then(r => r.ok ? r.json() : [])
        .then(d => setServicos(d))
        .catch(() => {})
    }
  }, [step, empresaId]) // eslint-disable-line react-hooks/exhaustive-deps

  const week = Array.from({length:7}, (_,i) => addDays(weekStart, i))
  // clear selection if the selected slot became blocked after reload
  useEffect(() => {
    if (!selected) return
    const daySlots = slots[selected.date] ?? []
    const s = daySlots.find(s => s.time === selected.time)
    if (s?.blocked) setSelected(null)
  }, [slots]) // eslint-disable-line react-hooks/exhaustive-deps

  // Day strip: default focus to first day that has available slots
  const [focusDay, setFocusDay] = useState<string>(() => fmt(getWeekStart(new Date())))
  useEffect(() => {
    const first = week.find(d => (slots[fmt(d)] ?? []).some(s => !s.blocked))
    setFocusDay(first ? fmt(first) : fmt(week[0]))
  }, [slots]) // eslint-disable-line react-hooks/exhaustive-deps
  // When week changes, reset focus to first day of new week
  useEffect(() => { setFocusDay(fmt(week[0])) }, [weekStart]) // eslint-disable-line react-hooks/exhaustive-deps

  const focusedSlots = focusDay ? (slots[focusDay] ?? []) : []

  async function pesquisar() {
    if (!telefone || !dataNascimento || !empresaId) return
    setSearching(true); setPaciente(false)
    try {
      const digits = telefone.replace(/\D/g,'')
      const r = await fetch(`/api/public/patients?empresaId=${empresaId}&telefone=${digits}&dataNascimento=${dataNascimento}`)
      if (r.ok) {
        const data = await r.json()
        if (data && data.nome) {
          setPaciente(data)
          setNome(data.nome ?? '')
          setEmail(data.email ?? '')
          setGenero(data.genero ?? '')
          setCpf(data.cpf ?? '')
          setObs(data.outrasInformacoes ?? '')
        } else {
          setPaciente(null)
        }
      } else { setPaciente(null) }
    } catch { setPaciente(null) }
    finally { setSearching(false) }
  }

  async function confirm() {
    if (!selected) return
    setSubmitting(true); setError('')
    try {
      let pacienteIdFinal: string | undefined = (pacienteEncontrado as Record<string,string>)?.id
      if (!pacienteIdFinal && empresaId) {
        const res = await fetch('/api/public/patients', {
          method: 'POST',
          headers: {'Content-Type':'application/json'},
          body: JSON.stringify({
            empresaId, nome, email: email||undefined, genero: genero||undefined,
            cpf: cpf||undefined, telefone: telefone.replace(/\D/g,''),
            dataNascimento, outrasInformacoes: obs||undefined,
          }),
        })
        if (res.ok) { const p = await res.json(); pacienteIdFinal = p.id }
      }

      const ini = new Date(`${selected.date}T${selected.time}:00`)
      const fim = new Date(ini.getTime() + (usuario.duracaoSessao??40)*60_000)
      const fmtLocal = (d: Date) => {
        const pad = (n: number) => String(n).padStart(2, '0')
        return `${d.getFullYear()}-${pad(d.getMonth()+1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}:00`
      }
      const r = await fetch('/api/public/bookings', {
        method: 'POST',
        headers: {'Content-Type':'application/json'},
        body: JSON.stringify({
          usuarioId: usuario.id, empresaId,
          pacienteId: pacienteIdFinal,
          pacienteNome: nome, pacienteEmail: email||undefined,
          pacienteTelefone: telefone.replace(/\D/g,''),
          servicoId: servicoId||undefined,
          observacoes: obs||undefined,
          inicio: fmtLocal(ini), fim: fmtLocal(fim),
        }),
      })
      if (r.ok) { setSubmitted(true); load(weekStart) }
      else { const e = await r.json().catch(()=>({})); setError(e.error??'Erro ao confirmar.') }
    } catch { setError('Erro de conexão.') }
    finally { setSubmitting(false) }
  }

  function reset() {
    setStep(0); setSelected(null); setSubmitted(false)
    setTelefone(''); setDataNasc(''); setPaciente(false)
    setNome(''); setEmail(''); setGenero(''); setCpf(''); setServico(''); setObs('')
    setError('')
    load(weekStart)
  }

  const addr = [usuario.logradouro, usuario.numero, usuario.complemento, usuario.bairro, usuario.cidade].filter(Boolean).join(', ')

  const selDateLabel = selected ? (() => {
    const d = new Date(selected.date + 'T12:00:00')
    return `${d.getDate().toString().padStart(2,'0')}/${(d.getMonth()+1).toString().padStart(2,'0')}/${d.getFullYear()} ${selected.time}`
  })() : ''

  const selDateFull = selected ? (() => {
    const d = new Date(selected.date + 'T12:00:00')
    return `${DOW_FULL[d.getDay()]}, ${d.getDate()} de ${MONTH_FULL[d.getMonth()]} de ${d.getFullYear()}`
  })() : ''

  const servicoNome = servicos.find(s => s.id === servicoId)?.nome ?? ''

  // Month label for the week header
  const months = [...new Set(week.map(d => MONTH_ABBR[d.getMonth()]))]
  const yearLabel = week[0].getFullYear()
  const weekHeader = `${months.join('/')} ${yearLabel}`

  return (
    <div className="min-h-screen bg-[#F8F7FF]">
      {/* ── Sticky header ─────────────────────────────── */}
      <header className="bg-white border-b border-gray-100 px-4 py-3 sticky top-0 z-20">
        <div className="max-w-3xl mx-auto flex items-center gap-3">
          {empresa?.logoUrl && (
            <Image src={empresa.logoUrl} alt={empresa.nome} width={80} height={36} className="object-contain h-9 w-auto shrink-0" />
          )}
          <div className="flex-1 min-w-0">
            <p className="text-[11px] text-gray-400">Agendamento com</p>
            <p className="font-bold text-gray-900 text-sm leading-tight truncate">{usuario.nome}</p>
          </div>
          <div className="flex items-center gap-1.5 bg-[#7C4DFF]/10 px-2.5 py-1.5 rounded-full shrink-0">
            <Clock size={12} className="text-[#7C4DFF]" />
            <span className="text-xs font-semibold text-[#7C4DFF]">{usuario.duracaoSessao ?? 40} min</span>
          </div>
        </div>
      </header>

      <main className="max-w-3xl mx-auto px-4 py-5 sm:px-6">
        <div className="flex flex-col lg:flex-row gap-5 items-start">

          {/* ── Left panel: professional info (desktop only) ── */}
          <aside className="hidden lg:flex flex-col bg-white rounded-2xl border border-gray-100 p-5 w-64 shrink-0 sticky top-20 gap-4">
            <div className="flex items-center gap-3">
              <div className="w-14 h-14 rounded-full overflow-hidden border-2 border-[#7C4DFF]/20 shrink-0 bg-[#7C4DFF]/10 flex items-center justify-center">
                <AvatarImage userId={usuario.id} fotoUrl={usuario.fotoUrl} size={56}
                  fallbackIcon={<span className="text-[#7C4DFF] text-xl font-bold">{usuario.nome.charAt(0)}</span>} />
              </div>
              <div className="min-w-0">
                <p className="font-bold text-gray-900 text-sm leading-tight uppercase">{usuario.nome}</p>
                {usuario.tipo && <p className="text-xs text-gray-400 mt-0.5">{usuario.tipo}</p>}
              </div>
            </div>

            <div className="space-y-2 text-xs text-gray-600 border-t border-gray-100 pt-3">
              <p className="flex items-start gap-2">
                <Clock size={13} className="text-[#7C4DFF] shrink-0 mt-0.5" />
                <span><strong>{usuario.duracaoSessao ?? 40} min</strong> por consulta</span>
              </p>
              {addr && (
                <p className="flex items-start gap-2">
                  <MapPin size={13} className="text-[#7C4DFF] shrink-0 mt-0.5" />
                  <span>{addr}</span>
                </p>
              )}
              {usuario.email && (
                <p className="text-gray-400 truncate pl-5">{usuario.email}</p>
              )}
              {usuario.telefone && (
                <p className="text-gray-400 pl-5">{usuario.telefone}</p>
              )}
            </div>

            <div className="pt-1 space-y-2 border-t border-gray-100">
              <button onClick={reset}
                className="w-full py-2.5 rounded-xl bg-[#7C4DFF] hover:bg-[#5B21B6] text-white text-sm font-bold transition-colors">
                Novo Agendamento
              </button>
              <button className="w-full py-2.5 rounded-xl border border-gray-200 text-gray-400 text-sm font-medium hover:bg-gray-50 transition-colors">
                Alterar agendamento
              </button>
            </div>
          </aside>

          {/* ── Right: wizard ─────────────────────────────── */}
          <div className="flex-1 min-w-0">
            {submitted ? (
              /* ── Success ────────────────────────────────── */
              <div className="bg-white rounded-2xl border border-gray-100 flex flex-col items-center justify-center text-center gap-5 py-16 px-8">
                <div className="w-16 h-16 rounded-full bg-green-500 flex items-center justify-center shadow-lg">
                  <Check size={32} className="text-white" strokeWidth={3} />
                </div>
                <div>
                  <h2 className="text-xl font-bold text-gray-900 mb-2">Agendamento confirmado!</h2>
                  <p className="text-gray-500 text-sm max-w-sm leading-relaxed">
                    Sua consulta com <strong>{usuario.nome}</strong> foi agendada para{' '}
                    <strong>{selDateFull}</strong> às <strong>{selected?.time}</strong>.
                  </p>
                </div>
                <p className="text-xs text-gray-400 bg-gray-50 px-4 py-2 rounded-full">
                  Em breve você receberá uma confirmação
                </p>
                <button onClick={reset}
                  className="px-6 py-2.5 rounded-xl bg-[#7C4DFF] hover:bg-[#5B21B6] text-white text-sm font-semibold transition-colors">
                  Fazer outro agendamento
                </button>
              </div>
            ) : (
              <div className="bg-white rounded-2xl border border-gray-100 overflow-hidden">
                {/* Step progress bar */}
                <div className="px-5 pt-5 pb-4 border-b border-gray-100">
                  <div className="flex items-center gap-2 mb-4">
                    {STEPS.map((label, i) => (
                      <div key={i} className="flex-1 flex flex-col gap-1">
                        <div className={`h-1.5 rounded-full transition-colors ${i <= step ? 'bg-[#7C4DFF]' : 'bg-gray-200'}`} />
                        <span className={`text-[10px] font-semibold ${i <= step ? 'text-[#7C4DFF]' : 'text-gray-300'}`}>{label}</span>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="px-5 pb-6">
                  {/* ── STEP 1: Data & Hora ─────────────────── */}
                  {step === 0 && (
                    <>
                      <div className="flex items-center gap-3 py-4">
                        <span className="w-8 h-8 rounded-lg bg-[#7C4DFF] text-white text-sm font-bold flex items-center justify-center shrink-0">1</span>
                        <div>
                          <p className="font-bold text-gray-900 text-sm">Data &amp; Hora</p>
                          <p className="text-xs text-gray-400">Escolha o dia e horário disponível</p>
                        </div>
                      </div>

                      {/* Week navigation */}
                      <div className="flex items-center justify-between mb-3">
                        <button
                          onClick={() => setWeekStart(w => addDays(w, -7))}
                          className="p-1.5 rounded-lg hover:bg-gray-100 text-gray-500 transition-colors"
                          aria-label="Semana anterior"
                        >
                          <ChevronLeft size={18} />
                        </button>
                        <span className="text-sm font-semibold text-gray-700">{weekHeader}</span>
                        <button
                          onClick={() => setWeekStart(w => addDays(w, 7))}
                          className="p-1.5 rounded-lg hover:bg-gray-100 text-gray-500 transition-colors"
                          aria-label="Próxima semana"
                        >
                          <ChevronRight size={18} />
                        </button>
                      </div>

                      {/* Day strip — horizontal scroll */}
                      <div className="flex gap-2 overflow-x-auto pb-3 -mx-5 px-5 scrollbar-none">
                        {week.map((d) => {
                          const key = fmt(d)
                          const daySlots = slots[key] ?? []
                          const available = daySlots.filter(s => !s.blocked).length
                          const isFocus = focusDay === key
                          const dayNum = d.getDate()
                          const dayName = WEEK_DAYS[d.getDay()]
                          return (
                            <button
                              key={key}
                              onClick={() => setFocusDay(key)}
                              className={`flex flex-col items-center gap-1 px-3 py-2.5 rounded-xl border-2 transition-all shrink-0 min-w-[52px] ${
                                isFocus
                                  ? 'border-[#7C4DFF] bg-[#7C4DFF] text-white shadow-md'
                                  : available > 0
                                  ? 'border-gray-200 bg-white text-gray-700 hover:border-[#7C4DFF]/50'
                                  : 'border-gray-100 bg-gray-50 text-gray-300 cursor-default'
                              }`}
                            >
                              <span className={`text-[11px] font-semibold uppercase ${isFocus ? 'text-white/80' : ''}`}>{dayName}</span>
                              <span className="text-base font-bold leading-none">{dayNum}</span>
                              <span className={`text-[10px] font-medium ${isFocus ? 'text-white/70' : available > 0 ? 'text-[#7C4DFF]' : 'text-gray-300'}`}>
                                {available > 0 ? `${available}h` : '—'}
                              </span>
                            </button>
                          )
                        })}
                      </div>

                      {/* Slots grid for focused day */}
                      <div className="mt-4">
                        {loading ? (
                          <div className="py-10 flex items-center justify-center">
                            <div className="w-6 h-6 rounded-full border-2 border-[#7C4DFF] border-t-transparent animate-spin" />
                          </div>
                        ) : focusedSlots.length === 0 ? (
                          <div className="py-8 text-center">
                            <p className="text-gray-400 text-sm">Sem horários disponíveis neste dia</p>
                          </div>
                        ) : (
                          <>
                            {(() => {
                              const fd = focusDay ? new Date(focusDay + 'T12:00:00') : null
                              const dayLabel = fd ? `${DOW_FULL[fd.getDay()]}, ${fd.getDate()} de ${MONTH_FULL[fd.getMonth()]}` : ''
                              return <p className="text-xs font-semibold text-gray-500 mb-3">{dayLabel}</p>
                            })()}
                            <div className="grid grid-cols-3 sm:grid-cols-4 gap-2">
                              {focusedSlots.map((slot) => {
                                const isSel = selected?.date === focusDay && selected?.time === slot.time
                                if (slot.blocked) {
                                  return (
                                    <div key={slot.time}
                                      className="py-2.5 rounded-xl text-center text-sm font-semibold bg-gray-50 text-gray-300 line-through cursor-not-allowed border border-gray-100">
                                      {slot.time}
                                    </div>
                                  )
                                }
                                return (
                                  <button key={slot.time}
                                    onClick={() => setSelected({ date: focusDay!, time: slot.time })}
                                    className={`py-2.5 rounded-xl text-center text-sm font-bold transition-all border ${
                                      isSel
                                        ? 'bg-[#7C4DFF] text-white border-[#7C4DFF] shadow-md scale-[1.03]'
                                        : 'bg-white text-gray-700 border-gray-200 hover:border-[#7C4DFF] hover:text-[#7C4DFF]'
                                    }`}>
                                    {slot.time}
                                  </button>
                                )
                              })}
                            </div>
                          </>
                        )}
                      </div>

                      <div className="flex justify-end mt-6">
                        <button disabled={!selected} onClick={() => setStep(1)}
                          className="px-6 py-2.5 rounded-xl bg-[#7C4DFF] hover:bg-[#5B21B6] disabled:opacity-30 disabled:cursor-not-allowed text-white text-sm font-bold transition-all">
                          Próximo →
                        </button>
                      </div>
                    </>
                  )}

                  {/* ── STEP 2: Seus dados ──────────────────── */}
                  {step === 1 && (
                    <>
                      <div className="flex items-center gap-3 py-4">
                        <span className="w-8 h-8 rounded-lg bg-[#7C4DFF] text-white text-sm font-bold flex items-center justify-center shrink-0">2</span>
                        <div>
                          <p className="font-bold text-gray-900 text-sm">Seus dados</p>
                          <p className="text-xs text-gray-400">Para o agendamento precisamos de algumas informações</p>
                        </div>
                      </div>

                      {/* Selected slot reminder */}
                      {selected && (
                        <div className="flex items-center gap-2 bg-[#7C4DFF]/10 rounded-xl px-4 py-2.5 mb-4 text-sm">
                          <CalendarIcon size={14} className="text-[#7C4DFF] shrink-0" />
                          <span className="text-[#7C4DFF] font-semibold">{selDateLabel}</span>
                        </div>
                      )}

                      {pacienteEncontrado === null && (
                        <div className="bg-orange-50 border border-orange-200 text-orange-700 text-sm font-semibold rounded-xl px-4 py-3 mb-4">
                          <span className="font-bold">Faça seu cadastro!</span> Preencha suas informações para prosseguir.
                        </div>
                      )}

                      <div className="flex gap-2 mb-3">
                        <div className="flex items-center gap-1 border border-gray-200 rounded-lg px-3 py-2.5 bg-gray-50 shrink-0">
                          <span className="text-base">🇧🇷</span>
                          <span className="text-xs text-gray-500 ml-1">+55</span>
                        </div>
                        <FloatInput label="Número de Telefone*" value={telefone}
                          onChange={v => setTelefone(maskCelular(v))}
                          readOnly={pacienteEncontrado !== false} />
                      </div>

                      <div className="relative mb-4">
                        <label className="absolute -top-2 left-3 z-10 bg-white px-1 text-[10px] font-medium text-gray-400 leading-none">
                          Data de nascimento*
                        </label>
                        <DatePickerInput
                          value={dataNascimento}
                          onChange={setDataNasc}
                          disabled={pacienteEncontrado !== false}
                        />
                      </div>

                      {pacienteEncontrado !== false && (
                        <div className="space-y-3 mb-4">
                          <FloatInput label="Nome*" value={nome} onChange={setNome} readOnly={!!pacienteEncontrado} />
                          <div className="relative">
                            <label className="absolute -top-2 left-3 z-10 bg-white px-1 text-[10px] font-medium text-gray-400 leading-none">Gênero*</label>
                            <select value={genero} onChange={e => setGenero(e.target.value)}
                              disabled={!!pacienteEncontrado}
                              className="w-full border border-gray-200 rounded-lg px-3 py-2.5 text-sm text-gray-800 bg-white focus:outline-none focus:border-[#7C4DFF] disabled:bg-blue-50 transition-all appearance-none">
                              <option value="">Selecione um gênero</option>
                              <option value="Masculino">Masculino</option>
                              <option value="Feminino">Feminino</option>
                              <option value="Outro">Outro</option>
                              <option value="Prefiro não informar">Prefiro não informar</option>
                            </select>
                          </div>
                          <FloatInput label="Email*" type="email" value={email} onChange={setEmail} readOnly={!!pacienteEncontrado} />
                          <FloatInput label="CPF*" value={cpf} onChange={setCpf} readOnly={!!pacienteEncontrado} />
                          <div className="relative">
                            <label className="absolute -top-2 left-3 z-10 bg-white px-1 text-[10px] font-medium text-gray-400 leading-none">Serviço</label>
                            <select value={servicoId} onChange={e => setServico(e.target.value)}
                              className="w-full border border-gray-200 rounded-lg px-3 py-2.5 text-sm text-gray-800 bg-white focus:outline-none focus:border-[#7C4DFF] transition-all appearance-none">
                              <option value="">Selecione um serviço</option>
                              {servicos.map(s => (
                                <option key={s.id} value={s.id}>{s.nome}</option>
                              ))}
                            </select>
                          </div>
                          <div className="relative">
                            <label className="absolute top-2 left-3 text-[11px] text-gray-400 pointer-events-none">Observações</label>
                            <textarea value={obs} onChange={e => setObs(e.target.value)} rows={3}
                              className="w-full border border-gray-200 rounded-lg px-3 pt-6 pb-2 text-sm text-gray-800 focus:outline-none focus:border-[#7C4DFF] transition-all resize-y" />
                          </div>
                        </div>
                      )}

                      <div className="flex justify-between items-center mt-2">
                        <button onClick={() => { setStep(0); setPaciente(false) }}
                          className="flex items-center gap-1 px-4 py-2.5 rounded-xl border border-gray-200 text-gray-500 text-sm hover:bg-gray-50 transition-colors">
                          <ChevronLeft size={16} /> Voltar
                        </button>
                        {pacienteEncontrado === false ? (
                          <button disabled={!telefone || !dataNascimento || searching} onClick={pesquisar}
                            className="px-6 py-2.5 rounded-xl bg-[#7C4DFF] hover:bg-[#5B21B6] disabled:opacity-30 text-white text-sm font-bold transition-all">
                            {searching ? 'Pesquisando...' : 'Pesquisar'}
                          </button>
                        ) : (
                          <button disabled={!nome || (!pacienteEncontrado && (!genero || !email || !cpf))}
                            onClick={() => setStep(2)}
                            className="px-6 py-2.5 rounded-xl bg-[#7C4DFF] hover:bg-[#5B21B6] disabled:opacity-30 text-white text-sm font-bold transition-all">
                            Próximo →
                          </button>
                        )}
                      </div>
                    </>
                  )}

                  {/* ── STEP 3: Confirmação ─────────────────── */}
                  {step === 2 && (
                    <>
                      <div className="flex items-center gap-3 py-4">
                        <span className="w-8 h-8 rounded-lg bg-[#7C4DFF] text-white text-sm font-bold flex items-center justify-center shrink-0">3</span>
                        <div>
                          <p className="font-bold text-gray-900 text-sm">Confirmação</p>
                          <p className="text-xs text-gray-400">Verifique os dados antes de concluir</p>
                        </div>
                      </div>

                      <div className="rounded-2xl bg-[#F8F7FF] border border-[#7C4DFF]/20 px-5 py-4 mb-4 space-y-2 text-sm">
                        <p className="text-xs font-bold text-[#7C4DFF] uppercase tracking-wider mb-3">Agendamento</p>
                        <p><span className="font-semibold text-gray-700">Profissional: </span><span className="text-gray-600">{usuario.nome}</span></p>
                        <p><span className="font-semibold text-gray-700">Data &amp; Hora: </span><span className="text-gray-600">{selDateLabel}</span></p>
                      </div>

                      <div className="rounded-2xl bg-gray-50 border border-gray-100 px-5 py-4 mb-4 space-y-2 text-sm">
                        <p className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-3">Paciente</p>
                        <p><span className="font-semibold text-gray-700">Nome: </span><span className="text-gray-600">{nome}</span></p>
                        {dataNascimento && <p><span className="font-semibold text-gray-700">Nascimento: </span><span className="text-gray-600">{dataNascimento.split('-').reverse().join('/')}</span></p>}
                        {genero && <p><span className="font-semibold text-gray-700">Gênero: </span><span className="text-gray-600">{genero}</span></p>}
                        {email && <p><span className="font-semibold text-gray-700">Email: </span><span className="text-gray-600">{email}</span></p>}
                        {telefone && <p><span className="font-semibold text-gray-700">Telefone: </span><span className="text-gray-600">+55 {telefone}</span></p>}
                        {servicoNome && <p><span className="font-semibold text-gray-700">Serviço: </span><span className="text-gray-600">{servicoNome}</span></p>}
                        {obs && <p><span className="font-semibold text-gray-700">Observações: </span><span className="text-gray-600">{obs}</span></p>}
                      </div>

                      {error && (
                        <div className="bg-red-50 border border-red-200 text-red-600 text-sm rounded-xl px-4 py-3 mb-4">{error}</div>
                      )}

                      <div className="flex justify-between items-center pt-1">
                        <button onClick={() => setStep(1)}
                          className="flex items-center gap-1 px-5 py-2.5 rounded-xl border border-gray-200 text-gray-500 text-sm font-medium hover:bg-gray-50 transition-colors">
                          <ChevronLeft size={16} /> Voltar
                        </button>
                        <button onClick={confirm} disabled={submitting}
                          className="px-7 py-2.5 rounded-xl bg-[#7C4DFF] hover:bg-[#5B21B6] disabled:opacity-60 text-white text-sm font-bold transition-all shadow-md">
                          {submitting ? 'Confirmando...' : 'Confirmar Agendamento'}
                        </button>
                      </div>
                    </>
                  )}
                </div>
              </div>
            )}
          </div>

        </div>
      </main>
    </div>
  )
}

function maskCelular(v: string): string {
  const d = v.replace(/\D/g, '').slice(0, 11)
  if (d.length <= 2)  return d.replace(/^(\d{0,2})/, '($1')
  if (d.length <= 7)  return d.replace(/^(\d{2})(\d{0,5})/, '($1) $2')
  return d.replace(/^(\d{2})(\d{5})(\d{0,4})/, '($1) $2-$3')
}

function FloatInput({ label, value, onChange, type='text', readOnly=false }: {
  label:string; value:string; onChange?:(v:string)=>void; type?:string; readOnly?:boolean
}) {
  return (
    <div className="relative flex-1">
      <label className="absolute -top-2 left-3 z-10 bg-white px-1 text-[10px] font-medium text-gray-400 leading-none">
        {label}
      </label>
      <input type={type} value={value}
        readOnly={readOnly}
        onChange={e => onChange?.(e.target.value)}
        className={`w-full border border-gray-200 rounded-lg px-3 py-2.5 text-sm text-gray-800 focus:outline-none focus:border-[#7C4DFF] transition-all ${readOnly ? 'bg-blue-50' : ''}`} />
    </div>
  )
}

