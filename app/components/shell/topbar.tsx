'use client'

import { useState, useRef, useEffect } from 'react'
import { createPortal } from 'react-dom'
import { Menu, Bell, LogOut, User, Sun, Moon, Clock, Video, HelpCircle, Info, Plus, Copy, ExternalLink, Settings, Sparkles, CalendarDays } from 'lucide-react'
import { usePathname, useRouter } from 'next/navigation'
import { useSession } from 'next-auth/react'
import { useSidebar } from './sidebar-context'
import { navGroups } from './nav-config'
import { ModalAssinatura } from '@/components/assinatura/modal-assinatura'

function usePageTitle() {
  const pathname = usePathname()
  for (const group of navGroups) {
    for (const item of group.items) {
      if (item.href === '/dashboard' && pathname === '/dashboard') return item.label
      if (item.href !== '/dashboard' && pathname.startsWith(item.href)) return item.label
    }
  }
  return 'DEV2B-AGENDA'
}

// Define os CSS vars direto no style do <html> — garante prioridade absoluta
function applyThemeVars(dark: boolean) {
  const r = document.documentElement.style
  if (dark) {
    r.setProperty('--d2b-bg-main',      '#0D0520')
    r.setProperty('--d2b-bg-surface',   '#120328')
    r.setProperty('--d2b-bg-elevated',  '#150830')
    r.setProperty('--d2b-text-primary', '#F5F0FF')
    r.setProperty('--d2b-text-secondary','#A78BCC')
    r.setProperty('--d2b-text-muted',   '#6B4E8A')
    r.setProperty('--d2b-border',       'rgba(124,77,255,0.18)')
    r.setProperty('--d2b-border-strong','rgba(124,77,255,0.25)')
    r.setProperty('--d2b-hover',        'rgba(124,77,255,0.10)')
    r.setProperty('--d2b-input-bg',     '#0D0520')
    r.setProperty('--d2b-topbar-bg',    'rgba(18,3,40,0.80)')
  } else {
    r.setProperty('--d2b-bg-main',      '#FFFFFF')
    r.setProperty('--d2b-bg-surface',   '#FFFFFF')
    r.setProperty('--d2b-bg-elevated',  '#F3F4F6')
    r.setProperty('--d2b-text-primary', '#111827')
    r.setProperty('--d2b-text-secondary','#6B7280')
    r.setProperty('--d2b-text-muted',   '#9CA3AF')
    r.setProperty('--d2b-border',       '#E5E7EB')
    r.setProperty('--d2b-border-strong','#D1D5DB')
    r.setProperty('--d2b-hover',        '#F9FAFB')
    r.setProperty('--d2b-input-bg',     '#FFFFFF')
    r.setProperty('--d2b-topbar-bg',    'rgba(255,255,255,0.95)')
  }
}

