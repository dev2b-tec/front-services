'use client'

import { useState, useRef } from 'react'
import {
  ChevronDown, Copy, ExternalLink, AlertTriangle, Globe, User,
  MapPin, Share2, Clock, Check, X, Info, Eye, Search,
  ArrowUpDown, Plus,
  type LucideIcon,
} from 'lucide-react'

// ─── Shared styles ────────────────────────────────────────────────────────────
const INP =
  'w-full bg-[#0D0520] border border-[rgba(124,77,255,0.25)] rounded-md ' +
  'px-3 py-2.5 text-sm text-[#F5F0FF] placeholder:text-[#6B4E8A] ' +
  'focus:outline-none focus:border-[#7C4DFF] transition-colors'
const LBG = 'bg-[#0D0520]'
const BTN_GHOST =
  'px-4 py-2 rounded-md text-sm font-medium text-[#A78BCC] border border-[rgba(124,77,255,0.25)] hover:border-[#7C4DFF] hover:text-[#F5F0FF] transition-colors'
const BTN_PRIMARY =
  'px-5 py-2 rounded-md text-sm font-bold text-white bg-[#7C4DFF] hover:bg-[#5B21B6] transition-colors'

// ─── FInput ───────────────────────────────────────────────────────────────────
function FInput({ label, req, val, placeholder, prefix, type = 'text', hint }: {
  label: string; req?: boolean; val?: string; placeholder?: string; prefix?: string; type?: string; hint?: string
}) {
  return (
    <div className="relative">
      <label className={`absolute -top-2 left-3 z-10 ${LBG} px-1 text-[10px] font-medium text-[#A78BCC] leading-none`}>
        {label}{req && <span className="text-[#7C4DFF] ml-0.5">*</span>}
      </label>
      {prefix ? (
        <div className="flex bg-[#0D0520] border border-[rgba(124,77,255,0.25)] rounded-md overflow-hidden focus-within:border-[#7C4DFF] transition-colors">
          <span className="flex items-center px-3 text-xs text-[#6B4E8A] border-r border-[rgba(124,77,255,0.18)] shrink-0 whitespace-nowrap">
            {prefix}
          </span>
          <input type={type} defaultValue={val} placeholder={placeholder} className="bg-transparent flex-1 px-3 py-2.5 text-sm text-[#F5F0FF] placeholder:text-[#6B4E8A] focus:outline-none" />
        </div>
      ) : (
        <input type={type} defaultValue={val} placeholder={placeholder} className={INP} />
      )}
      {hint && <p className="text-[10px] text-[#6B4E8A] mt-1">{hint}</p>}
    </div>
  )
}

// ─── FSelect ──────────────────────────────────────────────────────────────────
function FSelect({ label, req, opts, val }: {
  label: string; req?: boolean; opts: string[]; val?: string
}) {
  return (
    <div className="relative">
      <label className={`absolute -top-2 left-3 z-10 ${LBG} px-1 text-[10px] font-medium text-[#A78BCC] leading-none`}>
        {label}{req && <span className="text-[#7C4DFF] ml-0.5">*</span>}
      </label>
      <div className="relative">
        <select defaultValue={val ?? ''} className={INP + ' appearance-none pr-8 cursor-pointer'}>
          {opts.map((o) => <option key={o} value={o}>{o}</option>)}
        </select>
        <ChevronDown size={13} className="absolute right-3 top-1/2 -translate-y-1/2 text-[#A78BCC] pointer-events-none" />
      </div>
    </div>
  )
}

// ─── FTextarea ────────────────────────────────────────────────────────────────
function FTextarea({ label, req, placeholder, rows = 4 }: {
  label: string; req?: boolean; placeholder?: string; rows?: number
}) {
  return (
    <div className="relative">
      <label className="text-xs font-medium text-[#A78BCC] block mb-1.5">
        {label}{req && <span className="text-[#7C4DFF] ml-0.5">*</span>}
      </label>
      <div className="rounded-md border border-[rgba(124,77,255,0.25)] bg-[#0D0520] focus-within:border-[#7C4DFF] transition-colors overflow-hidden">
        <textarea
          rows={rows}
          placeholder={placeholder}
          className="w-full bg-transparent px-3 py-2.5 text-sm text-[#F5F0FF] placeholder:text-[#6B4E8A] focus:outline-none resize-none"
        />
      </div>
    </div>
  )
}

// ─── Toggle ──────────────────────────────────────────────────────────────────
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

// ─── Horary table ─────────────────────────────────────────────────────────────
const DAYS_INIT = [
  { label: 'Seg:', aber: '09:00', fec: '18:00', aberto: false },
  { label: 'Ter:', aber: '09:00', fec: '18:00', aberto: false },
  { label: 'Qua:', aber: '09:00', fec: '18:00', aberto: false },
  { label: 'Qui:', aber: '09:00', fec: '18:00', aberto: false },
  { label: 'Sex:', aber: '09:00', fec: '18:00', aberto: false },
  { label: 'Sáb:', aber: '09:00', fec: '18:00', aberto: false },
  { label: 'Dom:', aber: '09:00', fec: '18:00', aberto: false },
]

function HorarioTable() {
  const [days, setDays] = useState(DAYS_INIT)
  return (
    <div className="space-y-2.5">
      {days.map((d, i) => (
        <div key={d.label} className="flex items-center gap-3">
          <span className="text-sm font-medium text-[#A78BCC] w-10 shrink-0">{d.label}</span>
          <div className="relative flex-1">
            <label className={`absolute -top-2 left-3 z-10 ${LBG} px-1 text-[10px] font-medium text-[#A78BCC] leading-none`}>Abertura</label>
            <input type="time" defaultValue={d.aber} disabled={!d.aberto} className={INP + (!d.aberto ? ' opacity-40 cursor-not-allowed' : '')} />
          </div>
          <div className="relative flex-1">
            <label className={`absolute -top-2 left-3 z-10 ${LBG} px-1 text-[10px] font-medium text-[#A78BCC] leading-none`}>Fechamento</label>
            <input type="time" defaultValue={d.fec} disabled={!d.aberto} className={INP + (!d.aberto ? ' opacity-40 cursor-not-allowed' : '')} />
          </div>
          <label className="flex items-center gap-2 cursor-pointer">
            <input
              type="checkbox"
              checked={d.aberto}
              onChange={() => setDays((prev) => prev.map((x, j) => j === i ? { ...x, aberto: !x.aberto } : x))}
              className="accent-[#7C4DFF] w-4 h-4"
            />
            <span className="text-sm text-[#A78BCC]">Aberto</span>
          </label>
        </div>
      ))}
    </div>
  )
}

// ─── Types ───────────────────────────────────────────────────────────────────
interface ProfissionalApi {
  id: string
  nome: string
  email: string
  telefone?: string
  tipo?: string
  conselho?: string
  numeroConselho?: string
  especialidade?: string
  genero?: string
  duracaoSessao?: number
  periodoMinimo?: string
  periodoMaximo?: string
  tempoAntecedencia?: string
  disponivel?: boolean
  cep?: string
  logradouro?: string
  numero?: string
  complemento?: string
  bairro?: string
  cidade?: string
  empresaId?: string
  telefoneComercial?: string
  observacoes?: string
}

interface TabAutoProps {
  prof: ProfissionalApi
  empresaId: string | null
}

