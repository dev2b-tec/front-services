'use client'

import { useState, useRef, useEffect } from 'react'
import {
  DollarSign, TrendingUp, TrendingDown, ArrowDownCircle, ArrowUpCircle,
  ChevronDown, Search, Plus, Filter, Download, X, Check, Upload,
  AlertTriangle, Calendar, Clock, CreditCard, Banknote,
  type LucideIcon,
} from 'lucide-react'
import {
  AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  LineChart, Line,
} from 'recharts'
import { TabContasPagar } from './tab-contas-pagar'
import { NovoAgendamentoModal, ApiAgendamento, Profissional } from '@/components/calendario/calendario-view'

// ─── Shared styles ────────────────────────────────────────────────────────────
const INP =
  'w-full bg-[var(--d2b-bg-main)] border border-[var(--d2b-border-strong)] rounded-md ' +
  'px-3 py-2.5 text-sm text-[var(--d2b-text-primary)] placeholder:text-[var(--d2b-text-muted)] ' +
  'focus:outline-none focus:border-[#7C4DFF] transition-colors'
const LBG = 'bg-[var(--d2b-bg-main)]'
const BTN_GHOST =
  'px-5 py-2 rounded-md text-sm font-medium text-[var(--d2b-text-secondary)] border border-[var(--d2b-border-strong)] hover:border-[#7C4DFF] hover:text-[var(--d2b-text-primary)] transition-colors'
const BTN_PRIMARY =
  'px-5 py-2 rounded-md text-sm font-bold text-white bg-[#7C4DFF] hover:bg-[#5B21B6] transition-colors'

function fmtBRL(v: number) {
  return v.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })
}

// ─── Types ────────────────────────────────────────────────────────────────────
type SubTab = 'dashboard' | 'receber' | 'mensalidades' | 'pagar'

type Lancamento = {
  id: number
  descricao: string
  valor: number
  vencimento: string
  status: 'pago' | 'aberto' | 'atrasado'
  tipo: 'entrada' | 'saida'
  paciente?: string
  categoria?: string
}

// ─── Contas a Receber types & mock ───────────────────────────────────────────
type StatusAgenda = 'Atendido' | 'Faltou' | 'Confirmado' | 'Aguardando' | 'Cancelado'

type AgendaReceber = {
  id: string
  referenciaId: string | null
  paciente: string
  telefone: string
  convenio: string
  data: string
  profissional: string
  status: StatusAgenda
  recebido: number
  total: number
}

const MOCK_AGENDA_RECEBER: AgendaReceber[] = [
  { id:'1', paciente:'Paciente Exemplo', telefone:'+5500000000000', convenio:'PARTICULAR', data:'30/03/2026 09:00', profissional:'JESSE DOS SANTOS BEZERRA', status:'Atendido',   recebido:0, total:0 },
  { id:'2', paciente:'Paciente Exemplo', telefone:'+5500000000000', convenio:'PARTICULAR', data:'01/04/2026 09:00', profissional:'JESSE DOS SANTOS BEZERRA', status:'Faltou',     recebido:0, total:0 },
  { id:'3', paciente:'Paciente Exemplo', telefone:'+5500000000000', convenio:'PARTICULAR', data:'03/04/2026 09:00', profissional:'JESSE DOS SANTOS BEZERRA', status:'Confirmado', recebido:0, total:0 },
]

function AgendaStatusBadge({ status }: { status: StatusAgenda }) {
  const map: Record<StatusAgenda, string> = {
    Atendido:  'bg-[rgba(34,197,94,0.15)] text-[#22C55E] border border-[rgba(34,197,94,0.3)]',
    Confirmado:'bg-[rgba(20,184,166,0.15)] text-[#14B8A6] border border-[rgba(20,184,166,0.3)]',
    Aguardando:'bg-[rgba(234,179,8,0.15)] text-[#EAB308] border border-[rgba(234,179,8,0.3)]',
    Faltou:    'bg-[rgba(239,68,68,0.15)] text-[#EF4444] border border-[rgba(239,68,68,0.3)]',
    Cancelado: 'bg-[rgba(107,78,138,0.20)] text-[var(--d2b-text-secondary)] border border-[var(--d2b-border-strong)]',
  }
  return (
    <span className={`text-xs font-semibold px-3 py-1 rounded-md ${map[status]}`}>{status}</span>
  )
}

// ─── Alterar Status & Pagamento modal ────────────────────────────────────────
type EditRow = {
  id: string
  paciente: string
  profissional: string
  data: string
  status: StatusAgenda
  valorEvento: string
  valorRecebido: string
  dataPagamento: string
  metodo: string
}

const STATUS_OPTIONS: StatusAgenda[] = ['Atendido', 'Confirmado', 'Aguardando', 'Faltou', 'Cancelado']
const METODO_OPTIONS = ['Método', 'Dinheiro', 'Pix', 'Cartão de Crédito', 'Cartão de Débito', 'Plano de Saúde', 'Transferência', 'Outros']

