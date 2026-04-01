'use client'

import { useState, useRef } from 'react'
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

// ─── Shared styles ────────────────────────────────────────────────────────────
const INP =
  'w-full bg-[#0D0520] border border-[rgba(124,77,255,0.25)] rounded-md ' +
  'px-3 py-2.5 text-sm text-[#F5F0FF] placeholder:text-[#6B4E8A] ' +
  'focus:outline-none focus:border-[#7C4DFF] transition-colors'
const LBG = 'bg-[#0D0520]'
const BTN_GHOST =
  'px-5 py-2 rounded-md text-sm font-medium text-[#A78BCC] border border-[rgba(124,77,255,0.25)] hover:border-[#7C4DFF] hover:text-[#F5F0FF] transition-colors'
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

// ─── Mock data ────────────────────────────────────────────────────────────────
const RECEBER_DATA: Lancamento[] = [
  { id: 1, descricao: 'Consulta – Jesse Bezerra',  valor: 500,  vencimento: '01/04/2026', status: 'aberto',   tipo: 'entrada', paciente: 'Jesse Bezerra',    categoria: 'Consulta' },
  { id: 2, descricao: 'Retorno – Maria Silva',     valor: 150,  vencimento: '02/04/2026', status: 'aberto',   tipo: 'entrada', paciente: 'Maria Silva',      categoria: 'Retorno' },
  { id: 3, descricao: 'Procedimento – João Neto',  valor: 800,  vencimento: '28/03/2026', status: 'atrasado', tipo: 'entrada', paciente: 'João Neto',        categoria: 'Procedimento' },
  { id: 4, descricao: 'Teleconsulta – Ana Lopes',  valor: 200,  vencimento: '25/03/2026', status: 'pago',     tipo: 'entrada', paciente: 'Ana Lopes',        categoria: 'Teleconsulta' },
  { id: 5, descricao: 'Exame – Carlos Mendes',     valor: 300,  vencimento: '20/03/2026', status: 'pago',     tipo: 'entrada', paciente: 'Carlos Mendes',    categoria: 'Exame' },
]

const PAGAR_DATA: Lancamento[] = [
  { id: 6, descricao: 'Aluguel – Março/2026',      valor: 2500, vencimento: '05/04/2026', status: 'aberto',   tipo: 'saida', categoria: 'Aluguel' },
  { id: 7, descricao: 'Energia Elétrica',          valor: 380,  vencimento: '10/04/2026', status: 'aberto',   tipo: 'saida', categoria: 'Utilidades' },
  { id: 8, descricao: 'Sistema Agendart',          valor: 199,  vencimento: '15/04/2026', status: 'aberto',   tipo: 'saida', categoria: 'Software' },
  { id: 9, descricao: 'Fornecedor Materiais',      valor: 650,  vencimento: '18/03/2026', status: 'pago',     tipo: 'saida', categoria: 'Materiais' },
]

const MENSALIDADES_DATA: Lancamento[] = [
  { id: 10, descricao: 'Plano Mensal – Jesse',    valor: 150, vencimento: '01/04/2026', status: 'aberto',   tipo: 'entrada', paciente: 'Jesse Bezerra' },
  { id: 11, descricao: 'Plano Mensal – Maria',    valor: 150, vencimento: '05/04/2026', status: 'aberto',   tipo: 'entrada', paciente: 'Maria Silva'   },
  { id: 12, descricao: 'Plano Semestral – João',  valor: 750, vencimento: '10/04/2026', status: 'pago',     tipo: 'entrada', paciente: 'João Neto'     },
]

const CHART_RECEBER = [
  { date: '28/03', valor: 0 },
  { date: '29/03', valor: 50 },
  { date: '30/03', valor: 200 },
  { date: '31/03', valor: 500 },
  { date: '01/04', valor: 100 },
  { date: '02/04', valor: 0 },
]

const CHART_PAGAR = [
  { date: '28/03', valor: 0 },
  { date: '29/03', valor: 0 },
  { date: '30/03', valor: 0 },
  { date: '31/03', valor: 0 },
  { date: '01/04', valor: 0 },
  { date: '02/04', valor: 0 },
]

// ─── Contas a Receber types & mock ───────────────────────────────────────────
type StatusAgenda = 'Atendido' | 'Faltou' | 'Confirmado' | 'Aguardando' | 'Cancelado'

type AgendaReceber = {
  id: number
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
  { id:1, paciente:'Paciente Exemplo', telefone:'+5500000000000', convenio:'PARTICULAR', data:'30/03/2026 09:00', profissional:'JESSE DOS SANTOS BEZERRA', status:'Atendido',   recebido:0, total:0 },
  { id:2, paciente:'Paciente Exemplo', telefone:'+5500000000000', convenio:'PARTICULAR', data:'01/04/2026 09:00', profissional:'JESSE DOS SANTOS BEZERRA', status:'Faltou',     recebido:0, total:0 },
  { id:3, paciente:'Paciente Exemplo', telefone:'+5500000000000', convenio:'PARTICULAR', data:'03/04/2026 09:00', profissional:'JESSE DOS SANTOS BEZERRA', status:'Confirmado', recebido:0, total:0 },
]

function AgendaStatusBadge({ status }: { status: StatusAgenda }) {
  const map: Record<StatusAgenda, string> = {
    Atendido:  'bg-[rgba(34,197,94,0.15)] text-[#22C55E] border border-[rgba(34,197,94,0.3)]',
    Confirmado:'bg-[rgba(20,184,166,0.15)] text-[#14B8A6] border border-[rgba(20,184,166,0.3)]',
    Aguardando:'bg-[rgba(234,179,8,0.15)] text-[#EAB308] border border-[rgba(234,179,8,0.3)]',
    Faltou:    'bg-[rgba(239,68,68,0.15)] text-[#EF4444] border border-[rgba(239,68,68,0.3)]',
    Cancelado: 'bg-[rgba(107,78,138,0.20)] text-[#A78BCC] border border-[rgba(124,77,255,0.25)]',
  }
  return (
    <span className={`text-xs font-semibold px-3 py-1 rounded-md ${map[status]}`}>{status}</span>
  )
}

