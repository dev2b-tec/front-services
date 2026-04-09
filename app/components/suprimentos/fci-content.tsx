'use client'

import { useState } from 'react'
import {
  Search, X, Plus, Trash2, Settings, Calendar,
  AlertCircle, ChevronDown,
} from 'lucide-react'

// ─── Shared styles ──────────────────────────────────────────────────────────
const INP =
  'w-full bg-[var(--d2b-bg-main)] border border-[var(--d2b-border-strong)] rounded-md ' +
  'px-3 py-2 text-sm text-[var(--d2b-text-primary)] placeholder:text-[var(--d2b-text-muted)] ' +
  'focus:outline-none focus:border-[#7C4DFF] transition-colors'

const SEL =
  'w-full bg-[var(--d2b-bg-main)] border border-[var(--d2b-border-strong)] rounded-md ' +
  'px-3 py-2 text-sm text-[var(--d2b-text-primary)] ' +
  'focus:outline-none focus:border-[#7C4DFF] transition-colors appearance-none'

const LBL = 'block text-xs text-[var(--d2b-text-secondary)] mb-1'

const BTN_PRIMARY =
  'flex items-center gap-2 px-4 py-2.5 rounded-full text-sm font-bold text-white bg-[#7C4DFF] hover:bg-[#5B21B6] transition-colors'

const BTN_OUTLINE =
  'flex items-center gap-2 px-4 py-2 rounded-md text-sm font-medium border border-[var(--d2b-border-strong)] ' +
  'text-[var(--d2b-text-secondary)] hover:border-[#7C4DFF] hover:text-[var(--d2b-text-primary)] bg-transparent transition-colors'

const TH = 'text-left px-3 py-3 text-xs font-semibold text-[var(--d2b-text-secondary)] uppercase tracking-wider whitespace-nowrap'

// ─── Types ──────────────────────────────────────────────────────────────────
type ItemFCI = {
  id: string
  descricao: string
  codigo: string
  ncm: string
  un: string
  valorSaida: number
  gtin: string
  valorParcela: string
  conteudoImportacao: string
  codigoFCI: string
}

type FCIRecord = {
  id: string
  protocoloRecepcao: string
  periodo: string
  itens: ItemFCI[]
  erros: string[]
}

type Tela = 'lista' | 'form'

// ─── Mock ─────────────────────────────────────────────────────────────────────
const MOCK_FCI_EMPTY: FCIRecord = {
  id: '1',
  protocoloRecepcao: '',
  periodo: 'Abril',
  itens: [],
  erros: [],
}

const UN_OPTIONS = ['ampère(s) - (A)', 'grama(s) - (G)', 'kilograma(s) - (KG)', 'metro(s) - (M)', 'unidade(s) - (UN)', 'litro(s) - (L)']

