'use client'

import { useState, useEffect } from 'react'
import {
  Check, Pencil, Plus, Search, ChevronDown,
  ChevronsLeft, ChevronsRight, ChevronLeft, ChevronRight,
  AlertTriangle, X,
} from 'lucide-react'
import { MensagemEditor } from '@/components/configuracoes/mensagem-editor'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { type ApiAgendamento } from '@/components/calendario/calendario-view'

// ─── Types ────────────────────────────────────────────────────────────────────
export type TabKey = 'confirmacao' | 'remarcacao' | 'cobranca' | 'agradecimentos' | 'aniversarios'

export interface AvisoRow {
  id: string
  agendamento: ApiAgendamento
  paciente: string
  telefone: string
  profissional: string
  dataConsulta: string
  status: 'Agendado' | 'Aguardando' | 'Confirmado' | 'Atendido' | 'Faltou' | 'Desmarcado' | 'Cancelado'
}



// ─── Default messages ─────────────────────────────────────────────────────────
export const DEFAULT_MSGS: Record<TabKey, string> = {
  confirmacao:    `Sua consulta com o(a) #nome_profissional# no dia #data_e_hora_agendamento# está próxima. Por favor, confirme a sua presença pelo link abaixo.\n\nCaso você não consiga comparecer à consulta, responda a essa mensagem nos informando. Obrigado(a)\n\nLink para confirmação: #link_de_confirmacao#`,
  remarcacao:     `Você gostaria de reagendar uma consulta com #nome_profissional#, já que não compareceu em seu último agendamento?`,
  cobranca:       `Olá #nome_paciente#! Identificamos que você possui um débito pendente. Entre em contato conosco para regularizar sua situação.`,
  agradecimentos: `Olá #nome_paciente#! Agradecemos pela sua visita. Esperamos ter atendido suas expectativas. Até a próxima!`,
  aniversarios:   `Olá #nome_paciente#! Em nome da nossa clínica venho desejar um Feliz Aniversário e muitas felicidades. Que esse novo ano seja repleto de coisas positivas na sua vida! =]`,
}

// ─── Constants ────────────────────────────────────────────────────────────────
const PROFISSIONAIS = ['Todos os profissionais', 'JESSE DOS SANTOS BEZERRA']
const ROWS_OPTIONS  = [10, 25, 50]

const INP =
  'w-full bg-[var(--d2b-bg-elevated)] border border-[var(--d2b-border-strong)] rounded-md ' +
  'px-3 py-2.5 text-sm text-[var(--d2b-text-primary)] placeholder:text-[var(--d2b-text-muted)] ' +
  'focus:outline-none focus:border-[#7C4DFF] transition-colors'

// ─── MessagePreview ───────────────────────────────────────────────────────────
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

// ─── Tipo map ─────────────────────────────────────────────────────────────────
const TIPO_MAP: Record<TabKey, string> = {
  confirmacao:    'CONFIRMAR_AGENDAMENTO',
  remarcacao:     'REMARCACAO',
  cobranca:       'COBRANCA',
  agradecimentos: 'AGRADECIMENTO',
  aniversarios:   'ANIVERSARIO',
}

const API_URL = process.env.NEXT_PUBLIC_API_URL ?? ''

