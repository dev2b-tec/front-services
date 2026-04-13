'use client'

import { useState } from 'react'
import {
  Search, ArrowLeft, MoreHorizontal, Plus, Pencil, Tag,
  ChevronDown, X,
} from 'lucide-react'

// ─── Shared styles ────────────────────────────────────────────────────────────
const TH = 'text-left px-3 py-3 text-xs font-semibold text-[var(--d2b-text-secondary)] uppercase tracking-wider whitespace-nowrap'
const TD = 'px-3 py-3 text-sm text-[var(--d2b-text-primary)] whitespace-nowrap'
const BTN_PRIMARY = 'flex items-center gap-2 px-4 py-2 rounded-full text-sm font-bold text-white bg-[#7C4DFF] hover:bg-[#5B21B6] transition-colors'
const BTN_OUTLINE = 'flex items-center gap-2 px-3 py-1.5 rounded-md text-sm font-medium border border-[var(--d2b-border-strong)] text-[var(--d2b-text-secondary)] hover:border-[#7C4DFF] hover:text-[var(--d2b-text-primary)] bg-transparent transition-colors'
const BTN_GHOST = 'flex items-center gap-2 px-3 py-1.5 rounded-md text-sm text-[var(--d2b-text-secondary)] hover:bg-[var(--d2b-hover)] transition-colors'
const INP = 'w-full bg-[var(--d2b-bg-main)] border border-[var(--d2b-border-strong)] rounded-md px-3 py-2 text-sm text-[var(--d2b-text-primary)] placeholder:text-[var(--d2b-text-muted)] focus:outline-none focus:border-[#7C4DFF] transition-colors'
const INP_RO = 'w-full bg-[var(--d2b-bg-elevated)] border border-[var(--d2b-border)] rounded-md px-3 py-2 text-sm text-[var(--d2b-text-primary)]'
const LBL = 'block text-xs text-[var(--d2b-text-secondary)] mb-1'
const SEL = 'w-full bg-[var(--d2b-bg-main)] border border-[var(--d2b-border-strong)] rounded-md px-3 py-2 text-sm text-[var(--d2b-text-primary)] focus:outline-none focus:border-[#7C4DFF] transition-colors appearance-none'

// ─── Types ────────────────────────────────────────────────────────────────────
type Tela = 'lista' | 'detalhe' | 'form'

type NotaServico = {
  id: string
  serie: string
  numeroRPS: string
  numeroNFSe: string
  dataEmissao: string
  status: string
  // Cliente
  contato: string
  tipoPessoa: string
  cpf: string
  inscricaoEstadual: string
  inscricaoMunicipal: string
  cep: string
  municipio: string
  uf: string
  bairro: string
  endereco: string
  numero: string
  complemento: string
  email: string
  foneFax: string
  // Serviços
  descricaoServico: string
  valorServico: string
  codigoListaServicos: string
  nomenclaturaBS: string
  codigoNatureza: string
  cnae: string
  // Impostos
  ir: string
  valorIR: string
  iss: string
  valorISS: string
  inss: string
  valorINSS: string
  issRetido: string
  calculoLigado: boolean
  valorTotal: string
  valorLiquido: string
  // Vendedor
  vendedor: string
  comissao: string
  valorComissao: string
  // Pagamento
  formaRecebimento: string
  // Dados adicionais
  observacoes: string
  textoIR: string
  marcadores: string
}

const NOTA_INITIAL: NotaServico = {
  id: '',
  serie: '1',
  numeroRPS: '000004',
  numeroNFSe: '',
  dataEmissao: '',
  status: 'pendente',
  contato: '',
  tipoPessoa: 'Física',
  cpf: '',
  inscricaoEstadual: '',
  inscricaoMunicipal: '',
  cep: '',
  municipio: '',
  uf: 'Selecione',
  bairro: '',
  endereco: '',
  numero: '',
  complemento: '',
  email: '',
  foneFax: '',
  descricaoServico: '',
  valorServico: '',
  codigoListaServicos: '',
  nomenclaturaBS: '',
  codigoNatureza: 'Tributação no município',
  cnae: 'CNAE padrão da empresa',
  ir: '0,00',
  valorIR: '',
  iss: '3,00',
  valorISS: '',
  inss: '0,00',
  valorINSS: '',
  issRetido: 'Não',
  calculoLigado: true,
  valorTotal: '',
  valorLiquido: '0,00',
  vendedor: '',
  comissao: '',
  valorComissao: '',
  formaRecebimento: 'Selecione',
  observacoes: '',
  textoIR: '',
  marcadores: '',
}

