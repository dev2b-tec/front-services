'use client'

import { useState, useMemo } from 'react'
import { useRouter } from 'next/navigation'
import {
  Pencil, Plus, Search, ChevronDown,
  ChevronsLeft, ChevronsRight, ChevronLeft, ChevronRight,
} from 'lucide-react'
import { EditarMensagemModal, ProgramarDisparosModal } from './tab-avisos-table'

// â”€â”€â”€ Types â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
export interface PacienteBasico {
  id: string
  nome: string
  dataNascimento: string | null
  telefone: string | null
}

export interface AniversarioRow {
  id: string
  paciente: string
  telefone: string | null
  idade: number
}

// â”€â”€â”€ Helpers â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
function addDays(d: Date, n: number) {
  const r = new Date(d)
  r.setDate(r.getDate() + n)
  return r
}

function formatBR(d: Date) {
  return d.toLocaleDateString('pt-BR')
}

function parseBR(s: string): Date | null {
  const parts = s.trim().split('/')
  if (parts.length !== 3) return null
  const d = new Date(Number(parts[2]), Number(parts[1]) - 1, Number(parts[0]))
  return isNaN(d.getTime()) ? null : d
}

// Checks if this person's birthday (month+day) falls between start and end dates
function birthdayInRange(dataNascimento: string, start: Date, end: Date): boolean {
  const born   = new Date(dataNascimento + 'T00:00:00')
  const bMonth = born.getMonth()
  const bDay   = born.getDate()
  for (let y = start.getFullYear(); y <= end.getFullYear(); y++) {
    const candidate = new Date(y, bMonth, bDay)
    if (candidate >= start && candidate <= end) return true
  }
  return false
}

// â”€â”€â”€ Constants â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
const ROWS_OPTIONS = [10, 25, 50]

const INP =
  'w-full bg-[#150830] border border-[rgba(124,77,255,0.25)] rounded-md ' +
  'px-3 py-2.5 text-sm text-[#F5F0FF] placeholder:text-[#6B4E8A] ' +
  'focus:outline-none focus:border-[#7C4DFF] transition-colors'

// â”€â”€â”€ PageBtn â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
function PageBtn({ onClick, disabled, children }: { onClick: () => void; disabled: boolean; children: React.ReactNode }) {
  return (
    <button
      onClick={onClick}
      disabled={disabled}
      className="w-8 h-8 rounded-md flex items-center justify-center text-[#A78BCC] hover:text-[#F5F0FF] hover:bg-[rgba(124,77,255,0.12)] disabled:opacity-30 disabled:pointer-events-none transition-colors"
    >
      {children}
    </button>
  )
}

