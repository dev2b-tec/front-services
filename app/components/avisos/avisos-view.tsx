'use client'

import { useState, useEffect, useMemo } from 'react'
import { FileCheck, RefreshCw, Wallet, Heart, Cake } from 'lucide-react'
import { AvisosTable, type AvisoRow, type TabKey } from './tab-avisos-table'
import { AniversariosTab, type PacienteBasico } from './tab-aniversarios'
import {
  NovoAgendamentoModal,
  type ApiAgendamento,
  type Profissional,
} from '@/components/calendario/calendario-view'

// --- Helpers -----------------------------------------------------------------
function formatDT(iso: string): string {
  try {
    const d = new Date(iso)
    if (isNaN(d.getTime())) return iso
    return (
      d.toLocaleDateString('pt-BR') +
      ' ' +
      d.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })
    )
  } catch { return iso }
}

const EXCLUIDOS_REMARCACAO = ['Confirmado', 'Atendido', 'Desmarcado', 'Cancelado']

// --- Tab definitions ---------------------------------------------------------
const TAB_META: {
  key: TabKey
  label: string
  icon: React.ElementType
  title: string
  description: string
}[] = [
  {
    key: 'confirmacao',
    label: 'Confirma��o',
    icon: FileCheck,
    title: 'Confirma��o de Presen�a',
    description: 'Envie mensagens para lembrar e confirmar a presen�a dos seus pacientes.',
  },
  {
    key: 'remarcacao',
    label: 'Remarca��o',
    icon: RefreshCw,
    title: 'Remarca��o',
    description: 'Envie mensagens para reagendar pacientes com consultas atrasadas.',
  },
  {
    key: 'cobranca',
    label: 'Cobran�a',
    icon: Wallet,
    title: 'Cobran�a',
    description: 'Envie mensagens de cobran�a para pacientes com d�bitos pendentes.',
  },
  {
    key: 'agradecimentos',
    label: 'Agradecimentos',
    icon: Heart,
    title: 'Agradecimentos',
    description: 'Envie mensagens de agradecimento ap�s as consultas.',
  },
  {
    key: 'aniversarios',
    label: 'Anivers�rios',
    icon: Cake,
    title: 'Anivers�rios',
    description: 'Deseje feliz anivers�rio aos seus pacientes!',
  },
]