// ─── Alterar Status & Pagamento modal ────────────────────────────────────────
type EditRow = {
  id: number
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

  function setField(id: number, field: keyof EditRow, val: string) {
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

function TabContasReceber() {
  const [search, setSearch]             = useState('')
  const [selected, setSelected]         = useState<number[]>([])
  const [page, setPage]                 = useState(1)
  const [pageSize, setPageSize]         = useState(10)
  const [pageSizeOpen, setPageSizeOpen] = useState(false)
  const [rows, setRows]                 = useState<AgendaReceber[]>(MOCK_AGENDA_RECEBER)
  const [acoesOpen, setAcoesOpen]       = useState(false)
  const [modalAlterarOpen, setModalAlterarOpen] = useState(false)
  const [modalRecibo, setModalRecibo]   = useState<AgendaReceber | null>(null)

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
  function toggleOne(id: number) {
    setSelected((s) => s.includes(id) ? s.filter((x) => x !== id) : [...s, id])
  }

  function handleSaveAlteracoes(edits: EditRow[]) {
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
  }

  const selectedRows = rows.filter((r) => selected.includes(r.id))
  const totalRecebido = rows.reduce((s, r) => s + r.recebido, 0)
  const total         = rows.reduce((s, r) => s + r.total, 0)

  return (
    <>
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
    <div className="rounded-xl border border-[rgba(124,77,255,0.18)] bg-[#120328] overflow-hidden">
      {/* ── Header ── */}
      <div className="px-6 pt-6 pb-4 border-b border-[rgba(124,77,255,0.12)]">
        <h2 className="text-base font-bold text-[#F5F0FF]">Contas a receber</h2>
        <p className="text-xs text-[#A78BCC] mt-0.5">Controle o recebimento do pagamento de seus agendamentos e de outras contas que achar necessário.</p>

        <div className="flex items-center justify-between mt-4 flex-wrap gap-3">
          <span className="text-sm font-medium text-[#7C4DFF] underline cursor-pointer hover:text-[#A78BCC] transition-colors">
            Lista de agendamentos
          </span>
          <div className="flex items-center gap-2">
            <div className="relative">
              <Search size={13} className="absolute left-3 top-1/2 -translate-y-1/2 text-[#6B4E8A]" />
              <input type="text" placeholder="Pesquisar" value={search}
                onChange={(e) => { setSearch(e.target.value); setPage(1) }}
                className={INP + ' pl-8 w-44'} />
            </div>
            <button className="flex items-center gap-1.5 px-3 py-2 text-xs font-semibold text-[#A78BCC] border border-[rgba(124,77,255,0.25)] rounded-lg hover:border-[#7C4DFF] hover:text-[#F5F0FF] transition-colors">
              <Filter size={13} /> Filtrar dados
            </button>
          </div>
        </div>
      </div>

      {/* ── Table ── */}
      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-[rgba(124,77,255,0.12)] bg-[#0D0520]">
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
                      <div className="absolute top-full mt-1 left-0 bg-[#1A0A38] border border-[rgba(124,77,255,0.30)] rounded-lg shadow-xl z-30 min-w-[200px] py-1">
                        <p className="px-4 py-1.5 text-[10px] font-bold text-[#6B4E8A] uppercase tracking-widest">Ações Massivas</p>
                        <button onClick={() => { setModalAlterarOpen(true); setAcoesOpen(false) }}
                          className="w-full flex items-center gap-2 px-4 py-2 text-sm text-[#F5F0FF] hover:bg-[rgba(124,77,255,0.12)] transition-colors text-left">
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
                  <button className="flex items-center gap-1 text-[10px] font-semibold text-[#6B4E8A] uppercase tracking-widest hover:text-[#A78BCC] transition-colors">
                    PACIENTE <ChevronDown size={10} />
                  </button>
                )}
              </th>
              {[['DATA'],['PROFISSIONAL'],['SERVIÇOS & STATUS'],['PAGAMENTO']].map(([h], i) => (
                <th key={h} className={`px-4 py-3 text-[10px] font-semibold text-[#6B4E8A] uppercase tracking-widest ${i === 3 ? 'text-right' : 'text-left'}`}>
                  {i < 2 ? (
                    <button className="flex items-center gap-1 hover:text-[#A78BCC] transition-colors">
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
                <td colSpan={6} className="px-4 py-10 text-center text-sm text-[#6B4E8A]">Nenhum agendamento encontrado.</td>
              </tr>
            ) : pageRows.map((r) => (
              <tr key={r.id} className="border-b border-[rgba(124,77,255,0.08)] hover:bg-[rgba(124,77,255,0.04)] transition-colors">
                <td className="px-4 py-4">
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
                      <button onClick={() => setModalRecibo(r)}
                        className="absolute inset-0 rounded-full bg-[#7C4DFF] flex items-center justify-center opacity-0 group-hover/avatar:opacity-100 transition-opacity cursor-pointer"
                        title="Emitir Recibo">
                        <span className="text-[9px] font-bold text-white leading-tight text-center px-0.5">Emitir<br/>Recibo</span>
                      </button>
                    </div>
                    <div>
                      <p className="font-semibold text-[#F5F0FF]">{r.paciente}</p>
                      <p className="text-xs text-[#6B4E8A]">{r.telefone}</p>
                      <span className="text-[10px] font-semibold text-[#A78BCC] border border-[rgba(124,77,255,0.25)] rounded px-1.5 py-0.5 mt-0.5 inline-block">
                        {r.convenio}
                      </span>
                    </div>
                  </div>
                </td>
                <td className="px-4 py-4 text-[#A78BCC] whitespace-nowrap">{r.data}</td>
                <td className="px-4 py-4 text-[#A78BCC] whitespace-nowrap">{r.profissional}</td>
                <td className="px-4 py-4"><AgendaStatusBadge status={r.status} /></td>
                <td className="px-4 py-4 text-right">
                  <p className="text-sm font-medium text-[#F5F0FF]">
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
      <div className="px-6 py-4 border-t border-[rgba(124,77,255,0.12)] flex items-center justify-between flex-wrap gap-3">
        <button className={BTN_GHOST + ' flex items-center gap-1.5'}>
          <Upload size={13} /> Exportar Dados
        </button>

        <div className="flex items-center gap-6">
          <div className="text-right">
            <p className="text-xs text-[#A78BCC]">
              Total Recebido: <span className="font-semibold text-[#F5F0FF]">R$ {totalRecebido.toFixed(2).replace('.', ',')}</span>
            </p>
            <p className="text-xs text-[#A78BCC]">
              Total: <span className="font-semibold text-[#F5F0FF]">R$ {total.toFixed(2).replace('.', ',')}</span>
            </p>
          </div>

          {/* Pagination */}
          <div className="flex items-center gap-1">
            {(['«', '‹', '›', '»'] as const).map((sym, i) => {
              const acts = [() => setPage(1), () => setPage((p) => Math.max(1, p - 1)), () => setPage((p) => Math.min(totalPages, p + 1)), () => setPage(totalPages)]
              return (
                <button key={sym} onClick={acts[i]}
                  className="w-7 h-7 flex items-center justify-center rounded text-sm text-[#A78BCC] hover:bg-[rgba(124,77,255,0.12)] hover:text-[#F5F0FF] transition-colors">
                  {sym}
                </button>
              )
            })}
            <span className="w-7 h-7 flex items-center justify-center rounded bg-[#7C4DFF] text-white text-xs font-semibold">{page}</span>
            <div className="relative ml-1">
              <button onClick={() => setPageSizeOpen((v) => !v)}
                className="flex items-center gap-1 px-2 py-1.5 border border-[rgba(124,77,255,0.25)] rounded text-xs text-[#A78BCC] hover:border-[#7C4DFF] transition-colors">
                {pageSize} <ChevronDown size={11} />
              </button>
              {pageSizeOpen && (
                <div className="absolute bottom-full mb-1 right-0 bg-[#1A0A38] border border-[rgba(124,77,255,0.30)] rounded-lg shadow-xl overflow-hidden z-20">
                  {[5, 10, 20, 50].map((n) => (
                    <button key={n} onClick={() => { setPageSize(n); setPage(1); setPageSizeOpen(false) }}
                      className={`w-full text-left px-4 py-2 text-sm hover:bg-[rgba(124,77,255,0.12)] transition-colors ${pageSize === n ? 'text-[#7C4DFF] font-semibold' : 'text-[#F5F0FF]'}`}>
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
    aberto:   { label: 'Em aberto', cls: 'bg-[rgba(124,77,255,0.10)] text-[#A78BCC] border border-[rgba(124,77,255,0.25)]' },
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
      <label className={`absolute -top-2 left-3 z-10 ${LBG} px-1 text-[10px] font-medium text-[#A78BCC] leading-none`}>
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
        <ChevronDown size={13} className="absolute right-3 top-1/2 -translate-y-1/2 text-[#A78BCC] pointer-events-none" />
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
      <div className="bg-[#120328] border border-[rgba(124,77,255,0.25)] rounded-xl shadow-2xl w-full max-w-md mx-4 p-6">
        <div className="flex items-center justify-between mb-5">
          <h3 className="text-base font-bold text-[#F5F0FF]">
            {tipo === 'entrada' ? 'Novo Recebimento' : 'Nova Despesa'}
          </h3>
          <button onClick={onClose} className="text-[#6B4E8A] hover:text-[#F5F0FF] transition-colors">
            <X size={18} />
          </button>
        </div>

        <div className="space-y-4">
          <div className="relative">
            <label className={`absolute -top-2 left-3 z-10 ${LBG} px-1 text-[10px] font-medium text-[#A78BCC] leading-none`}>
              Descrição<span className="text-[#7C4DFF] ml-0.5">*</span>
            </label>
            <input value={descricao} onChange={(e) => setDescricao(e.target.value)} className={INP} />
          </div>
          <div className="relative">
            <label className={`absolute -top-2 left-3 z-10 ${LBG} px-1 text-[10px] font-medium text-[#A78BCC] leading-none`}>
              Valor (R$)<span className="text-[#7C4DFF] ml-0.5">*</span>
            </label>
            <input placeholder="0,00" value={valor} onChange={(e) => setValor(e.target.value)} className={INP} />
          </div>
          <div className="relative">
            <label className={`absolute -top-2 left-3 z-10 ${LBG} px-1 text-[10px] font-medium text-[#A78BCC] leading-none`}>
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
          <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-[#6B4E8A]" />
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
          <div key={label} className="flex items-center gap-3 rounded-lg border border-[rgba(124,77,255,0.18)] bg-[#120328] px-4 py-3">
            <div className="w-8 h-8 rounded-lg flex items-center justify-center shrink-0" style={{ background: `${color}20` }}>
              <DollarSign size={16} style={{ color }} />
            </div>
            <div>
              <p className="text-xs text-[#A78BCC]">{label}</p>
              <p className="text-sm font-bold" style={{ color }}>{fmtBRL(value)}</p>
            </div>
          </div>
        ))}
      </div>

      {/* Tabela */}
      <div className="rounded-lg border border-[rgba(124,77,255,0.18)] overflow-hidden">
        <div className="grid grid-cols-[1fr_auto_auto_auto] gap-0 bg-[#120328] border-b border-[rgba(124,77,255,0.12)]">
          <div className="px-4 py-2.5 text-[10px] font-semibold uppercase tracking-widest text-[#6B4E8A]">Descrição</div>
          <div className="px-4 py-2.5 text-[10px] font-semibold uppercase tracking-widest text-[#6B4E8A]">Vencimento</div>
          <div className="px-4 py-2.5 text-[10px] font-semibold uppercase tracking-widest text-[#6B4E8A]">Valor</div>
          <div className="px-4 py-2.5 text-[10px] font-semibold uppercase tracking-widest text-[#6B4E8A]">Status</div>
        </div>
        {filtered.length === 0 && (
          <div className="px-4 py-8 text-center text-sm text-[#6B4E8A]">Nenhum lançamento encontrado.</div>
        )}
        {filtered.map((l, i) => (
          <div
            key={l.id}
            className={`grid grid-cols-[1fr_auto_auto_auto] gap-0 px-0 items-center ${
              i < filtered.length - 1 ? 'border-b border-[rgba(124,77,255,0.08)]' : ''
            } hover:bg-[rgba(124,77,255,0.04)] transition-colors`}
          >
            <div className="px-4 py-3">
              <p className="text-sm font-medium text-[#F5F0FF]">{l.descricao}</p>
              {l.paciente && <p className="text-xs text-[#6B4E8A]">{l.categoria}</p>}
            </div>
            <div className="px-4 py-3 text-sm text-[#A78BCC] whitespace-nowrap">{l.vencimento}</div>
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
function TabDashboard() {
  const recebido   = RECEBER_DATA.filter((l) => l.status === 'pago').reduce((s, l) => s + l.valor, 0)
  const aReceber   = RECEBER_DATA.filter((l) => l.status !== 'pago').reduce((s, l) => s + l.valor, 0)
  const totalRec   = RECEBER_DATA.reduce((s, l) => s + l.valor, 0)
  const quitado    = PAGAR_DATA.filter((l) => l.status === 'pago').reduce((s, l) => s + l.valor, 0)
  const aPagar     = PAGAR_DATA.filter((l) => l.status !== 'pago').reduce((s, l) => s + l.valor, 0)
  const totalPag   = PAGAR_DATA.reduce((s, l) => s + l.valor, 0)

  const STAT_CARDS = [
    { label: 'Recebido',           value: recebido, color: '#22C55E', Icon: ArrowDownCircle },
    { label: 'A Receber',          value: aReceber, color: '#7C4DFF', Icon: TrendingUp       },
    { label: 'Total a Receber',    value: totalRec, color: '#7C4DFF', Icon: DollarSign       },
    { label: 'Quitado',            value: quitado,  color: '#22C55E', Icon: Check as LucideIcon },
    { label: 'A Pagar',            value: aPagar,   color: '#EF4444', Icon: ArrowUpCircle    },
    { label: 'Total a Pagar',      value: totalPag, color: '#EF4444', Icon: TrendingDown     },
  ]

  return (
    <div className="space-y-7">
      <div className="flex items-start justify-between">
        <div>
          <h2 className="text-base font-bold text-[#F5F0FF]">Dashboard</h2>
          <p className="text-xs text-[#A78BCC] mt-0.5">Faça análises e crie relatórios gerenciais facilmente</p>
        </div>
        <div className="flex gap-2">
          <button className={BTN_GHOST + ' flex items-center gap-1.5'}>
            <Download size={14} />
            DRE Modelo
          </button>
          <button className={BTN_GHOST + ' flex items-center gap-1.5'}>
            <Filter size={14} />
            Filtrar dados
          </button>
        </div>
      </div>

      {/* Conta a Receber */}
      <div>
        <h3 className="text-sm font-semibold text-[#A78BCC] mb-3">Conta a Receber</h3>
        <div className="grid grid-cols-[1fr_1fr_1fr_1.5fr] gap-3 items-start">
          <div className="col-span-3 grid grid-cols-3 gap-3">
            {STAT_CARDS.slice(0, 3).map(({ label, value, color, Icon }) => (
              <div key={label} className="rounded-lg border border-[rgba(124,77,255,0.18)] bg-[#120328] p-4 flex items-center gap-3">
                <div className="w-9 h-9 rounded-lg flex items-center justify-center shrink-0" style={{ background: `${color}20` }}>
                  <Icon size={18} style={{ color }} strokeWidth={1.5} />
                </div>
                <div>
                  <p className="text-xs text-[#A78BCC]">{label}</p>
                  <p className="text-sm font-bold" style={{ color }}>{fmtBRL(value)}</p>
                </div>
              </div>
            ))}
          </div>
          <div className="rounded-lg border border-[rgba(124,77,255,0.18)] bg-[#120328] p-3 h-[120px]">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={CHART_RECEBER} margin={{ top: 4, right: 4, left: -30, bottom: 0 }}>
                <defs>
                  <linearGradient id="recGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%"  stopColor="#38BDF8" stopOpacity={0.4} />
                    <stop offset="95%" stopColor="#38BDF8" stopOpacity={0.02} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(124,77,255,0.08)" />
                <XAxis dataKey="date" tick={{ fontSize: 9, fill: '#6B4E8A' }} axisLine={false} tickLine={false} />
                <YAxis tick={{ fontSize: 9, fill: '#6B4E8A' }} axisLine={false} tickLine={false} />
                <Tooltip
                  contentStyle={{ background: '#120328', border: '1px solid rgba(124,77,255,0.25)', borderRadius: 8 }}
                  labelStyle={{ color: '#A78BCC', fontSize: 11 }}
                  itemStyle={{ color: '#38BDF8', fontSize: 11 }}
                  formatter={(v: number) => [fmtBRL(v), 'A Receber']}
                />
                <Area type="monotone" dataKey="valor" stroke="#38BDF8" strokeWidth={2} fill="url(#recGrad)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      <div className="border-t border-[rgba(124,77,255,0.10)]" />

      {/* Conta a Pagar */}
      <div>
        <h3 className="text-sm font-semibold text-[#A78BCC] mb-3">Conta a Pagar</h3>
        <div className="grid grid-cols-[1.5fr_1fr_1fr_1fr] gap-3 items-start">
          <div className="rounded-lg border border-[rgba(124,77,255,0.18)] bg-[#120328] p-3 h-[120px]">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={CHART_PAGAR} margin={{ top: 4, right: 4, left: -30, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(124,77,255,0.08)" />
                <XAxis dataKey="date" tick={{ fontSize: 9, fill: '#6B4E8A' }} axisLine={false} tickLine={false} />
                <YAxis tick={{ fontSize: 9, fill: '#6B4E8A' }} axisLine={false} tickLine={false} />
                <Tooltip
                  contentStyle={{ background: '#120328', border: '1px solid rgba(124,77,255,0.25)', borderRadius: 8 }}
                  labelStyle={{ color: '#A78BCC', fontSize: 11 }}
                  itemStyle={{ color: '#EF4444', fontSize: 11 }}
                  formatter={(v: number) => [fmtBRL(v), 'A Pagar']}
                />
                <Line type="monotone" dataKey="valor" stroke="#EF4444" strokeWidth={2} dot={false} />
              </LineChart>
            </ResponsiveContainer>
          </div>
          <div className="col-span-3 grid grid-cols-3 gap-3">
            {STAT_CARDS.slice(3).map(({ label, value, color, Icon }) => (
              <div key={label} className="rounded-lg border border-[rgba(124,77,255,0.18)] bg-[#120328] p-4 flex items-center gap-3">
                <div className="w-9 h-9 rounded-lg flex items-center justify-center shrink-0" style={{ background: `${color}20` }}>
                  <Icon size={18} style={{ color }} strokeWidth={1.5} />
                </div>
                <div>
                  <p className="text-xs text-[#A78BCC]">{label}</p>
                  <p className="text-sm font-bold" style={{ color }}>{fmtBRL(value)}</p>
                </div>
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

    <div className="rounded-xl border border-[rgba(124,77,255,0.18)] bg-[#120328] overflow-hidden">
      {/* Header */}
      <div className="px-6 pt-6 pb-4 border-b border-[rgba(124,77,255,0.12)]">
        <div className="flex items-start justify-between">
          <div>
            <h2 className="text-base font-bold text-[#F5F0FF]">Mensalidades</h2>
            <p className="text-xs text-[#A78BCC] mt-0.5">Controle o recebimento mensal de seus pacientes e de outras contas da sua clínica.</p>
          </div>
          <button onClick={() => setModalAdd(true)} className={BTN_PRIMARY + ' flex items-center gap-1.5'}>
            <Plus size={14} /> Adicionar
          </button>
        </div>
        <div className="flex items-center gap-2 mt-4">
          <div className="relative">
            <Search size={13} className="absolute left-3 top-1/2 -translate-y-1/2 text-[#6B4E8A]" />
            <input type="text" placeholder="Pesquisar" value={search}
              onChange={(e) => { setSearch(e.target.value); setPage(1) }}
              className={INP + ' pl-8 w-48'} />
          </div>
          <button className="flex items-center gap-1.5 px-3 py-2 text-xs font-semibold text-[#A78BCC] border border-[rgba(124,77,255,0.25)] rounded-lg hover:border-[#7C4DFF] hover:text-[#F5F0FF] transition-colors">
            <Filter size={13} /> Filtrar
          </button>
        </div>
      </div>

      {/* Table */}
      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-[rgba(124,77,255,0.12)] bg-[#0D0520]">
              <th className="px-4 py-3 text-[10px] font-semibold text-[#6B4E8A] uppercase tracking-widest text-left w-24">AÇÕES</th>
              <th className="px-4 py-3 text-[10px] font-semibold text-[#6B4E8A] uppercase tracking-widest text-left">NOME</th>
              {['PROFISSIONAL', 'PACIENTE', 'DATA'].map((h) => (
                <th key={h} className="px-4 py-3 text-[10px] font-semibold text-[#6B4E8A] uppercase tracking-widest text-left">
                  <button className="flex items-center gap-1 hover:text-[#A78BCC] transition-colors">
                    {h} <ChevronDown size={10} />
                  </button>
                </th>
              ))}
              <th className="px-4 py-3 text-[10px] font-semibold text-[#6B4E8A] uppercase tracking-widest text-right">PAGAMENTO</th>
            </tr>
          </thead>
          <tbody>
            {pageRows.length === 0 ? (
              <tr>
                <td colSpan={6} className="px-4 py-10 text-center text-sm text-[#6B4E8A]">Nenhuma mensalidade encontrada.</td>
              </tr>
            ) : pageRows.map((r) => (
              <tr key={r.id} className="border-b border-[rgba(124,77,255,0.08)] hover:bg-[rgba(124,77,255,0.04)] transition-colors">
                {/* Ações */}
                <td className="px-4 py-4">
                  <div className="flex items-center gap-2">
                    <button onClick={() => setEditRow(r)}
                      className="w-8 h-8 flex items-center justify-center rounded-full border border-[rgba(124,77,255,0.30)] text-[#7C4DFF] hover:bg-[rgba(124,77,255,0.15)] transition-colors">
                      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/></svg>
                    </button>
                    <button onClick={() => handleDelete(r.id)}
                      className="w-8 h-8 flex items-center justify-center rounded-full border border-[rgba(239,68,68,0.30)] text-[#EF4444] hover:bg-[rgba(239,68,68,0.10)] transition-colors">
                      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8"><polyline points="3 6 5 6 21 6"/><path d="M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6"/><path d="M10 11v6M14 11v6"/><path d="M9 6V4a1 1 0 0 1 1-1h4a1 1 0 0 1 1 1v2"/></svg>
                    </button>
                  </div>
                </td>
                {/* Nome */}
                <td className="px-4 py-4 font-semibold text-[#F5F0FF]">{r.titulo}</td>
                {/* Profissional */}
                <td className="px-4 py-4 text-[#A78BCC]">{r.profissional}</td>
                {/* Paciente */}
                <td className="px-4 py-4 text-[#A78BCC]">{r.paciente}</td>
                {/* Data */}
                <td className="px-4 py-4">
                  <p className="text-[#A78BCC]">{r.data}</p>
                  <p className="text-xs text-[#7C4DFF] mt-0.5">Parcela {r.parcela}</p>
                </td>
                {/* Pagamento */}
                <td className="px-4 py-4 text-right">
                  <p className="text-sm font-medium text-[#F5F0FF]">
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
      <div className="px-6 py-4 border-t border-[rgba(124,77,255,0.12)] flex items-center justify-between flex-wrap gap-3">
        <button className={BTN_GHOST + ' flex items-center gap-1.5'}>
          <Upload size={13} /> Exportar Dados
        </button>
        <div className="flex items-center gap-6">
          <div className="text-right">
            <p className="text-xs text-[#A78BCC]">
              Total Recebido: <span className="font-semibold text-[#F5F0FF]">R$ {totalRecebido.toFixed(2).replace('.', ',')}</span>
            </p>
            <p className="text-xs text-[#A78BCC]">
              A receber: <span className="font-semibold text-[#F5F0FF]">R$ {aReceber.toFixed(2).replace('.', ',')}</span>
            </p>
          </div>
          {/* Pagination */}
          <div className="flex items-center gap-1">
            {(['«','‹','›','»'] as const).map((sym, i) => {
              const acts = [() => setPage(1), () => setPage((p) => Math.max(1,p-1)), () => setPage((p) => Math.min(totalPages,p+1)), () => setPage(totalPages)]
              return (
                <button key={sym} onClick={acts[i]}
                  className="w-7 h-7 flex items-center justify-center rounded text-sm text-[#A78BCC] hover:bg-[rgba(124,77,255,0.12)] hover:text-[#F5F0FF] transition-colors">
                  {sym}
                </button>
              )
            })}
            <span className="w-7 h-7 flex items-center justify-center rounded bg-[#7C4DFF] text-white text-xs font-semibold">{page}</span>
            <div className="relative ml-1">
              <button onClick={() => setPSOOpen((v) => !v)}
                className="flex items-center gap-1 px-2 py-1.5 border border-[rgba(124,77,255,0.25)] rounded text-xs text-[#A78BCC] hover:border-[#7C4DFF] transition-colors">
                {pageSize} <ChevronDown size={11} />
              </button>
              {pageSizeOpen && (
                <div className="absolute bottom-full mb-1 right-0 bg-[#1A0A38] border border-[rgba(124,77,255,0.30)] rounded-lg shadow-xl overflow-hidden z-20">
                  {[5,10,20,50].map((n) => (
                    <button key={n} onClick={() => { setPageSize(n); setPage(1); setPSOOpen(false) }}
                      className={`w-full text-left px-4 py-2 text-sm hover:bg-[rgba(124,77,255,0.12)] transition-colors ${pageSize===n?'text-[#7C4DFF] font-semibold':'text-[#F5F0FF]'}`}>
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

// ─── TAB: CONTAS A PAGAR ─────────────────────────────────────────────────────
type ContaPagar = {
  id: number
  titulo: string
  profissional: string
  data: string
  parcela: string
  pago: number
  total: number
  status: 'Em Aberto' | 'Pago' | 'Atrasado'
}

const MOCK_CONTAS_PAGAR: ContaPagar[] = [
  { id:1, titulo:'Energia', profissional:'JESSE DOS SANTOS BEZERRA', data:'01/04/2026', parcela:'Única', pago:0, total:2000, status:'Em Aberto' },
]

function ModalAdicionarContaPagar({ onClose, onSave }: {
  onClose: () => void
  onSave: (c: ContaPagar) => void
}) {
  const [titulo,   setTitulo]   = useState('')
  const [prof,     setProf]     = useState('')
  const [data,     setData]     = useState('')
  const [parcelas, setParcelas] = useState('')
  const [valor,    setValor]    = useState('0,00')

  const INP_W = 'w-full border border-[#D8D0ED] rounded-md px-3 py-2.5 text-sm text-[#2D1B5A] placeholder:text-[#B0A0CC] focus:outline-none focus:border-[#7C4DFF] transition-colors bg-white'
  const LBL_W = 'absolute -top-2 left-3 z-10 bg-white px-1 text-[10px] font-medium text-[#9E8BBF] leading-none'

  function handleSave() {
    if (!titulo || !data) return
    const n = parseInt(parcelas) || 1
    onSave({
      id: Date.now(),
      titulo,
      profissional: prof || PROFISSIONAIS_OPTS[0],
      data,
      parcela: n === 1 ? 'Única' : `1/${n}`,
      pago: 0,
      total: parseFloat(valor.replace(',', '.')) || 0,
      status: 'Em Aberto',
    })
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-xl mx-4">
        <div className="flex items-center justify-between px-6 py-4 border-b border-[#EDE8F5]">
          <h3 className="text-base font-bold text-[#2D1B5A]">Adicionar conta a pagar</h3>
          <button onClick={onClose} className="text-[#9E8BBF] hover:text-[#2D1B5A] transition-colors"><X size={18} /></button>
        </div>
        <div className="px-6 py-5 space-y-4">
          <div className="relative">
            <label className={LBL_W}>Título da Conta<span className="text-[#7C4DFF]">*</span></label>
            <input value={titulo} onChange={(e) => setTitulo(e.target.value)} className={INP_W} />
          </div>
          <div className="grid grid-cols-2 gap-4">
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
            <div className="relative">
              <label className={LBL_W}>Data do Pagamento<span className="text-[#7C4DFF]">*</span></label>
              <input value={data} onChange={(e) => setData(e.target.value)} placeholder="dd/mm/aaaa" className={INP_W} />
            </div>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div className="relative">
              <label className={LBL_W}>Número de Parcelas<span className="text-[#7C4DFF]">*</span></label>
              <input value={parcelas} onChange={(e) => setParcelas(e.target.value)} placeholder="1" className={INP_W} />
            </div>
            <div className="relative">
              <label className={LBL_W}>Valor<span className="text-[#7C4DFF]">*</span></label>
              <input value={`R$ ${valor}`}
                onChange={(e) => setValor(e.target.value.replace(/^R\$\s?/, ''))}
                className={INP_W} />
            </div>
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

function ModalEditarContaPagar({ row, onClose, onSave }: {
  row: ContaPagar
  onClose: () => void
  onSave: (updated: ContaPagar) => void
}) {
  const [titulo,  setTitulo]  = useState(row.titulo)
  const [prof,    setProf]    = useState(row.profissional)
  const [data,    setData]    = useState(row.data)
  const [valor,   setValor]   = useState(row.total.toFixed(2).replace('.', ','))
  const [pago,    setPago]    = useState(row.pago.toFixed(2).replace('.', ','))

  const INP_W = 'w-full border border-[#D8D0ED] rounded-md px-3 py-2.5 text-sm text-[#2D1B5A] placeholder:text-[#B0A0CC] focus:outline-none focus:border-[#7C4DFF] transition-colors bg-white'
  const LBL_W = 'absolute -top-2 left-3 z-10 bg-white px-1 text-[10px] font-medium text-[#9E8BBF] leading-none'

  function handleSave() {
    const v = parseFloat(valor.replace(',', '.')) || 0
    const p = parseFloat(pago.replace(',', '.')) || 0
    onSave({ ...row, titulo, profissional: prof, data, total: v, pago: p, status: p >= v ? 'Pago' : 'Em Aberto' })
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-xl mx-4">
        <div className="flex items-center justify-between px-6 py-4 border-b border-[#EDE8F5]">
          <h3 className="text-base font-bold text-[#2D1B5A]">Alterar informações da conta</h3>
          <button onClick={onClose} className="text-[#9E8BBF] hover:text-[#2D1B5A] transition-colors"><X size={18} /></button>
        </div>
        <div className="px-6 py-5 space-y-4">
          <div className="relative">
            <label className={LBL_W}>Título da Conta<span className="text-[#7C4DFF]">*</span></label>
            <input value={titulo} onChange={(e) => setTitulo(e.target.value)} className={INP_W} />
          </div>
          <div className="grid grid-cols-2 gap-4">
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
            <div className="relative">
              <label className={LBL_W}>Data do Pagamento<span className="text-[#7C4DFF]">*</span></label>
              <input value={data} onChange={(e) => setData(e.target.value)} className={INP_W} />
            </div>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div className="relative">
              <label className={LBL_W}>Valor<span className="text-[#7C4DFF]">*</span></label>
              <input value={`R$ ${valor}`}
                onChange={(e) => setValor(e.target.value.replace(/^R\$\s?/, ''))}
                className={INP_W} />
            </div>
            <div className="flex items-end gap-2">
              <div className="relative flex-1">
                <label className={LBL_W}>Valor Pago<span className="text-[#7C4DFF]">*</span></label>
                <input value={`R$ ${pago}`}
                  onChange={(e) => setPago(e.target.value.replace(/^R\$\s?/, ''))}
                  className={INP_W} />
              </div>
              <button onClick={() => setPago(valor)}
                className="flex items-center gap-1.5 px-3 py-2.5 rounded-lg text-sm font-bold text-white bg-[#14B8A6] hover:bg-[#0D9488] transition-colors whitespace-nowrap">
                <Check size={13} /> Quitar
              </button>
            </div>
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

function TabContasPagar() {
  const [search,     setSearch]   = useState('')
  const [rows,       setRows]     = useState<ContaPagar[]>(MOCK_CONTAS_PAGAR)
  const [page,       setPage]     = useState(1)
  const [pageSize,   setPageSize] = useState(10)
  const [pageSizeOpen, setPSOOpen] = useState(false)
  const [modalAdd,   setModalAdd] = useState(false)
  const [editRow,    setEditRow]  = useState<ContaPagar | null>(null)

  const filtered = rows.filter((r) =>
    r.titulo.toLowerCase().includes(search.toLowerCase()) ||
    r.profissional.toLowerCase().includes(search.toLowerCase())
  )
  const totalPages = Math.max(1, Math.ceil(filtered.length / pageSize))
  const pageRows   = filtered.slice((page - 1) * pageSize, page * pageSize)

  function handleAdd(c: ContaPagar) { setRows((prev) => [...prev, c]); setModalAdd(false) }
  function handleEdit(updated: ContaPagar) { setRows((prev) => prev.map((r) => r.id === updated.id ? updated : r)); setEditRow(null) }
  function handleDelete(id: number) { setRows((prev) => prev.filter((r) => r.id !== id)) }

  const totalPago = rows.reduce((s, r) => s + r.pago, 0)
  const aPagar    = rows.reduce((s, r) => s + (r.total - r.pago), 0)

  const statusMap: Record<ContaPagar['status'], string> = {
    'Pago':      'text-[#22C55E]',
    'Em Aberto': 'text-[#EF4444]',
    'Atrasado':  'text-[#F59E0B]',
  }

  return (
    <>
    {modalAdd && <ModalAdicionarContaPagar onClose={() => setModalAdd(false)} onSave={handleAdd} />}
    {editRow  && <ModalEditarContaPagar row={editRow} onClose={() => setEditRow(null)} onSave={handleEdit} />}

    <div className="rounded-xl border border-[rgba(124,77,255,0.18)] bg-[#120328] overflow-hidden">
      {/* Header */}
      <div className="px-6 pt-6 pb-4 border-b border-[rgba(124,77,255,0.12)]">
        <div className="flex items-start justify-between">
          <div>
            <h2 className="text-base font-bold text-[#F5F0FF]">Contas a pagar</h2>
            <p className="text-xs text-[#A78BCC] mt-0.5">Controle o pagamento das contas e despesas do seu negócio.</p>
          </div>
          <button onClick={() => setModalAdd(true)} className={BTN_PRIMARY + ' flex items-center gap-1.5'}>
            <Plus size={14} /> Adicionar
          </button>
        </div>
        <div className="flex items-center gap-2 mt-4">
          <div className="relative">
            <Search size={13} className="absolute left-3 top-1/2 -translate-y-1/2 text-[#6B4E8A]" />
            <input type="text" placeholder="Pesquisar" value={search}
              onChange={(e) => { setSearch(e.target.value); setPage(1) }}
              className={INP + ' pl-8 w-48'} />
          </div>
          <button className="flex items-center gap-1.5 px-3 py-2 text-xs font-semibold text-[#A78BCC] border border-[rgba(124,77,255,0.25)] rounded-lg hover:border-[#7C4DFF] hover:text-[#F5F0FF] transition-colors">
            <Filter size={13} /> Filtrar
          </button>
        </div>
      </div>

      {/* Table */}
      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-[rgba(124,77,255,0.12)] bg-[#0D0520]">
              <th className="px-4 py-3 text-[10px] font-semibold text-[#6B4E8A] uppercase tracking-widest text-left w-24">AÇÕES</th>
              <th className="px-4 py-3 text-[10px] font-semibold text-[#6B4E8A] uppercase tracking-widest text-left">NOME</th>
              <th className="px-4 py-3 text-[10px] font-semibold text-[#6B4E8A] uppercase tracking-widest text-left">
                <button className="flex items-center gap-1 hover:text-[#A78BCC] transition-colors">PROFISSIONAL <ChevronDown size={10} /></button>
              </th>
              <th className="px-4 py-3 text-[10px] font-semibold text-[#6B4E8A] uppercase tracking-widest text-left">
                <button className="flex items-center gap-1 hover:text-[#A78BCC] transition-colors">DATA <ChevronDown size={10} /></button>
              </th>
              <th className="px-4 py-3 text-[10px] font-semibold text-[#6B4E8A] uppercase tracking-widest text-right">PAGAMENTO</th>
            </tr>
          </thead>
          <tbody>
            {pageRows.length === 0 ? (
              <tr>
                <td colSpan={5} className="px-4 py-10 text-center text-sm text-[#6B4E8A]">Nenhuma conta encontrada.</td>
              </tr>
            ) : pageRows.map((r) => (
              <tr key={r.id} className="border-b border-[rgba(124,77,255,0.08)] hover:bg-[rgba(124,77,255,0.04)] transition-colors">
                <td className="px-4 py-4">
                  <div className="flex items-center gap-2">
                    <button onClick={() => setEditRow(r)}
                      className="w-8 h-8 flex items-center justify-center rounded-full border border-[rgba(124,77,255,0.30)] text-[#7C4DFF] hover:bg-[rgba(124,77,255,0.15)] transition-colors">
                      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/></svg>
                    </button>
                    <button onClick={() => handleDelete(r.id)}
                      className="w-8 h-8 flex items-center justify-center rounded-full border border-[rgba(239,68,68,0.30)] text-[#EF4444] hover:bg-[rgba(239,68,68,0.10)] transition-colors">
                      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8"><polyline points="3 6 5 6 21 6"/><path d="M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6"/><path d="M10 11v6M14 11v6"/><path d="M9 6V4a1 1 0 0 1 1-1h4a1 1 0 0 1 1 1v2"/></svg>
                    </button>
                  </div>
                </td>
                <td className="px-4 py-4 font-semibold text-[#F5F0FF]">{r.titulo}</td>
                <td className="px-4 py-4 text-[#A78BCC]">{r.profissional}</td>
                <td className="px-4 py-4">
                  <p className="text-[#A78BCC]">{r.data}</p>
                  <p className="text-xs text-[#7C4DFF] mt-0.5">Parcela {r.parcela}</p>
                </td>
                <td className="px-4 py-4 text-right">
                  <p className="text-sm font-medium text-[#F5F0FF]">
                    R$ {r.pago.toFixed(2).replace('.', ',')} de R$ {r.total.toFixed(2).replace('.', ',')}
                  </p>
                  <p className={`text-xs flex items-center gap-1 justify-end mt-0.5 ${statusMap[r.status]}`}>
                    <svg width="10" height="10" viewBox="0 0 24 24" fill="currentColor"><circle cx="12" cy="12" r="10"/><path fill="white" d="M12 8v4M12 16h.01"/></svg>
                    {r.status}
                  </p>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Footer */}
      <div className="px-6 py-4 border-t border-[rgba(124,77,255,0.12)] flex items-center justify-between flex-wrap gap-3">
        <button className={BTN_GHOST + ' flex items-center gap-1.5'}>
          <Upload size={13} /> Exportar Dados
        </button>
        <div className="flex items-center gap-6">
          <div className="text-right">
            <p className="text-xs text-[#A78BCC]">Total Pago: <span className="font-semibold text-[#F5F0FF]">R$ {totalPago.toFixed(2).replace('.', ',')}</span></p>
            <p className="text-xs text-[#A78BCC]">A pagar: <span className="font-semibold text-[#F5F0FF]">R$ {aPagar.toFixed(2).replace('.', ',')}</span></p>
          </div>
          <div className="flex items-center gap-1">
            {(['«','‹','›','»'] as const).map((sym, i) => {
              const acts = [() => setPage(1), () => setPage((p) => Math.max(1,p-1)), () => setPage((p) => Math.min(totalPages,p+1)), () => setPage(totalPages)]
              return (
                <button key={sym} onClick={acts[i]}
                  className="w-7 h-7 flex items-center justify-center rounded text-sm text-[#A78BCC] hover:bg-[rgba(124,77,255,0.12)] hover:text-[#F5F0FF] transition-colors">
                  {sym}
                </button>
              )
            })}
            <span className="w-7 h-7 flex items-center justify-center rounded bg-[#7C4DFF] text-white text-xs font-semibold">{page}</span>
            <div className="relative ml-1">
              <button onClick={() => setPSOOpen((v) => !v)}
                className="flex items-center gap-1 px-2 py-1.5 border border-[rgba(124,77,255,0.25)] rounded text-xs text-[#A78BCC] hover:border-[#7C4DFF] transition-colors">
                {pageSize} <ChevronDown size={11} />
              </button>
              {pageSizeOpen && (
                <div className="absolute bottom-full mb-1 right-0 bg-[#1A0A38] border border-[rgba(124,77,255,0.30)] rounded-lg shadow-xl overflow-hidden z-20">
                  {[5,10,20,50].map((n) => (
                    <button key={n} onClick={() => { setPageSize(n); setPage(1); setPSOOpen(false) }}
                      className={`w-full text-left px-4 py-2 text-sm hover:bg-[rgba(124,77,255,0.12)] transition-colors ${pageSize===n?'text-[#7C4DFF] font-semibold':'text-[#F5F0FF]'}`}>
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
export function FinanceiroView() {
  const [subTab, setSubTab] = useState<SubTab>('dashboard')

  const content = (() => {
    switch (subTab) {
      case 'dashboard':    return <TabDashboard />
      case 'receber':      return <TabContasReceber />
      case 'mensalidades': return <TabMensalidades />
      case 'pagar':        return <TabContasPagar />
    }
  })()

  return (
    <div className="flex h-full min-h-0">
      {/* ── Sub-menu lateral ── */}
      <aside className="flex flex-col w-[80px] shrink-0 border-r border-[rgba(124,77,255,0.18)] bg-[#120328] py-3 gap-0.5 overflow-y-auto">
        {SUB_TABS.map(({ id, label, Icon }) => {
          const active = subTab === id
          return (
            <button
              key={id}
              onClick={() => setSubTab(id)}
              title={label}
              className={`flex flex-col items-center gap-1 py-3 mx-2 rounded-xl transition-all ${
                active ? 'bg-[rgba(124,77,255,0.15)]' : 'hover:bg-[rgba(124,77,255,0.08)]'
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
