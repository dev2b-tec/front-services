'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { ArrowLeft, Save, Tag, ChevronRight } from 'lucide-react'

// ─── Shared styles ──────────────────────────────────────────────────────────
const INP =
  'w-full bg-[var(--d2b-bg-main)] border border-[var(--d2b-border-strong)] rounded-md ' +
  'px-3 py-2.5 text-sm text-[var(--d2b-text-primary)] placeholder:text-[var(--d2b-text-muted)] ' +
  'focus:outline-none focus:border-[#7C4DFF] transition-colors'

const LBL = 'block text-xs font-medium text-[var(--d2b-text-secondary)] mb-1.5'

const SECTION_TITLE =
  'text-base font-semibold text-[var(--d2b-text-primary)] mb-5'

const BTN_PRIMARY =
  'flex items-center gap-2 px-6 py-2.5 rounded-full text-sm font-bold text-white bg-[#7C4DFF] hover:bg-[#5B21B6] transition-colors'

// ─── Toggle ─────────────────────────────────────────────────────────────────
function Toggle({
  checked,
  onChange,
  label,
}: {
  checked: boolean
  onChange: (v: boolean) => void
  label: string
}) {
  return (
    <label className="flex items-center gap-3 cursor-pointer w-fit">
      <button
        type="button"
        role="switch"
        aria-checked={checked}
        onClick={() => onChange(!checked)}
        className={[
          'relative inline-flex h-5 w-9 shrink-0 rounded-full border-2 border-transparent transition-colors',
          checked ? 'bg-[#7C4DFF]' : 'bg-[var(--d2b-border-strong)]',
        ].join(' ')}
      >
        <span
          className={[
            'pointer-events-none inline-block h-4 w-4 rounded-full bg-white shadow transform transition-transform',
            checked ? 'translate-x-4' : 'translate-x-0',
          ].join(' ')}
        />
      </button>
      <span className="text-sm text-[var(--d2b-text-secondary)]">{label}</span>
    </label>
  )
}

// ─── RadioCard ───────────────────────────────────────────────────────────────
function RadioCard({
  checked,
  onChange,
  label,
  description,
}: {
  checked: boolean
  onChange: () => void
  label: string
  description: string
}) {
  return (
    <label
      onClick={onChange}
      className={[
        'flex items-start gap-3 p-4 rounded-lg border cursor-pointer transition-colors',
        checked
          ? 'border-[#7C4DFF] bg-[#7C4DFF]/5'
          : 'border-[var(--d2b-border)] hover:border-[var(--d2b-border-strong)] bg-transparent',
      ].join(' ')}
    >
      <span
        className={[
          'mt-0.5 flex-shrink-0 w-4 h-4 rounded-full border-2 transition-colors flex items-center justify-center',
          checked ? 'border-[#7C4DFF]' : 'border-[var(--d2b-border-strong)]',
        ].join(' ')}
      >
        {checked && <span className="w-2 h-2 rounded-full bg-[#7C4DFF]" />}
      </span>
      <div>
        <p className="text-sm font-medium text-[var(--d2b-text-primary)]">{label}</p>
        <p className="text-xs text-[var(--d2b-text-secondary)] mt-0.5">{description}</p>
      </div>
    </label>
  )
}

// ─── Props ───────────────────────────────────────────────────────────────────
interface CampanhaFormProps {
  id?: string
}

