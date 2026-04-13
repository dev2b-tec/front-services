'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { BadgePercent, Search, Calendar, Plus, Pencil, Trash2 } from 'lucide-react'

// ─── Shared styles ─────────────────────────────────────────────────────────
const BTN_PRIMARY =
  'flex items-center gap-2 px-4 py-2 rounded-full text-sm font-bold text-white bg-[#7C4DFF] hover:bg-[#5B21B6] transition-colors'

const BTN_FILTER =
  'flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium border transition-colors'

// ─── Types ─────────────────────────────────────────────────────────────────
type Campanha = {
  id: string
  nome: string
  dataInicio: string
  dataTermino: string
  desconto: number
  arredondamento: boolean
  status: 'ativa' | 'encerrada' | 'agendada'
}

// ─── Mock data ──────────────────────────────────────────────────────────────
const MOCK_CAMPANHAS: Campanha[] = [
  {
    id: '1',
    nome: 'Black Friday 2026',
    dataInicio: '2026-11-27',
    dataTermino: '2026-11-30',
    desconto: 20,
    arredondamento: true,
    status: 'agendada',
  },
  {
    id: '2',
    nome: 'Liquidação de Verão',
    dataInicio: '2026-01-10',
    dataTermino: '2026-01-31',
    desconto: 15,
    arredondamento: false,
    status: 'encerrada',
  },
]

type Filtro = 'criadas' | 'periodo'

function fmtData(iso: string) {
  const [y, m, d] = iso.split('-')
  return `${d}/${m}/${y}`
}

