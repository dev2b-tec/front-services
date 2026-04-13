'use client'

import { useState } from 'react'
import { ArrowLeft, Printer, MoreHorizontal, ChevronLeft, ChevronRight } from 'lucide-react'

const TH = 'text-left px-3 py-3 text-xs font-semibold text-[var(--d2b-text-secondary)] uppercase tracking-wider whitespace-nowrap'
const TD = 'px-3 py-3 text-sm text-[var(--d2b-text-primary)] whitespace-nowrap'
const BTN_PRIMARY = 'flex items-center gap-2 px-4 py-2 rounded-full text-sm font-bold text-white bg-[#7C4DFF] hover:bg-[#5B21B6] transition-colors'
const BTN_OUTLINE = 'flex items-center gap-2 px-3 py-1.5 rounded-md text-sm font-medium border border-[var(--d2b-border-strong)] text-[var(--d2b-text-secondary)] hover:border-[#7C4DFF] hover:text-[var(--d2b-text-primary)] bg-transparent transition-colors'

type Tela = 'lista' | 'detalhe'

const MESES = ['Jan','Fev','Mar','Abr','Mai','Jun','Jul','Ago','Set','Out','Nov','Dez']

// Mock data: month index → value (only Abr 2026 has data)
const DATA_2025: Record<number, { venda: number; fat: number; meta: number }> =
  Object.fromEntries(MESES.map((_, i) => [i, { venda: 0, fat: 0, meta: 0 }]))

const DATA_2026: Record<number, { venda: number; fat: number; meta: number }> = {
  ...Object.fromEntries(MESES.map((_, i) => [i, { venda: 0, fat: 0, meta: 0 }])),
  3: { venda: 13.20, fat: 13.20, meta: 0 }, // Abril
}

function realizado(v: number, meta: number) {
  if (meta === 0) return '-'
  return ((v / meta) * 100).toFixed(0) + '%'
}