// ─── TAB: AUTO AGENDAMENTO ────────────────────────────────────────────────────
function TabAutoAgendamento({ prof, empresaId }: TabAutoProps) {
  const [form, setForm] = useState<Partial<ProfissionalApi>>(() => ({ ...prof }))
  const [saving, setSaving] = useState(false)
  const [saved, setSaved] = useState(false)
  const [saveError, setSaveError] = useState<string | null>(null)
  const [showForm, setShowForm] = useState(false)

  // Keep form in sync when a different prof is selected
  const prevProfId = useRef(prof.id)
  if (prevProfId.current !== prof.id) {
    prevProfId.current = prof.id
    // Reset form to new prof data (outside render cycle — safe pattern)
    Promise.resolve().then(() => {
      setForm({ ...prof })
      setSaved(false)
      setSaveError(null)
    })
  }

  function setF<K extends keyof ProfissionalApi>(field: K, value: ProfissionalApi[K]) {
    setForm((p) => ({ ...p, [field]: value }))
    setSaved(false)
  }

  async function handleSave() {
    setSaving(true); setSaveError(null)
    try {
      const body: Record<string, unknown> = {
        nome: form.nome,
        telefone: form.telefone,
        tipo: form.tipo,
        conselho: form.conselho,
        numeroConselho: form.numeroConselho,
        especialidade: form.especialidade,
        genero: form.genero,
        duracaoSessao: form.duracaoSessao ? Number(form.duracaoSessao) : undefined,
        periodoMinimo: form.periodoMinimo,
        periodoMaximo: form.periodoMaximo,
        tempoAntecedencia: form.tempoAntecedencia,
        disponivel: form.disponivel,
        cep: form.cep,
        logradouro: form.logradouro,
        numero: form.numero,
        complemento: form.complemento,
        bairro: form.bairro,
        cidade: form.cidade,
        telefoneComercial: form.telefoneComercial,
        observacoes: form.observacoes,
      }
      Object.keys(body).forEach((k) => body[k] === undefined && delete body[k])
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/v1/usuarios/${prof.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      })
      if (!res.ok) throw new Error(`Erro ${res.status}`)
      setSaved(true)
    } catch (e) {
      setSaveError(e instanceof Error ? e.message : 'Erro ao salvar')
    } finally {
      setSaving(false)
    }
  }

  const clinicLink = empresaId ? `https://app.dev2b.tec.br/sites/empresa/${empresaId}` : ''
  const profLink = `https://app.dev2b.tec.br/sites/profissional/${prof.id}`

  return (
    <div className="space-y-6">
      {/* Hero banner */}
      <div className="rounded-xl bg-gradient-to-r from-[#E8F4FD] to-[#D0EBFF] border border-[rgba(56,189,248,0.3)] p-5 flex items-center gap-5">
        <div className="w-20 h-20 rounded-xl bg-[#3B82F6] flex items-center justify-center shrink-0">
          <svg viewBox="0 0 80 80" width="80" height="80" fill="none">
            <rect width="80" height="80" rx="12" fill="#3B82F6" />
            <rect x="12" y="16" width="56" height="48" rx="4" fill="white" opacity="0.9" />
            <rect x="20" y="8" width="8" height="16" rx="4" fill="#1D4ED8" />
            <rect x="52" y="8" width="8" height="16" rx="4" fill="#1D4ED8" />
            <rect x="20" y="36" width="40" height="6" rx="2" fill="#3B82F6" opacity="0.4" />
            <rect x="20" y="48" width="24" height="6" rx="2" fill="#3B82F6" opacity="0.4" />
            <circle cx="58" cy="51" r="10" fill="#22C55E" />
            <path d="M53 51l3 3 6-6" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        </div>
        <div>
          <div className="flex items-center gap-1.5 mb-1">
            <div className="w-4 h-4 rounded-full bg-[#7C4DFF] flex items-center justify-center shrink-0">
              <Info size={10} className="text-white" />
            </div>
            <h3 className="text-base font-bold text-[#1E3A5F]">Auto Agendamento</h3>
          </div>
          <p className="text-sm text-[#374151]">
            Com a funcionalidade de Auto Agendamento, os seus clientes terão a possibilidade de realizar os próprios agendamentos das suas consultas.
            Divulgue seu link de Auto Agendamento em suas redes sociais, sites, WhatsApp etc.
          </p>
        </div>
      </div>

      {/* Profissional disponível */}
      <div className="flex items-center justify-between">
        <h3 className="text-sm font-semibold text-[#F5F0FF]">Auto Agendamento</h3>
        <div className="flex items-center gap-2">
          <span className="text-xs text-[#A78BCC]">Profissional Disponível?</span>
          <div className="flex rounded-md overflow-hidden border border-[rgba(124,77,255,0.25)]">
            <button
              onClick={() => setF('disponivel', true)}
              className={`px-3 py-1.5 text-xs font-semibold transition-colors ${form.disponivel !== false ? 'bg-[#7C4DFF] text-white' : 'text-[#A78BCC] hover:text-[#F5F0FF]'}`}
            >Sim</button>
            <button
              onClick={() => setF('disponivel', false)}
              className={`px-3 py-1.5 text-xs font-semibold transition-colors ${form.disponivel === false ? 'bg-[#EF4444] text-white' : 'text-[#A78BCC] hover:text-[#F5F0FF]'}`}
            >Não</button>
          </div>
        </div>
      </div>
      <p className="text-xs text-[#A78BCC] -mt-4">Configure e acesse as configurações do Auto Agendamento do profissional.</p>

      {/* Links */}
      <div className={`grid gap-4 ${clinicLink ? 'grid-cols-2' : 'grid-cols-1'}`}>
        {clinicLink && (
          <div>
            <p className="text-xs font-medium text-[#A78BCC] mb-1.5">Link Global da Clínica</p>
            <div className="flex items-center gap-2">
              <input readOnly value={clinicLink} className={INP + ' flex-1 text-xs'} />
              <CopyLink url={clinicLink} />
            </div>
          </div>
        )}
        <div>
          <p className="text-xs font-medium text-[#A78BCC] mb-1.5">Link do Profissional</p>
          <div className="flex items-center gap-2">
            <input readOnly value={profLink} className={INP + ' flex-1 text-xs'} />
            <CopyLink url={profLink} />
          </div>
        </div>
      </div>

      {/* Dados do profissional */}
      <div className="grid grid-cols-3 gap-4">
        <CFInput label="Nome" req value={form.nome ?? ''} onChange={(v) => setF('nome', v)} />
        <CFInput label="Email" req value={form.email ?? ''} disabled />
        <CFSelect label="Gênero" opts={['Masculino', 'Feminino', 'Outro', 'Prefiro não informar']} value={form.genero ?? ''} onChange={(v) => setF('genero', v)} />
        <CFSelect label="Tipo" req opts={['Dentista', 'Médico', 'Fisioterapeuta', 'Psicólogo', 'Nutricionista', 'Enfermeiro', 'Outro']} value={form.tipo ?? ''} onChange={(v) => setF('tipo', v)} />
        <CFInput label="Especialidade" value={form.especialidade ?? ''} onChange={(v) => setF('especialidade', v)} />
        <CFSelect label="Conselho" opts={['CRM', 'CRO', 'CFP', 'CREFITO', 'CRN', 'COREN', 'Outro']} value={form.conselho ?? ''} onChange={(v) => setF('conselho', v)} />
        <CFInput label="Número do conselho" value={form.numeroConselho ?? ''} onChange={(v) => setF('numeroConselho', v)} />
        <CFSelect label="Duração da sessão (min)" req opts={['20', '30', '40', '45', '50', '60', '90', '120']} value={form.duracaoSessao ? String(form.duracaoSessao) : ''} onChange={(v) => setF('duracaoSessao', v ? Number(v) : undefined)} />
        <CFInput label="CEP" req value={form.cep ?? ''} onChange={(v) => setF('cep', v)} />
        <CFInput label="Logradouro" req value={form.logradouro ?? ''} onChange={(v) => setF('logradouro', v)} />
        <div className="grid grid-cols-2 gap-3">
          <CFInput label="Número" req value={form.numero ?? ''} onChange={(v) => setF('numero', v)} />
          <CFInput label="Complemento" value={form.complemento ?? ''} onChange={(v) => setF('complemento', v)} />
        </div>
        <CFInput label="Bairro" req value={form.bairro ?? ''} onChange={(v) => setF('bairro', v)} />
        <CFInput label="Cidade" req value={form.cidade ?? ''} onChange={(v) => setF('cidade', v)} />
        <CFInput label="Celular" req value={form.telefone ?? ''} onChange={(v) => setF('telefone', v)} />
        <CFInput label="Telefone comercial" value={form.telefoneComercial ?? ''} onChange={(v) => setF('telefoneComercial', v)} />
      </div>

      <div className="grid grid-cols-3 gap-4">
        <CFSelect label="Período mínimo para agendamento" opts={['A partir de hoje', 'A partir de amanhã', 'Após 2 dias', 'Após 3 dias', 'Após 1 semana']} value={form.periodoMinimo ?? ''} onChange={(v) => setF('periodoMinimo', v)} />
        <CFSelect label="Período máximo para agendamento" opts={['Até 1 semana', 'Até 2 semanas', 'Até 1 mês', 'Até 2 meses', 'Até 3 meses', 'Até 6 meses']} value={form.periodoMaximo ?? ''} onChange={(v) => setF('periodoMaximo', v)} />
        <CFSelect label="Tempo de Antecedência" opts={['Sem restrição', '1 hora antes', '2 horas antes', '6 horas antes', '12 horas antes', '24 horas antes', '48 horas antes']} value={form.tempoAntecedencia ?? ''} onChange={(v) => setF('tempoAntecedencia', v)} />
      </div>

      {/* Observações */}
      <div>
        <p className="text-xs font-medium text-[#A78BCC] mb-1.5">Observações</p>
        <textarea
          rows={4}
          value={form.observacoes ?? ''}
          onChange={(e) => setF('observacoes', e.target.value)}
          className={INP + ' resize-none'}
          placeholder="Informações adicionais sobre o profissional..."
        />
      </div>

      <div className="flex items-center justify-between pt-4 border-t border-[rgba(124,77,255,0.12)]">
        <div>
          {saveError && <p className="text-xs text-red-400">{saveError}</p>}
          {saved && <p className="text-xs text-green-400">Alterações salvas com sucesso.</p>}
        </div>
        <button onClick={handleSave} disabled={saving} className={BTN_PRIMARY + ' flex items-center gap-2 disabled:opacity-60'}>
          {saving && <span className="inline-block w-3.5 h-3.5 border-2 border-white/30 border-t-white rounded-full animate-spin" />}
          {saving ? 'Salvando...' : 'Salvar'}
        </button>
      </div>
    </div>
  )
}

// ─── Controlled helpers (used in TabAutoAgendamento) ─────────────────────────
function CFInput({ label, req, value, onChange, disabled }: {
  label: string; req?: boolean; value: string; onChange?: (v: string) => void; disabled?: boolean
}) {
  return (
    <div className="relative">
      <label className={`absolute -top-2 left-3 z-10 ${LBG} px-1 text-[10px] font-medium text-[#A78BCC] leading-none`}>
        {label}{req && <span className="text-[#7C4DFF] ml-0.5">*</span>}
      </label>
      <input
        type="text"
        value={value}
        onChange={(e) => onChange?.(e.target.value)}
        disabled={disabled}
        className={INP + (disabled ? ' opacity-60 cursor-not-allowed' : '')}
      />
    </div>
  )
}

