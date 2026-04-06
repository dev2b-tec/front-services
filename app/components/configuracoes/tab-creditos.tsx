'use client'

import { useState, useEffect } from 'react'
import { CreditCard, ShoppingCart } from 'lucide-react'
import { useToast } from '@/hooks/use-toast'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import type { UsuarioData } from '@/app/dashboard/configuracoes/page'

interface TabCreditosProps {
  initialUsuario?: UsuarioData | null
}

interface HistoricoCredito {
  id: string
  quantidade: number
  valorPago: number
  status: string
  createdAt: string
}

export function TabCreditos({ initialUsuario }: TabCreditosProps) {
  const { toast } = useToast()
  const [saldo, setSaldo] = useState(0)
  const [historico, setHistorico] = useState<HistoricoCredito[]>([])
  const [loading, setLoading] = useState(true)
  
  // Dialog Comprar Créditos
  const [dialogComprarOpen, setDialogComprarOpen] = useState(false)
  const [etapa, setEtapa] = useState(1) // 1: Quantidade, 2: Dados Pagamento
  const [quantidade, setQuantidade] = useState(100)
  const [valorTotal, setValorTotal] = useState(15.00)
  
  // Dados do Pagador
  const [nomeCompleto, setNomeCompleto] = useState('')
  const [email, setEmail] = useState('')
  const [pais, setPais] = useState('BRA')
  const [numeroTelefone, setNumeroTelefone] = useState('')
  const [tipoDocumento, setTipoDocumento] = useState('CPF')
  const [numeroDocumento, setNumeroDocumento] = useState('')
  
  // Endereço de Cobrança
  const [logradouro, setLogradouro] = useState('')
  const [complemento, setComplemento] = useState('')
  const [bairro, setBairro] = useState('')
  const [cep, setCep] = useState('')
  
  // Método de Pagamento
  const [metodoPagamento, setMetodoPagamento] = useState('CARTAO_CREDITO')
  const [nomeCartao, setNomeCartao] = useState('')
  const [numeroCartao, setNumeroCartao] = useState('')
  const [cvv, setCvv] = useState('')
  const [expiracao, setExpiracao] = useState('')

  useEffect(() => {
    if (initialUsuario?.id) {
      carregarDados()
    }
  }, [initialUsuario?.id])

  useEffect(() => {
    // Cálculo simples: R$ 0,15 por crédito
    setValorTotal(quantidade * 0.15)
  }, [quantidade])

  const carregarDados = async () => {
    if (!initialUsuario?.id) return
    
    setLoading(true)
    try {
      // Carregar saldo
      const resSaldo = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/v1/creditos/saldo/usuario/${initialUsuario.id}`)
      if (resSaldo.ok) {
        const data = await resSaldo.json()
        setSaldo(data.saldo || 0)
      }

      // Carregar histórico
      const resHistorico = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/v1/creditos/historico/usuario/${initialUsuario.id}`)
      if (resHistorico.ok) {
        const data = await resHistorico.json()
        setHistorico(data)
      }
    } catch (error) {
      console.error('Erro ao carregar dados:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleAbrirDialogComprar = () => {
    setDialogComprarOpen(true)
    setEtapa(1)
    setQuantidade(100)
    
    // Preencher com dados do usuário se disponível
    if (initialUsuario) {
      setNomeCompleto(initialUsuario.nome || '')
      setEmail(initialUsuario.email || '')
    }
  }

  const handleProximo = () => {
    if (etapa === 1) {
      if (quantidade < 1) {
        toast({ title: 'Quantidade inválida', variant: 'destructive' })
        return
      }
      setEtapa(2)
    }
  }

  const handleFinalizar = async () => {
    if (!initialUsuario?.id) return

    if (!nomeCompleto || !email || !tipoDocumento || !numeroDocumento) {
      toast({ title: 'Preencha todos os campos obrigatórios', variant: 'destructive' })
      return
    }

    if (metodoPagamento === 'CARTAO_CREDITO' && (!nomeCartao || !numeroCartao || !cvv || !expiracao)) {
      toast({ title: 'Preencha os dados do cartão', variant: 'destructive' })
      return
    }

    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/v1/creditos/comprar`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          usuarioId: initialUsuario.id,
          quantidade,
          valorPago: valorTotal,
          dadosPagamento: {
            usuarioId: initialUsuario.id,
            nomeCompleto,
            email,
            pais,
            numeroTelefone,
            tipoDocumento,
            numeroDocumento,
            logradouro,
            complemento,
            bairro,
            cep,
            metodoPagamento,
            nomeCartao,
            numeroCartao,
            cvv,
            expiracao,
          }
        }),
      })

      if (res.ok) {
        toast({ title: 'Créditos comprados com sucesso!' })
        setDialogComprarOpen(false)
        carregarDados()
        limparFormulario()
      } else {
        toast({ title: 'Erro ao comprar créditos', variant: 'destructive' })
      }
    } catch (error) {
      console.error('Erro ao comprar créditos:', error)
      toast({ title: 'Erro ao comprar créditos', variant: 'destructive' })
    }
  }

  const limparFormulario = () => {
    setQuantidade(100)
    setNomeCompleto('')
    setEmail('')
    setPais('BRA')
    setNumeroTelefone('')
    setTipoDocumento('CPF')
    setNumeroDocumento('')
    setLogradouro('')
    setComplemento('')
    setBairro('')
    setCep('')
    setMetodoPagamento('CARTAO_CREDITO')
    setNomeCartao('')
    setNumeroCartao('')
    setCvv('')
    setExpiracao('')
  }

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-base font-bold text-[#F5F0FF]">Compra de Créditos</h2>
        <p className="text-xs text-[#A78BCC] mt-1">
          Gerencie as Permissões e a compra de créditos.
        </p>
      </div>

      {/* Permissões */}
      <div className="space-y-3">
        <h3 className="text-sm font-semibold text-[#F5F0FF]">Permissões de envio de mensagens</h3>
        
        <label className="flex items-center gap-3 p-3 rounded-lg border border-[rgba(124,77,255,0.25)] bg-[#120328] cursor-pointer hover:border-[#7C4DFF] transition-colors">
          <input type="checkbox" className="w-4 h-4 rounded border-[rgba(124,77,255,0.25)] bg-[#0D0520] text-[#7C4DFF] focus:ring-[#7C4DFF]" />
          <span className="text-sm text-[#F5F0FF]">Permitir envio no WhatsApp automático por <span className="text-[#7C4DFF]">profissionais</span> da clínica.</span>
        </label>

        <label className="flex items-center gap-3 p-3 rounded-lg border border-[rgba(124,77,255,0.25)] bg-[#120328] cursor-pointer hover:border-[#7C4DFF] transition-colors">
          <input type="checkbox" className="w-4 h-4 rounded border-[rgba(124,77,255,0.25)] bg-[#0D0520] text-[#7C4DFF] focus:ring-[#7C4DFF]" />
          <span className="text-sm text-[#F5F0FF]">Permitir envio no WhatsApp automático por <span className="text-[#7C4DFF]">assistentes</span> da clínica.</span>
        </label>
      </div>

      {/* Permissões de assinatura eletrônica */}
      <div className="space-y-3">
        <h3 className="text-sm font-semibold text-[#F5F0FF]">Permissões de assinatura eletrônica</h3>
        
        <label className="flex items-center gap-3 p-3 rounded-lg border border-[rgba(124,77,255,0.25)] bg-[#120328] cursor-pointer hover:border-[#7C4DFF] transition-colors">
          <input type="checkbox" className="w-4 h-4 rounded border-[rgba(124,77,255,0.25)] bg-[#0D0520] text-[#7C4DFF] focus:ring-[#7C4DFF]" />
          <span className="text-sm text-[#F5F0FF]">Permitir assinatura eletrônica por <span className="text-[#7C4DFF]">profissionais</span> da clínica.</span>
        </label>

        <label className="flex items-center gap-3 p-3 rounded-lg border border-[rgba(124,77,255,0.25)] bg-[#120328] cursor-pointer hover:border-[#7C4DFF] transition-colors">
          <input type="checkbox" className="w-4 h-4 rounded border-[rgba(124,77,255,0.25)] bg-[#0D0520] text-[#7C4DFF] focus:ring-[#7C4DFF]" />
          <span className="text-sm text-[#F5F0FF]">Permitir assinatura eletrônica por <span className="text-[#7C4DFF]">assistentes</span> da clínica.</span>
        </label>
      </div>

      {/* Créditos */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="text-sm font-semibold text-[#F5F0FF]">Créditos</h3>
          <button
            onClick={handleAbrirDialogComprar}
            className="flex items-center gap-2 px-4 py-2 rounded-lg bg-[#7C4DFF] hover:bg-[#5B21B6] text-white text-sm font-semibold transition-colors"
          >
            <ShoppingCart size={16} />
            Comprar Créditos
          </button>
        </div>

        <p className="text-xs text-[#A78BCC]">
          Compre créditos para utilizar as funcionalidades de envio de mensagem e assinatura eletrônica.
        </p>

        {/* Cards de Créditos */}
        <div className="grid grid-cols-3 gap-4">
          <div className="p-6 rounded-xl border border-[rgba(124,77,255,0.25)] bg-[#120328]">
            <p className="text-xs text-[#A78BCC] mb-2">Total créditos disponíveis para uso</p>
            <p className="text-3xl font-bold text-[#F5F0FF]">{saldo}</p>
          </div>

          <div className="p-6 rounded-xl border border-[rgba(124,77,255,0.25)] bg-[#120328]">
            <p className="text-xs text-[#A78BCC] mb-2">Créditos comprados</p>
            <p className="text-3xl font-bold text-[#F5F0FF]">{saldo}</p>
          </div>

          <div className="p-6 rounded-xl border border-[rgba(124,77,255,0.25)] bg-[#120328]">
            <p className="text-xs text-[#A78BCC] mb-2">Créditos vão expirar de produtividade</p>
            <p className="text-3xl font-bold text-[#F5F0FF]">0</p>
          </div>

          <div className="p-6 rounded-xl border border-[rgba(124,77,255,0.25)] bg-[#120328]">
            <p className="text-xs text-[#A78BCC] mb-2">Créditos comerciais, aguardando confirmação do pagamento</p>
            <p className="text-3xl font-bold text-[#F5F0FF]">0</p>
          </div>
        </div>
      </div>

      {/* Dialog Comprar Créditos */}
      <Dialog open={dialogComprarOpen} onOpenChange={setDialogComprarOpen}>
        <DialogContent className="max-w-2xl bg-[#0D0520] border border-[rgba(124,77,255,0.25)]">
          <DialogHeader>
            <DialogTitle className="text-lg font-bold text-[#F5F0FF]">Comprar Créditos</DialogTitle>
          </DialogHeader>

          {etapa === 1 ? (
            <div className="space-y-4 pt-2">
              <p className="text-sm text-[#A78BCC]">
                Compre créditos para poder programar o disparo de suas mensagens e assinar documentos eletronicamente.
              </p>

              <ul className="text-xs text-[#A78BCC] space-y-1 pl-5 list-disc">
                <li>1 mensagem: 1 crédito;</li>
                <li>1 documento assinado: 10 créditos;</li>
              </ul>

              <div className="space-y-2">
                <label className="block text-sm font-medium text-[#F5F0FF]">Número de Créditos</label>
                <input
                  type="number"
                  value={quantidade}
                  onChange={(e) => setQuantidade(parseInt(e.target.value) || 0)}
                  min="1"
                  className="w-full px-3 py-2 rounded-lg border border-[rgba(124,77,255,0.25)] bg-[#120328] text-[#F5F0FF] text-sm focus:outline-none focus:border-[#7C4DFF]"
                />
              </div>

              <div className="p-4 rounded-lg bg-[#120328] border border-[rgba(124,77,255,0.25)]">
                <p className="text-sm text-[#A78BCC]">Valor A Pagar</p>
                <p className="text-2xl font-bold text-[#7C4DFF]">R$ {valorTotal.toFixed(2)}</p>
              </div>

              <div className="flex items-center justify-end gap-3">
                <button
                  onClick={() => setDialogComprarOpen(false)}
                  className="px-4 py-2 rounded-lg border border-[rgba(124,77,255,0.25)] text-[#A78BCC] text-sm font-semibold"
                >
                  Cancelar
                </button>
                <button
                  onClick={handleProximo}
                  className="px-6 py-2 rounded-lg bg-[#7C4DFF] hover:bg-[#5B21B6] text-white text-sm font-semibold"
                >
                  Próximo
                </button>
              </div>
            </div>
          ) : (
            <div className="space-y-4 pt-2 max-h-[70vh] overflow-y-auto">
              <div className="p-4 rounded-lg bg-[#120328] border border-[rgba(124,77,255,0.25)]">
                <p className="text-sm text-[#A78BCC]">Detalhes da compra</p>
                <p className="text-sm text-[#F5F0FF]">{quantidade} créditos</p>
                <p className="text-lg font-bold text-[#7C4DFF]">Valor: R$ {valorTotal.toFixed(2)}</p>
              </div>

              {/* Informações do Pagador */}
              <div className="space-y-3">
                <h4 className="text-sm font-semibold text-[#F5F0FF]">Informações do Pagador</h4>
                
                <div className="grid grid-cols-2 gap-3">
                  <input
                    type="text"
                    value={nomeCompleto}
                    onChange={(e) => setNomeCompleto(e.target.value)}
                    placeholder="Nome Completo*"
                    className="px-3 py-2 rounded-lg border border-[rgba(124,77,255,0.25)] bg-[#120328] text-[#F5F0FF] text-sm placeholder:text-[#6B4E8A] focus:outline-none focus:border-[#7C4DFF]"
                  />
                  
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="Email*"
                    className="px-3 py-2 rounded-lg border border-[rgba(124,77,255,0.25)] bg-[#120328] text-[#F5F0FF] text-sm placeholder:text-[#6B4E8A] focus:outline-none focus:border-[#7C4DFF]"
                  />
                </div>

                <div className="grid grid-cols-3 gap-3">
                  <select
                    value={pais}
                    onChange={(e) => setPais(e.target.value)}
                    className="px-3 py-2 rounded-lg border border-[rgba(124,77,255,0.25)] bg-[#120328] text-[#F5F0FF] text-sm focus:outline-none focus:border-[#7C4DFF]"
                  >
                    <option value="BRA">Brasil</option>
                  </select>

                  <input
                    type="text"
                    value={numeroTelefone}
                    onChange={(e) => setNumeroTelefone(e.target.value)}
                    placeholder="Número do Telefone"
                    className="px-3 py-2 rounded-lg border border-[rgba(124,77,255,0.25)] bg-[#120328] text-[#F5F0FF] text-sm placeholder:text-[#6B4E8A] focus:outline-none focus:border-[#7C4DFF]"
                  />

                  <select
                    value={tipoDocumento}
                    onChange={(e) => setTipoDocumento(e.target.value)}
                    className="px-3 py-2 rounded-lg border border-[rgba(124,77,255,0.25)] bg-[#120328] text-[#F5F0FF] text-sm focus:outline-none focus:border-[#7C4DFF]"
                  >
                    <option value="CPF">CPF</option>
                    <option value="CNPJ">CNPJ</option>
                  </select>
                </div>

                <input
                  type="text"
                  value={numeroDocumento}
                  onChange={(e) => setNumeroDocumento(e.target.value)}
                  placeholder="Número do Documento*"
                  className="w-full px-3 py-2 rounded-lg border border-[rgba(124,77,255,0.25)] bg-[#120328] text-[#F5F0FF] text-sm placeholder:text-[#6B4E8A] focus:outline-none focus:border-[#7C4DFF]"
                />
              </div>

              {/* Endereço de Cobrança */}
              <div className="space-y-3">
                <h4 className="text-sm font-semibold text-[#F5F0FF]">Endereço de Cobrança</h4>
                
                <input
                  type="text"
                  value={cep}
                  onChange={(e) => setCep(e.target.value)}
                  placeholder="CEP"
                  className="w-full px-3 py-2 rounded-lg border border-[rgba(124,77,255,0.25)] bg-[#120328] text-[#F5F0FF] text-sm placeholder:text-[#6B4E8A] focus:outline-none focus:border-[#7C4DFF]"
                />

                <div className="grid grid-cols-2 gap-3">
                  <input
                    type="text"
                    value={logradouro}
                    onChange={(e) => setLogradouro(e.target.value)}
                    placeholder="Logradouro"
                    className="px-3 py-2 rounded-lg border border-[rgba(124,77,255,0.25)] bg-[#120328] text-[#F5F0FF] text-sm placeholder:text-[#6B4E8A] focus:outline-none focus:border-[#7C4DFF]"
                  />
                  
                  <input
                    type="text"
                    value={complemento}
                    onChange={(e) => setComplemento(e.target.value)}
                    placeholder="Complemento"
                    className="px-3 py-2 rounded-lg border border-[rgba(124,77,255,0.25)] bg-[#120328] text-[#F5F0FF] text-sm placeholder:text-[#6B4E8A] focus:outline-none focus:border-[#7C4DFF]"
                  />
                </div>

                <input
                  type="text"
                  value={bairro}
                  onChange={(e) => setBairro(e.target.value)}
                  placeholder="Bairro"
                  className="w-full px-3 py-2 rounded-lg border border-[rgba(124,77,255,0.25)] bg-[#120328] text-[#F5F0FF] text-sm placeholder:text-[#6B4E8A] focus:outline-none focus:border-[#7C4DFF]"
                />
              </div>

              {/* Método de Pagamento */}
              <div className="space-y-3">
                <h4 className="text-sm font-semibold text-[#F5F0FF]">Método de Pagamento</h4>
                
                <div className="flex items-center gap-4">
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="radio"
                      name="metodo"
                      value="CARTAO_CREDITO"
                      checked={metodoPagamento === 'CARTAO_CREDITO'}
                      onChange={(e) => setMetodoPagamento(e.target.value)}
                      className="w-4 h-4 text-[#7C4DFF] focus:ring-[#7C4DFF]"
                    />
                    <span className="text-sm text-[#F5F0FF]">Cartão de Crédito</span>
                  </label>

                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="radio"
                      name="metodo"
                      value="BOLETO"
                      checked={metodoPagamento === 'BOLETO'}
                      onChange={(e) => setMetodoPagamento(e.target.value)}
                      className="w-4 h-4 text-[#7C4DFF] focus:ring-[#7C4DFF]"
                    />
                    <span className="text-sm text-[#F5F0FF]">Boleto Bancário</span>
                  </label>

                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="radio"
                      name="metodo"
                      value="PIX"
                      checked={metodoPagamento === 'PIX'}
                      onChange={(e) => setMetodoPagamento(e.target.value)}
                      className="w-4 h-4 text-[#7C4DFF] focus:ring-[#7C4DFF]"
                    />
                    <span className="text-sm text-[#F5F0FF]">PIX</span>
                  </label>
                </div>

                {metodoPagamento === 'CARTAO_CREDITO' && (
                  <div className="space-y-3 pt-2">
                    <input
                      type="text"
                      value={nomeCartao}
                      onChange={(e) => setNomeCartao(e.target.value)}
                      placeholder="Nome no Cartão*"
                      className="w-full px-3 py-2 rounded-lg border border-[rgba(124,77,255,0.25)] bg-[#120328] text-[#F5F0FF] text-sm placeholder:text-[#6B4E8A] focus:outline-none focus:border-[#7C4DFF]"
                    />

                    <input
                      type="text"
                      value={numeroCartao}
                      onChange={(e) => setNumeroCartao(e.target.value)}
                      placeholder="Número Completo*"
                      className="w-full px-3 py-2 rounded-lg border border-[rgba(124,77,255,0.25)] bg-[#120328] text-[#F5F0FF] text-sm placeholder:text-[#6B4E8A] focus:outline-none focus:border-[#7C4DFF]"
                    />

                    <div className="grid grid-cols-2 gap-3">
                      <input
                        type="text"
                        value={cvv}
                        onChange={(e) => setCvv(e.target.value)}
                        placeholder="CVV*"
                        maxLength={4}
                        className="px-3 py-2 rounded-lg border border-[rgba(124,77,255,0.25)] bg-[#120328] text-[#F5F0FF] text-sm placeholder:text-[#6B4E8A] focus:outline-none focus:border-[#7C4DFF]"
                      />
                      
                      <input
                        type="text"
                        value={expiracao}
                        onChange={(e) => setExpiracao(e.target.value)}
                        placeholder="Expiração (MM/AAAA)*"
                        className="px-3 py-2 rounded-lg border border-[rgba(124,77,255,0.25)] bg-[#120328] text-[#F5F0FF] text-sm placeholder:text-[#6B4E8A] focus:outline-none focus:border-[#7C4DFF]"
                      />
                    </div>
                  </div>
                )}
              </div>

              <div className="flex items-center justify-end gap-3 pt-4">
                <button
                  onClick={() => setEtapa(1)}
                  className="px-4 py-2 rounded-lg border border-[rgba(124,77,255,0.25)] text-[#A78BCC] text-sm font-semibold"
                >
                  Voltar
                </button>
                <button
                  onClick={handleFinalizar}
                  className="px-6 py-2 rounded-lg bg-[#7C4DFF] hover:bg-[#5B21B6] text-white text-sm font-semibold"
                >
                  Finalizar
                </button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  )
}
