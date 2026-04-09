'use client'

import { useState } from 'react'
import {
  Search, Filter, MoreHorizontal, Calendar, Mail, Printer, Trash2, X,
} from 'lucide-react'

// ─── Shared styles ────────────────────────────────────────────────────────────
const TH = 'text-left px-3 py-3 text-xs font-semibold text-[var(--d2b-text-secondary)] uppercase tracking-wider whitespace-nowrap'
const TD = 'px-3 py-3 text-sm text-[var(--d2b-text-primary)] whitespace-nowrap'
const BTN_PRIMARY = 'flex items-center gap-2 px-4 py-2 rounded-full text-sm font-bold text-white bg-[#7C4DFF] hover:bg-[#5B21B6] transition-colors'
const BTN_OUTLINE = 'flex items-center gap-2 px-3 py-1.5 rounded-md text-sm font-medium border border-[var(--d2b-border-strong)] text-[var(--d2b-text-secondary)] hover:border-[#7C4DFF] hover:text-[var(--d2b-text-primary)] bg-transparent transition-colors'
const BTN_GHOST = 'flex items-center gap-2 px-3 py-1.5 rounded-md text-sm text-[var(--d2b-text-secondary)] hover:bg-[var(--d2b-hover)] transition-colors'
const INP = 'w-full bg-[var(--d2b-bg-main)] border border-[var(--d2b-border-strong)] rounded-md px-3 py-2 text-sm text-[var(--d2b-text-primary)] placeholder:text-[var(--d2b-text-muted)] focus:outline-none focus:border-[#7C4DFF] transition-colors'

// ─── Types ────────────────────────────────────────────────────────────────────
type Cobranca = {
  id: string
  cliente: string
  fone: string
  contratos: number
  valorContratos: number
  vencimento: string
  integracoes: string
  selected: boolean
}

type PanelState = 'none' | 'gerar' | 'success'

const MOCK_COBRANCAS: Cobranca[] = [
  {
    id: '1',
    cliente: 'JESSE',
    fone: '',
    contratos: 1,
    valorContratos: 1500.00,
    vencimento: '22/04/2026',
    integracoes: 'pix',
    selected: false,
  },
]

const MESES = ['Janeiro', 'Fevereiro', 'Março', 'Abril', 'Maio', 'Junho', 'Julho', 'Agosto', 'Setembro', 'Outubro', 'Novembro', 'Dezembro']

