'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import {
  Search, Plus, Printer, MoreHorizontal,
  Calendar, ArrowUpDown, SlidersHorizontal, Filter,
} from 'lucide-react'

// ─── Types ─────────────────────────────────────────────────────────────────
type TabId = 'todos' | 'cliente' | 'fornecedor' | 'transportador' | 'outro'

type Contato = {
  id: string
  nome: string
  documento: string
  cidade: string
  contato: string
  tipos: TabId[]
}

// ─── Mock ───────────────────────────────────────────────────────────────────
const MOCK: Contato[] = [
  { id: '1', nome: 'BS TECNOLOGIA LTDA',     documento: '',               cidade: '',                   contato: '',      tipos: ['outro']      },
  { id: '2', nome: 'BS TECNOLOGIA LTDA',     documento: '',               cidade: '',                   contato: '',      tipos: ['outro']      },
  { id: '3', nome: 'BS TECNOLOGIA LTDA',     documento: '',               cidade: 'Jaboatão dos Guararapes', contato: 'jesse', tipos: ['fornecedor'] },
  { id: '4', nome: 'Consumidor Final',        documento: '',               cidade: 'Recife',             contato: '',      tipos: ['cliente']    },
  { id: '5', nome: 'JESSE',                  documento: '058.031.464-20', cidade: '',                   contato: '',      tipos: ['cliente']    },
]

const TABS: { id: TabId; label: string }[] = [
  { id: 'todos',         label: 'todos'         },
  { id: 'cliente',       label: 'cliente'       },
  { id: 'fornecedor',    label: 'fornecedor'    },
  { id: 'transportador', label: 'transportador' },
  { id: 'outro',         label: 'outro'         },
]

function contagem(id: TabId) {
  if (id === 'todos') return MOCK.length
  return MOCK.filter(c => c.tipos.includes(id)).length
}