function CFSelect({ label, req, opts, value, onChange }: {
  label: string; req?: boolean; opts: string[]; value: string; onChange: (v: string) => void
}) {
  return (
    <div className="relative">
      <label className={`absolute -top-2 left-3 z-10 ${LBG} px-1 text-[10px] font-medium text-[#A78BCC] leading-none`}>
        {label}{req && <span className="text-[#7C4DFF] ml-0.5">*</span>}
      </label>
      <div className="relative">
        <select value={value} onChange={(e) => onChange(e.target.value)} className={INP + ' appearance-none pr-8 cursor-pointer'}>
          <option value="">Selecione</option>
          {opts.map((o) => <option key={o} value={o}>{o}</option>)}
        </select>
        <ChevronDown size={13} className="absolute right-3 top-1/2 -translate-y-1/2 text-[#A78BCC] pointer-events-none" />
      </div>
    </div>
  )
}

function CopyLink({ url }: { url: string }) {
  const [copied, setCopied] = useState(false)
  return (
    <>
      <button onClick={async () => { await navigator.clipboard.writeText(url); setCopied(true); setTimeout(() => setCopied(false), 2000) }}
        className="flex items-center gap-1.5 px-3 py-2 rounded-md bg-[rgba(124,77,255,0.12)] text-[#7C4DFF] text-xs font-semibold border border-[rgba(124,77,255,0.25)] hover:border-[#7C4DFF] transition-colors shrink-0">
        {copied ? <Check size={12} className="text-green-400" /> : <Copy size={12} />}
        {copied ? 'Copiado!' : 'Copiar'}
      </button>
      <a href={url} target="_blank" rel="noopener noreferrer"
        className="flex items-center gap-1.5 px-3 py-2 rounded-md bg-[rgba(34,197,94,0.10)] text-[#22C55E] text-xs font-semibold border border-[rgba(34,197,94,0.2)] hover:border-[#22C55E] transition-colors shrink-0">
        <ExternalLink size={12} />Abrir
      </a>
    </>
  )
}

// ─── Color Picker ────────────────────────────────────────────────────────────
const PRESET_SWATCHES = ['#EF4444','#F97316','#EAB308','#22C55E','#14B8A6','#3B82F6','#6366F1','#8B5CF6','#EC4899','#000000','#FFFFFF','#7C4DFF']

function hexToHsv(hex: string): [number, number, number] {
  const clean = hex.replace('#', '')
  if (!/^[0-9A-Fa-f]{6}$/.test(clean)) return [0, 0, 100]
  const r = parseInt(clean.slice(0,2),16)/255, g = parseInt(clean.slice(2,4),16)/255, b = parseInt(clean.slice(4,6),16)/255
  const max = Math.max(r,g,b), min = Math.min(r,g,b), d = max - min
  let h = 0
  if (d !== 0) {
    if (max === r) h = ((g-b)/d + 6) % 6
    else if (max === g) h = (b-r)/d + 2
    else h = (r-g)/d + 4
    h *= 60
  }
  return [Math.round(h), max === 0 ? 0 : Math.round(d/max*100), Math.round(max*100)]
}

function hsvToHex(h: number, s: number, v: number): string {
  const s1=s/100, v1=v/100, c=v1*s1, x=c*(1-Math.abs(((h/60)%2)-1)), m=v1-c
  let r=0,g=0,b=0
  if(h<60){r=c;g=x}else if(h<120){r=x;g=c}else if(h<180){g=c;b=x}
  else if(h<240){g=x;b=c}else if(h<300){r=x;b=c}else{r=c;b=x}
  const hex=(n:number)=>Math.round((n+m)*255).toString(16).padStart(2,'0').toUpperCase()
  return `#${hex(r)}${hex(g)}${hex(b)}`
}

function ColorPickerDropdown({ value, onChange }: { value: string; onChange: (v: string) => void }) {
  const init = hexToHsv(value)
  const [open, setOpen] = useState(false)
  const [hue, setHue] = useState(init[0])
  const [sat, setSat] = useState(init[1])
  const [bri, setBri] = useState(init[2])
  const [alpha, setAlpha] = useState(100)
  const [hexInput, setHexInput] = useState(value.replace('#','').toUpperCase())
  const gradRef = useRef<HTMLDivElement>(null)
  const dragging = useRef(false)

  function applyHsv(h: number, s: number, v: number) {
    const hex = hsvToHex(h, s, v)
    setHexInput(hex.replace('#',''))
    onChange(hex)
  }

  function pickFromGrad(e: React.PointerEvent<HTMLDivElement>) {
    if (!gradRef.current) return
    const r = gradRef.current.getBoundingClientRect()
    const x = Math.max(0, Math.min(1, (e.clientX - r.left) / r.width))
    const y = Math.max(0, Math.min(1, (e.clientY - r.top) / r.height))
    const ns = Math.round(x * 100), nb = Math.round((1-y) * 100)
    setSat(ns); setBri(nb); applyHsv(hue, ns, nb)
  }

  function handleHexInput(raw: string) {
    const clean = raw.replace('#','').toUpperCase()
    setHexInput(clean)
    if (/^[0-9A-Fa-f]{6}$/.test(clean)) {
      const [h,s,v] = hexToHsv('#'+clean)
      setHue(h); setSat(s); setBri(v); onChange('#'+clean)
    }
  }

  const currentHex = hsvToHex(hue, sat, bri)
  const hueBg = 'linear-gradient(to right,#f00 0%,#ff0 17%,#0f0 33%,#0ff 50%,#00f 67%,#f0f 83%,#f00 100%)'
  const gradBg = `linear-gradient(to top,rgba(0,0,0,1),rgba(0,0,0,0)),linear-gradient(to right,rgba(255,255,255,1),hsl(${hue},100%,50%))`

  return (
    <div className="relative">
      <label className="block text-[10px] font-medium text-[#A78BCC] mb-1.5">
        Cor Principal<span className="text-[#7C4DFF] ml-0.5">*</span>
      </label>
      <button type="button" onClick={() => setOpen(v => !v)}
        className="flex items-center gap-2 px-2 py-2 rounded-md border border-[rgba(124,77,255,0.25)] hover:border-[#7C4DFF] transition-colors w-44 bg-[#0D0520]">
        <span className="w-24 h-5 rounded flex-shrink-0 border border-[rgba(255,255,255,0.1)]" style={{ background: value }} />
        <span className="text-xs text-[#A78BCC] font-mono flex-1 text-left truncate">{value}</span>
        <ChevronDown size={12} className="text-[#A78BCC] flex-shrink-0" />
      </button>

      {open && (
        <div className="absolute z-50 top-full mt-2 left-0 bg-[#1A0A38] border border-[rgba(124,77,255,0.30)] rounded-xl shadow-2xl p-3 w-60 select-none">

          {/* Gradient area */}
          <div
            ref={gradRef}
            className="w-full h-40 rounded-lg mb-3 cursor-crosshair relative overflow-hidden"
            style={{ background: gradBg }}
            onPointerDown={(e) => { dragging.current = true; gradRef.current?.setPointerCapture(e.pointerId); pickFromGrad(e) }}
            onPointerMove={(e) => { if (dragging.current) pickFromGrad(e) }}
            onPointerUp={() => { dragging.current = false }}
          >
            <div className="absolute w-3.5 h-3.5 rounded-full border-2 border-white pointer-events-none -translate-x-1/2 -translate-y-1/2"
              style={{ left:`${sat}%`, top:`${100-bri}%`, boxShadow:'0 0 0 1px rgba(0,0,0,0.4),0 1px 4px rgba(0,0,0,0.6)' }} />
          </div>

          {/* Hue slider */}
          <style>{`.hue-slider::-webkit-slider-thumb{appearance:none;width:12px;height:12px;border-radius:50%;background:white;border:1px solid rgba(0,0,0,0.3);box-shadow:0 1px 3px rgba(0,0,0,0.5);cursor:pointer}.hue-slider::-moz-range-thumb{width:12px;height:12px;border-radius:50%;background:white;border:1px solid rgba(0,0,0,0.3);cursor:pointer}.alpha-slider::-webkit-slider-thumb{appearance:none;width:12px;height:12px;border-radius:50%;background:white;border:1px solid rgba(0,0,0,0.3);box-shadow:0 1px 3px rgba(0,0,0,0.5);cursor:pointer}.alpha-slider::-moz-range-thumb{width:12px;height:12px;border-radius:50%;background:white;border:1px solid rgba(0,0,0,0.3);cursor:pointer}`}</style>
          <input type="range" min={0} max={360} value={hue}
            onChange={(e) => { const h=Number(e.target.value); setHue(h); applyHsv(h,sat,bri) }}
            className="hue-slider w-full h-3 rounded-full appearance-none outline-none mb-2 cursor-pointer"
            style={{ background: hueBg }} />

          {/* Alpha slider */}
          <input type="range" min={0} max={100} value={alpha}
            onChange={(e) => setAlpha(Number(e.target.value))}
            className="alpha-slider w-full h-3 rounded-full appearance-none outline-none mb-3 cursor-pointer"
            style={{ background: `linear-gradient(to right,transparent,${currentHex}),repeating-conic-gradient(#555 0% 25%,#333 0% 50%) 0 0/10px 10px` }} />

          {/* Preview + inputs */}
          <div className="flex items-center gap-1.5 mb-3">
            <span className="w-7 h-7 rounded flex-shrink-0 border border-[rgba(255,255,255,0.15)]" style={{ background: currentHex }} />
            <div className="flex items-center gap-0.5 flex-1 bg-[#0D0520] border border-[rgba(124,77,255,0.25)] rounded-md px-1.5 py-1 focus-within:border-[#7C4DFF] transition-colors">
              <span className="text-xs text-[#6B4E8A]">#</span>
              <input type="text" maxLength={6} value={hexInput}
                onChange={(e) => handleHexInput(e.target.value)}
                className="bg-transparent flex-1 text-xs text-[#F5F0FF] font-mono focus:outline-none w-14" />
            </div>
            <div className="flex items-center bg-[#0D0520] border border-[rgba(124,77,255,0.25)] rounded-md px-1.5 py-1 w-14 focus-within:border-[#7C4DFF] transition-colors">
              <input type="number" min={0} max={100} value={alpha}
                onChange={(e) => setAlpha(Math.max(0,Math.min(100,Number(e.target.value))))}
                className="bg-transparent w-full text-xs text-[#F5F0FF] font-mono focus:outline-none" />
              <span className="text-[10px] text-[#6B4E8A] ml-0.5">%</span>
            </div>
            <button type="button" onClick={() => setOpen(false)}
              className="px-2 py-1.5 rounded-md bg-[#7C4DFF] text-white text-xs font-semibold hover:bg-[#5B21B6] transition-colors">OK</button>
          </div>

          {/* Preset swatches */}
          <div className="flex gap-1 flex-wrap">
            {PRESET_SWATCHES.map((c) => (
              <button key={c} type="button" onClick={() => {
                const [h,s,v] = hexToHsv(c); setHue(h); setSat(s); setBri(v)
                setHexInput(c.replace('#','').toUpperCase()); onChange(c)
              }}
                className="w-5 h-5 rounded-sm border-2 hover:scale-110 transition-transform flex-shrink-0"
                style={{ background:c, borderColor: value===c ? '#fff' : 'transparent' }} />
            ))}
          </div>
        </div>
      )}
    </div>
  )
}

