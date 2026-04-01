'use client'

/**
 * sidebar-context.tsx — Estado global do shell
 *
 * Provê:
 *  - collapsed / setCollapsed  → sidebar desktop expandida ou recolhida
 *  - mobileOpen / setMobileOpen → drawer mobile aberto ou fechado
 *
 * Envolva o layout com <SidebarProvider> para que Topbar e Sidebar
 * compartilhem o mesmo estado.
 */

import { createContext, useContext, useState } from 'react'

type SidebarCtx = {
  collapsed: boolean
  setCollapsed: (v: boolean) => void
  mobileOpen: boolean
  setMobileOpen: (v: boolean) => void
}

const SidebarContext = createContext<SidebarCtx>({
  collapsed: false,
  setCollapsed: () => {},
  mobileOpen: false,
  setMobileOpen: () => {},
})

export function SidebarProvider({ children }: { children: React.ReactNode }) {
  const [collapsed, setCollapsed] = useState(false)
  const [mobileOpen, setMobileOpen] = useState(false)

  return (
    <SidebarContext.Provider
      value={{ collapsed, setCollapsed, mobileOpen, setMobileOpen }}
    >
      {children}
    </SidebarContext.Provider>
  )
}

export function useSidebar() {
  return useContext(SidebarContext)
}
