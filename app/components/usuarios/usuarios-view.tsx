'use client'

import { useState, useEffect } from 'react'
import {
  Search, Plus, Trash2, ChevronDown, X, Eye, EyeOff,
  ChevronsLeft, ChevronsRight, ChevronLeft, ChevronRight,
  Camera, Loader2,
} from 'lucide-react'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { FotoModal } from '@/components/clientes/foto-modal'
import { useAbility, subject } from '@/lib/casl'

// ─── Types ────────────────────────────────────────────────────────────────────
type NivelPermissao = 'Profissional / ADM' | 'Assistente' | 'Profissional Simples' | 'Gerente' | 'Gerente Geral'

interface Usuario {
  id: string
  nome: string
  especialidade: string
  email: string
  telefone: string
  tipoAcesso: string
  proprietario?: boolean
  tipo?: string
  conselho?: string
  numeroConselho?: string
  cep?: string
  logradouro?: string
  numero?: string
  complemento?: string
  bairro?: string
  cidade?: string
  agendaId?: string
  genero?: string
  duracaoSessao?: number
  fotoUrl?: string
}

const ESPECIALIDADES = ['Dentista', 'Médico', 'Psicólogo', 'Fisioterapeuta', 'Nutricionista', 'Enfermeiro']
const NIVEIS_PERMISSAO: NivelPermissao[] = [
  'Profissional / ADM',
  'Assistente',
  'Profissional Simples',
  'Gerente',
  'Gerente Geral',
]
const GENEROS = ['Masculino', 'Feminino', 'Outro', 'Prefiro não informar']
const ROWS_OPTIONS = [10, 25, 50]

// ─── Base classes ─────────────────────────────────────────────────────────────
const INPUT =
  'w-full bg-[var(--d2b-bg-elevated)] border border-[var(--d2b-border-strong)] rounded-md ' +
  'px-3 py-2.5 text-sm text-[var(--d2b-text-primary)] placeholder:text-[var(--d2b-text-muted)] ' +
  'focus:outline-none focus:border-[#7C4DFF] transition-colors'

// ─── FloatingField ────────────────────────────────────────────────────────────
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
      <label className="absolute -top-2 left-3 z-10 bg-[var(--d2b-bg-elevated)] px-1 text-[10px] font-medium text-[var(--d2b-text-secondary)] leading-none">
        {label}
        {required && <span className="text-[#7C4DFF] ml-0.5">*</span>}
      </label>
      {children}
    </div>
  )
}

// ─── FloatingSelect ───────────────────────────────────────────────────────────
function FloatingSelect({
  label,
  required,
  options,
  placeholder,
  value,
  onChange,
}: {
  label: string
  required?: boolean
  options: string[]
  placeholder?: string
  value?: string
  onChange?: (v: string) => void
}) {
  return (
    <FloatingField label={label} required={required}>
      <div className="relative">
        <select
          value={value ?? ''}
          onChange={(e) => onChange?.(e.target.value)}
          className={INPUT + ' appearance-none pr-8 cursor-pointer'}
        >
          <option value="" disabled>{placeholder ?? 'Selecione'}</option>
          {options.map((o) => <option key={o} value={o}>{o}</option>)}
        </select>
        <ChevronDown size={13} className="absolute right-3 top-1/2 -translate-y-1/2 text-[var(--d2b-text-secondary)] pointer-events-none" />
      </div>
    </FloatingField>
  )
}

// ─── Avatar ───────────────────────────────────────────────────────────────────
function Avatar({ nome, fotoUrl }: { nome: string; fotoUrl?: string }) {
  const initials = nome
    .split(' ')
    .filter(Boolean)
    .slice(0, 1)
    .map((w) => w[0])
    .join('')
    .toUpperCase()

  if (fotoUrl && fotoUrl.startsWith('http')) {
    return (
      <div className="w-9 h-9 rounded-lg overflow-hidden border border-[var(--d2b-border-strong)] shrink-0">
        <img src={fotoUrl} alt={nome} className="w-full h-full object-cover" />
      </div>
    )
  }

  return (
    <div className="w-9 h-9 rounded-lg bg-[var(--d2b-hover)] border border-[var(--d2b-border-strong)] flex items-center justify-center shrink-0">
      <span className="text-sm font-bold text-[#C084FC]">{initials}</span>
    </div>
  )
}

// ─── PageBtn ──────────────────────────────────────────────────────────────────
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
      className="w-8 h-8 rounded-md flex items-center justify-center text-[var(--d2b-text-secondary)] hover:text-[var(--d2b-text-primary)] hover:bg-[var(--d2b-hover)] disabled:opacity-30 disabled:pointer-events-none transition-colors"
    >
      {children}
    </button>
  )
}

// ─── MultiSelectDropdown ──────────────────────────────────────────────────────
function MultiSelectDropdown({
  label,
  options,
  selected,
  onChange,
}: {
  label: string
  options: string[]
  selected: string[]
  onChange: (v: string[]) => void
}) {
  const [open, setOpen] = useState(false)

  const toggle = (opt: string) => {
    onChange(
      selected.includes(opt)
        ? selected.filter((s) => s !== opt)
        : [...selected, opt],
    )
  }

  const displayLabel =
    selected.length === 0
      ? label
      : selected.length === 1
      ? selected[0]
      : `${selected.length} selecionados`

  return (
    <div className="relative min-w-[220px]">
      <button
        type="button"
        onClick={() => setOpen((p) => !p)}
        className="w-full flex items-center justify-between gap-2 bg-[var(--d2b-bg-elevated)] border border-[var(--d2b-border-strong)] rounded-md px-3 py-2.5 text-sm text-left transition-colors focus:outline-none focus:border-[#7C4DFF] hover:border-[#7C4DFF]"
      >
        <span className={selected.length ? 'text-[var(--d2b-text-primary)]' : 'text-[var(--d2b-text-muted)]'}>{displayLabel}</span>
        <ChevronDown size={13} className={`text-[var(--d2b-text-secondary)] transition-transform shrink-0 ${open ? 'rotate-180' : ''}`} />
      </button>

      {open && (
        <div className="absolute z-50 mt-1 w-full bg-[var(--d2b-bg-elevated)] border border-[var(--d2b-border-strong)] rounded-md shadow-xl overflow-hidden">
          {options.map((opt) => (
            <label
              key={opt}
              className="flex items-center gap-3 px-3 py-2.5 cursor-pointer hover:bg-[var(--d2b-hover)] transition-colors"
            >
              <input
                type="checkbox"
                checked={selected.includes(opt)}
                onChange={() => toggle(opt)}
                className="accent-[#7C4DFF] w-4 h-4 shrink-0"
              />
              <span className="text-sm text-[var(--d2b-text-primary)]">{opt}</span>
            </label>
          ))}
        </div>
      )}
    </div>
  )
}

