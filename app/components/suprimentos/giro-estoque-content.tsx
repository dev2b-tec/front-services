'use client'

import { useState } from 'react'
import { ChevronDown, Search, X, Download, Tag, Info } from 'lucide-react'

// ─── Shared styles ──────────────────────────────────────────────────────────
const INP =
  'w-full bg-[var(--d2b-bg-main)] border border-[var(--d2b-border-strong)] rounded-md ' +
  'px-3 py-2 text-sm text-[var(--d2b-text-primary)] placeholder:text-[var(--d2b-text-muted)] ' +
  'focus:outline-none focus:border-[#7C4DFF] transition-colors'

const SEL =
  'w-full bg-[var(--d2b-bg-main)] border border-[var(--d2b-border-strong)] rounded-md ' +
  'px-3 py-2 text-sm text-[var(--d2b-text-primary)] ' +
  'focus:outline-none focus:border-[#7C4DFF] transition-colors appearance-none'

const LBL = 'block text-xs text-[var(--d2b-text-secondary)] mb-1'

const BTN_PRIMARY =
  'flex items-center gap-2 px-4 py-2.5 rounded-full text-sm font-bold text-white bg-[#7C4DFF] hover:bg-[#5B21B6] transition-colors'

const BTN_OUTLINE =
  'flex items-center gap-2 px-4 py-2 rounded-md text-sm font-medium border border-[var(--d2b-border-strong)] ' +
  'text-[var(--d2b-text-secondary)] hover:border-[#7C4DFF] hover:text-[var(--d2b-text-primary)] bg-transparent transition-colors'

// ─── Types ──────────────────────────────────────────────────────────────────
type Tela = 'filtros' | 'resultado'

type Filtros = {
  de: string
  ate: string
  categoria: string
  tipo: string
  tags: string
  considerarZerado: boolean
}

type TagConfig = {
  giroNormal: string
  baixoGiro: string
  encalhe: string
}

// ═══════════════════════════════════════════════════════════════════════════
// DRAWER — Aplicar Tags
// ═══════════════════════════════════════════════════════════════════════════
function DrawerAplicarTags({
  onClose,
}: {
  onClose: () => void
}) {
  const [step, setStep] = useState<1 | 2>(1)
  const [grupoTags, setGrupoTags] = useState('')
  const [config, setConfig]       = useState<TagConfig>({ giroNormal: 'Giro normal', baixoGiro: 'Giro normal', encalhe: 'Giro normal' })

  return (
    <div className="fixed inset-0 z-40 flex">
      <div className="flex-1 bg-black/30" onClick={onClose} />
      <div className="w-[420px] bg-[var(--d2b-bg-elevated)] border-l border-[var(--d2b-border)] flex flex-col h-full shadow-2xl">
        <div className="flex items-center justify-between px-6 py-4 border-b border-[var(--d2b-border)]">
          <h3 className="text-base font-semibold text-[var(--d2b-text-primary)]">Aplicar tags</h3>
          <button onClick={onClose} className="text-sm text-[var(--d2b-text-secondary)] hover:text-[var(--d2b-text-primary)] transition-colors">
            fechar ×
          </button>
        </div>

        <div className="flex-1 overflow-y-auto px-6 py-5">
          {step === 1 ? (
            <div>
              <label className={LBL}>Grupo de Tags</label>
              <div className="relative">
                <select className={SEL} value={grupoTags} onChange={e => setGrupoTags(e.target.value)}>
                  <option value="">Selecione</option>
                  <option>Grupo 1</option>
                  <option>Grupo 2</option>
                </select>
                <ChevronDown size={13} className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none text-[var(--d2b-text-muted)]" />
              </div>
            </div>
          ) : (
            <div className="flex flex-col gap-4">
              {(['giroNormal', 'baixoGiro', 'encalhe'] as const).map(k => {
                const labels = { giroNormal: 'Giro Normal', baixoGiro: 'Baixo Giro', encalhe: 'Encalhe' }
                return (
                  <div key={k}>
                    <label className={LBL}>{labels[k]}</label>
                    <div className="relative">
                      <select
                        className={SEL}
                        value={config[k]}
                        onChange={e => setConfig(prev => ({ ...prev, [k]: e.target.value }))}
                      >
                        <option>Giro normal</option>
                        <option>Baixo giro</option>
                        <option>Encalhe</option>
                      </select>
                      <ChevronDown size={13} className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none text-[var(--d2b-text-muted)]" />
                    </div>
                  </div>
                )
              })}
            </div>
          )}
        </div>

        <div className="px-6 py-4 border-t border-[var(--d2b-border)] flex items-center gap-3">
          {step === 1 ? (
            <>
              <button onClick={() => grupoTags && setStep(2)} className={BTN_PRIMARY}>avançar</button>
              <button onClick={onClose} className="text-sm text-[var(--d2b-text-secondary)] hover:text-[var(--d2b-text-primary)] transition-colors">fechar</button>
            </>
          ) : (
            <>
              <button onClick={onClose} className={BTN_PRIMARY}>aplicar tags</button>
              <button onClick={onClose} className="text-sm text-[var(--d2b-text-secondary)] hover:text-[var(--d2b-text-primary)] transition-colors">fechar</button>
            </>
          )}
        </div>
      </div>
    </div>
  )
}