// ═══════════════════════════════════════════════════════════════════════════
// CobrancasContent
// ═══════════════════════════════════════════════════════════════════════════
export function CobrancasContent() {
  const [search, setSearch] = useState('')
  const [mesSelecionado, setMesSelecionado] = useState('Abril')
  const [cobrancas, setCobrancas] = useState<Cobranca[]>([])
  const [panelState, setPanelState] = useState<PanelState>('none')
  const [maisAcoesOpen, setMaisAcoesOpen] = useState(false)
  const [mesPickerOpen, setMesPickerOpen] = useState(false)

  const toggleSelect = (id: string) => {
    setCobrancas(p => p.map(c => c.id === id ? { ...c, selected: !c.selected } : c))
  }

  const toggleSelectAll = () => {
    const allSelected = cobrancas.every(c => c.selected)
    setCobrancas(p => p.map(c => ({ ...c, selected: !allSelected })))
  }

  const selecionadas = cobrancas.filter(c => c.selected)
  const totalSelecionadas = selecionadas.reduce((s, c) => s + c.valorContratos, 0)
  const totalGeral = cobrancas.reduce((s, c) => s + c.valorContratos, 0)

  const filtered = cobrancas.filter(c =>
    search ? c.cliente.toLowerCase().includes(search.toLowerCase()) : true
  )

  const handleGerar = () => {
    // Simula geração de cobranças do período
    setCobrancas(MOCK_COBRANCAS)
    setPanelState('success')
  }

  return (
    <div className="flex h-full overflow-hidden bg-[var(--d2b-bg-main)] relative">
      {/* Main content */}
      <div className="flex flex-col flex-1 min-w-0 overflow-hidden">
        {/* Top bar */}
        <div className="flex items-center justify-between px-6 py-3 border-b border-[var(--d2b-border)] bg-[var(--d2b-bg-surface)] shrink-0">
          <span className="text-xs text-[var(--d2b-text-muted)]">
            início <span className="mx-1">≡</span> serviços <span className="mx-1">{'>'}</span>
            <span className="text-[var(--d2b-text-secondary)]">cobranças</span>
          </span>
          <div className="flex items-center gap-2">
            <button className={BTN_GHOST}><Mail size={14} /> enviar boletos do mês</button>
            <button onClick={() => { setPanelState('gerar'); setMaisAcoesOpen(false) }} className={BTN_PRIMARY}>
              gerar cobranças do período
            </button>
            <div className="relative">
              <button onClick={() => setMaisAcoesOpen(p => !p)} className={BTN_OUTLINE}>
                mais ações <MoreHorizontal size={14} />
              </button>
              {maisAcoesOpen && (
                <div className="absolute right-0 top-full mt-1 w-56 bg-[var(--d2b-bg-surface)] border border-[var(--d2b-border)] rounded-lg shadow-lg z-20 py-1">
                  <button onClick={() => setMaisAcoesOpen(false)} className="w-full text-left px-4 py-2 text-sm text-[var(--d2b-text-primary)] hover:bg-[var(--d2b-hover)] flex items-center gap-2">
                    <Mail size={13} /> enviar boletos deste mês por e-mail
                  </button>
                  <button onClick={() => setMaisAcoesOpen(false)} className="w-full text-left px-4 py-2 text-sm text-[var(--d2b-text-primary)] hover:bg-[var(--d2b-hover)] flex items-center gap-2">
                    <Trash2 size={13} /> excluir faturamento do mês
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Title + search */}
        <div className="px-6 pt-5 pb-3 shrink-0">
          <h1 className="text-xl font-bold text-[var(--d2b-text-primary)] mb-4">Cobranças de contratos de serviço</h1>
          <div className="flex items-center gap-2">
            <div className="relative flex-1 max-w-sm">
              <input className={INP + ' pr-9'} placeholder="Pesquise por cliente" value={search} onChange={e => setSearch(e.target.value)} />
              <Search size={14} className="absolute right-3 top-1/2 -translate-y-1/2 text-[var(--d2b-text-muted)]" />
            </div>
            {/* Month picker */}
            <div className="relative">
              <button
                onClick={() => setMesPickerOpen(p => !p)}
                className={BTN_OUTLINE}
              >
                <Calendar size={13} /> {mesSelecionado}
              </button>
              {mesPickerOpen && (
                <div className="absolute left-0 top-full mt-1 w-44 bg-[var(--d2b-bg-surface)] border border-[var(--d2b-border)] rounded-lg shadow-lg z-20 py-1 max-h-64 overflow-y-auto">
                  {MESES.map(m => (
                    <button
                      key={m}
                      onClick={() => { setMesSelecionado(m); setMesPickerOpen(false) }}
                      className={[
                        'w-full text-left px-4 py-2 text-sm hover:bg-[var(--d2b-hover)]',
                        m === mesSelecionado ? 'font-bold text-[#7C4DFF]' : 'text-[var(--d2b-text-primary)]',
                      ].join(' ')}
                    >
                      {m}
                    </button>
                  ))}
                </div>
              )}
            </div>
            <button className={BTN_OUTLINE}><Filter size={13} /> filtros</button>
          </div>
        </div>

        {/* Table / empty state */}
        <div className="flex-1 overflow-y-auto">
          {filtered.length === 0 ? (
            <div className="flex items-center justify-center h-full px-6">
              <div className="border border-[var(--d2b-border)] rounded-2xl p-10 max-w-md w-full flex flex-col items-center gap-4">
                <div>
                  <p className="text-base font-semibold text-[var(--d2b-text-primary)] text-center mb-2">
                    Sem cobranças geradas para o mês.
                  </p>
                  <p className="text-sm text-[var(--d2b-text-muted)] text-center">
                    Para gerar as cobranças você pode clicar em gerar cobranças do período.
                  </p>
                </div>
                <button onClick={() => setPanelState('gerar')} className={BTN_PRIMARY}>
                  gerar cobranças do período
                </button>
              </div>
            </div>
          ) : (
            <table className="w-full">
              <thead className="sticky top-0 bg-[var(--d2b-bg-surface)] border-b border-[var(--d2b-border)]">
                <tr>
                  <th className="px-3 py-3 w-8">
                    <input type="checkbox" className="rounded" checked={cobrancas.every(c => c.selected)} onChange={toggleSelectAll} />
                  </th>
                  <th className={TH}>Cliente</th>
                  <th className={TH}>Fone</th>
                  <th className={TH + ' text-right'}>Contratos</th>
                  <th className={TH}>Vencimento</th>
                  <th className={TH}>Integrações</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map(c => (
                  <tr
                    key={c.id}
                    className={[
                      'border-b border-[var(--d2b-border)] hover:bg-[var(--d2b-hover)] cursor-pointer',
                      c.selected ? 'bg-[var(--d2b-hover)]' : '',
                    ].join(' ')}
                    onClick={() => toggleSelect(c.id)}
                  >
                    <td className="px-3 py-3">
                      <input type="checkbox" className="rounded" checked={c.selected} onChange={() => toggleSelect(c.id)} onClick={e => e.stopPropagation()} />
                    </td>
                    <td className={TD}>{c.cliente}</td>
                    <td className={TD}>{c.fone || '–'}</td>
                    <td className={TD + ' text-right'}>
                      R$ {c.valorContratos.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                      <span className="text-[#7C4DFF] ml-1">({c.contratos})</span>
                    </td>
                    <td className={TD}>{c.vencimento}</td>
                    <td className="px-3 py-3">
                      {c.integracoes === 'pix' && (
                        <span className="inline-flex items-center justify-center w-6 h-6 rounded-full border border-[var(--d2b-border)] text-[10px] text-[var(--d2b-text-muted)]">©</span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>

        {/* Footer: selection toolbar OR summary */}
        {filtered.length > 0 && (
          selecionadas.length > 0 ? (
            <div className="shrink-0 border-t border-[var(--d2b-border)] bg-[var(--d2b-bg-surface)] px-6 py-2 flex items-center gap-4">
              <span className="text-xs font-bold text-[var(--d2b-text-primary)]">{String(selecionadas.length).padStart(2, '0')}</span>
              <button className="flex items-center gap-2 px-4 py-1.5 rounded-full text-sm font-medium text-white bg-[#7C4DFF] hover:bg-[#5B21B6] transition-colors">
                <Printer size={13} /> imprimir boletos
              </button>
              <button className="flex items-center gap-2 px-3 py-1.5 rounded-md text-sm text-red-500 hover:bg-[var(--d2b-hover)] transition-colors">
                <Trash2 size={13} /> excluir cobranças
              </button>
              <div className="ml-auto flex items-center gap-6 text-xs text-[var(--d2b-text-muted)]">
                <span>
                  <strong className="text-[var(--d2b-text-primary)]">
                    {totalSelecionadas.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                  </strong>{' '}
                  selecionadas (R$)
                </span>
                <span><strong className="text-[var(--d2b-text-primary)]">{selecionadas.length}</strong> cobranças</span>
                <span>
                  <strong className="text-[var(--d2b-text-primary)]">
                    {totalGeral.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                  </strong>{' '}
                  valor total (R$)
                </span>
              </div>
            </div>
          ) : (
            <div className="shrink-0 border-t border-[var(--d2b-border)] bg-[var(--d2b-bg-surface)] px-6 py-2 flex items-center justify-end gap-6 text-xs text-[var(--d2b-text-muted)]">
              <span><strong className="text-[var(--d2b-text-primary)]">{cobrancas.length}</strong> cobranças</span>
              <span>
                <strong className="text-[var(--d2b-text-primary)]">
                  {totalGeral.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                </strong>{' '}
                valor total (R$)
              </span>
            </div>
          )
        )}
      </div>

      {/* Slide-in panel: Gerar cobranças */}
      {panelState !== 'none' && (
        <div className="w-80 shrink-0 border-l border-[var(--d2b-border)] bg-[var(--d2b-bg-surface)] flex flex-col">
          <div className="flex items-center justify-between px-5 py-4 border-b border-[var(--d2b-border)]">
            <h3 className="text-sm font-semibold text-[var(--d2b-text-primary)]">Gerar cobranças do mês</h3>
            <button onClick={() => setPanelState('none')} className="text-[var(--d2b-text-muted)] hover:text-[var(--d2b-text-primary)]">
              <X size={16} />
            </button>
          </div>

          <div className="flex-1 px-5 py-6">
            {panelState === 'gerar' && (
              <>
                <p className="text-sm text-[var(--d2b-text-secondary)] mb-6">
                  A geração das cobranças do mês selecionado pode demorar. Clique no botão Gerar Cobranças para iniciar a geração das cobranças do mês.
                </p>
                <div className="flex items-center gap-3">
                  <button onClick={handleGerar} className={BTN_PRIMARY}>gerar cobranças</button>
                  <button onClick={() => setPanelState('none')} className={BTN_GHOST}>cancelar</button>
                </div>
              </>
            )}
            {panelState === 'success' && (
              <div className="flex flex-col gap-4">
                <div className="flex items-center gap-3 bg-green-50 border border-green-200 rounded-lg px-4 py-3">
                  <span className="w-6 h-6 rounded-full bg-green-500 flex items-center justify-center text-white text-xs font-bold shrink-0">✓</span>
                  <span className="text-sm text-green-700">As cobranças foram geradas com sucesso!</span>
                </div>
                <button onClick={() => setPanelState('none')} className={BTN_OUTLINE + ' w-fit'}>fechar</button>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  )
}
