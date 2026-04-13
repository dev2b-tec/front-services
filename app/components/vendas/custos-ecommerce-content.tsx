'use client'

import { useState } from 'react'
import { MoreHorizontal, FileText, Settings, X } from 'lucide-react'

const BTN_OUTLINE = 'flex items-center gap-2 px-3 py-1.5 rounded-md text-sm font-medium border border-[var(--d2b-border-strong)] text-[var(--d2b-text-secondary)] hover:border-[#7C4DFF] hover:text-[var(--d2b-text-primary)] bg-transparent transition-colors'
const BTN_PRIMARY = 'flex items-center gap-2 px-4 py-2 rounded-full text-sm font-bold text-white bg-[#7C4DFF] hover:bg-[#5B21B6] transition-colors'
const SEL = 'w-full bg-[var(--d2b-bg-main)] border border-[var(--d2b-border-strong)] rounded-md px-3 py-2 text-sm text-[var(--d2b-text-primary)] focus:outline-none focus:border-[#7C4DFF] transition-colors appearance-none'

const PERIOD_OPTIONS = ['últimos 30 dias', 'últimos 3 meses', 'últimos 6 meses', 'este ano']
const CUSTO_OPTIONS  = ['Selecione', 'Custo de compra', 'Última compra']
const SITUACOES_OPTIONS = [
  'Aguardando pagamento', 'Em separação', 'Separado', 'Em despacho',
  'Despachado', 'Entregue', 'Cancelado', 'Devolvido', 'Em troca',
]

