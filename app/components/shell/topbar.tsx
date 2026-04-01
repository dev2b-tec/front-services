'use client'

import { useState, useRef, useEffect } from 'react'
import { Menu, Search, Bell, LogOut, User } from 'lucide-react'
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

export function Topbar() {
  const { setMobileOpen } = useSidebar()
  const title = usePageTitle()
  const { data: session } = useSession()
  const [menuOpen, setMenuOpen] = useState(false)
  const menuRef = useRef<HTMLDivElement>(null)

  const initials = session?.user?.name
    ? session.user.name.split(' ').map(n => n[0]).slice(0, 2).join('').toUpperCase()
    : 'U'

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
    <header className="sticky top-0 z-30 flex items-center gap-3 h-14 px-4 bg-[#120328]/80 backdrop-blur-md border-b border-[rgba(124,77,255,0.18)]">

      {/* Hamburger — só mobile */}
      <button
        onClick={() => setMobileOpen(true)}
        className="md:hidden flex-shrink-0 p-2 rounded-lg text-[#A78BCC] hover:text-[#F5F0FF] hover:bg-[rgba(124,77,255,0.12)] transition-colors"
        aria-label="Abrir menu"
      >
        <Menu size={20} />
      </button>

      {/* Título da página atual */}
      <h1 className="text-sm font-semibold text-[#F5F0FF] truncate mr-auto">
        {title}
      </h1>

      {/* Busca */}
      <div className="hidden sm:flex items-center gap-2 bg-[#0D0520] border border-[rgba(124,77,255,0.18)] rounded-lg px-3 py-1.5 w-48 lg:w-64 focus-within:border-[#7C4DFF] transition-colors">
        <Search size={14} className="text-[#6B4E8A] flex-shrink-0" />
        <input
          type="text"
          placeholder="Buscar..."
          className="bg-transparent text-xs text-[#F5F0FF] placeholder:text-[#6B4E8A] outline-none w-full"
        />
      </div>

      {/* Notificações */}
      <button
        className="relative flex-shrink-0 p-2 rounded-lg text-[#A78BCC] hover:text-[#F5F0FF] hover:bg-[rgba(124,77,255,0.12)] transition-colors"
        aria-label="Notificações"
      >
        <Bell size={18} />
        <span className="absolute top-1.5 right-1.5 w-2 h-2 rounded-full bg-[#7C4DFF]" />
      </button>

      {/* Avatar usuário + dropdown */}
      <div ref={menuRef} className="relative flex-shrink-0 pl-1">
        <button
          onClick={() => setMenuOpen(v => !v)}
          className="w-8 h-8 rounded-full bg-gradient-to-br from-[#7C4DFF] to-[#C084FC] flex items-center justify-center text-xs font-bold text-white select-none hover:opacity-90 transition-opacity"
          aria-label="Menu do usuário"
        >
          {initials}
        </button>

        {menuOpen && (
          <div className="absolute right-0 top-10 w-56 bg-[#120328] border border-[rgba(124,77,255,0.25)] rounded-xl shadow-lg shadow-[rgba(0,0,0,0.4)] overflow-hidden">
            {/* Info do usuário */}
            <div className="px-4 py-3 border-b border-[rgba(124,77,255,0.15)]">
              <div className="flex items-center gap-2">
                <User size={14} className="text-[#A78BCC]" />
                <div className="min-w-0">
                  <p className="text-xs font-semibold text-[#F5F0FF] truncate">
                    {session?.user?.name ?? 'Usuário'}
                  </p>
                  <p className="text-[11px] text-[#A78BCC] truncate">
                    {session?.user?.email ?? ''}
                  </p>
                </div>
              </div>
            </div>

            {/* Logout */}
            <button
              onClick={handleLogout}
              className="w-full flex items-center gap-2 px-4 py-3 text-xs text-[#A78BCC] hover:text-[#F5F0FF] hover:bg-[rgba(124,77,255,0.1)] transition-colors"
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
