'use client'

import { useState } from 'react'
import { MoreHorizontal, RefreshCw, ChevronRight } from 'lucide-react'

const BTN_OUTLINE = 'flex items-center gap-2 px-3 py-1.5 rounded-md text-sm font-medium border border-[var(--d2b-border-strong)] text-[var(--d2b-text-secondary)] hover:border-[#7C4DFF] hover:text-[var(--d2b-text-primary)] bg-transparent transition-colors'

const PERIOD_OPTIONS = ['Ontem', 'Últimos 7 dias', 'Últimos 30 dias', 'Últimas 4 semanas', 'Último mês']

const OVERVIEW_ITEMS = [
  { label: '(+) Faturamento',               value: 'R$ 0,00', color: 'bg-blue-50 border-blue-100' },
  { label: 'Frete das vendas',              value: 'R$ 0,00', color: 'bg-gray-50 border-gray-100' },
  { label: '(-) Custo adicional com Frete', value: 'R$ 0,00', color: 'bg-gray-50 border-gray-100' },
  { label: '(-) Comissões',                 value: 'R$ 0,00', color: 'bg-gray-50 border-gray-100' },
  { label: '(-) Taxas e tarifas',           value: 'R$ 0,00', color: 'bg-gray-50 border-gray-100' },
  { label: '(-) Custos de compras',         value: 'R$ 0,00', color: 'bg-gray-50 border-gray-100' },
  { label: '(-) Impostos das vendas',       value: 'R$ 0,00', color: 'bg-gray-50 border-gray-100' },
  { label: '(+) Incentivos',                value: 'R$ 0,00', color: 'bg-gray-50 border-gray-100' },
  { label: '(+) Créditos de impostos',      value: 'R$ 0,00', color: 'bg-gray-50 border-gray-100' },
  { label: '(-) Valores adicionais',        value: 'R$ 0,00', color: 'bg-gray-50 border-gray-100' },
]

const TH = 'text-left px-3 py-2 text-xs font-semibold text-[var(--d2b-text-secondary)] uppercase tracking-wider whitespace-nowrap'
const TD = 'px-3 py-2 text-sm text-[var(--d2b-text-primary)] whitespace-nowrap'

