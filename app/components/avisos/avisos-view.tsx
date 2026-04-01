'use client'

import { useState } from 'react'
import {
  FileCheck, RefreshCw, Wallet, Heart, Cake,
  Check, Pencil, Plus, Search, ChevronDown,
  ChevronsLeft, ChevronsRight, ChevronLeft, ChevronRight,
  AlertTriangle, X,
} from 'lucide-react'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'

// ─── Types ────────────────────────────────────────────────────────────────────
type TabKey = 'confirmacao' | 'remarcacao' | 'cobranca' | 'agradecimentos' | 'aniversarios'

interface AvisoRow {
  id: string
  paciente: string
  telefone: string
  profissional: string
  dataConsulta: string
  status: 'Confirmado' | 'Pendente' | 'Cancelado' | 'Faltou'
}

interface AniversarioRow {
  id: string
  paciente: string
  idade: number
}

// ─── Mock data ────────────────────────────────────────────────────────────────
const MOCK_CONFIRMACAO: AvisoRow[] = [
  {
    id: '1',
    paciente: 'Paciente Exemplo',
    telefone: '+550000000000',
    profissional: 'JESSE DOS SANTOS BEZERRA',
    dataConsulta: '03/04/2026 09:00',
    status: 'Confirmado',
  },
]

const MOCK_REMARCACAO: AvisoRow[] = []
const MOCK_COBRANCA: AvisoRow[] = []
const MOCK_AGRADECIMENTOS: AvisoRow[] = []
const MOCK_ANIVERSARIOS: AniversarioRow[] = []

const PROFISSIONAIS = ['Todos os profissionais', 'JESSE DOS SANTOS BEZERRA']
const ROWS_OPTIONS = [10, 25, 50]

// ─── Default messages ─────────────────────────────────────────────────────────
const DEFAULT_MSGS: Record<TabKey, string> = {
  confirmacao: `Sua consulta com o(a) #nome_profissional# no dia #data_e_hora_agendamento# está próxima. Por favor, confirme a sua presença pelo link abaixo.\n\nCaso você não consiga comparecer à consulta, responda a essa mensagem nos informando. Obrigado(a)\n\nLink para confirmação: #link_de_confirmacao#`,
  remarcacao: `Você gostaria de reagendar uma consulta com #nome_profissional#, já que não compareceu em seu último agendamento?`,
  cobranca: `Olá #nome_paciente#! Identificamos que você possui um débito pendente. Entre em contato conosco para regularizar sua situação.`,
  agradecimentos: `Olá #nome_paciente#! Agradecemos pela sua visita. Esperamos ter atendido suas expectativas. Até a próxima!`,
  aniversarios: `Olá #nome_paciente#! Em nome da nossa clínica venho desejar um Feliz Aniversário e muitas felicidades. Que esse novo ano seja repleto de coisas positivas na sua vida! =]`,
}

// ─── Base classes ─────────────────────────────────────────────────────────────
const INP =
  'w-full bg-[#150830] border border-[rgba(124,77,255,0.25)] rounded-md ' +
  'px-3 py-2.5 text-sm text-[#F5F0FF] placeholder:text-[#6B4E8A] ' +
  'focus:outline-none focus:border-[#7C4DFF] transition-colors'

