'use client'

import { useState } from 'react'
import {
  Search, Plus, Pencil, Trash2,
  ChevronsUpDown, ChevronDown, ChevronUp,
  CalendarIcon, ChevronLeft, ChevronRight,
  ChevronsLeft, ChevronsRight,
} from 'lucide-react'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'

// ─── Mock data ────────────────────────────────────────────────────────────────
const MOCK_CLIENTES = [
  { id: '1', nome: 'Monique Franca',   telefone: '+55 81 99634 9077', sessoes: 0, grupo: '—', statusPagamento: 'Em Aberto' },
  { id: '2', nome: 'Cliente Exemplo',  telefone: '+55 000000000',     sessoes: 1, grupo: '—', statusPagamento: 'Quitado' },
]

// ─── Base classes ─────────────────────────────────────────────────────────────
const INPUT = [
  'w-full bg-[#150830] border border-[rgba(124,77,255,0.25)] rounded-md',
  'px-3 py-2.5 text-sm text-[#F5F0FF] placeholder:text-[#6B4E8A]',
  'focus:outline-none focus:border-[#7C4DFF] transition-colors',
].join(' ')

const SELECT = INPUT + ' appearance-none cursor-pointer'

// ─── Sub-components ───────────────────────────────────────────────────────────
function FloatingField({
  label,
  required,
  children,
}: {
  label: string
  required?: boolean
  children: React.ReactNode
}) {
  return (
    <div className="relative">
      <label className="absolute -top-2 left-3 z-10 bg-[#1A0A38] px-1 text-[10px] font-medium text-[#A78BCC] leading-none">
        {label}
        {required && <span className="text-[#7C4DFF] ml-0.5">*</span>}
      </label>
      {children}
    </div>
  )
}

function FieldSelect({
  label,
  required,
  options,
  placeholder,
}: {
  label: string
  required?: boolean
  options: string[]
  placeholder?: string
}) {
  return (
    <FloatingField label={label} required={required}>
      <div className="relative">
        <select defaultValue="" className={SELECT}>
          <option value="" disabled>{placeholder ?? 'Selecione'}</option>
          {options.map((o) => <option key={o}>{o}</option>)}
        </select>
        <ChevronDown size={13} className="absolute right-3 top-1/2 -translate-y-1/2 text-[#A78BCC] pointer-events-none" />
      </div>
    </FloatingField>
  )
}

function PhoneField({ label, required }: { label: string; required?: boolean }) {
  return (
    <FloatingField label={label} required={required}>
      <div className="flex gap-2">
        <div className="flex items-center gap-1 shrink-0 bg-[#150830] border border-[rgba(124,77,255,0.25)] rounded-md px-2.5 text-sm text-[#F5F0FF] cursor-pointer">
          🇧🇷 <span className="text-[#A78BCC] text-xs ml-1">+55</span>
          <ChevronDown size={11} className="text-[#6B4E8A] ml-0.5" />
        </div>
        <input className={INPUT} placeholder="" />
      </div>
    </FloatingField>
  )
}

function DateField({ label }: { label: string }) {
  return (
    <FloatingField label={label}>
      <div className="relative">
        <input type="date" className={INPUT + ' pr-9'} />
        <CalendarIcon size={14} className="absolute right-3 top-1/2 -translate-y-1/2 text-[#A78BCC] pointer-events-none" />
      </div>
    </FloatingField>
  )
}

function Section({
  title,
  open,
  onToggle,
  children,
}: {
  title: string
  open: boolean
  onToggle: () => void
  children: React.ReactNode
}) {
  return (
    <div className="border-t border-[rgba(124,77,255,0.18)]">
      <button
        type="button"
        onClick={onToggle}
        className="w-full flex items-center justify-between py-3 text-sm font-bold text-[#7C4DFF] hover:text-[#C084FC] transition-colors"
      >
        {title}
        {open ? <ChevronUp size={15} /> : <ChevronDown size={15} />}
      </button>
      {open && <div className="pb-4 space-y-3">{children}</div>}
    </div>
  )
}

function StatusBadge({ status }: { status: string }) {
  const styles: Record<string, string> = {
    'Em Aberto': 'text-[#EF4444]',
    'Quitado':   'text-[#22C55E]',
  }
  const dots: Record<string, string> = {
    'Em Aberto': 'bg-[#EF4444]',
    'Quitado':   'bg-[#22C55E]',
  }
  return (
    <span className={`flex items-center gap-1.5 text-sm font-medium ${styles[status] ?? 'text-[#A78BCC]'}`}>
      <span className={`w-2 h-2 rounded-full shrink-0 ${dots[status] ?? 'bg-[#A78BCC]'}`} />
      {status}
    </span>
  )
}

