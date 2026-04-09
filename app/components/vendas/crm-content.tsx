'use client'

import { useState } from 'react'
import {
  Search, Star, MoreHorizontal, ChevronDown, Plus,
  Check, X, Archive, Trash2,
} from 'lucide-react'

// ─── Shared styles ───────────────────────────────────────────────────────────
const INP =
  'w-full bg-[var(--d2b-bg-main)] border border-[var(--d2b-border-strong)] rounded-md ' +
  'px-3 py-2 text-sm text-[var(--d2b-text-primary)] placeholder:text-[var(--d2b-text-muted)] ' +
  'focus:outline-none focus:border-[#7C4DFF] transition-colors'
const LBL = 'block text-xs text-[var(--d2b-text-secondary)] mb-1'
const BTN_PRIMARY =
  'flex items-center gap-2 px-4 py-2.5 rounded-full text-sm font-bold text-white bg-[#7C4DFF] hover:bg-[#5B21B6] transition-colors'
const BTN_OUTLINE =
  'flex items-center gap-2 px-3 py-1.5 rounded-md text-sm font-medium border border-[var(--d2b-border-strong)] ' +
  'text-[var(--d2b-text-secondary)] hover:border-[#7C4DFF] hover:text-[var(--d2b-text-primary)] bg-transparent transition-colors'
const TH = 'text-left px-3 py-3 text-xs font-semibold text-[var(--d2b-text-secondary)] uppercase tracking-wider whitespace-nowrap'

// ─── Types ───────────────────────────────────────────────────────────────────
type Estagio = 'Prospecção' | 'Contato realizado' | 'Proposta apresentada' | 'Negociação' | 'Encerrado'
type Assunto = {
  id: string
  cliente: string
  assunto: string
  estagio: Estagio
  proximaAcao: string
  quando: string
  starred: boolean
}

const ESTAGIOS: Estagio[] = [
  'Prospecção', 'Contato realizado', 'Proposta apresentada', 'Negociação', 'Encerrado',
]

const MOCK: Assunto[] = [
  { id: '1', cliente: 'BS TECNOLOGIA LTDA', assunto: 'TESTE',  estagio: 'Prospecção', proximaAcao: '', quando: '', starred: false },
  { id: '2', cliente: 'JESSE',              assunto: 'Teste',  estagio: 'Negociação', proximaAcao: '', quando: '', starred: false },
]

const ABA_TABS = ['todos', 'com ações pendentes', 'encerrados', 'com estrela', 'arquivados']

