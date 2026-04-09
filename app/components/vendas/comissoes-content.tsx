'use client'

import { useState } from 'react'
import { ArrowLeft, Printer, Share2, MoreHorizontal, Trash2 } from 'lucide-react'

const TH = 'text-left px-3 py-3 text-xs font-semibold text-[var(--d2b-text-secondary)] uppercase tracking-wider whitespace-nowrap'
const TD = 'px-3 py-3 text-sm text-[var(--d2b-text-primary)] whitespace-nowrap'
const BTN_PRIMARY = 'flex items-center gap-2 px-4 py-2 rounded-full text-sm font-bold text-white bg-[#7C4DFF] hover:bg-[#5B21B6] transition-colors'
const BTN_GHOST   = 'flex items-center gap-2 px-3 py-1.5 rounded-md text-sm text-[var(--d2b-text-secondary)] hover:bg-[var(--d2b-hover)] transition-colors'
const BTN_OUTLINE = 'flex items-center gap-2 px-3 py-1.5 rounded-md text-sm font-medium border border-[var(--d2b-border-strong)] text-[var(--d2b-text-secondary)] hover:border-[#7C4DFF] hover:text-[var(--d2b-text-primary)] bg-transparent transition-colors'

type Tela = 'lista' | 'detalhe'

const MOCK = {
  vendedor: 'JESSE',
  saldoAnt: 0,
  comissMes: 0,
  debDevol: 0,
  outCred: 0,
  outDeb: 0,
  pgtos: 45,
  comisPend: 0,
  saldo: -45,
}

const PAGAMENTOS = [
  { data: '07/04/2026', descricao: 'Pagamento de comissões', valor: 45.00 },
  { data: '07/04/2026', descricao: 'Pagamento de comissões', valor: 0.00  },
]