// ─── EditarMensagemModal ──────────────────────────────────────────────────────
export function EditarMensagemModal({
  open, onClose, tabKey, empresaId,
}: {
  open: boolean; onClose: () => void; tabKey: TabKey; empresaId?: string | null
}) {
  const [msg, setMsg]         = useState(DEFAULT_MSGS[tabKey])
  const [loading, setLoading] = useState(false)
  const [saving, setSaving]   = useState(false)

  useEffect(() => {
    if (!open || !empresaId) {
      setMsg(DEFAULT_MSGS[tabKey])
      return
    }
    setLoading(true)
    fetch(`${API_URL}/api/v1/mensagens-padrao/empresa/${empresaId}/tipo/${TIPO_MAP[tabKey]}`)
      .then((r) => r.ok ? r.json() : null)
      .then((data) => { if (data?.texto) setMsg(data.texto) })
      .catch(() => {})
      .finally(() => setLoading(false))
  }, [open, empresaId, tabKey])

  const handleSalvar = async () => {
    if (!empresaId) { onClose(); return }
    setSaving(true)
    try {
      await fetch(
        `${API_URL}/api/v1/mensagens-padrao/empresa/${empresaId}/tipo/${TIPO_MAP[tabKey]}`,
        { method: 'PUT', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ texto: msg }) },
      )
    } catch { /* silencioso */ } finally {
      setSaving(false)
      onClose()
    }
  }

  return (
    <Dialog open={open} onOpenChange={(v: boolean) => { if (!v) onClose() }}>
      <DialogContent
        showCloseButton={false}
        className="bg-[var(--d2b-bg-elevated)] border border-[var(--d2b-border-strong)] text-[var(--d2b-text-primary)] !max-w-2xl p-0 gap-0 overflow-hidden"
      >
        <DialogHeader className="flex-row items-center justify-between px-6 py-4 border-b border-[var(--d2b-border)] space-y-0">
          <DialogTitle className="text-base font-bold text-[var(--d2b-text-primary)]">Editar Mensagem</DialogTitle>
          <button onClick={onClose} className="w-7 h-7 rounded-md flex items-center justify-center text-[var(--d2b-text-secondary)] hover:text-[var(--d2b-text-primary)] hover:bg-[var(--d2b-hover)] transition-colors text-lg leading-none">✕</button>
        </DialogHeader>

        <div className="px-6 py-5 space-y-3">
          {loading ? (
            <div className="flex items-center justify-center py-8 text-xs text-[var(--d2b-text-secondary)]">Carregando...</div>
          ) : (
            <MensagemEditor value={msg} onChange={setMsg} minHeight={150} />
          )}

          <div className="flex items-start gap-2 rounded-md px-3 py-2.5" style={{ background: 'rgba(124,77,255,0.08)', border: '1px solid rgba(124,77,255,0.25)' }}>
            <AlertTriangle size={14} className="shrink-0 mt-0.5" style={{ color: '#7C4DFF' }} />
            <p className="text-xs" style={{ color: '#7C4DFF' }}>
              Este padrão de mensagem será aplicado apenas às mensagens manuais. O disparo automático tem um padrão não editável.
            </p>
          </div>
        </div>

        <div className="flex items-center justify-end gap-3 px-6 py-4 border-t border-[var(--d2b-border)]">
          <button onClick={onClose} className="px-5 py-2 rounded-md text-sm font-medium text-[var(--d2b-text-secondary)] border border-[var(--d2b-border-strong)] hover:border-[#7C4DFF] hover:text-[var(--d2b-text-primary)] transition-colors">
            Cancelar
          </button>
          <button onClick={handleSalvar} disabled={saving || loading || !msg.replace(/<[^>]*>/g, '').trim()} className="px-5 py-2 rounded-md text-sm font-bold text-white bg-[#7C4DFF] hover:bg-[#5B21B6] disabled:opacity-50 transition-colors">
            {saving ? 'Salvando…' : 'Salvar'}
          </button>
        </div>
      </DialogContent>
    </Dialog>
  )
}

