import { NextResponse } from 'next/server'

// Lightweight public-route check to avoid importing Clerk at module eval time.
function isPublicRoute(req: any) {
  try {
    const pathname = req.nextUrl?.pathname ?? (new URL(req.url)).pathname
    if (pathname === '/') return true
    return (
      pathname.startsWith('/sign-in') ||
      pathname.startsWith('/sign-up') ||
      pathname.startsWith('/menu') ||
      pathname.startsWith('/t') ||
      pathname.startsWith('/checkout') ||
      pathname.startsWith('/order') ||
      pathname.startsWith('/precos') ||
      pathname.startsWith('/onboarding') ||
      pathname.startsWith('/api/webhooks') ||
      pathname.startsWith('/api/mercadopago') ||
      pathname.startsWith('/api/upload') ||
      pathname.startsWith('/contato') ||
      pathname.startsWith('/termos') ||
      pathname.startsWith('/trabalhe-conosco')
    )
  } catch (e) {
    return false
  }
}

export default async function middleware(req: any, ev?: any) {
  try {
    // Lazy-import Clerk so any import-time issues are caught here and do not prevent requests.
    const clerk = await import('@clerk/nextjs/server')
    const clerkMiddleware = clerk.clerkMiddleware
    const handler = clerkMiddleware((auth: any, r: any) => {
      if (!isPublicRoute(r)) {
        auth().protect()
      }
    })
    return await handler(req, ev)
  } catch (err) {
    console.error('Middleware error — continuing without blocking request:', err)
    return NextResponse.next()
  }
}

export const config = {
  matcher: [
    '/((?!_next|[^?]*\\.(?:html?|css|js(?!on)|jpe?g|webp|png|gif|svg|ttf|woff2?|ico|csv|docx?|xlsx?|zip|webmanifest)).*)',
    '/(api|trpc)(.*)',
  ],
}
