'use client'

import { useState } from 'react'
import {
  Search, Plus, MoreHorizontal, ChevronDown, Trash2,
  Send, Copy, Check,
} from 'lucide-react'

// ─── Shared styles ───────────────────────────────────────────────────────────
const INP =
  'w-full bg-[var(--d2b-bg-main)] border border-[var(--d2b-border-strong)] rounded-md ' +
  'px-3 py-2 text-sm text-[var(--d2b-text-primary)] placeholder:text-[var(--d2b-text-muted)] ' +
  'focus:outline-none focus:border-[#7C4DFF] transition-colors'
const SEL =
  'w-full bg-[var(--d2b-bg-main)] border border-[var(--d2b-border-strong)] rounded-md ' +
  'px-3 py-2 text-sm text-[var(--d2b-text-primary)] focus:outline-none focus:border-[#7C4DFF] transition-colors appearance-none'
const LBL = 'block text-xs text-[var(--d2b-text-secondary)] mb-1'
const BTN_PRIMARY =
  'flex items-center gap-2 px-4 py-2.5 rounded-full text-sm font-bold text-white bg-[#7C4DFF] hover:bg-[#5B21B6] transition-colors'
const BTN_OUTLINE =
  'flex items-center gap-2 px-3 py-1.5 rounded-md text-sm font-medium border border-[var(--d2b-border-strong)] ' +
  'text-[var(--d2b-text-secondary)] hover:border-[#7C4DFF] hover:text-[var(--d2b-text-primary)] bg-transparent transition-colors'
const TH = 'text-left px-3 py-3 text-xs font-semibold text-[var(--d2b-text-secondary)] uppercase tracking-wider whitespace-nowrap'

// ─── Types ───────────────────────────────────────────────────────────────────
type Situacao = 'Aberta' | 'Aceita' | 'Recusada' | 'Expirada' | 'Convertida'
type ItemProposta = { id: string; descricao: string; qtd: number; precoUn: number; desconto: number }
type Proposta = {
  id: string
  numero: string
  cliente: string
  valor: number
  situacao: Situacao
  validade: string
  criacao: string
}

const SITUACAO_COLORS: Record<Situacao, string> = {
  Aberta:     'bg-blue-500/10 text-blue-400',
  Aceita:     'bg-emerald-500/10 text-emerald-400',
  Recusada:   'bg-rose-500/10 text-rose-400',
  Expirada:   'bg-[var(--d2b-bg-elevated)] text-[var(--d2b-text-muted)]',
  Convertida: 'bg-purple-500/10 text-purple-400',
}

const MOCK: Proposta[] = [
  { id: '1', numero: 'P-0001', cliente: 'BS TECNOLOGIA LTDA', valor: 1500.00, situacao: 'Aberta',  validade: '14/04/2026', criacao: '07/04/2026' },
  { id: '2', numero: 'P-0002', cliente: 'JESSE',              valor: 320.50,  situacao: 'Aceita',  validade: '21/04/2026', criacao: '07/04/2026' },
]

const STATUS_TABS = ['todas', 'abertas', 'aceitas', 'recusadas', 'expiradas']

