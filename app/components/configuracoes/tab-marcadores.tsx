'use client'

import { useState, useEffect, useRef } from 'react'
import { Plus, Trash2, Pencil, Check, X, Highlighter } from 'lucide-react'
import { useToast } from '@/hooks/use-toast'
import type { EmpresaData } from '@/app/dashboard/configuracoes/page'

interface TabMarcadoresProps {
  initialEmpresa?: EmpresaData | null
}

interface Marcador {
  id: string
  tipo: string
  cor: string
  empresaId: string
}

const TIPOS_MARCADOR = [
  { value: 'CONSULTA',            label: 'Consulta' },
  { value: 'RETORNO',             label: 'Retorno' },
  { value: 'PROCEDIMENTO',        label: 'Procedimento' },
  { value: 'AVALIACAO',           label: 'Avaliação' },
  { value: 'BLOQUEIO',            label: 'Bloqueio' },
  { value: 'ENCAIXE',             label: 'Encaixe' },
  { value: 'CIRURGIA',            label: 'Cirurgia' },
  { value: 'EXAME',               label: 'Exame' },
  { value: 'OUTROS',              label: 'Outros' },
  { value: 'ALTO_RISCO_FALTA',    label: 'Alto Risco de Falta' },
  { value: 'CONVENIO',            label: 'Convênio' },
  { value: 'INADIMPLENTE',        label: 'Inadimplente' },
  { value: 'PRIMEIRO_ATENDIMENTO', label: 'Primeiro Atendimento' },
  { value: 'ANIVERSARIANTE',      label: 'Aniversário' },
  { value: 'SALA',                label: 'Sala' },
  { value: 'PROFISSIONAL',        label: 'Profissional' },
]

// 12 cores básicas — caixa de lápis de cor
const PALETTE: string[] = [
  '#EF4444', // Vermelho
  '#F97316', // Laranja
  '#EAB308', // Amarelo
  '#84CC16', // Verde-limão
  '#22C55E', // Verde
  '#14B8A6', // Verde-água
  '#06B6D4', // Ciano
  '#3B82F6', // Azul
  '#6366F1', // Índigo
  '#8B5CF6', // Violeta
  '#EC4899', // Rosa
  '#78716C', // Marrom
]

// ─── Paleta de cores ──────────────────────────────────────────────────────────
function ColorPalette({
  value,
  onChange,
}: {
  value: string
  onChange: (cor: string) => void
}) {
  const [open, setOpen] = useState(false)
  const ref = useRef<HTMLDivElement>(null)

  useEffect(() => {
    function handler(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false)
    }
    document.addEventListener('mousedown', handler)
    return () => document.removeEventListener('mousedown', handler)
  }, [])

  return (
    <div className="relative inline-block" ref={ref}>
      {/* Botão — mostra a cor atual */}
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        title="Escolher cor"
        style={{ backgroundColor: value }}
        className="w-9 h-9 rounded-md border-2 border-[var(--d2b-border-strong)] hover:border-[#7C4DFF] transition-colors"
      />

      {/* Popover compacto — grade 6×2 */}
      {open && (
        <div
          className="absolute left-0 top-full mt-1.5 z-[100] rounded-lg border border-[var(--d2b-border-strong)] bg-[var(--d2b-bg-elevated)] shadow-2xl"
          style={{ padding: '8px' }}
        >
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(6, 1fr)', gap: '5px' }}>
            {PALETTE.map((cor) => {
              const selected = value === cor
              return (
                <button
                  key={cor}
                  type="button"
                  onClick={() => { onChange(cor); setOpen(false) }}
                  title={cor}
                  style={{
                    width: 24,
                    height: 24,
                    borderRadius: 4,
                    backgroundColor: cor,
                    border: selected ? '2px solid #fff' : '2px solid transparent',
                    outline: selected ? `2px solid ${cor}` : 'none',
                    cursor: 'pointer',
                    flexShrink: 0,
                  }}
                />
              )
            })}
          </div>
        </div>
      )}
    </div>
  )
}

function tipoLabel(value: string) {
  return TIPOS_MARCADOR.find((t) => t.value === value)?.label ?? value
}