// ─── ProgramarDisparosModal ───────────────────────────────────────────────────
export function ProgramarDisparosModal({
  open, onClose, usuarioId, initialAtivo, onSaved,
}: {
  open: boolean
  onClose: () => void
  usuarioId?: string | null
  initialAtivo?: boolean
  onSaved?: (ativo: boolean) => void
}) {
  const [ativo, setAtivo] = useState(initialAtivo ?? false)
  const [saving, setSaving] = useState(false)

  useEffect(() => { setAtivo(initialAtivo ?? false) }, [initialAtivo, open])

  async function handleSalvar() {
    if (!usuarioId) { onClose(); return }
    setSaving(true)
    try {
      await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/api/v1/configuracoes-mensagens/usuario/${usuarioId}`,
        {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ envioSmsAutomatico: ativo }),
        }
      )
      onSaved?.(ativo)
    } catch {}
    setSaving(false)
    onClose()
  }

  return (
    <Dialog open={open} onOpenChange={(v: boolean) => { if (!v) onClose() }}>
      <DialogContent
        showCloseButton={false}
        className="bg-[var(--d2b-bg-elevated)] border border-[var(--d2b-border-strong)] text-[var(--d2b-text-primary)] !max-w-sm p-0 gap-0 overflow-hidden"
      >
        <DialogHeader className="flex-row items-center justify-between px-6 py-4 border-b border-[var(--d2b-border)] space-y-0">
          <DialogTitle className="text-base font-bold text-[var(--d2b-text-primary)]">Programar Disparos</DialogTitle>
          <button onClick={onClose} className="w-7 h-7 rounded-md flex items-center justify-center text-[var(--d2b-text-secondary)] hover:text-[var(--d2b-text-primary)] hover:bg-[var(--d2b-hover)] transition-colors text-lg leading-none">✕</button>
        </DialogHeader>

        <label className="flex items-center gap-3 px-6 py-5 p-3 rounded-lg cursor-pointer">
          <div className="relative flex items-center shrink-0">
            <input
              type="checkbox"
              checked={ativo}
              onChange={(e) => setAtivo(e.target.checked)}
              className="peer sr-only"
            />
            <div className="w-10 h-5 bg-[#CBD5E1] rounded-full peer-checked:bg-[#7C4DFF] transition-colors" />
            <div className={`absolute top-0.5 w-4 h-4 bg-white rounded-full shadow transition-transform ${ativo ? 'translate-x-5' : 'translate-x-0.5'}`} />
          </div>
          <span className="text-sm text-[var(--d2b-text-primary)]">Ativar Disparo Automático</span>
        </label>

        <div className="flex items-center justify-end gap-3 px-6 py-4 border-t border-[var(--d2b-border)]">
          <button onClick={onClose} className="px-5 py-2 rounded-md text-sm font-medium text-[var(--d2b-text-secondary)] border border-[var(--d2b-border-strong)] hover:border-[#7C4DFF] hover:text-[var(--d2b-text-primary)] transition-colors">
            Cancelar
          </button>
          <button onClick={handleSalvar} disabled={saving} className="px-5 py-2 rounded-md text-sm font-bold text-white bg-[#7C4DFF] hover:bg-[#5B21B6] disabled:opacity-50 transition-colors">
            {saving ? 'Salvando...' : 'Salvar'}
          </button>
        </div>
      </DialogContent>
    </Dialog>
  )
}

// ─── StatusBadge ─────────────────────────────────────────────────────────────
export function StatusBadge({ status }: { status: AvisoRow['status'] }) {
  const map: Record<string, { bg: string; text: string; dot: string }> = {
    Agendado:   { bg: 'bg-[var(--d2b-hover)]', text: 'text-[var(--d2b-text-secondary)]', dot: 'bg-[#A78BCC]' },
    Aguardando: { bg: 'bg-[rgba(234,179,8,0.15)]',  text: 'text-[#EAB308]', dot: 'bg-[#EAB308]' },
    Confirmado: { bg: 'bg-[rgba(20,184,166,0.15)]', text: 'text-[#14B8A6]', dot: 'bg-[#14B8A6]' },
    Atendido:   { bg: 'bg-[rgba(34,197,94,0.15)]',  text: 'text-[#22C55E]', dot: 'bg-[#22C55E]' },
    Faltou:     { bg: 'bg-[rgba(100,116,139,0.15)]', text: 'text-[#94A3B8]', dot: 'bg-[#94A3B8]' },
    Desmarcado: { bg: 'bg-[rgba(239,68,68,0.15)]',  text: 'text-[#EF4444]', dot: 'bg-[#EF4444]' },
    Cancelado:  { bg: 'bg-[rgba(239,68,68,0.15)]',  text: 'text-[#EF4444]', dot: 'bg-[#EF4444]' },
  }
  const s = map[status] ?? map.Agendado
  return (
    <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-xs font-semibold ${s.bg} ${s.text}`}>
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
      className="w-8 h-8 rounded-md flex items-center justify-center text-[var(--d2b-text-secondary)] hover:text-[var(--d2b-text-primary)] hover:bg-[var(--d2b-hover)] disabled:opacity-30 disabled:pointer-events-none transition-colors"
    >
      {children}
    </button>
  )
}

