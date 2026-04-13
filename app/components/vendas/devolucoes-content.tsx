'use client'

import { useState } from 'react'
import { Search, Calendar, ArrowLeft, Plus, X, MoreHorizontal } from 'lucide-react'

const TH = 'text-left px-3 py-3 text-xs font-semibold text-[var(--d2b-text-secondary)] uppercase tracking-wider whitespace-nowrap'
const TD = 'px-3 py-3 text-sm text-[var(--d2b-text-primary)] whitespace-nowrap'
const BTN_PRIMARY = 'flex items-center gap-2 px-4 py-2 rounded-full text-sm font-bold text-white bg-[#7C4DFF] hover:bg-[#5B21B6] transition-colors'
const BTN_OUTLINE = 'flex items-center gap-2 px-3 py-1.5 rounded-md text-sm font-medium border border-[var(--d2b-border-strong)] text-[var(--d2b-text-secondary)] hover:border-[#7C4DFF] hover:text-[var(--d2b-text-primary)] bg-transparent transition-colors'
const INP = 'w-full bg-[var(--d2b-bg-main)] border border-[var(--d2b-border-strong)] rounded-md px-3 py-2 text-sm text-[var(--d2b-text-primary)] placeholder:text-[var(--d2b-text-muted)] focus:outline-none focus:border-[#7C4DFF] transition-colors'
const INP_RO = 'w-full bg-[var(--d2b-bg-elevated)] border border-[var(--d2b-border)] rounded-md px-3 py-2 text-sm text-[var(--d2b-text-primary)]'
const LBL = 'block text-xs text-[var(--d2b-text-secondary)] mb-1'
const SEL = 'w-full bg-[var(--d2b-bg-main)] border border-[var(--d2b-border-strong)] rounded-md px-3 py-2 text-sm text-[var(--d2b-text-primary)] focus:outline-none focus:border-[#7C4DFF] transition-colors appearance-none'

type DevTab  = 'todas' | 'em_aberto' | 'em_andamento' | 'finalizadas'
type Tela    = 'lista' | 'nova' | 'detalhe'

const TABS_DEV: { id: DevTab; label: string; dot?: string }[] = [
  { id: 'todas',        label: 'todas' },
  { id: 'em_aberto',    label: 'em aberto',     dot: '#F59E0B' },
  { id: 'em_andamento', label: 'em andamento',  dot: '#3B82F6' },
  { id: 'finalizadas',  label: 'finalizadas',   dot: '#10B981' },
]

const MOCK_VENDAS = [
  { id: '2', identificador: 'Pedido 2', data: '07/04/2026', cliente: 'BS TECNOLOGIA LTDA', total: 'R$ 13,20' },
  { id: '1', identificador: 'Pedido 1', data: '07/04/2026', cliente: 'BS TECNOLOGIA LTDA', total: 'R$ 0,00'  },
]