// ─── Formulário de Proposta ────────────────────────────────────────────────────
function PropostaForm({
  proposta,
  onBack,
}: {
  proposta?: Proposta
  onBack: () => void
}) {
  const [cliente,    setCliente]    = useState(proposta?.cliente ?? '')
  const [validade,   setValidade]   = useState(proposta?.validade ?? '')
  const [observacao, setObservacao] = useState('')
  const [itens,      setItens]      = useState<ItemProposta[]>([])
  const [showDropdown, setShowDropdown] = useState(false)

  const addItem = () =>
    setItens(prev => [...prev, { id: String(Date.now()), descricao: 'Produto', qtd: 1, precoUn: 0, desconto: 0 }])

  const total = itens.reduce((s, i) => s + i.qtd * i.precoUn * (1 - i.desconto / 100), 0)

  return (
    <div className="flex flex-col h-full">
      {/* Header */}
      <div className="flex items-center justify-between px-8 pt-5 pb-3 border-b border-[var(--d2b-border)]">
        <div className="flex items-center gap-3">
          <button onClick={onBack} className="text-xs text-[var(--d2b-text-muted)] hover:text-[var(--d2b-text-primary)]">← voltar</button>
          <span className="text-xs text-[var(--d2b-text-muted)]">início ≡ vendas propostas comerciais</span>
        </div>
        <div className="flex items-center gap-2">
          <button className={BTN_OUTLINE}><Send size={13} /> enviar</button>
          <div className="relative">
            <button onClick={() => setShowDropdown(v => !v)} className={BTN_OUTLINE}><MoreHorizontal size={13} /></button>
            {showDropdown && (
              <div className="absolute right-0 top-full mt-1 w-44 bg-[var(--d2b-bg-elevated)] border border-[var(--d2b-border)] rounded-xl shadow-lg z-20 py-1">
                {['duplicar','incluir pedido de venda','imprimir','excluir'].map(a => (
                  <button key={a} className="w-full text-left px-4 py-2 text-sm text-[var(--d2b-text-secondary)] hover:bg-[var(--d2b-hover)]">{a}</button>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto px-8 py-6">
        <h2 className="text-xl font-semibold text-[var(--d2b-text-primary)] mb-6">
          {proposta ? `Proposta ${proposta.numero}` : 'Nova Proposta Comercial'}
        </h2>

        {/* Dados principais */}
        <div className="grid grid-cols-3 gap-4 mb-6">
          <div>
            <label className={LBL}>Cliente</label>
            <div className="flex items-center gap-1.5 border border-[var(--d2b-border-strong)] rounded-md bg-[var(--d2b-bg-main)] px-3 h-10">
              <input className="flex-1 bg-transparent text-sm text-[var(--d2b-text-primary)] placeholder:text-[var(--d2b-text-muted)] outline-none" placeholder="Buscar cliente..." value={cliente} onChange={e => setCliente(e.target.value)} />
              <Search size={13} className="text-[var(--d2b-text-muted)]" />
            </div>
          </div>
          <div>
            <label className={LBL}>Validade</label>
            <input type="date" className={INP} value={validade} onChange={e => setValidade(e.target.value)} />
          </div>
          <div>
            <label className={LBL}>Situação</label>
            <div className="relative">
              <select className={SEL}>
                <option>Aberta</option><option>Aceita</option><option>Recusada</option>
              </select>
              <ChevronDown size={13} className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none text-[var(--d2b-text-muted)]" />
            </div>
          </div>
        </div>

        {/* Itens */}
        <div className="mb-6">
          <h3 className="text-sm font-semibold text-[var(--d2b-text-primary)] mb-3">Itens da proposta</h3>
          <table className="w-full text-sm mb-3">
            <thead>
              <tr className="border-b border-[var(--d2b-border)]">
                <th className={TH}>Descrição</th>
                <th className={TH + ' text-right'}>Qtd</th>
                <th className={TH + ' text-right'}>Preço un</th>
                <th className={TH + ' text-right'}>Desc %</th>
                <th className={TH + ' text-right'}>Total</th>
                <th className="w-8" />
              </tr>
            </thead>
            <tbody>
              {itens.length === 0 ? (
                <tr><td colSpan={6} className="px-3 py-8 text-center text-sm text-[var(--d2b-text-muted)]">Nenhum item adicionado.</td></tr>
              ) : itens.map(i => (
                <tr key={i.id} className="border-b border-[var(--d2b-border)]">
                  <td className="px-3 py-2"><input className={INP + ' py-1'} value={i.descricao} onChange={e => setItens(prev => prev.map(x => x.id === i.id ? { ...x, descricao: e.target.value } : x))} /></td>
                  <td className="px-3 py-2 w-20"><input className={INP + ' py-1 text-right'} type="number" value={i.qtd} onChange={e => setItens(prev => prev.map(x => x.id === i.id ? { ...x, qtd: Number(e.target.value) } : x))} /></td>
                  <td className="px-3 py-2 w-28"><input className={INP + ' py-1 text-right'} type="number" value={i.precoUn} onChange={e => setItens(prev => prev.map(x => x.id === i.id ? { ...x, precoUn: Number(e.target.value) } : x))} /></td>
                  <td className="px-3 py-2 w-20"><input className={INP + ' py-1 text-right'} type="number" value={i.desconto} onChange={e => setItens(prev => prev.map(x => x.id === i.id ? { ...x, desconto: Number(e.target.value) } : x))} /></td>
                  <td className="px-3 py-2 text-right text-[var(--d2b-text-primary)] font-medium">R${(i.qtd * i.precoUn * (1 - i.desconto / 100)).toFixed(2)}</td>
                  <td className="px-3 py-2"><button onClick={() => setItens(prev => prev.filter(x => x.id !== i.id))} className="text-[var(--d2b-text-muted)] hover:text-rose-400"><Trash2 size={13} /></button></td>
                </tr>
              ))}
            </tbody>
          </table>
          <button onClick={addItem} className="flex items-center gap-1.5 text-sm text-[#7C4DFF] hover:text-[#5B21B6]"><Plus size={13} />adicionar item</button>

          {itens.length > 0 && (
            <div className="text-right mt-3 text-sm font-semibold text-[var(--d2b-text-primary)]">
              Total: R${total.toFixed(2)}
            </div>
          )}
        </div>

        {/* Observação */}
        <div className="mb-6">
          <label className={LBL}>Observações</label>
          <textarea className="w-full bg-[var(--d2b-bg-main)] border border-[var(--d2b-border-strong)] rounded-md px-3 py-2 text-sm text-[var(--d2b-text-primary)] focus:outline-none focus:border-[#7C4DFF] transition-colors resize-none" rows={3} value={observacao} onChange={e => setObservacao(e.target.value)} />
        </div>
      </div>

      <div className="px-8 py-5 border-t border-[var(--d2b-border)] bg-[var(--d2b-bg-surface)] flex items-center gap-3">
        <button onClick={onBack} className={BTN_PRIMARY}>salvar</button>
        <button onClick={onBack} className="text-sm text-[var(--d2b-text-secondary)] hover:text-[var(--d2b-text-primary)]">cancelar</button>
      </div>
    </div>
  )
}

// ─── Lista de Propostas ───────────────────────────────────────────────────────
function PropostaLista({
  propostas,
  onNova,
  onDetalhe,
}: {
  propostas: Proposta[]
  onNova: () => void
  onDetalhe: (p: Proposta) => void
}) {
  const [busca, setBusca] = useState('')
  const [aba,   setAba]   = useState('todas')

  const filtradas = propostas.filter(p =>
    !busca || p.cliente.toLowerCase().includes(busca.toLowerCase()) || p.numero.includes(busca)
  )

  return (
    <div className="flex flex-col h-full">
      <div className="flex items-center justify-between px-8 pt-6 pb-2">
        <div className="text-xs text-[var(--d2b-text-muted)]">início ≡ vendas propostas comerciais</div>
        <button onClick={onNova} className={BTN_PRIMARY}><Plus size={13} />nova proposta</button>
      </div>
      <div className="px-8 pb-0">
        <h2 className="text-xl font-semibold text-[var(--d2b-text-primary)] mb-4">Propostas Comerciais</h2>
        <div className="flex items-center gap-2 mb-3">
          <div className="flex items-center gap-1.5 border border-[var(--d2b-border-strong)] rounded-md bg-[var(--d2b-bg-main)] px-3 h-9 w-64">
            <input className="flex-1 bg-transparent text-sm text-[var(--d2b-text-primary)] placeholder:text-[var(--d2b-text-muted)] outline-none" placeholder="Buscar por cliente ou número..." value={busca} onChange={e => setBusca(e.target.value)} />
            <Search size={13} className="text-[var(--d2b-text-muted)]" />
          </div>
        </div>
        <div className="flex border-b border-[var(--d2b-border)]">
          {STATUS_TABS.map(t => (
            <button key={t} onClick={() => setAba(t)} className={`px-4 py-2.5 text-sm border-b-2 transition-colors whitespace-nowrap ${aba === t ? 'border-[#7C4DFF] text-[#7C4DFF] font-semibold' : 'border-transparent text-[var(--d2b-text-muted)] hover:text-[var(--d2b-text-primary)]'}`}>
              {t}
            </button>
          ))}
        </div>
      </div>

      <div className="flex-1 overflow-y-auto px-8">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-[var(--d2b-border)]">
              <th className={TH}>Número</th>
              <th className={TH}>Cliente</th>
              <th className={TH + ' text-right'}>Valor</th>
              <th className={TH}>Situação</th>
              <th className={TH}>Validade</th>
              <th className={TH}>Criação</th>
              <th className="w-8" />
            </tr>
          </thead>
          <tbody>
            {filtradas.map(p => (
              <tr key={p.id} onClick={() => onDetalhe(p)} className="border-b border-[var(--d2b-border)] hover:bg-[var(--d2b-hover)] cursor-pointer transition-colors">
                <td className="px-3 py-3 text-[#7C4DFF] font-medium">{p.numero}</td>
                <td className="px-3 py-3 text-[var(--d2b-text-primary)]">{p.cliente}</td>
                <td className="px-3 py-3 text-right text-[var(--d2b-text-primary)] font-semibold">R${p.valor.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</td>
                <td className="px-3 py-3">
                  <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${SITUACAO_COLORS[p.situacao]}`}>{p.situacao}</span>
                </td>
                <td className="px-3 py-3 text-[var(--d2b-text-secondary)]">{p.validade}</td>
                <td className="px-3 py-3 text-[var(--d2b-text-secondary)]">{p.criacao}</td>
                <td className="px-3 py-3"><MoreHorizontal size={14} className="text-[var(--d2b-text-muted)]" /></td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className="px-8 py-3 border-t border-[var(--d2b-border)] text-xs text-[var(--d2b-text-muted)]">
        {filtradas.length} proposta{filtradas.length !== 1 ? 's' : ''}
      </div>
    </div>
  )
}

// ─── Export ──────────────────────────────────────────────────────────────────
export function PropostaComercialContent() {
  const [propostas,   setPropostas]   = useState<Proposta[]>(MOCK)
  const [editando,    setEditando]    = useState<Proposta | 'nova' | null>(null)

  if (editando === 'nova')
    return <PropostaForm onBack={() => setEditando(null)} />
  if (editando)
    return <PropostaForm proposta={editando} onBack={() => setEditando(null)} />

  return (
    <PropostaLista
      propostas={propostas}
      onNova={() => setEditando('nova')}
      onDetalhe={setEditando}
    />
  )
}
