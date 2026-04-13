'use client'

import { useState } from 'react'
import {
  Layers, Search, Plus, Pencil, Trash2, X, Save, ChevronRight,
} from 'lucide-react'

// ─── Shared styles ──────────────────────────────────────────────────────────
const INP =
  'w-full bg-[var(--d2b-bg-main)] border border-[var(--d2b-border-strong)] rounded-md ' +
  'px-3 py-2.5 text-sm text-[var(--d2b-text-primary)] placeholder:text-[var(--d2b-text-muted)] ' +
  'focus:outline-none focus:border-[#7C4DFF] transition-colors'

const BTN_PRIMARY =
  'flex items-center gap-2 px-4 py-2 rounded-md text-sm font-bold text-white bg-[#7C4DFF] hover:bg-[#5B21B6] transition-colors'

const BTN_GHOST =
  'flex items-center gap-2 px-4 py-2 rounded-md text-sm font-medium text-[var(--d2b-text-secondary)] border border-[var(--d2b-border-strong)] hover:border-[#7C4DFF] hover:text-[var(--d2b-text-primary)] transition-colors'

// ─── Types ──────────────────────────────────────────────────────────────────
type Categoria = {
  id: string
  nome: string
  descricao?: string
  totalProdutos: number
}

// ─── Mock data ───────────────────────────────────────────────────────────────
const MOCK_CATEGORIAS: Categoria[] = [
  { id: '1', nome: 'SaaS',        descricao: 'Produtos de software como serviço',        totalProdutos: 3 },
  { id: '2', nome: 'Serviços',    descricao: 'Serviços profissionais e consultoria',      totalProdutos: 2 },
  { id: '3', nome: 'Kits',        descricao: 'Kits e pacotes de produtos',                totalProdutos: 1 },
  { id: '4', nome: 'Físicos',     descricao: 'Produtos físicos com controle de estoque',  totalProdutos: 0 },
]

type DrawerMode = 'criar' | 'editar' | null