export function DevolucoesContent() {
  const [tela, setTela]           = useState<Tela>('lista')
  const [tab, setTab]             = useState<DevTab>('todas')
  const [search, setSearch]       = useState('')
  const [showDrawer, setShowDrawer] = useState(false)
  const [selectedVenda, setSelectedVenda] = useState<typeof MOCK_VENDAS[0] | null>(null)
  const [drawerSearch, setDrawerSearch]   = useState('')
  const [devolParcial, setDevolParcial]   = useState(true)
  const [marcadores, setMarcadores]       = useState('teste')
  const [obs, setObs]                     = useState('teste')

  /* ── Form Nova Devolução ── */
  if (tela === 'nova') {
    return (
      <div className="flex flex-col h-full overflow-hidden">
        <div className="flex items-center justify-between px-6 py-3 border-b border-[var(--d2b-border)] bg-[var(--d2b-bg-surface)] shrink-0">
          <div className="flex items-center gap-4">
            <button onClick={() => setTela('lista')} className="flex items-center gap-1 text-sm text-[#7C4DFF] hover:underline">
              <ArrowLeft size={14} /> voltar
            </button>
            <span className="text-xs text-[var(--d2b-text-muted)]">início ≡ vendas devoluções de venda</span>
          </div>
        </div>

        <div className="flex-1 overflow-y-auto px-6 py-4 max-w-3xl mx-auto w-full">
          <h1 className="text-xl font-bold text-[var(--d2b-text-primary)] mb-1">Devolução de venda</h1>
          <p className="text-sm text-[var(--d2b-text-muted)] mb-5">Pedido 2</p>

          <div className="border border-[var(--d2b-border)] rounded-xl p-5 flex flex-col gap-5">
            {/* Basic fields */}
            <div className="grid grid-cols-4 gap-4">
              <div>
                <label className={LBL}>Depósito</label>
                <div className="relative">
                  <select className={SEL}><option>Geral</option></select>
                  <span className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-[var(--d2b-text-muted)]">▾</span>
                </div>
              </div>
              <div>
                <label className={LBL}>Data da venda</label>
                <input className={INP_RO} value="07/04/2026" readOnly />
              </div>
              <div>
                <label className={LBL}>Data da devolução</label>
                <div className="relative">
                  <input className={INP} placeholder="" />
                  <Calendar size={14} className="absolute right-3 top-1/2 -translate-y-1/2 text-[var(--d2b-text-muted)]" />
                </div>
              </div>
              <div>
                <label className={LBL}>Emitida por</label>
                <input className={INP_RO} readOnly />
              </div>
            </div>

            <div>
              <label className={LBL}>Cliente</label>
              <input className={INP_RO} value="BS TECNOLOGIA LTDA" readOnly />
              <button className="mt-1 text-xs text-[#7C4DFF] hover:underline">dados do cliente</button>
            </div>

            {/* Itens para devolução */}
            <div>
              <h3 className="text-sm font-semibold text-[var(--d2b-text-primary)] mb-3">Itens para devolução</h3>
              <div className="flex items-center gap-3 bg-[var(--d2b-bg-elevated)] rounded-lg p-3 mb-3">
                <label className="relative inline-flex items-center cursor-pointer">
                  <input
                    type="checkbox"
                    checked={devolParcial}
                    onChange={e => setDevolParcial(e.target.checked)}
                    className="sr-only peer"
                  />
                  <div className="w-10 h-5 bg-gray-200 rounded-full peer peer-checked:bg-[#7C4DFF] transition-colors" />
                  <div className="absolute left-0.5 top-0.5 w-4 h-4 bg-white rounded-full shadow transition-transform peer-checked:translate-x-5" />
                </label>
                <div>
                  <p className="text-sm font-medium text-[var(--d2b-text-primary)]">Devolução parcial</p>
                  <p className="text-xs text-[var(--d2b-text-secondary)]">Devolução de apenas uma parte dos produtos vendidos</p>
                </div>
              </div>
              <table className="w-full text-sm border border-[var(--d2b-border)] rounded-lg overflow-hidden">
                <thead className="bg-[var(--d2b-bg-elevated)]">
                  <tr>
                    <th className="text-left px-3 py-2 text-xs font-semibold text-[var(--d2b-text-secondary)]">Produto</th>
                    <th className="text-right px-3 py-2 text-xs font-semibold text-[var(--d2b-text-secondary)]">Qtde</th>
                    <th className="text-right px-3 py-2 text-xs font-semibold text-[var(--d2b-text-secondary)]">Preço un</th>
                    <th className="text-right px-3 py-2 text-xs font-semibold text-[var(--d2b-text-secondary)]">Total</th>
                  </tr>
                </thead>
                <tbody>
                  <tr className="border-t border-[var(--d2b-border)]">
                    <td className="px-3 py-2 text-[var(--d2b-text-primary)]">Teste</td>
                    <td className="px-3 py-2 text-right">1,00 UNIDAD</td>
                    <td className="px-3 py-2 text-right">15,00</td>
                    <td className="px-3 py-2 text-right">15,00</td>
                  </tr>
                </tbody>
              </table>
            </div>

            {/* Detalhes da venda */}
            <div>
              <h3 className="text-sm font-semibold text-[var(--d2b-text-primary)] mb-3">Detalhes da venda</h3>
              <div className="grid grid-cols-4 gap-3">
                {[
                  { label: 'Identificador no e-commerce', value: '' },
                  { label: 'Nº no canal de venda', value: '' },
                  { label: 'Frete pago pelo cliente', value: 'R$  0,00' },
                  { label: 'Frete pago pela empresa', value: 'R$  0,00' },
                  { label: 'Desconto', value: 'R$  0,00' },
                  { label: 'Despesas', value: 'R$  0,00' },
                  { label: 'Impostos', value: 'R$  0,00' },
                  { label: 'Total da venda', value: 'R$  13,20' },
                ].map(f => (
                  <div key={f.label}>
                    <label className={LBL}>{f.label}</label>
                    <input className={INP_RO} value={f.value} readOnly />
                  </div>
                ))}
              </div>
            </div>

            {/* Detalhes da devolução */}
            <div>
              <h3 className="text-sm font-semibold text-[var(--d2b-text-primary)] mb-2">Detalhes da devolução</h3>
              <button className="text-xs text-[#7C4DFF] hover:underline mb-3">recalcular descontos e acréscimos ⓘ</button>
              <div className="grid grid-cols-3 gap-3">
                {[
                  { label: 'Nº de itens', value: '1', ro: true },
                  { label: 'Soma das qtdes', value: '1,00', ro: true },
                  { label: 'Total produtos', value: 'R$  15,00', ro: true, highlight: true },
                  { label: 'Descontos', value: 'R$  0,00', ro: false },
                  { label: 'Acréscimos ⓘ', value: 'R$  0,00', ro: false },
                  { label: 'Impostos', value: 'R$  0,00', ro: false },
                  { label: 'Total a devolver', value: 'R$  15,00', ro: true, highlight: true },
                ].map(f => (
                  <div key={f.label}>
                    <label className={LBL}>{f.label}</label>
                    <input
                      className={f.highlight ? INP_RO + ' font-semibold text-[#7C4DFF]' : (f.ro ? INP_RO : INP)}
                      value={f.value}
                      readOnly={f.ro}
                    />
                  </div>
                ))}
              </div>
            </div>

            {/* Forma de devolução */}
            <div>
              <h3 className="text-sm font-semibold text-[var(--d2b-text-primary)] mb-3">Forma de devolução</h3>
              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className={LBL}>Forma de pagamento</label>
                  <div className="relative">
                    <select className={SEL} defaultValue="Dinheiro">
                      <option>Dinheiro</option><option>Pix</option><option>Cartão</option>
                    </select>
                    <span className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-[var(--d2b-text-muted)]">▾</span>
                  </div>
                </div>
                <div>
                  <label className={LBL}>Conta financeira</label>
                  <div className="relative">
                    <select className={SEL} defaultValue="Caixa">
                      <option>Caixa</option>
                    </select>
                    <span className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-[var(--d2b-text-muted)]">▾</span>
                  </div>
                </div>
                <div>
                  <label className={LBL}>Categoria</label>
                  <div className="relative">
                    <select className={SEL} defaultValue="Água, luz">
                      <option>Água, luz</option>
                    </select>
                    <span className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-[var(--d2b-text-muted)]">▾</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Forma de retorno */}
            <div>
              <h3 className="text-sm font-semibold text-[var(--d2b-text-primary)] mb-3">Forma de retorno</h3>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className={LBL}>Forma de envio (reversa)</label>
                  <div className="relative">
                    <select className={SEL} defaultValue="Correios">
                      <option>Correios</option><option>Transportadora</option>
                    </select>
                    <span className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-[var(--d2b-text-muted)]">▾</span>
                  </div>
                </div>
                <div>
                  <label className={LBL}>Forma de frete (reversa)</label>
                  <div className="relative">
                    <select className={SEL} defaultValue="Não definida">
                      <option>Não definida</option>
                    </select>
                    <span className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-[var(--d2b-text-muted)]">▾</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Marcadores */}
            <div>
              <label className={LBL}>Marcadores</label>
              <div className="flex flex-wrap items-center gap-2 p-2 border border-[var(--d2b-border-strong)] rounded-md bg-[var(--d2b-bg-main)] min-h-[38px]">
                {marcadores.split(',').filter(Boolean).map(m => (
                  <span key={m} className="flex items-center gap-1 px-2 py-0.5 rounded-full bg-[var(--d2b-bg-elevated)] border border-[var(--d2b-border)] text-xs text-[var(--d2b-text-primary)]">
                    <span className="w-2 h-2 rounded-full bg-[#7C4DFF] inline-block" />
                    {m.trim()}
                    <button onClick={() => setMarcadores('')} className="text-[var(--d2b-text-muted)] hover:text-red-400"><X size={10} /></button>
                  </span>
                ))}
                <input
                  className="flex-1 min-w-[120px] bg-transparent text-sm text-[var(--d2b-text-primary)] outline-none placeholder:text-[var(--d2b-text-muted)]"
                  placeholder="Separados por vírgula ou tab"
                  onKeyDown={e => {
                    if (['Enter', ',', 'Tab'].includes(e.key)) {
                      e.preventDefault()
                    }
                  }}
                />
              </div>
            </div>

            {/* Observações */}
            <div>
              <label className={LBL}>Observações Internas</label>
              <textarea className={INP + ' resize-none'} rows={4} value={obs} onChange={e => setObs(e.target.value)} />
            </div>
          </div>

          <div className="flex items-center gap-3 mt-6 pb-6">
            <button className={BTN_PRIMARY}>salvar</button>
            <button onClick={() => setTela('lista')} className="text-sm text-[var(--d2b-text-secondary)] hover:text-[var(--d2b-text-primary)]">cancelar</button>
          </div>
        </div>
      </div>
    )
  }

  /* ── Lista ── */
  return (
    <div className="flex flex-col h-full overflow-hidden">
      <div className="flex items-center justify-between px-6 py-3 border-b border-[var(--d2b-border)] bg-[var(--d2b-bg-surface)] shrink-0">
        <span className="text-xs text-[var(--d2b-text-muted)]">início ≡ vendas devoluções de venda</span>
        <div className="flex items-center gap-2">
          <button className={BTN_OUTLINE}><MoreHorizontal size={14} /> gerenciar vales-troca</button>
          <button onClick={() => setShowDrawer(true)} className={BTN_PRIMARY}>
            <Plus size={14} /> incluir devolução
          </button>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto px-6 py-4">
        <h1 className="text-xl font-bold text-[var(--d2b-text-primary)] mb-4">Devoluções de vendas</h1>

        {/* filters */}
        <div className="flex items-center gap-2 mb-4">
          <div className="relative flex-1 max-w-sm">
            <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-[var(--d2b-text-muted)]" />
            <input
              value={search}
              onChange={e => setSearch(e.target.value)}
              placeholder="Pesquise por cliente, pedido ou nota fiscal"
              className="w-full pl-8 pr-3 py-2 text-sm bg-[var(--d2b-bg-main)] border border-[var(--d2b-border-strong)] rounded-md text-[var(--d2b-text-primary)] placeholder:text-[var(--d2b-text-muted)] focus:outline-none focus:border-[#7C4DFF]"
            />
          </div>
          <button className={BTN_OUTLINE}><Calendar size={13} /> por período</button>
        </div>

        {/* tabs */}
        <div className="flex gap-1 border-b border-[var(--d2b-border)] mb-4">
          {TABS_DEV.map(t => (
            <button
              key={t.id}
              onClick={() => setTab(t.id)}
              className={[
                'flex items-center gap-1.5 px-3 py-2 text-sm font-medium border-b-2 transition-colors -mb-px',
                tab === t.id
                  ? 'border-[#7C4DFF] text-[#7C4DFF]'
                  : 'border-transparent text-[var(--d2b-text-secondary)] hover:text-[var(--d2b-text-primary)]',
              ].join(' ')}
            >
              {t.dot && <span className="w-2 h-2 rounded-full" style={{ backgroundColor: t.dot }} />}
              {t.label}
            </button>
          ))}
        </div>

        {/* empty state */}
        <div className="flex items-start gap-8 max-w-lg mx-auto mt-8">
          <div className="flex-1 bg-[var(--d2b-bg-surface)] border border-[var(--d2b-border)] rounded-xl p-6 text-center">
            <h3 className="text-base font-bold text-[var(--d2b-text-primary)] mb-2">Você não possui nenhum item cadastrado.</h3>
            <p className="text-sm text-[var(--d2b-text-secondary)] mb-4">Para inserir novos registros você pode clicar em incluir devolução.</p>
            <button onClick={() => setShowDrawer(true)} className={BTN_PRIMARY + ' mx-auto justify-center'}>
              incluir devolução
            </button>
          </div>
          <div className="text-6xl shrink-0 pt-4">🐱</div>
        </div>

        <p className="mt-8 text-sm text-[var(--d2b-text-muted)] text-center">
          Ficou com alguma dúvida?{' '}
          <button className="text-[#7C4DFF] hover:underline">Acesse a ajuda do ERP.</button>
        </p>
      </div>

      {/* Selecionar venda drawer */}
      {showDrawer && (
        <>
          <div className="fixed inset-0 bg-black/20 z-30" onClick={() => setShowDrawer(false)} />
          <aside className="fixed right-0 top-0 h-full w-[420px] bg-[var(--d2b-bg-surface)] border-l border-[var(--d2b-border)] z-40 flex flex-col shadow-xl">
            <div className="flex items-center justify-between px-5 py-4 border-b border-[var(--d2b-border)]">
              <h2 className="text-base font-bold text-[var(--d2b-text-primary)]">Selecione a venda para devolução</h2>
              <button onClick={() => setShowDrawer(false)} className="text-[var(--d2b-text-muted)] hover:text-[var(--d2b-text-primary)]">
                fechar <X size={14} className="inline-block" />
              </button>
            </div>

            <div className="px-5 py-3 border-b border-[var(--d2b-border)]">
              <div className="flex gap-2">
                <div className="relative flex-1">
                  <Search size={13} className="absolute left-3 top-1/2 -translate-y-1/2 text-[var(--d2b-text-muted)]" />
                  <input
                    value={drawerSearch}
                    onChange={e => setDrawerSearch(e.target.value)}
                    placeholder="Pesquise pelo cliente, nº do pedido ou chave de acesso"
                    className="w-full pl-8 pr-3 py-2 text-sm bg-[var(--d2b-bg-main)] border border-[var(--d2b-border-strong)] rounded-md text-[var(--d2b-text-primary)] placeholder:text-[var(--d2b-text-muted)] focus:outline-none focus:border-[#7C4DFF]"
                  />
                </div>
                <button className={BTN_OUTLINE + ' shrink-0'}>venda ▾</button>
              </div>
            </div>

            <div className="flex-1 overflow-y-auto">
              <table className="w-full">
                <thead className="bg-[var(--d2b-bg-elevated)] sticky top-0">
                  <tr>
                    <th className="w-8 px-3 py-2" />
                    <th className={TH}>Identificador</th>
                    <th className={TH}>Cliente</th>
                    <th className={TH}>Total</th>
                  </tr>
                </thead>
                <tbody>
                  {MOCK_VENDAS.filter(v =>
                    drawerSearch === '' ||
                    v.cliente.toLowerCase().includes(drawerSearch.toLowerCase()) ||
                    v.identificador.toLowerCase().includes(drawerSearch.toLowerCase())
                  ).map(v => (
                    <tr
                      key={v.id}
                      className="border-t border-[var(--d2b-border)] hover:bg-[var(--d2b-hover)] cursor-pointer transition-colors"
                      onClick={() => setSelectedVenda(v)}
                    >
                      <td className="px-3 py-3">
                        <input
                          type="radio"
                          name="venda-sel"
                          checked={selectedVenda?.id === v.id}
                          onChange={() => setSelectedVenda(v)}
                          className="accent-[#7C4DFF]"
                        />
                      </td>
                      <td className="px-3 py-3">
                        <p className="text-sm font-medium text-[var(--d2b-text-primary)]">{v.identificador}</p>
                        <p className="text-xs text-[var(--d2b-text-muted)]">{v.data}</p>
                      </td>
                      <td className={TD}>{v.cliente}</td>
                      <td className={TD}>{v.total}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <div className="border-t border-[var(--d2b-border)] px-5 py-4 flex items-center justify-end gap-2">
              <button onClick={() => setShowDrawer(false)} className="text-sm text-[var(--d2b-text-secondary)] hover:text-[var(--d2b-text-primary)] px-3 py-1.5">
                cancelar
              </button>
              <button
                disabled={!selectedVenda}
                onClick={() => { setShowDrawer(false); setTela('nova') }}
                className={BTN_PRIMARY + (!selectedVenda ? ' opacity-50 cursor-not-allowed' : '')}
              >
                selecionar
              </button>
            </div>
          </aside>
        </>
      )}
    </div>
  )
}
