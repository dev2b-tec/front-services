'use client'

import { useState } from 'react'
import {
  Search, Plus, MoreHorizontal, ChevronDown, Trash2,
  RefreshCw, AlertCircle, AlertTriangle, CheckCircle,
} from 'lucide-react'

// ─── Shared styles ───────────────────────────────────────────────────────────
const INP =
  'w-full bg-[var(--d2b-bg-main)] border border-[var(--d2b-border-strong)] rounded-md ' +
  'px-3 py-2 text-sm text-[var(--d2b-text-primary)] placeholder:text-[var(--d2b-text-muted)] ' +
  'focus:outline-none focus:border-[#7C4DFF] transition-colors'
const SEL =
  'w-full bg-[var(--d2b-bg-main)] border border-[var(--d2b-border-strong)] rounded-md ' +
  'px-3 py-2 text-sm text-[var(--d2b-text-primary)] focus:outline-none focus:border-[#7C4DFF] transition-colors appearance-none'
const LBL = 'block text-xs text-[var(--d2b-text-secondary)] mb-1'
const BTN_PRIMARY =
  'flex items-center gap-2 px-4 py-2.5 rounded-full text-sm font-bold text-white bg-[#7C4DFF] hover:bg-[#5B21B6] transition-colors'
const BTN_OUTLINE =
  'flex items-center gap-2 px-3 py-1.5 rounded-md text-sm font-medium border border-[var(--d2b-border-strong)] ' +
  'text-[var(--d2b-text-secondary)] hover:border-[#7C4DFF] hover:text-[var(--d2b-text-primary)] bg-transparent transition-colors'
const TH = 'text-left px-3 py-3 text-xs font-semibold text-[var(--d2b-text-secondary)] uppercase tracking-wider whitespace-nowrap'
const FIELD_DISPLAY = 'text-sm text-[var(--d2b-text-primary)]'
const FIELD_LABEL = 'text-xs text-[var(--d2b-text-muted)] mb-0.5'

// ─── Types ───────────────────────────────────────────────────────────────────
type Situacao = 'Pendente' | 'Autorizada' | 'Cancelada' | 'Rejeitada'
type Tela = 'lista' | 'form' | 'detalhe'

type ItemNF = { id: string; descricao: string; sku: string; un: string; qtde: number; precoUn: number }

type NotaFiscal = {
  id: string
  numero: string
  cliente: string
  serie: string
  situacao: Situacao
  dataEmissao: string
  valor: number
}

const SITUACAO_COLORS: Record<Situacao, string> = {
  Pendente:   'bg-yellow-500/10 text-yellow-400',
  Autorizada: 'bg-emerald-500/10 text-emerald-400',
  Cancelada:  'bg-[var(--d2b-bg-elevated)] text-[var(--d2b-text-muted)]',
  Rejeitada:  'bg-rose-500/10 text-rose-400',
}

const MOCK_NF: NotaFiscal[] = [
  { id: '1', numero: '000002', serie: '1', cliente: 'BS TECNOLOGIA LTDA', situacao: 'Pendente',   dataEmissao: '07/04/2026', valor: 15.00 },
  { id: '2', numero: '000001', serie: '1', cliente: 'BS TECNOLOGIA LTDA', situacao: 'Autorizada', dataEmissao: '06/04/2026', valor: 320.00 },
]

