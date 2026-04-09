'use client'

import { useState } from 'react'
import {
  Search, Calendar, ArrowUpDown, SlidersHorizontal,
  Upload, Printer, CheckSquare, MoreHorizontal, X,
  ChevronDown, Minus, Plus, FileInput, AlertCircle,
} from 'lucide-react'

// ─── Shared styles ──────────────────────────────────────────────────────────
const INP =
  'w-full bg-[var(--d2b-bg-main)] border border-[var(--d2b-border-strong)] rounded-md ' +
  'px-3 py-2 text-sm text-[var(--d2b-text-primary)] placeholder:text-[var(--d2b-text-muted)] ' +
  'focus:outline-none focus:border-[#7C4DFF] transition-colors'

const BTN_PRIMARY =
  'flex items-center gap-2 px-4 py-2.5 rounded-full text-sm font-bold text-white bg-[#7C4DFF] hover:bg-[#5B21B6] transition-colors'

const BTN_OUTLINE =
  'flex items-center gap-2 px-4 py-2 rounded-md text-sm font-medium border border-[var(--d2b-border-strong)] ' +
  'text-[var(--d2b-text-secondary)] hover:border-[#7C4DFF] hover:text-[var(--d2b-text-primary)] bg-transparent transition-colors'

// ─── Types ──────────────────────────────────────────────────────────────────
type StatusConf = 'aguardando' | 'pronto' | 'em-conferencia' | 'conferidos' | 'problema'
type ListaTab = StatusConf | 'todas'
type Tela = 'lista' | 'dados' | 'recebimento' | 'conferencia-itens' | 'imprimir-recibo' | 'imprimir-conferencia'

type ConferenciaItem = {
  id: string
  numero: string
  dataEmissao: string
  remetente: string
  itens: number
  status: StatusConf
  integracoes: string[]
}

type ItemNota = {
  id: string
  descricao: string
  sku: string
  gtin: string
  codFornecedor: string
  un: string
  qtdeNota: number
  qtdeConferida: number
}

// ─── Mock ─────────────────────────────────────────────────────────────────────
const MOCK_ITEMS: ItemNota[] = [
  { id: '1', descricao: 'Teste', sku: '', gtin: '', codFornecedor: '', un: 'UNIDAD', qtdeNota: 1, qtdeConferida: 0 },
]

const MOCK_CONFERENCIAS: ConferenciaItem[] = [
  {
    id: '1',
    numero: '222222222',
    dataEmissao: '07/04/2026',
    remetente: 'JESSE',
    itens: 1,
    status: 'aguardando',
    integracoes: ['N', 'E'],
  },
]

const STATUS_CONFIG: Record<StatusConf, { label: string; dot: string; tabUnderline: string }> = {
  aguardando:      { label: 'aguardando entrada', dot: 'bg-yellow-400',  tabUnderline: 'border-yellow-400'  },
  pronto:          { label: 'pronto para conferir',dot: 'bg-blue-400',   tabUnderline: 'border-blue-400'   },
  'em-conferencia':{ label: 'em conferência',      dot: 'bg-teal-400',   tabUnderline: 'border-teal-400'   },
  conferidos:      { label: 'conferidos',           dot: 'bg-emerald-400',tabUnderline: 'border-emerald-400'},
  problema:        { label: 'com problema',         dot: 'bg-rose-400',  tabUnderline: 'border-rose-400'   },
}

const TH = 'text-left px-3 py-3 text-xs font-semibold text-[var(--d2b-text-secondary)] uppercase tracking-wider whitespace-nowrap'

// ═══════════════════════════════════════════════════════════════════════════
// RECIBOS DE IMPRESSÃO
// ═══════════════════════════════════════════════════════════════════════════
function ImprimirRecibo({ item, onClose }: { item: ConferenciaItem; onClose: () => void }) {
  return (
    <div className="fixed inset-0 z-50 flex flex-col bg-[var(--d2b-bg-main)]">
      {/* top bar */}
      <div className="flex items-center gap-4 px-8 py-3 border-b border-[var(--d2b-border)]">
        <button className={BTN_PRIMARY}>
          <Printer size={14} />
          imprimir CTRL+ENTER
        </button>
        <button className={BTN_OUTLINE}>···</button>
        <button onClick={onClose} className="ml-auto text-sm text-[var(--d2b-text-secondary)] hover:text-[var(--d2b-text-primary)] transition-colors">
          fechar ESC
        </button>
      </div>

      {/* receipt */}
      <div className="flex-1 overflow-auto flex items-start justify-center pt-12 pb-16 px-4">
        <div className="bg-white text-black w-full max-w-lg border border-gray-300 p-8 text-sm font-mono">
          <div className="text-center mb-4">
            <p className="font-bold text-base">EMPRESA LTDA</p>
            <p>CNPJ 00.000.000/0001-00</p>
            <p>RUA EXEMPLO, 100 - Cidade, UF - 00000-000</p>
            <p className="font-bold mt-2">Conferência de compra</p>
          </div>
          <p className="text-xs mb-4">
            Conferido por: BS TECNOLOGIA LTDA em {new Date().toLocaleDateString('pt-BR')} {new Date().toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })}
          </p>
          <div className="grid grid-cols-4 gap-2 text-xs border-t border-dashed border-gray-400 pt-2 mb-2">
            <div><p className="font-bold">Número</p><p>{item.numero}</p></div>
            <div><p className="font-bold">Data de emissão</p><p>{item.dataEmissao}</p></div>
            <div><p className="font-bold">Remetente</p><p>{item.remetente}</p></div>
            <div><p className="font-bold">UF</p><p>PE</p></div>
          </div>
          <div className="border-t border-dashed border-gray-400 pt-2 text-xs">
            <p className="font-bold">Quantidade de volumes</p>
            <p>0</p>
          </div>
          <div className="mt-8 pt-4 border-t border-gray-400 text-center text-xs">
            <p>_______________________________________________</p>
            <p>Assinatura do responsável</p>
          </div>
        </div>
      </div>
    </div>
  )
}

