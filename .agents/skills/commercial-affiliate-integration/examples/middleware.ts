import { NextResponse } from 'next/server';

// Définir les routes publiques qui n'exigent pas d'authentification Clerk active
function isPublicRoute(req: any) {
  try {
    const pathname = req.nextUrl?.pathname ?? (new URL(req.url)).pathname;
    return (
      pathname.startsWith('/sign-in') ||
      pathname.startsWith('/sign-up') ||
      
      // Ajouter les formulaires spécifiques du commercial pour les rendre accessibles publiquement
      pathname.startsWith('/comercial/sign-in') ||
      pathname.startsWith('/comercial/sign-up') ||
      
      pathname.startsWith('/onboarding') ||
      pathname.startsWith('/api/webhooks')
    );
  } catch (e) {
    return false;
  }
}

export default async function middleware(req: any) {
  const clerk = await import('@clerk/nextjs/server');
  const handler = clerk.clerkMiddleware((auth: any, r: any) => {
    if (!isPublicRoute(r)) {
      auth().protect(); // Protéger toutes les autres routes (dont le dashboard)
    }
  });
  return handler(req);
}
