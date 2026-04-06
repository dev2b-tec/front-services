'use client'

import { useState, useEffect, useCallback } from 'react'
import { MessageSquare, Settings, Loader2 } from 'lucide-react'
import { useToast } from '@/hooks/use-toast'
import type { UsuarioData, EmpresaData } from '@/app/dashboard/configuracoes/page'

const API_URL = process.env.NEXT_PUBLIC_API_URL ?? ''

// ─── Types ────────────────────────────────────────────────────────────────────

type TipoMensagem =
  | 'CONFIRMAR_AGENDAMENTO'
  | 'REMARCACAO'
  | 'AGRADECIMENTO'
  | 'COBRANCA'
  | 'ANIVERSARIO'

interface MensagemPadrao {
  id?: string
  empresaId?: string
  tipo: TipoMensagem
  texto: string
  isDefault?: boolean
}

interface ConfiguracaoMensagem {
  id?: string
  numeroWhatsapp: string
  permitirProfissionais: boolean
  envioSmsAutomatico: boolean
  enviarComRiscoFalta: boolean
  horarioDisparo: string
}

interface TabMensagensProps {
  initialUsuario?: UsuarioData | null
  initialEmpresa?: EmpresaData | null
}

// ─── Metadata ─────────────────────────────────────────────────────────────────

const TIPOS: { tipo: TipoMensagem; label: string; desc: string }[] = [
  {
    tipo: 'CONFIRMAR_AGENDAMENTO',
    label: 'Confirmação de Agendamento',
    desc: 'Enviada para lembrar e confirmar a presença do paciente.',
  },
  {
    tipo: 'REMARCACAO',
    label: 'Remarcação',
    desc: 'Enviada para reagendar pacientes que faltaram à consulta.',
  },
  {
    tipo: 'AGRADECIMENTO',
    label: 'Agradecimento',
    desc: 'Enviada após a consulta para agradecer a presença do paciente.',
  },
  {
    tipo: 'COBRANCA',
    label: 'Cobrança',
    desc: 'Enviada para lembrar pacientes sobre pagamentos pendentes.',
  },
  {
    tipo: 'ANIVERSARIO',
    label: 'Aniversário',
    desc: 'Enviada no dia do aniversário do paciente.',
  },
]

// ─── Component ────────────────────────────────────────────────────────────────

