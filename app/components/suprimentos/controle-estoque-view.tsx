'use client'

import { useState } from 'react'
import { OrdensCompraContent } from './ordens-compra-content'
import { ServicosTomadosContent } from './servicos-tomados-content'
import { NotasEntradaContent } from './notas-entrada-content'
import { ConferenciaComprasContent } from './conferencia-compras-content'
import { OrdensProducaoContent } from './ordens-producao-content'
import { NecessidadesCompraContent } from './necessidades-compra-content'
import { FCIContent } from './fci-content'
import { GiroEstoqueContent } from './giro-estoque-content'
import { RelatoriosSuprimentosContent } from './relatorios-suprimentos-content'
import {
  Warehouse, Truck, ShoppingCart, Wrench, FileText,
  ClipboardList, Factory, List, RotateCcw, FileCode,
  BarChart2, ArrowRight, Upload, RefreshCw, Download,
  Printer, Search, X, ChevronDown, MoreHorizontal,
  LayoutGrid, SlidersHorizontal, ArrowUpDown, type LucideIcon,
} from 'lucide-react'

// ─── Shared styles ──────────────────────────────────────────────────────────
const INP =
  'w-full bg-[var(--d2b-bg-main)] border border-[var(--d2b-border-strong)] rounded-md ' +
  'px-3 py-2.5 text-sm text-[var(--d2b-text-primary)] placeholder:text-[var(--d2b-text-muted)] ' +
  'focus:outline-none focus:border-[#7C4DFF] transition-colors'

const SEL =
  'w-full bg-[var(--d2b-bg-main)] border border-[var(--d2b-border-strong)] rounded-md ' +
  'px-3 py-2.5 text-sm text-[var(--d2b-text-primary)] ' +
  'focus:outline-none focus:border-[#7C4DFF] transition-colors appearance-none'

const LBL = 'block text-xs text-[var(--d2b-text-secondary)] mb-1'

const BTN_PRIMARY =
  'flex items-center gap-2 px-4 py-2.5 rounded-full text-sm font-bold text-white bg-[#7C4DFF] hover:bg-[#5B21B6] transition-colors'

const BTN_OUTLINE =
  'flex items-center gap-2 px-4 py-2 rounded-md text-sm font-medium border border-[var(--d2b-border-strong)] text-[var(--d2b-text-secondary)] hover:border-[#7C4DFF] hover:text-[var(--d2b-text-primary)] bg-transparent transition-colors'

// ─── Mock data ───────────────────────────────────────────────────────────────
type EstoqueItem = {
  id: string
  produto: string
  sku: string
  preco: number
  custoMedio: number
  estoqueFisico: number
  estoqueReservado: number
  estoqueDisponivel: number
  unidade: string
  localizacao: string
  qtdeInventario: string
}

const MOCK_ESTOQUE: EstoqueItem[] = [
  { id: '1', produto: 'Teste',         sku: '',      preco: 0,     custoMedio: 0,    estoqueFisico: 100, estoqueReservado: 0,  estoqueDisponivel: 100, unidade: '',   localizacao: '',    qtdeInventario: '' },
  { id: '2', produto: 'Produto Alpha', sku: 'SKU01', preco: 29.90, custoMedio: 25.0, estoqueFisico: 250, estoqueReservado: 20, estoqueDisponivel: 230, unidade: 'UN', localizacao: 'A-01', qtdeInventario: '' },
  { id: '3', produto: 'Produto Beta',  sku: 'SKU02', preco: 49.90, custoMedio: 40.0, estoqueFisico: 80,  estoqueReservado: 0,  estoqueDisponivel: 80,  unidade: 'UN', localizacao: 'B-03', qtdeInventario: '' },
]

// ─── Tipos de sub-tela de Controle de Estoques ───────────────────────────────
type ControleTela = 'lista' | 'inventario' | 'planilha' | 'coletor'

// alias usado pelas sub-telas de inventário
type InvTela = 'landing' | 'planilha' | 'coletor'

