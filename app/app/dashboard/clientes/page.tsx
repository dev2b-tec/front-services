/**
 * app/dashboard/clientes/page.tsx — Módulo de Clientes
 *
 * ╔══════════════════════════════════════════════════════════════════╗
 * ║  MICROFRONTEND: CLIENTES                                         ║
 * ║                                                                  ║
 * ║  Este arquivo é o ponto de entrada do módulo Clientes.           ║
 * ║  Ele herda automaticamente do layout pai (Topbar + Sidebar).     ║
 * ║                                                                  ║
 * ║  Para desenvolver este módulo:                                   ║
 * ║    1. Substitua o conteúdo abaixo pelo seu componente real       ║
 * ║    2. Crie sub-componentes em components/clientes/               ║
 * ║    3. Crie rotas filhas em app/dashboard/clientes/[id]/page.tsx  ║
 * ║                                                                  ║
 * ║  O que o layout pai já fornece (grátis):                        ║
 * ║    - Topbar com título dinâmico                                  ║
 * ║    - Sidebar com item "Clientes" marcado como ativo              ║
 * ║    - Scroll independente nesta área                              ║
 * ║    - Background e tokens de cor do design system                ║
 * ╚══════════════════════════════════════════════════════════════════╝
 *
 * BACKEND MÍNIMO PARA ESTE MÓDULO:
 *   - GET  /api/clientes          → lista paginada
 *   - GET  /api/clientes/[id]     → detalhe
 *   - POST /api/clientes          → criar
 *   - PUT  /api/clientes/[id]     → editar
 *   - DELETE /api/clientes/[id]   → remover
 *
 * Com Supabase, substitua as chamadas fetch por:
 *   const supabase = createClient()
 *   const { data } = await supabase.from('clientes').select('*')
 */

import { ClientesView } from '@/components/clientes/clientes-view'

export default function ClientesPage() {
  return <ClientesView />
}
