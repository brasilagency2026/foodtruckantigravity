import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Food Pronto | Marketing para food trucks",
  description:
    "Aumente a visibilidade do seu food truck com Food Pronto: cardápio digital, pagamentos Mercado Pago e alertas sonoros no celular do cliente.",
  openGraph: {
    title: "Food Pronto | Marketing para food trucks",
    description:
      "Aumente a visibilidade do seu food truck com Food Pronto: cardápio digital, pagamentos Mercado Pago e alertas sonoros no celular do cliente.",
    url: "https://foodpronto.com.br/marketing",
    siteName: "Food Pronto",
    type: "website",
    images: [
      {
        url: "/marketing-og.png",
        width: 1200,
        height: 630,
        alt: "Food Pronto - Marketing para food trucks",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Food Pronto | Marketing para food trucks",
    description:
      "Aumente a visibilidade do seu food truck com Food Pronto: cardápio digital, pagamentos Mercado Pago e alertas sonoros no celular do cliente.",
    images: ["/marketing-og.png"],
  },
};