// â”€â”€â”€ AniversariosTab â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
export function AniversariosTab({
  empresaId,
  pacientes,
  loading,
}: {
  empresaId: string | null
  pacientes: PacienteBasico[]
  loading: boolean
}) {
  const today = useMemo(() => { const d = new Date(); d.setHours(0, 0, 0, 0); return d }, [])

  const defaultRange = useMemo(
    () => `${formatBR(today)} - ${formatBR(today)}`,
    [today],
  )

  const [search, setSearch]             = useState('')
  const [dateRange, setDateRange]       = useState(defaultRange)
  const [appliedRange, setAppliedRange] = useState(defaultRange)
  const [page, setPage]                 = useState(1)
  const [rowsPerPage, setRowsPerPage]   = useState(10)
  const [editarOpen, setEditarOpen]     = useState(false)
  const [programarOpen, setProgramarOpen] = useState(false)

  const router = useRouter()

  const { startDate, endDate } = useMemo(() => {
    const parts = appliedRange.split(' - ')
    const s = parseBR(parts[0] ?? '') ?? today
    const e = parseBR(parts[1] ?? '') ?? today
    e.setHours(23, 59, 59, 999)
    return { startDate: s, endDate: e }
  }, [appliedRange, today])

  const allRows = useMemo<AniversarioRow[]>(() => {
    const thisYear = today.getFullYear()
    return pacientes
      .filter((p) => p.dataNascimento && birthdayInRange(p.dataNascimento, startDate, endDate))
      .map((p) => ({
        id: p.id,
        paciente: p.nome,
        telefone: p.telefone ?? null,
        idade: thisYear - new Date(p.dataNascimento! + 'T00:00:00').getFullYear(),
      }))
  }, [pacientes, startDate, endDate, today])

  const filtered = useMemo(
    () => allRows.filter((r) => !search || r.paciente.toLowerCase().includes(search.toLowerCase())),
    [allRows, search],
  )

  const totalPages = Math.max(1, Math.ceil(filtered.length / rowsPerPage))
  const paginated  = filtered.slice((page - 1) * rowsPerPage, page * rowsPerPage)

  return (
    <div className="space-y-4">
      {/* Actions */}
      <div className="flex justify-end gap-2">
        <button
          onClick={() => setProgramarOpen(true)}
          className="flex items-center gap-1.5 px-4 py-2 rounded-md text-sm font-bold text-white bg-[#7C4DFF] hover:bg-[#5B21B6] transition-colors"
        >
          <Plus size={14} />
          Programar Disparos
        </button>
        <button
          onClick={() => setEditarOpen(true)}
          className="flex items-center gap-1.5 px-4 py-2 rounded-md text-sm font-medium text-[#A78BCC] border border-[rgba(124,77,255,0.25)] hover:border-[#7C4DFF] hover:text-[#F5F0FF] transition-colors"
        >
          <Pencil size={13} />
          Editar Mensagem
        </button>
      </div>

      {/* Filters */}
      <div className="flex gap-3">
        <div className="flex-1 flex items-center gap-2 bg-[#150830] border border-[rgba(124,77,255,0.25)] rounded-md px-3 py-2.5 focus-within:border-[#7C4DFF] transition-colors">
          <Search size={14} className="text-[#6B4E8A] shrink-0" />
          <input
            value={search}
            onChange={(e) => { setSearch(e.target.value); setPage(1) }}
            placeholder="Pesquisar"
            className="bg-transparent text-sm text-[#F5F0FF] placeholder:text-[#6B4E8A] focus:outline-none w-full"
          />
        </div>

        <div className="relative min-w-[280px]">
          <label className="absolute -top-2 left-3 z-10 bg-[#0D0520] px-1 text-[10px] font-medium text-[#A78BCC] leading-none">
            Dia do Aniversário
          </label>
          <input
            value={dateRange}
            onChange={(e) => setDateRange(e.target.value)}
            placeholder={defaultRange}
            className={INP}
          />
        </div>

        <button
          onClick={() => { setAppliedRange(dateRange); setPage(1) }}
          className="px-6 py-2.5 rounded-md text-sm font-bold text-white bg-[#7C4DFF] hover:bg-[#5B21B6] transition-colors"
        >
          Filtrar
        </button>
      </div>

      {/* Table */}
      <div className="rounded-xl border border-[rgba(124,77,255,0.18)] overflow-hidden">
        <div className="grid grid-cols-[auto_2fr_1fr] bg-[rgba(124,77,255,0.06)] border-b border-[rgba(124,77,255,0.18)]">
          {['', 'PACIENTE', 'IDADE'].map((col) => (
            <div key={col} className="px-4 py-3 text-[10px] font-semibold tracking-wider text-[#6B4E8A] uppercase">
              {col}
            </div>
          ))}
        </div>

        {loading ? (
          <div className="flex items-center justify-center py-12">
            <svg className="animate-spin" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#7C4DFF" strokeWidth="2">
              <path d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z" opacity=".3"/>
              <path d="M21 12a9 9 0 00-9-9"/>
            </svg>
          </div>
        ) : paginated.length === 0 ? (
          <div className="flex items-center justify-center py-12 text-sm text-[#6B4E8A]">
            Nenhum registro encontrado
          </div>
        ) : (
          paginated.map((row, i) => (
            <div
              key={row.id}
              onClick={() => router.push(`/dashboard/clientes?pacienteId=${row.id}`)}
              className={`grid grid-cols-[auto_2fr_1fr] items-center border-b border-[rgba(124,77,255,0.10)] hover:bg-[rgba(124,77,255,0.08)] transition-colors cursor-pointer ${i % 2 === 1 ? 'bg-[rgba(124,77,255,0.02)]' : ''}`}
            >
              <div className="px-4 py-3">
                <button
                  onClick={(e) => e.stopPropagation()}
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-bold bg-[rgba(20,184,166,0.15)] text-[#14B8A6] border border-[rgba(20,184,166,0.30)] hover:bg-[rgba(20,184,166,0.25)] transition-colors whitespace-nowrap"
                >
                  📱 Enviar
                </button>
              </div>
              <div className="px-4 py-3">
                <p className="text-sm font-semibold text-[#F5F0FF] leading-snug">{row.paciente}</p>
                {row.telefone && <p className="text-xs text-[#6B4E8A]">{row.telefone}</p>}
              </div>
              <div className="px-4 py-3">
                <p className="text-sm text-[#A78BCC]">{row.idade} anos</p>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Pagination */}
      <div className="flex items-center justify-center gap-2">
        <PageBtn onClick={() => setPage(1)} disabled={page === 1}><ChevronsLeft size={14} /></PageBtn>
        <PageBtn onClick={() => setPage((p) => Math.max(1, p - 1))} disabled={page === 1}><ChevronLeft size={14} /></PageBtn>
        {Array.from({ length: totalPages }, (_, i) => i + 1).map((p) => (
          <button
            key={p}
            onClick={() => setPage(p)}
            className={`w-8 h-8 rounded-md text-sm font-medium transition-colors ${p === page ? 'bg-[#7C4DFF] text-white' : 'text-[#A78BCC] hover:text-[#F5F0FF] hover:bg-[rgba(124,77,255,0.12)]'}`}
          >{p}</button>
        ))}
        <PageBtn onClick={() => setPage((p) => Math.min(totalPages, p + 1))} disabled={page === totalPages}><ChevronRight size={14} /></PageBtn>
        <PageBtn onClick={() => setPage(totalPages)} disabled={page === totalPages}><ChevronsRight size={14} /></PageBtn>
        <div className="relative ml-2">
          <select
            value={rowsPerPage}
            onChange={(e) => { setRowsPerPage(Number(e.target.value)); setPage(1) }}
            className="bg-[#150830] border border-[rgba(124,77,255,0.25)] rounded-md pl-3 pr-7 py-1.5 text-sm text-[#F5F0FF] appearance-none cursor-pointer focus:outline-none focus:border-[#7C4DFF] transition-colors"
          >
            {ROWS_OPTIONS.map((r) => <option key={r} value={r} style={{ background: '#1A0A38' }}>{r}</option>)}
          </select>
          <ChevronDown size={12} className="absolute right-2.5 top-1/2 -translate-y-1/2 text-[#A78BCC] pointer-events-none" />
        </div>
      </div>

      <EditarMensagemModal open={editarOpen} onClose={() => setEditarOpen(false)} tabKey="aniversarios" empresaId={empresaId} />
      <ProgramarDisparosModal open={programarOpen} onClose={() => setProgramarOpen(false)} />
    </div>
  )
}
