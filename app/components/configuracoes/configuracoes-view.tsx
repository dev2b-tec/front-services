'use client'

import { useState } from 'react'
import { useSearchParams } from 'next/navigation'
import {
  User, Calendar, Mail, ShoppingCart, Layers,
  LayoutGrid, Building2, ClipboardCheck, FileText, Lock,
  ChevronDown, HelpCircle, Check, MessageSquare,
  Search, Plus, Pencil, Trash2, Pin, X, AlertTriangle, Sparkles, Highlighter,
  type LucideIcon,
} from 'lucide-react'
import { INP, LBG, BTN_GHOST, BTN_PRIMARY, Toggle, Cbx, PhoneInput, SectionFooter } from './shared'
import { TabConta } from './tab-conta'
import { TabAgenda as TabAgendaNova } from './tab-agenda'
import { TabSenhas as TabSenhasNova } from './tab-senhas'
import { TabAnamneses as TabAnamnesesNova } from './tab-anamneses'
import { TabUnidades as TabUnidadesNova } from './tab-unidades'
import { TabSalas as TabSalasNova } from './tab-salas'
import { TabServicos as TabServicosNova } from './tab-servicos'
import { TabCreditos as TabCreditosNova } from './tab-creditos'
import { TabMensagens as TabMensagensNova } from './tab-mensagens'
import { TabNfse as TabNfseNova } from './tab-nfse'
import { TabWhatsapp } from './tab-whatsapp'
import { TabAssinatura } from './tab-assinatura'
import { TabMarcadores } from './tab-marcadores'
import type { UsuarioData, EmpresaData } from '@/app/dashboard/configuracoes/page'

// ─── Tab navigation ───────────────────────────────────────────────────────────
type TabDef = { id: string; label: string; Icon: LucideIcon; iconColor?: string }

const TABS: TabDef[] = [
  { id: 'conta',     label: 'Conta',     Icon: User },
  { id: 'agenda',    label: 'Agenda',    Icon: Calendar },
  { id: 'mensagens', label: 'Mensagens', Icon: Mail },
  { id: 'creditos',  label: 'Créditos',  Icon: ShoppingCart },
  { id: 'servicos',  label: 'Serviços',  Icon: Layers },
  { id: 'salas',     label: 'Salas',     Icon: LayoutGrid },
  { id: 'unidades',  label: 'Unidades',  Icon: Building2 },
  { id: 'anamneses', label: 'Anamneses', Icon: ClipboardCheck },
  { id: 'nfse',      label: 'NFS-e',     Icon: FileText, iconColor: '#F97316' },
  { id: 'senhas',    label: 'Senhas',    Icon: Lock },
  { id: 'whatsapp',   label: 'WhatsApp',   Icon: MessageSquare, iconColor: '#4ADE80' },
  { id: 'assinatura', label: 'Assinatura', Icon: Sparkles,     iconColor: '#7C4DFF' },
  { id: 'marcadores', label: 'Marcadores', Icon: Highlighter },
]

// ─── TAB: AGENDA ──────────────────────────────────────────────────────────────
type DayRow = { label: string; abertura: string; fechamento: string; aberto: boolean }

const DAYS_INIT: DayRow[] = [
  { label: 'Seg:', abertura: '06:00', fechamento: '22:00', aberto: true },
  { label: 'Ter:', abertura: '06:00', fechamento: '22:00', aberto: true },
  { label: 'Qua:', abertura: '06:00', fechamento: '22:00', aberto: true },
  { label: 'Qui:', abertura: '06:00', fechamento: '22:00', aberto: true },
  { label: 'Sex:', abertura: '06:00', fechamento: '22:00', aberto: true },
  { label: 'Sáb:', abertura: '06:00', fechamento: '22:00', aberto: false },
  { label: 'Dom:', abertura: '06:00', fechamento: '22:00', aberto: false },
]

function TimeInput({ label, value, onChange, disabled }: {
  label: string; value: string; onChange: (v: string) => void; disabled?: boolean
}) {
  return (
    <div className="relative flex-1">
      <label className={`absolute -top-2 left-3 z-10 ${LBG} px-1 text-[10px] font-medium text-[var(--d2b-text-secondary)] leading-none`}>
        {label}
      </label>
      <input
        type="time"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        disabled={disabled}
        className={INP + (disabled ? ' opacity-40 cursor-not-allowed' : '')}
      />
    </div>
  )
}

function TabAgenda() {
  const [comissoes,    setComissoes]    = useState(false)
  const [fila,         setFila]         = useState(false)
  const [overbooking,  setOverbooking]  = useState(false)
  const [bloquear,     setBloquear]     = useState(false)
  const [subTab,       setSubTab]       = useState<'clinica' | 'profissional'>('clinica')
  const [days,         setDays]         = useState<DayRow[]>(DAYS_INIT)
  const [almocoAtivo,  setAlmocoAtivo]  = useState(true)
  const [almocoIni,    setAlmocoIni]    = useState('12:00')
  const [almocoFim,    setAlmocoFim]    = useState('13:00')

  function toggleDay(i: number) {
    setDays((prev) => prev.map((d, idx) => idx === i ? { ...d, aberto: !d.aberto } : d))
  }
  function updateDay(i: number, field: 'abertura' | 'fechamento', v: string) {
    setDays((prev) => prev.map((d, idx) => idx === i ? { ...d, [field]: v } : d))
  }

  return (
    <div className="space-y-7">
      <h2 className="text-base font-bold text-[var(--d2b-text-primary)]">Configurações da Agenda</h2>

      {/* ── Toggles de recurso ── */}
      <div className="grid grid-cols-2 gap-x-14 gap-y-5">
        {[
          { label: 'Controle de Comissões',       on: comissoes,  set: setComissoes },
          { label: 'Fila de Espera',               on: fila,       set: setFila },
          { label: 'Overbooking de Profissionais', on: overbooking, set: setOverbooking },
          { label: 'Bloquear Edição de Evolução',  on: bloquear,   set: setBloquear },
        ].map(({ label, on, set }) => (
          <div key={label}>
            <div className="flex items-center gap-1.5 mb-1.5">
              <span className="text-sm font-medium text-[var(--d2b-text-primary)]">{label}</span>
              <HelpCircle size={13} className="text-[var(--d2b-text-muted)] cursor-help" />
            </div>
            <div className="flex items-center gap-2">
              <Toggle on={on} set={set} />
              <span className="text-xs text-[var(--d2b-text-secondary)]">
                {on ? 'Recurso Ativado' : 'Recurso Desativado'}
              </span>
            </div>
          </div>
        ))}
      </div>

      {/* ── Sub-tabs Clínica / Profissional ── */}
      <div className="flex border-b border-[var(--d2b-border)]">
        {(['clinica', 'profissional'] as const).map((tab) => (
          <button
            key={tab}
            onClick={() => setSubTab(tab)}
            className={`flex items-center gap-1.5 px-5 py-2.5 text-sm font-medium border-b-2 -mb-px transition-colors ${
              subTab === tab
                ? 'text-[#7C4DFF] border-[#7C4DFF]'
                : 'text-[var(--d2b-text-secondary)] border-transparent hover:text-[var(--d2b-text-primary)]'
            }`}
          >
            {tab === 'clinica' ? <Building2 size={14} /> : <User size={14} />}
            {tab === 'clinica' ? 'Clínica' : 'Profissional'}
          </button>
        ))}
      </div>

      {/* ── Horário de Funcionamento ── */}
      <div>
        <h3 className="text-sm font-semibold text-[var(--d2b-text-secondary)] mb-4">Horário de Funcionamento</h3>
        <div className="space-y-3">
          {days.map((day, i) => (
            <div key={day.label} className="flex items-center gap-3">
              <span className="text-sm font-medium text-[var(--d2b-text-secondary)] w-10 shrink-0">{day.label}</span>
              <TimeInput
                label="Abertura"
                value={day.abertura}
                onChange={(v) => updateDay(i, 'abertura', v)}
                disabled={!day.aberto}
              />
              <TimeInput
                label="Fechamento"
                value={day.fechamento}
                onChange={(v) => updateDay(i, 'fechamento', v)}
                disabled={!day.aberto}
              />
              <Cbx checked={day.aberto} set={() => toggleDay(i)} label="Aberto" />
            </div>
          ))}
        </div>
      </div>

      {/* ── Horário de Almoço ── */}
      <div>
        <h3 className="text-sm font-semibold text-[var(--d2b-text-secondary)] mb-4">Horário de Almoço</h3>
        <div className="flex gap-3 mb-3">
          <TimeInput label="Início" value={almocoIni} onChange={setAlmocoIni} />
          <TimeInput label="Fim"    value={almocoFim} onChange={setAlmocoFim} />
        </div>
        <Cbx checked={almocoAtivo} set={setAlmocoAtivo} label="Ativar Horário de Almoço:" />
      </div>

      <SectionFooter />
    </div>
  )
}