function StatusBadge({ status }: { status: Campanha['status'] }) {
  const map = {
    ativa:     'bg-emerald-500/10 text-emerald-400 border-emerald-500/20',
    encerrada: 'bg-zinc-500/10 text-[var(--d2b-text-muted)] border-[var(--d2b-border)]',
    agendada:  'bg-[#7C4DFF]/10 text-[#A98EFF] border-[#7C4DFF]/25',
  }
  const label = { ativa: 'Ativa', encerrada: 'Encerrada', agendada: 'Agendada' }
  return (
    <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium border ${map[status]}`}>
      {label[status]}
    </span>
  )
}

// ─── EmptyState ─────────────────────────────────────────────────────────────
function EmptyState({ onNova }: { onNova: () => void }) {
  return (
    <div className="flex items-center justify-center py-16 px-6">
      <div className="rounded-xl border border-[var(--d2b-border)] bg-[var(--d2b-bg-surface)] p-10 max-w-md w-full flex flex-col gap-4">
        <div>
          <p className="text-base font-semibold text-[var(--d2b-text-primary)] mb-2">
            Não existem campanhas promocionais cadastradas
          </p>
          <p className="text-sm text-[var(--d2b-text-secondary)]">
            Crie uma nova campanha promocional para visualizá-la aqui
          </p>
        </div>
        <BadgePercent size={48} className="text-[var(--d2b-text-muted)] self-end" strokeWidth={1} />
      </div>
    </div>
  )
}

// ─── CampanhasList ───────────────────────────────────────────────────────────
export function CampanhasList() {
  const router = useRouter()
  const [busca, setBusca]     = useState('')
  const [filtro, setFiltro]   = useState<Filtro>('criadas')
  const [excluindo, setExcluindo] = useState<string | null>(null)

  const filtrados = MOCK_CAMPANHAS.filter(c => {
    const q = busca.toLowerCase()
    return !q || c.nome.toLowerCase().includes(q)
  })

  return (
    <div className="p-6 space-y-5">

      {/* ── Cabeçalho ─────────────────────────────────────────────────── */}
      <div className="flex items-center justify-between gap-4 flex-wrap">
        <h2 className="text-xl font-bold text-[var(--d2b-text-primary)]">
          Campanhas promocionais
        </h2>

        <button
          onClick={() => router.push('/dashboard/cadastros/campanhas/nova')}
          className={BTN_PRIMARY}
        >
          <Plus size={14} />
          incluir campanha
        </button>
      </div>

      {/* ── Busca + Filtros ───────────────────────────────────────────── */}
      <div className="flex items-center gap-3 flex-wrap">
        <div className="flex items-center gap-2 bg-[var(--d2b-bg-elevated)] border border-[var(--d2b-border)] rounded-lg px-3 h-9 w-72">
          <Search size={14} className="text-[var(--d2b-text-secondary)] shrink-0" />
          <input
            value={busca}
            onChange={e => setBusca(e.target.value)}
            placeholder="Pesquise pela descrição da campanha"
            className="bg-transparent text-sm text-[var(--d2b-text-primary)] placeholder:text-[var(--d2b-text-muted)] outline-none w-full"
          />
        </div>

        <button
          onClick={() => setFiltro('criadas')}
          className={[
            BTN_FILTER,
            filtro === 'criadas'
              ? 'bg-[var(--d2b-bg-elevated)] border-[#7C4DFF] text-[var(--d2b-text-primary)]'
              : 'border-[var(--d2b-border)] text-[var(--d2b-text-secondary)] hover:border-[#7C4DFF] hover:text-[var(--d2b-text-primary)] bg-transparent',
          ].join(' ')}
        >
          campanhas criadas
        </button>

        <button
          onClick={() => setFiltro('periodo')}
          className={[
            BTN_FILTER,
            filtro === 'periodo'
              ? 'bg-[var(--d2b-bg-elevated)] border-[#7C4DFF] text-[var(--d2b-text-primary)]'
              : 'border-[var(--d2b-border)] text-[var(--d2b-text-secondary)] hover:border-[#7C4DFF] hover:text-[var(--d2b-text-primary)] bg-transparent',
          ].join(' ')}
        >
          <Calendar size={13} />
          por período
        </button>
      </div>

      {/* ── Conteúdo ──────────────────────────────────────────────────── */}
      {filtrados.length === 0 ? (
        <EmptyState onNova={() => router.push('/dashboard/cadastros/campanhas/nova')} />
      ) : (
        <div className="rounded-xl border border-[var(--d2b-border)] overflow-hidden">
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-[var(--d2b-bg-elevated)] border-b border-[var(--d2b-border)]">
                <th className="text-left px-4 py-3 text-xs font-semibold text-[var(--d2b-text-secondary)] uppercase tracking-wider">
                  Campanha
                </th>
                <th className="text-left px-4 py-3 text-xs font-semibold text-[var(--d2b-text-secondary)] uppercase tracking-wider">
                  Período
                </th>
                <th className="text-right px-4 py-3 text-xs font-semibold text-[var(--d2b-text-secondary)] uppercase tracking-wider">
                  Desconto
                </th>
                <th className="text-center px-4 py-3 text-xs font-semibold text-[var(--d2b-text-secondary)] uppercase tracking-wider">
                  Status
                </th>
                <th className="px-4 py-3" />
              </tr>
            </thead>
            <tbody>
              {filtrados.map((c, i) => (
                <tr
                  key={c.id}
                  className={[
                    'border-b border-[var(--d2b-border)] hover:bg-[var(--d2b-hover)] transition-colors group',
                    i % 2 === 0 ? 'bg-transparent' : 'bg-[var(--d2b-bg-surface)]/30',
                  ].join(' ')}
                >
                  <td className="px-4 py-3">
                    <span
                      className="font-medium text-[var(--d2b-text-primary)] hover:text-[#7C4DFF] cursor-pointer transition-colors"
                      onClick={() => router.push(`/dashboard/cadastros/campanhas/${c.id}`)}
                    >
                      {c.nome}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-[var(--d2b-text-secondary)]">
                    {fmtData(c.dataInicio)} – {fmtData(c.dataTermino)}
                  </td>
                  <td className="px-4 py-3 text-right font-medium text-[var(--d2b-text-primary)]">
                    {c.desconto}%
                  </td>
                  <td className="px-4 py-3 text-center">
                    <StatusBadge status={c.status} />
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex items-center justify-end gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                      <button
                        onClick={() => router.push(`/dashboard/cadastros/campanhas/${c.id}`)}
                        className="p-1.5 rounded-md hover:bg-[var(--d2b-hover)] text-[var(--d2b-text-muted)] hover:text-[#7C4DFF] transition-colors"
                        title="Editar"
                      >
                        <Pencil size={14} />
                      </button>
                      <button
                        onClick={() => setExcluindo(c.id)}
                        className="p-1.5 rounded-md hover:bg-red-500/10 text-[var(--d2b-text-muted)] hover:text-red-400 transition-colors"
                        title="Excluir"
                      >
                        <Trash2 size={14} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* ── Modal confirmação de exclusão ──────────────────────────────── */}
      {excluindo && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm">
          <div className="bg-[var(--d2b-bg-surface)] border border-[var(--d2b-border)] rounded-xl p-6 max-w-sm w-full mx-4 shadow-xl">
            <h3 className="text-base font-semibold text-[var(--d2b-text-primary)] mb-2">
              Excluir campanha?
            </h3>
            <p className="text-sm text-[var(--d2b-text-secondary)] mb-6">
              Esta ação não pode ser desfeita.
            </p>
            <div className="flex gap-3 justify-end">
              <button
                onClick={() => setExcluindo(null)}
                className="px-4 py-2 rounded-md text-sm font-medium border border-[var(--d2b-border-strong)] text-[var(--d2b-text-secondary)] hover:text-[var(--d2b-text-primary)] transition-colors"
              >
                Cancelar
              </button>
              <button
                onClick={() => setExcluindo(null)}
                className="px-4 py-2 rounded-md text-sm font-bold bg-red-500 hover:bg-red-600 text-white transition-colors"
              >
                Excluir
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