const MOCK_NOTAS: NotaServico[] = [
  {
    ...NOTA_INITIAL,
    id: '1',
    numeroRPS: '000004',
    dataEmissao: '08/04/2026',
    status: 'pendente',
    contato: 'JESSE',
    tipoPessoa: 'Física',
    cpf: '058.031.464-20',
    cep: '54.410-010',
    municipio: 'Jaboatão dos Guararapes',
    uf: 'PE',
    bairro: 'Piedade',
    endereco: 'Avenida Bernardo Vieira de Melo',
    numero: '62',
    descricaoServico: 'teste',
    valorServico: 'R$ 150,00',
    codigoListaServicos: '1.01.01 - análise de sistemas',
    codigoNatureza: 'Tributação no município',
    cnae: 'CNAE padrão da empresa',
    iss: '3,00',
    valorISS: 'R$ 4,50',
    valorTotal: 'R$ 150,00',
    valorLiquido: 'R$ 150,00',
    comissao: '1,00 %',
    valorComissao: 'R$ 1,50',
    textoIR: 'IR Isento Cfe. Lei nro. 9430/96 Art.64',
  },
]

const ACOES_NOTA = [
  'clonar nota',
  'emitir cobrança',
  'lançar contas',
  'enviar NFS-e',
  'marcar como enviada',
  'imprimir RPS',
  'marcadores',
]

const UF_LIST = ['Selecione', 'AC', 'AL', 'AM', 'AP', 'BA', 'CE', 'DF', 'ES', 'GO', 'MA', 'MG', 'MS', 'MT', 'PA', 'PB', 'PE', 'PI', 'PR', 'RJ', 'RN', 'RO', 'RR', 'RS', 'SC', 'SE', 'SP', 'TO']

