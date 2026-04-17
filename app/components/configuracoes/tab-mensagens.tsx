'use client'

import { useState, useEffect, useCallback, useRef } from 'react'
import { MessageSquare, Settings, Loader2, HelpCircle } from 'lucide-react'
import { MensagemEditor, textoParaHtml, htmlParaTexto } from './mensagem-editor'
import { useToast } from '@/hooks/use-toast'
import type { UsuarioData, EmpresaData } from '@/app/dashboard/configuracoes/page'

const API_URL = process.env.NEXT_PUBLIC_API_URL ?? ''

// --- Types --------------------------------------------------------------------

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

// --- Metadata -----------------------------------------------------------------

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

// --- Tooltip ------------------------------------------------------------------

function Tooltip({ text }: { text: string }) {
  const [visible, setVisible] = useState(false)
  const ref = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (!visible) return
    function handleClick(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) setVisible(false)
    }
    document.addEventListener('mousedown', handleClick)
    return () => document.removeEventListener('mousedown', handleClick)
  }, [visible])

  return (
    <div ref={ref} className="relative inline-flex items-center">
      <button
        type="button"
        onMouseEnter={() => setVisible(true)}
        onMouseLeave={() => setVisible(false)}
        onClick={() => setVisible(v => !v)}
        className="flex items-center justify-center rounded-full text-[var(--d2b-text-muted)] hover:text-[#7C4DFF] transition-colors"
        aria-label="Informação"
      >
        <HelpCircle size={14} />
      </button>
      {visible && (
        <div
          className="absolute left-5 top-1/2 -translate-y-1/2 z-50 w-64 rounded-lg px-3 py-2.5 text-xs leading-relaxed shadow-lg pointer-events-none"
          style={{
            background: 'var(--d2b-bg-elevated)',
            border: '1px solid var(--d2b-border-strong)',
            color: 'var(--d2b-text-primary)',
          }}
        >
          {text}
        </div>
      )}
    </div>
  )
}

// --- Component ----------------------------------------------------------------

