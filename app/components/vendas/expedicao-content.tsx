'use client'

import { useState } from 'react'
import { Search, Printer, Plus, MoreHorizontal, Calendar, Eye } from 'lucide-react'

const BTN_PRIMARY = 'flex items-center gap-2 px-4 py-2 rounded-full text-sm font-bold text-white bg-[#7C4DFF] hover:bg-[#5B21B6] transition-colors'
const BTN_GHOST   = 'flex items-center gap-2 px-3 py-1.5 rounded-md text-sm text-[var(--d2b-text-secondary)] hover:bg-[var(--d2b-hover)] transition-colors'
const BTN_OUTLINE = 'flex items-center gap-2 px-3 py-1.5 rounded-md text-sm font-medium border border-[var(--d2b-border-strong)] text-[var(--d2b-text-secondary)] hover:border-[#7C4DFF] hover:text-[var(--d2b-text-primary)] bg-transparent transition-colors'

type StatusTab = 'todas' | 'pendentes' | 'concluidas'

export function ExpedicaoContent() {
  const [search,    setSearch]    = useState('')
  const [statusTab, setStatusTab] = useState<StatusTab>('pendentes')
  const [showMais,  setShowMais]  = useState(false)

  return (
    <div className="flex flex-col h-full overflow-hidden">
      {/* correios alert banner */}
      <div className="px-6 py-2.5 bg-amber-50 border-b border-amber-200 shrink-0 text-xs text-amber-800">
        Os serviços dos correios ainda não foram configurados. Para configurar acesse as configurações das{' '}
        <button className="text-[#7C4DFF] hover:underline font-medium">Formas de Envio</button>.
      </div>

      {/* top bar */}
      <div className="flex items-center justify-between px-6 py-3 border-b border-[var(--d2b-border)] bg-[var(--d2b-bg-surface)] shrink-0">
        <span className="text-xs text-[var(--d2b-text-muted)]">início ≡ vendas  expedição</span>
        <div className="flex items-center gap-2 relative">
          <button className={BTN_GHOST}><Eye size={14} /> integrar com a Intelipost</button>
          <button className={BTN_GHOST}><Printer size={14} /> imprimir</button>
          <button className={BTN_PRIMARY}><Plus size={14} /> incluir expedição</button>
          <div className="relative">
            <button onClick={() => setShowMais(p => !p)} className={BTN_OUTLINE}>
              mais ações <MoreHorizontal size={14} />
            </button>
            {showMais && (
              <>
                <div className="fixed inset-0 z-20" onClick={() => setShowMais(false)} />
                <div className="absolute right-0 top-full mt-1 w-48 bg-[var(--d2b-bg-surface)] border border-[var(--d2b-border)] rounded-xl shadow-lg z-30 py-1 overflow-hidden">
                  {['exportar','configurações de expedição'].map(item => (
                    <button key={item} className="w-full text-left px-4 py-2 text-sm text-[var(--d2b-text-primary)] hover:bg-[var(--d2b-hover)] capitalize transition-colors">
                      {item}
                    </button>
                  ))}
                </div>
              </>
            )}
          </div>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto flex flex-col min-h-0">
        <div className="px-6 pt-4 shrink-0">
          <h1 className="text-xl font-bold text-[var(--d2b-text-primary)] mb-4">Expedição</h1>

          {/* filters */}
          <div className="flex items-center gap-2 mb-4 flex-wrap">
            <div className="relative flex-1 min-w-[240px] max-w-sm">
              <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-[var(--d2b-text-muted)]" />
              <input
                value={search}
                onChange={e => setSearch(e.target.value)}
                placeholder="Pesquise por nº, pedido, nota fiscal ou destinatário"
                className="w-full pl-8 pr-3 py-2 text-sm bg-[var(--d2b-bg-main)] border border-[var(--d2b-border-strong)] rounded-md text-[var(--d2b-text-primary)] placeholder:text-[var(--d2b-text-muted)] focus:outline-none focus:border-[#7C4DFF]"
              />
            </div>
            <button className={BTN_OUTLINE}><Eye size={13} /> Agrupamentos</button>
            <button className={BTN_OUTLINE}>por forma de envio</button>
            <button className={BTN_OUTLINE}><Calendar size={13} /> Abril</button>
            <button className="text-xs text-[var(--d2b-text-muted)] hover:text-[var(--d2b-text-primary)]">🗙 limpar filtros</button>
          </div>

          {/* tabs */}
          <div className="flex gap-0 border-b border-[var(--d2b-border)]">
            {(['todas','pendentes','concluidas'] as StatusTab[]).map(t => (
              <button
                key={t}
                onClick={() => setStatusTab(t)}
                className={[
                  'px-4 py-2.5 text-sm font-medium border-b-2 -mb-px transition-colors',
                  statusTab === t
                    ? 'border-[#7C4DFF] text-[#7C4DFF]'
                    : 'border-transparent text-[var(--d2b-text-secondary)] hover:text-[var(--d2b-text-primary)]',
                ].join(' ')}
              >
                {t === 'concluidas' ? 'concluídas' : t}
              </button>
            ))}
          </div>
        </div>

        {/* empty state */}
        <div className="flex-1 flex items-center justify-center px-6 py-10">
          <div className="border-2 border-orange-300 rounded-xl p-8 max-w-sm w-full text-center bg-orange-50/30">
            <div className="flex justify-end mb-2">
              <span className="text-4xl">🐱</span>
            </div>
            <h3 className="text-base font-bold text-[var(--d2b-text-primary)] mb-2">
              Sua pesquisa não retornou resultados.
            </h3>
            <p className="text-sm text-[var(--d2b-text-secondary)] mb-5">
              Tente outras opções de pesquisa, situações ou remova os filtros.
            </p>
            <div className="flex items-center justify-center gap-3">
              <button className={BTN_PRIMARY} onClick={() => setSearch('')}>alterar pesquisa</button>
              <button
                className="text-sm text-[var(--d2b-text-secondary)] hover:text-[var(--d2b-text-primary)]"
                onClick={() => { setSearch(''); setStatusTab('todas') }}
              >
                limpar filtros
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
