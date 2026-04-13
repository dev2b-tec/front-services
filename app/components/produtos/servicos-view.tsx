'use client'

import { useState } from 'react'
import { Search, Plus, Pencil, Trash2, X, Save, SearchIcon } from 'lucide-react'

// ─── Shared styles ───────────────────────────────────────────────────────────
const INP =
  'w-full bg-[var(--d2b-bg-main)] border border-[var(--d2b-border-strong)] rounded-md ' +
  'px-3 py-2.5 text-sm text-[var(--d2b-text-primary)] placeholder:text-[var(--d2b-text-muted)] ' +
  'focus:outline-none focus:border-[#7C4DFF] transition-colors'

const SEL =
  'w-full bg-[var(--d2b-bg-main)] border border-[var(--d2b-border-strong)] rounded-md ' +
  'px-3 py-2.5 text-sm text-[var(--d2b-text-primary)] ' +
  'focus:outline-none focus:border-[#7C4DFF] transition-colors'

const BTN_PRIMARY =
  'flex items-center gap-2 px-4 py-2 rounded-md text-sm font-bold text-white bg-[#7C4DFF] hover:bg-[#5B21B6] transition-colors'

const BTN_GHOST =
  'flex items-center gap-2 px-4 py-2 rounded-md text-sm font-medium text-[var(--d2b-text-secondary)] border border-[var(--d2b-border-strong)] hover:border-[#7C4DFF] hover:text-[var(--d2b-text-primary)] transition-colors'

const LBL = 'block text-xs font-medium text-[var(--d2b-text-secondary)] mb-1'

// ─── Types ───────────────────────────────────────────────────────────────────
type Servico = {
  id: string
  descricao: string
  codigo: string
  preco: number
  unidade: string
  situacao: 'Ativo' | 'Inativo'
}

// ─── Mock data ───────────────────────────────────────────────────────────────
const MOCK_SERVICOS: Servico[] = [
  { id: '1', descricao: 'Manicure',         codigo: '',  preco: 150.0, unidade: 'KX', situacao: 'Ativo' },
  { id: '2', descricao: 'Consultoria TI',   codigo: 'CTI001', preco: 3500.0, unidade: 'UN', situacao: 'Ativo' },
  { id: '3', descricao: 'Suporte Mensal',   codigo: 'SM002',  preco: 800.0,  unidade: 'MÊS', situacao: 'Inativo' },
]

type DrawerMode = 'criar' | 'editar' | null

interface FormState {
  descricao:       string
  codigo:          string
  preco:           string
  unidade:         string
  situacao:        string
  tipoItem:        string
  codigoLista:     string
  nbs:             string
  descComplementar: string
  observacoes:     string
}

function emptyForm(): FormState {
  return {
    descricao:       '',
    codigo:          '',
    preco:           '',
    unidade:         '',
    situacao:        'Ativo',
    tipoItem:        '',
    codigoLista:     '',
    nbs:             '',
    descComplementar: '',
    observacoes:     '',
  }
}

