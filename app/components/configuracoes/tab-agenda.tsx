'use client'

import { useState, useEffect } from 'react'
import { Building2, User, Info, HelpCircle } from 'lucide-react'
import { SectionFooter } from './shared'
import { useToast } from '@/hooks/use-toast'
import type { UsuarioData, EmpresaData } from '@/app/dashboard/configuracoes/page'

interface TabAgendaProps {
  initialUsuario?: UsuarioData | null
  initialEmpresa?: EmpresaData | null
}

interface AgendaData {
  id?: string
  controleComissoes: boolean
  recursoDesativadoComissoes: boolean
  overbookingProfissionais: boolean
  recursoDesativadoOverbooking: boolean
  filaEspera: boolean
  recursoDesativadoFila: boolean
  bloquearEdicaoEvolucao: boolean
  recursoDesativadoEvolucao: boolean
  
  segAbertura: string
  segFechamento: string
  segAberto: boolean
  
  terAbertura: string
  terFechamento: string
  terAberto: boolean
  
  quaAbertura: string
  quaFechamento: string
  quaAberto: boolean
  
  quiAbertura: string
  quiFechamento: string
  quiAberto: boolean
  
  sexAbertura: string
  sexFechamento: string
  sexAberto: boolean
  
  sabAbertura: string
  sabFechamento: string
  sabAberto: boolean
  
  domAbertura: string
  domFechamento: string
  domAberto: boolean
  
  almocoInicio: string
  almocoFim: string
  ativarHorarioAlmoco: boolean
}