// ═══════════════════════════════════════════════════════════════════════════
// NotasServicoContent
// ═══════════════════════════════════════════════════════════════════════════
export function NotasServicoContent() {
  const [tela, setTela] = useState<Tela>('lista')
  const [selected, setSelected] = useState<NotaServico | null>(null)
  const [form, setForm] = useState<NotaServico>(NOTA_INITIAL)
  const [search, setSearch] = useState('')
  const [acoesDet, setAcoesDet] = useState(false)

  const setF = (k: keyof NotaServico, v: string | boolean) => setForm(p => ({ ...p, [k]: v }))

  const filtered = MOCK_NOTAS.filter(n =>
    search ? n.contato.toLowerCase().includes(search.toLowerCase()) || n.numeroRPS.includes(search) : true
  )

  // ── FORM ─────────────────────────────────────────────────────────────────
  if (tela === 'form') {
    return (
      <div className="flex flex-col h-full overflow-y-auto bg-[var(--d2b-bg-main)]">
        {/* Header */}
        <div className="sticky top-0 z-10 bg-[var(--d2b-bg-surface)] border-b border-[var(--d2b-border)] px-6 py-3 flex items-center gap-3">
          <button onClick={() => setTela(selected ? 'detalhe' : 'lista')} className={BTN_GHOST}>
            <ArrowLeft size={16} /> voltar
          </button>
          <span className="text-xs text-[var(--d2b-text-muted)]">
            início <span className="mx-1">≡</span> serviços <span className="mx-1">{'>'}</span>
            <span className="text-[var(--d2b-text-secondary)]">notas de serviço</span>
          </span>
        </div>

        <div className="flex-1 px-8 py-6 max-w-4xl mx-auto w-full">
          <h1 className="text-xl font-bold text-[var(--d2b-text-primary)] mb-6">Nota de Serviço</h1>

          {/* Identificação */}
          <div className="grid grid-cols-4 gap-4 mb-6">
            <div>
              <label className={LBL}>Série</label>
              <input className={INP} value={form.serie} onChange={e => setF('serie', e.target.value)} />
            </div>
            <div>
              <label className={LBL}>Número RPS</label>
              <input className={INP} value={form.numeroRPS} onChange={e => setF('numeroRPS', e.target.value)} />
            </div>
            <div>
              <label className={LBL}>Número NFS-e</label>
              <input className={INP_RO} value={form.numeroNFSe} readOnly placeholder="Gerado automaticamente" />
            </div>
            <div>
              <label className={LBL}>Data emissão</label>
              <input type="date" className={INP} value={form.dataEmissao} onChange={e => setF('dataEmissao', e.target.value)} />
            </div>
          </div>

          {/* Cliente */}
          <section className="mb-6">
            <h2 className="text-sm font-semibold text-[var(--d2b-text-secondary)] uppercase tracking-wider mb-4 pb-1 border-b border-[var(--d2b-border)]">
              Cliente
            </h2>
            <div className="space-y-4">
              <div>
                <label className={LBL}>Contato</label>
                <div className="relative">
                  <input className={INP + ' pr-9'} value={form.contato} onChange={e => setF('contato', e.target.value)} placeholder="Pesquise por cliente" />
                  <Search size={14} className="absolute right-3 top-1/2 -translate-y-1/2 text-[var(--d2b-text-muted)]" />
                </div>
              </div>
              <div className="grid grid-cols-4 gap-4">
                <div>
                  <label className={LBL}>Tipo de pessoa</label>
                  <div className="relative">
                    <select className={SEL} value={form.tipoPessoa} onChange={e => setF('tipoPessoa', e.target.value)}>
                      <option>Física</option>
                      <option>Jurídica</option>
                    </select>
                    <ChevronDown size={14} className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-[var(--d2b-text-muted)]" />
                  </div>
                </div>
                <div>
                  <label className={LBL}>CPF</label>
                  <input className={INP} value={form.cpf} onChange={e => setF('cpf', e.target.value)} />
                </div>
                <div>
                  <label className={LBL}>Inscrição estadual</label>
                  <input className={INP} value={form.inscricaoEstadual} onChange={e => setF('inscricaoEstadual', e.target.value)} />
                </div>
                <div>
                  <label className={LBL}>Inscrição municipal</label>
                  <input className={INP} value={form.inscricaoMunicipal} onChange={e => setF('inscricaoMunicipal', e.target.value)} />
                </div>
              </div>
              <div className="grid grid-cols-4 gap-4">
                <div>
                  <label className={LBL}>CEP</label>
                  <div className="relative">
                    <input className={INP + ' pr-9'} value={form.cep} onChange={e => setF('cep', e.target.value)} />
                    <Search size={14} className="absolute right-3 top-1/2 -translate-y-1/2 text-[var(--d2b-text-muted)]" />
                  </div>
                </div>
                <div className="col-span-2">
                  <label className={LBL}>Município</label>
                  <input className={INP} value={form.municipio} onChange={e => setF('municipio', e.target.value)} />
                </div>
                <div>
                  <label className={LBL}>UF</label>
                  <div className="relative">
                    <select className={SEL} value={form.uf} onChange={e => setF('uf', e.target.value)}>
                      {UF_LIST.map(uf => <option key={uf}>{uf}</option>)}
                    </select>
                    <ChevronDown size={14} className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-[var(--d2b-text-muted)]" />
                  </div>
                </div>
              </div>
              <div className="grid grid-cols-4 gap-4">
                <div>
                  <label className={LBL}>Bairro</label>
                  <input className={INP} value={form.bairro} onChange={e => setF('bairro', e.target.value)} />
                </div>
                <div className="col-span-2">
                  <label className={LBL}>Endereço</label>
                  <input className={INP} value={form.endereco} onChange={e => setF('endereco', e.target.value)} />
                </div>
                <div>
                  <label className={LBL}>Número</label>
                  <input className={INP} value={form.numero} onChange={e => setF('numero', e.target.value)} />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className={LBL}>E-mail</label>
                  <input type="email" className={INP} value={form.email} onChange={e => setF('email', e.target.value)} />
                </div>
                <div>
                  <label className={LBL}>Fone / Fax</label>
                  <input className={INP} value={form.foneFax} onChange={e => setF('foneFax', e.target.value)} />
                </div>
              </div>
            </div>
          </section>

          {/* Serviços */}
          <section className="mb-6">
            <h2 className="text-sm font-semibold text-[var(--d2b-text-secondary)] uppercase tracking-wider mb-4 pb-1 border-b border-[var(--d2b-border)]">
              Serviços
            </h2>
            <div className="space-y-4">
              <div>
                <label className={LBL}>Descrição</label>
                <textarea className={INP + ' min-h-[80px] resize-y'} value={form.descricaoServico} onChange={e => setF('descricaoServico', e.target.value)} />
              </div>
              <div className="grid grid-cols-3 gap-4">
                <div>
                  <label className={LBL}>Valor</label>
                  <div className="relative">
                    <span className="absolute left-3 top-1/2 -translate-y-1/2 text-xs text-[var(--d2b-text-muted)]">R$</span>
                    <input className={INP + ' pl-9'} placeholder="0,00" value={form.valorServico} onChange={e => setF('valorServico', e.target.value)} />
                  </div>
                </div>
                <div>
                  <label className={LBL}>Código da lista de serviços <button className="text-[#7C4DFF] hover:underline text-xs ml-1">remover</button></label>
                  <div className="relative">
                    <input className={INP + ' pr-9'} value={form.codigoListaServicos} onChange={e => setF('codigoListaServicos', e.target.value)} />
                    <Search size={14} className="absolute right-3 top-1/2 -translate-y-1/2 text-[var(--d2b-text-muted)]" />
                  </div>
                </div>
                <div>
                  <label className={LBL}>Nomenclatura Brasileira de Serviços (NBS) <button className="text-[#7C4DFF] hover:underline text-xs ml-1">remover</button></label>
                  <div className="relative">
                    <input className={INP + ' pr-9'} value={form.nomenclaturaBS} onChange={e => setF('nomenclaturaBS', e.target.value)} />
                    <Search size={14} className="absolute right-3 top-1/2 -translate-y-1/2 text-[var(--d2b-text-muted)]" />
                  </div>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className={LBL}>Código de natureza da operação (NFSe)</label>
                  <div className="relative">
                    <select className={SEL} value={form.codigoNatureza} onChange={e => setF('codigoNatureza', e.target.value)}>
                      <option>Tributação no município</option>
                      <option>Tributação fora do município</option>
                      <option>Imune</option>
                      <option>Isenta</option>
                    </select>
                    <ChevronDown size={14} className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-[var(--d2b-text-muted)]" />
                  </div>
                </div>
                <div>
                  <label className={LBL}>CNAE</label>
                  <div className="relative">
                    <select className={SEL} value={form.cnae} onChange={e => setF('cnae', e.target.value)}>
                      <option>CNAE padrão da empresa</option>
                    </select>
                    <ChevronDown size={14} className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-[var(--d2b-text-muted)]" />
                  </div>
                </div>
              </div>
            </div>
          </section>

          {/* Impostos */}
          <section className="mb-6">
            <h2 className="text-sm font-semibold text-[var(--d2b-text-secondary)] uppercase tracking-wider mb-4 pb-1 border-b border-[var(--d2b-border)]">
              Impostos
            </h2>
            <div className="grid grid-cols-4 gap-4 mb-4">
              <div>
                <label className={LBL}>IR</label>
                <div className="relative">
                  <input className={INP + ' pr-8'} value={form.ir} onChange={e => setF('ir', e.target.value)} />
                  <span className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-[var(--d2b-text-muted)]">%</span>
                </div>
              </div>
              <div>
                <label className={LBL}>Valor do IR</label>
                <div className="relative">
                  <span className="absolute left-3 top-1/2 -translate-y-1/2 text-xs text-[var(--d2b-text-muted)]">R$</span>
                  <input className={INP_RO + ' pl-9'} value={form.valorIR} readOnly />
                </div>
              </div>
              <div>
                <label className={LBL}>ISS</label>
                <div className="relative">
                  <input className={INP + ' pr-8'} value={form.iss} onChange={e => setF('iss', e.target.value)} />
                  <span className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-[var(--d2b-text-muted)]">%</span>
                </div>
              </div>
              <div>
                <label className={LBL}>Valor ISS</label>
                <div className="relative">
                  <span className="absolute left-3 top-1/2 -translate-y-1/2 text-xs text-[var(--d2b-text-muted)]">R$</span>
                  <input className={INP_RO + ' pl-9'} value={form.valorISS} readOnly />
                </div>
              </div>
            </div>
            <div className="grid grid-cols-4 gap-4 mb-4">
              <div>
                <label className={LBL}>INSS</label>
                <div className="relative">
                  <input className={INP + ' pr-8'} value={form.inss} onChange={e => setF('inss', e.target.value)} />
                  <span className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-[var(--d2b-text-muted)]">%</span>
                </div>
              </div>
              <div>
                <label className={LBL}>Valor do INSS</label>
                <div className="relative">
                  <span className="absolute left-3 top-1/2 -translate-y-1/2 text-xs text-[var(--d2b-text-muted)]">R$</span>
                  <input className={INP_RO + ' pl-9'} value={form.valorINSS} readOnly />
                </div>
              </div>
              <div>
                <label className={LBL}>ISS Retido</label>
                <div className="relative">
                  <select className={SEL} value={form.issRetido} onChange={e => setF('issRetido', e.target.value)}>
                    <option>Não</option>
                    <option>Sim</option>
                  </select>
                  <ChevronDown size={14} className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-[var(--d2b-text-muted)]" />
                </div>
              </div>
            </div>

            {/* Cálculo ligado toggle */}
            <div className="flex items-start gap-3 p-3 bg-[var(--d2b-bg-elevated)] rounded-lg mb-4">
              <button
                onClick={() => setF('calculoLigado', !form.calculoLigado)}
                className={[
                  'relative w-10 h-5 rounded-full transition-colors shrink-0 mt-0.5',
                  form.calculoLigado ? 'bg-blue-500' : 'bg-gray-400',
                ].join(' ')}
              >
                <span className={[
                  'absolute top-0.5 w-4 h-4 bg-white rounded-full shadow transition-transform',
                  form.calculoLigado ? 'left-5' : 'left-0.5',
                ].join(' ')} />
              </button>
              <div>
                <p className="text-sm font-medium text-[var(--d2b-text-primary)]">Cálculo ligado</p>
                <p className="text-xs text-[var(--d2b-text-muted)]">Cálculo automático dos impostos federais. Por padrão, os impostos federais são calculados e destacados apenas em notas fiscais cujo valor seja igual ou superior a R$ 5.000,00.</p>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className={LBL}>Valor total</label>
                <div className="relative">
                  <span className="absolute left-3 top-1/2 -translate-y-1/2 text-xs text-[var(--d2b-text-muted)]">R$</span>
                  <input className={INP_RO + ' pl-9'} value={form.valorTotal} readOnly />
                </div>
              </div>
              <div>
                <label className={LBL}>Valor líquido</label>
                <div className="relative">
                  <span className="absolute left-3 top-1/2 -translate-y-1/2 text-xs text-[var(--d2b-text-muted)]">R$</span>
                  <input className={INP_RO + ' pl-9'} value={form.valorLiquido} readOnly />
                </div>
              </div>
            </div>
          </section>

          {/* Vendedor */}
          <section className="mb-6">
            <h2 className="text-sm font-semibold text-[var(--d2b-text-secondary)] uppercase tracking-wider mb-4 pb-1 border-b border-[var(--d2b-border)]">
              Vendedor
            </h2>
            <div className="grid grid-cols-3 gap-4">
              <div>
                <label className={LBL}>Vendedor</label>
                <input className={INP} value={form.vendedor} onChange={e => setF('vendedor', e.target.value)} />
              </div>
              <div>
                <label className={LBL}>Comissão</label>
                <div className="relative">
                  <input className={INP + ' pr-8'} value={form.comissao} onChange={e => setF('comissao', e.target.value)} />
                  <span className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-[var(--d2b-text-muted)]">%</span>
                </div>
              </div>
              <div>
                <label className={LBL}>Valor comissão</label>
                <div className="relative">
                  <span className="absolute left-3 top-1/2 -translate-y-1/2 text-xs text-[var(--d2b-text-muted)]">R$</span>
                  <input className={INP_RO + ' pl-9'} value={form.valorComissao} readOnly />
                </div>
              </div>
            </div>
          </section>

          {/* Pagamento */}
          <section className="mb-6">
            <h2 className="text-sm font-semibold text-[var(--d2b-text-secondary)] uppercase tracking-wider mb-4 pb-1 border-b border-[var(--d2b-border)]">
              Pagamento
            </h2>
            <div className="max-w-xs">
              <label className={LBL}>Forma de recebimento</label>
              <div className="relative">
                <select className={SEL} value={form.formaRecebimento} onChange={e => setF('formaRecebimento', e.target.value)}>
                  <option>Selecione</option>
                  <option>Boleto</option>
                  <option>Pix</option>
                  <option>Cartão</option>
                </select>
                <ChevronDown size={14} className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-[var(--d2b-text-muted)]" />
              </div>
            </div>
          </section>

          {/* Dados adicionais */}
          <section className="mb-6">
            <h2 className="text-sm font-semibold text-[var(--d2b-text-secondary)] uppercase tracking-wider mb-4 pb-1 border-b border-[var(--d2b-border)]">
              Dados adicionais
            </h2>
            <div className="space-y-4">
              <div>
                <label className={LBL}>Observações</label>
                <textarea className={INP + ' min-h-[60px] resize-y'} value={form.observacoes} onChange={e => setF('observacoes', e.target.value)} />
              </div>
              <div>
                <label className={LBL}>Texto IR</label>
                <input className={INP} value={form.textoIR} onChange={e => setF('textoIR', e.target.value)} />
              </div>
              <div>
                <label className={LBL}>Marcadores</label>
                <div className="flex items-center gap-2">
                  <Tag size={14} className="text-[var(--d2b-text-muted)] shrink-0" />
                  <input className={INP} placeholder="Separados por vírgula ou tab" value={form.marcadores} onChange={e => setF('marcadores', e.target.value)} />
                </div>
              </div>
            </div>
          </section>
        </div>

        {/* Footer */}
        <div className="sticky bottom-0 bg-[var(--d2b-bg-surface)] border-t border-[var(--d2b-border)] px-8 py-3 flex items-center gap-3">
          <button className={BTN_PRIMARY}>salvar</button>
          <button onClick={() => setTela(selected ? 'detalhe' : 'lista')} className={BTN_GHOST}>cancelar</button>
        </div>
      </div>
    )
  }

  // ── DETALHE ───────────────────────────────────────────────────────────────
  if (tela === 'detalhe' && selected) {
    return (
      <div className="flex flex-col h-full overflow-y-auto bg-[var(--d2b-bg-main)]">
        {/* Header */}
        <div className="sticky top-0 z-10 bg-[var(--d2b-bg-surface)] border-b border-[var(--d2b-border)] px-6 py-3 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <button onClick={() => setTela('lista')} className={BTN_GHOST}><ArrowLeft size={16} /> voltar</button>
            <span className="text-xs text-[var(--d2b-text-muted)]">
              início <span className="mx-1">≡</span> serviços <span className="mx-1">{'>'}</span>
              <span className="text-[var(--d2b-text-secondary)]">notas de serviço</span>
            </span>
          </div>
          <div className="flex items-center gap-2">
            <button onClick={() => { setForm(selected); setTela('form') }} className={BTN_PRIMARY}>
              <Pencil size={13} /> editar
            </button>
            <div className="relative">
              <button onClick={() => setAcoesDet(p => !p)} className={BTN_OUTLINE}>
                ações <MoreHorizontal size={14} />
              </button>
              {acoesDet && (
                <div className="absolute right-0 top-full mt-1 w-52 bg-[var(--d2b-bg-surface)] border border-[var(--d2b-border)] rounded-lg shadow-lg z-20 py-1">
                  {ACOES_NOTA.map(a => (
                    <button key={a} onClick={() => setAcoesDet(false)} className="w-full text-left px-4 py-2 text-sm text-[var(--d2b-text-primary)] hover:bg-[var(--d2b-hover)]">{a}</button>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>

        <div className="flex-1 px-8 py-6 max-w-4xl mx-auto w-full">
          <div className="flex items-center gap-3 mb-6">
            <h1 className="text-xl font-bold text-[var(--d2b-text-primary)]">Nota de Serviço</h1>
            <span className="flex items-center gap-1.5 text-sm text-[var(--d2b-text-secondary)]">
              <span className="w-2.5 h-2.5 rounded-full bg-yellow-400 shrink-0" />
              {selected.status}
            </span>
          </div>

          <div className="grid grid-cols-3 gap-x-8 gap-y-4 mb-6 text-sm pb-6 border-b border-[var(--d2b-border)]">
            {[
              ['Série', selected.serie],
              ['Número RPS', selected.numeroRPS],
              ['Data emissão', selected.dataEmissao],
            ].map(([l, v]) => (
              <div key={l}><span className="text-[var(--d2b-text-muted)] text-xs">{l}</span><p className="mt-0.5 text-[var(--d2b-text-primary)]">{v}</p></div>
            ))}
          </div>

          {/* Cliente */}
          <section className="mb-6 pb-6 border-b border-[var(--d2b-border)]">
            <h2 className="text-sm font-semibold text-[var(--d2b-text-secondary)] uppercase tracking-wider mb-4">Cliente</h2>
            <div className="grid grid-cols-2 gap-x-8 gap-y-3 text-sm">
              <div><span className="text-[var(--d2b-text-muted)] text-xs">Contato</span><p className="mt-0.5 text-[var(--d2b-text-primary)]">{selected.contato}</p></div>
              <div><span className="text-[var(--d2b-text-muted)] text-xs">Tipo de pessoa</span><p className="mt-0.5 text-[var(--d2b-text-primary)]">{selected.tipoPessoa}</p></div>
              <div><span className="text-[var(--d2b-text-muted)] text-xs">CPF</span><p className="mt-0.5 text-[var(--d2b-text-primary)]">{selected.cpf}</p></div>
              <div><span className="text-[var(--d2b-text-muted)] text-xs">CEP</span><p className="mt-0.5 text-[var(--d2b-text-primary)]">{selected.cep}</p></div>
              <div><span className="text-[var(--d2b-text-muted)] text-xs">Município</span><p className="mt-0.5 text-[var(--d2b-text-primary)]">{selected.municipio}</p></div>
              <div><span className="text-[var(--d2b-text-muted)] text-xs">UF</span><p className="mt-0.5 text-[var(--d2b-text-primary)] font-medium">{selected.uf}</p></div>
              <div><span className="text-[var(--d2b-text-muted)] text-xs">Bairro</span><p className="mt-0.5 text-[var(--d2b-text-primary)]">{selected.bairro}</p></div>
              <div><span className="text-[var(--d2b-text-muted)] text-xs">Endereço</span><p className="mt-0.5 text-[var(--d2b-text-primary)]">{selected.endereco}</p></div>
              <div><span className="text-[var(--d2b-text-muted)] text-xs">Número</span><p className="mt-0.5 text-[var(--d2b-text-primary)]">{selected.numero}</p></div>
            </div>
          </section>

          {/* Serviços */}
          <section className="mb-6 pb-6 border-b border-[var(--d2b-border)]">
            <h2 className="text-sm font-semibold text-[var(--d2b-text-secondary)] uppercase tracking-wider mb-4">Serviços</h2>
            <div className="grid grid-cols-2 gap-x-8 gap-y-3 text-sm">
              <div><span className="text-[var(--d2b-text-muted)] text-xs">Descrição</span><p className="mt-0.5 text-[var(--d2b-text-primary)]">{selected.descricaoServico}</p></div>
              <div><span className="text-[var(--d2b-text-muted)] text-xs">Valor</span><p className="mt-0.5 text-[var(--d2b-text-primary)]">{selected.valorServico}</p></div>
              <div><span className="text-[var(--d2b-text-muted)] text-xs">Código da lista de serviços</span><p className="mt-0.5 text-[var(--d2b-text-primary)]">{selected.codigoListaServicos}</p></div>
              <div><span className="text-[var(--d2b-text-muted)] text-xs">Código de natureza da operação (NFSe)</span><p className="mt-0.5 text-[var(--d2b-text-primary)]">{selected.codigoNatureza}</p></div>
              <div><span className="text-[var(--d2b-text-muted)] text-xs">CNAE</span><p className="mt-0.5 text-[var(--d2b-text-primary)]">{selected.cnae}</p></div>
            </div>
          </section>

          {/* Impostos */}
          <section className="mb-6 pb-6 border-b border-[var(--d2b-border)]">
            <h2 className="text-sm font-semibold text-[var(--d2b-text-secondary)] uppercase tracking-wider mb-4">Impostos</h2>
            <div className="grid grid-cols-4 gap-x-8 gap-y-3 text-sm">
              <div><span className="text-[var(--d2b-text-muted)] text-xs">IR</span><p className="mt-0.5 text-[var(--d2b-text-primary)]">{selected.ir} %</p></div>
              <div><span className="text-[var(--d2b-text-muted)] text-xs">Valor do IR</span><p className="mt-0.5 text-[var(--d2b-text-primary)]">{selected.valorIR || 'R$ 0,00'}</p></div>
              <div><span className="text-[var(--d2b-text-muted)] text-xs">ISS</span><p className="mt-0.5 text-[var(--d2b-text-primary)]">{selected.iss} %</p></div>
              <div><span className="text-[var(--d2b-text-muted)] text-xs">Valor ISS</span><p className="mt-0.5 text-[var(--d2b-text-primary)]">{selected.valorISS}</p></div>
              <div><span className="text-[var(--d2b-text-muted)] text-xs">INSS</span><p className="mt-0.5 text-[var(--d2b-text-primary)]">{selected.inss} %</p></div>
              <div><span className="text-[var(--d2b-text-muted)] text-xs">Valor do INSS</span><p className="mt-0.5 text-[var(--d2b-text-primary)]">{selected.valorINSS || 'R$ 0,00'}</p></div>
              <div><span className="text-[var(--d2b-text-muted)] text-xs">ISS Retido</span><p className="mt-0.5 text-[var(--d2b-text-primary)]">{selected.issRetido}</p></div>
              <div><span className="text-[var(--d2b-text-muted)] text-xs">Valor total</span><p className="mt-0.5 text-[var(--d2b-text-primary)] font-semibold">{selected.valorTotal}</p></div>
              <div><span className="text-[var(--d2b-text-muted)] text-xs">Valor líquido</span><p className="mt-0.5 text-[var(--d2b-text-primary)] font-semibold">{selected.valorLiquido}</p></div>
            </div>
          </section>

          {/* Vendedor */}
          <section className="mb-6 pb-6 border-b border-[var(--d2b-border)]">
            <h2 className="text-sm font-semibold text-[var(--d2b-text-secondary)] uppercase tracking-wider mb-4">Vendedor</h2>
            <div className="grid grid-cols-2 gap-x-8 gap-y-3 text-sm">
              <div><span className="text-[var(--d2b-text-muted)] text-xs">Comissão</span><p className="mt-0.5 text-[var(--d2b-text-primary)]">{selected.comissao}</p></div>
              <div><span className="text-[var(--d2b-text-muted)] text-xs">Valor comissão</span><p className="mt-0.5 text-[var(--d2b-text-primary)]">{selected.valorComissao}</p></div>
            </div>
          </section>

          {/* Pagamento */}
          <section className="mb-6 pb-6 border-b border-[var(--d2b-border)]">
            <h2 className="text-sm font-semibold text-[var(--d2b-text-secondary)] uppercase tracking-wider mb-4">Pagamento</h2>
            <div className="rounded-lg bg-blue-600 text-white text-sm px-4 py-3 flex items-center gap-2 max-w-md">
              <span className="bg-orange-400 text-white text-[10px] font-bold px-2 py-0.5 rounded">Novidade</span>
              Agora você pode receber com{' '}
              <span className="underline cursor-pointer">🔗 link de pagamento</span>{' '}
              pela conta digital da olist
            </div>
          </section>

          {/* Dados adicionais */}
          <section className="mb-6">
            <h2 className="text-sm font-semibold text-[var(--d2b-text-secondary)] uppercase tracking-wider mb-4">Dados adicionais</h2>
            <div className="text-sm space-y-3">
              <div><span className="text-[var(--d2b-text-muted)] text-xs">Observações</span><p className="mt-0.5 text-[var(--d2b-text-primary)]">{selected.observacoes || '–'}</p></div>
              <div><span className="text-[var(--d2b-text-muted)] text-xs">Texto IR</span><p className="mt-0.5 text-[var(--d2b-text-primary)]">{selected.textoIR || '–'}</p></div>
            </div>
          </section>
        </div>
      </div>
    )
  }

  // ── LISTA ─────────────────────────────────────────────────────────────────
  return (
    <div className="flex flex-col h-full overflow-hidden bg-[var(--d2b-bg-main)]">
      {/* Top bar */}
      <div className="flex items-center justify-between px-6 py-3 border-b border-[var(--d2b-border)] bg-[var(--d2b-bg-surface)] shrink-0">
        <span className="text-xs text-[var(--d2b-text-muted)]">
          início <span className="mx-1">≡</span> serviços <span className="mx-1">{'>'}</span>
          <span className="text-[var(--d2b-text-secondary)]">notas de serviço</span>
        </span>
        <div className="flex items-center gap-2">
          <button onClick={() => { setSelected(null); setForm(NOTA_INITIAL); setTela('form') }} className={BTN_PRIMARY}>
            <Plus size={14} /> incluir nota de serviço
          </button>
          <div className="relative">
            <button className={BTN_OUTLINE}>
              ações <MoreHorizontal size={14} />
            </button>
          </div>
        </div>
      </div>

      {/* Title + search */}
      <div className="px-6 pt-5 pb-3 shrink-0">
        <h1 className="text-xl font-bold text-[var(--d2b-text-primary)] mb-4">Notas de serviço</h1>
        <div className="flex items-center gap-2">
          <div className="relative flex-1 max-w-sm">
            <input className={INP + ' pr-9'} placeholder="Pesquise por contato ou número" value={search} onChange={e => setSearch(e.target.value)} />
            <Search size={14} className="absolute right-3 top-1/2 -translate-y-1/2 text-[var(--d2b-text-muted)]" />
          </div>
        </div>
      </div>

      {/* Table */}
      <div className="flex-1 overflow-y-auto">
        {filtered.length === 0 ? (
          <div className="flex items-center justify-center h-full">
            <div className="text-center">
              <p className="text-sm text-[var(--d2b-text-muted)]">Nenhuma nota de serviço encontrada.</p>
              <button onClick={() => { setSelected(null); setForm(NOTA_INITIAL); setTela('form') }} className={BTN_PRIMARY + ' mt-4 mx-auto'}>
                <Plus size={14} /> incluir nota de serviço
              </button>
            </div>
          </div>
        ) : (
          <table className="w-full">
            <thead className="sticky top-0 bg-[var(--d2b-bg-surface)] border-b border-[var(--d2b-border)]">
              <tr>
                <th className="px-3 py-3 w-8"><input type="checkbox" className="rounded" /></th>
                <th className="px-3 py-3 w-8" />
                <th className={TH}>Número RPS</th>
                <th className={TH}>Número NFS-e</th>
                <th className={TH}>Data emissão</th>
                <th className={TH}>Contato</th>
                <th className={TH}>Situação</th>
                <th className={TH + ' text-right'}>Valor total</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map(n => (
                <tr
                  key={n.id}
                  className="border-b border-[var(--d2b-border)] hover:bg-[var(--d2b-hover)] cursor-pointer"
                  onClick={() => { setSelected(n); setTela('detalhe') }}
                >
                  <td className="px-3 py-3"><input type="checkbox" className="rounded" onClick={e => e.stopPropagation()} /></td>
                  <td className="px-3 py-3 text-[var(--d2b-text-muted)]"><MoreHorizontal size={14} /></td>
                  <td className={TD}>{n.numeroRPS}</td>
                  <td className={TD}>{n.numeroNFSe || '–'}</td>
                  <td className={TD}>{n.dataEmissao}</td>
                  <td className={TD}>{n.contato}</td>
                  <td className="px-3 py-3">
                    <span className="flex items-center gap-1.5 text-sm">
                      <span className="w-2 h-2 rounded-full bg-yellow-400 shrink-0" />
                      <span className="text-[var(--d2b-text-primary)]">{n.status}</span>
                    </span>
                  </td>
                  <td className={TD + ' text-right'}>{n.valorTotal}</td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  )
}
