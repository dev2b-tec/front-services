'use client'

import { useState } from 'react'
import { Eye, Plus, FileText } from 'lucide-react'

const BTN_PRIMARY = 'flex items-center gap-2 px-4 py-2 rounded-full text-sm font-bold text-white bg-[#7C4DFF] hover:bg-[#5B21B6] transition-colors'
const BTN_OUTLINE = 'flex items-center gap-2 px-3 py-1.5 rounded-md text-sm font-medium border border-[var(--d2b-border-strong)] text-[var(--d2b-text-secondary)] hover:border-[#7C4DFF] hover:text-[var(--d2b-text-primary)] bg-transparent transition-colors'

type NavCategory = 'geral' | 'caixa' | 'contas-pagar' | 'contas-receber'

const NAV_ITEMS: { id: NavCategory; label: string }[] = [
  { id: 'geral',           label: 'Geral'            },
  { id: 'caixa',           label: 'Caixa'            },
  { id: 'contas-pagar',    label: 'Contas a Pagar'   },
  { id: 'contas-receber',  label: 'Contas a Receber' },
]

const REPORT_SECTIONS = [
  {
    id: 'geral',
    title: 'Geral',
    reports: [
      { title: 'Balancete',       desc: 'Relatório e gráfico com as entradas e saídas do período.' },
      { title: 'DRE',             desc: 'Demonstrativo de Resultados do Exercício' },
      { title: 'Fluxo de Caixa',  desc: 'Relatório e gráfico da projeção das entradas e saídas futuras de acordo com as contas a pagar e receber.' },
    ],
  },
  {
    id: 'caixa',
    title: 'Caixa',
    reports: [
      { title: 'Entradas e Saídas por Categoria', desc: 'Relatório e gráfico das entradas e saídas agrupadas pela categoria de receita e despesa.' },
      { title: 'Entradas e Saídas por Cliente',   desc: 'Relatório das entradas e saídas agrupadas por cliente.' },
    ],
  },
  {
    id: 'contas-pagar',
    title: 'Contas a Pagar',
    reports: [
      { title: 'Relatório de Contas a Pagar', desc: 'Relatório de contas a pagar' },
    ],
  },
  {
    id: 'contas-receber',
    title: 'Contas a Receber',
    reports: [
      { title: 'Recebimentos', desc: '' },
    ],
  },
]

function Stepper() {
  return (
    <div className="shrink-0 bg-[var(--d2b-bg-elevated)] border-b border-[var(--d2b-border)] px-6 py-2 flex items-center gap-2 text-xs">
      <span className="text-[#7C4DFF] font-bold">✦ Etapa atual</span>
      <span className="text-[var(--d2b-text-secondary)]">Configure a emissão da nota fiscal</span>
      <div className="ml-auto flex items-center gap-3">
        <span className="text-[var(--d2b-text-muted)] font-semibold">1 de 4</span>
        <div className="flex gap-0.5">
          <div className="w-6 h-1.5 rounded-full bg-[#7C4DFF]" />
          <div className="w-6 h-1.5 rounded-full bg-[var(--d2b-border-strong)]" />
          <div className="w-6 h-1.5 rounded-full bg-[var(--d2b-border-strong)]" />
          <div className="w-6 h-1.5 rounded-full bg-[var(--d2b-border-strong)]" />
        </div>
        <button className="text-[#7C4DFF] hover:underline font-medium">acessar o guia</button>
      </div>
    </div>
  )
}

