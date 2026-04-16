'use client'

import { useState, useRef, useEffect, type ReactNode } from 'react'
import { useSearchParams } from 'next/navigation'
import { useToast } from '@/hooks/use-toast'
import { trackClienteCadastrado } from '@/lib/analytics'
import { TabEvolucoes } from '@/components/clientes/tab-evolucoes'
import { TabLinhaTempo as TabLinhaDoTempo } from '@/components/clientes/tab-linha-do-tempo'
import { TabAnamnese } from '@/components/clientes/tab-anamnese'
import { TabFinanceiro } from '@/components/clientes/tab-financeiro'
import { TabDocumentos } from '@/components/clientes/tab-documentos'
import { SistemaMensagensModal } from '@/components/mensagens/sistema-mensagens-modal'
import {
  Search, Plus, Pencil, Trash2,
  ChevronsUpDown, ChevronDown, ChevronUp,
  CalendarIcon, ChevronLeft, ChevronRight,
  ChevronsLeft, ChevronsRight, ArrowLeft,
  User, LayoutGrid, ClipboardList, Activity,
  DollarSign, FileText, X, Clock, Eye,
  MessageCircle, Zap, Send, Lock, Printer, Settings, Loader2,
} from 'lucide-react'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'

// --- Masks ------------------------------------------------------------------
function maskCpf(v: string) {
  const d = v.replace(/\D/g, '').slice(0, 11)
  if (d.length <= 3) return d
  if (d.length <= 6) return `${d.slice(0, 3)}.${d.slice(3)}`
  if (d.length <= 9) return `${d.slice(0, 3)}.${d.slice(3, 6)}.${d.slice(6)}`
  return `${d.slice(0, 3)}.${d.slice(3, 6)}.${d.slice(6, 9)}-${d.slice(9)}`
}

function maskCep(v: string) {
  const d = v.replace(/\D/g, '').slice(0, 8)
  if (d.length <= 5) return d
  return `${d.slice(0, 5)}-${d.slice(5)}`
}

// --- Types -----------------------------------------------------------------
type Cliente = {
  id: string
  nome: string
  telefone: string
  sessoes: number
  grupo: string
  statusPagamento: string
  genero?: string
  convenio?: string
  email?: string
}

type Agendamento = {
  id: string
  data: string
  dataLabel: string
  profissional: string
  inicio: string
  fim: string
  status: string
  pagamento: string
}

// --- Mock data --------------------------------------------------------------
const MOCK_CLIENTES: Cliente[] = [
  { id: '1', nome: 'Monique Franca',   telefone: '+55 81 99634 9077', sessoes: 0, grupo: '—', statusPagamento: 'Em Aberto' },
  { id: '2', nome: 'Paciente Exemplo', telefone: '+55 000000000',     sessoes: 1, grupo: '—', statusPagamento: 'Quitado', convenio: 'PARTICULAR' },
]

const MOCK_AGENDAMENTOS: Agendamento[] = [
  { id: 'a1', data: '2026-04-01', dataLabel: 'Abril 1, 2026',    profissional: 'JESSE DOS SANTOS BEZERRA', inicio: '09:00', fim: '10:00', status: 'Faltou',   pagamento: 'Valores a definir' },
  { id: 'a2', data: '2026-03-30', dataLabel: 'Março 30, 2026', profissional: 'JESSE DOS SANTOS BEZERRA', inicio: '09:00', fim: '10:00', status: 'Atendido', pagamento: 'Valores a definir' },
]

// --- API Types ---------------------------------------------------------------
export type ProfissionalItem = { id: string; nome: string }

export type PacienteApi = {
  id: string
  empresaId?: string
  nome: string
  dataNascimento?: string | null
  telefone?: string | null
  genero?: string | null
  plano?: string | null
  numeroCarteirinha?: string | null
  grupo?: string | null
  comoConheceu?: string | null
  rg?: string | null
  cpf?: string | null
  cep?: string | null
  email?: string | null
  logradouro?: string | null
  numero?: string | null
  complemento?: string | null
  bairro?: string | null
  cidade?: string | null
  outrasInformacoes?: string | null
  nomeResponsavel?: string | null
  dataNascimentoResp?: string | null
  cpfResponsavel?: string | null
  telefoneResponsavel?: string | null
  statusPagamento: string | null
  sessoes: number
  usuarioId?: string | null
  usuarioNome?: string | null
}

function statusLabel(s: string | null | undefined): string {
  if (!s) return '—'
  const map: Record<string, string> = {
    EM_ABERTO: 'Em Aberto',
    QUITADO: 'Quitado',
    PENDENTE: 'Pendente',
  }
  return map[s] ?? s
}

function pacienteParaCliente(p: PacienteApi): Cliente {
  return {
    id: p.id,
    nome: p.nome,
    telefone: p.telefone ?? '',
    sessoes: p.sessoes ?? 0,
    grupo: p.grupo ?? '—',
    statusPagamento: statusLabel(p.statusPagamento),
    genero: p.genero ?? undefined,
    convenio: p.plano ?? undefined,
    email: p.email ?? undefined,
  }
}

// --- Shared styles ----------------------------------------------------------
const INPUT = [
  'w-full bg-[var(--d2b-bg-elevated)] border border-[var(--d2b-border-strong)] rounded-md',
  'px-3 py-2.5 text-sm text-[var(--d2b-text-primary)] placeholder:text-[var(--d2b-text-muted)]',
  'focus:outline-none focus:border-[#7C4DFF] transition-colors',
].join(' ')

const SELECT = INPUT + ' appearance-none cursor-pointer'

const BTN_GHOST = 'px-4 py-2 rounded-md text-sm font-medium text-[var(--d2b-text-secondary)] border border-[var(--d2b-border-strong)] hover:border-[#7C4DFF] hover:text-[var(--d2b-text-primary)] transition-colors'
const BTN_PRIMARY = 'px-4 py-2 rounded-md text-sm font-bold text-white bg-[#7C4DFF] hover:bg-[#5B21B6] transition-colors'

// --- Helpers -----------------------------------------------------------------
function FloatingField({ label, required, children }: { label: string; required?: boolean; children: ReactNode }) {
  return (
    <div className="relative">
      <label className="absolute -top-2 left-3 z-10 bg-[var(--d2b-bg-elevated)] px-1 text-[10px] font-medium text-[var(--d2b-text-secondary)] leading-none">
        {label}{required && <span className="text-[#7C4DFF] ml-0.5">*</span>}
      </label>
      {children}
    </div>
  )
}

function FieldSelect({ label, required, options, placeholder, value, onChange }: {
  label: string; required?: boolean; options: string[]; placeholder?: string; value?: string; onChange?: (v: string) => void
}) {
  return (
    <FloatingField label={label} required={required}>
      <div className="relative">
        {onChange !== undefined ? (
          <select value={value ?? ''} onChange={(e) => onChange(e.target.value)} className={SELECT}>
            <option value="" disabled>{placeholder ?? 'Selecione'}</option>
            {options.map((o) => <option key={o}>{o}</option>)}
          </select>
        ) : (
          <select defaultValue={value ?? ''} className={SELECT}>
            <option value="" disabled>{placeholder ?? 'Selecione'}</option>
            {options.map((o) => <option key={o}>{o}</option>)}
          </select>
        )}
        <ChevronDown size={13} className="absolute right-3 top-1/2 -translate-y-1/2 text-[var(--d2b-text-secondary)] pointer-events-none" />
      </div>
    </FloatingField>
  )
}

function PhoneField({ label, required, value, onChange }: { label: string; required?: boolean; value?: string; onChange?: (v: string) => void }) {
  return (
    <FloatingField label={label} required={required}>
      <div className="flex gap-2">
        <div className="flex items-center gap-1 shrink-0 bg-[var(--d2b-bg-elevated)] border border-[var(--d2b-border-strong)] rounded-md px-2.5 text-sm text-[var(--d2b-text-primary)] cursor-pointer h-10">
          🇧🇷 <span className="text-[var(--d2b-text-secondary)] text-xs ml-1">+55</span>
          <ChevronDown size={11} className="text-[var(--d2b-text-muted)] ml-0.5" />
        </div>
        {onChange !== undefined
          ? <input className={INPUT} value={value ?? ''} onChange={(e) => onChange(e.target.value)} />
          : <input className={INPUT} defaultValue={value ?? ''} />
        }
      </div>
    </FloatingField>
  )
}

function DateField({ label, value, onChange }: { label: string; value?: string; onChange?: (v: string) => void }) {
  return (
    <FloatingField label={label}>
      <div className="relative">
        {onChange !== undefined
          ? <input type="date" value={value ?? ''} onChange={(e) => onChange(e.target.value)} className={INPUT + ' pr-9'} />
          : <input type="date" className={INPUT + ' pr-9'} />
        }
        <CalendarIcon size={14} className="absolute right-3 top-1/2 -translate-y-1/2 text-[var(--d2b-text-secondary)] pointer-events-none" />
      </div>
    </FloatingField>
  )
}

function Section({ title, open, onToggle, children }: { title: string; open: boolean; onToggle: () => void; children: ReactNode }) {
  return (
    <div className="border-t border-[var(--d2b-border)]">
      <button type="button" onClick={onToggle}
        className="w-full flex items-center justify-between py-3 text-sm font-bold text-[#7C4DFF] hover:text-[#C084FC] transition-colors">
        {title}
        {open ? <ChevronUp size={15} /> : <ChevronDown size={15} />}
      </button>
      {open && <div className="pb-4 space-y-3">{children}</div>}
    </div>
  )
}

function formatTelefone(tel: string | undefined | null): string {
  if (!tel) return '—'
  const digits = tel.replace(/\D/g, '')
  // com DDI +55: 5511999999999 (13 dígitos) ou 55119999-9999 (12 dígitos)
  if (digits.length === 13 && digits.startsWith('55')) {
    const ddd = digits.slice(2, 4)
    const parte1 = digits.slice(4, 9)
    const parte2 = digits.slice(9)
    return `+55 (${ddd}) ${parte1}-${parte2}`
  }
  if (digits.length === 12 && digits.startsWith('55')) {
    const ddd = digits.slice(2, 4)
    const parte1 = digits.slice(4, 8)
    const parte2 = digits.slice(8)
    return `+55 (${ddd}) ${parte1}-${parte2}`
  }
  // sem DDI: 11999999999 (11 dígitos) ou 1199999999 (10 dígitos)
  if (digits.length === 11) {
    return `(${digits.slice(0, 2)}) ${digits.slice(2, 7)}-${digits.slice(7)}`
  }
  if (digits.length === 10) {
    return `(${digits.slice(0, 2)}) ${digits.slice(2, 6)}-${digits.slice(6)}`
  }
  return tel
}

