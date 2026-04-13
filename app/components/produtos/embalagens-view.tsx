'use client'

import { useState } from 'react'
import { Search, Plus, Pencil, Trash2, X, Save } from 'lucide-react'

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
type TipoEmbalagem = 'Envelope' | 'Rolo / Cilindro' | 'Caixa'

type Embalagem = {
  id: string
  descricao: string
  tipo: TipoEmbalagem
  largura?: number
  comprimento?: number
  altura?: number
  diametro?: number
  peso: number
}

// ─── Mock data ───────────────────────────────────────────────────────────────
const MOCK_EMBALAGENS: Embalagem[] = [
  { id: '1', descricao: 'Cano de 100', tipo: 'Rolo / Cilindro', comprimento: 100, diametro: 50, peso: 0 },
  { id: '2', descricao: 'Caixa Padrão', tipo: 'Caixa', largura: 30, comprimento: 20, altura: 15, peso: 0.5 },
  { id: '3', descricao: 'Envelope A4', tipo: 'Envelope', largura: 22, comprimento: 32, peso: 0 },
]

type DrawerMode = 'criar' | 'editar' | null

function buildDimensoes(e: Embalagem): string {
  if (e.tipo === 'Envelope')       return `${e.largura ?? 0}cm x ${e.comprimento ?? 0}cm`
  if (e.tipo === 'Rolo / Cilindro') return `${e.comprimento ?? 0}cm x ø${e.diametro ?? 0}cm`
  return `${e.largura ?? 0}cm x ${e.comprimento ?? 0}cm x ${e.altura ?? 0}cm`
}

// ─── EmbalagemForm (campos dinâmicos por tipo) ───────────────────────────────
interface FormState {
  descricao:   string
  tipo:        TipoEmbalagem
  largura:     string
  comprimento: string
  altura:      string
  diametro:    string
  peso:        string
}

function emptyForm(): FormState {
  return { descricao: '', tipo: 'Envelope', largura: '', comprimento: '', altura: '', diametro: '', peso: '' }
}

