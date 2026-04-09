'use client'

import { useState } from 'react'
import {
  Search, Calendar, Package, Truck, MoreHorizontal,
  ArrowLeft, Printer, CheckCircle, RefreshCw,
} from 'lucide-react'

const TH = 'text-left px-3 py-3 text-xs font-semibold text-[var(--d2b-text-secondary)] uppercase tracking-wider whitespace-nowrap'
const TD = 'px-3 py-3 text-sm text-[var(--d2b-text-primary)] whitespace-nowrap'
const BTN_PRIMARY = 'flex items-center gap-2 px-4 py-2 rounded-full text-sm font-bold text-white bg-[#7C4DFF] hover:bg-[#5B21B6] transition-colors'
const BTN_OUTLINE = 'flex items-center gap-2 px-3 py-1.5 rounded-md text-sm font-medium border border-[var(--d2b-border-strong)] text-[var(--d2b-text-secondary)] hover:border-[#7C4DFF] hover:text-[var(--d2b-text-primary)] bg-transparent transition-colors'
const BTN_GHOST  = 'flex items-center gap-2 px-3 py-1.5 rounded-md text-sm text-[var(--d2b-text-secondary)] hover:bg-[var(--d2b-hover)] transition-colors'

type Tela = 'lista' | 'separar' | 'embalagem'
type ListaTab = 'aguardando' | 'em_separacao' | 'separadas' | 'embaladas'

const LISTA_TABS: { id: ListaTab; label: string; count?: number }[] = [
  { id: 'aguardando',    label: 'aguardando separação' },
  { id: 'em_separacao',  label: 'em separação', count: 1 },
  { id: 'separadas',     label: 'separadas'    },
  { id: 'embaladas',     label: 'embaladas checkout' },
]

const MOCK_ROWS = [
  {
    id: 'nota-000001',
    identificacao: 'Nota 000001',
    destinatario: 'BS TECNOLOGIA LTDA',
    uf: 'PE',
    cidade: 'Jaboatão dos Guararapes',
    envio: 'Não definida',
    dataPedido: '07/04/2026',
    separacaoPct: '0%',
    dataEntrega: '-',
    prazoDespacho: '-',
    marcadores: '-',
    integracoes: '-',
  },
]