// ─── TAB: MENSAGENS ──────────────────────────────────────────────────────────
function TabMensagens() {
  const [permissao,  setPermissao]  = useState(true)
  const [smsAtivo,   setSmsAtivo]   = useState(false)
  const [smsRisco,   setSmsRisco]   = useState(false)
  const [dispararEm, setDispararEm] = useState('Todo dia - 7 am')
  const [mensagem,   setMensagem]   = useState(
    'Sua consulta com o(a) #nome_profissional# esta marcada para às #hora_agendamento#. Qualquer imprevisto, favor avisar. Obrigado(a)'
  )

  return (
    <div className="space-y-7">
      <div>
        <h2 className="text-base font-bold text-[var(--d2b-text-primary)]">Configurações de WhatsApp</h2>
        <p className="text-xs text-[var(--d2b-text-secondary)] mt-1">
          Gerencie as mensagens e configurações para o envio de WhatsApp automático pelo número do DEV2B.
        </p>
      </div>

      {/* Número de WhatsApp */}
      <div>
        <div className="flex items-center gap-1.5 mb-3">
          <span className="text-sm font-semibold text-[var(--d2b-text-secondary)]">Número de WhatsApp da Clínica</span>
          <HelpCircle size={13} className="text-[var(--d2b-text-muted)] cursor-help" />
        </div>
        <PhoneInput label="Número de Telefone" req />
      </div>

      {/* Permissões */}
      <div>
        <h3 className="text-base font-bold text-[var(--d2b-text-primary)] mb-4">Permissões</h3>
        <div className="flex items-center gap-1.5 mb-3">
          <span className="text-sm font-semibold text-[var(--d2b-text-secondary)]">Configurações de Permissões</span>
          <HelpCircle size={13} className="text-[var(--d2b-text-muted)] cursor-help" />
        </div>
        <div className="flex items-center gap-2">
          <Toggle on={permissao} set={setPermissao} />
          <span className="text-sm text-[var(--d2b-text-secondary)]">
            Permitir que profissionais simples visualizem dados de telefone dos pacientes e disparem mensagem
          </span>
        </div>
      </div>

      {/* Configurações de SMS */}
      <div>
        <h3 className="text-base font-bold text-[var(--d2b-text-primary)] mb-1">Configurações de SMS</h3>
        <p className="text-xs text-[var(--d2b-text-secondary)] mb-5">
          Personalize a mensagem e/ou desative o envio de SMS no dia da consulta do paciente.
        </p>
        <div className="flex items-center gap-1.5 mb-3">
          <span className="text-sm font-semibold text-[var(--d2b-text-secondary)]">Envio de SMS Automático</span>
          <HelpCircle size={13} className="text-[var(--d2b-text-muted)] cursor-help" />
        </div>
        <div className="space-y-2.5 mb-5">
          <div className="flex items-center gap-2">
            <Toggle on={smsAtivo} set={setSmsAtivo} />
            <span className="text-sm text-[var(--d2b-text-secondary)]">Ativar Disparo Automático</span>
          </div>
          <div className="flex items-center gap-2">
            <Toggle on={smsRisco} set={setSmsRisco} />
            <span className="text-sm text-[var(--d2b-text-secondary)]">Enviar somente com risco de falta?</span>
          </div>
        </div>

        <div className="mb-5">
          <p className="text-sm font-medium text-[var(--d2b-text-secondary)] mb-2">Disparar em:</p>
          <div className="relative">
            <select
              value={dispararEm}
              onChange={(e) => setDispararEm(e.target.value)}
              className={INP + ' appearance-none pr-8 cursor-pointer'}
            >
              {['Todo dia - 7 am', 'Todo dia - 8 am', 'Todo dia - 9 am', 'Todo dia - 10 am'].map((o) => (
                <option key={o} value={o}>{o}</option>
              ))}
            </select>
            <ChevronDown size={13} className="absolute right-3 top-1/2 -translate-y-1/2 text-[var(--d2b-text-secondary)] pointer-events-none" />
          </div>
        </div>

        <div>
          <p className="text-sm font-medium text-[var(--d2b-text-secondary)] mb-2">
            Mensagem de Lembrete <span className="text-[#7C4DFF]">*</span>
          </p>
          <div className="rounded-md border border-[var(--d2b-border-strong)] bg-[var(--d2b-bg-main)] focus-within:border-[#7C4DFF] transition-colors overflow-hidden">
            <textarea
              value={mensagem}
              onChange={(e) => setMensagem(e.target.value)}
              rows={3}
              className="w-full bg-transparent px-3 py-2.5 text-sm text-[var(--d2b-text-primary)] placeholder:text-[var(--d2b-text-muted)] focus:outline-none resize-none"
            />
          </div>
          <p className="text-[10px] text-[var(--d2b-text-muted)] mt-1">
            Adicione variáveis inserindo hastag(#) no campo de texto onde desejar. Elas serão substituídas automaticamente com seus valores no momento de criação do documento.
          </p>
        </div>
      </div>

      <SectionFooter />
    </div>
  )
}

// ─── TAB: CRÉDITOS ───────────────────────────────────────────────────────────
function TabCreditos() {
  const [envioProf,       setEnvioProf]   = useState(false)
  const [envioAss,        setEnvioAss]    = useState(false)
  const [assinaturaProf,  setAssinatProf] = useState(false)
  const [assinaturaAss,   setAssinatAss]  = useState(false)
  const [showModal,       setShowModal]   = useState(false)
  const [numCreditos,     setNumCreditos] = useState(10)

  const valorUnitario = 0.15
  const total = (numCreditos * valorUnitario).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })

  const STAT_CARDS = [
    { value: 5, label: 'Total créditos disponíveis para uso',              highlight: true  },
    { value: 5, label: 'Créditos comprados',                               highlight: false },
    { value: 0, label: 'Créditos via plano de produtividade',              highlight: false },
    { value: 0, label: 'Créditos comprados, aguardando confirmação do pagamento', highlight: false },
  ]

  return (
    <div className="space-y-7">
      <div>
        <h2 className="text-base font-bold text-[var(--d2b-text-primary)]">Compra de Créditos</h2>
        <p className="text-xs text-[var(--d2b-text-secondary)] mt-1">Gerencie as Permissões e compra de créditos.</p>
      </div>

      {/* Permissões de envio */}
      <div>
        <div className="flex items-center gap-1.5 mb-3">
          <span className="text-sm font-semibold text-[var(--d2b-text-secondary)]">Permissões de envio de mensagens</span>
          <HelpCircle size={13} className="text-[var(--d2b-text-muted)] cursor-help" />
        </div>
        <div className="space-y-2.5">
          <div className="flex items-center gap-2">
            <Toggle on={envioProf} set={setEnvioProf} />
            <span className="text-sm text-[var(--d2b-text-secondary)]">
              Permitir envio de WhatsApp automático por{' '}
              <span className="text-[#7C4DFF] font-medium">profissionais</span> da clínica.
            </span>
          </div>
          <div className="flex items-center gap-2">
            <Toggle on={envioAss} set={setEnvioAss} />
            <span className="text-sm text-[var(--d2b-text-secondary)]">
              Permitir envio de WhatsApp automático por{' '}
              <span className="text-[#7C4DFF] font-medium">assistentes</span> da clínica.
            </span>
          </div>
        </div>
      </div>

      {/* Permissões de assinatura */}
      <div>
        <div className="flex items-center gap-1.5 mb-3">
          <span className="text-sm font-semibold text-[var(--d2b-text-secondary)]">Permissões de assinatura eletrônica</span>
          <HelpCircle size={13} className="text-[var(--d2b-text-muted)] cursor-help" />
        </div>
        <div className="space-y-2.5">
          <div className="flex items-center gap-2">
            <Toggle on={assinaturaProf} set={setAssinatProf} />
            <span className="text-sm text-[var(--d2b-text-secondary)]">
              Permitir assinatura eletrônica por{' '}
              <span className="text-[#7C4DFF] font-medium">profissionais</span> da clínica.
            </span>
          </div>
          <div className="flex items-center gap-2">
            <Toggle on={assinaturaAss} set={setAssinatAss} />
            <span className="text-sm text-[var(--d2b-text-secondary)]">
              Permitir assinatura eletrônica por{' '}
              <span className="text-[#7C4DFF] font-medium">assistentes</span> da clínica.
            </span>
          </div>
        </div>
      </div>

      {/* Créditos */}
      <div>
        <div className="flex items-center gap-1.5 mb-1">
          <span className="text-sm font-semibold text-[var(--d2b-text-secondary)]">Créditos</span>
          <HelpCircle size={13} className="text-[var(--d2b-text-muted)] cursor-help" />
        </div>
        <p className="text-xs text-[var(--d2b-text-secondary)] mb-4">
          Compre créditos para utilizar as funcionalidades de envio de mensagens e assinatura eletrônica.
        </p>
        <button onClick={() => setShowModal(true)} className={BTN_PRIMARY + ' mb-5'}>
          Comprar Créditos
        </button>
        <div className="grid grid-cols-4 gap-3">
          {STAT_CARDS.map(({ value, label, highlight }) => (
            <div
              key={label}
              className={`rounded-lg border p-4 ${
                highlight
                  ? 'border-[#7C4DFF] bg-[var(--d2b-hover)]'
                  : 'border-[var(--d2b-border)] bg-[var(--d2b-bg-surface)]'
              }`}
            >
              <p className={`text-2xl font-bold mb-1 ${highlight ? 'text-[#7C4DFF]' : 'text-[var(--d2b-text-primary)]'}`}>{value}</p>
              <p className="text-xs text-[var(--d2b-text-secondary)] leading-tight">{label}</p>
            </div>
          ))}
        </div>
      </div>

      <div className="flex justify-end pt-5 border-t border-[var(--d2b-border)]">
        <button type="button" className={BTN_PRIMARY}>Salvar</button>
      </div>

      {/* Modal Comprar Créditos */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm">
          <div className="bg-[var(--d2b-bg-surface)] border border-[var(--d2b-border-strong)] rounded-xl shadow-2xl w-full max-w-md mx-4 p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-base font-bold text-[var(--d2b-text-primary)]">Comprar Créditos</h3>
              <button onClick={() => setShowModal(false)} className="text-[var(--d2b-text-muted)] hover:text-[var(--d2b-text-primary)] transition-colors">
                <X size={18} />
              </button>
            </div>
            <p className="text-sm text-[var(--d2b-text-secondary)] mb-3">
              Compre créditos para poder programar o disparo de suas mensagens e assinar documentos eletronicamente:
            </p>
            <ul className="text-sm text-[var(--d2b-text-secondary)] list-disc list-inside mb-5 space-y-1">
              <li>1 mensagem: 1 crédito;</li>
              <li>1 documento assinado: 10 créditos;</li>
            </ul>
            <div className="flex items-end gap-4 mb-6">
              <div className="flex-1 relative">
                <label className={`absolute -top-2 left-3 z-10 ${LBG} px-1 text-[10px] font-medium text-[var(--d2b-text-secondary)] leading-none`}>
                  Número de Créditos
                </label>
                <input
                  type="number"
                  min={1}
                  value={numCreditos}
                  onChange={(e) => setNumCreditos(Math.max(1, Number(e.target.value)))}
                  className={INP}
                />
              </div>
              <p className="text-sm font-semibold text-[var(--d2b-text-primary)] whitespace-nowrap pb-2.5">
                Valor À Pagar <span className="text-[#7C4DFF]">{total}</span>
              </p>
            </div>
            <div className="flex justify-end gap-3">
              <button onClick={() => setShowModal(false)} className={BTN_GHOST}>Cancelar</button>
              <button className={BTN_PRIMARY}>Próximo</button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

// ─── TAB: SERVIÇOS ───────────────────────────────────────────────────────────
type Servico = { id: number; nome: string; convenio: string; valor: number }

const SERVICOS_INIT: Servico[] = [
  { id: 1, nome: 'Consulta',          convenio: 'Geral', valor: 150  },
  { id: 2, nome: 'Direciona Empresa', convenio: 'Geral', valor: 1500 },
  { id: 3, nome: 'Exame',             convenio: 'Geral', valor: 0    },
  { id: 4, nome: 'Procedimento',      convenio: 'Geral', valor: 0    },
  { id: 5, nome: 'Retorno',           convenio: 'Geral', valor: 0    },
  { id: 6, nome: 'Teleconsulta',      convenio: 'Geral', valor: 0    },
]

const CONVENIOS = ['Todos', 'Geral', 'Unimed', 'Bradesco', 'Amil', 'SulAmérica']

function fmtBRL(v: number) {
  return v.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })
}

