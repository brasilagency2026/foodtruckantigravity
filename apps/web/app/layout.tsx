import type { Metadata } from "next";
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
        <ConvexClientProvider>
          {children}
        </ConvexClientProvider>
      </body>
    </html>
  );
}

