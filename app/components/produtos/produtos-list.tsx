'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import {
  Package, Search, Plus, ChevronDown, Filter,
  Pencil, Trash2, Tag, MoreHorizontal,
} from 'lucide-react'

// ─── Shared styles ─────────────────────────────────────────────────────────
const BTN_PRIMARY =
  'flex items-center gap-2 px-4 py-2 rounded-md text-sm font-bold text-white bg-[#7C4DFF] hover:bg-[#5B21B6] transition-colors'
const BTN_GHOST =
  'flex items-center gap-2 px-4 py-2 rounded-md text-sm font-medium text-[var(--d2b-text-secondary)] border border-[var(--d2b-border-strong)] hover:border-[#7C4DFF] hover:text-[var(--d2b-text-primary)] transition-colors'

// ─── Types ─────────────────────────────────────────────────────────────────
type TipoProduto = 'todos' | 'simples' | 'kits' | 'variacoes' | 'fabricado' | 'materia-prima'

type Produto = {
  id: string
  nome: string
  sku: string
  categoria: string
  preco: number
  precoPromocional?: number
  estoque: number | null
  tipo: string
  status: 'Ativo' | 'Inativo'
}

// ─── Mock data ──────────────────────────────────────────────────────────────
const MOCK_PRODUTOS: Produto[] = [
  { id: '1', nome: 'Plano Starter',     sku: 'PLN-001', categoria: 'SaaS',    preco: 97,    estoque: null, tipo: 'simples',  status: 'Ativo' },
  { id: '2', nome: 'Plano Pro',          sku: 'PLN-002', categoria: 'SaaS',    preco: 297,   estoque: null, tipo: 'simples',  status: 'Ativo' },
  { id: '3', nome: 'Plano Enterprise',   sku: 'PLN-003', categoria: 'SaaS',    preco: 997,   estoque: null, tipo: 'simples',  status: 'Ativo' },
  { id: '4', nome: 'Consultoria 4h',     sku: 'SRV-001', categoria: 'Serviço', preco: 480,   estoque: 8,    tipo: 'simples',  status: 'Ativo' },
  { id: '5', nome: 'Setup Inicial',      sku: 'SRV-002', categoria: 'Serviço', preco: 1200,  estoque: 3,    tipo: 'simples',  status: 'Inativo' },
  { id: '6', nome: 'Kit Boas-vindas',    sku: 'KIT-001', categoria: 'Kits',    preco: 350,   precoPromocional: 299, estoque: 12, tipo: 'kits', status: 'Ativo' },
]

const TABS: { key: TipoProduto; label: string }[] = [
  { key: 'todos',        label: 'todos' },
  { key: 'simples',      label: 'simples' },
  { key: 'kits',         label: 'kits' },
  { key: 'variacoes',    label: 'variações' },
  { key: 'fabricado',    label: 'fabricado' },
  { key: 'materia-prima',label: 'matéria-prima' },
]

function fmtBRL(v: number) {
  return v.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })
}

function StatusBadge({ status }: { status: 'Ativo' | 'Inativo' }) {
  return (
    <span className={[
      'inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium',
      status === 'Ativo'
        ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20'
        : 'bg-zinc-500/10 text-[var(--d2b-text-muted)] border border-[var(--d2b-border)]',
    ].join(' ')}>
      {status}
    </span>
  )
}