// ─── CampanhaForm ────────────────────────────────────────────────────────────
export function CampanhaForm({ id }: CampanhaFormProps) {
  const router  = useRouter()
  const isNova  = !id

  // Detalhes
  const [nome,        setNome]        = useState('')
  const [dataInicio,  setDataInicio]  = useState('')
  const [dataTermino, setDataTermino] = useState('')

  // Valores
  const [desconto,          setDesconto]          = useState('')
  const [arredondamento,    setArredondamento]    = useState(false)
  const [formaAplicacao,    setFormaAplicacao]    = useState<'centavos' | 'ultimo-decimal'>('centavos')
  const [regraArredondamento, setRegraArredondamento] = useState<'99' | '00'>('99')

  function handleVoltar() {
    router.push('/dashboard/cadastros')
  }

  function handleSalvar() {
    // TODO: chamar API
    router.push('/dashboard/cadastros')
  }

  return (
    <div className="flex flex-col h-full">

      {/* ── Barra de topo ── */}
      <div className="flex items-center gap-3 px-8 py-4 border-b border-[var(--d2b-border)] bg-[var(--d2b-bg-surface)]">
        <button
          onClick={handleVoltar}
          className="flex items-center gap-1.5 text-xs text-[var(--d2b-text-muted)] hover:text-[var(--d2b-text-primary)] transition-colors"
        >
          <ArrowLeft size={14} />
          voltar
        </button>
        <nav className="flex items-center gap-1 text-xs text-[var(--d2b-text-muted)]">
          <span>início</span>
          <ChevronRight size={12} />
          <span>cadastros</span>
          <ChevronRight size={12} />
          <span className="text-[var(--d2b-text-secondary)]">campanhas promocionais</span>
        </nav>
      </div>

      {/* ── Corpo ── */}
      <div className="flex-1 overflow-y-auto">
        <div className="max-w-4xl px-8 py-8">

          <h1 className="text-2xl font-semibold text-[var(--d2b-text-primary)] mb-1">
            {isNova ? 'Criar Campanha' : 'Editar Campanha'}
          </h1>
          <div className="border-t border-[var(--d2b-border)] mt-4 mb-8" />

          {/* ── Detalhes ────────────────────────────────────────────── */}
          <section className="mb-8">
            <h2 className={SECTION_TITLE}>Detalhes</h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="md:col-span-1">
                <label className={LBL}>Nome da campanha</label>
                <input
                  className={INP}
                  placeholder="Ex: Black Friday 2026"
                  value={nome}
                  onChange={e => setNome(e.target.value)}
                />
              </div>
              <div>
                <label className={LBL}>Data de início</label>
                <div className="relative">
                  <input
                    type="date"
                    className={INP + ' pr-10'}
                    value={dataInicio}
                    onChange={e => setDataInicio(e.target.value)}
                  />
                </div>
              </div>
              <div>
                <label className={LBL}>Data de término</label>
                <div className="relative">
                  <input
                    type="date"
                    className={INP + ' pr-10'}
                    value={dataTermino}
                    onChange={e => setDataTermino(e.target.value)}
                  />
                </div>
              </div>
            </div>
          </section>

          <div className="border-t border-[var(--d2b-border)] mb-8" />

          {/* ── Valores ─────────────────────────────────────────────── */}
          <section className="mb-8 space-y-6">
            <h2 className={SECTION_TITLE}>Valores</h2>

            <div className="max-w-xs">
              <label className={LBL}>Desconto em %</label>
              <div className="relative">
                <input
                  type="number"
                  min="0"
                  max="100"
                  step="0.01"
                  className={INP + ' pr-10'}
                  placeholder="0,00"
                  value={desconto}
                  onChange={e => setDesconto(e.target.value)}
                />
                <span className="absolute right-3 top-1/2 -translate-y-1/2 flex items-center justify-center w-6 h-6 rounded-full border border-[var(--d2b-border-strong)] text-xs text-[#7C4DFF] font-medium">
                  %
                </span>
              </div>
            </div>

            <Toggle
              checked={arredondamento}
              onChange={setArredondamento}
              label="Utilizar arredondamento inteligente"
            />

            {/* ── Seção dinâmica de arredondamento ─────────────────── */}
            {arredondamento && (
              <div className="space-y-6 pl-0">

                {/* Forma de aplicação */}
                <div>
                  <h3 className="text-sm font-semibold text-[var(--d2b-text-primary)] mb-3">
                    Forma de aplicação do arredondamento
                  </h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3 max-w-2xl">
                    <RadioCard
                      checked={formaAplicacao === 'centavos'}
                      onChange={() => setFormaAplicacao('centavos')}
                      label="Considerar centavos"
                      description="Ao considerar os centavos, as duas últimas casas decimais poderão ser arredondadas. Ex: R$ 0,XX"
                    />
                    <RadioCard
                      checked={formaAplicacao === 'ultimo-decimal'}
                      onChange={() => setFormaAplicacao('ultimo-decimal')}
                      label="Considerar último decimal"
                      description="Ao considerar o último decimal, apenas uma casa decimal poderá ser arredondada. Ex: R$ 0,0X"
                    />
                  </div>
                </div>

                {/* Regra de arredondamento */}
                <div>
                  <h3 className="text-sm font-semibold text-[var(--d2b-text-primary)] mb-1">
                    Regra de arredondamento
                  </h3>
                  <p className="text-xs text-[var(--d2b-text-muted)] mb-3">Arredondar para</p>
                  <div className="flex flex-col gap-2">
                    <label className="flex items-center gap-2.5 cursor-pointer">
                      <span
                        onClick={() => setRegraArredondamento('99')}
                        className={[
                          'flex-shrink-0 w-4 h-4 rounded-full border-2 transition-colors flex items-center justify-center cursor-pointer',
                          regraArredondamento === '99' ? 'border-[#7C4DFF]' : 'border-[var(--d2b-border-strong)]',
                        ].join(' ')}
                      >
                        {regraArredondamento === '99' && (
                          <span className="w-2 h-2 rounded-full bg-[#7C4DFF]" />
                        )}
                      </span>
                      <span
                        className="text-sm text-[var(--d2b-text-secondary)] cursor-pointer"
                        onClick={() => setRegraArredondamento('99')}
                      >
                        Substituir centavos por 99
                      </span>
                    </label>
                    <label className="flex items-center gap-2.5 cursor-pointer">
                      <span
                        onClick={() => setRegraArredondamento('00')}
                        className={[
                          'flex-shrink-0 w-4 h-4 rounded-full border-2 transition-colors flex items-center justify-center cursor-pointer',
                          regraArredondamento === '00' ? 'border-[#7C4DFF]' : 'border-[var(--d2b-border-strong)]',
                        ].join(' ')}
                      >
                        {regraArredondamento === '00' && (
                          <span className="w-2 h-2 rounded-full bg-[#7C4DFF]" />
                        )}
                      </span>
                      <span
                        className="text-sm text-[var(--d2b-text-secondary)] cursor-pointer"
                        onClick={() => setRegraArredondamento('00')}
                      >
                        Substituir centavos por 00
                      </span>
                    </label>
                  </div>
                </div>

              </div>
            )}
          </section>

          {/* ── Ações ───────────────────────────────────────────────── */}
          <div className="pt-4 border-t border-[var(--d2b-border)] flex items-center gap-3">
            <button onClick={handleSalvar} className={BTN_PRIMARY}>
              <Save size={14} />
              salvar e selecionar anúncios
            </button>
            <button
              onClick={handleVoltar}
              className="px-4 py-2.5 rounded-md text-sm font-medium text-[var(--d2b-text-secondary)] hover:text-[var(--d2b-text-primary)] transition-colors"
            >
              cancelar
            </button>
          </div>

        </div>
      </div>
    </div>
  )
}
