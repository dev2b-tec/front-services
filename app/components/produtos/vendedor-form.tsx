'use client'

import { useState } from 'react'
import { ArrowLeft, Save, X } from 'lucide-react'
import { useRouter } from 'next/navigation'

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
  'flex items-center gap-2 px-5 py-2.5 rounded-md text-sm font-bold text-white bg-[#7C4DFF] hover:bg-[#5B21B6] transition-colors'

const BTN_GHOST =
  'flex items-center gap-2 px-5 py-2.5 rounded-md text-sm font-medium text-[var(--d2b-text-secondary)] border border-[var(--d2b-border-strong)] hover:border-[#7C4DFF] hover:text-[var(--d2b-text-primary)] transition-colors'

const LBL = 'block text-xs font-medium text-[var(--d2b-text-secondary)] mb-1'

const SECTION_TITLE = 'text-sm font-semibold text-[var(--d2b-text-primary)] mb-4 mt-6'

// ─── Props ───────────────────────────────────────────────────────────────────
interface VendedorFormProps {
  id?: string
}

// ─── VendedorForm ─────────────────────────────────────────────────────────────
export function VendedorForm({ id }: VendedorFormProps) {
  const router  = useRouter()
  const isNovo  = !id

  // ── Dados principais
  const [nome,           setNome]           = useState('')
  const [fantasia,       setFantasia]       = useState('')
  const [codigo,         setCodigo]         = useState('')
  const [tipoPessoa,     setTipoPessoa]     = useState('Fisica')
  const [cnpj,           setCnpj]           = useState('')
  const [contribuinte,   setContribuinte]   = useState('Nao informado')
  const [inscEstadual,   setInscEstadual]   = useState('')
  const [cep,            setCep]            = useState('')
  const [cidade,         setCidade]         = useState('')
  const [uf,             setUf]             = useState('')
  const [endereco,       setEndereco]       = useState('')
  const [bairro,         setBairro]         = useState('')
  const [numero,         setNumero]         = useState('')
  const [complemento,    setComplemento]    = useState('')
  const [telefone,       setTelefone]       = useState('')
  const [celular,        setCelular]        = useState('')
  const [email,          setEmail]          = useState('')
  const [situacao,       setSituacao]       = useState('ativo-acesso')
  const [deposito,       setDeposito]       = useState('Padrao')
  const [emailComunic,   setEmailComunic]   = useState('')

  // ── Dados de acesso
  const [usuario, setUsuario] = useState('')

  // ── Restrições
  const [restricaoHorario, setRestricaoHorario] = useState(false)
  const [restricaoIP,      setRestricaoIP]      = useState(false)
  const [perfilContato,    setPerfilContato]    = useState('Qualquer perfil de contato')

  // ── Módulos
  const [modulos, setModulos] = useState<Record<string, boolean>>({
    clientes:          false,
    comissoes:         false,
    crm:               false,
    pedidosVenda:      false,
    pdv:               false,
    propostas:         false,
    relatorioPrecnos:  false,
    performance:       false,
    cotacaoFretes:     false,
    incluirProdutos:   false,
    emitirCobrancas:   false,
  })

  // ── Comissionamento
  const [regraComissao,      setRegraComissao]      = useState('liberacao-parcial')
  const [tipoComissao,       setTipoComissao]       = useState('fixa')
  const [aliquota,           setAliquota]           = useState('')
  const [desconsiderar,      setDesconsiderar]      = useState(false)

  // ── Observações
  const [observacoes, setObservacoes] = useState('')

  function toggleModulo(key: string) {
    setModulos(prev => ({ ...prev, [key]: !prev[key] }))
  }

  function handleVoltar() {
    router.push('/dashboard/cadastros')
  }

  return (
    <div className="flex flex-col h-full">

      {/* ── Barra de topo ── */}
      <div className="flex items-center gap-3 px-8 py-4 border-b border-[var(--d2b-border)] bg-[var(--d2b-bg-surface)]">
        <button onClick={handleVoltar} className="p-1.5 rounded-md hover:bg-[var(--d2b-hover)] transition-colors">
          <ArrowLeft size={18} className="text-[var(--d2b-text-secondary)]" />
        </button>
        <nav className="flex items-center gap-1 text-xs text-[var(--d2b-text-muted)]">
          <span>início</span>
          <span>›</span>
          <span>cadastros</span>
          <span>›</span>
          <span className="text-[var(--d2b-text-secondary)]">vendedores</span>
        </nav>
      </div>

      {/* ── Corpo do formulário ── */}
      <div className="flex-1 overflow-y-auto">
      <div className="max-w-4xl px-8 py-6">

        <h1 className="text-xl font-semibold text-[var(--d2b-text-primary)] mb-1">Vendedor</h1>
        <p className="text-sm text-[var(--d2b-text-muted)] mb-6">{isNovo ? 'Novo Vendedor' : 'Editar Vendedor'}</p>

        <div className="border-t border-[var(--d2b-border)]" />

        {/* ── Dados pessoais ── */}
        <p className={SECTION_TITLE}>Dados pessoais</p>

        <div className="grid grid-cols-3 gap-4 mb-4">
          <div className="col-span-2">
            <label className={LBL}>Nome</label>
            <input className={INP} placeholder="Nome completo do vendedor" value={nome} onChange={e => setNome(e.target.value)} />
          </div>
          <div>
            <label className={LBL}>Fantasia</label>
            <input className={INP} placeholder="Nome de fantasia ou apelido" value={fantasia} onChange={e => setFantasia(e.target.value)} />
          </div>
        </div>

        <div className="grid grid-cols-4 gap-4 mb-4">
          <div>
            <label className={LBL}>Tipo de Pessoa</label>
            <select className={SEL} value={tipoPessoa} onChange={e => setTipoPessoa(e.target.value)}>
              <option value="Fisica">Física</option>
              <option value="Juridica">Jurídica</option>
            </select>
          </div>
          <div>
            <label className={LBL}>CNPJ / CPF</label>
            <input className={INP} placeholder="000.000.000-00" value={cnpj} onChange={e => setCnpj(e.target.value)} />
          </div>
          <div>
            <label className={LBL}>Contribuinte</label>
            <select className={SEL} value={contribuinte} onChange={e => setContribuinte(e.target.value)}>
              <option value="Nao informado">Não informado</option>
              <option value="Contribuinte">Contribuinte</option>
              <option value="Nao contribuinte">Não contribuinte</option>
            </select>
          </div>
          <div>
            <label className={LBL}>Inscrição Estadual</label>
            <input className={INP} placeholder="Opcional" value={inscEstadual} onChange={e => setInscEstadual(e.target.value)} />
          </div>
        </div>

        <div className="grid grid-cols-4 gap-4 mb-4">
          <div>
            <label className={LBL}>CEP</label>
            <input className={INP} placeholder="00000-000" value={cep} onChange={e => setCep(e.target.value)} />
          </div>
          <div className="col-span-2">
            <label className={LBL}>Cidade</label>
            <input className={INP} placeholder="Cidade" value={cidade} onChange={e => setCidade(e.target.value)} />
          </div>
          <div>
            <label className={LBL}>UF</label>
            <select className={SEL} value={uf} onChange={e => setUf(e.target.value)}>
              <option value="">Selecione</option>
              {['AC','AL','AP','AM','BA','CE','DF','ES','GO','MA','MT','MS','MG','PA','PB','PR','PE','PI','RJ','RN','RS','RO','RR','SC','SP','SE','TO'].map(s => (
                <option key={s} value={s}>{s}</option>
              ))}
            </select>
          </div>
        </div>

        <div className="grid grid-cols-1 gap-4 mb-4">
          <div>
            <label className={LBL}>Endereço</label>
            <input className={INP} placeholder="Rua, Avenida..." value={endereco} onChange={e => setEndereco(e.target.value)} />
          </div>
        </div>

        <div className="grid grid-cols-3 gap-4 mb-4">
          <div>
            <label className={LBL}>Bairro</label>
            <input className={INP} placeholder="Bairro" value={bairro} onChange={e => setBairro(e.target.value)} />
          </div>
          <div>
            <label className={LBL}>Número</label>
            <input className={INP} placeholder="Nº" value={numero} onChange={e => setNumero(e.target.value)} />
          </div>
          <div>
            <label className={LBL}>Complemento</label>
            <input className={INP} placeholder="Apto, Sala..." value={complemento} onChange={e => setComplemento(e.target.value)} />
          </div>
        </div>

        <div className="grid grid-cols-3 gap-4 mb-4">
          <div>
            <label className={LBL}>Telefone</label>
            <input className={INP} placeholder="(00) 0000-0000" value={telefone} onChange={e => setTelefone(e.target.value)} />
          </div>
          <div>
            <label className={LBL}>Celular</label>
            <input className={INP} placeholder="(00) 00000-0000" value={celular} onChange={e => setCelular(e.target.value)} />
          </div>
          <div>
            <label className={LBL}>Email</label>
            <input className={INP} type="email" placeholder="email@exemplo.com" value={email} onChange={e => setEmail(e.target.value)} />
          </div>
        </div>

        <div className="grid grid-cols-3 gap-4 mb-4">
          <div>
            <label className={LBL}>Situação</label>
            <select className={SEL} value={situacao} onChange={e => setSituacao(e.target.value)}>
              <option value="ativo-acesso">Ativo com acesso ao sistema</option>
              <option value="ativo">Ativo</option>
              <option value="inativo">Inativo</option>
            </select>
          </div>
          <div>
            <label className={LBL}>Depósito</label>
            <select className={SEL} value={deposito} onChange={e => setDeposito(e.target.value)}>
              <option value="Padrao">Padrão</option>
            </select>
          </div>
          <div>
            <label className={LBL}>E-mail para comunicações</label>
            <input className={INP} type="email" placeholder="Opcional" value={emailComunic} onChange={e => setEmailComunic(e.target.value)} />
          </div>
        </div>

        <div className="border-t border-[var(--d2b-border)] mt-6" />

        {/* ── Dados de acesso ── */}
        <p className={SECTION_TITLE}>Dados de acesso</p>
        <div className="max-w-xs mb-4">
          <label className={LBL}>Usuário do Sistema</label>
          <input className={INP} placeholder="Nome de usuário" value={usuario} onChange={e => setUsuario(e.target.value)} />
        </div>
        <p className="text-xs text-[var(--d2b-text-muted)] mb-4 bg-[var(--d2b-bg-elevated)] border border-[var(--d2b-border)] rounded-md px-3 py-2.5">
          Para realizar a alteração da senha de acesso, utilize a opção &ldquo;alterar senha de acesso&rdquo;, localizado no menu de contexto.
        </p>

        <div className="border-t border-[var(--d2b-border)] mt-6" />

        {/* ── Restrições de acesso ── */}
        <p className={SECTION_TITLE}>Restrições de acesso</p>
        <div className="flex flex-col gap-2 mb-4">
          <label className="flex items-center gap-2 text-sm text-[var(--d2b-text-secondary)] cursor-pointer">
            <input
              type="checkbox"
              className="w-4 h-4 rounded accent-[#7C4DFF] cursor-pointer"
              checked={restricaoHorario}
              onChange={e => setRestricaoHorario(e.target.checked)}
            />
            Acesso restrito por horário
          </label>
          <label className="flex items-center gap-2 text-sm text-[var(--d2b-text-secondary)] cursor-pointer">
            <input
              type="checkbox"
              className="w-4 h-4 rounded accent-[#7C4DFF] cursor-pointer"
              checked={restricaoIP}
              onChange={e => setRestricaoIP(e.target.checked)}
            />
            Acesso restrito por IP
          </label>
        </div>
        <div className="max-w-xs mb-4">
          <label className={LBL}>Pode acessar contatos com o perfil</label>
          <select className={SEL} value={perfilContato} onChange={e => setPerfilContato(e.target.value)}>
            <option value="Qualquer perfil de contato">Qualquer perfil de contato</option>
            <option value="Apenas contatos proprios">Apenas contatos próprios</option>
          </select>
        </div>

        <div className="border-t border-[var(--d2b-border)] mt-6" />

        {/* ── Módulos ── */}
        <p className={SECTION_TITLE}>Módulos que podem ser acessados pelo vendedor</p>
        <div className="grid grid-cols-2 gap-1.5 mb-4">
          {([
            ['clientes',         'Clientes'],
            ['comissoes',        'Comissões'],
            ['crm',              'CRM'],
            ['pedidosVenda',     'Pedidos de Venda'],
            ['pdv',              'PDV'],
            ['propostas',        'Propostas comerciais'],
            ['relatorioPrecnos', 'Relatório de Preços de Produtos'],
            ['performance',      'Performance de Vendas'],
            ['cotacaoFretes',    'Cotação de fretes'],
            ['incluirProdutos',  'Tem permissão para incluir produtos não cadastrados em pedidos de venda e propostas comerciais'],
            ['emitirCobrancas',  'Pode emitir cobranças'],
          ] as [string, string][]).map(([key, label]) => (
            <label key={key} className="flex items-start gap-2 text-sm text-[var(--d2b-text-secondary)] cursor-pointer">
              <input
                type="checkbox"
                className="w-4 h-4 rounded accent-[#7C4DFF] cursor-pointer mt-0.5"
                checked={modulos[key]}
                onChange={() => toggleModulo(key)}
              />
              {label}
            </label>
          ))}
        </div>

        <div className="border-t border-[var(--d2b-border)] mt-6" />

        {/* ── Comissionamento ── */}
        <p className={SECTION_TITLE}>Comissionamento</p>
        <div className="max-w-sm mb-4">
          <label className={LBL}>Regras para liberação de comissões</label>
          <select className={SEL} value={regraComissao} onChange={e => setRegraComissao(e.target.value)}>
            <option value="liberacao-parcial">Liberação parcial vinculada ao pagamento das parcelas</option>
            <option value="liberacao-total">Liberação total após quitação</option>
          </select>
        </div>
        <div className="flex flex-col gap-2 mb-4">
          <label className="flex items-center gap-2 text-sm text-[var(--d2b-text-secondary)] cursor-pointer">
            <input
              type="radio"
              name="tipoComissao"
              checked={tipoComissao === 'fixa'}
              onChange={() => setTipoComissao('fixa')}
            />
            Comissão com alíquota fixa
          </label>
          <label className="flex items-center gap-2 text-sm text-[var(--d2b-text-secondary)] cursor-pointer">
            <input
              type="radio"
              name="tipoComissao"
              checked={tipoComissao === 'descontos'}
              onChange={() => setTipoComissao('descontos')}
            />
            Comissão com alíquota conforme descontos
          </label>
        </div>
        <div className="max-w-xs mb-4">
          <label className={LBL}>Alíquota de comissão</label>
          <div className="relative">
            <input
              className={INP + ' pr-8'}
              placeholder="0,00"
              value={aliquota}
              onChange={e => setAliquota(e.target.value)}
            />
            <span className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-[var(--d2b-text-muted)]">%</span>
          </div>
        </div>
        <label className="flex items-center gap-2 text-sm text-[var(--d2b-text-secondary)] cursor-pointer mb-4">
          <input
            type="checkbox"
            className="w-4 h-4 rounded accent-[#7C4DFF] cursor-pointer"
            checked={desconsiderar}
            onChange={e => setDesconsiderar(e.target.checked)}
          />
          Desconsiderar comissionamento por linhas de produto para este vendedor
        </label>

        <div className="border-t border-[var(--d2b-border)] mt-6" />

        {/* ── Observações ── */}
        <p className={SECTION_TITLE}>Observações</p>
        <textarea
          className={INP + ' resize-none h-28'}
          placeholder="Observações gerais sobre o vendedor."
          value={observacoes}
          onChange={e => setObservacoes(e.target.value)}
        />

        {/* ── Ações ── */}
        <div className="flex items-center gap-3 mt-8 pb-8">
          <button className={BTN_PRIMARY}>
            <Save size={15} />
            salvar
          </button>
          <button onClick={handleVoltar} className={BTN_GHOST}>
            <X size={15} />
            cancelar
          </button>
        </div>
      </div>
      </div>
    </div>
  )
}