export function TabAgenda({ initialUsuario, initialEmpresa }: TabAgendaProps) {
  const { toast } = useToast()
  const [subTab, setSubTab] = useState<'clinica' | 'profissional'>('clinica')
  const [profissionalHabilitado, setProfissionalHabilitado] = useState(!!initialUsuario?.agendaId)
  const [saving, setSaving] = useState(false)
  const [loading, setLoading] = useState(false)
  const [empresaAgendaId, setEmpresaAgendaId] = useState<string | null>(initialEmpresa?.agendaId ?? null)
  
  const [agenda, setAgenda] = useState<AgendaData>({
    controleComissoes: false,
    recursoDesativadoComissoes: false,
    overbookingProfissionais: false,
    recursoDesativadoOverbooking: false,
    filaEspera: false,
    recursoDesativadoFila: false,
    bloquearEdicaoEvolucao: false,
    recursoDesativadoEvolucao: false,
    
    segAbertura: '08:00',
    segFechamento: '22:00',
    segAberto: true,
    
    terAbertura: '08:00',
    terFechamento: '22:00',
    terAberto: true,
    
    quaAbertura: '08:00',
    quaFechamento: '22:00',
    quaAberto: true,
    
    quiAbertura: '08:00',
    quiFechamento: '22:00',
    quiAberto: true,
    
    sexAbertura: '08:00',
    sexFechamento: '22:00',
    sexAberto: true,
    
    sabAbertura: '08:00',
    sabFechamento: '22:00',
    sabAberto: false,
    
    domAbertura: '08:00',
    domFechamento: '22:00',
    domAberto: false,
    
    almocoInicio: '12:00',
    almocoFim: '13:00',
    ativarHorarioAlmoco: false,
  })

  const handleToggleProfissional = async (enabled: boolean) => {
    if (!initialUsuario?.id) return
    
    setLoading(true)
    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/v1/usuarios/${initialUsuario.id}/agenda-profissional`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ habilitar: enabled }),
      })

      if (res.ok) {
        const usuario = await res.json()
        setProfissionalHabilitado(!!usuario.agendaId)
        
        if (enabled && usuario.agendaId) {
          await carregarAgenda(usuario.agendaId)
          toast({ title: 'Agenda profissional habilitada com sucesso!' })
        } else {
          toast({ title: 'Agenda profissional desabilitada' })
        }
      } else {
        toast({ title: 'Erro ao alterar configuração', variant: 'destructive' })
      }
    } catch {
      toast({ title: 'Erro ao alterar configuração', variant: 'destructive' })
    } finally {
      setLoading(false)
    }
  }

  const carregarAgenda = async (agendaId: string) => {
    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/v1/agendas/${agendaId}`)
      if (res.ok) {
        const data = await res.json()
        setAgenda({
          id: data.id,
          controleComissoes: data.controleComissoes || false,
          recursoDesativadoComissoes: data.recursoDesativadoComissoes || false,
          overbookingProfissionais: data.overbookingProfissionais || false,
          recursoDesativadoOverbooking: data.recursoDesativadoOverbooking || false,
          filaEspera: data.filaEspera || false,
          recursoDesativadoFila: data.recursoDesativadoFila || false,
          bloquearEdicaoEvolucao: data.bloquearEdicaoEvolucao || false,
          recursoDesativadoEvolucao: data.recursoDesativadoEvolucao || false,
          
          segAbertura: data.segAbertura || '08:00',
          segFechamento: data.segFechamento || '22:00',
          segAberto: data.segAberto !== false,
          
          terAbertura: data.terAbertura || '08:00',
          terFechamento: data.terFechamento || '22:00',
          terAberto: data.terAberto !== false,
          
          quaAbertura: data.quaAbertura || '08:00',
          quaFechamento: data.quaFechamento || '22:00',
          quaAberto: data.quaAberto !== false,
          
          quiAbertura: data.quiAbertura || '08:00',
          quiFechamento: data.quiFechamento || '22:00',
          quiAberto: data.quiAberto !== false,
          
          sexAbertura: data.sexAbertura || '08:00',
          sexFechamento: data.sexFechamento || '22:00',
          sexAberto: data.sexAberto !== false,
          
          sabAbertura: data.sabAbertura || '08:00',
          sabFechamento: data.sabFechamento || '22:00',
          sabAberto: data.sabAberto === true,
          
          domAbertura: data.domAbertura || '08:00',
          domFechamento: data.domFechamento || '22:00',
          domAberto: data.domAberto === true,
          
          almocoInicio: data.almocoInicio || '12:00',
          almocoFim: data.almocoFim || '13:00',
          ativarHorarioAlmoco: data.ativarHorarioAlmoco || false,
        })
      }
    } catch (error) {
      console.error('Erro ao carregar agenda:', error)
    }
  }

  const handleSave = async () => {
    if (!initialUsuario?.id) return

    setSaving(true)
    try {
      if (subTab === 'clinica') {
        // ── Salvar agenda da Clínica (empresa) ────────────────
        if (!empresaAgendaId) {
          // Criar nova agenda
          const resCreate = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/v1/agendas`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
          })
          if (!resCreate.ok) { toast({ title: 'Erro ao criar agenda da clínica', variant: 'destructive' }); return }
          const newAgenda = await resCreate.json()

          // Vincular agenda à empresa
          if (initialEmpresa?.id) {
            const resEmp = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/v1/empresas/${initialEmpresa.id}`, {
              method: 'PATCH',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({ agendaId: newAgenda.id }),
            })
            if (!resEmp.ok) { toast({ title: 'Erro ao vincular agenda à clínica', variant: 'destructive' }); return }
          }

          // Salvar dados na agenda recém-criada
          const resUpd = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/v1/agendas/${newAgenda.id}`, {
            method: 'PATCH',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(agenda),
          })
          if (resUpd.ok) {
            setEmpresaAgendaId(newAgenda.id)
            toast({ title: 'Configurações da clínica salvas com sucesso!' })
          } else {
            toast({ title: 'Erro ao salvar agenda da clínica', variant: 'destructive' })
          }
        } else {
          // Atualizar agenda existente da empresa
          const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/v1/agendas/${empresaAgendaId}`, {
            method: 'PATCH',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(agenda),
          })
          if (res.ok) {
            toast({ title: 'Configurações da clínica salvas com sucesso!' })
          } else {
            toast({ title: 'Erro ao salvar. Tente novamente.', variant: 'destructive' })
          }
        }
      } else {
        // ── Salvar agenda do Profissional ─────────────────────
        if (!initialUsuario.agendaId) {
          const resCreate = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/v1/agendas`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
          })

          if (resCreate.ok) {
            const newAgenda = await resCreate.json()

            // Vincular agenda ao usuário
            const resUser = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/v1/usuarios/${initialUsuario.id}`, {
              method: 'PATCH',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({ agendaId: newAgenda.id }),
            })

            if (resUser.ok) {
              const resUpdate = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/v1/agendas/${newAgenda.id}`, {
                method: 'PATCH',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(agenda),
              })
              if (resUpdate.ok) {
                toast({ title: 'Configurações salvas com sucesso!' })
                if (initialUsuario) initialUsuario.agendaId = newAgenda.id
              } else {
                toast({ title: 'Erro ao salvar configurações', variant: 'destructive' })
              }
            } else {
              toast({ title: 'Erro ao vincular agenda', variant: 'destructive' })
            }
          } else {
            toast({ title: 'Erro ao criar agenda', variant: 'destructive' })
          }
        } else {
          const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/v1/agendas/${initialUsuario.agendaId}`, {
            method: 'PATCH',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(agenda),
          })
          if (res.ok) {
            toast({ title: 'Configurações salvas com sucesso!' })
          } else {
            toast({ title: 'Erro ao salvar. Tente novamente.', variant: 'destructive' })
          }
        }
      }
    } catch (error) {
      console.error('Erro ao salvar agenda:', error)
      toast({ title: 'Erro ao salvar. Tente novamente.', variant: 'destructive' })
    } finally {
      setSaving(false)
    }
  }

  const handleCancel = () => {
    if (subTab === 'clinica') {
      if (empresaAgendaId) carregarAgenda(empresaAgendaId)
    } else {
      if (initialUsuario?.agendaId) carregarAgenda(initialUsuario.agendaId)
    }
  }

  // Carregar agenda ao montar: clínica (empresa) se existir, senão profissional
  useEffect(() => {
    if (empresaAgendaId) {
      carregarAgenda(empresaAgendaId)
    } else if (initialUsuario?.agendaId) {
      carregarAgenda(initialUsuario.agendaId)
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  const DIAS_SEMANA = [
    { key: 'seg', label: 'Seg:' },
    { key: 'ter', label: 'Ter:' },
    { key: 'qua', label: 'Qua:' },
    { key: 'qui', label: 'Qui:' },
    { key: 'sex', label: 'Sex:' },
    { key: 'sab', label: 'Sáb:' },
    { key: 'dom', label: 'Dom:' },
  ]

  return (
    <div className="space-y-7">
      <h2 className="text-base font-bold text-[#F5F0FF]">Configurações da Agenda</h2>

      {/* Toggles de Recursos */}
      <div className="grid grid-cols-2 gap-x-10 gap-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="text-sm text-[#F5F0FF]">Controle de Comissões</span>
            <HelpCircle size={14} className="text-[#6B4E8A]" />
          </div>
          <button
            onClick={() => setAgenda(prev => ({ ...prev, recursoDesativadoComissoes: !prev.recursoDesativadoComissoes }))}
            className={`relative inline-flex h-5 w-9 items-center rounded-full transition-colors ${
              agenda.recursoDesativadoComissoes ? 'bg-[#7C4DFF]' : 'bg-[rgba(124,77,255,0.25)]'
            }`}
          >
            <span className={`inline-block h-3 w-3 transform rounded-full bg-white transition-transform ${
              agenda.recursoDesativadoComissoes ? 'translate-x-5' : 'translate-x-1'
            }`} />
          </button>
        </div>

        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="text-sm text-[#F5F0FF]">Fila de Espera</span>
            <HelpCircle size={14} className="text-[#6B4E8A]" />
          </div>
          <button
            onClick={() => setAgenda(prev => ({ ...prev, recursoDesativadoFila: !prev.recursoDesativadoFila }))}
            className={`relative inline-flex h-5 w-9 items-center rounded-full transition-colors ${
              agenda.recursoDesativadoFila ? 'bg-[#7C4DFF]' : 'bg-[rgba(124,77,255,0.25)]'
            }`}
          >
            <span className={`inline-block h-3 w-3 transform rounded-full bg-white transition-transform ${
              agenda.recursoDesativadoFila ? 'translate-x-5' : 'translate-x-1'
            }`} />
          </button>
        </div>

        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="text-sm text-[#F5F0FF]">Overbooking de Profissionais</span>
            <HelpCircle size={14} className="text-[#6B4E8A]" />
          </div>
          <button
            onClick={() => setAgenda(prev => ({ ...prev, recursoDesativadoOverbooking: !prev.recursoDesativadoOverbooking }))}
            className={`relative inline-flex h-5 w-9 items-center rounded-full transition-colors ${
              agenda.recursoDesativadoOverbooking ? 'bg-[#7C4DFF]' : 'bg-[rgba(124,77,255,0.25)]'
            }`}
          >
            <span className={`inline-block h-3 w-3 transform rounded-full bg-white transition-transform ${
              agenda.recursoDesativadoOverbooking ? 'translate-x-5' : 'translate-x-1'
            }`} />
          </button>
        </div>

        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="text-sm text-[#F5F0FF]">Bloquear Edição de Evolução</span>
            <HelpCircle size={14} className="text-[#6B4E8A]" />
          </div>
          <button
            onClick={() => setAgenda(prev => ({ ...prev, recursoDesativadoEvolucao: !prev.recursoDesativadoEvolucao }))}
            className={`relative inline-flex h-5 w-9 items-center rounded-full transition-colors ${
              agenda.recursoDesativadoEvolucao ? 'bg-[#7C4DFF]' : 'bg-[rgba(124,77,255,0.25)]'
            }`}
          >
            <span className={`inline-block h-3 w-3 transform rounded-full bg-white transition-transform ${
              agenda.recursoDesativadoEvolucao ? 'translate-x-5' : 'translate-x-1'
            }`} />
          </button>
        </div>
      </div>

      {/* Sub-tabs: Clínica e Profissional */}
      <div className="flex items-center gap-4 border-b border-[rgba(124,77,255,0.18)]">
        <button
          onClick={() => { setSubTab('clinica'); if (empresaAgendaId) carregarAgenda(empresaAgendaId) }}
          className={`flex items-center gap-2 px-4 py-2 border-b-2 transition-colors ${
            subTab === 'clinica'
              ? 'border-[#7C4DFF] text-[#F5F0FF]'
              : 'border-transparent text-[#A78BCC] hover:text-[#F5F0FF]'
          }`}
        >
          <Building2 size={16} />
          <span className="text-sm font-semibold">Clínica</span>
        </button>
        
        <button
          onClick={() => { setSubTab('profissional'); if (initialUsuario?.agendaId) carregarAgenda(initialUsuario.agendaId) }}
          className={`flex items-center gap-2 px-4 py-2 border-b-2 transition-colors ${
            subTab === 'profissional'
              ? 'border-[#7C4DFF] text-[#F5F0FF]'
              : 'border-transparent text-[#A78BCC] hover:text-[#F5F0FF]'
          }`}
        >
          <User size={16} />
          <span className="text-sm font-semibold">Profissional</span>
        </button>
      </div>

      {/* Conteúdo da sub-tab */}
      {subTab === 'clinica' ? (
        <div className="space-y-6">
          {/* Horário de Funcionamento */}
          <div className="space-y-4">
            <h3 className="text-sm font-bold text-[#F5F0FF]">Horário de Funcionamento</h3>
            
            <div className="space-y-2">
              {DIAS_SEMANA.map(({ key, label }) => {
                const abertura = `${key}Abertura` as keyof AgendaData
                const fechamento = `${key}Fechamento` as keyof AgendaData
                const aberto = `${key}Aberto` as keyof AgendaData
                
                return (
                  <div key={key} className="grid grid-cols-[60px_1fr_1fr_100px] gap-3 items-center">
                    <span className="text-sm text-[#A78BCC]">{label}</span>
                    
                    <div className="relative">
                      <label className="block text-[10px] text-[#6B4E8A] mb-1">Abertura</label>
                      <input
                        type="time"
                        value={agenda[abertura] as string}
                        onChange={(e) => setAgenda(prev => ({ ...prev, [abertura]: e.target.value }))}
                        disabled={!agenda[aberto]}
                        className="w-full px-3 py-2 rounded-lg border border-[rgba(124,77,255,0.25)] bg-[#120328] text-[#F5F0FF] text-sm focus:outline-none focus:border-[#7C4DFF] disabled:opacity-50"
                      />
                    </div>
                    
                    <div className="relative">
                      <label className="block text-[10px] text-[#6B4E8A] mb-1">Fechamento</label>
                      <input
                        type="time"
                        value={agenda[fechamento] as string}
                        onChange={(e) => setAgenda(prev => ({ ...prev, [fechamento]: e.target.value }))}
                        disabled={!agenda[aberto]}
                        className="w-full px-3 py-2 rounded-lg border border-[rgba(124,77,255,0.25)] bg-[#120328] text-[#F5F0FF] text-sm focus:outline-none focus:border-[#7C4DFF] disabled:opacity-50"
                      />
                    </div>
                    
                    <div className="flex items-center justify-end gap-2">
                      <span className={`text-xs ${agenda[aberto] ? 'text-[#7C4DFF]' : 'text-[#6B4E8A]'}`}>
                        {agenda[aberto] ? 'Aberto' : 'Fechado'}
                      </span>
                      <button
                        onClick={() => setAgenda(prev => ({ ...prev, [aberto]: !prev[aberto] }))}
                        className={`relative inline-flex h-5 w-9 items-center rounded-full transition-colors ${
                          agenda[aberto] ? 'bg-[#7C4DFF]' : 'bg-[rgba(124,77,255,0.25)]'
                        }`}
                      >
                        <span className={`inline-block h-3 w-3 transform rounded-full bg-white transition-transform ${
                          agenda[aberto] ? 'translate-x-5' : 'translate-x-1'
                        }`} />
                      </button>
                    </div>
                  </div>
                )
              })}
            </div>
          </div>

          {/* Horário de Almoço */}
          <div className="space-y-4">
            <h3 className="text-sm font-bold text-[#F5F0FF]">Horário de Almoço</h3>
            
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs text-[#A78BCC] mb-2">Início</label>
                <input
                  type="time"
                  value={agenda.almocoInicio}
                  onChange={(e) => setAgenda(prev => ({ ...prev, almocoInicio: e.target.value }))}
                  className="w-full px-3 py-2 rounded-lg border border-[rgba(124,77,255,0.25)] bg-[#120328] text-[#F5F0FF] text-sm focus:outline-none focus:border-[#7C4DFF]"
                />
              </div>
              
              <div>
                <label className="block text-xs text-[#A78BCC] mb-2">Fim</label>
                <input
                  type="time"
                  value={agenda.almocoFim}
                  onChange={(e) => setAgenda(prev => ({ ...prev, almocoFim: e.target.value }))}
                  className="w-full px-3 py-2 rounded-lg border border-[rgba(124,77,255,0.25)] bg-[#120328] text-[#F5F0FF] text-sm focus:outline-none focus:border-[#7C4DFF]"
                />
              </div>
            </div>

            <div className="flex items-center gap-3 p-3 rounded-lg border border-[rgba(124,77,255,0.18)] bg-[#120328]">
              <input
                type="checkbox"
                id="ativar-almoco"
                checked={agenda.ativarHorarioAlmoco}
                onChange={(e) => setAgenda(prev => ({ ...prev, ativarHorarioAlmoco: e.target.checked }))}
                className="w-4 h-4 rounded border-[rgba(124,77,255,0.25)] bg-[#0D0520] text-[#7C4DFF] focus:ring-2 focus:ring-[#7C4DFF] focus:ring-offset-2 focus:ring-offset-[#0D0520]"
              />
              <label htmlFor="ativar-almoco" className="text-sm text-[#F5F0FF] cursor-pointer">
                Ativar Horário de Almoço
              </label>
            </div>
          </div>
        </div>
      ) : (
        <div className="space-y-6">
          {/* Toggle Profissional */}
          <div className="flex items-start gap-3 p-4 rounded-xl border border-[rgba(124,77,255,0.18)] bg-[#120328]">
            <div className="flex items-center gap-3 flex-1">
              <div className="w-10 h-10 rounded-lg bg-[rgba(124,77,255,0.15)] flex items-center justify-center">
                <User size={20} className="text-[#7C4DFF]" />
              </div>
              <div>
                <p className="text-sm font-semibold text-[#F5F0FF]">Configurar horários personalizados de atendimento para este profissional</p>
                <p className="text-xs text-[#A78BCC] mt-0.5">
                  Configure os horários de atendimento deste profissional abaixo.
                </p>
              </div>
            </div>
            
            <button
              onClick={() => handleToggleProfissional(!profissionalHabilitado)}
              disabled={loading}
              className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-[#7C4DFF] focus:ring-offset-2 focus:ring-offset-[#0D0520] disabled:opacity-50 ${
                profissionalHabilitado ? 'bg-[#7C4DFF]' : 'bg-[rgba(124,77,255,0.25)]'
              }`}
            >
              <span className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                profissionalHabilitado ? 'translate-x-6' : 'translate-x-1'
              }`} />
            </button>
          </div>

          {profissionalHabilitado && (
            <div className="space-y-6">
              <div className="space-y-4">
                <h3 className="text-sm font-bold text-[#F5F0FF]">Horários de Funcionamento</h3>
                
                <div className="space-y-2">
                  {DIAS_SEMANA.map(({ key, label }) => {
                    const abertura = `${key}Abertura` as keyof AgendaData
                    const fechamento = `${key}Fechamento` as keyof AgendaData
                    const aberto = `${key}Aberto` as keyof AgendaData
                    
                    return (
                      <div key={key} className="grid grid-cols-[60px_1fr_1fr_100px] gap-3 items-center">
                        <span className="text-sm text-[#A78BCC]">{label}</span>
                        
                        <div className="relative">
                          <label className="block text-[10px] text-[#6B4E8A] mb-1">Abertura</label>
                          <input
                            type="time"
                            value={agenda[abertura] as string}
                            onChange={(e) => setAgenda(prev => ({ ...prev, [abertura]: e.target.value }))}
                            disabled={!agenda[aberto]}
                            className="w-full px-3 py-2 rounded-lg border border-[rgba(124,77,255,0.25)] bg-[#120328] text-[#F5F0FF] text-sm focus:outline-none focus:border-[#7C4DFF] disabled:opacity-50"
                          />
                        </div>
                        
                        <div className="relative">
                          <label className="block text-[10px] text-[#6B4E8A] mb-1">Fechamento</label>
                          <input
                            type="time"
                            value={agenda[fechamento] as string}
                            onChange={(e) => setAgenda(prev => ({ ...prev, [fechamento]: e.target.value }))}
                            disabled={!agenda[aberto]}
                            className="w-full px-3 py-2 rounded-lg border border-[rgba(124,77,255,0.25)] bg-[#120328] text-[#F5F0FF] text-sm focus:outline-none focus:border-[#7C4DFF] disabled:opacity-50"
                          />
                        </div>
                        
                        <div className="flex items-center justify-end gap-2">
                          <span className={`text-xs ${agenda[aberto] ? 'text-[#7C4DFF]' : 'text-[#6B4E8A]'}`}>
                            {agenda[aberto] ? 'Aberto' : 'Fechado'}
                          </span>
                          <button
                            onClick={() => setAgenda(prev => ({ ...prev, [aberto]: !prev[aberto] }))}
                            className={`relative inline-flex h-5 w-9 items-center rounded-full transition-colors ${
                              agenda[aberto] ? 'bg-[#7C4DFF]' : 'bg-[rgba(124,77,255,0.25)]'
                            }`}
                          >
                            <span className={`inline-block h-3 w-3 transform rounded-full bg-white transition-transform ${
                              agenda[aberto] ? 'translate-x-5' : 'translate-x-1'
                            }`} />
                          </button>
                        </div>
                      </div>
                    )
                  })}
                </div>
              </div>

              {/* Horário de Almoço */}
              <div className="space-y-4">
                <h3 className="text-sm font-bold text-[#F5F0FF]">Horário de Almoço</h3>
                
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs text-[#A78BCC] mb-2">Início</label>
                    <input
                      type="time"
                      value={agenda.almocoInicio}
                      onChange={(e) => setAgenda(prev => ({ ...prev, almocoInicio: e.target.value }))}
                      className="w-full px-3 py-2 rounded-lg border border-[rgba(124,77,255,0.25)] bg-[#120328] text-[#F5F0FF] text-sm focus:outline-none focus:border-[#7C4DFF]"
                    />
                  </div>
                  
                  <div>
                    <label className="block text-xs text-[#A78BCC] mb-2">Fim</label>
                    <input
                      type="time"
                      value={agenda.almocoFim}
                      onChange={(e) => setAgenda(prev => ({ ...prev, almocoFim: e.target.value }))}
                      className="w-full px-3 py-2 rounded-lg border border-[rgba(124,77,255,0.25)] bg-[#120328] text-[#F5F0FF] text-sm focus:outline-none focus:border-[#7C4DFF]"
                    />
                  </div>
                </div>

                <div className="flex items-center gap-3 p-3 rounded-lg border border-[rgba(124,77,255,0.18)] bg-[#120328]">
                  <input
                    type="checkbox"
                    id="ativar-almoco-prof"
                    checked={agenda.ativarHorarioAlmoco}
                    onChange={(e) => setAgenda(prev => ({ ...prev, ativarHorarioAlmoco: e.target.checked }))}
                    className="w-4 h-4 rounded border-[rgba(124,77,255,0.25)] bg-[#0D0520] text-[#7C4DFF] focus:ring-2 focus:ring-[#7C4DFF] focus:ring-offset-2 focus:ring-offset-[#0D0520]"
                  />
                  <label htmlFor="ativar-almoco-prof" className="text-sm text-[#F5F0FF] cursor-pointer">
                    Ativar Horário de Almoço
                  </label>
                </div>
              </div>
            </div>
          )}
        </div>
      )}

      <SectionFooter onSave={handleSave} onCancel={handleCancel} saving={saving} />
    </div>
  )
}