function StatusBadge({ status }: { status: string }) {
  const label = statusLabel(status)
  if (label === '—') {
    return <span className="text-sm text-[var(--d2b-text-muted)]">—</span>
  }
  const color: Record<string, string> = { 'Em Aberto': '#EF4444', 'Quitado': '#22C55E', 'Pendente': '#F59E0B' }
  const c = color[label] ?? '#A78BCC'
  return (
    <span className="flex items-center gap-1.5 text-sm font-medium" style={{ color: c }}>
      <span className="w-2 h-2 rounded-full shrink-0" style={{ background: c }} />
      {label}
    </span>
  )
}

function PageBtn({ onClick, disabled, children }: { onClick: () => void; disabled: boolean; children: ReactNode }) {
  return (
    <button onClick={onClick} disabled={disabled}
      className="w-8 h-8 rounded-md flex items-center justify-center text-[var(--d2b-text-secondary)] hover:text-[var(--d2b-text-primary)] hover:bg-[var(--d2b-hover)] disabled:opacity-30 disabled:pointer-events-none transition-colors">
      {children}
    </button>
  )
}

function StatusEventBadge({ status }: { status: string }) {
  const map: Record<string, { color: string; bg: string }> = {
    'Faltou':   { color: '#EF4444', bg: 'rgba(239,68,68,0.12)' },
    'Atendido': { color: '#10B981', bg: 'rgba(16,185,129,0.12)' },
    'Confirmado': { color: '#7C4DFF', bg: 'rgba(124,77,255,0.12)' },
    'Agendado': { color: '#A78BCC', bg: 'rgba(167,139,204,0.12)' },
  }
  const s = map[status] ?? { color: '#A78BCC', bg: 'rgba(167,139,204,0.12)' }
  return (
    <span className="flex items-center gap-1 text-xs font-semibold px-2 py-0.5 rounded-full" style={{ color: s.color, background: s.bg }}>
      <span className="w-1.5 h-1.5 rounded-full" style={{ background: s.color }} />
      {status}
    </span>
  )
}

// --- Modal: Detalhes do Agendamento ------------------------------------------
function AgendamentoModal({ open, onClose, ag, empresaId, clienteId, clienteNome, clienteTelefone }: { open: boolean; onClose: () => void; ag: Agendamento | null; empresaId?: string | null; clienteId?: string | null; clienteNome?: string | null; clienteTelefone?: string | null }) {
  const [mensagensOpen, setMensagensOpen] = useState(false)
  if (!ag) return null

  const statusColors: Record<string, string> = {
    'Faltou': '#EF4444', 'Atendido': '#10B981', 'Confirmado': '#7C4DFF', 'Agendado': '#A78BCC',
  }
  const sc = statusColors[ag.status] ?? '#A78BCC'
  const dataFmt = ag.data.split('-').reverse().join('/')

  return (
    <>
      <Dialog open={open} onOpenChange={(v) => { if (!v) onClose() }}>
        <DialogContent showCloseButton={false}
          className="bg-[var(--d2b-bg-elevated)] border border-[var(--d2b-border-strong)] text-[var(--d2b-text-primary)] !max-w-2xl p-0 gap-0 overflow-hidden">
          <DialogHeader className="flex-row items-center justify-between px-6 py-4 border-b border-[var(--d2b-border)] space-y-0">
            <DialogTitle className="flex items-center gap-2 text-sm font-bold text-[var(--d2b-text-primary)]">
              Detalhes do Agendamento <Search size={13} className="text-[var(--d2b-text-muted)]" />
            </DialogTitle>
            <button onClick={onClose} className="w-7 h-7 flex items-center justify-center rounded-md text-[var(--d2b-text-secondary)] hover:text-[var(--d2b-text-primary)] hover:bg-[var(--d2b-hover)] transition-colors">
              <X size={15} />
            </button>
          </DialogHeader>

          <div className="overflow-y-auto max-h-[72vh] px-6 py-5 space-y-5">

            {/* Informacoes do Paciente */}
            <div>
              <p className="text-xs font-bold tracking-widest text-[#7C4DFF] mb-3">INFORMAÇÕES DO PACIENTE</p>
              <div className="flex items-center gap-3 mb-3">
                <span className="text-base font-bold text-[var(--d2b-text-primary)]">Paciente Exemplo</span>
                <button onClick={() => setMensagensOpen(true)}
                  className="flex items-center gap-1.5 text-xs font-medium text-[var(--d2b-text-primary)] bg-[var(--d2b-hover)] border border-[var(--d2b-border-strong)] px-3 py-1.5 rounded-md hover:bg-[var(--d2b-hover)] transition-colors">
                  <MessageCircle size={11} /> Mensagem
                </button>
                <button className="flex items-center gap-1.5 text-xs font-medium text-[var(--d2b-text-secondary)] border border-[var(--d2b-border-strong)] px-3 py-1.5 rounded-md hover:border-[#7C4DFF] hover:text-[var(--d2b-text-primary)] transition-colors">
                  <Zap size={11} /> Atalhos <ChevronDown size={11} />
                </button>
              </div>
              <div className="grid grid-cols-3 gap-3">
                <FloatingField label="Telefone"><input readOnly className={INPUT} defaultValue="+550000000000" /></FloatingField>
                <FloatingField label="Convênio"><input readOnly className={INPUT} defaultValue="PARTICULAR" /></FloatingField>
                <FloatingField label="Número da Carteirinha"><input readOnly className={INPUT} defaultValue="-" /></FloatingField>
              </div>
            </div>

            {/* Detalhes do Evento */}
            <div>
              <p className="text-xs font-bold tracking-widest text-[#7C4DFF] mb-3">DETALHES DO EVENTO</p>
              <div className="space-y-3">
                <div className="grid grid-cols-3 gap-3">
                  <FloatingField label="Profissional" required>
                    <div className="flex items-center gap-1 bg-[var(--d2b-bg-elevated)] border border-[var(--d2b-border-strong)] rounded-md px-3 h-10">
                      <span className="flex-1 text-sm text-[var(--d2b-text-primary)] truncate">{ag.profissional}</span>
                      <X size={12} className="text-[var(--d2b-text-muted)] cursor-pointer hover:text-[#EF4444]" />
                      <ChevronDown size={12} className="text-[var(--d2b-text-secondary)] cursor-pointer" />
                    </div>
                  </FloatingField>
                  <FloatingField label="Início Evento" required>
                    <input className={INPUT} defaultValue={`${dataFmt} ${ag.inicio}`} />
                  </FloatingField>
                  <FloatingField label="Fim Evento" required>
                    <input className={INPUT} defaultValue={`${dataFmt} ${ag.fim}`} />
                  </FloatingField>
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <FloatingField label="Status" required>
                    <div className="relative">
                      <select className={SELECT}>
                        <option style={{ color: sc }}>{ag.status}</option>
                      </select>
                      <span className="absolute left-3 top-1/2 -translate-y-1/2 w-2 h-2 rounded-full pointer-events-none" style={{ background: sc }} />
                      <ChevronDown size={13} className="absolute right-3 top-1/2 -translate-y-1/2 text-[var(--d2b-text-secondary)] pointer-events-none" />
                    </div>
                  </FloatingField>
                  <FloatingField label="Sala">
                    <div className="relative">
                      <select className={SELECT}><option value="">Selecione uma sala</option></select>
                      <ChevronDown size={13} className="absolute right-3 top-1/2 -translate-y-1/2 text-[var(--d2b-text-secondary)] pointer-events-none" />
                    </div>
                  </FloatingField>
                </div>
              </div>
            </div>

            {/* Servicos */}
            <div>
              <p className="text-xs font-bold tracking-widest text-[#7C4DFF] mb-3">SERVIÇOS PRESTADOS</p>
              <p className="text-xs text-[var(--d2b-text-muted)] mb-2">Nenhum serviço adicionado neste agendamento</p>
              <button className="text-xs text-[#7C4DFF] border border-[var(--d2b-border-strong)] px-3 py-1.5 rounded-md hover:bg-[var(--d2b-hover)] transition-colors">
                + Adicionar Serviço
              </button>
            </div>

            {/* Detalhes Financeiros */}
            <div>
              <p className="text-xs font-bold tracking-widest text-[#7C4DFF] mb-3">DETALHES FINANCEIROS</p>
              <div className="space-y-3">
                <div className="grid grid-cols-2 gap-3">
                  <FloatingField label="Valor"><input className={INPUT} defaultValue="R$ 0,00" /></FloatingField>
                  <FloatingField label="Valor Recebido">
                    <div className="flex gap-2">
                      <input className={INPUT} defaultValue="R$ 0,00" />
                      <button className="shrink-0 flex items-center gap-1.5 text-xs text-[var(--d2b-text-secondary)] border border-[var(--d2b-border-strong)] px-3 rounded-md hover:border-[#7C4DFF] transition-colors whitespace-nowrap">
                        <FileText size={11} /> Recibo
                      </button>
                    </div>
                  </FloatingField>
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <FloatingField label="Data Pagamento">
                    <input className={INPUT} placeholder="dd/mm/aaaa" />
                  </FloatingField>
                  <FloatingField label="Método Pagamento">
                    <div className="relative">
                      <select className={SELECT}><option value="">Selecione...</option></select>
                      <ChevronDown size={13} className="absolute right-3 top-1/2 -translate-y-1/2 text-[var(--d2b-text-secondary)] pointer-events-none" />
                    </div>
                  </FloatingField>
                </div>
                <FloatingField label="Observações">
                  <textarea rows={3} placeholder="Observações" className={INPUT + ' resize-none'} />
                </FloatingField>
              </div>
            </div>
          </div>

          {/* Footer */}
          <div className="flex items-center justify-between px-6 py-4 border-t border-[var(--d2b-border)]">
            <div className="flex gap-2">
              <button className="px-4 py-2 rounded-md text-sm font-medium text-[#EF4444] border border-[rgba(239,68,68,0.25)] hover:bg-[rgba(239,68,68,0.1)] transition-colors">Desmarcar</button>
              <button className="px-4 py-2 rounded-md text-sm font-medium text-[#7C4DFF] border border-[var(--d2b-border-strong)] hover:bg-[var(--d2b-hover)] transition-colors">Iniciar Atendimento</button>
            </div>
            <div className="flex gap-2">
              <button onClick={onClose} className={BTN_GHOST}>Fechar</button>
              <button className={BTN_PRIMARY}>Salvar</button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
      <SistemaMensagensModal
        open={mensagensOpen}
        onClose={() => setMensagensOpen(false)}
        empresaId={empresaId}
        telefone={clienteTelefone}
        clienteId={clienteId}
        nome={clienteNome}
      />
    </>
  )
}

