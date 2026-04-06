'use client'

import { ChevronDown, Check } from 'lucide-react'

// ─── Shared styles ────────────────────────────────────────────────────────────
export const INP =
  'w-full bg-[#0D0520] border border-[rgba(124,77,255,0.25)] rounded-md ' +
  'px-3 py-2.5 text-sm text-[#F5F0FF] placeholder:text-[#6B4E8A] ' +
  'focus:outline-none focus:border-[#7C4DFF] transition-colors'
export const LBG = 'bg-[#0D0520]'
export const BTN_GHOST =
  'px-5 py-2 rounded-md text-sm font-medium text-[#A78BCC] border border-[rgba(124,77,255,0.25)] hover:border-[#7C4DFF] hover:text-[#F5F0FF] transition-colors'
export const BTN_PRIMARY =
  'px-5 py-2 rounded-md text-sm font-bold text-white bg-[#7C4DFF] hover:bg-[#5B21B6] transition-colors'

// ─── Máscaras ─────────────────────────────────────────────────────────────────
export function maskCep(v: string) {
  const d = v.replace(/\D/g, '').slice(0, 8)
  return d.length > 5 ? `${d.slice(0, 5)}-${d.slice(5)}` : d
}

export function maskPhone(v: string) {
  const d = v.replace(/\D/g, '').slice(0, 11)
  if (d.length > 10) return `(${d.slice(0, 2)}) ${d.slice(2, 7)}-${d.slice(7)}`
  if (d.length > 6)  return `(${d.slice(0, 2)}) ${d.slice(2, 6)}-${d.slice(6)}`
  if (d.length > 2)  return `(${d.slice(0, 2)}) ${d.slice(2)}`
  if (d.length > 0)  return `(${d}`
  return d
}

// ─── Reusable field components ────────────────────────────────────────────────
export function FInput({ label, req, value, onChange, type = 'text' }: {
  label: string
  req?: boolean
  value?: string
  onChange?: (v: string) => void
  type?: string
}) {
  return (
    <div className="relative">
      <label className={`absolute -top-2 left-3 z-10 ${LBG} px-1 text-[10px] font-medium text-[#A78BCC] leading-none`}>
        {label}{req && <span className="text-[#7C4DFF] ml-0.5">*</span>}
      </label>
      <input
        type={type}
        value={value ?? ''}
        onChange={onChange ? (e) => onChange(e.target.value) : undefined}
        readOnly={!onChange}
        className={INP}
      />
    </div>
  )
}

export function FSelect({ label, req, opts, value, onChange }: {
  label: string
  req?: boolean
  opts: string[]
  value?: string
  onChange?: (v: string) => void
}) {
  return (
    <div className="relative">
      <label className={`absolute -top-2 left-3 z-10 ${LBG} px-1 text-[10px] font-medium text-[#A78BCC] leading-none`}>
        {label}{req && <span className="text-[#7C4DFF] ml-0.5">*</span>}
      </label>
      <div className="relative">
        <select
          value={value ?? ''}
          onChange={onChange ? (e) => onChange(e.target.value) : undefined}
          className={INP + ' appearance-none pr-8 cursor-pointer'}
        >
          <option value="">Selecione</option>
          {opts.map((o) => <option key={o} value={o}>{o}</option>)}
        </select>
        <ChevronDown size={13} className="absolute right-3 top-1/2 -translate-y-1/2 text-[#A78BCC] pointer-events-none" />
      </div>
    </div>
  )
}

export function CepInput({ label, req, value, onChange }: {
  label: string
  req?: boolean
  value?: string
  onChange?: (v: string) => void
}) {
  return (
    <FInput
      label={label}
      req={req}
      value={value}
      onChange={onChange ? (v) => onChange(maskCep(v)) : undefined}
    />
  )
}

export function PhoneInput({ label, req, value, onChange }: {
  label: string
  req?: boolean
  value?: string
  onChange?: (v: string) => void
}) {
  return (
    <div className="relative">
      <label className={`absolute -top-2 left-3 z-10 ${LBG} px-1 text-[10px] font-medium text-[#A78BCC] leading-none`}>
        {label}{req && <span className="text-[#7C4DFF] ml-0.5">*</span>}
      </label>
      <div className="flex bg-[#0D0520] border border-[rgba(124,77,255,0.25)] rounded-md overflow-hidden focus-within:border-[#7C4DFF] transition-colors">
        <div className="flex items-center gap-1 px-2.5 py-2.5 border-r border-[rgba(124,77,255,0.18)] text-sm text-[#F5F0FF] shrink-0">
          🇧🇷 <span className="text-[#A78BCC] text-xs ml-1">Brasil</span>
          <ChevronDown size={11} className="text-[#6B4E8A] ml-0.5" />
        </div>
        <input
          value={value ?? ''}
          onChange={onChange ? (e) => onChange(maskPhone(e.target.value)) : undefined}
          readOnly={!onChange}
          placeholder="(00) 00000-0000"
          className="bg-transparent flex-1 px-3 py-2.5 text-sm text-[#F5F0FF] placeholder:text-[#6B4E8A] focus:outline-none"
        />
      </div>
    </div>
  )
}

export function Toggle({ on, set }: { on: boolean; set: (v: boolean) => void }) {
  return (
    <button
      type="button"
      role="switch"
      aria-checked={on}
      onClick={() => set(!on)}
      className={`relative w-10 h-5 rounded-full transition-colors shrink-0 ${on ? 'bg-[#7C4DFF]' : 'bg-[#2D1B4E]'}`}
    >
      <span className={`absolute top-0.5 w-4 h-4 rounded-full bg-white shadow transition-transform ${on ? 'translate-x-5' : 'translate-x-0.5'}`} />
    </button>
  )
}

export function Cbx({ checked, set, label }: { checked: boolean; set: (v: boolean) => void; label?: string }) {
  return (
    <label className="flex items-center gap-2 cursor-pointer select-none group">
      <button
        type="button"
        onClick={() => set(!checked)}
        className={`w-4 h-4 rounded flex items-center justify-center border transition-colors shrink-0 ${
          checked
            ? 'bg-[#7C4DFF] border-[#7C4DFF]'
            : 'bg-transparent border-[rgba(124,77,255,0.35)] group-hover:border-[#7C4DFF]'
        }`}
      >
        {checked && <Check size={10} strokeWidth={3} className="text-white" />}
      </button>
      {label && <span className="text-sm text-[#A78BCC]">{label}</span>}
    </label>
  )
}

export function SectionFooter({ onSave, onCancel, saving }: {
  onSave?: () => void
  onCancel?: () => void
  saving?: boolean
}) {
  return (
    <div className="flex justify-end gap-3 pt-5 border-t border-[rgba(124,77,255,0.12)]">
      <button type="button" onClick={onCancel} className={BTN_GHOST}>Cancelar</button>
      <button
        type="button"
        onClick={onSave}
        disabled={saving}
        className={BTN_PRIMARY + (saving ? ' opacity-60 cursor-not-allowed' : '')}
      >
        {saving ? 'Salvando...' : 'Salvar Alterações'}
      </button>
    </div>
  )
}