// ─── SVG diagrams por tipo de embalagem ──────────────────────────────────────
function PackagingDiagram({ tipo }: { tipo: TipoEmbalagem }) {
  const stroke = '#7C4DFF'
  const dim    = '#A78BCC'
  const fill   = 'rgba(124,77,255,0.06)'

  if (tipo === 'Envelope') return (
    <svg viewBox="0 0 200 110" className="w-full" fill="none">
      <rect x="20" y="20" width="160" height="70" rx="3" fill={fill} stroke={stroke} strokeWidth="1.5" />
      <line x1="20" y1="20" x2="100" y2="65" stroke={stroke} strokeWidth="1" strokeDasharray="4 2" />
      <line x1="180" y1="20" x2="100" y2="65" stroke={stroke} strokeWidth="1" strokeDasharray="4 2" />
      {/* L arrow */}
      <line x1="20" y1="100" x2="180" y2="100" stroke={dim} strokeWidth="1" markerEnd="none" />
      <line x1="20" y1="97" x2="20" y2="103" stroke={dim} strokeWidth="1" />
      <line x1="180" y1="97" x2="180" y2="103" stroke={dim} strokeWidth="1" />
      <text x="97" y="108" textAnchor="middle" fontSize="9" fill={dim} fontFamily="sans-serif">L</text>
      {/* C arrow */}
      <line x1="4" y1="20" x2="4" y2="90" stroke={dim} strokeWidth="1" />
      <line x1="1" y1="20" x2="7" y2="20" stroke={dim} strokeWidth="1" />
      <line x1="1" y1="90" x2="7" y2="90" stroke={dim} strokeWidth="1" />
      <text x="4" y="60" textAnchor="middle" fontSize="9" fill={dim} fontFamily="sans-serif" transform="rotate(-90 4 60)">C</text>
    </svg>
  )

  if (tipo === 'Rolo / Cilindro') return (
    <svg viewBox="0 0 200 110" className="w-full" fill="none">
      {/* Body */}
      <rect x="30" y="30" width="120" height="50" fill={fill} stroke={stroke} strokeWidth="1.5" />
      {/* Left ellipse */}
      <ellipse cx="30" cy="55" rx="10" ry="25" fill={fill} stroke={stroke} strokeWidth="1.5" />
      {/* Right ellipse */}
      <ellipse cx="150" cy="55" rx="10" ry="25" fill={fill} stroke={stroke} strokeWidth="1.5" />
      {/* D arrow (vertical) */}
      <line x1="168" y1="30" x2="168" y2="80" stroke={dim} strokeWidth="1" />
      <line x1="165" y1="30" x2="171" y2="30" stroke={dim} strokeWidth="1" />
      <line x1="165" y1="80" x2="171" y2="80" stroke={dim} strokeWidth="1" />
      <text x="176" y="58" fontSize="9" fill={dim} fontFamily="sans-serif">D</text>
      {/* C arrow (horizontal) */}
      <line x1="30" y1="100" x2="150" y2="100" stroke={dim} strokeWidth="1" />
      <line x1="30" y1="97" x2="30" y2="103" stroke={dim} strokeWidth="1" />
      <line x1="150" y1="97" x2="150" y2="103" stroke={dim} strokeWidth="1" />
      <text x="87" y="108" textAnchor="middle" fontSize="9" fill={dim} fontFamily="sans-serif">C</text>
    </svg>
  )

  // Caixa (3D box)
  return (
    <svg viewBox="0 0 200 130" className="w-full" fill="none">
      {/* Front face */}
      <rect x="30" y="45" width="110" height="70" fill={fill} stroke={stroke} strokeWidth="1.5" />
      {/* Top face */}
      <path d="M30 45 L60 15 L170 15 L140 45 Z" fill={fill} stroke={stroke} strokeWidth="1.5" />
      {/* Right face */}
      <path d="M140 45 L170 15 L170 85 L140 115 Z" fill={fill} stroke={stroke} strokeWidth="1.5" />
      {/* L arrow */}
      <line x1="30" y1="122" x2="140" y2="122" stroke={dim} strokeWidth="1" />
      <line x1="30" y1="119" x2="30" y2="125" stroke={dim} strokeWidth="1" />
      <line x1="140" y1="119" x2="140" y2="125" stroke={dim} strokeWidth="1" />
      <text x="83" y="130" textAnchor="middle" fontSize="9" fill={dim} fontFamily="sans-serif">L</text>
      {/* C arrow */}
      <line x1="14" y1="45" x2="14" y2="115" stroke={dim} strokeWidth="1" />
      <line x1="11" y1="45" x2="17" y2="45" stroke={dim} strokeWidth="1" />
      <line x1="11" y1="115" x2="17" y2="115" stroke={dim} strokeWidth="1" />
      <text x="8" y="83" textAnchor="middle" fontSize="9" fill={dim} fontFamily="sans-serif" transform="rotate(-90 8 83)">C</text>
      {/* A arrow (depth, top-right diagonal) */}
      <line x1="140" y1="8" x2="170" y2="8" stroke={dim} strokeWidth="1" />
      <line x1="140" y1="5" x2="140" y2="11" stroke={dim} strokeWidth="1" />
      <line x1="170" y1="5" x2="170" y2="11" stroke={dim} strokeWidth="1" />
      <text x="153" y="6" textAnchor="middle" fontSize="9" fill={dim} fontFamily="sans-serif">A</text>
    </svg>
  )
}

