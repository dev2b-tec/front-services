'use client'

import { useState, useEffect } from 'react'
import { Check, Loader2, ArrowUp, ArrowDown } from 'lucide-react'
import type { PlanoInfo, AssinaturaAtual } from './modal-assinatura'

interface StepPlanoProps {
  onNext: (plano: PlanoInfo) => void
  assinaturaAtual?: AssinaturaAtual | null
}

const PLANOS_FALLBACK: PlanoInfo[] = [
  { id: 'smart', nome: 'Smart IA', tipo: 'SMART_IA', valorMensal: 39.90, limiteIaResumos: 50, limiteIaAudios: 30 },
  { id: 'pro', nome: 'Pro IA', tipo: 'PRO_IA', valorMensal: 79.90, limiteIaResumos: 200, limiteIaAudios: 200 },
  { id: 'clinica', nome: 'Clínica IA', tipo: 'CLINICA_IA', valorMensal: 149.90, limiteIaResumos: 9999, limiteIaAudios: 9999 },
]

const PLANO_FEATURES: Record<string, string[]> = {
  SMART_IA: [
    'Agenda Inteligente',
    'Prontuário Eletrônico',
    'Prescrições & Documentos',
    'Gestão Financeira',
    'WhatsApp automáticos',
    'Tele Consulta – 100 min/mês',
    'Gestão de Salas',
    'Canal de ideias',
    `${50} resumos de IA/mês`,
    `${30} transcrições de áudio/mês`,
  ],
  PRO_IA: [
    'Tudo do Smart IA',
    'Auto Agendamento pelo paciente',
    '200 créditos mensais gratuitos',
    'Assinatura digital de documentos',
    'Emissão de notas fiscais',
    'Tele Consulta – 1000 min/mês',
    'Canal de ideias',
    `${200} resumos de IA/mês`,
    `${200} transcrições de áudio/mês`,
  ],
  CLINICA_IA: [
    'Tudo do Pro IA',
    'Múltiplos profissionais',
    'Créditos ilimitados de IA',
    'Tele Consulta ilimitada',
    'Transcrições ilimitadas',
    'Canal de ideias',
    'Gerente de Atendimento Dedicado',
    'Suporte prioritário',
  ],
}

