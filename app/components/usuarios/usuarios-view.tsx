'use client'

import { useState } from 'react'
import {
  Search, Plus, Trash2, ChevronDown, X, Eye, EyeOff,
  ChevronsLeft, ChevronsRight, ChevronLeft, ChevronRight,
} from 'lucide-react'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'

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
}

// ─── Mock data ────────────────────────────────────────────────────────────────
const MOCK_USUARIOS: Usuario[] = [
  {
    id: '1',
    nome: 'JESSE DOS SANTOS BEZERRA',
    especialidade: 'Dentista',
    email: 'jesse.9001@gmail.com',
    telefone: '+55 81 99708 8404',
    tipoAcesso: 'Profissional administrador',
    proprietario: true,
  },
]

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
  'w-full bg-[#150830] border border-[rgba(124,77,255,0.25)] rounded-md ' +
  'px-3 py-2.5 text-sm text-[#F5F0FF] placeholder:text-[#6B4E8A] ' +
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
      <label className="absolute -top-2 left-3 z-10 bg-[#1A0A38] px-1 text-[10px] font-medium text-[#A78BCC] leading-none">
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
        <ChevronDown size={13} className="absolute right-3 top-1/2 -translate-y-1/2 text-[#A78BCC] pointer-events-none" />
      </div>
    </FloatingField>
  )
}