// --- Detalhe: aba Dados -------------------------------------------------------
function TabDados({ paciente }: { paciente: PacienteApi }) {
  const { toast } = useToast()
  const [saving, setSaving] = useState(false)
  const [changed, setChanged] = useState(false)
  const [menorIdade, setMenorIdade] = useState(false)

  const [nome, setNome] = useState(paciente.nome ?? '')
  const [telefone, setTelefone] = useState((paciente.telefone ?? '').replace('+55 ', ''))
  const [dataNascimento, setDataNascimento] = useState(paciente.dataNascimento ?? '')
  const [genero, setGenero] = useState(paciente.genero ?? '')
  const [plano, setPlano] = useState(paciente.plano ?? '')
  const [numeroCarteirinha, setNumeroCarteirinha] = useState(paciente.numeroCarteirinha ?? '')
  const [grupo, setGrupo] = useState(paciente.grupo ?? '')
  const [rg, setRg] = useState(paciente.rg ?? '')
  const [cpf, setCpf] = useState(paciente.cpf ?? '')
  const [email, setEmail] = useState(paciente.email ?? '')
  const [cep, setCep] = useState(paciente.cep ?? '')
  const [logradouro, setLogradouro] = useState(paciente.logradouro ?? '')
  const [numero, setNumero] = useState(paciente.numero ?? '')
  const [complemento, setComplemento] = useState(paciente.complemento ?? '')
  const [bairro, setBairro] = useState(paciente.bairro ?? '')
  const [cidade, setCidade] = useState(paciente.cidade ?? '')
  const [comoConheceu, setComoConheceu] = useState(paciente.comoConheceu ?? '')
  const [outrasInformacoes, setOutrasInformacoes] = useState(paciente.outrasInformacoes ?? '')
  const [nomeResponsavel, setNomeResponsavel] = useState(paciente.nomeResponsavel ?? '')
  const [dataNascimentoResp, setDataNascimentoResp] = useState(paciente.dataNascimentoResp ?? '')
  const [cpfResponsavel, setCpfResponsavel] = useState(paciente.cpfResponsavel ?? '')
  const [telefoneResponsavel, setTelefoneResponsavel] = useState((paciente.telefoneResponsavel ?? '').replace('+55 ', ''))

  function mark<T>(setter: (v: T) => void): (v: T) => void {
    return (v) => { setter(v); setChanged(true) }
  }

  async function handleSave() {
    setSaving(true)
    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/v1/pacientes/${paciente.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          nome,
          telefone: telefone ? `+55 ${telefone}` : null,
          dataNascimento: dataNascimento || null,
          genero: genero || null,
          plano: plano || null,
          numeroCarteirinha: numeroCarteirinha || null,
          grupo: grupo || null,
          rg: rg || null,
          cpf: cpf || null,
          email: email || null,
          cep: cep || null,
          logradouro: logradouro || null,
          numero: numero || null,
          complemento: complemento || null,
          bairro: bairro || null,
          cidade: cidade || null,
          comoConheceu: comoConheceu || null,
          outrasInformacoes: outrasInformacoes || null,
          nomeResponsavel: nomeResponsavel || null,
          dataNascimentoResp: dataNascimentoResp || null,
          cpfResponsavel: cpfResponsavel || null,
          telefoneResponsavel: telefoneResponsavel ? `+55 ${telefoneResponsavel}` : null,
        }),
      })
      if (!res.ok) throw new Error('Erro ao salvar')
      setChanged(false)
      toast({ title: 'Paciente atualizado com sucesso!' })
    } catch {
      toast({ title: 'Erro ao salvar alterações', variant: 'destructive' })
    } finally {
      setSaving(false)
    }
  }

  return (
    <div className="flex-1 overflow-y-auto">
      <div className="p-6 space-y-5 max-w-5xl">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-base font-bold text-[var(--d2b-text-primary)]">Editar Paciente</h3>
            <p className="text-xs text-[var(--d2b-text-secondary)] mt-0.5">Edite as informações associadas a este paciente.</p>
          </div>
          <button className="text-xs text-[var(--d2b-text-secondary)] border border-[var(--d2b-border)] px-3 py-1.5 rounded-md hover:border-[#7C4DFF] hover:text-[var(--d2b-text-primary)] transition-colors">
            Voltar
          </button>
        </div>

        {/* Aviso de alteracoes */}
        {changed && (
          <p className="text-xs text-[#EF4444]">
            Você realizou alterações que ainda não foram salvas. Clique em &apos;Salvar alterações&apos; para armazená-las.
          </p>
        )}

        {/* Campos */}
        <div className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <FloatingField label="Nome" required>
              <input className={INPUT} value={nome} onChange={(e) => { setNome(e.target.value); setChanged(true) }} />
            </FloatingField>
            <FloatingField label="Nome Social">
              <input className={INPUT} />
            </FloatingField>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <PhoneField label="Número de Telefone" required value={telefone} onChange={mark(setTelefone)} />
            <DateField label="Data de nascimento" value={dataNascimento} onChange={mark(setDataNascimento)} />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <FieldSelect label="Gênero" placeholder="Selecione um gênero" options={['Masculino', 'Feminino', 'Outro', 'Prefiro não informar']} value={genero} onChange={mark(setGenero)} />
            <FieldSelect label="Convênio" placeholder="Selecione um plano" value={plano} options={['PARTICULAR', 'Unimed', 'Bradesco Saúde', 'Amil']} onChange={mark(setPlano)} />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <FloatingField label="Número da Carteirinha"><input className={INPUT} value={numeroCarteirinha} onChange={(e) => { setNumeroCarteirinha(e.target.value); setChanged(true) }} /></FloatingField>
            <FieldSelect label="Grupo" placeholder="Selecione um grupo" options={['Grupo A', 'Grupo B', 'Grupo C']} value={grupo} onChange={mark(setGrupo)} />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <FloatingField label="RG"><input className={INPUT} value={rg} onChange={(e) => { setRg(e.target.value); setChanged(true) }} /></FloatingField>
            <FloatingField label="CPF"><input className={INPUT} value={cpf} placeholder="000.000.000-00" inputMode="numeric" onChange={(e) => { setCpf(maskCpf(e.target.value)); setChanged(true) }} /></FloatingField>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <FloatingField label="Email"><input type="email" className={INPUT} value={email} onChange={(e) => { setEmail(e.target.value); setChanged(true) }} /></FloatingField>
            <FloatingField label="CEP"><input className={INPUT} value={cep} placeholder="00000-000" inputMode="numeric" onChange={(e) => { setCep(maskCep(e.target.value)); setChanged(true) }} /></FloatingField>
          </div>

          <div className="grid grid-cols-[1fr_5.5rem_8rem] gap-4">
            <FloatingField label="Logradouro"><input className={INPUT} value={logradouro} onChange={(e) => { setLogradouro(e.target.value); setChanged(true) }} /></FloatingField>
            <FloatingField label="Número"><input className={INPUT} value={numero} onChange={(e) => { setNumero(e.target.value); setChanged(true) }} /></FloatingField>
            <FloatingField label="Complemento"><input className={INPUT} value={complemento} onChange={(e) => { setComplemento(e.target.value); setChanged(true) }} /></FloatingField>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <FloatingField label="Bairro"><input className={INPUT} value={bairro} onChange={(e) => { setBairro(e.target.value); setChanged(true) }} /></FloatingField>
            <FloatingField label="Cidade"><input className={INPUT} value={cidade} onChange={(e) => { setCidade(e.target.value); setChanged(true) }} /></FloatingField>
          </div>

          <FieldSelect label="Como conheceu?" placeholder="Selecione" options={['Instagram', 'Indicação', 'Google', 'Facebook', 'Outros']} value={comoConheceu} onChange={mark(setComoConheceu)} />

          <FloatingField label="Outras Informações">
            <textarea rows={3} className={INPUT + ' resize-y'} value={outrasInformacoes} onChange={(e) => { setOutrasInformacoes(e.target.value); setChanged(true) }} />
          </FloatingField>
        </div>

        {/* Toggle menor de idade */}
        <div>
          <label className="flex items-center gap-2 text-sm text-[var(--d2b-text-secondary)] cursor-pointer select-none w-fit">
            <button type="button" role="switch" aria-checked={menorIdade}
              onClick={() => setMenorIdade((v) => !v)}
              className={`relative w-9 h-5 rounded-full transition-colors ${menorIdade ? 'bg-[#7C4DFF]' : 'bg-[var(--d2b-bg-elevated)]'}`}>
              <span className={`absolute top-0.5 w-4 h-4 rounded-full bg-white transition-transform ${menorIdade ? 'translate-x-4' : 'translate-x-0.5'}`} />
            </button>
            Visualizar dados de menor de idade
          </label>

          {menorIdade && (
            <div className="mt-4 space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <FloatingField label="Nome do responsável"><input className={INPUT} value={nomeResponsavel} onChange={(e) => { setNomeResponsavel(e.target.value); setChanged(true) }} /></FloatingField>
                <DateField label="Data de nascimento" value={dataNascimentoResp} onChange={mark(setDataNascimentoResp)} />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <FloatingField label="CPF do responsável"><input className={INPUT} value={cpfResponsavel} placeholder="000.000.000-00" inputMode="numeric" onChange={(e) => { setCpfResponsavel(maskCpf(e.target.value)); setChanged(true) }} /></FloatingField>
                <PhoneField label="Telefone do responsável" value={telefoneResponsavel} onChange={mark(setTelefoneResponsavel)} />
              </div>
            </div>
          )}
        </div>

        {/* Footer actions */}
        <div className="flex items-center justify-end gap-3 pt-2 border-t border-[var(--d2b-border)]">
          <button type="button" onClick={() => setChanged(false)} className={BTN_GHOST} disabled={saving}>Cancelar</button>
          <button type="button" onClick={handleSave} className={BTN_PRIMARY} disabled={saving}>
            {saving ? 'Salvando...' : 'Salvar Alterações'}
          </button>
        </div>
      </div>
    </div>
  )
}