// ─── Drawer Incluir / Editar Assunto ────────────────────────────────────────
function DrawerAssunto({
  assunto,
  onClose,
  onSalvar,
}: {
  assunto?: Assunto
  onClose: () => void
  onSalvar: (a: Assunto) => void
}) {
  const [cliente,  setCliente]  = useState(assunto?.cliente  ?? '')
  const [titulo,   setTitulo]   = useState(assunto?.assunto  ?? '')
  const [estagio,  setEstagio]  = useState<Estagio>(assunto?.estagio ?? 'Prospecção')
  const [expanded, setExpanded] = useState(!!assunto)

  return (
    <div className="fixed inset-0 z-40 flex">
      <div className="flex-1 bg-black/30" onClick={onClose} />
      <div className="w-[480px] bg-[var(--d2b-bg-elevated)] border-l border-[var(--d2b-border)] flex flex-col h-full shadow-2xl">
        <div className="flex items-center justify-between px-6 py-4 border-b border-[var(--d2b-border)]">
          <h3 className="text-base font-semibold text-[var(--d2b-text-primary)]">Assunto</h3>
          <button onClick={onClose} className="text-sm text-[var(--d2b-text-secondary)] hover:text-[var(--d2b-text-primary)]">fechar ×</button>
        </div>
        <div className="flex-1 overflow-y-auto px-6 py-5 flex flex-col gap-4">
          <div>
            <label className={LBL}>Cliente</label>
            <div className="flex items-center gap-1.5 border border-[var(--d2b-border-strong)] rounded-md bg-[var(--d2b-bg-main)] px-3 h-10">
              <input
                className="flex-1 bg-transparent text-sm text-[var(--d2b-text-primary)] placeholder:text-[var(--d2b-text-muted)] outline-none"
                value={cliente} onChange={e => setCliente(e.target.value)}
              />
              <Search size={13} className="text-[var(--d2b-text-muted)]" />
              <Plus size={13} className="text-[var(--d2b-text-muted)] cursor-pointer" />
            </div>
          </div>
          <div>
            <label className={LBL}>Título do assunto</label>
            <input className={INP} value={titulo} onChange={e => setTitulo(e.target.value)} />
          </div>
          {!expanded && (
            <button onClick={() => setExpanded(true)} className="text-sm text-[#7C4DFF] hover:text-[#5B21B6] text-left">+ mais detalhes</button>
          )}
          {expanded && (
            <div>
              <label className={LBL}>Estágio do assunto</label>
              <div className="relative">
                <select
                  className="w-full bg-[var(--d2b-bg-main)] border border-[var(--d2b-border-strong)] rounded-md px-3 py-2 text-sm text-[var(--d2b-text-primary)] focus:outline-none focus:border-[#7C4DFF] transition-colors appearance-none"
                  value={estagio} onChange={e => setEstagio(e.target.value as Estagio)}
                >
                  {ESTAGIOS.map(e => <option key={e}>{e}</option>)}
                </select>
                <ChevronDown size={13} className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none text-[var(--d2b-text-muted)]" />
              </div>
            </div>
          )}
        </div>
        <div className="px-6 py-4 border-t border-[var(--d2b-border)] flex items-center gap-3">
          <button
            onClick={() => onSalvar({ id: assunto?.id ?? String(Date.now()), cliente, assunto: titulo, estagio, proximaAcao: '', quando: '', starred: assunto?.starred ?? false })}
            className={BTN_PRIMARY}
          >salvar</button>
          <button onClick={onClose} className="text-sm text-[var(--d2b-text-secondary)] hover:text-[var(--d2b-text-primary)]">cancelar</button>
        </div>
      </div>
    </div>
  )
}

