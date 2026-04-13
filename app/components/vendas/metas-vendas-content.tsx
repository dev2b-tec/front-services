'use client'

import { useState } from 'react'
import { Calendar, ChevronLeft, ChevronRight, Printer, X } from 'lucide-react'

const BTN_OUTLINE = 'flex items-center gap-2 px-3 py-1.5 rounded-md text-sm font-medium border border-[var(--d2b-border-strong)] text-[var(--d2b-text-secondary)] hover:border-[#7C4DFF] hover:text-[var(--d2b-text-primary)] bg-transparent transition-colors'
const TH = 'text-left px-3 py-3 text-xs font-semibold text-[var(--d2b-text-secondary)] uppercase tracking-wider whitespace-nowrap'
const TD = 'px-3 py-3 text-sm text-[var(--d2b-text-primary)] whitespace-nowrap'

const MONTHS = ['Jan', 'Fev', 'Mar', 'Abr', 'Mai', 'Jun', 'Jul', 'Ago', 'Set', 'Out', 'Nov', 'Dez']

const MOCK_PERF: Record<string, {
  vendedor: string
  clientesAtendidos: number
  clientesComVendas: number
  metaMes: string
  vendasMes: string
  faturamentoMes: string
  realizado: string
}[]> = {
  lista: [
    {
      vendedor: 'JESSE',
      clientesAtendidos: 0,
      clientesComVendas: 1,
      metaMes: '0,00',
      vendasMes: '13,20',
      faturamentoMes: '13,20',
      realizado: '-',
    },
  ],
}

const YEAR_DATA: Record<number, { venda: string; faturamento: string; meta: string; realizado: string }[]> = {
  2025: MONTHS.map(() => ({ venda: '0,00', faturamento: '0,00', meta: '0,00', realizado: '-' })),
  2026: MONTHS.map((_, i) => ({
    venda: i === 3 ? '13,20' : '0,00',
    faturamento: i === 3 ? '13,20' : '0,00',
    meta: '0,00',
    realizado: i === 3 ? '-' : '-',
  })),
}

type Tela = 'lista' | 'detalhe'