// ─── TAB: MEU SITE & BLOG ─────────────────────────────────────────────────────
type SiteSubTab = 'imagens' | 'textos' | 'redes'

const SITE_SUBTABS: { id: SiteSubTab; label: string }[] = [
  { id: 'imagens', label: 'Imagens do Site' },
  { id: 'textos',  label: 'Textos do Site'  },
  { id: 'redes',   label: 'Redes Sociais e Contatos' },
]

type BlogPost = { id: string; titulo: string; data: string; status: 'Publicado' | 'Rascunho' | 'Preview' }

function ImageUploadBox({ label, desc, wide }: { label: string; desc: string; wide?: boolean }) {
  return (
    <div className="flex-1">
      <p className="text-sm font-semibold text-[#F5F0FF] mb-1">{label}</p>
      <p className="text-xs text-[#A78BCC] mb-3">{desc}</p>
      <div className={`rounded-xl border-2 border-dashed border-[rgba(124,77,255,0.25)] bg-[#150830] flex items-center justify-center cursor-pointer hover:border-[#7C4DFF] transition-colors ${wide ? 'h-32 w-52' : 'h-32 w-36'}`}>
        <User size={36} className="text-[#2D1B4E]" strokeWidth={1} />
      </div>
    </div>
  )
}

function TabMeuSite({ prof }: { prof: ProfissionalApi }) {
  const [configured, setConfigured] = useState(false)
  const [siteConfigId, setSiteConfigId] = useState<string | null>(null)
  const [linkSlug, setLinkSlug] = useState('')
  const [corPrincipal, setCorPrincipal] = useState('#00B4A6')
  const [disponibilidade, setDisponibilidade] = useState<'ativo' | 'inativo'>('ativo')
  const [sobreMim, setSobreMim] = useState('')
  const [servicos, setServicos] = useState('')
  const [slogan, setSlogan] = useState('')
  const [tituloPagina, setTituloPagina] = useState('')
  const [whatsapp, setWhatsapp] = useState('')
  const [emailContato, setEmailContato] = useState('')
  const [telefone, setTelefone] = useState('')
  const [websiteLink, setWebsiteLink] = useState('')
  const [instagram, setInstagram] = useState('')
  const [facebook, setFacebook] = useState('')
  const [linkedin, setLinkedin] = useState('')
  const [youtube, setYoutube] = useState('')
  const [saving, setSaving] = useState(false)
  const [saved, setSaved] = useState(false)
  const [saveError, setSaveError] = useState<string | null>(null)
  const [subTab, setSubTab] = useState<SiteSubTab>('imagens')
  const [blogSearch, setBlogSearch] = useState('')
  const [blogPage, setBlogPage] = useState(1)
  const [blogPageSize, setBlogPageSize] = useState(10)
  const [blogPageSizeOpen, setBlogPageSizeOpen] = useState(false)
  const [posts, setPosts] = useState<BlogPost[]>([])
  const [novaPublOpen, setNovaPublOpen] = useState(false)
  const [novaPublTitulo, setNovaPublTitulo] = useState('')
  const [novaPublData, setNovaPublData] = useState('')
  const [novaPublStatus, setNovaPublStatus] = useState('')
  const [novaPublStatusOpen, setNovaPublStatusOpen] = useState(false)
  const [novaPublConteudo, setNovaPublConteudo] = useState('')
  const [novaPublImageSrc, setNovaPublImageSrc] = useState<string | null>(null)
  const novaPublImageRef = useRef<HTMLInputElement>(null)
  const [logoSrc, setLogoSrc] = useState<string | null>(null)
  const [perfilSrc, setPerfilSrc] = useState<string | null>(null)
  const [bannerSrc, setBannerSrc] = useState<string | null>(null)
  const logoRef = useRef<HTMLInputElement>(null)
  const perfilRef = useRef<HTMLInputElement>(null)
  const bannerRef = useRef<HTMLInputElement>(null)

  // Load site config when prof changes
  const prevProfId = useRef<string | null>(null)
  if (prevProfId.current !== prof.id) {
    prevProfId.current = prof.id
    Promise.resolve().then(async () => {
      try {
        const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/v1/site-config/usuario/${prof.id}`)
        if (res.status === 204 || !res.ok) { setConfigured(false); return }
        const data = await res.json()
        setSiteConfigId(data.id)
        setLinkSlug(data.linkSlug ?? '')
        setCorPrincipal(data.corPrincipal ?? '#00B4A6')
        setDisponibilidade((data.disponibilidade ?? 'ativo') as 'ativo' | 'inativo')
        setSobreMim(data.sobreMim ?? '')
        setServicos(data.servicos ?? '')
        setSlogan(data.slogan ?? '')
        setTituloPagina(data.tituloPagina ?? '')
        setWhatsapp(data.whatsapp ?? '')
        setEmailContato(data.emailContato ?? '')
        setTelefone(data.telefone ?? '')
        setWebsiteLink(data.websiteLink ?? '')
        setInstagram(data.instagram ?? '')
        setFacebook(data.facebook ?? '')
        setLinkedin(data.linkedin ?? '')
        setYoutube(data.youtube ?? '')
        setPosts((data.posts ?? []).map((p: { id: string; titulo: string; dataPublicacao?: string; status: string }) => ({
          id: p.id,
          titulo: p.titulo,
          data: p.dataPublicacao ? new Date(p.dataPublicacao).toLocaleDateString('pt-BR') : '',
          status: p.status === 'PUBLICADO' ? 'Publicado' : p.status === 'PREVIEW' ? 'Preview' : 'Rascunho',
        } as BlogPost)))
        setConfigured(true)
      } catch { setConfigured(false) }
    })
  }

  async function handleSave() {
    setSaving(true); setSaveError(null); setSaved(false)
    try {
      const body = {
        linkSlug: linkSlug || undefined,
        corPrincipal: corPrincipal || undefined,
        disponibilidade,
        sobreMim: sobreMim || undefined,
        servicos: servicos || undefined,
        slogan: slogan || undefined,
        tituloPagina: tituloPagina || undefined,
        whatsapp: whatsapp || undefined,
        emailContato: emailContato || undefined,
        telefone: telefone || undefined,
        websiteLink: websiteLink || undefined,
        instagram: instagram || undefined,
        facebook: facebook || undefined,
        linkedin: linkedin || undefined,
        youtube: youtube || undefined,
      }
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/v1/site-config/usuario/${prof.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      })
      if (!res.ok) throw new Error(`Erro ${res.status}`)
      const data = await res.json()
      setSiteConfigId(data.id)
      setConfigured(true)
      setSaved(true)
    } catch (e) {
      setSaveError(e instanceof Error ? e.message : 'Erro ao salvar')
    } finally {
      setSaving(false)
    }
  }

  function handleImageFile(file: File, set: (src: string) => void) {
    const reader = new FileReader()
    reader.onload = (e) => { if (e.target?.result) set(e.target.result as string) }
    reader.readAsDataURL(file)
  }

  const filteredPosts = posts.filter((p) => p.titulo.toLowerCase().includes(blogSearch.toLowerCase()))
  const totalPages = Math.max(1, Math.ceil(filteredPosts.length / blogPageSize))
  const pagePosts = filteredPosts.slice((blogPage - 1) * blogPageSize, blogPage * blogPageSize)

  async function savePost() {
    if (!novaPublTitulo.trim() || !siteConfigId) return
    const statusMap: Record<string, string> = { 'Publicado': 'PUBLICADO', 'Preview': 'PREVIEW', 'Rascunho': 'RASCUNHO' }
    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/v1/site-config/usuario/${prof.id}/blog`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          titulo: novaPublTitulo.trim(),
          dataPublicacao: novaPublData || null,
          status: statusMap[novaPublStatus] ?? 'RASCUNHO',
          conteudo: novaPublConteudo,
        }),
      })
      if (!res.ok) throw new Error(`Erro ${res.status}`)
      const p = await res.json()
      setPosts((prev) => [...prev, {
        id: p.id,
        titulo: p.titulo,
        data: p.dataPublicacao ? new Date(p.dataPublicacao).toLocaleDateString('pt-BR') : '',
        status: p.status === 'PUBLICADO' ? 'Publicado' : p.status === 'PREVIEW' ? 'Preview' : 'Rascunho',
      } as BlogPost])
    } catch { /* silently ignore */ }
    setNovaPublTitulo(''); setNovaPublData(''); setNovaPublStatus(''); setNovaPublConteudo(''); setNovaPublImageSrc(null)
    setNovaPublOpen(false)
  }

  async function deletePost(id: string) {
    try {
      await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/v1/site-config/blog/${id}`, { method: 'DELETE' })
      setPosts((prev) => prev.filter((x) => x.id !== id))
    } catch { /* silently ignore */ }
  }

  if (!configured) {
    return (
      <div className="space-y-6">
        {/* Hero banner */}
        <div className="rounded-xl bg-gradient-to-r from-[#E8F4FD] to-[#D0EBFF] border border-[rgba(56,189,248,0.3)] p-5 flex items-center gap-5">
          <div className="w-20 h-20 rounded-xl bg-[#3B82F6] flex items-center justify-center shrink-0">
            <svg viewBox="0 0 80 80" width="80" height="80" fill="none">
              <rect width="80" height="80" rx="12" fill="#3B82F6" />
              <rect x="8" y="16" width="64" height="48" rx="4" fill="white" opacity="0.9" />
              <rect x="8" y="16" width="64" height="10" rx="4" fill="#1D4ED8" opacity="0.7" />
              <circle cx="16" cy="21" r="3" fill="white" />
              <circle cx="26" cy="21" r="3" fill="white" />
              <circle cx="36" cy="21" r="3" fill="white" />
              <rect x="16" y="34" width="20" height="20" rx="2" fill="#7C4DFF" opacity="0.5" />
              <rect x="42" y="34" width="22" height="6" rx="2" fill="#3B82F6" opacity="0.4" />
              <rect x="42" y="44" width="14" height="6" rx="2" fill="#3B82F6" opacity="0.4" />
            </svg>
          </div>
          <div>
            <div className="flex items-center gap-1.5 mb-1">
              <div className="w-4 h-4 rounded-full bg-[#7C4DFF] flex items-center justify-center shrink-0">
                <Info size={10} className="text-white" />
              </div>
              <h3 className="text-base font-bold text-[#1E3A5F]">Meu Site & Blog</h3>
            </div>
            <p className="text-sm text-[#374151]">
              Tenha um site profissional para seu consultório divulgando seus serviços e uma plataforma para criar um blog, compartilhar artigos e informações relevantes para seus clientes.
            </p>
          </div>
        </div>
        <div className="space-y-3">
          <p className="text-sm text-[#A78BCC]">
            Este profissional ainda não tem um website configurado.{' '}
            <span className="text-[#7C4DFF]">Comece agora a sua configuração.</span>
          </p>
          <div className="flex items-center gap-3">
            <button onClick={() => setConfigured(true)} className={BTN_PRIMARY}>Configurar website</button>
            <button className="text-sm text-[#7C4DFF] hover:text-[#A78BCC] transition-colors">Saiba Mais</button>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* ── Header ── */}
      <div className="flex items-start justify-between">
        <div>
          <h3 className="text-sm font-semibold text-[#F5F0FF]">Meu Site & Blog</h3>
          <p className="text-xs text-[#A78BCC] mt-0.5">Configure as informações do website e blog.</p>
        </div>
        <a href={`https://site.dev2b.tec.br/p/${linkSlug}`} target="_blank" rel="noreferrer"
          className="flex items-center gap-1.5 px-3 py-2 rounded-lg text-xs font-semibold text-[#A78BCC] border border-[rgba(124,77,255,0.25)] hover:border-[#7C4DFF] hover:text-[#F5F0FF] transition-colors">
          <Eye size={13} /> Preview
        </a>
      </div>

      {/* ── Link + Cor + Disponibilidade ── */}
      <div className="flex items-end gap-4 flex-wrap">
        {/* Link da Página */}
        <div className="relative flex-1 min-w-[260px]">
          <label className={`absolute -top-2 left-3 z-10 ${LBG} px-1 text-[10px] font-medium text-[#A78BCC] leading-none`}>
            Link da Página<span className="text-[#7C4DFF] ml-0.5">*</span>
          </label>
          <div className="flex bg-[#0D0520] border border-[rgba(124,77,255,0.25)] rounded-md overflow-hidden focus-within:border-[#7C4DFF] transition-colors">
            <span className="flex items-center px-3 text-xs text-[#6B4E8A] border-r border-[rgba(124,77,255,0.18)] shrink-0 whitespace-nowrap">
              https://site.dev2b.tec.br/p/
            </span>
            <input
              type="text"
              value={linkSlug}
              onChange={(e) => setLinkSlug(e.target.value)}
              className="bg-transparent flex-1 px-3 py-2.5 text-sm text-[#F5F0FF] focus:outline-none"
            />
            <button className="px-3 text-[#A78BCC] hover:text-[#7C4DFF] transition-colors border-l border-[rgba(124,77,255,0.18)]">
              <Copy size={13} />
            </button>
          </div>
          <p className="text-[10px] text-[#6B4E8A] mt-1">Este será o link público para acessar este site.</p>
        </div>

        {/* Cor Principal */}
        <ColorPickerDropdown value={corPrincipal} onChange={setCorPrincipal} />

        {/* Disponibilidade */}
        <div>
          <label className="block text-[10px] font-medium text-[#A78BCC] mb-1.5">
            Disponibilidade do Site<span className="text-[#7C4DFF] ml-0.5">*</span>
          </label>
          <div className="flex rounded-md overflow-hidden border border-[rgba(124,77,255,0.25)]">
            <button
              onClick={() => setDisponibilidade('ativo')}
              className={`px-4 py-2 text-xs font-semibold transition-colors ${disponibilidade === 'ativo' ? 'bg-[#7C4DFF] text-white' : 'text-[#A78BCC] hover:text-[#F5F0FF]'}`}
            >Ativo</button>
            <button
              onClick={() => setDisponibilidade('inativo')}
              className={`px-4 py-2 text-xs font-semibold transition-colors ${disponibilidade === 'inativo' ? 'bg-[#EF4444] text-white' : 'text-[#A78BCC] hover:text-[#F5F0FF]'}`}
            >Inativo</button>
          </div>
        </div>
      </div>

      {/* ── Image sub-tabs ── */}
      <div className="border border-[rgba(124,77,255,0.18)] rounded-xl overflow-hidden">
        <div className="flex border-b border-[rgba(124,77,255,0.18)]">
          {SITE_SUBTABS.map(({ id, label }) => (
            <button
              key={id}
              onClick={() => setSubTab(id)}
              className={`px-5 py-3 text-sm font-medium border-b-2 -mb-px transition-colors ${
                subTab === id
                  ? 'text-[#7C4DFF] border-[#7C4DFF]'
                  : 'text-[#A78BCC] border-transparent hover:text-[#F5F0FF]'
              }`}
            >{label}</button>
          ))}
        </div>

        <div className="p-5">
          {subTab === 'imagens' && (
            <div className="flex gap-8 flex-wrap">
              {/* Logo da Clínica */}
              <div className="flex-1">
                <p className="text-sm font-semibold text-[#F5F0FF] mb-1">Logo da Clínica</p>
                <p className="text-xs text-[#A78BCC] mb-3">Este será o logo exibido em seu site.</p>
                <input ref={logoRef} type="file" accept="image/*" className="hidden"
                  onChange={(e) => { const f = e.target.files?.[0]; if (f) handleImageFile(f, setLogoSrc) }} />
                <div
                  onClick={() => logoRef.current?.click()}
                  className="relative rounded-xl border-2 border-dashed border-[rgba(124,77,255,0.25)] bg-[#150830] flex items-center justify-center cursor-pointer hover:border-[#7C4DFF] transition-colors h-28 w-48 overflow-hidden group"
                >
                  {logoSrc
                    ? <img src={logoSrc} alt="Logo" className="w-full h-full object-cover" />
                    : <User size={36} className="text-[#2D1B4E]" strokeWidth={1} />
                  }
                  <div className="absolute inset-0 flex items-center justify-center bg-black/30 opacity-0 group-hover:opacity-100 transition-opacity">
                    <div className="w-9 h-9 rounded-full bg-[#7C4DFF] flex items-center justify-center shadow-lg">
                      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/></svg>
                    </div>
                  </div>
                </div>
              </div>

              {/* Imagem de Perfil */}
              <div className="flex-1">
                <p className="text-sm font-semibold text-[#F5F0FF] mb-1">Imagem de Perfil Profissional</p>
                <p className="text-xs text-[#A78BCC] mb-3">Imagem profissional a ser exibida no em seu site.</p>
                <input ref={perfilRef} type="file" accept="image/*" className="hidden"
                  onChange={(e) => { const f = e.target.files?.[0]; if (f) handleImageFile(f, setPerfilSrc) }} />
                <div
                  onClick={() => perfilRef.current?.click()}
                  className="relative rounded-xl border-2 border-dashed border-[rgba(124,77,255,0.25)] bg-[#150830] flex items-center justify-center cursor-pointer hover:border-[#7C4DFF] transition-colors h-28 w-28 overflow-hidden group"
                >
                  {perfilSrc
                    ? <img src={perfilSrc} alt="Perfil" className="w-full h-full object-cover" />
                    : <User size={28} className="text-[#2D1B4E]" strokeWidth={1} />
                  }
                  <div className="absolute inset-0 flex items-center justify-center bg-black/30 opacity-0 group-hover:opacity-100 transition-opacity">
                    <div className="w-9 h-9 rounded-full bg-[#7C4DFF] flex items-center justify-center shadow-lg">
                      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/></svg>
                    </div>
                  </div>
                </div>
              </div>

              {/* Banner Principal */}
              <div className="flex-1">
                <p className="text-sm font-semibold text-[#F5F0FF] mb-1">Banner Principal</p>
                <p className="text-xs text-[#A78BCC] mb-3">Este banner será exibido na página inicial do seu site.</p>
                <input ref={bannerRef} type="file" accept="image/*" className="hidden"
                  onChange={(e) => { const f = e.target.files?.[0]; if (f) handleImageFile(f, setBannerSrc) }} />
                <div
                  onClick={() => bannerRef.current?.click()}
                  className="relative rounded-xl border-2 border-dashed border-[rgba(124,77,255,0.25)] bg-[#150830] flex items-center justify-center cursor-pointer hover:border-[#7C4DFF] transition-colors h-28 w-full min-w-[180px] overflow-hidden group"
                >
                  {bannerSrc
                    ? <img src={bannerSrc} alt="Banner" className="w-full h-full object-cover" />
                    : <div className="flex flex-col items-center gap-1 opacity-30"><svg width="40" height="28" viewBox="0 0 40 28" fill="none"><rect width="40" height="28" rx="3" fill="#7C4DFF"/><circle cx="12" cy="10" r="4" fill="white" opacity="0.5"/><path d="M0 22l10-8 8 6 8-10 14 16H0z" fill="white" opacity="0.4"/></svg></div>
                  }
                  <div className="absolute inset-0 flex items-center justify-center bg-black/30 opacity-0 group-hover:opacity-100 transition-opacity">
                    <div className="w-9 h-9 rounded-full bg-[#7C4DFF] flex items-center justify-center shadow-lg">
                      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/></svg>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {subTab === 'textos' && (
            <div className="space-y-5">
              <FTextarea label="Sobre mim" req rows={4} placeholder="Descrição sobre o trabalho e/ou experiências do profissional" />
              <FTextarea label="Serviços Oferecidos" rows={3} placeholder="Liste os principais serviços e tratamentos oferecidos" />
              <div className="grid grid-cols-2 gap-4">
                <FInput label="Slogan / Frase de Destaque" />
                <FInput label="Título da Página" />
              </div>
            </div>
          )}

          {subTab === 'redes' && (
            <div className="grid grid-cols-2 gap-4">
              <FInput label="WhatsApp" />
              <FInput label="Email" />
              <FInput label="Telefone" />
              <FInput label="Link do Website" />
              <FInput label="Instagram" prefix="https://instagram.com/" />
              <FInput label="Facebook"  prefix="https://facebook.com/" />
              <FInput label="LinkedIn"  prefix="https://linkedin.com/" />
              <FInput label="YouTube"   prefix="https://youtube.com/" />
            </div>
          )}
        </div>
      </div>

      {/* ── Blog ── */}
      <div className="rounded-xl border border-[rgba(124,77,255,0.18)] overflow-hidden">
        <div className="px-5 py-4 flex items-center justify-between border-b border-[rgba(124,77,255,0.12)]">
          <div>
            <div className="flex items-center gap-1.5">
              <h4 className="text-sm font-semibold text-[#F5F0FF]">Blog</h4>
              <button className="w-4 h-4 rounded-full bg-[rgba(124,77,255,0.18)] flex items-center justify-center" title="Gerencie publicações e artigos no seu blog.">
                <Info size={9} className="text-[#A78BCC]" />
              </button>
            </div>
            <p className="text-xs text-[#A78BCC] mt-0.5">Gerencie publicações e artigos no seu blog.</p>
          </div>
          <button
            onClick={() => setNovaPublOpen(true)}
            className="flex items-center gap-1 px-4 py-2 rounded-lg text-xs font-semibold text-[#7C4DFF] bg-[rgba(124,77,255,0.10)] border border-[rgba(124,77,255,0.25)] hover:border-[#7C4DFF] transition-colors"
          >
            <Plus size={13} /> Nova Publicação
          </button>
        </div>

        <div className="p-5 space-y-4">
          {/* Search */}
          <div className="relative w-52">
            <Search size={13} className="absolute left-3 top-1/2 -translate-y-1/2 text-[#6B4E8A]" />
            <input
              type="text"
              placeholder="Pesquisar"
              value={blogSearch}
              onChange={(e) => { setBlogSearch(e.target.value); setBlogPage(1) }}
              className={INP + ' pl-8 text-xs'}
            />
          </div>

          {/* Table */}
          <div className="rounded-lg border border-[rgba(124,77,255,0.15)] overflow-hidden">
            <div className="grid grid-cols-[1fr_160px_140px_100px] text-[10px] font-semibold text-[#6B4E8A] uppercase tracking-wide px-4 py-2.5 bg-[#0D0520] border-b border-[rgba(124,77,255,0.12)]">
              <button className="flex items-center gap-1 text-left hover:text-[#A78BCC] transition-colors"><ArrowUpDown size={10} />TÍTULO</button>
              <button className="flex items-center gap-1 hover:text-[#A78BCC] transition-colors"><ArrowUpDown size={10} />DATA</button>
              <button className="flex items-center gap-1 hover:text-[#A78BCC] transition-colors"><ArrowUpDown size={10} />STATUS</button>
              <span>AÇÕES</span>
            </div>

            {pagePosts.length === 0 ? (
              <div className="px-4 py-8 text-center text-sm text-[#6B4E8A]">Nenhum blog encontrado</div>
            ) : (
              pagePosts.map((p) => (
                <div key={p.id} className="grid grid-cols-[1fr_160px_140px_100px] px-4 py-3 border-b border-[rgba(124,77,255,0.08)] hover:bg-[rgba(124,77,255,0.04)] items-center">
                  <span className="text-sm text-[#F5F0FF]">{p.titulo}</span>
                  <span className="text-sm text-[#A78BCC]">{p.data}</span>
                  <span className={`text-xs font-semibold px-2 py-0.5 rounded-full w-fit ${p.status === 'Publicado' ? 'bg-[rgba(34,197,94,0.12)] text-[#22C55E]' : 'bg-[rgba(124,77,255,0.12)] text-[#A78BCC]'}`}>{p.status}</span>
                  <button
                    onClick={() => deletePost(p.id)}
                    className="w-7 h-7 rounded-full bg-[rgba(239,68,68,0.08)] text-[#EF4444] flex items-center justify-center hover:bg-[rgba(239,68,68,0.18)] transition-colors"
                  ><X size={12} /></button>
                </div>
              ))
            )}
          </div>

          {/* Pagination */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2 text-xs text-[#A78BCC]">
              Resultados por página
              <div className="relative">
                <button
                  onClick={() => setBlogPageSizeOpen((v) => !v)}
                  className="flex items-center gap-1.5 px-2.5 py-1 rounded-md border border-[rgba(124,77,255,0.25)] text-[#F5F0FF] hover:border-[#7C4DFF] transition-colors"
                >
                  {blogPageSize} <ChevronDown size={11} />
                </button>
                {blogPageSizeOpen && (
                  <div className="absolute bottom-full mb-1 left-0 z-50 bg-[#1A0A38] border border-[rgba(124,77,255,0.30)] rounded-lg shadow-xl overflow-hidden">
                    {[5, 10, 20, 50].map((n) => (
                      <button key={n} onClick={() => { setBlogPageSize(n); setBlogPage(1); setBlogPageSizeOpen(false) }}
                        className={`w-full text-left px-4 py-2 text-sm transition-colors hover:bg-[rgba(124,77,255,0.12)] ${blogPageSize === n ? 'text-[#7C4DFF]' : 'text-[#F5F0FF]'}`}>
                        {n}
                      </button>
                    ))}
                  </div>
                )}
              </div>
            </div>
            <div className="flex items-center gap-1">
              {['«','‹','›','»'].map((sym, i) => {
                const acts = [() => setBlogPage(1), () => setBlogPage((p) => Math.max(1, p-1)), () => setBlogPage((p) => Math.min(totalPages, p+1)), () => setBlogPage(totalPages)]
                return <button key={sym} onClick={acts[i]} className="w-7 h-7 rounded-md flex items-center justify-center text-sm text-[#A78BCC] hover:bg-[rgba(124,77,255,0.12)] transition-colors">{sym}</button>
              })}
              <span className="flex items-center gap-1 px-2.5 py-1 rounded-md bg-[rgba(124,77,255,0.12)] border border-[rgba(124,77,255,0.25)] text-xs text-[#7C4DFF]">
                {blogPage} <ChevronDown size={11} />
              </span>
            </div>
          </div>
        </div>
      </div>

      <div className="flex items-center justify-between pt-2 border-t border-[rgba(124,77,255,0.12)]">
        <div>
          {saveError && <p className="text-xs text-red-400">{saveError}</p>}
          {saved && <p className="text-xs text-green-400">Alterações salvas com sucesso.</p>}
        </div>
        <button onClick={handleSave} disabled={saving} className={BTN_PRIMARY + ' flex items-center gap-2 disabled:opacity-60'}>
          {saving && <span className="inline-block w-3.5 h-3.5 border-2 border-white/30 border-t-white rounded-full animate-spin" />}
          {saving ? 'Salvando...' : 'Salvar'}
        </button>
      </div>

      {/* ── Modal: Nova Publicação ── */}
      {novaPublOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4">
          <div className="bg-white rounded-2xl w-full max-w-[810px] shadow-2xl flex flex-col max-h-[90vh]">
            {/* Header */}
            <div className="flex items-center justify-between px-7 py-5 border-b border-gray-200">
              <h3 className="text-base font-semibold text-gray-900">Nova publicação no blog</h3>
              <button onClick={() => setNovaPublOpen(false)} className="w-7 h-7 rounded-lg flex items-center justify-center text-gray-400 hover:text-gray-700 hover:bg-gray-100 transition-colors">
                <X size={15} />
              </button>
            </div>

            {/* Body */}
            <div className="px-7 py-5 space-y-5 overflow-y-auto flex-1">
              {/* Título + Data */}
              <div className="grid grid-cols-[1fr_180px] gap-4">
                <div className="relative">
                  <label className="absolute -top-2 left-3 bg-white px-1 text-[10px] text-gray-400">Título<span className="text-red-500 ml-0.5">*</span></label>
                  <input type="text" value={novaPublTitulo} onChange={(e) => setNovaPublTitulo(e.target.value)}
                    className="w-full border border-gray-300 rounded-lg px-3 py-3 text-sm text-gray-900 focus:outline-none focus:border-purple-500 transition-colors" />
                </div>
                <div className="relative">
                  <label className="absolute -top-2 left-3 bg-white px-1 text-[10px] text-gray-400">Data da publicação<span className="text-red-500 ml-0.5">*</span></label>
                  <input type="date" value={novaPublData} onChange={(e) => setNovaPublData(e.target.value)}
                    className="w-full border border-gray-300 rounded-lg px-3 py-3 text-sm text-gray-700 focus:outline-none focus:border-purple-500 transition-colors" />
                </div>
              </div>

              {/* Status custom dropdown */}
              <div className="relative">
                <label className="absolute -top-2 left-3 bg-white px-1 text-[10px] text-gray-400">Status<span className="text-red-500 ml-0.5">*</span></label>
                <button type="button" onClick={() => setNovaPublStatusOpen(v => !v)}
                  className="w-full border border-gray-300 rounded-lg px-3 py-3 text-sm text-left flex items-center justify-between focus:outline-none focus:border-purple-500 transition-colors hover:border-gray-400">
                  <span className={novaPublStatus ? 'text-gray-900' : 'text-gray-400'}>{novaPublStatus || 'Selecione um status'}</span>
                  <ChevronDown size={14} className="text-gray-400 flex-shrink-0" />
                </button>
                {novaPublStatusOpen && (
                  <div className="absolute z-50 top-full mt-1 left-0 right-0 bg-white border border-gray-200 rounded-xl shadow-xl overflow-hidden">
                    {[
                      'Rascunho - invisível no preview e no website publicado',
                      'Preview - visível somente no preview do website',
                      'Publicado - visível no preview e no website publicado',
                    ].map((opt) => (
                      <button key={opt} type="button"
                        onClick={() => { setNovaPublStatus(opt.split(' - ')[0]); setNovaPublStatusOpen(false) }}
                        className="w-full text-left px-4 py-3 text-sm text-gray-700 hover:bg-gray-50 transition-colors border-b border-gray-100 last:border-0">
                        {opt}
                      </button>
                    ))}
                  </div>
                )}
              </div>

              {/* Image upload */}
              <div>
                <input ref={novaPublImageRef} type="file" accept="image/*" className="hidden"
                  onChange={(e) => { const f = e.target.files?.[0]; if (f) handleImageFile(f, setNovaPublImageSrc) }} />
                <div onClick={() => novaPublImageRef.current?.click()}
                  className="w-52 h-28 rounded-xl border-2 border-dashed border-gray-300 bg-gray-100 flex items-center justify-center cursor-pointer hover:border-purple-400 transition-colors overflow-hidden">
                  {novaPublImageSrc
                    ? <img src={novaPublImageSrc} alt="" className="w-full h-full object-cover" />
                    : <User size={32} className="text-gray-300" strokeWidth={1} />
                  }
                </div>
              </div>

              {/* Conteúdo */}
              <div>
                <p className="text-sm font-medium text-gray-700 mb-2">Conteúdo<span className="text-red-500 ml-0.5">*</span></p>
                <div className="border border-gray-300 rounded-xl overflow-hidden focus-within:border-purple-500 transition-colors">
                  {/* Toolbar */}
                  <div className="flex items-center gap-0.5 px-3 py-2 border-b border-gray-200 flex-wrap">
                    <select className="text-xs text-gray-600 border-0 bg-transparent focus:outline-none pr-1 cursor-pointer mr-1">
                      <option>Parágrafo</option><option>Título 1</option><option>Título 2</option><option>Título 3</option>
                    </select>
                    {[['B','font-bold'],['I','italic'],['U','underline']].map(([t, cls]) => (
                      <button key={t} type="button" className={`w-7 h-7 rounded flex items-center justify-center text-sm text-gray-600 hover:bg-gray-100 transition-colors ${cls}`}>{t}</button>
                    ))}
                    <div className="w-px h-5 bg-gray-200 mx-1" />
                    <button type="button" className="w-7 h-7 rounded flex items-center justify-center text-gray-600 hover:bg-gray-100 transition-colors" title="Alinhar">
                      <svg width="14" height="14" viewBox="0 0 16 16" fill="currentColor"><rect x="1" y="2" width="14" height="2" rx="1"/><rect x="1" y="7" width="10" height="2" rx="1"/><rect x="1" y="12" width="12" height="2" rx="1"/></svg>
                    </button>
                    <button type="button" className="w-7 h-7 rounded flex items-center justify-center text-gray-600 hover:bg-gray-100 transition-colors" title="Lista ordenada">
                      <svg width="14" height="14" viewBox="0 0 16 16" fill="currentColor"><text x="0" y="6" fontSize="6" fontWeight="bold">1.</text><rect x="6" y="3" width="9" height="1.5" rx="0.75"/><text x="0" y="11" fontSize="6" fontWeight="bold">2.</text><rect x="6" y="8" width="9" height="1.5" rx="0.75"/></svg>
                    </button>
                    <button type="button" className="w-7 h-7 rounded flex items-center justify-center text-gray-600 hover:bg-gray-100 transition-colors" title="Lista">
                      <svg width="14" height="14" viewBox="0 0 16 16" fill="currentColor"><circle cx="2" cy="4" r="1.5"/><rect x="5" y="3" width="10" height="1.5" rx="0.75"/><circle cx="2" cy="9" r="1.5"/><rect x="5" y="8" width="10" height="1.5" rx="0.75"/></svg>
                    </button>
                    <button type="button" className="w-7 h-7 rounded flex items-center justify-center text-gray-600 hover:bg-gray-100 transition-colors" title="Tabela">
                      <svg width="14" height="14" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5"><rect x="1" y="1" width="14" height="14" rx="1"/><line x1="1" y1="6" x2="15" y2="6"/><line x1="1" y1="11" x2="15" y2="11"/><line x1="6" y1="1" x2="6" y2="15"/><line x1="11" y1="1" x2="11" y2="15"/></svg>
                    </button>
                    <button type="button" className="w-7 h-7 rounded flex items-center justify-center text-gray-600 hover:bg-gray-100 transition-colors" title="Link">
                      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71"/><path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71"/></svg>
                    </button>
                  </div>
                  <textarea
                    value={novaPublConteudo}
                    onChange={(e) => setNovaPublConteudo(e.target.value)}
                    rows={8}
                    className="w-full px-3 py-3 text-sm text-gray-800 focus:outline-none resize-none bg-white"
                  />
                </div>
              </div>
            </div>

            {/* Footer */}
            <div className="flex items-center justify-between px-7 py-5 border-t border-gray-200">
              <button onClick={() => setNovaPublOpen(false)} className="px-5 py-2 rounded-xl text-sm text-gray-500 border border-gray-200 hover:border-gray-300 hover:text-gray-700 transition-colors">Cancelar</button>
              <button onClick={savePost} className="px-5 py-2 rounded-xl text-sm font-semibold text-white bg-purple-600 hover:bg-purple-700 transition-colors">Salvar</button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

// ─── TAB: VENDA MAIS (Buscador Agendart) ─────────────────────────────────────
type BuscadorSubTab = 'pessoais' | 'profissionais' | 'endereco' | 'redes'

const BUSCADOR_SUB: { id: BuscadorSubTab; label: string }[] = [
  { id: 'pessoais',      label: 'Informações pessoais' },
  { id: 'profissionais', label: 'Informações profissionais' },
  { id: 'endereco',      label: 'Endereço de Atendimento (Se Houver)' },
  { id: 'redes',         label: 'Redes Sociais e Contatos' },
]

function TabVendaMais() {
  const [subTab, setSubTab] = useState<BuscadorSubTab>('pessoais')

  const content = (() => {
    switch (subTab) {
      case 'pessoais': return (
        <div className="space-y-5 pt-5">
          <div>
            <p className="text-xs font-medium text-[#A78BCC] mb-2">Foto de Perfil<span className="text-[#7C4DFF] ml-0.5">*</span></p>
            <div className="w-24 h-24 rounded-xl bg-[#150830] border-2 border-dashed border-[rgba(124,77,255,0.25)] flex items-center justify-center cursor-pointer hover:border-[#7C4DFF] transition-colors">
              <User size={32} className="text-[#6B4E8A]" strokeWidth={1} />
            </div>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <FInput label="Nome" req />
          </div>
        </div>
      )
      case 'profissionais': return (
        <div className="space-y-5 pt-5">
          <FTextarea label="Descrição da Atuação" req rows={4} />
          <FTextarea label="Cursos e Certificações" req rows={3} />
          <div className="grid grid-cols-2 gap-4">
            <FInput label="Sigla e Número do Conselho" />
            <FSelect label="Faixa de Preço" req opts={['Selecione uma faixa de preço', 'R$ 0 – R$ 100', 'R$ 100 – R$ 200', 'R$ 200 – R$ 400', 'Acima de R$ 400']} val="Selecione uma faixa de preço" />
            <FSelect label="Modo de Atendimento" req opts={['Selecione uma opção', 'Presencial', 'Online', 'Ambos']} val="Selecione uma opção" />
            <FSelect label="Aceita convênio" req opts={['Selecione uma opção', 'Sim', 'Não']} val="Selecione uma opção" />
            <FSelect label="Especialidades" req opts={['Selecione uma especialidade', 'Clínico Geral', 'Ortodontia', 'Implantodontia', 'Pediatria']} val="Selecione uma especialidade" />
          </div>
          <div>
            <h4 className="text-sm font-semibold text-[#F5F0FF] mb-4">Horário de Funcionamento</h4>
            <HorarioTable />
          </div>
        </div>
      )
      case 'endereco': return (
        <div className="space-y-5 pt-5">
          <div className="grid grid-cols-2 gap-4">
            <FInput label="CEP" />
            <FInput label="Logradouro" />
            <FInput label="Número" />
            <FInput label="Complemento" />
            <FInput label="Bairro" />
            <FInput label="Cidade" />
          </div>
        </div>
      )
      case 'redes': return (
        <div className="space-y-5 pt-5">
          <div className="grid grid-cols-2 gap-4">
            <FInput label="WhatsApp" />
            <FInput label="Email" />
            <FInput label="Link do Website" />
            <FInput label="Instagram" prefix="https://instagram.com/" />
            <FInput label="Facebook"  prefix="https://facebook.com/" />
            <FInput label="LinkedIn"  prefix="https://linkedin.com/" />
            <FInput label="YouTube"   prefix="https://youtube.com/" />
            <FInput label="Twitter"   prefix="https://twitter.com/" />
          </div>
        </div>
      )
    }
  })()

  return (
    <div className="space-y-6">
      {/* Hero banner */}
      <div className="rounded-xl bg-gradient-to-r from-[#E8F4FD] to-[#D0EBFF] border border-[rgba(56,189,248,0.3)] p-5 flex items-center gap-5">
        <div className="w-20 h-20 rounded-xl bg-[#3B82F6] flex items-center justify-center shrink-0">
          <svg viewBox="0 0 80 80" width="80" height="80" fill="none">
            <rect width="80" height="80" rx="12" fill="#3B82F6" />
            <rect x="10" y="20" width="60" height="40" rx="4" fill="white" opacity="0.9" />
            <rect x="18" y="28" width="18" height="18" rx="2" fill="#7C4DFF" opacity="0.5" />
            <circle cx="18" cy="52" r="0" />
            <rect x="42" y="28" width="20" height="4" rx="2" fill="#1D4ED8" opacity="0.5" />
            <rect x="42" y="36" width="14" height="3" rx="1.5" fill="#1D4ED8" opacity="0.3" />
            <rect x="42" y="43" width="16" height="3" rx="1.5" fill="#1D4ED8" opacity="0.3" />
            <text x="23" y="42" fontSize="12" fontWeight="bold" fill="white" textAnchor="middle">AA</text>
          </svg>
        </div>
        <div>
          <div className="flex items-center gap-1.5 mb-1">
            <div className="w-4 h-4 rounded-full bg-[#7C4DFF] flex items-center justify-center shrink-0">
              <Info size={10} className="text-white" />
            </div>
            <h3 className="text-base font-bold text-[#1E3A5F]">Buscador Agendart</h3>
          </div>
          <p className="text-sm text-[#374151]">
            Preencha as informações profissionais e seja listado no buscador de profissionais do Agendart. Através dele você ganhará mais exposição e pacientes para suas consultas.
          </p>
        </div>
      </div>

      {/* Aviso perfil não publicado */}
      <div className="rounded-lg bg-[rgba(245,158,11,0.08)] border border-[rgba(245,158,11,0.25)] p-4 flex items-start gap-3">
        <div className="w-7 h-7 rounded-full bg-[rgba(245,158,11,0.15)] flex items-center justify-center shrink-0 mt-0.5">
          <AlertTriangle size={14} className="text-[#F59E0B]" />
        </div>
        <div>
          <p className="text-sm font-bold text-[#F59E0B]">Perfil não publicado!</p>
          <p className="text-xs text-[#F59E0B] opacity-80">
            O perfil deste profissional ainda não está publicado no buscador. Preencha as informações obrigatórias* para que seja publicado.
          </p>
        </div>
      </div>

      {/* Sub-tabs */}
      <div className="flex border-b border-[rgba(124,77,255,0.18)]">
        {BUSCADOR_SUB.map(({ id, label }) => (
          <button
            key={id}
            onClick={() => setSubTab(id)}
            className={`px-4 py-2.5 text-sm font-medium border-b-2 -mb-px transition-colors whitespace-nowrap ${
              subTab === id
                ? 'text-[#7C4DFF] border-[#7C4DFF]'
                : 'text-[#A78BCC] border-transparent hover:text-[#F5F0FF]'
            }`}
          >
            {label}
          </button>
        ))}
      </div>

      {content}

      <div className="flex justify-end pt-4 border-t border-[rgba(124,77,255,0.12)]">
        <button className={BTN_PRIMARY}>Salvar</button>
      </div>
    </div>
  )
}

// ─── Sub-tab nav ──────────────────────────────────────────────────────────────
type MktTab = 'auto' | 'site' | 'venda'

type MktTabDef = { id: MktTab; label: string; Icon: LucideIcon }

const MKT_TABS: MktTabDef[] = [
  { id: 'auto',  label: 'Auto\nAgendamento', Icon: Clock   },
  { id: 'site',  label: 'Meu Site & Blog',   Icon: Globe   },
  { id: 'venda', label: 'Venda Mais',         Icon: Share2  },
]

// ─── Main component ───────────────────────────────────────────────────────────
export function MarketingView({ empresaId, profissionais }: { empresaId: string | null; profissionais: ProfissionalApi[] }) {
  const [selectedId, setSelectedId] = useState<string>('')
  const [profDropdown, setProfDropdown] = useState(false)
  const [tab, setTab] = useState<MktTab>('auto')

  const selected = profissionais.find((p) => p.id === selectedId) ?? null

  const content = selected ? (() => {
    switch (tab) {
      case 'auto':  return <TabAutoAgendamento key={selected.id} prof={selected} empresaId={empresaId} />
      case 'site':  return <TabMeuSite key={selected.id} prof={selected} />
      case 'venda': return <TabVendaMais />
    }
  })() : null

  return (
    <div className="p-8 space-y-6">
      {/* Header */}
      <div>
        <h2 className="text-base font-bold text-[#F5F0FF]">Configurações de Marketing</h2>
      </div>

      {/* Profissional selector */}
      <div>
        <p className="text-xs font-medium text-[#A78BCC] mb-1.5">Profissional</p>
        <div className="relative w-full">
          <button
            onClick={() => setProfDropdown((o) => !o)}
            className="w-full flex items-center justify-between gap-2 bg-[#0D0520] border border-[rgba(124,77,255,0.25)] rounded-md px-3 py-2.5 text-sm hover:border-[#7C4DFF] transition-colors"
          >
            <span className={selected ? 'text-[#F5F0FF]' : 'text-[#6B4E8A]'}>
              {selected ? selected.nome : 'Selecione um profissional...'}
            </span>
            <ChevronDown size={13} className="text-[#A78BCC] shrink-0" />
          </button>
          {profDropdown && (
            <>
              <div className="fixed inset-0 z-10" onClick={() => setProfDropdown(false)} />
              <div className="absolute left-0 top-full mt-1 w-full z-20 bg-[#1A0A38] border border-[rgba(124,77,255,0.35)] rounded-lg shadow-xl max-h-56 overflow-y-auto">
                {profissionais.length === 0 ? (
                  <div className="px-3 py-3 text-sm text-[#6B4E8A] text-center">Nenhum profissional encontrado</div>
                ) : (
                  profissionais.map((p) => (
                    <button key={p.id} onClick={() => { setSelectedId(p.id); setProfDropdown(false); setTab('auto') }}
                      className={`w-full text-left px-3 py-2.5 text-sm hover:bg-[rgba(124,77,255,0.15)] transition-colors ${p.id === selectedId ? 'text-[#7C4DFF] font-medium' : 'text-[#F5F0FF]'}`}>
                      <div className="font-medium">{p.nome}</div>
                      {p.especialidade && <div className="text-xs text-[#A78BCC]">{p.especialidade}</div>}
                    </button>
                  ))
                )}
              </div>
            </>
          )}
        </div>
      </div>

      {!selected && (
        <div className="flex flex-col items-center py-20 text-center text-[#6B4E8A]">
          <User size={48} className="mb-4 opacity-30" />
          <p className="text-sm">Selecione um profissional para configurar o marketing.</p>
        </div>
      )}

      {selected && (
        <div className="flex gap-5">
          {/* Sub-menu lateral */}
          <aside className="flex flex-col w-[90px] shrink-0 gap-0.5">
            {MKT_TABS.map(({ id, label, Icon }) => {
              const active = tab === id
              return (
                <button
                  key={id}
                  onClick={() => setTab(id)}
                  className={`flex flex-col items-center gap-1 py-3 px-1 rounded-xl transition-all text-center ${
                    active ? 'bg-[rgba(124,77,255,0.15)]' : 'hover:bg-[rgba(124,77,255,0.08)]'
                  }`}
                >
                  <Icon size={20} color={active ? '#7C4DFF' : '#6B4E8A'} strokeWidth={active ? 2.5 : 1.5} />
                  <span className="text-[9px] font-medium leading-tight whitespace-pre-line" style={{ color: active ? '#7C4DFF' : '#6B4E8A' }}>
                    {label}
                  </span>
                </button>
              )
            })}
          </aside>

          {/* Conteúdo */}
          <div className="flex-1 min-w-0">
            {content}
          </div>
        </div>
      )}
    </div>
  )
}