const CONSELHOS = ['CRM', 'CRO', 'CRP', 'CREFITO', 'CRN', 'COREN']
const DURACOES = ['20 minutos', '30 minutos', '40 minutos', '45 minutos', '50 minutos', '60 minutos', '90 minutos']
const TIPOS_PROF = ['Dentista', 'Médico', 'Psicólogo', 'Fisioterapeuta', 'Nutricionista', 'Enfermeiro', 'Assistente']

// ─── Modal Editar Usuário ─────────────────────────────────────────────────────
function EditarUsuarioModal({
  usuario,
  onClose,
  onSaved,
  readonlyNivel,
}: {
  usuario: Usuario
  onClose: () => void
  onSaved?: (updated: Usuario) => void
  readonlyNivel?: boolean
}) {
  const [saving, setSaving] = useState(false)
  const [showSenha, setShowSenha] = useState(false)
  const [fotoSrc, setFotoSrc] = useState<string | null>(null)
  const [uploadingFoto, setUploadingFoto] = useState(false)
  const [fotoModalOpen, setFotoModalOpen] = useState(false)

  useEffect(() => {
    if (!usuario.fotoUrl) return
    fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/v1/usuarios/${usuario.id}/foto-url`)
      .then((r) => r.ok ? r.json() : null)
      .then((d) => d && setFotoSrc(d.fotoUrl ?? null))
      .catch(() => {})
  }, [usuario.id, usuario.fotoUrl])

  async function uploadFoto(file: File) {
    setUploadingFoto(true)
    try {
      const form = new FormData()
      form.append('file', file)
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/v1/usuarios/${usuario.id}/foto`, {
        method: 'POST',
        body: form,
      })
      if (res.ok) {
        const d = await res.json()
        setFotoSrc(d.fotoUrl ?? null)
        onSaved?.({ ...usuario, fotoUrl: d.fotoUrl ?? usuario.fotoUrl })
      }
    } finally {
      setUploadingFoto(false)
    }
  }
  const [email, setEmail] = useState(usuario.email)
  const [senha, setSenha] = useState('')
  const [nome, setNome] = useState(usuario.nome)
  const [genero, setGenero] = useState(usuario.genero ?? 'Masculino')
  const [telefone, setTelefone] = useState(usuario.telefone.replace(/^\+55\s?/, ''))
  const [nivelPermissao, setNivelPermissao] = useState<string>(usuario.tipoAcesso || 'Profissional / ADM')
  const [cep, setCep] = useState(usuario.cep ?? '')
  const [logradouro, setLogradouro] = useState(usuario.logradouro ?? '')
  const [numero, setNumero] = useState(usuario.numero ?? '')
  const [complemento, setComplemento] = useState(usuario.complemento ?? '')
  const [bairro, setBairro] = useState(usuario.bairro ?? '')
  const [cidade, setCidade] = useState(usuario.cidade ?? '')
  const [duracao, setDuracao] = useState(usuario.duracaoSessao ? `${usuario.duracaoSessao} minutos` : '40 minutos')
  const [tipo, setTipo] = useState(usuario.tipo ?? '')
  const [especialidade, setEspecialidadeProf] = useState(usuario.especialidade ?? '')
  const [conselho, setConselho] = useState(usuario.conselho ?? '')
  const [numeroConselho, setNumeroConselho] = useState(usuario.numeroConselho ?? '')
  const [horarioPersonalizado, setHorarioPersonalizado] = useState(false)

  const DIAS = ['Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb', 'Dom']
  const [horarios, setHorarios] = useState(() =>
    DIAS.map((dia) => ({ dia, abertura: '09:00', fechamento: '18:00', aberto: false }))
  )
  const [almoco, setAlmoco] = useState(false)
  const [almocoInicio, setAlmocoInicio] = useState('12:00')
  const [almocoFim, setAlmocoFim] = useState('13:00')

  function setHorarioDia(idx: number, field: 'abertura' | 'fechamento' | 'aberto', val: string | boolean) {
    setHorarios((h) => h.map((row, i) => i === idx ? { ...row, [field]: val } : row))
  }

  const LBL = 'absolute -top-2 left-3 z-10 bg-[var(--d2b-bg-elevated)] px-1 text-[10px] font-medium text-[var(--d2b-text-secondary)] leading-none'
  const SEL = INPUT + ' appearance-none pr-8 cursor-pointer'

  return (
    <Dialog open onOpenChange={(v: boolean) => { if (!v) onClose() }}>
      <DialogContent
        showCloseButton={false}
        className="bg-[var(--d2b-bg-elevated)] border border-[var(--d2b-border-strong)] text-[var(--d2b-text-primary)] !max-w-2xl p-0 gap-0 overflow-hidden rounded-2xl"
      >
        {/* Header */}
        <DialogHeader className="flex-row items-center justify-between px-7 py-5 border-b border-[var(--d2b-border)] space-y-0">
          <DialogTitle className="text-base font-bold text-[var(--d2b-text-primary)]">Editar usuário</DialogTitle>
          <button onClick={onClose} className="w-7 h-7 rounded-lg flex items-center justify-center text-[var(--d2b-text-muted)] hover:text-[var(--d2b-text-primary)] hover:bg-[var(--d2b-hover)] transition-colors">
            <X size={15} />
          </button>
        </DialogHeader>

        <div className="overflow-y-auto max-h-[78vh] px-7 py-6 space-y-7">

          {/* Foto do profissional */}
          <div className="flex items-center gap-5">
            <div
              className="relative group cursor-pointer flex-shrink-0"
              onClick={() => setFotoModalOpen(true)}
              title="Clique para alterar a foto"
            >
              <div className="w-20 h-20 rounded-full overflow-hidden border-2 border-[var(--d2b-border-strong)] bg-[var(--d2b-bg-elevated)] flex items-center justify-center">
                {fotoSrc
                  ? <img src={fotoSrc} alt={usuario.nome} className="w-full h-full object-cover" />
                  : <Camera size={28} className="text-[var(--d2b-text-muted)]" />
                }
              </div>
              <div className="absolute inset-0 rounded-full bg-black/30 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                {uploadingFoto
                  ? <Loader2 size={18} className="text-white animate-spin" />
                  : <Camera size={18} className="text-white" />
                }
              </div>
            </div>
            <div>
              <p className="text-sm font-bold text-[var(--d2b-text-primary)]">{usuario.nome}</p>
              <p className="text-xs text-[var(--d2b-text-muted)] mt-0.5">Clique na foto para alterar</p>
            </div>
          </div>
          <FotoModal open={fotoModalOpen} onClose={() => setFotoModalOpen(false)} onConfirm={uploadFoto} />
          <div>
            <p className="text-sm font-bold text-[var(--d2b-text-primary)] mb-0.5">Informações da conta</p>
            <p className="text-xs text-[var(--d2b-text-muted)] mb-4">Defina um e-mail e senha para um novo usuário do DEV2B.</p>
            <div className="grid grid-cols-2 gap-4">
              <FloatingField label="Email" required>
                <input type="email" value={email} readOnly className={INPUT + ' opacity-60 cursor-not-allowed bg-[var(--d2b-hover)]'} />
              </FloatingField>
              <div className="relative">
                <label className={LBL}>Senha<span className="text-[#7C4DFF] ml-0.5">*</span></label>
                <div className="relative">
                  <input type={showSenha ? 'text' : 'password'} value={senha} onChange={(e) => setSenha(e.target.value)}
                    className={INPUT + ' pr-10'} />
                  <button type="button" onClick={() => setShowSenha((v) => !v)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-[var(--d2b-text-muted)] hover:text-[var(--d2b-text-secondary)] transition-colors">
                    {showSenha ? <EyeOff size={15} /> : <Eye size={15} />}
                  </button>
                </div>
              </div>
            </div>
          </div>

          {/* Informações pessoais */}
          <div>
            <p className="text-sm font-bold text-[var(--d2b-text-primary)] mb-0.5">Informações pessoais</p>
            <p className="text-xs text-[var(--d2b-text-muted)] mb-4">Defina os dados pessoais e o nível de permissão para este usuário.</p>
            <div className="grid grid-cols-2 gap-4">
              <FloatingField label="Nome" required>
                <input type="text" value={nome} onChange={(e) => setNome(e.target.value)} className={INPUT} />
              </FloatingField>
              <FloatingSelect label="Gênero" required options={GENEROS} value={genero} onChange={setGenero} />
              <div className="relative">
                <label className={LBL}>Código do País</label>
                <div className="flex gap-2">
                  <div className="flex items-center gap-1.5 bg-[var(--d2b-bg-elevated)] border border-[var(--d2b-border-strong)] rounded-lg px-3 py-2.5 text-sm text-[var(--d2b-text-primary)] cursor-pointer shrink-0">
                    🇧🇷 <span className="text-[var(--d2b-text-secondary)] text-xs">Brasil</span> <ChevronDown size={11} className="text-[var(--d2b-text-muted)]" />
                  </div>
                  <div className="relative flex-1">
                    <label className={LBL}>Telefone<span className="text-[#7C4DFF] ml-0.5">*</span></label>
                    <input type="text" value={telefone} onChange={(e) => setTelefone(e.target.value)}
                      placeholder="(00) 00000-0000" className={INPUT} />
                  </div>
                </div>
              </div>
              <FloatingSelect label="Nível de Permissão" required
                options={NIVEIS_PERMISSAO} value={nivelPermissao}
                onChange={readonlyNivel ? () => {} : setNivelPermissao} />
            {readonlyNivel && (
              <p className="text-xs text-[var(--d2b-text-muted)] col-span-2 -mt-2">
                Seu nível de permissão não pode ser alterado por você mesmo.
              </p>
            )}
            </div>
          </div>

          {/* Informações profissionais */}
          <div>
            <p className="text-sm font-bold text-[var(--d2b-text-primary)] mb-0.5">Informações profissionais</p>
            <p className="text-xs text-[var(--d2b-text-muted)] mb-4">Ao registrar um profissional, o mesmo estará disponível para agendamentos no calendário.</p>
            <div className="grid grid-cols-2 gap-4">
              <FloatingField label="CEP">
                <input type="text" value={cep} onChange={(e) => setCep(e.target.value)} className={INPUT} />
              </FloatingField>
              <FloatingField label="Logradouro">
                <input type="text" value={logradouro} onChange={(e) => setLogradouro(e.target.value)} className={INPUT} />
              </FloatingField>
              <FloatingField label="Número">
                <input type="text" value={numero} onChange={(e) => setNumero(e.target.value)} className={INPUT} />
              </FloatingField>
              <FloatingField label="Complemento">
                <input type="text" value={complemento} onChange={(e) => setComplemento(e.target.value)} className={INPUT} />
              </FloatingField>
              <FloatingField label="Bairro">
                <input type="text" value={bairro} onChange={(e) => setBairro(e.target.value)} className={INPUT} />
              </FloatingField>
              <FloatingField label="Cidade">
                <input type="text" value={cidade} onChange={(e) => setCidade(e.target.value)} className={INPUT} />
              </FloatingField>
              <FloatingSelect label="Duração da sessão" required options={DURACOES} value={duracao} onChange={setDuracao} />
              <FloatingSelect label="Tipo" required options={TIPOS_PROF} value={tipo} onChange={setTipo} />
              <FloatingField label="Especialidade">
                <input type="text" value={especialidade} onChange={(e) => setEspecialidadeProf(e.target.value)} className={INPUT} />
              </FloatingField>
              <div className="relative">
                <label className={LBL}>Conselho</label>
                <div className="relative">
                  <select value={conselho} onChange={(e) => setConselho(e.target.value)} className={SEL}>
                    <option value="">Selecione um conselho</option>
                    {CONSELHOS.map((c) => <option key={c} value={c}>{c}</option>)}
                  </select>
                  <ChevronDown size={13} className="absolute right-3 top-1/2 -translate-y-1/2 text-[var(--d2b-text-secondary)] pointer-events-none" />
                </div>
              </div>
              <FloatingField label="Número do conselho">
                <input type="text" value={numeroConselho} onChange={(e) => setNumeroConselho(e.target.value)} className={INPUT} />
              </FloatingField>
            </div>

            {/* Horário personalizado toggle */}
            <label className="flex items-center gap-3 mt-5 cursor-pointer select-none">
              <button type="button" onClick={() => setHorarioPersonalizado((v) => !v)}
                className={`relative w-9 h-5 rounded-full transition-colors flex-shrink-0 ${horarioPersonalizado ? 'bg-[#7C4DFF]' : 'bg-[var(--d2b-hover)]'}`}>
                <div className={`absolute top-0.5 w-4 h-4 rounded-full bg-white shadow transition-transform ${horarioPersonalizado ? 'translate-x-4' : 'translate-x-0.5'}`} />
              </button>
              <span className="text-sm text-[var(--d2b-text-secondary)]">Configurar horários personalizados de atendimento para este profissional?</span>
            </label>

            {/* ── Horários expandidos ──────────────────────────────────── */}
            {horarioPersonalizado && (
              <div className="mt-4 space-y-5">
                <p className="text-xs text-[var(--d2b-text-muted)]">Configure os horários de atendimento deste profissional abaixo:</p>

                {/* Horários de Funcionamento */}
                <div>
                  <p className="text-sm font-semibold text-[var(--d2b-text-primary)] mb-3">Horários de Funcionamento</p>
                  <div className="space-y-3">
                    {horarios.map((row, idx) => (
                      <div key={row.dia} className="flex items-center gap-3">
                        <span className="w-8 text-sm text-[var(--d2b-text-secondary)] flex-shrink-0">{row.dia}:</span>
                        <div className="relative flex-1">
                          <label className={LBL}>Abertura</label>
                          <input type="time" value={row.abertura} onChange={(e) => setHorarioDia(idx, 'abertura', e.target.value)}
                            className={INPUT} />
                        </div>
                        <div className="relative flex-1">
                          <label className={LBL}>Fechamento</label>
                          <input type="time" value={row.fechamento} onChange={(e) => setHorarioDia(idx, 'fechamento', e.target.value)}
                            className={INPUT} />
                        </div>
                        <label className="flex items-center gap-1.5 flex-shrink-0 cursor-pointer">
                          <input type="checkbox" checked={row.aberto} onChange={(e) => setHorarioDia(idx, 'aberto', e.target.checked)}
                            className="w-4 h-4 rounded accent-[#7C4DFF] cursor-pointer" />
                          <span className="text-sm text-[var(--d2b-text-secondary)]">Aberto</span>
                        </label>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Horário de Almoço */}
                <div>
                  <p className="text-sm font-semibold text-[var(--d2b-text-primary)] mb-3">Horário de Almoço</p>
                  <label className="flex items-center gap-2 mb-3 cursor-pointer">
                    <input type="checkbox" checked={almoco} onChange={(e) => setAlmoco(e.target.checked)}
                      className="w-4 h-4 rounded accent-[#7C4DFF] cursor-pointer" />
                    <span className="text-sm text-[var(--d2b-text-secondary)]">Ativar Horário de Almoço</span>
                  </label>
                  <div className="grid grid-cols-2 gap-3">
                    <div className="relative">
                      <label className={LBL}>Início</label>
                      <input type="time" value={almocoInicio} onChange={(e) => setAlmocoInicio(e.target.value)} className={INPUT} />
                    </div>
                    <div className="relative">
                      <label className={LBL}>Fim</label>
                      <input type="time" value={almocoFim} onChange={(e) => setAlmocoFim(e.target.value)} className={INPUT} />
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Footer */}
        <div className="flex items-center justify-end gap-3 px-7 py-5 border-t border-[var(--d2b-border)]">
          <button onClick={onClose} className="px-5 py-2 rounded-lg text-sm font-medium text-[var(--d2b-text-secondary)] border border-[var(--d2b-border-strong)] hover:border-[#7C4DFF] hover:text-[var(--d2b-text-primary)] transition-colors">Cancelar</button>
          <button
            disabled={saving}
            onClick={async () => {
              setSaving(true)
              try {
                const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/v1/usuarios/${usuario.id}`, {
                  method: 'PATCH',
                  headers: { 'Content-Type': 'application/json' },
                  body: JSON.stringify({
                  nome, telefone, cep, logradouro, numero, complemento, bairro, cidade,
                  tipo, especialidade, conselho, numeroConselho,
                  genero,
                  tipoAcesso: nivelPermissao,
                  duracaoSessao: parseInt(duracao),
                }),
                })
                if (res.ok) {
                  const updated = await res.json()
                  onSaved?.({ ...usuario, ...updated })
                  onClose()
                }
              } finally {
                setSaving(false)
              }
            }}
            className="px-5 py-2 rounded-lg text-sm font-bold text-white bg-[#7C4DFF] hover:bg-[#5B21B6] disabled:opacity-60 transition-colors">
            {saving ? 'Salvando…' : 'Salvar'}
          </button>
        </div>
      </DialogContent>
    </Dialog>
  )
}

// ─── Modal Cadastrar Usuário ──────────────────────────────────────────────────
function Toggle({ checked, onChange, label }: { checked: boolean; onChange: (v: boolean) => void; label: string }) {
  return (
    <label className="flex items-center gap-3 cursor-pointer select-none">
      <button type="button" onClick={() => onChange(!checked)}
        className={`relative w-9 h-5 rounded-full transition-colors flex-shrink-0 ${checked ? 'bg-[#7C4DFF]' : 'bg-[var(--d2b-hover)]'}`}>
        <div className={`absolute top-0.5 w-4 h-4 rounded-full bg-white shadow transition-transform ${checked ? 'translate-x-4' : 'translate-x-0.5'}`} />
      </button>
      <span className="text-sm text-[var(--d2b-text-secondary)]">{label}</span>
    </label>
  )
}

type PermToggles = {
  financeiro: boolean
  calendario: boolean
  horarios: boolean
  todosPacientes: boolean
  evolucoes: boolean
  filaEspera: boolean
}

function getDefaultToggles(nivel: string): PermToggles {
  return {
    financeiro: false,
    calendario: false,
    horarios: nivel === 'Profissional / ADM' || nivel === 'Profissional Simples',
    todosPacientes: nivel === 'Profissional Simples',
    evolucoes: nivel === 'Profissional Simples',
    filaEspera: true,
  }
}

function CadastrarUsuarioModal({
  open,
  onClose,
  onCadastrado,
}: {
  open: boolean
  onClose: () => void
  onCadastrado?: (u: Usuario) => void
}) {
  const [showSenha,      setShowSenha]      = useState(false)
  const [nivelPermissao, setNivelPermissao] = useState('Assistente')
  const [genero,         setGenero]         = useState('Masculino')
  const [toggles,        setToggles]        = useState<PermToggles>(getDefaultToggles('Assistente'))
  const [nome,           setNomeCad]        = useState('')
  const [email,          setEmailCad]       = useState('')
  const [senha,          setSenhaCad]       = useState('')
  const [telefone,       setTelefoneCad]    = useState('')
  const [tipo,           setTipoCad]        = useState('')
  const [especialidade,  setEspCad]         = useState('')
  const [conselho,       setConselhoCad]    = useState('')
  const [numeroConselho, setNumConselhoCad] = useState('')
  const [erros,          setErros]          = useState<Record<string, string>>({})
  const [saving,         setSaving]         = useState(false)
  const [fotoFile,       setFotoFile]       = useState<File | null>(null)
  const [fotoPreview,    setFotoPreview]    = useState<string | null>(null)
  const [fotoModalOpen,  setFotoModalOpen]  = useState(false)

  function handleNivel(v: string) {
    setNivelPermissao(v)
    setToggles(getDefaultToggles(v))
  }
  function setToggle(key: keyof PermToggles, v: boolean) {
    setToggles((prev) => ({ ...prev, [key]: v }))
  }

  const isProf    = nivelPermissao === 'Profissional / ADM' || nivelPermissao === 'Profissional Simples'
  const isSimples = nivelPermissao === 'Profissional Simples'

  const FIELD = 'w-full bg-[var(--d2b-bg-elevated)] border border-[var(--d2b-border-strong)] rounded-lg px-3 py-2.5 text-sm text-[var(--d2b-text-primary)] placeholder:text-[var(--d2b-text-muted)] focus:outline-none focus:border-[#7C4DFF] transition-colors'
  const LBL   = 'absolute -top-2 left-3 z-10 bg-[var(--d2b-bg-elevated)] px-1 text-[10px] text-[var(--d2b-text-secondary)] leading-none'
  const SEL   = FIELD + ' appearance-none pr-8 cursor-pointer'

  function FloatInput({ label, type = 'text', placeholder, required, value, onChange }: { label: string; type?: string; placeholder?: string; required?: boolean; value?: string; onChange?: (v: string) => void }) {
    return (
      <div className="relative">
        <label className={LBL}>{label}{required && <span className="text-[#7C4DFF] ml-0.5">*</span>}</label>
        <input type={type} placeholder={placeholder} value={value ?? ''} onChange={(e) => onChange?.(e.target.value)}
          className={FIELD + (required && erros[label] ? ' border-red-500' : '')} />
        {required && erros[label] && <p className="text-xs text-red-400 mt-1">{erros[label]}</p>}
      </div>
    )
  }
  function FloatSel({ label, options, value, onChange, placeholder, required }: {
    label: string; options: string[]; value: string; onChange: (v: string) => void; placeholder?: string; required?: boolean
  }) {
    return (
      <div className="relative">
        <label className={LBL}>{label}{required && <span className="text-[#7C4DFF] ml-0.5">*</span>}</label>
        <div className="relative">
          <select value={value} onChange={(e) => onChange(e.target.value)} className={SEL}>
            {placeholder && <option value="" disabled>{placeholder}</option>}
            {options.map((o) => <option key={o} value={o}>{o}</option>)}
          </select>
          <ChevronDown size={13} className="absolute right-3 top-1/2 -translate-y-1/2 text-[var(--d2b-text-secondary)] pointer-events-none" />
        </div>
      </div>
    )
  }

  return (
    <Dialog open={open} onOpenChange={(v: boolean) => { if (!v) onClose() }}>
      <DialogContent
        showCloseButton={false}
        className="bg-[var(--d2b-bg-elevated)] border border-[var(--d2b-border-strong)] text-[var(--d2b-text-primary)] !max-w-2xl p-0 gap-0 overflow-hidden rounded-2xl"
      >
        <DialogHeader className="flex-row items-center justify-between px-7 py-5 border-b border-[var(--d2b-border)] space-y-0">
          <DialogTitle className="text-base font-bold text-[var(--d2b-text-primary)]">Cadastrar novo usuário</DialogTitle>
          <button onClick={onClose} className="w-7 h-7 rounded-lg flex items-center justify-center text-[var(--d2b-text-muted)] hover:text-[var(--d2b-text-primary)] hover:bg-[var(--d2b-hover)] transition-colors">
            <X size={15} />
          </button>
        </DialogHeader>

        <div className="overflow-y-auto max-h-[80vh] px-7 py-6 space-y-6">

          {/* ── Foto ── */}
          <div className="flex items-center gap-5">
            <div
              className="relative group cursor-pointer flex-shrink-0"
              onClick={() => setFotoModalOpen(true)}
              title="Adicionar foto"
            >
              <div className="w-20 h-20 rounded-full overflow-hidden border-2 border-dashed border-[var(--d2b-border-strong)] bg-[var(--d2b-bg-elevated)] flex items-center justify-center">
                {fotoPreview
                  ? <img src={fotoPreview} alt="preview" className="w-full h-full object-cover" />
                  : <Camera size={28} className="text-[var(--d2b-text-muted)]" />
                }
              </div>
              <div className="absolute inset-0 rounded-full bg-black/30 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                <Camera size={18} className="text-white" />
              </div>
            </div>
            <div>
              <p className="text-sm font-medium text-[var(--d2b-text-primary)]">Foto do profissional</p>
              <p className="text-xs text-[var(--d2b-text-muted)] mt-0.5">{fotoFile ? fotoFile.name : 'Clique para adicionar (opcional)'}</p>
            </div>
          </div>
          <FotoModal
            open={fotoModalOpen}
            onClose={() => setFotoModalOpen(false)}
            onConfirm={(file) => {
              setFotoFile(file)
              setFotoPreview(URL.createObjectURL(file))
            }}
          />
          <div>
            <p className="text-sm font-bold text-[var(--d2b-text-primary)] mb-0.5">Informações da conta</p>
            <p className="text-xs text-[var(--d2b-text-muted)] mb-4">Defina um e-mail e senha para um novo usuário do DEV2B.</p>
            <div className="grid grid-cols-2 gap-4">
              <FloatInput label="Email" type="email" required value={email} onChange={setEmailCad} />
              <div className="relative">
                <label className={LBL}>Senha<span className="text-[#7C4DFF] ml-0.5">*</span></label>
                <div className="relative">
                  <input type={showSenha ? 'text' : 'password'} value={senha} onChange={(e) => setSenhaCad(e.target.value)}
                    className={FIELD + ' pr-10' + (erros['Senha'] ? ' border-red-500' : '')} />
                  <button type="button" onClick={() => setShowSenha((p) => !p)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-[var(--d2b-text-muted)] hover:text-[var(--d2b-text-secondary)] transition-colors">
                    {showSenha ? <EyeOff size={15} /> : <Eye size={15} />}
                  </button>
                </div>
                {erros['Senha'] && <p className="text-xs text-red-400 mt-1">{erros['Senha']}</p>}
              </div>
            </div>
          </div>

          {/* ── Permissões ── */}
          <div className="space-y-3">
            <p className="text-xs font-semibold text-[var(--d2b-text-muted)] uppercase tracking-widest">Permissões deste usuário</p>
            <Toggle checked={toggles.financeiro} onChange={(v) => setToggle('financeiro', v)}
              label="Visualiza e pode editar os dados financeiros de cada atendimento." />
            <Toggle checked={toggles.calendario} onChange={(v) => setToggle('calendario', v)}
              label="Pode fazer alterações de agendamentos no calendário." />
            {isProf && (
              <Toggle checked={toggles.horarios} onChange={(v) => setToggle('horarios', v)}
                label="Permitir que este usuário possa configurar seus próprios horários" />
            )}
            {isSimples && (
              <>
                <Toggle checked={toggles.todosPacientes} onChange={(v) => setToggle('todosPacientes', v)}
                  label="Tem acesso aos dados de todos os pacientes da conta." />
                <Toggle checked={toggles.evolucoes} onChange={(v) => setToggle('evolucoes', v)}
                  label="Pode visualizar as evoluções de outros profissionais." />
              </>
            )}
            <Toggle checked={toggles.filaEspera} onChange={(v) => setToggle('filaEspera', v)}
              label="Pode adicionar ou remover paciente da fila de espera" />
          </div>

          {/* ── Informações pessoais ── */}
          <div>
            <p className="text-sm font-bold text-[var(--d2b-text-primary)] mb-0.5">Informações pessoais</p>
            <p className="text-xs text-[var(--d2b-text-muted)] mb-4">Defina os dados pessoais e o nível de permissão para este novo usuário.</p>
            <div className="grid grid-cols-2 gap-4">
              <FloatInput label="Nome" required value={nome} onChange={setNomeCad} />
              <FloatSel label="Gênero" required options={GENEROS} value={genero} onChange={setGenero} />
              <div className="relative">
                <label className={LBL}>Código do País</label>
                <div className="flex gap-2">
                  <div className="flex items-center gap-1.5 bg-[var(--d2b-bg-elevated)] border border-[var(--d2b-border-strong)] rounded-lg px-3 py-2.5 text-sm text-[var(--d2b-text-primary)] cursor-pointer shrink-0">
                    🇧🇷 <span className="text-[var(--d2b-text-secondary)] text-xs">Brasil</span> <ChevronDown size={11} className="text-[var(--d2b-text-muted)]" />
                  </div>
                  <div className="relative flex-1">
                    <label className={LBL}>Telefone</label>
                    <input type="text" placeholder="(00) 00000-0000" value={telefone} onChange={(e) => setTelefoneCad(e.target.value)} className={FIELD} />
                  </div>
                </div>
              </div>
              <FloatSel label="Nível de Permissão" required
                options={NIVEIS_PERMISSAO} value={nivelPermissao} onChange={handleNivel} />
            </div>
          </div>

          {/* ── Informações profissionais ── */}
          {isProf && (
            <div>
              <p className="text-sm font-bold text-[var(--d2b-text-primary)] mb-0.5">Informações profissionais</p>
              <p className="text-xs text-[var(--d2b-text-muted)] mb-4">Ao registrar um profissional, o mesmo estará disponível para agendamentos no calendário.</p>
              <div className="grid grid-cols-2 gap-4">
                <div className="relative">
                  <label className={LBL}>Tipo<span className="text-[#7C4DFF] ml-0.5">*</span></label>
                  <div className="relative">
                    <select value={tipo} onChange={(e) => setTipoCad(e.target.value)} className={SEL}>
                      <option value="">Selecione um tipo</option>
                      {TIPOS_PROF.map((t) => <option key={t} value={t}>{t}</option>)}
                    </select>
                    <ChevronDown size={13} className="absolute right-3 top-1/2 -translate-y-1/2 text-[var(--d2b-text-secondary)] pointer-events-none" />
                  </div>
                </div>
                <FloatInput label="Especialidade" value={especialidade} onChange={setEspCad} />
                <div className="relative">
                  <label className={LBL}>Conselho</label>
                  <div className="relative">
                    <select value={conselho} onChange={(e) => setConselhoCad(e.target.value)} className={SEL}>
                      <option value="">Selecione um conselho</option>
                      {CONSELHOS.map((c) => <option key={c} value={c}>{c}</option>)}
                    </select>
                    <ChevronDown size={13} className="absolute right-3 top-1/2 -translate-y-1/2 text-[var(--d2b-text-secondary)] pointer-events-none" />
                  </div>
                </div>
                <FloatInput label="Número do conselho" value={numeroConselho} onChange={setNumConselhoCad} />
              </div>
            </div>
          )}

        </div>{/* end scroll area */}

        <div className="flex items-center justify-end gap-3 px-7 py-5 border-t border-[var(--d2b-border)]">
          <button onClick={onClose} className="px-5 py-2 rounded-lg text-sm font-medium text-[var(--d2b-text-secondary)] border border-[var(--d2b-border-strong)] hover:border-[#7C4DFF] hover:text-[var(--d2b-text-primary)] transition-colors">Cancelar</button>
          <button
            disabled={saving}
            onClick={async () => {
              const errosNovos: Record<string, string> = {}
              if (!email.trim()) errosNovos['Email'] = 'Obrigatório'
              if (!senha.trim()) errosNovos['Senha'] = 'Obrigatório'
              if (!nome.trim()) errosNovos['Nome'] = 'Obrigatório'
              if (Object.keys(errosNovos).length > 0) { setErros(errosNovos); return }
              setSaving(true)
              try {
                const res = await fetch('/api/usuarios/criar', {
                  method: 'POST',
                  headers: { 'Content-Type': 'application/json' },
                  body: JSON.stringify({
                  nome, email, senha, telefone, tipo, especialidade,
                  conselho, numeroConselho, nivelPermissao, genero,
                  permissoes: toggles,
                }),
                })
                const data = await res.json()
                if (!res.ok) {
                  setErros({ Email: data.error ?? 'Erro ao cadastrar' })
                  return
                }
                // upload foto se selecionada
                let fotoUrlSalva: string | undefined
                if (fotoFile && data.id) {
                  try {
                    const form = new FormData()
                    form.append('file', fotoFile)
                    const fRes = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/v1/usuarios/${data.id}/foto`, {
                      method: 'POST',
                      body: form,
                    })
                    if (fRes.ok) {
                      const fd = await fRes.json()
                      fotoUrlSalva = fd.fotoUrl
                    }
                  } catch { /* non-critical */ }
                }
                onCadastrado?.({
                  id: data.id,
                  nome: data.nome,
                  especialidade: data.especialidade ?? tipo,
                  email: data.email,
                  telefone: data.telefone ?? '',
                  tipoAcesso: nivelPermissao,
                  tipo: data.tipo,
                  conselho: data.conselho,
                  numeroConselho: data.numeroConselho,
                  fotoUrl: fotoUrlSalva,
                })
                onClose()
              } catch {
                setErros({ Email: 'Erro de conexão' })
              } finally {
                setSaving(false)
              }
            }}
            className="px-5 py-2 rounded-lg text-sm font-bold text-white bg-[#7C4DFF] hover:bg-[#5B21B6] disabled:opacity-60 transition-colors">
            {saving ? 'Cadastrando…' : 'Cadastrar'}
          </button>
        </div>
      </DialogContent>
    </Dialog>
  )
}