export function StepPlano({ onNext, assinaturaAtual }: StepPlanoProps) {
  const [planos, setPlanos] = useState<PlanoInfo[]>([])
  const [loading, setLoading] = useState(true)
  const [selecionado, setSelecionado] = useState<string | null>(null)
  const [periodo, setPeriodo] = useState<'mensal' | 'semestral'>('mensal')

  useEffect(() => {
    fetch('/api/v1/assinaturas/planos')
      .then(r => r.ok ? r.json() : [])
      .then(data => {
        const list: PlanoInfo[] = Array.isArray(data) && data.length > 0 ? data : PLANOS_FALLBACK
        setPlanos(list)
        setSelecionado(list[0].id)
      })
      .catch(() => {
        setPlanos(PLANOS_FALLBACK)
        setSelecionado(PLANOS_FALLBACK[0].id)
      })
      .finally(() => setLoading(false))
  }, [])

  const desconto = periodo === 'semestral' ? 0.7 : 1

  const planoAtualTipo = assinaturaAtual?.plano?.tipo ?? null

  function getRelacao(plano: PlanoInfo): 'atual' | 'upgrade' | 'downgrade' | null {
    if (!planoAtualTipo) return null
    if (plano.tipo === planoAtualTipo) return 'atual'
    return plano.valorMensal > (assinaturaAtual?.plano?.valorMensal ?? 0) ? 'upgrade' : 'downgrade'
  }

  function handleContinuar() {
    const plano = planos.find(p => p.id === selecionado)
    if (!plano) return
    if (assinaturaAtual && getRelacao(plano) !== 'upgrade') return
    onNext({
      ...plano,
      valorMensal: Number((plano.valorMensal * desconto).toFixed(2)),
    })
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 size={24} className="animate-spin" style={{ color: '#7C4DFF' }} />
      </div>
    )
  }

  return (
    <div className="flex flex-col gap-5">
      {/* Período */}
      <div>
        <p className="text-xs font-semibold mb-2" style={{ color: 'var(--d2b-text-secondary)' }}>
          Período de Contratação
        </p>
        <div className="flex gap-2">
          {(['mensal', 'semestral'] as const).map(p => (
            <button
              key={p}
              onClick={() => setPeriodo(p)}
              className="flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all border"
              style={{
                background: periodo === p ? '#7C4DFF' : 'var(--d2b-bg-elevated)',
                color: periodo === p ? '#fff' : 'var(--d2b-text-secondary)',
                borderColor: periodo === p ? '#7C4DFF' : 'var(--d2b-border-strong)',
              }}
            >
              {p === 'mensal' ? 'Mensal' : 'Semestral'}
              {p === 'semestral' && (
                <span className="text-[10px] px-1.5 py-0.5 rounded-full font-bold"
                  style={{ background: 'rgba(255,255,255,0.25)' }}>
                  -30%
                </span>
              )}
            </button>
          ))}
        </div>
      </div>

      {/* Planos */}
      <div className="flex flex-col gap-3">
        {planos.map(plano => {
          const valor = (plano.valorMensal * desconto).toFixed(2).replace('.', ',')
          const features = PLANO_FEATURES[plano.tipo] ?? []
          const isSelected = selecionado === plano.id
          const relacao = getRelacao(plano)
          const isAtual = relacao === 'atual'
          const isDowngrade = relacao === 'downgrade'
          const isUpgradeOp = relacao === 'upgrade'
          const isDisabled = !!assinaturaAtual && !isUpgradeOp
          const diferenca = assinaturaAtual && isUpgradeOp
            ? plano.valorMensal * desconto - assinaturaAtual.plano.valorMensal
            : null

          return (
            <button
              key={plano.id}
              onClick={() => !isDisabled && setSelecionado(plano.id)}
              disabled={isDisabled}
              className="w-full text-left p-4 rounded-xl border transition-all relative"
              style={{
                background: isAtual ? 'rgba(20,184,166,0.06)'
                  : isSelected ? 'rgba(124,77,255,0.08)' : 'var(--d2b-bg-elevated)',
                borderColor: isAtual ? 'rgba(20,184,166,0.4)'
                  : isSelected ? '#7C4DFF' : 'var(--d2b-border)',
                opacity: isDisabled && !isAtual ? 0.45 : 1,
                cursor: isDisabled ? 'not-allowed' : 'pointer',
              }}
            >
              {/* Badge de relação */}
              {relacao && (
                <div
                  className="absolute top-3 right-3 flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold"
                  style={{
                    background: isAtual ? 'rgba(20,184,166,0.15)'
                      : isUpgradeOp ? 'rgba(124,77,255,0.15)' : 'rgba(100,116,139,0.15)',
                    color: isAtual ? '#14B8A6' : isUpgradeOp ? '#7C4DFF' : '#64748B',
                  }}
                >
                  {isAtual ? <><Check size={10} /> Plano atual</>
                    : isUpgradeOp ? <><ArrowUp size={10} /> Upgrade</>
                    : <><ArrowDown size={10} /> Downgrade</>}
                </div>
              )}

              <div className="flex items-start justify-between gap-3 mb-3">
                <div className="flex items-center gap-3">
                  <div
                    className="w-5 h-5 rounded border-2 flex items-center justify-center flex-shrink-0 transition-all"
                    style={{
                      borderColor: isSelected && !isDisabled ? '#7C4DFF' : 'var(--d2b-border-strong)',
                      background: isSelected && !isDisabled ? '#7C4DFF' : 'transparent',
                    }}
                  >
                    {isSelected && !isDisabled && <Check size={12} className="text-white" strokeWidth={3} />}
                  </div>
                  <div>
                    <p className="text-sm font-semibold" style={{ color: 'var(--d2b-text-primary)' }}>
                      {plano.nome}
                    </p>
                  </div>
                </div>
                <div className="text-right flex-shrink-0 pr-16">
                  <p className="text-base font-bold" style={{ color: '#7C4DFF' }}>
                    R$ {valor}
                  </p>
                  <p className="text-[10px]" style={{ color: 'var(--d2b-text-muted)' }}>/Mês</p>
                  {diferenca !== null && diferenca > 0 && (
                    <p className="text-[10px] font-semibold" style={{ color: '#7C4DFF' }}>
                      + R$ {diferenca.toFixed(2).replace('.', ',')} diferença
                    </p>
                  )}
                  {periodo === 'semestral' && (
                    <p className="text-[10px]" style={{ color: 'var(--d2b-text-muted)' }}>
                      Total: R$ {(plano.valorMensal * desconto * 6).toFixed(2).replace('.', ',')}
                    </p>
                  )}
                </div>
              </div>

              <div className="grid grid-cols-2 gap-x-4 gap-y-1">
                {features.map(f => (
                  <div key={f} className="flex items-center gap-1.5">
                    <div className="w-1 h-1 rounded-full flex-shrink-0" style={{ background: '#7C4DFF' }} />
                    <span className="text-[11px]" style={{ color: 'var(--d2b-text-secondary)' }}>{f}</span>
                  </div>
                ))}
              </div>
            </button>
          )
        })}
      </div>

      {/* VALOR */}
      {selecionado && (() => {
        const plano = planos.find(p => p.id === selecionado)!
        const valor = (plano.valorMensal * desconto).toFixed(2).replace('.', ',')
        return (
          <div className="flex items-center justify-between pt-2 border-t" style={{ borderColor: 'var(--d2b-border)' }}>
            <span className="text-xs" style={{ color: 'var(--d2b-text-secondary)' }}>VALOR</span>
            <div className="text-right">
              <p className="text-lg font-bold" style={{ color: 'var(--d2b-text-primary)' }}>
                R$ {valor}<span className="text-xs font-normal" style={{ color: 'var(--d2b-text-muted)' }}>/Mês</span>
              </p>
              {periodo === 'semestral' && (
                <p className="text-xs" style={{ color: 'var(--d2b-text-muted)' }}>
                  Total 6 meses: R$ {(plano.valorMensal * desconto * 6).toFixed(2).replace('.', ',')}
                </p>
              )}
            </div>
          </div>
        )
      })()}

      <button
        onClick={handleContinuar}
        disabled={!selecionado || (!!assinaturaAtual && (() => { const p = planos.find(x => x.id === selecionado); return !p || getRelacao(p) !== 'upgrade' })())}
        className="w-full py-3 rounded-xl text-sm font-semibold text-white transition-opacity hover:opacity-90 disabled:opacity-40"
        style={{ background: 'linear-gradient(135deg, #7C4DFF, #C084FC)' }}
      >
        {assinaturaAtual ? 'Fazer Upgrade' : 'Continuar'}
      </button>

      <p className="text-[10px] text-center" style={{ color: 'var(--d2b-text-muted)' }}>
        Você sabia? Parte do valor dos novos planos assinados é revertido na recuperação da Mata Atlântica. Parabéns por fazer parte!
      </p>
    </div>
  )
}
