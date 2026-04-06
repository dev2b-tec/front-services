import { type NextRequest, NextResponse } from 'next/server'

const BACKEND = process.env.API_URL ?? 'http://app-agenda:8011'

const HOP_BY_HOP = new Set(['connection', 'keep-alive', 'transfer-encoding', 'te', 'upgrade', 'trailer', 'proxy-authorization', 'proxy-authenticate'])

async function proxy(
  req: NextRequest,
  { params }: { params: Promise<{ path: string[] }> },
) {
  const { path } = await params
  const targetUrl = `${BACKEND}/api/v1/${path.join('/')}${req.nextUrl.search}`

  // Build clean headers — strip cookies (JWT session) and hop-by-hop headers.
  // The backend is an internal REST API and has no use for browser cookies.
  const headers = new Headers()
  req.headers.forEach((value, key) => {
    const lower = key.toLowerCase()
    if (lower === 'cookie') return
    if (lower === 'host') return
    if (HOP_BY_HOP.has(lower)) return
    headers.set(key, value)
  })

  const hasBody = !['GET', 'HEAD'].includes(req.method)

  const upstream = await fetch(targetUrl, {
    method: req.method,
    headers,
    body: hasBody ? req.body : undefined,
    // @ts-expect-error duplex required for streaming request body
    duplex: 'half',
  })

  const resHeaders = new Headers()
  upstream.headers.forEach((value, key) => {
    if (HOP_BY_HOP.has(key.toLowerCase())) return
    resHeaders.set(key, value)
  })

  return new NextResponse(upstream.body, {
    status: upstream.status,
    headers: resHeaders,
  })
}

export const GET     = proxy
export const POST    = proxy
export const PUT     = proxy
export const PATCH   = proxy
export const DELETE  = proxy
export const OPTIONS = proxy
