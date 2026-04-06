import { auth } from "@/lib/auth"
import { NextResponse, type NextRequest } from "next/server"

// Quando SKIP_AUTH=true no .env.local, o middleware libera tudo sem checar
// sessão — útil para rodar localmente sem precisar de um Keycloak rodando.
const SKIP_AUTH = process.env.SKIP_AUTH === "true"

export default SKIP_AUTH
  ? (_req: NextRequest) => NextResponse.next()
  : auth((req) => {
      if (!req.auth) {
        const signInUrl = new URL("/api/auth/signin", req.url)
        signInUrl.searchParams.set("callbackUrl", "/dashboard")
        return NextResponse.redirect(signInUrl)
      }
      return NextResponse.next()
    })

export const config = {
  matcher: ["/((?!api/auth|auth/signin|_next/static|_next/image|favicon.ico|sites).*)"],
}
