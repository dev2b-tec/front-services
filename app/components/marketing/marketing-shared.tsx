'use client'

import { useState, useRef } from 'react'
import { ChevronDown } from 'lucide-react'

// ─── Shared styles ────────────────────────────────────────────────────────────
export const INP =
  'w-full bg-[var(--d2b-bg-main)] border border-[var(--d2b-border-strong)] rounded-md ' +
  'px-3 py-2.5 text-sm text-[var(--d2b-text-primary)] placeholder:text-[var(--d2b-text-muted)] ' +
  'focus:outline-none focus:border-[#7C4DFF] transition-colors'
export const LBG = 'bg-[var(--d2b-bg-main)]'
export const BTN_GHOST =
  'px-4 py-2 rounded-md text-sm font-medium text-[var(--d2b-text-secondary)] border border-[var(--d2b-border-strong)] hover:border-[#7C4DFF] hover:text-[var(--d2b-text-primary)] transition-colors'
export const BTN_PRIMARY =
  'px-5 py-2 rounded-md text-sm font-bold text-white bg-[#7C4DFF] hover:bg-[#5B21B6] transition-colors'

// ─── FInput ───────────────────────────────────────────────────────────────────
export function FInput({ label, req, val, placeholder, prefix, type = 'text', hint }: {
  label: string; req?: boolean; val?: string; placeholder?: string; prefix?: string; type?: string; hint?: string
}) {
  return (
    <div className="relative">
      <label className={`absolute -top-2 left-3 z-10 ${LBG} px-1 text-[10px] font-medium text-[var(--d2b-text-secondary)] leading-none`}>
        {label}{req && <span className="text-[#7C4DFF] ml-0.5">*</span>}
      </label>
      {prefix ? (
        <div className="flex bg-[var(--d2b-bg-main)] border border-[var(--d2b-border-strong)] rounded-md overflow-hidden focus-within:border-[#7C4DFF] transition-colors">
          <span className="flex items-center px-3 text-xs text-[var(--d2b-text-muted)] border-r border-[var(--d2b-border)] shrink-0 whitespace-nowrap">
            {prefix}
          </span>
          <input type={type} defaultValue={val} placeholder={placeholder} className="bg-transparent flex-1 px-3 py-2.5 text-sm text-[var(--d2b-text-primary)] placeholder:text-[var(--d2b-text-muted)] focus:outline-none" />
        </div>
      ) : (
        <input type={type} defaultValue={val} placeholder={placeholder} className={INP} />
      )}
      {hint && <p className="text-[10px] text-[var(--d2b-text-muted)] mt-1">{hint}</p>}
    </div>
  )
}

// ─── FSelect ──────────────────────────────────────────────────────────────────
export function FSelect({ label, req, opts, val }: {
  label: string; req?: boolean; opts: string[]; val?: string
}) {
  return (
    <div className="relative">
      <label className={`absolute -top-2 left-3 z-10 ${LBG} px-1 text-[10px] font-medium text-[var(--d2b-text-secondary)] leading-none`}>
        {label}{req && <span className="text-[#7C4DFF] ml-0.5">*</span>}
      </label>
      <div className="relative">
        <select defaultValue={val ?? ''} className={INP + ' appearance-none pr-8 cursor-pointer'}>
          {opts.map((o) => <option key={o} value={o}>{o}</option>)}
        </select>
        <ChevronDown size={13} className="absolute right-3 top-1/2 -translate-y-1/2 text-[var(--d2b-text-secondary)] pointer-events-none" />
      </div>
    </div>
  )
}

// ─── FTextarea ────────────────────────────────────────────────────────────────
export function FTextarea({ label, req, placeholder, rows = 4 }: {
  label: string; req?: boolean; placeholder?: string; rows?: number
}) {
  return (
    <div className="relative">
      <label className="text-xs font-medium text-[var(--d2b-text-secondary)] block mb-1.5">
        {label}{req && <span className="text-[#7C4DFF] ml-0.5">*</span>}
      </label>
      <div className="rounded-md border border-[var(--d2b-border-strong)] bg-[var(--d2b-bg-main)] focus-within:border-[#7C4DFF] transition-colors overflow-hidden">
        <textarea
          rows={rows}
          placeholder={placeholder}
          className="w-full bg-transparent px-3 py-2.5 text-sm text-[var(--d2b-text-primary)] placeholder:text-[var(--d2b-text-muted)] focus:outline-none resize-none"
        />
      </div>
    </div>
  )
}

