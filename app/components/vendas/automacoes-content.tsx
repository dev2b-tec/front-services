'use client'

import { useState } from 'react'
import { ArrowLeftRight, Check, Pause, X, ChevronDown } from 'lucide-react'

// ─── Types ───────────────────────────────────────────────────────────────────
type Automacao = {
  id: string
  label: string
  ativo: boolean
  quando: string
}

const QUANDO_OPCOES = [
  'Selecionar ação inicial',
  'Ao salvar o pedido',
  'Ao salvar a nota fiscal',
  'Ao autorizar a NF-e',
  'Ao finalizar a venda',
  'Ao expedir o pedido',
]

const AUTOMACOES_INICIAIS: Automacao[] = [
  { id: 'saida',     label: 'Lançar saída de estoque',                    ativo: false, quando: 'Selecionar ação inicial' },
  { id: 'emitir',    label: 'Emitir Nota Fiscal Eletrônica (NFe)',         ativo: false, quando: 'Selecionar ação inicial' },
  { id: 'autorizar', label: 'Autorizar Nota Fiscal Eletrônica (NFe) na Sefaz', ativo: false, quando: 'Selecionar ação inicial' },
  { id: 'etiqueta',  label: 'Imprimir etiqueta de envio',                 ativo: false, quando: 'Selecionar ação inicial' },
  { id: 'separacao', label: 'Enviar para separação',                      ativo: false, quando: 'Selecionar ação inicial' },
  { id: 'expedicao', label: 'Enviar para expedição',                      ativo: true,  quando: 'Ao salvar a nota fiscal'  },
]

// ─── Toggle ───────────────────────────────────────────────────────────────────
function Toggle({ on, onChange }: { on: boolean; onChange: (v: boolean) => void }) {
  return (
    <button
      onClick={() => onChange(!on)}
      className={`relative inline-flex w-10 h-5 rounded-full transition-colors shrink-0 ${on ? 'bg-[#7C4DFF]' : 'bg-[var(--d2b-border-strong)]'}`}
    >
      <span className={`absolute top-0.5 left-0.5 w-4 h-4 rounded-full bg-white shadow transition-transform ${on ? 'translate-x-5' : ''}`} />
    </button>
  )
}