export function RelatoriosFinancasContent() {
  const [activeNav, setActiveNav] = useState<NavCategory>('caixa')
  const [showOlist, setShowOlist] = useState(true)

  const scrollToSection = (id: NavCategory) => {
    setActiveNav(id)
    const el = document.getElementById(`section-${id}`)
    el?.scrollIntoView({ behavior: 'smooth', block: 'start' })
  }

  return (
    <div className="flex flex-col h-full overflow-hidden bg-[var(--d2b-bg-main)]">

      {/* Top breadcrumb + action buttons */}
      <div className="shrink-0 bg-[var(--d2b-bg-surface)] border-b border-[var(--d2b-border)] px-6 py-2 flex items-center justify-between gap-3">
        <div className="flex items-center gap-1 text-xs text-[var(--d2b-text-muted)]">
          <span>início</span>
          <span className="mx-1">≡</span>
          <span>finanças</span>
          <span className="mx-1">{'>'}</span>
          <span className="text-[var(--d2b-text-secondary)] font-medium">relatórios</span>
        </div>
        <div className="flex items-center gap-2">
          <button className={BTN_OUTLINE}>
            <FileText size={14} />
            outros relatórios
          </button>
          <button className={BTN_PRIMARY}>
            <Plus size={14} />
            relatório personalizado
          </button>
        </div>
      </div>

      {/* Stepper */}
      <Stepper />

      {/* Body */}
      <div className="flex-1 overflow-y-auto px-6 py-6">

        {/* Title */}
        <h1 className="text-xl font-bold text-[var(--d2b-text-primary)] mb-1">Relatórios de Finanças</h1>
        <p className="text-sm text-[var(--d2b-text-muted)] mb-5">
          Gere e analise relatórios para acompanhar o desempenho de suas operações
        </p>

        {/* Custom reports promo banner */}
        <div className="flex items-center gap-4 bg-[var(--d2b-bg-surface)] border border-[var(--d2b-border)] rounded-xl px-4 py-3.5 mb-5">
          <div className="shrink-0 w-16 h-12 bg-[#e8e8f0] rounded-lg flex items-center justify-center">
            <span className="text-2xl">📊</span>
          </div>
          <p className="flex-1 text-sm text-[var(--d2b-text-secondary)] leading-relaxed">
            Adicione e ordene os dados do seu relatório para ter uma análise de finanças mais assertiva e eficiente para seu negócio
          </p>
          <button className={BTN_OUTLINE + ' shrink-0'}>
            <Plus size={14} />
            relatórios personalizados
          </button>
        </div>

        {/* Crédito da Olist banner */}
        {showOlist && (
          <div className="flex items-center justify-center gap-2 py-2 mb-5 text-sm flex-wrap">
            <span className="bg-emerald-500 text-white text-xs font-bold px-2.5 py-1 rounded-full">Crédito da Olist</span>
            <span className="text-[var(--d2b-text-secondary)]">Agora você pode</span>
            <span className="flex items-center gap-1 text-[var(--d2b-text-primary)] font-medium">
              🌀 antecipar recebíveis
            </span>
            <span className="text-[var(--d2b-text-secondary)]">com crédito pré-aprovado</span>
            <button onClick={() => setShowOlist(false)} className="text-[var(--d2b-text-muted)] hover:text-[var(--d2b-text-secondary)]">
              <Eye size={14} />
            </button>
          </div>
        )}

        {/* Two-column layout */}
        <div className="flex gap-6">

          {/* Left nav */}
          <div className="w-44 shrink-0">
            <nav className="flex flex-col gap-0.5">
              {NAV_ITEMS.map(item => (
                <button
                  key={item.id}
                  onClick={() => scrollToSection(item.id)}
                  className={[
                    'text-left px-3 py-2 rounded-md text-sm transition-colors',
                    activeNav === item.id
                      ? 'bg-[var(--d2b-hover)] text-[var(--d2b-text-primary)] font-semibold'
                      : 'text-[var(--d2b-text-secondary)] hover:bg-[var(--d2b-hover)]',
                  ].join(' ')}
                >
                  {item.label}
                </button>
              ))}
            </nav>
          </div>

          {/* Right report list */}
          <div className="flex-1 border border-[var(--d2b-border)] rounded-xl overflow-hidden">
            {REPORT_SECTIONS.map((section, si) => (
              <div key={section.id} id={`section-${section.id}`}>
                {/* Section header */}
                <div className={`px-4 py-3 ${si > 0 ? 'border-t border-[var(--d2b-border)]' : ''} bg-[var(--d2b-bg-surface)]`}>
                  <p className="text-sm font-semibold text-[var(--d2b-text-muted)]">{section.title}</p>
                </div>
                {/* Report rows */}
                {section.reports.map((report, ri) => (
                  <button
                    key={ri}
                    className="w-full text-left px-4 py-3.5 border-t border-[var(--d2b-border)] hover:bg-[var(--d2b-hover)] transition-colors"
                  >
                    <p className="text-sm font-semibold text-[#7C4DFF]">{report.title}</p>
                    {report.desc && (
                      <p className="text-xs text-[var(--d2b-text-muted)] mt-0.5 leading-relaxed">{report.desc}</p>
                    )}
                  </button>
                ))}
              </div>
            ))}
          </div>

        </div>
      </div>

    </div>
  )
}