function ImprimirConferencia({ item, itens, onClose }: { item: ConferenciaItem; itens: ItemNota[]; onClose: () => void }) {
  return (
    <div className="fixed inset-0 z-50 flex flex-col bg-[var(--d2b-bg-main)]">
      <div className="flex items-center gap-4 px-8 py-3 border-b border-[var(--d2b-border)]">
        <button className={BTN_PRIMARY}>
          <Printer size={14} />
          imprimir CTRL+ENTER
        </button>
        <button className={BTN_OUTLINE}>···</button>
        <button onClick={onClose} className="ml-auto text-sm text-[var(--d2b-text-secondary)] hover:text-[var(--d2b-text-primary)] transition-colors">
          fechar ESC
        </button>
      </div>
      <div className="flex-1 overflow-auto flex items-start justify-center pt-12 pb-16 px-4">
        <div className="bg-white text-black w-full max-w-2xl border border-gray-300 p-8 text-sm font-mono">
          <div className="text-center mb-4">
            <p className="font-bold text-base">EMPRESA LTDA</p>
            <p>CNPJ 00.000.000/0001-00</p>
            <p>RUA EXEMPLO, 100 - Cidade, UF - 00000-000</p>
            <p className="font-bold mt-2">Conferência de compra</p>
          </div>
          <p className="text-xs mb-4">
            Conferido por: BS TECNOLOGIA LTDA em {new Date().toLocaleDateString('pt-BR')} {new Date().toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })}
          </p>
          <div className="grid grid-cols-4 gap-2 text-xs border-t border-dashed border-gray-400 pt-2 mb-3">
            <div><p className="font-bold">Número</p><p>{item.numero}</p></div>
            <div><p className="font-bold">Data de emissão</p><p>{item.dataEmissao}</p></div>
            <div><p className="font-bold">Remetente</p><p>{item.remetente}</p></div>
            <div><p className="font-bold">UF</p><p>PE</p></div>
          </div>
          <div className="border-t border-dashed border-gray-400 pt-2 text-xs">
            <div className="grid grid-cols-6 gap-1 font-bold border-b border-gray-300 pb-1 mb-1">
              <span className="col-span-2">Descrição</span>
              <span>Código</span>
              <span>GTIN</span>
              <span>Cod. fornecedor</span>
              <span>Quantidade</span>
            </div>
            {itens.map(i => (
              <div key={i.id} className="grid grid-cols-6 gap-1 border-b border-dashed border-gray-300 pb-1 mb-1">
                <span className="col-span-2">{i.descricao}</span>
                <span>{i.sku}</span>
                <span>{i.gtin}</span>
                <span>{i.codFornecedor}</span>
                <span>{i.qtdeConferida}</span>
              </div>
            ))}
          </div>
          <div className="mt-8 pt-4 border-t border-gray-400 text-center text-xs">
            <p>_______________________________________________</p>
            <p>Assinatura do responsável</p>
          </div>
        </div>
      </div>
    </div>
  )
}