// ─── Export ──────────────────────────────────────────────────────────────────
export function AutomacoesContent() {
  const [automacoes, setAutomacoes] = useState<Automacao[]>(AUTOMACOES_INICIAIS)
  const [saved,      setSaved]      = useState(false)
  const [bannerOpen, setBannerOpen] = useState(true)

  const setAtivo  = (id: string, v: boolean) => setAutomacoes(prev => prev.map(a => a.id === id ? { ...a, ativo: v } : a))
  const setQuando = (id: string, v: string)  => setAutomacoes(prev => prev.map(a => a.id === id ? { ...a, quando: v } : a))

  const handleSalvar = () => { setSaved(true); setTimeout(() => setSaved(false), 2000) }

  return (
    <div className="flex flex-col h-full">
      {/* Breadcrumb */}
      <div className="px-8 pt-5 pb-0 flex items-center gap-1.5 text-xs text-[var(--d2b-text-muted)]">
        <button className="hover:text-[var(--d2b-text-primary)] flex items-center gap-1">
          ← voltar
        </button>
        <span>≡ início</span>
        <span>configurações</span>
        <span className="text-[var(--d2b-text-secondary)]">painel de automação</span>
      </div>

      {/* Setup progress */}
      <div className="px-8 py-3 flex items-center justify-between">
        <div className="flex items-center gap-2 text-sm">
          <span className="w-5 h-5 rounded-full bg-[#7C4DFF] flex items-center justify-center text-white">
            <span className="text-[10px] font-bold">+</span>
          </span>
          <span className="text-[var(--d2b-text-muted)]">Etapa atual</span>
          <span className="font-medium text-[var(--d2b-text-primary)]">Configure a emissão da nota fiscal</span>
        </div>
        <div className="flex items-center gap-2 text-xs text-[var(--d2b-text-muted)]">
          <span>1 de 4</span>
          <div className="flex gap-0.5">
            {[0,1,2,3].map(i => (
              <div key={i} className={`h-1.5 w-8 rounded-full ${i === 0 ? 'bg-[#7C4DFF]' : 'bg-[var(--d2b-border-strong)]'}`} />
            ))}
          </div>
          <button className="text-[#7C4DFF] hover:text-[#5B21B6]">acessar o guia</button>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto px-8 pb-8">
        {/* Title */}
        <div className="mb-5">
          <div className="flex items-center gap-2 mb-1">
            <h2 className="text-xl font-semibold text-[var(--d2b-text-primary)]">Painel de automação</h2>
            <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-[#7C4DFF] text-white">Novo</span>
          </div>
          <p className="text-sm text-[var(--d2b-text-secondary)]">
            Selecione quais automações deseja configurar. Após selecionar, configure quando deseja que as ações sejam realizadas.
          </p>
        </div>

        {/* Warning */}
        {bannerOpen && (
          <div className="flex items-center justify-between p-4 rounded-xl border border-yellow-500/30 bg-yellow-500/5 mb-6">
            <div className="flex items-center gap-2">
              <span className="w-5 h-5 rounded-full bg-yellow-500 flex items-center justify-center shrink-0">
                <span className="text-white font-bold text-xs">!</span>
              </span>
              <p className="text-sm text-[var(--d2b-text-secondary)]">
                Lembre-se de salvar suas automações para garantir que tudo seja configurado!
              </p>
            </div>
            <button onClick={() => setBannerOpen(false)} className="text-[var(--d2b-text-muted)] hover:text-[var(--d2b-text-primary)] ml-4">
              <X size={14} />
            </button>
          </div>
        )}

        {/* Automation rows */}
        <div className="flex flex-col gap-3">
          {automacoes.map(a => (
            <div
              key={a.id}
              className="flex items-center gap-4 px-5 py-4 rounded-xl border border-[var(--d2b-border)] bg-[var(--d2b-bg-surface)] hover:border-[var(--d2b-border-strong)] transition-colors"
            >
              {/* Toggle */}
              <Toggle on={a.ativo} onChange={v => setAtivo(a.id, v)} />

              {/* Label */}
              <span className="flex-1 text-sm text-[var(--d2b-text-primary)]">{a.label}</span>

              {/* Connector */}
              <div className="flex items-center gap-1 text-[var(--d2b-text-muted)]">
                <div className="w-16 h-px bg-[var(--d2b-border-strong)]" />
                <ArrowLeftRight size={14} />
              </div>

              {/* Quando label */}
              <span className="text-sm font-medium text-[var(--d2b-text-secondary)] shrink-0">Quando</span>

              {/* When select */}
              <div className="relative w-56">
                <select
                  value={a.quando}
                  onChange={e => setQuando(a.id, e.target.value)}
                  disabled={!a.ativo}
                  className="w-full bg-[var(--d2b-bg-main)] border border-[var(--d2b-border-strong)] rounded-md px-3 py-2 text-sm text-[var(--d2b-text-primary)] appearance-none focus:outline-none focus:border-[#7C4DFF] transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
                >
                  {QUANDO_OPCOES.map(o => <option key={o}>{o}</option>)}
                </select>
                <ChevronDown size={12} className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none text-[var(--d2b-text-muted)]" />
              </div>

              {/* Status icon */}
              <div className={`w-8 h-8 rounded-full flex items-center justify-center shrink-0 ${
                a.ativo && a.quando !== 'Selecionar ação inicial'
                  ? 'bg-emerald-500 text-white'
                  : 'bg-[var(--d2b-bg-elevated)] border border-[var(--d2b-border-strong)] text-[var(--d2b-text-muted)]'
              }`}>
                {a.ativo && a.quando !== 'Selecionar ação inicial'
                  ? <Check size={14} />
                  : <Pause size={14} />
                }
              </div>
            </div>
          ))}
        </div>

        {/* Save */}
        <div className="mt-8">
          <button
            onClick={handleSalvar}
            className="flex items-center gap-2 px-5 py-2.5 rounded-full text-sm font-bold text-white bg-[#7C4DFF] hover:bg-[#5B21B6] transition-colors"
          >
            {saved ? <><Check size={14} /> salvo!</> : 'salvar automações'}
          </button>
        </div>
      </div>
    </div>
  )
}
