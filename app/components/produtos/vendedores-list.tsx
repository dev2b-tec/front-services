'use client'

import { useState } from 'react'
import { Search, Plus } from 'lucide-react'
import { useRouter } from 'next/navigation'

// ─── Shared styles ───────────────────────────────────────────────────────────
const BTN_PRIMARY =
  'flex items-center gap-2 px-4 py-2 rounded-md text-sm font-bold text-white bg-[#7C4DFF] hover:bg-[#5B21B6] transition-colors'

// ─── Types ───────────────────────────────────────────────────────────────────
type Situacao = 'ativo-acesso' | 'ativo' | 'inativo' | 'excluido'

type Vendedor = {
  id: string
  nome: string
  cidade: string
  uf: string
  situacao: Situacao
}

// ─── Mock data ───────────────────────────────────────────────────────────────
const MOCK_VENDEDORES: Vendedor[] = [
  { id: '1', nome: 'JESSE',          cidade: 'São Paulo',       uf: 'SP', situacao: 'ativo-acesso' },
  { id: '2', nome: 'Maria Silva',    cidade: 'Rio de Janeiro',  uf: 'RJ', situacao: 'ativo' },
  { id: '3', nome: 'Carlos Santos',  cidade: 'Curitiba',        uf: 'PR', situacao: 'inativo' },
]

type TabId = 'acesso' | 'todos' | 'ativos' | 'inativos' | 'excluidos'

const TABS: { id: TabId; label: string }[] = [
  { id: 'acesso',    label: 'ativos com acesso ao sistema' },
  { id: 'todos',     label: 'todos' },
  { id: 'ativos',    label: 'ativos' },
  { id: 'inativos',  label: 'inativos' },
  { id: 'excluidos', label: 'excluídos' },
]

// ─── VendedoresList ──────────────────────────────────────────────────────────
export function VendedoresList() {
  const router = useRouter()
  const [busca, setBusca]   = useState('')
  const [tab, setTab]       = useState<TabId>('acesso')

  const filtrados = MOCK_VENDEDORES.filter(v => {
    const byBusca = !busca || v.nome.toLowerCase().includes(busca.toLowerCase())
    const byTab: boolean =
      tab === 'todos'     ? true :
      tab === 'acesso'    ? v.situacao === 'ativo-acesso' :
      tab === 'ativos'    ? (v.situacao === 'ativo' || v.situacao === 'ativo-acesso') :
      tab === 'inativos'  ? v.situacao === 'inativo' :
      tab === 'excluidos' ? v.situacao === 'excluido' : true
    return byBusca && byTab
  })

  return (
    <div className="flex flex-col h-full">

      {/* ── Cabeçalho ── */}
      <div className="flex items-center justify-between px-8 py-5 border-b border-[var(--d2b-border)]">
        <h1 className="text-lg font-semibold text-[var(--d2b-text-primary)]">Vendedores</h1>
        <button
          onClick={() => router.push('/dashboard/cadastros/vendedores/novo')}
          className={BTN_PRIMARY}
        >
          <Plus size={16} />
          Incluir vendedor
        </button>
      </div>

      {/* ── Busca + Abas ── */}
      <div className="px-8 pt-5 pb-0 flex flex-col gap-3">
        <div className="relative w-80">
          <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-[var(--d2b-text-muted)]" />
          <input
            className="w-full bg-[var(--d2b-bg-main)] border border-[var(--d2b-border-strong)] rounded-md pl-9 pr-3 py-2.5 text-sm text-[var(--d2b-text-primary)] placeholder:text-[var(--d2b-text-muted)] focus:outline-none focus:border-[#7C4DFF] transition-colors"
            placeholder="Pesquise por nome ou código"
            value={busca}
            onChange={e => setBusca(e.target.value)}
          />
        </div>

        <div className="flex gap-0 border-b border-[var(--d2b-border)]">
          {TABS.map(t => (
            <button
              key={t.id}
              onClick={() => setTab(t.id)}
              className={[
                'px-4 py-2.5 text-sm font-medium capitalize transition-colors border-b-2 -mb-px',
                tab === t.id
                  ? 'border-[#7C4DFF] text-[#7C4DFF]'
                  : 'border-transparent text-[var(--d2b-text-secondary)] hover:text-[var(--d2b-text-primary)]',
              ].join(' ')}
            >
              {t.label}
            </button>
          ))}
        </div>
      </div>

      {/* ── Tabela ── */}
      <div className="flex-1 overflow-y-auto px-8 pt-4">
        <table className="w-full">
          <thead>
            <tr className="border-b border-[var(--d2b-border)]">
              <th className="w-8 pb-3">
                <input type="checkbox" className="w-4 h-4 rounded accent-[#7C4DFF] cursor-pointer" />
              </th>
              <th className="pb-3 text-left text-xs text-[var(--d2b-text-muted)] font-medium">Nome</th>
              <th className="pb-3 text-left text-xs text-[var(--d2b-text-muted)] font-medium">Cidade</th>
              <th className="pb-3 text-right text-xs text-[var(--d2b-text-muted)] font-medium w-24">Estado</th>
            </tr>
          </thead>
          <tbody>
            {filtrados.map(v => (
              <tr
                key={v.id}
                className="border-b border-[var(--d2b-border)] hover:bg-[var(--d2b-hover)] group"
              >
                <td className="py-3 pr-2">
                  <input type="checkbox" className="w-4 h-4 rounded accent-[#7C4DFF] cursor-pointer" />
                </td>
                <td className="py-3">
                  <div className="flex items-center gap-2">
                    <span className="text-xs text-[var(--d2b-text-muted)] opacity-0 group-hover:opacity-100 cursor-pointer select-none">
                      ···
                    </span>
                    <span
                      className="text-sm font-medium text-[var(--d2b-text-primary)] hover:text-[#7C4DFF] cursor-pointer"
                      onClick={() => router.push(`/dashboard/cadastros/vendedores/${v.id}`)}
                    >
                      {v.nome}
                    </span>
                  </div>
                </td>
                <td className="py-3 text-sm text-[var(--d2b-text-secondary)]">
                  {v.cidade}
                </td>
                <td className="py-3 text-right">
                  <span
                    className={`inline-block w-3 h-3 rounded-full ${
                      v.situacao === 'inativo' || v.situacao === 'excluido'
                        ? 'bg-gray-500'
                        : 'bg-green-500'
                    }`}
                  />
                </td>
              </tr>
            ))}
          </tbody>
        </table>

        {filtrados.length === 0 && (
          <p className="text-center text-sm text-[var(--d2b-text-muted)] py-12">
            Nenhum vendedor encontrado.
          </p>
        )}
      </div>

      {/* ── Rodapé ── */}
      <div className="px-8 py-3 border-t border-[var(--d2b-border)] text-xs text-[var(--d2b-text-muted)]">
        {filtrados.length} {filtrados.length === 1 ? 'cadastro' : 'cadastros'}
      </div>
    </div>
  )
}