// ═══════════════════════════════════════════════════════════════════════════
// RECEBIMENTO DE MERCADORIAS
// ═══════════════════════════════════════════════════════════════════════════
function RecebimentoMercadorias({
  item,
  onBack,
  onPrint,
}: {
  item: ConferenciaItem
  onBack: () => void
  onPrint: () => void
}) {
  const [volumes, setVolumes] = useState(0)
  const [busca, setBusca]     = useState('')
  const [qtde, setQtde]       = useState('')
  const [concluido, setConcluido] = useState(false)

  return (
    <div className="flex flex-col h-full">
      {/* Cabeçalho */}
      <div className="flex items-center gap-3 px-8 pt-6 pb-3">
        <button onClick={onBack} className="text-xs text-[var(--d2b-text-muted)] hover:text-[var(--d2b-text-primary)] flex items-center gap-1 transition-colors">
          ← voltar
        </button>
        <span className="text-xs text-[var(--d2b-text-muted)]">/</span>
        <span className="text-xs text-[var(--d2b-text-muted)]">início</span>
        <span className="text-xs text-[var(--d2b-text-muted)]">≡ suprimentos</span>
        <span className="text-xs text-[var(--d2b-text-secondary)]">conferência de compra</span>
      </div>

      <div className="flex-1 overflow-y-auto px-8 pb-8">
        <h2 className="text-xl font-semibold text-[var(--d2b-text-primary)] mb-1">Recebimento de mercadorias</h2>

        {/* Info nota */}
        <div className="flex items-center gap-8 py-3 border-b border-[var(--d2b-border)] mb-6">
          <div>
            <p className="text-xs text-[var(--d2b-text-muted)]">Nota de entrada</p>
            <p className="text-sm font-medium text-[var(--d2b-text-primary)]">{item.numero}</p>
          </div>
          <div>
            <p className="text-xs text-[var(--d2b-text-muted)]">Data emissão da nota</p>
            <p className="text-sm font-medium text-[var(--d2b-text-primary)]">{item.dataEmissao}</p>
          </div>
          <div>
            <p className="text-xs text-[var(--d2b-text-muted)]">Remetente</p>
            <p className="text-sm font-medium text-[var(--d2b-text-primary)]">{item.remetente}</p>
          </div>
          <div>
            <p className="text-xs text-[var(--d2b-text-muted)]">UF</p>
            <p className="text-sm font-medium text-[var(--d2b-text-primary)]">PE</p>
          </div>
        </div>

        {/* Pesquisa + Quantidade */}
        <div className="flex items-end gap-4 mb-6">
          <div className="flex-1 max-w-sm">
            <p className="text-xs text-[var(--d2b-text-secondary)] mb-1">Pesquisa</p>
            <div className="flex items-center gap-2 border border-[var(--d2b-border-strong)] rounded-md px-3 h-10 bg-[var(--d2b-bg-main)]">
              <input
                value={busca}
                onChange={e => setBusca(e.target.value)}
                placeholder="Pesquise por número ou chave da nota"
                className="bg-transparent text-sm text-[var(--d2b-text-primary)] placeholder:text-[var(--d2b-text-muted)] outline-none flex-1"
              />
              <Search size={13} className="text-[var(--d2b-text-muted)] shrink-0" />
            </div>
          </div>
          <div>
            <p className="text-xs text-[var(--d2b-text-secondary)] mb-1">Quantidade</p>
            <input
              value={qtde}
              onChange={e => setQtde(e.target.value)}
              placeholder="Opcional"
              className="w-28 bg-[var(--d2b-bg-main)] border border-[var(--d2b-border-strong)] rounded-md px-3 h-10 text-sm text-[var(--d2b-text-primary)] placeholder:text-[var(--d2b-text-muted)] focus:outline-none focus:border-[#7C4DFF] transition-colors"
            />
          </div>
        </div>

        {/* Volumes */}
        <div>
          <p className="text-xs text-[var(--d2b-text-secondary)] mb-3">Volumes</p>
          <div className="flex items-center gap-3">
            {concluido && (
              <div className="w-5 h-5 rounded-full bg-[#7C4DFF] flex items-center justify-center shrink-0">
                <svg width="10" height="8" fill="none" viewBox="0 0 10 8">
                  <path d="M1 4l2.5 2.5L9 1" stroke="white" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
              </div>
            )}
            <div className="flex items-center gap-2 border border-[var(--d2b-border-strong)] rounded-md px-3 py-1.5 bg-[var(--d2b-bg-main)]">
              <button
                onClick={() => setVolumes(v => Math.max(0, v - 1))}
                className="text-[var(--d2b-text-muted)] hover:text-[var(--d2b-text-primary)] transition-colors"
              >
                <Minus size={12} />
              </button>
              <span className="text-sm text-[var(--d2b-text-primary)] min-w-[3rem] text-center">
                {volumes} / 1
              </span>
              <button
                onClick={() => setVolumes(v => v + 1)}
                className="text-[var(--d2b-text-muted)] hover:text-[var(--d2b-text-primary)] transition-colors"
              >
                <Plus size={12} />
              </button>
            </div>
            <div className={`w-2.5 h-2.5 rounded-full shrink-0 ${concluido ? 'bg-emerald-400' : 'bg-yellow-400'}`} />
          </div>
        </div>
      </div>

      {/* Footer */}
      {concluido ? (
        <div className="px-8 py-5 border-t border-[var(--d2b-border)] bg-[var(--d2b-bg-surface)]">
          <p className="text-base font-semibold text-[var(--d2b-text-primary)] mb-3">Recebimento de mercadorias concluído</p>
          <div className="flex items-center gap-4">
            <button onClick={onPrint} className={BTN_PRIMARY}>
              <Printer size={14} />
              imprimir recibo
            </button>
            <button className="text-sm text-[var(--d2b-text-secondary)] hover:text-[var(--d2b-text-primary)] transition-colors">
              informar problema
            </button>
            <button onClick={onBack} className="text-sm text-[var(--d2b-text-secondary)] hover:text-[var(--d2b-text-primary)] transition-colors">
              voltar para a listagem
            </button>
          </div>
        </div>
      ) : (
        <div className="px-8 py-5 border-t border-[var(--d2b-border)] bg-[var(--d2b-bg-surface)] flex items-center gap-6">
          <button onClick={() => setConcluido(true)} className={BTN_PRIMARY}>
            concluir CTRL+ENTER
          </button>
          <button className="text-sm text-[var(--d2b-text-secondary)] hover:text-[var(--d2b-text-primary)] transition-colors">
            informar problemas CTRL+I
          </button>
          <button onClick={onBack} className="text-sm text-[var(--d2b-text-secondary)] hover:text-[var(--d2b-text-primary)] transition-colors">
            cancelar ESC
          </button>
        </div>
      )}
    </div>
  )
}

