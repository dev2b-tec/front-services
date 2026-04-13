'use client'

import { useState } from 'react'
import { Plus, FileText } from 'lucide-react'

const BTN_PRIMARY = 'flex items-center gap-2 px-4 py-2 rounded-full text-sm font-bold text-white bg-[#7C4DFF] hover:bg-[#5B21B6] transition-colors'
const BTN_OUTLINE = 'flex items-center gap-2 px-3 py-1.5 rounded-md text-sm font-medium border border-[var(--d2b-border-strong)] text-[var(--d2b-text-secondary)] hover:border-[#7C4DFF] hover:text-[var(--d2b-text-primary)] bg-transparent transition-colors'

type Category = {
  id: string
  label: string
  reports: { title: string; description?: string }[]
}

const CATEGORIES: Category[] = [
  {
    id: 'geral',
    label: 'Geral',
    reports: [
      {
        title: 'Vendas',
        description:
          'Relatório que demonstra todas as vendas efetuadas em um período, tanto de pedidos, como notas fiscais. Permite agrupamentos e sub-agrupamentos por cliente, produto ou vendedor e o cálculo da lucratividade com base no custo ou última compra.',
      },
      {
        title: 'Relatório Financeiro de Vendas',
        description:
          'Relatório de vendas, com base em pedidos ou notas fiscais, que demonstra os custos financeiros envolvidos em uma transação de venda (taxas e tarifas), meio de pagamento e forma de pagamento.',
      },
      {
        title: 'Curva ABC',
        description:
          'Relatório que mostra os clientes ou produtos com maior importância ou impacto no faturamento, baseando-se em quantidades e valores',
      },
    ],
  },
  {
    id: 'crm',
    label: 'CRM',
    reports: [
      { title: 'Relatório CRM', description: 'Análise de funil e oportunidades de vendas.' },
    ],
  },
  {
    id: 'expedicao',
    label: 'Expedição',
    reports: [
      { title: 'Relatório de expedição', description: 'Relatório de expedições despachadas' },
    ],
  },
  {
    id: 'notas',
    label: 'Notas Fiscais',
    reports: [
      { title: 'Consulta de Itens das Notas Fiscais', description: 'Consulta detalhada de todos os itens emitidos nas notas fiscais.' },
      { title: 'Relatório de Notas Fiscais', description: 'Resumo e detalhamento das notas fiscais emitidas.' },
    ],
  },
  {
    id: 'pdv',
    label: 'PDV',
    reports: [
      { title: 'Relatório de PDV', description: 'Vendas realizadas pelo Ponto de Venda.' },
      { title: 'Fechamento de Caixa', description: 'Resumo do fechamento de caixa por turno.' },
    ],
  },
  {
    id: 'pedidos',
    label: 'Pedidos de Venda',
    reports: [
      { title: 'Relatório de Pedidos de Venda', description: 'Listagem e análise de pedidos de venda.' },
      { title: 'Relatório de Comissões', description: 'Comissões calculadas por vendedor e período.' },
    ],
  },
  {
    id: 'propostas',
    label: 'Propostas Comerciais',
    reports: [
      { title: 'Relatório de Propostas Comerciais', description: 'Análise de propostas emitidas, aceitas e recusadas.' },
    ],
  },
  {
    id: 'separacao',
    label: 'Separação',
    reports: [
      { title: 'Relatório de Separação', description: 'Status e histórico de separação de mercadorias.' },
    ],
  },
]

export function RelatoriosContent() {
  const [activeCategory, setActiveCategory] = useState<string>('geral')

  const category = CATEGORIES.find(c => c.id === activeCategory) ?? CATEGORIES[0]

  return (
    <div className="flex flex-col h-full overflow-hidden">
      {/* top bar */}
      <div className="flex items-center justify-between px-6 py-3 border-b border-[var(--d2b-border)] bg-[var(--d2b-bg-surface)] shrink-0">
        <span className="text-xs text-[var(--d2b-text-muted)]">início ≡ vendas relatórios</span>
        <div className="flex items-center gap-2">
          <button className={BTN_OUTLINE}><FileText size={14} /> outros relatórios</button>
          <button className={BTN_PRIMARY}><Plus size={14} /> relatório personalizado</button>
        </div>
      </div>

      <div className="flex-1 overflow-hidden flex flex-col">
        {/* page header */}
        <div className="px-6 py-4 shrink-0">
          <h1 className="text-xl font-bold text-[var(--d2b-text-primary)]">Relatórios de Vendas</h1>
          <p className="text-sm text-[var(--d2b-text-secondary)] mt-0.5">Gere e analise relatórios para acompanhar o desempenho de suas operações</p>
        </div>

        {/* CTA banner */}
        <div className="mx-6 mb-4 flex items-center gap-4 p-4 bg-[var(--d2b-bg-surface)] border border-[var(--d2b-border)] rounded-xl shrink-0">
          <div className="w-20 h-14 bg-gradient-to-br from-blue-100 to-purple-100 rounded-lg flex items-center justify-center text-2xl shrink-0">📊</div>
          <div className="flex-1">
            <p className="text-sm font-medium text-[var(--d2b-text-primary)]">
              Adicione e ordene os dados do seu relatório para ter uma análise de vendas mais assertiva e eficiente para seu negócio
            </p>
          </div>
          <button className={BTN_PRIMARY + ' shrink-0'}>
            <Plus size={14} /> relatórios personalizados
          </button>
        </div>

        {/* two-panel layout */}
        <div className="flex flex-1 gap-0 mx-6 mb-6 border border-[var(--d2b-border)] rounded-xl overflow-hidden min-h-0">
          {/* left category list */}
          <div className="w-[200px] shrink-0 border-r border-[var(--d2b-border)] bg-[var(--d2b-bg-surface)] overflow-y-auto">
            {CATEGORIES.map(c => (
              <button
                key={c.id}
                onClick={() => setActiveCategory(c.id)}
                className={[
                  'w-full text-left px-4 py-3 text-sm transition-colors',
                  activeCategory === c.id
                    ? 'bg-[var(--d2b-hover)] text-[#7C4DFF] font-semibold'
                    : 'text-[var(--d2b-text-secondary)] hover:bg-[var(--d2b-hover)] hover:text-[var(--d2b-text-primary)]',
                ].join(' ')}
              >
                {c.label}
              </button>
            ))}
          </div>

          {/* right report list */}
          <div className="flex-1 overflow-y-auto bg-[var(--d2b-bg-main)]">
            {/* category heading */}
            <div className="px-5 py-3 border-b border-[var(--d2b-border)]">
              <h2 className="text-sm font-semibold text-[var(--d2b-text-primary)]">{category.label}</h2>
            </div>
            <div className="divide-y divide-[var(--d2b-border)]">
              {category.reports.map(r => (
                <button
                  key={r.title}
                  className="w-full text-left px-5 py-4 hover:bg-[var(--d2b-hover)] transition-colors group"
                >
                  <p className="text-sm font-semibold text-[#7C4DFF] group-hover:underline mb-0.5">{r.title}</p>
                  {r.description && (
                    <p className="text-xs text-[var(--d2b-text-secondary)] leading-relaxed">{r.description}</p>
                  )}
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
