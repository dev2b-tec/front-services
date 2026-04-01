/**
 * app/dashboard/produtos/page.tsx — Módulo de Produtos
 *
 * ╔══════════════════════════════════════════════════════════════════╗
 * ║  MICROFRONTEND: PRODUTOS                                         ║
 * ║                                                                  ║
 * ║  Este arquivo é o ponto de entrada do módulo Produtos.           ║
 * ║  Ele herda automaticamente do layout pai (Topbar + Sidebar).     ║
 * ║                                                                  ║
 * ║  Para desenvolver este módulo:                                   ║
 * ║    1. Substitua o conteúdo abaixo pelo seu componente real       ║
 * ║    2. Crie sub-componentes em components/produtos/               ║
 * ║    3. Crie rotas filhas em app/dashboard/produtos/[id]/page.tsx  ║
 * ║                                                                  ║
 * ║  O que o layout pai já fornece (grátis):                        ║
 * ║    - Topbar com título dinâmico                                  ║
 * ║    - Sidebar com item "Produtos" marcado como ativo              ║
 * ║    - Scroll independente nesta área                              ║
 * ║    - Background e tokens de cor do design system                ║
 * ╚══════════════════════════════════════════════════════════════════╝
 *
 * BACKEND MÍNIMO PARA ESTE MÓDULO:
 *   - GET  /api/produtos          → lista paginada com filtros
 *   - GET  /api/produtos/[id]     → detalhe + variantes
 *   - POST /api/produtos          → criar
 *   - PUT  /api/produtos/[id]     → editar
 *   - DELETE /api/produtos/[id]   → remover
 *
 * Com Supabase, substitua as chamadas fetch por:
 *   const supabase = createClient()
 *   const { data } = await supabase.from('produtos').select('*')
 */

import { ProdutosView } from '@/components/produtos/produtos-view'

export default function ProdutosPage() {
  return <ProdutosView />
}
