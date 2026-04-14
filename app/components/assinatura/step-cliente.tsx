'use client'

import { useState } from 'react'
import { Loader2 } from 'lucide-react'
import type { PlanoInfo, ClienteInfo } from './modal-assinatura'

// ─── Mask helpers ────────────────────────────────────────────────────────────
function maskPhone(v: string) {
  const d = v.replace(/\D/g, '').slice(0, 11)
  if (d.length <= 2) return d.length === 0 ? '' : `(${d}`
  if (d.length <= 7) return `(${d.slice(0, 2)}) ${d.slice(2)}`
  return `(${d.slice(0, 2)}) ${d.slice(2, 7)}-${d.slice(7)}`
}

function maskCpf(v: string) {
  const d = v.replace(/\D/g, '').slice(0, 11)
  if (d.length <= 3) return d
  if (d.length <= 6) return `${d.slice(0, 3)}.${d.slice(3)}`
  if (d.length <= 9) return `${d.slice(0, 3)}.${d.slice(3, 6)}.${d.slice(6)}`
  return `${d.slice(0, 3)}.${d.slice(3, 6)}.${d.slice(6, 9)}-${d.slice(9)}`
}

function maskCnpj(v: string) {
  const d = v.replace(/\D/g, '').slice(0, 14)
  if (d.length <= 2) return d
  if (d.length <= 5) return `${d.slice(0, 2)}.${d.slice(2)}`
  if (d.length <= 8) return `${d.slice(0, 2)}.${d.slice(2, 5)}.${d.slice(5)}`
  if (d.length <= 12) return `${d.slice(0, 2)}.${d.slice(2, 5)}.${d.slice(5, 8)}/${d.slice(8)}`
  return `${d.slice(0, 2)}.${d.slice(2, 5)}.${d.slice(5, 8)}/${d.slice(8, 12)}-${d.slice(12)}`
}

function maskCep(v: string) {
  const d = v.replace(/\D/g, '').slice(0, 8)
  if (d.length <= 5) return d
  return `${d.slice(0, 5)}-${d.slice(5)}`
}

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
// ─────────────────────────────────────────────────────────────────────────────

interface StepClienteProps {
  plano: PlanoInfo
  onNext: (cliente: ClienteInfo) => void
}