// ─── Tab principal ────────────────────────────────────────────────────────────
export function TabMarcadores({ initialEmpresa }: TabMarcadoresProps) {
  const { toast } = useToast()
  const [marcadores, setMarcadores] = useState<Marcador[]>([])
  const [loading, setLoading] = useState(true)

  // form de cadastro
  const [novaCor, setNovaCor] = useState(PALETTE[0])
  const [novoTipo, setNovoTipo] = useState('')
  const [salvando, setSalvando] = useState(false)

  // edição inline
  const [editingId, setEditingId] = useState<string | null>(null)
  const [editCor, setEditCor] = useState(PALETTE[0])
  const [editTipo, setEditTipo] = useState('')

  useEffect(() => {
    if (initialEmpresa?.id) carregarMarcadores()
  }, [initialEmpresa?.id])

  async function carregarMarcadores() {
    if (!initialEmpresa?.id) return
    setLoading(true)
    try {
      const res = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/api/v1/marcadores/empresa/${initialEmpresa.id}`
      )
      if (res.ok) setMarcadores(await res.json())
    } catch (err) {
      console.error('Erro ao carregar marcadores:', err)
    } finally {
      setLoading(false)
    }
  }

  async function handleAdicionar() {
    if (!novoTipo || !initialEmpresa?.id) return

    if (marcadores.some((m) => m.tipo === novoTipo)) {
      toast({ title: 'Marcador já cadastrado para esse tipo', variant: 'destructive' })
      return
    }

    setSalvando(true)
    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/v1/marcadores`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ tipo: novoTipo, cor: novaCor, empresaId: initialEmpresa.id }),
      })
      if (res.ok) {
        toast({ title: 'Marcador adicionado com sucesso!' })
        setNovoTipo('')
        setNovaCor(PALETTE[0])
        carregarMarcadores()
      } else {
        toast({ title: 'Erro ao adicionar marcador', variant: 'destructive' })
      }
    } catch (err) {
      console.error('Erro ao adicionar marcador:', err)
      toast({ title: 'Erro ao adicionar marcador', variant: 'destructive' })
    } finally {
      setSalvando(false)
    }
  }

  function iniciarEdicao(m: Marcador) {
    setEditingId(m.id)
    setEditCor(m.cor)
    setEditTipo(m.tipo)
  }

  async function handleSalvarEdicao(id: string, tipoOriginal: string) {
    if (!editTipo) return

    if (editTipo !== tipoOriginal && marcadores.some((m) => m.tipo === editTipo && m.id !== id)) {
      toast({ title: 'Marcador já cadastrado para esse tipo', variant: 'destructive' })
      return
    }

    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/v1/marcadores/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ tipo: editTipo, cor: editCor }),
      })
      if (res.ok) {
        toast({ title: 'Marcador atualizado com sucesso!' })
        setEditingId(null)
        carregarMarcadores()
      } else {
        toast({ title: 'Erro ao atualizar marcador', variant: 'destructive' })
      }
    } catch (err) {
      console.error('Erro ao atualizar marcador:', err)
      toast({ title: 'Erro ao atualizar marcador', variant: 'destructive' })
    }
  }

  async function handleDeletar(id: string) {
    if (!confirm('Deseja excluir este marcador?')) return
    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/v1/marcadores/${id}`, {
        method: 'DELETE',
      })
      if (res.ok) {
        toast({ title: 'Marcador excluído com sucesso!' })
        carregarMarcadores()
      } else {
        toast({ title: 'Erro ao excluir marcador', variant: 'destructive' })
      }
    } catch (err) {
      console.error('Erro ao excluir marcador:', err)
      toast({ title: 'Erro ao excluir marcador', variant: 'destructive' })
    }
  }

  const tiposDisponiveis = TIPOS_MARCADOR.filter(
    (t) => !marcadores.some((m) => m.tipo === t.value)
  )

  return (
    <div className="space-y-8">
      {/* Cabeçalho */}
      <div>
        <h2 className="text-base font-bold text-[var(--d2b-text-primary)]">Marcadores</h2>
        <p className="text-xs text-[var(--d2b-text-secondary)] mt-1">
          Defina cores para cada tipo de agendamento. Cada tipo pode ter apenas um marcador cadastrado.
        </p>
      </div>

      {/* Formulário de cadastro */}
      <div className="p-5 rounded-xl border border-[var(--d2b-border-strong)] bg-[var(--d2b-bg-surface)] space-y-4">
        <h3 className="text-sm font-semibold text-[var(--d2b-text-primary)]">Novo Marcador</h3>

        <div className="flex items-end gap-4">
          {/* Paleta de cor */}
          <div className="flex flex-col gap-1.5">
            <span className="text-[10px] font-medium text-[var(--d2b-text-secondary)]">Cor</span>
            <ColorPalette value={novaCor} onChange={setNovaCor} />
          </div>

          {/* Select de tipo */}
          <div className="flex-1 relative">
            <label className="block text-[10px] font-medium text-[var(--d2b-text-secondary)] mb-1.5">
              Tipo<span className="text-[#7C4DFF] ml-0.5">*</span>
            </label>
            <div className="relative">
              <select
                value={novoTipo}
                onChange={(e) => setNovoTipo(e.target.value)}
                className="w-full px-3 py-2.5 rounded-lg border border-[var(--d2b-border-strong)] bg-[var(--d2b-bg-main)] text-sm text-[var(--d2b-text-primary)] appearance-none focus:outline-none focus:border-[#7C4DFF] transition-colors"
              >
                <option value="">Selecione o tipo</option>
                {tiposDisponiveis.map((t) => (
                  <option key={t.value} value={t.value}>{t.label}</option>
                ))}
              </select>
              <span className="absolute right-3 top-1/2 -translate-y-1/2 text-[var(--d2b-text-muted)] pointer-events-none text-xs">▾</span>
            </div>
          </div>

          {/* Botão */}
          <button
            onClick={handleAdicionar}
            disabled={!novoTipo || salvando || tiposDisponiveis.length === 0}
            className="flex items-center gap-2 px-4 py-2.5 rounded-lg bg-[#7C4DFF] hover:bg-[#5B21B6] text-white text-sm font-semibold transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <Plus size={15} />
            Adicionar
          </button>
        </div>

        {tiposDisponiveis.length === 0 && (
          <p className="text-xs text-[var(--d2b-text-muted)]">
            Todos os tipos já possuem marcadores cadastrados.
          </p>
        )}
      </div>

      {/* Grid de marcadores */}
      <div>
        <h3 className="text-sm font-semibold text-[var(--d2b-text-primary)] mb-4">
          Marcadores Cadastrados
          {marcadores.length > 0 && (
            <span className="ml-2 text-xs font-normal text-[var(--d2b-text-muted)]">
              ({marcadores.length})
            </span>
          )}
        </h3>

        {loading ? (
          <div className="py-8 text-center text-sm text-[var(--d2b-text-secondary)]">Carregando...</div>
        ) : marcadores.length === 0 ? (
          <div className="py-12 text-center rounded-xl border border-dashed border-[var(--d2b-border-strong)] bg-[var(--d2b-bg-main)]">
            <Highlighter size={40} className="mx-auto mb-3 text-[var(--d2b-text-muted)]" />
            <p className="text-sm text-[var(--d2b-text-secondary)]">Nenhum marcador cadastrado</p>
            <p className="text-xs text-[var(--d2b-text-muted)] mt-1">
              Use o formulário acima para adicionar marcadores
            </p>
          </div>
        ) : (
          <div className="flex flex-wrap gap-4">
            {marcadores.map((m) => (
              <div key={m.id} className="group relative">
                {editingId === m.id ? (
                  /* Card em modo edição */
                  <div className="w-40 rounded-xl border-2 border-[#7C4DFF] bg-[var(--d2b-bg-surface)] p-3 space-y-2.5 shadow-lg">
                    {/* Paleta de cor — edição */}
                    <div className="flex items-center gap-2">
                      <span className="text-[10px] text-[var(--d2b-text-secondary)]">Cor</span>
                      <ColorPalette value={editCor} onChange={setEditCor} />
                    </div>

                    {/* Select de tipo — edição */}
                    <select
                      value={editTipo}
                      onChange={(e) => setEditTipo(e.target.value)}
                      className="w-full px-2 py-1.5 rounded-lg border border-[var(--d2b-border-strong)] bg-[var(--d2b-bg-main)] text-xs text-[var(--d2b-text-primary)] focus:outline-none focus:border-[#7C4DFF]"
                    >
                      {TIPOS_MARCADOR.filter(
                        (t) => t.value === m.tipo || !marcadores.some((x) => x.tipo === t.value && x.id !== m.id)
                      ).map((t) => (
                        <option key={t.value} value={t.value}>{t.label}</option>
                      ))}
                    </select>

                    {/* Ações edição */}
                    <div className="flex gap-1.5">
                      <button
                        onClick={() => handleSalvarEdicao(m.id, m.tipo)}
                        className="flex-1 flex items-center justify-center gap-1 py-1.5 rounded-lg bg-[#7C4DFF] hover:bg-[#5B21B6] text-white text-xs font-semibold transition-colors"
                      >
                        <Check size={12} />
                        OK
                      </button>
                      <button
                        onClick={() => setEditingId(null)}
                        className="flex items-center justify-center p-1.5 rounded-lg border border-[var(--d2b-border-strong)] text-[var(--d2b-text-secondary)] hover:text-[#EF4444] hover:border-[#EF4444] transition-colors"
                      >
                        <X size={12} />
                      </button>
                    </div>
                  </div>
                ) : (
                  /* Card normal */
                  <div className="w-36 rounded-xl border border-[var(--d2b-border)] bg-[var(--d2b-bg-surface)] overflow-hidden hover:border-[var(--d2b-border-strong)] transition-colors">
                    {/* Bloco de cor */}
                    <div className="w-full h-16" style={{ backgroundColor: m.cor }} />

                    {/* Label + ações */}
                    <div className="px-2.5 py-2 flex items-center justify-between gap-1">
                      <span className="text-xs font-semibold text-[var(--d2b-text-primary)] leading-tight flex-1">
                        {tipoLabel(m.tipo)}
                      </span>
                      <div className="flex gap-0.5 opacity-0 group-hover:opacity-100 transition-opacity">
                        <button
                          onClick={() => iniciarEdicao(m)}
                          className="p-1 rounded hover:bg-[var(--d2b-hover)] text-[var(--d2b-text-muted)] hover:text-[#7C4DFF] transition-colors"
                          title="Editar"
                        >
                          <Pencil size={12} />
                        </button>
                        <button
                          onClick={() => handleDeletar(m.id)}
                          className="p-1 rounded hover:bg-[rgba(239,68,68,0.12)] text-[var(--d2b-text-muted)] hover:text-[#EF4444] transition-colors"
                          title="Excluir"
                        >
                          <Trash2 size={12} />
                        </button>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