export function CategoriasView() {
  const [busca, setBusca] = useState('')
  const [drawerMode, setDrawerMode] = useState<DrawerMode>(null)
  const [drawerNome, setDrawerNome] = useState('')
  const [drawerDescricao, setDrawerDescricao] = useState('')
  const [editandoId, setEditandoId] = useState<string | null>(null)
  const [excluindo, setExcluindo] = useState<string | null>(null)

  const filtradas = MOCK_CATEGORIAS.filter(c =>
    !busca || c.nome.toLowerCase().includes(busca.toLowerCase())
  )

  function abrirCriar() {
    setDrawerNome('')
    setDrawerDescricao('')
    setEditandoId(null)
    setDrawerMode('criar')
  }

  function abrirEditar(c: Categoria) {
    setDrawerNome(c.nome)
    setDrawerDescricao(c.descricao ?? '')
    setEditandoId(c.id)
    setDrawerMode('editar')
  }

  function fecharDrawer() {
    setDrawerMode(null)
    setEditandoId(null)
  }

  return (
    <>
      <div className="p-6 space-y-5">

        {/* ── Cabeçalho ─────────────────────────────────────────────────── */}
        <div className="flex items-center justify-between gap-4 flex-wrap">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-lg bg-[var(--d2b-bg-elevated)] border border-[var(--d2b-border-strong)] flex items-center justify-center shrink-0">
              <Layers size={18} className="text-[#7C4DFF]" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-[var(--d2b-text-primary)] leading-none">
                Categorias dos produtos
              </h2>
              <p className="text-xs text-[var(--d2b-text-secondary)] mt-0.5">
                {MOCK_CATEGORIAS.length} categorias cadastradas
              </p>
            </div>
          </div>

          <button onClick={abrirCriar} className={BTN_PRIMARY}>
            <Plus size={14} />
            incluir categoria
          </button>
        </div>

        {/* ── Busca ─────────────────────────────────────────────────────── */}
        <div className="flex items-center gap-2 bg-[var(--d2b-bg-elevated)] border border-[var(--d2b-border)] rounded-lg px-3 h-9 max-w-sm">
          <Search size={14} className="text-[var(--d2b-text-secondary)] shrink-0" />
          <input
            value={busca}
            onChange={e => setBusca(e.target.value)}
            placeholder="Pesquise por descrição"
            className="bg-transparent text-sm text-[var(--d2b-text-primary)] placeholder:text-[var(--d2b-text-muted)] outline-none w-full"
          />
        </div>

        {/* ── Lista / estado vazio ───────────────────────────────────────── */}
        {filtradas.length === 0 ? (
          <div className="bg-[var(--d2b-bg-surface)] border border-[var(--d2b-border)] rounded-xl flex flex-col items-center justify-center gap-4 py-16 px-6 text-center">
            <div className="w-14 h-14 rounded-full bg-[var(--d2b-bg-elevated)] border border-[var(--d2b-border-strong)] flex items-center justify-center">
              <Layers size={24} className="text-[var(--d2b-text-muted)]" />
            </div>
            <div>
              <p className="text-sm font-semibold text-[var(--d2b-text-primary)]">
                {busca ? 'Nenhuma categoria encontrada.' : 'Você não possui nenhuma categoria cadastrada.'}
              </p>
              <p className="text-xs text-[var(--d2b-text-muted)] mt-1">
                {busca
                  ? 'Tente outros termos de pesquisa.'
                  : 'Para inserir novos registros, clique em incluir categoria.'}
              </p>
            </div>
            {!busca && (
              <button onClick={abrirCriar} className={BTN_PRIMARY + ' text-xs'}>
                <Plus size={13} />
                incluir categoria
              </button>
            )}
          </div>
        ) : (
          <div className="rounded-xl border border-[var(--d2b-border)] overflow-hidden">
            <table className="w-full text-sm">
              <thead>
                <tr className="bg-[var(--d2b-bg-elevated)] border-b border-[var(--d2b-border)]">
                  <th className="text-left px-4 py-3 text-xs font-semibold text-[var(--d2b-text-secondary)] uppercase tracking-wider">
                    Categoria
                  </th>
                  <th className="text-left px-4 py-3 text-xs font-semibold text-[var(--d2b-text-secondary)] uppercase tracking-wider hidden md:table-cell">
                    Descrição
                  </th>
                  <th className="text-center px-4 py-3 text-xs font-semibold text-[var(--d2b-text-secondary)] uppercase tracking-wider">
                    Produtos
                  </th>
                  <th className="px-4 py-3" />
                </tr>
              </thead>
              <tbody>
                {filtradas.map((c, i) => (
                  <tr
                    key={c.id}
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
                          <Layers size={13} className="text-[#7C4DFF]" />
                        </div>
                        <div>
                          <span className="font-medium text-[var(--d2b-text-primary)]">{c.nome}</span>
                          {c.descricao && (
                            <p className="text-xs text-[var(--d2b-text-muted)] mt-0.5 md:hidden">{c.descricao}</p>
                          )}
                        </div>
                      </div>
                    </td>
                    {/* Descrição */}
                    <td className="px-4 py-3 text-[var(--d2b-text-secondary)] hidden md:table-cell">
                      {c.descricao || '—'}
                    </td>
                    {/* Produtos */}
                    <td className="px-4 py-3 text-center">
                      <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-[#7C4DFF]/10 text-[#A98EFF] border border-[#7C4DFF]/20">
                        {c.totalProdutos}
                      </span>
                    </td>
                    {/* Ações */}
                    <td className="px-4 py-3">
                      <div className="flex items-center justify-end gap-1">
                        <button
                          onClick={() => abrirEditar(c)}
                          title="Editar"
                          className="w-7 h-7 rounded flex items-center justify-center text-[var(--d2b-text-muted)] hover:text-[#7C4DFF] hover:bg-[#7C4DFF]/10 transition-colors"
                        >
                          <Pencil size={13} />
                        </button>
                        <button
                          onClick={() => setExcluindo(c.id)}
                          title="Excluir"
                          className="w-7 h-7 rounded flex items-center justify-center text-[var(--d2b-text-muted)] hover:text-red-400 hover:bg-red-500/10 transition-colors"
                        >
                          <Trash2 size={13} />
                        </button>
                        <button
                          onClick={() => abrirEditar(c)}
                          className="w-7 h-7 rounded flex items-center justify-center text-[var(--d2b-text-muted)] hover:text-[var(--d2b-text-primary)] hover:bg-[var(--d2b-hover)] transition-colors"
                        >
                          <ChevronRight size={14} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* ── Drawer lateral ──────────────────────────────────────────────────── */}
      {drawerMode && (
        <>
          {/* Overlay */}
          <div
            className="fixed inset-0 z-40 bg-[var(--d2b-overlay)]"
            onClick={fecharDrawer}
          />

          {/* Painel */}
          <div className="fixed top-0 right-0 h-full w-full max-w-sm z-50 bg-[var(--d2b-bg-surface)] border-l border-[var(--d2b-border-strong)] shadow-2xl flex flex-col">

            {/* Header do drawer */}
            <div className="flex items-center justify-between px-5 py-4 border-b border-[var(--d2b-border)]">
              <h3 className="text-sm font-bold text-[var(--d2b-text-primary)]">
                {drawerMode === 'criar' ? 'Nova categoria' : 'Editar categoria'}
              </h3>
              <button
                onClick={fecharDrawer}
                className="w-7 h-7 flex items-center justify-center rounded text-[var(--d2b-text-muted)] hover:text-[var(--d2b-text-primary)] hover:bg-[var(--d2b-hover)] transition-colors"
              >
                <X size={15} />
              </button>
            </div>

            {/* Corpo do drawer */}
            <div className="flex-1 overflow-y-auto p-5 space-y-4">
              <div>
                <label className="block text-xs font-medium text-[var(--d2b-text-secondary)] mb-1.5">
                  Nome da categoria <span className="text-red-400">*</span>
                </label>
                <input
                  className={INP}
                  placeholder="Ex: Eletrônicos"
                  value={drawerNome}
                  onChange={e => setDrawerNome(e.target.value)}
                  autoFocus
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-[var(--d2b-text-secondary)] mb-1.5">
                  Descrição do grupo
                </label>
                <textarea
                  rows={4}
                  className={INP + ' resize-none'}
                  placeholder="Descreva esta categoria de produtos..."
                  value={drawerDescricao}
                  onChange={e => setDrawerDescricao(e.target.value)}
                />
              </div>
            </div>

            {/* Rodapé do drawer */}
            <div className="flex items-center gap-3 px-5 py-4 border-t border-[var(--d2b-border)]">
              <button
                className={BTN_PRIMARY}
                onClick={fecharDrawer}
              >
                <Save size={14} />
                salvar
              </button>
              <button onClick={fecharDrawer} className={BTN_GHOST}>
                cancelar
              </button>
            </div>
          </div>
        </>
      )}

      {/* ── Confirm excluir ─────────────────────────────────────────────────── */}
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
              Excluir categoria?
            </h3>
            <p className="text-sm text-[var(--d2b-text-secondary)] mb-5">
              Esta ação não pode ser desfeita. Os produtos vinculados perderão a categoria.
            </p>
            <div className="flex items-center gap-3 justify-end">
              <button onClick={() => setExcluindo(null)} className={BTN_GHOST}>
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
    </>
  )
}