export function Topbar() {
  const { setMobileOpen } = useSidebar()
  const title = usePageTitle()
  const { data: session } = useSession()
  const router = useRouter()
  const [isDark, setIsDark] = useState(true)
  const [menuOpen, setMenuOpen] = useState(false)
  const menuRef = useRef<HTMLDivElement>(null)
  const [videoOpen, setVideoOpen] = useState(false)
  const videoBtnRef = useRef<HTMLButtonElement>(null)
  const [clockOpen, setClockOpen] = useState(false)
  const clockBtnRef = useRef<HTMLButtonElement>(null)
  const [clockLinks, setClockLinks] = useState<{ clinicLink: string; profLink: string; profName: string } | null>(null)
  const [clockLoading, setClockLoading] = useState(false)
  const [copiedKey, setCopiedKey] = useState<string | null>(null)
  const [fotoUrl, setFotoUrl] = useState<string | null>(null)
  const [userId, setUserId] = useState<string | null>(null)
  const [empresaId, setEmpresaId] = useState<string | null>(null)
  const [assinaturaOpen, setAssinaturaOpen] = useState(false)

  const initials = session?.user?.name
    ? session.user.name.split(' ').map(n => n[0]).slice(0, 2).join('').toUpperCase()
    : 'U'

  // Busca a foto do usuário no backend
  useEffect(() => {
    if (!session?.user?.email) return
    async function loadFoto() {
      try {
        const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/v1/usuarios/sync`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            nome: session?.user?.name ?? '',
            email: session?.user?.email ?? '',
            keycloakId: (session as { keycloakId?: string })?.keycloakId ?? '',
          }),
        })
        if (!res.ok) return
        const u = await res.json()
        setUserId(u.id)
        if (u.empresaId) setEmpresaId(u.empresaId)
        if (u.fotoUrl) {
          const fRes = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/v1/usuarios/${u.id}/foto-url`)
          if (fRes.ok) {
            const { fotoUrl: url } = await fRes.json()
            setFotoUrl(url ?? null)
          }
        }
      } catch { /* offline */ }
    }
    loadFoto()
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [session?.user?.email])

  useEffect(() => {
    const stored = localStorage.getItem('d2b-theme')
    const dark = stored !== 'light'
    setIsDark(dark)
    applyThemeVars(dark)
  }, [])

  function toggleTheme() {
    const newDark = !isDark
    setIsDark(newDark)
    applyThemeVars(newDark)
    localStorage.setItem('d2b-theme', newDark ? 'dark' : 'light')
  }

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setMenuOpen(false)
      }
      if (videoBtnRef.current && !videoBtnRef.current.contains(e.target as Node)) {
        const panel = document.getElementById('video-popover')
        if (panel && !panel.contains(e.target as Node)) setVideoOpen(false)
      }
      if (clockBtnRef.current && !clockBtnRef.current.contains(e.target as Node)) {
        const panel = document.getElementById('clock-popover')
        if (panel && !panel.contains(e.target as Node)) setClockOpen(false)
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  async function openClock() {
    const next = !clockOpen
    setClockOpen(next)
    if (next && !clockLinks && !clockLoading) {
      setClockLoading(true)
      try {
        const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/v1/usuarios/sync`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            nome: session?.user?.name ?? '',
            email: session?.user?.email ?? '',
            keycloakId: (session as { keycloakId?: string })?.keycloakId ?? '',
          }),
        })
        if (res.ok) {
          const u = await res.json()
          const uid = u.id ?? userId
          const empresaId: string | null = u.empresaId ?? null
          setUserId(uid)
          setClockLinks({
            clinicLink: empresaId ? `https://app.dev2b.tec.br/sites/empresa/${empresaId}` : '',
            profLink: `https://app.dev2b.tec.br/sites/profissional/${uid}`,
            profName: u.nome ?? session?.user?.name ?? 'Profissional',
          })
        }
      } catch { /* offline */ } finally {
        setClockLoading(false)
      }
    }
  }

  function copyLink(key: string, url: string) {
    navigator.clipboard.writeText(url).then(() => {
      setCopiedKey(key)
      setTimeout(() => setCopiedKey(null), 2000)
    })
  }

  function handleLogout() {
    window.location.href = '/api/auth/logout'
  }

  return (
    <>
    <header
      className="sticky top-0 z-30 flex items-center gap-3 h-14 px-4 backdrop-blur-md border-b"
      style={{ background: 'var(--d2b-topbar-bg)', borderColor: 'var(--d2b-border)' }}
    >
      <button
        onClick={() => setMobileOpen(true)}
        className="md:hidden flex-shrink-0 p-2 rounded-lg transition-colors"
        style={{ color: 'var(--d2b-text-secondary)' }}
        aria-label="Abrir menu"
      >
        <Menu size={20} />
      </button>

      <h1 className="text-sm font-semibold truncate mr-auto" style={{ color: 'var(--d2b-text-primary)' }}>
        {title}
      </h1>

      {/* HelpCircle removido a pedido */}

      {/* Botão Assine um plano */}
      <button
        onClick={() => setAssinaturaOpen(true)}
        className="flex-shrink-0 hidden sm:flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold text-white transition-opacity hover:opacity-90"
        style={{ background: 'linear-gradient(135deg, #7C4DFF, #C084FC)' }}
        aria-label="Assinar plano"
      >
        <CalendarDays size={13} />
        Assine um plano
      </button>

      {/* Relógio / Links de Auto Agendamento */}
      <button
        ref={clockBtnRef}
        onClick={openClock}
        className="flex-shrink-0 p-2 rounded-lg transition-colors hover:bg-[var(--d2b-hover)]"
        style={{ color: clockOpen ? '#7C4DFF' : 'var(--d2b-text-secondary)' }}
        aria-label="Links de Auto Agendamento"
      >
        <Clock size={18} />
      </button>

      {clockOpen && typeof window !== 'undefined' && createPortal(
        <div
          id="clock-popover"
          style={{
            position: 'fixed',
            top: (clockBtnRef.current?.getBoundingClientRect().bottom ?? 0) + 8,
            right: window.innerWidth - (clockBtnRef.current?.getBoundingClientRect().right ?? 0),
            zIndex: 9999,
          }}
          className="w-96 bg-[var(--d2b-bg-elevated)] border border-[var(--d2b-border-strong)] rounded-xl shadow-2xl overflow-hidden"
          onClick={(e) => e.stopPropagation()}
        >
          {/* Header */}
          <div className="flex items-center justify-between px-4 py-3 border-b border-[var(--d2b-border)]">
            <span className="text-sm font-semibold" style={{ color: 'var(--d2b-text-primary)' }}>
              Links de Auto Agendamento:
            </span>
            <Info size={14} style={{ color: 'var(--d2b-text-muted)' }} />
          </div>

          {/* Body */}
          <div className="p-4 space-y-4">
            {clockLoading ? (
              <p className="text-xs text-center py-4" style={{ color: 'var(--d2b-text-muted)' }}>Carregando…</p>
            ) : clockLinks ? (
              <>
                {/* Link Global da Clínica */}
                {clockLinks.clinicLink && (
                  <div>
                    <p className="text-[10px] font-bold tracking-widest uppercase mb-2" style={{ color: 'var(--d2b-text-muted)' }}>Link Global da Clínica</p>
                    <div className="flex items-center gap-1.5 bg-[var(--d2b-bg-main)] border border-[var(--d2b-border-strong)] rounded-lg px-3 py-2">
                      <span className="text-xs truncate flex-1" style={{ color: 'var(--d2b-text-secondary)' }}>{clockLinks.clinicLink}</span>
                      <button onClick={() => copyLink('clinic', clockLinks.clinicLink)} className="flex-shrink-0 p-1 rounded hover:bg-[var(--d2b-hover)]" style={{ color: '#7C4DFF' }}>
                        {copiedKey === 'clinic' ? <span className="text-[10px] font-bold">✓</span> : <Copy size={13} />}
                      </button>
                      <a href={clockLinks.clinicLink} target="_blank" rel="noreferrer" className="flex-shrink-0 p-1 rounded hover:bg-[var(--d2b-hover)]" style={{ color: '#7C4DFF' }}>
                        <ExternalLink size={13} />
                      </a>
                    </div>
                  </div>
                )}

                {/* Link do Profissional */}
                <div>
                  <p className="text-[10px] font-bold tracking-widest uppercase mb-2" style={{ color: 'var(--d2b-text-muted)' }}>Link do Profissional</p>
                  <div className="flex items-center gap-2 mb-1.5">
                    <span className="w-6 h-6 rounded-full bg-[#7C4DFF] flex items-center justify-center flex-shrink-0">
                      <User size={11} className="text-white" />
                    </span>
                    <span className="text-xs font-medium" style={{ color: 'var(--d2b-text-primary)' }}>{clockLinks.profName}</span>
                  </div>
                  <div className="flex items-center gap-1.5 bg-[var(--d2b-bg-main)] border border-[var(--d2b-border-strong)] rounded-lg px-3 py-2">
                    <span className="text-xs truncate flex-1" style={{ color: 'var(--d2b-text-secondary)' }}>{clockLinks.profLink}</span>
                    <button onClick={() => copyLink('prof', clockLinks.profLink)} className="flex-shrink-0 p-1 rounded hover:bg-[var(--d2b-hover)]" style={{ color: '#7C4DFF' }}>
                      {copiedKey === 'prof' ? <span className="text-[10px] font-bold">✓</span> : <Copy size={13} />}
                    </button>
                    <a href={clockLinks.profLink} target="_blank" rel="noreferrer" className="flex-shrink-0 p-1 rounded hover:bg-[var(--d2b-hover)]" style={{ color: '#7C4DFF' }}>
                      <ExternalLink size={13} />
                    </a>
                  </div>
                </div>
              </>
            ) : (
              <p className="text-xs text-center py-2" style={{ color: 'var(--d2b-text-muted)' }}>Não foi possível carregar os links.</p>
            )}

            {/* CTA */}
            <button
              onClick={() => { setClockOpen(false); router.push('/dashboard/marketing') }}
              className="w-full flex items-center justify-center gap-2 py-2 px-4 rounded-lg text-sm font-medium transition-opacity hover:opacity-90"
              style={{ background: 'rgba(124,77,255,0.15)', color: '#7C4DFF' }}
            >
              <Plus size={15} />
              Configurar Links
            </button>
          </div>
        </div>,
        document.body
      )}

      {/* Video removido a pedido */}

      {videoOpen && typeof window !== 'undefined' && createPortal(
        <div
          id="video-popover"
          style={{
            position: 'fixed',
            top: (videoBtnRef.current?.getBoundingClientRect().bottom ?? 0) + 8,
            right: window.innerWidth - (videoBtnRef.current?.getBoundingClientRect().right ?? 0),
            zIndex: 9999,
          }}
          className="w-72 bg-[var(--d2b-bg-elevated)] border border-[var(--d2b-border-strong)] rounded-xl shadow-2xl overflow-hidden"
          onClick={(e) => e.stopPropagation()}
        >
          {/* Header */}
          <div className="flex items-center justify-between px-4 py-3 border-b border-[var(--d2b-border)]">
            <span className="text-sm font-semibold" style={{ color: 'var(--d2b-text-primary)' }}>
              Escolha o profissional:
            </span>
            <Info size={14} style={{ color: 'var(--d2b-text-muted)' }} />
          </div>

          {/* Body */}
          <div className="p-4 space-y-3">
            <p className="text-xs leading-relaxed" style={{ color: 'var(--d2b-text-secondary)' }}>
              Nenhuma sala virtual foi configurada ainda. Configure uma agora:
            </p>
            <button
              className="w-full flex items-center justify-center gap-2 py-2 px-4 rounded-lg text-sm font-medium transition-opacity hover:opacity-90"
              style={{ background: 'rgba(124,77,255,0.15)', color: '#7C4DFF' }}
            >
              <Plus size={15} />
              Adicionar Sala Virtual
            </button>
          </div>
        </div>,
        document.body
      )}

      <button
        onClick={toggleTheme}
        className="flex-shrink-0 p-2 rounded-lg transition-colors"
        style={{ color: 'var(--d2b-text-secondary)' }}
        aria-label={isDark ? 'Ativar tema claro' : 'Ativar tema escuro'}
      >
        {isDark ? <Sun size={18} /> : <Moon size={18} />}
      </button>

      {/* Bell removido a pedido */}

      <div ref={menuRef} className="relative flex-shrink-0 pl-1">
        <button
          onClick={() => setMenuOpen(v => !v)}
          className="w-8 h-8 rounded-full overflow-hidden flex items-center justify-center text-xs font-bold text-white select-none hover:opacity-90 transition-opacity flex-shrink-0"
          style={{ background: fotoUrl ? 'transparent' : 'linear-gradient(135deg, #7C4DFF, #C084FC)' }}
          aria-label="Menu do usuario"
        >
          {fotoUrl ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={fotoUrl} alt={session?.user?.name ?? 'avatar'} className="w-full h-full object-cover" referrerPolicy="no-referrer" />
          ) : initials}
        </button>

        {menuOpen && (
          <div
            className="absolute right-0 top-10 w-60 rounded-xl shadow-lg overflow-hidden border"
            style={{
              background: 'var(--d2b-bg-surface)',
              borderColor: 'var(--d2b-border-strong)',
              boxShadow: '0 8px 32px var(--d2b-shadow)',
            }}
          >
            {/* Header */}
            <div className="px-4 py-3 border-b" style={{ borderColor: 'var(--d2b-border)' }}>
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-full overflow-hidden flex-shrink-0 flex items-center justify-center text-xs font-bold text-white"
                  style={{ background: fotoUrl ? 'transparent' : 'linear-gradient(135deg, #7C4DFF, #C084FC)' }}>
                  {fotoUrl ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img src={fotoUrl} alt="" className="w-full h-full object-cover" referrerPolicy="no-referrer" />
                  ) : initials}
                </div>
                <div className="min-w-0">
                  <p className="text-xs font-semibold truncate" style={{ color: 'var(--d2b-text-primary)' }}>
                    {session?.user?.name ?? 'Usuário'}
                  </p>
                  <p className="text-[11px] truncate" style={{ color: 'var(--d2b-text-muted)' }}>
                    {session?.user?.email ?? ''}
                  </p>
                </div>
              </div>
            </div>

            {/* Minha Conta */}
            <button
              onClick={() => { setMenuOpen(false); router.push('/dashboard/configuracoes?tab=conta') }}
              className="w-full flex items-center gap-2.5 px-4 py-2.5 text-xs transition-colors"
              style={{ color: 'var(--d2b-text-secondary)' }}
              onMouseEnter={e => { (e.currentTarget as HTMLElement).style.color = 'var(--d2b-text-primary)'; (e.currentTarget as HTMLElement).style.background = 'var(--d2b-hover)' }}
              onMouseLeave={e => { (e.currentTarget as HTMLElement).style.color = 'var(--d2b-text-secondary)'; (e.currentTarget as HTMLElement).style.background = 'transparent' }}
            >
              <Settings size={14} />
              Minha conta
            </button>

            <div className="border-t mx-3" style={{ borderColor: 'var(--d2b-border)' }} />

            {/* Sair */}
            <button
              onClick={handleLogout}
              className="w-full flex items-center gap-2.5 px-4 py-2.5 text-xs transition-colors"
              style={{ color: 'var(--d2b-text-secondary)' }}
              onMouseEnter={e => { (e.currentTarget as HTMLElement).style.color = '#EF4444'; (e.currentTarget as HTMLElement).style.background = 'var(--d2b-hover)' }}
              onMouseLeave={e => { (e.currentTarget as HTMLElement).style.color = 'var(--d2b-text-secondary)'; (e.currentTarget as HTMLElement).style.background = 'transparent' }}
            >
              <LogOut size={14} />
              Sair
            </button>
          </div>
        )}
      </div>
    </header>

    <ModalAssinatura
      open={assinaturaOpen}
      onClose={() => setAssinaturaOpen(false)}
      empresaId={empresaId ?? undefined}
      usuarioId={userId ?? undefined}
    />
    </>
  )
}
