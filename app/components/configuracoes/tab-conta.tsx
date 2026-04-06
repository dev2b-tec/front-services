'use client'

import { useState, useRef } from 'react'
import { User, Building2, Upload, PenLine, Pencil } from 'lucide-react'
import { FInput, FSelect, PhoneInput, CepInput, SectionFooter } from './shared'
import { AvatarImage } from './avatar-image'
import { SignatureDialog } from './signature-dialog'
import { useToast } from '@/hooks/use-toast'
import type { UsuarioData, EmpresaData } from '@/app/dashboard/configuracoes/page'

// ─── ContaUsuario ─────────────────────────────────────────────────────────────
function ContaUsuario({
  data,
  onChange,
  onFotoUrl,
}: {
  data: Partial<UsuarioData>
  onChange: (field: keyof UsuarioData, value: string) => void
  onFotoUrl: (url: string) => void
}) {
  const fileRef = useRef<HTMLInputElement>(null)
  const [uploading, setUploading] = useState(false)

  async function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    if (!file || !data.id) return
    setUploading(true)
    try {
      const form = new FormData()
      form.append('file', file)
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/v1/usuarios/${data.id}/foto`, {
        method: 'POST',
        body: form,
      })
      if (res.ok) {
        const json = await res.json()
        onFotoUrl(json.fotoUrl)
      }
    } finally {
      setUploading(false)
      e.target.value = ''
    }
  }

  return (
    <div className="space-y-4">
      <div className="flex flex-col items-center gap-1.5 pb-3">
        <div
          className="relative w-28 h-28 rounded-xl bg-[#150830] border-2 border-dashed border-[rgba(124,77,255,0.25)] flex items-center justify-center cursor-pointer hover:border-[#7C4DFF] transition-colors overflow-hidden group"
          onClick={() => fileRef.current?.click()}
        >
          {data.fotoUrl
            ? <AvatarImage userId={data.id} fotoUrl={data.fotoUrl} />
            : <User size={52} className="text-[#6B4E8A]" strokeWidth={1} />
          }
          <div className="absolute inset-0 flex items-center justify-center bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity">
            {uploading
              ? <div className="w-6 h-6 rounded-full border-2 border-white border-t-transparent animate-spin" />
              : <div className="w-9 h-9 rounded-full bg-[#7C4DFF] flex items-center justify-center shadow-lg">
                  <Pencil size={14} className="text-white" strokeWidth={2.5} />
                </div>
            }
          </div>
        </div>
        <input ref={fileRef} type="file" accept="image/*" className="hidden" onChange={handleFileChange} />
        <p className="text-sm text-[#A78BCC]">{data.email ?? ''}</p>
      </div>

      <FInput
        label="Nome"
        req
        value={data.nome ?? ''}
        onChange={(v) => onChange('nome', v)}
      />
      <CepInput
        label="CEP"
        value={data.cep ?? ''}
        onChange={(v) => onChange('cep', v)}
      />
      <div className="grid grid-cols-[5.5rem_1fr] gap-3">
        <FInput
          label="Número"
          value={data.numero ?? ''}
          onChange={(v) => onChange('numero', v)}
        />
        <FInput
          label="Complemento"
          value={data.complemento ?? ''}
          onChange={(v) => onChange('complemento', v)}
        />
      </div>
      <FInput
        label="Bairro"
        value={data.bairro ?? ''}
        onChange={(v) => onChange('bairro', v)}
      />
      <FInput
        label="Cidade"
        value={data.cidade ?? ''}
        onChange={(v) => onChange('cidade', v)}
      />
      <PhoneInput
        label="Número de Telefone"
        req
        value={data.telefone ?? ''}
        onChange={(v) => onChange('telefone', v)}
      />
      <FSelect
        label="Tipo"
        req
        opts={['Dentista', 'Médico', 'Fisioterapeuta', 'Psicólogo', 'Nutricionista']}
        value={data.tipo ?? ''}
        onChange={(v) => onChange('tipo', v)}
      />
      <FSelect
        label="Conselho"
        opts={['Selecione um conselho', 'CRO', 'CFM', 'CREFITO', 'CFF', 'CFN']}
        value={data.conselho ?? ''}
        onChange={(v) => onChange('conselho', v)}
      />
      <FInput
        label="Número do Conselho"
        value={data.numeroConselho ?? ''}
        onChange={(v) => onChange('numeroConselho', v)}
      />
      <FInput
        label="Especialidade"
        value={data.especialidade ?? ''}
        onChange={(v) => onChange('especialidade', v)}
      />
    </div>
  )
}

// ─── ContaEmpresa ─────────────────────────────────────────────────────────────
const DURACAO_OPTS = ['30 minutos', '40 minutos', '50 minutos', '60 minutos']
const DURACAO_MAP: Record<string, number> = {
  '30 minutos': 30,
  '40 minutos': 40,
  '50 minutos': 50,
  '60 minutos': 60,
}
const DURACAO_REVERSE: Record<number, string> = {
  30: '30 minutos',
  40: '40 minutos',
  50: '50 minutos',
  60: '60 minutos',
}

function ContaEmpresa({
  data,
  onChange,
  onLogoUrl,
}: {
  data: Partial<EmpresaData>
  onChange: (field: keyof EmpresaData, value: string | number) => void
  onLogoUrl: (url: string) => void
}) {
  const fileRef = useRef<HTMLInputElement>(null)
  const [uploading, setUploading] = useState(false)

  async function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    if (!file || !data.id) return
    setUploading(true)
    try {
      const form = new FormData()
      form.append('file', file)
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/v1/empresas/${data.id}/logo`, {
        method: 'POST',
        body: form,
      })
      if (res.ok) {
        const json = await res.json()
        onLogoUrl(json.logoUrl)
      }
    } finally {
      setUploading(false)
      e.target.value = ''
    }
  }

  return (
    <div className="space-y-4">
      <div className="flex flex-col items-center gap-1.5 pb-3">
        <p className="text-xs font-medium text-[#A78BCC]">Logo da Clínica</p>
        <div
          className="relative w-28 h-28 rounded-xl bg-[#150830] border-2 border-dashed border-[rgba(124,77,255,0.25)] flex items-center justify-center cursor-pointer hover:border-[#7C4DFF] transition-colors overflow-hidden group"
          onClick={() => fileRef.current?.click()}
        >
          {data.logoUrl
            ? <img src={data.logoUrl} alt="Logo" className="w-full h-full object-cover" />
            : <Building2 size={40} className="text-[#6B4E8A]" strokeWidth={1} />
          }
          <div className="absolute inset-0 flex items-center justify-center bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity">
            {uploading
              ? <div className="w-6 h-6 rounded-full border-2 border-white border-t-transparent animate-spin" />
              : <div className="w-9 h-9 rounded-full bg-[#7C4DFF] flex items-center justify-center shadow-lg">
                  <Pencil size={14} className="text-white" strokeWidth={2.5} />
                </div>
            }
          </div>
        </div>
        <input ref={fileRef} type="file" accept="image/*" className="hidden" onChange={handleFileChange} />
      </div>

      <FInput
        label="Nome Comercial da Clínica"
        value={data.nomeComercial ?? ''}
        onChange={(v) => onChange('nomeComercial', v)}
      />
      <PhoneInput
        label="Telefone Comercial"
        value={data.telefoneComercial ?? ''}
        onChange={(v) => onChange('telefoneComercial', v)}
      />
      <CepInput
        label="CEP"
        value={data.cep ?? ''}
        onChange={(v) => onChange('cep', v)}
      />
      <FInput
        label="Logradouro"
        value={data.logradouro ?? ''}
        onChange={(v) => onChange('logradouro', v)}
      />
      <div className="grid grid-cols-[5.5rem_1fr] gap-3">
        <FInput
          label="Número"
          value={data.numero ?? ''}
          onChange={(v) => onChange('numero', v)}
        />
        <FInput
          label="Complemento"
          value={data.complemento ?? ''}
          onChange={(v) => onChange('complemento', v)}
        />
      </div>
      <FInput
        label="Bairro"
        value={data.bairro ?? ''}
        onChange={(v) => onChange('bairro', v)}
      />
      <FInput
        label="Cidade"
        value={data.cidade ?? ''}
        onChange={(v) => onChange('cidade', v)}
      />
      <FSelect
        label="Duração da sessão"
        req
        opts={DURACAO_OPTS}
        value={data.duracaoSessaoMinutos ? (DURACAO_REVERSE[data.duracaoSessaoMinutos] ?? '') : ''}
        onChange={(v) => onChange('duracaoSessaoMinutos', DURACAO_MAP[v] ?? 40)}
      />
    </div>
  )
}