// ─── InventarioLanding ────────────────────────────────────────────────────────
function InventarioLanding({ onNavigate, onBack }: { onNavigate: (t: InvTela) => void; onBack?: () => void }) {
  return (
    <div className="p-8 max-w-3xl">
      {onBack && (
        <button onClick={onBack} className="text-xs text-[var(--d2b-text-muted)] hover:text-[var(--d2b-text-primary)] mb-6 flex items-center gap-1 transition-colors">
          ← voltar
        </button>
      )}
      <h2 className="text-xl font-semibold text-[var(--d2b-text-primary)] mb-2">
        Inventário de estoque
      </h2>
      <p className="text-sm text-[var(--d2b-text-secondary)] mb-8 leading-relaxed">
        O inventário de estoque é uma conferência de quantidades de produtos no estoque físico.
        É possível identificar os itens disponíveis para registrar atualizações em lote e manter
        um controle preciso do estoque da empresa.
      </p>

      <div className="space-y-3">
        {/* Gerar inventário */}
        <button
          onClick={() => onNavigate('landing')}
          className="w-full flex items-center justify-between px-6 py-5 rounded-xl border border-[var(--d2b-border)] hover:border-[#7C4DFF] bg-[var(--d2b-bg-surface)] hover:bg-[var(--d2b-hover)] transition-all group"
        >
          <div className="flex items-center gap-4">
            <div className="w-10 h-10 rounded-lg bg-[var(--d2b-bg-elevated)] flex items-center justify-center shrink-0">
              <RefreshCw size={18} className="text-[#7C4DFF]" />
            </div>
            <div className="text-left">
              <p className="text-sm font-semibold text-[var(--d2b-text-primary)]">Gerar inventário</p>
              <p className="text-xs text-[var(--d2b-text-secondary)] mt-0.5">
                Visualização, edição rápida e download do seu inventário de estoque
              </p>
            </div>
          </div>
          <ArrowRight size={16} className="text-[var(--d2b-text-muted)] group-hover:text-[#7C4DFF] transition-colors shrink-0" />
        </button>

        {/* Importar por planilha */}
        <button
          onClick={() => onNavigate('planilha')}
          className="w-full flex items-center justify-between px-6 py-5 rounded-xl border border-[var(--d2b-border)] hover:border-[#7C4DFF] bg-[var(--d2b-bg-surface)] hover:bg-[var(--d2b-hover)] transition-all group"
        >
          <div className="flex items-center gap-4">
            <div className="w-10 h-10 rounded-lg bg-[var(--d2b-bg-elevated)] flex items-center justify-center shrink-0">
              <Download size={18} className="text-[#7C4DFF]" />
            </div>
            <div className="text-left">
              <p className="text-sm font-semibold text-[var(--d2b-text-primary)]">Importar por planilha</p>
              <p className="text-xs text-[var(--d2b-text-secondary)] mt-0.5">
                Arquivo no formato Excel (.xls ou .xlsx) ou texto (.csv)
              </p>
            </div>
          </div>
          <ArrowRight size={16} className="text-[var(--d2b-text-muted)] group-hover:text-[#7C4DFF] transition-colors shrink-0" />
        </button>

        {/* Importar por coletor */}
        <button
          onClick={() => onNavigate('coletor')}
          className="w-full flex items-center justify-between px-6 py-5 rounded-xl border border-[var(--d2b-border)] hover:border-[#7C4DFF] bg-[var(--d2b-bg-surface)] hover:bg-[var(--d2b-hover)] transition-all group"
        >
          <div className="flex items-center gap-4">
            <div className="w-10 h-10 rounded-lg bg-[var(--d2b-bg-elevated)] flex items-center justify-center shrink-0">
              <Upload size={18} className="text-[#7C4DFF]" />
            </div>
            <div className="text-left">
              <p className="text-sm font-semibold text-[var(--d2b-text-primary)]">Importar por coletor</p>
              <p className="text-xs text-[var(--d2b-text-secondary)] mt-0.5">
                Arquivo no formato Texto (.txt)
              </p>
            </div>
          </div>
          <ArrowRight size={16} className="text-[var(--d2b-text-muted)] group-hover:text-[#7C4DFF] transition-colors shrink-0" />
        </button>
      </div>
    </div>
  )
}

// ─── DropZone ──────────────────────────────────────────────────────────────
function DropZone({ label, hint }: { label: string; hint: string }) {
  return (
    <div className="flex items-center gap-0 border border-[var(--d2b-border-strong)] rounded-lg overflow-hidden">
      <label className="flex items-center gap-2 px-4 py-2.5 bg-[#7C4DFF] hover:bg-[#5B21B6] text-white text-sm font-bold cursor-pointer transition-colors shrink-0">
        <Upload size={14} />
        {label}
        <input type="file" className="hidden" />
      </label>
      <div className="flex items-center gap-3 px-4 flex-1">
        <span className="text-xs text-[var(--d2b-text-muted)]">{hint}</span>
        <span className="hidden md:block text-[var(--d2b-border-strong)] text-xs">|</span>
        <span className="hidden md:block text-xs text-[var(--d2b-text-muted)] italic">
          Experimente arrastar o arquivo até aqui
        </span>
      </div>
    </div>
  )
}

