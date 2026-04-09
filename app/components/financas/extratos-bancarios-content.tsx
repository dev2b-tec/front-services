'use client'

import { useState } from 'react'
import { Search, Calendar, Eye, Upload } from 'lucide-react'

const BTN_PRIMARY = 'flex items-center gap-2 px-4 py-2 rounded-full text-sm font-bold text-white bg-[#7C4DFF] hover:bg-[#5B21B6] transition-colors'
const BTN_OUTLINE = 'flex items-center gap-2 px-3 py-1.5 rounded-md text-sm font-medium border border-[var(--d2b-border-strong)] text-[var(--d2b-text-secondary)] hover:border-[#7C4DFF] hover:text-[var(--d2b-text-primary)] bg-transparent transition-colors'

function Stepper() {
  return (
    <div className="shrink-0 bg-[var(--d2b-bg-elevated)] border-b border-[var(--d2b-border)] px-6 py-2 flex items-center gap-2 text-xs">
      <span className="text-[#7C4DFF] font-bold">✦ Etapa atual</span>
      <span className="text-[var(--d2b-text-secondary)]">Configure a emissão da nota fiscal</span>
      <div className="ml-auto flex items-center gap-3">
        <span className="text-[var(--d2b-text-muted)] font-semibold">1 de 4</span>
        <div className="flex gap-0.5">
          <div className="w-6 h-1.5 rounded-full bg-[#7C4DFF]" />
          <div className="w-6 h-1.5 rounded-full bg-[var(--d2b-border-strong)]" />
          <div className="w-6 h-1.5 rounded-full bg-[var(--d2b-border-strong)]" />
          <div className="w-6 h-1.5 rounded-full bg-[var(--d2b-border-strong)]" />
        </div>
        <button className="text-[#7C4DFF] hover:underline font-medium">acessar o guia</button>
      </div>
    </div>
  )
}

export function ExtratosBancariosContent() {
  const [search, setSearch] = useState('')
  const [showOlist, setShowOlist] = useState(true)

  return (
    <div className="flex flex-col h-full overflow-hidden bg-[var(--d2b-bg-main)]">

      {/* Top breadcrumb + action button */}
      <div className="shrink-0 bg-[var(--d2b-bg-surface)] border-b border-[var(--d2b-border)] px-6 py-2 flex items-center justify-between gap-3">
        <div className="flex items-center gap-1 text-xs text-[var(--d2b-text-muted)]">
          <span>início</span>
          <span className="mx-1">≡</span>
          <span>finanças</span>
          <span className="mx-1">{'>'}</span>
          <span className="text-[var(--d2b-text-secondary)] font-medium">extratos bancários</span>
        </div>
        <button className={BTN_PRIMARY}>
          <Upload size={14} />
          importar extrato bancário
        </button>
      </div>

      {/* Stepper */}
      <Stepper />

      {/* Body */}
      <div className="flex-1 overflow-y-auto px-6 py-6">

        {/* Title */}
        <h1 className="text-xl font-bold text-[var(--d2b-text-primary)] mb-4">Extratos bancários</h1>

        {/* Promo banner — Conta Digital */}
        <div className="flex items-center gap-4 bg-[var(--d2b-bg-surface)] border border-[var(--d2b-border)] rounded-xl px-4 py-3.5 mb-5">
          <div className="shrink-0 w-16 h-14 bg-blue-100 rounded-lg flex items-center justify-center overflow-hidden">
            <span className="text-2xl">🏦</span>
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-bold text-[var(--d2b-text-primary)] leading-snug">
              Deixe de fazer inúmeros uploads de extratos bancários
              <span className="ml-2 inline-block bg-blue-500 text-white text-[10px] font-bold px-2 py-0.5 rounded-full align-middle">Novo</span>
            </p>
            <p className="text-xs text-[var(--d2b-text-muted)] mt-0.5">
              Com <span className="font-semibold text-[var(--d2b-text-secondary)]">Conta Digital</span>, você facilita sua rotina com a Conciliação Bancária automática, tudo dentro do ERP!
            </p>
          </div>
          <button className="shrink-0 text-xs text-[var(--d2b-text-secondary)] hover:text-[var(--d2b-text-primary)] hover:underline whitespace-nowrap">
            conhecer conta digital
          </button>
        </div>

        {/* Search + filter */}
        <div className="flex items-center gap-3 mb-4">
          <div className="relative flex-1 max-w-sm">
            <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-[var(--d2b-text-muted)]" />
            <input
              type="text"
              placeholder="Pesquise por nome"
              value={search}
              onChange={e => setSearch(e.target.value)}
              className="w-full bg-[var(--d2b-bg-main)] border border-[var(--d2b-border-strong)] rounded-md pl-9 pr-3 py-2 text-sm text-[var(--d2b-text-primary)] placeholder:text-[var(--d2b-text-muted)] focus:outline-none focus:ring-2 focus:ring-[#7C4DFF]/40"
            />
          </div>
          <button className={BTN_OUTLINE}>
            <Calendar size={14} />
            por período
          </button>
        </div>

        {/* Crédito da Olist banner */}
        {showOlist && (
          <div className="flex items-center justify-center gap-2 py-2 mb-4 text-sm flex-wrap">
            <span className="bg-emerald-500 text-white text-xs font-bold px-2.5 py-1 rounded-full">Crédito da Olist</span>
            <span className="text-[var(--d2b-text-secondary)]">Agora você pode</span>
            <span className="flex items-center gap-1 text-[var(--d2b-text-primary)] font-medium">
              🌀 antecipar recebíveis
            </span>
            <span className="text-[var(--d2b-text-secondary)]">com crédito pré-aprovado</span>
            <button onClick={() => setShowOlist(false)} className="text-[var(--d2b-text-muted)] hover:text-[var(--d2b-text-secondary)]">
              <Eye size={14} />
            </button>
          </div>
        )}

        {/* Empty state */}
        <div className="border border-[var(--d2b-border)] rounded-xl bg-[var(--d2b-bg-surface)] p-8 flex items-center gap-8 max-w-2xl mx-auto mt-6">
          <div className="flex-1">
            <p className="text-base font-bold text-[var(--d2b-text-primary)] mb-2">Você não possui nenhum item cadastrado.</p>
            <p className="text-sm text-[var(--d2b-text-muted)] mb-5 leading-relaxed">
              Para inserir novos registros você pode clicar em importar extrato bancário.
            </p>
            <button className={BTN_PRIMARY}>
              <Upload size={14} />
              importar extrato bancário
            </button>
          </div>
          <div className="shrink-0 w-24 h-24 flex items-center justify-center">
            <span className="text-6xl select-none">🐱</span>
          </div>
        </div>

      </div>

      {/* Footer */}
      <div className="shrink-0 border-t border-[var(--d2b-border)] px-6 py-3 bg-[var(--d2b-bg-surface)]">
        <p className="text-xs text-[var(--d2b-text-muted)]">
          Ficou com alguma dúvida?{' '}
          <button className="text-[#7C4DFF] hover:underline">Acesse a ajuda do ERP.</button>
        </p>
      </div>

    </div>
  )
}