// ═══════════════════════════════════════════════════════════════════════════
// DRAWER — Item da FCI
// ═══════════════════════════════════════════════════════════════════════════
function DrawerItemFCI({
  item,
  onClose,
  onSalvar,
}: {
  item?: ItemFCI
  onClose: () => void
  onSalvar: (item: ItemFCI) => void
}) {
  const [descricao,          setDescricao]          = useState(item?.descricao          ?? '')
  const [codigo,             setCodigo]             = useState(item?.codigo             ?? '')
  const [ncm,                setNcm]                = useState(item?.ncm                ?? '')
  const [un,                 setUn]                 = useState(item?.un                 ?? UN_OPTIONS[0])
  const [valorSaida,         setValorSaida]         = useState(String(item?.valorSaida  ?? ''))
  const [gtin,               setGtin]               = useState(item?.gtin               ?? '')
  const [valorParcela,       setValorParcela]       = useState(item?.valorParcela       ?? '')
  const [conteudoImportacao, setConteudoImportacao] = useState(item?.conteudoImportacao ?? '')
  const [codigoFCI,          setCodigoFCI]          = useState(item?.codigoFCI          ?? '')

  return (
    <div className="fixed inset-0 z-40 flex">
      <div className="flex-1 bg-black/30" onClick={onClose} />
      <div className="w-[480px] bg-[var(--d2b-bg-elevated)] border-l border-[var(--d2b-border)] flex flex-col h-full shadow-2xl">
        <div className="flex items-center justify-between px-6 py-4 border-b border-[var(--d2b-border)]">
          <h3 className="text-base font-semibold text-[var(--d2b-text-primary)]">Item da FCI</h3>
          <button onClick={onClose} className="text-sm text-[var(--d2b-text-secondary)] hover:text-[var(--d2b-text-primary)] transition-colors">
            fechar ×
          </button>
        </div>

        <div className="flex-1 overflow-y-auto px-6 py-5 flex flex-col gap-4">
          {/* Row 1: Descrição + Código */}
          <div className="grid grid-cols-3 gap-3">
            <div className="col-span-2">
              <label className={LBL}>Descrição</label>
              <input className={INP} value={descricao} onChange={e => setDescricao(e.target.value)} />
            </div>
            <div>
              <label className={LBL}>Código</label>
              <input className={INP} value={codigo} onChange={e => setCodigo(e.target.value)} />
            </div>
          </div>

          {/* Row 2: NCM + UN + Valor saída */}
          <div className="grid grid-cols-3 gap-3">
            <div>
              <label className={LBL}>NCM</label>
              <input className={INP} value={ncm} onChange={e => setNcm(e.target.value)} />
            </div>
            <div>
              <label className={LBL}>UN</label>
              <div className="relative">
                <select className={SEL} value={un} onChange={e => setUn(e.target.value)}>
                  {UN_OPTIONS.map(o => <option key={o}>{o}</option>)}
                </select>
                <ChevronDown size={13} className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none text-[var(--d2b-text-muted)]" />
              </div>
            </div>
            <div>
              <label className={LBL}>Valor saída</label>
              <input className={INP} type="number" value={valorSaida} onChange={e => setValorSaida(e.target.value)} />
            </div>
          </div>

          {/* Row 3: GTIN + Valor parcela + Conteúdo importação % */}
          <div className="grid grid-cols-3 gap-3">
            <div>
              <label className={LBL}>GTIN</label>
              <input className={INP} value={gtin} onChange={e => setGtin(e.target.value)} />
            </div>
            <div>
              <label className={LBL}>Valor parcela</label>
              <input className={INP} type="number" value={valorParcela} onChange={e => setValorParcela(e.target.value)} />
            </div>
            <div>
              <label className={LBL}>Conteúdo importação %</label>
              <input className={INP} type="number" value={conteudoImportacao} onChange={e => setConteudoImportacao(e.target.value)} />
            </div>
          </div>

          {/* Código FCI */}
          <div>
            <label className={LBL}>Código FCI</label>
            <input className={INP} value={codigoFCI} onChange={e => setCodigoFCI(e.target.value)} />
            <p className="text-xs text-[var(--d2b-text-muted)] mt-1">Esse código é obtido após o envio da FCI.</p>
          </div>
        </div>

        <div className="px-6 py-4 border-t border-[var(--d2b-border)] flex items-center gap-3">
          <button
            onClick={() => onSalvar({ id: item?.id ?? String(Date.now()), descricao, codigo, ncm, un, valorSaida: Number(valorSaida), gtin, valorParcela, conteudoImportacao, codigoFCI })}
            className={BTN_PRIMARY}
          >
            salvar
          </button>
          <button onClick={onClose} className="text-sm text-[var(--d2b-text-secondary)] hover:text-[var(--d2b-text-primary)] transition-colors">
            cancelar
          </button>
        </div>
      </div>
    </div>
  )
}