export function MetasVendasContent() {
  const [tela, setTela]        = useState<Tela>('lista')
  const [currentYear, setCurrentYear] = useState(2026)
  const [selectedVendedor, setSelectedVendedor] = useState('JESSE')

  /* ── Detalhe anual ── */
  if (tela === 'detalhe') {
    const prevYear = currentYear - 1
    const prevData = YEAR_DATA[prevYear] ?? MONTHS.map(() => ({ venda: '0,00', faturamento: '0,00', meta: '0,00', realizado: '-' }))
    const currData = YEAR_DATA[currentYear] ?? MONTHS.map(() => ({ venda: '0,00', faturamento: '0,00', meta: '0,00', realizado: '-' }))

    const totPrev = { venda: '0,00', fat: '0,00', meta: '0,00' }
    const totCurr = { venda: '13,20', fat: '13,20', meta: '0,00' }
    const medCurr = { venda: '1,10', fat: '1,10', meta: '0,00' }

    return (
      <div className="flex flex-col h-full overflow-hidden">
        <div className="flex items-center justify-between px-6 py-3 border-b border-[var(--d2b-border)] bg-[var(--d2b-bg-surface)] shrink-0">
          <div className="flex items-center gap-4">
            <button onClick={() => setTela('lista')} className="flex items-center gap-1 text-sm text-[#7C4DFF] hover:underline">
              <ChevronLeft size={14} /> voltar
            </button>
            <span className="text-xs text-[var(--d2b-text-muted)]">início ≡ vendas performance de vendas</span>
          </div>
          <button className={BTN_OUTLINE}><Printer size={14} /> imprimir</button>
        </div>

        <div className="flex-1 overflow-y-auto px-6 py-4">
          <h1 className="text-xl font-bold text-[var(--d2b-text-primary)] mb-4">
            Performance de vendas - {currentYear}
          </h1>

          {/* pills */}
          <div className="flex items-center gap-3 mb-5">
            <span className="px-3 py-1.5 rounded-full bg-[#7C4DFF] text-white text-sm font-semibold">
              {selectedVendedor}
            </span>
            <button className={BTN_OUTLINE}>por natureza de operação</button>
          </div>

          {/* side-by-side year comparison */}
          <div className="border border-[var(--d2b-border)] rounded-xl overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="bg-[var(--d2b-bg-elevated)]">
                  <th className="px-4 py-3 text-left w-16" />
                  {/* prev year */}
                  <th colSpan={5} className="px-4 py-3 text-center text-sm font-semibold text-[var(--d2b-text-primary)] border-r border-[var(--d2b-border)]">
                    <div className="flex items-center justify-center gap-2">
                      <button onClick={() => setCurrentYear(y => y - 1)} className="text-[var(--d2b-text-muted)] hover:text-[var(--d2b-text-primary)]"><ChevronLeft size={14} /></button>
                      {prevYear}
                    </div>
                  </th>
                  {/* curr year */}
                  <th colSpan={5} className="px-4 py-3 text-center text-sm font-semibold text-[var(--d2b-text-primary)]">
                    <div className="flex items-center justify-center gap-2">
                      {currentYear}
                      <button onClick={() => setCurrentYear(y => y + 1)} className="text-[var(--d2b-text-muted)] hover:text-[var(--d2b-text-primary)]"><ChevronRight size={14} /></button>
                    </div>
                  </th>
                </tr>
                <tr className="text-xs text-[var(--d2b-text-secondary)] bg-[var(--d2b-bg-elevated)] border-b border-[var(--d2b-border)]">
                  <th className="text-left px-4 py-2 font-semibold" />
                  {['Venda', 'Faturamento', 'Meta', 'Realizado'].map(h => (
                    <th key={`prev-${h}`} className="text-right px-3 py-2 font-semibold">{h}</th>
                  ))}
                  <th className="border-r border-[var(--d2b-border)] w-2" />
                  {['Venda', 'Faturamento', 'Meta', 'Realizado'].map(h => (
                    <th key={`curr-${h}`} className="text-right px-3 py-2 font-semibold">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-[var(--d2b-border)]">
                {MONTHS.map((month, i) => (
                  <tr key={month} className={`hover:bg-[var(--d2b-hover)] transition-colors ${i === 3 ? 'font-medium' : ''}`}>
                    <td className="px-4 py-2 text-xs text-[var(--d2b-text-secondary)]">{month}</td>
                    <td className="px-3 py-2 text-right">{prevData[i].venda}</td>
                    <td className="px-3 py-2 text-right">{prevData[i].faturamento}</td>
                    <td className="px-3 py-2 text-right">{prevData[i].meta}</td>
                    <td className="px-3 py-2 text-right text-[var(--d2b-text-muted)]">-</td>
                    <td className="border-r border-[var(--d2b-border)]" />
                    <td className={`px-3 py-2 text-right ${i === 3 ? 'text-[#7C4DFF] font-semibold' : ''}`}>{currData[i].venda}</td>
                    <td className={`px-3 py-2 text-right ${i === 3 ? 'text-[#7C4DFF] font-semibold' : ''}`}>{currData[i].faturamento}</td>
                    <td className="px-3 py-2 text-right">{currData[i].meta}</td>
                    <td className="px-3 py-2 text-right text-[var(--d2b-text-muted)]">-</td>
                  </tr>
                ))}
                {/* Total row */}
                <tr className="font-semibold bg-[var(--d2b-bg-elevated)]">
                  <td className="px-4 py-2 text-xs text-[var(--d2b-text-secondary)]">Total</td>
                  <td className="px-3 py-2 text-right">{totPrev.venda}</td>
                  <td className="px-3 py-2 text-right">{totPrev.fat}</td>
                  <td className="px-3 py-2 text-right">{totPrev.meta}</td>
                  <td className="px-3 py-2 text-right text-[var(--d2b-text-muted)]">-</td>
                  <td className="border-r border-[var(--d2b-border)]" />
                  <td className="px-3 py-2 text-right text-[#7C4DFF]">{totCurr.venda}</td>
                  <td className="px-3 py-2 text-right text-[#7C4DFF]">{totCurr.fat}</td>
                  <td className="px-3 py-2 text-right">{totCurr.meta}</td>
                  <td className="px-3 py-2 text-right text-[var(--d2b-text-muted)]">-</td>
                </tr>
                {/* Média row */}
                <tr className="font-semibold bg-[var(--d2b-bg-elevated)]">
                  <td className="px-4 py-2 text-xs text-[var(--d2b-text-secondary)]">Média</td>
                  <td className="px-3 py-2 text-right">0,00</td>
                  <td className="px-3 py-2 text-right">0,00</td>
                  <td className="px-3 py-2 text-right">0,00</td>
                  <td className="border-r border-[var(--d2b-border)]" />
                  <td className="px-3 py-2 text-right" />
                  <td className="px-3 py-2 text-right text-[#7C4DFF]">{medCurr.venda}</td>
                  <td className="px-3 py-2 text-right text-[#7C4DFF]">{medCurr.fat}</td>
                  <td className="px-3 py-2 text-right">{medCurr.meta}</td>
                  <td className="px-3 py-2 text-right" />
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      </div>
    )
  }

  /* ── Lista / Painel principal ── */
  const rows = MOCK_PERF.lista

  return (
    <div className="flex flex-col h-full overflow-hidden">
      <div className="flex items-center justify-between px-6 py-3 border-b border-[var(--d2b-border)] bg-[var(--d2b-bg-surface)] shrink-0">
        <span className="text-xs text-[var(--d2b-text-muted)]">início ≡ vendas performance de vendas</span>
      </div>

      <div className="flex-1 overflow-y-auto px-6 py-4">
        <h1 className="text-xl font-bold text-[var(--d2b-text-primary)] mb-4">Performance de vendas</h1>

        {/* filters */}
        <div className="flex items-center gap-2 mb-4 flex-wrap">
          <button className={BTN_OUTLINE}><Calendar size={13} /> Abril</button>
          <button className={BTN_OUTLINE}>por natureza de operação</button>
          <button className="px-3 py-1.5 rounded-full text-sm border bg-[#7C4DFF] text-white border-[#7C4DFF]">Ativo</button>
          <button className="flex items-center gap-1 text-sm text-[var(--d2b-text-muted)] hover:text-[var(--d2b-text-primary)]">
            <X size={12} /> limpar filtros
          </button>
        </div>

        {/* table */}
        <div className="border border-[var(--d2b-border)] rounded-xl overflow-hidden">
          <table className="w-full">
            <thead className="bg-[var(--d2b-bg-elevated)]">
              <tr>
                <th className="w-8 px-3 py-3" />
                <th className={TH}>Vendedor ↕</th>
                <th className={TH}>Clientes atendidos ↕</th>
                <th className={TH}>Clientes com vendas ↕</th>
                <th className={TH}>Meta do mês ↕</th>
                <th className={TH}>Vendas no mês ↕</th>
                <th className={TH}>Faturamento no mês ↕</th>
                <th className={TH}>Realizado ↕</th>
              </tr>
            </thead>
            <tbody>
              {rows.map(r => (
                <tr
                  key={r.vendedor}
                  className="border-t border-[var(--d2b-border)] hover:bg-[var(--d2b-hover)] cursor-pointer transition-colors"
                  onClick={() => { setSelectedVendedor(r.vendedor); setTela('detalhe') }}
                >
                  <td className="px-3 py-3">
                    <button className="text-[var(--d2b-text-muted)] hover:text-[var(--d2b-text-primary)]">⋯</button>
                  </td>
                  <td className={TD + ' text-[#7C4DFF] font-medium cursor-pointer hover:underline'}>
                    {r.vendedor}
                  </td>
                  <td className={TD}>{r.clientesAtendidos}</td>
                  <td className={TD}>{r.clientesComVendas}</td>
                  <td className={TD}>{r.metaMes}</td>
                  <td className={TD}>{r.vendasMes}</td>
                  <td className={TD}>{r.faturamentoMes}</td>
                  <td className={TD + ' text-[var(--d2b-text-muted)]'}>{r.realizado}</td>
                </tr>
              ))}
              <tr className="border-t border-[var(--d2b-border)] bg-[var(--d2b-bg-elevated)] font-semibold">
                <td className="px-3 py-3" />
                <td className={TD}>Totais</td>
                <td className={TD}>0</td>
                <td className={TD}>1</td>
                <td className={TD}>0,00</td>
                <td className={TD}>13,20</td>
                <td className={TD}>13,20</td>
                <td className={TD + ' text-[var(--d2b-text-muted)]'}>-%</td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}
