'use client'

import { useState } from 'react'
import { Plus, FileText, ChevronDown } from 'lucide-react'

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
        title: 'Serviços Prestados',
        description:
          'Relatório que demonstra todos os serviços prestados em um período, com agrupamentos por cliente, tipo de serviço ou prestador e análise de rentabilidade.',
      },
      {
        title: 'Resumo Financeiro de Serviços',
        description:
          'Visão consolidada dos valores faturados, impostos retidos e receita líquida gerada pelos serviços no período selecionado.',
      },
    ],
  },
  {
    id: 'contratos',
    label: 'Contratos',
    reports: [
      {
        title: 'Relatório de Contratos',
        description: 'Listagem e análise de contratos ativos, encerrados e a vencer, com resumo de valores e prazos.',
      },
      {
        title: 'Contratos a Vencer',
        description: 'Contratos com vencimento próximo para acompanhamento e renovação.',
      },
    ],
  },
  {
    id: 'ordens',
    label: 'Ordens de Serviço',
    reports: [
      {
        title: 'Relatório de Ordens de Serviço',
        description: 'Status e histórico de todas as ordens de serviço registradas no período.',
      },
      {
        title: 'Ordens por Técnico/Prestador',
        description: 'Análise de produtividade por prestador de serviço ou técnico responsável.',
      },
    ],
  },
  {
    id: 'notas',
    label: 'Notas de Serviço',
    reports: [
      {
        title: 'Relatório de NFSe Emitidas',
        description: 'Consulta detalhada de todas as notas fiscais de serviço emitidas no período.',
      },
      {
        title: 'Impostos sobre Serviços',
        description: 'Apuração de ISS, INSS, IR e outros impostos incidentes sobre os serviços prestados.',
      },
    ],
  },
  {
    id: 'cobranças',
    label: 'Cobranças',
    reports: [
      {
        title: 'Relatório de Cobranças',
        description: 'Análise de cobranças emitidas, recebidas e pendentes por período e cliente.',
      },
      {
        title: 'Inadimplência de Serviços',
        description: 'Clientes com cobranças em atraso referentes a serviços prestados.',
      },
    ],
  },
  {
    id: 'comissoes',
    label: 'Comissões',
    reports: [
      {
        title: 'Relatório de Comissões',
        description: 'Comissões calculadas por vendedor ou prestador no período selecionado.',
      },
    ],
  },
]

export function RelatoriosServicoContent() {
  const [activeCategory, setActiveCategory] = useState<string>('geral')

  const category = CATEGORIES.find(c => c.id === activeCategory) ?? CATEGORIES[0]

  return (
    <div className="flex flex-col h-full overflow-hidden">
      {/* top bar */}
      <div className="flex items-center justify-between px-6 py-3 border-b border-[var(--d2b-border)] bg-[var(--d2b-bg-surface)] shrink-0">
        <span className="text-xs text-[var(--d2b-text-muted)]">início ≡ serviços {'>'} relatórios</span>
        <div className="flex items-center gap-2">
          <button className={BTN_OUTLINE}><FileText size={14} /> outros relatórios</button>
          <button className={BTN_PRIMARY}><Plus size={14} /> relatório personalizado</button>
        </div>
      </div>

      <div className="flex-1 overflow-hidden flex flex-col">
        {/* page header */}
        <div className="px-6 py-4 shrink-0">
          <h1 className="text-xl font-bold text-[var(--d2b-text-primary)]">Relatórios de Serviços</h1>
          <p className="text-sm text-[var(--d2b-text-secondary)] mt-0.5">Gere e analise relatórios para acompanhar o desempenho das suas operações de serviço</p>
        </div>

        {/* CTA banner */}
        <div className="mx-6 mb-4 flex items-center gap-4 p-4 bg-[var(--d2b-bg-surface)] border border-[var(--d2b-border)] rounded-xl shrink-0">
          <div className="w-20 h-14 bg-gradient-to-br from-purple-100 to-blue-100 rounded-lg flex items-center justify-center text-2xl shrink-0">📋</div>
          <div className="flex-1">
            <p className="text-sm font-medium text-[var(--d2b-text-primary)]">
              Adicione e ordene os dados do seu relatório para ter uma análise de serviços mais assertiva e eficiente para seu negócio
            </p>
            <p className="text-xs text-[var(--d2b-text-muted)] mt-1">Configure filtros por período, cliente, prestador e tipo de serviço para relatórios personalizados.</p>
          </div>
          <button className={BTN_PRIMARY}>
            <Plus size={14} /> criar relatório
          </button>
        </div>

        {/* body: sidebar + list */}
        <div className="flex flex-1 overflow-hidden">
          {/* category sidebar */}
          <aside className="w-52 shrink-0 border-r border-[var(--d2b-border)] bg-[var(--d2b-bg-surface)] overflow-y-auto py-2">
            <p className="px-4 py-2 text-[10px] font-semibold text-[var(--d2b-text-muted)] uppercase tracking-wider">Categorias</p>
            {CATEGORIES.map(c => (
              <button
                key={c.id}
                onClick={() => setActiveCategory(c.id)}
                className={[
                  'w-full text-left px-4 py-2 text-sm transition-colors',
                  activeCategory === c.id
                    ? 'bg-[var(--d2b-hover)] text-[var(--d2b-text-primary)] font-medium'
                    : 'text-[var(--d2b-text-secondary)] hover:bg-[var(--d2b-hover)]',
                ].join(' ')}
              >
                {c.label}
              </button>
            ))}
          </aside>

          {/* report list */}
          <div className="flex-1 overflow-y-auto px-6 py-4">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-base font-semibold text-[var(--d2b-text-primary)]">{category.label}</h2>
              <div className="relative">
                <button className={BTN_OUTLINE}>
                  Período <ChevronDown size={13} />
                </button>
              </div>
            </div>

            <div className="space-y-3">
              {category.reports.map(r => (
                <div
                  key={r.title}
                  className="flex items-start gap-4 p-4 bg-[var(--d2b-bg-surface)] border border-[var(--d2b-border)] rounded-xl hover:border-[#7C4DFF] transition-colors group"
                >
                  <div className="w-10 h-10 shrink-0 rounded-lg bg-[var(--d2b-bg-elevated)] flex items-center justify-center">
                    <FileText size={18} className="text-[#7C4DFF]" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-semibold text-[var(--d2b-text-primary)]">{r.title}</p>
                    {r.description && (
                      <p className="text-xs text-[var(--d2b-text-secondary)] mt-0.5 leading-relaxed">{r.description}</p>
                    )}
                  </div>
                  <button className="opacity-0 group-hover:opacity-100 transition-opacity flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-medium bg-[#7C4DFF] text-white hover:bg-[#5B21B6]">
                    gerar
                  </button>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