export function PerformanceVendasContent() {
  const [tela, setTela]             = useState<Tela>('lista')
  const [year2, setYear2]           = useState(2026)   // right column year
  const year1 = year2 - 1

  // ── DETALHE ────────────────────────────────────────────────────────────────
  if (tela === 'detalhe') {
    const d1 = DATA_2025
    const d2 = DATA_2026
    const total1 = Object.values(d1).reduce((s, r) => ({ venda: s.venda + r.venda, fat: s.fat + r.fat, meta: s.meta + r.meta }), { venda: 0, fat: 0, meta: 0 })
    const total2 = Object.values(d2).reduce((s, r) => ({ venda: s.venda + r.venda, fat: s.fat + r.fat, meta: s.meta + r.meta }), { venda: 0, fat: 0, meta: 0 })
    const media1 = { venda: total1.venda / 12, fat: total1.fat / 12, meta: total1.meta / 12 }
    const media2 = { venda: total2.venda / 12, fat: total2.fat / 12, meta: total2.meta / 12 }

    const fmt = (n: number) => n.toFixed(2).replace('.', ',').replace(/\B(?=(\d{3})+,)/g, '.')

    return (
      <div className="flex flex-col h-full overflow-hidden">
        {/* top bar */}
        <div className="flex items-center justify-between px-6 py-3 border-b border-[var(--d2b-border)] bg-[var(--d2b-bg-surface)] shrink-0">
          <div className="flex items-center gap-4">
            <button onClick={() => setTela('lista')} className="flex items-center gap-1 text-sm text-[#7C4DFF] hover:underline">
              <ArrowLeft size={14} /> voltar
            </button>
            <span className="text-xs text-[var(--d2b-text-muted)]">início ≡ vendas  performance de vendas</span>
          </div>
          <button className={BTN_PRIMARY}><Printer size={14} /> imprimir</button>
        </div>

        {/* body */}
        <div className="flex-1 overflow-y-auto px-6 py-4">
          <h1 className="text-xl font-bold text-[var(--d2b-text-primary)] mb-3">
            Performance de vendas - {year2}
          </h1>

          {/* vendor + filter chips */}
          <div className="flex items-center gap-2 mb-6 flex-wrap">
            <span className="px-2.5 py-1 rounded-md text-xs font-semibold bg-[var(--d2b-bg-elevated)] border border-[var(--d2b-border)] text-[var(--d2b-text-primary)]">JESSE</span>
            <span className="px-2.5 py-1 rounded-md text-xs border border-[var(--d2b-border)] text-[var(--d2b-text-secondary)]">por natureza de operação</span>
          </div>

          {/* comparison table */}
          <div className="border border-[var(--d2b-border)] rounded-xl overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="bg-[var(--d2b-bg-elevated)]">
                  {/* empty month col */}
                  <th className="px-3 py-3 w-16" />
                  {/* year 1 header */}
                  <th colSpan={5} className="px-3 py-3 text-center font-semibold text-[var(--d2b-text-primary)] border-l border-[var(--d2b-border)]">
                    <div className="flex items-center justify-center gap-2">
                      <button onClick={() => setYear2(y => y - 1)} className="p-0.5 rounded hover:bg-[var(--d2b-hover)]"><ChevronLeft size={14} /></button>
                      {year1}
                      <span className="w-[14px]" /> {/* spacer */}
                    </div>
                  </th>
                  {/* year 2 header */}
                  <th colSpan={5} className="px-3 py-3 text-center font-semibold text-[var(--d2b-text-primary)] border-l border-[var(--d2b-border)]">
                    <div className="flex items-center justify-center gap-2">
                      <span className="w-[14px]" />
                      {year2}
                      <button onClick={() => setYear2(y => y + 1)} className="p-0.5 rounded hover:bg-[var(--d2b-hover)]"><ChevronRight size={14} /></button>
                    </div>
                  </th>
                </tr>
                <tr className="bg-[var(--d2b-bg-elevated)] border-t border-[var(--d2b-border)]">
                  <th className="px-3 py-2 text-xs font-semibold text-[var(--d2b-text-secondary)] text-left" />
                  {/* yr1 sub-headers */}
                  {['Venda','Faturamento','Meta','Realizado'].map(h => (
                    <th key={'a'+h} className="px-3 py-2 text-xs font-semibold text-[var(--d2b-text-secondary)] text-right border-l border-[var(--d2b-border)] first:border-l-0">{h}</th>
                  ))}
                  <th className="w-2 border-l border-[var(--d2b-border)]" />
                  {/* yr2 sub-headers */}
                  {['Venda','Faturamento','Meta','Realizado'].map(h => (
                    <th key={'b'+h} className="px-3 py-2 text-xs font-semibold text-[var(--d2b-text-secondary)] text-right border-l border-[var(--d2b-border)] first:border-l-0">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {MESES.map((m, i) => {
                  const r1 = d1[i]
                  const r2 = d2[i]
                  const isAbr2026 = i === 3
                  return (
                    <tr key={m} className={`border-t border-[var(--d2b-border)] hover:bg-[var(--d2b-hover)] transition-colors ${isAbr2026 ? 'font-medium' : ''}`}>
                      <td className="px-3 py-2.5 text-xs text-[var(--d2b-text-secondary)] font-medium">{m}</td>
                      {/* yr1 */}
                      <td className="px-3 py-2.5 text-right text-[var(--d2b-text-primary)] border-l border-[var(--d2b-border)]">{fmt(r1.venda)}</td>
                      <td className="px-3 py-2.5 text-right text-[var(--d2b-text-primary)]">{fmt(r1.fat)}</td>
                      <td className="px-3 py-2.5 text-right text-[var(--d2b-text-primary)]">{fmt(r1.meta)}</td>
                      <td className="px-3 py-2.5 text-right text-[var(--d2b-text-muted)]">-</td>
                      <td className="px-3 py-2.5 text-right text-[var(--d2b-text-muted)]">-</td>
                      {/* yr2 */}
                      <td className="px-3 py-2.5 text-right text-[var(--d2b-text-primary)] border-l border-[var(--d2b-border-strong)]">{fmt(r2.venda)}</td>
                      <td className="px-3 py-2.5 text-right text-[var(--d2b-text-primary)]">{fmt(r2.fat)}</td>
                      <td className="px-3 py-2.5 text-right text-[var(--d2b-text-primary)]">{fmt(r2.meta)}</td>
                      <td className="px-3 py-2.5 text-right text-[var(--d2b-text-muted)]">-</td>
                      <td className="px-3 py-2.5 text-right text-[var(--d2b-text-muted)]">-</td>
                    </tr>
                  )
                })}
                {/* Total row */}
                <tr className="border-t-2 border-[var(--d2b-border-strong)] bg-[var(--d2b-bg-elevated)] font-semibold">
                  <td className="px-3 py-2.5 text-xs text-[var(--d2b-text-secondary)]">Total</td>
                  <td className="px-3 py-2.5 text-right border-l border-[var(--d2b-border)]">{fmt(total1.venda)}</td>
                  <td className="px-3 py-2.5 text-right">{fmt(total1.fat)}</td>
                  <td className="px-3 py-2.5 text-right">{fmt(total1.meta)}</td>
                  <td className="px-3 py-2.5 text-right text-[var(--d2b-text-muted)]">-</td>
                  <td className="px-3 py-2.5 text-right text-[var(--d2b-text-muted)]">-</td>
                  <td className="px-3 py-2.5 text-right border-l border-[var(--d2b-border-strong)]">{fmt(total2.venda)}</td>
                  <td className="px-3 py-2.5 text-right">{fmt(total2.fat)}</td>
                  <td className="px-3 py-2.5 text-right">{fmt(total2.meta)}</td>
                  <td className="px-3 py-2.5 text-right text-[var(--d2b-text-muted)]">-</td>
                  <td className="px-3 py-2.5 text-right text-[var(--d2b-text-muted)]">-</td>
                </tr>
                {/* Média row */}
                <tr className="border-t border-[var(--d2b-border)] bg-[var(--d2b-bg-elevated)]">
                  <td className="px-3 py-2.5 text-xs text-[var(--d2b-text-secondary)]">Média</td>
                  <td className="px-3 py-2.5 text-right text-sm text-[var(--d2b-text-primary)] border-l border-[var(--d2b-border)]">{fmt(media1.venda)}</td>
                  <td className="px-3 py-2.5 text-right text-sm">{fmt(media1.fat)}</td>
                  <td className="px-3 py-2.5 text-right text-sm">{fmt(media1.meta)}</td>
                  <td className="px-3 py-2.5" />
                  <td className="px-3 py-2.5" />
                  <td className="px-3 py-2.5 text-right text-sm text-[var(--d2b-text-primary)] border-l border-[var(--d2b-border-strong)]">{fmt(media2.venda)}</td>
                  <td className="px-3 py-2.5 text-right text-sm">{fmt(media2.fat)}</td>
                  <td className="px-3 py-2.5 text-right text-sm">{fmt(media2.meta)}</td>
                  <td className="px-3 py-2.5" />
                  <td className="px-3 py-2.5" />
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      </div>
    )
  }

  // ── LISTA ─────────────────────────────────────────────────────────────────
  return (
    <div className="flex flex-col h-full overflow-hidden">
      {/* top bar */}
      <div className="flex items-center justify-between px-6 py-3 border-b border-[var(--d2b-border)] bg-[var(--d2b-bg-surface)] shrink-0">
        <span className="text-xs text-[var(--d2b-text-muted)]">início ≡ vendas  performance de vendas</span>
      </div>

      <div className="flex-1 overflow-y-auto px-6 py-4">
        <h1 className="text-xl font-bold text-[var(--d2b-text-primary)] mb-4">Performance de vendas</h1>

        {/* filters */}
        <div className="flex items-center gap-2 mb-4 flex-wrap">
          <button className="flex items-center gap-1.5 px-2.5 py-1 rounded-md text-xs font-medium border border-[var(--d2b-border-strong)] text-[var(--d2b-text-secondary)] hover:bg-[var(--d2b-hover)]">
            📅 Abril
          </button>
          <button className={BTN_OUTLINE + ' text-xs py-1 px-2.5'}>por natureza de operação</button>
          <button className="flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium border border-[var(--d2b-border-strong)] text-[var(--d2b-text-secondary)] hover:bg-[var(--d2b-hover)]">
            Ativo
          </button>
          <button className="flex items-center gap-1 text-xs text-[var(--d2b-text-muted)] hover:text-[var(--d2b-text-primary)]">
            🗙 limpar filtros
          </button>
        </div>

        {/* table */}
        <div className="border border-[var(--d2b-border)] rounded-xl overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-[var(--d2b-bg-elevated)]">
              <tr>
                <th className="w-8 px-3 py-3" />
                <th className={TH}>Vendedor ⓘ</th>
                <th className={TH + ' text-right'}>Clientes atendidos ⓘ</th>
                <th className={TH + ' text-right'}>Clientes com vendas ⓘ</th>
                <th className={TH + ' text-right'}>Meta do mês ⓘ</th>
                <th className={TH + ' text-right'}>Vendas no mês ⓘ</th>
                <th className={TH + ' text-right'}>Faturamento no mês ⓘ</th>
                <th className={TH + ' text-right'}>Realizado ⓘ</th>
              </tr>
            </thead>
            <tbody>
              {/* data row */}
              <tr
                className="border-t border-[var(--d2b-border)] hover:bg-[var(--d2b-hover)] cursor-pointer transition-colors"
                onClick={() => setTela('detalhe')}
              >
                <td className="px-3 py-3">
                  <button className="text-[var(--d2b-text-muted)] hover:text-[var(--d2b-text-primary)]" onClick={e => e.stopPropagation()}>
                    <MoreHorizontal size={14} />
                  </button>
                </td>
                <td className={TD + ' text-[#7C4DFF] font-medium hover:underline'}>JESSE</td>
                <td className="px-3 py-3 text-sm text-right text-[var(--d2b-text-primary)]">0</td>
                <td className="px-3 py-3 text-sm text-right text-[var(--d2b-text-primary)]">1</td>
                <td className="px-3 py-3 text-sm text-right text-[var(--d2b-text-primary)]">0,00</td>
                <td className="px-3 py-3 text-sm text-right text-[var(--d2b-text-primary)]">13,20</td>
                <td className="px-3 py-3 text-sm text-right text-[var(--d2b-text-primary)]">13,20</td>
                <td className="px-3 py-3 text-sm text-right text-[var(--d2b-text-muted)]">-</td>
              </tr>
              {/* totals row */}
              <tr className="border-t border-[var(--d2b-border)] bg-[var(--d2b-bg-elevated)] font-semibold">
                <td className="px-3 py-3" />
                <td className="px-3 py-3 text-sm text-[var(--d2b-text-secondary)]">Totais</td>
                <td className="px-3 py-3 text-sm text-right text-[var(--d2b-text-primary)]">0</td>
                <td className="px-3 py-3 text-sm text-right text-[var(--d2b-text-primary)]">1</td>
                <td className="px-3 py-3 text-sm text-right text-[var(--d2b-text-primary)]">0,00</td>
                <td className="px-3 py-3 text-sm text-right text-[var(--d2b-text-primary)]">13,20</td>
                <td className="px-3 py-3 text-sm text-right text-[var(--d2b-text-primary)]">13,20</td>
                <td className="px-3 py-3 text-sm text-right text-[var(--d2b-text-muted)]">-%</td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}
