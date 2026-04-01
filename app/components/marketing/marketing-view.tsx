'use client'

import { useState } from 'react'
import {
  ChevronDown, Copy, ExternalLink, AlertTriangle, Globe, User,
  MapPin, Share2, Clock, Check, X, Info,
  type LucideIcon,
} from 'lucide-react'

// ─── Shared styles ────────────────────────────────────────────────────────────
const INP =
  'w-full bg-[#0D0520] border border-[rgba(124,77,255,0.25)] rounded-md ' +
  'px-3 py-2.5 text-sm text-[#F5F0FF] placeholder:text-[#6B4E8A] ' +
  'focus:outline-none focus:border-[#7C4DFF] transition-colors'
const LBG = 'bg-[#0D0520]'
const BTN_GHOST =
  'px-4 py-2 rounded-md text-sm font-medium text-[#A78BCC] border border-[rgba(124,77,255,0.25)] hover:border-[#7C4DFF] hover:text-[#F5F0FF] transition-colors'
const BTN_PRIMARY =
  'px-5 py-2 rounded-md text-sm font-bold text-white bg-[#7C4DFF] hover:bg-[#5B21B6] transition-colors'

// ─── FInput ───────────────────────────────────────────────────────────────────
function FInput({ label, req, val, placeholder, prefix, type = 'text', hint }: {
  label: string; req?: boolean; val?: string; placeholder?: string; prefix?: string; type?: string; hint?: string
}) {
  return (
    <div className="relative">
      <label className={`absolute -top-2 left-3 z-10 ${LBG} px-1 text-[10px] font-medium text-[#A78BCC] leading-none`}>
        {label}{req && <span className="text-[#7C4DFF] ml-0.5">*</span>}
      </label>
      {prefix ? (
        <div className="flex bg-[#0D0520] border border-[rgba(124,77,255,0.25)] rounded-md overflow-hidden focus-within:border-[#7C4DFF] transition-colors">
          <span className="flex items-center px-3 text-xs text-[#6B4E8A] border-r border-[rgba(124,77,255,0.18)] shrink-0 whitespace-nowrap">
            {prefix}
          </span>
          <input type={type} defaultValue={val} placeholder={placeholder} className="bg-transparent flex-1 px-3 py-2.5 text-sm text-[#F5F0FF] placeholder:text-[#6B4E8A] focus:outline-none" />
        </div>
      ) : (
        <input type={type} defaultValue={val} placeholder={placeholder} className={INP} />
      )}
      {hint && <p className="text-[10px] text-[#6B4E8A] mt-1">{hint}</p>}
    </div>
  )
}

// ─── FSelect ──────────────────────────────────────────────────────────────────
function FSelect({ label, req, opts, val }: {
  label: string; req?: boolean; opts: string[]; val?: string
}) {
  return (
    <div className="relative">
      <label className={`absolute -top-2 left-3 z-10 ${LBG} px-1 text-[10px] font-medium text-[#A78BCC] leading-none`}>
        {label}{req && <span className="text-[#7C4DFF] ml-0.5">*</span>}
      </label>
      <div className="relative">
        <select defaultValue={val ?? ''} className={INP + ' appearance-none pr-8 cursor-pointer'}>
          {opts.map((o) => <option key={o} value={o}>{o}</option>)}
        </select>
        <ChevronDown size={13} className="absolute right-3 top-1/2 -translate-y-1/2 text-[#A78BCC] pointer-events-none" />
      </div>
    </div>
  )
}

// ─── FTextarea ────────────────────────────────────────────────────────────────
function FTextarea({ label, req, placeholder, rows = 4 }: {
  label: string; req?: boolean; placeholder?: string; rows?: number
}) {
  return (
    <div className="relative">
      <label className="text-xs font-medium text-[#A78BCC] block mb-1.5">
        {label}{req && <span className="text-[#7C4DFF] ml-0.5">*</span>}
      </label>
      <div className="rounded-md border border-[rgba(124,77,255,0.25)] bg-[#0D0520] focus-within:border-[#7C4DFF] transition-colors overflow-hidden">
        <textarea
          rows={rows}
          placeholder={placeholder}
          className="w-full bg-transparent px-3 py-2.5 text-sm text-[#F5F0FF] placeholder:text-[#6B4E8A] focus:outline-none resize-none"
        />
      </div>
    </div>
  )
}