function PageBtn({
  onClick,
  disabled,
  children,
}: {
  onClick: () => void
  disabled: boolean
  children: React.ReactNode
}) {
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

// ─── Modal Criar Cliente ──────────────────────────────────────────────────────
function CriarClienteModal({
  open,
  onClose,
}: {
  open: boolean
  onClose: () => void
}) {
  const [infosPessoais, setInfosPessoais] = useState(false)
  const [menorIdade, setMenorIdade] = useState(false)

  return (
    <Dialog open={open} onOpenChange={(v) => { if (!v) onClose() }}>
      <DialogContent
        showCloseButton={false}
        className="bg-[#1A0A38] border border-[rgba(124,77,255,0.30)] text-[#F5F0FF] !max-w-3xl p-0 gap-0 overflow-hidden"
      >
        {/* Header */}
        <DialogHeader className="flex-row items-center justify-between px-6 py-4 border-b border-[rgba(124,77,255,0.18)] space-y-0">
          <DialogTitle className="text-base font-bold text-[#F5F0FF]">
            Criar Cliente
          </DialogTitle>
          <button
            onClick={onClose}
            className="w-7 h-7 rounded-md flex items-center justify-center text-[#A78BCC] hover:text-[#F5F0FF] hover:bg-[rgba(124,77,255,0.12)] transition-colors text-lg leading-none"
          >
            ✕
          </button>
        </DialogHeader>

        {/* Body */}
        <div className="overflow-y-auto max-h-[68vh] px-6 py-5 space-y-4">

          {/* Nome + Nome Social */}
          <div className="grid grid-cols-2 gap-4">
            <FloatingField label="Nome" required>
              <input className={INPUT} />
            </FloatingField>
            <FloatingField label="Nome Social">
              <input className={INPUT} />
            </FloatingField>
          </div>

          {/* Telefone + Data de nascimento */}
          <div className="grid grid-cols-2 gap-4">
            <PhoneField label="Número de Telefone" required />
            <DateField label="Data de nascimento" />
          </div>

          {/* Gênero + Convênio */}
          <div className="grid grid-cols-2 gap-4">
            <FieldSelect label="Gênero" placeholder="Selecione um gênero"
              options={['Masculino', 'Feminino', 'Outro', 'Prefiro não informar']} />
            <FieldSelect label="Convênio" placeholder="Selecione um plano"
              options={['Sem convênio', 'Unimed', 'Bradesco Saúde', 'Amil']} />
          </div>

          {/* Carteirinha + Grupo */}
          <div className="grid grid-cols-2 gap-4">
            <FloatingField label="Número da Carteirinha">
              <input className={INPUT} />
            </FloatingField>
            <FieldSelect label="Grupo" placeholder="Selecione um grupo"
              options={['Grupo A', 'Grupo B', 'Grupo C']} />
          </div>

          {/* Como conheceu */}
          <div className="grid grid-cols-2 gap-4">
            <FieldSelect label="Como conheceu?" placeholder="Selecione"
              options={['Instagram', 'Indicação', 'Google', 'Facebook', 'Outros']} />
          </div>

          {/* ── Seção: Informações Pessoais ── */}
          <Section title="Informações Pessoais" open={infosPessoais} onToggle={() => setInfosPessoais((v) => !v)}>
            <div className="grid grid-cols-2 gap-4">
              <FloatingField label="RG"><input className={INPUT} /></FloatingField>
              <FloatingField label="CPF"><input className={INPUT} /></FloatingField>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <FloatingField label="CEP"><input className={INPUT} /></FloatingField>
              <FloatingField label="Email"><input type="email" className={INPUT} /></FloatingField>
            </div>
            <div className="grid grid-cols-[1fr_5.5rem_8rem] gap-4">
              <FloatingField label="Logradouro"><input className={INPUT} /></FloatingField>
              <FloatingField label="Número"><input className={INPUT} /></FloatingField>
              <FloatingField label="Complemento"><input className={INPUT} /></FloatingField>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <FloatingField label="Bairro"><input className={INPUT} /></FloatingField>
              <FloatingField label="Cidade"><input className={INPUT} /></FloatingField>
            </div>
            <FloatingField label="Outras Informações">
              <textarea
                rows={3}
                placeholder="Escreva outras informações..."
                className={INPUT + ' resize-y placeholder:text-[#6B4E8A]'}
              />
            </FloatingField>
          </Section>

          {/* ── Seção: Menor de idade ── */}
          <Section title="Menor de idade" open={menorIdade} onToggle={() => setMenorIdade((v) => !v)}>
            <div className="grid grid-cols-2 gap-4">
              <FloatingField label="Nome do responsável"><input className={INPUT} /></FloatingField>
              <DateField label="Data de nascimento" />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <FloatingField label="CPF do responsável"><input className={INPUT} /></FloatingField>
              <PhoneField label="Telefone do responsável" />
            </div>
          </Section>
        </div>

        {/* Footer */}
        <div className="flex items-center justify-end gap-3 px-6 py-4 border-t border-[rgba(124,77,255,0.18)]">
          <button
            type="button"
            onClick={onClose}
            className="px-5 py-2 rounded-md text-sm font-medium text-[#A78BCC] border border-[rgba(124,77,255,0.25)] hover:border-[#7C4DFF] hover:text-[#F5F0FF] transition-colors"
          >
            Cancelar
          </button>
          <button
            type="button"
            className="px-5 py-2 rounded-md text-sm font-bold text-white bg-[#7C4DFF] hover:bg-[#5B21B6] transition-colors"
          >
            Cadastrar
          </button>
        </div>
      </DialogContent>
    </Dialog>
  )
}

// ─── Main View ────────────────────────────────────────────────────────────────
export function ClientesView() {
  const [modalOpen, setModalOpen] = useState(false)
  const [search, setSearch] = useState('')
  const [mostrarArquivados, setMostrarArquivados] = useState(false)
  const [rowsPerPage, setRowsPerPage] = useState(10)
  const [page, setPage] = useState(1)

  const filtered = MOCK_CLIENTES.filter((c) =>
    c.nome.toLowerCase().includes(search.toLowerCase()),
  )
  const totalPages = Math.max(1, Math.ceil(filtered.length / rowsPerPage))

  return (
    <div className="p-6 space-y-5">

      {/* Page header */}
      <div className="flex items-start justify-between gap-4 flex-wrap">
        <div>
          <h2 className="text-xl font-bold text-[#F5F0FF]">Clientes do Estabelecimento</h2>
          <p className="text-sm text-[#A78BCC] mt-0.5">
            Crie e gerencie clientes atendidos pelo estabelecimento.
          </p>
        </div>
        <button
          onClick={() => setModalOpen(true)}
          className="flex items-center gap-1.5 h-9 px-4 rounded-lg bg-[#7C4DFF] hover:bg-[#5B21B6] text-white text-sm font-semibold transition-colors"
        >
          <Plus size={14} />
          Novo Cliente
        </button>
      </div>

      {/* Filters */}
      <div className="flex flex-wrap items-center gap-3">
        <div className="flex items-center gap-2 bg-[#150830] border border-[rgba(124,77,255,0.18)] rounded-lg px-3 h-9 focus-within:border-[#7C4DFF] transition-colors">
          <Search size={14} className="text-[#A78BCC] shrink-0" />
          <input
            type="text"
            placeholder="Pesquisar"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="bg-transparent text-sm text-[#F5F0FF] placeholder:text-[#6B4E8A] outline-none w-44"
          />
        </div>

        <div className="relative">
          <select className="appearance-none h-9 pl-3 pr-8 rounded-lg bg-[#150830] border border-[rgba(124,77,255,0.18)] text-sm text-[#A78BCC] focus:outline-none focus:border-[#7C4DFF] transition-colors cursor-pointer">
            <option value="">Status do pagamento</option>
            <option>Em Aberto</option>
            <option>Quitado</option>
          </select>
          <ChevronDown size={13} className="absolute right-2.5 top-1/2 -translate-y-1/2 text-[#A78BCC] pointer-events-none" />
        </div>

        <div className="relative">
          <select className="appearance-none h-9 pl-3 pr-8 rounded-lg bg-[#150830] border border-[rgba(124,77,255,0.18)] text-sm text-[#A78BCC] focus:outline-none focus:border-[#7C4DFF] transition-colors cursor-pointer">
            <option value="">Todos os profissionais</option>
          </select>
          <ChevronDown size={13} className="absolute right-2.5 top-1/2 -translate-y-1/2 text-[#A78BCC] pointer-events-none" />
        </div>

        <label className="flex items-center gap-2 text-sm text-[#A78BCC] cursor-pointer select-none">
          Mostrar arquivados
          <button
            type="button"
            role="switch"
            aria-checked={mostrarArquivados}
            onClick={() => setMostrarArquivados((v) => !v)}
            className={`relative w-9 h-5 rounded-full transition-colors ${
              mostrarArquivados ? 'bg-[#7C4DFF]' : 'bg-[#2D1B4E]'
            }`}
          >
            <span
              className={`absolute top-0.5 w-4 h-4 rounded-full bg-white transition-transform ${
                mostrarArquivados ? 'translate-x-4' : 'translate-x-0.5'
              }`}
            />
          </button>
        </label>
      </div>

      {/* Table */}
      <div className="rounded-xl border border-[rgba(124,77,255,0.18)] bg-[#120328] overflow-hidden">

        {/* Header row */}
        <div className="grid grid-cols-[84px_1fr_160px_80px_120px_180px] gap-2 px-4 py-3 border-b border-[rgba(124,77,255,0.12)]">
          {[
            { label: 'AÇÕES' },
            { label: 'NOME', sortable: true },
            { label: 'TELEFONE' },
            { label: 'SESSÕES' },
            { label: 'GRUPO' },
            { label: 'STATUS DO PAGAMENTO' },
          ].map((col) => (
            <div key={col.label} className="flex items-center gap-1">
              <span className="text-[10px] font-semibold uppercase tracking-widest text-[#A78BCC]">
                {col.label}
              </span>
              {col.sortable && <ChevronsUpDown size={11} className="text-[#6B4E8A]" />}
            </div>
          ))}
        </div>

        {/* Data rows */}
        {filtered.length === 0 ? (
          <div className="py-10 text-center text-sm text-[#6B4E8A]">
            Nenhum registro encontrado
          </div>
        ) : (
          filtered.map((c, i) => (
            <div
              key={c.id}
              className={`grid grid-cols-[84px_1fr_160px_80px_120px_180px] gap-2 px-4 py-3.5 items-center hover:bg-[rgba(124,77,255,0.05)] transition-colors ${
                i < filtered.length - 1 ? 'border-b border-[rgba(124,77,255,0.08)]' : ''
              }`}
            >
              <div className="flex items-center gap-1.5">
                <button className="w-7 h-7 rounded-md bg-[rgba(124,77,255,0.12)] hover:bg-[rgba(124,77,255,0.25)] flex items-center justify-center text-[#7C4DFF] transition-colors">
                  <Pencil size={13} />
                </button>
                <button className="w-7 h-7 rounded-md bg-[rgba(239,68,68,0.10)] hover:bg-[rgba(239,68,68,0.22)] flex items-center justify-center text-[#EF4444] transition-colors">
                  <Trash2 size={13} />
                </button>
              </div>
              <span className="text-sm font-semibold text-[#F5F0FF] truncate">{c.nome}</span>
              <span className="text-sm text-[#A78BCC]">{c.telefone}</span>
              <span className="text-sm text-[#A78BCC]">{c.sessoes}</span>
              <span className="text-sm text-[#A78BCC]">{c.grupo}</span>
              <StatusBadge status={c.statusPagamento} />
            </div>
          ))
        )}

        {/* Pagination */}
        <div className="flex items-center justify-center gap-1 px-4 py-3 border-t border-[rgba(124,77,255,0.12)]">
          <PageBtn onClick={() => setPage(1)} disabled={page === 1}>
            <ChevronsLeft size={14} />
          </PageBtn>
          <PageBtn onClick={() => setPage((p) => Math.max(1, p - 1))} disabled={page === 1}>
            <ChevronLeft size={14} />
          </PageBtn>

          <span className="w-8 h-8 rounded-full bg-[#7C4DFF] text-white text-xs font-bold flex items-center justify-center">
            {page}
          </span>

          <PageBtn onClick={() => setPage((p) => Math.min(totalPages, p + 1))} disabled={page === totalPages}>
            <ChevronRight size={14} />
          </PageBtn>
          <PageBtn onClick={() => setPage(totalPages)} disabled={page === totalPages}>
            <ChevronsRight size={14} />
          </PageBtn>

          <div className="ml-3 relative">
            <select
              value={rowsPerPage}
              onChange={(e) => { setRowsPerPage(Number(e.target.value)); setPage(1) }}
              className="appearance-none h-8 pl-3 pr-7 rounded-lg bg-[#150830] border border-[rgba(124,77,255,0.25)] text-sm text-[#F5F0FF] focus:outline-none cursor-pointer"
            >
              {[5, 10, 20, 50].map((n) => <option key={n} value={n}>{n}</option>)}
            </select>
            <ChevronDown size={12} className="absolute right-2 top-1/2 -translate-y-1/2 text-[#A78BCC] pointer-events-none" />
          </div>
        </div>
      </div>

      <CriarClienteModal open={modalOpen} onClose={() => setModalOpen(false)} />
    </div>
  )
}