// ─── ImportarPlanilha ────────────────────────────────────────────────────────
function ImportarPlanilha({ onBack }: { onBack: () => void }) {
  return (
    <div className="p-8 max-w-2xl">
      <button onClick={onBack} className="text-xs text-[var(--d2b-text-muted)] hover:text-[var(--d2b-text-primary)] mb-6 flex items-center gap-1 transition-colors">
        ← voltar
      </button>

      <h2 className="text-xl font-semibold text-[var(--d2b-text-primary)] mb-2">
        Importar inventário por planilha
      </h2>
      <p className="text-sm text-[var(--d2b-text-secondary)] mb-6 leading-relaxed">
        Conte os produtos em estoque e atualize a planilha de importação padrão do Sistema ERP.
      </p>

      <DropZone label="selecionar arquivo" hint="Formato CSV, XLS, XLSX até 2mb" />

      {/* Depósito de destino */}
      <div className="mt-6">
        <label className={LBL}>Depósito de destino</label>
        <div className="relative max-w-xs">
          <select className={SEL}>
            <option>Geral</option>
          </select>
          <ChevronDown size={13} className="absolute right-3 top-1/2 -translate-y-1/2 text-[var(--d2b-text-muted)] pointer-events-none" />
        </div>
      </div>

      {/* Download para importação */}
      <div className="mt-8 pt-6 border-t border-[var(--d2b-border)]">
        <p className="text-sm font-semibold text-[var(--d2b-text-primary)] mb-1">
          Faça download do inventário &quot;para importação&quot;
        </p>
        <p className="text-xs text-[var(--d2b-text-secondary)] mb-3">
          Considerando os produtos e quantidades informados no Sistema ERP para realizar a contagem.
        </p>
        <button className="flex items-center gap-1.5 text-sm text-[#7C4DFF] hover:text-[#A98EFF] transition-colors">
          <RefreshCw size={13} />
          gerar inventário
        </button>
      </div>

      {/* Exemplo de planilha */}
      <div className="mt-6 pt-6 border-t border-[var(--d2b-border)]">
        <p className="text-sm font-semibold text-[var(--d2b-text-primary)] mb-1">
          Exemplo de planilha compatível com o Sistema ERP
        </p>
        <p className="text-xs text-[var(--d2b-text-secondary)] mb-3">
          Utilize a planilha de exemplo do Sistema ERP para realizar a contagem dos itens no estoque.
        </p>
        <button className="flex items-center gap-1.5 text-sm text-[#7C4DFF] hover:text-[#A98EFF] transition-colors">
          <Download size={13} />
          baixar arquivo de exemplo
        </button>
      </div>

      <p className="mt-8 text-xs text-[var(--d2b-text-muted)] leading-relaxed">
        Na importação, pelo menos um dos campos deve ser preenchido. Para identificar produtos já
        cadastrados será considerado o campo ID e, caso esteja em branco, será considerado o código SKU.
        <br />* Apenas a localização e o saldo em estoque podem ser atualizados.
      </p>

      <div className="mt-8 flex items-center justify-end">
        <button onClick={onBack} className="text-sm text-[var(--d2b-text-secondary)] hover:text-[var(--d2b-text-primary)] transition-colors">
          cancelar
        </button>
      </div>
    </div>
  )
}