export function TabMensagens({ initialUsuario, initialEmpresa }: TabMensagensProps) {
  const { toast } = useToast()

  // sub-tabs
  type SubTab = 'configuracoes' | 'mensagens'
  const [subTab, setSubTab] = useState<SubTab>('configuracoes')

  // -- Config state ------------------------------------------------------------
  const [loadingConfig, setLoadingConfig] = useState(true)
  const [savingConfig, setSavingConfig] = useState(false)
  const [numeroWhatsapp, setNumeroWhatsapp] = useState('')

  function maskPhone(v: string) {
    const d = v.replace(/\D/g, '').slice(0, 11)
    if (d.length <= 2) return d
    if (d.length <= 6) return `(${d.slice(0, 2)}) ${d.slice(2)}`
    if (d.length <= 10) return `(${d.slice(0, 2)}) ${d.slice(2, 6)}-${d.slice(6)}`
    return `(${d.slice(0, 2)}) ${d.slice(2, 7)}-${d.slice(7)}`
  }
  const [permitirProf, setPermitirProf] = useState(false)
  const [envioAuto, setEnvioAuto] = useState(false)
  const [riscoFalta, setRiscoFalta] = useState(false)
  const [horario, setHorario] = useState('TODO_DIA_7AM')

  // -- Mensagens state ---------------------------------------------------------
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

  // -- Load config --------------------------------------------------------------
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

  // -- Load mensagens -----------------------------------------------------------
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
        setDraftText(textoParaHtml(map['CONFIRMAR_AGENDAMENTO']))
      }
    } catch { /* silencioso */ } finally {
      setLoadingMsgs(false)
    }
  }, [initialEmpresa?.id])

  useEffect(() => { carregarConfig() }, [carregarConfig])
  useEffect(() => { carregarMensagens() }, [carregarMensagens])

  // -- Handlers ----------------------------------------------------------------
  const handleTipoChange = (tipo: TipoMensagem) => {
    setTipoSelecionado(tipo)
    setDraftText(textoParaHtml(mensagens[tipo]))
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
          body: JSON.stringify({ texto: htmlParaTexto(draftText) }),
        }
      )
      if (res.ok) {
        setMensagens((prev) => ({ ...prev, [tipoSelecionado]: htmlParaTexto(draftText) }))
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
      <div className="flex items-center justify-center py-16 gap-2 text-[var(--d2b-text-secondary)]">
        <Loader2 size={16} className="animate-spin" />
        <span className="text-sm">Carregando...</span>
      </div>
    )
  }

  const tipoInfo = TIPOS.find((t) => t.tipo === tipoSelecionado)!

  return (
    <div>
      {/* -- Sub-tab bar ------------------------------------------------------- */}
      <div className="flex gap-1 border-b border-[var(--d2b-border-strong)] mb-6">
        <button
          onClick={() => setSubTab('configuracoes')}
          className={`flex items-center gap-2 px-4 py-2.5 text-sm font-medium transition-colors border-b-2 -mb-px ${
            subTab === 'configuracoes'
              ? 'border-[#7C4DFF] text-[var(--d2b-text-primary)]'
              : 'border-transparent text-[var(--d2b-text-secondary)] hover:text-[var(--d2b-text-primary)]'
          }`}
        >
          <Settings size={14} />
          Configurações
        </button>
        <button
          onClick={() => setSubTab('mensagens')}
          className={`flex items-center gap-2 px-4 py-2.5 text-sm font-medium transition-colors border-b-2 -mb-px ${
            subTab === 'mensagens'
              ? 'border-[#7C4DFF] text-[var(--d2b-text-primary)]'
              : 'border-transparent text-[var(--d2b-text-secondary)] hover:text-[var(--d2b-text-primary)]'
          }`}
        >
          <MessageSquare size={14} />
          Mensagens Padrão
        </button>
      </div>

      {/* -- Configurações ----------------------------------------------------- */}
      {subTab === 'configuracoes' && (
        <div className="space-y-5 max-w-xl">
          {/* Número */}
          <div data-tour="d2b-msg-numero" className="space-y-2">
            <label className="text-xs font-semibold text-[var(--d2b-text-secondary)] uppercase tracking-wide">
              Número de WhatsApp da Clínica
            </label>
            <div className="flex items-center gap-3">
              <select className="px-3 py-2 rounded-lg border border-[var(--d2b-border-strong)] bg-[var(--d2b-bg-surface)] text-[var(--d2b-text-primary)] text-sm focus:outline-none focus:border-[#7C4DFF]">
                <option value="+55">🇧🇷 +55</option>
              </select>
              <input
                type="text"
                value={numeroWhatsapp}
                onChange={(e) => setNumeroWhatsapp(maskPhone(e.target.value))}
                placeholder="(00) 00000-0000"
                inputMode="numeric"
                className="flex-1 px-3 py-2 rounded-lg border border-[var(--d2b-border-strong)] bg-[var(--d2b-bg-surface)] text-[var(--d2b-text-primary)] text-sm placeholder:text-[var(--d2b-text-muted)] focus:outline-none focus:border-[#7C4DFF]"
              />
            </div>
          </div>

          {/* Permissões */}
          <label data-tour="d2b-msg-permitir" className="flex items-start gap-3 p-3 rounded-lg border border-[var(--d2b-border-strong)] bg-[var(--d2b-bg-surface)] cursor-pointer hover:border-[#7C4DFF] transition-colors">
            <div className="relative flex items-center shrink-0 mt-0.5">
              <input
                type="checkbox"
                checked={permitirProf}
                onChange={(e) => setPermitirProf(e.target.checked)}
                className="peer sr-only"
              />
              <div className="w-10 h-5 bg-[var(--d2b-bg-elevated)] rounded-full peer-checked:bg-[#7C4DFF] transition-colors" />
              <div className={`absolute top-0.5 w-4 h-4 bg-white rounded-full shadow transition-transform ${permitirProf ? 'translate-x-5' : 'translate-x-0.5'}`} />
            </div>
            <span className="text-sm text-[var(--d2b-text-primary)]">
              Permitir que profissionais visualizem telefone dos pacientes e disparem mensagens
            </span>
          </label>

          {/* Disparo automático */}
          <div data-tour="d2b-msg-envio" className="space-y-2">
            <div className="flex items-center gap-1.5">
              <label className="text-xs font-semibold text-[var(--d2b-text-secondary)] uppercase tracking-wide">
                Envio Automático via WhatsApp
              </label>
              <Tooltip text="Esta configuração só funcionará se o WhatsApp estiver integrado e configurado no sistema." />
            </div>
            <label className="flex items-center gap-3 cursor-pointer">
              <span className={`w-4 h-4 rounded-full border-2 flex items-center justify-center shrink-0 transition-colors ${envioAuto && !riscoFalta ? 'border-[#7C4DFF]' : 'border-[var(--d2b-border-strong)]'}`}
                onClick={() => { setEnvioAuto(true); setRiscoFalta(false) }}>
                {(envioAuto && !riscoFalta) && <span className="w-2 h-2 rounded-full bg-[#7C4DFF]" />}
              </span>
              <span className="text-sm text-[var(--d2b-text-primary)]" onClick={() => { setEnvioAuto(true); setRiscoFalta(false) }}>Ativar Disparo Automático</span>
            </label>
            <label className="flex items-center gap-3 cursor-pointer">
              <span className={`w-4 h-4 rounded-full border-2 flex items-center justify-center shrink-0 transition-colors ${riscoFalta ? 'border-[#7C4DFF]' : 'border-[var(--d2b-border-strong)]'}`}
                onClick={() => { setEnvioAuto(false); setRiscoFalta(true) }}>
                {riscoFalta && <span className="w-2 h-2 rounded-full bg-[#7C4DFF]" />}
              </span>
              <span className="text-sm text-[var(--d2b-text-primary)]" onClick={() => { setEnvioAuto(false); setRiscoFalta(true) }}>Enviar somente com risco de falta</span>
            </label>
          </div>

          {/* Horário */}
          <div data-tour="d2b-msg-horario" className="space-y-2">
            <label className="text-xs font-semibold text-[var(--d2b-text-secondary)] uppercase tracking-wide">
              Disparar em:
            </label>
            <select
              value={horario}
              onChange={(e) => setHorario(e.target.value)}
              className="w-full px-3 py-2 rounded-lg border border-[var(--d2b-border-strong)] bg-[var(--d2b-bg-surface)] text-[var(--d2b-text-primary)] text-sm focus:outline-none focus:border-[#7C4DFF]"
            >
              <option value="TODO_DIA_7AM">Todo dia é 7h</option>
              <option value="TODO_DIA_8AM">Todo dia é 8h</option>
              <option value="TODO_DIA_9AM">Todo dia é 9h</option>
              <option value="TODO_DIA_10AM">Todo dia é 10h</option>
            </select>
          </div>

          <div className="flex justify-end pt-2">
            <button
              data-tour="d2b-msg-salvar"
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

      {/* -- Mensagens Padrão -------------------------------------------------- */}
      {subTab === 'mensagens' && (
        <div className="space-y-5 max-w-xl">
          <div>
            <p className="text-xs text-[var(--d2b-text-secondary)]">
              Configure os textos dos avisos automáticos. Use os botões de variável na barra do editor para inserir campos dinâmicos.
            </p>
          </div>

          {!initialEmpresa?.id ? (
            <div className="px-4 py-3 rounded-lg border border-[rgba(250,204,21,0.2)] bg-[rgba(250,204,21,0.06)] text-xs text-[#FACC15]">
              Empresa não identificada. Faça login novamente para editar as mensagens.
            </div>
          ) : loadingMsgs ? (
            <div className="flex items-center gap-2 py-4 text-[var(--d2b-text-secondary)]">
              <Loader2 size={14} className="animate-spin" />
              <span className="text-xs">Carregando mensagens...</span>
            </div>
          ) : (
            <div className="space-y-4">
              {/* Select tipo */}
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-[var(--d2b-text-secondary)] uppercase tracking-wide">
                  Tipo de Mensagem
                </label>
                <select
                  value={tipoSelecionado}
                  onChange={(e) => handleTipoChange(e.target.value as TipoMensagem)}
                  className="w-full px-3 py-2 rounded-lg border border-[var(--d2b-border-strong)] bg-[var(--d2b-bg-surface)] text-[var(--d2b-text-primary)] text-sm focus:outline-none focus:border-[#7C4DFF]"
                >
                  {TIPOS.map(({ tipo, label }) => (
                    <option key={tipo} value={tipo}>{label}</option>
                  ))}
                </select>
                <p className="text-xs text-[var(--d2b-text-muted)]">{tipoInfo.desc}</p>
              </div>

              {/* Editor */}
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-[var(--d2b-text-secondary)] uppercase tracking-wide">
                  Texto da Mensagem
                </label>
                <MensagemEditor
                  value={draftText}
                  onChange={setDraftText}
                  minHeight={180}
                />
              </div>

              <div className="flex justify-end">
                <button
                  onClick={handleSalvarMensagem}
                  disabled={savingMsg || !draftText.replace(/<[^>]*>/g, '').trim()}
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