// ─── Detalhe do Assunto ──────────────────────────────────────────────────────
function CRMDetalhe({
  assunto,
  onBack,
  onAtualizar,
}: {
  assunto: Assunto
  onBack: () => void
  onAtualizar: (a: Assunto) => void
}) {
  const [estagio,      setEstagio]      = useState<Estagio>(assunto.estagio)
  const [proximaAcao,  setProximaAcao]  = useState(assunto.proximaAcao)
  const [quando,       setQuando]       = useState('Data')
  const [data,         setData]         = useState('')
  const [showEstagios, setShowEstagios] = useState(false)
  const [showAcoes,    setShowAcoes]    = useState(false)
  const [showDrawer,   setShowDrawer]   = useState(false)
  const [abaInfo,      setAbaInfo]      = useState<'linha do tempo' | 'vendas' | 'financeiro' | 'serviços'>('linha do tempo')

  const idx = ESTAGIOS.indexOf(estagio)
  const nextEstagio = ESTAGIOS[idx + 1]

  return (
    <div className="flex flex-col h-full">
      {/* Header */}
      <div className="flex items-center justify-between px-8 pt-5 pb-3 border-b border-[var(--d2b-border)]">
        <div className="flex items-center gap-3">
          <button onClick={onBack} className="text-xs text-[var(--d2b-text-muted)] hover:text-[var(--d2b-text-primary)] flex items-center gap-1">← voltar</button>
          <span className="text-xs text-[var(--d2b-text-muted)]">início ≡ vendas crm</span>
        </div>
        <div className="flex items-center gap-2">
          <button className={BTN_PRIMARY}>incluir ação</button>
          <div className="relative">
            <button onClick={() => setShowAcoes(v => !v)} className={BTN_OUTLINE + ' gap-1'}>
              ações <MoreHorizontal size={13} />
            </button>
            {showAcoes && (
              <div className="absolute right-0 top-full mt-1 w-52 bg-[var(--d2b-bg-elevated)] border border-[var(--d2b-border)] rounded-xl shadow-lg z-20 py-1">
                {['incluir proposta','incluir pedido de venda','enviar e-mail','enviar whatsapp','anotação'].map(a => (
                  <button key={a} onClick={() => setShowAcoes(false)} className="w-full text-left px-4 py-2 text-sm text-[var(--d2b-text-secondary)] hover:bg-[var(--d2b-hover)] hover:text-[var(--d2b-text-primary)]">{a}</button>
                ))}
                <div className="border-t border-[var(--d2b-border)] my-1" />
                {['marcadores','editar assunto','outros assuntos'].map(a => (
                  <button key={a} onClick={() => { if (a === 'editar assunto') setShowDrawer(true); setShowAcoes(false) }} className="w-full text-left px-4 py-2 text-sm text-[var(--d2b-text-secondary)] hover:bg-[var(--d2b-hover)] hover:text-[var(--d2b-text-primary)]">{a}</button>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto px-8 py-6 max-w-4xl">
        {/* Assunto header */}
        <div className="mb-6">
          <p className="text-xs text-[var(--d2b-text-muted)] mb-0.5">Assunto</p>
          <div className="flex items-center gap-2">
            <h2 className="text-xl font-semibold text-[var(--d2b-text-primary)]">{assunto.assunto}</h2>
            <Star size={14} className="text-[var(--d2b-text-muted)] cursor-pointer" />
          </div>
        </div>

        {/* Client card */}
        <div className="flex items-start gap-4 p-4 rounded-xl border border-[var(--d2b-border)] bg-[var(--d2b-bg-elevated)] mb-6">
          <div className="w-10 h-10 rounded-full bg-emerald-500 flex items-center justify-center text-white text-sm font-bold shrink-0">
            {assunto.cliente[0]}
          </div>
          <div>
            <p className="text-sm font-semibold text-[var(--d2b-text-primary)]">{assunto.cliente}</p>
            <p className="text-xs text-[var(--d2b-text-muted)] mt-0.5">Jesse, (81) 99634-9077, JESSE@GMAIL.COM</p>
            <p className="text-xs text-[var(--d2b-text-muted)] mt-0.5">⏱ Assunto iniciado há 0 dias</p>
          </div>
        </div>

        {/* Estágio */}
        <div className="mb-6">
          <p className="text-sm font-semibold text-[var(--d2b-text-primary)] mb-3">Estágio do assunto</p>
          <div className="flex items-center gap-2 flex-wrap">
            <button
              onClick={() => setShowEstagios(v => !v)}
              className="px-3 py-1.5 rounded-full text-xs font-semibold border border-[var(--d2b-border-strong)] text-[var(--d2b-text-primary)] hover:border-[#7C4DFF] transition-colors"
            >
              {estagio}
            </button>
            {nextEstagio && (
              <button
                onClick={() => { setEstagio(nextEstagio); setShowEstagios(false) }}
                className="px-3 py-1.5 rounded-full text-xs font-semibold border border-[var(--d2b-border-strong)] text-[#7C4DFF] hover:bg-[var(--d2b-hover)] transition-colors flex items-center gap-1"
              >
                → {nextEstagio}
              </button>
            )}
            <div className="relative">
              <button onClick={() => setShowEstagios(v => !v)} className="px-3 py-1.5 rounded-full text-xs font-semibold border border-[var(--d2b-border-strong)] text-[var(--d2b-text-muted)] hover:border-[#7C4DFF]">
                mais <MoreHorizontal size={11} className="inline" />
              </button>
              {showEstagios && (
                <div className="absolute left-0 top-full mt-1 w-48 bg-[var(--d2b-bg-elevated)] border border-[var(--d2b-border)] rounded-xl shadow-lg z-20 py-1">
                  {ESTAGIOS.map((e, i) => (
                    <button
                      key={e}
                      onClick={() => { setEstagio(e); setShowEstagios(false) }}
                      className={`w-full text-left px-4 py-2 text-sm hover:bg-[var(--d2b-hover)] transition-colors ${e === estagio ? 'text-[#7C4DFF] font-semibold' : 'text-[var(--d2b-text-secondary)]'}`}
                    >
                      {i + 1}. {e.toLowerCase()}
                    </button>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>

        <div className="border-t border-[var(--d2b-border)] mb-6" />

        {/* Ações */}
        <div>
          <p className="text-sm font-semibold text-[var(--d2b-text-primary)] mb-4">Ações</p>
          <div className="grid grid-cols-2 gap-6">
            {/* Próxima Ação */}
            <div>
              <label className={LBL}>Próxima Ação</label>
              <textarea
                className="w-full bg-[var(--d2b-bg-main)] border border-[var(--d2b-border-strong)] rounded-md px-3 py-2 text-sm text-[var(--d2b-text-primary)] placeholder:text-[var(--d2b-text-muted)] focus:outline-none focus:border-[#7C4DFF] transition-colors resize-none"
                rows={4}
                maxLength={256}
                value={proximaAcao}
                onChange={e => setProximaAcao(e.target.value)}
              />
              <p className="text-xs text-[var(--d2b-text-muted)] mt-1">Você tem {256 - proximaAcao.length} caracteres restando.</p>
              <div className="mt-3">
                <label className={LBL}>Previsto para</label>
                <div className="relative">
                  <select className="w-full bg-[var(--d2b-bg-main)] border border-[var(--d2b-border-strong)] rounded-md px-3 py-2 text-sm text-[var(--d2b-text-primary)] focus:outline-none appearance-none" value={quando} onChange={e => setQuando(e.target.value)}>
                    <option>Data</option><option>Hora</option>
                  </select>
                  <ChevronDown size={13} className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none text-[var(--d2b-text-muted)]" />
                </div>
              </div>
              <div className="mt-3">
                <label className={LBL}>Data</label>
                <div className="flex items-center gap-2 border border-[var(--d2b-border-strong)] rounded-md bg-[var(--d2b-bg-main)] px-3 h-9">
                  <input type="date" className="flex-1 bg-transparent text-sm text-[var(--d2b-text-primary)] outline-none" value={data} onChange={e => setData(e.target.value)} />
                </div>
              </div>
              <button className="mt-2 text-xs text-[#7C4DFF] hover:text-[#5B21B6]">adicionar horário</button>
              <div className="mt-3">
                <label className={LBL}>Usuário responsável</label>
                <div className="relative">
                  <select className="w-full bg-[var(--d2b-bg-main)] border border-[var(--d2b-border-strong)] rounded-md px-3 py-2 text-sm text-[var(--d2b-text-primary)] focus:outline-none appearance-none">
                    <option>BS TECNOLOGIA LTDA</option>
                  </select>
                  <ChevronDown size={13} className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none text-[var(--d2b-text-muted)]" />
                </div>
              </div>
              <div className="flex items-center gap-3 mt-4">
                <button onClick={() => onAtualizar({ ...assunto, estagio, proximaAcao })} className={BTN_PRIMARY}>salvar</button>
                <button onClick={onBack} className="text-sm text-[var(--d2b-text-secondary)] hover:text-[var(--d2b-text-primary)]">cancelar</button>
              </div>
            </div>

            {/* Timeline tabs */}
            <div>
              <div className="flex gap-4 border-b border-[var(--d2b-border)] mb-4">
                {(['linha do tempo','vendas','financeiro','serviços'] as const).map(t => (
                  <button
                    key={t}
                    onClick={() => setAbaInfo(t)}
                    className={`text-sm pb-2 border-b-2 transition-colors whitespace-nowrap ${abaInfo === t ? 'border-[#7C4DFF] text-[#7C4DFF] font-semibold' : 'border-transparent text-[var(--d2b-text-muted)] hover:text-[var(--d2b-text-primary)]'}`}
                  >
                    {t}
                  </button>
                ))}
              </div>
              <p className="text-sm text-[var(--d2b-text-muted)] text-center mt-8">Nenhum registro encontrado.</p>
            </div>
          </div>
        </div>
      </div>

      {showDrawer && (
        <DrawerAssunto
          assunto={assunto}
          onClose={() => setShowDrawer(false)}
          onSalvar={a => { onAtualizar(a); setShowDrawer(false) }}
        />
      )}
    </div>
  )
}

// ─── Lista CRM ───────────────────────────────────────────────────────────────
function CRMLista({
  assuntos,
  onDetalhe,
  onNovoAssunto,
  onAtualizar,
}: {
  assuntos: Assunto[]
  onDetalhe: (a: Assunto) => void
  onNovoAssunto: (a: Assunto) => void
  onAtualizar: (id: string, updates: Partial<Assunto>) => void
}) {
  const [busca,       setBusca]       = useState('')
  const [aba,         setAba]         = useState('todos')
  const [selected,    setSelected]    = useState<Set<string>>(new Set())
  const [showDrawer,  setShowDrawer]  = useState(false)
  const [showMaisAcoes, setShowMaisAcoes] = useState(false)

  const toggleSelect = (id: string) =>
    setSelected(s => { const n = new Set(s); n.has(id) ? n.delete(id) : n.add(id); return n })
  const toggleAll = () =>
    setSelected(s => s.size === assuntos.length ? new Set() : new Set(assuntos.map(a => a.id)))

  const sumario: Record<string, number> = {
    quantidade: assuntos.length, leads: 0, prospects: 0,
    clientes: assuntos.length, inativos: 0,
  }

  return (
    <div className="flex flex-col h-full">
      {/* Header */}
      <div className="flex items-center justify-between px-8 pt-6 pb-2">
        <div className="text-xs text-[var(--d2b-text-muted)]">início ≡ vendas crm</div>
        <button onClick={() => setShowDrawer(true)} className={BTN_PRIMARY}>
          <Plus size={13} /> incluir assunto
        </button>
      </div>

      <div className="px-8 pb-0">
        <h2 className="text-xl font-semibold text-[var(--d2b-text-primary)] mb-0.5">CRM</h2>
        <p className="text-sm text-[var(--d2b-text-muted)] mb-4">Gestão do relacionamento com os clientes</p>

        {/* Search + views */}
        <div className="flex items-center gap-2 flex-wrap mb-3">
          <div className="flex items-center gap-1.5 border border-[var(--d2b-border-strong)] rounded-md bg-[var(--d2b-bg-main)] px-3 h-9 w-72">
            <input className="flex-1 bg-transparent text-sm text-[var(--d2b-text-primary)] placeholder:text-[var(--d2b-text-muted)] outline-none" placeholder="Pesquise por contato, CPF/CNPJ ou descrição" value={busca} onChange={e => setBusca(e.target.value)} />
            <Search size={13} className="text-[var(--d2b-text-muted)]" />
          </div>
          {['Lista','por estágio','por período','filtros'].map(v => (
            <button key={v} className={BTN_OUTLINE + ' text-xs py-1'}>{v}</button>
          ))}
        </div>

        {/* Aba tabs */}
        <div className="flex gap-0 border-b border-[var(--d2b-border)]">
          {ABA_TABS.map(t => (
            <button
              key={t}
              onClick={() => setAba(t)}
              className={`px-4 py-2.5 text-sm border-b-2 transition-colors whitespace-nowrap ${aba === t ? 'border-[#7C4DFF] text-[#7C4DFF] font-semibold' : 'border-transparent text-[var(--d2b-text-muted)] hover:text-[var(--d2b-text-primary)]'}`}
            >
              {t}
            </button>
          ))}
        </div>
      </div>

      {/* Table */}
      <div className="flex-1 overflow-y-auto px-8">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-[var(--d2b-border)]">
              <th className="px-3 py-3 w-8">
                <input type="checkbox" checked={selected.size === assuntos.length && assuntos.length > 0} onChange={toggleAll} className="rounded accent-[#7C4DFF]" />
              </th>
              <th className="px-3 py-3 w-16" />
              <th className={TH}>Cliente</th>
              <th className={TH}>Assunto</th>
              <th className={TH}>Estágio</th>
              <th className={TH}>Próxima ação</th>
              <th className={TH}>Quando</th>
              <th className={TH}>Marcadores</th>
              <th className={TH}>Proposta</th>
            </tr>
          </thead>
          <tbody>
            {assuntos.filter(a => !busca || a.cliente.toLowerCase().includes(busca.toLowerCase()) || a.assunto.toLowerCase().includes(busca.toLowerCase())).map(a => (
              <tr key={a.id} className={`border-b border-[var(--d2b-border)] hover:bg-[var(--d2b-hover)] transition-colors cursor-pointer ${selected.has(a.id) ? 'bg-purple-500/5' : ''}`}>
                <td className="px-3 py-3">
                  <input type="checkbox" checked={selected.has(a.id)} onChange={() => toggleSelect(a.id)} className="rounded accent-[#7C4DFF]" onClick={e => e.stopPropagation()} />
                </td>
                <td className="px-3 py-3">
                  <div className="flex items-center gap-1 text-[var(--d2b-text-muted)]">
                    <MoreHorizontal size={13} />
                    <Star size={12} className={a.starred ? 'fill-yellow-400 text-yellow-400' : ''} onClick={() => onAtualizar(a.id, { starred: !a.starred })} />
                  </div>
                </td>
                <td className="px-3 py-3" onClick={() => onDetalhe(a)}>
                  <div className="flex items-center gap-2">
                    <div className="w-7 h-7 rounded-full bg-emerald-500 flex items-center justify-center text-white text-xs font-bold shrink-0">{a.cliente[0]}</div>
                    <span className="text-[var(--d2b-text-primary)] font-medium hover:text-[#7C4DFF]">{a.cliente}</span>
                  </div>
                </td>
                <td className="px-3 py-3 text-[var(--d2b-text-secondary)]" onClick={() => onDetalhe(a)}>{a.assunto}</td>
                <td className="px-3 py-3 text-[var(--d2b-text-secondary)]">{a.estagio}</td>
                <td className="px-3 py-3 text-[var(--d2b-text-muted)]">{a.proximaAcao || '—'}</td>
                <td className="px-3 py-3 text-[var(--d2b-text-muted)]">{a.quando || '—'}</td>
                <td className="px-3 py-3 text-[var(--d2b-text-muted)]">—</td>
                <td className="px-3 py-3 text-[var(--d2b-text-muted)]">—</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Multi-select bar */}
      {selected.size > 0 && (
        <div className="px-8 py-3 border-t border-[var(--d2b-border)] bg-[var(--d2b-bg-surface)] flex items-center gap-3">
          <span className="text-sm text-[var(--d2b-text-muted)]">↑ 0{selected.size}</span>
          <button className="flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-bold text-white bg-[#7C4DFF] hover:bg-[#5B21B6] transition-colors">
            <Archive size={12} /> arquivar assuntos
          </button>
          <button className="flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs border border-[var(--d2b-border-strong)] text-[var(--d2b-text-secondary)] hover:border-rose-400 hover:text-rose-400 transition-colors">
            <Trash2 size={12} /> excluir assuntos
          </button>
          <div className="relative">
            <button onClick={() => setShowMaisAcoes(v => !v)} className="flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs border border-[var(--d2b-border-strong)] text-[var(--d2b-text-secondary)]">
              mais ações <MoreHorizontal size={12} />
            </button>
            {showMaisAcoes && (
              <div className="absolute bottom-full mb-1 left-0 w-44 bg-[var(--d2b-bg-elevated)] border border-[var(--d2b-border)] rounded-xl shadow-lg z-20 py-1">
                {['arquivar assuntos','excluir assuntos','alterar marcadores'].map(a => (
                  <button key={a} className="w-full text-left px-4 py-2 text-sm text-[var(--d2b-text-secondary)] hover:bg-[var(--d2b-hover)]">{a}</button>
                ))}
              </div>
            )}
          </div>
        </div>
      )}

      {/* Footer sumário */}
      <div className="px-8 py-3 border-t border-[var(--d2b-border)] flex items-center justify-end gap-6 text-xs text-[var(--d2b-text-muted)]">
        {Object.entries(sumario).map(([k, v]) => (
          <div key={k} className="flex items-center gap-1">
            <span className="font-semibold text-[var(--d2b-text-primary)]">{v}</span>
            <span>{k}</span>
          </div>
        ))}
      </div>

      {showDrawer && (
        <DrawerAssunto
          onClose={() => setShowDrawer(false)}
          onSalvar={a => { onNovoAssunto(a); setShowDrawer(false) }}
        />
      )}
    </div>
  )
}

// ─── Export ──────────────────────────────────────────────────────────────────
export function CRMContent() {
  const [assuntos,    setAssuntos]    = useState<Assunto[]>(MOCK)
  const [detalhando,  setDetalhando]  = useState<Assunto | null>(null)

  const atualizar = (id: string, updates: Partial<Assunto>) =>
    setAssuntos(prev => prev.map(a => a.id === id ? { ...a, ...updates } : a))

  if (detalhando)
    return (
      <CRMDetalhe
        assunto={detalhando}
        onBack={() => setDetalhando(null)}
        onAtualizar={a => { atualizar(a.id, a); setDetalhando(null) }}
      />
    )

  return (
    <CRMLista
      assuntos={assuntos}
      onDetalhe={setDetalhando}
      onNovoAssunto={a => setAssuntos(prev => [...prev, a])}
      onAtualizar={atualizar}
    />
  )
}