function ModalAlterarStatus({ rows, onClose, onSave }: {
  rows: AgendaReceber[]
  onClose: () => void
  onSave: (edits: EditRow[]) => void
}) {
  const [edits, setEdits] = useState<EditRow[]>(
    rows.map((r) => ({
      id: r.id,
      paciente: r.paciente,
      profissional: r.profissional,
      data: r.data,
      status: r.status,
      valorEvento: r.total > 0 ? r.total.toFixed(2).replace('.', ',') : '0,00',
      valorRecebido: r.recebido > 0 ? r.recebido.toFixed(2).replace('.', ',') : '0,00',
      dataPagamento: '',
      metodo: 'Método',
    }))
  )

  function setField(id: string, field: keyof EditRow, val: string) {
    setEdits((prev) => prev.map((e) => e.id === id ? { ...e, [field]: val } : e))
  }

  const totalSelecionado = edits.reduce((s, e) => {
    const v = parseFloat(e.valorRecebido.replace(',', '.')) || 0
    return s + v
  }, 0)

  function todosAtendidos() {
    setEdits((prev) => prev.map((e) => ({ ...e, status: 'Atendido' })))
  }
  function quitarTodos() {
    setEdits((prev) => prev.map((e) => ({ ...e, valorRecebido: e.valorEvento })))
  }
  function preencherHoje() {
    const today = new Date()
    const d = String(today.getDate()).padStart(2,'0')
    const m = String(today.getMonth()+1).padStart(2,'0')
    const y = today.getFullYear()
    setEdits((prev) => prev.map((e) => ({ ...e, dataPagamento: `${d}/${m}/${y}` })))
  }

  const INP_W = 'bg-[#F3F0FA] border border-[#D8D0ED] rounded-md px-2.5 py-1.5 text-sm text-[#2D1B5A] placeholder:text-[#9E8BBF] focus:outline-none focus:border-[#7C4DFF] transition-colors w-full'

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-5xl mx-4 flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-[#EDE8F5]">
          <h3 className="text-base font-bold text-[#2D1B5A]">Alterar Status &amp; Pagamento</h3>
          <button onClick={onClose} className="text-[#9E8BBF] hover:text-[#2D1B5A] transition-colors">
            <X size={18} />
          </button>
        </div>

        {/* Table */}
        <div className="overflow-auto flex-1 px-6 py-4">
          <table className="w-full text-sm border-collapse">
            <thead>
              <tr className="border-b border-[#EDE8F5]">
                {[
                  { icon: '👤', label: 'DETALHES DO\nAGENDAMENTO' },
                  { icon: 'ℹ️', label: 'STATUS' },
                  { icon: '📅', label: 'VALOR DO EVENTO' },
                  { icon: '$', label: 'VALOR RECEBIDO' },
                  { icon: '📅', label: 'DATA DO\nPAGAMENTO' },
                  { icon: '📋', label: 'MÉTODO DE\nPAGAMENTO' },
                ].map(({ label }) => (
                  <th key={label} className="px-3 py-2 text-[10px] font-semibold text-[#9E8BBF] uppercase tracking-wide text-left whitespace-pre-line">
                    {label}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {edits.map((e) => (
                <tr key={e.id} className="border-b border-[#F3F0FA]">
                  {/* Patient info */}
                  <td className="px-3 py-3">
                    <p className="font-bold text-[#2D1B5A] text-sm">{e.paciente}</p>
                    <p className="text-xs text-[#9E8BBF]">{e.profissional}</p>
                    <p className="text-xs text-[#9E8BBF] flex items-center gap-1 mt-0.5">
                      <Calendar size={10} /> {e.data}
                    </p>
                  </td>
                  {/* Status */}
                  <td className="px-3 py-3">
                    <div className="relative">
                      <select value={e.status} onChange={(ev) => setField(e.id, 'status', ev.target.value as StatusAgenda)}
                        className={INP_W + ' appearance-none pr-6 cursor-pointer'}>
                        {STATUS_OPTIONS.map((s) => <option key={s} value={s}>{s}</option>)}
                      </select>
                      <ChevronDown size={11} className="absolute right-2 top-1/2 -translate-y-1/2 text-[#9E8BBF] pointer-events-none" />
                    </div>
                  </td>
                  {/* Valor Evento */}
                  <td className="px-3 py-3">
                    <input value={`R$ ${e.valorEvento}`} readOnly
                      className={INP_W + ' bg-[#EDE8F5] text-[#9E8BBF] cursor-not-allowed'} />
                  </td>
                  {/* Valor Recebido */}
                  <td className="px-3 py-3">
                    <input value={`R$ ${e.valorRecebido}`}
                      onChange={(ev) => setField(e.id, 'valorRecebido', ev.target.value.replace(/^R\$\s?/, ''))}
                      className={INP_W} />
                  </td>
                  {/* Data Pagamento */}
                  <td className="px-3 py-3">
                    <input placeholder="dd/mm/aaaa" value={e.dataPagamento}
                      onChange={(ev) => setField(e.id, 'dataPagamento', ev.target.value)}
                      className={INP_W} />
                  </td>
                  {/* Método */}
                  <td className="px-3 py-3">
                    <div className="relative">
                      <select value={e.metodo} onChange={(ev) => setField(e.id, 'metodo', ev.target.value)}
                        className={INP_W + ' appearance-none pr-6 cursor-pointer'}>
                        {METODO_OPTIONS.map((m) => <option key={m} value={m}>{m}</option>)}
                      </select>
                      <ChevronDown size={11} className="absolute right-2 top-1/2 -translate-y-1/2 text-[#9E8BBF] pointer-events-none" />
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Footer */}
        <div className="px-6 py-4 border-t border-[#EDE8F5] flex items-center justify-between flex-wrap gap-3">
          <div className="flex items-center gap-2">
            <button onClick={todosAtendidos}
              className="flex items-center gap-1.5 px-4 py-2 rounded-lg text-xs font-semibold bg-[#14B8A6] text-white hover:bg-[#0D9488] transition-colors">
              <Check size={13} /> Todos Atendidos
            </button>
            <button onClick={quitarTodos}
              className="flex items-center gap-1.5 px-4 py-2 rounded-lg text-xs font-semibold bg-[#7C4DFF] text-white hover:bg-[#5B21B6] transition-colors">
              <DollarSign size={13} /> Quitar Todos
            </button>
            <button onClick={preencherHoje}
              className="flex items-center gap-1.5 px-4 py-2 rounded-lg text-xs font-semibold bg-[#7C4DFF] text-white hover:bg-[#5B21B6] transition-colors">
              <Calendar size={13} /> Preencher Hoje
            </button>
          </div>
          <div className="flex items-center gap-3">
            <span className="text-sm text-[#9E8BBF]">
              Total Selecionado: <span className="font-bold text-[#2D1B5A]">R$ {totalSelecionado.toFixed(2).replace('.', ',')}</span>
            </span>
            <button onClick={onClose}
              className="flex items-center gap-1.5 px-4 py-2 rounded-lg text-xs font-semibold text-[#9E8BBF] border border-[#D8D0ED] hover:bg-[#F3F0FA] transition-colors">
              <X size={13} /> Cancelar
            </button>
            <button onClick={() => onSave(edits)}
              className="flex items-center gap-1.5 px-4 py-2 rounded-lg text-xs font-semibold bg-[#7C4DFF] text-white hover:bg-[#5B21B6] transition-colors">
              <Check size={13} /> Salvar Alterações
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}

// ─── Emitir Recibo modal ──────────────────────────────────────────────────────
function ModalEmitirRecibo({ row, onClose }: { row: AgendaReceber; onClose: () => void }) {
  const [cpfProf,      setCpfProf]      = useState('')
  const [cnpj,         setCnpj]         = useState('')
  const [endProf,      setEndProf]      = useState('')
  const [conselho,     setConselho]     = useState('')
  const [nConselho,    setNConselho]    = useState('')
  const [cpfPac,       setCpfPac]       = useState('')
  const [convenio,     setConvenio]     = useState('Convênio')
  const [nomePagador,  setNomePagador]  = useState('')
  const [cpfPagador,   setCpfPagador]   = useState('')
  const [dataPag,      setDataPag]      = useState('')

  const INP_W = 'w-full border border-[#D8D0ED] rounded-md px-3 py-2 text-sm text-[#2D1B5A] placeholder:text-[#B0A0CC] focus:outline-none focus:border-[#7C4DFF] transition-colors bg-white'
  const LBL_W = 'absolute -top-2 left-3 z-10 bg-white px-1 text-[10px] font-medium text-[#9E8BBF] leading-none'
  function FloatInput({ label, value, onChange, placeholder }: { label: string; value: string; onChange: (v: string) => void; placeholder?: string }) {
    return (
      <div className="relative">
        <label className={LBL_W}>{label}</label>
        <input value={value} onChange={(e) => onChange(e.target.value)} placeholder={placeholder}
          className={INP_W} />
      </div>
    )
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl mx-4 flex flex-col max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-[#EDE8F5]">
          <h3 className="text-base font-bold text-[#2D1B5A]">Emitir Recibo</h3>
          <button onClick={onClose} className="text-[#9E8BBF] hover:text-[#2D1B5A] transition-colors"><X size={18} /></button>
        </div>

        <div className="px-6 py-5 space-y-6">
          {/* Profissional */}
          <div>
            <p className="text-xs font-bold text-[#9E8BBF] uppercase tracking-widest mb-3">Informações do Profissional</p>
            <div className="grid grid-cols-2 gap-4">
              <FloatInput label="Nome" value={row.profissional} onChange={() => {}} />
              <FloatInput label="CPF" value={cpfProf} onChange={setCpfProf} />
              <FloatInput label="CNPJ" value={cnpj} onChange={setCnpj} />
              <FloatInput label="Endereço Completo" value={endProf} onChange={setEndProf} />
              <FloatInput label="Email" value="jesse.9001@gmail.com" onChange={() => {}} />
              <FloatInput label="Telefone" value="(81) 99708-8404" onChange={() => {}} />
              <FloatInput label="Conselho" value={conselho} onChange={setConselho} />
              <FloatInput label="Nº Conselho" value={nConselho} onChange={setNConselho} />
            </div>
          </div>

          {/* Paciente */}
          <div>
            <p className="text-xs font-bold text-[#9E8BBF] uppercase tracking-widest mb-3">Informações do Paciente</p>
            <div className="grid grid-cols-2 gap-4">
              <FloatInput label="Nome Completo" value={row.paciente} onChange={() => {}} />
              <FloatInput label="CPF" value={cpfPac} onChange={setCpfPac} />
              <div className="relative">
                <label className={LBL_W}>Convênio</label>
                <div className="relative">
                  <select value={convenio} onChange={(e) => setConvenio(e.target.value)}
                    className={INP_W + ' appearance-none pr-8 cursor-pointer'}>
                    {['Convênio','Particular','Amil','Bradesco Saúde','Unimed','SulAmérica'].map((o) => (
                      <option key={o} value={o}>{o}</option>
                    ))}
                  </select>
                  <ChevronDown size={13} className="absolute right-3 top-1/2 -translate-y-1/2 text-[#9E8BBF] pointer-events-none" />
                </div>
              </div>
            </div>
          </div>

          {/* Pagamento */}
          <div>
            <p className="text-xs font-bold text-[#9E8BBF] uppercase tracking-widest mb-3">Informações do Pagamento</p>
            <div className="grid grid-cols-2 gap-4">
              <FloatInput label="Nome do Pagador" value={nomePagador} onChange={setNomePagador} />
              <FloatInput label="CPF do Pagador" value={cpfPagador} onChange={setCpfPagador} />
              <FloatInput label="Data Pagamento" value={dataPag} onChange={setDataPag} placeholder="dd/mm/aaaa" />
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="px-6 py-4 border-t border-[#EDE8F5] flex items-center justify-end gap-3">
          <button onClick={onClose}
            className="px-5 py-2 rounded-lg text-sm font-medium text-[#7C4DFF] border border-[#D8D0ED] hover:bg-[#F3F0FA] transition-colors">
            Cancelar
          </button>
          <button className="px-5 py-2 rounded-lg text-sm font-bold text-white bg-[#7C4DFF] hover:bg-[#5B21B6] transition-colors">
            Emitir
          </button>
        </div>
      </div>
    </div>
  )
}

function TabContasReceber({ empresaId }: { empresaId: string | null }) {
  const [search, setSearch]             = useState('')
  const [selected, setSelected]         = useState<string[]>([])
  const [page, setPage]                 = useState(1)
  const [pageSize, setPageSize]         = useState(10)
  const [pageSizeOpen, setPageSizeOpen] = useState(false)
  const [rows, setRows]                 = useState<AgendaReceber[]>([])
  const [acoesOpen, setAcoesOpen]       = useState(false)
  const [modalAlterarOpen, setModalAlterarOpen] = useState(false)
  const [modalRecibo, setModalRecibo]   = useState<AgendaReceber | null>(null)
  const [agendamentoModal, setAgendamentoModal] = useState<ApiAgendamento | null>(null)
  const [buscandoAgendamento, setBuscandoAgendamento] = useState(false)

  useEffect(() => {
    if (!empresaId) return
    fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/v1/movimentos-financeiros/empresa/${empresaId}`)
      .then((r) => r.ok ? r.json() : [])
      .then((data: Array<{
        id: string; pacienteNome?: string; pacienteTelefone?: string; usuarioNome?: string
        dataVencimento: string; status: string; valorParcela: number; valorPago: number
        referenciaId?: string
      }>) => {
        setRows(data.map((m) => ({
          id: m.id,
          referenciaId: m.referenciaId ?? null,
          paciente: m.pacienteNome ?? '—',
          telefone: m.pacienteTelefone ?? '',
          convenio: 'PARTICULAR',
          data: (() => { try { return new Date(m.dataVencimento + 'T00:00:00').toLocaleDateString('pt-BR', { timeZone: 'America/Sao_Paulo' }) } catch { return m.dataVencimento } })(),
          profissional: m.usuarioNome ?? '—',
          status: m.status === 'PAGO' ? 'Atendido'
               : m.status === 'CANCELADO' ? 'Cancelado'
               : 'Aguardando' as StatusAgenda,
          recebido: m.valorPago,
          total: m.valorParcela,
        })))
      })
      .catch(() => {})
  }, [empresaId])

  const filtered = rows.filter((r) =>
    r.paciente.toLowerCase().includes(search.toLowerCase()) ||
    r.profissional.toLowerCase().includes(search.toLowerCase())
  )
  const totalPages = Math.max(1, Math.ceil(filtered.length / pageSize))
  const pageRows   = filtered.slice((page - 1) * pageSize, page * pageSize)

  const allSelected = pageRows.length > 0 && pageRows.every((r) => selected.includes(r.id))
  function toggleAll() {
    if (allSelected) setSelected((s) => s.filter((id) => !pageRows.find((r) => r.id === id)))
    else setSelected((s) => [...new Set([...s, ...pageRows.map((r) => r.id)])])
  }
  function toggleOne(id: string) {
    setSelected((s) => s.includes(id) ? s.filter((x) => x !== id) : [...s, id])
  }

  async function handleRowClick(r: AgendaReceber) {
    if (!r.referenciaId) return
    setBuscandoAgendamento(true)
    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/v1/agendamentos/${r.referenciaId}`)
      if (!res.ok) return
      const ag: ApiAgendamento = await res.json()
      setAgendamentoModal(ag)
    } catch { /* silent */ } finally {
      setBuscandoAgendamento(false)
    }
  }

  function handleSaveAlteracoes(edits: EditRow[]) {
    const base = `${process.env.NEXT_PUBLIC_API_URL}/api/v1/movimentos-financeiros`
    const updates = edits.map((e) => {
      const statusMap: Record<StatusAgenda, string> = {
        Atendido: 'PAGO', Confirmado: 'EM_ABERTO', Aguardando: 'EM_ABERTO', Faltou: 'EM_ABERTO', Cancelado: 'CANCELADO',
      }
      const parts = e.dataPagamento.split('/')
      const dataPagamento = parts.length === 3 ? `${parts[2]}-${parts[1]}-${parts[0]}` : undefined
      return fetch(`${base}/${e.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          status: statusMap[e.status] ?? 'EM_ABERTO',
          valorPago: parseFloat(e.valorRecebido.replace(',', '.')) || 0,
          dataPagamento: dataPagamento || null,
          metodoPagamento: e.metodo !== 'Método' ? e.metodo : null,
        }),
      })
    })
    Promise.allSettled(updates).then(() => {
      setRows((prev) => prev.map((r) => {
        const e = edits.find((x) => x.id === r.id)
        if (!e) return r
        return {
          ...r,
          status: e.status,
          recebido: parseFloat(e.valorRecebido.replace(',', '.')) || 0,
          total: parseFloat(e.valorEvento.replace(',', '.')) || 0,
        }
      }))
      setSelected([])
      setModalAlterarOpen(false)
    })
  }

  const selectedRows = rows.filter((r) => selected.includes(r.id))
  const totalRecebido = rows.reduce((s, r) => s + r.recebido, 0)
  const total         = rows.reduce((s, r) => s + r.total, 0)

  return (
    <>
    {buscandoAgendamento && (
      <div className="fixed inset-0 z-40 flex items-center justify-center bg-black/50">
        <div className="flex items-center gap-3 bg-[var(--d2b-bg-elevated)] border border-[var(--d2b-border-strong)] rounded-xl px-6 py-4">
          <svg className="animate-spin" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#7C4DFF" strokeWidth="2"><path d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z" opacity=".3"/><path d="M21 12a9 9 0 00-9-9"/></svg>
          <span className="text-sm text-[var(--d2b-text-primary)]">Carregando agendamento...</span>
        </div>
      </div>
    )}
    {agendamentoModal && (
      <NovoAgendamentoModal
        open
        onClose={() => setAgendamentoModal(null)}
        empresaId={empresaId}
        profissionaisApi={[] as Profissional[]}
        agendamento={agendamentoModal}
        onSaved={() => {
          setAgendamentoModal(null)
          // re-fetch rows to reflect any value changes
          if (empresaId) {
            fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/v1/movimentos-financeiros/empresa/${empresaId}`)
              .then((r) => r.ok ? r.json() : [])
              .then((data: Array<{ id: string; pacienteNome?: string; usuarioNome?: string; dataVencimento: string; status: string; valorParcela: number; valorPago: number; referenciaId?: string }>) => {
                setRows(data.map((m) => ({
                  id: m.id, referenciaId: m.referenciaId ?? null,
                  paciente: m.pacienteNome ?? '—', telefone: '', convenio: 'PARTICULAR',
                  data: (() => { try { return new Date(m.dataVencimento + 'T00:00:00').toLocaleDateString('pt-BR', { timeZone: 'America/Sao_Paulo' }) } catch { return m.dataVencimento } })(),
                  profissional: m.usuarioNome ?? '—',
                  status: m.status === 'PAGO' ? 'Atendido' : m.status === 'CANCELADO' ? 'Cancelado' : 'Aguardando' as StatusAgenda,
                  recebido: m.valorPago, total: m.valorParcela,
                })))
              }).catch(() => {})
          }
        }}
      />
    )}
    {modalAlterarOpen && (
      <ModalAlterarStatus
        rows={selectedRows}
        onClose={() => setModalAlterarOpen(false)}
        onSave={handleSaveAlteracoes}
      />
    )}
    {modalRecibo && (
      <ModalEmitirRecibo row={modalRecibo} onClose={() => setModalRecibo(null)} />
    )}
    <div className="rounded-xl border border-[var(--d2b-border)] bg-[var(--d2b-bg-surface)] overflow-hidden">
      {/* ── Header ── */}
      <div className="px-6 pt-6 pb-4 border-b border-[var(--d2b-border)]">
        <h2 className="text-base font-bold text-[var(--d2b-text-primary)]">Contas a receber</h2>
        <p className="text-xs text-[var(--d2b-text-secondary)] mt-0.5">Controle o recebimento do pagamento de seus agendamentos e de outras contas que achar necessário.</p>

        <div className="flex items-center justify-between mt-4 flex-wrap gap-3">
          <span className="text-sm font-medium text-[#7C4DFF] underline cursor-pointer hover:text-[var(--d2b-text-secondary)] transition-colors">
            Lista de agendamentos
          </span>
          <div className="flex items-center gap-2">
            <div className="relative">
              <Search size={13} className="absolute left-3 top-1/2 -translate-y-1/2 text-[var(--d2b-text-muted)]" />
              <input type="text" placeholder="Pesquisar" value={search}
                onChange={(e) => { setSearch(e.target.value); setPage(1) }}
                className={INP + ' pl-8 w-44'} />
            </div>
            <button className="flex items-center gap-1.5 px-3 py-2 text-xs font-semibold text-[var(--d2b-text-secondary)] border border-[var(--d2b-border-strong)] rounded-lg hover:border-[#7C4DFF] hover:text-[var(--d2b-text-primary)] transition-colors">
              <Filter size={13} /> Filtrar dados
            </button>
          </div>
        </div>
      </div>

      {/* ── Table ── */}
      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-[var(--d2b-border)] bg-[var(--d2b-bg-main)]">
              <th className="w-10 px-4 py-3">
                <input type="checkbox" checked={allSelected} onChange={toggleAll}
                  className="w-4 h-4 rounded accent-[#7C4DFF] cursor-pointer" />
              </th>
              <th className="px-4 py-3 text-left">
                {selected.length > 0 ? (
                  <div className="relative">
                    <button onClick={() => setAcoesOpen((v) => !v)}
                      className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-bold text-white bg-[#7C4DFF] rounded-lg hover:bg-[#5B21B6] transition-colors">
                      <ChevronDown size={11} /> Ações
                      <span className="ml-0.5 w-4 h-4 flex items-center justify-center rounded-full bg-white text-[#7C4DFF] text-[9px] font-bold leading-none">
                        {selected.length}
                      </span>
                    </button>
                    {acoesOpen && (
                      <div className="absolute top-full mt-1 left-0 bg-[var(--d2b-bg-elevated)] border border-[var(--d2b-border-strong)] rounded-lg shadow-xl z-30 min-w-[200px] py-1">
                        <p className="px-4 py-1.5 text-[10px] font-bold text-[var(--d2b-text-muted)] uppercase tracking-widest">Ações Massivas</p>
                        <button onClick={() => { setModalAlterarOpen(true); setAcoesOpen(false) }}
                          className="w-full flex items-center gap-2 px-4 py-2 text-sm text-[var(--d2b-text-primary)] hover:bg-[var(--d2b-hover)] transition-colors text-left">
                          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/></svg>
                          Alterar Status &amp; Pagamento
                        </button>
                        <button onClick={() => { setSelected([]); setAcoesOpen(false) }}
                          className="w-full flex items-center gap-2 px-4 py-2 text-sm text-[#EF4444] hover:bg-[rgba(239,68,68,0.08)] transition-colors text-left">
                          <X size={14} /> Limpar Seleção
                        </button>
                      </div>
                    )}
                  </div>
                ) : (
                  <button className="flex items-center gap-1 text-[10px] font-semibold text-[var(--d2b-text-muted)] uppercase tracking-widest hover:text-[var(--d2b-text-secondary)] transition-colors">
                    PACIENTE <ChevronDown size={10} />
                  </button>
                )}
              </th>
              {[['DATA'],['PROFISSIONAL'],['SERVIÇOS & STATUS'],['PAGAMENTO']].map(([h], i) => (
                <th key={h} className={`px-4 py-3 text-[10px] font-semibold text-[var(--d2b-text-muted)] uppercase tracking-widest ${i === 3 ? 'text-right' : 'text-left'}`}>
                  {i < 2 ? (
                    <button className="flex items-center gap-1 hover:text-[var(--d2b-text-secondary)] transition-colors">
                      {h} <ChevronDown size={10} />
                    </button>
                  ) : h}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {pageRows.length === 0 ? (
              <tr>
                <td colSpan={6} className="px-4 py-10 text-center text-sm text-[var(--d2b-text-muted)]">Nenhum agendamento encontrado.</td>
              </tr>
            ) : pageRows.map((r) => (
              <tr key={r.id}
                onClick={() => handleRowClick(r)}
                className={`border-b border-[var(--d2b-border)] transition-colors ${r.referenciaId ? 'cursor-pointer hover:bg-[var(--d2b-hover)]' : 'hover:bg-[var(--d2b-hover)]'}`}>
                <td className="px-4 py-4" onClick={(e) => e.stopPropagation()}>
                  <input type="checkbox" checked={selected.includes(r.id)} onChange={() => toggleOne(r.id)}
                    className="w-4 h-4 rounded accent-[#7C4DFF] cursor-pointer" />
                </td>
                <td className="px-4 py-4">
                  <div className="flex items-center gap-3">
                    <div className="relative group/avatar flex-shrink-0">
                      <div className="w-9 h-9 rounded-full bg-[#7C4DFF] flex items-center justify-center">
                        <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                          <rect x="8" y="2" width="8" height="4" rx="1"/>
                          <path d="M16 4h2a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2h2"/>
                          <path d="M9 12h6M9 16h4"/>
                        </svg>
                      </div>
                      {/* Emitir Recibo tooltip */}
                      <button onClick={(e) => { e.stopPropagation(); setModalRecibo(r) }}
                        className="absolute inset-0 rounded-full bg-[#7C4DFF] flex items-center justify-center opacity-0 group-hover/avatar:opacity-100 transition-opacity cursor-pointer"
                        title="Emitir Recibo">
                        <span className="text-[9px] font-bold text-white leading-tight text-center px-0.5">Emitir<br/>Recibo</span>
                      </button>
                    </div>
                    <div>
                      <p className="font-semibold text-[var(--d2b-text-primary)]">{r.paciente}</p>
                      <p className="text-xs text-[var(--d2b-text-muted)]">{r.telefone}</p>
                      <span className="text-[10px] font-semibold text-[var(--d2b-text-secondary)] border border-[var(--d2b-border-strong)] rounded px-1.5 py-0.5 mt-0.5 inline-block">
                        {r.convenio}
                      </span>
                    </div>
                  </div>
                </td>
                <td className="px-4 py-4 text-[var(--d2b-text-secondary)] whitespace-nowrap">{r.data}</td>
                <td className="px-4 py-4 text-[var(--d2b-text-secondary)] whitespace-nowrap">{r.profissional}</td>
                <td className="px-4 py-4"><AgendaStatusBadge status={r.status} /></td>
                <td className="px-4 py-4 text-right">
                  <p className="text-sm font-medium text-[var(--d2b-text-primary)]">
                    R$ {r.recebido.toFixed(2).replace('.', ',')} de R$ {r.total.toFixed(2).replace('.', ',')}
                  </p>
                  <p className="text-xs text-[#F59E0B] flex items-center gap-1 justify-end mt-0.5">
                    <svg width="10" height="10" viewBox="0 0 24 24" fill="currentColor">
                      <path d="M12 2L1 21h22L12 2zm0 3.5L20.5 19h-17L12 5.5zM11 10v4h2v-4h-2zm0 6v2h2v-2h-2z"/>
                    </svg>
                    Valores a definir
                  </p>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* ── Footer ── */}
      <div className="px-6 py-4 border-t border-[var(--d2b-border)] flex items-center justify-between flex-wrap gap-3">
        <button className={BTN_GHOST + ' flex items-center gap-1.5'}>
          <Upload size={13} /> Exportar Dados
        </button>

        <div className="flex items-center gap-6">
          <div className="text-right">
            <p className="text-xs text-[var(--d2b-text-secondary)]">
              Total Recebido: <span className="font-semibold text-[var(--d2b-text-primary)]">R$ {totalRecebido.toFixed(2).replace('.', ',')}</span>
            </p>
            <p className="text-xs text-[var(--d2b-text-secondary)]">
              Total: <span className="font-semibold text-[var(--d2b-text-primary)]">R$ {total.toFixed(2).replace('.', ',')}</span>
            </p>
          </div>

          {/* Pagination */}
          <div className="flex items-center gap-1">
            {(['«', '‹', '›', '»'] as const).map((sym, i) => {
              const acts = [() => setPage(1), () => setPage((p) => Math.max(1, p - 1)), () => setPage((p) => Math.min(totalPages, p + 1)), () => setPage(totalPages)]
              return (
                <button key={sym} onClick={acts[i]}
                  className="w-7 h-7 flex items-center justify-center rounded text-sm text-[var(--d2b-text-secondary)] hover:bg-[var(--d2b-hover)] hover:text-[var(--d2b-text-primary)] transition-colors">
                  {sym}
                </button>
              )
            })}
            <span className="w-7 h-7 flex items-center justify-center rounded bg-[#7C4DFF] text-white text-xs font-semibold">{page}</span>
            <div className="relative ml-1">
              <button onClick={() => setPageSizeOpen((v) => !v)}
                className="flex items-center gap-1 px-2 py-1.5 border border-[var(--d2b-border-strong)] rounded text-xs text-[var(--d2b-text-secondary)] hover:border-[#7C4DFF] transition-colors">
                {pageSize} <ChevronDown size={11} />
              </button>
              {pageSizeOpen && (
                <div className="absolute bottom-full mb-1 right-0 bg-[var(--d2b-bg-elevated)] border border-[var(--d2b-border-strong)] rounded-lg shadow-xl overflow-hidden z-20">
                  {[5, 10, 20, 50].map((n) => (
                    <button key={n} onClick={() => { setPageSize(n); setPage(1); setPageSizeOpen(false) }}
                      className={`w-full text-left px-4 py-2 text-sm hover:bg-[var(--d2b-hover)] transition-colors ${pageSize === n ? 'text-[#7C4DFF] font-semibold' : 'text-[var(--d2b-text-primary)]'}`}>
                      {n}
                    </button>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
    </>
  )
}


function StatusBadge({ status }: { status: Lancamento['status'] }) {
  const map = {
    pago:     { label: 'Pago',     cls: 'bg-[rgba(34,197,94,0.12)] text-[#22C55E] border border-[rgba(34,197,94,0.25)]' },
    aberto:   { label: 'Em aberto', cls: 'bg-[var(--d2b-hover)] text-[var(--d2b-text-secondary)] border border-[var(--d2b-border-strong)]' },
    atrasado: { label: 'Atrasado', cls: 'bg-[rgba(239,68,68,0.12)] text-[#EF4444] border border-[rgba(239,68,68,0.25)]' },
  }
  const { label, cls } = map[status]
  return <span className={`text-[10px] font-semibold px-2 py-0.5 rounded-full ${cls}`}>{label}</span>
}

// ─── FSelect ──────────────────────────────────────────────────────────────────
function FSelect({ label, opts, value, onChange }: {
  label: string; opts: string[]; value: string; onChange: (v: string) => void
}) {
  return (
    <div className="relative">
      <label className={`absolute -top-2 left-3 z-10 ${LBG} px-1 text-[10px] font-medium text-[var(--d2b-text-secondary)] leading-none`}>
        {label}
      </label>
      <div className="relative">
        <select
          value={value}
          onChange={(e) => onChange(e.target.value)}
          className={INP + ' appearance-none pr-8 cursor-pointer'}
        >
          {opts.map((o) => <option key={o} value={o}>{o}</option>)}
        </select>
        <ChevronDown size={13} className="absolute right-3 top-1/2 -translate-y-1/2 text-[var(--d2b-text-secondary)] pointer-events-none" />
      </div>
    </div>
  )
}

// ─── Modal novo lançamento ────────────────────────────────────────────────────
function ModalLancamento({ tipo, onClose }: {
  tipo: 'entrada' | 'saida'; onClose: () => void
}) {
  const [descricao, setDescricao] = useState('')
  const [valor,     setValor]     = useState('')
  const [venc,      setVenc]      = useState('')
  const [categoria, setCategoria] = useState('Consulta')

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm">
      <div className="bg-[var(--d2b-bg-surface)] border border-[var(--d2b-border-strong)] rounded-xl shadow-2xl w-full max-w-md mx-4 p-6">
        <div className="flex items-center justify-between mb-5">
          <h3 className="text-base font-bold text-[var(--d2b-text-primary)]">
            {tipo === 'entrada' ? 'Novo Recebimento' : 'Nova Despesa'}
          </h3>
          <button onClick={onClose} className="text-[var(--d2b-text-muted)] hover:text-[var(--d2b-text-primary)] transition-colors">
            <X size={18} />
          </button>
        </div>

        <div className="space-y-4">
          <div className="relative">
            <label className={`absolute -top-2 left-3 z-10 ${LBG} px-1 text-[10px] font-medium text-[var(--d2b-text-secondary)] leading-none`}>
              Descrição<span className="text-[#7C4DFF] ml-0.5">*</span>
            </label>
            <input value={descricao} onChange={(e) => setDescricao(e.target.value)} className={INP} />
          </div>
          <div className="relative">
            <label className={`absolute -top-2 left-3 z-10 ${LBG} px-1 text-[10px] font-medium text-[var(--d2b-text-secondary)] leading-none`}>
              Valor (R$)<span className="text-[#7C4DFF] ml-0.5">*</span>
            </label>
            <input placeholder="0,00" value={valor} onChange={(e) => setValor(e.target.value)} className={INP} />
          </div>
          <div className="relative">
            <label className={`absolute -top-2 left-3 z-10 ${LBG} px-1 text-[10px] font-medium text-[var(--d2b-text-secondary)] leading-none`}>
              Vencimento<span className="text-[#7C4DFF] ml-0.5">*</span>
            </label>
            <input type="date" value={venc} onChange={(e) => setVenc(e.target.value)} className={INP} />
          </div>
          <FSelect
            label="Categoria"
            opts={tipo === 'entrada'
              ? ['Consulta', 'Retorno', 'Procedimento', 'Teleconsulta', 'Exame', 'Mensalidade']
              : ['Aluguel', 'Utilidades', 'Software', 'Materiais', 'Salário', 'Outros']}
            value={categoria}
            onChange={setCategoria}
          />
        </div>

        <div className="flex justify-end gap-3 mt-6">
          <button onClick={onClose} className={BTN_GHOST}>Cancelar</button>
          <button onClick={onClose} className={BTN_PRIMARY}>Salvar</button>
        </div>
      </div>
    </div>
  )
}

// ─── Tabela de lançamentos ────────────────────────────────────────────────────
function TabelaLancamentos({ data, tipo }: { data: Lancamento[]; tipo: 'entrada' | 'saida' }) {
  const [search, setSearch] = useState('')
  const [filtroStatus, setFiltroStatus] = useState('Todos')
  const [showModal, setShowModal] = useState(false)

  const filtered = data.filter((l) => {
    const matchSearch = l.descricao.toLowerCase().includes(search.toLowerCase())
    const matchStatus =
      filtroStatus === 'Todos' ||
      (filtroStatus === 'Pago' && l.status === 'pago') ||
      (filtroStatus === 'Em aberto' && l.status === 'aberto') ||
      (filtroStatus === 'Atrasado' && l.status === 'atrasado')
    return matchSearch && matchStatus
  })

  const totalPago   = data.filter((l) => l.status === 'pago').reduce((s, l) => s + l.valor, 0)
  const totalAberto = data.filter((l) => l.status === 'aberto' || l.status === 'atrasado').reduce((s, l) => s + l.valor, 0)
  const totalGeral  = data.reduce((s, l) => s + l.valor, 0)

  return (
    <div className="space-y-5">
      {/* Filtros */}
      <div className="flex items-center gap-3 flex-wrap">
        <div className="relative flex-1 min-w-[180px] max-w-xs">
          <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-[var(--d2b-text-muted)]" />
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Pesquisar..."
            className={INP + ' pl-8'}
          />
        </div>
        <FSelect
          label="Status"
          opts={['Todos', 'Pago', 'Em aberto', 'Atrasado']}
          value={filtroStatus}
          onChange={setFiltroStatus}
        />
        <button className={BTN_GHOST + ' flex items-center gap-1.5 ml-auto'}>
          <Download size={14} />
          Exportar
        </button>
        <button
          onClick={() => setShowModal(true)}
          className={BTN_PRIMARY + ' flex items-center gap-1.5'}
        >
          <Plus size={14} />
          {tipo === 'entrada' ? 'Novo Recebimento' : 'Nova Despesa'}
        </button>
      </div>

      {/* Resumo */}
      <div className="grid grid-cols-3 gap-3">
        {[
          { label: tipo === 'entrada' ? 'Recebido' : 'Quitado',          value: totalPago,   color: '#22C55E' },
          { label: tipo === 'entrada' ? 'A Receber (Em aberto)' : 'A Pagar (Em aberto)', value: totalAberto, color: '#A78BCC' },
          { label: tipo === 'entrada' ? 'Total a Receber' : 'Total a Pagar', value: totalGeral,  color: tipo === 'entrada' ? '#7C4DFF' : '#EF4444' },
        ].map(({ label, value, color }) => (
          <div key={label} className="flex items-center gap-3 rounded-lg border border-[var(--d2b-border)] bg-[var(--d2b-bg-surface)] px-4 py-3">
            <div className="w-8 h-8 rounded-lg flex items-center justify-center shrink-0" style={{ background: `${color}20` }}>
              <DollarSign size={16} style={{ color }} />
            </div>
            <div>
              <p className="text-xs text-[var(--d2b-text-secondary)]">{label}</p>
              <p className="text-sm font-bold" style={{ color }}>{fmtBRL(value)}</p>
            </div>
          </div>
        ))}
      </div>

      {/* Tabela */}
      <div className="rounded-lg border border-[var(--d2b-border)] overflow-hidden">
        <div className="grid grid-cols-[1fr_auto_auto_auto] gap-0 bg-[var(--d2b-bg-surface)] border-b border-[var(--d2b-border)]">
          <div className="px-4 py-2.5 text-[10px] font-semibold uppercase tracking-widest text-[var(--d2b-text-muted)]">Descrição</div>
          <div className="px-4 py-2.5 text-[10px] font-semibold uppercase tracking-widest text-[var(--d2b-text-muted)]">Vencimento</div>
          <div className="px-4 py-2.5 text-[10px] font-semibold uppercase tracking-widest text-[var(--d2b-text-muted)]">Valor</div>
          <div className="px-4 py-2.5 text-[10px] font-semibold uppercase tracking-widest text-[var(--d2b-text-muted)]">Status</div>
        </div>
        {filtered.length === 0 && (
          <div className="px-4 py-8 text-center text-sm text-[var(--d2b-text-muted)]">Nenhum lançamento encontrado.</div>
        )}
        {filtered.map((l, i) => (
          <div
            key={l.id}
            className={`grid grid-cols-[1fr_auto_auto_auto] gap-0 px-0 items-center ${
              i < filtered.length - 1 ? 'border-b border-[var(--d2b-border)]' : ''
            } hover:bg-[var(--d2b-hover)] transition-colors`}
          >
            <div className="px-4 py-3">
              <p className="text-sm font-medium text-[var(--d2b-text-primary)]">{l.descricao}</p>
              {l.paciente && <p className="text-xs text-[var(--d2b-text-muted)]">{l.categoria}</p>}
            </div>
            <div className="px-4 py-3 text-sm text-[var(--d2b-text-secondary)] whitespace-nowrap">{l.vencimento}</div>
            <div className="px-4 py-3 text-sm font-semibold whitespace-nowrap" style={{ color: tipo === 'entrada' ? '#22C55E' : '#EF4444' }}>
              {fmtBRL(l.valor)}
            </div>
            <div className="px-4 py-3">
              <StatusBadge status={l.status} />
            </div>
          </div>
        ))}
      </div>

      {showModal && <ModalLancamento tipo={tipo} onClose={() => setShowModal(false)} />}
    </div>
  )
}

// ─── TAB: DASHBOARD ──────────────────────────────────────────────────────────
// ─── API type (subset of MovimentoFinanceiroDto) ──────────────────────────────
type MovimentoDto = {
  id: string
  tipo: string
  valorParcela: number
  valorPago: number
  dataVencimento: string   // YYYY-MM-DD
  dataPagamento: string | null
  status: string           // 'Em Aberto' | 'Pago' | 'Atrasado'
}

function buildChartData(movs: MovimentoDto[]): { date: string; valor: number }[] {
  const map = new Map<string, number>()
  for (const m of movs) {
    if (!m.dataVencimento) continue
    const [y, mo, d] = m.dataVencimento.split('-')
    const label = `${d}/${mo}`
    map.set(label, (map.get(label) ?? 0) + (m.valorParcela ?? 0))
  }
  return Array.from(map.entries())
    .sort((a, b) => a[0].localeCompare(b[0]))
    .map(([date, valor]) => ({ date, valor }))
}

function TabDashboard({ empresaId }: { empresaId: string | null }) {
  const [receberMovs, setReceberMovs] = useState<MovimentoDto[]>([])
  const [pagarMovs,   setPagarMovs]   = useState<MovimentoDto[]>([])
  const [loading,     setLoading]     = useState(true)

  useEffect(() => {
    if (!empresaId) { setLoading(false); return }
    setLoading(true)
    Promise.all([
      fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/v1/movimentos-financeiros/empresa/${empresaId}`).then((r) => r.json()),
    ]).then(([all]) => {
      const arr: MovimentoDto[] = Array.isArray(all) ? all : []
      setReceberMovs(arr.filter((m) => m.tipo !== 'A_PAGAR'))
      setPagarMovs(arr.filter((m) => m.tipo === 'A_PAGAR'))
    }).catch(() => {}).finally(() => setLoading(false))
  }, [empresaId])

  const recebido  = receberMovs.reduce((s, m) => s + (m.valorPago ?? 0), 0)
  const aReceber  = receberMovs.filter((m) => m.status !== 'Pago').reduce((s, m) => s + ((m.valorParcela ?? 0) - (m.valorPago ?? 0)), 0)
  const totalRec  = recebido + aReceber

  const quitado   = pagarMovs.reduce((s, m) => s + (m.valorPago ?? 0), 0)
  const aPagar    = pagarMovs.filter((m) => m.status !== 'Pago').reduce((s, m) => s + ((m.valorParcela ?? 0) - (m.valorPago ?? 0)), 0)
  const totalPag  = quitado + aPagar

  const chartReceber = buildChartData(receberMovs)
  const chartPagar   = buildChartData(pagarMovs)

  const STAT_ROWS_REC = [
    { label: 'Recebido',              value: recebido, color: '#22C55E' },
    { label: 'A Receber (Em aberto)', value: aReceber, color: '#A78BCC' },
    { label: 'Total a Receber',       value: totalRec, color: '#14B8A6' },
  ]
  const STAT_ROWS_PAG = [
    { label: 'Quitado',               value: quitado,  color: '#22C55E' },
    { label: 'A Pagar (Em aberto)',   value: aPagar,   color: '#A78BCC' },
    { label: 'Total a Pagar',         value: totalPag, color: '#EF4444' },
  ]

  if (loading) {
    return (
      <div className="flex items-center justify-center h-48">
        <div className="w-7 h-7 rounded-full border-2 border-[#7C4DFF] border-t-transparent animate-spin" />
      </div>
    )
  }

  return (
    <div className="space-y-7">
      {/* ── Header ── */}
      <div className="flex items-start justify-between">
        <div>
          <h2 className="text-base font-bold text-[var(--d2b-text-primary)]">Dashboard</h2>
          <p className="text-xs text-[var(--d2b-text-secondary)] mt-0.5">Faça análises e crie relatórios gerenciais facilmente</p>
        </div>
        <div className="flex gap-2">
          <button className={BTN_GHOST + ' flex items-center gap-1.5'}>
            <Download size={14} /> DRE Modelo
          </button>
          <button className={BTN_GHOST + ' flex items-center gap-1.5'}>
            <Filter size={14} /> Filtrar dados
          </button>
        </div>
      </div>

      {/* ── Conta a Receber ── */}
      <div>
        <h3 className="text-sm font-semibold text-[var(--d2b-text-secondary)] mb-3">Conta a Receber</h3>
        <div className="grid grid-cols-2 gap-5 items-stretch">
          {/* Stat rows */}
          <div className="rounded-xl border border-[var(--d2b-border)] bg-[var(--d2b-bg-surface)] overflow-hidden">
            {STAT_ROWS_REC.map(({ label, value, color }, i) => (
              <div
                key={label}
                className={`flex items-center gap-3 px-5 py-4 ${i < STAT_ROWS_REC.length - 1 ? 'border-b border-[var(--d2b-border)]' : ''}`}
              >
                <div className="w-8 h-8 rounded-lg bg-[var(--d2b-hover)] flex items-center justify-center shrink-0">
                  <DollarSign size={15} className="text-[#7C4DFF]" strokeWidth={1.8} />
                </div>
                <span className="text-sm text-[var(--d2b-text-secondary)] flex-1">{label}</span>
                <span className="text-sm font-bold" style={{ color }}>{fmtBRL(value)}</span>
              </div>
            ))}
          </div>
          {/* Chart */}
          <div className="rounded-xl border border-[var(--d2b-border)] bg-[var(--d2b-bg-surface)] p-4" style={{ minHeight: 168 }}>
            {chartReceber.length === 0 ? (
              <div className="h-full flex items-center justify-center text-xs text-[var(--d2b-text-muted)]">Sem dados</div>
            ) : (
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={chartReceber} margin={{ top: 4, right: 4, left: -28, bottom: 0 }}>
                  <defs>
                    <linearGradient id="recGrad" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%"  stopColor="#38BDF8" stopOpacity={0.35} />
                      <stop offset="95%" stopColor="#38BDF8" stopOpacity={0.02} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="rgba(124,77,255,0.08)" />
                  <XAxis dataKey="date" tick={{ fontSize: 9, fill: '#6B4E8A' }} axisLine={false} tickLine={false} />
                  <YAxis tick={{ fontSize: 9, fill: '#6B4E8A' }} axisLine={false} tickLine={false} />
                  <Tooltip
                    contentStyle={{ background: '#1A0A38', border: '1px solid rgba(124,77,255,0.25)', borderRadius: 8 }}
                    labelStyle={{ color: '#A78BCC', fontSize: 11 }}
                    itemStyle={{ color: '#38BDF8', fontSize: 11 }}
                    formatter={(v: number) => [fmtBRL(v), 'A Receber']}
                  />
                  <Area type="monotone" dataKey="valor" stroke="#38BDF8" strokeWidth={2.5} fill="url(#recGrad)" dot={false} />
                </AreaChart>
              </ResponsiveContainer>
            )}
          </div>
        </div>
      </div>

      <div className="border-t border-[var(--d2b-border)]" />

      {/* ── Conta a Pagar ── */}
      <div>
        <h3 className="text-sm font-semibold text-[var(--d2b-text-secondary)] mb-3">Conta a Pagar</h3>
        <div className="grid grid-cols-2 gap-5 items-stretch">
          {/* Chart */}
          <div className="rounded-xl border border-[var(--d2b-border)] bg-[var(--d2b-bg-surface)] p-4" style={{ minHeight: 168 }}>
            {chartPagar.length === 0 ? (
              <div className="h-full flex items-center justify-center text-xs text-[var(--d2b-text-muted)]">Sem dados</div>
            ) : (
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={chartPagar} margin={{ top: 4, right: 4, left: -28, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="rgba(124,77,255,0.08)" />
                  <XAxis dataKey="date" tick={{ fontSize: 9, fill: '#6B4E8A' }} axisLine={false} tickLine={false} />
                  <YAxis tick={{ fontSize: 9, fill: '#6B4E8A' }} axisLine={false} tickLine={false} />
                  <Tooltip
                    contentStyle={{ background: '#1A0A38', border: '1px solid rgba(124,77,255,0.25)', borderRadius: 8 }}
                    labelStyle={{ color: '#A78BCC', fontSize: 11 }}
                    itemStyle={{ color: '#EF4444', fontSize: 11 }}
                    formatter={(v: number) => [fmtBRL(v), 'A Pagar']}
                  />
                  <Line type="monotone" dataKey="valor" stroke="#EF4444" strokeWidth={2.5} dot={false} />
                </LineChart>
              </ResponsiveContainer>
            )}
          </div>
          {/* Stat rows */}
          <div className="rounded-xl border border-[var(--d2b-border)] bg-[var(--d2b-bg-surface)] overflow-hidden">
            {STAT_ROWS_PAG.map(({ label, value, color }, i) => (
              <div
                key={label}
                className={`flex items-center gap-3 px-5 py-4 ${i < STAT_ROWS_PAG.length - 1 ? 'border-b border-[var(--d2b-border)]' : ''}`}
              >
                <div className="w-8 h-8 rounded-lg bg-[var(--d2b-hover)] flex items-center justify-center shrink-0">
                  <DollarSign size={15} className="text-[#7C4DFF]" strokeWidth={1.8} />
                </div>
                <span className="text-sm text-[var(--d2b-text-secondary)] flex-1">{label}</span>
                <span className="text-sm font-bold" style={{ color }}>{fmtBRL(value)}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}

// ─── TAB: MENSALIDADES ────────────────────────────────────────────────────────
type MensalidadeStatus = 'Em Aberto' | 'Pago' | 'Atrasado'

type Mensalidade = {
  id: number
  titulo: string
  profissional: string
  paciente: string
  data: string
  parcela: string
  recebido: number
  total: number
  status: MensalidadeStatus
}

const MOCK_MENSALIDADES: Mensalidade[] = [
  { id:1, titulo:'JEsse', profissional:'JESSE DOS SANTOS BEZERRA', paciente:'Monique Franca', data:'31/03/2026', parcela:'1/3', recebido:0, total:500, status:'Em Aberto' },
]

const PROFISSIONAIS_OPTS = ['JESSE DOS SANTOS BEZERRA']
const PACIENTES_OPTS = ['Monique Franca', 'Paciente Exemplo']

function ModalAdicionarMensalidade({ onClose, onSave }: {
  onClose: () => void
  onSave: (m: Mensalidade) => void
}) {
  const [titulo,    setTitulo]    = useState('')
  const [paciente,  setPaciente]  = useState('')
  const [prof,      setProf]      = useState('')
  const [data,      setData]      = useState('')
  const [parcelas,  setParcelas]  = useState('')
  const [valor,     setValor]     = useState('0,00')

  const INP_W = 'w-full border border-[#D8D0ED] rounded-md px-3 py-2.5 text-sm text-[#2D1B5A] placeholder:text-[#B0A0CC] focus:outline-none focus:border-[#7C4DFF] transition-colors bg-white'
  const LBL_W = 'absolute -top-2 left-3 z-10 bg-white px-1 text-[10px] font-medium text-[#9E8BBF] leading-none'

  function handleSave() {
    if (!titulo || !data || !valor) return
    onSave({
      id: Date.now(),
      titulo,
      profissional: prof || PROFISSIONAIS_OPTS[0],
      paciente: paciente || '',
      data,
      parcela: `1/${parcelas || '1'}`,
      recebido: 0,
      total: parseFloat(valor.replace(',', '.')) || 0,
      status: 'Em Aberto',
    })
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-xl mx-4">
        <div className="flex items-center justify-between px-6 py-4 border-b border-[#EDE8F5]">
          <h3 className="text-base font-bold text-[#2D1B5A]">Adicionar conta a receber</h3>
          <button onClick={onClose} className="text-[#9E8BBF] hover:text-[#2D1B5A] transition-colors"><X size={18} /></button>
        </div>
        <div className="px-6 py-5 space-y-4">
          {/* Título */}
          <div className="relative">
            <label className={LBL_W}>Título da Conta<span className="text-[#7C4DFF]">*</span></label>
            <input value={titulo} onChange={(e) => setTitulo(e.target.value)} className={INP_W} />
          </div>
          {/* Paciente + Profissional */}
          <div className="grid grid-cols-2 gap-4">
            <div className="relative">
              <label className={LBL_W}>Selecione um paciente</label>
              <div className="relative">
                <select value={paciente} onChange={(e) => setPaciente(e.target.value)}
                  className={INP_W + ' appearance-none pr-8 cursor-pointer'}>
                  <option value="">Busque pelo paciente</option>
                  {PACIENTES_OPTS.map((p) => <option key={p} value={p}>{p}</option>)}
                </select>
                <ChevronDown size={13} className="absolute right-3 top-1/2 -translate-y-1/2 text-[#9E8BBF] pointer-events-none" />
              </div>
            </div>
            <div className="relative">
              <label className={LBL_W}>Profissional</label>
              <div className="relative">
                <select value={prof} onChange={(e) => setProf(e.target.value)}
                  className={INP_W + ' appearance-none pr-8 cursor-pointer'}>
                  <option value="">Selecione um profissional</option>
                  {PROFISSIONAIS_OPTS.map((p) => <option key={p} value={p}>{p}</option>)}
                </select>
                <ChevronDown size={13} className="absolute right-3 top-1/2 -translate-y-1/2 text-[#9E8BBF] pointer-events-none" />
              </div>
            </div>
          </div>
          {/* Data + Parcelas */}
          <div className="grid grid-cols-2 gap-4">
            <div className="relative">
              <label className={LBL_W}>Data do Recebimento<span className="text-[#7C4DFF]">*</span></label>
              <input value={data} onChange={(e) => setData(e.target.value)} placeholder="dd/mm/aaaa" className={INP_W} />
            </div>
            <div className="relative">
              <label className={LBL_W}>Número de Parcelas<span className="text-[#7C4DFF]">*</span></label>
              <input value={parcelas} onChange={(e) => setParcelas(e.target.value)} placeholder="1" className={INP_W} />
            </div>
          </div>
          {/* Valor */}
          <div className="relative w-1/2">
            <label className={LBL_W}>Valor<span className="text-[#7C4DFF]">*</span></label>
            <input value={`R$ ${valor}`}
              onChange={(e) => setValor(e.target.value.replace(/^R\$\s?/, ''))}
              className={INP_W} />
          </div>
        </div>
        <div className="px-6 py-4 border-t border-[#EDE8F5] flex items-center justify-end gap-3">
          <button onClick={onClose} className="px-5 py-2 rounded-lg text-sm font-medium text-[#9E8BBF] hover:bg-[#F3F0FA] transition-colors">Cancelar</button>
          <button onClick={handleSave} className="px-5 py-2 rounded-lg text-sm font-bold text-white bg-[#7C4DFF] hover:bg-[#5B21B6] transition-colors">Salvar</button>
        </div>
      </div>
    </div>
  )
}

function ModalEditarMensalidade({ row, onClose, onSave }: {
  row: Mensalidade
  onClose: () => void
  onSave: (updated: Mensalidade) => void
}) {
  const [titulo,      setTitulo]      = useState(row.titulo)
  const [prof,        setProf]        = useState(row.profissional)
  const [data,        setData]        = useState(row.data)
  const [valor,       setValor]       = useState(row.total.toFixed(2).replace('.', ','))
  const [recebido,    setRecebido]    = useState(row.recebido.toFixed(2).replace('.', ','))

  const INP_W = 'w-full border border-[#D8D0ED] rounded-md px-3 py-2.5 text-sm text-[#2D1B5A] placeholder:text-[#B0A0CC] focus:outline-none focus:border-[#7C4DFF] transition-colors bg-white'
  const LBL_W = 'absolute -top-2 left-3 z-10 bg-white px-1 text-[10px] font-medium text-[#9E8BBF] leading-none'

  function handleSave() {
    onSave({
      ...row,
      titulo,
      profissional: prof,
      data,
      total: parseFloat(valor.replace(',', '.')) || 0,
      recebido: parseFloat(recebido.replace(',', '.')) || 0,
      status: (parseFloat(recebido.replace(',', '.')) || 0) >= (parseFloat(valor.replace(',', '.')) || 0) ? 'Pago' : 'Em Aberto',
    })
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-xl mx-4">
        <div className="flex items-center justify-between px-6 py-4 border-b border-[#EDE8F5]">
          <h3 className="text-base font-bold text-[#2D1B5A]">Alterar informações da conta</h3>
          <button onClick={onClose} className="text-[#9E8BBF] hover:text-[#2D1B5A] transition-colors"><X size={18} /></button>
        </div>
        <div className="px-6 py-5 space-y-4">
          {/* Título */}
          <div className="relative">
            <label className={LBL_W}>Título da Conta<span className="text-[#7C4DFF]">*</span></label>
            <input value={titulo} onChange={(e) => setTitulo(e.target.value)} className={INP_W} />
          </div>
          {/* Paciente (read-only) + Profissional */}
          <div className="grid grid-cols-2 gap-4">
            <div className="relative">
              <label className={LBL_W}>Paciente</label>
              <input value={row.paciente} readOnly className={INP_W + ' bg-[#F3F0FA] text-[#9E8BBF] cursor-not-allowed'} />
            </div>
            <div className="relative">
              <label className={LBL_W}>Profissional<span className="text-[#7C4DFF]">*</span></label>
              <div className="relative">
                <select value={prof} onChange={(e) => setProf(e.target.value)}
                  className={INP_W + ' appearance-none pr-8 cursor-pointer'}>
                  {PROFISSIONAIS_OPTS.map((p) => <option key={p} value={p}>{p}</option>)}
                </select>
                <ChevronDown size={13} className="absolute right-3 top-1/2 -translate-y-1/2 text-[#9E8BBF] pointer-events-none" />
              </div>
            </div>
          </div>
          {/* Data + Valor */}
          <div className="grid grid-cols-2 gap-4">
            <div className="relative">
              <label className={LBL_W}>Data do Recebimento<span className="text-[#7C4DFF]">*</span></label>
              <input value={data} onChange={(e) => setData(e.target.value)} className={INP_W} />
            </div>
            <div className="relative">
              <label className={LBL_W}>Valor<span className="text-[#7C4DFF]">*</span></label>
              <input value={`R$ ${valor}`}
                onChange={(e) => setValor(e.target.value.replace(/^R\$\s?/, ''))}
                className={INP_W} />
            </div>
          </div>
          {/* Valor Recebido + Quitar */}
          <div className="flex items-end gap-3">
            <div className="relative flex-1">
              <label className={LBL_W}>Valor Recebido<span className="text-[#7C4DFF]">*</span></label>
              <input value={`R$ ${recebido}`}
                onChange={(e) => setRecebido(e.target.value.replace(/^R\$\s?/, ''))}
                className={INP_W} />
            </div>
            <button onClick={() => setRecebido(valor)}
              className="flex items-center gap-1.5 px-4 py-2.5 rounded-lg text-sm font-bold text-white bg-[#14B8A6] hover:bg-[#0D9488] transition-colors whitespace-nowrap">
              <Check size={13} /> Quitar
            </button>
          </div>
        </div>
        <div className="px-6 py-4 border-t border-[#EDE8F5] flex items-center justify-end gap-3">
          <button onClick={onClose} className="px-5 py-2 rounded-lg text-sm font-medium text-[#9E8BBF] hover:bg-[#F3F0FA] transition-colors">Cancelar</button>
          <button onClick={handleSave} className="px-5 py-2 rounded-lg text-sm font-bold text-white bg-[#7C4DFF] hover:bg-[#5B21B6] transition-colors">Salvar</button>
        </div>
      </div>
    </div>
  )
}

function TabMensalidades() {
  const [search,     setSearch]     = useState('')
  const [rows,       setRows]       = useState<Mensalidade[]>(MOCK_MENSALIDADES)
  const [page,       setPage]       = useState(1)
  const [pageSize,   setPageSize]   = useState(10)
  const [pageSizeOpen, setPSOOpen]  = useState(false)
  const [modalAdd,   setModalAdd]   = useState(false)
  const [editRow,    setEditRow]    = useState<Mensalidade | null>(null)

  const filtered = rows.filter((r) =>
    r.titulo.toLowerCase().includes(search.toLowerCase()) ||
    r.paciente.toLowerCase().includes(search.toLowerCase()) ||
    r.profissional.toLowerCase().includes(search.toLowerCase())
  )
  const totalPages = Math.max(1, Math.ceil(filtered.length / pageSize))
  const pageRows   = filtered.slice((page - 1) * pageSize, page * pageSize)

  function handleAdd(m: Mensalidade) {
    setRows((prev) => [...prev, m])
    setModalAdd(false)
  }
  function handleEdit(updated: Mensalidade) {
    setRows((prev) => prev.map((r) => r.id === updated.id ? updated : r))
    setEditRow(null)
  }
  function handleDelete(id: number) {
    setRows((prev) => prev.filter((r) => r.id !== id))
  }

  const totalRecebido = rows.reduce((s, r) => s + r.recebido, 0)
  const aReceber      = rows.reduce((s, r) => s + (r.total - r.recebido), 0)

  const statusMap: Record<MensalidadeStatus, string> = {
    'Pago':      'text-[#22C55E]',
    'Em Aberto': 'text-[#EF4444]',
    'Atrasado':  'text-[#F59E0B]',
  }

  return (
    <>
    {modalAdd && <ModalAdicionarMensalidade onClose={() => setModalAdd(false)} onSave={handleAdd} />}
    {editRow  && <ModalEditarMensalidade row={editRow} onClose={() => setEditRow(null)} onSave={handleEdit} />}

    <div className="rounded-xl border border-[var(--d2b-border)] bg-[var(--d2b-bg-surface)] overflow-hidden">
      {/* Header */}
      <div className="px-6 pt-6 pb-4 border-b border-[var(--d2b-border)]">
        <div className="flex items-start justify-between">
          <div>
            <h2 className="text-base font-bold text-[var(--d2b-text-primary)]">Mensalidades</h2>
            <p className="text-xs text-[var(--d2b-text-secondary)] mt-0.5">Controle o recebimento mensal de seus pacientes e de outras contas da sua clínica.</p>
          </div>
          <button onClick={() => setModalAdd(true)} className={BTN_PRIMARY + ' flex items-center gap-1.5'}>
            <Plus size={14} /> Adicionar
          </button>
        </div>
        <div className="flex items-center gap-2 mt-4">
          <div className="relative">
            <Search size={13} className="absolute left-3 top-1/2 -translate-y-1/2 text-[var(--d2b-text-muted)]" />
            <input type="text" placeholder="Pesquisar" value={search}
              onChange={(e) => { setSearch(e.target.value); setPage(1) }}
              className={INP + ' pl-8 w-48'} />
          </div>
          <button className="flex items-center gap-1.5 px-3 py-2 text-xs font-semibold text-[var(--d2b-text-secondary)] border border-[var(--d2b-border-strong)] rounded-lg hover:border-[#7C4DFF] hover:text-[var(--d2b-text-primary)] transition-colors">
            <Filter size={13} /> Filtrar
          </button>
        </div>
      </div>

      {/* Table */}
      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-[var(--d2b-border)] bg-[var(--d2b-bg-main)]">
              <th className="px-4 py-3 text-[10px] font-semibold text-[var(--d2b-text-muted)] uppercase tracking-widest text-left w-24">AÇÕES</th>
              <th className="px-4 py-3 text-[10px] font-semibold text-[var(--d2b-text-muted)] uppercase tracking-widest text-left">NOME</th>
              {['PROFISSIONAL', 'PACIENTE', 'DATA'].map((h) => (
                <th key={h} className="px-4 py-3 text-[10px] font-semibold text-[var(--d2b-text-muted)] uppercase tracking-widest text-left">
                  <button className="flex items-center gap-1 hover:text-[var(--d2b-text-secondary)] transition-colors">
                    {h} <ChevronDown size={10} />
                  </button>
                </th>
              ))}
              <th className="px-4 py-3 text-[10px] font-semibold text-[var(--d2b-text-muted)] uppercase tracking-widest text-right">PAGAMENTO</th>
            </tr>
          </thead>
          <tbody>
            {pageRows.length === 0 ? (
              <tr>
                <td colSpan={6} className="px-4 py-10 text-center text-sm text-[var(--d2b-text-muted)]">Nenhuma mensalidade encontrada.</td>
              </tr>
            ) : pageRows.map((r) => (
              <tr key={r.id} className="border-b border-[var(--d2b-border)] hover:bg-[var(--d2b-hover)] transition-colors">
                {/* Ações */}
                <td className="px-4 py-4">
                  <div className="flex items-center gap-2">
                    <button onClick={() => setEditRow(r)}
                      className="w-8 h-8 flex items-center justify-center rounded-full border border-[var(--d2b-border-strong)] text-[#7C4DFF] hover:bg-[var(--d2b-hover)] transition-colors">
                      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/></svg>
                    </button>
                    <button onClick={() => handleDelete(r.id)}
                      className="w-8 h-8 flex items-center justify-center rounded-full border border-[rgba(239,68,68,0.30)] text-[#EF4444] hover:bg-[rgba(239,68,68,0.10)] transition-colors">
                      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8"><polyline points="3 6 5 6 21 6"/><path d="M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6"/><path d="M10 11v6M14 11v6"/><path d="M9 6V4a1 1 0 0 1 1-1h4a1 1 0 0 1 1 1v2"/></svg>
                    </button>
                  </div>
                </td>
                {/* Nome */}
                <td className="px-4 py-4 font-semibold text-[var(--d2b-text-primary)]">{r.titulo}</td>
                {/* Profissional */}
                <td className="px-4 py-4 text-[var(--d2b-text-secondary)]">{r.profissional}</td>
                {/* Paciente */}
                <td className="px-4 py-4 text-[var(--d2b-text-secondary)]">{r.paciente}</td>
                {/* Data */}
                <td className="px-4 py-4">
                  <p className="text-[var(--d2b-text-secondary)]">{r.data}</p>
                  <p className="text-xs text-[#7C4DFF] mt-0.5">Parcela {r.parcela}</p>
                </td>
                {/* Pagamento */}
                <td className="px-4 py-4 text-right">
                  <p className="text-sm font-medium text-[var(--d2b-text-primary)]">
                    R$ {r.recebido.toFixed(2).replace('.', ',')} de R$ {r.total.toFixed(2).replace('.', ',')}
                  </p>
                  <p className={`text-xs flex items-center gap-1 justify-end mt-0.5 ${statusMap[r.status]}`}>
                    <svg width="10" height="10" viewBox="0 0 24 24" fill="currentColor">
                      <circle cx="12" cy="12" r="10"/>
                      <path fill="white" d="M12 8v4M12 16h.01" strokeWidth="2"/>
                    </svg>
                    {r.status}
                  </p>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Footer */}
      <div className="px-6 py-4 border-t border-[var(--d2b-border)] flex items-center justify-between flex-wrap gap-3">
        <button className={BTN_GHOST + ' flex items-center gap-1.5'}>
          <Upload size={13} /> Exportar Dados
        </button>
        <div className="flex items-center gap-6">
          <div className="text-right">
            <p className="text-xs text-[var(--d2b-text-secondary)]">
              Total Recebido: <span className="font-semibold text-[var(--d2b-text-primary)]">R$ {totalRecebido.toFixed(2).replace('.', ',')}</span>
            </p>
            <p className="text-xs text-[var(--d2b-text-secondary)]">
              A receber: <span className="font-semibold text-[var(--d2b-text-primary)]">R$ {aReceber.toFixed(2).replace('.', ',')}</span>
            </p>
          </div>
          {/* Pagination */}
          <div className="flex items-center gap-1">
            {(['«','‹','›','»'] as const).map((sym, i) => {
              const acts = [() => setPage(1), () => setPage((p) => Math.max(1,p-1)), () => setPage((p) => Math.min(totalPages,p+1)), () => setPage(totalPages)]
              return (
                <button key={sym} onClick={acts[i]}
                  className="w-7 h-7 flex items-center justify-center rounded text-sm text-[var(--d2b-text-secondary)] hover:bg-[var(--d2b-hover)] hover:text-[var(--d2b-text-primary)] transition-colors">
                  {sym}
                </button>
              )
            })}
            <span className="w-7 h-7 flex items-center justify-center rounded bg-[#7C4DFF] text-white text-xs font-semibold">{page}</span>
            <div className="relative ml-1">
              <button onClick={() => setPSOOpen((v) => !v)}
                className="flex items-center gap-1 px-2 py-1.5 border border-[var(--d2b-border-strong)] rounded text-xs text-[var(--d2b-text-secondary)] hover:border-[#7C4DFF] transition-colors">
                {pageSize} <ChevronDown size={11} />
              </button>
              {pageSizeOpen && (
                <div className="absolute bottom-full mb-1 right-0 bg-[var(--d2b-bg-elevated)] border border-[var(--d2b-border-strong)] rounded-lg shadow-xl overflow-hidden z-20">
                  {[5,10,20,50].map((n) => (
                    <button key={n} onClick={() => { setPageSize(n); setPage(1); setPSOOpen(false) }}
                      className={`w-full text-left px-4 py-2 text-sm hover:bg-[var(--d2b-hover)] transition-colors ${pageSize===n?'text-[#7C4DFF] font-semibold':'text-[var(--d2b-text-primary)]'}`}>
                      {n}
                    </button>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
    </>
  )
}


// ─── Sub-tab nav ──────────────────────────────────────────────────────────────
type SubTabDef = { id: SubTab; label: string; Icon: LucideIcon }

const SUB_TABS: SubTabDef[] = [
  { id: 'dashboard',   label: 'Dashboard',    Icon: TrendingUp    },
  { id: 'receber',     label: 'A receber',    Icon: ArrowDownCircle },
  { id: 'mensalidades',label: 'Mensalidades', Icon: Calendar      },
  { id: 'pagar',       label: 'A pagar',      Icon: ArrowUpCircle },
]

// ─── Main component ───────────────────────────────────────────────────────────
export function FinanceiroView({ empresaId }: { empresaId: string | null }) {
  const [subTab, setSubTab] = useState<SubTab>('dashboard')

  const content = (() => {
    switch (subTab) {
      case 'dashboard':    return <TabDashboard empresaId={empresaId} />
      case 'receber':      return <TabContasReceber empresaId={empresaId} />
      case 'mensalidades': return <TabMensalidades />
      case 'pagar':        return <TabContasPagar empresaId={empresaId} />
    }
  })()

  return (
    <div className="flex h-full min-h-0">
      {/* ── Sub-menu lateral ── */}
      <aside className="flex flex-col w-[80px] shrink-0 border-r border-[var(--d2b-border)] bg-[var(--d2b-bg-surface)] py-3 gap-0.5 overflow-y-auto">
        {SUB_TABS.map(({ id, label, Icon }) => {
          const active = subTab === id
          return (
            <button
              key={id}
              onClick={() => setSubTab(id)}
              title={label}
              className={`flex flex-col items-center gap-1 py-3 mx-2 rounded-xl transition-all ${
                active ? 'bg-[var(--d2b-hover)]' : 'hover:bg-[var(--d2b-hover)]'
              }`}
            >
              <Icon size={20} color={active ? '#7C4DFF' : '#6B4E8A'} strokeWidth={active ? 2.5 : 1.5} />
              <span className="text-[9px] font-medium leading-tight text-center" style={{ color: active ? '#7C4DFF' : '#6B4E8A' }}>
                {label}
              </span>
            </button>
          )
        })}
      </aside>

      {/* ── Conteúdo ── */}
      <div className="flex-1 overflow-y-auto p-8">
        {content}
      </div>
    </div>
  )
}