// ─── Toggle ──────────────────────────────────────────────────────────────────
function Toggle({ on, set }: { on: boolean; set: (v: boolean) => void }) {
  return (
    <button
      type="button"
      onClick={() => set(!on)}
      className={`relative w-10 h-5 rounded-full transition-colors shrink-0 ${on ? 'bg-[#7C4DFF]' : 'bg-[#2D1B4E]'}`}
    >
      <span className={`absolute top-0.5 w-4 h-4 rounded-full bg-white shadow transition-transform ${on ? 'translate-x-5' : 'translate-x-0.5'}`} />
    </button>
  )
}

// ─── Horary table ─────────────────────────────────────────────────────────────
const DAYS_INIT = [
  { label: 'Seg:', aber: '09:00', fec: '18:00', aberto: false },
  { label: 'Ter:', aber: '09:00', fec: '18:00', aberto: false },
  { label: 'Qua:', aber: '09:00', fec: '18:00', aberto: false },
  { label: 'Qui:', aber: '09:00', fec: '18:00', aberto: false },
  { label: 'Sex:', aber: '09:00', fec: '18:00', aberto: false },
  { label: 'Sáb:', aber: '09:00', fec: '18:00', aberto: false },
  { label: 'Dom:', aber: '09:00', fec: '18:00', aberto: false },
]

function HorarioTable() {
  const [days, setDays] = useState(DAYS_INIT)
  return (
    <div className="space-y-2.5">
      {days.map((d, i) => (
        <div key={d.label} className="flex items-center gap-3">
          <span className="text-sm font-medium text-[#A78BCC] w-10 shrink-0">{d.label}</span>
          <div className="relative flex-1">
            <label className={`absolute -top-2 left-3 z-10 ${LBG} px-1 text-[10px] font-medium text-[#A78BCC] leading-none`}>Abertura</label>
            <input type="time" defaultValue={d.aber} disabled={!d.aberto} className={INP + (!d.aberto ? ' opacity-40 cursor-not-allowed' : '')} />
          </div>
          <div className="relative flex-1">
            <label className={`absolute -top-2 left-3 z-10 ${LBG} px-1 text-[10px] font-medium text-[#A78BCC] leading-none`}>Fechamento</label>
            <input type="time" defaultValue={d.fec} disabled={!d.aberto} className={INP + (!d.aberto ? ' opacity-40 cursor-not-allowed' : '')} />
          </div>
          <label className="flex items-center gap-2 cursor-pointer">
            <input
              type="checkbox"
              checked={d.aberto}
              onChange={() => setDays((prev) => prev.map((x, j) => j === i ? { ...x, aberto: !x.aberto } : x))}
              className="accent-[#7C4DFF] w-4 h-4"
            />
            <span className="text-sm text-[#A78BCC]">Aberto</span>
          </label>
        </div>
      ))}
    </div>
  )
}

