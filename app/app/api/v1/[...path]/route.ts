import { type NextRequest, NextResponse } from 'next/server'
import { auth } from '@/lib/auth'

const AGENDA_BACKEND = process.env.API_URL       ?? 'http://app-agenda:8011'
const WHATS_BACKEND  = process.env.WHATS_API_URL ?? 'http://app-integration-watts:8012'

// Paths handled by app-integration-watts instead of app-agenda
const WHATS_PATHS = new Set(['instancias', 'mensagens'])

const HOP_BY_HOP = new Set(['connection', 'keep-alive', 'transfer-encoding', 'te', 'upgrade', 'trailer', 'proxy-authorization', 'proxy-authenticate'])

async function proxy(
  req: NextRequest,
  { params }: { params: Promise<{ path: string[] }> },
) {
  const { path } = await params

  const isWhats = WHATS_PATHS.has(path[0])
  const backend = isWhats ? WHATS_BACKEND : AGENDA_BACKEND

  const targetUrl = `${backend}/api/v1/${path.join('/')}${req.nextUrl.search}`

  // Build clean headers — strip cookies (JWT session) and hop-by-hop headers.
  // Inject Authorization with the Keycloak access token from the NextAuth session (agenda only).
  const session = isWhats ? null : await auth()

  const headers = new Headers()
  req.headers.forEach((value, key) => {
    const lower = key.toLowerCase()
    if (lower === 'cookie') return
    if (lower === 'host') return
    if (lower === 'origin') return
    if (lower === 'authorization') return   // will be set from session below
    if (HOP_BY_HOP.has(lower)) return
    headers.set(key, value)
  })

  if (session?.accessToken) {
    headers.set('authorization', `Bearer ${session.accessToken}`)
  }

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