// ─── Avatar ───────────────────────────────────────────────────────────────────
function Avatar({ nome }: { nome: string }) {
  const initials = nome
    .split(' ')
    .filter(Boolean)
    .slice(0, 1)
    .map((w) => w[0])
    .join('')
    .toUpperCase()

  return (
    <div className="w-9 h-9 rounded-lg bg-[rgba(124,77,255,0.20)] border border-[rgba(124,77,255,0.30)] flex items-center justify-center shrink-0">
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
      className="w-8 h-8 rounded-md flex items-center justify-center text-[#A78BCC] hover:text-[#F5F0FF] hover:bg-[rgba(124,77,255,0.12)] disabled:opacity-30 disabled:pointer-events-none transition-colors"
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
        className="w-full flex items-center justify-between gap-2 bg-[#150830] border border-[rgba(124,77,255,0.25)] rounded-md px-3 py-2.5 text-sm text-left transition-colors focus:outline-none focus:border-[#7C4DFF] hover:border-[#7C4DFF]"
      >
        <span className={selected.length ? 'text-[#F5F0FF]' : 'text-[#6B4E8A]'}>{displayLabel}</span>
        <ChevronDown size={13} className={`text-[#A78BCC] transition-transform shrink-0 ${open ? 'rotate-180' : ''}`} />
      </button>

      {open && (
        <div className="absolute z-50 mt-1 w-full bg-[#1A0A38] border border-[rgba(124,77,255,0.30)] rounded-md shadow-xl overflow-hidden">
          {options.map((opt) => (
            <label
              key={opt}
              className="flex items-center gap-3 px-3 py-2.5 cursor-pointer hover:bg-[rgba(124,77,255,0.12)] transition-colors"
            >
              <input
                type="checkbox"
                checked={selected.includes(opt)}
                onChange={() => toggle(opt)}
                className="accent-[#7C4DFF] w-4 h-4 shrink-0"
              />
              <span className="text-sm text-[#F5F0FF]">{opt}</span>
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
}: {
  usuario: Usuario
  onClose: () => void
}) {
  const [showSenha, setShowSenha] = useState(false)
  const [email, setEmail] = useState(usuario.email)
  const [senha, setSenha] = useState('')
  const [nome, setNome] = useState(usuario.nome)
  const [genero, setGenero] = useState('Masculino')
  const [telefone, setTelefone] = useState(usuario.telefone.replace(/^\+55\s?/, ''))
  const [nivelPermissao, setNivelPermissao] = useState<string>('Profissional / ADM')
  const [cep, setCep] = useState('')
  const [logradouro, setLogradouro] = useState('')
  const [numero, setNumero] = useState('')
  const [complemento, setComplemento] = useState('')
  const [bairro, setBairro] = useState('')
  const [cidade, setCidade] = useState('')
  const [duracao, setDuracao] = useState('40 minutos')
  const [tipo, setTipo] = useState(usuario.especialidade)
  const [especialidade, setEspecialidadeProf] = useState('')
  const [conselho, setConselho] = useState('')
  const [numeroConselho, setNumeroConselho] = useState('')
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

  const LBL = 'absolute -top-2 left-3 z-10 bg-[#1A0A38] px-1 text-[10px] font-medium text-[#A78BCC] leading-none'
  const SEL = INPUT + ' appearance-none pr-8 cursor-pointer'

  return (
    <Dialog open onOpenChange={(v: boolean) => { if (!v) onClose() }}>
      <DialogContent
        showCloseButton={false}
        className="bg-[#1A0A38] border border-[rgba(124,77,255,0.30)] text-[#F5F0FF] !max-w-2xl p-0 gap-0 overflow-hidden rounded-2xl"
      >
        {/* Header */}
        <DialogHeader className="flex-row items-center justify-between px-7 py-5 border-b border-[rgba(124,77,255,0.18)] space-y-0">
          <DialogTitle className="text-base font-bold text-[#F5F0FF]">Editar usuário</DialogTitle>
          <button onClick={onClose} className="w-7 h-7 rounded-lg flex items-center justify-center text-[#6B4E8A] hover:text-[#F5F0FF] hover:bg-[rgba(124,77,255,0.12)] transition-colors">
            <X size={15} />
          </button>
        </DialogHeader>

        <div className="overflow-y-auto max-h-[78vh] px-7 py-6 space-y-7">

          {/* Informações da conta */}
          <div>
            <p className="text-sm font-bold text-[#F5F0FF] mb-0.5">Informações da conta</p>
            <p className="text-xs text-[#6B4E8A] mb-4">Defina um e-mail e senha para um novo usuário do Agendart.</p>
            <div className="grid grid-cols-2 gap-4">
              <FloatingField label="Email" required>
                <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} className={INPUT} />
              </FloatingField>
              <div className="relative">
                <label className={LBL}>Senha<span className="text-[#7C4DFF] ml-0.5">*</span></label>
                <div className="relative">
                  <input type={showSenha ? 'text' : 'password'} value={senha} onChange={(e) => setSenha(e.target.value)}
                    className={INPUT + ' pr-10'} />
                  <button type="button" onClick={() => setShowSenha((v) => !v)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-[#6B4E8A] hover:text-[#A78BCC] transition-colors">
                    {showSenha ? <EyeOff size={15} /> : <Eye size={15} />}
                  </button>
                </div>
              </div>
            </div>
          </div>

          {/* Informações pessoais */}
          <div>
            <p className="text-sm font-bold text-[#F5F0FF] mb-0.5">Informações pessoais</p>
            <p className="text-xs text-[#6B4E8A] mb-4">Defina os dados pessoais e o nível de permissão para este usuário.</p>
            <div className="grid grid-cols-2 gap-4">
              <FloatingField label="Nome" required>
                <input type="text" value={nome} onChange={(e) => setNome(e.target.value)} className={INPUT} />
              </FloatingField>
              <FloatingSelect label="Gênero" required options={GENEROS} value={genero} onChange={setGenero} />
              <div className="relative">
                <label className={LBL}>Código do País</label>
                <div className="flex gap-2">
                  <div className="flex items-center gap-1.5 bg-[#150830] border border-[rgba(124,77,255,0.25)] rounded-lg px-3 py-2.5 text-sm text-[#F5F0FF] cursor-pointer shrink-0">
                    🇧🇷 <span className="text-[#A78BCC] text-xs">Brasil</span> <ChevronDown size={11} className="text-[#6B4E8A]" />
                  </div>
                  <div className="relative flex-1">
                    <label className={LBL}>Telefone<span className="text-[#7C4DFF] ml-0.5">*</span></label>
                    <input type="text" value={telefone} onChange={(e) => setTelefone(e.target.value)}
                      placeholder="(00) 00000-0000" className={INPUT} />
                  </div>
                </div>
              </div>
              <FloatingSelect label="Nível de Permissão" required
                options={NIVEIS_PERMISSAO} value={nivelPermissao} onChange={setNivelPermissao} />
            </div>
          </div>

          {/* Informações profissionais */}
          <div>
            <p className="text-sm font-bold text-[#F5F0FF] mb-0.5">Informações profissionais</p>
            <p className="text-xs text-[#6B4E8A] mb-4">Ao registrar um profissional, o mesmo estará disponível para agendamentos no calendário.</p>
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
                  <ChevronDown size={13} className="absolute right-3 top-1/2 -translate-y-1/2 text-[#A78BCC] pointer-events-none" />
                </div>
              </div>
              <FloatingField label="Número do conselho">
                <input type="text" value={numeroConselho} onChange={(e) => setNumeroConselho(e.target.value)} className={INPUT} />
              </FloatingField>
            </div>

            {/* Horário personalizado toggle */}
            <label className="flex items-center gap-3 mt-5 cursor-pointer select-none">
              <button type="button" onClick={() => setHorarioPersonalizado((v) => !v)}
                className={`relative w-9 h-5 rounded-full transition-colors flex-shrink-0 ${horarioPersonalizado ? 'bg-[#7C4DFF]' : 'bg-[rgba(124,77,255,0.20)]'}`}>
                <div className={`absolute top-0.5 w-4 h-4 rounded-full bg-white shadow transition-transform ${horarioPersonalizado ? 'translate-x-4' : 'translate-x-0.5'}`} />
              </button>
              <span className="text-sm text-[#A78BCC]">Configurar horários personalizados de atendimento para este profissional?</span>
            </label>

            {/* ── Horários expandidos ──────────────────────────────────── */}
            {horarioPersonalizado && (
              <div className="mt-4 space-y-5">
                <p className="text-xs text-[#6B4E8A]">Configure os horários de atendimento deste profissional abaixo:</p>

                {/* Horários de Funcionamento */}
                <div>
                  <p className="text-sm font-semibold text-[#F5F0FF] mb-3">Horários de Funcionamento</p>
                  <div className="space-y-3">
                    {horarios.map((row, idx) => (
                      <div key={row.dia} className="flex items-center gap-3">
                        <span className="w-8 text-sm text-[#A78BCC] flex-shrink-0">{row.dia}:</span>
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
                          <span className="text-sm text-[#A78BCC]">Aberto</span>
                        </label>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Horário de Almoço */}
                <div>
                  <p className="text-sm font-semibold text-[#F5F0FF] mb-3">Horário de Almoço</p>
                  <label className="flex items-center gap-2 mb-3 cursor-pointer">
                    <input type="checkbox" checked={almoco} onChange={(e) => setAlmoco(e.target.checked)}
                      className="w-4 h-4 rounded accent-[#7C4DFF] cursor-pointer" />
                    <span className="text-sm text-[#A78BCC]">Ativar Horário de Almoço</span>
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
        <div className="flex items-center justify-end gap-3 px-7 py-5 border-t border-[rgba(124,77,255,0.18)]">
          <button onClick={onClose} className="px-5 py-2 rounded-lg text-sm font-medium text-[#A78BCC] border border-[rgba(124,77,255,0.25)] hover:border-[#7C4DFF] hover:text-[#F5F0FF] transition-colors">Cancelar</button>
          <button onClick={onClose} className="px-5 py-2 rounded-lg text-sm font-bold text-white bg-[#7C4DFF] hover:bg-[#5B21B6] transition-colors">Salvar</button>
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
        className={`relative w-9 h-5 rounded-full transition-colors flex-shrink-0 ${checked ? 'bg-[#7C4DFF]' : 'bg-[rgba(124,77,255,0.20)]'}`}>
        <div className={`absolute top-0.5 w-4 h-4 rounded-full bg-white shadow transition-transform ${checked ? 'translate-x-4' : 'translate-x-0.5'}`} />
      </button>
      <span className="text-sm text-[#A78BCC]">{label}</span>
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
}: {
  open: boolean
  onClose: () => void
}) {
  const [showSenha,      setShowSenha]      = useState(false)
  const [nivelPermissao, setNivelPermissao] = useState('Assistente')
  const [genero,         setGenero]         = useState('Masculino')
  const [toggles,        setToggles]        = useState<PermToggles>(getDefaultToggles('Assistente'))

  function handleNivel(v: string) {
    setNivelPermissao(v)
    setToggles(getDefaultToggles(v))
  }
  function setToggle(key: keyof PermToggles, v: boolean) {
    setToggles((prev) => ({ ...prev, [key]: v }))
  }

  const isProf    = nivelPermissao === 'Profissional / ADM' || nivelPermissao === 'Profissional Simples'
  const isSimples = nivelPermissao === 'Profissional Simples'

  const FIELD = 'w-full bg-[#150830] border border-[rgba(124,77,255,0.25)] rounded-lg px-3 py-2.5 text-sm text-[#F5F0FF] placeholder:text-[#6B4E8A] focus:outline-none focus:border-[#7C4DFF] transition-colors'
  const LBL   = 'absolute -top-2 left-3 bg-[#1A0A38] px-1 text-[10px] text-[#A78BCC] leading-none'
  const SEL   = FIELD + ' appearance-none pr-8 cursor-pointer'

  function FloatInput({ label, type = 'text', placeholder, required }: { label: string; type?: string; placeholder?: string; required?: boolean }) {
    return (
      <div className="relative">
        <label className={LBL}>{label}{required && <span className="text-[#7C4DFF] ml-0.5">*</span>}</label>
        <input type={type} placeholder={placeholder} className={FIELD} />
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
          <ChevronDown size={13} className="absolute right-3 top-1/2 -translate-y-1/2 text-[#A78BCC] pointer-events-none" />
        </div>
      </div>
    )
  }

  return (
    <Dialog open={open} onOpenChange={(v: boolean) => { if (!v) onClose() }}>
      <DialogContent
        showCloseButton={false}
        className="bg-[#1A0A38] border border-[rgba(124,77,255,0.30)] text-[#F5F0FF] !max-w-2xl p-0 gap-0 overflow-hidden rounded-2xl"
      >
        <DialogHeader className="flex-row items-center justify-between px-7 py-5 border-b border-[rgba(124,77,255,0.18)] space-y-0">
          <DialogTitle className="text-base font-bold text-[#F5F0FF]">Cadastrar novo usuário</DialogTitle>
          <button onClick={onClose} className="w-7 h-7 rounded-lg flex items-center justify-center text-[#6B4E8A] hover:text-[#F5F0FF] hover:bg-[rgba(124,77,255,0.12)] transition-colors">
            <X size={15} />
          </button>
        </DialogHeader>

        <div className="overflow-y-auto max-h-[80vh] px-7 py-6 space-y-6">

          {/* ── Informações da conta ── */}
          <div>
            <p className="text-sm font-bold text-[#F5F0FF] mb-0.5">Informações da conta</p>
            <p className="text-xs text-[#6B4E8A] mb-4">Defina um e-mail e senha para um novo usuário do Agendart.</p>
            <div className="grid grid-cols-2 gap-4">
              <FloatInput label="Email" type="email" required />
              <div className="relative">
                <label className={LBL}>Senha<span className="text-[#7C4DFF] ml-0.5">*</span></label>
                <div className="relative">
                  <input type={showSenha ? 'text' : 'password'} className={FIELD + ' pr-10'} />
                  <button type="button" onClick={() => setShowSenha((p) => !p)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-[#6B4E8A] hover:text-[#A78BCC] transition-colors">
                    {showSenha ? <EyeOff size={15} /> : <Eye size={15} />}
                  </button>
                </div>
              </div>
            </div>
          </div>

          {/* ── Permissões ── */}
          <div className="space-y-3">
            <p className="text-xs font-semibold text-[#6B4E8A] uppercase tracking-widest">Permissões deste usuário</p>
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
            <p className="text-sm font-bold text-[#F5F0FF] mb-0.5">Informações pessoais</p>
            <p className="text-xs text-[#6B4E8A] mb-4">Defina os dados pessoais e o nível de permissão para este novo usuário.</p>
            <div className="grid grid-cols-2 gap-4">
              <FloatInput label="Nome" required />
              <FloatSel label="Gênero" required options={GENEROS} value={genero} onChange={setGenero} />
              <div className="relative">
                <label className={LBL}>Código do País</label>
                <div className="flex gap-2">
                  <div className="flex items-center gap-1.5 bg-[#150830] border border-[rgba(124,77,255,0.25)] rounded-lg px-3 py-2.5 text-sm text-[#F5F0FF] cursor-pointer shrink-0">
                    🇧🇷 <span className="text-[#A78BCC] text-xs">Brasil</span> <ChevronDown size={11} className="text-[#6B4E8A]" />
                  </div>
                  <div className="relative flex-1">
                    <label className={LBL}>Telefone</label>
                    <input type="text" placeholder="(00) 00000-0000" className={FIELD} />
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
              <p className="text-sm font-bold text-[#F5F0FF] mb-0.5">Informações profissionais</p>
              <p className="text-xs text-[#6B4E8A] mb-4">Ao registrar um profissional, o mesmo estará disponível para agendamentos no calendário.</p>
              <div className="grid grid-cols-2 gap-4">
                <FloatInput label="CEP" />
                <FloatInput label="Logradouro" />
                <FloatInput label="Número" />
                <FloatInput label="Complemento" />
                <FloatInput label="Bairro" />
                <FloatInput label="Cidade" />
                <div className="relative">
                  <label className={LBL}>Duração da sessão<span className="text-[#7C4DFF] ml-0.5">*</span></label>
                  <div className="relative">
                    <select defaultValue="" className={SEL}>
                      <option value="" disabled>Selecione uma duração</option>
                      {DURACOES.map((d) => <option key={d} value={d}>{d}</option>)}
                    </select>
                    <ChevronDown size={13} className="absolute right-3 top-1/2 -translate-y-1/2 text-[#A78BCC] pointer-events-none" />
                  </div>
                </div>
                <div className="relative">
                  <label className={LBL}>Tipo<span className="text-[#7C4DFF] ml-0.5">*</span></label>
                  <div className="relative">
                    <select defaultValue="" className={SEL}>
                      <option value="" disabled>Selecione um tipo</option>
                      {TIPOS_PROF.map((t) => <option key={t} value={t}>{t}</option>)}
                    </select>
                    <ChevronDown size={13} className="absolute right-3 top-1/2 -translate-y-1/2 text-[#A78BCC] pointer-events-none" />
                  </div>
                </div>
                <FloatInput label="Especialidade" />
                <div className="relative">
                  <label className={LBL}>Conselho</label>
                  <div className="relative">
                    <select defaultValue="" className={SEL}>
                      <option value="" disabled>Selecione um conselho</option>
                      {CONSELHOS.map((c) => <option key={c} value={c}>{c}</option>)}
                    </select>
                    <ChevronDown size={13} className="absolute right-3 top-1/2 -translate-y-1/2 text-[#A78BCC] pointer-events-none" />
                  </div>
                </div>
                <FloatInput label="Número do conselho" />
              </div>
            </div>
          )}

        </div>

        <div className="flex items-center justify-end gap-3 px-7 py-5 border-t border-[rgba(124,77,255,0.18)]">
          <button onClick={onClose} className="px-5 py-2 rounded-lg text-sm font-medium text-[#A78BCC] border border-[rgba(124,77,255,0.25)] hover:border-[#7C4DFF] hover:text-[#F5F0FF] transition-colors">Cancelar</button>
          <button className="px-5 py-2 rounded-lg text-sm font-bold text-white bg-[#7C4DFF] hover:bg-[#5B21B6] transition-colors">Cadastrar</button>
        </div>
      </DialogContent>
    </Dialog>
  )
}

// ─── UsuariosView ─────────────────────────────────────────────────────────────
export function UsuariosView() {
  const [search, setSearch] = useState('')
  const [especialidade, setEspecialidade] = useState('')
  const [niveisSelected, setNiveisSelected] = useState<string[]>([])
  const [modalOpen, setModalOpen] = useState(false)
  const [editarUsuario, setEditarUsuario] = useState<Usuario | null>(null)
  const [page, setPage] = useState(1)
  const [rowsPerPage, setRowsPerPage] = useState(10)

  // Filtering
  const filtered = MOCK_USUARIOS.filter((u) => {
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
    <div className="min-h-full bg-[#0D0520]">
      {/* Page header */}
      <div className="flex items-center justify-between px-6 py-4 border-b border-[rgba(124,77,255,0.12)]">
        <div>
          <h2 className="text-lg font-bold text-[#F5F0FF]">Profissionais da Clínica</h2>
          <p className="text-xs text-[#6B4E8A] mt-0.5">
            Crie e gerencie os perfis dos profissionais cadastrados dentro da clínica.
          </p>
        </div>
        <button
          onClick={() => setModalOpen(true)}
          className="flex items-center gap-2 px-4 py-2 rounded-md text-sm font-bold text-white bg-[#7C4DFF] hover:bg-[#5B21B6] transition-colors"
        >
          <Plus size={15} />
          Novo Usuário
        </button>
      </div>

      {/* Filters */}
      <div className="px-6 py-4 flex flex-wrap items-center gap-3">
        {/* Search */}
        <div className="flex items-center gap-2 flex-1 min-w-[200px] bg-[#150830] border border-[rgba(124,77,255,0.25)] rounded-md px-3 py-2.5 focus-within:border-[#7C4DFF] transition-colors">
          <Search size={14} className="text-[#6B4E8A] shrink-0" />
          <input
            value={search}
            onChange={(e) => { setSearch(e.target.value); setPage(1) }}
            placeholder="Pesquisar por nome ou email"
            className="bg-transparent text-sm text-[#F5F0FF] placeholder:text-[#6B4E8A] focus:outline-none w-full"
          />
          {search && (
            <button onClick={() => setSearch('')} className="text-[#6B4E8A] hover:text-[#F5F0FF] transition-colors">
              <X size={13} />
            </button>
          )}
        </div>

        {/* Especialidade */}
        <div className="relative min-w-[200px]">
          <select
            value={especialidade}
            onChange={(e) => { setEspecialidade(e.target.value); setPage(1) }}
            className="w-full bg-[#150830] border border-[rgba(124,77,255,0.25)] rounded-md px-3 py-2.5 text-sm appearance-none cursor-pointer transition-colors focus:outline-none focus:border-[#7C4DFF] pr-8"
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
              className="absolute right-7 top-1/2 -translate-y-1/2 text-[#6B4E8A] hover:text-[#F5F0FF] transition-colors"
            >
              <X size={12} />
            </button>
          ) : null}
          <ChevronDown size={13} className="absolute right-3 top-1/2 -translate-y-1/2 text-[#A78BCC] pointer-events-none" />
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
            className="flex items-center gap-1.5 px-4 py-2.5 rounded-md text-sm font-medium text-[#A78BCC] border border-[rgba(124,77,255,0.25)] hover:border-[#7C4DFF] hover:text-[#F5F0FF] transition-colors"
          >
            <Trash2 size={13} />
            Limpar Filtros
          </button>
        )}
      </div>

      {/* Table */}
      <div className="px-6">
        <div className="rounded-xl border border-[rgba(124,77,255,0.18)] overflow-hidden">
          {/* Head */}
          <div className="grid grid-cols-[2fr_2fr_1.5fr_1.5fr_auto] gap-0 bg-[rgba(124,77,255,0.06)] border-b border-[rgba(124,77,255,0.18)]">
            {['NOME', 'EMAIL', 'TELEFONE', 'TIPO DE ACESSO', 'DELETAR'].map((col, i) => (
              <div
                key={col}
                className={`px-4 py-3 text-[10px] font-semibold tracking-wider text-[#6B4E8A] uppercase ${i === 4 ? 'text-center w-28' : ''}`}
              >
                {col}
              </div>
            ))}
          </div>

          {/* Rows */}
          {paginated.length === 0 ? (
            <div className="flex items-center justify-center py-12 text-sm text-[#6B4E8A]">
              Nenhum usuário encontrado
            </div>
          ) : (
            paginated.map((u, i) => (
              <div
                key={u.id}
                className={`grid grid-cols-[2fr_2fr_1.5fr_1.5fr_auto] items-center gap-0 border-b border-[rgba(124,77,255,0.10)] transition-colors hover:bg-[rgba(124,77,255,0.05)] cursor-pointer ${i % 2 === 1 ? 'bg-[rgba(124,77,255,0.02)]' : ''}`}
                onClick={() => setEditarUsuario(u)}
              >
                {/* Nome */}
                <div className="px-4 py-3.5 flex items-center gap-3">
                  <Avatar nome={u.nome} />
                  <div>
                    <p className="text-sm font-semibold text-[#F5F0FF] leading-snug">{u.nome}</p>
                    <p className="text-xs text-[#7C4DFF]">{u.especialidade}</p>
                  </div>
                </div>

                {/* Email */}
                <div className="px-4 py-3.5">
                  <p className="text-sm text-[#A78BCC] truncate">{u.email}</p>
                </div>

                {/* Telefone */}
                <div className="px-4 py-3.5">
                  <p className="text-sm text-[#A78BCC]">{u.telefone}</p>
                </div>

                {/* Tipo de acesso */}
                <div className="px-4 py-3.5">
                  <span className="inline-flex items-center px-2.5 py-1 rounded-md text-xs font-semibold bg-[rgba(124,77,255,0.20)] text-[#C084FC] border border-[rgba(124,77,255,0.30)]">
                    {u.tipoAcesso}
                  </span>
                </div>

                {/* Deletar */}
                <div className="px-4 py-3.5 w-28 flex justify-center">
                  {u.proprietario ? (
                    <span className="text-xs text-[#7C4DFF] font-medium whitespace-nowrap">
                      * Proprietário da Clínica
                    </span>
                  ) : (
                    <button
                      onClick={(e) => { e.stopPropagation(); /* delete */ }}
                      className="w-8 h-8 rounded-md flex items-center justify-center text-[#EF4444] hover:bg-[rgba(239,68,68,0.12)] transition-colors">
                      <Trash2 size={15} />
                    </button>
                  )}
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
                : 'text-[#A78BCC] hover:text-[#F5F0FF] hover:bg-[rgba(124,77,255,0.12)]'
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
            className="bg-[#150830] border border-[rgba(124,77,255,0.25)] rounded-md pl-3 pr-7 py-1.5 text-sm text-[#F5F0FF] appearance-none cursor-pointer focus:outline-none focus:border-[#7C4DFF] transition-colors"
          >
            {ROWS_OPTIONS.map((r) => (
              <option key={r} value={r} style={{ background: '#1A0A38' }}>{r}</option>
            ))}
          </select>
          <ChevronDown size={12} className="absolute right-2.5 top-1/2 -translate-y-1/2 text-[#A78BCC] pointer-events-none" />
        </div>
      </div>

      {/* Modal Cadastrar */}
      <CadastrarUsuarioModal open={modalOpen} onClose={() => setModalOpen(false)} />
      {/* Modal Editar */}
      {editarUsuario && <EditarUsuarioModal usuario={editarUsuario} onClose={() => setEditarUsuario(null)} />}
    </div>
  )
}