// --- AvisosView --------------------------------------------------------------
export function AvisosView({ empresaId }: { empresaId: string | null }) {
  const [activeTab, setActiveTab] = useState<TabKey>('confirmacao')
  const [agendamentos, setAgendamentos] = useState<ApiAgendamento[]>([])
  const [pacientes, setPacientes] = useState<PacienteBasico[]>([])
  const [carregando, setCarregando] = useState(false)
  const [agendamentoModal, setAgendamentoModal] = useState<ApiAgendamento | null>(null)

  useEffect(() => {
    if (!empresaId) return
    setCarregando(true)
    Promise.all([
      fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/v1/agendamentos/empresa/${empresaId}`)
        .then((r) => (r.ok ? r.json() : [])),
      fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/v1/pacientes/empresa/${empresaId}`)
        .then((r) => (r.ok ? r.json() : [])),
    ])
      .then(([ags, pacs]) => {
        setAgendamentos(ags)
        setPacientes(pacs)
      })
      .catch(() => {})
      .finally(() => setCarregando(false))
  }, [empresaId])

  const phoneMap = useMemo<Map<string, string>>(() => {
    const m = new Map<string, string>()
    pacientes.forEach((p) => { if (p.telefone) m.set(p.id, p.telefone) })
    return m
  }, [pacientes])

  const agora = useMemo(() => new Date(), [])

  const confirmacaoRows = useMemo<AvisoRow[]>(() =>
    agendamentos
      .filter((ag) => new Date(ag.inicio) > agora)
      .sort((a, b) => new Date(a.inicio).getTime() - new Date(b.inicio).getTime())
      .map((ag) => ({
        id: ag.id,
        agendamento: ag,
        paciente: ag.pacienteNome ?? '�',
        telefone: (ag.pacienteId ? phoneMap.get(ag.pacienteId) : undefined) ?? '',
        profissional: ag.usuarioNome ?? '�',
        dataConsulta: formatDT(ag.inicio),
        status: (ag.status ?? 'Agendado') as AvisoRow['status'],
      })),
    [agendamentos, phoneMap, agora],
  )

  const remarcacaoRows = useMemo<AvisoRow[]>(() =>
    agendamentos
      .filter((ag) => {
        const inicio = new Date(ag.inicio)
        return inicio < agora && !EXCLUIDOS_REMARCACAO.includes(ag.status ?? '')
      })
      .sort((a, b) => new Date(b.inicio).getTime() - new Date(a.inicio).getTime())
      .map((ag) => ({
        id: ag.id,
        agendamento: ag,
        paciente: ag.pacienteNome ?? '�',
        telefone: (ag.pacienteId ? phoneMap.get(ag.pacienteId) : undefined) ?? '',
        profissional: ag.usuarioNome ?? '�',
        dataConsulta: formatDT(ag.inicio),
        status: (ag.status ?? 'Agendado') as AvisoRow['status'],
      })),
    [agendamentos, phoneMap, agora],
  )

  // Badge count: patients with birthday in the next 7 days
  const aniversariosBadge = useMemo(() => {
    const start = new Date(agora); start.setHours(0, 0, 0, 0)
    const end   = new Date(agora); end.setDate(end.getDate() + 6); end.setHours(23, 59, 59, 999)
    return pacientes.filter((p) => {
      if (!p.dataNascimento) return false
      const born = new Date(p.dataNascimento + 'T00:00:00')
      const bMonth = born.getMonth(); const bDay = born.getDate()
      for (let y = start.getFullYear(); y <= end.getFullYear(); y++) {
        const c = new Date(y, bMonth, bDay)
        if (c >= start && c <= end) return true
      }
      return false
    }).length
  }, [pacientes, agora])

  const rowsByTab: Record<Exclude<TabKey, 'aniversarios'>, AvisoRow[]> = {
    confirmacao:    confirmacaoRows,
    remarcacao:     remarcacaoRows,
    cobranca:       [],
    agradecimentos: [],
  }

  const badgeCount: Record<TabKey, number> = {
    confirmacao:    confirmacaoRows.length,
    remarcacao:     remarcacaoRows.length,
    cobranca:       0,
    agradecimentos: 0,
    aniversarios:   0,
  }

  const activeTabMeta = TAB_META.find((t) => t.key === activeTab)!
  const TabIcon = activeTabMeta.icon

  function refetch() {
    if (!empresaId) return
    fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/v1/agendamentos/empresa/${empresaId}`)
      .then((r) => (r.ok ? r.json() : []))
      .then(setAgendamentos)
      .catch(() => {})
  }

  return (
    <div className="min-h-full bg-[var(--d2b-bg-main)]">
      {agendamentoModal && (
        <NovoAgendamentoModal
          open
          onClose={() => setAgendamentoModal(null)}
          empresaId={empresaId}
          profissionaisApi={[] as Profissional[]}
          agendamento={agendamentoModal}
          onSaved={() => { setAgendamentoModal(null); refetch() }}
        />
      )}

      {/* Tabs bar */}
      <div className="border-b border-[var(--d2b-border)] bg-[var(--d2b-bg-main)]">
        <div className="flex overflow-x-auto">
          {TAB_META.map((t) => {
            const Icon   = t.icon
            const active = t.key === activeTab
            const badge  = badgeCount[t.key]
            return (
              <button
                key={t.key}
                onClick={() => setActiveTab(t.key)}
                className={`relative flex flex-col items-center gap-1 px-6 py-3.5 text-sm font-medium whitespace-nowrap transition-colors border-b-2 ${
                  active
                    ? 'border-[#7C4DFF] text-[#7C4DFF]'
                    : 'border-transparent text-[var(--d2b-text-muted)] hover:text-[var(--d2b-text-secondary)]'
                }`}
              >
                <Icon size={18} />
                {t.label}
                {badge > 0 && (
                  <span className="absolute top-2 right-3 min-w-[16px] h-4 rounded-full bg-[#7C4DFF] text-white text-[9px] font-bold flex items-center justify-center px-1">
                    {badge}
                  </span>
                )}
              </button>
            )
          })}
        </div>
      </div>

      {/* Tab content */}
      <div className="px-6 py-5 space-y-5">
        {/* Header card */}
        <div className="flex items-center justify-between rounded-xl bg-[var(--d2b-hover)] border border-[var(--d2b-border)] px-5 py-4">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-lg bg-[var(--d2b-hover)] flex items-center justify-center shrink-0">
              <TabIcon size={18} className="text-[#7C4DFF]" />
            </div>
            <div>
              <p className="text-sm font-bold text-[var(--d2b-text-primary)]">{activeTabMeta.title}</p>
              <p className="text-xs text-[var(--d2b-text-muted)] mt-0.5">{activeTabMeta.description}</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            {carregando && (
              <svg className="animate-spin" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#7C4DFF" strokeWidth="2">
                <path d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z" opacity=".3"/>
                <path d="M21 12a9 9 0 00-9-9"/>
              </svg>
            )}
            <div className="w-9 h-9 rounded-full bg-[#7C4DFF] flex items-center justify-center shrink-0">
              <span className="text-sm font-bold text-white">{badgeCount[activeTab]}</span>
            </div>
          </div>
        </div>

        {/* Active tab content */}
        {activeTab === 'aniversarios' ? (
          <AniversariosTab
            empresaId={empresaId}
            pacientes={pacientes}
            loading={carregando}
          />
        ) : (
          <AvisosTable
            rows={rowsByTab[activeTab as Exclude<TabKey, 'aniversarios'>]}
            tabKey={activeTab as Exclude<TabKey, 'aniversarios'>}
            disparosAtivados={activeTab === 'confirmacao' && confirmacaoRows.length > 0 ? true : undefined}
            onRowClick={setAgendamentoModal}
            empresaId={empresaId}
          />
        )}
      </div>
    </div>
  )
}