// --- Detalhe: aba placeholder -------------------------------------------------
function TabEmConstrucao({ label }: { label: string }) {
  return (
    <div className="flex-1 flex items-center justify-center">
      <div className="text-center space-y-2">
        <p className="text-sm font-semibold text-[var(--d2b-text-secondary)]">{label}</p>
        <p className="text-xs text-[var(--d2b-text-muted)]">Em desenvolvimento</p>
      </div>
    </div>
  )
}

// --- Notas Compartilhadas (painel lateral direito) --------------------------
type NotaApi = {
  id: string
  pacienteId: string
  autorId: string
  autorNome: string
  titulo: string
  texto: string
  cor: string
  criadoEm: string
}

const PALETA_CORES = [
  { hex: '#FEF9C3', label: 'Amarelo'  },
  { hex: '#DCFCE7', label: 'Verde'    },
  { hex: '#FEE2E2', label: 'Vermelho' },
  { hex: '#DBEAFE', label: 'Azul'     },
  { hex: '#F3E8FF', label: 'Roxo'     },
  { hex: '#FFE4E6', label: 'Rosa'     },
  { hex: '#FED7AA', label: 'Laranja'  },
  { hex: '#F1F5F9', label: 'Cinza'    },
]

function NotasCompartilhadasPanel({ onClose, pacienteId, usuarioId, usuarioNome }: {
  onClose: () => void
  pacienteId: string
  usuarioId: string
  usuarioNome: string
}) {
  const [notas, setNotas] = useState<NotaApi[]>([])
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [deletingId, setDeletingId] = useState<string | null>(null)
  const [titulo, setTitulo] = useState('')
  const [texto, setTexto] = useState('')
  const [cor, setCor] = useState(PALETA_CORES[0].hex)

  useEffect(() => {
    async function load() {
      setLoading(true)
      try {
        const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/v1/notas-compartilhadas/paciente/${pacienteId}`)
        if (res.ok) setNotas(await res.json())
      } catch { /* offline */ } finally { setLoading(false) }
    }
    load()
  }, [pacienteId])

  async function salvar() {
    if (!texto.trim()) return
    setSaving(true)
    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/v1/notas-compartilhadas`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ pacienteId, autorId: usuarioId, autorNome: usuarioNome, titulo, texto, cor }),
      })
      if (res.ok) {
        const nova: NotaApi = await res.json()
        setNotas((prev) => [nova, ...prev])
        setTitulo('')
        setTexto('')
        setCor(PALETA_CORES[0].hex)
      }
    } catch { /* offline */ } finally { setSaving(false) }
  }

  async function excluir(id: string) {
    setDeletingId(id)
    try {
      const res = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/api/v1/notas-compartilhadas/${id}?autorId=${usuarioId}`,
        { method: 'DELETE' }
      )
      if (res.ok) setNotas((prev) => prev.filter((n) => n.id !== id))
    } catch { /* offline */ } finally { setDeletingId(null) }
  }

  function formatDate(iso: string) {
    try {
      return new Date(iso).toLocaleDateString('pt-BR', { day: '2-digit', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' })
    } catch { return iso }
  }

  return (
    <div className="w-[340px] flex-shrink-0 flex flex-col border-l border-[var(--d2b-border)] bg-[var(--d2b-bg-surface)] h-full">
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-3 border-b border-[var(--d2b-border)] flex-shrink-0">
        <div className="flex items-center gap-2">
          <span className="text-sm font-semibold text-[var(--d2b-text-primary)]">Notas Compartilhadas</span>
          <button
            onClick={async () => {
              setLoading(true)
              try {
                const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/v1/notas-compartilhadas/paciente/${pacienteId}`)
                if (res.ok) setNotas(await res.json())
              } catch { /* offline */ } finally { setLoading(false) }
            }}
            className="text-[var(--d2b-text-muted)] hover:text-[var(--d2b-text-secondary)] transition-colors"
            title="Atualizar"
          >
            <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M23 4v6h-6"/><path d="M20.49 15a9 9 0 1 1-2.12-9.36L23 10"/>
            </svg>
          </button>
        </div>
        <button onClick={onClose} className="w-6 h-6 flex items-center justify-center rounded text-[var(--d2b-text-muted)] hover:text-[var(--d2b-text-primary)] hover:bg-[var(--d2b-hover)] transition-colors">
          <X size={14} />
        </button>
      </div>

      {/* Notas list */}
      <div className="flex-1 overflow-y-auto px-4 py-4">
        {loading ? (
          <p className="text-xs text-[var(--d2b-text-muted)] text-center mt-8">Carregando...</p>
        ) : notas.length === 0 ? (
          <p className="text-xs text-[var(--d2b-text-muted)] text-center mt-8">
            Não existem notas compartilhadas para este paciente...
          </p>
        ) : (
          <div className="space-y-3">
            {notas.map((n) => (
              <div
                key={n.id}
                className="rounded-lg px-3 py-2.5 shadow-sm"
                style={{ background: n.cor, border: `1.5px solid ${n.cor}` }}
              >
                <div className="flex items-start justify-between gap-2">
                  <div className="flex-1 min-w-0">
                    {n.titulo && (
                      <p className="text-sm font-semibold text-[#111827] truncate mb-0.5">{n.titulo}</p>
                    )}
                    <p className="text-sm text-[#374151] whitespace-pre-wrap break-words">{n.texto}</p>
                  </div>
                  {n.autorId === usuarioId && (
                    <button
                      onClick={() => excluir(n.id)}
                      disabled={deletingId === n.id}
                      className="flex-shrink-0 p-1 rounded hover:bg-black/10 transition-colors disabled:opacity-40"
                      title="Excluir nota"
                    >
                      {deletingId === n.id
                        ? <Loader2 size={12} className="animate-spin text-[#374151]" />
                        : <Trash2 size={12} className="text-[#374151]" />}
                    </button>
                  )}
                </div>
                <p className="text-[10px] text-[#6B7280] mt-1.5">{n.autorNome} · {formatDate(n.criadoEm)}</p>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Editor */}
      <div className="border-t border-[var(--d2b-border)] flex-shrink-0">
        {/* Título */}
        <div className="px-3 pt-3">
          <input
            type="text"
            value={titulo}
            onChange={(e) => setTitulo(e.target.value)}
            placeholder="Título da nota (opcional)"
            className="w-full bg-transparent text-sm font-semibold text-[var(--d2b-text-primary)] placeholder:text-[var(--d2b-text-muted)] outline-none border-b border-[var(--d2b-border)] pb-1.5 mb-2"
          />
        </div>

        {/* Textarea */}
        <textarea
          value={texto}
          onChange={(e) => setTexto(e.target.value)}
          placeholder="Escreva uma nota..."
          rows={3}
          className="w-full bg-transparent px-3 py-2 text-sm text-[var(--d2b-text-primary)] placeholder:text-[var(--d2b-text-muted)] outline-none resize-none"
        />

        {/* Paleta + enviar */}
        <div className="flex items-center justify-between px-3 pb-3">
          {/* Paleta de cores */}
          <div className="flex items-center gap-1.5">
            {PALETA_CORES.map((c) => (
              <button
                key={c.hex}
                onClick={() => setCor(c.hex)}
                title={c.label}
                className="w-5 h-5 rounded-full border-2 transition-transform hover:scale-110"
                style={{
                  background: c.hex,
                  borderColor: cor === c.hex ? '#7C4DFF' : 'transparent',
                  boxShadow: cor === c.hex ? '0 0 0 1px #7C4DFF' : 'none',
                }}
              />
            ))}
          </div>

          {/* Salvar */}
          <button
            onClick={salvar}
            disabled={!texto.trim() || saving}
            className="px-4 py-1.5 rounded-md text-sm font-bold text-white bg-[#7C4DFF] hover:bg-[#5B21B6] disabled:opacity-40 disabled:pointer-events-none transition-colors flex items-center gap-1.5"
          >
            {saving && <Loader2 size={12} className="animate-spin" />}
            Enviar
          </button>
        </div>
      </div>
    </div>
  )
}

// --- Detalhe do Cliente -------------------------------------------------------
type Tab = 'dados' | 'timeline' | 'anamnese' | 'evolucoes' | 'financeiro' | 'documentos'

const TABS: { id: Tab; label: string; icon: ReactNode; badge?: ReactNode }[] = [
  { id: 'dados',       label: 'Dados',         icon: <User size={18} /> },
  { id: 'timeline',    label: 'Linha do Tempo', icon: <LayoutGrid size={18} />, badge: <span className="text-[9px] font-bold bg-[#10B981] text-white px-1.5 py-0.5 rounded">Novo</span> },
  { id: 'anamnese',    label: 'Anamnese',       icon: <ClipboardList size={18} /> },
  { id: 'evolucoes',   label: 'Evoluções',   icon: <Activity size={18} /> },
  { id: 'financeiro',  label: 'Financeiro',     icon: <DollarSign size={18} /> },
  { id: 'documentos',  label: 'Documentos',     icon: <FileText size={18} /> },
]

function ClienteDetalheView({ cliente, onBack, empresaId, initialTab, usuarioId, usuarioNome }: { cliente: PacienteApi; onBack: () => void; empresaId: string | null; initialTab?: Tab; usuarioId?: string; usuarioNome?: string }) {
  const [tab, setTab] = useState<Tab>(initialTab ?? 'dados')
  const [notasOpen, setNotasOpen] = useState(false)
  const [compartilharOpen, setCompartilharOpen] = useState(false)

  // Resumir Paciente
  const [resumirOpen, setResumirOpen] = useState(false)
  const [termosOpen, setTermosOpen] = useState(false)
  const [termosAceitos, setTermosAceitos] = useState(false)
  const [resumoGerado, setResumoGerado] = useState<string | null>(null)
  const [gerandoResumo, setGerandoResumo] = useState(false)
  const [resumoFontes, setResumoFontes] = useState<{ consultas: number; ultimoAtendimento: string | null } | null>(null)
  const [pendingResumoAi, setPendingResumoAi] = useState<string | undefined>(undefined)

  function abrirResumir() {
    if (!termosAceitos) { setTermosOpen(true); return }
    setResumoGerado(null)
    setResumoFontes(null)
    setResumirOpen(true)
  }

  function aceitarTermos() {
    setTermosAceitos(true)
    setTermosOpen(false)
    setResumoGerado(null)
    setResumoFontes(null)
    setResumirOpen(true)
  }

  async function gerarResumo() {
    setGerandoResumo(true)
    try {
      // 1. Buscar evoluções do paciente
      const evolRes = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/v1/evolucoes/paciente/${cliente.id}`)
      if (!evolRes.ok) {
        setResumoGerado('Não foi possível carregar as evoluções do paciente.')
        setGerandoResumo(false)
        return
      }

      const evolucoes = await evolRes.json()
      
      if (!evolucoes || evolucoes.length === 0) {
        setResumoGerado('Este paciente ainda não possui evoluções registradas.')
        setGerandoResumo(false)
        return
      }

      // 2. Montar contexto com todas as evoluções
      const contextoCompleto = evolucoes.map((ev: any, idx: number) => {
        const partes = []
        if (ev.comentariosGerais) partes.push(`Comentários: ${ev.comentariosGerais}`)
        if (ev.conduta) partes.push(`Conduta: ${ev.conduta}`)
        if (ev.examesRealizados) partes.push(`Exames: ${ev.examesRealizados}`)
        if (ev.prescricao) partes.push(`Prescrição: ${ev.prescricao}`)
        return `Evolução ${idx + 1} (${ev.data}):\n${partes.join('\n')}`
      }).join('\n\n')

      // 3. Chamar endpoint de IA
      const iaRes = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/v1/evolucoes/ia/gerar-resumo`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          comentariosGerais: contextoCompleto,
          conduta: '',
          examesRealizados: '',
          prescricao: '',
          empresaId: empresaId || '',
          usuarioId: '',
        }),
      })

      if (iaRes.ok) {
        const data = await iaRes.json()
        setResumoGerado(data.resumo ?? 'Resumo gerado com sucesso.')
        setResumoFontes({ 
          consultas: evolucoes.length, 
          ultimoAtendimento: evolucoes[0]?.data ?? null 
        })
      } else {
        setResumoGerado('Não foi possível gerar o resumo com IA. Tente novamente.')
      }
    } catch (error) {
      console.error('Erro ao gerar resumo:', error)
      setResumoGerado('Erro ao conectar com o servidor.')
    } finally {
      setGerandoResumo(false)
    }
  }

  async function salvarResumo() {
    if (!resumoGerado) return
    try {
      await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/v1/pacientes/${cliente.id}/resumo/salvar`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ resumo: resumoGerado }),
      })
      setResumirOpen(false)
      setPendingResumoAi(resumoGerado)
      setTab('evolucoes')
    } catch {}
  }

  return (
    <div className="flex flex-col h-full">
      {/* Sub-topbar */}
      <div className="flex items-center justify-between px-5 py-3 border-b border-[var(--d2b-border)] bg-[var(--d2b-bg-surface)] flex-shrink-0">
        <div className="flex items-center gap-3">
          <button onClick={onBack} className="flex items-center gap-1.5 text-xs text-[var(--d2b-text-secondary)] hover:text-[var(--d2b-text-primary)] transition-colors">
            <ArrowLeft size={14} /> Pacientes
          </button>
          <span className="text-[#2D1B4E]">|</span>
          <div className="flex items-center gap-1.5 text-sm font-medium text-[var(--d2b-text-primary)]">
            <User size={13} className="text-[#7C4DFF]" />
            Detalhes do Paciente
            <span className="text-[var(--d2b-text-secondary)]">-</span>
            <span className="text-[#C084FC]">{cliente.nome}</span>
          </div>
          <button onClick={abrirResumir} className="flex items-center gap-1.5 text-xs font-bold text-[#7C4DFF] border border-[var(--d2b-border-strong)] px-3 py-1 rounded-md hover:bg-[var(--d2b-hover)] transition-colors">
            ✦ Resumir Paciente
          </button>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={() => { setNotasOpen((v) => !v); if (!notasOpen) setCompartilharOpen(false) }}
            className={`px-3 py-1.5 rounded-md text-xs font-bold transition-colors ${
              notasOpen
                ? 'text-[#7C4DFF] bg-[var(--d2b-hover)] border border-[var(--d2b-border-strong)]'
                : 'text-white bg-[#7C4DFF] hover:bg-[#5B21B6]'
            }`}
          >
            Notas Compartilhadas
          </button>
          <button
            onClick={() => { setCompartilharOpen((v) => !v); if (!compartilharOpen) setNotasOpen(false) }}
            className={`px-3 py-1.5 rounded-md text-xs font-medium transition-colors border ${
              compartilharOpen
                ? 'text-[#7C4DFF] bg-[var(--d2b-hover)] border-[var(--d2b-border-strong)]'
                : 'text-[var(--d2b-text-secondary)] border-[var(--d2b-border-strong)] hover:border-[#7C4DFF] hover:text-[var(--d2b-text-primary)]'
            }`}
          >
            Compartilhar Acesso
          </button>
        </div>
      </div>

      {/* Body: mini-sidebar + content */}
      <div className="flex flex-1 overflow-hidden">

        {/* Mini sidebar */}
        <div className="w-[88px] flex-shrink-0 border-r border-[var(--d2b-border)] bg-[var(--d2b-bg-main)] flex flex-col items-center pt-5 gap-1">
          {TABS.map((t) => {
            const active = tab === t.id
            return (
              <button
                key={t.id}
                onClick={() => setTab(t.id)}
                className={`w-full flex flex-col items-center gap-1 py-3 px-1 transition-colors text-center ${active ? 'text-[#7C4DFF] bg-[var(--d2b-hover)]' : 'text-[var(--d2b-text-muted)] hover:text-[var(--d2b-text-secondary)] hover:bg-[var(--d2b-hover)]'}`}
              >
                {t.icon}
                <span className="text-[10px] font-medium leading-tight">{t.label}</span>
                {t.badge && <div>{t.badge}</div>}
              </button>
            )
          })}
        </div>

        {/* Tab content */}
        <div className="flex-1 overflow-hidden flex">
          <div className="flex-1 overflow-hidden flex">
            {tab === 'dados'      && <TabDados paciente={cliente} />}
            {tab === 'timeline'   && <TabLinhaDoTempo pacienteId={cliente.id} empresaId={empresaId ?? ''} onIrParaAnamnese={() => setTab('anamnese')} />}
            {tab === 'anamnese'   && <TabAnamnese pacienteId={cliente.id} empresaId={empresaId ?? ''} />}
            {tab === 'evolucoes'  && <TabEvolucoes pacienteId={cliente.id} autoOpenResumoAi={pendingResumoAi} />}
            {tab === 'financeiro' && <TabFinanceiro pacienteId={cliente.id} pacienteNome={cliente.nome} empresaId={empresaId ?? ''} onVoltar={() => setTab('dados')} />}
            {tab === 'documentos' && <TabDocumentos pacienteId={cliente.id} pacienteNome={cliente.nome} empresaId={empresaId ?? ''} onVoltar={() => setTab('dados')} />}
          </div>
          {notasOpen && <NotasCompartilhadasPanel onClose={() => setNotasOpen(false)} pacienteId={cliente.id} usuarioId={usuarioId ?? ''} usuarioNome={usuarioNome ?? ''} />}
          {compartilharOpen && <CompartilharAcessoPanel onClose={() => setCompartilharOpen(false)} />}
        </div>
      </div>

      {/* ── Modal: Termos de Uso IA ── */}
      <Dialog open={termosOpen} onOpenChange={setTermosOpen}>
        <DialogContent className="max-w-md bg-white border border-gray-200 text-gray-900">
          <DialogHeader>
            <DialogTitle className="text-base font-bold text-gray-900">Aceite do Termos</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 pt-1">
            <p className="text-sm text-gray-600 leading-relaxed border border-gray-200 rounded-lg p-3 bg-gray-50">
              Ao utilizar essa ferramenta de inteligência artificial, você se declara ciente de que atua na posição de controlador de dados pessoais, podendo utilizar as informações de seu paciente somente mediante base legal legítima, tal como para a tutela de sua saúde. A Agenddn não utilizará as informações de seus pacientes para quaisquer finalidades não autorizadas por você.
            </p>
            <div className="flex gap-2 text-xs">
              <a href="#" className="text-[#7C4DFF] hover:underline">Política de Privacidade</a>
              <span className="text-gray-300">•</span>
              <a href="#" className="text-[#7C4DFF] hover:underline">Termos de Uso</a>
              <span className="text-gray-300">•</span>
              <a href="#" className="text-[#7C4DFF] hover:underline">Termo de Responsabilidade</a>
            </div>
            <div className="flex items-center justify-end gap-3 pt-1">
              <button onClick={() => setTermosOpen(false)}
                className="px-5 py-2 rounded-lg border border-gray-200 text-sm text-gray-600 font-medium hover:border-gray-300 transition-colors">
                Negar
              </button>
              <button onClick={aceitarTermos}
                className="px-6 py-2 rounded-lg bg-[#7C4DFF] hover:bg-[#5B21B6] text-white text-sm font-bold transition-colors">
                Aceitar
              </button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* ── Modal: Sumarização do Prontuário ── */}
      <Dialog open={resumirOpen} onOpenChange={setResumirOpen}>
        <DialogContent showCloseButton={false} className="max-w-[63rem] sm:max-w-[63rem] h-[90vh] bg-white border border-gray-200 text-gray-900 flex flex-col p-0 gap-0 overflow-hidden">
          {/* Header */}
          <div className="flex items-start justify-between px-6 pt-5 pb-4 border-b border-gray-100 flex-shrink-0">
            <div>
              <h2 className="text-base font-bold text-gray-900 flex items-center gap-1.5">
                Sumarização do prontuário
                <span className="w-4 h-4 rounded-full border border-gray-300 text-gray-400 text-[10px] flex items-center justify-center cursor-help" title="Resumo clínico gerado por IA">?</span>
              </h2>
              <p className="text-xs text-gray-400 mt-0.5">Paciente: <span className="text-gray-600 font-medium">{cliente.nome}</span></p>
            </div>
            <button onClick={() => setResumirOpen(false)} className="text-gray-400 hover:text-gray-600 transition-colors mt-0.5">
              <X size={18} />
            </button>
          </div>

          {/* Body */}
          <div className="flex flex-1 overflow-hidden">
            {/* Editor/output area */}
            <div className="flex-1 overflow-y-auto p-5">
              {!resumoGerado && !gerandoResumo && (
                <div className="flex flex-col items-center justify-center h-full gap-4 text-center">
                  <div className="w-12 h-12 rounded-full bg-[#F3EEFF] flex items-center justify-center">
                    <span className="text-2xl">✦</span>
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-gray-800">Pronto para gerar o resumo do paciente?</p>
                    <p className="text-xs text-gray-400 mt-1 max-w-xs">Clique no botão abaixo para que a IA analise o prontuário completo e gere um resumo clínico conciso.</p>
                  </div>
                  <button onClick={gerarResumo}
                    className="flex items-center gap-2 px-5 py-2.5 rounded-lg bg-[#7C4DFF] hover:bg-[#5B21B6] text-white text-sm font-bold transition-colors">
                    ✦ Gerar sumarização
                  </button>
                </div>
              )}

              {gerandoResumo && (
                <div className="flex flex-col items-center justify-center h-full gap-3 text-center">
                  <div className="w-8 h-8 border-2 border-[#7C4DFF] border-t-transparent rounded-full animate-spin" />
                  <p className="text-sm text-gray-500">Analisando prontuário…</p>
                </div>
              )}

              {resumoGerado && !gerandoResumo && (
                <div className="space-y-4">
                  {/* Action bar */}
                  <div className="flex items-center gap-4">
                    <button onClick={gerarResumo}
                      className="flex items-center gap-1.5 px-4 py-2 rounded-lg bg-[#7C4DFF] hover:bg-[#5B21B6] text-white text-xs font-bold transition-colors">
                      ✦ Gerar sumarização
                    </button>
                    {resumoGerado && (
                      <span className="ml-auto text-xs text-gray-400">
                        {resumoGerado.split(/\s+/).length} palavras · ~{Math.max(1, Math.round(resumoGerado.split(/\s+/).length / 200))} min leitura
                      </span>
                    )}
                  </div>
                  {/* Resumo content */}
                  <div className="text-sm text-gray-700 leading-relaxed whitespace-pre-wrap">{resumoGerado}</div>
                </div>
              )}
            </div>

            {/* Right sidebar: insights */}
            <div className="w-52 flex-shrink-0 border-l border-gray-100 p-4 flex flex-col gap-3 overflow-y-auto">
              <div className="rounded-lg border border-blue-100 bg-blue-50 p-3">
                <p className="text-xs font-bold text-blue-700 flex items-center gap-1">ⓘ Insights Clínicos</p>
                <p className="text-[11px] text-blue-600 mt-1 leading-tight">Gere insights clínicos relevantes com base no histórico do paciente.</p>
              </div>

              {resumoFontes && (
                <div className="rounded-lg border border-gray-200 bg-gray-50 p-3 space-y-2">
                  <p className="text-[10px] font-bold text-gray-500 uppercase tracking-wide">Fontes</p>
                  <span className="inline-flex items-center gap-1 px-2 py-1 bg-[#EDE9FE] text-[#5B21B6] text-[11px] font-semibold rounded-md">
                    🗓 {resumoFontes.consultas} Consultas
                  </span>
                  {resumoFontes.ultimoAtendimento && (
                    <div>
                      <p className="text-[9px] font-bold text-gray-400 uppercase tracking-wider mt-2 mb-1">Datas Relevantes</p>
                      <span className="inline-flex items-center px-2 py-1 bg-orange-100 text-orange-700 text-[11px] font-semibold rounded-md">
                        Último atendimento: {resumoFontes.ultimoAtendimento}
                      </span>
                    </div>
                  )}
                </div>
              )}

              <div className="rounded-lg border border-yellow-200 bg-yellow-50 p-3">
                <p className="text-[11px] text-yellow-800 leading-tight flex gap-1">
                  <span>⚠</span>
                  <span>ATENÇÃO: Os dados processados neste resumo são referentes aos cadastrados somente por você, então desconsideram dados cadastrados por outros usuários.</span>
                </p>
              </div>
            </div>
          </div>

          {/* Footer */}
          <div className="flex items-center justify-between px-6 py-3 border-t border-gray-100 flex-shrink-0">
            <p className="text-[11px] text-gray-400 flex items-center gap-1">♡ Os resultados gerados por IA podem conter erros. Valide e edite as informações antes de salvar</p>
            <div className="flex items-center gap-2">
              {resumoGerado && (
                <button
                  onClick={() => navigator.clipboard.writeText(resumoGerado)}
                  className="flex items-center gap-1.5 px-4 py-2 rounded-lg border border-gray-200 text-gray-600 hover:text-gray-800 hover:border-gray-300 text-sm font-medium transition-colors"
                >
                  ⎘ Copiar
                </button>
              )}
              <button onClick={() => setResumirOpen(false)}
                className="px-4 py-2 text-sm text-[#7C4DFF] font-medium hover:underline transition-colors">
                Fechar
              </button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  )
}

// --- Compartilhar Acesso (painel lateral direito) ----------------------------
type ProfAcesso = { id: number; label: string; descricao: string }

const PROFS_ACESSO_PADRAO: ProfAcesso[] = [
  {
    id: 1,
    label: 'Todos',
    descricao: '"Profissionais Administradores", "Gestores", "Assistentes" e "Profissionais Simples com chave de acesso total ativa".',
  },
]

function AdicionarProfissionalModal({ open, onClose }: { open: boolean; onClose: () => void }) {
  const [selecionado, setSelecionado] = useState('')
  const opcoes = [
    'Dr. Carlos Oliveira',
    'Dra. Ana Lima',
    'Dr. Felipe Souza',
    'Dra. Mariana Torres',
  ]

  function conceder() {
    onClose()
    setSelecionado('')
  }

  if (!open) return null

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm">
      <div className="w-[420px] bg-[var(--d2b-bg-elevated)] border border-[var(--d2b-border-strong)] rounded-2xl shadow-2xl flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-[var(--d2b-border)]">
          <span className="text-base font-semibold text-[var(--d2b-text-primary)]">Adicionar Profissional</span>
          <button
            onClick={onClose}
            className="w-7 h-7 flex items-center justify-center rounded-lg text-[var(--d2b-text-muted)] hover:text-[var(--d2b-text-primary)] hover:bg-[var(--d2b-hover)] transition-colors"
          >
            <X size={15} />
          </button>
        </div>

        {/* Body */}
        <div className="px-5 py-5 space-y-4">
          <p className="text-sm text-[var(--d2b-text-secondary)]">
            Selecione o(s) profissional(is) para conceder acesso ao paciente:
          </p>

          {/* Dropdown */}
          <div className="relative">
            <select
              value={selecionado}
              onChange={(e) => setSelecionado(e.target.value)}
              className="w-full appearance-none bg-[var(--d2b-bg-elevated)] border border-[var(--d2b-border-strong)] rounded-xl px-4 py-2.5 text-sm text-[var(--d2b-text-secondary)] focus:outline-none focus:border-[#7C4DFF] cursor-pointer"
            >
              <option value="" disabled>Adicionar pessoas</option>
              {opcoes.map((o) => (
                <option key={o} value={o}>{o}</option>
              ))}
            </select>
            <ChevronDown size={14} className="absolute right-3 top-1/2 -translate-y-1/2 text-[var(--d2b-text-muted)] pointer-events-none" />
          </div>

          {/* Conceder Acesso button */}
          <button
            onClick={conceder}
            className="w-full flex items-center justify-center gap-2 bg-[#7C4DFF] hover:bg-[#5B21B6] text-white text-sm font-semibold py-2.5 rounded-xl transition-colors"
          >
            <Lock size={13} />
            Conceder Acesso
          </button>
        </div>
      </div>
    </div>
  )
}

function CompartilharAcessoPanel({ onClose }: { onClose: () => void }) {
  const [profs, setProfs] = useState<ProfAcesso[]>(PROFS_ACESSO_PADRAO)
  const [adicionarOpen, setAdicionarOpen] = useState(false)

  function remover(id: number) {
    setProfs((prev) => prev.filter((p) => p.id !== id))
  }

  return (
    <>
    <AdicionarProfissionalModal open={adicionarOpen} onClose={() => setAdicionarOpen(false)} />
    <div className="w-[340px] flex-shrink-0 flex flex-col border-l border-[var(--d2b-border)] bg-[var(--d2b-bg-surface)] h-full">
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-3 border-b border-[var(--d2b-border)] flex-shrink-0">
        <div className="flex items-center gap-1.5">
          <span className="text-sm font-semibold text-[var(--d2b-text-primary)]">Compartilhar Paciente</span>
          <button className="text-[var(--d2b-text-muted)] hover:text-[var(--d2b-text-secondary)] transition-colors" title="Ajuda">
            <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <circle cx="12" cy="12" r="10"/>
              <path d="M9.09 9a3 3 0 0 1 5.83 1c0 2-3 3-3 3"/>
              <line x1="12" y1="17" x2="12.01" y2="17"/>
            </svg>
          </button>
        </div>
        <button
          onClick={onClose}
          className="w-6 h-6 flex items-center justify-center rounded text-[var(--d2b-text-muted)] hover:text-[var(--d2b-text-primary)] hover:bg-[var(--d2b-hover)] transition-colors"
        >
          <X size={14} />
        </button>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto px-4 py-4 space-y-4">
        <div className="flex items-center justify-between">
          <p className="text-sm font-semibold text-[var(--d2b-text-primary)]">Profissionais com acesso</p>
          <button
            onClick={() => setAdicionarOpen(true)}
            className="flex items-center gap-1.5 text-xs font-bold text-white bg-[#7C4DFF] hover:bg-[#5B21B6] px-3 py-1.5 rounded-md transition-colors"
          >
            <Plus size={12} /> Adicionar
          </button>
        </div>

        <div className="space-y-2">
          {profs.length === 0 ? (
            <p className="text-xs text-[var(--d2b-text-muted)] text-center py-6">Nenhum profissional com acesso.</p>
          ) : (
            profs.map((p) => (
              <div
                key={p.id}
                className="flex items-start gap-3 bg-[var(--d2b-bg-elevated)] border border-[var(--d2b-border)] rounded-xl px-3 py-3 group"
              >
                {/* Checkmark icon */}
                <div className="w-7 h-7 rounded-full bg-[rgba(16,185,129,0.15)] border border-[rgba(16,185,129,0.3)] flex items-center justify-center flex-shrink-0 mt-0.5">
                  <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="#10B981" strokeWidth="2.5">
                    <polyline points="20 6 9 17 4 12" />
                  </svg>
                </div>
                <div className="flex-1 min-w-0">
                  <span className="text-sm text-[var(--d2b-text-primary)]">
                    {p.label !== 'Todos' && <span className="font-semibold">{p.label} </span>}
                    {p.label === 'Todos' ? (
                      <span>
                        Todos{' '}
                        <span className="text-[var(--d2b-text-secondary)]">{p.descricao}</span>
                      </span>
                    ) : (
                      <span className="text-[var(--d2b-text-secondary)]">{p.descricao}</span>
                    )}
                  </span>
                </div>
                <button
                  onClick={() => remover(p.id)}
                  className="opacity-0 group-hover:opacity-100 w-5 h-5 flex items-center justify-center rounded text-[var(--d2b-text-muted)] hover:text-[#EF4444] transition-all flex-shrink-0 mt-0.5"
                >
                  <X size={12} />
                </button>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
    </>
  )
}

// --- Modal Criar Cliente ------------------------------------------------------
function CriarClienteModal({
  open,
  onClose,
  empresaId,
  onCreated,
}: {
  open: boolean
  onClose: () => void
  empresaId: string | null
  onCreated: (p: PacienteApi) => void
}) {
  const [infosPessoais, setInfosPessoais] = useState(false)
  const [menorIdade, setMenorIdade] = useState(false)
  const { toast } = useToast()
  const [saving, setSaving] = useState(false)

  const [nome, setNome] = useState('')
  const [telefone, setTelefone] = useState('')
  const [dataNascimento, setDataNascimento] = useState('')
  const [genero, setGenero] = useState('')
  const [plano, setPlano] = useState('')
  const [numeroCarteirinha, setNumeroCarteirinha] = useState('')
  const [grupo, setGrupo] = useState('')
  const [comoConheceu, setComoConheceu] = useState('')
  const [rg, setRg] = useState('')
  const [cpf, setCpf] = useState('')
  const [cep, setCep] = useState('')
  const [email, setEmail] = useState('')
  const [logradouro, setLogradouro] = useState('')
  const [numero, setNumero] = useState('')
  const [complemento, setComplemento] = useState('')
  const [bairro, setBairro] = useState('')
  const [cidade, setCidade] = useState('')
  const [outrasInformacoes, setOutrasInformacoes] = useState('')
  const [nomeResponsavel, setNomeResponsavel] = useState('')
  const [dataNascimentoResp, setDataNascimentoResp] = useState('')
  const [cpfResponsavel, setCpfResponsavel] = useState('')
  const [telefoneResponsavel, setTelefoneResponsavel] = useState('')
  const [buscandoCep, setBuscandoCep] = useState(false)

  async function handleCepBlur() {
    const cepLimpo = cep.replace(/\D/g, '')
    if (cepLimpo.length !== 8) return
    setBuscandoCep(true)
    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/v1/cep/${cepLimpo}`)
      if (!res.ok) return
      const data = await res.json()
      if (data.logradouro) setLogradouro(data.logradouro)
      if (data.bairro)     setBairro(data.bairro)
      if (data.localidade) setCidade(data.localidade)
    } catch {
      // silently ignore — user can fill manually
    } finally {
      setBuscandoCep(false)
    }
  }

  function resetForm() {
    setNome(''); setTelefone(''); setDataNascimento(''); setGenero('')
    setPlano(''); setNumeroCarteirinha(''); setGrupo(''); setComoConheceu('')
    setRg(''); setCpf(''); setCep(''); setEmail(''); setLogradouro('')
    setNumero(''); setComplemento(''); setBairro(''); setCidade('')
    setOutrasInformacoes(''); setNomeResponsavel(''); setDataNascimentoResp('')
    setCpfResponsavel(''); setTelefoneResponsavel('')
    setInfosPessoais(false); setMenorIdade(false)
  }

  function handleClose() {
    resetForm()
    onClose()
  }

  async function handleSubmit() {
    if (!nome.trim()) { toast({ title: 'Nome é obrigatório', variant: 'destructive' }); return }
    if (!telefone.trim()) { toast({ title: 'Telefone é obrigatório', variant: 'destructive' }); return }
    if (!empresaId) { toast({ title: 'Empresa não identificada. Contate o suporte.', variant: 'destructive' }); return }
    setSaving(true)
    try {
      const body: Record<string, unknown> = {
        empresaId,
        nome: nome.trim(),
        telefone: `+55${telefone.trim()}`,
        ...(dataNascimento && { dataNascimento }),
        ...(genero && { genero }),
        ...(plano && { plano }),
        ...(numeroCarteirinha && { numeroCarteirinha }),
        ...(grupo && { grupo }),
        ...(comoConheceu && { comoConheceu }),
        ...(rg && { rg }),
        ...(cpf && { cpf }),
        ...(cep && { cep }),
        ...(email && { email }),
        ...(logradouro && { logradouro }),
        ...(numero && { numero }),
        ...(complemento && { complemento }),
        ...(bairro && { bairro }),
        ...(cidade && { cidade }),
        ...(outrasInformacoes && { outrasInformacoes }),
        ...(nomeResponsavel && { nomeResponsavel }),
        ...(dataNascimentoResp && { dataNascimentoResp }),
        ...(cpfResponsavel && { cpfResponsavel }),
        ...(telefoneResponsavel && { telefoneResponsavel: `+55${telefoneResponsavel.trim()}` }),
      }
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/v1/pacientes`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      })
      if (!res.ok) throw new Error('Erro ao cadastrar')
      const criado: PacienteApi = await res.json()
      onCreated(criado)
      resetForm()
      onClose()
      trackClienteCadastrado(empresaId)
      toast({ title: 'Paciente cadastrado com sucesso!' })
    } catch {
      toast({ title: 'Erro ao cadastrar paciente. Verifique os dados e tente novamente.', variant: 'destructive' })
    } finally {
      setSaving(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={(v) => { if (!v) handleClose() }}>
      <DialogContent showCloseButton={false}
        className="bg-[var(--d2b-bg-elevated)] border border-[var(--d2b-border-strong)] text-[var(--d2b-text-primary)] !max-w-3xl p-0 gap-0 overflow-hidden">
        <DialogHeader className="flex-row items-center justify-between px-6 py-4 border-b border-[var(--d2b-border)] space-y-0">
          <DialogTitle className="text-base font-bold text-[var(--d2b-text-primary)]">Criar Cliente</DialogTitle>
          <button onClick={handleClose} className="w-7 h-7 rounded-md flex items-center justify-center text-[var(--d2b-text-secondary)] hover:text-[var(--d2b-text-primary)] hover:bg-[var(--d2b-hover)] transition-colors">
            <X size={15} />
          </button>
        </DialogHeader>
        <div className="overflow-y-auto max-h-[68vh] px-6 py-5 space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <FloatingField label="Nome" required>
              <input className={INPUT} value={nome} onChange={(e) => setNome(e.target.value)} />
            </FloatingField>
            <FloatingField label="Nome Social"><input className={INPUT} /></FloatingField>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <PhoneField label="Número de Telefone" required value={telefone} onChange={setTelefone} />
            <DateField label="Data de nascimento" value={dataNascimento} onChange={setDataNascimento} />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <FieldSelect label="Gênero" placeholder="Selecione um gênero" options={['Masculino', 'Feminino', 'Outro', 'Prefiro não informar']} value={genero} onChange={setGenero} />
            <FieldSelect label="Convênio" placeholder="Selecione um plano" options={['PARTICULAR', 'Unimed', 'Bradesco Saúde', 'Amil']} value={plano} onChange={setPlano} />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <FloatingField label="Número da Carteirinha">
              <input className={INPUT} value={numeroCarteirinha} onChange={(e) => setNumeroCarteirinha(e.target.value)} />
            </FloatingField>
            <FieldSelect label="Grupo" placeholder="Selecione um grupo" options={['Grupo A', 'Grupo B', 'Grupo C']} value={grupo} onChange={setGrupo} />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <FieldSelect label="Como conheceu?" placeholder="Selecione" options={['Instagram', 'Indicação', 'Google', 'Facebook', 'Outros']} value={comoConheceu} onChange={setComoConheceu} />
          </div>
          <Section title="Informações Pessoais" open={infosPessoais} onToggle={() => setInfosPessoais((v) => !v)}>
            <div className="grid grid-cols-2 gap-4">
              <FloatingField label="RG"><input className={INPUT} value={rg} onChange={(e) => setRg(e.target.value)} /></FloatingField>
              <FloatingField label="CPF"><input className={INPUT} value={cpf} placeholder="000.000.000-00" inputMode="numeric" onChange={(e) => setCpf(maskCpf(e.target.value))} /></FloatingField>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <FloatingField label="CEP">
                <input
                  className={INPUT}
                  value={cep}
                  placeholder={buscandoCep ? 'Buscando…' : '00000-000'}
                  inputMode="numeric"
                  onChange={(e) => { setCep(maskCep(e.target.value)) }}
                  onBlur={handleCepBlur}
                />
              </FloatingField>
              <FloatingField label="Email"><input type="email" className={INPUT} value={email} onChange={(e) => setEmail(e.target.value)} /></FloatingField>
            </div>
            <div className="grid grid-cols-[1fr_5.5rem_8rem] gap-4">
              <FloatingField label="Logradouro"><input className={INPUT} value={logradouro} onChange={(e) => setLogradouro(e.target.value)} /></FloatingField>
              <FloatingField label="Número"><input className={INPUT} value={numero} onChange={(e) => setNumero(e.target.value)} /></FloatingField>
              <FloatingField label="Complemento"><input className={INPUT} value={complemento} onChange={(e) => setComplemento(e.target.value)} /></FloatingField>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <FloatingField label="Bairro"><input className={INPUT} value={bairro} onChange={(e) => setBairro(e.target.value)} /></FloatingField>
              <FloatingField label="Cidade"><input className={INPUT} value={cidade} onChange={(e) => setCidade(e.target.value)} /></FloatingField>
            </div>
            <FloatingField label="Outras Informações">
              <textarea rows={3} className={INPUT + ' resize-y'} value={outrasInformacoes} onChange={(e) => setOutrasInformacoes(e.target.value)} />
            </FloatingField>
          </Section>
          <Section title="Menor de idade" open={menorIdade} onToggle={() => setMenorIdade((v) => !v)}>
            <div className="grid grid-cols-2 gap-4">
              <FloatingField label="Nome do responsável">
                <input className={INPUT} value={nomeResponsavel} onChange={(e) => setNomeResponsavel(e.target.value)} />
              </FloatingField>
              <DateField label="Data de nascimento" value={dataNascimentoResp} onChange={setDataNascimentoResp} />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <FloatingField label="CPF do responsável">
                <input className={INPUT} value={cpfResponsavel} placeholder="000.000.000-00" inputMode="numeric" onChange={(e) => setCpfResponsavel(maskCpf(e.target.value))} />
              </FloatingField>
              <PhoneField label="Telefone do responsável" value={telefoneResponsavel} onChange={setTelefoneResponsavel} />
            </div>
          </Section>
        </div>
        <div className="flex items-center justify-end gap-3 px-6 py-4 border-t border-[var(--d2b-border)]">
          <button type="button" onClick={handleClose} className={BTN_GHOST}>Cancelar</button>
          <button type="button" onClick={handleSubmit} disabled={saving} className={BTN_PRIMARY + ' disabled:opacity-50'}>
            {saving ? 'Cadastrando...' : 'Cadastrar'}
          </button>
        </div>
      </DialogContent>
    </Dialog>
  )
}

// --- Main View ----------------------------------------------------------------
export function ClientesView({ initialPacientes, empresaId, profissionais = [], usuarioId, usuarioNome }: { initialPacientes: PacienteApi[]; empresaId: string | null; profissionais?: ProfissionalItem[]; usuarioId?: string; usuarioNome?: string }) {
  const searchParams = useSearchParams()
  const pacienteIdParam = searchParams.get('pacienteId')
  const tabParam = (searchParams.get('tab') as Tab | null) ?? 'dados'

  const [pacientes, setPacientes] = useState<PacienteApi[]>(initialPacientes)
  const [modalOpen, setModalOpen] = useState(false)
  const [search, setSearch] = useState('')
  const [filterStatus, setFilterStatus] = useState('')
  const [filterProfissional, setFilterProfissional] = useState('')
  const [mostrarArquivados, setMostrarArquivados] = useState(false)
  const [rowsPerPage, setRowsPerPage] = useState(10)
  const [page, setPage] = useState(1)
  const [selectedCliente, setSelectedCliente] = useState<PacienteApi | null>(
    () => pacienteIdParam ? (initialPacientes.find((p) => p.id === pacienteIdParam) ?? null) : null
  )

  if (selectedCliente) {
    return <ClienteDetalheView cliente={selectedCliente} onBack={() => setSelectedCliente(null)} empresaId={empresaId} initialTab={tabParam} usuarioId={usuarioId} usuarioNome={usuarioNome} />
  }

  const filtered = pacientes.filter((c) => {
    if (!c.nome.toLowerCase().includes(search.toLowerCase())) return false
    if (filterStatus && statusLabel(c.statusPagamento) !== filterStatus) return false
    if (filterProfissional && c.usuarioId !== filterProfissional) return false
    return true
  })
  const totalPages = Math.max(1, Math.ceil(filtered.length / rowsPerPage))

  return (
    <div className="p-6 space-y-5">
      <div className="flex items-start justify-between gap-4 flex-wrap">
        <div>
          <h2 className="text-xl font-bold text-[var(--d2b-text-primary)]">Clientes</h2>
          <p className="text-sm text-[var(--d2b-text-secondary)] mt-0.5">Crie e gerencie os clientes da clínica.</p>
        </div>
        <button data-tour="d2b-clientes-novo" onClick={() => setModalOpen(true)}
          className="flex items-center gap-1.5 h-9 px-4 rounded-lg bg-[#7C4DFF] hover:bg-[#5B21B6] text-white text-sm font-semibold transition-colors">
          <Plus size={14} /> Novo cliente
        </button>
      </div>

      {/* Filters */}
      <div className="flex flex-wrap items-center gap-3">
        <div data-tour="d2b-clientes-busca" className="flex items-center gap-2 bg-[var(--d2b-bg-elevated)] border border-[var(--d2b-border)] rounded-lg px-3 h-9 focus-within:border-[#7C4DFF] transition-colors">
          <Search size={14} className="text-[var(--d2b-text-secondary)] shrink-0" />
          <input type="text" placeholder="Pesquisar" value={search} onChange={(e) => setSearch(e.target.value)}
            className="bg-transparent text-sm text-[var(--d2b-text-primary)] placeholder:text-[var(--d2b-text-muted)] outline-none w-44" />
        </div>
        <div className="relative">
          <select
            value={filterStatus}
            onChange={(e) => { setFilterStatus(e.target.value); setPage(1) }}
            className="appearance-none h-9 pl-3 pr-8 rounded-lg bg-[var(--d2b-bg-elevated)] border border-[var(--d2b-border)] text-sm text-[var(--d2b-text-secondary)] focus:outline-none focus:border-[#7C4DFF] transition-colors cursor-pointer">
            <option value="">Todos os status</option>
            <option>Em Aberto</option>
            <option>Quitado</option>
            <option>Pendente</option>
          </select>
          <ChevronDown size={13} className="absolute right-2.5 top-1/2 -translate-y-1/2 text-[var(--d2b-text-secondary)] pointer-events-none" />
        </div>
        <div className="relative">
          <select
            value={filterProfissional}
            onChange={(e) => { setFilterProfissional(e.target.value); setPage(1) }}
            className="appearance-none h-9 pl-3 pr-8 rounded-lg bg-[var(--d2b-bg-elevated)] border border-[var(--d2b-border)] text-sm text-[var(--d2b-text-secondary)] focus:outline-none focus:border-[#7C4DFF] transition-colors cursor-pointer">
            <option value="">Todos profissionais</option>
            {profissionais.map((p) => (
              <option key={p.id} value={p.id}>{p.nome}</option>
            ))}
          </select>
          <ChevronDown size={13} className="absolute right-2.5 top-1/2 -translate-y-1/2 text-[var(--d2b-text-secondary)] pointer-events-none" />
        </div>
        <div
          role="switch"
          aria-checked={mostrarArquivados}
          onClick={() => setMostrarArquivados((v) => !v)}
          className="flex items-center gap-2 text-sm text-[var(--d2b-text-secondary)] cursor-pointer select-none"
        >
          Mostrar arquivados
          <div className={`relative w-9 h-5 rounded-full transition-colors ${mostrarArquivados ? 'bg-[#7C4DFF]' : 'bg-[var(--d2b-bg-elevated)]'}`}>
            <span className={`absolute top-0.5 w-4 h-4 rounded-full bg-white transition-transform ${mostrarArquivados ? 'translate-x-4' : 'translate-x-0.5'}`} />
          </div>
        </div>
      </div>

      {/* Table */}
      <div className="rounded-xl border border-[var(--d2b-border)] bg-[var(--d2b-bg-surface)] overflow-hidden">
        <div className="grid grid-cols-[84px_1fr_160px_80px_120px_180px] gap-2 px-4 py-3 border-b border-[var(--d2b-border)]">
          {[{ label: 'AÇÕES' }, { label: 'NOME', sortable: true }, { label: 'TELEFONE' }, { label: 'SESSÕES' }, { label: 'GRUPO' }, { label: 'STATUS DO PAGAMENTO' }].map((col) => (
            <div key={col.label} className="flex items-center gap-1">
              <span className="text-[10px] font-semibold uppercase tracking-widest text-[var(--d2b-text-secondary)]">{col.label}</span>
              {col.sortable && <ChevronsUpDown size={11} className="text-[var(--d2b-text-muted)]" />}
            </div>
          ))}
        </div>

        {filtered.length === 0 ? (
          <div className="py-10 text-center text-sm text-[var(--d2b-text-muted)]">Nenhum registro encontrado</div>
        ) : (
          filtered.map((c, i) => (
            <div key={c.id}
              className={`grid grid-cols-[84px_1fr_160px_80px_120px_180px] gap-2 px-4 py-3.5 items-center hover:bg-[var(--d2b-hover)] transition-colors ${i < filtered.length - 1 ? 'border-b border-[var(--d2b-border)]' : ''}`}>
              <div className="flex items-center gap-1.5">
                <button onClick={() => setSelectedCliente(c)}
                  className="w-7 h-7 rounded-md bg-[var(--d2b-hover)] hover:bg-[var(--d2b-hover)] flex items-center justify-center text-[#7C4DFF] transition-colors">
                  <Pencil size={13} />
                </button>
                <button className="w-7 h-7 rounded-md bg-[rgba(239,68,68,0.10)] hover:bg-[rgba(239,68,68,0.22)] flex items-center justify-center text-[#EF4444] transition-colors">
                  <Trash2 size={13} />
                </button>
              </div>
              <button
                onClick={() => setSelectedCliente(c)}
                className="text-sm font-semibold text-[var(--d2b-text-primary)] truncate text-left hover:text-[#C084FC] transition-colors">
                {c.nome}
              </button>
              <span className="text-sm text-[var(--d2b-text-secondary)]">{formatTelefone(c.telefone)}</span>
              <span className="text-sm text-[var(--d2b-text-secondary)]">{c.sessoes}</span>
              <span className="text-sm text-[var(--d2b-text-secondary)]">{c.grupo ?? '—'}</span>
              <StatusBadge status={c.statusPagamento} />
            </div>
          ))
        )}

        <div className="flex items-center justify-center gap-1 px-4 py-3 border-t border-[var(--d2b-border)]">
          <PageBtn onClick={() => setPage(1)} disabled={page === 1}><ChevronsLeft size={14} /></PageBtn>
          <PageBtn onClick={() => setPage((p) => Math.max(1, p - 1))} disabled={page === 1}><ChevronLeft size={14} /></PageBtn>
          <span className="w-8 h-8 rounded-full bg-[#7C4DFF] text-white text-xs font-bold flex items-center justify-center">{page}</span>
          <PageBtn onClick={() => setPage((p) => Math.min(totalPages, p + 1))} disabled={page === totalPages}><ChevronRight size={14} /></PageBtn>
          <PageBtn onClick={() => setPage(totalPages)} disabled={page === totalPages}><ChevronsRight size={14} /></PageBtn>
          <div className="ml-3 relative">
            <select value={rowsPerPage} onChange={(e) => { setRowsPerPage(Number(e.target.value)); setPage(1) }}
              className="appearance-none h-8 pl-3 pr-7 rounded-lg bg-[var(--d2b-bg-elevated)] border border-[var(--d2b-border-strong)] text-sm text-[var(--d2b-text-primary)] focus:outline-none cursor-pointer">
              {[5, 10, 20, 50].map((n) => <option key={n} value={n}>{n}</option>)}
            </select>
            <ChevronDown size={12} className="absolute right-2 top-1/2 -translate-y-1/2 text-[var(--d2b-text-secondary)] pointer-events-none" />
          </div>
        </div>
      </div>

      <CriarClienteModal
        open={modalOpen}
        onClose={() => setModalOpen(false)}
        empresaId={empresaId}
        onCreated={(p) => setPacientes((prev) => [p, ...prev])}
      />
    </div>
  )
}