// ─── ImportarColetor ──────────────────────────────────────────────────────────
function ImportarColetor({ onBack }: { onBack: () => void }) {
  const [validacao, setValidacao] = useState<'gtin' | 'sku' | 'ambos'>('gtin')

  return (
    <div className="p-8 max-w-2xl">
      <button onClick={onBack} className="text-xs text-[var(--d2b-text-muted)] hover:text-[var(--d2b-text-primary)] mb-6 flex items-center gap-1 transition-colors">
        ← voltar
      </button>

      <h2 className="text-xl font-semibold text-[var(--d2b-text-primary)] mb-2">
        Importar inventário por coletor
      </h2>
      <p className="text-sm text-[var(--d2b-text-secondary)] mb-6 leading-relaxed">
        Utilize um coletor para fazer a bipagem dos produtos em estoque e importe o arquivo para
        atualizar o estoque no Sistema ERP.
      </p>

      <DropZone label="selecionar arquivo" hint="Formato TXT até 2mb" />

      {/* Validação */}
      <div className="mt-6">
        <label className={LBL + ' mb-3'}>Como deseja validar o arquivo?</label>
        <div className="space-y-2.5">
          {(
            [
              { id: 'gtin', label: 'Código de barras (GTIN/EAN)' },
              { id: 'sku',  label: 'Código SKU'                  },
              { id: 'ambos',label: 'Código GTIN/EAN ou SKU'      },
            ] as const
          ).map(opt => (
            <label key={opt.id} className="flex items-center gap-2 cursor-pointer">
              <input
                type="radio"
                name="validacao"
                checked={validacao === opt.id}
                onChange={() => setValidacao(opt.id)}
                className="w-4 h-4 accent-[#7C4DFF]"
              />
              <span className="text-sm text-[var(--d2b-text-primary)]">{opt.label}</span>
            </label>
          ))}
        </div>
      </div>

      {/* Depósito */}
      <div className="mt-6">
        <label className={LBL}>Depósito de destino</label>
        <div className="relative max-w-xs">
          <select className={SEL}>
            <option>Geral</option>
          </select>
          <ChevronDown size={13} className="absolute right-3 top-1/2 -translate-y-1/2 text-[var(--d2b-text-muted)] pointer-events-none" />
        </div>
      </div>

      {/* O que é coletor? */}
      <div className="mt-8 pt-6 border-t border-[var(--d2b-border)]">
        <p className="text-sm font-semibold text-[var(--d2b-text-primary)] mb-2">O que é coletor?</p>
        <button className="flex items-center gap-1.5 text-sm text-[#7C4DFF] hover:text-[#A98EFF] transition-colors mb-4">
          <Download size={13} />
          baixar arquivo de exemplo
        </button>
        <p className="text-xs text-[var(--d2b-text-muted)] leading-relaxed">
          O coletor é um dispositivo que pode ser utilizado para ler o código GTIN ou SKU dos itens.
        </p>
        <p className="text-xs text-[var(--d2b-text-muted)] leading-relaxed mt-2">
          Após a contagem, você pode exportar um arquivo TXT do equipamento com os códigos coletados
          e importá-lo no Sistema ERP para atualizar o estoque.
        </p>
      </div>

      <div className="mt-8 flex items-center justify-end">
        <button onClick={onBack} className="text-sm text-[var(--d2b-text-secondary)] hover:text-[var(--d2b-text-primary)] transition-colors">
          cancelar
        </button>
      </div>
    </div>
  )
}

// ─── RelatorioEstoque ─────────────────────────────────────────────────────────
type RelTela = 'filtros' | 'resultado'

