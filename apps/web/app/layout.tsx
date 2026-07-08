import type { Metadata } from "next";
import Script from "next/script";
import { ClerkProvider, SignedIn, UserButton } from "@clerk/nextjs";
import { ptBR } from "@clerk/localizations";
import { ConvexClientProvider } from "./ConvexClientProvider";
import "./globals.css";
import "./cozinha/cozinha.css";

export const metadata: Metadata = {
  metadataBase: new URL("https://www.foodpronto.com.br"),
  title: "Food Pronto",
  description: "Gerencie seu food truck, cardápio e pedidos em tempo real",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="pt-BR">
      <head>
        {/* Google Analytics */}
        <Script
          src="https://www.googletagmanager.com/gtag/js?id=G-5ML1N6QL6W"
          strategy="afterInteractive"
        />
        <Script id="google-analytics" strategy="afterInteractive">
          {`
            window.dataLayer = window.dataLayer || [];
            function gtag(){dataLayer.push(arguments);}
            gtag('js', new Date());
            gtag('config', 'G-5ML1N6QL6W');
          `}
        </Script>
      </head>
      <body>
        <ClerkProvider localization={ptBR as any}>
          <ConvexClientProvider>
            {process.env.NEXT_PUBLIC_GOOGLE_MAPS_KEY && (
              <Script
                src={`https://maps.googleapis.com/maps/api/js?key=${process.env.NEXT_PUBLIC_GOOGLE_MAPS_KEY}&libraries=places`}
                strategy="afterInteractive"
              />
            )}
            {children}
          </ConvexClientProvider>
        </ClerkProvider>
      </body>
    </html>
  );
}
