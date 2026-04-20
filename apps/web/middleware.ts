import { clerkMiddleware, createRouteMatcher } from '@clerk/nextjs/server'
import { NextResponse } from 'next/server'

const isPublicRoute = createRouteMatcher([
  '/',
  '/sign-in(.*)',
  '/sign-up(.*)',
  '/menu(.*)',
  '/t(.*)',
  '/precos(.*)',
  '/onboarding(.*)',
  '/api/webhooks(.*)',
  '/api/mercadopago(.*)',
  '/api/upload(.*)',
])

// Initialize Clerk middleware once, then wrap it with a try/catch at runtime.
const rawMiddleware = clerkMiddleware((auth, req) => {
  if (!isPublicRoute(req)) {
    auth().protect()
  }
})

export default function middleware(req: any, ev?: any) {
  try {
    return rawMiddleware(req, ev)
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