export function SeparacaoContent() {
  const [tela, setTela]             = useState<Tela>('lista')
  const [listaTab, setListaTab]     = useState<ListaTab>('aguardando')
  const [showEmbalag, setShowEmbalag] = useState(false)
  const [embalagTipo, setEmbalagTipo] = useState<'pedido' | 'produto'>('produto')
  const [sepTab, setSepTab]         = useState<'produtos' | 'pedidos'>('produtos')
  const [search, setSearch]         = useState('')

  /* ── Embalagem detail ── */
  if (tela === 'embalagem') {
    return (
      <div className="flex flex-col h-full overflow-hidden">
        {/* top bar */}
        <div className="flex items-center justify-between px-6 py-3 border-b border-[var(--d2b-border)] bg-[var(--d2b-bg-surface)] shrink-0">
          <div className="flex items-center gap-4">
            <button onClick={() => setTela('lista')} className="flex items-center gap-1 text-sm text-[#7C4DFF] hover:underline">
              <ArrowLeft size={14} /> voltar
            </button>
            <span className="text-xs text-[var(--d2b-text-muted)]">início ≡ vendas separação</span>
          </div>
          <div className="flex items-center gap-2">
            <button className={BTN_GHOST}><RefreshCw size={14} /> reiniciar progresso</button>
            <button className={BTN_GHOST}><CheckCircle size={14} /> salvar para depois</button>
            <button className={BTN_GHOST}><MoreHorizontal size={14} /> mais ações</button>
          </div>
        </div>

        {/* alert */}
        <div className="mx-6 mt-4 px-4 py-3 bg-green-50 border border-green-300 rounded-lg text-sm text-green-800 flex items-center gap-2 shrink-0">
          <CheckCircle size={16} className="text-green-600 shrink-0" />
          Embalagem de produtos concluída.{' '}
          <button onClick={() => setTela('lista')} className="text-[#7C4DFF] hover:underline ml-1">
            voltar para a listagem
          </button>
        </div>

        {/* body */}
        <div className="flex flex-1 gap-4 px-6 py-4 overflow-hidden">
          {/* left panel */}
          <div className="w-[280px] shrink-0 bg-[var(--d2b-bg-surface)] border border-[var(--d2b-border)] rounded-xl p-4">
            <p className="text-xs text-[var(--d2b-text-muted)] mb-1">Último item lido</p>
            <p className="text-sm font-semibold text-[var(--d2b-text-primary)]">Teste</p>
          </div>

          {/* right panel */}
          <div className="flex-1 bg-[var(--d2b-bg-surface)] border border-[var(--d2b-border)] rounded-xl overflow-hidden">
            <p className="px-4 py-3 text-sm font-semibold border-b border-[var(--d2b-border)] text-[var(--d2b-text-primary)]">
              Pedidos e notas fiscais
            </p>
            <table className="w-full">
              <thead className="bg-[var(--d2b-bg-elevated)]">
                <tr>
                  <th className={TH}>Identificador</th>
                  <th className={TH}>Cliente</th>
                  <th className={TH}>Itens</th>
                </tr>
              </thead>
              <tbody>
                <tr className="border-b border-[var(--d2b-border)]">
                  <td className={TD}>
                    <div>Nota 000002</div>
                    <div className="text-xs text-[var(--d2b-text-muted)]">Pedido 2</div>
                  </td>
                  <td className={TD}>BS TECNOLOGIA LTDA</td>
                  <td className={TD}>
                    <span className="inline-flex items-center gap-1">
                      <span className="w-2.5 h-2.5 rounded-full bg-green-500" />
                      1/1
                    </span>
                  </td>
                </tr>
                <tr className="bg-[var(--d2b-bg-elevated)]">
                  <td colSpan={3} className="px-4 py-3">
                    <div className="flex items-center gap-4 text-sm">
                      <div className="flex items-center gap-2">
                        <span className="text-[var(--d2b-text-secondary)]">Quantidade</span>
                        <span className="flex items-center gap-1 border border-[var(--d2b-border-strong)] rounded px-2 py-0.5 text-xs">
                          <button className="text-[var(--d2b-text-muted)]">−</button>
                          <span className="mx-1 font-semibold">1</span>
                          <span className="text-[var(--d2b-text-muted)] mx-1">/</span>
                          <span>1</span>
                          <button className="text-[var(--d2b-text-muted)]">+</button>
                        </span>
                      </div>
                      <div><span className="text-[var(--d2b-text-secondary)]">Descrição:</span> Teste</div>
                      <div><span className="text-[var(--d2b-text-secondary)]">Código SKU</span></div>
                    </div>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>

        {/* footer */}
        <div className="border-t border-[var(--d2b-border)] bg-[var(--d2b-bg-surface)] px-6 py-3 shrink-0">
          <div className="flex items-center justify-between">
            <p className="text-sm text-[var(--d2b-text-secondary)]">
              Embalagem de produtos da nota <strong>000002</strong> concluída
            </p>
            <div className="flex items-center gap-2">
              <button className={BTN_OUTLINE}><Printer size={14} /> imprimir etiquetas de volumes <kbd className="ml-1 text-xs opacity-60">CTRL+O</kbd></button>
              <button className={BTN_OUTLINE}><RefreshCw size={14} /> atualizar volumes <kbd className="ml-1 text-xs opacity-60">CTRL+A</kbd></button>
            </div>
          </div>
        </div>
      </div>
    )
  }

  /* ── Separar detail ── */
  if (tela === 'separar') {
    return (
      <div className="flex flex-col h-full overflow-hidden">
        {/* top bar */}
        <div className="flex items-center justify-between px-6 py-3 border-b border-[var(--d2b-border)] bg-[var(--d2b-bg-surface)] shrink-0">
          <div className="flex items-center gap-4">
            <button onClick={() => setTela('lista')} className="flex items-center gap-1 text-sm text-[#7C4DFF] hover:underline">
              <ArrowLeft size={14} /> voltar
            </button>
            <span className="text-xs text-[var(--d2b-text-muted)]">início ≡ vendas separação</span>
          </div>
        </div>

        <div className="flex-1 overflow-y-auto px-6 py-4">
          <h1 className="text-xl font-bold text-[var(--d2b-text-primary)] mb-4">Separação de mercadorias</h1>

          {/* tabs */}
          <div className="flex gap-1 mb-4 border-b border-[var(--d2b-border)]">
            {(['produtos', 'pedidos'] as const).map(t => (
              <button
                key={t}
                onClick={() => setSepTab(t)}
                className={[
                  'px-4 py-2 text-sm font-medium border-b-2 transition-colors -mb-px',
                  sepTab === t
                    ? 'border-[#7C4DFF] text-[#7C4DFF]'
                    : 'border-transparent text-[var(--d2b-text-secondary)] hover:text-[var(--d2b-text-primary)]',
                ].join(' ')}
              >
                {t === 'produtos' ? 'produtos' : 'pedidos e notas'}
              </button>
            ))}
            <span className="ml-4 self-center px-3 py-1 rounded-full bg-[var(--d2b-bg-elevated)] border border-[var(--d2b-border)] text-xs text-[var(--d2b-text-secondary)]">
              visualização padrão
            </span>
          </div>

          <div className="border border-[var(--d2b-border)] rounded-xl overflow-hidden">
            <table className="w-full">
              <thead className="bg-[var(--d2b-bg-elevated)]">
                <tr>
                  <th className="w-8 px-3 py-3"><input type="checkbox" className="rounded" /></th>
                  <th className={TH}>Produto</th>
                  <th className={TH}>Cód. (SKU/GTIN)</th>
                  <th className={TH}>Qtd</th>
                  <th className={TH}>Un</th>
                  <th className={TH}>Localização</th>
                </tr>
              </thead>
              <tbody>
                <tr className="border-t border-[var(--d2b-border)] hover:bg-[var(--d2b-hover)] transition-colors">
                  <td className="px-3 py-3"><input type="checkbox" className="rounded" /></td>
                  <td className={TD}>Teste</td>
                  <td className={TD}><span className="text-[var(--d2b-text-muted)]">—</span></td>
                  <td className={TD}>1</td>
                  <td className={TD}>UN</td>
                  <td className={TD}><span className="text-[var(--d2b-text-muted)]">—</span></td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>

        {/* footer */}
        <div className="border-t border-[var(--d2b-border)] bg-[var(--d2b-bg-surface)] px-6 py-3 shrink-0">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <button onClick={() => setTela('lista')} className="text-sm text-[var(--d2b-text-secondary)] hover:text-[var(--d2b-text-primary)]">
                cancelar <kbd className="text-xs opacity-60">ESC</kbd>
              </button>
            </div>
            <div className="flex items-center gap-2">
              <button className={BTN_GHOST}>reiniciar progresso <kbd className="text-xs opacity-60">CTRL+M</kbd></button>
              <button className={BTN_GHOST}>salvar para depois <kbd className="text-xs opacity-60">CTRL+E</kbd></button>
              <button className={BTN_PRIMARY}>concluir <kbd className="text-xs opacity-60">CTRL+ENTER</kbd></button>
            </div>
          </div>
        </div>
      </div>
    )
  }

  /* ── Lista ── */
  const rows = listaTab === 'em_separacao' ? MOCK_ROWS : []
  const isempty = rows.length === 0

  return (
    <div className="flex flex-col h-full overflow-hidden">
      {/* top bar */}
      <div className="flex items-center justify-between px-6 py-3 border-b border-[var(--d2b-border)] bg-[var(--d2b-bg-surface)] shrink-0">
        <span className="text-xs text-[var(--d2b-text-muted)]">início ≡ vendas separação</span>
        <div className="flex items-center gap-2">
          <button onClick={() => { setShowEmbalag(true) }} className={BTN_OUTLINE}>
            <Package size={14} /> embalar pedidos <kbd className="text-xs opacity-50">CTRL+E</kbd>
          </button>
          <button onClick={() => setTela('separar')} className={BTN_PRIMARY}>
            <Layers size={14} /> separar pedidos <kbd className="text-xs opacity-50">CTRL+S</kbd>
          </button>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto px-6 py-4 relative">
        <h1 className="text-xl font-bold text-[var(--d2b-text-primary)] mb-4">Separação de mercadorias</h1>

        {/* filters */}
        <div className="flex flex-wrap items-center gap-2 mb-4">
          <div className="relative flex-1 min-w-[260px] max-w-sm">
            <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-[var(--d2b-text-muted)]" />
            <input
              value={search}
              onChange={e => setSearch(e.target.value)}
              placeholder="Pesquise por destinatário ou número"
              className="w-full pl-8 pr-3 py-2 text-sm bg-[var(--d2b-bg-main)] border border-[var(--d2b-border-strong)] rounded-md text-[var(--d2b-text-primary)] placeholder:text-[var(--d2b-text-muted)] focus:outline-none focus:border-[#7C4DFF]"
            />
          </div>
          <button className={BTN_OUTLINE}><Calendar size={13} /> envio para separação: últimos 7 dias</button>
          <button className={BTN_OUTLINE}>mais antigas</button>
          <button className={BTN_OUTLINE}><Truck size={13} /> por forma de envio</button>
          <button className={BTN_OUTLINE}>filtros</button>
          <button className="text-sm text-[var(--d2b-text-muted)] hover:text-[var(--d2b-text-primary)]">limpar filtros</button>
        </div>

        {/* tabs */}
        <div className="flex gap-1 border-b border-[var(--d2b-border)] mb-4">
          {LISTA_TABS.map(t => (
            <button
              key={t.id}
              onClick={() => setListaTab(t.id)}
              className={[
                'flex items-center gap-1.5 px-3 py-2 text-sm font-medium border-b-2 transition-colors -mb-px',
                listaTab === t.id
                  ? 'border-[#7C4DFF] text-[#7C4DFF]'
                  : 'border-transparent text-[var(--d2b-text-secondary)] hover:text-[var(--d2b-text-primary)]',
              ].join(' ')}
            >
              {t.label}
              {t.count !== undefined && (
                <span className="px-1.5 py-0.5 text-xs rounded-full bg-[#7C4DFF] text-white font-bold">
                  {t.count}
                </span>
              )}
            </button>
          ))}
        </div>

        {isempty ? (
          <div className="flex flex-col items-center justify-center py-24 gap-3">
            <p className="text-base text-[var(--d2b-text-secondary)]">Sua pesquisa não retornou resultados.</p>
            <div className="flex gap-2">
              <button className={BTN_PRIMARY}>alterar pesquisa</button>
              <button className="text-sm text-[var(--d2b-text-muted)] hover:text-[var(--d2b-text-primary)]">limpar filtros</button>
            </div>
          </div>
        ) : (
          <>
            <div className="border border-[var(--d2b-border)] rounded-xl overflow-x-auto">
              <table className="w-full">
                <thead className="bg-[var(--d2b-bg-elevated)]">
                  <tr>
                    <th className="w-8 px-3 py-3"><input type="checkbox" className="rounded" /></th>
                    <th className="w-8 px-3 py-3" />
                    <th className={TH}>Identificação</th>
                    <th className={TH}>Destinatário</th>
                    <th className={TH}>UF</th>
                    <th className={TH}>Cidade</th>
                    <th className={TH}>Forma de envio</th>
                    <th className={TH}>Data do pedido</th>
                    <th className={TH}>Separação%</th>
                    <th className={TH}>Data prev. entrega</th>
                    <th className={TH}>Prazo máx. despacho</th>
                    <th className={TH}>Marcadores</th>
                    <th className={TH}>Integrações</th>
                  </tr>
                </thead>
                <tbody>
                  {rows.map(r => (
                    <tr key={r.id} className="border-t border-[var(--d2b-border)] hover:bg-[var(--d2b-hover)] transition-colors">
                      <td className="px-3 py-3"><input type="checkbox" className="rounded" /></td>
                      <td className="px-3 py-3">
                        <button className="text-[var(--d2b-text-muted)] hover:text-[var(--d2b-text-primary)]">
                          <MoreHorizontal size={14} />
                        </button>
                      </td>
                      <td className={TD}>{r.identificacao}</td>
                      <td className={TD}>{r.destinatario}</td>
                      <td className={TD}>{r.uf}</td>
                      <td className={TD}>{r.cidade}</td>
                      <td className={TD}>{r.envio}</td>
                      <td className={TD}>{r.dataPedido}</td>
                      <td className={TD}>{r.separacaoPct}</td>
                      <td className={TD}>{r.dataEntrega}</td>
                      <td className={TD}>{r.prazoDespacho}</td>
                      <td className={TD}>{r.marcadores}</td>
                      <td className={TD}>{r.integracoes}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* multi-select footer */}
            <div className="fixed bottom-4 left-1/2 -translate-x-1/2 flex items-center gap-2 bg-[var(--d2b-bg-elevated)] border border-[var(--d2b-border-strong)] rounded-xl shadow-lg px-4 py-2">
              <span className="text-xs font-bold text-[#7C4DFF] mr-2">↑ 01</span>
              <button className={BTN_GHOST}><Printer size={13} /> imprimir separação</button>
              <button className={BTN_GHOST} onClick={() => setTela('separar')}>separar pedidos</button>
              <button className={BTN_GHOST} onClick={() => setShowEmbalag(true)}>embalar pedidos checkout</button>
              <button className={BTN_GHOST}>gerar notas fiscais</button>
              <button className={BTN_GHOST}>enviar para...</button>
            </div>
          </>
        )}

        {/* Embalagem drawer */}
        {showEmbalag && (
          <>
            <div className="fixed inset-0 bg-black/20 z-30" onClick={() => setShowEmbalag(false)} />
            <aside className="fixed right-0 top-0 h-full w-[360px] bg-[var(--d2b-bg-surface)] border-l border-[var(--d2b-border)] z-40 flex flex-col shadow-xl">
              <div className="flex items-center justify-between px-5 py-4 border-b border-[var(--d2b-border)]">
                <h2 className="text-base font-bold text-[var(--d2b-text-primary)]">Embalagem de mercadorias</h2>
                <button onClick={() => setShowEmbalag(false)} className="text-sm text-[var(--d2b-text-muted)] hover:text-[var(--d2b-text-primary)]">fechar ×</button>
              </div>
              <div className="flex-1 px-5 py-4 flex flex-col gap-3">
                {(['pedido', 'produto'] as const).map(opt => (
                  <label key={opt} className="flex items-center gap-3 cursor-pointer">
                    <input
                      type="radio"
                      name="embalag"
                      value={opt}
                      checked={embalagTipo === opt}
                      onChange={() => setEmbalagTipo(opt)}
                      className="w-4 h-4 accent-[#7C4DFF]"
                    />
                    <span className="text-sm text-[var(--d2b-text-primary)] capitalize">
                      Embalar por {opt}
                    </span>
                  </label>
                ))}
              </div>
              <div className="border-t border-[var(--d2b-border)] px-5 py-4 flex items-center justify-end gap-2">
                <button onClick={() => setShowEmbalag(false)} className="text-sm text-[var(--d2b-text-secondary)] hover:text-[var(--d2b-text-primary)]">
                  cancelar <kbd className="text-xs opacity-60">ESC</kbd>
                </button>
                <button
                  onClick={() => { setShowEmbalag(false); setTela('embalagem') }}
                  className={BTN_PRIMARY}
                >
                  continuar <kbd className="text-xs opacity-60">CTRL+ENTER</kbd>
                </button>
              </div>
            </aside>
          </>
        )}
      </div>
    </div>
  )
}

function Layers({ size, className }: { size?: number; className?: string }) {
  return (
    <svg width={size ?? 16} height={size ?? 16} className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <polygon points="12 2 2 7 12 12 22 7 12 2" />
      <polyline points="2 17 12 22 22 17" />
      <polyline points="2 12 12 17 22 12" />
    </svg>
  )
}