export function CustosEcommerceContent() {
  const [period, setPeriod] = useState('últimos 6 meses')
  const [showDrawer, setShowDrawer] = useState(false)
  const [custoBase, setCustoBase] = useState('Selecione')
  const [situacoesSel, setSituacoesSel] = useState<Set<string>>(
    new Set(SITUACOES_OPTIONS)
  )

  function toggleSituacao(s: string) {
    setSituacoesSel(prev => {
      const next = new Set(prev)
      if (next.has(s)) next.delete(s); else next.add(s)
      return next
    })
  }

  const metrics = [
    { label: 'faturamento', color: '#9CA3AF', value: 'R$ 0,00' },
    { label: 'frete do pedido', color: '#EF4444', value: 'R$ 0,00', info: true },
    { label: 'comissão', color: '#EC4899', value: 'R$ 0,00' },
  ]

  return (
    <div className="flex flex-col h-full overflow-hidden">
      {/* top bar */}
      <div className="flex items-center justify-between px-6 py-3 border-b border-[var(--d2b-border)] bg-[var(--d2b-bg-surface)] shrink-0">
        <span className="text-xs text-[var(--d2b-text-muted)]">início ≡ vendas custos do e-commerce</span>
        <div className="flex items-center gap-2">
          <button className={BTN_OUTLINE}><FileText size={14} /> relatório</button>
          <button className={BTN_OUTLINE}><MoreHorizontal size={14} /> ações</button>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto px-6 py-4">
        <h1 className="text-xl font-bold text-[var(--d2b-text-primary)] mb-4">Custos do e-commerce</h1>

        {/* period filter */}
        <div className="flex items-center gap-2 mb-6">
          {PERIOD_OPTIONS.map(p => (
            <button
              key={p}
              onClick={() => setPeriod(p)}
              className={[
                'flex items-center gap-1.5 px-3 py-1.5 rounded-full text-sm border transition-colors',
                period === p
                  ? 'bg-[#7C4DFF] text-white border-[#7C4DFF]'
                  : 'border-[var(--d2b-border-strong)] text-[var(--d2b-text-secondary)] hover:border-[#7C4DFF] hover:text-[var(--d2b-text-primary)]',
              ].join(' ')}
            >
              {p}
            </button>
          ))}
          <button
            onClick={() => setShowDrawer(true)}
            className={BTN_OUTLINE + ' ml-auto'}
          >
            <Settings size={14} /> configurar
          </button>
        </div>

        {/* metric cards */}
        <div className="flex gap-6 mb-6 flex-wrap">
          {metrics.map(m => (
            <div key={m.label} className="flex items-center gap-2">
              <span className="inline-block w-5 h-0.5" style={{ backgroundColor: m.color }} />
              <span className="text-sm text-[var(--d2b-text-secondary)]">
                {m.label}
                {m.info && <span className="ml-1 text-[var(--d2b-text-muted)]">ⓘ</span>}
              </span>
              <span className="text-sm font-semibold text-[var(--d2b-text-primary)]">{m.value}</span>
            </div>
          ))}
        </div>

        {/* chart placeholder */}
        <div className="bg-[var(--d2b-bg-surface)] border border-[var(--d2b-border)] rounded-xl p-6 min-h-[260px] flex flex-col justify-between">
          {/* y-axis labels */}
          <div className="flex gap-8">
            <div className="flex flex-col justify-between text-xs text-[var(--d2b-text-muted)] h-[180px] text-right pr-2">
              {['R$ 12', 'R$ 9', 'R$ 6', 'R$ 3', 'R$ 0'].map(l => <span key={l}>{l}</span>)}
            </div>
            {/* chart area */}
            <div className="flex-1 border-b border-l border-[var(--d2b-border)] relative h-[180px]">
              {/* horizontal grid lines */}
              {[0, 25, 50, 75].map(pct => (
                <div
                  key={pct}
                  className="absolute left-0 right-0 border-t border-dashed border-[var(--d2b-border)]"
                  style={{ bottom: `${pct}%` }}
                />
              ))}
              {/* flat lines at zero */}
              <svg className="w-full h-full" viewBox="0 0 400 180" preserveAspectRatio="none">
                <line x1="0" y1="180" x2="400" y2="180" stroke="#9CA3AF" strokeWidth="2" />
                <line x1="0" y1="180" x2="400" y2="180" stroke="#EF4444" strokeWidth="2" />
                <line x1="0" y1="180" x2="400" y2="180" stroke="#EC4899" strokeWidth="2" />
              </svg>
            </div>
          </div>
          {/* x-axis labels */}
          <div className="flex justify-around pl-10 mt-2">
            {['Out', 'Nov', 'Dez', 'Jan', 'Fev', 'Mar', 'Abr'].map(m => (
              <span key={m} className="text-xs text-[var(--d2b-text-muted)]">{m}</span>
            ))}
          </div>
        </div>
      </div>

      {/* Configurações drawer */}
      {showDrawer && (
        <>
          <div className="fixed inset-0 bg-black/20 z-30" onClick={() => setShowDrawer(false)} />
          <aside className="fixed right-0 top-0 h-full w-[360px] bg-[var(--d2b-bg-surface)] border-l border-[var(--d2b-border)] z-40 flex flex-col shadow-xl">
            <div className="flex items-center justify-between px-5 py-4 border-b border-[var(--d2b-border)]">
              <h2 className="text-base font-bold text-[var(--d2b-text-primary)]">Configurações</h2>
              <button onClick={() => setShowDrawer(false)} className="text-[var(--d2b-text-muted)] hover:text-[var(--d2b-text-primary)]">
                <X size={18} />
              </button>
            </div>

            <div className="flex-1 overflow-y-auto px-5 py-4 flex flex-col gap-5">
              {/* Situações dos pedidos */}
              <div>
                <label className="block text-xs text-[var(--d2b-text-secondary)] mb-2">Situações dos pedidos</label>
                <div className="bg-[var(--d2b-bg-main)] border border-[var(--d2b-border-strong)] rounded-md px-3 py-2 text-sm text-[var(--d2b-text-primary)] flex items-center justify-between cursor-pointer">
                  <span>{situacoesSel.size} selecionadas</span>
                  <span className="text-[var(--d2b-text-muted)]">▾</span>
                </div>
                <div className="mt-2 border border-[var(--d2b-border)] rounded-md divide-y divide-[var(--d2b-border)] max-h-48 overflow-y-auto">
                  {SITUACOES_OPTIONS.map(s => (
                    <label key={s} className="flex items-center gap-2 px-3 py-2 text-sm text-[var(--d2b-text-primary)] hover:bg-[var(--d2b-hover)] cursor-pointer">
                      <input
                        type="checkbox"
                        checked={situacoesSel.has(s)}
                        onChange={() => toggleSituacao(s)}
                        className="accent-[#7C4DFF] rounded"
                      />
                      {s}
                    </label>
                  ))}
                </div>
              </div>

              {/* Custo baseado em */}
              <div>
                <label className="block text-xs text-[var(--d2b-text-secondary)] mb-1">Custo baseado em</label>
                <div className="relative">
                  <select
                    value={custoBase}
                    onChange={e => setCustoBase(e.target.value)}
                    className={SEL}
                  >
                    {CUSTO_OPTIONS.map(o => <option key={o}>{o}</option>)}
                  </select>
                  <span className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-[var(--d2b-text-muted)]">▾</span>
                </div>
              </div>
            </div>

            <div className="border-t border-[var(--d2b-border)] px-5 py-4 flex items-center justify-end gap-2">
              <button onClick={() => setShowDrawer(false)} className="text-sm text-[var(--d2b-text-secondary)] hover:text-[var(--d2b-text-primary)] px-3 py-1.5">
                cancelar
              </button>
              <button onClick={() => setShowDrawer(false)} className={BTN_PRIMARY}>
                aplicar
              </button>
            </div>
          </aside>
        </>
      )}
    </div>
  )
}
