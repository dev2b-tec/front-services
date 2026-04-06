'use client'

/**
 * components/produtos/produtos-view.tsx
 *
 * Componente principal do módulo Produtos.
 * Substitua o conteúdo pelo seu código real.
 *
 * Estrutura sugerida para o módulo completo:
 *   components/produtos/
 *     produtos-view.tsx      ← este arquivo (container)
 *     produtos-tabela.tsx    ← tabela de listagem
 *     produtos-form.tsx      ← formulário de criação/edição
 *     produtos-filtros.tsx   ← filtros por categoria/estoque
 *     produto-card.tsx       ← card de detalhe com imagem
 */

import { Package, Search, Plus, Tag, Layers } from 'lucide-react'

// Dados mockados — substitua por chamada à API ou Supabase
const MOCK_PRODUTOS = [
  { id: '1', nome: 'Plano Starter',   categoria: 'SaaS',     preco: 'R$ 97,00',   estoque: '—',    status: 'Ativo' },
  { id: '2', nome: 'Plano Pro',       categoria: 'SaaS',     preco: 'R$ 297,00',  estoque: '—',    status: 'Ativo' },
  { id: '3', nome: 'Plano Enterprise',categoria: 'SaaS',     preco: 'R$ 997,00',  estoque: '—',    status: 'Ativo' },
  { id: '4', nome: 'Consultoria 4h',  categoria: 'Serviço',  preco: 'R$ 480,00',  estoque: '8',    status: 'Ativo' },
  { id: '5', nome: 'Setup Inicial',   categoria: 'Serviço',  preco: 'R$ 1.200,00',estoque: '3',    status: 'Inativo' },
]

export function ProdutosView() {
  return (
    <div className="p-6 space-y-6">

      {/* Cabeçalho do módulo */}
      <div className="flex items-center justify-between gap-4 flex-wrap">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-lg bg-[var(--d2b-bg-elevated)] border border-[var(--d2b-border-strong)] flex items-center justify-center">
            <Package size={18} className="text-[#7C4DFF]" />
          </div>
          <div>
            <h2 className="text-lg font-bold text-[var(--d2b-text-primary)] leading-none">Produtos</h2>
            <p className="text-xs text-[var(--d2b-text-secondary)] mt-0.5">{MOCK_PRODUTOS.length} itens cadastrados</p>
          </div>
        </div>

        {/* Ações */}
        <div className="flex items-center gap-2">
          <div className="flex items-center gap-2 bg-[var(--d2b-bg-elevated)] border border-[var(--d2b-border)] rounded-lg px-3 h-9">
            <Search size={14} className="text-[var(--d2b-text-secondary)] shrink-0" />
            <input
              type="text"
              placeholder="Buscar produto..."
              className="bg-transparent text-sm text-[var(--d2b-text-primary)] placeholder:text-[var(--d2b-text-secondary)] outline-none w-40"
            />
          </div>
          <button className="flex items-center gap-1.5 h-9 px-4 rounded-lg bg-[#7C4DFF] hover:bg-[#5B21B6] text-white text-sm font-medium transition-colors">
            <Plus size={14} />
            Novo
          </button>
        </div>
      </div>

      {/* Tabela */}
      <div className="rounded-xl border border-[var(--d2b-border)] bg-[var(--d2b-bg-surface)] overflow-hidden">
        {/* Cabeçalho */}
        <div className="grid grid-cols-[1fr_auto_auto_auto_auto] gap-4 px-4 py-3 border-b border-[var(--d2b-border)]">
          {['Nome', 'Categoria', 'Preço', 'Estoque', 'Status'].map((col) => (
            <span key={col} className="text-[10px] font-semibold uppercase tracking-widest text-[var(--d2b-text-secondary)]">
              {col}
            </span>
          ))}
        </div>

        {/* Linhas */}
        {MOCK_PRODUTOS.map((p, i) => (
          <div
            key={p.id}
            className={`grid grid-cols-[1fr_auto_auto_auto_auto] gap-4 px-4 py-3.5 items-center hover:bg-[var(--d2b-hover)] transition-colors cursor-pointer ${i < MOCK_PRODUTOS.length - 1 ? 'border-b border-[var(--d2b-border)]' : ''}`}
          >
            <span className="flex items-center gap-2 text-sm font-medium text-[var(--d2b-text-primary)]">
              <Layers size={13} className="text-[#7C4DFF] shrink-0" />
              {p.nome}
            </span>
            <span className="flex items-center gap-1 text-xs text-[var(--d2b-text-secondary)]">
              <Tag size={11} className="text-[#7C4DFF]" />
              {p.categoria}
            </span>
            <span className="text-sm font-mono text-[#C084FC] tabular-nums">{p.preco}</span>
            <span className="text-sm text-[var(--d2b-text-secondary)] text-center tabular-nums">{p.estoque}</span>
            <span className={`text-xs font-medium px-2.5 py-1 rounded-full ${
              p.status === 'Ativo'
                ? 'bg-[var(--d2b-hover)] text-[#C084FC]'
                : 'bg-[rgba(167,139,204,0.1)] text-[var(--d2b-text-secondary)]'
            }`}>
              {p.status}
            </span>
          </div>
        ))}
      </div>

      {/*
       * TODO: substitua os dados mockados acima por uma chamada real.
       *
       * Com Supabase:
       *   const { data: produtos } = await supabase.from('produtos').select('*')
       *
       * Com API Route:
       *   const res = await fetch('/api/produtos')
       *   const { produtos } = await res.json()
       */}

    </div>
  )
}
