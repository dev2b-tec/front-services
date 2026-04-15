'use client'

import { useState, useEffect, useCallback, useRef } from 'react'
import { useRouter } from 'next/navigation'
import { ChevronDown, Settings, FileText, Pencil, Printer, Send, X, RefreshCw, AlertCircle, Link, MessageCircle, Check } from 'lucide-react'
import { useToast } from '@/hooks/use-toast'

// ─── Types ───────────────────────────────────────────────────────────────────

interface Pergunta {
  id: string
  texto: string
  tipoResposta: string
  ordem: number
  ativa: boolean
}

interface AnamneseModelo {
  id: string
  titulo: string
  empresaId: string
  perguntas: Pergunta[]
}

type Opcao = 'SIM' | 'NAO' | 'NENHUM'

interface Resposta {
  opcao: Opcao
  texto: string
}

interface RespostaItem {
  id: string
  perguntaId: string
  perguntaTexto: string
  opcao: string
  texto: string | null
}

interface RespostaAnamnese {
  id: string
  pacienteId: string
  anamneseId: string
  profissional: string | null
  data: string
  itens: RespostaItem[]
}

// ─── Helpers ─────────────────────────────────────────────────────────────────

const MENSAGEM_PADRAO = '#nome_paciente#. Solicito que o questionário abaixo seja respondido antes do atendimento\n#link_anamnese#'