export function StepCliente({ plano, onNext }: StepClienteProps) {
  const [form, setForm] = useState<ClienteInfo>({
    nome: '',
    email: '',
    documento: '',
    tipoDocumento: 'CPF',
    telefone: '',
    cep: '',
    logradouro: '',
    numero: '',
    complemento: '',
    bairro: '',
    cidade: '',
  })
  const [cepLoading, setCepLoading] = useState(false)
  const [errors, setErrors] = useState<Partial<Record<keyof ClienteInfo, string>>>({})

  function set(key: keyof ClienteInfo, value: string) {
    setForm(f => ({ ...f, [key]: value }))
    setErrors(e => ({ ...e, [key]: undefined }))
  }

  async function buscarCep(cep: string) {
    const digits = cep.replace(/\D/g, '')
    if (digits.length !== 8) return
    setCepLoading(true)
    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/v1/cep/${digits}`)
      if (!res.ok) return
      const data = await res.json()
      setForm(f => ({
        ...f,
        logradouro: data.logradouro ?? f.logradouro,
        bairro: data.bairro ?? f.bairro,
        cidade: data.localidade ? `${data.localidade}${data.uf ? ' - ' + data.uf : ''}` : f.cidade,
      }))
      setErrors(e => ({ ...e, logradouro: undefined, bairro: undefined, cidade: undefined }))
    } catch { /* ignore */ } finally {
      setCepLoading(false)
    }
  }

  function validate(): boolean {
    const errs: Partial<Record<keyof ClienteInfo, string>> = {}
    if (!form.nome.trim()) errs.nome = 'Nome obrigatório'
    if (!form.email.trim() || !EMAIL_REGEX.test(form.email.trim())) errs.email = 'E-mail inválido'
    const docDigits = form.documento.replace(/\D/g, '')
    if (!form.documento.trim()) {
      errs.documento = 'Documento obrigatório'
    } else if (form.tipoDocumento === 'CPF' && docDigits.length !== 11) {
      errs.documento = 'CPF inválido'
    } else if (form.tipoDocumento === 'CNPJ' && docDigits.length !== 14) {
      errs.documento = 'CNPJ inválido'
    }
    const cepDigits = form.cep.replace(/\D/g, '')
    if (!form.cep.trim() || cepDigits.length !== 8) errs.cep = 'CEP inválido'
    if (!form.logradouro.trim()) errs.logradouro = 'Logradouro obrigatório'
    if (!form.numero.trim()) errs.numero = 'Número obrigatório'
    if (!form.bairro.trim()) errs.bairro = 'Bairro obrigatório'
    setErrors(errs)
    return Object.keys(errs).length === 0
  }

  function handleNext() {
    if (validate()) onNext(form)
  }

  const inputClass = "w-full px-3 py-2.5 rounded-lg text-sm outline-none transition-colors border"
  function inputStyle(error?: string) {
    return {
      background: 'var(--d2b-input-bg)',
      color: 'var(--d2b-text-primary)',
      borderColor: error ? '#EF4444' : 'var(--d2b-border-strong)',
    }
  }

  return (
    <div className="flex flex-col gap-5">
      {/* Dados do Cliente */}
      <div>
        <p className="text-xs font-bold tracking-widest uppercase mb-3" style={{ color: 'var(--d2b-text-muted)' }}>
          Dados do Cliente
        </p>
        <div className="flex flex-col gap-3">
          {/* Nome */}
          <div>
            <input
              placeholder="Nome Completo *"
              value={form.nome}
              onChange={e => set('nome', e.target.value)}
              className={inputClass}
              style={inputStyle(errors.nome)}
            />
            {errors.nome && <p className="text-[10px] mt-1" style={{ color: '#EF4444' }}>{errors.nome}</p>}
          </div>

          {/* Telefone + Email */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <input
                placeholder="(00) 00000-0000 *"
                value={form.telefone}
                onChange={e => set('telefone', maskPhone(e.target.value))}
                className={inputClass}
                style={inputStyle()}
              />
            </div>
            <div>
              <input
                placeholder="E-mail *"
                type="email"
                value={form.email}
                onChange={e => set('email', e.target.value)}
                onBlur={e => {
                  if (e.target.value.trim() && !EMAIL_REGEX.test(e.target.value.trim()))
                    setErrors(prev => ({ ...prev, email: 'E-mail inválido' }))
                }}
                className={inputClass}
                style={inputStyle(errors.email)}
              />
              {errors.email && <p className="text-[10px] mt-1" style={{ color: '#EF4444' }}>{errors.email}</p>}
            </div>
          </div>

          {/* Tipo doc + Número doc */}
          <div className="grid grid-cols-2 gap-3">
            <select
              value={form.tipoDocumento}
              onChange={e => {
                set('tipoDocumento', e.target.value)
                set('documento', '')
              }}
              className={inputClass}
              style={inputStyle()}
            >
              <option value="CPF">CPF</option>
              <option value="CNPJ">CNPJ</option>
            </select>
            <div>
              <input
                placeholder={form.tipoDocumento === 'CPF' ? '000.000.000-00 *' : '00.000.000/0000-00 *'}
                value={form.documento}
                onChange={e => set('documento', form.tipoDocumento === 'CPF' ? maskCpf(e.target.value) : maskCnpj(e.target.value))}
                className={inputClass}
                style={inputStyle(errors.documento)}
              />
              {errors.documento && <p className="text-[10px] mt-1" style={{ color: '#EF4444' }}>{errors.documento}</p>}
            </div>
          </div>
        </div>
      </div>

      {/* Endereço de Cobrança */}
      <div>
        <p className="text-xs font-bold tracking-widest uppercase mb-3" style={{ color: 'var(--d2b-text-muted)' }}>
          Endereço de Cobrança
        </p>
        <div className="flex flex-col gap-3">
          {/* CEP + Logradouro */}
          <div className="grid grid-cols-2 gap-3">
            <div className="relative">
              <input
                placeholder="00000-000 *"
                value={form.cep}
                onChange={e => {
                  const masked = maskCep(e.target.value)
                  set('cep', masked)
                  buscarCep(masked)
                }}
                className={inputClass}
                style={inputStyle(errors.cep)}
              />
              {cepLoading && (
                <Loader2 size={14} className="absolute right-3 top-1/2 -translate-y-1/2 animate-spin"
                  style={{ color: '#7C4DFF' }} />
              )}
              {errors.cep && <p className="text-[10px] mt-1" style={{ color: '#EF4444' }}>{errors.cep}</p>}
            </div>
            <div>
              <input
                placeholder="Logradouro *"
                value={form.logradouro}
                onChange={e => set('logradouro', e.target.value)}
                className={inputClass}
                style={inputStyle(errors.logradouro)}
              />
              {errors.logradouro && <p className="text-[10px] mt-1" style={{ color: '#EF4444' }}>{errors.logradouro}</p>}
            </div>
          </div>

          {/* Número + Complemento + Bairro */}
          <div className="grid grid-cols-3 gap-3">
            <div>
              <input
                placeholder="Número *"
                value={form.numero}
                onChange={e => set('numero', e.target.value)}
                className={inputClass}
                style={inputStyle(errors.numero)}
              />
              {errors.numero && <p className="text-[10px] mt-1" style={{ color: '#EF4444' }}>{errors.numero}</p>}
            </div>
            <div>
              <input
                placeholder="Complemento"
                value={form.complemento}
                onChange={e => set('complemento', e.target.value)}
                className={inputClass}
                style={inputStyle()}
              />
            </div>
            <div>
              <input
                placeholder="Bairro *"
                value={form.bairro}
                onChange={e => set('bairro', e.target.value)}
                className={inputClass}
                style={inputStyle(errors.bairro)}
              />
              {errors.bairro && <p className="text-[10px] mt-1" style={{ color: '#EF4444' }}>{errors.bairro}</p>}
            </div>
          </div>

          <input
            placeholder="Cidade"
            value={form.cidade}
            onChange={e => set('cidade', e.target.value)}
            className={inputClass}
            style={inputStyle()}
          />
        </div>
      </div>

      <button
        onClick={handleNext}
        className="w-full py-3 rounded-xl text-sm font-semibold text-white transition-opacity hover:opacity-90"
        style={{ background: 'linear-gradient(135deg, #7C4DFF, #C084FC)' }}
      >
        Próximo
      </button>
    </div>
  )
}