// ─── AvisosTable ─────────────────────────────────────────────────────────────
export function AvisosTable({
  rows, tabKey, disparosAtivados, onDisparoChange, onRowClick, empresaId, usuarioId,
}: {
  rows: AvisoRow[]
  tabKey: Exclude<TabKey, 'aniversarios'>
  disparosAtivados?: boolean
  onDisparoChange?: (ativo: boolean) => void
  onRowClick?: (ag: ApiAgendamento) => void
  empresaId?: string | null
  usuarioId?: string | null
}) {
  const [search, setSearch]           = useState('')
  const [prof, setProf]               = useState('Todos os profissionais')
  const [page, setPage]               = useState(1)
  const [rowsPerPage, setRowsPerPage] = useState(10)
  const [editarOpen, setEditarOpen]   = useState(false)
  const [programarOpen, setProgramarOpen] = useState(false)

  const filtered = rows.filter((r) => {
    const q = search.toLowerCase()
    const matchSearch = !q || r.paciente.toLowerCase().includes(q) || r.telefone.includes(q)
    const matchProf   = prof === 'Todos os profissionais' || r.profissional === prof
    return matchSearch && matchProf
  })

  const totalPages = Math.max(1, Math.ceil(filtered.length / rowsPerPage))
  const paginated  = filtered.slice((page - 1) * rowsPerPage, page * rowsPerPage)

  return (
    <div className="space-y-4">
      {/* Actions row */}
      <div className="flex justify-end gap-2">
        {disparosAtivados ? (
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
        )}

        <button
          onClick={() => setEditarOpen(true)}
          className="flex items-center gap-1.5 px-4 py-2 rounded-md text-sm font-medium text-[var(--d2b-text-secondary)] border border-[var(--d2b-border-strong)] hover:border-[#7C4DFF] hover:text-[var(--d2b-text-primary)] transition-colors"
        >
          <Pencil size={13} />
          Editar Mensagem
        </button>
      </div>

      {/* Filters */}
      <div className="flex gap-3">
        <div className="flex-1 flex items-center gap-2 bg-[var(--d2b-bg-elevated)] border border-[var(--d2b-border-strong)] rounded-md px-3 py-2.5 focus-within:border-[#7C4DFF] transition-colors">
          <Search size={14} className="text-[var(--d2b-text-muted)] shrink-0" />
          <input
            value={search}
            onChange={(e) => { setSearch(e.target.value); setPage(1) }}
            placeholder="Pesquisar"
            className="bg-transparent text-sm text-[var(--d2b-text-primary)] placeholder:text-[var(--d2b-text-muted)] focus:outline-none w-full"
          />
          {search && (
            <button onClick={() => setSearch('')} className="text-[var(--d2b-text-muted)] hover:text-[var(--d2b-text-primary)] transition-colors">
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
            {PROFISSIONAIS.map((p) => (
              <option key={p} value={p} style={{ background: '#1A0A38' }}>{p}</option>
            ))}
          </select>
          <ChevronDown size={13} className="absolute right-3 top-1/2 -translate-y-1/2 text-[var(--d2b-text-secondary)] pointer-events-none" />
        </div>
      </div>

      {/* Table */}
      <div className="rounded-xl border border-[var(--d2b-border)] overflow-hidden">
        <div className="grid grid-cols-[auto_2fr_2fr_2fr_1.5fr] bg-[var(--d2b-hover)] border-b border-[var(--d2b-border)]">
          {['', 'PACIENTE', 'PROFISSIONAL', 'DATA DA CONSULTA', 'STATUS'].map((col) => (
            <div key={col} className="px-4 py-3 text-[10px] font-semibold tracking-wider text-[var(--d2b-text-muted)] uppercase">
              {col}
            </div>
          ))}
        </div>

        {paginated.length === 0 ? (
          <div className="flex items-center justify-center py-12 text-sm text-[var(--d2b-text-muted)]">
            Nenhum registro encontrado
          </div>
        ) : (
          paginated.map((row, i) => (
            <div
              key={row.id}
              onClick={() => onRowClick?.(row.agendamento)}
              className={`grid grid-cols-[auto_2fr_2fr_2fr_1.5fr] items-center border-b border-[var(--d2b-border)] transition-colors ${onRowClick ? 'cursor-pointer hover:bg-[var(--d2b-hover)]' : 'hover:bg-[var(--d2b-hover)]'} ${i % 2 === 1 ? 'bg-[var(--d2b-hover)]' : ''}`}
            >
              <div className="px-4 py-3">
                <button className="flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-bold bg-[rgba(20,184,166,0.15)] text-[#14B8A6] border border-[rgba(20,184,166,0.30)] hover:bg-[rgba(20,184,166,0.25)] transition-colors whitespace-nowrap">
                  📱 Enviar
                </button>
              </div>
              <div className="px-4 py-3">
                <p className="text-sm font-semibold text-[var(--d2b-text-primary)] leading-snug">{row.paciente}</p>
                <p className="text-xs text-[var(--d2b-text-muted)]">{row.telefone}</p>
              </div>
              <div className="px-4 py-3">
                <p className="text-sm text-[var(--d2b-text-secondary)]">{row.profissional}</p>
              </div>
              <div className="px-4 py-3">
                <p className="text-sm text-[var(--d2b-text-secondary)]">{row.dataConsulta}</p>
              </div>
              <div className="px-4 py-3 flex items-center gap-2">
                <StatusBadge status={row.status} />
                <button className="w-7 h-7 flex items-center justify-center rounded-md text-[var(--d2b-text-secondary)] hover:text-[var(--d2b-text-primary)] hover:bg-[var(--d2b-hover)] transition-colors">
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
            className={`w-8 h-8 rounded-md text-sm font-medium transition-colors ${p === page ? 'bg-[#7C4DFF] text-white' : 'text-[var(--d2b-text-secondary)] hover:text-[var(--d2b-text-primary)] hover:bg-[var(--d2b-hover)]'}`}
          >{p}</button>
        ))}
        <PageBtn onClick={() => setPage((p) => Math.min(totalPages, p + 1))} disabled={page === totalPages}><ChevronRight size={14} /></PageBtn>
        <PageBtn onClick={() => setPage(totalPages)} disabled={page === totalPages}><ChevronsRight size={14} /></PageBtn>
        <div className="relative ml-2">
          <select
            value={rowsPerPage}
            onChange={(e) => { setRowsPerPage(Number(e.target.value)); setPage(1) }}
            className="bg-[var(--d2b-bg-elevated)] border border-[var(--d2b-border-strong)] rounded-md pl-3 pr-7 py-1.5 text-sm text-[var(--d2b-text-primary)] appearance-none cursor-pointer focus:outline-none focus:border-[#7C4DFF] transition-colors"
          >
            {ROWS_OPTIONS.map((r) => <option key={r} value={r} style={{ background: '#1A0A38' }}>{r}</option>)}
          </select>
          <ChevronDown size={12} className="absolute right-2.5 top-1/2 -translate-y-1/2 text-[var(--d2b-text-secondary)] pointer-events-none" />
        </div>
      </div>

      <EditarMensagemModal open={editarOpen} onClose={() => setEditarOpen(false)} tabKey={tabKey} empresaId={empresaId} />
      <ProgramarDisparosModal
        open={programarOpen}
        onClose={() => setProgramarOpen(false)}
        usuarioId={usuarioId}
        initialAtivo={disparosAtivados}
        onSaved={(ativo) => { onDisparoChange?.(ativo); setProgramarOpen(false) }}
      />
    </div>
  )
}
