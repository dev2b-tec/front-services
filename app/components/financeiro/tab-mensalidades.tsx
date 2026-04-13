'use client'

import { useState, useEffect, useCallback, useRef } from 'react'
import { createPortal } from 'react-dom'
import { Search, Filter, Plus, Upload, ChevronDown, X, Check, Printer, FileText, FileSpreadsheet, FileDown } from 'lucide-react'

// ─── Shared styles (dark theme) ───────────────────────────────────────────────
const INP =
  'w-full bg-[var(--d2b-bg-main)] border border-[var(--d2b-border-strong)] rounded-xl ' +
  'px-4 py-3 text-sm text-[var(--d2b-text-primary)] placeholder:text-[#3D2A5A] ' +
  'focus:outline-none focus:border-[#7C4DFF] transition-colors'
const LBL = 'block text-xs font-medium text-[var(--d2b-text-muted)] mb-1.5'
const JOIN = (base: string, extra: string) => `${base} ${extra}`

function fmtBRL(v: number) {
  return v.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })
}
function defaultPeriodo(): string {
  const now = new Date()
  const day = now.getDay()
  const start = new Date(now); start.setDate(now.getDate() - day + (day === 0 ? -6 : 1))
  const end   = new Date(start); end.setDate(start.getDate() + 6)
  const fmt = (d: Date) => d.toLocaleDateString('pt-BR')
  return `${fmt(start)} - ${fmt(end)}`
}
function parsePeriodo(p: string): { inicio: Date | null; fim: Date | null } {
  const parts = p.split(' - ').map((s) => s.trim())
  if (parts.length !== 2) return { inicio: null, fim: null }
  const parse = (s: string) => {
    const [d, m, y] = s.split('/').map(Number)
    if (!d || !m || !y) return null
    return new Date(y, m - 1, d)
  }
  return { inicio: parse(parts[0]), fim: parse(parts[1]) }
}
function parseBRDate(s: string): Date | null {
  const [d, m, y] = s.split('/').map(Number)
  if (!d || !m || !y) return null
  return new Date(y, m - 1, d)
}
const METODO_OPTIONS = ['Todos', 'PIX', 'CARTAO_CREDITO', 'CARTAO_DEBITO', 'DINHEIRO', 'BOLETO', 'TRANSFERENCIA']
function maskBRL(raw: string): string {
  const digits = raw.replace(/\D/g, '')
  if (!digits) return ''
  return (parseInt(digits, 10) / 100).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })
}
function parseBRL(masked: string): number {
  const digits = masked.replace(/\D/g, '')
  if (!digits) return 0
  return parseInt(digits, 10) / 100
}

// ─── Types ────────────────────────────────────────────────────────────────────
type Movimento = {
  id: string
  titulo: string
  pacienteId: string | null
  pacienteNome: string
  usuarioId: string | null
  usuarioNome: string
  tipo: string
  grupoId: string
  numeroParcela: number
  totalParcelas: number
  valorParcela: number
  valorPago: number
  dataVencimento: string
  dataPagamento: string | null
  status: string
  metodoPagamento: string | null
}

type Option = { id: string; nome: string }

// ─── Status badge ─────────────────────────────────────────────────────────────
function StatusBadge({ status }: { status: string }) {
  const cfg: Record<string, string> = {
    PAGO:      'bg-[rgba(34,197,94,0.12)] text-[#22C55E] border border-[rgba(34,197,94,0.25)]',
    EM_ABERTO: 'bg-[var(--d2b-hover)] text-[var(--d2b-text-secondary)] border border-[var(--d2b-border-strong)]',
    ATRASADO:  'bg-[rgba(239,68,68,0.12)] text-[#EF4444] border border-[rgba(239,68,68,0.25)]',
    CANCELADO: 'bg-[rgba(107,78,138,0.20)] text-[var(--d2b-text-muted)] border border-[var(--d2b-border)]',
  }
  const label: Record<string, string> = {
    PAGO: 'Pago', EM_ABERTO: 'Em Aberto', ATRASADO: 'Atrasado', CANCELADO: 'Cancelado',
  }
  const cls = cfg[status] ?? cfg.EM_ABERTO
  return (
    <span className={`text-[10px] font-semibold px-2 py-0.5 rounded-full ${cls}`}>
      {label[status] ?? status}
    </span>
  )
}