// ─── TabConta ─────────────────────────────────────────────────────────────────
export function TabConta({
  initialUsuario,
  initialEmpresa,
}: {
  initialUsuario?: UsuarioData | null
  initialEmpresa?: EmpresaData | null
}) {
  const { toast } = useToast()

  const [usuario, setUsuario] = useState<Partial<UsuarioData>>(initialUsuario ?? {})
  const [empresa, setEmpresa] = useState<Partial<EmpresaData>>(initialEmpresa ?? {})
  const [saving, setSaving] = useState(false)
  const [signatureDialogOpen, setSignatureDialogOpen] = useState(false)
  const [signaturePreview, setSignaturePreview] = useState<string | null>(usuario.assinaturaUrl ?? null)
  const signatureFileRef = useRef<HTMLInputElement>(null)

  function handleUsuarioChange(field: keyof UsuarioData, value: string) {
    setUsuario((prev) => ({ ...prev, [field]: value }))
  }

  function handleEmpresaChange(field: keyof EmpresaData, value: string | number) {
    setEmpresa((prev) => ({ ...prev, [field]: value }))
  }

  async function handleSave() {
    setSaving(true)
    try {
      const apiUrl = process.env.NEXT_PUBLIC_API_URL

      if (usuario.id) {
        const { id, keycloakId, email, empresaId, ...usuarioPayload } = usuario
        await fetch(`${apiUrl}/api/v1/usuarios/${usuario.id}`, {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(usuarioPayload),
        })
      }

      if (empresa.id) {
        const { id, ...empresaPayload } = empresa
        await fetch(`${apiUrl}/api/v1/empresas/${empresa.id}`, {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(empresaPayload),
        })
      }

      toast({ title: 'Dados salvos com sucesso!' })
    } catch {
      toast({ title: 'Erro ao salvar. Tente novamente.', variant: 'destructive' })
    } finally {
      setSaving(false)
    }
  }

  function handleCancel() {
    setUsuario(initialUsuario ?? {})
    setEmpresa(initialEmpresa ?? {})
    setSignaturePreview(initialUsuario?.assinaturaUrl ?? null)
  }

  async function handleSignatureSave(signatureDataUrl: string) {
    if (!usuario.id) return
    
    try {
      const blob = await fetch(signatureDataUrl).then(r => r.blob())
      const file = new File([blob], 'assinatura.png', { type: 'image/png' })
      
      const form = new FormData()
      form.append('file', file)
      
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/v1/usuarios/${usuario.id}/assinatura`, {
        method: 'POST',
        body: form,
      })
      
      if (res.ok) {
        const json = await res.json()
        setSignaturePreview(json.assinaturaUrl)
        setUsuario(prev => ({ ...prev, assinaturaUrl: json.assinaturaUrl }))
        toast({ title: 'Assinatura salva com sucesso!' })
      } else {
        toast({ title: 'Erro ao salvar assinatura', variant: 'destructive' })
      }
    } catch {
      toast({ title: 'Erro ao salvar assinatura', variant: 'destructive' })
    }
  }

  async function handleSignatureUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    if (!file || !usuario.id) return
    
    try {
      const form = new FormData()
      form.append('file', file)
      
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/v1/usuarios/${usuario.id}/assinatura`, {
        method: 'POST',
        body: form,
      })
      
      if (res.ok) {
        const json = await res.json()
        setSignaturePreview(json.assinaturaUrl)
        setUsuario(prev => ({ ...prev, assinaturaUrl: json.assinaturaUrl }))
        toast({ title: 'Assinatura enviada com sucesso!' })
      } else {
        toast({ title: 'Erro ao enviar assinatura', variant: 'destructive' })
      }
    } catch {
      toast({ title: 'Erro ao enviar assinatura', variant: 'destructive' })
    } finally {
      e.target.value = ''
    }
  }

  return (
    <div className="space-y-7">
      <h2 className="text-base font-bold text-[#F5F0FF]">Minha conta</h2>

      <div className="grid grid-cols-2 gap-10">
        {/* ── Coluna esquerda ── */}
        <ContaUsuario
          data={usuario}
          onChange={handleUsuarioChange}
          onFotoUrl={(url) => setUsuario((prev) => ({ ...prev, fotoUrl: url }))}
        />

        {/* ── Coluna direita ── */}
        <ContaEmpresa
          data={empresa}
          onChange={handleEmpresaChange}
          onLogoUrl={(url) => setEmpresa((prev) => ({ ...prev, logoUrl: url }))}
        />
      </div>

      {/* ── Assinatura ── */}
      <div>
        <div className="flex items-start gap-2 mb-4">
          <PenLine size={16} className="text-[#7C4DFF] mt-0.5 shrink-0" />
          <div>
            <h3 className="text-sm font-bold text-[#F5F0FF]">Assinatura</h3>
            <p className="text-xs text-[#A78BCC] mt-0.5">
              Escolha entre enviar uma imagem pronta ou criar uma assinatura manual. Salvamos no tamanho ideal para uso nos documentos.
            </p>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4">
          {/* Pré-visualização */}
          <div className="rounded-xl border border-[rgba(124,77,255,0.18)] bg-[#120328] p-4">
            <p className="text-sm font-medium text-[#F5F0FF] mb-0.5">Pré-visualização</p>
            <p className="text-xs text-[#A78BCC] mb-3">Assim a assinatura vai aparecer nos documentos</p>
            <div
              className="h-32 rounded-lg border border-dashed border-[rgba(124,77,255,0.20)] flex items-center justify-center overflow-hidden bg-white"
            >
              {signaturePreview ? (
                <img src={signaturePreview} alt="Assinatura" className="w-full h-full object-cover" />
              ) : (
                <div className="flex flex-col items-center justify-center">
                  <p className="text-xs text-[#6B4E8A] font-medium">Nenhuma assinatura cadastrada</p>
                  <p className="text-[10px] text-[#6B4E8A] mt-1 text-center px-6">
                    Envie uma imagem ou crie uma assinatura para começar
                  </p>
                </div>
              )}
            </div>
          </div>

          {/* Opções */}
          <div className="rounded-xl border border-[rgba(124,77,255,0.18)] bg-[#120328] p-4 flex flex-col gap-3">
            <div>
              <p className="text-sm font-medium text-[#F5F0FF]">Adicionar assinatura</p>
              <p className="text-xs text-[#A78BCC]">Escolha uma das opções abaixo</p>
            </div>

            <div className="flex items-center justify-between p-3 rounded-lg border border-[rgba(124,77,255,0.18)] hover:border-[#7C4DFF] transition-colors">
              <div className="flex items-start gap-2.5">
                <Upload size={15} className="text-[#7C4DFF] mt-0.5 shrink-0" />
                <div>
                  <p className="text-sm font-medium text-[#F5F0FF]">Enviar imagem</p>
                  <p className="text-xs text-[#A78BCC]">Selecione um arquivo e recorte para manter a assinatura bem enquadrada.</p>
                </div>
              </div>
              <button 
                onClick={() => signatureFileRef.current?.click()}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-md bg-[#7C4DFF] hover:bg-[#5B21B6] text-white text-xs font-semibold transition-colors shrink-0 ml-3"
              >
                <Upload size={11} />
                Selecionar
              </button>
              <input 
                ref={signatureFileRef} 
                type="file" 
                accept="image/*" 
                className="hidden" 
                onChange={handleSignatureUpload} 
              />
            </div>

            <div className="flex items-center justify-between p-3 rounded-lg border border-[rgba(124,77,255,0.18)] hover:border-[#7C4DFF] transition-colors">
              <div className="flex items-start gap-2.5">
                <PenLine size={15} className="text-[#7C4DFF] mt-0.5 shrink-0" />
                <div>
                  <p className="text-sm font-medium text-[#F5F0FF]">Criar agora</p>
                  <p className="text-xs text-[#A78BCC]">Assine com mouse ou toque. Vamos ajustar e padronizar automaticamente para documentos.</p>
                </div>
              </div>
              <button 
                onClick={() => setSignatureDialogOpen(true)}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-md border border-[rgba(124,77,255,0.25)] hover:border-[#7C4DFF] text-[#A78BCC] hover:text-[#F5F0FF] text-xs font-semibold transition-colors shrink-0 ml-3"
              >
                <PenLine size={11} />
                Criar
              </button>
            </div>

            <p className="text-[10px] text-[#6B4E8A]">
              <span className="font-semibold text-[#A78BCC]">Dica:</span> Prefira uma assinatura mais larga do que alta. O sistema centraliza e mantém a transparência para melhor resultado nos documentos.
            </p>
          </div>
        </div>
      </div>

      <SectionFooter onSave={handleSave} onCancel={handleCancel} saving={saving} />

      <SignatureDialog 
        open={signatureDialogOpen}
        onOpenChange={setSignatureDialogOpen}
        onSave={handleSignatureSave}
      />
    </div>
  )
}
