'use client'

import { useState, useRef, useEffect } from 'react'
import { Menu, Search, Bell, LogOut, User, Sun, Moon } from 'lucide-react'
import { usePathname } from 'next/navigation'
import { useSession } from 'next-auth/react'
import { useSidebar } from './sidebar-context'
import { navGroups } from './nav-config'

function usePageTitle() {
  const pathname = usePathname()
  for (const group of navGroups) {
    for (const item of group.items) {
      if (item.href === '/dashboard' && pathname === '/dashboard') return item.label
      if (item.href !== '/dashboard' && pathname.startsWith(item.href)) return item.label
    }
  }
  return 'DEV2B'
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
  const [isDark, setIsDark] = useState(true)
  const [menuOpen, setMenuOpen] = useState(false)
  const menuRef = useRef<HTMLDivElement>(null)

  const initials = session?.user?.name
    ? session.user.name.split(' ').map(n => n[0]).slice(0, 2).join('').toUpperCase()
    : 'U'

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
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  function handleLogout() {
    window.location.href = '/api/auth/logout'
  }

  return (
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

      <div
        className="hidden sm:flex items-center gap-2 rounded-lg px-3 py-1.5 w-48 lg:w-64 border focus-within:border-[#7C4DFF] transition-colors"
        style={{ background: 'var(--d2b-input-bg)', borderColor: 'var(--d2b-border)' }}
      >
        <Search size={14} className="flex-shrink-0" style={{ color: 'var(--d2b-text-muted)' }} />
        <input
          type="text"
          placeholder="Buscar..."
          className="bg-transparent text-xs outline-none w-full placeholder:opacity-60"
          style={{ color: 'var(--d2b-text-primary)' }}
        />
      </div>

      <button
        onClick={toggleTheme}
        className="flex-shrink-0 p-2 rounded-lg transition-colors"
        style={{ color: 'var(--d2b-text-secondary)' }}
        aria-label={isDark ? 'Ativar tema claro' : 'Ativar tema escuro'}
      >
        {isDark ? <Sun size={18} /> : <Moon size={18} />}
      </button>

      <button
        className="relative flex-shrink-0 p-2 rounded-lg transition-colors"
        style={{ color: 'var(--d2b-text-secondary)' }}
        aria-label="Notificacoes"
      >
        <Bell size={18} />
        <span className="absolute top-1.5 right-1.5 w-2 h-2 rounded-full bg-[#7C4DFF]" />
      </button>

      <div ref={menuRef} className="relative flex-shrink-0 pl-1">
        <button
          onClick={() => setMenuOpen(v => !v)}
          className="w-8 h-8 rounded-full bg-gradient-to-br from-[#7C4DFF] to-[#C084FC] flex items-center justify-center text-xs font-bold text-white select-none hover:opacity-90 transition-opacity"
          aria-label="Menu do usuario"
        >
          {initials}
        </button>

        {menuOpen && (
          <div
            className="absolute right-0 top-10 w-56 rounded-xl shadow-lg overflow-hidden border"
            style={{
              background: 'var(--d2b-bg-surface)',
              borderColor: 'var(--d2b-border-strong)',
              boxShadow: '0 8px 32px var(--d2b-shadow)',
            }}
          >
            <div className="px-4 py-3 border-b" style={{ borderColor: 'var(--d2b-border)' }}>
              <div className="flex items-center gap-2">
                <User size={14} style={{ color: 'var(--d2b-text-secondary)' }} />
                <div className="min-w-0">
                  <p className="text-xs font-semibold truncate" style={{ color: 'var(--d2b-text-primary)' }}>
                    {session?.user?.name ?? 'Usuario'}
                  </p>
                  <p className="text-[11px] truncate" style={{ color: 'var(--d2b-text-secondary)' }}>
                    {session?.user?.email ?? ''}
                  </p>
                </div>
              </div>
            </div>

            <button
              onClick={handleLogout}
              className="w-full flex items-center gap-2 px-4 py-3 text-xs transition-colors"
              style={{ color: 'var(--d2b-text-secondary)' }}
              onMouseEnter={e => { (e.currentTarget as HTMLElement).style.color = 'var(--d2b-text-primary)'; (e.currentTarget as HTMLElement).style.background = 'var(--d2b-hover)' }}
              onMouseLeave={e => { (e.currentTarget as HTMLElement).style.color = 'var(--d2b-text-secondary)'; (e.currentTarget as HTMLElement).style.background = 'transparent' }}
            >
              <LogOut size={14} />
              Sair
            </button>
          </div>
        )}
      </div>
    </header>
  )
}