// ─── Modal Adicionar ──────────────────────────────────────────────────────────
function ModalAdicionar({
  empresaId, profissionais, pacientes, onClose, onSaved,
}: {
  empresaId: string
  profissionais: Option[]
  pacientes: Option[]
  onClose: () => void
  onSaved: () => void
}) {
  const [titulo,     setTitulo]     = useState('')
  const [pacienteId, setPacienteId] = useState('')
  const [usuarioId,  setUsuarioId]  = useState('')
  const [data,       setData]       = useState('')
  const [parcelas,   setParcelas]   = useState('1')
  const [valor,      setValor]      = useState('')
  const [erros,      setErros]      = useState<Record<string, string>>({})
  const [saving,     setSaving]     = useState(false)

  const n = parseInt(parcelas) || 0
  const total = parseBRL(valor)
  const valorParcela = n > 0 && total > 0 ? total / n : 0

  const FLD = 'w-full border border-[#D8D0ED] rounded-md px-3 py-2.5 text-sm text-[#2D1B5A] placeholder:text-[#B0A0CC] focus:outline-none focus:border-[#7C4DFF] transition-colors bg-white'
  const LF  = 'absolute -top-2 left-3 z-10 bg-white px-1 text-[10px] font-medium text-[#9E8BBF] leading-none'

  async function handleSave() {
    const e: Record<string, string> = {}
    if (!titulo.trim()) e.titulo = 'Informe o título'
    if (!data) e.data = 'Informe a data'
    if (!valor) e.valor = 'Informe o valor'
    if (!n || n < 1) e.parcelas = 'Mínimo 1 parcela'
    if (Object.keys(e).length) { setErros(e); return }

    setSaving(true)
    try {
      const parts = data.split('-')
      const iso = parts.length === 3 ? data : (() => {
        const [d, m, y] = data.split('/')
        return `${y}-${m}-${d}`
      })()

      await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/v1/movimentos-financeiros`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          empresaId,
          pacienteId: pacienteId || null,
          usuarioId:  usuarioId  || null,
          tipo:       'MENSALIDADE',
          titulo,
          totalParcelas: n,
          valorTotal: total,
          dataPrimeiroVencimento: iso,
        }),
      })
      onSaved()
    } finally {
      setSaving(false)
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-xl mx-4">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-[#EDE8F5]">
          <h3 className="text-base font-bold text-[#2D1B5A]">Adicionar Mensalidade</h3>
          <button onClick={onClose} className="text-[#9E8BBF] hover:text-[#2D1B5A] transition-colors">
            <X size={18} />
          </button>
        </div>

        {/* Body */}
        <div className="px-6 py-5 space-y-5">
          {/* Título */}
          <div className="relative">
            <label className={LF}>Título da Conta<span className="text-[#7C4DFF]">*</span></label>
            <input
              value={titulo}
              onChange={(e) => { setTitulo(e.target.value); setErros((p) => ({ ...p, titulo: '' })) }}
              className={FLD + (erros.titulo ? ' border-red-400' : '')}
              placeholder="Ex: Plano Mensal"
            />
            {erros.titulo && <p className="text-xs text-red-400 mt-1">{erros.titulo}</p>}
          </div>

          {/* Paciente + Profissional */}
          <div className="grid grid-cols-2 gap-4">
            <div className="relative">
              <label className={LF}>Selecione um paciente</label>
              <div className="relative">
                <select
                  value={pacienteId}
                  onChange={(e) => setPacienteId(e.target.value)}
                  className={FLD + ' appearance-none pr-8 cursor-pointer'}
                >
                  <option value="">Busque pelo paciente</option>
                  {pacientes.map((p) => <option key={p.id} value={p.id}>{p.nome}</option>)}
                </select>
                <ChevronDown size={13} className="absolute right-3 top-1/2 -translate-y-1/2 text-[#9E8BBF] pointer-events-none" />
              </div>
            </div>
            <div className="relative">
              <label className={LF}>Profissional</label>
              <div className="relative">
                <select
                  value={usuarioId}
                  onChange={(e) => setUsuarioId(e.target.value)}
                  className={FLD + ' appearance-none pr-8 cursor-pointer'}
                >
                  <option value="">Selecione um profissional</option>
                  {profissionais.map((p) => <option key={p.id} value={p.id}>{p.nome}</option>)}
                </select>
                <ChevronDown size={13} className="absolute right-3 top-1/2 -translate-y-1/2 text-[#9E8BBF] pointer-events-none" />
              </div>
            </div>
          </div>

          {/* Data + Parcelas */}
          <div className="grid grid-cols-2 gap-4">
            <div className="relative">
              <label className={LF}>Data do Recebimento<span className="text-[#7C4DFF]">*</span></label>
              <input
                type="date"
                value={data}
                onChange={(e) => { setData(e.target.value); setErros((p) => ({ ...p, data: '' })) }}
                className={FLD + (erros.data ? ' border-red-400' : '')}
              />
              {erros.data && <p className="text-xs text-red-400 mt-1">{erros.data}</p>}
            </div>
            <div className="relative">
              <label className={LF}>Número de Parcelas<span className="text-[#7C4DFF]">*</span></label>
              <input
                type="number"
                min={1}
                value={parcelas}
                onChange={(e) => { setParcelas(e.target.value); setErros((p) => ({ ...p, parcelas: '' })) }}
                className={FLD + (erros.parcelas ? ' border-red-400' : '')}
              />
              {erros.parcelas && <p className="text-xs text-red-400 mt-1">{erros.parcelas}</p>}
            </div>
          </div>

          {/* Valor */}
          <div className="relative w-1/2">
            <label className={LF}>Valor<span className="text-[#7C4DFF]">*</span></label>
            <input
              type="text"
              inputMode="numeric"
              placeholder="R$ 0,00"
              value={valor}
              onChange={(e) => {
                const digits = e.target.value.replace(/\D/g, '')
                setValor(digits ? maskBRL(e.target.value) : '')
                setErros((p) => ({ ...p, valor: '' }))
              }}
              className={FLD + (erros.valor ? ' border-red-400' : '')}
            />
            {erros.valor && <p className="text-xs text-red-400 mt-1">{erros.valor}</p>}
          </div>

          {/* Preview */}
          {n > 0 && total > 0 && (
            <p className="text-sm font-semibold text-[#6B4FA8]">
              {n} {n === 1 ? 'parcela de' : 'parcelas mensais de'}{' '}
              {fmtBRL(valorParcela)}
            </p>
          )}
        </div>

        {/* Footer */}
        <div className="px-6 py-4 border-t border-[#EDE8F5] flex items-center justify-end gap-3">
          <button onClick={onClose} className="px-5 py-2 rounded-lg text-sm font-medium text-[#9E8BBF] hover:bg-[#F3F0FA] transition-colors">
            Cancelar
          </button>
          <button
            onClick={handleSave}
            disabled={saving}
            className="px-5 py-2 rounded-lg text-sm font-bold text-white bg-[#7C4DFF] hover:bg-[#5B21B6] disabled:opacity-60 transition-colors"
          >
            {saving ? 'Salvando…' : 'Salvar'}
          </button>
        </div>
      </div>
    </div>
  )
}

// ─── Modal Editar ─────────────────────────────────────────────────────────────
function ModalEditar({
  row, profissionais, onClose, onSaved,
}: {
  row: Movimento
  profissionais: Option[]
  onClose: () => void
  onSaved: () => void
}) {
  const [titulo,     setTitulo]     = useState(row.titulo)
  const [usuarioId,  setUsuarioId]  = useState(row.usuarioId ?? '')
  const [valor,      setValor]      = useState(fmtBRL(row.valorParcela))
  const [recebido,   setRecebido]   = useState(fmtBRL(row.valorPago))
  const [status,     setStatus]     = useState(row.status)
  const [metodo,     setMetodo]     = useState(row.metodoPagamento ?? '')
  const [dataPag,    setDataPag]    = useState(row.dataPagamento ?? '')
  const [saving,     setSaving]     = useState(false)

  const METODOS = ['Dinheiro','Pix','Cartão de Crédito','Cartão de Débito','Transferência','Outros']

  const FLD = 'w-full border border-[#D8D0ED] rounded-md px-3 py-2.5 text-sm text-[#2D1B5A] placeholder:text-[#B0A0CC] focus:outline-none focus:border-[#7C4DFF] transition-colors bg-white'
  const LF  = 'absolute -top-2 left-3 z-10 bg-white px-1 text-[10px] font-medium text-[#9E8BBF] leading-none'

  async function handleSave() {
    setSaving(true)
    try {
      await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/v1/movimentos-financeiros/${row.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          titulo,
          status,
          valorPago: parseBRL(recebido),
          dataPagamento: dataPag || null,
          metodoPagamento: metodo || null,
        }),
      })
      onSaved()
    } finally {
      setSaving(false)
    }
  }

  function quitar() {
    setRecebido(fmtBRL(parseBRL(valor)))
    setStatus('PAGO')
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-xl mx-4">
        <div className="flex items-center justify-between px-6 py-4 border-b border-[#EDE8F5]">
          <h3 className="text-base font-bold text-[#2D1B5A]">Alterar informações da conta</h3>
          <button onClick={onClose} className="text-[#9E8BBF] hover:text-[#2D1B5A] transition-colors">
            <X size={18} />
          </button>
        </div>

        <div className="px-6 py-5 space-y-5">
          {/* Título */}
          <div className="relative">
            <label className={LF}>Título da Conta<span className="text-[#7C4DFF]">*</span></label>
            <input value={titulo} onChange={(e) => setTitulo(e.target.value)} className={FLD} />
          </div>

          {/* Paciente (read-only) + Profissional */}
          <div className="grid grid-cols-2 gap-4">
            <div className="relative">
              <label className={LF}>Paciente</label>
              <input
                value={row.pacienteNome || '—'}
                readOnly
                className={FLD + ' bg-[#F3F0FA] text-[#9E8BBF] cursor-not-allowed'}
              />
            </div>
            <div className="relative">
              <label className={LF}>Profissional<span className="text-[#7C4DFF]">*</span></label>
              <div className="relative">
                <select
                  value={usuarioId}
                  onChange={(e) => setUsuarioId(e.target.value)}
                  className={FLD + ' appearance-none pr-8 cursor-pointer'}
                >
                  <option value="">Nenhum</option>
                  {profissionais.map((p) => <option key={p.id} value={p.id}>{p.nome}</option>)}
                </select>
                <ChevronDown size={13} className="absolute right-3 top-1/2 -translate-y-1/2 text-[#9E8BBF] pointer-events-none" />
              </div>
            </div>
          </div>

          {/* Valor Parcela + Status */}
          <div className="grid grid-cols-2 gap-4">
            <div className="relative">
              <label className={LF}>Valor da Parcela</label>
              <input
                value={valor}
                onChange={(e) => setValor(maskBRL(e.target.value) || e.target.value)}
                className={FLD}
              />
            </div>
            <div className="relative">
              <label className={LF}>Status</label>
              <div className="relative">
                <select value={status} onChange={(e) => setStatus(e.target.value)}
                  className={FLD + ' appearance-none pr-8 cursor-pointer'}>
                  {(['EM_ABERTO','PAGO','ATRASADO','CANCELADO'] as const).map((s) => (
                    <option key={s} value={s}>{s === 'EM_ABERTO' ? 'Em Aberto' : s.charAt(0) + s.slice(1).toLowerCase()}</option>
                  ))}
                </select>
                <ChevronDown size={13} className="absolute right-3 top-1/2 -translate-y-1/2 text-[#9E8BBF] pointer-events-none" />
              </div>
            </div>
          </div>

          {/* Valor Recebido + Quitar */}
          <div className="flex items-end gap-3">
            <div className="relative flex-1">
              <label className={LF}>Valor Recebido<span className="text-[#7C4DFF]">*</span></label>
              <input
                type="text"
                inputMode="numeric"
                value={recebido}
                onChange={(e) => setRecebido(maskBRL(e.target.value) || e.target.value)}
                className={FLD}
              />
            </div>
            <button
              onClick={quitar}
              className="flex items-center gap-1.5 px-4 py-2.5 rounded-lg text-sm font-bold text-white bg-[#14B8A6] hover:bg-[#0D9488] transition-colors whitespace-nowrap"
            >
              <Check size={13} /> Quitar
            </button>
          </div>

          {/* Data pagamento + Método */}
          <div className="grid grid-cols-2 gap-4">
            <div className="relative">
              <label className={LF}>Data do Pagamento</label>
              <input
                type="date"
                value={dataPag}
                onChange={(e) => setDataPag(e.target.value)}
                className={FLD}
              />
            </div>
            <div className="relative">
              <label className={LF}>Método de Pagamento</label>
              <div className="relative">
                <select value={metodo} onChange={(e) => setMetodo(e.target.value)}
                  className={FLD + ' appearance-none pr-8 cursor-pointer'}>
                  <option value="">Selecione</option>
                  {METODOS.map((m) => <option key={m} value={m}>{m}</option>)}
                </select>
                <ChevronDown size={13} className="absolute right-3 top-1/2 -translate-y-1/2 text-[#9E8BBF] pointer-events-none" />
              </div>
            </div>
          </div>
        </div>

        <div className="px-6 py-4 border-t border-[#EDE8F5] flex items-center justify-end gap-3">
          <button onClick={onClose} className="px-5 py-2 rounded-lg text-sm font-medium text-[#9E8BBF] hover:bg-[#F3F0FA] transition-colors">
            Cancelar
          </button>
          <button
            onClick={handleSave}
            disabled={saving}
            className="px-5 py-2 rounded-lg text-sm font-bold text-white bg-[#7C4DFF] hover:bg-[#5B21B6] disabled:opacity-60 transition-colors"
          >
            {saving ? 'Salvando…' : 'Salvar'}
          </button>
        </div>
      </div>
    </div>
  )
}

// ─── Modal Excluir ────────────────────────────────────────────────────────────
function ModalExcluir({
  row, onClose, onSaved,
}: {
  row: Movimento
  onClose: () => void
  onSaved: () => void
}) {
  const [opcao, setOpcao] = useState<'esta' | 'todas' | 'futuras'>('esta')
  const [loading, setLoading] = useState(false)

  async function handleDelete() {
    setLoading(true)
    const base = `${process.env.NEXT_PUBLIC_API_URL}/api/v1/movimentos-financeiros`
    try {
      if (opcao === 'esta') {
        await fetch(`${base}/${row.id}/parcela`, { method: 'DELETE' })
      } else if (opcao === 'todas') {
        await fetch(`${base}/grupo/${row.grupoId}`, { method: 'DELETE' })
      } else {
        await fetch(`${base}/${row.id}/futuras`, { method: 'DELETE' })
      }
      onSaved()
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm">
      <div className="bg-[var(--d2b-bg-elevated)] border border-[var(--d2b-border-strong)] rounded-2xl shadow-2xl w-full max-w-md mx-4 p-8">
        <div className="flex items-center justify-between mb-6">
          <span className="text-base font-semibold text-[var(--d2b-text-primary)]">Excluir Mensalidade</span>
          <button onClick={onClose} className="w-7 h-7 flex items-center justify-center rounded-lg text-[var(--d2b-text-muted)] hover:text-[var(--d2b-text-primary)] hover:bg-[var(--d2b-hover)] transition-colors">
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
            { val: 'esta',    label: <>Excluir apenas <strong className="text-[var(--d2b-text-primary)]">esta parcela</strong></> },
            { val: 'todas',   label: <>Excluir <strong className="text-[var(--d2b-text-primary)]">todas as parcelas</strong> da conta</> },
            { val: 'futuras', label: <>Excluir <strong className="text-[var(--d2b-text-primary)]">esta e as futuras</strong></> },
          ] as const).map(({ val, label }) => (
            <label key={val} className="flex items-center gap-3 cursor-pointer group">
              <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center shrink-0 transition-colors ${opcao === val ? 'border-[#7C4DFF]' : 'border-[#3D2A5A] group-hover:border-[#7C4DFF]'}`}>
                {opcao === val && <div className="w-2.5 h-2.5 rounded-full bg-[#7C4DFF]" />}
              </div>
              <input type="radio" className="hidden" checked={opcao === val} onChange={() => setOpcao(val)} />
              <span className="text-sm text-[var(--d2b-text-secondary)] group-hover:text-[var(--d2b-text-primary)] transition-colors">{label}</span>
            </label>
          ))}
        </div>

        <div className="flex items-center justify-end gap-3">
          <button onClick={onClose} className="px-4 py-2 text-sm text-[var(--d2b-text-secondary)] border border-[var(--d2b-border-strong)] rounded-xl hover:border-[var(--d2b-border-strong)] transition-colors">
            Cancelar
          </button>
          <button
            onClick={handleDelete}
            disabled={loading}
            className="px-4 py-2 text-sm font-bold text-white bg-red-600 hover:bg-red-700 rounded-xl disabled:opacity-60 transition-colors"
          >
            {loading ? 'Excluindo…' : 'Excluir'}
          </button>
        </div>
      </div>
    </div>
  )
}

