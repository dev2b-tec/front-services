'use client'

import { useState, useEffect } from 'react'
import { Search, MoreHorizontal, ChevronDown, Trash2, User } from 'lucide-react'

// ─── Shared styles ───────────────────────────────────────────────────────────
const INP =
  'w-full bg-[var(--d2b-bg-main)] border border-[var(--d2b-border-strong)] rounded-md ' +
  'px-3 py-2 text-sm text-[var(--d2b-text-primary)] placeholder:text-[var(--d2b-text-muted)] ' +
  'focus:outline-none focus:border-[#7C4DFF] transition-colors'
const BTN_PRIMARY =
  'flex items-center gap-2 px-4 py-2.5 rounded-full text-sm font-bold text-white bg-[#7C4DFF] hover:bg-[#5B21B6] transition-colors'

// ─── Types ───────────────────────────────────────────────────────────────────
type ItemVenda = { id: string; descricao: string; qtd: number; precoUn: number; desconto: number }
type CaixaState = 'fechado' | 'aberto' | 'finalizar'

const CLIENTES_MOCK = [{ id: '1', nome: 'BS TECNOLOGIA LTDA', cpfCnpj: '92.306.257/0002-75', telefone: '(81) 3333-3333' }]
const PRODUTOS_MOCK = [{ id: '1', descricao: 'Teste', codigo: '', estoque: 101, precoUn: 15.00 }]

// ─── Relógio ──────────────────────────────────────────────────────────────────
function Relogio({ abertoAs }: { abertoAs?: string }) {
  const [hora, setHora] = useState(() => {
    const d = new Date()
    return d.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })
  })

  useEffect(() => {
    const id = setInterval(() => {
      setHora(new Date().toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' }))
    }, 5000)
    return () => clearInterval(id)
  }, [])

  return (
    <div className="flex flex-col items-center gap-1">
      <span className="text-7xl font-thin text-[var(--d2b-text-primary)] tracking-tight">{hora}</span>
      <span className="text-sm text-[var(--d2b-text-muted)]">terça, 7 de Abril de 2026</span>
      {abertoAs && <span className="text-xs text-[var(--d2b-text-muted)]">caixa aberto às {abertoAs}</span>}
    </div>
  )
}

