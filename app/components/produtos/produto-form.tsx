'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import {
  ArrowLeft, Package, Save, Plus, Trash2, ChevronDown, ImagePlus,
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

const LBL = 'block text-xs font-medium text-[var(--d2b-text-secondary)] mb-1.5'

const BTN_PRIMARY =
  'flex items-center gap-2 px-5 py-2.5 rounded-md text-sm font-bold text-white bg-[#7C4DFF] hover:bg-[#5B21B6] transition-colors'

const BTN_GHOST =
  'flex items-center gap-2 px-5 py-2.5 rounded-md text-sm font-medium text-[var(--d2b-text-secondary)] border border-[var(--d2b-border-strong)] hover:border-[#7C4DFF] hover:text-[var(--d2b-text-primary)] transition-colors'

const SECTION_TITLE =
  'text-sm font-semibold text-[var(--d2b-text-primary)] mb-4 pb-2 border-b border-[var(--d2b-border)]'

type Aba = 'geral' | 'complementar' | 'ficha' | 'precos' | 'custos' | 'outros'

const ABAS: { key: Aba; label: string }[] = [
  { key: 'geral',        label: 'dados gerais' },
  { key: 'complementar', label: 'dados complementares' },
  { key: 'ficha',        label: 'ficha técnica' },
  { key: 'precos',       label: 'preços' },
  { key: 'custos',       label: 'custos' },
  { key: 'outros',       label: 'outros' },
]

type Atributo = { id: number; nome: string; valor: string }

