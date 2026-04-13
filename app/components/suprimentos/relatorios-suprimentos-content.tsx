'use client'

import { useState } from 'react'
import { Plus, FileOutput } from 'lucide-react'

// ─── Shared styles ──────────────────────────────────────────────────────────
const BTN_PRIMARY =
  'flex items-center gap-2 px-4 py-2.5 rounded-full text-sm font-bold text-white bg-[#7C4DFF] hover:bg-[#5B21B6] transition-colors'

const BTN_OUTLINE =
  'flex items-center gap-2 px-4 py-2 rounded-md text-sm font-medium border border-[var(--d2b-border-strong)] ' +
  'text-[var(--d2b-text-secondary)] hover:border-[#7C4DFF] hover:text-[var(--d2b-text-primary)] bg-transparent transition-colors'

// ─── Report Catalogue ────────────────────────────────────────────────────────
const CATALOGUE: Record<string, { title: string; desc?: string }[]> = {
  Geral: [
    {
      title: 'Relatório de Estoque Multi Empresas',
      desc: 'Apresenta os saldos em estoque dos itens agrupados por empresa.',
    },
  ],
  'Controle de Estoques': [
    {
      title: 'Entradas e Saídas de Estoque',
      desc: 'Este relatório mostra todas as entradas e saídas realizadas em um período. Demonstra o fluxo de movimentação do estoque e os saldos no período.',
    },
    {
      title: 'Saldos em Estoque',
      desc: 'Apresenta os saldos em estoque dos itens em uma data qualquer.',
    },
    {
      title: 'Produtos com Maior Circulação',
      desc: 'Relação dos itens que mais movimentaram em certo período e a sua participação percentual com totais por quantidade e valor.',
    },
    {
      title: 'Produtos sem Movimentação',
      desc: 'Relaciona os produtos que não tiveram nenhuma movimentação de saída de estoque no periodo.',
    },
    {
      title: 'Produtos Abaixo do Estoque Mínimo',
      desc: 'Relação dos produtos que estão abaixo do estoque mínimo.',
    },
    {
      title: 'Visão Financeira do Estoque',
      desc: 'Valor total dos produtos em estoque pelo preço de última compra e preço de venda.',
    },
    {
      title: 'Movimentação de um Produto',
      desc: 'Relatório e gráfico de movimentação de estoque de um produto em determinado período.',
    },
  ],
  'Notas de Entrada': [
    { title: 'Notas de Entrada por Fornecedor', desc: 'Relaciona as notas de entrada agrupadas por fornecedor.' },
    { title: 'Notas de Entrada por Produto',    desc: 'Relaciona as notas de entrada agrupadas por produto.'    },
  ],
  'Ordens de Compra': [
    { title: 'Ordens de Compra por Fornecedor', desc: 'Relaciona as ordens de compra agrupadas por fornecedor.' },
    { title: 'Resumo de Ordens de Compra',      desc: 'Resume o status e valores das ordens de compra.'        },
  ],
  'Serviços Tomados': [
    { title: 'Serviços Tomados por Período',    desc: 'Relaciona todos os serviços tomados em um período informado.' },
    { title: 'Serviços por Fornecedor',         desc: 'Agrupa os serviços tomados por fornecedor.'                  },
  ],
}

const CATEGORIES = Object.keys(CATALOGUE)

// ═══════════════════════════════════════════════════════════════════════════
// EXPORT
// ═══════════════════════════════════════════════════════════════════════════
export function RelatoriosSuprimentosContent() {
  const [activeCategory, setActiveCategory] = useState(CATEGORIES[0])
  const reports = CATALOGUE[activeCategory] ?? []

  return (
    <div className="flex flex-col h-full">
      {/* Top bar */}
      <div className="flex items-center justify-between gap-3 px-8 pt-6 pb-3 flex-wrap">
        <div className="text-xs text-[var(--d2b-text-muted)]">início ≡ suprimentos relatórios</div>
        <div className="flex items-center gap-2">
          <button className={BTN_OUTLINE}>
            <FileOutput size={13} />
            outros relatórios
          </button>
          <button className={BTN_PRIMARY}>
            <Plus size={13} />
            relatório personalizado
          </button>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto px-8 pb-8">
        {/* Hero banner */}
        <div className="flex items-center gap-6 p-6 rounded-2xl border border-[var(--d2b-border)] bg-[var(--d2b-bg-elevated)] mb-6">
          {/* Illustration placeholder */}
          <div className="w-24 h-16 rounded-xl bg-[var(--d2b-bg-main)] border border-[var(--d2b-border)] flex items-center justify-center shrink-0">
            <svg width="40" height="32" viewBox="0 0 40 32" fill="none">
              <rect x="2" y="6" width="16" height="20" rx="2" fill="#7C4DFF" opacity="0.2" stroke="#7C4DFF" strokeWidth="1.2"/>
              <rect x="12" y="2" width="16" height="20" rx="2" fill="#7C4DFF" opacity="0.4" stroke="#7C4DFF" strokeWidth="1.2"/>
              <rect x="22" y="8" width="16" height="18" rx="2" fill="#7C4DFF" opacity="0.6" stroke="#7C4DFF" strokeWidth="1.2"/>
              <path d="M6 16h8M16 12h8M26 18h8" stroke="#7C4DFF" strokeWidth="1.5" strokeLinecap="round"/>
            </svg>
          </div>
          <div className="flex-1">
            <p className="text-sm font-semibold text-[var(--d2b-text-primary)] mb-0.5">
              Adicione e ordene os dados do seu relatório para ter uma análise de suprimentos mais assertiva e eficiente para seu negócio
            </p>
          </div>
          <button className={BTN_PRIMARY + ' shrink-0'}>
            <Plus size={13} />
            relatórios personalizados
          </button>
        </div>

        {/* Two-column layout: categories + reports */}
        <div className="flex gap-6">
          {/* Category nav */}
          <nav className="w-52 shrink-0 flex flex-col gap-0.5">
            {CATEGORIES.map(cat => (
              <button
                key={cat}
                onClick={() => setActiveCategory(cat)}
                className={[
                  'text-left px-4 py-2.5 rounded-xl text-sm font-medium transition-colors',
                  activeCategory === cat
                    ? 'bg-[var(--d2b-hover)] text-[#7C4DFF]'
                    : 'text-[var(--d2b-text-secondary)] hover:bg-[var(--d2b-hover)] hover:text-[var(--d2b-text-primary)]',
                ].join(' ')}
              >
                {cat}
              </button>
            ))}
          </nav>

          {/* Reports list */}
          <div className="flex-1 min-w-0">
            {/* Section header */}
            {activeCategory !== CATEGORIES[0] && (
              <p className="text-xs font-semibold text-[var(--d2b-text-muted)] uppercase tracking-wider mb-3 px-1">
                {activeCategory}
              </p>
            )}

            {/* First category gets a "Geral" group header */}
            {activeCategory === CATEGORIES[0] && (
              <p className="text-sm font-semibold text-[var(--d2b-text-primary)] mb-3 px-1">Geral</p>
            )}

            {reports.map((r, i) => (
              <div
                key={i}
                className="border-b border-[var(--d2b-border)] py-4 px-1 last:border-0 cursor-pointer hover:bg-[var(--d2b-hover)] rounded-lg transition-colors px-3"
              >
                <p className="text-sm font-medium text-[#7C4DFF] hover:text-[#5B21B6] transition-colors mb-0.5">{r.title}</p>
                {r.desc && (
                  <p className="text-xs text-[var(--d2b-text-secondary)] leading-relaxed">{r.desc}</p>
                )}
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}