export function ProdutosList() {
  const router = useRouter()
  const [busca, setBusca] = useState('')
  const [tab, setTab] = useState<TipoProduto>('todos')
  const [excluindo, setExcluindo] = useState<string | null>(null)

  const filtrados = MOCK_PRODUTOS.filter(p => {
    const matchTab = tab === 'todos' || p.tipo === tab
    const q = busca.toLowerCase()
    const matchBusca = !q || p.nome.toLowerCase().includes(q) || p.sku.toLowerCase().includes(q)
    return matchTab && matchBusca
  })

  return (
    <div className="p-6 space-y-5">

      {/* ── Cabeçalho ───────────────────────────────────────────────────── */}
      <div className="flex items-center justify-between gap-4 flex-wrap">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-lg bg-[var(--d2b-bg-elevated)] border border-[var(--d2b-border-strong)] flex items-center justify-center shrink-0">
            <Package size={18} className="text-[#7C4DFF]" />
          </div>
          <div>
            <h2 className="text-lg font-bold text-[var(--d2b-text-primary)] leading-none">
              Produtos
            </h2>
            <p className="text-xs text-[var(--d2b-text-secondary)] mt-0.5">
              {MOCK_PRODUTOS.length} itens cadastrados
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button className={BTN_GHOST}>
            <Filter size={14} />
            filtros
          </button>
          <button
            onClick={() => router.push('/dashboard/cadastros/produtos/novo')}
            className={BTN_PRIMARY}
          >
            <Plus size={14} />
            incluir produto
          </button>
        </div>
      </div>

      {/* ── Barra de busca ──────────────────────────────────────────────── */}
      <div className="flex items-center gap-3">
        <div className="flex items-center gap-2 bg-[var(--d2b-bg-elevated)] border border-[var(--d2b-border)] rounded-lg px-3 h-9 flex-1 max-w-sm">
          <Search size={14} className="text-[var(--d2b-text-secondary)] shrink-0" />
          <input
            value={busca}
            onChange={e => setBusca(e.target.value)}
            placeholder="Pesquise por nome, código (SKU) ou GTIN/EAN"
            className="bg-transparent text-sm text-[var(--d2b-text-primary)] placeholder:text-[var(--d2b-text-muted)] outline-none w-full"
          />
        </div>
        <button className={BTN_GHOST + ' text-xs'}>
          nome
          <ChevronDown size={13} />
        </button>
        <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-medium bg-[#7C4DFF]/15 text-[#A98EFF] border border-[#7C4DFF]/25">
          produtos ativos
        </span>
      </div>

      {/* ── Abas de tipo ────────────────────────────────────────────────── */}
      <div className="flex items-center gap-0 border-b border-[var(--d2b-border)]">
        {TABS.map(t => (
          <button
            key={t.key}
            onClick={() => setTab(t.key)}
            className={[
              'px-4 py-2.5 text-sm font-medium transition-colors border-b-2 -mb-px',
              tab === t.key
                ? 'border-[#7C4DFF] text-[var(--d2b-text-primary)]'
                : 'border-transparent text-[var(--d2b-text-secondary)] hover:text-[var(--d2b-text-primary)]',
            ].join(' ')}
          >
            {t.label}
          </button>
        ))}
      </div>

      {/* ── Tabela ──────────────────────────────────────────────────────── */}
      <div className="rounded-xl border border-[var(--d2b-border)] overflow-hidden">
        {filtrados.length === 0 ? (
          <div className="flex flex-col items-center justify-center gap-3 py-16 px-6 text-center">
            <Package size={40} className="text-[var(--d2b-text-muted)]" />
            <p className="text-sm font-medium text-[var(--d2b-text-secondary)]">
              Nenhum produto encontrado
            </p>
            <p className="text-xs text-[var(--d2b-text-muted)]">
              Tente outros filtros ou cadastre um novo produto.
            </p>
            <button
              onClick={() => router.push('/dashboard/cadastros/produtos/novo')}
              className={BTN_PRIMARY + ' mt-1 text-xs'}
            >
              <Plus size={13} />
              incluir produto
            </button>
          </div>
        ) : (
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-[var(--d2b-bg-elevated)] border-b border-[var(--d2b-border)]">
                <th className="text-left px-4 py-3 text-xs font-semibold text-[var(--d2b-text-secondary)] uppercase tracking-wider">
                  Produto
                </th>
                <th className="text-left px-4 py-3 text-xs font-semibold text-[var(--d2b-text-secondary)] uppercase tracking-wider">
                  SKU
                </th>
                <th className="text-left px-4 py-3 text-xs font-semibold text-[var(--d2b-text-secondary)] uppercase tracking-wider">
                  Categoria
                </th>
                <th className="text-right px-4 py-3 text-xs font-semibold text-[var(--d2b-text-secondary)] uppercase tracking-wider">
                  Preço
                </th>
                <th className="text-right px-4 py-3 text-xs font-semibold text-[var(--d2b-text-secondary)] uppercase tracking-wider">
                  Estoque
                </th>
                <th className="text-center px-4 py-3 text-xs font-semibold text-[var(--d2b-text-secondary)] uppercase tracking-wider">
                  Status
                </th>
                <th className="px-4 py-3" />
              </tr>
            </thead>
            <tbody>
              {filtrados.map((p, i) => (
                <tr
                  key={p.id}
                  className={[
                    'border-b border-[var(--d2b-border)] last:border-0 transition-colors',
                    i % 2 === 0 ? 'bg-[var(--d2b-bg-surface)]' : 'bg-[var(--d2b-bg-elevated)]/40',
                    'hover:bg-[var(--d2b-hover)]',
                  ].join(' ')}
                >
                  {/* Nome */}
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-2.5">
                      <div className="w-8 h-8 rounded-lg bg-[var(--d2b-bg-elevated)] border border-[var(--d2b-border)] flex items-center justify-center shrink-0">
                        <Tag size={13} className="text-[#7C4DFF]" />
                      </div>
                      <span className="font-medium text-[var(--d2b-text-primary)]">{p.nome}</span>
                    </div>
                  </td>
                  {/* SKU */}
                  <td className="px-4 py-3 text-[var(--d2b-text-secondary)] font-mono text-xs">
                    {p.sku}
                  </td>
                  {/* Categoria */}
                  <td className="px-4 py-3 text-[var(--d2b-text-secondary)]">
                    {p.categoria}
                  </td>
                  {/* Preço */}
                  <td className="px-4 py-3 text-right">
                    <div className="text-[var(--d2b-text-primary)] font-medium">{fmtBRL(p.preco)}</div>
                    {p.precoPromocional && (
                      <div className="text-xs text-emerald-400">{fmtBRL(p.precoPromocional)}</div>
                    )}
                  </td>
                  {/* Estoque */}
                  <td className="px-4 py-3 text-right text-[var(--d2b-text-secondary)]">
                    {p.estoque === null ? '—' : p.estoque}
                  </td>
                  {/* Status */}
                  <td className="px-4 py-3 text-center">
                    <StatusBadge status={p.status} />
                  </td>
                  {/* Ações */}
                  <td className="px-4 py-3">
                    <div className="flex items-center justify-end gap-1">
                      <button
                        onClick={() => router.push(`/dashboard/cadastros/produtos/${p.id}`)}
                        title="Editar"
                        className="w-7 h-7 rounded flex items-center justify-center text-[var(--d2b-text-muted)] hover:text-[#7C4DFF] hover:bg-[#7C4DFF]/10 transition-colors"
                      >
                        <Pencil size={13} />
                      </button>
                      <button
                        onClick={() => setExcluindo(p.id)}
                        title="Excluir"
                        className="w-7 h-7 rounded flex items-center justify-center text-[var(--d2b-text-muted)] hover:text-red-400 hover:bg-red-500/10 transition-colors"
                      >
                        <Trash2 size={13} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      {/* ── Confirm excluir (simples) ────────────────────────────────────── */}
      {excluindo && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-[var(--d2b-overlay)]"
          onClick={() => setExcluindo(null)}
        >
          <div
            className="bg-[var(--d2b-bg-elevated)] border border-[var(--d2b-border-strong)] rounded-xl p-6 w-full max-w-sm mx-4 shadow-lg"
            onClick={e => e.stopPropagation()}
          >
            <h3 className="text-base font-bold text-[var(--d2b-text-primary)] mb-2">
              Excluir produto?
            </h3>
            <p className="text-sm text-[var(--d2b-text-secondary)] mb-5">
              Esta ação não pode ser desfeita. O produto será removido permanentemente.
            </p>
            <div className="flex items-center gap-3 justify-end">
              <button
                onClick={() => setExcluindo(null)}
                className={BTN_GHOST}
              >
                cancelar
              </button>
              <button
                onClick={() => setExcluindo(null)}
                className="px-4 py-2 rounded-md text-sm font-bold text-white bg-red-600 hover:bg-red-700 transition-colors"
              >
                excluir
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
