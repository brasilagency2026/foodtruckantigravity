"use client";

import { useQuery } from "convex/react";
import { api } from "../../convex/_generated/api";
import { useEffect, useState } from "react";
import { formatPrice } from "shared/types";

export default function ComercialDashboardPage() {
  const dashboard = useQuery(api.admin.getPartnerDashboard);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (dashboard !== undefined) {
      setLoading(false);
    }
  }, [dashboard]);

  if (loading) {
    return <div className="p-10 text-white">Carregando painel comercial...</div>;
  }

  if (!dashboard) {
    return (
      <div className="p-10 text-white max-w-3xl mx-auto">
        <h1 className="text-3xl font-bold mb-4 text-[#FF6B35]">Painel Comercial</h1>
        <p className="text-gray-300 mb-4">Nenhum acesso de parceiro encontrado para o seu login.</p>
        <p className="text-gray-400">Verifique se você está usando o e-mail cadastrado no voucher ou entre em contato com o time do Food Pronto.</p>
      </div>
    );
  }

  return (
    <div className="p-10 text-white max-w-5xl mx-auto">
      <h1 className="text-3xl font-bold mb-4 text-[#FF6B35]">Painel Comercial</h1>
      <div className="mb-8 p-6 bg-[#12131f] rounded-xl border border-white/10">
        <div className="mb-4">
          <p className="text-sm text-gray-400">Parceiro</p>
          <h2 className="text-2xl font-semibold">{dashboard.voucher.partnerName}</h2>
          {dashboard.voucher.partnerEmail && <p className="text-gray-300">{dashboard.voucher.partnerEmail}</p>}
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="p-4 rounded-xl bg-[#0f1220] border border-white/10">
            <p className="text-sm text-gray-400">Voucher</p>
            <p className="text-xl font-bold">{dashboard.voucher.code}</p>
          </div>
          <div className="p-4 rounded-xl bg-[#0f1220] border border-white/10">
            <p className="text-sm text-gray-400">Comissão pendente</p>
            <p className="text-xl font-bold text-emerald-400">R$ {formatPrice(dashboard.pendingAmount)}</p>
          </div>
          <div className="p-4 rounded-xl bg-[#0f1220] border border-white/10">
            <p className="text-sm text-gray-400">Comissão paga</p>
            <p className="text-xl font-bold text-sky-400">R$ {formatPrice(dashboard.paidAmount)}</p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="p-6 bg-[#12131f] rounded-xl border border-white/10">
          <h2 className="text-xl font-semibold mb-4">Detalhes do parceiro</h2>
          <ul className="space-y-3 text-gray-300">
            <li><strong>WhatsApp:</strong> {dashboard.voucher.partnerPhone || "Não informado"}</li>
            <li><strong>PIX:</strong> {dashboard.voucher.partnerPixKey || "Não informado"}</li>
            <li><strong>Desconto:</strong> {dashboard.voucher.discountPercentage}%</li>
            <li><strong>Comissão:</strong> {dashboard.voucher.commissionPercentage}%</li>
            <li><strong>Status:</strong> {dashboard.voucher.isActive ? "Ativo" : "Inativo"}</li>
          </ul>
        </div>

        <div className="p-6 bg-[#12131f] rounded-xl border border-white/10">
          <h2 className="text-xl font-semibold mb-4">Resumo</h2>
          <p className="text-gray-300">Total de comissões geradas a partir deste voucher.</p>
          <div className="mt-4 grid grid-cols-2 gap-4">
            <div className="p-4 rounded-xl bg-[#0f1220] border border-white/10">
              <p className="text-sm text-gray-400">Total de pedidos</p>
              <p className="text-2xl font-bold">{dashboard.commissions.length}</p>
            </div>
            <div className="p-4 rounded-xl bg-[#0f1220] border border-white/10">
              <p className="text-sm text-gray-400">Comissão total</p>
              <p className="text-2xl font-bold">R$ {formatPrice(dashboard.pendingAmount + dashboard.paidAmount)}</p>
            </div>
          </div>
        </div>
      </div>

      <div className="mt-8 p-6 bg-[#12131f] rounded-xl border border-white/10">
        <h2 className="text-xl font-semibold mb-4">Comissões</h2>
        {dashboard.commissions.length === 0 ? (
          <p className="text-gray-400">Nenhuma comissão registrada ainda.</p>
        ) : (
          <div className="space-y-4">
            {dashboard.commissions.map((commission: any) => (
              <div key={commission._id} className="p-4 rounded-xl bg-[#0f1220] border border-white/10">
                <div className="flex items-center justify-between gap-4">
                  <div>
                    <p className="text-sm text-gray-400">Food Truck</p>
                    <p className="font-semibold">{commission.truckName}</p>
                  </div>
                  <p className="text-lg font-bold text-emerald-400">R$ {formatPrice(commission.amount)}</p>
                </div>
                <div className="mt-3 text-sm text-gray-400">
                  <p>Status: {commission.status === "paid" ? "Pago" : commission.status === "pending" ? "Pendente" : "Cancelado"}</p>
                  <p>Tipo: {commission.paymentType === "monthly" ? "Mensal" : "Anual"}</p>
                  <p>Data: {commission.paymentDate ? new Date(commission.paymentDate).toLocaleDateString("pt-BR") : "-"}</p>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