function TabServicos() {
  const [servicos,  setServicos]  = useState<Servico[]>(SERVICOS_INIT)
  const [search,    setSearch]    = useState('')
  const [filtro,    setFiltro]    = useState('Todos')
  const [showAdd,   setShowAdd]   = useState(false)
  const [novoNome,  setNovoNome]  = useState('')
  const [novoConv,  setNovoConv]  = useState('Geral')
  const [novoValor, setNovoValor] = useState('')
  const [deleteId,  setDeleteId]  = useState<number | null>(null)
  const [nextId,    setNextId]    = useState(7)

  const filtered = servicos.filter((s) => {
    const matchSearch = s.nome.toLowerCase().includes(search.toLowerCase())
    const matchFiltro = filtro === 'Todos' || s.convenio === filtro
    return matchSearch && matchFiltro
  })

  function addServico() {
    if (!novoNome.trim()) return
    const valor = parseFloat(novoValor.replace(',', '.')) || 0
    setServicos((prev) => [...prev, { id: nextId, nome: novoNome.trim(), convenio: novoConv, valor }])
    setNextId((n) => n + 1)
    setNovoNome(''); setNovoConv('Geral'); setNovoValor('')
    setShowAdd(false)
  }

  function deleteServico(id: number) {
    setServicos((prev) => prev.filter((s) => s.id !== id))
    setDeleteId(null)
  }

  return (
    <div className="space-y-5">
      <div className="flex items-start justify-between">
        <div>
          <h2 className="text-base font-bold text-[var(--d2b-text-primary)]">Serviços da Clínica</h2>
          <p className="text-xs text-[var(--d2b-text-secondary)] mt-1">
            Edite os serviços prestados pelo seu consultório ou clínica. Eles estarão disponíveis para especificar os agendamentos realizados.
          </p>
        </div>
        <button
          onClick={() => setShowAdd((v) => !v)}
          className={BTN_PRIMARY + ' flex items-center gap-1.5 shrink-0 ml-4'}
        >
          <Plus size={14} />
          Adicionar Novo Serviço
        </button>
      </div>

      {/* Filtros */}
      <div className="flex items-center gap-3">
        <div className="relative flex-1 max-w-xs">
          <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-[var(--d2b-text-muted)]" />
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Pesquisar Serviço..."
            className={INP + ' pl-8'}
          />
        </div>
        <div className="relative">
          <label className={`absolute -top-2 left-3 z-10 ${LBG} px-1 text-[10px] font-medium text-[var(--d2b-text-secondary)] leading-none`}>
            Convênio
          </label>
          <div className="relative">
            <select
              value={filtro}
              onChange={(e) => setFiltro(e.target.value)}
              className={INP + ' appearance-none pr-8 cursor-pointer w-44'}
            >
              {CONVENIOS.map((c) => <option key={c}>{c}</option>)}
            </select>
            <ChevronDown size={13} className="absolute right-3 top-1/2 -translate-y-1/2 text-[var(--d2b-text-secondary)] pointer-events-none" />
          </div>
        </div>
      </div>

      {/* Formulário de adição inline */}
      {showAdd && (
        <div className="rounded-lg border border-[var(--d2b-border-strong)] bg-[var(--d2b-bg-surface)] p-4">
          <div className="flex items-end gap-3">
            <div className="flex-1">
              <label className="text-[9px] font-semibold uppercase tracking-widest text-[var(--d2b-text-secondary)] block mb-1">Atendimento</label>
              <input
                value={novoNome}
                onChange={(e) => setNovoNome(e.target.value)}
                placeholder="Nome do Serviço"
                className={INP}
              />
            </div>
            <div className="w-48">
              <label className="text-[9px] font-semibold uppercase tracking-widest text-[var(--d2b-text-secondary)] block mb-1">Convênio (opcional)</label>
              <div className="relative">
                <select
                  value={novoConv}
                  onChange={(e) => setNovoConv(e.target.value)}
                  className={INP + ' appearance-none pr-8 cursor-pointer'}
                >
                  {CONVENIOS.filter((c) => c !== 'Todos').map((c) => <option key={c}>{c}</option>)}
                </select>
                <ChevronDown size={13} className="absolute right-3 top-1/2 -translate-y-1/2 text-[var(--d2b-text-secondary)] pointer-events-none" />
              </div>
            </div>
            <div className="w-36">
              <label className="text-[9px] font-semibold uppercase tracking-widest text-[var(--d2b-text-secondary)] block mb-1">Valor</label>
              <input
                value={novoValor}
                onChange={(e) => setNovoValor(e.target.value)}
                placeholder="R$ 0,00"
                className={INP}
              />
            </div>
            <button onClick={addServico} className={BTN_PRIMARY}>Salvar</button>
          </div>
        </div>
      )}

      <p className="text-xs text-[var(--d2b-text-secondary)]">
        Exibindo 1 a {filtered.length} de {filtered.length} serviços
      </p>

      {/* Lista */}
      <div className="rounded-lg border border-[var(--d2b-border)] overflow-hidden">
        {filtered.map((s, i) => (
          <div
            key={s.id}
            className={`flex items-center px-4 py-3 ${
              i < filtered.length - 1 ? 'border-b border-[var(--d2b-border)]' : ''
            }`}
          >
            <span className="text-sm font-medium text-[var(--d2b-text-primary)] mr-2">{s.nome}</span>
            <span className="text-[10px] font-semibold text-[var(--d2b-text-secondary)] border border-[var(--d2b-border-strong)] rounded px-1.5 py-0.5 mr-auto">
              {s.convenio.toUpperCase()}
            </span>
            <span className="text-sm font-medium text-[var(--d2b-text-primary)] mr-3">{fmtBRL(s.valor)}</span>
            <div className="w-8 h-8 rounded-md bg-[#00BCD4] flex items-center justify-center text-white text-xs font-bold mr-2">
              AA
            </div>
            <button className="w-8 h-8 rounded-md bg-[rgba(236,72,153,0.12)] flex items-center justify-center text-[#EC4899] hover:bg-[rgba(236,72,153,0.25)] transition-colors mr-1">
              <Pencil size={14} />
            </button>
            <button
              onClick={() => setDeleteId(s.id)}
              className="w-8 h-8 rounded-md bg-[rgba(239,68,68,0.12)] flex items-center justify-center text-[#EF4444] hover:bg-[rgba(239,68,68,0.25)] transition-colors"
            >
              <Trash2 size={14} />
            </button>
          </div>
        ))}
      </div>

      {/* Dialog de exclusão */}
      {deleteId !== null && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm">
          <div className="bg-[var(--d2b-bg-surface)] border border-[var(--d2b-border-strong)] rounded-xl shadow-2xl w-full max-w-sm mx-4 p-6">
            <div className="flex items-center gap-3 mb-3">
              <div className="w-10 h-10 rounded-full bg-[rgba(239,68,68,0.12)] flex items-center justify-center">
                <AlertTriangle size={20} className="text-[#EF4444]" />
              </div>
              <h3 className="text-base font-bold text-[var(--d2b-text-primary)]">Excluir Serviço</h3>
            </div>
            <p className="text-sm text-[var(--d2b-text-secondary)] mb-6">Você tem certeza que deseja excluir este serviço?</p>
            <div className="flex gap-3">
              <button
                onClick={() => deleteServico(deleteId)}
                className="flex-1 py-2 rounded-md text-sm font-bold text-white bg-[#EF4444] hover:bg-[#DC2626] transition-colors"
              >
                Deletar
              </button>
              <button onClick={() => setDeleteId(null)} className={BTN_GHOST}>
                Cancelar
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

// ─── TAB: SALAS ──────────────────────────────────────────────────────────────
type Sala = { id: number; nome: string; unidade: string; overbooking: boolean }

const SALAS_INIT: Sala[] = [
  { id: 1, nome: 'Sala 1', unidade: 'Matriz', overbooking: false },
]

const UNIDADES = ['Matriz', 'Filial 1', 'Filial 2']

function TabSalas() {
  const [gestaoAtiva,    setGestaoAtiva]  = useState(true)
  const [salas,          setSalas]        = useState<Sala[]>(SALAS_INIT)
  const [editId,         setEditId]       = useState<number | null>(null)
  const [deleteId,       setDeleteId]     = useState<number | null>(null)
  const [showAdd,        setShowAdd]      = useState(false)
  const [toast,          setToast]        = useState<string | null>(null)
  const [nextId,         setNextId]       = useState(2)
  const [editNome,       setEditNome]     = useState('')
  const [editUnidade,    setEditUnidade]  = useState('')
  const [editOverbooking,setEditOv]       = useState(false)
  const [addNome,        setAddNome]      = useState('')
  const [addUnidade,     setAddUnidade]   = useState('')
  const [addOverbooking, setAddOv]        = useState(false)

  function showToastMsg(msg: string) {
    setToast(msg)
    setTimeout(() => setToast(null), 3000)
  }

  function startEdit(s: Sala) {
    setEditId(s.id)
    setEditNome(s.nome)
    setEditUnidade(s.unidade)
    setEditOv(s.overbooking)
    setShowAdd(false)
  }

  function saveEdit() {
    setSalas((prev) =>
      prev.map((s) =>
        s.id === editId ? { ...s, nome: editNome, unidade: editUnidade, overbooking: editOverbooking } : s
      )
    )
    setEditId(null)
  }

  function deleteSala(id: number) {
    setSalas((prev) => prev.filter((s) => s.id !== id))
    setDeleteId(null)
    showToastMsg('Sala Excluída')
  }

  function addSala() {
    if (!addNome.trim()) return
    setSalas((prev) => [...prev, { id: nextId, nome: addNome.trim(), unidade: addUnidade || 'Matriz', overbooking: addOverbooking }])
    setNextId((n) => n + 1)
    setAddNome(''); setAddUnidade(''); setAddOv(false)
    setShowAdd(false)
  }

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-base font-bold text-[var(--d2b-text-primary)] flex items-center gap-1.5">
          Salas da Clínica
          <HelpCircle size={13} className="text-[var(--d2b-text-muted)] cursor-help" />
        </h2>
        <p className="text-xs text-[var(--d2b-text-secondary)] mt-1">
          Gerencie a lista de salas da sua clínica para que possam ser alocadas no atendimento de seus pacientes.
        </p>
        <div className="flex items-center gap-2 mt-3">
          <Toggle on={gestaoAtiva} set={setGestaoAtiva} />
          <span className="text-sm text-[var(--d2b-text-secondary)]">Desativar funcionalidade de gestão de Salas</span>
        </div>
      </div>

      {/* Lista de salas */}
      <div>
        <h3 className="text-sm font-semibold text-[var(--d2b-text-primary)] mb-3">Lista de salas</h3>
        <div className="rounded-lg border border-[var(--d2b-border)] overflow-hidden">
          {salas.map((s, i) => (
            <div key={s.id}>
              <div
                className={`flex items-center px-4 py-3 ${
                  i < salas.length - 1 || editId === s.id ? 'border-b border-[var(--d2b-border)]' : ''
                }`}
              >
                <span className="text-sm font-medium text-[var(--d2b-text-primary)] mr-2">{s.nome}</span>
                <span className="text-[10px] font-semibold text-[var(--d2b-text-secondary)] border border-[var(--d2b-border-strong)] rounded px-1.5 py-0.5 mr-auto">
                  {s.unidade}
                </span>
                <button className="w-8 h-8 rounded-md flex items-center justify-center text-[var(--d2b-text-muted)] hover:text-[var(--d2b-text-secondary)] mr-1 transition-colors">
                  <Pin size={14} />
                </button>
                <button
                  onClick={() => editId === s.id ? setEditId(null) : startEdit(s)}
                  className="w-8 h-8 rounded-md bg-[rgba(236,72,153,0.12)] flex items-center justify-center text-[#EC4899] hover:bg-[rgba(236,72,153,0.25)] transition-colors mr-1"
                >
                  <Pencil size={14} />
                </button>
                <button
                  onClick={() => setDeleteId(s.id)}
                  className="w-8 h-8 rounded-md bg-[rgba(239,68,68,0.12)] flex items-center justify-center text-[#EF4444] hover:bg-[rgba(239,68,68,0.25)] transition-colors"
                >
                  <Trash2 size={14} />
                </button>
              </div>
              {editId === s.id && (
                <div className="bg-[var(--d2b-bg-main)] p-4 space-y-3">
                  <div className="flex items-center gap-3">
                    <input
                      value={editNome}
                      onChange={(e) => setEditNome(e.target.value)}
                      placeholder="Nome da Sala"
                      className={INP + ' flex-1'}
                    />
                    <div className="relative flex-1">
                      <select
                        value={editUnidade}
                        onChange={(e) => setEditUnidade(e.target.value)}
                        className={INP + ' appearance-none pr-8 cursor-pointer'}
                      >
                        <option value="">Selecione uma unidade</option>
                        {UNIDADES.map((u) => <option key={u}>{u}</option>)}
                      </select>
                      <ChevronDown size={13} className="absolute right-3 top-1/2 -translate-y-1/2 text-[var(--d2b-text-secondary)] pointer-events-none" />
                    </div>
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <Toggle on={editOverbooking} set={setEditOv} />
                      <span className="text-sm text-[var(--d2b-text-secondary)]">Permitir overbooking nesta sala</span>
                    </div>
                    <p className="text-[10px] text-[var(--d2b-text-muted)] mt-1 ml-12">
                      Ao ativar esta opção, múltiplos agendamentos poderão ser realizados na mesma sala, no mesmo horário.
                    </p>
                  </div>
                  <button onClick={saveEdit} className={BTN_PRIMARY}>Salvar</button>
                </div>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Formulário adicionar sala */}
      {showAdd && (
        <div className="rounded-lg border border-[var(--d2b-border-strong)] bg-[var(--d2b-bg-main)] p-4 space-y-3">
          <div className="flex items-center gap-3">
            <input
              value={addNome}
              onChange={(e) => setAddNome(e.target.value)}
              placeholder="Nome da Sala"
              className={INP + ' flex-1'}
            />
            <div className="relative flex-1">
              <select
                value={addUnidade}
                onChange={(e) => setAddUnidade(e.target.value)}
                className={INP + ' appearance-none pr-8 cursor-pointer'}
              >
                <option value="">Selecione uma unidade</option>
                {UNIDADES.map((u) => <option key={u}>{u}</option>)}
              </select>
              <ChevronDown size={13} className="absolute right-3 top-1/2 -translate-y-1/2 text-[var(--d2b-text-secondary)] pointer-events-none" />
            </div>
          </div>
          <div>
            <div className="flex items-center gap-2">
              <Toggle on={addOverbooking} set={setAddOv} />
              <span className="text-sm text-[var(--d2b-text-secondary)]">Permitir overbooking nesta sala</span>
            </div>
            <p className="text-[10px] text-[var(--d2b-text-muted)] mt-1 ml-12">
              Ao ativar esta opção, múltiplos agendamentos poderão ser realizados na mesma sala, no mesmo horário.
            </p>
          </div>
          <button onClick={addSala} className={BTN_PRIMARY}>Salvar</button>
        </div>
      )}

      <button
        onClick={() => { setShowAdd((v) => !v); setEditId(null) }}
        className="flex items-center gap-1.5 px-4 py-2 rounded-md text-sm font-medium text-[#7C4DFF] border border-[var(--d2b-border-strong)] hover:border-[#7C4DFF] hover:bg-[var(--d2b-hover)] transition-colors"
      >
        <Plus size={14} />
        Adicionar sala
      </button>

      {/* Dialog de exclusão */}
      {deleteId !== null && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm">
          <div className="bg-[var(--d2b-bg-surface)] border border-[var(--d2b-border-strong)] rounded-xl shadow-2xl w-full max-w-sm mx-4 p-6">
            <div className="flex items-center gap-3 mb-3">
              <div className="w-10 h-10 rounded-full bg-[rgba(239,68,68,0.12)] flex items-center justify-center">
                <AlertTriangle size={20} className="text-[#EF4444]" />
              </div>
              <h3 className="text-base font-bold text-[var(--d2b-text-primary)]">Excluir Sala</h3>
            </div>
            <p className="text-sm text-[var(--d2b-text-secondary)] mb-6">Você tem certeza que deseja excluir esta sala?</p>
            <div className="flex gap-3">
              <button
                onClick={() => deleteSala(deleteId)}
                className="flex-1 py-2 rounded-md text-sm font-bold text-white bg-[#EF4444] hover:bg-[#DC2626] transition-colors"
              >
                Deletar
              </button>
              <button onClick={() => setDeleteId(null)} className={BTN_GHOST}>
                Cancelar
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Toast */}
      {toast && (
        <div className="fixed bottom-6 right-6 z-50 flex items-start gap-3 bg-[#0A2318] border border-[#22C55E] rounded-lg px-4 py-3 shadow-xl max-w-xs">
          <div className="w-5 h-5 rounded-full bg-[#22C55E] flex items-center justify-center shrink-0 mt-0.5">
            <Check size={11} className="text-white" strokeWidth={3} />
          </div>
          <div className="flex-1">
            <p className="text-sm font-semibold text-[#22C55E]">Sala Excluída</p>
            <p className="text-xs text-[#86EFAC]">Você acaba de excluir uma sala</p>
          </div>
          <button onClick={() => setToast(null)} className="text-[var(--d2b-text-muted)] hover:text-[var(--d2b-text-secondary)] transition-colors">
            <X size={14} />
          </button>
        </div>
      )}
    </div>
  )
}

// ─── Placeholder para abas em construção ─────────────────────────────────────
function TabPlaceholder({ label }: { label: string }) {
  return (
    <div className="flex flex-col items-center justify-center h-64 gap-3">
      <div className="w-16 h-16 rounded-2xl bg-[var(--d2b-bg-elevated)] border border-[var(--d2b-border-strong)] flex items-center justify-center text-2xl">
        🚧
      </div>
      <div className="text-center">
        <p className="text-sm font-medium text-[var(--d2b-text-primary)]">{label}</p>
        <p className="text-xs text-[var(--d2b-text-muted)] mt-1">Em construção</p>
      </div>
    </div>
  )
}

// ─── TAB: UNIDADES ────────────────────────────────────────────────────────────
type Unidade = { id: number; nome: string; ativa: boolean; criadaEm: string }

const UNIDADES_INIT: Unidade[] = [
  { id: 1, nome: 'Filial', ativa: true,  criadaEm: '31/03/2026' },
  { id: 2, nome: 'Matriz', ativa: false, criadaEm: '31/03/2026' },
]

function TabUnidades() {
  const [unidades,  setUnidades]  = useState<Unidade[]>(UNIDADES_INIT)
  const [showAdd,   setShowAdd]   = useState(false)
  const [addNome,   setAddNome]   = useState('')
  const [editId,    setEditId]    = useState<number | null>(null)
  const [editNome,  setEditNome]  = useState('')
  const [nextId,    setNextId]    = useState(3)

  function addUnidade() {
    if (!addNome.trim()) return
    const hoje = new Date().toLocaleDateString('pt-BR')
    setUnidades((prev) => [...prev, { id: nextId, nome: addNome.trim(), ativa: true, criadaEm: hoje }])
    setNextId((n) => n + 1)
    setAddNome('')
    setShowAdd(false)
  }

  function saveEdit(id: number) {
    setUnidades((prev) => prev.map((u) => u.id === id ? { ...u, nome: editNome } : u))
    setEditId(null)
  }

  function toggleAtiva(id: number) {
    setUnidades((prev) => prev.map((u) => u.id === id ? { ...u, ativa: !u.ativa } : u))
  }

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-base font-bold text-[var(--d2b-text-primary)] flex items-center gap-1.5">
          Unidades da Clínica
          <HelpCircle size={13} className="text-[var(--d2b-text-muted)] cursor-help" />
        </h2>
        <p className="text-xs text-[var(--d2b-text-secondary)] mt-1">
          Crie e gerencie as unidades da sua clínica e personalize as permissões para cada usuário.
        </p>
      </div>

      {/* Lista de unidades */}
      <div>
        <div className="flex items-start justify-between mb-2">
          <div>
            <h3 className="text-sm font-semibold text-[var(--d2b-text-primary)]">Lista de unidades</h3>
            <p className="text-xs text-[var(--d2b-text-secondary)]">Edite o nome e ative/desative unidades. Inativas ficam ocultas em seleções.</p>
          </div>
          <button
            onClick={() => { setShowAdd((v) => !v); setEditId(null) }}
            className={BTN_PRIMARY + ' flex items-center gap-1.5 shrink-0 ml-4'}
          >
            <Plus size={14} />
            Adicionar unidade
          </button>
        </div>

        {/* Form criar unidade */}
        {showAdd && (
          <div className="rounded-lg border border-[var(--d2b-border-strong)] bg-[var(--d2b-bg-surface)] p-4 mb-3 space-y-3">
            <p className="text-xs font-semibold text-[var(--d2b-text-secondary)] uppercase tracking-widest">Criar unidade</p>
            <input
              value={addNome}
              onChange={(e) => setAddNome(e.target.value)}
              placeholder="Nome da unidade"
              className={INP}
            />
            <div className="flex gap-2">
              <button onClick={addUnidade} className={BTN_PRIMARY}>Salvar</button>
              <button onClick={() => setShowAdd(false)} className={BTN_GHOST}>Cancelar</button>
            </div>
          </div>
        )}

        <div className="rounded-lg border border-[var(--d2b-border)] overflow-hidden">
          {unidades.map((u, i) => (
            <div key={u.id}>
              <div className={`px-4 py-3 ${i < unidades.length - 1 ? 'border-b border-[var(--d2b-border)]' : ''}`}>
                <div className="flex items-center">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-0.5">
                      <span className={`text-sm font-medium ${u.ativa ? 'text-[var(--d2b-text-primary)]' : 'text-[var(--d2b-text-muted)]'}`}>{u.nome}</span>
                      <span className={`text-[10px] font-semibold px-2 py-0.5 rounded-full ${
                        u.ativa
                          ? 'bg-[rgba(34,197,94,0.15)] text-[#22C55E] border border-[rgba(34,197,94,0.3)]'
                          : 'bg-[var(--d2b-hover)] text-[var(--d2b-text-muted)] border border-[var(--d2b-border)]'
                      }`}>
                        {u.ativa ? 'Ativa' : 'Inativo'}
                      </span>
                    </div>
                    {!u.ativa && (
                      <p className="text-xs text-[var(--d2b-text-muted)]">Esta unidade está inativa e ficará oculta em filtros e seleções.</p>
                    )}
                    <p className="text-xs text-[var(--d2b-text-muted)]">Criada em: {u.criadaEm}</p>
                  </div>
                  <div className="flex items-center gap-1 ml-3 shrink-0">
                    <button
                      onClick={() => { setEditId(editId === u.id ? null : u.id); setEditNome(u.nome) }}
                      className="w-8 h-8 rounded-md bg-[rgba(236,72,153,0.10)] flex items-center justify-center text-[#EC4899] hover:bg-[rgba(236,72,153,0.25)] transition-colors"
                    >
                      <Pencil size={14} />
                    </button>
                    <button
                      onClick={() => toggleAtiva(u.id)}
                      className={`w-8 h-8 rounded-md flex items-center justify-center transition-colors ${
                        u.ativa
                          ? 'bg-[var(--d2b-hover)] text-[var(--d2b-text-secondary)] hover:bg-[var(--d2b-hover)]'
                          : 'bg-[rgba(34,197,94,0.12)] text-[#22C55E] hover:bg-[rgba(34,197,94,0.25)]'
                      }`}
                    >
                      {u.ativa ? <X size={14} /> : <Check size={14} />}
                    </button>
                  </div>
                </div>
                {editId === u.id && (
                  <div className="mt-3 flex items-center gap-2">
                    <input
                      value={editNome}
                      onChange={(e) => setEditNome(e.target.value)}
                      className={INP + ' flex-1'}
                    />
                    <button onClick={() => saveEdit(u.id)} className={BTN_PRIMARY}>Salvar</button>
                    <button onClick={() => setEditId(null)} className={BTN_GHOST}>Cancelar</button>
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}

// ─── TAB: ANAMNESES ───────────────────────────────────────────────────────────
type Pergunta = { id: number; texto: string; tipo: string; ativa: boolean }
type AnamneseModel = { id: number; nome: string; perguntas: Pergunta[] }

const ANAMNESES_INIT: AnamneseModel[] = [
  {
    id: 1,
    nome: 'Anamnese Padrão',
    perguntas: [
      { id: 1,  texto: 'Possui contato de emergência?',                      tipo: 'Ambos', ativa: true  },
      { id: 2,  texto: 'Possui uma queixa inicial? Qual?',                   tipo: 'Ambos', ativa: true  },
      { id: 3,  texto: 'Sabe dizer o tempo com o sintoma da queixa? Quanto?',tipo: 'Ambos', ativa: true  },
      { id: 4,  texto: 'Pratica atividade fisica?',                          tipo: 'Ambos', ativa: true  },
      { id: 5,  texto: 'Tabagismo?',                                         tipo: 'Ambos', ativa: true  },
      { id: 6,  texto: 'Alimentação saudável?',                              tipo: 'Ambos', ativa: true  },
      { id: 7,  texto: 'Ingere bebida alcoólica? Qual frequência?',          tipo: 'Ambos', ativa: true  },
      { id: 8,  texto: 'Histórico familiar de doenças? Quais?',              tipo: 'Ambos', ativa: true  },
      { id: 9,  texto: 'Faz uso contínuo de alguma medicação? Qual?',        tipo: 'Ambos', ativa: true  },
      { id: 10, texto: 'Quantos anos vc tem ?',                              tipo: 'Ambos', ativa: false },
    ],
  },
]

const TIPOS_PERGUNTA = ['Ambos', 'Adulto', 'Criança']

function TabAnamneses() {
  const [anamneses,    setAnamneses]   = useState<AnamneseModel[]>(ANAMNESES_INIT)
  const [selectedId,   setSelectedId]  = useState(1)
  const [showNovaMod,  setShowNovaMod] = useState(false)
  const [novoModNome,  setNovoModNome] = useState('')
  const [showAddPerg,  setShowAddPerg] = useState(false)
  const [novaPerg,     setNovaPerg]    = useState('')
  const [novaTipo,     setNovaTipo]    = useState('Ambos')
  const [nextPergId,   setNextPergId]  = useState(11)
  const [nextModId,    setNextModId]   = useState(2)

  const modelo = anamneses.find((a) => a.id === selectedId)!

  function addModelo() {
    if (!novoModNome.trim()) return
    const novo: AnamneseModel = { id: nextModId, nome: novoModNome.trim(), perguntas: [] }
    setAnamneses((prev) => [...prev, novo])
    setSelectedId(nextModId)
    setNextModId((n) => n + 1)
    setNovoModNome('')
    setShowNovaMod(false)
  }

  function addPergunta() {
    if (!novaPerg.trim()) return
    const nova: Pergunta = { id: nextPergId, texto: novaPerg.trim(), tipo: novaTipo, ativa: true }
    setAnamneses((prev) =>
      prev.map((a) => a.id === selectedId ? { ...a, perguntas: [...a.perguntas, nova] } : a)
    )
    setNextPergId((n) => n + 1)
    setNovaPerg(''); setNovaTipo('Ambos')
    setShowAddPerg(false)
  }

  function togglePergunta(pergId: number) {
    setAnamneses((prev) =>
      prev.map((a) =>
        a.id === selectedId
          ? { ...a, perguntas: a.perguntas.map((p) => p.id === pergId ? { ...p, ativa: !p.ativa } : p) }
          : a
      )
    )
  }

  function changeTipoPerg(pergId: number, tipo: string) {
    setAnamneses((prev) =>
      prev.map((a) =>
        a.id === selectedId
          ? { ...a, perguntas: a.perguntas.map((p) => p.id === pergId ? { ...p, tipo } : p) }
          : a
      )
    )
  }

  const ativas   = modelo.perguntas.filter((p) => p.ativa)
  const inativas = modelo.perguntas.filter((p) => !p.ativa)

  return (
    <div className="space-y-5">
      <div className="flex items-start justify-between">
        <div>
          <h2 className="text-base font-bold text-[var(--d2b-text-primary)]">Anamneses da Clínica</h2>
          <p className="text-xs text-[var(--d2b-text-secondary)] mt-1">Crie e edite diferentes anamneses para os prontuários da clínica.</p>
        </div>
        <button
          onClick={() => setShowNovaMod(true)}
          className={BTN_PRIMARY + ' flex items-center gap-1.5 shrink-0 ml-4'}
        >
          <Plus size={14} />
          Nova Anamnese
        </button>
      </div>

      {/* Seletor de modelo + Editar */}
      <div className="flex items-center gap-2">
        <div className="relative flex-1">
          <select
            value={selectedId}
            onChange={(e) => setSelectedId(Number(e.target.value))}
            className={INP + ' appearance-none pr-8 cursor-pointer'}
          >
            {anamneses.map((a) => <option key={a.id} value={a.id}>{a.nome}</option>)}
          </select>
          <ChevronDown size={13} className="absolute right-3 top-1/2 -translate-y-1/2 text-[var(--d2b-text-secondary)] pointer-events-none" />
        </div>
        <button className={BTN_PRIMARY}>Editar</button>
      </div>

      {/* Perguntas Ativas */}
      <div>
        <div className="flex items-center justify-between mb-3">
          <h3 className="text-sm font-semibold text-[var(--d2b-text-secondary)]">Perguntas Ativas</h3>
          <button
            onClick={() => setShowAddPerg((v) => !v)}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-semibold text-[#7C4DFF] border border-[var(--d2b-border-strong)] hover:border-[#7C4DFF] hover:bg-[var(--d2b-hover)] transition-colors"
          >
            <Plus size={13} />
            Nova Pergunta
          </button>
        </div>

        {ativas.length === 0 && (
          <p className="text-sm text-[var(--d2b-text-muted)] py-3">Não existem perguntas ativas nesta anamnese.</p>
        )}

        <div className="space-y-1 mb-3">
          {ativas.map((p) => (
            <div key={p.id} className="flex items-center gap-2 rounded-md border border-[var(--d2b-border)] bg-[var(--d2b-bg-main)] px-3 py-2.5">
              <span className="text-[var(--d2b-text-muted)] cursor-grab shrink-0"><svg width="12" height="14" viewBox="0 0 10 14" fill="none"><circle cx="3" cy="2" r="1.2" fill="currentColor"/><circle cx="7" cy="2" r="1.2" fill="currentColor"/><circle cx="3" cy="7" r="1.2" fill="currentColor"/><circle cx="7" cy="7" r="1.2" fill="currentColor"/><circle cx="3" cy="12" r="1.2" fill="currentColor"/><circle cx="7" cy="12" r="1.2" fill="currentColor"/></svg></span>
              <span className="text-sm text-[var(--d2b-text-primary)] flex-1">{p.texto}</span>
              <div className="relative shrink-0 w-28">
                <select
                  value={p.tipo}
                  onChange={(e) => changeTipoPerg(p.id, e.target.value)}
                  className="w-full bg-transparent border border-[var(--d2b-border-strong)] rounded-md px-2 py-1.5 text-xs text-[var(--d2b-text-secondary)] appearance-none cursor-pointer pr-6 focus:outline-none focus:border-[#7C4DFF] transition-colors"
                >
                  {TIPOS_PERGUNTA.map((t) => <option key={t}>{t}</option>)}
                </select>
                <ChevronDown size={11} className="absolute right-2 top-1/2 -translate-y-1/2 text-[var(--d2b-text-secondary)] pointer-events-none" />
              </div>
              <button
                onClick={() => togglePergunta(p.id)}
                className="text-xs font-semibold px-3 py-1.5 rounded-md bg-[rgba(239,68,68,0.10)] text-[#EF4444] border border-[rgba(239,68,68,0.2)] hover:bg-[rgba(239,68,68,0.2)] transition-colors shrink-0"
              >
                Inativar
              </button>
            </div>
          ))}
        </div>

        {/* Form nova pergunta */}
        {showAddPerg && (
          <div className="rounded-md border border-[var(--d2b-border-strong)] bg-[var(--d2b-bg-surface)] p-3 space-y-3 mb-3">
            <div className="flex items-center gap-2">
              <input
                value={novaPerg}
                onChange={(e) => setNovaPerg(e.target.value)}
                placeholder="Digite sua pergunta"
                className={INP + ' flex-1'}
              />
              <div className="relative shrink-0 w-28">
                <select
                  value={novaTipo}
                  onChange={(e) => setNovaTipo(e.target.value)}
                  className={INP + ' appearance-none pr-6 cursor-pointer text-xs'}
                >
                  {TIPOS_PERGUNTA.map((t) => <option key={t}>{t}</option>)}
                </select>
                <ChevronDown size={11} className="absolute right-2 top-1/2 -translate-y-1/2 text-[var(--d2b-text-secondary)] pointer-events-none" />
              </div>
            </div>
            <div className="flex justify-end gap-2">
              <button onClick={() => setShowAddPerg(false)} className={BTN_GHOST}>Cancelar</button>
              <button onClick={addPergunta} className={BTN_PRIMARY}>Salvar</button>
            </div>
          </div>
        )}
      </div>

      {/* Perguntas Inativas */}
      <div>
        <h3 className="text-sm font-semibold text-[var(--d2b-text-secondary)] mb-3">Perguntas Inativas</h3>
        {inativas.length === 0 && (
          <p className="text-sm text-[var(--d2b-text-muted)] py-3">Não existem perguntas inativas nesta anamnese.</p>
        )}
        <div className="space-y-1">
          {inativas.map((p) => (
            <div key={p.id} className="flex items-center gap-2 rounded-md border border-[var(--d2b-border)] bg-[rgba(13,5,32,0.5)] px-3 py-2.5 opacity-70">
              <span className="text-sm text-[var(--d2b-text-muted)] flex-1">{p.texto}</span>
              <button
                onClick={() => togglePergunta(p.id)}
                className="text-xs font-semibold px-3 py-1.5 rounded-md bg-[rgba(34,197,94,0.10)] text-[#22C55E] border border-[rgba(34,197,94,0.2)] hover:bg-[rgba(34,197,94,0.2)] transition-colors shrink-0"
              >
                Ativar
              </button>
            </div>
          ))}
        </div>
      </div>

      {/* Modal Nova Anamnese */}
      {showNovaMod && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm">
          <div className="bg-[var(--d2b-bg-surface)] border border-[var(--d2b-border-strong)] rounded-xl shadow-2xl w-full max-w-sm mx-4 p-6">
            <div className="flex items-center justify-between mb-5">
              <h3 className="text-base font-bold text-[var(--d2b-text-primary)]">Nova Anamnese</h3>
              <button onClick={() => setShowNovaMod(false)} className="text-[var(--d2b-text-muted)] hover:text-[var(--d2b-text-primary)] transition-colors">
                <X size={18} />
              </button>
            </div>
            <div className="relative mb-5">
              <label className={`absolute -top-2 left-3 z-10 ${LBG} px-1 text-[10px] font-medium text-[var(--d2b-text-secondary)] leading-none`}>
                Título da Anamnese<span className="text-[#7C4DFF] ml-0.5">*</span>
              </label>
              <input
                value={novoModNome}
                onChange={(e) => setNovoModNome(e.target.value)}
                className={INP}
                autoFocus
              />
            </div>
            <div className="flex justify-end gap-3">
              <button onClick={() => setShowNovaMod(false)} className={BTN_GHOST}>Cancelar</button>
              <button onClick={addModelo} className={BTN_PRIMARY}>Salvar</button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

// ─── TAB: NFS-e ───────────────────────────────────────────────────────────────
type NfseStep = 1 | 2 | 3 | 4 | 5

const NFSE_STEPS: { step: NfseStep; label: string }[] = [
  { step: 1, label: 'CNPJ cadastrado e regular na receita federal.' },
  { step: 2, label: 'Certificado digital A1 e senha do certificado' },
  { step: 3, label: 'Verificar se sua cidade tem integração conosco, caso não tenha, entre em contato conosco para integrá-la.' },
  { step: 4, label: 'Caso já tenha emitido notas fiscais, saber a série e a última nota emitida.' },
  { step: 5, label: 'Ter todos os dados cadastrais dos pacientes preenchidos.' },
]

function StepIndicator({ current, total }: { current: NfseStep; total: number }) {
  return (
    <div className="flex items-center w-full mb-8">
      {Array.from({ length: total }, (_, i) => {
        const num = (i + 1) as NfseStep
        const done = num < current
        const active = num === current
        return (
          <div key={num} className="flex items-center flex-1 last:flex-none">
            <div
              className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold shrink-0 border-2 transition-all ${
                done
                  ? 'bg-[#7C4DFF] border-[#7C4DFF] text-white'
                  : active
                  ? 'bg-transparent border-[#7C4DFF] text-[#7C4DFF]'
                  : 'bg-transparent border-[var(--d2b-border-strong)] text-[var(--d2b-text-muted)]'
              }`}
            >
              {done ? <Check size={14} strokeWidth={3} /> : num}
            </div>
            {num < total && (
              <div className={`flex-1 h-0.5 mx-0 ${done ? 'bg-[#7C4DFF]' : 'bg-[var(--d2b-hover)]'}`} />
            )}
          </div>
        )
      })}
    </div>
  )
}

function TabNfse() {
  const [step, setStep] = useState<NfseStep>(1)
  const [done, setDone] = useState(false)
  const [cnpj, setCnpj] = useState('')
  const [ciente, setCiente] = useState(false)

  if (done) {
    return (
      <div className="space-y-7">
        <h2 className="text-base font-bold text-[var(--d2b-text-primary)]">NFS-e</h2>

        {/* Seção busca CNPJ */}
        <div>
          <h3 className="text-sm font-bold text-[var(--d2b-text-primary)] mb-1">Buscar dados da sua empresa na Receita Federal</h3>
          <p className="text-xs text-[var(--d2b-text-secondary)] mb-4">
            Para iniciar a configuração da Nota Fiscal de Serviços Eletrônica (NFS-e), precisamos buscar os dados oficiais da sua empresa na Receita Federal.
            Digite o CNPJ da clínica abaixo para preenchermos automaticamente todas as informações necessárias.
          </p>
          <p className="text-xs font-semibold text-[#F59E0B] mb-4">
            Importante: Para empresas recém cadastradas na Receita Federal que ainda não possuem dados disponíveis na consulta, entre em contato com nosso suporte para auxílio na configuração inicial.
          </p>

          <div className="mb-4">
            <p className="text-xs font-medium text-[var(--d2b-text-secondary)] mb-1.5">CNPJ da Clínica</p>
            <div className="flex gap-3">
              <input
                value={cnpj}
                onChange={(e) => setCnpj(e.target.value)}
                placeholder="00.000.000/0000-00"
                className={INP + ' flex-1'}
              />
              <button className="flex items-center gap-1.5 px-4 py-2 rounded-md text-sm font-bold text-white bg-[#7C4DFF] hover:bg-[#5B21B6] transition-colors shrink-0">
                <Search size={14} />
                Consultar Receita Federal
              </button>
            </div>
          </div>

          <Cbx
            checked={ciente}
            set={setCiente}
            label="* Estou ciente de que ainda será necessário avaliar os dados com meu contador"
          />

          <div className="mt-4 rounded-lg bg-[rgba(56,189,248,0.08)] border border-[rgba(56,189,248,0.2)] p-4 flex items-start gap-3">
            <div className="w-5 h-5 rounded-full bg-[rgba(56,189,248,0.15)] flex items-center justify-center shrink-0 mt-0.5">
              <HelpCircle size={12} className="text-[#38BDF8]" />
            </div>
            <p className="text-xs text-[var(--d2b-text-secondary)]">
              <span className="font-bold text-[#38BDF8]">Processo obrigatório:</span>{' '}
              A busca automática é necessária para preencher os dados oficiais da sua empresa (razão social, endereço e atividades econômicas) de forma precisa e em conformidade com os órgãos fiscais.
              Este processo garante a integração adequada com os sistemas governamentais para emissão de NFS-e.
            </p>
          </div>
        </div>
      </div>
    )
  }

  const stepData = NFSE_STEPS.find((s) => s.step === step)!

  return (
    <div className="space-y-7">
      <h2 className="text-base font-bold text-[var(--d2b-text-primary)]">NFS-e</h2>

      {/* Checklist intro */}
      <div>
        <h3 className="text-lg font-bold text-[var(--d2b-text-primary)] mb-6">Vamos começar!</h3>

        <StepIndicator current={step} total={5} />

        {/* Conteúdo do step */}
        <div className="rounded-lg border border-dashed border-[var(--d2b-border-strong)] bg-[var(--d2b-bg-surface)] px-8 py-10 flex items-center justify-center mb-6">
          <div className="flex items-center gap-3">
            <div className="w-7 h-7 rounded-full border-2 border-[var(--d2b-border-strong)] flex items-center justify-center text-[var(--d2b-text-secondary)]">
              <Check size={14} strokeWidth={2} />
            </div>
            <p className="text-sm text-[var(--d2b-text-secondary)]">{stepData.label}</p>
          </div>
        </div>

        {/* Botões de navegação */}
        <div className="flex items-center justify-center gap-3">
          {step > 1 && (
            <button
              onClick={() => setStep((s) => (s - 1) as NfseStep)}
              className={BTN_GHOST + ' flex items-center gap-1.5'}
            >
              ← Voltar
            </button>
          )}
          {step < 5 ? (
            <button
              onClick={() => setStep((s) => (s + 1) as NfseStep)}
              className={BTN_PRIMARY + ' flex items-center gap-1.5'}
            >
              Próximo →
            </button>
          ) : (
            <button
              onClick={() => setDone(true)}
              className={BTN_PRIMARY + ' flex items-center gap-1.5'}
            >
              Finalizar ✓
            </button>
          )}
        </div>
      </div>
    </div>
  )
}

// ─── TAB: SENHAS ──────────────────────────────────────────────────────────────
function TabSenhas() {
  const [senhaFin,   setSenhaFin]   = useState('')
  const [senhaPron,  setSenhaPron]  = useState('')
  const [showFin,    setShowFin]    = useState(false)
  const [showPron,   setShowPron]   = useState(false)

  return (
    <div className="space-y-8">
      <div className="flex items-center gap-1.5">
        <h2 className="text-base font-bold text-[var(--d2b-text-primary)]">Ativar Senhas</h2>
        <HelpCircle size={13} className="text-[var(--d2b-text-muted)] cursor-help" />
      </div>

      {/* Senha Financeiro */}
      <div className="space-y-3">
        <h3 className="text-sm font-semibold text-[var(--d2b-text-secondary)]">Senha Financeiro</h3>
        <div className="relative">
          <input
            type={showFin ? 'text' : 'password'}
            value={senhaFin}
            onChange={(e) => setSenhaFin(e.target.value)}
            placeholder="Defina uma nova senha"
            className={INP + ' pr-10'}
          />
          <button
            type="button"
            onClick={() => setShowFin((v) => !v)}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-[var(--d2b-text-muted)] hover:text-[var(--d2b-text-secondary)] transition-colors"
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              {showFin
                ? <><path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19"/><line x1="1" y1="1" x2="23" y2="23"/></>
                : <><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/></>
              }
            </svg>
          </button>
        </div>
        <div className="flex justify-end">
          <button className={BTN_PRIMARY}>Cadastrar nova senha</button>
        </div>
      </div>

      {/* Senha de Prontuário */}
      <div className="space-y-3">
        <h3 className="text-sm font-semibold text-[var(--d2b-text-secondary)]">Senha de Prontuário</h3>
        <div className="relative">
          <input
            type={showPron ? 'text' : 'password'}
            value={senhaPron}
            onChange={(e) => setSenhaPron(e.target.value)}
            placeholder="Defina uma nova senha"
            className={INP + ' pr-10'}
          />
          <button
            type="button"
            onClick={() => setShowPron((v) => !v)}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-[var(--d2b-text-muted)] hover:text-[var(--d2b-text-secondary)] transition-colors"
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              {showPron
                ? <><path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19"/><line x1="1" y1="1" x2="23" y2="23"/></>
                : <><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/></>
              }
            </svg>
          </button>
        </div>
        <div className="flex justify-end">
          <button className={BTN_PRIMARY}>Cadastrar nova senha</button>
        </div>
      </div>
    </div>
  )
}

// ─── Componente principal ─────────────────────────────────────────────────────
export function ConfiguracoesView({
  initialUsuario,
  initialEmpresa,
}: {
  initialUsuario?: UsuarioData | null
  initialEmpresa?: EmpresaData | null
}) {
  const searchParams = useSearchParams()
  const [active, setActive] = useState(() => searchParams.get('tab') ?? 'conta')

  const content = (() => {
    switch (active) {
      case 'conta':      return <TabConta initialUsuario={initialUsuario} initialEmpresa={initialEmpresa} />
      case 'agenda':     return <TabAgendaNova initialUsuario={initialUsuario} initialEmpresa={initialEmpresa} />
      case 'mensagens':  return <TabMensagensNova initialUsuario={initialUsuario} initialEmpresa={initialEmpresa} />
      case 'creditos':   return <TabCreditosNova initialUsuario={initialUsuario} />
      case 'servicos':   return <TabServicosNova initialEmpresa={initialEmpresa} />
      case 'salas':      return <TabSalasNova initialEmpresa={initialEmpresa} />
      case 'unidades':   return <TabUnidadesNova initialEmpresa={initialEmpresa} />
      case 'anamneses':  return <TabAnamnesesNova initialUsuario={initialUsuario} initialEmpresa={initialEmpresa} />
      case 'nfse':       return <TabNfseNova initialEmpresa={initialEmpresa} />
      case 'senhas':     return <TabSenhasNova initialUsuario={initialUsuario} />
      case 'whatsapp':    return <TabWhatsapp initialUsuario={initialUsuario} initialEmpresa={initialEmpresa} />
      case 'assinatura':  return <TabAssinatura initialUsuario={initialUsuario} />
      case 'marcadores':  return <TabMarcadores initialEmpresa={initialEmpresa} />
      default: {
        const tab = TABS.find((t) => t.id === active)
        return <TabPlaceholder label={tab?.label ?? ''} />
      }
    }
  })()

  return (
    <div className="flex h-full min-h-0">

      {/* ── Painel lateral de ícones ── */}
      <aside className="flex flex-col w-[72px] shrink-0 border-r border-[var(--d2b-border)] bg-[var(--d2b-bg-surface)] py-3 gap-0.5 overflow-y-auto">
        {TABS.map(({ id, label, Icon, iconColor }) => {
          const isActive = active === id
          const clr = iconColor ?? (isActive ? '#7C4DFF' : '#6B4E8A')
          return (
            <button
              key={id}
              onClick={() => setActive(id)}
              title={label}
              className={`flex flex-col items-center gap-1 py-3 mx-2 rounded-xl transition-all ${
                isActive
                  ? 'bg-[var(--d2b-hover)]'
                  : 'hover:bg-[var(--d2b-hover)]'
              }`}
            >
              <Icon size={20} color={clr} strokeWidth={isActive ? 2.5 : 1.5} />
              <span className="text-[9px] font-medium leading-tight text-center" style={{ color: clr }}>
                {label}
              </span>
            </button>
          )
        })}
      </aside>

      {/* ── Conteúdo da aba ── */}
      <div className="flex-1 overflow-y-auto p-8">
        {content}
      </div>
    </div>
  )
}
