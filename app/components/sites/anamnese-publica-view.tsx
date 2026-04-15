'use client'

import { useState } from 'react'
import Image from 'next/image'
import { CheckCircle2, Loader2, AlertCircle } from 'lucide-react'

const API = process.env.NEXT_PUBLIC_API_URL ?? ''

interface Pergunta {
  id: string
  texto: string
  tipoResposta: string
  ordem: number
  ativa: boolean
}

interface Anamnese {
  id: string
  titulo: string
  empresaId: string
  perguntas: Pergunta[]
}

interface Props {
  anamnese: Anamnese
  pacienteId: string
  pacienteNome: string
  empresaNome: string
  empresaLogo: string | null
  jaRespondida: boolean
}

type Opcao = 'SIM' | 'NAO' | 'NENHUM'

interface Resposta {
  opcao: Opcao
  texto: string
}

export default function AnamnesePublicaView({
  anamnese,
  pacienteId,
  pacienteNome,
  empresaNome,
  empresaLogo,
  jaRespondida: jaRespondidaInicial,
}: Props) {
  const perguntas = anamnese.perguntas.filter((p) => p.ativa)
  const [respostas, setRespostas] = useState<Record<string, Resposta>>({})
  const [enviando, setEnviando] = useState(false)
  const [respondida, setRespondida] = useState(jaRespondidaInicial)
  const [erro, setErro] = useState<string | null>(null)

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

  async function handleEnviar() {
    setEnviando(true)
    setErro(null)
    try {
      const itens = perguntas.map((p) => ({
        perguntaId: p.id,
        opcao: respostas[p.id]?.opcao ?? 'NENHUM',
        texto: respostas[p.id]?.texto ?? '',
      }))

      const res = await fetch(`${API}/api/v1/respostas-anamnese`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          pacienteId,
          anamneseId: anamnese.id,
          itens,
        }),
      })

      if (!res.ok) throw new Error()
      setRespondida(true)
    } catch {
      setErro('Não foi possível enviar suas respostas. Tente novamente.')
    } finally {
      setEnviando(false)
    }
  }

  // ── Já respondida ──────────────────────────────────────────────────────────
  if (respondida) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center px-4">
        <div className="w-full max-w-md bg-white rounded-2xl shadow-sm border border-gray-100 p-8 text-center">
          {empresaLogo && (
            <div className="flex justify-center mb-6">
              <Image src={empresaLogo} alt={empresaNome} width={120} height={48} className="object-contain h-12 w-auto" />
            </div>
          )}
          <div className="flex justify-center mb-4">
            <CheckCircle2 size={52} className="text-emerald-500" />
          </div>
          <h1 className="text-xl font-bold text-gray-900 mb-2">Anamnese respondida!</h1>
          <p className="text-gray-500 text-sm leading-relaxed">
            {pacienteNome ? `Obrigado, ${pacienteNome.split(' ')[0]}! ` : ''}
            Suas respostas foram registradas com sucesso. A equipe de{' '}
            <strong>{empresaNome}</strong> já tem acesso ao questionário.
          </p>
        </div>
      </div>
    )
  }

  // ── Formulário ─────────────────────────────────────────────────────────────
  return (
    <div className="min-h-screen bg-gray-50 py-10 px-4">
      <div className="w-full max-w-xl mx-auto space-y-6">

        {/* Header */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 px-6 py-5">
          {empresaLogo && (
            <div className="flex justify-center mb-4">
              <Image src={empresaLogo} alt={empresaNome} width={120} height={48} className="object-contain h-12 w-auto" />
            </div>
          )}
          {!empresaLogo && empresaNome && (
            <p className="text-center text-xs font-semibold text-gray-400 uppercase tracking-widest mb-3">{empresaNome}</p>
          )}
          <h1 className="text-lg font-bold text-gray-900 text-center">{anamnese.titulo}</h1>
          {pacienteNome && (
            <p className="text-center text-sm text-gray-500 mt-1">
              Olá, <strong>{pacienteNome.split(' ')[0]}</strong>! Preencha o questionário abaixo antes do seu atendimento.
            </p>
          )}
        </div>

        {/* Perguntas */}
        <div className="space-y-4">
          {perguntas.map((pergunta, i) => {
            const resp = respostas[pergunta.id] ?? { opcao: 'NENHUM', texto: '' }
            const showSim = pergunta.tipoResposta === 'SIM_NAO' || pergunta.tipoResposta === 'AMBOS'
            const showTexto = pergunta.tipoResposta === 'CAMPO_ABERTO' || pergunta.tipoResposta === 'TEXTO' || pergunta.tipoResposta === 'AMBOS'

            return (
              <div key={pergunta.id} className="bg-white rounded-2xl shadow-sm border border-gray-100 px-5 py-4 space-y-3">
                <p className="text-sm font-semibold text-gray-800">
                  {i + 1}. {pergunta.texto}
                </p>
                {showSim && (
                  <div className="flex items-center gap-5">
                    {(['SIM', 'NAO'] as const).map((op) => (
                      <button
                        key={op}
                        type="button"
                        onClick={() => setOpcao(pergunta.id, op)}
                        className="flex items-center gap-2 text-sm text-gray-600 hover:text-gray-900 transition-colors"
                      >
                        <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center transition-colors ${
                          resp.opcao === op
                            ? 'border-violet-600 bg-violet-600'
                            : 'border-gray-300'
                        }`}>
                          {resp.opcao === op && <div className="w-2 h-2 rounded-full bg-white" />}
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
                    placeholder="Digite sua resposta aqui..."
                    className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm text-gray-800 placeholder-gray-300 focus:outline-none focus:border-violet-500 resize-y min-h-[72px] transition-colors"
                  />
                )}
              </div>
            )
          })}
        </div>

        {/* Erro */}
        {erro && (
          <div className="flex items-center gap-2 px-4 py-3 bg-red-50 border border-red-200 rounded-xl text-sm text-red-600">
            <AlertCircle size={15} />
            {erro}
          </div>
        )}

        {/* Botão enviar */}
        <button
          type="button"
          onClick={handleEnviar}
          disabled={enviando || perguntas.length === 0}
          className="w-full flex items-center justify-center gap-2 bg-violet-600 hover:bg-violet-700 disabled:opacity-50 text-white text-sm font-semibold py-3 rounded-xl transition-colors"
        >
          {enviando && <Loader2 size={15} className="animate-spin" />}
          Enviar respostas
        </button>

        <p className="text-center text-xs text-gray-400 pb-6">
          Powered by <strong>DEV2B</strong>
        </p>
      </div>
    </div>
  )
}