// ─── EmbalagemView ────────────────────────────────────────────────────────────
export function EmbalagemView() {
  const [busca,       setBusca]       = useState('')
  const [drawerMode,  setDrawerMode]  = useState<DrawerMode>(null)
  const [form,        setForm]        = useState<FormState>(emptyForm())
  const [editandoId,  setEditandoId]  = useState<string | null>(null)
  const [excluindo,   setExcluindo]   = useState<string | null>(null)

  const filtradas = MOCK_EMBALAGENS.filter(e =>
    !busca || e.descricao.toLowerCase().includes(busca.toLowerCase())
  )

  function abrirCriar() {
    setForm(emptyForm())
    setEditandoId(null)
    setDrawerMode('criar')
  }

  function abrirEditar(e: Embalagem) {
    setForm({
      descricao:   e.descricao,
      tipo:        e.tipo,
      largura:     e.largura?.toString()     ?? '',
      comprimento: e.comprimento?.toString() ?? '',
      altura:      e.altura?.toString()      ?? '',
      diametro:    e.diametro?.toString()    ?? '',
      peso:        e.peso.toString(),
    })
    setEditandoId(e.id)
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
          <h1 className="text-lg font-semibold text-[var(--d2b-text-primary)]">Embalagens de produtos</h1>
          <button onClick={abrirCriar} className={BTN_PRIMARY}>
            <Plus size={16} />
            Incluir embalagem
          </button>
        </div>

        {/* Busca */}
        <div className="px-8 pt-5 pb-4">
          <div className="relative w-80">
            <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-[var(--d2b-text-muted)]" />
            <input
              className="w-full bg-[var(--d2b-bg-main)] border border-[var(--d2b-border-strong)] rounded-md pl-9 pr-3 py-2.5 text-sm text-[var(--d2b-text-primary)] placeholder:text-[var(--d2b-text-muted)] focus:outline-none focus:border-[#7C4DFF] transition-colors"
              placeholder="Pesquisa..."
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
                <th className="pb-3 text-left text-xs text-[var(--d2b-text-muted)] font-medium">Tipo</th>
                <th className="pb-3 text-left text-xs text-[var(--d2b-text-muted)] font-medium">Dimensões</th>
                <th className="pb-3 text-right text-xs text-[var(--d2b-text-muted)] font-medium">Peso</th>
                <th className="pb-3 w-20" />
              </tr>
            </thead>
            <tbody>
              {filtradas.map(e => (
                <tr key={e.id} className="border-b border-[var(--d2b-border)] hover:bg-[var(--d2b-hover)] group">
                  <td className="py-3"><input type="checkbox" className="w-4 h-4 rounded accent-[#7C4DFF] cursor-pointer" /></td>
                  <td className="py-3 text-sm font-medium text-[var(--d2b-text-primary)]">{e.descricao}</td>
                  <td className="py-3 text-sm text-[var(--d2b-text-secondary)]">{e.tipo}</td>
                  <td className="py-3 text-sm text-[var(--d2b-text-secondary)]">{buildDimensoes(e)}</td>
                  <td className="py-3 text-sm text-[var(--d2b-text-secondary)] text-right">{e.peso.toFixed(2)} Kg</td>
                  <td className="py-3">
                    <div className="flex items-center gap-1 justify-end opacity-0 group-hover:opacity-100 transition-opacity">
                      <button
                        onClick={() => abrirEditar(e)}
                        className="p-1.5 rounded hover:bg-[var(--d2b-hover)] text-[var(--d2b-text-muted)] hover:text-[var(--d2b-text-primary)] transition-colors"
                      >
                        <Pencil size={14} />
                      </button>
                      <button
                        onClick={() => setExcluindo(e.id)}
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

          {filtradas.length === 0 && (
            <p className="text-center text-sm text-[var(--d2b-text-muted)] py-12">
              Nenhuma embalagem encontrada.
            </p>
          )}
        </div>

        {/* Rodapé */}
        <div className="px-8 py-3 border-t border-[var(--d2b-border)] text-xs text-[var(--d2b-text-muted)]">
          {filtradas.length} {filtradas.length === 1 ? 'embalagem' : 'embalagens'}
        </div>
      </div>

      {/* ── Drawer lateral ── */}
      {drawerMode && (
        <div className="flex flex-col w-[380px] shrink-0 border-l border-[var(--d2b-border)] bg-[var(--d2b-bg-surface)] overflow-y-auto">

          {/* Header do drawer */}
          <div className="flex items-center justify-between px-5 py-4 border-b border-[var(--d2b-border)]">
            <h2 className="text-sm font-semibold text-[var(--d2b-text-primary)]">
              {drawerMode === 'criar' ? 'Incluir embalagem' : 'Editar embalagem'}
            </h2>
            <button onClick={fecharDrawer} className="p-1.5 rounded hover:bg-[var(--d2b-hover)] transition-colors">
              <X size={16} className="text-[var(--d2b-text-muted)]" />
            </button>
          </div>

          {/* Campos do formulário */}
          <div className="flex-1 px-5 py-5 flex flex-col gap-4">

            <div>
              <label className={LBL}>Descrição</label>
              <input
                className={INP}
                placeholder="Nome da embalagem"
                value={form.descricao}
                onChange={e => set('descricao', e.target.value)}
              />
            </div>

            <div>
              <label className={LBL}>Tipo</label>
              <select className={SEL} value={form.tipo} onChange={e => set('tipo', e.target.value as TipoEmbalagem)}>
                <option>Envelope</option>
                <option>Rolo / Cilindro</option>
                <option>Caixa</option>
              </select>
            </div>

            {/* Diagrama ilustrativo */}
            <div className="rounded-lg border border-[var(--d2b-border)] bg-[var(--d2b-bg-elevated)] p-3">
              <PackagingDiagram tipo={form.tipo} />
            </div>

            {/* Campos dinâmicos por tipo */}
            {form.tipo === 'Envelope' && (
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className={LBL}>Largura (cm)</label>
                  <input className={INP} placeholder="0,0" value={form.largura} onChange={e => set('largura', e.target.value)} />
                </div>
                <div>
                  <label className={LBL}>Comprimento (cm)</label>
                  <input className={INP} placeholder="0,0" value={form.comprimento} onChange={e => set('comprimento', e.target.value)} />
                </div>
              </div>
            )}

            {form.tipo === 'Rolo / Cilindro' && (
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className={LBL}>Comprimento (cm)</label>
                  <input className={INP} placeholder="0,0" value={form.comprimento} onChange={e => set('comprimento', e.target.value)} />
                </div>
                <div>
                  <label className={LBL}>Diâmetro (cm)</label>
                  <input className={INP} placeholder="0,0" value={form.diametro} onChange={e => set('diametro', e.target.value)} />
                </div>
              </div>
            )}

            {form.tipo === 'Caixa' && (
              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className={LBL}>Largura (cm)</label>
                  <input className={INP} placeholder="0,0" value={form.largura} onChange={e => set('largura', e.target.value)} />
                </div>
                <div>
                  <label className={LBL}>Comprimento (cm)</label>
                  <input className={INP} placeholder="0,0" value={form.comprimento} onChange={e => set('comprimento', e.target.value)} />
                </div>
                <div>
                  <label className={LBL}>Altura (cm)</label>
                  <input className={INP} placeholder="0,0" value={form.altura} onChange={e => set('altura', e.target.value)} />
                </div>
              </div>
            )}

            <div className="max-w-[160px]">
              <label className={LBL}>Peso (Kg)</label>
              <input className={INP} placeholder="0,00" value={form.peso} onChange={e => set('peso', e.target.value)} />
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
            <h3 className="text-sm font-semibold text-[var(--d2b-text-primary)] mb-2">Excluir embalagem</h3>
            <p className="text-sm text-[var(--d2b-text-secondary)] mb-5">
              Tem certeza que deseja excluir esta embalagem? Esta ação não pode ser desfeita.
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