// ─── Drawer Encontrar Cliente ─────────────────────────────────────────────────
function DrawerCliente({
  onClose,
  onSelecionar,
}: {
  onClose: () => void
  onSelecionar: (nome: string) => void
}) {
  const [busca,  setBusca]  = useState('')
  const [result, setResult] = useState<typeof CLIENTES_MOCK>([])

  const pesquisar = () => setResult(CLIENTES_MOCK.filter(c => c.nome.toLowerCase().includes(busca.toLowerCase())))

  return (
    <div className="fixed inset-0 z-40 flex">
      <div className="flex-1 bg-black/30" onClick={onClose} />
      <div className="w-[540px] bg-[var(--d2b-bg-elevated)] border-l border-[var(--d2b-border)] flex flex-col h-full shadow-2xl">
        <div className="flex items-center justify-between px-6 py-4 border-b border-[var(--d2b-border)]">
          <h3 className="text-base font-semibold text-[var(--d2b-text-primary)]">Encontrar cliente</h3>
          <button onClick={onClose} className="text-sm text-[var(--d2b-text-secondary)] hover:text-[var(--d2b-text-primary)]">fechar ×</button>
        </div>
        <div className="flex-1 overflow-y-auto px-6 py-5">
          <div className="flex items-center gap-2 border border-[var(--d2b-border-strong)] rounded-md bg-[var(--d2b-bg-main)] px-3 h-10 mb-3">
            <input
              className="flex-1 bg-transparent text-sm text-[var(--d2b-text-primary)] outline-none"
              placeholder="Nome, CPF/CNPJ..."
              value={busca}
              onChange={e => setBusca(e.target.value)}
              onKeyDown={e => e.key === 'Enter' && pesquisar()}
            />
            <button onClick={pesquisar}><Search size={13} className="text-[var(--d2b-text-muted)]" /></button>
          </div>
          <div className="flex gap-3 mb-4">
            <button onClick={() => onSelecionar('Consumidor Final')} className="text-sm text-[#7C4DFF] hover:text-[#5B21B6]">usar cliente padrão</button>
            <button className="text-sm text-[#7C4DFF] hover:text-[#5B21B6]">cadastrar novo cliente</button>
          </div>
          {result.length === 0 && busca === '' && (
            <div className="flex items-center gap-3 p-4 rounded-xl border border-[var(--d2b-border)] bg-[var(--d2b-bg-surface)]">
              <div className="w-10 h-10 rounded-full bg-[var(--d2b-bg-main)] border border-[var(--d2b-border)] flex items-center justify-center">
                <Search size={16} className="text-[var(--d2b-text-muted)]" />
              </div>
              <p className="text-sm text-[var(--d2b-text-secondary)]">Você pode buscar e selecionar um cliente da lista, ou cadastrar um novo cliente para vincular a sua venda.</p>
            </div>
          )}
          {result.length > 0 && (
            <table className="w-full text-sm">
              <thead><tr className="border-b border-[var(--d2b-border)]">
                <th className="text-left px-3 py-2 text-xs font-semibold text-[var(--d2b-text-secondary)] uppercase">Nome cliente</th>
                <th className="text-left px-3 py-2 text-xs font-semibold text-[var(--d2b-text-secondary)] uppercase">CPF/CNPJ</th>
                <th className="text-left px-3 py-2 text-xs font-semibold text-[var(--d2b-text-secondary)] uppercase">Telefone</th>
              </tr></thead>
              <tbody>
                {result.map(c => (
                  <tr key={c.id} onClick={() => onSelecionar(c.nome)} className="border-b border-[var(--d2b-border)] hover:bg-[var(--d2b-hover)] cursor-pointer">
                    <td className="px-3 py-3 flex items-center gap-2">
                      <div className="w-4 h-4 rounded-full border-2 border-[#7C4DFF] flex items-center justify-center">
                        <div className="w-2 h-2 rounded-full bg-[#7C4DFF]" />
                      </div>
                      {c.nome}
                    </td>
                    <td className="px-3 py-3 text-[var(--d2b-text-secondary)]">{c.cpfCnpj}</td>
                    <td className="px-3 py-3 text-[var(--d2b-text-secondary)]">{c.telefone}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
        <div className="px-6 py-4 border-t border-[var(--d2b-border)] flex items-center gap-3">
          <button onClick={() => result[0] && onSelecionar(result[0].nome)} className={BTN_PRIMARY + ' opacity-70'}>selecionar cliente</button>
          <button onClick={onClose} className="text-sm text-[var(--d2b-text-secondary)] hover:text-[var(--d2b-text-primary)]">cancelar</button>
        </div>
      </div>
    </div>
  )
}

// ─── Caixa Aberto ──────────────────────────────────────────────────────────────
function PDVAberto({
  abertoAs,
  onFinalizar,
}: {
  abertoAs: string
  onFinalizar: (itens: ItemVenda[], cliente: string, vendedor: string) => void
}) {
  const [produto,        setProduto]        = useState('')
  const [quantidade,     setQuantidade]     = useState('1,00')
  const [vendedor,       setVendedor]       = useState('Sem vendedor')
  const [cliente,        setCliente]        = useState('Consumidor Final')
  const [showClienteDrawer, setShowClienteDrawer] = useState(false)
  const [showMaisAcoes,  setShowMaisAcoes]  = useState(false)
  const [itens,          setItens]          = useState<ItemVenda[]>([])
  const [produtoMatch,   setProdutoMatch]   = useState<typeof PRODUTOS_MOCK[0] | null>(null)
  const [desconto,       setDesconto]       = useState(0)

  const pesquisarProduto = (v: string) => {
    setProduto(v)
    const match = PRODUTOS_MOCK.find(p => p.descricao.toLowerCase().includes(v.toLowerCase()))
    setProdutoMatch(match ?? null)
  }

  const adicionar = () => {
    if (!produtoMatch) return
    const qtd = parseFloat(quantidade.replace(',', '.')) || 1
    setItens(prev => [...prev, { id: String(Date.now()), descricao: produtoMatch.descricao, qtd, precoUn: produtoMatch.precoUn, desconto }])
    setProduto('')
    setQuantidade('1,00')
    setProdutoMatch(null)
    setDesconto(0)
  }

  const totalVenda = itens.reduce((sum, i) => sum + i.qtd * i.precoUn * (1 - i.desconto / 100), 0)

  return (
    <div className="flex flex-col h-full">
      {/* Top bar */}
      <div className="flex items-center justify-between px-8 pt-4 pb-3 border-b border-[var(--d2b-border)]">
        <h2 className="text-lg font-semibold text-[var(--d2b-text-primary)]">PDV</h2>
        <div className="flex items-center gap-3 text-xs text-[var(--d2b-text-muted)]">
          <button className="hover:text-[var(--d2b-text-primary)]">🔒 detalhes do caixa <kbd className="text-[10px]">CTRL+Y</kbd></button>
          <button className="hover:text-[var(--d2b-text-primary)]">🔍 busca avançada <kbd className="text-[10px]">CTRL+B</kbd></button>
          <div className="relative">
            <button onClick={() => setShowMaisAcoes(v => !v)} className="flex items-center gap-1 hover:text-[var(--d2b-text-primary)]">
              mais ações <MoreHorizontal size={13} />
            </button>
            {showMaisAcoes && (
              <div className="absolute right-0 top-full mt-1 w-44 bg-[var(--d2b-bg-elevated)] border border-[var(--d2b-border)] rounded-xl shadow-lg z-20 py-1">
                {['histórico de vendas','sangria','suprimento','fechar caixa'].map(a => (
                  <button key={a} className="w-full text-left px-4 py-2 text-sm text-[var(--d2b-text-secondary)] hover:bg-[var(--d2b-hover)]">{a}</button>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Produto + Quantidade */}
      <div className="px-8 pt-4 pb-3 border-b border-[var(--d2b-border)]">
        <div className="flex items-end gap-4">
          <div className="flex-1">
            <label className="block text-xs text-[var(--d2b-text-secondary)] mb-1">Produto</label>
            <div className="relative">
              <input
                className="w-full bg-[var(--d2b-bg-main)] border border-[var(--d2b-border-strong)] rounded-md px-3 py-2 text-sm text-[var(--d2b-text-primary)] placeholder:text-[var(--d2b-text-muted)] focus:outline-none focus:border-[#7C4DFF] transition-colors"
                placeholder="Pesquise por descrição, código (SKU) ou GTIN"
                value={produto}
                onChange={e => pesquisarProduto(e.target.value)}
              />
              {produtoMatch && (
                <div className="absolute left-0 top-full mt-1 w-full bg-[var(--d2b-bg-elevated)] border border-[var(--d2b-border)] rounded-xl shadow-lg z-10 p-3">
                  <p className="text-sm font-semibold text-[var(--d2b-text-primary)] mb-2">{produtoMatch.descricao}</p>
                  <div className="grid grid-cols-2 gap-1 text-xs text-[var(--d2b-text-secondary)]">
                    <span>Código</span><span className="text-[var(--d2b-text-muted)]">{produtoMatch.codigo || '—'}</span>
                    <span>Estoque</span><span className="text-[#7C4DFF] font-semibold">{produtoMatch.estoque}</span>
                    <span>Preço un</span>
                    <span>
                      <input type="number" className="w-20 bg-[var(--d2b-bg-main)] border border-[var(--d2b-border-strong)] rounded px-1.5 py-0.5 text-xs text-[var(--d2b-text-primary)] outline-none" defaultValue={produtoMatch.precoUn.toFixed(2)} />
                    </span>
                    {desconto > 0 && <><span>Desconto un</span><span>{desconto}% R${(produtoMatch.precoUn * desconto / 100).toFixed(2)}</span></>}
                    <span>Preço total</span><span>R${(produtoMatch.precoUn * (parseFloat(quantidade.replace(',','.')) || 1) * (1 - desconto / 100)).toFixed(2)}</span>
                  </div>
                </div>
              )}
            </div>
          </div>
          <div className="w-28">
            <label className="block text-xs text-[var(--d2b-text-secondary)] mb-1">Quantidade</label>
            <input className="w-full bg-[var(--d2b-bg-main)] border border-[var(--d2b-border-strong)] rounded-md px-3 py-2 text-sm text-[var(--d2b-text-primary)] text-right focus:outline-none focus:border-[#7C4DFF]" value={quantidade} onChange={e => setQuantidade(e.target.value)} />
          </div>
        </div>
        {!produtoMatch && produto === '' && (
          <p className="text-xs text-[var(--d2b-text-muted)] mt-2">💡 Experimente digitar sem clicar no campo de busca ou usar o leitor de código de barras</p>
        )}
      </div>

      {/* Center: clock + vendedor + cliente */}
      <div className="flex-1 overflow-y-auto flex flex-col items-center justify-center gap-6 px-8 py-6">
        {itens.length === 0 ? (
          <>
            <Relogio abertoAs={abertoAs} />
            <div className="w-64 flex flex-col gap-3">
              <div>
                <p className="text-xs text-[var(--d2b-text-muted)] mb-1">Vendedor</p>
                <div className="flex items-center justify-between border border-[var(--d2b-border-strong)] rounded-md px-3 py-2 bg-[var(--d2b-bg-main)]">
                  <div className="flex items-center gap-2">
                    <User size={13} className="text-[var(--d2b-text-muted)]" />
                    <span className="text-sm text-[var(--d2b-text-primary)]">{vendedor}</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <kbd className="text-[10px] text-[var(--d2b-text-muted)]">F9</kbd>
                    <ChevronDown size={11} className="text-[var(--d2b-text-muted)]" />
                  </div>
                </div>
              </div>
              <div>
                <p className="text-xs text-[var(--d2b-text-muted)] mb-1">Cliente</p>
                <button
                  onClick={() => setShowClienteDrawer(true)}
                  className="w-full flex items-center justify-between border border-[var(--d2b-border-strong)] rounded-md px-3 py-2 bg-[var(--d2b-bg-main)] hover:border-[#7C4DFF] transition-colors"
                >
                  <div className="flex items-center gap-2">
                    <User size={13} className="text-[var(--d2b-text-muted)]" />
                    <span className="text-sm text-[var(--d2b-text-primary)]">{cliente}</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <kbd className="text-[10px] text-[var(--d2b-text-muted)]">F8</kbd>
                    <Search size={11} className="text-[var(--d2b-text-muted)]" />
                  </div>
                </button>
              </div>
            </div>
          </>
        ) : (
          <div className="w-full">
            <table className="w-full text-sm">
              <thead><tr className="border-b border-[var(--d2b-border)]">
                <th className="text-left px-2 py-2 text-xs text-[var(--d2b-text-secondary)]">Produto</th>
                <th className="text-right px-2 py-2 text-xs text-[var(--d2b-text-secondary)]">Qtd</th>
                <th className="text-right px-2 py-2 text-xs text-[var(--d2b-text-secondary)]">Total</th>
                <th className="px-2 py-2 w-8" />
              </tr></thead>
              <tbody>
                {itens.map(i => (
                  <tr key={i.id} className="border-b border-[var(--d2b-border)]">
                    <td className="px-2 py-2 text-[var(--d2b-text-primary)]">{i.descricao}</td>
                    <td className="px-2 py-2 text-right text-[var(--d2b-text-secondary)]">{i.qtd}</td>
                    <td className="px-2 py-2 text-right text-[var(--d2b-text-primary)] font-semibold">R${(i.qtd * i.precoUn * (1 - i.desconto / 100)).toFixed(2)}</td>
                    <td className="px-2 py-2">
                      <button onClick={() => setItens(prev => prev.filter(x => x.id !== i.id))} className="text-[var(--d2b-text-muted)] hover:text-rose-400">
                        <Trash2 size={12} />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Footer */}
      <div className="px-8 py-3 border-t border-[var(--d2b-border)] bg-[var(--d2b-bg-surface)] flex items-center justify-between">
        <div className="flex items-center gap-4">
          {produtoMatch ? (
            <>
              <button onClick={adicionar} className={BTN_PRIMARY}>adicionar <kbd className="text-[11px] ml-1 opacity-70">ENTER</kbd></button>
              <button onClick={() => setShowMaisAcoes(true)} className="text-sm text-[var(--d2b-text-muted)] hover:text-[var(--d2b-text-primary)]">aplicar desconto <kbd className="text-[10px]">F4</kbd></button>
              <button onClick={() => { setProduto(''); setProdutoMatch(null) }} className="text-sm text-[var(--d2b-text-muted)] hover:text-[var(--d2b-text-primary)]">cancelar <kbd className="text-[10px]">ESC</kbd></button>
            </>
          ) : itens.length > 0 ? (
            <button onClick={() => onFinalizar(itens, cliente, vendedor)} className={BTN_PRIMARY}>finalizar venda</button>
          ) : null}
        </div>
        <div className="flex items-center gap-6 text-sm text-[var(--d2b-text-muted)]">
          <span>itens <strong className="text-[var(--d2b-text-primary)]">{itens.length}</strong></span>
          <span>quant. <strong className="text-[var(--d2b-text-primary)]">{itens.reduce((s, i) => s + i.qtd, 0)}</strong></span>
          <span>total da venda <strong className="text-[var(--d2b-text-primary)] text-base">R${totalVenda.toFixed(2)}</strong></span>
        </div>
      </div>

      {showClienteDrawer && (
        <DrawerCliente
          onClose={() => setShowClienteDrawer(false)}
          onSelecionar={c => { setCliente(c); setShowClienteDrawer(false) }}
        />
      )}
    </div>
  )
}

// ─── Finalizar Venda ──────────────────────────────────────────────────────────
function PDVFinalizar({
  itens,
  cliente,
  vendedor,
  onBack,
  onFinalizar,
}: {
  itens: ItemVenda[]
  cliente: string
  vendedor: string
  onBack: () => void
  onFinalizar: () => void
}) {
  const [formaRecebimento, setFormaRecebimento] = useState('Dinheiro')
  const [desconto, setDesconto] = useState('0,00')
  const total = itens.reduce((s, i) => s + i.qtd * i.precoUn * (1 - i.desconto / 100), 0)

  return (
    <div className="flex flex-col h-full">
      <div className="flex items-center justify-between px-8 pt-5 pb-3 border-b border-[var(--d2b-border)]">
        <h2 className="text-lg font-semibold text-[var(--d2b-text-primary)]">Finalizar venda</h2>
        <div className="flex items-center gap-4 text-xs text-[var(--d2b-text-muted)]">
          <button onClick={onBack} className="hover:text-[var(--d2b-text-primary)]">voltar e incluir mais itens <kbd>ESC</kbd></button>
          <button className="flex items-center gap-1 hover:text-[var(--d2b-text-primary)]">mais ações <MoreHorizontal size={13} /></button>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto">
        <div className="grid grid-cols-2 gap-0 h-full">
          {/* Left: itens */}
          <div className="px-8 py-6 border-r border-[var(--d2b-border)]">
            <div className="flex items-center gap-3 mb-4">
              <div className="flex items-center gap-2 border border-[var(--d2b-border-strong)] rounded-md px-3 py-1.5 bg-[var(--d2b-bg-main)] flex-1">
                <User size={12} className="text-[var(--d2b-text-muted)]" />
                <span className="text-sm text-[var(--d2b-text-primary)]">{cliente}</span>
                <span className="text-[10px] text-[var(--d2b-text-muted)] ml-auto">F8</span>
                <Search size={11} className="text-[var(--d2b-text-muted)]" />
              </div>
              <button className="text-xs text-[#7C4DFF] hover:text-[#5B21B6]">editar</button>
            </div>
            <div className="flex gap-4 text-xs text-[var(--d2b-text-muted)] mb-3">
              <span>Nº de itens <strong className="text-[var(--d2b-text-primary)]">{itens.length}</strong></span>
              <span>Soma de qtdes <strong className="text-[var(--d2b-text-primary)]">{itens.reduce((s, i) => s + i.qtd, 0).toFixed(2)}</strong></span>
            </div>
            {itens.map(i => (
              <div key={i.id} className="flex items-center justify-between py-2 border-b border-[var(--d2b-border)] text-sm">
                <span className="text-[var(--d2b-text-secondary)]">{i.qtd.toFixed(2)} {i.descricao}</span>
                <span className="text-[var(--d2b-text-primary)] font-semibold">
                  {(i.qtd * i.precoUn * (1 - i.desconto / 100)).toFixed(2)}
                </span>
              </div>
            ))}
            <div className="text-right text-sm font-semibold text-[var(--d2b-text-primary)] pt-2">
              R${total.toFixed(2)}
            </div>
          </div>

          {/* Right: pagamento */}
          <div className="px-8 py-6">
            <div className="grid grid-cols-2 gap-4 mb-4">
              <div>
                <p className="text-xs text-[var(--d2b-text-muted)] mb-1">Vendedor</p>
                <div className="flex items-center gap-2 border border-[var(--d2b-border-strong)] rounded-md px-3 py-1.5 bg-[var(--d2b-bg-main)]">
                  <User size={12} className="text-[var(--d2b-text-muted)]" />
                  <span className="text-sm text-[var(--d2b-text-primary)]">{vendedor}</span>
                  <kbd className="text-[10px] text-[var(--d2b-text-muted)] ml-auto">F9</kbd>
                  <ChevronDown size={11} className="text-[var(--d2b-text-muted)]" />
                </div>
              </div>
              <div>
                <p className="text-xs text-[var(--d2b-text-muted)] mb-1">Depósito</p>
                <div className="relative">
                  <select className="w-full bg-[var(--d2b-bg-main)] border border-[var(--d2b-border-strong)] rounded-md px-3 py-1.5 text-sm text-[var(--d2b-text-primary)] appearance-none focus:outline-none">
                    <option>Padrão</option>
                  </select>
                  <ChevronDown size={12} className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none text-[var(--d2b-text-muted)]" />
                </div>
              </div>
            </div>
            <div className="grid grid-cols-3 gap-3 mb-5">
              <div>
                <p className="text-xs text-[var(--d2b-text-muted)] mb-1">Categoria</p>
                <div className="relative">
                  <select className="w-full bg-[var(--d2b-bg-main)] border border-[var(--d2b-border-strong)] rounded-md px-3 py-1.5 text-sm text-[var(--d2b-text-primary)] appearance-none focus:outline-none">
                    <option>Selecione</option>
                  </select>
                  <ChevronDown size={12} className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none text-[var(--d2b-text-muted)]" />
                </div>
              </div>
              <div>
                <p className="text-xs text-[var(--d2b-text-muted)] mb-1">Desconto</p>
                <input className="w-full bg-[var(--d2b-bg-main)] border border-[var(--d2b-border-strong)] rounded-md px-3 py-1.5 text-sm text-[var(--d2b-text-primary)] focus:outline-none" value={desconto} onChange={e => setDesconto(e.target.value)} />
                <p className="text-[10px] text-[var(--d2b-text-muted)] mt-0.5">Ex: 3,00 ou 10%</p>
              </div>
              <div>
                <p className="text-xs text-[var(--d2b-text-muted)] mb-1">Frete</p>
                <input className="w-full bg-[var(--d2b-bg-main)] border border-[var(--d2b-border-strong)] rounded-md px-3 py-1.5 text-sm text-[var(--d2b-text-primary)] focus:outline-none" defaultValue="0,00" />
              </div>
            </div>

            <button className="flex items-center gap-2 text-sm text-[#7C4DFF] hover:text-[#5B21B6] mb-5">
              <span className="w-5 h-5 rounded-full bg-[#7C4DFF] text-white flex items-center justify-center text-xs font-bold">+</span>
              adicionar recebimento <kbd className="text-[10px]">F4</kbd>
            </button>

            {/* Forma pagamento */}
            <div className="border border-[var(--d2b-border)] rounded-xl p-4 mb-4">
              <div className="flex items-center justify-between mb-3">
                <p className="text-sm font-semibold text-[var(--d2b-text-primary)]">$ {formaRecebimento} 1/1</p>
                <button className="text-[var(--d2b-text-muted)] hover:text-rose-400"><Trash2 size={13} /></button>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <p className="text-xs text-[var(--d2b-text-muted)] mb-1">Valor</p>
                  <input className="w-full bg-[var(--d2b-bg-main)] border border-[var(--d2b-border-strong)] rounded-md px-3 py-1.5 text-sm text-[var(--d2b-text-primary)] focus:outline-none" defaultValue={total.toFixed(2)} />
                </div>
                <div>
                  <p className="text-xs text-[var(--d2b-text-muted)] mb-1">Total recebido em dinheiro</p>
                  <div className="flex items-center border border-[var(--d2b-border-strong)] rounded-md px-2 py-1.5 bg-[var(--d2b-bg-main)]">
                    <span className="text-xs text-[var(--d2b-text-muted)] mr-1">R$</span>
                    <input className="flex-1 bg-transparent text-sm text-[var(--d2b-text-primary)] focus:outline-none" defaultValue={total.toFixed(2)} />
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Footer */}
      <div className="px-8 py-4 border-t border-[var(--d2b-border)] bg-[var(--d2b-bg-surface)] flex items-center justify-between">
        <div className="flex items-center gap-4">
          <button onClick={onFinalizar} className={BTN_PRIMARY}>
            finalizar venda <kbd className="text-[11px] ml-1 opacity-70">CTRL+ENTER</kbd>
          </button>
          <button className="text-sm text-[var(--d2b-text-secondary)] hover:text-[var(--d2b-text-primary)]">salvar para depois <kbd className="text-[10px]">F10</kbd></button>
        </div>
        <div className="flex items-center gap-6 text-sm text-[var(--d2b-text-muted)]">
          <span>troco <strong className="text-[var(--d2b-text-primary)]">R$0,00</strong></span>
          <span>total da venda <strong className="text-base text-[var(--d2b-text-primary)]">R${total.toFixed(2)}</strong></span>
        </div>
      </div>
    </div>
  )
}

// ─── Caixa Fechado ─────────────────────────────────────────────────────────────
function PDVFechado({ onAbrir }: { onAbrir: () => void }) {
  return (
    <div className="flex flex-col h-full">
      <div className="px-8 pt-6 pb-3">
        <h2 className="text-lg font-semibold text-[var(--d2b-text-primary)]">PDV</h2>
      </div>
      <div className="flex-1 flex flex-col items-center justify-center gap-6">
        <Relogio />
        <div className="flex flex-col items-center gap-3">
          <button
            onClick={onAbrir}
            className="px-12 py-4 rounded-xl text-base font-bold text-white bg-[#7C4DFF] hover:bg-[#5B21B6] transition-colors flex flex-col items-center gap-1 w-72"
          >
            abrir caixa
            <kbd className="text-xs font-normal opacity-80">CTRL+ENTER</kbd>
          </button>
          <button className="text-sm text-[#7C4DFF] hover:text-[#5B21B6]">ver detalhes do caixa</button>
        </div>
      </div>
    </div>
  )
}

// ─── Export ──────────────────────────────────────────────────────────────────
export function PDVContent() {
  const [caixa,    setCaixa]   = useState<CaixaState>('fechado')
  const [abertoAs, setAbertoAs] = useState('')
  const [itensFinalizando, setItensFinalizando] = useState<ItemVenda[]>([])
  const [clienteFinalizando, setClienteFinalizando] = useState('Consumidor Final')
  const [vendedorFinalizando, setVendedorFinalizando] = useState('Sem vendedor')

  const abrirCaixa = () => {
    const hora = new Date().toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })
    setAbertoAs(hora)
    setCaixa('aberto')
  }

  if (caixa === 'fechado') return <PDVFechado onAbrir={abrirCaixa} />
  if (caixa === 'aberto')  return (
    <PDVAberto
      abertoAs={abertoAs}
      onFinalizar={(itens, cliente, vendedor) => {
        setItensFinalizando(itens)
        setClienteFinalizando(cliente)
        setVendedorFinalizando(vendedor)
        setCaixa('finalizar')
      }}
    />
  )
  return (
    <PDVFinalizar
      itens={itensFinalizando}
      cliente={clienteFinalizando}
      vendedor={vendedorFinalizando}
      onBack={() => setCaixa('aberto')}
      onFinalizar={() => setCaixa('aberto')}
    />
  )
}