export function ComissoesContent() {
  const [tela, setTela]       = useState<Tela>('lista')
  const [showMais, setShowMais] = useState(false)

  // ── DETALHE ────────────────────────────────────────────────────────────────
  if (tela === 'detalhe') {
    return (
      <div className="flex flex-col h-full overflow-hidden">
        {/* top bar */}
        <div className="flex items-center justify-between px-6 py-3 border-b border-[var(--d2b-border)] bg-[var(--d2b-bg-surface)] shrink-0">
          <div className="flex items-center gap-4">
            <button onClick={() => setTela('lista')} className="flex items-center gap-1 text-sm text-[#7C4DFF] hover:underline">
              <ArrowLeft size={14} /> voltar
            </button>
            <span className="text-xs text-[var(--d2b-text-muted)]">início ≡ vendas  comissões</span>
          </div>
          <div className="flex items-center gap-2 relative">
            <button className={BTN_PRIMARY}><Printer size={14} /> imprimir</button>
            <div className="relative">
              <button onClick={() => setShowMais(p => !p)} className={BTN_OUTLINE}>
                mais ações <MoreHorizontal size={14} />
              </button>
              {showMais && (
                <>
                  <div className="fixed inset-0 z-20" onClick={() => setShowMais(false)} />
                  <div className="absolute right-0 top-full mt-1 w-52 bg-[var(--d2b-bg-surface)] border border-[var(--d2b-border)] rounded-xl shadow-lg z-30 py-1 overflow-hidden">
                    {['imprimir relatório','compartilhar','realizar pagamento','incluir lançamento'].map(item => (
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

        {/* body */}
        <div className="flex-1 overflow-y-auto px-6 py-4 max-w-4xl mx-auto w-full">
          <h1 className="text-xl font-bold text-[var(--d2b-text-primary)]">Comissões</h1>
          <p className="text-sm text-[var(--d2b-text-secondary)] mb-4">{MOCK.vendedor}</p>

          {/* filters */}
          <div className="flex items-center gap-2 mb-5">
            <button className="flex items-center gap-1.5 px-2.5 py-1 rounded-md text-xs font-medium border border-[var(--d2b-border-strong)] text-[var(--d2b-text-secondary)] hover:bg-[var(--d2b-hover)]">
              📅 Abril
            </button>
            <button className="flex items-center gap-1 text-xs text-[var(--d2b-text-muted)] hover:text-[var(--d2b-text-primary)]">
              🗙 limpar filtros
            </button>
          </div>

          {/* Pagamentos efetuados */}
          <div className="border border-[var(--d2b-border)] rounded-xl overflow-hidden mb-4">
            <div className="px-4 py-3 bg-[var(--d2b-bg-elevated)] border-b border-[var(--d2b-border)]">
              <h2 className="text-sm font-semibold text-[var(--d2b-text-primary)]">(-) Pagamentos efetuados</h2>
            </div>
            <table className="w-full">
              <thead className="bg-[var(--d2b-bg-elevated)]">
                <tr>
                  <th className={TH}>Data operação</th>
                  <th className={TH}>Descrição</th>
                  <th className="text-right px-3 py-3 text-xs font-semibold text-[var(--d2b-text-secondary)] uppercase tracking-wider">Valor pago</th>
                  <th className="w-10 px-3 py-3" />
                </tr>
              </thead>
              <tbody>
                {PAGAMENTOS.map((p, i) => (
                  <tr key={i} className="border-t border-[var(--d2b-border)] hover:bg-[var(--d2b-hover)] transition-colors">
                    <td className={TD}>{p.data}</td>
                    <td className={TD}>{p.descricao}</td>
                    <td className="px-3 py-3 text-sm text-right text-[var(--d2b-text-primary)]">{p.valor.toFixed(2).replace('.', ',')}</td>
                    <td className="px-3 py-3 text-center">
                      <button className="text-[var(--d2b-text-muted)] hover:text-red-500 transition-colors"><Trash2 size={13} /></button>
                    </td>
                  </tr>
                ))}
                <tr className="border-t border-[var(--d2b-border)] bg-[var(--d2b-bg-elevated)]">
                  <td className="px-3 py-2 text-xs text-[var(--d2b-text-secondary)] font-medium" colSpan={2}>
                    Total pago ({PAGAMENTOS.length})
                  </td>
                  <td className="px-3 py-2 text-sm text-right text-[var(--d2b-text-primary)] font-medium">
                    {PAGAMENTOS.reduce((s,p) => s + p.valor, 0).toFixed(2).replace('.', ',')}
                  </td>
                  <td />
                </tr>
              </tbody>
            </table>
          </div>

          {/* Resumo */}
          <div className="border border-[var(--d2b-border)] rounded-xl overflow-hidden">
            <div className="px-4 py-3 bg-[var(--d2b-bg-elevated)] border-b border-[var(--d2b-border)]">
              <h2 className="text-sm font-semibold text-[var(--d2b-text-primary)]">Resumo</h2>
            </div>
            <div className="divide-y divide-[var(--d2b-border)]">
              {[
                { label: 'Saldo anterior', value: '0,00' },
                { label: '(-) Pagamentos', value: '45,00' },
                { label: '(=) Saldo',      value: '-45,00', highlight: true },
              ].map(r => (
                <div key={r.label} className="flex items-center justify-between px-4 py-3">
                  <span className={`text-sm ${r.highlight ? 'font-semibold text-[var(--d2b-text-primary)]' : 'text-[var(--d2b-text-secondary)]'}`}>
                    {r.label}
                  </span>
                  <span className={`text-sm ${r.highlight ? 'font-semibold text-red-500' : 'text-[var(--d2b-text-primary)]'}`}>
                    {r.value}
                  </span>
                </div>
              ))}
            </div>
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
        <span className="text-xs text-[var(--d2b-text-muted)]">início ≡ vendas  comissões</span>
        <div className="flex items-center gap-2">
          <button className={BTN_GHOST}><Share2 size={14} /> compartilhar</button>
          <button className={BTN_PRIMARY}><Printer size={14} /> imprimir</button>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto flex flex-col min-h-0">
        <div className="px-6 pt-4 pb-0 shrink-0">
          <h1 className="text-xl font-bold text-[var(--d2b-text-primary)] mb-4">Comissões</h1>

          {/* filters */}
          <div className="flex items-center gap-2 mb-4">
            <button className="flex items-center gap-1.5 px-2.5 py-1 rounded-md text-xs font-medium border border-[var(--d2b-border-strong)] text-[var(--d2b-text-secondary)] hover:bg-[var(--d2b-hover)]">
              📅 Abril
            </button>
            <button className="flex items-center gap-1 text-xs text-[var(--d2b-text-muted)] hover:text-[var(--d2b-text-primary)]">
              🗙 limpar filtros
            </button>
          </div>
        </div>

        {/* table */}
        <div className="flex-1 overflow-auto px-6 pb-16">
          <div className="border border-[var(--d2b-border)] rounded-xl overflow-x-auto">
            <table className="w-full">
              <thead className="bg-[var(--d2b-bg-elevated)]">
                <tr>
                  <th className={TH}>Vendedor</th>
                  <th className={TH + ' text-right'}>Saldo ant. ⓘ</th>
                  <th className={TH + ' text-right'}>(+) Comis. mês ⓘ</th>
                  <th className={TH + ' text-right'}>(-) Déb. devoluções ⓘ</th>
                  <th className={TH + ' text-right'}>(+) Out. créditos ⓘ</th>
                  <th className={TH + ' text-right'}>(-) Out. débitos ⓘ</th>
                  <th className={TH + ' text-right'}>(-) Pgtos ⓘ</th>
                  <th className={TH + ' text-right'}>Comis. pend. ⓘ</th>
                  <th className={TH + ' text-right'}>(=) Saldo ⓘ</th>
                </tr>
              </thead>
              <tbody>
                <tr
                  className="border-t border-[var(--d2b-border)] hover:bg-[var(--d2b-hover)] cursor-pointer transition-colors"
                  onClick={() => setTela('detalhe')}
                >
                  <td className={TD + ' text-[#7C4DFF] font-medium hover:underline'}>{MOCK.vendedor}</td>
                  <td className="px-3 py-3 text-sm text-right text-[var(--d2b-text-primary)]">{MOCK.saldoAnt.toFixed(2).replace('.',',')}</td>
                  <td className="px-3 py-3 text-sm text-right text-[var(--d2b-text-primary)]">{MOCK.comissMes.toFixed(2).replace('.',',')}</td>
                  <td className="px-3 py-3 text-sm text-right text-[var(--d2b-text-primary)]">{MOCK.debDevol.toFixed(2).replace('.',',')}</td>
                  <td className="px-3 py-3 text-sm text-right text-[var(--d2b-text-primary)]">{MOCK.outCred.toFixed(2).replace('.',',')}</td>
                  <td className="px-3 py-3 text-sm text-right text-[var(--d2b-text-primary)]">{MOCK.outDeb.toFixed(2).replace('.',',')}</td>
                  <td className="px-3 py-3 text-sm text-right text-[var(--d2b-text-primary)]">{MOCK.pgtos.toFixed(2).replace('.',',')}</td>
                  <td className="px-3 py-3 text-sm text-right text-[var(--d2b-text-primary)]">{MOCK.comisPend.toFixed(2).replace('.',',')}</td>
                  <td className="px-3 py-3 text-sm text-right font-semibold text-red-500">{MOCK.saldo.toFixed(2).replace('.',',')}</td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>

        {/* footer summary */}
        <div className="border-t border-[var(--d2b-border)] bg-[var(--d2b-bg-surface)] px-6 py-3 shrink-0 overflow-x-auto">
          <div className="flex items-center justify-end gap-6 min-w-max">
            {[
              { label: 'vendedores',            value: '1'     },
              { label: 'saldo anterior',         value: '0,00'  },
              { label: 'comissões do mês',       value: '0,00'  },
              { label: 'débitos de devoluções',  value: '0,00'  },
              { label: 'outros créditos',        value: '0,00'  },
              { label: 'outros débitos',         value: '0,00'  },
              { label: 'pagamentos',             value: '45,00' },
              { label: 'comissões pendentes',    value: '0,00'  },
              { label: 'saldo',                  value: '-45,00', red: true },
            ].map(f => (
              <div key={f.label} className="text-right shrink-0">
                <p className={`text-sm font-bold leading-none ${f.red ? 'text-red-500' : 'text-[var(--d2b-text-primary)]'}`}>{f.value}</p>
                <p className="text-xs text-[var(--d2b-text-muted)] mt-0.5">{f.label}</p>
              </div>
            ))}
            <button className="text-[var(--d2b-text-muted)] hover:text-[var(--d2b-text-primary)] ml-2">↑</button>
          </div>
        </div>
      </div>
    </div>
  )
}
