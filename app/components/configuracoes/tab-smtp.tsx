'use client'

import { useState, useEffect } from 'react'
import { HelpCircle, Loader2 } from 'lucide-react'
import { INP, LBG, Toggle, SectionFooter } from './shared'
import { useToast } from '@/hooks/use-toast'
import type { EmpresaData } from '@/app/dashboard/configuracoes/page'

const API_URL = process.env.NEXT_PUBLIC_API_URL ?? ''

interface SmtpConfig {
  host: string
  porta: number
  usuario: string
  senha: string
  nomeRemetente: string
  emailRemetente: string
  usarTls: boolean
  ativo: boolean
}

const DEFAULT_CONFIG: SmtpConfig = {
  host: '',
  porta: 587,
  usuario: '',
  senha: '',
  nomeRemetente: '',
  emailRemetente: '',
  usarTls: true,
  ativo: false,
}

interface TabSmtpProps {
  initialEmpresa?: EmpresaData | null
}

export function TabSmtp({ initialEmpresa }: TabSmtpProps) {
  const [config, setConfig] = useState<SmtpConfig>(DEFAULT_CONFIG)
  const [loading, setLoading] = useState(false)
  const [testando, setTestando] = useState(false)
  const [emailTeste, setEmailTeste] = useState('')
  const { toast } = useToast()

  const empresaId = initialEmpresa?.id

  useEffect(() => {
    if (!empresaId) return
    setLoading(true)
    fetch(`${API_URL}/api/v1/integracoes/empresa/${empresaId}/tipo/SMTP`, {
      credentials: 'include',
    })
      .then((res) => {
        if (res.ok) return res.json()
        return null
      })
      .then((data) => {
        if (data?.configuracao) {
          setConfig({ ...DEFAULT_CONFIG, ...data.configuracao, ativo: data.ativo ?? false })
        }
      })
      .catch(() => {})
      .finally(() => setLoading(false))
  }, [empresaId])

  function set<K extends keyof SmtpConfig>(key: K, value: SmtpConfig[K]) {
    setConfig((prev) => ({ ...prev, [key]: value }))
  }

  async function salvar() {
    if (!empresaId) return
    setLoading(true)
    try {
      const res = await fetch(`${API_URL}/api/v1/integracoes/empresa/${empresaId}/tipo/SMTP`, {
        method: 'PUT',
        credentials: 'include',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ativo: config.ativo, configuracao: config }),
      })
      if (!res.ok) throw new Error()
      toast({ title: 'Configuração SMTP salva com sucesso.' })
    } catch {
      toast({ title: 'Erro ao salvar configuração SMTP.', variant: 'destructive' })
    } finally {
      setLoading(false)
    }
  }

  async function testar() {
    if (!empresaId || !emailTeste) return
    setTestando(true)
    try {
      const res = await fetch(`${API_URL}/api/v1/integracoes/empresa/${empresaId}/smtp/testar`, {
        method: 'POST',
        credentials: 'include',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: emailTeste }),
      })
      if (!res.ok) throw new Error()
      toast({ title: 'E-mail de teste enviado com sucesso!' })
    } catch {
      toast({ title: 'Falha ao enviar e-mail de teste. Verifique as configurações.', variant: 'destructive' })
    } finally {
      setTestando(false)
    }
  }

  return (
    <div className="space-y-8 max-w-2xl">
      <div>
        <h2 className="text-base font-bold text-[var(--d2b-text-primary)]">Configuração de E-mail (SMTP)</h2>
        <p className="text-sm text-[var(--d2b-text-muted)] mt-1">
          Configure o servidor de envio de e-mails para notificações e comunicações da plataforma.
        </p>
      </div>

      {/* Ativo toggle */}
      <div className="flex items-center justify-between p-4 rounded-xl border border-[var(--d2b-border)] bg-[var(--d2b-bg-surface)]">
        <div>
          <p className="text-sm font-medium text-[var(--d2b-text-primary)]">Envio de e-mail ativo</p>
          <p className="text-xs text-[var(--d2b-text-muted)] mt-0.5">Ativa o envio de e-mails através desta configuração.</p>
        </div>
        <Toggle on={config.ativo} set={(v) => set('ativo', v)} />
      </div>

      {/* Servidor */}
      <div className="space-y-4">
        <h3 className="text-sm font-semibold text-[var(--d2b-text-secondary)]">Servidor</h3>
        <div className="grid grid-cols-3 gap-4">
          <div className="relative col-span-2">
            <label className={`absolute -top-2 left-3 z-10 ${LBG} px-1 text-[10px] font-medium text-[var(--d2b-text-secondary)] leading-none`}>
              Host SMTP
            </label>
            <input
              type="text"
              value={config.host}
              onChange={(e) => set('host', e.target.value)}
              placeholder="smtp.gmail.com"
              className={INP}
            />
          </div>
          <div className="relative">
            <label className={`absolute -top-2 left-3 z-10 ${LBG} px-1 text-[10px] font-medium text-[var(--d2b-text-secondary)] leading-none`}>
              Porta
            </label>
            <input
              type="number"
              value={config.porta}
              onChange={(e) => set('porta', Number(e.target.value))}
              className={INP}
            />
          </div>
        </div>

        <div className="flex items-center gap-3 mt-1">
          <Toggle on={config.usarTls} set={(v) => set('usarTls', v)} />
          <span className="text-sm text-[var(--d2b-text-primary)]">Usar TLS/STARTTLS</span>
          <HelpCircle size={13} className="text-[var(--d2b-text-muted)] cursor-help" />
        </div>
      </div>

      {/* Autenticação */}
      <div className="space-y-4">
        <h3 className="text-sm font-semibold text-[var(--d2b-text-secondary)]">Autenticação</h3>
        <div className="grid grid-cols-2 gap-4">
          <div className="relative">
            <label className={`absolute -top-2 left-3 z-10 ${LBG} px-1 text-[10px] font-medium text-[var(--d2b-text-secondary)] leading-none`}>
              Usuário
            </label>
            <input
              type="text"
              value={config.usuario}
              onChange={(e) => set('usuario', e.target.value)}
              placeholder="seu@email.com"
              className={INP}
              autoComplete="off"
            />
          </div>
          <div className="relative">
            <label className={`absolute -top-2 left-3 z-10 ${LBG} px-1 text-[10px] font-medium text-[var(--d2b-text-secondary)] leading-none`}>
              Senha
            </label>
            <input
              type="password"
              value={config.senha}
              onChange={(e) => set('senha', e.target.value)}
              placeholder="••••••••"
              className={INP}
              autoComplete="new-password"
            />
          </div>
        </div>
      </div>

      {/* Remetente */}
      <div className="space-y-4">
        <h3 className="text-sm font-semibold text-[var(--d2b-text-secondary)]">Remetente</h3>
        <div className="grid grid-cols-2 gap-4">
          <div className="relative">
            <label className={`absolute -top-2 left-3 z-10 ${LBG} px-1 text-[10px] font-medium text-[var(--d2b-text-secondary)] leading-none`}>
              Nome do Remetente
            </label>
            <input
              type="text"
              value={config.nomeRemetente}
              onChange={(e) => set('nomeRemetente', e.target.value)}
              placeholder="Clínica DEV2B"
              className={INP}
            />
          </div>
          <div className="relative">
            <label className={`absolute -top-2 left-3 z-10 ${LBG} px-1 text-[10px] font-medium text-[var(--d2b-text-secondary)] leading-none`}>
              E-mail do Remetente
            </label>
            <input
              type="email"
              value={config.emailRemetente}
              onChange={(e) => set('emailRemetente', e.target.value)}
              placeholder="noreply@clinica.com.br"
              className={INP}
            />
          </div>
        </div>
      </div>

      {/* Testar envio */}
      <div className="space-y-3 p-4 rounded-xl border border-[var(--d2b-border)] bg-[var(--d2b-bg-surface)]">
        <h3 className="text-sm font-semibold text-[var(--d2b-text-secondary)]">Testar envio</h3>
        <p className="text-xs text-[var(--d2b-text-muted)]">Envie um e-mail de teste para verificar se a configuração está correta.</p>
        <div className="flex gap-3">
          <div className="relative flex-1">
            <label className={`absolute -top-2 left-3 z-10 ${LBG} px-1 text-[10px] font-medium text-[var(--d2b-text-secondary)] leading-none`}>
              E-mail para teste
            </label>
            <input
              type="email"
              value={emailTeste}
              onChange={(e) => setEmailTeste(e.target.value)}
              placeholder="teste@email.com"
              className={INP}
            />
          </div>
          <button
            type="button"
            onClick={testar}
            disabled={testando || !emailTeste}
            className="shrink-0 px-4 py-2 rounded-lg border border-[var(--d2b-border)] text-sm font-medium text-[var(--d2b-text-primary)] hover:bg-[var(--d2b-hover)] transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
          >
            {testando ? <Loader2 size={14} className="animate-spin" /> : null}
            Enviar teste
          </button>
        </div>
      </div>

      <SectionFooter onSave={salvar} saving={loading} />
    </div>
  )
}