// ─── Drawer NF Eletrônica ──────────────────────────────────────────────────────
function DrawerNFe({ onClose }: { onClose: () => void }) {
  return (
    <div className="fixed inset-0 z-40 flex">
      <div className="flex-1 bg-black/30" onClick={onClose} />
      <div className="w-[440px] bg-[var(--d2b-bg-elevated)] border-l border-[var(--d2b-border)] flex flex-col h-full shadow-2xl">
        <div className="flex items-center justify-between px-6 py-4 border-b border-[var(--d2b-border)]">
          <h3 className="text-base font-semibold text-[var(--d2b-text-primary)]">Nota fiscal eletrônica</h3>
          <button onClick={onClose} className="text-sm text-[var(--d2b-text-secondary)] hover:text-[var(--d2b-text-primary)]">fechar ×</button>
        </div>
        <div className="flex-1 overflow-y-auto px-6 py-5 flex flex-col gap-4">
          <div className="grid grid-cols-2 gap-3 text-sm">
            <div><p className={FIELD_LABEL}>Número da nota</p><p className={FIELD_DISPLAY}>2</p></div>
            <div><p className={FIELD_LABEL}>Cliente</p><p className={FIELD_DISPLAY}>BS TECNOLOGIA LTDA</p></div>
          </div>
          {/* Homologação warning */}
          <div className="flex items-start gap-2 p-3 rounded-xl bg-yellow-500/5 border border-yellow-500/20">
            <AlertTriangle size={14} className="text-yellow-400 shrink-0 mt-0.5" />
            <div>
              <p className="text-xs font-semibold text-[var(--d2b-text-primary)]">Ambiente de Homologação</p>
              <p className="text-xs text-[var(--d2b-text-secondary)]">Documento sem valor fiscal.</p>
            </div>
          </div>
          {/* Error */}
          <div className="flex items-start gap-2 p-3 rounded-xl bg-rose-500/5 border border-rose-500/20">
            <AlertCircle size={14} className="text-rose-400 shrink-0 mt-0.5" />
            <div>
              <p className="text-xs font-semibold text-[var(--d2b-text-primary)]">Falha na inicialização do aplicativo NFe</p>
              <p className="text-xs text-[var(--d2b-text-secondary)]">Não foi possível enviar a nota à Sefaz: O Certificado Digital está com problemas ou se encontra vencido</p>
            </div>
          </div>
          <div>
            <p className="text-sm font-semibold text-[var(--d2b-text-primary)] mb-1">Como corrigir</p>
            <p className="text-xs text-[var(--d2b-text-secondary)]">Acesse as configurações do Certificado Digital e verifique se estão corretas, assegurando-se de que a data de vencimento esteja atualizada</p>
          </div>
        </div>
        <div className="px-6 py-4 border-t border-[var(--d2b-border)] flex items-center gap-3">
          <button className={BTN_PRIMARY}>tentar novamente</button>
          <button onClick={onClose} className="text-sm text-[var(--d2b-text-secondary)] hover:text-[var(--d2b-text-primary)]">cancelar</button>
        </div>
      </div>
    </div>
  )
}

// ─── Sections helper ─────────────────────────────────────────────────────────
function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="mb-8">
      <h3 className="text-base font-semibold text-[var(--d2b-text-primary)] mb-4 pb-2 border-b border-[var(--d2b-border)]">{title}</h3>
      {children}
    </div>
  )
}

function FieldGrid({ children, cols = 4 }: { children: React.ReactNode; cols?: number }) {
  const cls = cols === 2 ? 'grid-cols-2' : cols === 3 ? 'grid-cols-3' : cols === 5 ? 'grid-cols-5' : 'grid-cols-4'
  return <div className={`grid ${cls} gap-4 mb-4`}>{children}</div>
}

function Field({ label, value, className = '' }: { label: string; value?: string; className?: string }) {
  return (
    <div className={className}>
      <p className={FIELD_LABEL}>{label}</p>
      <p className={FIELD_DISPLAY}>{value ?? '—'}</p>
    </div>
  )
}

