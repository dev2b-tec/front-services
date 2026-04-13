import { notFound } from 'next/navigation'
import BlogPostView from '@/components/sites/blog-post-view'

const API = process.env.API_URL

export default async function BlogPostPage({
  params,
}: {
  params: Promise<{ usuarioId: string; postId: string }>
}) {
  const { usuarioId, postId } = await params

  const res = await fetch(`${API}/api/v1/site-config/public/usuario/${usuarioId}`, {
    cache: 'no-store',
  })
  if (res.status === 204 || !res.ok) notFound()

  const siteConfig = await res.json()
  const post = (siteConfig.posts ?? []).find((p: { id: string }) => p.id === postId)
  if (!post) notFound()

  return <BlogPostView siteConfig={siteConfig} post={post} usuarioId={usuarioId} />
}