// ─── TAB: AUTO AGENDAMENTO ────────────────────────────────────────────────────
function TabAutoAgendamento() {
  const [disponivel, setDisponivel] = useState(true)
  const [showForm, setShowForm] = useState(false)

  return (
    <div className="space-y-6">
      {/* Hero banner */}
      <div className="rounded-xl bg-gradient-to-r from-[#E8F4FD] to-[#D0EBFF] border border-[rgba(56,189,248,0.3)] p-5 flex items-center gap-5">
        <div className="w-20 h-20 rounded-xl bg-[#3B82F6] flex items-center justify-center shrink-0">
          <svg viewBox="0 0 80 80" width="80" height="80" fill="none">
            <rect width="80" height="80" rx="12" fill="#3B82F6" />
            <rect x="12" y="16" width="56" height="48" rx="4" fill="white" opacity="0.9" />
            <rect x="20" y="8" width="8" height="16" rx="4" fill="#1D4ED8" />
            <rect x="52" y="8" width="8" height="16" rx="4" fill="#1D4ED8" />
            <rect x="20" y="36" width="40" height="6" rx="2" fill="#3B82F6" opacity="0.4" />
            <rect x="20" y="48" width="24" height="6" rx="2" fill="#3B82F6" opacity="0.4" />
            <circle cx="58" cy="51" r="10" fill="#22C55E" />
            <path d="M53 51l3 3 6-6" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        </div>
        <div>
          <div className="flex items-center gap-1.5 mb-1">
            <div className="w-4 h-4 rounded-full bg-[#7C4DFF] flex items-center justify-center shrink-0">
              <Info size={10} className="text-white" />
            </div>
            <h3 className="text-base font-bold text-[#1E3A5F]">Auto Agendamento</h3>
          </div>
          <p className="text-sm text-[#374151]">
            Com a funcionalidade de Auto Agendamento, os seus clientes terão a possibilidade de realizar os próprios agendamentos das suas consultas.
            Divulgue seu link de Auto Agendamento em suas redes sociais, sites, WhatsApp etc.
          </p>
        </div>
      </div>

      {/* Profissional disponível */}
      <div className="flex items-center justify-between">
        <h3 className="text-sm font-semibold text-[#F5F0FF]">Auto Agendamento</h3>
        <div className="flex items-center gap-2">
          <span className="text-xs text-[#A78BCC]">Profissional Disponível?</span>
          <div className="flex rounded-md overflow-hidden border border-[rgba(124,77,255,0.25)]">
            <button
              onClick={() => setDisponivel(true)}
              className={`px-3 py-1.5 text-xs font-semibold transition-colors ${disponivel ? 'bg-[#7C4DFF] text-white' : 'text-[#A78BCC] hover:text-[#F5F0FF]'}`}
            >Sim</button>
            <button
              onClick={() => setDisponivel(false)}
              className={`px-3 py-1.5 text-xs font-semibold transition-colors ${!disponivel ? 'bg-[#EF4444] text-white' : 'text-[#A78BCC] hover:text-[#F5F0FF]'}`}
            >Não</button>
          </div>
        </div>
      </div>
      <p className="text-xs text-[#A78BCC] -mt-4">Configure e acesse as configurações do Auto Agendamento do profissional.</p>

      {/* Links */}
      <div className="grid grid-cols-2 gap-4">
        {[
          { label: 'Link Global da Clínica',   val: 'https://agendart.tech/aa/210013315588a' },
          { label: 'Link do Profissional',      val: 'https://agendart.tech/aa/320401917c684' },
        ].map(({ label, val }) => (
          <div key={label}>
            <p className="text-xs font-medium text-[#A78BCC] mb-1.5">{label}</p>
            <div className="flex items-center gap-2">
              <input readOnly value={val} className={INP + ' flex-1 text-xs'} />
              <button className="flex items-center gap-1.5 px-3 py-2 rounded-md bg-[rgba(124,77,255,0.12)] text-[#7C4DFF] text-xs font-semibold border border-[rgba(124,77,255,0.25)] hover:border-[#7C4DFF] transition-colors shrink-0">
                <Copy size={12} />
                Copiar
              </button>
              <button className="flex items-center gap-1.5 px-3 py-2 rounded-md bg-[rgba(34,197,94,0.10)] text-[#22C55E] text-xs font-semibold border border-[rgba(34,197,94,0.2)] hover:border-[#22C55E] transition-colors shrink-0">
                <ExternalLink size={12} />
                Abrir
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* Dados do profissional */}
      <div className="grid grid-cols-3 gap-4">
        <FInput label="Nome"  req val="JESSE DOS SANTOS BEZERRA" />
        <FInput label="Email" req val="jesse.9001@gmail.com" />
        <FSelect label="Gênero" req opts={['Masculino', 'Feminino', 'Outro']} val="Masculino" />
        <FSelect label="Tipo" req opts={['Dentista', 'Médico', 'Fisioterapeuta', 'Psicólogo']} val="Dentista" />
        <FInput label="Especialidade" />
        <FSelect label="Conselho" opts={['Selecione um conselho', 'CRO', 'CFM', 'CREFITO']} val="Selecione um conselho" />
        <FInput label="Número do conselho" />
        <FSelect label="Duração da sessão" req opts={['30 minutos', '40 minutos', '50 minutos', '60 minutos']} val="40 minutos" />
        <FInput label="CEP" req val="54410-390" />
        <FInput label="Logradouro" req val="Rua José Braz Moscow" />
        <div className="grid grid-cols-2 gap-3">
          <FInput label="Número"     req val="61" />
          <FInput label="Complemento" />
        </div>
        <FInput label="Bairro" req val="Piedade" />
        <FInput label="Celular"            req val="(81) 99708-8404" />
        <FInput label="Telefone comercial" />
      </div>

      <div className="grid grid-cols-2 gap-4">
        <FSelect label="Período mínimo para agendamento" opts={['A partir de amanhã', 'A partir de hoje', 'Em 2 dias', 'Em 3 dias']} val="A partir de amanhã" />
        <FSelect label="Período máximo para agendamento" opts={['Até 8 semanas', 'Até 4 semanas', 'Até 2 semanas', 'Sem limite']} val="Até 8 semanas" />
        <FSelect label="Tempo de Antecedência para Edição" opts={['Sem restrição', '24 horas', '48 horas', '1 semana']} val="Sem restrição" />
      </div>

      <div>
        <p className="text-sm font-semibold text-[#F5F0FF] mb-2">Observações</p>
        <div className="rounded-md border border-[rgba(124,77,255,0.25)] bg-[#0D0520] focus-within:border-[#7C4DFF] transition-colors overflow-hidden">
          <div className="flex items-center gap-1 px-3 py-2 border-b border-[rgba(124,77,255,0.15)] flex-wrap">
            {['Parágrafo', 'B', 'I', 'U'].map((t) => (
              <button key={t} className="px-2 py-0.5 rounded text-xs text-[#A78BCC] hover:bg-[rgba(124,77,255,0.12)] transition-colors">{t}</button>
            ))}
          </div>
          <textarea rows={4} className="w-full bg-transparent px-3 py-2.5 text-sm text-[#F5F0FF] placeholder:text-[#6B4E8A] focus:outline-none resize-none" />
        </div>
      </div>

      <div className="flex justify-end pt-4 border-t border-[rgba(124,77,255,0.12)]">
        <button className={BTN_PRIMARY}>Salvar</button>
      </div>
    </div>
  )
}

// ─── TAB: MEU SITE & BLOG ─────────────────────────────────────────────────────
function TabMeuSite() {
  const [showForm, setShowForm] = useState(false)

  return (
    <div className="space-y-6">
      {/* Hero banner */}
      <div className="rounded-xl bg-gradient-to-r from-[#E8F4FD] to-[#D0EBFF] border border-[rgba(56,189,248,0.3)] p-5 flex items-center gap-5">
        <div className="w-20 h-20 rounded-xl bg-[#3B82F6] flex items-center justify-center shrink-0">
          <svg viewBox="0 0 80 80" width="80" height="80" fill="none">
            <rect width="80" height="80" rx="12" fill="#3B82F6" />
            <rect x="8" y="16" width="64" height="48" rx="4" fill="white" opacity="0.9" />
            <rect x="8" y="16" width="64" height="10" rx="4" fill="#1D4ED8" opacity="0.7" />
            <circle cx="16" cy="21" r="3" fill="white" />
            <circle cx="26" cy="21" r="3" fill="white" />
            <circle cx="36" cy="21" r="3" fill="white" />
            <rect x="16" y="34" width="20" height="20" rx="2" fill="#7C4DFF" opacity="0.5" />
            <rect x="42" y="34" width="22" height="6" rx="2" fill="#3B82F6" opacity="0.4" />
            <rect x="42" y="44" width="14" height="6" rx="2" fill="#3B82F6" opacity="0.4" />
          </svg>
        </div>
        <div>
          <div className="flex items-center gap-1.5 mb-1">
            <div className="w-4 h-4 rounded-full bg-[#7C4DFF] flex items-center justify-center shrink-0">
              <Info size={10} className="text-white" />
            </div>
            <h3 className="text-base font-bold text-[#1E3A5F]">Meu Site & Blog</h3>
          </div>
          <p className="text-sm text-[#374151]">
            Tenha um site profissional para seu consultório divulgando seus serviços e uma plataforma para criar um blog, compartilhar artigos e informações relevantes para seus clientes. Tudo é fácil de configurar e atualizar. Aproveite essa funcionalidade para divulgar seu trabalho na internet.
          </p>
        </div>
      </div>

      {!showForm ? (
        <div className="space-y-3">
          <p className="text-sm text-[#A78BCC]">
            Este profissional ainda não tem um website configurado. <span className="text-[#7C4DFF]">Comece agora a sua configuração.</span>
          </p>
          <div className="flex items-center gap-3">
            <button onClick={() => setShowForm(true)} className={BTN_PRIMARY}>Configurar website</button>
            <button className="text-sm text-[#7C4DFF] hover:text-[#A78BCC] transition-colors">Saiba Mais</button>
          </div>
        </div>
      ) : (
        <div className="space-y-5">
          <div className="flex items-center gap-3">
            <button onClick={() => setShowForm(false)} className={BTN_PRIMARY}>Ocultar formulário</button>
            <button className="text-sm text-[#7C4DFF] hover:text-[#A78BCC] transition-colors">Saiba Mais</button>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <FInput label="Nome" req />
            <FInput
              label="Link da Página"
              req
              prefix="https://agendart.tech/p/"
              placeholder="exemplo-de-link"
              hint="Este será o link público para acessar este site."
            />
          </div>

          <FTextarea label="Sobre mim" req rows={5} placeholder="Descrição sobre o trabalho e/ou experiências do profissional" />

          <div>
            <h4 className="text-sm font-semibold text-[#F5F0FF] mb-0.5">Contatos para realizar agendamento</h4>
            <p className="text-xs text-[#A78BCC] mb-4">Informe ao menos um contato para que os pacientes possam realizar agendamentos.</p>
            <div className="grid grid-cols-3 gap-4">
              <FInput label="Email" req />
              <FInput label="Telefone" req />
              <FInput label="WhatsApp" req />
            </div>
          </div>

          <div className="flex justify-end pt-4 border-t border-[rgba(124,77,255,0.12)]">
            <button className={BTN_PRIMARY}>Salvar</button>
          </div>
        </div>
      )}
    </div>
  )
}

// ─── TAB: VENDA MAIS (Buscador Agendart) ─────────────────────────────────────
type BuscadorSubTab = 'pessoais' | 'profissionais' | 'endereco' | 'redes'

const BUSCADOR_SUB: { id: BuscadorSubTab; label: string }[] = [
  { id: 'pessoais',      label: 'Informações pessoais' },
  { id: 'profissionais', label: 'Informações profissionais' },
  { id: 'endereco',      label: 'Endereço de Atendimento (Se Houver)' },
  { id: 'redes',         label: 'Redes Sociais e Contatos' },
]

function TabVendaMais() {
  const [subTab, setSubTab] = useState<BuscadorSubTab>('pessoais')

  const content = (() => {
    switch (subTab) {
      case 'pessoais': return (
        <div className="space-y-5 pt-5">
          <div>
            <p className="text-xs font-medium text-[#A78BCC] mb-2">Foto de Perfil<span className="text-[#7C4DFF] ml-0.5">*</span></p>
            <div className="w-24 h-24 rounded-xl bg-[#150830] border-2 border-dashed border-[rgba(124,77,255,0.25)] flex items-center justify-center cursor-pointer hover:border-[#7C4DFF] transition-colors">
              <User size={32} className="text-[#6B4E8A]" strokeWidth={1} />
            </div>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <FInput label="Nome" req />
          </div>
        </div>
      )
      case 'profissionais': return (
        <div className="space-y-5 pt-5">
          <FTextarea label="Descrição da Atuação" req rows={4} />
          <FTextarea label="Cursos e Certificações" req rows={3} />
          <div className="grid grid-cols-2 gap-4">
            <FInput label="Sigla e Número do Conselho" />
            <FSelect label="Faixa de Preço" req opts={['Selecione uma faixa de preço', 'R$ 0 – R$ 100', 'R$ 100 – R$ 200', 'R$ 200 – R$ 400', 'Acima de R$ 400']} val="Selecione uma faixa de preço" />
            <FSelect label="Modo de Atendimento" req opts={['Selecione uma opção', 'Presencial', 'Online', 'Ambos']} val="Selecione uma opção" />
            <FSelect label="Aceita convênio" req opts={['Selecione uma opção', 'Sim', 'Não']} val="Selecione uma opção" />
            <FSelect label="Especialidades" req opts={['Selecione uma especialidade', 'Clínico Geral', 'Ortodontia', 'Implantodontia', 'Pediatria']} val="Selecione uma especialidade" />
          </div>
          <div>
            <h4 className="text-sm font-semibold text-[#F5F0FF] mb-4">Horário de Funcionamento</h4>
            <HorarioTable />
          </div>
        </div>
      )
      case 'endereco': return (
        <div className="space-y-5 pt-5">
          <div className="grid grid-cols-2 gap-4">
            <FInput label="CEP" />
            <FInput label="Logradouro" />
            <FInput label="Número" />
            <FInput label="Complemento" />
            <FInput label="Bairro" />
            <FInput label="Cidade" />
          </div>
        </div>
      )
      case 'redes': return (
        <div className="space-y-5 pt-5">
          <div className="grid grid-cols-2 gap-4">
            <FInput label="WhatsApp" />
            <FInput label="Email" />
            <FInput label="Link do Website" />
            <FInput label="Instagram" prefix="https://instagram.com/" />
            <FInput label="Facebook"  prefix="https://facebook.com/" />
            <FInput label="LinkedIn"  prefix="https://linkedin.com/" />
            <FInput label="YouTube"   prefix="https://youtube.com/" />
            <FInput label="Twitter"   prefix="https://twitter.com/" />
          </div>
        </div>
      )
    }
  })()

  return (
    <div className="space-y-6">
      {/* Hero banner */}
      <div className="rounded-xl bg-gradient-to-r from-[#E8F4FD] to-[#D0EBFF] border border-[rgba(56,189,248,0.3)] p-5 flex items-center gap-5">
        <div className="w-20 h-20 rounded-xl bg-[#3B82F6] flex items-center justify-center shrink-0">
          <svg viewBox="0 0 80 80" width="80" height="80" fill="none">
            <rect width="80" height="80" rx="12" fill="#3B82F6" />
            <rect x="10" y="20" width="60" height="40" rx="4" fill="white" opacity="0.9" />
            <rect x="18" y="28" width="18" height="18" rx="2" fill="#7C4DFF" opacity="0.5" />
            <circle cx="18" cy="52" r="0" />
            <rect x="42" y="28" width="20" height="4" rx="2" fill="#1D4ED8" opacity="0.5" />
            <rect x="42" y="36" width="14" height="3" rx="1.5" fill="#1D4ED8" opacity="0.3" />
            <rect x="42" y="43" width="16" height="3" rx="1.5" fill="#1D4ED8" opacity="0.3" />
            <text x="23" y="42" fontSize="12" fontWeight="bold" fill="white" textAnchor="middle">AA</text>
          </svg>
        </div>
        <div>
          <div className="flex items-center gap-1.5 mb-1">
            <div className="w-4 h-4 rounded-full bg-[#7C4DFF] flex items-center justify-center shrink-0">
              <Info size={10} className="text-white" />
            </div>
            <h3 className="text-base font-bold text-[#1E3A5F]">Buscador Agendart</h3>
          </div>
          <p className="text-sm text-[#374151]">
            Preencha as informações profissionais e seja listado no buscador de profissionais do Agendart. Através dele você ganhará mais exposição e pacientes para suas consultas.
          </p>
        </div>
      </div>

      {/* Aviso perfil não publicado */}
      <div className="rounded-lg bg-[rgba(245,158,11,0.08)] border border-[rgba(245,158,11,0.25)] p-4 flex items-start gap-3">
        <div className="w-7 h-7 rounded-full bg-[rgba(245,158,11,0.15)] flex items-center justify-center shrink-0 mt-0.5">
          <AlertTriangle size={14} className="text-[#F59E0B]" />
        </div>
        <div>
          <p className="text-sm font-bold text-[#F59E0B]">Perfil não publicado!</p>
          <p className="text-xs text-[#F59E0B] opacity-80">
            O perfil deste profissional ainda não está publicado no buscador. Preencha as informações obrigatórias* para que seja publicado.
          </p>
        </div>
      </div>

      {/* Sub-tabs */}
      <div className="flex border-b border-[rgba(124,77,255,0.18)]">
        {BUSCADOR_SUB.map(({ id, label }) => (
          <button
            key={id}
            onClick={() => setSubTab(id)}
            className={`px-4 py-2.5 text-sm font-medium border-b-2 -mb-px transition-colors whitespace-nowrap ${
              subTab === id
                ? 'text-[#7C4DFF] border-[#7C4DFF]'
                : 'text-[#A78BCC] border-transparent hover:text-[#F5F0FF]'
            }`}
          >
            {label}
          </button>
        ))}
      </div>

      {content}

      <div className="flex justify-end pt-4 border-t border-[rgba(124,77,255,0.12)]">
        <button className={BTN_PRIMARY}>Salvar</button>
      </div>
    </div>
  )
}

// ─── Sub-tab nav ──────────────────────────────────────────────────────────────
type MktTab = 'auto' | 'site' | 'venda'

type MktTabDef = { id: MktTab; label: string; Icon: LucideIcon }

const MKT_TABS: MktTabDef[] = [
  { id: 'auto',  label: 'Auto\nAgendamento', Icon: Clock   },
  { id: 'site',  label: 'Meu Site & Blog',   Icon: Globe   },
  { id: 'venda', label: 'Venda Mais',         Icon: Share2  },
]

// ─── Main component ───────────────────────────────────────────────────────────
const PROFISSIONAIS = ['JESSE DOS SANTOS BEZERRA', 'Maria Silva', 'João Neto']

export function MarketingView() {
  const [profissional, setProfissional] = useState(PROFISSIONAIS[0])
  const [tab, setTab] = useState<MktTab>('auto')

  const content = (() => {
    switch (tab) {
      case 'auto':  return <TabAutoAgendamento />
      case 'site':  return <TabMeuSite />
      case 'venda': return <TabVendaMais />
    }
  })()

  return (
    <div className="p-8 space-y-6">
      {/* Header */}
      <div>
        <h2 className="text-base font-bold text-[#F5F0FF]">Configurações de Marketing</h2>
      </div>

      {/* Profissional selector */}
      <div>
        <p className="text-xs font-medium text-[#A78BCC] mb-1.5">Profissional</p>
        <div className="relative">
          <select
            value={profissional}
            onChange={(e) => setProfissional(e.target.value)}
            className={INP + ' appearance-none pr-8 cursor-pointer'}
          >
            <option value="">Selecione um profissional</option>
            {PROFISSIONAIS.map((p) => <option key={p} value={p}>{p}</option>)}
          </select>
          <ChevronDown size={13} className="absolute right-3 top-1/2 -translate-y-1/2 text-[#A78BCC] pointer-events-none" />
        </div>
      </div>

      {profissional && (
        <div className="flex gap-5">
          {/* Sub-menu lateral */}
          <aside className="flex flex-col w-[90px] shrink-0 gap-0.5">
            {MKT_TABS.map(({ id, label, Icon }) => {
              const active = tab === id
              return (
                <button
                  key={id}
                  onClick={() => setTab(id)}
                  className={`flex flex-col items-center gap-1 py-3 px-1 rounded-xl transition-all text-center ${
                    active ? 'bg-[rgba(124,77,255,0.15)]' : 'hover:bg-[rgba(124,77,255,0.08)]'
                  }`}
                >
                  <Icon size={20} color={active ? '#7C4DFF' : '#6B4E8A'} strokeWidth={active ? 2.5 : 1.5} />
                  <span className="text-[9px] font-medium leading-tight whitespace-pre-line" style={{ color: active ? '#7C4DFF' : '#6B4E8A' }}>
                    {label}
                  </span>
                </button>
              )
            })}
          </aside>

          {/* Conteúdo */}
          <div className="flex-1 min-w-0">
            {content}
          </div>
        </div>
      )}
    </div>
  )
}