// ─── UsuariosView ─────────────────────────────────────────────────────────────
export function UsuariosView({ empresaId }: { empresaId: string | null }) {
  const { ability } = useAbility()
  const [search, setSearch] = useState('')
  const [especialidade, setEspecialidade] = useState('')
  const [niveisSelected, setNiveisSelected] = useState<string[]>([])
  const [modalOpen, setModalOpen] = useState(false)
  const [editarUsuario, setEditarUsuario] = useState<Usuario | null>(null)
  const [page, setPage] = useState(1)
  const [rowsPerPage, setRowsPerPage] = useState(10)
  const [usuarios, setUsuarios] = useState<Usuario[]>([])

  useEffect(() => {
    if (!empresaId) return
    fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/v1/usuarios/empresa/${empresaId}`)
      .then((r) => r.ok ? r.json() : [])
      .then((data: Array<{
        id: string; nome: string; email: string; telefone?: string
        tipo?: string; especialidade?: string; conselho?: string
        numeroConselho?: string; cep?: string; logradouro?: string
        numero?: string; complemento?: string; bairro?: string
        cidade?: string; agendaId?: string; genero?: string; duracaoSessao?: number; fotoUrl?: string
        tipoAcesso?: string
      }>) =>
        setUsuarios(data.map((u) => ({
          id: u.id,
          nome: u.nome,
          especialidade: u.especialidade ?? u.tipo ?? '',
          email: u.email,
          telefone: u.telefone ?? '',
          tipoAcesso: u.tipoAcesso ?? '',
          tipo: u.tipo,
          conselho: u.conselho,
          numeroConselho: u.numeroConselho,
          cep: u.cep,
          logradouro: u.logradouro,
          numero: u.numero,
          complemento: u.complemento,
          bairro: u.bairro,
          cidade: u.cidade,
          agendaId: u.agendaId,
          genero: u.genero,
          duracaoSessao: u.duracaoSessao,
          fotoUrl: u.fotoUrl,
        })))
      )
      .catch(() => {})
  }, [empresaId])

  // Filtering — respects CASL row-level conditions (e.g. Profissional Simples só vê a si mesmo)
  const filtered = usuarios
    .filter((u) => ability.can('read', subject('usuarios', u)))
    .filter((u) => {
    const q = search.toLowerCase()
    const matchSearch =
      !q || u.nome.toLowerCase().includes(q) || u.email.toLowerCase().includes(q)
    const matchEsp = !especialidade || u.especialidade === especialidade
    const matchNivel = niveisSelected.length === 0 || niveisSelected.includes(u.tipoAcesso)
    return matchSearch && matchEsp && matchNivel
  })

  const totalPages = Math.max(1, Math.ceil(filtered.length / rowsPerPage))
  const paginated = filtered.slice((page - 1) * rowsPerPage, page * rowsPerPage)

  const hasFilters = !!search || !!especialidade || niveisSelected.length > 0

  function clearFilters() {
    setSearch('')
    setEspecialidade('')
    setNiveisSelected([])
    setPage(1)
  }

  return (
    <div className="min-h-full bg-[var(--d2b-bg-main)]">
      {/* Page header */}
      <div className="flex items-center justify-between px-6 py-4 border-b border-[var(--d2b-border)]">
        <div>
          <h2 className="text-lg font-bold text-[var(--d2b-text-primary)]">Profissionais da Clínica</h2>
          <p className="text-xs text-[var(--d2b-text-muted)] mt-0.5">
            Crie e gerencie os perfis dos profissionais cadastrados dentro da clínica.
          </p>
        </div>
        {ability.can('create', 'usuarios') && (
        <button
          onClick={() => setModalOpen(true)}
          className="flex items-center gap-2 px-4 py-2 rounded-md text-sm font-bold text-white bg-[#7C4DFF] hover:bg-[#5B21B6] transition-colors"
        >
          <Plus size={15} />
          Novo Usuário
        </button>
        )}
      </div>

      {/* Filters */}
      <div className="px-6 py-4 flex flex-wrap items-center gap-3">
        {/* Search */}
        <div className="flex items-center gap-2 flex-1 min-w-[200px] bg-[var(--d2b-bg-elevated)] border border-[var(--d2b-border-strong)] rounded-md px-3 py-2.5 focus-within:border-[#7C4DFF] transition-colors">
          <Search size={14} className="text-[var(--d2b-text-muted)] shrink-0" />
          <input
            value={search}
            onChange={(e) => { setSearch(e.target.value); setPage(1) }}
            placeholder="Pesquisar por nome ou email"
            className="bg-transparent text-sm text-[var(--d2b-text-primary)] placeholder:text-[var(--d2b-text-muted)] focus:outline-none w-full"
          />
          {search && (
            <button onClick={() => setSearch('')} className="text-[var(--d2b-text-muted)] hover:text-[var(--d2b-text-primary)] transition-colors">
              <X size={13} />
            </button>
          )}
        </div>

        {/* Especialidade */}
        <div className="relative min-w-[200px]">
          <select
            value={especialidade}
            onChange={(e) => { setEspecialidade(e.target.value); setPage(1) }}
            className="w-full bg-[var(--d2b-bg-elevated)] border border-[var(--d2b-border-strong)] rounded-md px-3 py-2.5 text-sm appearance-none cursor-pointer transition-colors focus:outline-none focus:border-[#7C4DFF] pr-8"
            style={{ color: especialidade ? '#F5F0FF' : '#6B4E8A' }}
          >
            <option value="">Especialidade</option>
            {ESPECIALIDADES.map((e) => (
              <option key={e} value={e} style={{ color: '#F5F0FF', background: '#1A0A38' }}>{e}</option>
            ))}
          </select>
          {especialidade ? (
            <button
              onClick={() => setEspecialidade('')}
              className="absolute right-7 top-1/2 -translate-y-1/2 text-[var(--d2b-text-muted)] hover:text-[var(--d2b-text-primary)] transition-colors"
            >
              <X size={12} />
            </button>
          ) : null}
          <ChevronDown size={13} className="absolute right-3 top-1/2 -translate-y-1/2 text-[var(--d2b-text-secondary)] pointer-events-none" />
        </div>

        {/* Nível de Permissão multi-select */}
        <MultiSelectDropdown
          label="Nível de Permissão"
          options={NIVEIS_PERMISSAO}
          selected={niveisSelected}
          onChange={(v) => { setNiveisSelected(v); setPage(1) }}
        />

        {/* Limpar filtros */}
        {hasFilters && (
          <button
            onClick={clearFilters}
            className="flex items-center gap-1.5 px-4 py-2.5 rounded-md text-sm font-medium text-[var(--d2b-text-secondary)] border border-[var(--d2b-border-strong)] hover:border-[#7C4DFF] hover:text-[var(--d2b-text-primary)] transition-colors"
          >
            <Trash2 size={13} />
            Limpar Filtros
          </button>
        )}
      </div>

      {/* Table */}
      <div className="px-6">
        <div className="rounded-xl border border-[var(--d2b-border)] overflow-hidden">
          {/* Head */}
          <div className="grid grid-cols-[2fr_2fr_1.5fr_1.5fr_auto] gap-0 bg-[var(--d2b-hover)] border-b border-[var(--d2b-border)]">
            {['NOME', 'EMAIL', 'TELEFONE', 'TIPO DE ACESSO', 'DELETAR'].map((col, i) => (
              <div
                key={col}
                className={`px-4 py-3 text-[10px] font-semibold tracking-wider text-[var(--d2b-text-muted)] uppercase ${i === 4 ? 'text-center w-28' : ''}`}
              >
                {col}
              </div>
            ))}
          </div>

          {/* Rows */}
          {paginated.length === 0 ? (
            <div className="flex items-center justify-center py-12 text-sm text-[var(--d2b-text-muted)]">
              Nenhum usuário encontrado
            </div>
          ) : (
            paginated.map((u, i) => (
              <div
                key={u.id}
                className={`grid grid-cols-[2fr_2fr_1.5fr_1.5fr_auto] items-center gap-0 border-b border-[var(--d2b-border)] transition-colors hover:bg-[var(--d2b-hover)] cursor-pointer ${i % 2 === 1 ? 'bg-[var(--d2b-hover)]' : ''}`}
                onClick={() => setEditarUsuario(u)}
              >
                {/* Nome */}
                <div className="px-4 py-3.5 flex items-center gap-3">
                  <Avatar nome={u.nome} fotoUrl={u.fotoUrl} />
                  <div>
                    <p className="text-sm font-semibold text-[var(--d2b-text-primary)] leading-snug">{u.nome}</p>
                    <p className="text-xs text-[#7C4DFF]">{u.especialidade}</p>
                  </div>
                </div>

                {/* Email */}
                <div className="px-4 py-3.5">
                  <p className="text-sm text-[var(--d2b-text-secondary)] truncate">{u.email}</p>
                </div>

                {/* Telefone */}
                <div className="px-4 py-3.5">
                  <p className="text-sm text-[var(--d2b-text-secondary)]">{u.telefone}</p>
                </div>

                {/* Tipo de acesso */}
                <div className="px-4 py-3.5">
                  <span className="inline-flex items-center px-2.5 py-1 rounded-md text-xs font-semibold bg-[var(--d2b-hover)] text-[#C084FC] border border-[var(--d2b-border-strong)]">
                    {u.tipoAcesso}
                  </span>
                </div>

                {/* Deletar */}
                <div className="px-4 py-3.5 w-28 flex justify-center">
                  {u.proprietario ? (
                    <span className="text-xs text-[#7C4DFF] font-medium whitespace-nowrap">
                      * Proprietário da Clínica
                    </span>
                  ) : ability.can('delete', 'usuarios') ? (
                    <button
                      onClick={(e) => { e.stopPropagation(); /* delete */ }}
                      className="w-8 h-8 rounded-md flex items-center justify-center text-[#EF4444] hover:bg-[rgba(239,68,68,0.12)] transition-colors">
                      <Trash2 size={15} />
                    </button>
                  ) : null}
                </div>
              </div>
            ))
          )}
        </div>
      </div>

      {/* Pagination */}
      <div className="flex items-center justify-center gap-2 px-6 py-5">
        <PageBtn onClick={() => setPage(1)} disabled={page === 1}>
          <ChevronsLeft size={14} />
        </PageBtn>
        <PageBtn onClick={() => setPage((p) => Math.max(1, p - 1))} disabled={page === 1}>
          <ChevronLeft size={14} />
        </PageBtn>

        {Array.from({ length: totalPages }, (_, i) => i + 1).map((p) => (
          <button
            key={p}
            onClick={() => setPage(p)}
            className={`w-8 h-8 rounded-md text-sm font-medium transition-colors ${
              p === page
                ? 'bg-[#7C4DFF] text-white'
                : 'text-[var(--d2b-text-secondary)] hover:text-[var(--d2b-text-primary)] hover:bg-[var(--d2b-hover)]'
            }`}
          >
            {p}
          </button>
        ))}

        <PageBtn onClick={() => setPage((p) => Math.min(totalPages, p + 1))} disabled={page === totalPages}>
          <ChevronRight size={14} />
        </PageBtn>
        <PageBtn onClick={() => setPage(totalPages)} disabled={page === totalPages}>
          <ChevronsRight size={14} />
        </PageBtn>

        {/* Rows per page */}
        <div className="relative ml-2">
          <select
            value={rowsPerPage}
            onChange={(e) => { setRowsPerPage(Number(e.target.value)); setPage(1) }}
            className="bg-[var(--d2b-bg-elevated)] border border-[var(--d2b-border-strong)] rounded-md pl-3 pr-7 py-1.5 text-sm text-[var(--d2b-text-primary)] appearance-none cursor-pointer focus:outline-none focus:border-[#7C4DFF] transition-colors"
          >
            {ROWS_OPTIONS.map((r) => (
              <option key={r} value={r} style={{ background: '#1A0A38' }}>{r}</option>
            ))}
          </select>
          <ChevronDown size={12} className="absolute right-2.5 top-1/2 -translate-y-1/2 text-[var(--d2b-text-secondary)] pointer-events-none" />
        </div>
      </div>

      {/* Modal Cadastrar */}
      <CadastrarUsuarioModal
        open={modalOpen}
        onClose={() => setModalOpen(false)}
        onCadastrado={(u) => setUsuarios((prev) => [...prev, u])}
      />
      {/* Modal Editar */}
      {editarUsuario && (
        <EditarUsuarioModal
          usuario={editarUsuario}
          onClose={() => setEditarUsuario(null)}
          readonlyNivel={!ability.can('update', subject('usuarios', editarUsuario), 'tipoAcesso')}
          onSaved={(updated) => {
            setUsuarios((prev) => prev.map((u) => u.id === updated.id ? updated : u))
          }}
        />
      )}
    </div>
  )
}
