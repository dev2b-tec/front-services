'use client'

import { useState, useEffect } from 'react'
import { ChevronDown, Plus, X } from 'lucide-react'

// ─── Types ────────────────────────────────────────────────────────────────────

type Evento = { id: number; profissional: string; servicos: string; status: string; pagamento: string }

type Mensalidade = {
  id: string
  nome: string
  profissional: string
  paciente: string
  data: string
  parcela: string
  totalParcelas: number
  valor: number
  pago: number
  grupoId?: string
}

// ─── Component ────────────────────────────────────────────────────────────────

export function TabFinanceiro({
  pacienteId,
  pacienteNome,
  empresaId,
  onVoltar,
}: {
  pacienteId: string
  pacienteNome: string
  empresaId: string
  onVoltar: () => void
}) {
  // Eventos (top table)
  const [evtTitulo, setEvtTitulo] = useState('')
  const [evtTituloOpen, setEvtTituloOpen] = useState(false)
  const [evtProf, setEvtProf] = useState('')
  const [evtProfOpen, setEvtProfOpen] = useState(false)
  const [evtPagina, setEvtPagina] = useState(1)
  const [evtPageSize, setEvtPageSize] = useState(10)
  const [evtPageSizeOpen, setEvtPageSizeOpen] = useState(false)
  const [evtSort, setEvtSort] = useState<{ col: string; dir: 'asc' | 'desc' }>({ col: 'profissional', dir: 'asc' })
  const eventos: Evento[] = []

  // Mensalidades
  const [mensalidades, setMensalidades] = useState<Mensalidade[]>([])
  const [mensPagina, setMensPagina] = useState(1)
  const [mensPageSize, setMensPageSize] = useState(10)
  const [mensPageSizeOpen, setMensPageSizeOpen] = useState(false)
  const [mensSort, setMensSort] = useState<{ col: string; dir: 'asc' | 'desc' }>({ col: 'data', dir: 'asc' })

  // Load mensalidades from API
  useEffect(() => {
    if (!pacienteId) return
    fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/v1/movimentos-financeiros/paciente/${pacienteId}`)
      .then((r) => r.ok ? r.json() : [])
      .then((data: Array<{
        id: string; titulo: string; usuarioNome?: string; pacienteNome?: string
        dataVencimento: string; numeroParcela: number; totalParcelas: number
        valorParcela: number; valorPago: number; grupoId: string
      }>) => {
        setMensalidades(data.map((m) => ({
          id: m.id,
          nome: m.titulo,
          profissional: m.usuarioNome ?? '',
          paciente: m.pacienteNome ?? '',
          data: new Date(m.dataVencimento).toLocaleDateString('pt-BR'),
          parcela: String(m.numeroParcela),
          totalParcelas: m.totalParcelas,
          valor: m.valorParcela,
          pago: m.valorPago,
          grupoId: m.grupoId,
        })))
      })
      .catch(() => {})
  }, [pacienteId])

  // Usuários da empresa (profissionais)
  const [usuarios, setUsuarios] = useState<Array<{ id: string; nome: string }>>([])
  useEffect(() => {
    if (!empresaId) return
    fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/v1/usuarios/empresa/${empresaId}`)
      .then((r) => r.ok ? r.json() : [])
      .then((data: Array<{ id: string; nome: string }>) => setUsuarios(data))
      .catch(() => {})
  }, [empresaId])

  // Modal Adicionar Mensalidade
  const [addOpen, setAddOpen] = useState(false)
  const [addTitulo, setAddTitulo] = useState('')
  const [addProf, setAddProf] = useState<{ id: string; nome: string } | null>(null)
  const [addProfOpen, setAddProfOpen] = useState(false)
  const [addData, setAddData] = useState(new Date().toLocaleDateString('pt-BR'))
  const [addParcelas, setAddParcelas] = useState('')
  const [addValor, setAddValor] = useState('')
  const [addErros, setAddErros] = useState<Record<string, string>>({})

  // Modal Excluir Mensalidade
  const [delOpen, setDelOpen] = useState(false)
  const [delId, setDelId] = useState<string | null>(null)
  const [delOpcao, setDelOpcao] = useState<'esta' | 'todas' | 'futuras'>('esta')

  const TITULOS_DOC = ['Consulta', 'Exame', 'Sessão', 'Mensalidade']

  function toggleEvtSort(col: string) {
    setEvtSort((s) => s.col === col ? { col, dir: s.dir === 'asc' ? 'desc' : 'asc' } : { col, dir: 'asc' })
  }
  function toggleMensSort(col: string) {
    setMensSort((s) => s.col === col ? { col, dir: s.dir === 'asc' ? 'desc' : 'asc' } : { col, dir: 'asc' })
  }

  const mensFiltradas = [...mensalidades].sort((a, b) => {
    const dir = mensSort.dir === 'asc' ? 1 : -1
    if (mensSort.col === 'nome') return a.nome.localeCompare(b.nome) * dir
    if (mensSort.col === 'profissional') return a.profissional.localeCompare(b.profissional) * dir
    if (mensSort.col === 'paciente') return a.paciente.localeCompare(b.paciente) * dir
    if (mensSort.col === 'data') return a.data.localeCompare(b.data) * dir
    return 0
  })
  const mensTotalPags = Math.max(1, Math.ceil(mensFiltradas.length / mensPageSize))
  const mensSlice = mensFiltradas.slice((mensPagina - 1) * mensPageSize, mensPagina * mensPageSize)
  const totalRecebido = mensalidades.reduce((s, m) => s + m.pago, 0)
  const totalAReceber = mensalidades.reduce((s, m) => s + (m.valor - m.pago), 0)

  const evtTotalPags = Math.max(1, Math.ceil(eventos.length / evtPageSize))

  function fmt(val: number) {
    return val.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })
  }

  function SortIcon({ col, cur }: { col: string; cur: { col: string; dir: 'asc' | 'desc' } }) {
    return (
      <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"
        className={col === cur.col ? 'opacity-100 text-[#7C4DFF]' : 'opacity-40'}>
        {col === cur.col && cur.dir === 'asc'
          ? <><path d="M7 15l5 5 5-5"/><path d="M7 9l5-5 5 5" opacity="0.3"/></>
          : col === cur.col && cur.dir === 'desc'
          ? <><path d="M7 15l5 5 5-5" opacity="0.3"/><path d="M7 9l5-5 5 5"/></>
          : <><path d="M7 15l5 5 5-5"/><path d="M7 9l5-5 5 5"/></>}
      </svg>
    )
  }

  return (
    <div className="flex-1 flex flex-col gap-6 p-6 overflow-y-auto">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-semibold text-[var(--d2b-text-primary)]">Financeiro</h2>
        <button
          onClick={onVoltar}
          className="px-4 py-1.5 text-sm text-[var(--d2b-text-secondary)] border border-[var(--d2b-border-strong)] rounded-xl hover:border-[#7C4DFF] hover:text-[var(--d2b-text-primary)] transition-colors"
        >
          Voltar
        </button>
      </div>

      {/* Filter bar */}
      <div className="flex items-center gap-3">
        {/* Título dropdown */}
        <div className="relative">
          <button
            onClick={() => { setEvtTituloOpen((v) => !v); setEvtProfOpen(false) }}
            className="flex items-center gap-2 bg-[var(--d2b-bg-elevated)] border border-[var(--d2b-border-strong)] rounded-xl px-4 py-2.5 text-sm text-[var(--d2b-text-secondary)] hover:border-[#7C4DFF] transition-colors min-w-[200px] justify-between"
          >
            <span className={evtTitulo ? 'text-[var(--d2b-text-primary)]' : ''}>{evtTitulo || 'Título do documento'}</span>
            <ChevronDown size={13} className="text-[var(--d2b-text-muted)] flex-shrink-0" />
          </button>
          {evtTituloOpen && (
            <div className="absolute z-30 top-full mt-1 left-0 bg-[var(--d2b-bg-elevated)] border border-[var(--d2b-border-strong)] rounded-xl shadow-xl overflow-hidden min-w-[200px]">
              <button onClick={() => { setEvtTitulo(''); setEvtTituloOpen(false) }}
                className="w-full text-left px-4 py-2.5 text-sm text-[var(--d2b-text-muted)] hover:bg-[var(--d2b-hover)] transition-colors">Todos</button>
              {TITULOS_DOC.map((t) => (
                <button key={t} onClick={() => { setEvtTitulo(t); setEvtTituloOpen(false) }}
                  className={`w-full text-left px-4 py-2.5 text-sm transition-colors ${evtTitulo === t ? 'text-[#7C4DFF] bg-[var(--d2b-hover)]' : 'text-[var(--d2b-text-primary)] hover:bg-[var(--d2b-hover)]'}`}>{t}</button>
              ))}
            </div>
          )}
        </div>

        {/* Profissional dropdown */}
        <div className="relative">
          <button
            onClick={() => { setEvtProfOpen((v) => !v); setEvtTituloOpen(false) }}
            className="flex items-center gap-2 bg-[var(--d2b-bg-elevated)] border border-[var(--d2b-border-strong)] rounded-xl px-4 py-2.5 text-sm text-[var(--d2b-text-secondary)] hover:border-[#7C4DFF] transition-colors min-w-[200px] justify-between"
          >
            <span className={evtProf ? 'text-[var(--d2b-text-primary)]' : ''}>{evtProf || 'Selecione um profissio...'}</span>
            <ChevronDown size={13} className="text-[var(--d2b-text-muted)] flex-shrink-0" />
          </button>
          {evtProfOpen && (
            <div className="absolute z-30 top-full mt-1 left-0 bg-[var(--d2b-bg-elevated)] border border-[var(--d2b-border-strong)] rounded-xl shadow-xl overflow-hidden min-w-[220px]">
              <button onClick={() => { setEvtProf(''); setEvtProfOpen(false) }}
                className="w-full text-left px-4 py-2.5 text-sm text-[var(--d2b-text-muted)] hover:bg-[var(--d2b-hover)] transition-colors">Todos</button>
              {usuarios.map((u) => (
                <button key={u.id} onClick={() => { setEvtProf(u.nome); setEvtProfOpen(false) }}
                  className={`w-full text-left px-4 py-2.5 text-sm transition-colors ${evtProf === u.nome ? 'text-[#7C4DFF] bg-[var(--d2b-hover)]' : 'text-[var(--d2b-text-primary)] hover:bg-[var(--d2b-hover)]'}`}>{u.nome}</button>
              ))}
            </div>
          )}
        </div>

        <button className="px-5 py-2.5 bg-[#7C4DFF] hover:bg-[#5B21B6] text-white text-sm font-semibold rounded-xl transition-colors">
          Filtrar
        </button>
      </div>

      {/* Eventos table */}
      <div className="bg-[var(--d2b-bg-surface)] border border-[var(--d2b-border)] rounded-xl overflow-hidden">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-[var(--d2b-border)]">
              <th className="text-left px-5 py-3.5">
                <button onClick={() => toggleEvtSort('profissional')} className="flex items-center gap-1.5 text-xs font-semibold text-[var(--d2b-text-muted)] tracking-widest uppercase hover:text-[var(--d2b-text-secondary)] transition-colors">
                  Profissional <SortIcon col="profissional" cur={evtSort} />
                </button>
              </th>
              <th className="text-left px-5 py-3.5">
                <button onClick={() => toggleEvtSort('servicos')} className="flex items-center gap-1.5 text-xs font-semibold text-[var(--d2b-text-muted)] tracking-widest uppercase hover:text-[var(--d2b-text-secondary)] transition-colors">
                  Serviços <SortIcon col="servicos" cur={evtSort} />
                </button>
              </th>
              <th className="text-left px-5 py-3.5 text-xs font-semibold text-[var(--d2b-text-muted)] tracking-widest uppercase">Status</th>
              <th className="text-left px-5 py-3.5 text-xs font-semibold text-[var(--d2b-text-muted)] tracking-widest uppercase">Pagamento</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td colSpan={4} className="text-center py-10 text-[var(--d2b-text-muted)] text-sm">Nenhum evento encontrado</td>
            </tr>
          </tbody>
        </table>
        <div className="flex items-center justify-center gap-2 py-3 border-t border-[var(--d2b-border)]">
          <button disabled className="w-7 h-7 flex items-center justify-center rounded text-[var(--d2b-text-muted)] disabled:opacity-30 text-xs">«</button>
          <button disabled className="w-7 h-7 flex items-center justify-center rounded text-[var(--d2b-text-muted)] disabled:opacity-30 text-xs">‹</button>
          <button disabled className="w-7 h-7 flex items-center justify-center rounded text-[var(--d2b-text-muted)] disabled:opacity-30 text-xs">›</button>
          <button disabled className="w-7 h-7 flex items-center justify-center rounded text-[var(--d2b-text-muted)] disabled:opacity-30 text-xs">»</button>
          <div className="relative ml-1">
            <button onClick={() => setEvtPageSizeOpen((v) => !v)}
              className="flex items-center gap-1 bg-[var(--d2b-bg-elevated)] border border-[var(--d2b-border-strong)] rounded-lg px-3 py-1 text-sm text-[var(--d2b-text-primary)] hover:border-[#7C4DFF] transition-colors">
              {evtPageSize} <ChevronDown size={11} className="text-[var(--d2b-text-muted)]" />
            </button>
            {evtPageSizeOpen && (
              <div className="absolute z-30 bottom-full mb-1 left-0 bg-[var(--d2b-bg-elevated)] border border-[var(--d2b-border-strong)] rounded-xl shadow-xl overflow-hidden">
                {[10, 25, 50].map((n) => (
                  <button key={n} onClick={() => { setEvtPageSize(n); setEvtPagina(1); setEvtPageSizeOpen(false) }}
                    className={`w-full text-left px-4 py-2 text-sm transition-colors ${evtPageSize === n ? 'text-[#7C4DFF] bg-[var(--d2b-hover)]' : 'text-[var(--d2b-text-primary)] hover:bg-[var(--d2b-hover)]'}`}>{n}</button>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Mensalidades section */}
      <div>
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-base font-semibold text-[var(--d2b-text-primary)]">Mensalidades</h3>
          <button
            onClick={() => { setAddTitulo(''); setAddProf(null); setAddParcelas(''); setAddValor(''); setAddData(new Date().toLocaleDateString('pt-BR')); setAddErros({}); setAddOpen(true) }}
            className="flex items-center gap-1.5 px-4 py-2 bg-[#7C4DFF] hover:bg-[#5B21B6] text-white text-sm font-semibold rounded-xl transition-colors"
          >
            <Plus size={14} /> Adicionar
          </button>
        </div>

        <div className="bg-[var(--d2b-bg-surface)] border border-[var(--d2b-border)] rounded-xl overflow-hidden">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-[var(--d2b-border)]">
                <th className="text-left px-5 py-3.5 text-xs font-semibold text-[var(--d2b-text-muted)] tracking-widest uppercase">Ações</th>
                <th className="text-left px-5 py-3.5">
                  <button onClick={() => toggleMensSort('nome')} className="flex items-center gap-1.5 text-xs font-semibold text-[var(--d2b-text-muted)] tracking-widest uppercase hover:text-[var(--d2b-text-secondary)] transition-colors">
                    Nome <SortIcon col="nome" cur={mensSort} />
                  </button>
                </th>
                <th className="text-left px-5 py-3.5">
                  <button onClick={() => toggleMensSort('profissional')} className="flex items-center gap-1.5 text-xs font-semibold text-[var(--d2b-text-muted)] tracking-widest uppercase hover:text-[var(--d2b-text-secondary)] transition-colors">
                    Profissional <SortIcon col="profissional" cur={mensSort} />
                  </button>
                </th>
                <th className="text-left px-5 py-3.5">
                  <button onClick={() => toggleMensSort('paciente')} className="flex items-center gap-1.5 text-xs font-semibold text-[var(--d2b-text-muted)] tracking-widest uppercase hover:text-[var(--d2b-text-secondary)] transition-colors">
                    Paciente <SortIcon col="paciente" cur={mensSort} />
                  </button>
                </th>
                <th className="text-left px-5 py-3.5">
                  <button onClick={() => toggleMensSort('data')} className="flex items-center gap-1.5 text-xs font-semibold text-[var(--d2b-text-muted)] tracking-widest uppercase hover:text-[var(--d2b-text-secondary)] transition-colors">
                    Data <SortIcon col="data" cur={mensSort} />
                  </button>
                </th>
                <th className="text-left px-5 py-3.5 text-xs font-semibold text-[var(--d2b-text-muted)] tracking-widest uppercase">Pagamento</th>
              </tr>
            </thead>
            <tbody>
              {mensSlice.length === 0 ? (
                <tr>
                  <td colSpan={6} className="text-center py-10 text-[var(--d2b-text-muted)] text-sm">Nenhum registro encontrado</td>
                </tr>
              ) : (
                mensSlice.map((m) => (
                  <tr key={m.id} className="border-t border-[var(--d2b-border)] hover:bg-[var(--d2b-hover)] transition-colors">
                    <td className="px-5 py-3.5">
                      <div className="flex items-center gap-2">
                        <button className="w-7 h-7 flex items-center justify-center rounded-full border border-[var(--d2b-border-strong)] text-[#7C4DFF] hover:bg-[var(--d2b-hover)] transition-colors">
                          <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/></svg>
                        </button>
                        <button
                          onClick={() => { setDelId(m.id); setDelOpcao('esta'); setDelOpen(true) }}
                          className="w-7 h-7 flex items-center justify-center rounded-full border border-[rgba(255,100,100,0.30)] text-red-400 hover:bg-[rgba(255,100,100,0.12)] transition-colors"
                        >
                          <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polyline points="3 6 5 6 21 6"/><path d="M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6"/><path d="M10 11v6"/><path d="M14 11v6"/><path d="M9 6V4h6v2"/></svg>
                        </button>
                      </div>
                    </td>
                    <td className="px-5 py-3.5 text-[var(--d2b-text-primary)]">{m.nome}</td>
                    <td className="px-5 py-3.5 text-[var(--d2b-text-primary)]">{m.profissional}</td>
                    <td className="px-5 py-3.5 text-[var(--d2b-text-primary)]">{m.paciente}</td>
                    <td className="px-5 py-3.5">
                      <div className="text-[var(--d2b-text-primary)]">{m.data}</div>
                      <div className="text-xs text-[#7C4DFF] underline cursor-pointer mt-0.5">Parcela {m.parcela}/{m.totalParcelas}</div>
                    </td>
                    <td className="px-5 py-3.5">
                      <div className="text-[var(--d2b-text-primary)] text-sm">{fmt(m.pago)} de {fmt(m.valor)}</div>
                      <div className="flex items-center gap-1 mt-0.5 text-xs text-red-400">
                        <svg width="12" height="12" viewBox="0 0 24 24" fill="currentColor"><circle cx="12" cy="12" r="10"/><line x1="15" y1="9" x2="9" y2="15" stroke="white" strokeWidth="2"/><line x1="9" y1="9" x2="15" y2="15" stroke="white" strokeWidth="2"/></svg>
                        Em Aberto
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>

          {/* Totals row */}
          {mensalidades.length > 0 && (
            <div className="flex justify-end gap-8 px-5 py-3 border-t border-[var(--d2b-border)] text-sm">
              <span className="text-[var(--d2b-text-secondary)]">Total Recebido: <span className="font-semibold text-[var(--d2b-text-primary)]">{fmt(totalRecebido)}</span></span>
              <span className="text-[var(--d2b-text-secondary)]">A receber: <span className="font-semibold text-[var(--d2b-text-primary)]">{fmt(totalAReceber)}</span></span>
            </div>
          )}

          {/* Pagination */}
          <div className="flex items-center justify-center gap-2 py-3 border-t border-[var(--d2b-border)]">
            <button onClick={() => setMensPagina(1)} disabled={mensPagina === 1} className="w-7 h-7 flex items-center justify-center rounded text-[var(--d2b-text-muted)] hover:text-[var(--d2b-text-primary)] disabled:opacity-30 transition-colors text-xs">«</button>
            <button onClick={() => setMensPagina((p) => Math.max(1, p - 1))} disabled={mensPagina === 1} className="w-7 h-7 flex items-center justify-center rounded text-[var(--d2b-text-muted)] hover:text-[var(--d2b-text-primary)] disabled:opacity-30 transition-colors text-xs">‹</button>
            {Array.from({ length: Math.min(mensTotalPags, 5) }, (_, i) => i + 1).map((p) => (
              <button key={p} onClick={() => setMensPagina(p)}
                className={`w-7 h-7 flex items-center justify-center rounded-full text-xs transition-colors ${mensPagina === p ? 'bg-[#7C4DFF] text-white font-semibold' : 'text-[var(--d2b-text-muted)] hover:text-[var(--d2b-text-primary)]'}`}>
                {p}
              </button>
            ))}
            <button onClick={() => setMensPagina((p) => Math.min(mensTotalPags, p + 1))} disabled={mensPagina === mensTotalPags} className="w-7 h-7 flex items-center justify-center rounded text-[var(--d2b-text-muted)] hover:text-[var(--d2b-text-primary)] disabled:opacity-30 transition-colors text-xs">›</button>
            <button onClick={() => setMensPagina(mensTotalPags)} disabled={mensPagina === mensTotalPags} className="w-7 h-7 flex items-center justify-center rounded text-[var(--d2b-text-muted)] hover:text-[var(--d2b-text-primary)] disabled:opacity-30 transition-colors text-xs">»</button>
            <div className="relative ml-1">
              <button onClick={() => setMensPageSizeOpen((v) => !v)}
                className="flex items-center gap-1 bg-[var(--d2b-bg-elevated)] border border-[var(--d2b-border-strong)] rounded-lg px-3 py-1 text-sm text-[var(--d2b-text-primary)] hover:border-[#7C4DFF] transition-colors">
                {mensPageSize} <ChevronDown size={11} className="text-[var(--d2b-text-muted)]" />
              </button>
              {mensPageSizeOpen && (
                <div className="absolute z-30 bottom-full mb-1 left-0 bg-[var(--d2b-bg-elevated)] border border-[var(--d2b-border-strong)] rounded-xl shadow-xl overflow-hidden">
                  {[10, 25, 50].map((n) => (
                    <button key={n} onClick={() => { setMensPageSize(n); setMensPagina(1); setMensPageSizeOpen(false) }}
                      className={`w-full text-left px-4 py-2 text-sm transition-colors ${mensPageSize === n ? 'text-[#7C4DFF] bg-[var(--d2b-hover)]' : 'text-[var(--d2b-text-primary)] hover:bg-[var(--d2b-hover)]'}`}>{n}</button>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Modal: Excluir conta */}
      {delOpen && (() => {
        const alvo = mensalidades.find((m) => m.id === delId)
        if (!alvo) return null
        return (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm">
            <div className="bg-[var(--d2b-bg-elevated)] border border-[var(--d2b-border-strong)] rounded-2xl shadow-2xl w-full max-w-md p-8">
              <div className="flex items-center justify-between mb-6">
                <span className="text-base font-semibold text-[var(--d2b-text-primary)]">Excluir Conta</span>
                <button onClick={() => setDelOpen(false)} className="w-7 h-7 flex items-center justify-center rounded-lg text-[var(--d2b-text-muted)] hover:text-[var(--d2b-text-primary)] hover:bg-[var(--d2b-hover)] transition-colors">
                  <X size={15} />
                </button>
              </div>

              <div className="flex justify-center mb-5">
                <div className="w-14 h-14 rounded-full bg-red-500/15 flex items-center justify-center">
                  <svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="#f87171" strokeWidth="2">
                    <path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"/>
                    <line x1="12" y1="9" x2="12" y2="13"/><line x1="12" y1="17" x2="12.01" y2="17"/>
                  </svg>
                </div>
              </div>

              <p className="text-sm text-center text-[var(--d2b-text-secondary)] mb-6 leading-relaxed">
                <span className="font-bold text-red-400">Atenção:</span> Esta ação não pode ser desfeita. Defina abaixo como deseja excluir esta conta.
              </p>

              <div className="flex flex-col gap-3 mb-7">
                {([
                  { val: 'esta',    label: <>Excluir apenas <strong>esta parcela</strong></> },
                  { val: 'todas',   label: <>Excluir <strong>todas as parcelas</strong> da conta</> },
                  { val: 'futuras', label: <>Excluir <strong>esta e todas as parcelas futuras</strong></> },
                ] as const).map(({ val, label }) => (
                  <label key={val} className="flex items-center gap-3 cursor-pointer group">
                    <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center flex-shrink-0 transition-colors ${delOpcao === val ? 'border-[#7C4DFF]' : 'border-[#3D2A5A] group-hover:border-[#7C4DFF]'}`}>
                      {delOpcao === val && <div className="w-2.5 h-2.5 rounded-full bg-[#7C4DFF]" />}
                    </div>
                    <input type="radio" className="hidden" checked={delOpcao === val} onChange={() => setDelOpcao(val)} />
                    <span className="text-sm text-[var(--d2b-text-secondary)] group-hover:text-[var(--d2b-text-primary)] transition-colors">{label}</span>
                  </label>
                ))}
              </div>

              <div className="flex items-center justify-end gap-3">
                <button onClick={() => setDelOpen(false)} className="px-4 py-2 text-sm text-[var(--d2b-text-secondary)] hover:text-[var(--d2b-text-primary)] border border-[var(--d2b-border-strong)] rounded-xl hover:border-[var(--d2b-border-strong)] transition-colors">
                  Cancelar
                </button>
                <button
                  onClick={async () => {
                    if (!alvo) return
                    const base = `${process.env.NEXT_PUBLIC_API_URL}/api/v1/movimentos-financeiros`
                    if (delOpcao === 'esta') {
                      await fetch(`${base}/${alvo.id}/parcela`, { method: 'DELETE' })
                      setMensalidades((prev) => prev.filter((m) => m.id !== alvo.id))
                    } else if (delOpcao === 'todas') {
                      await fetch(`${base}/grupo/${alvo.grupoId}`, { method: 'DELETE' })
                      setMensalidades((prev) => prev.filter((m) => m.grupoId !== alvo.grupoId))
                    } else {
                      await fetch(`${base}/${alvo.id}/futuras`, { method: 'DELETE' })
                      setMensalidades((prev) => prev.filter((m) =>
                        m.grupoId !== alvo.grupoId || parseInt(m.parcela) < parseInt(alvo.parcela)
                      ))
                    }
                    setDelOpen(false)
                  }}
                  className="px-5 py-2 bg-red-600 hover:bg-red-700 text-white text-sm font-semibold rounded-xl transition-colors"
                >
                  Excluir
                </button>
              </div>
            </div>
          </div>
        )
      })()}

      {/* Modal: Adicionar conta a receber */}
      {addOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm">
          <div className="bg-[var(--d2b-bg-elevated)] border border-[var(--d2b-border-strong)] rounded-2xl shadow-2xl w-full max-w-[810px] p-9">
            <div className="flex items-center justify-between mb-6">
              <span className="text-base font-semibold text-[var(--d2b-text-primary)]">Adicionar conta a receber</span>
              <button onClick={() => setAddOpen(false)} className="w-7 h-7 flex items-center justify-center rounded-lg text-[var(--d2b-text-muted)] hover:text-[var(--d2b-text-primary)] hover:bg-[var(--d2b-hover)] transition-colors">
                <X size={15} />
              </button>
            </div>

            <div className="flex flex-col gap-5">
              {/* Título da Conta */}
              <div>
                <label className="block text-xs font-medium text-[var(--d2b-text-muted)] mb-1.5">Título da Conta <span className="text-[#7C4DFF]">*</span></label>
                <input
                  autoFocus
                  type="text"
                  value={addTitulo}
                  onChange={(e) => { setAddTitulo(e.target.value); setAddErros((p) => ({ ...p, titulo: '' })) }}
                  className={`w-full bg-[var(--d2b-bg-elevated)] border rounded-xl px-4 py-3 text-sm text-[var(--d2b-text-primary)] placeholder-[#3D2A5A] focus:outline-none transition-colors ${addErros.titulo ? 'border-red-500' : 'border-[var(--d2b-border-strong)] focus:border-[#7C4DFF]'}`}
                />
                {addErros.titulo && <p className="text-xs text-red-400 mt-1">{addErros.titulo}</p>}
              </div>

              {/* Paciente + Profissional */}
              <div className="flex gap-3">
                <div className="flex-1">
                  <label className="block text-xs font-medium text-[var(--d2b-text-muted)] mb-1.5">Paciente</label>
                  <input
                    type="text"
                    value={pacienteNome}
                    readOnly
                    className="w-full bg-[var(--d2b-bg-main)] border border-[var(--d2b-border)] rounded-xl px-4 py-3 text-sm text-[var(--d2b-text-secondary)] cursor-not-allowed"
                  />
                </div>
                <div className="flex-1">
                  <label className="block text-xs font-medium text-[var(--d2b-text-muted)] mb-1.5">Profissional</label>
                  <div className="relative">
                    <button
                      onClick={() => setAddProfOpen((v) => !v)}
                      className="w-full flex items-center justify-between bg-[var(--d2b-bg-elevated)] border border-[var(--d2b-border-strong)] rounded-xl px-4 py-3 text-sm text-[var(--d2b-text-primary)] hover:border-[#7C4DFF] transition-colors"
                    >
                      <span className={`truncate text-left ${addProf ? '' : 'text-[var(--d2b-text-muted)]'}`}>{addProf?.nome ?? 'Selecione um profissional'}</span>
                      <ChevronDown size={13} className="text-[var(--d2b-text-muted)] flex-shrink-0" />
                    </button>
                    {addProfOpen && (
                      <div className="absolute z-30 top-full mt-1 left-0 right-0 bg-[var(--d2b-bg-elevated)] border border-[var(--d2b-border-strong)] rounded-xl shadow-xl overflow-hidden">
                        <button onClick={() => { setAddProf(null); setAddProfOpen(false) }}
                          className="w-full text-left px-4 py-2.5 text-sm text-[var(--d2b-text-muted)] hover:bg-[var(--d2b-hover)] transition-colors">Nenhum</button>
                        {usuarios.map((u) => (
                          <button key={u.id} onClick={() => { setAddProf(u); setAddProfOpen(false) }}
                            className={`w-full text-left px-4 py-2.5 text-sm transition-colors ${addProf?.id === u.id ? 'text-[#7C4DFF] bg-[var(--d2b-hover)]' : 'text-[var(--d2b-text-primary)] hover:bg-[var(--d2b-hover)]'}`}>{u.nome}</button>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              </div>

              {/* Data + Parcelas */}
              <div className="flex gap-3">
                <div className="flex-1">
                  <label className="block text-xs font-medium text-[var(--d2b-text-muted)] mb-1.5">Data do Recebimento <span className="text-[#7C4DFF]">*</span></label>
                  <input
                    type="text"
                    value={addData}
                    onChange={(e) => { setAddData(e.target.value); setAddErros((p) => ({ ...p, data: '' })) }}
                    className={`w-full bg-[var(--d2b-bg-elevated)] border rounded-xl px-4 py-3 text-sm text-[var(--d2b-text-primary)] focus:outline-none transition-colors ${addErros.data ? 'border-red-500' : 'border-[var(--d2b-border-strong)] focus:border-[#7C4DFF]'}`}
                  />
                  {addErros.data && <p className="text-xs text-red-400 mt-1">{addErros.data}</p>}
                </div>
                <div className="flex-1">
                  <label className="block text-xs font-medium text-[var(--d2b-text-muted)] mb-1.5">Número de Parcelas <span className="text-[#7C4DFF]">*</span></label>
                  <input
                    type="number"
                    min={1}
                    value={addParcelas}
                    onChange={(e) => { setAddParcelas(e.target.value); setAddErros((p) => ({ ...p, parcelas: '' })) }}
                    className={`w-full bg-[var(--d2b-bg-elevated)] border rounded-xl px-4 py-3 text-sm text-[var(--d2b-text-primary)] focus:outline-none transition-colors ${addErros.parcelas ? 'border-red-500' : 'border-[var(--d2b-border-strong)] focus:border-[#7C4DFF]'}`}
                  />
                  {addErros.parcelas && <p className="text-xs text-red-400 mt-1">{addErros.parcelas}</p>}
                </div>
              </div>

              {/* Valor */}
              <div className="flex gap-3">
                <div className="flex-1">
                  <label className="block text-xs font-medium text-[var(--d2b-text-muted)] mb-1.5">Valor <span className="text-[#7C4DFF]">*</span></label>
                  <input
                    type="text"
                    inputMode="numeric"
                    placeholder="R$ 0,00"
                    value={addValor}
                    onChange={(e) => {
                      // Currency mask: keep only digits, format as BRL
                      const digits = e.target.value.replace(/\D/g, '')
                      if (digits === '') { setAddValor(''); setAddErros((p) => ({ ...p, valor: '' })); return }
                      const cents = parseInt(digits, 10)
                      const formatted = (cents / 100).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })
                      setAddValor(formatted)
                      setAddErros((p) => ({ ...p, valor: '' }))
                    }}
                    className={`w-full bg-[var(--d2b-bg-elevated)] border rounded-xl px-4 py-3 text-sm text-[var(--d2b-text-primary)] placeholder-[#3D2A5A] focus:outline-none transition-colors ${addErros.valor ? 'border-red-500' : 'border-[var(--d2b-border-strong)] focus:border-[#7C4DFF]'}`}
                  />
                  {addErros.valor && <p className="text-xs text-red-400 mt-1">{addErros.valor}</p>}
                </div>
                <div className="flex-1" />
              </div>

              {/* Parcelas preview */}
              {(() => {
                const n = parseInt(addParcelas)
                const digits = addValor.replace(/\D/g, '')
                const total = digits ? parseInt(digits, 10) / 100 : 0
                if (!n || n < 1 || !total) return null
                const parcela = total / n
                return (
                  <p className="text-sm font-semibold text-[var(--d2b-text-secondary)]">
                    {n} {n === 1 ? 'parcela' : 'parcelas'} {n === 1 ? 'de' : 'mensais de'}{' '}
                    {parcela.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}
                  </p>
                )
              })()}
            </div>

            <div className="flex items-center justify-end gap-3 mt-8">
              <button onClick={() => setAddOpen(false)} className="px-4 py-2 text-sm text-[var(--d2b-text-secondary)] hover:text-[var(--d2b-text-primary)] transition-colors">
                Cancelar
              </button>
              <button
                onClick={() => {
                  const erros: Record<string, string> = {}
                  if (!addTitulo.trim()) erros.titulo = 'Campo obrigatório'
                  if (!addData.trim()) erros.data = 'Campo obrigatório'
                  if (!addParcelas || parseInt(addParcelas) < 1) erros.parcelas = 'Informe o número de parcelas'
                  if (!addValor.trim()) erros.valor = 'Campo obrigatório'
                  if (Object.keys(erros).length > 0) { setAddErros(erros); return }

                  const nParcelas = parseInt(addParcelas)
                  const valor = parseInt(addValor.replace(/\D/g, '') || '0', 10) / 100

                  const parts = addData.split('/')
                  const dataPrimeiroVencimento = parts.length === 3
                    ? `${parts[2]}-${parts[1]}-${parts[0]}`
                    : new Date().toISOString().split('T')[0]

                  fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/v1/movimentos-financeiros`, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({
                      empresaId,
                      pacienteId,
                      ...(addProf ? { usuarioId: addProf.id } : {}),
                      titulo: addTitulo.trim(),
                      tipo: 'MENSALIDADE',
                      totalParcelas: nParcelas,
                      valorTotal: valor,
                      dataPrimeiroVencimento,
                    }),
                  })
                    .then((r) => r.ok ? r.json() : Promise.reject())
                    .then((criados: Array<{
                      id: string; titulo: string; usuarioNome?: string; pacienteNome?: string
                      dataVencimento: string; numeroParcela: number; totalParcelas: number
                      valorParcela: number; valorPago: number; grupoId: string
                    }>) => {
                      setMensalidades((prev) => [
                        ...prev,
                        ...criados.map((m) => ({
                          id: m.id,
                          nome: m.titulo,
                          profissional: m.usuarioNome ?? addProf?.nome ?? '',
                          paciente: m.pacienteNome ?? pacienteNome,
                          data: new Date(m.dataVencimento).toLocaleDateString('pt-BR'),
                          parcela: String(m.numeroParcela),
                          totalParcelas: m.totalParcelas,
                          valor: m.valorParcela,
                          pago: m.valorPago,
                          grupoId: m.grupoId,
                        }))
                      ])
                      setAddOpen(false)
                    })
                    .catch(() => { setAddErros({ titulo: 'Erro ao salvar. Tente novamente.' }) })
                }}
                className="px-5 py-2 bg-[#7C4DFF] hover:bg-[#5B21B6] text-white text-sm font-semibold rounded-xl transition-colors"
              >
                Salvar
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
