'use client'

import { useState, useEffect, useRef } from 'react'
import { ArrowRight, ArrowLeft, Check, AlertCircle, Upload, FileText, X, Pencil, Trash2 } from 'lucide-react'
import { useToast } from '@/hooks/use-toast'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import type { EmpresaData } from '@/app/dashboard/configuracoes/page'

interface TabNfseProps {
  initialEmpresa?: EmpresaData | null
}

interface ConfiguracaoNfse {
  id?: string
  cnpj: string
  razaoSocial: string
  nomeFantasia: string
  dataAbertura: string
  situacao: string
  uf: string
  municipio: string
  logradouro: string
  numero: string
  complemento: string
  bairro: string
  cep: string
  email: string
  telefone: string
  validadoReceita: boolean
}

export function TabNfse({ initialEmpresa }: TabNfseProps) {
  const { toast } = useToast()
  const [loading, setLoading] = useState(true)
  const [configuracao, setConfiguracao] = useState<ConfiguracaoNfse | null>(null)
  
  // Wizard states
  const [wizardCompleto, setWizardCompleto] = useState(false)
  const [passoAtual, setPassoAtual] = useState(1)
  const [cnpjInput, setCnpjInput] = useState('')
  const [consultando, setConsultando] = useState(false)
  
  // Aba ativa (após wizard)
  const [abaAtiva, setAbaAtiva] = useState('dados')
  
  // Lista de CNAEs
  const [cnaes, setCnaes] = useState<any[]>([])
  const [loadingCnaes, setLoadingCnaes] = useState(false)
  
  // Dialog CNAE
  const [dialogCnaeOpen, setDialogCnaeOpen] = useState(false)
  const [cnaeEditando, setCnaeEditando] = useState<any>(null)
  const [codigoCnae, setCodigoCnae] = useState('')
  const [tipoTributacao, setTipoTributacao] = useState('MUNICIPIO')
  const [discriminacaoServicos, setDiscriminacaoServicos] = useState('')
  const [codigoFederal, setCodigoFederal] = useState('')
  const [codigoMunicipal, setCodigoMunicipal] = useState('')
  const [issRetido, setIssRetido] = useState(false)
  const [irRetido, setIrRetido] = useState(false)
  const [inssRetido, setInssRetido] = useState(false)
  const [csllRetido, setCsllRetido] = useState(false)
  const [pisRetido, setPisRetido] = useState(false)
  const [cofinsRetido, setCofinsRetido] = useState(false)
  const [aliquotaIss, setAliquotaIss] = useState('0')
  const [aliquotaInss, setAliquotaInss] = useState('0')
  const [aliquotaIr, setAliquotaIr] = useState('0')
  const [aliquotaCsll, setAliquotaCsll] = useState('0')
  const [aliquotaPis, setAliquotaPis] = useState('0')
  const [aliquotaCofins, setAliquotaCofins] = useState('0')
  const [cnaePadrao, setCnaePadrao] = useState(false)
  const [cnaeAtivo, setCnaeAtivo] = useState(true)
  
  // Upload certificado
  const fileInputRef = useRef<HTMLInputElement>(null)
  const [certificadoFile, setCertificadoFile] = useState<File | null>(null)
  const [senhaCertificado, setSenhaCertificado] = useState('')
  const [uploadando, setUploadando] = useState(false)

  useEffect(() => {
    if (initialEmpresa?.id) {
      carregarConfiguracao()
    }
  }, [initialEmpresa?.id])

  useEffect(() => {
    if (configuracao?.validadoReceita) {
      setWizardCompleto(true)
      carregarCnaes()
    }
  }, [configuracao])

  const carregarCnaes = async () => {
    if (!initialEmpresa?.id) return
    
    setLoadingCnaes(true)
    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/v1/cnae/empresa/${initialEmpresa.id}`)
      if (res.ok) {
        const data = await res.json()
        setCnaes(data)
      }
    } catch (error) {
      console.error('Erro ao carregar CNAEs:', error)
    } finally {
      setLoadingCnaes(false)
    }
  }

  const handleDeletarCnae = async (id: string) => {
    if (!confirm('Tem certeza que deseja excluir este CNAE?')) return

    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/v1/cnae/${id}`, {
        method: 'DELETE',
      })

      if (res.ok) {
        toast({ title: 'CNAE excluído com sucesso!' })
        carregarCnaes()
      }
    } catch (error) {
      toast({ title: 'Erro ao excluir CNAE', variant: 'destructive' })
    }
  }

  const carregarConfiguracao = async () => {
    if (!initialEmpresa?.id) return
    
    setLoading(true)
    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/v1/configuracoes-nfse/empresa/${initialEmpresa.id}`)
      if (res.ok) {
        const data: ConfiguracaoNfse = await res.json()
        setConfiguracao(data)
        setCnpjInput(data.cnpj || '')
      }
    } catch (error) {
      console.error('Erro ao carregar configuração:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleConsultarReceita = async () => {
    if (!cnpjInput.trim() || !initialEmpresa?.id) {
      toast({ title: 'Digite um CNPJ válido', variant: 'destructive' })
      return
    }

    setConsultando(true)
    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/v1/configuracoes-nfse/consultar-cnpj`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          empresaId: initialEmpresa.id,
          cnpj: cnpjInput,
        }),
      })

      if (res.ok) {
        const data: ConfiguracaoNfse = await res.json()
        setConfiguracao(data)
        setWizardCompleto(true)
        toast({ 
          title: 'Configuração concluída!', 
          description: 'Dados da empresa foram salvos com sucesso.'
        })
      } else {
        toast({ 
          title: 'CNPJ inválido ou não encontrado', 
          description: 'Verifique o CNPJ digitado e tente novamente.',
          variant: 'destructive' 
        })
      }
    } catch (error) {
      console.error('Erro ao consultar CNPJ:', error)
      toast({ 
        title: 'Erro ao consultar Receita Federal', 
        description: 'Tente novamente em alguns instantes.',
        variant: 'destructive' 
      })
    } finally {
      setConsultando(false)
    }
  }

  const proximoPasso = () => {
    if (passoAtual < 5) setPassoAtual(passoAtual + 1)
  }

  const passoAnterior = () => {
    if (passoAtual > 1) setPassoAtual(passoAtual - 1)
  }

  const finalizarWizard = () => {
    handleConsultarReceita()
  }
  
  const handleUploadCertificado = () => {
    fileInputRef.current?.click()
  }
  
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      // Validar tamanho (2MB)
      if (file.size > 2 * 1024 * 1024) {
        toast({ 
          title: 'Arquivo muito grande', 
          description: 'O tamanho máximo é 2MB',
          variant: 'destructive' 
        })
        return
      }
      
      // Validar extensão
      const ext = file.name.split('.').pop()?.toLowerCase()
      if (ext !== 'p12' && ext !== 'pfx') {
        toast({ 
          title: 'Formato inválido', 
          description: 'O certificado deve estar no formato .p12 ou .pfx',
          variant: 'destructive' 
        })
        return
      }
      
      setCertificadoFile(file)
      toast({ 
        title: 'Certificado selecionado', 
        description: file.name 
      })
    }
  }
  
  const handleSalvarCertificado = async () => {
    if (!certificadoFile) {
      toast({ title: 'Selecione um certificado', variant: 'destructive' })
      return
    }
    
    if (!senhaCertificado.trim()) {
      toast({ title: 'Digite a senha do certificado', variant: 'destructive' })
      return
    }
    
    if (!initialEmpresa?.id) {
      toast({ title: 'Empresa não identificada', variant: 'destructive' })
      return
    }
    
    setUploadando(true)
    try {
      const formData = new FormData()
      formData.append('empresaId', initialEmpresa.id)
      formData.append('file', certificadoFile)
      formData.append('senha', senhaCertificado)

      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/v1/certificado-digital/upload`, {
        method: 'POST',
        body: formData,
      })

      if (res.ok) {
        toast({ 
          title: 'Certificado salvo com sucesso!',
          description: 'O certificado digital foi carregado.'
        })
        // Limpar formulário
        setCertificadoFile(null)
        setSenhaCertificado('')
      } else {
        const error = await res.text()
        toast({ 
          title: 'Erro ao salvar certificado',
          description: error || 'Tente novamente',
          variant: 'destructive' 
        })
      }
    } catch (error) {
      console.error('Erro ao salvar certificado:', error)
      toast({ 
        title: 'Erro ao salvar certificado', 
        variant: 'destructive' 
      })
    } finally {
      setUploadando(false)
    }
  }
  
  const limparFormCnae = () => {
    setCnaeEditando(null)
    setCodigoCnae('')
    setTipoTributacao('MUNICIPIO')
    setDiscriminacaoServicos('')
    setCodigoFederal('')
    setCodigoMunicipal('')
    setIssRetido(false)
    setIrRetido(false)
    setInssRetido(false)
    setCsllRetido(false)
    setPisRetido(false)
    setCofinsRetido(false)
    setAliquotaIss('0')
    setAliquotaInss('0')
    setAliquotaIr('0')
    setAliquotaCsll('0')
    setAliquotaPis('0')
    setAliquotaCofins('0')
    setCnaePadrao(false)
    setCnaeAtivo(true)
  }
  
  const handleEditarCnae = (cnae: any) => {
    setCnaeEditando(cnae)
    setCodigoCnae(cnae.codigoCnae || '')
    setTipoTributacao(cnae.tipoTributacao || 'MUNICIPIO')
    setDiscriminacaoServicos(cnae.discriminacaoServicos || '')
    setCodigoFederal(cnae.codigoFederal || '')
    setCodigoMunicipal(cnae.codigoMunicipal || '')
    setIssRetido(cnae.issRetido || false)
    setIrRetido(cnae.irRetido || false)
    setInssRetido(cnae.inssRetido || false)
    setCsllRetido(cnae.csllRetido || false)
    setPisRetido(cnae.pisRetido || false)
    setCofinsRetido(cnae.cofinsRetido || false)
    setAliquotaIss(cnae.aliquotaIss?.toString() || '0')
    setAliquotaInss(cnae.aliquotaInss?.toString() || '0')
    setAliquotaIr(cnae.aliquotaIr?.toString() || '0')
    setAliquotaCsll(cnae.aliquotaCsll?.toString() || '0')
    setAliquotaPis(cnae.aliquotaPis?.toString() || '0')
    setAliquotaCofins(cnae.aliquotaCofins?.toString() || '0')
    setCnaePadrao(cnae.padrao || false)
    setCnaeAtivo(cnae.ativo !== undefined ? cnae.ativo : true)
    setDialogCnaeOpen(true)
  }

  const handleSalvarCnae = async () => {
    if (!codigoCnae.trim()) {
      toast({ title: 'Código CNAE é obrigatório', variant: 'destructive' })
      return
    }
    
    if (!initialEmpresa?.id && !cnaeEditando) {
      toast({ title: 'Empresa não identificada', variant: 'destructive' })
      return
    }
    
    try {
      const payload = {
        empresaId: initialEmpresa?.id,
        codigoCnae,
        tipoTributacao,
        discriminacaoServicos,
        codigoFederal,
        codigoMunicipal,
        issRetido,
        irRetido,
        inssRetido,
        csllRetido,
        pisRetido,
        cofinsRetido,
        aliquotaIss,
        aliquotaInss,
        aliquotaIr,
        aliquotaCsll,
        aliquotaPis,
        aliquotaCofins,
        padrao: cnaePadrao,
        ativo: cnaeAtivo,
      }

      const url = cnaeEditando 
        ? `${process.env.NEXT_PUBLIC_API_URL}/api/v1/cnae/${cnaeEditando.id}`
        : `${process.env.NEXT_PUBLIC_API_URL}/api/v1/cnae`
      
      const method = cnaeEditando ? 'PATCH' : 'POST'

      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      })

      if (res.ok) {
        toast({ title: cnaeEditando ? 'CNAE atualizado com sucesso!' : 'CNAE salvo com sucesso!' })
        setDialogCnaeOpen(false)
        limparFormCnae()
        carregarCnaes()
      } else {
        const error = await res.text()
        toast({ 
          title: cnaeEditando ? 'Erro ao atualizar CNAE' : 'Erro ao salvar CNAE',
          description: error || 'Tente novamente',
          variant: 'destructive' 
        })
      }
    } catch (error) {
      console.error('Erro ao salvar CNAE:', error)
      toast({ title: 'Erro ao salvar CNAE', variant: 'destructive' })
    }
  }

  const formatCnpj = (value: string) => {
    const numbers = value.replace(/\D/g, '')
    if (numbers.length <= 14) {
      return numbers
        .replace(/^(\d{2})(\d)/, '$1.$2')
        .replace(/^(\d{2})\.(\d{3})(\d)/, '$1.$2.$3')
        .replace(/\.(\d{3})(\d)/, '.$1/$2')
        .replace(/(\d{4})(\d)/, '$1-$2')
    }
    return value
  }

  if (loading) {
    return <div className="p-8 text-center text-[var(--d2b-text-secondary)]">Carregando...</div>
  }

  // Wizard de configuração inicial
  if (!wizardCompleto) {
    return (
      <div className="max-w-4xl mx-auto space-y-8">
        {/* Header */}
        <div className="text-center">
          <h2 className="text-xl font-bold text-[var(--d2b-text-primary)]">Vamos começar!</h2>
        </div>

        {/* Progress Bar */}
        <div className="flex items-center justify-center gap-4">
          {[1, 2, 3, 4, 5].map((step) => (
            <div key={step} className="flex items-center gap-2">
              <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold ${
                step < passoAtual ? 'bg-[#7C4DFF] text-white' :
                step === passoAtual ? 'bg-[#7C4DFF] text-white' :
                'bg-[var(--d2b-bg-surface)] text-[var(--d2b-text-muted)] border border-[var(--d2b-border-strong)]'
              }`}>
                {step < passoAtual ? <Check size={16} /> : step}
              </div>
              {step < 5 && (
                <div className={`w-24 h-0.5 ${
                  step < passoAtual ? 'bg-[#7C4DFF]' : 'bg-[var(--d2b-hover)]'
                }`} />
              )}
            </div>
          ))}
        </div>

        {/* Conteúdo do Passo */}
        <div className="min-h-[300px] flex flex-col items-center justify-center p-8">
          {passoAtual === 1 && (
            <div className="text-center space-y-6 max-w-2xl">
              <div className="flex items-center justify-center gap-2 text-[#22C55E]">
                <Check size={20} />
                <p className="text-sm font-semibold">Suas clínicas devem ter CNPJ cadastrado e regulado na receita federal.</p>
              </div>
            </div>
          )}

          {passoAtual === 2 && (
            <div className="text-center space-y-6 max-w-2xl">
              <div className="flex items-center justify-center gap-2 text-[#22C55E]">
                <Check size={20} />
                <p className="text-sm font-semibold">Possuir certificado digital A1 e senha do certificado</p>
              </div>
            </div>
          )}

          {passoAtual === 3 && (
            <div className="text-center space-y-6 max-w-2xl">
              <div className="flex items-center justify-center gap-2 text-[#22C55E]">
                <Check size={20} />
                <p className="text-sm font-semibold">Verificar se a sua cidade tem integração conosco, caso não tenha, entre em contato conosco para integra-la.</p>
              </div>
            </div>
          )}

          {passoAtual === 4 && (
            <div className="text-center space-y-6 max-w-2xl">
              <div className="flex items-center justify-center gap-2 text-[#22C55E]">
                <Check size={20} />
                <p className="text-sm font-semibold">Caso já tenha emitido notas fiscais, saber a série e a última nota emitida.</p>
              </div>
            </div>
          )}

          {passoAtual === 5 && (
            <div className="text-center space-y-6 max-w-2xl">
              <div className="flex items-center justify-center gap-2 text-[#22C55E]">
                <Check size={20} />
                <p className="text-sm font-semibold">Ver todos os dados cadastrados dos pacientes preenchidos.</p>
              </div>
            </div>
          )}
        </div>

        {/* Botões de Navegação */}
        <div className="flex items-center justify-center gap-4">
          {passoAtual > 1 && (
            <button
              onClick={passoAnterior}
              className="flex items-center gap-2 px-6 py-2 rounded-lg border border-[var(--d2b-border-strong)] text-[var(--d2b-text-secondary)] hover:text-[#7C4DFF] hover:border-[#7C4DFF] text-sm font-semibold transition-colors"
            >
              <ArrowLeft size={16} />
              Voltar
            </button>
          )}

          {passoAtual < 5 ? (
            <button
              onClick={proximoPasso}
              className="flex items-center gap-2 px-6 py-2 rounded-lg bg-[#7C4DFF] hover:bg-[#5B21B6] text-white text-sm font-semibold transition-colors"
            >
              Próximo
              <ArrowRight size={16} />
            </button>
          ) : (
            <button
              onClick={() => setPassoAtual(6)}
              className="flex items-center gap-2 px-6 py-2 rounded-lg bg-[#7C4DFF] hover:bg-[#5B21B6] text-white text-sm font-semibold transition-colors"
            >
              Finalizar
              <Check size={16} />
            </button>
          )}
        </div>

        {/* Formulário de Busca CNPJ (Passo 6) */}
        {passoAtual === 6 && (
          <div className="space-y-6 max-w-2xl mx-auto">
            <div className="text-center">
              <h3 className="text-lg font-bold text-[var(--d2b-text-primary)] mb-2">Buscar dados da sua empresa na Receita Federal</h3>
              <p className="text-sm text-[var(--d2b-text-secondary)]">
                Para iniciar a configuração da Nota Fiscal de Serviço Eletrônica (NFS-e), precisamos buscar os dados oficiais da sua empresa na Receita Federal. Digite o CNPJ da clínica abaixo para prosseguir automaticamente todas as informações necessárias.
              </p>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-semibold text-[var(--d2b-text-primary)] mb-2">CNPJ da Clínica*</label>
                <input
                  type="text"
                  value={formatCnpj(cnpjInput)}
                  onChange={(e) => setCnpjInput(e.target.value.replace(/\D/g, ''))}
                  placeholder="00.000.000/0000-00"
                  maxLength={18}
                  className="w-full px-4 py-3 rounded-lg border border-[var(--d2b-border-strong)] bg-[var(--d2b-bg-surface)] text-[var(--d2b-text-primary)] text-sm placeholder:text-[var(--d2b-text-muted)] focus:outline-none focus:border-[#7C4DFF]"
                />
                <p className="text-xs text-[var(--d2b-text-muted)] mt-2">* Todos dados do que será necessário validar os dados com seus clientes</p>
              </div>

              <div className="p-4 rounded-lg border border-[rgba(59,130,246,0.25)] bg-[rgba(59,130,246,0.05)]">
                <div className="flex items-start gap-3">
                  <AlertCircle size={20} className="text-[#3B82F6] mt-0.5 shrink-0" />
                  <div>
                    <p className="text-sm font-semibold text-[#3B82F6] mb-1">Processo obrigatório:</p>
                    <p className="text-xs text-[var(--d2b-text-secondary)]">
                      O busca automática é necessário para prosseguir com as dados oficiais da sua empresa (razão social, endereço e afins) que estão na Receita Federal. Este processo garante a integração adequada com os sistemas governamentais para emissão da NFS-e.
                    </p>
                  </div>
                </div>
              </div>

              <div className="flex items-center justify-center gap-4 pt-4">
                <button
                  onClick={() => setPassoAtual(5)}
                  className="flex items-center gap-2 px-6 py-2 rounded-lg border border-[var(--d2b-border-strong)] text-[var(--d2b-text-secondary)] hover:text-[#7C4DFF] hover:border-[#7C4DFF] text-sm font-semibold transition-colors"
                >
                  <ArrowLeft size={16} />
                  Voltar
                </button>
                <button
                  onClick={finalizarWizard}
                  disabled={consultando || !cnpjInput}
                  className="flex items-center gap-2 px-6 py-3 rounded-lg bg-[#7C4DFF] hover:bg-[#5B21B6] text-white text-sm font-semibold transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {consultando ? 'Consultando...' : 'Consultar Receita Federal'}
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    )
  }

  // Tela final com abas (após wizard completo)
  return (
    <div className="space-y-6">
      {/* Abas */}
      <div className="flex items-center gap-1 border-b border-[var(--d2b-border-strong)]">
        <button
          onClick={() => setAbaAtiva('dados')}
          className={`px-4 py-2 text-sm font-semibold transition-colors ${
            abaAtiva === 'dados'
              ? 'text-[#7C4DFF] border-b-2 border-[#7C4DFF]'
              : 'text-[var(--d2b-text-secondary)] hover:text-[var(--d2b-text-primary)]'
          }`}
        >
          Dados da clínica / Nota
        </button>
        <button
          onClick={() => setAbaAtiva('certificado')}
          className={`px-4 py-2 text-sm font-semibold transition-colors ${
            abaAtiva === 'certificado'
              ? 'text-[#7C4DFF] border-b-2 border-[#7C4DFF]'
              : 'text-[var(--d2b-text-secondary)] hover:text-[var(--d2b-text-primary)]'
          }`}
        >
          Certificado digital
        </button>
        <button
          onClick={() => setAbaAtiva('cnae')}
          className={`px-4 py-2 text-sm font-semibold transition-colors ${
            abaAtiva === 'cnae'
              ? 'text-[#7C4DFF] border-b-2 border-[#7C4DFF]'
              : 'text-[var(--d2b-text-secondary)] hover:text-[var(--d2b-text-primary)]'
          }`}
        >
          CNAE e dados fiscais
        </button>
      </div>

      {/* Conteúdo das Abas */}
      {abaAtiva === 'dados' && configuracao && (
        <div className="space-y-6">
          <h3 className="text-base font-bold text-[var(--d2b-text-primary)]">Dados da empresa para NFS-e</h3>
          
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs text-[var(--d2b-text-secondary)] mb-2">Nome Fantasia*</label>
              <input
                type="text"
                value={configuracao.nomeFantasia || ''}
                readOnly
                className="w-full px-3 py-2 rounded-lg border border-[var(--d2b-border-strong)] bg-[var(--d2b-bg-surface)] text-[var(--d2b-text-primary)] text-sm"
              />
            </div>

            <div>
              <label className="block text-xs text-[var(--d2b-text-secondary)] mb-2">Razão Social*</label>
              <input
                type="text"
                value={configuracao.razaoSocial || ''}
                readOnly
                className="w-full px-3 py-2 rounded-lg border border-[var(--d2b-border-strong)] bg-[var(--d2b-bg-surface)] text-[var(--d2b-text-primary)] text-sm"
              />
            </div>

            <div>
              <label className="block text-xs text-[var(--d2b-text-secondary)] mb-2">CNPJ*</label>
              <input
                type="text"
                value={formatCnpj(configuracao.cnpj)}
                readOnly
                className="w-full px-3 py-2 rounded-lg border border-[var(--d2b-border-strong)] bg-[var(--d2b-bg-surface)] text-[var(--d2b-text-primary)] text-sm"
              />
            </div>

            <div>
              <label className="block text-xs text-[var(--d2b-text-secondary)] mb-2">Inscrição Estadual</label>
              <input
                type="text"
                placeholder="-"
                className="w-full px-3 py-2 rounded-lg border border-[var(--d2b-border-strong)] bg-[var(--d2b-bg-surface)] text-[var(--d2b-text-primary)] text-sm"
              />
            </div>

            <div>
              <label className="block text-xs text-[var(--d2b-text-secondary)] mb-2">Inscrição Municipal*</label>
              <input
                type="text"
                placeholder="-"
                className="w-full px-3 py-2 rounded-lg border border-[var(--d2b-border-strong)] bg-[var(--d2b-bg-surface)] text-[var(--d2b-text-primary)] text-sm"
              />
            </div>

            <div>
              <label className="block text-xs text-[var(--d2b-text-secondary)] mb-2">E-mail*</label>
              <input
                type="email"
                value={configuracao.email || ''}
                className="w-full px-3 py-2 rounded-lg border border-[var(--d2b-border-strong)] bg-[var(--d2b-bg-surface)] text-[var(--d2b-text-primary)] text-sm"
              />
            </div>
          </div>

          <div>
            <h4 className="text-sm font-semibold text-[var(--d2b-text-primary)] mb-4">Endereço</h4>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-xs text-[var(--d2b-text-secondary)] mb-2">CEP*</label>
                <input
                  type="text"
                  value={configuracao.cep || ''}
                  readOnly
                  className="w-full px-3 py-2 rounded-lg border border-[var(--d2b-border-strong)] bg-[var(--d2b-bg-surface)] text-[var(--d2b-text-primary)] text-sm"
                />
              </div>

              <div>
                <label className="block text-xs text-[var(--d2b-text-secondary)] mb-2">UF*</label>
                <input
                  type="text"
                  value={configuracao.uf || ''}
                  readOnly
                  className="w-full px-3 py-2 rounded-lg border border-[var(--d2b-border-strong)] bg-[var(--d2b-bg-surface)] text-[var(--d2b-text-primary)] text-sm"
                />
              </div>

              <div className="col-span-2">
                <label className="block text-xs text-[var(--d2b-text-secondary)] mb-2">Cidade*</label>
                <input
                  type="text"
                  value={configuracao.municipio || ''}
                  readOnly
                  className="w-full px-3 py-2 rounded-lg border border-[var(--d2b-border-strong)] bg-[var(--d2b-bg-surface)] text-[var(--d2b-text-primary)] text-sm"
                />
              </div>

              <div className="col-span-2">
                <label className="block text-xs text-[var(--d2b-text-secondary)] mb-2">Logradouro*</label>
                <input
                  type="text"
                  value={configuracao.logradouro || ''}
                  readOnly
                  className="w-full px-3 py-2 rounded-lg border border-[var(--d2b-border-strong)] bg-[var(--d2b-bg-surface)] text-[var(--d2b-text-primary)] text-sm"
                />
              </div>

              <div>
                <label className="block text-xs text-[var(--d2b-text-secondary)] mb-2">Número*</label>
                <input
                  type="text"
                  value={configuracao.numero || ''}
                  readOnly
                  className="w-full px-3 py-2 rounded-lg border border-[var(--d2b-border-strong)] bg-[var(--d2b-bg-surface)] text-[var(--d2b-text-primary)] text-sm"
                />
              </div>

              <div>
                <label className="block text-xs text-[var(--d2b-text-secondary)] mb-2">Complemento</label>
                <input
                  type="text"
                  value={configuracao.complemento || ''}
                  className="w-full px-3 py-2 rounded-lg border border-[var(--d2b-border-strong)] bg-[var(--d2b-bg-surface)] text-[var(--d2b-text-primary)] text-sm"
                />
              </div>

              <div className="col-span-2">
                <label className="block text-xs text-[var(--d2b-text-secondary)] mb-2">Bairro*</label>
                <input
                  type="text"
                  value={configuracao.bairro || ''}
                  readOnly
                  className="w-full px-3 py-2 rounded-lg border border-[var(--d2b-border-strong)] bg-[var(--d2b-bg-surface)] text-[var(--d2b-text-primary)] text-sm"
                />
              </div>
            </div>
          </div>

          <div className="flex justify-end">
            <button className="px-6 py-2 rounded-lg bg-[#7C4DFF] hover:bg-[#5B21B6] text-white text-sm font-semibold transition-colors">
              Salvar alterações
            </button>
          </div>
        </div>
      )}

      {abaAtiva === 'certificado' && (
        <div className="space-y-6">
          <h3 className="text-base font-bold text-[var(--d2b-text-primary)]">Certificado digital</h3>
          
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-semibold text-[var(--d2b-text-primary)] mb-2">Certificado A1</label>
              <div className="flex items-center gap-3">
                <input
                  ref={fileInputRef}
                  type="file"
                  accept=".p12,.pfx"
                  onChange={handleFileChange}
                  className="hidden"
                />
                <button 
                  onClick={handleUploadCertificado}
                  className="flex items-center gap-2 px-4 py-2 rounded-lg bg-[#7C4DFF] hover:bg-[#5B21B6] text-white text-sm font-semibold transition-colors"
                >
                  <Upload size={16} />
                  Selecione o certificado A1
                </button>
                <span className="text-xs text-[var(--d2b-text-secondary)]">
                  {certificadoFile ? certificadoFile.name : 'No file chosen'}
                </span>
              </div>
            </div>

            <div>
              <label className="block text-sm font-semibold text-[var(--d2b-text-primary)] mb-2">Senha do certificado*</label>
              <input
                type="password"
                value={senhaCertificado}
                onChange={(e) => setSenhaCertificado(e.target.value)}
                placeholder="Digite a senha do certificado"
                className="w-full px-3 py-2 rounded-lg border border-[var(--d2b-border-strong)] bg-[var(--d2b-bg-surface)] text-[var(--d2b-text-primary)] text-sm placeholder:text-[var(--d2b-text-muted)] focus:outline-none focus:border-[#7C4DFF]"
              />
            </div>

            <div>
              <h4 className="text-sm font-semibold text-[var(--d2b-text-primary)] mb-3">Instruções</h4>
              <ul className="space-y-2 text-xs text-[var(--d2b-text-secondary)]">
                <li>• O certificado deve estar no formato .p12 ou .pfx</li>
                <li>• O tamanho máximo do arquivo é 2MB</li>
                <li>• Certifique-se de que a senha do certificado está correta</li>
                <li>• Após o upload, verifique se o certificado foi aceito sem erros</li>
                <li>• Em caso de dúvidas, consulte o suporte técnico</li>
              </ul>
            </div>

            {!certificadoFile ? (
              <div className="p-4 rounded-lg bg-[rgba(255,193,7,0.1)] border border-[rgba(255,193,7,0.25)]">
                <p className="text-sm font-semibold text-[#FFC107] mb-2">Nenhum certificado carregado.</p>
                <p className="text-xs text-[var(--d2b-text-secondary)]">Por favor, selecione um certificado para carregar.</p>
              </div>
            ) : (
              <div className="p-4 rounded-lg bg-[rgba(34,197,94,0.1)] border border-[rgba(34,197,94,0.25)]">
                <div className="flex items-center gap-2">
                  <Check size={16} className="text-[#22C55E]" />
                  <p className="text-sm font-semibold text-[#22C55E]">Certificado selecionado: {certificadoFile.name}</p>
                </div>
              </div>
            )}
          </div>

          <div className="flex justify-end">
            <button 
              onClick={handleSalvarCertificado}
              disabled={!certificadoFile || !senhaCertificado || uploadando}
              className="px-6 py-2 rounded-lg bg-[#7C4DFF] hover:bg-[#5B21B6] text-white text-sm font-semibold transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {uploadando ? 'Salvando...' : 'Salvar'}
            </button>
          </div>
        </div>
      )}

      {abaAtiva === 'cnae' && (
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <h3 className="text-base font-bold text-[var(--d2b-text-primary)]">CNAE e Dados Fiscais</h3>
            <button 
              onClick={() => {
                limparFormCnae()
                setDialogCnaeOpen(true)
              }}
              className="flex items-center gap-2 px-4 py-2 rounded-lg bg-[#7C4DFF] hover:bg-[#5B21B6] text-white text-sm font-semibold transition-colors"
            >
              <FileText size={16} />
              Novo CNAE
            </button>
          </div>

          {loadingCnaes ? (
            <div className="p-8 text-center text-[var(--d2b-text-secondary)]">Carregando...</div>
          ) : cnaes.length === 0 ? (
            <div className="p-8 text-center rounded-lg border border-dashed border-[var(--d2b-border-strong)] bg-[var(--d2b-bg-surface)]">
              <FileText size={48} className="mx-auto mb-4 text-[var(--d2b-text-muted)]" />
              <p className="text-sm text-[var(--d2b-text-secondary)]">Nenhum CNAE cadastrado</p>
              <p className="text-xs text-[var(--d2b-text-muted)] mt-2">Clique em "Novo CNAE" para adicionar</p>
            </div>
          ) : (
            <div className="space-y-3">
              {cnaes.map((cnae) => (
                <div
                  key={cnae.id}
                  className="flex items-center justify-between p-4 rounded-lg border border-[var(--d2b-border-strong)] bg-[var(--d2b-bg-surface)] hover:border-[var(--d2b-border-strong)] transition-colors"
                >
                  <div className="flex-1">
                    <div className="flex items-center gap-3">
                      <h4 className="text-sm font-semibold text-[var(--d2b-text-primary)]">{cnae.codigoCnae}</h4>
                      {cnae.padrao && (
                        <span className="text-xs px-2 py-0.5 rounded bg-[var(--d2b-hover)] text-[#7C4DFF]">Padrão</span>
                      )}
                      {!cnae.ativo && (
                        <span className="text-xs px-2 py-0.5 rounded bg-[rgba(239,68,68,0.15)] text-[#EF4444]">Inativo</span>
                      )}
                    </div>
                    {cnae.discriminacaoServicos && (
                      <p className="text-xs text-[var(--d2b-text-secondary)] mt-1 line-clamp-1">{cnae.discriminacaoServicos}</p>
                    )}
                    <div className="flex items-center gap-4 mt-2 text-xs text-[var(--d2b-text-muted)]">
                      {cnae.codigoFederal && <span>Federal: {cnae.codigoFederal}</span>}
                      {cnae.codigoMunicipal && <span>Municipal: {cnae.codigoMunicipal}</span>}
                      <span>ISS: {cnae.aliquotaIss}%</span>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => handleEditarCnae(cnae)}
                      className="p-2 rounded-lg hover:bg-[var(--d2b-hover)] text-[var(--d2b-text-secondary)] hover:text-[#7C4DFF] transition-colors"
                      title="Editar"
                    >
                      <Pencil size={16} />
                    </button>
                    <button
                      onClick={() => handleDeletarCnae(cnae.id)}
                      className="p-2 rounded-lg hover:bg-[rgba(239,68,68,0.15)] text-[var(--d2b-text-secondary)] hover:text-[#EF4444] transition-colors"
                      title="Excluir"
                    >
                      <Trash2 size={16} />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Dialog Novo CNAE */}
      <Dialog open={dialogCnaeOpen} onOpenChange={setDialogCnaeOpen}>
        <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto bg-[var(--d2b-bg-main)] border border-[var(--d2b-border-strong)]">
          <DialogHeader>
            <DialogTitle className="text-lg font-bold text-[var(--d2b-text-primary)]">
              {cnaeEditando ? 'Editar CNAE' : 'Novo CNAE'}
            </DialogTitle>
          </DialogHeader>

          <div className="space-y-4 pt-2">
            {/* Código CNAE */}
            <div>
              <label className="block text-xs text-[var(--d2b-text-secondary)] mb-2">Código CNAE*</label>
              <input
                type="text"
                value={codigoCnae}
                onChange={(e) => setCodigoCnae(e.target.value)}
                placeholder="Digite o código CNAE"
                className="w-full px-3 py-2 rounded-lg border border-[var(--d2b-border-strong)] bg-[var(--d2b-bg-surface)] text-[var(--d2b-text-primary)] text-sm placeholder:text-[var(--d2b-text-muted)] focus:outline-none focus:border-[#7C4DFF]"
              />
            </div>

            {/* Tipo de Tributação */}
            <div>
              <label className="block text-xs text-[var(--d2b-text-secondary)] mb-2">Tipo de Tributação</label>
              <select
                value={tipoTributacao}
                onChange={(e) => setTipoTributacao(e.target.value)}
                className="w-full px-3 py-2 rounded-lg border border-[var(--d2b-border-strong)] bg-[var(--d2b-bg-surface)] text-[var(--d2b-text-primary)] text-sm focus:outline-none focus:border-[#7C4DFF]"
              >
                <option value="MUNICIPIO">Tributação no município</option>
                <option value="FORA_MUNICIPIO">Tributação fora do município</option>
              </select>
            </div>

            {/* Discriminação dos Serviços */}
            <div>
              <label className="block text-xs text-[var(--d2b-text-secondary)] mb-2">Discriminação dos Serviços*</label>
              <textarea
                value={discriminacaoServicos}
                onChange={(e) => setDiscriminacaoServicos(e.target.value)}
                rows={4}
                className="w-full px-3 py-2 rounded-lg border border-[var(--d2b-border-strong)] bg-[var(--d2b-bg-surface)] text-[var(--d2b-text-primary)] text-sm placeholder:text-[var(--d2b-text-muted)] focus:outline-none focus:border-[#7C4DFF] resize-none"
              />
            </div>

            {/* Códigos Federal e Municipal */}
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-xs text-[var(--d2b-text-secondary)] mb-2">Código Federal do Serviço (LC 116/03)*</label>
                <input
                  type="text"
                  value={codigoFederal}
                  onChange={(e) => setCodigoFederal(e.target.value)}
                  className="w-full px-3 py-2 rounded-lg border border-[var(--d2b-border-strong)] bg-[var(--d2b-bg-surface)] text-[var(--d2b-text-primary)] text-sm focus:outline-none focus:border-[#7C4DFF]"
                />
              </div>

              <div>
                <label className="block text-xs text-[var(--d2b-text-secondary)] mb-2">Código Municipal do Serviço</label>
                <input
                  type="text"
                  value={codigoMunicipal}
                  onChange={(e) => setCodigoMunicipal(e.target.value)}
                  className="w-full px-3 py-2 rounded-lg border border-[var(--d2b-border-strong)] bg-[var(--d2b-bg-surface)] text-[var(--d2b-text-primary)] text-sm focus:outline-none focus:border-[#7C4DFF]"
                />
              </div>
            </div>

            {/* Retenções de Tributos */}
            <div>
              <h4 className="text-sm font-semibold text-[var(--d2b-text-primary)] mb-3">Retenções de Tributos</h4>
              <div className="grid grid-cols-3 gap-4">
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={issRetido}
                    onChange={(e) => setIssRetido(e.target.checked)}
                    className="w-4 h-4 rounded border-[var(--d2b-border-strong)] bg-[var(--d2b-bg-main)] text-[#7C4DFF] focus:ring-[#7C4DFF]"
                  />
                  <span className="text-sm text-[var(--d2b-text-primary)]">ISS Retido</span>
                </label>

                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={irRetido}
                    onChange={(e) => setIrRetido(e.target.checked)}
                    className="w-4 h-4 rounded border-[var(--d2b-border-strong)] bg-[var(--d2b-bg-main)] text-[#7C4DFF] focus:ring-[#7C4DFF]"
                  />
                  <span className="text-sm text-[var(--d2b-text-primary)]">IR Retido</span>
                </label>

                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={inssRetido}
                    onChange={(e) => setInssRetido(e.target.checked)}
                    className="w-4 h-4 rounded border-[var(--d2b-border-strong)] bg-[var(--d2b-bg-main)] text-[#7C4DFF] focus:ring-[#7C4DFF]"
                  />
                  <span className="text-sm text-[var(--d2b-text-primary)]">INSS Retido</span>
                </label>

                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={csllRetido}
                    onChange={(e) => setCsllRetido(e.target.checked)}
                    className="w-4 h-4 rounded border-[var(--d2b-border-strong)] bg-[var(--d2b-bg-main)] text-[#7C4DFF] focus:ring-[#7C4DFF]"
                  />
                  <span className="text-sm text-[var(--d2b-text-primary)]">CSLL Retido</span>
                </label>

                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={pisRetido}
                    onChange={(e) => setPisRetido(e.target.checked)}
                    className="w-4 h-4 rounded border-[var(--d2b-border-strong)] bg-[var(--d2b-bg-main)] text-[#7C4DFF] focus:ring-[#7C4DFF]"
                  />
                  <span className="text-sm text-[var(--d2b-text-primary)]">PIS Retido</span>
                </label>

                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={cofinsRetido}
                    onChange={(e) => setCofinsRetido(e.target.checked)}
                    className="w-4 h-4 rounded border-[var(--d2b-border-strong)] bg-[var(--d2b-bg-main)] text-[#7C4DFF] focus:ring-[#7C4DFF]"
                  />
                  <span className="text-sm text-[var(--d2b-text-primary)]">COFINS Retido</span>
                </label>
              </div>
            </div>

            {/* Alíquotas */}
            <div>
              <h4 className="text-sm font-semibold text-[var(--d2b-text-primary)] mb-3">Alíquotas (%)</h4>
              <div className="grid grid-cols-3 gap-4">
                <div>
                  <label className="block text-xs text-[var(--d2b-text-secondary)] mb-2">ISS (%)</label>
                  <input
                    type="number"
                    value={aliquotaIss}
                    onChange={(e) => setAliquotaIss(e.target.value)}
                    min="0"
                    max="100"
                    step="0.01"
                    className="w-full px-3 py-2 rounded-lg border border-[var(--d2b-border-strong)] bg-[var(--d2b-bg-surface)] text-[var(--d2b-text-primary)] text-sm focus:outline-none focus:border-[#7C4DFF]"
                  />
                </div>

                <div>
                  <label className="block text-xs text-[var(--d2b-text-secondary)] mb-2">INSS (%)</label>
                  <input
                    type="number"
                    value={aliquotaInss}
                    onChange={(e) => setAliquotaInss(e.target.value)}
                    min="0"
                    max="100"
                    step="0.01"
                    className="w-full px-3 py-2 rounded-lg border border-[var(--d2b-border-strong)] bg-[var(--d2b-bg-surface)] text-[var(--d2b-text-primary)] text-sm focus:outline-none focus:border-[#7C4DFF]"
                  />
                </div>

                <div>
                  <label className="block text-xs text-[var(--d2b-text-secondary)] mb-2">IR (%)</label>
                  <input
                    type="number"
                    value={aliquotaIr}
                    onChange={(e) => setAliquotaIr(e.target.value)}
                    min="0"
                    max="100"
                    step="0.01"
                    className="w-full px-3 py-2 rounded-lg border border-[var(--d2b-border-strong)] bg-[var(--d2b-bg-surface)] text-[var(--d2b-text-primary)] text-sm focus:outline-none focus:border-[#7C4DFF]"
                  />
                </div>

                <div>
                  <label className="block text-xs text-[var(--d2b-text-secondary)] mb-2">CSLL (%)</label>
                  <input
                    type="number"
                    value={aliquotaCsll}
                    onChange={(e) => setAliquotaCsll(e.target.value)}
                    min="0"
                    max="100"
                    step="0.01"
                    className="w-full px-3 py-2 rounded-lg border border-[var(--d2b-border-strong)] bg-[var(--d2b-bg-surface)] text-[var(--d2b-text-primary)] text-sm focus:outline-none focus:border-[#7C4DFF]"
                  />
                </div>

                <div>
                  <label className="block text-xs text-[var(--d2b-text-secondary)] mb-2">PIS (%)</label>
                  <input
                    type="number"
                    value={aliquotaPis}
                    onChange={(e) => setAliquotaPis(e.target.value)}
                    min="0"
                    max="100"
                    step="0.01"
                    className="w-full px-3 py-2 rounded-lg border border-[var(--d2b-border-strong)] bg-[var(--d2b-bg-surface)] text-[var(--d2b-text-primary)] text-sm focus:outline-none focus:border-[#7C4DFF]"
                  />
                </div>

                <div>
                  <label className="block text-xs text-[var(--d2b-text-secondary)] mb-2">COFINS (%)</label>
                  <input
                    type="number"
                    value={aliquotaCofins}
                    onChange={(e) => setAliquotaCofins(e.target.value)}
                    min="0"
                    max="100"
                    step="0.01"
                    className="w-full px-3 py-2 rounded-lg border border-[var(--d2b-border-strong)] bg-[var(--d2b-bg-surface)] text-[var(--d2b-text-primary)] text-sm focus:outline-none focus:border-[#7C4DFF]"
                  />
                </div>
              </div>
            </div>

            {/* Configurações */}
            <div>
              <h4 className="text-sm font-semibold text-[var(--d2b-text-primary)] mb-3">Configurações</h4>
              <div className="flex items-center gap-6">
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={cnaePadrao}
                    onChange={(e) => setCnaePadrao(e.target.checked)}
                    className="w-4 h-4 rounded border-[var(--d2b-border-strong)] bg-[var(--d2b-bg-main)] text-[#7C4DFF] focus:ring-[#7C4DFF]"
                  />
                  <span className="text-sm text-[var(--d2b-text-primary)]">CNAE Padrão</span>
                </label>

                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={cnaeAtivo}
                    onChange={(e) => setCnaeAtivo(e.target.checked)}
                    className="w-4 h-4 rounded border-[var(--d2b-border-strong)] bg-[var(--d2b-bg-main)] text-[#7C4DFF] focus:ring-[#7C4DFF]"
                  />
                  <span className="text-sm text-[var(--d2b-text-primary)]">Ativo</span>
                </label>
              </div>
            </div>

            {/* Botões */}
            <div className="flex items-center justify-end gap-3 pt-4">
              <button
                onClick={() => {
                  setDialogCnaeOpen(false)
                  limparFormCnae()
                }}
                className="px-6 py-2 rounded-lg border border-[var(--d2b-border-strong)] text-[var(--d2b-text-secondary)] hover:text-[#7C4DFF] hover:border-[#7C4DFF] text-sm font-semibold transition-colors"
              >
                Cancelar
              </button>
              <button
                onClick={handleSalvarCnae}
                className="px-6 py-2 rounded-lg bg-[#7C4DFF] hover:bg-[#5B21B6] text-white text-sm font-semibold transition-colors"
              >
                {cnaeEditando ? 'Atualizar' : 'Salvar'}
              </button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  )
}