// ─── ClientesFornecedoresList ───────────────────────────────────────────────
export function ClientesFornecedoresList() {
  const router  = useRouter()
  const [busca, setBusca] = useState('')
  const [tab, setTab]     = useState<TabId>('todos')

  const filtrados = MOCK.filter(c => {
    const q = busca.toLowerCase()
    const matchBusca = !q || c.nome.toLowerCase().includes(q) || c.documento.includes(q)
    const matchTab   = tab === 'todos' || c.tipos.includes(tab)
    return matchBusca && matchTab
  })

  return (
    <div className="p-6 space-y-4">

      {/* ── Cabeçalho ─────────────────────────────────────────────────── */}
      <div className="flex items-center justify-between gap-4 flex-wrap">
        <h2 className="text-xl font-bold text-[var(--d2b-text-primary)]">
          Clientes e Fornecedores
        </h2>
        <div className="flex items-center gap-2">
          <button className="flex items-center gap-2 px-3 py-2 rounded-md text-sm font-medium text-[var(--d2b-text-secondary)] hover:text-[var(--d2b-text-primary)] transition-colors">
            <Printer size={14} />
            imprimir
          </button>
          <button
            onClick={() => router.push('/dashboard/cadastros/clientes-fornecedores/novo')}
            className="flex items-center gap-2 px-4 py-2 rounded-full text-sm font-bold text-white bg-[#7C4DFF] hover:bg-[#5B21B6] transition-colors"
          >
            <Plus size={14} />
            incluir cadastro
          </button>
          <button className="flex items-center gap-2 px-3 py-2 rounded-md text-sm font-medium border border-[var(--d2b-border-strong)] text-[var(--d2b-text-secondary)] hover:border-[#7C4DFF] hover:text-[var(--d2b-text-primary)] transition-colors">
            mais ações
            <MoreHorizontal size={14} />
          </button>
        </div>
      </div>

      {/* ── Busca + chips de filtro ───────────────────────────────────── */}
      <div className="flex items-center gap-2 flex-wrap">
        <div className="flex items-center gap-2 bg-[var(--d2b-bg-elevated)] border border-[var(--d2b-border)] rounded-lg px-3 h-9 w-80">
          <Search size={14} className="text-[var(--d2b-text-secondary)] shrink-0" />
          <input
            value={busca}
            onChange={e => setBusca(e.target.value)}
            placeholder="Pesquise por nome, cód., fantasia, email ou CPF/"
            className="bg-transparent text-sm text-[var(--d2b-text-primary)] placeholder:text-[var(--d2b-text-muted)] outline-none w-full"
          />
          <SlidersHorizontal size={13} className="text-[var(--d2b-text-muted)] shrink-0 cursor-pointer hover:text-[var(--d2b-text-secondary)]" />
        </div>

        {[
          { icon: <Calendar size={13} />,       label: 'por data do cadastro' },
          { icon: <ArrowUpDown size={13} />,    label: 'nome'                 },
          { icon: null,                          label: 'por situação'         },
          { icon: <Filter size={13} />,         label: 'filtros'              },
        ].map(chip => (
          <button
            key={chip.label}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-medium border border-[var(--d2b-border-strong)] text-[var(--d2b-text-secondary)] hover:border-[#7C4DFF] hover:text-[var(--d2b-text-primary)] bg-transparent transition-colors"
          >
            {chip.icon}
            {chip.label}
          </button>
        ))}
      </div>

      {/* ── Abas com contagens ────────────────────────────────────────── */}
      <div className="flex items-end gap-0 border-b border-[var(--d2b-border)]">
        {TABS.map(t => {
          const count = contagem(t.id)
          const active = tab === t.id
          return (
            <button
              key={t.id}
              onClick={() => setTab(t.id)}
              className={[
                'flex flex-col items-center px-5 pb-2.5 pt-2 border-b-2 -mb-px transition-colors',
                active
                  ? 'border-[#7C4DFF] text-[var(--d2b-text-primary)]'
                  : 'border-transparent text-[var(--d2b-text-secondary)] hover:text-[var(--d2b-text-primary)]',
              ].join(' ')}
            >
              <span className="text-sm font-medium">{t.label}</span>
              {count > 0 && (
                <span className={`text-xs font-semibold ${active ? 'text-[#7C4DFF]' : 'text-[var(--d2b-text-muted)]'}`}>
                  {String(count).padStart(2, '0')}
                </span>
              )}
            </button>
          )
        })}
      </div>

      {/* ── Tabela ───────────────────────────────────────────────────── */}
      <div className="rounded-xl border border-[var(--d2b-border)] overflow-hidden">
        <table className="w-full text-sm">
          <thead>
            <tr className="bg-[var(--d2b-bg-elevated)] border-b border-[var(--d2b-border)]">
              <th className="px-4 py-3 w-8">
                <input type="checkbox" className="w-4 h-4 rounded accent-[#7C4DFF] cursor-pointer" />
              </th>
              <th className="w-6 px-1 py-3" />
              <th className="text-left px-3 py-3 text-xs font-semibold text-[var(--d2b-text-secondary)] uppercase tracking-wider">
                Nome
                <ArrowUpDown size={11} className="inline ml-1 text-[var(--d2b-text-muted)]" />
              </th>
              <th className="text-left px-3 py-3 text-xs font-semibold text-[var(--d2b-text-secondary)] uppercase tracking-wider">
                CPF/CNPJ
              </th>
              <th className="text-left px-3 py-3 text-xs font-semibold text-[var(--d2b-text-secondary)] uppercase tracking-wider">
                Cidade
                <ArrowUpDown size={11} className="inline ml-1 text-[var(--d2b-text-muted)]" />
              </th>
              <th className="text-left px-3 py-3 text-xs font-semibold text-[var(--d2b-text-secondary)] uppercase tracking-wider">
                Contato
              </th>
            </tr>
          </thead>
          <tbody>
            {filtrados.length === 0 ? (
              <tr>
                <td colSpan={6} className="px-4 py-14 text-center text-sm text-[var(--d2b-text-muted)]">
                  Nenhum cadastro encontrado.
                </td>
              </tr>
            ) : filtrados.map(c => (
              <tr
                key={c.id}
                className="border-b border-[var(--d2b-border)] hover:bg-[var(--d2b-hover)] transition-colors group"
              >
                <td className="px-4 py-3">
                  <input type="checkbox" className="w-4 h-4 rounded accent-[#7C4DFF] cursor-pointer" />
                </td>
                <td className="px-1 py-3">
                  <span className="text-xs text-[var(--d2b-text-muted)] opacity-0 group-hover:opacity-100 cursor-pointer select-none">
                    ···
                  </span>
                </td>
                <td className="px-3 py-3">
                  <span
                    className="font-medium text-[var(--d2b-text-primary)] hover:text-[#7C4DFF] cursor-pointer transition-colors"
                    onClick={() => router.push(`/dashboard/cadastros/clientes-fornecedores/${c.id}`)}
                  >
                    {c.nome}
                  </span>
                </td>
                <td className="px-3 py-3 text-[var(--d2b-text-secondary)]">{c.documento}</td>
                <td className="px-3 py-3 text-[var(--d2b-text-secondary)]">{c.cidade}</td>
                <td className="px-3 py-3 text-[var(--d2b-text-secondary)]">{c.contato}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}