export function MargemContribuicaoContent() {
  const [period, setPeriod] = useState('Últimos 7 dias')
  const [rentFilter, setRentFilter] = useState(true) // "Mais rentáveis"

  return (
    <div className="flex flex-col h-full overflow-hidden">
      {/* top bar */}
      <div className="flex items-center justify-between px-6 py-3 border-b border-[var(--d2b-border)] bg-[var(--d2b-bg-surface)] shrink-0">
        <span className="text-xs text-[var(--d2b-text-muted)]">início ≡ vendas margem de contribuição</span>
        <div className="flex items-center gap-2">
          <button className={BTN_OUTLINE}>configurar cálculo</button>
          <button className={BTN_OUTLINE}><MoreHorizontal size={14} /> mais ações</button>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto px-6 py-4">
        <h1 className="text-xl font-bold text-[var(--d2b-text-primary)] mb-4">Margem de contribuição</h1>

        {/* filters */}
        <div className="flex flex-wrap items-center gap-2 mb-5">
          {PERIOD_OPTIONS.map(p => (
            <button
              key={p}
              onClick={() => setPeriod(p)}
              className={[
                'flex items-center gap-1 px-3 py-1.5 rounded-full text-sm border transition-colors',
                period === p
                  ? 'bg-[#7C4DFF] text-white border-[#7C4DFF]'
                  : 'border-[var(--d2b-border-strong)] text-[var(--d2b-text-secondary)] hover:border-[#7C4DFF]',
              ].join(' ')}
            >
              {p === 'Últimos 7 dias' && <span className="text-xs">📅</span>}
              {p}
            </button>
          ))}
          <button
            onClick={() => setRentFilter(p => !p)}
            className={[
              'px-3 py-1.5 rounded-full text-sm border transition-colors',
              rentFilter
                ? 'bg-[#7C4DFF] text-white border-[#7C4DFF]'
                : 'border-[var(--d2b-border-strong)] text-[var(--d2b-text-secondary)]',
            ].join(' ')}
          >
            Mais rentáveis
          </button>
          <button className="flex items-center gap-1 text-sm text-[var(--d2b-text-muted)] hover:text-[var(--d2b-text-primary)]">
            <RefreshCw size={12} /> às 23:02
          </button>
        </div>

        {/* drill-down cards */}
        <div className="grid grid-cols-3 gap-3 mb-5">
          {[
            { icon: '📋', label: 'Canais de venda' },
            { icon: '🏷️', label: 'Produtos' },
            { icon: '📄', label: 'Pedidos de venda' },
          ].map(c => (
            <button
              key={c.label}
              className="flex items-center justify-between px-4 py-3 bg-[var(--d2b-bg-surface)] border border-[var(--d2b-border)] rounded-xl hover:border-[#7C4DFF] transition-colors text-sm font-medium text-[var(--d2b-text-primary)]"
            >
              <span className="flex items-center gap-2">
                <span>{c.icon}</span>
                {c.label}
              </span>
              <ChevronRight size={16} className="text-[var(--d2b-text-muted)]" />
            </button>
          ))}
        </div>

        {/* Visão geral */}
        <div className="bg-[var(--d2b-bg-surface)] border border-[var(--d2b-border)] rounded-xl p-4 mb-5">
          <div className="flex items-center justify-between mb-3">
            <h2 className="text-sm font-semibold text-[var(--d2b-text-primary)]">Visão geral</h2>
            <button className="text-sm text-[#7C4DFF] hover:underline">Glossário</button>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            {OVERVIEW_ITEMS.map(item => (
              <div
                key={item.label}
                className={`px-3 py-2 rounded-lg border ${item.color}`}
              >
                <p className="text-xs text-[var(--d2b-text-secondary)] mb-0.5">{item.label}</p>
                <p className="text-sm font-semibold text-[var(--d2b-text-primary)]">{item.value}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Margem chart */}
        <div className="bg-[var(--d2b-bg-surface)] border border-[var(--d2b-border)] rounded-xl p-4 mb-5">
          <h2 className="text-sm font-semibold text-[var(--d2b-text-primary)] mb-1">Margem de contribuição</h2>
          <div className="flex gap-6 text-sm mb-3">
            <div>
              <p className="text-xs text-[var(--d2b-text-secondary)]">valor total da margem de contribuição</p>
              <p className="font-semibold text-[var(--d2b-text-primary)]">R$ 0,00</p>
            </div>
            <div>
              <p className="text-xs text-[var(--d2b-text-secondary)]">índice total da margem</p>
              <p className="font-semibold text-[var(--d2b-text-primary)]">0,00 %</p>
            </div>
          </div>
          {/* chart area */}
          <div className="flex gap-4">
            <div className="flex flex-col justify-between text-xs text-[var(--d2b-text-muted)] text-right pr-2 h-[120px]">
              {['R$ 12', 'R$ 9', 'R$ 6', 'R$ 3', 'R$ 0'].map(l => <span key={l}>{l}</span>)}
            </div>
            <div className="flex-1 border-b border-l border-[var(--d2b-border)] relative h-[120px]">
              <svg className="w-full h-full" viewBox="0 0 600 120" preserveAspectRatio="none">
                <line x1="0" y1="120" x2="600" y2="120" stroke="#7C4DFF" strokeWidth="2" />
              </svg>
            </div>
          </div>
          <div className="flex justify-around pl-10 mt-1">
            {['Ter', 'Qua', 'Qui', 'Sex', 'Sáb', 'Dom', 'Seg', 'Ter'].map((d, i) => (
              <span key={`${d}-${i}`} className="text-xs text-[var(--d2b-text-muted)]">{d}</span>
            ))}
          </div>
          <div className="mt-2 flex items-center gap-2">
            <span className="inline-block w-5 h-0.5 bg-[#7C4DFF]" />
            <span className="text-xs text-[var(--d2b-text-secondary)]">valor total da margem de contribuição</span>
          </div>
        </div>

        {/* Canais de venda mini-table */}
        <div className="bg-[var(--d2b-bg-surface)] border border-[var(--d2b-border)] rounded-xl p-4 mb-5">
          <h2 className="text-sm font-semibold text-[var(--d2b-text-primary)] mb-3">Canais de venda</h2>
          <p className="text-sm text-[var(--d2b-text-muted)]">
            Não encontramos nenhum canal de venda para a combinação de filtros aplicados, por favor, tente mudá-los.
          </p>
          <button className="mt-3 flex items-center gap-1 text-sm text-[#7C4DFF] hover:underline">
            + detalhes
          </button>
        </div>

        {/* Produtos + Pedidos de venda side by side */}
        <div className="grid grid-cols-2 gap-4">
          {[
            {
              title: 'Produtos',
              headers: ['Descrição', 'Qtd. de ve...', 'Qtd. vendi...', 'Total fatur...', 'Índice'],
            },
            {
              title: 'Pedidos de venda',
              headers: ['Nº Pedido', 'Data', 'Qtd. de it...', 'Total fatur...', 'Índice'],
            },
          ].map(panel => (
            <div key={panel.title} className="bg-[var(--d2b-bg-surface)] border border-[var(--d2b-border)] rounded-xl overflow-hidden">
              <table className="w-full text-sm">
                <thead className="bg-[var(--d2b-bg-elevated)]">
                  <tr>
                    {panel.headers.map(h => (
                      <th key={h} className={TH}>{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  <tr>
                    <td colSpan={panel.headers.length} className="px-3 py-4 text-xs text-[var(--d2b-text-muted)] text-center">
                      Nenhum dado encontrado para os filtros aplicados.
                    </td>
                  </tr>
                </tbody>
              </table>
              <div className="border-t border-[var(--d2b-border)] px-3 py-2">
                <button className="text-sm text-[#7C4DFF] hover:underline">+ detalhes</button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