// ─── Hashtag-aware message renderer (read-only preview) ──────────────────────
function MessagePreview({ text }: { text: string }) {
  const parts = text.split(/(#[^#\s]+#)/g)
  return (
    <span>
      {parts.map((p, i) =>
        /^#[^#\s]+#$/.test(p) ? (
          <span key={i} className="text-[#EF4444] font-medium">{p}</span>
        ) : (
          <span key={i}>{p}</span>
        ),
      )}
    </span>
  )
}

// ─── EditarMensagemModal ──────────────────────────────────────────────────────
function EditarMensagemModal({
  open, onClose, tabKey,
}: {
  open: boolean; onClose: () => void; tabKey: TabKey
}) {
  const [msg, setMsg] = useState(DEFAULT_MSGS[tabKey])

  return (
    <Dialog open={open} onOpenChange={(v: boolean) => { if (!v) onClose() }}>
      <DialogContent
        showCloseButton={false}
        className="bg-[#1A0A38] border border-[rgba(124,77,255,0.30)] text-[#F5F0FF] !max-w-xl p-0 gap-0 overflow-hidden"
      >
        <DialogHeader className="flex-row items-center justify-between px-6 py-4 border-b border-[rgba(124,77,255,0.18)] space-y-0">
          <DialogTitle className="text-base font-bold text-[#F5F0FF]">Editar Mensagem</DialogTitle>
          <button onClick={onClose} className="w-7 h-7 rounded-md flex items-center justify-center text-[#A78BCC] hover:text-[#F5F0FF] hover:bg-[rgba(124,77,255,0.12)] transition-colors text-lg leading-none">✕</button>
        </DialogHeader>

        <div className="px-6 py-5 space-y-3">
          {/* Textarea with preview overlay */}
          <div className="relative rounded-md border border-[rgba(124,77,255,0.25)] bg-[#150830] focus-within:border-[#7C4DFF] transition-colors overflow-hidden">
            <textarea
              rows={6}
              value={msg}
              onChange={(e) => setMsg(e.target.value)}
              className="w-full bg-transparent px-3 py-2.5 text-sm text-transparent caret-[#F5F0FF] placeholder:text-[#6B4E8A] focus:outline-none resize-none relative z-10"
              spellCheck={false}
            />
            {/* Colored preview layer behind textarea */}
            <div
              aria-hidden
              className="absolute inset-0 px-3 py-2.5 text-sm text-[#F5F0FF] whitespace-pre-wrap break-words pointer-events-none overflow-hidden"
              style={{ lineHeight: '1.5rem' }}
            >
              <MessagePreview text={msg} />
            </div>
          </div>

          <p className="text-xs text-[#6B4E8A]">
            Adicione variáveis inserindo hastag(#) no campo de texto onde desejar. Elas serão substituídas automaticamente com seus valores no momento de criação do documento:
          </p>

          <div className="flex items-start gap-2 rounded-md bg-[rgba(234,179,8,0.08)] border border-[rgba(234,179,8,0.25)] px-3 py-2.5">
            <AlertTriangle size={14} className="text-[#EAB308] shrink-0 mt-0.5" />
            <p className="text-xs text-[#EAB308]">
              Este padrão de mensagem será aplicado apenas às mensagens manuais. O disparo automático tem um padrão não editável.
            </p>
          </div>
        </div>

        <div className="flex items-center justify-end gap-3 px-6 py-4 border-t border-[rgba(124,77,255,0.18)]">
          <button
            onClick={onClose}
            className="px-5 py-2 rounded-md text-sm font-medium text-[#A78BCC] border border-[rgba(124,77,255,0.25)] hover:border-[#7C4DFF] hover:text-[#F5F0FF] transition-colors"
          >
            Cancelar
          </button>
          <button
            onClick={onClose}
            className="px-5 py-2 rounded-md text-sm font-bold text-white bg-[#7C4DFF] hover:bg-[#5B21B6] transition-colors"
          >
            Salvar
          </button>
        </div>
      </DialogContent>
    </Dialog>
  )
}

// ─── ProgramarDisparosModal ───────────────────────────────────────────────────
function ProgramarDisparosModal({ open, onClose }: { open: boolean; onClose: () => void }) {
  const [ativo, setAtivo] = useState(false)

  return (
    <Dialog open={open} onOpenChange={(v: boolean) => { if (!v) onClose() }}>
      <DialogContent
        showCloseButton={false}
        className="bg-[#1A0A38] border border-[rgba(124,77,255,0.30)] text-[#F5F0FF] !max-w-sm p-0 gap-0 overflow-hidden"
      >
        <DialogHeader className="flex-row items-center justify-between px-6 py-4 border-b border-[rgba(124,77,255,0.18)] space-y-0">
          <DialogTitle className="text-base font-bold text-[#F5F0FF]">Programar Disparos</DialogTitle>
          <button onClick={onClose} className="w-7 h-7 rounded-md flex items-center justify-center text-[#A78BCC] hover:text-[#F5F0FF] hover:bg-[rgba(124,77,255,0.12)] transition-colors text-lg leading-none">✕</button>
        </DialogHeader>

        <div className="px-6 py-5 flex items-center justify-between">
          <span className="text-sm text-[#A78BCC]">Ativar Disparo Automático</span>
          <button
            type="button"
            onClick={() => setAtivo((p) => !p)}
            className={`relative w-10 h-5 rounded-full transition-colors shrink-0 ${ativo ? 'bg-[#7C4DFF]' : 'bg-[#2D1B4E]'}`}
          >
            <span className={`absolute top-0.5 w-4 h-4 rounded-full bg-white shadow transition-transform ${ativo ? 'translate-x-5' : 'translate-x-0.5'}`} />
          </button>
        </div>

        <div className="flex items-center justify-end gap-3 px-6 py-4 border-t border-[rgba(124,77,255,0.18)]">
          <button onClick={onClose} className="px-5 py-2 rounded-md text-sm font-medium text-[#A78BCC] border border-[rgba(124,77,255,0.25)] hover:border-[#7C4DFF] hover:text-[#F5F0FF] transition-colors">
            Cancelar
          </button>
          <button onClick={onClose} className="px-5 py-2 rounded-md text-sm font-bold text-white bg-[#7C4DFF] hover:bg-[#5B21B6] transition-colors">
            Salvar
          </button>
        </div>
      </DialogContent>
    </Dialog>
  )
}

// ─── StatusBadge ─────────────────────────────────────────────────────────────
function StatusBadge({ status }: { status: AvisoRow['status'] }) {
  const map: Record<AvisoRow['status'], { bg: string; text: string; dot: string }> = {
    Confirmado: { bg: 'bg-[rgba(20,184,166,0.15)]', text: 'text-[#14B8A6]', dot: 'bg-[#14B8A6]' },
    Pendente:   { bg: 'bg-[rgba(234,179,8,0.15)]',  text: 'text-[#EAB308]', dot: 'bg-[#EAB308]' },
    Cancelado:  { bg: 'bg-[rgba(239,68,68,0.15)]',  text: 'text-[#EF4444]', dot: 'bg-[#EF4444]' },
    Faltou:     { bg: 'bg-[rgba(100,116,139,0.15)]', text: 'text-[#94A3B8]', dot: 'bg-[#94A3B8]' },
  }
  const s = map[status]
  return (
    <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-xs font-semibold border border-transparent ${s.bg} ${s.text}`}>
      <span className={`w-1.5 h-1.5 rounded-full shrink-0 ${s.dot}`} />
      {status}
    </span>
  )
}

// ─── PageBtn ─────────────────────────────────────────────────────────────────
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

// ─── AvisosTable (Confirmação / Remarcação / Cobrança / Agradecimentos) ──────
function AvisosTable({
  rows, tabKey, disparosAtivados,
}: {
  rows: AvisoRow[]; tabKey: TabKey; disparosAtivados?: boolean
}) {
  const [search, setSearch] = useState('')
  const [prof, setProf] = useState('Todos os profissionais')
  const [page, setPage] = useState(1)
  const [rowsPerPage, setRowsPerPage] = useState(10)
  const [editarOpen, setEditarOpen] = useState(false)
  const [programarOpen, setProgramarOpen] = useState(false)

  const filtered = rows.filter((r) => {
    const q = search.toLowerCase()
    const matchSearch = !q || r.paciente.toLowerCase().includes(q) || r.telefone.includes(q)
    const matchProf = prof === 'Todos os profissionais' || r.profissional === prof
    return matchSearch && matchProf
  })

  const totalPages = Math.max(1, Math.ceil(filtered.length / rowsPerPage))
  const paginated = filtered.slice((page - 1) * rowsPerPage, page * rowsPerPage)

  return (
    <div className="space-y-4">
      {/* Actions row */}
      <div className="flex justify-end gap-2">
        {disparosAtivados !== undefined ? (
          disparosAtivados ? (
            <button className="flex items-center gap-1.5 px-4 py-2 rounded-md text-sm font-bold text-white bg-[#14B8A6] hover:bg-[#0D9488] transition-colors">
              <Check size={14} />
              Disparos Ativados
            </button>
          ) : (
            <button
              onClick={() => setProgramarOpen(true)}
              className="flex items-center gap-1.5 px-4 py-2 rounded-md text-sm font-bold text-white bg-[#7C4DFF] hover:bg-[#5B21B6] transition-colors"
            >
              <Plus size={14} />
              Programar Disparos
            </button>
          )
        ) : (
          <button
            onClick={() => setProgramarOpen(true)}
            className="flex items-center gap-1.5 px-4 py-2 rounded-md text-sm font-bold text-white bg-[#7C4DFF] hover:bg-[#5B21B6] transition-colors"
          >
            <Plus size={14} />
            Programar Disparos
          </button>
        )}

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
          {search && (
            <button onClick={() => setSearch('')} className="text-[#6B4E8A] hover:text-[#F5F0FF] transition-colors">
              <X size={13} />
            </button>
          )}
        </div>

        <div className="relative min-w-[220px]">
          <select
            value={prof}
            onChange={(e) => { setProf(e.target.value); setPage(1) }}
            className={INP + ' appearance-none pr-8 cursor-pointer'}
          >
            {PROFISSIONAIS.map((p) => <option key={p} value={p} style={{ background: '#1A0A38' }}>{p}</option>)}
          </select>
          <ChevronDown size={13} className="absolute right-3 top-1/2 -translate-y-1/2 text-[#A78BCC] pointer-events-none" />
        </div>
      </div>

      {/* Table */}
      <div className="rounded-xl border border-[rgba(124,77,255,0.18)] overflow-hidden">
        <div className="grid grid-cols-[auto_2fr_2fr_2fr_1.5fr] bg-[rgba(124,77,255,0.06)] border-b border-[rgba(124,77,255,0.18)]">
          {['', 'PACIENTE', 'PROFISSIONAL', 'DATA DA CONSULTA', 'STATUS'].map((col) => (
            <div key={col} className="px-4 py-3 text-[10px] font-semibold tracking-wider text-[#6B4E8A] uppercase">
              {col}
            </div>
          ))}
        </div>

        {paginated.length === 0 ? (
          <div className="flex items-center justify-center py-12 text-sm text-[#6B4E8A]">
            Nenhum registro encontrado
          </div>
        ) : (
          paginated.map((row, i) => (
            <div
              key={row.id}
              className={`grid grid-cols-[auto_2fr_2fr_2fr_1.5fr] items-center border-b border-[rgba(124,77,255,0.10)] hover:bg-[rgba(124,77,255,0.05)] transition-colors ${i % 2 === 1 ? 'bg-[rgba(124,77,255,0.02)]' : ''}`}
            >
              {/* Enviar */}
              <div className="px-4 py-3">
                <button className="flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-bold bg-[rgba(20,184,166,0.15)] text-[#14B8A6] border border-[rgba(20,184,166,0.30)] hover:bg-[rgba(20,184,166,0.25)] transition-colors whitespace-nowrap">
                  📱 Enviar
                </button>
              </div>
              {/* Paciente */}
              <div className="px-4 py-3">
                <p className="text-sm font-semibold text-[#F5F0FF] leading-snug">{row.paciente}</p>
                <p className="text-xs text-[#6B4E8A]">{row.telefone}</p>
              </div>
              {/* Profissional */}
              <div className="px-4 py-3">
                <p className="text-sm text-[#A78BCC]">{row.profissional}</p>
              </div>
              {/* Data */}
              <div className="px-4 py-3">
                <p className="text-sm text-[#A78BCC]">{row.dataConsulta}</p>
              </div>
              {/* Status */}
              <div className="px-4 py-3 flex items-center gap-2">
                <StatusBadge status={row.status} />
                <button className="w-7 h-7 flex items-center justify-center rounded-md text-[#A78BCC] hover:text-[#F5F0FF] hover:bg-[rgba(124,77,255,0.12)] transition-colors">
                  <Pencil size={13} />
                </button>
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

      <EditarMensagemModal open={editarOpen} onClose={() => setEditarOpen(false)} tabKey={tabKey} />
      <ProgramarDisparosModal open={programarOpen} onClose={() => setProgramarOpen(false)} />
    </div>
  )
}

// ─── AniversariosTab ──────────────────────────────────────────────────────────
function AniversariosTab() {
  const [search, setSearch] = useState('')
  const [dateRange, setDateRange] = useState('')
  const [page, setPage] = useState(1)
  const [rowsPerPage, setRowsPerPage] = useState(10)
  const [editarOpen, setEditarOpen] = useState(false)
  const [programarOpen, setProgramarOpen] = useState(false)

  const today = new Date().toLocaleDateString('pt-BR')
  const defaultRange = `${today} - ${today}`

  const filtered = MOCK_ANIVERSARIOS.filter((r) => {
    const q = search.toLowerCase()
    return !q || r.paciente.toLowerCase().includes(q)
  })
  const totalPages = Math.max(1, Math.ceil(filtered.length / rowsPerPage))
  const paginated = filtered.slice((page - 1) * rowsPerPage, page * rowsPerPage)

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
            value={dateRange || defaultRange}
            onChange={(e) => setDateRange(e.target.value)}
            placeholder={defaultRange}
            className={INP}
          />
        </div>
        <button className="px-6 py-2.5 rounded-md text-sm font-bold text-white bg-[#7C4DFF] hover:bg-[#5B21B6] transition-colors">
          Filtrar
        </button>
      </div>

      {/* Table */}
      <div className="rounded-xl border border-[rgba(124,77,255,0.18)] overflow-hidden">
        <div className="grid grid-cols-2 bg-[rgba(124,77,255,0.06)] border-b border-[rgba(124,77,255,0.18)]">
          {['PACIENTE', 'IDADE'].map((col) => (
            <div key={col} className="px-4 py-3 text-[10px] font-semibold tracking-wider text-[#6B4E8A] uppercase">
              {col}
            </div>
          ))}
        </div>

        {paginated.length === 0 ? (
          <div className="flex items-center justify-center py-12 text-sm text-[#6B4E8A]">
            Nenhum registro encontrado
          </div>
        ) : (
          paginated.map((row, i) => (
            <div
              key={row.id}
              className={`grid grid-cols-2 items-center border-b border-[rgba(124,77,255,0.10)] hover:bg-[rgba(124,77,255,0.05)] transition-colors ${i % 2 === 1 ? 'bg-[rgba(124,77,255,0.02)]' : ''}`}
            >
              <div className="px-4 py-3">
                <p className="text-sm font-semibold text-[#F5F0FF]">{row.paciente}</p>
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
          <button key={p} onClick={() => setPage(p)} className={`w-8 h-8 rounded-md text-sm font-medium transition-colors ${p === page ? 'bg-[#7C4DFF] text-white' : 'text-[#A78BCC] hover:text-[#F5F0FF] hover:bg-[rgba(124,77,255,0.12)]'}`}>{p}</button>
        ))}
        <PageBtn onClick={() => setPage((p) => Math.min(totalPages, p + 1))} disabled={page === totalPages}><ChevronRight size={14} /></PageBtn>
        <PageBtn onClick={() => setPage(totalPages)} disabled={page === totalPages}><ChevronsRight size={14} /></PageBtn>
        <div className="relative ml-2">
          <select value={rowsPerPage} onChange={(e) => { setRowsPerPage(Number(e.target.value)); setPage(1) }} className="bg-[#150830] border border-[rgba(124,77,255,0.25)] rounded-md pl-3 pr-7 py-1.5 text-sm text-[#F5F0FF] appearance-none cursor-pointer focus:outline-none focus:border-[#7C4DFF] transition-colors">
            {ROWS_OPTIONS.map((r) => <option key={r} value={r} style={{ background: '#1A0A38' }}>{r}</option>)}
          </select>
          <ChevronDown size={12} className="absolute right-2.5 top-1/2 -translate-y-1/2 text-[#A78BCC] pointer-events-none" />
        </div>
      </div>

      <EditarMensagemModal open={editarOpen} onClose={() => setEditarOpen(false)} tabKey="aniversarios" />
      <ProgramarDisparosModal open={programarOpen} onClose={() => setProgramarOpen(false)} />
    </div>
  )
}

// ─── Tab definitions ──────────────────────────────────────────────────────────
const TABS: {
  key: TabKey
  label: string
  icon: React.ElementType
  title: string
  description: string
  badge: number
}[] = [
  {
    key: 'confirmacao', label: 'Confirmação', icon: FileCheck,
    title: 'Confirmação de Presença',
    description: 'Envie mensagens para lembrar e confirmar a presença dos seus pacientes.',
    badge: MOCK_CONFIRMACAO.length,
  },
  {
    key: 'remarcacao', label: 'Remarcação', icon: RefreshCw,
    title: 'Remarcação',
    description: 'Envie mensagens para reagendar pacientes que faltaram em seus últimos agendamentos.',
    badge: MOCK_REMARCACAO.length,
  },
  {
    key: 'cobranca', label: 'Cobrança', icon: Wallet,
    title: 'Cobrança',
    description: 'Envie mensagens de cobrança para pacientes com débitos pendentes.',
    badge: MOCK_COBRANCA.length,
  },
  {
    key: 'agradecimentos', label: 'Agradecimentos', icon: Heart,
    title: 'Agradecimentos',
    description: 'Envie mensagens de agradecimento após as consultas.',
    badge: MOCK_AGRADECIMENTOS.length,
  },
  {
    key: 'aniversarios', label: 'Aniversários', icon: Cake,
    title: 'Aniversários',
    description: 'Deseje feliz aniversário a seus pacientes!',
    badge: MOCK_ANIVERSARIOS.length,
  },
]

const AVISO_DATA: Record<Exclude<TabKey, 'aniversarios'>, AvisoRow[]> = {
  confirmacao:    MOCK_CONFIRMACAO,
  remarcacao:     MOCK_REMARCACAO,
  cobranca:       MOCK_COBRANCA,
  agradecimentos: MOCK_AGRADECIMENTOS,
}

// ─── AvisosView ───────────────────────────────────────────────────────────────
export function AvisosView() {
  const [activeTab, setActiveTab] = useState<TabKey>('confirmacao')
  const tab = TABS.find((t) => t.key === activeTab)!
  const TabIcon = tab.icon

  return (
    <div className="min-h-full bg-[#0D0520]">
      {/* Tabs bar */}
      <div className="border-b border-[rgba(124,77,255,0.15)] bg-[#0D0520]">
        <div className="flex overflow-x-auto">
          {TABS.map((t) => {
            const Icon = t.icon
            const active = t.key === activeTab
            return (
              <button
                key={t.key}
                onClick={() => setActiveTab(t.key)}
                className={`flex flex-col items-center gap-1 px-6 py-3.5 text-sm font-medium whitespace-nowrap transition-colors border-b-2 ${
                  active
                    ? 'border-[#7C4DFF] text-[#7C4DFF]'
                    : 'border-transparent text-[#6B4E8A] hover:text-[#A78BCC]'
                }`}
              >
                <Icon size={18} />
                {t.label}
              </button>
            )
          })}
        </div>
      </div>

      {/* Tab content */}
      <div className="px-6 py-5 space-y-5">
        {/* Header card */}
        <div className="flex items-center justify-between rounded-xl bg-[rgba(124,77,255,0.06)] border border-[rgba(124,77,255,0.15)] px-5 py-4">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-lg bg-[rgba(124,77,255,0.15)] flex items-center justify-center shrink-0">
              <TabIcon size={18} className="text-[#7C4DFF]" />
            </div>
            <div>
              <p className="text-sm font-bold text-[#F5F0FF]">{tab.title}</p>
              <p className="text-xs text-[#6B4E8A] mt-0.5">{tab.description}</p>
            </div>
          </div>
          <div className="w-9 h-9 rounded-full bg-[#7C4DFF] flex items-center justify-center shrink-0">
            <span className="text-sm font-bold text-white">{tab.badge}</span>
          </div>
        </div>

        {/* Table */}
        {activeTab === 'aniversarios' ? (
          <AniversariosTab />
        ) : (
          <AvisosTable
            rows={AVISO_DATA[activeTab as Exclude<TabKey, 'aniversarios'>]}
            tabKey={activeTab}
            disparosAtivados={activeTab === 'confirmacao' ? true : undefined}
          />
        )}
      </div>
    </div>
  )
}