// ─── Formulário NF ────────────────────────────────────────────────────────────
function NFForm({
  nf,
  onBack,
}: {
  nf?: NotaFiscal
  onBack: () => void
}) {
  const [tipoSaida,       setTipoSaida]       = useState('Emissão própria')
  const [numero,          setNumero]           = useState(nf?.numero ?? '000003')
  const [dataEmissao,     setDataEmissao]     = useState('07/04/2026')
  const [horaEmissao,     setHoraEmissao]     = useState('')
  const [naturezaOp,      setNaturezaOp]      = useState('(NF-e) Venda de mercadorias de terceiros para consumidor final')
  const [dataSaida,       setDataSaida]       = useState('07/04/2026')
  const [horaSaida,       setHoraSaida]       = useState('22:58')
  const [cliente,         setCliente]         = useState(nf?.cliente ?? '')
  const [cep,             setCep]             = useState('54.410-010')
  const [cidade,          setCidade]          = useState('Jaboatão dos Guararapes')
  const [uf,              setUf]              = useState('PE')
  const [endereco,        setEndereco]        = useState('Avenida Bernardo Vieira de Melo')
  const [bairro,          setBairro]          = useState('Piedade')
  const [numero2,         setNumero2]         = useState('62')
  const [vendedor,        setVendedor]        = useState('JESSE')
  const [itens,           setItens]           = useState<ItemNF[]>(nf ? [{ id: '1', descricao: 'Teste', sku: '', un: 'UNIDAD', qtde: 1, precoUn: 15 }] : [])
  const [formaRecebimento,setFormaRecebimento]=useState('Dinheiro')
  const [deposito,        setDeposito]        = useState('Geral')
  const [observacoes,     setObservacoes]     = useState('')

  const totalProdutos = itens.reduce((s, i) => s + i.qtde * i.precoUn, 0)
  const addItem = () => setItens(prev => [...prev, { id: String(Date.now()), descricao: '', sku: '', un: 'UNIDAD', qtde: 1, precoUn: 0 }])

  return (
    <div className="flex flex-col h-full">
      {/* Header */}
      <div className="flex items-center justify-between px-8 pt-5 pb-3 border-b border-[var(--d2b-border)]">
        <div className="flex items-center gap-3">
          <button onClick={onBack} className="text-xs text-[var(--d2b-text-muted)] hover:text-[var(--d2b-text-primary)]">← voltar</button>
          <span className="text-xs text-[var(--d2b-text-muted)]">início ≡ vendas notas fiscais</span>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto px-8 py-6 max-w-4xl">
        <h2 className="text-xl font-semibold text-[var(--d2b-text-primary)] mb-6">Nota fiscal</h2>

        {/* Ambiente test warning */}
        <div className="flex items-center gap-2 p-3 rounded-xl bg-yellow-500/5 border border-yellow-500/20 mb-6">
          <AlertCircle size={14} className="text-yellow-400 shrink-0" />
          <p className="text-xs text-[var(--d2b-text-secondary)]">Você está no ambiente para testes de notas fiscais. <button className="text-[#7C4DFF] hover:underline">alterar ambiente</button> para gerar notas com valor fiscal.</p>
        </div>

        {/* Identificação */}
        <Section title="Nota fiscal">
          <FieldGrid cols={5}>
            <div className="col-span-2">
              <label className={LBL}>Tipo de Saída</label>
              <div className="relative">
                <select className={SEL} value={tipoSaida} onChange={e => setTipoSaida(e.target.value)}>
                  <option>Emissão própria</option><option>Devolução</option>
                </select>
                <ChevronDown size={12} className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none text-[var(--d2b-text-muted)]" />
              </div>
            </div>
            <div>
              <label className={LBL}>Série</label>
              <input className={INP} defaultValue="1" />
            </div>
            <div>
              <label className={LBL}>Número</label>
              <input className={INP} value={numero} onChange={e => setNumero(e.target.value)} />
            </div>
            <div>
              <label className={LBL}>Data emissão</label>
              <input className={INP} value={dataEmissao} onChange={e => setDataEmissao(e.target.value)} />
            </div>
          </FieldGrid>

          <FieldGrid cols={5}>
            <div className="col-span-3">
              <label className={LBL}>Natureza da operação</label>
              <div className="flex items-center gap-2">
                <input className={INP} value={naturezaOp} onChange={e => setNaturezaOp(e.target.value)} />
                <button className="shrink-0 text-[var(--d2b-text-muted)] hover:text-[var(--d2b-text-primary)]"><RefreshCw size={14} /></button>
              </div>
            </div>
            <div>
              <label className={LBL}>Data saída</label>
              <input className={INP} value={dataSaida} onChange={e => setDataSaida(e.target.value)} />
            </div>
            <div>
              <label className={LBL}>Hora saída</label>
              <input className={INP} value={horaSaida} onChange={e => setHoraSaida(e.target.value)} />
            </div>
          </FieldGrid>

          <FieldGrid>
            <div>
              <label className={LBL}>Finalidade</label>
              <div className="relative"><select className={SEL}><option>NF-e normal</option></select><ChevronDown size={12} className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none text-[var(--d2b-text-muted)]" /></div>
            </div>
            <div>
              <label className={LBL}>Código de regime tributário</label>
              <div className="relative"><select className={SEL}><option>Simples nacional</option></select><ChevronDown size={12} className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none text-[var(--d2b-text-muted)]" /></div>
            </div>
            <div>
              <label className={LBL}>Consumidor final</label>
              <div className="relative"><select className={SEL}><option>Sim</option><option>Não</option></select><ChevronDown size={12} className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none text-[var(--d2b-text-muted)]" /></div>
            </div>
            <div>
              <label className={LBL}>Intermediador</label>
              <div className="relative"><select className={SEL}><option>Sem intermediador</option></select><ChevronDown size={12} className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none text-[var(--d2b-text-muted)]" /></div>
            </div>
          </FieldGrid>

          <div className="mb-4 max-w-xs">
            <label className={LBL}>Indicador de presença do comprador no momento da venda</label>
            <div className="relative"><select className={SEL}><option>Operação não presencial, pela Internet</option><option>Operação presencial</option></select><ChevronDown size={12} className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none text-[var(--d2b-text-muted)]" /></div>
          </div>

          <div className="max-w-xs">
            <label className={LBL}>Chave de acesso</label>
            <input className={INP} placeholder="—" disabled />
          </div>
        </Section>

        {/* Destinatário */}
        <Section title="Destinatário">
          <div className="mb-4">
            <label className={LBL}>Nome</label>
            <div className="flex items-center gap-2">
              <input className={INP} value={cliente} onChange={e => setCliente(e.target.value)} placeholder="Buscar destinatário..." />
              <button className="shrink-0 text-[var(--d2b-text-muted)] hover:text-[var(--d2b-text-primary)]"><Search size={14} /></button>
            </div>
            <div className="flex gap-3 mt-1">
              <button className="text-xs text-[#7C4DFF] hover:text-[#5B21B6]">ver últimas vendas</button>
              <button className="text-xs text-[#7C4DFF] hover:text-[#5B21B6]">limite de crédito</button>
            </div>
          </div>

          <FieldGrid>
            <div>
              <label className={LBL}>Tipo de pessoa</label>
              <div className="relative"><select className={SEL}><option>Jurídica</option><option>Física</option></select><ChevronDown size={12} className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none text-[var(--d2b-text-muted)]" /></div>
            </div>
            <div>
              <label className={LBL}>Contribuinte</label>
              <div className="relative"><select className={SEL}><option>Não informado</option><option>Contribuinte</option><option>Não contribuinte</option></select><ChevronDown size={12} className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none text-[var(--d2b-text-muted)]" /></div>
            </div>
            <div>
              <label className={LBL}>CNPJ</label>
              <input className={INP} />
            </div>
            <div>
              <label className={LBL}>Insc. Estadual</label>
              <input className={INP} />
            </div>
          </FieldGrid>

          <FieldGrid cols={3}>
            <div>
              <label className={LBL}>CEP</label>
              <div className="flex items-center gap-2">
                <input className={INP} value={cep} onChange={e => setCep(e.target.value)} />
                <button className="shrink-0 text-[var(--d2b-text-muted)] hover:text-[var(--d2b-text-primary)]"><Search size={14} /></button>
              </div>
            </div>
            <div>
              <label className={LBL}>Cidade</label>
              <input className={INP} value={cidade} onChange={e => setCidade(e.target.value)} />
            </div>
            <div>
              <label className={LBL}>UF</label>
              <div className="relative"><select className={SEL} value={uf} onChange={e => setUf(e.target.value)}><option>PE</option><option>SP</option><option>RJ</option><option>MG</option></select><ChevronDown size={12} className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none text-[var(--d2b-text-muted)]" /></div>
            </div>
          </FieldGrid>

          <FieldGrid cols={4}>
            <div className="col-span-2">
              <label className={LBL}>Endereço</label>
              <input className={INP} value={endereco} onChange={e => setEndereco(e.target.value)} />
            </div>
            <div>
              <label className={LBL}>Bairro</label>
              <input className={INP} value={bairro} onChange={e => setBairro(e.target.value)} />
            </div>
            <div>
              <label className={LBL}>Número</label>
              <input className={INP} value={numero2} onChange={e => setNumero2(e.target.value)} />
            </div>
          </FieldGrid>

          <FieldGrid>
            <div>
              <label className={LBL}>Fone / Fax</label>
              <input className={INP} />
            </div>
            <div>
              <label className={LBL}>E-mail</label>
              <input className={INP} />
            </div>
            <div>
              <label className={LBL}>Suframa</label>
              <input className={INP} />
            </div>
            <div />
          </FieldGrid>

          <FieldGrid cols={2}>
            <div>
              <label className={LBL}>Vendedor</label>
              <input className={INP} value={vendedor} onChange={e => setVendedor(e.target.value)} />
            </div>
            <div>
              <label className={LBL}>Lista de preço</label>
              <div className="relative"><select className={SEL}><option>Padrão</option></select><ChevronDown size={12} className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none text-[var(--d2b-text-muted)]" /></div>
            </div>
          </FieldGrid>
        </Section>

        {/* Produtos */}
        <Section title="Produtos ou serviços">
          <table className="w-full text-sm mb-3">
            <thead>
              <tr className="border-b border-[var(--d2b-border)]">
                <th className={TH}>Nº</th>
                <th className={TH}>Descrição</th>
                <th className={TH}>Cód (SKU)</th>
                <th className={TH}>Un</th>
                <th className={TH + ' text-right'}>Qtde</th>
                <th className={TH + ' text-right'}>Preço un</th>
                <th className={TH + ' text-right'}>Total</th>
                <th className="w-16" />
              </tr>
            </thead>
            <tbody>
              {itens.map((i, idx) => (
                <tr key={i.id} className="border-b border-[var(--d2b-border)] hover:bg-[var(--d2b-hover)]">
                  <td className="px-3 py-2 text-[var(--d2b-text-muted)] text-xs">{idx + 1}</td>
                  <td className="px-3 py-2"><input className={INP + ' py-1 text-xs'} value={i.descricao} onChange={e => setItens(prev => prev.map(x => x.id === i.id ? { ...x, descricao: e.target.value } : x))} /></td>
                  <td className="px-3 py-2 w-28"><input className={INP + ' py-1 text-xs'} value={i.sku} onChange={e => setItens(prev => prev.map(x => x.id === i.id ? { ...x, sku: e.target.value } : x))} /></td>
                  <td className="px-3 py-2 w-24"><input className={INP + ' py-1 text-xs'} value={i.un} onChange={e => setItens(prev => prev.map(x => x.id === i.id ? { ...x, un: e.target.value } : x))} /></td>
                  <td className="px-3 py-2 w-20"><input className={INP + ' py-1 text-xs text-right'} type="number" value={i.qtde} onChange={e => setItens(prev => prev.map(x => x.id === i.id ? { ...x, qtde: Number(e.target.value) } : x))} /></td>
                  <td className="px-3 py-2 w-24"><input className={INP + ' py-1 text-xs text-right'} type="number" value={i.precoUn} onChange={e => setItens(prev => prev.map(x => x.id === i.id ? { ...x, precoUn: Number(e.target.value) } : x))} /></td>
                  <td className="px-3 py-2 text-right text-xs font-medium text-[var(--d2b-text-primary)]">{(i.qtde * i.precoUn).toFixed(2)}</td>
                  <td className="px-3 py-2">
                    <div className="flex gap-2">
                      <button className="text-xs text-[#7C4DFF]">editar</button>
                      <button onClick={() => setItens(prev => prev.filter(x => x.id !== i.id))} className="text-[var(--d2b-text-muted)] hover:text-rose-400"><Trash2 size={12} /></button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          <div className="flex items-center gap-4">
            <button onClick={addItem} className="flex items-center gap-1.5 text-sm text-[#7C4DFF] hover:text-[#5B21B6]"><Plus size={13} />adicionar outro item</button>
            <button className="flex items-center gap-1.5 text-sm text-[#7C4DFF] hover:text-[#5B21B6]"><Search size={11} />busca avançada de itens</button>
          </div>
        </Section>

        {/* Cálculo do imposto */}
        <Section title="Cálculo do imposto">
          <div className="grid grid-cols-4 gap-3 mb-3">
            {[
              ['Total Produtos', `R$ ${totalProdutos.toFixed(2)}`],
              ['Total Serviços', 'R$ 0,00'],
              ['Valor do Frete', 'R$ 0,00'],
              ['Valor do Seguro', 'R$'],
            ].map(([l, v]) => (
              <div key={l}><p className={FIELD_LABEL}>{l}</p><input className={INP + ' text-xs py-1'} defaultValue={v} /></div>
            ))}
          </div>
          <div className="grid grid-cols-4 gap-3 mb-3">
            {[
              ['Base ICMS', 'R$ 0,00'], ['Valor ICMS', 'R$ 0,00'],
              ['Base ICMS ST', 'R$ 0,00'], ['Valor ICMS ST', 'R$ 0,00'],
            ].map(([l, v]) => (
              <div key={l}><p className={FIELD_LABEL}>{l}</p><input className={INP + ' text-xs py-1'} defaultValue={v} /></div>
            ))}
          </div>
          <div className="grid grid-cols-4 gap-3 mb-3">
            {[
              ['Valor IPI', 'R$ 0,00'], ['Valor IPI Devolvido', 'R$ 0,00'],
              ['Valor ISSQN', 'R$ 0,00'], ['Despesas', 'R$ 0,00'],
            ].map(([l, v]) => (
              <div key={l}><p className={FIELD_LABEL}>{l}</p><input className={INP + ' text-xs py-1'} defaultValue={v} /></div>
            ))}
          </div>
          <div className="grid grid-cols-4 gap-3 mb-1">
            <div><p className={FIELD_LABEL}>Desconto</p><input className={INP + ' text-xs py-1'} defaultValue="0,00" /></div>
            <div><p className={FIELD_LABEL}>Nº Itens</p><input className={INP + ' text-xs py-1'} disabled value={itens.length} /></div>
            <div><p className={FIELD_LABEL}>Total da Nota</p><input className={INP + ' text-xs py-1 font-semibold'} disabled value={`R$ ${totalProdutos.toFixed(2)}`} /></div>
          </div>
        </Section>

        {/* Transportador */}
        <Section title="Transportador / Volumes">
          <div className="grid grid-cols-4 gap-4">
            <div>
              <label className={LBL}>Forma de envio</label>
              <div className="relative"><select className={SEL}><option>Não definida</option></select><ChevronDown size={12} className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none text-[var(--d2b-text-muted)]" /></div>
            </div>
            <div>
              <label className={LBL}>Peso Bruto (kg)</label>
              <input className={INP} defaultValue="0,000" />
            </div>
            <div>
              <label className={LBL}>Peso Líquido (kg)</label>
              <input className={INP} defaultValue="0,000" />
            </div>
            <div>
              <label className={LBL}>Enviar para expedição</label>
              <div className="relative"><select className={SEL}><option>Não</option><option>Sim</option></select><ChevronDown size={12} className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none text-[var(--d2b-text-muted)]" /></div>
            </div>
          </div>
        </Section>

        {/* Pagamento */}
        <Section title="Pagamento">
          <div className="max-w-xs mb-4">
            <label className={LBL}>Forma de recebimento</label>
            <div className="relative">
              <select className={SEL} value={formaRecebimento} onChange={e => setFormaRecebimento(e.target.value)}>
                <option>Dinheiro</option><option>Cartão de Crédito</option><option>Boleto</option><option>PIX</option>
              </select>
              <ChevronDown size={12} className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none text-[var(--d2b-text-muted)]" />
            </div>
          </div>
          <div className="flex items-center gap-2 p-3 rounded-xl border border-[var(--d2b-border)] bg-[var(--d2b-bg-elevated)] text-xs text-[var(--d2b-text-secondary)]">
            <span className="px-1.5 py-0.5 rounded text-[10px] font-bold bg-[#7C4DFF] text-white">Novidade</span>
            Agora você pode receber com link de pagamento pela conta digital da olist
          </div>
        </Section>

        {/* Dados adicionais */}
        <Section title="Dados adicionais">
          <div className="grid grid-cols-2 gap-4 mb-4">
            <div>
              <label className={LBL}>Depósito</label>
              <div className="relative">
                <select className={SEL} value={deposito} onChange={e => setDeposito(e.target.value)}>
                  <option>Geral</option>
                </select>
                <ChevronDown size={12} className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none text-[var(--d2b-text-muted)]" />
              </div>
            </div>
          </div>
          <div className="mb-3">
            <label className={LBL}>Observações</label>
            <textarea className="w-full bg-[var(--d2b-bg-main)] border border-[var(--d2b-border-strong)] rounded-md px-3 py-2 text-sm text-[var(--d2b-text-primary)] focus:outline-none focus:border-[#7C4DFF] transition-colors resize-none" rows={2} value={observacoes} onChange={e => setObservacoes(e.target.value)} />
          </div>
          <div className="mb-3">
            <label className={LBL}>Marcadores</label>
            <input className={INP} placeholder="Separados por vírgula ou tab" />
          </div>
        </Section>
      </div>

      <div className="px-8 py-5 border-t border-[var(--d2b-border)] bg-[var(--d2b-bg-surface)] flex items-center gap-3">
        <button onClick={onBack} className={BTN_PRIMARY}>salvar</button>
        <button onClick={onBack} className="text-sm text-[var(--d2b-text-secondary)] hover:text-[var(--d2b-text-primary)]">cancelar</button>
      </div>
    </div>
  )
}

// ─── Detalhe NF ───────────────────────────────────────────────────────────────
function NFDetalhe({ nf, onBack }: { nf: NotaFiscal; onBack: () => void }) {
  const [showNFe, setShowNFe] = useState(false)

  return (
    <div className="flex flex-col h-full">
      <div className="flex items-center justify-between px-8 pt-5 pb-3 border-b border-[var(--d2b-border)]">
        <div className="flex items-center gap-3">
          <button onClick={onBack} className="text-xs text-[var(--d2b-text-muted)] hover:text-[var(--d2b-text-primary)]">← voltar</button>
          <span className="text-xs text-[var(--d2b-text-muted)]">início ≡ vendas notas fiscais</span>
        </div>
        <div className="flex items-center gap-2">
          <button className={BTN_OUTLINE + ' text-xs py-1'}>enviar código de rastreio</button>
          <button className={BTN_OUTLINE + ' text-xs py-1'}>compartilhar</button>
          <button onClick={() => setShowNFe(true)} className={BTN_OUTLINE + ' text-xs py-1'}>autorizar no SEFAZ</button>
          <button className={BTN_PRIMARY + ' text-xs py-1.5'}>editar</button>
          <button className={BTN_OUTLINE + ' text-xs py-1'}><MoreHorizontal size={13} /></button>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto px-8 py-6 max-w-4xl">
        {/* Warning homologação */}
        <div className="flex items-center gap-2 p-3 rounded-xl bg-yellow-500/5 border border-yellow-500/20 mb-4">
          <AlertTriangle size={14} className="text-yellow-400" />
          <p className="text-xs text-[var(--d2b-text-secondary)]">Você está no ambiente para testes de notas fiscais.</p>
        </div>

        <h2 className="text-xl font-semibold text-[var(--d2b-text-primary)] mb-1">Nota fiscal</h2>
        <div className="flex items-center gap-2 mb-5 text-xs text-[var(--d2b-text-muted)]">
          <span>V</span><span>C</span><span>C</span>
          <span className={`px-2 py-0.5 rounded-full font-medium ${SITUACAO_COLORS[nf.situacao]}`}>● {nf.situacao.toLowerCase()}</span>
        </div>

        <div className="grid grid-cols-4 gap-4 mb-4 pb-4 border-b border-[var(--d2b-border)]">
          <Field label="Tipo de Saída"  value="Emissão própria" />
          <Field label="Série"          value={nf.serie} />
          <Field label="Número"         value={nf.numero} />
          <Field label="Data emissão"   value={nf.dataEmissao} />
        </div>

        <div className="mb-4 pb-4 border-b border-[var(--d2b-border)]">
          <Field label="Natureza da operação" value="(NF-e) Venda de mercadorias de terceiros para consumidor final" />
          <div className="grid grid-cols-4 gap-4 mt-3">
            <Field label="Finalidade"               value="NF-e normal" />
            <Field label="Cód. regime tributário"   value="Simples nacional" />
            <Field label="Consumidor final"         value="Sim" />
            <Field label="Intermediador"            value="Sem intermediador" />
          </div>
        </div>

        <h3 className="text-sm font-semibold text-[var(--d2b-text-primary)] mb-3">Destinatário</h3>
        <div className="grid grid-cols-2 gap-4 mb-2">
          <div><Field label="Nome" value={nf.cliente} /></div>
        </div>
        <div className="grid grid-cols-4 gap-4 mb-2">
          <Field label="CEP"    value="54.410-010" />
          <Field label="Cidade" value="Jaboatão dos Guararapes" />
          <Field label="UF"     value="PE" />
        </div>
        <div className="grid grid-cols-2 gap-4 mb-4 pb-4 border-b border-[var(--d2b-border)]">
          <Field label="Endereço" value="Avenida Bernardo Vieira de Melo" />
          <Field label="Vendedor" value="JESSE" />
        </div>

        <h3 className="text-sm font-semibold text-[var(--d2b-text-primary)] mb-3">Produtos ou serviços</h3>
        <table className="w-full text-sm mb-6">
          <thead><tr className="border-b border-[var(--d2b-border)]">
            <th className={TH}>Nº</th>
            <th className={TH}>Descrição</th>
            <th className={TH}>Código (SKU)</th>
            <th className={TH}>Un</th>
            <th className={TH + ' text-right'}>Qtde</th>
            <th className={TH + ' text-right'}>Preço un</th>
            <th className={TH + ' text-right'}>Total</th>
          </tr></thead>
          <tbody>
            <tr className="border-b border-[var(--d2b-border)]">
              <td className="px-3 py-2 text-[var(--d2b-text-muted)]">1</td>
              <td className="px-3 py-2 text-[var(--d2b-text-primary)]">Teste</td>
              <td className="px-3 py-2 text-[var(--d2b-text-secondary)]">—</td>
              <td className="px-3 py-2 text-[var(--d2b-text-secondary)]">UNIDAD</td>
              <td className="px-3 py-2 text-right text-[var(--d2b-text-secondary)]">1,00</td>
              <td className="px-3 py-2 text-right text-[var(--d2b-text-secondary)]">15,00</td>
              <td className="px-3 py-2 text-right font-semibold text-[var(--d2b-text-primary)]">15,00</td>
            </tr>
          </tbody>
        </table>

        <div className="grid grid-cols-4 gap-3 mb-6">
          {[
            ['Total Produtos','R$ 15,00'], ['Total Serviços','R$ 0,00'], ['Valor do Frete','R$ 0,00'], ['Total da Nota', 'R$ 15,00'],
          ].map(([l, v]) => <Field key={l} label={l} value={v} />)}
        </div>
      </div>

      {showNFe && <DrawerNFe onClose={() => setShowNFe(false)} />}
    </div>
  )
}

// ─── Lista NF ─────────────────────────────────────────────────────────────────
function NFLista({
  notas,
  onNova,
  onDetalhe,
}: {
  notas: NotaFiscal[]
  onNova: () => void
  onDetalhe: (nf: NotaFiscal) => void
}) {
  const [busca, setBusca] = useState('')
  const STATUS_TABS = ['todas', 'pendentes', 'autorizadas', 'canceladas', 'rejeitadas']
  const [aba, setAba] = useState('todas')

  return (
    <div className="flex flex-col h-full">
      <div className="flex items-center justify-between px-8 pt-6 pb-2">
        <div className="text-xs text-[var(--d2b-text-muted)]">início ≡ vendas notas fiscais</div>
        <button onClick={onNova} className={BTN_PRIMARY}><Plus size={13} />nova nota fiscal</button>
      </div>
      <div className="px-8 pb-0">
        <h2 className="text-xl font-semibold text-[var(--d2b-text-primary)] mb-4">Notas Fiscais</h2>
        <div className="flex items-center gap-2 mb-3">
          <div className="flex items-center gap-1.5 border border-[var(--d2b-border-strong)] rounded-md bg-[var(--d2b-bg-main)] px-3 h-9 w-64">
            <input className="flex-1 bg-transparent text-sm text-[var(--d2b-text-primary)] placeholder:text-[var(--d2b-text-muted)] outline-none" placeholder="Buscar por cliente, número..." value={busca} onChange={e => setBusca(e.target.value)} />
            <Search size={13} className="text-[var(--d2b-text-muted)]" />
          </div>
        </div>
        <div className="flex border-b border-[var(--d2b-border)]">
          {STATUS_TABS.map(t => (
            <button key={t} onClick={() => setAba(t)} className={`px-4 py-2.5 text-sm border-b-2 transition-colors whitespace-nowrap ${aba === t ? 'border-[#7C4DFF] text-[#7C4DFF] font-semibold' : 'border-transparent text-[var(--d2b-text-muted)] hover:text-[var(--d2b-text-primary)]'}`}>
              {t}
            </button>
          ))}
        </div>
      </div>

      <div className="flex-1 overflow-y-auto px-8">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-[var(--d2b-border)]">
              <th className={TH}>Nº / Série</th>
              <th className={TH}>Cliente</th>
              <th className={TH}>Situação</th>
              <th className={TH}>Data emissão</th>
              <th className={TH + ' text-right'}>Total da nota</th>
              <th className="w-8" />
            </tr>
          </thead>
          <tbody>
            {notas.filter(n => !busca || n.cliente.toLowerCase().includes(busca.toLowerCase()) || n.numero.includes(busca)).map(n => (
              <tr key={n.id} onClick={() => onDetalhe(n)} className="border-b border-[var(--d2b-border)] hover:bg-[var(--d2b-hover)] cursor-pointer transition-colors">
                <td className="px-3 py-3 text-[var(--d2b-text-primary)] font-medium">{n.numero} / {n.serie}</td>
                <td className="px-3 py-3 text-[var(--d2b-text-secondary)]">{n.cliente}</td>
                <td className="px-3 py-3">
                  <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${SITUACAO_COLORS[n.situacao]}`}>{n.situacao}</span>
                </td>
                <td className="px-3 py-3 text-[var(--d2b-text-secondary)]">{n.dataEmissao}</td>
                <td className="px-3 py-3 text-right font-semibold text-[var(--d2b-text-primary)]">R${n.valor.toFixed(2)}</td>
                <td className="px-3 py-3"><MoreHorizontal size={14} className="text-[var(--d2b-text-muted)]" /></td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}

// ─── Export ──────────────────────────────────────────────────────────────────
export function NotasFiscaisContent() {
  const [notas,    setNotas]    = useState<NotaFiscal[]>(MOCK_NF)
  const [tela,     setTela]     = useState<Tela>('lista')
  const [editando, setEditando] = useState<NotaFiscal | null>(null)

  if (tela === 'form')    return <NFForm nf={editando ?? undefined} onBack={() => { setTela('lista'); setEditando(null) }} />
  if (tela === 'detalhe' && editando) return <NFDetalhe nf={editando} onBack={() => setTela('lista')} />

  return (
    <NFLista
      notas={notas}
      onNova={() => { setEditando(null); setTela('form') }}
      onDetalhe={nf => { setEditando(nf); setTela('detalhe') }}
    />
  )
}
