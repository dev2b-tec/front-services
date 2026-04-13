'use client'

import { useState, useEffect } from 'react'
import { ShoppingCart } from 'lucide-react'
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

const INP = 'w-full px-3 py-2.5 rounded-lg border border-gray-300 bg-white text-gray-900 text-sm placeholder:text-gray-400 focus:outline-none focus:border-[#7C4DFF] transition-colors'

function maskCpf(v: string) {
  return v.replace(/\D/g, '').slice(0, 11)
    .replace(/(\d{3})(\d)/, '$1.$2')
    .replace(/(\d{3})(\d)/, '$1.$2')
    .replace(/(\d{3})(\d{1,2})$/, '$1-$2')
}

function maskCnpj(v: string) {
  return v.replace(/\D/g, '').slice(0, 14)
    .replace(/(\d{2})(\d)/, '$1.$2')
    .replace(/(\d{3})(\d)/, '$1.$2')
    .replace(/(\d{3})(\d)/, '$1/$2')
    .replace(/(\d{4})(\d{1,2})$/, '$1-$2')
}

export function TabCreditos({ initialUsuario }: TabCreditosProps) {
  const { toast } = useToast()
  const [saldo, setSaldo] = useState(0)
  const [historico, setHistorico] = useState<HistoricoCredito[]>([])
  const [loading, setLoading] = useState(true)

  // Dialog
  const [dialogOpen, setDialogOpen] = useState(false)
  const [alterandoQtd, setAlterandoQtd] = useState(false)
  const [quantidade, setQuantidade] = useState(10)
  const valorTotal = quantidade * 0.15

  // Dados do Pagador
  const [nomeCompleto, setNomeCompleto] = useState('')
  const [email, setEmail] = useState('')
  const [pais, setPais] = useState('BRA')
  const [numeroTelefone, setNumeroTelefone] = useState('')
  const [tipoDocumento, setTipoDocumento] = useState('CPF')
  const [numeroDocumento, setNumeroDocumento] = useState('')

  function handleTipoDocumentoChange(tipo: string) {
    setTipoDocumento(tipo)
    setNumeroDocumento('')
  }

  function handleNumeroDocumentoChange(raw: string) {
    setNumeroDocumento(tipoDocumento === 'CPF' ? maskCpf(raw) : maskCnpj(raw))
  }

  // Endereço de Cobrança
  const [cep, setCep] = useState('')
  const [logradouro, setLogradouro] = useState('')
  const [numero, setNumero] = useState('')
  const [complemento, setComplemento] = useState('')
  const [bairro, setBairro] = useState('')

  // Método de Pagamento
  const [metodoPagamento, setMetodoPagamento] = useState<'CARTAO_CREDITO' | 'BOLETO' | 'PIX'>('CARTAO_CREDITO')
  const [numeroCartao, setNumeroCartao] = useState('')
  const [nomeCartao, setNomeCartao] = useState('')
  const [cvv, setCvv] = useState('')
  const [expiracao, setExpiracao] = useState('')
  const [salvando, setSalvando] = useState(false)

  useEffect(() => {
    if (initialUsuario?.id) carregarDados()
  }, [initialUsuario?.id])

  const carregarDados = async () => {
    if (!initialUsuario?.id) return
    setLoading(true)
    try {
      const resSaldo = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/v1/creditos/saldo/usuario/${initialUsuario.id}`)
      if (resSaldo.ok) { const d = await resSaldo.json(); setSaldo(d.saldo || 0) }
      const resHist = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/v1/creditos/historico/usuario/${initialUsuario.id}`)
      if (resHist.ok) { const d = await resHist.json(); setHistorico(d) }
    } catch {}
    finally { setLoading(false) }
  }

  function abrirDialog() {
    setNomeCompleto(initialUsuario?.nome ?? '')
    setEmail(initialUsuario?.email ?? '')
    setPais('BRA'); setNumeroTelefone(''); setTipoDocumento('CPF'); setNumeroDocumento('')
    setCep(''); setLogradouro(''); setNumero(''); setComplemento(''); setBairro('')
    setMetodoPagamento('CARTAO_CREDITO'); setNumeroCartao(''); setNomeCartao(''); setCvv(''); setExpiracao('')
    setAlterandoQtd(false)
    setDialogOpen(true)
  }

  async function handleFinalizar() {
    if (!nomeCompleto || !email || !numeroDocumento) {
      toast({ title: 'Preencha todos os campos obrigatórios', variant: 'destructive' }); return
    }
    if (metodoPagamento === 'CARTAO_CREDITO' && (!nomeCartao || !numeroCartao || !cvv || !expiracao)) {
      toast({ title: 'Preencha os dados do cartão', variant: 'destructive' }); return
    }
    setSalvando(true)
    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/v1/creditos/comprar`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          usuarioId: initialUsuario?.id,
          quantidade, valorPago: valorTotal,
          dadosPagamento: { usuarioId: initialUsuario?.id, nomeCompleto, email, pais, numeroTelefone, tipoDocumento, numeroDocumento, logradouro, numero, complemento, bairro, cep, metodoPagamento, nomeCartao, numeroCartao, cvv, expiracao },
        }),
      })
      if (res.ok) {
        toast({ title: 'Créditos comprados com sucesso!' })
        setDialogOpen(false)
        carregarDados()
      } else {
        toast({ title: 'Erro ao comprar créditos', variant: 'destructive' })
      }
    } catch {
      toast({ title: 'Erro ao comprar créditos', variant: 'destructive' })
    } finally { setSalvando(false) }
  }

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-base font-bold text-[var(--d2b-text-primary)]">Compra de Créditos</h2>
        <p className="text-xs text-[var(--d2b-text-secondary)] mt-1">Gerencie as Permissões e a compra de créditos.</p>
      </div>

      {/* Permissões de mensagens */}
      <div className="space-y-3">
        <h3 className="text-sm font-semibold text-[var(--d2b-text-primary)]">Permissões de envio de mensagens</h3>
        <label className="flex items-center gap-3 p-3 rounded-lg border border-[var(--d2b-border-strong)] bg-[var(--d2b-bg-surface)] cursor-pointer hover:border-[#7C4DFF] transition-colors">
          <input type="checkbox" className="w-4 h-4 rounded border-[var(--d2b-border-strong)] bg-[var(--d2b-bg-main)] text-[#7C4DFF] focus:ring-[#7C4DFF]" />
          <span className="text-sm text-[var(--d2b-text-primary)]">Permitir envio no WhatsApp automático por <span className="text-[#7C4DFF]">profissionais</span> da clínica.</span>
        </label>
        <label className="flex items-center gap-3 p-3 rounded-lg border border-[var(--d2b-border-strong)] bg-[var(--d2b-bg-surface)] cursor-pointer hover:border-[#7C4DFF] transition-colors">
          <input type="checkbox" className="w-4 h-4 rounded border-[var(--d2b-border-strong)] bg-[var(--d2b-bg-main)] text-[#7C4DFF] focus:ring-[#7C4DFF]" />
          <span className="text-sm text-[var(--d2b-text-primary)]">Permitir envio no WhatsApp automático por <span className="text-[#7C4DFF]">assistentes</span> da clínica.</span>
        </label>
      </div>

      {/* Permissões de assinatura */}
      <div className="space-y-3">
        <h3 className="text-sm font-semibold text-[var(--d2b-text-primary)]">Permissões de assinatura eletrônica</h3>
        <label className="flex items-center gap-3 p-3 rounded-lg border border-[var(--d2b-border-strong)] bg-[var(--d2b-bg-surface)] cursor-pointer hover:border-[#7C4DFF] transition-colors">
          <input type="checkbox" className="w-4 h-4 rounded border-[var(--d2b-border-strong)] bg-[var(--d2b-bg-main)] text-[#7C4DFF] focus:ring-[#7C4DFF]" />
          <span className="text-sm text-[var(--d2b-text-primary)]">Permitir assinatura eletrônica por <span className="text-[#7C4DFF]">profissionais</span> da clínica.</span>
        </label>
        <label className="flex items-center gap-3 p-3 rounded-lg border border-[var(--d2b-border-strong)] bg-[var(--d2b-bg-surface)] cursor-pointer hover:border-[#7C4DFF] transition-colors">
          <input type="checkbox" className="w-4 h-4 rounded border-[var(--d2b-border-strong)] bg-[var(--d2b-bg-main)] text-[#7C4DFF] focus:ring-[#7C4DFF]" />
          <span className="text-sm text-[var(--d2b-text-primary)]">Permitir assinatura eletrônica por <span className="text-[#7C4DFF]">assistentes</span> da clínica.</span>
        </label>
      </div>

      {/* Créditos */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="text-sm font-semibold text-[var(--d2b-text-primary)]">Créditos</h3>
          <button onClick={abrirDialog} className="flex items-center gap-2 px-4 py-2 rounded-lg bg-[#7C4DFF] hover:bg-[#5B21B6] text-white text-sm font-semibold transition-colors">
            <ShoppingCart size={16} /> Comprar Créditos
          </button>
        </div>
        <p className="text-xs text-[var(--d2b-text-secondary)]">Compre créditos para utilizar as funcionalidades de envio de mensagens e assinatura eletrônica.</p>
        <div className="grid grid-cols-4 gap-4">
          {[
            { label: 'Total créditos disponíveis para uso', value: saldo, highlight: true },
            { label: 'Créditos comprados', value: saldo, highlight: false },
            { label: 'Créditos vão expirar de produtividade', value: 0, highlight: false },
            { label: 'Créditos comerciais, aguardando confirmação do pagamento', value: 0, highlight: false },
          ].map(({ label, value, highlight }) => (
            <div key={label} className={`p-5 rounded-xl border ${highlight ? 'border-[#7C4DFF] bg-[var(--d2b-hover)]' : 'border-[var(--d2b-border-strong)] bg-[var(--d2b-bg-surface)]'}`}>
              <p className="text-xs text-[var(--d2b-text-secondary)] mb-2 leading-tight">{label}</p>
              <p className={`text-3xl font-bold ${highlight ? 'text-[#7C4DFF]' : 'text-[var(--d2b-text-primary)]'}`}>{value}</p>
            </div>
          ))}
        </div>
        <div className="flex justify-end pt-2 border-t border-[var(--d2b-border)]">
          <button className="px-5 py-2 bg-[#7C4DFF] hover:bg-[#5B21B6] text-white text-sm font-semibold rounded-lg transition-colors">Salvar</button>
        </div>
      </div>

      {/* ── Dialog Comprar Créditos ── */}
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="max-w-[737px] bg-white border border-gray-200 text-gray-900 p-0 gap-0 overflow-hidden">
          <DialogHeader className="px-6 pt-6 pb-4 border-b border-gray-100">
            <DialogTitle className="text-base font-bold text-gray-900">Comprar Créditos</DialogTitle>
          </DialogHeader>

          <div className="overflow-y-auto max-h-[78vh] px-6 py-5 flex flex-col gap-5">

            {/* Detalhes da compra */}
            <div className="rounded-lg border border-gray-200 bg-gray-50 p-4">
              <p className="text-xs font-semibold text-gray-500 mb-1">Detalhes da compra</p>
              {alterandoQtd ? (
                <div className="flex items-center gap-3 mt-2">
                  <input type="number" min={1} value={quantidade} onChange={(e) => setQuantidade(Math.max(1, Number(e.target.value)))}
                    className="w-28 px-3 py-1.5 rounded-lg border border-gray-300 text-sm text-gray-900 focus:outline-none focus:border-[#7C4DFF]" />
                  <button onClick={() => setAlterandoQtd(false)} className="text-sm text-[#7C4DFF] font-medium hover:underline">Confirmar</button>
                </div>
              ) : (
                <>
                  <p className="text-sm text-gray-700">{quantidade} x créditos</p>
                  <p className="text-lg font-bold text-[#7C4DFF]">Valor: R$ {valorTotal.toFixed(2)}</p>
                  <button onClick={() => setAlterandoQtd(true)} className="text-xs text-[#7C4DFF] hover:underline mt-1">Alterar a quantidade de créditos</button>
                </>
              )}
            </div>

            <hr className="border-gray-100" />

            {/* Informações do Pagador */}
            <div className="space-y-3">
              <p className="text-sm font-semibold text-gray-800">Informações do Pagador <span className="text-[#7C4DFF]">*</span></p>
              <div className="grid grid-cols-2 gap-3">
                <div className="relative pt-2">
                  <label className="absolute top-0 left-3 bg-white px-1 text-[10px] text-gray-500">Nome Completo*</label>
                  <input className={INP} value={nomeCompleto} onChange={(e) => setNomeCompleto(e.target.value)} />
                </div>
                <div className="relative pt-2">
                  <label className="absolute top-0 left-3 bg-white px-1 text-[10px] text-gray-500">Email*</label>
                  <input className={INP} type="email" value={email} onChange={(e) => setEmail(e.target.value)} />
                </div>
              </div>
              <div className="grid grid-cols-3 gap-3">
                <div className="relative pt-2">
                  <label className="absolute top-0 left-3 bg-white px-1 text-[10px] text-gray-500">Código do País</label>
                  <select className={INP} value={pais} onChange={(e) => setPais(e.target.value)}>
                    <option value="BRA">🇧🇷 +55</option>
                  </select>
                </div>
                <div className="relative pt-2">
                  <label className="absolute top-0 left-3 bg-white px-1 text-[10px] text-gray-500">Número do Telefone</label>
                  <input className={INP} value={numeroTelefone} onChange={(e) => setNumeroTelefone(e.target.value)} placeholder="(00) 00000-0000" />
                </div>
                <div className="relative pt-2">
                  <label className="absolute top-0 left-3 bg-white px-1 text-[10px] text-gray-500">Documento*</label>
                  <select className={INP} value={tipoDocumento} onChange={(e) => handleTipoDocumentoChange(e.target.value)}>
                    <option value="CPF">CPF</option>
                    <option value="CNPJ">CNPJ</option>
                  </select>
                </div>
              </div>
              <div className="relative pt-2">
                <label className="absolute top-0 left-3 bg-white px-1 text-[10px] text-gray-500">Número do Documento*</label>
                <input className={INP} value={numeroDocumento}
                  onChange={(e) => handleNumeroDocumentoChange(e.target.value)}
                  placeholder={tipoDocumento === 'CPF' ? 'XXX.XXX.XXX-XX' : 'XX.XXX.XXX/XXXX-XX'}
                  maxLength={tipoDocumento === 'CPF' ? 14 : 18} />
              </div>
            </div>

            {/* Endereço de Cobrança */}
            <div className="space-y-3">
              <p className="text-sm font-semibold text-gray-800">Endereço de Cobrança</p>
              <div className="grid grid-cols-2 gap-3">
                <div className="relative pt-2">
                  <label className="absolute top-0 left-3 bg-white px-1 text-[10px] text-gray-500">CEP*</label>
                  <input className={INP} value={cep} onChange={(e) => setCep(e.target.value)} placeholder="XXXXX-XXX" />
                </div>
                <div className="relative pt-2">
                  <label className="absolute top-0 left-3 bg-white px-1 text-[10px] text-gray-500">Logradouro*</label>
                  <input className={INP} value={logradouro} onChange={(e) => setLogradouro(e.target.value)} />
                </div>
              </div>
              <div className="grid grid-cols-3 gap-3">
                <div className="relative pt-2">
                  <label className="absolute top-0 left-3 bg-white px-1 text-[10px] text-gray-500">Número*</label>
                  <input className={INP} value={numero} onChange={(e) => setNumero(e.target.value)} />
                </div>
                <div className="relative pt-2">
                  <label className="absolute top-0 left-3 bg-white px-1 text-[10px] text-gray-500">Complemento</label>
                  <input className={INP} value={complemento} onChange={(e) => setComplemento(e.target.value)} />
                </div>
                <div className="relative pt-2">
                  <label className="absolute top-0 left-3 bg-white px-1 text-[10px] text-gray-500">Bairro*</label>
                  <input className={INP} value={bairro} onChange={(e) => setBairro(e.target.value)} />
                </div>
              </div>
            </div>

            {/* Método de Pagamento */}
            <div className="space-y-3">
              <p className="text-sm font-semibold text-gray-800">Método de Pagamento: <span className="text-[#7C4DFF]">*</span></p>
              <div className="flex items-center gap-5">
                {([
                  { value: 'CARTAO_CREDITO', label: 'Cartão de Crédito' },
                  { value: 'BOLETO', label: 'Boleto Bancário' },
                  { value: 'PIX', label: 'Pix' },
                ] as const).map(({ value, label }) => (
                  <label key={value} className="flex items-center gap-1.5 cursor-pointer">
                    <input type="radio" name="metodo" value={value} checked={metodoPagamento === value}
                      onChange={() => setMetodoPagamento(value)}
                      className="w-3.5 h-3.5 accent-[#7C4DFF]" />
                    <span className="text-sm text-gray-700">{label}</span>
                  </label>
                ))}
              </div>

              {metodoPagamento === 'CARTAO_CREDITO' && (
                <div className="space-y-3 pt-1">
                  <div className="relative pt-2">
                    <label className="absolute top-0 left-3 bg-white px-1 text-[10px] text-gray-500">Número do Cartão*</label>
                    <input className={INP} value={numeroCartao} onChange={(e) => setNumeroCartao(e.target.value)} placeholder="0000 0000 0000 0000" />
                  </div>
                  <div className="relative pt-2">
                    <label className="absolute top-0 left-3 bg-white px-1 text-[10px] text-gray-500">Nome Completo*</label>
                    <input className={INP} value={nomeCartao} onChange={(e) => setNomeCartao(e.target.value)} />
                  </div>
                  <div className="grid grid-cols-2 gap-3">
                    <div className="relative pt-2">
                      <label className="absolute top-0 left-3 bg-white px-1 text-[10px] text-gray-500">CVV*</label>
                      <input className={INP} value={cvv} onChange={(e) => setCvv(e.target.value)} maxLength={4} />
                    </div>
                    <div className="relative pt-2">
                      <label className="absolute top-0 left-3 bg-white px-1 text-[10px] text-gray-500">Expiração*</label>
                      <input className={INP} value={expiracao} onChange={(e) => setExpiracao(e.target.value)} placeholder="MM/AAAA" />
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Nota legal */}
            <p className="text-xs text-gray-400 leading-relaxed">
              Nosso processo de compras é protegido pelo Google reCAPTCHA e{' '}
              <a href="#" className="text-[#7C4DFF] hover:underline">Política de Privacidade</a>{' '}
              e{' '}
              <a href="#" className="text-[#7C4DFF] hover:underline">Termos de Uso</a>{' '}
              se aplicam.
            </p>
          </div>

          {/* Footer */}
          <div className="flex items-center gap-3 px-6 py-4 border-t border-gray-100">
            <button onClick={() => setDialogOpen(false)}
              className="px-5 py-2 rounded-lg border border-gray-200 text-sm text-gray-600 font-medium hover:border-gray-300 transition-colors">
              Voltar
            </button>
            <button onClick={handleFinalizar} disabled={salvando}
              className="px-6 py-2 rounded-lg bg-[#7C4DFF] hover:bg-[#5B21B6] disabled:opacity-60 text-white text-sm font-bold transition-colors">
              {salvando ? 'Processando…' : 'Finalizar'}
            </button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  )
}