// ═══════════════════════════════════════════════════════════════════════════
// RESULTADO
// ═══════════════════════════════════════════════════════════════════════════
function GiroResultado({ onExibirFiltros }: { onExibirFiltros: () => void }) {
  const [drawerOpen, setDrawerOpen] = useState(false)

  // "slider" visual — encalhe 0.00, baixo giro 0.01–1.00, giro normal >1.00
  const encalhePercent = 100

  const categories = [
    { key: 'encalhe',     cor: 'bg-pink-400',  label: '— encalhe',      ate: 'até 0,00',           giroMedio: '0,00', dsiMedio: '0,00', qtdProdutos: 1 },
    { key: 'baixoGiro',   cor: 'bg-rose-600',  label: '— baixo giro',   range: 'de 0,01 até 1,00', giroMedio: '0,00', dsiMedio: '0,00', qtdProdutos: 0 },
    { key: 'giroNormal',  cor: 'bg-blue-500',  label: '— giro normal',  range: 'maior que 1,00',   giroMedio: '0,00', dsiMedio: '0,00', qtdProdutos: 0 },
  ]

  return (
    <div className="flex flex-col h-full">
      {/* title + exibir filtros */}
      <div className="px-8 pt-6 pb-4">
        <h2 className="text-xl font-semibold text-[var(--d2b-text-primary)] mb-4">Giro de Estoque</h2>
        <button onClick={onExibirFiltros} className={BTN_OUTLINE}>
          exibir filtros
        </button>
      </div>

      {/* main content */}
      <div className="flex-1 overflow-y-auto px-8 pb-8">
        <div className="flex items-start gap-12 flex-wrap">
          {/* Donut chart (CSS-only) */}
          <div className="relative w-48 h-48 shrink-0">
            <svg viewBox="0 0 120 120" className="w-48 h-48 -rotate-90">
              <circle cx="60" cy="60" r="45" fill="none" stroke="#f9a8d4" strokeWidth="20" strokeDasharray="282.7" strokeDashoffset="0" />
            </svg>
            <div className="absolute inset-0 flex items-center justify-center">
              <span className="text-sm font-bold text-[var(--d2b-text-primary)]">100,00 %</span>
            </div>
          </div>

          {/* Legenda e métricas */}
          <div className="flex-1 min-w-[300px]">
            {/* Slider visual */}
            <p className="text-xs text-[var(--d2b-text-secondary)] mb-2">Intervalos de classificação do giro de estoque</p>
            <div className="relative h-2 rounded-full overflow-hidden flex mb-6">
              <div className="flex-none w-[58%] bg-rose-600" />
              <div className="flex-none w-[42%] bg-blue-500" />
              <div className="absolute top-1/2 left-[58%] -translate-y-1/2 w-3 h-3 bg-white border-2 border-[var(--d2b-border-strong)] rounded-full shadow" />
            </div>

            {/* Headers */}
            <div className="grid grid-cols-4 gap-2 text-xs mb-1">
              <div />
              {categories.map(c => (
                <div key={c.key}>
                  <span className={`inline-block w-3 h-0.5 ${c.cor} mr-1`} />
                  <span className="text-[var(--d2b-text-muted)]">{c.label.replace('— ', '')}</span>
                  <p className="font-semibold text-[var(--d2b-text-primary)]">{c.ate ?? c.range}</p>
                </div>
              ))}
            </div>

            {/* Rows */}
            {[
              { label: 'Giro Médio', key: 'giroMedio' as const },
              { label: 'DSI Médio', key: 'dsiMedio' as const, info: true },
              { label: 'Qtd. Produtos', key: 'qtdProdutos' as const },
            ].map(row => (
              <div key={row.label} className="grid grid-cols-4 gap-2 py-2 border-t border-[var(--d2b-border)] text-sm">
                <span className="text-[var(--d2b-text-secondary)] flex items-center gap-1">
                  {row.label}
                  {row.info && <Info size={11} className="text-[var(--d2b-text-muted)]" />}
                </span>
                {categories.map(c => (
                  <span key={c.key} className="text-[var(--d2b-text-primary)]">
                    {c[row.key]}
                  </span>
                ))}
              </div>
            ))}

            {/* ver produtos */}
            <div className="grid grid-cols-4 gap-2 py-2">
              <div />
              {categories.map(c => (
                <button key={c.key} className="text-xs text-[#7C4DFF] hover:text-[#5B21B6] transition-colors text-left">
                  ver produtos
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Footer */}
      <div className="px-8 py-4 border-t border-[var(--d2b-border)] bg-[var(--d2b-bg-surface)] flex items-center gap-3">
        <button onClick={() => setDrawerOpen(true)} className={BTN_PRIMARY}>
          <Tag size={13} />
          aplicar tags
        </button>
        <button className={BTN_OUTLINE}>
          <Download size={13} />
          download
        </button>
      </div>

      {drawerOpen && <DrawerAplicarTags onClose={() => setDrawerOpen(false)} />}
    </div>
  )
}

// ═══════════════════════════════════════════════════════════════════════════
// FILTROS
// ═══════════════════════════════════════════════════════════════════════════
function GiroFiltros({ onGerar }: { onGerar: () => void }) {
  const [f, setF] = useState<Filtros>({
    de: '09/10/2025',
    ate: '07/04/2026',
    categoria: '',
    tipo: 'Todos',
    tags: 'Sem filtro por tags',
    considerarZerado: false,
  })
  const set = <K extends keyof Filtros>(k: K, v: Filtros[K]) =>
    setF(prev => ({ ...prev, [k]: v }))

  return (
    <div className="flex flex-col h-full overflow-y-auto">
      <div className="px-8 pt-6 pb-8">
        <h2 className="text-xl font-semibold text-[var(--d2b-text-primary)] mb-6">Giro de Estoque</h2>

        {/* Período */}
        <div className="mb-5">
          <p className="text-sm font-medium text-[var(--d2b-text-primary)] mb-3">Período</p>
          <div className="flex flex-col gap-2 max-w-xs">
            <div className="flex items-center gap-2">
              <span className="text-xs text-[var(--d2b-text-muted)] w-6">De</span>
              <div className="relative flex-1">
                <input className={INP + ' pr-9'} value={f.de} onChange={e => set('de', e.target.value)} />
                <button className="absolute right-3 top-1/2 -translate-y-1/2 text-[var(--d2b-text-muted)]">
                  <svg width="13" height="13" fill="none" viewBox="0 0 24 24" stroke="currentColor"><rect x="3" y="4" width="18" height="18" rx="2" strokeWidth="1.5"/><path d="M16 2v4M8 2v4M3 10h18" strokeWidth="1.5"/></svg>
                </button>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-xs text-[var(--d2b-text-muted)] w-6">Até</span>
              <div className="relative flex-1">
                <input className={INP + ' pr-9'} value={f.ate} onChange={e => set('ate', e.target.value)} />
                <button className="absolute right-3 top-1/2 -translate-y-1/2 text-[var(--d2b-text-muted)]">
                  <svg width="13" height="13" fill="none" viewBox="0 0 24 24" stroke="currentColor"><rect x="3" y="4" width="18" height="18" rx="2" strokeWidth="1.5"/><path d="M16 2v4M8 2v4M3 10h18" strokeWidth="1.5"/></svg>
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Categoria + Tipo + Tags */}
        <div className="grid grid-cols-3 gap-6 mb-5 max-w-2xl">
          <div>
            <label className={LBL}>Categoria</label>
            <div className="flex items-center gap-1.5 border border-[var(--d2b-border-strong)] rounded-md bg-[var(--d2b-bg-main)] px-3 h-10">
              <input
                className="flex-1 bg-transparent text-sm text-[var(--d2b-text-primary)] placeholder:text-[var(--d2b-text-muted)] outline-none"
                value={f.categoria}
                onChange={e => set('categoria', e.target.value)}
              />
              <Search size={13} className="text-[var(--d2b-text-muted)] cursor-pointer shrink-0" />
              {f.categoria && (
                <button onClick={() => set('categoria', '')} className="text-[var(--d2b-text-muted)] hover:text-[var(--d2b-text-primary)]">
                  <X size={13} />
                </button>
              )}
            </div>
          </div>
          <div>
            <label className={LBL}>Tipo</label>
            <div className="relative">
              <select className={SEL} value={f.tipo} onChange={e => set('tipo', e.target.value)}>
                <option>Todos</option>
                <option>Simples</option>
                <option>Com variações</option>
              </select>
              <ChevronDown size={13} className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none text-[var(--d2b-text-muted)]" />
            </div>
          </div>
          <div>
            <label className={LBL}>Tags dos produtos</label>
            <div className="relative">
              <select className={SEL} value={f.tags} onChange={e => set('tags', e.target.value)}>
                <option>Sem filtro por tags</option>
              </select>
              <ChevronDown size={13} className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none text-[var(--d2b-text-muted)]" />
            </div>
          </div>
        </div>

        {/* Checkbox */}
        <label className="flex items-center gap-2 cursor-pointer mb-6">
          <input
            type="checkbox"
            checked={f.considerarZerado}
            onChange={e => set('considerarZerado', e.target.checked)}
            className="w-4 h-4 rounded accent-[#7C4DFF]"
          />
          <span className="text-sm text-[var(--d2b-text-secondary)]">
            Considerar produtos cujo saldo final é zerado
          </span>
          <Info size={12} className="text-[var(--d2b-text-muted)]" />
        </label>

        <button onClick={onGerar} className={BTN_PRIMARY}>gerar</button>
      </div>
    </div>
  )
}

// ═══════════════════════════════════════════════════════════════════════════
// EXPORT
// ═══════════════════════════════════════════════════════════════════════════
export function GiroEstoqueContent() {
  const [tela, setTela] = useState<Tela>('filtros')

  if (tela === 'resultado')
    return <GiroResultado onExibirFiltros={() => setTela('filtros')} />

  return <GiroFiltros onGerar={() => setTela('resultado')} />
}
