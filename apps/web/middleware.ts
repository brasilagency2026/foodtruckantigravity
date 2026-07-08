import { NextResponse } from 'next/server'

// Lightweight public-route check to avoid importing Clerk at module eval time.
function isPublicRoute(req: any) {
  try {
    const pathname = req.nextUrl?.pathname ?? (new URL(req.url)).pathname
    if (pathname === '/') return true
    return (
      pathname.startsWith('/sign-in') ||
      pathname.startsWith('/sign-up') ||
      pathname.startsWith('/comercial/sign-in') ||
      pathname.startsWith('/comercial/sign-up') ||
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
      pathname.startsWith('/politica-de-privacidade') ||
      pathname.startsWith('/marketing') ||
      pathname.startsWith('/trabalhe-conosco') ||
      pathname.startsWith('/quem-somos')
    )
  } catch (e) {
    return false
  }
}

export default async function middleware(req: any, ev?: any) {
  // Serve crawler-friendly static OG HTML for /marketing when the request comes from social crawlers.
  try {
    const ua = req.headers?.get ? req.headers.get('user-agent') : req.headers['user-agent'] || ''
    const pathname = req.nextUrl?.pathname ?? (new URL(req.url)).pathname
    const isCrawler = /facebookexternalhit|Facebot|Twitterbot|LinkedInBot|Slackbot|WhatsApp/i.test(ua)

    if (pathname === '/marketing' && isCrawler) {
      const OG_TITLE = "Food Pronto | Marketing para food trucks"
      const OG_DESC = "Aumente a visibilidade do seu food truck com Food Pronto: cardápio digital, pagamentos Mercado Pago e alertas sonoros no celular do cliente."
      const OG_URL = "https://www.foodpronto.com.br/marketing"
      const OG_IMAGE = "https://www.foodpronto.com.br/marketing-og.png"
      const FB_APP_ID = process.env.FACEBOOK_APP_ID || process.env.NEXT_PUBLIC_FACEBOOK_APP_ID || ''
      const fbAppMeta = FB_APP_ID ? `<meta property="fb:app_id" content="${FB_APP_ID}" />\n` : ''
      const html = `<!doctype html>
<html lang="pt-BR">
<head>
<meta charset="utf-8" />
<meta name="viewport" content="width=device-width, initial-scale=1" />
<title>${OG_TITLE}</title>
<meta name="description" content="${OG_DESC}" />
<meta property="og:title" content="${OG_TITLE}" />
<meta property="og:description" content="${OG_DESC}" />
<meta property="og:url" content="${OG_URL}" />
<meta property="og:type" content="website" />
<meta property="og:image" content="${OG_IMAGE}" />
<meta property="og:image:secure_url" content="${OG_IMAGE}" />
<meta property="og:image:width" content="1200" />
<meta property="og:image:height" content="630" />
<meta property="og:image:alt" content="Food Pronto - Marketing para food trucks" />
${fbAppMeta}<meta name="twitter:card" content="summary_large_image" />
<meta name="twitter:title" content="${OG_TITLE}" />
<meta name="twitter:description" content="${OG_DESC}" />
<meta name="twitter:image" content="${OG_IMAGE}" />
</head>
<body>
<!-- Minimal crawler-friendly page; real app will load client JS after -->
<div>
  <h1>${OG_TITLE}</h1>
  <p>${OG_DESC}</p>
</div>
</body>
</html>`
      return new Response(html, { headers: { 'content-type': 'text/html; charset=utf-8' } })
    }
  } catch (e) {
    // If anything goes wrong in crawler shortcut, continue to normal middleware handling.
    console.error('Crawler-check error in middleware — continuing to Clerk handler:', e)
  }

  // Hard-bypass Clerk middleware for webhooks.
  // This prevents failures when Clerk env (e.g. publishableKey) is missing/misconfigured,
  // which can otherwise stop the webhook route from being reached.
  try {
    const pathname = req?.nextUrl?.pathname ?? (new URL(req.url)).pathname
    if (pathname.startsWith('/api/webhooks')) {
      return NextResponse.next()
    }
  } catch (_) {
    // ignore and continue
  }

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