function MensagemComVariaveis({ texto }: { texto: string }) {
  const parts = texto.split(/(#[^#]+#)/g)
  return (
    <>
      {parts.map((p, i) =>
        /^#.+#$/.test(p)
          ? <span key={i} className="text-[#C084FC] font-semibold">{p}</span>
          : <span key={i}>{p}</span>
      )}
    </>
  )
}

// ─── EditarMensagemModal ──────────────────────────────────────────────────────

function EditarMensagemModal({ onClose }: { onClose: () => void }) {
  const [mensagem, setMensagem] = useState(MENSAGEM_PADRAO)

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm">
      <div className="w-[560px] bg-[var(--d2b-bg-elevated)] border border-[var(--d2b-border-strong)] rounded-2xl shadow-2xl flex flex-col">
        <div className="flex items-center justify-between px-5 py-4 border-b border-[var(--d2b-border)]">
          <span className="text-base font-semibold text-[var(--d2b-text-primary)]">Editar Mensagem</span>
          <button onClick={onClose} className="w-7 h-7 flex items-center justify-center rounded-lg text-[var(--d2b-text-muted)] hover:text-[var(--d2b-text-primary)] hover:bg-[var(--d2b-hover)] transition-colors">
            <X size={15} />
          </button>
        </div>
        <div className="px-5 py-5 space-y-3">
          <div className="relative">
            <textarea
              rows={6}
              value={mensagem}
              onChange={(e) => setMensagem(e.target.value)}
              className="relative z-10 w-full bg-transparent border border-[var(--d2b-border-strong)] rounded-xl px-4 py-3 text-sm text-transparent caret-[#F5F0FF] focus:outline-none focus:border-[#7C4DFF] resize-none transition-colors"
              spellCheck={false}
            />
            <div aria-hidden className="pointer-events-none absolute inset-0 px-4 py-3 text-sm text-[var(--d2b-text-primary)] whitespace-pre-wrap break-words rounded-xl z-0 leading-[1.5rem]">
              <MensagemComVariaveis texto={mensagem} />
            </div>
          </div>
          <p className="text-xs text-[var(--d2b-text-muted)] leading-relaxed">
            Adicione variáveis inserindo hastag(#) no campo de texto onde desejar. Elas serão substituídas automaticamente com seus valores no momento de criação do documento.
          </p>
        </div>
        <div className="flex items-center justify-end gap-3 px-5 py-4 border-t border-[var(--d2b-border)]">
          <button onClick={onClose} className="px-4 py-2 text-sm text-[var(--d2b-text-secondary)] hover:text-[var(--d2b-text-primary)] transition-colors">Cancelar</button>
          <button onClick={onClose} className="px-5 py-2 bg-[#7C4DFF] hover:bg-[#5B21B6] text-white text-sm font-semibold rounded-lg transition-colors">Salvar</button>
        </div>
      </div>
    </div>
  )
}

// ─── TabAnamnese ──────────────────────────────────────────────────────────────

export function TabAnamnese({ pacienteId, empresaId }: { pacienteId: string; empresaId: string | null }) {
  const { toast } = useToast()
  const router = useRouter()

  const [modelos, setModelos] = useState<AnamneseModelo[]>([])
  const [modeloSelecionado, setModeloSelecionado] = useState<AnamneseModelo | null>(null)
  const [modeloDropOpen, setModeloDropOpen] = useState(false)
  const [acoesOpen, setAcoesOpen] = useState(false)
  const [editarMensagemOpen, setEditarMensagemOpen] = useState(false)
  const [envioOpen, setEnvioOpen] = useState(false)
  const [linkCopiado, setLinkCopiado] = useState(false)
  const envioRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (!envioOpen) return
    function handleClick(e: MouseEvent) {
      if (envioRef.current && !envioRef.current.contains(e.target as Node)) setEnvioOpen(false)
    }
    document.addEventListener('mousedown', handleClick)
    return () => document.removeEventListener('mousedown', handleClick)
  }, [envioOpen])
  const [carregando, setCarregando] = useState(true)
  const [salvando, setSalvando] = useState(false)

  // respostas: perguntaId -> { opcao, texto }
  const [respostas, setRespostas] = useState<Record<string, Resposta>>({})

  // ── Load templates ─────────────────────────────────────────────────────────
  const carregarModelos = useCallback(async () => {
    if (!empresaId) {
      setCarregando(false)
      return
    }
    try {
      const res = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/api/v1/anamneses/empresa/${empresaId}`
      )
      if (!res.ok) throw new Error()
      const data: AnamneseModelo[] = await res.json()
      const ativos = data.map((m) => ({ ...m, perguntas: m.perguntas.filter((p) => p.ativa) }))
      setModelos(ativos)
      if (ativos.length > 0) setModeloSelecionado(ativos[0])
    } catch {
      toast({ title: 'Erro', description: 'Não foi possível carregar os modelos de anamnese.', variant: 'destructive' })
    } finally {
      setCarregando(false)
    }
  }, [empresaId, toast])

  useEffect(() => { carregarModelos() }, [carregarModelos])

  // ── Load existing patient response when modelo changes ────────────────────
  useEffect(() => {
    if (!modeloSelecionado) return

    setRespostas({})

    async function carregarResposta() {
      try {
        const res = await fetch(
          `${process.env.NEXT_PUBLIC_API_URL}/api/v1/respostas-anamnese/paciente/${pacienteId}/anamnese/${modeloSelecionado!.id}`
        )
        if (res.status === 204 || res.status === 404) return
        if (!res.ok) throw new Error()
        const data: RespostaAnamnese = await res.json()
        const map: Record<string, Resposta> = {}
        for (const item of data.itens) {
          map[item.perguntaId] = {
            opcao: (item.opcao as Opcao) ?? 'NENHUM',
            texto: item.texto ?? '',
          }
        }
        setRespostas(map)
      } catch {
        // Silently ignore — no prior response
      }
    }

    carregarResposta()
  }, [pacienteId, modeloSelecionado])

  // ── Resposta helpers ───────────────────────────────────────────────────────
  function setOpcao(perguntaId: string, opcao: Opcao) {
    setRespostas((prev) => ({
      ...prev,
      [perguntaId]: { opcao, texto: prev[perguntaId]?.texto ?? '' },
    }))
  }

  function setTexto(perguntaId: string, texto: string) {
    setRespostas((prev) => ({
      ...prev,
      [perguntaId]: { opcao: prev[perguntaId]?.opcao ?? 'NENHUM', texto },
    }))
  }

  // ── Save ───────────────────────────────────────────────────────────────────
  async function salvar() {
    if (!modeloSelecionado) return
    setSalvando(true)
    try {
      const itens = modeloSelecionado.perguntas.map((p) => ({
        perguntaId: p.id,
        opcao: respostas[p.id]?.opcao ?? 'NENHUM',
        texto: respostas[p.id]?.texto ?? '',
      }))

      const body = {
        pacienteId,
        anamneseId: modeloSelecionado.id,
        itens,
      }

      const res = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/api/v1/respostas-anamnese`,
        { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(body) }
      )
      if (!res.ok) throw new Error()
      toast({ title: 'Anamnese salva', description: 'Registros salvos com sucesso.' })
    } catch {
      toast({ title: 'Erro', description: 'Não foi possível salvar a anamnese.', variant: 'destructive' })
    } finally {
      setSalvando(false)
    }
  }

  // ── Render ─────────────────────────────────────────────────────────────────
  if (carregando) {
    return (
      <div className="flex-1 flex items-center justify-center gap-3 text-[var(--d2b-text-muted)]">
        <RefreshCw size={16} className="animate-spin" />
        <span className="text-sm">Carregando...</span>
      </div>
    )
  }

  if (!empresaId || modelos.length === 0) {
    return (
      <div className="flex-1 flex flex-col items-center justify-center gap-3 text-center py-20">
        <div className="w-12 h-12 rounded-full bg-[var(--d2b-hover)] flex items-center justify-center">
          <AlertCircle size={20} className="text-[var(--d2b-text-muted)]" />
        </div>
        <p className="text-sm font-semibold text-[var(--d2b-text-secondary)]">Nenhum modelo de anamnese cadastrado</p>
        <p className="text-xs text-[var(--d2b-text-muted)]">Crie modelos em Configurações → Anamneses.</p>
      </div>
    )
  }

  const perguntas = modeloSelecionado?.perguntas ?? []

  return (
    <div className="flex-1 overflow-y-auto">
      {/* Sub-header */}
      <div className="px-6 pt-5 pb-4 border-b border-[var(--d2b-border)] flex items-start justify-between gap-4">
        <div>
          <h2 className="text-base font-semibold text-[var(--d2b-text-primary)]">Anamnese</h2>
          <p className="text-xs text-[var(--d2b-text-secondary)] mt-0.5">Selecione e edite uma anamnese para este paciente.</p>
        </div>
        <div className="flex items-center gap-2 flex-shrink-0">
          <div className="relative">
            <button
              onClick={() => setAcoesOpen((v) => !v)}
              className="flex items-center gap-1.5 bg-[#7C4DFF] hover:bg-[#5B21B6] text-white text-xs font-semibold px-3 py-1.5 rounded-lg transition-colors"
            >
              <Settings size={12} /> Ações <ChevronDown size={12} />
            </button>
            {acoesOpen && (
              <div className="absolute z-30 right-0 mt-1 w-48 bg-[var(--d2b-bg-elevated)] border border-[var(--d2b-border-strong)] rounded-xl shadow-xl overflow-hidden">
                <button
                  onClick={() => {
                    setAcoesOpen(false)
                    const id = modeloSelecionado?.id
                    router.push(`/dashboard/configuracoes?tab=anamneses${id ? `&anamnese=${id}` : ''}`)
                  }}
                  className="w-full flex items-center gap-2.5 px-4 py-2.5 text-sm text-[var(--d2b-text-primary)] hover:bg-[var(--d2b-hover)] transition-colors text-left"
                >
                  <Pencil size={13} className="text-[var(--d2b-text-secondary)]" /> Editar Questionário
                </button>
                <button
                  onClick={() => { setAcoesOpen(false); setEditarMensagemOpen(true) }}
                  className="w-full flex items-center gap-2.5 px-4 py-2.5 text-sm text-[var(--d2b-text-primary)] hover:bg-[var(--d2b-hover)] transition-colors text-left"
                >
                  <FileText size={13} className="text-[var(--d2b-text-secondary)]" /> Editar Mensagem
                </button>
              </div>
            )}
          </div>
        </div>
      </div>

      {editarMensagemOpen && <EditarMensagemModal onClose={() => setEditarMensagemOpen(false)} />}

      <div className="px-6 py-5 space-y-6">
        {/* Modelo selector */}
        <div className="flex items-center gap-2">
          <div className="relative flex-1">
            <button
              onClick={() => setModeloDropOpen((v) => !v)}
              className="w-full flex items-center justify-between bg-[var(--d2b-bg-elevated)] border border-[var(--d2b-border-strong)] rounded-xl px-4 py-2.5 text-sm text-[var(--d2b-text-primary)] hover:border-[#7C4DFF] transition-colors"
            >
              <span>{modeloSelecionado?.titulo ?? 'Selecione...'}</span>
              <ChevronDown size={14} className="text-[var(--d2b-text-muted)]" />
            </button>
            {modeloDropOpen && (
              <div className="absolute z-20 top-full mt-1 left-0 right-0 bg-[var(--d2b-bg-elevated)] border border-[var(--d2b-border-strong)] rounded-xl shadow-xl overflow-hidden">
                {modelos.map((m) => (
                  <button
                    key={m.id}
                    onClick={() => { setModeloSelecionado(m); setModeloDropOpen(false) }}
                    className={`w-full text-left px-4 py-2.5 text-sm transition-colors ${
                      m.id === modeloSelecionado?.id
                        ? 'text-[#7C4DFF] bg-[var(--d2b-hover)]'
                        : 'text-[var(--d2b-text-primary)] hover:bg-[var(--d2b-hover)]'
                    }`}
                  >
                    {m.titulo}
                  </button>
                ))}
              </div>
            )}
          </div>
          <button className="w-9 h-9 flex items-center justify-center rounded-xl border border-[var(--d2b-border-strong)] bg-[var(--d2b-bg-elevated)] text-[#7C4DFF] hover:border-[#7C4DFF] transition-colors" title="Imprimir">
            <Printer size={15} />
          </button>
          <div className="relative" ref={envioRef}>
            <button
              onClick={() => setEnvioOpen((v) => !v)}
              className="w-9 h-9 flex items-center justify-center rounded-xl bg-[#0D9488] hover:bg-[#0F766E] transition-colors"
              title="Enviar"
              disabled={!modeloSelecionado || !empresaId}
            >
              <Send size={13} className="text-white" />
            </button>
            {envioOpen && (
              <div className="absolute z-30 right-0 mt-1 w-52 bg-[var(--d2b-bg-elevated)] border border-[var(--d2b-border-strong)] rounded-xl shadow-xl overflow-hidden">
                <button
                  onClick={() => {
                    if (!empresaId || !modeloSelecionado) return
                    const link = `https://app.dev2b.tec.br/sites/anamninese/${empresaId}/${pacienteId}/${modeloSelecionado.id}`
                    navigator.clipboard.writeText(link).then(() => {
                      setLinkCopiado(true)
                      setTimeout(() => { setLinkCopiado(false); setEnvioOpen(false) }, 1800)
                    })
                  }}
                  className="w-full flex items-center gap-2.5 px-4 py-2.5 text-sm text-[var(--d2b-text-primary)] hover:bg-[var(--d2b-hover)] transition-colors text-left"
                >
                  {linkCopiado
                    ? <><Check size={13} className="text-[#0D9488]" /> Link copiado!</>
                    : <><Link size={13} className="text-[var(--d2b-text-secondary)]" /> Compartilhar link</>}
                </button>
                <button
                  onClick={() => setEnvioOpen(false)}
                  disabled
                  className="w-full flex items-center gap-2.5 px-4 py-2.5 text-sm text-[var(--d2b-text-muted)] cursor-not-allowed text-left opacity-50"
                >
                  <MessageCircle size={13} /> Enviar por WhatsApp
                  <span className="ml-auto text-[10px] bg-[var(--d2b-hover)] px-1.5 py-0.5 rounded text-[var(--d2b-text-muted)]">Em breve</span>
                </button>
              </div>
            )}
          </div>
        </div>

        {/* Questions */}
        {perguntas.length === 0 ? (
          <p className="text-sm text-[var(--d2b-text-muted)] text-center py-8">Este modelo não possui perguntas ativas.</p>
        ) : (
          perguntas.map((pergunta, i) => {
            const resp = respostas[pergunta.id] ?? { opcao: 'NENHUM', texto: '' }
            const showSim = pergunta.tipoResposta === 'SIM_NAO' || pergunta.tipoResposta === 'AMBOS'
            const showTexto = pergunta.tipoResposta === 'CAMPO_ABERTO' || pergunta.tipoResposta === 'TEXTO' || pergunta.tipoResposta === 'AMBOS'

            return (
              <div key={pergunta.id} className="space-y-2">
                <p className="text-sm font-semibold text-[var(--d2b-text-primary)]">
                  {i + 1}. {pergunta.texto}
                </p>
                {showSim && (
                  <div className="flex items-center gap-5">
                    {(['SIM', 'NAO'] as const).map((op) => (
                      <button
                        key={op}
                        onClick={() => setOpcao(pergunta.id, op)}
                        className="flex items-center gap-1.5 text-sm text-[var(--d2b-text-secondary)] hover:text-[var(--d2b-text-primary)] transition-colors"
                      >
                        <div className={`w-4 h-4 rounded-full border-2 flex items-center justify-center transition-colors ${
                          resp.opcao === op ? 'border-[#7C4DFF] bg-[#7C4DFF]' : 'border-[#6B4E8A]'
                        }`}>
                          {resp.opcao === op && <div className="w-1.5 h-1.5 rounded-full bg-white" />}
                        </div>
                        {op === 'SIM' ? 'Sim' : 'Não'}
                      </button>
                    ))}
                  </div>
                )}
                {showTexto && (
                  <textarea
                    rows={3}
                    value={resp.texto}
                    onChange={(e) => setTexto(pergunta.id, e.target.value)}
                    placeholder="Digite aqui"
                    className="w-full bg-[var(--d2b-bg-elevated)] border border-[var(--d2b-border-strong)] rounded-xl px-4 py-2.5 text-sm text-[var(--d2b-text-primary)] placeholder-[#3D2A5A] focus:outline-none focus:border-[#7C4DFF] resize-y min-h-[72px] transition-colors"
                  />
                )}
              </div>
            )
          })
        )}

        {/* Save */}
        <div className="flex justify-end pt-2 pb-4">
          <button
            onClick={salvar}
            disabled={salvando || perguntas.length === 0}
            className="flex items-center gap-2 bg-[#7C4DFF] hover:bg-[#5B21B6] disabled:opacity-50 text-white text-sm font-semibold px-5 py-2.5 rounded-xl transition-colors"
          >
            {salvando ? <RefreshCw size={14} className="animate-spin" /> : null}
            Salvar Anamnese
          </button>
        </div>
      </div>
    </div>
  )
}