function RelatorioEstoque() {
  const [tela, setTela]               = useState<RelTela>('filtros')
  const [informando, setInformando]   = useState(false)
  const [qtdes, setQtdes]             = useState<Record<string, string>>({})
  const [busca, setBusca]             = useState('')
  const [exibir, setExibir]           = useState('Todos os itens')
  const [situacao, setSituacao]       = useState('Ativos')
  const [valorBase, setValorBase]     = useState('Preço da última compra')
  const [exibirDisp, setExibirDisp]   = useState(false)
  const [exibirImg, setExibirImg]     = useState(false)

  if (tela === 'filtros') {
    return (
      <div className="p-8 max-w-3xl">
        <h2 className="text-xl font-semibold text-[var(--d2b-text-primary)] mb-6">
          Inventário de Estoque
        </h2>

        <div className="space-y-5">
          {/* Busca + Tags */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className={LBL}>Busca</label>
              <input
                className={INP}
                placeholder="Pesquise por nome, código (SKU) ou GTIN"
                value={busca}
                onChange={e => setBusca(e.target.value)}
              />
            </div>
            <div>
              <label className={LBL}>Tags</label>
              <div className="relative">
                <select className={SEL}>
                  <option>Sem filtro por tags</option>
                </select>
                <ChevronDown size={13} className="absolute right-3 top-1/2 -translate-y-1/2 text-[var(--d2b-text-muted)] pointer-events-none" />
              </div>
            </div>
          </div>

          {/* Categoria + Exibir + Situação */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className={LBL}>Categoria</label>
              <div className="flex items-center gap-1.5 border border-[var(--d2b-border-strong)] rounded-md bg-[var(--d2b-bg-main)] px-3 h-10">
                <input className="bg-transparent text-sm text-[var(--d2b-text-primary)] outline-none flex-1 placeholder:text-[var(--d2b-text-muted)]" placeholder="" />
                <Search size={13} className="text-[var(--d2b-text-muted)] cursor-pointer" />
                <X size={13} className="text-[var(--d2b-text-muted)] cursor-pointer" />
              </div>
            </div>
            <div>
              <label className={LBL}>Exibir</label>
              <div className="relative">
                <select className={SEL} value={exibir} onChange={e => setExibir(e.target.value)}>
                  <option>Todos os itens</option>
                  <option>Somente com estoque</option>
                  <option>Somente sem estoque</option>
                </select>
                <ChevronDown size={13} className="absolute right-3 top-1/2 -translate-y-1/2 text-[var(--d2b-text-muted)] pointer-events-none" />
              </div>
            </div>
            <div>
              <label className={LBL}>Situação do produto</label>
              <div className="relative">
                <select className={SEL} value={situacao} onChange={e => setSituacao(e.target.value)}>
                  <option>Ativos</option>
                  <option>Inativo</option>
                  <option>Todos</option>
                </select>
                <ChevronDown size={13} className="absolute right-3 top-1/2 -translate-y-1/2 text-[var(--d2b-text-muted)] pointer-events-none" />
              </div>
            </div>
          </div>

          {/* Fornecedor + Valor baseado em */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className={LBL}>Fornecedor</label>
              <input className={INP} placeholder="Qualquer fornecedor" />
              <p className="text-xs text-[var(--d2b-text-muted)] mt-1">
                * Digite a razão social ou o nome fantasia
              </p>
            </div>
            <div>
              <label className={LBL}>Valor baseado em</label>
              <div className="relative">
                <select className={SEL} value={valorBase} onChange={e => setValorBase(e.target.value)}>
                  <option>Preço da última compra</option>
                  <option>Custo médio</option>
                  <option>Preço de venda</option>
                </select>
                <ChevronDown size={13} className="absolute right-3 top-1/2 -translate-y-1/2 text-[var(--d2b-text-muted)] pointer-events-none" />
              </div>
            </div>
          </div>

          {/* Checkboxes */}
          <div className="flex flex-col gap-2">
            <label className="flex items-center gap-2.5 cursor-pointer">
              <input type="checkbox" checked={exibirDisp} onChange={e => setExibirDisp(e.target.checked)} className="w-4 h-4 rounded accent-[#7C4DFF]" />
              <span className="text-sm text-[var(--d2b-text-secondary)]">Exibir estoque disponível</span>
            </label>
            <label className="flex items-center gap-2.5 cursor-pointer">
              <input type="checkbox" checked={exibirImg} onChange={e => setExibirImg(e.target.checked)} className="w-4 h-4 rounded accent-[#7C4DFF]" />
              <span className="text-sm text-[var(--d2b-text-secondary)]">Exibir imagem dos produtos</span>
            </label>
          </div>

          <button onClick={() => setTela('resultado')} className={BTN_PRIMARY + ' mt-2 w-fit'}>
            gerar
          </button>
        </div>
      </div>
    )
  }

  // ── Resultado ──
  const TH = 'text-left px-3 py-3 text-xs font-semibold text-[var(--d2b-text-secondary)] uppercase tracking-wider'

  return (
    <div className="p-8">
      <h2 className="text-xl font-semibold text-[var(--d2b-text-primary)] mb-4">
        Inventário de Estoque
      </h2>

      <div className="flex items-center gap-2 mb-6 flex-wrap">
        <button onClick={() => setTela('filtros')} className={BTN_PRIMARY}>
          exibir filtros
        </button>
        <button className={BTN_OUTLINE}>
          <Printer size={13} />
          imprimir
        </button>
        <button className={BTN_OUTLINE}>
          <Download size={13} />
          download
        </button>
        {informando ? (
          <button
            onClick={() => setInformando(false)}
            className={BTN_PRIMARY}
          >
            salvar quantidades
          </button>
        ) : (
          <button
            onClick={() => setInformando(true)}
            className={BTN_OUTLINE}
          >
            informar quantidades
          </button>
        )}
      </div>

      <div className="rounded-xl border border-[var(--d2b-border)] overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="bg-[var(--d2b-bg-elevated)] border-b border-[var(--d2b-border)]">
              <th className={TH}>Produto</th>
              <th className={TH}>Código (SKU)</th>
              <th className={TH}>Preço</th>
              <th className={TH}>UN</th>
              <th className={TH}>Localização</th>
              <th className={TH + ' text-right'}>Estoque atual</th>
              <th className={TH + ' text-right'}>Estoque disponível</th>
              {informando && <th className={TH + ' text-right'}>Qtde inventário</th>}
            </tr>
          </thead>
          <tbody>
            {MOCK_ESTOQUE.map(item => (
              <tr key={item.id} className="border-b border-[var(--d2b-border)] hover:bg-[var(--d2b-hover)] transition-colors">
                <td className="px-3 py-3 font-medium text-[var(--d2b-text-primary)]">{item.produto}</td>
                <td className="px-3 py-3 text-[var(--d2b-text-secondary)]">{item.sku}</td>
                <td className="px-3 py-3 text-[var(--d2b-text-secondary)]">{item.preco.toFixed(2)}</td>
                <td className="px-3 py-3 text-[var(--d2b-text-secondary)]">{item.unidade}</td>
                <td className="px-3 py-3 text-[var(--d2b-text-secondary)]">{item.localizacao}</td>
                <td className="px-3 py-3 text-right text-[var(--d2b-text-primary)]">{item.estoqueFisico.toFixed(2)}</td>
                <td className="px-3 py-3 text-right text-[var(--d2b-text-primary)]">{item.estoqueDisponivel.toFixed(2)}</td>
                {informando && (
                  <td className="px-3 py-3 text-right">
                    <input
                      type="number"
                      min={0}
                      value={qtdes[item.id] ?? ''}
                      onChange={e => setQtdes(q => ({ ...q, [item.id]: e.target.value }))}
                      className="w-28 bg-[var(--d2b-bg-main)] border border-[var(--d2b-border-strong)] rounded-md px-2 py-1.5 text-sm text-[var(--d2b-text-primary)] text-right focus:outline-none focus:border-[#7C4DFF] transition-colors"
                    />
                  </td>
                )}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}

// ─── ControleEstoqueLista ────────────────────────────────────────────────────
type ListaTab = 'todos' | 'simples' | 'kits' | 'fabricado' | 'materia-prima'

function ControleEstoqueLista({ onInventario }: { onInventario: () => void }) {
  const [tab, setTab]   = useState<ListaTab>('todos')
  const [busca, setBusca] = useState('')

  const TH = 'text-left px-3 py-3 text-xs font-semibold text-[var(--d2b-text-secondary)] uppercase tracking-wider whitespace-nowrap'

  const itens = MOCK_ESTOQUE.filter(i => {
    const q = busca.toLowerCase()
    return !q || i.produto.toLowerCase().includes(q) || i.sku.toLowerCase().includes(q)
  })

  return (
    <div className="flex flex-col h-full">

      {/* ── Cabeçalho ─── */}
      <div className="flex items-center justify-between gap-4 px-8 pt-8 pb-4 flex-wrap">
        <h2 className="text-xl font-semibold text-[var(--d2b-text-primary)]">Controle de estoques</h2>
        <div className="flex items-center gap-2">
          <button
            onClick={onInventario}
            className="flex items-center gap-2 px-4 py-2 rounded-md text-sm font-medium border border-[var(--d2b-border-strong)] text-[var(--d2b-text-secondary)] hover:border-[#7C4DFF] hover:text-[var(--d2b-text-primary)] bg-transparent transition-colors"
          >
            <LayoutGrid size={14} />
            inventário de estoque
          </button>
          <button className="flex items-center gap-2 px-4 py-2.5 rounded-full text-sm font-bold text-white bg-[#7C4DFF] hover:bg-[#5B21B6] transition-colors">
            gerenciar produtos
          </button>
          <button className="flex items-center gap-2 px-3 py-2 rounded-md text-sm border border-[var(--d2b-border-strong)] text-[var(--d2b-text-secondary)] hover:border-[#7C4DFF] transition-colors">
            mais ações
            <MoreHorizontal size={14} />
          </button>
        </div>
      </div>

      {/* ── Busca + filtros ─── */}
      <div className="flex items-center gap-2 px-8 pb-4 flex-wrap">
        <div className="flex items-center gap-0 border border-[var(--d2b-border-strong)] rounded-lg overflow-hidden h-9 bg-[var(--d2b-bg-main)] flex-1 max-w-sm">
          <input
            value={busca}
            onChange={e => setBusca(e.target.value)}
            placeholder="Pesquise por nome, código (SKU) ou GTIN/EAN"
            className="bg-transparent text-sm text-[var(--d2b-text-primary)] placeholder:text-[var(--d2b-text-muted)] outline-none px-3 flex-1"
          />
          <Search size={14} className="text-[var(--d2b-text-muted)] mx-2 shrink-0" />
          <div className="border-l border-[var(--d2b-border-strong)] h-full flex items-center px-2 cursor-pointer hover:bg-[var(--d2b-hover)]">
            <SlidersHorizontal size={13} className="text-[var(--d2b-text-muted)]" />
            <ChevronDown size={11} className="text-[var(--d2b-text-muted)] ml-0.5" />
          </div>
        </div>
        <button className="flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs border border-[var(--d2b-border-strong)] text-[var(--d2b-text-secondary)] hover:border-[#7C4DFF] transition-colors">
          <SlidersHorizontal size={12} />
          filtros
        </button>
        <button className="flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs border border-[var(--d2b-border-strong)] text-[var(--d2b-text-secondary)] hover:border-red-400 hover:text-red-400 transition-colors">
          <X size={12} />
          limpar filtros
        </button>
      </div>

      {/* ── Abas ─── */}
      <div className="flex items-end gap-0 border-b border-[var(--d2b-border)] px-8">
        {(
          [
            { id: 'todos',        label: 'todos'        },
            { id: 'simples',      label: 'simples'      },
            { id: 'kits',         label: 'kits'         },
            { id: 'fabricado',    label: 'fabricado'    },
            { id: 'materia-prima',label: 'matéria-prima'},
          ] as { id: ListaTab; label: string }[]
        ).map(t => (
          <button
            key={t.id}
            onClick={() => setTab(t.id)}
            className={[
              'px-4 py-2.5 text-sm font-medium transition-colors border-b-2 -mb-px',
              tab === t.id
                ? 'border-[#7C4DFF] text-[var(--d2b-text-primary)]'
                : 'border-transparent text-[var(--d2b-text-secondary)] hover:text-[var(--d2b-text-primary)]',
            ].join(' ')}
          >
            {t.label}
          </button>
        ))}
        <div className="ml-auto pb-1">
          <button className="p-1.5 rounded text-[var(--d2b-text-muted)] hover:text-[var(--d2b-text-primary)] transition-colors">
            <ArrowUpDown size={14} />
          </button>
        </div>
      </div>

      {/* ── Tabela ─── */}
      <div className="flex-1 overflow-x-auto px-8 pt-4 pb-8">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-[var(--d2b-border)]">
              <th className="w-8 px-3 py-3" />
              <th className={TH}>
                Produto <ArrowUpDown size={10} className="inline mb-0.5 text-[var(--d2b-text-muted)]" />
              </th>
              <th className={TH}>
                Código (SKU) <ArrowUpDown size={10} className="inline mb-0.5 text-[var(--d2b-text-muted)]" />
              </th>
              <th className={TH + ' text-right'}>
                Preço <ArrowUpDown size={10} className="inline mb-0.5 text-[var(--d2b-text-muted)]" />
              </th>
              <th className={TH + ' text-right'}>
                Custo médio <ArrowUpDown size={10} className="inline mb-0.5 text-[var(--d2b-text-muted)]" />
              </th>
              <th className={TH + ' text-right'}>
                Estoque físico <ArrowUpDown size={10} className="inline mb-0.5 text-[var(--d2b-text-muted)]" />
              </th>
              <th className={TH + ' text-right'}>
                Estoque reservado <ArrowUpDown size={10} className="inline mb-0.5 text-[var(--d2b-text-muted)]" />
              </th>
              <th className={TH + ' text-right'}>
                Estoque disponível <ArrowUpDown size={10} className="inline mb-0.5 text-[var(--d2b-text-muted)]" />
              </th>
              <th className={TH}>
                Unidade <ArrowUpDown size={10} className="inline mb-0.5 text-[var(--d2b-text-muted)]" />
              </th>
              <th className={TH}>
                Localização <ArrowUpDown size={10} className="inline mb-0.5 text-[var(--d2b-text-muted)]" />
              </th>
            </tr>
          </thead>
          <tbody>
            {itens.map(item => (
              <tr key={item.id} className="border-b border-[var(--d2b-border)] hover:bg-[var(--d2b-hover)] transition-colors group">
                <td className="px-3 py-3">
                  <span className="text-xs text-[var(--d2b-text-muted)] opacity-0 group-hover:opacity-100 cursor-pointer select-none">···</span>
                </td>
                <td className="px-3 py-3 font-medium text-[var(--d2b-text-primary)]">{item.produto}</td>
                <td className="px-3 py-3 text-[var(--d2b-text-secondary)]">{item.sku}</td>
                <td className="px-3 py-3 text-right text-[var(--d2b-text-secondary)]">{item.preco.toFixed(2)}</td>
                <td className="px-3 py-3 text-right text-[var(--d2b-text-secondary)]">{item.custoMedio.toFixed(2)}</td>
                <td className="px-3 py-3 text-right">
                  <span className="text-[#7C4DFF] font-medium cursor-pointer hover:underline">
                    {item.estoqueFisico.toFixed(2)}
                  </span>
                </td>
                <td className="px-3 py-3 text-right text-[var(--d2b-text-secondary)]">{item.estoqueReservado.toFixed(2)}</td>
                <td className="px-3 py-3 text-right text-[var(--d2b-text-primary)]">{item.estoqueDisponivel.toFixed(2)}</td>
                <td className="px-3 py-3 text-[var(--d2b-text-secondary)]">{item.unidade}</td>
                <td className="px-3 py-3 text-[var(--d2b-text-secondary)]">{item.localizacao}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}

// ─── Placeholder para abas ainda não implementadas ────────────────────────────
function EmBreve({ label }: { label: string }) {
  return (
    <div className="flex flex-col items-center justify-center h-full gap-3 py-24 text-center">
      <div className="w-12 h-12 rounded-xl bg-[var(--d2b-bg-elevated)] border border-[var(--d2b-border)] flex items-center justify-center">
        <Warehouse size={22} className="text-[var(--d2b-text-muted)]" />
      </div>
      <p className="text-sm font-medium text-[var(--d2b-text-secondary)]">{label}</p>
      <p className="text-xs text-[var(--d2b-text-muted)]">Em breve disponível</p>
    </div>
  )
}

// ─── ControleEstoqueContent ────────────────────────────────────────────────────
function ControleEstoqueContent() {
  const [tela, setTela] = useState<ControleTela>('lista')

  if (tela === 'planilha') return <ImportarPlanilha onBack={() => setTela('inventario')} />
  if (tela === 'coletor')  return <ImportarColetor  onBack={() => setTela('inventario')} />
  if (tela === 'inventario') {
    return (
      <InventarioLanding
        onBack={() => setTela('lista')}
        onNavigate={t => {
          if (t === 'planilha') setTela('planilha')
          else if (t === 'coletor') setTela('coletor')
        }}
      />
    )
  }
  return <ControleEstoqueLista onInventario={() => setTela('inventario')} />
}

// ─── Definição das abas do sidebar ──────────────────────────────────────────
type TabDef = { id: string; label: string; Icon: LucideIcon }

const TABS: TabDef[] = [
  { id: 'estoques',       label: 'Controle de\nEstoques',       Icon: Warehouse     },
  { id: 'fulfillment',    label: 'Envios\nFulfillment',         Icon: Truck         },
  { id: 'ordens',         label: 'Ordens de\nCompra',           Icon: ShoppingCart  },
  { id: 'servicos',       label: 'Serviços\nTomados',           Icon: Wrench        },
  { id: 'notas',          label: 'Notas de\nEntrada',           Icon: FileText      },
  { id: 'conferencia',    label: 'Conferência\nde compra',      Icon: ClipboardList },
  { id: 'producao',       label: 'Ordens de\nProdução',         Icon: Factory       },
  { id: 'necessidades',   label: 'Necessidades\nde Compra',     Icon: List          },
  { id: 'giro',           label: 'Giro de\nEstoque',            Icon: RotateCcw     },
  { id: 'fci',            label: 'FCI',                         Icon: FileCode      },
  { id: 'relatorios',     label: 'Relatórios',                  Icon: BarChart2     },
]

// ─── SuprimentosView ──────────────────────────────────────────────────────────
export function SuprimentosView() {
  const [active, setActive] = useState('estoques')

  const content = (() => {
    switch (active) {
      case 'estoques':   return <ControleEstoqueContent />
      case 'ordens':     return <OrdensCompraContent />
      case 'servicos':    return <ServicosTomadosContent />
      case 'notas':       return <NotasEntradaContent />
      case 'conferencia':  return <ConferenciaComprasContent />
      case 'producao':     return <OrdensProducaoContent />
      case 'necessidades': return <NecessidadesCompraContent />
      case 'fci':          return <FCIContent />
      case 'giro':         return <GiroEstoqueContent />
      case 'relatorios':   return <RelatoriosSuprimentosContent />
      default:             return <EmBreve label={TABS.find(t => t.id === active)?.label.replace('\n', ' ') ?? ''} />
    }
  })()

  return (
    <div className="flex h-full min-h-0">

      {/* ── Painel lateral de ícones ── */}
      <aside className="flex flex-col w-[72px] shrink-0 border-r border-[var(--d2b-border)] bg-[var(--d2b-bg-surface)] py-3 gap-0.5 overflow-y-auto">
        {TABS.map(({ id, label, Icon }) => {
          const isActive = active === id
          const clr = isActive ? '#7C4DFF' : '#6B4E8A'
          return (
            <button
              key={id}
              onClick={() => setActive(id)}
              title={label.replace('\n', ' ')}
              className={[
                'flex flex-col items-center gap-1 py-3 mx-2 rounded-xl transition-all',
                isActive ? 'bg-[var(--d2b-hover)]' : 'hover:bg-[var(--d2b-hover)]',
              ].join(' ')}
            >
              <Icon size={20} color={clr} />
              <span
                className="text-[9px] font-medium text-center leading-tight px-1 whitespace-pre-line"
                style={{ color: clr }}
              >
                {label}
              </span>
            </button>
          )
        })}
      </aside>

      {/* ── Conteúdo principal ── */}
      <div className="flex-1 overflow-hidden">
        {content}
      </div>
    </div>
  )
}