// ─── Toggle ──────────────────────────────────────────────────────────────────
export function Toggle({ on, set }: { on: boolean; set: (v: boolean) => void }) {
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

// ─── HorarioTable ─────────────────────────────────────────────────────────────
const DAYS_INIT = [
  { label: 'Seg:', aber: '09:00', fec: '18:00', aberto: false },
  { label: 'Ter:', aber: '09:00', fec: '18:00', aberto: false },
  { label: 'Qua:', aber: '09:00', fec: '18:00', aberto: false },
  { label: 'Qui:', aber: '09:00', fec: '18:00', aberto: false },
  { label: 'Sex:', aber: '09:00', fec: '18:00', aberto: false },
  { label: 'Sáb:', aber: '09:00', fec: '18:00', aberto: false },
  { label: 'Dom:', aber: '09:00', fec: '18:00', aberto: false },
]

export function HorarioTable() {
  const [days, setDays] = useState(DAYS_INIT)
  return (
    <div className="space-y-2.5">
      {days.map((d, i) => (
        <div key={d.label} className="flex items-center gap-3">
          <span className="text-sm font-medium text-[var(--d2b-text-secondary)] w-10 shrink-0">{d.label}</span>
          <div className="relative flex-1">
            <label className={`absolute -top-2 left-3 z-10 ${LBG} px-1 text-[10px] font-medium text-[var(--d2b-text-secondary)] leading-none`}>Abertura</label>
            <input type="time" defaultValue={d.aber} disabled={!d.aberto} className={INP + (!d.aberto ? ' opacity-40 cursor-not-allowed' : '')} />
          </div>
          <div className="relative flex-1">
            <label className={`absolute -top-2 left-3 z-10 ${LBG} px-1 text-[10px] font-medium text-[var(--d2b-text-secondary)] leading-none`}>Fechamento</label>
            <input type="time" defaultValue={d.fec} disabled={!d.aberto} className={INP + (!d.aberto ? ' opacity-40 cursor-not-allowed' : '')} />
          </div>
          <label className="flex items-center gap-2 cursor-pointer">
            <input
              type="checkbox"
              checked={d.aberto}
              onChange={() => setDays((prev) => prev.map((x, j) => j === i ? { ...x, aberto: !x.aberto } : x))}
              className="accent-[#7C4DFF] w-4 h-4"
            />
            <span className="text-sm text-[var(--d2b-text-secondary)]">Aberto</span>
          </label>
        </div>
      ))}
    </div>
  )
}

// ─── Color Picker ─────────────────────────────────────────────────────────────
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

export function ColorPickerDropdown({ value, onChange }: { value: string; onChange: (v: string) => void }) {
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
      <label className="block text-[10px] font-medium text-[var(--d2b-text-secondary)] mb-1.5">
        Cor Principal<span className="text-[#7C4DFF] ml-0.5">*</span>
      </label>
      <button type="button" onClick={() => setOpen(v => !v)}
        className="flex items-center gap-2 px-2 py-2 rounded-md border border-[var(--d2b-border-strong)] hover:border-[#7C4DFF] transition-colors w-44 bg-[var(--d2b-bg-main)]">
        <span className="w-24 h-5 rounded flex-shrink-0 border border-[rgba(255,255,255,0.1)]" style={{ background: value }} />
        <span className="text-xs text-[var(--d2b-text-secondary)] font-mono flex-1 text-left truncate">{value}</span>
        <ChevronDown size={12} className="text-[var(--d2b-text-secondary)] flex-shrink-0" />
      </button>

      {open && (
        <div className="absolute z-50 top-full mt-2 left-0 bg-[var(--d2b-bg-elevated)] border border-[var(--d2b-border-strong)] rounded-xl shadow-2xl p-3 w-60 select-none">
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

          <style>{`.hue-slider::-webkit-slider-thumb{appearance:none;width:12px;height:12px;border-radius:50%;background:white;border:1px solid rgba(0,0,0,0.3);box-shadow:0 1px 3px rgba(0,0,0,0.5);cursor:pointer}.hue-slider::-moz-range-thumb{width:12px;height:12px;border-radius:50%;background:white;border:1px solid rgba(0,0,0,0.3);cursor:pointer}.alpha-slider::-webkit-slider-thumb{appearance:none;width:12px;height:12px;border-radius:50%;background:white;border:1px solid rgba(0,0,0,0.3);box-shadow:0 1px 3px rgba(0,0,0,0.5);cursor:pointer}.alpha-slider::-moz-range-thumb{width:12px;height:12px;border-radius:50%;background:white;border:1px solid rgba(0,0,0,0.3);cursor:pointer}`}</style>
          <input type="range" min={0} max={360} value={hue}
            onChange={(e) => { const h=Number(e.target.value); setHue(h); applyHsv(h,sat,bri) }}
            className="hue-slider w-full h-3 rounded-full appearance-none outline-none mb-2 cursor-pointer"
            style={{ background: hueBg }} />

          <input type="range" min={0} max={100} value={alpha}
            onChange={(e) => setAlpha(Number(e.target.value))}
            className="alpha-slider w-full h-3 rounded-full appearance-none outline-none mb-3 cursor-pointer"
            style={{ background: `linear-gradient(to right,transparent,${currentHex}),repeating-conic-gradient(#555 0% 25%,#333 0% 50%) 0 0/10px 10px` }} />

          <div className="flex items-center gap-1.5 mb-3">
            <span className="w-7 h-7 rounded flex-shrink-0 border border-[rgba(255,255,255,0.15)]" style={{ background: currentHex }} />
            <div className="flex items-center gap-0.5 flex-1 bg-[var(--d2b-bg-main)] border border-[var(--d2b-border-strong)] rounded-md px-1.5 py-1 focus-within:border-[#7C4DFF] transition-colors">
              <span className="text-xs text-[var(--d2b-text-muted)]">#</span>
              <input type="text" maxLength={6} value={hexInput}
                onChange={(e) => handleHexInput(e.target.value)}
                className="bg-transparent flex-1 text-xs text-[var(--d2b-text-primary)] font-mono focus:outline-none w-14" />
            </div>
            <div className="flex items-center bg-[var(--d2b-bg-main)] border border-[var(--d2b-border-strong)] rounded-md px-1.5 py-1 w-14 focus-within:border-[#7C4DFF] transition-colors">
              <input type="number" min={0} max={100} value={alpha}
                onChange={(e) => setAlpha(Math.max(0,Math.min(100,Number(e.target.value))))}
                className="bg-transparent w-full text-xs text-[var(--d2b-text-primary)] font-mono focus:outline-none" />
              <span className="text-[10px] text-[var(--d2b-text-muted)] ml-0.5">%</span>
            </div>
            <button type="button" onClick={() => setOpen(false)}
              className="px-2 py-1.5 rounded-md bg-[#7C4DFF] text-white text-xs font-semibold hover:bg-[#5B21B6] transition-colors">OK</button>
          </div>

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
