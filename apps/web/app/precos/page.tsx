import { Metadata } from "next";
import PricingClient from "./PricingClient";

export const metadata: Metadata = {
  title: "Planos e Preços — Food Pronto",
  description:
    "R$ 200/mês. Primeiro mês grátis. Sem maquininha, sem painel LED, sem complicação. Tudo pelo Mercado Pago.",
};

export default function PrecosPage() {
  return <PricingClient />;
}
