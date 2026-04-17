import type { Metadata } from "next";
import { ClerkProvider, SignInButton, SignUpButton, SignedIn, SignedOut, UserButton } from "@clerk/nextjs";
import { ConvexClientProvider } from "./ConvexClientProvider";
import "./globals.css";
import "./cozinha/cozinha.css";

export const metadata: Metadata = {
  title: "Food Truck Alert — Painel Admin",
  description: "Gerencie seu food truck, cardápio e pedidos em tempo real",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="pt-BR">
      <body>
        <ClerkProvider>
          <header style={{ padding: '1rem', display: 'flex', justifyContent: 'flex-end', gap: '1rem' }}>
            <SignedOut>
              <div style={{ display: 'flex', gap: '1rem' }}>
                <SignInButton />
                <SignUpButton />
              </div>
            </SignedOut>
            <SignedIn>
              <UserButton />
            </SignedIn>
          </header>
          <ConvexClientProvider>
            {children}
          </ConvexClientProvider>
        </ClerkProvider>
      </body>
    </html>
  );
}