// ─── ServicosView ─────────────────────────────────────────────────────────────
export function ServicosView() {
  const [busca,      setBusca]      = useState('')
  const [drawerMode, setDrawerMode] = useState<DrawerMode>(null)
  const [form,       setForm]       = useState<FormState>(emptyForm())
  const [editandoId, setEditandoId] = useState<string | null>(null)
  const [excluindo,  setExcluindo]  = useState<string | null>(null)

  const filtrados = MOCK_SERVICOS.filter(s =>
    !busca || s.descricao.toLowerCase().includes(busca.toLowerCase()) || s.codigo.toLowerCase().includes(busca.toLowerCase())
  )

  function abrirCriar() {
    setForm(emptyForm())
    setEditandoId(null)
    setDrawerMode('criar')
  }

  function abrirEditar(s: Servico) {
    setForm({
      descricao:        s.descricao,
      codigo:           s.codigo,
      preco:            s.preco.toFixed(2),
      unidade:          s.unidade,
      situacao:         s.situacao,
      tipoItem:         '',
      codigoLista:      '',
      nbs:              '',
      descComplementar: '',
      observacoes:      '',
    })
    setEditandoId(s.id)
    setDrawerMode('editar')
  }

  function fecharDrawer() {
    setDrawerMode(null)
    setEditandoId(null)
    setForm(emptyForm())
  }

  function set(field: keyof FormState, value: string) {
    setForm(prev => ({ ...prev, [field]: value }))
  }

  return (
    <div className="flex h-full min-h-0 relative">

      {/* ── Lista ── */}
      <div className="flex flex-col flex-1 min-w-0">

        {/* Cabeçalho */}
        <div className="flex items-center justify-between px-8 py-5 border-b border-[var(--d2b-border)]">
          <h1 className="text-lg font-semibold text-[var(--d2b-text-primary)]">Serviços</h1>
          <button onClick={abrirCriar} className={BTN_PRIMARY}>
            <Plus size={16} />
            Incluir serviço
          </button>
        </div>

        {/* Busca */}
        <div className="px-8 pt-5 pb-4">
          <div className="relative w-80">
            <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-[var(--d2b-text-muted)]" />
            <input
              className="w-full bg-[var(--d2b-bg-main)] border border-[var(--d2b-border-strong)] rounded-md pl-9 pr-3 py-2.5 text-sm text-[var(--d2b-text-primary)] placeholder:text-[var(--d2b-text-muted)] focus:outline-none focus:border-[#7C4DFF] transition-colors"
              placeholder="Pesquise por nome ou código"
              value={busca}
              onChange={e => setBusca(e.target.value)}
            />
          </div>
        </div>

        {/* Tabela */}
        <div className="flex-1 overflow-y-auto px-8">
          <table className="w-full">
            <thead>
              <tr className="border-b border-[var(--d2b-border)]">
                <th className="w-8 pb-3"><input type="checkbox" className="w-4 h-4 rounded accent-[#7C4DFF] cursor-pointer" /></th>
                <th className="pb-3 text-left text-xs text-[var(--d2b-text-muted)] font-medium">Descrição</th>
                <th className="pb-3 text-left text-xs text-[var(--d2b-text-muted)] font-medium">Código</th>
                <th className="pb-3 text-right text-xs text-[var(--d2b-text-muted)] font-medium">Valor</th>
                <th className="pb-3 w-20" />
              </tr>
            </thead>
            <tbody>
              {filtrados.map(s => (
                <tr key={s.id} className="border-b border-[var(--d2b-border)] hover:bg-[var(--d2b-hover)] group">
                  <td className="py-3"><input type="checkbox" className="w-4 h-4 rounded accent-[#7C4DFF] cursor-pointer" /></td>
                  <td className="py-3 text-sm font-medium text-[var(--d2b-text-primary)]">{s.descricao}</td>
                  <td className="py-3 text-sm text-[var(--d2b-text-secondary)]">{s.codigo || '–'}</td>
                  <td className="py-3 text-sm text-[var(--d2b-text-secondary)] text-right">
                    {s.preco.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                  </td>
                  <td className="py-3">
                    <div className="flex items-center gap-1 justify-end opacity-0 group-hover:opacity-100 transition-opacity">
                      <button
                        onClick={() => abrirEditar(s)}
                        className="p-1.5 rounded hover:bg-[var(--d2b-hover)] text-[var(--d2b-text-muted)] hover:text-[var(--d2b-text-primary)] transition-colors"
                      >
                        <Pencil size={14} />
                      </button>
                      <button
                        onClick={() => setExcluindo(s.id)}
                        className="p-1.5 rounded hover:bg-red-500/10 text-[var(--d2b-text-muted)] hover:text-red-400 transition-colors"
                      >
                        <Trash2 size={14} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>

          {filtrados.length === 0 && (
            <p className="text-center text-sm text-[var(--d2b-text-muted)] py-12">
              Nenhum serviço encontrado.
            </p>
          )}
        </div>

        {/* Rodapé */}
        <div className="px-8 py-3 border-t border-[var(--d2b-border)] text-xs text-[var(--d2b-text-muted)]">
          {filtrados.length} {filtrados.length === 1 ? 'serviço' : 'serviços'}
        </div>
      </div>

      {/* ── Drawer lateral ── */}
      {drawerMode && (
        <div className="flex flex-col w-[420px] shrink-0 border-l border-[var(--d2b-border)] bg-[var(--d2b-bg-surface)] overflow-y-auto">

          {/* Header do drawer */}
          <div className="flex items-center justify-between px-5 py-4 border-b border-[var(--d2b-border)]">
            <div>
              <h2 className="text-sm font-semibold text-[var(--d2b-text-primary)]">Serviço</h2>
              <p className="text-xs text-[var(--d2b-text-muted)]">
                {drawerMode === 'criar' ? 'Novo Serviço' : form.descricao}
              </p>
            </div>
            <button onClick={fecharDrawer} className="p-1.5 rounded hover:bg-[var(--d2b-hover)] transition-colors">
              <X size={16} className="text-[var(--d2b-text-muted)]" />
            </button>
          </div>

          {/* Campos */}
          <div className="flex-1 px-5 py-5 flex flex-col gap-4">

            {/* Descrição + Código */}
            <div>
              <label className={LBL}>Descrição</label>
              <input
                className={INP}
                placeholder="Descrição completa do serviço"
                value={form.descricao}
                onChange={e => set('descricao', e.target.value)}
              />
            </div>
            <div>
              <label className={LBL}>Código</label>
              <input
                className={INP}
                placeholder="Código ou referência (opcional)"
                value={form.codigo}
                onChange={e => set('codigo', e.target.value)}
              />
            </div>

            {/* Preço + Unidade */}
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className={LBL}>Preço</label>
                <div className="relative">
                  <span className="absolute left-3 top-1/2 -translate-y-1/2 text-xs text-[var(--d2b-text-muted)]">R$</span>
                  <input
                    className={INP + ' pl-9'}
                    placeholder="0,00"
                    value={form.preco}
                    onChange={e => set('preco', e.target.value)}
                  />
                </div>
              </div>
              <div>
                <label className={LBL}>Unidade</label>
                <input
                  className={INP}
                  placeholder="Ex: Pç, Kg, ..."
                  value={form.unidade}
                  onChange={e => set('unidade', e.target.value)}
                />
              </div>
            </div>

            {/* Situação + Tipo do item */}
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className={LBL}>Situação</label>
                <select className={SEL} value={form.situacao} onChange={e => set('situacao', e.target.value)}>
                  <option>Ativo</option>
                  <option>Inativo</option>
                </select>
              </div>
              <div>
                <label className={LBL}>Tipo do item</label>
                <select className={SEL} value={form.tipoItem} onChange={e => set('tipoItem', e.target.value)}>
                  <option value="">Selecione</option>
                  <option>Serviço</option>
                  <option>Produto</option>
                </select>
              </div>
            </div>

            {/* Código da lista de serviços */}
            <div>
              <div className="flex items-center justify-between mb-1">
                <label className={LBL.replace('mb-1', '')}>Código da lista de serviços</label>
                <button className="text-xs text-red-400 hover:text-red-300 transition-colors">remover</button>
              </div>
              <div className="relative">
                <input
                  className={INP + ' pr-9'}
                  placeholder=""
                  value={form.codigoLista}
                  onChange={e => set('codigoLista', e.target.value)}
                />
                <SearchIcon size={14} className="absolute right-3 top-1/2 -translate-y-1/2 text-[var(--d2b-text-muted)]" />
              </div>
            </div>

            {/* NBS */}
            <div>
              <label className={LBL}>Nomenclatura Brasileira de Serviços (NBS)</label>
              <div className="relative">
                <input
                  className={INP + ' pr-9'}
                  placeholder=""
                  value={form.nbs}
                  onChange={e => set('nbs', e.target.value)}
                />
                <SearchIcon size={14} className="absolute right-3 top-1/2 -translate-y-1/2 text-[var(--d2b-text-muted)]" />
              </div>
            </div>

            {/* Descrição Complementar */}
            <div>
              <label className={LBL}>Descrição Complementar</label>
              <textarea
                className={INP + ' resize-none h-24'}
                placeholder="Campo exibido em propostas comerciais e pedidos de venda."
                value={form.descComplementar}
                onChange={e => set('descComplementar', e.target.value)}
              />
            </div>

            {/* Observações */}
            <div>
              <label className={LBL}>Observações</label>
              <textarea
                className={INP + ' resize-none h-20'}
                placeholder="Observações gerais sobre o serviço."
                value={form.observacoes}
                onChange={e => set('observacoes', e.target.value)}
              />
            </div>
          </div>

          {/* Ações do drawer */}
          <div className="flex items-center gap-3 px-5 py-4 border-t border-[var(--d2b-border)]">
            <button className={BTN_PRIMARY}>
              <Save size={14} />
              salvar
            </button>
            <button onClick={fecharDrawer} className={BTN_GHOST}>
              cancelar
            </button>
          </div>
        </div>
      )}

      {/* ── Modal de confirmação de exclusão ── */}
      {excluindo && (
        <div className="absolute inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-[var(--d2b-bg-elevated)] border border-[var(--d2b-border)] rounded-xl p-6 w-80 shadow-2xl">
            <h3 className="text-sm font-semibold text-[var(--d2b-text-primary)] mb-2">Excluir serviço</h3>
            <p className="text-sm text-[var(--d2b-text-secondary)] mb-5">
              Tem certeza que deseja excluir este serviço? Esta ação não pode ser desfeita.
            </p>
            <div className="flex gap-3">
              <button
                className="flex-1 py-2 rounded-md text-sm font-bold text-white bg-red-600 hover:bg-red-700 transition-colors"
                onClick={() => setExcluindo(null)}
              >
                Excluir
              </button>
              <button onClick={() => setExcluindo(null)} className={BTN_GHOST + ' flex-1 justify-center'}>
                Cancelar
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