// ─── Aba: Dados Gerais ───────────────────────────────────────────────────────
function AbaGeral() {
  return (
    <div className="space-y-6">
      {/* Tipo */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label className={LBL}>Tipo do Produto</label>
          <div className="relative">
            <select className={SEL}>
              <option>Simples</option>
              <option>Kit</option>
              <option>Fabricado</option>
              <option>Matéria-prima</option>
            </select>
            <ChevronDown size={14} className="absolute right-3 top-1/2 -translate-y-1/2 text-[var(--d2b-text-muted)] pointer-events-none" />
          </div>
        </div>
        <div>
          <label className={LBL}>Tipo do Item SPED</label>
          <div className="relative">
            <select className={SEL}>
              <option value="">Selecione</option>
              <option>00 - Mercadoria para Revenda</option>
              <option>01 - Matéria-Prima</option>
              <option>02 - Embalagem</option>
              <option>04 - Produto em Fabricação</option>
              <option>05 - Produto Acabado</option>
            </select>
            <ChevronDown size={14} className="absolute right-3 top-1/2 -translate-y-1/2 text-[var(--d2b-text-muted)] pointer-events-none" />
          </div>
          <p className="text-[10px] text-[var(--d2b-text-muted)] mt-1">Utilizado na geração do SPED</p>
        </div>
      </div>

      {/* Nome + GTIN */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label className={LBL}>Nome do produto <span className="text-red-400">*</span></label>
          <input className={INP} placeholder="Descrição completa do produto" />
          <p className="text-[10px] text-[var(--d2b-text-muted)] mt-1">Necessário para emissão de Nota Fiscal</p>
        </div>
        <div>
          <label className={LBL}>Código de barras (GTIN)</label>
          <input className={INP} placeholder="Código de barras" />
          <p className="text-[10px] text-[var(--d2b-text-muted)] mt-1">Global Trade Item Number</p>
        </div>
      </div>

      {/* Origem + Unidade + NCM */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="md:col-span-1">
          <label className={LBL}>Origem do produto conforme ICMS</label>
          <div className="relative">
            <select className={SEL}>
              <option>0 - Nacional, exceto as indicadas nos códigos 3 a 5</option>
              <option>1 - Estrangeira: importação direta</option>
              <option>2 - Estrangeira: adquirida no mercado interno</option>
              <option>3 - Nacional: mercadoria ou bem com Conteúdo de Importação superior a 40%</option>
            </select>
            <ChevronDown size={14} className="absolute right-3 top-1/2 -translate-y-1/2 text-[var(--d2b-text-muted)] pointer-events-none" />
          </div>
          <p className="text-[10px] text-[var(--d2b-text-muted)] mt-1">Necessário para emissão de Nota Fiscal</p>
        </div>
        <div>
          <label className={LBL}>Unidade de medida</label>
          <input className={INP} placeholder="Ex: Pç, Kg…" />
          <p className="text-[10px] text-[var(--d2b-text-muted)] mt-1">Necessário para emissão de Nota Fiscal</p>
        </div>
        <div>
          <label className={LBL}>NCM - Nomenclatura comum do Mercosul</label>
          <input className={INP} placeholder="Exemplo: 1001.10.10" />
          <p className="text-[10px] text-[var(--d2b-text-muted)] mt-1">Necessário para emissão de Nota Fiscal</p>
        </div>
      </div>

      {/* SKU + CEST */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label className={LBL}>Código (SKU)</label>
          <input className={INP} placeholder="Código (SKU) ou referência" />
          <p className="text-[10px] text-[var(--d2b-text-muted)] mt-1">Opcional</p>
        </div>
        <div>
          <label className={LBL}>Código CEST</label>
          <input className={INP} placeholder="(Exemplo: 01.003.00)" />
          <p className="text-[10px] text-[var(--d2b-text-muted)] mt-1">Código Especificador da Substituição Tributária</p>
        </div>
      </div>

      {/* Preços */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label className={LBL}>Preço de venda</label>
          <div className="relative">
            <span className="absolute left-3 top-1/2 -translate-y-1/2 text-xs text-[var(--d2b-text-muted)]">R$</span>
            <input className={INP + ' pl-9'} placeholder="0,00" type="number" step="0.01" min="0" />
          </div>
        </div>
        <div>
          <label className={LBL}>Preço promocional</label>
          <div className="relative">
            <span className="absolute left-3 top-1/2 -translate-y-1/2 text-xs text-[var(--d2b-text-muted)]">R$</span>
            <input className={INP + ' pl-9'} placeholder="0,00" type="number" step="0.01" min="0" />
          </div>
        </div>
      </div>

      {/* Dimensões e peso */}
      <div>
        <h3 className={SECTION_TITLE}>Dimensões e peso</h3>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div>
            <label className={LBL}>Peso Líquido</label>
            <div className="relative">
              <input className={INP + ' pr-10'} placeholder="Em Kg" type="number" step="0.001" min="0" />
              <span className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-[var(--d2b-text-muted)]">kg</span>
            </div>
          </div>
          <div>
            <label className={LBL}>Peso Bruto</label>
            <div className="relative">
              <input className={INP + ' pr-10'} placeholder="Em Kg" type="number" step="0.001" min="0" />
              <span className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-[var(--d2b-text-muted)]">kg</span>
            </div>
          </div>
          <div>
            <label className={LBL}>Tipo da embalagem</label>
            <div className="relative">
              <select className={SEL}>
                <option>Pacote / Caixa</option>
                <option>Envelope</option>
                <option>Rolo / Cilindro</option>
              </select>
              <ChevronDown size={14} className="absolute right-3 top-1/2 -translate-y-1/2 text-[var(--d2b-text-muted)] pointer-events-none" />
            </div>
          </div>
          <div>
            <label className={LBL}>Embalagem</label>
            <div className="relative">
              <select className={SEL}>
                <option>Embalagem customizada</option>
              </select>
              <ChevronDown size={14} className="absolute right-3 top-1/2 -translate-y-1/2 text-[var(--d2b-text-muted)] pointer-events-none" />
            </div>
          </div>
        </div>

        <div className="grid grid-cols-3 gap-4 mt-4 max-w-sm">
          <div>
            <label className={LBL}>Largura</label>
            <div className="relative">
              <input className={INP + ' pr-9'} placeholder="0,0" type="number" step="0.1" min="0" />
              <span className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-[var(--d2b-text-muted)]">cm</span>
            </div>
          </div>
          <div>
            <label className={LBL}>Altura</label>
            <div className="relative">
              <input className={INP + ' pr-9'} placeholder="0,0" type="number" step="0.1" min="0" />
              <span className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-[var(--d2b-text-muted)]">cm</span>
            </div>
          </div>
          <div>
            <label className={LBL}>Comprimento</label>
            <div className="relative">
              <input className={INP + ' pr-9'} placeholder="0,0" type="number" step="0.1" min="0" />
              <span className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-[var(--d2b-text-muted)]">cm</span>
            </div>
          </div>
        </div>
      </div>

      {/* Estoque */}
      <div>
        <h3 className={SECTION_TITLE}>Estoque</h3>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div>
            <label className={LBL}>Controlar estoque</label>
            <div className="relative">
              <select className={SEL}>
                <option>Sim</option>
                <option>Não</option>
              </select>
              <ChevronDown size={14} className="absolute right-3 top-1/2 -translate-y-1/2 text-[var(--d2b-text-muted)] pointer-events-none" />
            </div>
            <p className="text-[10px] text-[var(--d2b-text-muted)] mt-1">Acompanhamento da movimentação de estoque</p>
          </div>
          <div>
            <label className={LBL}>Estoque inicial (Geral)</label>
            <div className="relative">
              <input className={INP + ' pr-8'} placeholder="0" type="number" min="0" />
              <span className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-[var(--d2b-text-muted)]">un</span>
            </div>
            <p className="text-[10px] text-[var(--d2b-text-muted)] mt-1">Informar se deseja lançar o estoque inicial do produto</p>
          </div>
          <div>
            <label className={LBL}>Estoque mínimo</label>
            <div className="relative">
              <input className={INP + ' pr-8'} placeholder="0" type="number" min="0" />
              <span className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-[var(--d2b-text-muted)]">un</span>
            </div>
            <p className="text-[10px] text-[var(--d2b-text-muted)] mt-1">Quantidade mínima do produto no estoque</p>
          </div>
          <div>
            <label className={LBL}>Estoque máximo</label>
            <div className="relative">
              <input className={INP + ' pr-8'} placeholder="0" type="number" min="0" />
              <span className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-[var(--d2b-text-muted)]">un</span>
            </div>
            <p className="text-[10px] text-[var(--d2b-text-muted)] mt-1">Quantidade máxima do produto no estoque</p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
          <div>
            <label className={LBL}>Localização</label>
            <input className={INP} placeholder="Ex: corredor A" />
            <p className="text-[10px] text-[var(--d2b-text-muted)] mt-1">Localização física no estoque</p>
          </div>
          <div>
            <label className={LBL}>Dias para preparação</label>
            <input className={INP} placeholder="0" type="number" min="0" />
          </div>
        </div>
      </div>
    </div>
  )
}

// ─── Aba: Dados Complementares ───────────────────────────────────────────────
function AbaComplementar() {
  return (
    <div className="space-y-6">
      {/* Categorização */}
      <div>
        <h3 className={SECTION_TITLE}>Categorização</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <label className={LBL}>Categoria</label>
            <div className="flex items-center gap-2 bg-[var(--d2b-bg-main)] border border-[var(--d2b-border-strong)] rounded-md px-3 h-10">
              <input
                className="bg-transparent text-sm text-[var(--d2b-text-primary)] placeholder:text-[var(--d2b-text-muted)] outline-none w-full"
                placeholder="Pesquise por categoria"
              />
            </div>
          </div>
          <div>
            <label className={LBL}>Marca</label>
            <input className={INP} placeholder="Pesquise pelo nome da marca" />
          </div>
          <div>
            <label className={LBL}>Tabela de medidas</label>
            <input className={INP} placeholder="Pesquise pelo nome da tabela" />
          </div>
        </div>
      </div>

      {/* Descrição */}
      <div>
        <h3 className={SECTION_TITLE}>Descrição complementar</h3>
        <div className="border border-[var(--d2b-border-strong)] rounded-md overflow-hidden">
          {/* Barra de ferramentas simulada */}
          <div className="flex items-center gap-2 px-3 py-2 border-b border-[var(--d2b-border)] bg-[var(--d2b-bg-elevated)] flex-wrap">
            {['B', 'I', 'U'].map(f => (
              <button key={f} className="w-6 h-6 flex items-center justify-center rounded text-xs font-bold text-[var(--d2b-text-secondary)] hover:text-[var(--d2b-text-primary)] hover:bg-[#7C4DFF]/10 transition-colors">
                {f}
              </button>
            ))}
            <div className="w-px h-4 bg-[var(--d2b-border)] mx-1" />
            {['≡', '⁝≡', '•≡'].map((f, i) => (
              <button key={i} className="w-6 h-6 flex items-center justify-center rounded text-xs text-[var(--d2b-text-secondary)] hover:text-[var(--d2b-text-primary)] hover:bg-[#7C4DFF]/10 transition-colors">
                {f}
              </button>
            ))}
          </div>
          <textarea
            rows={5}
            className="w-full bg-[var(--d2b-bg-main)] px-4 py-3 text-sm text-[var(--d2b-text-primary)] placeholder:text-[var(--d2b-text-muted)] outline-none resize-none"
            placeholder="Descrição detalhada do produto..."
          />
        </div>
        <p className="text-[10px] text-[var(--d2b-text-muted)] mt-1">
          Campo exibido em propostas comerciais, pedidos de venda e descrição do produto no e-commerce.
        </p>
      </div>

      {/* Imagens */}
      <div>
        <h3 className={SECTION_TITLE}>Imagens e anexos</h3>
        <p className="text-xs text-[var(--d2b-text-muted)] mb-3">
          Facilite o gerenciamento de imagens de seus produtos. Defina, reordene e compartilhe imagens entre o produto principal e suas variações para economizar espaço de armazenamento.
        </p>
        <button className="flex items-center gap-2 px-4 py-2.5 rounded-md text-sm font-medium text-[var(--d2b-text-secondary)] border border-dashed border-[var(--d2b-border-strong)] hover:border-[#7C4DFF] hover:text-[#7C4DFF] transition-colors">
          <ImagePlus size={15} />
          adicionar imagens ao produto
        </button>
      </div>

      {/* Campos adicionais / SEO */}
      <div>
        <h3 className={SECTION_TITLE}>Campos adicionais</h3>
        <div className="space-y-4">
          <div>
            <label className={LBL}>Link do vídeo</label>
            <input className={INP} placeholder="https://youtube.com/..." />
          </div>
          <div>
            <label className={LBL}>Slug</label>
            <input className={INP} placeholder="meu-produto-exemplo" />
            <p className="text-[10px] text-[var(--d2b-text-muted)] mt-1">Utilizado para identificação legível no link do produto no e-commerce</p>
          </div>
          <div>
            <label className={LBL}>Keywords</label>
            <input className={INP} placeholder="palavra1, palavra2, palavra3" />
            <p className="text-[10px] text-[var(--d2b-text-muted)] mt-1">Utilizado para SEO ou metadados. Informe os valores separados por vírgula</p>
          </div>
          <div>
            <label className={LBL}>Título para SEO</label>
            <input className={INP} placeholder="Título exibido nos resultados do Google" />
          </div>
          <div>
            <label className={LBL}>Descrição para SEO</label>
            <textarea
              rows={3}
              className={INP + ' resize-none'}
              placeholder="Descrição exibida abaixo do título nos resultados da busca no Google"
            />
          </div>
        </div>
      </div>

      {/* Tags */}
      <div>
        <h3 className={SECTION_TITLE}>Tags</h3>
        <p className="text-xs text-[var(--d2b-text-muted)] mb-3">
          As Tags servem para classificar os produtos (Exemplo: Grupo, Cor, etc.)
        </p>
        <input className={INP} placeholder="Adicione tags separadas por vírgula..." />
      </div>
    </div>
  )
}

// ─── Aba: Ficha Técnica ───────────────────────────────────────────────────────
function AbaFicha() {
  const [atributos, setAtributos] = useState<Atributo[]>([
    { id: 1, nome: '', valor: '' },
  ])

  function addAtributo() {
    setAtributos(a => [...a, { id: Date.now(), nome: '', valor: '' }])
  }

  function removeAtributo(id: number) {
    setAtributos(a => a.filter(x => x.id !== id))
  }

  return (
    <div className="space-y-5">
      <h3 className={SECTION_TITLE}>Atributos</h3>
      <div className="space-y-3">
        <div className="grid grid-cols-2 gap-4">
          <span className="text-xs font-medium text-[var(--d2b-text-secondary)]">Atributo</span>
          <span className="text-xs font-medium text-[var(--d2b-text-secondary)]">Valor</span>
        </div>
        {atributos.map((a, i) => (
          <div key={a.id} className="grid grid-cols-2 gap-4 items-center">
            <input
              className={INP}
              placeholder="Pesquise pelo nome do atributo"
              value={a.nome}
              onChange={e => setAtributos(prev => prev.map(x => x.id === a.id ? { ...x, nome: e.target.value } : x))}
            />
            <div className="flex items-center gap-2">
              <input
                className={INP}
                placeholder="Valor"
                value={a.valor}
                onChange={e => setAtributos(prev => prev.map(x => x.id === a.id ? { ...x, valor: e.target.value } : x))}
              />
              <button
                onClick={() => removeAtributo(a.id)}
                className="w-8 h-8 shrink-0 flex items-center justify-center rounded text-[var(--d2b-text-muted)] hover:text-red-400 hover:bg-red-500/10 transition-colors"
              >
                <Trash2 size={14} />
              </button>
            </div>
          </div>
        ))}
        <button
          onClick={addAtributo}
          className="flex items-center gap-1.5 text-sm text-[#7C4DFF] hover:text-[#A98EFF] transition-colors mt-1"
        >
          <Plus size={15} />
          adicionar atributo
        </button>
      </div>
    </div>
  )
}

// ─── Aba: Preços ─────────────────────────────────────────────────────────────
function AbaPrecos() {
  return (
    <div className="space-y-5">
      <h3 className={SECTION_TITLE}>Listas de preço</h3>
      <div className="grid grid-cols-3 gap-4 items-end">
        <div>
          <label className={LBL}>Lista de preço</label>
          <div className="relative">
            <select className={SEL}>
              <option value="">Selecione</option>
              <option>Padrão</option>
              <option>Atacado</option>
              <option>Varejo</option>
            </select>
            <ChevronDown size={14} className="absolute right-3 top-1/2 -translate-y-1/2 text-[var(--d2b-text-muted)] pointer-events-none" />
          </div>
        </div>
        <div>
          <label className={LBL}>Preço</label>
          <div className="relative">
            <span className="absolute left-3 top-1/2 -translate-y-1/2 text-xs text-[var(--d2b-text-muted)]">R$</span>
            <input className={INP + ' pl-9'} placeholder="0,00" type="number" step="0.01" min="0" />
          </div>
        </div>
        <div>
          <label className={LBL}>Preço promocional</label>
          <div className="relative">
            <span className="absolute left-3 top-1/2 -translate-y-1/2 text-xs text-[var(--d2b-text-muted)]">R$</span>
            <input className={INP + ' pl-9'} placeholder="0,00" type="number" step="0.01" min="0" />
          </div>
        </div>
      </div>
      <button className="flex items-center gap-1.5 text-sm text-[#7C4DFF] hover:text-[#A98EFF] transition-colors">
        <Plus size={15} />
        informar novo preço
      </button>
    </div>
  )
}

// ─── Aba: Custos ─────────────────────────────────────────────────────────────
function AbaCustos() {
  return (
    <div className="space-y-5">
      <h3 className={SECTION_TITLE}>Preço de custo</h3>
      <div className="grid grid-cols-2 md:grid-cols-6 gap-4">
        {['A partir de', 'Saldo atual', 'Saldo anterior', 'Impostos recuperáveis', 'Preço custo', 'Custo médio'].map((h) => (
          <div key={h}>
            <label className={LBL}>{h}</label>
            <input className={INP} placeholder="0,00" type={h === 'A partir de' ? 'date' : 'number'} step="0.01" min="0" />
          </div>
        ))}
      </div>
      <button className="flex items-center gap-1.5 text-sm text-[#7C4DFF] hover:text-[#A98EFF] transition-colors">
        <Plus size={15} />
        informar novo preço de custo
      </button>
    </div>
  )
}

// ─── Aba: Outros ─────────────────────────────────────────────────────────────
function AbaOutros() {
  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div>
          <label className={LBL}>Unidade por caixa</label>
          <div className="relative">
            <input className={INP + ' pr-10'} placeholder="0" type="number" min="0" />
            <span className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-[var(--d2b-text-muted)]">un</span>
          </div>
        </div>
        <div>
          <label className={LBL}>Linha de produto</label>
          <div className="relative">
            <select className={SEL}>
              <option value="">Selecione</option>
              <option>Linha A</option>
              <option>Linha B</option>
            </select>
            <ChevronDown size={14} className="absolute right-3 top-1/2 -translate-y-1/2 text-[var(--d2b-text-muted)] pointer-events-none" />
          </div>
        </div>
        <div>
          <label className={LBL}>Garantia</label>
          <input className={INP} placeholder="Exemplo: 3 meses" />
        </div>
        <div>
          <label className={LBL}>Markup</label>
          <input className={INP} placeholder="0,00000" type="number" step="0.00001" min="0" />
        </div>
      </div>

      <div>
        <label className={LBL}>Permitir inclusão nas vendas</label>
        <div className="relative max-w-xs">
          <select className={SEL}>
            <option>Sim</option>
            <option>Não</option>
          </select>
          <ChevronDown size={14} className="absolute right-3 top-1/2 -translate-y-1/2 text-[var(--d2b-text-muted)] pointer-events-none" />
        </div>
      </div>

      {/* Informações tributárias */}
      <div>
        <h3 className={SECTION_TITLE}>Informações tributárias adicionais</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <label className={LBL}>GTIN/EAN tributável</label>
            <input className={INP} placeholder="Código de barras de comer." />
            <p className="text-[10px] text-[var(--d2b-text-muted)] mt-1">Utilizado apenas para Caixa, Fardo, Lote, etc.</p>
          </div>
          <div>
            <label className={LBL}>Unidade tributável</label>
            <input className={INP} placeholder="Un" />
          </div>
          <div>
            <label className={LBL}>Fator de conversão</label>
            <input className={INP} placeholder="1" type="number" min="0" step="0.01" />
          </div>
          <div>
            <label className={LBL}>Código de Enquadramento IPI</label>
            <input className={INP} placeholder="" />
          </div>
          <div>
            <label className={LBL}>Valor do IPI fixo</label>
            <div className="relative">
              <span className="absolute left-3 top-1/2 -translate-y-1/2 text-xs text-[var(--d2b-text-muted)]">R$</span>
              <input className={INP + ' pl-9'} placeholder="0,00" type="number" min="0" step="0.01" />
            </div>
            <p className="text-[10px] text-[var(--d2b-text-muted)] mt-1">Somente para produtos com tributação específica</p>
          </div>
          <div>
            <label className={LBL}>EX TIPI</label>
            <input className={INP} placeholder="" />
          </div>
        </div>
      </div>

      {/* Observações */}
      <div>
        <h3 className={SECTION_TITLE}>Observações gerais sobre o produto</h3>
        <textarea
          rows={5}
          className={INP + ' resize-none'}
          placeholder="Informações de uso interno. Não é exibido para o cliente."
        />
      </div>
    </div>
  )
}

// ─── Form Principal ──────────────────────────────────────────────────────────
export function ProdutoForm({ id }: { id?: string }) {
  const router = useRouter()
  const [aba, setAba] = useState<Aba>('geral')
  const isNovo = !id

  const abaContent: Record<Aba, React.ReactNode> = {
    geral:        <AbaGeral />,
    complementar: <AbaComplementar />,
    ficha:        <AbaFicha />,
    precos:       <AbaPrecos />,
    custos:       <AbaCustos />,
    outros:       <AbaOutros />,
  }

  return (
    <div className="p-6 space-y-6">

      {/* ── Cabeçalho ─────────────────────────────────────────────────────── */}
      <div className="flex items-center gap-3">
        <button
          onClick={() => router.push('/dashboard/cadastros/produtos')}
          className="w-8 h-8 flex items-center justify-center rounded-lg border border-[var(--d2b-border-strong)] text-[var(--d2b-text-secondary)] hover:text-[var(--d2b-text-primary)] hover:border-[#7C4DFF] transition-colors"
        >
          <ArrowLeft size={15} />
        </button>
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-lg bg-[var(--d2b-bg-elevated)] border border-[var(--d2b-border-strong)] flex items-center justify-center">
            <Package size={15} className="text-[#7C4DFF]" />
          </div>
          <div>
            <h2 className="text-lg font-bold text-[var(--d2b-text-primary)] leading-none">
              {isNovo ? 'Novo produto' : 'Editar produto'}
            </h2>
            <nav className="flex items-center gap-1 text-xs text-[var(--d2b-text-muted)] mt-0.5">
              <span>cadastros</span>
              <span>/</span>
              <button
                onClick={() => router.push('/dashboard/cadastros/produtos')}
                className="hover:text-[#7C4DFF] transition-colors"
              >
                produtos
              </button>
              <span>/</span>
              <span className="text-[var(--d2b-text-secondary)]">{isNovo ? 'novo' : id}</span>
            </nav>
          </div>
        </div>
      </div>

      {/* ── Card com abas ─────────────────────────────────────────────────── */}
      <div className="bg-[var(--d2b-bg-surface)] border border-[var(--d2b-border)] rounded-xl overflow-hidden">

        {/* Abas */}
        <div className="flex items-center gap-0 border-b border-[var(--d2b-border)] px-6 overflow-x-auto">
          {ABAS.map(t => (
            <button
              key={t.key}
              onClick={() => setAba(t.key)}
              className={[
                'px-4 py-3.5 text-sm font-medium transition-colors border-b-2 -mb-px whitespace-nowrap',
                aba === t.key
                  ? 'border-[#7C4DFF] text-[var(--d2b-text-primary)]'
                  : 'border-transparent text-[var(--d2b-text-secondary)] hover:text-[var(--d2b-text-primary)]',
              ].join(' ')}
            >
              {t.label}
            </button>
          ))}
        </div>

        {/* Conteúdo da aba */}
        <div className="p-6">
          {abaContent[aba]}
        </div>

        {/* Rodapé com ações */}
        <div className="flex items-center gap-3 px-6 py-4 border-t border-[var(--d2b-border)] bg-[var(--d2b-bg-elevated)]/50">
          <button className={BTN_PRIMARY}>
            <Save size={15} />
            salvar
          </button>
          <button
            onClick={() => router.push('/dashboard/cadastros/produtos')}
            className={BTN_GHOST}
          >
            cancelar
          </button>
        </div>
      </div>
    </div>
  )
}
