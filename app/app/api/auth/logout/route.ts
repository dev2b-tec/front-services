import { auth, signOut } from "@/lib/auth"
import { redirect } from "next/navigation"

export async function GET() {
  const session = await auth()
  const idToken = session?.idToken

  await signOut({ redirect: false })

  const keycloakIssuer = process.env.KEYCLOAK_ISSUER!
  const logoutUrl = new URL(`${keycloakIssuer}/protocol/openid-connect/logout`)
  if (idToken) {
    logoutUrl.searchParams.set("id_token_hint", idToken)
  }
  logoutUrl.searchParams.set("post_logout_redirect_uri", "https://dev2b.tec.br")

  redirect(logoutUrl.toString())
}
