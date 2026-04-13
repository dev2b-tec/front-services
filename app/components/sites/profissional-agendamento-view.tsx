'use client'

import { useState, useEffect, useCallback } from 'react'
import Image from 'next/image'
import { Check, CalendarIcon } from 'lucide-react'
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
  const maxRows = Math.max(...week.map(d => (slots[fmt(d)]??[]).length), 1)
  // clear selection if the selected slot became blocked after reload
  useEffect(() => {
    if (!selected) return
    const daySlots = slots[selected.date] ?? []
    const s = daySlots.find(s => s.time === selected.time)
    if (s?.blocked) setSelected(null)
  }, [slots]) // eslint-disable-line react-hooks/exhaustive-deps

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
      // Criar/atualizar paciente se necessário
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
      // Format as local datetime string (no timezone conversion) so Java receives the local time as-is
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

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-300 via-purple-500 to-purple-700 flex items-center justify-center p-4">
      <div className="w-full max-w-5xl flex flex-col md:flex-row gap-5 items-start">

        {/* ── Left card ─────────────────────────────────── */}
        <div className="bg-white rounded-2xl shadow-2xl p-6 w-full md:w-72 shrink-0">
          {/* Logo */}
          {empresa?.logoUrl ? (
            <div className="mb-4">
              <Image src={empresa.logoUrl} alt={empresa.nome} width={120} height={56} className="object-contain" />
            </div>
          ) : empresa ? (
            <p className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-4">{empresa.nome}</p>
          ) : null}

          <h1 className="text-xl font-bold text-gray-900">Auto Agendamento</h1>
          <p className="text-sm text-gray-500 mt-1 mb-4">
            Faça um novo agendamento para o profissional abaixo:
          </p>
          <p className="text-xs font-semibold text-purple-600 mb-3">Detalhes do profissional:</p>

          {/* Prof info */}
          <div className="flex items-center gap-3 mb-4">
            <div className="w-[52px] h-[52px] rounded-full overflow-hidden border-2 border-purple-100 shrink-0 bg-purple-100 flex items-center justify-center">
              <AvatarImage
                userId={usuario.id}
                fotoUrl={usuario.fotoUrl}
                size={52}
                fallbackIcon={
                  <span className="text-purple-600 text-xl font-bold">{usuario.nome.charAt(0)}</span>
                }
              />
            </div>
            <span className="font-bold text-gray-900 text-sm leading-tight uppercase">{usuario.nome}</span>
          </div>

          <div className="space-y-1.5 text-xs text-gray-700">
            <p><span className="font-semibold">Tempo de atendimento:</span> {usuario.duracaoSessao??40} minutos</p>
            {addr     && <p><span className="font-semibold">Endereço:</span> {addr}</p>}
            {usuario.cep      && <p><span className="font-semibold">CEP:</span> {usuario.cep}</p>}
            {usuario.email    && <p><span className="font-semibold">Email:</span> {usuario.email}</p>}
            {usuario.telefone && <p><span className="font-semibold">Telefone:</span> {usuario.telefone}</p>}
          </div>

          <div className="mt-5 space-y-2">
            <button onClick={reset}
              className="w-full py-2.5 rounded-lg bg-purple-600 hover:bg-purple-700 text-white text-sm font-bold transition-colors">
              Novo Agendamento
            </button>
            <button className="w-full py-2.5 rounded-lg border border-purple-200 bg-purple-50 hover:bg-purple-100 text-purple-400 text-sm font-medium transition-colors">
              Alterar agendamento
            </button>
          </div>
        </div>

        {/* ── Right wizard ──────────────────────────────── */}
        <div className="bg-white rounded-2xl shadow-2xl flex-1 flex flex-col">
          {submitted ? (
            /* Success */
            <div className="flex flex-col items-center justify-center text-center gap-5 py-20 px-8">
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
              <p className="text-xs text-gray-400 bg-gray-50 px-4 py-2 rounded-full">Em breve você receberá uma confirmação</p>
              <button onClick={reset}
                className="px-6 py-2.5 rounded-lg bg-purple-600 hover:bg-purple-700 text-white text-sm font-semibold transition-colors">
                Fazer outro agendamento
              </button>
            </div>
          ) : (
            <>
              {/* Step progress */}
              <div className="px-6 pt-5 pb-4">
                <div className="flex gap-2 mb-4">
                  {STEPS.map((_, i) => (
                    <div key={i} className={`flex-1 h-[3px] rounded-full transition-colors ${i <= step ? 'bg-purple-600' : 'bg-gray-200'}`} />
                  ))}
                </div>

                {/* STEP 1 */}
                {step === 0 && (
                  <>
                    <div className="flex items-center gap-3 mb-5">
                      <span className="w-8 h-8 rounded-lg bg-purple-600 text-white text-sm font-bold flex items-center justify-center shrink-0">1</span>
                      <div>
                        <p className="font-bold text-gray-900 text-sm">Data &amp; Hora</p>
                        <p className="text-xs text-gray-400">Verifique a disponibilidade</p>
                      </div>
                    </div>

                    {/* Week table */}
                    <div className="flex items-start gap-1">
                      <button onClick={() => setWeekStart(w => addDays(w,-7))}
                        className="text-purple-600 hover:text-purple-800 transition-colors mt-6 px-1 text-lg font-bold leading-none select-none">
                        «
                      </button>

                      <div className="flex-1 overflow-x-auto">
                        <table className="w-full text-center text-xs border-collapse">
                          <thead>
                            <tr>
                              {week.map((d,i) => (
                                <th key={i} className="pb-3 min-w-[60px] border border-gray-200 bg-gray-50 px-1 py-2">
                                  <div className="font-semibold text-[11px] text-gray-700">{WEEK_DAYS[d.getDay()]}</div>
                                  <div className="text-[11px] text-gray-400 font-normal">{d.getDate()} {MONTH_ABBR[d.getMonth()]}</div>
                                </th>
                              ))}
                            </tr>
                          </thead>
                        </table>
                        <div className="max-h-[260px] overflow-y-auto">
                          <table className="w-full text-center text-xs border-collapse">
                            <tbody>
                              {loading ? (
                                <tr>
                                  <td colSpan={7} className="py-10 text-gray-400 text-xs border border-gray-200">Carregando horários...</td>
                                </tr>
                              ) : (
                                Array.from({length: maxRows}, (_, row) => (
                                  <tr key={row}>
                                    {week.map((d, col) => {
                                      const ds       = fmt(d)
                                      const daySlots = slots[ds] ?? []
                                      const slot     = daySlots[row]
                                      const isSel    = selected?.date === ds && selected?.time === slot?.time

                                      if (!slot) {
                                        return (
                                          <td key={col} className="border border-gray-200 py-1 px-1 min-w-[60px]">
                                            {row === 0 && daySlots.length === 0 && (
                                              <span className="text-gray-400 font-medium text-[11px]">N / A</span>
                                            )}
                                          </td>
                                        )
                                      }

                                      if (slot.blocked) {
                                        return (
                                          <td key={col} className="border border-gray-200 py-1 px-1 min-w-[60px]">
                                            <div className="w-full py-[7px] rounded text-[12px] font-semibold bg-gray-100 text-gray-300 cursor-not-allowed select-none line-through">
                                              {slot.time}
                                            </div>
                                          </td>
                                        )
                                      }

                                      return (
                                        <td key={col} className="border border-gray-200 py-1 px-1 min-w-[60px]">
                                          <button
                                            onClick={() => setSelected({date:ds, time:slot.time})}
                                            className={`w-full py-[7px] rounded text-[12px] font-semibold transition-all ${
                                              isSel
                                                ? 'bg-purple-600 text-white shadow-sm'
                                                : 'bg-gray-50 border border-gray-200 text-gray-700 hover:bg-gray-100'
                                            }`}
                                          >
                                            {slot.time}
                                          </button>
                                        </td>
                                      )
                                    })}
                                  </tr>
                                ))
                              )}
                            </tbody>
                          </table>
                        </div>
                      </div>

                      <button onClick={() => setWeekStart(w => addDays(w,7))}
                        className="text-purple-600 hover:text-purple-800 transition-colors mt-6 px-1 text-lg font-bold leading-none select-none">
                        »
                      </button>
                    </div>

                    <div className="flex justify-end mt-5">
                      <button disabled={!selected} onClick={() => setStep(1)}
                        className="px-6 py-2.5 rounded-lg bg-purple-600 hover:bg-purple-700 disabled:opacity-30 disabled:cursor-not-allowed text-white text-sm font-bold transition-all">
                        Próximo
                      </button>
                    </div>
                  </>
                )}

                {/* STEP 2 */}
                {step === 1 && (
                  <>
                    <div className="flex items-center gap-3 mb-5">
                      <span className="w-8 h-8 rounded-lg bg-purple-600 text-white text-sm font-bold flex items-center justify-center shrink-0">2</span>
                      <div>
                        <p className="font-bold text-gray-900 text-sm">Informações pessoais</p>
                        <p className="text-xs text-gray-400">Para realizar seu agendamento alguns dados são necessários.</p>
                      </div>
                    </div>

                    {/* Cadastro banner */}
                    {pacienteEncontrado === null && (
                      <div className="bg-orange-400 text-white text-sm font-semibold rounded-xl px-4 py-3 mb-4">
                        <span className="font-bold">Faça seu cadastro!</span> Preencha suas informações abaixo para prosseguir com o agendamento.
                      </div>
                    )}

                    {/* Telefone */}
                    <div className="flex gap-2 mb-3">
                      <div className="flex items-center gap-1 border border-gray-200 rounded-lg px-3 py-2.5 bg-white shrink-0">
                        <span className="text-base">🇧🇷</span>
                        <span className="text-xs text-gray-500 ml-1">+55</span>
                      </div>
                      <FloatInput label="Número de Telefone*" value={telefone}
                        onChange={v => setTelefone(maskCelular(v))}
                        readOnly={pacienteEncontrado !== false} />
                    </div>

                    {/* Data nascimento */}
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

                    {/* Extra fields after search */}
                    {pacienteEncontrado !== false && (
                      <div className="space-y-3 mb-4">
                        <FloatInput label="Nome*" value={nome} onChange={setNome}
                          readOnly={!!pacienteEncontrado} />
                        <div className="relative">
                          <label className="absolute -top-2 left-3 z-10 bg-white px-1 text-[10px] font-medium text-gray-400 leading-none">
                            Gênero*
                          </label>
                          <select value={genero} onChange={e => setGenero(e.target.value)}
                            disabled={!!pacienteEncontrado}
                            className="w-full border border-gray-200 rounded-lg px-3 py-2.5 text-sm text-gray-800 bg-white focus:outline-none focus:border-purple-400 disabled:bg-blue-50 transition-all appearance-none">
                            <option value="">Selecione um gênero</option>
                            <option value="Masculino">Masculino</option>
                            <option value="Feminino">Feminino</option>
                            <option value="Outro">Outro</option>
                            <option value="Prefiro não informar">Prefiro não informar</option>
                          </select>
                        </div>
                        <FloatInput label="Email*" type="email" value={email} onChange={setEmail}
                          readOnly={!!pacienteEncontrado} />
                        <FloatInput label="CPF*" value={cpf} onChange={setCpf}
                          readOnly={!!pacienteEncontrado} />
                        <div className="relative">
                          <label className="absolute -top-2 left-3 z-10 bg-white px-1 text-[10px] font-medium text-gray-400 leading-none">
                            Serviço
                          </label>
                          <select value={servicoId} onChange={e => setServico(e.target.value)}
                            className="w-full border border-gray-200 rounded-lg px-3 py-2.5 text-sm text-gray-800 bg-white focus:outline-none focus:border-purple-400 transition-all appearance-none">
                            <option value="">Selecione um serviço</option>
                            {servicos.map(s => (
                              <option key={s.id} value={s.id}>{s.nome}</option>
                            ))}
                          </select>
                        </div>
                        <div className="relative">
                          <label className="absolute top-2 left-3 text-[11px] text-gray-400 pointer-events-none">Observações</label>
                          <textarea value={obs} onChange={e => setObs(e.target.value)} rows={3}
                            className="w-full border border-gray-200 rounded-lg px-3 pt-6 pb-2 text-sm text-gray-800 focus:outline-none focus:border-purple-400 transition-all resize-y" />
                        </div>
                      </div>
                    )}

                    <div className="flex justify-between items-center mt-2">
                      <button onClick={() => { setStep(0); setPaciente(false) }}
                        className="flex items-center gap-1 px-4 py-2.5 rounded-lg border border-gray-200 text-gray-500 text-sm hover:bg-gray-50 transition-colors">
                        ‹ Voltar
                      </button>
                      {pacienteEncontrado === false ? (
                        <button
                          disabled={!telefone || !dataNascimento || searching}
                          onClick={pesquisar}
                          className="px-6 py-2.5 rounded-lg bg-purple-600 hover:bg-purple-700 disabled:opacity-30 disabled:cursor-not-allowed text-white text-sm font-bold transition-all">
                          {searching ? 'Pesquisando...' : 'Pesquisar'}
                        </button>
                      ) : (
                        <button
                          disabled={!nome || (!pacienteEncontrado && (!genero || !email || !cpf))}
                          onClick={() => setStep(2)}
                          className="px-6 py-2.5 rounded-lg bg-purple-600 hover:bg-purple-700 disabled:opacity-30 disabled:cursor-not-allowed text-white text-sm font-bold transition-all">
                          Próximo
                        </button>
                      )}
                    </div>
                  </>
                )}

                {/* STEP 3 */}
                {step === 2 && (
                  <>
                    <div className="flex items-center gap-3 mb-5">
                      <span className="w-8 h-8 rounded-lg bg-purple-600 text-white text-sm font-bold flex items-center justify-center shrink-0">3</span>
                      <div>
                        <p className="font-bold text-gray-900 text-sm">Confirmação</p>
                        <p className="text-xs text-gray-400">Receba sua confirmação</p>
                      </div>
                    </div>

                    <p className="text-sm font-extrabold text-purple-600 uppercase tracking-wider mb-4">
                      Verifique os dados antes de concluir!
                    </p>

                    {/* Appointment card */}
                    <div className="rounded-2xl bg-gray-50 px-5 py-4 mb-3 space-y-2 text-sm">
                      <p>
                        <span className="font-bold text-gray-800">Profissional: </span>
                        <span className="text-gray-700">{usuario.nome}</span>
                      </p>
                      <p>
                        <span className="font-bold text-gray-800">Data &amp; Hora: </span>
                        <span className="text-gray-700">{selDateLabel}</span>
                      </p>
                    </div>

                    {/* Patient section heading */}
                    <p className="text-sm font-extrabold text-purple-600 uppercase tracking-wider mt-4 mb-3">
                      Detalhes do paciente
                    </p>

                    {/* Patient card */}
                    <div className="rounded-2xl bg-gray-50 px-5 py-4 mb-4 space-y-2 text-sm">
                      <p><span className="font-bold text-gray-800">Nome Completo: </span><span className="text-gray-700">{nome}</span></p>
                      {dataNascimento && (
                        <p><span className="font-bold text-gray-800">Data de nascimento: </span><span className="text-gray-700">{dataNascimento.split('-').reverse().join('/')}</span></p>
                      )}
                      {genero && (
                        <p><span className="font-bold text-gray-800">Gênero: </span><span className="text-gray-700">{genero}</span></p>
                      )}
                      {email && (
                        <p><span className="font-bold text-gray-800">Email: </span><span className="text-gray-700">{email}</span></p>
                      )}
                      {telefone && (
                        <p><span className="font-bold text-gray-800">Telefone: </span><span className="text-gray-700">+55{telefone.replace(/\D/g,'')}</span></p>
                      )}
                      {servicoNome && (
                        <p><span className="font-bold text-gray-800">Serviço: </span><span className="text-gray-700">{servicoNome}</span></p>
                      )}
                      {obs && (
                        <p><span className="font-bold text-gray-800">Observações: </span><span className="text-gray-700">{obs}</span></p>
                      )}
                    </div>

                    {error && (
                      <div className="bg-red-50 border border-red-200 text-red-600 text-sm rounded-xl px-4 py-3 mb-4">{error}</div>
                    )}

                    <div className="flex justify-between items-center pt-1">
                      <button onClick={() => setStep(1)}
                        className="px-5 py-2.5 rounded-xl border border-gray-200 text-gray-500 text-sm font-medium hover:bg-gray-50 transition-colors">
                        &lsaquo; Voltar
                      </button>
                      <button onClick={confirm} disabled={submitting}
                        className="px-7 py-2.5 rounded-xl bg-purple-600 hover:bg-purple-700 disabled:opacity-60 text-white text-sm font-bold transition-all">
                        {submitting ? 'Confirmando...' : 'Concluir'}
                      </button>
                    </div>
                  </>
                )}
              </div>
            </>
          )}
        </div>

      </div>
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
        className={`w-full border border-gray-200 rounded-lg px-3 py-2.5 text-sm text-gray-800 focus:outline-none focus:border-purple-400 transition-all ${readOnly ? 'bg-blue-50' : ''}`} />
    </div>
  )
}