// ═══════════════════════════════════════════════════════════════════════════
// CONFERÊNCIA DE ITENS
// ═══════════════════════════════════════════════════════════════════════════
function ConferenciaItens({
  item,
  onBack,
  onPrint,
}: {
  item: ConferenciaItem
  onBack: () => void
  onPrint: () => void
}) {
  const [itens, setItens]   = useState<ItemNota[]>(MOCK_ITEMS)
  const [busca, setBusca]   = useState('')
  const [qtde, setQtde]     = useState('')
  const [concluido, setConcluido] = useState(false)
  const [showEtiquetas, setShowEtiquetas] = useState(false)

  const setQtdeItem = (id: string, delta: number) => {
    setItens(prev =>
      prev.map(i => i.id === id ? { ...i, qtdeConferida: Math.max(0, i.qtdeConferida + delta) } : i)
    )
  }

  const allDone = itens.every(i => i.qtdeConferida >= i.qtdeNota)

  return (
    <div className="flex flex-col h-full">
      <div className="flex items-center gap-3 px-8 pt-6 pb-3">
        <button onClick={onBack} className="text-xs text-[var(--d2b-text-muted)] hover:text-[var(--d2b-text-primary)] flex items-center gap-1 transition-colors">
          ← voltar
        </button>
        <span className="text-xs text-[var(--d2b-text-muted)]">/</span>
        <span className="text-xs text-[var(--d2b-text-muted)]">início</span>
        <span className="text-xs text-[var(--d2b-text-muted)]">≡ suprimentos</span>
        <span className="text-xs text-[var(--d2b-text-secondary)]">conferência de compra</span>
      </div>

      <div className="flex-1 overflow-y-auto px-8 pb-8">
        <h2 className="text-xl font-semibold text-[var(--d2b-text-primary)] mb-1">Conferência de itens</h2>

        {/* Info nota */}
        <div className="flex items-center gap-8 py-3 border-b border-[var(--d2b-border)] mb-6">
          <div>
            <p className="text-xs text-[var(--d2b-text-muted)]">Nota de entrada</p>
            <p className="text-sm font-medium text-[var(--d2b-text-primary)]">{item.numero}</p>
          </div>
          <div>
            <p className="text-xs text-[var(--d2b-text-muted)]">Data emissão da nota</p>
            <p className="text-sm font-medium text-[var(--d2b-text-primary)]">{item.dataEmissao}</p>
          </div>
          <div>
            <p className="text-xs text-[var(--d2b-text-muted)]">Remetente</p>
            <p className="text-sm font-medium text-[var(--d2b-text-primary)]">{item.remetente}</p>
          </div>
          <div>
            <p className="text-xs text-[var(--d2b-text-muted)]">UF</p>
            <p className="text-sm font-medium text-[var(--d2b-text-primary)]">PE</p>
          </div>
        </div>

        {/* Pesquisa + Quantidade */}
        <div className="flex items-end gap-4 mb-6">
          <div className="flex-1 max-w-sm">
            <p className="text-xs text-[var(--d2b-text-secondary)] mb-1">Pesquisa</p>
            <div className="flex items-center gap-2 border border-[var(--d2b-border-strong)] rounded-md px-3 h-10 bg-[var(--d2b-bg-main)]">
              <input
                value={busca}
                onChange={e => setBusca(e.target.value)}
                placeholder="Pesquise pela descrição, código (SKU) ou GTIN"
                className="bg-transparent text-sm text-[var(--d2b-text-primary)] placeholder:text-[var(--d2b-text-muted)] outline-none flex-1"
              />
              <Search size={13} className="text-[var(--d2b-text-muted)] shrink-0" />
            </div>
          </div>
          <div>
            <p className="text-xs text-[var(--d2b-text-secondary)] mb-1">Quantidade</p>
            <input
              value={qtde}
              onChange={e => setQtde(e.target.value)}
              placeholder="Opcional"
              className="w-28 bg-[var(--d2b-bg-main)] border border-[var(--d2b-border-strong)] rounded-md px-3 h-10 text-sm text-[var(--d2b-text-primary)] placeholder:text-[var(--d2b-text-muted)] focus:outline-none focus:border-[#7C4DFF] transition-colors"
            />
          </div>
        </div>

        {/* Tabela itens */}
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-[var(--d2b-border)]">
              <th className={TH}>Quantidade</th>
              <th className={TH}>Descrição</th>
              <th className={TH}>Código (SKU)</th>
              <th className={TH}>GTIN</th>
              <th className={TH}>Cód. fornecedor</th>
              <th className={TH}>UN</th>
              <th className="w-8" />
            </tr>
          </thead>
          <tbody>
            {itens.map(i => {
              const done = i.qtdeConferida >= i.qtdeNota
              return (
                <tr key={i.id} className="border-b border-[var(--d2b-border)] hover:bg-[var(--d2b-hover)] transition-colors">
                  <td className="px-3 py-3">
                    <div className="flex items-center gap-2">
                      {done && (
                        <div className="w-5 h-5 rounded-full bg-[#7C4DFF] flex items-center justify-center shrink-0">
                          <svg width="10" height="8" fill="none" viewBox="0 0 10 8">
                            <path d="M1 4l2.5 2.5L9 1" stroke="white" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                          </svg>
                        </div>
                      )}
                      <div className="w-8 h-8 rounded bg-[var(--d2b-bg-elevated)] border border-[var(--d2b-border)] flex items-center justify-center shrink-0">
                        <svg width="16" height="16" fill="none" viewBox="0 0 24 24" stroke="currentColor" className="text-[var(--d2b-text-muted)]">
                          <rect x="3" y="3" width="18" height="18" rx="2" strokeWidth="1.5"/>
                          <path d="M3 9h18M9 9v12" strokeWidth="1.5"/>
                        </svg>
                      </div>
                      <div className="flex items-center gap-1 border border-[var(--d2b-border-strong)] rounded-md px-2 py-1 bg-[var(--d2b-bg-main)]">
                        <button onClick={() => setQtdeItem(i.id, -1)} className="text-[var(--d2b-text-muted)] hover:text-[var(--d2b-text-primary)]">
                          <Minus size={11} />
                        </button>
                        <span className="text-xs text-[var(--d2b-text-primary)] min-w-[3rem] text-center">
                          {i.qtdeConferida} / {i.qtdeNota}
                        </span>
                        <button onClick={() => setQtdeItem(i.id, 1)} className="text-[var(--d2b-text-muted)] hover:text-[var(--d2b-text-primary)]">
                          <Plus size={11} />
                        </button>
                      </div>
                    </div>
                  </td>
                  <td className="px-3 py-3 text-[var(--d2b-text-primary)]">{i.descricao}</td>
                  <td className="px-3 py-3 text-[var(--d2b-text-secondary)]">{i.sku}</td>
                  <td className="px-3 py-3 text-[var(--d2b-text-secondary)]">{i.gtin}</td>
                  <td className="px-3 py-3 text-[var(--d2b-text-secondary)]">{i.codFornecedor}</td>
                  <td className="px-3 py-3 text-[var(--d2b-text-secondary)]">{i.un}</td>
                  <td className="px-3 py-3">
                    <div className={`w-2.5 h-2.5 rounded-full ${done ? 'bg-emerald-400' : 'bg-yellow-400'}`} />
                  </td>
                </tr>
              )
            })}
          </tbody>
        </table>
      </div>

      {/* Etiquetas overlay */}
      {showEtiquetas && (
        <div className="fixed inset-0 z-40 bg-black/40 flex items-end justify-center">
          <div className="bg-[var(--d2b-bg-elevated)] border-t border-[var(--d2b-border)] w-full max-w-2xl mx-auto p-8 rounded-t-2xl">
            <h3 className="text-base font-semibold text-[var(--d2b-text-primary)] mb-2">Imprimir etiquetas</h3>
            <p className="text-sm text-[var(--d2b-text-secondary)] mb-4 leading-relaxed">
              Para imprimir as etiquetas é necessário realizar as configurações. Você pode fazer isso acessando{' '}
              <span className="text-[#7C4DFF]">Configurações &gt; Aba geral &gt; Configurações das etiquetas</span>{' '}
              ou clicando no botão configurar etiquetas.
            </p>
            <div className="flex items-center gap-4">
              <button className={BTN_PRIMARY}>configurar etiquetas</button>
              <button onClick={() => setShowEtiquetas(false)} className="text-sm text-[var(--d2b-text-secondary)] hover:text-[var(--d2b-text-primary)] transition-colors">
                deixar para depois ESC
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Footer */}
      {concluido ? (
        <div className="px-8 py-5 border-t border-[var(--d2b-border)] bg-[var(--d2b-bg-surface)]">
          <p className="text-base font-semibold text-[var(--d2b-text-primary)] mb-3">Conferência de itens concluída</p>
          <div className="flex items-center gap-4">
            <button onClick={onPrint} className={BTN_PRIMARY}>
              <Printer size={14} />
              imprimir conferência
            </button>
            <button onClick={() => setShowEtiquetas(true)} className="text-sm text-[var(--d2b-text-secondary)] hover:text-[var(--d2b-text-primary)] transition-colors">
              imprimir etiquetas
            </button>
            <button onClick={onBack} className="text-sm text-[var(--d2b-text-secondary)] hover:text-[var(--d2b-text-primary)] transition-colors">
              voltar para a listagem
            </button>
          </div>
        </div>
      ) : (
        <div className="px-8 py-5 border-t border-[var(--d2b-border)] bg-[var(--d2b-bg-surface)] flex items-center gap-6">
          <button onClick={() => setConcluido(true)} className={BTN_PRIMARY}>
            concluir CTRL+ENTER
          </button>
          <button className="text-sm text-[var(--d2b-text-secondary)] hover:text-[var(--d2b-text-primary)] transition-colors">
            informar problemas CTRL+I
          </button>
          <button onClick={onBack} className="text-sm text-[var(--d2b-text-secondary)] hover:text-[var(--d2b-text-primary)] transition-colors">
            cancelar ESC
          </button>
        </div>
      )}
    </div>
  )
}

// ═══════════════════════════════════════════════════════════════════════════
// DADOS DA NOTA (detalhe)
// ═══════════════════════════════════════════════════════════════════════════
function DadosNota({
  item,
  onBack,
  onRecebimento,
  onConferenciaItens,
}: {
  item: ConferenciaItem
  onBack: () => void
  onRecebimento: () => void
  onConferenciaItens: () => void
}) {
  const [acoesOpen, setAcoesOpen] = useState(false)
  const cfg = STATUS_CONFIG[item.status]

  return (
    <div className="flex flex-col h-full">
      {/* Cabeçalho */}
      <div className="flex items-center justify-between gap-3 px-8 pt-6 pb-3">
        <div className="flex items-center gap-3">
          <button onClick={onBack} className="text-xs text-[var(--d2b-text-muted)] hover:text-[var(--d2b-text-primary)] flex items-center gap-1 transition-colors">
            ← voltar
          </button>
          <span className="text-xs text-[var(--d2b-text-muted)]">/</span>
          <span className="text-xs text-[var(--d2b-text-muted)]">início</span>
          <span className="text-xs text-[var(--d2b-text-muted)]">≡ suprimentos</span>
          <span className="text-xs text-[var(--d2b-text-secondary)]">conferência de compra</span>
        </div>
        <div className="relative">
          <button
            onClick={() => setAcoesOpen(v => !v)}
            className={BTN_OUTLINE}
          >
            ações <MoreHorizontal size={14} />
          </button>
          {acoesOpen && (
            <div className="absolute right-0 top-full mt-1 z-20 bg-[var(--d2b-bg-elevated)] border border-[var(--d2b-border-strong)] rounded-xl shadow-xl w-64 overflow-hidden">
              {[
                { label: 'iniciar recebimento de mercadorias', action: () => { setAcoesOpen(false); onRecebimento() } },
                { label: 'iniciar conferência de itens',       action: () => { setAcoesOpen(false); onConferenciaItens() } },
                { label: 'imprimir etiquetas',                 action: () => setAcoesOpen(false) },
              ].map(a => (
                <button key={a.label} onClick={a.action}
                  className="w-full flex items-center px-4 py-3 text-sm text-[var(--d2b-text-secondary)] hover:bg-[var(--d2b-hover)] hover:text-[var(--d2b-text-primary)] transition-colors">
                  {a.label}
                </button>
              ))}
              <div className="mx-4 border-t border-[var(--d2b-border)]" />
              <div className="px-4 py-2">
                <p className="text-xs text-[var(--d2b-text-muted)] mb-2">alterar situação</p>
                <div className="flex items-center gap-2">
                  {(['bg-yellow-400','bg-blue-400','bg-teal-400','bg-emerald-400'] as string[]).map((c,i) => (
                    <button key={i} className={`w-4 h-4 rounded-full ${c}`} onClick={() => setAcoesOpen(false)} />
                  ))}
                </div>
              </div>
              <div className="mx-4 border-t border-[var(--d2b-border)]" />
              {[
                { label: 'conferir problemas' },
                { label: 'remover da conferência de compra' },
              ].map(a => (
                <button key={a.label} onClick={() => setAcoesOpen(false)}
                  className="w-full flex items-center px-4 py-3 text-sm text-[var(--d2b-text-secondary)] hover:bg-[var(--d2b-hover)] hover:text-[var(--d2b-text-primary)] transition-colors">
                  {a.label}
                </button>
              ))}
            </div>
          )}
        </div>
      </div>

      <div className="flex-1 overflow-y-auto px-8 pb-8">
        <h2 className="text-xl font-semibold text-[var(--d2b-text-primary)] mb-1">Dados da nota</h2>
        <div className="flex items-center gap-2 mb-4">
          <div className="flex items-center gap-1">
            {item.integracoes.map(ig => (
              <span key={ig} className="w-6 h-6 rounded-full border border-[var(--d2b-border-strong)] flex items-center justify-center text-[10px] font-bold text-[var(--d2b-text-secondary)]">
                {ig}
              </span>
            ))}
          </div>
          <div className="flex items-center gap-1.5">
            <span className={`w-2 h-2 rounded-full ${cfg.dot}`} />
            <span className="text-xs text-[var(--d2b-text-secondary)]">{cfg.label}</span>
          </div>
        </div>

        {/* Info nota */}
        <div className="flex items-center gap-8 py-3 border-b border-[var(--d2b-border)] mb-6">
          <div>
            <p className="text-xs text-[var(--d2b-text-muted)]">Nota de entrada</p>
            <p className="text-sm font-medium text-[var(--d2b-text-primary)]">{item.numero}</p>
          </div>
          <div>
            <p className="text-xs text-[var(--d2b-text-muted)]">Data emissão da nota</p>
            <p className="text-sm font-medium text-[var(--d2b-text-primary)]">{item.dataEmissao}</p>
          </div>
          <div>
            <p className="text-xs text-[var(--d2b-text-muted)]">Remetente</p>
            <p className="text-sm font-medium text-[var(--d2b-text-primary)]">{item.remetente}</p>
          </div>
          <div>
            <p className="text-xs text-[var(--d2b-text-muted)]">UF</p>
            <p className="text-sm font-medium text-[var(--d2b-text-primary)]">PE</p>
          </div>
        </div>

        {/* Tabela itens da nota */}
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-[var(--d2b-border)]">
              <th className={TH}>Descrição <ArrowUpDown size={10} className="inline mb-0.5 text-[var(--d2b-text-muted)]" /></th>
              <th className={TH + ' text-right'}>Quantidade <ArrowUpDown size={10} className="inline mb-0.5 text-[var(--d2b-text-muted)]" /></th>
              <th className={TH}>Código (SKU) <ArrowUpDown size={10} className="inline mb-0.5 text-[var(--d2b-text-muted)]" /></th>
              <th className={TH}>GTIN <ArrowUpDown size={10} className="inline mb-0.5 text-[var(--d2b-text-muted)]" /></th>
              <th className={TH}>Cód. fornecedor <ArrowUpDown size={10} className="inline mb-0.5 text-[var(--d2b-text-muted)]" /></th>
              <th className={TH}>UN <ArrowUpDown size={10} className="inline mb-0.5 text-[var(--d2b-text-muted)]" /></th>
            </tr>
          </thead>
          <tbody>
            {MOCK_ITEMS.map(i => (
              <tr key={i.id} className="border-b border-[var(--d2b-border)] hover:bg-[var(--d2b-hover)] transition-colors">
                <td className="px-3 py-3">
                  <div className="flex items-center gap-2">
                    <div className="w-8 h-8 rounded bg-[var(--d2b-bg-elevated)] border border-[var(--d2b-border)] flex items-center justify-center shrink-0">
                      <svg width="16" height="16" fill="none" viewBox="0 0 24 24" stroke="currentColor" className="text-[var(--d2b-text-muted)]">
                        <rect x="3" y="3" width="18" height="18" rx="2" strokeWidth="1.5"/>
                        <path d="M3 9h18M9 9v12" strokeWidth="1.5"/>
                      </svg>
                    </div>
                    <span className="text-[var(--d2b-text-primary)]">{i.descricao}</span>
                  </div>
                </td>
                <td className="px-3 py-3 text-right text-[var(--d2b-text-primary)]">{i.qtdeNota}</td>
                <td className="px-3 py-3 text-[var(--d2b-text-secondary)]">{i.sku}</td>
                <td className="px-3 py-3 text-[var(--d2b-text-secondary)]">{i.gtin}</td>
                <td className="px-3 py-3 text-[var(--d2b-text-secondary)]">{i.codFornecedor}</td>
                <td className="px-3 py-3 text-[var(--d2b-text-secondary)]">{i.un}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}

// ═══════════════════════════════════════════════════════════════════════════
// LISTA PRINCIPAL
// ═══════════════════════════════════════════════════════════════════════════
function ConferenciaComprasLista({
  onVer,
}: {
  onVer: (id: string) => void
}) {
  const [tab, setTab]         = useState<ListaTab>('aguardando')
  const [busca, setBusca]     = useState('')
  const [selecionados, setSelecionados] = useState<string[]>([])
  const [acoesBulk, setAcoesBulk]      = useState(false)

  const TABS: { id: ListaTab; label: string; dot?: string }[] = [
    { id: 'aguardando',       label: 'aguardando entrada',  dot: 'bg-yellow-400'  },
    { id: 'pronto',           label: 'pronto para conferir',dot: 'bg-blue-400'    },
    { id: 'em-conferencia',   label: 'em conferência',      dot: 'bg-teal-400'    },
    { id: 'conferidos',       label: 'conferidos',          dot: 'bg-emerald-400' },
    { id: 'problema',         label: 'com problema',        dot: 'bg-rose-400'    },
  ]

  const countOf = (t: ListaTab) =>
    t === 'todas'
      ? MOCK_CONFERENCIAS.length
      : MOCK_CONFERENCIAS.filter(c => c.status === t).length

  const filtradas = MOCK_CONFERENCIAS.filter(c => {
    const q = busca.toLowerCase()
    const matchBusca = !q || c.numero.includes(q) || c.remetente.toLowerCase().includes(q)
    const matchTab = tab === 'todas' || c.status === tab
    return matchBusca && matchTab
  })

  const toggleSelect = (id: string) => {
    setSelecionados(prev =>
      prev.includes(id) ? prev.filter(x => x !== id) : [...prev, id]
    )
  }

  const toggleAll = () => {
    setSelecionados(prev => prev.length === filtradas.length ? [] : filtradas.map(c => c.id))
  }

  const activeTab = STATUS_CONFIG[tab as StatusConf]

  return (
    <div className="flex flex-col h-full">
      {/* Top bar */}
      <div className="flex items-center justify-between gap-3 px-8 pt-6 pb-3 flex-wrap">
        <div className="text-xs text-[var(--d2b-text-muted)]">início ≡ suprimentos conferência de compra</div>
        <div className="flex items-center gap-2">
          <button className={BTN_OUTLINE}>
            <FileInput size={13} />
            importar xml CTRL+X
          </button>
          <button className={BTN_OUTLINE}>
            <CheckSquare size={13} />
            conferir itens CTRL+I
          </button>
          <button className={BTN_PRIMARY}>
            <Upload size={13} />
            receber mercadorias CTRL+E
          </button>
        </div>
      </div>

      {/* Título + busca */}
      <div className="px-8 pb-3">
        <h2 className="text-xl font-semibold text-[var(--d2b-text-primary)] mb-4">Conferência de compra</h2>
        <div className="flex items-center gap-2 flex-wrap">
          <div className="flex items-center gap-2 bg-[var(--d2b-bg-elevated)] border border-[var(--d2b-border)] rounded-lg px-3 h-9 w-72">
            <input
              value={busca}
              onChange={e => setBusca(e.target.value)}
              placeholder="Pesquise por fornecedor ou número..."
              className="bg-transparent text-sm text-[var(--d2b-text-primary)] placeholder:text-[var(--d2b-text-muted)] outline-none flex-1"
            />
            <Search size={13} className="text-[var(--d2b-text-muted)] shrink-0" />
          </div>
          <button className="flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs border border-[var(--d2b-border-strong)] text-[var(--d2b-text-secondary)] hover:border-[#7C4DFF] transition-colors">
            <Calendar size={12} />
            09 Março – 07 Abril
          </button>
          <button className="flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs border border-[var(--d2b-border-strong)] text-[var(--d2b-text-secondary)] hover:border-[#7C4DFF] transition-colors">
            <ArrowUpDown size={12} />
            mais recentes
          </button>
        </div>
      </div>

      {/* Abas */}
      <div className="flex items-end border-b border-[var(--d2b-border)] px-8">
        {TABS.map(t => {
          const count = countOf(t.id)
          const active = tab === t.id
          const dotColor = t.dot ?? ''
          return (
            <button key={t.id} onClick={() => setTab(t.id)}
              className={[
                'flex flex-col items-center px-4 pb-2.5 pt-2 border-b-2 -mb-px transition-colors gap-0.5',
                active
                  ? `${STATUS_CONFIG[t.id as StatusConf]?.tabUnderline ?? 'border-[#7C4DFF]'} text-[var(--d2b-text-primary)]`
                  : 'border-transparent text-[var(--d2b-text-secondary)] hover:text-[var(--d2b-text-primary)]',
              ].join(' ')}
            >
              <span className="flex items-center gap-1.5 text-sm font-medium whitespace-nowrap">
                {dotColor && <span className={`w-2 h-2 rounded-full shrink-0 ${dotColor}`} />}
                {t.label}
              </span>
              {count > 0 && (
                <span className={`text-xs font-semibold ${active ? 'text-[#7C4DFF]' : 'text-[var(--d2b-text-muted)]'}`}>
                  {String(count).padStart(2, '0')}
                </span>
              )}
            </button>
          )
        })}
        <div className="ml-auto pb-2">
          <button className="p-1.5 rounded text-[var(--d2b-text-muted)] hover:text-[var(--d2b-text-primary)] border border-[var(--d2b-border)] transition-colors">
            <SlidersHorizontal size={13} />
          </button>
        </div>
      </div>

      {/* Tabela */}
      <div className="flex-1 overflow-x-auto px-8 pt-4 pb-4">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-[var(--d2b-border)]">
              <th className="px-3 py-3 w-8">
                <input
                  type="checkbox"
                  checked={selecionados.length === filtradas.length && filtradas.length > 0}
                  onChange={toggleAll}
                  className="w-4 h-4 rounded accent-[#7C4DFF] cursor-pointer"
                />
              </th>
              <th className="w-6 px-1 py-3" />
              <th className={TH}>Número <ArrowUpDown size={10} className="inline mb-0.5 text-[var(--d2b-text-muted)]" /></th>
              <th className={TH}>Data emissão da nota <ArrowUpDown size={10} className="inline mb-0.5 text-[var(--d2b-text-muted)]" /></th>
              <th className={TH}>Remetente <ArrowUpDown size={10} className="inline mb-0.5 text-[var(--d2b-text-muted)]" /></th>
              <th className={TH}>Itens <ArrowUpDown size={10} className="inline mb-0.5 text-[var(--d2b-text-muted)]" /></th>
              <th className={TH}>Integrações</th>
              <th className="w-8" />
            </tr>
          </thead>
          <tbody>
            {filtradas.length === 0 ? (
              <tr>
                <td colSpan={8} className="px-3 py-14 text-center text-sm text-[var(--d2b-text-muted)]">
                  Nenhuma conferência encontrada.
                </td>
              </tr>
            ) : filtradas.map(c => {
              const sel = selecionados.includes(c.id)
              const cfg = STATUS_CONFIG[c.status]
              return (
                <tr key={c.id}
                  className={[
                    'border-b border-[var(--d2b-border)] hover:bg-[var(--d2b-hover)] transition-colors group',
                    sel ? 'bg-[var(--d2b-hover)]' : '',
                  ].join(' ')}
                >
                  <td className="px-3 py-3">
                    <input
                      type="checkbox"
                      checked={sel}
                      onChange={() => toggleSelect(c.id)}
                      className="w-4 h-4 rounded accent-[#7C4DFF] cursor-pointer"
                    />
                  </td>
                  <td className="px-1 py-3">
                    <span className="text-xs text-[var(--d2b-text-muted)] opacity-0 group-hover:opacity-100 cursor-pointer select-none">···</span>
                  </td>
                  <td className="px-3 py-3">
                    <span
                      onClick={() => onVer(c.id)}
                      className="font-medium text-[var(--d2b-text-primary)] hover:text-[#7C4DFF] cursor-pointer transition-colors"
                    >
                      {c.numero}
                    </span>
                  </td>
                  <td className="px-3 py-3 text-[var(--d2b-text-secondary)]">{c.dataEmissao}</td>
                  <td className="px-3 py-3 text-[var(--d2b-text-secondary)]">{c.remetente}</td>
                  <td className="px-3 py-3 text-[var(--d2b-text-secondary)]">{c.itens}</td>
                  <td className="px-3 py-3">
                    <div className="flex items-center gap-1">
                      {c.integracoes.map(ig => (
                        <span key={ig} className="w-5 h-5 rounded-full border border-[var(--d2b-border-strong)] flex items-center justify-center text-[9px] font-bold text-[var(--d2b-text-secondary)]">
                          {ig}
                        </span>
                      ))}
                    </div>
                  </td>
                  <td className="px-3 py-3">
                    <div className={`w-2.5 h-2.5 rounded-full ${cfg.dot}`} />
                  </td>
                </tr>
              )
            })}
          </tbody>
        </table>
      </div>

      {/* Footer bulk */}
      {selecionados.length > 0 && (
        <div className="relative px-8 py-3 border-t border-[var(--d2b-border)] bg-[var(--d2b-bg-surface)] flex items-center gap-3 flex-wrap">
          <span className="text-xs text-[var(--d2b-text-muted)] mr-2">
            ↑ {String(selecionados.length).padStart(2, '0')}
          </span>
          <button className={BTN_PRIMARY}>
            <Upload size={13} />
            iniciar recebimento de mercadorias
          </button>
          <button className={BTN_OUTLINE}>
            <CheckSquare size={13} />
            iniciar conferência de itens
          </button>
          <div className="relative">
            <button onClick={() => setAcoesBulk(v => !v)} className={BTN_OUTLINE}>
              mais ações <MoreHorizontal size={14} />
            </button>
            {acoesBulk && (
              <div className="absolute bottom-full mb-1 left-0 z-20 bg-[var(--d2b-bg-elevated)] border border-[var(--d2b-border-strong)] rounded-xl shadow-xl w-72 overflow-hidden">
                <button onClick={() => setAcoesBulk(false)}
                  className="w-full flex items-center px-4 py-3 text-sm text-[var(--d2b-text-secondary)] hover:bg-[var(--d2b-hover)] transition-colors">
                  imprimir etiquetas
                </button>
                <div className="px-4 py-2 border-t border-[var(--d2b-border)]">
                  <p className="text-xs text-[var(--d2b-text-muted)] mb-2">alterar situação</p>
                  <div className="flex items-center gap-2">
                    {(['bg-yellow-400','bg-blue-400','bg-teal-400','bg-emerald-400'] as string[]).map((c,i) => (
                      <button key={i} className={`w-4 h-4 rounded-full ${c}`} onClick={() => setAcoesBulk(false)} />
                    ))}
                  </div>
                </div>
                <button onClick={() => setAcoesBulk(false)}
                  className="w-full flex items-center px-4 py-3 text-sm text-[var(--d2b-text-secondary)] hover:bg-[var(--d2b-hover)] border-t border-[var(--d2b-border)] transition-colors">
                  remover da conferência de compra
                </button>
              </div>
            )}
          </div>
          <div className="ml-auto flex items-center gap-4 text-xs text-[var(--d2b-text-muted)]">
            <span>{selecionados.length} quantidade</span>
            <span>{selecionados.length} total</span>
          </div>
        </div>
      )}

      {/* Rodapé quantidade geral */}
      {selecionados.length === 0 && filtradas.length > 0 && (
        <div className="px-8 py-2 border-t border-[var(--d2b-border)] flex justify-end text-xs text-[var(--d2b-text-muted)]">
          {filtradas.length} quantidade ↑
        </div>
      )}
    </div>
  )
}

// ═══════════════════════════════════════════════════════════════════════════
// EXPORT
// ═══════════════════════════════════════════════════════════════════════════
export function ConferenciaComprasContent() {
  const [tela, setTela]     = useState<Tela>('lista')
  const [activeId, setActiveId] = useState<string | null>(null)

  const activeItem = MOCK_CONFERENCIAS.find(c => c.id === activeId) ?? MOCK_CONFERENCIAS[0]

  if (tela === 'imprimir-recibo')
    return <ImprimirRecibo item={activeItem} onClose={() => setTela('recebimento')} />

  if (tela === 'imprimir-conferencia')
    return <ImprimirConferencia item={activeItem} itens={MOCK_ITEMS} onClose={() => setTela('conferencia-itens')} />

  if (tela === 'recebimento')
    return (
      <RecebimentoMercadorias
        item={activeItem}
        onBack={() => setTela('dados')}
        onPrint={() => setTela('imprimir-recibo')}
      />
    )

  if (tela === 'conferencia-itens')
    return (
      <ConferenciaItens
        item={activeItem}
        onBack={() => setTela('dados')}
        onPrint={() => setTela('imprimir-conferencia')}
      />
    )

  if (tela === 'dados')
    return (
      <DadosNota
        item={activeItem}
        onBack={() => setTela('lista')}
        onRecebimento={() => setTela('recebimento')}
        onConferenciaItens={() => setTela('conferencia-itens')}
      />
    )

  return (
    <ConferenciaComprasLista
      onVer={id => { setActiveId(id); setTela('dados') }}
    />
  )
}