export function TabMensagens({ initialUsuario, initialEmpresa }: TabMensagensProps) {
  const { toast } = useToast()

  // sub-tabs
  type SubTab = 'configuracoes' | 'mensagens'
  const [subTab, setSubTab] = useState<SubTab>('configuracoes')

  // ── Config state ────────────────────────────────────────────────────────────
  const [loadingConfig, setLoadingConfig] = useState(true)
  const [savingConfig, setSavingConfig] = useState(false)
  const [numeroWhatsapp, setNumeroWhatsapp] = useState('')
  const [permitirProf, setPermitirProf] = useState(false)
  const [envioAuto, setEnvioAuto] = useState(false)
  const [riscoFalta, setRiscoFalta] = useState(false)
  const [horario, setHorario] = useState('TODO_DIA_7AM')

  // ── Mensagens state ─────────────────────────────────────────────────────────
  const [loadingMsgs, setLoadingMsgs] = useState(true)
  const [savingMsg, setSavingMsg] = useState(false)
  const [mensagens, setMensagens] = useState<Record<TipoMensagem, string>>({
    CONFIRMAR_AGENDAMENTO: '',
    REMARCACAO: '',
    AGRADECIMENTO: '',
    COBRANCA: '',
    ANIVERSARIO: '',
  })
  const [tipoSelecionado, setTipoSelecionado] = useState<TipoMensagem>('CONFIRMAR_AGENDAMENTO')
  const [draftText, setDraftText] = useState('')

  // ── Load config ──────────────────────────────────────────────────────────────
  const carregarConfig = useCallback(async () => {
    if (!initialUsuario?.id) { setLoadingConfig(false); return }
    setLoadingConfig(true)
    try {
      const res = await fetch(`${API_URL}/api/v1/configuracoes-mensagens/usuario/${initialUsuario.id}`)
      if (res.ok && res.status !== 204) {
        const text = await res.text()
        if (text) {
          const data: ConfiguracaoMensagem = JSON.parse(text)
          setNumeroWhatsapp(data.numeroWhatsapp || '')
          setPermitirProf(data.permitirProfissionais || false)
          setEnvioAuto(data.envioSmsAutomatico || false)
          setRiscoFalta(data.enviarComRiscoFalta || false)
          setHorario(data.horarioDisparo || 'TODO_DIA_7AM')
        }
      }
    } catch { /* silencioso */ } finally {
      setLoadingConfig(false)
    }
  }, [initialUsuario?.id])

  // ── Load mensagens ───────────────────────────────────────────────────────────
  const carregarMensagens = useCallback(async () => {
    if (!initialEmpresa?.id) { setLoadingMsgs(false); return }
    setLoadingMsgs(true)
    try {
      const res = await fetch(`${API_URL}/api/v1/mensagens-padrao/empresa/${initialEmpresa.id}`)
      if (res.ok) {
        const lista: MensagemPadrao[] = await res.json()
        const map: Record<TipoMensagem, string> = {
          CONFIRMAR_AGENDAMENTO: '',
          REMARCACAO: '',
          AGRADECIMENTO: '',
          COBRANCA: '',
          ANIVERSARIO: '',
        }
        lista.forEach((m) => { map[m.tipo] = m.texto })
        setMensagens(map)
        setDraftText(map['CONFIRMAR_AGENDAMENTO'])
      }
    } catch { /* silencioso */ } finally {
      setLoadingMsgs(false)
    }
  }, [initialEmpresa?.id])

  useEffect(() => { carregarConfig() }, [carregarConfig])
  useEffect(() => { carregarMensagens() }, [carregarMensagens])

  // ── Handlers ────────────────────────────────────────────────────────────────
  const handleTipoChange = (tipo: TipoMensagem) => {
    setTipoSelecionado(tipo)
    setDraftText(mensagens[tipo])
  }

  const handleSalvarConfig = async () => {
    if (!initialUsuario?.id) return
    setSavingConfig(true)
    try {
      const res = await fetch(
        `${API_URL}/api/v1/configuracoes-mensagens/usuario/${initialUsuario.id}`,
        {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            numeroWhatsapp,
            permitirProfissionais: permitirProf,
            envioSmsAutomatico: envioAuto,
            enviarComRiscoFalta: riscoFalta,
            horarioDisparo: horario,
          }),
        }
      )
      if (res.ok) {
        toast({ title: 'Configurações salvas com sucesso!' })
      } else {
        toast({ title: 'Erro ao salvar configurações', variant: 'destructive' })
      }
    } catch {
      toast({ title: 'Erro ao salvar configurações', variant: 'destructive' })
    } finally {
      setSavingConfig(false)
    }
  }

  const handleSalvarMensagem = async () => {
    if (!initialEmpresa?.id) return
    setSavingMsg(true)
    try {
      const res = await fetch(
        `${API_URL}/api/v1/mensagens-padrao/empresa/${initialEmpresa.id}/tipo/${tipoSelecionado}`,
        {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ texto: draftText }),
        }
      )
      if (res.ok) {
        setMensagens((prev) => ({ ...prev, [tipoSelecionado]: draftText }))
        toast({ title: 'Mensagem salva com sucesso!' })
      } else {
        toast({ title: 'Erro ao salvar mensagem', variant: 'destructive' })
      }
    } catch {
      toast({ title: 'Erro ao salvar mensagem', variant: 'destructive' })
    } finally {
      setSavingMsg(false)
    }
  }

  if (loadingConfig) {
    return (
      <div className="flex items-center justify-center py-16 gap-2 text-[#A78BCC]">
        <Loader2 size={16} className="animate-spin" />
        <span className="text-sm">Carregando...</span>
      </div>
    )
  }

  const tipoInfo = TIPOS.find((t) => t.tipo === tipoSelecionado)!

  return (
    <div>
      {/* ── Sub-tab bar ─────────────────────────────────────────────────────── */}
      <div className="flex gap-1 border-b border-[rgba(124,77,255,0.2)] mb-6">
        <button
          onClick={() => setSubTab('configuracoes')}
          className={`flex items-center gap-2 px-4 py-2.5 text-sm font-medium transition-colors border-b-2 -mb-px ${
            subTab === 'configuracoes'
              ? 'border-[#7C4DFF] text-[#F5F0FF]'
              : 'border-transparent text-[#A78BCC] hover:text-[#F5F0FF]'
          }`}
        >
          <Settings size={14} />
          Configurações
        </button>
        <button
          onClick={() => setSubTab('mensagens')}
          className={`flex items-center gap-2 px-4 py-2.5 text-sm font-medium transition-colors border-b-2 -mb-px ${
            subTab === 'mensagens'
              ? 'border-[#7C4DFF] text-[#F5F0FF]'
              : 'border-transparent text-[#A78BCC] hover:text-[#F5F0FF]'
          }`}
        >
          <MessageSquare size={14} />
          Mensagens Padrão
        </button>
      </div>

      {/* ── Configurações ───────────────────────────────────────────────────── */}
      {subTab === 'configuracoes' && (
        <div className="space-y-5 max-w-xl">
          {/* Número */}
          <div className="space-y-2">
            <label className="text-xs font-semibold text-[#A78BCC] uppercase tracking-wide">
              Número de WhatsApp da Clínica
            </label>
            <div className="flex items-center gap-3">
              <select className="px-3 py-2 rounded-lg border border-[rgba(124,77,255,0.25)] bg-[#120328] text-[#F5F0FF] text-sm focus:outline-none focus:border-[#7C4DFF]">
                <option value="+55">🇧🇷 +55</option>
              </select>
              <input
                type="text"
                value={numeroWhatsapp}
                onChange={(e) => setNumeroWhatsapp(e.target.value)}
                placeholder="(00) 00000-0000"
                className="flex-1 px-3 py-2 rounded-lg border border-[rgba(124,77,255,0.25)] bg-[#120328] text-[#F5F0FF] text-sm placeholder:text-[#6B4E8A] focus:outline-none focus:border-[#7C4DFF]"
              />
            </div>
          </div>

          {/* Permissões */}
          <label className="flex items-start gap-3 p-3 rounded-lg border border-[rgba(124,77,255,0.25)] bg-[#120328] cursor-pointer hover:border-[#7C4DFF] transition-colors">
            <div className="relative flex items-center shrink-0 mt-0.5">
              <input
                type="checkbox"
                checked={permitirProf}
                onChange={(e) => setPermitirProf(e.target.checked)}
                className="peer sr-only"
              />
              <div className="w-10 h-5 bg-[#2D1B4E] rounded-full peer-checked:bg-[#7C4DFF] transition-colors" />
              <div className={`absolute top-0.5 w-4 h-4 bg-white rounded-full shadow transition-transform ${permitirProf ? 'translate-x-5' : 'translate-x-0.5'}`} />
            </div>
            <span className="text-sm text-[#F5F0FF]">
              Permitir que profissionais visualizem telefone dos pacientes e disparem mensagens
            </span>
          </label>

          {/* Disparo automático */}
          <div className="space-y-2">
            <label className="text-xs font-semibold text-[#A78BCC] uppercase tracking-wide">
              Envio de SMS Automático
            </label>
            <label className="flex items-center gap-3 cursor-pointer">
              <input
                type="radio"
                name="sms"
                checked={envioAuto && !riscoFalta}
                onChange={() => { setEnvioAuto(true); setRiscoFalta(false) }}
                className="w-4 h-4 accent-[#7C4DFF]"
              />
              <span className="text-sm text-[#F5F0FF]">Ativar Disparo Automático</span>
            </label>
            <label className="flex items-center gap-3 cursor-pointer">
              <input
                type="radio"
                name="sms"
                checked={riscoFalta}
                onChange={() => { setEnvioAuto(false); setRiscoFalta(true) }}
                className="w-4 h-4 accent-[#7C4DFF]"
              />
              <span className="text-sm text-[#F5F0FF]">Enviar somente com risco de falta</span>
            </label>
          </div>

          {/* Horário */}
          <div className="space-y-2">
            <label className="text-xs font-semibold text-[#A78BCC] uppercase tracking-wide">
              Disparar em:
            </label>
            <select
              value={horario}
              onChange={(e) => setHorario(e.target.value)}
              className="w-full px-3 py-2 rounded-lg border border-[rgba(124,77,255,0.25)] bg-[#120328] text-[#F5F0FF] text-sm focus:outline-none focus:border-[#7C4DFF]"
            >
              <option value="TODO_DIA_7AM">Todo dia — 7h</option>
              <option value="TODO_DIA_8AM">Todo dia — 8h</option>
              <option value="TODO_DIA_9AM">Todo dia — 9h</option>
              <option value="TODO_DIA_10AM">Todo dia — 10h</option>
            </select>
          </div>

          <div className="flex justify-end pt-2">
            <button
              onClick={handleSalvarConfig}
              disabled={savingConfig}
              className="flex items-center gap-1.5 px-5 py-2 rounded-lg bg-[#7C4DFF] hover:bg-[#5B21B6] disabled:opacity-50 text-white text-sm font-semibold transition-colors"
            >
              {savingConfig && <Loader2 size={13} className="animate-spin" />}
              Salvar Configurações
            </button>
          </div>
        </div>
      )}

      {/* ── Mensagens Padrão ────────────────────────────────────────────────── */}
      {subTab === 'mensagens' && (
        <div className="space-y-5 max-w-xl">
          <div>
            <p className="text-xs text-[#A78BCC]">
              Configure os textos dos avisos automáticos. Use variáveis como{' '}
              <span className="text-[#EF4444]">#nome_paciente#</span>,{' '}
              <span className="text-[#EF4444]">#nome_profissional#</span>,{' '}
              <span className="text-[#EF4444]">#data_e_hora_agendamento#</span>.
            </p>
          </div>

          {!initialEmpresa?.id ? (
            <div className="px-4 py-3 rounded-lg border border-[rgba(250,204,21,0.2)] bg-[rgba(250,204,21,0.06)] text-xs text-[#FACC15]">
              Empresa não identificada. Faça login novamente para editar as mensagens.
            </div>
          ) : loadingMsgs ? (
            <div className="flex items-center gap-2 py-4 text-[#A78BCC]">
              <Loader2 size={14} className="animate-spin" />
              <span className="text-xs">Carregando mensagens...</span>
            </div>
          ) : (
            <div className="space-y-4">
              {/* Select tipo */}
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-[#A78BCC] uppercase tracking-wide">
                  Tipo de Mensagem
                </label>
                <select
                  value={tipoSelecionado}
                  onChange={(e) => handleTipoChange(e.target.value as TipoMensagem)}
                  className="w-full px-3 py-2 rounded-lg border border-[rgba(124,77,255,0.25)] bg-[#120328] text-[#F5F0FF] text-sm focus:outline-none focus:border-[#7C4DFF]"
                >
                  {TIPOS.map(({ tipo, label }) => (
                    <option key={tipo} value={tipo}>{label}</option>
                  ))}
                </select>
                <p className="text-xs text-[#6B4E8A]">{tipoInfo.desc}</p>
              </div>

              {/* Textarea */}
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-[#A78BCC] uppercase tracking-wide">
                  Texto da Mensagem
                </label>
                <textarea
                  value={draftText}
                  onChange={(e) => setDraftText(e.target.value)}
                  rows={7}
                  placeholder="Digite o texto da mensagem..."
                  className="w-full bg-[#0D0520] border border-[rgba(124,77,255,0.25)] rounded-lg px-3 py-2.5 text-sm text-[#F5F0FF] placeholder:text-[#6B4E8A] focus:outline-none focus:border-[#7C4DFF] resize-none transition-colors"
                />
              </div>

              <div className="flex justify-end">
                <button
                  onClick={handleSalvarMensagem}
                  disabled={savingMsg || !draftText.trim()}
                  className="flex items-center gap-1.5 px-5 py-2 rounded-lg bg-[#7C4DFF] hover:bg-[#5B21B6] disabled:opacity-50 text-white text-sm font-semibold transition-colors"
                >
                  {savingMsg && <Loader2 size={13} className="animate-spin" />}
                  Salvar Mensagem
                </button>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  )
}

