import { notFound } from 'next/navigation'
import BlogSiteView from '@/components/sites/blog-site-view'

const API = process.env.API_URL

export default async function BlogSitePage({
  params,
}: {
  params: Promise<{ usuarioId: string }>
}) {
  const { usuarioId } = await params

  const res = await fetch(`${API}/api/v1/site-config/public/usuario/${usuarioId}`, {
    cache: 'no-store',
  })

  if (res.status === 204 || !res.ok) notFound()

  const siteConfig = await res.json()

  return <BlogSiteView siteConfig={siteConfig} usuarioId={usuarioId} />
}