// ═══════════════════════════════════════════════════════════════════════════
// FORMULÁRIO FCI
// ═══════════════════════════════════════════════════════════════════════════
function FCIForm({
  fci,
  onBack,
}: {
  fci: FCIRecord
  onBack: () => void
}) {
  const [protocolo,   setProtocolo]   = useState(fci.protocoloRecepcao)
  const [itens,       setItens]       = useState<ItemFCI[]>(fci.itens)
  const [erros,       setErros]       = useState<string[]>(fci.erros)
  const [editItem,    setEditItem]    = useState<ItemFCI | undefined>()
  const [drawerOpen,  setDrawerOpen]  = useState(false)

  const salvarItem = (item: ItemFCI) => {
    setItens(prev => {
      const idx = prev.findIndex(i => i.id === item.id)
      return idx >= 0 ? prev.map(i => i.id === item.id ? item : i) : [...prev, item]
    })
    setDrawerOpen(false)
    setEditItem(undefined)
  }

  const removerItem = (id: string) => setItens(prev => prev.filter(i => i.id !== id))

  const handleSalvar = () => {
    const novosErros: string[] = []
    itens.forEach(i => {
      if (!i.un)                novosErros.push(`O campo un do produto '${i.descricao}' não pode ser vazio!`)
      if (!i.valorParcela)      novosErros.push(`O campo Valor parcela do produto '${i.descricao}' não pode ser vazio!`)
      if (!i.conteudoImportacao)novosErros.push(`O campo Conteúdo importação do produto '${i.descricao}' não pode ser vazio!`)
    })
    setErros(novosErros)
    if (novosErros.length === 0) onBack()
  }

  return (
    <div className="flex flex-col h-full">
      {/* Header */}
      <div className="flex items-center justify-between gap-3 px-8 pt-6 pb-3">
        <div className="flex items-center gap-3">
          <button onClick={onBack} className="text-xs text-[var(--d2b-text-muted)] hover:text-[var(--d2b-text-primary)] flex items-center gap-1 transition-colors">
            ← voltar
          </button>
          <span className="text-xs text-[var(--d2b-text-muted)]">/</span>
          <span className="text-xs text-[var(--d2b-text-muted)]">início</span>
          <span className="text-xs text-[var(--d2b-text-muted)]">≡ suprimentos</span>
          <span className="text-xs text-[var(--d2b-text-secondary)]">fci</span>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto px-8 pb-8 max-w-4xl">
        <h2 className="text-xl font-semibold text-[var(--d2b-text-primary)] mb-6 pb-4 border-b border-[var(--d2b-border)]">FCI</h2>

        {/* Errors */}
        {erros.length > 0 && (
          <div className="flex items-start gap-3 p-4 rounded-xl border border-rose-500/30 bg-rose-500/5 mb-6">
            <AlertCircle size={16} className="text-rose-500 shrink-0 mt-0.5" />
            <div>
              <p className="text-sm font-semibold text-[var(--d2b-text-primary)] mb-1">Não foi possível salvar a FCI</p>
              <ul className="list-disc list-inside space-y-0.5">
                {erros.map((e, i) => (
                  <li key={i} className="text-xs text-[var(--d2b-text-secondary)]">{e}</li>
                ))}
              </ul>
            </div>
          </div>
        )}

        {/* Protocolo */}
        <div className="mb-6 pb-6 border-b border-[var(--d2b-border)]">
          <label className={LBL}>Protocolo de recepção</label>
          <input
            className="w-full max-w-md bg-[var(--d2b-bg-main)] border border-[var(--d2b-border-strong)] rounded-md px-3 py-2 text-sm text-[var(--d2b-text-primary)] focus:outline-none focus:border-[#7C4DFF] transition-colors"
            value={protocolo}
            onChange={e => setProtocolo(e.target.value)}
          />
          <p className="text-xs text-[var(--d2b-text-muted)] mt-1">
            O protocolo de recepção é obtido após o envio da FCI. Seu preenchimento não é obrigatório
          </p>
        </div>

        {/* Mercadorias */}
        <div>
          <h3 className="text-base font-semibold text-[var(--d2b-text-primary)] mb-4">Mercadorias</h3>
          <table className="w-full text-sm mb-3">
            <thead>
              <tr className="border-b border-[var(--d2b-border)]">
                <th className={TH}>Nome</th>
                <th className={TH}>Cód</th>
                <th className={TH}>NCM</th>
                <th className={TH + ' text-right'}>Valor saída</th>
                <th className={TH}>Ação</th>
              </tr>
            </thead>
            <tbody>
              {itens.length === 0 ? (
                <tr>
                  <td colSpan={5} className="px-3 py-8 text-center text-sm text-[var(--d2b-text-muted)]">
                    Nenhum item adicionado.
                  </td>
                </tr>
              ) : itens.map(i => (
                <tr key={i.id} className="border-b border-[var(--d2b-border)] hover:bg-[var(--d2b-hover)] transition-colors">
                  <td className="px-3 py-3 text-[var(--d2b-text-primary)]">{i.descricao}</td>
                  <td className="px-3 py-3 text-[var(--d2b-text-secondary)]">{i.codigo}</td>
                  <td className="px-3 py-3 text-[var(--d2b-text-secondary)]">{i.ncm}</td>
                  <td className="px-3 py-3 text-right text-[var(--d2b-text-secondary)]">{Number(i.valorSaida).toFixed(2)}</td>
                  <td className="px-3 py-3">
                    <div className="flex items-center gap-3">
                      <button
                        onClick={() => { setEditItem(i); setDrawerOpen(true) }}
                        className="text-xs text-[#7C4DFF] hover:text-[#5B21B6] transition-colors"
                      >
                        editar
                      </button>
                      <button
                        onClick={() => removerItem(i.id)}
                        className="text-[var(--d2b-text-muted)] hover:text-rose-400 transition-colors"
                      >
                        <Trash2 size={13} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>

          <button
            onClick={() => { setEditItem(undefined); setDrawerOpen(true) }}
            className="flex items-center gap-1.5 text-sm text-[#7C4DFF] hover:text-[#5B21B6] transition-colors"
          >
            <Plus size={13} />
            adicionar item
          </button>
        </div>
      </div>

      {/* Footer */}
      <div className="px-8 py-5 border-t border-[var(--d2b-border)] bg-[var(--d2b-bg-surface)] flex items-center gap-3">
        <button onClick={handleSalvar} className={BTN_PRIMARY}>salvar</button>
        <button onClick={onBack} className="text-sm text-[var(--d2b-text-secondary)] hover:text-[var(--d2b-text-primary)] transition-colors">
          cancelar
        </button>
      </div>

      {drawerOpen && (
        <DrawerItemFCI
          item={editItem}
          onClose={() => { setDrawerOpen(false); setEditItem(undefined) }}
          onSalvar={salvarItem}
        />
      )}
    </div>
  )
}

// ═══════════════════════════════════════════════════════════════════════════
// LISTA FCI
// ═══════════════════════════════════════════════════════════════════════════
function FCILista({ onNova }: { onNova: () => void }) {
  const [periodo, setPeriodo] = useState('Abril')

  return (
    <div className="flex flex-col h-full">
      {/* Top bar */}
      <div className="flex items-center justify-between gap-3 px-8 pt-6 pb-3 flex-wrap">
        <div className="text-xs text-[var(--d2b-text-muted)]">início ≡ suprimentos fci</div>
        <div className="flex items-center gap-2">
          <button className={BTN_OUTLINE}>
            <Settings size={13} />
            configurações
          </button>
          <button onClick={onNova} className={BTN_PRIMARY}>
            <Plus size={13} />
            incluir FCI
          </button>
        </div>
      </div>

      <div className="px-8 pb-4">
        <h2 className="text-xl font-semibold text-[var(--d2b-text-primary)] mb-4">Fichas de controle de importação</h2>

        {/* Filtro de período */}
        <div className="flex items-center gap-2">
          <button className="flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs border border-[var(--d2b-border-strong)] text-[var(--d2b-text-secondary)] hover:border-[#7C4DFF] transition-colors">
            <Calendar size={12} />
            {periodo}
          </button>
          <button
            onClick={() => setPeriodo('')}
            className="flex items-center gap-1 text-xs text-[var(--d2b-text-muted)] hover:text-[var(--d2b-text-primary)] transition-colors"
          >
            <X size={11} />
            limpar filtros
          </button>
        </div>
      </div>

      {/* Empty state */}
      <div className="flex-1 flex items-center justify-center px-8">
        <div className="border border-[var(--d2b-border)] border-orange-400/40 rounded-2xl p-12 flex flex-col items-center gap-4 max-w-sm w-full bg-orange-500/5">
          {/* Mascot placeholder */}
          <div className="w-20 h-20 rounded-full bg-[var(--d2b-bg-elevated)] border border-[var(--d2b-border)] flex items-center justify-center">
            <Search size={28} className="text-[var(--d2b-text-muted)]" />
          </div>
          <div className="text-center">
            <p className="text-sm font-semibold text-[var(--d2b-text-primary)] mb-1">Sua pesquisa não retornou resultados.</p>
            <p className="text-xs text-[var(--d2b-text-secondary)]">Tente outras opções de períodos ou remova os filtros.</p>
          </div>
          <button
            onClick={() => setPeriodo('')}
            className={BTN_PRIMARY}
          >
            limpar filtros
          </button>
        </div>
      </div>
    </div>
  )
}

// ═══════════════════════════════════════════════════════════════════════════
// EXPORT
// ═══════════════════════════════════════════════════════════════════════════
export function FCIContent() {
  const [tela, setTela] = useState<Tela>('lista')

  if (tela === 'form')
    return <FCIForm fci={MOCK_FCI_EMPTY} onBack={() => setTela('lista')} />

  return <FCILista onNova={() => setTela('form')} />
}
