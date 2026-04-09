'use client'

import { useState, useEffect } from 'react'

export type MenuAtivoItem = {
  chave: string
  label: string
  ativo: boolean
}

/**
 * Busca o status de cada tela em /api/v1/menu-ativo.
 * Enquanto carrega, considera todos os menus ativos (sem flicker).
 */
export function useMenuAtivo() {
  const [menus, setMenus] = useState<MenuAtivoItem[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetch('/api/v1/menu-ativo')
      .then(r => (r.ok ? r.json() : []))
      .then((data: MenuAtivoItem[]) => setMenus(data))
      .catch(() => setMenus([]))
      .finally(() => setLoading(false))
  }, [])

  /**
   * Retorna true se o menu com a `chave` informada está ativo.
   * Padrão true enquanto carrega ou se a chave não for encontrada.
   */
  const isAtivo = (chave: string): boolean => {
    if (loading || menus.length === 0) return true
    const found = menus.find(m => m.chave === chave)
    return found ? found.ativo : true
  }

  return { menus, loading, isAtivo }
}