// ─── Pagination ───────────────────────────────────────────────────────────────
function Pagination({ page, totalPages, pageSize, onPage, onPageSize }: {
  page: number; totalPages: number; pageSize: number
  onPage: (p: number) => void; onPageSize: (n: number) => void
}) {
  const [open, setOpen] = useState(false)
  return (
    <div className="flex items-center gap-1">
      {(['«','‹','›','»'] as const).map((sym, i) => {
        const actions = [() => onPage(1), () => onPage(Math.max(1, page - 1)), () => onPage(Math.min(totalPages, page + 1)), () => onPage(totalPages)]
        return (
          <button key={sym} onClick={actions[i]}
            className="w-7 h-7 flex items-center justify-center rounded text-sm text-[var(--d2b-text-secondary)] hover:bg-[var(--d2b-hover)] hover:text-[var(--d2b-text-primary)] transition-colors">
            {sym}
          </button>
        )
      })}
      <span className="w-7 h-7 flex items-center justify-center rounded bg-[#7C4DFF] text-white text-xs font-semibold">{page}</span>
      <div className="relative ml-1">
        <button onClick={() => setOpen((v) => !v)}
          className="flex items-center gap-1 px-2 py-1.5 border border-[var(--d2b-border-strong)] rounded text-xs text-[var(--d2b-text-secondary)] hover:border-[#7C4DFF] transition-colors">
          {pageSize} <ChevronDown size={11} />
        </button>
        {open && (
          <div className="absolute bottom-full mb-1 right-0 bg-[var(--d2b-bg-elevated)] border border-[var(--d2b-border-strong)] rounded-lg shadow-xl overflow-hidden z-20">
            {[5, 10, 20, 50].map((n) => (
              <button key={n} onClick={() => { onPageSize(n); setOpen(false) }}
                className={`w-full text-left px-4 py-2 text-sm hover:bg-[var(--d2b-hover)] transition-colors ${pageSize === n ? 'text-[#7C4DFF] font-semibold' : 'text-[var(--d2b-text-primary)]'}`}>
                {n}
              </button>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}

// ─── Main Component ───────────────────────────────────────────────────────────
export function TabMensalidades({ empresaId }: { empresaId: string | null }) {
  const [rows,         setRows]         = useState<Movimento[]>([])
  const [profissionais, setProfissionais] = useState<Option[]>([])
  const [pacientes,    setPacientes]    = useState<Option[]>([])
  const [search,       setSearch]       = useState('')
  const [page,         setPage]         = useState(1)
  const [pageSize,     setPageSize]     = useState(10)
  const [modalAdd,     setModalAdd]     = useState(false)
  const [editRow,      setEditRow]      = useState<Movimento | null>(null)
  const [delRow,       setDelRow]       = useState<Movimento | null>(null)
  const [showExport,   setShowExport]   = useState(false)
  const exportRef                        = useRef<HTMLDivElement>(null)

  // ── Filter state
  const [filtroOpen,      setFiltroOpen]      = useState(false)
  const [filtroBtnRect,   setFiltroBtnRect]   = useState<DOMRect | null>(null)
  const filtroBtnRef                          = useRef<HTMLButtonElement>(null)
  const [periodoFiltro,   setPeriodoFiltro]   = useState(defaultPeriodo)
  const [profFiltro,      setProfFiltro]      = useState('')
  const [pagamentoFiltro, setPagamentoFiltro] = useState('')
  const [pacienteFiltro,  setPacienteFiltro]  = useState('')
  // applied copies
  const [appliedPeriodo,   setAppliedPeriodo]   = useState('')
  const [appliedProf,      setAppliedProf]      = useState('')
  const [appliedPagamento, setAppliedPagamento] = useState('')
  const [appliedPaciente,  setAppliedPaciente]  = useState('')

  useEffect(() => {
    function onOutside(e: MouseEvent) {
      if (exportRef.current && !exportRef.current.contains(e.target as Node)) setShowExport(false)
      if (filtroBtnRef.current && !filtroBtnRef.current.contains(e.target as Node)) setFiltroOpen(false)
    }
    document.addEventListener('mousedown', onOutside)
    return () => document.removeEventListener('mousedown', onOutside)
  }, [])

  function exportar(tipo: 'pdf' | 'excel' | 'csv' | 'imprimir') {
    if (!empresaId) return
    window.open(
      `${process.env.NEXT_PUBLIC_API_URL}/api/v1/relatorios/mensalidades/${tipo}?empresaId=${empresaId}`,
      '_blank'
    )
    setShowExport(false)
  }

  const load = useCallback(async () => {
    if (!empresaId) return
    try {
      const res = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/api/v1/movimentos-financeiros/empresa/${empresaId}?tipo=MENSALIDADE`
      )
      if (res.ok) {
        const data = await res.json()
        setRows(data.map((m: {
          id: string; titulo: string; pacienteId?: string; pacienteNome?: string
          usuarioId?: string; usuarioNome?: string; tipo: string; grupoId: string
          numeroParcela: number; totalParcelas: number; valorParcela: number; valorPago: number
          dataVencimento: string; dataPagamento?: string; status: string; metodoPagamento?: string
        }) => ({
          id:            m.id,
          titulo:        m.titulo,
          pacienteId:    m.pacienteId   ?? null,
          pacienteNome:  m.pacienteNome ?? '—',
          usuarioId:     m.usuarioId    ?? null,
          usuarioNome:   m.usuarioNome  ?? '—',
          tipo:          m.tipo,
          grupoId:       m.grupoId,
          numeroParcela: m.numeroParcela,
          totalParcelas: m.totalParcelas,
          valorParcela:  m.valorParcela,
          valorPago:     m.valorPago,
          dataVencimento: new Date(m.dataVencimento).toLocaleDateString('pt-BR'),
          dataPagamento:  m.dataPagamento ? new Date(m.dataPagamento).toLocaleDateString('pt-BR') : null,
          status:        m.status,
          metodoPagamento: m.metodoPagamento ?? null,
        })))
      }
    } catch { /* backend offline */ }
  }, [empresaId])

  useEffect(() => { load() }, [load])

  useEffect(() => {
    if (!empresaId) return
    const base = process.env.NEXT_PUBLIC_API_URL
    fetch(`${base}/api/v1/pacientes/empresa/${empresaId}`)
      .then((r) => r.ok ? r.json() : [])
      .then((pacs: Array<{ id: string; nomeCompleto?: string; nome?: string }>) => {
        setPacientes(pacs.map((p) => ({ id: p.id, nome: p.nomeCompleto ?? p.nome ?? p.id })))
      }).catch(() => {})
  }, [empresaId])

  useEffect(() => {
    if (!empresaId) return
    fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/v1/usuarios/empresa/${empresaId}`)
      .then((r) => r.ok ? r.json() : [])
      .then((users: Array<{ id: string; nome?: string }>) => {
        setProfissionais(users.map((u) => ({ id: u.id, nome: u.nome ?? u.id })))
      }).catch(() => {})
  }, [empresaId])

  function aplicarFiltro() {
    setAppliedPeriodo(periodoFiltro)
    setAppliedProf(profFiltro)
    setAppliedPagamento(pagamentoFiltro)
    setAppliedPaciente(pacienteFiltro)
    setFiltroOpen(false)
  }
  function limparFiltro() {
    const dp = defaultPeriodo()
    setPeriodoFiltro(dp); setAppliedPeriodo('')
    setProfFiltro('');    setAppliedProf('')
    setPagamentoFiltro(''); setAppliedPagamento('')
    setPacienteFiltro(''); setAppliedPaciente('')
    setFiltroOpen(false)
  }

  const { inicio, fim } = parsePeriodo(appliedPeriodo)

  const filtered = rows.filter((r) => {
    const q = search.toLowerCase()
    if (q && !r.titulo.toLowerCase().includes(q) && !r.pacienteNome.toLowerCase().includes(q) && !r.usuarioNome.toLowerCase().includes(q)) return false
    if (appliedProf && r.usuarioNome !== appliedProf) return false
    if (appliedPaciente && !r.pacienteNome.toLowerCase().includes(appliedPaciente.toLowerCase())) return false
    if (appliedPagamento && r.metodoPagamento !== appliedPagamento) return false
    if (inicio || fim) {
      const d = parseBRDate(r.dataVencimento)
      if (!d) return false
      if (inicio && d < inicio) return false
      if (fim) { const fimInc = new Date(fim); fimInc.setHours(23, 59, 59); if (d > fimInc) return false }
    }
    return true
  })
  const totalPages = Math.max(1, Math.ceil(filtered.length / pageSize))
  const pageRows   = filtered.slice((page - 1) * pageSize, page * pageSize)

  const totalRecebido = rows.reduce((s, r) => s + r.valorPago, 0)
  const aReceber      = rows.reduce((s, r) => s + Math.max(0, r.valorParcela - r.valorPago), 0)

  function onSaved() {
    setModalAdd(false)
    setEditRow(null)
    setDelRow(null)
    load()
  }

  return (
    <>
      {modalAdd && empresaId && (
        <ModalAdicionar
          empresaId={empresaId}
          profissionais={profissionais}
          pacientes={pacientes}
          onClose={() => setModalAdd(false)}
          onSaved={onSaved}
        />
      )}
      {editRow && (
        <ModalEditar
          row={editRow}
          profissionais={profissionais}
          onClose={() => setEditRow(null)}
          onSaved={onSaved}
        />
      )}
      {delRow && (
        <ModalExcluir
          row={delRow}
          onClose={() => setDelRow(null)}
          onSaved={onSaved}
        />
      )}

      <div className="rounded-xl border border-[var(--d2b-border)] bg-[var(--d2b-bg-surface)] overflow-hidden">
        {/* Header */}
        <div className="px-6 pt-6 pb-4 border-b border-[var(--d2b-border)]">
          <div className="flex items-start justify-between">
            <div>
              <h2 className="text-base font-bold text-[var(--d2b-text-primary)]">Mensalidades</h2>
              <p className="text-xs text-[var(--d2b-text-secondary)] mt-0.5">Controle o recebimento mensal de seus pacientes e de outras contas da sua clínica.</p>
            </div>
            <button
              onClick={() => setModalAdd(true)}
              className="flex items-center gap-1.5 px-5 py-2 rounded-xl text-sm font-bold text-white bg-[#7C4DFF] hover:bg-[#5B21B6] transition-colors"
            >
              <Plus size={14} /> Adicionar
            </button>
          </div>
          <div className="flex items-center gap-2 mt-4">
            <div className="relative">
              <Search size={13} className="absolute left-3 top-1/2 -translate-y-1/2 text-[var(--d2b-text-muted)]" />
              <input
                type="text"
                placeholder="Pesquisar"
                value={search}
                onChange={(e) => { setSearch(e.target.value); setPage(1) }}
                className="bg-[var(--d2b-bg-main)] border border-[var(--d2b-border-strong)] rounded-lg pl-8 pr-3 py-2 text-sm text-[var(--d2b-text-primary)] placeholder:text-[#3D2A5A] focus:outline-none focus:border-[#7C4DFF] transition-colors w-48"
              />
            </div>
            <button
              ref={filtroBtnRef}
              onClick={() => { setFiltroBtnRect(filtroBtnRef.current?.getBoundingClientRect() ?? null); setFiltroOpen(v => !v) }}
              className={'flex items-center gap-1.5 px-3 py-2 text-xs font-semibold border rounded-lg transition-colors ' + (filtroOpen ? 'border-[#7C4DFF] text-[var(--d2b-text-primary)]' : 'text-[var(--d2b-text-secondary)] border-[var(--d2b-border-strong)] hover:border-[#7C4DFF] hover:text-[var(--d2b-text-primary)]')}
            >
              <Filter size={13} /> Filtrar
            </button>

            {/* Filter popover – portal so overflow-hidden never clips it */}
            {filtroOpen && filtroBtnRect && createPortal(
              <div
                style={{ position: 'fixed', top: filtroBtnRect.bottom + 8, left: filtroBtnRect.left, zIndex: 9999 }}
                className="w-72 bg-[var(--d2b-bg-elevated)] border border-[var(--d2b-border-strong)] rounded-xl shadow-2xl overflow-hidden"
                onMouseDown={(e) => e.stopPropagation()}
              >
                <div className="p-4 space-y-4">
                  {/* Período */}
                  <div className="relative">
                    <label className="absolute -top-2 left-3 z-10 bg-[var(--d2b-bg-elevated)] px-1 text-[10px] font-medium text-[var(--d2b-text-secondary)] leading-none">Período</label>
                    <input type="text" value={periodoFiltro} onChange={(e) => setPeriodoFiltro(e.target.value)}
                      placeholder="DD/MM/AAAA - DD/MM/AAAA"
                      className="w-full bg-[var(--d2b-bg-main)] border border-[var(--d2b-border-strong)] rounded-xl px-4 py-3 text-sm text-[var(--d2b-text-primary)] placeholder:text-[var(--d2b-text-muted)] focus:outline-none focus:border-[#7C4DFF] transition-colors" />
                  </div>
                  {/* Profissional */}
                  <div className="relative">
                    <label className="absolute -top-2 left-3 z-10 bg-[var(--d2b-bg-elevated)] px-1 text-[10px] font-medium text-[var(--d2b-text-secondary)] leading-none">Profissional</label>
                    <div className="relative">
                      <select value={profFiltro} onChange={(e) => setProfFiltro(e.target.value)}
                        className="w-full bg-[var(--d2b-bg-main)] border border-[var(--d2b-border-strong)] rounded-xl px-4 py-3 text-sm text-[var(--d2b-text-primary)] focus:outline-none focus:border-[#7C4DFF] transition-colors appearance-none pr-8 cursor-pointer">
                        <option value="">Todos os profissionais</option>
                        {profissionais.map((p) => <option key={p.id} value={p.nome}>{p.nome}</option>)}
                      </select>
                      <ChevronDown size={13} className="absolute right-3 top-1/2 -translate-y-1/2 text-[var(--d2b-text-secondary)] pointer-events-none" />
                    </div>
                  </div>
                  {/* Pagamento */}
                  <div className="relative">
                    <label className="absolute -top-2 left-3 z-10 bg-[var(--d2b-bg-elevated)] px-1 text-[10px] font-medium text-[var(--d2b-text-secondary)] leading-none">Pagamento</label>
                    <div className="relative">
                      <select value={pagamentoFiltro} onChange={(e) => setPagamentoFiltro(e.target.value)}
                        className="w-full bg-[var(--d2b-bg-main)] border border-[var(--d2b-border-strong)] rounded-xl px-4 py-3 text-sm text-[var(--d2b-text-primary)] focus:outline-none focus:border-[#7C4DFF] transition-colors appearance-none pr-8 cursor-pointer">
                        {METODO_OPTIONS.map((m) => <option key={m} value={m === 'Todos' ? '' : m}>{m}</option>)}
                      </select>
                      <ChevronDown size={13} className="absolute right-3 top-1/2 -translate-y-1/2 text-[var(--d2b-text-secondary)] pointer-events-none" />
                    </div>
                  </div>
                  {/* Paciente */}
                  <div className="relative">
                    <label className="absolute -top-2 left-3 z-10 bg-[var(--d2b-bg-elevated)] px-1 text-[10px] font-medium text-[var(--d2b-text-secondary)] leading-none">Paciente</label>
                    <input type="text" value={pacienteFiltro} onChange={(e) => setPacienteFiltro(e.target.value)}
                      placeholder="Busque pelo paciente"
                      className="w-full bg-[var(--d2b-bg-main)] border border-[var(--d2b-border-strong)] rounded-xl px-4 py-3 text-sm text-[var(--d2b-text-primary)] placeholder:text-[var(--d2b-text-muted)] focus:outline-none focus:border-[#7C4DFF] transition-colors" />
                  </div>
                </div>
                <div className="px-4 pb-4 flex justify-between gap-2">
                  <button onClick={limparFiltro} className="flex-1 py-2 rounded-lg border border-[var(--d2b-border-strong)] text-xs font-semibold text-[var(--d2b-text-secondary)] hover:border-[#7C4DFF] transition-colors">Limpar Filtros</button>
                  <button onClick={aplicarFiltro} className="flex-1 py-2 rounded-lg bg-[#7C4DFF] text-xs font-bold text-white hover:bg-[#5B21B6] transition-colors">Aplicar</button>
                </div>
              </div>,
              document.body
            )}
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
                  <td colSpan={6} className="px-4 py-10 text-center text-sm text-[var(--d2b-text-muted)]">
                    {!empresaId ? 'Empresa não identificada.' : 'Nenhuma mensalidade encontrada.'}
                  </td>
                </tr>
              ) : pageRows.map((r) => (
                <tr key={r.id} className="border-b border-[var(--d2b-border)] hover:bg-[var(--d2b-hover)] transition-colors">
                  {/* Ações */}
                  <td className="px-4 py-4">
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => setEditRow(r)}
                        className="w-8 h-8 flex items-center justify-center rounded-full border border-[var(--d2b-border-strong)] text-[#7C4DFF] hover:bg-[var(--d2b-hover)] transition-colors"
                        title="Editar"
                      >
                        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
                          <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/>
                          <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/>
                        </svg>
                      </button>
                      <button
                        onClick={() => setDelRow(r)}
                        className="w-8 h-8 flex items-center justify-center rounded-full border border-[rgba(239,68,68,0.30)] text-[#EF4444] hover:bg-[rgba(239,68,68,0.10)] transition-colors"
                        title="Excluir"
                      >
                        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
                          <polyline points="3 6 5 6 21 6"/>
                          <path d="M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6"/>
                          <path d="M10 11v6M14 11v6"/>
                          <path d="M9 6V4a1 1 0 0 1 1-1h4a1 1 0 0 1 1 1v2"/>
                        </svg>
                      </button>
                    </div>
                  </td>
                  {/* Nome */}
                  <td className="px-4 py-4 font-semibold text-[var(--d2b-text-primary)]">{r.titulo}</td>
                  {/* Profissional */}
                  <td className="px-4 py-4 text-[var(--d2b-text-secondary)]">{r.usuarioNome}</td>
                  {/* Paciente */}
                  <td className="px-4 py-4 text-[var(--d2b-text-secondary)]">{r.pacienteNome}</td>
                  {/* Data */}
                  <td className="px-4 py-4">
                    <p className="text-[var(--d2b-text-secondary)]">{r.dataVencimento}</p>
                    <p className="text-xs text-[#7C4DFF] mt-0.5">Parcela {r.numeroParcela}/{r.totalParcelas}</p>
                  </td>
                  {/* Pagamento */}
                  <td className="px-4 py-4 text-right">
                    <p className="text-sm font-medium text-[var(--d2b-text-primary)]">
                      {fmtBRL(r.valorPago)} de {fmtBRL(r.valorParcela)}
                    </p>
                    <div className="flex items-center justify-end mt-0.5">
                      <StatusBadge status={r.status} />
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Footer */}
        <div className="px-6 py-4 border-t border-[var(--d2b-border)] flex items-center justify-between flex-wrap gap-3">
          <div className="relative" ref={exportRef}>
            <button
              onClick={() => setShowExport((v) => !v)}
              className="flex items-center gap-1.5 px-5 py-2 rounded-xl text-sm font-medium text-[var(--d2b-text-secondary)] border border-[var(--d2b-border-strong)] hover:border-[#7C4DFF] hover:text-[var(--d2b-text-primary)] transition-colors"
            >
              <Upload size={13} /> Exportar Dados <ChevronDown size={11} />
            </button>
            {showExport && (
              <div className="absolute bottom-full mb-1 left-0 w-44 rounded-xl border border-[var(--d2b-border-strong)] bg-[var(--d2b-bg-elevated)] shadow-lg z-50 overflow-hidden">
                <button onClick={() => exportar('excel')} className="flex items-center gap-2 w-full px-4 py-2.5 text-sm text-[var(--d2b-text-primary)] hover:bg-[var(--d2b-hover)] transition-colors">
                  <FileSpreadsheet size={14} /> Excel (.xlsx)
                </button>
                <button onClick={() => exportar('csv')} className="flex items-center gap-2 w-full px-4 py-2.5 text-sm text-[var(--d2b-text-primary)] hover:bg-[var(--d2b-hover)] transition-colors">
                  <FileText size={14} /> CSV (.csv)
                </button>
                <button onClick={() => exportar('pdf')} className="flex items-center gap-2 w-full px-4 py-2.5 text-sm text-[var(--d2b-text-primary)] hover:bg-[var(--d2b-hover)] transition-colors">
                  <FileDown size={14} /> PDF
                </button>
                <button onClick={() => exportar('imprimir')} className="flex items-center gap-2 w-full px-4 py-2.5 text-sm text-[var(--d2b-text-primary)] hover:bg-[var(--d2b-hover)] transition-colors">
                  <Printer size={14} /> Imprimir
                </button>
              </div>
            )}
          </div>
          <div className="flex items-center gap-6">
            <div className="text-right">
              <p className="text-xs text-[var(--d2b-text-secondary)]">
                Total Recebido: <span className="font-semibold text-[var(--d2b-text-primary)]">{fmtBRL(totalRecebido)}</span>
              </p>
              <p className="text-xs text-[var(--d2b-text-secondary)]">
                A receber: <span className="font-semibold text-[var(--d2b-text-primary)]">{fmtBRL(aReceber)}</span>
              </p>
            </div>
            <Pagination
              page={page}
              totalPages={totalPages}
              pageSize={pageSize}
              onPage={setPage}
              onPageSize={(n) => { setPageSize(n); setPage(1) }}
            />
          </div>
        </div>
      </div>
    </>
  )
}
